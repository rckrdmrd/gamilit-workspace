# 02-AUDIT-API-PATTERNS.md

**Task:** TASK-2026-02-19-ESTANDARIZACION-PORTALES
**Author:** Claude Opus 4.6
**Date:** 2026-02-19
**Scope:** Comprehensive audit of API patterns across Student, Teacher, and Admin portals

---

## 1. API FILE LOCATIONS

### 1.1 Core Infrastructure (`services/api/`)

| File | Purpose | API Calls |
|------|---------|-----------|
| `apiClient.ts` | Base Axios instance, interceptors, token refresh | N/A (infrastructure) |
| `axios.instance.ts` | Re-export of apiClient (alias) | N/A (re-export) |
| `apiErrorHandler.ts` | Error class hierarchy, handleAPIError | N/A (utilities) |
| `apiInterceptors.ts` | Timestamp, version, cache, perf interceptors | N/A (utilities) |
| `apiTypes.ts` | Shared types (ApiResponse, PaginatedResponse) | N/A (types) |
| `adminTypes.ts` | Admin portal types | N/A (types) |
| `index.ts` | Barrel exports for services/api/ | N/A (barrel) |

### 1.2 Service-Level API Files (`services/api/*.ts`) -- 11 files with API calls

| File | Endpoints Hit | Error Pattern |
|------|--------------|---------------|
| `adminAPI.ts` | ~80 endpoints (admin dashboard, orgs, users, roles, gamification config, monitoring, settings, reports, alerts, analytics, progress, classrooms) | `handleAPIError` + try/catch |
| `profileAPI.ts` | 7 endpoints (`/users/profile`, `/users/preferences`, `/users/avatar`, `/auth/change-password`, `/auth/verify-email`, `/auth/verify-email/resend`, `/auth/verify-email/status`) | `handleAPIError` + try/catch |
| `passwordAPI.ts` | 3 endpoints (`/auth/reset-password/request`, `/auth/reset-password`, `/auth/reset-password/validate`) | `handleAPIError` + try/catch |
| `contentAPI.ts` | 12 endpoints (`/content/templates/*`, `/content/categories/*`, `/content/authors/*`) | Raw (no error handler) |
| `educationalAPI.ts` | ~16 endpoints (`/educational/modules/*`, `/educational/exercises/*`, `/progress/*`) | `handleAPIError` + try/catch |
| `friendsAPI.ts` | 10 endpoints (`/social/users/*/friends/*`, `/social/friendships/*`, `/social/activities/feed`) | `handleAPIError` + try/catch |
| `teamsAPI.ts` | 14 endpoints (`/social/teams/*`, `/social/team-members/*`, `/social/classrooms/*/teams/leaderboard`) | `handleAPIError` + try/catch |
| `notificationsAPI.ts` | 11 endpoints (`/notifications/*`, `/notifications/preferences/*`, `/notifications/devices/*`) | Raw (no error handler) |
| `schoolsAPI.ts` | 2 endpoints (via `API_ENDPOINTS.social.schools`) | `handleAPIError` + try/catch |
| `studentAssignmentsAPI.ts` | 3 endpoints (`/student/assignments*`) | `handleAPIError` + try/catch |
| `twoFactorAPI.ts` | 6 endpoints (`/auth/2fa/*`) | Raw (no error handler) |

### 1.3 Teacher Sub-API Files (`services/api/teacher/*.ts`) -- 11 files

| File | Endpoints Hit |
|------|--------------|
| `teacherApi.ts` | Teacher dashboard stats, activities, alerts, performers |
| `studentProgressApi.ts` | Student progress, overview, stats, notes |
| `analyticsApi.ts` | Classroom analytics, engagement, student insights, report generation |
| `gradingApi.ts` | Submissions, feedback, bulk grading |
| `classroomsApi.ts` | Classrooms CRUD, students, progress, stats |
| `assignmentsApi.ts` | Assignments CRUD, submissions, grading |
| `interventionAlertsApi.ts` | Intervention alerts list, resolve, stats |
| `teacherMessagesApi.ts` | Messages, conversations, announcements, feedback |
| `teacherContentApi.ts` | Teacher content CRUD, clone |
| `bonusCoinsApi.ts` | Grant bonus ML coins |
| `exerciseResponsesApi.ts` | Exercise attempts, detail, student attempts, exercise responses |
| `reportsApi.ts` | Teacher reports generation, stats, download, delete |
| `alertConfigApi.ts` | Alert configuration CRUD |

### 1.4 Admin Sub-API Files (`services/api/admin/*.ts`) -- 3 files

| File | Endpoints Hit |
|------|--------------|
| `achievementsApi.ts` | Admin achievements config |
| `classroomTeacherApi.ts` | Classroom-teacher assignments |
| `gamificationConfigApi.ts` | Gamification system config |

### 1.5 Alternative API Location (`lib/api/*.ts`) -- 4 files

| File | Endpoints Hit | Notes |
|------|--------------|-------|
| `gamification.api.ts` | 15 endpoints (user stats, rank, ML coins, achievements, leaderboard, summary) | **CANONICAL** for gamification |
| `progress.api.ts` | 12 endpoints (`/progress/users/*`, `/progress/sessions/*`, `/progress/attempts/*`, `/progress/submissions/*`) | **CANONICAL** for progress |
| `branding.api.ts` | 7 endpoints (`/tenants/*/branding/*`, `/branding/domain/*`) | **CANONICAL** for branding |
| `lti.api.ts` | 16 endpoints (`/lti/consumers/*`, `/lti/grade-passbacks/*`, `/lti/sessions/*`, `/lti/launch-urls`) | **CANONICAL** for LTI |

### 1.6 Feature-Level API Files (`features/*/api/*.ts`) -- 13 files

| File | Endpoints Hit | Notes |
|------|--------------|-------|
| `features/auth/api/authAPI.ts` | 12 endpoints (login, register, logout, refresh, password reset, sessions) | **CANONICAL** for auth |
| `features/parent/api/parentAPI.ts` | 16 endpoints (`/parent-portal/auth/*`, `/parent-portal/dashboard`, `/parent-portal/students/*`, `/parent-portal/reports/*`, `/parent-portal/notifications/*`) | **CANONICAL** for parent portal |
| `features/progress/api/progressAPI.ts` | ~12 endpoints (submit exercise, progress, module progress, attempts, activities, auto-save) | OVERLAPS with `lib/api/progress.api.ts` |
| `features/gamification/economy/api/economyAPI.ts` | Economy endpoints | Domain-specific |
| `features/gamification/economy/api/shopAPI.ts` | Shop CRUD, purchases, ownership | Domain-specific |
| `features/gamification/economy/api/comodinesAPI.ts` | Comodines/power-ups | Domain-specific |
| `features/gamification/economy/api/inventoryAPI.ts` | Inventory, power-ups | Domain-specific |
| `features/gamification/social/api/socialAPI.ts` | Social endpoints | Domain-specific |
| `features/gamification/social/api/achievementsAPI.ts` | User achievements | OVERLAPS with `lib/api/gamification.api.ts` |
| `features/gamification/social/api/inventory.api.ts` | User inventory (equipped items) | Domain-specific |
| `features/gamification/ranks/api/ranksAPI.ts` | Ranks endpoints | Domain-specific |
| `features/mechanics/shared/api/mechanicsAPI.ts` | Exercise mechanics | Domain-specific |
| `features/mechanics/shared/api/aiServiceAPI.ts` | AI evaluation service | Domain-specific |

### 1.7 Shared API Files (`shared/api/*.ts`) -- 2 files

| File | Endpoints Hit |
|------|--------------|
| `shared/api/manualReviewApi.ts` | Manual review endpoints (canonical) |
| `shared/api/mediaApi.ts` | Media upload/management |

### 1.8 Inline API Calls in Hooks (apiClient directly in hooks)

| File | Pattern | Portal |
|------|---------|--------|
| `apps/student/hooks/useDashboardData.ts` | apiClient.get + useQuery | Student |
| `apps/student/hooks/useUserClassroom.ts` | apiClient.get + useState/useEffect | Student |
| `apps/student/hooks/useExercisePowerUps.ts` | apiClient.get + useState/useEffect | Student |
| `apps/admin/hooks/useContentQueries.ts` | apiClient.get + useQuery | Admin |
| `apps/admin/hooks/useAdminDashboard.ts` | apiClient.get + useState/useEffect | Admin |
| `apps/admin/hooks/useSystemMonitoring.ts` | apiClient.get + useState/useEffect | Admin |
| `apps/admin/hooks/useSystemMetrics.ts` | apiClient.get + useState/useEffect | Admin |
| `apps/admin/hooks/useUserManagement.ts` | apiClient via adminAPI + useState/useEffect | Admin |
| `apps/admin/hooks/useOrganizations.ts` | apiClient via adminAPI + useState/useEffect | Admin |
| `apps/admin/hooks/useFeatureFlags.ts` | apiClient.get + useState/useEffect | Admin |
| `apps/admin/hooks/useAdminData.ts` | apiClient via adminAPI + useState/useEffect | Admin |
| `apps/admin/hooks/useAdminAssignments.ts` | apiClient.get + useQuery | Admin |
| `apps/teacher/hooks/useMissionStats.ts` | apiClient.get + useState/useEffect | Teacher |
| `apps/teacher/hooks/useManualReviewConfig.ts` | apiClient.get + useQuery | Teacher |
| `apps/teacher/hooks/useMasteryTracking.ts` | apiClient.get + useState/useEffect | Teacher |
| `shared/hooks/useUserStatistics.ts` | apiClient.get + useQuery | Shared |
| `shared/hooks/useModules.ts` | apiClient.get + useState/useEffect | Shared |

### 1.9 Inline API Calls in Components (ANTI-PATTERN)

| File | Pattern | Portal |
|------|---------|--------|
| `apps/teacher/pages/TeacherReports.tsx` | 6x apiClient.get/post/delete in useEffect/handlers | Teacher |
| `apps/teacher/components/assignments/AssignmentCreator.tsx` | 4x apiClient.get/post in useEffect/handlers | Teacher |
| `apps/teacher/components/reports/ReportGenerator.tsx` | 1x apiClient.post in handler | Teacher |
| `apps/teacher/components/responses/ResponseFilters.tsx` | 1x apiClient.get in useEffect | Teacher |
| `apps/teacher/components/progress/ClassProgressDashboard.tsx` | 1x apiClient.post in handler | Teacher |
| `apps/teacher/components/collaboration/ParentCommunicationHub.tsx` | 1x apiClient.post in handler | Teacher |
| `apps/admin/components/dashboard/SystemLogsViewer.tsx` | 1x apiClient.get in useEffect | Admin |
| `apps/admin/components/dashboard/OrganizationsTable.tsx` | 1x apiClient.get in useEffect | Admin |

**Total inline-in-component API calls:** 16 instances across 8 files (all in Teacher and Admin portals).

---

## 2. HOOK PATTERNS BY PORTAL

### 2.1 Student Portal Hooks

| Hook | Pattern | API Source |
|------|---------|------------|
| `useDashboardData.ts` | **MIXED** (useQuery + apiClient inline) | Direct apiClient calls |
| `useUserModules.ts` | **React Query** (useQuery) | educationalAPI |
| `useAchievementsEnhanced.ts` | **Raw** (useState/useEffect) | gamificationApi |
| `useExerciseAutoSave.ts` | **Raw** (useState/useEffect) | educationalAPI.saveExerciseProgress |
| `useExercisePowerUps.ts` | **Raw** (useState/useEffect) | Direct apiClient calls |
| `useExerciseState.ts` | **Raw** (useState/useEffect) | N/A (local state) |
| `useRecentActivities.ts` | **Raw** (useState/useEffect) | progressApi |
| `useUserClassroom.ts` | **Raw** (useState/useEffect) | Direct apiClient calls |
| `useResponsiveLayout.ts` | N/A (UI only) | N/A |
| `useSwipeGesture.ts` | N/A (UI only) | N/A |
| `useProfileData.ts` | **Raw** (useState/useEffect) | profileAPI |
| `useAvatarUpdate.ts` | **Raw** (useState/useEffect) | profileAPI |

**Summary:** 2 React Query, 1 Mixed, 7 Raw, 2 UI-only = **77% raw pattern**

### 2.2 Teacher Portal Hooks

| Hook | Pattern | API Source |
|------|---------|------------|
| `useTeacherDashboard.ts` | **React Query** (useQuery) | teacherApi |
| `useClassrooms.ts` | **React Query** (useQuery + useMutation) | classroomsApi |
| `useAssignments.ts` | **React Query** (useQuery + useMutation) | assignmentsApi |
| `useAnalytics.ts` | **React Query** (useQuery + useMutation) | analyticsApi |
| `useManualReviews.ts` | **React Query** (useQuery + useMutation) | manualReviewApi |
| `useManualReviewConfig.ts` | **React Query** (useQuery + useMutation) | Direct apiClient |
| `useExerciseResponses.ts` | **React Query** (useQuery) | exerciseResponsesApi |
| `useStudentProgress.ts` | **Raw** (useState/useEffect) | studentProgressApi |
| `useGrading.ts` | **Raw** (useState/useEffect) | gradingApi |
| `useInterventionAlerts.ts` | **Raw** (useState/useEffect) | interventionAlertsApi |
| `useClassroomData.ts` | **Raw** (useState/useEffect) | classroomsApi |
| `useClassroomsStats.ts` | **Raw** (useState/useEffect) | classroomsApi |
| `useEconomyAnalytics.ts` | **Raw** (useState/useEffect) | analyticsApi |
| `useAchievementsStats.ts` | **Raw** (useState/useEffect) | gamificationApi |
| `useAlertConfig.ts` | **Raw** (useState/useEffect) | alertConfigApi |
| `useStudentBlocking.ts` | **Raw** (useState/useEffect) | classroomsApi |
| `useStudentMonitoring.ts` | **Raw** (useState/useEffect) | studentProgressApi |
| `useMissionStats.ts` | **Raw** (useState/useEffect) | Direct apiClient |
| `useMasteryTracking.ts` | **Raw** (useState/useEffect) | Direct apiClient |
| `useStudentsEconomy.ts` | **Raw** (useState/useEffect) | economyAPI |
| `useGrantBonus.ts` | **Raw** (useState/useEffect) | bonusCoinsApi |
| `useTeacherMessages.ts` | **Raw** (useState/useEffect) | teacherMessagesApi |
| `useTeacherContent.ts` | **Raw** (useState/useEffect) | teacherContentApi |
| `useClassroomRealtime.ts` | **Raw** (useState/useEffect) | WebSocket |

**Summary:** 7 React Query, 0 Mixed, 16 Raw, 1 WebSocket = **67% raw pattern**

### 2.3 Admin Portal Hooks

| Hook | Pattern | API Source |
|------|---------|------------|
| `useContentQueries.ts` | **React Query** (useQuery + useMutation) | adminAPI.content |
| `useGamificationConfig.ts` | **React Query** (useQuery + useMutation) | gamificationConfigApi |
| `useClassroomsList.ts` | **React Query** (useQuery) | adminAPI.classrooms |
| `useClassroomTeacher.ts` | **React Query** (useQuery + useMutation) | classroomTeacherApi |
| `useAdminAssignments.ts` | **React Query** (useQuery + useMutation) | Direct apiClient |
| `useContentManagement.ts` | **MIXED** (useQuery + useState) | adminAPI.content |
| `useAdminDashboard.ts` | **Raw** (useState/useEffect) | adminAPI |
| `useAdminData.ts` | **Raw** (useState/useEffect) | adminAPI |
| `useUserManagement.ts` | **Raw** (useState/useEffect) | adminAPI.users |
| `useOrganizations.ts` | **Raw** (useState/useEffect) | adminAPI.organizations |
| `useRoles.ts` | **Raw** (useState/useEffect) | adminAPI.roles |
| `useRolePermissions.ts` | **Raw** (useState/useEffect) | adminAPI.roles |
| `useAlerts.ts` | **Raw** (useState/useEffect) | adminAPI.alerts |
| `useAnalytics.ts` | **Raw** (useState/useEffect) | adminAPI.analytics |
| `useAuditLogs.ts` | **Raw** (useState/useEffect) | adminAPI.monitoring |
| `useSystemLogs.ts` | **Raw** (useState/useEffect) | adminAPI.monitoring |
| `useSystemMonitoring.ts` | **Raw** (useState/useEffect) | Direct apiClient |
| `useSystemMetrics.ts` | **Raw** (useState/useEffect) | Direct apiClient |
| `useMonitoring.ts` | **Raw** (useState/useEffect) | adminAPI.monitoring |
| `useReports.ts` | **Raw** (useState/useEffect) | adminAPI.reports |
| `useSettings.ts` | **Raw** (useState/useEffect) | adminAPI.settings |
| `useFeatureFlags.ts` | **Raw** (useState/useEffect) | Direct apiClient |
| `useLtiConsumers.ts` | **Raw** (useState/useEffect) | ltiApi |
| `useProgress.ts` | **Raw** (useState/useEffect) | adminAPI.progress |
| `useSystemConfig.ts` | **Raw** (useState/useEffect) | adminAPI.settings |
| `useConfigCategories.ts` | **Raw** (useState/useEffect) | adminAPI.settings |
| `useCreateUserFlow.ts` | **Raw** (useState/useEffect) | adminAPI.users |
| `useInstitutionActions.ts` | **Raw** (useState/useEffect) | adminAPI.organizations |

**Summary:** 5 React Query, 1 Mixed, 22 Raw = **79% raw pattern**

### 2.4 Shared Hooks

| Hook | Pattern | API Source |
|------|---------|------------|
| `useUserGamification.ts` | **React Query** (useQuery) | gamificationApi |
| `useUserStatistics.ts` | **React Query** (useQuery) | Direct apiClient |
| `useModules.ts` | **Raw** (useState/useEffect) | Direct apiClient |
| `useBranding.ts` | **Raw** (useState/useEffect) | brandingApi |
| `useInvalidateDashboard.ts` | **React Query** (useQueryClient) | N/A (invalidation utility) |
| `useUserPreferences.ts` | **Raw** (useState/useEffect) | profileAPI |
| `useModuleAccess.ts` | **Raw** (useState/useEffect) | educationalAPI |

**Summary:** 3 React Query, 4 Raw

### Pattern Distribution Summary

| Portal | React Query | Mixed | Raw (useState/useEffect) | UI-only | Total |
|--------|------------|-------|--------------------------|---------|-------|
| Student | 2 (17%) | 1 (8%) | 7 (58%) | 2 (17%) | 12 |
| Teacher | 7 (29%) | 0 (0%) | 16 (67%) | 1 (4%) | 24 |
| Admin | 5 (18%) | 1 (3%) | 22 (79%) | 0 (0%) | 28 |
| Shared | 3 (43%) | 0 (0%) | 4 (57%) | 0 (0%) | 7 |
| **Total** | **17 (24%)** | **2 (3%)** | **49 (69%)** | **3 (4%)** | **71** |

**Key Finding:** 69% of hooks use the raw useState/useEffect pattern instead of React Query. This means no automatic caching, no deduplication, no background refetch, and no optimistic updates for the majority of data fetching.

---

## 3. DUPLICATE API CALLS

### 3.1 Progress Endpoints (3-way duplication)

| Endpoint | File 1 | File 2 | File 3 |
|----------|--------|--------|--------|
| `GET /progress/users/:userId` | `lib/api/progress.api.ts` | `features/progress/api/progressAPI.ts` (via API_ENDPOINTS) | `services/api/educationalAPI.ts` (getUserProgress) |
| `GET /progress/users/:userId/modules/:moduleId` | `lib/api/progress.api.ts` | `features/progress/api/progressAPI.ts` | `services/api/educationalAPI.ts` (getModuleProgress) |
| `GET /progress/users/:userId/summary` | `lib/api/progress.api.ts` | `apps/student/hooks/useDashboardData.ts` (inline) | -- |
| `GET /progress/users/:userId/recent-activities` | `lib/api/progress.api.ts` | `services/api/educationalAPI.ts` (getUserActivities, via API_ENDPOINTS.progress) | -- |
| `POST /progress/exercises/:exerciseId/autosave` | `features/progress/api/progressAPI.ts` | `services/api/educationalAPI.ts` (saveExerciseProgress) | -- |

### 3.2 Gamification Endpoints (3-way duplication)

| Endpoint | File 1 | File 2 | File 3 |
|----------|--------|--------|--------|
| `GET /gamification/users/:userId/stats` | `lib/api/gamification.api.ts` | `features/gamification/economy/store/economyStore.ts` (inline) | -- |
| `PATCH /gamification/users/:userId/stats` | `lib/api/gamification.api.ts` | `features/gamification/economy/store/economyStore.ts` (inline, 2x) | -- |
| `GET /gamification/users/:userId/achievements` | `lib/api/gamification.api.ts` | `features/gamification/social/api/achievementsAPI.ts` | `apps/student/hooks/useDashboardData.ts` (inline) |
| `GET /gamification/users/:userId/summary` | `lib/api/gamification.api.ts` | `shared/hooks/useUserGamification.ts` (via gamificationApi) | -- |

### 3.3 Auth Endpoints (2-way duplication)

| Endpoint | File 1 | File 2 |
|----------|--------|--------|
| `PUT /auth/change-password` | `services/api/profileAPI.ts` (updatePassword) | `features/auth/api/authAPI.ts` (changePassword) |
| `POST /auth/reset-password/request` | `services/api/passwordAPI.ts` | `features/auth/api/authAPI.ts` (requestPasswordReset) |
| `POST /auth/reset-password` | `services/api/passwordAPI.ts` | `features/auth/api/authAPI.ts` (resetPassword) |
| `POST /auth/verify-email` | `services/api/profileAPI.ts` (verifyEmail) | `features/auth/api/authAPI.ts` (verifyEmail) |

### 3.4 Educational Endpoints (2-way duplication)

| Endpoint | File 1 | File 2 |
|----------|--------|--------|
| `POST /educational/exercises/:id/submit` | `services/api/educationalAPI.ts` (submitExercise) | `features/progress/api/progressAPI.ts` (submitExercise) |
| `GET /educational/exercises/:id/hints` | `services/api/educationalAPI.ts` (getExerciseHints) | -- (single location) |

### 3.5 Social Classrooms (2-way duplication)

| Endpoint | File 1 | File 2 |
|----------|--------|--------|
| `GET /social/classrooms` | `services/api/adminAPI.ts` (classrooms.getAll) | `services/api/teacher/classroomsApi.ts` |

---

## 4. REACT QUERY PATTERNS

### 4.1 Query Key Patterns

Three distinct styles are used inconsistently:

#### Style A: Key Factory Pattern (BEST PRACTICE -- 5 files)

```typescript
// Teacher hooks
const classroomKeys = {
  all: ['classrooms'] as const,
  lists: () => [...classroomKeys.all, 'list'] as const,
  list: (filters: object) => [...classroomKeys.lists(), filters] as const,
  details: () => [...classroomKeys.all, 'detail'] as const,
  detail: (id: string) => [...classroomKeys.details(), id] as const,
};
```

Files using this pattern:
- `apps/teacher/hooks/useClassrooms.ts` (classroomKeys)
- `apps/teacher/hooks/useAssignments.ts` (assignmentKeys)
- `apps/teacher/hooks/useAnalytics.ts` (analyticsKeys)
- `apps/teacher/hooks/useTeacherDashboard.ts` (dashboardKeys)
- `apps/teacher/hooks/useManualReviews.ts` (manualReviewKeys)
- `apps/teacher/hooks/useManualReviewConfig.ts` (manualReviewConfigKeys)
- `apps/teacher/hooks/useExerciseResponses.ts` (inline arrays with `['teacher', ...]`)

#### Style B: Constant Object Pattern (3 files)

```typescript
const CONTENT_QUERY_KEYS = {
  pendingExercises: (page: number, size: number) => ['admin', 'content', 'pending', page, size],
  allPending: () => ['admin', 'content', 'pending'],
  mediaLibrary: (page: number, size: number) => ['admin', 'content', 'media', page, size],
  // ...
};
```

Files using this pattern:
- `apps/admin/hooks/useContentQueries.ts` (CONTENT_QUERY_KEYS)
- `apps/admin/hooks/useClassroomTeacher.ts` (QUERY_KEYS)

#### Style C: Inline Array Pattern (6 files)

```typescript
queryKey: ['admin', 'assignments', filters],
queryKey: ['admin', 'classrooms', schoolId],
queryKey: ['userGamification', userId],
queryKey: ['userStatistics', userId],
```

Files using this pattern:
- `apps/admin/hooks/useAdminAssignments.ts`
- `apps/admin/hooks/useClassroomsList.ts`
- `shared/hooks/useUserGamification.ts`
- `shared/hooks/useUserStatistics.ts`
- `apps/student/hooks/useDashboardData.ts`
- `apps/student/hooks/useUserModules.ts`

### 4.2 Stale Time Configuration

| Stale Time | Files |
|------------|-------|
| 2 min | `useTeacherDashboard` (5 queries), `useManualReviews` (pending, myReviews), `useExerciseResponses` (list), `useContentQueries` (pending, media, approvals, exercises), `useUserStatistics` |
| 3 min | `useExerciseResponses` (student, exercise responses) |
| 5 min | `useClassrooms` (list), `useAssignments` (list), `useAnalytics` (4 queries), `useManualReviews` (detail), `useClassroomTeacher`, `useClassroomsList`, `useContentQueries` (versions), `useUserGamification` |
| 10 min | `useAssignments` (exercises), `useManualReviewConfig` |
| 30 sec | `useAdminAssignments` |
| 1 min | `useAdminAssignments` (detail, stats, classroom) |

### 4.3 Cache/GC Time (gcTime) Configuration

| GC Time | Files |
|---------|-------|
| 5 min | `useAdminAssignments`, `useManualReviews` (pending, myReviews), `useExerciseResponses` (list) |
| 10 min | `useClassroomsList`, `useManualReviews` (detail), `useExerciseResponses` (detail, student, responses), `useUserGamification` |
| 30 min | `useManualReviewConfig` |

**Note:** Most React Query hooks do NOT set gcTime explicitly, relying on the default (5 min).

### 4.4 Error Handling in Queries

| Pattern | Count | Example |
|---------|-------|---------|
| API service handles errors (handleAPIError in service) | Most hooks | `useClassrooms` calls `classroomsApi` which throws `handleAPIError` |
| React Query `onError` callback | 0 | Not used anywhere |
| Component-level `error` state from useQuery | All React Query hooks | `const { error } = useQuery(...)` |
| Toast/notification on error | 0 in hooks | Error display is left to components |

**Key Finding:** No hooks use React Query's `onError` or global error handlers. Errors propagate to component-level `error` state, with no centralized error toast/notification pattern.

### 4.5 Invalidation Patterns

| Pattern | Examples |
|---------|---------|
| Invalidate by key factory `.all` | `useClassrooms`, `useAssignments`, `useAnalytics`, `useTeacherDashboard`, `useManualReviews` |
| Invalidate by specific key | `useContentQueries` (allPending, allMedia, allVersions, approvals, exercises) |
| Remove query on delete | `useManualReviews` (removeQueries on complete) |
| No invalidation (raw hooks) | 49 hooks using useState/useEffect |

### 4.6 Refetch Configuration

| Config | Used In |
|--------|---------|
| `refetchOnWindowFocus: true` | `useUserGamification`, `useUserStatistics` |
| `refetchOnMount: true` | `useUserGamification`, `useUserStatistics` |
| `retry: 2` | `useUserGamification`, `useUserStatistics` |
| `retryDelay: exponential backoff` | `useUserGamification`, `useUserStatistics` |
| `enabled: !!condition` | All conditional queries |

**Key Finding:** Only the 2 shared hooks (`useUserGamification`, `useUserStatistics`) set refetch/retry options. All other React Query hooks use defaults.

---

## 5. PORTAL-TO-API MAPPING

### 5.1 Student Portal

| API Service File | Used By |
|-----------------|---------|
| `lib/api/gamification.api.ts` | useUserGamification, useAchievementsEnhanced, useDashboardData |
| `lib/api/progress.api.ts` | useRecentActivities |
| `services/api/educationalAPI.ts` | useUserModules, useExerciseAutoSave |
| `services/api/profileAPI.ts` | useProfileData, useAvatarUpdate |
| `services/api/friendsAPI.ts` | (via features/gamification/social) |
| `services/api/teamsAPI.ts` | (via features/gamification/social) |
| `services/api/notificationsAPI.ts` | (via notification components) |
| `services/api/studentAssignmentsAPI.ts` | (via student assignments page) |
| `features/gamification/economy/api/shopAPI.ts` | (via shop components) |
| `features/gamification/economy/api/comodinesAPI.ts` | useExercisePowerUps |
| `features/gamification/economy/api/inventoryAPI.ts` | (via inventory components) |
| `features/gamification/ranks/api/ranksAPI.ts` | (via rank display components) |
| `features/mechanics/shared/api/mechanicsAPI.ts` | (via exercise mechanics) |
| Direct apiClient calls | useDashboardData, useUserClassroom, useExercisePowerUps |

### 5.2 Teacher Portal

| API Service File | Used By |
|-----------------|---------|
| `services/api/teacher/teacherApi.ts` | useTeacherDashboard |
| `services/api/teacher/classroomsApi.ts` | useClassrooms, useClassroomData, useClassroomsStats, useStudentBlocking |
| `services/api/teacher/assignmentsApi.ts` | useAssignments |
| `services/api/teacher/analyticsApi.ts` | useAnalytics, useEconomyAnalytics |
| `services/api/teacher/gradingApi.ts` | useGrading |
| `services/api/teacher/studentProgressApi.ts` | useStudentProgress, useStudentMonitoring |
| `services/api/teacher/interventionAlertsApi.ts` | useInterventionAlerts |
| `services/api/teacher/teacherMessagesApi.ts` | useTeacherMessages |
| `services/api/teacher/teacherContentApi.ts` | useTeacherContent |
| `services/api/teacher/bonusCoinsApi.ts` | useGrantBonus |
| `services/api/teacher/exerciseResponsesApi.ts` | useExerciseResponses |
| `services/api/teacher/reportsApi.ts` | (via TeacherReports.tsx - inline) |
| `services/api/teacher/alertConfigApi.ts` | useAlertConfig |
| `shared/api/manualReviewApi.ts` | useManualReviews, useManualReviewConfig |
| `lib/api/gamification.api.ts` | useAchievementsStats |
| `services/api/profileAPI.ts` | (re-exported via teacher/index.ts) |
| Direct apiClient calls | useMissionStats, useMasteryTracking, TeacherReports.tsx, AssignmentCreator.tsx, ReportGenerator.tsx, ResponseFilters.tsx, ClassProgressDashboard.tsx, ParentCommunicationHub.tsx |

### 5.3 Admin Portal

| API Service File | Used By |
|-----------------|---------|
| `services/api/adminAPI.ts` | useAdminDashboard, useAdminData, useUserManagement, useOrganizations, useRoles, useRolePermissions, useAlerts, useAnalytics, useAuditLogs, useSystemLogs, useMonitoring, useReports, useSettings, useProgress, useSystemConfig, useConfigCategories, useCreateUserFlow, useInstitutionActions |
| `services/api/admin/gamificationConfigApi.ts` | useGamificationConfig |
| `services/api/admin/classroomTeacherApi.ts` | useClassroomTeacher |
| `services/api/admin/achievementsApi.ts` | (via admin achievements page) |
| `services/api/contentAPI.ts` | useContentManagement |
| `lib/api/lti.api.ts` | useLtiConsumers |
| `lib/api/branding.api.ts` | (via admin branding page) |
| Direct apiClient calls | useContentQueries, useAdminAssignments, useSystemMonitoring, useSystemMetrics, useFeatureFlags, SystemLogsViewer.tsx, OrganizationsTable.tsx |

### 5.4 Parent Portal

| API Service File | Used By |
|-----------------|---------|
| `features/parent/api/parentAPI.ts` | (all parent portal pages/components) |

**Note:** Parent portal is fully self-contained with its own API file. No cross-portal API sharing.

---

## 6. CRITICAL FINDINGS AND RECOMMENDATIONS

### Finding 1: Massive Raw Pattern Debt
**49 of 71 hooks (69%)** use the raw useState/useEffect pattern instead of React Query. This results in:
- No automatic caching or deduplication of requests
- Manual loading/error state management
- No background refetching
- No optimistic updates
- Inconsistent retry behavior

### Finding 2: API File Fragmentation
API calls are scattered across **5 different locations**:
1. `services/api/*.ts` (11 files)
2. `services/api/teacher/*.ts` (11 files)
3. `services/api/admin/*.ts` (3 files)
4. `lib/api/*.ts` (4 files)
5. `features/*/api/*.ts` (13 files)

Plus inline calls in 17 hooks and 8 components.

### Finding 3: Progress Endpoint 3-Way Duplication
Progress data is fetched from 3 different files (`lib/api/progress.api.ts`, `features/progress/api/progressAPI.ts`, `services/api/educationalAPI.ts`) with different response handling patterns (some expect `data.data`, others expect `data` directly).

### Finding 4: Inconsistent Error Handling
- `adminAPI.ts`, `profileAPI.ts`, `friendsAPI.ts`, `teamsAPI.ts`: Use `handleAPIError` consistently
- `contentAPI.ts`, `notificationsAPI.ts`, `twoFactorAPI.ts`: No error wrapping
- `features/progress/api/progressAPI.ts`: Expects `data.data` (wrapped response)
- `lib/api/progress.api.ts`: Expects `data` (unwrapped by interceptor)

### Finding 5: Query Key Inconsistency
Three different query key patterns are used:
- Factory pattern (best): 5 files
- Constant object: 3 files
- Inline arrays: 6 files

### Finding 6: Component-Level API Calls
8 components make direct apiClient calls (16 total instances), bypassing both the API service layer and the hook layer. All are in Teacher and Admin portals.

### Finding 7: No Global Error/Success Toast
No React Query `onError` or `onSuccess` callbacks are used for user-facing notifications. Error display is entirely up to each component.

### Finding 8: Stale Time Inconsistency
Stale times range from 30 seconds to 10 minutes with no documented rationale for the differences. Similar data types (e.g., dashboard data) have different stale times across portals.

---

## 7. RECOMMENDED STANDARDIZATION

### Priority 1: Migrate Raw Hooks to React Query
Target the 49 raw hooks across all portals. Start with:
- Admin portal: 22 raw hooks (highest count)
- Teacher portal: 16 raw hooks
- Student portal: 7 raw hooks

### Priority 2: Consolidate API Files
- **Progress:** Choose `lib/api/progress.api.ts` as canonical, deprecate `features/progress/api/progressAPI.ts` and remove progress from `educationalAPI.ts`
- **Auth:** Choose `features/auth/api/authAPI.ts` as canonical, remove duplicates from `profileAPI.ts` and `passwordAPI.ts`
- **Gamification achievements:** Choose `lib/api/gamification.api.ts` as canonical, deprecate `features/gamification/social/api/achievementsAPI.ts`

### Priority 3: Standardize Query Keys
Adopt the factory pattern project-wide. Create a `queryKeys.ts` file per portal:
```typescript
// apps/admin/queryKeys.ts
export const adminKeys = {
  all: ['admin'] as const,
  users: { all: ['admin', 'users'], list: (f) => [..., f], detail: (id) => [..., id] },
  // ...
};
```

### Priority 4: Extract Component API Calls to Hooks
Move all 16 inline API calls from 8 components into dedicated hooks.

### Priority 5: Standardize Error Handling
- All API service files should use `handleAPIError`
- Add global React Query error handler via `QueryClient.defaultOptions.mutations.onError`
- Add toast notification integration

### Priority 6: Standardize Stale Time
Define a stale time strategy:
- Dashboard/stats: 2 min
- Lists/tables: 5 min
- Config/settings: 10 min
- Static content: 30 min

---

*End of audit.*
