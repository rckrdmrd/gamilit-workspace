# Phase 1: Structural Analysis -- Synthesis Report

**Date:** 2026-02-27
**Scope:** ~2,096 MD files across 13 sections in docs/
**Auditor:** Claude Opus 4.6 (synthesis from 9 sub-agent reports)
**Mode:** ANALYSIS (read-only -- no files modified)

---

## Executive Summary

The structural audit of docs/ reveals a documentation corpus of approximately 2,096 markdown files distributed across 13 top-level sections, with dramatically uneven quality. The sections range from well-structured (70-onboarding at 82/100) to critically in need of remediation (60-portals at 44/100). The global weighted health score is **62/100**, indicating the documentation is functional but has significant structural debt that impairs navigation, automated processing, and contributor onboarding.

Three systemic patterns dominate the findings: (1) **near-zero YAML frontmatter adoption** across most sections (global average 8.6%), making machine-readable metadata extraction impossible; (2) **pervasive absence of _INDEX.md and _MAP.md navigation files**, with 50-guides missing _INDEX.md in 37 of 41 directories (90%) and 60-portals missing it in 9 of 11 directories; and (3) **oversized files** -- 82 files exceed the 500-line threshold, with 15 exceeding 1,000 lines, concentrated in 40-standards, 50-guides, and 60-portals. These three patterns account for the majority of the structural health deficit.

The 10-requirements section (1,631 files, 78% of total) is structurally sound in its ADR-034 hierarchy but carries massive stub debt (~76% of files are 3-line placeholders) and has legacy ID references in frontmatter that break traceability. The 40-standards section has the highest content quality but suffers from dual naming conventions (ESTANDAR- vs STANDARD-) and files exceeding 1,800 lines. Cross-section issues include stale metric counts (endpoint counts differ by 10-62 across files), misplaced content (testing guides in requirements, audit reports in guides), and inconsistent conventions for directory naming (lowercase vs UPPERCASE).

---

## Health Scores by Section

| Section | Files | Health Score | Critical | High | Medium | Low |
|---------|-------|-------------|----------|------|--------|-----|
| 00-overview | 22 | 65 | 1 | 4 | 4 | 5 |
| 10-requirements | 1,631 | 70 | 0 | 2 | 3 | 3 |
| 20-architecture | 54 | 72 | 0 | 2 | 3 | 5 |
| 30-ux-ui | 80 | 71 | 3 | 5 | 5 | 0 |
| 40-api | 10 | 60 | 1 | 3 | 1 | 1 |
| 40-standards | 38 | 68 | 2 | 0 | 6 | 6 |
| 50-guides | 155 | 52 | 4 | 3 | 3 | 3 |
| 60-portals | 41 | 44 | 2 | 6 | 3 | 2 |
| 70-onboarding | 6 | 82 | 0 | 0 | 2 | 2 |
| 80-references | 9 | 60 | 1 | 4 | 4 | 1 |
| 90-adr | 50 | 75 | 4 | 7 | 0 | 7 |
| 99-delivery | 31 | 50 | 0 | 4 | 4 | 3 |
| **GLOBAL (weighted)** | **~2,096** | **62** | **18** | **40** | **38** | **38** |

**Methodology:** Global score is a weighted average by file count. Per-section scores are derived from individual report assessments (explicit where provided, inferred from violation counts where not).

---

## Global Metrics

### _INDEX.md Coverage

**Directories missing _INDEX.md:** 61 of ~120 directories audited (~51% absence rate)

Major gaps by section:

| Section | Dirs Missing _INDEX.md | Notable Gaps |
|---------|----------------------|--------------|
| 00-overview | 1 | `migracion/` |
| 10-requirements | 1 | `EPIC-GAM-F3-TEACHER-PORTAL/` (only active epic without) |
| 20-architecture | 0 | All covered |
| 30-ux-ui | 1 | `flujos/system/` (untracked) |
| 40-api | 0 | All covered (but 3 files unlisted in existing _INDEX) |
| 40-standards | 1 | `guias/` |
| 50-guides | 37 | `backend/`, `frontend/`, `testing/`, `troubleshooting/`, `integration/`, all `documentation-master/` subdirs (10), all `frontend/impl/` subdirs (~15) |
| 60-portals | 9 | `admin/`, `parents/`, `student/`, `teacher/`, `specs/analysis/`, `specs/dependencies/`, `specs/gaps/`, `specs/inventory/`, `specs/traces/` |
| 80-references | 4 | `knowledge-base/`, `transversal/`, `transversal/arquitectura/`, `transversal/correcciones/` |
| 99-delivery | 1 | `2025-11-16-entrega-final/` |

### _MAP.md Coverage

**Directories missing _MAP.md:** 44 of ~120 directories (~37% absence rate)

Major gaps by section:

| Section | Dirs Missing _MAP.md | Notable Gaps |
|---------|---------------------|--------------|
| 00-overview | 1 | Root (only top-level section without _MAP.md) |
| 10-requirements | 21 | 21 of 23 active epics lack _MAP.md at epic root |
| 20-architecture | 1 | `schema-reference/` |
| 30-ux-ui | 4 | Root, `flujos/auth/`, `flujos/shared/`, `flujos/system/` |
| 40-standards | 2 | `backend-profesional/`, `guias/` |
| 50-guides | 19 | Root, `backend/`, all `documentation-master/` dirs, `frontend/`, `frontend/impl/types/`, `integration/`, `testing/`, `troubleshooting/` |
| 60-portals | 5 | Root, `admin/`, `parents/`, `student/`, `teacher/` |
| 80-references | 3 | Root, `knowledge-base/`, `transversal/arquitectura/` |
| 99-delivery | 1 | Root |

### Frontmatter Coverage

| Section | Files | With Frontmatter | Percentage |
|---------|-------|-----------------|------------|
| 00-overview | 22 | 10 | 45% |
| 10-requirements (US/EPIC) | ~200 substantive | ~130 US files | ~65% |
| 10-requirements (TASK stubs) | ~1,400 | 0 | 0% |
| 20-architecture | 54 | 4 | 7.4% |
| 30-ux-ui | 80 | 0 | 0% |
| 40-api | 10 | 0 | 0% |
| 40-standards | 38 | 12 | 43% |
| 50-guides | 155 | ~10 | ~6.5% |
| 60-portals | 41 | 0 | 0% |
| 70-onboarding | 6 | 5 | 83% |
| 80-references | 9 | 6 | 67% |
| 90-adr | 50 | 0 | 0% |
| 99-delivery | 31 | 0 | 0% |
| **Global Average** | **~2,096** | **~177** | **~8.4%** |

**Sections with 0% frontmatter:** 30-ux-ui, 40-api, 60-portals, 90-adr, 99-delivery (5 sections, 212 files total)

### Files >500 Lines (Splitting Candidates)

**Total: 82 files across all sections**

#### Priority 1: >1,500 lines (7 files)

| File | Lines | Section |
|------|-------|---------|
| `60-portals/admin/PORTAL-ADMIN-GUIDE.md` | 2,228 | 60-portals |
| `99-delivery/2025-11-16-entrega-final/Manual_Portal_Administrador_ACTUALIZADO.md` | 2,666 | 99-delivery |
| `99-delivery/2025-11-16-entrega-final/Manual_Portal_Student_v1.0.md` | 1,859 | 99-delivery |
| `60-portals/student/PORTAL-STUDENT-GUIDE.md` | 1,843 | 60-portals |
| `40-standards/ESTANDAR-SEGURIDAD.md` | 1,863 | 40-standards |
| `99-delivery/2025-11-16-entrega-final/Manual_Portal_Maestros_ACTUALIZADO.md` | 1,617 | 99-delivery |
| `40-standards/ESTANDAR-TESTING.md` | 1,582 | 40-standards |

#### Priority 2: 1,000-1,500 lines (14 files)

| File | Lines | Section |
|------|-------|---------|
| `40-standards/ESTANDAR-API.md` | 1,453 | 40-standards |
| `60-portals/student/specs/gaps/STUDENT-GAP-007-settings-persistence.md` | 1,285 | 60-portals |
| `60-portals/student/specs/STUDENT-HOOKS-SPEC.md` | 1,236 | 60-portals |
| `60-portals/student/specs/traces/TRACE-P0-CORRECTIONS.md` | 1,220 | 60-portals |
| `50-guides/backend/GUIA-DESIGN-PATTERNS-NESTJS.md` | 1,206 | 50-guides |
| `50-guides/deployment/GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md` | 1,206 | 50-guides |
| `20-architecture/schema-reference/03-education.md` | 1,208 | 20-architecture |
| `50-guides/testing/GUIA-E2E-PLAYWRIGHT.md` | 1,168 | 50-guides |
| `40-standards/ESTANDAR-FRONTEND-PROFESIONAL.md` | 1,146 | 40-standards |
| `60-portals/student/specs/dependencies/DEPENDENCY-MATRIX.md` | 1,112 | 60-portals |
| `60-portals/teacher/PORTAL-TEACHER-API-REFERENCE.md` | 1,192 | 60-portals |
| `50-guides/deployment/DEPLOYMENT-MASTER.md` | 1,074 | 50-guides |
| `50-guides/backend/GUIA-RUNBOOK-POSTGRESQL.md` | 1,034 | 50-guides |
| `60-portals/student/specs/inventory/IMPLEMENTATIONS-2025-11-24.md` | 967 | 60-portals |

#### Priority 3: 500-999 lines (61 files)

| Section | Count | Largest File |
|---------|-------|-------------|
| 50-guides | 25 | Various backend/frontend/deployment guides |
| 60-portals | 12 | PORTAL-ADMIN-API-REFERENCE.md (915), PORTAL-TEACHER-GUIDE.md (930) |
| 20-architecture | 7 | 05-social.md (771), 17-data-warehouse.md (743) |
| 40-standards | 6 | ESTANDAR-12-FACTOR-APP.md (754), backend-profesional/07-testing-patterns.md (608) |
| 90-adr | 5 | ADR-013-react-query-adoption.md (802), ADR-041-simco-system.md (682) |
| 40-api | 1 | API-REFERENCE.md (548) |
| 30-ux-ui | 1 | FL-SYS-06-MULTI-TENANT-ISOLATION.md (506) |
| 00-overview | 1 | DEPLOYMENT.md (509) |
| 99-delivery | 3 | REPORTE-ACTUALIZACION-MANUALES-2025-11-23.md (541) |

---

## Systematic Patterns

### Pattern 1: Near-Zero Frontmatter (affects 8 of 13 sections)

Five sections have 0% frontmatter adoption (30-ux-ui, 40-api, 60-portals, 90-adr, 99-delivery). Three more sections are below 10% (20-architecture at 7.4%, 50-guides at 6.5%). The metadata that does exist uses at least 3 different schemas (`tipo`/`scope`/`version` vs `title`/`created`/`updated` vs `titulo`/`fecha_creacion`/`ultima_actualizacion`). Without a canonical frontmatter schema, even the existing frontmatter cannot be processed uniformly.

### Pattern 2: _INDEX.md / _MAP.md Inconsistency

The project convention requires both `_INDEX.md` (table of contents) and `_MAP.md` (need-based navigation) in every directory. In practice, some sections use only _INDEX.md (10-requirements), others only _MAP.md (most of 50-guides), and most are missing both in leaf directories. The 50-guides section is the worst offender with 37/41 directories lacking _INDEX.md. The 10-requirements section has _INDEX.md in 22/23 epics but _MAP.md in only 2/23.

### Pattern 3: Oversized Monolithic Files

82 files exceed 500 lines. The worst offenders are portal guide files (2,228, 1,843 lines) and standards files (1,863, 1,582, 1,453 lines). These files consistently violate 1FN by combining 5-15 independent topics (architecture + API + testing + patterns + flows) in a single document. The root cause is an initial documentation approach of "one comprehensive file per topic" that was never refactored into atomic documents.

### Pattern 4: Naming Convention Fragmentation

At least 4 naming conventions coexist: UPPERCASE-KEBAB-CASE (standard), CamelCase-Kebab (5 files in 50-guides/frontend/impl/), UPPERCASE_UNDERSCORE (10 files in 99-delivery), and lowercase-kebab (directories everywhere). The 40-standards section has a dual-prefix issue (19 `ESTANDAR-` files + 6 `STANDARD-` files).

### Pattern 5: Misplaced Content

Multiple sections contain content that belongs elsewhere: audit reports in 00-overview and 50-guides, testing guides in 10-requirements (violates ADR-039), implementation logs in 40-api, shell scripts in docs/ directories, and a system architecture document (RLS multi-tenant) in the UX/UI section.

### Pattern 6: Stale Metrics

Numeric metrics (component counts, endpoint counts, entity counts) are repeated across multiple files with divergent values. The endpoint count alone has 5 different values (850, 899, 901, 911, 912) across 40-api files. Component count shows "590/592" in 30-ux-ui vs the SSOT value of 575.

---

## Issue Registry (Prioritized)

### CRITICAL (18 issues)

| ID | Section | Description | Files Affected |
|----|---------|-------------|---------------|
| STR-CRIT-001 | 60-portals | 9 of 11 directories lack _INDEX.md, making navigation impossible for 4 portal subdirectories | `admin/`, `parents/`, `student/`, `teacher/`, 5 spec subdirs |
| STR-CRIT-002 | 50-guides | 37 of 41 directories lack _INDEX.md (90% absence) | All except root, `backend/impl/`, `backend/impl/_archived/`, `deployment/` |
| STR-CRIT-003 | 60-portals | `PORTAL-ADMIN-GUIDE.md` (2,228 lines) mixes 15+ independent topics | `admin/PORTAL-ADMIN-GUIDE.md` |
| STR-CRIT-004 | 60-portals | `PORTAL-STUDENT-GUIDE.md` (1,843 lines) duplicates content already in `specs/` | `student/PORTAL-STUDENT-GUIDE.md` |
| STR-CRIT-005 | 40-standards | `ESTANDAR-SEGURIDAD.md` (1,863 lines) bundles 2 OWASP taxonomies + 6 additional topics | `ESTANDAR-SEGURIDAD.md` |
| STR-CRIT-006 | 40-standards | `STANDARD-RESPONSIVE.md` exists on disk but is absent from `_INDEX.md` and `_MAP.md` | `STANDARD-RESPONSIVE.md`, `_INDEX.md`, `_MAP.md` |
| STR-CRIT-007 | 50-guides | `documentation-master/` is an audit report misplaced as a guide, with 10 subdirs lacking any navigation files | `documentation-master/GAMILIT-DOCUMENTATION-MASTER/` (entire tree) |
| STR-CRIT-008 | 50-guides | 5 files exceed 1,000 lines and require splitting | `GUIA-DESIGN-PATTERNS-NESTJS.md`, `GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md`, `DEPLOYMENT-MASTER.md`, `GUIA-RUNBOOK-POSTGRESQL.md`, `GUIA-E2E-PLAYWRIGHT.md` |
| STR-CRIT-009 | 30-ux-ui | `flujos/system/` directory is untracked in git, unreferenced in any index, and contains a miscategorized architecture doc | `flujos/system/FL-SYS-06-MULTI-TENANT-ISOLATION.md` |
| STR-CRIT-010 | 30-ux-ui | 0% frontmatter across all 80 files in the section | All 80 files in `docs/30-ux-ui/` |
| STR-CRIT-011 | 60-portals | 0% frontmatter across all 41 files in the section | All 41 files in `docs/60-portals/` |
| STR-CRIT-012 | 40-api | Endpoint counts diverge by up to 62 across 4 files (850, 899, 901, 911 vs SSOT 912) | `README.md`, `_INDEX.md`, `API-REFERENCE.md` |
| STR-CRIT-013 | 90-adr | ADR-040 and ADR-041 have incorrect numbers in H1 title ("ADR-0001"/"ADR-0002" instead of ADR-040/ADR-041) | `ADR-040-monorepo-architecture.md`, `ADR-041-simco-system.md` |
| STR-CRIT-014 | 90-adr | ADR-042 has no number in title ("ADR: Team vs Guild Terminology") | `ADR-042-team-vs-guild.md` |
| STR-CRIT-015 | 90-adr | ADR-043 uses date instead of number ("ADR-2026-01-07") | `ADR-043-consolidacion-bd.md` |
| STR-CRIT-016 | 90-adr | States contradict internally in 3 ADRs (header says Accepted, footer says Pending) | ADR-017, ADR-021, ADR-043 |
| STR-CRIT-017 | 80-references | `correcciones/_MAP.md` (434 lines) is an operational log masquerading as a navigation file -- violates 1FN | `transversal/correcciones/_MAP.md` |
| STR-CRIT-018 | 00-overview | Root `_MAP.md` absent -- only top-level section without navigation map | `docs/00-overview/` |

### HIGH (40 issues)

| ID | Section | Description | Files Affected |
|----|---------|-------------|---------------|
| STR-HIGH-001 | 00-overview | Broken link to `MODULOS-SISTEMA.md` (does not exist; should be `MODULOS.md`) | `README.md` line 18 |
| STR-HIGH-002 | 00-overview | `DEVOPS.md` (282 lines) mixes 10 independent topics | `DEVOPS.md` |
| STR-HIGH-003 | 00-overview | `_INDEX.md` duplicates entry for `MODULOS.md` (lines 13 and 29) | `_INDEX.md` |
| STR-HIGH-004 | 80-references | `knowledge-base/` lacks both `_INDEX.md` and `_MAP.md` | `knowledge-base/` directory |
| STR-HIGH-005 | 80-references | `transversal/arquitectura/` lacks both `_INDEX.md` and `_MAP.md` | `transversal/arquitectura/` directory |
| STR-HIGH-006 | 80-references | `transversal/correcciones/` lacks `_INDEX.md` | `transversal/correcciones/` directory |
| STR-HIGH-007 | 40-api | `_INDEX.md` and `_MAP.md` do not list 3 new portal API reference files | `_INDEX.md`, `_MAP.md` (missing PORTAL-PARENTS/STUDENT/TEACHER-API-REFERENCE) |
| STR-HIGH-008 | 40-api | `ADMIN-PORTAL-ENDPOINTS.md` is an implementation task log, not API documentation | `ADMIN-PORTAL-ENDPOINTS.md` |
| STR-HIGH-009 | 99-delivery | 10 of 20 markdown files use underscores instead of hyphens in names | 10 files in `2025-11-16-entrega-final/` |
| STR-HIGH-010 | 99-delivery | 3 legacy manual files coexist with current versions without internal deprecation markers | `Manual_Portal_Administrador_ACTUALIZADO.md`, `Manual_Portal_Maestros_ACTUALIZADO.md`, `Manual_Portal_Student_v1.0.md` |
| STR-HIGH-011 | 99-delivery | 4 RESUMEN files create quadruple coverage of the same delivery events | `RESUMEN_ACTUALIZACION.md`, `RESUMEN_CORRECCIONES_FINALES.md`, `RESUMEN_MANUALES.md`, `RESUMEN-CONSOLIDADO-ENTREGA.md` |
| STR-HIGH-012 | 99-delivery | `_INDEX.md` (9 lines) is a stub; `_MAP.md` missing at root | `_INDEX.md`, root directory |
| STR-HIGH-013 | 20-architecture | `COHERENCE-ENTITIES-DDL.md` mixes 4 independent concerns (1FN + 2FN violation) | `COHERENCE-ENTITIES-DDL.md` (482 lines) |
| STR-HIGH-014 | 20-architecture | `schema-reference/` lacks `_MAP.md` | `schema-reference/` directory |
| STR-HIGH-015 | 30-ux-ui | Root `_MAP.md` missing | `docs/30-ux-ui/` |
| STR-HIGH-016 | 30-ux-ui | `flujos/auth/` and `flujos/shared/` lack `_MAP.md` | 2 directories |
| STR-HIGH-017 | 30-ux-ui | FL-SYS-06 uses `FL-` prefix instead of project-standard `FLUJO-` | `FL-SYS-06-MULTI-TENANT-ISOLATION.md` |
| STR-HIGH-018 | 30-ux-ui | README.md states "590/592 components" vs SSOT value of 575 | `docs/30-ux-ui/README.md` |
| STR-HIGH-019 | 40-standards | `ESTANDAR-TESTING.md` (1,582 lines) mixes backend+frontend+E2E+architecture+visual testing | `ESTANDAR-TESTING.md` |
| STR-HIGH-020 | 60-portals | `PORTAL-ADMIN-API-REFERENCE.md` is in root instead of `admin/` subdirectory | `PORTAL-ADMIN-API-REFERENCE.md` |
| STR-HIGH-021 | 60-portals | 5 portal directories lack both `_INDEX.md` and `_MAP.md` | `admin/`, `parents/`, `student/`, `teacher/`, root |
| STR-HIGH-022 | 60-portals | 17 of 41 files exceed 500 lines (41%) | Various portal guides, specs, and traces |
| STR-HIGH-023 | 50-guides | `REACT-QUERY-MIGRATION-GUIDE.md` (682 lines) misplaced in root of 50-guides | `REACT-QUERY-MIGRATION-GUIDE.md` |
| STR-HIGH-024 | 50-guides | 3 deployment files marked DEPRECATED but still in active directory (not in `_archived/`) | `DEPLOYMENT-MASTER.md`, `GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md`, `GUIA-ACTUALIZACION-PRODUCCION.md` |
| STR-HIGH-025 | 50-guides | `.sh` script in docs directory | `testing/impl/MANUAL-TESTING-GUIDE-US-AE-007.sh` |
| STR-HIGH-026 | 10-requirements | `testing-guides/` in incorrect location per ADR-039 (should be in 50-guides/testing/) | `testing-guides/` directory (8 files) |
| STR-HIGH-027 | 10-requirements | ~80% of US-*.md files reference legacy epic IDs (EAI-001, EXT-001) in frontmatter `epic:` field | ~100+ US files |
| STR-HIGH-028 | 90-adr | 14 different variants for the State field across 47 ADRs | All 47 ADR files |
| STR-HIGH-029 | 90-adr | README.md desactualizado (missing ADR-046 through ADR-050) | `README.md` |
| STR-HIGH-030 | 90-adr | `_MAP.md` has incorrect category counts (Architecture: 9 should be 11; Frontend: 11 should be 12) | `_MAP.md` |
| STR-HIGH-031 | 90-adr | `_INDEX.md` does not reflect "Amended" status of ADR-011 | `_INDEX.md` |
| STR-HIGH-032 | 90-adr | ADRs 046-050 lack "Alternativas Consideradas" section required by template | 5 ADR files |
| STR-HIGH-033 | 90-adr | Pendientes without resolution documented as completed in 4 ADRs | ADR-010, ADR-020, ADR-021, ADR-043 |
| STR-HIGH-034 | 50-guides | `frontend/` and `testing/` directories lack both _INDEX.md and _MAP.md | 2 directories (7 direct files) |
| STR-HIGH-035 | 50-guides | 8 violations of 2FN across guide files (multiple independent topics) | Various backend, deployment, frontend, and testing guides |
| STR-HIGH-036 | 60-portals | 8 files violate 1FN (multiple unrelated topics in single document) | Various portal guides and specs |
| STR-HIGH-037 | 60-portals | Student guide duplicates 3 spec files (hooks, API contracts, gamification) | `PORTAL-STUDENT-GUIDE.md` vs `STUDENT-HOOKS-SPEC.md`, `SPEC-API-CONTRACTS.md`, `SPEC-GAMIFICATION.md` |
| STR-HIGH-038 | 99-delivery | `2025-11-16-entrega-final/` lacks `_INDEX.md` | `2025-11-16-entrega-final/` directory |
| STR-HIGH-039 | 10-requirements | 4 legacy directories not archived (03-desarrollo, 04-fase-backlog, sistema-recompensas, user-stories/) | 4 directories, ~14 files |
| STR-HIGH-040 | 10-requirements | `epics/features/` is not an epic but lives inside `epics/` directory | `epics/features/` (4 files) |

### MEDIUM (38 issues)

| ID | Section | Description | Files Affected |
|----|---------|-------------|---------------|
| STR-MED-001 | 00-overview | Frontmatter absent in 12/22 files (55%) | 12 files |
| STR-MED-002 | 00-overview | `DEPLOYMENT.md` at 509 lines -- splitting candidate | `DEPLOYMENT.md` |
| STR-MED-003 | 00-overview | `REPORTE-INTEGRAL-2026-01-20.md` is a historical audit misplaced in overview | `REPORTE-INTEGRAL-2026-01-20.md` |
| STR-MED-004 | 00-overview | `directivas/_INDEX.md` describes orchestration/ content, not 00-overview/ | `directivas/_INDEX.md` |
| STR-MED-005 | 70-onboarding | `ONBOARDING-AGENTES.md` ~60% duplicates CLAUDE.md (3FN violation) | `ONBOARDING-AGENTES.md` |
| STR-MED-006 | 70-onboarding | `_INDEX.md` and `README.md` overlap in purpose | Both files |
| STR-MED-007 | 80-references | `FLUJO-INICIALIZACION-USUARIO.md` mixes meta-documentation with actual content | `transversal/arquitectura/FLUJO-INICIALIZACION-USUARIO.md` |
| STR-MED-008 | 80-references | `BACKEND-CRITICAL-ISSUES-PENDING.md` is resolved historical doc in active references | `transversal/correcciones/BACKEND-CRITICAL-ISSUES-PENDING.md` |
| STR-MED-009 | 80-references | Broken link in `correcciones/_MAP.md` to archived document | `correcciones/_MAP.md` |
| STR-MED-010 | 20-architecture | `MODELO-DATOS.md` has stale metrics diverging from SSOT | `MODELO-DATOS.md` (508 lines) |
| STR-MED-011 | 20-architecture | `07-analytics.md` overlaps with `17-data-warehouse.md` and `18-admin-dashboard.md` | `schema-reference/07-analytics.md` |
| STR-MED-012 | 40-api | `API-REFERENCE.md` bundles 19 modules + WebSocket in single 548-line file | `API-REFERENCE.md` |
| STR-MED-013 | 40-api | `README.md` has two different endpoint counts (850 and 899) within 27 lines | `README.md` |
| STR-MED-014 | 99-delivery | `prepare_usb_delivery.sh` script misplaced in docs/ | `prepare_usb_delivery.sh` |
| STR-MED-015 | 99-delivery | 3 .docx files have spaces in names (cause CLI issues) | `Manual de Usuario.docx`, etc. |
| STR-MED-016 | 99-delivery | 4 files violate 1FN (multi-topic mixing) | `RESUMEN-CONSOLIDADO-ENTREGA.md`, `INSTRUCCIONES_ENTREGA_FINAL.md`, `08_CREDENCIALES_Y_ACCESOS.md`, `DATOS_COMPLETADOS.md` |
| STR-MED-017 | 40-standards | `ESTANDAR-API.md` security section overlaps with `ESTANDAR-SEGURIDAD.md` | `ESTANDAR-API.md` (1,453 lines) |
| STR-MED-018 | 40-standards | Frontmatter schema inconsistency: 3 different schemas across 12 files with frontmatter | 12 files with frontmatter |
| STR-MED-019 | 40-standards | Dual prefix: 19 `ESTANDAR-` files + 6 `STANDARD-` files | 6 `STANDARD-*.md` files |
| STR-MED-020 | 40-standards | `ESTANDAR-TESTING.md` duplicates implementation content from `docs/50-guides/testing/` | `ESTANDAR-TESTING.md` |
| STR-MED-021 | 40-standards | `07-testing-patterns.md` overlaps with `ESTANDAR-TESTING.md` in same parent directory | `backend-profesional/07-testing-patterns.md` |
| STR-MED-022 | 30-ux-ui | 8 audit/analysis docs mixed with navigation files in `flujos/` root | 8 files (AUDITORIA-*, TRACEABILITY-*, etc.) |
| STR-MED-023 | 30-ux-ui | README.md and _INDEX.md coexist with overlapping content in `flujos/` | Both files |
| STR-MED-024 | 60-portals | Parents portal has no `specs/` subdirectory -- all technical docs compressed in 826-line guide | `parents/PORTAL-PARENTS-GUIDE.md` |
| STR-MED-025 | 60-portals | `student/specs/gaps/` marked as resolved/historical but not archived | 5 gap files |
| STR-MED-026 | 60-portals | `student/specs/analysis/` is effectively empty (only a redirect _MAP.md) | `analysis/_MAP.md` |
| STR-MED-027 | 50-guides | 7 files with CamelCase/PascalCase naming violations | 5 admin page specs + `Frontend-Alert-System-Guide.md` + `BUILD_ERRORS.md` |
| STR-MED-028 | 50-guides | 3 testing guides overlap across sections (testing/TESTING-GUIDE.md vs backend/impl/TESTING-GUIDE.md vs frontend/impl/TESTING-GUIDE.md) | 3 TESTING-GUIDE.md files |
| STR-MED-029 | 10-requirements | _MAP.md coverage deficient at epic level (2/23 active epics = 9%) | 21 epics missing _MAP.md |
| STR-MED-030 | 10-requirements | Inconsistent task naming patterns (3 variants coexist) | ~1,200 TASK files |
| STR-MED-031 | 10-requirements | `EPIC-GAM-F3-TEACHER-PORTAL` lacks `_INDEX.md` (only active epic without one) | `EPIC-GAM-F3-TEACHER-PORTAL/` |
| STR-MED-032 | 20-architecture | Gamification module stubs (MODULO-1 through MODULO-5, 13-15 lines each) overlap with more detailed `DATOS-GAMIFICACION.md` in root | 5 `MODULO-*-MECANICAS.md` files |
| STR-MED-033 | 90-adr | Cross-reference in ADR-033 to "ADR-0001" is ambiguous (should be ADR-040) | `ADR-033-expansion-schemas-8-to-18.md` |
| STR-MED-034 | 50-guides | `GUIA-CREAR-BASE-DATOS.md` marked as legacy but not in `_archived/` | `backend/GUIA-CREAR-BASE-DATOS.md` |
| STR-MED-035 | 50-guides | `GUIA-RESPONSIVE-TESTING.md` in root should be in `testing/` | `GUIA-RESPONSIVE-TESTING.md` |
| STR-MED-036 | 50-guides | `GUIA-REFERENCIAS-SIMCO.md` in root should be in `orchestration/` | `GUIA-REFERENCIAS-SIMCO.md` |
| STR-MED-037 | 40-standards | `ESTANDAR-API.md` may overlap with `docs/50-guides/backend/impl/API-STANDARDS.md` | 2 files |
| STR-MED-038 | 20-architecture | `UUID-SERIES-CATALOG.md` is about seed infrastructure, not schema reference | `schema-reference/UUID-SERIES-CATALOG.md` |

### LOW (38 issues)

| ID | Section | Description |
|----|---------|-------------|
| STR-LOW-001 | 00-overview | Directories `directivas/` and `migracion/` in lowercase |
| STR-LOW-002 | 00-overview | `migracion/` lacks `_INDEX.md` (uses README.md informally) |
| STR-LOW-003 | 00-overview | Stubs: `VISION-ALCANCE.md` (3 lines), `ONBOARDING.md` (7 lines) -- intentional redirects |
| STR-LOW-004 | 70-onboarding | `_MAP.md` is the only file without frontmatter in the section |
| STR-LOW-005 | 70-onboarding | No onboarding doc for Admin or Stakeholder roles |
| STR-LOW-006 | 80-references | All 4 directories in lowercase (inconsistent with global convention) |
| STR-LOW-007 | 20-architecture | `MECANICAS-GAMIFICACION-V6.md` has version suffix in filename |
| STR-LOW-008 | 20-architecture | `17-18-placeholder.md` name conflicts with existing `17-data-warehouse.md` and `18-admin-dashboard.md` |
| STR-LOW-009 | 20-architecture | README.md files in lowercase (minor, Git convention) |
| STR-LOW-010 | 40-standards | `backend-profesional/` uses lowercase numbered naming (`01-principios-solid.md`) vs parent's UPPERCASE |
| STR-LOW-011 | 40-standards | `guias/` directory (redirect stub) lacks both _INDEX.md and _MAP.md |
| STR-LOW-012 | 40-standards | `08-referencias.md` (13 lines) is thin content -- could be merged into _INDEX.md |
| STR-LOW-013 | 40-standards | `ESTANDAR-FRONTEND-PROFESIONAL.md` includes testing patterns section that duplicates ESTANDAR-TESTING |
| STR-LOW-014 | 30-ux-ui | No `wireframes/` or `mockups/` directories (Figma is external SSOT but undocumented) |
| STR-LOW-015 | 30-ux-ui | 2 stubs at exact 9-line threshold (`flujos/auth/_INDEX.md`, `flujos/shared/_INDEX.md`) |
| STR-LOW-016 | 99-delivery | Agent execution logs (5 RESUMEN files) stored in docs/ rather than orchestration/trazas/ |
| STR-LOW-017 | 90-adr | 0% YAML frontmatter across all 47 ADRs |
| STR-LOW-018 | 90-adr | Mixed language (Spanish ADRs 001-032, English ADRs 040-050) |
| STR-LOW-019 | 90-adr | Emojis in ADR-018 section headings break canonical format |
| STR-LOW-020 | 90-adr | Status in all-caps ("ACEPTADO") in ADR-029, ADR-031 |
| STR-LOW-021 | 90-adr | Gender inconsistency ("Aceptada" vs "Aceptado") in ADRs 001-005 vs rest |
| STR-LOW-022 | 90-adr | ADR-005 lacks formal "Alternativas Consideradas" heading |
| STR-LOW-023 | 90-adr | Cross-refs to external ADR-0011 (workspace-arch) in ADR-038 unresolvable in standalone repo |
| STR-LOW-024 | 60-portals | 2 README.md files outside UPPERCASE-KEBAB convention |
| STR-LOW-025 | 60-portals | 3 borderline stubs in `student/specs/` subdirectory _MAP.md files |
| STR-LOW-026 | 60-portals | `student/specs/gaps/` resolved gaps not moved to `_deprecated/` |
| STR-LOW-027 | 50-guides | `backend/impl/_archived/_INDEX.md` is a 9-line stub |
| STR-LOW-028 | 50-guides | `integration/websocket/` only has _MAP.md (content removed, directory remains) |
| STR-LOW-029 | 50-guides | `troubleshooting/BUILD_ERRORS.md` uses underscore instead of hyphen |
| STR-LOW-030 | 10-requirements | ~76% of files are 3-line TASK stubs (intentional, but massive stub debt) |
| STR-LOW-031 | 10-requirements | 3 EPIC.md files use legacy IDs as titles (EXT-001, EXT-008, EAI-003-EXT) |
| STR-LOW-032 | 10-requirements | Mixed task patterns: F2-MODULES-M4M5 uses 3 different US-ID prefixes (M4, M5, M4M5) |
| STR-LOW-033 | 20-architecture | `10-store.md` is a deprecation redirect (36 lines) |
| STR-LOW-034 | 20-architecture | `RANGOS-MAYA.md` and `ECONOMIA-VIRTUAL.md` overlap with root `DATOS-GAMIFICACION.md` |
| STR-LOW-035 | 00-overview | Broken links: 2 total (MODULOS-SISTEMA.md, PLAN-RESTRUCTURACION) |
| STR-LOW-036 | 50-guides | All directories use lowercase naming (consistent internally but differs from doc standard) |
| STR-LOW-037 | 40-standards | `backend-profesional/` lacks `_MAP.md` |
| STR-LOW-038 | 40-standards | `ESTANDAR-BACKEND-PROFESIONAL.md` is a 32-line redirect stub |

---

## Cross-Section Findings

### Finding 1: Endpoint Count Discrepancies (40-api, CLAUDE.md, BACKEND_INVENTORY)

The endpoint count appears in at least 5 locations with 5 different values:

| Source | Value |
|--------|-------|
| `BACKEND_INVENTORY.yml` (SSOT) | 912 |
| `40-api/_INDEX.md` | 911 |
| `40-api/API-REFERENCE.md` | 901 |
| `40-api/README.md` (body) | 850 |
| `40-api/README.md` (Quick Ref) | 899 |

**Impact:** Any consumer of the documentation gets a different number depending on which file they read.

### Finding 2: Component Count Discrepancies (30-ux-ui, MASTER_INVENTORY)

| Source | Value |
|--------|-------|
| `MASTER_INVENTORY.yml` (SSOT) | 575 |
| `30-ux-ui/README.md` (line 88) | 590 |
| `30-ux-ui/README.md` (line 151) | 592 |

### Finding 3: Metric Stale Data in MODELO-DATOS.md (20-architecture)

`MODELO-DATOS.md` contains a summary table with 6 metrics that diverge from the SSOT (`schema-reference/_INDEX.md` v3.0.0): tables 172 vs 173, views 22 vs 18, functions 183 vs 158, triggers 67 vs 68, RLS 237 vs 251, FKs 299 vs 301.

### Finding 4: Testing Content Scattered Across 4 Sections

Testing documentation exists in:
- `docs/10-requirements/testing-guides/` (8 QA exercise guides -- misplaced per ADR-039)
- `docs/40-standards/ESTANDAR-TESTING.md` (1,582 lines -- strategy + implementation mixed)
- `docs/50-guides/testing/` (5 testing guides + impl/)
- `docs/00-overview/TESTING-STRATEGY.md` (258 lines)

Content overlaps between all four locations, with `ESTANDAR-TESTING.md` partially duplicating guides from `50-guides/testing/`.

### Finding 5: Misplaced Content Across Multiple Sections

| Content | Current Location | Correct Location |
|---------|-----------------|-----------------|
| Exercise QA testing guides | `10-requirements/testing-guides/` | `50-guides/testing/` |
| Documentation audit report | `50-guides/documentation-master/` | `orchestration/tareas/` or `99-delivery/` |
| Historical audit report | `00-overview/REPORTE-INTEGRAL-2026-01-20.md` | `orchestration/trazas/` |
| Resolved issues doc | `80-references/transversal/correcciones/BACKEND-CRITICAL-ISSUES-PENDING.md` | `orchestration/trazas/` |
| Admin API reference | `60-portals/PORTAL-ADMIN-API-REFERENCE.md` | `60-portals/admin/` |
| RLS architecture doc | `30-ux-ui/flujos/system/FL-SYS-06-*.md` | `20-architecture/` |
| Shell script | `50-guides/testing/impl/MANUAL-TESTING-GUIDE-US-AE-007.sh` | `apps/backend/test/scripts/` |
| React Query migration guide | `50-guides/REACT-QUERY-MIGRATION-GUIDE.md` | `50-guides/frontend/` or `50-guides/frontend/impl/` |

### Finding 6: Inconsistent README.md vs _INDEX.md Coexistence

Multiple sections have both README.md and _INDEX.md at the same level with overlapping content:

- `docs/70-onboarding/` (README + _INDEX list the same 3 docs)
- `docs/80-references/` (README + _INDEX list the same directories)
- `docs/30-ux-ui/flujos/` (README + _INDEX list the same flows)
- `docs/60-portals/student/specs/` (README at 858 lines acts as mega-index)

The distinction between README (entry point) and _INDEX (table of contents) is not formally defined, leading to content duplication.

---

## Recommendations for Phase 2

Phase 2 (Content Analysis) should focus on the following areas identified by this structural audit:

### Priority Focus Areas

1. **Metric accuracy audit:** Verify all numeric claims (endpoint counts, component counts, entity counts, table counts) across all files against SSOT inventories. This structural audit found at least 3 systematic metric divergences.

2. **Content duplication map:** The structural audit identified 15+ pairs of files with overlapping content (portal guides vs specs, ESTANDAR-TESTING vs 50-guides/testing, etc.). Phase 2 should quantify the actual overlap percentage and recommend consolidation targets.

3. **Legacy ID audit in 10-requirements:** ~100+ US files reference legacy epic IDs (EAI-*, EXT-*) in YAML frontmatter. Phase 2 should provide a complete list and generate a remediation script.

4. **ADR state reconciliation:** The 14 state variants across 47 ADRs need content review to determine correct canonical states. The 4 ADRs with contradictory states (header vs footer) need specific resolution decisions.

5. **Stub content assessment in 10-requirements:** With ~76% of files being 3-line stubs, Phase 2 should determine: (a) which stubs serve a legitimate trazabilidad purpose, (b) which can be consolidated, and (c) whether the stub template provides enough information.

6. **Cross-section reference validation:** The structural audit found 4 broken links and multiple ambiguous cross-references. Phase 2 should systematically validate all inter-file references.

7. **Frontmatter schema definition:** Before mass-generating frontmatter, Phase 2 should propose a canonical schema (fields, types, allowed values) based on the 3 existing variants found in 40-standards.

---

## Appendix: Per-Section Summaries

### A.1 docs/00-overview, 70-onboarding, 80-references (Report P1-1A-1)

37 files across 3 sections. Key issues: `00-overview/` is the only top-level section without `_MAP.md`; broken link to `MODULOS-SISTEMA.md` in README; `correcciones/_MAP.md` contains 434 lines of operational logs instead of navigation; `DEVOPS.md` mixes 10 topics. 70-onboarding is the healthiest section (83% frontmatter, all navigation present). 80-references has 4 directories missing _INDEX.md.
**Full report:** `P1-1A-1-overview-onboarding-references.md`

### A.2 docs/40-api, 99-delivery (Report P1-1A-2)

41 files. Key issues: 0% frontmatter across both sections; endpoint counts diverge by 62 across files; `_INDEX.md`/`_MAP.md` missing 3 new portal API files; 99-delivery has 10 naming violations (underscores), 3 legacy manual duplicates, 4 overlapping RESUMEN files, and 3 .docx files with spaces in names.
**Full report:** `P1-1A-2-api-delivery.md`

### A.3 docs/20-architecture (Report P1-1B-1)

54 files. Key issues: only 7.4% frontmatter; `COHERENCE-ENTITIES-DDL.md` mixes 4 independent concerns; `MODELO-DATOS.md` has stale metrics; `schema-reference/` missing `_MAP.md`; 8 files >500 lines (largest: `03-education.md` at 1,208); schema coverage is complete at ~98% (170/173 tables).
**Full report:** `P1-1B-1-architecture.md`

### A.4 docs/30-ux-ui (Report P1-1B-2)

80 files. Key issues: 0% frontmatter (worst section for this metric); `flujos/system/` is untracked in git and unreferenced; the sole file there uses wrong naming prefix (`FL-` vs `FLUJO-`) and documents RLS architecture (wrong section); 3 directories missing `_MAP.md`; README.md has stale component counts. Health: 71/100.
**Full report:** `P1-1B-2-ux-ui.md`

### A.5 docs/40-standards (Report P1-1B-3)

38 files. Key issues: `STANDARD-RESPONSIVE.md` not in indices; `ESTANDAR-SEGURIDAD.md` at 1,863 lines mixes 8 topics; dual prefix (ESTANDAR- vs STANDARD-); 3 different frontmatter schemas; 10 files >500 lines (59% of directory by line count); testing content overlaps with 50-guides/testing/.
**Full report:** `P1-1B-3-standards.md`

### A.6 docs/90-adr (Report P1-1B-4)

50 files (47 ADRs + 3 index/meta). Key issues: 4 ADRs with incorrect numbers in H1 titles; 14 state variants; 0% frontmatter; 9/47 ADRs non-compliant with template (missing "Alternativas Consideradas"); README.md missing 5 recent ADRs; `_MAP.md` has counting errors in distribution table. Template compliance: 81%.
**Full report:** `P1-1B-4-adr.md`

### A.7 docs/60-portals (Report P1-1B-5)

41 files. Key issues: worst overall health (44/100); 0% frontmatter; 9/11 dirs missing _INDEX.md; 5/11 dirs missing _MAP.md; 2 files >1,800 lines; 17/41 files >500 lines; 8 files violate 1FN; 8 files violate 2FN; student guide duplicates 3 spec files; admin API reference misplaced in root.
**Full report:** `P1-1B-5-portals.md`

### A.8 docs/50-guides (Report P1-1C-1)

155 files. Key issues: worst _INDEX.md coverage (4/41 dirs = 10%); `documentation-master/` audit report misplaced as guide with 10 empty subdirectories; 30 files >500 lines (5 >1,000); 3 DEPRECATED files in active directory; CamelCase naming in 5 frontend spec files; shell script in docs/; frontmatter at only 6.5%. Health: 52/100.
**Full report:** `P1-1C-1-guides.md`

### A.9 docs/10-requirements (Report P1-1C-2)

1,631 files. Key issues: ~76% are 3-line TASK stubs; testing-guides misplaced per ADR-039; ~80% of US-*.md reference legacy epic IDs; 4 legacy directories not archived; `epics/features/` is not an epic; _MAP.md present in only 2/23 active epics; 3 coexisting task naming patterns. ADR-034 hierarchy compliance is high (EPIC.md 34/34, _INDEX.md 22/23).
**Full report:** `P1-1C-2-requirements.md`

---

*Synthesis generated: 2026-02-27*
*Source reports: 9 sub-agent audits (P1-1A-1 through P1-1C-2)*
*Total issues registered: 134 (18 Critical + 40 High + 38 Medium + 38 Low)*
*No files were modified during this audit*
