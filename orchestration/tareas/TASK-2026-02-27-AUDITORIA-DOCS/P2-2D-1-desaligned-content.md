# P2-2D-1: Desaligned Content Audit

**Phase:** 2 (Content Analysis) | **Sub-phase:** 2D (Desalignment Detection)
**Date:** 2026-02-27
**Status:** Complete
**Scope:** Full docs/, apps/ legacy dirs, orchestration/ cross-references

---

## Executive Summary

This audit identified **67 discrete findings** across 6 categories. The most impactful areas are:

| Category | Count | HIGH | MEDIUM | LOW |
|----------|-------|------|--------|-----|
| Legacy/Orphan Directories | 18 | 5 | 8 | 5 |
| Files Without Clear Purpose | 14 | 3 | 7 | 4 |
| Contradictory Content | 12 | 6 | 4 | 2 |
| Consolidation Candidates | 11 | 2 | 6 | 3 |
| 99-delivery Assessment | 7 | 1 | 4 | 2 |
| Broken Cross-References | 5 | 3 | 2 | 0 |
| **Total** | **67** | **20** | **31** | **16** |

---

## 1. Legacy/Orphan Directories (18 findings)

### 1.1 docs/ Legacy Directories

| # | Path | Status | Action | Priority | Notes |
|---|------|--------|--------|----------|-------|
| L1 | `docs/10-requirements/04-fase-backlog/` | LEGACY | ARCHIVE | MEDIUM | 2 files (FUNCIONALIDADES-GAMIFICACION-PENDIENTES.md + README). Backlog content now lives in epics + orchestration/scrum. Not referenced from any _INDEX. |
| L2 | `docs/10-requirements/sistema-recompensas/` | LEGACY | ARCHIVE | HIGH | 11 files describing rewards system architecture. Content superseded by `20-architecture/gamificacion/` and schema-reference. Contains duplicate DDL descriptions, old API contracts, and completed correction logs (07-CORRECCION-SISTEMA-MISIONES.md). Not referenced from 10-requirements/_INDEX.md. |
| L3 | `docs/10-requirements/features/` | LEGACY | ARCHIVE | MEDIUM | 3 files (ANALISIS-FEATURES-P3-ESTRATEGICAS.md, FEATURES-PENDIENTES.md, RESUMEN-EJECUTIVO-DECISIONES-P3.md). Phase 3 strategic analysis documents. Content superseded by epic-level planning. Not referenced from _INDEX. |
| L4 | `docs/10-requirements/user-stories/` | ORPHAN | DELETE | LOW | Contains only `_MOVED.md` redirect stub. Entire directory exists solely as a bridge to `epics/`. The stub itself references the correct location. Single-file redirect directory. |
| L5 | `docs/10-requirements/epics/03-desarrollo/` | LEGACY | DELETE | MEDIUM | Legacy development directory inside epics tree. Contains 1 file: `base-de-datos/MAPEO-requirements-IMPLEMENTACION.md`. Not referenced from any index. Pre-dates epic structure. |
| L6 | `docs/10-requirements/testing-guides/` | ORPHAN | MOVE | HIGH | 8 files (5 module test guides + README + _INDEX + _MAP). Testing guides should be in `docs/50-guides/testing/`, not in `10-requirements/`. Content is active and useful but misplaced per project taxonomy. Not referenced from 10-requirements/_INDEX.md. |
| L7 | `docs/00-overview/migracion/` | LEGACY | DELETE | LOW | 3 files (README, README-FASE-5, _MAP-FASE-5). All marked "Legacy" and "completed". Historical migration process documentation with no current relevance. Total 93 lines. |
| L8 | `docs/00-overview/directivas/` | ORPHAN | DELETE | MEDIUM | Contains only `_INDEX.md` (1 file). The _INDEX references two files that do NOT exist (DIRECTIVA-GAMILIT-EJERCICIOS.md, DIRECTIVA-GAMILIT-GAMIFICACION.md, both listed as "Pendiente"). Also contains stale metrics (170 tables instead of 173, 22 modules instead of 23, 850 endpoints instead of 912, 152 entities instead of 156). Entire directory is a dead-end redirect to `orchestration/directivas/`. |
| L9 | `docs/30-ux-ui/flujos/system/` | ORPHAN | MOVE | MEDIUM | Contains 1 file: `FL-SYS-06-MULTI-TENANT-ISOLATION.md` (506 lines, Active). The file is legitimate content but the `system/` directory is untracked -- not referenced from `flujos/_INDEX.md` or `flujos/_MAP.md`. Needs registration in indexes or move to `shared/`. |
| L10 | `docs/40-standards/guias/` | ORPHAN | DELETE | LOW | Contains 1 file: `README.md` (redirect stub pointing to `50-guides/` and `60-portals/`). Single-file redirect directory. |

### 1.2 docs/ _archived Directories (properly organized but accumulating)

| # | Path | Status | Action | Priority | Notes |
|---|------|--------|--------|----------|-------|
| L11 | `docs/50-guides/deployment/_archived/` | LEGACY | KEEP | LOW | 9 files. Properly archived. However, 3 files in the parent directory are marked DEPRECATED (DEPLOYMENT-MASTER.md, GUIA-ACTUALIZACION-PRODUCCION.md, GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md) but NOT moved to _archived. See finding L18. |
| L12 | `docs/50-guides/backend/impl/_archived/` | LEGACY | KEEP | LOW | 4 files. Properly archived (API-CONVENTIONS, NAMING-CONVENTIONS-API, README, _INDEX). |
| L13 | 8x `_archived/` dirs in `10-requirements/epics/` | LEGACY | KEEP | LOW | Total ~35 files across F2-DB-MIGRATION, F2-MODULES-M4M5, F2-TECH-CONSOLIDATION, F3-ADMIN-EXTENDED, F3-SOCIAL-GAMIFICATION, GAM-BACKEND, GAM-FRONTEND. These are properly organized historical records tied to completed epics. |

### 1.3 apps/ Legacy Directories

| # | Path | Status | Action | Priority | Notes |
|---|------|--------|--------|----------|-------|
| L14 | `apps/backend/_deprecated/migrations-maya-rank-2025-11-29/` | LEGACY | KEEP | LOW | 3 files (migration script + README). Completed one-time migration from Nov 2025. Safe to keep for audit trail. |
| L15 | `apps/frontend/src/components/_legacy/dashboard-migration-sprint/` | LEGACY | DELETE | MEDIUM | 5 components (ModuleCard, ModulesGrid, MotivationalBanner, PendingActivitiesList, RecentActivityFeed). Not imported anywhere in active code. Dashboard has been migrated. |
| L16 | `apps/frontend/src/pages/_legacy/DashboardPage.tsx` | LEGACY | DELETE | MEDIUM | Single file. Not referenced from App.tsx routes. Replaced by portal-specific dashboard pages. Only self-references its own legacy components. |
| L17 | `apps/frontend/src/shared/layouts/_legacy/DashboardLayout.tsx` | LEGACY | DELETE | MEDIUM | Single file. Not imported by any active route or component. Replaced by PortalLayout. |
| L18 | 3x DEPRECATED files in `docs/50-guides/deployment/` | LEGACY | ARCHIVE | HIGH | DEPLOYMENT-MASTER.md (1074 lines), GUIA-ACTUALIZACION-PRODUCCION.md (line 4 says DEPRECATED), GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md (line 4 says DEPRECATED). All three are explicitly marked DEPRECATED since 2026-02-24 but remain in the active directory instead of _archived/. Phase 1 also flagged this. |

---

## 2. Files Without Clear Purpose (14 findings)

### 2.1 One-Time Audit/Report Files in Active Directories

| # | Path | Status | Action | Priority | Notes |
|---|------|--------|--------|----------|-------|
| F1 | `docs/30-ux-ui/flujos/AUDITORIA-CONSISTENCIA-FE-BE-DB.md` | ORPHAN | ARCHIVE | MEDIUM | 116-line one-time audit report. Not a living document. |
| F2 | `docs/30-ux-ui/flujos/AUDITORIA-FASE1-CALIDAD-FLUJOS-2026-02-17.md` | ORPHAN | ARCHIVE | MEDIUM | 130-line dated audit report (Feb 17 2026). |
| F3 | `docs/30-ux-ui/flujos/AUDITORIA-P0-RESULTADOS.md` | ORPHAN | ARCHIVE | MEDIUM | 150-line P0 results report. |
| F4 | `docs/30-ux-ui/flujos/AUDITORIA-RESIDUAL-FULL.md` | ORPHAN | ARCHIVE | MEDIUM | 121-line residual audit. |
| F5 | `docs/30-ux-ui/flujos/REPORTE-FINAL-CONFORMIDAD-FULL.md` | ORPHAN | ARCHIVE | LOW | 38 lines. Marked "Estado: Cerrado". Completed one-time report. |
| F6 | `docs/30-ux-ui/flujos/VALIDACION-ANALISIS-VS-INTEGRACION.md` | ORPHAN | ARCHIVE | LOW | 100 lines. Marked "Estado: Cerrado". |
| F7 | `docs/00-overview/REPORTE-INTEGRAL-2026-01-20.md` | ORPHAN | MOVE | MEDIUM | 110-line integral report. Belongs in `orchestration/tareas/` (like other task reports), not in overview. |

### 2.2 Resolved Gap/Trace Files

| # | Path | Status | Action | Priority | Notes |
|---|------|--------|--------|----------|-------|
| F8 | `docs/60-portals/student/specs/gaps/` (5 files) | LEGACY | ARCHIVE | HIGH | All 5 STUDENT-GAP files are marked RESOLVED in _MAP.md. Content consolidated into SPEC-*.md files. _MAP.md itself says "ARCHIVO HISTORICO". These resolved gaps add no active value. |
| F9 | `docs/60-portals/student/specs/traces/` (3 files) | LEGACY | ARCHIVE | LOW | TRACE-P0-CORRECTIONS.md, TRACE-EXERCISE-BUTTONS-FIX-2025-11-29.md, TRACE-DASHBOARD-ERRORS-FIX-2026-01-04.md. All marked "Completo". Historical fix traces. |
| F10 | `docs/60-portals/student/specs/analysis/` (1 file) | ORPHAN | DELETE | MEDIUM | Contains only _MAP.md (redirect stub). No actual analysis files. References non-existent `docs/99-archivados/` and non-existent `orchestration/analisis/`. Phase 1 also flagged this. |
| F11 | `docs/60-portals/student/specs/inventory/` (2 files) | LEGACY | ARCHIVE | LOW | IMPLEMENTATIONS-2025-11-24.md is a completed P0 sprint inventory from Nov 2025. Historical only. |

### 2.3 Misplaced Content

| # | Path | Status | Action | Priority | Notes |
|---|------|--------|--------|----------|-------|
| F12 | `docs/50-guides/documentation-master/` | ORPHAN | MOVE | HIGH | Entire directory tree (11 files across 8 subdirectories). This is a documentation audit/analysis project, not a "guide". Contains YAML catalogs, data flow maps, coherence matrices. Should be in `orchestration/tareas/` as a completed task deliverable, or consolidated into relevant architecture docs. Deeply nested (3 levels: documentation-master/GAMILIT-DOCUMENTATION-MASTER/fase-N/). |
| F13 | `docs/40-api/ADMIN-PORTAL-ENDPOINTS.md` | LEGACY | ARCHIVE | MEDIUM | 189-line "P2 Admin Portal Endpoints Implementation" report dated 2026-01-07. Superseded by `docs/60-portals/PORTAL-ADMIN-API-REFERENCE.md` (915 lines). |
| F14 | `docs/40-api/WEB-PUSH-MIGRATION.md` | LEGACY | MOVE | LOW | 463-line migration report from 2025-11-29. One-time migration doc. Could move to `90-adr/` or `orchestration/tareas/`. |

---

## 3. Contradictory Content (12 findings)

### 3.1 Technology Version Contradictions

| # | Scope | Status | Action | Priority | Correct Value | Wrong Value | Files Affected |
|---|-------|--------|--------|----------|---------------|-------------|----------------|
| C1 | PostgreSQL version | CONTRADICTORY | UPDATE | HIGH | PostgreSQL 15 | PostgreSQL 16 | 38 files: 21 PLAN.md files in epics, 5+ wave-3 EPICs, 8 delivery files, ~4 others. All PLAN.md files have `PostgreSQL 16` in Enfoque Tecnico section. |
| C2 | Vite version | CONTRADICTORY | UPDATE | HIGH | Vite 6.x | Vite 7.x | 11 files: 7 PLAN.md files in epics, 2 wave-3 epics, 2 delivery files. |
| C3 | localhost port | CONTRADICTORY | UPDATE | HIGH | localhost:3006 | localhost:3000 | 11 files: ADMIN-PORTAL-ENDPOINTS, ESTANDAR-API, ESTANDAR-TESTING, 2x SETUP-DEVELOPMENT, API-CONVENTIONS (_archived), API-INTEGRATION, ESTRUCTURA-SHARED, 2x STUDENT-GAP files. |
| C4 | React version | CONTRADICTORY | UPDATE | MEDIUM | React 19 | React 18 | 3 files: 2 notification user stories (US-NOT-001b, US-NOT-001c), STANDARD-COMPONENT.md (reference context). |

### 3.2 Architectural Contradictions

| # | Scope | Status | Action | Priority | Notes |
|---|-------|--------|--------|----------|-------|
| C5 | EPIC-GAM-K8S | CONTRADICTORY | UPDATE | HIGH | This epic describes Kubernetes deployment (StatefulSets, HPA, Ingress, etc.) and is marked "completed". However, gamilit uses PM2 on a dedicated server, NOT Kubernetes. The epic's DoD checklist is entirely unchecked. Status should be "cancelled" or "not_applicable". |
| C6 | Directivas _INDEX stale metrics | CONTRADICTORY | UPDATE | MEDIUM | `docs/00-overview/directivas/_INDEX.md` cites 170 tables (actual: 173), 22 modules (actual: 23), 850 endpoints (actual: 912), 152 entities (actual: 156), 458 components (actual: 575). Every metric is outdated. |
| C7 | SCHEMA-REFERENCE.md redirect | CONTRADICTORY | UPDATE | LOW | `docs/20-architecture/SCHEMA-REFERENCE.md` redirect lists "172 tablas" and "237 RLS policies" -- actual is 173 tables and 251 RLS policies. |
| C8 | MECANICAS-GAMIFICACION-V6.md | CONTRADICTORY | UPDATE | LOW | 22-line file marked "Indice Legacy" and "contenido segmentado". Contains no useful content beyond pointing to `gamificacion/`. Should be a redirect stub or deleted. |
| C9 | 00-overview/DEPLOYMENT.md full content | CONTRADICTORY | MERGE | HIGH | 509-line COMPLETE deployment guide in 00-overview (overview section). Not a redirect despite the same domain being covered by `50-guides/deployment/GUIA-VALIDACION-PRODUCCION.md` (active). Creates dual-source-of-truth for deployment info. Content overlaps significantly with 50-guides/deployment/ docs. |
| C10 | Dual naming ESTANDAR-* vs STANDARD-* | CONTRADICTORY | UPDATE | MEDIUM | 40-standards/ has 19 ESTANDAR-*.md files and 6 STANDARD-*.md files. Mixed Spanish/English naming convention. STANDARD-API.md (205 lines) coexists with ESTANDAR-API.md (1453 lines) covering similar domain. |
| C11 | Portal API Reference duplication | CONTRADICTORY | MERGE | MEDIUM | PORTAL-TEACHER-API-REFERENCE.md exists in both `40-api/` (348 lines) and `60-portals/teacher/` (1192 lines). PORTAL-ADMIN-API-REFERENCE.md in `60-portals/` root (not in admin/ subdir). Inconsistent placement pattern. |
| C12 | Broken reference to `docs/99-archivados/` | CONTRADICTORY | UPDATE | MEDIUM | At least 4 files reference `docs/99-archivados/historicos-2025/` which does NOT exist. Found in student specs analysis/_MAP.md, specs/README.md, plus correcciones/_MAP.md and ADR references to `orchestration/analisis/` (also non-existent). |

---

## 4. Consolidation Candidates (11 findings)

### 4.1 Small Files Cluster in 00-overview

| # | Path | Status | Action | Priority | Notes |
|---|------|--------|--------|----------|-------|
| G1 | 8 micro-files in `docs/00-overview/` | CONSOLIDATION-CANDIDATE | MERGE | MEDIUM | PORTALES.md (17 lines), METRICAS.md (19 lines), GOBIERNO-SIMCO.md (19 lines), ESTADO-ACTUAL.md (20 lines), GAMIFICACION.md (21 lines), REQUERIMIENTOS.md (21 lines), MODULOS-EDUCATIVOS.md (23 lines), VISION.md (26 lines). Total: ~166 lines across 8 files. Most are thin summaries pointing elsewhere. Could merge into README.md or a single OVERVIEW.md. |
| G2 | IDENTIDAD.md + ESTRUCTURA-DOCS.md + COMANDOS-VALIDACION.md | CONSOLIDATION-CANDIDATE | MERGE | LOW | 29 + 30 + 31 = 90 lines. Three more micro-files that could fold into README.md. |

### 4.2 documentation-master Phase Directories

| # | Path | Status | Action | Priority | Notes |
|---|------|--------|--------|----------|-------|
| G3 | 7 fase-N/ directories in documentation-master | CONSOLIDATION-CANDIDATE | MERGE | MEDIUM | Each contains exactly 1 file (YAML or MD). 7 directories for 7 files is excessive nesting. Could flatten to 7 files in one directory. |

### 4.3 Single-File Portal Directories

| # | Path | Status | Action | Priority | Notes |
|---|------|--------|--------|----------|-------|
| G4 | `docs/60-portals/admin/` | CONSOLIDATION-CANDIDATE | KEEP | LOW | Contains only PORTAL-ADMIN-GUIDE.md. Meanwhile PORTAL-ADMIN-API-REFERENCE.md is at the 60-portals/ root level instead of in admin/. |
| G5 | `docs/60-portals/parents/` | CONSOLIDATION-CANDIDATE | KEEP | LOW | Contains only PORTAL-PARENTS-GUIDE.md. |

### 4.4 Gamification Architecture Overlap

| # | Path | Status | Action | Priority | Notes |
|---|------|--------|--------|----------|-------|
| G6 | ARQUITECTURA-GAMIFICACION.md + DATOS-GAMIFICACION.md + gamificacion/ dir | CONSOLIDATION-CANDIDATE | MERGE | HIGH | Three sources of gamification architecture info at `20-architecture/` level: ARQUITECTURA-GAMIFICACION.md (398 lines), DATOS-GAMIFICACION.md (376 lines), plus `gamificacion/` subdirectory with 13 files. MECANICAS-GAMIFICACION-V6.md is a dead legacy index. Recommend: move the two standalone files into `gamificacion/` or establish clear SSOT. |
| G7 | MODELO-DATOS.md + COHERENCE-ENTITIES-DDL.md + schema-reference/ | CONSOLIDATION-CANDIDATE | KEEP | LOW | Related but distinct purposes: MODELO-DATOS is conceptual, COHERENCE is entity-DDL alignment, schema-reference is per-table docs. Acceptable separation. |

### 4.5 Correcciones Directory

| # | Path | Status | Action | Priority | Notes |
|---|------|--------|--------|----------|-------|
| G8 | `docs/80-references/transversal/correcciones/` | CONSOLIDATION-CANDIDATE | ARCHIVE | MEDIUM | 2 files + _MAP. Both issues are marked "Corregido" and "Resuelto". Active issues should be in orchestration/tareas; resolved ones have no value here. |

### 4.6 Standards Naming

| # | Path | Status | Action | Priority | Notes |
|---|------|--------|--------|----------|-------|
| G9 | 6x STANDARD-*.md in `40-standards/` | CONSOLIDATION-CANDIDATE | MERGE | MEDIUM | STANDARD-API.md (205 lines) overlaps ESTANDAR-API.md (1453 lines). STANDARD-COMPONENT.md, STANDARD-IMPORTS.md, STANDARD-RESPONSIVE.md, STANDARD-TYPES.md, STANDARD-UX-PATTERNS.md use English naming while 19 ESTANDAR-* use Spanish. Recommend: consolidate under one naming convention. |
| G10 | ESTANDAR-NOMENCLATURA.md + ESTANDAR-NOMENCLATURA-API.md | CONSOLIDATION-CANDIDATE | MERGE | LOW | Two nomenclature standards that could be one. |
| G11 | `docs/50-guides/frontend/impl/` deep nesting | CONSOLIDATION-CANDIDATE | KEEP | LOW | Several single-file leaf dirs: dto/, types/, admin/components/, admin/hooks/, teacher/constants/, teacher/types/. Deep nesting for single files but follows impl-by-portal pattern. |

---

## 5. 99-delivery Assessment (7 findings)

### Classification of 99-delivery/2025-11-16-entrega-final/ contents:

| # | File(s) | Classification | Action | Priority | Notes |
|---|---------|---------------|--------|----------|-------|
| D1 | 8x .docx files (Actas, Anexos, Convenio, Constancia, Manuales) | DELIVERY-ARTIFACT | KEEP | -- | Official delivery documents (legal/academic). Binary files. Must be preserved as-is for audit trail. |
| D2 | Manual_Portal_Administrador_ACTUALIZADO.md (2666 lines), Manual_Portal_Maestros_ACTUALIZADO.md (1617 lines), Manual_Portal_Student_v1.0.md (1859 lines) | ACTIVE-REFERENCE | KEEP | LOW | These are the most comprehensive user manuals in the project. Still relevant as reference. However, they may drift from current UI. |
| D3 | MANUAL-USUARIO-PORTAL-ADMINISTRADOR.md (362), MANUAL-USUARIO-PORTAL-ESTUDIANTE.md (533), MANUAL-USUARIO-PORTAL-MAESTROS.md (379) | LEGACY | ARCHIVE | MEDIUM | Shorter, older versions of the manuals. Superseded by the _ACTUALIZADO variants (D2). Creates confusion about which is canonical. |
| D4 | REPORTE-ACTUALIZACION-MANUALES-2025-11-23.md (541 lines) | LEGACY | ARCHIVE | LOW | One-time update report. Historical reference only. |
| D5 | RESUMEN_ACTUALIZACION.md, RESUMEN_CORRECCIONES_FINALES.md, RESUMEN_MANUALES.md, RESUMEN-CONSOLIDADO-ENTREGA.md | LEGACY | ARCHIVE | MEDIUM | Four summary/correction docs totaling ~915 lines. One-time delivery preparation artifacts. |
| D6 | 08_CREDENCIALES_Y_ACCESOS.md (217 lines) | SENSITIVE | REVIEW | HIGH | Contains credentials and access information. Should be verified that no production secrets are committed. Should have been excluded or redacted for repo storage. |
| D7 | prepare_usb_delivery.sh | LEGACY | ARCHIVE | LOW | One-time USB delivery preparation script. No longer needed. |

---

## 6. Broken Cross-References (5 findings)

| # | Reference Target | Status | Action | Priority | Files Referencing |
|---|-----------------|--------|--------|----------|-------------------|
| X1 | `docs/99-archivados/historicos-2025/student-portal-analysis-2025-11/` | BROKEN | UPDATE | HIGH | `docs/60-portals/student/specs/analysis/_MAP.md`, `docs/60-portals/student/specs/README.md`. Directory does not exist. |
| X2 | `orchestration/analisis/` (GAPS-STUDENT-PORTAL.yml, AUDITORIA-STUDENT-PORTAL-2026-01-24.md, ANALISIS-STUDENT-PORTAL-COMPLETO-2026-01-20.md) | BROKEN | UPDATE | HIGH | `docs/60-portals/student/specs/gaps/_MAP.md`, `docs/60-portals/student/specs/analysis/_MAP.md`. Directory does not exist. |
| X3 | `orchestration/work-items/epics/EPIC-GAM-K8S.yml` | BROKEN | UPDATE | HIGH | `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-K8S/EPIC.md`. Likely does not exist given K8s was never actually adopted. |
| X4 | `docs/00-overview/directivas/DIRECTIVA-GAMILIT-EJERCICIOS.md` and `DIRECTIVA-GAMILIT-GAMIFICACION.md` | BROKEN | UPDATE | MEDIUM | `docs/00-overview/directivas/_INDEX.md`. Listed as "Pendiente" but files never created. |
| X5 | `docs/10-requirements/epics/_wave-3-technical/user-stories/` -> `../user-stories/` in K8s EPIC | BROKEN | UPDATE | MEDIUM | `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-K8S/EPIC.md`. References "27 US L3" that likely do not exist for K8s. |

---

## Priority Action Summary

### HIGH Priority (20 items) -- Recommended for immediate attention

1. **L2:** Archive `sistema-recompensas/` (11 files, superseded by gamificacion/)
2. **L6:** Move `testing-guides/` from 10-requirements to 50-guides/testing/
3. **L18:** Move 3 DEPRECATED deployment files to `_archived/`
4. **F8:** Archive 5 resolved STUDENT-GAP files + _MAP
5. **F12:** Move documentation-master/ from 50-guides to orchestration/tareas/
6. **C1:** Fix PostgreSQL 16 -> 15 in 38 files (batch: all PLAN.md `Enfoque Tecnico` lines)
7. **C2:** Fix Vite 7.x -> 6.x in 11 files
8. **C3:** Fix localhost:3000 -> localhost:3006 in 11 files
9. **C5:** Update EPIC-GAM-K8S status from "completed" to "cancelled/not_applicable"
10. **C9:** Resolve 00-overview/DEPLOYMENT.md dual-SSOT (509 lines duplicating 50-guides/deployment/)
11. **G6:** Consolidate gamification architecture docs (3 sources -> 1 location)
12. **D6:** Review 08_CREDENCIALES_Y_ACCESOS.md for production secrets
13. **X1-X3:** Fix 3 broken cross-references to non-existent directories

### MEDIUM Priority (31 items) -- Plan for next sprint

14. **L1, L3, L5:** Archive 3 legacy requirement directories
15. **L8:** Delete directivas/ orphan in 00-overview (stale metrics, broken refs)
16. **L9:** Register system/ flujo in _INDEX.md or move to shared/
17. **L15-L17:** Delete 3 frontend _legacy directories (7 files, not imported)
18. **F1-F4:** Archive 4 audit reports from flujos/ to orchestration/tareas/
19. **F7:** Move REPORTE-INTEGRAL to orchestration/tareas/
20. **F10:** Delete empty analysis/ directory
21. **F13:** Archive ADMIN-PORTAL-ENDPOINTS.md (superseded)
22. **C4:** Fix React 18 -> 19 in 3 files
23. **C6:** Update stale metrics in directivas/_INDEX
24. **C10:** Standardize ESTANDAR-*/STANDARD-* naming
25. **C11:** Consolidate portal API reference locations
26. **C12:** Fix broken 99-archivados references
27. **D3, D5:** Archive superseded delivery documents
28. **G1:** Merge 8 micro-files in 00-overview
29. **G3:** Flatten documentation-master fase directories
30. **G8:** Archive resolved correcciones/
31. **G9:** Consolidate duplicate standards

### LOW Priority (16 items) -- Address opportunistically

32. **L4, L7, L10:** Delete/archive 3 minimal stub directories
33. **L11-L14:** Keep properly organized archives (no action)
34. **F5, F6, F9, F11:** Archive completed one-time reports and traces
35. **F14:** Move WEB-PUSH-MIGRATION.md to appropriate location
36. **C7, C8:** Update stale redirect metrics
37. **G2, G4, G5, G7, G10, G11:** Minor consolidation opportunities
38. **D2, D4, D7:** Keep/archive delivery artifacts

---

## Appendix: Files-at-Risk for Accidental Deletion

The following files are in legacy/orphan directories but contain **unique** content not duplicated elsewhere:

1. `docs/10-requirements/sistema-recompensas/02-FLUJO-ENGAGEMENT.md` -- Engagement flow specific to rewards
2. `docs/10-requirements/sistema-recompensas/04-DATABASE-SCHEMA.md` -- Historical DB schema decisions
3. `docs/10-requirements/testing-guides/guia-pruebas-modulo-[1-5].md` -- Active QA reference material
4. `docs/50-guides/documentation-master/.../COHERENCE-MATRIX-GAMILIT.yml` -- Coherence analysis artifact
5. `docs/99-delivery/2025-11-16-entrega-final/08_CREDENCIALES_Y_ACCESOS.md` -- Credentials (sensitive)

**Recommendation:** Always ARCHIVE (not DELETE) directories with unique content. Use `_archived/` subdirectories with README explaining archive date and reason.

---

*Generated: 2026-02-27 | Audit scope: 67 findings across docs/, apps/, orchestration/*
*Method: Systematic directory traversal + content inspection + cross-reference validation*
