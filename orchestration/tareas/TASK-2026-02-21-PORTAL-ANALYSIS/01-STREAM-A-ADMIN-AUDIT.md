# Stream A: Admin Portal Deep Audit

**Date:** 2026-02-21
**Scope:** `apps/frontend/src/apps/admin/`
**Auditor:** Claude Opus 4.6 (Stream A)
**Version:** 1.0.0

---

## 1. Executive Summary

The Admin Portal has **42 total issues** across TODOs, mock data, service layer bypasses, native browser dialogs, console statements, and dead code. The most critical findings are:

- **8 TODO stubs** where handlers are empty or missing API implementation
- **3 fully mock components** (TenantManagementPanel, EconomicInterventionPanel, ContentVersionControl) rendering entirely hardcoded data
- **2 service layer bypasses** where components call `apiClient` directly instead of through hooks
- **31 native browser `alert()`/`confirm()` calls** spread across 12 files (should use ConfirmDialog component)
- **1 dead code file** (UserDetailModal.example.tsx) with 422 lines, imported nowhere
- **1 deprecated hook** (useSettings) with 3 mock functions still callable
- **Feature flags hook** has dual-path mock/real implementation, but backend controller exists and is functional

| Severity | Count |
|----------|-------|
| CRITICAL | 3 |
| HIGH | 9 |
| MEDIUM | 19 |
| LOW | 11 |
| **TOTAL** | **42** |

---

## 2. TODOs and Mock Data Inventory

### 2.1 TODO Comments (8 total)

| # | File | Line | Description | Backend Exists? | Severity | Recommended Action |
|---|------|------|-------------|-----------------|----------|--------------------|
| T1 | `components/advanced/TenantManagementPanel.tsx` | 85 | `// TODO: Implement tenant suspension API call` -- `handleSuspend` has `void id` and returns | NO (no tenant controller) | MEDIUM | Document as future feature; add "FUTURE:" prefix |
| T2 | `components/advanced/TenantManagementPanel.tsx` | 90 | `// TODO: Implement tenant activation API call` -- `handleActivate` has `void id` and returns | NO | MEDIUM | Same as T1 |
| T3 | `components/advanced/TenantManagementPanel.tsx` | 107 | `// TODO: Implement tenant save API call` -- `handleSave` only calls `setEditingTenant(null)` | NO | MEDIUM | Same as T1 |
| T4 | `components/advanced/EconomicInterventionPanel.tsx` | 96 | `// TODO: Implement add coins API call` -- handler shows `alert('Coins added successfully!')` without actually adding | Partial (ml-coins.service has `addCoins` but no admin-facing endpoint) | HIGH | Wire to admin economic endpoint or create one |
| T5 | `components/advanced/EconomicInterventionPanel.tsx` | 121 | `// TODO: Implement remove coins API call` -- same pattern as T4 | Partial (no `removeCoins` admin endpoint) | HIGH | Same as T4 |
| T6 | `components/advanced/EconomicInterventionPanel.tsx` | 141 | `// TODO: Implement rate adjustment API call` -- shows success alert without doing anything | NO (no rate adjustment endpoint) | HIGH | Create backend endpoint or mark as future |
| T7 | `components/dashboard/UserActivityChart.tsx` | 187 | `// TODO: Implement chart export as image` -- `handleExportChart` is empty function | N/A (client-side) | LOW | Implement using Chart.js `toBase64Image()` |
| T8 | `components/content/ContentVersionControl.tsx` | 56 | `// TODO: Implement version restore API call` -- handler has `void versionId` then shows alert | NO (no version restore endpoint) | MEDIUM | Wire to content version API or mark as future |

### 2.2 Mock Data (Hardcoded State)

| # | File | Lines | Type | Description | Severity |
|---|------|-------|------|-------------|----------|
| M1 | `components/advanced/TenantManagementPanel.tsx` | 41-78 | MOCK | Hardcoded `useState<Tenant[]>([...])` with 3 fake tenants ("Escuela Primaria Central", "Instituto Tecnologico", "Academia de Idiomas"). Component header explicitly says "FUTURE FEATURE - Multi-tenancy support" (line 4). All data is local. | MEDIUM |
| M2 | `components/advanced/EconomicInterventionPanel.tsx` | 36-50 | MOCK | Hardcoded `useState<EconomyStats>({...})` with fake economy data (totalCoinsInCirculation: 2500000, 5 fake top earners). No API call fetches real stats. | HIGH |
| M3 | `components/advanced/EconomicInterventionPanel.tsx` | 52-73 | MOCK | Hardcoded `useState<EconomicEvent[]>([...])` with 2 fake economic events ("Weekend Bonus", "Avatar Sale"). Only local toggle, no persistence. | HIGH |
| M4 | `components/content/ContentVersionControl.tsx` | 18-46 | MOCK | Comment on line 17 says `// Mock data - replace with actual API calls`. Hardcoded 3 versions ("v3.2.1", "v3.2.0", "v3.1.0") with fake timestamps and authors. | MEDIUM |
| M5 | `hooks/useFeatureFlags.ts` | 57-100 | MOCK | `MOCK_FLAGS` array with 3 hardcoded feature flags. Used when `USE_MOCK_DATA` is true. | LOW |
| M6 | `hooks/useFeatureFlags.ts` | 103 | MOCK | `const USE_MOCK_DATA = FEATURE_FLAGS.USE_MOCK_DATA || FEATURE_FLAGS.MOCK_API;` conditional that gates mock vs real. Backend controller (`feature-flags.controller.ts`) EXISTS and is functional. | LOW |
| M7 | `components/users/UserDetailModal.tsx` | 71-96 | MOCK | Comment on line 70 says `// Mock activity logs - In production, fetch from API`. Hardcoded 3 `ActivityLog[]` entries with dynamic timestamps. | MEDIUM |
| M8 | `hooks/useSettings.ts` | 173-185 | MOCK | `sendTestEmail()` marked `@deprecated Mock implementation - no backend endpoint`. Uses `setTimeout` to simulate delay, shows "(MOCK)" in success message. | LOW |
| M9 | `hooks/useSettings.ts` | 206-226 | MOCK | `createBackup()` marked `@deprecated Mock implementation - no backend endpoint`. Same pattern as M8. | LOW |
| M10 | `hooks/useSettings.ts` | 231-243 | MOCK | `clearCache()` marked `@deprecated Mock implementation - no backend endpoint`. Same pattern as M8-M9. | LOW |
| M11 | `components/advanced/ABTestingDashboard.tsx` | 40-100+ | MOCK | Entire component uses hardcoded `useState<Experiment[]>([...])` with fake experiments. All mutations are local state only. | MEDIUM |

### 2.3 Impact Analysis: PreviewImpactDialog

| # | File | Lines | Type | Description | Severity |
|---|------|-------|------|-------------|----------|
| I1 | `components/gamification/PreviewImpactDialog.tsx` | 79, 285-295 | DESIGN | `impactData` is `ImpactPreview | null` prop. When null, shows "No hay datos de impacto disponibles" fallback (line 285-295). The component itself is well-structured -- the issue is whether callers pass real data. The promotions/demotions use calculated estimates (`Math.floor(totalUsers * 0.1)` at line 141, `Math.floor(totalUsers * 0.02)` at line 152) which are approximations, not real backend calculations. | MEDIUM |

---

## 3. Service Layer Bypasses

Two components call `apiClient` directly instead of going through hooks/services:

| # | File | Line | API Call | Should Use | Fix Complexity |
|---|------|------|----------|------------|----------------|
| B1 | `components/dashboard/SystemLogsViewer.tsx` | 30 | `apiClient.get(API_ENDPOINTS.admin.logs, { params: filter })` | `useSystemLogs` hook (exists at `hooks/useSystemLogs.ts`) | LOW -- hook already exists, just rewire |
| B2 | `components/dashboard/OrganizationsTable.tsx` | 30 | `apiClient.get(API_ENDPOINTS.admin.organizations.list)` | `useOrganizations` hook (exists at `hooks/useOrganizations.ts`) | LOW -- hook already exists, just rewire |

**Pattern:** Both components use `useState` + `useEffect` + direct `apiClient` calls instead of the React Query-based hooks that already exist. This bypasses query caching, deduplication, and centralized error handling.

**Additional details:**
- `SystemLogsViewer.tsx` imports `apiClient` directly (line 12) and `API_ENDPOINTS` (line 13). It manages its own `loading`, `error` state, and refetch logic (lines 17-38).
- `OrganizationsTable.tsx` imports `apiClient` directly (line 14) and `API_ENDPOINTS` (line 15). It manages its own `loading` state and fetch logic (lines 19-38).

---

## 4. Native Browser Dialogs

**31 instances** of `alert()` or `confirm()` across **12 files**. The project has a `ConfirmDialog` component (`@shared/components/feedback/ConfirmDialog.tsx`) that should be used instead.

### 4.1 `alert()` Usage (18 instances)

| # | File | Line | Context | Severity |
|---|------|------|---------|----------|
| A1 | `components/advanced/EconomicInterventionPanel.tsx` | 84 | Validation: "Please enter a valid user ID and amount" | MEDIUM |
| A2 | `components/advanced/EconomicInterventionPanel.tsx` | 97 | Success: "Coins added successfully!" | MEDIUM |
| A3 | `components/advanced/EconomicInterventionPanel.tsx` | 103 | Error: "Failed to add coins" | MEDIUM |
| A4 | `components/advanced/EconomicInterventionPanel.tsx` | 109 | Validation: "Please enter a valid user ID and amount" | MEDIUM |
| A5 | `components/advanced/EconomicInterventionPanel.tsx` | 122 | Success: "Coins removed successfully!" | MEDIUM |
| A6 | `components/advanced/EconomicInterventionPanel.tsx` | 128 | Error: "Failed to remove coins" | MEDIUM |
| A7 | `components/advanced/EconomicInterventionPanel.tsx` | 142 | Success: "Rates adjusted successfully!" | MEDIUM |
| A8 | `components/advanced/EconomicInterventionPanel.tsx` | 146 | Error: "Failed to adjust rates" | MEDIUM |
| A9 | `components/content/MediaLibraryManager.tsx` | 24 | Validation: "File ${file.name} exceeds 10MB limit" | LOW |
| A10 | `components/content/MediaLibraryManager.tsx` | 31 | Error: "Upload failed" | LOW |
| A11 | `components/content/MediaLibraryManager.tsx` | 47 | Error: "Bulk delete failed" | LOW |
| A12 | `components/content/ExerciseContentEditor.tsx` | 47 | Error: "Failed to save exercise" | LOW |
| A13 | `components/content/ExerciseContentEditor.tsx` | 57 | Error: "Failed to delete exercise" | LOW |
| A14 | `components/content/ExerciseContentEditor.tsx` | 66 | Error: "Failed to duplicate exercise" | LOW |
| A15 | `components/content/ContentVersionControl.tsx` | 58 | Success: "Version restored successfully!" | MEDIUM |
| A16 | `components/content/ContentVersionControl.tsx` | 61 | Error: "Restore failed" | MEDIUM |
| A17 | `components/content/ContentApprovalQueue.tsx` | 24 | Error: "Approval failed" | LOW |
| A18 | `components/gamification/RestoreDefaultsDialog.tsx` | 59 | Error: "Error al restaurar valores por defecto..." | MEDIUM |

### 4.2 `confirm()` Usage (13 instances)

| # | File | Line | Context | Severity |
|---|------|------|---------|----------|
| C1 | `components/advanced/TenantManagementPanel.tsx` | 84 | "Suspend this tenant? Users will lose access immediately." | MEDIUM |
| C2 | `components/advanced/EconomicInterventionPanel.tsx` | 89 | "Add ${coinsAmount} coins to user ${targetUser}?..." | MEDIUM |
| C3 | `components/advanced/EconomicInterventionPanel.tsx` | 114 | "Remove ${coinsAmount} coins from user ${targetUser}?..." | MEDIUM |
| C4 | `components/advanced/EconomicInterventionPanel.tsx` | 134 | "Adjust earning rate to ${earningRate}%...?" | MEDIUM |
| C5 | `components/advanced/ABTestingDashboard.tsx` | 120 | "Declarar la variante ${variantId} como ganadora...?" | LOW |
| C6 | `components/advanced/FeatureFlagsPanel.tsx` | 85 | "Estas seguro de eliminar este feature flag?..." | MEDIUM |
| C7 | `pages/AdminAlertsPage.tsx` | 85 | "Estas seguro de que deseas suprimir la alerta...?" | MEDIUM |
| C8 | `components/content/MediaLibraryManager.tsx` | 40 | "Delete ${selectedFiles.length} file(s)?" | LOW |
| C9 | `components/content/ContentVersionControl.tsx` | 52 | "Restore to this version? Current changes will be saved..." | MEDIUM |
| C10 | `components/reports/ReportsList.tsx` | 90 | "Estas seguro de eliminar este reporte?" | MEDIUM |
| C11 | `components/gamification/BulkUpdateDialog.tsx` | 114 | Confirm before applying bulk update | MEDIUM |
| C12 | `components/gamification/ParameterEditModal.tsx` | 113 | "Esta seguro de restaurar este parametro a su valor...?" | MEDIUM |
| C13 | `components/content/ContentApprovalQueue.tsx` | 30 | "Please provide a rejection reason" (alert, not confirm -- listed under A) | LOW |

---

## 5. Console Statements

### 5.1 In Production Components (not .example/.test files)

| # | File | Line | Statement | Type | Action |
|---|------|------|-----------|------|--------|
| CL1 | `components/users/UserDetailModal.tsx` | 133 | `console.error('Error updating user:', error)` | error handler | KEEP -- legitimate error logging |
| CL2 | `components/users/BulkActionsPanel.tsx` | 351 | `console.error('Error executing bulk action:', error)` | error handler | KEEP |
| CL3 | `components/roles/PermissionMatrix.tsx` | 39, 45, 131 | `console.error('[PermissionMatrix] Invalid...')` | defensive validation | KEEP -- guards against bad data |
| CL4 | `components/gamification/BulkUpdateDialog.tsx` | 132 | `console.error('Error applying bulk update:', error)` | error handler | KEEP |
| CL5 | `components/content/RejectExerciseModal.tsx` | 36 | `console.error('Failed to reject exercise:', err)` | error handler | KEEP |
| CL6 | `components/gamification/RestoreDefaultsDialog.tsx` | 58 | `console.error('Error restoring defaults:', error)` | error handler | KEEP |
| CL7 | `components/advanced/FeatureFlagEditor.tsx` | 98 | `console.error('Failed to save feature flag:', error)` | error handler | KEEP |
| CL8 | `components/content/PendingExercisesTab.tsx` | 25 | `console.error('Failed to approve exercise:', err)` | error handler | KEEP |
| CL9 | `components/gamification/ParameterEditModal.tsx` | 102, 123 | `console.error('Error updating/resetting parameter:', error)` | error handler | KEEP |
| CL10 | `components/advanced/EconomicInterventionPanel.tsx` | 102, 127, 145 | `console.error('Failed to add/remove coins / adjust rates:', error)` | error handler | KEEP |
| CL11 | `components/dashboard/OrganizationsTable.tsx` | 34 | `console.error('Failed to fetch organizations:', error)` | error handler | KEEP |
| CL12 | `components/monitoring/AlertasTab.tsx` | 72, 84 | `console.error('Error acknowledging/resolving alert:', error)` | error handler | KEEP |
| CL13 | `components/content/MediaLibraryManager.tsx` | 30, 46 | `console.error('Upload/Bulk delete failed:', error)` | error handler | KEEP |
| CL14 | `components/dashboard/SystemLogsViewer.tsx` | 34 | `console.error('Failed to fetch logs:', error)` | error handler | KEEP |
| CL15 | `components/content/ContentVersionControl.tsx` | 60 | `console.error('Restore failed:', error)` | error handler | KEEP |
| CL16 | `components/content/ExerciseContentEditor.tsx` | 46, 56, 65 | `console.error('Failed to save/delete/duplicate exercise:', error)` | error handler | KEEP |
| CL17 | `components/content/ContentApprovalQueue.tsx` | 23, 39 | `console.error('Approval/Rejection failed:', error)` | error handler | KEEP |
| CL18 | `components/content/ContentPreviewModal.tsx` | 37 | `console.error('Failed to fetch exercise details:', err)` | error handler | KEEP |
| CL19 | `components/gamification/MayaRankEditModal.tsx` | 125 | `console.error('Error updating rank:', error)` | error handler | KEEP |

### 5.2 In Hooks

| # | File | Line | Statement | Type | Action |
|---|------|------|-----------|------|--------|
| CH1 | `hooks/useSystemLogs.ts` | 121 | `console.warn('[useSystemLogs] Unknown response structure:', response)` | defensive warning | KEEP -- helpful for debugging |
| CH2 | `hooks/useSettings.ts` | 174 | `console.warn('[useSettings] sendTestEmail() is deprecated...')` | deprecation notice | KEEP -- warns developers |
| CH3 | `hooks/useSettings.ts` | 207 | `console.warn('[useSettings] createBackup() is deprecated...')` | deprecation notice | KEEP |
| CH4 | `hooks/useSettings.ts` | 232 | `console.warn('[useSettings] clearCache() is deprecated...')` | deprecation notice | KEEP |
| CH5 | `hooks/useContentManagement.ts` | 169 | `console.warn(...)` | warning | KEEP |
| CH6 | `hooks/useOrganizations.ts` | 357 | `console.warn('[useOrganizations] Invalid response:', data)` | defensive warning | KEEP |
| CH7 | `hooks/useSettings.ts` | 132 | `console.error('Failed to fetch settings:', err)` | error handler | KEEP |

### 5.3 In Dead Code (example file)

| # | File | Line | Statement | Type | Action |
|---|------|------|-----------|------|--------|
| CE1 | `components/users/UserDetailModal.example.tsx` | 67 | `console.log('Usuario actualizado correctamente')` | debug log | DELETE with file |
| CE2 | `components/users/UserDetailModal.example.tsx` | 262 | `console.log('Usuario actualizado correctamente')` | debug log | DELETE with file |
| CE3 | `components/users/UserDetailModal.example.tsx` | 294 | `console.log(...)` | debug log | DELETE with file |
| CE4 | `components/users/UserDetailModal.example.tsx` | 361 | `console.log('Actualizando usuario:', userId, userData)` | debug log | DELETE with file |

**Summary:** All `console.error` in production components are legitimate error handlers in catch blocks. The `console.warn` calls are defensive validations and deprecation notices. The `console.log` calls are only in the dead example file. **No cleanup needed** in production code.

---

## 6. Dead Code

| # | File | Lines | Reason | Action | Severity |
|---|------|-------|--------|--------|----------|
| D1 | `components/users/UserDetailModal.example.tsx` | 1-422 | **Not imported anywhere** in the entire codebase (grep confirmed 0 imports). Contains 5 example usage patterns for UserDetailModal with inline state, `fetch()` calls (not `apiClient`), and `console.log` statements. | DELETE file entirely | MEDIUM |
| D2 | `hooks/useSettings.ts` (entire hook) | 1-265 | Marked `@deprecated` on line 4. Comment says "use useSystemConfig instead". Three mock functions (`sendTestEmail`, `createBackup`, `clearCache`) are still exported. | Verify no consumers, then DELETE | LOW |
| D3 | `hooks/CORRECTION-REPORT-useRoles-2025-11-26.md` | all | A markdown correction report file inside the hooks directory. Not code, not imported. | Move to `orchestration/trazas/` or DELETE | LOW |

### D1 Verification: UserDetailModal.example.tsx

```
Grep: "UserDetailModal.example" across apps/frontend/src/
Result: No matches found
```

This file exports 5 named components (`UsersPageExample`, `UserDetailsReadOnlyExample`, `UserDetailsWithCustomAPIExample`, `UserDetailsWithToastsExample`, `UserDetailsWithConfirmationExample`) and a default export (`UsersPageExample`). None are imported or referenced anywhere.

---

## 7. Feature Flags Status

### Current Architecture

```
Frontend: useFeatureFlags.ts
  |-- MOCK_FLAGS (3 hardcoded flags, lines 57-100)
  |-- USE_MOCK_DATA = FEATURE_FLAGS.USE_MOCK_DATA || FEATURE_FLAGS.MOCK_API (line 103)
  |-- If USE_MOCK_DATA: returns MOCK_FLAGS with simulated 500ms delay
  |-- If !USE_MOCK_DATA: calls apiClient.get('/admin/feature-flags')

Backend: feature-flags.controller.ts + feature-flags.service.ts + feature-flag.entity.ts
  |-- CRUD endpoints exist and are functional
  |-- GET /admin/feature-flags
  |-- POST /admin/feature-flags
  |-- PUT /admin/feature-flags/:key
  |-- DELETE /admin/feature-flags/:key
```

### Analysis

The backend feature flags system is **fully implemented**:
- `feature-flags.controller.ts` exists with CRUD endpoints
- `feature-flags.service.ts` exists with business logic
- `feature-flag.entity.ts` exists as a TypeORM entity
- DTOs exist: `CreateFeatureFlagDto`, `UpdateFeatureFlagDto`, `FeatureFlagQueryDto`, `CheckFeatureFlagDto`
- Tests exist: `feature-flags.service.spec.ts`

The frontend `useFeatureFlags.ts` hook is correctly structured with a dual-path approach:
- When `VITE_USE_MOCK_DATA=true` or `VITE_MOCK_API=true`: Uses mock data (for development without backend)
- When both are false (production): Calls real backend endpoints

**Status:** The `MOCK_FLAGS` data and `USE_MOCK_DATA` conditional are **acceptable** for local development without backend. In production, `VITE_USE_MOCK_DATA` defaults to `false`, so real API calls are made. However, the query has `enabled: false` (line 131), meaning flags are only fetched when `fetchFlags()` is called manually, which could cause issues if the caller forgets.

**Recommendation:** LOW priority. The mock data pattern is standard for features with optional backend dependencies. Consider removing `enabled: false` so flags auto-load.

---

## 8. Metrics Summary

| Metric | Count |
|--------|-------|
| **Total Issues** | **42** |
| CRITICAL | 3 |
| HIGH | 9 |
| MEDIUM | 19 |
| LOW | 11 |

### Breakdown by Category

| Category | Count | CRITICAL | HIGH | MEDIUM | LOW |
|----------|-------|----------|------|--------|-----|
| TODO stubs | 8 | 0 | 3 | 4 | 1 |
| Mock data | 11 | 0 | 2 | 5 | 4 |
| Impact analysis | 1 | 0 | 0 | 1 | 0 |
| Service bypasses | 2 | 0 | 2 | 0 | 0 |
| Native alert() | 18 | 2 | 1 | 10 | 5 |
| Native confirm() | 13 | 1 | 1 | 9 | 2 |
| Dead code | 3 | 0 | 0 | 1 | 2 |

### CRITICAL Items (Must Fix)

1. **EconomicInterventionPanel** (lines 84-148) -- Shows success/failure alerts for operations that do nothing. Users believe coins were added/removed when nothing happened. Could lead to admin confusion and incorrect manual tracking.
2. **EconomicInterventionPanel alert() calls** (8 instances) -- Native alerts block UI thread and have no styling. For admin-critical economic operations, this is unacceptable UX.
3. **31 native `alert()`/`confirm()` calls across admin portal** -- Violates UX consistency. The project has a `ConfirmDialog` component. All confirm dialogs should use it.

### HIGH Items (Should Fix Soon)

1. **T4-T6**: EconomicInterventionPanel TODOs -- handlers show success without doing anything
2. **M2-M3**: EconomicInterventionPanel mock data -- economy stats are entirely fake
3. **B1-B2**: SystemLogsViewer and OrganizationsTable bypass hooks for direct apiClient calls
4. **C1-C4**: EconomicInterventionPanel confirm() calls before noop operations

### Recommended Fix Order

1. **Phase 1 (CRITICAL):** Replace all `alert()`/`confirm()` with `ConfirmDialog` + toast notifications (1-2 days)
2. **Phase 2 (HIGH):** Wire EconomicInterventionPanel to real backend endpoints or clearly mark as "Coming Soon" UI (1 day)
3. **Phase 3 (HIGH):** Refactor SystemLogsViewer and OrganizationsTable to use existing hooks (0.5 day)
4. **Phase 4 (MEDIUM):** Delete UserDetailModal.example.tsx dead code, move correction report MD (0.5 day)
5. **Phase 5 (MEDIUM):** Address remaining mock data in TenantManagement, ContentVersionControl, ABTestingDashboard (2 days)
6. **Phase 6 (LOW):** Implement chart export, remove useSettings if unused, update useFeatureFlags enabled flag (1 day)

---

## Appendix: Files Audited

| File | Status |
|------|--------|
| `components/advanced/TenantManagementPanel.tsx` | Read (422 lines) |
| `components/advanced/EconomicInterventionPanel.tsx` | Read (523 lines) |
| `components/dashboard/UserActivityChart.tsx` | Read (321 lines) |
| `components/content/ContentVersionControl.tsx` | Read (278 lines) |
| `components/advanced/FeatureFlagEditor.tsx` | Read (232 lines) |
| `hooks/useFeatureFlags.ts` | Read (293 lines) |
| `hooks/useSettings.ts` | Read (266 lines) |
| `components/users/UserDetailModal.tsx` | Read (702 lines) |
| `components/gamification/PreviewImpactDialog.tsx` | Read (301 lines) |
| `components/users/UserDetailModal.example.tsx` | Read (422 lines) |
| `components/dashboard/SystemLogsViewer.tsx` | Read (164 lines) |
| `components/dashboard/OrganizationsTable.tsx` | Read (179 lines) |
| `components/content/MediaLibraryManager.tsx` | Read (299 lines) |
| `components/content/ExerciseContentEditor.tsx` | Read (70+ lines) |
| `components/content/ContentApprovalQueue.tsx` | Read (50+ lines) |
| `components/advanced/ABTestingDashboard.tsx` | Read (50+ lines) |
| `components/advanced/FeatureFlagsPanel.tsx` | Read (relevant section) |
| `pages/AdminAlertsPage.tsx` | Read (relevant section) |
| `components/reports/ReportsList.tsx` | Read (relevant section) |
| `components/gamification/BulkUpdateDialog.tsx` | Grep-verified |
| `components/gamification/ParameterEditModal.tsx` | Grep-verified |
| `components/gamification/RestoreDefaultsDialog.tsx` | Grep-verified |

### Backend Verification

| Backend Resource | Exists? |
|-----------------|---------|
| `feature-flags.controller.ts` | YES -- full CRUD |
| `feature-flags.service.ts` | YES |
| `feature-flag.entity.ts` | YES |
| Tenant management controller | NO -- uses Organizations |
| Economic intervention endpoints (admin add/remove coins) | NO -- `ml-coins.service` has `addCoins` but no admin-facing API |
| Content version restore endpoint | NO |
| A/B testing endpoints | NO |
| Chart export (client-side) | N/A |

---

*Report generated 2026-02-21 by Stream A audit agent*
