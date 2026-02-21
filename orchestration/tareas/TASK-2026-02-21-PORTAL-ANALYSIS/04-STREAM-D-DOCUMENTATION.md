# Stream D: Documentation & Standards Gap Analysis

**Date:** 2026-02-21
**Analyst:** Claude Opus 4.6 (Stream D)
**Source:** `orchestration/inventarios/FRONTEND_INVENTORY.yml` v12.0.0, `docs/40-standards/`, `docs/60-portals/`, `docs/90-adr/`
**Method:** Automated glob/grep counts + manual spot-check of 9 page files across 3 portals

---

## 1. Executive Summary

The FRONTEND_INVENTORY.yml v12.0.0 is **remarkably accurate** on headline metrics -- components (590), routes (73), stores (13), and API files (67) all match exactly. Minor discrepancies exist in hooks (+1 actual) and pages (the "70 pages" claim conflates active _page_ routes with physical `.tsx` files in `pages/` directories, where the student portal has 8 settings sub-components that inflate the file count to 30 vs documented 20).

Standards compliance is **mixed**: all 9 spot-checked pages follow the Container/Presentational pattern and have proper loading/error states, but **ARIA compliance is critically low** -- 0/3 admin pages and 2/3 teacher pages have zero ARIA attributes at the page level. ErrorBoundary exists but is **never used in App.tsx routes**, meaning a render error crashes the entire application.

Portal documentation is **unevenly distributed**: the Student portal has exhaustive specs (20+ files), the Teacher portal has 3 well-structured guides, the Admin portal has 1 large guide, and the Parents portal has a 2KB stub. Of 43 ADRs, several key frontend architecture decisions remain undocumented.

| Category | Status |
|----------|--------|
| Inventory accuracy | 5/6 metrics exact match, 1 minor discrepancy |
| Standards compliance | Partial -- structure good, ARIA/ErrorBoundary poor |
| Portal docs | Uneven -- Student excellent, Parents minimal |
| ADR coverage | Good overall, 6 gaps identified |

---

## 2. Inventory Accuracy

### 2.1 Verification Method

Each metric was verified by running `find` commands against `apps/frontend/src/` with appropriate exclusions (`.test.tsx`, `.spec.tsx`, `.example.tsx`, `.stories.tsx`, `_testing/`, `test-data`).

### 2.2 Results

| Metric | Documented Value | Actual Count | Delta | Needs Update? |
|--------|-----------------|--------------|-------|---------------|
| Components (.tsx prod) | 590 | 590 | 0 | No |
| Hooks (use*.ts/tsx) | 127 | 128 | +1 | Yes (minor) |
| Pages (total) | 70 | 70 routes, 81 files | see note | Clarify |
| Routes (<Route path=>) | 73 | 73 | 0 | No |
| API service files | 67 | 67 | 0 | No |
| Stores (Zustand) | 13 | 13 | 0 | No |

### 2.3 Detailed Findings

**D2.1 Hooks: +1 discrepancy**
The inventory claims 127 hooks. Actual count is 128. This is likely a hook added since the last verification. The delta is trivially small.

**D2.2 Pages: Conceptual vs Physical Mismatch**
The inventory documents "70 paginas" and decomposes them as:
- Admin: 19 (matches physical files)
- Teacher: 19 (matches physical files)
- Student: 20 (physical: 30 = 22 unique page files + 8 settings sub-components in `pages/settings/`)
- Parent: 4 (matches)
- Shared (auth + feature): 8

The disconnect is that `pages/settings/` contains 8 sub-component files (AccountSection, NotificationsSection, PasswordStrengthIndicator, PrivacySection, ProfileSection, SaveButton, SettingsSidebar, ToggleSwitch) that are **not pages** -- they are components co-located in the pages directory. The inventory correctly counts only "18 *Page.tsx + DashboardComplete + DeviceManagementSection = 20" for student, treating the settings sub-components as components, not pages.

**Recommendation:** Move `apps/frontend/src/apps/student/pages/settings/` sub-components to `apps/frontend/src/apps/student/components/settings/` to eliminate ambiguity.

Additionally, there are 7 pages outside portal dirs (`src/pages/`): LoginPage, RegisterPage, ForgotPasswordPage, AchievementsPage, ModuleDetailsPage, MyProgressPage, plus 1 legacy. And 2 feature-level pages (BrandingSettingsPage, AdminLtiPage). This makes the "shared pages = 8" claim close but needs +1 for the legacy page.

**D2.3 Portal-Level Component Counts**
These were not independently re-verified in this audit (they are documented per-portal in the inventory). The top-level 590 count is confirmed correct.

---

## 3. Standards Compliance

### 3.1 Standards Document Review

The project has a comprehensive standards suite:

| Document | Focus | Status |
|----------|-------|--------|
| `ESTANDAR-FRONTEND-PROFESIONAL.md` | Master: patterns, state, performance, testing, a11y | Active v1.0.0 |
| `STANDARD-COMPONENT.md` | Export patterns, props typing, file naming | Active v1.0.0 |
| `STANDARD-UX-PATTERNS.md` | Error/loading/empty states, toasts, forms | Active v1.0.0 |
| `STANDARD-API.md` | API location, React Query, error handling | Active v1.0.0 |
| `STANDARD-IMPORTS.md` | Import order, path aliases, barrels | Active v1.0.0 |
| `STANDARD-TYPES.md` | Type hierarchy, anti-duplication, any policy | Active v1.0.0 |

**Key rules from the standards:**
1. **Pages:** `export default function` (for React.lazy)
2. **Components:** `export function` (named, no React.FC)
3. **Container/Presentational:** Separate logic from presentation
4. **State:** useState for local, Context for shared subtree, Zustand for global client state, React Query for server state
5. **ARIA:** Semantic HTML first, ARIA only when semantic HTML insufficient; labels on all interactive elements
6. **Error handling:** ErrorBoundary at portal roots, ErrorMessage component, toast for mutation feedback
7. **Loading:** Use shared skeleton components (SkeletonCard, SkeletonStats, LoadingSpinner)

### 3.2 Admin Portal Compliance (3 pages spot-checked)

| Criteria | AdminDashboardPage | AdminUsersPage | AdminContentPage |
|----------|-------------------|----------------|------------------|
| PageShell wrapper | Yes (AdminPageShell) | Yes (AdminPageShell) | Yes (AdminPageShell) |
| Export pattern | `export default function` | `export default function` | `export default function` |
| Container/Presentation | Yes -- hook extracts data, page composes child components | Yes -- 3 hooks (useUserManagement, useUserActions, useCreateUserFlow) + child components | Yes -- usePendingExercisesQuery + tab components |
| State management | Custom hook (useAdminDashboard) | useState + custom hooks | useState + React Query (via hook) |
| ARIA labels | **NONE** -- 0 aria attributes | **NONE** -- 0 aria attributes | **NONE** -- 0 aria attributes |
| Error handling | Inline error div with message | Inline DetectiveCard error display | useApiError hook + try/catch |
| Loading states | Spinner + loading text | Loading passed to UsersTable | Delegated to child tabs |
| Toast feedback | Not present at page level | Yes (ToastContainer) | Not present (delegated) |

**Admin Summary:**
- Structure: **Excellent** -- AdminPageShell consistent, hooks extracted, child components composable
- ARIA: **Critical gap** -- Zero accessibility attributes at page level. Buttons have no aria-label, modals rely on child component ARIA
- Error handling: **Adequate** -- All 3 pages handle errors but with inconsistent patterns (inline div vs DetectiveCard vs useApiError)

### 3.3 Teacher Portal Compliance (3 pages spot-checked)

| Criteria | TeacherDashboardPage | TeacherReportsPage | TeacherMonitoringPage |
|----------|---------------------|--------------------|-----------------------|
| PageShell wrapper | Yes (TeacherPageShell) | Yes (TeacherPageShell) | Yes (TeacherPageShell) |
| Export pattern | `export default function` | `export default function` | `export default function` |
| Container/Presentation | Partial -- data fetching in page + hooks, but 527 lines of mixed logic | Partial -- 552 lines, transform functions inline | Yes -- hooks extracted, composable |
| State management | useState (7 states) + 2 custom hooks + direct API calls | useState (10 states) + direct API calls | useMemo + custom hooks |
| ARIA labels | **NONE** -- select on L175 lacks label/aria-label | **NONE** at page level | **NONE** at page level |
| Error handling | useApiError hook + EmptyState + inline error card | useApiError + hasError banner | useApiError + variant="danger" card |
| Loading states | SkeletonStats + SkeletonCard | Full-page RefreshCw spinner | LoadingSpinner |
| Toast feedback | Not at page level | Yes (react-hot-toast) | Not at page level |

**Teacher Summary:**
- Structure: **Good** -- TeacherPageShell consistent, TabBar shared. However, TeacherDashboardPage (527 lines) and TeacherReportsPage (552 lines) are **over-sized** for the Container/Presentational ideal
- ARIA: **Critical gap** -- Same issue as admin; `<select>` elements lack associated labels
- Error handling: **Good** -- useApiError consistently used across all 3 pages
- State: Some pages still use direct API calls (classroomsApi, assignmentsApi) in useEffect instead of React Query hooks, contradicting the React Query adoption standard (ADR-013)

### 3.4 Student Portal Compliance (3 pages spot-checked)

| Criteria | ShopPage | MissionsPage | LeaderboardPage |
|----------|----------|--------------|-----------------|
| PageShell wrapper | Yes (StudentPageShell) | Yes (StudentPageShell) | Yes (StudentPageShell) |
| Export pattern | `export default function` | `export default function` | `export default function` |
| Container/Presentation | Yes -- hooks (useCoins, useShopData, useShopPurchase) + ShopItemCard, PurchaseModal | Yes -- useMissions + MissionGrid, MissionTabs, ActiveMissionTracker | Yes -- useLeaderboards + LeaderboardLayout, UserPositionCard |
| State management | useState + useMemo + custom hooks | useState + useMemo + useMissions (React Query) | useState + custom hooks |
| ARIA labels | **Partial** -- `sr-only` labels on search input (L221-222) and sort select (L231) | **NONE** at page level | **NONE** at page level |
| Error handling | isLoading/empty state handled, no explicit error display | Error div + retry button | Error display + retry button |
| Loading states | Custom loader with aria role="status" | Loading via MissionGrid | RefreshCw spinner animation |
| Toast feedback | Not at page level (delegated to hook) | Yes (react-hot-toast) | Not present |

**Student Summary:**
- Structure: **Best of the three portals** -- ShopPage demonstrates excellent separation of concerns with 3 specialized hooks, proper sr-only labels, and role="status" on the loader. MissionsPage has clean hook architecture.
- ARIA: **Partially compliant** -- ShopPage has sr-only labels, but MissionsPage and LeaderboardPage have none
- Error handling: **Mixed** -- ShopPage lacks explicit error state display (relies on empty state); MissionsPage and LeaderboardPage handle errors well

### 3.5 Overall Compliance Score

| Standard | Admin | Teacher | Student | Overall |
|----------|-------|---------|---------|---------|
| PageShell pattern | 3/3 | 3/3 | 3/3 | **100%** |
| Export pattern | 3/3 | 3/3 | 3/3 | **100%** |
| Container/Presentational | 3/3 | 2/3 | 3/3 | **89%** |
| State management | 3/3 | 2/3 | 3/3 | **89%** |
| ARIA accessibility | 0/3 | 0/3 | 1/3 | **11%** |
| Error handling | 3/3 | 3/3 | 2/3 | **89%** |
| Loading states | 3/3 | 3/3 | 3/3 | **100%** |
| ErrorBoundary at routes | 0/1 | 0/1 | 0/1 | **0%** |

**Overall: 72% compliant** (52/72 checks pass)

**Critical findings:**
1. **ARIA: 11% compliance** -- Only 1 of 9 pages has any ARIA attributes
2. **ErrorBoundary: 0% compliance** -- Not used in App.tsx despite existing as a component
3. **Teacher pages are over-sized** -- Dashboard (527 lines) and Reports (552 lines) violate Container/Presentational intent

---

## 4. Portal Documentation Status

### 4.1 Documentation Inventory

| Portal | Guide File | Size | Specs Dir | Files in Specs | Last Updated |
|--------|-----------|------|-----------|----------------|-------------|
| Student | `PORTAL-STUDENT-GUIDE.md` | 57 KB | `specs/` (7 subdirs) | 20+ files | 2026-02-18 |
| Teacher | `PORTAL-TEACHER-GUIDE.md` | 37 KB | None | 0 | 2026-02-21 |
| Teacher | `PORTAL-TEACHER-FLOWS.md` | 39 KB | N/A | N/A | 2026-02-20 |
| Teacher | `PORTAL-TEACHER-API-REFERENCE.md` | 28 KB | N/A | N/A | 2026-02-21 |
| Admin | `PORTAL-ADMIN-GUIDE.md` | 72 KB | None | 0 | 2026-02-18 |
| Parents | `PORTAL-PARENTS-GUIDE.md` | **2 KB** | None | 0 | 2026-02-17 |

### 4.2 Coverage Analysis

| Portal | Pages Documented? | Components Cataloged? | Hooks Documented? | API Contracts? | Flows Documented? |
|--------|-------------------|----------------------|-------------------|----------------|-------------------|
| Student | Yes (extensive specs) | Partial (via specs) | Yes (STUDENT-HOOKS-SPEC.md) | Yes (SPEC-API-CONTRACTS.md) | Yes (in UX docs) |
| Teacher | Yes (guide) | No (no catalog) | No (no spec) | Yes (API-REFERENCE.md) | Yes (FLOWS.md) |
| Admin | Yes (guide) | No (no catalog) | No (no spec) | No (not documented) | Partial |
| Parents | **Minimal** (2 KB stub) | No | No | No | Partial |

### 4.3 Detailed Gaps

**D4.1 Parents Portal Documentation (CRITICAL)**
The `PORTAL-PARENTS-GUIDE.md` is only 2 KB -- a stub at best. The Parents portal has 4 pages, a dedicated API service (parentAPI.ts with 17 calls), and a Zustand store (parentStore.ts). None of these are documented in the portal guide.

**D4.2 No Component Catalogs**
None of the portal guides contain a systematic component catalog listing all components, their props, and intended usage. The student portal has individual specs per feature domain, but no unified component reference.

**D4.3 Admin API Reference Missing**
The Teacher portal has a dedicated `PORTAL-TEACHER-API-REFERENCE.md` (28 KB). The Admin portal, which has 16 sub-API files and 120+ API calls, has **no equivalent API reference document**.

**D4.4 Shared Components Documentation**
The `docs/60-portals/README.md` mentions that specs exist only for the student portal. There is no document describing the shared component library (`shared/components/` -- 68 production .tsx files) or rules about when to use shared vs portal-specific components.

**D4.5 Teacher Hooks Not Documented**
The teacher portal has 24 hooks (verified) but no hooks specification document equivalent to the student portal's `STUDENT-HOOKS-SPEC.md`.

---

## 5. ADR Gap Analysis

### 5.1 Existing ADRs Summary

**Total ADRs:** 43 (ADR-001 through ADR-046, with gaps at 006, 024, 025)

| Category | Count | Examples |
|----------|-------|---------|
| Architecture/Infrastructure | 12 | RLS multi-tenancy, Socket.IO, monorepo, clean architecture |
| Frontend/UI | 10 | React Query, PageShell, page naming, frontend API structure |
| Gamification/Domain | 8 | Maya gamification, missions, ranks, team vs guild |
| Database | 5 | Schema expansion, migrations removal, cross-schema refs |
| Process/Governance | 8 | SIMCO, NEXUS, SAAD, CAPVED, test coverage, documentation |

### 5.2 Existing ADRs Relevant to Frontend Architecture

| ADR | Title | Status |
|-----|-------|--------|
| ADR-004 | Modular Exercise Engine | Accepted |
| ADR-008 | Dual Exercise Mechanics System | Accepted |
| ADR-011 | Frontend API Client Structure | Accepted |
| ADR-013 | React Query Adoption | Accepted |
| ADR-030 | Page Naming Convention | Accepted |
| ADR-046 | PageShell Pattern | Accepted |

### 5.3 Missing ADRs

| # | Topic | Why Needed | Priority | Notes |
|---|-------|-----------|----------|-------|
| 1 | **ConfirmDialog Consolidation** | Two ConfirmDialog components exist (`shared/components/common/ConfirmDialog.tsx` and `shared/components/feedback/ConfirmDialog.tsx`). No ADR documents the canonical one or the consolidation decision. | P1 | Stream C (cross-portal) found this pattern duplicated |
| 2 | **DataTable Standard Pattern** | A shared `DataTable` component exists in `shared/components/common/DataTable.tsx` but 3 portals implement ad-hoc table patterns. No ADR defines when to use DataTable vs custom tables. | P2 | Teacher and Admin have inconsistent table implementations |
| 3 | **StatsGrid/Stats Display Pattern** | Multiple StatsGrid variants exist: `DashboardStatsGrid`, `UsersStatsGrid`, `StatsGrid`, `EnhancedStatsGrid`, `LeaderboardStatsGrid`. No ADR defines the canonical pattern or composition rules. | P2 | At least 5 different implementations across portals |
| 4 | **Component Sharing Strategy** | ADR-046 covers PageShell but there is no ADR defining the general rule for when a component should live in `shared/` vs `features/` vs `apps/{portal}/`. The only reference is the project structure in ESTANDAR-FRONTEND-PROFESIONAL.md. | P1 | Critical for preventing duplication as the codebase grows |
| 5 | **Zustand + React Query State Architecture** | ADR-013 covers React Query adoption but does NOT document the complementary Zustand decision or the division of responsibilities (Zustand for client state, React Query for server state). MEMORY.md records this as the pattern but no ADR formalizes it. | P1 | The 13 Zustand stores + React Query pattern is foundational |
| 6 | **ARIA/Accessibility Minimum Standard** | ESTANDAR-FRONTEND-PROFESIONAL.md has a checklist but there is no ADR recording a commitment to WCAG level (A, AA, AAA) or the decision to prioritize accessibility. Given 11% compliance, an ADR would formalize the expectation. | P2 | Currently informally documented in standards, not enforced |

### 5.4 ADR Numbering Note

ADRs 006, 024, and 025 are missing from the sequence. These may have been deprecated or never created. The next available ADR number is ADR-047.

---

## 6. Recommendations

### Priority 1 (Critical -- Immediate)

| # | Recommendation | Effort | Impact |
|---|---------------|--------|--------|
| R1 | **Add ErrorBoundary to App.tsx route groups** | Small (1 hour) | Prevents full-app crash on render errors. STANDARD-UX-PATTERNS.md already defines this as required. |
| R2 | **ARIA audit and remediation** | Medium (4-8 hours) | Add aria-label to all `<select>`, `<button>` (icon-only), and `<input>` elements across 9 admin pages, 19 teacher pages, and key student pages. Start with pages that have interactive forms. |
| R3 | **Write Parents Portal Guide** | Medium (2-3 hours) | Expand 2 KB stub to cover: 4 pages, parentAPI endpoints, parentStore, auth flow, and child linking. |
| R4 | **Create ADR-047: State Architecture (Zustand + React Query)** | Small (1 hour) | Formalize the client-state vs server-state division already in practice. |

### Priority 2 (Important -- Next Sprint)

| # | Recommendation | Effort | Impact |
|---|---------------|--------|--------|
| R5 | **Create ADR-048: Component Sharing Strategy** | Small (1 hour) | Define when components go to shared/ vs features/ vs apps/portal/. |
| R6 | **Create Admin API Reference doc** | Medium (3-4 hours) | Mirror the teacher's PORTAL-TEACHER-API-REFERENCE.md for the admin portal's 16 sub-APIs. |
| R7 | **Move student settings sub-components** | Small (30 min) | Move `pages/settings/*.tsx` (8 files) to `components/settings/` to eliminate pages vs components confusion. |
| R8 | **Create ADR-049: ConfirmDialog consolidation** | Small (30 min) | Document which ConfirmDialog is canonical and deprecate the other. |
| R9 | **Refactor Teacher oversized pages** | Medium (4-6 hours) | Split TeacherDashboardPage (527 lines) and TeacherReportsPage (552 lines) into smaller page + sub-components. |

### Priority 3 (Nice to Have)

| # | Recommendation | Effort | Impact |
|---|---------------|--------|--------|
| R10 | **Create shared component catalog doc** | Large (6-8 hours) | Document all 68 shared components with props, examples, and usage guidelines. |
| R11 | **Create Teacher hooks spec** | Medium (2-3 hours) | Mirror student's STUDENT-HOOKS-SPEC.md for the 24 teacher hooks. |
| R12 | **Standardize StatsGrid pattern** | Medium (4-6 hours) | Create a shared StatsGrid component and ADR documenting the pattern. |
| R13 | **Migrate remaining direct API calls to React Query** | Large (8+ hours) | TeacherDashboardPage and TeacherReportsPage still use direct API calls in useEffect instead of React Query hooks. |

---

## 7. Metrics Summary

| Metric | Count |
|--------|-------|
| Inventory discrepancies | **1** (hooks: +1, pages count is definition-dependent) |
| Standards violations found | **20** (across 9 pages: 8 ARIA violations, 1 ErrorBoundary, 2 Container/Presentation, 2 direct-API-in-useEffect, 2 oversized pages, 3 missing toast feedback, 2 inconsistent error patterns) |
| Missing documentation pages | **5** (Parents guide expansion, Admin API ref, shared component catalog, Teacher hooks spec, shared component rules) |
| Missing ADRs | **6** (ConfirmDialog, DataTable, StatsGrid, component sharing, state architecture, accessibility commitment) |
| Total recommendations | **13** (4 P1, 5 P2, 4 P3) |

---

## Appendix A: Files Read for Spot-Check

### Admin Portal (3 pages)
- `apps/frontend/src/apps/admin/pages/AdminDashboardPage.tsx` (89 lines)
- `apps/frontend/src/apps/admin/pages/AdminUsersPage.tsx` (137 lines)
- `apps/frontend/src/apps/admin/pages/AdminContentPage.tsx` (139 lines)

### Teacher Portal (3 pages)
- `apps/frontend/src/apps/teacher/pages/TeacherDashboardPage.tsx` (527 lines)
- `apps/frontend/src/apps/teacher/pages/TeacherReportsPage.tsx` (552 lines)
- `apps/frontend/src/apps/teacher/pages/TeacherMonitoringPage.tsx` (351 lines)

### Student Portal (3 pages)
- `apps/frontend/src/apps/student/pages/ShopPage.tsx` (297 lines)
- `apps/frontend/src/apps/student/pages/MissionsPage.tsx` (300 lines)
- `apps/frontend/src/apps/student/pages/LeaderboardPage.tsx` (229 lines)

## Appendix B: Standards Documents Referenced

- `docs/40-standards/ESTANDAR-FRONTEND-PROFESIONAL.md` (1147 lines)
- `docs/40-standards/STANDARD-COMPONENT.md`
- `docs/40-standards/STANDARD-UX-PATTERNS.md`
- `docs/40-standards/STANDARD-API.md`
- `docs/40-standards/STANDARD-IMPORTS.md`
- `docs/40-standards/STANDARD-TYPES.md`

## Appendix C: ADR Index (43 ADRs)

ADR-001 through ADR-046 (excluding 006, 024, 025). Categories: Architecture (12), Frontend/UI (10), Gamification (8), Database (5), Process (8).
