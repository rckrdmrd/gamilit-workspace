# Documentation Alignment Report

**Task:** TASK-2026-02-21-COMPLIANCE-AUDIT
**Date:** 2026-02-21
**Scope:** Teacher portal docs, architecture docs, flow diagrams, standards docs, deleted file references
**Auditor:** Claude Opus 4.6

---

## 1. Portal Teacher Docs -- PASS (with minor findings)

### 1a. PORTAL-TEACHER-GUIDE.md -- PASS

**Page file names vs actual files:**

All 19 page files listed in the guide match actual files in `apps/frontend/src/apps/teacher/pages/`:

| # | Documented File | Exists on Disk | Status |
|---|-----------------|----------------|--------|
| 1 | TeacherDashboardPage.tsx | YES | MATCH |
| 2 | TeacherClassesPage.tsx | YES | MATCH |
| 3 | TeacherStudentsPage.tsx | YES | MATCH |
| 4 | TeacherAssignmentsPage.tsx | YES | MATCH |
| 5 | TeacherAlertsPage.tsx | YES | MATCH |
| 6 | TeacherAlertConfigPage.tsx | YES | MATCH |
| 7 | TeacherAnalyticsPage.tsx | YES | MATCH |
| 8 | TeacherGamificationPage.tsx | YES | MATCH |
| 9 | TeacherReportsPage.tsx | YES | MATCH |
| 10 | TeacherProgressPage.tsx | YES | MATCH |
| 11 | TeacherMonitoringPage.tsx | YES | MATCH |
| 12 | TeacherExerciseResponsesPage.tsx | YES | MATCH |
| 13 | TeacherReviewPanelPage.tsx | YES | MATCH |
| 14 | TeacherContentManagementPage.tsx | YES | MATCH |
| 15 | TeacherSettingsPage.tsx | YES | MATCH |
| 16 | TeacherCommunicationPage.tsx | YES | MATCH |
| 17 | TeacherContentPage.tsx | YES | MATCH |
| 18 | TeacherNotificationsPage.tsx | YES | MATCH |
| 19 | TeacherNotificationPreferencesPage.tsx | YES | MATCH |

**ADR-030 "Page" suffix:** All 19 page files use the `Page` suffix correctly.

**Deleted components/hooks:**
- `withTeacherLayout` is referenced only in deprecated/DON'T examples and changelog -- correct usage (educational, not as active reference).
- The 4 deleted hooks (`useGrading`, `useStudentProgress`, `useMasteryTracking`, `useMissionStats`) are noted as deleted in a comment block on line 137-139 -- correct.
- `gradingApi.ts` is noted as merged on line 699 -- correct.

**Hooks listed vs actual files:**
The guide lists 22 hooks (lines 120-144) but actual hook files on disk are 26 (including `useScheduledReports.ts`, `useSharedReports.ts`, `useSharedResources.ts`, and barrel `index.ts`). The hooks `useScheduledReports`, `useSharedReports`, and `useSharedResources` are not listed in the guide's directory tree but DO exist on disk.

**Finding F1-1 (LOW):** The guide's hooks directory tree is missing 3 hooks that exist on disk:
- `useScheduledReports.ts` (used by ScheduledReportsTab)
- `useSharedReports.ts` (used by SharedReportsTab)
- `useSharedResources.ts` (used by ResourceSharingPanel)

**Backend structure (Section 2.2):**
- Lists 7 controllers but actual count is 10 controllers. Missing from the documented tree:
  - `alert-config.controller.ts`
  - `manual-review.controller.ts`
  - `teacher-assignments.controller.ts`
- Lists 14 services -- the "14" is reasonable but not individually verified for exact count match.

**Finding F1-2 (MEDIUM):** Backend controllers section lists 7 controllers but actual codebase has 10. Three controllers are undocumented in the guide:
- `alert-config.controller.ts` (route: `teacher/alert-config`)
- `manual-review.controller.ts` (route: `teacher/reviews`)
- `teacher-assignments.controller.ts` (route: `teacher/assignments`)

### 1b. PORTAL-TEACHER-API-REFERENCE.md -- PASS (with findings)

**Controller count:**
- Document says 7 controllers with 51+ endpoints.
- Actual controllers: 10. Three are missing from the reference table:
  - `ManualReviewController` (route: `/teacher/reviews`)
  - `AlertConfigController` (route: `/teacher/alert-config`)
  - `TeacherAssignmentsController` (route: `/teacher/assignments`)

**Resource sharing section (Section 10):**
- Documents 6 resource sharing endpoints on `TeacherContentController`: GET resources, GET resources/:id, POST rate, GET comments, POST comments, POST download.
- Actual controller (`teacher-content.controller.ts`) confirms all 6 resource endpoints exist plus the original 7 CRUD endpoints (GET all, GET :id, POST, PUT, DELETE, POST clone, PATCH publish) = 13 total. The doc says 11 which appears to be an arithmetic shortfall.

**Finding F1-3 (LOW):** API Reference endpoint count for TeacherContentController says 11 but actual count is 13 (7 CRUD + 6 resource sharing). The "5" original + "6" resource sharing in the table header should be "7 + 6 = 13".

**Finding F1-4 (MEDIUM):** API Reference completely omits 3 controllers: ManualReviewController, AlertConfigController, TeacherAssignmentsController.

### 1c. PORTAL-TEACHER-FLOWS.md -- PASS

**Component/hook references verified:**
- `useTeacherDashboard` -- EXISTS on disk
- `useManualReviews()` -- EXISTS on disk
- `useGrantBonus()` -- EXISTS on disk
- `TeacherDashboardService` -- EXISTS as `teacher-dashboard.service.ts`
- `GradingService` -- EXISTS as `grading.service.ts`
- `BonusCoinsService` -- EXISTS as `bonus-coins.service.ts`
- `StudentRiskAlertService` -- EXISTS as `student-risk-alert.service.ts`
- `AnalyticsService` -- EXISTS as `analytics.service.ts`
- `InterventionAlertsService` -- EXISTS as `intervention-alerts.service.ts`
- `GradeSubmissionModal` -- EXISTS on disk

No references to deleted files found. All flow diagrams reference valid, existing code artifacts.

---

## 2. Architecture Docs -- PASS

### 2a. schema-reference/03-education.md -- PASS

**Resource tables documentation:**
- `education.resource_ratings` -- Documented with correct columns (id, resource_id, teacher_id, rating, created_at, updated_at), CHECK constraint, UNIQUE constraint. DDL reference: `28-resource_ratings.sql`. VERIFIED.
- `education.resource_comments` -- Documented with correct columns (id, resource_id, author_id, text, is_deleted, created_at, updated_at). DDL reference: `29-resource_comments.sql`. VERIFIED.
- `education.resource_downloads` -- Documented with correct columns (id, resource_id, downloaded_by, downloaded_at). DDL reference: `30-resource_downloads.sql`. VERIFIED.

All 3 resource tables are documented with correct column definitions and DDL file references.

### 2b. COHERENCE-ENTITIES-DDL.md -- PASS

The document at version 2.3.0 (2026-02-21) lists the 3 new resource entities in the "Modulo: teacher (9 Entities)" section:
- `resource-rating.entity.ts` -> `28-resource_ratings.sql` -- MATCH
- `resource-comment.entity.ts` -> `29-resource_comments.sql` -- MATCH
- `resource-download.entity.ts` -> `30-resource_downloads.sql` -- MATCH

Note in the document confirms: "3 new resource sharing entities added" (2026-02-21).

**Entity count discrepancy (minor):** The document header says 158 entity files / 159 @Entity classes while CLAUDE.md says 155 files / 156 classes. The difference of +3 files / +3 classes corresponds to the 3 new resource entities. CLAUDE.md has not been updated to reflect this.

**Finding F2-1 (LOW):** CLAUDE.md still says "155 entities (156 classes)" but COHERENCE doc says 158/159 after the +3 resource entities. CLAUDE.md should be updated.

### 2c. schema-reference/_INDEX.md -- PASS (with finding)

**Table count:** _INDEX.md states 172 tables. CLAUDE.md states 169 tables. The difference of +3 corresponds to the 3 new resource tables (resource_ratings, resource_comments, resource_downloads).

The _INDEX.md also references education schema as "24+21" tables for `educational_content` + `progress_tracking` in the schema mapping, which accounts for the 3 new tables being added to educational_content (was 21, now 24, for a conceptual total).

**RLS count discrepancy:** _INDEX.md footer says "237 RLS policies (DDL)" but the table in the summary section says 234. The footer appears to be a stale value that was not updated consistently.

**Finding F2-2 (LOW):** _INDEX.md footer says "237 RLS" but summary table says "234 RLS". These should be reconciled. CLAUDE.md says 234 DDL RLS.

---

## 3. Flow Diagrams -- PASS

### 3a. FLUJO-ANALYTICS-REPORTES.md -- PASS

All referenced .tsx/.ts files verified against actual codebase:

| File Referenced | Exists | Status |
|-----------------|--------|--------|
| `TeacherAnalyticsPage.tsx` | YES | MATCH |
| `TeacherReportsPage.tsx` | YES | MATCH |
| `ReportGenerator.tsx` | YES | MATCH |
| `ScheduledReportsTab.tsx` | YES | MATCH |
| `SharedReportsTab.tsx` | YES | MATCH |
| `useAnalytics.ts` | YES | MATCH |
| `useClassrooms.ts` | YES | MATCH |
| `useScheduledReports.ts` | YES | MATCH |
| `useSharedReports.ts` | YES | MATCH |
| `analyticsApi.ts` | YES | MATCH |
| `reportsApi.ts` | YES | MATCH |
| `scheduledReportsApi.ts` | YES (verified via hooks references) | MATCH |
| `sharedReportsApi.ts` | YES (verified via hooks references) | MATCH |
| `TeacherLayout.tsx` | YES | MATCH |
| `teacher.controller.ts` | YES | MATCH |
| `teacher-classrooms.controller.ts` | YES | MATCH |

No references to deleted files (`gradingApi.ts`, `useGrading.ts`, etc.) found.

### 3b. FLUJO-GESTION-CONTENIDO.md -- PASS

All referenced files verified:

| File Referenced | Exists | Status |
|-----------------|--------|--------|
| `TeacherContentManagementPage.tsx` | YES | MATCH |
| `useTeacherContent.ts` | YES | MATCH |
| `teacherContentApi.ts` | YES (via service ref) | MATCH |
| `TeacherLayout.tsx` | YES | MATCH |
| `teacher-content.controller.ts` | YES | MATCH |
| `teacher-content.service.ts` | YES | MATCH |
| `teacher-content.dto.ts` | YES | MATCH |
| `teacher-content.entity.ts` | YES | MATCH |

No references to deleted files found.

---

## 4. Standards Docs -- PASS

### 4a. REACT-QUERY-MIGRATION-GUIDE.md -- PASS

Admin migration section exists at section 9.2 (line 649): "Admin Portal Migration Details" confirms the admin portal migration was completed in full.

### 4b. ESTRUCTURA-SHARED.md -- PASS (with minor finding)

The documented shared component list was compared against actual files:

**components/base/:**
| Documented | Exists on Disk | Status |
|------------|---------------|--------|
| TabBar.tsx | YES | MATCH |
| DetectiveButton.tsx | YES | MATCH |
| DetectiveCard.tsx | YES | MATCH |
| ColorfulCard.tsx | YES | MATCH |
| EnhancedCard.tsx | YES | MATCH |
| InputDetective.tsx | YES | MATCH |
| ProgressBar.tsx | YES | MATCH |
| RankBadge.tsx | YES | MATCH |
| StatusBadge.tsx | YES | MATCH |
| Toast.tsx | YES | MATCH |

All 10 documented base components match actual files. Actual count on disk: 10 .tsx files. EXACT MATCH.

**components/common/:**
| Documented | Exists on Disk | Status |
|------------|---------------|--------|
| Modal.tsx | YES | MATCH |
| ConfirmDialog.tsx | YES | MATCH |
| DataTable.tsx | YES | MATCH |
| FeatureBadge.tsx | YES | MATCH |
| FormField.tsx | YES | MATCH |

Actual files on disk include 2 additional `.example.tsx` files (`FeatureBadge.example.tsx`, `UnderConstruction.example.tsx`) not listed in docs. These are example/demo files, not production components, so their omission from the docs is acceptable.

**Finding F4-1 (NEGLIGIBLE):** `UnderConstruction.example.tsx` in `components/common/` is not documented but is only an example file, not a production component.

### 4c. GUIA-DETECTIVE-THEME.md -- PASS

The guide comprehensively documents all CSS classes found in `detective-theme.css`:

**Buttons:** `.btn-detective`, `.btn-gold`, `.btn-blue`, `.btn-green`, `.btn-purple`, `.btn-danger` -- All 6 documented and match CSS file exactly.

**Cards:** `.detective-card`, `.card-gold`, `.card-exercise`, `.card-mystery` -- All 4 documented and match CSS file.

**Rank badges:** `.rank-badge-detective`, `.rank-badge-sargento`, `.rank-badge-teniente`, `.rank-badge-capitan`, `.rank-badge-comisario` -- All 5 documented and match.

**Progress bars:** `.progress-detective`, `.progress-xp` -- Both documented and match.

**Input states:** `.input-detective`, `.input-detective-sm`, `.input-detective-md`, `.input-detective-lg`, `.input-detective-error`, `.input-detective-success`, `.input-detective-warning` -- All match.

**Typography:** `.text-detective-title`, `.text-detective-subtitle`, `.text-detective-body`, `.text-detective-small` -- All 4 match.

**Utilities:** `.hover-lift`, `.hover-scale`, `.hover-lift-exercise`, `.hover-scale-sm` -- All match.

**State utilities:** `.detective-state-success`, `.detective-state-error`, `.detective-state-warning`, `.detective-state-info` -- All 4 match.

**Layout:** `.detective-container`, `.bg-detective-gradient`, `.bg-detective-gradient-secondary`, `.bg-detective-card-gradient`, `.bg-gold-gradient`, `.detective-header-gradient` -- All match.

**Loading:** `.loading-overlay`, `.loading-modal`, `.skeleton` -- All match.

**Animations:** `badge-pulse`, `shimmer` -- Match.

**Achievement badges:** `.achievement-common`, `.achievement-rare`, `.achievement-epic`, `.achievement-legendary` -- All 4 match.

**Module states:** `.module-locked`, `.module-lock-overlay`, `.module-completed-badge` -- All match.

Complete alignment verified. No undocumented classes and no phantom references.

---

## 5. Deleted File References -- PARTIAL FAIL

Searched across all `docs/` for references to each deleted file. Results:

### 5.1 gradingApi.ts

| Location | Type | Issue |
|----------|------|-------|
| `PORTAL-TEACHER-GUIDE.md` line 699 | NOTE comment | ACCEPTABLE -- explains the merge |
| `API-SERVICES.md` lines 47, 282, 284 | Strikethrough + REMOVED notice | ACCEPTABLE -- properly deprecated |
| `ET-TCH-004-revision-manual.md` line 79 | Strikethrough `~~gradingApi~~` | ACCEPTABLE -- marked as Removed |

**Verdict:** All references are properly annotated as removed/merged. PASS.

### 5.2 useGrading.ts

| Location | Type | Issue |
|----------|------|-------|
| `PORTAL-TEACHER-GUIDE.md` line 137 | NOTE comment | ACCEPTABLE -- explains deletion |
| `ET-TCH-004-revision-manual.md` line 71 | Strikethrough `~~useGrading~~` | ACCEPTABLE -- marked Removed |
| **`TRACEABILITY.yml` line 611** | **Active entry** | **STALE -- not marked as removed** |
| **`US-PM-002a-assignment-crud.md` lines 437-439** | **Active reference** | **STALE -- presents useGrading as existing hook with path** |

**Finding F5-1 (MEDIUM):** `TRACEABILITY.yml` (line 611) still lists `useGrading.ts` as an active hook without deprecation notice.
**Finding F5-2 (MEDIUM):** `US-PM-002a-assignment-crud.md` (lines 437-439) references `useGrading.ts` as an active hook with its file path.

### 5.3 useStudentProgress.ts

| Location | Type | Issue |
|----------|------|-------|
| `PORTAL-TEACHER-GUIDE.md` line 137 | NOTE comment | ACCEPTABLE |
| `ET-TCH-005-monitoreo-progreso.md` line 82 | Strikethrough | ACCEPTABLE |
| **`ET-TCH-002-gestion-clases.md` line 76** | **Active reference** | **STALE -- lists as existing hook** |
| **`ET-REP-001-reportes-estudiante.md` line 64** | **STALE** | **Lists as active data source** |
| **`ET-REP-001-reportes-estudiante.md` line 248** | **STALE** | **References in usage sequence** |
| **`PERFORMANCE-TREND-SPEC.md` line 670** | **STALE** | **"Actualizar useStudentProgress.ts si aplica"** |
| `STANDARD-API.md` lines 82, 91, 192 | Example code | BORDERLINE -- used as naming pattern example, not as active file ref |
| `GUIA-DESIGN-PATTERNS-NESTJS.md` line 1139 | Example code | BORDERLINE -- used as pattern example |
| `DEPENDENCIAS-STUDENT-TEACHER.md` line 113 | Dependency table | STALE -- lists as active dependency |
| `TEACHER-DATA-FLOW-MAP.yml` line 48 | Data flow reference | STALE -- lists as active hook |

**Finding F5-3 (HIGH):** `useStudentProgress` has 6+ stale references across requirements, specs, and guides that present it as an active, existing hook.

### 5.4 useMissionStats.ts

| Location | Type | Issue |
|----------|------|-------|
| `PORTAL-TEACHER-GUIDE.md` line 137 | NOTE comment | ACCEPTABLE |
| `ET-TCH-005-monitoreo-progreso.md` line 86 | Strikethrough | ACCEPTABLE |

**Verdict:** PASS. All references properly annotated.

### 5.5 useMasteryTracking.ts

| Location | Type | Issue |
|----------|------|-------|
| `PORTAL-TEACHER-GUIDE.md` line 137 | NOTE comment | ACCEPTABLE |
| `ET-TCH-005-monitoreo-progreso.md` line 84 | Strikethrough | ACCEPTABLE |

**Verdict:** PASS. All references properly annotated.

### 5.6 ml-predictor.service.ts / ml-predictor.interface.ts

| Location | Type | Issue |
|----------|------|-------|
| `ET-TCH-005-monitoreo-progreso.md` line 105 | Strikethrough `~~MlPredictorService~~` | ACCEPTABLE -- marked Removed |

**Verdict:** PASS.

### 5.7 withTeacherLayout.tsx (deleted HOC)

| Location | Type | Issue |
|----------|------|-------|
| `PORTAL-TEACHER-GUIDE.md` lines 243, 275-278, 534-535 | Deprecated examples | ACCEPTABLE -- used as "DON'T do this" examples |
| `ADR-046-pageshell-pattern.md` line 185 | File reference | **STALE -- lists file path as if it exists** |
| `ANALISIS-HALLAZGOS-DETALLADO.md` lines 173, 202, 245 | Historical analysis doc | ACCEPTABLE -- documentation-master is historical |
| `COHERENCE-MATRIX-GAMILIT.yml` line 285 | Historical record | ACCEPTABLE -- resolution log |

**Finding F5-4 (LOW):** `ADR-046-pageshell-pattern.md` line 185 still references the file path `apps/frontend/src/apps/teacher/components/withTeacherLayout.tsx` as if it exists with annotation "Deprecated HOC (marked @deprecated)" rather than noting it was deleted.

### 5.8 Other orphaned teacher components (10 deleted)

No systematic search for the other 10 orphaned components was requested by name in the task, and the main portal docs (`PORTAL-TEACHER-GUIDE.md`, `PORTAL-TEACHER-FLOWS.md`) do not reference them.

---

## 6. Summary

### Overall Verdict

| Section | Status | Findings |
|---------|--------|----------|
| 1. Portal Teacher Docs | **PASS** | 4 findings (F1-1 to F1-4) |
| 2. Architecture Docs | **PASS** | 2 findings (F2-1, F2-2) |
| 3. Flow Diagrams | **PASS** | 0 findings |
| 4. Standards Docs | **PASS** | 1 finding (F4-1, negligible) |
| 5. Deleted File References | **PARTIAL FAIL** | 4 findings (F5-1 to F5-4) |

### Corrections Needed

#### HIGH Priority

| ID | File | Issue | Action |
|----|------|-------|--------|
| F5-3 | Multiple files in `docs/10-requirements/` and `docs/50-guides/` | `useStudentProgress` referenced as active in 6+ locations | Mark as removed/deprecated with strikethrough in: `ET-TCH-002-gestion-clases.md`, `ET-REP-001-reportes-estudiante.md`, `PERFORMANCE-TREND-SPEC.md`, `DEPENDENCIAS-STUDENT-TEACHER.md`, `TEACHER-DATA-FLOW-MAP.yml` |

#### MEDIUM Priority

| ID | File | Issue | Action |
|----|------|-------|--------|
| F1-2 | `PORTAL-TEACHER-GUIDE.md` | Backend controllers section lists 7 but actual is 10 | Add `alert-config.controller.ts`, `manual-review.controller.ts`, `teacher-assignments.controller.ts` |
| F1-4 | `PORTAL-TEACHER-API-REFERENCE.md` | Missing 3 controllers in the summary table | Add ManualReviewController, AlertConfigController, TeacherAssignmentsController |
| F5-1 | `TRACEABILITY.yml` line 611 | `useGrading.ts` still listed as active | Mark as removed or add deprecation annotation |
| F5-2 | `US-PM-002a-assignment-crud.md` lines 437-439 | `useGrading.ts` referenced as active hook | Mark as removed with strikethrough |

#### LOW Priority

| ID | File | Issue | Action |
|----|------|-------|--------|
| F1-1 | `PORTAL-TEACHER-GUIDE.md` | Missing 3 hooks in directory tree | Add `useScheduledReports.ts`, `useSharedReports.ts`, `useSharedResources.ts` |
| F1-3 | `PORTAL-TEACHER-API-REFERENCE.md` | TeacherContentController endpoint count says 11, actual is 13 | Update to 13 (7 CRUD + 6 resource sharing) |
| F2-1 | `CLAUDE.md` | Entity count says 155/156 but should be 158/159 with +3 resource entities | Update metrics |
| F2-2 | `schema-reference/_INDEX.md` | Footer says "237 RLS" but summary says "234 RLS" | Reconcile -- 234 is the correct DDL count |
| F5-4 | `ADR-046-pageshell-pattern.md` line 185 | References `withTeacherLayout.tsx` as existing deprecated file | Update to note file was deleted |

---

**Generated by:** Claude Opus 4.6 -- TASK-2026-02-21-COMPLIANCE-AUDIT
**Date:** 2026-02-21
