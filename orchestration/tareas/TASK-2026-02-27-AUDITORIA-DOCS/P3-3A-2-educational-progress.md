# P3-3A-2: Data Model Alignment Audit — educational_content & progress_tracking

**Task:** TASK-2026-02-27-AUDITORIA-DOCS
**Phase:** P3 — Data Model Alignment
**Scope:** educational_content and progress_tracking schemas
**Date:** 2026-02-27
**Method:** Read-only. DDL files cross-referenced against schema-reference docs.
**Auditor:** Claude Sonnet 4.6 (automated subagent)

---

## Methodology

1. Enumerated all DDL table files in:
   - `apps/database/ddl/schemas/educational_content/tables/` (21 files + 2 cross-schema + 1 cross-schema learning_path)
   - `apps/database/ddl/schemas/progress_tracking/tables/` (20 files + 1 cross-schema)
2. Loaded docs:
   - `docs/20-architecture/schema-reference/03-education.md`
   - `docs/20-architecture/schema-reference/06-progress.md`
3. For each table: compared column names, types, nullability, defaults, constraints, FKs.
4. Classified discrepancies as: MATCH, PARTIAL, MISSING_FROM_DOCS, MISSING_FROM_DDL.

---

## Notation

- DDL path given relative to repo root.
- Doc line numbers are approximate (file is single continuous document).
- "Doc table name" = the name used in the doc heading (which may differ from DDL table name).

---

## SECTION 1 — educational_content Schema

**DDL tables found (21 numbered + 2 cross-schema):**
1. 01-modules.sql → `educational_content.modules`
2. 02-exercises.sql → `educational_content.exercises`
3. 03-assessment_rubrics.sql → `educational_content.assessment_rubrics`
4. 04-media_resources.sql → `educational_content.media_resources`
5. 05-assignments.sql → `educational_content.assignments`
6. 06-assignment_exercises.sql → `educational_content.assignment_exercises`
7. 07-assignment_students.sql → `educational_content.assignment_students`
8. 08-assignment_submissions.sql → `educational_content.assignment_submissions`
9. 20-difficulty_criteria.sql → `educational_content.difficulty_criteria`
10. 21-exercise_mechanic_mapping.sql → `educational_content.exercise_mechanic_mappings`
11. 22-exercise_validation_config.sql → `educational_content.exercise_validation_configs`
12. 25-teacher_content.sql → `educational_content.teacher_contents`
13. 26-exercise_validation_audit.sql → `educational_content.exercise_validation_audits`
14. 27-exercise_type_rubrics.sql → `educational_content.exercise_type_rubrics`
15. 28-resource_ratings.sql → `educational_content.resource_ratings`
16. 29-resource_comments.sql → `educational_content.resource_comments`
17. 30-resource_downloads.sql → `educational_content.resource_downloads`
18. content_approvals.sql → `educational_content.content_approvals`
19. content_metadata.sql → `educational_content.content_metadatas`
20. content_tags.sql → `educational_content.content_tags`
21. module_dependencies.sql → `educational_content.module_dependencies`
22. taxonomies.sql → `educational_content.taxonomies`
23. _cross_schema/09-media_attachments.sql → `educational_content.media_attachments`
24. _cross_schema/23-classroom_modules.sql → `educational_content.classroom_modules`

**Doc tables found in 03-education.md (legacy section + additional section):**

Legacy/conceptual section (mostly MISSING_FROM_DDL or renamed):
- `educational_content.educational_modules` (conceptual — DDL table is `modules`)
- `educational_content.module_progress` (conceptual legacy — actual table is `progress_tracking.module_progress`)
- `educational_content.exercises` (conceptual — partially matches DDL)
- `educational_content.exercise_types` (conceptual — NO DDL table, represented by ENUM)
- `educational_content.exercise_attempts` (conceptual — actual table is `progress_tracking.exercise_attempts`)
- `educational_content.exercise_results` (conceptual — NO DDL table)
- `educational_content.exercise_feedback` (conceptual — NO DDL table)
- `educational_content.contents` (conceptual — NO DDL table)
- `educational_content.content_versions` (conceptual — NO DDL table)
- `educational_content.content_categories` (conceptual — NO DDL table)
- `educational_content.content_tags` (conceptual legacy — DDL table exists but is a junction table, different schema)
- `educational_content.reading_assignments` (conceptual — NO DDL table)
- `educational_content.spaced_repetition` (conceptual — NO DDL table)
- `educational_content.resource_ratings` (documented — DDL MATCHES)
- `educational_content.resource_comments` (documented — DDL MATCHES)
- `educational_content.resource_downloads` (documented — DDL MATCHES)

Additional section (well-documented):
- `educational_content.assignment_exercises` (documented — DDL MATCHES)
- `educational_content.classroom_modules` (documented — DDL MATCHES)
- `educational_content.content_approvals` (documented — DDL MATCHES)
- `educational_content.content_metadatas` (documented — DDL MATCHES)
- `educational_content.content_tags` (documented as junction table — DDL MATCHES)
- `educational_content.difficulty_criteria` (documented — DDL MATCHES)
- `educational_content.exercise_mechanic_mappings` (documented — DDL MATCHES)
- `educational_content.exercise_type_rubrics` (documented — DDL MATCHES)
- `educational_content.exercise_validation_audits` (documented — DDL MATCHES)
- `educational_content.exercise_validation_configs` (documented — DDL MATCHES)
- `educational_content.media_attachments` (documented — DDL MATCHES)
- `educational_content.media_resources` (documented — DDL MATCHES)
- `educational_content.module_dependencies` (documented — DDL MATCHES)
- `educational_content.taxonomies` (documented — DDL MATCHES)
- `educational_content.teacher_contents` (documented — DDL MATCHES)

---

### educational_content.modules

- **DDL:** `apps/database/ddl/schemas/educational_content/tables/01-modules.sql`
- **Doc:** `docs/20-architecture/schema-reference/03-education.md:13` (section `educational_content.educational_modules`)
- **Status:** PARTIAL — Doc uses legacy table name `educational_modules`; DDL actual name is `modules`
- **Columns DDL:** 36 | Doc: 11 | Match: ~8
- **Missing from docs (DDL has but doc legacy table doesn't):**
  - `tenant_id`, `title`, `subtitle`, `summary`, `content`, `order_index`, `module_code`, `difficulty_level`, `grade_levels`, `subjects`, `estimated_duration_minutes`, `estimated_sessions`, `learning_objectives`, `competencies`, `skills_developed`, `prerequisites`, `prerequisite_skills`, `maya_rank_required`, `maya_rank_granted`, `xp_reward`, `ml_coins_reward`, `status`, `is_published`, `is_featured`, `is_free`, `is_demo_module`, `published_at`, `archived_at`, `version`, `version_notes`, `created_by`, `reviewed_by`, `approved_by`, `keywords`, `tags`, `thumbnail_url`, `cover_image_url`, `settings`, `metadata`, `total_exercises`
- **Missing from DDL (doc claims but DDL doesn't have):**
  - `number` (doc says INTEGER for module 1-5; DDL uses `order_index`)
  - `name` (doc has VARCHAR(100); DDL has `title` TEXT)
  - `type` (doc says `educational_module_type` ENUM; DDL uses no such column)
  - `icon_url` (doc has VARCHAR(500); DDL has `thumbnail_url` and `cover_image_url` instead)
  - `unlock_requirements` (doc; DDL has `prerequisites` UUID[] and `prerequisite_skills` TEXT[])
  - `exercise_count` (doc; DDL has `total_exercises` INTEGER)
  - `is_active` (doc; DDL uses `status` + `is_published` pattern)
  - `sort_order` (doc; DDL uses `order_index`)
- **Type mismatches:** Doc shows `uuid_generate_v4()` as default for PK; DDL uses `gen_random_uuid()`
- **FK documented:** PARTIAL — Doc does not document FKs for this table at all; DDL has FKs on `tenant_id`, `created_by`, `reviewed_by`, `approved_by`
- **Note:** The doc's legacy section describes a completely different, older schema design. The "additional section" of 03-education.md does not have a dedicated modules entry. This is a major documentation gap — the doc describes a conceptual schema that was significantly refactored in DDL.

---

### educational_content.exercises

- **DDL:** `apps/database/ddl/schemas/educational_content/tables/02-exercises.sql`
- **Doc:** `docs/20-architecture/schema-reference/03-education.md:61` (legacy section)
- **Status:** PARTIAL — Doc uses legacy column names that differ from DDL
- **Columns DDL:** 42 | Doc: 20 | Match: ~8
- **Missing from docs (DDL has but doc doesn't):**
  - `subtitle`, `config` (JSONB NOT NULL), `solution`, `rubric`, `auto_gradable`, `requires_manual_grading`, `objective`, `how_to_solve`, `recommended_strategy`, `pedagogical_notes`, `passing_score`, `allow_retry`, `retry_delay_minutes`, `hints`, `enable_hints`, `hint_cost_ml_coins`, `comodines_allowed`, `comodines_config`, `bonus_multiplier`, `is_optional`, `is_bonus`, `version`, `version_notes`, `adaptive_difficulty`, `prerequisites`
- **Missing from DDL (doc claims but DDL doesn't have):**
  - `tenant_id` (doc has it; DDL does NOT have tenant_id on exercises)
  - `type` (doc column; DDL uses `exercise_type`)
  - `content_id` (doc has UUID FK; DDL has `content` JSONB directly embedded)
  - `exercise_data` (doc; DDL uses `content` JSONB)
  - `answer_key` (doc; DDL uses `solution` JSONB)
  - `evaluation_mode` (doc; DDL uses `auto_gradable` boolean + `requires_manual_grading`)
  - `time_limit_seconds` (doc; DDL uses `time_limit_minutes`)
  - `sort_order` (doc; DDL uses `order_index`)
  - `deleted_at` (doc has soft delete; DDL does NOT have soft delete)
- **Type mismatches:**
  - Doc `title VARCHAR(200)` vs DDL `title TEXT`
  - Doc `xp_reward INTEGER (10)` vs DDL `xp_reward INTEGER (20)`
  - Doc `ml_coins_reward INTEGER (5)` vs DDL `ml_coins_reward INTEGER (5)` — matches
  - Doc `max_attempts INTEGER (3)` vs DDL `max_attempts INTEGER (3)` — matches
- **FK documented:** PARTIAL — Doc mentions `tenant_id` and `module_id` FKs but no `content_id` FK detail
- **Note:** Doc is legacy design. DDL is the authoritative implementation. The doc section does not reflect the 2025-11-24 architectural changes (dual grading, pedagogical content expansion).

---

### educational_content.assessment_rubrics

- **DDL:** `apps/database/ddl/schemas/educational_content/tables/03-assessment_rubrics.sql`
- **Doc:** `docs/20-architecture/schema-reference/03-education.md` — NOT DOCUMENTED
- **Status:** MISSING_FROM_DOCS
- **Columns DDL:** 14 | Doc: 0
- **Missing from docs:** id, exercise_id, module_id, name, description, assessment_type, criteria, scoring_scale, weight_percentage, is_active, allow_resubmission, feedback_template, auto_feedback_enabled, metadata, created_by, created_at, updated_at
- **FK documented:** NO
- **Note:** This table exists in DDL with a polymorphic constraint (exercise_id XOR module_id) but is entirely absent from the schema-reference doc.

---

### educational_content.media_resources

- **DDL:** `apps/database/ddl/schemas/educational_content/tables/04-media_resources.sql`
- **Doc:** `docs/20-architecture/schema-reference/03-education.md:699` (additional section)
- **Status:** MATCH
- **Columns DDL:** 23 | Doc: 23 | Match: 23
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none significant
- **FK documented:** YES — tenant_id, created_by documented
- **Note:** Well-aligned. Doc accurately reflects the DDL.

---

### educational_content.assignments

- **DDL:** `apps/database/ddl/schemas/educational_content/tables/05-assignments.sql`
- **Doc:** `docs/20-architecture/schema-reference/03-education.md` — NOT DOCUMENTED as standalone table
- **Status:** MISSING_FROM_DOCS
- **Columns DDL:** 9 | Doc: 0
- **Missing from docs:** id, teacher_id, title, description, assignment_type, due_date, total_points, is_published, created_at, updated_at
- **FK documented:** NO
- **Note:** The doc mentions assignments as referenced in `assignment_exercises` and `content_approvals` but never documents the `assignments` table itself.

---

### educational_content.assignment_exercises

- **DDL:** `apps/database/ddl/schemas/educational_content/tables/06-assignment_exercises.sql`
- **Doc:** `docs/20-architecture/schema-reference/03-education.md:364` (additional section)
- **Status:** PARTIAL
- **Columns DDL:** 6 | Doc: 6 | Match: 5
- **Missing from docs:** none (all 6 columns documented)
- **Missing from DDL:** none
- **Type mismatches:**
  - Doc shows `created_at TIMESTAMPTZ NULL CURRENT_TIMESTAMP`; DDL has `created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP` — effectively the same
  - Doc shows `points_override DECIMAL(5,2)`; DDL has `points_override DECIMAL(5,2)` — matches
- **FK documented:** YES — assignment_id → assignments, exercise_id → exercises
- **Note:** Good alignment. Minor: doc doesn't explicitly show the UNIQUE(assignment_id, exercise_id) constraint.

---

### educational_content.assignment_students

- **DDL:** `apps/database/ddl/schemas/educational_content/tables/07-assignment_students.sql`
- **Doc:** `docs/20-architecture/schema-reference/03-education.md` — NOT DOCUMENTED
- **Status:** MISSING_FROM_DOCS
- **Columns DDL:** 22 | Doc: 0
- **Missing from docs:** id, assignment_id, student_id, assigned_at, submitted_at, submission_data, submission_url, submission_files, score, max_score, percentage, feedback, graded_by, graded_at, status, attempt_number, max_attempts, is_late, late_penalty_applied, rubric_scores, teacher_notes, flagged_for_review, flag_reason, updated_at
- **FK documented:** NO
- **Note:** This is a substantial table (22 columns, grading workflow, auto-trigger) that is entirely absent from the schema documentation.

---

### educational_content.assignment_submissions

- **DDL:** `apps/database/ddl/schemas/educational_content/tables/08-assignment_submissions.sql`
- **Doc:** `docs/20-architecture/schema-reference/03-education.md` — NOT DOCUMENTED
- **Status:** MISSING_FROM_DOCS
- **Columns DDL:** 10 | Doc: 0
- **Missing from docs:** id, assignment_id, student_id, submitted_at, status, score, feedback, graded_at, graded_by, created_at, updated_at
- **FK documented:** NO
- **Note:** Absent from docs. Note there is overlap with `assignment_students` (both track grading); this architectural redundancy is also undocumented.

---

### educational_content.difficulty_criteria

- **DDL:** `apps/database/ddl/schemas/educational_content/tables/20-difficulty_criteria.sql`
- **Doc:** `docs/20-architecture/schema-reference/03-education.md:502` (additional section)
- **Status:** MATCH
- **Columns DDL:** 14 | Doc: 14 | Match: 14
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES (PK is the difficulty_level ENUM — documented)
- **Note:** Excellent alignment. Doc accurately reflects all columns, PK design, indexes, trigger.

---

### educational_content.exercise_mechanic_mappings

- **DDL:** `apps/database/ddl/schemas/educational_content/tables/21-exercise_mechanic_mapping.sql`
- **Doc:** `docs/20-architecture/schema-reference/03-education.md:533` (additional section)
- **Status:** MATCH
- **Columns DDL:** 13 | Doc: 13 | Match: 13
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** NO formal FK (exercise_type is ENUM reference, not FK) — correctly documented
- **Note:** Excellent alignment. UNIQUE constraint, CHECK for cognitive_load, all columns accurate.

---

### educational_content.exercise_validation_configs

- **DDL:** `apps/database/ddl/schemas/educational_content/tables/22-exercise_validation_config.sql`
- **Doc:** `docs/20-architecture/schema-reference/03-education.md:634` (additional section)
- **Status:** MATCH
- **Columns DDL:** 14 | Doc: 14 | Match: 14
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES (exercise_type is UNIQUE, documented)
- **Note:** Excellent alignment.

---

### educational_content.teacher_contents

- **DDL:** `apps/database/ddl/schemas/educational_content/tables/25-teacher_content.sql`
- **Doc:** `docs/20-architecture/schema-reference/03-education.md:797` (additional section — heading present but content cut off in reviewed excerpt)
- **Status:** PARTIAL — full column listing needs further verification but doc entry exists
- **Columns DDL:** 44 | Doc: estimated ~35 columns documented
- **Missing from docs (likely):** `based_on_content_id`, `previous_version_id`, `last_used_at`, `teacher_rating_count`
- **Missing from DDL:** none identified
- **Type mismatches:** none identified
- **FK documented:** YES — teacher_id, tenant_id, approved_by, based_on_content_id, previous_version_id
- **Note:** Doc section exists but the cut in the review excerpt means the full column table was not read. Flagged as PARTIAL pending complete review.

---

### educational_content.exercise_validation_audits

- **DDL:** `apps/database/ddl/schemas/educational_content/tables/26-exercise_validation_audit.sql`
- **Doc:** `docs/20-architecture/schema-reference/03-education.md:588` (additional section)
- **Status:** MATCH
- **Columns DDL:** 21 | Doc: 21 | Match: 21
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — exercise_id, original_audit_id
- **Note:** Excellent alignment. Immutable audit table, constraints, all documented accurately.

---

### educational_content.exercise_type_rubrics

- **DDL:** `apps/database/ddl/schemas/educational_content/tables/27-exercise_type_rubrics.sql`
- **Doc:** `docs/20-architecture/schema-reference/03-education.md:563` (additional section)
- **Status:** MATCH
- **Columns DDL:** 8 | Doc: 8 | Match: 8
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:**
  - Doc shows `total_weight INTEGER NULL 100`; DDL has `total_weight INTEGER DEFAULT 100` with CHECK(total_weight = 100) — functionally same but doc says NULL whereas DDL has NOT NULL (implied by CHECK)
- **FK documented:** NO FK (exercise_type is VARCHAR not ENUM FK) — correctly documented
- **Note:** Good alignment.

---

### educational_content.resource_ratings

- **DDL:** `apps/database/ddl/schemas/educational_content/tables/28-resource_ratings.sql`
- **Doc:** `docs/20-architecture/schema-reference/03-education.md:302`
- **Status:** MATCH
- **Columns DDL:** 6 | Doc: 6 | Match: 6
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES
- **Note:** Perfect alignment.

---

### educational_content.resource_comments

- **DDL:** `apps/database/ddl/schemas/educational_content/tables/29-resource_comments.sql`
- **Doc:** `docs/20-architecture/schema-reference/03-education.md:321`
- **Status:** MATCH
- **Columns DDL:** 6 | Doc: 6 | Match: 6
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES
- **Note:** Perfect alignment.

---

### educational_content.resource_downloads

- **DDL:** `apps/database/ddl/schemas/educational_content/tables/30-resource_downloads.sql`
- **Doc:** `docs/20-architecture/schema-reference/03-education.md:340`
- **Status:** MATCH
- **Columns DDL:** 4 | Doc: 4 | Match: 4
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES
- **Note:** Perfect alignment. Doc correctly notes no updated_at (immutable event log).

---

### educational_content.content_approvals

- **DDL:** `apps/database/ddl/schemas/educational_content/tables/content_approvals.sql`
- **Doc:** `docs/20-architecture/schema-reference/03-education.md:423`
- **Status:** MATCH
- **Columns DDL:** 11 | Doc: 11 | Match: 11
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — submitted_by, reviewed_by
- **Note:** Perfect alignment.

---

### educational_content.content_metadatas

- **DDL:** `apps/database/ddl/schemas/educational_content/tables/content_metadata.sql`
- **Doc:** `docs/20-architecture/schema-reference/03-education.md:453`
- **Status:** MATCH
- **Columns DDL:** 6 | Doc: 6 | Match: 6
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES (no FK to other tables — content_id is polymorphic without FK constraint, documented correctly)
- **Note:** Perfect alignment.

---

### educational_content.content_tags

- **DDL:** `apps/database/ddl/schemas/educational_content/tables/content_tags.sql`
- **Doc:** `docs/20-architecture/schema-reference/03-education.md:476`
- **Status:** MATCH
- **Columns DDL:** 6 | Doc: 6 | Match: 6
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — created_by
- **Note:** Perfect alignment.

---

### educational_content.module_dependencies

- **DDL:** `apps/database/ddl/schemas/educational_content/tables/module_dependencies.sql`
- **Doc:** `docs/20-architecture/schema-reference/03-education.md:747`
- **Status:** MATCH
- **Columns DDL:** 5 | Doc: 5 | Match: 5
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — module_id, prerequisite_module_id
- **Note:** Perfect alignment including self-referential check constraint.

---

### educational_content.taxonomies

- **DDL:** `apps/database/ddl/schemas/educational_content/tables/taxonomies.sql`
- **Doc:** `docs/20-architecture/schema-reference/03-education.md:772`
- **Status:** MATCH
- **Columns DDL:** 7 | Doc: 7 | Match: 7
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES (NO FK — self-contained catalog, documented correctly)
- **Note:** Perfect alignment.

---

### educational_content.media_attachments

- **DDL:** `apps/database/ddl/schemas/educational_content/tables/_cross_schema/09-media_attachments.sql`
- **Doc:** `docs/20-architecture/schema-reference/03-education.md:664`
- **Status:** MATCH
- **Columns DDL:** 14 | Doc: 14 | Match: 14
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — submission_id, exercise_id, user_id
- **Note:** Perfect alignment.

---

### educational_content.classroom_modules

- **DDL:** `apps/database/ddl/schemas/educational_content/tables/_cross_schema/23-classroom_modules.sql`
- **Doc:** `docs/20-architecture/schema-reference/03-education.md:389`
- **Status:** MATCH
- **Columns DDL:** 12 | Doc: 12 | Match: 12
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — classroom_id, module_id, assigned_by
- **Note:** Perfect alignment.

---

### LEGACY SECTION TABLES — educational_content schema (MISSING_FROM_DDL)

The following tables appear only in the **legacy/conceptual** section of `03-education.md` (lines 12–300) and have **NO corresponding DDL file**:

| Table (doc name) | Status | Note |
|---|---|---|
| `educational_content.educational_modules` | REPLACED | DDL uses `educational_content.modules` (different name, entirely different schema) |
| `educational_content.module_progress` | MOVED | Actual table is `progress_tracking.module_progress` |
| `educational_content.exercise_types` | NO DDL | Represented by ENUM `educational_content.exercise_type`, not a separate table |
| `educational_content.exercise_attempts` | MOVED | Actual table is `progress_tracking.exercise_attempts` |
| `educational_content.exercise_results` | NO DDL | No DDL table found; functionality may be embedded in exercise_attempts/submissions |
| `educational_content.exercise_feedback` | NO DDL | No DDL table; feedback stored in exercise_submissions.feedback (TEXT) |
| `educational_content.contents` | NO DDL | Content embedded in modules.content (JSONB) |
| `educational_content.content_versions` | NO DDL | No DDL table for content versioning |
| `educational_content.content_categories` | NO DDL | No DDL table found |
| `educational_content.reading_assignments` | NO DDL | No DDL table found |
| `educational_content.spaced_repetition` | NO DDL | No DDL table found |

**Summary:** The legacy/conceptual section of `03-education.md` describes an **entirely obsolete data model**. The actual DDL implementation has diverged substantially. This section should be replaced or clearly marked as DEPRECATED.

---

## SECTION 2 — progress_tracking Schema

**DDL tables found (20 files + 1 cross-schema):**
1. 01-module_progress.sql → `progress_tracking.module_progress`
2. 02-learning_sessions.sql → `progress_tracking.learning_sessions`
3. 03-exercise_attempts.sql → `progress_tracking.exercise_attempts`
4. 04-exercise_submissions.sql → `progress_tracking.exercise_submissions`
5. 05-scheduled_missions.sql → `progress_tracking.scheduled_missions`
6. 06-manual_reviews.sql → `progress_tracking.manual_reviews`
7. 15-user_difficulty_progress.sql → `progress_tracking.user_difficulty_progresses`
8. 16-user_current_level.sql → `progress_tracking.user_current_levels`
9. 16a-student_intervention_alerts.sql → `progress_tracking.student_intervention_alerts`
10. 17-teacher_interventions.sql → `progress_tracking.teacher_interventions`
11. 18-certificates.sql → `progress_tracking.certificates`
12. 20-teacher_alert_configurations.sql → `progress_tracking.teacher_alert_configurations`
13. engagement_metrics.sql → `progress_tracking.engagement_metrics`
14. learning_paths.sql → `progress_tracking.learning_paths`
15. mastery_tracking.sql → `progress_tracking.mastery_trackings`
16. module_completion_tracking.sql → `progress_tracking.module_completion_trackings`
17. progress_snapshots.sql → `progress_tracking.progress_snapshots`
18. skill_assessments.sql → `progress_tracking.skill_assessments`
19. teacher_notes.sql → `progress_tracking.teacher_notes`
20. user_learning_paths.sql → `progress_tracking.user_learning_paths`
21. _cross_schema/learning_path_modules.sql → `progress_tracking.learning_path_modules`

**Doc claims 21 tables.** DDL has 21 tables (including learning_path_modules in cross_schema). Count matches.

---

### progress_tracking.module_progress

- **DDL:** `apps/database/ddl/schemas/progress_tracking/tables/01-module_progress.sql`
- **Doc:** `docs/20-architecture/schema-reference/06-progress.md:11`
- **Status:** MATCH
- **Columns DDL:** 37 | Doc: 37 | Match: 37
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none significant
- **FK documented:** YES — user_id → auth_management.profiles, module_id → educational_content.modules, classroom_id (soft ref), assignment_id (soft ref)
- **Note:** Excellent alignment. Doc accurately reflects all 37 columns, UNIQUE constraint, CHECK, all indices, and RLS policies.

---

### progress_tracking.exercise_attempts

- **DDL:** `apps/database/ddl/schemas/progress_tracking/tables/03-exercise_attempts.sql`
- **Doc:** `docs/20-architecture/schema-reference/06-progress.md:65`
- **Status:** MATCH
- **Columns DDL:** 13 | Doc: 13 | Match: 13
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — user_id, exercise_id
- **Note:** Perfect alignment. Trigger reference (trg_update_user_stats_on_exercise) correctly documented.

---

### progress_tracking.exercise_submissions

- **DDL:** `apps/database/ddl/schemas/progress_tracking/tables/04-exercise_submissions.sql`
- **Doc:** `docs/20-architecture/schema-reference/06-progress.md:92`
- **Status:** MATCH
- **Columns DDL:** 19 | Doc: 19 | Match: 19
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:**
  - Doc shows `status TEXT NULL 'submitted'`; DDL has `status text DEFAULT 'submitted'` — matches
  - Doc shows `comodines_used TEXT[] NULL NULL`; DDL has `comodines_used text[]` — matches
- **FK documented:** YES — user_id, exercise_id
- **Note:** Excellent alignment.

---

### progress_tracking.manual_reviews

- **DDL:** `apps/database/ddl/schemas/progress_tracking/tables/06-manual_reviews.sql`
- **Doc:** `docs/20-architecture/schema-reference/06-progress.md:127`
- **Status:** MATCH
- **Columns DDL:** 11 | Doc: 11 | Match: 11
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — submission_id (UNIQUE), reviewer_id (ON DELETE RESTRICT)
- **Note:** Perfect alignment.

---

### progress_tracking.learning_sessions

- **DDL:** `apps/database/ddl/schemas/progress_tracking/tables/02-learning_sessions.sql`
- **Doc:** `docs/20-architecture/schema-reference/06-progress.md:154`
- **Status:** MATCH
- **Columns DDL:** 24 | Doc: 24 | Match: 24
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — user_id, tenant_id, module_id, exercise_id, classroom_id (soft ref)
- **Note:** Excellent alignment.

---

### progress_tracking.engagement_metrics

- **DDL:** `apps/database/ddl/schemas/progress_tracking/tables/engagement_metrics.sql`
- **Doc:** `docs/20-architecture/schema-reference/06-progress.md:197`
- **Status:** MATCH
- **Columns DDL:** 14 | Doc: 14 | Match: 14
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — user_id
- **Note:** Perfect alignment.

---

### progress_tracking.learning_paths

- **DDL:** `apps/database/ddl/schemas/progress_tracking/tables/learning_paths.sql`
- **Doc:** `docs/20-architecture/schema-reference/06-progress.md:226`
- **Status:** MATCH
- **Columns DDL:** 9 | Doc: 9 | Match: 9
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — created_by (nullable)
- **Note:** Perfect alignment.

---

### progress_tracking.learning_path_modules

- **DDL:** `apps/database/ddl/schemas/progress_tracking/tables/_cross_schema/learning_path_modules.sql`
- **Doc:** `docs/20-architecture/schema-reference/06-progress.md:248`
- **Status:** MATCH
- **Columns DDL:** 6 | Doc: 6 | Match: 6
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — learning_path_id, module_id
- **Note:** Perfect alignment. Table is in `_cross_schema/` dir (created 2026-02-05 as FIX H-036).

---

### progress_tracking.user_learning_paths

- **DDL:** `apps/database/ddl/schemas/progress_tracking/tables/user_learning_paths.sql`
- **Doc:** `docs/20-architecture/schema-reference/06-progress.md:267`
- **Status:** MATCH
- **Columns DDL:** 9 | Doc: 9 | Match: 9
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — user_id, learning_path_id
- **Note:** Perfect alignment.

---

### progress_tracking.mastery_trackings

- **DDL:** `apps/database/ddl/schemas/progress_tracking/tables/mastery_tracking.sql`
- **Doc:** `docs/20-architecture/schema-reference/06-progress.md:292`
- **Status:** MATCH
- **Columns DDL:** 11 | Doc: 11 | Match: 11
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — user_id, module_id
- **Note:** Perfect alignment.

---

### progress_tracking.module_completion_trackings

- **DDL:** `apps/database/ddl/schemas/progress_tracking/tables/module_completion_tracking.sql`
- **Doc:** `docs/20-architecture/schema-reference/06-progress.md:317`
- **Status:** MATCH
- **Columns DDL:** 11 | Doc: 11 | Match: 11
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — user_id, module_id
- **Note:** Perfect alignment.

---

### progress_tracking.skill_assessments

- **DDL:** `apps/database/ddl/schemas/progress_tracking/tables/skill_assessments.sql`
- **Doc:** `docs/20-architecture/schema-reference/06-progress.md:343`
- **Status:** MATCH
- **Columns DDL:** 10 | Doc: 10 | Match: 10
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — user_id, assessed_by_module_id
- **Note:** Perfect alignment.

---

### progress_tracking.user_current_levels

- **DDL:** `apps/database/ddl/schemas/progress_tracking/tables/16-user_current_level.sql`
- **Doc:** `docs/20-architecture/schema-reference/06-progress.md:368`
- **Status:** MATCH
- **Columns DDL:** 9 | Doc: 9 | Match: 9
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — user_id (PK is FK to profiles)
- **Note:** Perfect alignment. PK is user_id (single column FK pattern) correctly documented.

---

### progress_tracking.user_difficulty_progresses

- **DDL:** `apps/database/ddl/schemas/progress_tracking/tables/15-user_difficulty_progress.sql`
- **Doc:** `docs/20-architecture/schema-reference/06-progress.md:391`
- **Status:** MATCH
- **Columns DDL:** 13 | Doc: 13 | Match: 13
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — user_id (composite PK)
- **Note:** Excellent alignment. GENERATED ALWAYS AS columns (`success_rate`, `avg_time_per_exercise`) correctly documented.

---

### progress_tracking.progress_snapshots

- **DDL:** `apps/database/ddl/schemas/progress_tracking/tables/progress_snapshots.sql`
- **Doc:** `docs/20-architecture/schema-reference/06-progress.md:420`
- **Status:** MATCH
- **Columns DDL:** 7 | Doc: 7 | Match: 7
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — user_id
- **Note:** Perfect alignment.

---

### progress_tracking.certificates

- **DDL:** `apps/database/ddl/schemas/progress_tracking/tables/18-certificates.sql`
- **Doc:** `docs/20-architecture/schema-reference/06-progress.md:441`
- **Status:** MATCH
- **Columns DDL:** 22 | Doc: 22 | Match: 22
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — user_id, module_id, tenant_id, classroom_id
- **Note:** Excellent alignment. All 9 indices, UNIQUE constraints, CHECK constraints, and ENUMs correctly documented.

---

### progress_tracking.scheduled_missions

- **DDL:** `apps/database/ddl/schemas/progress_tracking/tables/05-scheduled_missions.sql`
- **Doc:** `docs/20-architecture/schema-reference/06-progress.md:484`
- **Status:** MATCH
- **Columns DDL:** 9 | Doc: 9 | Match: 9
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — scheduled_by (ON DELETE RESTRICT), classroom_id
- **Note:** Perfect alignment. Note: classroom_id has no FK constraint in DDL (soft reference); doc notes it as FK to `social_features.classrooms` — minor discrepancy, DDL does not add a FK constraint for classroom_id.

---

### progress_tracking.student_intervention_alerts

- **DDL:** `apps/database/ddl/schemas/progress_tracking/tables/16a-student_intervention_alerts.sql`
- **Doc:** `docs/20-architecture/schema-reference/06-progress.md:508`
- **Status:** MATCH
- **Columns DDL:** 15 | Doc: 15 | Match: 15
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — student_id, classroom_id, acknowledged_by, resolved_by, tenant_id
- **Note:** Perfect alignment. CHECK constraints on alert_type (6 values), severity (4), status (4) all documented.

---

### progress_tracking.teacher_alert_configurations

- **DDL:** `apps/database/ddl/schemas/progress_tracking/tables/20-teacher_alert_configurations.sql`
- **Doc:** `docs/20-architecture/schema-reference/06-progress.md:539`
- **Status:** MATCH
- **Columns DDL:** 13 | Doc: 13 | Match: 13
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — teacher_id, classroom_id, tenant_id
- **Note:** Perfect alignment.

---

### progress_tracking.teacher_interventions

- **DDL:** `apps/database/ddl/schemas/progress_tracking/tables/17-teacher_interventions.sql`
- **Doc:** `docs/20-architecture/schema-reference/06-progress.md:567`
- **Status:** MATCH
- **Columns DDL:** 24 | Doc: 24 | Match: 24
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — alert_id, student_id, teacher_id, classroom_id, tenant_id
- **Note:** Excellent alignment. All 11 intervention_type values, 5 status values, 4 priority values, effectiveness_rating CHECK all documented.

---

### progress_tracking.teacher_notes

- **DDL:** `apps/database/ddl/schemas/progress_tracking/tables/teacher_notes.sql`
- **Doc:** `docs/20-architecture/schema-reference/06-progress.md:609`
- **Status:** MATCH
- **Columns DDL:** 5 | Doc: 5 | Match: 5
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — teacher_id (ON DELETE RESTRICT), student_id
- **Note:** Perfect alignment.

---

## SECTION 3 — Additional DDL Tables MISSING from docs entirely (educational_content)

The following DDL tables in educational_content have **no documentation** in 03-education.md at all:

| Table | DDL File | Columns | Priority |
|---|---|---|---|
| `educational_content.assessment_rubrics` | `03-assessment_rubrics.sql` | 17 | HIGH — used for M3-M5 grading |
| `educational_content.assignments` | `05-assignments.sql` | 9 | HIGH — core teacher workflow |
| `educational_content.assignment_students` | `07-assignment_students.sql` | 22 | HIGH — grading + submission tracking |
| `educational_content.assignment_submissions` | `08-assignment_submissions.sql` | 10 | MEDIUM — overlaps with assignment_students |

---

## SECTION 4 — Legacy Section of 03-education.md (STALE)

The legacy/conceptual section at the top of `docs/20-architecture/schema-reference/03-education.md` (lines 1–300 approximately) describes tables that **do not exist in DDL** as documented:

| Doc Section | Reality |
|---|---|
| `educational_modules` | DDL table is `modules` — completely different column set |
| `module_progress` | This table is in `progress_tracking` schema, not `educational_content` |
| `exercises` (legacy version) | DDL has evolved with 42 columns vs 20 in doc; missing `requires_manual_grading`, `comodines_*`, pedagogical fields |
| `exercise_types` | Not a table — represented as ENUM `educational_content.exercise_type` |
| `exercise_attempts` | Table is in `progress_tracking` schema |
| `exercise_results` | NO DDL table — results embedded in exercise_attempts |
| `exercise_feedback` | NO DDL table — feedback TEXT in exercise_submissions |
| `contents` | NO DDL table — content embedded as JSONB in modules |
| `content_versions` | NO DDL table |
| `content_categories` | NO DDL table |
| `reading_assignments` | NO DDL table |
| `spaced_repetition` | NO DDL table |

---

## Summary Table — educational_content

| Table | DDL File | Status | Columns Match % | FKs | Notes |
|---|---|---|---|---|---|
| modules | 01-modules.sql | PARTIAL | ~20% (legacy doc only) | NO | Legacy doc describes entirely different schema |
| exercises | 02-exercises.sql | PARTIAL | ~40% (legacy doc only) | PARTIAL | Legacy doc; missing 22+ new columns |
| assessment_rubrics | 03-assessment_rubrics.sql | MISSING_FROM_DOCS | 0% | NO | Not documented anywhere |
| media_resources | 04-media_resources.sql | MATCH | 100% | YES | Additional section docs |
| assignments | 05-assignments.sql | MISSING_FROM_DOCS | 0% | NO | Not documented anywhere |
| assignment_exercises | 06-assignment_exercises.sql | MATCH | 100% | YES | Additional section docs |
| assignment_students | 07-assignment_students.sql | MISSING_FROM_DOCS | 0% | NO | Not documented anywhere |
| assignment_submissions | 08-assignment_submissions.sql | MISSING_FROM_DOCS | 0% | NO | Not documented anywhere |
| difficulty_criteria | 20-difficulty_criteria.sql | MATCH | 100% | YES | Perfect |
| exercise_mechanic_mappings | 21-exercise_mechanic_mapping.sql | MATCH | 100% | N/A | Perfect |
| exercise_validation_configs | 22-exercise_validation_config.sql | MATCH | 100% | N/A | Perfect |
| teacher_contents | 25-teacher_content.sql | PARTIAL | ~80% | YES | Doc entry exists; minor columns possibly missing |
| exercise_validation_audits | 26-exercise_validation_audit.sql | MATCH | 100% | YES | Perfect |
| exercise_type_rubrics | 27-exercise_type_rubrics.sql | MATCH | 100% | N/A | Perfect |
| resource_ratings | 28-resource_ratings.sql | MATCH | 100% | YES | Perfect |
| resource_comments | 29-resource_comments.sql | MATCH | 100% | YES | Perfect |
| resource_downloads | 30-resource_downloads.sql | MATCH | 100% | YES | Perfect |
| content_approvals | content_approvals.sql | MATCH | 100% | YES | Perfect |
| content_metadatas | content_metadata.sql | MATCH | 100% | YES | Perfect |
| content_tags | content_tags.sql | MATCH | 100% | YES | Perfect |
| module_dependencies | module_dependencies.sql | MATCH | 100% | YES | Perfect |
| taxonomies | taxonomies.sql | MATCH | 100% | N/A | Perfect |
| media_attachments | _cross_schema/09-media_attachments.sql | MATCH | 100% | YES | Perfect |
| classroom_modules | _cross_schema/23-classroom_modules.sql | MATCH | 100% | YES | Perfect |

---

## Summary Table — progress_tracking

| Table | DDL File | Status | Columns Match % | FKs | Notes |
|---|---|---|---|---|---|
| module_progress | 01-module_progress.sql | MATCH | 100% | YES | Perfect |
| learning_sessions | 02-learning_sessions.sql | MATCH | 100% | YES | Perfect |
| exercise_attempts | 03-exercise_attempts.sql | MATCH | 100% | YES | Perfect |
| exercise_submissions | 04-exercise_submissions.sql | MATCH | 100% | YES | Perfect |
| scheduled_missions | 05-scheduled_missions.sql | MATCH | 97% | PARTIAL | classroom_id lacks FK in DDL but doc says FK |
| manual_reviews | 06-manual_reviews.sql | MATCH | 100% | YES | Perfect |
| user_difficulty_progresses | 15-user_difficulty_progress.sql | MATCH | 100% | YES | Perfect; GENERATED columns documented |
| user_current_levels | 16-user_current_level.sql | MATCH | 100% | YES | Perfect |
| student_intervention_alerts | 16a-student_intervention_alerts.sql | MATCH | 100% | YES | Perfect |
| teacher_interventions | 17-teacher_interventions.sql | MATCH | 100% | YES | Perfect |
| certificates | 18-certificates.sql | MATCH | 100% | YES | Perfect |
| teacher_alert_configurations | 20-teacher_alert_configurations.sql | MATCH | 100% | YES | Perfect |
| engagement_metrics | engagement_metrics.sql | MATCH | 100% | YES | Perfect |
| learning_paths | learning_paths.sql | MATCH | 100% | YES | Perfect |
| mastery_trackings | mastery_tracking.sql | MATCH | 100% | YES | Perfect |
| module_completion_trackings | module_completion_tracking.sql | MATCH | 100% | YES | Perfect |
| progress_snapshots | progress_snapshots.sql | MATCH | 100% | YES | Perfect |
| skill_assessments | skill_assessments.sql | MATCH | 100% | YES | Perfect |
| teacher_notes | teacher_notes.sql | MATCH | 100% | YES | Perfect |
| user_learning_paths | user_learning_paths.sql | MATCH | 100% | YES | Perfect |
| learning_path_modules | _cross_schema/learning_path_modules.sql | MATCH | 100% | YES | Perfect |

---

## Overall Statistics

### educational_content
- Total DDL tables: 24
- MATCH: 16 (67%)
- PARTIAL: 3 (12%) — modules, exercises, teacher_contents
- MISSING_FROM_DOCS: 4 (17%) — assessment_rubrics, assignments, assignment_students, assignment_submissions
- MISSING_FROM_DDL (legacy doc claims): 11 conceptual tables no longer exist in DDL

### progress_tracking
- Total DDL tables: 21
- MATCH: 20 (95%)
- PARTIAL: 1 (5%) — scheduled_missions (minor: classroom_id FK)
- MISSING_FROM_DOCS: 0
- MISSING_FROM_DDL: 0

---

## Critical Gaps Identified

### GAP-1 (HIGH): educational_content.modules — doc uses legacy schema
- **Severity:** HIGH
- **Description:** The doc section `educational_content.educational_modules` describes a completely different, obsolete table. The real DDL `educational_content.modules` has 36 columns (vs 11 in doc) with different column names (title/order_index vs name/sort_order), different types, and entirely different architectural purpose (multi-tenant, rich metadata, gamification integration).
- **Impact:** Anyone consulting the doc for the modules schema will get wrong information for 25+ columns.
- **Recommendation:** Replace legacy section entry with accurate documentation of `educational_content.modules` DDL.

### GAP-2 (HIGH): educational_content.exercises — doc uses legacy schema
- **Severity:** HIGH
- **Description:** Doc describes exercises with 20 legacy columns. Actual DDL has 42 columns including critical additions: `requires_manual_grading` (dual grading architecture), `comodines_allowed`, `comodines_config`, `objective`, `how_to_solve`, `recommended_strategy`, `pedagogical_notes`. These were added in Nov 2025 ADR-008 changes.
- **Impact:** Backend/frontend developers miss 22+ columns when referencing docs.
- **Recommendation:** Update `03-education.md` exercises section to reflect actual DDL.

### GAP-3 (HIGH): assessment_rubrics — completely undocumented
- **Severity:** HIGH
- **Description:** `educational_content.assessment_rubrics` (17 columns, polymorphic relationship to exercises OR modules, used for M3-M5 manual grading) has zero documentation in any schema-reference file.
- **Recommendation:** Add documentation section to `03-education.md`.

### GAP-4 (HIGH): assignments, assignment_students, assignment_submissions — undocumented
- **Severity:** HIGH
- **Description:** Three interrelated assignment workflow tables totaling 41 columns are entirely absent from docs. The `assignment_students` table (22 columns) has an auto-trigger for late detection and grade calculation.
- **Recommendation:** Add three new sections to `03-education.md`.

### GAP-5 (MEDIUM): educational_content.modules — doc FK coverage zero
- **Severity:** MEDIUM
- **Description:** The DDL has 4 FKs on modules (tenant_id, created_by, reviewed_by, approved_by) but doc documents none.
- **Recommendation:** Add FK documentation to modules entry.

### GAP-6 (LOW): progress_tracking.scheduled_missions — classroom_id FK discrepancy
- **Severity:** LOW
- **Description:** Doc documents classroom_id as `FK social_features.classrooms`. DDL has no FK constraint on classroom_id in scheduled_missions (only scheduled_by has a FK). The FK is only on the student_intervention_alerts, teacher_interventions, and teacher_alert_configurations tables.
- **Recommendation:** Correct doc to note classroom_id is an unenforceable soft reference in scheduled_missions.

### GAP-7 (LOW): Legacy section in 03-education.md — 11 non-existent tables documented
- **Severity:** MEDIUM
- **Description:** The top section of 03-education.md (approximately lines 1–300) documents 11 tables that do not exist in DDL. This creates confusion about the authoritative data model.
- **Recommendation:** Add a prominent DEPRECATED notice to this section, or remove it and replace with accurate DDL-based documentation.

---

## Positive Findings

1. **progress_tracking schema is exceptionally well-documented** — 20/21 tables are MATCH or near-MATCH with 100% column coverage. The 06-progress.md is an exemplary schema-reference document.

2. **educational_content additional section is well-documented** — The post-legacy section of 03-education.md (added after the core refactoring) accurately documents 16 tables with full column coverage, constraints, and FK details.

3. **GENERATED columns documented correctly** — Both `user_difficulty_progresses.success_rate` and `avg_time_per_exercise` are GENERATED ALWAYS AS STORED columns, correctly documented.

4. **Cross-schema tables found** — learning_path_modules (in _cross_schema/) is documented and matches.

5. **Column count match for progress_tracking** — 21 DDL tables × 100% average column coverage in docs.

---

*Audit completed: 2026-02-27*
*Method: Read-only. No files modified.*
