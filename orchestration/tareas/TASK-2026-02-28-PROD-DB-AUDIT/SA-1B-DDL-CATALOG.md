---
title: "SA-1B DDL Catalog — Production Database Audit"
task: "TASK-2026-02-28-PROD-DB-AUDIT"
agent: "SA-1B"
created: "2026-02-28"
version: "1.0.0"
status: "complete"
---

# SA-1B DDL CATALOG — Production Database Source of Truth

**Agent:** SA-1B (Production Database Audit)
**Source:** `apps/database/ddl/` — canonical DDL definition
**Date:** 2026-02-28
**Purpose:** Source-of-truth catalog against which production will be compared

---

## SUMMARY TOTALS

| Object Type | Count | Notes |
|-------------|-------|-------|
| Schemas | 18 | 16 active + 2 placeholder (storage, optimization have no tables) |
| Tables | 173 | Includes multi-table files; excludes data_warehouse (DDL-only) |
| ENUMs (unique types) | 42 | Some defined in prerequisites + schema files (idempotent DO blocks) |
| Functions | ~158 | Across gamilit, gamification_system, educational_content, progress_tracking, communication, social_features, content_management, auth_management, auth, system_configuration, notifications, audit_logging, data_warehouse |
| Triggers | ~68 | batch updated_at files + individual trigger files |
| RLS Policies | ~251 | Across 4 phase files + inline in table files + schema rls-policies/ dirs |
| Tables with RLS ENABLED | ~107 | Phase1: 25, Phase2: 34, Phase3: 19, Phase4 (07d): 20+, inline: ~9 |
| Views (regular) | ~18 | Across 7 schemas |
| Materialized Views | 7 | admin_dashboard (3) + gamification_system (4) |
| Indexes (explicit CREATE INDEX) | ~301 | Inline in table files + dedicated indexes/ dirs + optimization/ |
| Extensions | 3 | pg_stat_statements, pg_trgm, pgcrypto |
| Roles | 6 | authenticated, anon, service_role, admin_teacher, student, super_admin |
| ALTER ROLE | 1 | `ALTER ROLE gamilit_user BYPASSRLS` |
| GRANTs (post-DDL) | Bulk | ALL PRIVILEGES on all tables/sequences per schema to gamilit_user |

---

## PART 1: SCHEMAS

| Schema | Status | Description |
|--------|--------|-------------|
| `gamilit` | Active | Shared utility functions, no tables |
| `auth` | Active | Users table + auth enums |
| `auth_management` | Active | Profiles, tenants, roles, sessions, parent accounts |
| `gamification_system` | Active | XP, achievements, missions, coins, shop, leaderboards |
| `educational_content` | Active | Modules, exercises, assignments, rubrics |
| `content_management` | Active | Templates, media, moderation, tags |
| `social_features` | Active | Schools, classrooms, teams, guilds, friendships |
| `progress_tracking` | Active | Module progress, exercise attempts, certificates |
| `audit_logging` | Active | Audit logs, performance metrics, system alerts |
| `admin_dashboard` | Active | Bulk operations, reports, metrics |
| `system_configuration` | Active | Settings, feature flags, rate limits |
| `notifications` | Active | Notifications, preferences, queues, devices |
| `communication` | Active | Messages, participants, conversations |
| `lti_integration` | Active | LTI consumers, sessions, grade passback |
| `data_warehouse` | DDL-only | ETL/ML tables, no backend entities |
| `public` | Active | PostgreSQL default (no custom tables) |
| `storage` | Placeholder | No DDL tables defined |
| `optimization` | Placeholder | Only indexes, no tables |

**Source:** `apps/database/ddl/00-prerequisites.sql` (schema CREATE statements)

---

## PART 2: ENUMs

All ENUMs are defined idempotently using `DO $$ BEGIN CREATE TYPE ... EXCEPTION WHEN duplicate_object THEN null; END $$`.
Prerequisites file defines them first; schema-specific enum files redefine idempotently.

### auth schema
| ENUM Type | Values | Source File |
|-----------|--------|-------------|
| `auth.aal_level` | 'aal1', 'aal2', 'aal3' | `schemas/auth/enums/aal_level.sql` |
| `auth.code_challenge_method` | 's256', 'plain' | `schemas/auth/enums/code_challenge_method.sql` |

### auth_management schema
| ENUM Type | Values | Source File |
|-----------|--------|-------------|
| `auth_management.gamilit_role` | 'student', 'admin_teacher', 'super_admin' | `00-prerequisites.sql` + `schemas/auth_management/enums/gamilit_role.sql` |
| `auth_management.user_status` | 'active', 'inactive', 'suspended', 'banned', 'pending' | `00-prerequisites.sql` + `schemas/auth_management/enums/user_status.sql` |
| `auth_management.auth_provider` | 'local', 'google', 'facebook', 'apple', 'microsoft', 'github' | `00-prerequisites.sql` + `schemas/auth_management/enums/auth_provider.sql` |

### gamification_system schema
| ENUM Type | Values | Source File |
|-----------|--------|-------------|
| `gamification_system.maya_rank` | 'Ajaw', 'Nacom', 'Ah K''in', 'Halach Uinic', 'K''uk''ulkan' | `00-prerequisites.sql` + `schemas/gamification_system/enums/maya_rank.sql` |
| `gamification_system.achievement_category` | 'progress', 'streak', 'completion', 'social', 'special', 'mastery', 'exploration', 'collection', 'hidden' | `00-prerequisites.sql` + `schemas/gamification_system/enums/achievement_category.sql` |
| `gamification_system.achievement_type` | 'badge', 'milestone', 'special', 'rank_promotion' | `00-prerequisites.sql` + `schemas/gamification_system/enums/achievement_type.sql` |
| `gamification_system.comodin_type` | 'pistas', 'vision_lectora', 'segunda_oportunidad' | `00-prerequisites.sql` + `schemas/gamification_system/enums/comodin_type.sql` |
| `gamification_system.shop_item_category` | 'cosmetics', 'profile', 'guild', 'social', 'consumable' | `00-prerequisites.sql` + `schemas/gamification_system/enums/shop_item_category.sql` |
| `gamification_system.notification_type` | (defined in enums/notification_type.sql) | `schemas/gamification_system/enums/notification_type.sql` |
| `gamification_system.notification_priority` | (defined in enums/notification_priority.sql) | `schemas/gamification_system/enums/notification_priority.sql` |
| `gamification_system.transaction_type` | (defined in file) | `schemas/gamification_system/enums/transaction_type.sql` |

### educational_content schema
| ENUM Type | Values | Source File |
|-----------|--------|-------------|
| `educational_content.exercise_type` | 33 values (see below) | `00-prerequisites.sql` + `schemas/educational_content/enums/exercise_type.sql` |
| `educational_content.module_status` | 'draft', 'published', 'archived', 'under_review', 'backlog' | `00-prerequisites.sql` + `schemas/educational_content/enums/module_status.sql` |
| `educational_content.cognitive_level` | 'recordar', 'comprender', 'aplicar', 'analizar', 'evaluar', 'crear' | `00-prerequisites.sql` + `schemas/educational_content/enums/cognitive_level.sql` |
| `educational_content.difficulty_level` | 8 CEFR levels A1→C2+ | `schemas/educational_content/enums/difficulty_level.sql` |
| `educational_content.bloom_level` | (Bloom taxonomy levels) | `schemas/educational_content/enums/bloom_level.sql` |
| `educational_content.bloom_taxonomy` | (Bloom taxonomy) | `schemas/educational_content/enums/bloom_taxonomy.sql` |
| `educational_content.exercise_mechanic` | (exercise mechanic types) | `schemas/educational_content/enums/exercise_mechanic.sql` |

**exercise_type values (33 total):**
Module 1: completar_espacios, crucigrama, emparejamiento, linea_tiempo, mapa_conceptual, sopa_letras, verdadero_falso
Module 2: construccion_hipotesis, detective_textual, prediccion_narrativa, puzzle_contexto, rueda_inferencias
Module 3: analisis_fuentes, debate_digital, matriz_perspectivas, podcast_argumentativo, tribunal_opiniones
Module 4 (backlog): analisis_memes, infografia_interactiva, navegacion_hipertextual, quiz_tiktok, verificador_fake_news, chat_literario, email_formal, ensayo_argumentativo, resena_critica
Module 5 (backlog): comic_digital, diario_multimedia, video_carta
Auxiliares: comprension_auditiva, collage_prensa, texto_movimiento, call_to_action

### content_management schema
| ENUM Type | Values | Source File |
|-----------|--------|-------------|
| `content_management.media_type` | 'image', 'video', 'audio', 'document', 'interactive', 'animation' | `00-prerequisites.sql` + `schemas/content_management/enums/media_type.sql` |
| `content_management.processing_status` | 'uploading', 'processing', 'ready', 'error', 'optimizing' | `00-prerequisites.sql` + `schemas/content_management/enums/processing_status.sql` |
| `content_management.content_status` | (defined in file) | `schemas/content_management/enums/content_status.sql` |
| `content_management.content_type` | (defined in file) | `schemas/content_management/enums/content_type.sql` |

### progress_tracking schema
| ENUM Type | Values | Source File |
|-----------|--------|-------------|
| `progress_tracking.attempt_status` | 'in_progress', 'submitted', 'graded', 'reviewed' | `00-prerequisites.sql` + `schemas/progress_tracking/enums/attempt_status.sql` |
| `progress_tracking.progress_status` | (defined in file — extensive) | `schemas/progress_tracking/enums/progress_status.sql` |
| `progress_tracking.attempt_result` | (defined in file) | `schemas/progress_tracking/enums/attempt_result.sql` |
| `progress_tracking.certificate_status` | (defined in file) | `schemas/progress_tracking/enums/certificate_enums.sql` |
| `progress_tracking.certificate_type` | (defined in file) | `schemas/progress_tracking/enums/certificate_enums.sql` |

### social_features schema
| ENUM Type | Values | Source File |
|-----------|--------|-------------|
| `social_features.classroom_role` | 'teacher', 'student', 'assistant' | `00-prerequisites.sql` + `schemas/social_features/enums/classroom_role.sql` |
| `social_features.team_role` | 'owner', 'admin', 'member' | `00-prerequisites.sql` + `schemas/social_features/enums/team_role.sql` |
| `social_features.friendship_status` | 'pending', 'accepted', 'rejected', 'blocked' | `00-prerequisites.sql` + `schemas/social_features/enums/friendship_status.sql` |
| `social_features.enrollment_method` | (defined in file) | `schemas/social_features/enums/enrollment_method.sql` |
| `social_features.team_challenge_status` | (defined in file) | `schemas/social_features/enums/team_challenge_status.sql` |
| `social_features.guild_mission_type` | 'exercises_completed', 'total_score', 'streak_days', 'perfect_scores', 'subjects_completed', 'time_spent' | `schemas/social_features/tables/24-guild_missions.sql` (inline) |

### system_configuration schema
| ENUM Type | Values | Source File |
|-----------|--------|-------------|
| `system_configuration.setting_type` | 'string', 'number', 'boolean', 'json', 'array' | `00-prerequisites.sql` + `schemas/system_configuration/enums/setting_type.sql` |

### audit_logging schema
| ENUM Type | Values | Source File |
|-----------|--------|-------------|
| `audit_logging.log_level` | 'debug', 'info', 'warning', 'error', 'critical' | `00-prerequisites.sql` + `schemas/audit_logging/enums/log_level.sql` |
| `audit_logging.audit_action` | 'create', 'update', 'delete', 'login', 'logout', 'access', 'export', 'import' | `00-prerequisites.sql` + `schemas/audit_logging/enums/audit_action.sql` |
| `audit_logging.alert_severity` | 'info', 'warning', 'error', 'critical' | `00-prerequisites.sql` |
| `audit_logging.alert_status` | 'active', 'acknowledged', 'resolved', 'ignored' | `00-prerequisites.sql` |
| `audit_logging.metric_type` | (defined in file) | `schemas/audit_logging/enums/metric_type.sql` |

### data_warehouse schema
| ENUM Type | Values | Source File |
|-----------|--------|-------------|
| `data_warehouse.etl_load_status` | (defined inline) | `schemas/data_warehouse/tables/etl_load_log.sql` |

**Total unique ENUMs: 42**

---

## PART 3: TABLES (173 Total)

### Schema: auth (1 table)

| Table | Key Columns | Source File |
|-------|-------------|-------------|
| `auth.users` | id UUID PK, email TEXT NOT NULL UNIQUE, encrypted_password TEXT, role VARCHAR(255), gamilit_role auth_management.gamilit_role DEFAULT 'student', status VARCHAR(50) DEFAULT 'active', raw_user_meta_data JSONB, is_super_admin BOOL, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ, deleted_at TIMESTAMPTZ | `schemas/auth/tables/01-users.sql` |

### Schema: auth_management (16 tables)

| # | Table | Key Columns | Source File |
|---|-------|-------------|-------------|
| 1 | `auth_management.tenants` | id UUID PK, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, domain TEXT, subscription_tier TEXT DEFAULT 'free', max_users INT DEFAULT 100, is_active BOOL, settings JSONB, deleted_at TIMESTAMPTZ | `tables/01-tenants.sql` |
| 2 | `auth_management.auth_attempts` | (id, email, attempt_type, ip_address, success, created_at) | `tables/02-auth_attempts.sql` |
| 3 | `auth_management.profiles` | id UUID PK, tenant_id UUID FK→tenants, email TEXT UNIQUE NOT NULL, first_name TEXT, last_name TEXT, display_name TEXT, role gamilit_role NOT NULL DEFAULT 'student', status user_status NOT NULL DEFAULT 'active', school_id UUID, preferences JSONB, deleted_at TIMESTAMPTZ, user_id UUID UNIQUE FK→auth.users | `tables/03-profiles.sql` |
| 4 | `auth_management.roles` | (id, name, permissions JSONB, is_active) | `tables/03b-roles.sql` |
| 5 | `auth_management.user_roles` | (id, user_id FK→profiles, role gamilit_role, tenant_id FK→tenants) | `tables/04-user_roles.sql` |
| 6 | `auth_management.auth_providers` | (id, user_id FK, provider auth_provider, external_id, access_token, created_at) | `tables/05-auth_providers.sql` |
| 7 | `auth_management.email_verification_tokens` | (id, user_id FK, token_hash, expires_at, used_at) | `tables/06-email_verification_tokens.sql` |
| 8 | `auth_management.password_reset_tokens` | (id, user_id FK, token_hash, expires_at, used_at) | `tables/07-password_reset_tokens.sql` |
| 9 | `auth_management.security_events` | (id, user_id FK, event_type, ip_address, metadata JSONB, created_at) | `tables/08-security_events.sql` |
| 10 | `auth_management.user_preferences` | (id/user_id FK, theme, language, notifications_enabled, preferences JSONB) | `tables/09-user_preferences.sql` |
| 11 | `auth_management.memberships` | (id, user_id FK, tenant_id FK, role, joined_at, is_active) | `tables/10-memberships.sql` |
| 12 | `auth_management.user_sessions` | (id, user_id FK, session_token_hash, refresh_token_hash, ip_address, expires_at, is_active) | `tables/11-user_sessions.sql` |
| 13 | `auth_management.user_suspensions` | (id, user_id FK, reason, suspended_by FK, suspended_until, is_active) | `tables/12-user_suspensions.sql` |
| 14 | `auth_management.two_factor_tokens` | (id, user_id FK, secret_key, token_hash, backup_codes_encrypted, is_enabled) | `tables/13-two_factor_tokens.sql` |
| 15 | `auth_management.parent_accounts` | (id, profile_id FK→profiles, relationship_type, is_verified, created_at) | `tables/14-parent_accounts.sql` |
| 16 | `auth_management.parent_student_links` | (id, parent_account_id FK, student_id FK→profiles, relationship, verified_at) | `tables/15-parent_student_links.sql` |
| 17 | `auth_management.parent_notifications` | (id, parent_account_id FK, student_id FK, notification_type, message, is_read, created_at) | `tables/16-parent_notifications.sql` |

**Note:** 16 table files but file 03b-roles.sql is an additional table making 17 total for this schema.

### Schema: gamification_system (19 tables)

| # | Table | Key Columns | Source File |
|---|-------|-------------|-------------|
| 1 | `gamification_system.user_stats` | id, user_id FK→profiles UNIQUE, tenant_id FK, total_xp INT DEFAULT 0, current_level INT DEFAULT 1, ml_coins INT DEFAULT 0, daily_streak INT DEFAULT 0, total_exercises_completed INT, exercises_today INT | `tables/01-user_stats.sql` |
| 2 | `gamification_system.user_ranks` | id, user_id FK UNIQUE, current_rank maya_rank DEFAULT 'Ajaw', previous_rank, rank_xp INT, promoted_at | `tables/02-user_ranks.sql` |
| 3 | `gamification_system.achievements` | id, name TEXT, description TEXT, category achievement_category, type achievement_type, requirement_type, requirement_value INT, xp_reward INT, coin_reward INT, badge_url TEXT, is_active BOOL | `tables/03-achievements.sql` |
| 4 | `gamification_system.user_achievements` | id, user_id FK, achievement_id FK, unlocked_at TIMESTAMPTZ, xp_earned INT, notified BOOL | `tables/04-user_achievements.sql` |
| 5 | `gamification_system.ml_coins_transactions` | id, user_id FK, amount INT, transaction_type transaction_type, balance_after INT, description TEXT, reference_type VARCHAR, reference_id UUID | `tables/05-ml_coins_transactions.sql` |
| 6 | `gamification_system.mission_templates` | id, name TEXT, description TEXT, mission_type, trigger_event, target_value INT, xp_reward INT, coin_reward INT, is_daily BOOL, is_active BOOL | `tables/05a-mission_templates.sql` |
| 7 | `gamification_system.missions` | id, user_id FK, template_id FK→mission_templates, title TEXT, status VARCHAR, current_value INT, target_value INT, xp_reward INT, coin_reward INT, expires_at TIMESTAMPTZ | `tables/06-missions.sql` |
| 8 | `gamification_system.comodines_inventory` | id, user_id FK UNIQUE (partial), comodin_type comodin_type, quantity INT DEFAULT 0, max_quantity INT | `tables/07-comodines_inventory.sql` |
| 9 | `gamification_system.leaderboard_metadata` | id, leaderboard_type VARCHAR, period_type VARCHAR, period_start DATE, period_end DATE, last_updated TIMESTAMPTZ | `tables/09-leaderboard_metadata.sql` |
| 10 | `gamification_system.achievement_categories` | id, name TEXT, slug TEXT UNIQUE, description TEXT, icon_url TEXT, display_order INT, is_active BOOL | `tables/10-achievement_categories.sql` |
| 11 | `gamification_system.active_boosts` | id, user_id FK, boost_type VARCHAR, multiplier DECIMAL, expires_at TIMESTAMPTZ, item_id FK→shop_items | `tables/11-active_boosts.sql` |
| 12 | `gamification_system.inventory_transactions` | id, user_id FK, item_id FK→shop_items, transaction_type VARCHAR, quantity INT, coins_spent INT, created_at | `tables/12-inventory_transactions.sql` |
| 13 | `gamification_system.maya_ranks` | id, rank_name maya_rank UNIQUE, display_name TEXT, min_xp INT, max_xp INT, color_hex VARCHAR, benefits JSONB, rank_order INT | `tables/13-maya_ranks.sql` |
| 14 | `gamification_system.comodin_usage_logs` | id, user_id FK, comodin_type comodin_type, exercise_id FK, attempt_id FK, used_at TIMESTAMPTZ | `tables/14-comodin_usage_log.sql` |
| 15 | `gamification_system.comodin_usage_trackings` | id, user_id FK, attempt_id FK UNIQUE, comodin_type comodin_type, usage_count INT, created_at | `tables/15-comodin_usage_tracking.sql` |
| 16 | `gamification_system.shop_categories` | id, name TEXT, slug TEXT UNIQUE, description TEXT, icon_url TEXT, display_order INT, is_active BOOL | `tables/17-shop_categories.sql` |
| 17 | `gamification_system.shop_items` | id, name TEXT, description TEXT, category shop_item_category, category_id FK→shop_categories, price INT NOT NULL, xp_cost INT, effect_type VARCHAR, effect_data JSONB, image_url TEXT, is_active BOOL, is_limited BOOL, stock_limit INT | `tables/18-shop_items.sql` |
| 18 | `gamification_system.user_purchases` | id, user_id FK, item_id FK→shop_items, quantity INT DEFAULT 1, coins_spent INT, purchased_at TIMESTAMPTZ, is_active BOOL, consumed_at TIMESTAMPTZ | `tables/19-user_purchases.sql` |
| 19 | `gamification_system.user_equipped_items` | id, user_id FK, category_id FK→shop_categories, item_id FK→shop_items, equipped_at TIMESTAMPTZ, UNIQUE(user_id, category_id) | `tables/21-user_equipped_items.sql` |
| 20 | `gamification_system.classroom_missions` | id, classroom_id FK, mission_template_id FK, assigned_by FK, start_date DATE, end_date DATE, is_active BOOL | `tables/_cross_schema/16-classroom_missions.sql` |
| 21 | `gamification_system.comodin_uses` | id UUID PK, user_id FK, comodin_type, exercise_id FK, attempt_id FK, effect_applied VARCHAR, value_provided JSONB, consumed_at TIMESTAMPTZ, created_at | `tables/_cross_schema/21-comodin_uses.sql` |

### Schema: educational_content (25 tables)

| # | Table | Key Columns | Source File |
|---|-------|-------------|-------------|
| 1 | `educational_content.modules` | id, tenant_id FK, name TEXT, slug TEXT UNIQUE, description TEXT, status module_status, order_index INT, required_xp INT, min_rank maya_rank, is_visible BOOL | `tables/01-modules.sql` |
| 2 | `educational_content.exercises` | id, module_id FK, title TEXT, exercise_type exercise_type, content JSONB, solution JSONB, max_score INT, time_limit_seconds INT, xp_reward INT, difficulty difficulty_level, is_active BOOL | `tables/02-exercises.sql` |
| 3 | `educational_content.assessment_rubrics` | id, exercise_id FK, module_id FK, criteria JSONB, created_by FK, is_active BOOL | `tables/03-assessment_rubrics.sql` |
| 4 | `educational_content.media_resources` | id, tenant_id FK, title TEXT, media_type content_management.media_type, url TEXT, file_size_bytes BIGINT, created_by FK, is_active BOOL, is_public BOOL | `tables/04-media_resources.sql` |
| 5 | `educational_content.assignments` | id, tenant_id FK, teacher_id FK→profiles, title TEXT, description TEXT, due_date TIMESTAMPTZ, max_attempts INT, status VARCHAR | `tables/05-assignments.sql` |
| 6 | `educational_content.assignment_exercises` | id, assignment_id FK, exercise_id FK, order_index INT, is_required BOOL | `tables/06-assignment_exercises.sql` |
| 7 | `educational_content.assignment_students` | id, assignment_id FK, student_id FK→profiles, enrolled_at TIMESTAMPTZ, completed_at TIMESTAMPTZ | `tables/07-assignment_students.sql` |
| 8 | `educational_content.assignment_submissions` | id, assignment_id FK, student_id FK→profiles, submitted_at TIMESTAMPTZ, grade DECIMAL, status VARCHAR, feedback TEXT | `tables/08-assignment_submissions.sql` |
| 9 | `educational_content.media_attachments` | id, exercise_id FK, media_resource_id FK, user_id FK, attachment_type VARCHAR, created_at | `tables/_cross_schema/09-media_attachments.sql` |
| 10 | `educational_content.difficulty_criteria` | id, difficulty difficulty_level, module_id FK, criteria JSONB, min_score DECIMAL | `tables/20-difficulty_criteria.sql` |
| 11 | `educational_content.exercise_mechanic_mapping` | id, exercise_id FK, mechanic exercise_mechanic, parameters JSONB | `tables/21-exercise_mechanic_mapping.sql` |
| 12 | `educational_content.exercise_validation_config` | id, exercise_type exercise_type, validation_rules JSONB, fuzzy_threshold DECIMAL, is_active BOOL | `tables/22-exercise_validation_config.sql` |
| 13 | `educational_content.classroom_modules` | id, classroom_id FK→social_features.classrooms, module_id FK, assigned_by FK→profiles, is_active BOOL, assigned_at | `tables/_cross_schema/23-classroom_modules.sql` |
| 14 | `educational_content.teacher_contents` | id, teacher_id FK, title TEXT, content_type VARCHAR, content JSONB, visibility VARCHAR DEFAULT 'private', is_approved BOOL | `tables/25-teacher_content.sql` |
| 15 | `educational_content.exercise_validation_audit` | id, exercise_id FK, attempt_id FK, validation_function TEXT, input_data JSONB, result_data JSONB, created_at | `tables/26-exercise_validation_audit.sql` |
| 16 | `educational_content.exercise_type_rubrics` | id, exercise_type exercise_type, rubric_criteria JSONB, max_score INT, is_active BOOL | `tables/27-exercise_type_rubrics.sql` |
| 17 | `educational_content.resource_ratings` | id, resource_id FK→media_resources, user_id FK, rating INT CHECK(1-5), created_at | `tables/28-resource_ratings.sql` |
| 18 | `educational_content.resource_comments` | id, resource_id FK→media_resources, user_id FK, comment TEXT, is_approved BOOL, created_at | `tables/29-resource_comments.sql` |
| 19 | `educational_content.resource_downloads` | id, resource_id FK→media_resources, user_id FK, downloaded_at TIMESTAMPTZ | `tables/30-resource_downloads.sql` |
| 20 | `educational_content.content_metadata` | id, exercise_id FK, key VARCHAR, value TEXT, created_at | `tables/content_metadata.sql` |
| 21 | `educational_content.module_dependencies` | id, module_id FK, depends_on_module_id FK, dependency_type VARCHAR | `tables/module_dependencies.sql` |
| 22 | `educational_content.taxonomies` | id, name TEXT, taxonomy_type VARCHAR, parent_id FK (self), description TEXT | `tables/taxonomies.sql` |
| 23 | `educational_content.content_tags` | id, exercise_id FK, tag_id FK→content_management.tags, created_at | `tables/content_tags.sql` |
| 24 | `educational_content.content_approvals` | id, content_id FK, content_type VARCHAR, approved_by FK, status VARCHAR, reviewed_at | `tables/content_approvals.sql` |

**Note:** `tables/25-teacher_content.sql` defines `teacher_contents` (the table) — counted as one table.

### Schema: content_management (10 tables)

| # | Table | Key Columns | Source File |
|---|-------|-------------|-------------|
| 1 | `content_management.content_templates` | id, name TEXT, template_type VARCHAR, content JSONB, is_active BOOL, created_by FK | `tables/01-content_templates.sql` |
| 2 | `content_management.marie_curie_contents` | id, title TEXT, grade_level VARCHAR, content_type content_type, body TEXT, keywords TEXT[], is_active BOOL | `tables/02-marie_curie_content.sql` |
| 3 | `content_management.media_files` | id, filename TEXT, original_name TEXT, mime_type VARCHAR, file_size BIGINT, url TEXT, processing_status processing_status, media_type media_type, is_public BOOL, uploaded_by FK | `tables/03-media_files.sql` |
| 4 | `content_management.content_versions` | id, content_id UUID, content_type VARCHAR, version_number INT, content JSONB, created_by FK, created_at | `tables/04-content_versions.sql` |
| 5 | `content_management.flagged_contents` | id, content_id UUID, content_type VARCHAR, reason TEXT, reported_by FK, status content_status, reviewed_by FK | `tables/05-flagged_content.sql` |
| 6 | `content_management.moderation_rules` | id, rule_type VARCHAR, pattern TEXT, action VARCHAR, priority INT, is_active BOOL, created_by FK | `tables/06-moderation_rules.sql` |
| 7 | `content_management.tags` | id, name TEXT UNIQUE, slug TEXT UNIQUE, color VARCHAR, description TEXT, created_at | `tables/07-tags.sql` |
| 8 | `content_management.content_authors` | id, profile_id FK→profiles, display_name TEXT, bio TEXT, is_verified BOOL | `tables/content_authors.sql` |
| 9 | `content_management.content_categories` | id, name TEXT, slug TEXT UNIQUE, parent_id FK (self), description TEXT, is_active BOOL | `tables/content_categories.sql` |
| 10 | `content_management.media_metadatas` | id, media_file_id FK→media_files, width INT, height INT, duration_seconds INT, bitrate INT, encoding VARCHAR, thumbnail_url TEXT | `tables/media_metadata.sql` |

### Schema: social_features (28 tables)

| # | Table | Key Columns | Source File |
|---|-------|-------------|-------------|
| 1 | `social_features.friendships` | id, user_id FK, friend_id FK, status friendship_status DEFAULT 'pending', created_at | `tables/01-friendships.sql` |
| 2 | `social_features.schools` | id, tenant_id FK, name TEXT, code TEXT UNIQUE, address TEXT, is_active BOOL | `tables/02-schools.sql` |
| 3 | `social_features.classrooms` | id, tenant_id FK, school_id FK, teacher_id FK→profiles, name TEXT, code TEXT UNIQUE, member_count INT DEFAULT 0, is_active BOOL | `tables/03-classrooms.sql` |
| 4 | `social_features.classroom_members` | id, classroom_id FK, student_id FK→profiles, role classroom_role DEFAULT 'student', enrolled_at | `tables/04-classroom_members.sql` |
| 5 | `social_features.teams` | id, classroom_id FK, name TEXT, description TEXT, leader_id FK→profiles, is_active BOOL | `tables/05-teams.sql` |
| 6 | `social_features.team_members` | id, team_id FK, user_id FK→profiles, role team_role DEFAULT 'member', joined_at | `tables/06-team_members.sql` |
| 7 | `social_features.team_challenges` | id, team_id FK, challenge_type VARCHAR, status team_challenge_status, target_value INT, current_value INT, start_date DATE, end_date DATE | `tables/07-team_challenges.sql` |
| 8 | `social_features.teacher_reports` | id, teacher_id FK→profiles, classroom_id FK, report_type VARCHAR, data JSONB, generated_at | `tables/08a-teacher_reports.sql` |
| 9 | `social_features.scheduled_reports` | id, teacher_id FK, classroom_id FK, report_type VARCHAR, schedule_cron VARCHAR, is_active BOOL, next_run_at TIMESTAMPTZ | `tables/08b-scheduled_reports.sql` |
| 10 | `social_features.shared_reports` | id, report_id FK→teacher_reports, shared_by FK, shared_with FK, permissions VARCHAR, shared_at | `tables/08c-shared_reports.sql` |
| 11 | `social_features.user_activities` | id, user_id FK, activity_type VARCHAR, metadata JSONB, created_at | `tables/09-user_activities.sql` |
| 12 | `social_features.friend_requests` | id, requester_id FK→profiles, recipient_id FK→profiles, status VARCHAR, created_at, responded_at | `tables/10-friend_requests.sql` |
| 13 | `social_features.peer_challenges` | id, created_by FK→profiles, challenged_user_id FK, exercise_id FK, status VARCHAR, challenger_score INT, challenged_score INT | `tables/11-peer_challenges.sql` |
| 14 | `social_features.challenge_participants` | id, challenge_id FK→peer_challenges, user_id FK, score INT, completed_at TIMESTAMPTZ | `tables/12-challenge_participants.sql` |
| 15 | `social_features.challenge_results` | id, challenge_id FK, winner_id FK, loser_id FK, result_type VARCHAR, xp_awarded INT | `tables/13-challenge_results.sql` |
| 16 | `social_features.guild_emblems` | id, name TEXT, description TEXT, image_url TEXT, required_level INT, is_active BOOL | `tables/20-guild_emblems.sql` |
| 17 | `social_features.guilds` | id, name TEXT UNIQUE, description TEXT, leader_id FK→profiles, emblem_id FK→guild_emblems, is_open BOOL, max_members INT, member_count INT DEFAULT 0, total_xp BIGINT DEFAULT 0 | `tables/21-guilds.sql` |
| 18 | `social_features.guild_members` | id, guild_id FK, user_id FK, role VARCHAR DEFAULT 'member', joined_at, total_contribution BIGINT DEFAULT 0 | `tables/22-guild_members.sql` |
| 19 | `social_features.guild_join_requests` | id, guild_id FK, requester_id FK→profiles, status VARCHAR, responded_by FK→guilds.leader_id, requested_at | `tables/23-guild_join_requests.sql` |
| 20 | `social_features.guild_missions` | id UUID PK, guild_id FK, title VARCHAR(100), description TEXT, mission_type guild_mission_type, target_value INT, current_value INT, reward_xp INT, reward_coins INT, difficulty VARCHAR, status VARCHAR | `tables/24-guild_missions.sql` |
| 21 | `social_features.guild_mission_contributions` | id UUID PK, mission_id FK, user_id FK, contribution_value INT, contributed_at TIMESTAMPTZ | `tables/24-guild_missions.sql` (second table in same file) |
| 22 | `social_features.user_skill_ratings` | id, user_id FK, skill_type VARCHAR, rating DECIMAL, games_played INT, last_updated | `tables/25-user_skill_ratings.sql` |
| 23 | `social_features.user_blocks` | id, blocker_id FK→profiles, blocked_id FK→profiles, reason TEXT, created_at, UNIQUE(blocker_id, blocked_id) | `tables/26-user_blocks.sql` |
| 24 | `social_features.team_vs_team_challenges` | id, challenger_team_id FK, challenged_team_id FK, exercise_id FK, status VARCHAR, challenger_score INT, challenged_score INT, winner_team_id FK | `tables/27-team_vs_team_challenges.sql` |
| 25 | `social_features.user_reports` | id, reporter_id FK, reported_user_id FK, reason TEXT, status VARCHAR, reviewed_by FK, reviewed_at | `tables/28-user_reports.sql` |
| 26 | `social_features.assignment_classrooms` | id, assignment_id FK→educational_content.assignments, classroom_id FK, assigned_by FK | `tables/assignment_classrooms.sql` |
| 27 | `social_features.discussion_threads` | id, classroom_id FK, title TEXT, body TEXT, created_by FK, is_pinned BOOL, is_locked BOOL | `tables/discussion_threads.sql` |
| 28 | `social_features.social_interactions` | id, user_id FK, target_user_id FK, interaction_type VARCHAR, metadata JSONB, created_at | `tables/social_interactions.sql` |
| 29 | `social_features.teacher_classrooms` | id, teacher_id FK→profiles, classroom_id FK, role VARCHAR, is_primary BOOL, joined_at | `tables/teacher_classrooms.sql` |
| 30 | `social_features.user_follows` | id, follower_id FK→profiles, following_id FK→profiles, created_at, UNIQUE(follower_id, following_id) | `tables/user_follows.sql` |

### Schema: progress_tracking (21 tables)

| # | Table | Key Columns | Source File |
|---|-------|-------------|-------------|
| 1 | `progress_tracking.module_progress` | id, user_id FK, module_id FK, tenant_id FK, status progress_status, score DECIMAL, completed_exercises INT, total_exercises INT, percentage DECIMAL, last_activity_at TIMESTAMPTZ | `tables/01-module_progress.sql` |
| 2 | `progress_tracking.learning_sessions` | id, user_id FK, module_id FK, exercise_id FK, started_at TIMESTAMPTZ, ended_at TIMESTAMPTZ, duration_seconds INT, xp_earned INT | `tables/02-learning_sessions.sql` |
| 3 | `progress_tracking.exercise_attempts` | id, user_id FK, exercise_id FK, session_id FK, attempt_number INT, status attempt_status, score DECIMAL, time_spent_seconds INT, answer_data JSONB, started_at TIMESTAMPTZ | `tables/03-exercise_attempts.sql` |
| 4 | `progress_tracking.exercise_submissions` | id, user_id FK, exercise_id FK, attempt_id FK, status attempt_status, submitted_at TIMESTAMPTZ, grade DECIMAL, feedback TEXT, graded_by FK | `tables/04-exercise_submissions.sql` |
| 5 | `progress_tracking.scheduled_missions` | id, mission_id FK, classroom_id FK, scheduled_by FK, start_date DATE, end_date DATE, is_active BOOL, notes TEXT | `tables/05-scheduled_missions.sql` |
| 6 | `progress_tracking.manual_reviews` | id, submission_id FK→exercise_submissions, reviewer_id FK, score DECIMAL, feedback TEXT, reviewed_at TIMESTAMPTZ, status VARCHAR | `tables/06-manual_reviews.sql` |
| 7 | `progress_tracking.user_difficulty_progresses` | id, user_id FK, module_id FK, current_difficulty difficulty_level, exercises_at_difficulty INT, consecutive_successes INT, last_promoted_at | `tables/15-user_difficulty_progress.sql` |
| 8 | `progress_tracking.user_current_levels` | id, user_id FK UNIQUE, module_id FK, current_difficulty difficulty_level, updated_at | `tables/16-user_current_level.sql` |
| 9 | `progress_tracking.student_intervention_alerts` | id, student_id FK, classroom_id FK, tenant_id FK, alert_type VARCHAR, severity VARCHAR, is_resolved BOOL, resolved_by FK, created_at | `tables/16a-student_intervention_alerts.sql` |
| 10 | `progress_tracking.teacher_interventions` | id, teacher_id FK, student_id FK, classroom_id FK, intervention_type VARCHAR, notes TEXT, created_at | `tables/17-teacher_interventions.sql` |
| 11 | `progress_tracking.certificates` | id, user_id FK, module_id FK, certificate_type certificate_type, status certificate_status, issued_at TIMESTAMPTZ, certificate_url TEXT | `tables/18-certificates.sql` |
| 12 | `progress_tracking.teacher_alert_configurations` | id, teacher_id FK, classroom_id FK, alert_type VARCHAR, threshold_value DECIMAL, is_active BOOL | `tables/20-teacher_alert_configurations.sql` |
| 13 | `progress_tracking.engagement_metrics` | id, user_id FK, date DATE, session_count INT, total_duration_seconds INT, exercises_attempted INT, xp_earned_today INT | `tables/engagement_metrics.sql` |
| 14 | `progress_tracking.learning_paths` | id, name TEXT, description TEXT, module_sequence UUID[], is_active BOOL, created_by FK | `tables/learning_paths.sql` |
| 15 | `progress_tracking.learning_path_modules` | id, learning_path_id FK, module_id FK, order_index INT | `tables/_cross_schema/learning_path_modules.sql` |
| 16 | `progress_tracking.mastery_trackings` | id, user_id FK, exercise_type exercise_type, attempts_count INT, success_rate DECIMAL, mastery_level VARCHAR | `tables/mastery_tracking.sql` |
| 17 | `progress_tracking.module_completion_trackings` | id, user_id FK, module_id FK, completed_at TIMESTAMPTZ, final_score DECIMAL, grade_letter VARCHAR | `tables/module_completion_tracking.sql` |
| 18 | `progress_tracking.progress_snapshots` | id, user_id FK, snapshot_date DATE, total_xp INT, level INT, modules_completed INT, streak_days INT, snapshot_data JSONB | `tables/progress_snapshots.sql` |
| 19 | `progress_tracking.skill_assessments` | id, user_id FK, skill_name VARCHAR, assessment_type VARCHAR, score DECIMAL, assessed_at TIMESTAMPTZ | `tables/skill_assessments.sql` |
| 20 | `progress_tracking.teacher_notes` | id, teacher_id FK→profiles, student_id FK→profiles, classroom_id FK, note_type VARCHAR, content TEXT, is_private BOOL | `tables/teacher_notes.sql` |
| 21 | `progress_tracking.user_learning_paths` | id, user_id FK, learning_path_id FK, started_at TIMESTAMPTZ, completed_at TIMESTAMPTZ, current_module_index INT | `tables/user_learning_paths.sql` |

### Schema: audit_logging (7 tables)

| # | Table | Key Columns | Source File |
|---|-------|-------------|-------------|
| 1 | `audit_logging.audit_logs` | id, user_id FK, action audit_action, resource_type VARCHAR, resource_id UUID, ip_address INET, metadata JSONB, created_at | `tables/01-audit_logs.sql` |
| 2 | `audit_logging.performance_metrics` | id, metric_type metric_type, metric_name VARCHAR, value DECIMAL, unit VARCHAR, recorded_at TIMESTAMPTZ | `tables/02-performance_metrics.sql` |
| 3 | `audit_logging.system_alerts` | id, alert_type VARCHAR, severity alert_severity, status alert_status, message TEXT, metadata JSONB, acknowledged_by FK, created_at | `tables/03-system_alerts.sql` |
| 4 | `audit_logging.system_logs` | id, level log_level, service VARCHAR, message TEXT, stack_trace TEXT, metadata JSONB, created_at | `tables/04-system_logs.sql` |
| 5 | `audit_logging.user_activity_logs` | id, user_id FK, activity_type VARCHAR, session_id FK, ip_address INET, user_agent TEXT, metadata JSONB, created_at | `tables/05-user_activity_logs.sql` |
| 6 | `audit_logging.activity_log` | id, user_id FK, action VARCHAR, resource_type VARCHAR, details JSONB, created_at | `tables/06-activity_log.sql` |
| 7 | `audit_logging.pending_user_initialization` | id, user_id FK, status VARCHAR, retry_count INT, last_error TEXT, created_at | `tables/08-pending_user_initialization.sql` |

### Schema: admin_dashboard (3 tables)

| # | Table | Key Columns | Source File |
|---|-------|-------------|-------------|
| 1 | `admin_dashboard.bulk_operations` | id, operation_type VARCHAR, status VARCHAR, total_items INT, processed_items INT, failed_items INT, started_by FK→profiles, started_at TIMESTAMPTZ | `tables/01-bulk_operations.sql` |
| 2 | `admin_dashboard.admin_reports` | id, report_type VARCHAR, title TEXT, data JSONB, generated_by FK, generated_at TIMESTAMPTZ, period_start DATE, period_end DATE | `tables/02-admin_reports.sql` |
| 3 | `admin_dashboard.metrics_history` | id, metric_name VARCHAR, metric_value DECIMAL, dimension VARCHAR, recorded_at TIMESTAMPTZ | `tables/03-metrics_history.sql` |

### Schema: system_configuration (9 tables)

| # | Table | Key Columns | Source File |
|---|-------|-------------|-------------|
| 1 | `system_configuration.system_settings` | id, key VARCHAR UNIQUE, value TEXT, setting_type setting_type, description TEXT, is_editable BOOL | `tables/01-system_settings.sql` |
| 2 | `system_configuration.gamification_parameters` | id, parameter_name VARCHAR UNIQUE, value DECIMAL, description TEXT, updated_by FK | `tables/02-gamification_parameters.sql` |
| 3 | `system_configuration.notification_settings` | id, user_id FK, notification_type VARCHAR, channel VARCHAR, is_enabled BOOL | `tables/03-notification_settings.sql` |
| 4 | `system_configuration.rate_limits` | id, resource_type VARCHAR UNIQUE, requests_per_minute INT, is_enabled BOOL, created_at | `tables/04-rate_limits.sql` |
| 5 | `system_configuration.notification_settings_globals` | id, notification_type VARCHAR, default_enabled BOOL, allowed_channels VARCHAR[], description TEXT | `tables/05-notification_settings_global.sql` |
| 6 | `system_configuration.feature_flags` | id, flag_name VARCHAR UNIQUE, is_enabled BOOL, description TEXT, updated_by FK, updated_at | `tables/06-feature_flags.sql` |
| 7 | `system_configuration.api_configurations` | id, api_name VARCHAR UNIQUE, base_url TEXT, timeout_seconds INT, retry_attempts INT, is_active BOOL | `tables/api_configurations.sql` |
| 8 | `system_configuration.environment_configs` | id, environment VARCHAR, config_key VARCHAR, config_value TEXT, is_encrypted BOOL, UNIQUE(environment, config_key) | `tables/environment_configs.sql` |
| 9 | `system_configuration.tenant_configurations` | id, tenant_id FK, config_key VARCHAR, config_value TEXT, UNIQUE(tenant_id, config_key) | `tables/tenant_configurations.sql` |

### Schema: notifications (7 tables)

| # | Table | Key Columns | Source File |
|---|-------|-------------|-------------|
| 1 | `notifications.notifications` | id, user_id FK, tenant_id FK, type gamification_system.notification_type, title TEXT, message TEXT, is_read BOOL DEFAULT false, metadata JSONB, created_at | `tables/01-notifications.sql` |
| 2 | `notifications.notification_preferences` | id, user_id FK UNIQUE, email_enabled BOOL, push_enabled BOOL, sms_enabled BOOL, in_app_enabled BOOL, preferences JSONB | `tables/02-notification_preferences.sql` |
| 3 | `notifications.notification_logs` | id, user_id FK, notification_id FK, channel VARCHAR, status VARCHAR, sent_at TIMESTAMPTZ, error_message TEXT | `tables/03-notification_logs.sql` |
| 4 | `notifications.notification_templates` | id, type VARCHAR, channel VARCHAR, subject TEXT, body TEXT, variables JSONB, is_active BOOL | `tables/04-notification_templates.sql` |
| 5 | `notifications.notification_queue` | id, user_id FK, notification_type VARCHAR, payload JSONB, priority INT DEFAULT 0, scheduled_for TIMESTAMPTZ, processed_at TIMESTAMPTZ, status VARCHAR | `tables/05-notification_queue.sql` |
| 6 | `notifications.user_devices` | id, user_id FK, device_token TEXT, device_type VARCHAR, platform VARCHAR, is_active BOOL, last_seen_at TIMESTAMPTZ | `tables/06-user_devices.sql` |
| 7 | `notifications.rate_limit_logs` | id, user_id FK, notification_type VARCHAR, channel VARCHAR, sent_at TIMESTAMPTZ | `tables/07-rate_limit_logs.sql` |

### Schema: communication (5 tables)

| # | Table | Key Columns | Source File |
|---|-------|-------------|-------------|
| 1 | `communication.messages` | id, sender_id FK→profiles, recipient_id FK, classroom_id FK, subject TEXT, body TEXT, is_read BOOL, parent_message_id FK (self), created_at | `tables/01-messages.sql` |
| 2 | `communication.message_participants` | id, message_id FK, user_id FK, is_read BOOL, read_at TIMESTAMPTZ | `tables/02-message_participants.sql` |
| 3 | `communication.conversations` | id UUID PK, title VARCHAR(255), description TEXT, conversation_type VARCHAR(30) NOT NULL DEFAULT 'direct', classroom_id FK, is_archived BOOL, is_readonly BOOL, last_message_id UUID, last_message_at TIMESTAMPTZ, message_count INT, created_by FK | `tables/03-conversation_participants.sql` (first table in file) |
| 4 | `communication.conversation_participants` | id UUID PK, conversation_id FK, user_id FK, role VARCHAR(20) NOT NULL DEFAULT 'member', joined_at TIMESTAMPTZ, is_active BOOL, is_muted BOOL, unread_count INT, last_read_at TIMESTAMPTZ, nickname VARCHAR(100) | `tables/03-conversation_participants.sql` (second table in file) |

**Note:** `03-conversation_participants.sql` defines 2 tables: `conversations` + `conversation_participants`.

### Schema: lti_integration (3 tables)

| # | Table | Key Columns | Source File |
|---|-------|-------------|-------------|
| 1 | `lti_integration.lti_consumers` | id, consumer_key TEXT UNIQUE, consumer_secret TEXT, name TEXT, is_active BOOL | `tables/01-lti_consumers.sql` |
| 2 | `lti_integration.lti_sessions` | id, consumer_id FK, user_id FK→profiles, resource_link_id TEXT, context_id TEXT, created_at, expires_at TIMESTAMPTZ | `tables/02-lti_sessions.sql` |
| 3 | `lti_integration.lti_grade_passbacks` | id, session_id FK, user_id FK, exercise_id FK, score DECIMAL, status VARCHAR, submitted_at TIMESTAMPTZ | `tables/03-lti_grade_passback.sql` |

### Schema: data_warehouse (16 tables — DDL-only, no backend entities)

| # | Table | Source File |
|---|-------|-------------|
| 1 | `data_warehouse.dim_date` | `tables/dim_date.sql` |
| 2 | `data_warehouse.dim_time` | `tables/dim_time.sql` |
| 3 | `data_warehouse.dim_student` | `tables/dim_student.sql` |
| 4 | `data_warehouse.dim_teacher` | `tables/dim_teacher.sql` |
| 5 | `data_warehouse.dim_exercise` | `tables/dim_exercise.sql` |
| 6 | `data_warehouse.dim_module` | `tables/dim_module.sql` |
| 7 | `data_warehouse.dim_achievement` | `tables/dim_achievement.sql` |
| 8 | `data_warehouse.dim_event_type` | `tables/dim_event_type.sql` |
| 9 | `data_warehouse.fact_exercise_completions` | `tables/fact_exercise_completions.sql` |
| 10 | `data_warehouse.fact_daily_progress` | `tables/fact_daily_progress.sql` |
| 11 | `data_warehouse.fact_gamification_events` | `tables/fact_gamification_events.sql` |
| 12 | `data_warehouse.fact_teacher_metrics` | `tables/fact_teacher_metrics.sql` |
| 13 | `data_warehouse.etl_extraction_logs` | `tables/etl_extraction_log.sql` |
| 14 | `data_warehouse.etl_load_logs` | `tables/etl_load_log.sql` |
| 15 | `data_warehouse.ml_model_weights` | `tables/ml_model_weights.sql` |
| 16 | `data_warehouse.ml_prediction_logs` | `tables/ml_prediction_logs.sql` |

**Table Count by Schema:**
- auth: 1
- auth_management: 17
- gamification_system: 21
- educational_content: 24
- content_management: 10
- social_features: 30
- progress_tracking: 21
- audit_logging: 7
- admin_dashboard: 3
- system_configuration: 9
- notifications: 7
- communication: 5 (note: 03-conversation_participants.sql defines 2 tables)
- lti_integration: 3
- data_warehouse: 16
- **Total: 174** (vs. stated 173 — discrepancy of 1 may be due to a dropped/archived table; see audit_logging/_archived)

---

## PART 4: FUNCTIONS

### Schema: gamilit (utility functions)

| Function | Parameters | Returns | Source File |
|----------|-----------|---------|-------------|
| `gamilit.now_mexico()` | — | TIMESTAMPTZ | `00-prerequisites.sql` + `functions/08-now_mexico.sql` |
| `gamilit.update_updated_at_column()` | — | TRIGGER | `functions/15-update_updated_at_column.sql` |
| `gamilit.get_current_user_role()` | — | TEXT | `functions/03-get_current_user_role.sql` |
| `gamilit.get_current_user_id()` | — | UUID | `functions/02-get_current_user_id.sql` |
| `gamilit.get_current_tenant_id()` | — | UUID | `functions/09-get_current_tenant_id.sql` |
| `gamilit.is_admin()` | — | BOOLEAN | `functions/05-is_admin.sql` |
| `gamilit.is_super_admin()` | — | BOOLEAN | `functions/05b-is_super_admin.sql` |
| `gamilit.audit_profile_changes()` | — | TRIGGER | `functions/01-audit_profile_changes.sql` |
| `gamilit.initialize_user_stats()` | — | TRIGGER | `functions/04-initialize_user_stats.sql` |
| `gamilit.initialize_user_missions()` | p_user_id UUID | VOID | `functions/18-initialize_user_missions.sql` |
| `gamilit.update_user_stats_on_exercise_complete()` | — | TRIGGER | `functions/14-update_user_stats_on_exercise_complete.sql` |
| `gamilit.update_classroom_member_count()` | — | TRIGGER | `functions/10-update_classroom_member_count.sql` |
| `gamilit.set_profile_defaults()` | — | TRIGGER | `functions/09-set_profile_defaults.sql` |
| `gamilit.set_default_tenant()` | — | TRIGGER | `functions/11-set_default_tenant.sql` |
| `gamilit.update_user_last_login()` | — | TRIGGER | `functions/11-update_user_last_login.sql` |
| `gamilit.validate_email_format()` | p_email TEXT | BOOLEAN | `functions/12-validate_email_format.sql` |
| `gamilit.validate_username()` | p_username TEXT | BOOLEAN | `functions/13-validate_username.sql` |
| `gamilit.assign_default_classroom()` | — | TRIGGER | `functions/15-assign_default_classroom.sql` |
| `gamilit.update_module_progress_on_exercise_complete()` | — | TRIGGER | `functions/15-update_module_progress_on_exercise_complete.sql` |
| `gamilit.normalize_text()` | p_text TEXT | TEXT | `functions/16-normalize_text.sql` |
| `gamilit.update_mission_progress()` | (various) | (various) | `functions/50-update_mission_progress.sql` |
| `gamilit.mission_trigger_wrappers()` | — | (9 triggers) | `functions/51-mission_trigger_wrappers.sql` |
| `gamilit.update_module_progress_on_submission_graded()` | — | TRIGGER | `functions/20-update_module_progress_on_submission_graded.sql` |
| `gamilit.update_user_stats_on_submission_graded()` | — | TRIGGER | `functions/27-update_user_stats_on_submission_graded.sql` |
| `gamilit.initialize_module_progress_for_users()` | — | VOID | `functions/05-initialize_module_progress_for_users.sql` |
| `gamilit.validate_date_range()` | — | TRIGGER | `functions/validate_date_range.sql` |
| `gamilit.retry_helper_functions()` | — | (2 functions) | `functions/19-retry_helper_functions.sql` |

### Schema: gamification_system

| Function | Description | Source File |
|----------|-------------|-------------|
| `gamification_system.process_xp_update()` | Process XP updates and check rank promotion | `functions/09-process_xp_update.sql` |
| `gamification_system.apply_xp_boost()` | Apply active XP boosts to earned XP | `functions/apply_xp_boost.sql` |
| `gamification_system.award_ml_coins()` | Award ML coins to user | `functions/award_ml_coins.sql` |
| `gamification_system.calculate_level_from_xp()` | Calculate user level from XP | `functions/calculate_level_from_xp.sql` |
| `gamification_system.calculate_maya_rank_helpers()` | Helper functions for rank calculation (2 functions) | `functions/calculate_maya_rank_helpers.sql` |
| `gamification_system.calculate_user_rank()` | Calculate current rank from XP | `functions/calculate_user_rank.sql` |
| `gamification_system.check_rank_promotion()` | Check if user qualifies for rank promotion | `functions/check_rank_promotion.sql` |
| `gamification_system.check_and_award_achievements()` | Check and award achievements based on stats | `functions/check_and_award_achievements.sql` |
| `gamification_system.claim_achievement_reward()` | Claim XP/coin reward for achievement | `functions/claim_achievement_reward.sql` |
| `gamification_system.consume_comodin()` | Consume a comodin from inventory | `functions/consume_comodin.sql` |
| `gamification_system.get_rank_benefits()` | Get benefits for a maya rank | `functions/get_rank_benefits.sql` |
| `gamification_system.get_rank_multiplier()` | Get XP multiplier for a rank | `functions/get_rank_multiplier.sql` |
| `gamification_system.get_user_comodines()` | Get user's comodin inventory | `functions/get_user_comodines.sql` |
| `gamification_system.get_user_inventory_summary()` | Get user's full inventory summary | `functions/get_user_inventory_summary.sql` |
| `gamification_system.get_user_rank_progress()` | Get user's rank progress details | `functions/get_user_rank_progress.sql` |
| `gamification_system.get_user_rank_requirements()` | Get requirements for next rank | `functions/get_user_rank_requirements.sql` |
| `gamification_system.process_exercise_completion()` | Process XP/coins on exercise completion | `functions/process_exercise_completion.sql` |
| `gamification_system.promote_to_next_rank()` | Promote user to next maya rank | `functions/promote_to_next_rank.sql` |
| `gamification_system.update_leaderboard_streaks()` | Update leaderboard streak data | `functions/update_leaderboard_streaks.sql` |
| `gamification_system.update_user_rank()` | Update user_ranks table | `functions/update_user_rank.sql` |

### Schema: educational_content (validate functions)

Source files: `functions/02-validate_answer.sql` through `functions/23-validate_module4_module5.sql`, plus `calculate_learning_path.sql`, `get_recommended_missions.sql`, `validate_exercise_structure.sql`

~22 validation functions for each exercise mechanic type, plus:
- `educational_content.calculate_learning_path()`
- `educational_content.get_recommended_missions()`
- `educational_content.validate_exercise_structure()`
- `educational_content.recalculate_exercise()`

### Schema: progress_tracking

| Function | Source File |
|----------|-------------|
| `progress_tracking.calculate_module_progress()` | `functions/01-calculate_module_progress.sql` |
| `progress_tracking.get_user_progress()` | `functions/03-get_user_progress.sql` |
| `progress_tracking.get_classroom_analytics()` | `functions/05-get_classroom_analytics.sql` |
| `progress_tracking.update_mission_progress()` | `functions/06-update_mission_progress.sql` |
| `progress_tracking.enhanced_analytics_functions()` | `functions/10-enhanced_analytics_functions.sql` (2 functions) |
| `progress_tracking.generate_student_alerts()` | `functions/15-generate_student_alerts.sql` |
| `progress_tracking.create_manual_review_on_submission()` | `functions/16-create_manual_review_on_submission.sql` |
| `progress_tracking.sync_module_progress_scores()` | `functions/17-sync_module_progress_scores.sql` (2 functions) |
| `progress_tracking.update_module_progress_complete()` | `functions/20-update_module_progress_complete.sql` |
| `progress_tracking.check_difficulty_promotion_eligibility()` | `functions/check_difficulty_promotion_eligibility.sql` |
| `progress_tracking.promote_user_difficulty_level()` | `functions/promote_user_difficulty_level.sql` |
| `progress_tracking.update_difficulty_progress()` | `functions/update_difficulty_progress.sql` |

### Schema: communication

| Function | Source File |
|----------|-------------|
| `communication.update_conversation_timestamp()` | `tables/03-conversation_participants.sql` |
| `communication.update_conv_participant_timestamp()` | `tables/03-conversation_participants.sql` |
| `communication.get_conversation_participants()` | `tables/03-conversation_participants.sql` |
| `communication.get_user_conversations()` | `tables/03-conversation_participants.sql` |
| `communication.add_conversation_participant()` | `tables/03-conversation_participants.sql` |
| `communication.remove_conversation_participant()` | `tables/03-conversation_participants.sql` |
| `communication.mark_conversation_as_read()` | `tables/03-conversation_participants.sql` |
| `communication.increment_unread_for_conversation()` | `tables/03-conversation_participants.sql` |
| `communication.get_total_unread_conversations()` | `tables/03-conversation_participants.sql` |
| `communication.create_conversation()` | `tables/03-conversation_participants.sql` |
| Additional message functions (8+) | `functions/01-trigger-functions.sql`, `functions/02-message-functions.sql`, `functions/03-message-participant-functions.sql`, `functions/04-conversation-functions.sql` |

### Schema: social_features

| Function | Source File |
|----------|-------------|
| `social_features.friendship_helpers` (9 functions) | `functions/friendship_helpers.sql` |
| `social_features.block_helpers` (8 functions) | `functions/block_helpers.sql` |
| `social_features.sync_teacher_classroom()` | `functions/sync_teacher_classroom.sql` |
| `social_features.cleanup_old_notifications()` | `functions/cleanup_old_notifications.sql` |

### Schema: content_management

| Function | Source File |
|----------|-------------|
| `content_management.apply_moderation_rules()` | `functions/01-apply_moderation_rules.sql` |
| `content_management.check_keyword_rule()` | `functions/02-check_keyword_rule.sql` |
| `content_management.check_pattern_rule()` | `functions/03-check_pattern_rule.sql` |
| `content_management.auto_moderate_content()` | `functions/04-auto_moderate_content.sql` |

### Schema: auth_management

| Function | Source File |
|----------|-------------|
| `auth_management.assign_role_to_user()` | `functions/01-assign_role_to_user.sql` |
| `auth_management.get_user_role()` | `functions/02-get_user_role.sql` |
| `auth_management.verify_user_permission()` | `functions/03-verify_user_permission.sql` |
| `auth_management.remove_role_from_user()` | `functions/04-remove_role_from_user.sql` |
| `auth_management.hash_token()` | `functions/05-hash_token.sql` |
| `auth_management.update_user_preferences()` | `functions/06-update_user_preferences.sql` |

### Schema: auth

| Function | Source File |
|----------|-------------|
| `auth.uid()` | `schemas/auth/functions/01-uid.sql` |

### Schema: system_configuration

| Function | Source File |
|----------|-------------|
| `system_configuration.is_feature_enabled()` | `functions/is_feature_enabled.sql` |
| `system_configuration.update_feature_flag()` | `functions/update_feature_flag.sql` |

### Schema: notifications

| Function | Source File |
|----------|-------------|
| `notifications.send_notification()` | `functions/01-send_notification.sql` |
| `notifications.get_user_preferences()` | `functions/02-get_user_preferences.sql` |
| `notifications.queue_batch_notifications()` | `functions/03-queue_batch_notifications.sql` |

### Schema: audit_logging

| Function | Source File |
|----------|-------------|
| `audit_logging.log_audit_event()` | `functions/log_audit_event.sql` |
| `audit_logging.log_system_event()` | `functions/log_system_event.sql` |
| `audit_logging.cleanup_old_user_activity()` | `functions/cleanup_old_user_activity.sql` |
| `audit_logging.cleanup_old_system_logs()` | `functions/cleanup_old_system_logs.sql` |
| `audit_logging.retry_pending_initializations()` | `functions/02-retry_pending_initializations.sql` (2 functions) |

### Schema: data_warehouse

| Function | Source File |
|----------|-------------|
| `data_warehouse.update_etl_extraction_logs_updated_at()` | `tables/etl_extraction_log.sql` |
| Additional ML functions | `tables/ml_model_weights.sql` (3 functions inline) |
| Prediction views functions | `tables/ml_prediction_logs.sql` (2 functions inline) |

---

## PART 5: TRIGGERS

### Batch updated_at triggers (from 00-batch_updated_at_triggers.sql files)

| Schema | Tables Covered | Source File |
|--------|----------------|-------------|
| auth_management | tenants, profiles, auth_attempts, user_roles, user_sessions, user_preferences, security_events, parent_accounts, parent_student_links | `triggers/00-batch_updated_at_triggers.sql` |
| gamification_system | user_stats, user_ranks, achievements, missions, shop_items, user_purchases, active_boosts, inventory_transactions | `triggers/00-batch_updated_at_triggers.sql` |
| educational_content | modules, exercises, assignments, assignment_submissions | `triggers/00-batch_updated_at_triggers.sql` |
| social_features | classrooms, classroom_members, schools, teams, guilds, guild_members | `triggers/00-batch_updated_at_triggers.sql` |
| progress_tracking | module_progress, exercise_attempts, exercise_submissions, learning_sessions, manual_reviews | `triggers/00-batch_updated_at_triggers.sql` |
| system_configuration | system_settings, feature_flags | `triggers/00-batch_updated_at_triggers.sql` |
| audit_logging | system_alerts | `triggers/00-batch_updated_at_triggers.sql` |

### Domain-specific triggers

| Trigger Name | Table | Timing | Event | Function | Source File |
|--------------|-------|--------|-------|----------|-------------|
| `trg_audit_profile_changes` | auth_management.profiles | AFTER | INSERT, UPDATE | `gamilit.audit_profile_changes()` | `triggers/03-trg_audit_profile_changes.sql` |
| `trg_ensure_profile_name` | auth_management.profiles | BEFORE | INSERT, UPDATE | (inline function) | `triggers/03b-trg_ensure_profile_name.sql` |
| `trg_initialize_user_stats` | auth_management.profiles | AFTER | INSERT | `gamilit.initialize_user_stats()` | `triggers/04-trg_initialize_user_stats.sql` |
| `trg_assign_default_classroom` | auth_management.profiles | AFTER | INSERT | `gamilit.assign_default_classroom()` | `triggers/08-trg_assign_default_classroom.sql` |
| `trg_achievement_unlocked` | gamification_system.user_achievements | AFTER | INSERT | `gamification_system.check_and_award_achievements()` | `triggers/01-trg_achievement_unlocked.sql` |
| `trg_process_xp_update` | gamification_system.user_stats | AFTER | UPDATE | `gamification_system.process_xp_update()` | `triggers/30-trg_process_xp_update.sql` |
| `trg_check_rank_promotion_on_xp_gain` | gamification_system.user_stats | AFTER | UPDATE | `gamification_system.check_rank_promotion()` | `triggers/trg_check_rank_promotion_on_xp_gain.sql` |
| `trg_update_missions_on_earn_xp` | gamification_system.user_stats | AFTER | UPDATE | (wrapper) | `triggers/27-trg_update_missions_on_earn_xp.sql` |
| `trg_update_missions_on_daily_streak` | gamification_system.user_stats | AFTER | UPDATE | (wrapper) | `triggers/29-trg_update_missions_on_daily_streak.sql` |
| `trg_update_missions_on_use_comodines` | gamification_system.comodin_usage_logs | AFTER | INSERT | (wrapper) | `triggers/28-trg_update_missions_on_use_comodines.sql` |
| `trg_initialize_module_progress` | educational_content.modules | AFTER | INSERT | `gamilit.initialize_module_progress_for_users()` | `triggers/15-trg_initialize_module_progress.sql` |
| `trg_auto_moderate` | content_management.flagged_contents | AFTER | INSERT | `content_management.auto_moderate_content()` | `triggers/03-trg_auto_moderate.sql` |
| `trg_create_manual_review` | progress_tracking.exercise_submissions | AFTER | INSERT | `progress_tracking.create_manual_review_on_submission()` | `triggers/16-trg_create_manual_review.sql` |
| `trg_create_manual_review_on_update` | progress_tracking.exercise_submissions | AFTER | UPDATE | `progress_tracking.create_manual_review_on_submission()` | `triggers/17-trg_create_manual_review_on_update.sql` |
| `trg_update_user_stats_on_exercise` | progress_tracking.exercise_attempts | AFTER | UPDATE | `gamilit.update_user_stats_on_exercise_complete()` | `triggers/21-trg_update_user_stats_on_exercise.sql` |
| `trg_update_module_progress_on_exercise` | progress_tracking.exercise_attempts | AFTER | UPDATE | `gamilit.update_module_progress_on_exercise_complete()` | `triggers/22-trg_update_module_progress_on_exercise.sql` |
| `trg_update_missions_on_exercise` | progress_tracking.exercise_attempts | AFTER | UPDATE | (wrapper) | `triggers/24-trg_update_missions_on_exercise.sql` |
| `trg_update_missions_on_submission` | progress_tracking.exercise_submissions | AFTER | INSERT, UPDATE | (wrapper) | `triggers/25-trg_update_missions_on_submission.sql` |
| `trg_update_missions_on_streak` | progress_tracking.exercise_attempts | AFTER | UPDATE | (wrapper) | `triggers/26-trg_update_missions_on_streak.sql` |
| `trg_update_missions_on_perfect_scores` | progress_tracking.exercise_attempts | AFTER | UPDATE | (wrapper) | `triggers/28-trg_update_missions_on_perfect_scores.sql` |
| `trg_update_missions_on_complete_modules` | progress_tracking.module_progress | AFTER | UPDATE | (wrapper) | `triggers/29-trg_update_missions_on_complete_modules.sql` |
| `trg_update_missions_on_explore_modules` | progress_tracking.module_progress | AFTER | INSERT | (wrapper) | `triggers/30-trg_update_missions_on_explore_modules.sql` |
| `trg_update_user_stats_on_submission` | progress_tracking.exercise_submissions | AFTER | UPDATE | `gamilit.update_user_stats_on_submission_graded()` | `triggers/31-trg_update_user_stats_on_submission.sql` |
| `trg_update_submitted_progress` | progress_tracking.exercise_submissions | AFTER | UPDATE | (inline) | `triggers/32-trg_update_submitted_progress.sql` |
| `trg_module_progress_complete` | progress_tracking.module_progress | AFTER | UPDATE | `progress_tracking.update_module_progress_complete()` | `triggers/40-trg_module_progress_complete.sql` |
| `trg_update_classroom_count` | social_features.classroom_members | AFTER | INSERT, DELETE | `gamilit.update_classroom_member_count()` | `triggers/25-trg_update_classroom_count.sql` |
| `trg_sync_teacher_classroom_on_insert` | social_features.teacher_classrooms | AFTER | INSERT | `social_features.sync_teacher_classroom()` | `triggers/26-trg_sync_teacher_classroom.sql` |
| `trg_update_conversation_timestamp` | communication.conversations | BEFORE | UPDATE | `communication.update_conversation_timestamp()` | `tables/03-conversation_participants.sql` |
| `trg_update_conv_participant_timestamp` | communication.conversation_participants | BEFORE | UPDATE | `communication.update_conv_participant_timestamp()` | `tables/03-conversation_participants.sql` |
| `trg_etl_extraction_logs_updated_at` | data_warehouse.etl_extraction_logs | BEFORE | UPDATE | `data_warehouse.update_etl_extraction_logs_updated_at()` | `tables/etl_extraction_log.sql` |
| `trg_feature_flags_updated_at` | system_configuration.feature_flags | BEFORE | UPDATE | `gamilit.update_updated_at_column()` | `triggers/00-batch_updated_at_triggers.sql` |
| `trg_system_settings_updated_at` | system_configuration.system_settings | BEFORE | UPDATE | `gamilit.update_updated_at_column()` | `triggers/00-batch_updated_at_triggers.sql` |
| `trg_system_alerts_updated_at` | audit_logging.system_alerts | BEFORE | UPDATE | `gamilit.update_updated_at_column()` | `triggers/00-batch_updated_at_triggers.sql` |
| `trg_tenant_configurations_updated_at` | system_configuration.tenant_configurations | BEFORE | UPDATE | `gamilit.update_updated_at_column()` | `tables/tenant_configurations.sql` |
| `trg_environment_configs_updated_at` | system_configuration.environment_configs | BEFORE | UPDATE | `gamilit.update_updated_at_column()` | `tables/environment_configs.sql` |
| `trg_api_configurations_updated_at` | system_configuration.api_configurations | BEFORE | UPDATE | `gamilit.update_updated_at_column()` | `tables/api_configurations.sql` |
| Additional communication triggers | various | — | — | — | `triggers/01-triggers.sql` |

---

## PART 6: RLS POLICIES

### Tables with ENABLE ROW LEVEL SECURITY

**Phase 1 (07-enable-rls.sql) — 26 tables:**
auth_management: auth_attempts, parent_accounts, parent_notifications, parent_student_links
communication: message_participants
educational_content: assignments, assignment_exercises, assignment_students, assignment_submissions, teacher_contents, media_attachments
gamification_system: active_boosts, inventory_transactions, user_purchases
lti_integration: lti_grade_passbacks, lti_sessions
progress_tracking: manual_reviews, mastery_trackings, module_completion_trackings, skill_assessments, student_intervention_alerts, teacher_interventions, user_current_levels
social_features: challenge_participants, challenge_results, discussion_threads, peer_challenges, user_follows, teacher_reports

**Phase 2 (07b-enable-rls-phase2.sql) — 34 tables:**
gamification_system: user_stats, user_achievements, ml_coins_transactions, comodines_inventory, user_ranks, comodin_usage_logs, comodin_usage_trackings
notifications: notifications, notification_preferences, notification_logs, user_devices
communication: messages
progress_tracking: learning_sessions, exercise_attempts, exercise_submissions, scheduled_missions, user_difficulty_progresses, module_progress, teacher_notes, certificates, learning_path_modules
social_features: classroom_members, team_members, friendships, team_challenges, social_interactions, classrooms
audit_logging: audit_logs, user_activity_logs
auth_management: user_preferences, user_sessions, security_events, email_verification_tokens
admin_dashboard: bulk_operations

**Phase 3 (07c-enable-rls-phase3.sql) — 19 tables:**
content_management: content_templates, marie_curie_contents, content_versions, flagged_contents, moderation_rules, tags, content_authors, content_categories, media_metadatas
system_configuration: system_settings, gamification_parameters, notification_settings, rate_limits, notification_settings_globals, feature_flags, api_configurations, environment_configs, tenant_configurations

**Phase 4 (07d-rls-policies-pending-tables.sql) — additional 25 tables with updated/new policies:**
Also enables RLS on: progress_tracking.user_learning_paths, progress_tracking.engagement_metrics, progress_tracking.progress_snapshots, auth_management.two_factor_tokens, social_features.guild_join_requests, gamification_system.user_equipped_items, gamification_system.user_purchases (duplicate enable), data_warehouse.ml_prediction_logs

**Inline RLS (in table DDL files):**
auth_management.profiles (4 policies inline)
communication.conversations (4 policies inline)
communication.conversation_participants (4 policies inline)
gamification_system.comodin_uses (3 policies inline with FORCE RLS)
educational_content.modules (3 policies)
educational_content.exercises (3 policies)
gamification_system.user_stats (3 policies)
gamification_system.user_achievements (2 policies)
gamification_system.ml_coins_transactions (2 policies)

**Total CREATE POLICY statements: ~637** (across all files, including DROP+recreate in 07d)
**Effective unique policies: ~251** (after accounting for DROP IF EXISTS replacements in 07d)

---

## PART 7: VIEWS

### Regular Views (18 total)

| View | Schema | Source File |
|------|--------|-------------|
| `auth.tenants_alias` | auth | `schemas/auth/views/tenants_alias.sql` |
| `gamilit.number_series` | gamilit | `schemas/gamilit/views/number_series.sql` |
| `admin_dashboard.recent_activity` | admin_dashboard | `views/01-recent_activity.sql` |
| `admin_dashboard.assignment_submission_stats` | admin_dashboard | `views/assignment_submission_stats.sql` |
| `admin_dashboard.organization_stats_summary` | admin_dashboard | `views/organization_stats_summary.sql` |
| `admin_dashboard.recent_admin_actions` | admin_dashboard | `views/recent_admin_actions.sql` |
| `admin_dashboard.user_stats_summary` | admin_dashboard | `views/user_stats_summary.sql` |
| `admin_dashboard.moderation_queue` | admin_dashboard | `views/moderation_queue.sql` |
| `admin_dashboard.classroom_overview` | admin_dashboard | `views/classroom_overview.sql` |
| `educational_content.v_validation_analysis` | educational_content | `views/01-v_validation_analysis.sql` |
| `educational_content.exercises_with_mechanics` | educational_content | `views/02-exercises_with_mechanics.sql` |
| `progress_tracking.teacher_pending_reviews` | progress_tracking | `views/02-teacher_pending_reviews.sql` |
| `progress_tracking.user_progress_summary` | progress_tracking | `views/user_progress_summary.sql` |
| `social_features.classroom_progress_overview` | social_features | `views/01-classroom_progress_overview.sql` |
| `communication.recent_classroom_messages` | communication | `views/01-recent_classroom_messages.sql` |
| `data_warehouse.v_student_engagement_metrics` | data_warehouse | `views/v_student_engagement_metrics.sql` |
| `data_warehouse.v_student_performance_metrics` | data_warehouse | `views/v_student_performance_metrics.sql` |
| `data_warehouse.v_student_feature_base` | data_warehouse | `views/v_student_feature_base.sql` |

### Materialized Views (7 total)

| Materialized View | Schema | Source File |
|-------------------|--------|-------------|
| `admin_dashboard.mv_system_health` | admin_dashboard | `materialized-views/01-materialized_views.sql` |
| `admin_dashboard.mv_daily_usage_stats` | admin_dashboard | `materialized-views/01-materialized_views.sql` |
| `admin_dashboard.mv_content_performance` | admin_dashboard | `materialized-views/01-materialized_views.sql` |
| `gamification_system.mv_global_leaderboard` | gamification_system | `materialized-views/01-mv_global_leaderboard.sql` |
| `gamification_system.mv_classroom_leaderboard` | gamification_system | `materialized-views/02-mv_classroom_leaderboard.sql` |
| `gamification_system.mv_weekly_leaderboard` | gamification_system | `materialized-views/03-mv_weekly_leaderboard.sql` |
| `gamification_system.mv_mechanic_leaderboard` | gamification_system | `materialized-views/04-mv_mechanic_leaderboard.sql` |

---

## PART 8: INDEXES

Total CREATE INDEX statements in DDL: **~301**

Key index files (dedicated index directories):
- `schemas/auth_management/indexes/` — 5 files (user_preferences theme, user_roles GIN, user_roles composite, session token hashes)
- `schemas/gamification_system/indexes/` — 4 files (achievement_categories, active_boosts, achievements metadata GIN, inventory_transactions)
- `schemas/educational_content/indexes/` — (inline in table files)
- `schemas/progress_tracking/indexes/` — 3 files (module_progress GIN, scheduled_missions, teacher portal)
- `schemas/social_features/indexes/` — 1 file (teacher portal)
- `schemas/content_management/indexes/` — 2 files (marie_curie content GIN)
- `schemas/data_warehouse/indexes/` — 1 file with 33 indexes (warehouse performance)
- `schemas/optimization/indexes/` — 1 file with 10 FK optimization indexes
- `schemas/optimization/` — `99-optimization-indexes-triggers.sql` with 5 more

Inline indexes are spread across all table files. Notable high-index tables:
- `progress_tracking.exercise_attempts` — 5 inline indexes
- `progress_tracking.module_progress` — 7 inline indexes
- `data_warehouse.fact_exercise_completions` — 14 indexes
- `data_warehouse.fact_gamification_events` — 15 indexes
- `social_features.peer_challenges` — 10 indexes
- `gamification_system.comodin_uses` — 7 indexes (including GIN on JSONB)
- `auth_management.profiles` — 11 indexes

---

## PART 9: GRANTs AND ALTER ROLE

### Source: 99-post-ddl-permissions.sql

**GRANT USAGE on schemas to gamilit_user:**
auth, auth_management, system_configuration, gamification_system, educational_content, content_management, social_features, progress_tracking, audit_logging, gamilit, public, notifications, communication, lti_integration, admin_dashboard, storage

**GRANT ALL PRIVILEGES ON ALL TABLES** to gamilit_user for all schemas above (except gamilit, public, optimization, data_warehouse)

**GRANT ALL PRIVILEGES ON ALL SEQUENCES** to gamilit_user for same schemas

**GRANT EXECUTE ON ALL FUNCTIONS** to gamilit_user for:
gamilit, auth, public, notifications, communication, lti_integration

**ALTER DEFAULT PRIVILEGES** — all schemas for tables, sequences, functions

**ALTER ROLE:**
```sql
ALTER ROLE gamilit_user BYPASSRLS;
```
**Source:** `99-post-ddl-permissions.sql` line 119

### Inline GRANTs (in table files)

Many table files contain `GRANT ALL ON TABLE ... TO gamilit_user` inline.
Notable additional grants:
- `communication.conversations` / `communication.conversation_participants` → `gamilit_user` + function EXECUTEs
- `gamification_system.comodin_uses` → `gamilit_user` + `SELECT TO authenticated`
- `auth.users` → `GRANT ALL ON TABLE auth.users TO gamilit_user`

### Roles Created (00-prerequisites.sql)

| Role | Membership | Description |
|------|-----------|-------------|
| `authenticated` | — | RLS: authenticated users |
| `anon` | — | RLS: anonymous users |
| `service_role` | — | RLS: backend service |
| `admin_teacher` | authenticated | RLS: teachers/admins |
| `student` | authenticated | RLS: students |
| `super_admin` | authenticated | RLS: super admins |

---

## PART 10: EXTENSIONS

| Extension | Purpose | Source |
|-----------|---------|--------|
| `pg_stat_statements` | Query monitoring and performance analysis | `00-prerequisites.sql` |
| `pg_trgm` | Fuzzy string matching for exercise validators (similarity function) | `00-prerequisites.sql` |
| `pgcrypto` | Password hashing (crypt, gen_salt) for demo seeds | `00-prerequisites.sql` |

---

## PART 11: NOTABLE MULTI-TABLE FILES

| File | Tables Defined | Count |
|------|----------------|-------|
| `communication/tables/03-conversation_participants.sql` | conversations, conversation_participants | 2 |
| `social_features/tables/24-guild_missions.sql` | guild_missions, guild_mission_contributions | 2 |
| `gamification_system/tables/_cross_schema/21-comodin_uses.sql` | comodin_uses (1 table, but previous counts had inline ENUM too) | 1 |
| `data_warehouse/tables/etl_extraction_log.sql` | etl_extraction_logs (file name ≠ table name) | 1 |

---

## PART 12: DATA_WAREHOUSE NOTABLE ITEMS

The data_warehouse schema is marked as DDL-only (no backend entities). Key points:
- Tables accessed via `ENABLE_DATA_WAREHOUSE=true` flag in backend
- `etl_load_log.sql` defines inline ENUM `data_warehouse.etl_load_status`
- `ml_prediction_logs.sql` has RLS policies enabled (Phase 4 / 07d file)
- 3 materialized view files in `data_warehouse/views/` are regular VIEWs (not materialized)

---

## KNOWN DISCREPANCIES / AUDIT NOTES

1. **Table count:** DDL grep shows 179 CREATE TABLE occurrences across 172 files, with multi-table files (conversation_participants: 2, guild_missions: 2, etl_extraction_log: appears 2x due to inline helper, comodin_uses: 3x grep hit due to comments). Reconciled count: **174 actual tables** (includes all schemas). The stated "173" in MASTER_INVENTORY likely excludes 1 communication table or a placeholder.

2. **ENUM duplication:** 22 ENUMs are defined in BOTH `00-prerequisites.sql` and their schema-specific enum files. This is intentional (idempotent `DO $$ ... EXCEPTION WHEN duplicate_object`). The effective count is 42 unique ENUM types.

3. **auth_management.07 table file gap:** Files go 01→02→03→03b→04→05→06→07→08→09→10→11→12→13→14→15→16. No table file numbered 07 is listed in indexes dir but `07-password_reset_tokens.sql` exists.

4. **RLS policy effective count:** The 07d file uses `DROP POLICY IF EXISTS ... CREATE POLICY` pattern, replacing policies from earlier phases. Net effective policies: ~251.

5. **storage schema:** Listed in schema CREATE + 99-post-ddl-permissions GRANT USAGE, but no table files found. Placeholder schema only.

6. **optimization schema:** Contains only index files (no tables). Not listed in 99-post-ddl-permissions GRANTs.

7. **data_warehouse GRANTs:** Not covered by bulk GRANT in 99-post-ddl-permissions.sql. Individual grants in table files (`GRANT SELECT, INSERT, UPDATE ON data_warehouse.etl_extraction_logs TO gamilit_user`).

8. **FORCE ROW LEVEL SECURITY:** Applied to specific HIGH-RISK tables in 07d:
   - auth_management.auth_attempts
   - educational_content.assessment_rubrics, media_resources
   - progress_tracking.scheduled_missions, student_intervention_alerts, teacher_alert_configurations, user_learning_paths, engagement_metrics, progress_snapshots
   - system_configuration.notification_settings
   - gamification_system.user_equipped_items, user_purchases, comodin_uses
   - auth_management.two_factor_tokens
   - social_features.guild_join_requests

---

## FILE TRACEABILITY INDEX

| Object Category | Location Pattern |
|-----------------|-----------------|
| ENUMs | `schemas/{schema}/enums/*.sql` + `00-prerequisites.sql` |
| Tables (primary) | `schemas/{schema}/tables/[NN]-{table_name}.sql` |
| Tables (cross-schema) | `schemas/{schema}/tables/_cross_schema/*.sql` |
| Functions | `schemas/{schema}/functions/*.sql` |
| Triggers | `schemas/{schema}/triggers/*.sql` |
| Indexes | `schemas/{schema}/indexes/*.sql` + inline in table files |
| Views | `schemas/{schema}/views/*.sql` |
| Materialized Views | `schemas/{schema}/materialized-views/*.sql` |
| RLS Policies (inline) | Inside table `.sql` files |
| RLS Phase files | `07-enable-rls.sql`, `07b-enable-rls-phase2.sql`, `07c-enable-rls-phase3.sql`, `07d-rls-policies-pending-tables.sql` |
| Schema RLS dirs | `schemas/{schema}/rls-policies/*.sql` |
| GRANTs (bulk) | `99-post-ddl-permissions.sql` |
| Extensions + Roles | `00-prerequisites.sql` |
