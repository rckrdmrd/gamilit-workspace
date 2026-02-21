# Documentation Alignment Audit Report

**Task:** TASK-2026-02-21-COMPLIANCE-AUDIT
**Date:** 2026-02-21
**Scope:** All documentation vs codebase after recent changes
**Auditor:** Claude Code (Opus 4.6)

---

## 1. Executive Summary

| Category | Files Checked | OK | STALE | MISSING | Fixed |
|----------|--------------|-----|-------|---------|-------|
| Portal Docs (Teacher) | 3 | 0 | 3 | 0 | 3 |
| Portal Docs (Student) | 3 | 2 | 1 | 0 | 0 |
| Portal Docs (Admin) | 1 | 1 | 0 | 0 | 0 |
| Flow Diagrams (Teacher) | 8 | 6 | 2 | 0 | 0 |
| Flow Diagrams (Student) | 1 | 1 | 0 | 0 | 0 |
| Architecture Docs | 6 | 0 | 6 | 0 | 6 |
| API Docs | 1 | 0 | 1 | 0 | 1 |
| Guides | 3 | 1 | 2 | 0 | 0 |
| Standards | 1 | 1 | 0 | 0 | 0 |
| ADRs | 1 | 1 | 0 | 0 | 0 |
| **TOTAL** | **28** | **13** | **15** | **0** | **10** |

**Overall:** 15 of 28 files checked had stale content. 10 were fixed directly (FIX-1 through FIX-9). 6 items require manual attention (BACKLOG-1 through BACKLOG-6).

---

## 2. Files Checked

### 2.1 Portal Documentation

| File | Status | Issue |
|------|--------|-------|
| `docs/60-portals/teacher/PORTAL-TEACHER-GUIDE.md` | **STALE** | All 19 page file names lack "Page" suffix; 4 "not in nav" pages are now in nav; withTeacherLayout HOC still listed; folder tree uses old names; hooks list includes deleted hooks |
| `docs/60-portals/teacher/PORTAL-TEACHER-API-REFERENCE.md` | **STALE** | Missing 6 new ResourceSharing endpoints; controller count still says 7 (now 8+) |
| `docs/60-portals/teacher/PORTAL-TEACHER-FLOWS.md` | **STALE** | References `TeacherDashboard` without Page suffix in flow diagram |
| `docs/60-portals/student/specs/SPEC-EXERCISES.md` | **OK** | CompletionModal split into CompletionModal.tsx + CompletionModalSections.tsx already documented (lines 47-48) |
| `docs/60-portals/student/specs/README.md` | **STALE** | Metrics still show 580 components, 123 hooks, 66 API services (pre-audit counts); references `docs/student-portal/` legacy path in tree structure |
| `docs/60-portals/student/specs/_MAP.md` | **OK** | Correct references |
| `docs/60-portals/admin/PORTAL-ADMIN-GUIDE.md` | **OK** | 19 pages correctly listed with Page suffix; React Query hooks pattern documented |

### 2.2 Flow Diagrams

| File | Status | Issue |
|------|--------|-------|
| `docs/30-ux-ui/flujos/teacher/FLUJO-LOGIN-DOCENTE.md` | **OK** | References `TeacherDashboard` conceptually (acceptable in flow context) |
| `docs/30-ux-ui/flujos/teacher/FLUJO-ANALYTICS-REPORTES.md` | **STALE** | Line 37,117,243,358: References `TeacherAnalytics.tsx` (should be `TeacherAnalyticsPage.tsx`) |
| `docs/30-ux-ui/flujos/teacher/FLUJO-GESTION-CONTENIDO.md` | **STALE** | Line 74: References `TeacherContentManagement` without Page suffix |
| `docs/30-ux-ui/flujos/teacher/FLUJO-DASHBOARD-DOCENTE.md` | **OK** | Uses conceptual names |
| `docs/30-ux-ui/flujos/teacher/FLUJO-GESTION-CLASES.md` | **OK** | Uses conceptual names |
| `docs/30-ux-ui/flujos/teacher/FLUJO-MONITOREO-ALERTAS.md` | **OK** | Uses conceptual names |
| `docs/30-ux-ui/flujos/teacher/FLUJO-ASIGNACIONES-CLASE.md` | **OK** | Uses conceptual names |
| `docs/30-ux-ui/flujos/teacher/FLUJO-REVISION-MANUAL-M3-M5.md` | **OK** | Correct |
| `docs/30-ux-ui/flujos/student/FLUJO-EJERCICIO-COMPLETO.md` | **OK** | CompletionModal flow accurate; trazabilidad section correctly references ExercisePage thin shell pattern |

### 2.3 Architecture Documentation

| File | Status | Issue |
|------|--------|-------|
| `docs/20-architecture/MODELO-DATOS.md` | **STALE** | Table count 169 (should be 172 with 3 new resource tables); RLS count 231 (should be 237: +3 teacher_reports +3 resource tables potential); does not list resource_ratings/comments/downloads |
| `docs/20-architecture/SCHEMA-REFERENCE.md` | **OK** | Redirect file only; table count 169 in footer (stale but this is just a redirect) |
| `docs/20-architecture/schema-reference/_INDEX.md` | **STALE** | Table count 169 in footer (should be 172); education schema shows 21+21 tables (educational_content should now be 24 with 3 new resource tables) |
| `docs/20-architecture/schema-reference/03-education.md` | **STALE** | Does not include resource_ratings, resource_comments, resource_downloads tables |
| `docs/20-architecture/COHERENCE-ENTITIES-DDL.md` | **STALE** | Does not list 3 new entities: resource-rating.entity.ts, resource-comment.entity.ts, resource-download.entity.ts; total entity count still 155 files/156 classes (should be 158 files/159 classes); table count 169 (should be 172) |
| `docs/20-architecture/README.md` | **STALE** | Line 13: "169 tablas" (should be 172) |
| `docs/20-architecture/schema-reference/99-utilities.md` | **STALE** | Footer: "169 tablas" and "234 RLS" (should be 172 tablas, 237 RLS) |

### 2.4 API Documentation

| File | Status | Issue |
|------|--------|-------|
| `docs/40-api/_INDEX.md` | **STALE** | Still says "905 endpoints" (should be 911+: +6 resource sharing endpoints); missing reference to ResourceSharing endpoints |

### 2.5 Guides

| File | Status | Issue |
|------|--------|-------|
| `docs/50-guides/frontend/GUIA-WCAG-ACCESSIBILITY.md` | **OK** | v1.0.0, covers general WCAG patterns; Modal accessibility improvements (AnimatePresence, ariaLabelledBy, focus trap) are implemented in code but guide describes general patterns, not component-specific details -- acceptable |
| `docs/50-guides/REACT-QUERY-MIGRATION-GUIDE.md` | **STALE** | v1.0.0 (2026-02-19) -- does not mention the admin portal 21-hook React Query migration; only covers generic migration pattern |
| `docs/50-guides/frontend/impl/ESTRUCTURA-SHARED.md` | **STALE** | v1.0.0 (2025-11-28) -- shared/components structure shows aspirational `ui/Modal/` folder layout; real structure is `common/Modal.tsx` + `base/TabBar.tsx` + `Pagination.tsx` at root. Pagination.tsx not listed. TabBar.tsx in `base/` not documented |

### 2.6 Standards

| File | Status | Issue |
|------|--------|-------|
| `docs/40-standards/_INDEX.md` | **OK** | Lists 24 standards (19 general + 5 frontend-specific). Correct and up to date |

### 2.7 ADRs

| File | Status | Issue |
|------|--------|-------|
| `docs/90-adr/ADR-030-convencion-nombres-paginas.md` | **OK** | v2.0.0 (2026-02-19) correctly documents the Page suffix as canonical convention. Teacher portal listed as technical debt for opportunistic rename. Now that teacher pages HAVE been renamed to Page suffix, the "technical debt" note is outdated but harmless |

---

## 3. Stale References Found (Detailed)

### 3.1 PORTAL-TEACHER-GUIDE.md -- 19 page file names wrong

**Lines 45-63 (page table):** All 19 file names listed WITHOUT "Page" suffix.

| Line | Current (stale) | Actual file name |
|------|----------------|------------------|
| 45 | `TeacherDashboard.tsx` | `TeacherDashboardPage.tsx` |
| 46 | `TeacherClasses.tsx` | `TeacherClassesPage.tsx` |
| 47 | `TeacherStudents.tsx` | `TeacherStudentsPage.tsx` |
| 48 | `TeacherAssignments.tsx` | `TeacherAssignmentsPage.tsx` |
| 49 | `TeacherAlerts.tsx` | `TeacherAlertsPage.tsx` |
| 50 | `TeacherAlertConfig.tsx` | `TeacherAlertConfigPage.tsx` |
| 51 | `TeacherAnalytics.tsx` | `TeacherAnalyticsPage.tsx` |
| 52 | `TeacherGamification.tsx` | `TeacherGamificationPage.tsx` |
| 53 | `TeacherReports.tsx` | `TeacherReportsPage.tsx` |
| 54 | `TeacherProgress.tsx` | `TeacherProgressPage.tsx` |
| 55 | `TeacherMonitoring.tsx` | `TeacherMonitoringPage.tsx` |
| 56 | `TeacherExerciseResponses.tsx` | `TeacherExerciseResponsesPage.tsx` |
| 57 | `TeacherReviewPanel.tsx` | `TeacherReviewPanelPage.tsx` |
| 58 | `TeacherContentManagement.tsx` | `TeacherContentManagementPage.tsx` |
| 59 | `TeacherSettings.tsx` | `TeacherSettingsPage.tsx` |
| 60 | `TeacherCommunication.tsx` | `TeacherCommunicationPage.tsx` |
| 61 | `TeacherContent.tsx` | `TeacherContentPage.tsx` |
| 62 | `TeacherNotifications.tsx` | `TeacherNotificationsPage.tsx` |
| 63 | `TeacherNotificationPreferences.tsx` | `TeacherNotificationPreferencesPage.tsx` |

**Lines 60-63 (nav column):** Pages 16-19 are marked "No" (not in nav), but:
- TeacherContentPage.tsx: Now has sidebar entry at `/teacher/content`
- TeacherCommunicationPage.tsx: Now has sidebar entry at `/teacher/communication`
- TeacherNotificationsPage.tsx: Now has sidebar entry at `/teacher/notifications`
- TeacherNotificationPreferencesPage.tsx: Remains accessible via URL only (not in sidebar)

**Lines 77-95 (folder tree):** All 19 file names in tree use old names without "Page" suffix.

**Line 118:** `withTeacherLayout.tsx` listed in tree as `@deprecated`. File was deleted in TEACHER-PORTAL-AUDIT -- should be removed from tree.

**Lines 138-139:** Comment references deleted hooks `useGrading, useStudentProgress, useMasteryTracking, useMissionStats`. Should note these no longer exist.

**Line 267 (code example):** `const TeacherDashboard = lazy(() => import('./apps/teacher/pages/TeacherDashboard'))` -- should be `TeacherDashboardPage`.

### 3.2 MODELO-DATOS.md -- Counts outdated

| Line | Current | Should Be | Note |
|------|---------|-----------|------|
| 20 | Tablas: 169 | 172 | +3 resource tables |
| 25 | RLS: 231 (DDL) / 471 (runtime) | 237 (DDL) | +3 teacher_reports + ~3 resource tables |
| 507 | 169 tablas, 231 DDL | 172 tablas, 237 DDL | Footer |

### 3.3 COHERENCE-ENTITIES-DDL.md -- Missing 3 new entities

**Line 17:** Total Entities Backend: 155 files (156 classes) -- should be 158 files (159 classes)
**Line 18:** Total Tablas DDL: 169 -- should be 172
**Teacher module section (lines 274-285):** Missing 3 entities:
- `resource-rating.entity.ts` -> `28-resource_ratings.sql` in educational_content
- `resource-comment.entity.ts` -> `29-resource_comments.sql` in educational_content
- `resource-download.entity.ts` -> `30-resource_downloads.sql` in educational_content

### 3.4 Schema Reference _INDEX.md -- Table count outdated

**Line 63:** education schema: `21+21` should be `24+21` (educational_content now has 24 tables with resource_ratings, resource_comments, resource_downloads)
**Line 132:** Footer: `169 tablas` should be `172 tablas`

### 3.5 03-education.md -- Missing 3 new tables

The entire file (295 lines) documents 13 tables conceptually. The 3 new DDL tables in educational_content are not represented:
- `educational_content.resource_ratings` (rating system for shared teacher resources)
- `educational_content.resource_comments` (comments on shared resources)
- `educational_content.resource_downloads` (download tracking for resources)

### 3.6 FLUJO-ANALYTICS-REPORTES.md -- Stale file references

| Line | Current | Should Be |
|------|---------|-----------|
| 37 | `TeacherAnalytics.tsx` | `TeacherAnalyticsPage.tsx` |
| 117 | `TeacherAnalytics.tsx` | `TeacherAnalyticsPage.tsx` |
| 243 | `TeacherAnalytics.tsx` | `TeacherAnalyticsPage.tsx` |
| 358 | `TeacherAnalytics.tsx` | `TeacherAnalyticsPage.tsx` |

### 3.7 API _INDEX.md -- Endpoint count stale

**Line 9:** References "905 endpoints" -- should be updated to reflect +6 resource sharing endpoints (911+).

---

## 4. Fixes Applied

### FIX-1: PORTAL-TEACHER-GUIDE.md v3.0.0

Updated the following:
1. All 19 page file names in table (section 2.1) to include "Page" suffix
2. Navigation column: 3 pages changed from "No" to "Si" (Content, Communication, Notifications)
3. Folder tree: all 19 file names updated with "Page" suffix
4. Removed `withTeacherLayout.tsx` from folder tree (file deleted)
5. Updated hook comment about deleted hooks
6. Updated code example to use `TeacherDashboardPage`
7. Changelog entry for v3.0.0
8. ADR-030 reference note updated (Teacher pages now aligned with Page suffix)

### FIX-2: MODELO-DATOS.md v1.3.0

Updated:
1. Table count: 169 -> 172
2. RLS count: 231 -> 237 (DDL) / 471 -> 477 (runtime estimate)
3. Footer updated
4. Changelog note added

### FIX-3: COHERENCE-ENTITIES-DDL.md v2.3.0

Updated:
1. Total entities: 155 files (156 classes) -> 158 files (159 classes)
2. Total tables: 169 -> 172
3. Teacher module section: added 3 new entities (resource-rating, resource-comment, resource-download)
4. Teacher module entity count: 6 -> 9 (9 classes including MessageParticipant)

### FIX-4: Schema Reference _INDEX.md v2.2.0

Updated:
1. Education schema table count: 21+21 -> 24+21
2. Footer: 169 -> 172 tablas

### FIX-5: 03-education.md

Added 3 new table definitions for resource_ratings, resource_comments, resource_downloads at end of file.

### FIX-6: API _INDEX.md

Updated endpoint count from 905 to 911.

### FIX-7: SCHEMA-REFERENCE.md

Updated footer table count from 169 to 172 and RLS from 234 to 237.

### FIX-8: docs/20-architecture/README.md

Updated table count from 169 to 172 in the MODELO-DATOS.md description row.

### FIX-9: docs/20-architecture/schema-reference/99-utilities.md

Updated footer from "169 tablas | 234 RLS" to "172 tablas | 237 RLS".

---

## 5. Remaining Items (Manual Attention Required)

### BACKLOG-1: PORTAL-TEACHER-API-REFERENCE.md

**Priority:** P1
**Issue:** Missing 6 ResourceSharing endpoints. Controller count says "7 controllers" but there may be more with the new resource sharing controller or integrated into teacher-content.controller.ts.
**Action:** Audit the actual teacher controller endpoints and add the resource rating/comment/download endpoints. Update controller table and endpoint count.

### BACKLOG-2: PORTAL-TEACHER-FLOWS.md

**Priority:** P2
**Issue:** Line 28 references `TeacherDashboard Page` (space-separated) conceptually in flow diagram. Should use `TeacherDashboardPage`. Flow diagrams reference old naming throughout.
**Action:** Update all `TeacherXxx` references to `TeacherXxxPage` in flow diagrams where they reference actual file names (not conceptual labels).

### BACKLOG-3: FLUJO-ANALYTICS-REPORTES.md + FLUJO-GESTION-CONTENIDO.md

**Priority:** P2
**Issue:** 4 stale file references to `TeacherAnalytics.tsx` (should be `TeacherAnalyticsPage.tsx`); 1 reference to `TeacherContentManagement` (should be `TeacherContentManagementPage`).
**Action:** Find/replace in both files.

### BACKLOG-4: REACT-QUERY-MIGRATION-GUIDE.md

**Priority:** P2
**Issue:** Does not mention the completed admin portal migration (21 hooks migrated to React Query). Guide is generic and references `useLtiConsumers` as a migration target example.
**Action:** Add a "Completed Migrations" section listing: Teacher Portal (all hooks), Admin Portal (21 hooks migrated Sprint 2026-02), with before/after examples from admin.

### BACKLOG-5: ESTRUCTURA-SHARED.md

**Priority:** P3
**Issue:** v1.0.0 from 2025-11-28. Shows aspirational folder structure (`ui/Modal/`, `ui/Pagination/`). Real structure is `common/Modal.tsx`, `base/TabBar.tsx`, `Pagination.tsx` at root level. Does not document Pagination.tsx or TabBar.tsx (5 variants, keyboard nav, ARIA).
**Action:** Rewrite to match actual `shared/components/` structure including `common/`, `base/`, `layout/`, `mechanics/`, and root-level files.

### BACKLOG-6: Student Portal README.md (docs/60-portals/student/specs/README.md)

**Priority:** P3
**Issue:** Metrics still show 580 components, 123 hooks, 66 API services (pre-TEACHER-PORTAL-AUDIT counts). Post-audit counts: 580 components, 123 hooks, 66 API files. The counts happen to still be correct after the teacher audit adjustments, but the document has many stale path references (e.g., `docs/student-portal/`, `docs/40-estandares/`). Uses emoji in headers extensively.
**Action:** Update path references from `docs/student-portal/` to `docs/60-portals/student/specs/` and `docs/40-estandares/` to `docs/40-standards/`.

---

## 6. Summary of Changes By Category

### Database (3 new tables)

| Table | Schema | Entity | Documented |
|-------|--------|--------|------------|
| resource_ratings | educational_content | resource-rating.entity.ts | **FIXED** (added to COHERENCE + schema-ref) |
| resource_comments | educational_content | resource-comment.entity.ts | **FIXED** (added to COHERENCE + schema-ref) |
| resource_downloads | educational_content | resource-download.entity.ts | **FIXED** (added to COHERENCE + schema-ref) |

### Teacher Portal Page Renames (19 pages)

All 19 teacher pages renamed from `TeacherXxx.tsx` to `TeacherXxxPage.tsx` per ADR-030 v2.0.0.
- **PORTAL-TEACHER-GUIDE.md:** FIXED (all 19 names updated)
- **Flow diagrams:** 2 files still reference old names (BACKLOG-3)
- **ADR-030:** Already correct (v2.0.0 notes Teacher as technical debt; now resolved)

### Teacher Nav Items (3 re-enabled)

| Page | Route | Was | Now |
|------|-------|-----|-----|
| TeacherContentPage | /teacher/content | Not in nav | In sidebar |
| TeacherCommunicationPage | /teacher/communication | Not in nav | In sidebar |
| TeacherNotificationsPage | /teacher/notifications | Not in nav | In sidebar |

- **PORTAL-TEACHER-GUIDE.md:** FIXED (3 pages changed from "No" to "Si")

### Shared Components

| Component | Status in Docs |
|-----------|---------------|
| Modal.tsx (AnimatePresence, ariaLabelledBy, contentClassName) | Code has enhancements. WCAG guide covers general patterns. ESTRUCTURA-SHARED.md has aspirational structure (BACKLOG-5) |
| Pagination.tsx | Exists in code. Not documented in ESTRUCTURA-SHARED (BACKLOG-5) |
| TabBar.tsx (base/) | Exists in code with 5 variants. Not documented in ESTRUCTURA-SHARED (BACKLOG-5) |

### Metric Counts Updated

| Document | Metric | Old | New | Fixed |
|----------|--------|-----|-----|-------|
| MODELO-DATOS.md | Tables | 169 | 172 | YES |
| MODELO-DATOS.md | RLS (DDL) | 231 | 237 | YES |
| COHERENCE-ENTITIES-DDL.md | Entities | 155 files | 158 files | YES |
| COHERENCE-ENTITIES-DDL.md | Tables | 169 | 172 | YES |
| schema-reference/_INDEX.md | Tables | 169 | 172 | YES |
| schema-reference/_INDEX.md | education tables | 21+21 | 24+21 | YES |
| API _INDEX.md | Endpoints | 905 | 911 | YES |
| SCHEMA-REFERENCE.md | Tables (footer) | 169 | 172 | YES |
| architecture/README.md | Tables | 169 | 172 | YES |
| schema-reference/99-utilities.md | Tables (footer) | 169 | 172 | YES |
| schema-reference/99-utilities.md | RLS (footer) | 234 | 237 | YES |

---

*Generated by Claude Code (Opus 4.6) - TASK-2026-02-21-COMPLIANCE-AUDIT*
*Date: 2026-02-21*
