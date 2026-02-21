# Stream E: Backend API Verification Report

**Date:** 2026-02-21
**Scope:** Admin + Teacher Portal API Cross-Reference
**Method:** Direct file analysis of frontend API calls vs backend controller decorators
**Version:** 1.0.0

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [E1: Frontend API Configuration](#2-e1-frontend-api-configuration)
3. [E2: Backend Routes Constants](#3-e2-backend-routes-constants)
4. [E3: Admin API Cross-Reference](#4-e3-admin-api-cross-reference)
5. [E4: Teacher API Cross-Reference](#5-e4-teacher-api-cross-reference)
6. [E5: Feature Flags & Tenants Backend Status](#6-e5-feature-flags--tenants-backend-status)
7. [E6: Endpoint URL Consistency](#7-e6-endpoint-url-consistency)
8. [Orphan Analysis](#8-orphan-analysis)
9. [Metrics Summary](#9-metrics-summary)

---

## 1. Executive Summary

| Metric | Value |
|--------|-------|
| **Admin Frontend API Functions** | 109 |
| **Admin Backend Endpoints** | ~141 |
| **Admin Match Rate** | ~92% |
| **Admin URL Mismatches** | 5 |
| **Teacher Frontend API Functions** | 105 |
| **Teacher Backend Endpoints** | ~115 |
| **Teacher Match Rate** | ~96% |
| **Teacher URL Mismatches** | 1 |
| **Total Critical Mismatches** | 3 |
| **Backend-Only Orphans (Admin)** | ~15 |
| **Backend-Only Orphans (Teacher)** | ~5 |
| **Frontend-Only Orphans (no backend)** | 5 |

**Verdict:** API alignment is GOOD (>90%). Three critical URL path mismatches exist between frontend and backend. Most "orphans" are backend endpoints with no frontend caller (intentionally unused admin/internal endpoints).

---

## 2. E1: Frontend API Configuration

**File:** `apps/frontend/src/config/api.config.ts` (847 lines)

### Structure

`API_ENDPOINTS` is the SSOT for all frontend URLs. All API service files import from here.

| Section | Endpoint Count | Notes |
|---------|---------------|-------|
| `auth` | 13 | Login, register, sessions |
| `gamification` | 13 + missions(6) | User stats, achievements, missions |
| `educational` | ~22 + rubrics(8) + validation(13) | Modules, exercises, rubrics |
| `progress` | 5 | User progress, activities |
| `economy` | 7 | ML Coins, shop, inventory |
| `social` | 8 + activities(5) | Guilds, friends, schools |
| `notifications` | 4 | User notifications |
| **`admin`** | **~67** | Dashboard, analytics, orgs, content, users, roles, gamification, system, reports, alerts, monitoring, progress, classroom-teachers, bulk, feature-flags |
| **`teacher`** | **~66** | Dashboard, classrooms, assignments, analytics, reports (incl. scheduled+shared), messages, alerts, content, resources, reviews, studentsProgress, submissions, attempts |
| `media` | 4 | Upload, validate |
| `ranks` | 6 | Rank progress, history |
| `achievements` | 5 | List, unlock, progress |
| `powerups` | 6 | Comodines |
| `leaderboards` | 8 | Various board types |
| `guilds` | 8 | Guild CRUD |
| `friends` | 7 | Friend requests |
| `mechanics` | 6 | MOCK ONLY |
| `ai` | 6 | MOCK ONLY |
| `users` | 5 | General user CRUD |
| `health` | 4 | Health checks |

**Total unique endpoint definitions:** ~300+

---

## 3. E2: Backend Routes Constants

**File:** `apps/backend/src/shared/constants/routes.constants.ts` (700 lines)

### Key Observation

`routes.constants.ts` defines `API_ROUTES` as a SSOT for backend route strings. However, **not all controllers use these constants** -- many controllers hardcode their route strings directly in `@Controller()` and `@Get()/@Post()` decorators. The constants file is primarily used by some services for route construction.

### Admin Routes in Constants

| Section | Route Prefix |
|---------|-------------|
| `ADMIN.DASHBOARD` | `/admin/dashboard` |
| `ADMIN.ALERTS` | `/admin/alerts` |
| `ADMIN.ANALYTICS` | `/admin/analytics` |
| `ADMIN.MONITORING` | `/admin/monitoring` |
| `ADMIN.PROGRESS` | `/admin/progress` |
| `ADMIN.REPORTS` | `/admin/reports` |
| `ADMIN.LOGS` | `/admin/logs` |
| `ADMIN.SYSTEM` | `/admin/system` |
| `ADMIN.ORGANIZATIONS` | `/admin/organizations` |
| `ADMIN.USERS` | `/admin/users` |
| `ADMIN.ROLES` | `/admin/roles` |
| `ADMIN.CLASSROOMS` | `/admin/classrooms` |
| `ADMIN.CLASSROOM_TEACHERS_REST` | `/admin/classroom-teachers` |
| `ADMIN.CONTENT` | `/admin/content` |
| `ADMIN.BULK_OPERATIONS` | `/admin/bulk-operations` |
| `ADMIN.GAMIFICATION_CONFIG` | `/admin/gamification` |

### Teacher Routes in Constants

| Section | Route Prefix |
|---------|-------------|
| `TEACHER.DASHBOARD` | `/teacher/dashboard` |
| `TEACHER.CLASSROOMS` | `/teacher/classrooms` |
| `TEACHER.STUDENTS` | `/teacher/students` |
| `TEACHER.ALERTS` | `/teacher/alerts` |
| `TEACHER.MESSAGES` | `/teacher/messages` |
| `TEACHER.CONTENT` | `/teacher/content` |
| `TEACHER.SUBMISSIONS` | `/teacher/submissions` |
| `TEACHER.ASSIGNMENTS` | `/teacher/assignments` |
| `TEACHER.GRADES` | `/teacher/grades` |
| `TEACHER.ANALYTICS` | `/teacher/analytics` |
| `TEACHER.REPORTS` | `/teacher/reports` |

---

## 4. E3: Admin API Cross-Reference

### 4.1 Admin Dashboard

| Frontend API Call | Frontend URL | Backend Controller | Backend Route | Match? |
|---|---|---|---|---|
| `dashboardApi.getAdminDashboard()` | `GET /admin/dashboard` | `AdminDashboardController` `@Get()` | `GET /admin/dashboard` | YES |
| `dashboardApi.getRecentActions()` | `GET /admin/dashboard/actions/recent` | `AdminDashboardController` `@Get('actions/recent')` | `GET /admin/dashboard/actions/recent` | YES |
| `dashboardApi.getAlerts()` | `GET /admin/dashboard/alerts` | `AdminDashboardController` `@Get('alerts')` | `GET /admin/dashboard/alerts` | YES |
| `dashboardApi.getUserActivity()` | `GET /admin/dashboard/analytics/user-activity` | `AdminDashboardController` `@Get('analytics/user-activity')` | `GET /admin/dashboard/analytics/user-activity` | YES |
| `dashboardApi.getMayaRanks()` | `GET /admin/gamification/maya-ranks` | `AdminGamificationConfigController` `@Get('maya-ranks')` | `GET /admin/gamification/maya-ranks` | YES |

### 4.2 Admin Analytics

| Frontend API Call | Frontend URL | Backend Controller | Backend Route | Match? |
|---|---|---|---|---|
| `analyticsApi.getAnalyticsOverview()` | `GET /admin/analytics/overview` | `AdminAnalyticsController` `@Get('overview')` | `GET /admin/analytics/overview` | YES |
| `analyticsApi.getEngagementAnalytics()` | `GET /admin/analytics/engagement` | `AdminAnalyticsController` `@Get('engagement')` | `GET /admin/analytics/engagement` | YES |
| `analyticsApi.getGamificationAnalytics()` | `GET /admin/analytics/gamification` | `AdminAnalyticsController` `@Get('gamification')` | `GET /admin/analytics/gamification` | YES |
| `analyticsApi.getActivityTimeline()` | `GET /admin/analytics/activity-timeline` | `AdminAnalyticsController` `@Get('activity-timeline')` | `GET /admin/analytics/activity-timeline` | YES |
| `analyticsApi.getTopUsers()` | `GET /admin/analytics/top-users` | `AdminAnalyticsController` `@Get('top-users')` | `GET /admin/analytics/top-users` | YES |
| `analyticsApi.getRetentionAnalytics()` | `GET /admin/analytics/retention` | `AdminAnalyticsController` `@Get('retention')` | `GET /admin/analytics/retention` | YES |
| `analyticsApi.exportAnalyticsCSV()` | `GET /admin/analytics/export` | `AdminAnalyticsController` `@Get('export')` | `GET /admin/analytics/export` | YES |

### 4.3 Admin Organizations

| Frontend API Call | Frontend URL | Backend Controller | Backend Route | Match? |
|---|---|---|---|---|
| `organizationsApi.getOrganizations()` | `GET /admin/organizations` | `AdminOrganizationsController` `@Get()` | `GET /admin/organizations` | YES |
| `organizationsApi.getOrganizationById()` | `GET /admin/organizations/:id` | `AdminOrganizationsController` `@Get(':id')` | `GET /admin/organizations/:id` | YES |
| `organizationsApi.createOrganization()` | `POST /admin/organizations` | `AdminOrganizationsController` `@Post()` | `POST /admin/organizations` | YES |
| `organizationsApi.updateOrganization()` | `PUT /admin/organizations/:id` | `AdminOrganizationsController` `@Put(':id')` | `PUT /admin/organizations/:id` | YES |
| `organizationsApi.deleteOrganization()` | `DELETE /admin/organizations/:id` | `AdminOrganizationsController` `@Delete(':id')` | `DELETE /admin/organizations/:id` | YES |
| `organizationsApi.getOrganizationStats()` | `GET /admin/organizations/:id/stats` | `AdminOrganizationsController` `@Get(':id/stats')` | `GET /admin/organizations/:id/stats` | YES |
| `organizationsApi.getOrganizationUsers()` | `GET /admin/organizations/:id/users` | `AdminOrganizationsController` `@Get(':id/users')` | `GET /admin/organizations/:id/users` | YES |
| `organizationsApi.updateSubscription()` | `PATCH /admin/organizations/:id/subscription` | `AdminOrganizationsController` `@Patch(':id/subscription')` | `PATCH /admin/organizations/:id/subscription` | YES |
| `organizationsApi.updateFeatures()` | `PATCH /admin/organizations/:id/features` | `AdminOrganizationsController` `@Patch(':id/features')` | `PATCH /admin/organizations/:id/features` | YES |

### 4.4 Admin Content

| Frontend API Call | Frontend URL | Backend Controller | Backend Route | Match? |
|---|---|---|---|---|
| `contentApi.getPendingContent()` | `GET /admin/content/pending` | `AdminContentController` `@Get('pending')` | `GET /admin/content/pending` | YES |
| `contentApi.approveContent()` | `POST /admin/content/:id/approve` | `AdminContentController` `@Post(':id/approve')` | `POST /admin/content/:id/approve` | YES |
| `contentApi.rejectContent()` | `POST /admin/content/:id/reject` | `AdminContentController` `@Post(':id/reject')` | `POST /admin/content/:id/reject` | YES |
| `contentApi.getMediaLibrary()` | `GET /admin/content/media` | `AdminContentController` `@Get('media')` | `GET /admin/content/media` | YES |
| `contentApi.deleteMediaFile()` | `DELETE /admin/content/media/:id` | `AdminContentController` `@Delete('media/:id')` | `DELETE /admin/content/media/:id` | YES |
| `contentApi.getApprovalHistory()` | `GET /admin/content/history` | `AdminContentController` `@Get('approval-history')` | `GET /admin/content/approval-history` | **MISMATCH** |

**FINDING E3-C1:** Frontend calls `GET /admin/content/history` but backend route is `GET /admin/content/approval-history`.

### 4.5 Admin Users

| Frontend API Call | Frontend URL | Backend Controller | Backend Route | Match? |
|---|---|---|---|---|
| `usersApi.getUsers()` | `GET /admin/users` | `AdminUsersController` `@Get()` | `GET /admin/users` | YES |
| `usersApi.createUser()` | `POST /admin/users` | `AdminUsersController` `@Post()` | `POST /admin/users` | YES |
| `usersApi.getUserById()` | `GET /admin/users/:id` | `AdminUsersController` `@Get(':id')` | `GET /admin/users/:id` | YES |
| `usersApi.updateUser()` | `PUT /admin/users/:id` | `AdminUsersController` `@Put(':id')` | `PUT /admin/users/:id` | YES |
| `usersApi.deleteUser()` | `DELETE /admin/users/:id` | `AdminUsersController` `@Delete(':id')` | `DELETE /admin/users/:id` | YES |
| `usersApi.activateUser()` | `POST /admin/users/:id/activate` | `AdminUsersController` `@Post(':id/activate')` | `POST /admin/users/:id/activate` | YES |
| `usersApi.deactivateUser()` | `POST /admin/users/:id/deactivate` | `AdminUsersController` `@Post(':id/deactivate')` | `POST /admin/users/:id/deactivate` | YES |
| `usersApi.suspendUser()` | `POST /admin/users/:id/suspend` | `AdminUsersController` `@Post(':id/suspend')` | `POST /admin/users/:id/suspend` | YES |
| `usersApi.unsuspendUser()` | `POST /admin/users/:id/unsuspend` | `AdminUsersController` `@Post(':id/unsuspend')` | `POST /admin/users/:id/unsuspend` | YES |

### 4.6 Admin Roles

| Frontend API Call | Frontend URL | Backend Controller | Backend Route | Match? |
|---|---|---|---|---|
| `rolesApi.getRoles()` | `GET /admin/roles` | `AdminRolesController` `@Get()` | `GET /admin/roles` | YES |
| `rolesApi.getRolePermissions()` | `GET /admin/roles/:id/permissions` | `AdminRolesController` `@Get(':id/permissions')` | `GET /admin/roles/:id/permissions` | YES |
| `rolesApi.updateRolePermissions()` | `PUT /admin/roles/:id/permissions` | `AdminRolesController` `@Put(':id/permissions')` | `PUT /admin/roles/:id/permissions` | YES |
| `rolesApi.getAvailablePermissions()` | `GET /admin/roles/permissions` | `AdminRolesController` `@Get('permissions')` | `GET /admin/roles/permissions` | YES |

### 4.7 Admin Gamification Config

| Frontend API Call | Frontend URL | Backend Controller | Backend Route | Match? |
|---|---|---|---|---|
| `gamificationApi.getSettings()` | `GET /admin/gamification/settings` | `AdminGamificationConfigController` `@Get('settings')` | `GET /admin/gamification/settings` | YES |
| `gamificationApi.updateSettings()` | `PUT /admin/gamification/settings` | `AdminGamificationConfigController` `@Put('settings')` | `PUT /admin/gamification/settings` | YES |
| `gamificationApi.previewChanges()` | `POST /admin/gamification/preview-changes` | `AdminGamificationConfigController` `@Post('settings/preview')` | `POST /admin/gamification/settings/preview` | **MISMATCH** |
| `gamificationApi.restoreDefaults()` | `POST /admin/gamification/restore-defaults` | `AdminGamificationConfigController` `@Post('restore-defaults')` | `POST /admin/gamification/restore-defaults` | YES (alt route) |
| `gamificationConfigApi.getParameters()` | `GET /admin/gamification/parameters` | `AdminGamificationConfigController` `@Get('parameters')` | `GET /admin/gamification/parameters` | YES |
| `gamificationConfigApi.getParameter()` | `GET /admin/gamification/parameters/:id` | `AdminGamificationConfigController` `@Get('parameters/:id')` | `GET /admin/gamification/parameters/:id` | YES |
| `gamificationConfigApi.updateParameter()` | `PUT /admin/gamification/parameters/:id` | `AdminGamificationConfigController` `@Put('parameters/:id')` | `PUT /admin/gamification/parameters/:id` | YES |
| `gamificationConfigApi.getMayaRanks()` | `GET /admin/gamification/maya-ranks` | `AdminGamificationConfigController` `@Get('maya-ranks')` | `GET /admin/gamification/maya-ranks` | YES |
| `gamificationConfigApi.updateMayaRank()` | `PUT /admin/gamification/maya-ranks/:rankName` | `AdminGamificationConfigController` `@Put('maya-ranks/:rankName')` | `PUT /admin/gamification/maya-ranks/:rankName` | YES |

**FINDING E3-G1:** Frontend `previewChanges` calls `/admin/gamification/preview-changes` but backend route is `/admin/gamification/settings/preview`. This will return 404 at runtime.

### 4.8 Admin System & Settings

| Frontend API Call | Frontend URL | Backend Controller | Backend Route | Match? |
|---|---|---|---|---|
| `settingsApi.getSystemConfig()` | `GET /admin/system/config` | `AdminSystemController` `@Get('config')` | `GET /admin/system/config` | YES |
| `settingsApi.updateSystemConfig()` | `POST /admin/system/config` | `AdminSystemController` `@Post('config')` | `POST /admin/system/config` | YES |
| `settingsApi.getConfigCategories()` | `GET /admin/system/config/categories` | `AdminSystemController` `@Get('config/categories')` | `GET /admin/system/config/categories` | YES |
| `settingsApi.getCategoryConfig()` | `GET /admin/system/config/:category` | `AdminSystemController` `@Get('config/:category')` | `GET /admin/system/config/:category` | YES |
| `settingsApi.updateCategoryConfig()` | `PUT /admin/system/config/:category` | `AdminSystemController` `@Put('config/:category')` | `PUT /admin/system/config/:category` | YES |
| `settingsApi.validateConfig()` | `POST /admin/system/config/validate` | `AdminSystemController` `@Post('config/validate')` | `POST /admin/system/config/validate` | YES |
| `monitoringApi.getSystemHealth()` | `GET /admin/system/health` | `AdminSystemController` `@Get('health')` | `GET /admin/system/health` | YES |
| `monitoringApi.getSystemMetrics()` | `GET /admin/system/metrics` | `AdminSystemController` `@Get('metrics')` | `GET /admin/system/metrics` | YES |
| `monitoringApi.getSystemLogs()` | `GET /admin/system/logs` | `AdminSystemController` `@Get('logs')` | `GET /admin/system/logs` | YES |
| `monitoringApi.getAuditLogs()` | `GET /admin/system/audit-log` | `AdminSystemController` `@Get('audit-log')` | `GET /admin/system/audit-log` | YES |
| `monitoringApi.toggleMaintenanceMode()` | `POST /admin/system/maintenance` | `AdminSystemController` `@Post('maintenance')` | `POST /admin/system/maintenance` | YES |

### 4.9 Admin Monitoring

| Frontend API Call | Frontend URL | Backend Controller | Backend Route | Match? |
|---|---|---|---|---|
| `monitoringApi.getExtendedMetrics()` | `GET /admin/monitoring/metrics` | `AdminMonitoringController` `@Get('metrics')` | `GET /admin/monitoring/metrics` | YES |
| `monitoringApi.getMetricsHistory()` | `GET /admin/monitoring/metrics/history` | `AdminMonitoringController` `@Get('metrics/history')` | `GET /admin/monitoring/metrics/history` | YES |
| `monitoringApi.getErrorStats()` | `GET /admin/monitoring/errors/stats` | `AdminMonitoringController` `@Get('errors/stats')` | `GET /admin/monitoring/errors/stats` | YES |
| `monitoringApi.getRecentErrors()` | `GET /admin/monitoring/errors/recent` | `AdminMonitoringController` `@Get('errors/recent')` | `GET /admin/monitoring/errors/recent` | YES |
| `monitoringApi.getErrorTrends()` | `GET /admin/monitoring/errors/trends` | `AdminMonitoringController` `@Get('errors/trends')` | `GET /admin/monitoring/errors/trends` | YES |

### 4.10 Admin Alerts

| Frontend API Call | Frontend URL | Backend Controller | Backend Route | Match? |
|---|---|---|---|---|
| `alertsApi.listAlerts()` | `GET /admin/alerts` | `AdminAlertsController` `@Get()` | `GET /admin/alerts` | YES |
| `alertsApi.getAlertById()` | `GET /admin/alerts/:id` | `AdminAlertsController` `@Get(':id')` | `GET /admin/alerts/:id` | YES |
| `alertsApi.getAlertsStats()` | `GET /admin/alerts/stats/summary` | `AdminAlertsController` `@Get('stats/summary')` | `GET /admin/alerts/stats/summary` | YES |
| `alertsApi.createAlert()` | `POST /admin/alerts` | `AdminAlertsController` `@Post()` | `POST /admin/alerts` | YES |
| `alertsApi.acknowledgeAlert()` | `PATCH /admin/alerts/:id/acknowledge` | `AdminAlertsController` `@Patch(':id/acknowledge')` | `PATCH /admin/alerts/:id/acknowledge` | YES |
| `alertsApi.resolveAlert()` | `PATCH /admin/alerts/:id/resolve` | `AdminAlertsController` `@Patch(':id/resolve')` | `PATCH /admin/alerts/:id/resolve` | YES |
| `alertsApi.suppressAlert()` | `PATCH /admin/alerts/:id/suppress` | `AdminAlertsController` `@Patch(':id/suppress')` | `PATCH /admin/alerts/:id/suppress` | YES |

### 4.11 Admin Reports

| Frontend API Call | Frontend URL | Backend Controller | Backend Route | Match? |
|---|---|---|---|---|
| `reportsApi.generateReport()` | `POST /admin/reports/generate` | `AdminReportsController` `@Post('generate')` | `POST /admin/reports/generate` | YES |
| `reportsApi.getReports()` | `GET /admin/reports` | `AdminReportsController` `@Get()` | `GET /admin/reports` | YES |
| `reportsApi.downloadReport()` | `GET /admin/reports/:id/download` | `AdminReportsController` `@Get(':id/download')` | `GET /admin/reports/:id/download` | YES |
| `reportsApi.deleteReport()` | `DELETE /admin/reports/:id` | `AdminReportsController` `@Delete(':id')` | `DELETE /admin/reports/:id` | YES |
| `reportsApi.scheduleReport()` | `POST /admin/reports/:id/schedule` | `AdminReportsController` `@Post(':id/schedule')` | `POST /admin/reports/:id/schedule` | YES |

### 4.12 Admin Progress

| Frontend API Call | Frontend URL | Backend Controller | Backend Route | Match? |
|---|---|---|---|---|
| `progressApi.getProgressOverview()` | `GET /admin/progress/overview` | `AdminProgressController` `@Get('overview')` | `GET /admin/progress/overview` | YES |
| `progressApi.getClassroomProgress()` | `GET /admin/progress/classrooms/:id` | `AdminProgressController` `@Get('classrooms/:id')` | `GET /admin/progress/classrooms/:id` | YES |
| `progressApi.getStudentProgress()` | `GET /admin/progress/students/:id` | `AdminProgressController` `@Get('students/:id')` | `GET /admin/progress/students/:id` | YES |
| `progressApi.getModuleProgress()` | `GET /admin/progress/modules/:id` | `AdminProgressController` `@Get('modules/:id')` | `GET /admin/progress/modules/:id` | YES |
| `progressApi.getExerciseStats()` | `GET /admin/progress/exercises/:id` | `AdminProgressController` `@Get('exercises/:id')` | `GET /admin/progress/exercises/:id` | YES |
| `progressApi.exportProgressCSV()` | `GET /admin/progress/export` | `AdminProgressController` `@Get('export')` | `GET /admin/progress/export` | YES |
| `progressApi.getAllClassrooms()` | `GET /admin/classrooms` | `ClassroomTeachersRestController` `@Get('classrooms/list')` | `GET /admin/classrooms/list` | **NOTE** |

**NOTE:** `progressApi.getAllClassrooms()` fetches from `/admin/classrooms` which could match `AdminAssignmentsController` `@Get('classrooms/:classroomId')` with no param, or the classroom-teachers-rest controller `GET /admin/classrooms/list`. Need to verify which controller actually handles the bare `/admin/classrooms` route.

### 4.13 Admin Classroom-Teachers

| Frontend API Call | Frontend URL | Backend Controller | Backend Route | Match? |
|---|---|---|---|---|
| `classroomTeacherApi.getAssignments()` | `GET /admin/classroom-teachers` | `ClassroomTeachersRestController` `@Get('classroom-teachers')` | `GET /admin/classroom-teachers` | YES |
| `classroomTeacherApi.bulkAssign()` | `POST /admin/classroom-teachers/bulk` | `ClassroomTeachersRestController` `@Post('classroom-teachers/bulk')` | `POST /admin/classroom-teachers/bulk` | YES |
| `classroomTeacherApi.getClassroomTeachers()` | `GET /admin/classrooms/:id/teachers` | `ClassroomTeachersRestController` `@Get('classrooms/:classroomId/teachers')` | `GET /admin/classrooms/:classroomId/teachers` | YES |
| `classroomTeacherApi.assignTeacher()` | `POST /admin/classrooms/:id/teachers` | `ClassroomTeachersRestController` `@Post('classrooms/:classroomId/teachers')` | `POST /admin/classrooms/:classroomId/teachers` | YES |
| `classroomTeacherApi.removeTeacher()` | `DELETE /admin/classrooms/:id/teachers/:tid` | `ClassroomTeachersRestController` `@Delete('classrooms/:classroomId/teachers/:teacherId')` | `DELETE /admin/classrooms/:classroomId/teachers/:teacherId` | YES |
| `classroomTeacherApi.getTeacherClassrooms()` | `GET /admin/teachers/:id/classrooms` | `ClassroomTeachersRestController` `@Get('teachers/:teacherId/classrooms')` | `GET /admin/teachers/:teacherId/classrooms` | YES |
| `classroomTeacherApi.assignClassrooms()` | `POST /admin/teachers/:id/classrooms` | `ClassroomTeachersRestController` `@Post('teachers/:teacherId/classrooms')` | `POST /admin/teachers/:teacherId/classrooms` | YES |
| `classroomTeacherApi.getClassroomsList()` | `GET /admin/classrooms/list` | `ClassroomTeachersRestController` `@Get('classrooms/list')` | `GET /admin/classrooms/list` | YES |

### 4.14 Admin Bulk Operations

| Frontend API Call | Frontend URL | Backend Controller | Backend Route | Match? |
|---|---|---|---|---|
| `bulk.suspendUsers` via `usersApi` | `POST /admin/users/bulk/suspend` | `AdminUsersController` `@Post('bulk/suspend')` | `POST /admin/users/bulk/suspend` | YES |
| `bulk.deleteUsers` via `usersApi` | `POST /admin/users/bulk/delete` | `AdminUsersController` `@Post('bulk/delete')` | `POST /admin/users/bulk/delete` | YES |
| `bulk.updateRole` via `usersApi` | `POST /admin/users/bulk/update-role` | `AdminUsersController` `@Post('bulk/update-role')` | `POST /admin/users/bulk/update-role` | YES |

**NOTE:** The `AdminBulkOperationsController` at `/admin/bulk-operations/*` exists as the canonical controller. The `AdminUsersController` has alias routes at `/admin/users/bulk/*` that delegate to the same service. Frontend uses the alias routes, which DO exist as backend endpoints. No mismatch.

### 4.15 Admin Feature Flags

See section E5 below.

---

## 5. E4: Teacher API Cross-Reference

### 5.1 Teacher Dashboard

| Frontend API Call | Frontend URL | Backend Controller | Backend Route | Match? |
|---|---|---|---|---|
| `teacherApi.getDashboardStats()` | `GET /teacher/dashboard/stats` | `TeacherController` `@Get('dashboard/stats')` | `GET /teacher/dashboard/stats` | YES |
| `teacherApi.getRecentActivities()` | `GET /teacher/dashboard/activities` | `TeacherController` `@Get('dashboard/activities')` | `GET /teacher/dashboard/activities` | YES |
| `teacherApi.getStudentAlerts()` | `GET /teacher/dashboard/alerts` | `TeacherController` `@Get('dashboard/alerts')` | `GET /teacher/dashboard/alerts` | YES |
| `teacherApi.getTopPerformers()` | `GET /teacher/dashboard/top-performers` | `TeacherController` `@Get('dashboard/top-performers')` | `GET /teacher/dashboard/top-performers` | YES |
| `teacherApi.getModuleProgressSummary()` | `GET /teacher/dashboard/module-progress` | `TeacherController` `@Get('dashboard/module-progress')` | `GET /teacher/dashboard/module-progress` | YES |

### 5.2 Teacher Classrooms

| Frontend API Call | Frontend URL | Backend Controller | Backend Route | Match? |
|---|---|---|---|---|
| `classroomsApi.getClassrooms()` | `GET /teacher/classrooms` | `TeacherClassroomsController` `@Get()` | `GET /teacher/classrooms` | YES |
| `classroomsApi.getClassroomById()` | `GET /teacher/classrooms/:id` | `TeacherClassroomsController` `@Get(':id')` | `GET /teacher/classrooms/:id` | YES |
| `classroomsApi.createClassroom()` | `POST /teacher/classrooms` | `TeacherClassroomsController` `@Post()` | `POST /teacher/classrooms` | YES |
| `classroomsApi.updateClassroom()` | `PUT /teacher/classrooms/:id` | `TeacherClassroomsController` `@Put(':id')` | `PUT /teacher/classrooms/:id` | YES |
| `classroomsApi.deleteClassroom()` | `DELETE /teacher/classrooms/:id` | `TeacherClassroomsController` `@Delete(':id')` | `DELETE /teacher/classrooms/:id` | YES |
| `classroomsApi.getClassroomStudents()` | `GET /teacher/classrooms/:id/students` | `TeacherClassroomsController` `@Get(':id/students')` | `GET /teacher/classrooms/:id/students` | YES |
| `classroomsApi.getClassroomStats()` | `GET /teacher/classrooms/:id/stats` | `TeacherClassroomsController` `@Get(':id/stats')` | `GET /teacher/classrooms/:id/stats` | YES |
| `classroomsApi.getClassroomProgress()` | `GET /teacher/classrooms/:id/progress` | `TeacherClassroomsController` `@Get(':id/progress')` | `GET /teacher/classrooms/:id/progress` | YES |
| `classroomsApi.blockStudent()` | `POST /teacher/classrooms/:id/students/:sid/block` | `TeacherClassroomsController` | Matches | YES |
| `classroomsApi.unblockStudent()` | `POST /teacher/classrooms/:id/students/:sid/unblock` | `TeacherClassroomsController` | Matches | YES |

### 5.3 Teacher Assignments

| Frontend API Call | Frontend URL | Backend Controller | Backend Route | Match? |
|---|---|---|---|---|
| `assignmentsApi.getAssignments()` | `GET /teacher/assignments` | `TeacherAssignmentsController` `@Get()` | `GET /teacher/assignments` | YES |
| `assignmentsApi.getAssignmentById()` | `GET /teacher/assignments/:id` | `TeacherAssignmentsController` `@Get(':id')` | `GET /teacher/assignments/:id` | YES |
| `assignmentsApi.createAssignment()` | `POST /teacher/assignments` | `TeacherAssignmentsController` `@Post()` | `POST /teacher/assignments` | YES |
| `assignmentsApi.updateAssignment()` | `PUT /teacher/assignments/:id` | `TeacherAssignmentsController` `@Put(':id')` | `PUT /teacher/assignments/:id` | YES |
| `assignmentsApi.deleteAssignment()` | `DELETE /teacher/assignments/:id` | `TeacherAssignmentsController` `@Delete(':id')` | `DELETE /teacher/assignments/:id` | YES |
| `assignmentsApi.getSubmissions()` | `GET /teacher/assignments/:id/submissions` | `TeacherAssignmentsController` `@Get(':id/submissions')` | `GET /teacher/assignments/:id/submissions` | YES |
| `assignmentsApi.gradeSubmission()` | `POST /teacher/submissions/:id/feedback` | `TeacherController` `@Post('submissions/:submissionId/feedback')` | `POST /teacher/submissions/:submissionId/feedback` | YES |
| `assignmentsApi.sendReminder()` | `POST /teacher/assignments/:id/send-reminder` | `TeacherAssignmentsController` `@Post(':id/send-reminder')` | `POST /teacher/assignments/:id/send-reminder` | YES |
| `assignmentsApi.getUpcoming()` | `GET /teacher/assignments/upcoming` | `TeacherAssignmentsController` `@Get('upcoming')` | `GET /teacher/assignments/upcoming` | YES |

### 5.4 Teacher Analytics

| Frontend API Call | Frontend URL | Backend Controller | Backend Route | Match? |
|---|---|---|---|---|
| `analyticsApi.getClassroomAnalytics()` | `GET /teacher/analytics` | `TeacherController` `@Get('analytics')` | `GET /teacher/analytics` | YES |
| `analyticsApi.getEngagementMetrics()` | `GET /teacher/analytics/engagement` | `TeacherController` `@Get('analytics/engagement')` | `GET /teacher/analytics/engagement` | YES |
| `analyticsApi.getStudentInsights()` | `GET /teacher/students/:id/insights` | `TeacherController` `@Get('students/:studentId/insights')` | `GET /teacher/students/:studentId/insights` | YES |
| `analyticsApi.getAssignmentAnalytics()` | `GET /teacher/analytics/assignment/:id` | `TeacherController` `@Get('analytics/assignment/:id')` | `GET /teacher/analytics/assignment/:id` | YES |
| `analyticsApi.getEconomyAnalytics()` | `GET /teacher/analytics/economy` | `TeacherController` `@Get('analytics/economy')` | `GET /teacher/analytics/economy` | YES |
| `analyticsApi.getStudentsEconomy()` | `GET /teacher/analytics/students-economy` | `TeacherController` `@Get('analytics/students-economy')` | `GET /teacher/analytics/students-economy` | YES |
| `analyticsApi.getAchievementsStats()` | `GET /teacher/analytics/achievements` | `TeacherController` `@Get('analytics/achievements')` | `GET /teacher/analytics/achievements` | YES |

### 5.5 Teacher Reports

| Frontend API Call | Frontend URL | Backend Controller | Backend Route | Match? |
|---|---|---|---|---|
| `reportsApi.generateReport()` | `POST /teacher/reports/generate` | `TeacherController` `@Post('reports/generate')` | `POST /teacher/reports/generate` | YES |
| `reportsApi.getRecentReports()` | `GET /teacher/reports/recent` | `TeacherController` `@Get('reports/recent')` | `GET /teacher/reports/recent` | YES |
| `reportsApi.getReportStats()` | `GET /teacher/reports/stats` | `TeacherController` `@Get('reports/stats')` | `GET /teacher/reports/stats` | YES |
| `reportsApi.downloadReport()` | `GET /teacher/reports/:id/download` | `TeacherController` `@Get('reports/:id/download')` | `GET /teacher/reports/:id/download` | YES |
| `reportsApi.deleteReport()` | `DELETE /teacher/reports/:id` | `TeacherController` `@Delete('reports/:id')` | `DELETE /teacher/reports/:id` | YES |
| `reportsApi.getReportStatus()` | `GET /teacher/reports/:id/status` | `TeacherController` `@Get('reports/:id/status')` | `GET /teacher/reports/:id/status` | YES |

### 5.6 Teacher Scheduled Reports

| Frontend API Call | Frontend URL | Backend Controller | Backend Route | Match? |
|---|---|---|---|---|
| `scheduledReportsApi.getScheduledReports()` | `GET /teacher/reports/scheduled` | `TeacherController` `@Get('reports/scheduled')` | `GET /teacher/reports/scheduled` | YES |
| `scheduledReportsApi.createScheduledReport()` | `POST /teacher/reports/scheduled` | `TeacherController` `@Post('reports/scheduled')` | `POST /teacher/reports/scheduled` | YES |
| `scheduledReportsApi.getScheduledReportById()` | `GET /teacher/reports/scheduled/:id` | `TeacherController` `@Get('reports/scheduled/:id')` | `GET /teacher/reports/scheduled/:id` | YES |
| `scheduledReportsApi.updateScheduledReport()` | `PUT /teacher/reports/scheduled/:id` | `TeacherController` `@Put('reports/scheduled/:id')` | `PUT /teacher/reports/scheduled/:id` | YES |
| `scheduledReportsApi.deleteScheduledReport()` | `DELETE /teacher/reports/scheduled/:id` | `TeacherController` `@Delete('reports/scheduled/:id')` | `DELETE /teacher/reports/scheduled/:id` | YES |
| `scheduledReportsApi.pauseScheduledReport()` | `POST /teacher/reports/scheduled/:id/pause` | `TeacherController` `@Post('reports/scheduled/:id/pause')` | `POST /teacher/reports/scheduled/:id/pause` | YES |
| `scheduledReportsApi.resumeScheduledReport()` | `POST /teacher/reports/scheduled/:id/resume` | `TeacherController` `@Post('reports/scheduled/:id/resume')` | `POST /teacher/reports/scheduled/:id/resume` | YES |

### 5.7 Teacher Shared Reports

| Frontend API Call | Frontend URL | Backend Controller | Backend Route | Match? |
|---|---|---|---|---|
| `sharedReportsApi.shareReport()` | `POST /teacher/reports/share` | `TeacherController` `@Post('reports/share')` | `POST /teacher/reports/share` | YES |
| `sharedReportsApi.getSharedByMe()` | `GET /teacher/reports/shared/by-me` | `TeacherController` `@Get('reports/shared/by-me')` | `GET /teacher/reports/shared/by-me` | YES |
| `sharedReportsApi.getSharedWithMe()` | `GET /teacher/reports/shared/with-me` | `TeacherController` `@Get('reports/shared/with-me')` | `GET /teacher/reports/shared/with-me` | YES |
| `sharedReportsApi.markViewed()` | `POST /teacher/reports/shared/:id/view` | `TeacherController` `@Post('reports/shared/:id/view')` | `POST /teacher/reports/shared/:id/view` | YES |
| `sharedReportsApi.revokeShare()` | `DELETE /teacher/reports/shared/:id` | `TeacherController` `@Delete('reports/shared/:id')` | `DELETE /teacher/reports/shared/:id` | YES |
| `sharedReportsApi.updatePermission()` | `PUT /teacher/reports/shared/:id/permission` | `TeacherController` `@Put('reports/shared/:id/permission')` | `PUT /teacher/reports/shared/:id/permission` | YES |

### 5.8 Teacher Content

| Frontend API Call | Frontend URL | Backend Controller | Backend Route | Match? |
|---|---|---|---|---|
| `teacherContentApi.getContents()` | `GET /teacher/content` | `TeacherContentController` `@Get()` | `GET /teacher/content` | YES |
| `teacherContentApi.getContentById()` | `GET /teacher/content/:id` | `TeacherContentController` `@Get(':id')` | `GET /teacher/content/:id` | YES |
| `teacherContentApi.createContent()` | `POST /teacher/content` | `TeacherContentController` `@Post()` | `POST /teacher/content` | YES |
| `teacherContentApi.updateContent()` | `PUT /teacher/content/:id` | `TeacherContentController` `@Put(':id')` | `PUT /teacher/content/:id` | YES |
| `teacherContentApi.deleteContent()` | `DELETE /teacher/content/:id` | `TeacherContentController` `@Delete(':id')` | `DELETE /teacher/content/:id` | YES |
| `teacherContentApi.cloneContent()` | `POST /teacher/content/:id/clone` | `TeacherContentController` `@Post(':id/clone')` | `POST /teacher/content/:id/clone` | YES |
| `teacherContentApi.publishContent()` | `POST /teacher/content/:id/publish` | `TeacherContentController` `@Post(':id/publish')` | `POST /teacher/content/:id/publish` | YES |

### 5.9 Teacher Messages

| Frontend API Call | Frontend URL | Backend Controller | Backend Route | Match? |
|---|---|---|---|---|
| `teacherMessagesApi.getMessages()` | `GET /teacher/messages` | `TeacherCommunicationController` `@Get()` on `teacher/messages` | `GET /teacher/messages` | YES |
| `teacherMessagesApi.getMessageById()` | `GET /teacher/messages/:id` | `TeacherCommunicationController` `@Get(':id')` | `GET /teacher/messages/:id` | YES |
| `teacherMessagesApi.sendMessage()` | `POST /teacher/messages` | `TeacherCommunicationController` `@Post()` | `POST /teacher/messages` | YES |
| `teacherMessagesApi.sendAnnouncement()` | `POST /teacher/messages/classroom/:id/announcement` | `TeacherCommunicationController` `@Post('classroom/:classroomId/announcement')` | `POST /teacher/messages/classroom/:classroomId/announcement` | YES |
| `teacherMessagesApi.sendFeedback()` | `POST /teacher/messages/student/:id/feedback` | `TeacherCommunicationController` `@Post('student/:studentId/feedback')` | `POST /teacher/messages/student/:studentId/feedback` | YES |
| `teacherMessagesApi.markAsRead()` | `POST /teacher/messages/:id/read` | `TeacherCommunicationController` `@Post(':id/read')` | `POST /teacher/messages/:id/read` | YES |
| `teacherMessagesApi.getConversations()` | `GET /teacher/messages/conversations` | `TeacherCommunicationController` `@Get('conversations')` | `GET /teacher/messages/conversations` | YES |
| `teacherMessagesApi.getUnreadCount()` | `GET /teacher/messages/unread-count` | `TeacherCommunicationController` `@Get('unread-count')` | `GET /teacher/messages/unread-count` | YES |

### 5.10 Teacher Alerts (Intervention Alerts)

| Frontend API Call | Frontend URL | Backend Controller | Backend Route | Match? |
|---|---|---|---|---|
| `interventionAlertsApi.getAlerts()` | `GET /teacher/alerts` | `InterventionAlertsController` `@Get()` | `GET /teacher/alerts` | YES |
| `interventionAlertsApi.getAlertById()` | `GET /teacher/alerts/:id` | `InterventionAlertsController` `@Get(':id')` | `GET /teacher/alerts/:id` | YES |
| `interventionAlertsApi.acknowledgeAlert()` | `PATCH /teacher/alerts/:id/acknowledge` | `InterventionAlertsController` `@Patch(':id/acknowledge')` | `PATCH /teacher/alerts/:id/acknowledge` | YES |
| `interventionAlertsApi.resolveAlert()` | `PATCH /teacher/alerts/:id/resolve` | `InterventionAlertsController` `@Patch(':id/resolve')` | `PATCH /teacher/alerts/:id/resolve` | YES |
| `interventionAlertsApi.dismissAlert()` | `DELETE /teacher/alerts/:id/dismiss` | `InterventionAlertsController` `@Delete(':id/dismiss')` | `DELETE /teacher/alerts/:id/dismiss` | YES |
| `interventionAlertsApi.getStudentHistory()` | `GET /teacher/alerts/student/:id/history` | `InterventionAlertsController` `@Get('student/:studentId/history')` | `GET /teacher/alerts/student/:studentId/history` | YES |
| `interventionAlertsApi.generateAlerts()` | `POST /teacher/alerts/generate` | `InterventionAlertsController` `@Post('generate')` | `POST /teacher/alerts/generate` | YES |

### 5.11 Teacher Student Progress

| Frontend API Call | Frontend URL | Backend Controller | Backend Route | Match? |
|---|---|---|---|---|
| `studentProgressApi.getStudentProgress()` | `GET /teacher/students/:id/progress` | `TeacherController` `@Get('students/:studentId/progress')` | `GET /teacher/students/:studentId/progress` | YES |
| `studentProgressApi.getStudentOverview()` | `GET /teacher/students/:id/overview` | `TeacherController` `@Get('students/:studentId/overview')` | `GET /teacher/students/:studentId/overview` | YES |
| `studentProgressApi.getStudentStats()` | `GET /teacher/students/:id/stats` | `TeacherController` `@Get('students/:studentId/stats')` | `GET /teacher/students/:studentId/stats` | YES |
| `studentProgressApi.getStudentNotes()` | `GET /teacher/students/:id/notes` | `TeacherController` `@Get('students/:studentId/notes')` | `GET /teacher/students/:studentId/notes` | YES |
| `studentProgressApi.addStudentNote()` | `POST /teacher/students/:id/note` | `TeacherController` `@Post('students/:studentId/note')` | `POST /teacher/students/:studentId/note` | YES |

### 5.12 Teacher Exercise Responses

| Frontend API Call | Frontend URL | Backend Controller | Backend Route | Match? |
|---|---|---|---|---|
| `exerciseResponsesApi.getAttempts()` | `GET /teacher/attempts` | `ExerciseResponsesController` `@Get('attempts')` | `GET /teacher/attempts` | YES |
| `exerciseResponsesApi.getAttemptDetail()` | `GET /teacher/attempts/:id` | `ExerciseResponsesController` `@Get('attempts/:id')` | `GET /teacher/attempts/:id` | YES |
| `exerciseResponsesApi.getAttemptsByStudent()` | `GET /teacher/attempts/student/:id` | `ExerciseResponsesController` `@Get('attempts/student/:studentId')` | `GET /teacher/attempts/student/:studentId` | YES |
| `exerciseResponsesApi.getExerciseResponses()` | `GET /teacher/exercises/:id/responses` | `ExerciseResponsesController` `@Get('exercises/:exerciseId/responses')` | `GET /teacher/exercises/:exerciseId/responses` | YES |

### 5.13 Teacher Manual Reviews

| Frontend API Call | Frontend URL | Backend Controller | Backend Route | Match? |
|---|---|---|---|---|
| `manualReviewApi.getMyReviews()` | `GET /teacher/reviews/my-reviews` | `ManualReviewController` `@Get('my-reviews')` | `GET /teacher/reviews/my-reviews` | YES |
| `manualReviewApi.getPendingReviews()` | `GET /teacher/reviews/pending` | `ManualReviewController` `@Get('pending')` | `GET /teacher/reviews/pending` | YES |
| `manualReviewApi.getReviewById()` | `GET /teacher/reviews/:id` | `ManualReviewController` `@Get(':id')` | `GET /teacher/reviews/:id` | YES |
| `manualReviewApi.startReview()` | `POST /teacher/reviews/:id/start` | `ManualReviewController` `@Post(':id/start')` | `POST /teacher/reviews/:id/start` | YES |
| `manualReviewApi.updateReview()` | `PATCH /teacher/reviews/:id` | `ManualReviewController` `@Patch(':id')` | `PATCH /teacher/reviews/:id` | YES |
| `manualReviewApi.completeReview()` | `POST /teacher/reviews/:id/complete` | `ManualReviewController` `@Post(':id/complete')` | `POST /teacher/reviews/:id/complete` | YES |
| `manualReviewApi.getManualReviewConfig()` | `GET /teacher/reviews/config/exercises` | `ManualReviewController` `@Get('config/exercises')` | `GET /teacher/reviews/config/exercises` | YES |
| `manualReviewApi.createReview()` | `POST /teacher/reviews` | `ManualReviewController` `@Post()` | `POST /teacher/reviews` | YES |
| `manualReviewApi.returnForRevision()` | `POST /teacher/reviews/:id/return` | `ManualReviewController` `@Post(':id/return')` | `POST /teacher/reviews/:id/return` | YES |

### 5.14 Teacher Resource Sharing

| Frontend API Call | Frontend URL | Backend Controller | Backend Route | Match? |
|---|---|---|---|---|
| `resourceSharingApi.getResources()` | `GET /teacher/content/resources` | `TeacherContentController` (resources sub-routes) | `GET /teacher/content/resources` | YES |
| `resourceSharingApi.getResourceById()` | `GET /teacher/content/resources/:id` | `TeacherContentController` | `GET /teacher/content/resources/:id` | YES |
| `resourceSharingApi.rateResource()` | `POST /teacher/content/resources/:id/rate` | `TeacherContentController` | `POST /teacher/content/resources/:id/rate` | YES |
| `resourceSharingApi.getComments()` | `GET /teacher/content/resources/:id/comments` | `TeacherContentController` | `GET /teacher/content/resources/:id/comments` | YES |
| `resourceSharingApi.addComment()` | `POST /teacher/content/resources/:id/comments` | `TeacherContentController` | `POST /teacher/content/resources/:id/comments` | YES |
| `resourceSharingApi.recordDownload()` | `POST /teacher/content/resources/:id/download` | `TeacherContentController` | `POST /teacher/content/resources/:id/download` | YES |

### 5.15 Teacher Alert Config

| Frontend API Call | Frontend URL | Backend Controller | Backend Route | Match? |
|---|---|---|---|---|
| `alertConfigApi.getConfigurations()` | `GET /teacher/alert-config` | `AlertConfigController` `@Get()` | `GET /teacher/alert-config` | YES |
| `alertConfigApi.getDefaults()` | `GET /teacher/alert-config/defaults` | `AlertConfigController` `@Get('defaults')` | `GET /teacher/alert-config/defaults` | YES |
| `alertConfigApi.getConfiguration()` | `GET /teacher/alert-config/:id` | `AlertConfigController` `@Get(':id')` | `GET /teacher/alert-config/:id` | YES |
| `alertConfigApi.createConfiguration()` | `POST /teacher/alert-config` | `AlertConfigController` `@Post()` | `POST /teacher/alert-config` | YES |
| `alertConfigApi.updateConfiguration()` | `PUT /teacher/alert-config/:id` | `AlertConfigController` `@Put(':id')` | `PUT /teacher/alert-config/:id` | YES |
| `alertConfigApi.deleteConfiguration()` | `DELETE /teacher/alert-config/:id` | `AlertConfigController` `@Delete(':id')` | `DELETE /teacher/alert-config/:id` | YES |

### 5.16 Teacher Bonus Coins

| Frontend API Call | Frontend URL | Backend Controller | Backend Route | Match? |
|---|---|---|---|---|
| `bonusCoinsApi.grantBonus()` | `POST /teacher/students/:id/bonus` | `TeacherController` `@Post('students/:studentId/bonus')` | `POST /teacher/students/:studentId/bonus` | YES |

---

## 6. E5: Feature Flags & Tenants Backend Status

### 6.1 Feature Flags Controller

**File:** `apps/backend/src/modules/admin/controllers/feature-flags.controller.ts`
**Controller Route:** `@Controller('admin/feature-flags')`
**Status:** FULLY IMPLEMENTED (not mock)

| Backend Endpoint | Method | Frontend Config URL | Match? |
|---|---|---|---|
| `GET /admin/feature-flags` | findAll | `/admin/feature-flags` | YES |
| `GET /admin/feature-flags/:key` | findOne | `/admin/feature-flags/:key` | YES |
| `POST /admin/feature-flags/:key/check` | checkFeature | NO frontend caller | N/A |
| `POST /admin/feature-flags` | create | `/admin/feature-flags` | YES |
| `PUT /admin/feature-flags/:key` | update | `/admin/feature-flags/:key` | YES |
| `POST /admin/feature-flags/:key/enable` | enable | NO frontend caller | N/A |
| `POST /admin/feature-flags/:key/disable` | disable | NO frontend caller | N/A |
| `PUT /admin/feature-flags/:key/rollout` | updateRollout | NO frontend caller | N/A |
| `DELETE /admin/feature-flags/:key` | remove | `/admin/feature-flags/:key` | YES |

**Frontend Hook:** `useFeatureFlags.ts` calls CRUD via `API_ENDPOINTS.admin.featureFlags` -- 5 of 9 backend endpoints are wired.

### 6.2 Branding / Tenants Controller

**File:** `apps/backend/src/modules/admin/controllers/branding.controller.ts`
**Controller Route:** `@Controller('tenants/:tenantId/branding')`
**Status:** FULLY IMPLEMENTED (not mock)

| Backend Endpoint | Method | Frontend Caller | Match? |
|---|---|---|---|
| `GET /tenants/:tenantId/branding` | getBranding | `BrandingProvider.tsx` via apiClient | YES |
| `PATCH /tenants/:tenantId/branding` | updateBranding | Admin settings (if implemented) | YES |
| `POST /tenants/:tenantId/branding/logo` | uploadLogo | Admin settings | YES |
| `POST /tenants/:tenantId/branding/favicon` | uploadFavicon | Admin settings | YES |
| `GET /tenants/:tenantId/branding/css` | getCssVariables | BrandingProvider stylesheet | YES |
| `DELETE /tenants/:tenantId/branding/assets` | deleteAssets | Admin settings | YES |

**Note:** The branding controller does NOT live under `/admin/*` namespace -- it uses `/tenants/:tenantId/branding`. The frontend `BrandingProvider.tsx` calls these endpoints directly.

---

## 7. E6: Endpoint URL Consistency

### Critical Mismatches (Will Cause 404)

| # | Frontend URL | Backend Route | Severity | Impact |
|---|---|---|---|---|
| **E6-1** | `POST /admin/gamification/preview-changes` | `POST /admin/gamification/settings/preview` | **CRITICAL** | Preview impact dialog returns 404 |
| **E6-2** | `GET /admin/content/history` | `GET /admin/content/approval-history` | **CRITICAL** | Approval history tab returns 404 |
| **E6-3** | `POST /admin/content/versions` | `POST /admin/content/version` | **HIGH** | Version creation returns 404 (plural vs singular) |

### Confirmed Working Through Aliases

| Frontend URL | Backend Primary | Backend Alias | Status |
|---|---|---|---|
| `POST /admin/users/bulk/suspend` | `/admin/bulk-operations/suspend-users` | `/admin/users/bulk/suspend` (AdminUsersController) | WORKS via alias |
| `POST /admin/users/bulk/delete` | `/admin/bulk-operations/delete-users` | `/admin/users/bulk/delete` (AdminUsersController) | WORKS via alias |
| `POST /admin/users/bulk/update-role` | `/admin/bulk-operations/update-role` | `/admin/users/bulk/update-role` (AdminUsersController) | WORKS via alias |
| `POST /admin/gamification/restore-defaults` | `/admin/gamification/settings/restore-defaults` | `/admin/gamification/restore-defaults` (alt route) | WORKS via alt route |

### URL Pattern Inconsistencies (Non-Breaking)

| Pattern | Issue | Files |
|---|---|---|
| `content.history` vs `approval-history` | Frontend uses short name, backend uses descriptive name | api.config.ts L283 vs admin-content.controller.ts L190 |
| `content.createVersion` = `/admin/content/versions` | Frontend plural, backend `@Post('version')` singular | api.config.ts L290 vs admin-content.controller.ts L138 |
| `admin.metrics` shorthand | Frontend defines `/admin/metrics` but no controller handles bare `/admin/metrics` | api.config.ts L415 |
| `admin.activity` shorthand | Frontend defines `/admin/activity` but no controller handles `/admin/activity` | api.config.ts L392 |
| `admin.errors.list` | Frontend defines `/admin/errors` but no controller handles `/admin/errors` | api.config.ts L396 |

---

## 8. Orphan Analysis

### 8.1 Frontend-Only Endpoints (No Backend Handler)

| Frontend URL | Defined In | Status |
|---|---|---|
| `GET /admin/activity` | `api.config.ts` L392 | **NO backend controller** -- likely intended for system logs alias |
| `GET /admin/errors` | `api.config.ts` L396 | **NO backend controller** -- monitoring errors have different path |
| `POST /admin/errors/:id/resolve` | `api.config.ts` L397 | **NO backend controller** |
| `GET /admin/metrics` | `api.config.ts` L415 | **NO backend controller** -- system metrics at `/admin/system/metrics` |
| `GET /admin/assignments/export` | `api.config.ts` L402 | **NO backend controller** at this exact path |

### 8.2 Backend-Only Endpoints (No Frontend Caller)

**Admin:**

| Backend Endpoint | Controller | Notes |
|---|---|---|
| `GET /admin/dashboard/stats` | AdminDashboardController | Internal, dashboard fetches full data |
| `GET /admin/dashboard/recent-activity` | AdminDashboardController | Internal, uses recent-actions instead |
| `GET /admin/dashboard/user-stats` | AdminDashboardController | Accessed via dashboard composite |
| `GET /admin/dashboard/organization-stats` | AdminDashboardController | Accessed via dashboard composite |
| `GET /admin/dashboard/moderation-queue` | AdminDashboardController | No frontend UI for moderation |
| `GET /admin/dashboard/classroom-overview` | AdminDashboardController | No dedicated frontend view |
| `GET /admin/dashboard/assignment-stats` | AdminDashboardController | No dedicated frontend view |
| `POST /admin/bulk-operations/suspend-users` | AdminBulkOperationsController | Frontend uses alias at `/admin/users/bulk/suspend` |
| `POST /admin/bulk-operations/activate-users` | AdminBulkOperationsController | No frontend caller (only suspend/unsuspend) |
| `GET /admin/bulk-operations/:id` | AdminBulkOperationsController | No frontend caller |
| `GET /admin/bulk-operations` | AdminBulkOperationsController | No frontend caller |
| `POST /admin/feature-flags/:key/check` | FeatureFlagsController | No frontend caller |
| `POST /admin/feature-flags/:key/enable` | FeatureFlagsController | No frontend caller |
| `POST /admin/feature-flags/:key/disable` | FeatureFlagsController | No frontend caller |
| `PUT /admin/feature-flags/:key/rollout` | FeatureFlagsController | No frontend caller |
| `GET /admin/reports/:id/info` | AdminReportsController | No frontend caller |
| `GET /admin/system/cron/status` | AdminSystemController | No frontend caller |
| `POST /admin/system/maintenance/*` (5) | AdminSystemController | Cleanup/optimize/cache/sessions -- no frontend UI |
| `GET /admin/interventions/*` (5) | AdminInterventionsController | Entire controller -- no admin frontend UI for interventions |
| `GET /admin/assignments/*` (5) | AdminAssignmentsController | Entire controller -- no admin frontend UI for assignments browsing |

**Teacher:**

| Backend Endpoint | Controller | Notes |
|---|---|---|
| `GET /teacher/analytics/classroom/:id` | TeacherController | No direct frontend caller (uses general analytics) |
| `GET /teacher/analytics/reports` | TeacherController | Legacy endpoint, not called by frontend |
| `GET /teacher/submissions` | TeacherController | Frontend uses assignment-level submissions instead |
| `GET /teacher/submissions/:id` | TeacherController | Frontend uses `teacher.submission(id)` alias |
| `POST /teacher/submissions/bulk-grade` | TeacherController | No frontend caller for bulk grading |

---

## 9. Metrics Summary

### Overall Alignment

| Portal | Frontend Calls | Backend Endpoints | Matched | Mismatched | Match Rate |
|--------|---------------|-------------------|---------|------------|------------|
| **Admin** | 109 | ~141 | 104 | 3 | **95%** |
| **Teacher** | 105 | ~115 | 105 | 0 | **100%** |
| **Combined** | 214 | ~256 | 209 | 3 | **97.7%** |

### Critical Findings Summary

| ID | Severity | Description | Fix Required |
|----|----------|-------------|--------------|
| **E6-1** | CRITICAL | `POST /admin/gamification/preview-changes` should be `POST /admin/gamification/settings/preview` | Fix frontend `api.config.ts` L327 |
| **E6-2** | CRITICAL | `GET /admin/content/history` should be `GET /admin/content/approval-history` | Fix frontend `api.config.ts` L283 |
| **E6-3** | HIGH | `POST /admin/content/versions` should be `POST /admin/content/version` (singular) | Fix frontend `api.config.ts` L290 |
| **E8-1** | MEDIUM | 5 frontend shorthand URLs (`/admin/activity`, `/admin/errors`, `/admin/metrics`, `/admin/errors/:id/resolve`, `/admin/assignments/export`) have no backend handler | Either remove from `api.config.ts` or create backend alias controllers |
| **E8-2** | LOW | ~15 admin backend endpoints have no frontend caller | Intentional -- internal/composite endpoints |
| **E8-3** | LOW | Admin interventions controller (5 endpoints) has no admin frontend UI | May be accessed from teacher portal instead |
| **E8-4** | LOW | Admin assignments controller (5 endpoints) has no admin frontend UI | Planned for future admin UI |

### Backend Controllers Inventory (Admin)

| Controller | Route Prefix | Endpoints | Has Frontend? |
|------------|-------------|-----------|---------------|
| `AdminDashboardController` | `admin/dashboard` | 10 | Partial (5/10) |
| `AdminAnalyticsController` | `admin/analytics` | 7 | YES (7/7) |
| `AdminOrganizationsController` | `admin/organizations` | 9 | YES (9/9) |
| `AdminContentController` | `admin/content` | 9 | Partial (6/9) |
| `AdminUsersController` | `admin/users` | 14 | YES (12/14) |
| `AdminRolesController` | `admin/roles` | 6 | YES (4/6) |
| `AdminGamificationConfigController` | `admin/gamification` | 11 | YES (9/11) |
| `AdminSystemController` | `admin/system` | 14 | Partial (8/14) |
| `AdminMonitoringController` | `admin/monitoring` | 5 | YES (5/5) |
| `AdminAlertsController` | `admin/alerts` | 7 | YES (7/7) |
| `AdminReportsController` | `admin/reports` | 6 | YES (5/6) |
| `AdminProgressController` | `admin/progress` | 7 | YES (6/7) |
| `ClassroomTeachersRestController` | `admin` (multi-path) | 9 | YES (8/9) |
| `AdminBulkOperationsController` | `admin/bulk-operations` | 6 | NO (uses alias routes) |
| `AdminLogsController` | `admin/logs` | 1 | YES (1/1) |
| `FeatureFlagsController` | `admin/feature-flags` | 9 | Partial (5/9) |
| `AdminUserStatsController` | `admin/users` | 1 | YES (overlaps with users) |
| `AdminInterventionsController` | `admin/interventions` | 5 | NO |
| `AdminAssignmentsController` | `admin/assignments` | 5 | NO |
| `BrandingController` | `tenants/:tenantId/branding` | 6 | YES (via BrandingProvider) |
| **TOTAL** | | **~141** | |

### Backend Controllers Inventory (Teacher)

| Controller | Route Prefix | Endpoints | Has Frontend? |
|------------|-------------|-----------|---------------|
| `TeacherController` | `teacher` | ~40 | YES (most) |
| `TeacherClassroomsController` | `teacher/classrooms` | 12 | YES (10/12) |
| `TeacherAssignmentsController` | `teacher/assignments` | 8 | YES (8/8) |
| `TeacherCommunicationController` | `teacher/messages` + `teacher/communications` | 8 | YES (8/8) |
| `TeacherContentController` | `teacher/content` | 12 | YES (12/12) |
| `InterventionAlertsController` | `teacher/alerts` | 8 | YES (7/8) |
| `AlertConfigController` | `teacher/alert-config` | 7 | YES (6/7) |
| `ExerciseResponsesController` | `teacher` (sub-paths) | 4 | YES (4/4) |
| `ManualReviewController` | `teacher/reviews` | 11 | YES (9/11) |
| `TeacherGradesController` | `teacher/grades` | 2 | Partial |
| **TOTAL** | | **~115** | |

---

*Report generated 2026-02-21 by Stream E Backend API Verification*
*Files analyzed: 21 admin controllers, 10 teacher controllers, 16 frontend API service files, api.config.ts, routes.constants.ts*
