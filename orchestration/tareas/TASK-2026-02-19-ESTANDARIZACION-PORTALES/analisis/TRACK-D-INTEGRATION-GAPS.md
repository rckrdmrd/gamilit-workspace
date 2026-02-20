# Track D: Analisis de Integracion Backend-Frontend

**Fecha:** 2026-02-19
**Archivos analizados:** ~45 frontend files, ~12 backend files
**Alcance:** Teacher Reports, Teacher Alerts, Admin Alerts/Monitoring, Socket.IO Realtime, Notifications Cross-Portal, Direct apiClient Usage, Mock/Fallback Data

---

## Resumen Ejecutivo

La integracion backend-frontend del proyecto gamilit se encuentra en un estado avanzado (~85% conectado) con gaps notables en:

1. **Teacher Reports**: La pagina principal usa `apiClient` directo con mock data fallbacks en 3 catch blocks. Existe un `reportsApi` service layer que la pagina NO usa. Endpoints de scheduled reports (5) y shared reports (6) del backend NO tienen frontend.
2. **Teacher Alerts/Interventions**: Completamente integrado. El backend (InterventionAlertsController + AlertConfigController) esta mapeado 1:1 con frontend services (`interventionAlertsApi`, `alertConfigApi`) y hooks (`useInterventionAlerts`, `useAlertConfig`).
3. **Admin Alerts/Monitoring**: Alerts fully integrated. Monitoring fully integrated. Pero 3 funciones en `useSettings` son mock (sendTestEmail, createBackup, clearCache).
4. **Socket.IO Realtime**: Backend gateway implementado con 7+ event types. Frontend `useClassroomRealtime` hook esta implementado pero **nunca es consumido** por ninguna pagina o componente. `useWebSocket` (notifications) SI se usa.
5. **Mock data significativo**: 5+ ubicaciones con datos mock hardcodeados en produccion (ResourceSharingPanel, CreateAssignmentModal, UserDetailModal, TenantManagementPanel, FeatureFlagControls).

---

## 1. Teacher Reports Integration

### Backend Endpoints Disponibles

| # | Endpoint | Method | Controller | Line | Description |
|---|----------|--------|------------|------|-------------|
| 1 | `/teacher/reports/generate` | POST | TeacherController | 384 | Generate insights report (PDF/Excel/CSV) |
| 2 | `/teacher/reports/recent` | GET | TeacherController | 481 | Get recent reports list |
| 3 | `/teacher/reports/stats` | GET | TeacherController | 500 | Get report statistics |
| 4 | `/teacher/reports/:id/status` | GET | TeacherController | 515 | Get report generation status |
| 5 | `/teacher/reports/:id/download` | GET | TeacherController | 536 | Download a report |
| 6 | `/teacher/reports/:id` | DELETE | TeacherController | 596 | Delete a report |
| 7 | `/teacher/reports/scheduled` | GET | TeacherController | 626 | Get scheduled reports |
| 8 | `/teacher/reports/scheduled` | POST | TeacherController | 640 | Create scheduled report |
| 9 | `/teacher/reports/scheduled/:id` | GET | TeacherController | 658 | Get scheduled report by ID |
| 10 | `/teacher/reports/scheduled/:id` | PUT | TeacherController | 675 | Update scheduled report |
| 11 | `/teacher/reports/scheduled/:id` | DELETE | TeacherController | 693 | Delete scheduled report |
| 12 | `/teacher/reports/scheduled/:id/pause` | POST | TeacherController | 711 | Pause scheduled report |
| 13 | `/teacher/reports/scheduled/:id/resume` | POST | TeacherController | 724 | Resume scheduled report |
| 14 | `/teacher/reports/share` | POST | TeacherController | 741 | Share a report |
| 15 | `/teacher/reports/shared/by-me` | GET | TeacherController | 758 | Get reports shared by me |
| 16 | `/teacher/reports/shared/with-me` | GET | TeacherController | 772 | Get reports shared with me |
| 17 | `/teacher/reports/shared/:id/view` | POST | TeacherController | 786 | Mark shared report as viewed |
| 18 | `/teacher/reports/shared/:id` | DELETE | TeacherController | 800 | Revoke shared report |
| 19 | `/teacher/reports/shared/:id/permission` | PUT | TeacherController | 814 | Update share permission |

### Frontend API Calls

| File | Line | Endpoint Called | Via Service Layer? |
|------|------|-----------------|--------------------|
| `TeacherReports.tsx` | 134 | `GET /teacher/classrooms` | NO - direct `apiClient.get` |
| `TeacherReports.tsx` | 158 | `GET /teacher/classrooms/:id/students` | NO - direct `apiClient.get` |
| `TeacherReports.tsx` | 181 | `GET /teacher/reports/recent` | NO - direct `apiClient.get` |
| `TeacherReports.tsx` | 228 | `GET /teacher/reports/stats` | NO - direct `apiClient.get` |
| `TeacherReports.tsx` | 247 | `GET /teacher/reports/:id/download` | NO - direct `apiClient.get` |
| `TeacherReports.tsx` | 275 | `DELETE /teacher/reports/:id` | NO - direct `apiClient.delete` |
| `ReportGenerator.tsx` | 39 | `POST /teacher/reports/generate` | NO - direct `apiClient.post` |
| `reportsApi.ts` (service) | 147 | `POST /teacher/reports/generate` | YES (unused by page) |
| `reportsApi.ts` (service) | 187 | `GET /teacher/reports/recent` | YES (unused by page) |
| `reportsApi.ts` (service) | 215 | `GET /teacher/reports/stats` | YES (unused by page) |
| `reportsApi.ts` (service) | 253 | `GET /teacher/reports/:id/download` | YES (unused by page) |
| `reportsApi.ts` (service) | 291 | `DELETE /teacher/reports/:id` | YES (unused by page) |

### Gap Analysis

**P1 - Service Layer Bypass:** `TeacherReports.tsx` and `ReportGenerator.tsx` use `apiClient` directly instead of the existing `reportsApi` service. The `reportsApi.ts` file has properly typed functions for all 5 core operations (generate, getRecent, getStats, download, delete) but the page doesn't use them.

**P1 - Mock Data Fallbacks (3 locations):**
- Line 167-176: `loadStudents()` falls back to 5 hardcoded mock students on error
- Line 189-223: `loadRecentReports()` falls back to 3 hardcoded mock reports on error
- Line 234-242: `loadReportStats()` falls back to hardcoded mock stats on error

These mock fallbacks include a `isUsingMockData` flag and visual banner, which is good UX practice, but the data itself is stale and misleading.

**P0 - Missing Frontend for Scheduled Reports:** Backend has 7 endpoints for scheduled reports (CRUD + pause/resume) but frontend has ZERO files implementing this feature. No pages, no hooks, no API service functions exist.

**P0 - Missing Frontend for Shared Reports:** Backend has 5 endpoints for sharing reports between teachers but frontend has ZERO files implementing this feature.

**P2 - Report Status Endpoint:** Backend has `GET /teacher/reports/:id/status` but no frontend code calls it.

---

## 2. Teacher Alerts/Interventions Integration

### Backend Endpoints - Intervention Alerts Controller

| # | Endpoint | Method | Controller | Description |
|---|----------|--------|------------|-------------|
| 1 | `/teacher/alerts` | GET | InterventionAlertsController | List alerts with filters/pagination |
| 2 | `/teacher/alerts/:id` | GET | InterventionAlertsController | Get alert by ID |
| 3 | `/teacher/alerts/:id/acknowledge` | PATCH | InterventionAlertsController | Acknowledge alert |
| 4 | `/teacher/alerts/:id/resolve` | PATCH | InterventionAlertsController | Resolve alert with notes |
| 5 | `/teacher/alerts/:id/dismiss` | PATCH | InterventionAlertsController | Dismiss alert |
| 6 | `/teacher/alerts/student/:studentId/history` | GET | InterventionAlertsController | Student alert history |
| 7 | `/teacher/alerts/generate` | POST | InterventionAlertsController | Manual alert generation |

### Backend Endpoints - Alert Config Controller

| # | Endpoint | Method | Controller | Description |
|---|----------|--------|------------|-------------|
| 1 | `/teacher/alert-config` | GET | AlertConfigController | List configurations |
| 2 | `/teacher/alert-config/defaults` | GET | AlertConfigController | Get defaults |
| 3 | `/teacher/alert-config/:id` | GET | AlertConfigController | Get single config |
| 4 | `/teacher/alert-config` | POST | AlertConfigController | Create config |
| 5 | `/teacher/alert-config/initialize` | POST | AlertConfigController | Initialize defaults |
| 6 | `/teacher/alert-config/:id` | PUT | AlertConfigController | Update config |
| 7 | `/teacher/alert-config/:id` | DELETE | AlertConfigController | Delete config |

### Frontend API Coverage

| Frontend Service | Methods | Backend Coverage |
|-----------------|---------|-----------------|
| `interventionAlertsApi.ts` | getAlerts, getAlertById, acknowledgeAlert, resolveAlert, dismissAlert, getStudentAlertHistory, generateAlerts | 7/7 (100%) |
| `alertConfigApi.ts` | getConfigurations, getDefaults, getConfiguration, createConfiguration, initializeDefaults, updateConfiguration, deleteConfiguration | 7/7 (100%) |

### Frontend Hook/Component Coverage

| Component/Hook | Consumes Service | Connected? |
|---------------|-----------------|-----------|
| `useInterventionAlerts.ts` | `interventionAlertsApi` | YES - fully wired |
| `useAlertConfig.ts` | `alertConfigApi` | YES - fully wired |
| `InterventionAlertsPanel.tsx` | `useInterventionAlerts` | YES - fully wired |
| `TeacherAlerts.tsx` | `InterventionAlertsPanel` | YES - fully wired |
| `TeacherAlertConfig.tsx` | `useAlertConfig` | YES - fully wired |

### Gap Analysis

**No gaps identified.** Teacher alerts/interventions integration is complete with:
- 14 backend endpoints (7 alerts + 7 config)
- 14 matching frontend API methods
- 2 dedicated hooks for state management
- 2 dedicated pages consuming the hooks
- Proper error handling, loading states, and pagination
- Enum synchronization documented with `@synchronized-with` annotations

---

## 3. Admin Alerts/Monitoring Integration

### Admin Alerts Backend Endpoints

| # | Endpoint | Method | Controller | Description |
|---|----------|--------|------------|-------------|
| 1 | `/admin/alerts` | GET | AdminAlertsController | List alerts with filters/pagination |
| 2 | `/admin/alerts/stats/summary` | GET | AdminAlertsController | Alert statistics |
| 3 | `/admin/alerts/:id` | GET | AdminAlertsController | Get alert by ID |
| 4 | `/admin/alerts` | POST | AdminAlertsController | Create manual alert |
| 5 | `/admin/alerts/:id/acknowledge` | PATCH | AdminAlertsController | Acknowledge alert |
| 6 | `/admin/alerts/:id/resolve` | PATCH | AdminAlertsController | Resolve alert |
| 7 | `/admin/alerts/:id/suppress` | PATCH | AdminAlertsController | Suppress alert |

### Admin Monitoring Backend Endpoints

| # | Endpoint | Method | Controller | Description |
|---|----------|--------|------------|-------------|
| 1 | `/admin/monitoring/metrics` | GET | AdminMonitoringController | Current system metrics |
| 2 | `/admin/monitoring/metrics/history` | GET | AdminMonitoringController | Metrics history |
| 3 | `/admin/monitoring/errors/stats` | GET | AdminMonitoringController | Error statistics |
| 4 | `/admin/monitoring/errors/recent` | GET | AdminMonitoringController | Recent errors |
| 5 | `/admin/monitoring/errors/trends` | GET | AdminMonitoringController | Error trends |

### Frontend API Coverage

| Frontend Service | Backend Coverage |
|-----------------|-----------------|
| `adminAPI.alerts.*` (list, getById, getStats, create, acknowledge, resolve, suppress) | 7/7 (100%) |
| `adminAPI.monitoring.*` (getExtendedMetrics, getErrorStats, getRecentErrors, getErrorTrends) | 4/5 (80%) |

### Frontend Hook/Component Coverage

| Component/Hook | Connected? |
|---------------|-----------|
| `useAlerts.ts` (admin) | YES - calls `adminAPI.alerts.*` |
| `useMonitoring.ts` | YES - calls `adminAPI.monitoring.*` |
| `AdminAlertsPage.tsx` | YES - uses `useAlerts` |
| `AdminMonitoringPage.tsx` | YES - uses both `useMonitoring` + `useAlerts` |

### Gap Analysis

**P2 - Missing Metrics History:** Backend has `GET /admin/monitoring/metrics/history` but `useMonitoring` hook does NOT call it. MetricsTab only has current metrics, no historical chart.

**P1 - Mock Functions in useSettings:** Three admin settings operations are mocked:
- `sendTestEmail()` - Lines 181-201: Documented as deprecated mock, no backend endpoint
- `createBackup()` - Lines 232-263: Documented as deprecated mock, no backend endpoint
- `clearCache()` - Lines 269-289: Documented as deprecated mock, no backend endpoint

---

## 4. Real-time (Socket.IO) Integration

### Backend Events Emitted

| Event | Gateway Method | When Emitted |
|-------|---------------|-------------|
| `authenticated` | `handleConnection` | After JWT verification succeeds |
| `error` | `handleConnection` | On auth failure |
| `pending_messages` | `deliverPendingMessages` | When reconnected user has offline messages |
| `pending_messages_delivered` | `deliverPendingMessages` | After all pending messages sent |
| `notification:new` | `emitToUser` | New notification (any type) |
| `notification:read` | `handleMarkAsRead` | Notification marked read |
| `teacher:student_activity` | `emitStudentActivity` | Student starts/completes exercise |
| `teacher:classroom_update` | `emitClassroomUpdate` | Student joins/leaves classroom |
| `teacher:new_submission` | `emitNewSubmission` | New exercise submission |
| `teacher:alert_triggered` | `emitAlertTriggered` | Intervention alert generated |
| `teacher:student_online` | `emitStudentOnlineStatus` | Student comes online |
| `teacher:student_offline` | `emitStudentOnlineStatus` | Student goes offline |
| `teacher:progress_update` | `emitProgressUpdate` | Student achieves milestone |
| `achievement:unlocked` | `emitToUser` | Achievement unlocked |
| `rank:updated` | `emitToUser` | Maya rank promotion |
| `xp:gained` | `emitToUser` | XP gained |
| `balance:updated` | `emitToUser` | ML Coins balance change |
| `mission:completed` | `emitToUser` | Mission completed |
| `mission:progress` | `emitToUser` | Mission progress update |

### Frontend Event Listeners

| Hook/Component | Events Listened | Actually Used In Pages? |
|----------------|----------------|------------------------|
| `useWebSocket.ts` (notifications) | `new_notification`, `notification_read`, `notification_deleted`, `unread_count_updated`, `authenticated`, `connect`, `disconnect`, `connect_error`, `error` | YES - connected via `notificationsStore` and consumed cross-portal |
| `useClassroomRealtime.ts` (teacher) | `teacher:student_activity`, `teacher:classroom_update`, `teacher:new_submission`, `teacher:alert_triggered`, `teacher:student_online`, `teacher:student_offline`, `teacher:progress_update`, `authenticated`, `connect`, `disconnect`, `error` | **NO** - hook is exported but **never consumed** by any page/component |

### Gap Analysis

**P0 - useClassroomRealtime Never Used:** The `useClassroomRealtime` hook (387 lines, fully implemented) is exported from `apps/frontend/src/apps/teacher/hooks/index.ts` but zero pages or components actually call `useClassroomRealtime(...)`. This means:
- No teacher page receives real-time student activity updates
- No teacher page shows student online/offline status
- No teacher page shows real-time new submission notifications
- No teacher page shows real-time alert notifications
- The entire teacher real-time monitoring feature is **dead code**

The backend gateway has all the corresponding emit methods (`emitStudentActivity`, `emitClassroomUpdate`, `emitNewSubmission`, `emitAlertTriggered`, `emitStudentOnlineStatus`, `emitProgressUpdate`) fully implemented but nobody on the frontend listens.

**P2 - Gamification Events Not Listened:** Backend emits `achievement:unlocked`, `rank:updated`, `xp:gained`, `balance:updated`, `mission:completed`, `mission:progress` via `SocketEvent` enum but the `useWebSocket` hook only listens for `new_notification`. Gamification events may be consumed by dedicated toast components (AchievementNotification.tsx) but this could not be verified as deeply connected.

---

## 5. Notifications Cross-Portal

### Backend Notification Infrastructure

| Controller | Endpoints | Description |
|-----------|-----------|-------------|
| `notifications.controller.ts` | CRUD + mark read/unread | Core notifications |
| `notification-preferences.controller.ts` | Get/Update preferences | Per-user notification settings |
| `notification-devices.controller.ts` | Register/unregister devices | Push notification device management |
| `notification-multichannel.controller.ts` | Multi-channel send | Email + push + in-app + SMS |
| `notification-templates.controller.ts` | Template management | Notification templates |
| `notification-analytics.controller.ts` | Analytics/metrics | Notification delivery stats |
| `notification-rate-limit.controller.ts` | Rate limiting | Rate limit management |
| `sms.controller.ts` | SMS specific | SMS notifications |

### Frontend Notification Integration

| Portal | Page | Connected? | Notes |
|--------|------|-----------|-------|
| Student | `NotificationPreferencesPage.tsx` | YES | Uses `notificationsAPI` |
| Student | Settings > NotificationsSection | YES | Uses notification preferences API |
| Teacher | `TeacherNotifications.tsx` | YES | Uses `notificationsStore` |
| Teacher | `TeacherNotificationPreferences.tsx` | Likely YES | References notification hooks |
| Admin | No dedicated notifications page | N/A | Alerts page serves as admin notifications |

### WebSocket Notification Delivery

| Feature | Status |
|---------|--------|
| Real-time in-app notifications | WORKING - `useWebSocket` listens for `new_notification` |
| Browser push notifications | WORKING - `showBrowserNotification()` in `useWebSocket` |
| Notification permission request | IMPLEMENTED - `requestNotificationPermission()` exported |
| Offline message persistence | IMPLEMENTED - Backend `MessagePersistenceService` stores to Redis |
| Reconnection message delivery | IMPLEMENTED - Backend delivers pending on reconnect |
| Token refresh on expired WS | IMPLEMENTED - `useWebSocket` checks JWT validity |

### Gap Analysis

**No critical gaps.** The notification system is well integrated with:
- Backend has 7 controllers covering all aspects (CRUD, preferences, devices, multi-channel, templates, analytics, rate-limiting)
- Frontend notifications store (`notificationsStore`) is shared cross-portal
- WebSocket delivers real-time notifications with offline persistence
- Browser push notifications are supported

**P2 - SMS/Email from Frontend:** The multi-channel send endpoints exist in backend but there is no admin UI for composing and sending bulk notifications via email/SMS. Only automated system-generated notifications use these channels.

---

## 6. Direct apiClient Usage (Bypassing Service Layer)

### Teacher Portal

| File | Line | Endpoint | Service Available? |
|------|------|----------|--------------------|
| `TeacherReports.tsx` | 134 | `GET /teacher/classrooms` | YES - `classroomsApi` exists |
| `TeacherReports.tsx` | 158 | `GET /teacher/classrooms/:id/students` | YES - `classroomsApi` exists |
| `TeacherReports.tsx` | 181 | `GET /teacher/reports/recent` | YES - `reportsApi.getRecentReports` |
| `TeacherReports.tsx` | 228 | `GET /teacher/reports/stats` | YES - `reportsApi.getReportStats` |
| `TeacherReports.tsx` | 247 | `GET /teacher/reports/:id/download` | YES - `reportsApi.downloadReport` |
| `TeacherReports.tsx` | 275 | `DELETE /teacher/reports/:id` | YES - `reportsApi.deleteReport` |
| `ReportGenerator.tsx` | 39 | `POST /teacher/reports/generate` | YES - `reportsApi.generateReport` |
| `ClassProgressDashboard.tsx` | 25 | `POST` (unspecified) | Needs investigation |
| `ParentCommunicationHub.tsx` | 54 | `POST /teacher/sendCommunication` | NO service exists |
| `AssignmentCreator.tsx` | 54 | `GET /teacher/assignments` | YES - `assignmentsApi` exists |
| `AssignmentCreator.tsx` | 64 | `GET /modules` (educational) | Possibly via other service |
| `AssignmentCreator.tsx` | 73 | `GET /teacher/classrooms/:id/students` | YES - `classroomsApi` exists |
| `AssignmentCreator.tsx` | 98 | `POST /teacher/assignments` | YES - `assignmentsApi` exists |

### Admin Portal

| File | Line | Endpoint | Service Available? |
|------|------|----------|--------------------|
| `OrganizationsTable.tsx` | 28 | `GET /admin/organizations` | YES - `adminAPI.organizations` |
| `SystemLogsViewer.tsx` | 31 | `GET /admin/logs` | YES - `adminAPI.monitoring` |

**Total direct apiClient calls bypassing service layer: 15 (13 teacher + 2 admin)**

---

## 7. Mock/Fallback Data Found

### Production Mock Data (Hardcoded, Always Active)

| File | Description | Real Endpoint Available? |
|------|-------------|------------------------|
| `teacher/components/collaboration/ResourceSharingPanel.tsx` | Entire component uses hardcoded mock resources array. No API calls. | NO - No resource sharing backend endpoints exist |
| `teacher/components/dashboard/CreateAssignmentModal.tsx` (L34) | `MOCK_EXERCISES` array with 5 fake exercises. Comment says "in real app, fetch from API" | YES - Educational modules/exercises endpoints exist |
| `admin/components/users/UserDetailModal.tsx` (L70) | Mock activity logs array. Comment says "In production, fetch from API" | PARTIAL - Audit log endpoints exist but user-specific activity endpoint may not |
| `admin/components/advanced/TenantManagementPanel.tsx` | Entire component is mock. Comment says "backend does not have multi-tenancy routes yet" | NO - Dedicated tenant admin routes don't exist (tenants module exists but different scope) |
| `admin/components/advanced/FeatureFlagControls.tsx` | Entire component uses mock flags. Backend has no `/admin/feature-flags` endpoints | NO - Feature flag backend endpoints don't exist |
| `admin/components/monitoring/SystemHealthIndicators.tsx` (L115) | "Mock data structure" comment; may be partially wired | PARTIAL - Health check endpoints exist |

### Error-Fallback Mock Data (Activates Only on API Failure)

| File | Line | Mock Data | Real Endpoint Available? |
|------|------|-----------|------------------------|
| `TeacherReports.tsx` | 169 | 5 mock students | YES - Classroom students endpoint exists |
| `TeacherReports.tsx` | 191 | 3 mock recent reports | YES - Reports recent endpoint exists |
| `TeacherReports.tsx` | 236 | Mock report stats | YES - Reports stats endpoint exists |

### Feature-Flag Controlled Mock Data

| File | Line | Mock Data | Controlled By |
|------|------|-----------|---------------|
| `useStudentsEconomy.ts` | 32-40 | 8 mock students with economy data | `FEATURE_FLAGS.USE_MOCK_DATA` |

### Mock Functions (No Real Backend Implementation)

| File | Function | Description |
|------|----------|-------------|
| `admin/hooks/useSettings.ts` | `sendTestEmail()` | Documented as deprecated mock; has `console.warn` |
| `admin/hooks/useSettings.ts` | `createBackup()` | Documented as deprecated mock; has `console.warn` |
| `admin/hooks/useSettings.ts` | `clearCache()` | Documented as deprecated mock; has `console.warn` |

---

## Hallazgos Criticos (P0) -- Integration Broken/Missing

| ID | Area | Description | Impact |
|----|------|-------------|--------|
| P0-01 | Teacher Realtime | `useClassroomRealtime` hook (387 lines) is implemented but **never consumed** by any page. Teacher portal has zero real-time features despite full backend WebSocket support | Teachers cannot see real-time student activity, submissions, or online status. The entire real-time monitoring value proposition is unavailable |
| P0-02 | Scheduled Reports | Backend has 7 scheduled report endpoints (CRUD + pause/resume) via `ScheduledReportsService`. Frontend has **zero files** for this feature | Teachers cannot schedule automated report generation. Feature is backend-only, invisible to users |
| P0-03 | Shared Reports | Backend has 5 shared report endpoints via `SharedReportsService`. Frontend has **zero files** for this feature | Teachers cannot share reports with colleagues. Feature is backend-only, invisible to users |

## Hallazgos Altos (P1) -- Integration Incomplete

| ID | Area | Description | Impact |
|----|------|-------------|--------|
| P1-01 | Teacher Reports | `TeacherReports.tsx` uses `apiClient` directly instead of existing `reportsApi` service layer. 7 direct calls bypass the service | Inconsistent error handling, no centralized response transformation, harder to maintain |
| P1-02 | Teacher Reports | 3 mock data fallbacks in `TeacherReports.tsx` show fake data when backend is unavailable | Users may confuse mock data with real data despite warning banner. Better to show clear error state |
| P1-03 | CreateAssignmentModal | Uses `MOCK_EXERCISES` instead of fetching from exercises API | Teachers see fake exercise names when creating assignments via quick modal |
| P1-04 | Admin Settings | 3 functions (sendTestEmail, createBackup, clearCache) are mocked with no backend endpoints | Admin believes they performed operations that didn't actually execute |
| P1-05 | ResourceSharingPanel | Entire component is hardcoded mock data with no API integration | Resource sharing between teachers is completely non-functional |

## Hallazgos Medios (P2) -- Integration Suboptimal

| ID | Area | Description | Impact |
|----|------|-------------|--------|
| P2-01 | Admin Monitoring | `metrics/history` endpoint exists but `useMonitoring` doesn't call it | No historical metrics visualization in admin monitoring |
| P2-02 | Report Status | Backend `GET /teacher/reports/:id/status` exists but frontend never calls it | No polling for report generation status (currently synchronous, but async future-proofing missing) |
| P2-03 | Feature Flags Admin | Entire `FeatureFlagControls` component is mock | Feature flag management from admin UI is non-functional |
| P2-04 | Tenant Management | Entire `TenantManagementPanel` is mock | Multi-tenancy admin management is non-functional (by design - documented as future feature) |
| P2-05 | User Activity Logs | `UserDetailModal` uses mock activity logs | Admin cannot see real user activity when viewing user details |
| P2-06 | Gamification WS Events | Backend emits 6 gamification socket events but `useWebSocket` only handles generic notifications | Gamification events may not trigger dedicated UI feedback |
| P2-07 | Admin Direct apiClient | `OrganizationsTable` and `SystemLogsViewer` use `apiClient` directly instead of `adminAPI` service | Minor inconsistency; both have service layer available |
| P2-08 | SMS/Email Admin UI | Backend has multi-channel notification controllers but no admin compose/send UI | Bulk notifications can only be sent programmatically, not through admin portal |

---

## Acciones Correctivas Recomendadas

### Prioridad Critica (P0)

1. **Wire `useClassroomRealtime` to TeacherDashboard or TeacherProgress page** -- The hook is complete; it just needs to be called with classroom IDs. Add real-time activity feed, online student indicators, and live submission notifications to at least one teacher page.

2. **Create Scheduled Reports UI** -- Build:
   - `useScheduledReports` hook consuming the 7 backend endpoints
   - `ScheduledReportsTab` component within TeacherReports page
   - CRUD forms for creating/editing schedules

3. **Create Shared Reports UI** -- Build:
   - `useSharedReports` hook consuming the 5 backend endpoints
   - `SharedReportsTab` component within TeacherReports page
   - Share dialog, permissions management

### Prioridad Alta (P1)

4. **Refactor TeacherReports.tsx to use `reportsApi`** -- Replace all 7 direct `apiClient` calls with the existing `reportsApi` service functions. Remove mock data fallbacks and show proper error states instead.

5. **Replace CreateAssignmentModal mock exercises** -- Fetch exercises from `GET /educational/exercises` or relevant endpoint instead of using `MOCK_EXERCISES`.

6. **Remove or clearly label admin mock functions** -- Either implement backend endpoints for sendTestEmail, createBackup, clearCache or disable those buttons in the UI with "Coming Soon" labels.

7. **Wire ResourceSharingPanel** -- Either connect to a real backend resource-sharing module or clearly label as "Coming Soon" feature.

### Prioridad Media (P2)

8. **Add metrics history to admin monitoring** -- Use `GET /admin/monitoring/metrics/history` endpoint to show a time-series chart in MetricsTab.

9. **Replace UserDetailModal mock activity** -- Connect to audit log endpoints to show real user activity.

10. **Add admin API service layer for direct apiClient calls** -- Refactor `OrganizationsTable` and `SystemLogsViewer` to use `adminAPI` service methods.

---

## Resumen de Cobertura

| Area | Backend Endpoints | Frontend Wired | Coverage |
|------|-------------------|---------------|----------|
| Teacher Reports (core) | 6 | 6 (via direct apiClient) | 100% (but bypasses service) |
| Teacher Scheduled Reports | 7 | 0 | 0% |
| Teacher Shared Reports | 5 | 0 | 0% |
| Teacher Alerts (intervention) | 7 | 7 | 100% |
| Teacher Alert Config | 7 | 7 | 100% |
| Admin Alerts | 7 | 7 | 100% |
| Admin Monitoring | 5 | 4 | 80% |
| WebSocket (notifications) | ~6 events | ~6 listeners | ~100% |
| WebSocket (teacher realtime) | 7 events | 7 listeners (dead code) | 0% (not consumed) |
| Notifications CRUD | ~20 endpoints | ~15 consumed | ~75% |
| **Overall** | **~87 endpoints** | **~59 wired** | **~68%** |
