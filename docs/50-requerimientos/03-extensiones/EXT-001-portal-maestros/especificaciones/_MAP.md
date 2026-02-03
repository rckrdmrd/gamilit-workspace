# Especificaciones Tecnicas - EXT-001

**EPIC:** EXT-001 - Portal de Maestros
**Ultima actualizacion:** 2026-01-27

---

## Resumen

Especificaciones tecnicas formales para el Portal de Maestros (Teacher Domain).

---

## Indice de Especificaciones Tecnicas (ET-TCH)

### Especificaciones del Dominio Teacher

| ID | Titulo | RF Relacionados | Estado | Tipo |
|----|--------|-----------------|--------|------|
| **[ET-TCH-001](./ET-TCH-001-dashboard-maestro.md)** | Dashboard Maestro | RF-TCH-000 | ✅ Implementado | Feature |
| **[ET-TCH-002](./ET-TCH-002-gestion-clases.md)** | Gestion de Clases y Estudiantes | RF-TCH-001a, RF-TCH-001b | ✅ Implementado | Feature |
| **[ET-TCH-003](./ET-TCH-003-asignaciones.md)** | Sistema de Asignaciones | RF-TCH-002a, RF-TCH-002b, RF-TCH-002c | ✅ Implementado | Feature |
| **[ET-TCH-004](./ET-TCH-004-revision-manual.md)** | Revision Manual y Calificacion | RF-TCH-003a, RF-TCH-003b | ✅ Implementado | Feature |
| **[ET-TCH-005](./ET-TCH-005-monitoreo-progreso.md)** | Monitoreo de Progreso | RF-TCH-004a, RF-TCH-004b | ✅ Implementado | Feature |
| **[ET-TCH-006](./ET-TCH-006-reportes.md)** | Sistema de Reportes | RF-TCH-005a, RF-TCH-005b, RF-TCH-005c | ✅ Implementado | Feature |
| **[ET-TCH-007](./ET-TCH-007-alertas.md)** | Alertas y Bloqueo | RF-TCH-006, RF-TCH-007 | ✅ Implementado | Feature |

---

## Especificaciones de Soporte

| ID | Titulo | Tipo | Estado | Resuelve |
|----|--------|------|--------|----------|
| **[SPEC-AT-RISK-001](./AT-RISK-LOGIC-STANDARD.md)** | Logica de Deteccion At-Risk | Estandar | ✅ Aprobado | INC-4 |
| **[SPEC-DASH-REP-001](./DASHBOARD-REPORTS-INTEGRATION.md)** | Integracion Dashboard-Reports | Integracion | ✅ Aprobado | GAP-3 |
| **[SPEC-PERF-TREND-001](./PERFORMANCE-TREND-SPEC.md)** | Performance Trend | Especificacion | ⏳ Propuesto | GAP-6 |
| **[SPEC-UAT-001](./USER-ACTIVITY-TRACKING-DEPENDENCY.md)** | Activity Tracking Dependency | Dependency | ⏳ Documentado | GAP-2 |
| **[API-CONTRACTS](./API-CONTRACTS.md)** | Contratos de API | Referencia | ✅ Documentado | - |

---

## Mapeo RF a ET

### RF-TCH-000: Dashboard Maestro
- **ET:** [ET-TCH-001](./ET-TCH-001-dashboard-maestro.md)
- **US:** US-PM-000
- **Componentes Frontend:** TeacherDashboard, TeacherDashboardHero, ClassroomsGrid
- **Servicios Backend:** TeacherDashboardService, AnalyticsService

### RF-TCH-001a/b: Gestion de Clases
- **ET:** [ET-TCH-002](./ET-TCH-002-gestion-clases.md)
- **US:** US-PM-001a, US-PM-001b
- **Componentes Frontend:** TeacherClasses, TeacherStudents, StudentMonitoringPanel
- **Servicios Backend:** TeacherClassroomsCrudService, StudentBlockingService

### RF-TCH-002a/b/c: Asignaciones
- **ET:** [ET-TCH-003](./ET-TCH-003-asignaciones.md)
- **US:** US-PM-002a, US-PM-002b, US-PM-002c
- **Componentes Frontend:** AssignmentWizard, AssignmentList, ResponsesTable
- **Servicios Backend:** AssignmentsService, ExerciseResponsesService

### RF-TCH-003a/b: Revision Manual
- **ET:** [ET-TCH-004](./ET-TCH-004-revision-manual.md)
- **US:** US-PM-003a, US-PM-003b
- **Componentes Frontend:** ReviewList, GradeSubmissionModal
- **Servicios Backend:** GradingService, ManualReviewService

### RF-TCH-004a/b: Monitoreo de Progreso
- **ET:** [ET-TCH-005](./ET-TCH-005-monitoreo-progreso.md)
- **US:** US-PM-004a, US-PM-004b, US-PM-005a, US-PM-005c
- **Componentes Frontend:** ClassProgressDashboard, LearningAnalyticsDashboard
- **Servicios Backend:** StudentProgressService, AnalyticsService

### RF-TCH-005a/b/c: Reportes
- **ET:** [ET-TCH-006](./ET-TCH-006-reportes.md)
- **US:** US-PM-005b
- **Componentes Frontend:** ReportGenerator, ReportTemplateSelector
- **Servicios Backend:** ReportsService, TeacherReportsService, ScheduledReportsService

### RF-TCH-006/007: Alertas y Bloqueo
- **ET:** [ET-TCH-007](./ET-TCH-007-alertas.md)
- **US:** US-PM-006, US-PM-007
- **Componentes Frontend:** InterventionAlertsPanel, SuspendStudentModal, AlertCard
- **Servicios Backend:** StudentBlockingService, InterventionAlertsService, StudentRiskAlertService

---

## Resumen de Implementacion

### Cobertura de RFs

| Dominio | RFs Cubiertos | ET Files | Estado |
|---------|---------------|----------|--------|
| Dashboard | 1 (RF-TCH-000) | ET-TCH-001 | ✅ Completo |
| Clases | 2 (RF-TCH-001a/b) | ET-TCH-002 | ✅ Completo |
| Asignaciones | 3 (RF-TCH-002a/b/c) | ET-TCH-003 | ✅ Completo |
| Revision | 2 (RF-TCH-003a/b) | ET-TCH-004 | ✅ Completo |
| Monitoreo | 2 (RF-TCH-004a/b) | ET-TCH-005 | ✅ Completo |
| Reportes | 3 (RF-TCH-005a/b/c) | ET-TCH-006 | ✅ Completo |
| Alertas | 2 (RF-TCH-006/007) | ET-TCH-007 | ✅ Completo |
| **TOTAL** | **15 RFs** | **7 ET Files** | ✅ 100% |

### Arquitectura de Backend

- **Modulo:** `apps/backend/src/modules/teacher/`
- **Controladores:** 8 controllers
- **Servicios:** 15+ services
- **Entidades:** 6 entities propias + imports de otros modulos

### Arquitectura de Frontend

- **App:** `apps/frontend/src/apps/teacher/`
- **Paginas:** 12 pages
- **Componentes:** 35+ components
- **Hooks:** 15+ hooks

---

## Descripcion de Especificaciones de Soporte

### SPEC-AT-RISK-001: Logica de Deteccion At-Risk

**Proposito:** Estandarizar la logica de deteccion de estudiantes "en riesgo".

**Formula Oficial:**
```
at_risk = (average_grade < 70%) OR (completion_rate < 50%)
```

**Afecta a:**
- ET-TCH-005 (Monitoreo de Progreso)
- ET-TCH-007 (Alertas)
- US-PM-004a, US-PM-005a

---

### SPEC-DASH-REP-001: Integracion Dashboard-Reports

**Proposito:** Documentar integracion entre Dashboard (ET-TCH-001) y Reports (ET-TCH-006).

**Incluye:**
- Quick Actions para generar reportes
- Navegacion desde ClassroomCards
- Query parameters soportados

---

### SPEC-PERF-TREND-001: Performance Trend (GAP-6)

**Estado:** ⏳ Propuesto (pendiente de implementacion)

**Proposito:** Especificar implementacion de `performance_trend[]` y `trend[]`.

---

### SPEC-UAT-001: Activity Tracking Dependency

**Estado:** ⏳ Documentado

**Proposito:** Definir sistema de seguimiento de actividad para engagement metrics.

---

## Referencias

- **TRACEABILITY.yml:** `../implementacion/TRACEABILITY.yml`
- **RF-TEACH-002:** `../requerimientos/RF-TEACH-002-assignment-system.md`
- **User Stories:** `../historias-usuario/`

---

**Generado:** 2026-01-27
**Sistema:** SIMCO (Sistema Indexado Modular por Contexto)
