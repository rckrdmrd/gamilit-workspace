---
id: "ET-TCH-005"
title: "Monitoreo de Progreso - Especificacion Tecnica"
type: "Especificacion Tecnica"
status: "Implementado"
priority: "P0"
epic: "EXT-001"
module: "teacher"
labels: ["teacher", "progress", "monitoring", "analytics", "mastery"]
created_date: "2026-01-27"
updated_date: "2026-01-27"
related_rf: ["RF-TCH-004a", "RF-TCH-004b"]
related_us: ["US-PM-004a", "US-PM-004b", "US-PM-005a", "US-PM-005c"]
---

# ET-TCH-005: Monitoreo de Progreso - Especificacion Tecnica

## Informacion General

| Campo | Valor |
|-------|-------|
| **ID** | ET-TCH-005 |
| **Epic** | EXT-001 - Portal de Maestros |
| **RF Relacionados** | RF-TCH-004a (Analytics de Progreso), RF-TCH-004b (Notas del Maestro) |
| **US Relacionadas** | US-PM-004a, US-PM-004b, US-PM-005a, US-PM-005c |
| **Prioridad** | P0 - Critico |
| **Estado** | Implementado |

---

## Descripcion Tecnica

Sistema de monitoreo de progreso que permite a los maestros:

1. **Progress Analytics**: Visualizar progreso individual y grupal
2. **Classroom Analytics**: Metricas agregadas por aula
3. **Engagement Metrics**: Indicadores de participacion
4. **Mastery Tracking**: Seguimiento de dominio de habilidades
5. **Performance Trends**: Tendencias de rendimiento
6. **Student Insights**: Insights con predicciones

---

## Componentes Frontend

### Paginas Principales

| Componente | Path | Descripcion |
|------------|------|-------------|
| `TeacherProgressPage` | `apps/frontend/src/apps/teacher/pages/TeacherProgressPage.tsx` | Pagina de progreso |
| `TeacherAnalytics` | `apps/frontend/src/apps/teacher/pages/TeacherAnalytics.tsx` | Pagina de analytics |
| `TeacherMonitoringPage` | `apps/frontend/src/apps/teacher/pages/TeacherMonitoringPage.tsx` | Pagina de monitoreo |

### Componentes de Progreso

| Componente | Path | Descripcion |
|------------|------|-------------|
| `ClassProgressDashboard` | `apps/frontend/src/apps/teacher/components/progress/ClassProgressDashboard.tsx` | Dashboard de progreso de clase |
| `ProgressChart` | `apps/frontend/src/apps/teacher/components/progress/ProgressChart.tsx` | Graficas de progreso |
| `ModuleCompletionCard` | `apps/frontend/src/apps/teacher/components/progress/ModuleCompletionCard.tsx` | Card de completitud de modulo |

### Componentes de Analytics

| Componente | Path | Descripcion |
|------------|------|-------------|
| `LearningAnalyticsDashboard` | `apps/frontend/src/apps/teacher/components/analytics/LearningAnalyticsDashboard.tsx` | Dashboard de analytics |
| `PerformanceInsightsPanel` | `apps/frontend/src/apps/teacher/components/analytics/PerformanceInsightsPanel.tsx` | Panel de insights |
| `EngagementMetricsChart` | `apps/frontend/src/apps/teacher/components/analytics/EngagementMetricsChart.tsx` | Graficas de engagement |

### Componentes de Monitoreo

| Componente | Path | Descripcion |
|------------|------|-------------|
| `StudentMonitoringPanel` | `apps/frontend/src/apps/teacher/components/monitoring/StudentMonitoringPanel.tsx` | Panel de monitoreo |
| `StudentStatusCard` | `apps/frontend/src/apps/teacher/components/monitoring/StudentStatusCard.tsx` | Card de estado de estudiante |
| `StudentDetailModal` | `apps/frontend/src/apps/teacher/components/monitoring/StudentDetailModal.tsx` | Modal de detalle |

### Hooks

| Hook | Path | Descripcion |
|------|------|-------------|
| ~~`useStudentProgress`~~ | ~~`apps/frontend/src/apps/teacher/hooks/useStudentProgress.ts`~~ | **Removed** — absorbed into `useAnalytics` and `studentProgressApi` hooks |
| `useAnalytics` | `apps/frontend/src/apps/teacher/hooks/useAnalytics.ts` | Hook de analytics |
| ~~`useMasteryTracking`~~ | ~~`apps/frontend/src/apps/teacher/hooks/useMasteryTracking.ts`~~ | **Removed** — absorbed into `useAnalytics` |
| `useAchievementsStats` | `apps/frontend/src/apps/teacher/hooks/useAchievementsStats.ts` | Hook de logros |
| ~~`useMissionStats`~~ | ~~`apps/frontend/src/apps/teacher/hooks/useMissionStats.ts`~~ | **Removed** — absorbed into analytics hooks |

### API Frontend

| API | Path | Descripcion |
|-----|------|-------------|
| `studentProgressApi` | `apps/frontend/src/services/api/teacher/studentProgressApi.ts` | API de progreso |
| `analyticsApi` | `apps/frontend/src/services/api/teacher/analyticsApi.ts` | API de analytics |

---

## Servicios Backend

### Servicios Principales

| Servicio | Path | Descripcion |
|----------|------|-------------|
| `StudentProgressService` | `apps/backend/src/modules/teacher/services/student-progress.service.ts` | Servicio de progreso |
| `AnalyticsService` | `apps/backend/src/modules/teacher/services/analytics.service.ts` | Servicio de analytics (con cache) |
| ~~`MlPredictorService`~~ | ~~`apps/backend/src/modules/teacher/services/ml-predictor.service.ts`~~ | **Removed** — ML prediction was never implemented; at-risk detection uses rule-based logic in `StudentRiskAlertService` |

### Controladores

| Controlador | Path | Descripcion |
|-------------|------|-------------|
| `TeacherController` | `apps/backend/src/modules/teacher/controllers/teacher.controller.ts` | Endpoints de analytics y progreso |

### Entidades

| Entidad | Path | Descripcion |
|---------|------|-------------|
| `MasteryTracking` | `apps/backend/src/modules/progress/entities/mastery-tracking.entity.ts` | Tracking de maestria |
| `SkillAssessment` | `apps/backend/src/modules/progress/entities/skill-assessment.entity.ts` | Evaluacion de habilidades |
| `ModuleProgress` | `apps/backend/src/modules/progress/entities/module-progress.entity.ts` | Progreso por modulo |

### DTOs

| DTO | Path | Descripcion |
|-----|------|-------------|
| `StudentProgressDto` | `apps/backend/src/modules/teacher/dto/student-progress.dto.ts` | DTO de progreso |
| `ClassroomProgressDto` | `apps/backend/src/modules/teacher/dto/classroom-progress.dto.ts` | DTO de progreso de classroom |
| `AnalyticsDto` | `apps/backend/src/modules/teacher/dto/analytics.dto.ts` | DTO de analytics |
| `GetEngagementMetricsDto` | `apps/backend/src/modules/teacher/dto/` | DTO de engagement |

---

## Tablas/Schemas de Base de Datos

### Schema: `progress_tracking`

| Tabla | Descripcion | Columnas Clave |
|-------|-------------|----------------|
| `module_progress` | Progreso por modulo | user_id, module_id, completion_rate, time_spent, last_activity |
| `exercise_submissions` | Entregas de ejercicios | student_id, exercise_id, score, attempts, time_spent |
| `exercise_attempts` | Intentos de ejercicios | submission_id, attempt_number, score, response |
| `mastery_tracking` | Tracking de maestria | student_id, skill_id, mastery_level, assessments_count |
| `skill_assessment` | Evaluacion de habilidades | student_id, skill_id, score, assessed_at |

### Schema: `gamification_system`

| Tabla | Descripcion | Columnas Clave |
|-------|-------------|----------------|
| `user_stats` | Estadisticas de usuario | user_id, total_xp, level, rank_id, streak_days |

### Vista Materializada

```sql
CREATE MATERIALIZED VIEW teacher_dashboard_stats AS
SELECT
  teacher_id,
  COUNT(DISTINCT classroom_id) as total_classrooms,
  COUNT(DISTINCT student_id) as total_students,
  AVG(completion_rate) as avg_progress,
  SUM(CASE WHEN needs_grading THEN 1 ELSE 0 END) as pending_grading
FROM ...
REFRESH CONCURRENTLY every 15 minutes;
```

---

## APIs Endpoints

### Progreso de Estudiantes

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/v1/teacher/students/:studentId/progress` | GET | Progreso individual |
| `/api/v1/teacher/students/:studentId/notes` | GET | Notas del maestro |
| `/api/v1/teacher/students/:studentId/notes` | POST | Agregar nota |

### Analytics de Classroom

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/v1/teacher/analytics/classroom/:id` | GET | Analytics de classroom |
| `/api/v1/teacher/analytics/classroom/:id/trends` | GET | Tendencias de rendimiento |
| `/api/v1/teacher/analytics/classroom/:id/engagement` | GET | Metricas de engagement |

### Insights

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/v1/teacher/analytics/student/:id/insights` | GET | Insights de estudiante |
| `/api/v1/teacher/analytics/classroom/:id/at-risk` | GET | Estudiantes en riesgo |

### Ejemplo Response GET /teacher/students/:studentId/progress

```json
{
  "studentId": "uuid-student",
  "studentName": "Juan Perez",
  "overallProgress": {
    "completionRate": 72.5,
    "averageScore": 85.0,
    "totalExercises": 150,
    "completedExercises": 109,
    "timeSpent": "45:30:00"
  },
  "moduleProgress": [
    {
      "moduleId": "uuid-m1",
      "moduleName": "Comprension Literal",
      "completionRate": 90,
      "averageScore": 88,
      "exercisesCompleted": 45,
      "totalExercises": 50
    }
  ],
  "masteryLevels": [
    {
      "skillId": "uuid-skill-1",
      "skillName": "Identificacion de ideas principales",
      "masteryLevel": 4,
      "maxLevel": 5,
      "assessmentsCount": 12
    }
  ],
  "recentActivity": [
    {
      "date": "2026-01-26",
      "exercisesCompleted": 5,
      "averageScore": 90,
      "timeSpent": "00:45:00"
    }
  ],
  "performanceTrend": "improving"
}
```

### Ejemplo Response GET /teacher/analytics/classroom/:id

```json
{
  "classroomId": "uuid-classroom",
  "classroomName": "Matematicas 6A",
  "summary": {
    "totalStudents": 25,
    "averageProgress": 68.5,
    "averageScore": 76.2,
    "completionRate": 62.0
  },
  "distribution": {
    "excellent": 5,
    "good": 12,
    "needsImprovement": 6,
    "atRisk": 2
  },
  "moduleCompletion": [
    {
      "moduleId": "uuid-m1",
      "moduleName": "Modulo 1",
      "avgCompletion": 85,
      "avgScore": 82
    }
  ],
  "engagement": {
    "activeThisWeek": 22,
    "avgSessionTime": "00:35:00",
    "avgExercisesPerSession": 8
  },
  "trends": [
    {
      "week": "2026-W04",
      "avgProgress": 65,
      "avgScore": 74
    },
    {
      "week": "2026-W05",
      "avgProgress": 68,
      "avgScore": 76
    }
  ]
}
```

---

## Flujos de Usuario

### Flujo 1: Ver Progreso Individual

```
1. Maestro accede a lista de estudiantes
2. Click en estudiante
3. GET /teacher/students/:studentId/progress
4. Ver dashboard de progreso individual
5. Navegar por modulos, habilidades, actividad
```

### Flujo 2: Analytics de Classroom

```
1. Maestro accede a classroom
2. Click en "Analytics"
3. GET /teacher/analytics/classroom/:id
4. Ver metricas agregadas
5. Ver distribucion de desempeno
6. Identificar estudiantes en riesgo
```

### Flujo 3: Monitoreo en Tiempo Real

```
1. Maestro en pagina de monitoreo
2. useClassroomRealtime conecta WebSocket
3. Ver actividad de estudiantes en vivo
4. Recibir actualizaciones de progreso
```

### Flujo 4: Identificar Estudiantes At-Risk

```
1. Maestro accede a analytics
2. GET /teacher/analytics/classroom/:id/at-risk
3. Ver lista de estudiantes en riesgo
4. Criterio: average_grade < 70% OR completion_rate < 50%
5. Click para ver detalle y crear intervencion
```

---

## Dependencias

### Dependencias de Modulos

- `ProgressModule` - Para datos de progreso
- `GamificationModule` - Para stats y logros
- `CacheModule` - Para cache de analytics (TTL: 5 min)

### Dependencias de User Stories

- Depende de: `EAI-002` (Contenido educativo), `EAI-003` (Gamificacion)
- Habilita: `US-PM-005b` (Reportes)

---

## Criterios de Aceptacion

### CA-01: Progreso Individual
- [x] Ver progreso por modulo
- [x] Ver ejercicios completados vs totales
- [x] Ver score promedio
- [x] Ver tiempo invertido

### CA-02: Analytics de Classroom
- [x] Metricas agregadas (promedio, completitud)
- [x] Distribucion de desempeno
- [x] Comparativa entre modulos

### CA-03: Engagement Metrics
- [x] Estudiantes activos esta semana
- [x] Tiempo promedio de sesion
- [x] Ejercicios por sesion

### CA-04: Mastery Tracking
- [x] Nivel de maestria por habilidad
- [x] Numero de evaluaciones
- [x] Progresion de nivel

### CA-05: At-Risk Detection
- [x] Aplicar formula: `at_risk = (avg_grade < 70%) OR (completion_rate < 50%)`
- [x] Listar estudiantes en riesgo
- [x] Indicadores visuales en dashboard

### CA-06: Performance
- [x] Cache de analytics (5 min TTL)
- [x] Vista materializada para stats
- [x] Tiempo de carga < 2s

---

## Notas de Implementacion

### Cache Strategy

```typescript
// Cache de 5 minutos para analytics
@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getClassroomAnalytics(classroomId: string) {
    const cacheKey = `analytics:classroom:${classroomId}`;
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) return cached;

    const analytics = await this.calculateAnalytics(classroomId);
    await this.cacheManager.set(cacheKey, analytics, 300); // 5 min
    return analytics;
  }
}
```

### Formula At-Risk (Estandarizada)

Referencia: [AT-RISK-LOGIC-STANDARD.md](./AT-RISK-LOGIC-STANDARD.md)

```typescript
function isAtRisk(student: StudentStats): boolean {
  return student.averageGrade < 70 || student.completionRate < 50;
}
```

### ML Predictor (Removido — funcionalidad nunca implementada; heuristicas integradas en StudentRiskAlertService)

```typescript
// Prediccion de riesgo de abandono
interface PredictionResult {
  riskScore: number;       // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  factors: string[];       // ["inactivity", "low_scores", ...]
  recommendation: string;
}
```

---

## Referencias

- US-PM-004a: Analytics de Progreso
- US-PM-004b: Notas del Maestro
- US-PM-005a: Classroom Analytics
- US-PM-005c: Engagement Metrics
- AT-RISK-LOGIC-STANDARD.md: Formula estandarizada
- PERFORMANCE-TREND-SPEC.md: Especificacion de tendencias

---

**Creado:** 2026-01-27
**Sistema:** SIMCO (Sistema Indexado Modular por Contexto)
