# Audit Report: docs/40-api/ and docs/99-delivery/

**Scope:** Structural audit of sections 40-api and 99-delivery
**Date:** 2026-02-27
**Auditor:** Claude Code Agent (read-only, no modifications made)
**Method:** File enumeration, line counts, content inspection (frontmatter, topic focus, naming, redundancy)

---

## Section: docs/40-api/

- **Files:** 10 (all at root level, no subdirectories)
- **Directories:** 0 (flat structure)
- **_INDEX.md:** Present (`_INDEX.md`, 17 lines)
- **_MAP.md:** Present (`_MAP.md`, 11 lines)
- **Frontmatter:** 0/10 files (0%) — no file opens with a YAML `---` block at line 1; all `---` occurrences are horizontal rule dividers

### Directory Tree

```
docs/40-api/
├── _INDEX.md                        (17 lines)
├── _MAP.md                          (11 lines)
├── README.md                        (27 lines)
├── API-REFERENCE.md                 (548 lines)
├── ADMIN-PORTAL-ENDPOINTS.md        (189 lines)
├── ENDPOINTS-INVENTORY-EQUIP.md     (215 lines)
├── PORTAL-PARENTS-API-REFERENCE.md  (236 lines)
├── PORTAL-STUDENT-API-REFERENCE.md  (422 lines)
├── PORTAL-TEACHER-API-REFERENCE.md  (348 lines)
└── WEB-PUSH-MIGRATION.md            (463 lines)
```

### Files >500 Lines

| File | Line Count | Notes |
|------|-----------|-------|
| `API-REFERENCE.md` | 548 | Marginally over threshold; covers 19 modules + WebSocket reference in a single file |

### Naming Violations

None. All files use UPPERCASE-KEBAB-CASE or the conventional `_INDEX.md` / `_MAP.md` / `README.md` patterns.

### 1FN Violations (Multiple Topics in One File)

| File | Issue |
|------|-------|
| `API-REFERENCE.md` | Bundles endpoint tables for 19 distinct backend modules (auth, users, tenants, educational, exercises, gamification, classrooms, students, teachers, parents portal, analytics, content, notifications, reports, achievements, social, settings, health, core) **plus** a WebSocket/Socket.IO reference section into a single document. Each module's API contract is an independent domain. The WebSocket section (lines 466-499) is a distinct protocol topic orthogonal to REST endpoints. |
| `ADMIN-PORTAL-ENDPOINTS.md` | Despite the name suggesting endpoint reference, this file is actually an **implementation task log** (`P2 Admin Portal Endpoints Implementation`) containing: DTOs, SQL DDL, cron job specs, deployment instructions, curl test commands, and trazabilidad tables. It mixes API contract documentation with deployment runbook and implementation narrative — three distinct concerns. |

### 2FN Violations (Independent Sections That Should Be Separate Files)

| File | Independent Sections Found | Recommended Split |
|------|---------------------------|-------------------|
| `API-REFERENCE.md` | 19 module sections + WebSocket section. Sections are fully independent (different base paths, different domains, different auth roles). | Could be split into per-module files under a subdirectory (e.g., `40-api/modules/`) or at minimum the WebSocket reference extracted to `WEBSOCKET-REFERENCE.md`. The current "subset representative" note (line 10) acknowledges incompleteness, suggesting the file is trying to serve too many consumers. |
| `ADMIN-PORTAL-ENDPOINTS.md` | Section 1: Task log / implementation notes for `TASK-ADMIN-REPORTS-SCHEDULE`. Section 2: Task log for `TASK-MONITORING-HISTORY-PERSISTENCE`. Section 3: Deployment instructions. Section 4: Trazabilidad table. Section 5: Manual testing commands. | API contract docs belong in an endpoint reference file; implementation logs belong in `orchestration/tareas/`; deployment instructions belong in `docs/50-guides/backend/`. |

### Stubs (<10 Lines of Actual Content)

None. All files have substantial content. However:

| File | Lines | Note |
|------|-------|------|
| `_MAP.md` | 11 | Minimal — lists 5 links. Functional but thin. |
| `_INDEX.md` | 17 | Adequate for its purpose (index table). |

### Internal Consistency Issues (Endpoint Count Discrepancies)

This is a data integrity violation found during the 1FN/content review:

| File | Endpoint Count Stated | Discrepancy |
|------|----------------------|-------------|
| `_INDEX.md` | 911 | — |
| `API-REFERENCE.md` header | 901 | Differs from _INDEX.md by 10 |
| `API-REFERENCE.md` footer (line 548) | 901 | Consistent with its own header |
| `README.md` header | 850 (body) / 899 (Quick Reference) | Two different counts within the same file; both differ from BACKEND_INVENTORY |
| `BACKEND_INVENTORY.yml` (SSOT) | 912 | All doc-layer counts are stale vs SSOT |

The `README.md` itself has an internal 1FN violation: it states "850 endpoints" in the table (line 11) and "899" in the Quick Reference section (line 21) — two different numbers in the same 27-line file.

### Missing Files in _INDEX.md and _MAP.md

Both `_INDEX.md` and `_MAP.md` **do not list** the three new portal API reference files:
- `PORTAL-PARENTS-API-REFERENCE.md`
- `PORTAL-STUDENT-API-REFERENCE.md`
- `PORTAL-TEACHER-API-REFERENCE.md`

These were added after the index/map were last updated. The index also does not list `README.md` as a separate entry (it exists but is not in the `_INDEX.md` table).

### Frontmatter Analysis

0 of 10 files use YAML frontmatter. The project does not enforce frontmatter as a standard (no existing files in this section use it), so this is noted as an **observation** rather than a hard violation, but it represents a documentation metadata gap (no machine-readable `title`, `version`, `last_updated`, `owner` fields).

---

## Section: docs/99-delivery/

- **Files (total):** 31 (2 at root level + 29 inside `2025-11-16-entrega-final/`)
- **Markdown files:** 20
- **Binary/non-Markdown files:** 11 (8 `.docx` + 1 `.sh`)
- **Directories:** 1 subdirectory (`2025-11-16-entrega-final/`)
- **_INDEX.md:** Present at root (`_INDEX.md`, 9 lines — stub-level)
- **_MAP.md:** Missing at root level; Present only inside `2025-11-16-entrega-final/` subdirectory

### Directory Tree

```
docs/99-delivery/
├── _INDEX.md                                      (9 lines — STUB)
├── README.md                                      (21 lines)
└── 2025-11-16-entrega-final/
    ├── _MAP.md                                    (26 lines)
    ├── README.md                                  (37 lines)
    │
    ├── [LEGAL / FORMAL DOCUMENTS - .docx]
    ├── 00_Checklist_de_Cierre.docx
    ├── 01_Acta_de_Entrega_y_Aceptacion.docx
    ├── 02_Anexo_A_Entregables_y_Alcance_Real.docx
    ├── 03_Anexo_B_Inventario_Tecnico.docx
    ├── 04_Anexo_C_Manuales.docx
    ├── 05_Anexo_D_Cesion_Derechos_Patrimoniales.docx
    ├── 06_Convenio_de_Finiquito.docx
    ├── 07_Constancia_de_Pago_sin_CFDI.docx
    │
    ├── [DOCX WITH SPACES IN NAMES]
    ├── "Manual de Usuario.docx"
    ├── "Manual del Portal de Administrador.docx"
    ├── "Manual del Portal de Maestros.docx"
    │
    ├── [CURRENT MARKDOWN MANUALS]
    ├── MANUAL-USUARIO-PORTAL-ESTUDIANTE.md        (533 lines)
    ├── MANUAL-USUARIO-PORTAL-ADMINISTRADOR.md     (362 lines)
    ├── MANUAL-USUARIO-PORTAL-MAESTROS.md          (379 lines)
    ├── GUIA-RESPUESTAS-EJERCICIOS.md              (332 lines)
    │
    ├── [LEGACY/SUPERSEDED MANUALS]
    ├── Manual_Portal_Administrador_ACTUALIZADO.md (2666 lines)
    ├── Manual_Portal_Maestros_ACTUALIZADO.md      (1617 lines)
    ├── Manual_Portal_Student_v1.0.md              (1859 lines)
    │
    ├── [OPERATIONAL / DELIVERY PROCESS DOCS]
    ├── 08_CREDENCIALES_Y_ACCESOS.md               (217 lines)
    ├── INSTRUCCIONES_ENTREGA_FINAL.md             (256 lines)
    ├── GUIA_ENTREGA_USB.md                        (326 lines)
    ├── DATOS_COMPLETADOS.md                       (169 lines)
    │
    ├── [INTERNAL AGENT LOGS / SUMMARIES - REDUNDANT GROUP]
    ├── RESUMEN_ACTUALIZACION.md                   (226 lines)
    ├── RESUMEN_CORRECCIONES_FINALES.md            (257 lines)
    ├── RESUMEN_MANUALES.md                        (314 lines)
    ├── RESUMEN-CONSOLIDADO-ENTREGA.md             (118 lines)
    ├── REPORTE-ACTUALIZACION-MANUALES-2025-11-23.md (541 lines)
    │
    └── prepare_usb_delivery.sh                    (script)
```

### Files >500 Lines

| File | Line Count | Notes |
|------|-----------|-------|
| `Manual_Portal_Administrador_ACTUALIZADO.md` | 2666 | Legacy version (superseded by `MANUAL-USUARIO-PORTAL-ADMINISTRADOR.md`). Retained as historical reference but no longer the canonical doc. |
| `Manual_Portal_Student_v1.0.md` | 1859 | Legacy version (superseded by `MANUAL-USUARIO-PORTAL-ESTUDIANTE.md`). |
| `Manual_Portal_Maestros_ACTUALIZADO.md` | 1617 | Legacy version (superseded by `MANUAL-USUARIO-PORTAL-MAESTROS.md`). |
| `REPORTE-ACTUALIZACION-MANUALES-2025-11-23.md` | 541 | Agent execution log. Marginally over threshold. |
| `MANUAL-USUARIO-PORTAL-ESTUDIANTE.md` | 533 | Current canonical manual. Acceptable given it is a user manual (inherently long). |

### Naming Violations

#### Underscore vs Hyphen Inconsistency (Mixed convention within same directory)

The project standard is UPPERCASE-KEBAB-CASE. Several files use underscores instead of hyphens:

| File | Convention Used | Violation |
|------|----------------|-----------|
| `Manual_Portal_Administrador_ACTUALIZADO.md` | Mixed case + underscores | Should be `MANUAL-PORTAL-ADMINISTRADOR-ACTUALIZADO.md` |
| `Manual_Portal_Maestros_ACTUALIZADO.md` | Mixed case + underscores | Should be `MANUAL-PORTAL-MAESTROS-ACTUALIZADO.md` |
| `Manual_Portal_Student_v1.0.md` | Mixed case + underscores + version suffix | Should be `MANUAL-PORTAL-ESTUDIANTE-V1.0.md` |
| `DATOS_COMPLETADOS.md` | UPPERCASE + underscores | Should be `DATOS-COMPLETADOS.md` |
| `GUIA_ENTREGA_USB.md` | UPPERCASE + underscores | Should be `GUIA-ENTREGA-USB.md` |
| `INSTRUCCIONES_ENTREGA_FINAL.md` | UPPERCASE + underscores | Should be `INSTRUCCIONES-ENTREGA-FINAL.md` |
| `RESUMEN_ACTUALIZACION.md` | UPPERCASE + underscores | Should be `RESUMEN-ACTUALIZACION.md` |
| `RESUMEN_CORRECCIONES_FINALES.md` | UPPERCASE + underscores | Should be `RESUMEN-CORRECCIONES-FINALES.md` |
| `RESUMEN_MANUALES.md` | UPPERCASE + underscores | Should be `RESUMEN-MANUALES.md` |
| `08_CREDENCIALES_Y_ACCESOS.md` | Number prefix + underscores | Should be `08-CREDENCIALES-Y-ACCESOS.md` or `CREDENCIALES-Y-ACCESOS.md` |

**Summary:** 10 of 20 markdown files (50%) violate the UPPERCASE-KEBAB-CASE convention by using underscores.

#### Number Prefix Convention (formal .docx files)

The formal .docx files (00_ through 07_) use a numerical prefix + underscore convention. This is acceptable for sequenced delivery artifacts, but is inconsistent with the convention used elsewhere in `docs/`.

### Files with Spaces in Names

3 .docx files contain spaces — these cause issues in CLI operations and version control tooling:

| File |
|------|
| `Manual de Usuario.docx` |
| `Manual del Portal de Administrador.docx` |
| `Manual del Portal de Maestros.docx` |

These are legacy .docx artifacts generated for client delivery. Their markdown equivalents exist with proper naming (`MANUAL-USUARIO-PORTAL-ADMINISTRADOR.md`, etc.).

### 1FN Violations (Multiple Topics in One File)

| File | Issue |
|------|-------|
| `RESUMEN-CONSOLIDADO-ENTREGA.md` | Explicitly aggregates content from four separate documents (`RESUMEN_ACTUALIZACION.md`, `RESUMEN_CORRECCIONES_FINALES.md`, `RESUMEN_MANUALES.md`, `REPORTE-ACTUALIZACION-MANUALES-2025-11-23.md`). It contains four distinct topic sections in 118 lines: (1) document update log, (2) corrections applied, (3) manuals generated, (4) manual update report. These are four independent topics. |
| `INSTRUCCIONES_ENTREGA_FINAL.md` | Mixes: (1) physical delivery checklist (what to bring), (2) USB preparation instructions, (3) document verification checklist, and (4) a meeting agenda/cronogram. These are four distinct operational concerns. |
| `08_CREDENCIALES_Y_ACCESOS.md` | Mixes: (1) demo user credentials, (2) server/infrastructure access data, (3) database connection details, (4) application URLs. While all are "access data," this file contains sensitive credentials of different types that are logically separate (user credentials vs. infrastructure credentials). |
| `DATOS_COMPLETADOS.md` | Mixes personal contact information, server production data, version/build data, and legal/payment information. Four distinct data classes in one file. |

### 2FN Violations (Independent Sections That Should Be Separate Files)

| File | Sections That Are Independent |
|------|------------------------------|
| `RESUMEN-CONSOLIDADO-ENTREGA.md` | This file admits it consolidates 4 separate files. The consolidation itself is a 2FN violation — each source document covered an independent event (date update, corrections, manual generation, manual update). The consolidation adds no new structure, it merely duplicates the other files' summaries. |
| `Manual_Portal_Administrador_ACTUALIZADO.md` (2666 lines) | Contains distinct portal sections covering: Dashboard, User Management, Institution Management, Content Management, Gamification Configuration, Analytics, System Monitoring, Reports, Settings — each independently navigable. Could be split into per-section docs, but given this is a superseded legacy document the priority is low. |

### Redundancy Group: Multiple Versions of Manuals

There is a clear **version duplication** pattern — both legacy and current versions of all 3 portal manuals coexist with no clear deprecation marker in the files themselves:

| Portal | Legacy File (superseded) | Current File (canonical) | Size Difference |
|--------|------------------------|-------------------------|----------------|
| Administrador | `Manual_Portal_Administrador_ACTUALIZADO.md` (2666L, Jan 2026) | `MANUAL-USUARIO-PORTAL-ADMINISTRADOR.md` (362L, Feb 2026) | 7:1 ratio |
| Maestros | `Manual_Portal_Maestros_ACTUALIZADO.md` (1617L, Nov 2025) | `MANUAL-USUARIO-PORTAL-MAESTROS.md` (379L, Feb 2026) | 4:1 ratio |
| Estudiante | `Manual_Portal_Student_v1.0.md` (1859L, Nov 2025) | `MANUAL-USUARIO-PORTAL-ESTUDIANTE.md` (533L, Feb 2026) | 3.5:1 ratio |

The `README.md` inside the subdirectory labels these legacy files as "Manuales Anteriores (referencia historica)" — the classification is correct, but the files themselves carry no deprecation notice internally.

### Redundancy Group: RESUMEN Files

Four files (`RESUMEN_ACTUALIZACION.md`, `RESUMEN_CORRECCIONES_FINALES.md`, `RESUMEN_MANUALES.md`, `RESUMEN-CONSOLIDADO-ENTREGA.md`) all document overlapping events from the same delivery phase (November 2025). `RESUMEN-CONSOLIDADO-ENTREGA.md` explicitly states it consolidates the other three. The three source files are retained alongside the consolidation, creating quadruple coverage of the same events.

### Stubs (<10 Lines of Actual Content)

| File | Lines | Content |
|------|-------|---------|
| `docs/99-delivery/_INDEX.md` | 9 | Contains only a header, one-line description, and a single-row table. This is a minimal stub that only points to the subdirectory without describing its contents. |

### Missing _INDEX.md

| Location | Status |
|----------|--------|
| `docs/99-delivery/2025-11-16-entrega-final/` | **Missing** — this subdirectory has a `_MAP.md` and `README.md` but no `_INDEX.md`. The `README.md` serves as a de facto index, but the convention requires `_INDEX.md`. |

### _MAP.md Gap

| Location | Status |
|----------|--------|
| `docs/99-delivery/` (root) | **Missing** — no `_MAP.md` at the section root level. The `_MAP.md` that exists is inside `2025-11-16-entrega-final/` only. |

### Frontmatter Analysis

0 of 20 markdown files use YAML frontmatter (0%). Same observation as 40-api — the project does not enforce frontmatter, but no file in this section carries machine-readable metadata.

### Non-Markdown Files

The section contains 11 non-markdown files: 8 `.docx` binary files and 1 `.sh` script (`prepare_usb_delivery.sh`). The shell script is misplaced in `docs/` — it is an operational/tooling artifact that would be more appropriate in `apps/devops/` or `apps/database/scripts/`.

---

## Cross-Section Observations

| Observation | Sections Affected |
|-------------|------------------|
| No YAML frontmatter across all 30 markdown files (0%) | Both |
| README.md and _INDEX.md coexist with overlapping content | 40-api, 99-delivery root, 99-delivery/2025-11-16-entrega-final/ |
| Endpoint counts are stale and inconsistent across docs vs SSOT | 40-api |
| Agent execution logs / session summaries stored in docs/ rather than orchestration/tareas/ | 99-delivery |
| Mixed underscore/hyphen naming within same directories | 99-delivery |

---

## Violation Summary Table

| Violation Type | 40-api Count | 99-delivery Count | Total |
|----------------|-------------|-------------------|-------|
| 1FN (multiple topics in one file) | 2 | 4 | 6 |
| 2FN (independent sections needing split) | 2 | 2 | 4 |
| Naming convention (underscore vs hyphen) | 0 | 10 | 10 |
| Files with spaces in names | 0 | 3 | 3 |
| Files >500 lines | 1 | 5 | 6 |
| Stubs (<10 lines) | 0 | 1 | 1 |
| Missing _INDEX.md | 0 | 1 (subdirectory) | 1 |
| Missing _MAP.md | 0 | 1 (root) | 1 |
| _INDEX.md / _MAP.md out of date | 1 (3 files unlisted) | 0 | 1 |
| Internal data inconsistency | 1 (endpoint counts) | 0 | 1 |
| Redundant version pairs (legacy + current) | 0 | 3 manual pairs | 3 |
| Redundant summary docs (4-way overlap) | 0 | 1 group | 1 |
| Script misplaced in docs/ | 0 | 1 (.sh file) | 1 |
| No frontmatter (0%) | 10 files | 20 files | 30 files |

---

## Priority Recommendations (informational — no changes made per audit scope)

**HIGH (structural integrity):**
1. Update `40-api/_INDEX.md` and `_MAP.md` to include the 3 new portal API reference files.
2. Resolve endpoint count discrepancies across `README.md`, `_INDEX.md`, `API-REFERENCE.md` — align all to `BACKEND_INVENTORY.yml` SSOT value (912).
3. Add `_INDEX.md` to `docs/99-delivery/2025-11-16-entrega-final/`.
4. Add `_MAP.md` to `docs/99-delivery/` root.

**MEDIUM (normalization):**
5. Move `ADMIN-PORTAL-ENDPOINTS.md` implementation log content to `orchestration/tareas/` — keep only the endpoint contract table in `docs/40-api/`.
6. Rename underscore-named markdown files to hyphen convention (10 files in 99-delivery).
7. Rename or move `prepare_usb_delivery.sh` out of `docs/` to a scripts directory.
8. Mark legacy manual files (`Manual_Portal_*_ACTUALIZADO.md`, `Manual_Portal_Student_v1.0.md`) with a deprecation header internally.

**LOW (cosmetic / future-state):**
9. Consider consolidating the 4 overlapping RESUMEN files into the already-existing `RESUMEN-CONSOLIDADO-ENTREGA.md` and removing the individual source files.
10. Consider extracting WebSocket reference from `API-REFERENCE.md` into `WEBSOCKET-REFERENCE.md`.
11. Adopt YAML frontmatter standard across all doc files.

---

*Report generated: 2026-02-27 | Audit mode: READ-ONLY | No files modified*
