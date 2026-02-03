# Arquitectura de Autenticación - GAMILIT

**Fecha:** 2025-12-14
**Versión:** 1.0
**Estado:** Documentado
**Auditoría:** AUDIT-DB-001

---

## 1. Resumen Ejecutivo

Este documento describe la arquitectura de autenticación de GAMILIT, aclarando que el proyecto **NO utiliza Supabase** como servicio. El esquema `auth` y sus tablas siguen un **patrón estándar de la industria** para autenticación con PostgreSQL y Row Level Security (RLS).

---

## 2. Arquitectura de Dos Capas

GAMILIT implementa una arquitectura de autenticación de dos capas:

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA 1: AUTH BASE                        │
│                    Schema: auth                             │
├─────────────────────────────────────────────────────────────┤
│  auth.users                                                 │
│  ├── id (UUID PK)                                          │
│  ├── email (unique)                                        │
│  ├── encrypted_password                                    │
│  ├── email_confirmed_at                                    │
│  ├── last_sign_in_at                                       │
│  ├── raw_user_meta_data (JSONB)                            │
│  ├── created_at                                            │
│  └── updated_at                                            │
│                                                             │
│  Propósito: Credenciales de autenticación puras            │
│  Acceso: Solo servicios de autenticación                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ FK: profile_id → auth.users.id
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 CAPA 2: AUTH MANAGEMENT                     │
│                 Schema: auth_management                     │
├─────────────────────────────────────────────────────────────┤
│  auth_management.profiles                                   │
│  ├── id (UUID PK, FK → auth.users.id)                      │
│  ├── first_name                                            │
│  ├── last_name                                             │
│  ├── display_name                                          │
│  ├── avatar_url                                            │
│  ├── school_id (FK)                                        │
│  ├── grade_level                                           │
│  ├── date_of_birth                                         │
│  ├── preferences (JSONB)                                   │
│  └── tenant_id (FK)                                        │
│                                                             │
│  Propósito: Datos de perfil de negocio                     │
│  Acceso: Toda la aplicación                                │
└─────────────────────────────────────────────────────────────┘
```

### 2.1 Por qué Dos Capas

| Aspecto | auth.users | auth_management.profiles |
|---------|------------|--------------------------|
| **Datos** | Credenciales (email, password) | Información de negocio (nombre, avatar) |
| **Seguridad** | Altamente restringido | Accesible con RLS |
| **Modificación** | Solo sistema de auth | Usuario y administradores |
| **Referencias** | Ninguna (aislado) | Todas las tablas del sistema |

---

## 3. Roles RLS (Row Level Security)

GAMILIT usa tres roles estándar para RLS:

```sql
-- Definidos en 00-prerequisites.sql
CREATE ROLE authenticated;
CREATE ROLE anon;
CREATE ROLE service_role;

-- Descripciones
COMMENT ON ROLE authenticated IS 'Rol RLS: usuarios autenticados (cualquier rol GAMILIT)';
COMMENT ON ROLE anon IS 'Rol RLS: visitantes no autenticados';
COMMENT ON ROLE service_role IS 'Rol RLS: acceso elevado para operaciones del sistema';
```

### 3.1 Mapeo de Roles

| Rol RLS | Rol GAMILIT | Permisos |
|---------|-------------|----------|
| `authenticated` | student, teacher, admin, super_admin | Lectura/escritura según policies |
| `anon` | (sin login) | Solo lectura de datos públicos |
| `service_role` | Backend interno | Bypass de RLS para operaciones del sistema |

---

## 4. Flujo de Autenticación

```
┌──────────┐     ┌──────────────┐     ┌─────────────┐     ┌──────────────────┐
│  Cliente │────▶│ POST /login  │────▶│ AuthService │────▶│ auth.users       │
└──────────┘     └──────────────┘     └─────────────┘     │ (validar creds)  │
                                             │            └──────────────────┘
                                             │
                                             ▼
                                      ┌─────────────┐
                                      │ JWT Token   │
                                      │ + user_id   │
                                      │ + role      │
                                      └─────────────┘
                                             │
                                             ▼
                 ┌──────────────────────────────────────────────────────┐
                 │  Headers: Authorization: Bearer <token>              │
                 │  PostgreSQL: SET LOCAL role = 'authenticated';       │
                 │              SET LOCAL request.jwt.sub = '<user_id>';│
                 └──────────────────────────────────────────────────────┘
```

### 4.1 JWT Claims

```typescript
interface JWTPayload {
  sub: string;        // auth.users.id (UUID)
  email: string;      // auth.users.email
  role: string;       // GAMILIT role (student, teacher, etc.)
  tenant_id?: string; // Multi-tenant support
  iat: number;        // Issued at
  exp: number;        // Expiration
}
```

---

## 5. Tablas de Autenticación

### 5.1 Schema `auth`

| Tabla | Descripción | Columnas Clave |
|-------|-------------|----------------|
| `users` | Credenciales de usuario | id, email, encrypted_password, email_confirmed_at |

### 5.2 Schema `auth_management`

| Tabla | Descripción | FK Principal |
|-------|-------------|--------------|
| `profiles` | Datos de perfil extendido | id → auth.users.id |
| `tenants` | Organizaciones multi-tenant | - |
| `memberships` | Relación usuario-tenant | user_id → profiles.id |
| `roles` | Definición de roles | - |
| `user_roles` | Asignación usuario-rol | profile_id → profiles.id |
| `user_sessions` | Sesiones activas | user_id → profiles.id |
| `auth_providers` | Proveedores externos (Google, etc.) | user_id → profiles.id |
| `auth_attempts` | Log de intentos de login | user_id → profiles.id |
| `email_verification_tokens` | Tokens de verificación | user_id → profiles.id |
| `password_reset_tokens` | Tokens de reset | user_id → profiles.id |
| `security_events` | Eventos de seguridad | user_id → profiles.id |

---

## 6. Decisiones Arquitectónicas

### ADR-001: No Supabase

**Contexto:** El diseño inicial consideraba Supabase como opción de BaaS.

**Decisión:** Implementar autenticación personalizada con NestJS + PostgreSQL.

**Razones:**
1. Mayor control sobre lógica de autenticación
2. Sin dependencia de servicios externos
3. Flexibilidad para multi-tenant personalizado
4. RLS implementado directamente en PostgreSQL

**Consecuencias:**
- Mayor código de autenticación a mantener
- Mayor flexibilidad en personalización
- Sin costos de servicio externo

### ADR-002: Patrón de Dos Capas

**Contexto:** Necesidad de separar credenciales de datos de perfil.

**Decisión:** Usar `auth.users` para credenciales y `auth_management.profiles` para datos de negocio.

**Razones:**
1. Principio de responsabilidad única
2. Seguridad mejorada (aislamiento de credenciales)
3. Facilidad de extensión del perfil
4. Compatibilidad con patrones estándar de la industria

---

## 7. Constantes de Backend

```typescript
// apps/backend/src/shared/constants/database.constants.ts

export const DB_SCHEMAS = {
  AUTH: 'auth_management',        // Gestión de autenticación
  AUTH_BASE: 'auth',              // Credenciales base
  // ... otros schemas
};

export const DB_TABLES = {
  AUTH: {
    USERS: 'users',
    PROFILES: 'profiles',
    USER_ROLES: 'user_roles',
    ROLES: 'roles',
    // ... resto de tablas
  },
  AUTH_BASE: {
    USERS: 'users',
  },
};
```

---

## 8. Ejemplo de Policies RLS

```sql
-- Solo el usuario puede ver su propio perfil
CREATE POLICY "Users can view own profile"
ON auth_management.profiles
FOR SELECT
TO authenticated
USING (id = current_setting('request.jwt.sub')::uuid);

-- Solo admins pueden ver todos los perfiles
CREATE POLICY "Admins can view all profiles"
ON auth_management.profiles
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth_management.user_roles ur
    JOIN auth_management.roles r ON ur.role_id = r.id
    WHERE ur.profile_id = current_setting('request.jwt.sub')::uuid
    AND r.name IN ('admin', 'super_admin')
  )
);
```

---

## 9. Referencias

- `apps/database/ddl/schemas/auth/` - DDL del schema auth
- `apps/database/ddl/schemas/auth_management/` - DDL del schema auth_management
- `apps/backend/src/modules/auth/` - Código de autenticación
- `orchestration/inventarios/DATABASE_INVENTORY.yml` - Inventario de BD
- `orchestration/agentes/database-auditor/audit-2025-12-14/07-REPORTE-CORRECCIONES-P0.md` - Auditoría P0

---

## 10. Historial de Cambios

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2025-12-14 | Documento inicial, clarificación de no-Supabase | AUDIT-DB-001 |

---

**Estado:** Este documento es la fuente de verdad para la arquitectura de autenticación de GAMILIT.
