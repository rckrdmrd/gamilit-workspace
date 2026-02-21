# FINDINGS-C3: Orphaned Backend Endpoints

**Date:** 2026-02-20
**Agent:** C (API Completeness)
**Scope:** Backend endpoints with no frontend caller

---

## Summary

There are **10 backend endpoints** with no direct frontend API function calling them. Most are intentional (testing endpoints, partially implemented features, or endpoints with URL constants defined but no API wrapper function yet).

---

## Severity Classification

| Severity | Description | Count |
|----------|-------------|-------|
| HIGH | Should have a frontend caller but does not | 3 |
| MEDIUM | Useful endpoint, frontend could benefit | 3 |
| LOW | Intentional (testing, admin-only, or covered by other means) | 4 |

---

## HIGH Severity (Should Have Frontend Callers)

### B1: `GET /teacher/reviews/config/exercises`

| Field | Value |
|-------|-------|
| **Controller** | ManualReviewController |
| **Handler** | getManualReviewConfig() |
| **Purpose** | Returns modules and exercises that require manual review, replaces hardcoded data in frontend `manualReviewExercises.ts` |
| **api.config.ts constant** | `API_ENDPOINTS.teacher.reviews.config` = `/teacher/reviews/config/exercises` -- DEFINED |
| **Frontend function** | NONE -- constant exists but no API function wraps it |
| **Impact** | Frontend still uses hardcoded data for determining which exercises need manual review. When exercises are added/changed in DB, frontend won't reflect it. |
| **Recommendation** | Add `getManualReviewConfig()` to `manualReviewApi.ts` and replace hardcoded data in components. |

### B2: `POST /teacher/reviews` (Create Review)

| Field | Value |
|-------|-------|
| **Controller** | ManualReviewController |
| **Handler** | createReview() |
| **Purpose** | Creates a new manual review record for a submission |
| **api.config.ts constant** | `API_ENDPOINTS.teacher.reviews.create` = `/teacher/reviews` -- DEFINED |
| **Frontend function** | NONE |
| **Impact** | Currently manual reviews are created server-side or through other workflows. If the teacher portal needs to initiate reviews manually (e.g., for missed auto-creation), this endpoint would be needed. |
| **Recommendation** | Add `createReview()` to `manualReviewApi.ts`. This is needed for cases where automatic review creation fails or for retroactive review of previously auto-graded exercises. |

### B3: `POST /teacher/reviews/:id/return` (Return for Revision)

| Field | Value |
|-------|-------|
| **Controller** | ManualReviewController |
| **Handler** | returnForRevision() |
| **Purpose** | Returns a submission to the student for corrections with feedback |
| **api.config.ts constant** | `API_ENDPOINTS.teacher.reviews.return(id)` = `/teacher/reviews/:id/return` -- DEFINED |
| **Frontend function** | NONE |
| **Impact** | Teachers currently can only "complete" or leave a review pending. They cannot return work to students for corrections. This is a **key workflow gap** in the manual review process. |
| **Recommendation** | Add `returnForRevision()` to `manualReviewApi.ts` and add a "Return to Student" button in the review UI. |

---

## MEDIUM Severity (Useful but Not Critical)

### B4: `PATCH /teacher/classrooms/:classroomId/students/:studentId/permissions`

| Field | Value |
|-------|-------|
| **Controller** | TeacherClassroomsController |
| **Handler** | updateStudentPermissions() |
| **Purpose** | Updates granular permissions for a student (allowed_modules, allowed_features, flags) |
| **api.config.ts constant** | NOT DEFINED -- no URL constant in api.config.ts |
| **Frontend function** | NONE |
| **Impact** | Frontend has `blockStudent()` and `unblockStudent()` but no way to set granular permissions (e.g., allow some modules but not others). |
| **Recommendation** | Add endpoint constant to api.config.ts and create `updateStudentPermissions()` in classroomsApi.ts. This enables partial access control. |

### B5: `GET /teacher/analytics/classroom/:id`

| Field | Value |
|-------|-------|
| **Controller** | TeacherController |
| **Handler** | getClassroomAnalyticsByClassroomId() |
| **Purpose** | Gets detailed analytics for a specific classroom by ID |
| **api.config.ts constant** | NOT DEFINED |
| **Frontend function** | NONE -- frontend uses `getClassroomAnalytics()` with `classroom_id` as query param |
| **Impact** | The generic analytics endpoint with query param works, but this dedicated endpoint may have a different/richer response shape. |
| **Recommendation** | Either use the generic endpoint with query param (current approach is fine) or add this for more specific analytics. LOW priority. |

### B6: `GET /teacher/analytics/assignment/:id`

| Field | Value |
|-------|-------|
| **Controller** | TeacherController |
| **Handler** | getAssignmentAnalytics() |
| **Purpose** | Gets analytics for a specific assignment (submission rates, grading status, score distribution) |
| **api.config.ts constant** | NOT DEFINED |
| **Frontend function** | NONE |
| **Impact** | Teachers cannot see analytics broken down by individual assignment. This data would be valuable on assignment detail pages. |
| **Recommendation** | Add constant + API function. This would enrich the TeacherAssignments detail view with analytics data. |

---

## LOW Severity (Intentional / Not Needed)

### B7: `GET /teacher/grades`

| Field | Value |
|-------|-------|
| **Controller** | TeacherGradesController |
| **Handler** | getGrades() |
| **Purpose** | Alias/wrapper over submissions presented in "grade" format |
| **api.config.ts constant** | `API_ENDPOINTS.teacher.grades` = `/teacher/grades` -- DEFINED but unused |
| **Frontend function** | NONE |
| **Impact** | Frontend uses `gradingApi.getSubmissions()` directly. The grades controller is a presentation wrapper. |
| **Recommendation** | Keep as alternative endpoint. Frontend does not need it since submissions already have grade data. |

### B8: `GET /teacher/grades/:id`

| Field | Value |
|-------|-------|
| **Controller** | TeacherGradesController |
| **Handler** | getGradeById() |
| **Purpose** | Get grade detail by ID (wraps submission) |
| **api.config.ts constant** | NOT DEFINED |
| **Frontend function** | NONE |
| **Impact** | Same as B7 -- frontend uses submission endpoints directly. |
| **Recommendation** | Keep as alternative endpoint. No action needed. |

### B9: `GET /teacher/reviews/pending/module/:moduleOrder`

| Field | Value |
|-------|-------|
| **Controller** | ManualReviewController |
| **Handler** | getPendingByModule() |
| **Purpose** | Gets pending reviews filtered by module order number |
| **api.config.ts constant** | `API_ENDPOINTS.teacher.reviews.pendingByModule(moduleOrder)` -- DEFINED |
| **Frontend function** | NONE -- frontend uses `getPendingReviews()` with `moduleId` filter |
| **Impact** | None. The generic pending endpoint with moduleId filter provides the same data. This endpoint filters by module order number instead of UUID. |
| **Recommendation** | Keep as alternative. May be useful for simplified navigation. |

### B10: `GET /teacher/reviews/stats`

| Field | Value |
|-------|-------|
| **Controller** | ManualReviewController |
| **Handler** | getPendingStats() |
| **Purpose** | Gets statistics about pending reviews (totalPending, urgentCount, highCount, mediumCount, normalCount) |
| **api.config.ts constant** | `API_ENDPOINTS.teacher.reviews.stats` -- DEFINED |
| **Frontend function** | NONE |
| **Impact** | Teacher dashboard could display review stats badges. Currently frontend calculates counts client-side from the review list. |
| **Recommendation** | Add API wrapper function. Useful for dashboard summary without loading all reviews. |

---

## Endpoint Constants Analysis

| Endpoint | api.config.ts Constant | API Function |
|----------|----------------------|--------------|
| B1: reviews/config/exercises | DEFINED | MISSING |
| B2: reviews (POST) | DEFINED | MISSING |
| B3: reviews/:id/return | DEFINED | MISSING |
| B4: classrooms/:cId/students/:sId/permissions (PATCH) | NOT DEFINED | MISSING |
| B5: analytics/classroom/:id | NOT DEFINED | MISSING |
| B6: analytics/assignment/:id | NOT DEFINED | MISSING |
| B7: grades | DEFINED | MISSING |
| B8: grades/:id | NOT DEFINED | MISSING |
| B9: reviews/pending/module/:moduleOrder | DEFINED | MISSING |
| B10: reviews/stats | DEFINED | MISSING |

**Pattern:** 7 out of 10 orphaned endpoints already have URL constants defined in api.config.ts. The gap is only in the API wrapper functions.

---

## Classroom Teachers Endpoint Note

`GET /teacher/classrooms/:classroomId/teachers` (B51 in matrix) has a constant defined:
```typescript
classroomTeachers: (classroomId: string) => `/teacher/classrooms/${classroomId}/teachers`
```
But **no frontend function** wraps it. This endpoint returns teachers assigned to a classroom. It could be useful for the classroom management UI to show co-teachers. **Medium priority.**
