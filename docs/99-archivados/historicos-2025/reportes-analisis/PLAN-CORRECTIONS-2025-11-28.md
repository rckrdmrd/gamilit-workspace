# PLAN DE CORRECCIONES - STUDENT PORTAL
## Fase 2: Planeación

**Fecha:** 2025-11-28
**Basado en:** ANALYSIS-2025-11-28.md
**Estado:** PLANEACIÓN COMPLETADA

---

## 📋 RESUMEN DEL PLAN

### Distribución de Tareas

| Prioridad | Cantidad | Agentes | Estimación |
|-----------|----------|---------|------------|
| P0 (Críticos) | 7 | Database(1), Backend(6) | ~8h |
| P1 (Mayores) | 6 | Database(1), Backend(3), Frontend(2) | ~6h |
| P2 (Medios) | 2 | Frontend(2) | ~2h |
| **TOTAL** | **15** | - | **~16h** |

### Orden de Ejecución

```
GRUPO 1 (Paralelo) ─────────────────────────────────────
├─ [DB] P0-003: Consistencia IDs
├─ [BE] P0-005: Password Recovery
└─ [BE] P0-006: Change Password

        ↓ Esperar completación

GRUPO 2 (Paralelo) ─────────────────────────────────────
├─ [BE] P0-001: Auto-save ejercicios (depende P0-003)
├─ [BE] P0-002: Validación respuestas
├─ [BE] P0-004: Permisos profesor
└─ [BE] P0-007: Session Management

        ↓ Esperar completación

GRUPO 3 (Paralelo) ─────────────────────────────────────
├─ [BE] P1-001: Actualización rangos
├─ [BE] P1-002: Deducción comodines
├─ [BE] P1-003: Calificación manual
└─ [DB] P1-004: Trigger submissions

        ↓ Esperar completación

GRUPO 4 (Paralelo) ─────────────────────────────────────
├─ [FE] P1-005: WebSocket Leaderboard
├─ [FE] P1-006: Eliminar mocks
├─ [FE] P2-001: Campos TypeScript
└─ [FE] P2-002: Sincronización filtros
```

---

## 🔴 GRUPO 1: TAREAS CRÍTICAS (Paralelo)

### Tarea 1.1: P0-003 - Consistencia de IDs en Base de Datos

**Agente:** Database-Agent
**Prompt:** PROMPT-DATABASE-AGENT.md
**Prioridad:** P0 - CRÍTICO
**Estimación:** 2h
**Dependencias:** Ninguna

**Objetivo:**
Estandarizar todas las referencias de usuario a `auth_management.profiles.id`

**Archivos a Modificar:**

| Archivo | Cambio Requerido |
|---------|-----------------|
| `gamification_system/tables/01-user_stats.sql` | Cambiar FK de auth.users.id a profiles.id |
| `gamification_system/tables/02-user_ranks.sql` | Cambiar FK de auth.users.id to profiles.id |
| `progress_tracking/tables/engagement_metrics.sql` | Cambiar FK |
| `progress_tracking/tables/mastery_tracking.sql` | Cambiar FK |
| `gamification_system/triggers/*` | Actualizar referencias |

**Especificación:**
```sql
-- ANTES (incorrecto)
user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE

-- DESPUÉS (correcto)
user_id UUID REFERENCES auth_management.profiles(id) ON DELETE CASCADE
```

**Criterios de Aceptación:**
- [ ] Todas las tablas usan profiles.id como FK de usuario
- [ ] Triggers actualizados para usar profiles.id
- [ ] Carga limpia exitosa (./drop-and-recreate-database.sh)
- [ ] DATABASE_INVENTORY.yml actualizado

---

### Tarea 1.2: P0-005 - Implementar Password Recovery

**Agente:** Backend-Agent
**Prompt:** PROMPT-BACKEND-AGENT.md
**Prioridad:** P0 - CRÍTICO
**Estimación:** 2h
**Dependencias:** Ninguna

**Objetivo:**
Implementar flujo completo de recuperación de contraseña

**Archivos a Modificar:**

| Archivo | Cambio Requerido |
|---------|-----------------|
| `password.controller.ts` | Implementar endpoints reales |
| `password-recovery.service.ts` | Implementar lógica de tokens |
| `mail.service.ts` | Template de email de reset |

**Especificación:**

```typescript
// POST /auth/forgot-password
async requestPasswordReset(email: string) {
  // 1. Buscar usuario por email
  // 2. Generar token único (crypto.randomBytes)
  // 3. Guardar token con expiración (24h) en password_reset_tokens
  // 4. Enviar email con link: /reset-password?token=xxx
  // 5. Retornar { message: 'Email enviado' }
}

// POST /auth/reset-password
async resetPassword(token: string, newPassword: string) {
  // 1. Validar token existe y no expiró
  // 2. Obtener usuario asociado
  // 3. Hash nueva contraseña con bcrypt (cost 10)
  // 4. Actualizar encrypted_password
  // 5. Invalidar token usado
  // 6. Retornar { message: 'Contraseña actualizada' }
}
```

**Criterios de Aceptación:**
- [ ] Token de reset se genera y guarda correctamente
- [ ] Email se envía (verificar con MailService mock)
- [ ] Token expira después de 24 horas
- [ ] Contraseña se actualiza con bcrypt
- [ ] Token usado se invalida
- [ ] Errores claros (email no existe, token expirado)

---

### Tarea 1.3: P0-006 - Implementar Change Password

**Agente:** Backend-Agent
**Prompt:** PROMPT-BACKEND-AGENT.md
**Prioridad:** P0 - CRÍTICO
**Estimación:** 1.5h
**Dependencias:** Ninguna

**Objetivo:**
Implementar cambio de contraseña autenticado

**Archivos a Modificar:**

| Archivo | Cambio Requerido |
|---------|-----------------|
| `password.controller.ts` | Implementar endpoint real |
| `auth.service.ts` | Agregar método changePassword |

**Especificación:**

```typescript
// PUT /auth/change-password (requiere JWT)
async changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
) {
  // 1. Obtener usuario por ID
  // 2. Verificar currentPassword con bcrypt.compare
  // 3. Validar newPassword (min 8 chars, etc.)
  // 4. Hash newPassword con bcrypt (cost 10)
  // 5. Actualizar encrypted_password
  // 6. Invalidar todas las sesiones (excepto actual)
  // 7. Retornar { message: 'Contraseña actualizada' }
}
```

**Criterios de Aceptación:**
- [ ] Valida contraseña actual correctamente
- [ ] Nueva contraseña cumple requisitos mínimos
- [ ] Hash bcrypt con cost 10
- [ ] Sesiones anteriores invalidadas
- [ ] Errores claros (contraseña incorrecta, muy corta)

---

## 🔴 GRUPO 2: TAREAS CRÍTICAS (Secuencial después de Grupo 1)

### Tarea 2.1: P0-001 - Auto-Save de Ejercicios

**Agente:** Backend-Agent
**Prompt:** PROMPT-BACKEND-AGENT.md
**Prioridad:** P0 - CRÍTICO
**Estimación:** 1.5h
**Dependencias:** P0-003 (IDs consistentes)

**Objetivo:**
Corregir auto-save para usar userId real del JWT

**Archivos a Modificar:**

| Archivo | Línea | Cambio |
|---------|-------|--------|
| `exercise-submission.controller.ts` | 683 | Obtener userId de JWT |
| `exercise-submission.controller.ts` | 750 | Obtener userId de JWT |
| `exercise-submission.service.ts` | - | Convertir auth.users.id a profiles.id |

**Especificación:**

```typescript
// ANTES (incorrecto)
@Post('auto-save')
async autoSave(@Body() dto: AutoSaveDto) {
  return this.service.autoSave({
    ...dto,
    userId: 'temp-user-id'  // ❌ HARDCODEADO
  });
}

// DESPUÉS (correcto)
@Post('auto-save')
@UseGuards(JwtAuthGuard)
async autoSave(
  @Request() req,
  @Body() dto: AutoSaveDto
) {
  const authUserId = req.user.id;
  const profileId = await this.getProfileId(authUserId);
  return this.service.autoSave({
    ...dto,
    userId: profileId  // ✅ ID REAL
  });
}

// Helper para convertir IDs
private async getProfileId(authUserId: string): Promise<string> {
  const profile = await this.profilesRepository.findOne({
    where: { user_id: authUserId }
  });
  return profile.id;
}
```

**Criterios de Aceptación:**
- [ ] userId se obtiene del JWT
- [ ] Conversión auth.users.id → profiles.id funciona
- [ ] Auto-save persiste en BD correctamente
- [ ] Frontend recibe confirmación de guardado
- [ ] Progreso se recupera al recargar página

---

### Tarea 2.2: P0-002 - Validación de Respuestas de Ejercicios

**Agente:** Backend-Agent
**Prompt:** PROMPT-BACKEND-AGENT.md
**Prioridad:** P0 - CRÍTICO
**Estimación:** 2h
**Dependencias:** Ninguna

**Objetivo:**
Estandarizar estructura de respuestas y eliminar workaround FE-061

**Archivos a Modificar:**

| Archivo | Cambio |
|---------|--------|
| `exercises.controller.ts` | Eliminar workaround, validar estructura |
| `create-exercise-submission.dto.ts` | Definir estructura estándar |
| Documentación | Documentar estructura por tipo de ejercicio |

**Especificación:**

```typescript
// Estructura estándar de respuesta
interface ExerciseSubmissionDto {
  exerciseId: string;
  answers: {
    [questionId: string]: Answer;
  };
  metadata?: {
    timeSpent: number;
    hintsUsed: string[];
    comodinesUsed: string[];
  };
}

// Validación por tipo de ejercicio
const validateAnswersByType = (type: string, answers: any) => {
  switch(type) {
    case 'crucigrama':
      return validateCrucigramaAnswers(answers);
    case 'sopa_letras':
      return validateSopaLetrasAnswers(answers);
    // ... otros tipos
  }
};
```

**Criterios de Aceptación:**
- [ ] Estructura de respuesta documentada por tipo
- [ ] Validación estricta con mensajes de error claros
- [ ] Workaround FE-061 eliminado
- [ ] Frontend actualizado si necesario
- [ ] Tests de validación por tipo

---

### Tarea 2.3: P0-004 - Validar Permisos de Profesor

**Agente:** Backend-Agent
**Prompt:** PROMPT-BACKEND-AGENT.md
**Prioridad:** P0 - CRÍTICO
**Estimación:** 1h
**Dependencias:** Ninguna

**Objetivo:**
Agregar validación de roles a endpoints de profesor

**Archivos a Modificar:**

| Archivo | Endpoints Afectados |
|---------|---------------------|
| `exercise-submission.controller.ts` | gradeSubmission, provideFeedback, findPendingReview |

**Especificación:**

```typescript
// ANTES (sin protección)
@Patch(':id/grade')
async gradeSubmission() { ... }

// DESPUÉS (con protección)
@Patch(':id/grade')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin_teacher', 'super_admin')
async gradeSubmission() { ... }
```

**Criterios de Aceptación:**
- [ ] Todos los endpoints de profesor protegidos
- [ ] RolesGuard implementado correctamente
- [ ] Error 403 para usuarios no autorizados
- [ ] Profesor solo ve estudiantes de su classroom

---

### Tarea 2.4: P0-007 - Implementar Session Management

**Agente:** Backend-Agent
**Prompt:** PROMPT-BACKEND-AGENT.md
**Prioridad:** P0 - CRÍTICO
**Estimación:** 2h
**Dependencias:** Ninguna

**Objetivo:**
Implementar gestión completa de sesiones

**Archivos a Modificar:**

| Archivo | Cambio |
|---------|--------|
| `session-management.service.ts` | Implementar métodos |
| `user-session.entity.ts` | Verificar campos |
| `auth.controller.ts` | Endpoints de sesiones |

**Especificación:**

```typescript
// GET /auth/sessions
async getSessions(userId: string): Promise<Session[]> {
  return this.sessionsRepository.find({
    where: { user_id: userId, is_active: true },
    order: { last_activity: 'DESC' }
  });
}

// DELETE /auth/sessions/:id
async revokeSession(sessionId: string, userId: string) {
  const session = await this.sessionsRepository.findOne({
    where: { id: sessionId, user_id: userId }
  });
  if (!session) throw new NotFoundException();

  session.is_active = false;
  session.revoked_at = new Date();
  await this.sessionsRepository.save(session);
}

// DELETE /auth/sessions (revocar todas excepto actual)
async revokeAllSessions(userId: string, currentSessionId: string) {
  await this.sessionsRepository.update(
    { user_id: userId, id: Not(currentSessionId) },
    { is_active: false, revoked_at: new Date() }
  );
}
```

**Criterios de Aceptación:**
- [ ] GET /sessions retorna sesiones activas
- [ ] DELETE /sessions/:id revoca sesión específica
- [ ] DELETE /sessions revoca todas excepto actual
- [ ] Información de dispositivo mostrada
- [ ] Sesiones expiran automáticamente

---

## 🟠 GRUPO 3: TAREAS MAYORES (Paralelo)

### Tarea 3.1: P1-001 - Actualización de Rangos

**Agente:** Backend-Agent
**Prompt:** PROMPT-BACKEND-AGENT.md
**Prioridad:** P1 - Mayor
**Estimación:** 1h

**Objetivo:**
Asegurar que current_rank se actualiza cuando XP cruza umbral

**Archivos a Modificar:**
- `user-stats.service.ts` - Agregar llamada a actualizar rango
- `ranks.service.ts` - Implementar updateRankIfNeeded()

---

### Tarea 3.2: P1-002 - Deducción de Comodines

**Agente:** Backend-Agent
**Prompt:** PROMPT-BACKEND-AGENT.md
**Prioridad:** P1 - Mayor
**Estimación:** 1h

**Objetivo:**
Deducir comodines del inventario cuando se usan

**Archivos a Modificar:**
- `exercise-attempt.service.ts` - Deducir al usar
- `comodines-inventory.service.ts` - Método deductComodin()

---

### Tarea 3.3: P1-003 - Calificación Manual

**Agente:** Backend-Agent
**Prompt:** PROMPT-BACKEND-AGENT.md
**Prioridad:** P1 - Mayor
**Estimación:** 1.5h

**Objetivo:**
Permitir que profesores asignen calificaciones personalizadas

**Archivos a Modificar:**
- `exercise-submission.controller.ts` - Pasar DTO completo
- `exercise-submission.service.ts` - Usar final_score del DTO

---

### Tarea 3.4: P1-004 - Trigger para exercise_submissions

**Agente:** Database-Agent
**Prompt:** PROMPT-DATABASE-AGENT.md
**Prioridad:** P1 - Mayor
**Estimación:** 1.5h

**Objetivo:**
Crear trigger que actualice module_progress cuando se califica submission

**Archivos a Crear:**
- `progress_tracking/triggers/trg_update_progress_on_submission_grade.sql`

---

## 🟢 GRUPO 4: TAREAS FRONTEND (Paralelo)

### Tarea 4.1: P1-005 - WebSocket para Leaderboard

**Agente:** Frontend-Agent
**Prompt:** PROMPT-FRONTEND-AGENT.md
**Prioridad:** P1 - Mayor
**Estimación:** 2h

**Objetivo:**
Implementar actualizaciones en tiempo real del leaderboard

---

### Tarea 4.2: P1-006 - Eliminar Mocks de Gamificación

**Agente:** Frontend-Agent
**Prompt:** PROMPT-FRONTEND-AGENT.md
**Prioridad:** P1 - Mayor
**Estimación:** 1h

**Objetivo:**
Reemplazar useUserGamification mock con datos reales del backend

---

### Tarea 4.3: P2-001 - Corregir Campos TypeScript

**Agente:** Frontend-Agent
**Prompt:** PROMPT-FRONTEND-AGENT.md
**Prioridad:** P2 - Medio
**Estimación:** 1h

**Objetivo:**
Eliminar castings a `any` y definir tipos correctos para classroomId

---

### Tarea 4.4: P2-002 - Sincronización de Filtros

**Agente:** Frontend-Agent
**Prompt:** PROMPT-FRONTEND-AGENT.md
**Prioridad:** P2 - Medio
**Estimación:** 1h

**Objetivo:**
Migrar filtros de localStorage a preferencias de usuario en backend

---

## 📊 MATRIZ DE AGENTES POR GRUPO

| Grupo | Tareas | Agentes Requeridos | Paralelos |
|-------|--------|-------------------|-----------|
| 1 | 3 | Database(1), Backend(2) | 3 |
| 2 | 4 | Backend(4) | 4 |
| 3 | 4 | Database(1), Backend(3) | 4 |
| 4 | 4 | Frontend(4) | 4 |

**Máximo agentes paralelos:** 4 (dentro del límite de 5)

---

## ✅ CRITERIOS DE VALIDACIÓN GLOBAL

### Después de Grupo 1
- [ ] Carga limpia de BD exitosa
- [ ] npm run build sin errores
- [ ] Login/logout funcionan

### Después de Grupo 2
- [ ] Auto-save guarda en BD (verificar con SELECT)
- [ ] Password recovery envía email
- [ ] Endpoints protegidos retornan 403 a estudiantes

### Después de Grupo 3
- [ ] Rangos se actualizan con XP
- [ ] Comodines se deducen
- [ ] Calificación manual funciona
- [ ] module_progress actualiza con submissions

### Después de Grupo 4
- [ ] Leaderboard actualiza en tiempo real
- [ ] Datos de gamificación son reales
- [ ] No hay castings a `any`
- [ ] npm run type-check sin errores

---

## 📚 DOCUMENTACIÓN A ACTUALIZAR

Después de cada grupo completado:

1. **docs/student-portal/gaps/** - Crear documentos de GAPs
2. **docs/student-portal/inventory/** - Actualizar implementaciones
3. **docs/student-portal/dependencies/** - Actualizar matriz
4. **orchestration/inventarios/** - Actualizar inventarios
5. **orchestration/trazas/** - Actualizar trazas

---

**Plan generado:** 2025-11-28
**Próxima fase:** VALIDACIÓN DE PLANEACIÓN
