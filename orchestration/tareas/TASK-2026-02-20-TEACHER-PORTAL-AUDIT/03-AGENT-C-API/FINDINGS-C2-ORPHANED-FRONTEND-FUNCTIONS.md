# FINDINGS-C2: Orphaned Frontend Functions

**Date:** 2026-02-20
**Agent:** C (API Completeness)
**Scope:** Frontend API functions with no unique backend endpoint

---

## Summary

There are **6 frontend API functions** that do not map to a unique, dedicated backend endpoint. However, none of them are truly "orphaned" in the sense of calling a non-existent endpoint. They fall into two categories: (A) convenience wrappers, and (B) duplicate callers of existing endpoints.

---

## Category A: Convenience Wrappers / Non-Teacher Endpoints

### F1: `gradingApi.getPendingCount(classroomId?)`

| Field | Value |
|-------|-------|
| **File** | `apps/frontend/src/services/api/teacher/gradingApi.ts` |
| **URL** | `/teacher/submissions` (with params `status=pending`) |
| **Backend match** | YES -- calls `getSubmissions` with a filter |
| **Used by components** | Likely used for badge counts in UI |
| **Risk level** | NONE |
| **Recommendation** | This is a valid convenience wrapper, not orphaned. Keep as-is. |

### F2: `assignmentsApi.getAvailableExercises()`

| Field | Value |
|-------|-------|
| **File** | `apps/frontend/src/services/api/teacher/assignmentsApi.ts` |
| **URL** | `/educational/exercises` (via `API_ENDPOINTS.educational.exercises`) |
| **Backend match** | YES -- calls educational module controller, not teacher module |
| **Used by components** | Used in `CreateAssignmentModal.tsx` for exercise picker |
| **Risk level** | LOW |
| **Recommendation** | This is valid cross-module access. The teacher portal legitimately needs to list exercises from the educational module when creating assignments. However, consider documenting this cross-module dependency. |

---

## Category B: Duplicate Callers (Same Endpoint, Different API File)

These functions exist in one API file but call the same backend endpoint as a function in another API file. They are not orphaned -- the backend endpoint exists. See FINDINGS-C4 for duplication analysis.

### F3: `assignmentsApi.getSubmissionById(submissionId)`

| Field | Value |
|-------|-------|
| **File** | `apps/frontend/src/services/api/teacher/assignmentsApi.ts` |
| **URL** | `/teacher/submissions/:submissionId` (via `API_ENDPOINTS.teacher.submission(submissionId)`) |
| **Duplicate of** | `gradingApi.getSubmissionById(submissionId)` |
| **Backend handler** | `TeacherController.getSubmissionById` |
| **Risk level** | LOW |
| **Recommendation** | Consolidate to single canonical location (gradingApi). See FINDINGS-C4. |

### F4: `assignmentsApi.gradeSubmission(submissionId, data)`

| Field | Value |
|-------|-------|
| **File** | `apps/frontend/src/services/api/teacher/assignmentsApi.ts` |
| **URL** | `/teacher/submissions/:submissionId/feedback` (via `API_ENDPOINTS.teacher.gradeSubmission(submissionId)`) |
| **Duplicate of** | `gradingApi.submitFeedback(submissionId, feedback)` |
| **Backend handler** | `TeacherController.submitFeedback` |
| **Risk level** | LOW |
| **Recommendation** | Consolidate to single canonical location (gradingApi). See FINDINGS-C4. |

### F5: `analyticsApi.generateReport(config)`

| Field | Value |
|-------|-------|
| **File** | `apps/frontend/src/services/api/teacher/analyticsApi.ts` |
| **URL** | `/teacher/reports/generate` (via `API_ENDPOINTS.teacher.generateReport`) |
| **Duplicate of** | `reportsApi.generateReport(dto)` |
| **Backend handler** | `TeacherController.generateInsightsReport` |
| **Risk level** | MEDIUM |
| **Recommendation** | These have DIFFERENT return types. `analyticsApi.generateReport()` expects JSON response, while `reportsApi.generateReport()` expects a Blob (binary file). The backend endpoint returns a binary stream, so `reportsApi` is correct. `analyticsApi.generateReport()` would fail to parse the response properly. Should be removed from analyticsApi or documented as legacy. |

### F6: `analyticsApi.getReportStatus(reportId)`

| Field | Value |
|-------|-------|
| **File** | `apps/frontend/src/services/api/teacher/analyticsApi.ts` |
| **URL** | `/teacher/reports/:reportId/status` (via `API_ENDPOINTS.teacher.reportStatus(reportId)`) |
| **Duplicate of** | Could be in reportsApi but currently only in analyticsApi |
| **Backend handler** | `TeacherController.getReportStatus` |
| **Risk level** | NONE |
| **Recommendation** | Consider moving to reportsApi for consistency, since all other report endpoints are there. |

---

## Conclusion

**No truly orphaned frontend functions exist.** All frontend API functions call valid backend endpoints. The 6 items identified are either:
1. Client-side convenience wrappers (1 case)
2. Cross-module calls to valid endpoints (1 case)
3. Duplicate callers of the same endpoint in different API files (4 cases)

The only actionable risk is **F5** where `analyticsApi.generateReport()` uses `responseType: 'json'` (default) for an endpoint that returns binary data. If called, it would fail. This should be removed or marked as deprecated.
