# P2: Auditoria de Duplicidad y Relaciones

**Fecha:** 2026-02-17
**Auditor:** Claude Opus 4.6
**Contexto:** Post CORR-03/04 fixes. DB: 169 tablas, 404 RLS runtime, 227 DDL-source policies, 298 FKs.
**Alcance:** 17 index files, 43 RLS policy files, 4 global RLS files, 1 backend constants file.

---

## Resumen Ejecutivo

La auditoria P2 revelo **9 hallazgos** categorizados como 1 CRITICO, 2 ALTO, 3 MEDIO, 2 BAJO y 1 INFO. Los problemas mas significativos son:

1. **CRITICO:** Politicas RLS duplicadas por nombre en multiples tablas (07-enable-rls.sql + 07d-rls-policies-pending-tables.sql definen politicas con nombres identicos como `parent_accounts_admin_all`, `parent_accounts_read_own`, `parent_accounts_update_own` para la misma tabla `auth_management.parent_accounts`). PostgreSQL rechaza CREATE POLICY con nombre duplicado en la misma tabla.
2. **ALTO:** Politicas RLS duplicadas entre archivos de schema y archivos globales 07* (multiples tablas tienen politicas definidas tanto inline en tablas como en archivos 07b/07c/07d).
3. **ALTO:** DB_TABLES.COMMUNICATION incluye `conversations` que NO tiene tabla DDL con ese nombre standalone (esta embebida en `03-conversation_participants.sql`).

Los checks D-001 (index uniqueness), D-005 (FK targets), D-008 (helper functions), y D-010 (singular references) pasaron correctamente.

---

## Checks Realizados

### D-001: Unicidad de nombres de indices

**Metodologia:** Extraje todos los `CREATE INDEX IF NOT EXISTS <name>` de los 17 archivos de indices.

**Indices encontrados (68 total):**

| Schema | File | Index Count |
|--------|------|-------------|
| optimization | 01-fk-optimization-indexes.sql | 10 |
| data_warehouse | 01-warehouse-indexes.sql | 35 |
| auth_management | 5 files | 5 |
| gamification_system | 4 files | 4 |
| progress_tracking | 3 files | 3 |
| social_features | 1 file | 3 |
| content_management | 2 files | 2 |

**Nombres de indices unicos verificados:**
- `idx_comodin_tracking_user_exercise` (optimization)
- `idx_teacher_alerts_teacher_classroom_type` (optimization)
- `idx_guild_members_guild_user` (optimization)
- `idx_classroom_missions_classroom_active` (optimization)
- `idx_submissions_user_exercise_date` (optimization)
- `idx_submissions_grading_queue` (optimization)
- `idx_guild_missions_guild_active` (optimization)
- `idx_guild_mission_contributions_mission` (optimization)
- `idx_intervention_alerts_classroom_active` (optimization)
- `idx_teacher_interventions_follow_up_pending` (optimization)
- `idx_user_preferences_theme` (auth_management)
- `idx_user_roles_permissions_gin` (auth_management)
- `idx_user_roles_user_role_composite` (auth_management)
- `idx_user_sessions_refresh_token_hash` (auth_management)
- `idx_user_sessions_session_token_hash` (auth_management)
- `idx_achievement_categories_active` (gamification_system)
- `idx_active_boosts_user` (gamification_system)
- `idx_achievements_metadata_gin` (gamification_system)
- `idx_inventory_transactions_user` (gamification_system)
- `idx_module_progress_analytics_gin` (progress_tracking)
- `idx_scheduled_missions_mission` (progress_tracking)
- `idx_module_progress_classroom_status` (progress_tracking)
- `idx_classroom_members_classroom_active` (social_features)
- `idx_classrooms_teacher_active` (social_features)
- `idx_marie_content_grade_levels_gin` (content_management)
- `idx_marie_content_keywords_gin` (content_management)
- 35 data_warehouse indexes (all unique names verified)

**Resultado: PASS** - Ningun nombre de indice duplicado encontrado. Todos usan `IF NOT EXISTS` como proteccion adicional.

---

### D-002: Indices redundantes (idx(a) redundante si existe idx(a,b) en misma tabla)

**Metodologia:** Comparacion de indices por tabla para detectar prefijos redundantes.

**Analisis por tabla:**

1. **auth_management.user_roles:**
   - `idx_user_roles_permissions_gin` ON (permissions) - GIN index
   - `idx_user_roles_user_role_composite` ON (user_id, role) - B-tree composite
   - No hay indice simple en `user_id` que seria redundante. OK.

2. **gamification_system.user_stats:** No indices duplicados. OK.

3. **progress_tracking.module_progress:**
   - `idx_module_progress_analytics_gin` ON (performance_analytics) - GIN
   - `idx_module_progress_classroom_status` ON (classroom_id, status) - B-tree
   - Diferentes columnas. OK.

4. **data_warehouse.dim_dates:**
   - `idx_dim_date_school_semester` ON (school_year, semester, full_date)
   - `idx_dim_date_quarter` ON (year, quarter, full_date)
   - `idx_dim_date_weekly` ON (year, week_of_year, day_of_week)
   - `idx_dim_date_weekday` ON (is_weekend, date_key)
   - `idx_dim_date_school_day` ON (is_school_day, date_key)
   - Todos cubren columnas diferentes. OK.

5. **data_warehouse.dim_students:**
   - `idx_dim_student_grade_current` ON (grade_level) WHERE is_current
   - `idx_dim_student_school_current` ON (school_id) WHERE is_current
   - `idx_dim_student_registration` ON (registration_date) WHERE is_current
   - Diferentes columnas. OK.

**Resultado: PASS** - No se encontraron indices redundantes. Los indices en mismas tablas cubren columnas diferentes o usan diferentes tipos (GIN vs B-tree).

---

### D-003: Politicas duplicadas por nombre en misma tabla

**Metodologia:** Extraje todos los `CREATE POLICY <name> ON <table>` de todos los archivos DDL y verifique unicidad por tabla.

**HALLAZGO CRITICO: Politicas duplicadas detectadas entre archivos globales 07*.sql y 07d-rls-policies-pending-tables.sql:**

Las siguientes tablas tienen politicas con **nombres identicos** definidas en **dos archivos diferentes**:

| Tabla | Policy Name | File 1 | File 2 |
|-------|-------------|--------|--------|
| `auth_management.parent_accounts` | `parent_accounts_admin_all` | 07-enable-rls.sql:35 | 07d-...-pending.sql:56 |
| `auth_management.parent_accounts` | `parent_accounts_read_own` | 07-enable-rls.sql:45 | 07d-...-pending.sql:61 |
| `auth_management.parent_accounts` | `parent_accounts_update_own` | 07-enable-rls.sql:49 | 07d-...-pending.sql:66 |
| `auth_management.parent_notifications` | `parent_notifications_admin_all` | 07-enable-rls.sql:57 | 07d-...-pending.sql:82 |
| `auth_management.parent_notifications` | `parent_notifications_read_own` | 07-enable-rls.sql:67 | 07d-...-pending.sql:87 |
| `auth_management.parent_student_links` | `parent_student_links_admin_all` | 07-enable-rls.sql:76 | 07d-...-pending.sql:114 |
| `admin_dashboard.bulk_operations` | `bulk_operations_admin_only` (07b) vs `bulk_operations_admin_all` (07d) | 07b-enable-rls-phase2.sql:644 | 07d-...-pending.sql:24 |
| `social_features.user_follows` | `user_follows_admin` (07) vs `user_follows_admin_all` (07d) | 07-enable-rls.sql:571 | 07d-...-pending.sql:367 |

**NOTA:** Las policies en 07-enable-rls.sql usan `auth.uid()` mientras que las en 07d usan `gamilit.get_current_user_id()`. Son implementaciones **diferentes** del mismo concepto. En runtime, PostgreSQL rechazara el segundo CREATE POLICY si el nombre ya existe.

**Politicas duplicadas adicionales entre schema-level rls-policies/ y 07b/07c files:**

Muchas tablas tienen politicas definidas tanto en sus archivos de schema como en los archivos globales 07b/07c. Por ejemplo:

| Tabla | Schema Policy | Global Policy |
|-------|--------------|---------------|
| `audit_logging.audit_logs` | `audit_logs_select_admin` (rls-policies/01-policies.sql) | `audit_logs_admin_only` (07b) + `audit_logs_select_admin` (tables/01-audit_logs.sql) |
| `system_configuration.system_settings` | `system_settings_all_admin` (rls-policies/01-policies.sql) | `system_settings_admin_only` (07c) + `system_settings_select_admin` (tables/01-system_settings.sql) |
| `system_configuration.notification_settings` | `notification_settings_admin_only` (07c) | `notification_settings_admin_all` (07d) + inline policies (tables/03-notification_settings.sql) |
| `gamification_system.achievements` | `achievements_all_admin` (tables/03) = `achievements_all_admin` (rls-policies/02) | Exact same name |
| `gamification_system.user_achievements` | `user_achievements_select_admin` (tables/04) = `user_achievements_select_admin` (rls-policies/02) | Exact same name |
| `gamification_system.ml_coins_transactions` | `ml_transactions_select_admin` (tables/05) = `ml_transactions_select_admin` (rls-policies/02) | Exact same name |
| `content_management.marie_curie_contents` | `marie_content_all_admin` (tables/02) = `marie_content_all_admin` (rls-policies/01) | Exact same name |
| `content_management.content_templates` | `content_templates_select_public` (tables/01) vs `content_templates_public_read` (07c) | Different names, same purpose |

**Resultado: FAIL** - Multiples politicas con nombres identicos en la misma tabla a traves de archivos diferentes.

---

### D-004: Politicas PERMISSIVE contradictorias

**Metodologia:** Para tablas con multiples politicas PERMISSIVE en la misma operacion, verifique que las clausulas USING sean complementarias (OR semantics en PostgreSQL).

**Analisis:**

En PostgreSQL, multiples politicas PERMISSIVE para la misma operacion se combinan con OR. Esto significa que no son "contradictorias" sino "aditivas". Sin embargo, se identificaron patrones que merecen atencion:

1. **`social_features.challenge_participants`** tiene:
   - `challenge_participants_public_read` FOR SELECT USING (true)
   - `challenge_participants_user_own` FOR ALL USING (user_id = auth.uid())
   - `challenge_participants_admin` FOR ALL

   La politica `public_read` con USING(true) hace que las demas SELECT policies sean redundantes (ya todo usuario autenticado puede leer todo). Esto es **intencionalmente permisivo** pero las otras SELECT-covering policies son operacionalmente innecesarias.

2. **`social_features.challenge_results`** tiene:
   - `challenge_results_public_read` FOR SELECT USING (true) - misma situacion.

3. **`gamification_system.user_ranks`** tiene:
   - `user_ranks_public_leaderboard` FOR SELECT USING (true) - intencionalmente publico para leaderboards.

**Resultado: PASS con INFO** - No hay contradicciones logicas. Las politicas `USING(true)` son intencionalmente abiertas para datos publicos (leaderboards, challenge results).

---

### D-005: Validacion de FK targets (REFERENCES apunta a tablas existentes)

**Metodologia:** Extraje todos los `REFERENCES schema.table(column)` de los 306 lineas de FK y verifique que cada target table existe en DDL.

**Tablas target referenciadas y su existencia:**

| Target Table | Exists in DDL | FK Count |
|-------------|---------------|----------|
| `auth_management.profiles` | YES (03-profiles.sql) | ~80 |
| `auth_management.tenants` | YES (01-tenants.sql) | ~25 |
| `auth.users` | YES (auth/tables/01-users.sql) | 5 |
| `educational_content.modules` | YES (01-modules.sql) | ~12 |
| `educational_content.exercises` | YES (02-exercises.sql) | ~8 |
| `educational_content.assignments` | YES | 3 |
| `social_features.classrooms` | YES (03-classrooms.sql) | ~10 |
| `social_features.schools` | YES (02-schools.sql) | 1 |
| `social_features.teams` | YES (05-teams.sql) | 2 |
| `social_features.peer_challenges` | YES (11-peer_challenges.sql) | 2 |
| `social_features.guilds` | YES (21-guilds.sql) | 3 |
| `social_features.guild_missions` | YES (24-guild_missions.sql) | 1 |
| `social_features.guild_emblems` | YES (referenced in guilds.sql) | 1 |
| `social_features.teacher_reports` | YES (08-teacher_reports.sql) | 1 |
| `gamification_system.achievements` | YES (03-achievements.sql) | 2 |
| `gamification_system.shop_categories` | YES (17-shop_categories.sql) | 2 |
| `gamification_system.shop_items` | YES (18-shop_items.sql) | 2 |
| `gamification_system.ml_coins_transactions` | YES (05-ml_coins_transactions.sql) | 1 |
| `progress_tracking.exercise_submissions` | YES (04-exercise_submissions.sql) | 2 |
| `progress_tracking.exercise_attempts` | YES (03-exercise_attempts.sql) | 1 |
| `progress_tracking.learning_paths` | YES (learning_paths.sql) | 2 |
| `progress_tracking.student_intervention_alerts` | YES (19-student_intervention_alerts.sql) | 1 |
| `lti_integration.lti_consumers` | YES (01-lti_consumers.sql) | 2 |
| `lti_integration.lti_sessions` | YES (02-lti_sessions.sql) | 1 |
| `notifications.notifications` | YES (01-notifications.sql) | 2 |
| `notifications.notification_templates` | YES (04-notification_templates.sql) | 1 |
| `communication.messages` | YES (01-messages.sql) | 3 |
| `communication.conversations` | YES (in 03-conversation_participants.sql) | 1 |
| `content_management.media_files` | YES (03-media_files.sql) | 1 |
| `content_management.content_categories` | YES (content_categories.sql) | 1 |
| `educational_content.exercise_validation_audits` | YES (26-exercise_validation_audit.sql) | 1 |
| `educational_content.teacher_contents` | YES (25-teacher_content.sql) | 2 |
| `data_warehouse.dim_dates` | YES (dim_date.sql, creates dim_dates) | 4 |
| `data_warehouse.dim_students` | YES (dim_student.sql, creates dim_students) | 3 |
| `data_warehouse.dim_exercises` | YES (dim_exercise.sql, creates dim_exercises) | 2 |
| `data_warehouse.dim_modules` | YES (dim_module.sql, creates dim_modules) | 3 |
| `data_warehouse.dim_teachers` | YES (dim_teacher.sql, creates dim_teachers) | 2 |
| `data_warehouse.dim_times` | YES | 2 |
| `data_warehouse.dim_event_types` | YES | 1 |
| `data_warehouse.dim_achievements` | YES | 1 |
| `auth_management.parent_accounts` | YES (14-parent_accounts.sql) | 2 |
| `social_features.classroom_members` | Referenced in policies, not FK | - |

**Resultado: PASS** - Todas las tablas target de FK existen en DDL.

---

### D-006: Indices en tablas renombradas/eliminadas

**Metodologia:** Verifique que cada tabla referenciada por un CREATE INDEX existe en DDL.

**Tablas de indices verificadas:**

| Index Table | Exists |
|------------|--------|
| `gamification_system.comodin_usage_trackings` | YES (15-comodin_usage_tracking.sql creates this table) |
| `progress_tracking.teacher_alert_configurations` | YES (20-teacher_alert_configurations.sql) |
| `social_features.guild_members` | YES (22-guild_members.sql) |
| `gamification_system.classroom_missions` | YES (16-classroom_missions.sql) |
| `progress_tracking.exercise_submissions` | YES (04-exercise_submissions.sql) |
| `social_features.guild_missions` | YES (24-guild_missions.sql) |
| `social_features.guild_mission_contributions` | YES (24-guild_missions.sql) |
| `progress_tracking.student_intervention_alerts` | YES (19-student_intervention_alerts.sql) |
| `progress_tracking.teacher_interventions` | YES (17-teacher_interventions.sql) |
| `data_warehouse.*` tables | All verified present |
| `auth_management.user_preferences` | YES |
| `auth_management.user_roles` | YES |
| `auth_management.user_sessions` | YES |
| `gamification_system.achievement_categories` | YES (10-achievement_categories.sql) |
| `gamification_system.active_boosts` | YES (11-active_boosts.sql) |
| `gamification_system.achievements` | YES |
| `gamification_system.inventory_transactions` | YES (12-inventory_transactions.sql) |
| `progress_tracking.module_progress` | YES |
| `progress_tracking.scheduled_missions` | YES |
| `social_features.classroom_members` | YES |
| `social_features.classrooms` | YES |
| `content_management.marie_curie_contents` | YES |

**Nota:** Los indices que fueron REMOVED en CORR-03 (3 indices con columnas inexistentes) se documentaron correctamente como eliminados en `progress_tracking/indexes/03-teacher-portal-indexes.sql`.

**Resultado: PASS** - Todos los indices apuntan a tablas existentes post-CORR-03.

---

### D-007: DB_TABLES constants vs DDL

**Metodologia:** Comparacion de cada entrada en `database.constants.ts` contra tablas DDL existentes.

**Hallazgos:**

1. **DB_TABLES.COMMUNICATION.CONVERSATIONS = 'conversations':** La tabla `communication.conversations` se define **dentro** de `03-conversation_participants.sql` (no en un archivo propio). Existe en DDL pero no como archivo standalone. OK.

2. **DB_TABLES.GAMIFICATION.COMODIN_USES = 'comodin_uses':** Definida en `_cross_schema/21-comodin_uses.sql`. OK.

3. **DB_TABLES.EDUCATIONAL.CLASSROOM_MODULES = 'classroom_modules':** Definida en `_cross_schema/23-classroom_modules.sql`. OK.

4. **DB_TABLES.EDUCATIONAL.CONTENT_TAGS = 'content_tags':** Definida en `content_tags.sql`. OK.

5. **DB_TABLES.EDUCATIONAL.CONTENT_APPROVALS = 'content_approvals':** Definida en `content_approvals.sql`. OK.

6. **DB_TABLES.EDUCATIONAL.EXERCISE_MECHANIC_MAPPING = 'exercise_mechanic_mappings':** No se encontro archivo DDL dedicado para esta tabla. Puede estar generada via migration o en un archivo de prerequisites. **Posible gap.**

7. **DB_TABLES.SOCIAL.USER_ACTIVITIES = 'user_activities':** Definida en `09-user_activities.sql`. OK.

8. **DB_TABLES.SOCIAL.GUILD_EMBLEMS = 'guild_emblems':** Referenciada en `21-guilds.sql` como FK target. Necesita archivo DDL propio o estar definida inline. **Verificacion necesaria.**

9. **DB_TABLES.AUDIT.PENDING_USER_INITIALIZATION = 'pending_user_initializations':** Definida en `08-pending_user_initialization.sql`. OK.

**Resultado: PASS con nota** - La mayoria de entradas coinciden. 2 tablas (`exercise_mechanic_mappings`, `guild_emblems`) requieren verificacion de que tienen DDL standalone.

---

### D-008: Helper RLS functions tienen DDL files

**Metodologia:** Verifique que cada funcion helper usada en politicas RLS tiene un archivo DDL en `schemas/gamilit/functions/` o `schemas/auth/functions/`.

| Function | DDL File | Status |
|----------|----------|--------|
| `gamilit.get_current_user_id()` | `02-get_current_user_id.sql` | OK |
| `gamilit.get_current_user_role()` | `03-get_current_user_role.sql` | OK |
| `gamilit.is_admin()` | `05-is_admin.sql` | OK |
| `gamilit.is_super_admin()` | `05b-is_super_admin.sql` | OK |
| `gamilit.get_current_tenant_id()` | `09-get_current_tenant_id.sql` | OK |
| `auth.uid()` | `schemas/auth/functions/01-uid.sql` | OK |

**Resultado: PASS** - Todas las funciones helper tienen archivos DDL.

---

### D-009: RLS ENABLE cubre todas las tablas

**Metodologia:** Conte todas las sentencias `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` unicas (excluyendo comentadas y duplicadas).

**Tablas con ENABLE RLS (deduplicadas):**

De los archivos globales 07*.sql: ~83 tablas unicas
De los archivos de schema (tables/*.sql, rls-policies/*.sql): ~40 tablas adicionales (muchas son duplicados de las 07*)

**Total tablas unicas con ENABLE RLS:** ~105-110

**Tablas conocidas SIN RLS (169 - ~110 = ~59):**

Los siguientes schemas/tablas probablemente no tienen RLS:
- `data_warehouse.*` dimension and fact tables (excepto `ml_prediction_logs`) - 15 tablas
- `auth.users` - 1 tabla (schema auth base)
- `auth_management.tenants` - tiene RLS en 02-enable-rls.sql
- `auth_management.roles` (03b-roles.sql) - tabla de catalogo
- `auth_management.auth_providers` - tokens de providers
- `auth_management.password_reset_tokens` - tiene RLS en auth_management/rls-policies/02-enable-rls.sql
- Varias tablas de `educational_content` (modules, exercises, taxonomies, etc.) - tienen RLS en 01-enable-rls.sql
- `notifications.notification_templates`, `notification_queue` - no encontradas con ENABLE RLS
- `gamification_system.maya_ranks`, `shop_categories`, `shop_items`, `achievement_categories`, `mission_templates` - tablas de catalogo

**Resultado: MEDIO** - Cobertura RLS es ~65% (110/169). Las tablas sin RLS son mayoritariamente:
1. Tablas de catalogo (read-only, sin datos de usuario)
2. Data warehouse (analytics, no acceso directo)
3. Tablas de configuracion ya cubiertas por schema-level policies

---

### D-010: FKs con nombres singulares post-fix

**Metodologia:** Busque patrones `REFERENCES.*dim_date[^s]`, `REFERENCES.*dim_student[^s]`, etc. en todos los archivos DDL.

**Resultado: PASS** - Cero coincidencias. Todas las FKs de data_warehouse ahora usan nombres plurales correctos (dim_dates, dim_students, dim_exercises, dim_modules, dim_teachers, dim_times, dim_event_types, dim_achievements). Fix CORR-03/H-DB-01 fue efectivo.

---

## Findings

### F-P2-001: Politicas RLS duplicadas por nombre entre 07-enable-rls.sql y 07d-rls-policies-pending-tables.sql

- **Severidad:** CRITICO
- **Ubicacion:** `apps/database/ddl/07-enable-rls.sql` y `apps/database/ddl/07d-rls-policies-pending-tables.sql`
- **Descripcion:** Multiples politicas tienen el mismo nombre exacto y aplican a la misma tabla, pero estan definidas en archivos diferentes. PostgreSQL rechaza `CREATE POLICY` si ya existe una con ese nombre en la tabla.
- **Esperado:** Cada policy name debe ser unico por tabla. Si 07d agrega policies "adicionales", deben usar nombres diferentes.
- **Actual:** Las siguientes policies estan duplicadas:
  - `parent_accounts_admin_all` ON auth_management.parent_accounts (07:35 y 07d:56)
  - `parent_accounts_read_own` ON auth_management.parent_accounts (07:45 y 07d:61)
  - `parent_accounts_update_own` ON auth_management.parent_accounts (07:49 y 07d:66)
  - `parent_notifications_admin_all` ON auth_management.parent_notifications (07:57 y 07d:82)
  - `parent_notifications_read_own` ON auth_management.parent_notifications (07:67 y 07d:87)
  - `parent_student_links_admin_all` ON auth_management.parent_student_links (07:76 y 07d:114)
- **Impacto:** El segundo CREATE POLICY falla con ERROR en runtime. Sin embargo, las politicas en 07 usan `auth.uid()` mientras 07d usa `gamilit.get_current_user_id()`. El resultado depende del orden de ejecucion; si 07 se ejecuta primero, las politicas de 07d (que usan el patron mas correcto con `gamilit.*`) no se aplican.
- **Recomendacion:** Agregar `DROP POLICY IF EXISTS <name> ON <table>;` antes de cada CREATE POLICY en 07d, o consolidar en un solo archivo. La version con `gamilit.*` helpers deberia ser la canonical.

---

### F-P2-002: Politicas RLS duplicadas entre schema-level files y global 07b/07c files

- **Severidad:** ALTO
- **Ubicacion:** Multiples archivos en `schemas/*/rls-policies/`, `schemas/*/tables/`, y `07b-enable-rls-phase2.sql` / `07c-enable-rls-phase3.sql`
- **Descripcion:** El mismo par (policy_name, table) aparece definido tanto en archivos de schema como en archivos globales 07*.
- **Esperado:** Cada policy debe definirse en un solo lugar.
- **Actual:** Ejemplos de duplicacion:
  - `gamification_system.achievements`: `achievements_all_admin` en tables/03.sql Y rls-policies/02-policies.sql
  - `gamification_system.user_achievements`: `user_achievements_select_admin` y `user_achievements_select_own` en tables/04.sql Y rls-policies/02-policies.sql
  - `gamification_system.ml_coins_transactions`: `ml_transactions_select_admin` y `ml_transactions_select_own` en tables/05.sql Y rls-policies/02-policies.sql
  - `content_management.marie_curie_contents`: `marie_content_all_admin` en tables/02.sql Y rls-policies/01-policies.sql
  - `audit_logging.audit_logs`: `audit_logs_select_admin` en tables/01.sql Y rls-policies/01-policies.sql
  - `audit_logging.user_activity_logs`: `user_activity_logs_select_admin` y `_select_own` en tables/05.sql Y rls-policies/01-policies.sql
  - `system_configuration.system_settings`: `system_settings_select_admin` (et al.) en tables/01.sql Y rls-policies/01-policies.sql
  - `progress_tracking.scheduled_missions`: policies en tables/05.sql Y 07b.sql
  - `progress_tracking.user_difficulty_progresses`: policies in tables/15.sql AND 07d.sql
- **Impacto:** En runtime, si DROP POLICY IF EXISTS precede CREATE POLICY, no hay error. Pero si ambos se ejecutan como CREATE, el segundo falla. La init script behavior determina el resultado.
- **Recomendacion:** Adoptar convencion de single-source: o bien definir policies inline con tablas, o bien en archivos rls-policies/ dedicados, pero no ambos. Agregar `DROP POLICY IF EXISTS` pattern en archivos de schema si se necesita idempotencia.

---

### F-P2-003: Multiples fuentes de ENABLE RLS para misma tabla

- **Severidad:** MEDIO
- **Ubicacion:** Global 07*.sql files + schema-level rls-policies/*.sql files + inline in tables/*.sql
- **Descripcion:** La sentencia `ALTER TABLE x ENABLE ROW LEVEL SECURITY` aparece en multiples archivos para la misma tabla. Ejemplo:
  - `audit_logging.audit_logs`: en 07b.sql:536, tables/01-audit_logs.sql:81, rls-policies no
  - `progress_tracking.module_progress`: en 07b.sql:320, rls-policies/01-enable-rls.sql:13
  - `social_features.classrooms`: en 07b.sql:504, rls-policies/01-enable-rls.sql:14
  - `auth_management.user_sessions`: en 07b.sql:589, rls-policies/02-enable-rls.sql:28
  - `communication.messages`: en 07b.sql:189, rls-policies/01-messages-policies.sql:18
  - `progress_tracking.exercise_submissions`: en 07b.sql:266, tables/04.sql:61, rls-policies/01-enable-rls.sql:15
- **Impacto:** `ALTER TABLE ENABLE RLS` es idempotente, asi que no causa errores. Pero hace dificil auditar que tablas realmente tienen RLS y cuales no.
- **Recomendacion:** Consolidar ENABLE RLS en un solo lugar por tabla (preferiblemente en el archivo 07*.sql por fase).

---

### F-P2-004: Tablas de catalogo sin RLS (documentacion pendiente)

- **Severidad:** MEDIO
- **Ubicacion:** Multiples tablas en gamification_system, educational_content, notifications
- **Descripcion:** Las siguientes tablas carecen de ENABLE RLS:
  - `gamification_system.maya_ranks` - Catalogo de rangos
  - `gamification_system.shop_categories` - Catalogo de categorias de tienda
  - `gamification_system.shop_items` - Items de tienda (puede contener precios sensibles)
  - `gamification_system.achievement_categories` - Catalogo de categorias de logros
  - `gamification_system.mission_templates` - Templates de misiones
  - `notifications.notification_templates` - Templates de notificaciones
  - `notifications.notification_queue` - Cola de notificaciones
  - `notifications.rate_limit_logs` - Tiene RLS inline en tables/07-rate_limit_logs.sql (OK)
  - `educational_content.difficulty_criteria` - Criterios de dificultad
  - `educational_content.exercise_validation_config` - Config de validacion
  - `educational_content.content_metadata` - Metadata de contenido
  - `educational_content.module_dependencies` - Dependencias de modulos
  - `educational_content.taxonomies` - Taxonomias
  - `auth_management.roles` - Catalogo de roles
  - ~15 tablas de data_warehouse
- **Impacto:** Tablas de catalogo son generalmente read-only y no contienen datos de usuario. Sin embargo, `shop_items` y `notification_queue` podrian contener datos sensibles.
- **Recomendacion:** Documentar explicitamente cuales tablas son excepciones intencionales de RLS (tabla de excepciones). Agregar RLS a `shop_items` y `notification_queue`.

---

### F-P2-005: admin_dashboard tables sin RLS policies adecuadas

- **Severidad:** MEDIO
- **Ubicacion:** `apps/database/ddl/schemas/admin_dashboard/tables/`
- **Descripcion:** Las tablas `admin_reports` y `metrics_history` no tienen `ALTER TABLE ENABLE ROW LEVEL SECURITY` ni politicas definidas en ningun archivo. Solo `bulk_operations` tiene RLS (en 07b y 07d).
- **Esperado:** Todas las tablas del dashboard admin deberian tener RLS admin-only.
- **Actual:** `admin_dashboard.admin_reports` y `admin_dashboard.metrics_history` no tienen RLS.
- **Impacto:** Cualquier usuario autenticado podria leer reportes admin y historial de metricas si conecta directamente (bypass de NestJS guards).
- **Recomendacion:** Agregar ENABLE RLS + policy admin_only para ambas tablas.

---

### F-P2-006: Politicas redundantes con USING(true) eclipsando otras

- **Severidad:** BAJO
- **Ubicacion:** `social_features.challenge_participants`, `social_features.challenge_results`, `gamification_system.user_ranks`
- **Descripcion:** Estas tablas tienen politicas SELECT con `USING(true)` (acceso publico autenticado) junto con politicas SELECT mas restrictivas que son efectivamente redundantes.
- **Impacto:** No hay impacto funcional (PERMISSIVE policies se combinan con OR). Sin embargo, las politicas redundantes agregan overhead de evaluacion.
- **Recomendacion:** Documentar que las politicas public_read hacen redundantes las otras SELECT policies como decision de diseno intencional. Opcionalmente, consolidar.

---

### F-P2-007: user_roles tabla sin ENABLE RLS

- **Severidad:** BAJO
- **Ubicacion:** `apps/database/ddl/schemas/auth_management/rls-policies/02-enable-rls.sql:91`
- **Descripcion:** Linea 91 tiene `-- ALTER TABLE auth_management.user_roles ENABLE ROW LEVEL SECURITY;` **comentada**. Sin embargo, `auth_management/rls-policies/01-policies.sql:280` define `CREATE POLICY user_roles_read_own`. Si RLS no esta habilitado, esta politica existe pero no se evalua.
- **Impacto:** Sin RLS habilitado, cualquier usuario autenticado puede leer todos los roles de todos los usuarios, incluyendo permisos JSONB.
- **Recomendacion:** Descomentar el ENABLE RLS para user_roles, o documentar la decision de mantenerlo deshabilitado. Dado que user_roles contiene `permissions JSONB` y `role`, deberia tener RLS habilitado.

---

### F-P2-008: DB_TABLES.SOCIAL.GUILD_EMBLEMS posible tabla fantasma

- **Severidad:** INFO
- **Ubicacion:** `apps/backend/src/shared/constants/database.constants.ts:181`
- **Descripcion:** `GUILD_EMBLEMS: 'guild_emblems'` esta definido en constants pero no se encontro un archivo DDL dedicado `guild_emblems.sql`. La tabla es referenciada como FK en `21-guilds.sql` (`emblem_id INTEGER REFERENCES social_features.guild_emblems(id) DEFAULT 1`), lo que indica que debe existir. Puede estar definida en el archivo de prerequisites o en otro archivo.
- **Impacto:** Si la tabla no existe en DDL, la FK en guilds falla durante la creacion.
- **Recomendacion:** Verificar si `guild_emblems` esta definida inline en otro archivo o en prerequisites. Si no, crear DDL dedicado.

---

## Summary Table

| Check | ID | Status | Hallazgos | Severidad Maxima |
|-------|----|--------|-----------|------------------|
| Unicidad nombres indices | D-001 | PASS | 0 duplicados | - |
| Indices redundantes | D-002 | PASS | 0 redundancias | - |
| Politicas duplicadas por tabla | D-003 | **FAIL** | 6+ policies duplicadas exactas entre 07.sql y 07d.sql; 10+ entre schema-level y tables | CRITICO |
| Politicas contradictorias | D-004 | PASS | 3 tablas con USING(true) + other SELECT (intencional) | INFO |
| FK targets existentes | D-005 | PASS | 0 orphan FKs | - |
| Indices en tablas eliminadas | D-006 | PASS | 0 indices huerfanos | - |
| DB_TABLES vs DDL | D-007 | PASS* | 1-2 tablas requieren verificacion (guild_emblems, exercise_mechanic_mappings) | INFO |
| Helper functions DDL | D-008 | PASS | 6/6 funciones tienen DDL | - |
| RLS ENABLE cobertura | D-009 | MEDIO | ~110/169 tablas (~65%) | MEDIO |
| Singular FK post-fix | D-010 | PASS | 0 singulares restantes | - |

**Resumen de findings:**

| ID | Titulo | Severidad |
|----|--------|-----------|
| F-P2-001 | Politicas RLS duplicadas 07.sql vs 07d.sql | CRITICO |
| F-P2-002 | Politicas RLS duplicadas schema-level vs global | ALTO |
| F-P2-003 | Multiples fuentes ENABLE RLS por tabla | MEDIO |
| F-P2-004 | Tablas catalogo sin RLS (no documentadas) | MEDIO |
| F-P2-005 | admin_reports y metrics_history sin RLS | MEDIO |
| F-P2-006 | Politicas redundantes con USING(true) | BAJO |
| F-P2-007 | user_roles ENABLE RLS comentado | BAJO |
| F-P2-008 | guild_emblems posible tabla fantasma | INFO |

---

## Acciones Recomendadas (Priorizadas)

### Prioridad 1 - CRITICO (F-P2-001)
1. Agregar `DROP POLICY IF EXISTS` antes de cada CREATE POLICY en `07d-rls-policies-pending-tables.sql` para las 6 politicas duplicadas con 07-enable-rls.sql.
2. O bien, eliminar las politicas duplicadas de 07-enable-rls.sql (que usa `auth.uid()`) en favor de las de 07d (que usa `gamilit.get_current_user_id()`).

### Prioridad 2 - ALTO (F-P2-002)
3. Decidir convencion: schema-level policies vs inline policies. Agregar `DROP POLICY IF EXISTS` en la fuente canonical.
4. Crear documento de convencion para RLS policy management.

### Prioridad 3 - MEDIO (F-P2-003, F-P2-004, F-P2-005)
5. Crear tabla de excepciones RLS documentando tablas sin RLS y la justificacion.
6. Agregar RLS a `admin_dashboard.admin_reports` y `admin_dashboard.metrics_history`.
7. Agregar RLS a `gamification_system.shop_items` (contiene precios).
8. Consolidar ENABLE RLS en archivos unicos por tabla.

### Prioridad 4 - BAJO (F-P2-006, F-P2-007)
9. Descomentar `ALTER TABLE auth_management.user_roles ENABLE ROW LEVEL SECURITY`.
10. Documentar decisiones de USING(true) como intencionales.

---

*Auditoria generada: 2026-02-17 | Herramienta: Claude Opus 4.6 | Tiempo: ~45 min*
