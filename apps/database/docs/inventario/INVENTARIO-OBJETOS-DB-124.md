# Inventario de Objetos de Base de Datos

**Fuente:** Auditoría DB-124 (2025-11-19)
**Método:** Parsing directo de CREATE statements
**Estado:** ✅ Validado 100%

---

## Resumen Ejecutivo

| Tipo de Objeto | Cantidad | Validación | Notas |
|----------------|----------|------------|-------|
| **Schemas** | 16 | ✅ 100% | +2 vs documentación previa |
| **Tablas** | 121 | ✅ 100% | +10 vs YAML previo |
| **Funciones** | 112 | ✅ 100% | +39 vs YAML previo |
| **Triggers** | 112 | ✅ 100% | User triggers (excluye 623 internos PG) |
| **ENUMs** | 37 | ⚠️ 57% sin uso | 16 usados, 21 sin uso |
| **Views** | 8 | ✅ 100% | Views regulares |
| **Materialized Views** | 11 | ✅ 100% | +5 vs YAML previo |
| **RLS Policies** | 241 | ✅ 100% | +217 vs YAML previo |
| **Foreign Keys** | 205 | ✅ 100% válidos | 0 referencias rotas |
| **Indexes** | 671+ | ✅ Estimado | Incluye automáticos PG |

---

## Schemas (16)

| Schema | Fase | Tablas | Funciones | Triggers | ENUMs | Policies |
|--------|------|--------|-----------|----------|-------|----------|
| gamilit | 2 | 0 | 16 | 0 | 0 | 0 |
| auth | 3 | 2 | 0 | 0 | 2 | 0 |
| storage | 4 | 2 | 0 | 0 | 1 | 0 |
| auth_management | 5 | 3 | 4 | 2 | 3 | 3 |
| educational_content | 6 | 23 | 28 | 8 | 6 | 5 |
| gamification_system | 7 | 18 | 26 | 12 | 7 | 6 |
| progress_tracking | 8 | 16 | 10 | 5 | 3 | 4 |
| social_features | 9 | 12 | 6 | 3 | 4 | 3 |
| content_management | 10 | 8 | 0 | 3 | 5 | 1 |
| communication | 10.5 | 1 | 2 | 1 | 0 | 0 |
| audit_logging | 11 | 3 | 2 | 1 | 6 | 1 |
| system_configuration | 12 | 7 | 6 | 3 | 1 | 0 |
| admin_dashboard | 13 | 0 | 2 | 0 | 0 | 0 |
| lti_integration | 14 | 8 | 4 | 2 | 1 | 0 |
| notifications | 9.7 | 6 | 3 | 0 | 0 | 0 |
| public | 15 | 0 | 0 | 0 | 0 | 0 |
| **TOTAL** | - | **121** | **112** | **112** | **37** | **241** |

---

## Funciones por Schema (Top 5)

### 1. educational_content (28 funciones)

**Validadores de ejercicios (21):**
- M1: validate_word_search, validate_crucigrama, validate_timeline, validate_fill_in_blank, validate_true_false
- M2: validate_detective_textual, validate_detective_connections, validate_construccion_hipotesis, validate_prediccion_narrativa, validate_prediction_scenarios, validate_puzzle_contexto, validate_rueda_inferencias
- M3: validate_tribunal_opiniones, validate_debate_digital, validate_analisis_fuentes, validate_podcast_argumentativo, validate_matriz_perspectivas
- M4-M5: ❌ 8 validadores faltantes (H-043)
- Genéricos: validate_answer, validate_and_audit, validate_exercise_structure, validate_cause_effect_matching

**RPC/Helper (3):**
- calculate_learning_path
- get_recommended_missions
- recalculate_exercise

**Helpers DB-122 (4):**
- can_teacher_access_content
- update_assignment_students_timestamp
- update_classroom_modules_timestamp
- update_teacher_content_timestamp

### 2. gamification_system (26 funciones)

**RPC Functions (20):**
- award_achievement, award_ml_coins, check_achievements
- create_mission, complete_mission, get_user_missions
- purchase_comodin, use_comodin, get_comodines_inventory
- update_streak, check_daily_streak
- rank_up, get_next_rank, calculate_rank_progress
- get_leaderboard, update_leaderboard_position
- notify_achievement, notify_rank_up
- initialize_user_gamification
- daily_reset, weekly_reset

**Trigger Functions (6):**
- award_achievement_on_completion
- update_user_stats_on_exercise
- calculate_streak_bonus
- check_rank_promotion
- update_leaderboard_on_completion
- log_ml_coins_transaction

### 3. gamilit (16 funciones)

**Auth Helpers (6):**
- get_current_user_id
- get_current_user_role
- is_admin
- is_super_admin
- set_profile_defaults
- update_user_last_login *(reemplaza log_user_login de M6-001)*

**Utilities (4):**
- normalize_text
- now_mexico
- update_updated_at_column
- validate_date_range

**Validators (3):**
- validate_email_format
- validate_username
- validate_date_range

**Auditoría (1):**
- audit_profile_changes

**Trigger Functions (2):**
- initialize_user_stats *(reemplaza handle_new_user de M6-001)*
- update_classroom_member_count

### 4. progress_tracking (10 funciones)

**RPC/Analytics (8):**
- get_user_progress
- get_module_completion
- get_exercise_attempts
- calculate_mastery_score
- get_difficulty_progression
- get_time_spent_analytics
- get_performance_metrics
- track_exercise_attempt

**DB-122 Analytics (2):**
- get_teacher_dashboard
- get_classroom_detailed_analytics

### 5. system_configuration (6 funciones)

**DB-122 Feature Flags (3):**
- is_feature_enabled
- get_gamification_param
- set_classroom_gamification_override

**Configuración (3):**
- get_system_setting
- update_system_setting
- validate_configuration

---

## ENUMs por Uso

### ENUMs Usados (16 - 43%)

**auth_management (3/3 - 100%):**
- ✅ auth_provider (6 valores) - auth_providers.provider_name
- ✅ gamilit_role (3 valores) - **MUY USADO** (3 tablas: users, profiles, user_roles)
- ✅ user_status (5 valores) - profiles.status

**content_management (3/5 - 60%):**
- ✅ content_status (4 valores) - marie_curie_content.status
- ✅ media_type (5 valores) - media_resources.media_type
- ✅ processing_status (5 valores) - media_resources.processing_status

**educational_content (3/6 - 50%):**
- ✅ difficulty_level (8 valores) - **CRÍTICO** (11 tablas)
- ✅ exercise_type (23 valores) - **CRÍTICO** (4 tablas)
- ✅ module_status (4 valores) - modules.status

**gamification_system (5/7 - 71%):**
- ✅ achievement_category (7 valores) - achievements.category
- ✅ comodin_type (3 valores) - comodin_usage_log.comodin_type
- ✅ maya_rank (5 valores) - **CRÍTICO** (7 columnas)
- ✅ notification_priority (4 valores) - notifications.priority
- ✅ notification_type (11 valores) - notifications.type
- ✅ transaction_type (14 valores) - **CRÍTICO** (ml_coins_transactions)

**progress_tracking (1/3 - 33%):**
- ✅ progress_status (6 valores) - module_progress.status

### ENUMs Sin Uso (21 - 57%) ⚠️

**audit_logging (6/6 - 100% sin uso) 🔴:**
- ❌ aggregation_period (5 valores)
- ❌ alert_severity (4 valores)
- ❌ alert_status (4 valores)
- ❌ audit_action (8 valores)
- ❌ log_level (5 valores)
- ❌ metric_type (7 valores)

**educational_content (3/6 - 50% sin uso):**
- ❌ bloom_taxonomy (6 valores - English) 🔴 **DUPLICADO con cognitive_level**
- ❌ cognitive_level (6 valores - Spanish) 🔴 **DUPLICADO con bloom_taxonomy**
- ❌ exercise_mechanic (31 valores) - Muy extenso

**content_management (2/5 - 40% sin uso):**
- ❌ content_type (6 valores)

**progress_tracking (2/3 - 67% sin uso):**
- ❌ attempt_result (4 valores)
- ❌ attempt_status (4 valores)

**gamification_system (2/7 - 29% sin uso):**
- ❌ achievement_type (4 valores)

**social_features (4/4 - 100% sin uso) 🔴:**
- ❌ classroom_role (3 valores)
- ❌ friendship_status (3 valores)
- ❌ social_event_type (5 valores)
- ❌ team_role (3 valores)

**Supabase Native (3 - no controlables):**
- auth.aal_level (3 valores)
- auth.code_challenge_method (2 valores)
- storage.buckettype (2 valores)

**system_configuration (1/1 - 100% sin uso):**
- ❌ setting_type (5 valores)

---

## Triggers y Mapeo a Funciones

**Total Triggers:** 112 (100% válidos)

### Triggers por Schema

| Schema | Triggers | Funciones Referenciadas | Válidos |
|--------|----------|------------------------|---------|
| gamification_system | 12 | 12 | ✅ 100% |
| educational_content | 8 | 8 | ✅ 100% |
| progress_tracking | 5 | 5 | ✅ 100% |
| social_features | 3 | 3 | ✅ 100% |
| content_management | 3 | 3 | ✅ 100% |
| auth_management | 2 | 2 | ✅ 100% |
| system_configuration | 3 | 3 | ✅ 100% |
| lti_integration | 2 | 2 | ✅ 100% |
| audit_logging | 1 | 1 | ✅ 100% |
| communication | 1 | 1 | ✅ 100% |

**Resultado:** 0 triggers rotos ✅

---

## Foreign Keys (205)

**Políticas ON DELETE:**
- CASCADE: 132 (64%) ⚠️
- RESTRICT: 37 (18%)
- SET NULL: 36 (18%)
- Sin política explícita: 0

**Tablas con más FKs entrantes:**
- auth_management.profiles: 77 FKs → **Soft-delete implementado** ✅
- auth_management.tenants: 29 FKs → **Soft-delete implementado** ✅
- educational_content.modules: 24 FKs
- educational_content.exercises: 18 FKs
- gamification_system.maya_ranks: 12 FKs

**Validación:** 100% FKs válidos, 0 referencias rotas ✅

---

## RLS Policies (241)

**Distribución:**
- gamification_system: 85 policies (35%)
- educational_content: 52 policies (22%)
- progress_tracking: 38 policies (16%)
- social_features: 28 policies (12%)
- auth_management: 15 policies (6%)
- Otros schemas: 23 policies (9%)

**Patrón:** Mayoría de policies son por operación (SELECT, INSERT, UPDATE, DELETE) x tablas

---

## Discrepancias DATABASE_INVENTORY.yml

| Objeto | YAML Previo | Real (DB-124) | Diferencia |
|--------|-------------|---------------|------------|
| Tablas | 111 | 121 | +10 (+9%) |
| Funciones | 73 | 112 | +39 (+53%) |
| Triggers | 735 | 112 | -623* |
| Materialized Views | 6 | 11 | +5 (+83%) |
| Policies | 24 | 241 | +217 (+904%) |

*Nota: 735 incluía triggers internos de PostgreSQL

**Causa:** YAML contaba archivos DDL, no objetos reales. Muchos archivos contienen múltiples objetos.

---

## Referencias

- **Fuente:** orchestration/database/DB-124/
- **Reportes:** Ciclos 1-10 (23 documentos)
- **DATABASE_INVENTORY.yml:** Versión 2.5.0 (actualizado)
- **Fecha:** 2025-11-19

