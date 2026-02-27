# P2-2B-1: DDL Duplication Audit in docs/

**Task:** TASK-2026-02-27-AUDITORIA-DOCS
**Phase:** P2 — Content Quality
**Sub-task:** 2B-1 DDL Duplication
**Date:** 2026-02-27
**Auditor:** claude-sonnet-4-6 (read-only)

---

## Summary

| Metric | Value |
|--------|-------|
| Files with DDL content | 75 unique files |
| CREATE TABLE occurrences | 148 (across 62 files) |
| CREATE TYPE occurrences | 17 (across 11 files) |
| CREATE OR REPLACE FUNCTION occurrences | 52 (across 20 files) |
| ALTER TABLE occurrences | ~35 (across 20 files) |
| CREATE INDEX occurrences | ~90 (across 42 files) |
| CREATE TRIGGER occurrences | ~25 (across 17 files) |
| CREATE POLICY occurrences | ~25 (across 18 files) |
| INSERT INTO occurrences | ~80 (across 49 files) |

**Classification Breakdown:**

| Classification | File Count | Notes |
|----------------|-----------|-------|
| LEGITIMATE | 0 | schema-reference/ has NO CREATE TABLE (uses prose format) |
| EXAMPLE | 18 | Generic/illustrative DDL, not gamilit-specific tables |
| DUPLICATE | 35 | Copies of actual table definitions with staleness risk |
| NEEDS-REFERENCE | 22 | DDL for tables that exist/existed but should link to DDL SSOT |

---

## Detailed Findings

### DUPLICATE (highest priority — actual table copies that can become stale)

These files contain DDL that copies real table definitions from `apps/database/ddl/` and is at HIGH risk of becoming stale as the canonical DDL evolves.

| File | DDL Objects | Staleness Risk | Notes |
|------|-------------|---------------|-------|
| `docs/10-requirements/epics/EPIC-GAM-F3-SOCIAL-GAMIFICATION/requirements/RF-SOC-002-gremios.md` | `social_features.guilds`, `guild_members`, `guild_join_requests`, `guild_missions`, `guild_mission_contributions`, `guild_audit_log` (6 tables) | HIGH | Canonical has `emblem_id`, `member_count`, `level`, `total_xp`, constraints, triggers NOT in docs copy. `guild_audit_log` does not exist in canonical DDL at all. |
| `docs/10-requirements/epics/EPIC-GAM-F3-SOCIAL-GAMIFICATION/tasks/_archived/TASK-DB-GAM-003-005-tablas-amigos.md` | `social_features.friendships`, `social_features.friend_requests` (2 tables) | HIGH | Canonical `friendships` uses `gamilit.now_mexico()` and has CHECK constraint on status; docs copy uses simpler REFERENCES syntax. Archived task file that was never removed. |
| `docs/10-requirements/epics/EPIC-GAM-F3-SOCIAL-GAMIFICATION/requirements/RF-SOC-001-sistema-amigos.md` | `social_features.friendships`, `social_features.friend_requests` (2 tables) | HIGH | Same divergence as above from canonical. `auth.users` reference (should be `auth_management.profiles`). |
| `docs/10-requirements/epics/EPIC-GAM-F1-GAMIFICATION/specifications/ET-GAM-002-comodines.md` | `gamification_system.comodines_inventory`, `comodin_usage_log`, `comodin_usage_tracking` (3 tables) | HIGH | Canonical `comodines_inventory` uses flat column structure per comodin type (no `comodin_type` ENUM column); docs version uses different schema. References `auth.users` not `auth_management.profiles`. |
| `docs/10-requirements/epics/EPIC-GAM-F1-GAMIFICATION/requirements/RF-GAM-002-comodines.md` | `gamification_system.comodin_usage_tracking` | HIGH | Same issue as ET-GAM-002; partial duplicate. |
| `docs/10-requirements/epics/EPIC-GAM-F1-GAMIFICATION/specifications/ET-GAM-001-achievements.md` | `gamification_system.achievements`, `gamification_system.user_achievements` (2 tables) | HIGH | Canonical has many additional columns (`rarity`, `is_secret`, `is_repeatable`, `order_index`, `points_value`, `unlock_message`, `tips[]`, `metadata`). Docs copy is significantly simplified/outdated. |
| `docs/10-requirements/epics/EPIC-GAM-F1-GAMIFICATION/requirements/RF-GAM-001-achievements.md` | `gamification_system.achievements` (INSERT INTO references) | MEDIUM | Uses INSERT INTO for sample data referencing simplified schema. |
| `docs/10-requirements/epics/EPIC-GAM-F1-GAMIFICATION/specifications/ET-GAM-003-rangos-maya.md` | `gamification_system.rank_history` (1 table) | HIGH | References `auth.users` (should be `auth_management.profiles`). Multiple CREATE OR REPLACE FUNCTION and CREATE TRIGGER copies. |
| `docs/10-requirements/epics/EPIC-GAM-F1-GAMIFICATION/requirements/RF-GAM-003-rangos-maya.md` | `gamification_system.rank_history` (1 table) | HIGH | Same divergence; `rank_history` canonical table is `05-rank_history.sql` but table does not exist in current canonical listing (only `02-user_ranks.sql` and `13-maya_ranks.sql` exist — table was possibly renamed/removed). |
| `docs/10-requirements/epics/EPIC-GAM-F1-EXERCISES/specifications/ET-EDU-002-niveles-dificultad.md` | `educational_content.difficulty_criteria`, `progress_tracking.user_difficulty_progress`, `progress_tracking.user_current_level`, `educational_content.placement_tests`, `progress_tracking.placement_test_results` (5 tables) | HIGH | References canonical DDL files inline but includes full schema definitions with CREATE TYPE. All 5 tables exist in `apps/database/ddl/`. |
| `docs/10-requirements/epics/EPIC-GAM-F1-EXERCISES/specifications/ET-EDU-001-mecanicas-ejercicios.md` | `educational_content.exercise_mechanic_mapping`, `educational_content.exercises`, `educational_content.exercise_validation_config` (3 tables) | HIGH | Docs copy was recently updated (same session 2026-02-27) but still holds full DDL. Schema matches closely but column-level drift risk is high. |
| `docs/10-requirements/epics/EPIC-GAM-F1-EXERCISES/specifications/ET-EDU-004-validadores-ejercicios.md` | `educational_content.exercise_validation_config`, `educational_content.exercise_validation_audit` (2 tables) | HIGH | Duplicates across two spec files (ET-EDU-001 and ET-EDU-004 both define `exercise_validation_config`). |
| `docs/10-requirements/epics/EPIC-GAM-F1-EXERCISES/specifications/ET-EDU-003-taxonomia-bloom.md` | `progress_tracking.cognitive_performance` (1 table) | MEDIUM | References canonical file path explicitly. Relatively simple table. |
| `docs/10-requirements/epics/EPIC-GAM-F1-EXERCISES/requirements/RF-EDU-003-taxonomia-bloom.md` | `progress_tracking.cognitive_performance` (1 table) | MEDIUM | Same table duplicated in requirements AND specifications file. |
| `docs/10-requirements/epics/EPIC-GAM-F1-AUTH/specifications/ET-AUTH-001-rbac.md` | `auth_management.profiles` (1 table, partial) | HIGH | Core auth table duplicated; `profiles` has changed significantly (added columns post-migration). |
| `docs/10-requirements/epics/EPIC-GAM-F1-AUTH/specifications/ET-AUTH-002-estados-cuenta.md` | `auth_management.profiles` (1 table, partial) + 6 CREATE OR REPLACE FUNCTION | HIGH | `profiles` duplicated again (3rd copy). Functions may have diverged from canonical triggers. |
| `docs/10-requirements/epics/EPIC-GAM-F1-AUTH/specifications/ET-AUTH-003-oauth.md` | `auth_management.auth_providers`, `auth_management.linked_providers` (2 tables) | MEDIUM | Stable tables but references `auth_management.profiles(user_id)` — canonical uses `(id)`. Slight schema divergence. |
| `docs/10-requirements/epics/EPIC-GAM-F1-AUTH/requirements/RF-AUTH-003-oauth.md` | `auth_management.linked_providers` (1 table) | MEDIUM | Same table duplicated in requirements. |
| `docs/10-requirements/epics/EPIC-GAM-F1-ADMIN/specifications/ET-ADM-001-gestion-aulas.md` | `social_features.classrooms`, `social_features.classroom_settings` (2 tables) | HIGH | Canonical `classrooms` has 30+ columns including `co_teachers`, `settings` JSONB, `schedule` JSONB, `capacity`. Docs version is stripped-down. |
| `docs/10-requirements/epics/EPIC-GAM-F1-ADMIN/specifications/ET-ADM-002-gestion-estudiantes.md` | `social_features.classroom_students`, `social_features.groups`, `social_features.group_students` (3 tables) | HIGH | `classroom_students` not found in canonical listings — may have been replaced by `classroom_members`. `groups`/`group_students` not found in `apps/database/ddl/schemas/social_features/tables/`. Possibly renamed to `teams`/`team_members`. |
| `docs/10-requirements/epics/EPIC-GAM-F1-ADMIN/specifications/ET-ADM-004-asignacion-modulos.md` | `educational_content.modules`, `social_features.classroom_modules` (2 tables) | HIGH | `classroom_modules` not in canonical `social_features/tables/` listing (file does not exist there). Orphaned DDL. |
| `docs/10-requirements/epics/EPIC-GAM-F1-ADMIN/requirements/RF-ADM-004-asignacion-modulos.md` | `educational_content.modules`, `social_features.classroom_modules` (2 tables) | HIGH | Same orphaned `classroom_modules` DDL duplicated in requirements. |
| `docs/10-requirements/epics/EPIC-GAM-F3-TEACHER-PORTAL/requirements/RF-TEACH-002-assignment-system.md` | `educational_content.assignments`, `assignment_exercises`, `assignment_classrooms`, `assignment_students`, `assignment_submissions`, `educational_content.teacher_notes` (6 tables) | HIGH | `assignments` canonical has `RESTRICT` on teacher FK; docs uses `CASCADE`. `teacher_notes` in docs uses `public` schema implicitly; canonical is in `educational_content.teacher_notes` (table `25-teacher_content.sql`). |
| `docs/10-requirements/epics/EPIC-GAM-F1-GAMIFICATION/specifications/ET-GAM-011-guild-missions.md` | `social_features.guild_missions`, `social_features.guild_contributions` (2 tables) | HIGH | Schema divergence: uses `social_features.teams(id)` FK instead of `social_features.guilds(id)`. `guild_contributions` not in canonical (canonical has `guild_mission_contributions` pattern). |
| `docs/10-requirements/epics/EPIC-GAM-F1-GAMIFICATION/specifications/ET-GAM-010-multipliers.md` | `gamification_system.maya_ranks`, `gamification_system.active_boosts` (2 tables) | HIGH | `maya_ranks` canonical is `13-maya_ranks.sql`; `active_boosts` is `11-active_boosts.sql`. Docs use `auth_management.profiles(id)` (correct). Need column-level comparison. |
| `docs/10-requirements/epics/EPIC-GAM-F1-GAMIFICATION/specifications/ET-GAM-006-narrative.md` | `gamification_system.story_progress`, `gamification_system.unlocked_lore` (2 tables) | MEDIUM | These tables reference `auth_management.profiles(id)`. Verify if they exist in canonical. Not found in `apps/database/ddl/schemas/gamification_system/tables/` listing. Likely unimplemented feature tables. |
| `docs/10-requirements/epics/EPIC-GAM-F1-GAMIFICATION/specifications/EVOLUCION-SISTEMA-RECOMPENSAS.md` | `gamilit.user_stats`, `progress_tracking.exercise_submissions`, `gamilit.exercise_attempts` (3 tables) | HIGH | Uses old `gamilit` schema for `user_stats` and `exercise_attempts` (canonical is `gamification_system.user_stats` and `progress_tracking.exercise_attempts`). Stale schema names. |
| `docs/10-requirements/epics/EPIC-GAM-F3-PROFILES/user-stories/US-PERF-004/US-PERF-004-interacciones-sociales.md` | `friendships`, `direct_messages`, `user_blocks`, `reports` (4 tables, schema-unqualified) | HIGH | No schema qualification. `friendships` exists in `social_features`; `direct_messages` references a conversation model not in canonical DDL; `user_blocks` appears as `social_features.user_blocks` (26-user_blocks.sql); `reports` appears as `social_features.user_reports` (28-user_reports.sql). Significant divergence. |
| `docs/10-requirements/epics/EPIC-GAM-F3-PEER-CHALLENGES/EPIC.md` | `social_features.peer_challenges`, `social_features.challenge_attempts` (2 tables) | HIGH | `peer_challenges` is `11-peer_challenges.sql` canonical; `challenge_attempts` does not exist — canonical has `challenge_participants` (12) and `challenge_results` (13). Column structure likely diverged. |
| `docs/10-requirements/epics/EPIC-GAM-F3-PEER-CHALLENGES/specifications/ET-PEER-003-betting-system.md` | `social_features.challenge_bets` (1 table) | MEDIUM | Table not found in canonical. Feature may not be implemented yet. |
| `docs/10-requirements/epics/EPIC-GAM-F3-CONTENT/user-stories/US-CONT-004/US-CONT-004-versionamiento.md` | `content_versions`, `audit_trail` (2 tables, schema-unqualified) | HIGH | No schema qualification. `content_versions` not in canonical listing. Orphaned design DDL. |
| `docs/10-requirements/epics/EPIC-GAM-F3-PARENT-NOTIFICATIONS/EPIC.md` | `auth_management.parent_accounts`, `notifications.parent_notifications` (2 tables) | HIGH | Uses `auth_management.users` FK (canonical uses `auth_management.profiles`). Schema naming: `notifications.parent_notifications` vs canonical `auth_management.parent_notifications` (14-parent_accounts.sql, 16-parent_notifications.sql). |
| `docs/10-requirements/epics/EPIC-GAM-F1-ANALYTICS/specifications/ET-ANA-006-dashboard-progreso.md` | `classroom` (public schema), `progress_tracking.student_progress`, `progress_tracking.activity_logs` (3 tables) | HIGH | Uses old `public` schema for `classroom`; canonical is `social_features.classrooms`. `student_progress` and `activity_logs` not in canonical `progress_tracking` listing with these names. Stale design. |
| `docs/10-requirements/epics/EPIC-GAM-F1-ANALYTICS/specifications/ET-ANA-002-api-metricas.md` | `analytics.activity_logs` (1 table) | HIGH | References `analytics` schema which does not exist in canonical 18 schemas. Orphaned. |

---

### NEEDS-REFERENCE (DDL should be replaced with a reference/link to canonical DDL)

These files include table DDL that is accurately citing the canonical file path but still embeds the full CREATE TABLE definition instead of referencing it.

| File | DDL Objects | Current Match? | Recommendation |
|------|-------------|---------------|----------------|
| `docs/10-requirements/epics/EPIC-GAM-F3-TEACHER-PORTAL/specifications/USER-ACTIVITY-TRACKING-DEPENDENCY.md` | `user_engagement_daily` (progress_tracking schema) | NO — table not in canonical listing | Replace with reference; add note that feature is pending DDL |
| `docs/10-requirements/epics/EPIC-GAM-F3-TEACHER-PORTAL/user-stories/US-PM-007/US-PM-007-alert-configuration.md` | `progress_tracking.teacher_alert_configurations` | PARTIAL — exists as `20-teacher_alert_configurations.sql` but column diff not confirmed | Replace with `@DDL` reference |
| `docs/10-requirements/epics/EPIC-GAM-F3-TEACHER-PORTAL/user-stories/US-PM-004b/US-PM-004b-teacher-notes.md` | `teacher_student_notes` (no schema, no UUID pattern) | NO — canonical is `educational_content.teacher_notes` in `25-teacher_content.sql` | Replace with canonical reference |
| `docs/10-requirements/epics/EPIC-GAM-F3-PARENT-NOTIFICATIONS/specifications/ET-PAR-002-alert-templates.md` | `auth_management.parent_alert_templates` | NO — not in canonical `auth_management` tables listing | Mark as pending DDL |
| `docs/10-requirements/epics/EPIC-GAM-F3-PARENT-NOTIFICATIONS/specifications/ET-PAR-003-notification-preferences.md` | `auth_management.parent_student_preferences` | NO — not in canonical listing | Mark as pending DDL |
| `docs/10-requirements/epics/EPIC-GAM-F3-PARENT-PORTAL/specifications/ET-PP-002-parent-messaging.md` | `communication.message_threads`, `communication.parent_teacher_messages` | NO — `communication` schema exists but these tables not confirmed in canonical listing | Mark as pending DDL |
| `docs/10-requirements/epics/EPIC-GAM-F3-NOTIFICATIONS/specifications/ET-NOT-002-email-notifications.md` | `communication.notification_templates` | PARTIAL — `notifications` schema has `notification_templates`; schema name mismatch | Correct schema ref and link to canonical |
| `docs/10-requirements/epics/EPIC-GAM-F3-NOTIFICATIONS/user-stories/US-NOT-001a/US-NOT-001a-websocket-infrastructure.md` | `notifications` table (no schema, simplified) | NO — canonical uses `notifications.notifications` with more columns | Replace with reference |
| `docs/10-requirements/epics/EPIC-GAM-F3-NOTIFICATIONS/user-stories/US-NOT-001c/US-NOT-001c-preferences-management.md` | `notification_preferences` (no schema) | NO — canonical `notifications.notification_preferences` schema differs | Replace with reference |
| `docs/10-requirements/epics/EPIC-GAM-F3-WHITE-LABEL/EPIC.md` | `system_configuration.tenant_branding` | NO — `system_configuration` schema not in confirmed 18 schemas | Mark as pending |
| `docs/10-requirements/epics/EPIC-GAM-F3-ADMIN-EXTENDED/user-stories/US-AE-005/US-AE-005-parametrizacion-gamificacion.md` | `system_configuration.system_settings` | PARTIAL — `settings_management.system_settings` exists but schema name differs | Correct schema reference |
| `docs/10-requirements/epics/EPIC-GAM-F3-REPORTS/user-stories/US-REP-004/US-REP-004-data-warehouse-etl.md` | `fact_mechanic_completions`, `dim_users`, `dim_modules`, `dim_date`, `dim_institutions`, `agg_daily_user_activity` (7 tables) | PARTIAL — canonical has `fact_exercise_completions` (not `fact_mechanic_completions`), `dim_student`/`dim_teacher` (not `dim_users`), `dim_module` (not `dim_modules`). Star schema structure broadly correct but names diverged. | Replace with references to `apps/database/ddl/schemas/data_warehouse/` |
| `docs/10-requirements/epics/EPIC-GAM-F1-ANALYTICS/specifications/ET-ANA-005-automated-reports.md` | `admin_dashboard.report_subscriptions` | NO — table not in canonical listing | Mark as pending DDL |
| `docs/20-architecture/gamificacion/DISENO-SISTEMA-EQUIPAMIENTO.md` | `gamification_system.user_equipped_items` | YES — matches `21-user_equipped_items.sql` closely (includes DROP TABLE + CREATE TABLE) | Replace with reference to `apps/database/ddl/schemas/gamification_system/tables/21-user_equipped_items.sql` |
| `docs/50-guides/integration/INTEGRACION-STUDENT-TEACHER.md` | `progress_tracking.exercise_attempts`, `progress_tracking.exercise_submissions` (2 tables) | PARTIAL — uses `auth_management.profiles` FK (correct) but column sets may differ from canonical | Replace with references; keep integration logic description |
| `docs/10-requirements/epics/EPIC-GAM-F1-GAMIFICATION/specifications/ET-GAM-004-tipos-compartidos-gamificacion.md` | 5 CREATE TYPE definitions (`transaction_type`, `maya_rank`, `comodin_type`, `achievement_category`, `achievement_rarity`) | PARTIAL — these ENUMs exist in canonical DDL (confirmed). Values appear current but need column-level verification against `apps/database/ddl/schemas/gamification_system/enums/` | Link to canonical enum files |
| `docs/10-requirements/epics/EPIC-GAM-F2-DB-MIGRATION/tasks/INDICES-PARTE-1.md` | ~20+ CREATE INDEX statements | PARTIAL — indices may have changed naming or been added/removed | Replace with reference to canonical DDL |
| `docs/10-requirements/epics/EPIC-GAM-F2-DB-MIGRATION/tasks/INDICES-PARTE-2.md` | ~20+ CREATE INDEX statements | PARTIAL — same issue | Replace with reference to canonical DDL |
| `docs/10-requirements/epics/EPIC-GAM-F1-AUTH/specifications/ET-INIT-001-trigger-inicializacion.md` | CREATE OR REPLACE FUNCTION (trigger body) | PARTIAL — trigger initialization logic; canonical is in `apps/database/ddl/schemas/gamilit/functions/04-initialize_user_stats.sql` which was modified recently (in git status M) | High staleness risk — link to canonical function file |
| `docs/10-requirements/epics/EPIC-GAM-F1-AUTH/requirements/RF-AUTH-002-estados-cuenta.md` | CREATE TRIGGER (profile state trigger) | NO direct match in canonical structure | Mark as design artifact |
| `docs/90-adr/ADR-008-sistema-dual-exercise-mechanics.md` | `educational_content.exercise_mechanic_mapping` (1 table) | YES — matches canonical `21-exercise_mechanic_mapping.sql` (recently updated per session memory) | Add reference note; keep as design rationale context |
| `docs/40-api/ADMIN-PORTAL-ENDPOINTS.md` | `admin_dashboard.metrics_history` | NO — `admin_dashboard` schema tables: not confirmed in canonical 18-schema listing | Mark as pending DDL |

---

### EXAMPLE (acceptable — generic DDL not tied to gamilit tables)

These files use DDL as illustrative examples in educational/standards context. Not gamilit-specific table definitions.

| File | Nature |
|------|--------|
| `docs/40-standards/ESTANDAR-DATABASE-PROFESIONAL.md` | 32 CREATE TABLE statements — generic normalization examples (1NF/2NF/3NF/BCNF, `orders`, `customers`, `suppliers` tables). Completely generic. Acceptable. |
| `docs/50-guides/backend/GUIA-EXPAND-CONTRACT-MIGRATIONS.md` | 3 CREATE TABLE — migration examples (`student_classrooms` intermediate table, generic `users` before/after). Acceptable as migration pattern illustration. |
| `docs/50-guides/deployment/GUIA-PIPELINE-MIGRACIONES.md` | 1 CREATE TABLE mention in a table cell ("ADD tabla nueva | CREATE TABLE ..."). Inline reference, not a DDL block. |
| `docs/50-guides/deployment/GUIA-ACTUALIZACION-PRODUCCION.md` | 1 occurrence: shell grep for `CREATE TABLE` count in backup validation script. Not DDL itself. |
| `docs/50-guides/troubleshooting/errores-comunes/database/ERR-DB-006-fk-cross-schema.md` | 2 CREATE TABLE — INCORRECT vs CORRECT pattern examples using generic `educational.student_progress`. Acceptable. |
| `docs/50-guides/troubleshooting/errores-comunes/database/ERR-DB-005-trigger-recursion.md` | 4 CREATE OR REPLACE FUNCTION — generic trigger recursion examples. Acceptable. |
| `docs/50-guides/troubleshooting/errores-comunes/database/ERR-DB-004-rls-policy-conflicto.md` | CREATE POLICY — generic RLS conflict example. Acceptable. |
| `docs/50-guides/troubleshooting/errores-comunes/database/ERR-DB-003-seeds-conflictos-uuid.md` | INSERT INTO — generic UUID seed conflict example. Acceptable. |
| `docs/50-guides/troubleshooting/errores-comunes/database/ERR-DB-001-uuid-format.md` | INSERT INTO — generic UUID format example. Acceptable. |
| `docs/50-guides/GUIA-REFERENCIAS-SIMCO.md` | 1 CREATE TABLE — single snippet showing `auth_management.profiles` in a SET search_path example. Illustrative, not full schema. |
| `docs/40-standards/ESTANDAR-SEGURIDAD.md` | CREATE POLICY — generic RLS patterns as security examples. Acceptable. |
| `docs/40-standards/ESTANDAR-PERFORMANCE.md` | CREATE INDEX — generic performance index examples. Acceptable. |
| `docs/30-ux-ui/flujos/system/FL-SYS-06-MULTI-TENANT-ISOLATION.md` | CREATE POLICY — generic RLS isolation patterns (tenant_isolation, user_isolation, admin_access). Pattern documentation, not gamilit-specific. |
| `docs/50-guides/backend/impl/DATABASE-INTEGRATION.md` | ALTER TABLE + CREATE POLICY — RLS setup example for `gamification_system.user_stats`. Specific table but used as integration example. Borderline EXAMPLE/NEEDS-REFERENCE. |
| `docs/90-adr/ADR-020-validacion-alternativas-ejercicio-completar-espacios.md` | 1 CREATE OR REPLACE FUNCTION — validation function for `completar_espacios`. ADR historical rationale. Acceptable. |
| `docs/60-portals/student/PORTAL-STUDENT-GUIDE.md` | CREATE INDEX (3 indices in `progress`, `gamification` schemas — old unqualified names). Performance section example. |
| `docs/60-portals/student/specs/dependencies/DEPENDENCY-MATRIX.md` | 1 CREATE OR REPLACE FUNCTION — `gamification.check_user_promotion()`. Old schema name (`gamification` vs `gamification_system`). Illustrative but stale schema name. |
| `docs/80-references/transversal/correcciones/ANALISIS-ERROR-404-PROGRESS-MODULES.md` | CREATE TRIGGER — `trg_initialize_module_progress`. Correction analysis artifact. |

---

### LEGITIMATE (schema-reference/ docs — no action needed)

The `docs/20-architecture/schema-reference/` directory (26 files) contains **zero CREATE TABLE statements**. All schema-reference files use prose table format (column name | type | description) rather than DDL SQL blocks. This is the correct pattern.

Files using DDL in a legitimate cross-referencing way (citing canonical path inline):
- `docs/10-requirements/epics/EPIC-GAM-F1-EXERCISES/specifications/ET-EDU-002-niveles-dificultad.md` — cites file paths explicitly (e.g., `-- Archivo: apps/database/ddl/...`) but still embeds full DDL (classified as DUPLICATE above due to staleness risk)

No files were found to be purely LEGITIMATE (DDL-free schema documentation is the current approach in schema-reference/).

---

## Key Risk Areas

### Risk Area 1: Schema Name Staleness (CRITICAL)
Multiple docs use old schema aliases:
- `auth.users` → should be `auth_management.profiles`
- `gamilit.user_stats` → should be `gamification_system.user_stats`
- `gamification.` prefix → should be `gamification_system.`
- `analytics.` schema → does not exist (18 canonical schemas do not include `analytics`)
- `public.classroom` → should be `social_features.classrooms`

Files affected: ET-ANA-006, EVOLUCION-SISTEMA-RECOMPENSAS, RF-SOC-001, RF-SOC-002, PERF-004, ET-GAM-002, ET-GAM-003

### Risk Area 2: Tables That Were Renamed or Restructured (HIGH)
| Doc Table Name | Canonical Status |
|---------------|-----------------|
| `social_features.classroom_students` | Replaced by `social_features.classroom_members` (04-classroom_members.sql) |
| `social_features.groups` | Renamed to `social_features.teams` (05-teams.sql) |
| `social_features.group_students` | Renamed to `social_features.team_members` (06-team_members.sql) |
| `social_features.guild_audit_log` | Does not exist in canonical |
| `social_features.guild_contributions` | Does not exist (canonical: `guild_mission_contributions` within `guild_missions` context) |
| `social_features.challenge_attempts` | Replaced by `challenge_participants` (12) + `challenge_results` (13) |
| `progress_tracking.rank_history` | Not in canonical listing (was `05-rank_history.sql` per docs citation but file not in gamification_system tables glob) |
| `fact_mechanic_completions` | Canonical is `fact_exercise_completions` |
| `dim_users` | Canonical is `dim_student` + `dim_teacher` |

### Risk Area 3: Cross-File Duplication (MEDIUM)
Same table DDL appears in multiple docs files:
- `auth_management.profiles` appears in: ET-AUTH-001, ET-AUTH-002, GUIA-REFERENCIAS-SIMCO (3 files)
- `gamification_system.rank_history` appears in: ET-GAM-003, RF-GAM-003 (2 files)
- `progress_tracking.cognitive_performance` appears in: ET-EDU-003, RF-EDU-003 (2 files)
- `educational_content.exercise_validation_config` appears in: ET-EDU-001, ET-EDU-004 (2 files)
- `social_features.friendships` + `friend_requests` appears in: RF-SOC-001, TASK-DB-GAM-003-005 (2 files)

### Risk Area 4: Unimplemented Feature DDL (LOW-MEDIUM)
DDL in docs for tables that do not exist in canonical:
- `gamification_system.story_progress`, `gamification_system.unlocked_lore` (ET-GAM-006 narrative feature — not in canonical)
- `social_features.challenge_bets` (ET-PEER-003 betting feature — not in canonical)
- `auth_management.parent_alert_templates` (ET-PAR-002)
- `auth_management.parent_student_preferences` (ET-PAR-003)
- `communication.message_threads`, `communication.parent_teacher_messages` (ET-PP-002)
- `admin_dashboard.report_subscriptions` (ET-ANA-005)
- `user_engagement_daily` (USER-ACTIVITY-TRACKING-DEPENDENCY)
- `content_versions`, `audit_trail` (US-CONT-004)

---

## Recommendations

### Priority 1 (Immediate — before next release)
1. **Fix schema name staleness** in the 7 files using `auth.users`, `gamilit.`, `gamification.` (wrong aliases).
2. **Update ET-ADM-002** to reflect rename of `groups`→`teams`, `group_students`→`team_members`, `classroom_students`→`classroom_members`.
3. **Update RF-TEACH-002** assignments DDL: fix FK from `CASCADE` to `RESTRICT`, fix `teacher_notes` schema.
4. **Archive or annotate EVOLUCION-SISTEMA-RECOMPENSAS** — uses `gamilit.user_stats` and `gamilit.exercise_attempts` (schema migrated).

### Priority 2 (Next sprint)
5. **Add "DDL at time of writing" annotation** to all specification files that embed full DDL: `ET-EDU-001`, `ET-EDU-002`, `ET-GAM-001`, `ET-GAM-002`, `ET-GAM-003`. Format: `> NOTE: DDL shown as of YYYY-MM-DD. Canonical source: apps/database/ddl/...`
6. **Replace full DDL in DISENO-SISTEMA-EQUIPAMIENTO** with a reference: `See: apps/database/ddl/schemas/gamification_system/tables/21-user_equipped_items.sql`
7. **Mark unimplemented feature DDL** with `> STATUS: PENDING DDL IMPLEMENTATION` header in ET-GAM-006, ET-PEER-003, ET-PAR-002, ET-PAR-003.

### Priority 3 (Documentation debt, lower urgency)
8. **Consolidate guild DDL** — RF-SOC-002 (6 tables) and ET-GAM-011 (guild_missions) both define guild schema with different column sets. Pick one authoritative doc and cross-reference.
9. **Data warehouse naming** in US-REP-004 — update `fact_mechanic_completions` → `fact_exercise_completions`, `dim_users` → `dim_student`/`dim_teacher`.
10. **INDICES-PARTE-1/2** — these migration task files in EPIC-GAM-F2-DB-MIGRATION could be archived after verifying indices are applied in canonical DDL.

---

## Statistics Reconciliation

| Category | Files | CREATE TABLE Count |
|----------|-------|-------------------|
| DUPLICATE | 35 files | ~95 CREATE TABLE |
| NEEDS-REFERENCE | 22 files | ~30 CREATE TABLE |
| EXAMPLE | 18 files | ~23 CREATE TABLE |
| LEGITIMATE | 0 files (schema-reference uses prose) | 0 CREATE TABLE |
| **TOTAL** | **75 unique files** | **148 CREATE TABLE** |

---

*Report generated: 2026-02-27*
*Methodology: Grep across docs/ for 8 SQL patterns; cross-checked against apps/database/ddl/ canonical DDL; staleness assessed by comparing doc DDL to canonical file contents*
*Read-only audit — no files modified*
