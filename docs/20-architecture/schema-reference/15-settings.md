# Schema 15: settings (9 tablas, system_configuration)

> Parte de [Schema Reference](_INDEX.md) - GAMILIT

---

> **[DEPRECATED]** This section describes an early conceptual model that was never implemented as described.
> The DDL-accurate documentation appears in the updated sections below.
> **Note:** The DDL schema is `system_configuration`, not `settings`. The `settings.*` prefix below is legacy.

### settings.system_settings
Configuracion global del sistema.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| key | VARCHAR(100) | NOT NULL | - | Clave de configuracion |
| value | JSONB | NOT NULL | '{}' | Valor |
| description | TEXT | NULL | NULL | Descripcion |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Indices:** `idx_system_settings_key` UNIQUE (key)
**RLS:** NO (solo super_admin)

---

### settings.feature_flags
Feature flags por tenant.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| flag_name | VARCHAR(100) | NOT NULL | - | Nombre del flag |
| flag_type | feature_flag_type | NOT NULL | 'boolean' | Tipo |
| value | JSONB | NOT NULL | 'true' | Valor |
| description | TEXT | NULL | NULL | Descripcion |
| is_active | BOOLEAN | NOT NULL | true | Flag activo |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Indices:** `idx_feature_flags_tenant_name` UNIQUE (tenant_id, flag_name)
**Entity:** `FeatureFlag`

---

## DDL-Accurate Documentation

### system_configuration.system_settings [DDL-ACCURATE]

**Descripcion:** Configuracion global de la plataforma con soporte multi-tenant.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| tenant_id | UUID | NULL | NULL | FK auth_management.tenants ON DELETE CASCADE |
| setting_key | TEXT | NOT NULL | - | Clave unica del setting (ej: "ml_coins_welcome_bonus") |
| setting_category | TEXT | NULL | NULL | Categoria: general, gamification, security, email, storage, analytics, integrations |
| setting_subcategory | TEXT | NULL | NULL | Subcategoria para organizacion adicional |
| setting_value | TEXT | NOT NULL | - | Valor actual del setting |
| value_type | TEXT | NULL | 'string' | Tipo: string, number, boolean, json, array |
| default_value | TEXT | NULL | NULL | Valor por defecto |
| display_name | TEXT | NULL | NULL | Nombre visible para UI |
| description | TEXT | NULL | NULL | Descripcion del setting |
| help_text | TEXT | NULL | NULL | Texto de ayuda para usuarios |
| is_public | BOOLEAN | NULL | false | Visible para todos |
| is_readonly | BOOLEAN | NULL | false | Solo lectura |
| is_system | BOOLEAN | NULL | false | Si es true, no puede ser modificado por usuarios |
| requires_restart | BOOLEAN | NULL | false | Requiere reinicio del sistema |
| validation_rules | JSONB | NULL | '{}' | Reglas de validacion |
| allowed_values | TEXT[] | NULL | NULL | Valores permitidos |
| min_value | NUMERIC | NULL | NULL | Valor minimo (para numericos) |
| max_value | NUMERIC | NULL | NULL | Valor maximo (para numericos) |
| metadata | JSONB | NULL | '{}' | Metadatos adicionales |
| created_by | UUID | NULL | NULL | FK auth_management.profiles |
| updated_by | UUID | NULL | NULL | FK auth_management.profiles |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Constraints:**
- PK: `system_settings_pkey` (id)
- UNIQUE: `system_settings_setting_key_key` (setting_key)
- CHECK: setting_category IN ('general', 'gamification', 'security', 'email', 'storage', 'analytics', 'integrations')
- CHECK: value_type IN ('string', 'number', 'boolean', 'json', 'array')

**Foreign Keys:**
- tenant_id -> auth_management.tenants(id) ON DELETE CASCADE
- created_by -> auth_management.profiles(id)
- updated_by -> auth_management.profiles(id)

**Indices:** `idx_settings_category` (setting_category), `idx_settings_key` (setting_key), `idx_settings_public` (is_public, parcial: is_public = true)
**Trigger:** trg_system_settings_updated_at
**RLS:** habilitado (admin CRUD + public SELECT where is_public = true)
**Entity:** `apps/backend/src/modules/admin/entities/system-setting.entity.ts`

---

### system_configuration.feature_flags [DDL-ACCURATE]

**Descripcion:** Feature flags para activacion gradual de funcionalidades. Soporta tenant y classroom-level overrides.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| flag_key | VARCHAR(100) | NOT NULL | - | Clave unica (ej: 'enable_gamification', 'allow_ai_hints') |
| flag_name | VARCHAR(255) | NOT NULL | - | Nombre descriptivo |
| description | TEXT | NULL | NULL | Descripcion de la funcionalidad |
| category | VARCHAR(50) | NULL | NULL | Categoria: gamification, educational, admin, social, integration |
| is_enabled | BOOLEAN | NOT NULL | false | Feature habilitada |
| is_system_wide | BOOLEAN | NOT NULL | true | Si false, permite overrides por tenant/classroom |
| rollout_percentage | INTEGER | NULL | 100 | Porcentaje de rollout (0-100) |
| rollout_strategy | VARCHAR(50) | NULL | 'all' | Estrategia: all, percentage, whitelist, beta_users, gradual |
| target_users | UUID[] | NULL | ARRAY[]::UUID[] | Whitelist de usuarios |
| target_roles | gamilit_role[] | NULL | ARRAY[]::gamilit_role[] | Roles con acceso |
| starts_at | TIMESTAMPTZ | NULL | NULL | Feature disponible desde |
| ends_at | TIMESTAMPTZ | NULL | NULL | Feature disponible hasta |
| depends_on_flags | JSONB | NULL | '[]' | Array de flag_keys requeridas |
| conflicts_with | JSONB | NULL | '[]' | Array de flag_keys incompatibles |
| default_value | JSONB | NULL | 'true' | Valor por defecto cuando habilitada |
| config_schema | JSONB | NULL | NULL | JSON Schema para validacion |
| config_options | JSONB | NULL | '{}' | Opciones de configuracion adicionales |
| tenant_overrides | JSONB | NULL | '{}' | Overrides por tenant |
| classroom_overrides | JSONB | NULL | '{}' | Overrides por classroom |
| required_role | VARCHAR(50) | NULL | NULL | Rol minimo para toggle |
| is_user_configurable | BOOLEAN | NULL | false | Usuarios pueden cambiar |
| tags | JSONB | NULL | '[]' | Tags organizativos |
| documentation_url | TEXT | NULL | NULL | Link a documentacion |
| changelog | TEXT | NULL | NULL | Historial de cambios |
| created_by | UUID | NULL | NULL | FK auth_management.profiles ON DELETE SET NULL |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| enabled_at | TIMESTAMPTZ | NULL | NULL | Ultima habilitacion (auto por trigger) |
| disabled_at | TIMESTAMPTZ | NULL | NULL | Ultima deshabilitacion (auto por trigger) |
| deprecated_at | TIMESTAMPTZ | NULL | NULL | Fecha de deprecacion |
| will_be_removed_at | TIMESTAMPTZ | NULL | NULL | Fecha planeada de eliminacion |

**Constraints:**
- PK: id
- UNIQUE: flag_key
- CHECK: rollout_percentage >= 0 AND rollout_percentage <= 100
- CHECK: rollout_strategy IN ('all', 'percentage', 'whitelist', 'beta_users', 'gradual')

**Foreign Keys:**
- created_by -> auth_management.profiles(id) ON DELETE SET NULL

**Indices:** `idx_feature_flags_key` (flag_key), `idx_feature_flags_enabled` (flag_key, parcial: is_enabled = true), `idx_feature_flags_category` (category, is_enabled), `idx_feature_flags_system_wide` (is_system_wide, is_enabled), `idx_feature_flags_tags` (GIN, tags)
**Trigger:** update_feature_flags_timestamp (tracks enabled_at/disabled_at changes)
**Functions:** `system_configuration.is_feature_enabled(flag_key, tenant_id, classroom_id)` - Check if feature is enabled for context
**Entity:** `apps/backend/src/modules/admin/entities/feature-flag.entity.ts`

---

### system_configuration.gamification_parameters [DDL-ACCURATE]

**Descripcion:** Parametros configurables de gamificacion con soporte para overrides por tenant y classroom.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| param_key | VARCHAR(100) | NOT NULL | - | Clave unica (ej: 'points_per_exercise', 'xp_multiplier_weekend') |
| param_name | VARCHAR(255) | NOT NULL | - | Nombre legible del parametro |
| description | TEXT | NULL | NULL | Descripcion |
| category | VARCHAR(50) | NOT NULL | - | Categoria: points, levels, ranks, badges, rewards, penalties, multipliers |
| param_value | JSONB | NOT NULL | - | Valor actual del parametro |
| default_value | JSONB | NOT NULL | - | Valor por defecto |
| value_type | VARCHAR(50) | NOT NULL | - | Tipo: number, string, boolean, object, array |
| min_value | NUMERIC | NULL | NULL | Valor minimo permitido |
| max_value | NUMERIC | NULL | NULL | Valor maximo permitido |
| allowed_values | JSONB | NULL | NULL | Valores permitidos (enum-like) |
| validation_rules | JSONB | NULL | '{}' | Reglas de validacion |
| scope | VARCHAR(50) | NOT NULL | 'global' | Alcance: global, tenant, classroom, student, teacher |
| is_system_managed | BOOLEAN | NULL | false | Si true, no editable via UI |
| is_overridable | BOOLEAN | NULL | true | Si false, no permite overrides en scopes inferiores |
| tenant_overrides | JSONB | NULL | '{}' | Overrides por tenant |
| classroom_overrides | JSONB | NULL | '{}' | Overrides por classroom |
| affects_systems | JSONB | NULL | '[]' | Sistemas afectados (ej: xp_calculation, level_progression) |
| depends_on | JSONB | NULL | '[]' | Dependencias de parametros |
| usage_count | INTEGER | NULL | 0 | Contador de modificaciones |
| last_modified_by | UUID | NULL | NULL | FK auth_management.profiles ON DELETE SET NULL |
| last_modified_at | TIMESTAMPTZ | NULL | NULL | Ultima modificacion |
| tags | JSONB | NULL | '[]' | Tags organizativos |
| documentation | TEXT | NULL | NULL | Documentacion del parametro |
| examples | JSONB | NULL | '[]' | Ejemplos de uso |
| is_active | BOOLEAN | NULL | true | Parametro activo |
| is_deprecated | BOOLEAN | NULL | false | Parametro deprecado |
| deprecated_at | TIMESTAMPTZ | NULL | NULL | Fecha de deprecacion |
| deprecated_reason | TEXT | NULL | NULL | Razon de deprecacion |
| replacement_param_key | VARCHAR(100) | NULL | NULL | Parametro de reemplazo |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

**Constraints:**
- PK: id
- UNIQUE: param_key
- CHECK: value_type IN ('number', 'string', 'boolean', 'object', 'array')
- CHECK: scope IN ('global', 'tenant', 'classroom', 'student', 'teacher')
- CHECK: min_value IS NULL OR max_value IS NULL OR min_value <= max_value

**Foreign Keys:**
- last_modified_by -> auth_management.profiles(id) ON DELETE SET NULL

**Indices:** `idx_gamification_parameters_key` (param_key, parcial: is_active), `idx_gamification_parameters_category` (category, is_active), `idx_gamification_parameters_scope` (scope, is_active), `idx_gamification_parameters_system_managed` (is_system_managed, parcial: is_active), `idx_gamification_parameters_tags` (GIN, tags)
**Trigger:** trg_gamification_parameters_updated_at (auto-updates updated_at, last_modified_at, usage_count)
**Functions:** `system_configuration.get_gamification_param(key, tenant_id, classroom_id)`, `system_configuration.set_classroom_gamification_override(key, classroom_id, value, reason)`
**Entity:** `apps/backend/src/modules/admin/entities/gamification-parameter.entity.ts`

---

### system_configuration.api_configurations [DDL-ACCURATE]
Configuracion de APIs y servicios externos (OAuth, email, SMS, storage, etc.).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| service_name | VARCHAR(100) | NOT NULL | - | Nombre unico del servicio |
| service_type | VARCHAR(50) | NOT NULL | - | Tipo: oauth, payment, email, sms, storage, analytics, other |
| api_endpoint | TEXT | NOT NULL | - | URL base del endpoint |
| api_key_encrypted | TEXT | NULL | NULL | API key (encriptada) |
| api_secret_encrypted | TEXT | NULL | NULL | API secret (encriptada) |
| additional_config | JSONB | NULL | NULL | Configuracion adicional |
| is_active | BOOLEAN | NOT NULL | true | Servicio activo |
| rate_limit_per_minute | INTEGER | NULL | NULL | Limite de llamadas por minuto |
| timeout_seconds | INTEGER | NULL | 30 | Timeout de peticion en segundos |
| retry_attempts | INTEGER | NULL | 3 | Intentos de reintento |
| created_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |
| updated_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |

**Primary Key:** id
**Unique:** service_name
**Check:** service_type IN ('oauth', 'payment', 'email', 'sms', 'storage', 'analytics', 'other')
**Indices:** `idx_api_configurations_service_name`, `idx_api_configurations_service_type`, `idx_api_configurations_is_active`, `idx_api_configurations_config_gin` (GIN, parcial)
**Trigger:** trg_api_configurations_updated_at
**Entity:** `apps/backend/src/modules/admin/entities/api-configuration.entity.ts`

---

### system_configuration.environment_configs [DDL-ACCURATE]
Configuracion por entorno de ejecucion (dev, staging, prod, test).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| environment | VARCHAR(50) | NOT NULL | - | Entorno: development, staging, production, test |
| config_key | VARCHAR(100) | NOT NULL | - | Clave de configuracion (ej: max_upload_size) |
| config_value | TEXT | NOT NULL | - | Valor de la configuracion |
| is_encrypted | BOOLEAN | NOT NULL | false | Valor encriptado |
| is_sensitive | BOOLEAN | NOT NULL | false | Contiene datos sensibles (passwords, keys) |
| description | TEXT | NULL | NULL | Descripcion del parametro |
| created_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |
| updated_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |

**Primary Key:** id
**Unique:** (environment, config_key)
**Check:** environment IN ('development', 'staging', 'production', 'test')
**Indices:** `idx_environment_configs_environment`, `idx_environment_configs_key`, `idx_environment_configs_env_key`, `idx_environment_configs_sensitive` (parcial: is_sensitive=true)
**Trigger:** trg_environment_configs_updated_at
**Entity:** `apps/backend/src/modules/admin/entities/environment-config.entity.ts`

---

### system_configuration.notification_settings [DDL-ACCURATE]
Configuracion de notificaciones por usuario y canal de entrega.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| tenant_id | UUID | NULL | NULL | FK auth_management.tenants |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles |
| notification_type | TEXT | NOT NULL | - | Tipo de notificacion (ej: achievement_earned) |
| channel | TEXT | NOT NULL | - | Canal: email, sms, push, in_app, webhook |
| is_enabled | BOOLEAN | NULL | true | Notificaciones habilitadas |
| frequency | TEXT | NULL | 'immediate' | Frecuencia: immediate, daily, weekly, never |
| quiet_hours_start | TIME | NULL | NULL | Inicio de horas de silencio |
| quiet_hours_end | TIME | NULL | NULL | Fin de horas de silencio |
| max_per_day | INTEGER | NULL | 999 | Maximo de notificaciones por dia |
| template_id | UUID | NULL | NULL | ID del template asociado |
| retry_policy | JSONB | NULL | '{}' | Politica de reintentos |
| delivery_settings | JSONB | NULL | '{}' | Configuracion especifica del canal |
| metadata | JSONB | NULL | '{}' | Datos adicionales |
| created_by | UUID | NULL | NULL | FK auth_management.profiles |
| updated_by | UUID | NULL | NULL | FK auth_management.profiles |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |

**Primary Key:** id
**Unique:** (user_id, notification_type, channel)
**Foreign Keys:** user_id → auth_management.profiles ON DELETE CASCADE, tenant_id → auth_management.tenants ON DELETE CASCADE
**Checks:** channel IN ('email','sms','push','in_app','webhook'), frequency IN ('immediate','daily','weekly','never'), max_per_day > 0
**Indices:** `idx_notification_settings_user`, `idx_notification_settings_enabled`, `idx_notification_settings_type`, `idx_notification_settings_channel`, `idx_notification_settings_tenant`
**RLS:** habilitado (self + admin + tenant)
**Entity:** `apps/backend/src/modules/admin/entities/notification-settings.entity.ts`

---

### system_configuration.notification_settings_globals [DDL-ACCURATE]
Configuracion GLOBAL de notificaciones a nivel de sistema (sin user_id).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| notification_type | TEXT | NOT NULL | - | Tipo de notificacion (achievement_unlocked, rank_promotion, etc.) |
| channel | TEXT | NOT NULL | - | Canal: email, sms, push, in_app |
| is_enabled | BOOLEAN | NOT NULL | true | Notificacion habilitada globalmente |
| priority | TEXT | NULL | NULL | Prioridad: urgent, high, normal, low |
| template_id | UUID | NULL | NULL | ID del template de contenido |
| throttle_minutes | INTEGER | NULL | 0 | Minutos minimos entre envios del mismo tipo (0 = sin throttle) |
| batch_enabled | BOOLEAN | NULL | false | Agrupar notificaciones similares |
| batch_window_minutes | INTEGER | NULL | NULL | Ventana para batching (req si batch_enabled=true) |
| settings | JSONB | NULL | '{}' | Configuracion adicional (sender_name, reply_to, etc.) |
| created_at | TIMESTAMPTZ | NOT NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | gamilit.now_mexico() | - |

**Primary Key:** id
**Unique:** (notification_type, channel) (`notification_settings_globals_unique`)
**Check:** channel IN ('email','sms','push','in_app'), priority IN ('urgent','high','normal','low'), throttle_minutes >= 0
**RLS:** habilitado (solo admins)
**Nota:** Diferente de `notification_settings` (por usuario) -- esta tabla es configuracion global del sistema
**Entity:** `apps/backend/src/modules/admin/entities/notification-settings-global.entity.ts`

---

### system_configuration.rate_limits [DDL-ACCURATE]
Configuracion de limites de tasa (rate limiting) para endpoints y operaciones de la API.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| resource_type | TEXT | NOT NULL | - | Tipo de recurso: endpoint, operation |
| resource_identifier | TEXT | NOT NULL | - | Identificador (URL o nombre de operacion) |
| max_requests | INTEGER | NOT NULL | - | Maximo de requests en la ventana de tiempo |
| window_seconds | INTEGER | NOT NULL | - | Ventana de tiempo en segundos |
| scope | TEXT | NOT NULL | - | Ambito: ip, user, consumer, global |
| is_enabled | BOOLEAN | NOT NULL | true | Limite activo |
| burst_size | INTEGER | NULL | NULL | Tamano de burst permitido (NULL = sin burst) |
| description | TEXT | NULL | NULL | Descripcion del proposito del limite |
| metadata | JSONB | NULL | '{}' | Metadatos (error_message, retry_after_strategy, exemptions) |
| created_at | TIMESTAMPTZ | NOT NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | gamilit.now_mexico() | - |

**Primary Key:** id
**Unique:** (resource_type, resource_identifier, scope) (`rate_limits_unique_resource`)
**Checks:** resource_type IN ('endpoint','operation'), scope IN ('ip','user','consumer','global'), max_requests > 0, window_seconds > 0
**RLS:** habilitado (solo admins)
**Entity:** `apps/backend/src/modules/admin/entities/rate-limit.entity.ts`

---

### system_configuration.tenant_configurations [DDL-ACCURATE]
Configuraciones especificas por tenant para multi-tenancy.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| tenant_id | UUID | NOT NULL | - | FK auth_management.tenants ON DELETE CASCADE |
| config_key | VARCHAR(100) | NOT NULL | - | Clave de configuracion (ej: primary_color, max_users) |
| config_value | JSONB | NOT NULL | - | Valor de la configuracion |
| config_type | VARCHAR(50) | NOT NULL | - | Tipo: branding, features, limits, permissions, integrations, other |
| is_overridable | BOOLEAN | NOT NULL | true | Tenant puede sobrescribir esta configuracion |
| created_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |
| updated_at | TIMESTAMPTZ | NULL | CURRENT_TIMESTAMP | - |

**Primary Key:** id
**Unique:** (tenant_id, config_key)
**Foreign Keys:** tenant_id → auth_management.tenants ON DELETE CASCADE
**Check:** config_type IN ('branding','features','limits','permissions','integrations','other')
**Indices:** `idx_tenant_configurations_tenant_id`, `idx_tenant_configurations_key`, `idx_tenant_configurations_type`, `idx_tenant_configurations_value_gin` (GIN)
**Trigger:** trg_tenant_configurations_updated_at
**Entity:** `apps/backend/src/modules/admin/entities/tenant-configuration.entity.ts`
**Epic:** EXT-008
