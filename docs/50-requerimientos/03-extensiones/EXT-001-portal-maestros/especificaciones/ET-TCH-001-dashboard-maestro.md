---
id: "ET-TCH-001"
title: "Dashboard Maestro - Especificacion Tecnica"
type: "Especificacion Tecnica"
status: "Implementado"
priority: "P0"
epic: "EXT-001"
module: "teacher"
labels: ["teacher", "dashboard", "analytics", "overview"]
created_date: "2026-01-27"
updated_date: "2026-01-27"
related_rf: ["RF-TCH-000"]
related_us: ["US-PM-000"]
---

# ET-TCH-001: Dashboard Maestro - Especificacion Tecnica

## Informacion General

| Campo | Valor |
|-------|-------|
| **ID** | ET-TCH-001 |
| **Epic** | EXT-001 - Portal de Maestros |
| **RF Relacionado** | RF-TCH-000 (Teacher Dashboard) |
| **US Relacionadas** | US-PM-000 |
| **Prioridad** | P0 - Critico |
| **Estado** | Implementado |

---

## Descripcion Tecnica

El Dashboard Maestro es el punto de entrada principal para usuarios con rol `teacher` o `admin_teacher`. Proporciona una vista panoramica de:

1. **Estadisticas globales**: Total de aulas, estudiantes, progreso promedio
2. **Resumen de classrooms**: Grid con metricas basicas por aula
3. **Actividad reciente**: Feed de ultimas 10 actividades
4. **Alertas pendientes**: Estudiantes en riesgo que requieren atencion
5. **Top performers**: Estudiantes con mejor desempeno
6. **Progreso por modulo**: Vista agregada del avance

---

## Componentes Frontend

### Pagina Principal

| Componente | Path | Descripcion |
|------------|------|-------------|
| `TeacherDashboard` | `apps/frontend/src/apps/teacher/pages/TeacherDashboard.tsx` | Pagina principal del dashboard |
| `TeacherLayout` | `apps/frontend/src/apps/teacher/layouts/TeacherLayout.tsx` | Layout base del portal maestro |

### Componentes de Dashboard

| Componente | Path | Descripcion |
|------------|------|-------------|
| `TeacherDashboardHero` | `apps/frontend/src/apps/teacher/components/dashboard/TeacherDashboardHero.tsx` | Hero section con estadisticas principales |
| `ClassroomCard` | `apps/frontend/src/apps/teacher/components/dashboard/ClassroomCard.tsx` | Card individual de classroom |
| `ClassroomsGrid` | `apps/frontend/src/apps/teacher/components/dashboard/ClassroomsGrid.tsx` | Grid de classrooms |
| `QuickActionsPanel` | `apps/frontend/src/apps/teacher/components/dashboard/QuickActionsPanel.tsx` | Panel de acciones rapidas |
| `PendingSubmissionsList` | `apps/frontend/src/apps/teacher/components/dashboard/PendingSubmissionsList.tsx` | Lista de entregas pendientes |
| `RecentAssignmentsList` | `apps/frontend/src/apps/teacher/components/dashboard/RecentAssignmentsList.tsx` | Lista de asignaciones recientes |
| `StudentAlerts` | `apps/frontend/src/apps/teacher/components/dashboard/StudentAlerts.tsx` | Panel de alertas de estudiantes |

### Componentes de Analytics Embebidos

| Componente | Path | Descripcion |
|------------|------|-------------|
| `LearningAnalyticsDashboard` | `apps/frontend/src/apps/teacher/components/analytics/LearningAnalyticsDashboard.tsx` | Dashboard de analytics embebido |
| `EngagementMetricsChart` | `apps/frontend/src/apps/teacher/components/analytics/EngagementMetricsChart.tsx` | Graficas de engagement |
| `PerformanceInsightsPanel` | `apps/frontend/src/apps/teacher/components/analytics/PerformanceInsightsPanel.tsx` | Panel de insights de rendimiento |

### Hooks

| Hook | Path | Descripcion |
|------|------|-------------|
| `useTeacherDashboard` | `apps/frontend/src/apps/teacher/hooks/useTeacherDashboard.ts` | Hook principal para datos del dashboard |
| `useClassrooms` | `apps/frontend/src/apps/teacher/hooks/useClassrooms.ts` | Hook para gestion de classrooms |
| `useClassroomsStats` | `apps/frontend/src/apps/teacher/hooks/useClassroomsStats.ts` | Hook para estadisticas de classrooms |

---

## Servicios Backend

### Servicios Principales

| Servicio | Path | Descripcion |
|----------|------|-------------|
| `TeacherDashboardService` | `apps/backend/src/modules/teacher/services/teacher-dashboard.service.ts` | Servicio principal del dashboard |
| `AnalyticsService` | `apps/backend/src/modules/teacher/services/analytics.service.ts` | Servicio de analytics con cache |
| `StudentProgressService` | `apps/backend/src/modules/teacher/services/student-progress.service.ts` | Servicio de progreso de estudiantes |

### Controladores

| Controlador | Path | Descripcion |
|-------------|------|-------------|
| `TeacherController` | `apps/backend/src/modules/teacher/controllers/teacher.controller.ts` | Controlador principal |

### DTOs

| DTO | Path | Descripcion |
|-----|------|-------------|
| `TeacherDashboardStatsDto` | `apps/backend/src/modules/teacher/dto/analytics.dto.ts` | Estadisticas del dashboard |
| `ClassroomProgressDto` | `apps/backend/src/modules/teacher/dto/classroom-progress.dto.ts` | Progreso por classroom |

---

## Tablas/Schemas de Base de Datos

### Schema: `social_features`

| Tabla | Descripcion | Uso |
|-------|-------------|-----|
| `classrooms` | Aulas del maestro | Listar aulas asignadas |
| `classroom_members` | Miembros de aulas | Contar estudiantes |
| `teacher_classroom` | Relacion maestro-aula | Filtrar por teacher_id |

### Schema: `progress_tracking`

| Tabla | Descripcion | Uso |
|-------|-------------|-----|
| `module_progress` | Progreso por modulo | Calcular avance |
| `exercise_submissions` | Entregas de ejercicios | Actividad reciente |
| `mastery_tracking` | Seguimiento de dominio | Metricas de maestria |

### Schema: `gamification_system`

| Tabla | Descripcion | Uso |
|-------|-------------|-----|
| `user_stats` | Estadisticas de usuarios | Top performers |

---

## APIs Endpoints

### Dashboard Principal

```
GET /api/v1/teacher/dashboard
```

**Response:**
```json
{
  "summary": {
    "totalClassrooms": 3,
    "totalStudents": 75,
    "averageProgress": 62.5,
    "pendingGrading": 12
  },
  "classrooms": [
    {
      "id": "uuid",
      "name": "Matematicas 6A",
      "studentCount": 25,
      "averageProgress": 65.5,
      "lastActivity": "2026-01-27T10:00:00Z"
    }
  ],
  "recentActivities": [...],
  "insights": {
    "bestPerformingClassroom": {...},
    "needsAttentionClassroom": {...}
  }
}
```

### Endpoints Relacionados

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/v1/teacher/dashboard/stats` | GET | Estadisticas resumidas |
| `/api/v1/teacher/dashboard/activities` | GET | Actividades recientes |
| `/api/v1/teacher/dashboard/alerts` | GET | Alertas de estudiantes |
| `/api/v1/teacher/dashboard/top-performers` | GET | Mejores estudiantes |
| `/api/v1/teacher/dashboard/module-progress` | GET | Progreso por modulo |

---

## Flujos de Usuario

### Flujo 1: Carga Inicial del Dashboard

```
1. Usuario accede a /teacher/dashboard
2. TeacherLayout verifica rol (teacher/admin_teacher)
3. useTeacherDashboard ejecuta fetchDashboardData()
4. API retorna datos en paralelo (stats, activities, alerts, performers, progress)
5. Componentes renderizan con datos reales
6. Loading states muestran SkeletonStats/SkeletonCard durante carga
```

### Flujo 2: Refresh de Datos

```
1. Usuario hace click en boton "Refresh"
2. useTeacherDashboard.refresh() se ejecuta
3. Todos los datos se re-fetachean
4. Estados se actualizan con nuevos datos
```

### Flujo 3: Navegacion a Classroom

```
1. Usuario hace click en ClassroomCard
2. Navegacion a /teacher/classrooms/:id
3. Carga detalle del classroom
```

---

## Dependencias

### Dependencias de Modulos

- `ProgressModule` - Para datos de progreso
- `NotificationsModule` - Para alertas
- `AuditModule` - Para tracking de eventos
- `CacheModule` - Para cache de analytics (TTL: 5 min)

### Dependencias de User Stories

- Depende de: `US-ADM-001` (Gestion de aulas)
- Habilita: `US-PM-004a`, `US-PM-005a`, `US-PM-005c` (Analytics avanzados)

---

## Criterios de Aceptacion

### CA-01: Vista General Funcional
- [x] Grid con todas las aulas del profesor visible
- [x] Cada aula muestra nombre, estudiantes, progreso, modulos
- [x] Navegacion a detalle de aula funciona

### CA-02: Resumen Global
- [x] Cards con metricas totales (aulas, estudiantes, progreso)
- [x] Insights de mejor/peor aula visible

### CA-03: Actividad Reciente
- [x] Feed de ultimas 10 actividades
- [x] Cada actividad muestra estudiante, aula, accion, timestamp

### CA-04: Performance
- [x] Tiempo de carga inicial < 2s
- [x] Cache de analytics (5 min TTL)
- [x] Loading states para UX fluido

### CA-05: Responsive
- [x] Layout adaptable a desktop/tablet
- [x] ClassroomGrid ajusta columnas automaticamente

---

## Notas de Implementacion

### Cache Strategy

```typescript
// Cache de 5 minutos para analytics
CacheModule.register({
  ttl: 300, // 5 minutes
  max: 100,
  isGlobal: false,
});
```

### Queries Paralelos

```typescript
const [statsData, activitiesData, alertsData, performersData, progressData] =
  await Promise.all([
    teacherApi.getDashboardStats(),
    teacherApi.getRecentActivities(10),
    teacherApi.getStudentAlerts(),
    teacherApi.getTopPerformers(5),
    teacherApi.getModuleProgressSummary(),
  ]);
```

---

## Referencias

- US-PM-000: Dashboard Maestro Base
- TRACEABILITY.yml: Mapeo de implementacion
- ADR-014: Nil-Safety Patterns

---

**Creado:** 2026-01-27
**Sistema:** SIMCO (Sistema Indexado Modular por Contexto)
