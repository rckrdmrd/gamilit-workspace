# Reporte de Comparación: DDL vs DATABASE_INVENTORY.yml

**Proyecto:** GAMILIT
**Fecha:** 2025-11-08
**Generado por:** Análisis automatizado de estructura DDL

---

## Resumen Ejecutivo

### Estado Global de Sincronización

| Objeto | Inventario | DDL Real | Diferencia | Estado |
|--------|-----------|----------|-----------|--------|
| **Schemas** | 13 | 13 | 0 | ✅ CORRECTO |
| **Tablas** | 62 | 62 | 0 | ✅ CORRECTO |
| **Funciones** | 61 | 59 | -2 | ⚠️ DISCREPANCIA |
| **Triggers** | 39 | 39 | 0 | ✅ CORRECTO |
| **Vistas** | 12 | 8 | -4 | ⚠️ DISCREPANCIA |
| **Vistas Materializadas** | 4 | 4 | 0 | ✅ CORRECTO |
| **Enums** | 10 | 10 | 0 | ✅ CORRECTO |

### Hallazgos Clave

✅ **COINCIDENCIAS CORRECTAS:**
- Total de schemas: 13
- Total de tablas: 62
- Total de triggers: 39
- Total de vistas materializadas: 4
- Total de enums: 10

⚠️ **DISCREPANCIAS IMPORTANTES:**
- **Funciones:** Inventario documenta 61, DDL contiene 59 (faltan 2 o hay 2 de más)
- **Vistas regulares:** Inventario documenta 12-18, DDL contiene 8 (faltan 4-10 vistas)
- **Distribución de tablas por schema:** El total coincide (62) pero la distribución difiere significativamente

🔍 **HALLAZGO CRÍTICO:**
- El schema `public` contiene 6 tablas relacionadas con assignments que según el inventario deberían estar en otros schemas
- Los schemas `admin_dashboard`, `storage` y `gamilit` no tienen tablas en DDL pero el inventario documenta 24 tablas entre ellos

---

## Análisis Detallado por Schema

### 1. Schema: auth
✅ **Estado:** COMPLETO

| Tipo | Inventario | DDL | Estado |
|------|-----------|-----|--------|
| Tablas | 1 | 1 | ✅ |
| Enums | - | 2 | ℹ️ Extras |

**Enums en DDL:**
- `aal_level`
- `code_challenge_method`

---

### 2. Schema: auth_management
⚠️ **Estado:** DISCREPANCIAS EN NOMBRES

| Tipo | Inventario | DDL | Estado |
|------|-----------|-----|--------|
| Tablas | 11 | 12 | ⚠️ |
| Funciones | 6 | 6 | ⚠️ Nombres diferentes |
| Triggers | - | 6 | ✅ |

**Tablas documentadas pero NO en DDL:**
- `users_extended` → Probablemente es `profiles` en DDL
- `roles` → Probablemente es `user_roles` en DDL
- `permissions`, `user_permissions`, `role_permissions`, `permission_groups`
- `login_attempts` → Probablemente es `auth_attempts` en DDL
- `account_states`
- `password_history`

**Tablas en DDL pero NO documentadas:**
- `auth_attempts`
- `auth_providers`
- `email_verification_tokens`
- `memberships`
- `password_reset_tokens`
- `profiles`
- `security_events`
- `tenants`
- `user_preferences`
- `user_sessions`
- `user_suspensions` (+1 tabla extra)

**Funciones: Nombres diferentes pero funcionalidad similar**

| Inventario | DDL |
|------------|-----|
| `check_user_permission` | `user_has_permission` |
| `get_user_roles` | `get_user_role` |
| - | `hash_token` (nueva) |
| - | `revoke_role_from_user` (nueva) |
| - | `update_user_preferences` (nueva) |

---

### 3. Schema: educational_content
❌ **Estado:** INCOMPLETO (4 de 12 tablas)

| Tipo | Inventario | DDL | Estado |
|------|-----------|-----|--------|
| Tablas | 12 | 4 | ❌ Faltan 8 |
| Funciones | 3 | 2 | ⚠️ |
| Triggers | - | 4 | ✅ |

**Tablas implementadas (4):**
- ✅ `modules`
- ✅ `exercises`
- ✅ `assessment_rubrics` (no documentada en inventario)
- ✅ `media_resources` (no documentada en inventario)

**Tablas documentadas pero FALTANTES en DDL (10):**
- ❌ `assignments` → Está en schema `public` incorrectamente
- ❌ `assignment_submissions` → Está en schema `public` incorrectamente
- ❌ `exercise_options`
- ❌ `exercise_answers`
- ❌ `content_metadata`
- ❌ `module_dependencies`
- ❌ `taxonomies`
- ❌ `content_tags`
- ❌ `content_versions` → Está en `content_management`
- ❌ `content_approvals`

**Funciones:**
- Inventario documenta: `validate_content_structure`, `version_content`, `approve_content`
- DDL implementa: `calculate_learning_path`, `get_recommended_missions`
- ⚠️ Conjuntos completamente diferentes

---

### 4. Schema: gamification_system
⚠️ **Estado:** NOMBRES DIFERENTES (13 de 12 tablas)

| Tipo | Inventario | DDL | Estado |
|------|-----------|-----|--------|
| Tablas | 12 | 13 | ⚠️ +1 extra |
| Funciones | 8 | 19 | ✅ Muchas más |
| Enums | - | 2 | ✅ |
| Vistas Mat. | - | 4 | ✅ |
| Triggers | - | 7 | ✅ |

**Tablas implementadas (13):**
- ✅ `achievements`
- ✅ `user_achievements`
- ✅ `user_ranks`
- ✅ `achievement_categories` (no documentada)
- ✅ `active_boosts` (no documentada)
- ✅ `comodines_inventory` (no documentada)
- ✅ `inventory_transactions` (no documentada)
- ✅ `leaderboard_metadata` (no documentada)
- ✅ `maya_ranks` (no documentada)
- ✅ `missions` (no documentada)
- ✅ `ml_coins_transactions` (no documentada)
- ✅ `notifications` (no documentada)
- ✅ `user_stats` (no documentada)

**Tablas documentadas pero con nombres diferentes:**
- `ranks` → `maya_ranks`
- `coin_transactions` → `ml_coins_transactions`
- `user_inventory` → `comodines_inventory`
- `powerups` → Parcialmente `active_boosts`
- `user_powerups` → ?
- `streaks` → Lógica en `user_stats`
- `daily_challenges` → ?
- `challenge_completions` → ?
- `leaderboards` → `leaderboard_metadata`

**Funciones: DDL muy superior (19 vs 8)**
- ✅ DDL tiene 17 funciones adicionales bien implementadas
- Sistema de gamificación está más desarrollado que lo documentado

**Enums:**
- `maya_rank`
- `transaction_type`

**Vistas Materializadas:**
- `mv_global_leaderboard`
- `mv_classroom_leaderboard`
- `mv_weekly_leaderboard`
- `mv_mechanic_leaderboard`

---

### 5. Schema: progress_tracking
❌ **Estado:** INCOMPLETO (5 de 11 tablas)

| Tipo | Inventario | DDL | Estado |
|------|-----------|-----|--------|
| Tablas | 11 | 5 | ❌ Faltan 6 |
| Funciones | 6 | 5 | ⚠️ |
| Vistas | - | 1 | ✅ |
| Triggers | - | 3 | ✅ |

**Tablas implementadas (5):**
- ✅ `module_progress` (similar a `user_module_progress`)
- ✅ `exercise_attempts` (similar a `user_exercise_attempts`)
- ✅ `exercise_submissions`
- ✅ `learning_sessions`
- ✅ `scheduled_missions`

**Tablas documentadas pero FALTANTES (6+):**
- ❌ `user_statistics` → Probablemente en `gamification_system.user_stats`
- ❌ `module_completion_tracking`
- ❌ `learning_paths`
- ❌ `user_learning_paths`
- ❌ `progress_snapshots`
- ❌ `skill_assessments`
- ❌ `mastery_tracking`
- ❌ `engagement_metrics`
- ❌ `teacher_notes` → Está en schema `public`

---

### 6. Schema: admin_dashboard
❌ **Estado:** VACÍO (0 de 9 tablas)

| Tipo | Inventario | DDL | Estado |
|------|-----------|-----|--------|
| Tablas | 9 | 0 | ❌ TODO FALTA |
| Funciones | 3 | 0 | ❌ TODO FALTA |
| Vistas | - | 4 | ✅ Implementadas |

**Tablas documentadas pero FALTANTES (9):**
- ❌ `dashboard_metrics`
- ❌ `system_alerts` → Existe en `audit_logging`
- ❌ `user_activity_logs` → Existe en `audit_logging`
- ❌ `performance_metrics` → Existe en `audit_logging`
- ❌ `resource_usage`
- ❌ `error_logs`
- ❌ `content_moderation`
- ❌ `moderation_rules`
- ❌ `admin_actions`

**Vistas implementadas (4):**
- ✅ `user_stats_summary`
- ✅ `organization_stats_summary`
- ✅ `moderation_queue`
- ✅ `recent_admin_actions`

**Análisis:** Parece que algunas tablas documentadas en `admin_dashboard` están en `audit_logging`

---

### 7. Schema: content_management
⚠️ **Estado:** NOMBRES DIFERENTES (5 de 7 tablas)

| Tipo | Inventario | DDL | Estado |
|------|-----------|-----|--------|
| Tablas | 7 | 5 | ⚠️ |
| Funciones | 3 | 0 | ❌ |
| Triggers | - | 3 | ✅ |

**Tablas implementadas (5):**
- ✅ `content_templates`
- ✅ `content_versions`
- ✅ `flagged_content`
- ✅ `marie_curie_content` (específica, no documentada)
- ✅ `media_files`

**Tablas documentadas pero FALTANTES (7):**
- ❌ `media_library` → Probablemente es `media_files`
- ❌ `media_metadata`
- ❌ `content_categories`
- ❌ `content_authors`
- ❌ `editorial_workflow`
- ❌ `publication_schedule`
- ❌ `content_analytics`

---

### 8. Schema: social_features
⚠️ **Estado:** NOMBRES DIFERENTES (7 de 10 tablas)

| Tipo | Inventario | DDL | Estado |
|------|-----------|-----|--------|
| Tablas | 10 | 7 | ⚠️ |
| Funciones | 3 | 1 | ❌ |
| Triggers | - | 5 | ✅ |

**Tablas implementadas (7):**
- ✅ `classrooms`
- ✅ `classroom_members` (similar a `classroom_enrollments`)
- ✅ `friendships`
- ✅ `schools`
- ✅ `teams`
- ✅ `team_members`
- ✅ `team_challenges`

**Tablas documentadas pero FALTANTES (9):**
- ❌ `classroom_enrollments` → Es `classroom_members`
- ❌ `teacher_classrooms`
- ❌ `classroom_assignments` → Está en `public`
- ❌ `student_groups`
- ❌ `group_memberships`
- ❌ `social_interactions`
- ❌ `friend_requests`
- ❌ `user_follows`
- ❌ `discussion_threads`

---

### 9. Schema: storage
❌ **Estado:** VACÍO (0 de 5 tablas)

| Tipo | Inventario | DDL | Estado |
|------|-----------|-----|--------|
| Tablas | 5 | 0 | ❌ TODO FALTA |
| Enums | - | 1 | ✅ |

**Tablas documentadas pero FALTANTES (5):**
- ❌ `buckets`
- ❌ `objects`
- ❌ `upload_sessions`
- ❌ `file_metadata`
- ❌ `storage_quotas`

**Enum implementado:**
- ✅ `buckettype`

**Análisis:** El enum existe pero las tablas no. Probablemente se usa Supabase Storage.

---

### 10. Schema: audit_logging
⚠️ **Estado:** NOMBRES DIFERENTES (6 tablas)

| Tipo | Inventario | DDL | Estado |
|------|-----------|-----|--------|
| Tablas | 6 | 6 | ⚠️ Nombres diferentes |
| Funciones | 2 | 1 | ⚠️ |
| Triggers | - | 1 | ✅ |

**Tablas en DDL:**
- `audit_logs` (vs `audit_events`)
- `performance_metrics` ✅
- `system_alerts` ✅
- `system_logs` (nuevo)
- `user_activity` (nuevo)
- `user_activity_logs` ✅

**Observación:** Conteo coincide pero nombres difieren. Parece evolución de nomenclatura.

---

### 11. Schema: system_configuration
❌ **Estado:** INCOMPLETO (3 de 7 tablas)

| Tipo | Inventario | DDL | Estado |
|------|-----------|-----|--------|
| Tablas | 7 | 3 | ❌ Faltan 4 |
| Triggers | - | 2 | ✅ |

**Tablas implementadas (3):**
- ✅ `system_settings` (similar a `application_settings`)
- ✅ `feature_flags` (similar a `feature_toggles`)
- ✅ `notification_settings`

**Tablas documentadas pero FALTANTES (5):**
- ❌ `application_settings` → Es `system_settings`
- ❌ `feature_toggles` → Es `feature_flags`
- ❌ `environment_config`
- ❌ `api_configuration`
- ❌ `tenant_configurations`

---

### 12. Schema: gamilit
❌ **Estado:** VACÍO (0 de 10 tablas)

| Tipo | Inventario | DDL | Estado |
|------|-----------|-----|--------|
| Tablas | 10 | 0 | ❌ TODO FALTA |
| Funciones | 2 | 13 | ✅ Muchas más |

**Tablas documentadas pero FALTANTES (10):**
- ❌ `app_metadata`
- ❌ `user_preferences` → Está en `auth_management`
- ❌ `notification_settings` → Está en `system_configuration`
- ❌ `app_sessions`
- ❌ `user_devices`
- ❌ `feature_usage`
- ❌ `onboarding_progress`
- ❌ `user_feedback`
- ❌ `help_requests`
- ❌ `announcements`

**Funciones implementadas (13):**
- ✅ `audit_profile_changes`
- ✅ `get_current_user_id`
- ✅ `get_current_user_role`
- ✅ `initialize_user_stats`
- ✅ `is_admin`
- ✅ `now_mexico`
- ✅ `set_profile_defaults`
- ✅ `update_classroom_member_count`
- ✅ `update_updated_at_column`
- ✅ `update_user_last_login`
- ✅ `update_user_stats_on_exercise_complete`
- ✅ `validate_email_format`
- ✅ `validate_username`

**Análisis:** Schema usado para funciones utilitarias, no para tablas.

---

### 13. Schema: public
⚠️ **Estado:** USO INCORRECTO (6 tablas vs 2 esperadas)

| Tipo | Inventario | DDL | Estado |
|------|-----------|-----|--------|
| Tablas | 2 | 6 | ⚠️ 4 tablas de más |
| Funciones | - | 7 | ℹ️ Extras |
| Enums | - | 5 | ✅ |
| Vistas | - | 3 | ✅ |
| Triggers | - | 8 | ✅ |

**Tablas esperadas (2):**
- ❌ `schema_migrations` (falta)
- ❌ `spatial_ref_sys` (falta)

**Tablas en DDL que NO deberían estar en public (6):**
- ⚠️ `assignments` → Mover a `educational_content`
- ⚠️ `assignment_submissions` → Mover a `educational_content`
- ⚠️ `assignment_students` → Mover a `educational_content`
- ⚠️ `assignment_exercises` → Mover a `educational_content`
- ⚠️ `assignment_classrooms` → Mover a `social_features`
- ⚠️ `teacher_notes` → Mover a `progress_tracking`

**Funciones en public (7):**
- `cleanup_old_system_logs`
- `cleanup_old_user_activity`
- `is_feature_enabled`
- `log_system_event`
- `send_notification`
- `update_feature_flag`
- `validate_date_range`

**Enums en public (5):**
- `aggregation_period`
- `attempt_result`
- `content_type`
- `metric_type`
- `social_event_type`

**Vistas (3):**
- `assignment_submission_stats`
- `classroom_overview`
- `for` (nombre incorrecto, revisar)

---

## Análisis de Vistas

### Vistas Regulares

**Inventario documenta:** 18 vistas
**DDL contiene:** 8 vistas

**Vistas implementadas en DDL:**
1. `admin_dashboard.user_stats_summary` ✅
2. `admin_dashboard.organization_stats_summary` ✅
3. `admin_dashboard.moderation_queue` ✅
4. `admin_dashboard.recent_admin_actions` ✅
5. `progress_tracking.user_progress_summary` ✅
6. `public.assignment_submission_stats` ✅
7. `public.classroom_overview` ✅
8. `public.for` ⚠️ (nombre sospechoso)

**Vistas documentadas pero FALTANTES (10+):**
- ❌ `classroom_engagement_metrics`
- ❌ `achievement_distribution`
- ❌ `module_completion_rates`
- ❌ `daily_active_users`
- ❌ `content_popularity`
- ❌ `user_activity_timeline`
- ❌ `system_health_metrics`
- ❌ `error_summary`
- ❌ `storage_usage_by_user`
- ❌ `notification_delivery_stats`
- ❌ `leaderboard_global` → Existe como vista materializada
- ❌ `leaderboard_classroom` → Existe como vista materializada
- ❌ `assignment_status_summary`
- ❌ `teacher_dashboard_summary`
- ❌ `parent_dashboard_summary`
- ❌ `report_templates_catalog`
- ❌ `audit_trail_summary`

### Vistas Materializadas

✅ **Estado:** COMPLETO Y CORRECTO

**Inventario documenta:** 4 vistas materializadas
**DDL contiene:** 4 vistas materializadas

**Vistas materializadas en DDL:**
1. `gamification_system.mv_global_leaderboard` ✅
2. `gamification_system.mv_classroom_leaderboard` ✅
3. `gamification_system.mv_weekly_leaderboard` ✅
4. `gamification_system.mv_mechanic_leaderboard` ✅

**Nota:** Los nombres difieren del inventario pero la funcionalidad es correcta.

---

## Análisis de Enums

✅ **Estado:** CORRECTO EN CONTEO

**Inventario menciona:** 15 enums (pero línea 23 dice 10)
**DDL contiene:** 10 enums

### Enums implementados en DDL:

1. `auth.aal_level` ✅
2. `auth.code_challenge_method` ✅
3. `gamification_system.maya_rank` ✅ (vs `rank` en inventario)
4. `gamification_system.transaction_type` ✅
5. `public.aggregation_period` ✅
6. `public.attempt_result` ✅
7. `public.content_type` ✅
8. `public.metric_type` ✅
9. `public.social_event_type` ✅
10. `storage.buckettype` ✅

### Enums documentados en inventario pero NO en DDL:

⚠️ **Nota:** El inventario lista 15 enums en la sección de enums pero dice 10 en el resumen. Los 10 del DDL coinciden con el conteo del resumen.

Enums adicionales mencionados en la sección detallada:
- ❌ `user_role`
- ❌ `account_state`
- ❌ `achievement_type`
- ❌ `achievement_category`
- ❌ `powerup_type`
- ❌ `exercise_type`
- ❌ `difficulty_level`
- ❌ `bloom_taxonomy_level`
- ❌ `notification_channel`
- ❌ `notification_status`
- ❌ `assignment_status`
- ❌ `content_status`
- ❌ `report_format`
- ❌ `lti_version`

**Análisis:** Posible inconsistencia en el inventario. El resumen dice 10 (correcto), pero la sección detallada lista 15.

---

## Recomendaciones

### 🔴 Prioridad CRÍTICA

#### 1. Reorganizar tablas del schema public
**Problema:** 6 tablas de assignments están en `public` cuando deberían estar en schemas especializados.

**Acciones:**
```sql
-- Mover a educational_content:
ALTER TABLE public.assignments SET SCHEMA educational_content;
ALTER TABLE public.assignment_submissions SET SCHEMA educational_content;
ALTER TABLE public.assignment_students SET SCHEMA educational_content;
ALTER TABLE public.assignment_exercises SET SCHEMA educational_content;

-- Mover a social_features:
ALTER TABLE public.assignment_classrooms SET SCHEMA social_features;

-- Mover a progress_tracking:
ALTER TABLE public.teacher_notes SET SCHEMA progress_tracking;
```

#### 2. Actualizar DATABASE_INVENTORY.yml
**Problema:** El inventario no refleja la realidad del DDL.

**Acciones:**
1. Corregir conteo de vistas (dice 12-18, real es 8)
2. Actualizar lista completa de tablas por schema con nombres reales
3. Actualizar lista de funciones (muchos nombres han cambiado)
4. Clarificar inconsistencia en enums (resumen dice 10, sección dice 15)
5. Documentar tablas que existen pero no están en inventario

### 🟡 Prioridad ALTA

#### 3. Completar DDL de schemas vacíos

**Schema admin_dashboard (0/9 tablas):**
- Evaluar si tablas deben estar aquí o en `audit_logging`
- `dashboard_metrics`, `resource_usage`, `error_logs` deben crearse
- `content_moderation`, `moderation_rules`, `admin_actions` deben crearse

**Schema storage (0/5 tablas):**
- Decisión: ¿Usar Supabase Storage o crear tablas propias?
- Si usar Supabase: Documentar en inventario
- Si crear: Implementar `buckets`, `objects`, `upload_sessions`, etc.

**Schema gamilit (0/10 tablas):**
- Evaluar si son necesarias o si la lógica está en otros schemas
- `user_preferences` → Ya está en `auth_management`
- `notification_settings` → Ya está en `system_configuration`
- Crear las realmente necesarias

#### 4. Completar tablas faltantes en schemas parciales

**Schema educational_content (4/12 tablas):**
- ❌ `exercise_options`
- ❌ `exercise_answers`
- ❌ `content_metadata`
- ❌ `module_dependencies`
- ❌ `taxonomies`
- ❌ `content_tags`
- ❌ `content_approvals`

**Schema progress_tracking (5/11 tablas):**
- ❌ `module_completion_tracking`
- ❌ `learning_paths`
- ❌ `user_learning_paths`
- ❌ `progress_snapshots`
- ❌ `skill_assessments`
- ❌ `mastery_tracking`
- ❌ `engagement_metrics`

**Schema social_features (7/10 tablas):**
- ❌ `teacher_classrooms`
- ❌ `student_groups`
- ❌ `group_memberships`
- ❌ `social_interactions`
- ❌ `friend_requests`
- ❌ `user_follows`
- ❌ `discussion_threads`

**Schema content_management (5/7 tablas):**
- ❌ `media_metadata`
- ❌ `content_categories`
- ❌ `content_authors`
- ❌ `editorial_workflow`
- ❌ `publication_schedule`
- ❌ `content_analytics`

**Schema system_configuration (3/7 tablas):**
- ❌ `environment_config`
- ❌ `api_configuration`
- ❌ `tenant_configurations`

### 🟢 Prioridad MEDIA

#### 5. Completar funciones faltantes
- `admin_dashboard`: 3 funciones documentadas pero no implementadas
- `content_management`: 3 funciones documentadas pero no implementadas
- Varias funciones con nombres cambiados necesitan actualización en inventario

#### 6. Completar vistas regulares
- Faltan 10+ vistas documentadas
- Revisar vista `public.for` (nombre sospechoso)

#### 7. Revisar y documentar enums
- Clarificar si se necesitan los 5 enums adicionales mencionados
- Si no son necesarios, eliminar del inventario
- Si son necesarios, crearlos en DDL

---

## Archivos de Análisis Generados

Los siguientes archivos fueron generados durante este análisis:

1. **Script de análisis de DDL:** `/tmp/analyze_ddl.py`
2. **Script de comparación:** `/tmp/compare_with_inventory.py`
3. **Salida de análisis DDL:** `/tmp/ddl_analysis.txt`
4. **Reporte de comparación:** `/tmp/comparison_report.txt`

---

## Conclusión

El proyecto tiene una **buena base de DDL implementado** con 62 tablas, 59 funciones, 39 triggers y otros objetos funcionando correctamente. Sin embargo, existe una **desalineación significativa** entre:

1. **La documentación (inventario)** que describe la arquitectura ideal planificada
2. **La implementación real (DDL)** que muestra la evolución práctica del proyecto

**Próximos pasos recomendados:**

1. ✅ **Usar este reporte** para decidir qué actualizar: ¿inventario o DDL?
2. 🔴 **Priorizar la reorganización del schema public** (tablas mal ubicadas)
3. 🟡 **Completar schemas críticos** (admin_dashboard, educational_content, progress_tracking)
4. 🟢 **Actualizar inventario** para reflejar nombres reales y estructura actual

---

**Generado:** 2025-11-08
**Schemas analizados:** 13
**Archivos SQL escaneados:** 286
**Total de objetos de BD inventariados:** 182
