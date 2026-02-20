# 01 - Audit: Component Patterns Across Portals

**Version:** 1.0.0
**Fecha:** 2026-02-19
**Scope:** `apps/frontend/src/apps/{student,teacher,admin,parent}`, `shared/`, `features/`
**Metodo:** Grep + Glob exhaustive analysis on all .tsx files

---

## Summary

| Area | Total .tsx | Prod Components* | Dominant Export Pattern | Dominant Props Pattern | React Import Pattern |
|------|-----------|-------------------|----------------------|----------------------|---------------------|
| Student | 106 | 99 | `export function` (51) | `interface XxxProps` (69) | Mixed: `import React` (28) + `import { }` (18) + `import React, {` (16) |
| Teacher | 74 | 74 | `export function` (32) + `export const: FC` (22) | `interface XxxProps` (51) | Mixed: `import { }` (40) + `import React` (13) + `import React, {` (11) |
| Admin | 144 | 142 | `export const: FC` (66) + `export function` (59) | `interface XxxProps` (91) | Mixed: `import React, {` (43) + `import { }` (36) + `import React` (23) |
| Parent | 4 | 4 | `export const: FC` (4) | None (0) | `import React, {` (4) |
| Shared | 81 | 62 | `export const: FC` (52) | `interface XxxProps` (29) | `import React` (41) + `import React, {` (25) |
| Features | 193 | 173 | `export const: FC` (138) | `interface XxxProps` (78) | `import React, {` (72) + `import React` (60) |

*\* Excluding test files (.test.tsx), stories files (.stories.tsx)*

---

## 1. Export Patterns

### 1.1 Student Portal (106 .tsx files)

| Pattern | Count | % | Description |
|---------|-------|---|-------------|
| `export function ComponentName()` | **51** | 48.1% | Named function export |
| `export const Xxx: React.FC` | **30** | 28.3% | Const with FC type annotation |
| `export default function ComponentName()` | **20** | 18.9% | Default function export (pages) |
| `export default ComponentName` (separate) | **9** | 8.5% | Separate default export after FC const |
| `export const Xxx = () =>` (arrow without FC) | **1** | 0.9% | Stories file only |
| No component export | **7** | 6.6% | Test files |

**Observations:**
- **Pages** consistently use `export default function` (20/20 pages)
- **Components** use `export function` (51 files) for newer code, `export const: FC` (30) for older code
- 9 files have DUAL exports: `export const` + `export default` at bottom (mostly dashboard components)

### 1.2 Teacher Portal (74 .tsx files)

| Pattern | Count | % | Description |
|---------|-------|---|-------------|
| `export function ComponentName()` | **32** | 43.2% | Named function export |
| `export const Xxx: React.FC` | **22** | 29.7% | Const with FC type annotation |
| `export default function ComponentName()` | **19** | 25.7% | Default function export (all pages) |
| `export default ComponentName` (separate) | **3** | 4.1% | TeacherLayout + ReviewList/Detail |
| `export const Xxx = () =>` (arrow without FC) | **0** | 0% | None |
| `export function withTeacherLayout()` | **1** | 1.4% | HOC pattern (unique to teacher) |

**Observations:**
- 100% of pages (19/19) use `export default function`
- Components split between `export function` and `export const: FC`
- HOC wrapper `withTeacherLayout` is unique to this portal

### 1.3 Admin Portal (144 .tsx files)

| Pattern | Count | % | Description |
|---------|-------|---|-------------|
| `export const Xxx: React.FC` | **66** | 45.8% | Dominant pattern |
| `export function ComponentName()` | **59** | 41.0% | Named function export |
| `export default function ComponentName()` | **19** | 13.2% | Default function export (all pages) |
| `export default ComponentName` (separate) | **39** | 27.1% | Many exercise-builder configs + others |
| `export const Xxx = () =>` (arrow without FC) | **0** | 0% | None |

**Observations:**
- Highest rate of `export const: FC` (66 files) -- strongest FC adoption
- 39 files have DUAL exports (`export function` + `export default` at bottom) -- all exercise-builder type-configs follow this pattern
- All 19 pages use `export default function`

### 1.4 Parent Portal (4 .tsx files)

| Pattern | Count | % | Description |
|---------|-------|---|-------------|
| `export const Xxx: React.FC` | **4** | 100% | All use FC pattern |
| `export default ComponentName` (separate) | **4** | 100% | All also have default export |
| `export function` | **0** | 0% | None |
| `export default function` | **0** | 0% | None |

**Observations:**
- Most consistent portal: all 4 files use `export const: React.FC` + `export default`
- BUT this is the opposite pattern from the other portals' pages (which use `export default function`)

### 1.5 Shared (81 .tsx files, ~62 production)

| Pattern | Count | % | Description |
|---------|-------|---|-------------|
| `export const Xxx: React.FC` | **52** | 64.2% | Dominant pattern |
| `export function ComponentName()` | **3** | 3.7% | TabBar, DataTable, useAudioRecorder.example |
| `export default ComponentName` (separate) | **33** | 40.7% | Many have dual FC + default |
| `export default function` | **0** | 0% | None |

**Observations:**
- Strongly favors `export const: React.FC` (52/62 production files)
- 33 files with additional `export default` at end of file

### 1.6 Features (193 .tsx files, ~173 production)

| Pattern | Count | % | Description |
|---------|-------|---|-------------|
| `export const Xxx: React.FC` | **138** | 71.5% | Dominant pattern |
| `export function ComponentName()` | **13** | 6.7% | Missions components, LTI, ExerciseContext |
| `export default function` | **2** | 1.0% | BrandingSettingsPage, AdminLtiPage |
| `export default ComponentName` (separate) | **50** | 25.9% | Most exercises + auth forms |
| `export const Xxx = () =>` (arrow without FC) | **2** | 1.0% | DashboardExample, LoginExample |

**Observations:**
- Strongest FC adoption across all areas
- Exercise mechanics consistently use `export const: FC` + `export default`

---

## 2. Props Typing Patterns

### 2.1 Summary Table

| Area | `interface Props {}` | `interface XxxProps {}` | `type Props = {}` | No props type | Props imported |
|------|---------------------|------------------------|-------------------|---------------|---------------|
| Student | 0 | **69** | 0 | ~37 (pages + no-props) | 0 |
| Teacher | 0 | **51** | 0 | ~23 (pages) | 0 |
| Admin | 0 | **91** | 0 | ~53 (pages + some components) | 0 |
| Parent | 0 | **0** | 0 | 4 (all pages, no-props FC) | 0 |
| Shared | 0 | **29** | 0 | ~33 | 0 |
| Features | 1 | **78** | 0 | ~94 | 0 |

**Global finding:** `interface XxxProps {}` (named interface) is the UNIVERSAL pattern across the codebase. Zero usage of:
- `interface Props {}` (generic) -- only 1 occurrence in GamificationErrorBoundary.tsx
- `type Props = {}` (type alias) -- none
- Props imported from external files -- none

### 2.2 Detail by Portal

**Student (69 named interfaces):**
- All components with props use `interface XxxProps {}` where Xxx = component name
- Pages that take no props (20 pages) have no interface
- Examples: `ModuleGridCardProps`, `ExerciseHeaderProps`, `CelebrationModalProps`

**Teacher (51 named interfaces):**
- Same pattern. TeacherLayout has `TeacherLayoutProps`
- Pages: 1 has props (TeacherReviewPanel), rest are propless
- Examples: `AssignmentCardProps`, `StudentDetailModalProps`, `ProgressChartProps`

**Admin (91 named interfaces):**
- Highest count, consistent naming
- All 16 exercise-builder type-configs have `XxxConfigProps`
- Examples: `UserDetailModalProps`, `AlertCardProps`, `MayaRankEditModalProps`

**Parent (0 interfaces):**
- All 4 pages are propless `React.FC` components -- no interfaces needed

**Shared (29 named interfaces):**
- Core UI primitives all have named Props: `ButtonProps`, `CardProps`, `InputProps`, `ModalProps`
- Some shared components inline destructure without formal interface

**Features (78 named interfaces):**
- Exercise mechanics: `XxxExerciseProps` pattern (e.g., `SopaLetrasExerciseProps`)
- Gamification: `PowerUpCardProps`, `LeaderboardEntryProps`
- Auth: `LoginFormProps`, `RegisterFormProps`

---

## 3. React Import Patterns

### 3.1 Summary Table

| Area | `import React from 'react'` (default only) | `import React, { ... } from 'react'` (combined) | `import { ... } from 'react'` (named only) | No React import | Total with React |
|------|---------------------------------------------|--------------------------------------------------|---------------------------------------------|-----------------|-----------------|
| Student | **12** (11.3%) | **16** (15.1%) | **18** (17.0%) | **60** (56.6%) | 46 |
| Teacher | **2** (2.7%) | **11** (14.9%) | **40** (54.1%) | **21** (28.4%) | 53 |
| Admin | **0** (0%) | **43** (29.9%) | **36** (25.0%) | **65** (45.1%) | 79 |
| Parent | **0** (0%) | **4** (100%) | **0** (0%) | **0** (0%) | 4 |
| Shared | **16** (19.8%) | **25** (30.9%) | **2** (2.5%) | **38** (46.9%) | 43 |
| Features | **0** (0%) | **72** (37.3%) | **14** (7.3%) | **107** (55.4%) | 86 |

**Note:** `import React from 'react'` and `import React, { ... } from 'react'` are UNNECESSARY since React 17's JSX transform. Only `import { useState, useEffect, ... } from 'react'` or no import is needed.

### 3.2 Breakdown

**Files with unnecessary `import React` (default import):**

| Area | Count | % of files | Recommendation |
|------|-------|-----------|----------------|
| Student | 28 (12 default + 16 combined) | 26.4% | Remove `React` default import |
| Teacher | 13 (2 default + 11 combined) | 17.6% | Remove `React` default import |
| Admin | 43 (0 default + 43 combined) | 29.9% | Remove `React` default import, keep named imports |
| Parent | 4 (0 default + 4 combined) | 100% | Remove `React` default import |
| Shared | 41 (16 default + 25 combined) | 50.6% | Remove `React` default import |
| Features | 72 (0 default + 72 combined) | 37.3% | Remove `React` default import |

**TOTAL with unnecessary `import React`: 201 files (33.4% of all 602 .tsx files)**

**Exception:** Files using `React.FC`, `React.ReactNode`, `React.ComponentType`, etc. DO need `import React` unless they switch to named imports (`FC`, `ReactNode`, etc.).

### 3.3 Student Portal Detail
- Older "dashboard" components (2026-01 batch): `import React from 'react'` (12 files)
- Settings components: `import React, { useState } from 'react'` (4 files)
- Newer components (Phase 2-4 refactor): `import { useState } from 'react'` or no import (60+ files)
- Pages: Mixed -- newer pages have `import { useState, useEffect } from 'react'`

### 3.4 Teacher Portal Detail
- Pages: predominantly `import { useState, useEffect } from 'react'` (40 files)
- Older dashboard components: `import React, { ... }` (11 files)
- `withTeacherLayout.tsx`: `import React from 'react'` (needs it for `React.ComponentType`)

### 3.5 Admin Portal Detail
- Pages: `import { useState } from 'react'` (36 files)
- Components: `import React, { useState, useEffect } from 'react'` (43 files) -- because they use `React.FC`
- No files have bare `import React from 'react'`

---

## 4. Component Size Distribution

### 4.1 Student Portal (99 production .tsx files, excluding 7 test/story files)

| Size Bracket | Count | % |
|--------------|-------|---|
| < 50 LOC | **9** | 9.1% |
| 50-150 LOC | **31** | 31.3% |
| 150-300 LOC | **35** | 35.4% |
| > 300 LOC | **24** | 24.2% |

**Components > 300 LOC:**

| LOC | File Path |
|-----|-----------|
| 1058 | `apps/student/pages/LegacyExercisePage.tsx` |
| 591 | `apps/student/components/exercise/CompletionModal.tsx` |
| 545 | `apps/student/pages/DeviceManagementSection.tsx` |
| 533 | `apps/student/pages/NotificationsPage.tsx` |
| 463 | `apps/student/components/dashboard/ModulesSection.tsx` |
| 453 | `apps/student/components/dashboard/MissionsPanel.tsx` |
| 447 | `apps/student/components/gamification/RanksSection.tsx` |
| 424 | `apps/student/pages/NotificationPreferencesPage.tsx` |
| 418 | `apps/student/components/exercise/ExerciseSidebar.tsx` |
| 401 | `apps/student/hooks/useExerciseAutoSave.example.tsx` |
| 383 | `apps/student/components/achievements/AchievementDetailModal.tsx` |
| 376 | `apps/student/components/gamification/LeaderboardPreview.tsx` |
| 372 | `apps/student/components/gamification/GamificationHero.tsx` |
| 368 | `apps/student/components/dashboard/EnhancedStatsGrid.tsx` |
| 365 | `apps/student/components/dashboard/RecentActivityPanel.tsx` |
| 357 | `apps/student/pages/AssignmentsPage.tsx` |
| 356 | `apps/student/pages/settings/AccountSection.tsx` |
| 347 | `apps/student/pages/AssignmentDetailPage.tsx` |
| 347 | `apps/student/components/achievements/AchievementFilters.tsx` |
| 345 | `apps/student/components/gamification/StreaksMissionsSection.tsx` |
| 347 | `apps/student/components/gamification/MLCoinsSection.tsx` |
| 334 | `apps/student/components/dashboard/ModuleGridCardEnhanced.tsx` |
| 312 | `apps/student/components/progress/ModuleProgressCard.tsx` |
| 306 | `apps/student/components/dashboard/RankProgressWidget.tsx` |

### 4.2 Teacher Portal (74 production .tsx files)

| Size Bracket | Count | % |
|--------------|-------|---|
| < 50 LOC | **0** | 0% |
| 50-150 LOC | **14** | 18.9% |
| 150-300 LOC | **25** | 33.8% |
| > 300 LOC | **35** | 47.3% |

**Components > 300 LOC:**

| LOC | File Path |
|-----|-----------|
| 1002 | `apps/teacher/components/responses/ResponseDetailModal.tsx` |
| 917 | `apps/teacher/pages/TeacherGamification.tsx` |
| 737 | `apps/teacher/pages/TeacherProgress.tsx` |
| 726 | `apps/teacher/pages/TeacherContentManagement.tsx` |
| 723 | `apps/teacher/components/monitoring/StudentMonitoringPanel.tsx` |
| 718 | `apps/teacher/pages/TeacherAnalytics.tsx` |
| 579 | `apps/teacher/components/assignments/ImprovedAssignmentWizard.tsx` |
| 565 | `apps/teacher/pages/TeacherReports.tsx` |
| 541 | `apps/teacher/pages/TeacherDashboard.tsx` |
| 531 | `apps/teacher/components/review-panel/ReviewDetail.tsx` |
| 512 | `apps/teacher/pages/TeacherStudents.tsx` |
| 491 | `apps/teacher/pages/TeacherSettings.tsx` |
| 434 | `apps/teacher/components/monitoring/StudentDetailModal.tsx` |
| 428 | `apps/teacher/pages/TeacherCommunication.tsx` |
| 425 | `apps/teacher/components/responses/ResponsesTable.tsx` |
| 423 | `apps/teacher/pages/TeacherNotifications.tsx` |
| 421 | `apps/teacher/pages/TeacherAlertConfig.tsx` |
| 393 | `apps/teacher/components/alerts/InterventionAlertsPanel.tsx` |
| 392 | `apps/teacher/pages/TeacherNotificationPreferences.tsx` |
| 386 | `apps/teacher/pages/TeacherClasses.tsx` |
| 383 | `apps/teacher/pages/TeacherAssignments.tsx` |
| 372 | `apps/teacher/components/progress/StudentProgressList.tsx` |
| 372 | `apps/teacher/components/dashboard/CreateAssignmentModal.tsx` |
| 365 | `apps/teacher/components/dashboard/RecentActivityPanel.tsx` |
| 363 | `apps/teacher/components/dashboard/StudentAlerts.tsx` |
| 351 | `apps/teacher/components/dashboard/GradeSubmissionModal.tsx` |
| 347 | `apps/teacher/components/dashboard/CreateClassroomModal.tsx` |
| 345 | `apps/teacher/components/assignments/AssignmentWizard.tsx` |
| 338 | `apps/teacher/components/responses/ResponseFilters.tsx` |
| 336 | `apps/teacher/components/dashboard/PendingSubmissionsList.tsx` |
| 331 | `apps/teacher/components/dashboard/RecentAssignmentsList.tsx` |
| 322 | `apps/teacher/components/settings/ProfileSettingsSection.tsx` |
| 316 | `apps/teacher/pages/TeacherReviewPanel.tsx` |
| 314 | `apps/teacher/pages/TeacherAlerts.tsx` |
| 312 | `apps/teacher/components/assignments/SubmissionsModal.tsx` |

### 4.3 Admin Portal (142 production .tsx files, excluding 2 test files)

| Size Bracket | Count | % |
|--------------|-------|---|
| < 50 LOC | **3** | 2.1% |
| 50-150 LOC | **41** | 28.9% |
| 150-300 LOC | **61** | 43.0% |
| > 300 LOC | **37** | 26.1% |

**Components > 300 LOC:**

| LOC | File Path |
|-----|-----------|
| 712 | `apps/admin/components/users/UserDetailModal.tsx` |
| 556 | `apps/admin/components/settings/SecuritySettings.tsx` |
| 523 | `apps/admin/components/advanced/EconomicInterventionPanel.tsx` |
| 479 | `apps/admin/components/users/BulkActionsPanel.tsx` |
| 478 | `apps/admin/components/dashboard/RecentActionsTable.tsx` |
| 466 | `apps/admin/components/advanced/FeatureFlagControls.tsx` |
| 465 | `apps/admin/components/advanced/ABTestingDashboard.tsx` |
| 421 | `apps/admin/components/users/UserDetailModal.example.tsx` |
| 419 | `apps/admin/components/advanced/TenantManagementPanel.tsx` |
| 416 | `apps/admin/components/classroom-teacher/TeacherClassroomsTab.tsx` |
| 411 | `apps/admin/components/gamification/BulkUpdateDialog.tsx` |
| 402 | `apps/admin/components/classroom-teacher/ClassroomTeachersTab.tsx` |
| 391 | `apps/admin/components/gamification/MayaRankEditModal.tsx` |
| 386 | `apps/admin/components/gamification/AchievementsTab.tsx` |
| 377 | `apps/admin/components/dashboard/SystemMetricsGrid.tsx` |
| 372 | `apps/admin/components/monitoring/MetricsTab.tsx` |
| 370 | `apps/admin/components/users/CreateUserModal.tsx` |
| 366 | `apps/admin/components/content/ExerciseContentEditor.tsx` |
| 365 | `apps/admin/components/reports/ReportGenerationForm.tsx` |
| 352 | `apps/admin/components/advanced/FeatureFlagsPanel.tsx` |
| 350 | `apps/admin/components/monitoring/LogsViewer.tsx` |
| 345 | `apps/admin/components/dashboard/SystemAlertsPanel.tsx` |
| 343 | `apps/admin/components/monitoring/ErrorTrackingTab.tsx` |
| 339 | `apps/admin/components/dashboard/AdminDashboardHero.tsx` |
| 338 | `apps/admin/components/reports/ReportsList.tsx` |
| 329 | `apps/admin/components/gamification/ParameterEditModal.tsx` |
| 324 | `apps/admin/components/dashboard/UserActivityChart.tsx` |
| 324 | `apps/admin/components/gamification/PreviewImpactDialog.tsx` |
| 310 | `apps/admin/components/analytics/OverviewTab.tsx` |
| 308 | `apps/admin/components/analytics/RetentionTab.tsx` |
| 306 | `apps/admin/components/content/ContentApprovalQueue.tsx` |
| 303 | `apps/admin/pages/AdminExerciseCreatePage.tsx` |
| 302 | `apps/admin/components/institutions/InstitutionDetailModal.tsx` |
| 300 | `apps/admin/pages/AdminNotificationPreferencesPage.tsx` |

*Note: 3 additional files at 290-298 LOC just under threshold.*

### 4.4 Parent Portal (4 production .tsx files)

| Size Bracket | Count | % |
|--------------|-------|---|
| < 50 LOC | **0** | 0% |
| 50-150 LOC | **0** | 0% |
| 150-300 LOC | **1** | 25% |
| > 300 LOC | **3** | 75% |

**Components > 300 LOC:**

| LOC | File Path |
|-----|-----------|
| 502 | `apps/parent/pages/ParentDashboardPage.tsx` |
| 390 | `apps/parent/pages/ParentRegisterPage.tsx` |
| 371 | `apps/parent/pages/ChildProgressPage.tsx` |

*221 LOC: `apps/parent/pages/ParentLoginPage.tsx` (under 300)*

### 4.5 Shared (62 production .tsx files, excluding 19 test files)

| Size Bracket | Count | % |
|--------------|-------|---|
| < 50 LOC | **7** | 11.3% |
| 50-150 LOC | **21** | 33.9% |
| 150-300 LOC | **20** | 32.3% |
| > 300 LOC | **14** | 22.6% |

**Components > 300 LOC:**

| LOC | File Path |
|-----|-----------|
| 1761 | `shared/components/mechanics/ExerciseContentRenderer.tsx` |
| 706 | `shared/components/layout/GamilitSidebar.tsx` |
| 438 | `shared/components/media/VideoPlayer.tsx` |
| 409 | `shared/components/mechanics/MediaUploader.tsx` |
| 383 | `shared/components/AvatarUpload.tsx` |
| 369 | `shared/components/UnderConstruction.tsx` |
| 358 | `shared/components/LeaderboardTable.tsx` |
| 354 | `shared/components/mechanics/RubricEvaluator.tsx` |
| 352 | `shared/components/mechanics/FeedbackModal.tsx` |
| 351 | `shared/components/layout/GamifiedHeader.tsx` |
| 345 | `shared/hooks/useAudioRecorder.example.tsx` |
| 344 | `shared/components/AchievementModal.tsx` |
| 337 | `shared/components/media/NavigationPathViewer.tsx` |
| 327 | `shared/components/media/AudioPlayer.tsx` |

### 4.6 Features (173 production .tsx files, excluding 20 test files)

| Size Bracket | Count | % |
|--------------|-------|---|
| < 50 LOC | **21** | 12.1% |
| 50-150 LOC | **44** | 25.4% |
| 150-300 LOC | **55** | 31.8% |
| > 300 LOC | **53** | 30.6% |

**Components > 500 LOC (top tier only):**

| LOC | File Path |
|-----|-----------|
| 932 | `features/gamification/leaderboard/LiveLeaderboard.tsx` |
| 821 | `features/mechanics/module2/RuedaInferencias/RuedaInferenciasExercise.tsx` |
| 770 | `features/gamification/battles/components/BattleArena.tsx` |
| 766 | `features/mechanics/module3/PodcastArgumentativo/PodcastArgumentativoExercise.tsx` |
| 757 | `features/mechanics/module4/QuizTikTok/QuizTikTokExercise.tsx` |
| 721 | `features/gamification/battles/components/BattleMatchmaking.tsx` |
| 672 | `features/mechanics/module4/InfografiaInteractiva/InfografiaInteractivaExercise.tsx` |
| 671 | `features/mechanics/module5/VideoCarta/VideoCartaExercise.tsx` |
| 601 | `features/mechanics/module3/AnalisisFuentes/AnalisisFuentesExercise.tsx` |
| 566 | `features/mechanics/module3/MatrizPerspectivas/MatrizPerspectivasExercise.tsx` |
| 563 | `features/mechanics/module3/TribunalOpiniones/TribunalOpinionesExercise.tsx` |
| 560 | `features/mechanics/module5/DiarioMultimedia/DiarioMultimediaExercise.tsx` |
| 529 | `features/mechanics/module4/AnalisisMemes/AnalisisMemesExercise.tsx` |
| 497 | `features/mechanics/module3/DebateDigital/DebateDigitalExercise.tsx` |

*53 total files > 300 LOC, including all exercise mechanics and many gamification components.*

---

## 5. Cross-Portal Inconsistency Analysis

### 5.1 Export Pattern Conflicts

| Issue | Portals Affected | Severity |
|-------|-----------------|----------|
| Pages: `export default function` vs `export const: FC + export default` | Student/Teacher/Admin use `export default function`; Parent uses `export const: FC + export default` | MEDIUM |
| Components: `export function` vs `export const: FC` | Student/Teacher favor `export function` (newer code); Admin/Shared/Features favor `export const: FC` | HIGH |
| Dual exports: `export const: FC` + `export default` at bottom | Admin (39), Shared (33), Features (50), Student (9), Teacher (3) | LOW |

### 5.2 React Import Inconsistencies

| Issue | Files Affected | Severity |
|-------|---------------|----------|
| Unnecessary `import React from 'react'` (with new JSX transform) | **201 files** (33.4%) | MEDIUM |
| Mixed `import React` vs `import React, { }` vs `import { }` within same portal | All portals | HIGH |
| `import React from 'react'` (NO named imports, purely for React.FC type) | 30 files across shared/student | MEDIUM |

### 5.3 Props Typing Inconsistencies

| Issue | Count | Severity |
|-------|-------|----------|
| Components with props but no interface (inline destructuring) | ~150+ files | LOW |
| Parent portal has 0 props interfaces (all propless pages) | 4 files | N/A |
| Generic `interface Props` instead of named | 1 file | NEGLIGIBLE |

### 5.4 Component Size Issues

| Issue | Files | Severity |
|-------|-------|----------|
| Components > 500 LOC (should be decomposed) | **33** total | HIGH |
| Components > 700 LOC (critical complexity) | **14** total | CRITICAL |
| Teacher pages are significantly larger than Student/Admin pages | Teacher avg ~445 LOC vs Student avg ~250 LOC | MEDIUM |

---

## 6. Recommended Standard

Based on the dominant patterns and modern React best practices:

### 6.1 Export Pattern Standard

```tsx
// PAGES: export default function (already dominant in 3/4 portals)
export default function AdminUsersPage() {
  return <div>...</div>;
}

// COMPONENTS: export function (modern, tree-shakeable, no React import needed)
export function UserDetailModal({ user, onClose }: UserDetailModalProps) {
  return <div>...</div>;
}

// AVOID: export const: React.FC (deprecated pattern, implicit children, needs React import)
// AVOID: separate export default at end of file
```

### 6.2 Props Pattern Standard

```tsx
// ALWAYS use named interface: ComponentNameProps
interface UserDetailModalProps {
  user: User;
  onClose: () => void;
}

// NO: interface Props {}, type Props = {}, inline destructuring without type
```

### 6.3 React Import Standard

```tsx
// ONLY import what you need from react (no default import)
import { useState, useEffect, useCallback } from 'react';

// For types, use named imports:
import type { ReactNode, FC } from 'react';

// AVOID: import React from 'react'
// AVOID: import React, { useState } from 'react'
```

### 6.4 Component Size Standard

- **Target:** < 300 LOC per component
- **Warning:** 300-500 LOC -- consider decomposition
- **Critical:** > 500 LOC -- MUST decompose

---

## 7. Migration Effort Estimate

| Area | Files to Migrate | Primary Changes |
|------|-----------------|-----------------|
| Student | ~30 FC -> function, ~28 React imports | Export + import cleanup |
| Teacher | ~22 FC -> function, ~13 React imports | Export + import cleanup |
| Admin | ~66 FC -> function, ~43 React imports | Largest effort |
| Parent | 4 FC -> function, 4 React imports | Small, quick fix |
| Shared | ~52 FC -> function, ~41 React imports | Core components |
| Features | ~138 FC -> function, ~72 React imports | Largest absolute count |
| **TOTAL** | **~312 export changes, ~201 import cleanups** | |

**Estimated effort:** 2-3 sprints with incremental migration (portal by portal)

---

*Generated by component pattern audit tool | TASK-2026-02-19-ESTANDARIZACION-PORTALES*
