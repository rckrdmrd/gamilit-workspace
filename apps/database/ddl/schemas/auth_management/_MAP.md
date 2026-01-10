# Schema: auth_management

Gestión de autenticación y autorización: usuarios, roles, perfiles, sesiones

## Estructura

- **tables/**: 17 archivos (2026-01-07: +1 03b-roles.sql, +1 17-add-soft-delete.sql)
- **enums/**: 3 archivos (gamilit_role, user_status, auth_provider)
- **functions/**: 6 archivos
- **triggers/**: 6 archivos activos (incluye 00-batch_updated_at_triggers.sql consolidado)
- **triggers/_deprecated/**: 4 archivos (triggers updated_at individuales)
- **indexes/**: 11 archivos (+2 inline en 03b-roles.sql)
- **rls-policies/**: 2 archivos
- **fk-constraints/**: 1 archivo

**Total:** 49 objetos

## Contenido Detallado

### tables/ (17 archivos)

```
01-tenants.sql
02-auth_attempts.sql
03-profiles.sql
03b-roles.sql           # 2026-01-07: Catalogo maestro RBAC (student, admin_teacher, super_admin)
04-roles.sql            # user_roles - asignaciones de roles a usuarios
05-auth_providers.sql
06-email_verification_tokens.sql
07-password_reset_tokens.sql
08-security_events.sql
09-user_preferences.sql
10-memberships.sql
11-user_sessions.sql
12-user_suspensions.sql
14-parent_accounts.sql
15-parent_student_links.sql
16-parent_notifications.sql
17-add-soft-delete.sql
```

### functions/ (6 archivos)

```
01-assign_role_to_user.sql
02-get_user_role.sql
03-verify_user_permission.sql
04-remove_role_from_user.sql
05-hash_token.sql
06-update_user_preferences.sql
```

### enums/ (3 archivos)

```
gamilit_role.sql     # student, admin_teacher, super_admin
user_status.sql      # active, inactive, suspended, pending_verification
auth_provider.sql    # local, google, microsoft, clever
```

### triggers/ (6 archivos activos)

```
00-batch_updated_at_triggers.sql  # CONSOLIDADO: memberships, profiles, tenants, user_roles
01-trg_set_default_tenant.sql
03-trg_audit_profile_changes.sql
03b-trg_ensure_profile_name.sql
04-trg_initialize_user_stats.sql
08-trg_assign_default_classroom.sql
```

### triggers/_deprecated/ (4 archivos)

```
02-trg_memberships_updated_at.sql
05-trg_profiles_updated_at.sql
06-trg_tenants_updated_at.sql
07-trg_user_roles_updated_at.sql
```

### indexes/ (11 archivos)

```
01-idx_user_preferences_theme.sql
02-idx_user_roles_permissions_gin.sql
idx_user_roles_role.sql
idx_user_roles_tenant_id.sql
idx_user_roles_user_id.sql
idx_user_sessions_active.sql
idx_user_sessions_expires.sql
idx_user_sessions_refresh_token_hash.sql
idx_user_sessions_session_token_hash.sql
idx_user_sessions_token.sql
idx_user_sessions_user_id.sql
```

### rls-policies/ (1 archivos)

```
01-policies.sql
```

## Consolidacion de Triggers (2026-01-07)

Triggers de `updated_at` consolidados en `00-batch_updated_at_triggers.sql`:
- `memberships_updated_at`
- `profiles_updated_at`
- `tenants_updated_at`
- `user_roles_updated_at`

Archivos originales movidos a `triggers/_deprecated/`.

## Migracion de ENUMs (2026-01-07)

ENUMs migrados desde `00-prerequisites.sql` a archivos individuales en `enums/`:
- `gamilit_role` - Roles del sistema
- `user_status` - Estados de usuario
- `auth_provider` - Proveedores de autenticacion

---

**Ultima actualizacion:** 2026-01-07
**Cambios recientes:**
- CONSOLIDACION BD: Triggers updated_at consolidados (2026-01-07)
- CONSOLIDACION BD: ENUMs migrados a archivos individuales (2026-01-07)
- Agregada tabla roles (03b-roles.sql) - Catalogo maestro RBAC
