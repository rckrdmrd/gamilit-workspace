# Configuración de Fuentes: Microciclos 6 y 7

**Versión:** 1.0
**Fecha:** 2025-11-02
**Propósito:** Documentar rutas exactas de origen para implementación de objetos P2 (M6) y P3 (M7)

---

## 📁 Rutas Base

### Fuente Principal (Prioridad 1)
```
/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/
```

Esta fuente contiene la estructura completa de la base de datos con todos los objetos organizados por schema y tipo.

### Fuente Alternativa (Prioridad 2)
```
/home/isem/workspace/projects/glit/database/
```

Contiene migraciones y objetos adicionales no presentes en la fuente principal.

### Destino
```
/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/
```

---

## 🎯 Microciclo 6: Objetos P2 (99 objetos)

### 1. FUNCTIONS (57 archivos)

#### gamification_system (20 funciones)
**Ruta origen:** `{FUENTE_PRINCIPAL}/gamification_system/functions/`

**Funciones (parte 1 - SA-DB-024):**
1. `apply_xp_boost.sql`
2. `award_ml_coins.sql`
3. `calculate_level_from_xp.sql`
4. `calculate_user_rank.sql`
5. `check_and_award_achievements.sql`
6. `claim_achievement_reward.sql`
7. `consume_comodin.sql`
8. `get_user_comodines.sql`
9. `get_user_current_rank.sql`
10. `get_user_inventory.sql`

**Funciones (parte 2 - SA-DB-025):**
11. `get_user_inventory_summary.sql`
12. `get_user_rank_progress.sql`
13. `get_user_rank_requirements.sql`
14. `grant_achievement.sql`
15. `process_exercise_completion.sql`
16. `redeem_comodin.sql`
17. `update_leaderboard_coins.sql`
18. `update_leaderboard_global.sql`
19. `update_leaderboard_streaks.sql`
20. `update_user_rank.sql`

**Destino:** `{DESTINO}/gamification_system/functions/`

---

#### gamilit (13 funciones)

**Ruta origen:** `{FUENTE_PRINCIPAL}/gamilit/functions/`

**Funciones (parte 1 - SA-DB-028):**
1. `audit_profile_changes.sql`
2. `get_current_user_id.sql`
3. `get_current_user_role.sql`
4. `handle_new_user.sql`
5. `is_classroom_teacher.sql`
6. `is_student_in_classroom.sql`
7. `log_user_login.sql`

**Funciones (parte 2 - SA-DB-029):**
8. `now_mexico.sql`
9. `set_profile_defaults.sql`
10. `update_classroom_member_count.sql`
11. `update_user_last_login.sql`
12. `validate_email_format.sql`
13. `validate_username.sql`

**Destino:** `{DESTINO}/gamilit/functions/`

---

#### auth_management (6 funciones - SA-DB-032)

**Ruta origen:** `{FUENTE_PRINCIPAL}/auth_management/functions/`

1. `assign_role_to_user.sql`
2. `get_user_role.sql`
3. `hash_token.sql`
4. `remove_role_from_user.sql`
5. `update_user_preferences.sql`
6. `verify_user_permission.sql`

**Destino:** `{DESTINO}/auth_management/functions/`

---

#### progress_tracking (6 funciones - SA-DB-032)

**Ruta origen:** `{FUENTE_PRINCIPAL}/progress_tracking/functions/`

1. `calculate_module_progress.sql`
2. `check_mechanic_completion.sql`
3. `get_classroom_analytics.sql`
4. `get_user_progress.sql`
5. `record_exercise_attempt.sql`
6. `update_mission_progress.sql`

**Destino:** `{DESTINO}/progress_tracking/functions/`

---

#### public (7 funciones - SA-DB-031)

**Ruta origen:** `{FUENTE_PRINCIPAL}/public/functions/`

1. `cleanup_old_system_logs.sql`
2. `cleanup_old_user_activity.sql`
3. `is_feature_enabled.sql`
4. `log_system_event.sql`
5. `send_notification.sql`
6. `update_feature_flag.sql`
7. `validate_date_range.sql`

**Destino:** `{DESTINO}/public/functions/`

---

#### Otros schemas (5 funciones - SA-DB-033)

**audit_logging (1):**
- Origen: `{FUENTE_PRINCIPAL}/audit_logging/functions/`
- Función: `log_audit_event.sql`
- Destino: `{DESTINO}/audit_logging/functions/`

**auth (1):**
- Origen: `{FUENTE_PRINCIPAL}/auth/functions/`
- Función: `get_current_user_id.sql`
- Destino: `{DESTINO}/auth/functions/`

**educational_content (2):**
- Origen: `{FUENTE_PRINCIPAL}/educational_content/functions/`
- Funciones: `calculate_learning_path.sql`, `get_recommended_missions.sql`
- Destino: `{DESTINO}/educational_content/functions/`

**social_features (1):**
- Origen: `{FUENTE_PRINCIPAL}/social_features/functions/`
- Función: `cleanup_old_notifications.sql`
- Destino: `{DESTINO}/social_features/functions/`

---

### 2. VIEWS (12 archivos)

#### gamification_system (4 vistas - SA-DB-027)

**Ruta origen:** `{FUENTE_PRINCIPAL}/gamification_system/views/`

1. `leaderboard_coins.sql`
2. `leaderboard_global.sql`
3. `leaderboard_streaks.sql`
4. `user_inventory_summary.sql`

**Destino:** `{DESTINO}/gamification_system/views/`

---

#### admin_dashboard (4 vistas - SA-DB-033)

**Ruta origen:** `{FUENTE_ALTERNATIVA}/migrations/008_admin_module_tables.sql`

⚠️ **NOTA:** Estas vistas están en un archivo de migración. Extraer CREATE VIEW de:

1. `moderation_queue`
2. `organization_stats_summary`
3. `recent_admin_actions`
4. `user_stats_summary`

**Destino:** `{DESTINO}/admin_dashboard/views/` (crear schema si no existe)

---

#### public (3 vistas - SA-DB-031)

**Ruta origen:** `{FUENTE_PRINCIPAL}/public/views/`

1. `assignment_submission_stats.sql`
2. `classroom_overview.sql`
3. `for.sql` ⚠️ (verificar nombre - posible error)

**Destino:** `{DESTINO}/public/views/`

---

#### progress_tracking (1 vista - SA-DB-033)

**Ruta origen:** `{FUENTE_PRINCIPAL}/progress_tracking/views/`

1. `user_progress_summary.sql`

**Destino:** `{DESTINO}/progress_tracking/views/`

---

### 3. MATERIALIZED VIEWS (10 archivos - SA-DB-026)

#### gamification_system (10 MVIEWs)

**Ruta origen:** `{FUENTE_PRINCIPAL}/gamification_system/materialized-views/`

⚠️ **IMPORTANTE:** Listar archivos reales en la carpeta. Los nombres del plan pueden ser incorrectos:
- `99-refresh-schedule` (verificar - posible script de utilidad)
- `CREATE` (verificar - palabra reservada)
- `check-mv-freshness` (verificar - posible script)

**MVIEWs confirmadas:**
4. `leaderboard_coins_mv.sql`
5. `leaderboard_global_mv.sql`
6. `leaderboard_streaks_mv.sql`
7. `user_inventory_summary_mv.sql`
8. `user_rank_progress_mv.sql`
9. `user_stats_summary_mv.sql`
10. `achievement_completion_stats_mv.sql`

**Instrucción:** Listar archivos y solo copiar los que contengan `CREATE MATERIALIZED VIEW`.

**Destino:** `{DESTINO}/gamification_system/materialized-views/`

---

### 4. TYPES (20 archivos - SA-DB-030)

#### public (20 tipos compuestos)

**Ruta origen:** `{FUENTE_PRINCIPAL}/public/types/` (si existe)

⚠️ **VERIFICACIÓN CRÍTICA:** El plan indica 20 TYPEs en public, pero varios nombres coinciden con ENUMs ya implementados en M4 (P0). DEBE verificarse si son:
- **Composite TYPEs** (CREATE TYPE ... AS (campo1, campo2)) → implementar
- **ENUMs** (CREATE TYPE ... AS ENUM (...)) → ya implementados en P0, NO duplicar

**Nombres listados (VERIFICAR):**
1. `achievement_category`
2. `achievement_type`
3. `alert_severity`
4. `attempt_result`
5. `classroom_role`
6. `content_status`
7. `content_type`
8. `difficulty_level`
9. `exercise_type`
10. `gamilit_role`
11. `maya_rank`
12. `media_type`
13. `metric_type`
14. `module_status`
15. `notification_channel`
16. `notification_type`
17. `processing_status`
18. `progress_status`
19. `social_event_type`
20. `transaction_type`

**Acción SA-DB-030:**
1. Verificar en fuente si existe carpeta `public/types/`
2. Si no existe, buscar en `public/` archivos con CREATE TYPE
3. Filtrar solo composite types (no ENUMs)
4. Si todos son ENUMs, reportar que ya fueron implementados en M4

**Destino:** `{DESTINO}/public/types/` (solo si hay TYPEs compuestos)

---

## 🎯 Microciclo 7: Objetos P3 (92 objetos)

### 1. TRIGGERS (72 archivos)

#### public (41 triggers - SA-DB-034 a SA-DB-037)

**Ruta origen:** `{FUENTE_PRINCIPAL}/public/triggers/`

**División:**
- SA-DB-034: Triggers 1-11 (alfabético a-c)
- SA-DB-035: Triggers 12-22 (alfabético d-m)
- SA-DB-036: Triggers 23-33 (alfabético n-t)
- SA-DB-037: Triggers 34-41 (alfabético u-z)

**Destino:** `{DESTINO}/public/triggers/`

---

#### gamification_system (7 triggers)

**Ruta origen:** `{FUENTE_PRINCIPAL}/gamification_system/triggers/`

**Destino:** `{DESTINO}/gamification_system/triggers/`

---

#### Otros schemas (24 triggers)

**Schemas con triggers:**
- `auth_management/triggers/` - 6 triggers
- `social_features/triggers/` - 5 triggers
- `educational_content/triggers/` - 4 triggers
- `progress_tracking/triggers/` - 3 triggers
- `content_management/triggers/` - 3 triggers
- `system_configuration/triggers/` - 2 triggers
- `audit_logging/triggers/` - 1 trigger

**Origen:** `{FUENTE_PRINCIPAL}/{schema}/triggers/`
**Destino:** `{DESTINO}/{schema}/triggers/`

---

### 2. RLS POLICIES (20 archivos)

#### gamification_system (6 policies)

**Ruta origen:** `{FUENTE_PRINCIPAL}/gamification_system/rls-policies/`

**Destino:** `{DESTINO}/gamification_system/rls-policies/`

---

#### social_features (6 policies)

**Ruta origen:** `{FUENTE_PRINCIPAL}/social_features/rls-policies/`

**Destino:** `{DESTINO}/social_features/rls-policies/`

---

#### Otros schemas (8 policies)

**Schemas con RLS:**
- `educational_content/rls-policies/` - 2 policies
- `progress_tracking/rls-policies/` - 2 policies
- `auth_management/rls-policies/` - 1 policy
- `content_management/rls-policies/` - 1 policy
- `system_configuration/rls-policies/` - 1 policy
- `audit_logging/rls-policies/` - 1 policy

**Origen:** `{FUENTE_PRINCIPAL}/{schema}/rls-policies/`
**Destino:** `{DESTINO}/{schema}/rls-policies/`

---

## ⚠️ Notas Importantes para Subagentes

### Prioridades de Implementación M6:
1. **PRIMERO:** Types (dependencias)
2. **SEGUNDO:** Functions (incluyendo funciones de triggers: `update_updated_at_column`, etc.)
3. **TERCERO:** Views
4. **CUARTO:** Materialized Views

### Prioridades de Implementación M7:
1. **PRIMERO:** Funciones de trigger (si no se implementaron en M6)
2. **SEGUNDO:** Triggers
3. **TERCERO:** RLS Policies

### Validaciones Requeridas:
- ✅ Sintaxis SQL correcta
- ✅ Dependencias de tablas resueltas
- ✅ Dependencias de funciones resueltas (para triggers)
- ✅ No duplicar objetos ya implementados en M4/M5
- ✅ Crear carpetas destino si no existen
- ✅ Generar `_MAP.md` en cada carpeta

### Estructura de Archivos SQL:
Cada archivo debe incluir:
```sql
-- Nombre: {nombre_objeto}
-- Descripción: {descripción_breve}
-- Schema: {schema_name}
-- Tipo: {FUNCTION|VIEW|MATERIALIZED VIEW|TYPE|TRIGGER|POLICY}
-- Dependencias: {lista_de_dependencias}

CREATE OR REPLACE {tipo} {schema}.{nombre} ...
```

---

**Creado por:** ATLAS-DATABASE
**Para:** Subagentes SA-DB-024 a SA-DB-041
**Estado:** ✅ Listo para uso en reinicio de sesión
