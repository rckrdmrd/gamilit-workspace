# MATRIX-C1: Teacher Portal Endpoint Cross-Reference

**Date:** 2026-02-20
**Agent:** C (API Completeness)
**Scope:** All backend controller endpoints in teacher module vs all frontend API service functions

---

## Summary

| Metric | Count |
|--------|-------|
| Backend endpoints (teacher module) | 88 |
| Frontend API functions | 87 |
| MATCHED | 81 |
| FRONTEND-ONLY (no backend match) | 6 |
| BACKEND-ONLY (no frontend caller) | 7 |
| MISMATCHED-URL | 0 |

---

## 1. Dashboard (teacher.controller.ts - base: `/teacher`)

| # | Backend Route | Method | Controller | Handler | FE API File | FE Function | Status |
|---|---------------|--------|------------|---------|-------------|-------------|--------|
| 1 | `/teacher/dashboard/stats` | GET | TeacherController | getClassroomStats | teacherApi.ts | getDashboardStats() | MATCHED |
| 2 | `/teacher/dashboard/activities` | GET | TeacherController | getRecentActivities | teacherApi.ts | getRecentActivities() | MATCHED |
| 3 | `/teacher/dashboard/alerts` | GET | TeacherController | getStudentAlerts | teacherApi.ts | getStudentAlerts() | MATCHED |
| 4 | `/teacher/dashboard/top-performers` | GET | TeacherController | getTopPerformers | teacherApi.ts | getTopPerformers() | MATCHED |
| 5 | `/teacher/dashboard/module-progress` | GET | TeacherController | getModuleProgressSummary | teacherApi.ts | getModuleProgressSummary() | MATCHED |

---

## 2. Student Progress (teacher.controller.ts - base: `/teacher`)

| # | Backend Route | Method | Controller | Handler | FE API File | FE Function | Status |
|---|---------------|--------|------------|---------|-------------|-------------|--------|
| 6 | `/teacher/students/:studentId/progress` | GET | TeacherController | getStudentProgress | studentProgressApi.ts | getStudentProgress() | MATCHED |
| 7 | `/teacher/students/:studentId/overview` | GET | TeacherController | getStudentOverview | studentProgressApi.ts | getStudentOverview() | MATCHED |
| 8 | `/teacher/students/:studentId/stats` | GET | TeacherController | getStudentStats | studentProgressApi.ts | getStudentStats() | MATCHED |
| 9 | `/teacher/students/:studentId/notes` | GET | TeacherController | getStudentNotes | studentProgressApi.ts | getStudentNotes() | MATCHED |
| 10 | `/teacher/students/:studentId/note` | POST | TeacherController | addStudentNote | studentProgressApi.ts | addStudentNote() | MATCHED |
| 11 | `/teacher/students/:studentId/insights` | GET | TeacherController | getStudentInsights | analyticsApi.ts | getStudentInsights() | MATCHED |

---

## 3. Grading/Submissions (teacher.controller.ts - base: `/teacher`)

| # | Backend Route | Method | Controller | Handler | FE API File | FE Function | Status |
|---|---------------|--------|------------|---------|-------------|-------------|--------|
| 12 | `/teacher/submissions` | GET | TeacherController | getSubmissions | gradingApi.ts | getSubmissions() | MATCHED |
| 13 | `/teacher/submissions/:id` | GET | TeacherController | getSubmissionById | gradingApi.ts | getSubmissionById() | MATCHED |
| 14 | `/teacher/submissions/:submissionId/feedback` | POST | TeacherController | submitFeedback | gradingApi.ts | submitFeedback() | MATCHED |
| 15 | `/teacher/submissions/bulk-grade` | POST | TeacherController | bulkGrade | gradingApi.ts | bulkGrade() | MATCHED |

---

## 4. Analytics (teacher.controller.ts - base: `/teacher`)

| # | Backend Route | Method | Controller | Handler | FE API File | FE Function | Status |
|---|---------------|--------|------------|---------|-------------|-------------|--------|
| 16 | `/teacher/analytics` | GET | TeacherController | getClassroomAnalytics | analyticsApi.ts | getClassroomAnalytics() | MATCHED |
| 17 | `/teacher/analytics/classroom/:id` | GET | TeacherController | getClassroomAnalyticsByClassroomId | - | - | BACKEND-ONLY |
| 18 | `/teacher/analytics/assignment/:id` | GET | TeacherController | getAssignmentAnalytics | - | - | BACKEND-ONLY |
| 19 | `/teacher/analytics/engagement` | GET | TeacherController | getEngagementMetrics | analyticsApi.ts | getEngagementMetrics() | MATCHED |
| 20 | `/teacher/analytics/reports` | GET | TeacherController | generateReports | analyticsApi.ts | generateReport() | MATCHED |
| 21 | `/teacher/analytics/economy` | GET | TeacherController | getEconomyAnalytics | analyticsApi.ts | getEconomyAnalytics() | MATCHED |
| 22 | `/teacher/analytics/students-economy` | GET | TeacherController | getStudentsEconomy | analyticsApi.ts | getStudentsEconomy() | MATCHED |
| 23 | `/teacher/analytics/achievements` | GET | TeacherController | getAchievementsStats | analyticsApi.ts | getAchievementsStats() | MATCHED |

---

## 5. Reports (teacher.controller.ts - base: `/teacher`)

| # | Backend Route | Method | Controller | Handler | FE API File | FE Function | Status |
|---|---------------|--------|------------|---------|-------------|-------------|--------|
| 24 | `/teacher/reports/generate` | POST | TeacherController | generateInsightsReport | reportsApi.ts | generateReport() | MATCHED |
| 25 | `/teacher/reports/recent` | GET | TeacherController | getRecentReports | reportsApi.ts | getRecentReports() | MATCHED |
| 26 | `/teacher/reports/stats` | GET | TeacherController | getReportStats | reportsApi.ts | getReportStats() | MATCHED |
| 27 | `/teacher/reports/:id/status` | GET | TeacherController | getReportStatus | analyticsApi.ts | getReportStatus() | MATCHED |
| 28 | `/teacher/reports/:id/download` | GET | TeacherController | downloadReport | reportsApi.ts | downloadReport() | MATCHED |
| 29 | `/teacher/reports/:id` | DELETE | TeacherController | deleteReport | reportsApi.ts | deleteReport() | MATCHED |

---

## 6. Scheduled Reports (teacher.controller.ts - base: `/teacher`)

| # | Backend Route | Method | Controller | Handler | FE API File | FE Function | Status |
|---|---------------|--------|------------|---------|-------------|-------------|--------|
| 30 | `/teacher/reports/scheduled` | GET | TeacherController | getScheduledReports | scheduledReportsApi.ts | getScheduledReports() | MATCHED |
| 31 | `/teacher/reports/scheduled` | POST | TeacherController | createScheduledReport | scheduledReportsApi.ts | createScheduledReport() | MATCHED |
| 32 | `/teacher/reports/scheduled/:id` | GET | TeacherController | getScheduledReportById | scheduledReportsApi.ts | getScheduledReportById() | MATCHED |
| 33 | `/teacher/reports/scheduled/:id` | PUT | TeacherController | updateScheduledReport | scheduledReportsApi.ts | updateScheduledReport() | MATCHED |
| 34 | `/teacher/reports/scheduled/:id` | DELETE | TeacherController | deleteScheduledReport | scheduledReportsApi.ts | deleteScheduledReport() | MATCHED |
| 35 | `/teacher/reports/scheduled/:id/pause` | POST | TeacherController | pauseScheduledReport | scheduledReportsApi.ts | pauseScheduledReport() | MATCHED |
| 36 | `/teacher/reports/scheduled/:id/resume` | POST | TeacherController | resumeScheduledReport | scheduledReportsApi.ts | resumeScheduledReport() | MATCHED |

---

## 7. Shared Reports (teacher.controller.ts - base: `/teacher`)

| # | Backend Route | Method | Controller | Handler | FE API File | FE Function | Status |
|---|---------------|--------|------------|---------|-------------|-------------|--------|
| 37 | `/teacher/reports/share` | POST | TeacherController | shareReport | sharedReportsApi.ts | shareReport() | MATCHED |
| 38 | `/teacher/reports/shared/by-me` | GET | TeacherController | getSharedByMe | sharedReportsApi.ts | getSharedByMe() | MATCHED |
| 39 | `/teacher/reports/shared/with-me` | GET | TeacherController | getSharedWithMe | sharedReportsApi.ts | getSharedWithMe() | MATCHED |
| 40 | `/teacher/reports/shared/:id/view` | POST | TeacherController | markSharedReportViewed | sharedReportsApi.ts | markViewed() | MATCHED |
| 41 | `/teacher/reports/shared/:id` | DELETE | TeacherController | revokeSharedReport | sharedReportsApi.ts | revokeShare() | MATCHED |
| 42 | `/teacher/reports/shared/:id/permission` | PUT | TeacherController | updateSharePermission | sharedReportsApi.ts | updatePermission() | MATCHED |

---

## 8. Bonus ML Coins (teacher.controller.ts - base: `/teacher`)

| # | Backend Route | Method | Controller | Handler | FE API File | FE Function | Status |
|---|---------------|--------|------------|---------|-------------|-------------|--------|
| 43 | `/teacher/students/:studentId/bonus` | POST | TeacherController | grantBonus | bonusCoinsApi.ts | grantBonus() | MATCHED |

---

## 9. Classrooms (teacher-classrooms.controller.ts - base: `/teacher/classrooms`)

| # | Backend Route | Method | Controller | Handler | FE API File | FE Function | Status |
|---|---------------|--------|------------|---------|-------------|-------------|--------|
| 44 | `/teacher/classrooms` | GET | TeacherClassroomsController | getClassrooms | classroomsApi.ts | getClassrooms() | MATCHED |
| 45 | `/teacher/classrooms` | POST | TeacherClassroomsController | createClassroom | classroomsApi.ts | createClassroom() | MATCHED |
| 46 | `/teacher/classrooms/:id` | GET | TeacherClassroomsController | getClassroomById | classroomsApi.ts | getClassroomById() | MATCHED |
| 47 | `/teacher/classrooms/:id` | PUT | TeacherClassroomsController | updateClassroom | classroomsApi.ts | updateClassroom() | MATCHED |
| 48 | `/teacher/classrooms/:id` | DELETE | TeacherClassroomsController | deleteClassroom | classroomsApi.ts | deleteClassroom() | MATCHED |
| 49 | `/teacher/classrooms/:id/students` | GET | TeacherClassroomsController | getClassroomStudents | classroomsApi.ts | getClassroomStudents() | MATCHED |
| 50 | `/teacher/classrooms/:id/stats` | GET | TeacherClassroomsController | getClassroomStats | classroomsApi.ts | getClassroomStats() | MATCHED |
| 51 | `/teacher/classrooms/:classroomId/teachers` | GET | TeacherClassroomsController | getClassroomTeachers | - | - | BACKEND-ONLY |
| 52 | `/teacher/classrooms/:id/progress` | GET | TeacherClassroomsController | getClassroomProgress | classroomsApi.ts | getClassroomProgress() | MATCHED |

---

## 10. Student Blocking (teacher-classrooms.controller.ts - base: `/teacher/classrooms`)

| # | Backend Route | Method | Controller | Handler | FE API File | FE Function | Status |
|---|---------------|--------|------------|---------|-------------|-------------|--------|
| 53 | `/teacher/classrooms/:classroomId/students/:studentId/block` | POST | TeacherClassroomsController | blockStudent | classroomsApi.ts | blockStudent() | MATCHED |
| 54 | `/teacher/classrooms/:classroomId/students/:studentId/unblock` | POST | TeacherClassroomsController | unblockStudent | classroomsApi.ts | unblockStudent() | MATCHED |
| 55 | `/teacher/classrooms/:classroomId/students/:studentId/permissions` | GET | TeacherClassroomsController | getStudentPermissions | classroomsApi.ts | getStudentPermissions() | MATCHED |
| 56 | `/teacher/classrooms/:classroomId/students/:studentId/permissions` | PATCH | TeacherClassroomsController | updateStudentPermissions | - | - | BACKEND-ONLY |

---

## 11. Assignments (teacher-assignments.controller.ts - base: `/teacher/assignments`)

| # | Backend Route | Method | Controller | Handler | FE API File | FE Function | Status |
|---|---------------|--------|------------|---------|-------------|-------------|--------|
| 57 | `/teacher/assignments` | GET | TeacherAssignmentsController | getAssignments | assignmentsApi.ts | getAssignments() | MATCHED |
| 58 | `/teacher/assignments/upcoming` | GET | TeacherAssignmentsController | getUpcomingAssignments | assignmentsApi.ts | getUpcomingAssignments() | MATCHED |
| 59 | `/teacher/assignments/:id` | GET | TeacherAssignmentsController | getAssignmentById | assignmentsApi.ts | getAssignmentById() | MATCHED |
| 60 | `/teacher/assignments` | POST | TeacherAssignmentsController | createAssignment | assignmentsApi.ts | createAssignment() | MATCHED |
| 61 | `/teacher/assignments/:id` | PUT | TeacherAssignmentsController | updateAssignment | assignmentsApi.ts | updateAssignment() | MATCHED |
| 62 | `/teacher/assignments/:id` | DELETE | TeacherAssignmentsController | deleteAssignment | assignmentsApi.ts | deleteAssignment() | MATCHED |
| 63 | `/teacher/assignments/:id/submissions` | GET | TeacherAssignmentsController | getAssignmentSubmissions | assignmentsApi.ts | getAssignmentSubmissions() | MATCHED |
| 64 | `/teacher/assignments/:id/send-reminder` | POST | TeacherAssignmentsController | sendReminder | assignmentsApi.ts | sendReminder() | MATCHED |

---

## 12. Grades (teacher-grades.controller.ts - base: `/teacher/grades`)

| # | Backend Route | Method | Controller | Handler | FE API File | FE Function | Status |
|---|---------------|--------|------------|---------|-------------|-------------|--------|
| 65 | `/teacher/grades` | GET | TeacherGradesController | getGrades | - | - | BACKEND-ONLY |
| 66 | `/teacher/grades/:id` | GET | TeacherGradesController | getGradeById | - | - | BACKEND-ONLY |

---

## 13. Exercise Responses (exercise-responses.controller.ts - base: `/teacher`)

| # | Backend Route | Method | Controller | Handler | FE API File | FE Function | Status |
|---|---------------|--------|------------|---------|-------------|-------------|--------|
| 67 | `/teacher/attempts` | GET | ExerciseResponsesController | getAttempts | exerciseResponsesApi.ts | getAttempts() | MATCHED |
| 68 | `/teacher/attempts/:id` | GET | ExerciseResponsesController | getAttemptDetail | exerciseResponsesApi.ts | getAttemptDetail() | MATCHED |
| 69 | `/teacher/attempts/student/:studentId` | GET | ExerciseResponsesController | getAttemptsByStudent | exerciseResponsesApi.ts | getAttemptsByStudent() | MATCHED |
| 70 | `/teacher/exercises/:exerciseId/responses` | GET | ExerciseResponsesController | getExerciseResponses | exerciseResponsesApi.ts | getExerciseResponses() | MATCHED |

---

## 14. Intervention Alerts (intervention-alerts.controller.ts - base: `/teacher/alerts`)

| # | Backend Route | Method | Controller | Handler | FE API File | FE Function | Status |
|---|---------------|--------|------------|---------|-------------|-------------|--------|
| 71 | `/teacher/alerts` | GET | InterventionAlertsController | getAlerts | interventionAlertsApi.ts | getAlerts() | MATCHED |
| 72 | `/teacher/alerts/:id` | GET | InterventionAlertsController | getAlertById | interventionAlertsApi.ts | getAlertById() | MATCHED |
| 73 | `/teacher/alerts/:id/acknowledge` | PATCH | InterventionAlertsController | acknowledgeAlert | interventionAlertsApi.ts | acknowledgeAlert() | MATCHED |
| 74 | `/teacher/alerts/:id/resolve` | PATCH | InterventionAlertsController | resolveAlert | interventionAlertsApi.ts | resolveAlert() | MATCHED |
| 75 | `/teacher/alerts/:id/dismiss` | PATCH | InterventionAlertsController | dismissAlert | interventionAlertsApi.ts | dismissAlert() | MATCHED |
| 76 | `/teacher/alerts/student/:studentId/history` | GET | InterventionAlertsController | getStudentAlertHistory | interventionAlertsApi.ts | getStudentAlertHistory() | MATCHED |
| 77 | `/teacher/alerts/generate` | POST | InterventionAlertsController | generateAlerts | interventionAlertsApi.ts | generateAlerts() | MATCHED |

---

## 15. Alert Configuration (alert-config.controller.ts - base: `/teacher/alert-config`)

| # | Backend Route | Method | Controller | Handler | FE API File | FE Function | Status |
|---|---------------|--------|------------|---------|-------------|-------------|--------|
| 78 | `/teacher/alert-config` | GET | AlertConfigController | getConfigurations | alertConfigApi.ts | getConfigurations() | MATCHED |
| 79 | `/teacher/alert-config/defaults` | GET | AlertConfigController | getDefaults | alertConfigApi.ts | getDefaults() | MATCHED |
| 80 | `/teacher/alert-config/:id` | GET | AlertConfigController | getConfiguration | alertConfigApi.ts | getConfiguration() | MATCHED |
| 81 | `/teacher/alert-config` | POST | AlertConfigController | createConfiguration | alertConfigApi.ts | createConfiguration() | MATCHED |
| 82 | `/teacher/alert-config/initialize` | POST | AlertConfigController | initializeDefaults | alertConfigApi.ts | initializeDefaults() | MATCHED |
| 83 | `/teacher/alert-config/:id` | PUT | AlertConfigController | updateConfiguration | alertConfigApi.ts | updateConfiguration() | MATCHED |
| 84 | `/teacher/alert-config/:id` | DELETE | AlertConfigController | deleteConfiguration | alertConfigApi.ts | deleteConfiguration() | MATCHED |

---

## 16. Manual Review (manual-review.controller.ts - base: `/teacher/reviews`)

| # | Backend Route | Method | Controller | Handler | FE API File | FE Function | Status |
|---|---------------|--------|------------|---------|-------------|-------------|--------|
| 85 | `/teacher/reviews/config/exercises` | GET | ManualReviewController | getManualReviewConfig | - | - | BACKEND-ONLY |
| 86 | `/teacher/reviews/pending` | GET | ManualReviewController | getPendingReviews | manualReviewApi.ts | getPendingReviews() | MATCHED |
| 87 | `/teacher/reviews/pending/module/:moduleOrder` | GET | ManualReviewController | getPendingByModule | - | - | BACKEND-ONLY (constant defined but no function) |
| 88 | `/teacher/reviews/stats` | GET | ManualReviewController | getPendingStats | - | - | BACKEND-ONLY (constant defined, no FE function reads it) |
| 89 | `/teacher/reviews/my-reviews` | GET | ManualReviewController | getMyReviews | manualReviewApi.ts | getMyReviews() | MATCHED |
| 90 | `/teacher/reviews/:id` | GET | ManualReviewController | getReviewById | manualReviewApi.ts | getReviewById() | MATCHED |
| 91 | `/teacher/reviews` | POST | ManualReviewController | createReview | - | - | BACKEND-ONLY (constant defined, no FE function) |
| 92 | `/teacher/reviews/:id` | PUT | ManualReviewController | updateReview | manualReviewApi.ts | updateReview() | MATCHED |
| 93 | `/teacher/reviews/:id/start` | POST | ManualReviewController | startReview | manualReviewApi.ts | startReview() | MATCHED |
| 94 | `/teacher/reviews/:id/complete` | POST | ManualReviewController | completeReview | manualReviewApi.ts | completeReview() | MATCHED |
| 95 | `/teacher/reviews/:id/return` | POST | ManualReviewController | returnForRevision | - | - | BACKEND-ONLY (constant defined, no FE function) |

---

## 17. Communication (teacher-communication.controller.ts - base: `/teacher/messages` & `/teacher/communications`)

| # | Backend Route | Method | Controller | Handler | FE API File | FE Function | Status |
|---|---------------|--------|------------|---------|-------------|-------------|--------|
| 96 | `/teacher/messages` | GET | TeacherCommunicationController | getMessages | teacherMessagesApi.ts | getMessages() | MATCHED |
| 97 | `/teacher/messages` | POST | TeacherCommunicationController | sendMessage | teacherMessagesApi.ts | sendMessage() | MATCHED |
| 98 | `/teacher/messages/conversations` | GET | TeacherCommunicationController | getConversations | teacherMessagesApi.ts | getConversations() | MATCHED |
| 99 | `/teacher/messages/unread-count` | GET | TeacherCommunicationController | getUnreadCount | teacherMessagesApi.ts | getUnreadCount() | MATCHED |
| 100 | `/teacher/messages/:id` | GET | TeacherCommunicationController | getMessage | teacherMessagesApi.ts | getMessageById() | MATCHED |
| 101 | `/teacher/messages/:id/read` | POST | TeacherCommunicationController | markAsRead | teacherMessagesApi.ts | markAsRead() | MATCHED |
| 102 | `/teacher/messages/classroom/:classroomId/announcement` | POST | TeacherCommunicationController | sendClassroomAnnouncement | teacherMessagesApi.ts | sendClassroomAnnouncement() | MATCHED |
| 103 | `/teacher/messages/student/:studentId/feedback` | POST | TeacherCommunicationController | sendPrivateFeedback | teacherMessagesApi.ts | sendPrivateFeedback() | MATCHED |

---

## 18. Content Management (teacher-content.controller.ts - base: `/teacher/content`)

| # | Backend Route | Method | Controller | Handler | FE API File | FE Function | Status |
|---|---------------|--------|------------|---------|-------------|-------------|--------|
| 104 | `/teacher/content` | GET | TeacherContentController | findAll | teacherContentApi.ts | getContent() | MATCHED |
| 105 | `/teacher/content/:id` | GET | TeacherContentController | findOne | teacherContentApi.ts | getContentById() | MATCHED |
| 106 | `/teacher/content` | POST | TeacherContentController | create | teacherContentApi.ts | createContent() | MATCHED |
| 107 | `/teacher/content/:id` | PUT | TeacherContentController | update | teacherContentApi.ts | updateContent() | MATCHED |
| 108 | `/teacher/content/:id` | DELETE | TeacherContentController | delete | teacherContentApi.ts | deleteContent() | MATCHED |
| 109 | `/teacher/content/:id/clone` | POST | TeacherContentController | clone | teacherContentApi.ts | cloneContent() | MATCHED |
| 110 | `/teacher/content/:id/publish` | PATCH | TeacherContentController | publish | teacherContentApi.ts | publishContent() | MATCHED |

---

## FRONTEND-ONLY Functions (no backend match)

| # | FE API File | FE Function | URL Called | Notes |
|---|-------------|-------------|-----------|-------|
| F1 | gradingApi.ts | getPendingCount() | (derived) | Wrapper that calls getSubmissions({status:'pending'}) -- not a separate endpoint |
| F2 | assignmentsApi.ts | getAvailableExercises() | `/educational/exercises` | Calls **educational** module, not teacher |
| F3 | assignmentsApi.ts | getSubmissionById() | `/teacher/submissions/:id` | Duplicate of gradingApi.getSubmissionById() -- same endpoint |
| F4 | assignmentsApi.ts | gradeSubmission() | `/teacher/submissions/:submissionId/feedback` | Duplicate of gradingApi.submitFeedback() -- same endpoint |
| F5 | analyticsApi.ts | generateReport() | `/teacher/reports/generate` | Calls same endpoint as reportsApi.generateReport() but with different response type |
| F6 | analyticsApi.ts | getReportStatus() | `/teacher/reports/:id/status` | Calls same endpoint as reportsApi; defined in analyticsApi for convenience |

> Note: F1 is a client-side convenience method (not a separate API call), F2 calls a non-teacher endpoint, and F3-F6 are duplications addressed in FINDINGS-C4.
