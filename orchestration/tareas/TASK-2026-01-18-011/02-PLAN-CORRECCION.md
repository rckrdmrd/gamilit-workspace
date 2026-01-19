# PLAN DE CORRECCION - Teacher Progress/Alerts/Reports

## Resumen del Plan

Este plan aborda los 34 issues identificados en el analisis, priorizados por criticidad
y organizados en fases de implementacion.

**Fecha:** 2026-01-18
**ID:** TASK-2026-01-18-011

---

## FASE 1: CORRECCIONES CRITICAS (P0)

### 1.1 DB-002: Corregir final_score -> score en generate_student_alerts

**Prioridad:** P0 - CRITICO
**Esfuerzo:** 30 min
**Riesgo:** Bajo (solo cambio de nombre de columna)

**Archivo:** `apps/database/ddl/schemas/progress_tracking/functions/15-generate_student_alerts.sql`

**Cambios requeridos:**
```sql
-- LINEA ~212: Cambiar
SELECT user_id, AVG(final_score) as avg_score
-- Por:
SELECT user_id, AVG(score) as avg_score

-- LINEA ~223: Cambiar referencias similares de final_score a score
```

**Validacion:**
- [ ] Ejecutar funcion manualmente: `SELECT progress_tracking.generate_student_alerts();`
- [ ] Verificar que no hay errores SQL
- [ ] Verificar que se generan alertas (si hay estudiantes con criterios)

---

### 1.2 DB-001: Configurar CRON Job para generate_student_alerts

**Prioridad:** P0 - CRITICO
**Esfuerzo:** 1 hora
**Riesgo:** Bajo (solo configuracion)

**Opcion A: Usando pg_cron (PostgreSQL)**
```sql
-- Ejecutar como superuser en PostgreSQL
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'generate-student-alerts-daily',
  '0 2 * * *',  -- 2:00 AM diario
  $$SELECT progress_tracking.generate_student_alerts()$$
);
```

**Opcion B: Usando NestJS Schedule (Backend)**
```typescript
// apps/backend/src/modules/teacher/services/scheduled-tasks.service.ts
import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource } from 'typeorm';

@Injectable()
export class ScheduledTasksService {
  constructor(private dataSource: DataSource) {}

  @Cron('0 2 * * *') // 2:00 AM diario
  async generateStudentAlerts() {
    await this.dataSource.query('SELECT progress_tracking.generate_student_alerts()');
  }
}
```

**Validacion:**
- [ ] Job programado correctamente
- [ ] Ejecutar manualmente para verificar
- [ ] Verificar logs de ejecucion

---

### 1.3 BE-001 + BE-002: Corregir vulnerabilidad multi-tenant en AdminReports

**Prioridad:** P0 - CRITICO (SEGURIDAD)
**Esfuerzo:** 2 horas
**Riesgo:** Medio (requiere migracion de BD)

**Paso 1: Agregar tenant_id a AdminReport entity**
```typescript
// apps/backend/src/modules/admin/entities/admin-report.entity.ts
@Column({ type: 'uuid', nullable: false })
tenant_id: string;

// Agregar indice
@Index('idx_admin_reports_tenant')
```

**Paso 2: Crear migracion**
```sql
-- migrations/XXXX-add-tenant-id-to-admin-reports.sql
ALTER TABLE admin_dashboard.admin_reports
ADD COLUMN tenant_id UUID NOT NULL
REFERENCES multi_tenant.tenants(id);

CREATE INDEX idx_admin_reports_tenant
ON admin_dashboard.admin_reports(tenant_id);
```

**Paso 3: Actualizar AdminReportsService**
```typescript
// apps/backend/src/modules/admin/services/admin-reports.service.ts

async getReports(userId: string, tenantId: string) {
  return this.reportRepository.find({
    where: { tenant_id: tenantId },  // <-- AGREGAR FILTRO
    order: { created_at: 'DESC' }
  });
}

async downloadReport(reportId: string, userId: string, tenantId: string) {
  const report = await this.reportRepository.findOne({
    where: {
      id: reportId,
      tenant_id: tenantId  // <-- AGREGAR FILTRO
    }
  });
  if (!report) {
    throw new NotFoundException('Report not found');
  }
  // ... resto del codigo
}

async deleteReport(reportId: string, userId: string, tenantId: string) {
  const report = await this.reportRepository.findOne({
    where: {
      id: reportId,
      tenant_id: tenantId  // <-- AGREGAR FILTRO
    }
  });
  // ...
}
```

**Validacion:**
- [ ] Migracion ejecutada sin errores
- [ ] Tests de integracion pasan
- [ ] Verificar que admin de tenant A NO ve reportes de tenant B

---

### 1.4 FE-007: Corregir validacion de classroom null en TeacherAlertsPage

**Prioridad:** P0 - CRITICO
**Esfuerzo:** 30 min
**Riesgo:** Bajo

**Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherAlertsPage.tsx`

**Cambio:**
```typescript
// Linea ~39: Agregar validacion
const selectedClassroomId = selectedClassroom?.id ?? classrooms[0]?.id ?? null;

// Agregar manejo de null antes de renderizar InterventionAlertsPanel
{selectedClassroomId ? (
  <InterventionAlertsPanel
    classroomId={selectedClassroomId}
    // ... otros props
  />
) : (
  <div className="text-center py-8">
    <p className="text-gray-500">No hay aulas asignadas. Contacte al administrador.</p>
  </div>
)}
```

**Validacion:**
- [ ] No hay errores en consola
- [ ] UI muestra mensaje apropiado cuando no hay aulas

---

## FASE 2: CORRECCIONES ALTAS (P1)

### 2.1 DB-003: Crear trigger para submitted_progress_percentage

**Prioridad:** P1 - ALTA
**Esfuerzo:** 1 hora

**Archivo a crear:** `apps/database/ddl/schemas/progress_tracking/triggers/32-trg_update_submitted_progress.sql`

```sql
-- Trigger para actualizar submitted_progress cuando se crea un submission
CREATE OR REPLACE FUNCTION progress_tracking.update_submitted_progress_on_submission()
RETURNS TRIGGER AS $$
DECLARE
  v_module_id UUID;
  v_total_exercises INT;
  v_submitted_count INT;
BEGIN
  -- Obtener module_id del ejercicio
  SELECT module_id INTO v_module_id
  FROM educational_content.exercises
  WHERE id = NEW.exercise_id;

  IF v_module_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Contar ejercicios totales del modulo
  SELECT COUNT(*) INTO v_total_exercises
  FROM educational_content.exercises
  WHERE module_id = v_module_id AND is_active = true;

  -- Contar submissions unicos del usuario en este modulo
  SELECT COUNT(DISTINCT es.exercise_id) INTO v_submitted_count
  FROM progress_tracking.exercise_submissions es
  JOIN educational_content.exercises e ON es.exercise_id = e.id
  WHERE es.user_id = NEW.user_id
    AND e.module_id = v_module_id
    AND es.status IN ('submitted', 'graded', 'reviewed', 'pending_review');

  -- Actualizar module_progress
  UPDATE progress_tracking.module_progress
  SET
    submitted_exercises = v_submitted_count,
    submitted_progress_percentage = CASE
      WHEN v_total_exercises > 0
      THEN ROUND((v_submitted_count::NUMERIC / v_total_exercises) * 100, 2)
      ELSE 0
    END,
    updated_at = NOW()
  WHERE user_id = NEW.user_id AND module_id = v_module_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_submitted_progress_on_submission
AFTER INSERT ON progress_tracking.exercise_submissions
FOR EACH ROW
EXECUTE FUNCTION progress_tracking.update_submitted_progress_on_submission();
```

---

### 2.2 DB-005: Agregar RLS policies a manual_reviews

**Prioridad:** P1 - ALTA
**Esfuerzo:** 1 hora

**Archivo a crear:** `apps/database/ddl/schemas/progress_tracking/rls-policies/manual-reviews-policies.sql`

```sql
-- Habilitar RLS
ALTER TABLE progress_tracking.manual_reviews ENABLE ROW LEVEL SECURITY;

-- Reviewer puede ver y gestionar sus propias reviews
CREATE POLICY reviewer_manage_own_reviews ON progress_tracking.manual_reviews
  FOR ALL
  TO authenticated
  USING (reviewer_id = auth.uid());

-- Teacher puede ver reviews de su classroom
CREATE POLICY teacher_view_classroom_reviews ON progress_tracking.manual_reviews
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM progress_tracking.exercise_submissions es
      JOIN social_features.classroom_members cm ON cm.classroom_id = es.classroom_id
      WHERE es.id = submission_id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('teacher', 'admin_teacher')
    )
  );

-- Admin puede ver todo
CREATE POLICY admin_view_all_reviews ON progress_tracking.manual_reviews
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth_management.user_roles ur
      WHERE ur.user_id = auth.uid()
        AND ur.role IN ('SUPER_ADMIN', 'ADMIN_TEACHER')
    )
  );
```

---

### 2.3 FE-005 + FE-006: Completar tipos de alertas en frontend

**Prioridad:** P1 - ALTA
**Esfuerzo:** 1 hora

**Archivo:** `apps/frontend/src/types/alertTypes.ts`

```typescript
// Agregar tipos faltantes
export type InterventionAlertType =
  | 'no_activity'
  | 'low_score'
  | 'declining_trend'
  | 'repeated_failures'
  | 'excessive_time'      // <-- AGREGAR
  | 'low_engagement';     // <-- AGREGAR

export const ALERT_TYPES: Record<InterventionAlertType, { label: string; icon: string; color: string }> = {
  no_activity: { label: 'Sin Actividad', icon: 'clock', color: 'yellow' },
  low_score: { label: 'Puntaje Bajo', icon: 'trending-down', color: 'red' },
  declining_trend: { label: 'Tendencia Decreciente', icon: 'arrow-down', color: 'orange' },
  repeated_failures: { label: 'Fallos Repetidos', icon: 'refresh-cw', color: 'red' },
  excessive_time: { label: 'Tiempo Excesivo', icon: 'timer', color: 'purple' },      // <-- AGREGAR
  low_engagement: { label: 'Bajo Engagement', icon: 'activity', color: 'gray' },    // <-- AGREGAR
};
```

**Archivo:** `apps/frontend/src/apps/teacher/components/alerts/InterventionAlertsPanel.tsx`

```typescript
// Linea ~198-202: Agregar opciones de filtro
<option value="excessive_time">Tiempo Excesivo</option>
<option value="low_engagement">Bajo Engagement</option>
```

---

### 2.4 BE-004: Agregar validacion de expiracion en downloadReport

**Prioridad:** P1 - ALTA
**Esfuerzo:** 30 min

**Archivo:** `apps/backend/src/modules/admin/services/admin-reports.service.ts`

```typescript
async downloadReport(reportId: string, userId: string, tenantId: string) {
  const report = await this.reportRepository.findOne({
    where: { id: reportId, tenant_id: tenantId }
  });

  if (!report) {
    throw new NotFoundException('Report not found');
  }

  // AGREGAR: Validacion de expiracion
  if (report.expires_at && new Date(report.expires_at) < new Date()) {
    throw new GoneException('Report has expired and is no longer available');
  }

  // ... resto del codigo
}
```

---

### 2.5 BE-005: Implementar cron job para cleanup de reports

**Prioridad:** P1 - ALTA
**Esfuerzo:** 1 hora

**Archivo:** `apps/backend/src/modules/admin/services/admin-reports.service.ts`

```typescript
import { Cron, CronExpression } from '@nestjs/schedule';

@Cron(CronExpression.EVERY_DAY_AT_3AM)
async cleanupExpiredReports() {
  this.logger.log('Starting cleanup of expired reports...');

  const result = await this.reportRepository
    .createQueryBuilder()
    .delete()
    .from(AdminReport)
    .where('expires_at < :now', { now: new Date() })
    .execute();

  this.logger.log(`Cleaned up ${result.affected} expired reports`);
}
```

---

## FASE 3: CORRECCIONES MEDIAS (P2)

### 3.1 FE-009: Mejorar manejo de mock data

**Esfuerzo:** 1 hora

Mostrar banner claro cuando se usan datos mock:

```typescript
// TeacherReportsPage.tsx
{isUsingMockData && (
  <Alert variant="warning" className="mb-4">
    <AlertTriangle className="h-4 w-4" />
    <AlertDescription>
      Mostrando datos de ejemplo. Los reportes reales se cargaran cuando haya conexion.
    </AlertDescription>
  </Alert>
)}
```

---

### 3.2 FE-001: Sincronizacion query params y estado

**Esfuerzo:** 1 hora

```typescript
// TeacherProgressPage.tsx
useEffect(() => {
  const classroomIdFromUrl = searchParams.get('classroomId');
  if (classroomIdFromUrl && classrooms.some(c => c.id === classroomIdFromUrl)) {
    setSelectedClassroomId(classroomIdFromUrl);
  } else if (classroomIdFromUrl && classrooms.length > 0) {
    // URL tiene classroom que no existe, limpiar
    setSearchParams({});
    setSelectedClassroomId('all');
  }
}, [searchParams, classrooms]);
```

---

### 3.3 DB-004: Corregir referencia teacher_classrooms -> classroom_members

**Esfuerzo:** 30 min

Actualizar vistas y RLS policies que referencian `teacher_classrooms` a usar
`social_features.classroom_members WHERE role = 'teacher'`.

---

### 3.4 BE-006: Unificar null vs undefined en DTOs

**Esfuerzo:** 2 horas

Establecer convencion: usar `| null` para campos que pueden ser nulos desde BD,
y `?` para campos opcionales que pueden omitirse.

---

## FASE 4: CORRECCIONES BAJAS (P3)

Lista de issues P3 para backlog:

- FE-002: Casteo seguro en useAnalytics
- FE-004: Validacion strict de gamification fallback
- FE-008: Unificar AlertPriority vs InterventionAlertSeverity
- FE-010: Reemplazar mock data hardcodeado
- FE-013: Centralizar ReportType en constante
- FE-014: Obtener size de reportes desde API
- BE-007: Migrar query SQL raw a QueryBuilder
- BE-008: Mejorar logging de acciones criticas
- BE-009: Validar conversion interval robusta
- BE-010: Obtener total_exercises desde BD (no default 15)
- BE-011: Agregar fallback para classroom name null
- DB-006: Agregar valor MASTERED a enum progress_status
- DB-007: Crear triggers para EngagementMetrics
- DB-009: Agregar indice compuesto (user_id, status)
- DB-010: Evaluar ON DELETE CASCADE para manual_reviews
- DB-011: Agregar campos de auditoria a student_intervention_alerts

---

## CRONOGRAMA SUGERIDO

| Fase | Prioridad | Esfuerzo Est. | Items |
|------|-----------|---------------|-------|
| Fase 1 | P0 | 4-5 horas | 4 items criticos |
| Fase 2 | P1 | 5-6 horas | 5 items altos |
| Fase 3 | P2 | 5 horas | 4 items medios |
| Fase 4 | P3 | Backlog | 16 items bajos |

**Total Fase 1-3:** ~15 horas de desarrollo

---

## VALIDACIONES POST-IMPLEMENTACION

### Build y Lint
```bash
cd apps/backend && npm run build && npm run lint
cd apps/frontend && npm run build && npm run lint
```

### Tests
```bash
cd apps/backend && npm run test
cd apps/frontend && npm run test
```

### Validacion Manual
- [ ] TeacherProgressPage muestra datos correctamente
- [ ] TeacherAlertsPage muestra alertas (despues de ejecutar CRON)
- [ ] TeacherReportsPage genera y descarga reportes
- [ ] Admin de tenant A NO puede ver reportes de tenant B
- [ ] submitted_progress_percentage se actualiza al enviar ejercicios

---

## REFERENCIAS

- Analisis consolidado: `01-ANALISIS-CONSOLIDADO.md`
- Flujos de datos: `01-ANALISIS-CONSOLIDADO.md#flujo-de-datos-afectado`
- Archivos afectados: `01-ANALISIS-CONSOLIDADO.md#archivos-afectados`
