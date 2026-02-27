# Audit Report: DDL vs Schema-Reference
## Phase 3 — Gamification System & Social Features
**Date:** 2026-02-27
**Auditor:** Claude Sonnet 4.6 (read-only audit, no files modified)
**Scope:** `gamification_system` and `social_features` schemas
**Sources:**
- DDL: `apps/database/ddl/schemas/gamification_system/tables/` (19 files + 2 _cross_schema)
- DDL: `apps/database/ddl/schemas/social_features/tables/` (29 files)
- Docs: `docs/20-architecture/schema-reference/04-gamification.md`
- Docs: `docs/20-architecture/schema-reference/05-social.md`

---

## GAMIFICATION_SYSTEM

### Legend
- **MATCH** — columns, types, constraints and FKs fully aligned
- **PARTIAL** — minor discrepancies (nullability wording, default expressions, extra columns in one source)
- **MISSING_FROM_DOCS** — DDL table exists, doc has no entry
- **MISSING_FROM_DDL** — Doc documents table, no DDL file found in tables/

---

### gamification_system.user_stats
- **DDL:** `apps/database/ddl/schemas/gamification_system/tables/01-user_stats.sql`
- **Doc:** `docs/20-architecture/schema-reference/04-gamification.md:187`
- **Status:** MATCH
- **Columns DDL:** 34 | **Doc:** 34 | **Match:** 34
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none — both align on all types including `maya_rank` ENUM for `current_rank`, `NUMERIC(5,2)` for `rank_progress`, `INTERVAL` for time fields
- **FK documented:** YES — `user_id → auth_management.profiles`, `tenant_id → auth_management.tenants`
- **Notes:** Doc correctly reflects all 10 AJUSTE fields added. Nullable/NOT NULL discrepancy: doc shows `current_rank` as NULL-able but DDL has no explicit NOT NULL and shows a DEFAULT only, which is consistent. All indexes documented.

---

### gamification_system.user_ranks
- **DDL:** `apps/database/ddl/schemas/gamification_system/tables/02-user_ranks.sql`
- **Doc:** `docs/20-architecture/schema-reference/04-gamification.md:235`
- **Status:** MATCH
- **Columns DDL:** 18 | **Doc:** 18 | **Match:** 18
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — `user_id → auth_management.profiles`, `tenant_id → auth_management.tenants`
- **Notes:** Perfect alignment. All columns, types, and indexes match.

---

### gamification_system.maya_ranks
- **DDL:** `apps/database/ddl/schemas/gamification_system/tables/13-maya_ranks.sql`
- **Doc:** `docs/20-architecture/schema-reference/04-gamification.md:264`
- **Status:** MATCH
- **Columns DDL:** 17 | **Doc:** 17 | **Match:** 17
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — none required (standalone catalog)
- **Notes:** All columns match. Indexes, constraints, and trigger all documented.

---

### gamification_system.achievement_categories
- **DDL:** `apps/database/ddl/schemas/gamification_system/tables/10-achievement_categories.sql`
- **Doc:** `docs/20-architecture/schema-reference/04-gamification.md:297`
- **Status:** MATCH
- **Columns DDL:** 8 | **Doc:** 8 | **Match:** 8
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — no FKs (standalone catalog)
- **Notes:** Perfect alignment. Trigger `trg_achievement_categories_updated_at` documented correctly.

---

### gamification_system.achievements
- **DDL:** `apps/database/ddl/schemas/gamification_system/tables/03-achievements.sql`
- **Doc:** `docs/20-architecture/schema-reference/04-gamification.md:317`
- **Status:** MATCH
- **Columns DDL:** 22 | **Doc:** 22 | **Match:** 22
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none — `difficulty_level` ENUM from `educational_content`, `achievement_category` ENUM both correctly referenced in doc
- **FK documented:** YES — `tenant_id → tenants`, `created_by → profiles`
- **Notes:** `ml_coins_reward` column is the last column in DDL (added after initial schema) — correctly documented. RLS policies documented.

---

### gamification_system.user_achievements
- **DDL:** `apps/database/ddl/schemas/gamification_system/tables/04-user_achievements.sql`
- **Doc:** `docs/20-architecture/schema-reference/04-gamification.md:352`
- **Status:** MATCH
- **Columns DDL:** 16 | **Doc:** 16 | **Match:** 16
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — `user_id → profiles`, `achievement_id → achievements`
- **Notes:** Perfect alignment. All 5 indexes documented.

---

### gamification_system.ml_coins_transactions
- **DDL:** `apps/database/ddl/schemas/gamification_system/tables/05-ml_coins_transactions.sql`
- **Doc:** `docs/20-architecture/schema-reference/04-gamification.md:383`
- **Status:** MATCH
- **Columns DDL:** 15 | **Doc:** 15 | **Match:** 15
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none — `transaction_type` ENUM correctly documented; `multiplier NUMERIC(3,2)` matches
- **FK documented:** YES — `user_id → profiles`, `tenant_id → tenants`
- **Notes:** All 7 indexes documented. RLS policies documented.

---

### gamification_system.mission_templates
- **DDL:** `apps/database/ddl/schemas/gamification_system/tables/05a-mission_templates.sql`
- **Doc:** `docs/20-architecture/schema-reference/04-gamification.md:411`
- **Status:** MATCH
- **Columns DDL:** 22 | **Doc:** 22 | **Match:** 22
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — `created_by → profiles`, `exercise_id → educational_content.exercises`
- **Notes:** `badge_id` FK commented out in DDL (no badges table yet) — doc correctly shows it as NULL/optional. All 6 indexes documented.

---

### gamification_system.missions
- **DDL:** `apps/database/ddl/schemas/gamification_system/tables/06-missions.sql`
- **Doc:** `docs/20-architecture/schema-reference/04-gamification.md:445`
- **Status:** MATCH
- **Columns DDL:** 16 | **Doc:** 16 | **Match:** 16
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none — `progress DOUBLE PRECISION` correctly documented; `status text` with CHECK correctly noted
- **FK documented:** YES — `user_id → profiles`, `template_id → mission_templates`, `exercise_id → exercises`
- **Notes:** UNIQUE constraint `(user_id, template_id, mission_type, end_date)` documented. All 7 indexes documented.

---

### gamification_system.comodines_inventory
- **DDL:** `apps/database/ddl/schemas/gamification_system/tables/07-comodines_inventory.sql`
- **Doc:** `docs/20-architecture/schema-reference/04-gamification.md:475`
- **Status:** MATCH
- **Columns DDL:** 16 | **Doc:** 16 | **Match:** 16
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — `user_id → profiles`
- **Notes:** All cost/count/available columns correctly documented with proper defaults (15, 25, 40 ML Coins).

---

### gamification_system.comodin_usage_logs
- **DDL:** `apps/database/ddl/schemas/gamification_system/tables/14-comodin_usage_log.sql`
  (Note: DDL table name is `comodin_usage_logs`, file is `14-comodin_usage_log.sql`)
- **Doc:** `docs/20-architecture/schema-reference/04-gamification.md:502`
- **Status:** MATCH
- **Columns DDL:** 9 | **Doc:** 9 | **Match:** 9
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none — `comodin_type` ENUM, JSONB fields all correct
- **FK documented:** YES — `user_id → profiles`
- **Notes:** UNIQUE constraint `(user_id, exercise_id, attempt_id, comodin_type)` documented. All 6 indexes including GIN documented.

---

### gamification_system.comodin_usage_trackings
- **DDL:** `apps/database/ddl/schemas/gamification_system/tables/15-comodin_usage_tracking.sql`
  (Note: DDL file is `15-comodin_usage_tracking.sql`, table name is `comodin_usage_trackings`)
- **Doc:** `docs/20-architecture/schema-reference/04-gamification.md:522`
- **Status:** MATCH
- **Columns DDL:** 12 | **Doc:** 12 | **Match:** 12
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — `user_id → profiles`
- **Notes:** UNIQUE `(user_id, exercise_id, attempt_id)` documented. Trigger `trg_comodin_tracking_updated` documented.

---

### gamification_system.active_boosts
- **DDL:** `apps/database/ddl/schemas/gamification_system/tables/11-active_boosts.sql`
- **Doc:** `docs/20-architecture/schema-reference/04-gamification.md:549`
- **Status:** MATCH
- **Columns DDL:** 7 | **Doc:** 7 | **Match:** 7
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none — `multiplier NUMERIC(4,2)` documented correctly
- **FK documented:** YES — `user_id → profiles`
- **Notes:** All 5 indexes documented. Constraints `multiplier > 1.0` and `expires_at > activated_at` documented.

---

### gamification_system.inventory_transactions
- **DDL:** `apps/database/ddl/schemas/gamification_system/tables/12-inventory_transactions.sql`
- **Doc:** `docs/20-architecture/schema-reference/04-gamification.md:568`
- **Status:** PARTIAL
- **Columns DDL:** 6 | **Doc:** 6 | **Match:** 5
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:**
  - `metadata`: DDL has `JSONB` with no default (nullable); doc says `NULL | NULL` — minor: DDL column technically allows NULL since no NOT NULL constraint, consistent.
- **FK documented:** PARTIAL — DDL has `user_id → profiles` FK but `item_id` has no FK in DDL (no FK to shop_items defined). Doc says `item_id UUID NOT NULL - ID del item involucrado`. Item ID FK is missing from DDL.
- **Notes:** **GAP:** `item_id` has no foreign key constraint in DDL. It's a plain UUID with no referential integrity to `shop_items`. This should be an FK to `gamification_system.shop_items(id)` but is currently undeclared.

---

### gamification_system.leaderboard_metadatas
- **DDL:** `apps/database/ddl/schemas/gamification_system/tables/09-leaderboard_metadata.sql`
  (Note: DDL file name is `09-leaderboard_metadata.sql`, table name is `leaderboard_metadatas`)
- **Doc:** `docs/20-architecture/schema-reference/04-gamification.md:585`
- **Status:** MATCH
- **Columns DDL:** 5 | **Doc:** 5 | **Match:** 5
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — no FKs (view metadata table)
- **Notes:** PK is `view_name TEXT`, not UUID — correctly documented.

---

### gamification_system.shop_categories
- **DDL:** `apps/database/ddl/schemas/gamification_system/tables/17-shop_categories.sql`
- **Doc:** `docs/20-architecture/schema-reference/04-gamification.md:600`
- **Status:** MATCH
- **Columns DDL:** 10 | **Doc:** 10 | **Match:** 10
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — no FKs (standalone catalog)
- **Notes:** Trigger `trg_shop_categories_updated_at` in DDL but not mentioned in doc. Minor gap.

---

### gamification_system.shop_items
- **DDL:** `apps/database/ddl/schemas/gamification_system/tables/18-shop_items.sql`
- **Doc:** `docs/20-architecture/schema-reference/04-gamification.md:622`
- **Status:** MATCH
- **Columns DDL:** 23 | **Doc:** 23 | **Match:** 23
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none — `shop_item_category` ENUM, `rarity TEXT` with CHECK both correct
- **FK documented:** YES — `tenant_id → tenants`, `category_id → shop_categories`, `required_achievement_id → achievements`, `created_by → profiles`
- **Notes:** All 7 indexes documented. Trigger `trg_shop_items_updated_at` in DDL but not explicitly mentioned in doc.

---

### gamification_system.user_purchases
- **DDL:** `apps/database/ddl/schemas/gamification_system/tables/19-user_purchases.sql`
- **Doc:** `docs/20-architecture/schema-reference/04-gamification.md:659`
- **Status:** MATCH
- **Columns DDL:** 13 | **Doc:** 13 | **Match:** 13
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — `user_id → profiles`, `item_id → shop_items`, `tenant_id → tenants`, `transaction_id → ml_coins_transactions`
- **Notes:** Partial UNIQUE index `idx_user_purchases_unique_item` on `(user_id, item_id) WHERE status='completed' AND is_active=true` documented correctly. All 7 indexes documented.

---

### gamification_system.user_equipped_items
- **DDL:** `apps/database/ddl/schemas/gamification_system/tables/21-user_equipped_items.sql`
- **Doc:** `docs/20-architecture/schema-reference/04-gamification.md:685`
- **Status:** MATCH
- **Columns DDL:** 5 | **Doc:** 5 | **Match:** 5
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — `user_id → profiles`, `category_id → shop_categories`, `item_id → shop_items`
- **Notes:** UNIQUE index `idx_user_equipped_unique_category` on `(user_id, category_id)` documented. Core business rule (1 item per category per user) correctly captured.

---

### gamification_system.comodin_uses
- **DDL:** `apps/database/ddl/schemas/gamification_system/tables/_cross_schema/21-comodin_uses.sql`
- **Doc:** `docs/20-architecture/schema-reference/04-gamification.md:712`
- **Status:** MATCH
- **Columns DDL:** 8 | **Doc:** 8 | **Match:** 8
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none — `comodin_type` ENUM, `effect_applied VARCHAR(100)` both correct
- **FK documented:** YES — `user_id → profiles`, `exercise_id → educational_content.exercises`, `attempt_id → progress_tracking.exercise_attempts`
- **Notes:** Table is in `_cross_schema/` subdirectory (not main `tables/`). Doc correctly notes this. All 7 indexes and RLS policies documented. Immutable design (no `updated_at`) documented.

---

### gamification_system.classroom_missions
- **DDL:** `apps/database/ddl/schemas/gamification_system/tables/_cross_schema/16-classroom_missions.sql`
- **Doc:** NOT FOUND in `04-gamification.md`
- **Status:** MISSING_FROM_DOCS
- **Columns DDL:** 16 | **Doc:** 0 | **Match:** 0
- **Missing from docs:** ALL — `id, classroom_id, mission_template_id, assigned_by, assigned_at, due_date, is_mandatory, bonus_xp, bonus_coins, title, description, mission_type, objectives, base_rewards, is_active, metadata, created_at, updated_at`
- **Missing from DDL:** N/A
- **Type mismatches:** N/A
- **FK documented:** NO — FKs: `classroom_id → social_features.classrooms`, `mission_template_id → mission_templates`, `assigned_by → profiles`
- **Notes:** This is a real DDL table with 18 columns, 6 indexes, RLS policies and a trigger. It is entirely absent from the schema-reference documentation.

---

### GAMIFICATION_SYSTEM — Tables in docs NOT in DDL

The following tables are documented in `04-gamification.md` but have **no corresponding DDL file** in the `tables/` directory (or `_cross_schema/`). These represent **legacy/planned** documentation that predates or diverges from the actual DDL:

#### gamification_system.xp_transactions
- **DDL:** NOT FOUND
- **Doc:** `docs/20-architecture/schema-reference/04-gamification.md:15`
- **Status:** MISSING_FROM_DDL
- **Notes:** Documented with `student_id`, `xp_source_type` ENUM, `multiplier`, `base_amount` etc. No DDL file exists. XP is tracked inline in `user_stats` (total_xp, weekly_xp, monthly_xp) — not in a dedicated transactions table. This section appears to be legacy documentation from an earlier design. The entity `XpTransaction` is referenced but actual XP tracking in DDL is embedded in `user_stats`.

#### gamification_system.levels
- **DDL:** NOT FOUND
- **Doc:** `docs/20-architecture/schema-reference/04-gamification.md:37`
- **Status:** MISSING_FROM_DDL
- **Notes:** Documented with `number`, `name`, `xp_required`, `rank_type`, `benefits` etc. No DDL file. Levels are tracked as an integer in `user_stats.level`, not a separate catalog table. Legacy documentation.

#### gamification_system.rank_definitions
- **DDL:** NOT FOUND
- **Doc:** `docs/20-architecture/schema-reference/04-gamification.md:56`
- **Status:** MISSING_FROM_DDL
- **Notes:** Documented with `type rank_type`, `min_xp`, `icon_url`, `frame_url`. This concept is now implemented by `maya_ranks` table (different column names, `maya_rank` ENUM instead of `rank_type`). These two tables represent the same concept with different designs. Legacy documentation superseded by `maya_ranks`.

#### gamification_system.student_gamification
- **DDL:** NOT FOUND
- **Doc:** `docs/20-architecture/schema-reference/04-gamification.md:79`
- **Status:** MISSING_FROM_DDL
- **Notes:** Documented with `student_id`, `current_level`, `current_rank rank_type`, `ml_coins_balance` etc. This concept is now `user_stats` in DDL (same purpose, different naming). Legacy documentation superseded by `user_stats`. The column names differ (`student_id` vs `user_id`, `current_level` vs `level`, `ml_coins_balance` vs `ml_coins`, `longest_streak` vs `max_streak`).

#### gamification_system.gamification_config
- **DDL:** NOT FOUND
- **Doc:** `docs/20-architecture/schema-reference/04-gamification.md:106`
- **Status:** MISSING_FROM_DDL
- **Notes:** Documented with per-tenant XP configuration (`xp_base_exercise`, `xp_multiplier_easy`, `daily_xp_limit`, `ml_coins_per_exercise`). No DDL file. Configuration appears to be hardcoded in backend or part of tenant settings. Legacy planned feature.

#### gamification_system.xp_multipliers
- **DDL:** NOT FOUND
- **Doc:** `docs/20-architecture/schema-reference/04-gamification.md:130`
- **Status:** MISSING_FROM_DDL
- **Notes:** Documented with `multiplier_type`, `value`, `source`, `expires_at`. This concept is partially covered by `active_boosts` (which handles XP, COINS, LUCK, DROP_RATE multipliers). Legacy documentation or merged into `active_boosts`.

#### gamification_system.daily_xp_limits
- **DDL:** NOT FOUND
- **Doc:** `docs/20-architecture/schema-reference/04-gamification.md:147`
- **Status:** MISSING_FROM_DDL
- **Notes:** Documented for anti-abuse XP daily tracking. Daily XP earned is tracked in `user_stats.ml_coins_earned_today` (ML Coins) but no dedicated XP daily limit table exists in DDL. Feature partially planned.

#### gamification_system.streak_records
- **DDL:** NOT FOUND
- **Doc:** `docs/20-architecture/schema-reference/04-gamification.md:165`
- **Status:** MISSING_FROM_DDL
- **Notes:** Documented for historical streak records. Current streaks tracked in `user_stats` (current_streak, max_streak, streak_started_at). No detailed streak history table in DDL. Legacy planned feature.

---

## SOCIAL_FEATURES

### social_features.schools
- **DDL:** `apps/database/ddl/schemas/social_features/tables/02-schools.sql`
- **Doc:** `docs/20-architecture/schema-reference/05-social.md:11`
- **Status:** MATCH
- **Columns DDL:** 24 | **Doc:** 24 | **Match:** 24
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — `tenant_id → tenants`, `principal_id → profiles`, `administrative_contact_id → profiles`
- **Notes:** Perfect alignment. UNIQUE `code`. All 3 indexes documented.

---

### social_features.classrooms
- **DDL:** `apps/database/ddl/schemas/social_features/tables/03-classrooms.sql`
- **Doc:** `docs/20-architecture/schema-reference/05-social.md:51`
- **Status:** MATCH
- **Columns DDL:** 22 | **Doc:** 22 | **Match:** 22
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — `school_id → schools`, `tenant_id → tenants`, `teacher_id → profiles`
- **Notes:** UNIQUE `code`. All 5 indexes documented. `co_teachers uuid[]` array column correctly documented. RLS policies documented.

---

### social_features.classroom_members
- **DDL:** `apps/database/ddl/schemas/social_features/tables/04-classroom_members.sql`
- **Doc:** `docs/20-architecture/schema-reference/05-social.md:89`
- **Status:** MATCH
- **Columns DDL:** 17 | **Doc:** 17 | **Match:** 17
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — `classroom_id → classrooms`, `student_id → profiles`, `enrolled_by → profiles`
- **Notes:** UNIQUE `(classroom_id, student_id)`. All 4 indexes. RLS policies documented.

---

### social_features.teacher_classrooms
- **DDL:** `apps/database/ddl/schemas/social_features/tables/teacher_classrooms.sql`
- **Doc:** `docs/20-architecture/schema-reference/05-social.md:120`
- **Status:** MATCH
- **Columns DDL:** 6 | **Doc:** 6 | **Match:** 6
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — `teacher_id → profiles`, `classroom_id → classrooms`, `tenant_id → tenants`
- **Notes:** UNIQUE `(teacher_id, classroom_id)`. All 4 indexes documented. Role CHECK `('owner', 'teacher', 'assistant')` documented.

---

### social_features.assignment_classrooms
- **DDL:** `apps/database/ddl/schemas/social_features/tables/assignment_classrooms.sql`
- **Doc:** `docs/20-architecture/schema-reference/05-social.md:138`
- **Status:** MATCH
- **Columns DDL:** 3 | **Doc:** 3 | **Match:** 3
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — `assignment_id → educational_content.assignments`, `classroom_id → classrooms`
- **Notes:** UNIQUE `(assignment_id, classroom_id)`. Both indexes documented.

---

### social_features.teams
- **DDL:** `apps/database/ddl/schemas/social_features/tables/05-teams.sql`
- **Doc:** `docs/20-architecture/schema-reference/05-social.md:155`
- **Status:** PARTIAL
- **Columns DDL:** 25 | **Doc:** 10 | **Match:** 8
- **Missing from docs:** `motto, color_primary, color_secondary, banner_url, badges, creator_id, team_code, current_members_count, is_public, allow_join_requests, require_approval, total_xp, total_ml_coins, modules_completed, achievements_earned, is_verified, founded_at, last_activity_at`
- **Missing from DDL:** `status (team_status ENUM)`, `created_by`
- **Type mismatches:**
  - Doc: `tenant_id UUID NOT NULL - FK tenants.tenants` — DDL: `tenant_id uuid NOT NULL` — OK
  - Doc: `classroom_id UUID NOT NULL - FK classrooms.classrooms` — DDL: `classroom_id uuid` (no NOT NULL!) — **DISCREPANCY**: DDL allows NULL classroom_id but doc says NOT NULL
  - Doc: `max_members INTEGER NOT NULL 5` — DDL: `max_members integer DEFAULT 5` (nullable) — minor nullable discrepancy
  - Doc column `status` uses `team_status` ENUM but this column does NOT EXIST in DDL. DDL uses `is_active BOOLEAN` instead.
  - Doc column `created_by UUID NOT NULL` — DDL has `creator_id uuid NOT NULL` (same concept, different name)
  - Doc: `name VARCHAR(100) NOT NULL` — DDL: `name text NOT NULL` — minor type difference (TEXT vs VARCHAR)
- **FK documented:** PARTIAL — DDL has FKs for `classroom_id → classrooms`, `creator_id → profiles`, `leader_id → profiles`, `tenant_id → tenants`. Doc references `created_by` (not `creator_id`) and misses `leader_id` FK.
- **Notes:** SIGNIFICANT DRIFT. The doc appears to reflect an older/simplified version of the teams table. DDL has 25 columns while doc only documents 10. Missing: motto, colors, badges JSONB, team_code, gamification counters (total_xp, total_ml_coins), is_public, join request controls, is_verified, founded_at, last_activity_at. The `status` column documented does not exist in DDL (DDL uses `is_active boolean`). Column rename: `created_by` (doc) vs `creator_id` (DDL).

---

### social_features.team_members
- **DDL:** `apps/database/ddl/schemas/social_features/tables/06-team_members.sql`
- **Doc:** `docs/20-architecture/schema-reference/05-social.md:176`
- **Status:** PARTIAL
- **Columns DDL:** 5 | **Doc:** 6 | **Match:** 4
- **Missing from docs:** `left_at TIMESTAMPTZ` (DDL has it, doc doesn't mention it)
- **Missing from DDL:** `tenant_id UUID NOT NULL` (doc says this but DDL has no tenant_id column)
- **Type mismatches:**
  - Doc: `student_id UUID NOT NULL - FK auth.users` — DDL: `user_id UUID NOT NULL` — **NAME DISCREPANCY**: doc says `student_id`, DDL says `user_id`
  - Doc: `tenant_id UUID NOT NULL` — DDL: column does NOT EXIST
  - Doc: role values `(leader, member)` — DDL CHECK: `(owner, admin, member)` — **VALUE DISCREPANCY**: doc shows `leader` but DDL has `owner` and `admin`
- **FK documented:** PARTIAL — DDL has `team_id → teams`, `user_id → profiles`. Doc references `student_id` (wrong name) and `tenant_id` (non-existent FK).
- **Notes:** Three discrepancies: column rename (`student_id` vs `user_id`), missing `tenant_id` in DDL, and role enum values differ (leader/member in doc vs owner/admin/member in DDL). Also `left_at` column in DDL not documented.

---

### social_features.team_challenges
- **DDL:** `apps/database/ddl/schemas/social_features/tables/07-team_challenges.sql`
- **Doc:** `docs/20-architecture/schema-reference/05-social.md:193`
- **Status:** PARTIAL
- **Columns DDL:** 7 | **Doc:** 10 | **Match:** 5
- **Missing from docs:** none (all DDL columns are subset of doc columns)
- **Missing from DDL:** `tenant_id UUID NOT NULL`, `exercise_id UUID`, `winner_team_id UUID`, `team_a_score NUMERIC`, `team_b_score NUMERIC`, `started_at TIMESTAMPTZ`, `ended_at TIMESTAMPTZ`
- **Type mismatches:**
  - Doc: `team_a_id, team_b_id, winner_team_id` — DDL: `team_id, challenge_id` only — **STRUCTURAL DIFFERENCE**: DDL is a junction table (team_id + challenge_id) not a team vs team table. Doc documents a completely different structure.
  - Doc status values: `pending` — DDL status values: `active, in_progress, completed, failed, cancelled` — different defaults and values
  - Doc `status VARCHAR(20) NOT NULL 'pending'` — DDL `status VARCHAR(20) DEFAULT 'active'`
- **FK documented:** NO — DDL FK is `team_id → teams` only. Challenge_id has no FK in DDL. Doc documents a team-vs-team challenge structure.
- **Notes:** SIGNIFICANT STRUCTURAL MISMATCH. The DDL `team_challenges` is a simple junction table linking a team to a generic `challenge_id` (UUID with no FK). The doc describes a team-vs-team battle table with scores, winner, start/end times. These are fundamentally different tables. The DDL table is a participation record; the doc describes results. This may be confusion with `team_vs_team_challenges` table (DDL 27-team_vs_team_challenges.sql).

---

### social_features.friendships
- **DDL:** `apps/database/ddl/schemas/social_features/tables/01-friendships.sql`
- **Doc:** `docs/20-architecture/schema-reference/05-social.md:215`
- **Status:** MATCH
- **Columns DDL:** 5 | **Doc:** 5 | **Match:** 5
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — `user_id → profiles`, `friend_id → profiles`
- **Notes:** Perfect alignment. UNIQUE `(user_id, friend_id)`, CHECK `user_id != friend_id` documented. All 3 indexes.

---

### social_features.friend_requests
- **DDL:** `apps/database/ddl/schemas/social_features/tables/10-friend_requests.sql`
- **Doc:** `docs/20-architecture/schema-reference/05-social.md:232`
- **Status:** MATCH
- **Columns DDL:** 6 | **Doc:** 6 | **Match:** 6
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — `requester_id → profiles`, `recipient_id → profiles`
- **Notes:** Perfect alignment. All 5 indexes (including partial index for pending) documented.

---

### social_features.user_follows
- **DDL:** `apps/database/ddl/schemas/social_features/tables/user_follows.sql`
- **Doc:** `docs/20-architecture/schema-reference/05-social.md:250`
- **Status:** MATCH
- **Columns DDL:** 3 | **Doc:** 3 | **Match:** 3
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — `follower_id → profiles`, `following_id → profiles`
- **Notes:** UNIQUE `(follower_id, following_id)`, CHECK self-follow documented. All 3 indexes.

---

### social_features.user_blocks
- **DDL:** `apps/database/ddl/schemas/social_features/tables/26-user_blocks.sql`
- **Doc:** `docs/20-architecture/schema-reference/05-social.md:265`
- **Status:** MATCH
- **Columns DDL:** 5 | **Doc:** 5 | **Match:** 5
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — `blocker_id → profiles`, `blocked_id → profiles`
- **Notes:** UNIQUE `(blocker_id, blocked_id)`, CHECK no-self-block documented. All 3 indexes including bidirectional.

---

### social_features.social_interactions
- **DDL:** `apps/database/ddl/schemas/social_features/tables/social_interactions.sql`
- **Doc:** `docs/20-architecture/schema-reference/05-social.md:284`
- **Status:** MATCH
- **Columns DDL:** 7 | **Doc:** 7 | **Match:** 7
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — `user_id → profiles`, `target_user_id → profiles`
- **Notes:** Perfect alignment. All 5 indexes documented.

---

### social_features.user_activities
- **DDL:** `apps/database/ddl/schemas/social_features/tables/09-user_activities.sql`
- **Doc:** `docs/20-architecture/schema-reference/05-social.md:302`
- **Status:** MATCH
- **Columns DDL:** 7 | **Doc:** 7 | **Match:** 7
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none — `activity_id UUID PK` correctly noted in doc as PK
- **FK documented:** YES — `user_id → profiles`
- **Notes:** Perfect alignment. All 5 indexes including composite `idx_user_activities_public_recent` documented.

---

### social_features.discussion_threads
- **DDL:** `apps/database/ddl/schemas/social_features/tables/discussion_threads.sql`
- **Doc:** `docs/20-architecture/schema-reference/05-social.md:320`
- **Status:** MATCH
- **Columns DDL:** 10 | **Doc:** 10 | **Match:** 10
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — `classroom_id → classrooms`, `team_id → teams`, `created_by → profiles`
- **Notes:** CHECK `(classroom_id IS NOT NULL OR team_id IS NOT NULL)` documented. Trigger `trg_discussion_threads_updated_at` documented. All 6 indexes.

---

### social_features.teacher_reports
- **DDL:** `apps/database/ddl/schemas/social_features/tables/08a-teacher_reports.sql`
- **Doc:** `docs/20-architecture/schema-reference/05-social.md:346`
- **Status:** MATCH
- **Columns DDL:** 13 | **Doc:** 13 | **Match:** 13
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — `teacher_id → profiles`, `classroom_id → classrooms`, `tenant_id → tenants`
- **Notes:** All 5 indexes documented. RLS noted in doc.

---

### social_features.scheduled_reports
- **DDL:** `apps/database/ddl/schemas/social_features/tables/08b-scheduled_reports.sql`
- **Doc:** `docs/20-architecture/schema-reference/05-social.md:372`
- **Status:** MATCH
- **Columns DDL:** 22 | **Doc:** 22 | **Match:** 22
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none — DEPRECATED fields (`time_of_day`, `is_active`) noted in both DDL and doc
- **FK documented:** YES — `teacher_id → profiles`, `classroom_id → classrooms`, `tenant_id → tenants`
- **Notes:** All 7 indexes documented including GIN on `student_ids[]` and composite `idx_scheduled_reports_cron_due`. RLS documented.

---

### social_features.shared_reports
- **DDL:** `apps/database/ddl/schemas/social_features/tables/08c-shared_reports.sql`
- **Doc:** `docs/20-architecture/schema-reference/05-social.md:408`
- **Status:** MATCH
- **Columns DDL:** 10 | **Doc:** 10 | **Match:** 10
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — `report_id → teacher_reports`, `shared_by → profiles`, `shared_with → profiles`, `tenant_id → tenants`
- **Notes:** All 7 indexes documented. RLS documented. CHECK `shared_by != shared_with` documented.

---

### social_features.peer_challenges
- **DDL:** `apps/database/ddl/schemas/social_features/tables/11-peer_challenges.sql`
- **Doc:** `docs/20-architecture/schema-reference/05-social.md:434`
- **Status:** MATCH
- **Columns DDL:** 22 | **Doc:** 22 | **Match:** 22
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — `created_by → profiles`, `module_id → educational_content.modules`, `exercise_id → educational_content.exercises`
- **Notes:** All 10 indexes (including 2 GIN) documented. Trigger `trg_peer_challenges_updated_at` documented.

---

### social_features.challenge_participants
- **DDL:** `apps/database/ddl/schemas/social_features/tables/12-challenge_participants.sql`
- **Doc:** `docs/20-architecture/schema-reference/05-social.md:471`
- **Status:** MATCH
- **Columns DDL:** 21 | **Doc:** 21 | **Match:** 21
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — `challenge_id → peer_challenges`, `user_id → profiles`
- **Notes:** All 8 indexes (including GIN) documented. Trigger `trg_challenge_participants_updated_at` documented. UNIQUE `(challenge_id, user_id)` documented.

---

### social_features.challenge_results
- **DDL:** `apps/database/ddl/schemas/social_features/tables/13-challenge_results.sql`
- **Doc:** `docs/20-architecture/schema-reference/05-social.md:505`
- **Status:** MATCH
- **Columns DDL:** 17 | **Doc:** 17 | **Match:** 17
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — `challenge_id → peer_challenges` (UNIQUE), `winner_id, second_place_id, third_place_id → profiles`
- **Notes:** All 8 indexes (including 2 GIN) documented. All CHECK constraints documented.

---

### social_features.team_vs_team_challenges
- **DDL:** `apps/database/ddl/schemas/social_features/tables/27-team_vs_team_challenges.sql`
- **Doc:** `docs/20-architecture/schema-reference/05-social.md:538`
- **Status:** MATCH
- **Columns DDL:** 36 | **Doc:** 36 | **Match:** 36
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — `team_a_captain_id → profiles`, `team_b_captain_id → profiles`, `created_by → profiles`, `module_id → educational_content.modules`
- **Notes:** All 13 indexes (including 3 GIN) documented. Trigger and RLS noted. All constraints documented.

---

### social_features.user_skill_ratings
- **DDL:** `apps/database/ddl/schemas/social_features/tables/25-user_skill_ratings.sql`
- **Doc:** `docs/20-architecture/schema-reference/05-social.md:590`
- **Status:** MATCH
- **Columns DDL:** 14 | **Doc:** 14 | **Match:** 14
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — `user_id → profiles`
- **Notes:** All 7 indexes (including 2 GIN) documented. Trigger and RLS (5 policies) documented. ELO constraints documented.

---

### social_features.guild_emblems
- **DDL:** `apps/database/ddl/schemas/social_features/tables/20-guild_emblems.sql`
- **Doc:** `docs/20-architecture/schema-reference/05-social.md:620`
- **Status:** MATCH
- **Columns DDL:** 6 | **Doc:** 6 | **Match:** 6
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none — `id SERIAL` (not UUID) correctly documented
- **FK documented:** YES — no FKs (catalog)
- **Notes:** All 3 indexes documented. Seed data (20 emblems) referenced in doc.

---

### social_features.guilds
- **DDL:** `apps/database/ddl/schemas/social_features/tables/21-guilds.sql`
- **Doc:** `docs/20-architecture/schema-reference/05-social.md:638`
- **Status:** MATCH
- **Columns DDL:** 11 | **Doc:** 11 | **Match:** 11
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none — `member_count CHECK (1-20)`, `level CHECK (1-50)` correctly documented
- **FK documented:** YES — `emblem_id → guild_emblems`, `leader_id → profiles`
- **Notes:** All 6 indexes documented. Trigger `trg_guilds_updated_at` documented. UNIQUE name, length constraints documented.

---

### social_features.guild_members
- **DDL:** `apps/database/ddl/schemas/social_features/tables/22-guild_members.sql`
- **Doc:** `docs/20-architecture/schema-reference/05-social.md:663`
- **Status:** MATCH
- **Columns DDL:** 7 | **Doc:** 7 | **Match:** 7
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none — role values `(leader, officer, member)` correctly documented
- **FK documented:** YES — `guild_id → guilds`, `user_id → profiles`
- **Notes:** UNIQUE `(user_id)` (one guild only) and UNIQUE `(guild_id, user_id)` documented. Trigger `trg_guild_members_count` documented. All 4 indexes documented.

---

### social_features.guild_join_requests
- **DDL:** `apps/database/ddl/schemas/social_features/tables/23-guild_join_requests.sql`
- **Doc:** `docs/20-architecture/schema-reference/05-social.md:683`
- **Status:** MATCH
- **Columns DDL:** 7 | **Doc:** 7 | **Match:** 7
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — `guild_id → guilds`, `requester_id → profiles`, `responded_by → profiles`
- **Notes:** Partial UNIQUE index `idx_guild_join_requests_unique_pending` on `(guild_id, requester_id) WHERE status='pending'` documented. All 5 indexes documented.

---

### social_features.guild_missions
- **DDL:** `apps/database/ddl/schemas/social_features/tables/24-guild_missions.sql`
- **Doc:** `docs/20-architecture/schema-reference/05-social.md:701`
- **Status:** MATCH
- **Columns DDL:** 12 | **Doc:** 12 | **Match:** 12
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none — `guild_mission_type` ENUM with 6 values correctly documented
- **FK documented:** YES — `guild_id → guilds`
- **Notes:** CHECK `expires_at > starts_at` documented. All 5 indexes documented.

---

### social_features.guild_mission_contributions
- **DDL:** `apps/database/ddl/schemas/social_features/tables/24-guild_missions.sql` (second table in same file)
- **Doc:** `docs/20-architecture/schema-reference/05-social.md:727`
- **Status:** MATCH
- **Columns DDL:** 4 | **Doc:** 4 | **Match:** 4
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none
- **FK documented:** YES — `mission_id → guild_missions`, `user_id → profiles`
- **Notes:** UNIQUE `(mission_id, user_id, contributed_at)` documented. All 3 indexes documented.

---

### social_features.user_reports
- **DDL:** `apps/database/ddl/schemas/social_features/tables/28-user_reports.sql`
- **Doc:** `docs/20-architecture/schema-reference/05-social.md:743`
- **Status:** MATCH
- **Columns DDL:** 17 | **Doc:** 17 | **Match:** 17
- **Missing from docs:** none
- **Missing from DDL:** none
- **Type mismatches:** none — all CHECK constraints for report_type, reason, status, priority, action_taken correctly documented
- **FK documented:** YES — `reporter_id → profiles`, `reported_user_id → profiles`, `assigned_to → profiles`, `resolved_by → profiles`
- **Notes:** All 10 indexes documented including partial composite index for moderation queue. Polymorphic constraints documented.

---

## SUMMARY TABLE

### gamification_system (19 tables in DDL + 2 cross_schema)

| # | Table | DDL | Docs | Status | Gaps |
|---|-------|-----|------|--------|------|
| 1 | user_stats | 01-user_stats.sql | line 187 | MATCH | — |
| 2 | user_ranks | 02-user_ranks.sql | line 235 | MATCH | — |
| 3 | achievements | 03-achievements.sql | line 317 | MATCH | — |
| 4 | user_achievements | 04-user_achievements.sql | line 352 | MATCH | — |
| 5 | ml_coins_transactions | 05-ml_coins_transactions.sql | line 383 | MATCH | — |
| 6 | mission_templates | 05a-mission_templates.sql | line 411 | MATCH | — |
| 7 | missions | 06-missions.sql | line 445 | MATCH | — |
| 8 | comodines_inventory | 07-comodines_inventory.sql | line 475 | MATCH | — |
| 9 | leaderboard_metadatas | 09-leaderboard_metadata.sql | line 585 | MATCH | — |
| 10 | achievement_categories | 10-achievement_categories.sql | line 297 | MATCH | — |
| 11 | active_boosts | 11-active_boosts.sql | line 549 | MATCH | — |
| 12 | inventory_transactions | 12-inventory_transactions.sql | line 568 | PARTIAL | item_id FK missing in DDL |
| 13 | maya_ranks | 13-maya_ranks.sql | line 264 | MATCH | — |
| 14 | comodin_usage_logs | 14-comodin_usage_log.sql | line 502 | MATCH | — |
| 15 | comodin_usage_trackings | 15-comodin_usage_tracking.sql | line 522 | MATCH | — |
| 16 | shop_categories | 17-shop_categories.sql | line 600 | MATCH | — |
| 17 | shop_items | 18-shop_items.sql | line 622 | MATCH | — |
| 18 | user_purchases | 19-user_purchases.sql | line 659 | MATCH | — |
| 19 | user_equipped_items | 21-user_equipped_items.sql | line 685 | MATCH | — |
| 20 | comodin_uses | _cross_schema/21-comodin_uses.sql | line 712 | MATCH | — |
| 21 | classroom_missions | _cross_schema/16-classroom_missions.sql | NOT FOUND | MISSING_FROM_DOCS | Entire table undocumented |
| — | xp_transactions | NOT FOUND | line 15 | MISSING_FROM_DDL | Legacy doc, no DDL |
| — | levels | NOT FOUND | line 37 | MISSING_FROM_DDL | Legacy doc, no DDL |
| — | rank_definitions | NOT FOUND | line 56 | MISSING_FROM_DDL | Superseded by maya_ranks |
| — | student_gamification | NOT FOUND | line 79 | MISSING_FROM_DDL | Superseded by user_stats |
| — | gamification_config | NOT FOUND | line 106 | MISSING_FROM_DDL | Planned, not implemented |
| — | xp_multipliers | NOT FOUND | line 130 | MISSING_FROM_DDL | Covered by active_boosts |
| — | daily_xp_limits | NOT FOUND | line 147 | MISSING_FROM_DDL | Partial in user_stats |
| — | streak_records | NOT FOUND | line 165 | MISSING_FROM_DDL | Partial in user_stats |

**gamification_system Summary:**
- MATCH: 19 tables (90%)
- PARTIAL: 1 table (5%) — inventory_transactions (missing FK)
- MISSING_FROM_DOCS: 1 table (5%) — classroom_missions
- MISSING_FROM_DDL: 8 entries — legacy/superseded documentation sections

---

### social_features (29 DDL files)

| # | Table | DDL | Docs | Status | Gaps |
|---|-------|-----|------|--------|------|
| 1 | friendships | 01-friendships.sql | line 215 | MATCH | — |
| 2 | schools | 02-schools.sql | line 11 | MATCH | — |
| 3 | classrooms | 03-classrooms.sql | line 51 | MATCH | — |
| 4 | classroom_members | 04-classroom_members.sql | line 89 | MATCH | — |
| 5 | teams | 05-teams.sql | line 155 | PARTIAL | 15 columns undocumented; status ENUM doesn't exist; column rename creator_id vs created_by; classroom_id nullability discrepancy |
| 6 | team_members | 06-team_members.sql | line 176 | PARTIAL | student_id vs user_id rename; tenant_id in doc doesn't exist in DDL; role values differ; left_at undocumented |
| 7 | team_challenges | 07-team_challenges.sql | line 193 | PARTIAL | Structural mismatch — DDL is a junction table, doc describes team-vs-team battle table |
| 8 | teacher_reports | 08a-teacher_reports.sql | line 346 | MATCH | — |
| 9 | scheduled_reports | 08b-scheduled_reports.sql | line 372 | MATCH | — |
| 10 | shared_reports | 08c-shared_reports.sql | line 408 | MATCH | — |
| 11 | user_activities | 09-user_activities.sql | line 302 | MATCH | — |
| 12 | friend_requests | 10-friend_requests.sql | line 232 | MATCH | — |
| 13 | peer_challenges | 11-peer_challenges.sql | line 434 | MATCH | — |
| 14 | challenge_participants | 12-challenge_participants.sql | line 471 | MATCH | — |
| 15 | challenge_results | 13-challenge_results.sql | line 505 | MATCH | — |
| 16 | guild_emblems | 20-guild_emblems.sql | line 620 | MATCH | — |
| 17 | guilds | 21-guilds.sql | line 638 | MATCH | — |
| 18 | guild_members | 22-guild_members.sql | line 663 | MATCH | — |
| 19 | guild_join_requests | 23-guild_join_requests.sql | line 683 | MATCH | — |
| 20 | guild_missions | 24-guild_missions.sql | line 701 | MATCH | — |
| 21 | guild_mission_contributions | 24-guild_missions.sql | line 727 | MATCH | — |
| 22 | user_skill_ratings | 25-user_skill_ratings.sql | line 590 | MATCH | — |
| 23 | user_blocks | 26-user_blocks.sql | line 265 | MATCH | — |
| 24 | team_vs_team_challenges | 27-team_vs_team_challenges.sql | line 538 | MATCH | — |
| 25 | user_reports | 28-user_reports.sql | line 743 | MATCH | — |
| 26 | teacher_classrooms | teacher_classrooms.sql | line 120 | MATCH | — |
| 27 | assignment_classrooms | assignment_classrooms.sql | line 138 | MATCH | — |
| 28 | social_interactions | social_interactions.sql | line 284 | MATCH | — |
| 29 | discussion_threads | discussion_threads.sql | line 320 | MATCH | — |

**social_features Summary:**
- MATCH: 26 tables (90%)
- PARTIAL: 3 tables (10%) — teams (severe), team_members (moderate), team_challenges (structural)
- MISSING_FROM_DOCS: 0
- MISSING_FROM_DDL: 0

---

## AGGREGATE FINDINGS

### Overall Health Score (DDL ↔ Docs Alignment)
| Schema | Tables | MATCH | PARTIAL | MISSING_FROM_DOCS | MISSING_FROM_DDL |
|--------|--------|-------|---------|-------------------|------------------|
| gamification_system | 21 DDL | 19 (90%) | 1 (5%) | 1 (5%) | 8 (legacy) |
| social_features | 29 DDL | 26 (90%) | 3 (10%) | 0 | 0 |
| **TOTAL** | **50 DDL** | **45 (90%)** | **4 (8%)** | **1 (2%)** | **8 legacy** |

---

## CRITICAL GAPS (Action Required)

### GAP-1: gamification_system.classroom_missions — MISSING_FROM_DOCS
- **Severity:** HIGH
- **Impact:** 18-column table with full RLS, trigger, 6 indexes entirely absent from schema-reference
- **Action:** Add `gamification_system.classroom_missions` section to `docs/20-architecture/schema-reference/04-gamification.md`
- **DDL location:** `apps/database/ddl/schemas/gamification_system/tables/_cross_schema/16-classroom_missions.sql`

### GAP-2: gamification_system.inventory_transactions — Missing FK
- **Severity:** MEDIUM
- **Impact:** `item_id UUID NOT NULL` has no FK constraint in DDL. No referential integrity to shop_items.
- **Action:** Add FK `item_id → gamification_system.shop_items(id)` to DDL (or document as intentional denormalization)
- **DDL location:** `apps/database/ddl/schemas/gamification_system/tables/12-inventory_transactions.sql`

### GAP-3: social_features.teams — Severe Documentation Drift
- **Severity:** HIGH
- **Impact:** Doc covers only 10/25 columns. Critical discrepancies: `status` ENUM documented but doesn't exist in DDL; column `creator_id` documented as `created_by`; `classroom_id` nullability conflict; 15 columns undocumented.
- **Action:** Update `social_features.teams` section in `docs/20-architecture/schema-reference/05-social.md` to reflect actual DDL (25 columns).
- **DDL location:** `apps/database/ddl/schemas/social_features/tables/05-teams.sql`

### GAP-4: social_features.team_members — Column Drift
- **Severity:** MEDIUM
- **Impact:** `student_id` (doc) vs `user_id` (DDL) column name discrepancy. `tenant_id` documented but doesn't exist in DDL. Role values differ (`leader` vs `owner`). `left_at` undocumented.
- **Action:** Update `social_features.team_members` section in schema-reference docs.
- **DDL location:** `apps/database/ddl/schemas/social_features/tables/06-team_members.sql`

### GAP-5: social_features.team_challenges — Structural Mismatch
- **Severity:** HIGH
- **Impact:** DDL is a simple junction table (`team_id, challenge_id, status, score`). Doc describes a team-vs-team battle table with scores, winners, start/end times — a completely different structure. The documented structure may actually refer to `team_vs_team_challenges` (DDL file 27).
- **Action:** Rewrite `social_features.team_challenges` doc to reflect DDL junction table structure. Clarify relationship with `team_vs_team_challenges`.
- **DDL location:** `apps/database/ddl/schemas/social_features/tables/07-team_challenges.sql`

---

## LEGACY DOCUMENTATION SECTIONS (Low Priority)

The following sections in `04-gamification.md` document tables that **do not exist in DDL** and represent superseded or unimplemented designs. These should be marked as legacy or removed to avoid confusion:

| Section | Doc Line | Replacement in DDL |
|---------|----------|--------------------|
| xp_transactions | 15 | Partially in user_stats (weekly_xp, monthly_xp) |
| levels | 37 | level INTEGER in user_stats |
| rank_definitions | 56 | maya_ranks table |
| student_gamification | 79 | user_stats table |
| gamification_config | 106 | Not implemented |
| xp_multipliers | 130 | active_boosts table |
| daily_xp_limits | 147 | ml_coins_earned_today in user_stats |
| streak_records | 165 | current_streak/max_streak in user_stats |

**Recommendation:** Add a "Legacy / Unimplemented" section header or delete these entries to prevent confusion during onboarding and development.

---

## METHODOLOGY NOTES

- Column counts exclude DDL comments, whitespace and constraint-only lines; they count only actual column definitions
- "MATCH" requires column names, types, nullability, defaults, and FKs to all be consistent (minor description wording differences are ignored)
- "PARTIAL" means at least one structural discrepancy exists (wrong name, wrong type, missing FK, or extra columns in one source)
- Legacy documentation sections (documented but no DDL) are noted separately from true MISSING_FROM_DDL gaps
- Cross-schema tables in `_cross_schema/` subdirectory are treated as DDL-present for audit purposes
- The `gamification_system.comodin_uses` is in `_cross_schema/` and IS documented — counted as MATCH
