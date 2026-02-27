# Phase 2: Content Analysis -- Synthesis Report

**Date:** 2026-02-27
**Scope:** Content quality, consistency, and alignment across docs/ (~2,096 files)
**Auditor:** Claude Opus 4.6 (synthesis from 8 sub-agent reports)
**Mode:** ANALYSIS (read-only -- no files modified)
**Source Reports:** P2-2A-1, P2-2A-2, P2-2B-1, P2-2B-2, P2-2B-3, P2-2C-1, P2-2C-2, P2-2D-1
**Phase 1 Reference:** AUDIT-P1-SYNTHESIS.md (structural health score 62/100, 134 issues)

---

## Executive Summary

The content analysis of gamilit's documentation reveals a corpus that is **substantively rich but inconsistently maintained**. The documentation was generated across multiple sprints and agent sessions, producing comprehensive coverage of the system's architecture, requirements, and operational workflows. However, this iterative generation left behind three dominant debt patterns: (1) **metric staleness**, where numeric values drift from SSOT inventories as the system evolves -- 16 critical metric discrepancies span tables, endpoints, components, RLS policies, and foreign keys across 12 unique files; (2) **technology version fossilization**, where 38+ files reference PostgreSQL 16 and 11+ reference Vite 7.x, reflecting the originally planned stack rather than what was actually deployed (PostgreSQL 15, Vite 6.x); and (3) **uncontrolled DDL duplication**, where 35 files in docs/ contain full CREATE TABLE copies of canonical DDL that have diverged from the source of truth in `apps/database/ddl/`, introducing stale schema names, missing columns, and renamed tables.

Narrative duplication is structurally organized into 9 clusters, the most critical being the ONBOARDING-AGENTES.md vs CLAUDE.md overlap (>70%), the deployment documentation cluster (4 active files covering the same workflow), and the delivery manuals cluster (3 pairs of functionally redundant user manuals in 99-delivery). ADR-039 boundary compliance has 12 violations, with 3 at HIGH severity involving audit reports and governance standards misplaced in docs/ instead of orchestration/. Terminology is broadly consistent, but legacy schema names (`gamification` instead of `gamification_system`) persist in 10+ files, and the exercise type counting ambiguity (23 vs 27 vs 30 vs 33) remains unresolved in the glossary.

The overall **content health score is 58/100**, reflecting strong coverage depth but significant consistency and maintenance debt. This is 4 points lower than the Phase 1 structural score (62/100), confirming that content drift is a slightly more severe problem than structural organization in this corpus.

---

## Content Health Score: 58/100

| Dimension | Weight | Score | Notes |
|-----------|--------|-------|-------|
| Metric accuracy | 20% | 45/100 | 16 critical discrepancies, 7 minor; 5 endpoint values in 40-api/ alone |
| Technology version accuracy | 15% | 35/100 | 38+ files with wrong PG version, 11+ with wrong Vite version |
| DDL duplication control | 15% | 40/100 | 35 DUPLICATE files, 22 NEEDS-REFERENCE; 148 CREATE TABLE occurrences |
| Narrative duplication control | 15% | 55/100 | 9 clusters identified; 7 without clear SSOT designation |
| Terminology consistency | 10% | 65/100 | Schema names the main issue; gamification terms well-controlled |
| Link integrity | 5% | 90/100 | 96.9% integrity; only 3 truly broken links |
| ADR-039 boundary compliance | 10% | 60/100 | 12 violations (3 HIGH, 7 MEDIUM, 2 LOW) |
| Content alignment (no orphans/legacy) | 10% | 50/100 | 67 findings: 18 legacy dirs, 14 purposeless files, 12 contradictions |
| **Weighted Total** | **100%** | **58/100** | |

---

## Content Health Metrics

| Metric | Value |
|--------|-------|
| Total metric discrepancies (critical) | 16 |
| Total metric discrepancies (minor) | 7 |
| Unique files with wrong metric values | 18 |
| Technology version errors (files affected) | 62+ |
| DDL duplication clusters in docs/ | 35 DUPLICATE + 22 NEEDS-REFERENCE |
| CREATE TABLE occurrences in docs/ | 148 across 62 files |
| Narrative duplication clusters | 9 |
| Clusters without designated SSOT | 7 of 9 |
| ADR-039 violations | 12 |
| Broken internal links | 23 (3 truly broken, 20 to archived/external) |
| Link integrity rate | 96.9% (99.6% if excluding archival references) |
| Terminology inconsistencies (high severity) | 2 (schema names, exercise type counts) |
| Terminology inconsistencies (total) | 7 categories |
| Desaligned content findings | 67 (20 HIGH, 31 MEDIUM, 16 LOW) |
| Contradictory content items | 12 |
| Legacy/orphan directories | 18 |
| Files without clear purpose | 14 |
| Consolidation candidates | 11 |

---

## Issue Registry (Prioritized)

### CRITICAL (14 issues)

Issues that cause active harm: wrong technology versions in developer-facing docs, misleading metrics, broken workflows.

| ID | Source Report | Description | Files Affected | Remediation |
|----|-------------|-------------|----------------|-------------|
| CNT-CRIT-001 | 2A-2, 2D-1 | **PostgreSQL 16 in 38+ active files** -- all PLAN.md files and wave-3 EPICs state PostgreSQL 16; actual is PostgreSQL 15 | 21 PLAN.md + 5 EPIC.md + 8 delivery + ~4 others | Batch find-replace `PostgreSQL 16` -> `PostgreSQL 15` in all PLAN.md `Enfoque Tecnico` sections |
| CNT-CRIT-002 | 2A-2, 2D-1 | **Vite 7.x in 11+ active files** -- PLAN.md and EPIC files state Vite 7; actual is Vite 6.x | 7 PLAN.md + 2 EPIC.md + 2 delivery | Batch find-replace `Vite 7` -> `Vite 6.x` |
| CNT-CRIT-003 | 2A-1, 2A-2, 2D-1 | **Endpoint count 5-way divergence in docs/40-api/** -- README.md shows 850 and 899 (two values in same file!), _INDEX.md shows 911, API-REFERENCE.md shows 901; SSOT is 912 | `40-api/README.md`, `40-api/_INDEX.md`, `40-api/API-REFERENCE.md` | Update all three files to 912 |
| CNT-CRIT-004 | 2A-2, 2D-1 | **localhost:3000 in developer setup guides** -- backend uses port 3006; devs following SETUP-DEVELOPMENT.md will configure wrong port | 11 files: API-INTEGRATION, ESTRUCTURA-SHARED, SETUP-DEVELOPMENT, ADMIN-PORTAL-ENDPOINTS, ESTANDAR-API, STUDENT-GAP files | Replace `localhost:3000` -> `localhost:3006` |
| CNT-CRIT-005 | 2A-1 | **MODELO-DATOS.md has 3 stale metrics** -- tables=172 (should be 173), RLS=237 (should be 251), FK=299 (should be 301) | `docs/20-architecture/MODELO-DATOS.md` | Update all 3 values |
| CNT-CRIT-006 | 2A-1 | **API-REFERENCE.md shows 901 endpoints** (should be 912, -11 missing from ResourceSharing additions) | `docs/40-api/API-REFERENCE.md` (lines 5, 10, 548) | Update header, note, and footer |
| CNT-CRIT-007 | 2B-1 | **Schema name staleness in DDL copies** -- 7+ files use `auth.users`, `gamilit.user_stats`, `gamification.` prefix, `analytics.` schema, `public.classroom` instead of canonical schema names | ET-ANA-006, EVOLUCION-SISTEMA-RECOMPENSAS, RF-SOC-001, RF-SOC-002, PERF-004, ET-GAM-002, ET-GAM-003 | Update schema names to canonical |
| CNT-CRIT-008 | 2B-1, 2D-1 | **Tables renamed in code but not in docs** -- `classroom_students`->`classroom_members`, `groups`->`teams`, `group_students`->`team_members`, `guild_audit_log` (nonexistent) | ET-ADM-002, RF-SOC-002, PERF-004 | Update table references |
| CNT-CRIT-009 | 2B-2 | **Rangos maya thresholds inconsistent** -- MANUAL-USUARIO-PORTAL-ESTUDIANTE.md uses Ajaw=0-999 XP (6 rangos including Itzamna); SSOT RANGOS-MAYA.md uses Ajaw=0-499 XP (5 rangos) | `docs/99-delivery/.../MANUAL-USUARIO-PORTAL-ESTUDIANTE.md` | Align with SSOT RANGOS-MAYA.md |
| CNT-CRIT-010 | 2B-3, 2D-1 | **Audit task report in docs/50-guides/** -- GAMILIT-DOCUMENTATION-MASTER (12+ files across 8 subdirectories) is a CAPVED task execution report, not a guide; violates ADR-039 DEC-SSOT-005 | `docs/50-guides/documentation-master/` (entire tree) | Move to `orchestration/tareas/TASK-2026-01-22-DOCUMENTATION-MASTER/` |
| CNT-CRIT-011 | 2B-3, 2D-1 | **Audit task report in docs/00-overview/** -- REPORTE-INTEGRAL-2026-01-20.md is an agent task execution report with explicit TASK ID | `docs/00-overview/REPORTE-INTEGRAL-2026-01-20.md` | Move to `orchestration/tareas/` |
| CNT-CRIT-012 | 2D-1 | **EPIC-GAM-K8S marked "completed" but never implemented** -- describes Kubernetes deployment (StatefulSets, HPA, Ingress); gamilit uses PM2; DoD checklist entirely unchecked | `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-K8S/EPIC.md` | Update status to "cancelled" or "not_applicable" |
| CNT-CRIT-013 | 2D-1 | **Credentials file in 99-delivery** -- 08_CREDENCIALES_Y_ACCESOS.md contains access credentials committed to repo | `docs/99-delivery/.../08_CREDENCIALES_Y_ACCESOS.md` | Review for production secrets; redact if present |
| CNT-CRIT-014 | 2D-1 | **DEPLOYMENT.md dual-SSOT** -- 509-line complete deployment guide in 00-overview duplicates 50-guides/deployment/ content | `docs/00-overview/DEPLOYMENT.md` vs `50-guides/deployment/` | Designate one as SSOT; convert other to redirect |

### HIGH (24 issues)

Issues that reduce trust: stale DDL, content duplication, misplaced content.

| ID | Source Report | Description | Files Affected |
|----|-------------|-------------|----------------|
| CNT-HIGH-001 | 2A-1 | Component count 590/592 in 5 files (SSOT: 575) | `30-ux-ui/README.md`, ADR-048, ADR-049, GUIA-WCAG-ACCESSIBILITY |
| CNT-HIGH-002 | 2A-1 | RLS policies 237 in 3 files (SSOT: 251) | MODELO-DATOS, SCHEMA-REFERENCE, 99-utilities |
| CNT-HIGH-003 | 2A-1 | RLS policies 207 in ERR-DB-004 (SSOT: 251, delta -44) | ERR-DB-004-rls-policy-conflicto |
| CNT-HIGH-004 | 2A-1 | FK count 299 in 2 files (SSOT: 301) | MODELO-DATOS, ERR-DB-006-fk-cross-schema |
| CNT-HIGH-005 | 2A-1 | Table count 172 in 4 files (SSOT: 173) | MODELO-DATOS, README.md (20-arch), SCHEMA-REFERENCE, 99-utilities |
| CNT-HIGH-006 | 2A-2 | Stale metrics block in directivas/_INDEX.md (v7.0.0 vs v14.4.0 SSOT) -- every metric wrong | `docs/00-overview/directivas/_INDEX.md` |
| CNT-HIGH-007 | 2A-2 | SIMCO v4.0.0 vs v4.3.0 coexistence (~35 files affected) | 15 student spec files + 5 overview files + 15 misc |
| CNT-HIGH-008 | 2A-2 | NEXUS v3.4 in 15 _MAP.md files (should be v4.1) | 15 task _MAP.md files in epics |
| CNT-HIGH-009 | 2A-2 | React 18 in 3 active user-stories and specs (should be React 19) | US-NOT-001b, US-NOT-001c, ASSIGNMENTS-SPEC |
| CNT-HIGH-010 | 2A-2 | NestJS @10, React 18, Zustand 4, Tailwind 3 in US-FUND-004 | `US-FUND-004-infraestructura-tecnica-base.md` |
| CNT-HIGH-011 | 2A-2 | WebSocket port 3001 in user-story (actual: 3006 same-process) | `US-NOT-001a-websocket-infrastructure.md` |
| CNT-HIGH-012 | 2B-1 | 35 files with DUPLICATE DDL (full CREATE TABLE copies with staleness risk) | Various ET-*, RF-*, PLAN.md in epics |
| CNT-HIGH-013 | 2B-1 | 22 files with NEEDS-REFERENCE DDL (should link to canonical, not embed) | Various specs, guides, ADRs |
| CNT-HIGH-014 | 2B-2 | ONBOARDING-AGENTES.md >70% duplicates CLAUDE.md (14 overlapping sections) | `docs/70-onboarding/ONBOARDING-AGENTES.md` |
| CNT-HIGH-015 | 2B-2 | Deployment docs cluster: 4 active files, no clear SSOT (65-70% overlap) | DEPLOYMENT.md, GUIA-DESPLIEGUE, GUIA-ACTUALIZACION, AMBIENTES-DEV-PROD |
| CNT-HIGH-016 | 2B-2 | Testing strategy duplication (TESTING-STRATEGY.md duplicates ESTANDAR-TESTING + GUIA-COVERAGE, 60-65% overlap) | TESTING-STRATEGY, ESTANDAR-TESTING, GUIA-COVERAGE-TESTING |
| CNT-HIGH-017 | 2B-2 | 99-delivery has 3 pairs of redundant user manuals (same portal, same audience) | 6 files in `99-delivery/2025-11-16-entrega-final/` |
| CNT-HIGH-018 | 2B-3 | ESTANDAR-SKILLS.md prescribes orchestration/ directory structure from docs/ (ADR-039 violation) | `docs/40-standards/ESTANDAR-SKILLS.md` |
| CNT-HIGH-019 | 2C-1 | "gamification" used instead of "gamification_system" in 10+ files | ARQUITECTURA-GAMIFICACION, PORTAL-TEACHER-FLOWS, PLAN.md, EVOLUCION-SISTEMA-RECOMPENSAS, DEPENDENCY-MATRIX, 3 EPICs |
| CNT-HIGH-020 | 2D-1 | 3 DEPRECATED deployment files not moved to _archived/ | DEPLOYMENT-MASTER, GUIA-DESPLIEGUE, GUIA-ACTUALIZACION |
| CNT-HIGH-021 | 2D-1 | sistema-recompensas/ (11 files) superseded but not archived | `docs/10-requirements/sistema-recompensas/` |
| CNT-HIGH-022 | 2D-1 | testing-guides/ misplaced in 10-requirements (should be 50-guides/testing/) | `docs/10-requirements/testing-guides/` (8 files) |
| CNT-HIGH-023 | 2D-1 | 5 resolved STUDENT-GAP files still in active directory | `docs/60-portals/student/specs/gaps/` |
| CNT-HIGH-024 | 2D-1 | Gamification architecture 3-way overlap (ARQUITECTURA-GAMIFICACION + DATOS-GAMIFICACION + gamificacion/) | `docs/20-architecture/` (3 sources) |

### MEDIUM (32 issues)

Issues that reduce consistency: terminology, minor date staleness, naming, boundary misalignment.

| ID | Source Report | Description | Files Affected |
|----|-------------|-------------|----------------|
| CNT-MED-001 | 2A-1 | Entity "Tablas con Entity: 156" vs SSOT 157 in COHERENCE-ENTITIES-DDL.md | 1 file |
| CNT-MED-002 | 2A-1 | "27 mecanicas" in 5 docs (DDL COMMENT convention vs SSOT 30 frontend) | ET-EDU-001, RF-EDU-001, US-REP-001, GUIA-REFERENCIAS-SIMCO, 03-education |
| CNT-MED-003 | 2A-2 | PostgreSQL 14 in active guide (GUIA-CREAR-BASE-DATOS) | 1 file |
| CNT-MED-004 | 2A-2 | PostgreSQL 14+ in ET-EXT-002-ARQUITECTURA-TECNICA | 1 file |
| CNT-MED-005 | 2A-2 | GAMILIT v4.7.0 isolated in ANALISIS-HALLAZGOS-DETALLADO | 1 file |
| CNT-MED-006 | 2A-2 | SIMCO 78 directivas in docs vs CLAUDE.md 72 | 1 file |
| CNT-MED-007 | 2B-1 | Cross-file DDL duplication (same table in 2-3 spec files each) | 5 table-duplicate pairs |
| CNT-MED-008 | 2B-1 | 8 unimplemented feature DDL in docs (story_progress, challenge_bets, etc.) | 8 spec files |
| CNT-MED-009 | 2B-2 | Gamification system duplication cluster (13 files, MEDIUM-HIGH overlap) | 13 files |
| CNT-MED-010 | 2B-2 | Project identity cluster (8 files, 65-75% overlap) | CLAUDE.md, MODULOS, VISION-ALCANCE, ONBOARDING-AGENTES, etc. |
| CNT-MED-011 | 2B-2 | XP calculation duplication (ARQUITECTURA-GAMIFICACION vs ET-GAM-010, 65% overlap) | 2 files + 4 related |
| CNT-MED-012 | 2B-2 | Coverage thresholds inconsistent (50% vs 75% vs 80% across 4 files) | TESTING-GUIDE, GUIA-COVERAGE, ONBOARDING-QA, ESTANDAR-TESTING |
| CNT-MED-013 | 2B-3 | directivas/_INDEX.md has stale metrics + wrong location (governance in docs/) | `docs/00-overview/directivas/_INDEX.md` |
| CNT-MED-014 | 2B-3 | ESTANDAR-MEMORIA-TOKENS.md duplicates orchestration/ directive | `docs/40-standards/ESTANDAR-MEMORIA-TOKENS.md` |
| CNT-MED-015 | 2B-3 | testing-guides/ in 10-requirements violates ADR-039 DEC-SSOT-002 | `docs/10-requirements/testing-guides/` |
| CNT-MED-016 | 2B-3 | BACKEND-CRITICAL-ISSUES-PENDING.md (resolved) in active references | `docs/80-references/transversal/correcciones/` |
| CNT-MED-017 | 2B-3 | FL-SYS-06-MULTI-TENANT-ISOLATION.md -- architecture doc in UX section | `docs/30-ux-ui/flujos/system/` |
| CNT-MED-018 | 2B-3 | ESTANDAR-ESTRUCTURA-DOCS.md -- doc standard living in orchestration/ | `orchestration/referencias/` |
| CNT-MED-019 | 2B-3 | PLAN-DESARROLLO-ACTUALIZADO.md -- hybrid plan in wrong orchestration/ location | `orchestration/referencias/` |
| CNT-MED-020 | 2C-1 | "education" schema label in SCHEMA-REFERENCE.md without DDL clarification | 1 file |
| CNT-MED-021 | 2C-1 | Exercise type count 4-way ambiguity (23/27/30/33) undocumented in glossary | GLOSARIO.md + 30+ files |
| CNT-MED-022 | 2C-1 | Glossary gaps: docente/alumno, comodines, aula, submission vs attempt not defined | GLOSARIO.md |
| CNT-MED-023 | 2C-2 | 3 truly broken links in docs/ (ADR-010, ADR-020, correcciones/_MAP) | 3 files |
| CNT-MED-024 | 2D-1 | 6 STANDARD-*.md files use English prefix while 19 ESTANDAR-*.md use Spanish | `docs/40-standards/` |
| CNT-MED-025 | 2D-1 | PORTAL-TEACHER-API-REFERENCE.md exists in both 40-api/ and 60-portals/teacher/ | 2 files |
| CNT-MED-026 | 2D-1 | 4 audit reports misplaced in flujos/ root | `docs/30-ux-ui/flujos/AUDITORIA-*.md` |
| CNT-MED-027 | 2D-1 | 3 legacy frontend directories with dead code components | `_legacy/dashboard-migration-sprint/`, DashboardPage, DashboardLayout |
| CNT-MED-028 | 2D-1 | ADMIN-PORTAL-ENDPOINTS.md superseded by PORTAL-ADMIN-API-REFERENCE.md | `docs/40-api/ADMIN-PORTAL-ENDPOINTS.md` |
| CNT-MED-029 | 2D-1 | 8 micro-files in 00-overview (17-26 lines each) -- consolidation candidates | 8 files totaling ~166 lines |
| CNT-MED-030 | 2D-1 | Resolved correcciones/ directory still active (all items Estado: Resuelto) | `docs/80-references/transversal/correcciones/` |
| CNT-MED-031 | 2D-1 | 4 delivery RESUMEN files with overlapping content | 4 files in 99-delivery |
| CNT-MED-032 | 2D-1 | 4 broken references to `docs/99-archivados/` (directory does not exist) | 4 files referencing nonexistent path |

### LOW (18 issues)

Cosmetic issues and minor inconsistencies.

| ID | Source Report | Description | Files Affected |
|----|-------------|-------------|----------------|
| CNT-LOW-001 | 2A-2 | Node.js 18+ vs 20.x in 3 guides (technically correct as minimum) | 3 files |
| CNT-LOW-002 | 2A-2 | TailwindCSS 3 isolated in US-FUND-004 (same file as CNT-HIGH-010) | 1 file |
| CNT-LOW-003 | 2A-2 | TODO inline in 3 specification files | ET-EDU-002, ET-GAM-003, RF-EXT-002 |
| CNT-LOW-004 | 2A-2 | "Documento de Diseno v6.1" referenced but never existed (4 files) | 4 gamification spec files |
| CNT-LOW-005 | 2A-2 | 2 directivas marked "Pendiente" that will never be created | directivas/_INDEX.md |
| CNT-LOW-006 | 2B-1 | 18 files with EXAMPLE DDL (acceptable, generic illustrations) | 18 files |
| CNT-LOW-007 | 2B-2 | Auth flow overlap (FLUJO-REGISTRO-LOGIN vs FLUJO-INICIALIZACION, 70%) | Acceptable (different audiences) |
| CNT-LOW-008 | 2B-2 | Exercise types cluster overlap (12 files, MEDIUM-HIGH) | Acceptable (atomic by design) |
| CNT-LOW-009 | 2B-2 | Stack description scattered in 12+ files | Low priority (1FN applied in 00-overview/) |
| CNT-LOW-010 | 2B-3 | GOBIERNO-SIMCO.md governance content in docs/ (19 lines, borderline) | 1 file |
| CNT-LOW-011 | 2B-3 | MANUAL-TESTING-GUIDE-US-AE-007.sh script in docs/ (exists in 2 locations) | 2 files |
| CNT-LOW-012 | 2C-1 | "Monedas Lectoras" legacy variant of ML Coins (only in US-GAM-003) | 1 user story |
| CNT-LOW-013 | 2C-1 | alumno/docente/profesor as variants of student/teacher (acceptable synonyms) | 25+ files |
| CNT-LOW-014 | 2C-1 | multi-tenant vs multitenancy spelling variants | ~15 files |
| CNT-LOW-015 | 2C-2 | 20 links to archived/external files (intentional, not truly broken) | 20 links |
| CNT-LOW-016 | 2D-1 | 3 minimal stub directories (user-stories/_MOVED, guias/README, migracion/) | 3 directories |
| CNT-LOW-017 | 2D-1 | WEB-PUSH-MIGRATION.md one-time migration doc in 40-api/ | 1 file |
| CNT-LOW-018 | 2D-1 | prepare_usb_delivery.sh one-time script in 99-delivery | 1 file |

**Total: 88 issues (14 CRITICAL + 24 HIGH + 32 MEDIUM + 18 LOW)**

---

## Duplication Map

### DDL Duplication (P2-2B-1)

| Classification | Files | CREATE TABLE Count | Risk Level |
|----------------|-------|-------------------|------------|
| DUPLICATE (actual table copies, staleness risk) | 35 | ~95 | HIGH |
| NEEDS-REFERENCE (should link to canonical DDL) | 22 | ~30 | MEDIUM |
| EXAMPLE (generic illustrations, not gamilit-specific) | 18 | ~23 | LOW |
| LEGITIMATE (prose format in schema-reference/) | 0 | 0 | NONE |
| **Total** | **75** | **~148** | |

**Top DDL risk areas:**
1. Schema name staleness (7+ files with `auth.users`, `gamilit.`, `gamification.`, `analytics.`, `public.classroom`)
2. Tables renamed but not updated in docs (5 table renames not reflected)
3. Cross-file duplication (5 tables appear in 2-3 separate spec files each)
4. Unimplemented feature DDL (8 tables in docs that do not exist in canonical DDL)

### Narrative Duplication (P2-2B-2)

| # | Cluster | Files | Overlap | SSOT Designated | Recommendation |
|---|---------|-------|---------|-----------------|----------------|
| 1 | Auth Flow | 9 | LOW-MEDIUM | FLUJO-INICIALIZACION-USUARIO.md | KEEP + minor redirect |
| 2 | Gamification System | 13 | MEDIUM-HIGH | RANGOS-MAYA.md + ARQUITECTURA-GAMIFICACION.md | CONSOLIDATE partial |
| 3 | Exercise Types | 12 | MEDIUM-HIGH | RF-EDU-001 + MODULO-N-MECANICAS | KEEP (distinct audiences) |
| 4 | Portal Descriptions | 14 | MEDIUM-HIGH | PORTAL-{X}-GUIDE.md (tech); Manual_X (user) | CONSOLIDATE in 99-delivery |
| 5 | Testing Strategy | 7 | HIGH | ESTANDAR-TESTING + GUIA-COVERAGE | CONSOLIDATE TESTING-STRATEGY |
| 6 | ONBOARDING vs CLAUDE.md | 2 | HIGH (>70%) | CLAUDE.md | REDIRECT ONBOARDING-AGENTES |
| 7 | Deployment Docs | 6 | HIGH (65-70%) | DEPLOYMENT.md | CONSOLIDATE; designate SSOT |
| 8 | Project Identity | 8 | HIGH (70-75%) | CLAUDE.md (master) | KEEP with normalization |
| 9 | XP Calculation | 6 | MEDIUM-HIGH | ET-GAM-010-multipliers.md | KEEP + redirect from ARQUITECTURA-GAMIFICACION |

---

## Metric Discrepancy Matrix

| Metric | SSOT Value | Wrong Values Found | Files with Wrong Values | Discrepancy Count |
|--------|-----------|-------------------|------------------------|------------------|
| Endpoints | 912 | 850, 899, 901, 911 | `40-api/README.md` (2 values), `40-api/_INDEX.md`, `40-api/API-REFERENCE.md` | 5 |
| Components | 575 | 590, 592 | `30-ux-ui/README.md` (2 values), ADR-048, ADR-049, GUIA-WCAG-ACCESSIBILITY | 5 |
| Tables | 173 | 172 | MODELO-DATOS, `20-architecture/README.md`, SCHEMA-REFERENCE, 99-utilities | 4 |
| RLS Policies | 251 | 237, 207 | MODELO-DATOS, SCHEMA-REFERENCE, 99-utilities, ERR-DB-004 | 4 |
| Foreign Keys | 301 | 299 | MODELO-DATOS, ERR-DB-006-fk-cross-schema | 2 |
| Tablas con Entity | 157 | 156 | COHERENCE-ENTITIES-DDL.md | 1 |
| Tablas sin Entity | 16 | 17 | COHERENCE-ENTITIES-DDL.md | 1 |
| **Total Critical** | | | **18 unique files** | **22 discrepancies** |

**Files with highest discrepancy density:**
1. `docs/20-architecture/MODELO-DATOS.md` -- 3 stale metrics (tables, RLS, FK)
2. `docs/20-architecture/SCHEMA-REFERENCE.md` -- 2 stale metrics (tables, RLS)
3. `docs/20-architecture/schema-reference/99-utilities.md` -- 2 stale metrics (tables, RLS)
4. `docs/30-ux-ui/README.md` -- 2 stale component counts (590 and 592)
5. `docs/40-api/README.md` -- 2 stale endpoint counts (850 and 899 in same file)

### Stale Metrics Block (Catastrophic -- every value wrong)

`docs/00-overview/directivas/_INDEX.md` contains a metrics snapshot from MASTER_INVENTORY v7.0.0 (current: v14.4.0):

| Metric | Value in Doc | SSOT Value | Delta |
|--------|-------------|------------|-------|
| tablas | 170 | 173 | -3 |
| rls_policies | 263 | 251 | +12 (overcounted) |
| funciones | 255 | 158 | +97 (wrong methodology) |
| triggers | 132 | 68 | +64 (wrong methodology) |
| enums | 41 | 42 | -1 |
| modulos | 22 | 23 | -1 |
| endpoints | 850 | 912 | -62 |
| entities | 152 | 156 | -4 |
| services | 170 | 172 | -2 |
| controllers | 107 | 108 | -1 |
| componentes | 458 | 575 | -117 |
| hooks | 127 | 132 | -5 |
| paginas | 85 | 72 | +13 (different methodology) |
| stores | 32 | 13 | +19 (different methodology) |

---

## Technology Version Matrix

| Technology | Correct Version | Wrong Version(s) | Files Affected | Source Report |
|------------|----------------|-------------------|----------------|-------------|
| PostgreSQL | 15 | 16 | 38+ (21 PLAN.md, 5+ EPIC.md, 8 delivery, 4 other) | 2A-2, 2D-1 |
| PostgreSQL | 15 | 14, 14+ | 2 (GUIA-CREAR-BASE-DATOS, ET-EXT-002) | 2A-2 |
| Vite | 6.x | 7.x | 11 (7 PLAN.md, 2 EPIC.md, 2 delivery) | 2A-2, 2D-1 |
| React | 19 | 18 | 4 (US-NOT-001b, US-NOT-001c, ASSIGNMENTS-SPEC, US-FUND-004) | 2A-2 |
| NestJS | 11 | @10 packages | 1 (US-FUND-004) | 2A-2 |
| Zustand | 5.x | 4.x | 1 (US-FUND-004) | 2A-2 |
| TailwindCSS | 4.x | 3.x | 1 (US-FUND-004) | 2A-2 |
| Socket.IO Port | 3006 (same process) | 3001 (separate) | 1 (US-NOT-001a) | 2A-2 |
| Backend Port | 3006 | 3000 | 11 files | 2A-2, 2D-1 |
| Node.js | 20.x LTS | 18+ (minimum) | 3 files | 2A-2 |
| NEXUS | v4.1 | v3.4 | 15 _MAP.md files | 2A-2 |
| SIMCO | v4.0.0 (CLAUDE.md) | v4.3.0 | ~15 student spec files | 2A-2 |

**Root cause pattern:** Most version errors stem from the initial documentation phase (2025-Q4) when the project planned PostgreSQL 16 / Vite 7 / React 18. When the actual implementation used different versions, the PLAN.md files and early specifications were never updated.

---

## ADR-039 Violation Summary

| # | File/Directory | Violation Type | Severity | Recommended Action |
|---|---------------|---------------|----------|--------------------|
| V1-1 | `docs/00-overview/GOBIERNO-SIMCO.md` | Governance content in docs/ | LOW | Convert to 3-line stub linking to orchestration/ |
| V1-2 | `docs/00-overview/directivas/_INDEX.md` | Stale metrics + governance index in docs/ | MEDIUM | Remove metrics block; remove directivas/ from docs/ |
| V1-3 | `docs/40-standards/ESTANDAR-MEMORIA-TOKENS.md` | Agent operational directive duplicated in docs/ | MEDIUM | Remove; replace with stub to SIMCO-MEMORIA-TOKENS.md |
| V1-4 | `docs/40-standards/ESTANDAR-SKILLS.md` | docs/ prescribes orchestration/ directory structure | HIGH | Move to `orchestration/agents/SKILL-STANDARD.md` |
| V2-1 | `docs/10-requirements/testing-guides/` | QA testing guides in requirements section | MEDIUM | Move to `docs/50-guides/testing/exercise-guides/` |
| V2-2 | `docs/50-guides/documentation-master/` | Full audit task report in guides section | HIGH | Move to `orchestration/tareas/` |
| V2-3 | `docs/00-overview/REPORTE-INTEGRAL-2026-01-20.md` | Agent task report in overview section | HIGH | Move to `orchestration/tareas/` |
| V2-4 | `docs/80-references/transversal/correcciones/` | Resolved issue tracking in active references | MEDIUM | Archive in orchestration/tareas/ or delete |
| V2-5 | `docs/30-ux-ui/flujos/system/FL-SYS-06-*` | Architecture doc in UX section | MEDIUM | Move to `docs/20-architecture/security/` |
| V2-6 | `docs/50-guides/testing/*.sh` | Executable shell script in docs/ | LOW | Move to `apps/backend/test/scripts/` |
| V3-1 | `orchestration/referencias/ESTANDAR-ESTRUCTURA-DOCS.md` | Doc structure standard in orchestration/ | MEDIUM | Move to `docs/40-standards/` |
| V3-2 | `orchestration/referencias/PLAN-DESARROLLO-ACTUALIZADO.md` | Development plan in wrong orchestration/ location | MEDIUM | Move to `docs/10-requirements/epics/EPIC-GAM-F1-GAMIFICATION/PLAN.md` |

**Summary:** 3 HIGH + 7 MEDIUM + 2 LOW = **12 violations total**

---

## Terminology Standardization Needs

### High Priority

| Canonical Term | Variants Found | Files Affected | Action |
|---------------|----------------|----------------|--------|
| `gamification_system` (schema) | `gamification` (without `_system`) | 10+ files | Update to canonical |
| Exercise type counts: 33 DDL / 30 frontend / 27 DDL comment / 23 semantic | 23, 27, 30, 33 mixed without explanation | 30+ files | Add disambiguation note to GLOSARIO.md |

### Medium Priority

| Canonical Term | Variants Found | Files Affected | Action |
|---------------|----------------|----------------|--------|
| `educational_content` (schema) | `education` (conceptual name) | 3 files | Add DDL clarification note |
| `social_features` (schema) | `social` (short form) | 3 files | Add DDL clarification note |
| `progress_tracking` (schema) | `progress` (short form) | 3 files | Acceptable as TypeORM connection name |
| `ML Coins` (narrative) | `Monedas Lectoras` | 2 files (US-GAM-003, TRACEABILITY) | Keep as historical variant |

### Low Priority (Acceptable)

| Canonical Term | Variants Found | Assessment |
|---------------|----------------|------------|
| student | alumno (25+ files) | Acceptable Spanish synonym in pedagogical context |
| teacher | docente (120+ files), profesor (60+ files) | Acceptable Spanish synonyms |
| multi-tenant | multi-tenancy, multitenancy | Grammatically correct English variants |
| XP | experience points, puntos de experiencia | Expected multilingual variants |
| achievement | logro, badges | "badges" used for UI elements (correct context) |

### Glossary Gaps (Missing Definitions)

| Missing Term | Usage Frequency | Priority |
|-------------|-----------------|----------|
| `exercise_type` vs `exercise_mechanic` distinction (23/27/30/33) | CRITICAL | HIGH |
| `docente` / `alumno` as accepted synonyms | High | MEDIUM |
| `comodines` / `power-ups` relationship | High | MEDIUM |
| `aula` / `classroom` | High | MEDIUM |
| `submission` vs `attempt` | Medium | MEDIUM |
| `mecanica` (mechanic) as distinct concept | High | MEDIUM |

---

## Cross-Reference with Phase 1 Findings

Several Phase 2 findings confirm, extend, or intersect with Phase 1 structural issues:

| Phase 1 Issue | Phase 2 Confirmation/Extension |
|---------------|-------------------------------|
| STR-CRIT-012: Endpoint counts diverge by 62 across 40-api/ | CNT-CRIT-003 confirms 5 distinct values (850, 899, 901, 911, 912) |
| STR-HIGH-018: README.md states "590/592 components" | CNT-HIGH-001 extends to 5 total files with 590/592 |
| STR-HIGH-024: 3 DEPRECATED files not archived | CNT-HIGH-020 confirms same 3 files |
| STR-HIGH-026: testing-guides/ in wrong location | CNT-MED-015 confirms ADR-039 violation |
| STR-MED-003: REPORTE-INTEGRAL misplaced in overview | CNT-CRIT-011 confirms ADR-039 DEC-SSOT-005 violation |
| STR-MED-004: directivas/_INDEX.md describes orchestration/ | CNT-HIGH-006 + CNT-MED-013 extend with stale metrics detail |
| STR-MED-005: ONBOARDING-AGENTES ~60% duplicates CLAUDE.md | CNT-HIGH-014 confirms >70% with 14 specific overlapping sections |
| STR-MED-010: MODELO-DATOS.md has stale metrics | CNT-CRIT-005 quantifies: 3 specific stale values |
| STR-CRIT-007: documentation-master/ misplaced as guide | CNT-CRIT-010 confirms ADR-039 violation with task execution evidence |
| STR-MED-019: Dual prefix ESTANDAR-/STANDARD- | CNT-MED-024 confirms 19 vs 6 files |

**Observation:** Every structural finding that implied content issues was confirmed by Phase 2 analysis, often with greater severity than structurally estimated. The structural audit identified patterns; the content audit quantified them.

---

## Recommendations for Phase 3

Phase 3 (Data Model Alignment) should focus on:

### 3.1 DDL-Entity-Doc Three-Way Alignment

1. **Validate all 35 DUPLICATE DDL files** against canonical `apps/database/ddl/` -- identify column-level drift, not just table existence.
2. **Verify the 9 renamed/restructured tables** flagged in P2-2B-1 against current entity files in `apps/backend/src/modules/`.
3. **Audit the 8 unimplemented feature tables** in docs/ -- determine if they represent planned features or abandoned designs.
4. **Cross-check schema-reference docs** (170/173 tables documented) against actual DDL for completeness.

### 3.2 Entity-Endpoint Consistency

5. **Verify the 912 endpoint count** by comparing `BACKEND_INVENTORY.yml` against actual controller decorators.
6. **Validate API-REFERENCE.md** endpoint listings against actual routes (currently shows 901, -11 gap).
7. **Confirm portal API reference files** (`PORTAL-PARENTS/STUDENT/TEACHER-API-REFERENCE.md`) against actual controller exports.

### 3.3 Enum Alignment

8. **Audit exercise_type ENUM** (33 DDL values) against TypeScript enum, frontend registry (30 mechanics), and documentation (23/27/30/33 values).
9. **Verify all 42 ENUMs** in DDL against TypeScript constants in `enums.constants.ts`.

---

## Recommendations for Phase 4

Phase 4 (Restructuring Plan) should incorporate these content findings:

### 4.1 Consolidation Actions (from P2 findings)

1. **Batch metric update:** Create a script to update all 22 metric discrepancies in 18 files simultaneously.
2. **Batch tech version update:** Fix PostgreSQL 16->15 and Vite 7->6.x across 49+ files.
3. **Batch port update:** Fix localhost:3000->3006 across 11 files.
4. **99-delivery cleanup:** Archive 3 shorter manual variants; keep _ACTUALIZADO versions.
5. **ADR-039 file moves:** Execute 12 file/directory moves to correct boundary violations.

### 4.2 SSOT Designation Actions

6. **Deployment docs:** Designate `docs/00-overview/DEPLOYMENT.md` as SSOT; convert GUIA-DESPLIEGUE to redirect.
7. **Testing docs:** Reduce TESTING-STRATEGY.md to 20-30 line reference view.
8. **Onboarding:** Reduce ONBOARDING-AGENTES.md to 30-50 line guide (eliminate 14 duplicated sections).
9. **Gamification architecture:** Consolidate ARQUITECTURA-GAMIFICACION + DATOS-GAMIFICACION into `gamificacion/` subdirectory.

### 4.3 DDL Hygiene

10. **Add "DDL at time of writing" annotations** to all 35 DUPLICATE spec files.
11. **Replace embedded DDL in NEEDS-REFERENCE files** with canonical path references.
12. **Mark unimplemented feature DDL** with `> STATUS: PENDING DDL IMPLEMENTATION` headers.

### 4.4 Terminology Resolution

13. **Update GLOSARIO.md** with exercise type disambiguation (23/27/30/33 explanation).
14. **Add accepted synonyms** (docente/alumno, comodines/power-ups) to glossary.
15. **Batch replace** `gamification` -> `gamification_system` in 10+ files referencing schema names.

### 4.5 Estimated Effort

| Action Category | Files Affected | Estimated Effort |
|-----------------|----------------|-----------------|
| Metric updates (batch) | 18 files | LOW (30 min) |
| Tech version updates (batch) | 49+ files | LOW (45 min) |
| Port updates (batch) | 11 files | LOW (20 min) |
| ADR-039 file moves | 12 files/dirs | MEDIUM (1 hr) |
| SSOT consolidation | 8 docs | MEDIUM (2 hrs) |
| DDL annotation/cleanup | 57 files | HIGH (3 hrs) |
| Glossary + terminology | 15+ files | MEDIUM (1 hr) |
| 99-delivery cleanup | 6 files | LOW (20 min) |
| **Total** | **~176 file touches** | **~8-9 hours** |

---

## Appendix: Per-Report Summaries

### A.1 P2-2A-1: Metrics Consistency

Audited 16 metric patterns across all docs/ files against SSOT inventories. Found 16 critical discrepancies (endpoints, components, tables, RLS policies, foreign keys) and 7 minor discrepancies (exercise types convention, entity count edge case). MODELO-DATOS.md and docs/40-api/ are the highest-density problem areas.

### A.2 P2-2A-2: Dates and Versions

Identified PostgreSQL 16 in 38+ files and Vite 7 in 11+ files as dominant version errors, both stemming from initial planning documents never updated post-implementation. Found NEXUS v3.4 in 15 _MAP.md files, SIMCO v4.0.0/v4.3.0 coexistence in ~35 files, and localhost:3000 in 11 developer-facing files. The directivas/_INDEX.md contains a catastrophically stale metrics block with every value incorrect.

### A.3 P2-2B-1: DDL Duplication

Found 148 CREATE TABLE occurrences across 62 files in docs/. Classified as: 35 DUPLICATE (high staleness risk), 22 NEEDS-REFERENCE, 18 EXAMPLE (acceptable). Top risk: 7+ files with stale schema names, 5 tables renamed in code but not in docs, and 8 tables referenced in docs that do not exist in canonical DDL. Schema-reference/ (the correct pattern) has zero CREATE TABLE -- all prose format.

### A.4 P2-2B-2: Narrative Duplication

Identified 9 duplication clusters. Most critical: ONBOARDING-AGENTES vs CLAUDE.md (>70% overlap, 14 sections), deployment docs (4 active files, 65-70% overlap, no clear SSOT), and 99-delivery manual pairs (3 pairs of same-audience documents). Only 2 of 9 clusters have clearly designated canonical sources. Found data inconsistency: maya rank thresholds differ between SSOT and delivery manual.

### A.5 P2-2B-3: ADR-039 Violations

Found 12 violations of the docs/orchestration boundary: 4 Type-1 (docs/ containing governance content), 6 Type-2 (content in wrong docs/ section), 2 Type-3 (orchestration/ containing product docs). Highest severity: ESTANDAR-SKILLS.md prescribing orchestration/ structure, documentation-master/ audit report in guides, REPORTE-INTEGRAL in overview. 157 files validly reference orchestration/ (cross-linking is permitted).

### A.6 P2-2C-1: Terminology

Legacy schema names are the dominant issue: `gamification` (without `_system`) in 10+ files, `education` (without `_content`) in 3 files. Exercise type count ambiguity (23/27/30/33) is the most critical terminology gap. Gamification terms (ML Coins, XP, rangos maya) are well-controlled. User role synonyms (alumno/docente/profesor) are acceptable Spanish variants. Glossary has 6 gaps in important term definitions.

### A.7 P2-2C-2: Broken Links

Found 23 broken links: 9 to intentionally archived files (99-archivados/), 11 to orchestration/ files that exist but are out of audit scope, and 3 truly broken (files that never existed). Overall integrity rate: 96.9% (99.6% excluding archival references). The 3 truly broken links are in ADR-010, ADR-020, and correcciones/_MAP.md -- all reference agent-generated analysis files that were never persisted.

### A.8 P2-2D-1: Desaligned Content

Found 67 discrete findings: 18 legacy/orphan directories, 14 files without clear purpose, 12 contradictory content items, 11 consolidation candidates, 7 delivery assessment items, and 5 broken cross-references. Top priorities: archive sistema-recompensas/ (11 superseded files), move testing-guides/ to correct location, fix PostgreSQL/Vite/port version errors across 60+ files, and review credentials file for production secrets.

---

*Synthesis generated: 2026-02-27*
*Source reports: 8 sub-agent audits (P2-2A-1 through P2-2D-1)*
*Total issues registered: 88 (14 Critical + 24 High + 32 Medium + 18 Low)*
*Content health score: 58/100*
*No files were modified during this audit*
