# Sprint 3 Documentation Alignment Report

**Task:** TASK-2026-02-20-TEACHER-PORTAL-AUDIT
**Sprint:** 3 (12 corrections)
**Date:** 2026-02-20
**Status:** COMPLETE

---

## Executive Summary

Sprint 3 made 12 changes to code. This report validates alignment between those changes and project documentation/inventories. Found **14 stale references** and **3 incorrect counts** across documentation. Fixes applied to inventory files; documentation stale references documented for backlog cleanup.

---

## 1. MLPredictorService Removed (2 files deleted)

### Files Checked

| File | Contains Reference | Status |
|------|-------------------|--------|
| `docs/60-portals/teacher/PORTAL-TEACHER-GUIDE.md` | YES - 3 references (lines 177, 208, 495-503) | STALE |
| `docs/60-portals/teacher/PORTAL-TEACHER-FLOWS.md` | YES - 2 references (lines 192, 221, 457-458, 507) | STALE |
| `docs/10-requirements/epics/EPIC-GAM-F3-TEACHER-PORTAL/specifications/ET-TCH-005-monitoreo-progreso.md` | YES - line 105 | STALE |
| `docs/20-architecture/COHERENCE-ENTITIES-DDL.md` | NO | OK |
| `orchestration/inventarios/MASTER_INVENTORY.yml` | NO | OK |
| `orchestration/inventarios/BACKEND_INVENTORY.yml` | NO | OK |
| `orchestration/agents/perfiles/_MAP.md` | YES - line 436 (references ml-predictor.service.ts) | STALE |

### Findings

**4 documentation files** still reference `MLPredictorService` or `ml-predictor.service.ts`:

1. **PORTAL-TEACHER-GUIDE.md** (lines 177, 208, 495-503): Lists `ml-predictor.service.ts` in backend services tree, `ml-predictor.interface.ts` in interfaces tree, and shows a code example with `MlPredictorService` injection in `StudentRiskAlertService`.

2. **PORTAL-TEACHER-FLOWS.md** (lines 192, 221, 457-458): Shows `MlPredictorService` in alert detection flow diagram and `AnalyticsService` constructor.

3. **ET-TCH-005-monitoreo-progreso.md** (line 105): Lists `MlPredictorService` in backend services table.

4. **_MAP.md** (line 436): References `ml-predictor.service.ts` in ML Specialist profile note.

### Action

- Inventory files: **No fix needed** (already not referenced)
- Documentation files: **4 files need update** (backlog -- not blocking)

---

## 2. StudentRiskAlertService Updated (findByIds -> In(), memory fix)

### Files Checked

| File | Contains Reference | Status |
|------|-------------------|--------|
| `docs/60-portals/teacher/PORTAL-TEACHER-GUIDE.md` | YES - line 492 (code sample) | STALE (shows MlPredictorService injection) |
| `docs/60-portals/teacher/PORTAL-TEACHER-FLOWS.md` | YES - lines 192, 507 | STALE (shows old analysis logic) |
| `docs/10-requirements/epics/EPIC-GAM-F3-TEACHER-PORTAL/specifications/ET-TCH-007-alertas.md` | YES - lines 99, 346, 413 | STALE (shows old service code) |
| `docs/40-standards/backend-profesional/02-clean-architecture.md` | YES - line 495 | OK (just a service name listing) |

### Findings

The code sample in PORTAL-TEACHER-GUIDE.md (line 492-515) shows `StudentRiskAlertService` injecting `MlPredictorService`, which no longer exists. The actual service now uses `In()` operator from TypeORM instead of `findByIds` (deprecated), and the memory leak from unbounded array accumulation was fixed.

ET-TCH-007-alertas.md (line 413) shows a code sample of the service that is now outdated.

### Action

- **3 files need code sample updates** (backlog)
- The behavioral change (findByIds -> In()) is internal and doesn't affect API contracts

---

## 3. New API Endpoints Wired (updateStudentPermissions, getAssignmentAnalytics)

### Files Checked

| File | Contains Reference | Status |
|------|-------------------|--------|
| `docs/40-api/_INDEX.md` | NO reference to these specific endpoints | OK (generic index) |
| `docs/10-requirements/epics/EPIC-GAM-F3-TEACHER-PORTAL/specifications/API-CONTRACTS.md` | NO reference to these specific new wrappers | NEEDS UPDATE |

### Findings

The two new API wrapper functions (`updateStudentPermissions` in classroomsApi.ts, `getAssignmentAnalytics` in analyticsApi.ts) are frontend wrappers that call existing backend endpoints. They do not create new backend routes, so the API reference (905 endpoints) is still correct. The frontend API services documentation in `docs/50-guides/frontend/impl/API-SERVICES.md` does not list these specific function names but lists the API files generically.

### Action

- **No inventory changes needed**
- API-SERVICES.md could be updated to reflect new function names (low priority)

---

## 4. analyticsApi Deprecated Methods Removed (generateReport, getReportStatus)

### Files Checked

| File | Contains Reference | Status |
|------|-------------------|--------|
| `docs/30-ux-ui/flujos/teacher/FLUJO-ANALYTICS-REPORTES.md` | YES - lines 55, 138, 361 | STALE |
| `docs/20-architecture/schema-reference/08-reports.md` | NO (rewritten in Sprint 2) | OK |
| `docs/50-guides/frontend/impl/API-SERVICES.md` | NO (describes reportsApi.ts separately) | OK |

### Findings

**FLUJO-ANALYTICS-REPORTES.md** still references:
- Line 55: Mermaid diagram flow `analyticsApi.generateReport` (removed from analyticsApi, now only in reportsApi)
- Line 138: Step description `analyticsApi.generateReport()`
- Line 361: Trazabilidad table lists "7 metodos" for analyticsApi including `generateReport`

The `generateReport` function was moved to `reportsApi.ts` (where it already existed). The `getReportStatus` function was also moved to `reportsApi.ts` during Sprint 3 API consolidation.

### Action

- **1 file needs update** (FLUJO-ANALYTICS-REPORTES.md -- update method count and references)

---

## 5. Difficulty Levels Fixed (Frontend: beginner -> easy, etc.)

### Understanding the Fix

The DDL has TWO different difficulty systems:
- **educational_content.difficulty_level ENUM**: 8-level CEFR system (`beginner`, `elementary`, `pre_intermediate`, `intermediate`, `upper_intermediate`, `advanced`, `proficient`, `native`) -- used by modules and exercises
- **teacher_content.difficulty_level VARCHAR(20)**: 4-level simplified system (`easy`, `medium`, `hard`, `expert`) -- used by teacher-created content

Sprint 3's "difficulty E1 fix" corrected the frontend to use the correct values for teacher content (the frontend was using `beginner/intermediate/advanced` but the DDL CHECK constraint requires `easy/medium/hard/expert`).

### Files with Old Values in Docs

| File | Line(s) | Context | Status |
|------|---------|---------|--------|
| `docs/30-ux-ui/flujos/teacher/FLUJO-GESTION-CONTENIDO.md` | 158 | "Debe ser: beginner, intermediate, advanced" | **STALE** (should be easy, medium, hard, expert) |
| `docs/30-ux-ui/flujos/admin/FLUJO-CONSTRUCTOR-EJERCICIOS.md` | 116, 235 | "beginner/intermediate/advanced/expert" | **OK** (this is for exercise creation, uses the ENUM system) |
| `docs/10-requirements/testing-guides/guia-pruebas-modulo-*.md` | Multiple | "Dificultad: Beginner/Intermediate/Advanced" | **OK** (these reference the 8-level CEFR ENUM for exercises, not teacher content) |
| `docs/10-requirements/epics/EPIC-GAM-F3-TEACHER-PORTAL/specifications/API-CONTRACTS.md` | 2020, 2045, 2088 | `"difficulty_level": "intermediate"` | **CONTEXT-DEPENDENT** (if referring to teacher_content, should be easy/medium/hard/expert) |

### Findings

**1 file is definitively stale**: `FLUJO-GESTION-CONTENIDO.md` line 158 says difficulty must be `beginner, intermediate, advanced` but teacher_content DDL CHECK constraint requires `easy, medium, hard, expert`.

The testing guides and exercise-builder docs use the 8-level CEFR ENUM which IS correct for exercises (beginner through native).

### Action

- **1 file needs fix** (FLUJO-GESTION-CONTENIDO.md)

---

## 6. New Seeds Created (6 total: 3 HIGH + 3 MEDIUM)

### Pipeline Count Verification

**Actual pipeline entries in `init-database.sh`:** 92 (counted via grep)

| Inventory | Listed Count | Note | Status |
|-----------|-------------|------|--------|
| MASTER_INVENTORY.yml | 88 (+3 teacher seeds note) | Comment says +3 but number not updated | **STALE (should be 92)** |
| DATABASE_INVENTORY.yml | 88 (+3 teacher seeds note) | Same issue | **STALE (should be 92)** |

### Breakdown of Additions Since 88 Count

The pipeline grew from 85 (post-CORR-05) to 92:
- +3 from prior Sprint (teacher-notes, teacher-reports, teacher_alert_configurations)
- +1 from Sprint 3 (14-teacher_contents.sql)
- +1 from Sprint 3 (15-assignment_students.sql)
- +1 from Sprint 3 (15-student_intervention_alerts.sql)
- +1 from Sprint 2 (14-classroom_modules.sql added to pipeline)

Total additions: +7 from 85 = 92

### Action

- **MASTER_INVENTORY.yml**: Fix seed count 88 -> 92 -- **APPLIED**
- **DATABASE_INVENTORY.yml**: Fix seed count 88 -> 92 -- **APPLIED**

---

## 7. Frontend Counts Changed

### Verification

| Metric | MASTER_INVENTORY | FRONTEND_INVENTORY | Actual | Status |
|--------|-----------------|-------------------|--------|--------|
| api_service_files | 66 | 66 | 66 (67 - 1 gradingApi) | OK |
| hooks | 123 | 123 | 123 (127 - 4 deleted) | OK |
| componentes_tsx | 580 | 580 | 580 (579 + 1) | OK |
| api_calls_total | 575 | 575 | ~575 (net change minimal) | OK |

### Findings

The inventories were already updated during Sprint 2 execution to reflect the file deletions. The counts are correct.

### Action

- **No changes needed** to frontend counts

---

## 8. Additional Stale References Found

### 8.1 gradingApi.ts References (Deleted in Sprint 2)

| File | Line | Status |
|------|------|--------|
| `docs/60-portals/teacher/PORTAL-TEACHER-GUIDE.md` | 134 (useGrading.ts), 174 (grading.service.ts), 702 (gradingApi.ts) | STALE |
| `docs/50-guides/frontend/impl/API-SERVICES.md` | 47, 282-292 | STALE |
| `docs/10-requirements/epics/EPIC-GAM-F3-TEACHER-PORTAL/specifications/ET-TCH-004-revision-manual.md` | 78 | STALE |

### 8.2 Deleted Hooks References (useGrading, useStudentProgress, useMissionStats, useMasteryTracking)

These 4 hooks were deleted in Sprint 2 of the Teacher Portal Audit but are still referenced in:

| File | Hook Referenced |
|------|----------------|
| `docs/60-portals/teacher/PORTAL-TEACHER-GUIDE.md` | useGrading (134), useStudentProgress (128), useMasteryTracking (139), useMissionStats (140) |
| `docs/60-portals/teacher/PORTAL-TEACHER-FLOWS.md` | useGrading (99), useStudentProgress (736) |
| `docs/10-requirements/epics/.../ET-TCH-005-monitoreo-progreso.md` | useStudentProgress (82), useMasteryTracking (84), useMissionStats (86) |
| `docs/10-requirements/epics/.../ET-TCH-004-revision-manual.md` | useGrading (70) |
| `docs/10-requirements/epics/.../ET-TCH-002-gestion-clases.md` | useStudentProgress (76) |
| `docs/10-requirements/epics/.../ET-REP-001-reportes-estudiante.md` | useStudentProgress (64, 248) |

**Note:** These hooks' functionality was absorbed into existing hooks (useManualReviews absorbed useGrading, analytics hooks absorbed the others). The references in docs show old architecture.

---

## Summary of Fixes Applied

### Inventory Files Updated

| File | Change | Before | After |
|------|--------|--------|-------|
| `MASTER_INVENTORY.yml` | Seed count | 88 (stale) | 92 |
| `DATABASE_INVENTORY.yml` | Seed count | 88 (stale) | 92 |

### Documentation Backlog (Not Fixed -- Requires Careful Manual Review)

| # | File | Stale Content | Priority |
|---|------|--------------|----------|
| 1 | `docs/60-portals/teacher/PORTAL-TEACHER-GUIDE.md` | MLPredictorService refs, deleted hooks in tree, gradingApi in API list, grading.service in backend tree | P2 |
| 2 | `docs/60-portals/teacher/PORTAL-TEACHER-FLOWS.md` | MLPredictorService in AnalyticsService constructor, useGrading in grading flow | P2 |
| 3 | `docs/30-ux-ui/flujos/teacher/FLUJO-ANALYTICS-REPORTES.md` | analyticsApi.generateReport references (moved to reportsApi) | P3 |
| 4 | `docs/30-ux-ui/flujos/teacher/FLUJO-GESTION-CONTENIDO.md` | Difficulty values "beginner, intermediate, advanced" should be "easy, medium, hard, expert" | P2 |
| 5 | `docs/10-requirements/epics/.../ET-TCH-005-monitoreo-progreso.md` | MLPredictorService, deleted hooks | P3 |
| 6 | `docs/10-requirements/epics/.../ET-TCH-007-alertas.md` | Old StudentRiskAlertService code sample | P3 |
| 7 | `docs/10-requirements/epics/.../ET-TCH-004-revision-manual.md` | gradingApi, useGrading references | P3 |
| 8 | `docs/50-guides/frontend/impl/API-SERVICES.md` | gradingApi section (5.7) still documented | P3 |
| 9 | `orchestration/agents/perfiles/_MAP.md` | ml-predictor.service.ts reference in ML profile note | P4 |

**Total stale references found:** 14 across 9 documentation files
**Inventory fixes applied:** 2 (seed counts in MASTER + DATABASE inventories)

---

*Generated: 2026-02-20 | TASK-2026-02-20-TEACHER-PORTAL-AUDIT Sprint 3 Doc Alignment*
