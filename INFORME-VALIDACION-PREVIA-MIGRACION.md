# 📋 INFORME DE VALIDACIÓN PREVIA A MIGRACIÓN DE BASE DE DATOS

**Fecha de Generación:** 2025-11-08
**Total de Objetos a Migrar:** 73
**Conflictos Detectados:** 0

---

## 📑 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Objetos por Prioridad](#objetos-por-prioridad)
3. [Análisis Detallado por Schema](#análisis-detallado-por-schema)
4. [Orden de Migración por Dependencias](#orden-de-migración-por-dependencias)
5. [Conflictos Detectados](#conflictos-detectados)
6. [Checklist de Validación](#checklist-de-validación)
7. [Objetos Detallados](#objetos-detallados)

---

## 1. Resumen Ejecutivo

### Distribución por Prioridad

| Prioridad | Cantidad | % Total |
|-----------|----------|----------|
| 🔴 CRITICA | 29 | 39.7% |
| 🟡 ALTA | 17 | 23.3% |
| 🟢 MEDIA | 23 | 31.5% |
| 🟢 BAJA | 4 | 5.5% |

### Distribución por Schema

| Schema | Objetos | Prioridad Dominante |
|--------|---------|---------------------|
| audit_logging | 5 | ALTA |
| auth | 1 | MEDIA |
| auth_management | 21 | CRITICA |
| content_management | 3 | MEDIA |
| educational_content | 4 | ALTA |
| gamification_system | 14 | CRITICA |
| gamilit | 5 | MEDIA |
| progress_tracking | 8 | ALTA |
| social_features | 9 | CRITICA |
| system_configuration | 3 | MEDIA |

### Distribución por Tipo de Objeto

| Tipo | Cantidad |
|------|----------|
| FUNCTION | 23 |
| INDEX | 13 |
| MATERIALIZED VIEW | 1 |
| RLS POLICY | 8 |
| TABLE | 14 |
| UNKNOWN | 13 |
| VIEW | 1 |

---

## 2. Objetos por Prioridad

### 🔴 Prioridad CRITICA (29 objetos)

| Schema | Tipo | Objeto | Tamaño | Dependencias |
|--------|------|--------|--------|---------------|
| audit_logging | FUNCTION | `audit_logging.log_audit_event` | 1.8 KB | 6 |
| auth_management | FUNCTION | `auth_management.user_has_permission` | 1.3 KB | 4 |
| auth_management | FUNCTION | `auth_management.get_user_role` | 1.4 KB | 4 |
| auth_management | FUNCTION | `auth_management.assign_role_to_user` | 2.4 KB | 10 |
| auth_management | FUNCTION | `auth_management.revoke_role_from_user` | 2.3 KB | 9 |
| auth_management | RLS POLICY | `profiles_read_own` | 11.5 KB | 10 |
| auth_management | RLS POLICY | `None` | 3.1 KB | 8 |
| auth_management | TABLE | `auth_management.profiles` | 4.3 KB | 10 |
| auth_management | TABLE | `auth_management.user_roles` | 2.4 KB | 10 |
| auth_management | TABLE | `auth_management.memberships` | 2.8 KB | 10 |
| auth_management | TABLE | `auth_management.auth_attempts` | 1.8 KB | 6 |
| auth_management | TABLE | `auth_management.user_sessions` | 2.7 KB | 10 |
| auth_management | TABLE | `auth_management.email_verification_tokens` | 1.9 KB | 8 |
| auth_management | TABLE | `auth_management.password_reset_tokens` | 1.9 KB | 8 |
| auth_management | TABLE | `auth_management.security_events` | 2.2 KB | 10 |
| auth_management | UNKNOWN | `None` | 2.0 KB | 1 |
| auth_management | UNKNOWN | `None` | 1.6 KB | 1 |
| gamification_system | FUNCTION | `gamification_system.award_ml_coins` | 3.1 KB | 9 |
| gamification_system | FUNCTION | `gamification_system.calculate_level_from_xp` | 0.6 KB | 3 |
| gamification_system | FUNCTION | `gamification_system.calculate_xp_for_next_level` | 0.8 KB | 2 |
| gamification_system | FUNCTION | `gamification_system.get_user_rank_requirements` | 1.7 KB | 2 |
| gamification_system | FUNCTION | `gamification_system.spend_ml_coins` | 2.2 KB | 5 |
| gamilit | FUNCTION | `gamilit.update_user_stats_on_exercise_complete` | 1.3 KB | 2 |
| progress_tracking | FUNCTION | `progress_tracking.grant_mission_completion_rewards` | 3.0 KB | 10 |
| social_features | TABLE | `social_features.schools` | 4.2 KB | 10 |
| social_features | TABLE | `social_features.classrooms` | 5.4 KB | 10 |
| social_features | TABLE | `social_features.classroom_members` | 6.6 KB | 10 |
| social_features | TABLE | `social_features.teams` | 5.1 KB | 10 |
| social_features | TABLE | `social_features.team_members` | 3.3 KB | 10 |

### 🟡 Prioridad ALTA (17 objetos)

| Schema | Tipo | Objeto | Tamaño | Dependencias |
|--------|------|--------|--------|---------------|
| audit_logging | INDEX | `CONCURRENTLY` | 4.6 KB | 10 |
| audit_logging | RLS POLICY | `audit_logs_select_admin` | 6.4 KB | 6 |
| audit_logging | UNKNOWN | `None` | 1.1 KB | 0 |
| audit_logging | UNKNOWN | `None` | 1.1 KB | 0 |
| auth_management | RLS POLICY | `None` | 3.3 KB | 6 |
| auth_management | TABLE | `auth_management.user_preferences` | 3.7 KB | 10 |
| educational_content | FUNCTION | `educational_content.calculate_learning_path` | 3.4 KB | 10 |
| educational_content | FUNCTION | `educational_content.get_recommended_missions` | 2.7 KB | 10 |
| educational_content | RLS POLICY | `exercises_all_admin` | 6.0 KB | 5 |
| educational_content | UNKNOWN | `None` | 1.2 KB | 0 |
| gamification_system | INDEX | `CONCURRENTLY` | 2.7 KB | 6 |
| gamilit | FUNCTION | `gamilit.update_updated_at` | 0.6 KB | 2 |
| progress_tracking | FUNCTION | `progress_tracking.get_user_progress_summary` | 1.5 KB | 7 |
| progress_tracking | FUNCTION | `progress_tracking.check_mechanic_completion` | 1.9 KB | 6 |
| progress_tracking | RLS POLICY | `exercise_attempts_insert_own` | 9.5 KB | 10 |
| progress_tracking | UNKNOWN | `None` | 1.1 KB | 0 |
| progress_tracking | VIEW | `progress_tracking.user_progress_summary` | 1.0 KB | 1 |

### 🟢 Prioridad MEDIA (23 objetos)

| Schema | Tipo | Objeto | Tamaño | Dependencias |
|--------|------|--------|--------|---------------|
| auth | FUNCTION | `auth.get_current_user_id` | 5.3 KB | 10 |
| auth_management | INDEX | `IF` | 0.9 KB | 4 |
| auth_management | INDEX | `CONCURRENTLY` | 4.0 KB | 10 |
| content_management | RLS POLICY | `marie_content_all_admin` | 4.6 KB | 6 |
| content_management | UNKNOWN | `None` | 0.9 KB | 0 |
| content_management | UNKNOWN | `None` | 1.1 KB | 0 |
| gamification_system | INDEX | `IF` | 1.2 KB | 1 |
| gamification_system | INDEX | `IF` | 1.7 KB | 3 |
| gamification_system | INDEX | `CONCURRENTLY` | 2.0 KB | 7 |
| gamification_system | INDEX | `IF` | 2.1 KB | 5 |
| gamification_system | UNKNOWN | `None` | 6.8 KB | 10 |
| gamilit | FUNCTION | `gamilit.is_super_admin` | 0.6 KB | 2 |
| gamilit | FUNCTION | `gamilit.now_mexico` | 0.6 KB | 2 |
| gamilit | FUNCTION | `gamilit.update_classroom_member_count` | 1.0 KB | 2 |
| progress_tracking | FUNCTION | `progress_tracking.update_exercise_submissions_updated_at` | 0.5 KB | 1 |
| progress_tracking | INDEX | `IF` | 2.1 KB | 2 |
| social_features | FUNCTION | `social_features.cleanup_old_notifications` | 1.3 KB | 5 |
| social_features | INDEX | `CONCURRENTLY` | 3.6 KB | 10 |
| social_features | INDEX | `CONCURRENTLY` | 2.9 KB | 8 |
| social_features | INDEX | `CONCURRENTLY` | 2.9 KB | 8 |
| system_configuration | RLS POLICY | `system_settings_all_admin` | 2.9 KB | 4 |
| system_configuration | UNKNOWN | `None` | 0.7 KB | 0 |
| system_configuration | UNKNOWN | `None` | 1.0 KB | 0 |

### 🟢 Prioridad BAJA (4 objetos)

| Schema | Tipo | Objeto | Tamaño | Dependencias |
|--------|------|--------|--------|---------------|
| auth_management | INDEX | `IF` | 1.4 KB | 7 |
| gamification_system | MATERIALIZED VIEW | `None` | 10.2 KB | 10 |
| gamification_system | UNKNOWN | `None` | 7.9 KB | 10 |
| gamification_system | UNKNOWN | `None` | 4.3 KB | 8 |

---

## 3. Análisis Detallado por Schema

### Schema: `audit_logging`

**Total de objetos:** 5

#### FUNCTIONs (1)

**01-log_audit_event.sql**
- Prioridad: CRITICA
- Tamaño: 1800 bytes (73 líneas)
- Tablas referenciadas: auth_management.profiles, user
- Funciones llamadas: audit_logging.log_audit_event, uuid_generate_v4, VALUES, audit_logging.system_logs
- ✓ Incluye GRANTS
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/audit_logging/functions/01-log_audit_event.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/audit_logging/function/01-log_audit_event.sql`

#### INDEXs (1)

**01-audit_logs_indexes.sql**
- Prioridad: ALTA
- Tamaño: 4706 bytes (128 líneas)
- Tablas referenciadas: audit_logging.audit_logs, audit_logs
- Funciones llamadas: audit_logging.audit_logs, type, BTREE, DATE_TRUNC, report
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/audit_logging/indexes/01-audit_logs_indexes.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/audit_logging/index/01-audit_logs_indexes.sql`

#### RLS POLICYs (1)

**02-policies.sql**
- Prioridad: ALTA
- Tamaño: 6549 bytes (166 líneas)
- Funciones llamadas: gamilit.get_current_user_id, métricas, gamilit.is_admin, USING, CHECK
- ✓ Incluye RLS policies
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/audit_logging/rls-policies/02-policies.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/audit_logging/rls-policy/02-policies.sql`

#### UNKNOWNs (2)

**01-enable-rls.sql**
- Prioridad: ALTA
- Tamaño: 1147 bytes (21 líneas)
- ✓ Incluye RLS policies
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/audit_logging/rls-policies/01-enable-rls.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/audit_logging/rls-policy/01-enable-rls.sql`

**03-grants.sql**
- Prioridad: ALTA
- Tamaño: 1138 bytes (27 líneas)
- ✓ Incluye GRANTS
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/audit_logging/rls-policies/03-grants.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/audit_logging/rls-policy/03-grants.sql`


### Schema: `auth`

**Total de objetos:** 1

#### FUNCTIONs (1)

**01-auth-helpers.sql**
- Prioridad: MEDIA
- Tamaño: 5426 bytes (169 líneas)
- Tablas referenciadas: session, auth_management.user_roles
- Funciones llamadas: auth.get_current_user_id, auth.is_student, auth.is_admin, auth.uid, settings
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth/functions/01-auth-helpers.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth/function/01-auth-helpers.sql`


### Schema: `auth_management`

**Total de objetos:** 21

#### FUNCTIONs (4)

**06-user_has_permission.sql**
- Prioridad: CRITICA
- Tamaño: 1304 bytes (45 líneas)
- Tablas referenciadas: auth_management.user_roles
- Funciones llamadas: auth_management.user_has_permission, gamilit.is_super_admin, EXISTS
- ✓ Incluye GRANTS
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/functions/06-user_has_permission.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/function/06-user_has_permission.sql`

**07-get_user_role.sql**
- Prioridad: CRITICA
- Tamaño: 1389 bytes (47 líneas)
- Tablas referenciadas: auth_management.user_roles
- Funciones llamadas: gamilit.get_current_user_id, role, auth_management.get_user_role
- ✓ Incluye GRANTS
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/functions/07-get_user_role.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/function/07-get_user_role.sql`

**08-assign_role_to_user.sql**
- Prioridad: CRITICA
- Tamaño: 2488 bytes (100 líneas)
- Tablas referenciadas: auth_management.profiles, auth_management.user_roles
- Funciones llamadas: gamilit.get_current_user_id, auth_management.user_roles, audit_logging.log_audit_event, jsonb_build_object, auth_management.assign_role_to_user
- ✓ Incluye GRANTS
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/functions/08-assign_role_to_user.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/function/08-assign_role_to_user.sql`

**09-revoke_role_from_user.sql**
- Prioridad: CRITICA
- Tamaño: 2312 bytes (81 líneas)
- Tablas referenciadas: auth_management.user_roles
- Funciones llamadas: gamilit.get_current_user_id, to_jsonb, audit_logging.log_audit_event, jsonb_build_object, auth_management.revoke_role_from_user
- ✓ Incluye GRANTS
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/functions/09-revoke_role_from_user.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/function/09-revoke_role_from_user.sql`

#### INDEXs (3)

**01-idx_user_roles_permissions_gin.sql**
- Prioridad: MEDIA
- Tamaño: 950 bytes (27 líneas)
- Tablas referenciadas: auth_management.user_roles
- Funciones llamadas: permissions, GIN, permission
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/indexes/01-idx_user_roles_permissions_gin.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/index/01-idx_user_roles_permissions_gin.sql`

**01-user_sessions_indexes.sql**
- Prioridad: MEDIA
- Tamaño: 4077 bytes (125 líneas)
- Tablas referenciadas: auth_management.user_sessions, user_sessions
- Funciones llamadas: Index, periódico, auth_management.user_sessions, sessions, session
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/indexes/01-user_sessions_indexes.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/index/01-user_sessions_indexes.sql`

**02-user_preferences_indexes.sql**
- Prioridad: BAJA
- Tamaño: 1452 bytes (30 líneas)
- Tablas referenciadas: USING, IS, ON
- Funciones llamadas: auth_management.user_preferences, GIN, completado, JSON
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/indexes/02-user_preferences_indexes.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/index/02-user_preferences_indexes.sql`

#### RLS POLICYs (3)

**02-policies.sql**
- Prioridad: CRITICA
- Tamaño: 11826 bytes (305 líneas)
- Tablas referenciadas: social_features.classroom_members, social_features.classrooms, auth_management.user_roles
- Funciones llamadas: 0, access, policies, 28, USING
- ✓ Incluye RLS policies
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/rls-policies/02-policies.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/rls-policy/02-policies.sql`

**04-user_roles-rls.sql**
- Prioridad: CRITICA
- Tamaño: 3222 bytes (93 líneas)
- Tablas referenciadas: auth_management.profiles
- Funciones llamadas: gamilit.get_current_user_id, gamilit.is_admin, AND, USING, NOT
- ✓ Incluye RLS policies
- ✓ Incluye GRANTS
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/rls-policies/04-user_roles-rls.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/rls-policy/04-user_roles-rls.sql`

**05-tenants-rls.sql**
- Prioridad: ALTA
- Tamaño: 3422 bytes (101 líneas)
- Tablas referenciadas: auth_management.profiles
- Funciones llamadas: gamilit.get_current_user_id, gamilit.is_admin, USING, CHECK, gamilit.is_super_admin
- ✓ Incluye RLS policies
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/rls-policies/05-tenants-rls.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/rls-policy/05-tenants-rls.sql`

#### TABLEs (9)

**02-profiles.sql**
- Prioridad: CRITICA
- Tamaño: 4386 bytes (94 líneas)
- Tablas referenciadas: auth.users, jsonb, auth_management.tenants
- Funciones llamadas: gamilit.initialize_user_stats, gamilit.get_current_user_id, auth_management.profiles, auth_management.tenants, gen_random_uuid
- ✓ Incluye RLS policies
- ✓ Incluye GRANTS
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/tables/02-profiles.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/table/02-profiles.sql`

**03-user_roles.sql**
- Prioridad: CRITICA
- Tamaño: 2475 bytes (55 líneas)
- Tablas referenciadas: auth_management.profiles, auth_management.tenants
- Funciones llamadas: auth_management.profiles, auth_management.tenants, gen_random_uuid, auth_management.user_roles, UNIQUE
- ✓ Incluye GRANTS
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/tables/03-user_roles.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/table/03-user_roles.sql`

**04-memberships.sql**
- Prioridad: CRITICA
- Tamaño: 2866 bytes (60 líneas)
- Tablas referenciadas: auth_management.tenants, auth_management.profiles
- Funciones llamadas: auth_management.memberships, auth_management.tenants, gen_random_uuid, auth_management.profiles, UNIQUE
- ✓ Incluye GRANTS
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/tables/04-memberships.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/table/04-memberships.sql`

**05-auth_attempts.sql**
- Prioridad: CRITICA
- Tamaño: 1870 bytes (41 líneas)
- Funciones llamadas: gen_random_uuid, btree, None, gamilit.now_mexico, KEY
- ✓ Incluye GRANTS
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/tables/05-auth_attempts.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/table/05-auth_attempts.sql`

**06-user_sessions.sql**
- Prioridad: CRITICA
- Tamaño: 2771 bytes (60 líneas)
- Tablas referenciadas: auth_management.tenants, auth_management.profiles
- Funciones llamadas: auth_management.tenants, auth_management.profiles, gen_random_uuid, UNIQUE, auth_management.user_sessions
- ✓ Incluye GRANTS
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/tables/06-user_sessions.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/table/06-user_sessions.sql`

**07-email_verification_tokens.sql**
- Prioridad: CRITICA
- Tamaño: 1934 bytes (43 líneas)
- Tablas referenciadas: auth.users
- Funciones llamadas: gen_random_uuid, UNIQUE, btree, varying, KEY
- ✓ Incluye GRANTS
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/tables/07-email_verification_tokens.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/table/07-email_verification_tokens.sql`

**08-password_reset_tokens.sql**
- Prioridad: CRITICA
- Tamaño: 1942 bytes (44 líneas)
- Tablas referenciadas: auth.users
- Funciones llamadas: gen_random_uuid, UNIQUE, btree, varying, KEY
- ✓ Incluye GRANTS
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/tables/08-password_reset_tokens.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/table/08-password_reset_tokens.sql`

**09-security_events.sql**
- Prioridad: CRITICA
- Tamaño: 2283 bytes (48 líneas)
- Tablas referenciadas: auth.users
- Funciones llamadas: gen_random_uuid, event, ANY, btree, auth_management.security_events
- ✓ Incluye GRANTS
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/tables/09-security_events.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/table/09-security_events.sql`

**10-user_preferences.sql**
- Prioridad: ALTA
- Tamaño: 3796 bytes (79 líneas)
- Tablas referenciadas: auth_management.profiles, JSONB, OWNER, TO, USING
- Funciones llamadas: gamilit.get_current_user_id, auth_management.profiles, JSON, gamilit.is_admin, en
- ✓ Incluye RLS policies
- ✓ Incluye GRANTS
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/tables/10-user_preferences.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/table/10-user_preferences.sql`

#### UNKNOWNs (2)

**01-enable-rls.sql**
- Prioridad: CRITICA
- Tamaño: 2089 bytes (33 líneas)
- Funciones llamadas: 28
- ✓ Incluye RLS policies
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/rls-policies/01-enable-rls.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/rls-policy/01-enable-rls.sql`

**03-grants.sql**
- Prioridad: CRITICA
- Tamaño: 1632 bytes (33 líneas)
- Funciones llamadas: profiles
- ✓ Incluye GRANTS
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/rls-policies/03-grants.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/rls-policy/03-grants.sql`


### Schema: `content_management`

**Total de objetos:** 3

#### RLS POLICYs (1)

**02-policies.sql**
- Prioridad: MEDIA
- Tamaño: 4747 bytes (119 líneas)
- Funciones llamadas: gamilit.get_current_user_id, gamilit.is_admin, gamilit.get_current_user_role, USING, CHECK
- ✓ Incluye RLS policies
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/content_management/rls-policies/02-policies.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/content_management/rls-policy/02-policies.sql`

#### UNKNOWNs (2)

**01-enable-rls.sql**
- Prioridad: MEDIA
- Tamaño: 879 bytes (17 líneas)
- ✓ Incluye RLS policies
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/content_management/rls-policies/01-enable-rls.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/content_management/rls-policy/01-enable-rls.sql`

**03-grants.sql**
- Prioridad: MEDIA
- Tamaño: 1119 bytes (25 líneas)
- ✓ Incluye GRANTS
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/content_management/rls-policies/03-grants.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/content_management/rls-policy/03-grants.sql`


### Schema: `educational_content`

**Total de objetos:** 4

#### FUNCTIONs (2)

**01-calculate_learning_path.sql**
- Prioridad: ALTA
- Tamaño: 3448 bytes (99 líneas)
- Tablas referenciadas: progress_tracking.mission_progress, incomplete_missions, gamification_system.user_stats, progress_tracking.module_progress, incomplete_modules
- Funciones llamadas: NUMERIC, VARCHAR, FROM, AS, educational_content.calculate_learning_path
- ✓ Incluye GRANTS
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/educational_content/functions/01-calculate_learning_path.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/educational_content/function/01-calculate_learning_path.sql`

**02-get_recommended_missions.sql**
- Prioridad: ALTA
- Tamaño: 2734 bytes (73 líneas)
- Tablas referenciadas: progress_tracking.mission_progress, educational_content.get_recommended_missions, gamification_system.user_ranks, educational_content.missions, gamification_system.user_stats
- Funciones llamadas: educational_content.get_recommended_missions, AND, ABS, VARCHAR, IN
- ✓ Incluye GRANTS
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/educational_content/functions/02-get_recommended_missions.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/educational_content/function/02-get_recommended_missions.sql`

#### RLS POLICYs (1)

**02-policies.sql**
- Prioridad: ALTA
- Tamaño: 6193 bytes (160 líneas)
- Funciones llamadas: gamilit.get_current_user_id, gamilit.is_admin, AND, USING, gamilit.is_super_admin
- ✓ Incluye RLS policies
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/educational_content/rls-policies/02-policies.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/educational_content/rls-policy/02-policies.sql`

#### UNKNOWNs (1)

**03-grants.sql**
- Prioridad: ALTA
- Tamaño: 1208 bytes (26 líneas)
- ✓ Incluye GRANTS
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/educational_content/rls-policies/03-grants.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/educational_content/rls-policy/03-grants.sql`


### Schema: `gamification_system`

**Total de objetos:** 14

#### FUNCTIONs (5)

**01-award_ml_coins.sql**
- Prioridad: CRITICA
- Tamaño: 3164 bytes (90 líneas)
- Tablas referenciadas: gamification_system.user_stats, gamification_system.user_ranks
- Funciones llamadas: gamification_system.award_ml_coins, jsonb_build_object, gamification_system.ml_coins_transactions, gamilit.now_mexico, FLOOR
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamification_system/functions/01-award_ml_coins.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/function/01-award_ml_coins.sql`

**02-calculate_level_from_xp.sql**
- Prioridad: CRITICA
- Tamaño: 659 bytes (20 líneas)
- Funciones llamadas: FLOOR, gamification_system.calculate_level_from_xp, SQRT
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamification_system/functions/02-calculate_level_from_xp.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/function/02-calculate_level_from_xp.sql`

**03-calculate_xp_for_next_level.sql**
- Prioridad: CRITICA
- Tamaño: 775 bytes (20 líneas)
- Funciones llamadas: RETURN, gamification_system.calculate_xp_for_next_level
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamification_system/functions/03-calculate_xp_for_next_level.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/function/03-calculate_xp_for_next_level.sql`

**04-get_user_rank_requirements.sql**
- Prioridad: CRITICA
- Tamaño: 1785 bytes (49 líneas)
- Funciones llamadas: TABLE, gamification_system.get_user_rank_requirements
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamification_system/functions/04-get_user_rank_requirements.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/function/04-get_user_rank_requirements.sql`

**05-spend_ml_coins.sql**
- Prioridad: CRITICA
- Tamaño: 2278 bytes (65 líneas)
- Tablas referenciadas: gamification_system.user_stats
- Funciones llamadas: gamification_system.ml_coins_transactions, gamilit.now_mexico, VALUES, gamification_system.spend_ml_coins
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamification_system/functions/05-spend_ml_coins.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/function/05-spend_ml_coins.sql`

#### INDEXs (5)

**02-achievement_categories_indexes.sql**
- Prioridad: MEDIA
- Tamaño: 1225 bytes (25 líneas)
- Funciones llamadas: gamification_system.achievement_categories
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamification_system/indexes/02-achievement_categories_indexes.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/index/02-achievement_categories_indexes.sql`

**02-user_stats_indexes.sql**
- Prioridad: ALTA
- Tamaño: 2720 bytes (78 líneas)
- Tablas referenciadas: user_stats, gamification_system.user_stats
- Funciones llamadas: gamification_system.user_stats, ROW_NUMBER, Leaderboard, OVER
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamification_system/indexes/02-user_stats_indexes.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/index/02-user_stats_indexes.sql`

**03-active_boosts_indexes.sql**
- Prioridad: MEDIA
- Tamaño: 1756 bytes (37 líneas)
- Funciones llamadas: expiración, gamification_system.active_boosts, tipo
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamification_system/indexes/03-active_boosts_indexes.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/index/03-active_boosts_indexes.sql`

**03-notifications_indexes.sql**
- Prioridad: MEDIA
- Tamaño: 2055 bytes (56 líneas)
- Tablas referenciadas: gamification_system.notifications, notifications
- Funciones llamadas: Index, leídas, usuario, gamification_system.notifications, user
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamification_system/indexes/03-notifications_indexes.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/index/03-notifications_indexes.sql`

**04-inventory_transactions_indexes.sql**
- Prioridad: MEDIA
- Tamaño: 2130 bytes (39 líneas)
- Funciones llamadas: JSON, gamification_system.inventory_transactions, item, GIN, fecha
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamification_system/indexes/04-inventory_transactions_indexes.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/index/04-inventory_transactions_indexes.sql`

#### MATERIALIZED VIEWs (1)

**rebuild-all-mvs.sql**
- Prioridad: BAJA
- Tamaño: 10472 bytes (299 líneas)
- Tablas referenciadas: gamification_system.mv_mechanic_leaderboard, auth_management.profiles, gamification_system.mv_global_leaderboard, social_features.classroom_members, cron.job
- Funciones llamadas: OK, gamification_system.mv_mechanic_leaderboard, mv_classroom_leaderboard, necessary, gamification_system.mv_global_leaderboard
- ✓ Incluye GRANTS
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamification_system/materialized-views/rebuild-all-mvs.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/materialized-view/rebuild-all-mvs.sql`

#### UNKNOWNs (3)

**99-refresh-schedule.sql**
- Prioridad: MEDIA
- Tamaño: 6931 bytes (192 líneas)
- Tablas referenciadas: cron.job, cron.job_run_details, pg_available_extensions
- Funciones llamadas: Medium, schedule, cron.unschedule, Leaderboard, IN
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamification_system/materialized-views/99-refresh-schedule.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/materialized-view/99-refresh-schedule.sql`

**check-mv-freshness.sql**
- Prioridad: BAJA
- Tamaño: 8066 bytes (277 líneas)
- Tablas referenciadas: gamification_system.mv_mechanic_leaderboard, pg_stat_user_indexes, gamification_system.mv_global_leaderboard, cron.job, gamification_system.mv_classroom_leaderboard
- Funciones llamadas: Distribution, Runs, numeric, active, status
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamification_system/materialized-views/check-mv-freshness.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/materialized-view/check-mv-freshness.sql`

**refresh-all-mvs.sql**
- Prioridad: BAJA
- Tamaño: 4386 bytes (135 líneas)
- Tablas referenciadas: gamification_system.mv_mechanic_leaderboard, gamification_system.mv_global_leaderboard, gamification_system.mv_classroom_leaderboard, psql, gamification_system.mv_weekly_leaderboard
- Funciones llamadas: total, needed, Leaderboard
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamification_system/materialized-views/refresh-all-mvs.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/materialized-view/refresh-all-mvs.sql`


### Schema: `gamilit`

**Total de objetos:** 5

#### FUNCTIONs (5)

**06-is_super_admin.sql**
- Prioridad: MEDIA
- Tamaño: 633 bytes (22 líneas)
- Funciones llamadas: gamilit.is_super_admin, gamilit.get_current_user_role
- ✓ Incluye GRANTS
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamilit/functions/06-is_super_admin.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamilit/function/06-is_super_admin.sql`

**06-now_mexico.sql**
- Prioridad: MEDIA
- Tamaño: 638 bytes (20 líneas)
- Funciones llamadas: gamilit.now_mexico, México
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamilit/functions/06-now_mexico.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamilit/function/06-now_mexico.sql`

**07-update_classroom_member_count.sql**
- Prioridad: MEDIA
- Tamaño: 994 bytes (33 líneas)
- Funciones llamadas: gamilit.update_classroom_member_count, GREATEST
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamilit/functions/07-update_classroom_member_count.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamilit/function/07-update_classroom_member_count.sql`

**08-update_updated_at.sql**
- Prioridad: ALTA
- Tamaño: 590 bytes (20 líneas)
- Funciones llamadas: gamilit.update_updated_at, gamilit.now_mexico
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamilit/functions/08-update_updated_at.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamilit/function/08-update_updated_at.sql`

**10-update_user_stats_on_exercise_complete.sql**
- Prioridad: CRITICA
- Tamaño: 1361 bytes (35 líneas)
- Funciones llamadas: gamilit.update_user_stats_on_exercise_complete, gamilit.now_mexico
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamilit/functions/10-update_user_stats_on_exercise_complete.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamilit/function/10-update_user_stats_on_exercise_complete.sql`


### Schema: `progress_tracking`

**Total de objetos:** 8

#### FUNCTIONs (4)

**02-get_user_progress_summary.sql**
- Prioridad: ALTA
- Tamaño: 1583 bytes (31 líneas)
- Tablas referenciadas: progress_tracking.exercise_attempts, SUM, progress_tracking.module_progress
- Funciones llamadas: FILTER, TABLE, NUMERIC, progress_tracking.get_user_progress_summary
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/progress_tracking/functions/02-get_user_progress_summary.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/function/02-get_user_progress_summary.sql`

**03-update_exercise_submissions_updated_at.sql**
- Prioridad: MEDIA
- Tamaño: 487 bytes (18 líneas)
- Funciones llamadas: progress_tracking.update_exercise_submissions_updated_at
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/progress_tracking/functions/03-update_exercise_submissions_updated_at.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/function/03-update_exercise_submissions_updated_at.sql`

**04-check_mechanic_completion.sql**
- Prioridad: ALTA
- Tamaño: 1921 bytes (56 líneas)
- Tablas referenciadas: educational_content.mechanics, progress_tracking.mechanic_progress, progress_tracking.check_mechanic_completion
- Funciones llamadas: TABLE, NUMERIC, progress_tracking.check_mechanic_completion
- ✓ Incluye GRANTS
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/progress_tracking/functions/04-check_mechanic_completion.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/function/04-check_mechanic_completion.sql`

**06-grant_mission_completion_rewards.sql**
- Prioridad: CRITICA
- Tamaño: 3107 bytes (92 líneas)
- Tablas referenciadas: gamification_system.calculate_mission_reward, progress_tracking.grant_mission_completion_rewards, gamification_system.check_and_grant_achievements, educational_content.missions, gamification_system.user_stats
- Funciones llamadas: gamification_system.calculate_mission_reward, GREATEST, jsonb_build_object, progress_tracking.grant_mission_completion_rewards, gamification_system.ml_coins_transactions
- ✓ Incluye GRANTS
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/progress_tracking/functions/06-grant_mission_completion_rewards.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/function/06-grant_mission_completion_rewards.sql`

#### INDEXs (1)

**01-scheduled_missions_indexes.sql**
- Prioridad: MEDIA
- Tamaño: 2187 bytes (42 líneas)
- Funciones llamadas: progress_tracking.scheduled_missions, fechas
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/progress_tracking/indexes/01-scheduled_missions_indexes.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/index/01-scheduled_missions_indexes.sql`

#### RLS POLICYs (1)

**02-policies.sql**
- Prioridad: ALTA
- Tamaño: 9698 bytes (235 líneas)
- Tablas referenciadas: social_features.classroom_members, social_features.classrooms
- Funciones llamadas: gamilit.get_current_user_id, gamilit.is_admin, AND, gamilit.get_current_user_role, USING
- ✓ Incluye RLS policies
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/progress_tracking/rls-policies/02-policies.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/rls-policy/02-policies.sql`

#### UNKNOWNs (1)

**03-grants.sql**
- Prioridad: ALTA
- Tamaño: 1121 bytes (25 líneas)
- ✓ Incluye GRANTS
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/progress_tracking/rls-policies/03-grants.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/rls-policy/03-grants.sql`

#### VIEWs (1)

**01-user_progress_summary.sql**
- Prioridad: ALTA
- Tamaño: 1027 bytes (30 líneas)
- Tablas referenciadas: gamification_system.user_stats
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/progress_tracking/views/01-user_progress_summary.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/view/01-user_progress_summary.sql`


### Schema: `social_features`

**Total de objetos:** 9

#### FUNCTIONs (1)

**01-cleanup_old_notifications.sql**
- Prioridad: MEDIA
- Tamaño: 1299 bytes (42 líneas)
- Tablas referenciadas: social_features.notifications, social_features.cleanup_old_notifications
- Funciones llamadas: mantener, social_features.cleanup_old_notifications, TABLE
- ✓ Incluye GRANTS
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/social_features/functions/01-cleanup_old_notifications.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/function/01-cleanup_old_notifications.sql`

#### INDEXs (3)

**01-friendships_indexes.sql**
- Prioridad: MEDIA
- Tamaño: 3717 bytes (109 líneas)
- Tablas referenciadas: friendships, social_features.friendships
- Funciones llamadas: received, o, friends, list, OR
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/social_features/indexes/01-friendships_indexes.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/index/01-friendships_indexes.sql`

**02-classroom_members_indexes.sql**
- Prioridad: MEDIA
- Tamaño: 2975 bytes (93 líneas)
- Tablas referenciadas: social_features.classroom_members, social_features.classrooms, classroom_members
- Funciones llamadas: social_features.classroom_members, history, actual, EXISTS, classrooms
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/social_features/indexes/02-classroom_members_indexes.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/index/02-classroom_members_indexes.sql`

**03-schools_indexes.sql**
- Prioridad: MEDIA
- Tamaño: 2963 bytes (100 líneas)
- Tablas referenciadas: social_features.schools, schools
- Funciones llamadas: tenant, Security, schools, current_tenant_id, social_features.schools
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/social_features/indexes/03-schools_indexes.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/index/03-schools_indexes.sql`

#### TABLEs (5)

**01-schools.sql**
- Prioridad: CRITICA
- Tamaño: 4301 bytes (152 líneas)
- Tablas referenciadas: auth_management.profiles, auth_management.tenants, database
- Funciones llamadas: auth_management.profiles, auth_management.tenants, gen_random_uuid, UNIQUE, btree
- ✓ Incluye GRANTS
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/social_features/tables/01-schools.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/table/01-schools.sql`

**02-classrooms.sql**
- Prioridad: CRITICA
- Tamaño: 5563 bytes (185 líneas)
- Tablas referenciadas: auth_management.profiles, auth_management.tenants, social_features.classroom_members, database, social_features.schools
- Funciones llamadas: gamilit.get_current_user_id, auth_management.profiles, auth_management.tenants, gen_random_uuid, UNIQUE
- ✓ Incluye RLS policies
- ✓ Incluye GRANTS
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/social_features/tables/02-classrooms.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/table/02-classrooms.sql`

**03-classroom_members.sql**
- Prioridad: CRITICA
- Tamaño: 6763 bytes (190 líneas)
- Tablas referenciadas: social_features.classrooms, database, auth_management.profiles
- Funciones llamadas: numeric, gamilit.is_admin, gamilit.update_classroom_member_count, 16.10, KEY
- ✓ Incluye RLS policies
- ✓ Incluye GRANTS
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/social_features/tables/03-classroom_members.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/table/03-classroom_members.sql`

**04-teams.sql**
- Prioridad: CRITICA
- Tamaño: 5192 bytes (181 líneas)
- Tablas referenciadas: social_features.classrooms, auth_management.tenants, auth_management.profiles, database
- Funciones llamadas: auth_management.profiles, auth_management.tenants, gen_random_uuid, UNIQUE, social_features.teams
- ✓ Incluye RLS policies
- ✓ Incluye GRANTS
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/social_features/tables/04-teams.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/table/04-teams.sql`

**05-team_members.sql**
- Prioridad: CRITICA
- Tamaño: 3394 bytes (115 líneas)
- Tablas referenciadas: auth.users, social_features.teams, database
- Funciones llamadas: gen_random_uuid, UNIQUE, ANY, btree, social_features.teams
- ✓ Incluye GRANTS
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/social_features/tables/05-team_members.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/table/05-team_members.sql`


### Schema: `system_configuration`

**Total de objetos:** 3

#### RLS POLICYs (1)

**02-policies.sql**
- Prioridad: MEDIA
- Tamaño: 2934 bytes (70 líneas)
- Funciones llamadas: gamilit.is_admin, gamilit.is_super_admin, gamilit.get_current_user_id, USING
- ✓ Incluye RLS policies
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/system_configuration/rls-policies/02-policies.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/system_configuration/rls-policy/02-policies.sql`

#### UNKNOWNs (2)

**01-enable-rls.sql**
- Prioridad: MEDIA
- Tamaño: 703 bytes (15 líneas)
- ✓ Incluye RLS policies
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/system_configuration/rls-policies/01-enable-rls.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/system_configuration/rls-policy/01-enable-rls.sql`

**03-grants.sql**
- Prioridad: MEDIA
- Tamaño: 1005 bytes (24 líneas)
- ✓ Incluye GRANTS
- Ruta origen: `/home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/system_configuration/rls-policies/03-grants.sql`
- Ruta destino: `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/system_configuration/rls-policy/03-grants.sql`


---

## 4. Orden de Migración por Dependencias

Los objetos se deben migrar en el siguiente orden para respetar dependencias:

### Nivel 0 (1 objetos)

*Objetos sin dependencias - pueden migrarse primero*

| Objeto | Schema | Tipo | Prioridad |
|--------|--------|------|------------|
| `progress_tracking.user_progress_summary` | progress_tracking | VIEW | ALTA |

### Nivel 1 (56 objetos)

| Objeto | Schema | Tipo | Prioridad |
|--------|--------|------|------------|
| `audit_logs_select_admin` | audit_logging | RLS POLICY | ALTA |
| `CONCURRENTLY` | audit_logging | INDEX | ALTA |
| `auth_management.user_preferences` | auth_management | TABLE | ALTA |
| `educational_content.calculate_learning_path` | educational_content | FUNCTION | ALTA |
| `educational_content.get_recommended_missions` | educational_content | FUNCTION | ALTA |
| `exercises_all_admin` | educational_content | RLS POLICY | ALTA |
| `CONCURRENTLY` | gamification_system | INDEX | ALTA |
| `gamilit.update_updated_at` | gamilit | FUNCTION | ALTA |
| `progress_tracking.get_user_progress_summary` | progress_tracking | FUNCTION | ALTA |
| `progress_tracking.check_mechanic_completion` | progress_tracking | FUNCTION | ALTA |
| `exercise_attempts_insert_own` | progress_tracking | RLS POLICY | ALTA |
| `IF` | auth_management | INDEX | BAJA |
| `audit_logging.log_audit_event` | audit_logging | FUNCTION | CRITICA |
| `auth_management.profiles` | auth_management | TABLE | CRITICA |
| `auth_management.user_roles` | auth_management | TABLE | CRITICA |
| `auth_management.memberships` | auth_management | TABLE | CRITICA |
| `auth_management.auth_attempts` | auth_management | TABLE | CRITICA |
| `auth_management.user_sessions` | auth_management | TABLE | CRITICA |
| `auth_management.email_verification_tokens` | auth_management | TABLE | CRITICA |
| `auth_management.password_reset_tokens` | auth_management | TABLE | CRITICA |
| `auth_management.security_events` | auth_management | TABLE | CRITICA |
| `auth_management.user_has_permission` | auth_management | FUNCTION | CRITICA |
| `auth_management.get_user_role` | auth_management | FUNCTION | CRITICA |
| `auth_management.assign_role_to_user` | auth_management | FUNCTION | CRITICA |
| `auth_management.revoke_role_from_user` | auth_management | FUNCTION | CRITICA |
| `profiles_read_own` | auth_management | RLS POLICY | CRITICA |
| `gamification_system.award_ml_coins` | gamification_system | FUNCTION | CRITICA |
| `gamification_system.calculate_level_from_xp` | gamification_system | FUNCTION | CRITICA |
| `gamification_system.calculate_xp_for_next_level` | gamification_system | FUNCTION | CRITICA |
| `gamification_system.get_user_rank_requirements` | gamification_system | FUNCTION | CRITICA |
| `gamification_system.spend_ml_coins` | gamification_system | FUNCTION | CRITICA |
| `gamilit.update_user_stats_on_exercise_complete` | gamilit | FUNCTION | CRITICA |
| `progress_tracking.grant_mission_completion_rewards` | progress_tracking | FUNCTION | CRITICA |
| `social_features.schools` | social_features | TABLE | CRITICA |
| `social_features.classrooms` | social_features | TABLE | CRITICA |
| `social_features.classroom_members` | social_features | TABLE | CRITICA |
| `social_features.teams` | social_features | TABLE | CRITICA |
| `social_features.team_members` | social_features | TABLE | CRITICA |
| `auth.get_current_user_id` | auth | FUNCTION | MEDIA |
| `IF` | auth_management | INDEX | MEDIA |
| `CONCURRENTLY` | auth_management | INDEX | MEDIA |
| `marie_content_all_admin` | content_management | RLS POLICY | MEDIA |
| `IF` | gamification_system | INDEX | MEDIA |
| `IF` | gamification_system | INDEX | MEDIA |
| `CONCURRENTLY` | gamification_system | INDEX | MEDIA |
| `IF` | gamification_system | INDEX | MEDIA |
| `gamilit.is_super_admin` | gamilit | FUNCTION | MEDIA |
| `gamilit.now_mexico` | gamilit | FUNCTION | MEDIA |
| `gamilit.update_classroom_member_count` | gamilit | FUNCTION | MEDIA |
| `progress_tracking.update_exercise_submissions_updated_at` | progress_tracking | FUNCTION | MEDIA |
| `IF` | progress_tracking | INDEX | MEDIA |
| `social_features.cleanup_old_notifications` | social_features | FUNCTION | MEDIA |
| `CONCURRENTLY` | social_features | INDEX | MEDIA |
| `CONCURRENTLY` | social_features | INDEX | MEDIA |
| `CONCURRENTLY` | social_features | INDEX | MEDIA |
| `system_settings_all_admin` | system_configuration | RLS POLICY | MEDIA |

---

## 5. Conflictos Detectados

✅ No se detectaron conflictos. Todos los objetos pueden migrarse sin problemas.

---

## 6. Checklist de Validación

### A. Pre-Migración

1. 🔴 **CRÍTICO** Verificar conexión a base de datos de desarrollo
   ```bash
   psql -d gamilit_platform -c "SELECT version();"
   ```
   - [ ] Completado

2. 🔴 **CRÍTICO** Crear backup completo de base de datos actual
   ```bash
   pg_dump -Fc gamilit_platform > backup_pre_migration_$(date +%Y%m%d).dump
   ```
   - [ ] Completado

3. 🔴 **CRÍTICO** Verificar schemas destino existen
   ```bash
   psql -d gamilit_platform -c "SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog', 'information_schema');"
   ```
   - [ ] Completado

4. 🟢 Validar que no hay sesiones activas en tablas a migrar
   ```bash
   psql -d gamilit_platform -c "SELECT * FROM pg_stat_activity WHERE datname = 'gamilit_platform';"
   ```
   - [ ] Completado

5. 🟢 Verificar espacio en disco (requiere ~211.1 KB)
   ```bash
   df -h
   ```
   - [ ] Completado

### B. Durante Migración

- 🔴 Nivel 0: Migrar nivel 0 de dependencias (1 objetos)
  - Objetos ejemplo: progress_tracking.user_progress_summary
  - [ ] Completado

- 🟢 Nivel 1: Migrar nivel 1 de dependencias (56 objetos)
  - Objetos ejemplo: auth_management.profiles, auth_management.user_roles, auth_management.memberships, auth_management.auth_attempts, auth_management.user_sessions
  - [ ] Completado

### C. Post-Migración

1. 🔴 **CRÍTICO** Verificar integridad referencial
   ```bash
   psql -d gamilit_platform -c "
SELECT conrelid::regclass AS table_name,
       conname AS constraint_name,
       pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE contype = 'f'
ORDER BY conrelid::regclass::text;"
   ```
   - [ ] Completado

2. 🔴 **CRÍTICO** Verificar RLS policies aplicadas
   ```bash
   psql -d gamilit_platform -c "
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY schemaname, tablename;"
   ```
   - [ ] Completado

3. 🔴 **CRÍTICO** Verificar funciones compiladas sin errores
   ```bash
   psql -d gamilit_platform -c "
SELECT n.nspname as schema, p.proname as function
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
ORDER BY schema, function;"
   ```
   - [ ] Completado

4. 🔴 **CRÍTICO** Ejecutar tests de funcionalidad
   ```bash
   npm test
   ```
   - [ ] Completado

5. 🔴 **CRÍTICO** Verificar seed data cargado correctamente
   ```bash
   psql -d gamilit_platform -c "
SELECT 'modules' as table_name, COUNT(*) FROM educational_content.modules
UNION ALL
SELECT 'achievements', COUNT(*) FROM gamification_system.achievements
UNION ALL
SELECT 'maya_ranks', COUNT(*) FROM gamification_system.maya_ranks;"
   ```
   - [ ] Completado

---

## 7. Objetos Detallados

### Lista Completa de Objetos a Migrar

#### 1. audit_logging.01-audit_logs_indexes.sql

```
Tipo:            INDEX
Nombre:          CONCURRENTLY
Prioridad:       ALTA
Tamaño:          4706 bytes
Líneas:          128
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/audit_logging/indexes/01-audit_logs_indexes.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/audit_logging/index/01-audit_logs_indexes.sql
Tablas Ref:      audit_logging.audit_logs, audit_logs
Funciones Ref:   audit_logging.audit_logs, type, BTREE
Schemas Ref:     audit_logging
RLS:             No
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Indexes for: audit_logging.audit_logs
-- Created: 2025-10-28
-- Description: Índices para optimización de auditoría y búsquedas de logs
-- =====================================================

-- ========================================
-- PERFORMANCE INDEXES - Created 2025-10-28
-- ========================================

-- Index: idx_audit_logs_user_created
-- Purpose: Optimiza búsquedas de auditoría por usuario ordenadas por fecha
```

---

#### 2. audit_logging.01-enable-rls.sql

```
Tipo:            UNKNOWN
Nombre:          None
Prioridad:       ALTA
Tamaño:          1147 bytes
Líneas:          21
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/audit_logging/rls-policies/01-enable-rls.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/audit_logging/rls-policy/01-enable-rls.sql
Schemas Ref:     audit_logging
RLS:             Sí
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Enable RLS for audit_logging tables
-- Created: 2025-10-27
-- Description: Habilita Row Level Security en todas las
--              tablas del schema audit_logging
-- =====================================================

-- Tablas con RLS habilitado
ALTER TABLE audit_logging.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logging.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logging.system_alerts ENABLE ROW L
```

---

#### 3. audit_logging.02-policies.sql

```
Tipo:            RLS POLICY
Nombre:          audit_logs_select_admin
Prioridad:       ALTA
Tamaño:          6549 bytes
Líneas:          166
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/audit_logging/rls-policies/02-policies.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/audit_logging/rls-policy/02-policies.sql
Funciones Ref:   gamilit.get_current_user_id, métricas, gamilit.is_admin
Schemas Ref:     gamilit, audit_logging
RLS:             Sí
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- RLS Policies for audit_logging schema
-- Description: Políticas de seguridad para auditoría y logs
-- Created: 2025-10-27
-- =====================================================

-- =====================================================
-- TABLE: audit_logging.audit_logs
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS audit_logs_select_admin ON audit_logging.audit_logs;
DROP POLI
```

---

#### 4. audit_logging.03-grants.sql

```
Tipo:            UNKNOWN
Nombre:          None
Prioridad:       ALTA
Tamaño:          1138 bytes
Líneas:          27
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/audit_logging/rls-policies/03-grants.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/audit_logging/rls-policy/03-grants.sql
Schemas Ref:     audit_logging
RLS:             No
Grants:          Sí
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Grants and Permissions for audit_logging
-- Created: 2025-10-27
-- Description: Permisos de acceso al schema de auditoría
-- =====================================================

-- Schema permissions
GRANT USAGE ON SCHEMA audit_logging TO gamilit_user;

-- Table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA audit_logging TO gamilit_user;
GRANT TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA audit_loggi
```

---

#### 5. auth_management.05-tenants-rls.sql

```
Tipo:            RLS POLICY
Nombre:          None
Prioridad:       ALTA
Tamaño:          3422 bytes
Líneas:          101
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/rls-policies/05-tenants-rls.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/rls-policy/05-tenants-rls.sql
Tablas Ref:      auth_management.profiles
Funciones Ref:   gamilit.get_current_user_id, gamilit.is_admin, USING
Schemas Ref:     gamilit, auth_management
RLS:             Sí
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- RLS Policies: auth_management.tenants
-- Description: Row Level Security para multi-tenancy
-- Priority: CRITICAL - Multi-tenancy requirement
-- Created: 2025-10-27
-- =====================================================

-- Enable RLS
ALTER TABLE auth_management.tenants ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SELECT Policies
-- =====================================================

-- Po
```

---

#### 6. auth_management.10-user_preferences.sql

```
Tipo:            TABLE
Nombre:          auth_management.user_preferences
Prioridad:       ALTA
Tamaño:          3796 bytes
Líneas:          79
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/tables/10-user_preferences.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/table/10-user_preferences.sql
Tablas Ref:      auth_management.profiles, JSONB, OWNER
Funciones Ref:   gamilit.get_current_user_id, auth_management.profiles, JSON
Schemas Ref:     gamilit, auth_management
RLS:             Sí
Grants:          Sí
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Table: auth_management.user_preferences
-- Description: Preferencias de usuario (tema, idioma, notificaciones, sonido, tutorial)
-- Dependencies: auth_management.profiles
-- Created: 2025-10-28
-- Modified: 2025-10-28
-- =====================================================

SET search_path TO auth_management, public;

DROP TABLE IF EXISTS auth_management.user_preferences CASCADE;

CREATE TABLE IF NOT EXISTS auth_management.user_prefere
```

---

#### 7. educational_content.01-calculate_learning_path.sql

```
Tipo:            FUNCTION
Nombre:          educational_content.calculate_learning_path
Prioridad:       ALTA
Tamaño:          3448 bytes
Líneas:          99
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/educational_content/functions/01-calculate_learning_path.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/educational_content/function/01-calculate_learning_path.sql
Tablas Ref:      progress_tracking.mission_progress, incomplete_missions, gamification_system.user_stats
Funciones Ref:   NUMERIC, VARCHAR, FROM
Schemas Ref:     mi, ur, progress_tracking, educational_content, us, gamification_system, mp, m, i
RLS:             No
Grants:          Sí
```

**Vista previa del contenido:**
```sql
-- Function: educational_content.calculate_learning_path
-- Description: Calcula ruta de aprendizaje personalizada basada en progreso del usuario
-- Parameters:
--   - p_user_id: UUID - ID del usuario
--   - p_max_items: INTEGER - Número máximo de items a retornar (default 5)
-- Returns: TABLE (item_type, item_id, item_name, difficulty_level, estimated_time_minutes, xp_reward, priority_score)
-- Example:
--   SELECT * FROM educational_content.calculate_learning_path('123e4567-e89b-12d3-a456-4266
```

---

#### 8. educational_content.02-get_recommended_missions.sql

```
Tipo:            FUNCTION
Nombre:          educational_content.get_recommended_missions
Prioridad:       ALTA
Tamaño:          2734 bytes
Líneas:          73
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/educational_content/functions/02-get_recommended_missions.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/educational_content/function/02-get_recommended_missions.sql
Tablas Ref:      progress_tracking.mission_progress, educational_content.get_recommended_missions, gamification_system.user_ranks
Funciones Ref:   educational_content.get_recommended_missions, AND, ABS
Schemas Ref:     ur, progress_tracking, educational_content, us, gamification_system, mp, m
RLS:             No
Grants:          Sí
```

**Vista previa del contenido:**
```sql
-- Function: educational_content.get_recommended_missions
-- Description: Obtiene misiones recomendadas basadas en nivel y progreso del usuario
-- Parameters:
--   - p_user_id: UUID - ID del usuario
--   - p_limit: INTEGER - Número de misiones a retornar (default 3)
-- Returns: TABLE (mission_id, mission_title, difficulty_level, xp_reward, ml_coins_reward, estimated_time_minutes, recommendation_reason)
-- Example:
--   SELECT * FROM educational_content.get_recommended_missions('123e4567-e89b-12d
```

---

#### 9. educational_content.02-policies.sql

```
Tipo:            RLS POLICY
Nombre:          exercises_all_admin
Prioridad:       ALTA
Tamaño:          6193 bytes
Líneas:          160
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/educational_content/rls-policies/02-policies.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/educational_content/rls-policy/02-policies.sql
Funciones Ref:   gamilit.get_current_user_id, gamilit.is_admin, AND
Schemas Ref:     gamilit, educational_content
RLS:             Sí
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- RLS Policies for educational_content schema
-- Description: Políticas de seguridad para contenido educativo
-- Created: 2025-10-27
-- =====================================================

-- =====================================================
-- TABLE: educational_content.exercises
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS exercises_all_admin ON educational_content.exerc
```

---

#### 10. educational_content.03-grants.sql

```
Tipo:            UNKNOWN
Nombre:          None
Prioridad:       ALTA
Tamaño:          1208 bytes
Líneas:          26
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/educational_content/rls-policies/03-grants.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/educational_content/rls-policy/03-grants.sql
Schemas Ref:     educational_content
RLS:             No
Grants:          Sí
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Grants and Permissions for educational_content
-- Created: 2025-10-27
-- Description: Permisos de acceso al schema de contenido educativo
-- =====================================================

-- Schema permissions
GRANT USAGE ON SCHEMA educational_content TO gamilit_user;

-- Table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA educational_content TO gamilit_user;
GRANT TRUNCATE, REFERENCES, TRIGGER ON ALL 
```

---

#### 11. gamification_system.02-user_stats_indexes.sql

```
Tipo:            INDEX
Nombre:          CONCURRENTLY
Prioridad:       ALTA
Tamaño:          2720 bytes
Líneas:          78
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamification_system/indexes/02-user_stats_indexes.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/index/02-user_stats_indexes.sql
Tablas Ref:      user_stats, gamification_system.user_stats
Funciones Ref:   gamification_system.user_stats, ROW_NUMBER, Leaderboard
Schemas Ref:     gamification_system
RLS:             No
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Indexes for: gamification_system.user_stats
-- Created: 2025-10-28
-- Description: Índices para optimización de leaderboards y rankings
-- =====================================================

-- ========================================
-- PERFORMANCE INDEXES - Created 2025-10-28
-- ========================================

-- Index: idx_user_stats_xp_desc
-- Purpose: Optimiza queries de leaderboard ordenados por XP
-- Type: BTREE DESC
```

---

#### 12. gamilit.08-update_updated_at.sql

```
Tipo:            FUNCTION
Nombre:          gamilit.update_updated_at
Prioridad:       ALTA
Tamaño:          590 bytes
Líneas:          20
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamilit/functions/08-update_updated_at.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamilit/function/08-update_updated_at.sql
Funciones Ref:   gamilit.update_updated_at, gamilit.now_mexico
Schemas Ref:     gamilit, NEW
RLS:             No
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Function: gamilit.update_updated_at
-- Description: Trigger function to automatically update updated_at field
-- Parameters: None
-- Returns: trigger
-- Created: 2025-10-27
-- =====================================================

CREATE OR REPLACE FUNCTION gamilit.update_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = gamilit.now_mexico();
    RETURN NEW;
END;
$function$;

COMMENT ON FUNCTION ga
```

---

#### 13. progress_tracking.01-user_progress_summary.sql

```
Tipo:            VIEW
Nombre:          progress_tracking.user_progress_summary
Prioridad:       ALTA
Tamaño:          1027 bytes
Líneas:          30
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/progress_tracking/views/01-user_progress_summary.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/view/01-user_progress_summary.sql
Tablas Ref:      gamification_system.user_stats
Schemas Ref:     progress_tracking, gamification_system
RLS:             No
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- View: progress_tracking.user_progress_summary
-- Type: Normal View
-- Description: Vista resumen del progreso del usuario, consolidando estadísticas de gamificación
-- Purpose: Proporciona un resumen completo de las métricas de progreso de cada usuario
-- Created: 2025-10-27
-- =====================================================

DROP VIEW IF EXISTS progress_tracking.user_progress_summary CASCADE;

CREATE VIEW progress_tracking.user_p
```

---

#### 14. progress_tracking.02-get_user_progress_summary.sql

```
Tipo:            FUNCTION
Nombre:          progress_tracking.get_user_progress_summary
Prioridad:       ALTA
Tamaño:          1583 bytes
Líneas:          31
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/progress_tracking/functions/02-get_user_progress_summary.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/function/02-get_user_progress_summary.sql
Tablas Ref:      progress_tracking.exercise_attempts, SUM, progress_tracking.module_progress
Funciones Ref:   FILTER, TABLE, NUMERIC
Schemas Ref:     progress_tracking, mp, ea
RLS:             No
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Function: progress_tracking.get_user_progress_summary
-- Description: Retorna resumen completo de progreso del usuario
-- Parameters: p_user_id uuid
-- Returns: record
-- Created: 2025-10-27
-- =====================================================

CREATE OR REPLACE FUNCTION progress_tracking.get_user_progress_summary(p_user_id uuid)
 RETURNS TABLE(total_modules integer, completed_modules integer, in_progress_modules integer, total_exer
```

---

#### 15. progress_tracking.02-policies.sql

```
Tipo:            RLS POLICY
Nombre:          exercise_attempts_insert_own
Prioridad:       ALTA
Tamaño:          9698 bytes
Líneas:          235
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/progress_tracking/rls-policies/02-policies.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/rls-policy/02-policies.sql
Tablas Ref:      social_features.classroom_members, social_features.classrooms
Funciones Ref:   gamilit.get_current_user_id, gamilit.is_admin, AND
Schemas Ref:     gamilit, progress_tracking, learning_sessions, c, exercise_attempts, module_progress, cm, social_features
RLS:             Sí
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- RLS Policies for progress_tracking schema
-- Description: Políticas de seguridad para seguimiento de progreso
-- Created: 2025-10-27
-- =====================================================

-- =====================================================
-- TABLE: progress_tracking.exercise_attempts
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS exercise_attempts_insert_own ON progress
```

---

#### 16. progress_tracking.03-grants.sql

```
Tipo:            UNKNOWN
Nombre:          None
Prioridad:       ALTA
Tamaño:          1121 bytes
Líneas:          25
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/progress_tracking/rls-policies/03-grants.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/rls-policy/03-grants.sql
Schemas Ref:     progress_tracking
RLS:             No
Grants:          Sí
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Grants and Permissions for progress_tracking
-- Created: 2025-10-27
-- Description: Permisos de acceso al schema de seguimiento de progreso
-- =====================================================

-- Schema permissions
GRANT USAGE ON SCHEMA progress_tracking TO gamilit_user;

-- Table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA progress_tracking TO gamilit_user;
GRANT TRUNCATE, REFERENCES, TRIGGER ON ALL TA
```

---

#### 17. progress_tracking.04-check_mechanic_completion.sql

```
Tipo:            FUNCTION
Nombre:          progress_tracking.check_mechanic_completion
Prioridad:       ALTA
Tamaño:          1921 bytes
Líneas:          56
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/progress_tracking/functions/04-check_mechanic_completion.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/function/04-check_mechanic_completion.sql
Tablas Ref:      educational_content.mechanics, progress_tracking.mechanic_progress, progress_tracking.check_mechanic_completion
Funciones Ref:   TABLE, NUMERIC, progress_tracking.check_mechanic_completion
Schemas Ref:     progress_tracking, educational_content, mp, 0
RLS:             No
Grants:          Sí
```

**Vista previa del contenido:**
```sql
-- Function: progress_tracking.check_mechanic_completion
-- Description: Verifica el estado de completitud de una mecánica para un usuario
-- Parameters:
--   - p_user_id: UUID - ID del usuario
--   - p_mechanic_id: UUID - ID de la mecánica
-- Returns: TABLE (is_completed, completion_percentage, exercises_completed, exercises_total, xp_earned, completed_at)
-- Example:
--   SELECT * FROM progress_tracking.check_mechanic_completion('123e4567-e89b-12d3-a456-426614174000', 'mechanic-uuid');
-- Depe
```

---

#### 18. auth_management.02-user_preferences_indexes.sql

```
Tipo:            INDEX
Nombre:          IF
Prioridad:       BAJA
Tamaño:          1452 bytes
Líneas:          30
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/indexes/02-user_preferences_indexes.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/index/02-user_preferences_indexes.sql
Tablas Ref:      USING, IS, ON
Funciones Ref:   auth_management.user_preferences, GIN, completado
Schemas Ref:     auth_management
RLS:             No
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Indexes: auth_management.user_preferences
-- Description: Índices para optimizar consultas de preferencias de usuario
-- Table: auth_management.user_preferences
-- Created: 2025-10-28
-- =====================================================

-- Index: Preferencias por tema
CREATE INDEX IF NOT EXISTS idx_user_preferences_theme
    ON auth_management.user_preferences(theme);

-- Index: Preferencias por idioma
CREATE INDEX IF NOT EXISTS id
```

---

#### 19. gamification_system.check-mv-freshness.sql

```
Tipo:            UNKNOWN
Nombre:          None
Prioridad:       BAJA
Tamaño:          8066 bytes
Líneas:          277
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamification_system/materialized-views/check-mv-freshness.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/materialized-view/check-mv-freshness.sql
Tablas Ref:      gamification_system.mv_mechanic_leaderboard, pg_stat_user_indexes, gamification_system.mv_global_leaderboard
Funciones Ref:   Distribution, Runs, numeric
Schemas Ref:     freshness, jr, cron, gamification_system, mvs, j
RLS:             No
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- CHECK MATERIALIZED VIEWS FRESHNESS
-- =====================================================
-- Description: Verify when materialized views were last refreshed and their current status
-- Purpose: Monitor data staleness and ensure refresh jobs are running properly
-- Usage: Execute this script to check MV freshness and health
-- Created: 2025-10-28
-- Modified: 2025-10-28
-- =====================================================

\echo ''
```

---

#### 20. gamification_system.rebuild-all-mvs.sql

```
Tipo:            MATERIALIZED VIEW
Nombre:          None
Prioridad:       BAJA
Tamaño:          10472 bytes
Líneas:          299
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamification_system/materialized-views/rebuild-all-mvs.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/materialized-view/rebuild-all-mvs.sql
Tablas Ref:      gamification_system.mv_mechanic_leaderboard, auth_management.profiles, gamification_system.mv_global_leaderboard
Funciones Ref:   OK, gamification_system.mv_mechanic_leaderboard, mv_classroom_leaderboard
Schemas Ref:     sm, ur, progress_tracking, auth_management, p, cron, us, ua, gamification_system, m, cm, social_features, mvs
RLS:             No
Grants:          Sí
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- REBUILD ALL MATERIALIZED VIEWS
-- =====================================================
-- Description: Drop and recreate all materialized views with their indexes
-- Purpose: Complete rebuild when schema changes or major issues occur
-- WARNING: This will temporarily make MVs unavailable during rebuild
-- Usage: Execute only when necessary (schema changes, corruption, major updates)
-- Execution Time: ~30-60 seconds total (depends on d
```

---

#### 21. gamification_system.refresh-all-mvs.sql

```
Tipo:            UNKNOWN
Nombre:          None
Prioridad:       BAJA
Tamaño:          4386 bytes
Líneas:          135
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamification_system/materialized-views/refresh-all-mvs.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/materialized-view/refresh-all-mvs.sql
Tablas Ref:      gamification_system.mv_mechanic_leaderboard, gamification_system.mv_global_leaderboard, gamification_system.mv_classroom_leaderboard
Funciones Ref:   total, needed, Leaderboard
Schemas Ref:     gamification_system, mvs, e
RLS:             No
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- MANUAL REFRESH: All Materialized Views
-- =====================================================
-- Description: Manually refresh all leaderboard materialized views
-- Purpose: On-demand refresh when needed (e.g., after bulk data updates, troubleshooting)
-- Usage: Execute this script when you need to force-refresh all MVs
-- Execution Time: ~10-20 seconds total (depends on data volume)
-- Created: 2025-10-28
-- Modified: 2025-10-28
-- =
```

---

#### 22. audit_logging.01-log_audit_event.sql

```
Tipo:            FUNCTION
Nombre:          audit_logging.log_audit_event
Prioridad:       CRITICA
Tamaño:          1800 bytes
Líneas:          73
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/audit_logging/functions/01-log_audit_event.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/audit_logging/function/01-log_audit_event.sql
Tablas Ref:      auth_management.profiles, user
Funciones Ref:   audit_logging.log_audit_event, uuid_generate_v4, VALUES
Schemas Ref:     auth_management, audit_logging
RLS:             No
Grants:          Sí
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Function: audit_logging.log_audit_event
-- Description: Registra eventos de auditoría en system_logs
-- Priority: CRITICAL - Compliance requirement
-- Created: 2025-10-27
-- =====================================================

CREATE OR REPLACE FUNCTION audit_logging.log_audit_event(
    p_user_id uuid,
    p_action text,
    p_table_name text,
    p_record_id uuid DEFAULT NULL,
    p_old_data jsonb DEFAULT NULL,
    p_new_data jsonb 
```

---

#### 23. auth_management.01-enable-rls.sql

```
Tipo:            UNKNOWN
Nombre:          None
Prioridad:       CRITICA
Tamaño:          2089 bytes
Líneas:          33
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/rls-policies/01-enable-rls.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/rls-policy/01-enable-rls.sql
Funciones Ref:   28
Schemas Ref:     auth_management
RLS:             Sí
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Enable RLS for auth_management tables
-- Created: 2025-10-27
-- Updated: 2025-10-28 (Agent 3 - Comprehensive RLS Integration)
-- Description: Habilita Row Level Security en todas las tablas
--              de gestión de autenticación
-- =====================================================

-- Enable Row Level Security on all auth_management tables
-- Schema: auth_management
-- Tables: 9 tables with RLS protection

ALTER TABLE auth_mana
```

---

#### 24. auth_management.02-policies.sql

```
Tipo:            RLS POLICY
Nombre:          profiles_read_own
Prioridad:       CRITICA
Tamaño:          11826 bytes
Líneas:          305
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/rls-policies/02-policies.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/rls-policy/02-policies.sql
Tablas Ref:      social_features.classroom_members, social_features.classrooms, auth_management.user_roles
Funciones Ref:   0, access, policies
Schemas Ref:     ur, auth_management, social_features, app, cm, c
RLS:             Sí
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- RLS Policies for auth_management schema
-- Description: Políticas de seguridad para gestión de autenticación
-- Created: 2025-10-27
-- Updated: 2025-10-28 (Agent 3 - 18 policies integrated)
-- =====================================================
--
-- Security Strategy:
-- - Multi-tenant isolation via tenant_id
-- - Role-based access (super_admin, admin_teacher, student)
-- - Self-service access for user's own data
-- - Teacher access 
```

---

#### 25. auth_management.02-profiles.sql

```
Tipo:            TABLE
Nombre:          auth_management.profiles
Prioridad:       CRITICA
Tamaño:          4386 bytes
Líneas:          94
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/tables/02-profiles.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/table/02-profiles.sql
Tablas Ref:      auth.users, jsonb, auth_management.tenants
Funciones Ref:   gamilit.initialize_user_stats, gamilit.get_current_user_id, auth_management.profiles
Schemas Ref:     gamilit, auth_management, auth, 9
RLS:             Sí
Grants:          Sí
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Table: auth_management.profiles
-- Description: Perfiles de usuario con información básica, rol y configuraciones
-- Dependencies: auth_management.tenants, auth.users
-- Created: 2025-10-27
-- =====================================================

SET search_path TO auth_management, public;

DROP TABLE IF EXISTS auth_management.profiles CASCADE;

CREATE TABLE auth_management.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
   
```

---

#### 26. auth_management.03-grants.sql

```
Tipo:            UNKNOWN
Nombre:          None
Prioridad:       CRITICA
Tamaño:          1632 bytes
Líneas:          33
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/rls-policies/03-grants.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/rls-policy/03-grants.sql
Funciones Ref:   profiles
Schemas Ref:     auth_management
RLS:             No
Grants:          Sí
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Grants and Permissions for auth_management
-- Created: 2025-10-27
-- Description: Permisos de acceso al schema de autenticación
-- =====================================================

-- Schema permissions
GRANT USAGE ON SCHEMA auth_management TO gamilit_user;

-- Table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA auth_management TO gamilit_user;
GRANT TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA a
```

---

#### 27. auth_management.03-user_roles.sql

```
Tipo:            TABLE
Nombre:          auth_management.user_roles
Prioridad:       CRITICA
Tamaño:          2475 bytes
Líneas:          55
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/tables/03-user_roles.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/table/03-user_roles.sql
Tablas Ref:      auth_management.profiles, auth_management.tenants
Funciones Ref:   auth_management.profiles, auth_management.tenants, gen_random_uuid
Schemas Ref:     gamilit, auth_management
RLS:             No
Grants:          Sí
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Table: auth_management.user_roles
-- Description: Asignaciones de roles a usuarios con permisos específicos
-- Dependencies: auth_management.profiles, auth_management.tenants
-- Created: 2025-10-27
-- =====================================================

SET search_path TO auth_management, public;

DROP TABLE IF EXISTS auth_management.user_roles CASCADE;

CREATE TABLE auth_management.user_roles (
    id uuid DEFAULT gen_random_uuid() N
```

---

#### 28. auth_management.04-memberships.sql

```
Tipo:            TABLE
Nombre:          auth_management.memberships
Prioridad:       CRITICA
Tamaño:          2866 bytes
Líneas:          60
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/tables/04-memberships.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/table/04-memberships.sql
Tablas Ref:      auth_management.tenants, auth_management.profiles
Funciones Ref:   auth_management.memberships, auth_management.tenants, gen_random_uuid
Schemas Ref:     gamilit, auth_management
RLS:             No
Grants:          Sí
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Table: auth_management.memberships
-- Description: Relaciones usuario-tenant con permisos y restricciones
-- Dependencies: auth_management.profiles, auth_management.tenants
-- Created: 2025-10-27
-- =====================================================

SET search_path TO auth_management, public;

DROP TABLE IF EXISTS auth_management.memberships CASCADE;

CREATE TABLE auth_management.memberships (
    id uuid DEFAULT gen_random_uuid() N
```

---

#### 29. auth_management.04-user_roles-rls.sql

```
Tipo:            RLS POLICY
Nombre:          None
Prioridad:       CRITICA
Tamaño:          3222 bytes
Líneas:          93
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/rls-policies/04-user_roles-rls.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/rls-policy/04-user_roles-rls.sql
Tablas Ref:      auth_management.profiles
Funciones Ref:   gamilit.get_current_user_id, gamilit.is_admin, AND
Schemas Ref:     gamilit, auth_management
RLS:             Sí
Grants:          Sí
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- RLS Policies: auth_management.user_roles
-- Description: Row Level Security para proteger roles de usuario
-- Priority: CRITICAL - Security requirement
-- Created: 2025-10-27
-- =====================================================

-- Enable RLS
ALTER TABLE auth_management.user_roles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SELECT Policies
-- ===============================================
```

---

#### 30. auth_management.05-auth_attempts.sql

```
Tipo:            TABLE
Nombre:          auth_management.auth_attempts
Prioridad:       CRITICA
Tamaño:          1870 bytes
Líneas:          41
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/tables/05-auth_attempts.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/table/05-auth_attempts.sql
Funciones Ref:   gen_random_uuid, btree, None
Schemas Ref:     gamilit, auth_management
RLS:             No
Grants:          Sí
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Table: auth_management.auth_attempts
-- Description: Registro de intentos de autenticación para seguridad y auditoría
-- Dependencies: None (tabla de auditoría independiente)
-- Created: 2025-10-27
-- =====================================================

SET search_path TO auth_management, public;

DROP TABLE IF EXISTS auth_management.auth_attempts CASCADE;

CREATE TABLE auth_management.auth_attempts (
    id uuid DEFAULT gen_random_uu
```

---

#### 31. auth_management.06-user_has_permission.sql

```
Tipo:            FUNCTION
Nombre:          auth_management.user_has_permission
Prioridad:       CRITICA
Tamaño:          1304 bytes
Líneas:          45
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/functions/06-user_has_permission.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/function/06-user_has_permission.sql
Tablas Ref:      auth_management.user_roles
Funciones Ref:   auth_management.user_has_permission, gamilit.is_super_admin, EXISTS
Schemas Ref:     gamilit, auth_management, ur
RLS:             No
Grants:          Sí
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Function: auth_management.user_has_permission
-- Description: Verifica si un usuario tiene un permiso específico
-- Priority: CRITICAL - Authorization requirement
-- Created: 2025-10-27
-- =====================================================

CREATE OR REPLACE FUNCTION auth_management.user_has_permission(
    p_user_id uuid,
    p_permission text
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    v_has_permiss
```

---

#### 32. auth_management.06-user_sessions.sql

```
Tipo:            TABLE
Nombre:          auth_management.user_sessions
Prioridad:       CRITICA
Tamaño:          2771 bytes
Líneas:          60
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/tables/06-user_sessions.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/table/06-user_sessions.sql
Tablas Ref:      auth_management.tenants, auth_management.profiles
Funciones Ref:   auth_management.tenants, auth_management.profiles, gen_random_uuid
Schemas Ref:     gamilit, auth_management
RLS:             No
Grants:          Sí
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Table: auth_management.user_sessions
-- Description: Sesiones activas de usuarios con información de dispositivo y ubicación
-- Dependencies: auth_management.profiles, auth_management.tenants
-- Created: 2025-10-27
-- =====================================================

SET search_path TO auth_management, public;

DROP TABLE IF EXISTS auth_management.user_sessions CASCADE;

CREATE TABLE auth_management.user_sessions (
    id uuid DEFA
```

---

#### 33. auth_management.07-email_verification_tokens.sql

```
Tipo:            TABLE
Nombre:          auth_management.email_verification_tokens
Prioridad:       CRITICA
Tamaño:          1934 bytes
Líneas:          43
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/tables/07-email_verification_tokens.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/table/07-email_verification_tokens.sql
Tablas Ref:      auth.users
Funciones Ref:   gen_random_uuid, UNIQUE, btree
Schemas Ref:     auth_management, auth
RLS:             No
Grants:          Sí
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Table: auth_management.email_verification_tokens
-- Description: Almacena tokens de verificación de email para registro de nuevos usuarios
-- Dependencies: auth.users
-- Created: 2025-10-27
-- =====================================================

SET search_path TO auth_management, public;

DROP TABLE IF EXISTS auth_management.email_verification_tokens CASCADE;

CREATE TABLE auth_management.email_verification_tokens (
    id uuid DEFAU
```

---

#### 34. auth_management.07-get_user_role.sql

```
Tipo:            FUNCTION
Nombre:          auth_management.get_user_role
Prioridad:       CRITICA
Tamaño:          1389 bytes
Líneas:          47
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/functions/07-get_user_role.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/function/07-get_user_role.sql
Tablas Ref:      auth_management.user_roles
Funciones Ref:   gamilit.get_current_user_id, role, auth_management.get_user_role
Schemas Ref:     gamilit, auth_management
RLS:             No
Grants:          Sí
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Function: auth_management.get_user_role
-- Description: Obtiene el rol más privilegiado de un usuario
-- Priority: CRITICAL - RLS policies dependency
-- Created: 2025-10-27
-- =====================================================

CREATE OR REPLACE FUNCTION auth_management.get_user_role(p_user_id uuid DEFAULT NULL)
RETURNS gamilit_role
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
    v_role gamilit_role;
    v_user_id uuid;
BE
```

---

#### 35. auth_management.08-assign_role_to_user.sql

```
Tipo:            FUNCTION
Nombre:          auth_management.assign_role_to_user
Prioridad:       CRITICA
Tamaño:          2488 bytes
Líneas:          100
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/functions/08-assign_role_to_user.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/function/08-assign_role_to_user.sql
Tablas Ref:      auth_management.profiles, auth_management.user_roles
Funciones Ref:   gamilit.get_current_user_id, auth_management.user_roles, audit_logging.log_audit_event
Schemas Ref:     gamilit, auth_management, audit_logging
RLS:             No
Grants:          Sí
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Function: auth_management.assign_role_to_user
-- Description: Asigna un rol a un usuario con validaciones
-- Priority: HIGH - Role management
-- Created: 2025-10-27
-- =====================================================

CREATE OR REPLACE FUNCTION auth_management.assign_role_to_user(
    p_user_id uuid,
    p_role gamilit_role,
    p_permissions jsonb DEFAULT '{}'::jsonb,
    p_assigned_by uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plp
```

---

#### 36. auth_management.08-password_reset_tokens.sql

```
Tipo:            TABLE
Nombre:          auth_management.password_reset_tokens
Prioridad:       CRITICA
Tamaño:          1942 bytes
Líneas:          44
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/tables/08-password_reset_tokens.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/table/08-password_reset_tokens.sql
Tablas Ref:      auth.users
Funciones Ref:   gen_random_uuid, UNIQUE, btree
Schemas Ref:     auth_management, auth
RLS:             No
Grants:          Sí
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Table: auth_management.password_reset_tokens
-- Description: Almacena tokens de restablecimiento de contraseña para recuperación de usuario
-- Dependencies: auth.users
-- Created: 2025-10-27
-- =====================================================

SET search_path TO auth_management, public;

DROP TABLE IF EXISTS auth_management.password_reset_tokens CASCADE;

CREATE TABLE auth_management.password_reset_tokens (
    id uuid DEFAULT gen_
```

---

#### 37. auth_management.09-revoke_role_from_user.sql

```
Tipo:            FUNCTION
Nombre:          auth_management.revoke_role_from_user
Prioridad:       CRITICA
Tamaño:          2312 bytes
Líneas:          81
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/functions/09-revoke_role_from_user.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/function/09-revoke_role_from_user.sql
Tablas Ref:      auth_management.user_roles
Funciones Ref:   gamilit.get_current_user_id, to_jsonb, audit_logging.log_audit_event
Schemas Ref:     gamilit, auth_management, audit_logging
RLS:             No
Grants:          Sí
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Function: auth_management.revoke_role_from_user
-- Description: Revoca un rol de un usuario con validaciones
-- Priority: HIGH - Role management
-- Created: 2025-10-27
-- =====================================================

CREATE OR REPLACE FUNCTION auth_management.revoke_role_from_user(
    p_user_id uuid,
    p_role gamilit_role,
    p_revoked_by uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  
```

---

#### 38. auth_management.09-security_events.sql

```
Tipo:            TABLE
Nombre:          auth_management.security_events
Prioridad:       CRITICA
Tamaño:          2283 bytes
Líneas:          48
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/tables/09-security_events.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/table/09-security_events.sql
Tablas Ref:      auth.users
Funciones Ref:   gen_random_uuid, event, ANY
Schemas Ref:     auth_management, auth, e
RLS:             No
Grants:          Sí
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Table: auth_management.security_events
-- Description: Log de auditoría para eventos relacionados con seguridad
-- Dependencies: auth.users (opcional, puede ser NULL)
-- Created: 2025-10-27
-- =====================================================

SET search_path TO auth_management, public;

DROP TABLE IF EXISTS auth_management.security_events CASCADE;

CREATE TABLE auth_management.security_events (
    id uuid DEFAULT gen_random_uuid()
```

---

#### 39. gamification_system.01-award_ml_coins.sql

```
Tipo:            FUNCTION
Nombre:          gamification_system.award_ml_coins
Prioridad:       CRITICA
Tamaño:          3164 bytes
Líneas:          90
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamification_system/functions/01-award_ml_coins.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/function/01-award_ml_coins.sql
Tablas Ref:      gamification_system.user_stats, gamification_system.user_ranks
Funciones Ref:   gamification_system.award_ml_coins, jsonb_build_object, gamification_system.ml_coins_transactions
Schemas Ref:     gamilit, gamification_system, 1, 2
RLS:             No
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Function: gamification_system.award_ml_coins
-- Description: Otorga ML Coins al usuario aplicando multiplicador de rango basado en current_rank y registra la transacción
-- Parameters: p_user_id uuid, p_amount integer, p_transaction_type text, p_description text, p_reference_id uuid, p_reference_type text
-- Returns: uuid
-- Created: 2025-10-27
-- =====================================================

CREATE OR REPLACE FUNCTION gamifica
```

---

#### 40. gamification_system.02-calculate_level_from_xp.sql

```
Tipo:            FUNCTION
Nombre:          gamification_system.calculate_level_from_xp
Prioridad:       CRITICA
Tamaño:          659 bytes
Líneas:          20
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamification_system/functions/02-calculate_level_from_xp.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/function/02-calculate_level_from_xp.sql
Funciones Ref:   FLOOR, gamification_system.calculate_level_from_xp, SQRT
Schemas Ref:     gamification_system, 100
RLS:             No
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Function: gamification_system.calculate_level_from_xp
-- Description: Calcula el nivel del usuario basado en XP total
-- Parameters: p_xp integer
-- Returns: integer
-- Created: 2025-10-27
-- =====================================================

CREATE OR REPLACE FUNCTION gamification_system.calculate_level_from_xp(p_xp integer)
 RETURNS integer
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
    RETURN FLOOR(SQRT(p_xp::numeric / 100.
```

---

#### 41. gamification_system.03-calculate_xp_for_next_level.sql

```
Tipo:            FUNCTION
Nombre:          gamification_system.calculate_xp_for_next_level
Prioridad:       CRITICA
Tamaño:          775 bytes
Líneas:          20
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamification_system/functions/03-calculate_xp_for_next_level.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/function/03-calculate_xp_for_next_level.sql
Funciones Ref:   RETURN, gamification_system.calculate_xp_for_next_level
Schemas Ref:     gamification_system
RLS:             No
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Function: gamification_system.calculate_xp_for_next_level
-- Description: Calcula XP necesaria para alcanzar el siguiente nivel
-- Parameters: p_current_level integer
-- Returns: integer
-- Created: 2025-10-27
-- =====================================================

CREATE OR REPLACE FUNCTION gamification_system.calculate_xp_for_next_level(p_current_level integer)
 RETURNS integer
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
    RE
```

---

#### 42. gamification_system.04-get_user_rank_requirements.sql

```
Tipo:            FUNCTION
Nombre:          gamification_system.get_user_rank_requirements
Prioridad:       CRITICA
Tamaño:          1785 bytes
Líneas:          49
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamification_system/functions/04-get_user_rank_requirements.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/function/04-get_user_rank_requirements.sql
Funciones Ref:   TABLE, gamification_system.get_user_rank_requirements
Schemas Ref:     gamification_system
RLS:             No
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Function: gamification_system.get_user_rank_requirements
-- Description: Obtiene requisitos para el siguiente rango maya
-- Parameters: p_current_rank rango_maya
-- Returns: record
-- Created: 2025-10-27
-- =====================================================

CREATE OR REPLACE FUNCTION gamification_system.get_user_rank_requirements(p_current_rank rango_maya)
 RETURNS TABLE(next_rank rango_maya, modules_required integer, xp_required in
```

---

#### 43. gamification_system.05-spend_ml_coins.sql

```
Tipo:            FUNCTION
Nombre:          gamification_system.spend_ml_coins
Prioridad:       CRITICA
Tamaño:          2278 bytes
Líneas:          65
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamification_system/functions/05-spend_ml_coins.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/function/05-spend_ml_coins.sql
Tablas Ref:      gamification_system.user_stats
Funciones Ref:   gamification_system.ml_coins_transactions, gamilit.now_mexico, VALUES
Schemas Ref:     gamilit, gamification_system
RLS:             No
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Function: gamification_system.spend_ml_coins
-- Description: Gasta ML Coins con validación de fondos suficientes
-- Parameters: p_user_id uuid, p_amount integer, p_transaction_type text, p_description text, p_reference_id uuid, p_reference_type text
-- Returns: uuid
-- Created: 2025-10-27
-- =====================================================

CREATE OR REPLACE FUNCTION gamification_system.spend_ml_coins(p_user_id uuid, p_amount integ
```

---

#### 44. gamilit.10-update_user_stats_on_exercise_complete.sql

```
Tipo:            FUNCTION
Nombre:          gamilit.update_user_stats_on_exercise_complete
Prioridad:       CRITICA
Tamaño:          1361 bytes
Líneas:          35
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamilit/functions/10-update_user_stats_on_exercise_complete.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamilit/function/10-update_user_stats_on_exercise_complete.sql
Funciones Ref:   gamilit.update_user_stats_on_exercise_complete, gamilit.now_mexico
Schemas Ref:     gamilit, gamification_system, NEW
RLS:             No
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Function: gamilit.update_user_stats_on_exercise_complete
-- Description: Actualiza estadísticas de usuario al completar un ejercicio
-- Parameters: None
-- Returns: trigger
-- Created: 2025-10-27
-- =====================================================

CREATE OR REPLACE FUNCTION gamilit.update_user_stats_on_exercise_complete()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- ALWAYS update stats, regardless of is_correct st
```

---

#### 45. progress_tracking.06-grant_mission_completion_rewards.sql

```
Tipo:            FUNCTION
Nombre:          progress_tracking.grant_mission_completion_rewards
Prioridad:       CRITICA
Tamaño:          3107 bytes
Líneas:          92
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/progress_tracking/functions/06-grant_mission_completion_rewards.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/function/06-grant_mission_completion_rewards.sql
Tablas Ref:      gamification_system.calculate_mission_reward, progress_tracking.grant_mission_completion_rewards, gamification_system.check_and_grant_achievements
Funciones Ref:   gamification_system.calculate_mission_reward, GREATEST, jsonb_build_object
Schemas Ref:     progress_tracking, educational_content, gamification_system, v_mission
RLS:             No
Grants:          Sí
```

**Vista previa del contenido:**
```sql
-- Function: progress_tracking.grant_mission_completion_rewards
-- Description: Otorga todas las recompensas y procesa logros al completar una misión
-- Parameters:
--   - p_user_id: UUID - ID del usuario
--   - p_mission_id: UUID - ID de la misión completada
-- Returns: TABLE (xp_granted, coins_granted, achievements_unlocked, level_ups)
-- Example:
--   SELECT * FROM progress_tracking.grant_mission_completion_rewards('123e4567-e89b-12d3-a456-426614174000', 'mission-uuid');
-- Dependencies: educ
```

---

#### 46. social_features.01-schools.sql

```
Tipo:            TABLE
Nombre:          social_features.schools
Prioridad:       CRITICA
Tamaño:          4301 bytes
Líneas:          152
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/social_features/tables/01-schools.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/table/01-schools.sql
Tablas Ref:      auth_management.profiles, auth_management.tenants, database
Funciones Ref:   auth_management.profiles, auth_management.tenants, gen_random_uuid
Schemas Ref:     gamilit, 16, auth_management, 0ubuntu0, 04, social_features
RLS:             No
Grants:          Sí
```

**Vista previa del contenido:**
```sql
--
-- PostgreSQL database dump
--

\restrict p4E1DqUh5koUE2iTbc2LIFCSCHDZpMxCLEZPFQ9jBCzdpiS4oKm6NR3zMLa9yfp

-- Dumped from database version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
```

---

#### 47. social_features.02-classrooms.sql

```
Tipo:            TABLE
Nombre:          social_features.classrooms
Prioridad:       CRITICA
Tamaño:          5563 bytes
Líneas:          185
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/social_features/tables/02-classrooms.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/table/02-classrooms.sql
Tablas Ref:      auth_management.profiles, auth_management.tenants, social_features.classroom_members
Funciones Ref:   gamilit.get_current_user_id, auth_management.profiles, auth_management.tenants
Schemas Ref:     gamilit, 16, auth_management, 0ubuntu0, 04, cm, social_features, classrooms
RLS:             Sí
Grants:          Sí
```

**Vista previa del contenido:**
```sql
--
-- PostgreSQL database dump
--

\restrict ZWD7eFxolIbKXGLzhJpg7Jv7hW0TpZdh1eZz5KcK03ZFR7rvI6uxDA0OQKUNhBq

-- Dumped from database version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
```

---

#### 48. social_features.03-classroom_members.sql

```
Tipo:            TABLE
Nombre:          social_features.classroom_members
Prioridad:       CRITICA
Tamaño:          6763 bytes
Líneas:          190
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/social_features/tables/03-classroom_members.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/table/03-classroom_members.sql
Tablas Ref:      social_features.classrooms, database, auth_management.profiles
Funciones Ref:   numeric, gamilit.is_admin, gamilit.update_classroom_member_count
Schemas Ref:     gamilit, 16, auth_management, social_features, 0ubuntu0, 04, c, classroom_members
RLS:             Sí
Grants:          Sí
```

**Vista previa del contenido:**
```sql
--
-- PostgreSQL database dump
--

\restrict h626hMccX4FrcHg534sgHNHX1gB7MAZU3xaXXGSCb4qU45zKGpTSaKSBKga7wQe

-- Dumped from database version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
```

---

#### 49. social_features.04-teams.sql

```
Tipo:            TABLE
Nombre:          social_features.teams
Prioridad:       CRITICA
Tamaño:          5192 bytes
Líneas:          181
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/social_features/tables/04-teams.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/table/04-teams.sql
Tablas Ref:      social_features.classrooms, auth_management.tenants, auth_management.profiles
Funciones Ref:   auth_management.profiles, auth_management.tenants, gen_random_uuid
Schemas Ref:     gamilit, 16, auth_management, 0ubuntu0, 04, social_features
RLS:             Sí
Grants:          Sí
```

**Vista previa del contenido:**
```sql
--
-- PostgreSQL database dump
--

\restrict AVkh11wxJU1xQZUEkt14ZM1e1ddrRBjX1z3ynl1VDfHzdppS7VfgyOAgbp1BFzT

-- Dumped from database version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
```

---

#### 50. social_features.05-team_members.sql

```
Tipo:            TABLE
Nombre:          social_features.team_members
Prioridad:       CRITICA
Tamaño:          3394 bytes
Líneas:          115
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/social_features/tables/05-team_members.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/table/05-team_members.sql
Tablas Ref:      auth.users, social_features.teams, database
Funciones Ref:   gen_random_uuid, UNIQUE, ANY
Schemas Ref:     gamilit, 16, auth, 0ubuntu0, 04, social_features
RLS:             No
Grants:          Sí
```

**Vista previa del contenido:**
```sql
--
-- PostgreSQL database dump
--

\restrict FDdTzV8JI3U2pNHSEoCOcHtwue30lpFka1CJNnE1gaO6JblfcZpED1nCnhyvqLa

-- Dumped from database version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
```

---

#### 51. auth.01-auth-helpers.sql

```
Tipo:            FUNCTION
Nombre:          auth.get_current_user_id
Prioridad:       MEDIA
Tamaño:          5426 bytes
Líneas:          169
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth/functions/01-auth-helpers.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth/function/01-auth-helpers.sql
Tablas Ref:      session, auth_management.user_roles
Funciones Ref:   auth.get_current_user_id, auth.is_student, auth.is_admin
Schemas Ref:     app, auth, auth_management
RLS:             No
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Auth Helper Functions for RLS Policies
-- Created: 2025-10-28
-- Description: Helper functions to retrieve current user context
--              Used by RLS policies across all schemas
-- =====================================================
--
-- These functions provide a consistent interface for RLS policies
-- to access current user authentication context via application
-- settings (app.current_user_id, app.current_tenant_id, etc.)
-
```

---

#### 52. auth_management.01-idx_user_roles_permissions_gin.sql

```
Tipo:            INDEX
Nombre:          IF
Prioridad:       MEDIA
Tamaño:          950 bytes
Líneas:          27
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/indexes/01-idx_user_roles_permissions_gin.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/index/01-idx_user_roles_permissions_gin.sql
Tablas Ref:      auth_management.user_roles
Funciones Ref:   permissions, GIN, permission
Schemas Ref:     auth_management
RLS:             No
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- GIN Index: idx_user_roles_permissions_gin
-- Table: auth_management.user_roles
-- Column: permissions (JSONB)
-- Description: Índice GIN para búsqueda eficiente de permisos específicos
-- Priority: HIGH - Performance optimization
-- Created: 2025-10-27
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_user_roles_permissions_gin
ON auth_management.user_roles
USING GIN (permissions jsonb_path_ops);


```

---

#### 53. auth_management.01-user_sessions_indexes.sql

```
Tipo:            INDEX
Nombre:          CONCURRENTLY
Prioridad:       MEDIA
Tamaño:          4077 bytes
Líneas:          125
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/auth_management/indexes/01-user_sessions_indexes.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/auth_management/index/01-user_sessions_indexes.sql
Tablas Ref:      auth_management.user_sessions, user_sessions
Funciones Ref:   Index, periódico, auth_management.user_sessions
Schemas Ref:     auth_management
RLS:             No
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Indexes for: auth_management.user_sessions
-- Created: 2025-10-28
-- Description: Índices para optimización de gestión de sesiones activas
-- =====================================================

-- ========================================
-- PARTIAL INDEXES - Created 2025-10-28
-- ========================================

-- Index: idx_user_sessions_active
-- Purpose: Optimiza búsquedas de sesiones activas por usuario
-- Type: BTREE P
```

---

#### 54. content_management.01-enable-rls.sql

```
Tipo:            UNKNOWN
Nombre:          None
Prioridad:       MEDIA
Tamaño:          879 bytes
Líneas:          17
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/content_management/rls-policies/01-enable-rls.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/content_management/rls-policy/01-enable-rls.sql
Schemas Ref:     content_management
RLS:             Sí
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Enable RLS for content_management tables
-- Created: 2025-10-27
-- Description: Habilita Row Level Security en todas las
--              tablas del schema content_management
-- =====================================================

-- Tablas con RLS habilitado
ALTER TABLE content_management.content_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_management.marie_curie_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_manag
```

---

#### 55. content_management.02-policies.sql

```
Tipo:            RLS POLICY
Nombre:          marie_content_all_admin
Prioridad:       MEDIA
Tamaño:          4747 bytes
Líneas:          119
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/content_management/rls-policies/02-policies.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/content_management/rls-policy/02-policies.sql
Funciones Ref:   gamilit.get_current_user_id, gamilit.is_admin, gamilit.get_current_user_role
Schemas Ref:     gamilit, content_management
RLS:             Sí
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- RLS Policies for content_management schema
-- Description: Políticas de seguridad para contenido Marie Curie
-- Created: 2025-10-27
-- =====================================================

-- =====================================================
-- TABLE: content_management.marie_curie_content
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS marie_content_all_admin ON content_man
```

---

#### 56. content_management.03-grants.sql

```
Tipo:            UNKNOWN
Nombre:          None
Prioridad:       MEDIA
Tamaño:          1119 bytes
Líneas:          25
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/content_management/rls-policies/03-grants.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/content_management/rls-policy/03-grants.sql
Schemas Ref:     content_management
RLS:             No
Grants:          Sí
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Grants and Permissions for content_management
-- Created: 2025-10-27
-- Description: Permisos de acceso al schema de gestión de contenido
-- =====================================================

-- Schema permissions
GRANT USAGE ON SCHEMA content_management TO gamilit_user;

-- Table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA content_management TO gamilit_user;
GRANT TRUNCATE, REFERENCES, TRIGGER ON ALL TA
```

---

#### 57. gamification_system.02-achievement_categories_indexes.sql

```
Tipo:            INDEX
Nombre:          IF
Prioridad:       MEDIA
Tamaño:          1225 bytes
Líneas:          25
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamification_system/indexes/02-achievement_categories_indexes.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/index/02-achievement_categories_indexes.sql
Funciones Ref:   gamification_system.achievement_categories
Schemas Ref:     gamification_system
RLS:             No
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Indexes: gamification_system.achievement_categories
-- Description: Índices para optimizar consultas de categorías de logros
-- Table: gamification_system.achievement_categories
-- Created: 2025-10-28
-- =====================================================

-- Index: Categorías activas
CREATE INDEX IF NOT EXISTS idx_achievement_categories_active
    ON gamification_system.achievement_categories(is_active)
    WHERE is_active = true;

-
```

---

#### 58. gamification_system.03-active_boosts_indexes.sql

```
Tipo:            INDEX
Nombre:          IF
Prioridad:       MEDIA
Tamaño:          1756 bytes
Líneas:          37
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamification_system/indexes/03-active_boosts_indexes.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/index/03-active_boosts_indexes.sql
Funciones Ref:   expiración, gamification_system.active_boosts, tipo
Schemas Ref:     gamification_system
RLS:             No
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Indexes: gamification_system.active_boosts
-- Description: Índices para optimizar consultas de boosts activos
-- Table: gamification_system.active_boosts
-- Created: 2025-10-28
-- =====================================================

-- Index: Boosts por usuario
CREATE INDEX IF NOT EXISTS idx_active_boosts_user
    ON gamification_system.active_boosts(user_id);

-- Index: Boosts por fecha de expiración (solo activos)
CREATE INDEX IF NO
```

---

#### 59. gamification_system.03-notifications_indexes.sql

```
Tipo:            INDEX
Nombre:          CONCURRENTLY
Prioridad:       MEDIA
Tamaño:          2055 bytes
Líneas:          56
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamification_system/indexes/03-notifications_indexes.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/index/03-notifications_indexes.sql
Tablas Ref:      gamification_system.notifications, notifications
Funciones Ref:   Index, leídas, usuario
Schemas Ref:     gamification_system
RLS:             No
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Indexes for: gamification_system.notifications
-- Created: 2025-10-28
-- Description: Índices para optimización de consultas de notificaciones
-- =====================================================

-- ========================================
-- PARTIAL INDEXES - Created 2025-10-28
-- ========================================

-- Index: idx_notifications_user_unread
-- Purpose: Optimiza queries de notificaciones no leídas por usuario
-
```

---

#### 60. gamification_system.04-inventory_transactions_indexes.sql

```
Tipo:            INDEX
Nombre:          IF
Prioridad:       MEDIA
Tamaño:          2130 bytes
Líneas:          39
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamification_system/indexes/04-inventory_transactions_indexes.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/index/04-inventory_transactions_indexes.sql
Funciones Ref:   JSON, gamification_system.inventory_transactions, item
Schemas Ref:     gamification_system
RLS:             No
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Indexes: gamification_system.inventory_transactions
-- Description: Índices para optimizar consultas de transacciones de inventario
-- Table: gamification_system.inventory_transactions
-- Created: 2025-10-28
-- =====================================================

-- Index: Transacciones por usuario
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_user
    ON gamification_system.inventory_transactions(user_id);

-- Index: Transacc
```

---

#### 61. gamification_system.99-refresh-schedule.sql

```
Tipo:            UNKNOWN
Nombre:          None
Prioridad:       MEDIA
Tamaño:          6931 bytes
Líneas:          192
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamification_system/materialized-views/99-refresh-schedule.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamification_system/materialized-view/99-refresh-schedule.sql
Tablas Ref:      cron.job, cron.job_run_details, pg_available_extensions
Funciones Ref:   Medium, schedule, cron.unschedule
Schemas Ref:     gamification_system, cron
RLS:             No
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- MATERIALIZED VIEWS REFRESH SCHEDULE
-- =====================================================
-- Description: Automatic refresh configuration for all materialized views using pg_cron
-- Purpose: Maintain data freshness in materialized views without manual intervention
-- Requirements: pg_cron extension must be installed
-- Installation: CREATE EXTENSION IF NOT EXISTS pg_cron;
-- System Requirements:
--   - PostgreSQL 12+
--   - pg_cron e
```

---

#### 62. gamilit.06-is_super_admin.sql

```
Tipo:            FUNCTION
Nombre:          gamilit.is_super_admin
Prioridad:       MEDIA
Tamaño:          633 bytes
Líneas:          22
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamilit/functions/06-is_super_admin.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamilit/function/06-is_super_admin.sql
Funciones Ref:   gamilit.is_super_admin, gamilit.get_current_user_role
Schemas Ref:     gamilit
RLS:             No
Grants:          Sí
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Function: gamilit.is_super_admin
-- Description: Verifica si el usuario actual es super_admin
-- Parameters: None
-- Returns: boolean
-- Created: 2025-10-28
-- =====================================================

CREATE OR REPLACE FUNCTION gamilit.is_super_admin()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
    RETURN gamilit.get_current_user_role() = 'super_admin';
END;
$function$;

COMMENT ON FUNCTION gamilit.is_s
```

---

#### 63. gamilit.06-now_mexico.sql

```
Tipo:            FUNCTION
Nombre:          gamilit.now_mexico
Prioridad:       MEDIA
Tamaño:          638 bytes
Líneas:          20
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamilit/functions/06-now_mexico.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamilit/function/06-now_mexico.sql
Funciones Ref:   gamilit.now_mexico, México
Schemas Ref:     gamilit
RLS:             No
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Function: gamilit.now_mexico
-- Description: Retorna timestamp actual en zona horaria de México (America/Mexico_City)
-- Parameters: None
-- Returns: timestamp with time zone
-- Created: 2025-10-27
-- =====================================================

CREATE OR REPLACE FUNCTION gamilit.now_mexico()
 RETURNS timestamp with time zone
 LANGUAGE plpgsql
 IMMUTABLE
AS $function$
BEGIN
    RETURN NOW() AT TIME ZONE 'America/Mexico_City';

```

---

#### 64. gamilit.07-update_classroom_member_count.sql

```
Tipo:            FUNCTION
Nombre:          gamilit.update_classroom_member_count
Prioridad:       MEDIA
Tamaño:          994 bytes
Líneas:          33
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/gamilit/functions/07-update_classroom_member_count.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/gamilit/function/07-update_classroom_member_count.sql
Funciones Ref:   gamilit.update_classroom_member_count, GREATEST
Schemas Ref:     gamilit, NEW, social_features, OLD
RLS:             No
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Function: gamilit.update_classroom_member_count
-- Description: Actualiza contador de miembros en aulas
-- Parameters: None
-- Returns: trigger
-- Created: 2025-10-27
-- =====================================================

CREATE OR REPLACE FUNCTION gamilit.update_classroom_member_count()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE social_features.classrooms
        SET current_st
```

---

#### 65. progress_tracking.01-scheduled_missions_indexes.sql

```
Tipo:            INDEX
Nombre:          IF
Prioridad:       MEDIA
Tamaño:          2187 bytes
Líneas:          42
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/progress_tracking/indexes/01-scheduled_missions_indexes.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/index/01-scheduled_missions_indexes.sql
Funciones Ref:   progress_tracking.scheduled_missions, fechas
Schemas Ref:     progress_tracking
RLS:             No
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Indexes: progress_tracking.scheduled_missions
-- Description: Índices para optimizar consultas de misiones programadas
-- Table: progress_tracking.scheduled_missions
-- Created: 2025-10-28
-- =====================================================

-- Index: Misiones por mission_id
CREATE INDEX IF NOT EXISTS idx_scheduled_missions_mission
    ON progress_tracking.scheduled_missions(mission_id);

-- Index: Misiones por classroom_id
CREATE 
```

---

#### 66. progress_tracking.03-update_exercise_submissions_updated_at.sql

```
Tipo:            FUNCTION
Nombre:          progress_tracking.update_exercise_submissions_updated_at
Prioridad:       MEDIA
Tamaño:          487 bytes
Líneas:          18
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/progress_tracking/functions/03-update_exercise_submissions_updated_at.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/progress_tracking/function/03-update_exercise_submissions_updated_at.sql
Funciones Ref:   progress_tracking.update_exercise_submissions_updated_at
Schemas Ref:     progress_tracking, NEW
RLS:             No
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Function: progress_tracking.update_exercise_submissions_updated_at
-- Description: No description available
-- Parameters: None
-- Returns: trigger
-- Created: 2025-10-27
-- =====================================================

CREATE OR REPLACE FUNCTION progress_tracking.update_exercise_submissions_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

```

---

#### 67. social_features.01-cleanup_old_notifications.sql

```
Tipo:            FUNCTION
Nombre:          social_features.cleanup_old_notifications
Prioridad:       MEDIA
Tamaño:          1299 bytes
Líneas:          42
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/social_features/functions/01-cleanup_old_notifications.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/function/01-cleanup_old_notifications.sql
Tablas Ref:      social_features.notifications, social_features.cleanup_old_notifications
Funciones Ref:   mantener, social_features.cleanup_old_notifications, TABLE
Schemas Ref:     social_features
RLS:             No
Grants:          Sí
```

**Vista previa del contenido:**
```sql
-- Function: social_features.cleanup_old_notifications
-- Description: Limpia notificaciones leídas más antiguas que el período especificado
-- Parameters:
--   - p_days_to_keep: INTEGER - Número de días a mantener (default 30)
-- Returns: TABLE (deleted_count, oldest_kept_date)
-- Example:
--   SELECT * FROM social_features.cleanup_old_notifications(30);
-- Dependencies: social_features.notifications
-- Created: 2025-10-28
-- Modified: 2025-10-28

CREATE OR REPLACE FUNCTION social_features.clea
```

---

#### 68. social_features.01-friendships_indexes.sql

```
Tipo:            INDEX
Nombre:          CONCURRENTLY
Prioridad:       MEDIA
Tamaño:          3717 bytes
Líneas:          109
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/social_features/indexes/01-friendships_indexes.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/index/01-friendships_indexes.sql
Tablas Ref:      friendships, social_features.friendships
Funciones Ref:   received, o, friends
Schemas Ref:     social_features
RLS:             No
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Indexes for: social_features.friendships
-- Created: 2025-10-28
-- Description: Índices para optimización de relaciones de amistad
-- =====================================================

-- ========================================
-- BIDIRECTIONAL FRIENDSHIP INDEXES
-- ========================================

-- Index: idx_friendships_user1_status
-- Purpose: Optimiza búsquedas de amistades iniciadas por el usuario
-- Type: BTREE Com
```

---

#### 69. social_features.02-classroom_members_indexes.sql

```
Tipo:            INDEX
Nombre:          CONCURRENTLY
Prioridad:       MEDIA
Tamaño:          2975 bytes
Líneas:          93
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/social_features/indexes/02-classroom_members_indexes.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/index/02-classroom_members_indexes.sql
Tablas Ref:      social_features.classroom_members, social_features.classrooms, classroom_members
Funciones Ref:   social_features.classroom_members, history, actual
Schemas Ref:     INDEXES, cm, social_features, c
RLS:             No
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Indexes for: social_features.classroom_members
-- Created: 2025-10-28
-- Description: Índices para optimización de membresías de aulas
-- =====================================================

-- ========================================
-- PERFORMANCE INDEXES - Created 2025-10-28
-- ========================================

-- Index: idx_classroom_members_student
-- Purpose: Optimiza búsquedas de aulas por estudiante y estado
-- Type: B
```

---

#### 70. social_features.03-schools_indexes.sql

```
Tipo:            INDEX
Nombre:          CONCURRENTLY
Prioridad:       MEDIA
Tamaño:          2963 bytes
Líneas:          100
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/social_features/indexes/03-schools_indexes.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/social_features/index/03-schools_indexes.sql
Tablas Ref:      social_features.schools, schools
Funciones Ref:   tenant, Security, schools
Schemas Ref:     social_features
RLS:             No
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Indexes for: social_features.schools
-- Created: 2025-10-28
-- Description: Índices para optimización de multi-tenancy y gestión de escuelas
-- =====================================================

-- ========================================
-- MULTI-TENANCY INDEXES - Created 2025-10-28
-- ========================================

-- Index: idx_schools_tenant
-- Purpose: Optimiza búsquedas de escuelas por tenant (multi-tenancy)
-- Type
```

---

#### 71. system_configuration.01-enable-rls.sql

```
Tipo:            UNKNOWN
Nombre:          None
Prioridad:       MEDIA
Tamaño:          703 bytes
Líneas:          15
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/system_configuration/rls-policies/01-enable-rls.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/system_configuration/rls-policy/01-enable-rls.sql
Schemas Ref:     system_configuration
RLS:             Sí
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Enable RLS for system_configuration tables
-- Created: 2025-10-27
-- Description: Habilita Row Level Security en todas las
--              tablas del schema system_configuration
-- =====================================================

-- Tablas con RLS habilitado
ALTER TABLE system_configuration.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_configuration.system_settings ENABLE ROW LEVEL SECURITY;

-- Comentarios
COMMENT O
```

---

#### 72. system_configuration.02-policies.sql

```
Tipo:            RLS POLICY
Nombre:          system_settings_all_admin
Prioridad:       MEDIA
Tamaño:          2934 bytes
Líneas:          70
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/system_configuration/rls-policies/02-policies.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/system_configuration/rls-policy/02-policies.sql
Funciones Ref:   gamilit.is_admin, gamilit.is_super_admin, gamilit.get_current_user_id
Schemas Ref:     gamilit, system_configuration
RLS:             Sí
Grants:          No
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- RLS Policies for system_configuration schema
-- Description: Políticas de seguridad para configuración del sistema
-- Created: 2025-10-28
-- =====================================================

-- =====================================================
-- TABLE: system_configuration.system_settings
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS system_settings_all_admin ON syste
```

---

#### 73. system_configuration.03-grants.sql

```
Tipo:            UNKNOWN
Nombre:          None
Prioridad:       MEDIA
Tamaño:          1005 bytes
Líneas:          24
Ruta Origen:     /home/isem/workspace/workspace-gamilit/projects/gamilit-docs/03-desarrollo/base-de-datos/backup-ddl/gamilit_platform/schemas/system_configuration/rls-policies/03-grants.sql
Ruta Destino:    /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/schemas/system_configuration/rls-policy/03-grants.sql
Schemas Ref:     system_configuration
RLS:             No
Grants:          Sí
```

**Vista previa del contenido:**
```sql
-- =====================================================
-- Grants and Permissions for system_configuration
-- Created: 2025-10-27
-- Description: Permisos de acceso al schema de configuración del sistema
-- =====================================================

-- Schema permissions
GRANT USAGE ON SCHEMA system_configuration TO gamilit_user;

-- Table permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA system_configuration TO gamilit_user;
GRANT TRUNCATE, REFERENCES, TRIGGE
```

---

