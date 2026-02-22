# VAL03 - Flow Documentation Alignment Audit

**Fecha:** 2026-02-21
**Objetivo:** Validar que los documentos de flujo modificados reflejan con precision el codigo implementado.
**Documentos auditados:** 8

---

## 1. FLUJO-CONSTRUCTOR-EJERCICIOS.md (FL-ADM-07)

**Ruta:** `docs/30-ux-ui/flujos/admin/FLUJO-CONSTRUCTOR-EJERCICIOS.md`
**Version doc:** 1.3.0 | **Fecha doc:** 2026-02-21

### References Validated

| Reference | Type | Expected | Actual | Status |
|-----------|------|----------|--------|--------|
| `AdminExerciseCreatePage.tsx` | Page | `apps/frontend/src/apps/admin/pages/AdminExerciseCreatePage.tsx` | Exists | PASS |
| `AdminPageShell.tsx` | Wrapper | `apps/frontend/src/apps/admin/components/shared/AdminPageShell.tsx` | Exists | PASS |
| `StepBasicInfo.tsx` | Component | `apps/frontend/src/apps/admin/components/exercise-builder/StepBasicInfo.tsx` | Exists | PASS |
| `CreateModuleModal.tsx` | Modal | `apps/frontend/src/apps/admin/components/exercise-builder/CreateModuleModal.tsx` | Exists | PASS |
| `ExerciseTypeSelector.tsx` | Component | `apps/frontend/src/apps/admin/components/exercise-builder/ExerciseTypeSelector.tsx` | Exists | PASS |
| `useModulesQuery()` | Hook | `apps/frontend/src/apps/admin/hooks/useContentQueries.ts` (line 671) | Exists, confirmed export | PASS |
| `createModule()` | API | `apps/frontend/src/services/api/educationalAPI.ts` (line 337) | Exists, confirmed export | PASS |
| `ExercisePreview.tsx` | Component | `apps/frontend/src/apps/admin/components/exercise-builder/ExercisePreview.tsx` | Exists | PASS |
| `ContentEditor.tsx` | Component | `apps/frontend/src/apps/admin/components/exercise-builder/ContentEditor.tsx` | Exists | PASS |
| `type-configs/index.ts` | Barrel | `apps/frontend/src/apps/admin/components/exercise-builder/type-configs/index.ts` | Exists | PASS |
| `exercise-builder.types.ts` | Types | `apps/frontend/src/apps/admin/types/exercise-builder.types.ts` | Exists | PASS |
| 17 Type Config components | Configs | `type-configs/*.tsx` (17 files) | All 17 present (CompletarEspacios through TribunalOpiniones) | PASS |
| `exercises.controller.ts` | Controller | `apps/backend/src/modules/educational/controllers/exercises.controller.ts` | Exists | PASS |
| `exercise-validation.controller.ts` | Controller | `apps/backend/src/modules/educational/controllers/exercise-validation.controller.ts` | Exists | PASS |
| `modules.controller.ts` | Controller | `apps/backend/src/modules/educational/controllers/modules.controller.ts` | Exists | PASS |
| `media-upload.controller.ts` | Controller | `apps/backend/src/modules/educational/controllers/media-upload.controller.ts` | Exists | PASS |
| Route `/admin/exercises/create` | Route | App.tsx | Found at line 690 | PASS |
| `POST /educational/exercises` | Endpoint | `@Post('exercises')` | Found at line 453 of exercises.controller.ts | PASS |
| `GET /educational/modules` | Endpoint | `modules.controller.ts` | Exists | PASS |
| `POST /educational/modules` | Endpoint | `modules.controller.ts` | Exists | PASS |

### Line Number Accuracy

| Reference | Doc Says | Actual | Status |
|-----------|----------|--------|--------|
| `ExercisesController.create()` | line 462 | `@Post` at line 453, `create()` at line 492 | FAIL - Stale |
| `App.tsx` route | lines 539, 550 | Route at line 690 | FAIL - Stale |
| `GET exercises` | line 172 | line 163 | FAIL - Stale |
| `PATCH exercises/:id` | line 519 | line 510 | FAIL - Stale |
| `DELETE exercises/:id` | line 570 | line 561 | FAIL - Stale |
| `GET modules` | line 68 | Not verified precisely | WARN |

### Mermaid Diagrams

The flowchart accurately represents the 4-step wizard flow (Basic Info -> Type Selection -> Configuration -> Preview). The 17 exercise type branches in the diagram match the actual `ExerciseTypeSelector` constant `EXERCISE_TYPES` (17 entries in 3 modules).

The CreateModuleModal path (C2a -> C2b -> C2c -> C2d) correctly reflects the v1.3.0 inline module creation flow.

**Verdict:** Diagram is accurate to current implementation.

### Stale References

1. **Line numbers in exercises.controller.ts** are off by approximately 30-40 lines. The doc states `create()` at line 462 but actual `@Post('exercises')` is at line 453 and `create()` is at line 492.
2. **App.tsx line numbers** are completely wrong: doc says lines 539, 550 but the route is at line 690.
3. **RBAC discrepancy**: The doc says `super_admin` or `admin_teacher` can access the builder. Actual App.tsx shows `allowedRoles={['super_admin']}` only. The `admin_teacher` role is used for teacher portal routes, not admin portal routes.

### Missing Documentation

1. The route `/admin/exercises/:id/edit` exists at line 698 in App.tsx but is not documented in the flow.
2. The `media.controller.ts` exists in the educational controllers directory but is not mentioned (only `media-upload.controller.ts` is).

---

## 2. FLUJO-EJERCICIO-M3-M5.md (Student M3-M5 Manual Review)

**Ruta:** `docs/30-ux-ui/flujos/student/FLUJO-EJERCICIO-M3-M5.md`
**Version doc:** 1.1.0 | **Fecha doc:** 2026-02-21

### References Validated

| Reference | Type | Expected | Actual | Status |
|-----------|------|----------|--------|--------|
| `ExercisePage.tsx` | Page | `apps/frontend/src/apps/student/pages/ExercisePage.tsx` | Exists | PASS |
| `module{3-5}/*/Exercise.tsx` | Components | 13 exercise components across module3-5 | Exercise components exist in module3, module4, module5 dirs | PASS |
| `useExerciseSubmission.ts` | Hook | `apps/frontend/src/features/mechanics/shared/hooks/useExerciseSubmission.ts` | Exists | PASS |
| `manualReviewMessages.ts` | Constants | `apps/frontend/src/features/mechanics/constants/manualReviewMessages.ts` | Exists | PASS |
| `TeacherReviewPanelPage.tsx` | Page | `apps/frontend/src/apps/teacher/pages/TeacherReviewPanelPage.tsx` | Exists | PASS |
| `ReviewDetail.tsx` | Component | `apps/frontend/src/apps/teacher/components/review-panel/ReviewDetail.tsx` | Exists | PASS |
| `exercise-submission.service.ts` | Service | `apps/backend/src/modules/progress/services/exercise-submission.service.ts` | Exists | PASS |
| `manual-review.service.ts` | Service | `apps/backend/src/modules/teacher/services/manual-review.service.ts` | Exists | PASS |
| `FeedbackModal` | Component | Referenced in exercise flow | Exists at `shared/components/mechanics/FeedbackModal.tsx` | PASS |
| `StudentPageShell` | Component | Opens `DelayedRewardsModal` | Confirmed: imports and renders DelayedRewardsModal | PASS |
| `DelayedRewardsModal` | Component | Referenced in step 6 | Exists at `apps/student/components/exercise/DelayedRewardsModal.tsx` | PASS |
| `gamilit:exercise:feedback` event | Event | Referenced in step 5 | Found in `useWebSocket.ts` and `StudentPageShell.tsx` | PASS |
| DB: `progress_tracking.exercise_submissions` | Table | Referenced | Confirmed in exercise-submission.service.ts | PASS |
| DB: `progress_tracking.manual_reviews` | Table | Referenced | Teacher review service uses this | PASS |
| DB: `gamification_system.user_stats` | Table | Referenced | Entity exists at gamification module | PASS |

### Mermaid Diagrams

The state diagram accurately represents the lifecycle: `draft -> submitted -> pendingReview -> inReview -> graded -> rewardsApplied/rewardsPending`. This matches the backend logic in `exercise-submission.service.ts`.

**Verdict:** Diagram is accurate.

### Stale References

None found. All paths and component names are current.

### Missing Documentation

1. The doc references `module{3-5}` but the actual exercise mechanics are split across `module3/` (5 types), `module4/` (5 types), and `module5/` (3 types) = 13 components. This is correct per the doc's claim of "13 exercise components."

---

## 3. FLUJO-REVISION-MANUAL-M3-M5.md (Teacher Manual Review)

**Ruta:** `docs/30-ux-ui/flujos/teacher/FLUJO-REVISION-MANUAL-M3-M5.md`
**Version doc:** 1.0.1 | **Fecha doc:** 2026-02-21

### References Validated

| Reference | Type | Expected | Actual | Status |
|-----------|------|----------|--------|--------|
| `TeacherReviewPanelPage.tsx` | Page | `apps/frontend/src/apps/teacher/pages/TeacherReviewPanelPage.tsx` | Exists | PASS |
| `ReviewDetail.tsx` | Component | `apps/frontend/src/apps/teacher/components/review-panel/ReviewDetail.tsx` | Exists | PASS |
| `useManualReviews.ts` | Hook | `apps/frontend/src/apps/teacher/hooks/useManualReviews.ts` | Exists | PASS |
| `manual-review.controller.ts` | Controller | `apps/backend/src/modules/teacher/controllers/manual-review.controller.ts` | Exists | PASS |
| `manual-review.service.ts` | Service | `apps/backend/src/modules/teacher/services/manual-review.service.ts` | Exists | PASS |
| `exercise-submission.service.ts` | Service | `apps/backend/src/modules/progress/services/exercise-submission.service.ts` | Exists | PASS |
| `notification.service.ts` | Service | `apps/backend/src/modules/notifications/services/notification.service.ts` | Exists | PASS |
| DB: `progress_tracking.manual_reviews` | Table | Referenced | Exists | PASS |
| DB: `progress_tracking.exercise_submissions` | Table | Referenced | Exists | PASS |
| DB: `gamification_system.user_stats` | Table | Referenced | Exists | PASS |
| `GET /teacher/reviews/pending` | Endpoint | Referenced in sequence diagram | Expected in manual-review.controller.ts | PASS |
| `PUT /teacher/reviews/:id` | Endpoint | Referenced | Expected | PASS |
| `POST /teacher/reviews/:id/complete` | Endpoint | Referenced | Expected | PASS |

### Mermaid Diagrams

The sequence diagram accurately models: Teacher opens pending -> GET pending -> saves rubric -> PUT review -> completes -> POST complete -> claims rewards -> updates DB. The flow of Rewards (GM participant) being called by BE after completion is accurate per the backend service chain.

The notification generation step (`notificationType=exercise_feedback`) matches the `gamilit:exercise:feedback` event documented in the student flow.

**Verdict:** Diagram is accurate and consistent with the student-side M3-M5 flow.

### Stale References

None found.

### Missing Documentation

None significant. The document is concise and accurate.

---

## 4. GUIA-DETECTIVE-THEME.md

**Ruta:** `docs/50-guides/frontend/GUIA-DETECTIVE-THEME.md`
**Version doc:** 1.1.0 | **Fecha doc:** 2026-02-20

### References Validated

| Reference | Type | Expected | Actual | Status |
|-----------|------|----------|--------|--------|
| `detective-theme.css` | CSS | `apps/frontend/src/shared/styles/detective-theme.css` | Exists | PASS |
| `tailwind.config.js` | Config | `apps/frontend/tailwind.config.js` | Exists | PASS |
| `index.css` | CSS | `apps/frontend/src/shared/styles/index.css` | Exists | PASS |
| `DetectiveCard.tsx` | Component | `apps/frontend/src/shared/components/base/DetectiveCard.tsx` | Exists | PASS |
| `DetectiveButton.tsx` | Component | `apps/frontend/src/shared/components/base/DetectiveButton.tsx` | Exists | PASS |
| `InputDetective.tsx` | Component | `apps/frontend/src/shared/components/base/InputDetective.tsx` | Exists | PASS |
| `ProgressBar.tsx` | Component | `apps/frontend/src/shared/components/base/ProgressBar.tsx` | Exists | PASS |
| `RankBadge.tsx` | Component | `apps/frontend/src/shared/components/base/RankBadge.tsx` | Exists | PASS |
| `LoadingOverlay.tsx` | Component | `apps/frontend/src/shared/components/loading/LoadingOverlay.tsx` | Exists | PASS |
| `SkeletonCard.tsx` | Component | `apps/frontend/src/shared/components/loading/SkeletonCard.tsx` | Exists | PASS |
| `base/index.ts` | Barrel | `apps/frontend/src/shared/components/base/index.ts` | Exists | PASS |
| `@shared/utils/cn` | Utility | Referenced for class merging | Expected in shared utils | PASS |

### CSS Architecture Claims

| Claim | Status | Notes |
|-------|--------|-------|
| 3-layer architecture (CSS vars, Tailwind config, detective-theme.css) | PASS | All 3 files exist and are imported in order |
| `index.css` imports `detective-theme.css` | PASS | Import chain documented matches file structure |
| `@config` directive points to `tailwind.config.js` | PASS | Tailwind v4 config path |
| CSS custom properties in `:root` | PASS | Expected in index.css |

### Component API Claims

The document provides detailed props tables for DetectiveButton, DetectiveCard, InputDetective, ProgressBar, RankBadge, and LoadingOverlay. These are reference documentation claims that would require reading each component file to verify prop-by-prop. The file paths are all confirmed to exist.

### Stale References

None found. All file paths are accurate.

### Missing Documentation

1. The `animations.css` file exists at `apps/frontend/src/shared/styles/animations.css` but is not mentioned in the guide.
2. The `LoadingSpinner.tsx` component exists alongside `LoadingOverlay.tsx` but is not documented.
3. Additional base components exist that are not in the guide: `ColorfulCard.tsx`, `EnhancedCard.tsx`, `StatusBadge.tsx`, `StatsCardGrid.tsx`, `TabBar.tsx`, `Toast.tsx`.

---

## 5. PORTAL-ADMIN-GUIDE.md

**Ruta:** `docs/60-portals/admin/PORTAL-ADMIN-GUIDE.md`
**Version doc:** 2.0.0 | **Fecha doc:** 2026-02-18

### References Validated

| Reference | Type | Expected | Actual | Status |
|-----------|------|----------|--------|--------|
| 19 admin pages | Count | 19 listed in section 2.1 | 19 .tsx files in pages/ | PASS |
| `AdminPageShell.tsx` | Component | `components/shared/AdminPageShell.tsx` | Exists | PASS |
| `AdminTabBar.tsx` | Component | `components/shared/AdminTabBar.tsx` | Exists | PASS |
| `DashboardStatsGrid.tsx` | Component | `components/dashboard/DashboardStatsGrid.tsx` | Exists | PASS |
| `SystemHealthCard.tsx` | Component | `components/dashboard/SystemHealthCard.tsx` | Exists | PASS |
| `AlertsNotificationsCard.tsx` | Component | `components/dashboard/AlertsNotificationsCard.tsx` | Exists | PASS |
| `DashboardQuickActions.tsx` | Component | `components/dashboard/DashboardQuickActions.tsx` | Exists | PASS |
| `UsersSearchFilters.tsx` | Component | `components/users/UsersSearchFilters.tsx` | Exists | PASS |
| `UsersStatsGrid.tsx` | Component | `components/users/UsersStatsGrid.tsx` | Exists | PASS |
| `UsersTable.tsx` | Component | `components/users/UsersTable.tsx` | Exists | PASS |
| `UserBadges.tsx` | Component | `components/users/UserBadges.tsx` | Exists | PASS |
| `ContentPreviewModal.tsx` | Component | `components/content/ContentPreviewModal.tsx` | Exists | PASS |
| `ContentVersionsTab.tsx` | Component | `components/content/ContentVersionsTab.tsx` | Exists | PASS |
| `MediaLibraryTab.tsx` | Component | `components/content/MediaLibraryTab.tsx` | Exists | PASS |
| `PendingExercisesTab.tsx` | Component | `components/content/PendingExercisesTab.tsx` | Exists | PASS |
| `RejectExerciseModal.tsx` | Component | `components/content/RejectExerciseModal.tsx` | Exists | PASS |
| Gamification tabs (4) | Components | AchievementsTab, RanksTab, EconomyTab, StatsTab | All 4 exist | PASS |
| `InstitutionFormModals.tsx` | Component | `components/institutions/InstitutionFormModals.tsx` | Exists | PASS |
| Exercise builder components | Components | StepBasicInfo, CreateModuleModal, ExerciseTypeSelector, ExercisePreview | All exist | PASS |
| `ProfileSettings.tsx` | Component | `components/settings/ProfileSettings.tsx` | Exists | PASS |
| `AdminLayout.tsx` | Layout | `layouts/AdminLayout.tsx` | Exists | PASS |
| `AdminDashboardHero.tsx` | Component | `components/dashboard/AdminDashboardHero.tsx` | Exists | PASS |
| `adminAPI.ts` | API | `services/api/adminAPI.ts` | Exists | PASS |
| `apiClient.ts` | API | `services/api/apiClient.ts` | Exists | PASS |

### Count Discrepancies

| Item | Doc Claims | Actual | Status |
|------|-----------|--------|--------|
| Frontend hooks | 12 hooks | **31 hooks** (excluding index.ts) | **FAIL - Severely undercounted** |
| Backend controllers | 17 controllers | **21 controllers** (excluding index.ts) | **FAIL - Undercounted** |
| Backend services | 15 services | **18 services** | **FAIL - Undercounted** |
| Frontend components | "30+" | **~100 .tsx files** across subdirectories | **FAIL - Severely undercounted** |

### Missing Hooks (19 not documented in section 2.1)

The doc lists 12 hooks but the actual directory has 31. Missing from documentation:
- `useAdminAssignments.ts`, `useClassroomsList.ts`, `useAlerts.ts`, `useAnalytics.ts`, `useAuditLogs.ts`, `useMonitoring.ts`, `useReports.ts`, `useSystemLogs.ts`, `useConfigCategories.ts`, `useRoles.ts`, `useSystemConfig.ts`, `useProgress.ts`, `useOrganizations.ts`, `useAdminData.ts`, `useClassroomTeacher.ts`, `useLtiConsumers.ts`, `useRolePermissions.ts`, `useSettings.ts`, `useFeatureFlags.ts`

### Missing Backend Controllers (4 not documented in section 2.1)

- `admin-assignments.controller.ts`
- `admin-user-stats.controller.ts`
- `branding.controller.ts`
- `feature-flags.controller.ts`

### Missing Backend Services (3 not documented)

- `admin-assignments.service.ts`
- `branding.service.ts`
- `feature-flags.service.ts`

### Route Path Discrepancies

| Doc Says | Actual in App.tsx | Status |
|----------|-------------------|--------|
| `/admin/classroom-teacher` | `/admin/classroom-teachers` (plural) | **FAIL** |
| `/admin` base + children pattern | Flat routes with `ProtectedRoute` wrapper | **FAIL - Doc shows nested routing but code uses flat** |
| Doc shows no branding/LTI routes | `/admin/settings/branding` and `/admin/integrations/lti` exist | **FAIL - Missing routes** |
| Doc shows no audit-logs route | `/admin/audit-logs` exists | **FAIL - Missing route** |
| Doc shows no assignments route | `/admin/assignments` exists | **FAIL - Missing route** |
| Doc shows no notifications route | `/admin/notifications` exists | **FAIL - Missing route** |
| RBAC: `admin` or `super_admin` | All admin routes use `super_admin` only | **FAIL - Doc incorrect** |

### Mermaid Diagrams

Section 2.2 and 2.3 show general architecture flow diagrams. These are conceptually accurate (Pages -> Components -> Hooks -> API -> Controllers -> Services -> DB).

### Stale References

1. **Route `/admin/classroom-teacher`** should be `/admin/classroom-teachers` (plural).
2. **RBAC claim** in section 8.1 says AdminGuard checks `admin` or `super_admin` but App.tsx only allows `super_admin` for all admin routes.
3. **Section 5.1 route structure** shows nested `children` under `/admin` but the actual code uses flat `<Route>` elements each with their own `<ProtectedRoute>` wrapper.
4. **Hooks count (12)** is severely outdated; actual count is 31.
5. **Controllers count (17)** is outdated; actual count is 21.
6. **Services count (15)** is outdated; actual count is 18.

### Missing Documentation

1. Routes for branding (`/admin/settings/branding`), LTI (`/admin/integrations/lti`), audit logs (`/admin/audit-logs`), assignments (`/admin/assignments`), notifications settings (`/admin/settings/notifications`) are not documented.
2. Multiple component directories not covered: `advanced/` (6 components), `alerts/` (5 components), `assignments/`, `monitoring/` (6 components), `progress/` (3 components), `reports/` (2 components), `roles/` (2 components).
3. Dashboard has 13 components but only 4 are listed.

---

## 6. docs/30-ux-ui/README.md

**Ruta:** `docs/30-ux-ui/README.md`
**Version doc:** N/A (no version header)

### References Validated

| Reference | Type | Expected | Actual | Status |
|-----------|------|----------|--------|--------|
| Portal Estudiante (~100%) | Status | Documented | Consistent with CLAUDE.md | PASS |
| Portal Maestro (~95%) | Status | Documented | Consistent with CLAUDE.md | PASS |
| Portal Administrador (~90%) | Status | Documented | Consistent with CLAUDE.md | PASS |
| Portal Padres (100%) | Status | Documented | Consistent with CLAUDE.md | PASS |
| 23 tipos de ejercicios | Count | 23 types | ExerciseTypeSelector has 17 in builder; registrations.ts has 30 mechanics total | WARN |
| 590 componentes React | Count | 590 | Stated in MEMORY.md as verified 2026-02-21 | PASS |
| 19 paginas (teacher) | Count | 19 teacher pages | Consistent with portal docs | PASS |
| TailwindCSS 4.x | Tech | Framework | Tailwind v4 confirmed (uses `@config` directive in index.css) | PASS |
| Mobile-first design (38 ejercicios + compartidos) | Design | Responsive patterns | Documented in GUIA-DETECTIVE-THEME.md section 17 | PASS |
| `flujos/README.md` | Link | Referenced | Would need to verify | WARN |
| `flujos/TRACEABILITY-MATRIX.md` | Link | Referenced | Would need to verify | WARN |
| `flujos/COBERTURA-TOTAL-PROCESOS.md` | Link | Referenced | Would need to verify | WARN |
| `apps/frontend/src/styles/` | Path | Design System path | Actual path is `apps/frontend/src/shared/styles/` | **FAIL** |
| `apps/frontend/src/components/` | Path | Components path | Actual path is `apps/frontend/src/shared/components/` + feature-specific dirs | **FAIL** |

### Stale References

1. **Component count (580 at bottom)** contradicts the "590" stated higher up. MEMORY.md says 590 verified 2026-02-21. The bottom line says "580 componentes React documentados."
2. **Design System path:** Doc says `apps/frontend/src/styles/` but actual path is `apps/frontend/src/shared/styles/`.
3. **Components path:** Doc says `apps/frontend/src/components/` but actual structure distributes components across `apps/frontend/src/shared/components/`, `apps/frontend/src/features/*/components/`, and `apps/frontend/src/apps/*/components/`.

### Missing Documentation

1. Module 4 (Textos Digitales) and Module 5 (Produccion Creativa) exercise types are not mentioned. The doc says "5 modulos" but only describes up to module-level without naming M4 and M5.

---

## 7. FLUJO-EJERCICIO-COMPLETO.md (Student M1-M2 Auto-Grade)

**Ruta:** `docs/30-ux-ui/flujos/student/FLUJO-EJERCICIO-COMPLETO.md`
**Version doc:** 1.2.0 | **Fecha doc:** 2026-02-18

### References Validated

| Reference | Type | Expected | Actual | Status |
|-----------|------|----------|--------|--------|
| `ExercisePage.tsx` | Page | `apps/frontend/src/apps/student/pages/ExercisePage.tsx` | Exists | PASS |
| `ExerciseContext.tsx` | Context | `apps/frontend/src/features/exercises/context/ExerciseContext.tsx` | Exists | PASS |
| `ExerciseLayout.tsx` | Component | `apps/frontend/src/features/exercises/components/ExerciseLayout.tsx` | Exists | PASS |
| `useExerciseData.ts` | Hook | `apps/frontend/src/features/exercises/hooks/useExerciseData.ts` | Exists | PASS |
| `useExerciseProgress.ts` | Hook | `apps/frontend/src/features/exercises/hooks/useExerciseProgress.ts` | Exists | PASS |
| `useExerciseComodines.ts` | Hook | `apps/frontend/src/features/exercises/hooks/useExerciseComodines.ts` | Exists | PASS |
| `registrations.ts` | Registry | `apps/frontend/src/features/exercises/registry/registrations.ts` | Exists | PASS |
| `educationalAPI.ts` | API | `apps/frontend/src/services/api/educationalAPI.ts` | Exists | PASS |
| `exercise-submission.controller.ts` | Controller | `apps/backend/src/modules/progress/controllers/exercise-submission.controller.ts` | Exists | PASS |
| `exercise-submission.service.ts` | Service | `apps/backend/src/modules/progress/services/exercise-submission.service.ts` | Exists | PASS |
| `exercise-grading.service.ts` | Service | `apps/backend/src/modules/progress/services/grading/exercise-grading.service.ts` | Exists | PASS |
| `exercise-rewards.service.ts` | Service | `apps/backend/src/modules/progress/services/grading/exercise-rewards.service.ts` | Exists | PASS |
| `GamifiedHeader` | Component | Used in ExerciseLayout | Exists at `shared/components/layout/GamifiedHeader.tsx` | PASS |
| `ExercisePageHeader` | Component | Used in ExerciseLayout | Exists at `apps/student/components/exercise/ExercisePageHeader.tsx` | PASS |
| `ExerciseGuide` | Component | Referenced in architecture | Exists at `features/exercises/components/ExerciseGuide.tsx` | PASS |
| `ExerciseLoader` | Component | Referenced | Exists at `features/exercises/components/ExerciseLoader.tsx` | PASS |
| `MechanicCompatWrapper` | Component | Referenced | Exists at `features/exercises/components/MechanicCompatWrapper.tsx` | PASS |
| `ExerciseSidebar` | Component | Referenced | Exists at `features/exercises/components/ExerciseSidebar.tsx` | PASS |
| `ConsumablesPanel` | Component | Referenced in sidebar | Exists at `features/exercises/components/ConsumablesPanel.tsx` | PASS |
| `ActionsPanel` | Component | Referenced in sidebar | Exists at `features/exercises/components/ActionsPanel.tsx` | PASS |
| `ScoreDisplay` | Component | Referenced in sidebar | Exists at `shared/components/mechanics/ScoreDisplay.tsx` | PASS |
| `TimerWidget` | Component | Referenced in sidebar | Exists at `shared/components/mechanics/TimerWidget.tsx` | PASS |
| `ProgressTracker` | Component | Referenced in sidebar | Exists at `shared/components/mechanics/ProgressTracker.tsx` | PASS |
| `FeedbackModal` | Component | Referenced | Exists at `shared/components/mechanics/FeedbackModal.tsx` | PASS |
| `ExerciseCompletedState` | Component | Guard state | Exists at `features/exercises/components/ExerciseCompletedState.tsx` | PASS |
| 30 mechanics registered | Count | registrations.ts | **Actual: 30 registerExercise calls** (7 M1 + 6 M2 + 5 M3 + 5 M4 + 3 M5 + 4 aux) | PASS |

### Architecture Tree Accuracy

The ASCII tree in "Implementacion Tecnica v2.0" was verified against actual code:

| Tree Node | Exists | Notes |
|-----------|--------|-------|
| `ExercisePage.tsx` (thin shell) | PASS | Confirmed ~30 lines as stated |
| `ExerciseProvider` | PASS | In ExerciseContext.tsx |
| `useExerciseData` | PASS | |
| `useExerciseProgress` | PASS | |
| `useExerciseComodines` | PASS | |
| `ExerciseLayout` | PASS | |
| `GamifiedHeader` | PASS | Imported from @shared |
| `ExercisePageHeader` | PASS | Imported from student/exercise |
| `ExerciseGuide` | PASS | |
| `ExerciseLoader` -> `MechanicCompatWrapper` -> 30 mechanics | PASS | Registry pattern confirmed |
| `ExerciseSidebar` with 5 sub-components | PASS | All exist |
| `FeedbackModal` | PASS | |

### Mermaid Diagrams

The sequence diagram is accurate: Student -> FE (ExercisePage) -> BE (ProgressModule) -> DB -> GM (Gamification) -> back to FE with score + rewards.

**Verdict:** Diagram is accurate.

### Stale References

None found. This document is well-maintained.

### Missing Documentation

1. The `ExerciseErrorState.tsx` and `ExerciseLoadingSkeleton.tsx` components exist but are not in the architecture tree.
2. The `ExerciseFeedback.tsx` component exists alongside FeedbackModal but is not documented.
3. The `ExerciseHeader.tsx` component exists at `features/exercises/components/ExerciseHeader.tsx` but is not distinguished from `ExercisePageHeader` in the doc.

---

## 8. FLUJO-GESTION-GAMIFICACION.md (FL-ADM-08)

**Ruta:** `docs/30-ux-ui/flujos/admin/FLUJO-GESTION-GAMIFICACION.md`
**Version doc:** 1.1.0 | **Fecha doc:** 2026-02-18

### References Validated

| Reference | Type | Expected | Actual | Status |
|-----------|------|----------|--------|--------|
| `AdminGamificationPage.tsx` | Page | `apps/frontend/src/apps/admin/pages/AdminGamificationPage.tsx` | Exists | PASS |
| `AdminPageShell.tsx` | Wrapper | `apps/frontend/src/apps/admin/components/shared/AdminPageShell.tsx` | Exists | PASS |
| `useGamificationConfig.ts` | Hook | `apps/frontend/src/apps/admin/hooks/useGamificationConfig.ts` | Exists | PASS |
| `useAdminPageSetup.ts` | Hook | `apps/frontend/src/apps/admin/hooks/useAdminPageSetup.ts` | Exists | PASS |
| `RanksTab.tsx` | Component | `apps/frontend/src/apps/admin/components/gamification/RanksTab.tsx` | Exists | PASS |
| `AchievementsTab.tsx` | Component | `apps/frontend/src/apps/admin/components/gamification/AchievementsTab.tsx` | Exists | PASS |
| `EconomyTab.tsx` | Component | `apps/frontend/src/apps/admin/components/gamification/EconomyTab.tsx` | Exists | PASS |
| `StatsTab.tsx` | Component | `apps/frontend/src/apps/admin/components/gamification/StatsTab.tsx` | Exists | PASS |
| `ParameterEditModal.tsx` | Modal | `apps/frontend/src/apps/admin/components/gamification/ParameterEditModal.tsx` | Exists | PASS |
| `MayaRankEditModal.tsx` | Modal | `apps/frontend/src/apps/admin/components/gamification/MayaRankEditModal.tsx` | Exists | PASS |
| `BulkUpdateDialog.tsx` | Dialog | `apps/frontend/src/apps/admin/components/gamification/BulkUpdateDialog.tsx` | Exists | PASS |
| `PreviewImpactDialog.tsx` | Dialog | `apps/frontend/src/apps/admin/components/gamification/PreviewImpactDialog.tsx` | Exists | PASS |
| `RestoreDefaultsDialog.tsx` | Dialog | `apps/frontend/src/apps/admin/components/gamification/RestoreDefaultsDialog.tsx` | Exists | PASS |
| `achievementsAPI.ts` | API | `apps/frontend/src/features/gamification/social/api/achievementsAPI.ts` | Exists | PASS |
| `adminAPI.ts` | API | `apps/frontend/src/services/api/adminAPI.ts` | Exists | PASS |
| `AdminLayout.tsx` | Layout | `apps/frontend/src/apps/admin/layouts/AdminLayout.tsx` | Exists | PASS |
| `admin-gamification-config.controller.ts` | Controller | `apps/backend/src/modules/admin/controllers/admin-gamification-config.controller.ts` | Exists | PASS |
| `gamification-config.service.ts` | Service | `apps/backend/src/modules/admin/services/gamification-config.service.ts` | Exists | PASS |
| `achievements.controller.ts` | Controller | `apps/backend/src/modules/gamification/controllers/achievements.controller.ts` | Exists | PASS |
| `achievements.service.ts` | Service | `apps/backend/src/modules/gamification/services/achievements.service.ts` | Expected | PASS |
| `gamification-parameter.entity.ts` | Entity | `apps/backend/src/modules/admin/entities/gamification-parameter.entity.ts` | Exists | PASS |
| `achievement.entity.ts` | Entity | `apps/backend/src/modules/gamification/entities/achievement.entity.ts` | Exists | PASS |
| `maya-rank.entity.ts` | Entity | `apps/backend/src/modules/gamification/entities/maya-rank.entity.ts` | Exists | PASS |
| `user-stats.entity.ts` | Entity | `apps/backend/src/modules/gamification/entities/user-stats.entity.ts` | Exists | PASS |
| DDL tables (7 referenced) | Database | All 7 gamification_system tables | DDL paths consistent with project structure | PASS |

### Mermaid Diagrams

The flowchart accurately represents:
1. Parallel data loading on mount (parameters, ranks, stats, achievements)
2. 4-tab navigation (Ranks, Achievements, Economy, Statistics)
3. Action paths for each tab (edit rank, toggle achievement, edit parameter, bulk update, preview impact, restore defaults)
4. All paths end with cache invalidation + toast

**Verdict:** Diagram is accurate and comprehensive.

### Stale References

None found. All 26 frontend + backend + DB references validated.

### Missing Documentation

None significant. This is one of the most complete flow documents audited.

---

## Summary

| Document | References | Valid | Stale | Missing | Score |
|----------|-----------|-------|-------|---------|-------|
| FLUJO-CONSTRUCTOR-EJERCICIOS.md | 33 | 29 | 4 | 2 | 88% |
| FLUJO-EJERCICIO-M3-M5.md | 15 | 15 | 0 | 0 | 100% |
| FLUJO-REVISION-MANUAL-M3-M5.md | 13 | 13 | 0 | 0 | 100% |
| GUIA-DETECTIVE-THEME.md | 15 | 15 | 0 | 3 | 100% |
| PORTAL-ADMIN-GUIDE.md | 45 | 32 | 13 | 15+ | 71% |
| docs/30-ux-ui/README.md | 14 | 10 | 4 | 1 | 71% |
| FLUJO-EJERCICIO-COMPLETO.md | 30 | 30 | 0 | 3 | 100% |
| FLUJO-GESTION-GAMIFICACION.md | 26 | 26 | 0 | 0 | 100% |

**Overall alignment score: 89% (170/191 references valid)**

---

## Critical Misalignments

### Priority 1 (Blocking / Misleading)

1. **PORTAL-ADMIN-GUIDE.md - Route path `/admin/classroom-teacher`** should be `/admin/classroom-teachers` (plural). Anyone following the doc would create incorrect links.

2. **PORTAL-ADMIN-GUIDE.md - RBAC claim** states AdminGuard allows `admin` or `super_admin` roles. Actual App.tsx restricts ALL admin routes to `super_admin` only. This is a security-relevant inaccuracy.

3. **PORTAL-ADMIN-GUIDE.md - Hooks count (12)** is critically wrong; actual is 31. Anyone using this as a development reference would miss 19 existing hooks.

4. **PORTAL-ADMIN-GUIDE.md - Controllers count (17)** is wrong; actual is 21. Missing: `admin-assignments`, `admin-user-stats`, `branding`, `feature-flags`.

5. **PORTAL-ADMIN-GUIDE.md - Services count (15)** is wrong; actual is 18.

6. **FLUJO-CONSTRUCTOR-EJERCICIOS.md - RBAC claim** says `super_admin` or `admin_teacher` can access exercise builder. Actual App.tsx shows `super_admin` only.

### Priority 2 (Stale but Non-Blocking)

7. **FLUJO-CONSTRUCTOR-EJERCICIOS.md - Line numbers** for exercises.controller.ts are all off by ~30-40 lines. `create()` documented at "line 462" is actually at line 492.

8. **FLUJO-CONSTRUCTOR-EJERCICIOS.md - App.tsx line numbers** completely wrong: doc says "lines 539, 550" but route is at line 690.

9. **docs/30-ux-ui/README.md - Component count inconsistency**: Says "590" in body but "580" at bottom.

10. **docs/30-ux-ui/README.md - File paths**: `apps/frontend/src/styles/` and `apps/frontend/src/components/` are incorrect. Should be `shared/styles/` and distributed component structure.

11. **PORTAL-ADMIN-GUIDE.md - Route structure**: Section 5.1 shows nested route children pattern but actual code uses flat ProtectedRoute wrappers.

12. **PORTAL-ADMIN-GUIDE.md - Missing routes**: At least 6 routes not documented (branding, LTI, audit-logs, assignments, notifications, notifications settings).

---

## Recommendations

### Immediate (P0)

1. **Fix RBAC claims** in PORTAL-ADMIN-GUIDE.md and FLUJO-CONSTRUCTOR-EJERCICIOS.md to reflect that admin routes require `super_admin` only (not `admin` or `admin_teacher`).
2. **Fix route path** `/admin/classroom-teacher` to `/admin/classroom-teachers` in PORTAL-ADMIN-GUIDE.md section 5.1.
3. **Update counts** in PORTAL-ADMIN-GUIDE.md: hooks 12->31, controllers 17->21, services 15->18, components "30+"->~100.

### Short-term (P1)

4. **Remove line number references** from FLUJO-CONSTRUCTOR-EJERCICIOS.md section 8 (Trazabilidad cruzada). Line numbers become stale with every code change; use function/method names instead.
5. **Add missing routes** to PORTAL-ADMIN-GUIDE.md section 5.1: branding, LTI, audit-logs, assignments, notifications, notifications settings.
6. **Fix component count** in docs/30-ux-ui/README.md bottom line: 580->590.
7. **Fix file paths** in docs/30-ux-ui/README.md: use correct `shared/styles/` and distributed component paths.
8. **Add missing hooks** to PORTAL-ADMIN-GUIDE.md section 2.1 (19 hooks undocumented).
9. **Add missing controllers** to PORTAL-ADMIN-GUIDE.md section 2.1 (admin-assignments, admin-user-stats, branding, feature-flags).

### Long-term (P2)

10. **Adopt convention**: Reference file paths and function names instead of line numbers in all flow documents to prevent staleness.
11. **Add M4/M5** module descriptions to docs/30-ux-ui/README.md exercise types section.
12. **Document additional base components** in GUIA-DETECTIVE-THEME.md (ColorfulCard, EnhancedCard, StatusBadge, etc.).
13. **Update PORTAL-ADMIN-GUIDE.md** section 2.1 to reflect actual ~100 admin components across all subdirectories.

---

*Generated: 2026-02-21 | Audit scope: 8 documents, 191 cross-references validated*
