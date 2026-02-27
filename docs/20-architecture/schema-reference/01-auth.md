---
titulo: Schema 1 - auth & auth_management
tipo: arquitectura
subtipo: schema-reference
schema: auth
ultima_actualizacion: 2026-02-27
---

# Schema 1: auth + auth_management (estructura dual)

> **Nota:** Este documento describe el modelo conceptual. Para definiciones DDL exactas, consultar los schemas correspondientes.

> **DDL Paths:**
> - Schema `auth`: `apps/database/ddl/schemas/auth/` (1 tabla DDL: `auth.users`)
> - Schema `auth_management`: `apps/database/ddl/schemas/auth_management/` (17 tablas DDL)

> **Estructura dual de schemas:**
> El dominio de autenticacion usa DOS schemas PostgreSQL fisicos:
> - `auth` — contiene `auth.users` (tabla central de identidad, patron Supabase/GoTrue compatible)
> - `auth_management` — contiene RBAC, tokens, sesiones, tenants, perfiles extendidos y suspension de cuentas
>
> Las tablas `auth.user_profiles`, `auth.user_preferences`, `auth.sessions`, `auth.refresh_tokens`, `auth.oauth_connections`, `auth.password_resets` y `auth.login_attempts` son tablas del modelo conceptual legacy (no tienen DDL propio en `apps/database/ddl/schemas/auth/tables/`). Su funcionalidad equivalente en el sistema actual se implementa en `auth_management` (`profiles`, `user_preferences`, `user_sessions`, `auth_providers`, `password_reset_tokens`, `auth_attempts`).

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

> **Nota sobre auth.users:** La tabla `auth.users` en produccion contiene ~30+ columnas (incluyendo `encrypted_password`, `raw_app_meta_data`, `raw_user_meta_data`, `email_confirmed_at`, `last_sign_in_at`, entre otros) siguiendo la estructura Supabase/GoTrue. Este documento muestra solo las columnas mas relevantes para el dominio gamilit.

---

## Tablas auth_management (RBAC y seguridad extendida)

> Las siguientes tablas pertenecen al schema fisico `auth_management`. Cubren RBAC, tokens de verificacion, 2FA y suspension de cuentas.

---

### auth_management.roles
Catalogo maestro de roles del sistema (RBAC).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| name | VARCHAR(50) | NOT NULL | - | Nombre unico del rol (student, admin_teacher, super_admin) |
| description | TEXT | NULL | NULL | Descripcion legible del rol |
| permissions | JSONB | NOT NULL | '{}' | Permisos en formato JSON (can_create_content, can_manage_users, etc.) |
| is_active | BOOLEAN | NOT NULL | true | Rol activo en el sistema |
| created_at | TIMESTAMPTZ | NOT NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | gamilit.now_mexico() | - |

**Primary Key:** id
**Unique:** name (`roles_name_key`)
**Indices:** `idx_roles_name`, `idx_roles_is_active`
**RLS:** NO (catalogo global)
**Nota:** Roles iniciales: student, admin_teacher, super_admin

---

### auth_management.user_roles
Asignaciones de roles a usuarios con permisos especificos por tenant.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles |
| tenant_id | UUID | NOT NULL | - | FK auth_management.tenants |
| role | gamilit_role | NOT NULL | - | Rol asignado (ENUM) |
| permissions | JSONB | NULL | `{"read":true,"admin":false,"write":false,"analytics":false}` | Permisos especificos del rol |
| assigned_by | UUID | NULL | NULL | FK auth_management.profiles (quien asigno) |
| assigned_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | Fecha de asignacion |
| expires_at | TIMESTAMPTZ | NULL | NULL | Expiracion del rol (null = permanente) |
| revoked_by | UUID | NULL | NULL | FK auth_management.profiles (quien revoco) |
| revoked_at | TIMESTAMPTZ | NULL | NULL | Fecha de revocacion |
| is_active | BOOLEAN | NULL | true | Asignacion activa |
| metadata | JSONB | NULL | '{}' | Datos adicionales |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Primary Key:** id
**Unique:** (user_id, tenant_id, role) (`user_roles_user_id_tenant_id_role_key`)
**Foreign Keys:** user_id → auth_management.profiles, tenant_id → auth_management.tenants, assigned_by → auth_management.profiles, revoked_by → auth_management.profiles
**Indices:** `idx_user_roles_role`, `idx_user_roles_tenant_id`, `idx_user_roles_user_id`

---

### auth_management.auth_providers
Configuracion de proveedores de autenticacion OAuth/Social.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| provider_name | auth_provider | NOT NULL | - | Proveedor (local, google, facebook, apple, microsoft, github) |
| display_name | TEXT | NOT NULL | - | Nombre visible en UI |
| is_enabled | BOOLEAN | NULL | false | Proveedor habilitado para autenticacion |
| client_id | TEXT | NULL | NULL | OAuth2 Client ID del proveedor |
| client_secret | TEXT | NULL | NULL | OAuth2 Client Secret (encriptado en prod) |
| authorization_url | TEXT | NULL | NULL | Endpoint de autorizacion OAuth |
| token_url | TEXT | NULL | NULL | Endpoint de tokens OAuth |
| user_info_url | TEXT | NULL | NULL | Endpoint de datos de usuario |
| scope | TEXT[] | NULL | NULL | Scopes OAuth solicitados |
| redirect_uri | TEXT | NULL | NULL | URI de redireccion |
| icon_url | TEXT | NULL | NULL | URL del icono del proveedor |
| button_color | TEXT | NULL | NULL | Color del boton en UI |
| priority | INTEGER | NULL | 100 | Orden de visualizacion (menor = mayor prioridad) |
| config | JSONB | NULL | '{}' | Configuracion adicional especifica del proveedor |
| metadata | JSONB | NULL | '{}' | Metadatos adicionales |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Primary Key:** id
**Unique:** provider_name (`auth_providers_provider_name_key`)
**Indices:** `idx_auth_providers_enabled` (parcial: is_enabled=true), `idx_auth_providers_priority` (parcial), `idx_auth_providers_config_gin` (GIN)
**Check:** priority >= 0
**RLS:** NO (catalogo de configuracion global)

---

### auth_management.email_verification_tokens
Tokens de verificacion de email para registro de nuevos usuarios.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth.users |
| token_hash | VARCHAR(255) | NOT NULL | - | Hash del token de verificacion |
| email | VARCHAR(255) | NOT NULL | - | Email a verificar |
| expires_at | TIMESTAMPTZ | NOT NULL | - | Expiracion del token |
| verified_at | TIMESTAMPTZ | NULL | NULL | Fecha en que el email fue verificado |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Primary Key:** id
**Unique:** token_hash (`email_verification_tokens_token_hash_key`)
**Foreign Keys:** user_id → auth.users ON DELETE CASCADE
**Indices:** `idx_email_verification_tokens_hash`, `idx_email_verification_tokens_user`

---

### auth_management.two_factor_tokens
Configuracion y tokens OTP para autenticacion de dos factores.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth.users |
| method | VARCHAR(20) | NOT NULL | - | Metodo 2FA: email, sms, authenticator |
| secret_key | VARCHAR(255) | NULL | NULL | Clave TOTP para apps autenticadoras (encriptada) |
| token_hash | VARCHAR(255) | NULL | NULL | Hash del OTP para email/SMS |
| is_enabled | BOOLEAN | NULL | false | 2FA habilitado para el usuario |
| is_verified | BOOLEAN | NULL | false | Configuracion 2FA verificada |
| verified_at | TIMESTAMPTZ | NULL | NULL | Fecha de verificacion |
| expires_at | TIMESTAMPTZ | NULL | NULL | Expiracion del token OTP |
| attempts_count | INTEGER | NULL | 0 | Intentos fallidos (rate limiting) |
| last_attempt_at | TIMESTAMPTZ | NULL | NULL | Ultimo intento |
| locked_until | TIMESTAMPTZ | NULL | NULL | Bloqueado hasta esta fecha |
| backup_codes_encrypted | TEXT | NULL | NULL | Codigos de respaldo (cifrados, JSON array) |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Primary Key:** id
**Foreign Keys:** user_id → auth.users ON DELETE CASCADE
**Check:** method IN ('email', 'sms', 'authenticator')
**Indices:** `idx_2fa_user`, `idx_2fa_token` (parcial), `idx_2fa_enabled` (parcial)

---

### auth_management.security_events
Log de auditoria para eventos relacionados con seguridad del sistema.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NULL | NULL | FK auth.users (puede ser null si usuario no identificado) |
| event_type | VARCHAR(100) | NOT NULL | - | Tipo de evento (login_attempt, password_change, etc.) |
| severity | VARCHAR(50) | NOT NULL | - | Severidad: low, medium, high, critical |
| description | TEXT | NULL | NULL | Descripcion del evento |
| ip_address | INET | NULL | NULL | IP de origen |
| user_agent | TEXT | NULL | NULL | User agent del cliente |
| metadata | JSONB | NULL | NULL | Datos adicionales del evento |
| created_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |

**Primary Key:** id
**Foreign Keys:** user_id → auth.users ON DELETE SET NULL
**Check:** severity IN ('low', 'medium', 'high', 'critical')
**Indices:** `idx_security_events_created` (DESC), `idx_security_events_severity`, `idx_security_events_type`, `idx_security_events_user`
**RLS:** NO (solo admin)

---

### auth_management.user_suspensions
Suspensiones y bans de cuentas de usuario.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth.users ON DELETE CASCADE |
| reason | TEXT | NOT NULL | - | Motivo de la suspension |
| suspension_until | TIMESTAMPTZ | NULL | NULL | Suspension hasta esta fecha (NULL = ban permanente) |
| suspended_by | UUID | NOT NULL | - | FK auth.users (quien aplico la suspension) |
| suspended_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | Fecha de aplicacion |
| created_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |
| updated_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |

**Primary Key:** id
**Unique:** user_id (un registro de suspension por usuario)
**Foreign Keys:** user_id → auth.users ON DELETE CASCADE, suspended_by → auth.users
**Indices:** `idx_user_suspensions_user_id`, `idx_user_suspensions_suspended_by`, `idx_user_suspensions_until` (parcial, WHERE suspension_until IS NOT NULL)

---

### auth_management.tenants
Tenants para soporte multi-tenancy — aislamiento de datos por organizacion.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| name | TEXT | NOT NULL | - | Nombre del tenant |
| slug | TEXT | NOT NULL | - | Identificador URL-friendly unico |
| domain | TEXT | NULL | NULL | Dominio asociado |
| logo_url | TEXT | NULL | NULL | URL del logo |
| subscription_tier | TEXT | NULL | 'free' | Nivel de suscripcion: free, basic, professional, enterprise |
| max_users | INTEGER | NULL | 100 | Maximo de usuarios permitidos (> 0) |
| max_storage_gb | INTEGER | NULL | 5 | Almacenamiento maximo en GB (> 0) |
| is_active | BOOLEAN | NULL | true | Tenant activo |
| trial_ends_at | TIMESTAMPTZ | NULL | NULL | Fin del periodo de prueba |
| settings | JSONB | NULL | (ver DDL) | Configuracion del tenant: theme, features, language, timezone |
| metadata | JSONB | NULL | '{}' | Metadatos adicionales |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| deleted_at | TIMESTAMPTZ | NULL | NULL | Soft-delete timestamp (NULL = activo) |

**Primary Key:** id
**Unique:** slug (`tenants_slug_key`)
**Check:** subscription_tier IN ('free', 'basic', 'professional', 'enterprise'), max_users > 0, max_storage_gb > 0
**Indices:** `idx_tenants_slug`, `idx_tenants_active` (parcial, WHERE is_active=true), `idx_tenants_settings_gin` (GIN), `idx_tenants_deleted_at` (parcial, WHERE deleted_at IS NULL)
**Trigger:** trg_tenants_updated_at (en triggers/06-trg_tenants_updated_at.sql)
**Nota:** 29 FKs apuntan a esta tabla. El soft-delete previene perdida accidental de datos (DB-124 H-022).

---

### auth_management.auth_attempts
Registro de intentos de autenticacion para seguridad y auditoria. Tabla independiente sin FK (auditoria).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| email | TEXT | NOT NULL | - | Email con el que se intento autenticar |
| ip_address | INET | NOT NULL | - | Direccion IP de origen |
| user_agent | TEXT | NULL | NULL | User agent del cliente |
| success | BOOLEAN | NOT NULL | - | True si el intento fue exitoso |
| failure_reason | TEXT | NULL | NULL | Razon del fallo: invalid_password, user_not_found, account_locked, etc. |
| tenant_slug | TEXT | NULL | NULL | Slug del tenant (si identificable) |
| attempted_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | Fecha y hora del intento |
| metadata | JSONB | NULL | '{}' | Datos adicionales del intento |

**Primary Key:** id
**Indices:** `idx_auth_attempts_attempted_at` (DESC), `idx_auth_attempts_email`, `idx_auth_attempts_failed` (parcial, WHERE success=false), `idx_auth_attempts_ip`
**RLS:** NO (tabla de auditoria independiente)

---

### auth_management.profiles
Perfiles de usuario con informacion basica, rol y configuraciones. Tabla central del sistema de identidad.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| tenant_id | UUID | NOT NULL | - | FK auth_management.tenants ON DELETE CASCADE |
| display_name | TEXT | NULL | NULL | Nombre de display |
| full_name | TEXT | NULL | NULL | Nombre completo |
| first_name | TEXT | NULL | NULL | Primer nombre |
| last_name | TEXT | NULL | NULL | Apellido(s) |
| email | TEXT | NOT NULL | - | Email (unico, formato validado) |
| avatar_url | TEXT | NULL | NULL | URL del avatar |
| bio | TEXT | NULL | NULL | Biografia (max 500 caracteres) |
| phone | TEXT | NULL | NULL | Telefono |
| date_of_birth | DATE | NULL | NULL | Fecha de nacimiento |
| grade_level | TEXT | NULL | NULL | Grado escolar del estudiante (ej: "6", "7") |
| student_id | TEXT | NULL | NULL | Matricula del estudiante |
| school_id | UUID | NULL | NULL | ID de la escuela (FK diferida por dependencia circular) |
| role | gamilit_role | NOT NULL | 'student' | Rol ENUM: student, admin_teacher, super_admin |
| status | user_status | NOT NULL | 'active' | Estado ENUM de la cuenta |
| email_verified | BOOLEAN | NULL | false | Email verificado |
| phone_verified | BOOLEAN | NULL | false | Telefono verificado |
| preferences | JSONB | NULL | (ver DDL) | Preferencias: theme, language, timezone, sound_enabled, notifications_enabled |
| last_sign_in_at | TIMESTAMPTZ | NULL | NULL | Ultimo inicio de sesion |
| last_activity_at | TIMESTAMPTZ | NULL | NULL | Ultima actividad registrada |
| metadata | JSONB | NULL | '{}' | Metadatos adicionales |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| deleted_at | TIMESTAMPTZ | NULL | NULL | Soft-delete timestamp (NULL = activo) |
| user_id | UUID | NULL | NULL | FK auth.users ON DELETE CASCADE (UNIQUE) |

**Primary Key:** id
**Unique:** email (`profiles_email_key`), user_id (`profiles_user_id_key`)
**Foreign Keys:** tenant_id → auth_management.tenants ON DELETE CASCADE, user_id → auth.users ON DELETE CASCADE. FK school_id diferida (ver ddl/schemas/auth_management/fk-constraints/01-profiles-school-fk.sql)
**Check:** email formato regex, bio longitud <= 500
**Indices:** `idx_profiles_email`, `idx_profiles_email_status` (parcial), `idx_profiles_last_activity`, `idx_profiles_preferences_gin` (GIN), `idx_profiles_role`, `idx_profiles_status`, `idx_profiles_tenant_id`, `idx_profiles_tenant_role_status`, `idx_profiles_user_id`, `idx_profiles_school_id` (parcial), `idx_profiles_deleted_at` (parcial)
**Triggers:** trg_audit_profile_changes, trg_initialize_user_stats, trg_profiles_updated_at (en triggers/ separados)
**RLS:** Habilitado (own select/update, admin select/update)
**Nota:** 77 FKs apuntan a esta tabla. Es la tabla de identidad central del sistema.

---

### auth_management.password_reset_tokens
Tokens de restablecimiento de contrasena para recuperacion de acceso de usuario.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth.users ON DELETE CASCADE |
| token_hash | VARCHAR(255) | NOT NULL | - | Hash del token de restablecimiento |
| expires_at | TIMESTAMPTZ | NOT NULL | - | Expiracion del token |
| used_at | TIMESTAMPTZ | NULL | NULL | Fecha en que el token fue usado |
| ip_address | INET | NULL | NULL | IP desde donde se solicito el reset |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Primary Key:** id
**Unique:** token_hash (`password_reset_tokens_token_hash_key`)
**Foreign Keys:** user_id → auth.users ON DELETE CASCADE
**Indices:** `idx_password_reset_tokens_hash`, `idx_password_reset_tokens_user`

---

### auth_management.user_preferences
Preferencias personalizadas por usuario para interfaz y experiencia de la aplicacion.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| user_id | UUID | NOT NULL | - | PK y FK auth_management.profiles ON DELETE CASCADE |
| theme | VARCHAR(20) | NULL | 'light' | Tema de interfaz: light, dark, auto |
| language | VARCHAR(10) | NULL | 'es' | Idioma preferido: es, en |
| notifications_enabled | BOOLEAN | NULL | true | Notificaciones en la aplicacion habilitadas |
| email_notifications | BOOLEAN | NULL | true | Notificaciones por email habilitadas |
| sound_enabled | BOOLEAN | NULL | true | Efectos de sonido habilitados |
| tutorial_completed | BOOLEAN | NULL | false | Si el usuario completo el tutorial inicial |
| preferences | JSONB | NULL | '{}' | Preferencias adicionales personalizadas |
| created_at | TIMESTAMPTZ | NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NULL | NOW() | - |

**Primary Key:** user_id (PK = FK)
**Foreign Keys:** user_id → auth_management.profiles ON DELETE CASCADE
**Check:** theme IN ('light', 'dark', 'auto'), language IN ('es', 'en')
**Indices:** `idx_user_preferences_theme`, `idx_user_preferences_language`, `idx_user_preferences_tutorial` (parcial, WHERE tutorial_completed=false), `idx_user_preferences_preferences` (GIN)
**Trigger:** trg_user_preferences_updated_at
**RLS:** Habilitado (own select/update/insert, admin select/update)

---

### auth_management.memberships
Relaciones usuario-tenant con permisos y restricciones. Un usuario puede pertenecer a un solo tenant a la vez.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles ON DELETE CASCADE |
| tenant_id | UUID | NOT NULL | - | FK auth_management.tenants ON DELETE CASCADE |
| role | TEXT | NULL | 'member' | Rol en el tenant: owner, admin, member, guest |
| status | TEXT | NULL | 'active' | Estado: active, suspended, pending, expired |
| joined_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | Fecha de ingreso al tenant |
| expires_at | TIMESTAMPTZ | NULL | NULL | Expiracion de la membresia (NULL = permanente) |
| last_access_at | TIMESTAMPTZ | NULL | NULL | Ultimo acceso al tenant |
| permissions | JSONB | NULL | (ver DDL) | Permisos: can_invite, can_manage_users, access_level |
| restrictions | JSONB | NULL | '{}' | Restricciones aplicadas |
| metadata | JSONB | NULL | '{}' | Metadatos adicionales |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Primary Key:** id
**Unique:** (user_id, tenant_id) (`memberships_user_id_tenant_id_key`)
**Foreign Keys:** user_id → auth_management.profiles ON DELETE CASCADE, tenant_id → auth_management.tenants ON DELETE CASCADE
**Check:** role IN ('owner', 'admin', 'member', 'guest'), status IN ('active', 'suspended', 'pending', 'expired')
**Indices:** `idx_memberships_status`, `idx_memberships_tenant_id`, `idx_memberships_user_id`
**Trigger:** trg_memberships_updated_at (en triggers/02-trg_memberships_updated_at.sql)

---

### auth_management.user_sessions
Sesiones activas de usuarios con informacion de dispositivo y ubicacion geografica.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles ON DELETE CASCADE |
| tenant_id | UUID | NULL | NULL | FK auth_management.tenants ON DELETE CASCADE |
| session_token | TEXT | NOT NULL | - | JWT token unico de la sesion |
| refresh_token | TEXT | NULL | NULL | Token de refresco |
| user_agent | TEXT | NULL | NULL | User agent del cliente |
| ip_address | INET | NULL | NULL | Direccion IP de origen |
| device_type | TEXT | NULL | NULL | Tipo de dispositivo: desktop, mobile, tablet, unknown |
| browser | TEXT | NULL | NULL | Navegador detectado |
| os | TEXT | NULL | NULL | Sistema operativo detectado |
| country | TEXT | NULL | NULL | Pais de la sesion |
| city | TEXT | NULL | NULL | Ciudad de la sesion |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| last_activity_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | Ultima actividad de la sesion |
| expires_at | TIMESTAMPTZ | NOT NULL | - | Fecha de expiracion de la sesion |
| is_active | BOOLEAN | NULL | true | Si la sesion esta activa |
| revoked_at | TIMESTAMPTZ | NULL | NULL | Fecha de revocacion de la sesion |
| metadata | JSONB | NULL | '{}' | Metadatos adicionales |

**Primary Key:** id
**Unique:** session_token (`user_sessions_session_token_key`)
**Foreign Keys:** user_id → auth_management.profiles ON DELETE CASCADE, tenant_id → auth_management.tenants ON DELETE CASCADE
**Check:** device_type IN ('desktop', 'mobile', 'tablet', 'unknown')
**Indices:** `idx_sessions_active_recent` (user_id, last_activity_at DESC, parcial is_active=true), `idx_user_sessions_active` (parcial), `idx_user_sessions_expires`, `idx_user_sessions_token`, `idx_user_sessions_user_id`

---

## Portal Padres (schema: auth_management)

> Las siguientes tablas implementan el portal de padres/tutores (Epic EXT-010).
> Permiten la vinculacion padre-estudiante, configuracion de alertas y notificaciones especificas.

---

### auth_management.parent_accounts [DDL-ACCURATE]

**Descripcion:** Cuentas de padres/tutores con preferencias del portal y configuracion de notificaciones. Epic EXT-010.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| profile_id | UUID | NOT NULL | - | FK auth_management.profiles ON DELETE CASCADE (UNIQUE) |
| relationship_type | TEXT | NULL | NULL | Tipo de relacion: mother, father, guardian, tutor, other |
| notification_frequency | TEXT | NULL | 'weekly' | Frecuencia: realtime, daily, weekly, monthly, on_demand |
| alert_on_low_performance | BOOLEAN | NULL | true | Alerta si hijo tiene bajo rendimiento |
| alert_on_inactivity_days | INTEGER | NULL | 7 | Dias de inactividad para enviar alerta |
| alert_on_achievement_unlocked | BOOLEAN | NULL | true | Alerta cuando hijo desbloquea logro |
| alert_on_rank_promotion | BOOLEAN | NULL | true | Alerta en promocion de rango maya |
| preferred_report_format | TEXT | NULL | 'email' | Formato de reporte: email, in_app, both |
| preferred_language | TEXT | NULL | 'es-MX' | Idioma preferido para comunicaciones |
| dashboard_widgets | JSONB | NULL | '["progress","achievements","activity","recommendations"]' | Widgets visibles en dashboard |
| can_view_detailed_progress | BOOLEAN | NULL | true | Permiso para ver progreso detallado |
| can_view_exercise_attempts | BOOLEAN | NULL | true | Permiso para ver intentos de ejercicios |
| can_receive_alerts | BOOLEAN | NULL | true | Permiso para recibir alertas |
| can_download_reports | BOOLEAN | NULL | true | Permiso para descargar reportes |
| is_verified | BOOLEAN | NULL | false | Verificado por la escuela/admin |
| is_active | BOOLEAN | NULL | true | Cuenta activa |
| created_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP | - |
| updated_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP | Auto-updated via trigger |
| last_login_at | TIMESTAMPTZ | NULL | NULL | Ultimo login al portal de padres |
| metadata | JSONB | NULL | '{}' | Metadatos adicionales |

**Primary Key:** id
**Unique:** profile_id
**Foreign Keys:** profile_id → auth_management.profiles ON DELETE CASCADE
**Check:** relationship_type IN ('mother','father','guardian','tutor','other'), notification_frequency IN ('realtime','daily','weekly','monthly','on_demand'), preferred_report_format IN ('email','in_app','both')
**Indices:** `idx_parent_accounts_profile` (profile_id), `idx_parent_accounts_active` (parcial, WHERE is_active=true), `idx_parent_accounts_verified` (parcial, WHERE is_verified=true), `idx_parent_accounts_notification_freq` (notification_frequency), `idx_parent_accounts_widgets` (GIN, dashboard_widgets)
**Trigger:** `trg_parent_accounts_updated_at` (auto-updates updated_at)
**RLS:** Habilitado (own read/update, admin all)
**Entity:** `ParentAccount` (`auth/entities/parent-account.entity.ts`)

---

### auth_management.parent_student_links [DDL-ACCURATE]

**Descripcion:** Vinculacion N:M entre padres/tutores y estudiantes con permisos y verificacion. Epic EXT-010.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| parent_account_id | UUID | NOT NULL | - | FK auth_management.parent_accounts ON DELETE CASCADE |
| student_id | UUID | NOT NULL | - | FK auth_management.profiles ON DELETE CASCADE |
| relationship_type | TEXT | NOT NULL | - | Tipo de relacion: mother, father, guardian, tutor, stepparent, grandparent, other |
| can_view_progress | BOOLEAN | NULL | true | Permiso para ver progreso del estudiante |
| can_view_grades | BOOLEAN | NULL | true | Permiso para ver calificaciones |
| can_receive_notifications | BOOLEAN | NULL | true | Permiso para recibir notificaciones |
| can_contact_teachers | BOOLEAN | NULL | false | Permiso para contactar maestros |
| link_status | TEXT | NULL | 'pending' | Estado del vinculo: pending, active, suspended, revoked |
| is_verified | BOOLEAN | NULL | false | Verificado por escuela/admin |
| verified_by | UUID | NULL | NULL | FK auth_management.profiles (quien verifico) |
| verified_at | TIMESTAMPTZ | NULL | NULL | Fecha de verificacion |
| verification_code | TEXT | NULL | NULL | Codigo unico para auto-vinculacion |
| verification_code_expires_at | TIMESTAMPTZ | NULL | NULL | Expiracion del codigo de verificacion |
| verification_attempts | INTEGER | NULL | 0 | Intentos de verificacion realizados |
| student_approval_required | BOOLEAN | NULL | false | Si el estudiante debe aprobar (mayores de edad) |
| student_approved | BOOLEAN | NULL | NULL | Si el estudiante aprobo el vinculo |
| student_approved_at | TIMESTAMPTZ | NULL | NULL | Fecha de aprobacion del estudiante |
| created_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP | - |
| updated_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP | Auto-updated via trigger |
| activated_at | TIMESTAMPTZ | NULL | NULL | Fecha de activacion del vinculo |
| revoked_at | TIMESTAMPTZ | NULL | NULL | Fecha de revocacion |
| revoked_by | UUID | NULL | NULL | FK auth_management.profiles (quien revoco) |
| revocation_reason | TEXT | NULL | NULL | Motivo de revocacion |
| metadata | JSONB | NULL | '{}' | Metadatos adicionales |

**Primary Key:** id
**Unique:** (parent_account_id, student_id) (`unique_parent_student`)
**Foreign Keys:** parent_account_id → auth_management.parent_accounts ON DELETE CASCADE, student_id → auth_management.profiles ON DELETE CASCADE, verified_by → auth_management.profiles, revoked_by → auth_management.profiles
**Check:** relationship_type IN ('mother','father','guardian','tutor','stepparent','grandparent','other'), link_status IN ('pending','active','suspended','revoked')
**Indices:** `idx_parent_student_links_parent` (parent_account_id), `idx_parent_student_links_student` (student_id), `idx_parent_student_links_status` (link_status), `idx_parent_student_links_active` (parent_account_id, student_id, link_status, parcial WHERE link_status='active'), `idx_parent_student_links_pending` (link_status, created_at, parcial WHERE link_status='pending'), `idx_parent_student_links_verification_code` (parcial, WHERE verification_code IS NOT NULL)
**Trigger:** `trg_parent_student_links_updated_at` (auto-updates updated_at)
**RLS:** Habilitado (own read bidirectional, admin all)
**Entity:** `ParentStudentLink` (`auth/entities/parent-student-link.entity.ts`)

---

### auth_management.parent_notifications [DDL-ACCURATE]

**Descripcion:** Notificaciones especificas para padres sobre progreso, achievements y alertas de sus hijos. Epic EXT-010.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| parent_account_id | UUID | NOT NULL | - | FK auth_management.parent_accounts ON DELETE CASCADE |
| student_id | UUID | NOT NULL | - | FK auth_management.profiles ON DELETE CASCADE |
| notification_type | TEXT | NOT NULL | - | Tipo: daily_summary, weekly_report, monthly_report, low_performance, inactivity_alert, achievement_unlocked, rank_promotion, assignment_due, assignment_submitted, recommendation, custom |
| title | TEXT | NOT NULL | - | Titulo de la notificacion |
| message | TEXT | NOT NULL | - | Contenido del mensaje |
| summary | TEXT | NULL | NULL | Resumen breve |
| student_snapshot | JSONB | NULL | '{}' | Snapshot del estado del estudiante: {total_xp, current_rank, modules_completed, etc.} |
| priority | TEXT | NULL | 'normal' | Prioridad: low, normal, high, urgent |
| sent_via_email | BOOLEAN | NULL | false | Si se envio por email |
| sent_via_in_app | BOOLEAN | NULL | false | Si se envio por notificacion in-app |
| sent_via_push | BOOLEAN | NULL | false | Si se envio por push notification |
| status | TEXT | NULL | 'pending' | Estado: pending, sent, read, archived |
| related_entity_type | TEXT | NULL | NULL | Tipo de entidad relacionada: module, exercise, achievement, etc. |
| related_entity_id | UUID | NULL | NULL | ID de la entidad relacionada |
| action_url | TEXT | NULL | NULL | URL para abrir detalles |
| scheduled_for | TIMESTAMPTZ | NULL | NULL | Timestamp para envio programado (reportes diarios/semanales/mensuales) |
| sent_at | TIMESTAMPTZ | NULL | NULL | Fecha de envio |
| read_at | TIMESTAMPTZ | NULL | NULL | Fecha de lectura |
| created_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP | - |
| updated_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP | Auto-updated via trigger |
| metadata | JSONB | NULL | '{}' | Metadatos adicionales |

**Primary Key:** id
**Foreign Keys:** parent_account_id → auth_management.parent_accounts ON DELETE CASCADE, student_id → auth_management.profiles ON DELETE CASCADE
**Check:** notification_type IN (11 valores), priority IN ('low','normal','high','urgent'), status IN ('pending','sent','read','archived')
**Indices:** `idx_parent_notifications_parent` (parent_account_id), `idx_parent_notifications_student` (student_id), `idx_parent_notifications_type` (notification_type), `idx_parent_notifications_status` (status), `idx_parent_notifications_priority` (priority), `idx_parent_notifications_unread` (parent_account_id, created_at DESC, parcial WHERE status IN ('pending','sent')), `idx_parent_notifications_scheduled` (scheduled_for, parcial WHERE status='pending' AND scheduled_for IS NOT NULL), `idx_parent_notifications_created_at` (created_at DESC), `idx_parent_notifications_snapshot` (GIN, student_snapshot), `idx_parent_notifications_metadata` (GIN, metadata)
**Trigger:** `trg_parent_notifications_updated_at` (auto-updates updated_at)
**RLS:** Habilitado (own read, admin all)
**Entity:** `ParentNotification` (`auth/entities/parent-notification.entity.ts`)

---

## Tablas Conceptuales (sin DDL)

> Las siguientes tablas aparecen en el modelo conceptual pero no tienen DDL implementado.
> Son candidatas para futuras iteraciones o estan cubiertas por tablas existentes.

| Tabla | Proposito |
|-------|-----------|
| auth.user_profiles | Perfiles extendidos de usuario |
| auth.user_preferences | Preferencias de usuario |
| auth.sessions | Sesiones activas |
| auth.refresh_tokens | Tokens de refresco |
| auth.oauth_connections | Conexiones OAuth externas |
| auth.password_resets | Solicitudes de reset de password |
| auth.login_attempts | Intentos de login (rate limiting) |
