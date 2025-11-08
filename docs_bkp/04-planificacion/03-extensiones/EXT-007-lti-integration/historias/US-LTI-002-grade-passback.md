# US-LTI-002: Grade Passback (AGS)

**Épica:** EXT-007: LTI Integration
**Prioridad:** P1
**Story Points:** 10
**Esfuerzo:** 10 horas
**Costo:** $1,500 USD
**Sprint:** 18

---

## 📋 User Story

```
Como profesor que asigna ejercicios GAMILITdesde Canvas,
Quiero que las calificaciones de mis estudiantes se sincronicen automáticamente
Para no tener que exportar/importar calificaciones manualmente
```

---

## 🎯 Contexto de Negocio

### Problema Actual
- Profesores asignan actividades en LMS apuntando a GLIT
- Estudiantes completan ejercicios en GLIT
- Profesor debe exportar scores de GAMILIT→ importar a LMS manualmente
- Proceso toma 30+ minutos por clase

### Solución
- **Assignment & Grades Services (AGS):** Estándar LTI 1.3 para sincronización de calificaciones
- GAMILITenvía scores automáticamente al LMS cuando estudiante completa ejercicio
- Sincronización bidireccional (LMS puede consultar scores)

### Valor
- **Time savings:** 3h/semana por profesor (no sincronización manual)
- **Accuracy:** 100% vs 95% (eliminación de errores de transcripción)
- **Real-time:** Calificaciones aparecen en <10 segundos
- **NPS profesores:** +15 puntos

---

## ✅ Criterios de Aceptación

### Funcionales

1. **Resource Link Tracking:**
   - [ ] Cuando estudiante accede a ejercicio vía LTI, GAMILITalmacena:
     - `line_item_url` (endpoint para enviar scores)
     - `resource_id` (ID del assignment en LMS)
     - `user_id` + `lms_user_id` (mapeo)
   - [ ] Información guardada en tabla `lti_resources`

2. **Score Submission (AGS):**
   - [ ] Cuando estudiante completa ejercicio:
     - GAMILITcalcula score (0-100)
     - Obtiene OAuth2 token del LMS (client credentials flow)
     - POST a `line_item_url/scores` con payload:
       ```json
       {
         "userId": "lms_user_id",
         "scoreGiven": 85,
         "scoreMaximum": 100,
         "activityProgress": "Completed",
         "gradingProgress": "FullyGraded",
         "timestamp": "2025-11-07T10:30:00Z"
       }
       ```
   - [ ] Score aparece en gradebook del LMS

3. **Multiple Attempts Handling:**
   - [ ] Si estudiante reintenta ejercicio:
     - GAMILITenvía nuevo score solo si es mayor que anterior
     - `activityProgress` se mantiene "Completed"
   - [ ] Política configurable: "highest", "latest", "average"

4. **Error Handling:**
   - [ ] Si POST falla (network, 4xx, 5xx):
     - Guardar en `lti_grade_passback_log` con status "failed"
     - Retry automático: 3 intentos con exponential backoff (1s, 5s, 15s)
     - Si fallan todos → notificar admin vía email
   - [ ] Success: Guardar en log con status "success"

5. **OAuth2 Token Management:**
   - [ ] Obtener access token del LMS usando client credentials
   - [ ] Cachear token en Redis (expira en 3600s - 10% margin = 3540s)
   - [ ] Si token expirado/inválido → renovar automáticamente

### No Funcionales

6. **Performance:**
   - [ ] Grade passback <10 segundos desde completion
   - [ ] Soporta 50 submissions concurrentes

7. **Reliability:**
   - [ ] Success rate >98%
   - [ ] Retry mechanism robusto
   - [ ] Idempotencia (mismo score enviado múltiples veces = 1 resultado)

8. **Monitoring:**
   - [ ] Metrics: submission rate, success rate, average latency
   - [ ] Alertas si success rate <95%

---

## 🔧 Tareas Técnicas

### Backend (9h)

1. **OAuth2 Client Credentials (2h)**
   - [ ] Service para obtener access token del LMS
   - [ ] POST a `auth_token_url` con:
     ```
     grant_type=client_credentials
     client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer
     client_assertion=<JWT firmado con private key>
     scope=https://purl.imsglobal.org/spec/lti-ags/scope/score
     ```
   - [ ] Parse response y cachear token

2. **AGS Score Submission (3h)**
   - [ ] Service `submitGradeToLMS(attemptId: string)`
   - [ ] Construir payload AGS conforme a spec
   - [ ] HTTP client con retry logic (axios-retry)
   - [ ] Validación de response (200 OK vs 4xx/5xx)

3. **Line Item Discovery (1h)**
   - [ ] Al recibir launch LTI, extraer claims:
     - `https://purl.imsglobal.org/spec/lti-ags/claim/endpoint`
     - `lineitem` (URL del assignment)
   - [ ] Guardar en `lti_resources`

4. **Integration con Exercise Completion (1h)**
   - [ ] Hook en `ExerciseService.completeAttempt()`
   - [ ] Si attempt tiene `lti_resource_id`:
     - Trigger grade passback async (queue)
   - [ ] No bloquear completion si LMS falla

5. **Retry Queue (1h)**
   - [ ] Bull queue: `lti-grade-passback`
   - [ ] Worker procesa jobs con retry exponential backoff
   - [ ] Dead letter queue para jobs fallidos permanentemente

6. **Testing (1h)**
   - [ ] Unit tests de OAuth2 flow
   - [ ] Integration test de AGS submission (mock LMS)
   - [ ] Test de retry logic

### Admin UI (1h)

7. **Grade Passback Log Viewer (1h)**
   - [ ] Tabla en Admin Portal: recent grade submissions
   - [ ] Columnas: student, exercise, score, status, timestamp, error
   - [ ] Filtro por status (success/failed)
   - [ ] Botón "Retry Failed" para manualmente reintentar

---

## 🧪 Escenarios de Testing

### Happy Path
```
Given: Estudiante completa ejercicio asignado vía Canvas LTI
When: Score calculado = 92/100
Then:
  - OAuth2 token obtenido del LMS
  - Score enviado a Canvas AGS endpoint
  - Response 200 OK
  - Canvas gradebook muestra 92%
  - Log entry creado con status "success"
```

### Edge Cases

1. **LMS temporalmente down:**
   ```
   When: Grade passback request falla con 503
   Then:
     - Retry después de 1s → falla
     - Retry después de 5s → falla
     - Retry después de 15s → success
     - Score finalmente enviado
   ```

2. **Student intenta 3 veces:**
   ```
   Given: Attempt 1 = 70%, Attempt 2 = 85%, Attempt 3 = 75%
   When: Policy = "highest"
   Then:
     - Attempt 1: envía 70
     - Attempt 2: envía 85 (mayor)
     - Attempt 3: NO envía (75 < 85)
     - LMS muestra 85%
   ```

3. **OAuth token expirado:**
   ```
   Given: Token cacheado expiró
   When: Intentar enviar score
   Then:
     - Detecta 401 Unauthorized
     - Renueva token automáticamente
     - Reintenta submission → success
   ```

---

## 📊 Métricas de Éxito

### Durante Desarrollo
- **Tests passing:** 100%
- **Code coverage:** >80%

### Post-Lanzamiento (1 mes)
- **Grade passback success rate:** >98%
- **Average latency:** <5 segundos
- **Retry rate:** <5%
- **Professor satisfaction:** NPS >70

---

## 🔗 Dependencias

### Bloqueado por
- **US-LTI-001:** OIDC Login (usuarios autenticados vía LTI)
- Exercise completion backend funcionando

### Bloquea
- **EXT-001:** Portal Maestros Completo (dashboard de calificaciones)

---

## 📚 Referencias Técnicas

### Specification
- [LTI AGS Specification](https://www.imsglobal.org/spec/lti-ags/v2p0/)
- [Score Publishing](https://www.imsglobal.org/spec/lti-ags/v2p0/#score-publish-service)

### Código de Referencia
```typescript
// Service
async submitGradeToLMS(attemptId: string) {
  const attempt = await this.exerciseService.getAttempt(attemptId);
  const ltiContext = await this.ltiService.getLTIContext(attempt.user_id);

  if (!ltiContext?.line_item_url) return; // Not an LTI launch

  // Get OAuth2 token
  const accessToken = await this.getAccessToken(ltiContext.platform_id);

  // Construct AGS payload
  const payload = {
    userId: ltiContext.lms_user_id,
    scoreGiven: attempt.score,
    scoreMaximum: 100,
    activityProgress: attempt.is_completed ? 'Completed' : 'InProgress',
    gradingProgress: 'FullyGraded',
    timestamp: new Date().toISOString()
  };

  // Submit to LMS
  try {
    await axios.post(`${ltiContext.line_item_url}/scores`, payload, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    await this.logGradePassback(attemptId, 'success');
  } catch (error) {
    await this.logGradePassback(attemptId, 'failed', error.message);
    throw error; // Trigger retry
  }
}
```

---

**Creado:** 2025-11-07
**Asignado a:** Backend Team
**Revisor:** Tech Lead
