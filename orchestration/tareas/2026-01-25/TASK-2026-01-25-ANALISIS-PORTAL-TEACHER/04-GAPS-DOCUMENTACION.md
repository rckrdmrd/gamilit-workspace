# 04-GAPS-DOCUMENTACION.md - Funcionalidades Sin Documentar

**Tarea:** TASK-2026-01-25-ANALISIS-PORTAL-TEACHER
**Fase:** FASE-1 - Auditoría de Coherencia
**Fecha:** 2026-01-25

---

## 1. Páginas Implementadas Sin User Story

Estas páginas están 100% implementadas pero no tienen User Story correspondiente:

| # | Página | Ruta | Funcionalidad | Acción Requerida |
|---|--------|------|---------------|------------------|
| 1 | TeacherExerciseResponsesPage | `/teacher/responses` | Análisis de respuestas de estudiantes con filtros avanzados, stats y modal de detalle | Crear US-PM-014 |
| 2 | TeacherReviewPanelPage | `/teacher/reviews` | Panel de revisión manual para módulos M3, M4, M5 con workflow completo | Crear US-PM-015 |
| 3 | TeacherMonitoringPage | `/teacher/monitoring` | Monitoreo en tiempo real de actividad de estudiantes | Crear US-PM-016 |
| 4 | TeacherContentPage | `/teacher/content` | Gestión de contenido educativo (wrapper) | Documentar como parte de US existente |
| 5 | TeacherContentManagement | (componente interno) | CRUD de contenido multimedia | Crear US-PM-017 |
| 6 | TeacherAlertsPage (vista) | `/teacher/alerts` | Vista de alertas de intervención (diferente de US-PM-007 que es config) | Crear US-PM-018 o renombrar US-PM-007 |

### Templates para Nuevas User Stories

#### US-PM-014: Vista de Respuestas de Ejercicios
```yaml
id: US-PM-014
title: "Vista de Respuestas de Ejercicios"
epic: EXT-001
status: Done (retroactive)
story_points: 5
description: |
  Como maestro, quiero ver todas las respuestas de mis estudiantes
  a los ejercicios para analizar su desempeño y patrones de error.
acceptance_criteria:
  - Ver lista paginada de intentos con filtros
  - Filtrar por classroom, estudiante, rango de fechas
  - Ver detalle de cada intento con respuestas
  - Estadísticas: total, correctas, incorrectas, score promedio
components:
  - TeacherExerciseResponsesPage.tsx
  - ResponsesTable.tsx
  - ResponseDetailModal.tsx
  - ResponseFilters.tsx
hooks:
  - useExerciseResponses
endpoints:
  - GET /teacher/attempts
  - GET /teacher/attempts/:id
```

#### US-PM-015: Panel de Revisión Manual
```yaml
id: US-PM-015
title: "Panel de Revisión Manual"
epic: EXT-001
status: Done (retroactive)
story_points: 8
description: |
  Como maestro, quiero revisar manualmente las respuestas de ejercicios
  de módulos 3, 4 y 5 que requieren evaluación cualitativa.
acceptance_criteria:
  - Ver cola de revisiones pendientes
  - Filtrar por módulo y estado
  - Iniciar, completar o devolver revisiones
  - Ver configuración de ejercicios con revisión manual
  - Estadísticas de revisiones
components:
  - TeacherReviewPanelPage.tsx
  - ReviewList.tsx
  - ReviewDetail.tsx
hooks:
  - useManualReviews
  - useManualReviewConfig
endpoints:
  - GET /teacher/reviews/pending
  - GET /teacher/reviews/stats
  - POST /teacher/reviews/:id/start
  - POST /teacher/reviews/:id/complete
```

---

## 2. Hooks Sin Documentación

Todos los 23 hooks del portal Teacher carecen de documentación formal:

| Hook | Descripción | API(s) | Prioridad Doc |
|------|-------------|--------|---------------|
| useTeacherDashboard | Stats, activities, alerts del dashboard | teacherApi | Alta |
| useClassrooms | CRUD de classrooms | classroomsApi | Alta |
| useClassroomsStats | Estadísticas agregadas | classroomsApi | Media |
| useClassroomData | Datos detallados de classroom | classroomsApi | Media |
| useClassroomRealtime | WebSocket monitoreo | WebSocket | Media |
| useStudentProgress | Progreso individual | studentProgressApi | Alta |
| useStudentMonitoring | Monitoreo de estudiantes | classroomsApi | Alta |
| useMasteryTracking | Tracking de dominio | analyticsApi | Baja |
| useAssignments | CRUD asignaciones | assignmentsApi | Alta |
| useExerciseResponses | Respuestas de ejercicios | exerciseResponsesApi | Alta |
| useGrading | Calificación | gradingApi | Alta |
| useAnalytics | Analytics de clase | analyticsApi | Alta |
| useStudentInsights | Insights individuales | studentProgressApi | Baja |
| useMissionStats | Stats de misiones | analyticsApi | Baja |
| useGrantBonus | Otorgar ML Coins | bonusCoinsApi | Media |
| useEconomyAnalytics | Analytics economía | analyticsApi | Media |
| useStudentsEconomy | Economía por estudiante | analyticsApi | Media |
| useAchievementsStats | Stats de logros | analyticsApi | Baja |
| useTeacherMessages | Mensajería | teacherMessagesApi | Alta |
| useInterventionAlerts | Alertas | interventionAlertsApi | Alta |
| useTeacherContent | Contenido educativo | teacherContentApi | Media |
| useManualReviews | Revisiones manuales | (directo) | Alta |
| useManualReviewConfig | Config revisiones | (directo) | Media |

**Acción:** Crear archivo `HOOKS-REFERENCE.md` con documentación de todos los hooks.

---

## 3. Componentes Sin Documentación

34 de 44 componentes (~77%) no tienen documentación formal:

### Alta Prioridad (Componentes Principales)

| Componente | Carpeta | Uso Principal |
|-----------|---------|---------------|
| StudentMonitoringPanel | monitoring/ | Dashboard, Monitoring page |
| ClassProgressDashboard | progress/ | Dashboard, Progress page |
| InterventionAlertsPanel | alerts/ | Dashboard, Alerts page |
| ImprovedAssignmentWizard | assignments/ | Assignments page |
| AssignmentCard | assignments/ | Assignments page |
| ReportGenerator | reports/ | Dashboard, Reports page |
| ResponsesTable | responses/ | Responses page |
| ReviewList | review-panel/ | Review page |
| ReviewDetail | review-panel/ | Review page |
| MessagesList | communication/ | Communication page |

### Media Prioridad (Componentes de Soporte)

| Componente | Carpeta | Uso |
|-----------|---------|-----|
| LearningAnalyticsDashboard | analytics/ | Dashboard tab |
| PerformanceInsightsPanel | analytics/ | Dashboard tab |
| ClassroomCard | dashboard/ | Classes page |
| ClassroomsGrid | dashboard/ | Classes page |
| StudentDetailModal | monitoring/ | Students page |
| SubmissionsModal | assignments/ | Assignments page |
| GradeSubmissionModal | dashboard/ | Assignments page |
| ParentCommunicationHub | collaboration/ | Dashboard tab |
| ResourceSharingPanel | collaboration/ | Dashboard tab |
| ConversationsList | communication/ | Communication page |

### Baja Prioridad (Componentes Auxiliares)

| Componente | Carpeta | Uso |
|-----------|---------|-----|
| AlertCard | alerts/ | Alerts panel |
| EngagementMetricsChart | analytics/ | Analytics page |
| AssignmentList | assignments/ | Legacy |
| AssignmentCreator | assignments/ | Legacy |
| PendingSubmissionsList | dashboard/ | Dashboard |
| QuickActionsPanel | dashboard/ | Dashboard |
| RecentAssignmentsList | dashboard/ | Dashboard |
| StudentAlerts | dashboard/ | Dashboard |
| TeacherDashboardHero | dashboard/ | Dashboard |
| CreateAssignmentModal | dashboard/ | Dashboard |
| CreateClassroomModal | dashboard/ | Dashboard |
| StudentStatusCard | monitoring/ | Monitoring |
| StudentPagination | monitoring/ | Monitoring |
| RefreshControl | monitoring/ | Monitoring |
| ModuleCompletionCard | progress/ | Progress |
| ProgressChart | progress/ | Progress |
| StudentProgressList | progress/ | Progress |
| ReportTemplateSelector | reports/ | Reports |
| ResponseDetailModal | responses/ | Responses |
| ResponseFilters | responses/ | Responses |
| MessageComposer | communication/ | Communication |
| MessageFilters | communication/ | Communication |
| AnnouncementForm | communication/ | Communication |
| FeedbackForm | communication/ | Communication |

**Acción:** Crear archivo `COMPONENTS-CATALOG.md` con documentación de componentes.

---

## 4. Endpoints Sin Cliente Frontend

El controlador `ManualReviewController` tiene 11 endpoints sin servicio frontend dedicado:

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/teacher/reviews/config/exercises` | GET | Config ejercicios con revisión manual |
| `/teacher/reviews/pending` | GET | Reviews pendientes (paginado) |
| `/teacher/reviews/pending/module/:moduleOrder` | GET | Reviews por módulo |
| `/teacher/reviews/stats` | GET | Estadísticas de reviews |
| `/teacher/reviews/my-reviews` | GET | Reviews del docente |
| `/teacher/reviews/:id` | GET | Review por ID |
| `/teacher/reviews` | POST | Crear review |
| `/teacher/reviews/:id` | PUT | Actualizar review |
| `/teacher/reviews/:id/start` | POST | Iniciar review |
| `/teacher/reviews/:id/complete` | POST | Completar review |
| `/teacher/reviews/:id/return` | POST | Devolver para corrección |

**Acción:** Crear archivo `manualReviewApi.ts` en `services/api/teacher/`.

---

## 5. Documentación de Arquitectura Incompleta

### ARQUITECTURA-TEACHER-PORTAL.md

**Páginas documentadas:** 12
**Páginas implementadas:** 18
**Faltantes:**
1. TeacherExerciseResponsesPage
2. TeacherReviewPanelPage
3. TeacherMonitoringPage
4. TeacherContentPage
5. TeacherNotificationPreferencesPage
6. TeacherContentManagement

**Acción:** Actualizar ARQUITECTURA-TEACHER-PORTAL.md a versión 2.0

### _MAP.md de EXT-001

**Issues:**
1. Conteo de User Stories incorrecto (dice 15, hay 21)
2. No incluye US-PM-008 a US-PM-013 en la tabla
3. Estados desactualizados

**Acción:** Actualizar _MAP.md con conteos correctos

---

## 6. API Contracts Sin Documentar

Los contratos entre backend y frontend no están documentados formalmente:

| Área | Endpoints | DTOs Backend | Tipos Frontend | Gap |
|------|-----------|--------------|----------------|-----|
| Dashboard | 5 | 8 | 5 | Parcial |
| Classrooms | 13 | 12 | 8 | Alto |
| Assignments | 16 | 10 | 6 | Alto |
| Analytics | 8 | 6 | 4 | Medio |
| Alerts | 7 | 5 | 3 | Medio |
| Communication | 8 | 8 | 6 | Bajo |
| Reviews | 11 | 4 | 12 | ✅ Resuelto |
| Reports | 17 | 10 | 8 | Medio |

**Acción:** Crear `API-CONTRACTS.md` con especificaciones de request/response.

---

## 7. Resumen de Acciones

| Prioridad | Acción | Tipo | Estimación |
|-----------|--------|------|------------|
| ~~P0~~ | ~~Crear manualReviewApi.ts~~ | ~~Código~~ | ~~2h~~ ✅ HECHO |
| P0 | Actualizar estado de US implementadas | Docs | 1h |
| P1 | Crear US-PM-014 a US-PM-018 (retroactivas) | Docs | 4h |
| P1 | Actualizar _MAP.md | Docs | 1h |
| P1 | Actualizar ARQUITECTURA.md v2.0 | Docs | 3h |
| P2 | Crear HOOKS-REFERENCE.md | Docs | 4h |
| P2 | Crear COMPONENTS-CATALOG.md | Docs | 6h |
| P2 | Crear API-CONTRACTS.md | Docs | 4h |

**Total estimado:** ~25 horas de trabajo

---

**Generado:** 2026-01-25
**Sistema:** SIMCO v4.3.0 + CAPVED
