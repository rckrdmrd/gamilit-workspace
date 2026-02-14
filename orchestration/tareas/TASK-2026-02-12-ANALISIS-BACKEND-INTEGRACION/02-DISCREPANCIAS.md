# MATRIZ DE DISCREPANCIAS: Backend vs Documentacion

**Tarea:** TASK-2026-02-12-ANALISIS-BACKEND-INTEGRACION
**Fecha:** 2026-02-12
**Version:** 1.0.0

---

## 1. BACKEND_INVENTORY.yml vs Codigo Real

### 1.1 Metricas Totales

| Metrica | INVENTORY | Real | Delta | Accion |
|---------|-----------|------|-------|--------|
| modulos | 22 | 22 | 0 | - |
| entities | 152 | 152 files (153 classes) | +1 class | Nota: message.entity.ts tiene 2 @Entity |
| dtos | 412 | 399 en modules/ | -13 | Verificar shared/dto/ (~5 archivos) |
| services | 170 | 170 | 0 | - |
| controllers | 107 | 107 | 0 | - |
| endpoints | 850 | 899 | **+49** | ACTUALIZAR a 899 |
| guards | 14 | 15 | **+1** | Agregar ModelReadyGuard |
| decorators | 18 | 18 | 0 | - |
| interceptors | 8 | 5 | **-3** | CORREGIR a 5 |
| pipes | 6 | 6 | 0 | - |
| filters | 4 | 2 | **-2** | CORREGIR a 2 |
| tests | 833 | 57 files / 833 cases | 0 | Clarificar: 833 test cases |

### 1.2 Per-Module: INVENTORY Conceptual vs Directorios Reales

| INVENTORY Module | Dir Real | Entities INV | Entities Real | Services INV | Services Real |
|-----------------|----------|-------------|--------------|-------------|--------------|
| auth | auth | 4 | **18** | 5 | **6** |
| users | _(no existe)_ | 3 | **0** | 4 | **0** |
| tenants | _(no existe)_ | 3 | **0** | 3 | **0** |
| core | _(no existe)_ | 0 | **0** | 8 | **0** |
| health | health | 0 | 0 | 1 | 1 |
| settings | _(no existe)_ | 2 | **0** | 2 | **0** |
| notifications | notifications | 4 | **7** | 5 | **12** |
| modules | _(no existe)_ | 3 | **0** | 3 | **0** |
| exercises | _(no existe)_ | 5 | **0** | 8 | **0** |
| content | content | 4 | **10** | 4 | **10** |
| classrooms | _(no existe)_ | 4 | **0** | 4 | **0** |
| students | _(no existe)_ | 3 | **0** | 5 | **0** |
| gamification | gamification | 4 | **21** | 6 | **17** |
| leaderboard | _(no existe)_ | 3 | **0** | 3 | **0** |
| missions | _(no existe)_ | 4 | **0** | 4 | **0** |
| store | _(no existe)_ | 4 | **0** | 4 | **0** |
| achievements | _(no existe)_ | 3 | **0** | 3 | **0** |
| social | social | 4 | **26** | 4 | **13** |
| teachers | teacher | 3 | **6** | 5 | **21** |
| parents | parents | 3 | **0** | 3 | **7** |
| analytics | _(no existe)_ | 2 | **0** | 5 | **0** |
| reports | _(no existe)_ | 3 | **0** | 3 | **0** |
| **SUM** | | **68** | **152** | **97** | **170** |

### 1.3 Modulos Reales NO en INVENTORY

| Directorio | Entities | Services | Controllers | Endpoints | DTOs |
|-----------|----------|----------|-------------|-----------|------|
| admin | 16 | 22 | 21 | 158 | 133 |
| assignments | 4 | 1 | 2 | 19 | 7 |
| audit | 3 | 1 | 0 | 0 | 1 |
| communication | 2 | 0 | 0 | 0 | 0 |
| educational | 16 | 7 | 5 | 51 | 30 |
| etl | 0 | 9 | 3 | 16 | 6 |
| lti | 3 | 5 | 5 | 42 | 12 |
| mail | 0 | 1 | 0 | 0 | 0 |
| ml | 0 | 13 | 3 | 21 | 7 |
| profile | 0 | 1 | 1 | 3 | 0 |
| progress | 20 | 13 | 6 | 59 | 37 |
| tasks | 0 | 4 | 0 | 0 | 0 |
| visualization | 0 | 4 | 4 | 21 | 7 |
| websocket | 0 | 2 | 0 | 0 | 0 |

---

## 2. Guards: INVENTORY vs Real

| Guard en INVENTORY | Existe? | Guard Real | Archivo |
|-------------------|---------|------------|---------|
| JwtAuthGuard | SI | JwtAuthGuard | modules/auth/guards/jwt-auth.guard.ts |
| RolesGuard | SI | RolesGuard | modules/auth/guards/roles.guard.ts + shared/guards/roles.guard.ts |
| TenantGuard | NO* | RequireTenant (decorator) | shared/decorators/tenant.decorator.ts |
| AdminGuard | SI | AdminGuard | modules/admin/guards/admin.guard.ts |
| TeacherGuard | SI | TeacherGuard | modules/teacher/guards/teacher.guard.ts |
| StudentGuard | NO | _(no encontrado)_ | N/A |
| ParentGuard | ~SI | ParentAuthGuard | modules/parents/guards/parent-auth.guard.ts |
| OwnerGuard | ~SI | ResourceOwnershipGuard | shared/guards/resource-ownership.guard.ts |
| ClassroomMemberGuard | ~SI | ClassroomOwnershipGuard | modules/teacher/guards/classroom-ownership.guard.ts |
| AssignmentAccessGuard | NO | _(no encontrado)_ | N/A |
| ThrottlerGuard | NO | NotificationRateLimitGuard | modules/notifications/guards/rate-limit.guard.ts |
| FeatureFlagGuard | NO | _(no encontrado)_ | N/A |
| ActiveSubscriptionGuard | NO | _(no encontrado)_ | N/A |
| WebSocketAuthGuard | SI | WsJwtGuard | modules/websocket/guards/ws-jwt.guard.ts |
| _(no listado)_ | - | ModelReadyGuard | modules/ml/guards/model-ready.guard.ts |
| _(no listado)_ | - | AccountStatusGuard | shared/guards/account-status.guard.ts |
| _(no listado)_ | - | AuthGuard | shared/guards/auth.guard.ts |
| _(no listado)_ | - | EmailVerifiedGuard | shared/guards/email-verified.guard.ts |
| _(no listado)_ | - | PermissionsGuard | shared/guards/permissions.guard.ts |

*TenantGuard es un decorator, no un guard file.

---

## 3. COHERENCE-ENTITIES-DDL.md vs Real

| Modulo | COHERENCE | Real | Delta | Nota |
|--------|-----------|------|-------|------|
| auth | 17 | 18 | +1 | |
| gamification | 19 | 21 | +2 | comodin-use, user-skill-rating |
| educational | 16 | 16 | 0 | |
| progress | 18 | 20 | +2 | learning-path-module + 1 |
| social | 17 | 26 | +9 | 6 guild entities + team-vs-team + user-block + user-report |
| admin | 16 | 16 | 0 | |
| assignments | 4 | 4 | 0 | |
| audit | 3 | 3 | 0 | |
| content | 10 | 10 | 0 | |
| lti | 3 | 3 | 0 | |
| notifications | 6 | 7 | +1 | rate-limit-log.entity.ts |
| teacher | 6 | 6 (7 classes) | +1 class | message.entity.ts has 2 @Entity |
| communication | 0 (Pendiente) | 2 | +2 | conversation + conversation-participant |
| **TOTAL** | 135 | 152 (153 classes) | +17/+18 | |

### "Tablas sin Entity" Update

COHERENCE dice 22 tablas sin entity. Actualizacion:

| Tabla | COHERENCE Status | Real Status |
|-------|-----------------|-------------|
| 16 data_warehouse tables | Sin entity (intencional) | Sin cambio |
| auth.users | Sin entity (Supabase) | Sin cambio |
| auth_management.roles (03b) | Sin entity (catalogo) | Sin cambio |
| social_features.guild_mission_contributions | Sin entity | **AHORA TIENE entity** |
| social_features.guild_emblems | Sin entity | **AHORA TIENE entity** |
| social_features.user_blocks | Sin entity | **AHORA TIENE entity** |
| social_features.user_reports | Sin entity | **AHORA TIENE entity** |
| communication.conversations | Pendiente entity | **AHORA TIENE entity** |
| communication.conversation_participants | Pendiente entity | **AHORA TIENE entity** |
| communication.messages | Parcial | **COMPLETO** (en teacher module) |
| communication.message_participants | Pendiente entity | **COMPLETO** (en teacher module) |

**Tablas realmente sin entity ahora: 18** (16 data_warehouse + auth.users + auth_management.roles)
**Cobertura actualizada: 153/171 = 89.5%** (vs 87% anterior)

---

## 4. MODELO-DATOS.md: Tablas Conceptuales vs DDL Real

### Clasificacion Completa

| Schema Conceptual | Tabla Conceptual | DDL Real | Clasificacion |
|-------------------|-----------------|----------|---------------|
| auth | users | auth.users | MATCH |
| auth | user_profiles | auth_management.profiles | NAMING_ALIAS |
| auth | user_preferences | auth_management.user_preferences | MATCH |
| auth | sessions | auth_management.user_sessions | NAMING_ALIAS |
| auth | refresh_tokens | _(no existe)_ | NO_EXISTE |
| auth | oauth_connections | _(no existe)_ | FUTURO |
| auth | password_resets | auth_management.password_reset_tokens | NAMING_ALIAS |
| auth | login_attempts | auth_management.auth_attempts | NAMING_ALIAS |
| tenants | tenants | auth_management.tenants | MATCH |
| tenants | tenant_settings | system_configuration.system_settings | DIFERENTE |
| tenants | tenant_subscriptions | _(no existe)_ | FUTURO |
| tenants | tenant_members | auth_management.memberships | NAMING_ALIAS |
| education | educational_modules | educational_content.modules | NAMING_ALIAS |
| education | module_progress | progress_tracking.module_progress | MATCH (diff schema) |
| education | exercises | educational_content.exercises | MATCH |
| education | exercise_types | _(PostgreSQL ENUM)_ | DIFERENTE |
| education | exercise_attempts | progress_tracking.exercise_attempts | MATCH (diff schema) |
| education | exercise_results | progress_tracking.exercise_submissions | NAMING_ALIAS |
| education | exercise_feedback | _(inline en exercise_attempts)_ | DIFERIDO |
| education | contents | content_management.content_templates | NAMING_ALIAS |
| education | content_versions | content_management.content_versions | MATCH |
| education | content_categories | content_management.content_categories | MATCH |
| education | content_tags | educational_content.content_tags | MATCH |
| education | reading_assignments | educational_content.assignments | NAMING_ALIAS |
| education | spaced_repetition | _(no existe)_ | FUTURO |
| gamification | xp_transactions | gamification_system.ml_coins_transactions | DIFERENTE |
| gamification | levels | _(config-based)_ | DIFERENTE |
| gamification | rank_definitions | gamification_system.maya_ranks | NAMING_ALIAS |
| gamification | student_gamification | gamification_system.user_stats | NAMING_ALIAS |
| gamification | gamification_config | system_configuration.gamification_parameters | NAMING_ALIAS |
| gamification | xp_multipliers | _(config JSON)_ | DIFERIDO |
| gamification | daily_xp_limits | _(config JSON)_ | DIFERIDO |
| gamification | streak_records | _(inline en user_stats)_ | DIFERIDO |
| social | teams | social_features.teams | MATCH |
| social | team_members | social_features.team_members | MATCH |
| social | social_interactions | social_features.social_interactions | MATCH |
| social | social_feed | social_features.user_activities | NAMING_ALIAS |
| social | team_challenges | social_features.team_challenges | MATCH |
| social | forum_posts | social_features.discussion_threads | NAMING_ALIAS |
| social | forum_replies | _(no existe como tabla separada)_ | DIFERIDO |
| classrooms | classrooms | social_features.classrooms | MATCH |
| classrooms | classroom_students | social_features.classroom_members | NAMING_ALIAS |
| classrooms | classroom_teachers | social_features.teacher_classrooms | NAMING_ALIAS |
| classrooms | classroom_config | _(inline en classrooms)_ | DIFERIDO |
| classrooms | assignments | educational_content.assignments | MATCH (diff schema) |
| classrooms | assignment_submissions | educational_content.assignment_submissions | MATCH (diff schema) |
| classrooms | school_periods | _(no existe)_ | FUTURO |
| analytics | analytics_events | audit_logging.audit_logs (via ETL) | DIFERENTE |
| analytics | analytics_daily | data_warehouse.fact_daily_progress | NAMING_ALIAS |
| analytics | analytics_weekly | _(materialized view)_ | DIFERENTE |
| analytics | analytics_monthly | _(materialized view)_ | DIFERENTE |
| analytics | engagement_metrics | progress_tracking.engagement_metrics | MATCH |
| reports | report_templates | _(no existe)_ | FUTURO |
| reports | report_instances | _(no existe)_ | FUTURO |
| reports | report_schedules | _(no existe)_ | FUTURO |
| reports | report_exports | _(no existe)_ | FUTURO |
| notifications | notification_templates | notifications.notification_templates | MATCH |
| notifications | notification_queue | notifications.notification_queue | MATCH |
| notifications | notification_logs | notifications.notification_logs | MATCH |
| notifications | notification_preferences | notifications.notification_preferences | MATCH |
| notifications | push_subscriptions | notifications.user_devices | NAMING_ALIAS |
| store | store_items | gamification_system.shop_items | NAMING_ALIAS |
| store | store_categories | gamification_system.shop_categories | NAMING_ALIAS |
| store | store_purchases | gamification_system.user_purchases | NAMING_ALIAS |
| store | student_inventory | gamification_system.comodines_inventory | NAMING_ALIAS |
| store | ml_coin_transactions | gamification_system.ml_coins_transactions | NAMING_ALIAS |
| store | ml_coin_balances | _(inline en user_stats)_ | DIFERIDO |
| missions | mission_definitions | gamification_system.missions | NAMING_ALIAS |
| missions | mission_daily_rotation | _(no existe)_ | FUTURO |
| missions | mission_weekly_rotation | _(no existe)_ | FUTURO |
| missions | mission_progress | progress_tracking.scheduled_missions | NAMING_ALIAS |
| missions | quest_chains | _(no existe)_ | FUTURO |
| missions | quest_progress | _(no existe)_ | FUTURO |
| leaderboard | leaderboard_entries | gamification_system.leaderboard_metadata | NAMING_ALIAS |
| leaderboard | leaderboard_seasons | _(config-based)_ | DIFERIDO |
| leaderboard | leaderboard_history | _(no existe)_ | FUTURO |
| leaderboard | season_rewards | _(no existe)_ | FUTURO |
| content | media_files | content_management.media_files | MATCH |
| content | media_categories | _(no existe como tabla separada)_ | DIFERIDO |
| content | content_libraries | _(no existe)_ | FUTURO |
| parents | parent_profiles | auth_management.parent_accounts | NAMING_ALIAS |
| parents | parent_student_links | auth_management.parent_student_links | MATCH |
| parents | parent_notifications | auth_management.parent_notifications | MATCH |
| parents | link_codes | _(inline en parent_student_links)_ | DIFERIDO |
| settings | system_settings | system_configuration.system_settings | MATCH |
| settings | feature_flags | system_configuration.feature_flags | MATCH |
| settings | gamification_params | system_configuration.gamification_parameters | NAMING_ALIAS |
| audit | audit_logs | audit_logging.audit_logs | MATCH |
| audit | data_changes | _(no existe)_ | DIFERIDO |
| audit | access_logs | audit_logging.user_activity_logs | NAMING_ALIAS |

### Resumen Clasificacion

| Tipo | Cantidad | % |
|------|----------|---|
| MATCH (nombre exacto) | 28 | 33% |
| NAMING_ALIAS (misma tabla, nombre diferente) | 28 | 33% |
| DIFERENTE (implementacion distinta) | 8 | 9% |
| DIFERIDO (cubierto inline/config) | 13 | 15% |
| FUTURO (no implementado, post-MVP) | 12 | 14% |
| NO_EXISTE (descartado) | 1 | 1% |

---

## 5. Funciones MODELO-DATOS.md vs DDL

Las funciones listadas en MODELO-DATOS.md son **conceptuales** y NO tienen correspondencia directa con nombres de funciones en DDL. El DDL usa nombres como:
- `gamilit.calculate_xp_reward()` (no `calculate_xp()`)
- `gamilit.fn_update_timestamps()` (no `update_timestamps()`)
- `auth_management.validate_user_role()` (no `validate_user_credentials()`)

**Recomendacion:** Agregar nota explicita en MODELO-DATOS.md indicando que las funciones listadas son descripciones conceptuales, no nombres DDL exactos.

---

## 6. app.module.ts Datasource Mapping

| Datasource | Schema | Entity Paths | Completo? |
|-----------|--------|-------------|-----------|
| auth | auth_management | modules/auth/entities/**/*.entity | SI |
| educational | educational_content | modules/educational + assignments + teacher-content | SI |
| gamification | gamification_system | modules/gamification + notification + profile + tenant | SI |
| progress | progress_tracking | modules/progress + teacher-alert + profile + classroom + tenant + school + module + exercise | SI |
| social | social_features | modules/social + assignments + teacher-report + profile + tenant | SI |
| content | content_management | modules/content/entities/**/*.entity | SI |
| audit | audit_logging | modules/audit/entities/**/*.entity | SI |
| notifications | notifications | modules/notifications/entities/multichannel/**/*.entity | SI |
| communication | communication | modules/teacher/entities/message*.entity | **INCOMPLETO** |
| admin_dashboard | admin_dashboard | admin-report + user + role | SI |

**communication datasource falta:** `modules/communication/entities/**/*.entity`

---

*Generado por: Claude Code - TASK-2026-02-12-ANALISIS-BACKEND-INTEGRACION*
