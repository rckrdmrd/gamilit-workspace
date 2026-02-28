---
titulo: "Tareas -- EPIC-GAM-F1-PORTAL-ADMIN"
tipo: requerimiento-funcional
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# Tareas -- EPIC-GAM-F1-PORTAL-ADMIN

Estado: COMPLETADO | US: 0 (legacy archivado) | Modulos: 4 | Tareas: 12 | Subtareas: 28

> US originales archivadas (legacy v2). Tareas derivadas de EPIC.md: Portal admin con 4 modulos.

## Por Modulo

### Modulo Alertas — Sistema FSM, 7 endpoints

| Tarea | Subtareas | Horas Est. | Horas Real | Estado |
|-------|-----------|------------|------------|--------|
| Backend: FSM alertas + 7 endpoints (CRUD + transiciones estado + bulk) | Entity Alert, AlertService, FSM states, 7 controller methods | 10h | 10h | Done |
| Frontend: Panel alertas + tabla con filtros + detalle + acciones estado | AlertsList, AlertDetail, StatusBadge, BulkActions | 8h | 8h | Done |
| Testing: Unit (FSM transitions) + Integration (endpoints) | 6 tests | 3h | 3h | Done |

### Modulo Analiticas — 4 tabs, 7 graficos

| Tarea | Subtareas | Horas Est. | Horas Real | Estado |
|-------|-----------|------------|------------|--------|
| Backend: Endpoints agregacion (usuarios, contenido, gamificacion, sistema) | 4 query services, aggregation pipelines, date range filters | 10h | 10h | Done |
| Frontend: 4 tabs + 7 graficos (barras, lineas, pie, area) + filtros fecha | AnalyticsDashboard, 4 TabPanels, 7 chart components, DateRangePicker | 12h | 12h | Done |
| Testing: Unit (aggregations) + E2E (graficos renderizan) | 5 tests | 3h | 3h | Done |

### Modulo Progreso — 3 vistas, drill-down, CSV export

| Tarea | Subtareas | Horas Est. | Horas Real | Estado |
|-------|-----------|------------|------------|--------|
| Backend: Endpoints progreso (resumen, por aula, por estudiante) + CSV export | 3 query endpoints, drill-down service, CSV serializer | 8h | 8h | Done |
| Frontend: 3 vistas (overview, classroom, student) + drill-down nav + export button | ProgressOverview, ClassroomProgress, StudentProgress, ExportCSV | 10h | 10h | Done |
| Testing: Unit (CSV format) + Integration (drill-down chain) | 4 tests | 2h | 2h | Done |

### Modulo Monitoreo — 4 tabs, auto-refresh

| Tarea | Subtareas | Horas Est. | Horas Real | Estado |
|-------|-----------|------------|------------|--------|
| Backend: Endpoints monitoreo (sistema, BD, servicios, logs) + health | 4 health/status endpoints, log aggregation, service checks | 8h | 8h | Done |
| Frontend: 4 tabs (system, database, services, logs) + auto-refresh + status indicators | MonitoringDashboard, 4 TabPanels, StatusIndicator, auto-refresh hook | 10h | 10h | Done |
| Testing: Unit (status checks) + E2E (auto-refresh, tabs) | 4 tests | 2h | 2h | Done |

## Resumen

| Area | Horas Est. | Horas Real |
|------|------------|------------|
| Backend | 36h | 36h |
| Frontend | 40h | 40h |
| Testing | 14h | 14h |
| **Total** | **90h** | **90h** |

**SP Total:** 40 SP
