# Track C: Analisis de Componentes Compartibles y Duplicados

**Fecha:** 2026-02-19
**Archivos analizados:** 312 components across 4 directories (63 shared, 55 teacher, 124 admin, 70 student) + 9 legacy + ~130 features

## Resumen Ejecutivo

Se identificaron **17 hallazgos de duplicacion** entre los 3 portales (student, teacher, admin) y el directorio shared. Los problemas mas criticos son:

1. **SaveButton** duplicado textualmente entre teacher y student (P0 - 95%+ identico)
2. **ProfileSettings** duplicado entre teacher y admin con la misma logica de perfil/password (P0 - 80% identico)
3. **PrivacySettings** duplicado entre teacher y student con patron de toggles identico (P0 - 75% identico)
4. **Modal** duplicado en 2 ubicaciones shared (Modal.tsx vs common/Modal.tsx) (P0)
5. **ConfirmDialog** duplicado en 2 ubicaciones shared (feedback/ vs common/) (P1)
6. **StatusBadge** tiene version shared pero 6+ componentes admin reimplementan getStatusBadge inline (P1)
7. **AlertCard** existe como nombre en teacher y admin pero son componentes legitimamente diferentes (No-Action)
8. **42 modals** usan `fixed inset-0 z-50` inline en lugar del shared Modal (P1)
9. **TabBar** existe en shared y AdminTabBar en admin con API diferente (P1 - unifiable)
10. **PageShell** pattern ya consolidado correctamente en los 3 portales (Good Practice)

**Resumen numerico:**
- Duplicados puros a eliminar: **3** (SaveButton, Modal root, ConfirmDialog root)
- Componentes a consolidar en shared: **5** (ProfileSettings, PrivacySettings, NotificationSettings, Pagination, FilterPanel)
- Componentes con inline reimplementaciones a migrar a shared: **2** (StatusBadge usage, ConfirmDialog)
- Componentes que son legitimamente diferentes: **7** (AlertCard, DashboardHero, ReportGenerator, custom Modals, custom Filters, SecuritySettings, TeachingPreferences)

---

## Inventario de Componentes por Portal

### Shared (apps/frontend/src/shared/components/) -- 63 production .tsx

| Subdirectorio | Componentes | Descripcion |
|---------------|-------------|-------------|
| root | AchievementCard, AchievementFilter, AchievementModal, AchievementsGrid, Avatar, AvatarDisplay, AvatarUpload, Button, Card, ErrorBoundary, ExerciseAttemptCard, Footer, Header, Input, LeaderboardTable, LeaderboardTabs, Modal, ProgressCard, ProgressFilter, ProtectedRoute, Sidebar, StatsOverview, UnderConstruction, UserStatsCard | Base UI + gamification display |
| base/ | ColorfulCard, DetectiveButton, DetectiveCard, EnhancedCard, InputDetective, ProgressBar, RankBadge, StatusBadge, TabBar, Toast | Design-system primitives |
| common/ | ConfirmDialog, DataTable, FeatureBadge, FormField, Modal | Data display + form + dialog |
| feedback/ | ConfirmDialog, EmptyState, ErrorMessage | Feedback patterns |
| loading/ | LoadingOverlay, LoadingSpinner, SkeletonCard | Loading states |
| layout/ | GamifiedHeader, GamilitSidebar | Layout wrappers |
| celebrations/ | ConfettiCelebration | Celebration effects |
| exercises/ | UnifiedExerciseLayout | Exercise display |
| mechanics/ | ExerciseContentRenderer, ExerciseGradientHeader, FeedbackModal, HintSystem, MediaUploader, ProgressTracker, RubricEvaluator, ScoreDisplay, TimerWidget | Exercise mechanic UI |
| media/ | AudioPlayer, NavigationPathViewer, VideoPlayer | Media playback |
| profile/ | AvatarSelectionModal | Profile avatar |
| timeline/ | ActivityTimeline | Activity display |

### Teacher Portal Components -- 55 .tsx

| Subdirectorio | Componentes |
|---------------|-------------|
| alerts/ (2) | AlertCard, InterventionAlertsPanel |
| analytics/ (3) | EngagementMetricsChart, LearningAnalyticsDashboard, PerformanceInsightsPanel |
| assignments/ (5) | AssignmentCard, AssignmentCreator, AssignmentList, AssignmentWizard, ImprovedAssignmentWizard, SubmissionsModal |
| collaboration/ (2) | ParentCommunicationHub, ResourceSharingPanel |
| communication/ (6) | AnnouncementForm, ConversationsList, FeedbackForm, MessageComposer, MessageFilters, MessagesList |
| dashboard/ (9) | ClassroomCard, ClassroomsGrid, CreateAssignmentModal, CreateClassroomModal, GradeSubmissionModal, PendingSubmissionsList, QuickActionsPanel, RecentAssignmentsList, StudentAlerts, TeacherDashboardHero |
| monitoring/ (7) | RefreshControl, StudentActionsMenu, StudentDetailModal, StudentMonitoringPanel, StudentPagination, StudentStatusCard, SuspendStudentModal |
| progress/ (4) | ClassProgressDashboard, ModuleCompletionCard, ProgressChart, StudentProgressList |
| reports/ (3) | RecentReportsTable, ReportGenerator, ReportTemplateSelector |
| responses/ (3) | ResponseDetailModal, ResponseFilters, ResponsesTable |
| review-panel/ (2) | ReviewDetail, ReviewList |
| settings/ (5) | NotificationsSettingsSection, PrivacySettingsSection, ProfileSettingsSection, SaveButton, TeachingPreferencesSection |
| shared/ (1) | TeacherPageShell |

### Admin Portal Components -- 124 .tsx (incl. example files)

| Subdirectorio | Componentes |
|---------------|-------------|
| advanced/ (8) | ABTestingDashboard, EconomicInterventionPanel, FeatureFlagControls, FeatureFlagEditor, FeatureFlagsPanel, RolloutSlider, TargetingConfig, TenantManagementPanel |
| alerts/ (7) | AcknowledgeAlertModal, AlertCard, AlertDetailsModal, AlertFilters, AlertsList, AlertsStats, ResolveAlertModal |
| analytics/ (4) | EngagementTab, GamificationTab, OverviewTab, RetentionTab |
| assignments/ (3) | AssignmentDetailModal, AssignmentFilters, AssignmentsTable |
| audit/ (4) | AuditLogFilters, AuditLogStats, AuditLogTable, LogDetailModal |
| classroom-teacher/ (2) | ClassroomTeachersTab, TeacherClassroomsTab |
| content/ (8) | ContentApprovalQueue, ContentPreviewModal, ContentVersionControl, ContentVersionsTab, ExerciseContentEditor, ExercisePreviewModal, MediaLibraryManager, MediaLibraryTab, PendingExercisesTab, RejectExerciseModal |
| dashboard/ (12) | AdminDashboardHero, AlertsNotificationsCard, DashboardQuickActions, DashboardStatsGrid, OrganizationsTable, QuickActionsGrid, RecentActionsTable, SystemAlertsPanel, SystemHealthCard, SystemLogsViewer, SystemMetricsGrid, UserActivityChart, UserManagementTable |
| exercise-builder/ (4 + 16 configs) | ContentEditor, ExercisePreview, ExerciseTypeSelector, StepBasicInfo, + 16 type-configs |
| gamification/ (8) | AchievementsTab, BulkUpdateDialog, EconomyTab, MayaRankEditModal, ParameterEditModal, PreviewImpactDialog, RanksTab, RestoreDefaultsDialog, StatsTab |
| institutions/ (5) | InstitutionDetailModal, InstitutionFilters, InstitutionFormModals, InstitutionsTable, InstitutionStats |
| monitoring/ (8) | AlertasTab, ErrorTrackingPanel, ErrorTrackingTab, LogsViewer, MetricsChart, MetricsTab, SystemHealthIndicators, SystemPerformanceDashboard, UserActivityMonitor |
| notifications/ (3) | NotificationFilters, NotificationHeader, NotificationItem |
| progress/ (5) | ClassroomSelector, ClassroomsView, OverviewView, StudentDetailView, StudentSearch |
| reports/ (3) | BetaBanner, ReportGenerationForm, ReportsList |
| roles/ (4) | PermissionMatrix, RoleActionsMenu, RoleEditor, RolesTable |
| settings/ (3) | GeneralSettings, ProfileSettings, SecuritySettings |
| shared/ (2) | AdminPageShell, AdminTabBar |
| users/ (7) | BulkActionsPanel, CreateUserModal, UserAdvancedFilters, UserBadges, UserDetailModal, UsersSearchFilters, UsersStatsGrid, UsersTable |

### Student Portal Components -- 70 production .tsx

| Subdirectorio | Componentes |
|---------------|-------------|
| achievements/ (5) | AchievementDetailModal, AchievementFilters, AchievementGrid, AchievementsPageHeader, AchievementStatistics |
| dashboard/ (16) | AchievementMilestones, BottomNavigation, EnhancedStatsGrid, MissionsPanel, MLCoinsWidget, ModuleGridCard, ModuleGridCardEnhanced, ModulesSection, ProgressStats, QuickActionsCard, QuickActionsPanel, QuickActionsWidget, RankProgressWidget, RecentActivityFeed, RecentActivityPanel, ResponsiveLayout, StatsGrid |
| exercise/ (5) | CompletionModal, ExerciseHeader, ExercisePageHeader, ExerciseSidebar, PowerUpEffects |
| friends/ (5) | FindFriendsTab, FriendActivitiesTab, FriendRequestsTab, FriendsListTab, FriendsStatsGrid |
| gamification/ (6) | AchievementsPreview, GamificationHero, LeaderboardPreview, MLCoinsSection, RanksSection, StreaksMissionsSection |
| guilds/ (5) | CreateGuildModal, DiscoverGuildsTab, GuildChallengesTab, GuildStatsGrid, MyGuildTab |
| interactions/ (1) | SwipeableContainer |
| inventory/ (5) | ActivePowerUpsBanner, ActivePowerUpsList, InventoryItemCard, InventoryStatsGrid, PowerUpModal |
| leaderboard/ (5) | CategoryBreakdownPanel, FriendsMiniLeaderboard, LeaderboardStatsGrid, LeaderboardTipsPanel, UserPositionCard |
| learning/ (1) | ModuleCard |
| module/ (2) | ExerciseCard, ModuleMetaSections |
| notifications/ (2) | AchievementToast, CelebrationModal |
| profile/ (5) | ProfileAchievementsTab, ProfileHero, ProfileInventoryTab, ProfileRankHistoryTab, ProfileStatsTab |
| progress/ (1) | ModuleProgressCard |
| shared/ (1) | StudentPageShell |
| shop/ (3) | PurchaseModal, ShopIcon, ShopItemCard |

---

## Matriz de Duplicacion

| # | Categoria | Shared | Teacher | Admin | Student | Duplicated? | Consolidation Action |
|---|-----------|--------|---------|-------|---------|-------------|---------------------|
| 1 | AlertCard | - | AlertCard (246 lines) | AlertCard (124 lines) | - | **No** - Different domains (student intervention vs system alerts) | Keep separate - different data models |
| 2 | Report Components | - | ReportGenerator (223), RecentReportsTable (283) | ReportGenerationForm (365), ReportsList (338) | - | **Partial** - Both have date pickers, format selectors, but different report types | Consider shared ReportDateRange + ReportFormatSelector primitives |
| 3 | Modals | Modal (83), common/Modal (116) | 7 custom modals | 15 custom modals + 3 dialogs | 6 custom modals | **Yes** - 2 shared Modals + ~24 inline modals that could use shared | Consolidate to 1 Modal, migrate inline modals |
| 4 | DataTable | common/DataTable | 2 usages | 3 usages | 0 usages | **Good** - Shared DataTable used by teacher+admin | Student portal has no table needs (correct) |
| 5 | Filters | ProgressFilter, AchievementFilter | ResponseFilters, MessageFilters | AlertFilters, AssignmentFilters, AuditLogFilters, InstitutionFilters, NotificationFilters, UsersSearchFilters, UserAdvancedFilters | AchievementFilters | **Partial** - Each filter is domain-specific but shares select/date/clear pattern | Create FilterPanel primitive with composable sections |
| 6 | Dashboard Heroes | - | TeacherDashboardHero (213) | AdminDashboardHero (339) | GamificationHero | **No** - Legitimately different (teacher stats, system health, gamification) | Keep separate |
| 7 | Settings Profile | - | ProfileSettingsSection (322) | ProfileSettings (264) | ProfileSection | **Yes P0** - Teacher+Admin have nearly identical profile+password form | Create shared ProfileSettingsForm |
| 8 | Settings Privacy | - | PrivacySettingsSection (166) | - | PrivacySection (159) | **Yes P0** - Same toggle pattern, different privacy options per role | Create shared PrivacySettingsForm |
| 9 | Settings Notifications | - | NotificationsSettingsSection (306) | - | NotificationsSection (228) | **Partial** - Same structural pattern but different notification categories | Create shared NotificationToggleList |
| 10 | Pagination | - | StudentPagination (175) | (inline in tables) | - | **Yes P1** - Only teacher has explicit component; admin uses inline | Promote to shared Pagination |
| 11 | SaveButton | - | SaveButton (56) | (inline in ProfileSettings) | SaveButton (61) | **Yes P0** - Teacher and Student SaveButton are 95%+ identical | Consolidate to 1 shared SaveButton |
| 12 | StatusBadge | base/StatusBadge | inline getStatusBadge in ReviewList | UserBadges.StatusBadge + 5 inline getStatusBadge functions | inline getStatusBadge in DiscoverGuildsTab | **Yes P1** - Shared exists but widely ignored; admin has local StatusBadge | Migrate all to shared StatusBadge |
| 13 | TabBar | base/TabBar | - | AdminTabBar | - | **Partial P1** - Both exist with different APIs | Unify into TabBar with all variants |
| 14 | ConfirmDialog | common/ConfirmDialog + feedback/ConfirmDialog | inline in RecentReportsTable | inline in BulkActionsPanel, RestoreDefaultsDialog | inline in AccountSection | **Yes P1** - 2 shared + multiple inline implementations | Consolidate to 1 shared ConfirmDialog |
| 15 | QuickActions | - | QuickActionsPanel | DashboardQuickActions, QuickActionsGrid | QuickActionsCard, QuickActionsPanel, QuickActionsWidget | **No** - Intentionally different per portal | Keep separate |
| 16 | PageShell | - | TeacherPageShell | AdminPageShell | StudentPageShell | **Good Practice** - Already follows consistent pattern | No action needed |
| 17 | Loading States | loading/LoadingOverlay, LoadingSpinner, SkeletonCard | inline skeletons | inline loaders | inline skeletons | **Partial P2** - Shared exists but not consistently used | Promote awareness; create SkeletonRow |

---

## Analisis Detallado por Categoria

### 1. Alert/Notification Cards

**Files examined:**
- `apps/frontend/src/apps/teacher/components/alerts/AlertCard.tsx` (246 lines)
- `apps/frontend/src/apps/admin/components/alerts/AlertCard.tsx` (124 lines)
- `apps/frontend/src/apps/teacher/components/dashboard/StudentAlerts.tsx` (363 lines)
- `apps/frontend/src/apps/admin/components/dashboard/AlertsNotificationsCard.tsx` (111 lines)

**Finding: LEGITIMATELY DIFFERENT - No consolidation needed**

The two `AlertCard` components share the same name but serve different domains:
- **Teacher AlertCard**: Displays `InterventionAlert` for student academic risks (severity by student performance: no_activity, low_score, declining_trend). Uses `DetectiveCard` + `DetectiveButton`. Actions: SendMessage, AssignHelp, MarkForFollowUp, Resolve.
- **Admin AlertCard**: Displays `SystemAlert` for platform-level alerts (performance_degradation, high_error_rate, security_breach). Uses `DetectiveCard` + `DetectiveButton`. Actions: ViewDetails, Acknowledge, Resolve, Suppress.

The data models (`InterventionAlert` vs `SystemAlert`) are fundamentally different, and the action sets don't overlap. Both use the same design system primitives (DetectiveCard, DetectiveButton), which is the correct level of sharing.

The dashboard alert components (StudentAlerts, AlertsNotificationsCard) are even more divergent: StudentAlerts includes filtering, sorting, skeleton loading, and animated cards with framer-motion; AlertsNotificationsCard is a simple list of up to 5 items.

### 2. Report Components

**Files examined:**
- `apps/frontend/src/apps/teacher/components/reports/ReportGenerator.tsx` (223 lines)
- `apps/frontend/src/apps/teacher/components/reports/RecentReportsTable.tsx` (283 lines)
- `apps/frontend/src/apps/admin/components/reports/ReportGenerationForm.tsx` (365 lines)
- `apps/frontend/src/apps/admin/components/reports/ReportsList.tsx` (338 lines)

**Finding: PARTIALLY DUPLICATED - Extract shared primitives**

Common patterns between teacher and admin report generation:
1. **Date range picker** (start/end date inputs) - identical pattern in both
2. **Format selector** (PDF/CSV/Excel) - identical options and UI
3. **Empty state** for no reports - similar messaging
4. **Report type labels/colors** - different values but same mapping pattern
5. **Download + Delete actions** on report items

Differences:
- Teacher has: classroom-scoped, student selection, template selector, blob download
- Admin has: organization/classroom cascade filters, more report types (7 vs 4), table view, auto-refresh, status tracking (pending/generating/completed/failed)

**Recommendation:** Extract `ReportDateRangePicker` and `ReportFormatSelector` as shared primitives. The overall report generators are too different in scope to merge.

### 3. Modals

**Files examined:** All 28 modal files across portals + 2 shared Modal implementations

**Finding: CRITICAL DUPLICATION (P0) + widespread inline reimplementation (P1)**

**Duplicate shared Modals:**
1. `shared/components/Modal.tsx` (83 lines) - Uses `createPortal`, basic, sizes sm/md/lg
2. `shared/components/common/Modal.tsx` (116 lines) - Uses focus trap, backdrop blur, sizes sm/md/lg/xl/full, configurable overlay/escape behavior

These two Modal implementations are inconsistent. The `common/Modal.tsx` is the more mature version (focus trap via `useFocusTrap`, more size options, `closeOnOverlayClick`, `closeOnEscape` props, `className` pass-through). Most portal components import from `common/Modal`.

**Portal modals that use shared `common/Modal`:** 17 found (good adoption)
- Teacher: SubmissionsModal, TeacherClasses, TeacherGamification, TeacherAssignments
- Admin: ContentPreviewModal, RejectExerciseModal, RecentActionsTable, SystemAlertsPanel, InstitutionFormModals, InstitutionDetailModal
- Student: PurchaseModal, PowerUpModal, CreateGuildModal

**Portal modals with inline `fixed inset-0 z-50` implementation:** 42 files found (bad)
- Admin: 20 files (UserDetailModal, CreateUserModal, LogDetailModal, AlertDetailsModal, AcknowledgeAlertModal, ResolveAlertModal, all gamification dialogs, FeatureFlagEditor, RoleEditor, BulkActionsPanel, classroom-teacher tabs, ExercisePreviewModal, AssignmentDetailModal)
- Teacher: 12 files (CreateAssignmentModal, CreateClassroomModal, GradeSubmissionModal, StudentDetailModal, SuspendStudentModal, ResponseDetailModal, RecentReportsTable inline confirm, RefreshControl, InterventionAlertsPanel, ReviewDetail, TeacherProgress, TeacherContentManagement, TeacherCommunication)
- Student: 7 files (CompletionModal, CelebrationModal, AchievementDetailModal, ExerciseSidebar, PowerUpEffects, ResponsiveLayout, AccountSection)
- Parent: 1 file (ParentDashboardPage)

**Duplicate ConfirmDialog:**
1. `shared/components/common/ConfirmDialog.tsx` (122 lines) - Uses `common/Modal`, 4 variants (danger/warning/info/success), loading state
2. `shared/components/feedback/ConfirmDialog.tsx` (81 lines) - Standalone (no Modal wrapper), 3 variants (danger/warning/info), detective theme

Both are actively importable but have different APIs (`onClose` vs `onCancel`, `loading` prop difference, theme differences).

### 4. Data Tables

**Files examined:**
- `shared/components/common/DataTable.tsx` (138 lines)

**Finding: GOOD - Shared DataTable properly used**

The shared `DataTable` is used by:
- Teacher: `SubmissionsModal`, `TeacherStudents` page
- Admin: `PendingExercisesTab`, `MediaLibraryTab`, `ContentVersionsTab`

Admin also has several custom tables (UsersTable, RolesTable, InstitutionsTable, AuditLogTable, AssignmentsTable, OrganizationsTable, RecentActionsTable) that don't use DataTable. These custom tables have domain-specific features (inline actions, expandable rows, complex cell renderers) that justify not using DataTable.

Student portal has no table components, which is architecturally correct (students don't see tabular admin data).

### 5. Filters

**Files examined:**
- `admin/components/alerts/AlertFilters.tsx` (207 lines)
- `teacher/components/responses/ResponseFilters.tsx` (338 lines)
- Plus 8 other filter components across portals

**Finding: PARTIALLY DUPLICATED - Common pattern extractable**

All filter components share these structural elements:
1. Header with filter icon + "Filtros" title + count badge of active filters
2. Grid of select/date/text inputs
3. "Clear Filters" button
4. State management (onChange callback with filter object, page reset on change)

But each has domain-specific:
- Different filter fields (severity/status vs classroom/module vs date range)
- Different visual treatment (admin uses detective theme selects, teacher uses white bg selects)
- Different expand/collapse behavior (some have toggle, some always visible)

**Recommendation:** Create a `FilterPanel` primitive with composable `FilterSection` sub-components (already exists locally in `ResponseFilters.tsx` -- promote it to shared). Each portal composes their domain-specific filters using the shared layout.

### 6. Dashboard Cards/Heroes

**Files examined:**
- `teacher/components/dashboard/TeacherDashboardHero.tsx` (213 lines)
- `admin/components/dashboard/AdminDashboardHero.tsx` (339 lines)
- `student/components/gamification/GamificationHero.tsx`

**Finding: LEGITIMATELY DIFFERENT - No consolidation needed**

- **Teacher**: Shows greeting + 4 stat cards (classrooms, students, pending submissions, avg performance). Uses animated counters with framer-motion, gradient bg, white stat cards overlay.
- **Admin**: Shows system health monitor (CPU, memory, uptime, active users, req/min, error rate). Uses DetectiveCard, color-coded health status, progress bars, auto-refresh.
- **Student**: Shows gamification progress (XP, rank, streak, coins). Completely different visual language.

These heroes are the "identity" of each portal and should remain unique.

### 7. Settings Sections

**Files examined:**
- `teacher/components/settings/ProfileSettingsSection.tsx` (322 lines)
- `admin/components/settings/ProfileSettings.tsx` (264 lines)
- `student/pages/settings/ProfileSection.tsx`

**Finding: CRITICAL DUPLICATION (P0) - Profile settings form is 80% identical**

Both teacher and admin ProfileSettings contain:
1. Avatar upload section (identical: photo display, camera icon button, file input, upload handler)
2. Display name, first name, last name inputs (identical layout)
3. Email (disabled) field
4. Current password / new password / confirm password section with show/hide toggle
5. Save button with idle/saving/saved/error states

**Key differences:**
- Teacher uses prop-drilling pattern (receives profile, setProfile, account, setAccount, handlers as props)
- Admin has self-contained state + API calls (useAuth, profileAPI.updateProfile, profileAPI.uploadAvatar)
- Teacher has bio field with 200-char counter; admin does not
- Minor styling differences (border widths, input class names)
- Admin uses `useAuth` directly; teacher receives from parent

**Recommendation:** Create `shared/components/settings/ProfileSettingsForm.tsx` with:
- Configurable sections (avatar, name, bio, password)
- `onSave` / `onUploadAvatar` / `onChangePassword` callbacks
- Optional bio field controlled by `showBio` prop
- Consistent input styling

### 8. Pagination

**Files examined:**
- `teacher/components/monitoring/StudentPagination.tsx` (175 lines)

**Finding: MODERATE DUPLICATION (P1) - Only one explicit pagination component exists**

The teacher portal has a well-built `StudentPagination` component with:
- Page number generation with ellipsis
- Items per page selector
- "Showing X-Y of Z" text
- Previous/Next buttons
- Keyboard-friendly DetectiveButton usage

Admin portal paginates via inline implementations in several tables. Student portal has no pagination needs (scrolling/load-more pattern).

**Recommendation:** Promote `StudentPagination` to `shared/components/common/Pagination.tsx` (rename entity-specific "estudiantes" to configurable `itemLabel` prop). Admin tables can then adopt it.

### 9. Save/Cancel/Action Buttons

**Files examined:**
- `teacher/components/settings/SaveButton.tsx` (56 lines)
- `student/pages/settings/SaveButton.tsx` (61 lines)
- `admin/components/settings/ProfileSettings.tsx` (inline save button)

**Finding: CRITICAL DUPLICATION (P0) - SaveButton is a near-exact copy**

Teacher SaveButton props: `{ saveStatus, onClick, label?, icon? }`
Student SaveButton props: `{ status, onClick, idleLabel?, idleIcon? }`

Differences:
1. Prop naming: `saveStatus` vs `status`, `label` vs `idleLabel`, `icon` vs `idleIcon`
2. Saved text: "Guardado!" (teacher) vs "Guardado" (student)
3. Student exports `SaveStatus` type
4. Everything else (motion animation, cn utility, icon imports, class names, conditional rendering) is IDENTICAL

Admin ProfileSettings has an inline save button that reimplements the same idle/saving/saved pattern without motion.

**Recommendation:** Consolidate into `shared/components/common/SaveButton.tsx`. Use student's prop naming (cleaner: `status` instead of `saveStatus`). Export `SaveStatus` type.

### 10. StatusBadge Usage

**Files examined:**
- `shared/components/base/StatusBadge.tsx` (108 lines)
- `admin/components/users/UserBadges.tsx` (59 lines)
- 6+ inline `getStatusBadge` functions across admin components

**Finding: MODERATE DUPLICATION (P1) - Shared StatusBadge exists but widely ignored**

The shared `StatusBadge` supports 6 statuses: active, inactive, suspended, pending, completed, in_progress. It uses proper ARIA, forwardRef, 3 sizes, icons, and custom labels.

But the following components **do NOT use shared StatusBadge** and instead reimpliment `getStatusBadge()` inline:
- `admin/components/users/UserBadges.tsx` - Local StatusBadge (supports: active, inactive, suspended, banned, pending)
- `admin/components/assignments/AssignmentsTable.tsx` - Inline getStatusBadge
- `admin/components/assignments/AssignmentDetailModal.tsx` - Inline getSubmissionStatusBadge
- `admin/components/progress/StudentDetailView.tsx` - Inline getStatusBadge
- `admin/components/dashboard/OrganizationsTable.tsx` - Inline getStatusBadge
- `teacher/components/review-panel/ReviewList.tsx` - Inline getStatusBadge
- `student/components/guilds/DiscoverGuildsTab.tsx` - Inline getStatusBadge

Root cause: The shared StatusBadge has a limited `StatusType` union (`active | inactive | suspended | pending | completed | in_progress`). Components that need additional statuses (banned, open, draft, submitted, graded, etc.) cannot use it.

**Recommendation:** Extend shared StatusBadge to accept arbitrary status strings with a configurable color/icon mapping, or add the missing statuses. Then migrate all inline implementations.

---

## Propuesta de Consolidacion

### Componentes a crear en shared/ (nuevos)

| # | Componente | Location | Description | Eliminates |
|---|-----------|----------|-------------|------------|
| 1 | `shared/components/common/SaveButton.tsx` | New | Unified SaveButton with status states | Teacher SaveButton + Student SaveButton + Admin inline |
| 2 | `shared/components/settings/ProfileSettingsForm.tsx` | New | Reusable profile+avatar+password form | Teacher ProfileSettingsSection + Admin ProfileSettings (partial) |
| 3 | `shared/components/settings/PrivacySettingsForm.tsx` | New | Configurable privacy toggle list | Teacher PrivacySettingsSection + Student PrivacySection (partial) |
| 4 | `shared/components/settings/NotificationToggleGroup.tsx` | New | Grouped notification toggles | Teacher NotificationsSettingsSection + Student NotificationsSection (structural) |
| 5 | `shared/components/common/Pagination.tsx` | New | Server-side pagination | Teacher StudentPagination |
| 6 | `shared/components/common/FilterPanel.tsx` | New | Composable filter layout | Inline filter patterns across admin/teacher |

### Componentes a migrar a shared/ (desde portal-specific)

| # | Fuente | Destino | Notes |
|---|--------|---------|-------|
| 1 | `teacher/monitoring/StudentPagination.tsx` | `shared/components/common/Pagination.tsx` | Rename entity label to configurable prop |
| 2 | `teacher/responses/ResponseFilters.FilterSection` | `shared/components/common/FilterSection.tsx` | Local sub-component already well-designed |

### Componentes a eliminar (duplicados puros)

| # | Archivo a eliminar | Reemplazado por | Impacto |
|---|-------------------|-----------------|---------|
| 1 | `shared/components/Modal.tsx` (83 lines) | `shared/components/common/Modal.tsx` (116 lines) | Re-export from common/Modal; update any remaining imports |
| 2 | `shared/components/feedback/ConfirmDialog.tsx` (81 lines) | `shared/components/common/ConfirmDialog.tsx` (122 lines) | Re-export from common/ConfirmDialog or merge detective theme |
| 3 | `teacher/settings/SaveButton.tsx` (56 lines) | `shared/components/common/SaveButton.tsx` (new) | Update teacher settings imports |
| 4 | `student/pages/settings/SaveButton.tsx` (61 lines) | `shared/components/common/SaveButton.tsx` (new) | Update student settings imports |

---

## Hallazgos Criticos (P0)

| # | ID | Hallazgo | Archivos | Accion |
|---|-----|----------|----------|--------|
| 1 | DUP-P0-001 | SaveButton duplicado textualmente entre teacher y student | `teacher/settings/SaveButton.tsx`, `student/pages/settings/SaveButton.tsx` | Crear `shared/components/common/SaveButton.tsx` y reemplazar ambos |
| 2 | DUP-P0-002 | ProfileSettings duplicado entre teacher y admin (avatar, nombre, password) | `teacher/settings/ProfileSettingsSection.tsx`, `admin/settings/ProfileSettings.tsx` | Crear `shared/components/settings/ProfileSettingsForm.tsx` |
| 3 | DUP-P0-003 | Modal duplicado en 2 ubicaciones dentro de shared | `shared/components/Modal.tsx`, `shared/components/common/Modal.tsx` | Eliminar root Modal.tsx, mantener common/Modal.tsx como canonical |
| 4 | DUP-P0-004 | PrivacySettings duplicado entre teacher y student | `teacher/settings/PrivacySettingsSection.tsx`, `student/pages/settings/PrivacySection.tsx` | Crear `shared/components/settings/PrivacySettingsForm.tsx` |

## Hallazgos Altos (P1)

| # | ID | Hallazgo | Archivos | Accion |
|---|-----|----------|----------|--------|
| 5 | DUP-P1-001 | ConfirmDialog duplicado en 2 ubicaciones + inline implementations | `shared/components/common/ConfirmDialog.tsx`, `shared/components/feedback/ConfirmDialog.tsx`, + ~5 inline | Consolidar en 1, migrar inline implementations |
| 6 | DUP-P1-002 | StatusBadge shared existe pero 6+ componentes reimplementan getStatusBadge inline | `shared/components/base/StatusBadge.tsx` + 7 inline implementations | Extender StatusBadge con mas status types, migrar inline |
| 7 | DUP-P1-003 | 42 modals usan `fixed inset-0 z-50` inline en vez de shared Modal | 20 admin + 12 teacher + 7 student + 1 parent | Migrar gradualmente a shared common/Modal |
| 8 | DUP-P1-004 | AdminTabBar y shared TabBar duplican funcionalidad con diferentes APIs | `shared/components/base/TabBar.tsx`, `admin/components/shared/AdminTabBar.tsx` | Unificar: agregar variante 'cards' a shared TabBar |
| 9 | DUP-P1-005 | Pagination solo existe en teacher, admin reimplementa inline | `teacher/monitoring/StudentPagination.tsx` | Promover a shared con props configurables |

## Hallazgos Medios (P2)

| # | ID | Hallazgo | Archivos | Accion |
|---|-----|----------|----------|--------|
| 10 | DUP-P2-001 | NotificationSettings comparten patron estructural entre teacher y student | `teacher/settings/NotificationsSettingsSection.tsx`, `student/pages/settings/NotificationsSection.tsx` | Crear shared NotificationToggleGroup (patron composable, no fusionar por completo) |
| 11 | DUP-P2-002 | Date range picker pattern repetido en ReportGenerator y ReportGenerationForm | `teacher/reports/ReportGenerator.tsx`, `admin/reports/ReportGenerationForm.tsx` | Extraer shared DateRangePicker si se tocan estos archivos |
| 12 | DUP-P2-003 | Format selector (PDF/CSV/Excel) repetido en ambos report generators | Mismos archivos que DUP-P2-002 | Extraer shared FormatSelector |
| 13 | DUP-P2-004 | Filter components comparten layout pattern pero no estructura | 10 filter components total | Crear FilterPanel composable cuando se refactoricen filtros |
| 14 | DUP-P2-005 | Loading/skeleton patterns inline en vez de usar shared LoadingSpinner/SkeletonCard | Multiples archivos | Documentar en estandar, migrar gradualmente |

---

## Acciones Correctivas Recomendadas

### Fase 1: Quick Wins (1-2 horas, impacto alto)

1. **Crear `shared/components/common/SaveButton.tsx`**
   - Copiar version de student (naming mas limpio)
   - Actualizar imports en teacher settings (4 archivos) y student settings (4 archivos)
   - Eliminar las 2 copias locales
   - Lines saved: ~60 lines, eliminates 2 files

2. **Consolidar Modal root -> re-export**
   - En `shared/components/Modal.tsx`, cambiar a: `export { Modal } from './common/Modal';`
   - Verificar que no hay incompatibilidades de API (el root Modal no tiene `showCloseButton`, `closeOnOverlayClick`, `closeOnEscape` -- estos son aditivos, no breaking)
   - Lines changed: 1 file, 83 -> 1 line

3. **Consolidar ConfirmDialog -> re-export**
   - En `shared/components/feedback/ConfirmDialog.tsx`, re-export from common version
   - O viceversa, dependiendo de cual API se prefiere (common/ tiene loading state, feedback/ tiene detective theme)
   - Reconciliar: agregar `loading` prop a feedback version O agregar detective theme a common version

### Fase 2: Settings Unification (3-5 horas, impacto medio-alto)

4. **Crear `shared/components/settings/ProfileSettingsForm.tsx`**
   - Props: `onSaveProfile(data)`, `onUploadAvatar(file)`, `onChangePassword(current, new)`, `showBio?`, `user`, `avatar`
   - Internal state para form fields
   - Migrate teacher ProfileSettingsSection -> usar shared + wrapper
   - Migrate admin ProfileSettings -> usar shared + wrapper

5. **Crear `shared/components/settings/PrivacySettingsForm.tsx`**
   - Props: `privacyOptions: Array<{key, label, description}>`, `visibilityOptions`, `onSave`
   - Teacher passes teacher-specific options (showContactInfo, allowStudentContact, allowParentContact)
   - Student passes student-specific options (showOnlineStatus, allowFriendRequests)

### Fase 3: Infrastructure (5-8 horas, impacto medio)

6. **Extender shared StatusBadge**
   - Add configurable status map via `statusConfig` prop or extend built-in statuses
   - Migrate 7 inline getStatusBadge implementations

7. **Promover Pagination a shared**
   - Copy StudentPagination to `shared/components/common/Pagination.tsx`
   - Replace "estudiantes" with `itemLabel` prop
   - Update teacher import

8. **Unify TabBar**
   - Add `cards` variant to shared TabBar (from AdminTabBar implementation)
   - Add `description`, `badge`, `badgeTooltip` support
   - Migrate AdminTabBar usages to shared TabBar

### Fase 4: Modal Migration (ongoing, low priority)

9. **Gradual migration of 42 inline modals**
   - Start with simplest cases (confirm dialogs, alert detail modals)
   - Create migration guide in standards docs
   - Target: 50% migration in next sprint, 100% by sprint+2

---

## Resumen de Impacto

| Metrica | Actual | Post-Consolidacion |
|---------|--------|---------------------|
| Duplicated components | 17 identified | 3-5 remaining (legitimately different) |
| Lines of duplicated code | ~1,800 lines | ~300 lines |
| Shared components | 63 | ~69 (+6 new shared) |
| Portal-specific files eliminated | 0 | 4 (2 SaveButtons, root Modal, root ConfirmDialog) |
| Inline modal implementations | 42 | ~10 (after gradual migration) |
| Inline StatusBadge reimplementations | 7 | 0 |
