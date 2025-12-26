# INVENTARIO DE TRIGGERS - BASE DE DATOS

**Proyecto:** GAMILIT - Plataforma Educativa Gamificada
**Fecha:** 2025-12-23
**Total Triggers:** 111
**Auditoria:** Analisis DDL completo

---

## RESUMEN POR SCHEMA

| Schema | Triggers | Tipo Principal |
|--------|----------|----------------|
| auth_management | 10 | Inicializacion + Timestamps |
| gamification_system | 12 | Business Logic |
| progress_tracking | 12 | Progreso + Misiones |
| educational_content | 8 | Timestamps |
| social_features | 6 | Timestamps |
| system_configuration | 5 | Timestamps |
| audit_logging | 1 | Timestamps |
| content_management | 4 | Timestamps |
| communication | 1 | Timestamps |
| Otros (tablas especificas) | ~52 | Mixto |
| **TOTAL** | **~111** | - |

---

## 1. AUTH_MANAGEMENT (10 triggers)

### Triggers de Inicializacion
| Trigger | Tabla | Evento | Funcion |
|---------|-------|--------|---------|
| trg_set_default_tenant | profiles | BEFORE INSERT | set_default_tenant() |
| trg_initialize_user_stats | profiles | AFTER INSERT | initialize_user_stats() |
| trg_assign_default_classroom | profiles | AFTER INSERT | assign_default_classroom() |
| trg_ensure_profile_name | profiles | BEFORE INSERT/UPDATE | ensure_profile_name() |

### Triggers de Auditoria
| Trigger | Tabla | Evento | Funcion |
|---------|-------|--------|---------|
| trg_audit_profile_changes | profiles | AFTER UPDATE | audit_profile_changes() |

### Triggers de Timestamps
| Trigger | Tabla |
|---------|-------|
| trg_profiles_updated_at | profiles |
| trg_memberships_updated_at | memberships |
| trg_tenants_updated_at | tenants |
| trg_user_roles_updated_at | user_roles |

---

## 2. GAMIFICATION_SYSTEM (12 triggers)

### Triggers de Logros y Recompensas
| Trigger | Tabla | Evento | Funcion |
|---------|-------|--------|---------|
| trg_achievement_unlocked | user_achievements | AFTER INSERT/UPDATE | fn_on_achievement_unlocked() |
| trg_check_rank_promotion_on_xp_gain | user_stats | AFTER UPDATE OF total_xp | trg_check_rank_promotion_fn() |
| trg_recalculate_level_on_xp_change | user_stats | BEFORE UPDATE OF total_xp | recalculate_level_on_xp_change() |

### Triggers de Misiones
| Trigger | Tabla | Evento | Condicion |
|---------|-------|--------|-----------|
| trg_update_missions_on_earn_xp | user_stats | AFTER UPDATE | OLD.total_xp IS DISTINCT FROM NEW.total_xp |
| trg_update_missions_on_use_comodines | comodin_usage_log | AFTER INSERT | - |
| trg_update_missions_on_daily_streak | user_stats | AFTER UPDATE | OLD.current_streak IS DISTINCT FROM NEW.current_streak |

### Triggers de Timestamps
| Trigger | Tabla |
|---------|-------|
| trg_achievements_updated_at | achievements |
| trg_comodines_inventory_updated_at | comodines_inventory |
| missions_updated_at | missions |
| notifications_updated_at | notifications |
| trg_user_ranks_updated_at | user_ranks |
| trg_user_stats_updated_at | user_stats |

---

## 3. PROGRESS_TRACKING (12 triggers)

### Triggers de Estadisticas
| Trigger | Tabla | Evento | Funcion |
|---------|-------|--------|---------|
| trg_update_user_stats_on_exercise | exercise_attempts | AFTER INSERT | update_user_stats_on_exercise_complete() |
| trg_update_user_stats_on_submission | exercise_submissions | AFTER INSERT | update_user_stats_on_submission_graded() |

### Triggers de Progreso de Modulos
| Trigger | Tabla | Evento | Funcion |
|---------|-------|--------|---------|
| trg_update_module_progress_on_exercise | exercise_attempts | AFTER INSERT | update_module_progress_on_exercise_complete() |
| trg_update_module_progress_on_submission | exercise_submissions | AFTER INSERT | update_module_progress_on_submission_graded() |

### Triggers de Misiones
| Trigger | Tabla | Evento |
|---------|-------|--------|
| trg_update_missions_on_exercise | exercise_attempts | AFTER INSERT |
| trg_update_missions_on_submission | exercise_submissions | AFTER INSERT |
| trg_update_missions_on_streak | exercise_submissions | AFTER INSERT |
| trg_update_missions_on_perfect_scores | exercise_attempts | AFTER INSERT |
| trg_update_missions_on_complete_modules | module_progress | AFTER UPDATE |
| trg_update_missions_on_explore_modules | module_progress | AFTER INSERT |

### Triggers de Timestamps
| Trigger | Tabla |
|---------|-------|
| exercise_submissions_updated_at | exercise_submissions |
| trg_module_progress_updated_at | module_progress |

---

## 4. EDUCATIONAL_CONTENT (8 triggers)

| Trigger | Tabla |
|---------|-------|
| trg_exercises_updated_at | exercises |
| trg_modules_updated_at | modules |
| trg_assessment_rubrics_updated_at | assessment_rubrics |
| trg_media_resources_updated_at | media_resources |
| update_taxonomies_updated_at | taxonomies |
| update_assignments_updated_at | assignments |
| update_assignment_submissions_updated_at | assignment_submissions |
| trg_exercise_validation_config_updated_at | exercise_validation_config |

---

## 5. SOCIAL_FEATURES (6 triggers)

| Trigger | Tabla | Tipo |
|---------|-------|------|
| trg_update_classroom_count | classroom_members | Business Logic |
| trg_classroom_members_updated_at | classroom_members | Timestamp |
| trg_classrooms_updated_at | classrooms | Timestamp |
| trg_teams_updated_at | teams | Timestamp |
| trg_schools_updated_at | schools | Timestamp |
| trg_teacher_reports_updated_at | teacher_reports | Timestamp |

---

## 6. SYSTEM_CONFIGURATION (5 triggers)

| Trigger | Tabla |
|---------|-------|
| trg_feature_flags_updated_at | feature_flags |
| trg_system_settings_updated_at | system_settings |
| trg_notification_settings_updated_at | notification_settings |
| update_gamification_parameters_timestamp | gamification_parameters |
| update_api_configuration_updated_at | api_configuration |

---

## 7. OTROS SCHEMAS

### Audit Logging
| Trigger | Tabla |
|---------|-------|
| trg_system_alerts_updated_at | system_alerts |

### Content Management
| Trigger | Tabla |
|---------|-------|
| trg_content_templates_updated_at | content_templates |
| trg_marie_curie_content_updated_at | marie_curie_content |
| trg_media_files_updated_at | media_files |
| update_media_metadata_updated_at | media_metadata |

### Communication
| Trigger | Tabla |
|---------|-------|
| trigger_update_messages_timestamp | messages |

---

## PATRONES DE TRIGGERS

### 1. Timestamp Pattern (~60%)
```sql
CREATE TRIGGER trg_<tabla>_updated_at
BEFORE UPDATE ON <schema>.<tabla>
FOR EACH ROW
EXECUTE FUNCTION gamilit.update_updated_at_column();
```

### 2. Business Logic Pattern
```sql
CREATE TRIGGER trg_<accion>
AFTER INSERT ON <tabla>
FOR EACH ROW
WHEN (condicion)
EXECUTE FUNCTION gamilit.<funcion>();
```

### 3. Initialization Pattern
```sql
CREATE TRIGGER trg_initialize_<recurso>
AFTER INSERT ON <tabla>
FOR EACH ROW
EXECUTE FUNCTION gamilit.initialize_<recurso>();
```

---

## TRIGGERS CRITICOS

### Gamificacion
| Trigger | Importancia | Efecto |
|---------|-------------|--------|
| trg_achievement_unlocked | CRITICO | Otorga XP + ML Coins |
| trg_check_rank_promotion_on_xp_gain | CRITICO | Promociona rangos Maya |
| trg_recalculate_level_on_xp_change | CRITICO | Recalcula nivel |

### Inicializacion de Usuario
| Trigger | Orden | Efecto |
|---------|-------|--------|
| trg_set_default_tenant | 1 | Asigna tenant |
| trg_ensure_profile_name | 2 | Extrae nombre de email |
| trg_initialize_user_stats | 3 | Crea registros gamificacion |
| trg_assign_default_classroom | 4 | Asigna aula default |

### Progreso Academico
| Trigger | Importancia | Efecto |
|---------|-------------|--------|
| trg_update_user_stats_on_exercise | ALTO | Actualiza estadisticas |
| trg_update_module_progress_on_exercise | ALTO | Actualiza % modulo |

---

## UBICACION DE ARCHIVOS

```
apps/database/ddl/schemas/
├── auth_management/triggers/
│   ├── 01-trg_set_default_tenant.sql
│   ├── 02-trg_memberships_updated_at.sql
│   ├── 03-trg_audit_profile_changes.sql
│   ├── 03b-trg_ensure_profile_name.sql
│   ├── 04-trg_initialize_user_stats.sql
│   ├── 05-trg_profiles_updated_at.sql
│   ├── 05-trg_assign_default_classroom.sql
│   ├── 06-trg_tenants_updated_at.sql
│   └── 07-trg_user_roles_updated_at.sql
│
├── gamification_system/triggers/
│   ├── 01-trg_achievement_unlocked.sql
│   ├── 15-trg_achievements_updated_at.sql
│   ├── 16-trg_comodines_inventory_updated_at.sql
│   ├── 17-missions_updated_at.sql
│   ├── 18-notifications_updated_at.sql
│   ├── 19-trg_user_ranks_updated_at.sql
│   ├── 20-trg_user_stats_updated_at.sql
│   ├── 21-trg_recalculate_level_on_xp_change.sql
│   ├── 27-trg_update_missions_on_earn_xp.sql
│   ├── 28-trg_update_missions_on_use_comodines.sql
│   ├── 29-trg_update_missions_on_daily_streak.sql
│   └── trg_check_rank_promotion_on_xp_gain.sql
│
├── progress_tracking/triggers/
│   ├── 21-trg_update_user_stats_on_exercise.sql
│   ├── 22-exercise_submissions_updated_at.sql
│   ├── 22-trg_update_module_progress_on_exercise.sql
│   ├── 23-trg_module_progress_updated_at.sql
│   ├── 24-trg_update_missions_on_exercise.sql
│   ├── 25-trg_update_missions_on_submission.sql
│   ├── 26-trg_update_missions_on_streak.sql
│   ├── 27-trg_update_module_progress_on_submission.sql
│   ├── 28-trg_update_missions_on_perfect_scores.sql
│   ├── 29-trg_update_missions_on_complete_modules.sql
│   ├── 30-trg_update_missions_on_explore_modules.sql
│   └── 31-trg_update_user_stats_on_submission.sql
│
├── educational_content/triggers/
├── social_features/triggers/
├── system_configuration/triggers/
├── audit_logging/triggers/
├── content_management/triggers/
└── communication/triggers/
```

---

**Generado por:** Requirements-Analyst
**Fecha:** 2025-12-23
**Version:** 1.0
