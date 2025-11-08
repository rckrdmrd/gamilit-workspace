# Tablas - Schema: auth_management

**Total de tablas:** 12 (9 existentes + 3 nuevas)  
**Actualizado por:** SA-DB-011 - Implementador de Tablas  
**Fecha:** 2025-11-02

## Tabla Existentes (9 tablas)

1. **01-tenants.sql** - Organizaciones/Empresas base de datos multi-tenant
2. **02-auth_attempts.sql** - Intentos de autenticación para auditoría
3. **03-profiles.sql** - Perfiles de usuario con información personal
4. **04-roles.sql** - Roles disponibles en el sistema
5. **05-auth_providers.sql** - Proveedores de autenticación externos
6. **06-email_verification_tokens.sql** - Tokens para verificación de email
7. **07-password_reset_tokens.sql** - Tokens para reset de contraseña
8. **08-security_events.sql** - Eventos de seguridad del sistema
9. **09-user_preferences.sql** - Preferencias personalizadas de usuario

## Tablas Nuevas (3 tablas - P0)

10. **10-memberships.sql** - Membresías de usuarios a organizaciones/tenants
11. **11-user_sessions.sql** - Sesiones activas de usuarios con info de dispositivo
12. **12-user_suspensions.sql** - Suspensiones y bans de cuentas de usuario

## Validación

- ✅ 3 archivos SQL copiados exitosamente
- ✅ Sintaxis validada en todos los archivos
- ✅ Archivos organizados con numeración secuencial (10, 11, 12)
- ✅ Total de archivos: 12/12

## Ejecución

Orden recomendado de ejecución (respetando dependencias):
1. 01-tenants.sql
2. 02-auth_attempts.sql
3. 03-profiles.sql
4. 04-roles.sql
5. 05-auth_providers.sql
6. 06-email_verification_tokens.sql
7. 07-password_reset_tokens.sql
8. 08-security_events.sql
9. 09-user_preferences.sql
10. **10-memberships.sql** (nuevo)
11. **11-user_sessions.sql** (nuevo)
12. **12-user_suspensions.sql** (nuevo)

---

## 🔗 Dependencias

### Foreign Keys (Referencias a otras tablas)
- **profiles** → `auth.users` (user_id)
- **profiles** → `tenants` (tenant_id)
- **roles** → `profiles` (created_by, updated_by)
- **memberships** → `profiles` (user_id)
- **memberships** → `tenants` (tenant_id)
- **user_sessions** → `profiles` (user_id)
- **user_sessions** → `tenants` (tenant_id)
- **email_verification_tokens** → `auth.users` (user_id)
- **password_reset_tokens** → `auth.users` (user_id)
- **security_events** → `auth.users` (user_id)

### Enums Utilizados
- `auth_management.gamilit_role` → usado en: `profiles.role`
- `auth_management.user_status` → usado en: `profiles.status`
- `public.auth_provider` → usado en: `auth_providers.provider_name`

### ⚠️ Issues Conocidos
- **P0-001:** Tabla `04-roles.sql:17` usa `public.gamilit_role` que NO existe
  - Debe cambiarse a `auth_management.gamilit_role`

---

## 📑 Database Inventory Master

Para información completa de dependencias, mapeo funcional y duplicados, consultar:
`orchestration/05-validaciones/consolidacion/DATABASE-INVENTORY-MASTER-2025-11-07.md`

---

**Implementado por:** SA-DB-011 - Microciclo 4 Fase 2
