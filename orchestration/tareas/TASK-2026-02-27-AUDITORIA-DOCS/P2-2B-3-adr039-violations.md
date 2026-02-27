# ADR-039 Compliance Audit

**Task:** TASK-2026-02-27-AUDITORIA-DOCS
**Phase:** P2 | **Sub-task:** 2B-3
**Date:** 2026-02-27
**Agent:** Claude Sonnet 4.6
**Mode:** ANALYSIS (read-only — no files modified)
**ADR Reference:** `docs/90-adr/ADR-039-ssot-docs-en-proyecto.md`

---

## Scope

ADR-039 establishes the boundary between:
- `docs/` — Product documentation (SSOT for epics, user stories, architecture, API, UX)
- `orchestration/` — Process documentation (YAML tracking, directives, agent profiles, inventories, task artifacts)

Key rules per ADR-039:
- **DEC-SSOT-001:** `docs/` is the only SSOT for product documentation
- **DEC-SSOT-002:** Epic narratives live in `docs/10-requirements/epics/`
- **DEC-SSOT-003:** `orchestration/work-items/` contains only YAML tracking with `docs_path:` links
- **DEC-SSOT-004:** Inventories (counts, metrics) live in `orchestration/inventarios/`
- **DEC-SSOT-005:** Task execution artifacts live in `orchestration/tareas/`

**Key distinction:**
- A `docs/` file that *links* to `orchestration/` = VALID (cross-referencing is expected)
- A `docs/` file that *contains* operational/governance process content that belongs in `orchestration/` = VIOLATION
- An `orchestration/` file that contains product narrative that belongs in `docs/` = VIOLATION

---

## Executive Summary

| Type | Violations Found | VALID References | Severity |
|------|-----------------|-----------------|----------|
| Type 1: docs/ referencing orchestration/ content | 4 VIOLATIONS | 157 files (VALID) | HIGH: 1, MEDIUM: 2, LOW: 1 |
| Type 2: Content in wrong section | 6 violations confirmed | — | HIGH: 2, MEDIUM: 3, LOW: 1 |
| Type 3: orchestration/ content that belongs in docs/ | 2 violations | — | MEDIUM: 2 |

**Total violations: 12** (1 HIGH confirmed + 5 HIGH/MEDIUM + additional LOW)

---

## Type 1: docs/ Files Referencing orchestration/ Content

### Analysis Method

161 docs/ files reference `orchestration/` paths. 203 files mention SIMCO/CAPVED/directivas terms. The vast majority of these are **VALID** — they are navigation links pointing to orchestration/ for implementation details, which ADR-039 explicitly allows. The following are the cases that cross into VIOLATION territory.

### V1-1: `docs/00-overview/GOBIERNO-SIMCO.md` — Describes SIMCO as a product feature

**File:** `docs/00-overview/GOBIERNO-SIMCO.md`
**Content:**
```markdown
# Gobierno SIMCO y NEXUS
> Marco operativo para agentes y ejecucion de tareas.
## Componentes
- SIMCO: directivas por operacion y dominio.
- NEXUS: gestion de contexto por niveles L0-L3.
- CAPVED: ciclo obligatorio de trabajo.
## Regla de carga minima
Los agentes deben cargar primero mapas de navegacion...
```
**Verdict:** VIOLATION (LOW severity)
**Reason:** This file describes the SIMCO governance process — the "rules of operation for agents." The content is about the operational framework, not the product. It belongs in `orchestration/` as agent onboarding context or could be a short stub that links to orchestration. The current content describes governance operation (not product), which ADR-039 assigns to `orchestration/`.
**Recommended location:** Could be a 3-line stub: "Governance lives in orchestration/. See orchestration/PROJECT-CONTEXT.md." OR move to `orchestration/agents/` as agent-facing reference.
**Mitigation:** The file is only 19 lines and links correctly to orchestration/ — it is a borderline case. The content is duplicated in CLAUDE.md and orchestration/PROJECT-CONTEXT.md.

---

### V1-2: `docs/00-overview/directivas/_INDEX.md` — Governance index with stale metrics in docs/

**File:** `docs/00-overview/directivas/_INDEX.md`
**Content (excerpt):**
```markdown
## Metricas Actuales (SSOT: orchestration/inventarios/MASTER_INVENTORY.yml v7.0.0)
Database: schemas: 18, tablas: 170, rls_policies: 263, funciones: 255, triggers: 132, enums: 41
Backend: modulos: 22, endpoints: 850, entities: 152, services: 170, controllers: 107
Frontend: componentes: 458, hooks: 127, paginas: 85, stores: 32, portales: 4
```
**Verdict:** VIOLATION (MEDIUM severity)
**Reason:** This file contains a full metrics snapshot in `docs/`. ADR-039 DEC-SSOT-004 is explicit: "Inventarios en orchestration/ — conteos exactos, YAML estructurado." Embedding raw metric counts in a file under `docs/00-overview/directivas/` directly violates this rule. The metrics shown (v7.0.0) are severely stale (current MASTER_INVENTORY is v14.4.0 — tablas=173, endpoints=912, componentes=575, etc.), demonstrating the duplication problem ADR-039 was designed to prevent.

Additionally, the directory `docs/00-overview/directivas/` itself is anomalous — it places "directives" content inside `docs/`, which is the orchestration/ domain. The SIMCO directives governance index should live in `orchestration/directivas/`.
**Recommended location:** The metrics block should be removed; the file should only link to `orchestration/inventarios/MASTER_INVENTORY.yml`. The entire `docs/00-overview/directivas/` directory is misplaced — it should not exist in docs/.

---

### V1-3: `docs/40-standards/ESTANDAR-MEMORIA-TOKENS.md` — Standard describing agent operational behavior

**File:** `docs/40-standards/ESTANDAR-MEMORIA-TOKENS.md`
**Content:** Full NEXUS L0-L3 token budgets, SIMCO cleanup triggers, compaction pre-conditions, purge strategies — all agent-operational content.
**Verdict:** VIOLATION (MEDIUM severity)
**Reason:** This document's content describes how AI agents should manage their context window — it is a governance/operational directive, not a product standard. ADR-039 assigns governance directives to `orchestration/directivas/`. The file header itself says: "Referencia Operacional: `@MEMORIA-TOKENS` -> `orchestration/directivas/simco/SIMCO-MEMORIA-TOKENS.md`" — acknowledging the canonical version lives in orchestration/. Having the content duplicated in `docs/40-standards/` violates DEC-SSOT-001.
**Recommended location:** Remove from `docs/40-standards/`. Replace with a stub redirecting to `orchestration/directivas/simco/SIMCO-MEMORIA-TOKENS.md`. If a product-facing summary of token constraints is needed, keep only the table of model limits.

---

### V1-4: `docs/40-standards/ESTANDAR-SKILLS.md` — Skill framework for agents in product docs

**File:** `docs/40-standards/ESTANDAR-SKILLS.md`
**Content:** Defines the directory structure for `orchestration/skills/`, YAML frontmatter for SKILL.md files, SIMCO integration fields (`simco_source`, `capved_required`, `agents_compatible`), skill registry operations.
**Verdict:** VIOLATION (HIGH severity)
**Reason:** This document defines how to structure agent skills within `orchestration/skills/`. It directly prescribes the content and format of orchestration/ directories. Per ADR-039, orchestration/ governance standards belong in orchestration/ itself (e.g., `orchestration/directivas/`). A product `docs/40-standards/` file should not prescribe the structure of agent tooling in `orchestration/`. The content is purely operational — it describes how agents discover and execute skills, not any product behavior.
**Recommended location:** `orchestration/directivas/simco/SIMCO-SKILLS-STANDARD.md` or `orchestration/agents/SKILL-STANDARD.md`

---

### VALID References (not violations)

The following categories of orchestration/ references in docs/ are **explicitly permitted** by ADR-039 and are NOT violations:

| Pattern | Count | Example |
|---------|-------|---------|
| Links to orchestration/inventarios/ as SSOT source | ~25 files | `docs/00-overview/METRICAS.md` → links to MASTER_INVENTORY.yml only |
| Links to orchestration/directivas/ for reading | ~80 files | `docs/70-onboarding/ONBOARDING-AGENTES.md` → links SIMCO directives |
| ADRs referencing orchestration/ patterns | ~15 files | ADR-039, ADR-037, ADR-041 describe the system |
| Navigation files (_INDEX, _MAP) linking to orchestration/ | ~30 files | Expected cross-links |
| `docs/70-onboarding/ONBOARDING-AGENTES.md` | 1 file | Links to SIMCO directives; describes process for agents = borderline but acceptable as onboarding material |

---

## Type 2: Content in Wrong Section

### V2-1: `docs/10-requirements/testing-guides/` — QA guides mislocated in requirements

**Directory:** `docs/10-requirements/testing-guides/` (7 files: README.md, _INDEX.md, _MAP.md, 5 module guides)
**Content:** Step-by-step QA testing guides with example answers for all 5 educational modules. Used for manual QA validation, not for defining requirements.
**Current location:** `docs/10-requirements/testing-guides/`
**Recommended location:** `docs/50-guides/testing/` (alongside GUIA-COVERAGE-TESTING.md, GUIA-E2E-PLAYWRIGHT.md, etc.)
**Severity:** MEDIUM
**Reason:** ADR-039 DEC-SSOT-002 scopes `docs/10-requirements/` to: "EPICs, User Stories, especificaciones funcionales." Testing guides with sample answers are QA execution guides, not requirements. They belong in `docs/50-guides/testing/` per the `docs/` section map. Note: the README.md for this directory explicitly states "Uso: QA/Testing, Desarrollo, Contenido" — confirming this is guide content, not requirements content.
**Note:** `docs/99-delivery/2025-11-16-entrega-final/GUIA-RESPUESTAS-EJERCICIOS.md` is a parallel file covering the same purpose — there may be an opportunity to consolidate.

---

### V2-2: `docs/50-guides/documentation-master/GAMILIT-DOCUMENTATION-MASTER/` — Audit report in guides

**Directory:** `docs/50-guides/documentation-master/GAMILIT-DOCUMENTATION-MASTER/` (12+ files including the main GAMILIT-DOCUMENTATION-MASTER.md, ANALISIS-HALLAZGOS-DETALLADO.md, 7 fase-N/ subdirectories, YAML catalogs)
**Content:** Full audit execution report from 2026-01-22 — CAPVED task execution with 7 phases, metrics before/after, page catalogs, data flow maps.
**Current location:** `docs/50-guides/documentation-master/`
**Recommended location:** `orchestration/tareas/TASK-2026-01-22-DOCUMENTATION-MASTER/` or `orchestration/reports/`
**Severity:** HIGH
**Reason:** ADR-039 DEC-SSOT-005 is explicit: "Tareas son proceso, no producto. docs/ no tiene carpeta tareas/." The GAMILIT-DOCUMENTATION-MASTER is a task execution report — it is the output of a CAPVED task run by an agent. Its content includes: "Agente: Claude Code (Arquitecto de Documentación)", "Metodología: CAPVED por Fase", before/after metrics, agent execution logs. This is process documentation, not a guide for product contributors. The 7 `fase-N/` subdirectories with YAML catalogs further confirm this is task execution artifact content that belongs in `orchestration/tareas/`.
**Secondary:** The YAML files (`PAGES-CATALOG-GAMILIT.yml`, `STUDENT-PAGE-COMPONENTS-MAP.yml`, etc.) are inventory-style catalogs that belong in `orchestration/inventarios/` per DEC-SSOT-004.

---

### V2-3: `docs/00-overview/REPORTE-INTEGRAL-2026-01-20.md` — Audit report in overview

**File:** `docs/00-overview/REPORTE-INTEGRAL-2026-01-20.md`
**Content:** "REPORTE INTEGRAL: ANALISIS FINAL DE PORTALES Y DOCUMENTACION. Tarea: TASK-2026-01-20-ANALISIS-FINAL-PORTALES. Sistema: SIMCO v4.0.0 + CAPVED. Agente: Trae AI (Gemini 3 Pro)."
**Current location:** `docs/00-overview/`
**Recommended location:** `orchestration/tareas/TASK-2026-01-20-ANALISIS-FINAL-PORTALES/` (or `orchestration/reports/`)
**Severity:** HIGH
**Reason:** This is an agent task execution report. ADR-039 DEC-SSOT-005: "orchestration/tareas/TASK-{YYYY-MM-DD}-{DESC}/ contiene tracking de tareas." The file explicitly names its task ID (`TASK-2026-01-20-ANALISIS-FINAL-PORTALES`), agent, and CAPVED methodology — it is process documentation, not product overview content. Its location in `docs/00-overview/` makes it appear to be product documentation when it is an operational audit report.

---

### V2-4: `docs/80-references/transversal/correcciones/BACKEND-CRITICAL-ISSUES-PENDING.md` — Resolved issues in references

**File:** `docs/80-references/transversal/correcciones/BACKEND-CRITICAL-ISSUES-PENDING.md`
**Content:** Lists P0 backend issues — all marked IMPLEMENTADO (verified 2025-01-04). The file itself states: "Estado: Resuelto."
**Current location:** `docs/80-references/transversal/correcciones/`
**Recommended location:** `orchestration/tareas/` (historical artifact) or archive/delete
**Severity:** MEDIUM
**Reason:** This is a resolved issue tracking document. It was useful during the correction process (2025-01-04) but is now 100% historical. Issue tracking is a process artifact per ADR-039 DEC-SSOT-005. Its "PENDING" title is misleading since all issues are resolved. It does not belong in `docs/80-references/` which is meant for product reference material. The companion file `ANALISIS-ERROR-404-PROGRESS-MODULES.md` in the same directory (also "Estado: Corregido") has the same problem.

---

### V2-5: `docs/30-ux-ui/flujos/system/FL-SYS-06-MULTI-TENANT-ISOLATION.md` — Architecture doc in UX section

**File:** `docs/30-ux-ui/flujos/system/FL-SYS-06-MULTI-TENANT-ISOLATION.md`
**Content:** Detailed technical architecture of RLS multi-tenant isolation — 5-layer security architecture, PostgreSQL session variables, JWT strategy, TypeScript code snippets, backend service implementation details, BYPASSRLS status.
**Current location:** `docs/30-ux-ui/flujos/system/`
**Recommended location:** `docs/20-architecture/` (e.g., `docs/20-architecture/security/MULTI-TENANT-ISOLATION.md`)
**Severity:** MEDIUM
**Reason:** This file is not a UX/UI flow document — it describes backend security architecture and database-level enforcement. `docs/30-ux-ui/` is scoped to wireframes, mockups, and user-facing flows. The `system/` subdirectory was intended for system-level flows but this document goes far beyond flow documentation into architecture territory. The content (5 PostgreSQL layers, SET LOCAL implementation, TypeScript interceptor code, BYPASSRLS discussion) belongs in `docs/20-architecture/`. Note: this is not an ADR-039 violation per se (content stays in docs/), but it is misplaced within docs/.

---

### V2-6: `docs/50-guides/testing/MANUAL-TESTING-GUIDE-US-AE-007.sh` — Shell script in docs

**File:** `docs/50-guides/testing/MANUAL-TESTING-GUIDE-US-AE-007.sh` (also present at `docs/50-guides/testing/impl/MANUAL-TESTING-GUIDE-US-AE-007.sh`)
**Content:** Bash script for manual API testing — curl commands, JWT token configuration, test UUIDs, status checks.
**Current location:** `docs/50-guides/testing/` (and `docs/50-guides/testing/impl/`)
**Recommended location:** Either `apps/backend/test/scripts/` (if actively maintained) or `orchestration/tareas/` as a historical artifact
**Severity:** LOW
**Reason:** Shell scripts are executable artifacts, not documentation. `docs/` should contain only documentation files (`.md`, `.yml`, `.json` for API specs). A `.sh` file in `docs/` is not what ADR-039 envisioned for the documentation layer. The script was created 2025-11-24 for US-AE-007 validation — it may be obsolete. If still useful, it belongs with the test infrastructure in `apps/backend/test/`.
**Note:** The file appears in two locations — `docs/50-guides/testing/` (top level) AND `docs/50-guides/testing/impl/` — suggesting it was copied without removing the original.

---

## Type 3: orchestration/ Content That Should Be in docs/

### V3-1: `orchestration/referencias/ESTANDAR-ESTRUCTURA-DOCS.md` — Doc structure standard in orchestration

**File:** `orchestration/referencias/ESTANDAR-ESTRUCTURA-DOCS.md`
**Content:** Defines the official directory structure standard for `docs/` across all workspace projects. 100+ lines defining required directories, mandatory files, and conventions.
**Current location:** `orchestration/referencias/`
**Recommended location:** `docs/40-standards/ESTANDAR-ESTRUCTURA-DOCS.md`
**Severity:** MEDIUM
**Reason:** This is a product/project documentation standard — it defines how `docs/` should be structured. Per ADR-039, `docs/40-standards/` is where standards for the project live (e.g., ESTANDAR-CODIGO.md, ESTANDAR-TESTING.md, ESTANDAR-DATABASE-PROFESIONAL.md). A standard for documentation structure is a product-level standard that contributors need access to, not an operational directive. It currently lives in orchestration/ where it is less discoverable for contributors and documentation maintainers.
**Note:** The file references NEXUS v3.4, suggesting it predates the current project setup and may need content update regardless.

---

### V3-2: `orchestration/referencias/PLAN-DESARROLLO-ACTUALIZADO.md` — Development plan in orchestration

**File:** `orchestration/referencias/PLAN-DESARROLLO-ACTUALIZADO.md`
**Content:** A sprint development plan with phases, tasks, DDL changes, backend implementation steps, frontend work — includes product feature development tasks (gamification equipment system).
**Current location:** `orchestration/referencias/`
**Recommended location:** `orchestration/tareas/` (task artifact) or `docs/10-requirements/epics/` (if it represents epic planning)
**Severity:** MEDIUM
**Reason:** This is a hybrid case. The plan contains both operational tracking (checkboxes, implementation status) AND product-level planning (feature phases, technical approach). Per ADR-039 DEC-SSOT-002, implementation plans belong in `docs/10-requirements/epics/EPIC-ID/PLAN.md`. The current location in `orchestration/referencias/` makes it neither discoverable as product planning nor as a proper task tracking artifact. Its content refers to EPIC-GAM-F1-GAMIFICATION work — the corresponding PLAN.md should live in `docs/10-requirements/epics/EPIC-GAM-F1-GAMIFICATION/PLAN.md`.

---

## Summary Table

| # | File/Directory | Type | Severity | Recommended Action |
|---|---------------|------|----------|--------------------|
| V1-1 | `docs/00-overview/GOBIERNO-SIMCO.md` | docs/ with governance content | LOW | Convert to 3-line stub linking to orchestration/PROJECT-CONTEXT.md |
| V1-2 | `docs/00-overview/directivas/_INDEX.md` | docs/ with stale metrics + wrong location | MEDIUM | Remove metrics block; remove `directivas/` subdir from docs/ |
| V1-3 | `docs/40-standards/ESTANDAR-MEMORIA-TOKENS.md` | docs/ duplicating orchestration/ directive | MEDIUM | Remove from docs/; replace with stub → SIMCO-MEMORIA-TOKENS.md |
| V1-4 | `docs/40-standards/ESTANDAR-SKILLS.md` | docs/ prescribing orchestration/ structure | HIGH | Move to `orchestration/agents/SKILL-STANDARD.md` |
| V2-1 | `docs/10-requirements/testing-guides/` | Testing guides in requirements | MEDIUM | Move to `docs/50-guides/testing/exercise-guides/` |
| V2-2 | `docs/50-guides/documentation-master/` | Audit task report in guides | HIGH | Move to `orchestration/tareas/TASK-2026-01-22-DOCUMENTATION-MASTER/` |
| V2-3 | `docs/00-overview/REPORTE-INTEGRAL-2026-01-20.md` | Audit task report in overview | HIGH | Move to `orchestration/tareas/TASK-2026-01-20-ANALISIS-FINAL-PORTALES/` |
| V2-4 | `docs/80-references/transversal/correcciones/BACKEND-CRITICAL-ISSUES-PENDING.md` | Resolved issues in references | MEDIUM | Archive in `orchestration/tareas/` or delete (Estado: Resuelto) |
| V2-5 | `docs/30-ux-ui/flujos/system/FL-SYS-06-MULTI-TENANT-ISOLATION.md` | Architecture doc in UX | MEDIUM | Move to `docs/20-architecture/security/` |
| V2-6 | `docs/50-guides/testing/MANUAL-TESTING-GUIDE-US-AE-007.sh` | Shell script in docs | LOW | Move to `apps/backend/test/scripts/` or archive |
| V3-1 | `orchestration/referencias/ESTANDAR-ESTRUCTURA-DOCS.md` | Standard in orchestration | MEDIUM | Move to `docs/40-standards/ESTANDAR-ESTRUCTURA-DOCS.md` |
| V3-2 | `orchestration/referencias/PLAN-DESARROLLO-ACTUALIZADO.md` | Plan in wrong orchestration location | MEDIUM | Move content to `docs/10-requirements/epics/EPIC-GAM-F1-GAMIFICATION/PLAN.md` |

---

## Notes on Borderline Cases (Not Violations)

The following were investigated and classified as VALID:

1. **`docs/70-onboarding/ONBOARDING-AGENTES.md`** — Describes SIMCO/CAPVED for agent onboarding. The content is appropriate for `docs/70-onboarding/` as it helps agents bootstrap. It links to orchestration/ rather than duplicating it.

2. **`docs/00-overview/METRICAS.md`** — Correctly implemented: states "Consultar siempre orchestration/inventarios/MASTER_INVENTORY.yml" with no embedded metric counts. This is the correct pattern.

3. **`docs/80-references/knowledge-base/SIMCO-KB-MAPPING.md`** — Maps SIMCO directives to corresponding docs/ standards. This is a navigation/reference document that bridges the two areas. While it names orchestration/ directives, it serves as a lookup table for contributors and is legitimately placed in `docs/80-references/`.

4. **`docs/30-ux-ui/flujos/AUDITORIA-RESIDUAL-FULL.md`, `AUDITORIA-P0-RESULTADOS.md`, `VALIDACION-ANALISIS-VS-INTEGRACION.md`** — These audit results are about flows in `docs/30-ux-ui/`. They are validation records for the UX/UI documentation itself. While process-adjacent, they document the state of product documentation and are contextually appropriate in the same section they validate.

5. **`docs/40-standards/ESTANDAR-SKILLS.md`** (borderline) — Classified as HIGH violation because it prescribes `orchestration/skills/` directory structure, which is firmly in orchestration territory.

6. **ADR files describing SIMCO/governance** — ADR-041 (SIMCO System), ADR-037 (CAPVED), ADR-035 (SAAD), ADR-036 (NEXUS) describe the governance system as architectural decisions. ADRs documenting governance decisions are legitimate in `docs/90-adr/`.

---

## Remediation Priority

| Priority | Violations | Effort |
|----------|-----------|--------|
| P1 (HIGH) | V1-4, V2-2, V2-3 | Medium (file moves) |
| P2 (MEDIUM) | V1-2, V1-3, V2-1, V2-4, V2-5, V3-1, V3-2 | Low-Medium |
| P3 (LOW) | V1-1, V2-6 | Low |

---

*Auditor: Claude Sonnet 4.6*
*Methodology: Read-only analysis — no files modified*
*Reference: ADR-039 (docs/90-adr/ADR-039-ssot-docs-en-proyecto.md)*
