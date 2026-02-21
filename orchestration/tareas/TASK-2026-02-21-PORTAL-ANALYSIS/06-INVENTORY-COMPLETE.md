# Consolidated Inventory — Portal Analysis

**Date:** 2026-02-21
**Source:** Streams A-E cross-referenced

---

## 1. Issues by Portal

| Portal | CRITICAL | HIGH | MEDIUM | LOW | Total |
|--------|----------|------|--------|-----|-------|
| Admin | 4 | 6 | 12 | 7 | 29 |
| Teacher | 0 | 5 | 4 | 5 | 14 |
| Student | 0 | 0 | 2 | 1 | 3 |
| Parent | 0 | 1 | 0 | 0 | 1 |
| Cross-portal | 2 | 2 | 8 | 3 | 15 |
| **Total** | **6** | **14** | **26** | **16** | **62** |

> Note: Some items span multiple categories (e.g., ConfirmDialog is both admin + cross-portal). Deduped total unique items = 42 in ACTION-ITEMS.

---

## 2. Service Layer Bypasses (9 total)

| # | Portal | File | apiClient Calls | Correct Service Exists? |
|---|--------|------|-----------------|------------------------|
| 1 | Teacher | `ReportGenerator.tsx` | 1 (POST) | Yes: `reportsApi.generateReport()` |
| 2 | Teacher | `ClassProgressDashboard.tsx` | 1 (POST) | Yes: `reportsApi.generateReport()` |
| 3 | Teacher | `ParentCommunicationHub.tsx` | 1 (POST) | Yes: `teacherMessagesApi.sendMessage()` |
| 4 | Teacher | `AssignmentCreator.tsx` | 4 (GET+POST) | Yes: `assignmentsApi` + `classroomsApi` |
| 5 | Teacher | `ResponseFilters.tsx` | 1 (GET) | Partial: educational modules service |
| 6 | Admin | `SystemLogsViewer.tsx` | 1 (GET) | Yes: `useSystemLogs` hook |
| 7 | Admin | `OrganizationsTable.tsx` | 1 (GET) | Yes: `useOrganizations` hook |

---

## 3. URL Mismatches (3 critical)

| # | Frontend URL | Backend Route | Impact |
|---|---|---|---|
| 1 | `POST /admin/gamification/preview-changes` | `POST /admin/gamification/settings/preview` | 404 on preview |
| 2 | `GET /admin/content/history` | `GET /admin/content/approval-history` | 404 on history tab |
| 3 | `POST /admin/content/versions` | `POST /admin/content/version` | 404 on version create |

---

## 4. Mock Data / TODO Stubs

| # | File | Type | Lines | Backend Exists? |
|---|------|------|-------|----------------|
| 1 | `TenantManagementPanel.tsx` | MOCK+TODO (3) | 41-78, 85, 90, 107 | No (future) |
| 2 | `EconomicInterventionPanel.tsx` | MOCK+TODO (3) | 36-73, 96, 121, 141 | Partial |
| 3 | `ContentVersionControl.tsx` | MOCK+TODO | 18-46, 56 | No |
| 4 | `UserActivityChart.tsx` | TODO | 187 | N/A (client) |
| 5 | `useFeatureFlags.ts` | MOCK | 57-100 | Yes (dual-path) |
| 6 | `useSettings.ts` | MOCK (deprecated) | 173-243 | No |
| 7 | `UserDetailModal.tsx` | MOCK | 71-96 | No |
| 8 | `ABTestingDashboard.tsx` | MOCK | 40-100+ | No |
| 9 | `useStudentsEconomy.ts` (teacher) | MOCK | 32-41 | Yes (dual-path) |

---

## 5. Dead Code

| File | Lines | Reason |
|------|-------|--------|
| `admin/components/users/UserDetailModal.example.tsx` | 422 | 0 imports |
| `shared/components/feedback/ConfirmDialog.tsx` | ~80 | 0 imports |
| `student/pages/settings/SaveButton.tsx` | ~30 | 0 imports (copy of shared) |
| `teacher/components/settings/SaveButton.tsx` | ~30 | 0 imports (copy of shared) |
| `features/gamification/components/GamificationErrorBoundary.tsx` | 100 | 0 imports |
| `admin/hooks/CORRECTION-REPORT-useRoles-2025-11-26.md` | N/A | Not code |

---

## 6. Duplication Patterns

| Pattern | Variants | Usage | Dead? | Priority |
|---------|----------|-------|-------|----------|
| ConfirmDialog | 2 impl + 21 inline | 3 + 21 | 1 dead | P0 |
| DataTable | 1 shared + 24 custom | 5 shared | No | P1 |
| StatsGrid | 8 variants | 8 (3 clones) | No | P1 |
| SaveButton | 3 copies | 10 shared | 2 dead | P0 (delete) |
| Modal | 1 impl, 2 paths | 43 total | No | P3 |
| TabBar | 1 shared + 3 inline | 13 shared | No | P2 |
| EmptyState | 1 shared + ~15 inline | 4 shared | No | P2 |
| ErrorBoundary | 2 impl | 0 production | Both unused | P2 |

---

## 7. Standards Compliance

| Standard | Score | Critical Gap |
|----------|-------|-------------|
| PageShell pattern | 100% | - |
| Export patterns | 100% | - |
| Container/Presentational | 89% | 2 teacher pages oversized |
| State management | 89% | Some useEffect+API bypasses |
| ARIA accessibility | **11%** | 8/9 pages have 0 aria attributes |
| Error handling | 89% | Inconsistent patterns |
| Loading states | 100% | - |
| ErrorBoundary | **0%** | Not in App.tsx |

---

## 8. Documentation Status

| Document | Status |
|----------|--------|
| FRONTEND_INVENTORY.yml | 5/6 metrics exact match (+1 hook) |
| Student portal docs | Excellent (57KB + 20 specs) |
| Teacher portal docs | Good (3 files, 103KB) |
| Admin portal docs | Single guide (72KB), no API ref |
| Parents portal docs | **CRITICAL: 2KB stub** |
| Shared component catalog | Missing |
| ADRs (43 total) | 6 gaps identified |

---

## 9. API Alignment

| Portal | Frontend Calls | Matched | Mismatches | Orphans (FE) | Orphans (BE) |
|--------|---------------|---------|------------|-------------|-------------|
| Admin | 109 | 104 | 3 | 5 | ~15 |
| Teacher | 105 | 105 | 0 | 0 | ~5 |
| **Total** | **214** | **209** | **3** | **5** | **~20** |

---

*Consolidated from Streams A-E, 2026-02-21*
