# Action Items — Portal Analysis

**Date:** 2026-02-21
**Source:** Streams A, B, C, D, E synthesis
**Total Items:** 42 (6 CRITICAL, 14 HIGH, 14 MEDIUM, 8 LOW)

---

## CRITICAL (6 items) — User-facing broken / 404 errors

| # | Item | Source | File(s) | Fix |
|---|------|--------|---------|-----|
| C1 | **URL mismatch: gamification preview-changes** | E6-1 | `api.config.ts` L327 | Change `/admin/gamification/preview-changes` to `/admin/gamification/settings/preview` |
| C2 | **URL mismatch: content history** | E6-2 | `api.config.ts` L283 | Change `/admin/content/history` to `/admin/content/approval-history` |
| C3 | **URL mismatch: content versions (plural/singular)** | E6-3 | `api.config.ts` L290 | Change `/admin/content/versions` to `/admin/content/version` |
| C4 | **EconomicInterventionPanel shows false success** | A-T4/T5/T6 | `EconomicInterventionPanel.tsx` L84-148 | Alert says "Coins added successfully!" but does nothing. Either wire to backend or replace with "Coming Soon" |
| C5 | **31 native alert()/confirm() calls** | A-4.1/4.2 | 12 admin files | Replace with ConfirmDialog + toast. Blocks UI thread and violates UX consistency |
| C6 | **ARIA compliance at 11%** | D-3.5 | All portals | 8/9 spot-checked pages have zero ARIA attributes. Add aria-label to interactive elements |

**Estimated effort:** 3-4 days

---

## HIGH (14 items) — Service layer bypasses / mock data / missing safety nets

### Service Layer Bypasses (7)

| # | Item | Source | File | Fix |
|---|------|--------|------|-----|
| H1 | **ReportGenerator direct apiClient** | B-SLB-1 | `teacher/reports/ReportGenerator.tsx:39` | Replace with `reportsApi.generateReport()` |
| H2 | **ClassProgressDashboard direct apiClient** | B-SLB-2 | `teacher/progress/ClassProgressDashboard.tsx:25` | Replace with `reportsApi.generateReport()` |
| H3 | **ParentCommunicationHub direct apiClient** | B-SLB-3 | `teacher/collaboration/ParentCommunicationHub.tsx:54` | Replace with `teacherMessagesApi.sendMessage()` |
| H4 | **AssignmentCreator 4x direct apiClient** | B-SLB-4 | `teacher/assignments/AssignmentCreator.tsx:54,64,73,98` | Replace with assignmentsApi/classroomsApi + fix fragile `as unknown as` cast (L62) |
| H5 | **ResponseFilters direct apiClient** | B-SLB-5 | `teacher/responses/ResponseFilters.tsx:102` | Replace with educational modules hook/service |
| H6 | **SystemLogsViewer direct apiClient** | A-B1 | `admin/dashboard/SystemLogsViewer.tsx:30` | Replace with `useSystemLogs` hook |
| H7 | **OrganizationsTable direct apiClient** | A-B2 | `admin/dashboard/OrganizationsTable.tsx:30` | Replace with `useOrganizations` hook |

### Mock Data & Safety (7)

| # | Item | Source | File | Fix |
|---|------|--------|------|-----|
| H8 | **EconomicInterventionPanel mock economy stats** | A-M2/M3 | `EconomicInterventionPanel.tsx:36-73` | Wire to real endpoint or clearly mark entire panel as "Coming Soon" |
| H9 | **Add ErrorBoundary to App.tsx** | D-3.5 | `App.tsx` | Wrap each portal route group. Currently 0% compliance, render error crashes entire app |
| H10 | **Consolidate ConfirmDialog (delete dead version)** | C-2.1 | `shared/feedback/ConfirmDialog.tsx` | Delete (0 imports). Keep `shared/common/ConfirmDialog.tsx` as canonical |
| H11 | **Migrate 21 inline confirm patterns** | C-2.3 | 19 files + 2 inline modals | Migrate to shared `ConfirmDialog` component |
| H12 | **5 frontend orphan URLs** | E-8.1 | `api.config.ts` L392,396,397,402,415 | Remove `/admin/activity`, `/admin/errors`, `/admin/metrics`, `/admin/assignments/export` (no backend) |
| H13 | **TenantManagementPanel 3 TODO stubs** | A-T1/T2/T3 | `TenantManagementPanel.tsx:85,90,107` | Change TODOs to "FUTURE:" prefix. Panel header already says "FUTURE FEATURE" |
| H14 | **Parents Portal documentation** | D-4.3 | `docs/60-portals/PORTAL-PARENTS-GUIDE.md` | Expand 2KB stub to cover 4 pages, parentAPI, parentStore |

**Estimated effort:** 5-6 days

---

## MEDIUM (14 items) — Homogenization / deduplication / standards

### Component Consolidation (6)

| # | Item | Source | Detail | Effort |
|---|------|--------|--------|--------|
| M1 | **DataTable adoption** | C-3 | 20 custom `<table>` implementations could use shared DataTable. Enhance DataTable with dark theme + pagination first | 6 days |
| M2 | **StatsCardGrid abstraction** | C-5 | 8 variants, 3 copy-paste clones (Inventory/Friends/Guild). Create shared `StatsCardGrid<T>` | 1.5 days |
| M3 | **EmptyState adoption** | C-8.3 | Shared EmptyState exists but only 4 teacher files use it. ~15 admin inline patterns | 0.5 day |
| M4 | **Inline tabs migration** | C-4.3 | 3 student/shared files with inline tabs. Migrate to shared TabBar | 0.5 day |
| M5 | **Delete dead code files (4)** | C-8.1/8.6 | 2 SaveButton copies + 1 ConfirmDialog(feedback) + 1 GamificationErrorBoundary | 5 min |
| M6 | **Delete UserDetailModal.example.tsx** | A-D1 | 422 lines, 0 imports | 5 min |

### Documentation & Standards (5)

| # | Item | Source | Detail | Effort |
|---|------|--------|--------|--------|
| M7 | **Create ADR-047: Zustand + React Query state architecture** | D-5.3 | Formalize pattern already in use | 1 hr |
| M8 | **Create ADR-048: Component sharing strategy** | D-5.3 | Define shared/ vs features/ vs apps/portal/ rules | 1 hr |
| M9 | **Create ADR-049: ConfirmDialog consolidation** | D-5.3 | Document canonical version decision | 30 min |
| M10 | **Admin API Reference doc** | D-4.3 | Create `PORTAL-ADMIN-API-REFERENCE.md` mirroring teacher's | 3-4 hrs |
| M11 | **Refactor oversized teacher pages** | D-3.3 | TeacherDashboardPage (527 lines), TeacherReportsPage (552 lines) | 4-6 hrs |

### Code Quality (3)

| # | Item | Source | Detail | Effort |
|---|------|--------|--------|--------|
| M12 | **ContentVersionControl mock data + TODO** | A-M4/T8 | Mock versions (L18-46) + empty handleRestore (L56) | Wire or mark future |
| M13 | **window.confirm() in InterventionAlertsPanel** | B-CONFIRM-1 | `InterventionAlertsPanel.tsx:129` | Replace with ConfirmDialog |
| M14 | **Teacher deprecated aliases (5)** | B-DEPREC-1 | `interventionAlertsApi.ts:97-116` overdue since 2025-12-08 | Remove aliases + barrel re-exports |

**Estimated effort:** ~12 days total

---

## LOW (8 items) — Code hygiene / nice-to-have

| # | Item | Source | Detail | Effort |
|---|------|--------|--------|--------|
| L1 | **useFeatureFlags `enabled: false`** | A-7 | Flags only load on manual `fetchFlags()` call. Consider auto-load | 15 min |
| L2 | **useSettings deprecated hook** | A-D2 | 3 mock functions still exported. Verify consumers, then delete | 30 min |
| L3 | **Move correction report MD** | A-D3 | `hooks/CORRECTION-REPORT-useRoles-2025-11-26.md` -> `orchestration/trazas/` | 5 min |
| L4 | **Modal import path standardization** | C-7 | 26 files import `@shared/components/Modal`, 17 use `@shared/components/common/Modal`. Both work (re-export) | 0.5 day |
| L5 | **ABTestingDashboard all-mock component** | A-M11 | Entire component is hardcoded local state. Mark as FUTURE or remove from nav | 30 min |
| L6 | **Move student settings sub-components** | D-2.3 | 8 files in `pages/settings/` that aren't pages -> `components/settings/` | 30 min |
| L7 | **Teacher mock data in useStudentsEconomy** | B-MOCK-1 | Hardcoded students + unreachable fallback code (L96-101) | 15 min |
| L8 | **Create shared component catalog doc** | D-6 | Document all 68 shared components with props and guidelines | 6-8 hrs |

**Estimated effort:** ~2 days total

---

## Execution Roadmap

### Sprint 1: Critical Fixes (3-4 days)
- C1-C3: Fix 3 URL mismatches in `api.config.ts`
- C4: Mark EconomicInterventionPanel operations as "Coming Soon" or disable buttons
- M5-M6: Delete 5 dead code files (5 minutes)
- H9: Add ErrorBoundary to App.tsx route groups
- H10: Delete dead ConfirmDialog (feedback/)

### Sprint 2: Service Layer (3-4 days)
- H1-H7: Fix all 7 service layer bypasses
- H12: Remove 5 orphan frontend URLs
- M14: Remove deprecated teacher aliases

### Sprint 3: UX Consistency (3-4 days)
- C5/H11: Replace 31 native alert()/confirm() with ConfirmDialog + toast
- M13: Fix window.confirm in InterventionAlertsPanel

### Sprint 4: Homogenization (6-8 days)
- M2: Create StatsCardGrid shared component, consolidate 3 clones
- M1: Enhance DataTable, migrate 20 custom tables
- M3-M4: EmptyState + TabBar adoption

### Sprint 5: Documentation & Standards (3-4 days)
- H14: Expand Parents Portal guide
- M7-M9: Create 3 ADRs
- M10: Admin API reference
- C6: ARIA remediation pass (ongoing)

**Total estimated effort:** ~22-26 days across 5 sprints
