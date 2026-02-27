# Teacher Portal API Reference

**Version:** 1.0.0 | **Base URL:** `/api/v1` | **Auth:** Bearer JWT (ADMIN_TEACHER or SUPER_ADMIN)

All endpoints require a valid JWT token obtained via the standard auth flow. The token must belong to a user with role `ADMIN_TEACHER` or `SUPER_ADMIN`. Teacher-scoped endpoints automatically restrict data to classrooms the authenticated teacher is assigned to.

---

## Table of Contents

1. [Dashboard](#1-dashboard)
2. [Classroom Management](#2-classroom-management)
3. [Assignments](#3-assignments)
4. [Student Progress](#4-student-progress)
5. [Grading and Submissions](#5-grading-and-submissions)
6. [Manual Reviews](#6-manual-reviews)
7. [Exercise Responses (Attempts)](#7-exercise-responses-attempts)
8. [Communication (Messages)](#8-communication-messages)
9. [Analytics](#9-analytics)
10. [Reports](#10-reports)
11. [Scheduled Reports](#11-scheduled-reports)
12. [Shared Reports](#12-shared-reports)
13. [Content Management](#13-content-management)
14. [Intervention Alerts](#14-intervention-alerts)
15. [Alert Configuration](#15-alert-configuration)

---

## 1. Dashboard

Base controller: `GET /teacher` — `TeacherController`

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/teacher/dashboard/stats` | Get aggregated classroom statistics (students, completion, scores) | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/dashboard/activities` | Get recent activities across teacher's classrooms. Query: `limit` (default 10) | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/dashboard/alerts` | Get active student alerts requiring teacher attention | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/dashboard/top-performers` | Get top performing students. Query: `limit` (default 5) | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/dashboard/module-progress` | Get progress summary across all educational modules | Bearer | ADMIN_TEACHER, SUPER_ADMIN |

---

## 2. Classroom Management

Base controller: `TeacherClassroomsController` — `/teacher/classrooms`

### Classroom CRUD

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/teacher/classrooms` | List all classrooms for the authenticated teacher (paginated). Query: `page`, `limit`, `search`, `status` (active/inactive/archived/all), `grade_level`, `subject` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| POST | `/teacher/classrooms` | Create a new classroom. Teacher is automatically assigned as owner. Body: `CreateTeacherClassroomDto` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/classrooms/:id` | Get detailed information about a specific classroom. Teacher must have access. | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| PUT | `/teacher/classrooms/:id` | Update an existing classroom. Body: `UpdateTeacherClassroomDto` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| DELETE | `/teacher/classrooms/:id` | Soft delete (archive) a classroom. Only the owner can delete. Cannot delete classrooms with active students. | Bearer | ADMIN_TEACHER, SUPER_ADMIN |

### Classroom Sub-Resources

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/teacher/classrooms/:id/students` | List students in a classroom (paginated). Query: `page`, `limit`, `search`, `status` (active/inactive/withdrawn/completed/all), `sort_by` (name/progress/score/last_activity), `sort_order` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/classrooms/:id/stats` | Get aggregated statistics for a classroom (counts, averages, completion rates) | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/classrooms/:classroomId/teachers` | List all teachers assigned to a classroom with their roles (owner/teacher/assistant) | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/classrooms/:id/progress` | Get comprehensive progress data including general stats and per-module breakdown | Bearer | ADMIN_TEACHER, SUPER_ADMIN |

### Student Blocking and Permissions

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| POST | `/teacher/classrooms/:classroomId/students/:studentId/block` | Block a student in a classroom (full or partial block by module). Body: `BlockStudentDto` with `reason`, `block_type`, `blocked_modules` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| POST | `/teacher/classrooms/:classroomId/students/:studentId/unblock` | Remove all blocks from a student, restoring full access | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/classrooms/:classroomId/students/:studentId/permissions` | Get current permissions and block status for a student | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| PATCH | `/teacher/classrooms/:classroomId/students/:studentId/permissions` | Update granular permissions for a student (allowed_modules, allowed_features). Body: `UpdatePermissionsDto` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |

---

## 3. Assignments

Base controller: `TeacherAssignmentsController` — `/teacher/assignments`

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/teacher/assignments` | List all assignments for the authenticated teacher. Query: `classroom_id`, `status` (draft/active/completed/expired), `start_date`, `end_date`, `page`, `limit` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/assignments/upcoming` | Get assignments with approaching deadlines. Query: `days` (default 7, number of days ahead to look) | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/assignments/:id` | Get detailed information about a specific assignment | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| POST | `/teacher/assignments` | Create a new assignment. Body: `CreateAssignmentDto` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| PUT | `/teacher/assignments/:id` | Update an existing assignment. Only the owner teacher can update. Body: `UpdateAssignmentDto` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| DELETE | `/teacher/assignments/:id` | Delete an assignment and all related data. Only owner can delete. | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/assignments/:id/submissions` | Get all submissions for a specific assignment, including student info and grading status | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| POST | `/teacher/assignments/:id/send-reminder` | Send reminder notification to students who have not yet submitted | Bearer | ADMIN_TEACHER, SUPER_ADMIN |

---

## 4. Student Progress

Base controller: `TeacherController` — `/teacher/students`

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/teacher/students/:studentId/progress` | Get complete student progress aligned with frontend `StudentProgress` interface. Query: `GetStudentProgressQueryDto` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/students/:studentId/overview` | Get student overview (summary stats) | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/students/:studentId/stats` | Get student statistics including gamification data, streaks, powerups, hints, and performance metrics | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/students/:studentId/notes` | Get all teacher notes written for this student across classrooms | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| POST | `/teacher/students/:studentId/note` | Add or update a teacher note for a student in a specific classroom. Body: `AddTeacherNoteDto` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/students/:studentId/insights` | Get AI-powered insights including strengths, weaknesses, predictions, and personalized recommendations | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| POST | `/teacher/students/:studentId/bonus` | Grant bonus ML Coins to a student. Teacher must have the student in one of their classrooms. Body: `GrantBonusDto` with `amount` and `reason` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |

---

## 5. Grading and Submissions

Base controller: `TeacherController` and `TeacherGradesController` — `/teacher/submissions` and `/teacher/grades`

### Submissions

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/teacher/submissions` | Get exercise submissions with filters. Query: `assignment_id`, `classroom_id`, `student_id`, `status`, `module_id`, `page`, `limit`, `sort_by` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/submissions/:id` | Get detailed information about a specific submission | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| POST | `/teacher/submissions/:submissionId/feedback` | Submit feedback for a submission. Body: `SubmitFeedbackDto` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| POST | `/teacher/submissions/bulk-grade` | Grade multiple submissions at once. Body: `BulkGradeDto` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |

### Grades (alias view over submissions)

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/teacher/grades` | Get all grades (scored submissions). Query: `assignment_id`, `classroom_id`, `student_id`, `status`, `sort_by`, `page`, `limit` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/grades/:id` | Get detailed grade information including full submission data, exercise details, and grading history | Bearer | ADMIN_TEACHER, SUPER_ADMIN |

---

## 6. Manual Reviews

Base controller: `ManualReviewController` — `/teacher/reviews`

Used for evaluating creative exercises in modules 4 and 5 that require human assessment.

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/teacher/reviews/config/exercises` | Get configuration of exercises that require manual review (modules and exercise list) | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/reviews/pending` | Get pending reviews for the authenticated teacher (paginated). Query: `moduleId`, `classroomId`, `page`, `limit` (max 100) | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/reviews/pending/module/:moduleOrder` | Get pending reviews filtered by module order number | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/reviews/stats` | Get review statistics (pending counts by priority: urgent/high/medium/normal). Query: `classroomId` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/reviews/my-reviews` | Get all reviews by the authenticated teacher. Query: `status` (pending/in_progress/completed/returned), `moduleId`, `exerciseId`, `classroomId` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/reviews/:id` | Get a specific review by ID | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| POST | `/teacher/reviews` | Create a new manual review. Body: `CreateReviewDto` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| PUT | `/teacher/reviews/:id` | Update an existing review. Body: `UpdateReviewDto` (all fields optional) | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| POST | `/teacher/reviews/:id/start` | Start a review — marks it as `in_progress` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| POST | `/teacher/reviews/:id/complete` | Complete a review, grade the submission, and distribute XP/ML Coins to the student | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| POST | `/teacher/reviews/:id/return` | Return a submission to the student for revision. Body: `ReturnForRevisionDto` with `feedback` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |

---

## 7. Exercise Responses (Attempts)

Base controller: `ExerciseResponsesController` — `/teacher`

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/teacher/attempts` | Get paginated exercise attempts with filters. Query: `student_id`, `exercise_id`, `module_id`, `classroom_id`, `date_from`, `date_to`, `is_correct`, `page`, `limit`, `sort_by`, `sort_order` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/attempts/:id` | Get detailed attempt including submitted answers, correct answers, exercise type, and max score | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/attempts/student/:studentId` | Get all exercise attempts by a specific student. Validates student is in teacher's classrooms. | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/exercises/:exerciseId/responses` | Get all student responses for a specific exercise (only from teacher's classrooms) | Bearer | ADMIN_TEACHER, SUPER_ADMIN |

---

## 8. Communication (Messages)

Base controller: `TeacherCommunicationController` — `/teacher/messages` (also aliased at `/teacher/communications`)

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/teacher/messages` | List messages with filters. Query: `classroom_id`, `type`, `unread` (boolean), `search`, `limit`, `offset` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| POST | `/teacher/messages` | Send a direct message to one or more students. Optionally associate to a classroom or assignment. Body: `SendMessageDto` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/messages/conversations` | Get messages grouped into conversations with unread counts per conversation | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/messages/unread-count` | Get total count of unread messages for the authenticated teacher | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/messages/:id` | Get a specific message by ID | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| POST | `/teacher/messages/:id/read` | Mark a specific message as read | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| POST | `/teacher/messages/classroom/:classroomId/announcement` | Send a classroom announcement (`classroom_announcement` type) to all students in the classroom. Body: `SendClassroomAnnouncementDto` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| POST | `/teacher/messages/student/:studentId/feedback` | Send private feedback (`private_feedback` type) to a specific student. Optionally linked to assignment or submission. Body: `SendPrivateFeedbackDto` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |

---

## 9. Analytics

Base controller: `TeacherController` — `/teacher/analytics`

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/teacher/analytics` | Get classroom analytics (general, across all teacher's classrooms). Query: `GetAnalyticsQueryDto` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/analytics/classroom/:id` | Get detailed analytics for a specific classroom including student performance, completion rates, and score distribution. Query: `GetAnalyticsQueryDto` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/analytics/assignment/:id` | Get analytics for a specific assignment including submission rates, grading status, and score distribution | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/analytics/engagement` | Get engagement metrics (active students, submission rates, classroom activity). Query: `GetEngagementMetricsDto` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/analytics/reports` | Generate comprehensive analytics reports across classrooms, assignments, and student performance. Query: `GenerateReportsDto` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/analytics/economy` | Get ML Coins economy analytics for teacher's classrooms (circulation, distribution, top earners). Query: `classroom_id` (optional) | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/analytics/students-economy` | Get ML Coins economy data per student (balance, weekly earnings/spending, Maya rank, level). Query: `classroom_id` (optional) | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/analytics/achievements` | Get achievement unlock statistics for students in teacher's classrooms (how many students unlocked each achievement). Query: `classroom_id` (optional) | Bearer | ADMIN_TEACHER, SUPER_ADMIN |

---

## 10. Reports

Base controller: `TeacherController` — `/teacher/reports`

### Report Generation (download)

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| POST | `/teacher/reports/generate` | Generate a student insights report (PDF, Excel, or CSV). Persists to storage and saves metadata to DB. Body: `GenerateReportDto` with `format` (pdf/excel/csv). Returns binary file. | Bearer | ADMIN_TEACHER, SUPER_ADMIN |

### Report Management

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/teacher/reports/recent` | Get list of recently generated reports. Query: `limit` (default 10) | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/reports/stats` | Get statistics about reports generated by the teacher (counts by format, date ranges) | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/reports/:id/status` | Get the generation status of a specific report (always `completed` if report exists) | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/reports/:id/download` | Download a previously generated report file. Validates teacher ownership. Returns binary file. | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| DELETE | `/teacher/reports/:id` | Delete a previously generated report. Validates teacher ownership. | Bearer | ADMIN_TEACHER, SUPER_ADMIN |

---

## 11. Scheduled Reports

Base controller: `TeacherController` — `/teacher/reports/scheduled`

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/teacher/reports/scheduled` | Get all scheduled report configurations for the authenticated teacher | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| POST | `/teacher/reports/scheduled` | Create a new scheduled report configuration. Body: `CreateScheduledReportDto` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/reports/scheduled/:id` | Get a specific scheduled report configuration by ID | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| PUT | `/teacher/reports/scheduled/:id` | Update a scheduled report configuration. Body: `UpdateScheduledReportDto` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| DELETE | `/teacher/reports/scheduled/:id` | Delete a scheduled report configuration | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| POST | `/teacher/reports/scheduled/:id/pause` | Pause execution of a scheduled report | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| POST | `/teacher/reports/scheduled/:id/resume` | Resume a paused scheduled report | Bearer | ADMIN_TEACHER, SUPER_ADMIN |

---

## 12. Shared Reports

Base controller: `TeacherController` — `/teacher/reports/shared`

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| POST | `/teacher/reports/share` | Share a report with another teacher. Body: `ShareReportDto` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/reports/shared/by-me` | Get all reports shared by the authenticated teacher | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/reports/shared/with-me` | Get all reports shared with the authenticated teacher | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| POST | `/teacher/reports/shared/:id/view` | Mark a shared report as viewed by the authenticated teacher | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| DELETE | `/teacher/reports/shared/:id` | Revoke access to a shared report | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| PUT | `/teacher/reports/shared/:id/permission` | Update the permission level (read/edit) for a shared report. Body: `{ permission: SharePermission }` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |

---

## 13. Content Management

Base controller: `TeacherContentController` — `/teacher/content`

### Teacher's Own Content (CRUD)

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/teacher/content` | List all educational content created by the authenticated teacher (paginated). Query: `page`, `limit`, `search`, `content_type`, `status`, `visibility`, `subject_area`, `grade_level`, `difficulty_level`, `is_template`, `is_active` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/content/:id` | Get details of a specific content item (teacher must be the owner) | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| POST | `/teacher/content` | Create new educational content (exercise, worksheet, reading material, etc.). Body: `CreateTeacherContentDto` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| PUT | `/teacher/content/:id` | Update an existing content item. Only the owner teacher can update. Body: `UpdateTeacherContentDto` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| DELETE | `/teacher/content/:id` | Soft delete a content item (marks as inactive). Only owner can delete. | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| POST | `/teacher/content/:id/clone` | Clone an existing content item. Clone is created with status `draft`. Body: `CloneTeacherContentDto` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| PATCH | `/teacher/content/:id/publish` | Publish a content item (changes status to `published`, sets `published_at`) | Bearer | ADMIN_TEACHER, SUPER_ADMIN |

### Shared Resource Library (Browse and Interact)

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/teacher/content/resources` | Browse published resources shared with school or public visibility (paginated). Query: `type`, `category`, `search`, `page`, `limit`, `sort_by`, `sort_order` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/content/resources/:id` | Get detailed information about a specific shared resource, including rating and download count | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| POST | `/teacher/content/resources/:id/rate` | Rate a shared resource (1-5 stars, upsert — one rating per teacher per resource). Body: `ResourceRatingDto` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/content/resources/:id/comments` | Get paginated comments for a shared resource. Query: `page`, `limit` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| POST | `/teacher/content/resources/:id/comments` | Add a comment to a shared resource. Body: `AddCommentDto` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| POST | `/teacher/content/resources/:id/download` | Record that the authenticated teacher downloaded a shared resource (increments download counter) | Bearer | ADMIN_TEACHER, SUPER_ADMIN |

---

## 14. Intervention Alerts

Base controller: `InterventionAlertsController` — `/teacher/alerts`

Alerts are automatically generated by the system when student performance patterns indicate risk.

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/teacher/alerts` | List alerts for teacher's classrooms (paginated). Query: `classroom_id`, `alert_type`, `severity` (low/medium/high/critical), `status` (active/acknowledged/resolved/dismissed), `search`, `include_dismissed`, `limit`, `offset` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/alerts/:id` | Get full details of a specific alert including student info, classroom, metrics, and tracking | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| PATCH | `/teacher/alerts/:id/acknowledge` | Mark an alert as acknowledged (transitions from `active` to `acknowledged`) | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| PATCH | `/teacher/alerts/:id/resolve` | Mark an alert as resolved with required resolution notes. Body: `ResolveInterventionAlertDto` with `resolution_notes` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| PATCH | `/teacher/alerts/:id/dismiss` | Dismiss an alert (false positive or no action needed) | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/alerts/student/:studentId/history` | Get full alert history for a specific student across teacher's classrooms | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| POST | `/teacher/alerts/generate` | Manually trigger alert generation (calls SQL `generate_student_alerts()`). Intended for testing and debugging. | Bearer | ADMIN_TEACHER, SUPER_ADMIN |

---

## 15. Alert Configuration

Base controller: `AlertConfigController` — `/teacher/alert-config`

Allows teachers to customize thresholds and preferences for automatic alert generation.

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/teacher/alert-config` | List all alert configurations for the authenticated teacher. Query: `classroom_id`, `alert_type`, `is_enabled` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/alert-config/defaults` | Get default threshold values for each alert type (does not require DB lookup) | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| GET | `/teacher/alert-config/:id` | Get a specific alert configuration by ID | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| POST | `/teacher/alert-config` | Create a new alert configuration. Omit `classroom_id` for global settings. Body: `CreateAlertConfigDto` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| POST | `/teacher/alert-config/initialize` | Initialize all alert type configurations with default values for this teacher (skips existing). Query: `classroom_id` (optional) | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| PUT | `/teacher/alert-config/:id` | Update an existing alert configuration. Body: `UpdateAlertConfigDto` | Bearer | ADMIN_TEACHER, SUPER_ADMIN |
| DELETE | `/teacher/alert-config/:id` | Delete an alert configuration. Returns `204 No Content`. | Bearer | ADMIN_TEACHER, SUPER_ADMIN |

---

## Common Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (used on delete in alert-config) |
| 400 | Bad Request — invalid input, business rule violation |
| 401 | Unauthorized — missing or invalid JWT |
| 403 | Forbidden — user lacks required role or does not have access to the resource |
| 404 | Not Found — resource does not exist |
| 409 | Conflict — duplicate resource (e.g., classroom code already exists) |

## Common Query Parameter Conventions

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | number | Page number for pagination (default: 1) |
| `limit` | number | Items per page (default varies by endpoint) |
| `search` | string | Full-text search on relevant fields |
| `sort_by` | string | Field to sort by (options documented per endpoint) |
| `sort_order` | string | `asc` or `desc` |

## Notes

- All `:id` parameters are UUIDs unless otherwise stated.
- Teacher-scoped endpoints enforce Row Level Security (RLS) at the database level — teachers can only access data from their own classrooms.
- The `TeacherCommunicationController` is registered under both `/teacher/messages` and `/teacher/communications` (same handler, dual route).
- The `ExerciseResponsesController` base path is `/teacher` (not `/teacher/exercise-responses`), so attempt routes are `/teacher/attempts` and exercise routes are `/teacher/exercises/:id/responses`.
- Report download endpoints return binary file streams (`application/pdf`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, or `text/csv`). Response headers include `X-Report-ID`, `Content-Disposition`, and `Content-Length`.
