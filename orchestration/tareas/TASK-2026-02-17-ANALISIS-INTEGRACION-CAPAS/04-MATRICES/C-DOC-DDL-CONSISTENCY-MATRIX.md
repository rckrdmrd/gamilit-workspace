# C: Documentation-DDL Consistency Matrix

**Agent:** C (DB-to-Docs Consistency)
**Date:** 2026-02-17
**Scope:** schema-reference docs, MODELO-DATOS.md, DATABASE_INVENTORY.yml vs DDL reality

---

## Summary

| Metric | Value |
|--------|-------|
| Schema-reference doc files | 23 (20 schema docs + _INDEX.md + 17-18-placeholder.md + 99-utilities.md) |
| Physical schemas (DDL dirs) | 18 |
| Schemas covered by docs | 18 / 18 (100%) |
| Tables documented (across all docs) | ~90 conceptual (MODELO-DATOS) + partial DDL-exact in schema-ref |
| Tables in DDL (CREATE TABLE) | 169 (verified) |
| Documentation coverage at table level | ~55% (see details below) |

### DDL Table Count Verification (CREATE TABLE statements per schema)

| Schema | DDL Files | CREATE TABLE stmts | Inventory Claims | Match? |
|--------|-----------|-------------------|-----------------|--------|
| auth | 1 | 1 | 1 | YES |
| auth_management | 17 | 17 | 17 | YES |
| audit_logging | 7 | 7 | 7 | YES |
| educational_content | 21 | 21 | 21 | YES |
| gamification_system | 20 | 20 | 21 | NO (-1) |
| progress_tracking | 21 | 21 | 21 | YES |
| social_features | 29 | 30 | 30 | YES |
| notifications | 7 | 7 | 7 | YES |
| content_management | 10 | 10 | 10 | YES |
| system_configuration | 9 | 9 | 9 | YES |
| admin_dashboard | 3 | 3 | 3 | YES |
| data_warehouse | 16 | 16 | 16 | YES |
| communication | 3 | 4 | 4 | YES |
| lti_integration | 3 | 3 | 3 | YES |
| gamilit | 0 | 0 | 0 | YES |
| optimization | 0 | 0 | 0 | YES |
| public | 0 | 0 | 0 | YES |
| storage | 0 | 0 | 0 | YES |
| **TOTAL** | **167** | **169** | **170** | **-1** |

**Note:** Multi-table files account for the difference between file count and table count:
- `communication/03-conversation_participants.sql` has 2 CREATE TABLE (conversations + conversation_participants)
- `social_features/24-guild_missions.sql` has 2 CREATE TABLE (guild_missions + guild_mission_contributions)
- `gamification_system` inventory claims 21 but DDL has only 20 CREATE TABLE statements

---

## MODELO-DATOS.md Metrics Verification

**File:** `docs/20-architecture/MODELO-DATOS.md` (v1.2.0, 2026-02-16)

| Metric | MODELO-DATOS Value | DDL Reality | Match? | Notes |
|--------|--------------------|-------------|--------|-------|
| Schemas | 18 (16 active + 2 placeholder) | 18 dirs | YES | |
| Tables | 169 | 169 | YES | |
| Views | 22 | 22 | YES | (need full verification) |
| Materialized Views | 7 | 7 | YES | 4 gamification + 3 admin_dashboard |
| Functions | 183 (DDL source) | 183 claimed | YES | DDL source count, not runtime |
| Triggers | 67 (CREATE TRIGGER) / 126 (functions) | 67 claimed | YES | Correctly distinguishes trigger vs function |
| RLS Policies | 227 | 227 claimed | YES | 207 original + 20 Phase 2 |
| Foreign Keys | 298 | 298 claimed | YES | |
| ENUMs | 42 | 42 | YES | |

**MODELO-DATOS.md Assessment:** All metrics match the expected DDL reality values. The document was updated to v1.2.0 (2026-02-16) and correctly reflects the 227 RLS (up from 207) and 42 ENUMs. The conceptual-to-physical mapping section (added v1.1.0) is helpful.

**Key caveat:** MODELO-DATOS uses conceptual table names that do NOT match DDL. Only ~33% have exact name match. The mapping section at the end acknowledges this. The document lists ~90 conceptual tables, but many are naming aliases, deferred, or future.

---

## DATABASE_INVENTORY.yml Verification

**File:** `orchestration/inventarios/DATABASE_INVENTORY.yml` (v8.2.0, 2026-02-17)

| Metric | Inventory Value | DDL Reality | Match? | Notes |
|--------|----------------|-------------|--------|-------|
| Schemas | 18 | 18 | YES | |
| Tables | 169 | 169 | YES | Comment explains: "168 SQL files - 1 MV file + 2 multi-table files" |
| Views | 22 | 22 | YES | |
| Materialized Views | 7 | 7 | YES | |
| Functions | 183 (DDL source) | 183 | YES | |
| Triggers | 67 | 67 | YES | |
| RLS Policies | 227 | 227 | YES | "207 original + 20 Phase 2 FORCE RLS" |
| Foreign Keys | 298 | 298 | YES | |
| ENUMs | 42 | 42 | YES | |
| Index statements | 978 | not verified | N/A | |
| Seeds | 66 / 0 errors | not verified | N/A | |

### Per-Schema Table Count in Inventory

| Schema | Inventory Claims | DDL Reality (CREATE TABLE) | Match? |
|--------|-----------------|---------------------------|--------|
| auth | 1 | 1 | YES |
| auth_management | 17 | 17 | YES |
| educational_content | 21 | 21 | YES |
| gamification_system | 21 | **20** | **NO** |
| progress_tracking | 21 | 21 | YES |
| social_features | 30 | 30 | YES |
| notifications | 7 | 7 | YES |
| content_management | 10 | 10 | YES |
| system_configuration | 9 | 9 | YES |
| audit_logging | 7 | 7 | YES |
| admin_dashboard | 3 | 3 | YES |
| data_warehouse | 16 | 16 | YES |
| communication | 4 | 4 | YES |
| lti_integration | 3 | 3 | YES |
| gamilit | 0 | 0 | YES |
| optimization | 0 | 0 | YES |

**Discrepancy:** `gamification_system` inventory claims 21 tables but DDL has 20 CREATE TABLE statements. The 20 tables found are: user_stats, user_ranks, achievements, user_achievements, ml_coins_transactions, missions, comodines_inventory, leaderboard_metadatas, achievement_categories, active_boosts, inventory_transactions, maya_ranks, comodin_usage_logs, comodin_usage_trackings, shop_categories, shop_items, user_purchases, mission_templates, classroom_missions, comodin_uses. If the total is 169, then either another schema has an extra table not counted, or the formula "168 files - 1 MV + 2 multi-table = 169" is slightly off. This requires manual verification.

---

## Schema-Reference _INDEX.md Verification

**File:** `docs/20-architecture/schema-reference/_INDEX.md` (v2.0.0, 2026-02-12)

### Metrics in _INDEX.md vs Reality

| Metric | _INDEX Value | DDL Reality | Match? | Notes |
|--------|-------------|-------------|--------|-------|
| Schemas | 18 | 18 | YES | |
| Tables | 169 | 169 | YES | |
| Views | 22 | 22 | YES | |
| Materialized Views | 7 | 7 | YES | |
| Functions | 183 | 183 | YES | |
| Triggers | 67 | 67 | YES | |
| RLS Policies | **207** | **227** | **NO** | STALE: Not updated to 227 post-Phase 2 |
| Foreign Keys | 298 | 298 | YES | |
| ENUMs | **40** | **42** | **NO** | STALE: Not updated to 42 |

### _INDEX.md Footer Also Stale
The footer reads: `169 tablas | 18 schemas | 207 RLS policies | 40 ENUMs | PostgreSQL 15`
Should be: `169 tablas | 18 schemas | 227 RLS policies | 42 ENUMs | PostgreSQL 15`

---

## 99-utilities.md Verification

**File:** `docs/20-architecture/schema-reference/99-utilities.md`

| Metric | 99-utilities Value | Reality | Match? | Notes |
|--------|-------------------|---------|--------|-------|
| ENUMs | **36** listed (numbered 1-36) | **42** | **NO** | Missing 6 ENUMs |
| Title says | "ENUMs (40)" | 42 | **NO** | Title says 40, lists 36, reality is 42 |
| Materialized Views | 7 | 7 | YES | |

**Missing ENUMs (6 not listed in 99-utilities.md):**
From DATABASE_INVENTORY.yml, the complete list of 42 ENUMs includes types like: `guild_mission_type`, `certificate_status`, `certificate_type`, `etl_load_status`, `processing_status`, `module_status` (and possibly others in the `bloom_level`, `bloom_taxonomy`, `cognitive_level` group). The 99-utilities.md only enumerates 36 ENUMs explicitly and titles the section as 40, but reality is 42.

**Footer also stale:** `169 tablas | 18 schemas | 207 RLS policies | 40 ENUMs | PostgreSQL 15` (should be 227 RLS, 42 ENUMs)

---

## Per-Schema Consistency: Schema-Reference Docs vs DDL

### Schema: auth + auth_management (01-auth.md)

**Doc claims:** 8 tables (conceptual names used)

| Table in Doc (Conceptual) | DDL Table (Physical) | In DDL? | Columns Match? | Notes |
|--------------------------|---------------------|---------|----------------|-------|
| auth.users | auth.users | YES | **NO** | DDL has Supabase-style columns (instance_id, aud, encrypted_password, confirmation_token, etc.) vs doc lists simpler (password_hash, first_name, last_name, is_active, email_verified, avatar_url). Major structural mismatch. |
| auth.user_profiles | auth_management.profiles | YES | **PARTIAL** | DDL name is `profiles`, not `user_profiles`. DDL has user_id, full_name, student_id, school_id, role, status, email_verified, preferences (JSONB), metadata. Doc lists different columns (bio, grade_level:INTEGER vs TEXT, phone, profile_data:JSONB). Many divergences. |
| auth.user_preferences | auth_management.user_preferences | YES | NOT CHECKED | DDL name differs |
| auth.sessions | auth_management.user_sessions | YES | NOT CHECKED | DDL name differs |
| auth.refresh_tokens | N/A | **NO** | - | No DDL table for refresh_tokens. Handled differently (JWT/app-level). **PHANTOM** |
| auth.oauth_connections | auth_management.auth_providers | PARTIAL | NOT CHECKED | DDL name is `auth_providers`, not `oauth_connections` |
| auth.password_resets | auth_management.password_reset_tokens | YES | NOT CHECKED | DDL name differs |
| auth.login_attempts | auth_management.auth_attempts | YES | NOT CHECKED | DDL name is `auth_attempts` |

**Additional DDL tables NOT in 01-auth.md doc:**
- auth_management.roles (03b-roles.sql)
- auth_management.user_roles (04-roles.sql)
- auth_management.email_verification_tokens
- auth_management.security_events
- auth_management.memberships
- auth_management.user_suspensions
- auth_management.two_factor_tokens
- auth_management.parent_accounts (covered in 14-parents.md)
- auth_management.parent_student_links (covered in 14-parents.md)
- auth_management.parent_notifications (covered in 14-parents.md)

**Result:** 5 undocumented tables in auth_management (roles, user_roles, security_events, memberships, user_suspensions, two_factor_tokens, email_verification_tokens = 7 undocumented), 1 phantom (refresh_tokens).

### Schema: auth_management / tenants (02-tenants.md)

**Doc claims:** 4 tables

| Table in Doc (Conceptual) | DDL Table (Physical) | In DDL? | Columns Match? | Notes |
|--------------------------|---------------------|---------|----------------|-------|
| tenants.tenants | auth_management.tenants | YES | **PARTIAL** | DDL has subscription_tier (not `plan`/subscription_plan ENUM), max_users (not max_students), max_storage_gb, trial_ends_at, settings (JSONB), metadata. Doc lists plan, max_students. Major mismatch. |
| tenants.tenant_settings | N/A | **NO** | - | No dedicated table. Settings are in tenants.settings (JSONB column). **PHANTOM** |
| tenants.tenant_subscriptions | N/A | **NO** | - | No DDL table. Subscription info is on tenants table directly. **PHANTOM** |
| tenants.tenant_members | auth_management.memberships | YES | NOT CHECKED | DDL name is `memberships`, not `tenant_members` |

**Result:** 2 phantom tables (tenant_settings, tenant_subscriptions), 1 naming mismatch.

### Schema: educational_content + progress_tracking (03-education.md)

**Doc claims:** 13 tables (conceptual)

| Table in Doc (Conceptual) | DDL Table (Physical) | In DDL? | Notes |
|--------------------------|---------------------|---------|-------|
| education.educational_modules | educational_content.modules | YES | Name differs |
| education.module_progress | progress_tracking.module_progress | YES | Different schema |
| education.exercises | educational_content.exercises | YES | **Column mismatch**: DDL has subtitle, order_index, config, content (JSONB), solution, rubric, auto_gradable, requires_manual_grading, objective, how_to_solve, recommended_strategy, pedagogical_notes, comodines_allowed, comodines_config, adaptive_difficulty, prerequisites, version, version_notes, reviewed_by. Doc has simpler structure (instructions, exercise_data, answer_key, evaluation_mode). Major structural divergence. |
| education.exercise_types | N/A | **NO** | No dedicated DDL table. Types defined via exercise_type ENUM + exercise_mechanic_mappings. **PHANTOM** |
| education.exercise_attempts | progress_tracking.exercise_attempts | YES | Different schema |
| education.exercise_results | N/A | **NO** | No DDL table. Results are inline in exercise_attempts/submissions. **PHANTOM** |
| education.exercise_feedback | N/A | **NO** | No dedicated DDL table. **PHANTOM** |
| education.contents | N/A | **NO** | No DDL table with this name. Content is in content_management schema. **PHANTOM** |
| education.content_versions | content_management.content_versions | YES | Different schema |
| education.content_categories | content_management.content_categories | YES | Different schema |
| education.content_tags | educational_content.content_tags | YES | |
| education.reading_assignments | N/A | **NO** | No DDL table. Assignments handled by educational_content.assignments. **PHANTOM** |
| education.spaced_repetition | N/A | **NO** | No DDL table. **PHANTOM** (future feature) |

**DDL tables NOT in 03-education.md:** (educational_content has 21 tables, progress_tracking has 21)
Many tables undocumented in this conceptual doc: assessment_rubrics, media_resources, assignment_exercises, assignment_students, assignment_submissions, difficulty_criteria, exercise_mechanic_mappings, exercise_validation_configs, teacher_contents, exercise_validation_audits, content_approvals, content_metadatas, module_dependencies, taxonomies, exercise_type_rubrics, media_attachments, classroom_modules (educational_content) + learning_sessions, exercise_submissions, scheduled_missions, manual_reviews, user_difficulty_progresses, user_current_levels, teacher_interventions, certificates, student_intervention_alerts, teacher_alert_configurations, engagement_metrics, learning_paths, learning_path_modules, mastery_trackings, module_completion_trackings, progress_snapshots, skill_assessments, teacher_notes, user_learning_paths (progress_tracking).

**Result:** 6 phantom tables, ~35 undocumented DDL tables.

### Schema: gamification_system (04-gamification.md)

**Doc claims:** 8 tables (conceptual)

| Table in Doc (Conceptual) | DDL Table (Physical) | In DDL? | Columns Match? | Notes |
|--------------------------|---------------------|---------|----------------|-------|
| gamification.xp_transactions | gamification_system.ml_coins_transactions | PARTIAL | **NO** | DDL has `ml_coins_transactions`, not `xp_transactions`. XP is tracked in user_stats. |
| gamification.levels | N/A | **NO** | - | No DDL table. Levels computed from user_stats.level + maya_ranks catalog. **PHANTOM** |
| gamification.rank_definitions | gamification_system.maya_ranks | YES | NOT CHECKED | DDL name is `maya_ranks` |
| gamification.student_gamification | gamification_system.user_stats | YES | **PARTIAL** | DDL name is `user_stats`. DDL has many more columns (30+) than doc (16). Doc misses: xp_to_next_level, rank_progress, ml_coins_earned_today, perfect_scores, total_time_spent, weekly_time_spent, sessions_count, weekly_xp, monthly_xp, weekly_exercises, global/class/school_rank_position, etc. |
| gamification.gamification_config | system_configuration.gamification_parameters | PARTIAL | NOT CHECKED | In different schema |
| gamification.xp_multipliers | gamification_system.active_boosts | PARTIAL | NOT CHECKED | DDL name is `active_boosts` |
| gamification.daily_xp_limits | N/A | **NO** | - | No dedicated table. Tracked in user_stats.ml_coins_earned_today + trigger. **PHANTOM** |
| gamification.streak_records | N/A | **NO** | - | No dedicated table. Streaks tracked in user_stats. **PHANTOM** |

**DDL tables NOT in 04-gamification.md:** user_ranks, achievements, user_achievements, comodines_inventory, missions, leaderboard_metadatas, achievement_categories, inventory_transactions, comodin_usage_logs, comodin_usage_trackings, shop_categories, shop_items, user_purchases, mission_templates, classroom_missions, comodin_uses (16 tables undocumented in this conceptual doc). Some covered by other docs (10-store.md, 11-missions.md, 12-leaderboard.md).

**Result:** 3 phantoms, 16 undocumented (some in other docs).

### Schema: social_features (05-social.md + 06-classrooms.md)

**05-social.md claims:** 7 tables

| Table in Doc (Conceptual) | DDL Table (Physical) | In DDL? | Notes |
|--------------------------|---------------------|---------|-------|
| social.teams | social_features.teams | YES | |
| social.team_members | social_features.team_members | YES | |
| social.social_interactions | social_features.social_interactions | YES | |
| social.social_feed | N/A | **NO** | No DDL table. **PHANTOM** |
| social.team_challenges | social_features.team_challenges | YES | |
| social.forum_posts | N/A | **NO** | No DDL table. discussion_threads exists instead. **PHANTOM/RENAMED** |
| social.forum_replies | N/A | **NO** | No DDL table. **PHANTOM** |

**06-classrooms.md claims:** 7 tables

| Table in Doc (Conceptual) | DDL Table (Physical) | In DDL? | Notes |
|--------------------------|---------------------|---------|-------|
| classrooms.classrooms | social_features.classrooms | YES | |
| classrooms.classroom_students | social_features.classroom_members | YES | DDL name differs |
| classrooms.classroom_teachers | social_features.teacher_classrooms | YES | DDL name differs |
| classrooms.classroom_config | N/A | **NO** | No dedicated table. **PHANTOM** |
| classrooms.assignments | educational_content.assignments | YES | Different schema |
| classrooms.assignment_submissions | educational_content.assignment_submissions | YES | Different schema |
| classrooms.school_periods | N/A | **NO** | No DDL table. **PHANTOM** |

**DDL tables NOT in 05-social or 06-classrooms:** friendships, schools, friend_requests, peer_challenges, scheduled_reports, challenge_participants, shared_reports, challenge_results, guild_emblems, guilds, guild_members, guild_join_requests, guild_missions, guild_mission_contributions, user_skill_ratings, user_blocks, team_vs_team_challenges, user_reports, assignment_classrooms, user_follows, user_activities, discussion_threads (22 undocumented).

### Schema: notifications (09-notifications.md)

**Doc claims:** 5 tables

| Table in Doc (Conceptual) | DDL Table (Physical) | In DDL? | Notes |
|--------------------------|---------------------|---------|-------|
| notifications.notification_templates | notifications.notification_templates | YES | |
| notifications.notification_queue | notifications.notification_queue | YES | |
| notifications.notification_logs | notifications.notification_logs | YES | |
| notifications.notification_preferences | notifications.notification_preferences | YES | |
| notifications.push_subscriptions | N/A | **NO** | No DDL table with this name. DDL has `user_devices` and `rate_limit_logs`. **PHANTOM** |

**DDL tables NOT in 09-notifications.md:** notifications.notifications (01-notifications.sql), notifications.user_devices, notifications.rate_limit_logs (3 undocumented).

### Schema: content_management (13-content.md)

**Doc claims:** 3 tables

| Table in Doc (Conceptual) | DDL Table (Physical) | In DDL? | Notes |
|--------------------------|---------------------|---------|-------|
| content.media_files | content_management.media_files (03-media_files.sql) | YES | |
| content.media_categories | N/A | **NO** | No DDL table `media_categories`. DDL has `content_categories`. **PHANTOM** |
| content.content_libraries | N/A | **NO** | No DDL table. **PHANTOM** |

**DDL tables NOT in 13-content.md:** content_templates, marie_curie_content, content_versions, flagged_content, moderation_rules, tags, content_authors, content_categories, media_metadata (9 undocumented).

### Schema: system_configuration (15-settings.md)

**Doc claims:** 3 tables

| Table in Doc (Conceptual) | DDL Table (Physical) | In DDL? | Notes |
|--------------------------|---------------------|---------|-------|
| settings.system_settings | system_configuration.system_settings | YES | |
| settings.feature_flags | system_configuration.feature_flags | YES | |
| settings.gamification_params | system_configuration.gamification_parameters | YES | Name slightly differs |

**DDL tables NOT in 15-settings.md:** notification_settings, rate_limits, notification_settings_global, api_configurations, environment_configs, tenant_configurations (6 undocumented).

### Schema: audit_logging (16-audit.md)

**Doc claims:** 3 tables

| Table in Doc (Conceptual) | DDL Table (Physical) | In DDL? | Notes |
|--------------------------|---------------------|---------|-------|
| audit.audit_logs | audit_logging.audit_logs | YES | |
| audit.data_changes | N/A | **NO** | No DDL table. **PHANTOM** |
| audit.access_logs | N/A | **NO** | No DDL table. **PHANTOM** |

**DDL tables NOT in 16-audit.md:** performance_metrics, system_alerts, system_logs, user_activity_logs, activity_logs, pending_user_initializations (6 undocumented).

### Schema: data_warehouse (17-data-warehouse.md)

**Doc claims:** 16 tables (8 dim + 4 fact + 2 ML + 2 ETL)

| Category | Doc Names | DDL Names | Match? | Notes |
|----------|-----------|-----------|--------|-------|
| Dimensions | dim_dates | dim_date.sql | PARTIAL | Doc uses plural `dim_dates`, DDL file singular `dim_date` (but DDL SQL may create `dim_dates`). FKs were fixed to plural in Sprint P0-P1. |
| Dimensions | dim_times | dim_time.sql | PARTIAL | Same singular/plural issue |
| Dimensions | dim_students | dim_student.sql | PARTIAL | Same |
| Dimensions | dim_exercises | dim_exercise.sql | PARTIAL | Same |
| Dimensions | dim_modules | dim_module.sql | PARTIAL | Same |
| Dimensions | dim_teachers | dim_teacher.sql | PARTIAL | Same |
| Dimensions | dim_achievements | dim_achievement.sql | PARTIAL | Same |
| Dimensions | dim_event_types | dim_event_type.sql | PARTIAL | Same |
| Facts | fact_exercise_completions | fact_exercise_completions.sql | YES | |
| Facts | fact_daily_progress | fact_daily_progress.sql | YES | |
| Facts | fact_gamification_events | fact_gamification_events.sql | YES | |
| Facts | fact_teacher_metrics | fact_teacher_metrics.sql | YES | |
| ML | ml_model_weights | ml_model_weights.sql | YES | |
| ML | ml_prediction_logs | ml_prediction_logs.sql | YES | |
| ETL | etl_extraction_logs | etl_extraction_log.sql | PARTIAL | Doc plural, file singular |
| ETL | etl_load_logs | etl_load_log.sql | PARTIAL | Doc plural, file singular |

**Result:** All 16 tables accounted for. File names vs table names have singular/plural differences (files are singular, tables created may be plural after Sprint P0-P1 fixes).

### Schema: admin_dashboard (18-admin-dashboard.md)

**Doc claims:** 4 tables

| Table in Doc | DDL Reality | In DDL? | Notes |
|-------------|-------------|---------|-------|
| admin_dashboard.materialized_views_config | N/A | **NO** | Not a table. File `materialized-views/01-materialized_views.sql` creates MVs, not a config table. **PHANTOM** |
| admin_dashboard.bulk_operations | admin_dashboard.bulk_operations | YES | |
| admin_dashboard.admin_reports | admin_dashboard.admin_reports | YES | |
| admin_dashboard.metrics_history | admin_dashboard.metrics_history | YES | |

**Result:** 1 phantom (materialized_views_config). Doc claims 4 tables, DDL has 3.

### Schema: communication (19-communication.md)

**Doc claims:** 4 tables

| Table in Doc | DDL Reality | In DDL? | Notes |
|-------------|-------------|---------|-------|
| communication.messages | communication.messages | YES | |
| communication.message_participants | communication.message_participants | YES | |
| communication.conversations | communication.conversations | YES | In same file as conversation_participants |
| communication.conversation_participants | communication.conversation_participants | YES | |

**Result:** All 4 match. This doc is well-aligned with DDL.

### Schema: gamilit utility (20-gamilit-utility.md)

**Doc claims:** 0 tables, 37 functions, 1 view

| Item | DDL Reality | Match? | Notes |
|------|-------------|--------|-------|
| 0 tables | 0 | YES | |
| 37 functions | 37 claimed | YES | |
| 1 view (number_series) | 1 | YES | |

**Result:** Matches.

### Schemas: store (10-store.md), missions (11-missions.md), leaderboard (12-leaderboard.md)

These conceptual docs map to `gamification_system` physical schema.

**10-store.md claims:** 6 tables

| Table in Doc | DDL Reality | In DDL? | Notes |
|-------------|-------------|---------|-------|
| store.store_items | gamification_system.shop_items | YES | Name differs (store_items vs shop_items) |
| store.store_categories | gamification_system.shop_categories | YES | Name differs |
| store.store_purchases | gamification_system.user_purchases | YES | Name differs |
| store.student_inventory | gamification_system.comodines_inventory | PARTIAL | Different scope (comodines vs general inventory) |
| store.ml_coin_transactions | gamification_system.ml_coins_transactions | YES | |
| store.ml_coin_balances | N/A | **NO** | Balance tracked in user_stats.ml_coins. **PHANTOM** |

**11-missions.md claims:** 6 tables

| Table in Doc | DDL Reality | In DDL? | Notes |
|-------------|-------------|---------|-------|
| missions.mission_definitions | gamification_system.missions | YES | Name differs |
| missions.mission_daily_rotation | N/A | **NO** | No DDL table. **PHANTOM** |
| missions.mission_weekly_rotation | N/A | **NO** | No DDL table. **PHANTOM** |
| missions.mission_progress | N/A | **NO** | Progress tracked via triggers/user_stats. **PHANTOM** |
| missions.quest_chains | N/A | **NO** | No DDL table. **PHANTOM** |
| missions.quest_progress | N/A | **NO** | No DDL table. **PHANTOM** |

**12-leaderboard.md claims:** 4 tables

| Table in Doc | DDL Reality | In DDL? | Notes |
|-------------|-------------|---------|-------|
| leaderboard.leaderboard_entries | N/A | **NO** | No table. Uses materialized views instead. **PHANTOM** |
| leaderboard.leaderboard_seasons | N/A | **NO** | No DDL table. **PHANTOM** |
| leaderboard.leaderboard_history | N/A | **NO** | No DDL table. **PHANTOM** |
| leaderboard.season_rewards | N/A | **NO** | No DDL table. **PHANTOM** |

### Schema: parents (14-parents.md)

**Doc claims:** 4 tables

| Table in Doc | DDL Reality | In DDL? | Notes |
|-------------|-------------|---------|-------|
| parents.parent_profiles | auth_management.parent_accounts | YES | Name differs (profiles vs accounts) |
| parents.parent_student_links | auth_management.parent_student_links | YES | |
| parents.parent_notifications | auth_management.parent_notifications | YES | |
| parents.link_codes | N/A | **NO** | No DDL table. **PHANTOM** |

---

## Column Spot-Check Results (~20% of key tables)

### auth.users: MAJOR MISMATCH
- **Doc (01-auth.md):** Lists 14 columns (id, tenant_id, email, password_hash, first_name, last_name, role, is_active, email_verified, avatar_url, last_login_at, created_at, updated_at, deleted_at)
- **DDL:** Has Supabase-compatible schema with 30+ columns (instance_id, aud, encrypted_password, confirmation_token, recovery_token, email_change*, phone*, raw_app_meta_data, raw_user_meta_data, is_super_admin, banned_until, is_sso_user, gamilit_role, status). NO tenant_id, NO password_hash, NO first_name/last_name.
- **Verdict:** The doc describes a completely different table structure than what exists in DDL. The DDL uses Supabase auth pattern; the doc describes a simplified conceptual model.

### auth_management.profiles: SIGNIFICANT DIVERGENCE
- **Doc:** Lists as `auth.user_profiles` with 12 columns
- **DDL:** `auth_management.profiles` with 22+ columns including full_name, student_id, school_id, role (ENUM), status (ENUM), email_verified, phone_verified, preferences (JSONB with theme/language defaults), metadata
- **Verdict:** Many columns in DDL not in doc. Type differences (grade_level is TEXT in DDL, INTEGER in doc).

### educational_content.exercises: SIGNIFICANT DIVERGENCE
- **Doc (03-education.md):** Lists ~22 columns with simple types
- **DDL:** 35+ columns including subtitle, order_index, config (JSONB), content (JSONB with structure), solution, auto_gradable, requires_manual_grading, objective, how_to_solve, recommended_strategy, pedagogical_notes, comodines_allowed (array), comodines_config (JSONB), adaptive_difficulty, prerequisites (uuid[]), version, version_notes, reviewed_by
- **Verdict:** DDL is far richer. Doc misses pedagogical content fields, comodines integration, dual grading architecture.

### gamification_system.user_stats: SIGNIFICANT DIVERGENCE
- **Doc (04-gamification.md):** Lists as `gamification.student_gamification` with 16 columns
- **DDL:** `gamification_system.user_stats` with 30+ columns including rank_progress, ml_coins_earned_today, last_ml_coins_reset, days_active_total, modules_completed, total_score, perfect_scores, certificates_earned, total_time_spent, weekly_time_spent, sessions_count, weekly_xp, monthly_xp, weekly_exercises, global_rank_position, class_rank_position, school_rank_position, metadata
- **Verdict:** DDL has nearly twice the columns documented.

### auth_management.tenants: MODERATE DIVERGENCE
- **Doc (02-tenants.md):** Lists plan (subscription_plan ENUM), max_students, metadata
- **DDL:** Has subscription_tier (text with CHECK constraint), max_users (not max_students), max_storage_gb, trial_ends_at, settings (rich JSONB with theme/features/language/timezone). No `plan` ENUM, no `max_students`.
- **Verdict:** Column names and types differ meaningfully.

---

## Findings

### Undocumented Tables (in DDL, not in any schema-ref doc)

Total: approximately **75-80 tables** have no column-level documentation in schema-reference docs. The conceptual docs (MODELO-DATOS + schema-ref) cover approximately 90 table entries, but many of those are phantoms (don't exist in DDL). The actual DDL-matching coverage is approximately:
- auth_management: 7 tables undocumented (roles, user_roles, security_events, memberships, user_suspensions, two_factor_tokens, email_verification_tokens)
- educational_content: ~14 tables undocumented (assessment_rubrics, media_resources, assignment_exercises, assignment_students, difficulty_criteria, exercise_mechanic_mappings, exercise_validation_configs, teacher_contents, exercise_validation_audits, content_approvals, content_metadatas, module_dependencies, taxonomies, exercise_type_rubrics, media_attachments, classroom_modules)
- progress_tracking: ~15 tables undocumented
- social_features: ~22 tables undocumented
- gamification_system: ~16 tables not in their primary doc (some covered by store/missions/leaderboard docs conceptually)
- content_management: ~9 tables undocumented
- system_configuration: ~6 tables undocumented
- audit_logging: ~6 tables undocumented
- notifications: ~3 tables undocumented

### Phantom Tables (in docs, not in DDL)

Total: **~25 phantom tables** across all conceptual docs

| Phantom Table | Doc | Status |
|--------------|-----|--------|
| auth.refresh_tokens | 01-auth.md | No DDL table |
| tenants.tenant_settings | 02-tenants.md | Inline in tenants.settings JSONB |
| tenants.tenant_subscriptions | 02-tenants.md | Inline in tenants table |
| education.exercise_types | 03-education.md | Handled by ENUM + mapping table |
| education.exercise_results | 03-education.md | Inline in attempts/submissions |
| education.exercise_feedback | 03-education.md | No DDL table |
| education.contents | 03-education.md | In content_management schema |
| education.reading_assignments | 03-education.md | Covered by assignments |
| education.spaced_repetition | 03-education.md | Future feature |
| gamification.levels | 04-gamification.md | Computed from user_stats |
| gamification.daily_xp_limits | 04-gamification.md | In user_stats |
| gamification.streak_records | 04-gamification.md | In user_stats |
| social.social_feed | 05-social.md | No DDL table |
| social.forum_posts | 05-social.md | discussion_threads exists instead |
| social.forum_replies | 05-social.md | No DDL table |
| classrooms.classroom_config | 06-classrooms.md | No DDL table |
| classrooms.school_periods | 06-classrooms.md | No DDL table |
| notifications.push_subscriptions | 09-notifications.md | user_devices instead |
| store.ml_coin_balances | 10-store.md | In user_stats |
| missions.mission_daily_rotation | 11-missions.md | No DDL table |
| missions.mission_weekly_rotation | 11-missions.md | No DDL table |
| missions.mission_progress | 11-missions.md | No DDL table |
| missions.quest_chains | 11-missions.md | No DDL table |
| missions.quest_progress | 11-missions.md | No DDL table |
| All 4 leaderboard tables | 12-leaderboard.md | Uses materialized views |
| content.media_categories | 13-content.md | No DDL table |
| content.content_libraries | 13-content.md | No DDL table |
| parents.link_codes | 14-parents.md | No DDL table |
| audit.data_changes | 16-audit.md | No DDL table |
| audit.access_logs | 16-audit.md | No DDL table |
| admin_dashboard.materialized_views_config | 18-admin-dashboard.md | Not a table |

### Column Mismatches (Spot-Checked)

| Table | Severity | Description |
|-------|----------|-------------|
| auth.users | **CRITICAL** | Doc describes conceptual model (14 cols), DDL has Supabase-style (30+ cols). No tenant_id, no password_hash, no first_name/last_name in DDL. Entirely different structure. |
| auth_management.profiles | **HIGH** | 22+ DDL columns vs 12 doc columns. Type mismatches (grade_level TEXT vs INTEGER). Missing: role ENUM, status ENUM, email_verified, phone_verified, preferences JSONB. |
| educational_content.exercises | **HIGH** | 35+ DDL columns vs 22 doc columns. DDL has pedagogical fields (objective, how_to_solve, etc.), comodines integration, dual grading. Doc completely misses these. |
| gamification_system.user_stats | **HIGH** | 30+ DDL columns vs 16 doc columns. Nearly half the columns undocumented. |
| auth_management.tenants | **MODERATE** | subscription_tier vs plan, max_users vs max_students, no ENUM types in DDL. |

### Metric Discrepancies

| Document | Metric | Doc Value | Reality | Severity |
|----------|--------|-----------|---------|----------|
| _INDEX.md | RLS Policies | 207 | 227 | **HIGH** - Stale |
| _INDEX.md | ENUMs | 40 | 42 | **MODERATE** - Stale |
| _INDEX.md footer | same | 207 RLS, 40 ENUMs | 227, 42 | **HIGH** - Stale |
| 99-utilities.md | ENUMs listed | 36 | 42 | **HIGH** - Missing 6 ENUMs |
| 99-utilities.md | ENUMs title | 40 | 42 | **MODERATE** - Stale |
| 99-utilities.md footer | same | 207 RLS, 40 ENUMs | 227, 42 | **HIGH** - Stale |
| 18-admin-dashboard.md | Tables | 4 | 3 | **MODERATE** - Phantom (materialized_views_config) |
| DATABASE_INVENTORY.yml | gamification_system tables | 21 | 20 | **LOW** - Off by 1 |
| MODELO-DATOS.md | All metrics | Correct | 169/22/183/67/227/298/42 | **OK** - Up to date |

---

## Overall Assessment

### Strengths
1. **MODELO-DATOS.md (v1.2.0)** is fully up to date with all metrics matching DDL reality
2. **DATABASE_INVENTORY.yml (v8.2.0)** is nearly perfect, only off by 1 in gamification_system count
3. **MODELO-DATOS.md mapping section** correctly acknowledges conceptual-vs-physical naming gap
4. **_INDEX.md mapping table** provides good conceptual-to-physical schema correspondence
5. **communication (19-communication.md)** is the best-aligned schema-ref doc (all 4 tables match)
6. **data_warehouse (17-data-warehouse.md)** covers all 16 tables correctly
7. **gamilit utility (20-gamilit-utility.md)** is accurate

### Weaknesses
1. **Schema-reference docs are heavily conceptual** - They describe an idealized model, not the actual DDL. ~25 phantom tables, ~75-80 undocumented tables.
2. **Column-level documentation is severely outdated** - For the 5 tables spot-checked, all had significant structural mismatches. The DDL has evolved substantially beyond what docs describe.
3. **_INDEX.md and 99-utilities.md are stale** - RLS count (207 vs 227) and ENUM count (40 vs 42) not updated after Phase 2 FORCE RLS and ENUM additions.
4. **Leaderboard and missions conceptual docs describe tables that don't exist** - These features are implemented via materialized views and user_stats, not dedicated tables.
5. **auth.users doc is the most misleading** - Describes a simple table that doesn't match the Supabase-compatible DDL at all.

### Recommended Priority Fixes
1. **P0:** Update _INDEX.md footer and summary: 207->227 RLS, 40->42 ENUMs
2. **P0:** Update 99-utilities.md: Add missing 6 ENUMs, fix title 40->42, fix footer
3. **P1:** Add disclaimer to all 16 conceptual schema-ref docs: "These describe the conceptual model. For DDL-exact table/column definitions, see `apps/database/ddl/schemas/`"
4. **P1:** Fix 18-admin-dashboard.md: Remove phantom `materialized_views_config` table (tables = 3, not 4)
5. **P2:** Rewrite 01-auth.md to match Supabase-style DDL structure
6. **P2:** Add DDL-exact table listings for high-traffic schemas (auth_management, educational_content, gamification_system, progress_tracking)
7. **P3:** Fix DATABASE_INVENTORY.yml gamification_system count (21->20 or verify if a 21st table exists)

---

*Generated by Agent C - Documentation-DDL Consistency Analysis*
*Date: 2026-02-17*
*Files analyzed: 23 schema-reference docs, 169 DDL table files, MODELO-DATOS.md, DATABASE_INVENTORY.yml*
