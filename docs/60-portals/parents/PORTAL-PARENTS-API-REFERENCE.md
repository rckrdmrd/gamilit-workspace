---
titulo: "Parents Portal API Reference"
tipo: api
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# Parents Portal API Reference

**Version:** 1.0.0 | **Base URL:** `/api/v1` | **Prefix:** `/parent-portal`

The parent portal uses a separate authentication system from the main platform. Public endpoints (auth) require no token. Protected endpoints use a `ParentAuthGuard` that validates a parent-specific JWT stored in the `Authorization: Bearer <token>` header.

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Student Linking](#2-student-linking)
3. [Dashboard](#3-dashboard)
4. [Progress Monitoring](#4-progress-monitoring)
5. [Reports](#5-reports)
6. [Notifications](#6-notifications)

---

## 1. Authentication

Base controller: `ParentAuthController` — `/parent-portal/auth`

All endpoints in this section are **public** (no authentication required).

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| POST | `/parent-portal/auth/register` | Register a new parent account with email and password. Body: `ParentRegisterDto` (email, password, full_name, etc.) | None | Public |
| POST | `/parent-portal/auth/login` | Authenticate a parent and return JWT access + refresh tokens. Body: `ParentLoginDto` (email, password). Returns `ParentAuthResponseDto`. | None | Public |
| POST | `/parent-portal/auth/refresh` | Obtain a new access token using a valid refresh token. Body: `{ refreshToken: string }`. Returns `ParentAuthTokensDto`. | None | Public |
| POST | `/parent-portal/auth/forgot-password` | Send a password reset email to the parent's address. Body: `{ email: string }`. Always returns 200 regardless of whether the account exists (security). | None | Public |
| POST | `/parent-portal/auth/verify-email` | Verify a parent's email address using the token sent in the verification email. Body: `{ token: string }`. | None | Public |

### Auth Response Shape

```
ParentAuthResponseDto {
  access_token: string
  refresh_token: string
  parent: {
    id: string
    email: string
    full_name: string
    is_verified: boolean
  }
}
```

---

## 2. Student Linking

Base controller: `ParentPortalController` — `/parent-portal`

All endpoints in this section require a valid parent JWT (Bearer token).

A parent must link their account to a student before they can view any student-specific data. Linking is a two-step process: the parent initiates a link request using the student's code, then verifies it with a confirmation code sent to the student.

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/parent-portal/students` | Get all students currently linked to the authenticated parent account. Returns `LinkedStudentDto[]`. | Bearer (parent) | Parent |
| POST | `/parent-portal/students/link` | Initiate a link request to a student using their unique student code. Body: `LinkStudentDto` (student_code). Returns `ParentStudentLink` with status `pending`. | Bearer (parent) | Parent |
| POST | `/parent-portal/students/verify` | Verify and activate a pending student link using the verification code. Body: `VerifyLinkDto` (verification_code). Returns activated `ParentStudentLink`. | Bearer (parent) | Parent |

### Link Status Values

| Status | Meaning |
|--------|---------|
| `pending` | Link request created, awaiting verification |
| `active` | Link verified and active — parent can view student data |
| `rejected` | Link was rejected or expired |

---

## 3. Dashboard

Base controller: `ParentPortalController` — `/parent-portal`

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/parent-portal/dashboard` | Get the complete parent dashboard including overview of all linked students, recent activities, upcoming assignments, and notification summary. Returns `ParentDashboardDto`. | Bearer (parent) | Parent |

### Dashboard Response Shape

```
ParentDashboardDto {
  students: LinkedStudentDto[]
  recent_activities: RecentActivityDto[]
  upcoming_assignments: UpcomingAssignmentDto[]
  unread_notifications: number
}
```

---

## 4. Progress Monitoring

Base controller: `ParentPortalController` — `/parent-portal/students/:studentId`

All endpoints require the authenticated parent to have an active link to the specified student. Returns `403` if the parent does not have access to the student.

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/parent-portal/students/:studentId/progress` | Get detailed academic and gamification progress for a specific student. Returns `StudentProgressSummaryDto` with module breakdown, XP, rank, completion rates, and score averages. | Bearer (parent) | Parent |
| GET | `/parent-portal/students/:studentId/activities` | Get recent exercise and learning activities for a specific student. Query: `limit` (default 20). Returns `RecentActivityDto[]`. | Bearer (parent) | Parent |
| GET | `/parent-portal/students/:studentId/assignments` | Get upcoming assignments for a specific student. Query: `limit` (default 10). Returns `UpcomingAssignmentDto[]`. | Bearer (parent) | Parent |

### Progress Response Shape

```
StudentProgressSummaryDto {
  student_id: string
  full_name: string
  overall_completion: number        // percentage 0-100
  average_score: number
  total_xp: number
  maya_rank: string
  module_progress: ModuleProgressDto[]
  gamification: {
    achievements_count: number
    ml_coins_balance: number
    current_streak: number
  }
}
```

---

## 5. Reports

Base controller: `ParentPortalController` — `/parent-portal/reports`

Weekly reports are summaries of student activity, performance, and gamification generated on a per-student basis.

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/parent-portal/reports/weekly` | Get the history of weekly reports for the authenticated parent. Query: `limit` (default 20). Returns `ReportHistoryItem[]`. | Bearer (parent) | Parent |
| POST | `/parent-portal/reports/weekly/:studentId` | Generate a new weekly report for a specific linked student. Parent must have active link. Returns `WeeklyReport`. | Bearer (parent) | Parent |

### Weekly Report Response Shape

```
WeeklyReport {
  id: string
  student_id: string
  student_name: string
  week_start: string        // ISO date
  week_end: string          // ISO date
  exercises_completed: number
  average_score: number
  xp_earned: number
  ml_coins_earned: number
  time_spent_minutes: number
  modules_worked: string[]
  generated_at: string
}
```

---

## 6. Notifications

Base controller: `ParentPortalController` — `/parent-portal/notifications`

Notifications are generated by the system when relevant events occur for linked students (e.g., new assignment, low score alert, message from teacher).

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/parent-portal/notifications` | Get notifications for the authenticated parent. Query: `studentId` (filter by student), `status` (e.g., unread), `limit`, `offset`. Returns `ParentNotification[]`. | Bearer (parent) | Parent |
| GET | `/parent-portal/notifications/unread-count` | Get the count of unread notifications for the authenticated parent. Returns `{ count: number }`. | Bearer (parent) | Parent |
| PATCH | `/parent-portal/notifications/:notificationId/read` | Mark a specific notification as read. Returns `{ success: boolean }`. | Bearer (parent) | Parent |

### Notification Object Shape

```
ParentNotification {
  id: string
  parent_id: string
  student_id: string
  type: string              // e.g., "assignment", "alert", "teacher_message"
  title: string
  message: string
  is_read: boolean
  created_at: string
}
```

---

## Common Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request — invalid or expired token, business rule violation |
| 401 | Unauthorized — missing or invalid JWT |
| 403 | Forbidden — parent does not have an active link to the requested student |
| 404 | Not Found — student code not found, resource not found |
| 409 | Conflict — email already registered, link already exists |

---

## Authentication Notes

- The parent portal uses a **separate auth system** (`ParentAuthGuard`) from the main platform (`JwtAuthGuard`). Parent tokens are not valid for main platform endpoints and vice versa.
- Parent accounts are stored in the `auth_management` schema but are handled by `ParentAuthService` independently.
- The `parent_id` is extracted from the JWT token by the `@ParentAccountId()` decorator inside the controller. It does not need to be passed as a query or body parameter.
- Parent-student access is validated on every protected endpoint. If the link is `pending` or `rejected`, the request is rejected with `403`.
- The `:studentId` parameters in progress and assignment routes must be UUIDs matching a student profile that the parent has an active link to.

---

## Frontend API Client Mapping

The following corresponds to `apps/frontend/src/features/parent/api/parentAPI.ts`:

| Frontend Function | Maps To |
|------------------|---------|
| `parentAPI.register(data)` | `POST /parent-portal/auth/register` |
| `parentAPI.login(credentials)` | `POST /parent-portal/auth/login` |
| `parentAPI.refreshToken(token)` | `POST /parent-portal/auth/refresh` |
| `parentAPI.requestPasswordReset(email)` | `POST /parent-portal/auth/forgot-password` |
| `parentAPI.verifyEmail(token)` | `POST /parent-portal/auth/verify-email` |
| `parentAPI.getDashboard()` | `GET /parent-portal/dashboard` |
| `parentAPI.getLinkedStudents()` | `GET /parent-portal/students` |
| `parentAPI.linkStudent(data)` | `POST /parent-portal/students/link` |
| `parentAPI.verifyStudentLink(data)` | `POST /parent-portal/students/verify` |
| `parentAPI.getStudentProgress(studentId)` | `GET /parent-portal/students/:studentId/progress` |
| `parentAPI.getStudentActivities(studentId, limit?)` | `GET /parent-portal/students/:studentId/activities` |
| `parentAPI.getStudentAssignments(studentId, limit?)` | `GET /parent-portal/students/:studentId/assignments` |
| `parentAPI.getWeeklyReports(limit?)` | `GET /parent-portal/reports/weekly` |
| `parentAPI.generateWeeklyReport(studentId)` | `POST /parent-portal/reports/weekly/:studentId` |
| `parentAPI.getNotifications(params?)` | `GET /parent-portal/notifications` |
| `parentAPI.getUnreadNotificationCount()` | `GET /parent-portal/notifications/unread-count` |
| `parentAPI.markNotificationRead(notificationId)` | `PATCH /parent-portal/notifications/:notificationId/read` |
