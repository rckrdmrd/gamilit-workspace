---
id: "ET-REP-001"
title: "Reportes de Estudiante - Especificacion Tecnica"
type: "Especificacion Tecnica"
status: "Implementado"
priority: "P1"
epic: "EXT-005"
module: "reports"
labels: ["reports", "student", "analytics", "progress"]
created_date: "2026-01-27"
updated_date: "2026-01-27"
related_rf: ["RF-REP-001"]
related_us: ["US-REP-001"]
---

# ET-REP-001: Reportes de Estudiante - Especificacion Tecnica

## Informacion General

| Campo | Valor |
|-------|-------|
| **ID** | ET-REP-001 |
| **Epic** | EXT-005 - Reportes Avanzados |
| **RF Relacionado** | RF-REP-001 (Student Reports) |
| **US Relacionadas** | US-REP-001 |
| **Prioridad** | P1 - Alta |
| **Estado** | Implementado |

---

## Descripcion Tecnica

El sistema de reportes de estudiante permite a los profesores visualizar y generar reportes detallados del desempeno individual de cada estudiante, incluyendo:

1. **Vista Detallada Individual**: Perfil de rendimiento completo
2. **Graficos de Desempeno**: Evolucion temporal, competencias
3. **Insights y Predicciones**: Riesgo, fortalezas, debilidades
4. **Recomendaciones**: Sugerencias de intervencion pedagogica

---

## Componentes Frontend

### Paginas y Componentes

| Componente | Path | Descripcion |
|------------|------|-------------|
| `TeacherProgressPage` | `apps/frontend/src/apps/teacher/pages/TeacherProgressPage.tsx` | Pagina de progreso con vista de estudiantes |
| `StudentDetailModal` | `apps/frontend/src/apps/teacher/components/monitoring/StudentDetailModal.tsx` | Modal con detalle de estudiante |
| `ClassProgressDashboard` | `apps/frontend/src/apps/teacher/components/progress/ClassProgressDashboard.tsx` | Dashboard de progreso de clase |

### Componentes de Analytics

| Componente | Path | Descripcion |
|------------|------|-------------|
| `LearningAnalyticsDashboard` | `apps/frontend/src/apps/teacher/components/analytics/LearningAnalyticsDashboard.tsx` | Dashboard de analytics embebido |
| `EngagementMetricsChart` | `apps/frontend/src/apps/teacher/components/analytics/EngagementMetricsChart.tsx` | Graficas de engagement |
| `PerformanceInsightsPanel` | `apps/frontend/src/apps/teacher/components/analytics/PerformanceInsightsPanel.tsx` | Panel de insights |

### Hooks

| Hook | Path | Descripcion |
|------|------|-------------|
| `useStudentProgress` | `apps/frontend/src/apps/teacher/hooks/useStudentProgress.ts` | Datos de progreso de estudiante |
| `useClassrooms` | `apps/frontend/src/apps/teacher/hooks/useClassrooms.ts` | Datos de classrooms |

---

## Servicios Backend

### Servicios Principales

| Servicio | Path | Descripcion |
|----------|------|-------------|
| `AnalyticsService` | `apps/backend/src/modules/teacher/services/analytics.service.ts` | Servicio de analytics con cache |
| `StudentProgressService` | `apps/backend/src/modules/teacher/services/student-progress.service.ts` | Progreso de estudiantes |
| `StudentRiskAlertService` | `apps/backend/src/modules/teacher/services/student-risk-alert.service.ts` | Alertas de riesgo |

### Metodos del AnalyticsService

```typescript
class AnalyticsService {
  // Obtener insights de estudiante
  async getStudentInsights(studentId: string): Promise<StudentInsightsResponseDto>;

  // Obtener estadisticas de clase
  async getClassroomStats(classroomId: string): Promise<ClassroomStatsDto>;

  // Obtener tendencias de rendimiento
  async getPerformanceTrends(studentId: string, period: string): Promise<TrendData>;

  // Obtener competencias por estudiante
  async getCompetencyAnalysis(studentId: string): Promise<CompetencyData>;
}
```

### Metodos del StudentProgressService

```typescript
class StudentProgressService {
  // Obtener progreso detallado
  async getStudentProgress(studentId: string): Promise<StudentProgressDto>;

  // Obtener progreso por modulo
  async getModuleProgress(studentId: string): Promise<ModuleProgressDto[]>;

  // Obtener historial de ejercicios
  async getExerciseHistory(studentId: string): Promise<ExerciseHistoryDto[]>;
}
```

### DTOs

| DTO | Path | Descripcion |
|-----|------|-------------|
| `StudentInsightsResponseDto` | `apps/backend/src/modules/teacher/dto/analytics.dto.ts` | Insights de estudiante |
| `StudentProgressDto` | `apps/backend/src/modules/teacher/dto/student-progress.dto.ts` | Progreso de estudiante |

---

## Tablas/Schemas de Base de Datos

### Schema: `progress_tracking`

| Tabla | Descripcion | Campos Clave |
|-------|-------------|--------------|
| `module_progress` | Progreso por modulo | user_id, module_id, completion_percentage, score |
| `exercise_submissions` | Entregas de ejercicios | user_id, exercise_id, score, submitted_at |
| `mastery_tracking` | Seguimiento de dominio | user_id, skill_id, mastery_level |

### Schema: `gamification_system`

| Tabla | Descripcion | Campos Clave |
|-------|-------------|--------------|
| `user_stats` | Estadisticas de usuario | user_id, total_xp, level, ml_coins |

### Schema: `social_features`

| Tabla | Descripcion | Campos Clave |
|-------|-------------|--------------|
| `classroom_members` | Miembros de aulas | classroom_id, student_id, is_active |

---

## APIs Endpoints

### Insights de Estudiante

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/v1/teacher/analytics/student/:studentId/insights` | GET | Obtener insights completos |
| `/api/v1/teacher/analytics/student/:studentId/progress` | GET | Obtener progreso |
| `/api/v1/teacher/analytics/student/:studentId/trends` | GET | Obtener tendencias |
| `/api/v1/teacher/analytics/student/:studentId/competencies` | GET | Obtener competencias |
| `/api/v1/teacher/analytics/student/:studentId/exercises` | GET | Historial de ejercicios |

### Response: GET /api/v1/teacher/analytics/student/:studentId/insights

```json
{
  "student_id": "uuid",
  "overall_score": 75,
  "modules_completed": 3,
  "modules_total": 5,
  "risk_level": "low",
  "strengths": [
    "Comprension literal excelente",
    "Consistencia en entregas"
  ],
  "weaknesses": [
    "Analisis critico necesita mejora"
  ],
  "recommendations": [
    "Asignar ejercicios de analisis critico adicionales",
    "Revisar recursos de modulo 4"
  ],
  "predictions": {
    "completion_probability": 0.85,
    "dropout_risk": 0.15,
    "expected_final_score": 78
  },
  "competencies": {
    "literal": { "score": 85, "level": "advanced" },
    "inferencial": { "score": 70, "level": "intermediate" },
    "critico": { "score": 55, "level": "beginner" },
    "digital": { "score": 75, "level": "intermediate" },
    "textual": { "score": 80, "level": "advanced" }
  },
  "mastery_summary": {
    "totalSkills": 25,
    "masteredSkills": 15,
    "needsReviewCount": 5,
    "averageMasteryLevel": 72.5
  }
}
```

### Response: GET /api/v1/teacher/analytics/student/:studentId/progress

```json
{
  "student_id": "uuid",
  "student_name": "Juan Perez",
  "overall_progress": 65,
  "modules": [
    {
      "module_id": 1,
      "module_name": "Modulo 1: Bases",
      "completion": 100,
      "average_score": 85,
      "exercises_completed": 6,
      "exercises_total": 6
    },
    {
      "module_id": 2,
      "module_name": "Modulo 2: Inferencia",
      "completion": 80,
      "average_score": 72,
      "exercises_completed": 4,
      "exercises_total": 5
    }
  ],
  "recent_activity": [
    {
      "date": "2026-01-27",
      "exercise": "Crucigrama M1",
      "score": 90,
      "time_spent_minutes": 15
    }
  ],
  "streak": {
    "current": 7,
    "max": 14
  }
}
```

---

## Flujos de Usuario

### Flujo 1: Ver Detalle de Estudiante

```
1. Profesor en dashboard de clase
2. Click en fila de estudiante en tabla
3. StudentDetailModal se abre
4. useStudentProgress(studentId) carga datos
5. Se muestran: perfil, metricas, graficos, historial
6. Profesor puede navegar entre tabs del modal
```

### Flujo 2: Analizar Competencias

```
1. En StudentDetailModal, seleccionar tab "Competencias"
2. AnalyticsService.getCompetencyAnalysis(studentId)
3. Renderizar radar chart con 5 competencias
4. Mostrar nivel de cada competencia
5. Mostrar comparacion con promedio de clase
```

### Flujo 3: Ver Predicciones

```
1. En StudentDetailModal, seccion "Predicciones"
2. Datos de predictions del insights response
3. Mostrar:
   - Probabilidad de completar curso
   - Riesgo de abandono (porcentaje)
   - Score final esperado
4. Indicadores visuales (verde/amarillo/rojo)
```

### Flujo 4: Revisar Recomendaciones

```
1. En StudentDetailModal, seccion "Recomendaciones"
2. Lista de acciones sugeridas
3. Boton "Asignar ejercicio recomendado"
4. Boton "Enviar mensaje al estudiante"
5. Boton "Agendar seguimiento"
```

---

## Dependencias

### Dependencias de Modulos

- `ProgressModule` - Datos de progreso
- `GamificationModule` - Estadisticas de gamificacion
- `SocialModule` - Datos de classrooms y membresía

### Dependencias de User Stories

- Depende de: `EAI-004` (Analytics basico)
- Habilita: `US-REP-003` (Analytics predictivo)

---

## Criterios de Aceptacion

### CA-01: Vista Detallada de Estudiante
- [x] Perfil con avatar, nombre, clase, ultimo acceso
- [x] Puntuacion general (0-100)
- [x] Ranking en clase
- [x] Racha de dias activos
- [x] Nivel actual

### CA-02: Graficos de Desempeno
- [x] Evolucion de calificaciones (linea temporal)
- [x] Radar chart de competencias
- [x] Barras de progreso por modulo
- [x] Comparacion con promedio de clase

### CA-03: Detalle por Actividad
- [x] Tabla: Actividad, Fecha, Intentos, Tiempo, Puntuacion
- [x] Filtros por modulo, tipo, resultado
- [x] Acceso a ver respuestas del estudiante

### CA-04: Alertas y Recomendaciones
- [x] Indicadores de riesgo (alto/medio/bajo)
- [x] Fortalezas identificadas
- [x] Areas de mejora
- [x] Sugerencias de intervencion

### CA-05: Competencias de Lectura
- [x] Score por competencia (literal, inferencial, critico, digital, textual)
- [x] Nivel de maestria por competencia
- [x] Visualizacion tipo radar chart

### CA-06: Predicciones
- [x] Probabilidad de completar
- [x] Riesgo de abandono
- [x] Score final esperado

---

## Notas de Implementacion

### Calculo de Riesgo

```typescript
// Logica de determinacion de nivel de riesgo
function calculateRiskLevel(metrics: StudentMetrics): 'low' | 'medium' | 'high' {
  const { completionRate, averageScore, daysSinceLastActivity, dropoutRisk } = metrics;

  if (dropoutRisk > 0.7 || daysSinceLastActivity > 14 || averageScore < 40) {
    return 'high';
  }
  if (dropoutRisk > 0.4 || daysSinceLastActivity > 7 || averageScore < 60) {
    return 'medium';
  }
  return 'low';
}
```

### Cache de Analytics

```typescript
// Cache de 5 minutos para metricas
@Cacheable({ ttl: 300, key: 'student-insights' })
async getStudentInsights(studentId: string): Promise<StudentInsightsResponseDto> {
  // ...calculo de insights
}
```

### Competencias

```typescript
interface CompetencyData {
  literal: { score: number; level: string };
  inferencial: { score: number; level: string };
  critico: { score: number; level: string };
  digital: { score: number; level: string };
  textual: { score: number; level: string };
}
```

---

## Referencias

- US-REP-001: Analytics Avanzado para Profesores (CA-03)
- AnalyticsService: `apps/backend/src/modules/teacher/services/analytics.service.ts`
- ET-TCH-005: Monitoreo de Progreso

---

**Creado:** 2026-01-27
**Sistema:** SIMCO (Sistema Indexado Modular por Contexto)
