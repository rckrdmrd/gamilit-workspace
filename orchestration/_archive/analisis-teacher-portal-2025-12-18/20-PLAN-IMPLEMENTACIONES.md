# PLAN DE IMPLEMENTACIONES - PORTAL TEACHER GAMILIT

**Fecha**: 18 Diciembre 2025
**Versión**: 1.0
**FASE**: 3 - Planificación de Implementaciones
**Rol**: Requirements-Analyst

---

## ÍNDICE DE IMPLEMENTACIONES

| Prioridad | Total Tareas | Estimación |
|-----------|--------------|------------|
| **P0 - Crítico** | 4 tareas | Sprint actual |
| **P1 - Alta** | 8 tareas | 1-2 sprints |
| **P2 - Media** | 7 tareas | 3-4 sprints |

---

## P0 - TAREAS CRÍTICAS

### ~~TAREA P0-01: Reemplazar Mock Data en TeacherGamification~~ ❌ ELIMINADA

**Estado**: YA IMPLEMENTADO - No requiere acción

**Validación FASE 4**: TeacherGamification.tsx ya usa hooks reales:
- `useEconomyAnalytics` → API real
- `useStudentsEconomy` → API real
- `useAchievementsStats` → API real

Búsqueda de "mock" en archivo: **No matches found**

---

### TAREA P0-02: Corregir Submit en Mecánica Emparejamiento

**Gap**: G02 - Progreso de Emparejamiento no se persiste en backend
**Área**: Student Portal (Mecánicas)
**Archivos a modificar**:
- `/apps/frontend/src/features/exercises/mechanics/Emparejamiento.tsx`

**Cambios requeridos**:
1. Localizar función de completado del ejercicio
2. Asegurar llamada a `submitExercise()` o `submitAnswer()` del hook useExercise
3. Validar que el score se calcule correctamente antes del submit

**Dependencias**:
- Hook useExercise debe estar disponible
- Endpoint POST /exercises/{id}/submit debe estar funcional

**Subagente**: Mechanics-Developer
**Prompt para subagente**:
```
Corregir persistencia en Emparejamiento.tsx:
1. Leer componente Emparejamiento.tsx
2. Identificar lógica de completado (onComplete, handleFinish, etc.)
3. Verificar si llama a submitExercise del hook useExercise
4. Si no existe, agregarlo con el score calculado
5. Probar que el progreso se persista en exercise_submissions
```

---

### TAREA P0-03: Visualización de Mecánicas Manuales en Teacher Portal

**Gap**: G03 - Teacher no puede ver/evaluar respuestas de mecánicas manuales
**Área**: Frontend Teacher + Backend
**Archivos a modificar**:
- `/apps/frontend/src/features/teacher/components/responses/ResponseDetailModal.tsx`
- `/apps/backend/src/modules/teacher/services/exercise-responses.service.ts`

**Cambios requeridos**:
1. En ResponseDetailModal.tsx:
   - Detectar tipo de mecánica (manual: prediccion_narrativa, tribunal, podcast, video, comic)
   - Renderizar respuesta de texto largo con formato
   - Agregar controles de evaluación manual (score, feedback)
2. En exercise-responses.service.ts:
   - Asegurar que las respuestas de texto abierto se retornen completas

**Mecánicas manuales afectadas** (10):
- Predicción Narrativa
- Tribunal de Opiniones
- Podcast Argumentativo
- Debate Digital
- Cómic Digital
- Video Carta
- Diario Multimedia
- Collage Prensa
- Call to Action
- Texto en Movimiento

**Dependencias**:
- ManualReviewService ya existe

**Subagente**: FullStack-Developer
**Prompt para subagente**:
```
Implementar visualización de mecánicas manuales:
1. Leer ResponseDetailModal.tsx actual
2. Identificar tipos de mecánica manual vs automática
3. Para manuales: renderizar respuesta completa de texto
4. Agregar sección de calificación manual con:
   - Score numérico (0-100)
   - Textarea para feedback
   - Botón de guardar usando ManualReviewService
5. Verificar que backend retorna respuesta completa
```

---

### TAREA P0-04: Integrar NotificationService en Alertas

**Gap**: G04 - Alertas se generan pero no notifican
**Área**: Backend
**Archivos a modificar**:
- `/apps/backend/src/modules/teacher/services/student-risk-alert.service.ts`
- `/apps/backend/src/modules/notifications/notifications.service.ts` (verificar existencia)

**Cambios requeridos**:
1. Verificar que NotificationsModule existe
2. En StudentRiskAlertService:
   - Inyectar NotificationsService
   - En método de creación de alerta, llamar a notificación
   - Tipos de notificación: in-app, email (opcional)

**Dependencias**:
- NotificationsModule debe existir (verificar)

**Subagente**: Backend-Developer
**Prompt para subagente**:
```
Integrar NotificationService en alertas:
1. Verificar si existe NotificationsModule en /apps/backend/src/modules/
2. Si no existe, crear estructura básica
3. En StudentRiskAlertService:
   - Importar e inyectar NotificationsService
   - En createAlert(), llamar a sendNotification()
   - Payload: teacher_id, alert_type, student_name, message
4. Resolver los 3 TODOs relacionados con notificaciones
```

---

## P1 - TAREAS DE ALTA PRIORIDAD

### TAREA P1-01: Habilitar RLS en teacher_notes

**Gap**: G09 - Tabla sin Row Level Security
**Área**: Database
**Archivos a crear/modificar**:
- `/apps/database/migrations/YYYYMMDD_add_rls_teacher_notes.sql`

**SQL a ejecutar**:
```sql
ALTER TABLE progress_tracking.teacher_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY teacher_notes_select_own
ON progress_tracking.teacher_notes
FOR SELECT
USING (teacher_id = gamilit.get_current_user_id());

CREATE POLICY teacher_notes_insert_own
ON progress_tracking.teacher_notes
FOR INSERT
WITH CHECK (teacher_id = gamilit.get_current_user_id());

CREATE POLICY teacher_notes_update_own
ON progress_tracking.teacher_notes
FOR UPDATE
USING (teacher_id = gamilit.get_current_user_id());

CREATE POLICY teacher_notes_delete_own
ON progress_tracking.teacher_notes
FOR DELETE
USING (teacher_id = gamilit.get_current_user_id());
```

**Dependencias**: Ninguna

**Subagente**: Database-Developer

---

### TAREA P1-02: Crear Índices Críticos

**Gap**: G10 - Queries lentas por índices faltantes
**Área**: Database
**Archivos a crear**:
- `/apps/database/migrations/YYYYMMDD_add_teacher_indexes.sql`

**SQL a ejecutar**:
```sql
-- Índice para consultas de estudiantes activos por aula
CREATE INDEX IF NOT EXISTS idx_classroom_members_classroom_active
ON social_features.classroom_members(classroom_id, status)
WHERE status = 'active';

-- Índice para progreso por aula
CREATE INDEX IF NOT EXISTS idx_module_progress_classroom_status
ON progress_tracking.module_progress(classroom_id, status);

-- Índice para alertas por teacher
CREATE INDEX IF NOT EXISTS idx_intervention_alerts_teacher_status
ON progress_tracking.student_intervention_alerts(teacher_id, status)
WHERE status IN ('pending', 'acknowledged');

-- Índice para submissions por estudiante y fecha
CREATE INDEX IF NOT EXISTS idx_exercise_submissions_student_date
ON progress_tracking.exercise_submissions(student_id, submitted_at DESC);
```

**Dependencias**: Ninguna

**Subagente**: Database-Developer

---

### TAREA P1-03: Crear Vista classroom_progress_overview

**Gap**: G11 - Sin vistas agregadas para progreso de aula
**Área**: Database
**Archivos a crear**:
- `/apps/database/migrations/YYYYMMDD_create_classroom_progress_view.sql`

**SQL a ejecutar**:
```sql
CREATE OR REPLACE VIEW social_features.classroom_progress_overview AS
SELECT
    c.id AS classroom_id,
    c.name AS classroom_name,
    c.teacher_id,
    COUNT(DISTINCT cm.student_id) AS total_students,
    COUNT(DISTINCT CASE WHEN mp.status = 'completed' THEN mp.student_id END) AS students_completed,
    ROUND(AVG(mp.progress_percentage), 2) AS avg_progress,
    COUNT(DISTINCT sia.id) FILTER (WHERE sia.status = 'pending') AS pending_alerts,
    COUNT(DISTINCT es.id) FILTER (WHERE es.needs_review = true) AS pending_reviews
FROM social_features.classrooms c
LEFT JOIN social_features.classroom_members cm ON c.id = cm.classroom_id AND cm.status = 'active'
LEFT JOIN progress_tracking.module_progress mp ON cm.student_id = mp.student_id
LEFT JOIN progress_tracking.student_intervention_alerts sia ON cm.student_id = sia.student_id
LEFT JOIN progress_tracking.exercise_submissions es ON cm.student_id = es.student_id
GROUP BY c.id, c.name, c.teacher_id;

-- Grant para teacher role
GRANT SELECT ON social_features.classroom_progress_overview TO authenticated;
```

**Dependencias**: Tablas referenciadas deben existir

**Subagente**: Database-Developer

---

### TAREA P1-04: Habilitar Páginas de Comunicación y Contenido

**Gap**: G06 - 3 páginas con placeholder (SHOW_UNDER_CONSTRUCTION = true)
**Área**: Frontend
**Archivos a modificar**:
- `/apps/frontend/src/features/teacher/pages/TeacherCommunicationPage.tsx`
- `/apps/frontend/src/features/teacher/pages/TeacherContentPage.tsx`

**Cambios requeridos**:
1. En TeacherCommunicationPage.tsx:
   - Cambiar `const SHOW_UNDER_CONSTRUCTION = true` a `false`
2. En TeacherContentPage.tsx:
   - Cambiar `const SHOW_UNDER_CONSTRUCTION = true` a `false`
3. Verificar que los componentes internos funcionan correctamente

**Dependencias**:
- Hooks useTeacherMessages y useTeacherContent deben estar funcionales

**Subagente**: Frontend-Developer

---

### TAREA P1-05: Resolver TODOs en StudentProgressService

**Gap**: G07 - Datos sin enriquecer (nombres de módulos/ejercicios)
**Área**: Backend
**Archivos a modificar**:
- `/apps/backend/src/modules/teacher/services/student-progress.service.ts`

**TODOs a resolver** (4):
1. Join con tablas de módulos para nombres reales
2. Join con tablas de ejercicios para metadata
3. Cálculo de promedio de clase real
4. Enriquecimiento de datos de submissions

**Dependencias**:
- Entidades Module y Exercise disponibles

**Subagente**: Backend-Developer
**Prompt para subagente**:
```
Resolver TODOs en StudentProgressService:
1. Leer student-progress.service.ts
2. Localizar los 4 TODOs
3. Para cada TODO:
   - Implementar join con tabla correspondiente
   - Agregar campos de nombre, descripción al response
4. Calcular promedio de clase usando query agregada
5. Mantener compatibilidad con DTOs existentes
```

---

### TAREA P1-06: Implementar Hook useMissionStats

**Gap**: G12 - Hooks faltantes para misiones
**Área**: Frontend
**Archivos a crear**:
- `/apps/frontend/src/features/teacher/hooks/useMissionStats.ts`

**Endpoints a consumir**:
- `GET /teacher/missions/classroom/{id}/stats`
- `GET /teacher/missions/active`
- `GET /teacher/missions/history`

**Estructura del hook**:
```typescript
interface MissionStats {
  activeMissions: Mission[];
  completionRate: number;
  participationRate: number;
  topParticipants: Student[];
}

export function useMissionStats(classroomId: string) {
  // Implementar similar a useAnalytics
}
```

**Dependencias**:
- Endpoints de misiones deben existir (verificar)

**Subagente**: Frontend-Developer

---

### TAREA P1-07: Implementar Hook useMasteryTracking

**Gap**: G12 - Hook para seguimiento de dominio de habilidades
**Área**: Frontend
**Archivos a crear**:
- `/apps/frontend/src/features/teacher/hooks/useMasteryTracking.ts`

**Endpoints a consumir**:
- `GET /teacher/students/{id}/mastery`
- `GET /teacher/classrooms/{id}/mastery-overview`

**Dependencias**:
- Verificar si endpoints existen, si no, crear en backend

**Subagente**: Frontend-Developer

---

### TAREA P1-08: Cache Invalidation en AnalyticsService

**Gap**: G08 - Performance subóptimo por falta de cache
**Área**: Backend
**Archivos a modificar**:
- `/apps/backend/src/modules/teacher/services/analytics.service.ts`

**Cambios requeridos**:
1. Implementar pattern de cache con TTL
2. Invalidar cache en:
   - Nueva submission
   - Cambio de score
   - Nuevo miembro en aula
3. Usar Redis o cache in-memory según disponibilidad

**Dependencias**:
- CacheModule de NestJS

**Subagente**: Backend-Developer

---

## P2 - TAREAS DE MEDIA PRIORIDAD

### TAREA P2-01: Implementar WebSocket para Monitoreo Real-Time

**Gap**: Frontend usa polling cada 30s
**Área**: Frontend + Backend
**Archivos a crear/modificar**:
- `/apps/backend/src/modules/teacher/gateways/monitoring.gateway.ts`
- `/apps/frontend/src/features/teacher/hooks/useRealtimeMonitoring.ts`

**Dependencias**: P0 y P1 completados

---

### TAREA P2-02: Crear RubricEvaluator Estándar

**Gap**: G16 - Calificación manual sin estructura
**Área**: Frontend
**Archivos a crear**:
- `/apps/frontend/src/features/teacher/components/grading/RubricEvaluator.tsx`

---

### TAREA P2-03: Reproductor Multimedia en ResponseDetailModal

**Gap**: G17 - Videos y audios no reproducibles
**Área**: Frontend
**Archivos a modificar**:
- `/apps/frontend/src/features/teacher/components/responses/ResponseDetailModal.tsx`

---

### TAREA P2-04: Crear Tabla teacher_interventions

**Gap**: G18 - Sin registro de acciones post-alerta
**Área**: Database

---

### TAREA P2-05: Crear Vista teacher_pending_reviews

**Gap**: G19 - Sin dashboard de pendientes
**Área**: Database

---

### TAREA P2-06: Tests Automáticos para Hooks

**Gap**: G13 - Sin tests unitarios
**Área**: Frontend

---

### TAREA P2-07: Optimización N+1 Queries

**Gap**: G15 - Queries ineficientes
**Área**: Backend

---

## GRAFO DE DEPENDENCIAS

```
P0-01 (Mock Data) ─────────────────────────────────────→ P1-06 (useMissionStats)
        │
        └──→ P2-02 (RubricEvaluator)

P0-02 (Emparejamiento) ──────────────────────────────→ Independiente

P0-03 (Visualización Manual) ────→ P2-02 (RubricEvaluator) ──→ P2-03 (Multimedia)

P0-04 (NotificationService) ─────────────────────────→ P2-01 (WebSocket)

P1-01 (RLS) ─────────────────────────────────────────→ Independiente
P1-02 (Índices) ─────────────────────────────────────→ P1-03 (Vista)
P1-03 (Vista) ──────────────────────────────────────→ P2-05 (Pending Reviews)

P1-04 (Habilitar páginas) ───────────────────────────→ Independiente

P1-05 (StudentProgress TODOs) ──→ P1-08 (Cache) ────→ P2-07 (N+1)

P1-06 (useMissionStats) ────────────────────────────→ P2-01 (WebSocket)
P1-07 (useMasteryTracking) ─────────────────────────→ P2-01 (WebSocket)
```

---

## ORDEN DE EJECUCIÓN RECOMENDADO

### Sprint 1 (Actual)
1. P0-01: Mock Data
2. P0-02: Emparejamiento
3. P0-03: Visualización Manual
4. P0-04: NotificationService
5. P1-01: RLS teacher_notes
6. P1-02: Índices

### Sprint 2
7. P1-03: Vista classroom_progress
8. P1-04: Habilitar páginas
9. P1-05: StudentProgress TODOs
10. P1-06: useMissionStats
11. P1-07: useMasteryTracking
12. P1-08: Cache invalidation

### Sprint 3-4
13. P2-01 a P2-07 (según prioridad del equipo)

---

## SINCRONIZACIÓN CON PRODUCCIÓN

Después de cada implementación:
1. Commit en workspace desarrollo (`/home/isem/workspace/projects/gamilit`)
2. Sincronizar a producción (`/home/isem/workspace-old/.../gamilit`)
3. Validar que no haya conflictos
4. Ejecutar migraciones de DB si aplica

---

## SIGUIENTE PASO

**FASE 4**: Validar este plan contra los análisis para asegurar:
- Todas las dependencias están cubiertas
- No faltan objetos que impacten los cambios
- Orden de ejecución es correcto
- Archivos mencionados existen

---

*Plan creado: 2025-12-18*
*Proyecto: GAMILIT - Portal Teacher*
