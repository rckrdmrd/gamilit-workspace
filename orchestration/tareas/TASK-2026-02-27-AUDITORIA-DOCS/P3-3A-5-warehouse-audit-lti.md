# Audit Report: Data Model Alignment — data_warehouse, audit_logging, lti_integration

**Date:** 2026-02-27
**Task:** P3-3A-5 — Data Model Alignment Audit
**Scope:** Cross-reference DDL files against schema-reference docs for 3 schemas
**Mode:** Read-only (no files modified)
**Auditor:** Claude Sonnet 4.6

---

## Methodology

1. Read all DDL table files in `apps/database/ddl/schemas/{schema}/tables/`
2. Read doc files: `17-data-warehouse.md`, `16-audit.md`, `21-lti-integration.md`
3. For each table: compare column names, types, constraints, FKs, nullability
4. Note actual DDL column name vs doc-reported column name discrepancies

---

## Schema 1: data_warehouse

**DDL Path:** `apps/database/ddl/schemas/data_warehouse/tables/`
**Doc Path:** `docs/20-architecture/schema-reference/17-data-warehouse.md`
**DDL Tables found:** 16 (dim_achievements, dim_dates, dim_event_types, dim_exercises, dim_modules, dim_students, dim_teachers, dim_times, etl_extraction_logs, etl_load_logs, fact_daily_progress, fact_exercise_completions, fact_gamification_events, fact_teacher_metrics, ml_model_weights, ml_prediction_logs)
**Doc says:** 16 tables
**Result:** COUNT MATCH

---

### data_warehouse.dim_achievements

- **DDL:** `apps/database/ddl/schemas/data_warehouse/tables/dim_achievement.sql`
- **Doc:** `docs/20-architecture/schema-reference/17-data-warehouse.md:297`
- **Status:** MATCH
- **Columns DDL:** 25 | **Doc:** 25 | **Match:** 25

**Notes:** Full alignment. DDL table name is `dim_achievements` (plural), file name is `dim_achievement.sql` (singular) — naming inconsistency in filename only, not a data model gap.

---

### data_warehouse.dim_dates

- **DDL:** `apps/database/ddl/schemas/data_warehouse/tables/dim_date.sql`
- **Doc:** `docs/20-architecture/schema-reference/17-data-warehouse.md:21`
- **Status:** MATCH
- **Columns DDL:** 24 | **Doc:** 24 | **Match:** 24

**Notes:** Full alignment. Doc correctly documents all columns including educational calendar (school_year, semester, bimester, trimester, is_school_day, is_vacation, vacation_period) and fiscal calendar (fiscal_year, fiscal_quarter, fiscal_month). File named `dim_date.sql` (singular) while table is `dim_dates` (plural) — filename inconsistency only.

---

### data_warehouse.dim_event_types

- **DDL:** `apps/database/ddl/schemas/data_warehouse/tables/dim_event_type.sql`
- **Doc:** `docs/20-architecture/schema-reference/17-data-warehouse.md:341`
- **Status:** MATCH
- **Columns DDL:** 18 | **Doc:** 18 | **Match:** 18

**Notes:** Full alignment. Seed data (22 pre-loaded event type rows) correctly noted in doc. File named `dim_event_type.sql` (singular) while table is `dim_event_types` (plural) — filename inconsistency only.

---

### data_warehouse.dim_exercises

- **DDL:** `apps/database/ddl/schemas/data_warehouse/tables/dim_exercise.sql`
- **Doc:** `docs/20-architecture/schema-reference/17-data-warehouse.md:184`
- **Status:** MATCH
- **Columns DDL:** 36 | **Doc:** 36 | **Match:** 36

**Notes:** Full alignment. All pedagogical content columns (objective, how_to_solve, recommended_strategy, bloom_taxonomy_level, cognitive_level), comodines columns, and ETL audit columns present and documented. File named `dim_exercise.sql` (singular) while table is `dim_exercises` (plural) — filename inconsistency only.

**Minor doc note:** The DDL COMMENT says "27 mechanic types" (`COMMENT ON COLUMN data_warehouse.dim_exercises.exercise_type IS '27 mechanic types...'`). Per MEMORY.md, the actual DDL ENUM has 33 values, and "27 mecanicas" is a semantic convention. This DDL comment is a minor stale reference that was already flagged in a prior session — not a new finding.

---

### data_warehouse.dim_modules

- **DDL:** `apps/database/ddl/schemas/data_warehouse/tables/dim_module.sql`
- **Doc:** `docs/20-architecture/schema-reference/17-data-warehouse.md:243`
- **Status:** MATCH
- **Columns DDL:** 33 | **Doc:** 33 | **Match:** 33

**Notes:** Full alignment. All columns including learning objectives arrays, competencies, skills_developed, maya rank attributes, media URLs, and ETL columns are documented correctly.

---

### data_warehouse.dim_students

- **DDL:** `apps/database/ddl/schemas/data_warehouse/tables/dim_student.sql`
- **Doc:** `docs/20-architecture/schema-reference/17-data-warehouse.md:98`
- **Status:** MATCH
- **Columns DDL:** 24 | **Doc:** 24 | **Match:** 24

**Notes:** Full alignment. SCD Type 2 columns (effective_date, expiration_date, is_current, version_number) all documented. Query patterns for current vs point-in-time lookups documented in doc. File named `dim_student.sql` (singular).

---

### data_warehouse.dim_teachers

- **DDL:** `apps/database/ddl/schemas/data_warehouse/tables/dim_teacher.sql`
- **Doc:** `docs/20-architecture/schema-reference/17-data-warehouse.md:142`
- **Status:** MATCH
- **Columns DDL:** 23 | **Doc:** 23 | **Match:** 23

**Notes:** Full alignment. Arrays (subjects_taught, grade_levels_taught, specializations), GIN indexes, and all metric columns correctly documented.

---

### data_warehouse.dim_times

- **DDL:** `apps/database/ddl/schemas/data_warehouse/tables/dim_time.sql`
- **Doc:** `docs/20-architecture/schema-reference/17-data-warehouse.md:68`
- **Status:** MATCH
- **Columns DDL:** 14 | **Doc:** 14 | **Match:** 14

**Notes:** Full alignment. Time bucket columns, educational time periods, and all check constraints correctly documented.

---

### data_warehouse.etl_extraction_logs

- **DDL:** `apps/database/ddl/schemas/data_warehouse/tables/etl_extraction_log.sql`
- **Doc:** `docs/20-architecture/schema-reference/17-data-warehouse.md:678`
- **Status:** MATCH
- **Columns DDL:** 10 | **Doc:** 10 | **Match:** 10

**Notes:** Full alignment. CDC marker column (last_extracted_timestamp), status enum values, all index names correctly documented. Trigger `trg_etl_extraction_logs_updated_at` noted in doc. File named `etl_extraction_log.sql` (singular) while table is `etl_extraction_logs` (plural).

---

### data_warehouse.etl_load_logs

- **DDL:** `apps/database/ddl/schemas/data_warehouse/tables/etl_load_log.sql`
- **Doc:** `docs/20-architecture/schema-reference/17-data-warehouse.md:705`
- **Status:** MATCH
- **Columns DDL:** 13 | **Doc:** 13 | **Match:** 13

**Notes:** Full alignment. Custom ENUM type (`data_warehouse.etl_load_status`) documented. All row count metrics (rows_inserted, rows_updated, rows_rejected) and operational columns (batch_size, load_mode, configuration) documented correctly. File named `etl_load_log.sql` (singular).

---

### data_warehouse.fact_daily_progress

- **DDL:** `apps/database/ddl/schemas/data_warehouse/tables/fact_daily_progress.sql`
- **Doc:** `docs/20-architecture/schema-reference/17-data-warehouse.md:436`
- **Status:** MATCH
- **Columns DDL:** 32 | **Doc:** 32 | **Match:** 32

**Notes:** Full alignment. All measure groups (exercise metrics, score metrics, time metrics, gamification, progress, streak/engagement, cumulative running totals) and dimension FK columns correctly documented.

---

### data_warehouse.fact_exercise_completions

- **DDL:** `apps/database/ddl/schemas/data_warehouse/tables/fact_exercise_completions.sql`
- **Doc:** `docs/20-architecture/schema-reference/17-data-warehouse.md:380`
- **Status:** MATCH
- **Columns DDL:** 33 | **Doc:** 33 | **Match:** 33

**Notes:** Full alignment. All 6 dimension FKs (date, time, student, exercise, module, teacher), degenerate dimensions (classroom_id, assignment_id), and all measure groups documented. All 14 indexes listed correctly.

---

### data_warehouse.fact_gamification_events

- **DDL:** `apps/database/ddl/schemas/data_warehouse/tables/fact_gamification_events.sql`
- **Doc:** `docs/20-architecture/schema-reference/17-data-warehouse.md:490`
- **Status:** MATCH
- **Columns DDL:** 31 | **Doc:** 31 | **Match:** 31

**Notes:** Full alignment. Optional FKs (achievement_key, exercise_key, module_key), rank change columns (rank_from, rank_to), currency delta columns (xp_change, ml_coins_change, points_change), and context snapshot columns (current_xp, current_ml_coins, current_level) all documented correctly.

---

### data_warehouse.fact_teacher_metrics

- **DDL:** `apps/database/ddl/schemas/data_warehouse/tables/fact_teacher_metrics.sql`
- **Doc:** `docs/20-architecture/schema-reference/17-data-warehouse.md:539`
- **Status:** MATCH
- **Columns DDL:** 38 | **Doc:** 38 | **Match:** 38

**Notes:** Full alignment. All measure groups (student metrics, assignment metrics, submission metrics, class performance, completion rates, engagement, gamification, at-risk indicators) and all 13 indexes correctly documented.

---

### data_warehouse.ml_model_weights

- **DDL:** `apps/database/ddl/schemas/data_warehouse/tables/ml_model_weights.sql`
- **Doc:** `docs/20-architecture/schema-reference/17-data-warehouse.md:603`
- **Status:** MATCH
- **Columns DDL:** 15 | **Doc:** 15 | **Match:** 15

**Notes:** Full alignment. Seed data (30 rows across 4 models: dropout_risk, performance_predictor, difficulty_recommender, engagement_predictor) documented. Helper functions `get_active_model_weights()` and `set_active_model_version()` documented in doc.

---

### data_warehouse.ml_prediction_logs

- **DDL:** `apps/database/ddl/schemas/data_warehouse/tables/ml_prediction_logs.sql`
- **Doc:** `docs/20-architecture/schema-reference/17-data-warehouse.md:639`
- **Status:** MATCH
- **Columns DDL:** 15 | **Doc:** 15 | **Match:** 15

**Notes:** Full alignment. RLS policies (admin + own), helper functions (`log_ml_prediction`, `validate_prediction`), and analytic views (`v_ml_model_performance`, `v_ml_at_risk_students`) all documented correctly. This is the only data_warehouse table with RLS, as correctly noted in doc.

---

## Schema 2: audit_logging

**DDL Path:** `apps/database/ddl/schemas/audit_logging/tables/`
**Doc Path:** `docs/20-architecture/schema-reference/16-audit.md`
**DDL Tables found:** 7 (`01-audit_logs.sql`, `02-performance_metrics.sql`, `03-system_alerts.sql`, `04-system_logs.sql`, `05-user_activity_logs.sql`, `06-activity_log.sql`, `08-pending_user_initialization.sql`)
**Note:** File `07-` is absent (no table 07). Numbering skips from 06 to 08 — likely intentional gap or deprecated table.
**Doc says:** "7 tablas" (matches)
**Result:** COUNT MATCH (7 DDL tables, 7 documented)

**Important structural note:** `16-audit.md` has a dual-section structure. The first section (`audit.audit_logs`, `audit.data_changes`, `audit.access_logs`) documents a *conceptual/legacy* schema named `audit` that **does not correspond to any DDL files**. The second section (starting line 67: "Tablas audit_logging (DDL fisica)") documents the real DDL tables. This dual-section structure is a pre-existing documentation debt: 3 legacy conceptual tables are documented as if they exist, but have no DDL counterpart.

---

### audit_logging.audit_logs

- **DDL:** `apps/database/ddl/schemas/audit_logging/tables/01-audit_logs.sql`
- **Doc:** `docs/20-architecture/schema-reference/16-audit.md:73`
- **Status:** MATCH
- **Columns DDL:** 25 | **Doc:** 25 | **Match:** 25

**Notes:** Full alignment in the DDL-real section of the doc. The doc "DDL fisica" section correctly captures all columns including: event_type, action, resource_type, resource_id, actor_id, actor_type (check: user/system/api/cron), actor_ip, actor_user_agent, target_id, target_type, session_id, description, old_values, new_values, changes, severity (check: debug/info/warning/error/critical), status (check: success/failure/partial), error_code, error_message, stack_trace, request_id, correlation_id, additional_data, tags, created_at.

**Legacy section discrepancy (pre-existing):** The first section of the doc (`audit.audit_logs` at line 9) describes a different schema entirely — using `user_id` (not `actor_id`), `audit_action` ENUM type, `entity_type/entity_id` (not `resource_type/resource_id`), missing many columns, and referencing `uuid_generate_v4()` instead of `gen_random_uuid()`. This legacy conceptual doc refers to a non-existent DDL table and is misleading. Flagged as: **LEGACY_SECTION_MISMATCH** (pre-existing, not new).

---

### audit_logging.performance_metrics

- **DDL:** `apps/database/ddl/schemas/audit_logging/tables/02-performance_metrics.sql`
- **Doc:** `docs/20-architecture/schema-reference/16-audit.md:114`
- **Status:** MATCH
- **Columns DDL:** 18 | **Doc:** 18 | **Match:** 18

**Notes:** Full alignment. All columns including metric_type check constraint (counter/gauge/histogram/timer), GIN index on dimensions JSONB, and both FK references (tenant + user) correctly documented.

---

### audit_logging.system_alerts

- **DDL:** `apps/database/ddl/schemas/audit_logging/tables/03-system_alerts.sql`
- **Doc:** `docs/20-architecture/schema-reference/16-audit.md:146`
- **Status:** MATCH
- **Columns DDL:** 26 | **Doc:** 26 | **Match:** 26

**Notes:** Full alignment. All check constraints (alert_type: 6 values, severity: 4 values, status: 4 values, escalation_level: 1-5), lifecycle columns (acknowledged_by/at, resolved_by/at), suppression columns (auto_resolve, suppress_similar), and metadata JSONB columns all documented correctly.

---

### audit_logging.system_logs

- **DDL:** `apps/database/ddl/schemas/audit_logging/tables/04-system_logs.sql`
- **Doc:** `docs/20-architecture/schema-reference/16-audit.md:187`
- **Status:** MATCH
- **Columns DDL:** 25 | **Doc:** 25 | **Match:** 25

**Notes:** Full alignment. All columns including system metrics (execution_time_ms, memory_usage_mb, cpu_usage_percent), source location columns (line_number, file_path, thread_id), and environment check constraint (development/staging/production) correctly documented.

---

### audit_logging.user_activity_logs

- **DDL:** `apps/database/ddl/schemas/audit_logging/tables/05-user_activity_logs.sql`
- **Doc:** `docs/20-architecture/schema-reference/16-audit.md:226`
- **Status:** MATCH
- **Columns DDL:** 29 | **Doc:** 29 | **Match:** 29

**Notes:** Full alignment. UI-tracking columns (element_id, element_type, element_text, coordinates POINT), device fingerprinting (device_type, browser_name, browser_version, screen_resolution), timing columns (load_time_ms, interaction_time_ms), and the "weak reference" pattern (module_id, exercise_id, classroom_id without FK constraints) all documented correctly.

---

### audit_logging.activity_logs

- **DDL:** `apps/database/ddl/schemas/audit_logging/tables/06-activity_log.sql`
- **Doc:** `docs/20-architecture/schema-reference/16-audit.md:267`
- **Status:** MATCH
- **Columns DDL:** 9 | **Doc:** 9 | **Match:** 9

**Notes:** Full alignment. Lighter admin-dashboard-specific log table. All columns (user_id, action_type, entity_type, entity_id, description, metadata, ip_address, user_agent, created_at, updated_at) documented. Backend usage references (admin-dashboard.service.ts: getRecentActivity, getActiveUsers24h, getAlerts) noted correctly in doc.

**Column count note:** DDL has 10 columns (id + 9 above = 10 total); doc table shows 10 rows. Both count correctly as 10.

---

### audit_logging.pending_user_initializations

- **DDL:** `apps/database/ddl/schemas/audit_logging/tables/08-pending_user_initialization.sql`
- **Doc:** `docs/20-architecture/schema-reference/16-audit.md:292`
- **Status:** MATCH
- **Columns DDL:** 18 | **Doc:** 18 | **Match:** 18

**Notes:** Full alignment. All retry-tracking columns (retry_count, max_retries, last_retry_at, next_retry_at), resolution tracking (resolved_at, resolved_by, resolution_notes), status check constraint (pending/retrying/resolved/failed/manual), helper function `audit_logging.resolve_pending_initialization()` all documented.

**File naming note:** File is `08-pending_user_initialization.sql` (singular) while table name is `pending_user_initializations` (plural) — filename inconsistency only.

---

### LEGACY SECTION IN DOC — MISSING FROM DDL (Pre-existing gap)

The doc `16-audit.md` lines 9–65 contains 3 tables described under a conceptual `audit` schema (note: NOT `audit_logging`):

| Legacy Doc Table | Status |
|------------------|--------|
| `audit.audit_logs` (line 9) | MISSING_FROM_DDL — conceptual only, no DDL file |
| `audit.data_changes` (line 31) | MISSING_FROM_DDL — conceptual only, no DDL file |
| `audit.access_logs` (line 49) | MISSING_FROM_DDL — conceptual only, no DDL file |

These describe a different data model from an early design phase. They should be either removed from the doc or clearly marked as deprecated/conceptual-only. This is a pre-existing gap, not introduced by recent work.

---

## Schema 3: lti_integration

**DDL Path:** `apps/database/ddl/schemas/lti_integration/tables/`
**Doc Path:** `docs/20-architecture/schema-reference/21-lti-integration.md`
**DDL Tables found:** 3 (`01-lti_consumers.sql`, `02-lti_sessions.sql`, `03-lti_grade_passback.sql`)
**Doc says:** "3 tablas"
**Result:** COUNT MATCH

---

### lti_integration.lti_consumers

- **DDL:** `apps/database/ddl/schemas/lti_integration/tables/01-lti_consumers.sql`
- **Doc:** `docs/20-architecture/schema-reference/21-lti-integration.md:11`
- **Status:** MATCH
- **Columns DDL:** 21 | **Doc:** 21 | **Match:** 21

**Notes:** Full alignment. LTI 1.3 OAuth/OIDC columns (public_keyset_url, access_token_url, authorization_url), capability flags (supports_deep_linking, supports_nrps, supports_ags), LTI 1.1 legacy columns (consumer_key, consumer_secret), and all audit columns correctly documented. Unique constraint `(platform_id, client_id, deployment_id)` and trigger `trg_lti_consumers_updated_at` documented.

---

### lti_integration.lti_sessions

- **DDL:** `apps/database/ddl/schemas/lti_integration/tables/02-lti_sessions.sql`
- **Doc:** `docs/20-architecture/schema-reference/21-lti-integration.md:48`
- **Status:** MATCH
- **Columns DDL:** 23 | **Doc:** 23 | **Match:** 23

**Notes:** Full alignment. All LTI session tracking columns (launch_id, message_type, context_id/label/title, resource_link_id/title/description, lms_user_id/email/name/roles, id_token_claims JSONB), session lifecycle columns (launched_at, last_activity_at, ended_at), and all 9 indexes (including GIN index on id_token_claims) correctly documented.

---

### lti_integration.lti_grade_passbacks

- **DDL:** `apps/database/ddl/schemas/lti_integration/tables/03-lti_grade_passback.sql`
- **Doc:** `docs/20-architecture/schema-reference/21-lti-integration.md:85`
- **Status:** MATCH
- **Columns DDL:** 22 | **Doc:** 22 | **Match:** 22

**Notes:** Full alignment. LTI AGS grade passback lifecycle columns documented. All LTI spec enumerations (activity_progress: 5 values, grading_progress: 6 values, passback_status: 5 values), retry tracking (attempt_count, max_retries, next_retry_at), audit trail timestamps (graded_at, first_sent_at, last_sent_at, success_at), and all 8 indexes (including GIN on metadata) correctly documented.

**File naming note:** DDL file is `03-lti_grade_passback.sql` (singular) while table is `lti_grade_passbacks` (plural) — filename inconsistency only.

---

## Summary Table

| Schema | Table | DDL Path | Doc Path:Line | Status | DDL Cols | Doc Cols | Gaps |
|--------|-------|----------|---------------|--------|----------|----------|------|
| data_warehouse | dim_achievements | `tables/dim_achievement.sql` | `17-data-warehouse.md:297` | MATCH | 25 | 25 | none |
| data_warehouse | dim_dates | `tables/dim_date.sql` | `17-data-warehouse.md:21` | MATCH | 24 | 24 | none |
| data_warehouse | dim_event_types | `tables/dim_event_type.sql` | `17-data-warehouse.md:341` | MATCH | 18 | 18 | none |
| data_warehouse | dim_exercises | `tables/dim_exercise.sql` | `17-data-warehouse.md:184` | MATCH | 36 | 36 | none |
| data_warehouse | dim_modules | `tables/dim_module.sql` | `17-data-warehouse.md:243` | MATCH | 33 | 33 | none |
| data_warehouse | dim_students | `tables/dim_student.sql` | `17-data-warehouse.md:98` | MATCH | 24 | 24 | none |
| data_warehouse | dim_teachers | `tables/dim_teacher.sql` | `17-data-warehouse.md:142` | MATCH | 23 | 23 | none |
| data_warehouse | dim_times | `tables/dim_time.sql` | `17-data-warehouse.md:68` | MATCH | 14 | 14 | none |
| data_warehouse | etl_extraction_logs | `tables/etl_extraction_log.sql` | `17-data-warehouse.md:678` | MATCH | 10 | 10 | none |
| data_warehouse | etl_load_logs | `tables/etl_load_log.sql` | `17-data-warehouse.md:705` | MATCH | 13 | 13 | none |
| data_warehouse | fact_daily_progress | `tables/fact_daily_progress.sql` | `17-data-warehouse.md:436` | MATCH | 32 | 32 | none |
| data_warehouse | fact_exercise_completions | `tables/fact_exercise_completions.sql` | `17-data-warehouse.md:380` | MATCH | 33 | 33 | none |
| data_warehouse | fact_gamification_events | `tables/fact_gamification_events.sql` | `17-data-warehouse.md:490` | MATCH | 31 | 31 | none |
| data_warehouse | fact_teacher_metrics | `tables/fact_teacher_metrics.sql` | `17-data-warehouse.md:539` | MATCH | 38 | 38 | none |
| data_warehouse | ml_model_weights | `tables/ml_model_weights.sql` | `17-data-warehouse.md:603` | MATCH | 15 | 15 | none |
| data_warehouse | ml_prediction_logs | `tables/ml_prediction_logs.sql` | `17-data-warehouse.md:639` | MATCH | 15 | 15 | none |
| audit_logging | audit_logs | `tables/01-audit_logs.sql` | `16-audit.md:73` | MATCH | 25 | 25 | none |
| audit_logging | performance_metrics | `tables/02-performance_metrics.sql` | `16-audit.md:114` | MATCH | 18 | 18 | none |
| audit_logging | system_alerts | `tables/03-system_alerts.sql` | `16-audit.md:146` | MATCH | 26 | 26 | none |
| audit_logging | system_logs | `tables/04-system_logs.sql` | `16-audit.md:187` | MATCH | 25 | 25 | none |
| audit_logging | user_activity_logs | `tables/05-user_activity_logs.sql` | `16-audit.md:226` | MATCH | 29 | 29 | none |
| audit_logging | activity_logs | `tables/06-activity_log.sql` | `16-audit.md:267` | MATCH | 10 | 10 | none |
| audit_logging | pending_user_initializations | `tables/08-pending_user_initialization.sql` | `16-audit.md:292` | MATCH | 18 | 18 | none |
| lti_integration | lti_consumers | `tables/01-lti_consumers.sql` | `21-lti-integration.md:11` | MATCH | 21 | 21 | none |
| lti_integration | lti_sessions | `tables/02-lti_sessions.sql` | `21-lti-integration.md:48` | MATCH | 23 | 23 | none |
| lti_integration | lti_grade_passbacks | `tables/03-lti_grade_passback.sql` | `21-lti-integration.md:85` | MATCH | 22 | 22 | none |

**Total tables audited:** 26
**MATCH:** 26
**PARTIAL:** 0
**MISSING_FROM_DOCS:** 0
**MISSING_FROM_DDL (conceptual legacy doc only):** 3 (pre-existing: `audit.audit_logs`, `audit.data_changes`, `audit.access_logs` in the first section of `16-audit.md`)

---

## Findings Summary

### Health Score: 100% (26/26 tables MATCH)

All 26 DDL tables across the three schemas are fully and accurately documented in the corresponding schema-reference docs. No column gaps, type mismatches, or missing constraint documentation were found in the DDL-to-Doc direction.

### Minor Issues (Non-Blocking)

| Issue | Severity | Location | Description |
|-------|----------|----------|-------------|
| Filename singularity pattern | INFO | Multiple DDL files | 7+ DDL files use singular filename (dim_achievement.sql, dim_date.sql, etc.) while table names are plural. No functional impact. |
| Stale DDL COMMENT | INFO | `dim_exercises.sql` line 143 | COMMENT says "27 mechanic types" — actual ENUM has 33 values. Known issue from prior audit session. |
| Legacy doc section | WARNING | `16-audit.md` lines 9–65 | 3 tables under conceptual `audit` schema (data_changes, access_logs, audit_logs variant) that have no DDL counterpart. Pre-existing documentation debt. Should be clearly marked as `[DEPRECATED — Conceptual Only]` or removed. |
| Missing table 07 in audit_logging | INFO | `audit_logging/tables/` | File numbering skips from 06 to 08 (no `07-*.sql` file). Likely a deprecated table that was removed. No functional gap. |

### Recommended Actions

1. **`16-audit.md` legacy section (WARNING):** Add a clear `> [DEPRECATED — Conceptual design only. No DDL counterpart. See DDL-real section below.]` banner to the first 3 table entries, OR remove them entirely. This is the only documentation quality issue found.

2. **DDL filename convention (INFO):** Consider renaming DDL files to plural form (e.g., `dim_achievement.sql` → `dim_achievements.sql`) to match table names. Low priority — no functional impact.

3. **`dim_exercises.sql` DDL comment (INFO):** Update the column comment from "27 mechanic types" to "33 mechanic types" for accuracy. Low priority.

---

## Appendix: Schema Coverage Statistics

### data_warehouse (16 tables)
- Dimension tables: 8 (dim_dates, dim_times, dim_students, dim_teachers, dim_exercises, dim_modules, dim_achievements, dim_event_types)
- Fact tables: 4 (fact_exercise_completions, fact_daily_progress, fact_gamification_events, fact_teacher_metrics)
- ML tables: 2 (ml_model_weights, ml_prediction_logs)
- ETL metadata tables: 2 (etl_extraction_logs, etl_load_logs)
- Star schema architecture: FULLY DOCUMENTED
- Views: 3 (v_student_engagement_metrics, v_student_feature_base, v_student_performance_metrics) — not covered in this audit (views excluded from scope)

### audit_logging (7 tables)
- Core audit: 1 (audit_logs)
- Performance monitoring: 2 (performance_metrics, system_alerts)
- Log storage: 2 (system_logs, user_activity_logs)
- Specialized: 2 (activity_logs for admin dashboard, pending_user_initializations for retry logic)
- All tables: FULLY DOCUMENTED in DDL-real section

### lti_integration (3 tables)
- Configuration: 1 (lti_consumers)
- Session tracking: 1 (lti_sessions)
- Grade passback: 1 (lti_grade_passbacks)
- All tables: FULLY DOCUMENTED
- Note: Expected ~5 tables per task brief; actual DDL has 3. No missing tables — the schema is intentionally small (Epic EXT-007 scope).

---

*Audit completed 2026-02-27 — Read-only, no files modified*
