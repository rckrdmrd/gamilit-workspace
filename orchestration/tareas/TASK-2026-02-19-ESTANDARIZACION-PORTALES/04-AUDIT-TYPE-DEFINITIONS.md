# 04 - Audit: Type Definitions

**Date:** 2026-02-19
**Scope:** `apps/frontend/src/` -- All type/interface definitions across 3 portals
**Version:** 1.0.0

---

## Table of Contents

1. [Type File Inventory](#1-type-file-inventory)
2. [Duplicate Type Detection](#2-duplicate-type-detection)
3. [Types Inline in Hooks](#3-types-inline-in-hooks)
4. [`any` Usage in Type Files](#4-any-usage-in-type-files)
5. [Type Organization Pattern Per Portal](#5-type-organization-pattern-per-portal)
6. [Import Chain Analysis](#6-import-chain-analysis)
7. [Summary and Recommendations](#7-summary-and-recommendations)

---

## 1. Type File Inventory

### 1.1 Root Types (`src/types/`)

| File | Description | Lines (approx) |
|------|-------------|---------------:|
| `types/index.ts` | Barrel: re-exports from admin subtypes | 43 |
| `types/userStats.ts` | UserStats, StreakStats | ~50 |
| `types/admin/achievements.types.ts` | AdminAchievement, ListAchievementsQuery, etc. | ~80 |
| `types/admin/classroom-teacher.types.ts` | ClassroomTeacherAssignment DTOs | ~60 |
| `types/admin/gamification.types.ts` | GamificationParameter, MayaRankConfig, etc. | ~100 |

**Subtotal: 5 files**

### 1.2 Shared Types (`src/shared/types/`)

| File | Description | Lines (approx) |
|------|-------------|---------------:|
| `shared/types/index.ts` | Barrel: re-exports all shared types | 165 |
| `shared/types/achievement.types.ts` | Achievement, BaseAchievement, AchievementProgress | ~180 |
| `shared/types/api-responses.ts` | PaginationInfo, PaginatedResponse | 47 |
| `shared/types/auth.types.ts` | Re-exports from features/auth/types (wrapper) | ~30 |
| `shared/types/branding.types.ts` | BrandingConfig, TenantBranding | ~80 |
| `shared/types/classroom.types.ts` | Classroom (SSOT), DTOs, StudentInClassroom | 786 |
| `shared/types/comodin-usage-tracking.types.ts` | ComodinUsageTracking | ~60 |
| `shared/types/content-metadata.types.ts` | ContentMetadata types | ~80 |
| `shared/types/content-tag.types.ts` | ContentTag types | ~40 |
| `shared/types/content.types.ts` | Content management types | ~120 |
| `shared/types/educational.types.ts` | Module, Exercise (SSOT), 30+ interfaces | ~700 |
| `shared/types/exercise-submission.types.ts` | ExerciseSubmission types | ~80 |
| `shared/types/gamification.types.ts` | UserRank, MLCoinsBalance, MayaRank enum | ~120 |
| `shared/types/leaderboard.types.ts` | LeaderboardEntry, LeaderboardData | ~100 |
| `shared/types/lti.types.ts` | LTI integration types | ~80 |
| `shared/types/media.types.ts` | MediaFile, MediaUpload | ~60 |
| `shared/types/module-completion-tracking.types.ts` | Completion tracking | ~60 |
| `shared/types/module-dependencies.types.ts` | Module prerequisites | ~40 |
| `shared/types/profile.types.ts` | Profile (SSOT), ProfileWithStats | ~100 |
| `shared/types/progress.types.ts` | ModuleProgress, ExerciseAttempt, ProgressStatus | ~400 |
| `shared/types/social-interaction.types.ts` | SocialInteraction types | ~60 |
| `shared/types/social.types.ts` | Friendship, Team, Classroom (legacy), ClassroomSettings | ~250 |
| `shared/types/taxonomy.types.ts` | Bloom, SOLO, Webb DOK taxonomies | ~60 |
| `shared/types/user-current-level.types.ts` | CEFR level types | ~40 |
| `shared/types/user-difficulty-progress.types.ts` | Per-level progress stats | ~40 |
| `shared/types/user-stats.types.ts` | UserStats, UserStatsSummary | ~80 |
| `shared/types/user.types.ts` | User (SSOT), UserExtended, DTOs | 554 |
| `shared/types/users.types.ts` | Legacy user types (if different) | ~40 |

**Subtotal: 28 files**

### 1.3 Feature-Level Types (`src/features/*/types/`)

| File | Description | Lines (approx) |
|------|-------------|---------------:|
| `features/auth/types/auth.types.ts` | User, Organization, AuthProfile, LoginCredentials, AuthResponse | 503 |
| `features/exercises/types/exercise.types.ts` | Exercise, ExerciseType, ExerciseAttempt, ExerciseContent | ~350 |
| `features/exercises/types/exercise-mechanic.types.ts` | ExerciseMechanicConfig, registry adapter | ~120 |
| `features/exercises/types/index.ts` | Barrel for exercise types | ~15 |
| `features/gamification/battles/types/battleTypes.ts` | Battle, BattleRound, LeaderboardEntry | ~200 |
| `features/gamification/economy/types/economyTypes.ts` | ShopItem, Transaction, MLCoinsBalance | ~250 |
| `features/gamification/missions/types/missionsTypes.ts` | Mission, MissionObjective, MissionReward | ~120 |
| `features/gamification/ranks/types/ranksTypes.ts` | Rank, RankProgression, XPMultiplier | ~100 |
| `features/gamification/social/types/achievementsTypes.ts` | AchievementWithProgress, Achievement alias | ~120 |
| `features/gamification/social/types/friendsTypes.ts` | Friend, FriendRequest | ~60 |
| `features/gamification/social/types/guildsTypes.ts` | Guild, GuildMember | ~80 |
| `features/gamification/social/types/inventory.types.ts` | InventoryItem, EquipResult | ~50 |
| `features/gamification/social/types/leaderboardsTypes.ts` | LeaderboardEntry, LeaderboardData | ~80 |
| `features/gamification/social/types/powerUpsTypes.ts` | PowerUp, PowerUpEffect | ~60 |
| `features/gamification/social/types/index.ts` | Barrel for social types | 10 |
| `features/parent/types/parent.types.ts` | ParentAccount, ChildProgress | ~100 |
| `features/progress/api/progressTypes.ts` | SubmitExerciseRequest/Response, UserProgressOverview | ~380 |

**Subtotal: 17 files**

### 1.4 Portal-Level Types (`src/apps/*/types/`)

| File | Description | Lines (approx) |
|------|-------------|---------------:|
| `apps/admin/types/index.ts` | SystemHealth, Organization, SystemAlert, PaginationParams, FeatureFlags | 272 |
| `apps/admin/types/exercise-builder.types.ts` | ExerciseFormData | 17 |
| `apps/teacher/types/index.ts` | StudentMonitoring, Classroom, Exercise, InterventionAlert, 30+ interfaces | 536 |
| `apps/student/types/gamificationTypes.ts` | LeaderboardEntry, Mission, StreakData | 45 |

**Subtotal: 4 files**

### 1.5 API Service Types (`src/services/api/`)

| File | Description | Lines (approx) |
|------|-------------|---------------:|
| `services/api/adminTypes.ts` | 90+ interfaces: Organization, User, SystemHealth, Alerts, Analytics, Progress | 1140 |
| `services/api/apiTypes.ts` | Generic: ApiResponse, PaginatedResponse, PaginationParams, 25+ interfaces | 300 |

**Subtotal: 2 files**

### 1.6 Mechanics Types (`src/features/mechanics/`)

| File | Description |
|------|-------------|
| `mechanics/module1/CompletarEspacios/completarEspaciosTypes.ts` | CompletarEspacios exercise |
| `mechanics/module1/Crucigrama/crucigramaTypes.ts` | Crucigrama exercise |
| `mechanics/module1/Emparejamiento/emparejamientoTypes.ts` | Emparejamiento exercise |
| `mechanics/module1/MapaConceptual/mapaConceptualTypes.ts` | MapaConceptual exercise |
| `mechanics/module1/SopaLetras/sopaLetrasTypes.ts` | SopaLetras exercise |
| `mechanics/module1/Timeline/timelineTypes.ts` | Timeline exercise |
| `mechanics/module1/VerdaderoFalso/verdaderoFalsoTypes.ts` | VerdaderoFalso exercise |
| `mechanics/module2/ConstruccionHipotesis/causaEfectoTypes.ts` | CausaEfecto exercise |
| `mechanics/module2/DetectiveTextual/detectiveTextualTypes.ts` | DetectiveTextual exercise |
| `mechanics/module2/LecturaInferencial/lecturaInferencialTypes.ts` | LecturaInferencial exercise |
| `mechanics/module2/PrediccionNarrativa/prediccionNarrativaTypes.ts` | PrediccionNarrativa exercise |
| `mechanics/module2/PuzzleContexto/puzzleContextoTypes.ts` | PuzzleContexto exercise |
| `mechanics/module2/RuedaInferencias/ruedaInferenciasTypes.ts` | RuedaInferencias exercise |
| `mechanics/module3/AnalisisFuentes/analisisFuentesTypes.ts` | AnalisisFuentes exercise |
| `mechanics/module3/DebateDigital/debateDigitalTypes.ts` | DebateDigital exercise |
| `mechanics/module3/MatrizPerspectivas/matrizPerspectivasTypes.ts` | MatrizPerspectivas exercise |
| `mechanics/module3/PodcastArgumentativo/podcastArgumentativoTypes.ts` | PodcastArgumentativo exercise |
| `mechanics/module3/TribunalOpiniones/tribunalOpinionesTypes.ts` | TribunalOpiniones exercise |
| `mechanics/module4/AnalisisMemes/analisisMemesTypes.ts` | AnalisisMemes exercise |
| `mechanics/module4/InfografiaInteractiva/infografiaInteractivaTypes.ts` | InfografiaInteractiva exercise |
| `mechanics/module4/NavegacionHipertextual/navegacionHipertextualTypes.ts` | NavegacionHipertextual exercise |
| `mechanics/module4/QuizTikTok/quizTikTokTypes.ts` | QuizTikTok exercise |
| `mechanics/module4/VerificadorFakeNews/verificadorFakeNewsTypes.ts` | VerificadorFakeNews exercise |
| `mechanics/module5/ComicDigital/comicDigitalTypes.ts` | ComicDigital exercise |
| `mechanics/module5/DiarioMultimedia/diarioMultimediaTypes.ts` | DiarioMultimedia exercise |
| `mechanics/module5/VideoCarta/videoCartaTypes.ts` | VideoCarta exercise |
| `mechanics/auxiliar/CallToAction/callToActionTypes.ts` | CallToAction exercise |
| `mechanics/auxiliar/CollagePrensa/collagePrensaTypes.ts` | CollagePrensa exercise |
| `mechanics/auxiliar/ComprensiónAuditiva/comprensionAuditivaTypes.ts` | ComprensiónAuditiva exercise |
| `mechanics/auxiliar/TextoEnMovimiento/textoEnMovimientoTypes.ts` | TextoEnMovimiento exercise |
| `mechanics/shared/aiTypes.ts` | AI service types for mechanics |

**Subtotal: 31 files** (co-located with their mechanic components; acceptable pattern)

### 1.7 Component-Level Types

| File | Description |
|------|-------------|
| `shared/components/mechanics/mechanicsTypes.ts` | ExerciseFeedback, BaseExercise, MechanicsProps, ProgressData | ~260 |
| `apps/student/components/profile/types.ts` | ProfileStat, RankHistoryEntry | ~30 |
| `apps/student/components/achievements/types.ts` | Achievement (extends BaseAchievement), AchievementFilters | ~65 |

**Subtotal: 3 files**

### 1.8 Zod Schema-Derived Types

| File | Description |
|------|-------------|
| `services/api/schemas/adminSchemas.ts` | Organization = z.infer<typeof OrganizationSchema> | ~200 |

**Subtotal: 1 file**

---

### Grand Total: ~91 type-definition files

| Location | Count |
|----------|------:|
| `src/types/` | 5 |
| `shared/types/` | 28 |
| `features/*/types/` | 17 |
| `apps/*/types/` | 4 |
| `services/api/` | 2 |
| `mechanics/*/Types.ts` | 31 |
| Component-level | 3 |
| Zod schemas | 1 |
| **Total** | **91** |

---

## 2. Duplicate Type Detection

### 2.1 CRITICAL Duplicates (same name, different shapes, 3+ locations)

#### `interface Exercise` -- 5 definitions

| # | Location | Line | Shape |
|---|----------|-----:|-------|
| 1 | `shared/types/educational.types.ts` | 321 | Full SSOT: 50+ fields, pedagogical, gamification, adaptive |
| 2 | `features/exercises/types/exercise.types.ts` | 94 | Rich: 30+ fields, aligned with backend ExerciseResponseDto |
| 3 | `apps/teacher/types/index.ts` | 366 | Minimal: id, title, type, difficulty, module_id (5 fields) |
| 4 | `apps/student/hooks/useExerciseState.ts` | 9 | Minimal: id, title, type, difficulty, instructions, etc. |
| 5 | `apps/admin/hooks/useContentQueries.ts` | 26 | Minimal: id, title, type, difficulty, status, created_at |

**Severity: HIGH** -- Two rich SSOT candidates (`shared/types/educational` vs `features/exercises/types`) plus 3 inline minimals that diverge in field names.

#### `interface Achievement` -- 6 definitions

| # | Location | Line | Shape |
|---|----------|-----:|-------|
| 1 | `shared/types/achievement.types.ts` | 118 | Full SSOT interface |
| 2 | `features/gamification/social/types/achievementsTypes.ts` | 86 | `type Achievement = AchievementWithProgress` alias |
| 3 | `apps/student/components/achievements/types.ts` | 10 | `extends BaseAchievement` with extra fields |
| 4 | `features/progress/api/progressTypes.ts` | 147 | `type Achievement = Pick<FullAchievement, ...>` (4 fields) |
| 5 | `services/api/adminTypes.ts` | 307 | `type Achievement = AdminAchievement` alias |
| 6 | `components/achievements/AchievementNotification.tsx` | 50 | `type Achievement = NotificationAchievement` alias |

**Severity: HIGH** -- 6 competing definitions. Import collision risk.

#### `interface User` -- 3 definitions

| # | Location | Line | Shape |
|---|----------|-----:|-------|
| 1 | `shared/types/user.types.ts` | 109 | Full SSOT: camelCase, role: UserRole, isActive, createdAt (required) |
| 2 | `features/auth/types/auth.types.ts` | 30 | Auth-focused: snake_case fields, status?: string, role: string |
| 3 | `services/api/adminTypes.ts` | 168 | Admin view: role: string, different status values |

**Severity: HIGH** -- Three `User` interfaces with incompatible shapes (camelCase vs snake_case, required vs optional fields, different role types). The `shared/types/index.ts` barrel re-exports from `user.types.ts`, but `features/auth/types/auth.types.ts` is the one imported by auth flows.

#### `interface Organization` -- 4 definitions

| # | Location | Line | Shape |
|---|----------|-----:|-------|
| 1 | `features/auth/types/auth.types.ts` | 217 | Tenant-focused: id, name, slug, domain, logo_url |
| 2 | `apps/admin/types/index.ts` | 17 | Admin view: plan, status, users, features[], subscription |
| 3 | `services/api/adminTypes.ts` | 35 | API admin: display_name, domain, logo_url, subscription_tier |
| 4 | `services/api/schemas/adminSchemas.ts` | 140 | Zod-derived: z.infer<typeof OrganizationSchema> |

**Severity: HIGH** -- Completely different shapes depending on context.

#### `interface LeaderboardEntry` -- 5 definitions

| # | Location | Line | Shape |
|---|----------|-----:|-------|
| 1 | `shared/types/leaderboard.types.ts` | 55 | SSOT: user_id, rank, display_name, xp, ml_coins |
| 2 | `apps/student/types/gamificationTypes.ts` | 1 | Student: id, rank, username, avatar, score, rankBadge, change |
| 3 | `features/gamification/social/types/leaderboardsTypes.ts` | 14 | Social: different fields |
| 4 | `features/gamification/battles/types/battleTypes.ts` | 169 | Battle context |
| 5 | `features/gamification/leaderboard/LiveLeaderboard.tsx` | 72 | Inline in component |

**Severity: MEDIUM** -- Different shapes for different contexts, but name collision is problematic.

#### `interface Classroom` -- 3 definitions

| # | Location | Line | Shape |
|---|----------|-----:|-------|
| 1 | `shared/types/classroom.types.ts` | 86 | Full SSOT: 30+ fields, settings, schedule, capacity |
| 2 | `shared/types/social.types.ts` | 127 | Legacy social: snake_case, teacher_id, school_id, grade_level |
| 3 | `apps/teacher/types/index.ts` | 355 | Teacher mini: id, name, subject, grade_level, student_count |

**Severity: HIGH** -- Two competing SSOTs in shared/types plus teacher-specific mini.

#### `interface ExerciseAttempt` -- 5 definitions

| # | Location | Line | Shape |
|---|----------|-----:|-------|
| 1 | `shared/types/progress.types.ts` | 358 | Progress tracking context |
| 2 | `features/exercises/types/exercise.types.ts` | 216 | Exercise feature context |
| 3 | `features/progress/api/progressTypes.ts` | 279 | API response type |
| 4 | `shared/components/mechanics/mechanicsTypes.ts` | 30 | Mechanics component context |
| 5 | `apps/student/hooks/useExerciseState.ts` | 23 | Inline in student hook |

**Severity: HIGH** -- Core entity with 5 incompatible definitions.

### 2.2 HIGH Duplicates (same name, 2 locations, different shapes)

| Type Name | Location A | Location B | Notes |
|-----------|-----------|-----------|-------|
| `SystemAlert` | `apps/admin/types/index.ts:161` | `services/api/adminTypes.ts:651` | Different field sets |
| `SystemHealth` | `apps/admin/types/index.ts:4` | `services/api/adminTypes.ts:342` | Different field names |
| `SystemMetrics` | `apps/admin/types/index.ts:132` | `services/api/adminTypes.ts:374` + `apps/admin/hooks/useSystemMetrics.ts:5` | 3 locations |
| `DashboardStats` | `apps/admin/types/index.ts:218` | `services/api/adminTypes.ts:123` + `features/progress/api/progressTypes.ts:346` | 3 locations |
| `Mission` | `apps/student/types/gamificationTypes.ts:20` | `features/gamification/missions/types/missionsTypes.ts:58` | Different shapes |
| `ShopItem` | `features/gamification/economy/types/economyTypes.ts:194` | `features/gamification/economy/api/shopAPI.ts:36` | Same feature, split |
| `Notification` | `services/NotificationService.ts:38` | `services/api/notificationsAPI.ts:10` | Two service files |
| `ClassroomSettings` | `shared/types/classroom.types.ts:45` | `shared/types/social.types.ts:107` | camelCase vs snake_case |
| `ModuleProgress` | `apps/teacher/types/index.ts:58` | `shared/types/progress.types.ts:33` + `services/api/educationalAPI.ts:22` | 3 locations |
| `ProgressUpdate` | `apps/teacher/hooks/useClassroomRealtime.ts:80` | `features/exercises/hooks/useExerciseProgress.ts:29` | Unrelated shapes |
| `ExerciseAttempt` | See above | 5 locations | See 2.1 |

### 2.3 Pagination Type Chaos -- 4 competing definitions

| Type | Location | Shape |
|------|----------|-------|
| `PaginatedResponse<T>` | `services/api/apiTypes.ts:38` | `{ data, pagination: { page, limit, total, totalPages, hasMore } }` |
| `PaginatedResponse<T>` | `services/api/adminTypes.ts:15` | `{ data, total, page, pageSize, totalPages }` (flat) |
| `PaginatedResponse<T>` | `shared/types/api-responses.ts:44` | `{ data, pagination: PaginationInfo }` (nested, `hasNextPage/hasPreviousPage`) |
| `PaginatedResponse<T>` | `apps/admin/types/index.ts:202` | `{ data, total, page, pageSize, totalPages }` (flat, identical to adminTypes) |

And similarly for `PaginationParams`:
| `PaginationParams` | `services/api/apiTypes.ts:52` | `{ page, limit, sort, order }` |
| `PaginationParams` | `services/api/adminTypes.ts:10` | `{ page, limit, sortBy, sortOrder }` |
| `PaginationParams` | `apps/admin/types/index.ts:195` | `{ page, pageSize, sortBy, sortOrder }` |

**Severity: CRITICAL** -- These are the foundation types. Three incompatible pagination shapes cause silent bugs across the codebase.

### 2.4 Settings Types -- Duplicate set

All 6 settings interfaces are duplicated identically:

| Type | `services/api/adminTypes.ts` | `apps/admin/hooks/useSettings.ts` |
|------|-----|-----|
| `SettingsCategory` | :444 | :20 |
| `GeneralSettings` | :472 | :22 |
| `EmailSettings` | :480 | :30 |
| `NotificationSettings` | :489 | :38 |
| `SecuritySettings` | :495 | :44 |
| `MaintenanceSettings` | :506 | :50 |

**Severity: MEDIUM** -- Copy-paste duplication. Hook should import from adminTypes.

### 2.5 AlertType / AlertStatus -- Context collision

| Type | Teacher Context | Admin Context | API Service |
|------|----------------|---------------|-------------|
| `AlertType` | `teacher/types/index.ts:74` (intervention: 'no_activity'...) | `adminTypes.ts:697` (system: 'storage', 'performance'...) | `teacher/interventionAlertsApi.ts:105` |
| `AlertStatus` | `teacher/types/index.ts:89` ('active', 'acknowledged'...) | `adminTypes.ts:694` ('open', 'acknowledged'...) | `teacher/interventionAlertsApi.ts:113` |

**Severity: MEDIUM** -- Different domains use same type names (intervention alerts vs system alerts). Not technically wrong, but confusing.

### 2.6 Profile -- 2 definitions

| # | Location | Shape |
|---|----------|-------|
| 1 | `shared/types/profile.types.ts:40` | SSOT: Profile interface |
| 2 | `features/auth/types/auth.types.ts:356` | `type Profile = AuthProfile` (deprecated alias) |

**Severity: LOW** -- Documented deprecation, but still exported and importable.

---

## 3. Types Inline in Hooks

### 3.1 Admin Portal Hooks (with inline types)

| Hook File | Inline Types Defined | Count |
|-----------|---------------------|------:|
| `apps/admin/hooks/useAdminAssignments.ts` | AdminAssignment, AssignmentExercise, AssignmentSubmission, GradeDistribution, AdminAssignmentDetail, AssignmentsStats, ClassroomAssignmentsOverview, AssignmentFilters, PaginatedAssignments | 9 |
| `apps/admin/hooks/useSettings.ts` | SettingsCategory, GeneralSettings, EmailSettings, NotificationSettings, SecuritySettings, MaintenanceSettings, SystemSettings, UseSettingsResult | 8 |
| `apps/admin/hooks/useContentQueries.ts` | Exercise, ApprovalItem, UsePendingExercisesQueryOptions, UseMediaLibraryQueryOptions, UseContentVersionsQueryOptions, UseApprovalsQueryOptions, UseLegacyExercisesOptions | 7 |
| `apps/admin/hooks/useSystemMetrics.ts` | SystemMetrics, MetricsHistory, HealthStatus | 3 |
| `apps/admin/hooks/useSystemLogs.ts` | LogLevel, SystemLogFilters, UseSystemLogsParams, UseSystemLogsResult | 4 |
| `apps/admin/hooks/useSystemMonitoring.ts` | UseSystemMonitoringResult, HealthSnapshot | 2 |
| `apps/admin/hooks/useUserManagement.ts` | CreateUserParams, CreatedUserResult, UseUserManagementResult | 3 |
| `apps/admin/hooks/useUserActions.ts` | ConfirmDialogState, UserActionDeps, UseUserActionsResult | 3 |
| `apps/admin/hooks/useOrganizations.ts` | UseOrganizationsResult, CreateOrganizationData, UpdateOrganizationData, SubscriptionData | 4 |
| `apps/admin/hooks/useAdminDashboard.ts` | UseAdminDashboardResult, RefreshIntervals | 2 |
| `apps/admin/hooks/useAdminData.ts` | UserActivity, ErrorLog | 2 |
| `apps/admin/hooks/useConfigCategories.ts` | ConfigValidationResult, UseConfigCategoriesResult | 2 |
| `apps/admin/hooks/useContentManagement.ts` | UsePendingExercisesResult, UseMediaLibraryResult, UseContentVersionsResult, UseApprovalsResult | 4 |
| `apps/admin/hooks/useReports.ts` | UseReportsOptions, UseReportsReturn | 2 |
| `apps/admin/hooks/useRoles.ts` | UseRolesResult | 1 |
| `apps/admin/hooks/useRolePermissions.ts` | UseRolePermissionsResult | 1 |
| `apps/admin/hooks/useProgress.ts` | UseProgressResult | 1 |
| `apps/admin/hooks/useMonitoring.ts` | UseMonitoringReturn | 1 |
| `apps/admin/hooks/useAlerts.ts` | UseAlertsReturn | 1 |
| `apps/admin/hooks/useAuditLogs.ts` | UseAuditLogsParams, UseAuditLogsResult | 2 |
| `apps/admin/hooks/useAnalytics.ts` | UseAnalyticsReturn | 1 |
| `apps/admin/hooks/useLtiConsumers.ts` | UseLtiConsumersResult | 1 |
| `apps/admin/hooks/useFeatureFlags.ts` | UseFeatureFlagsResult | 1 |
| `apps/admin/hooks/useClassroomsList.ts` | UseClassroomsListParams, UseClassroomsListReturn | 2 |
| `apps/admin/hooks/useInstitutionActions.ts` | PlanType, InstitutionFormData | 2 |
| `apps/admin/hooks/useCreateUserFlow.ts` | CreateUserFlowDeps | 1 |

**Admin total: ~67 inline type definitions across 26 hooks**

### 3.2 Teacher Portal Hooks (with inline types)

| Hook File | Inline Types Defined | Count |
|-----------|---------------------|------:|
| `apps/teacher/hooks/useClassroomRealtime.ts` | StudentActivity, ClassroomUpdate, NewSubmission, AlertTriggered, StudentOnlineStatus, ProgressUpdate, RealtimeEvent, UseClassroomRealtimeOptions, UseClassroomRealtimeReturn | 9 |
| `apps/teacher/hooks/useMasteryTracking.ts` | SkillMastery, CompetencyProgress, MasteryData, ClassroomMasteryOverview, UseMasteryTrackingReturn, UseClassroomMasteryReturn, ModuleProgress | 7 |
| `apps/teacher/hooks/useMissionStats.ts` | ClassroomMission, MissionParticipant, MissionStats, UseMissionStatsReturn | 4 |
| `apps/teacher/hooks/useManualReviews.ts` | ManualReviewFilters, UpdateReviewVariables, CompleteReviewVariables | 3 |
| `apps/teacher/hooks/useManualReviewConfig.ts` | ManualReviewModule, ManualReviewExercise, ManualReviewConfig | 3 |
| `apps/teacher/hooks/useTeacherContent.ts` | ContentFilters, PaginationState, UseTeacherContentReturn | 3 |
| `apps/teacher/hooks/useTeacherMessages.ts` | MessageFilters, PaginationState, UseTeacherMessagesReturn | 3 |
| `apps/teacher/hooks/useClassroomsStats.ts` | ClassroomStats, AggregateStats, UseClassroomsStatsReturn | 3 |
| `apps/teacher/hooks/useAnalytics.ts` | StudentInsights, UseStudentInsightsReturn, UseAnalyticsReturn | 3 |
| `apps/teacher/hooks/useAssignments.ts` | BackendAssignment, SendReminderResult, UseAssignmentsReturn | 3 |
| `apps/teacher/hooks/useStudentMonitoring.ts` | RefreshInterval, UseStudentMonitoringOptions, UseStudentMonitoringReturn | 3 |
| `apps/teacher/hooks/useInterventionAlerts.ts` | AlertFilters, UseInterventionAlertsReturn | 2 |
| `apps/teacher/hooks/useStudentBlocking.ts` | UseStudentBlockingReturn | 1 |
| `apps/teacher/hooks/useStudentProgress.ts` | UseStudentProgressReturn | 1 |
| `apps/teacher/hooks/useTeacherDashboard.ts` | UseTeacherDashboardReturn | 1 |
| `apps/teacher/hooks/useClassrooms.ts` | UseClassroomsReturn | 1 |
| `apps/teacher/hooks/useGrading.ts` | UseGradingReturn | 1 |
| `apps/teacher/hooks/useGrantBonus.ts` | UseGrantBonusReturn | 1 |
| `apps/teacher/hooks/useAlertConfig.ts` | UseAlertConfigReturn | 1 |
| `apps/teacher/hooks/useAchievementsStats.ts` | UseAchievementsStatsReturn | 1 |
| `apps/teacher/hooks/useEconomyAnalytics.ts` | UseEconomyAnalyticsReturn | 1 |
| `apps/teacher/hooks/useStudentsEconomy.ts` | UseStudentsEconomyReturn | 1 |

**Teacher total: ~52 inline type definitions across 22 hooks**

### 3.3 Student Portal Hooks (with inline types)

| Hook File | Inline Types Defined | Count |
|-----------|---------------------|------:|
| `apps/student/hooks/useDashboardData.ts` | MLCoinsData, RankData, AchievementData, ProgressData, DashboardData | 5 |
| `apps/student/hooks/useExerciseState.ts` | Exercise, ExerciseAttempt, ExerciseState, UseExerciseStateProps | 4 |
| `apps/student/hooks/useExerciseAutoSave.ts` | UseExerciseAutoSaveOptions, AutoSaveState, UseExerciseAutoSaveReturn | 3 |
| `apps/student/hooks/useUserModules.ts` | UserModuleData, UseUserModulesParams, UseUserModulesReturn | 3 |
| `apps/student/hooks/useResponsiveLayout.ts` | Breakpoint, Orientation, ResponsiveLayoutState | 3 |
| `apps/student/hooks/useRecentActivities.ts` | ActivityData, UseRecentActivitiesReturn | 2 |
| `apps/student/hooks/useSwipeGesture.ts` | SwipeGestureOptions, TouchPosition | 2 |
| `apps/student/hooks/useExercisePowerUps.ts` | PowerUpEffects, UsePowerUpOptions | 2 |
| `apps/student/hooks/useAchievementsEnhanced.ts` | UseAchievementsEnhancedResult | 1 |
| `apps/student/hooks/useUserClassroom.ts` | UseUserClassroomReturn | 1 |

**Student total: ~26 inline type definitions across 10 hooks**

### 3.4 Shared/Feature Hooks (with inline types)

| Hook File | Inline Types Defined | Count |
|-----------|---------------------|------:|
| `shared/hooks/useSpeechToText.ts` | SpeechError, SpeechState, SpeechLanguage, UseSpeechToTextOptions, UseSpeechToTextReturn, SpeechRecognitionEvent, ..Result, ..ResultList, ..Alternative, ..Instance | 10 |
| `shared/hooks/useVideoRecorder.ts` | VideoRecorderError, VideoConstraints, RecordingState, PermissionState, UseVideoRecorderReturn | 5 |
| `shared/hooks/useAudioRecorder.ts` | AudioRecorderError, RecordingState, PermissionState, UseAudioRecorderReturn | 4 |
| `shared/hooks/useSectionedRecorder.ts` | VideoSection, SectionRecording, UseSectionedRecorderReturn | 3 |
| `shared/hooks/useModules.ts` | Module, Exercise, ModuleProgress, UseModuleDetailReturn | 4 |
| `shared/hooks/useUserPreferences.ts` | UserPreferences, UseUserPreferencesReturn | 2 |
| `shared/hooks/useUserStatistics.ts` | UserStatistics | 1 |
| `shared/hooks/useUserGamification.ts` | UseUserGamificationReturn | 1 |
| `shared/hooks/useInvalidateDashboard.ts` | UseInvalidateDashboardReturn | 1 |
| `shared/hooks/usePersistedFilters.ts` | PersistedFiltersOptions, PersistedData | 2 |
| `shared/hooks/useModuleAccess.ts` | UseModuleAccessParams, UseModuleAccessReturn | 2 |
| `features/gamification/achievements/hooks/useAchievements.ts` | CombinedAchievement, AchievementDisplaySummary, UseAchievementsReturn, UseAchievementFiltersReturn | 4 |
| `features/gamification/economy/hooks/useShopPurchase.ts` | UseShopPurchaseReturn | 1 |
| `features/gamification/economy/hooks/useShopData.ts` | UseShopDataReturn | 1 |
| `features/gamification/social/hooks/useAdvancedLeaderboard.ts` | LeaderboardCache, UseLeaderboardResult | 2 |
| `features/gamification/social/hooks/useInventoryData.ts` | PurchaseRecord, OwnedPowerUp, UseInventoryDataReturn | 3 |
| `features/gamification/social/hooks/useActivatePowerUp.ts` | UseActivatePowerUpReturn | 1 |
| `features/gamification/social/hooks/useAchievements.ts` | UseAchievementsOptions | 1 |
| `features/gamification/ranks/hooks/*.ts` (4 hooks) | UseRankReturn, UseRanksConfigReturn, UseProgressionReturn, UseMultipliersReturn, UseRankUpNotificationReturn | 5 |
| `features/gamification/missions/hooks/useMissions.ts` | UseMissionsResult | 1 |
| `features/exercises/hooks/useExerciseTimer.ts` | UseExerciseTimerOptions | 1 |
| `features/exercises/hooks/useExerciseData.ts` | ExerciseData, PedagogicalGuide, UseExerciseDataReturn | 3 |
| `features/exercises/hooks/useExerciseComodines.ts` | ComodinUsageLog, ComodinUsageLimits, UseExerciseComodinesReturn | 3 |
| `features/exercises/hooks/useExerciseRewards.ts` | UseExerciseRewardsOptions | 1 |
| `features/exercises/hooks/useExerciseProgress.ts` | ExerciseProgress, ProgressUpdate, UseExerciseProgressReturn | 3 |
| `features/mechanics/shared/hooks/useExerciseSubmission.ts` | SubmitExercisePayload (Zod), SubmissionResult, UseExerciseSubmissionOptions | 3 |
| `features/notifications/hooks/useWebSocket.ts` | WebSocketNotificationType, WebSocketNotification, UseWebSocketReturn | 3 |
| `features/notifications/hooks/usePushNotifications.ts` | UsePushNotificationsReturn | 1 |
| `features/progress/hooks/useSubmitProgress.ts` | UseSubmitProgressOptions, UseSubmitProgressReturn | 2 |

**Shared/Features total: ~70 inline type definitions across 29 hooks**

### Grand total: **~215 inline type definitions across 87 hooks**

---

## 4. `any` Usage in Type Files

### 4.1 In `types/` directory files

| File | Line | Usage | Severity |
|------|-----:|-------|----------|
| `features/auth/types/auth.types.ts` | 256 | `[key: string]: any; // Allow additional dynamic preferences` | MEDIUM |
| `shared/types/progress.types.ts` | 265 | `learning_path: any[];` | HIGH |
| `shared/types/educational.types.ts` | 649 | `[key: string]: any;` | MEDIUM |
| `shared/types/educational.types.ts` | 657 | `input: any;` | HIGH |
| `shared/types/educational.types.ts` | 658 | `expected_output: any;` | HIGH |
| `features/gamification/social/types/inventory.types.ts` | 17 | `metadata: Record<string, any>;` | LOW |
| `features/gamification/social/types/inventory.types.ts` | 36 | `data?: any;` | MEDIUM |
| `features/exercises/types/exercise-mechanic.types.ts` | 103 | `adapter: (exercise: any) => any;` | HIGH |

### 4.2 In `*Types.ts` files

| File | Line | Usage | Severity |
|------|-----:|-------|----------|
| `features/mechanics/module3/PodcastArgumentativo/podcastArgumentativoTypes.ts` | 5 | `analysis: any \| null;` | MEDIUM |

### 4.3 In `services/api/apiTypes.ts` (generic API layer)

| Line | Usage | Notes |
|-----:|-------|-------|
| 15 | `ApiResponse<T = any>` | Default generic parameter -- acceptable |
| 214 | `BulkOperationRequest<T = any>` | Default generic parameter -- acceptable |
| 262 | `WebhookPayload<T = any>` | Default generic parameter -- acceptable |

**Total: 9 problematic `any` usages in type files (excluding generic defaults)**

---

## 5. Type Organization Pattern Per Portal

### 5.1 Admin Portal

**Primary type sources:**
1. `apps/admin/types/index.ts` (272 lines) -- Portal-specific types: SystemHealth, Organization, FeatureFlag, etc.
2. `apps/admin/types/exercise-builder.types.ts` (17 lines) -- Exercise builder form data
3. `services/api/adminTypes.ts` (1140 lines) -- **MASSIVE** file with 90+ interfaces covering ALL admin API responses
4. `src/types/admin/*.types.ts` (3 files) -- Root-level admin types for achievements, gamification, classroom-teacher

**Pattern:** Admin types are scattered across 4 locations:
- `apps/admin/types/` -- UI-focused types
- `services/api/adminTypes.ts` -- API response types (1140 lines, should be split)
- `src/types/admin/` -- Additional admin types that should be in `apps/admin/types/`
- 26 hooks define ~67 types inline

**Problem:** `src/types/admin/` exists separately from `apps/admin/types/`, creating confusion about canonical location. The `services/api/adminTypes.ts` at 1140 lines is too large and duplicates many types from `apps/admin/types/index.ts`.

### 5.2 Teacher Portal

**Primary type sources:**
1. `apps/teacher/types/index.ts` (536 lines) -- Portal-specific: StudentMonitoring, Classroom, Exercise, InterventionAlert, etc.
2. Various `services/api/teacher/*.ts` files define inline types

**Pattern:** Teacher types are mostly centralized in one file, but:
- 22 hooks define ~52 types inline
- `Classroom` and `Exercise` are redefined inline (minimal versions)
- Intervention alert types exist in 3 places: `teacher/types/`, `teacher/hooks/`, `teacher/services/api/`

**Problem:** The single `index.ts` at 536 lines is getting large. No sub-files for different domains (monitoring, alerts, grading, etc.).

### 5.3 Student Portal

**Primary type sources:**
1. `apps/student/types/gamificationTypes.ts` (45 lines) -- LeaderboardEntry, Mission, StreakData only
2. `apps/student/components/achievements/types.ts` (65 lines) -- Achievement extension
3. `apps/student/components/profile/types.ts` (30 lines) -- Profile stats

**Pattern:** Student portal has the FEWEST dedicated types (3 small files). It relies heavily on:
- `shared/types/` for core entities
- Feature-level types from `features/gamification/`, `features/exercises/`, `features/progress/`
- 10 hooks define ~26 types inline

**Problem:** Lacks a proper `apps/student/types/index.ts` barrel. Types are scattered in component folders and hooks.

### 5.4 Cross-Portal Analysis

| Location | Admin Types | Teacher Types | Student Types | Shared Types |
|----------|----------:|-------------:|-------------:|-------------:|
| `apps/*/types/` | 2 files | 1 file | 1 file | -- |
| `src/types/` | 3 files | 0 | 0 | -- |
| `shared/types/` | -- | -- | -- | 28 files |
| `services/api/` | 1 file (1140 LOC) | inline in API files | -- | 1 file (300 LOC) |
| Inline in hooks | 67 types | 52 types | 26 types | 70 types |
| Inline in components | ~5 | ~5 | ~10 | ~15 |

**Key finding:** `src/types/admin/` (3 files) should be consolidated into `apps/admin/types/`. The root `src/types/` folder is a hybrid between admin types and shared re-exports, which is confusing.

---

## 6. Import Chain Analysis

### 6.1 Most-imported type sources (by consumer count)

| Source | Consumers | Description |
|--------|----------:|-------------|
| `services/api/adminTypes.ts` | 48 files | Admin components, hooks, pages |
| `shared/types/` (barrel) | 12 files | Layouts, shared components, factories |
| `apps/teacher/types/index.ts` | 9 files | Teacher hooks, API services |
| `services/api/apiTypes.ts` | 8 files | Feature API files (progress, auth, mechanics, gamification) |
| `features/auth/types/auth.types.ts` | 5 files | Layouts, auth components, shared types |
| `features/progress/api/progressTypes.ts` | 1 file | Ranks hook only |
| `apps/admin/types/index.ts` | 1 file | Only services/api/adminAPI.ts |

### 6.2 Import chain for `User` type

```
shared/types/user.types.ts (SSOT definition)
  |
  +-> shared/types/index.ts (barrel re-export)
  |     +-> shared/components/layout/GamifiedHeader.tsx
  |     +-> shared/layouts/DashboardLayout.tsx
  |     +-> apps/student/components/dashboard/ModuleGridCard.tsx
  |
  +-> shared/types/user.types.ts (direct import)
        (not widely used directly)

features/auth/types/auth.types.ts (auth-specific User)
  |
  +-> shared/types/auth.types.ts (re-export wrapper)
  |     +-> shared/types/index.ts (barrel)
  |
  +-> features/auth/components/UserTable.tsx
  +-> apps/admin/layouts/AdminLayout.tsx
  +-> apps/teacher/layouts/TeacherLayout.tsx
  +-> shared/components/layout/GamifiedHeader.tsx (imports BOTH)

services/api/adminTypes.ts (admin-specific User)
  |
  +-> 48 admin files (hooks, components, pages)
```

**Problem:** `GamifiedHeader.tsx` imports from both `shared/types` and `features/auth/types`, getting two different `User` interfaces. Admin portal uses yet a third `User` from `adminTypes.ts`.

### 6.3 Import chain for `PaginatedResponse`

```
shared/types/api-responses.ts  --> shared/types barrel
services/api/apiTypes.ts       --> 8 feature API files
services/api/adminTypes.ts     --> 48 admin files
apps/admin/types/index.ts      --> 1 file (adminAPI.ts)
```

Four independent `PaginatedResponse` types with different pagination metadata shapes (`hasMore` vs `hasNextPage/hasPreviousPage` vs flat `total/page/pageSize`).

### 6.4 Import chain for `Exercise`

```
shared/types/educational.types.ts (SSOT candidate)
  |
  +-> shared/types/index.ts --> shared barrel consumers (factories, components)

features/exercises/types/exercise.types.ts (feature SSOT candidate)
  |
  +-> features/exercises/types/index.ts barrel
  +-> (few direct consumers found)

apps/teacher/types/index.ts (minimal inline)
  |
  +-> 9 teacher hooks/services

apps/admin/hooks/useContentQueries.ts (inline)
  +-> apps/admin/hooks/useContentManagement.ts (re-export)

apps/student/hooks/useExerciseState.ts (inline)
  +-> apps/student/hooks/index.ts (re-export)
```

---

## 7. Summary and Recommendations

### 7.1 Critical Issues Found

| # | Issue | Severity | Affected Types |
|---|-------|----------|----------------|
| 1 | **Pagination type chaos** -- 4 incompatible `PaginatedResponse` definitions | CRITICAL | All paginated endpoints |
| 2 | **Exercise** defined in 5 places | HIGH | Exercise feature, teacher, admin, student |
| 3 | **User** defined in 3 places with incompatible shapes | HIGH | Auth, admin, shared |
| 4 | **ExerciseAttempt** defined in 5 places | HIGH | Progress, exercises, mechanics, student |
| 5 | **Achievement** defined in 6 places | HIGH | Gamification, achievements, progress, admin |
| 6 | **Organization** defined in 4 places | HIGH | Auth, admin, API, Zod schemas |
| 7 | **Classroom** defined in 3 places with competing SSOTs | HIGH | Social, classroom, teacher |
| 8 | **LeaderboardEntry** defined in 5 places | MEDIUM | Student, gamification, battles |
| 9 | **215 inline types in hooks** instead of dedicated type files | MEDIUM | All portals |
| 10 | **`adminTypes.ts` is 1140 lines** with 90+ interfaces | MEDIUM | Admin portal |
| 11 | **`src/types/admin/`** coexists with `apps/admin/types/` | MEDIUM | Admin portal |
| 12 | **9 `any` usages** in type definition files | LOW | Mixed |

### 7.2 Recommended Actions

1. **[P0] Consolidate pagination types** -- Single `PaginatedResponse<T>` in `shared/types/api-responses.ts`, all others import from there.

2. **[P0] Establish single SSOT per entity** -- For each core entity (`User`, `Exercise`, `Achievement`, `Classroom`, `ExerciseAttempt`), pick ONE canonical location and make all others import or `Pick<>` from it:
   - `User` -> `shared/types/user.types.ts`
   - `Exercise` -> `shared/types/educational.types.ts`
   - `Achievement` -> `shared/types/achievement.types.ts`
   - `Classroom` -> `shared/types/classroom.types.ts`
   - `ExerciseAttempt` -> `shared/types/progress.types.ts`

3. **[P1] Split `adminTypes.ts`** (1140 lines) into domain files:
   - `services/api/admin/organizationTypes.ts`
   - `services/api/admin/userTypes.ts`
   - `services/api/admin/systemTypes.ts`
   - `services/api/admin/analyticsTypes.ts`
   - `services/api/admin/progressTypes.ts`

4. **[P1] Consolidate `src/types/admin/`** into `apps/admin/types/` -- Eliminate root-level admin type folder.

5. **[P1] Extract hook inline types** -- For hooks with 3+ type definitions, extract to a sibling `.types.ts` file:
   - `useAdminAssignments.ts` (9 types) -> `useAdminAssignments.types.ts`
   - `useSettings.ts` (8 types) -> import from `adminTypes.ts`
   - `useClassroomRealtime.ts` (9 types) -> `useClassroomRealtime.types.ts`
   - `useMasteryTracking.ts` (7 types) -> `useMasteryTracking.types.ts`

6. **[P2] Create `apps/student/types/index.ts`** barrel with proper student-specific types.

7. **[P2] Remove deprecated aliases** -- `Profile = AuthProfile` in auth.types.ts, legacy `Classroom` in social.types.ts.

8. **[P2] Replace `any`** -- 9 specific replacements needed (use `unknown`, `Record<string, unknown>`, or specific types).

### 7.3 Metrics

| Metric | Value |
|--------|------:|
| Total type definition files | 91 |
| Duplicate type names (2+ locations) | 18 |
| Critical duplicates (3+ locations) | 7 |
| Types inline in hooks | 215 |
| Hooks with inline types | 87 |
| `any` in type files | 9 |
| Largest type file | `adminTypes.ts` (1140 lines) |
| Portal with most type scatter | Admin (4 locations + 67 inline) |
| Portal with fewest dedicated types | Student (3 small files) |

---

*Generated by SIMCO audit -- 2026-02-19*
