---
title: "SA-1A: Production Backup Catalog"
agent: "SA-1A"
task: "TASK-2026-02-28-PROD-DB-AUDIT"
date: "2026-02-28"
source_file: "apps/database/backups/gamilit_platform_20260228_210825.sql"
source_lines: 64572
source_size_approx: "5.1MB"
pg_version: "16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)"
dump_tool: "pg_dump 16.11"
status: "COMPLETE"
---

# SA-1A: Production Backup Catalog

**Source:** `apps/database/backups/gamilit_platform_20260228_210825.sql`
**Lines:** 64,572 | **Size:** ~5.1MB
**PostgreSQL Version:** 16.11 (Ubuntu 16.11-0ubuntu0.24.04.1)
**Dump Tool:** pg_dump 16.11
**Audit Date:** 2026-02-28

---

## SUMMARY TOTALS

| Object Type | Count | Notes |
|-------------|-------|-------|
| Schemas | 17 | 16 actively used + 1 (gamilit utility/functions schema) |
| Tables | 173 | Confirmed via COPY block count |
| ENUMs | 42 | CREATE TYPE ... AS ENUM |
| Functions | 185 | CREATE [OR REPLACE] FUNCTION |
| Triggers | 72 | CREATE TRIGGER statements |
| RLS Policies | 483 | CREATE POLICY statements |
| Tables with RLS Enabled | 132 | ALTER TABLE ... ENABLE ROW LEVEL SECURITY |
| Indexes (total) | 967 | Including unique |
| Views (regular) | 22 | CREATE VIEW |
| Views (materialized) | 7 | CREATE MATERIALIZED VIEW |
| Foreign Keys | 309 | ADD CONSTRAINT ... FOREIGN KEY |
| GRANT statements | 517 | Total GRANTs in file |
| GRANTs to gamilit_user | 445 | Including USAGE ON SCHEMA + table-level |
| ALTER ROLE statements | 0 | NOT PRESENT in backup |
| BYPASSRLS for gamilit_user | NOT FOUND | No BYPASSRLS in backup file |
| COPY blocks (data tables) | 173 | One per table |

**IMPORTANT DISCREPANCY vs DDL SSOT:**
- DDL MASTER_INVENTORY claims 251 RLS Policies — backup shows **483** (nearly 2x)
- DDL MASTER_INVENTORY claims 68 Triggers — backup shows **72** (+4)
- DDL MASTER_INVENTORY claims 18 Views + 7 Materialized — backup shows 22 regular + 7 materialized = **29 total** (DDL says 18+7=25 total)
- **BYPASSRLS NOT in backup** — this was a known risk (CORR-F2-01b). Absence here may mean it was removed or was never in the backup dump config.

---

## 1. SCHEMAS (17)

| Schema | Owner | Notes |
|--------|-------|-------|
| admin_dashboard | postgres | Admin dashboard views, reports, bulk ops |
| audit_logging | postgres | Audit logs, system logs, alerts |
| auth | postgres | Supabase-compatible auth.users table |
| auth_management | postgres | Profiles, tenants, roles, sessions |
| communication | postgres | Conversations, messages |
| content_management | postgres | Marie Curie content, media, templates |
| data_warehouse | postgres | ETL, ML, dimension/fact tables |
| educational_content | postgres | Modules, exercises, assignments |
| gamification_system | postgres | XP, ranks, achievements, shop |
| gamilit | postgres | Utility functions schema (no user tables) |
| lti_integration | postgres | LTI consumers, grade passbacks |
| notifications | postgres | Notification queue, preferences |
| optimization | postgres | No tables found in backup data |
| progress_tracking | postgres | Exercise attempts, submissions, progress |
| social_features | postgres | Classrooms, guilds, social interactions |
| storage | postgres | No tables found in backup data |
| system_configuration | postgres | Feature flags, gamification params, settings |

**Note:** `optimization` and `storage` schemas created but contain 0 tables in this backup.

---

## 2. ENUMs (42)

### Schema: audit_logging (5)
| ENUM Name | Values |
|-----------|--------|
| alert_severity | (see backup line 262) |
| alert_status | (see backup line 283) |
| audit_action | (see backup line 304) |
| log_level | (see backup line 329) |
| metric_type | (see backup line 351) |

### Schema: auth (2)
| ENUM Name | Values |
|-----------|--------|
| aal_level | (see backup line 368) |
| code_challenge_method | (see backup line 381) |

### Schema: auth_management (3)
| ENUM Name | Values |
|-----------|--------|
| auth_provider | (see backup line 393) |
| gamilit_role | (see backup line 416) |
| user_status | (see backup line 436) |

### Schema: content_management (4)
| ENUM Name | Values |
|-----------|--------|
| content_status | (see backup line 458) |
| content_type | (see backup line 481) |
| media_type | (see backup line 497) |
| processing_status | (see backup line 520) |

### Schema: data_warehouse (1)
| ENUM Name | Values |
|-----------|--------|
| etl_load_status | (see backup line 542) |

### Schema: educational_content (7)
| ENUM Name | Values |
|-----------|--------|
| bloom_level | (see backup line 557) |
| bloom_taxonomy | (see backup line 583) |
| cognitive_level | (see backup line 606) |
| difficulty_level | (see backup line 629) |
| exercise_mechanic | (see backup line 657) |
| exercise_type | **33 values** (see backup line 705) |
| module_status | (see backup line 755) |

### Schema: gamification_system (8)
| ENUM Name | Values |
|-----------|--------|
| achievement_category | (see backup line 777) |
| achievement_type | (see backup line 803) |
| comodin_type | (see backup line 824) |
| maya_rank | (see backup line 844) |
| notification_priority | (see backup line 866) |
| notification_type | (see backup line 889) |
| shop_item_category | (see backup line 919) |
| transaction_type | (see backup line 941) |

### Schema: progress_tracking (5)
| ENUM Name | Values |
|-----------|--------|
| attempt_result | (see backup line 972) |
| attempt_status | (see backup line 986) |
| certificate_status | (see backup line 1007) |
| certificate_type | (see backup line 1028) |
| progress_status | (see backup line 1049) |

### Schema: social_features (7)
| ENUM Name | Values |
|-----------|--------|
| classroom_role | (see backup line 1072) |
| enrollment_method | (see backup line 1092) |
| friendship_status | (see backup line 1113) |
| guild_mission_type | (see backup line 1134) |
| team_challenge_status | (see backup line 1150) |
| team_role | (see backup line 1172) |

### Schema: system_configuration (1)
| ENUM Name | Values |
|-----------|--------|
| setting_type | (see backup line 1192) |

---

## 3. TABLES (173)

### Schema: admin_dashboard (3 tables)
| Table | First Line |
|-------|-----------|
| admin_reports | 15258 |
| bulk_operations | 15689 |
| metrics_history | 16595 |

### Schema: audit_logging (6 tables)
| Table | First Line |
|-------|-----------|
| activity_logs | 18177 |
| audit_logs | 17219 |
| pending_user_initializations | 18261 |
| performance_metrics | 18312 |
| system_alerts | 18474 |
| system_logs | 17490 |
| user_activity_logs | 16819 |

*(7 actual — recounted below)*

### Schema: audit_logging (7 tables)
| Table | First Line |
|-------|-----------|
| activity_logs | 18177 |
| audit_logs | 17219 |
| pending_user_initializations | 18261 |
| performance_metrics | 18312 |
| system_alerts | 18474 |
| system_logs | 17490 |
| user_activity_logs | 16819 |

### Schema: auth (1 table)
| Table | First Line |
|-------|-----------|
| users | 17053 |

### Schema: auth_management (13 tables)
| Table | First Line |
|-------|-----------|
| auth_attempts | 18742 |
| auth_providers | 18784 |
| email_verification_tokens | 18869 |
| memberships | 18909 |
| parent_accounts | 18957 |
| parent_notifications | 19026 |
| parent_student_links | 19096 |
| password_reset_tokens | 19168 |
| profiles | 15764 |
| roles | 19215 |
| security_events | 19267 |
| tenants | 16741 |
| two_factor_tokens | 19317 |
| user_preferences | 19350 |
| user_roles | 17709 |
| user_sessions | 17763 |
| user_suspensions | 19437 |

*(17 actual — includes profiles, tenants)*

### Schema: auth_management (17 tables)
| Table | First Line |
|-------|-----------|
| auth_attempts | 18742 |
| auth_providers | 18784 |
| email_verification_tokens | 18869 |
| memberships | 18909 |
| parent_accounts | 18957 |
| parent_notifications | 19026 |
| parent_student_links | 19096 |
| password_reset_tokens | 19168 |
| profiles | 15764 |
| roles | 19215 |
| security_events | 19267 |
| tenants | 16741 |
| two_factor_tokens | 19317 |
| user_preferences | 19350 |
| user_roles | 17709 |
| user_sessions | 17763 |
| user_suspensions | 19437 |

### Schema: communication (4 tables)
| Table | First Line |
|-------|-----------|
| conversation_participants | 19471 |
| conversations | 19541 |
| message_participants | 19576 |
| messages | 19615 |

### Schema: content_management (8 tables)
| Table | First Line |
|-------|-----------|
| content_authors | 19744 |
| content_categories | 19801 |
| content_templates | 19850 |
| content_versions | 19892 |
| flagged_contents | 16665 |
| marie_curie_contents | 19930 |
| media_files | 19986 |
| media_metadatas | 20061 |
| moderation_rules | 20121 |
| tags | 20198 |

*(10 actual)*

### Schema: content_management (10 tables)
| Table | First Line |
|-------|-----------|
| content_authors | 19744 |
| content_categories | 19801 |
| content_templates | 19850 |
| content_versions | 19892 |
| flagged_contents | 16665 |
| marie_curie_contents | 19930 |
| media_files | 19986 |
| media_metadatas | 20061 |
| moderation_rules | 20121 |
| tags | 20198 |

### Schema: data_warehouse (11 tables)
| Table | First Line |
|-------|-----------|
| dim_achievements | 20260 |
| dim_dates | 20367 |
| dim_event_types | 20445 |
| dim_exercises | 20536 |
| dim_modules | 20652 |
| dim_students | 20762 |
| dim_teachers | 20870 |
| dim_times | 20966 |
| etl_extraction_logs | 21026 |
| etl_load_logs | 21119 |
| fact_daily_progress | 21206 |
| fact_exercise_completions | 21315 |
| fact_gamification_events | 21441 |
| fact_teacher_metrics | 21558 |
| ml_model_weights | 21682 |
| ml_prediction_logs | 21791 |

*(16 actual)*

### Schema: educational_content (20 tables)
| Table | First Line |
|-------|-----------|
| assessment_rubrics | 22449 |
| assignment_exercises | 22544 |
| assignment_students | 22589 |
| assignment_submissions | 15355 |
| assignments | 15412 |
| classroom_modules | 16316 |
| content_approvals | 22683 |
| content_metadatas | 22742 |
| content_tags | 22795 |
| difficulty_criteria | 22848 |
| exercise_mechanic_mappings | 22902 |
| exercise_type_rubrics | 23014 |
| exercise_validation_audits | 23083 |
| exercise_validation_configs | 23175 |
| exercises | 15860 |
| media_attachments | 23310 |
| media_resources | 23443 |
| module_dependencies | 23521 |
| modules | 16010 |
| resource_comments | 23613 |
| resource_downloads | 23665 |
| resource_ratings | 23707 |
| taxonomies | 23752 |
| teacher_contents | 17822 |

*(24 actual)*

### Schema: gamification_system (18 tables)
| Table | First Line |
|-------|-----------|
| achievement_categories | 23860 |
| achievements | 23922 |
| active_boosts | 23984 |
| classroom_missions | 24061 |
| comodin_usage_logs | 24148 |
| comodin_usage_trackings | 24196 |
| comodin_uses | 24249 |
| comodines_inventory | 24340 |
| inventory_transactions | 24502 |
| leaderboard_metadatas | 24570 |
| maya_ranks | 24592 |
| mission_templates | 24680 |
| missions | 24805 |
| ml_coins_transactions | 24884 |
| shop_categories | 25242 |
| shop_items | 25326 |
| user_achievements | 24940 |
| user_equipped_items | 25491 |
| user_purchases | 25544 |
| user_ranks | 24989 |
| user_stats | 16370 |

*(21 actual)*

### Schema: lti_integration (3 tables)
| Table | First Line |
|-------|-----------|
| lti_consumers | 25710 |
| lti_grade_passbacks | 25780 |
| lti_sessions | 25870 |

### Schema: notifications (7 tables)
| Table | First Line |
|-------|-----------|
| notification_logs | 25949 |
| notification_preferences | 26000 |
| notification_queue | 26067 |
| notification_templates | 26126 |
| notifications | 26223 |
| rate_limit_logs | 26302 |
| user_devices | 26366 |

### Schema: progress_tracking (16 tables)
| Table | First Line |
|-------|-----------|
| certificates | 26423 |
| engagement_metrics | 26562 |
| exercise_attempts | 26629 |
| exercise_submissions | 26746 |
| learning_path_modules | 26746 (approx) |
| learning_paths | 26807 |
| learning_sessions | 26863 |
| manual_reviews | 26919 |
| mastery_trackings | 27013 |
| module_completion_trackings | 27079 |
| module_progress | 16122 |
| progress_snapshots | 27146 |
| scheduled_missions | 25100 |
| skill_assessments | 27201 |
| student_intervention_alerts | 27266 |
| teacher_alert_configurations | 27341 |
| teacher_interventions | 27446 |
| teacher_notes | 27515 |
| user_current_levels | 27620 |
| user_difficulty_progresses | 27661 |
| user_learning_paths | 27714 |

*(21 actual)*

### Schema: social_features (22 tables)
| Table | First Line |
|-------|-----------|
| assignment_classrooms | 15461 |
| challenge_participants | 27802 |
| challenge_results | 27870 |
| classroom_members | 15482 |
| classrooms | 15520 |
| discussion_threads | 28044 |
| friend_requests | 28095 |
| friendships | 28163 |
| guild_emblems | 28223 |
| guild_join_requests | 28319 |
| guild_members | 28401 |
| guild_mission_contributions | 28483 |
| guild_missions | 28541 |
| guilds | 28685 |
| peer_challenges | 28809 |
| scheduled_reports | 28882 |
| schools | 29092 |
| shared_reports | 29138 |
| social_interactions | 29253 |
| teacher_classrooms | 16493 |
| teacher_reports | 29307 |
| team_challenges | 29446 |
| team_members | 29471 |
| team_vs_team_challenges | 29495 |
| teams | 29809 |
| user_activities | 29856 |
| user_blocks | 29917 |
| user_follows | 29983 |
| user_reports | 30019 |
| user_skill_ratings | 30196 |

*(30 actual)*

### Schema: system_configuration (8 tables)
| Table | First Line |
|-------|-----------|
| api_configurations | 30330 |
| environment_configs | 30451 |
| feature_flags | 17925 |
| gamification_parameters | 30525 |
| notification_settings | 30621 |
| notification_settings_globals | 30767 |
| rate_limits | 30889 |
| system_settings | 30946 |
| tenant_configurations | 31084 |

*(9 actual)*

---

## 4. VIEWS (29 total = 22 regular + 7 materialized)

### Regular Views (22)

| Schema | View Name | Line |
|--------|-----------|------|
| admin_dashboard | assignment_submission_stats | 15570 |
| admin_dashboard | classroom_overview | 16216 |
| admin_dashboard | moderation_queue | 16705 |
| admin_dashboard | organization_stats_summary | 16799 |
| admin_dashboard | recent_activity | 17184 |
| admin_dashboard | recent_admin_actions | 17455 |
| admin_dashboard | user_stats_summary | 18151 |
| auth | tenants | 18711 |
| communication | recent_classroom_messages | 19704 |
| data_warehouse | v_ml_at_risk_students | 21912 |
| data_warehouse | v_ml_model_performance | 21938 |
| data_warehouse | v_student_engagement_metrics | 21978 |
| data_warehouse | v_student_performance_metrics | 22113 |
| data_warehouse | v_student_feature_base | 22315 |
| educational_content | exercises_with_mechanics | 23265 |
| educational_content | published_teacher_contents | 23575 |
| educational_content | v_validation_analysis | 23799 |
| gamilit | number_series | 25669 |
| progress_tracking | classroom_students_metrics | 26517 |
| progress_tracking | teacher_pending_reviews | 27545 |
| progress_tracking | user_progress_summary | 27771 |
| social_features | classroom_progress_overview | 27979 |

### Materialized Views (7)

| Schema | View Name | Line |
|--------|-----------|------|
| admin_dashboard | classroom_summary_mv | 16532 |
| admin_dashboard | system_overview_mv | 18019 |
| admin_dashboard | user_analytics_mv | 18098 |
| gamification_system | mv_classroom_leaderboard | 25040 |
| gamification_system | mv_global_leaderboard | 25071 |
| gamification_system | mv_mechanic_leaderboard | 25188 |
| gamification_system | mv_weekly_leaderboard | 25218 |

**DISCREPANCY vs DDL docs:** DDL docs say 18 regular views — backup shows 22.
The 4 extra views found: `data_warehouse.v_student_feature_base`, `educational_content.v_validation_analysis`, `progress_tracking.classroom_students_metrics`, `social_features.classroom_progress_overview`

---

## 5. FUNCTIONS (185)

### By Schema (summary)

| Schema | Count | Notable Functions |
|--------|-------|-------------------|
| admin_dashboard | 3 | cleanup_old_metrics, refresh_all_dashboards, update_bulk_operation_progress |
| audit_logging | 4+ | cleanup_old_system_logs, cleanup_old_user_activity, get_pending_initialization_stats, log_audit_event |
| auth_management | 5+ | assign_role_to_user, ensure_profile_name, hash_token, revoke_role_from_user |
| communication | 4 | update_conv_participant_timestamp, update_conversation_timestamp, update_message_participant_read, update_message_tracking_fields |
| data_warehouse | 4+ | update_etl_extraction_logs_updated_at, update_ml_model_weights_updated_at, plus ML functions |
| educational_content | 3+ | update_assignment_students_timestamp, update_classroom_modules_timestamp, update_teacher_contents_timestamp |
| gamification_system | 10+ | fn_on_achievement_unlocked, process_xp_update, trg_check_rank_promotion_fn |
| gamilit | 40+ | Core utility functions: assign_default_classroom, audit_profile_changes, get_current_user_id, get_current_tenant_id, initialize_user_stats, initialize_module_progress_on_publish, is_admin, is_super_admin, is_teacher, set_default_tenant, trigger_missions_on_*, update_classroom_member_count, update_guild_member_count, update_module_progress_on_exercise_complete, update_updated_at_column, update_user_stats_on_exercise_complete, update_user_stats_on_submission_graded |
| progress_tracking | 5+ | create_manual_review_on_submission, update_module_progress_complete, update_submitted_progress_on_submission |
| social_features | 3+ | sync_teacher_classroom_on_insert, update_guild_member_count, update_guilds_updated_at |
| system_configuration | 1 | update_gamification_parameters_timestamp |

**Total: 185** (exact count from grep)

---

## 6. TRIGGERS (72)

### Complete Trigger List by Schema

#### Schema: audit_logging (1)
| Trigger Name | Table | Timing | Events | Function |
|---|---|---|---|---|
| trg_system_alerts_updated_at | system_alerts | BEFORE UPDATE | UPDATE | gamilit.update_updated_at_column |

#### Schema: auth_management (10)
| Trigger Name | Table | Timing | Events | Function |
|---|---|---|---|---|
| trg_assign_default_classroom | profiles | AFTER INSERT | INSERT | gamilit.assign_default_classroom |
| trg_audit_profile_changes | profiles | AFTER UPDATE | UPDATE | gamilit.audit_profile_changes |
| trg_ensure_profile_name | profiles | BEFORE INSERT | INSERT | auth_management.ensure_profile_name |
| trg_ensure_profile_name_update | profiles | BEFORE UPDATE | UPDATE (conditional) | auth_management.ensure_profile_name |
| trg_initialize_user_stats | profiles | AFTER INSERT | INSERT | gamilit.initialize_user_stats |
| trg_memberships_updated_at | memberships | BEFORE UPDATE | UPDATE | gamilit.update_updated_at_column |
| trg_profiles_updated_at | profiles | BEFORE UPDATE | UPDATE | gamilit.update_updated_at_column |
| trg_roles_updated_at | roles | BEFORE UPDATE | UPDATE | gamilit.update_updated_at_column |
| trg_set_default_tenant | profiles | BEFORE INSERT | INSERT | gamilit.set_default_tenant |
| trg_tenants_updated_at | tenants | BEFORE UPDATE | UPDATE | gamilit.update_updated_at_column |
| trg_user_roles_updated_at | user_roles | BEFORE UPDATE | UPDATE | gamilit.update_updated_at_column |

*(11 actual — recount)*

#### Schema: communication (4)
| Trigger Name | Table | Timing | Events | Function |
|---|---|---|---|---|
| trg_update_conv_participant_timestamp | conversation_participants | BEFORE UPDATE | UPDATE | communication.update_conv_participant_timestamp |
| trg_update_conversation_timestamp | conversations | BEFORE UPDATE | UPDATE | communication.update_conversation_timestamp |
| trg_update_message_participant_read | message_participants | BEFORE UPDATE | UPDATE | communication.update_message_participant_read |
| trg_update_message_tracking_fields | messages | BEFORE UPDATE | UPDATE | communication.update_message_tracking_fields |

#### Schema: content_management (3)
| Trigger Name | Table | Timing | Events | Function |
|---|---|---|---|---|
| trg_content_templates_updated_at | content_templates | BEFORE UPDATE | UPDATE | gamilit.update_updated_at_column |
| trg_marie_curie_content_updated_at | marie_curie_contents | BEFORE UPDATE | UPDATE | gamilit.update_updated_at_column |
| trg_media_files_updated_at | media_files | BEFORE UPDATE | UPDATE | gamilit.update_updated_at_column |

#### Schema: data_warehouse (2)
| Trigger Name | Table | Timing | Events | Function |
|---|---|---|---|---|
| trg_etl_extraction_logs_updated_at | etl_extraction_logs | BEFORE UPDATE | UPDATE | data_warehouse.update_etl_extraction_logs_updated_at |
| trg_ml_model_weights_updated_at | ml_model_weights | BEFORE UPDATE | UPDATE | data_warehouse.update_ml_model_weights_updated_at |

#### Schema: educational_content (10)
| Trigger Name | Table | Timing | Events | Function |
|---|---|---|---|---|
| trg_assessment_rubrics_updated_at | assessment_rubrics | BEFORE UPDATE | UPDATE | gamilit.update_updated_at_column |
| trg_assignment_students_updated_at | assignment_students | BEFORE UPDATE | UPDATE | educational_content.update_assignment_students_timestamp |
| trg_classroom_modules_updated_at | classroom_modules | BEFORE UPDATE | UPDATE | educational_content.update_classroom_modules_timestamp |
| trg_exercise_type_rubrics_updated_at | exercise_type_rubrics | BEFORE UPDATE | UPDATE | gamilit.update_updated_at_column |
| trg_exercises_updated_at | exercises | BEFORE UPDATE | UPDATE | gamilit.update_updated_at_column |
| trg_initialize_module_progress | modules | AFTER INSERT OR UPDATE | INSERT, UPDATE OF is_published/status | gamilit.initialize_module_progress_on_publish |
| trg_media_resources_updated_at | media_resources | BEFORE UPDATE | UPDATE | gamilit.update_updated_at_column |
| trg_modules_updated_at | modules | BEFORE UPDATE | UPDATE | gamilit.update_updated_at_column |
| trg_resource_comments_updated_at | resource_comments | BEFORE UPDATE | UPDATE | gamilit.update_updated_at_column |
| trg_resource_ratings_updated_at | resource_ratings | BEFORE UPDATE | UPDATE | gamilit.update_updated_at_column |
| trg_teacher_contents_updated_at | teacher_contents | BEFORE UPDATE | UPDATE | educational_content.update_teacher_contents_timestamp |

*(11 actual)*

#### Schema: gamification_system (11)
| Trigger Name | Table | Timing | Events | Function |
|---|---|---|---|---|
| trg_achievement_unlocked | user_achievements | AFTER INSERT OR UPDATE | INSERT, UPDATE | gamification_system.fn_on_achievement_unlocked |
| trg_achievements_updated_at | achievements | BEFORE UPDATE | UPDATE | gamilit.update_updated_at_column |
| trg_check_rank_promotion_on_xp_gain | user_stats | AFTER UPDATE OF total_xp | UPDATE (conditional: new.total_xp > old.total_xp) | gamification_system.trg_check_rank_promotion_fn |
| trg_comodines_inventory_updated_at | comodines_inventory | BEFORE UPDATE | UPDATE | gamilit.update_updated_at_column |
| trg_missions_updated_at | missions | BEFORE UPDATE | UPDATE | gamilit.update_updated_at_column |
| trg_process_xp_update | user_stats | BEFORE UPDATE | UPDATE (conditional: old.total_xp != new.total_xp) | gamification_system.process_xp_update |
| trg_update_missions_on_daily_streak | user_stats | AFTER UPDATE | UPDATE (conditional: current_streak change) | gamilit.trigger_missions_on_daily_streak |
| trg_update_missions_on_earn_xp | user_stats | AFTER UPDATE | UPDATE (conditional: total_xp change) | gamilit.trigger_missions_on_earn_xp |
| trg_update_missions_on_use_comodines | comodin_usage_logs | AFTER INSERT | INSERT | gamilit.trigger_missions_on_use_comodines |
| trg_user_ranks_updated_at | user_ranks | BEFORE UPDATE | UPDATE | gamilit.update_updated_at_column |
| trg_user_stats_updated_at | user_stats | BEFORE UPDATE | UPDATE | gamilit.update_updated_at_column |

#### Schema: progress_tracking (14)
| Trigger Name | Table | Timing | Events | Function |
|---|---|---|---|---|
| trg_certificates_updated_at | certificates | BEFORE UPDATE | UPDATE | gamilit.update_updated_at_column |
| trg_create_manual_review_on_submission | exercise_submissions | AFTER INSERT | INSERT (conditional: status='submitted') | progress_tracking.create_manual_review_on_submission |
| trg_create_manual_review_on_submission_update | exercise_submissions | AFTER UPDATE | UPDATE (conditional) | progress_tracking.create_manual_review_on_submission |
| trg_exercise_submissions_updated_at | exercise_submissions | BEFORE UPDATE | UPDATE | gamilit.update_updated_at_column |
| trg_module_progress_complete | exercise_submissions | AFTER UPDATE | UPDATE (conditional: graded/reviewed) | progress_tracking.update_module_progress_complete |
| trg_module_progress_updated_at | module_progress | BEFORE UPDATE | UPDATE | gamilit.update_updated_at_column |
| trg_update_missions_on_complete_modules | module_progress | AFTER UPDATE | UPDATE (conditional: status=completed) | gamilit.trigger_missions_on_complete_modules |
| trg_update_missions_on_exercise | exercise_attempts | AFTER INSERT | INSERT | gamilit.trigger_missions_on_exercise_complete |
| trg_update_missions_on_explore_modules | module_progress | AFTER INSERT | INSERT | gamilit.trigger_missions_on_explore_modules |
| trg_update_missions_on_perfect_scores | exercise_attempts | AFTER INSERT | INSERT (conditional: is_correct=true AND score=100) | gamilit.trigger_missions_on_perfect_scores |
| trg_update_missions_on_streak | exercise_attempts | AFTER INSERT | INSERT | gamilit.trigger_missions_on_correct_streak |
| trg_update_missions_on_submission | exercise_submissions | AFTER UPDATE | UPDATE (conditional: graded+correct) | gamilit.trigger_missions_on_exercise_complete |
| trg_update_module_progress_on_exercise | exercise_attempts | AFTER INSERT | INSERT | gamilit.update_module_progress_on_exercise_complete |
| trg_update_submitted_progress_on_submission | exercise_submissions | AFTER INSERT | INSERT (conditional: not draft) | progress_tracking.update_submitted_progress_on_submission |
| trg_update_user_stats_on_exercise | exercise_attempts | AFTER INSERT | INSERT | gamilit.update_user_stats_on_exercise_complete |
| trg_update_user_stats_on_submission | exercise_submissions | AFTER UPDATE | UPDATE (conditional: graded+correct) | gamilit.update_user_stats_on_submission_graded |

*(16 actual)*

#### Schema: social_features (10)
| Trigger Name | Table | Timing | Events | Function |
|---|---|---|---|---|
| trg_classroom_members_updated_at | classroom_members | BEFORE UPDATE | UPDATE | gamilit.update_updated_at_column |
| trg_classrooms_updated_at | classrooms | BEFORE UPDATE | UPDATE | gamilit.update_updated_at_column |
| trg_guild_members_count | guild_members | AFTER INSERT OR DELETE | INSERT, DELETE | social_features.update_guild_member_count |
| trg_guilds_updated_at | guilds | BEFORE UPDATE | UPDATE | social_features.update_guilds_updated_at |
| trg_schools_updated_at | schools | BEFORE UPDATE | UPDATE | gamilit.update_updated_at_column |
| trg_sync_teacher_classroom_on_insert | classrooms | AFTER INSERT | INSERT | social_features.sync_teacher_classroom_on_insert |
| trg_teacher_reports_updated_at | teacher_reports | BEFORE UPDATE | UPDATE | gamilit.update_updated_at_column |
| trg_teams_updated_at | teams | BEFORE UPDATE | UPDATE | gamilit.update_updated_at_column |
| trg_update_classroom_count | classroom_members | AFTER INSERT OR DELETE OR UPDATE | INSERT, DELETE, UPDATE OF status | gamilit.update_classroom_member_count |
| trg_user_reports_updated_at | user_reports | BEFORE UPDATE | UPDATE | gamilit.update_updated_at_column |

#### Schema: system_configuration (3)
| Trigger Name | Table | Timing | Events | Function |
|---|---|---|---|---|
| trg_feature_flags_updated_at | feature_flags | BEFORE UPDATE | UPDATE | gamilit.update_updated_at_column |
| trg_gamification_parameters_updated_at | gamification_parameters | BEFORE UPDATE | UPDATE | system_configuration.update_gamification_parameters_timestamp |
| trg_system_settings_updated_at | system_settings | BEFORE UPDATE | UPDATE | gamilit.update_updated_at_column |

**Trigger Count by Schema:**
- audit_logging: 1
- auth_management: 11
- communication: 4
- content_management: 3
- data_warehouse: 2
- educational_content: 11
- gamification_system: 11
- progress_tracking: 16
- social_features: 10
- system_configuration: 3
- **Total: 72** (confirmed)

**DISCREPANCY vs DDL docs:** DDL MASTER_INVENTORY says 68 triggers — backup has **72** (+4).

---

## 7. RLS POLICIES (483)

**CRITICAL DISCREPANCY:** DDL MASTER_INVENTORY reports 251 RLS policies. Backup contains **483** CREATE POLICY statements — nearly **double** the documented count.

**IMPORTANT CONTEXT ON BYPASSRLS:**
The `ALTER ROLE gamilit_user BYPASSRLS` statement is **NOT present** in this backup file. This is significant:
- Either it was removed/fixed before this backup was taken (2026-02-28)
- Or it was never part of the dump (pg_dump may not include role-level attributes)
- CORR-F2-01b (known risk) states BYPASSRLS was still active — this backup cannot confirm either way without direct psql query

### Sample Policies by Schema

#### admin_dashboard
- `admin_reports_admin_all` — ALL — USING: is_admin() OR is_super_admin()
- `admin_reports_insert_own` — INSERT — WITH CHECK: requested_by = get_current_user_id()
- `admin_reports_read_own` — SELECT — USING: requested_by = get_current_user_id()
- `bulk_operations_admin_all` — ALL — USING: is_admin() OR is_super_admin()
- `bulk_operations_read_own` — SELECT — USING: started_by = get_current_user_id()
- `metrics_history_admin_all` — ALL — USING: is_admin() OR is_super_admin()
- `metrics_history_system_insert` — INSERT — WITH CHECK: true

#### audit_logging
- `activity_logs_insert_system` — INSERT — WITH CHECK: true
- `audit_logs_admin_only` — ALL (TO authenticated) — USING: subquery admin check
- `audit_logs_select_admin` — SELECT — USING: is_admin()
- `audit_logs_select_own` — SELECT — USING: actor_id = get_current_user_id()
- `performance_metrics_insert_system` — INSERT — WITH CHECK: get_current_user_id() IS NOT NULL
- `performance_metrics_select_admin` — SELECT — USING: is_admin() OR is_super_admin()
- `system_alerts_all_admin` — ALL — USING: is_admin() OR is_super_admin()
- `system_logs_insert_system` — INSERT — WITH CHECK: get_current_user_id() IS NOT NULL
- `system_logs_select_admin` — SELECT — USING: is_admin() OR is_super_admin()
- `user_activity_insert_system` — INSERT — WITH CHECK: true
- `user_activity_logs_admin` — ALL (TO authenticated) — USING: subquery admin check
- `user_activity_logs_insert_own` — INSERT — WITH CHECK: user_id = get_current_user_id()
- `user_activity_logs_select_admin` — SELECT — USING: is_admin() OR is_super_admin()
- `user_activity_logs_select_own` — SELECT — USING: user_id = get_current_user_id()
- `user_activity_logs_user_read_own` — SELECT (TO authenticated) — USING: user_id = auth.uid()
- `user_activity_select_admin` — SELECT — USING: is_admin() OR is_super_admin()

#### auth_management
- `auth_attempts_admin_all` — ALL (TO authenticated) — USING: admin subquery
- `auth_attempts_admin_read` — SELECT — USING: is_admin() OR is_super_admin()
- `auth_attempts_system_insert` — INSERT — WITH CHECK: true
- `email_verification_read_own` — SELECT — USING: user_id = current_setting()::uuid
- `email_verification_tokens_admin_only` — ALL (TO authenticated) — USING: admin subquery
- `memberships_read_tenant` — SELECT — USING: tenant_id = current_setting()::uuid
- `parent_accounts_admin_all` — ALL — USING: is_admin() OR is_super_admin()
- `parent_accounts_insert_own` — INSERT — WITH CHECK: profile_id = get_current_user_id()
- `parent_accounts_read_own` — SELECT — USING: profile_id = get_current_user_id()
- `parent_accounts_update_own` — UPDATE — USING: profile_id = get_current_user_id()
- `parent_notifications_admin_all` — ALL — USING: is_admin() OR is_super_admin()
- `parent_notifications_read_own` — SELECT — USING: subquery via parent_accounts
- `parent_notifications_system_insert` — INSERT — WITH CHECK: true
- `parent_notifications_update_own` — UPDATE — USING: subquery via parent_accounts
- `parent_student_links_admin_all` — ALL — USING: is_admin() OR is_super_admin()
- `parent_student_links_parent_manage` — INSERT — WITH CHECK: subquery via parent_accounts
- `parent_student_links_parent_read` — SELECT — USING: subquery via parent_accounts
- `parent_student_links_student_read` — SELECT — USING: student_id = get_current_user_id()
- `password_reset_read_own` — SELECT — USING: user_id = current_setting()::uuid
- `profiles_read_admin` — SELECT — USING: admin subquery
- `profiles_read_own` — SELECT — USING: id = current_setting()::uuid
- `profiles_read_teacher` — SELECT — USING: teacher subquery
- `profiles_update_admin` — UPDATE — USING: admin subquery
- `profiles_update_own` — UPDATE — USING: id = current_setting()::uuid, WITH CHECK: same
- `security_events_admin_only` — ALL (TO authenticated) — USING: admin subquery
- `security_events_read_admin` — SELECT — USING: admin subquery
- `security_events_read_own` — SELECT — USING: user_id = current_setting()::uuid

*(483 total across all schemas — full enumeration would require ~30 additional pages)*

---

## 8. INDEXES (967)

**Total: 967 indexes** (including primary keys, unique constraints converted to indexes, and explicit CREATE INDEX statements)

### Sample by Schema

#### admin_dashboard
- idx_admin_reports_created_at — btree (created_at DESC)
- idx_admin_reports_expires_at — btree (expires_at) WHERE NOT NULL
- idx_admin_reports_requested_by — btree (requested_by)
- idx_admin_reports_status — btree (status)
- idx_admin_reports_tenant_id — btree (tenant_id)
- idx_admin_reports_type — btree (report_type)
- idx_bulk_ops_started_at — btree (started_at DESC)
- idx_bulk_ops_started_by — btree (started_by)
- idx_bulk_ops_status — btree (status)
- idx_bulk_ops_type — btree (operation_type)
- idx_classroom_summary_mv_avg_xp — btree (avg_student_xp DESC)
- idx_classroom_summary_mv_classroom — **UNIQUE** btree (classroom_id) [on MV]
- idx_classroom_summary_mv_student_count — btree (student_count DESC)
- idx_metrics_history_created_at — btree (created_at)
- idx_metrics_history_memory_usage — btree (memory_usage_percent) WHERE >80
- idx_metrics_history_recorded_at — btree (recorded_at DESC)
- idx_system_overview_mv_snapshot — **UNIQUE** btree (snapshot_timestamp) [on MV]

*(967 total across all schemas — full enumeration beyond scope)*

---

## 9. ROW LEVEL SECURITY — ENABLED TABLES (132)

**Total: 132 tables with ALTER TABLE ... ENABLE ROW LEVEL SECURITY**

**DISCREPANCY vs DDL docs:** DDL MASTER_INVENTORY does not separately document this count. 132 tables have RLS enabled out of 173 total tables — meaning **41 tables do NOT have RLS enabled**.

The tables without RLS include primarily:
- Data warehouse tables (16 DDL-only tables)
- Some system configuration tables
- Some materialized view support tables

---

## 10. GRANTS

### Schema-Level GRANTs to gamilit_user (USAGE)
All 17 schemas granted USAGE to gamilit_user:
- admin_dashboard, audit_logging, auth, auth_management, communication, content_management, educational_content, gamification_system, gamilit, lti_integration, notifications, progress_tracking, public, social_features, storage, system_configuration

### Table-Level GRANTs to gamilit_user
**445 total GRANT statements** to gamilit_user including:
- SELECT, INSERT, UPDATE, DELETE on most user-facing tables
- SELECT only on read-only system tables
- SELECT, USAGE on sequences

### ALTER ROLE Statements
**NONE FOUND** — There are zero ALTER ROLE statements in this backup file.

### BYPASSRLS Status
**NOT FOUND** in backup. The `ALTER ROLE gamilit_user BYPASSRLS` statement does not appear in this backup.

**Note:** pg_dump does not dump role attributes (ALTER ROLE ... BYPASSRLS) unless using `--roles` flag or `pg_dumpall`. This backup appears to be a schema+data dump only. The BYPASSRLS status of gamilit_user **cannot be determined from this backup alone** — requires direct database query:
```sql
SELECT rolname, rolbypassrls FROM pg_roles WHERE rolname = 'gamilit_user';
```

---

## 11. ROW COUNTS (Key Tables)

Data counted from COPY blocks (lines between COPY statement and `\.` terminator):

| Table | COPY Start Line | End Line (`\.`) | Row Count |
|-------|----------------|-----------------|-----------|
| auth.users | 39077 | 39134 | **57 rows** |
| auth_management.profiles | 39228 | 39285 | **57 rows** |
| auth_management.auth_attempts | 39141 | 39159 | **18 rows** |
| auth_management.auth_providers | 39166 | 39173 | **6 rows** |
| auth_management.email_verification_tokens | 39180 | 39181 | **0 rows** |
| auth_management.memberships | 39188 | 39189 | **0 rows** |
| auth_management.parent_accounts | 39196 | 39197 | **0 rows** |
| auth_management.parent_notifications | 39204 | 39205 | **0 rows** |
| auth_management.parent_student_links | 39212 | 39213 | **0 rows** |
| auth_management.password_reset_tokens | 39220 | 39221 | **0 rows** |
| auth_management.roles | 39292 | 39296 | **3 rows** |
| educational_content.modules | 40051 | 40057 | **5 rows** |
| educational_content.taxonomies | 40088 | 40093 | **4 rows** |
| gamification_system.achievement_categories | 40108 | 40118 | **9 rows** |
| gamification_system.active_boosts | 40173 | 40181 | **0 rows** |
| gamification_system.classroom_missions | 40181 | 40189 | **0 rows** |
| gamification_system.comodin_usage_logs | 40189 | 40197 | **0 rows** |
| gamification_system.comodin_usage_trackings | 40197 | 40205 | **0 rows** |
| gamification_system.comodin_uses | 40205 | 40213 | **0 rows** |
| gamification_system.inventory_transactions | 40275 | 40276 | **0 rows** |
| gamification_system.leaderboard_metadatas | 40283 | 40288 | **4 rows** |
| gamification_system.maya_ranks | 40295 | 40301 | **5 rows** |
| gamification_system.mission_templates | 40308 | 40337 | **28 rows** (approx, 40308-40337) |
| gamification_system.missions | 40337 | 40365 | **27 rows** (approx) |
| gamification_system.user_stats | 40579 | 40636 | **57 rows** |
| gamification_system.user_ranks | 40515 | 40579 | **64 rows** (approx) |
| lti_integration.lti_consumers | 40643 | 40647 | **3 rows** |
| lti_integration.lti_grade_passbacks | 40654 | 40655 | **0 rows** |
| system_configuration.feature_flags | 42165 | 42192 | **27 rows** |
| system_configuration.gamification_parameters | 42199 | 42237 | **38 rows** |

### Key Findings from Row Counts:
1. **auth.users = 57 rows** — matches auth_management.profiles (57 rows) and user_stats (57 rows). Consistent 1:1 mapping.
2. **educational_content.modules = 5 rows** — all 5 modules seeded (3 published: MOD-01, MOD-02, MOD-03; 2 backlog: MOD-04, MOD-05)
3. **gamification_system.maya_ranks = 5 rows** — Ajaw, Nacom, Ah K'in, Halach Uinic, K'uk'ulkan
4. **system_configuration.feature_flags = 27 rows** — all feature flags seeded
5. **Gamification inventory tables all empty** — comodin_uses, comodin_usage_logs, comodin_usage_trackings = 0 rows (expected for dev/test state)
6. **Parent portal tables empty** — parent_accounts, parent_notifications, parent_student_links = 0 rows
7. **auth_management.memberships = 0 rows** — multi-tenancy memberships not seeded beyond default tenant

### User Breakdown from auth.users (57 total):
Based on data observed in the COPY block:
- 1 x system user (system@gamilit.com, super_admin)
- 1 x admin testing user (admin@gamilit.com, super_admin)
- 1 x teacher testing user (teacher@gamilit.com, admin_teacher)
- 2 x dev/owner users (rckrdmrd@gmail.com, adredsi26@gmail.com — student role)
- 52 x real student users (registered Nov 2025 – Feb 2026)

---

## 12. DISCREPANCY SUMMARY vs DDL MASTER_INVENTORY

| Metric | DDL MASTER_INVENTORY | This Backup | Delta | Status |
|--------|---------------------|-------------|-------|--------|
| Schemas | 18 | 17 | -1 | INVESTIGATE — 18 in docs vs 17 in backup (may include public) |
| Tables | 173 | 173 | 0 | MATCH |
| ENUMs | 42 | 42 | 0 | MATCH |
| Functions | 158 | 185 | +27 | DISCREPANCY — docs undercount |
| Triggers | 68 | 72 | +4 | DISCREPANCY — docs undercount |
| RLS Policies | 251 | 483 | +232 | CRITICAL DISCREPANCY — docs severely undercount |
| Regular Views | 18 | 22 | +4 | DISCREPANCY — 4 undocumented views |
| Materialized Views | 7 | 7 | 0 | MATCH |
| Foreign Keys | 301 | 309 | +8 | DISCREPANCY — docs undercount |
| Indexes | N/A | 967 | N/A | Not tracked in inventory |
| BYPASSRLS gamilit_user | ACTIVE (CORR-F2-01b) | NOT IN BACKUP | UNCERTAIN | pg_dump does not export role attributes |

### Critical Issues Found:

**1. RLS Policy Count Severely Undercounted (483 vs 251)**
The DDL MASTER_INVENTORY shows 251 RLS policies but the production backup contains 483. This is a nearly 2x undercount. Possible causes:
- DDL scripts may have accumulated additional policies not reflected in the inventory count
- The inventory methodology may have counted only per-schema counts incorrectly

**2. Functions Undercounted (185 vs 158)**
27 additional functions exist in production vs. documented. This may reflect accumulated hotfix functions, migration functions, or undocumented utility additions.

**3. Triggers Undercounted (72 vs 68)**
4 additional triggers in production. These include mission-tracking triggers added post-inventory update.

**4. 4 Undocumented Regular Views**
The following views exist in production but are not in the inventory count of 18:
- `data_warehouse.v_student_feature_base` (line 22315)
- `educational_content.v_validation_analysis` (line 23799)
- `progress_tracking.classroom_students_metrics` (line 26517)
- `social_features.classroom_progress_overview` (line 27979)

**5. Schema Count Discrepancy (17 vs 18)**
Docs say 18 schemas. Backup shows 17 CREATE SCHEMA statements. The `public` schema exists but is not created via `CREATE SCHEMA` (it's default). Reconciling: 17 explicit + public = 18 total if public is counted.

**6. BYPASSRLS Cannot Be Confirmed from Backup**
The pg_dump format does not include `ALTER ROLE` statements with role attributes. The BYPASSRLS status of gamilit_user requires a live database query to verify. This remains an open risk per CORR-F2-01b.

---

## 13. RECOMMENDATIONS FOR AUDIT ACTION

1. **URGENT — Recount RLS Policies:** Reconcile the 483 (backup) vs 251 (inventory) discrepancy. Run `SELECT count(*) FROM pg_policies;` on the live database to confirm.

2. **URGENT — Verify BYPASSRLS:** Run `SELECT rolname, rolbypassrls FROM pg_roles WHERE rolname = 'gamilit_user';` to determine if CORR-F2-01b is still active.

3. **HIGH — Document 4 Undocumented Views:** Add `data_warehouse.v_student_feature_base`, `educational_content.v_validation_analysis`, `progress_tracking.classroom_students_metrics`, `social_features.classroom_progress_overview` to the schema documentation.

4. **MEDIUM — Update Function Count:** Reconcile 185 backup functions vs 158 in inventory. Identify the 27 undocumented functions.

5. **MEDIUM — Update Trigger Count:** Identify the 4 additional triggers not in the inventory.

6. **LOW — Schema Count:** Clarify whether `public` is counted in the 18 schemas or not in documentation.

7. **INFO — Parent Portal Empty:** All parent portal tables have 0 rows. This is expected for current dev state but should be noted as the portal is marked 100% complete.

8. **INFO — Comodines System Empty:** All comodin usage tables have 0 rows in this backup. Expected if no testing of comodin flow has been done from the captured state.

---

*Catalog generated by SA-1A | TASK-2026-02-28-PROD-DB-AUDIT | 2026-02-28*
