# FINDINGS-C4: Endpoint Duplications

**Date:** 2026-02-20
**Agent:** C (API Completeness)
**Scope:** Duplicate API patterns across frontend service files

---

## Summary

| Category | Count | Severity |
|----------|-------|----------|
| Same endpoint, different API files | 4 | MEDIUM |
| Same endpoint, same file (alias) | 1 | LOW |
| URL constant duplicates in api.config.ts | 2 | LOW |
| manualReviewApi canonical vs teacher index | 1 | INFO |

---

## DUP-1: `assignmentsApi.gradeSubmission()` vs `gradingApi.submitFeedback()`

| Aspect | assignmentsApi | gradingApi |
|--------|---------------|------------|
| **File** | assignmentsApi.ts | gradingApi.ts |
| **Function** | `gradeSubmission(submissionId, data)` | `submitFeedback(submissionId, feedback)` |
| **HTTP** | POST | POST |
| **URL** | `API_ENDPOINTS.teacher.gradeSubmission(submissionId)` = `/teacher/submissions/:submissionId/feedback` | `API_ENDPOINTS.teacher.submissions.feedback(submissionId)` = `/teacher/submissions/:submissionId/feedback` |
| **Backend handler** | `TeacherController.submitFeedback` | `TeacherController.submitFeedback` |
| **DTO type** | `GradeSubmissionDto { score, feedback?, grade? }` | `SubmitFeedbackDto { score, max_score, feedback, grade?, is_approved }` |

**Analysis:**
- Both hit the **exact same** backend endpoint: `POST /teacher/submissions/:submissionId/feedback`
- The DTOs are **different**: `GradeSubmissionDto` is simpler (3 fields), while `SubmitFeedbackDto` is more complete (5 fields including `max_score` and `is_approved`)
- The backend `SubmitFeedbackDto` expects `score`, `max_score`, `feedback`, and `is_approved` -- the assignmentsApi version sends incomplete data

**Severity:** MEDIUM

**Recommendation:**
1. Designate `gradingApi.submitFeedback()` as the **canonical** function (more complete DTO)
2. Remove `assignmentsApi.gradeSubmission()` and update callers to use `gradingApi.submitFeedback()`
3. Alternatively, make `assignmentsApi.gradeSubmission()` a thin wrapper that calls `gradingApi.submitFeedback()` internally

---

## DUP-2: `assignmentsApi.getSubmissionById()` vs `gradingApi.getSubmissionById()`

| Aspect | assignmentsApi | gradingApi |
|--------|---------------|------------|
| **File** | assignmentsApi.ts | gradingApi.ts |
| **Function** | `getSubmissionById(submissionId)` | `getSubmissionById(submissionId)` |
| **HTTP** | GET | GET |
| **URL** | `API_ENDPOINTS.teacher.submission(submissionId)` = `/teacher/submissions/:submissionId` | `API_ENDPOINTS.teacher.submissions.get(submissionId)` = `/teacher/submissions/:submissionId` |
| **Backend handler** | `TeacherController.getSubmissionById` | `TeacherController.getSubmissionById` |
| **Return type** | `Submission` | `SubmissionDetail` (extends Submission with more fields) |

**Analysis:**
- Exact same backend endpoint
- The `gradingApi` version types the return as `SubmissionDetail` which is more descriptive
- Two different URL constants point to the same path

**Severity:** MEDIUM

**Recommendation:**
1. Designate `gradingApi.getSubmissionById()` as canonical (richer return type)
2. Remove duplicate from assignmentsApi or make it delegate to gradingApi

---

## DUP-3: `analyticsApi.generateReport()` vs `reportsApi.generateReport()`

| Aspect | analyticsApi | reportsApi |
|--------|-------------|------------|
| **File** | analyticsApi.ts | reportsApi.ts |
| **Function** | `generateReport(config)` | `generateReport(dto)` |
| **HTTP** | POST | POST |
| **URL** | `API_ENDPOINTS.teacher.generateReport` = `/teacher/reports/generate` | `/teacher/reports/generate` (hardcoded) |
| **Backend handler** | `TeacherController.generateInsightsReport` | `TeacherController.generateInsightsReport` |
| **Response handling** | Expects JSON `Report` object | Uses `responseType: 'blob'` + extracts metadata from headers |

**Analysis:**
- **Same endpoint, fundamentally different response handling**
- The backend sends a **binary file** (PDF/Excel/CSV) with metadata in HTTP headers
- `reportsApi.generateReport()` correctly uses `responseType: 'blob'` -- this is the RIGHT approach
- `analyticsApi.generateReport()` expects a JSON response -- this would **FAIL** at runtime because the backend returns binary data, not JSON
- This is a **potential bug**: if any component calls `analyticsApi.generateReport()`, the response would be corrupted binary data attempted to be parsed as JSON

**Severity:** HIGH (potential runtime error)

**Recommendation:**
1. **Remove** `analyticsApi.generateReport()` entirely -- it cannot work correctly
2. All callers should use `reportsApi.generateReport()` which handles binary response correctly
3. If a JSON-based "start report generation" flow is needed in the future (async), create a separate function with a different name

---

## DUP-4: `analyticsApi.getReportStatus()` -- Sole Owner

| Aspect | analyticsApi |
|--------|-------------|
| **File** | analyticsApi.ts |
| **Function** | `getReportStatus(reportId)` |
| **HTTP** | GET |
| **URL** | `API_ENDPOINTS.teacher.reportStatus(reportId)` = `/teacher/reports/:reportId/status` |
| **Backend handler** | `TeacherController.getReportStatus` |

**Analysis:**
- This function is only in `analyticsApi.ts`, not in `reportsApi.ts`
- Logically, report status checking belongs with other report functions in `reportsApi.ts`
- Not a duplication per se, but a **misplacement**

**Severity:** LOW

**Recommendation:**
1. Move `getReportStatus()` to `reportsApi.ts` alongside other report functions
2. Keep a re-export in analyticsApi for backwards compatibility if needed

---

## DUP-5: URL Constant Duplicates in api.config.ts

### 5a: Report Generation
```typescript
// Under teacher.generateReport (line 470)
generateReport: '/teacher/reports/generate',

// Under teacher.reports.generate (line 481)
generate: '/teacher/reports/generate',
```
Both point to the same URL. `teacher.generateReport` is used by `analyticsApi`, `teacher.reports.generate` is not directly referenced (the reports constant group is for future use).

### 5b: Submission by ID
```typescript
// Under teacher (line 459)
submission: (submissionId: string) => `/teacher/submissions/${submissionId}`,

// Under teacher.submissions (line 576)
get: (submissionId: string) => `/teacher/submissions/${submissionId}`,
```
Both point to the same URL. `teacher.submission` is used by `assignmentsApi`, `teacher.submissions.get` is used by `gradingApi`.

**Severity:** LOW

**Recommendation:** Clean up duplicate constants. Keep the nested versions (`teacher.reports.generate`, `teacher.submissions.get`) as canonical and update callers.

---

## DUP-6: manualReviewApi Location

| Aspect | Details |
|--------|---------|
| **Canonical location** | `apps/frontend/src/shared/api/manualReviewApi.ts` |
| **Teacher index** | Comment in `index.ts`: "manualReviewApi removed -- canonical is @/shared/api/manualReviewApi" |
| **Re-exported** | No -- only types are re-exported from teacher index |

**Analysis:**
- `manualReviewApi` was moved from teacher-specific to shared because it may be needed by the student portal (for viewing review status)
- This is **intentional and correct** -- not a bug
- The teacher index file properly documents this with a comment

**Severity:** INFO (no action needed)

---

## Duplication Impact Matrix

| Dup ID | Files Affected | Components at Risk | Recommended Action |
|--------|---------------|-------------------|-------------------|
| DUP-1 | assignmentsApi, gradingApi | CreateAssignmentModal, any grading page | Remove assignmentsApi.gradeSubmission, use gradingApi |
| DUP-2 | assignmentsApi, gradingApi | Assignment detail views | Remove assignmentsApi.getSubmissionById, use gradingApi |
| DUP-3 | analyticsApi, reportsApi | TeacherAnalytics page | **Remove** analyticsApi.generateReport (broken) |
| DUP-4 | analyticsApi (misplaced) | Report status polling | Move to reportsApi |
| DUP-5 | api.config.ts | All consumers | Consolidate constants |
| DUP-6 | shared/api, teacher/api | N/A | INFO only |

---

## Guard Check: `gradingApi.submitFeedback()` vs `assignmentsApi.gradeSubmission()` Investigation

**Question from task:** "Are they calling the same endpoint?"

**Answer: YES.** Both call `POST /teacher/submissions/:submissionId/feedback` which maps to `TeacherController.submitFeedback()`. The difference is only in the frontend DTO shape:

- `assignmentsApi.gradeSubmission()` sends: `{ score, feedback?, grade? }`
- `gradingApi.submitFeedback()` sends: `{ score, max_score, feedback, grade?, is_approved }`

The backend handler (`GradingService.submitFeedback`) accepts all fields, so both work, but `gradingApi` provides a more complete payload. **Consolidate to gradingApi.**

---

## Guard Check: `manualReviewApi` in shared vs teacher-specific

**Question from task:** Check `manualReviewApi` in shared API vs teacher-specific review APIs.

**Answer:** There is only ONE `manualReviewApi`, located at `apps/frontend/src/shared/api/manualReviewApi.ts`. It was previously in the teacher API directory but was moved to shared. The teacher index file (`index.ts`) documents this with a comment and does NOT re-export it. Components that need manual review API import directly from `@/shared/api/manualReviewApi`.

There is **no duplication** between shared and teacher-specific review APIs. The `manualReviewApi` in shared is the sole canonical source for review operations (getPendingReviews, getMyReviews, getReviewById, startReview, updateReview, completeReview).

The backend endpoints in `manual-review.controller.ts` that lack frontend callers (createReview, returnForRevision, getManualReviewConfig, getPendingByModule, getPendingStats) are documented in FINDINGS-C3.
