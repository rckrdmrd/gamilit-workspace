# Stream C: Cross-Portal Homogenization Analysis

**Date:** 2026-02-21
**Scope:** All 4 portals (Admin, Teacher, Student, Parent) + shared components
**Methodology:** File-by-file reading + grep-based import/usage counting

---

## 1. Executive Summary

This analysis identifies **8 major duplication patterns** and **32 consolidation opportunities** across the 4 portals. The most impactful findings are:

- **ConfirmDialog**: 2 independent implementations + 20 raw `window.confirm()`/`confirm()` calls
- **DataTable**: Only 5 consumers out of ~25 table implementations across the codebase
- **StatsGrid**: 8 nearly-identical stat card grid components with no shared abstraction
- **SaveButton**: 3 identical copies (shared, student, teacher) -- 2 are dead code
- **Modal**: 1 canonical implementation but imported via 2 different paths (split ~50/50)
- **TabBar**: Well-consolidated (shared + AdminTabBar wrapper) but 3 student pages use inline tabs
- **PageShell**: 3 portal-specific implementations -- already well-factored, not worth merging
- **Inline loading spinners**: 138 files use `animate-spin` directly; only 11 use `LoadingSpinner`

**Estimated savings:** Consolidating these patterns would reduce ~40 files and ~2,500 lines of duplicated code.

---

## 2. ConfirmDialog Analysis

### 2.1 Versions Found

| # | Location | Type | Props Interface | Key Differences |
|---|----------|------|-----------------|-----------------|
| 1 | `shared/components/feedback/ConfirmDialog.tsx` | Function component | `isOpen, title, message, confirmLabel, cancelLabel, variant, onConfirm, onCancel` | Detective theme (`bg-detective-bg`), 3 variants (danger/warning/info), uses `AlertTriangle` icon for all, wraps shared `Modal` |
| 2 | `shared/components/common/ConfirmDialog.tsx` | FC (React.FC) | `isOpen, onClose, onConfirm, title, message, confirmText, cancelText, variant, loading` | Light theme (gray-900 text), 4 variants (+success), per-variant icons (XCircle/AlertTriangle/Info/CheckCircle), **loading state support**, wraps common `Modal` |

**Key interface differences:**
- `feedback/` uses `onCancel` while `common/` uses `onClose`
- `feedback/` uses `confirmLabel`/`cancelLabel` while `common/` uses `confirmText`/`cancelText`
- `common/` has `loading` prop (spinner + disabled state) -- `feedback/` does not
- `common/` has `success` variant -- `feedback/` does not
- `feedback/` uses detective theme tokens -- `common/` uses standard Tailwind gray/colors

### 2.2 Usage Matrix

| Import Path | Admin | Teacher | Student | Parent | Shared | Features | Total |
|-------------|-------|---------|---------|--------|--------|----------|-------|
| `@shared/components/common/ConfirmDialog` | 2 (AdminUsersPage, InstitutionFormModals) | 1 (TeacherClassesPage) | 0 | 0 | 0 | 0 | **3** |
| `@shared/components/feedback/ConfirmDialog` | 0 | 0 | 0 | 0 | 0 | 0 | **0** |

The `feedback/` version is **exported** via `shared/components/feedback/index.ts` but has **zero imports** across the codebase. It is dead code.

### 2.3 Inline Confirm Patterns

20 files use raw `window.confirm()` or `confirm()` instead of the ConfirmDialog component:

| File | Portal | Pattern |
|------|--------|---------|
| `admin/components/advanced/ABTestingDashboard.tsx` | Admin | `window.confirm()` |
| `admin/components/advanced/EconomicInterventionPanel.tsx` | Admin | `confirm()` x3 |
| `admin/components/advanced/FeatureFlagsPanel.tsx` | Admin | `window.confirm()` |
| `admin/components/advanced/TenantManagementPanel.tsx` | Admin | `confirm()` |
| `admin/components/content/ContentVersionControl.tsx` | Admin | `confirm()` |
| `admin/components/content/MediaLibraryManager.tsx` | Admin | `confirm()` |
| `admin/components/gamification/BulkUpdateDialog.tsx` | Admin | `confirm()` |
| `admin/components/gamification/ParameterEditModal.tsx` | Admin | `confirm()` |
| `admin/components/reports/ReportsList.tsx` | Admin | `confirm()` |
| `admin/pages/AdminAlertsPage.tsx` | Admin | `window.confirm()` |
| `teacher/components/alerts/InterventionAlertsPanel.tsx` | Teacher | `confirm()` |
| `teacher/components/reports/ScheduledReportsTab.tsx` | Teacher | Custom inline Modal confirm |
| `teacher/components/reports/SharedReportsTab.tsx` | Teacher | Custom inline Modal confirm |
| `student/pages/DeviceManagementSection.tsx` | Student | `window.confirm()` |
| `student/pages/FriendsPage.tsx` | Student | `confirm()` |
| `student/pages/GuildsPage.tsx` | Student | `confirm()` |
| `student/pages/LegacyExercisePage.tsx` | Student | `window.confirm()` |
| `features/auth/components/SessionsList.tsx` | Shared | `confirm()` |
| `features/exercises/context/ExerciseContext.tsx` | Shared | `window.confirm()` |

**Summary by portal:**
- Admin: **10** raw confirm calls
- Teacher: **1** raw confirm + **2** custom inline Modal confirms
- Student: **4** raw confirm calls
- Shared/Features: **2** raw confirm calls
- **Total: 19 raw + 2 inline modal = 21 non-standard confirm patterns**

### 2.4 Recommendation

**Priority: HIGH** -- Consolidate to a single ConfirmDialog.

1. **Keep** `shared/components/common/ConfirmDialog.tsx` as canonical (it has more features: loading, success variant, per-variant icons)
2. **Add detective theme variant** to it (or make it auto-detect from context/class)
3. **Delete** `shared/components/feedback/ConfirmDialog.tsx` (zero imports = dead code)
4. **Migrate** 21 inline confirm patterns to use the shared component
5. **Effort:** ~2 days for a junior developer

---

## 3. DataTable Analysis

### 3.1 Shared DataTable

**File:** `shared/components/common/DataTable.tsx` (139 lines)

**Props:** `data, columns, onRowClick, loading, emptyMessage, sortColumn, sortDirection, onSort, className, striped, hoverable, searchPlaceholder, searchable, itemsPerPage`

**Features:** Generic `<T>`, column-level sort, custom cell rendering, alignment, loading state, empty state, row click handler.

**Limitations:** No built-in pagination, no dark theme support, light background only (bg-gray-50/bg-white), no checkbox selection, no row actions column pattern.

### 3.2 Current DataTable Usage (5 consumers)

| File | Portal |
|------|--------|
| `admin/components/content/PendingExercisesTab.tsx` | Admin |
| `admin/components/content/MediaLibraryTab.tsx` | Admin |
| `admin/components/content/ContentVersionsTab.tsx` | Admin |
| `teacher/components/assignments/SubmissionsModal.tsx` | Teacher |
| `teacher/pages/TeacherStudentsPage.tsx` | Teacher |

### 3.3 Custom Table Implementations (NOT using DataTable)

| File | Portal | Has Sorting? | Has Pagination? | Could Use DataTable? |
|------|--------|-------------|----------------|---------------------|
| `admin/components/analytics/OverviewTab.tsx` | Admin | No | No | Yes |
| `admin/components/analytics/RetentionTab.tsx` | Admin | No | No | Yes |
| `admin/components/analytics/GamificationTab.tsx` | Admin | No | No | Yes |
| `admin/components/analytics/EngagementTab.tsx` | Admin | No | No | Yes |
| `admin/components/monitoring/LogsViewer.tsx` | Admin | No | Yes (Pagination) | Yes (needs dark theme) |
| `admin/components/dashboard/RecentActionsTable.tsx` | Admin | No | Yes (Pagination) | Yes (needs dark theme) |
| `admin/components/audit/AuditLogTable.tsx` | Admin | No | Yes (Pagination) | Yes (needs dark theme) |
| `admin/components/users/UsersTable.tsx` | Admin | No | Yes (Pagination) | Yes (needs dark theme) |
| `admin/components/assignments/AssignmentsTable.tsx` | Admin | No | No | Yes |
| `admin/components/assignments/AssignmentDetailModal.tsx` | Admin | No | No | Partial |
| `admin/components/dashboard/OrganizationsTable.tsx` | Admin | No | No | Yes |
| `admin/components/reports/ReportsList.tsx` | Admin | No | No | Yes |
| `admin/components/progress/ClassroomsView.tsx` | Admin | No | No | Yes |
| `admin/components/institutions/InstitutionsTable.tsx` | Admin | No | No | Yes |
| `admin/components/dashboard/UserManagementTable.tsx` | Admin | No | No | Yes |
| `teacher/pages/TeacherAnalyticsPage.tsx` | Teacher | No | No | Yes |
| `teacher/pages/TeacherProgressPage.tsx` | Teacher | No | No | Yes |
| `teacher/components/responses/ResponsesTable.tsx` | Teacher | No | Yes (Pagination) | Yes |
| `teacher/components/progress/StudentProgressList.tsx` | Teacher | No | No | Yes |
| `teacher/components/monitoring/StudentMonitoringPanel.tsx` | Teacher | No | No | Yes |
| `student/pages/NotificationPreferencesPage.tsx` | Student | No | No | Partial (settings table) |
| `features/gamification/social/.../AdvancedLeaderboardTable.tsx` | Shared | Yes | Yes | Partial (specialized) |
| `features/auth/components/UserTable.tsx` | Shared | No | No | Yes |
| `shared/components/LeaderboardTable.tsx` | Shared | No | No | Partial (specialized) |

**Total custom tables: 24** (13 admin + 5 teacher + 1 student + 1 shared feature + 4 others)

### 3.4 Recommendation

**Priority: MEDIUM** -- Enhance DataTable then migrate incrementally.

1. **Enhance DataTable** with:
   - Built-in pagination integration (optional `Pagination` component)
   - Dark theme variant (`variant: 'light' | 'detective'`)
   - Checkbox selection column
   - Row actions slot
2. **Migrate** the 20 simple custom tables (those with no sorting, no special UI)
3. **Leave** specialized tables (leaderboards, settings grids) as-is
4. **Effort:** ~3 days enhancement + ~3 days migration

---

## 4. TabBar Analysis

### 4.1 Shared TabBar Variants

| Component | Location | Delegates to Shared? | Used By |
|-----------|----------|---------------------|---------|
| `TabBar` | `shared/components/base/TabBar.tsx` (306 lines) | N/A (IS the shared) | 5 teacher pages, AdminTabBar |
| `AdminTabBar` | `admin/components/shared/AdminTabBar.tsx` (93 lines) | **Yes** -- thin wrapper, maps `underline`->`detective-underline` | 5 admin pages |

The shared `TabBar` supports 5 variants: `pills`, `underline`, `detective-pills`, `detective-underline`, `cards`. It has full keyboard navigation (ArrowLeft/Right/Home/End), ARIA semantics, icon support, badges, descriptions, and disabled tabs.

`AdminTabBar` is a clean backward-compat wrapper that maps admin variant names to shared TabBar variants. This is a good pattern.

### 4.2 Usage Matrix

| Consumer | Uses TabBar? | Uses AdminTabBar? | Inline? |
|----------|-------------|-------------------|---------|
| TeacherDashboardPage | Yes (shared) | - | No |
| TeacherReportsPage | Yes (shared) | - | No |
| TeacherProgressPage | Yes (shared) | - | No |
| TeacherCommunicationPage | Yes (shared) | - | No |
| TeacherAnalyticsPage | Yes (shared) | - | No |
| AdminSettingsPage | - | Yes | No |
| AdminAnalyticsPage | - | Yes | No |
| AdminMonitoringPage | - | Yes | No |
| AdminGamificationPage | - | Yes | No |
| AdminContentPage | - | Yes | No |
| **student/pages/InventoryPage.tsx** | - | - | **Yes (inline)** |
| **student/pages/EnhancedProfilePage.tsx** | - | - | **Yes (inline)** |
| **shared/components/LeaderboardTabs.tsx** | - | - | **Yes (inline)** |

### 4.3 Inline Tab Implementations (NOT using TabBar)

| File | Portal | Uses `role="tablist"`? | Has Keyboard Nav? | Uses Framer Motion? |
|------|--------|----------------------|-------------------|---------------------|
| `student/pages/InventoryPage.tsx` | Student | Yes | No | Yes (whileHover/whileTap) |
| `student/pages/EnhancedProfilePage.tsx` | Student | Yes | No | Yes (whileHover/whileTap) |
| `shared/components/LeaderboardTabs.tsx` | Shared | Yes | Yes (partial) | No |

### 4.4 Recommendation

**Priority: LOW** -- TabBar is well-consolidated. Only 3 inline instances remain.

1. **Migrate** 2 student inline tabs to use `TabBar` with `pills` variant
2. **Migrate** `LeaderboardTabs` to use `TabBar` with `underline` variant (needs count badge support -- already available)
3. **No structural changes** needed to TabBar itself
4. **Effort:** ~0.5 days

---

## 5. StatsGrid Analysis

### 5.1 Variants Found

| Component | Portal | Props | Grid Cols | Card Style | Animation | Loading? |
|-----------|--------|-------|-----------|------------|-----------|----------|
| `StatsGrid` | Student (dashboard) | `{ stats: { totalTime, completedModules, totalModules, averageScore, currentStreak }, loading, error }` | 1/2/4 | Gradient colored cards | Framer Motion (staggered) | Yes (skeletons) |
| `EnhancedStatsGrid` | Student (dashboard) | `{ stats: { casesResolved, currentStreak, totalTime, totalXP, rankPosition }, loading, error, compact? }` | 1/2 | EnhancedCard + icon | Framer Motion (staggered) | Yes (skeletons) |
| `DashboardStatsGrid` | Admin | `{ metrics: SystemMetrics }` | 1/2/4 | DetectiveCard + icon | None | No |
| `UsersStatsGrid` | Admin | `{ stats: UserStats }` | 1/3/6 | DetectiveCard centered | None | No |
| `InventoryStatsGrid` | Student | `{ totalItems, totalValue, powerUpsCount, activeCount }` | 1/4 | DetectiveCard + round icon | None | No |
| `FriendsStatsGrid` | Student | `{ totalFriends, onlineCount, pendingRequestsCount, recommendationsCount }` | 1/4 | DetectiveCard + round icon | None | No |
| `GuildStatsGrid` | Student | `{ totalGuilds, recruitingCount, activeChallengesCount, guildLevel }` | 1/4 | DetectiveCard + round icon | None | No |
| `LeaderboardStatsGrid` | Student | `{ totalParticipants, userPosition, userEntry }` | 3 | White bg + shadow | Framer Motion (staggered) | No |

### 5.2 Common Pattern Analysis

**3 distinct layouts appear repeatedly:**

1. **"DetectiveCard + round icon"** (used by InventoryStatsGrid, FriendsStatsGrid, GuildStatsGrid): Identical layout, only data differs. These three are **copy-paste clones**.

2. **"DetectiveCard + side icon"** (used by DashboardStatsGrid): Same concept, icon on right instead of left in round container.

3. **"Animated gradient"** (used by StatsGrid, EnhancedStatsGrid, LeaderboardStatsGrid): Framer Motion animations, varied styles.

### 5.3 Recommendation

**Priority: MEDIUM** -- Create a generic `StatsCardGrid` shared component.

```typescript
// Proposed interface
interface StatItem {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtitle?: string;
  iconBg?: string;
  iconColor?: string;
}

interface StatsCardGridProps {
  items: StatItem[];
  columns?: 1 | 2 | 3 | 4 | 6;
  variant?: 'detective' | 'gradient' | 'minimal';
  loading?: boolean;
  animated?: boolean;
  className?: string;
}
```

1. **Create** `shared/components/base/StatsCardGrid.tsx` with the above interface
2. **Immediately consolidate** InventoryStatsGrid, FriendsStatsGrid, GuildStatsGrid (identical layout)
3. **Migrate** DashboardStatsGrid, UsersStatsGrid (similar layout, different grid cols)
4. **Leave** StatsGrid and EnhancedStatsGrid (too specialized with milestone sections)
5. **Effort:** ~1.5 days

---

## 6. PageShell Analysis

### 6.1 Implementations Found

| Component | Portal | Props | Layout Strategy |
|-----------|--------|-------|-----------------|
| `AdminPageShell` | Admin | `{ children }` | `useAdminPageSetup()` + `AdminLayout` wrapper |
| `TeacherPageShell` | Teacher | `{ children }` | `useTeacherPageSetup()` + `TeacherLayout` wrapper |
| `StudentPageShell` | Student | `{ children, showHeader? }` | `useStudentPageSetup()` + `GamifiedHeader` + `DelayedRewardsModal` |

### 6.2 Comparison

| Aspect | Admin | Teacher | Student |
|--------|-------|---------|---------|
| Auth hook | `useAdminPageSetup` | `useTeacherPageSetup` | `useStudentPageSetup` |
| Layout wrapper | `AdminLayout` | `TeacherLayout` | Direct `GamifiedHeader` |
| Organization name | Hardcoded string | From `user.organization` | N/A |
| Extra features | None | None | `showHeader` toggle, `DelayedRewardsModal` event listener |
| Lines of code | 40 | 45 | 80 |

### 6.3 Recommendation

**Priority: VERY LOW** -- These are intentionally different and well-factored.

The PageShell pattern is already a good abstraction. Each portal has genuinely different layout requirements (AdminLayout vs TeacherLayout vs GamifiedHeader). Creating a generic `PortalPageShell` would add unnecessary indirection without reducing code.

**No action needed.** The current pattern is correct.

---

## 7. Modal Analysis

### 7.1 Versions Found

| # | Location | Type |
|---|----------|------|
| 1 | `shared/components/common/Modal.tsx` | **Canonical** -- 188 lines, focus trap, WCAG, animated mode, overlay/content class overrides |
| 2 | `shared/components/Modal.tsx` | **Re-export** -- 1 line: `export { Modal } from './common/Modal'` |

There is only **one actual implementation**. The `shared/components/Modal.tsx` file is a backward-compat re-export. This is correctly designed.

### 7.2 Usage Matrix (by import path)

| Import Path | Admin | Teacher | Student | Parent | Shared | Features | Total |
|-------------|-------|---------|---------|--------|--------|----------|-------|
| `@shared/components/Modal` | 10 | 5 | 4 | 1 | 1 | 5 | **26** |
| `@shared/components/common/Modal` | 9 | 4 | 3 | 0 | 0 | 1 | **17** |
| **Subtotal** | **19** | **9** | **7** | **1** | **1** | **6** | **43** |

### 7.3 Import Path Breakdown

**Via `@shared/components/Modal` (26 files):**
- Admin: FeatureFlagEditor, UserDetailModal, CreateUserModal, BulkActionsPanel, RoleEditor, RestoreDefaultsDialog, PreviewImpactDialog, ParameterEditModal, MayaRankEditModal, BulkUpdateDialog, ExercisePreviewModal
- Teacher: ReviewDetail, ResponseDetailModal, SharedReportsTab, ScheduledReportsTab, SuspendStudentModal, StudentDetailModal, GradeSubmissionModal
- Student: CelebrationModal, AccountSection, CompletionModal, DelayedRewardsModal (via common!)
- Parent: ParentDashboardPage
- Features: RankUpModal, LtiCredentialsDisplay, LtiConsumerForm, ConnectionTestModal, PrestigeSystem, RankUpModal(ranks), PowerUpUsageModal
- Shared: AvatarSelectionModal

**Via `@shared/components/common/Modal` (17 files):**
- Admin: SystemAlertsPanel, InstitutionFormModals, InstitutionDetailModal, RecentActionsTable, ContentPreviewModal, RejectExerciseModal, LogDetailModal, AlertDetailsModal, AcknowledgeAlertModal, ResolveAlertModal, AssignmentDetailModal
- Teacher: TeacherGamificationPage, TeacherContentManagementPage, TeacherCommunicationPage, TeacherClassesPage, TeacherAssignmentsPage, SubmissionsModal, RecentReportsTable, InterventionAlertsPanel
- Student: PurchaseModal, CreateGuildModal, PowerUpModal
- Features: DeactivateUserModal, ActivateUserModal

### 7.4 Recommendation

**Priority: LOW** -- Single implementation, two import paths. Both work.

1. **Standardize** on one import path (`@shared/components/common/Modal` is the canonical location)
2. **Keep** the re-export at `@shared/components/Modal` for backward compat
3. **Optionally** batch-rename the 26 imports to use canonical path in a future cleanup
4. **Effort:** ~0.5 days (mass find-replace)

---

## 8. Other Shared Opportunities

### 8.1 SaveButton (3 copies -- 2 dead)

| File | Portal | Status |
|------|--------|--------|
| `shared/components/feedback/SaveButton.tsx` | Shared | **CANONICAL** -- 10 imports across student/teacher/shared settings |
| `apps/student/pages/settings/SaveButton.tsx` | Student | **DEAD CODE** -- 0 imports, identical to shared version |
| `apps/teacher/components/settings/SaveButton.tsx` | Teacher | **DEAD CODE** -- 0 imports, near-identical (uses `saveStatus` prop name vs `status`) |

**Recommendation:** Delete the 2 dead copies. **Effort:** 5 minutes.

### 8.2 Loading Spinners

| Pattern | Files Using It |
|---------|---------------|
| Shared `LoadingSpinner` component | **11 files** (3 admin, 5 teacher, 2 student, 1 shared) |
| Inline `animate-spin` (custom spinners) | **138 files** across all portals |

The shared `LoadingSpinner` is barely adopted. Most components implement their own loading indicator inline. This is partially justified because loading states vary (full-page overlay vs inline vs skeleton), but the basic spinner pattern repeats frequently.

**Recommendation:** LOW priority. Many inline spinners are contextual (button loading, skeleton cards). Only full-page loading states should migrate. **Effort:** Not worth the churn.

### 8.3 EmptyState

| Pattern | Files Using It |
|---------|---------------|
| Shared `EmptyState` component | **4 files** (all teacher: TeacherStudentsPage, TeacherDashboardPage, TeacherClassesPage, TeacherAlertsPage) |
| Inline "No hay datos" patterns | **~15 files** (mostly admin analytics, gamification tabs) |

The shared `EmptyState` component exists and is well-designed but only the teacher portal uses it.

**Recommendation:** MEDIUM priority. Migrate admin analytics empty states. **Effort:** ~0.5 days.

### 8.4 ErrorBoundary

| Component | Usage |
|-----------|-------|
| `shared/components/ErrorBoundary.tsx` | **Exported** but **0 actual imports** in production code (only in test) |
| `features/gamification/components/GamificationErrorBoundary.tsx` | Exists but **0 imports** in production code |

Both error boundaries exist but neither is used in production. The app relies on React Query error states per-component.

**Recommendation:** LOW priority. Consider wrapping each portal's root in `ErrorBoundary`. **Effort:** ~1 hour.

### 8.5 Pagination

| Component | Consumers |
|-----------|-----------|
| Shared `Pagination` (296 lines, 2 variants) | **8 direct imports** (5 admin, 2 teacher, 1 shared feature) |
| `StudentPagination` (thin wrapper) | **1 import** (StudentMonitoringPanel -- despite name, this is teacher portal) |

Pagination is well-consolidated. Only 1 wrapper exists (`StudentPagination`) and it properly delegates to the shared component.

**Recommendation:** No action needed. Already well-done.

### 8.6 GamificationErrorBoundary

Exists at `features/gamification/components/GamificationErrorBoundary.tsx` (100 lines) but has **zero production imports**. It is English-only (not Spanish like the rest of the UI).

**Recommendation:** Either integrate or delete. **Effort:** 5 minutes to delete, ~30 min to integrate.

---

## 9. Consolidation Priority Matrix

| # | Pattern | Current Variants | Usage Count | Effort (days) | Impact | Priority |
|---|---------|-----------------|-------------|---------------|--------|----------|
| 1 | **ConfirmDialog** | 2 components + 21 inline | 24 total | 2.0 | HIGH -- UX consistency + a11y | **P0** |
| 2 | **DataTable** | 1 shared + ~20 custom | 25 tables | 6.0 | MEDIUM -- reduces admin boilerplate | **P1** |
| 3 | **StatsCardGrid** | 8 variants | 8 components | 1.5 | MEDIUM -- eliminates 3 copy-paste clones | **P1** |
| 4 | **SaveButton** (dead code) | 3 copies (2 dead) | 0 dead imports | 0.01 | LOW -- code hygiene | **P0** |
| 5 | **Inline tabs** | 3 inline + 1 shared | 14 total | 0.5 | LOW -- student pages only | **P2** |
| 6 | **Modal imports** | 2 paths, 1 impl | 43 imports | 0.5 | LOW -- cosmetic | **P3** |
| 7 | **EmptyState** | 1 shared + ~15 inline | ~19 total | 0.5 | LOW -- admin analytics | **P2** |
| 8 | **ErrorBoundary** | 2 unused | 0 imports | 0.1 | LOW -- resilience | **P2** |

**Recommended execution order:**
1. Delete dead code: SaveButton copies, unused ConfirmDialog (feedback/) -- **5 minutes**
2. Migrate `window.confirm()` / `confirm()` to shared ConfirmDialog -- **2 days**
3. Create shared StatsCardGrid, consolidate 5 simpler StatsGrid variants -- **1.5 days**
4. Enhance DataTable with dark theme + pagination, migrate admin tables -- **6 days**
5. Migrate 3 inline student tabs to TabBar -- **0.5 days**

---

## 10. Metrics Summary

| Metric | Count |
|--------|-------|
| Duplicate component patterns identified | **8** |
| Dead code files (can delete immediately) | **4** (2 SaveButton + 1 ConfirmDialog + 1 GamificationErrorBoundary) |
| Custom tables (could use DataTable) | **~20** (13 admin + 5 teacher + 2 shared) |
| Inline tabs (could use TabBar) | **3** (2 student pages + 1 LeaderboardTabs) |
| Raw `confirm()` calls (should use ConfirmDialog) | **19** |
| Custom inline confirm modals | **2** (ScheduledReportsTab, SharedReportsTab) |
| StatsGrid variants (could share abstraction) | **8** (3 copy-paste clones + 5 similar) |
| Files using inline `animate-spin` vs shared LoadingSpinner | **138 vs 11** |
| EmptyState: inline vs shared | **~15 vs 4** |
| Modal import path split | **26 vs 17** (both resolve to same impl) |
| Consolidation candidates (total) | **32** |
| Estimated total effort for all consolidations | **~10.5 days** |
| Estimated lines of code reducible | **~2,500** |

---

## Appendix A: File Paths Reference

### ConfirmDialog
- `apps/frontend/src/shared/components/common/ConfirmDialog.tsx` (canonical)
- `apps/frontend/src/shared/components/feedback/ConfirmDialog.tsx` (dead code)

### DataTable
- `apps/frontend/src/shared/components/common/DataTable.tsx`

### TabBar
- `apps/frontend/src/shared/components/base/TabBar.tsx` (canonical, 306 lines)
- `apps/frontend/src/apps/admin/components/shared/AdminTabBar.tsx` (wrapper, 93 lines)

### StatsGrid variants
- `apps/frontend/src/apps/student/components/dashboard/StatsGrid.tsx`
- `apps/frontend/src/apps/student/components/dashboard/EnhancedStatsGrid.tsx`
- `apps/frontend/src/apps/admin/components/dashboard/DashboardStatsGrid.tsx`
- `apps/frontend/src/apps/admin/components/users/UsersStatsGrid.tsx`
- `apps/frontend/src/apps/student/components/inventory/InventoryStatsGrid.tsx`
- `apps/frontend/src/apps/student/components/friends/FriendsStatsGrid.tsx`
- `apps/frontend/src/apps/student/components/guilds/GuildStatsGrid.tsx`
- `apps/frontend/src/apps/student/components/leaderboard/LeaderboardStatsGrid.tsx`

### PageShell
- `apps/frontend/src/apps/admin/components/shared/AdminPageShell.tsx`
- `apps/frontend/src/apps/teacher/components/shared/TeacherPageShell.tsx`
- `apps/frontend/src/apps/student/components/shared/StudentPageShell.tsx`

### Modal
- `apps/frontend/src/shared/components/common/Modal.tsx` (canonical)
- `apps/frontend/src/shared/components/Modal.tsx` (re-export)

### SaveButton (dead copies)
- `apps/frontend/src/shared/components/feedback/SaveButton.tsx` (canonical)
- `apps/frontend/src/apps/student/pages/settings/SaveButton.tsx` (DEAD)
- `apps/frontend/src/apps/teacher/components/settings/SaveButton.tsx` (DEAD)

### Pagination
- `apps/frontend/src/shared/components/Pagination.tsx` (canonical, 296 lines)
- `apps/frontend/src/apps/teacher/components/monitoring/StudentPagination.tsx` (thin wrapper)

### EmptyState
- `apps/frontend/src/shared/components/feedback/EmptyState.tsx`

### ErrorBoundary
- `apps/frontend/src/shared/components/ErrorBoundary.tsx` (unused)
- `apps/frontend/src/features/gamification/components/GamificationErrorBoundary.tsx` (unused)
