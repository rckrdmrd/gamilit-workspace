# Phase 4: Documentation Restructuring Plan

**Date:** 2026-02-27
**Scope:** Prioritized remediation plan based on Phases 1-3 audit findings
**Auditor:** Claude Opus 4.6
**Mode:** ANALYSIS (read-only -- plan document, no files modified)
**Source:** AUDIT-P1-SYNTHESIS.md (62/100), AUDIT-P2-SYNTHESIS.md (58/100), AUDIT-P3-SYNTHESIS.md (76/100)

---

## Executive Summary

This restructuring plan consolidates **289 discrete findings** across three audit phases (134 structural + 88 content + 67 data model) into **8 prioritized remediation waves**. The plan is designed to maximize documentation health improvement per hour invested, targeting a composite score improvement from the current **65/100** (weighted average of P1:62, P2:58, P3:76) to a projected **85/100** after full execution.

The waves are ordered by severity and dependency: Wave 0 addresses 3 BLOCKERs that can cause runtime PostgreSQL failures; Wave 1 fixes the highest-impact content errors (wrong tech versions, stale metrics, wrong API paths) that actively mislead developers; Waves 2-3 tackle structural reorganization (file moves, SSOT designation, legacy archival); Waves 4-5 address documentation gaps (missing tables, entities, API endpoints); and Waves 6-7 handle quality standardization (frontmatter, naming conventions, _INDEX/_MAP coverage).

**Total estimated effort:** 32-38 hours across 8 waves.
**Recommended execution:** 2 agents, 4 working days (Waves 0-1 Day 1, Waves 2-3 Day 2, Waves 4-5 Day 3, Waves 6-7 Day 4).

---

## Audit Health Summary

| Phase | Score | Issues Found | Key Debt |
|-------|-------|-------------|----------|
| P1: Structural | 62/100 | 134 (18C + 40H + 38M + 38L) | _INDEX/_MAP gaps (51%), oversized files, 0% frontmatter in 5 sections |
| P2: Content | 58/100 | 88 (14C + 24H + 32M + 18L) | 38+ files with wrong PG version, 16 metric discrepancies, 35 DDL duplicates |
| P3: Data Model | 76/100 | 67 (3B + 20H + 9W + 35I) | 3 BLOCKERs, notifications schema rewrite, 33 ghost tables, 46% API coverage |
| **Composite** | **65/100** | **289 total** | |

### Issue Distribution

| Severity | P1 | P2 | P3 | Total | Deduplicated |
|----------|----|----|----|----|-------------|
| BLOCKER | 0 | 0 | 3 | 3 | 3 |
| CRITICAL | 18 | 14 | 0 | 32 | 28 |
| HIGH | 40 | 24 | 20 | 84 | 68 |
| MEDIUM | 38 | 32 | 9 | 79 | 65 |
| LOW/INFO | 38 | 18 | 35 | 91 | 75 |
| **Total** | **134** | **88** | **67** | **289** | **239** |

**Note:** ~50 issues are duplicated across phases (e.g., STR-CRIT-012 and CNT-CRIT-003 both flag endpoint count divergence). The deduplicated count of 239 represents unique remediation items.

---

## Wave Structure

| Wave | Name | Priority | Issues Addressed | Files Affected | Effort |
|------|------|----------|-----------------|----------------|--------|
| 0 | BLOCKER Fixes (DDL + Code) | P0 -- Immediate | 3 | 3-5 | 1 hr |
| 1 | Content Accuracy (Batch Fixes) | P1 -- Day 1 | 42 | ~80 | 4 hrs |
| 2 | Structural Reorganization (File Moves) | P2 -- Day 2 | 35 | ~40 | 5 hrs |
| 3 | SSOT Designation + Legacy Archival | P2 -- Day 2 | 28 | ~35 | 4 hrs |
| 4 | Schema-Reference Rewrites | P3 -- Day 3 | 24 | 8 | 8 hrs |
| 5 | API Documentation Expansion | P3 -- Day 3 | 12 | 4 | 4 hrs |
| 6 | Navigation Files + Frontmatter | P4 -- Day 4 | 55 | ~100 | 4 hrs |
| 7 | Naming Conventions + Cosmetic | P5 -- Day 4 | 40 | ~50 | 3 hrs |
| **Total** | | | **239** | **~325 file ops** | **33 hrs** |

---

## Wave 0: BLOCKER Fixes (DDL + Code)

**Priority:** P0 -- Execute BEFORE any documentation work
**Effort:** 1 hour
**Issues:** DMA-BLOCK-001, DMA-BLOCK-002, DMA-BLOCK-003

These are runtime failures, not documentation issues. They require DDL or code changes.

### Task 0.1: Fix user_purchases.item_id constraint (DMA-BLOCK-001)

**Problem:** `user_purchases.item_id uuid NOT NULL` has FK with `ON DELETE SET NULL`. PostgreSQL will raise `ERROR: null value in column "item_id" violates not-null constraint` if any shop item is deleted.

**Action:**
```sql
-- File: apps/database/ddl/schemas/gamification_system/tables/user_purchases.sql
-- Change: ON DELETE SET NULL -> ON DELETE RESTRICT
ALTER TABLE gamification_system.user_purchases
  DROP CONSTRAINT fk_user_purchases_item_id,
  ADD CONSTRAINT fk_user_purchases_item_id
    FOREIGN KEY (item_id) REFERENCES gamification_system.shop_items(id) ON DELETE RESTRICT;
```

**Validation:** `npm run build` (backend) + DB recreate

### Task 0.2: Fix notifications.type CHECK constraint (DMA-BLOCK-002)

**Problem:** M3-M5 grade notification flow uses `exercise_feedback` which is not in the DDL CHECK values (`achievement, mission, assignment, social, system, gamification`).

**Action:** Either:
- (A) Add `exercise_feedback` to the CHECK constraint in DDL, OR
- (B) Document that `assignment` is the correct notification type for exercise grading and update the flow docs

**Recommended:** Option (A) -- add the value to accommodate the specific UX flow.

**File:** `apps/database/ddl/schemas/notifications/tables/notifications.sql`

### Task 0.3: Fix parent_student_links DTO (DMA-BLOCK-003)

**Problem:** `parent_student_links.relationship_type TEXT NOT NULL` has no DEFAULT. The `LinkStudentDto` does not include `relationship_type`, causing NOT NULL violation on INSERT.

**Action:**
1. Add `relationship_type` field to `LinkStudentDto` in backend
2. Update UX flow documentation for parent-student linking

**File:** `apps/backend/src/modules/parents/dto/link-student.dto.ts`

---

## Wave 1: Content Accuracy (Batch Fixes)

**Priority:** P1 -- Execute Day 1 after BLOCKERs
**Effort:** 4 hours
**Issues:** CNT-CRIT-001 through CNT-CRIT-009, CNT-HIGH-001 through CNT-HIGH-011, STR-CRIT-012, related metric/version issues

This wave uses batch find-and-replace operations to fix **factually incorrect content** across many files simultaneously.

### Task 1.1: Fix PostgreSQL version (38+ files)

**Find:** `PostgreSQL 16` **Replace:** `PostgreSQL 15`
**Scope:** All `PLAN.md`, `EPIC.md`, delivery files, and guides

**Files (primary targets):**
- 21 PLAN.md files in `docs/10-requirements/epics/`
- 5+ EPIC.md files in `docs/10-requirements/epics/_wave-3-technical/`
- 8 delivery files in `docs/99-delivery/`
- 4 miscellaneous (GUIA-CREAR-BASE-DATOS: also fix `PostgreSQL 14`)

**Source:** CNT-CRIT-001, CNT-MED-003, CNT-MED-004

### Task 1.2: Fix Vite version (11+ files)

**Find:** `Vite 7` **Replace:** `Vite 6.x`
**Scope:** Same file categories as Task 1.1

**Source:** CNT-CRIT-002

### Task 1.3: Fix backend port (11 files)

**Find:** `localhost:3000` **Replace:** `localhost:3006`
**Scope:** API integration guides, setup docs, admin portal endpoints

**Files:** API-INTEGRATION, ESTRUCTURA-SHARED, SETUP-DEVELOPMENT, ADMIN-PORTAL-ENDPOINTS, ESTANDAR-API, STUDENT-GAP files

**Source:** CNT-CRIT-004

### Task 1.4: Fix endpoint counts (3 files + related)

| File | Current | Correct |
|------|---------|---------|
| `docs/40-api/README.md` | 850, 899 | 912 |
| `docs/40-api/_INDEX.md` | 911 | 912 |
| `docs/40-api/API-REFERENCE.md` | 901 | 912 |

**Source:** CNT-CRIT-003, CNT-CRIT-006, STR-CRIT-012

### Task 1.5: Fix component counts (5 files)

**Find:** `590` or `592` components **Replace:** `575`

**Files:** `30-ux-ui/README.md`, ADR-048, ADR-049, GUIA-WCAG-ACCESSIBILITY, and any others found

**Source:** CNT-HIGH-001, STR-HIGH-018

### Task 1.6: Fix table/RLS/FK counts (5+ files)

| Metric | Wrong | Correct | Files |
|--------|-------|---------|-------|
| Tables | 172 | 173 | MODELO-DATOS.md, 20-architecture/README.md, SCHEMA-REFERENCE, 99-utilities |
| RLS | 237, 207 | 251 | MODELO-DATOS.md, SCHEMA-REFERENCE, 99-utilities, ERR-DB-004 |
| FK | 299 | 301 | MODELO-DATOS.md, ERR-DB-006 |
| Entity | 156 | 157 | COHERENCE-ENTITIES-DDL.md |

**Source:** CNT-CRIT-005, CNT-HIGH-002 through CNT-HIGH-005, CNT-MED-001

### Task 1.7: Fix NEXUS/SIMCO version strings (50+ files)

| String | Wrong | Correct | Files |
|--------|-------|---------|-------|
| NEXUS | v3.4 | v4.1 | 15 _MAP.md files |
| SIMCO | v4.3.0 | v4.0.0 (CLAUDE.md canonical) | ~15 student spec files |

**Source:** CNT-HIGH-007, CNT-HIGH-008

### Task 1.8: Fix React/NestJS/other version strings (4 files)

| File | Wrong | Correct |
|------|-------|---------|
| US-NOT-001b | React 18 | React 19 |
| US-NOT-001c | React 18 | React 19 |
| ASSIGNMENTS-SPEC | React 18 | React 19 |
| US-FUND-004 | NestJS @10, React 18, Zustand 4, Tailwind 3 | NestJS 11, React 19, Zustand 5.x, Tailwind 4.x |

**Source:** CNT-HIGH-009, CNT-HIGH-010

### Task 1.9: Fix stale directivas/_INDEX.md metrics block

**Action:** Replace entire metrics block in `docs/00-overview/directivas/_INDEX.md` with current SSOT values from MASTER_INVENTORY v14.4.0, or remove the metrics block entirely (it is governance content in docs/).

**Source:** CNT-HIGH-006, CNT-MED-013

### Task 1.10: Fix WebSocket port reference

**Find:** port 3001 (WebSocket) **Replace:** port 3006 (same process)
**File:** `US-NOT-001a-websocket-infrastructure.md`

**Source:** CNT-HIGH-011

### Task 1.11: Fix schema name references (10+ files)

**Find:** `gamification.` (schema prefix) **Replace:** `gamification_system.`
**Scope:** ARQUITECTURA-GAMIFICACION, PORTAL-TEACHER-FLOWS, PLAN.md, EVOLUCION-SISTEMA-RECOMPENSAS, DEPENDENCY-MATRIX, 3 EPICs, and any others found

**Source:** CNT-HIGH-019, CNT-CRIT-007 (partial)

### Task 1.12: Fix API documentation paths (4 files)

| Wrong Path | Correct Path | File |
|-----------|-------------|------|
| `POST /auth/forgot-password` | `POST /auth/reset-password/request` | API-REFERENCE.md |
| `/classrooms/*` (9 endpoints) | `/social/classrooms/*` | API-REFERENCE.md |
| `/users`, `/users/:id`, `/users/me` | `/admin/users/*` or `/users/profile` | API-REFERENCE.md |
| `GET /auth/me` | `GET /auth/profile` | PORTAL-STUDENT-API-REFERENCE.md |
| `GET /auth/session` | `GET /auth/sessions` | PORTAL-STUDENT-API-REFERENCE.md |
| `PATCH /auth/profile` | `PUT /auth/profile` | API-REFERENCE.md |
| `PATCH /auth/change-password` | `PUT /auth/change-password` | API-REFERENCE.md |
| `POST /auth/logout-all` | `DELETE /auth/sessions` | API-REFERENCE.md |

**Source:** DMA-HIGH-017, P3-3C-2

### Task 1.13: Fix maya rank thresholds in delivery manual

**File:** `docs/99-delivery/.../MANUAL-USUARIO-PORTAL-ESTUDIANTE.md`
**Action:** Align with SSOT `RANGOS-MAYA.md` (Ajaw=0-499 XP, 5 rangos -- not 6 with Itzamna)

**Source:** CNT-CRIT-009

### Task 1.14: Fix renamed table references in docs (5 files)

| Old Name | Current Name | Affected Files |
|----------|-------------|----------------|
| `classroom_students` | `classroom_members` | ET-ADM-002 |
| `groups` | `teams` | RF-SOC-002, PERF-004 |
| `group_students` | `team_members` | RF-SOC-002 |
| `guild_audit_log` | (nonexistent) | RF-SOC-002 |

**Source:** CNT-CRIT-008

---

## Wave 2: Structural Reorganization (File Moves)

**Priority:** P2 -- Execute Day 2
**Effort:** 5 hours
**Issues:** 12 ADR-039 violations + 8 misplaced content items + 15 archival items

### Task 2.1: ADR-039 Boundary Corrections (12 moves)

| # | Source | Destination | Action | Source Issue |
|---|--------|-------------|--------|-------------|
| 1 | `docs/50-guides/documentation-master/` (12+ files) | `orchestration/tareas/TASK-2026-01-22-DOCUMENTATION-MASTER/` | MOVE entire tree | CNT-CRIT-010, V2-2 |
| 2 | `docs/00-overview/REPORTE-INTEGRAL-2026-01-20.md` | `orchestration/trazas/` | MOVE | CNT-CRIT-011, V2-3 |
| 3 | `docs/40-standards/ESTANDAR-SKILLS.md` | `orchestration/agents/SKILL-STANDARD.md` | MOVE | CNT-HIGH-018, V1-4 |
| 4 | `docs/40-standards/ESTANDAR-MEMORIA-TOKENS.md` | Replace with 3-line stub linking to `orchestration/directivas/simco/SIMCO-MEMORIA-TOKENS.md` | STUB | V1-3 |
| 5 | `docs/00-overview/directivas/_INDEX.md` | Remove metrics block; consider removing `directivas/` dir from docs/ | EDIT/REMOVE | V1-2 |
| 6 | `docs/10-requirements/testing-guides/` (8 files) | `docs/50-guides/testing/exercise-guides/` | MOVE | CNT-HIGH-022, V2-1 |
| 7 | `docs/80-references/transversal/correcciones/` | `orchestration/trazas/correcciones-historicas/` | MOVE (all resolved) | V2-4, CNT-MED-016, CNT-MED-030 |
| 8 | `docs/30-ux-ui/flujos/system/FL-SYS-06-*` | `docs/20-architecture/security/MULTI-TENANT-ISOLATION.md` | MOVE + rename | V2-5, CNT-MED-017 |
| 9 | `docs/50-guides/testing/impl/MANUAL-TESTING-GUIDE-US-AE-007.sh` | `apps/backend/test/scripts/` | MOVE | V2-6 |
| 10 | `docs/00-overview/GOBIERNO-SIMCO.md` | Replace with stub | STUB | V1-1 |
| 11 | `orchestration/referencias/ESTANDAR-ESTRUCTURA-DOCS.md` | `docs/40-standards/ESTANDAR-ESTRUCTURA-DOCS.md` | MOVE | V3-1 |
| 12 | `orchestration/referencias/PLAN-DESARROLLO-ACTUALIZADO.md` | Appropriate epic PLAN.md or archive | MOVE | V3-2 |

### Task 2.2: Misplaced Content Corrections (8 items)

| # | File | Current Location | Correct Location | Source Issue |
|---|------|-----------------|-----------------|-------------|
| 1 | `PORTAL-ADMIN-API-REFERENCE.md` | `docs/60-portals/` (root) | `docs/60-portals/admin/` | STR-HIGH-020 |
| 2 | `REACT-QUERY-MIGRATION-GUIDE.md` | `docs/50-guides/` (root) | `docs/50-guides/frontend/` | STR-HIGH-023 |
| 3 | `ADMIN-PORTAL-ENDPOINTS.md` | `docs/40-api/` | Archive (superseded by PORTAL-ADMIN-API-REFERENCE) | STR-HIGH-008, CNT-MED-028 |
| 4 | `GUIA-RESPONSIVE-TESTING.md` | `docs/50-guides/` (root) | `docs/50-guides/testing/` | STR-MED-035 |
| 5 | `GUIA-REFERENCIAS-SIMCO.md` | `docs/50-guides/` (root) | `orchestration/referencias/` | STR-MED-036 |
| 6 | Audit docs in `docs/30-ux-ui/flujos/` root | `flujos/AUDITORIA-*.md` (4 files) | `orchestration/trazas/` | CNT-MED-026 |
| 7 | `PORTAL-TEACHER-API-REFERENCE.md` | `docs/60-portals/teacher/` | Keep + add to `docs/40-api/_INDEX.md` | CNT-MED-025 |
| 8 | `UUID-SERIES-CATALOG.md` | `docs/20-architecture/schema-reference/` | `docs/20-architecture/` or `apps/database/` | STR-MED-038 |

### Task 2.3: Archive Legacy Directories (5 items)

| # | Directory | Action | Source Issue |
|---|-----------|--------|-------------|
| 1 | `docs/10-requirements/sistema-recompensas/` (11 files) | Move to `docs/10-requirements/_archived/` | CNT-HIGH-021 |
| 2 | `docs/10-requirements/03-desarrollo/` | Move to `docs/10-requirements/_archived/` | STR-HIGH-039 |
| 3 | `docs/10-requirements/04-fase-backlog/` | Move to `docs/10-requirements/_archived/` | STR-HIGH-039 |
| 4 | `docs/10-requirements/user-stories/` (legacy) | Move to `docs/10-requirements/_archived/` | STR-HIGH-039 |
| 5 | `docs/10-requirements/epics/features/` | Move to `docs/10-requirements/_archived/` (not an epic) | STR-HIGH-040 |

### Task 2.4: Archive Deprecated Files (6 items)

| # | File | Action | Source Issue |
|---|------|--------|-------------|
| 1 | `docs/50-guides/deployment/DEPLOYMENT-MASTER.md` | Move to `docs/50-guides/deployment/_archived/` | CNT-HIGH-020 |
| 2 | `docs/50-guides/deployment/GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md` | Move to `docs/50-guides/deployment/_archived/` | CNT-HIGH-020 |
| 3 | `docs/50-guides/deployment/GUIA-ACTUALIZACION-PRODUCCION.md` | Move to `docs/50-guides/deployment/_archived/` | CNT-HIGH-020 |
| 4 | `docs/50-guides/backend/GUIA-CREAR-BASE-DATOS.md` | Move to `_archived/` (marked legacy) | STR-MED-034 |
| 5 | `docs/60-portals/student/specs/gaps/` (5 files) | Move to `docs/60-portals/student/specs/_archived/` | CNT-HIGH-023, STR-LOW-026 |
| 6 | `docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-K8S/EPIC.md` | Update status to "cancelled" or "not_applicable" | CNT-CRIT-012 |

---

## Wave 3: SSOT Designation + Legacy Cleanup

**Priority:** P2 -- Execute Day 2 (after Wave 2)
**Effort:** 4 hours
**Issues:** 9 duplication clusters + 8 legacy doc sections + schema name corrections

### Task 3.1: Designate Deployment SSOT

**Current state:** 4 active deployment files with 65-70% overlap, no designated canonical source.

**Action:**
1. Designate `docs/50-guides/deployment/GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md` as primary (most complete) -- BUT it was archived in Wave 2, so:
2. Actually: keep `docs/20-architecture/AMBIENTES-DEV-PROD.md` as architecture-level SSOT
3. Create `docs/50-guides/deployment/DEPLOYMENT-GUIDE.md` consolidating operational content from all 4 files
4. `docs/00-overview/DEPLOYMENT.md` (509 lines) -> reduce to 30-line redirect

**Source:** CNT-CRIT-014, CNT-HIGH-015

### Task 3.2: Consolidate Testing Documentation

**Current state:** Testing content in 4 sections: 10-requirements (testing-guides), 40-standards (ESTANDAR-TESTING), 50-guides/testing/, and 00-overview (TESTING-STRATEGY).

**Action:**
1. `docs/00-overview/TESTING-STRATEGY.md` -> reduce to 20-line redirect to `docs/40-standards/ESTANDAR-TESTING.md`
2. Testing guides already moved to 50-guides in Wave 2 (Task 2.1 #6)
3. `ESTANDAR-TESTING.md` = policy SSOT; `50-guides/testing/` = implementation SSOT

**Source:** CNT-HIGH-016

### Task 3.3: Reduce ONBOARDING-AGENTES.md Duplication

**Current state:** >70% duplication with CLAUDE.md across 14 sections.

**Action:** Reduce ONBOARDING-AGENTES.md to a 40-50 line quick-start guide that:
1. Links to CLAUDE.md for full project context
2. Contains only onboarding-specific content: first-session checklist, tool verification, common pitfalls
3. Removes all duplicated sections (project identity, stack, modules, aliases, structure)

**Source:** CNT-HIGH-014, STR-MED-005

### Task 3.4: Consolidate 99-delivery Manual Pairs

**Current state:** 3 pairs of redundant user manuals (same portal, same audience).

**Action:** For each portal:
1. Keep the `_ACTUALIZADO` version (it is more recent)
2. Archive the older version in `docs/99-delivery/_archived/`
3. Consolidate 4 RESUMEN files into 1

**Source:** CNT-HIGH-017, STR-HIGH-010, STR-HIGH-011, CNT-MED-031

### Task 3.5: Mark Legacy Documentation Sections with [DEPRECATED]

Add banner to 8 legacy sections identified in P3:

```markdown
> **[DEPRECATED]** This section describes an early conceptual model that was never implemented.
> The DDL-accurate documentation appears in the section(s) below.
```

**Files and locations:**
1. `01-auth.md` -- auth schema legacy tables (lines ~9-170)
2. `03-education.md` -- legacy educational modules/exercises section (lines ~1-300)
3. `04-gamification.md` -- 8 superseded tables (lines ~15-180)
4. `05-social.md` -- teams/team_challenges outdated columns (lines ~155-210)
5. `09-notifications.md` -- notification_queue and notification_templates pre-v2.0 (lines ~9-100)
6. `12-leaderboard.md` -- all 4 conceptual table entries (entire file)
7. `15-settings.md` -- first 3 entries with `settings.*` prefix (lines ~7-55)
8. `16-audit.md` -- first section with `audit.*` prefix (lines ~9-65)

**Source:** AUDIT-P3-SYNTHESIS legacy sections inventory

### Task 3.6: Remove/Mark Ghost Table Entries

Mark 33 ghost table entries across 7 schema-reference files with `[NO DDL -- conceptual only]` annotations:

| File | Ghost Tables | Count |
|------|-------------|-------|
| 01-auth.md | user_profiles, sessions, refresh_tokens, oauth_connections, password_resets, login_attempts | 6 |
| 03-education.md | exercise_types, exercise_results, exercise_feedback, contents, content_versions, content_categories, reading_assignments, spaced_repetition, educational_modules, module_progress | 10 |
| 04-gamification.md | xp_transactions, levels, rank_definitions, student_gamification, gamification_config, xp_multipliers, daily_xp_limits, streak_records | 8 |
| 09-notifications.md | push_subscriptions | 1 |
| 12-leaderboard.md | leaderboard_entries, leaderboard_seasons, leaderboard_history, leaderboard_snapshots | 4 |
| 16-audit.md | audit_logs, data_changes, access_logs | 3 |
| 18-admin-dashboard.md | materialized_views_config | 1 |

**Source:** AUDIT-P3-SYNTHESIS ghost references inventory

### Task 3.7: Fix ADR Issues

| # | Action | Files | Source Issue |
|---|--------|-------|-------------|
| 1 | Fix ADR-040 H1: "ADR-0001" -> "ADR-040" | `ADR-040-monorepo-architecture.md` | STR-CRIT-013 |
| 2 | Fix ADR-041 H1: "ADR-0002" -> "ADR-041" | `ADR-041-simco-system.md` | STR-CRIT-013 |
| 3 | Fix ADR-042 H1: add "ADR-042" prefix | `ADR-042-team-vs-guild.md` | STR-CRIT-014 |
| 4 | Fix ADR-043 H1: "ADR-2026-01-07" -> "ADR-043" | `ADR-043-consolidacion-bd.md` | STR-CRIT-015 |
| 5 | Fix 3 contradictory states (header vs footer) | ADR-017, ADR-021, ADR-043 | STR-CRIT-016 |
| 6 | Update README.md to include ADR-046 through ADR-050 | `90-adr/README.md` | STR-HIGH-029 |
| 7 | Fix _MAP.md category counts | `90-adr/_MAP.md` | STR-HIGH-030 |
| 8 | Fix _INDEX.md ADR-011 status | `90-adr/_INDEX.md` | STR-HIGH-031 |
| 9 | Add "Alternativas Consideradas" to ADR-046 through ADR-050 | 5 ADR files | STR-HIGH-032 |

### Task 3.8: Update GLOSARIO.md

1. Add exercise type disambiguation entry explaining 23/27/30/33 counts
2. Add accepted synonyms: docente/alumno, comodines/power-ups, aula/classroom
3. Add missing definitions: submission vs attempt, mecanica (mechanic)

**Source:** CNT-MED-021, CNT-MED-022

### Task 3.9: Fix ENUM Values in _MAP.md

1. `user_status` ENUM: fix `pending_verification` -> `pending`, add `banned`
2. `auth_provider` ENUM: remove `clever`, add `facebook`, `apple`, `github`

**Source:** DMA-HIGH-015, DMA-HIGH-016

---

## Wave 4: Schema-Reference Rewrites

**Priority:** P3 -- Execute Day 3
**Effort:** 8 hours
**Issues:** 20 HIGH data model alignment issues

This is the most labor-intensive wave. Each task requires reading the DDL file, the current schema-reference entry, and writing accurate column-level documentation.

### Task 4.1: Rewrite notifications schema (09-notifications.md)

**Scope:** Rewrite entire file. 5 of 7 tables are PARTIAL or worse.

| Table | Current State | Required Action |
|-------|--------------|-----------------|
| `notifications` (15 cols) | Undocumented | Write from scratch |
| `notification_queue` (12 cols) | Describes wrong model | Full rewrite |
| `notification_templates` (16 cols) | Pre-v2.0 (9 cols) | Full rewrite |
| `notification_templates_i18n` | PARTIAL | Update columns |
| `notification_logs` | PARTIAL | Update columns |
| `user_devices` | MATCH | Keep |
| `rate_limit_logs` | MATCH | Keep |

**Source:** DMA-HIGH-001, DMA-HIGH-002, DMA-HIGH-003, DMA-HIGH-004

### Task 4.2: Update educational_content legacy section (03-education.md)

**Scope:** Replace legacy `modules` (11 cols documented, 36 actual) and `exercises` (20 cols documented, 42 actual) sections with DDL-accurate content. Add 4 undocumented tables.

| Table | Current State | Required Action |
|-------|--------------|-----------------|
| `modules` | Legacy (11 of 36 cols) | Rewrite |
| `exercises` | Legacy (20 of 42 cols) | Rewrite |
| `assessment_rubrics` | Missing | Write from scratch |
| `assignments` | Missing | Write from scratch |
| `assignment_students` | Missing | Write from scratch |
| `assignment_submissions` | Missing | Write from scratch |

**Source:** DMA-HIGH-005, DMA-HIGH-006, DMA-HIGH-007

### Task 4.3: Fix system_configuration docs (15-settings.md)

**Scope:** Update first 3 entries from `settings.*` to `system_configuration.*` prefix. Expand from 6-9 columns to DDL-accurate 23-30 columns per table.

| Table | Documented Cols | DDL Cols | Action |
|-------|----------------|----------|--------|
| `system_settings` | 6 | 23 | Expand + fix schema prefix |
| `feature_flags` | 9 | 25 | Expand + fix schema prefix |
| `gamification_parameters` | 7 | 30 | Expand + fix schema prefix |

**Source:** DMA-HIGH-008

### Task 4.4: Fix social_features teams documentation (05-social.md)

**Scope:** Rewrite `teams` (10/25 cols documented), `team_members`, and `team_challenges` sections.

| Table | Issue | Action |
|-------|-------|--------|
| `teams` | 15 cols undocumented, `status` ENUM doesn't exist | Rewrite with all 25 columns |
| `team_challenges` | Describes wrong table structure | Rewrite as junction table |

**Source:** DMA-HIGH-009, DMA-HIGH-010

### Task 4.5: Fix parent tables documentation (01-auth.md)

**Scope:** Move `parent_accounts`, `parent_student_links`, `parent_notifications` from `parents.*` to `auth_management.*` prefix. Add missing columns (14-22 per table).

**Source:** DMA-HIGH-014

### Task 4.6: Document admin_dashboard tables (18-admin-dashboard.md)

**Scope:** Document `metrics_history` (23 columns, currently 0 documented). Remove ghost `materialized_views_config`.

**Source:** DMA-HIGH-011, DMA-HIGH-012

### Task 4.7: Document classroom_missions (04-gamification.md or 06-classrooms.md)

**Scope:** Add `classroom_missions` (18 columns) to schema-reference. Currently entirely undocumented despite having full DDL + RLS + triggers + 6 indexes.

**Source:** DMA-HIGH-013

### Task 4.8: Fix communication table documentation (19-communication.md)

**Scope:** Update "Sin entity" status to reflect 4 existing entities. Document 12 missing columns in `messages`.

**Source:** P3-3B-1

---

## Wave 5: API Documentation Expansion

**Priority:** P3 -- Execute Day 3 (after Wave 4)
**Effort:** 4 hours
**Issues:** DMA-HIGH-017 through DMA-HIGH-020

### Task 5.1: Add Admin Module to API-REFERENCE.md

**Scope:** 159 endpoints across admin controllers. At minimum, create a path summary table grouped by sub-resource.

**Approach:** Generate from controller decorators in `apps/backend/src/modules/admin/controllers/`.

**Source:** DMA-HIGH-018

### Task 5.2: Add 2FA Endpoints to API-REFERENCE.md

**Scope:** 7 endpoints: `GET /auth/2fa/status`, `POST /auth/2fa/setup`, `POST /auth/2fa/setup/verify`, `POST /auth/2fa/verify`, `DELETE /auth/2fa/disable`, `POST /auth/2fa/resend`, `POST /auth/reset-password/validate`

**Source:** DMA-HIGH-019

### Task 5.3: Add Undocumented Module Stubs

For modules with zero documentation, add at minimum a "path listing" section:

| Module | Endpoints | Priority |
|--------|-----------|----------|
| social (guilds, teams, friendships, challenges) | ~123 | HIGH |
| content (full module) | ~93 | MEDIUM |
| lti | 42 | LOW |
| assignments | 18 | MEDIUM |

**Source:** P3-3C-2

### Task 5.4: Update _INDEX.md and _MAP.md in 40-api/

Add references to:
- `PORTAL-PARENTS-API-REFERENCE.md`
- `PORTAL-STUDENT-API-REFERENCE.md`
- `PORTAL-TEACHER-API-REFERENCE.md`

**Source:** STR-HIGH-007

---

## Wave 6: Navigation Files + Frontmatter

**Priority:** P4 -- Execute Day 4
**Effort:** 4 hours
**Issues:** 55+ navigation and metadata gaps

### Task 6.1: Create Missing _INDEX.md Files (Top 20 Priority)

| # | Directory | Priority | Source Issue |
|---|-----------|----------|-------------|
| 1 | `docs/60-portals/admin/` | HIGH | STR-CRIT-001 |
| 2 | `docs/60-portals/parents/` | HIGH | STR-CRIT-001 |
| 3 | `docs/60-portals/student/` | HIGH | STR-CRIT-001 |
| 4 | `docs/60-portals/teacher/` | HIGH | STR-CRIT-001 |
| 5 | `docs/60-portals/` (root) | HIGH | STR-HIGH-021 |
| 6 | `docs/50-guides/backend/` | HIGH | STR-CRIT-002 |
| 7 | `docs/50-guides/frontend/` | HIGH | STR-HIGH-034 |
| 8 | `docs/50-guides/testing/` | HIGH | STR-HIGH-034 |
| 9 | `docs/50-guides/deployment/` | MEDIUM | STR-CRIT-002 |
| 10 | `docs/50-guides/troubleshooting/` | MEDIUM | STR-CRIT-002 |
| 11 | `docs/50-guides/integration/` | MEDIUM | STR-CRIT-002 |
| 12 | `docs/80-references/knowledge-base/` | MEDIUM | STR-HIGH-004 |
| 13 | `docs/80-references/transversal/arquitectura/` | MEDIUM | STR-HIGH-005 |
| 14 | `docs/99-delivery/2025-11-16-entrega-final/` | MEDIUM | STR-HIGH-038 |
| 15 | `docs/10-requirements/epics/EPIC-GAM-F3-TEACHER-PORTAL/` | LOW | STR-MED-031 |

_INDEX.md template (per project convention):

```markdown
# {Directory Name}

## Contents

| File | Description | Updated |
|------|-------------|---------|
| `{filename}.md` | {one-line description} | {date} |
```

### Task 6.2: Create Missing _MAP.md Files (Top 10 Priority)

| # | Directory | Priority | Source Issue |
|---|-----------|----------|-------------|
| 1 | `docs/00-overview/` | HIGH | STR-CRIT-018 |
| 2 | `docs/60-portals/` (root) | HIGH | STR-HIGH-021 |
| 3 | `docs/30-ux-ui/` (root) | HIGH | STR-HIGH-015 |
| 4 | `docs/20-architecture/schema-reference/` | MEDIUM | STR-HIGH-014 |
| 5 | `docs/50-guides/` (root) | MEDIUM | STR-CRIT-002 |
| 6 | `docs/50-guides/backend/` | MEDIUM | STR-CRIT-002 |
| 7 | `docs/99-delivery/` (root) | MEDIUM | STR-HIGH-012 |
| 8 | `docs/60-portals/admin/` | LOW | STR-HIGH-021 |
| 9 | `docs/60-portals/parents/` | LOW | STR-HIGH-021 |
| 10 | `docs/80-references/` (root) | LOW | STR-CRIT-002 |

### Task 6.3: Frontmatter Generation (Priority Sections)

Generate YAML frontmatter for the 5 sections with 0% coverage (212 files total):

| Section | Files | Template |
|---------|-------|----------|
| `docs/90-adr/` | 47 | `titulo, fecha, estado, tipo: adr` |
| `docs/60-portals/` | 41 | `titulo, portal, tipo, actualizado` |
| `docs/40-api/` | 10 | `titulo, tipo: api-reference, actualizado` |
| `docs/30-ux-ui/` | 80 | `titulo, tipo, flujo, actualizado` |
| `docs/99-delivery/` | 31 | `titulo, fecha_entrega, tipo: delivery` |

**Canonical frontmatter schema** (proposed):

```yaml
---
titulo: {string}
tipo: {adr|guide|standard|reference|portal|api|delivery|epic|user-story|spec}
fecha_creacion: {YYYY-MM-DD}
ultima_actualizacion: {YYYY-MM-DD}
estado: {activo|deprecado|archivado|borrador}
---
```

**Source:** STR-CRIT-010, STR-CRIT-011, Pattern 1

---

## Wave 7: Naming Conventions + Cosmetic Fixes

**Priority:** P5 -- Execute Day 4 (after Wave 6)
**Effort:** 3 hours
**Issues:** 40+ naming/cosmetic issues

### Task 7.1: Standardize File Naming (25+ files)

| # | Pattern | Action | Files | Source |
|---|---------|--------|-------|--------|
| 1 | 10 files with underscores in `99-delivery/` | Rename to hyphens | 10 | STR-HIGH-009 |
| 2 | 5 CamelCase files in `50-guides/frontend/impl/` | Rename to UPPERCASE-KEBAB | 5 | STR-MED-027 |
| 3 | `BUILD_ERRORS.md` in troubleshooting | Rename to `BUILD-ERRORS.md` | 1 | STR-LOW-029 |
| 4 | `FL-SYS-06-*` prefix | Rename to `FLUJO-SYS-06-*` (if still in 30-ux-ui after Wave 2 move) | 1 | STR-HIGH-017 |

### Task 7.2: Standardize ADR States (47 files)

Reduce 14 state variants to 4 canonical values:

| Canonical | Variants to Normalize |
|-----------|----------------------|
| `Aceptada` | Aceptado, ACEPTADO, Aceptada, Accepted |
| `Pendiente` | Pendiente, Pending, En Discusion |
| `Rechazada` | Rechazada, Rejected |
| `Enmendada` | Amended, Enmendada, Superseded |

**Source:** STR-HIGH-028

### Task 7.3: Standardize Standards Prefix (6 files)

Rename `STANDARD-*.md` to `ESTANDAR-*.md` (or vice versa). The project is predominantly Spanish-named (19 ESTANDAR vs 6 STANDARD), so rename the minority:

| Old Name | New Name |
|----------|----------|
| `STANDARD-RESPONSIVE.md` | `ESTANDAR-RESPONSIVE.md` |
| `STANDARD-FRONTEND-ERRORS.md` | `ESTANDAR-FRONTEND-ERRORS.md` |
| ... (4 more) | ... |

Also add all 6 to `_INDEX.md` and `_MAP.md`.

**Source:** STR-CRIT-006, STR-MED-019, CNT-MED-024

### Task 7.4: Fix Broken Links (3 truly broken)

| Link Location | Broken Reference | Fix |
|---------------|-----------------|-----|
| ADR-010 | Agent analysis file | Remove or replace with archive note |
| ADR-020 | Agent analysis file | Remove or replace with archive note |
| `correcciones/_MAP.md` | Archived document | Fix path or remove (directory moved in Wave 2) |

**Source:** CNT-MED-023

### Task 7.5: Oversized File Splitting Candidates (7 files >1,500 lines)

These files were identified in P1 but splitting requires careful content analysis:

| File | Lines | Recommended Split |
|------|-------|------------------|
| `PORTAL-ADMIN-GUIDE.md` | 2,228 | Split into 5 sub-pages (pages, components, API, config, testing) |
| `Manual_Portal_Administrador_ACTUALIZADO.md` | 2,666 | Already in delivery; consider archiving shorter version instead |
| `Manual_Portal_Student_v1.0.md` | 1,859 | Already superseded by MANUAL-USUARIO-PORTAL-ESTUDIANTE |
| `PORTAL-STUDENT-GUIDE.md` | 1,843 | Split: core guide (500) + hooks spec (ref) + gamification spec (ref) |
| `ESTANDAR-SEGURIDAD.md` | 1,863 | Split into OWASP-Backend + OWASP-Frontend + Auth-Patterns |
| `Manual_Portal_Maestros_ACTUALIZADO.md` | 1,617 | Keep (delivery format) |
| `ESTANDAR-TESTING.md` | 1,582 | Split into Policy + Backend-Impl + Frontend-Impl + E2E |

**Source:** STR-CRIT-003, STR-CRIT-004, STR-CRIT-005, Pattern 3

### Task 7.6: Review Credentials File

**Action:** Review `docs/99-delivery/2025-11-16-entrega-final/08_CREDENCIALES_Y_ACCESOS.md` for production secrets. If production credentials are present, redact them.

**Source:** CNT-CRIT-013

---

## Validation Checklist

After each wave, run:

```bash
# 1. Git status -- ensure only expected files changed
git status

# 2. Build validation (after Wave 0 only -- DDL/code changes)
cd apps/backend && npm run build && npm run lint && npm run test
cd apps/frontend && npm run build && npm run lint && npm run typecheck

# 3. Link integrity (after Waves 2-3 -- file moves)
# Search for references to moved files and update them
grep -r "documentation-master" docs/ --include="*.md" -l
grep -r "testing-guides" docs/ --include="*.md" -l
grep -r "REPORTE-INTEGRAL" docs/ --include="*.md" -l
# ... (for each moved file)

# 4. Metric consistency (after Wave 1)
# Verify all files now show 912 endpoints, 575 components, 173 tables, etc.

# 5. Navigation file coverage (after Wave 6)
# Count directories with _INDEX.md
find docs/ -type d | while read d; do [ -f "$d/_INDEX.md" ] || echo "MISSING: $d"; done
```

---

## Projected Health Score After Remediation

| Phase | Current | After Waves 0-1 | After Waves 2-3 | After Waves 4-5 | After Waves 6-7 | Projected Final |
|-------|---------|-----------------|-----------------|-----------------|-----------------|----------------|
| P1: Structural | 62 | 64 | 72 | 73 | 82 | **82** |
| P2: Content | 58 | 72 | 78 | 80 | 83 | **83** |
| P3: Data Model | 76 | 78 | 82 | 90 | 91 | **91** |
| **Composite** | **65** | **71** | **77** | **81** | **85** | **85** |

### Score Improvement Breakdown

| Wave | Delta | Primary Impact |
|------|-------|---------------|
| 0 | +1 | Eliminates 3 runtime BLOCKERs |
| 1 | +5 | Fixes ~80 files with wrong metrics/versions/ports/paths |
| 2 | +4 | Corrects 12 ADR-039 violations, 8 misplacements, 11 archival items |
| 3 | +2 | Designates SSOTs, marks 33 ghost tables, fixes 8 legacy sections |
| 4 | +6 | Rewrites 6 critically wrong schema docs covering ~40 tables |
| 5 | +2 | Adds 159+ admin endpoints, 7 2FA endpoints, path fixes |
| 6 | +3 | Adds ~25 _INDEX.md, ~10 _MAP.md, 212 frontmatter entries |
| 7 | +1 | Naming normalization, ADR state cleanup, cosmetic fixes |
| **Total** | **+20** | 65 -> 85 |

---

## Dependency Graph

```
Wave 0 (BLOCKERs)
  |
  v
Wave 1 (Content Accuracy)    -- can run independently
  |
  v
Wave 2 (File Moves)          -- must complete before Wave 6 (navigation)
  |
  v
Wave 3 (SSOT + Legacy)       -- depends on Wave 2 (archived files must exist first)
  |
  v
Wave 4 (Schema Rewrites)     -- depends on Wave 3 (ghost tables marked)
  |   \
  v    v
Wave 5  Wave 6 (Navigation)  -- Wave 5 and 6 can run in parallel
  |    /
  v   v
Wave 7 (Cosmetic)            -- must be last (naming changes affect everything)
```

**Parallelization opportunities:**
- Waves 4 and 5 can be assigned to different agents
- Waves 5 and 6 can run in parallel
- Wave 1 tasks are fully independent and can be split across 2 agents

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|-----------|
| File moves break internal links | HIGH | After Wave 2, grep for all moved filenames in all .md files; update references |
| Metric batch-replace hits false positives | MEDIUM | Use precise grep patterns (e.g., exact line match, not just "575") |
| Schema-reference rewrites introduce new errors | MEDIUM | Cross-validate each rewrite against DDL file + entity file |
| Frontmatter generation conflicts with existing content | LOW | Only add to files with 0% frontmatter; never overwrite existing |
| ADR state normalization loses historical context | LOW | Preserve the original state value in a `<!-- previous: X -->` comment |

---

## Execution Recommendations

1. **Agent allocation:** Waves 0-3 are best handled by a single agent (consistency in file-move tracking). Waves 4-7 can be split between 2 agents.

2. **Commit strategy:** One commit per wave, with descriptive message format:
   - `[GAM-DOCS] Wave 0: fix 3 BLOCKERs (DDL + DTO)`
   - `[GAM-DOCS] Wave 1: batch content accuracy fixes (80 files)`
   - `[GAM-DOCS] Wave 2: structural reorganization (35 file moves)`
   - etc.

3. **Link tracking:** Maintain a `MOVED-FILES.md` ledger during Wave 2 execution that maps old paths to new paths. After all moves, run a batch reference update.

4. **Incremental validation:** After each wave, verify the build still passes and spot-check 3-5 remediated files.

5. **Do not split Wave 4 tasks across sessions:** Schema-reference rewrites require holding DDL context in memory. Each Task 4.x should be completed in a single pass.

---

*Restructuring plan generated: 2026-02-27*
*Total issues addressed: 239 (deduplicated from 289 across 3 phases)*
*Estimated effort: 32-38 hours across 8 waves*
*Projected score improvement: 65/100 -> 85/100 (+20 points)*
*No files were modified during this planning phase*
