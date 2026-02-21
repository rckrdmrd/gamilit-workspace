# Stream B: Teacher Portal Deep Audit

**Date:** 2026-02-21
**Auditor:** Claude Opus 4.6
**Scope:** `apps/frontend/src/apps/teacher/` + `apps/backend/src/modules/teacher/`

---

## 1. Executive Summary

The Teacher Portal is architecturally mature with 19 pages, 10 backend controllers, and a well-structured service layer. However, this audit identified **5 service layer bypasses** in frontend components that call `apiClient` directly instead of using the dedicated API service files. The reports end-to-end chain is mostly complete but contains the most severe bypass. The alerts system (intervention + configuration) is fully wired end-to-end. One instance of `window.confirm()` remains in production code. Mock data exists behind a feature flag in the economy hook. No TODOs or FIXMEs were found in teacher files.

| Severity | Count |
|----------|-------|
| **CRITICAL** | 0 |
| **HIGH** | 5 |
| **MEDIUM** | 4 |
| **LOW** | 5 |
| **Total Issues** | **14** |

---

## 2. Service Layer Bypasses

All 5 bypasses involve components importing `apiClient` directly and making HTTP calls instead of going through the established API service layer (`services/api/teacher/*.ts`). This violates the layered architecture, makes testing harder, and duplicates error handling.

| # | File | Line(s) | Direct API Call | Correct API Service | Severity | Fix Complexity |
|---|------|---------|-----------------|---------------------|----------|----------------|
| **SLB-1** | `components/reports/ReportGenerator.tsx` | L9, L39 | `apiClient.post(API_ENDPOINTS.teacher.reports.generate, ...)` | `reportsApi.generateReport(dto)` | HIGH | Low -- replace with 1 function call |
| **SLB-2** | `components/progress/ClassProgressDashboard.tsx` | L11, L25 | `apiClient.post(API_ENDPOINTS.teacher.reports.generate, ...)` | `reportsApi.generateReport(dto)` | HIGH | Low -- replace with 1 function call |
| **SLB-3** | `components/collaboration/ParentCommunicationHub.tsx` | L7, L54 | `apiClient.post(API_ENDPOINTS.teacher.sendCommunication, ...)` | `teacherMessagesApi.sendMessage(data)` (or add dedicated wrapper) | HIGH | Medium -- may need wrapper function |
| **SLB-4** | `components/assignments/AssignmentCreator.tsx` | L8, L54, L64, L73, L98 | 4 direct `apiClient.get/post` calls for assignments, modules, students | `assignmentsApi.*` and `classroomsApi.*` | HIGH | Medium -- 4 calls to refactor |
| **SLB-5** | `components/responses/ResponseFilters.tsx` | L19, L102 | `apiClient.get(API_ENDPOINTS.educational.modules)` | Should use an educational modules hook or service | HIGH | Low -- replace with 1 function call |

### SLB-1: ReportGenerator.tsx (CONFIRMED)

**File:** `apps/frontend/src/apps/teacher/components/reports/ReportGenerator.tsx`
- **Line 9:** `import { apiClient } from '@/services/api/apiClient';`
- **Line 39:** `const response = await apiClient.post(API_ENDPOINTS.teacher.reports.generate, { ... }, { responseType: 'blob' });`

**Correct alternative exists:** `reportsApi.generateReport(dto)` in `services/api/teacher/reportsApi.ts` (line 144) does the same call with proper metadata extraction from response headers.

**Additional concern:** The component uses `console.error('Error:', error)` at line 69 -- a vague error label that provides no context for debugging.

**Fix:**
```typescript
// Replace lines 39-56 with:
const { blob, metadata } = await reportsApi.generateReport({
  ...config,
  classroom_id: classroomId,
  template_id: selectedTemplate,
  type: /* type logic */,
});
```

### SLB-2: ClassProgressDashboard.tsx (CONFIRMED)

**File:** `apps/frontend/src/apps/teacher/components/progress/ClassProgressDashboard.tsx`
- **Line 11:** `import { apiClient } from '@/services/api/apiClient';`
- **Line 25:** `const response = await apiClient.post(API_ENDPOINTS.teacher.reports.generate, { type: 'progress', classroom_id: classroomId, format }, { responseType: 'blob' });`

This is a duplicate of the same report generation bypass as SLB-1. Both should use `reportsApi.generateReport()`.

### SLB-3: ParentCommunicationHub.tsx (CONFIRMED)

**File:** `apps/frontend/src/apps/teacher/components/collaboration/ParentCommunicationHub.tsx`
- **Line 7:** `import { apiClient } from '@/services/api/apiClient';`
- **Line 54:** `await apiClient.post(API_ENDPOINTS.teacher.sendCommunication, { ... })`

The backend controller at `teacher-communication.controller.ts` (line 46) is mapped to `['teacher/messages', 'teacher/communications']`. The API endpoint `API_ENDPOINTS.teacher.sendCommunication` resolves to `/teacher/communications`. The `teacherMessagesApi` service exists with `sendMessage()` method that posts to the messages endpoint. A wrapper function may be needed if the exact route differs.

### SLB-4: AssignmentCreator.tsx (CONFIRMED)

**File:** `apps/frontend/src/apps/teacher/components/assignments/AssignmentCreator.tsx`
- **Line 8:** `import { apiClient } from '@/services/api/apiClient';`
- **Line 54:** `apiClient.get(API_ENDPOINTS.teacher.assignments, { params })` -- fetching assignments list
- **Line 64:** `apiClient.get(modulesEndpoint)` -- fetching modules (with hacky endpoint resolution)
- **Line 73:** `apiClient.get(API_ENDPOINTS.teacher.classroomStudents?.(classroomId) || ...)` -- fetching students
- **Line 98:** `apiClient.post(API_ENDPOINTS.teacher.createAssignment, { ... })` -- creating assignment

All of these have corresponding functions in `assignmentsApi.ts` and `classroomsApi.ts`. Lines 62-63 contain a particularly fragile pattern: `(API_ENDPOINTS as unknown as { teacher?: { modules?: string } }).teacher?.modules || '/teacher/modules'` -- this casts the entire API config to extract a possibly non-existent key.

### SLB-5: ResponseFilters.tsx (CONFIRMED)

**File:** `apps/frontend/src/apps/teacher/components/responses/ResponseFilters.tsx`
- **Line 19:** `import { apiClient } from '@services/api/apiClient';`
- **Line 102:** `apiClient.get<ModuleListItem[]>(API_ENDPOINTS.educational.modules)`

This calls an educational endpoint directly. Should use an educational API service or a shared hook for module listing.

---

## 3. Reports End-to-End Verification

### 3.1 Frontend API Functions (reportsApi.ts)

| Function | URL | Method | Returns |
|----------|-----|--------|---------|
| `generateReport(dto)` | `/teacher/reports/generate` | POST | `{ blob, metadata }` |
| `getRecentReports(limit)` | `/teacher/reports/recent` | GET | `TeacherReport[]` |
| `getReportStats()` | `/teacher/reports/stats` | GET | `ReportStats` |
| `downloadReport(reportId)` | `/teacher/reports/{id}/download` | GET | `{ blob, metadata }` |
| `deleteReport(reportId)` | `/teacher/reports/{id}` | DELETE | `void` |
| `getReportStatus(reportId)` | `/teacher/reports/{id}/status` | GET | `ReportStatusResponse` |

**Note:** Additional API files exist for scheduled reports (`scheduledReportsApi.ts`) and shared reports (`sharedReportsApi.ts`).

### 3.2 Backend Endpoints (teacher.controller.ts)

All report endpoints are in `apps/backend/src/modules/teacher/controllers/teacher.controller.ts` under `@Controller('teacher')`:

| Route | Method | Handler | Line |
|-------|--------|---------|------|
| `reports/generate` | POST | `generateInsightsReport` | 384 |
| `reports/recent` | GET | `getRecentReports` | 481 |
| `reports/stats` | GET | `getReportStats` | 500 |
| `reports/:id/status` | GET | `getReportStatus` | 515 |
| `reports/:id/download` | GET | `downloadReport` | 536 |
| `reports/:id` | DELETE | `deleteReport` | 596 |
| `reports/scheduled` | GET | `getScheduledReports` | 626 |
| `reports/scheduled` | POST | `createScheduledReport` | 640 |
| `reports/scheduled/:id` | GET | `getScheduledReportById` | 658 |
| `reports/scheduled/:id` | PUT | `updateScheduledReport` | 675 |
| `reports/scheduled/:id` | DELETE | `deleteScheduledReport` | 693 |
| `reports/scheduled/:id/pause` | POST | `pauseScheduledReport` | 711 |
| `reports/scheduled/:id/resume` | POST | `resumeScheduledReport` | 724 |
| `reports/share` | POST | `shareReport` | 741 |
| `reports/shared/by-me` | GET | `getSharedByMe` | 758 |
| `reports/shared/with-me` | GET | `getSharedWithMe` | 772 |
| `reports/shared/:id/view` | POST | `markSharedReportViewed` | 786 |
| `reports/shared/:id` | DELETE | `revokeSharedReport` | 800 |
| `reports/shared/:id/permission` | PUT | `updateSharePermission` | 814 |

### 3.3 Cross-Reference Matrix

| Feature | Frontend Function | Backend Endpoint | Status |
|---------|-------------------|-----------------|--------|
| Generate report | `reportsApi.generateReport()` | `POST /teacher/reports/generate` | **OK** |
| Recent reports | `reportsApi.getRecentReports()` | `GET /teacher/reports/recent` | **OK** |
| Report stats | `reportsApi.getReportStats()` | `GET /teacher/reports/stats` | **OK** |
| Download report | `reportsApi.downloadReport()` | `GET /teacher/reports/:id/download` | **OK** |
| Delete report | `reportsApi.deleteReport()` | `DELETE /teacher/reports/:id` | **OK** |
| Report status | `reportsApi.getReportStatus()` | `GET /teacher/reports/:id/status` | **OK** |
| List scheduled | `scheduledReportsApi.*` | `GET /teacher/reports/scheduled` | **OK** |
| Create scheduled | `scheduledReportsApi.*` | `POST /teacher/reports/scheduled` | **OK** |
| Get scheduled | `scheduledReportsApi.*` | `GET /teacher/reports/scheduled/:id` | **OK** |
| Update scheduled | `scheduledReportsApi.*` | `PUT /teacher/reports/scheduled/:id` | **OK** |
| Delete scheduled | `scheduledReportsApi.*` | `DELETE /teacher/reports/scheduled/:id` | **OK** |
| Pause scheduled | `scheduledReportsApi.*` | `POST /teacher/reports/scheduled/:id/pause` | **OK** |
| Resume scheduled | `scheduledReportsApi.*` | `POST /teacher/reports/scheduled/:id/resume` | **OK** |
| Share report | `sharedReportsApi.*` | `POST /teacher/reports/share` | **OK** |
| Shared by me | `sharedReportsApi.*` | `GET /teacher/reports/shared/by-me` | **OK** |
| Shared with me | `sharedReportsApi.*` | `GET /teacher/reports/shared/with-me` | **OK** |
| Mark viewed | `sharedReportsApi.*` | `POST /teacher/reports/shared/:id/view` | **OK** |
| Revoke share | `sharedReportsApi.*` | `DELETE /teacher/reports/shared/:id` | **OK** |
| Update permission | `sharedReportsApi.*` | `PUT /teacher/reports/shared/:id/permission` | **OK** |

**Result:** All 19 report endpoints have matching frontend API functions. The only issue is that **2 components bypass the service layer** (SLB-1, SLB-2) even though the correct functions exist.

---

## 4. Alerts Verification

### 4.1 Intervention Alerts Flow (COMPLETE)

The intervention alerts system has a clean, well-layered architecture:

**Frontend chain:**
1. **Page:** `TeacherAlertsPage.tsx` -- renders filters + `InterventionAlertsPanel`
2. **Component:** `InterventionAlertsPanel.tsx` -- displays alerts, handles acknowledge/resolve/dismiss actions
3. **Hook:** `useInterventionAlerts.ts` -- state management, pagination, optimistic updates
4. **API Service:** `interventionAlertsApi.ts` -- 7 API functions

**Backend chain:**
- **Controller:** `intervention-alerts.controller.ts` at `teacher/alerts`
  - `GET /teacher/alerts` -- list with filters/pagination
  - `GET /teacher/alerts/:id` -- detail
  - `PATCH /teacher/alerts/:id/acknowledge` -- acknowledge
  - `PATCH /teacher/alerts/:id/resolve` -- resolve with notes
  - `PATCH /teacher/alerts/:id/dismiss` -- dismiss
  - `GET /teacher/alerts/student/:studentId/history` -- student history
  - `POST /teacher/alerts/generate` -- manual generation (testing)
- **Service:** `InterventionAlertsService`

**Cross-reference (all OK):**

| Frontend API Function | Backend Endpoint | Status |
|----------------------|-----------------|--------|
| `getAlerts(params)` | `GET /teacher/alerts` | **OK** |
| `getAlertById(id)` | `GET /teacher/alerts/:id` | **OK** |
| `acknowledgeAlert(id)` | `PATCH /teacher/alerts/:id/acknowledge` | **OK** |
| `resolveAlert(id, data)` | `PATCH /teacher/alerts/:id/resolve` | **OK** |
| `dismissAlert(id)` | `PATCH /teacher/alerts/:id/dismiss` | **OK** |
| `getStudentAlertHistory(studentId)` | `GET /teacher/alerts/student/:studentId/history` | **OK** |
| `generateAlerts()` | `POST /teacher/alerts/generate` | **OK** |

### 4.2 Alert Configuration Flow (COMPLETE)

**Frontend chain:**
1. **Page:** `TeacherAlertConfigPage.tsx` -- renders configuration cards for each alert type
2. **Hook:** `useAlertConfig.ts` -- CRUD operations, toast notifications
3. **API Service:** `alertConfigApi.ts` (class-based) -- 7 API functions

**Backend chain:**
- **Controller:** `alert-config.controller.ts` at `teacher/alert-config`
  - `GET /teacher/alert-config` -- list configurations
  - `GET /teacher/alert-config/defaults` -- get defaults
  - `GET /teacher/alert-config/:id` -- get single
  - `POST /teacher/alert-config` -- create
  - `POST /teacher/alert-config/initialize` -- initialize defaults
  - `PUT /teacher/alert-config/:id` -- update
  - `DELETE /teacher/alert-config/:id` -- delete
- **Service:** `AlertConfigService`

**Cross-reference (all OK):**

| Frontend API Function | Backend Endpoint | Status |
|----------------------|-----------------|--------|
| `getConfigurations(query)` | `GET /teacher/alert-config` | **OK** |
| `getDefaults()` | `GET /teacher/alert-config/defaults` | **OK** |
| `getConfiguration(id)` | `GET /teacher/alert-config/:id` | **OK** |
| `createConfiguration(dto)` | `POST /teacher/alert-config` | **OK** |
| `initializeDefaults(classroomId?)` | `POST /teacher/alert-config/initialize` | **OK** |
| `updateConfiguration(id, dto)` | `PUT /teacher/alert-config/:id` | **OK** |
| `deleteConfiguration(id)` | `DELETE /teacher/alert-config/:id` | **OK** |

**Save flow verified:** TeacherAlertConfigPage -> `handleSaveThreshold()` -> `updateConfiguration(config.id, { threshold_value: editValue })` -> hook `updateConfiguration()` -> `alertConfigApi.updateConfiguration(id, dto)` -> `PUT /teacher/alert-config/:id` -> `AlertConfigService.updateConfiguration()` -> DB update. Chain is clean.

---

## 5. TODOs and Incomplete Features

No `TODO`, `FIXME`, `HACK`, or `XXX` comments were found in any teacher frontend file. The grep returned zero matches.

---

## 6. Content Management Feature Flag

**File:** `apps/frontend/src/apps/teacher/pages/TeacherContentPage.tsx`

**Behavior:**
- Line 9: `const SHOW_UNDER_CONSTRUCTION = FEATURE_FLAGS.SHOW_UNDER_CONSTRUCTION;`
- The feature flag is sourced from `VITE_SHOW_UNDER_CONSTRUCTION` environment variable (line 809 in `api.config.ts`): `import.meta.env.VITE_SHOW_UNDER_CONSTRUCTION === 'true'`
- When `true`: Shows `UnderConstruction` component with upcoming features list
- When `false` (default in production): Shows the full `TeacherContentManagementPage`

**Assessment:** This is a well-implemented feature flag pattern. The flag is centralized in `FEATURE_FLAGS` in `api.config.ts`, sourced from environment variables, and the component header comment states "ESTADO: HABILITADO (2025-12-18)" indicating the full functionality is enabled. The under-construction path is a clean fallback. **No issues found.**

---

## 7. Console Statements & Debug Code

### 7.1 console.warn (Flagged -- should review)

| File | Line | Statement | Assessment |
|------|------|-----------|------------|
| `hooks/useStudentMonitoring.ts` | 160 | `console.warn('[useStudentMonitoring] Student without ID detected...')` | **MEDIUM** -- Useful for debugging but should use a logger in production |
| `hooks/useStudentMonitoring.ts` | 197 | `console.warn('[useStudentMonitoring] Pausando auto-refresh...')` | **LOW** -- Diagnostic, acceptable for monitoring pause behavior |
| `components/monitoring/StudentDetailModal.tsx` | 59 | `console.warn('[StudentDetailModal] Invalid student ID:')` | **LOW** -- Guards against invalid input, useful |
| `components/monitoring/StudentDetailModal.tsx` | 71 | `console.warn('[StudentDetailModal] Error fetching progress:')` | **LOW** -- Catch block in Promise.all, acceptable |
| `components/monitoring/StudentDetailModal.tsx` | 75 | `console.warn('[StudentDetailModal] Error fetching stats:')` | **LOW** -- Same pattern |
| `components/monitoring/StudentDetailModal.tsx` | 79 | `console.warn('[StudentDetailModal] Error fetching notes:')` | **LOW** -- Same pattern |

### 7.2 console.error (Acceptable -- error handling)

There are **34** `console.error` statements across teacher files. All are in error handling catch blocks with descriptive prefixed labels like `[useClassroomData]`, `[ReviewDetail]`, etc. These are appropriate for production error tracking. No action needed.

### 7.3 console.log (None found in production code)

No `console.log` statements found in teacher components or hooks. The only match was a JSDoc example in `MessagesList.tsx` (line 55: `onMessageClick={(msg) => console.log(msg)}`), which is documentation, not executed code.

---

## 8. window.confirm() Usage

| # | File | Line | Code | Severity |
|---|------|------|------|----------|
| **CONFIRM-1** | `components/alerts/InterventionAlertsPanel.tsx` | 129 | `if (confirm('...seguro de que quieres descartar...'))` | **MEDIUM** |

**Context:** Used in `handleDismiss()` to confirm before dismissing an alert. The rest of the codebase (e.g., `ReviewDetail.tsx` line 128) has already migrated away from `window.confirm()` to custom Modal-based confirmations (per FIX TASK-2026-01-18-012).

**Recommendation:** Replace with the `ConfirmDialog` component from `@shared/components/feedback/ConfirmDialog.tsx` to maintain UI consistency and allow for better styling.

---

## 9. Mock Data Usage

**File:** `apps/frontend/src/apps/teacher/hooks/useStudentsEconomy.ts`

| Aspect | Detail |
|--------|--------|
| **Mock data location** | Lines 32-41: `MOCK_STUDENTS` array with 8 hardcoded student economy records |
| **Gate** | `FEATURE_FLAGS.USE_MOCK_DATA` (from `VITE_USE_MOCK_DATA` env var) |
| **Primary path (L76)** | If `USE_MOCK_DATA` is true, returns mock data with 800ms simulated delay |
| **Error fallback (L96-101)** | If API call fails AND `USE_MOCK_DATA` is true, falls back to mock data |
| **Production impact** | `USE_MOCK_DATA` defaults to `false` unless explicitly set. Safe in production. |

**Assessment (MEDIUM):** The mock data approach is acceptable as a development aid, but the 40 lines of hardcoded data in the hook file add unnecessary bulk. The error fallback logic on line 96-101 is redundant (the mock check at L76 would have already returned before the API call). This is dead code.

**Recommendation:** Consider moving mock data to a separate `__mocks__/` file or removing the error fallback since it is unreachable when `USE_MOCK_DATA` is true.

---

## 10. Deprecated Aliases

**File:** `apps/frontend/src/services/api/teacher/interventionAlertsApi.ts`

Lines 97-116 contain **5 deprecated aliases** with the comment "remove after 2025-12-08":

```typescript
/** @deprecated Use StudentInterventionAlert instead */
export type Alert = StudentInterventionAlert;
/** @deprecated Use InterventionAlertType instead */
export const AlertType = InterventionAlertType;
export type AlertType = InterventionAlertType;
/** @deprecated Use InterventionAlertSeverity instead */
export const AlertSeverity = InterventionAlertSeverity;
export type AlertSeverity = InterventionAlertSeverity;
/** @deprecated Use InterventionAlertStatus instead */
export const AlertStatus = InterventionAlertStatus;
export type AlertStatus = InterventionAlertStatus;
/** @deprecated Use InterventionAlertsListResponse instead */
export type AlertsListResponse = InterventionAlertsListResponse;
```

These were supposed to be removed after 2025-12-08. They are also still re-exported from the barrel `services/api/teacher/index.ts` (lines 90-94). The deprecated date has passed by **2+ months**.

**Severity:** LOW -- No functional impact, but adds code bloat and confusion. Should be cleaned up.

---

## 11. Metrics Summary

| Metric | Count |
|--------|-------|
| **Total Issues Found** | **14** |
| CRITICAL | 0 |
| HIGH | 5 (all service layer bypasses) |
| MEDIUM | 4 (1 window.confirm, 1 mock data structure, 1 console.warn pattern, 1 fragile endpoint resolution) |
| LOW | 5 (6 console.warns, deprecated aliases, vague error label, dead code in mock fallback) |

### Issue Inventory

| ID | Category | Severity | File | Description |
|----|----------|----------|------|-------------|
| SLB-1 | Service Layer | HIGH | `ReportGenerator.tsx:39` | Direct `apiClient.post` bypass; `reportsApi.generateReport()` exists |
| SLB-2 | Service Layer | HIGH | `ClassProgressDashboard.tsx:25` | Direct `apiClient.post` bypass; `reportsApi.generateReport()` exists |
| SLB-3 | Service Layer | HIGH | `ParentCommunicationHub.tsx:54` | Direct `apiClient.post` bypass for communication |
| SLB-4 | Service Layer | HIGH | `AssignmentCreator.tsx:54,64,73,98` | 4 direct `apiClient` calls; `assignmentsApi/classroomsApi` exist |
| SLB-5 | Service Layer | HIGH | `ResponseFilters.tsx:102` | Direct `apiClient.get` for educational modules |
| CONFIRM-1 | UX Consistency | MEDIUM | `InterventionAlertsPanel.tsx:129` | `window.confirm()` instead of custom ConfirmDialog |
| MOCK-1 | Code Quality | MEDIUM | `useStudentsEconomy.ts:32-41` | Hardcoded mock data in hook + unreachable fallback |
| WARN-1 | Logging | MEDIUM | `useStudentMonitoring.ts:160` | console.warn in production for missing student ID |
| FRAGILE-1 | Code Quality | MEDIUM | `AssignmentCreator.tsx:62` | Fragile `as unknown as` type cast for endpoint resolution |
| DEPREC-1 | Tech Debt | LOW | `interventionAlertsApi.ts:97-116` | 5 deprecated aliases overdue for removal (deadline: 2025-12-08) |
| DEPREC-2 | Tech Debt | LOW | `services/api/teacher/index.ts:90-94` | Re-exports deprecated aliases |
| LOG-1 | Logging | LOW | `ReportGenerator.tsx:69` | Vague `console.error('Error:', error)` without context prefix |
| DEAD-1 | Dead Code | LOW | `useStudentsEconomy.ts:96-101` | Unreachable mock fallback in error handler |
| WARN-2 | Logging | LOW | `StudentDetailModal.tsx:59,71,75,79` | 4 console.warns -- acceptable but could use logger |

---

## 12. Positive Findings

1. **Reports E2E: 19/19 endpoints fully wired** -- generateReport, getRecentReports, getReportStats, downloadReport, deleteReport, getReportStatus, plus 7 scheduled and 6 shared report endpoints all have matching frontend and backend implementations.

2. **Alerts E2E: 14/14 endpoints fully wired** -- 7 intervention alert endpoints + 7 alert configuration endpoints all have clean Page -> Hook -> API Service -> Controller -> Service chains.

3. **Zero TODOs/FIXMEs** -- No incomplete work markers in any teacher file.

4. **Zero console.log in production code** -- Clean console discipline; only `console.error` (in catch blocks) and `console.warn` (in edge case guards).

5. **Feature flags properly centralized** -- `FEATURE_FLAGS.SHOW_UNDER_CONSTRUCTION` and `FEATURE_FLAGS.USE_MOCK_DATA` both source from environment variables through the central `api.config.ts` configuration.

6. **Optimistic UI updates** -- The `useInterventionAlerts` hook implements optimistic updates for acknowledge, resolve, and dismiss actions, providing responsive UX.

7. **Well-structured barrel exports** -- `services/api/teacher/index.ts` cleanly re-exports all 15 API services and their types.

---

*Report generated by Stream B audit agent, 2026-02-21*
