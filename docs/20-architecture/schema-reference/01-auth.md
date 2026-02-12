# Schema 1: auth (8 tablas, 24 RLS policies)

> Parte de [Schema Reference](_INDEX.md) - GAMILIT

---

### auth.users
Usuarios del sistema en todos los roles.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| email | VARCHAR(255) | NOT NULL | - | Email unico por tenant |
| password_hash | VARCHAR(255) | NOT NULL | - | bcrypt hash |
| first_name | VARCHAR(100) | NOT NULL | - | Nombre |
| last_name | VARCHAR(100) | NOT NULL | - | Apellido |
| role | user_role | NOT NULL | 'student' | Rol principal |
| is_active | BOOLEAN | NOT NULL | true | Cuenta activa |
| email_verified | BOOLEAN | NOT NULL | false | Email verificado |
| avatar_url | VARCHAR(500) | NULL | NULL | URL de avatar |
| last_login_at | TIMESTAMPTZ | NULL | NULL | Ultimo login |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| deleted_at | TIMESTAMPTZ | NULL | NULL | Soft delete |

**Indices:** `idx_users_email_tenant` UNIQUE (email, tenant_id), `idx_users_role`, `idx_users_active`
**Entity:** `User`
**RLS:** 4 policies (SELECT, INSERT, UPDATE, DELETE por tenant_id)

---

### auth.user_profiles
Perfiles extendidos segun rol.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| user_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| display_name | VARCHAR(100) | NULL | NULL | Nombre de display |
| bio | TEXT | NULL | NULL | Biografia |
| grade_level | INTEGER | NULL | NULL | Grado escolar (estudiantes) |
| school_id | VARCHAR(50) | NULL | NULL | Matricula escolar |
| phone | VARCHAR(20) | NULL | NULL | Telefono |
| profile_data | JSONB | NULL | '{}' | Datos adicionales por rol |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `UserProfile`

---

### auth.user_preferences
Preferencias de usuario (idioma, notificaciones, accesibilidad).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| user_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| language | VARCHAR(5) | NOT NULL | 'es' | Idioma preferido |
| font_size | VARCHAR(10) | NOT NULL | 'medium' | Tamano de fuente |
| high_contrast | BOOLEAN | NOT NULL | false | Modo alto contraste |
| text_to_speech | BOOLEAN | NOT NULL | false | Texto a voz activo |
| notification_email | BOOLEAN | NOT NULL | true | Notificaciones email |
| notification_push | BOOLEAN | NOT NULL | true | Notificaciones push |
| notification_sms | BOOLEAN | NOT NULL | false | Notificaciones SMS |
| preferences_data | JSONB | NULL | '{}' | Preferencias adicionales |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `UserPreference`

---

### auth.sessions
Sesiones activas del usuario.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| user_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| token_hash | VARCHAR(255) | NOT NULL | - | Hash del access token |
| ip_address | INET | NULL | NULL | IP de conexion |
| user_agent | TEXT | NULL | NULL | User agent |
| device_info | JSONB | NULL | '{}' | Info del dispositivo |
| expires_at | TIMESTAMPTZ | NOT NULL | - | Expiracion |
| is_active | BOOLEAN | NOT NULL | true | Sesion activa |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `Session`

---

### auth.refresh_tokens
Tokens de refresco para renovar access tokens.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| user_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| token_hash | VARCHAR(255) | NOT NULL | - | Hash del refresh token |
| expires_at | TIMESTAMPTZ | NOT NULL | - | Expiracion (7 dias default) |
| is_revoked | BOOLEAN | NOT NULL | false | Token revocado |
| revoked_at | TIMESTAMPTZ | NULL | NULL | Fecha de revocacion |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `RefreshToken`

---

### auth.oauth_connections
Conexiones con proveedores OAuth externos.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| user_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| provider | VARCHAR(50) | NOT NULL | - | Proveedor (google, etc.) |
| provider_user_id | VARCHAR(255) | NOT NULL | - | ID en el proveedor |
| access_token | TEXT | NULL | NULL | Token de acceso (encriptado) |
| refresh_token | TEXT | NULL | NULL | Refresh token (encriptado) |
| token_expires_at | TIMESTAMPTZ | NULL | NULL | Expiracion del token |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Entity:** `OAuthConnection`

---

### auth.password_resets
Solicitudes de reseteo de contrasena.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| user_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| token_hash | VARCHAR(255) | NOT NULL | - | Hash del token de reset |
| expires_at | TIMESTAMPTZ | NOT NULL | - | Expiracion (1 hora) |
| used_at | TIMESTAMPTZ | NULL | NULL | Fecha de uso |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

### auth.login_attempts
Registro de intentos de login para seguridad.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| email | VARCHAR(255) | NOT NULL | - | Email intentado |
| tenant_id | UUID | NULL | NULL | Tenant (si identificable) |
| ip_address | INET | NOT NULL | - | IP de origen |
| success | BOOLEAN | NOT NULL | - | Intento exitoso |
| failure_reason | VARCHAR(100) | NULL | NULL | Razon de fallo |
| user_agent | TEXT | NULL | NULL | User agent |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
