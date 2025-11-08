# Módulo 1: Autenticación y Autorización - Requerimientos

## 📋 Índice de Requerimientos Funcionales

Este módulo contiene los requerimientos funcionales del sistema de autenticación y autorización de Gamilit.

---

## 📄 Requerimientos Funcionales (RF)

### RF-AUTH-001: Sistema de Roles de Usuario
**Archivo:** [`RF-AUTH-001-roles.md`](./RF-AUTH-001-roles.md)
**Estado:** ✅ Implementado
**Prioridad:** Alta

**Descripción:** Define los 3 roles de usuario en el sistema (student, admin_teacher, super_admin) con sus permisos y restricciones específicas.

**Implementación DDL:**
- ENUM: `apps/database/ddl/00-prerequisites.sql:30-32`
- Tablas: `auth_management.profiles:15`, `auth.users:15`
- Funciones: `gamilit.get_current_user_role()`, `gamilit.is_admin()`

**Especificación Técnica:** [`ET-AUTH-001-rbac.md`](../../02-especificaciones-tecnicas/01-autenticacion-autorizacion/ET-AUTH-001-rbac.md)

**Backend:**
- Enum: `apps/backend/src/shared/enums/gamilit-role.enum.ts`
- Guard: `apps/backend/src/shared/guards/roles.guard.ts`

**Frontend:**
- Types: `apps/frontend/src/types/auth.types.ts`
- Componentes: `RoleBasedRoute`, `UserRoleBadge`, `AdminPanel`

---

### RF-AUTH-002: Estados de Cuenta de Usuario
**Archivo:** [`RF-AUTH-002-estados-cuenta.md`](./RF-AUTH-002-estados-cuenta.md)
**Estado:** ✅ Implementado
**Prioridad:** Alta

**Descripción:** Gestiona el ciclo de vida de cuentas de usuario con 5 estados (pending, active, inactive, suspended, banned).

**Implementación DDL:**
- ENUM: `apps/database/ddl/00-prerequisites.sql:34-36`
- Tabla: `auth_management.profiles:17`
- Funciones: `auth_management.verify_user_status()`, `auth_management.suspend_user()`

**Especificación Técnica:** [`ET-AUTH-002-estados-cuenta.md`](../../02-especificaciones-tecnicas/01-autenticacion-autorizacion/ET-AUTH-002-estados-cuenta.md)

**Backend:**
- Enum: `apps/backend/src/modules/auth/enums/user-status.enum.ts`
- Middleware: `UserStatusMiddleware`
- Service: `UserManagementService`

**Frontend:**
- Badge: `UserStatusBadge`
- Admin Panel: Gestión de usuarios

---

### RF-AUTH-003: Proveedores de Autenticación OAuth
**Archivo:** [`RF-AUTH-003-oauth.md`](./RF-AUTH-003-oauth.md)
**Estado:** ✅ Implementado
**Prioridad:** Alta

**Descripción:** Soporta autenticación mediante 6 proveedores OAuth (local, google, facebook, apple, microsoft, github).

**Implementación DDL:**
- ENUM: `apps/database/ddl/00-prerequisites.sql:38-40`
- Tablas: `auth_management.auth_providers`, `auth_management.profiles`
- Function: `auth.get_available_providers()`

**Especificación Técnica:** [`ET-AUTH-003-oauth.md`](../../02-especificaciones-tecnicas/01-autenticacion-autorizacion/ET-AUTH-003-oauth.md)

**Backend:**
- Enum: `apps/backend/src/modules/auth/enums/auth-provider.enum.ts`
- Strategies: `GoogleStrategy`, `FacebookStrategy`, `AppleStrategy`, `MicrosoftStrategy`, `GithubStrategy`
- Config: `apps/backend/src/config/oauth.config.ts`

**Frontend:**
- Componentes: `LoginProviderButtons`, `ProviderIcon`, `OAuthCallback`

---

## 🗺️ Mapa de Relaciones

```
RF-AUTH-001 (Roles)
    ├──> ET-AUTH-001 (RBAC)
    ├──> DDL: 00-prerequisites.sql:30-32
    ├──> Backend: gamilit-role.enum.ts, roles.guard.ts
    └──> Frontend: RoleBasedRoute, UserRoleBadge

RF-AUTH-002 (Estados)
    ├──> ET-AUTH-002 (Estados de Cuenta)
    ├──> DDL: 00-prerequisites.sql:34-36
    ├──> Backend: user-status.enum.ts, UserStatusMiddleware
    └──> Frontend: UserStatusBadge

RF-AUTH-003 (OAuth)
    ├──> ET-AUTH-003 (OAuth Providers)
    ├──> DDL: 00-prerequisites.sql:38-40
    ├──> Backend: 5 OAuth Strategies
    └──> Frontend: LoginProviderButtons
```

---

## 📊 Estadísticas

- **Total Requerimientos:** 3
- **Estado:** 3/3 Implementados (100%)
- **ENUMs Definidos:** 3
- **Tablas Afectadas:** 5
- **RLS Policies:** 7
- **Backend Services:** 3
- **Frontend Components:** 8+

---

## 🔗 Enlaces Relacionados

### Especificaciones Técnicas
- [ET-AUTH-001: RBAC](../../02-especificaciones-tecnicas/01-autenticacion-autorizacion/ET-AUTH-001-rbac.md)
- [ET-AUTH-002: Estados de Cuenta](../../02-especificaciones-tecnicas/01-autenticacion-autorizacion/ET-AUTH-002-estados-cuenta.md)
- [ET-AUTH-003: OAuth Providers](../../02-especificaciones-tecnicas/01-autenticacion-autorizacion/ET-AUTH-003-oauth.md)

### Otros Módulos Relacionados
- [RF-SOC-001: Sistema de Aulas](../05-caracteristicas-sociales/RF-SOC-001-aulas-virtuales.md) - Usa roles para permisos de aula
- [RF-PRG-001: Tracking de Progreso](../04-progreso-seguimiento/RF-PRG-001-tracking-progreso.md) - RLS basado en roles

### ADRs (Architectural Decision Records)
- [ADR-003: Row Level Security](../../02-especificaciones-tecnicas/adr/ADR-003-row-level-security.md)
- [ADR-005: OAuth Provider Selection](../../02-especificaciones-tecnicas/adr/ADR-005-oauth-providers.md)

### Mapeo Completo
- [Mapeo: Requerimientos → Implementación](../../03-desarrollo/base-de-datos/MAPEO-REQUERIMIENTOS-IMPLEMENTACION.md#módulo-1-autenticación-y-autorización)

---

## 📅 Historial

| Fecha | Evento | Descripción |
|-------|--------|-------------|
| 2025-11-07 | Creación | Estructura inicial del módulo de autenticación |
| 2025-11-07 | Consolidación | Eliminación de duplicados de ENUMs (gamilit_role, user_status, auth_provider) |
| 2025-11-07 | Documentación | Creación de requerimientos funcionales RF-AUTH-001, RF-AUTH-002, RF-AUTH-003 |

---

**Ruta:** `docs/01-requerimientos/01-autenticacion-autorizacion/_MAP.md`
**Última actualización:** 2025-11-07
