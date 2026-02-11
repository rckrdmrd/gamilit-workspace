# Tareas -- EPIC-GAM-F1-ANALYTICS

Estado: COMPLETADO | US: 6 | Tareas: 40 | Subtareas: 93

---

## Por US

### US-ANA-001: Dashboard de Clase Basico (8 SP, 32h)

**Backend (14.4h - 45%)**

| Tarea | Subtareas | Horas Est. | Estado |
|-------|-----------|------------|--------|
| B.1 Configuracion modulo TeacherAnalytics + TeacherGuard + DTOs | 4 | 2h | Done |
| B.2 Modelo de datos y repositorios (Classroom, Student, indices) | 5 | 3h | Done |
| B.3 Service: calculateClassMetrics, getLevelDistribution, getModuleCompletion, getModuleProgress, getRecentActivities | 6 | 4.5h | Done |
| B.4 Controller GET /classroom/:id/dashboard + validacion acceso + Swagger | 5 | 2.4h | Done |
| B.5 Cache Redis TTL 5min + query pagination | 4 | 1.6h | Done |
| B.6 Unit/integration tests (metrics, distribution, 200/403/404) | 4 | 0.9h | Done |

**Frontend (11.2h - 35%)**

| Tarea | Subtareas | Horas Est. | Estado |
|-------|-----------|------------|--------|
| F.1 teacherAnalyticsStore (Zustand) + API client | 4 | 2h | Done |
| F.2 ClassroomDashboard + useClassroomDashboard + DashboardSkeleton | 5 | 2.5h | Done |
| F.3 MetricsCards (4 cards: estudiantes, progreso, nivel, XP) | 4 | 2h | Done |
| F.4 Graficas Recharts (LevelDistribution, ModuleCompletionPie, ModuleProgressBar) | 6 | 3h | Done |
| F.5 RecentActivitiesList + formateo timestamp relativo | 4 | 1h | Done |
| F.6 Auto-refresh 5min + indicador ultima actualizacion | 3 | 0.7h | Done |

**Testing (4.8h - 15%)**

| Tarea | Subtareas | Horas Est. | Estado |
|-------|-----------|------------|--------|
| T.1 Unit tests componentes + hooks + edge cases | 4 | 2h | Done |
| T.2 E2E: dashboard datos correctos, graficas, navegacion | 4 | 1.5h | Done |
| T.3 Performance: carga <2s, datasets grandes, memory leaks | 3 | 0.8h | Done |
| T.4 Accesibilidad: contraste, teclado, screen reader | 3 | 0.5h | Done |

**Deploy (1.6h - 5%)**

| Tarea | Subtareas | Horas Est. | Estado |
|-------|-----------|------------|--------|
| D.1 Build produccion + lazy loading Recharts | 4 | 0.8h | Done |
| D.2 Deploy staging + smoke tests | 4 | 0.8h | Done |

### US-ANA-002: Tabla de Estudiantes con Metricas (7 SP, 28h)

**Backend (12.6h - 45%)**

| Tarea | Subtareas | Horas Est. | Estado |
|-------|-----------|------------|--------|
| B.1 StudentListQueryDto (page, limit, sortBy, order, search) | 3 | 1.5h | Done |
| B.2 Query builder: joins, LOWER LIKE search, sort dinamico, pagination | 5 | 4h | Done |
| B.3 Service getClassroomStudents + mapStudentToDto + edge cases | 5 | 3.5h | Done |
| B.4 Controller GET /classroom/:id/students + validacion + errors | 5 | 1.6h | Done |
| B.5 Indices (name, classroomId+name) + cache conteo | 3 | 1.2h | Done |
| B.6 Tests unitarios search/sort + integration pagination | 3 | 0.8h | Done |

**Frontend (9.8h - 35%)**

| Tarea | Subtareas | Horas Est. | Estado |
|-------|-----------|------------|--------|
| F.1 useStudentList hook con debounce 300ms | 4 | 2h | Done |
| F.2 StudentListTable + SearchBar + TableSkeleton + empty states | 4 | 2.5h | Done |
| F.3 SortableColumn con indicadores de orden | 3 | 2h | Done |
| F.4 StudentRow: ProgressBar colores, LevelBadge, LastActivity colores | 4 | 2h | Done |
| F.5 Pagination (Anterior/Siguiente) | 3 | 0.8h | Done |
| F.6 Navegacion a perfil + mobile responsive | 2 | 0.5h | Done |

**Testing + Deploy (5.6h - 20%)**

| Tarea | Subtareas | Horas Est. | Estado |
|-------|-----------|------------|--------|
| T.1 Unit tests + debounce + formateo | 3 | 1.8h | Done |
| T.2 E2E: lista, busqueda, sort, navegacion | 4 | 1.5h | Done |
| T.3 Performance: 50+ estudiantes, debounce | 2 | 0.9h | Done |
| D.1 Build + deploy + smoke tests | 3 | 1.4h | Done |

### US-ANA-003: Vista de Estudiante Individual (8 SP, 32h)

**Backend (12h - 37.5%)**

| Tarea | Subtareas | Horas Est. | Estado |
|-------|-----------|------------|--------|
| B.1 Service: getStudentBasicProfile + validateTeacherAccessToStudent | 3 | 3h | Done |
| B.2 Service: getStudentModuleProgress (por modulo, status) | 4 | 4h | Done |
| B.3 Service: getStudentRecentActivities (top 20) + getStudentTimeMetrics | 3 | 3h | Done |
| B.4 Controller GET /student/:id/profile + cache 2min | 3 | 2h | Done |

**Frontend (16h - 50%)**

| Tarea | Subtareas | Horas Est. | Estado |
|-------|-----------|------------|--------|
| F.1 StudentProfileView + useStudentProfile hook + ProfileSkeleton | 3 | 3h | Done |
| F.2 ProfileHeader (avatar, nivel, XP, progreso, ultima actividad) | 4 | 3h | Done |
| F.3 ModuleProgressSection + ModuleProgressCard (status colores) | 4 | 4h | Done |
| F.4 TimeMetricsSection (total, promedio, sesiones, ultima) | 3 | 2h | Done |
| F.5 RecentActivitiesSection + ActivityTimeline + ActivityItem | 3 | 2.5h | Done |
| F.6 Breadcrumb + navegacion anterior/siguiente estudiante | 2 | 1.5h | Done |

**Testing (4h - 12.5%)**

| Tarea | Subtareas | Horas Est. | Estado |
|-------|-----------|------------|--------|
| T.1 Unit + integration + E2E tests | 4 | 4h | Done |

### US-ANA-004: Reporte Basico de Progreso (6 SP, 24h)

**Backend (9.6h - 40%)**

| Tarea | Subtareas | Horas Est. | Estado |
|-------|-----------|------------|--------|
| B.1 Service: getProgressReport (summary + moduleProgress stats) | 4 | 4h | Done |
| B.2 Service: exportProgressReportCSV (UTF-8 BOM, escapar comas) | 3 | 2.5h | Done |
| B.3 Controller GET /progress-report + GET /progress-report/export | 3 | 2.1h | Done |
| B.4 Cache reporte 10min | 2 | 1h | Done |

**Frontend (10.8h - 45%)**

| Tarea | Subtareas | Horas Est. | Estado |
|-------|-----------|------------|--------|
| F.1 ProgressReportView + useProgressReport hook | 3 | 2.5h | Done |
| F.2 ReportHeader + SummarySection (4 cards) | 3 | 2.5h | Done |
| F.3 ModuleProgressTable (completados, en progreso, no iniciados, %) | 3 | 3h | Done |
| F.4 downloadProgressReportCSV (blob download) | 3 | 2.8h | Done |

**Testing (3.6h - 15%)**

| Tarea | Subtareas | Horas Est. | Estado |
|-------|-----------|------------|--------|
| T.1 Unit + integration + E2E (datos correctos, CSV valido, descarga) | 4 | 3.6h | Done |

### US-ANA-005: Tracking de Actividad (7 SP, 28h)

**Backend (12.6h - 45%)**

| Tarea | Subtareas | Horas Est. | Estado |
|-------|-----------|------------|--------|
| B.1 ActivityLog entity + ActivityFeedQueryDto (range, limit, offset) | 3 | 2h | Done |
| B.2 Service: getActivityFeed con calculateDateRange + pagination | 4 | 4h | Done |
| B.3 Service: getActivityStats (activeToday, completedToday, activityByDay) | 3 | 3h | Done |
| B.4 Controller GET /activity-feed + indice (classroomId, timestamp) | 3 | 2.6h | Done |
| B.5 Tests: dateRange, stats, pagination, filtros | 3 | 1h | Done |

**Frontend (9.8h - 35%)**

| Tarea | Subtareas | Horas Est. | Estado |
|-------|-----------|------------|--------|
| F.1 ActivityFeedView + estado (dateRange, offset, hasMore) | 3 | 2h | Done |
| F.2 ActivityHeader (badges activos/completados, Select rango, refresh) | 3 | 1.5h | Done |
| F.3 ActivityChart (barras por dia, 7 dias) | 2 | 1.5h | Done |
| F.4 ActivityTimeline + ActivityItem (4 tipos: completed, started, level_up, achievement) | 4 | 3h | Done |
| F.5 Auto-refresh 2min + load more + skeleton | 3 | 1.8h | Done |

**Testing + Deploy (5.6h - 20%)**

| Tarea | Subtareas | Horas Est. | Estado |
|-------|-----------|------------|--------|
| T.1 Unit + E2E (timeline, filtros, load more, auto-refresh) | 4 | 3h | Done |
| D.1 Build + deploy + smoke tests | 3 | 2.6h | Done |

### US-ANA-006: Identificacion de Estudiantes Rezagados (8 SP, 32h)

**Backend (12.8h - 40%)**

| Tarea | Subtareas | Horas Est. | Estado |
|-------|-----------|------------|--------|
| B.1 Service: analyzeStudentRisk (daysInactive, progress, riskLevel) | 4 | 4h | Done |
| B.2 Service: getAtRiskStudents (filter, sort criticos primero, summary) | 4 | 4h | Done |
| B.3 calculateRiskLevel (reglas: >7d o <30% = critico, 3-7d o 30-50% = warning) | 2 | 1.5h | Done |
| B.4 Controller GET /at-risk-students?filter + cache 5min | 3 | 2.3h | Done |
| B.5 Tests: calculateRiskLevel, summary, filtros, orden | 3 | 1h | Done |

**Frontend (14.4h - 45%)**

| Tarea | Subtareas | Horas Est. | Estado |
|-------|-----------|------------|--------|
| F.1 AtRiskStudentsView + useAtRiskStudents hook | 3 | 2h | Done |
| F.2 RiskSummary (3 cards: critico/warning/activo + alert) | 3 | 2h | Done |
| F.3 FilterBar (Todos/Criticos/Advertencias + ordenar por) | 3 | 2h | Done |
| F.4 StudentRiskCard (semaforo, factores, comparativa, acciones placeholder) | 4 | 4h | Done |
| F.5 StudentRiskDetailModal (factores, ultima actividad, modulos pendientes, comparativa) | 4 | 3h | Done |
| F.6 Empty state + navegacion a perfil | 2 | 1.4h | Done |

**Testing (4.8h - 15%)**

| Tarea | Subtareas | Horas Est. | Estado |
|-------|-----------|------------|--------|
| T.1 Unit: calculateRiskLevel, summary, filtros | 3 | 2h | Done |
| T.2 E2E: categorizacion, filtros, modal, navegacion, tooltips | 4 | 2.8h | Done |

---

## Resumen

| Area | Horas Est. | US Cubiertas |
|------|------------|--------------|
| Backend | 74h | 6/6 |
| Frontend | 72h | 6/6 |
| Testing | 22h | 6/6 |
| Deploy | 8h | 4/6 |
| **Total** | **176h** | **6/6** |

| Metrica | Valor |
|---------|-------|
| Total SP | 44 |
| Presupuesto | $22,000 MXN |
| Sprint | Sprint-1 (Mes 1) |
