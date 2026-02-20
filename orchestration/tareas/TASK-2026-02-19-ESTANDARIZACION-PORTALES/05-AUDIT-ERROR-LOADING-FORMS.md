# 05 - Audit: Error Handling, Loading States & Form Patterns

**Version:** 1.0.0
**Fecha:** 2026-02-19
**Scope:** `apps/frontend/src/` — Student, Teacher, Admin, Parent portals + shared/features
**Method:** Full codebase grep/glob analysis of all .ts/.tsx files

---

## Table of Contents

1. [Error Handling Patterns](#1-error-handling-patterns)
2. [Loading / Skeleton Components](#2-loading--skeleton-components)
3. [Empty State Patterns](#3-empty-state-patterns)
4. [Form Validation Patterns](#4-form-validation-patterns)
5. [Toast Notification Patterns](#5-toast-notification-patterns)
6. [Confirmation Dialog Patterns](#6-confirmation-dialog-patterns)
7. [Summary & Recommendations](#7-summary--recommendations)

---

## 1. Error Handling Patterns

### 1.1 Overview of All Approaches

| Pattern | Count (files) | Description |
|---------|---------------|-------------|
| try/catch + toast notification | ~44 files | `catch` block calls `toast.error(...)` |
| try/catch + setState error | ~89 files | `catch` block calls `setError(...)` for inline display |
| try/catch + console.error only | ~40+ files | `catch` logs to console, re-throws or silently fails |
| React Query onError callbacks | ~37 files | `onError` in useMutation/useQuery options |
| Error Boundaries | 2 components | Class-based `ErrorBoundary` wrappers |
| Inline error display (`{error && ...}`) | ~100+ files | Conditional rendering of error state |
| Centralized apiErrorHandler | 19 API files | Uses `handleAPIError()` from `apiErrorHandler.ts` |
| No error handling (API calls w/o catch) | See section 1.7 | Zustand stores, some API services |

### 1.2 Error Boundaries

Only **2 ErrorBoundary components** exist in the entire codebase. Neither is used to wrap portal routes.

| Component | File | Scope | Theme |
|-----------|------|-------|-------|
| `ErrorBoundary` | `shared/components/ErrorBoundary.tsx` | Generic, global | Raw Tailwind (gray-50, blue-600, red-600) |
| `GamificationErrorBoundary` | `features/gamification/components/GamificationErrorBoundary.tsx` | Gamification features | Yellow warning theme (yellow-50, yellow-600) |

**Issues found:**
- `ErrorBoundary` is exported from `shared/components/index.ts` but **never imported by any page or route**
- `GamificationErrorBoundary` is defined but **never used** anywhere (0 import references outside its own file)
- No portal-level error boundaries wrapping Student, Teacher, Admin, or Parent route trees
- The generic ErrorBoundary uses **English + Spanish mix** ("Oops! Algo salio mal" + "Intentar de nuevo")
- The GamificationErrorBoundary uses **English** ("Gamification Temporarily Unavailable", "Try Again")
- Different visual design between the two (full-page red vs. inline yellow warning)

### 1.3 try/catch + toast (Per Portal)

| Portal | Files with toast in catch | Total toast calls | Representative Files |
|--------|--------------------------|-------------------|---------------------|
| **Student** | 6 | 21 | `settings/AccountSection.tsx` (7), `settings/ProfileSection.tsx` (4), `MissionsPage.tsx` (4) |
| **Teacher** | 16 | 65 | `TeacherSettings.tsx` (16), `TeacherContentManagement.tsx` (9), `InterventionAlertsPanel.tsx` (6) |
| **Admin** | 12 | 77 | `useContentQueries.ts` (22), `useGamificationConfig.ts` (11), `ProfileSettings.tsx` (10) |
| **Parent** | 0 | 0 | No toast usage in parent portal |
| **Features (shared)** | 8 | 37 | `BrandingSettingsPage.tsx` (11), `useExerciseSubmission.ts` (7), `AdminLtiPage.tsx` (7) |

**Pattern observed:** Teacher and Admin portals concentrate toast usage in pages with CRUD operations. The Student portal uses toast primarily in settings. The **Parent portal has zero toast notifications**.

### 1.4 try/catch + setState Error (Per Portal)

| Portal | Files with useState error | Notable Hooks |
|--------|--------------------------|---------------|
| **Student** | 12 | `useExercisePowerUps.ts`, `useAchievementsEnhanced.ts`, `useExerciseState.ts`, `AccountSection.tsx` |
| **Teacher** | 22 | `useInterventionAlerts.ts`, `useGrading.ts`, `useStudentBlocking.ts`, `useTeacherMessages.ts`, many hooks |
| **Admin** | 25 | `useAdminDashboard.ts` (7), `useAnalytics.ts` (8), `useOrganizations.ts` (9), `useUserManagement.ts` (11) |
| **Parent** | 3 | `ParentRegisterPage.tsx`, `ChildProgressPage.tsx`, `ParentDashboardPage.tsx` |

### 1.5 React Query onError Callbacks

Found in **37 files**. Predominantly in:
- **Admin hooks:** `useContentQueries.ts` (23 useMutation), `useGamificationConfig.ts` (13), `useClassroomTeacher.ts` (11)
- **Teacher hooks:** `useManualReviews.ts` (10)
- **Features:** `useExerciseSubmission.ts`, `useShopPurchase.ts`, `useEquipment.ts`, `useActivatePowerUp.ts`
- **Leaderboard components:** 5 components use `onError` for image loading fallbacks

### 1.6 Centralized Error Handler Usage

The file `services/api/apiErrorHandler.ts` provides a comprehensive error class hierarchy (APIError, NetworkError, AuthenticationError, AccountSuspendedError, etc.) with `handleAPIError()`, `formatErrorMessage()`, and `getErrorMessage()` utilities.

**Files using centralized handler:** 19 API service files

| Category | Files Using Handler | Files NOT Using Handler |
|----------|--------------------|-----------------------|
| Core API services | `authAPI.ts`, `adminAPI.ts`, `profileAPI.ts`, `educationalAPI.ts`, `passwordAPI.ts` | - |
| Feature API services | `economyAPI.ts`, `socialAPI.ts`, `achievementsAPI.ts`, `ranksAPI.ts`, `mechanicsAPI.ts`, `progressAPI.ts`, `inventoryAPI.ts` | - |
| Standalone services | `friendsAPI.ts`, `teamsAPI.ts`, `schoolsAPI.ts`, `studentAssignmentsAPI.ts`, `parentAPI.ts` | - |
| **Teacher API services (all)** | **NONE** | `classroomsApi.ts`, `assignmentsApi.ts`, `gradingApi.ts`, `reportsApi.ts`, `analyticsApi.ts`, `alertConfigApi.ts`, `bonusCoinsApi.ts`, `teacherApi.ts`, `studentProgressApi.ts`, `exerciseResponsesApi.ts`, `interventionAlertsApi.ts`, `teacherMessagesApi.ts`, `teacherContentApi.ts` |
| **Admin API services** | `adminAPI.ts` | `gamificationConfigApi.ts`, `classroomTeacherApi.ts`, `achievementsApi.ts` |

**Critical finding:** All 13 Teacher API service files use a different pattern (try/catch + console.error + re-throw) rather than the centralized `handleAPIError()`. The 3 newer Admin API services also bypass the centralized handler. This creates **two parallel error handling strategies**.

### 1.7 API Calls Without Error Handling

The `apiClient.ts` response interceptor provides base-level error handling (401 token refresh, console logging for 403/404/500). All API calls that propagate through apiClient benefit from this. However, several patterns of "silent failure" exist:

- **Zustand stores** with try/catch that only set `error: null` on catch (swallowing the error)
- **Teacher API services** that `throw error` after `console.error` -- error reaches caller but has no structured transformation
- **Some hooks** where `useCallback` async functions catch and log but don't surface errors to UI

---

## 2. Loading / Skeleton Components

### 2.1 Dedicated Loading Components

| Component | File | Theme | Usage |
|-----------|------|-------|-------|
| `LoadingSpinner` | `shared/components/LoadingSpinner.tsx` | Raw Tailwind (gray, configurable color) | Generic SVG spinner, 3 sizes |
| `LoadingOverlay` | `shared/components/base/LoadingOverlay.tsx` | **Detective theme** (detective-orange, detective-text) | Full-page or inline overlay with Framer Motion |
| `Skeleton` (base) | `shared/components/Skeleton.tsx` | Raw Tailwind (gray-200) | 7 variants: base, Text, Avatar, Card, Stats, Achievement, Table |
| `SkeletonCard` (loading/) | `shared/components/loading/SkeletonCard.tsx` | **Detective theme** (detective-bg-secondary, detective-border) | 4 variants: Card, Stats, List, Table |
| `ExerciseLoadingSkeleton` | `features/exercises/components/ExerciseLoadingSkeleton.tsx` | **Detective theme** (detective-orange, DetectiveCard) | Exercise-specific full page loader |
| `PageLoader` | `App.tsx` (inline) | Dark theme (gray-900, amber-500) | Suspense fallback for lazy routes |
| `WheelSpinner` | `features/mechanics/module2/RuedaInferencias/WheelSpinner.tsx` | Exercise-specific | Not a loading component -- exercise mechanic |

### 2.2 Duplicate Skeleton Systems

There are **two competing Skeleton systems**:

| System | Location | Theme | Components |
|--------|----------|-------|------------|
| **A: Generic** | `shared/components/Skeleton.tsx` | Raw Tailwind (`bg-gray-200 animate-pulse`) | Skeleton, SkeletonText, SkeletonAvatar, SkeletonCard, SkeletonStats, SkeletonAchievement, SkeletonTable |
| **B: Detective** | `shared/components/loading/SkeletonCard.tsx` | Detective theme (`bg-detective-bg-secondary`, `bg-detective-border`) | SkeletonCard, SkeletonStats, SkeletonList, SkeletonTable |

**Overlap:** Both export `SkeletonCard`, `SkeletonStats`, and `SkeletonTable` with different APIs and styling. Import confusion is likely.

### 2.3 Inline Loading Patterns (No Shared Component)

**48 files** use raw `animate-pulse` or `skeleton` CSS classes directly in JSX, bypassing shared components.

| Portal | Files with inline skeleton/animate-pulse | Example Files |
|--------|------------------------------------------|---------------|
| **Student** | 14 | `StatsGrid.tsx`, `MLCoinsWidget.tsx`, `ModulesSection.tsx`, `RecentActivityPanel.tsx`, `AchievementGrid.tsx`, `AssignmentsPage.tsx`, `ModuleDetailPage.tsx` |
| **Teacher** | 10 | `TeacherDashboardHero.tsx`, `ClassroomsGrid.tsx`, `PendingSubmissionsList.tsx`, `StudentAlerts.tsx`, `RecentAssignmentsList.tsx`, `ResponsesTable.tsx`, `TeacherCommunication.tsx` |
| **Admin** | 10 | `SystemMetricsGrid.tsx`, `AdminDashboardHero.tsx`, `AlertsList.tsx`, `AlertsStats.tsx`, `RolesTable.tsx`, `InstitutionStats.tsx`, `OverviewView.tsx`, `StudentDetailView.tsx` |
| **Features** | 14 | Various mechanics exercises, gamification components, leaderboard components |

### 2.4 Inline Spinner Patterns (Raw CSS, No Component)

**40+ files** use inline `animate-spin` spinners directly rather than importing `LoadingSpinner`:

```
// Common pattern found in many pages:
<div className="h-8 w-8 animate-spin rounded-full border-b-2 border-detective-orange"></div>
```

| Portal | Files with inline spinners | Notable |
|--------|---------------------------|---------|
| **Student** | 8 | `LearningPage.tsx`, `AssignmentDetailPage.tsx`, settings sections |
| **Teacher** | 14 | Most teacher pages have inline spinners rather than shared component |
| **Admin** | 12 | Dashboard, gamification, content management pages |
| **Parent** | 1 | `ParentDashboardPage.tsx` |

### 2.5 Loading State Approach Per Portal

| Portal | Uses Skeleton Components | Uses Inline Skeletons | Uses Inline Spinners | Uses LoadingOverlay | Uses LoadingSpinner |
|--------|------------------------|-----------------------|---------------------|--------------------|--------------------|
| **Student** | Some (dashboard widgets) | 14 files | 8 files | No | No |
| **Teacher** | Rare | 10 files | 14 files | No | No |
| **Admin** | Rare | 10 files | 12 files | No | No |
| **Parent** | No | 0 files | 1 file | No | No |

**Conclusion:** Shared loading components (`LoadingSpinner`, `LoadingOverlay`, `Skeleton.*`) are **largely unused**. Most portals implement loading states with inline Tailwind CSS.

---

## 3. Empty State Patterns

### 3.1 Empty State Discovery

**163 files** contain "no data" type messages. Common patterns found:

### 3.2 Pattern Categories

| Pattern | Count | Description |
|---------|-------|-------------|
| **Icon + Text + Action Button** | ~15 | Full empty state with lucide icon, descriptive text, and CTA |
| **Icon + Text only** | ~35 | Icon and message, no action |
| **Text only** | ~80+ | Simple `<p>` or `<div>` with message |
| **Conditional full component** | ~20 | Entire section hidden or replaced |
| **Table-specific empty row** | ~13 | Empty `<tr>` or message in table body |

### 3.3 Per-Portal Empty State Examples

**Student Portal (notable files):**

| File | Empty State Pattern | Style |
|------|-------------------|-------|
| `MissionsPage.tsx` | Icon (Target) + "No hay misiones activas" + description | Detective card, centered |
| `AchievementsPage.tsx` | Icon + "No has desbloqueado logros aun" | Detective-themed |
| `ShopPage.tsx` | Icon + "No hay items disponibles" | Inline in grid |
| `InventoryPage.tsx` | Icon + "Tu inventario esta vacio" + CTA to shop | Full card with button |
| `AssignmentsPage.tsx` | Icon + "No tienes tareas asignadas" | Centered card |
| `NotificationsPage.tsx` | Bell icon + "No tienes notificaciones" | Detective card |
| `FriendsPage.tsx` | Users icon + "No tienes amigos aun" + search CTA | Tab-specific |
| `ModulesSection.tsx` (dashboard) | "No se encontraron modulos" | Inline text |

**Teacher Portal (notable files):**

| File | Empty State Pattern | Style |
|------|-------------------|-------|
| `ClassroomsGrid.tsx` | Building icon + "No tienes aulas creadas" + Create button | Detective card, centered |
| `PendingSubmissionsList.tsx` | CheckCircle + "No hay entregas pendientes" | Green-tinted card |
| `StudentAlerts.tsx` | Shield + "No hay alertas activas" | Calm tone |
| `RecentAssignmentsList.tsx` | "No se encontraron tareas recientes" | Inline text |
| `AssignmentList.tsx` | "No se encontraron asignaciones" | Inline text |
| `ConversationsList.tsx` | "No hay conversaciones" | Inline text |
| `ReviewList.tsx` | "No hay revisiones pendientes" | Inline text |
| `ResponsesTable.tsx` | "No se encontraron respuestas" | Table row |
| `TeacherStudents.tsx` | "No se encontraron estudiantes" | Inline text |

**Admin Portal (notable files):**

| File | Empty State Pattern | Style |
|------|-------------------|-------|
| `AlertsList.tsx` | Shield icon + "No hay alertas" + description | Detective card |
| `UsersTable.tsx` | "No se encontraron usuarios" | Table row |
| `RolesTable.tsx` | "No hay roles configurados" | Table row |
| `ReportsList.tsx` | "No hay reportes generados" | Card text |
| `InstitutionsTable.tsx` | "No se encontraron instituciones" | Table row |
| `AssignmentsTable.tsx` | "No se encontraron asignaciones" | Table row |
| `AuditLogTable.tsx` | "No se encontraron registros de auditoria" | Table row |

### 3.4 Inconsistencies Found

| Issue | Description |
|-------|-------------|
| **Language mix** | Most empty states are in Spanish, but some use English ("No data available", "No results found") |
| **No shared EmptyState component** | Each file implements its own empty state layout |
| **Inconsistent icons** | Different icons for same concept (Inbox vs. FileX vs. AlertCircle for "no data") |
| **Missing empty states** | Several pages have no empty state at all -- they show blank space when data is empty |
| **Action button inconsistency** | Some empty states include CTAs, most don't; no standard pattern |
| **Style variation** | Some use detective-theme, others use raw gray Tailwind, some use no special styling |

---

## 4. Form Validation Patterns

### 4.1 Pattern Overview

| Pattern | Files | Portals |
|---------|-------|---------|
| **react-hook-form + Zod** | 10 | Auth (3), Teacher (2), Admin (3), Features (2) |
| **react-hook-form (no Zod)** | 2 | Admin (GeneralSettings, SecuritySettings) |
| **Manual useState validation** | 15+ | All portals |
| **Inline guards only** (`if (!field) return`) | 10+ | Teacher, Admin |
| **Native HTML `required`** | 26 files | Mostly as supplement to other patterns |

### 4.2 Forms Using react-hook-form + Zod (Best Practice)

| Component | File | Zod Schema Location |
|-----------|------|-------------------|
| `LoginForm` | `features/auth/components/LoginForm.tsx` | `shared/schemas/auth.schemas.ts` |
| `RegisterForm` | `features/auth/components/RegisterForm.tsx` | `shared/schemas/auth.schemas.ts` |
| `ForgotPasswordPage` | `pages/auth/ForgotPasswordPage.tsx` | `shared/schemas/auth.schemas.ts` |
| `PasswordResetPage` | `apps/student/pages/PasswordResetPage.tsx` | Inline `z.object` |
| `CreateClassroomModal` | `apps/teacher/components/dashboard/CreateClassroomModal.tsx` | Inline `z.object` |
| `CreateAssignmentModal` | `apps/teacher/components/dashboard/CreateAssignmentModal.tsx` | Inline `z.object` |
| `BrandingSettingsPage` | `features/admin/branding/BrandingSettingsPage.tsx` | Inline `z.object` |
| `LtiConsumerForm` | `features/admin/lti/components/LtiConsumerForm.tsx` | Uses `useForm` (no zodResolver visible) |

**Zod schema files (standalone):** 30 files exist across `features/mechanics/*/schemas/` for exercise data validation. These are used by the exercise submission system, not by forms directly.

### 4.3 Forms Using react-hook-form WITHOUT Zod

| Component | File | Validation |
|-----------|------|------------|
| `GeneralSettings` | `apps/admin/components/settings/GeneralSettings.tsx` | `useForm` with `register()` only, no schema validation |
| `SecuritySettings` | `apps/admin/components/settings/SecuritySettings.tsx` | `useForm` with `register()` only, no schema validation |

### 4.4 Forms Using Manual useState Validation

| Component | File | Validation Method |
|-----------|------|-------------------|
| `ParentRegisterPage` | `apps/parent/pages/ParentRegisterPage.tsx` | `validateForm()` function with manual field checks, `setValidationErrors()` |
| `ParentLoginPage` | `apps/parent/pages/ParentLoginPage.tsx` | Inline `if (!email || !password)` guard |
| `CreateUserModal` | `apps/admin/components/users/CreateUserModal.tsx` | Manual state + `setError()` on failure |
| `ResolveAlertModal` | `apps/admin/components/alerts/ResolveAlertModal.tsx` | `note.trim().length >= 10` guard + `setError()` |
| `AcknowledgeAlertModal` | `apps/admin/components/alerts/AcknowledgeAlertModal.tsx` | Similar to ResolveAlertModal |
| `MessageComposer` | `apps/teacher/components/communication/MessageComposer.tsx` | `if (!subject.trim() \|\| !content.trim()) return` |
| `AnnouncementForm` | `apps/teacher/components/communication/AnnouncementForm.tsx` | `if (!selectedClassroomId \|\| !subject.trim()) return` |
| `FeedbackForm` | `apps/teacher/components/communication/FeedbackForm.tsx` | `if (!content.trim()) return` |
| `SuspendStudentModal` | `apps/teacher/components/monitoring/SuspendStudentModal.tsx` | Manual state + inline guard |
| `GradeSubmissionModal` | `apps/teacher/components/dashboard/GradeSubmissionModal.tsx` | Manual state + inline guard |
| `AssignmentCreator` | `apps/teacher/components/assignments/AssignmentCreator.tsx` | Manual multi-step validation with `setError()` |
| `InstitutionFormModals` | `apps/admin/components/institutions/InstitutionFormModals.tsx` | Manual state + inline guards |
| `FeatureFlagEditor` | `apps/admin/components/advanced/FeatureFlagEditor.tsx` | Inline guards |
| `ReportGenerationForm` | `apps/admin/components/reports/ReportGenerationForm.tsx` | Inline guards |
| `ParameterEditModal` | `apps/admin/components/gamification/ParameterEditModal.tsx` | Manual state + number validation |

### 4.5 Per-Portal Form Summary

| Portal | RHF+Zod | RHF (no Zod) | Manual useState | Inline Guards Only |
|--------|---------|--------------|-----------------|-------------------|
| **Student** | 1 (PasswordReset) | 0 | 0 | 0 |
| **Teacher** | 2 (CreateClassroom, CreateAssignment) | 0 | 6 | 3 |
| **Admin** | 1 (Branding via features) | 2 (General, Security) | 6 | 3 |
| **Parent** | 0 | 0 | 2 (Register, Login) | 0 |
| **Auth (shared)** | 3 (Login, Register, ForgotPwd) | 0 | 0 | 0 |
| **Features** | 1 (LTI) | 0 | 0 | 0 |

### 4.6 Form Pattern Issues

| Issue | Severity | Description |
|-------|----------|-------------|
| **Parent portal has no Zod validation** | HIGH | Registration form uses manual validation -- prone to inconsistency with auth forms |
| **Teacher communication forms have no real validation** | MEDIUM | MessageComposer, AnnouncementForm, FeedbackForm only check non-empty |
| **Admin settings use RHF without Zod** | LOW | GeneralSettings and SecuritySettings miss schema validation |
| **No shared form components** | HIGH | No reusable FormField, FormError, FormGroup components |
| **Error display inconsistency** | MEDIUM | RHF forms show field-level errors, manual forms show form-level errors or nothing |
| **Inline vs. external schemas** | LOW | Some forms define Zod schemas inline, auth forms use external schema files |

---

## 5. Toast Notification Patterns

### 5.1 Library

**Single library:** `react-hot-toast` (no Sonner, no React-Toastify)

**Toaster configuration** in `App.tsx`:
- Position: `top-right`
- Duration: success=3000ms, error=4000ms, default=4000ms
- Style: dark background (`#333`), white text
- Success icon: green (`#10b981`)
- Error icon: red (`#ef4444`)

### 5.2 Import Count Per Portal

| Portal | Files Importing toast | Total `toast.*` Calls |
|--------|----------------------|----------------------|
| **Student** | 6 | 21 |
| **Teacher** | 16 | 65 |
| **Admin** | 12 | 77 |
| **Parent** | 0 | 0 |
| **Features (shared)** | 8 | 37 |
| **TOTAL** | **42** | **200** |

### 5.3 Toast Usage Patterns

| Pattern | Count | Example |
|---------|-------|---------|
| `toast.success('Message')` | ~95 | `toast.success('Configuracion actualizada exitosamente')` |
| `toast.error('Message')` | ~105 | `toast.error('Error al actualizar la configuracion')` |
| `toast.loading('Message')` | ~5 | `toast.loading('Generando reporte...')` |
| `toast.promise(fn, {...})` | ~3 | Used in exercise submission |
| `toast('Message')` | ~2 | Plain info toast (rare) |

### 5.4 Toast Consistency Issues

| Issue | Description |
|-------|-------------|
| **Parent portal: zero toast** | All operations in parent portal either silently succeed or show inline errors only |
| **Language inconsistency** | ~90% Spanish messages, ~10% English ("Error occurred", "Something went wrong") |
| **Message format varies** | Some include details (`Error al crear: ${err.message}`), others are generic ("Error al procesar") |
| **No toast wrapper/utility** | Each file calls `toast.success/error` directly; no centralized `showSuccess()` / `showError()` helper |
| **No toast for read failures** | Data loading failures typically show inline errors, never toasts (inconsistent with write ops) |
| **Duplicate error notification** | Some files show BOTH toast.error AND inline error state for same failure |

### 5.5 Top Toast-Heavy Files

| File | toast Calls | Notes |
|------|-------------|-------|
| `useContentQueries.ts` (admin) | 22 | Every mutation has success + error toast |
| `TeacherSettings.tsx` | 16 | Multiple setting sections, each with toast |
| `useGamificationConfig.ts` (admin) | 11 | Config CRUD operations |
| `BrandingSettingsPage.tsx` | 11 | Save colors, logos, favicons |
| `ProfileSettings.tsx` (admin) | 10 | Profile update + password change |
| `TeacherContentManagement.tsx` | 9 | Content CRUD |
| `useClassroomTeacher.ts` (admin) | 8 | Assignment/unassignment operations |

---

## 6. Confirmation Dialog Patterns

### 6.1 Shared ConfirmDialog Component

A well-designed `ConfirmDialog` exists at `shared/components/common/ConfirmDialog.tsx`:
- 4 variants: `danger`, `warning`, `info`, `success`
- Uses `Modal` base component
- Supports loading state
- Spanish default text ("Confirmar", "Cancelar")
- Accessible with icon per variant

### 6.2 ConfirmDialog Usage

Only **4 files** import and use the shared `ConfirmDialog`:

| File | Usage |
|------|-------|
| `apps/admin/pages/AdminUsersPage.tsx` | Delete user confirmation |
| `apps/admin/hooks/useUserActions.ts` | User action confirmations |
| `apps/admin/components/institutions/InstitutionFormModals.tsx` | Delete institution |
| `apps/teacher/pages/TeacherClasses.tsx` | Delete classroom |

### 6.3 Files Using `window.confirm()` Instead

**9 instances** of `window.confirm()` bypass the shared dialog:

| File | Action | Portal |
|------|--------|--------|
| `ExerciseContext.tsx` | Skip exercise | Shared |
| `LegacyExercisePage.tsx` | Skip exercise | Student |
| `DeviceManagementSection.tsx` | Revoke device session | Student |
| `RecentAssignmentsList.tsx` | Close assignment | Teacher |
| `ClassroomCard.tsx` | Delete classroom | Teacher |
| `AdminAlertsPage.tsx` | Dismiss all alerts | Admin |
| `ABTestingDashboard.tsx` | Declare A/B test winner | Admin |
| `FeatureFlagsPanel.tsx` | Delete feature flag | Admin |
| `ReviewDetail.tsx` | (Comment only -- noted as TODO to replace) | Teacher |

### 6.4 Other Confirmation Patterns

| File | Pattern | Portal |
|------|---------|--------|
| `RestoreDefaultsDialog.tsx` | Custom inline confirmation modal | Admin |
| `BulkUpdateDialog.tsx` | Custom inline confirmation modal | Admin |
| `ParameterEditModal.tsx` | Custom inline confirmation | Admin |
| `ContentVersionControl.tsx` | Custom inline confirmation | Admin |
| `MediaLibraryManager.tsx` | Custom inline confirmation | Admin |
| `ShopPage.tsx` | Purchase confirmation inline | Student |
| `GuildsPage.tsx` | Leave guild confirmation inline | Student |
| `FriendsPage.tsx` | Unfriend confirmation inline | Student |
| `PrestigeSystem.tsx` | Prestige reset confirmation | Features |
| `SessionsList.tsx` | Revoke session confirmation | Features |

### 6.5 Confirmation Issues

| Issue | Severity | Description |
|-------|----------|-------------|
| **Widespread `window.confirm()` usage** | HIGH | 9 instances of native browser dialogs in production code |
| **ConfirmDialog severely underutilized** | HIGH | Only 4 of 36+ confirmation-needing locations use it |
| **Custom confirmation modals** | MEDIUM | Admin portal has 5+ custom confirmation modals instead of using shared `ConfirmDialog` |
| **No confirmation on some destructive actions** | HIGH | Some delete operations proceed without any confirmation |
| **Language inconsistency in confirms** | MEDIUM | window.confirm messages mix English and Spanish |

---

## 7. Summary & Recommendations

### 7.1 Current State Matrix

| Aspect | Student | Teacher | Admin | Parent | Consistency |
|--------|---------|---------|-------|--------|-------------|
| Error Boundaries | None wrapping portal | None wrapping portal | None wrapping portal | None wrapping portal | Consistent (bad) |
| Toast Notifications | 6 files (21 calls) | 16 files (65 calls) | 12 files (77 calls) | **0 files** | INCONSISTENT |
| Error State Display | Inline `{error && ...}` | Inline + toast | Inline + toast | Inline only | INCONSISTENT |
| Loading: Skeleton | Some (dashboard) | Rare | Rare | None | INCONSISTENT |
| Loading: Inline spinner | 8 files | 14 files | 12 files | 1 file | Consistent (bad) |
| Forms: RHF + Zod | 1 form | 2 forms | 1 form | 0 forms | INCONSISTENT |
| Forms: Manual validation | 0 | 6 forms | 6 forms | 2 forms | Mixed |
| ConfirmDialog | 0 usages | 1 usage | 3 usages | 0 usages | Under-utilized |
| window.confirm | 2 | 2 | 3 | 0 | Should be 0 |
| API Error Handler | Used in feature APIs | NOT used in teacher APIs | Partially used | Used via parentAPI | INCONSISTENT |

### 7.2 Critical Issues (Priority Order)

| # | Issue | Impact | Files Affected |
|---|-------|--------|----------------|
| 1 | **No ErrorBoundary wrapping any portal routes** | Unhandled render errors crash entire app | All portals (~70 pages) |
| 2 | **Parent portal has zero toast notifications** | Users get no feedback on actions | 5 parent pages |
| 3 | **Teacher API services bypass centralized error handler** | Two parallel error strategies, inconsistent error objects | 13 teacher API files |
| 4 | **9 `window.confirm()` calls in production** | Breaks UI consistency, not i18n-able, ugly | 8 files |
| 5 | **Two competing Skeleton systems** with overlapping exports | Import confusion, inconsistent visual | 2 files defining duplicates |
| 6 | **40+ files with inline spinners** instead of shared component | Maintenance burden, visual inconsistency | ~40 files |
| 7 | **No shared EmptyState component** | 163 files each implement their own | 163 files |
| 8 | **No shared FormField / form components** | Validation display varies per form | ~25 form files |
| 9 | **Parent portal forms use manual validation while auth uses Zod** | Registration validates differently than login | 2 parent forms |
| 10 | **Language mix in error messages and empty states** | Spanish/English inconsistency | ~30 files |

### 7.3 Recommended Standard Components to Create

| Component | Purpose | Priority |
|-----------|---------|----------|
| `PortalErrorBoundary` | Wrap each portal's route tree, show themed error page | P0 |
| `EmptyState` | Shared icon + text + optional CTA component | P0 |
| `FormField` / `FormGroup` | Wrapper for label + input + error display | P1 |
| `showToast()` utility | Centralized toast helper with i18n-ready messages | P1 |
| Consolidate Skeletons | Merge `Skeleton.tsx` and `loading/SkeletonCard.tsx` into one detective-themed system | P1 |
| Eliminate `window.confirm()` | Replace all 9 instances with `ConfirmDialog` | P1 |
| Migrate teacher APIs to `handleAPIError()` | Unify error handling across all API services | P2 |
| Migrate parent forms to RHF + Zod | Align with auth form patterns | P2 |

### 7.4 Files Summary

| Metric | Count |
|--------|-------|
| Files with try/catch blocks | 277 |
| Files with toast calls | 44 |
| Files with inline skeleton/pulse | 48 |
| Files with inline spinners | 40+ |
| Files with empty state messages | 163 |
| Files with form submissions | 25 |
| Files using react-hook-form | 10 |
| Files using Zod schemas | 43 (30 exercise schemas, 13 form schemas) |
| Files using ConfirmDialog | 4 |
| Files using window.confirm | 8 |
| ErrorBoundary components | 2 (both unused in routes) |
| Loading components (shared) | 5 (LoadingSpinner, LoadingOverlay, Skeleton, SkeletonCard, ExerciseLoadingSkeleton) |

---

*Generated by audit analysis of `apps/frontend/src/` — 2026-02-19*
