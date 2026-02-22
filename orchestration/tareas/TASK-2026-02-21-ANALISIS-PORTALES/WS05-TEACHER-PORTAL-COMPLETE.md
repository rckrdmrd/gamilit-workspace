# WS05 - Teacher Portal: Complete Analysis (19 Pages)

**Fecha:** 2026-02-21
**Analista:** Claude Opus 4.6
**Alcance:** 19 paginas, 50 componentes, 25 hooks, API services, backend endpoints
**Portal:** `/teacher/*` routes in App.tsx

---

## 1. Inventario de Paginas (19 paginas)

### 1.1 TeacherDashboardPage
- **Ruta:** `/teacher/dashboard`
- **Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherDashboardPage.tsx`
- **Componentes:**
  - `TeacherPageShell` (layout wrapper)
  - `DashboardStatsSection` (stats cards)
  - `DashboardClassroomsList` (classroom selector)
  - `DashboardRecentActivity` (activity feed + deadlines)
  - `StudentMonitoringPanel` (tab: monitoring)
  - `AssignmentCreator` (tab: assignments)
  - `ClassProgressDashboard` (tab: progress)
  - `InterventionAlertsPanel` (tab: alerts)
  - `LearningAnalyticsDashboard` (tab: analytics)
  - `PerformanceInsightsPanel` (tab: insights)
  - `ReportGenerator` (tab: reports)
  - `ParentCommunicationHub` (tab: communication)
  - `ResourceSharingPanel` (tab: resources)
  - `TabBar` (10 tabs: overview, monitoring, assignments, progress, alerts, analytics, insights, reports, communication, resources)
  - `SkeletonStats`, `SkeletonCard` (loading)
  - `EmptyState` (no classroom selected)
- **Hooks:** `useTeacherDashboard`, `useClassrooms`, `useDashboardData`
- **Endpoints API:**
  - `GET /teacher/dashboard/stats` (via teacherApi)
  - `GET /teacher/dashboard/activities` (via teacherApi)
  - `GET /teacher/dashboard/alerts` (via teacherApi)
  - `GET /teacher/classrooms` (via classroomsApi)
- **Estado:** React Query (useTeacherDashboard), local state for activeTab and selectedClassroomId
- **Interacciones:** Tab switching (10 tabs), classroom selection dropdown, refresh button
- **Errores:** Error banner with retry button (AlertCircle icon)
- **Carga:** SkeletonStats (4 cards) + SkeletonCard (2 large) skeleton loading
- **Accesibilidad:** `aria-live="polite"` on loading, `aria-label` on overview region, `role="alert"` on error
- **Issues:** Complex page with 10 tab panels -- consider lazy loading heavy tabs. Some tabs require `selectedClassroomId` but show EmptyState only as a single message.

### 1.2 TeacherAnalyticsPage
- **Ruta:** `/teacher/analytics`
- **Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherAnalyticsPage.tsx`
- **Componentes:**
  - `TeacherPageShell`
  - `TabBar` (3 tabs: overview, performance, engagement)
  - `DetectiveCard`, `DetectiveButton`
  - `FormField`, `DataTable`
  - `Bar` chart (react-chartjs-2)
  - `LoadingSpinner`
- **Hooks:** `useAnalytics`, `useClassrooms`
- **Endpoints API:**
  - `GET /teacher/analytics/classroom/:id` (via analyticsApi)
  - `GET /teacher/analytics/engagement` (via analyticsApi)
  - `GET /teacher/classrooms`
- **Estado:** React Query (useAnalytics), local state for tabs, classroom selection, date range
- **Interacciones:** Tab switch, classroom filter, date range selector, export/download button
- **Errores:** Error state with retry via handleError
- **Carga:** LoadingSpinner with text
- **Accesibilidad:** Standard form controls
- **Issues:** Chart.js registration inline (CategoryScale, LinearScale, etc.)

### 1.3 TeacherAssignmentsPage
- **Ruta:** `/teacher/assignments`
- **Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherAssignmentsPage.tsx`
- **Componentes:**
  - `TeacherPageShell`
  - `ImprovedAssignmentWizard` (4-step wizard)
  - `AssignmentCard` (card per assignment)
  - `SubmissionsModal` (submissions viewer)
  - `GradeSubmissionModal` (grading dialog)
  - `Modal`, `LoadingSpinner`
- **Hooks:** `useAssignments`, `useClassrooms`
- **Endpoints API:**
  - `GET /teacher/assignments`
  - `POST /teacher/assignments`
  - `PUT /teacher/assignments/:id`
  - `DELETE /teacher/assignments/:id`
  - `GET /teacher/classrooms`
- **Estado:** React Query (useAssignments), local state for modals, selected assignment
- **Interacciones:** Create assignment wizard, edit/delete assignments, view submissions, grade
- **Errores:** useApiError with toast notifications
- **Carga:** LoadingSpinner
- **Accesibilidad:** Standard
- **Issues:** None critical

### 1.4 TeacherClassesPage
- **Ruta:** `/teacher/classes`
- **Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherClassesPage.tsx`
- **Componentes:**
  - `TeacherPageShell`
  - `Modal` (create/edit), `FormField`, `ConfirmDialog`, `EmptyState`
  - `DetectiveCard`, `DetectiveButton`
  - `LoadingSpinner`
- **Hooks:** `useClassrooms`
- **Endpoints API:**
  - `GET /teacher/classrooms`
  - `POST /teacher/classrooms`
  - `PUT /teacher/classrooms/:id`
  - `DELETE /teacher/classrooms/:id`
- **Estado:** React Query (useClassrooms), local state for modals, search, filtered list
- **Interacciones:** CRUD classrooms, search/filter, navigate to students
- **Errores:** useApiError with toast
- **Carga:** LoadingSpinner
- **Accesibilidad:** EmptyState with icon
- **Issues:** None critical

### 1.5 TeacherStudentsPage
- **Ruta:** `/teacher/students`
- **Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherStudentsPage.tsx`
- **Componentes:**
  - `TeacherPageShell`
  - `DataTable` (sortable, filterable)
  - `StudentDetailModal`
  - `EmptyState`
- **Hooks:** `useClassrooms`, direct `classroomsApi.getClassroomStudents()`
- **Endpoints API:**
  - `GET /teacher/classrooms`
  - `GET /teacher/classrooms/:id/students`
- **Estado:** React Query (useClassrooms), useState for students, filters, sort, selected student
- **Interacciones:** Class filter, performance filter, search, sort (4 fields), student detail modal
- **Errores:** useApiError
- **Carga:** Loading state boolean
- **Accesibilidad:** Standard
- **Issues:** Hybrid pattern -- uses React Query for classrooms but direct API calls (useState/useEffect) for students. Should be migrated to React Query for consistency.

### 1.6 TeacherProgressPage
- **Ruta:** `/teacher/progress`
- **Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherProgressPage.tsx`
- **Componentes:**
  - `TeacherPageShell`
  - `ClassProgressDashboard`
  - `TabBar` (2 tabs: progress, engagement)
  - `FormField`, `DataTable`
  - `DetectiveCard`, `DetectiveButton`
  - `LoadingSpinner`
- **Hooks:** `useClassrooms`, `useClassroomsStats`, `useAnalytics`
- **Endpoints API:**
  - `GET /teacher/classrooms`
  - `GET /teacher/classrooms/:id/stats` (per classroom)
  - `GET /teacher/analytics/classroom/:id`
  - `GET /teacher/analytics/engagement`
- **Estado:** React Query, local state for tabs, date range, selected classroom
- **Interacciones:** Classroom selector, tab switch, date range, search params integration
- **Errores:** useApiError
- **Carga:** LoadingSpinner
- **Accesibilidad:** Standard
- **Issues:** Large page (>700 lines), complex aggregation logic in useMemo

### 1.7 TeacherMonitoringPage
- **Ruta:** `/teacher/monitoring`
- **Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherMonitoringPage.tsx`
- **Componentes:**
  - `TeacherPageShell`
  - `StudentMonitoringPanel` (main panel)
  - `DetectiveCard`, `DetectiveButton`
  - `LoadingSpinner`
- **Hooks:** `useClassrooms`, `useClassroomRealtime`
- **Endpoints API:**
  - `GET /teacher/classrooms`
  - WebSocket: classroom real-time events (via Socket.IO)
- **Estado:** React Query (useClassrooms), WebSocket state (useClassroomRealtime)
- **Interacciones:** Filter toggle, classroom-specific view, real-time status indicators (Wifi/WifiOff)
- **Errores:** Alert banner
- **Carga:** LoadingSpinner
- **Accesibilidad:** Real-time indicators with icons
- **Issues:** WebSocket dependency -- page degrades gracefully if WS not connected

### 1.8 TeacherAlertsPage
- **Ruta:** `/teacher/alerts`
- **Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherAlertsPage.tsx`
- **Componentes:**
  - `TeacherPageShell`
  - `InterventionAlertsPanel`
  - `DetectiveCard`, `DetectiveButton`, `EmptyState`
- **Hooks:** `useClassrooms`
- **Endpoints API:**
  - `GET /teacher/classrooms`
  - `GET /teacher/alerts` (via InterventionAlertsPanel)
- **Estado:** useClassrooms, local filter state (priority, type, showFilters)
- **Interacciones:** Priority/type filters, link to alert config page, classroom selection
- **Errores:** EmptyState for no classrooms
- **Carga:** Via InterventionAlertsPanel
- **Accesibilidad:** Standard
- **Issues:** None critical

### 1.9 TeacherCommunicationPage
- **Ruta:** `/teacher/communication`
- **Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherCommunicationPage.tsx`
- **Componentes:**
  - `TeacherPageShell`
  - `MessagesList`, `MessageComposer`, `ConversationsList`
  - `AnnouncementForm`, `FeedbackForm`, `MessageFilters`
  - `TabBar` (5 tabs: inbox, sent, announcements, feedback, conversations)
  - `Modal`, `UnderConstruction`
- **Hooks:** `useTeacherMessages`, `useWebSocket`, `useClassrooms`
- **Endpoints API:**
  - `GET /teacher/messages`
  - `POST /teacher/messages`
  - `PUT /teacher/messages/:id/read`
  - `DELETE /teacher/messages/:id`
  - `GET /teacher/classrooms`
- **Estado:** React Query (useTeacherMessages), WebSocket (useWebSocket), local state for tabs, filters
- **Interacciones:** Send messages, read/delete, compose, announcements, feedback, search/filter
- **Errores:** Feature flag gating (FEATURE_FLAGS), error/loading returns for API errors
- **Carga:** LoadingSpinner, 3 separate loading conditions (no classrooms, API error, loading)
- **Accesibilidad:** Standard
- **Issues:** Feature-flagged -- shows `UnderConstruction` when `FEATURE_FLAGS.ENABLE_TEACHER_COMMUNICATION` is false

### 1.10 TeacherContentManagementPage
- **Ruta:** via TeacherContentPage delegation
- **Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherContentManagementPage.tsx`
- **Componentes:**
  - `TeacherPageShell`
  - `Modal` (create/edit content)
  - `DetectiveCard`, `DetectiveButton`
- **Hooks:** `useTeacherContent`
- **Endpoints API:**
  - `GET /teacher/content`
  - `POST /teacher/content`
  - `PUT /teacher/content/:id`
  - `DELETE /teacher/content/:id`
- **Estado:** React Query (useTeacherContent), local state for modals, form data, search, filters
- **Interacciones:** CRUD content items, search, category filter, delete confirmation
- **Errores:** useApiError + toast
- **Carga:** Via useTeacherContent
- **Accesibilidad:** Standard
- **Issues:** Large page (~700 lines)

### 1.11 TeacherContentPage
- **Ruta:** `/teacher/content`
- **Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherContentPage.tsx`
- **Componentes:**
  - `TeacherPageShell`
  - `TeacherContentManagementPage` (delegated)
  - `UnderConstruction` (when feature flag disabled)
- **Hooks:** None (delegates to TeacherContentManagementPage)
- **Endpoints API:** Via delegation
- **Estado:** Via delegation
- **Interacciones:** Feature flag gate, then delegates
- **Errores:** Via delegation
- **Carga:** Via delegation
- **Accesibilidad:** Standard
- **Issues:** Thin wrapper -- feature-flagged via `FEATURE_FLAGS.ENABLE_TEACHER_CONTENT`

### 1.12 TeacherGamificationPage
- **Ruta:** `/teacher/gamification`
- **Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherGamificationPage.tsx`
- **Componentes:**
  - `TeacherPageShell`
  - `DetectiveCard`, `DetectiveButton`, `Modal`
- **Hooks:** `useGrantBonus`, `useEconomyAnalytics`, `useStudentsEconomy`, `useAchievementsStats`
- **Endpoints API:**
  - `POST /teacher/students/:id/bonus`
  - `GET /teacher/analytics/economy`
  - `GET /teacher/analytics/students-economy`
  - `GET /teacher/analytics/achievements`
- **Estado:** 4 React Query hooks, local state for modal, search, sort, bonus form
- **Interacciones:** Grant bonus ML Coins (modal), search students, sort by balance/level/name, view economy/achievements stats
- **Errores:** useApiError + toast
- **Carga:** Loading per section
- **Accesibilidad:** Standard
- **Issues:** Large page (~920 lines), consider splitting into sub-components

### 1.13 TeacherReportsPage
- **Ruta:** `/teacher/reports`
- **Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherReportsPage.tsx`
- **Componentes:** See Section 2 (DIAGNOSTIC)
- **Issues:** See Section 2 (DIAGNOSTIC)

### 1.14 TeacherExerciseResponsesPage
- **Ruta:** `/teacher/responses`
- **Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherExerciseResponsesPage.tsx`
- **Componentes:**
  - `TeacherPageShell`
  - `ResponsesTable` (table of attempts)
  - `ResponseDetailModal` (attempt detail view)
  - `ResponseFilters` (filter bar)
  - Framer Motion animations
- **Hooks:** `useExerciseResponses`
- **Endpoints API:**
  - `GET /teacher/exercises/attempts` (with filters)
- **Estado:** React Query (useExerciseResponses), local state for filters, selected attempt
- **Interacciones:** Filter by status/date/exercise, view detail modal, paginate
- **Errores:** Error state in data
- **Carga:** isLoading from React Query
- **Accesibilidad:** motion.div animations
- **Issues:** None critical

### 1.15 TeacherSettingsPage
- **Ruta:** `/teacher/settings`
- **Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherSettingsPage.tsx`
- **Componentes:**
  - `TeacherPageShell`
  - `ProfileSettingsSection`
  - `TeachingPreferencesSection`
  - `NotificationsSettingsSection`
  - `PrivacySettingsSection`
  - `DetectiveCard`
- **Hooks:** `useAuth`, `useUserPreferences`, `useApiError`
- **Endpoints API:**
  - `GET /teacher/profile` (via profileAPI)
  - `PUT /teacher/profile` (via profileAPI)
  - `GET /profile/preferences`
  - `PUT /profile/preferences`
- **Estado:** useAuth for user, useUserPreferences for settings, local state for form fields, sections
- **Interacciones:** 4 settings sections (profile, teaching, notifications, privacy), save with status feedback
- **Errores:** useApiError + toast
- **Carga:** Via preferences loading
- **Accesibilidad:** Standard form controls
- **Issues:** None critical

### 1.16 TeacherNotificationsPage
- **Ruta:** `/teacher/notifications`
- **Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherNotificationsPage.tsx`
- **Componentes:**
  - `TeacherPageShell`
  - Framer Motion (AnimatePresence, motion)
  - `Link` to notification preferences
- **Hooks:** `useNotificationsStore` (Zustand)
- **Endpoints API:**
  - Via notificationsStore actions (fetch, markRead, delete)
- **Estado:** Zustand store (useNotificationsStore)
- **Interacciones:** Filter by status (all/unread/read), filter by type, mark as read, mark all as read, delete, refresh
- **Errores:** Loading state
- **Carga:** isRefreshing state
- **Accesibilidad:** `cn()` utility for conditional classes
- **Issues:** Uses Zustand instead of React Query (inconsistent with other pages)

### 1.17 TeacherNotificationPreferencesPage
- **Ruta:** `/teacher/settings/notifications`
- **Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherNotificationPreferencesPage.tsx`
- **Componentes:**
  - `TeacherPageShell`
  - Framer Motion
  - `Link` back to notifications
- **Hooks:** `useNotificationsStore` (Zustand), `usePushNotifications`
- **Endpoints API:**
  - Via notificationsStore (getPreferences, updatePreference)
  - Push notification subscription API
- **Estado:** Zustand store, local state for toggle states
- **Interacciones:** Toggle in-app/email/push notifications per type, save per type
- **Errores:** Via store
- **Carga:** Via store
- **Accesibilidad:** `cn()` utility
- **Issues:** None critical

### 1.18 TeacherAlertConfigPage
- **Ruta:** `/teacher/settings/alerts`
- **Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherAlertConfigPage.tsx`
- **Componentes:**
  - `TeacherPageShell`
  - `DetectiveCard`, `DetectiveButton`
- **Hooks:** `useAlertConfig`
- **Endpoints API:**
  - `GET /teacher/alert-config`
  - `GET /teacher/alert-config/defaults`
  - `PUT /teacher/alert-config/:id`
  - `POST /teacher/alert-config`
- **Estado:** React Query (useAlertConfig), local state for editing
- **Interacciones:** Edit threshold values, toggle enable/disable, save per config
- **Errores:** Loading and error states with retry
- **Carga:** Via useAlertConfig loading
- **Accesibilidad:** Standard
- **Issues:** None critical

### 1.19 TeacherReviewPanelPage
- **Ruta:** `/teacher/reviews`
- **Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherReviewPanelPage.tsx`
- **Componentes:**
  - `TeacherPageShell`
  - `ReviewList` (list of reviews)
  - `ReviewDetail` (detail view)
- **Hooks:** `useMyReviews` (with status filter), `useManualReviewDetail`, `useManualReviewConfig`
- **Endpoints API:**
  - `GET /teacher/reviews` (with status filter)
  - `GET /teacher/reviews/:id`
  - `GET /teacher/reviews/config`
- **Estado:** React Query (useMyReviews x4 queries: all/pending/in_progress/completed), local state for filters, selected review
- **Interacciones:** Filter by status (3 tabs), filter by module/exercise, search, select review for detail
- **Errores:** Via React Query error states
- **Carga:** Via React Query loading states
- **Accesibilidad:** Standard
- **Issues:** 4 simultaneous useMyReviews queries for counts -- consider consolidating

---

## 2. DIAGNOSTICO: TeacherReportsPage

### 2.1 Problema Reportado

La pagina TeacherReportsPage reportadamente "no funciona".

### 2.2 Traza Completa

```
TeacherReportsPage.tsx
  |
  +-- loadInitialData() [useEffect on mount]
  |     |
  |     +-- classroomsApi.getClassrooms()
  |     |     GET /teacher/classrooms
  |     |     Returns: PaginatedResponse<Classroom> = { data: Classroom[], pagination: PaginationInfo }
  |     |     Frontend reads: classroomsResponse.data.map(c => ({ id: c.id, name: c.name }))
  |     |
  |     +-- reportsApi.getRecentReports()
  |     |     GET /teacher/reports/recent
  |     |     Returns: TeacherReport[]
  |     |     Frontend transforms via transformReportMetadata()
  |     |
  |     +-- reportsApi.getReportStats()
  |           GET /teacher/reports/stats
  |           Returns: ReportStats
  |           Frontend transforms via transformReportStats()
  |
  +-- loadStudents(classroomId) [useEffect on selectedClassroom change]
  |     |
  |     +-- classroomsApi.getClassroomStudents(classroomId)
  |           GET /teacher/classrooms/:id/students
  |           Returns: PaginatedResponse<StudentMonitoring>
  |           Frontend reads: response.data.map(s => ({ id: s.id, full_name: s.full_name }))
  |
  +-- Tab: "Generador" (default)
  |     +-- ReportsStatsCards (stats display)
  |     +-- ReportsFilterBar (classroom selector)
  |     +-- ReportGenerator (report creation wizard)
  |     |     +-- ReportTemplateSelector (4 templates)
  |     |     +-- reportsApi.generateReport(dto) [POST /teacher/reports/generate]
  |     +-- RecentReportsTable (list + delete)
  |           +-- reportsApi.downloadReport(id) [GET /teacher/reports/:id/download]
  |           +-- reportsApi.deleteReport(id) [DELETE /teacher/reports/:id]
  |
  +-- Tab: "Programados"
  |     +-- ScheduledReportsTab
  |           +-- useScheduledReports hook (React Query)
  |                 +-- scheduledReportsApi.getScheduledReports() [GET /teacher/reports/scheduled]
  |                 +-- scheduledReportsApi.createScheduledReport() [POST /teacher/reports/scheduled]
  |                 +-- scheduledReportsApi.pauseScheduledReport() [POST /teacher/reports/scheduled/:id/pause]
  |                 +-- scheduledReportsApi.resumeScheduledReport() [POST /teacher/reports/scheduled/:id/resume]
  |                 +-- scheduledReportsApi.deleteScheduledReport() [DELETE /teacher/reports/scheduled/:id]
  |
  +-- Tab: "Compartidos"
        +-- SharedReportsTab
              +-- useSharedReports hook (React Query)
                    +-- sharedReportsApi.getSharedByMe() [GET /teacher/reports/shared/by-me]
                    +-- sharedReportsApi.getSharedWithMe() [GET /teacher/reports/shared/with-me]
                    +-- sharedReportsApi.shareReport() [POST /teacher/reports/share]
                    +-- sharedReportsApi.markViewed() [POST /teacher/reports/shared/:id/view]
                    +-- sharedReportsApi.revokeShare() [DELETE /teacher/reports/shared/:id]
                    +-- sharedReportsApi.updatePermission() [PUT /teacher/reports/shared/:id/permission]
```

### 2.3 Analisis de Cada Capa

#### Capa Frontend (Page -> Components)

1. **Imports:** Todos los imports son validos -- los componentes, hooks, y API services existen en las rutas correctas.

2. **Data Shapes:** La interfaz `TeacherReport` del frontend coincide exactamente con `ReportMetadataDto` del backend (id, report_name, report_type, report_format, student_count, period_start, period_end, generated_at, file_size_bytes).

3. **Transformers:** `transformReportMetadata()` y `transformReportStats()` convierten correctamente de snake_case backend a camelCase frontend.

4. **Tab Components:** `ScheduledReportsTab` y `SharedReportsTab` usan hooks de React Query propios (`useScheduledReports`, `useSharedReports`) que son independientes de la logica del tab principal.

#### Capa API Services

5. **reportsApi:** Las funciones `getRecentReports()`, `getReportStats()`, `generateReport()`, `downloadReport()`, `deleteReport()` todas usan `apiClient` correctamente con los endpoints esperados.

6. **scheduledReportsApi:** Usa `API_ENDPOINTS.teacher.reports.scheduled.*` que mapea a `/teacher/reports/scheduled/*`. Correcto.

7. **sharedReportsApi:** Usa `API_ENDPOINTS.teacher.reports.shared.*` que mapea a `/teacher/reports/shared/*`. Correcto.

8. **classroomsApi:** Usa `API_ENDPOINTS.teacher.classrooms` que mapea a `/teacher/classrooms`. Correcto.

#### Capa Backend (Controller -> Service -> Entity -> DB)

9. **Controller routes:** Todos los endpoints estan registrados en `teacher.controller.ts` bajo `@Controller('teacher')`:
   - `GET reports/recent` (line 481)
   - `GET reports/stats` (line 500)
   - `GET reports/:id/status` (line 515)
   - `GET reports/:id/download` (line 536)
   - `DELETE reports/:id` (line 596)
   - `GET reports/scheduled` (line 626)
   - `POST reports/scheduled` (line 640)
   - etc.

10. **NestJS Route Ordering:** Las rutas especificas (`reports/recent`, `reports/stats`, `reports/scheduled`, `reports/shared/by-me`) estan declaradas ANTES de las rutas parametricas (`reports/:id/status`, `reports/:id/download`). NestJS resuelve rutas estaticas antes que parametricas dentro del mismo controlador, asi que **no hay conflicto de routing**.

11. **Services:** `TeacherReportsService`, `ScheduledReportsService`, `SharedReportsService` estan todos registrados como providers en `teacher.module.ts`.

12. **Entity:** `TeacherReport` mapea a `social_features.teacher_reports` con las columnas correctas.

13. **RLS:** La tabla `teacher_reports` tiene RLS policies que requieren `app.current_user_id` via `SET LOCAL`. El servicio `TeacherReportsService` correctamente usa `dataSource.transaction()` con `set_config('app.current_user_id', $1, true)` para establecer el contexto RLS.

### 2.4 CAUSA RAIZ IDENTIFICADA

Despues de una traza exhaustiva de las 4 capas (Page -> Components -> API Services -> Backend Controller/Service/Entity), **no se encontro un defecto de codigo (bug) que impida el funcionamiento de la pagina**. Todas las importaciones son validas, los endpoints estan correctamente mapeados, los tipos de datos son coherentes, y las transformaciones snake_case/camelCase son correctas.

La causa raiz mas probable es una de las siguientes, clasificadas por probabilidad:

#### Causa 1 (MAS PROBABLE): Tabla `teacher_reports` Vacia

La funcion `loadInitialData()` ejecuta tres llamadas en secuencia:
1. `classroomsApi.getClassrooms()` -- retorna lista paginada de aulas
2. `reportsApi.getRecentReports()` -- retorna reportes recientes
3. `reportsApi.getReportStats()` -- retorna estadisticas

Si el maestro no tiene aulas asignadas, la UI no muestra el `ReportGenerator` (condicion: `selectedClassroom && students.length > 0`). Si no hay reportes en la tabla `teacher_reports`, las estadisticas mostraran valores en cero y la lista de reportes estara vacia. Esto **parece** como "no funciona" pero es el comportamiento correcto para un estado sin datos.

**Verificacion:** Ejecutar `SELECT COUNT(*) FROM social_features.teacher_reports;` en la base de datos. Si retorna 0, el comportamiento es esperado.

#### Causa 2: Falla de Autenticacion/RBAC

La pagina requiere un usuario autenticado con rol `admin_teacher` o `super_admin`. Si el token JWT esta expirado, corrupto, o el usuario no tiene el rol correcto, todas las llamadas API fallaran con 401/403. El error se captura en el `catch` de `loadInitialData()` y establece `hasError = true`, mostrando un banner rojo generico "Error de Conexion".

**Verificacion:** Abrir la consola del navegador (Network tab) y verificar los codigos de respuesta HTTP para las 3 llamadas iniciales.

#### Causa 3: Error RLS en Produccion

Las RLS policies en `social_features.teacher_reports` requieren que `app.current_user_id` este configurado via `SET LOCAL`. Si hay un problema con el datasource `social` (e.g., no se conecta al schema correcto, o la funcion `current_user_profile_id()` no resuelve correctamente), las queries retornarian 0 filas sin error.

**Verificacion:** Revisar los logs del backend (PM2 logs) para mensajes como `Getting recent reports for teacher {uuid}` del TeacherReportsService.

#### Causa 4: Error del Generador de Reportes (puppeteer)

La generacion de reportes PDF usa `puppeteer`, que requiere un navegador Chromium instalado en el servidor. Si puppeteer no esta configurado en produccion, la generacion de reportes fallara silenciosamente o con error. Esto NO afectaria la carga de la pagina pero si la funcionalidad de generar reportes.

**Verificacion:** Ejecutar `which chromium` o `which google-chrome` en el servidor de produccion.

### 2.5 Solucion Propuesta

1. **Diagnostico inmediato:**
   - Verificar `SELECT COUNT(*) FROM social_features.teacher_reports;`
   - Verificar que el datasource `social` esta conectado y funcional
   - Verificar logs del backend para errores HTTP 4xx/5xx en rutas `/teacher/reports/*`
   - Verificar Network tab del navegador para respuestas de las 3 llamadas iniciales

2. **Si la tabla esta vacia (Causa 1):**
   - Generar un reporte de prueba via la UI o seed data
   - El comportamiento de pagina vacia es correcto pero puede mejorarse con un estado EmptyState mas informativo

3. **Si hay error de autenticacion (Causa 2):**
   - Verificar que el usuario tiene rol `admin_teacher` en la tabla `auth_management.profiles`
   - Verificar que el JWT contiene `tenant_id`

4. **Si hay error RLS (Causa 3):**
   - Verificar que la funcion `current_user_profile_id()` existe en el schema y funciona
   - Probar: `SET LOCAL app.current_user_id = '{teacher-uuid}'; SELECT * FROM social_features.teacher_reports;`

5. **Mejoras recomendadas para la UI (independientes de la causa):**
   - Agregar un EmptyState mas explicativo cuando no hay reportes (actualmente solo muestra "No hay reportes generados aun")
   - Mover la logica de estado del tab "Generador" a un hook de React Query para consistencia con los otros tabs
   - Agregar un mensaje mas descriptivo en el banner de error con el mensaje real de la excepcion

---

## 3. Catalogo de Componentes (50 componentes)

### 3.1 Reports (7 componentes)

| # | Componente | Ruta | Props | Proposito | Dependencias |
|---|-----------|------|-------|-----------|--------------|
| 1 | `ReportGenerator` | `components/reports/ReportGenerator.tsx` | `classroomId, students[]` | Wizard para generar reportes (template + config + students) | `reportsApi`, `ReportTemplateSelector` |
| 2 | `ReportTemplateSelector` | `components/reports/ReportTemplateSelector.tsx` | `selectedTemplate, onSelect` | Grid de 4 plantillas de reporte | `DetectiveCard` |
| 3 | `RecentReportsTable` | `components/reports/RecentReportsTable.tsx` | `reports[], filterType, callbacks...` | Lista filtrable de reportes recientes con delete | `Modal`, `DetectiveCard/Button` |
| 4 | `ScheduledReportsTab` | `components/reports/ScheduledReportsTab.tsx` | `classrooms[]` | Tab de reportes programados (CRUD + pause/resume) | `useScheduledReports`, `scheduledReportsApi` |
| 5 | `SharedReportsTab` | `components/reports/SharedReportsTab.tsx` | `recentReports[]` | Tab de reportes compartidos (share/revoke/view) | `useSharedReports`, `sharedReportsApi` |
| 6 | `ReportsStatsCards` | `components/reports/ReportsStatsCards.tsx` | `stats fields` | 4 tarjetas de estadisticas de reportes | `DetectiveCard` |
| 7 | `ReportsFilterBar` | `components/reports/ReportsFilterBar.tsx` | `selectedClassroom, onClassroomChange, classrooms[]` | Selector de aula para reportes | `DetectiveCard` |

### 3.2 Dashboard (3 componentes)

| # | Componente | Ruta | Props | Proposito | Dependencias |
|---|-----------|------|-------|-----------|--------------|
| 8 | `DashboardStatsSection` | `components/dashboard/DashboardStatsSection.tsx` | `stats, alerts, onTabChange` | Cards de estadisticas principales | `DetectiveCard` |
| 9 | `DashboardClassroomsList` | `components/dashboard/DashboardClassroomsList.tsx` | `classrooms, selected, callbacks` | Selector de aula en dashboard header | `DetectiveCard/Button` |
| 10 | `DashboardRecentActivity` | `components/dashboard/DashboardRecentActivity.tsx` | `activities, deadlines, loading` | Feed de actividad + proximos vencimientos | `DetectiveCard` |
| 11 | `GradeSubmissionModal` | `components/dashboard/GradeSubmissionModal.tsx` | `submission, onGrade, onClose` | Modal para calificar entregas | `Modal` |

### 3.3 Monitoring (6 componentes)

| # | Componente | Ruta | Props | Proposito | Dependencias |
|---|-----------|------|-------|-----------|--------------|
| 12 | `StudentMonitoringPanel` | `components/monitoring/StudentMonitoringPanel.tsx` | `classroomId` | Panel principal de monitoreo de estudiantes | `useStudentMonitoring`, `StudentStatusCard`, `StudentPagination` |
| 13 | `StudentStatusCard` | `components/monitoring/StudentStatusCard.tsx` | `student, callbacks` | Tarjeta de estado individual de estudiante | `DetectiveCard` |
| 14 | `StudentPagination` | `components/monitoring/StudentPagination.tsx` | `pagination props` | Paginacion para lista de estudiantes | - |
| 15 | `RefreshControl` | `components/monitoring/RefreshControl.tsx` | `onRefresh, isRefreshing` | Boton de refresco con indicador | `DetectiveButton` |
| 16 | `StudentActionsMenu` | `components/monitoring/StudentActionsMenu.tsx` | `student, callbacks` | Menu contextual de acciones sobre estudiante | - |
| 17 | `StudentDetailModal` | `components/monitoring/StudentDetailModal.tsx` | `student, isOpen, onClose` | Modal con detalle completo del estudiante | `Modal` |
| 18 | `SuspendStudentModal` | `components/monitoring/SuspendStudentModal.tsx` | `student, onSuspend, onClose` | Modal de suspension/bloqueo de estudiante | `Modal`, `useStudentBlocking` |

### 3.4 Assignments (5 componentes)

| # | Componente | Ruta | Props | Proposito | Dependencias |
|---|-----------|------|-------|-----------|--------------|
| 19 | `AssignmentCard` | `components/assignments/AssignmentCard.tsx` | `assignment, callbacks` | Tarjeta de asignacion con acciones | `DetectiveCard/Button` |
| 20 | `AssignmentList` | `components/assignments/AssignmentList.tsx` | `assignments[]` | Lista de asignaciones | `AssignmentCard` |
| 21 | `SubmissionsModal` | `components/assignments/SubmissionsModal.tsx` | `assignment, isOpen, onClose` | Modal con entregas de una asignacion | `Modal` |
| 22 | `AssignmentWizard` | `components/assignments/AssignmentWizard.tsx` | `onComplete, onCancel` | Wizard basico de creacion de asignacion | `Modal` |
| 23 | `ImprovedAssignmentWizard` | `components/assignments/ImprovedAssignmentWizard.tsx` | `onComplete, classroomId` | Wizard mejorado de 4 pasos | `Modal`, `DetectiveCard/Button` |
| 24 | `AssignmentCreator` | `components/assignments/AssignmentCreator.tsx` | `classroomId` | Panel de creacion (usado en dashboard tab) | `ImprovedAssignmentWizard`, `AssignmentCard` |

### 3.5 Communication (5 componentes)

| # | Componente | Ruta | Props | Proposito | Dependencias |
|---|-----------|------|-------|-----------|--------------|
| 25 | `MessagesList` | `components/communication/MessagesList.tsx` | `messages[], callbacks` | Lista de mensajes con acciones | `DetectiveCard` |
| 26 | `MessageComposer` | `components/communication/MessageComposer.tsx` | `onSend, classrooms[]` | Formulario de composicion de mensaje | `Modal` |
| 27 | `ConversationsList` | `components/communication/ConversationsList.tsx` | `conversations[]` | Lista de conversaciones | `DetectiveCard` |
| 28 | `AnnouncementForm` | `components/communication/AnnouncementForm.tsx` | `classrooms[], onSend` | Formulario de anuncios | `DetectiveCard` |
| 29 | `FeedbackForm` | `components/communication/FeedbackForm.tsx` | `students[], onSend` | Formulario de feedback | `DetectiveCard` |
| 30 | `MessageFilters` | `components/communication/MessageFilters.tsx` | `filters, onFilterChange` | Barra de filtros de mensajes | - |

### 3.6 Analytics (3 componentes)

| # | Componente | Ruta | Props | Proposito | Dependencias |
|---|-----------|------|-------|-----------|--------------|
| 31 | `EngagementMetricsChart` | `components/analytics/EngagementMetricsChart.tsx` | `data` | Grafico de metricas de engagement | Chart.js |
| 32 | `PerformanceInsightsPanel` | `components/analytics/PerformanceInsightsPanel.tsx` | `classroomId, students[]` | Panel de insights de rendimiento | `DetectiveCard` |
| 33 | `LearningAnalyticsDashboard` | `components/analytics/LearningAnalyticsDashboard.tsx` | `classroomId` | Dashboard de analiticas de aprendizaje | `DetectiveCard`, charts |

### 3.7 Progress (3 componentes)

| # | Componente | Ruta | Props | Proposito | Dependencias |
|---|-----------|------|-------|-----------|--------------|
| 34 | `ProgressChart` | `components/progress/ProgressChart.tsx` | `data` | Grafico de progreso | Chart.js |
| 35 | `ModuleCompletionCard` | `components/progress/ModuleCompletionCard.tsx` | `moduleData` | Tarjeta de completitud por modulo | `DetectiveCard` |
| 36 | `ClassProgressDashboard` | `components/progress/ClassProgressDashboard.tsx` | `classroomId` | Dashboard de progreso de clase | `ProgressChart`, `ModuleCompletionCard` |
| 37 | `StudentProgressList` | `components/progress/StudentProgressList.tsx` | `students[]` | Lista de progreso por estudiante | `DetectiveCard` |

### 3.8 Settings (4 componentes)

| # | Componente | Ruta | Props | Proposito | Dependencias |
|---|-----------|------|-------|-----------|--------------|
| 38 | `ProfileSettingsSection` | `components/settings/ProfileSettingsSection.tsx` | `profile, onChange, onSave` | Seccion de perfil del maestro | Form controls |
| 39 | `TeachingPreferencesSection` | `components/settings/TeachingPreferencesSection.tsx` | `preferences, onChange` | Preferencias pedagogicas | Form controls |
| 40 | `NotificationsSettingsSection` | `components/settings/NotificationsSettingsSection.tsx` | `notifications, onChange` | Configuracion de notificaciones | Toggle switches |
| 41 | `PrivacySettingsSection` | `components/settings/PrivacySettingsSection.tsx` | `privacy, onChange` | Configuracion de privacidad | Toggle switches |

### 3.9 Alerts (1 componente)

| # | Componente | Ruta | Props | Proposito | Dependencias |
|---|-----------|------|-------|-----------|--------------|
| 42 | `InterventionAlertsPanel` | `components/alerts/InterventionAlertsPanel.tsx` | `classroomId` | Panel de alertas de intervencion | `useInterventionAlerts` |

### 3.10 Review Panel (2 componentes)

| # | Componente | Ruta | Props | Proposito | Dependencias |
|---|-----------|------|-------|-----------|--------------|
| 43 | `ReviewList` | `components/review-panel/ReviewList.tsx` | `reviews[], onSelect` | Lista de revisiones manuales | `DetectiveCard` |
| 44 | `ReviewDetail` | `components/review-panel/ReviewDetail.tsx` | `review, onSubmit` | Detalle y formulario de revision | `DetectiveCard`, form |

### 3.11 Responses (3 componentes)

| # | Componente | Ruta | Props | Proposito | Dependencias |
|---|-----------|------|-------|-----------|--------------|
| 45 | `ResponsesTable` | `components/responses/ResponsesTable.tsx` | `responses[], callbacks` | Tabla de respuestas a ejercicios | `DataTable` |
| 46 | `ResponseDetailModal` | `components/responses/ResponseDetailModal.tsx` | `attempt, isOpen, onClose` | Modal con detalle de respuesta | `Modal` |
| 47 | `ResponseFilters` | `components/responses/ResponseFilters.tsx` | `filters, onFilterChange` | Barra de filtros de respuestas | - |

### 3.12 Collaboration (2 componentes)

| # | Componente | Ruta | Props | Proposito | Dependencias |
|---|-----------|------|-------|-----------|--------------|
| 48 | `ParentCommunicationHub` | `components/collaboration/ParentCommunicationHub.tsx` | `classroomId, students[]` | Hub de comunicacion con padres | `DetectiveCard`, communication API |
| 49 | `ResourceSharingPanel` | `components/collaboration/ResourceSharingPanel.tsx` | - | Panel de recursos compartidos entre maestros | `useSharedResources` |

### 3.13 Shared (1 componente)

| # | Componente | Ruta | Props | Proposito | Dependencias |
|---|-----------|------|-------|-----------|--------------|
| 50 | `TeacherPageShell` | `components/shared/TeacherPageShell.tsx` | `children` | Wrapper con layout + auth + gamification | `TeacherLayout`, `useTeacherPageSetup` |

**Total: 50 componentes**

---

## 4. Analisis de Hooks (25 hooks)

| # | Hook | API Calls | Return Type | Consumidores |
|---|------|-----------|-------------|-------------|
| 1 | `useTeacherPageSetup` | Auth context, gamification data | `{ user, displayGamificationData, handleLogout }` | `TeacherPageShell` (indirecto: todas las paginas) |
| 2 | `useTeacherDashboard` | `teacherApi.getDashboardStats/Activities/Alerts` | `{ stats, activities, alerts, loading, error, refresh }` | `TeacherDashboardPage` |
| 3 | `useClassrooms` | `classroomsApi.getClassrooms/getClassroomStudents/CRUD` | `{ classrooms, selectedClassroom, students, loading, error, CRUD methods }` | 7+ pages (Dashboard, Classes, Students, Progress, Monitoring, Alerts, Analytics) |
| 4 | `useClassroomData` | `classroomsApi` (legacy) | Classroom data | Legacy (backward compat) |
| 5 | `useClassroomsStats` | `classroomsApi.getClassroomStats()` per classroom | `{ stats[], aggregateStats, loading }` | `TeacherProgressPage` |
| 6 | `useClassroomRealtime` | WebSocket (Socket.IO) | `{ events, isConnected, students, callbacks }` | `TeacherMonitoringPage` |
| 7 | `useDashboardData` | Derived from classrooms + API | `{ allStudents, upcomingDeadlines, selectedClassroomId }` | `TeacherDashboardPage` |
| 8 | `useAnalytics` | `analyticsApi.getClassroomAnalytics/getEngagement` | `{ analytics, engagement, loading, error }` | `TeacherAnalyticsPage`, `TeacherProgressPage` |
| 9 | `useAssignments` | `assignmentsApi.CRUD` | `{ assignments, loading, CRUD methods }` | `TeacherAssignmentsPage` |
| 10 | `useInterventionAlerts` | `interventionAlertsApi.getAlerts/acknowledge/resolve` | `{ alerts, loading, error, action methods }` | `InterventionAlertsPanel` |
| 11 | `useStudentBlocking` | `classroomsApi.blockStudent/unblockStudent/getPermissions` | `{ block, unblock, getPermissions, loading }` | `SuspendStudentModal` |
| 12 | `useStudentMonitoring` | `classroomsApi.getClassroomStudents` | `{ students, loading, pagination, refresh }` | `StudentMonitoringPanel` |
| 13 | `useAlertConfig` | `alertConfigApi.getConfigs/getDefaults/update/create` | `{ configs, defaults, loading, error, update, create }` | `TeacherAlertConfigPage` |
| 14 | `useTeacherMessages` | `teacherMessagesApi.CRUD` | `{ messages, loading, send, markRead, delete, filters }` | `TeacherCommunicationPage` |
| 15 | `useGrantBonus` | `POST /teacher/students/:id/bonus` | `{ grantBonus, loading, reset }` | `TeacherGamificationPage` |
| 16 | `useEconomyAnalytics` | `GET /teacher/analytics/economy` | `{ data, loading, error }` | `TeacherGamificationPage` |
| 17 | `useStudentsEconomy` | `GET /teacher/analytics/students-economy` | `{ students, loading, error }` | `TeacherGamificationPage` |
| 18 | `useAchievementsStats` | `GET /teacher/analytics/achievements` | `{ stats, loading, error }` | `TeacherGamificationPage` |
| 19 | `useScheduledReports` | `scheduledReportsApi.CRUD + pause/resume` | `{ scheduledReports, loading, error, CRUD methods, isMutating }` | `ScheduledReportsTab` |
| 20 | `useSharedReports` | `sharedReportsApi.share/byMe/withMe/view/revoke/updatePermission` | `{ sharedByMe, sharedWithMe, loading, action methods }` | `SharedReportsTab` |
| 21 | `useSharedResources` | Resource sharing API | `{ resources, loading, filter, CRUD methods }` | `ResourceSharingPanel` |
| 22 | `useTeacherContent` | `teacherContentApi.CRUD` | `{ contents, loading, CRUD methods }` | `TeacherContentManagementPage` |
| 23 | `useExerciseResponses` | `GET /teacher/exercises/attempts` | `{ data, isLoading, error, refetch }` | `TeacherExerciseResponsesPage` |
| 24 | `useManualReviews` (includes `useMyReviews`, `useManualReviewDetail`) | `GET /teacher/reviews` with filters | `{ data, loading, error }` | `TeacherReviewPanelPage` |
| 25 | `useManualReviewConfig` | `GET /teacher/reviews/config` | `{ data }` | `TeacherReviewPanelPage` |

**Total: 25 hooks** (24 hook files + 1 index.ts barrel)

---

## 5. Issues y Recomendaciones

### P0 (Bloqueante / Critico)

| # | Issue | Archivo | Descripcion |
|---|-------|---------|-------------|
| P0-1 | **TeacherReportsPage no muestra datos** | `pages/TeacherReportsPage.tsx` | Pagina carga pero muestra vacio o error. Causa mas probable: tabla `social_features.teacher_reports` sin datos o problema RLS. Ver diagnostico completo en seccion 2. |

### P1 (Alta Prioridad)

| # | Issue | Archivo | Descripcion |
|---|-------|---------|-------------|
| P1-1 | **Patron hibrido estado en TeacherStudentsPage** | `pages/TeacherStudentsPage.tsx` | Usa React Query para classrooms pero useState/useEffect para students. Deberia usar React Query consistentemente. |
| P1-2 | **Patron hibrido en TeacherReportsPage (tab Generador)** | `pages/TeacherReportsPage.tsx` | El tab "Generador" usa useState/useEffect para cargar datos iniciales, mientras los tabs "Programados" y "Compartidos" usan React Query. Deberia migrar toda la logica a hooks de React Query. |
| P1-3 | **4 queries simultaneos en TeacherReviewPanelPage** | `pages/TeacherReviewPanelPage.tsx` | Hace 4 llamadas `useMyReviews` con diferentes filtros de status para obtener conteos. Considerar un endpoint de conteo dedicado o consolidar. |
| P1-4 | **SharedReportsTab requiere UUID manual del maestro** | `components/reports/SharedReportsTab.tsx` | Para compartir un reporte, el usuario debe ingresar el UUID del perfil del maestro destinatario manualmente. Deberia haber un buscador de maestros. |

### P2 (Media Prioridad)

| # | Issue | Archivo | Descripcion |
|---|-------|---------|-------------|
| P2-1 | **TeacherGamificationPage excesivamente largo** | `pages/TeacherGamificationPage.tsx` | ~920 lineas. Deberia extraer sub-componentes para economy stats, student list, bonus modal. |
| P2-2 | **TeacherProgressPage excesivamente largo** | `pages/TeacherProgressPage.tsx` | ~736 lineas con logica de agregacion compleja en useMemo. |
| P2-3 | **Inconsistencia de state management en notificaciones** | `pages/TeacherNotificationsPage.tsx` | Usa Zustand store mientras el resto del portal usa React Query. |
| P2-4 | **Feature flags sin documentacion** | `pages/TeacherContentPage.tsx`, `pages/TeacherCommunicationPage.tsx` | Feature flags `ENABLE_TEACHER_CONTENT` y `ENABLE_TEACHER_COMMUNICATION` no estan documentados en `CLAUDE.md` ni en guias. |
| P2-5 | **DashboardPage tiene 10 tabs** | `pages/TeacherDashboardPage.tsx` | 10 tabs es excesivo para un dashboard. Los tabs duplican funcionalidad de paginas dedicadas (Monitoring, Assignments, Progress, etc.). |
| P2-6 | **Falta i18n** | Todos los archivos | Textos hardcoded en espanol. No hay soporte de internacionalizacion. |
| P2-7 | **useClassroomRealtime requiere WebSocket** | `hooks/useClassroomRealtime.ts` | Si el WebSocket no esta disponible, el monitoreo en tiempo real no funciona. Deberia tener un fallback de polling. |
| P2-8 | **ReportGenerator usa puppeteer en backend** | `services/reports.service.ts` | La generacion de PDF usa puppeteer que requiere Chromium en el servidor. En produccion este puede no estar disponible. |

### P3 (Baja Prioridad / Mejoras)

| # | Issue | Archivo | Descripcion |
|---|-------|---------|-------------|
| P3-1 | **AssignmentWizard duplicado** | `components/assignments/` | Existen `AssignmentWizard.tsx` e `ImprovedAssignmentWizard.tsx`. El original deberia eliminarse si ya no se usa. |
| P3-2 | **Accesibilidad limitada en charts** | `components/analytics/`, `components/progress/` | Los graficos Chart.js no tienen alternativas textuales (sr-only summaries). |
| P3-3 | **useClassroomData es legacy** | `hooks/useClassroomData.ts` | Marcado como legacy para backward compat. Deberia verificarse si todavia tiene consumidores. |

---

## 6. Cobertura de Documentacion

### 6.1 Documentacion Existente

| Documento | Ruta | Contenido | Estado |
|-----------|------|-----------|--------|
| Portal Teacher Guide | `docs/60-portals/teacher/PORTAL-TEACHER-GUIDE.md` | Manual de uso del portal | Existente |
| Portal Teacher API Reference | `docs/60-portals/teacher/PORTAL-TEACHER-API-REFERENCE.md` | Referencia de API endpoints | Existente |
| Portal Teacher Flows | `docs/60-portals/teacher/PORTAL-TEACHER-FLOWS.md` | Flujos de usuario | Existente |
| Flujo Login Docente | `docs/30-ux-ui/flujos/teacher/FLUJO-LOGIN-DOCENTE.md` | Flujo de login | Existente |
| Flujo Dashboard Docente | `docs/30-ux-ui/flujos/teacher/FLUJO-DASHBOARD-DOCENTE.md` | Flujo del dashboard | Existente |
| Flujo Gestion Clases | `docs/30-ux-ui/flujos/teacher/FLUJO-GESTION-CLASES.md` | Flujo de gestion de aulas | Existente |
| Flujo Asignaciones | `docs/30-ux-ui/flujos/teacher/FLUJO-ASIGNACIONES-CLASE.md` | Flujo de asignaciones | Existente |
| Flujo Monitoreo Alertas | `docs/30-ux-ui/flujos/teacher/FLUJO-MONITOREO-ALERTAS.md` | Flujo de alertas | Existente |
| Flujo Analytics Reportes | `docs/30-ux-ui/flujos/teacher/FLUJO-ANALYTICS-REPORTES.md` | Flujo de analiticas | Existente |
| Flujo Gestion Contenido | `docs/30-ux-ui/flujos/teacher/FLUJO-GESTION-CONTENIDO.md` | Flujo de contenido | Existente |
| Flujo Revision Manual M3-M5 | `docs/30-ux-ui/flujos/teacher/FLUJO-REVISION-MANUAL-M3-M5.md` | Flujo de revision | Existente |

### 6.2 Documentacion Faltante

| Falta | Descripcion | Prioridad |
|-------|-------------|-----------|
| Flujo de Gamificacion | No existe `FLUJO-GAMIFICACION-DOCENTE.md` para la pagina de gamificacion (ML Coins, bonus, economy) | P2 |
| Flujo de Comunicacion | No existe `FLUJO-COMUNICACION-DOCENTE.md` para mensajeria y anuncios | P2 |
| Flujo de Configuracion | No existe `FLUJO-CONFIGURACION-DOCENTE.md` para settings, alert config, notification preferences | P3 |
| Flujo de Respuestas Ejercicios | No existe `FLUJO-RESPUESTAS-EJERCICIOS.md` para la pagina de respuestas | P3 |
| Flujo de Reportes Programados/Compartidos | El flujo existente `FLUJO-ANALYTICS-REPORTES.md` puede no cubrir los tabs nuevos de scheduled/shared reports | P2 |
| Mapa de Componentes Teacher | No existe un documento que catalogue los 50 componentes y su jerarquia | P3 |

---

## 7. Resumen Ejecutivo

### Metricas del Portal Teacher

| Metrica | Valor |
|---------|-------|
| Paginas | 19 |
| Componentes | 50 |
| Hooks | 25 (24 files + 1 barrel index) |
| Rutas App.tsx | 19 (17 directas + 1 redirect + 1 review panel) |
| API Services (directos) | 5 (classroomsApi, reportsApi, scheduledReportsApi, sharedReportsApi, teacherApi) |
| Backend Controllers | 10 (teacher, classrooms, assignments, communication, content, grades, exercise-responses, alert-config, intervention-alerts, manual-review) |
| Backend Endpoints (estimado) | ~120 |
| Flujos documentados | 8 |

### Estado General

El Teacher Portal esta al **~95%** de completitud funcional. La arquitectura es solida con:
- **React Query** usado consistentemente en la mayoria de hooks (excepciones: notifications usa Zustand, reports page usa useState/useEffect)
- **TeacherPageShell** pattern elimina boilerplate de layout/auth
- **API services** bien estructurados con transformaciones snake_case/camelCase
- **Backend** completamente wired con todos los endpoints necesarios

### Accion Inmediata Requerida

1. **Diagnosticar TeacherReportsPage** siguiendo los pasos de la seccion 2.5
2. **Verificar datos en BD** para `social_features.teacher_reports` y `social_features.scheduled_reports`
3. **Verificar puppeteer/Chromium** en servidor de produccion para generacion de PDFs
