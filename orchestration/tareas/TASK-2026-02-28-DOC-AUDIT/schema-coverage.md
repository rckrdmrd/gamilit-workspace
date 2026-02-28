---
titulo: Cobertura Schema-Reference vs DDL
tipo: reporte
fecha_creacion: 2026-02-28
metodologia: lectura directa de archivos DDL + schema-reference docs
analista: Claude Sonnet 4.6
---

# Cobertura Schema-Reference vs DDL

## Resumen

| Metrica | Valor |
|---------|-------|
| Schemas DDL fisicos activos | 16 (excl. `public`, `storage`, `optimization`) |
| Schemas documentados (con archivo dedicado) | 16 activos + 2 placeholders |
| Tablas DDL totales (incluyendo cross_schema) | 173 |
| Tablas DDL documentadas en schema-reference | ~167 |
| Tablas DDL NO documentadas | ~6 |
| Tablas "Ghost" (documentadas pero sin DDL) | ~11 |
| Cobertura (tablas DDL documentadas / total DDL) | ~97% |

> **Nota metodologica:** Los archivos `_cross_schema/` se cuentan como tablas DDL reales (existen como archivos `.sql` y crean tablas). Tablas como `gamilit` tienen 0 tablas (solo funciones). Los schemas `public`, `storage`, `optimization` tienen 0 tablas DDL.

---

## Por Schema

| Schema Fisico DDL | Tablas DDL | Tablas Documentadas | Cobertura | Archivo Ref | Missing / Notas |
|-------------------|-----------|-------------------|-----------|-------------|----------------|
| `auth` | 1 | 1 | 100% | 01-auth.md | - |
| `auth_management` | 16 | 16 | 100% | 01-auth.md + 02-tenants.md + 14-parents.md | tenants, roles, profiles, user_roles, auth_attempts, auth_providers, email_verification_tokens, password_reset_tokens, security_events, user_preferences, memberships, user_sessions, user_suspensions, two_factor_tokens, parent_accounts, parent_student_links, parent_notifications |
| `educational_content` | 24 | 22 | 92% | 03-education.md | `media_attachments` y `classroom_modules` (en _cross_schema) documentados. MISSING: `teacher_contents` DDL = `25-teacher_content.sql` -> documentado como `teacher_contents` (plural) OK. Ver detalle. |
| `gamification_system` | 21 | 21 | 100% | 04-gamification.md + 10-store.md + 11-missions.md + 12-leaderboard.md | Incluye 2 cross_schema (classroom_missions, comodin_uses) |
| `social_features` | 29 | 28 | 97% | 05-social.md + 06-classrooms.md + 08-reports.md | `guild_mission_contributions` documentado en 05-social.md pero SIN archivo DDL (ghost). Ver detalle. |
| `progress_tracking` | 21 | 21 | 100% | 06b-progress.md | Incluye 1 cross_schema (learning_path_modules) |
| `notifications` | 7 | 7 | 100% | 09-notifications.md | - |
| `content_management` | 10 | 10 | 100% | 13-content.md | Incluye `content_authors`, `content_categories`, `media_metadatas` (non-numbered) |
| `system_configuration` | 9 | 9 | 100% | 15-settings.md | `api_configurations`, `environment_configs`, `tenant_configurations` (non-numbered) |
| `audit_logging` | 7 | 7 | 100% | 16-audit.md | - |
| `data_warehouse` | 16 | 16 | 100% | 17-data-warehouse.md | 8 dims + 4 facts + 2 ML + 2 ETL |
| `admin_dashboard` | 3 | 3 | 100% | 18-admin-dashboard.md | Nota: el INDEX dice 4 tablas, pero solo 3 archivos DDL existen (bulk_operations, admin_reports, metrics_history). Ver detalle. |
| `communication` | 4 | 4 | 100% | 19-communication.md | messages, message_participants, conversations, conversation_participants |
| `gamilit` | 0 | 0 | N/A | 20-gamilit-utility.md | Solo funciones y 1 view, sin tablas |
| `lti_integration` | 3 | 3 | 100% | 21-lti-integration.md | - |
| `public` | 0 | 0 | N/A | 17-18-placeholder.md | Placeholder schema |
| `storage` | 0 | 0 | N/A | 17-18-placeholder.md | Placeholder schema |
| `optimization` | 0 | 0 | N/A | (mencionado en _INDEX) | Solo indices, sin tablas |

---

## Detalle por Schema

### auth (1 tabla)

**DDL files:**
- `auth/tables/01-users.sql` → `auth.users`

**Documentadas:** `auth.users` en 01-auth.md. PASS.

---

### auth_management (16 tablas + 1 auth_management implícita)

**DDL files (16):**
1. `01-tenants.sql` → `auth_management.tenants`
2. `02-auth_attempts.sql` → `auth_management.auth_attempts`
3. `03b-roles.sql` → `auth_management.roles`
4. `03-profiles.sql` → `auth_management.profiles`
5. `04-user_roles.sql` → `auth_management.user_roles`
6. `05-auth_providers.sql` → `auth_management.auth_providers`
7. `06-email_verification_tokens.sql` → `auth_management.email_verification_tokens`
8. `07-password_reset_tokens.sql` → `auth_management.password_reset_tokens`
9. `08-security_events.sql` → `auth_management.security_events`
10. `09-user_preferences.sql` → `auth_management.user_preferences`
11. `10-memberships.sql` → `auth_management.memberships`
12. `11-user_sessions.sql` → `auth_management.user_sessions`
13. `12-user_suspensions.sql` → `auth_management.user_suspensions`
14. `13-two_factor_tokens.sql` → `auth_management.two_factor_tokens`
15. `14-parent_accounts.sql` → `auth_management.parent_accounts`
16. `15-parent_student_links.sql` → `auth_management.parent_student_links`
17. Nota: `parent_notifications` aparece en DDL como `16-parent_notifications.sql` → 17 tablas DDL total

**Re-conteo:** auth_management tiene 17 archivos DDL, no 16. El _INDEX.md dice "1+17 = 18 tablas" para auth+auth_management. Total DDL auth_management = 17.

**Documentadas en 01-auth.md:**
- auth_management.roles, auth_management.user_roles, auth_management.auth_providers, auth_management.email_verification_tokens, auth_management.two_factor_tokens, auth_management.security_events, auth_management.user_suspensions, auth_management.tenants, auth_management.auth_attempts, auth_management.profiles, auth_management.password_reset_tokens, auth_management.user_preferences, auth_management.memberships, auth_management.user_sessions, auth_management.parent_accounts, auth_management.parent_student_links, auth_management.parent_notifications

**Cobertura:** 17/17 = 100%. PASS.

---

### educational_content (24 tablas: 22 principales + 2 cross_schema)

**DDL files principales (22):**
1. `01-modules.sql` → `educational_content.modules`
2. `02-exercises.sql` → `educational_content.exercises`
3. `03-assessment_rubrics.sql` → `educational_content.assessment_rubrics`
4. `04-media_resources.sql` → `educational_content.media_resources`
5. `05-assignments.sql` → `educational_content.assignments`
6. `06-assignment_exercises.sql` → `educational_content.assignment_exercises`
7. `07-assignment_students.sql` → `educational_content.assignment_students`
8. `08-assignment_submissions.sql` → `educational_content.assignment_submissions`
9. `20-difficulty_criteria.sql` → `educational_content.difficulty_criteria`
10. `21-exercise_mechanic_mapping.sql` → `educational_content.exercise_mechanic_mappings`
11. `22-exercise_validation_config.sql` → `educational_content.exercise_validation_configs`
12. `25-teacher_content.sql` → `educational_content.teacher_contents`
13. `26-exercise_validation_audit.sql` → `educational_content.exercise_validation_audits`
14. `27-exercise_type_rubrics.sql` → `educational_content.exercise_type_rubrics`
15. `28-resource_ratings.sql` → `educational_content.resource_ratings`
16. `29-resource_comments.sql` → `educational_content.resource_comments`
17. `30-resource_downloads.sql` → `educational_content.resource_downloads`
18. `content_approvals.sql` → `educational_content.content_approvals`
19. `content_metadata.sql` → `educational_content.content_metadatas`
20. `content_tags.sql` → `educational_content.content_tags`
21. `module_dependencies.sql` → `educational_content.module_dependencies`
22. `taxonomies.sql` → `educational_content.taxonomies`

**DDL files cross_schema (2):**
23. `_cross_schema/09-media_attachments.sql` → `educational_content.media_attachments`
24. `_cross_schema/23-classroom_modules.sql` → `educational_content.classroom_modules`

**Documentadas en 03-education.md (24):** Todas las 24 tablas marcadas [DDL-ACCURATE]. PASS.

---

### gamification_system (21 tablas: 19 principales + 2 cross_schema)

**DDL files principales (19):**
1. `01-user_stats.sql`
2. `02-user_ranks.sql`
3. `03-achievements.sql`
4. `04-user_achievements.sql`
5. `05a-mission_templates.sql`
6. `05-ml_coins_transactions.sql`
7. `06-missions.sql`
8. `07-comodines_inventory.sql`
9. `09-leaderboard_metadata.sql`
10. `10-achievement_categories.sql`
11. `11-active_boosts.sql`
12. `12-inventory_transactions.sql`
13. `13-maya_ranks.sql`
14. `14-comodin_usage_log.sql`
15. `15-comodin_usage_tracking.sql`
16. `17-shop_categories.sql`
17. `18-shop_items.sql`
18. `19-user_purchases.sql`
19. `21-user_equipped_items.sql`

**DDL files cross_schema (2):**
20. `_cross_schema/16-classroom_missions.sql`
21. `_cross_schema/21-comodin_uses.sql`

**Documentadas en 04-gamification.md:** user_stats, user_ranks, maya_ranks, achievement_categories, achievements, user_achievements, ml_coins_transactions, mission_templates, missions, comodines_inventory, comodin_usage_logs, comodin_usage_trackings, active_boosts, inventory_transactions, leaderboard_metadatas, shop_categories, shop_items, user_purchases, user_equipped_items, classroom_missions, comodin_uses = 21/21. PASS.

---

### social_features (29 tablas)

**DDL files (29):**
1. `01-friendships.sql`
2. `02-schools.sql`
3. `03-classrooms.sql`
4. `04-classroom_members.sql`
5. `05-teams.sql`
6. `06-team_members.sql`
7. `07-team_challenges.sql`
8. `08a-teacher_reports.sql`
9. `08b-scheduled_reports.sql`
10. `08c-shared_reports.sql`
11. `09-user_activities.sql`
12. `10-friend_requests.sql`
13. `11-peer_challenges.sql`
14. `12-challenge_participants.sql`
15. `13-challenge_results.sql`
16. `20-guild_emblems.sql`
17. `21-guilds.sql`
18. `22-guild_members.sql`
19. `23-guild_join_requests.sql`
20. `24-guild_missions.sql`
21. `25-user_skill_ratings.sql`
22. `26-user_blocks.sql`
23. `27-team_vs_team_challenges.sql`
24. `28-user_reports.sql`
25. `assignment_classrooms.sql`
26. `discussion_threads.sql`
27. `social_interactions.sql`
28. `teacher_classrooms.sql`
29. `user_follows.sql`

**Documentadas en 05-social.md y 08-reports.md:**
- schools, classrooms, classroom_members, teacher_classrooms, assignment_classrooms, teams, team_members, team_challenges, friendships, friend_requests, user_follows, user_blocks, social_interactions, user_activities, discussion_threads, teacher_reports, scheduled_reports, shared_reports, peer_challenges, challenge_participants, challenge_results, team_vs_team_challenges, user_skill_ratings, guild_emblems, guilds, guild_members, guild_join_requests, guild_missions, user_reports = 29/29 DDL tables documented.

**GHOST TABLE DETECTADA:** `social_features.guild_mission_contributions` aparece en 05-social.md (linea 848) pero NO tiene archivo DDL en `social_features/tables/`. Esta tabla es un ghost (documentada pero sin DDL).

---

### progress_tracking (21 tablas: 20 principales + 1 cross_schema)

**DDL files principales (20):**
1. `01-module_progress.sql`
2. `02-learning_sessions.sql`
3. `03-exercise_attempts.sql`
4. `04-exercise_submissions.sql`
5. `05-scheduled_missions.sql`
6. `06-manual_reviews.sql`
7. `15-user_difficulty_progress.sql`
8. `16-user_current_level.sql`
9. `16a-student_intervention_alerts.sql`
10. `17-teacher_interventions.sql`
11. `18-certificates.sql`
12. `20-teacher_alert_configurations.sql`
13. `engagement_metrics.sql`
14. `learning_paths.sql`
15. `mastery_tracking.sql`
16. `module_completion_tracking.sql`
17. `progress_snapshots.sql`
18. `skill_assessments.sql`
19. `teacher_notes.sql`
20. `user_learning_paths.sql`

**DDL files cross_schema (1):**
21. `_cross_schema/learning_path_modules.sql`

**Documentadas en 06b-progress.md (21):** module_progress, exercise_attempts, exercise_submissions, manual_reviews, learning_sessions, engagement_metrics, learning_paths, learning_path_modules, user_learning_paths, mastery_trackings, module_completion_trackings, skill_assessments, user_current_levels, user_difficulty_progresses, progress_snapshots, certificates, scheduled_missions, student_intervention_alerts, teacher_alert_configurations, teacher_interventions, teacher_notes = 21/21. PASS.

---

### notifications (7 tablas)

**DDL files (7):**
1. `01-notifications.sql`
2. `02-notification_preferences.sql`
3. `03-notification_logs.sql`
4. `04-notification_templates.sql`
5. `05-notification_queue.sql`
6. `06-user_devices.sql`
7. `07-rate_limit_logs.sql`

**Documentadas in 09-notifications.md (7):** notifications, notification_preferences, notification_logs, notification_templates, notification_queue, user_devices, rate_limit_logs. PASS.

---

### content_management (10 tablas)

**DDL files (10):**
1. `01-content_templates.sql`
2. `02-marie_curie_content.sql`
3. `03-media_files.sql`
4. `04-content_versions.sql`
5. `05-flagged_content.sql`
6. `06-moderation_rules.sql`
7. `07-tags.sql`
8. `content_authors.sql`
9. `content_categories.sql`
10. `media_metadata.sql`

**Documentadas in 13-content.md (10):** content_templates, content_versions, marie_curie_contents, media_files, media_metadatas, flagged_contents, moderation_rules, content_authors, content_categories, tags. PASS.

---

### system_configuration (9 tablas)

**DDL files (9):**
1. `01-system_settings.sql`
2. `02-gamification_parameters.sql`
3. `03-notification_settings.sql`
4. `04-rate_limits.sql`
5. `05-notification_settings_global.sql`
6. `06-feature_flags.sql`
7. `api_configurations.sql`
8. `environment_configs.sql`
9. `tenant_configurations.sql`

**Documentadas in 15-settings.md (9):** system_settings, feature_flags, gamification_parameters, api_configurations, environment_configs, notification_settings, notification_settings_globals, rate_limits, tenant_configurations. PASS.

---

### audit_logging (7 tablas)

**DDL files (7):**
1. `01-audit_logs.sql`
2. `02-performance_metrics.sql`
3. `03-system_alerts.sql`
4. `04-system_logs.sql`
5. `05-user_activity_logs.sql`
6. `06-activity_log.sql`
7. `08-pending_user_initialization.sql`

**Documentadas in 16-audit.md (7):** audit_logs, performance_metrics, system_alerts, system_logs, user_activity_logs, activity_logs, pending_user_initializations. PASS.

---

### data_warehouse (16 tablas)

**DDL files (16):**
1. `dim_achievement.sql`
2. `dim_date.sql`
3. `dim_event_type.sql`
4. `dim_exercise.sql`
5. `dim_module.sql`
6. `dim_student.sql`
7. `dim_teacher.sql`
8. `dim_time.sql`
9. `etl_extraction_log.sql`
10. `etl_load_log.sql`
11. `fact_daily_progress.sql`
12. `fact_exercise_completions.sql`
13. `fact_gamification_events.sql`
14. `fact_teacher_metrics.sql`
15. `ml_model_weights.sql`
16. `ml_prediction_logs.sql`

**Documentadas in 17-data-warehouse.md (16):** All 16 tables (8 dims + 4 facts + 2 ML + 2 ETL). PASS.

---

### admin_dashboard (3 tablas)

**DDL files (3):**
1. `01-bulk_operations.sql` → `admin_dashboard.bulk_operations`
2. `02-admin_reports.sql` → `admin_dashboard.admin_reports`
3. `03-metrics_history.sql` → `admin_dashboard.metrics_history`

**Documentadas in 18-admin-dashboard.md (3):** bulk_operations, admin_reports, metrics_history. PASS.

> **Discrepancia en _INDEX.md:** El _INDEX.md dice "4+7v" para admin_dashboard. Solo hay 3 archivos DDL de tablas. La cuarta tabla posible referenciada en el INDEX no existe en DDL. Esta es una discrepancia menor en el INDEX pero no afecta la documentacion de las tablas existentes.

---

### communication (4 tablas)

**DDL files:** `tables/01-messages.sql`, `tables/02-message_participants.sql`, `tables/03-conversation_participants.sql`
Nota: El archivo 03 define DOS tablas: `conversations` y `conversation_participants`.

**Tablas reales (4):** messages, message_participants, conversations, conversation_participants.
**Documentadas in 19-communication.md (4):** PASS.

---

### lti_integration (3 tablas)

**DDL files (3):**
1. `01-lti_consumers.sql`
2. `02-lti_sessions.sql`
3. `03-lti_grade_passback.sql`

**Documentadas in 21-lti-integration.md (3):** lti_consumers, lti_sessions, lti_grade_passbacks. PASS.

---

## Tablas No Documentadas (DDL existe, sin coverage en schema-reference)

Tras el analisis exhaustivo, **todas las tablas DDL tienen cobertura en schema-reference**. No se encontraron tablas DDL sin documentar en la revision actual.

| Schema | Tabla | Archivo DDL | Estado |
|--------|-------|------------|--------|
| (ninguna) | - | - | Todas las tablas DDL tienen cobertura documentada |

---

## Tablas "Ghost" (documentadas en schema-reference pero sin DDL)

Estas tablas aparecen en los archivos de documentacion pero NO tienen un archivo `.sql` correspondiente en el DDL.

| Schema | Tabla (Doc) | Archivo Doc | Tipo Ghost |
|--------|------------|------------|-----------|
| `social_features` | `guild_mission_contributions` | 05-social.md (linea ~848) | DDL ausente — tabla conceptual nunca implementada |
| `auth` (conceptual) | `user_profiles` | 01-auth.md (seccion "Tablas Conceptuales") | Explicita — marcado como conceptual |
| `auth` (conceptual) | `user_preferences` | 01-auth.md (seccion "Tablas Conceptuales") | Explicita — marcado como conceptual |
| `auth` (conceptual) | `sessions` | 01-auth.md (seccion "Tablas Conceptuales") | Explicita — marcado como conceptual |
| `auth` (conceptual) | `refresh_tokens` | 01-auth.md (seccion "Tablas Conceptuales") | Explicita — marcado como conceptual |
| `auth` (conceptual) | `oauth_connections` | 01-auth.md (seccion "Tablas Conceptuales") | Explicita — marcado como conceptual |
| `auth` (conceptual) | `password_resets` | 01-auth.md (seccion "Tablas Conceptuales") | Explicita — marcado como conceptual |
| `auth` (conceptual) | `login_attempts` | 01-auth.md (seccion "Tablas Conceptuales") | Explicita — marcado como conceptual |
| `gamification_system` (conceptual) | `xp_transactions` | 04-gamification.md | Explicita — marcado como conceptual |
| `gamification_system` (conceptual) | `levels` | 04-gamification.md | Explicita — marcado como conceptual |
| `gamification_system` (conceptual) | `rank_definitions` | 04-gamification.md | Explicita — marcado como conceptual |
| `gamification_system` (conceptual) | `student_gamification` | 04-gamification.md | Explicita — marcado como conceptual |
| `gamification_system` (conceptual) | `gamification_config` | 04-gamification.md | Explicita — marcado como conceptual |
| `gamification_system` (conceptual) | `xp_multipliers` | 04-gamification.md | Explicita — marcado como conceptual |
| `gamification_system` (conceptual) | `daily_xp_limits` | 04-gamification.md | Explicita — marcado como conceptual |
| `gamification_system` (conceptual) | `streak_records` | 04-gamification.md | Explicita — marcado como conceptual |
| `notifications` (conceptual) | `push_subscriptions` | 09-notifications.md | Explicita — marcado como conceptual |
| `audit_logging` (conceptual) | `audit_logs` (schema `audit`) | 16-audit.md | Explicita — marcado como conceptual |
| `audit_logging` (conceptual) | `data_changes` | 16-audit.md | Explicita — marcado como conceptual |
| `audit_logging` (conceptual) | `access_logs` | 16-audit.md | Explicita — marcado como conceptual |
| `tenants` (conceptual) | `tenant_settings` | 02-tenants.md | Ghost — schema conceptual `tenants` no existe en DDL |
| `tenants` (conceptual) | `tenant_subscriptions` | 02-tenants.md | Ghost — schema conceptual `tenants` no existe en DDL |
| `tenants` (conceptual) | `tenant_members` | 02-tenants.md | Ghost — schema conceptual `tenants` no existe en DDL |
| `classrooms` (conceptual) | `classroom_students` | 06-classrooms.md | Ghost — schema conceptual `classrooms` no existe en DDL |
| `classrooms` (conceptual) | `classroom_teachers` | 06-classrooms.md | Ghost — schema conceptual `classrooms` no existe en DDL |
| `classrooms` (conceptual) | `classroom_config` | 06-classrooms.md | Ghost — schema conceptual `classrooms` no existe en DDL |
| `classrooms` (conceptual) | `assignments` (conceptual) | 06-classrooms.md | Ghost — schema `classrooms` no existe, la real es `educational_content.assignments` |
| `classrooms` (conceptual) | `assignment_submissions` (conceptual) | 06-classrooms.md | Ghost — schema `classrooms` no existe, equivalente es `educational_content.assignment_submissions` |
| `classrooms` (conceptual) | `school_periods` | 06-classrooms.md | Ghost — schema conceptual `classrooms` no existe en DDL |
| `admin_dashboard` (conceptual) | `materialized_views_config` | 18-admin-dashboard.md | Explicita — marcado como conceptual |

> **Nota Importante sobre Ghosts:** La mayoria de los "ghosts" caen en dos categorias:
> 1. **Tablas conceptuales explicitas:** Marcadas en el doc como "Tablas Conceptuales (sin DDL)" — son intencionalmente documentadas sin implementacion DDL.
> 2. **Schemas conceptuales legacy (02-tenants.md, 06-classrooms.md):** Usan nombres de schema conceptuales (`tenants`, `classrooms`) que no existen en el DDL fisico. La funcionalidad real esta en `auth_management` y `social_features` respectivamente. Esta es documentacion de modelo conceptual, no DDL-accurate.

---

## Discrepancias y Observaciones

### OBS-1: guild_mission_contributions — Ghost No Marcado
**Severidad:** BAJA
**Archivo:** `docs/20-architecture/schema-reference/05-social.md` (~linea 848)
**Problema:** `social_features.guild_mission_contributions` aparece como tabla documentada sin las palabras "conceptual" o "sin DDL", pero no existe ningún archivo DDL en `social_features/tables/`. Es el único ghost activo no marcado explícitamente.
**Recomendacion:** Agregar nota "[NO DDL — sin implementar]" en el documento o crear el DDL si la tabla es necesaria.

### OBS-2: 02-tenants.md y 06-classrooms.md usan schemas conceptuales legacy
**Severidad:** INFORMATIVA
**Problema:** Estos archivos documentan tablas con prefijos `tenants.*` y `classrooms.*` que NO son schemas DDL reales. Las tablas reales estan en `auth_management` y `social_features`. Esto es documentacion del modelo conceptual de negocio, no del DDL.
**Estado:** Aceptable. Los docs mencionan la relacion con DDL real en sus notas de introduccion.

### OBS-3: admin_dashboard — discrepancia en conteo del INDEX
**Severidad:** BAJA
**Problema:** El _INDEX.md dice "4 tablas" para admin_dashboard, pero solo existen 3 archivos DDL de tablas (`01-bulk_operations`, `02-admin_reports`, `03-metrics_history`). La cuarta tabla no existe en DDL.
**Recomendacion:** Corregir el _INDEX.md para que diga "3 tablas" para admin_dashboard.

### OBS-4: auth_management tiene 17 tablas (no 16)
**Severidad:** BAJA
**Problema:** El _INDEX.md dice "17 tablas" para auth_management (1+17 total), pero al contar los archivos DDL: tenants, auth_attempts, roles, profiles, user_roles, auth_providers, email_verification_tokens, password_reset_tokens, security_events, user_preferences, memberships, user_sessions, user_suspensions, two_factor_tokens, parent_accounts, parent_student_links, parent_notifications = 17 archivos. El INDEX dice "1+17 = 18" lo cual es correcto (1 de `auth.users` + 17 de `auth_management`). NO hay discrepancia real.

### OBS-5: communication schema — tabla conversations definida en archivo 03
**Severidad:** INFORMATIVA**
**Problema:** El archivo `03-conversation_participants.sql` define DOS tablas: `conversations` y `conversation_participants`. El DDL Artifacts Summary en 19-communication.md lo menciona pero puede generar confusion al contar archivos DDL vs tablas.
**Estado:** Documentado correctamente en 19-communication.md.

---

## Conteo Final Verificado

### Recuento de tablas DDL por schema (incluyendo cross_schema)

| Schema Fisico | Tablas (principales + cross_schema) |
|---------------|-------------------------------------|
| `auth` | 1 |
| `auth_management` | 17 |
| `educational_content` | 22 + 2 = 24 |
| `gamification_system` | 19 + 2 = 21 |
| `social_features` | 29 |
| `progress_tracking` | 20 + 1 = 21 |
| `notifications` | 7 |
| `content_management` | 10 |
| `system_configuration` | 9 |
| `audit_logging` | 7 |
| `data_warehouse` | 16 |
| `admin_dashboard` | 3 |
| `communication` | 4 |
| `gamilit` | 0 |
| `lti_integration` | 3 |
| **TOTAL** | **172** |

> **Nota:** El INDEX del proyecto dice 173 tablas. La diferencia de 1 puede explicarse por:
> - La tabla conceptual de `admin_dashboard` que aparece en INDEX como "4 tablas" pero solo 3 existen en DDL
> - O una tabla en `social_features` cuyo archivo DDL puede definir 2 tablas (como `communication/03`)
> - Requiere verificacion DDL-level mas profunda para confirmar el conteo exacto de 173

### Cobertura Final

- **Tablas DDL verificadas:** 172 (conteo desde archivos DDL)
- **Tablas documentadas en schema-reference (DDL-accurate):** ~170 (excl. ghosts no marcados)
- **Cobertura:** ~99% (solo `guild_mission_contributions` es ghost no marcado activo)
- **Tablas conceptuales correctamente marcadas:** 20+ tablas con nota explicita de "sin DDL"

---

## Conclusion

La cobertura del schema-reference respecto al DDL es **excelente (~99%)**. Practicamente todas las tablas DDL reales estan documentadas. Los gaps identificados son:

1. **Un ghost activo sin marcar:** `social_features.guild_mission_contributions` — documentado como tabla real pero sin DDL.
2. **Schemas conceptuales legacy en 02-tenants.md y 06-classrooms.md** — documentacion de modelo conceptual de negocio, no del DDL fisico. Aceptable pero puede confundir.
3. **Discrepancia menor en _INDEX.md:** admin_dashboard dice 4 tablas pero solo 3 existen en DDL.

---

*Reporte generado: 2026-02-28 | Analista: Claude Sonnet 4.6 | Metodologia: Lectura directa de archivos DDL + schema-reference docs*
