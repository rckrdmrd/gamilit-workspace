# DELEGACION: Backend-Agent - Sprint P2

**Proyecto:** GAMILIT
**Fecha:** 2025-12-05
**De:** Requirements-Analyst
**Para:** Backend-Agent
**Sprint:** P2-A, P2-B, P2-C

---

## CONTEXTO

El Sprint P1 ha sido completado exitosamente. El proyecto ahora esta al 75% de completitud. Se requiere que Backend-Agent complete las siguientes tareas para cerrar los gaps criticos y preparar el sistema para produccion.

## PREREQUISITOS COMPLETADOS

- [x] Sprint P1 - Sistema de amigos implementado
- [x] Sprint P1 - ML Coins multiplicadores implementados
- [x] Sprint P1 - Mission Templates implementados
- [x] Sprint P1 - CRON notificaciones implementado
- [x] NOTIF-001 - Email service integrado

---

## TAREAS ASIGNADAS

### Sprint P2-A (Prioridad P0)

#### BE-P2-003: Verificar CRON Misiones en Produccion
**Story:** US-P2-004
**SP:** 2
**Archivo:** `apps/backend/src/modules/gamification/services/missions-cron.service.ts`

**Acciones:**
1. Verificar que @Cron decoradores estan descomentados
2. Agregar logging detallado para cada ejecucion
3. Configurar alertas si CRON falla
4. Crear endpoint GET /admin/cron/status

**Criterios de Aceptacion:**
- CRON diario ejecuta a medianoche UTC
- CRON semanal ejecuta domingos a medianoche
- Logs registran: usuarios procesados, misiones creadas, duracion

---

#### BE-P2-007: Implementar Calculo Real de Rachas
**Story:** US-P2-005
**SP:** 5
**Archivo:** `apps/backend/src/modules/gamification/services/missions.service.ts`
**Linea actual:** 693

**Acciones:**
1. Reemplazar TODO con implementacion real
2. Crear query para obtener fechas con actividad
3. Calcular currentStreak (dias consecutivos hasta hoy)
4. Calcular longestStreak (record historico)
5. Actualizar campo longest_streak en user_stats

**Algoritmo:**
```typescript
async getStreakStats(userId: string): Promise<StreakStats> {
  const activityDates = await this.getActivityDates(userId);
  const today = startOfDay(new Date());

  let currentStreak = 0;
  let checkDate = today;

  while (activityDates.has(formatDate(checkDate))) {
    currentStreak++;
    checkDate = subDays(checkDate, 1);
  }

  const longestStreak = this.calculateLongestStreak(activityDates);

  return { currentStreak, longestStreak, totalDaysActive: activityDates.size };
}
```

---

### Sprint P2-B (Prioridad P1)

#### BE-P2-008: Notificaciones Push/Email para Docentes
**Story:** US-TEACHER-P2-005
**SP:** 3
**Modulo:** `notifications`

**Acciones:**
1. Crear evento 'student.exercise.submitted' en ManualReviewService
2. Enviar notificacion push al docente cuando estudiante envia M4-M5
3. Opcionalmente enviar email si docente lo tiene habilitado
4. Incluir: nombre estudiante, tipo ejercicio, enlace directo a revision

---

#### BE-ADMIN-004-007: Persistir Reports en BD
**Story:** US-ADMIN-P2-004
**SP:** 5

**Acciones:**
1. Crear tabla `admin_dashboard.admin_reports` (DDL adjunto)
2. Modificar ReportsService para guardar en BD
3. Implementar storage de archivos (local o S3)
4. Crear CRON de limpieza cada 30 dias

**DDL:**
```sql
CREATE TABLE admin_dashboard.admin_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  parameters JSONB,
  file_path VARCHAR(500),
  file_size INTEGER,
  status VARCHAR(20) DEFAULT 'pending',
  created_by UUID REFERENCES auth_management.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '30 days'
);

CREATE INDEX idx_admin_reports_created_by ON admin_dashboard.admin_reports(created_by);
CREATE INDEX idx_admin_reports_expires_at ON admin_dashboard.admin_reports(expires_at);
```

---

#### BE-ADMIN-001-003: Feature Flags Controller (si no existe)
**Story:** US-ADMIN-P2-003
**SP:** 5

**Acciones:**
1. Verificar si FeatureFlagsController existe
2. Si no existe, crear:
   - FeatureFlagsController con CRUD
   - FeatureFlagsService con logica de rollout
   - Endpoints: GET/POST/PUT/DELETE /admin/feature-flags

---

### Sprint P2-C (Prioridad P2)

#### BE-P2-009: Validacion 150 Palabras Diario M5
**Story:** US-M5-P2-001
**SP:** 3
**Archivo:** `apps/backend/src/modules/educational/services/exercises.service.ts`

**Acciones:**
1. Agregar validacion en submit de diario_multimedia
2. Contar palabras del contenido
3. Rechazar si < 150 palabras con mensaje claro

---

#### BE-P2-010: Misiones Grupales Gremios
**Story:** US-GAM-P2-002
**SP:** 8

**Acciones:**
1. Crear tabla guild_missions (similar a classroom_missions)
2. Agregar logica de progreso colectivo
3. Distribuir recompensas a todos los miembros
4. Crear endpoints para gremio leader

---

## RESUMEN DE TAREAS

| ID | Tarea | SP | Sprint | Dependencias |
|----|-------|-----|--------|--------------|
| BE-P2-003 | CRON produccion | 2 | P2-A | Ninguna |
| BE-P2-007 | Calculo rachas | 5 | P2-A | Ninguna |
| BE-P2-008 | Notif docentes | 3 | P2-B | Email service OK |
| BE-ADMIN-004-007 | Persistir reports | 5 | P2-B | Ninguna |
| BE-ADMIN-001-003 | Feature flags | 5 | P2-B | Ninguna |
| BE-P2-009 | Validacion M5 | 3 | P2-C | Ninguna |
| BE-P2-010 | Misiones gremios | 8 | P2-C | Teams base OK |

**Total Backend P2:** 31 SP

---

## ARCHIVOS DE REFERENCIA

- Analisis completo: `orchestration/agentes/requirements-analyst/ANALISIS-ALCANCES-P2-POST-SPRINT-P1-2025-12-05.md`
- Historias P0: `orchestration/agentes/requirements-analyst/historias-usuario/US-P2-CRITICAS.md`
- Historias Admin: `orchestration/agentes/requirements-analyst/historias-usuario/US-P2-ADMIN.md`
- Traza: `orchestration/trazas/TRAZA-REQUERIMIENTOS.md`

---

## CRITERIOS DE ACEPTACION GENERALES

- [ ] Codigo con cobertura de tests >= 50% para nuevas funcionalidades
- [ ] Documentacion Swagger actualizada
- [ ] Sin errores en npm run lint
- [ ] Build exitoso
- [ ] Logging apropiado para debugging

---

**Generado por:** Requirements-Analyst
**Fecha:** 2025-12-05
**Revision:** Despues de Sprint P2-A
