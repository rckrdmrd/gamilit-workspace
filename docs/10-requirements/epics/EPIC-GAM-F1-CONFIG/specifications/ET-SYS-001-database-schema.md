---
id: "ET-SYS-001"
title: "Especificacion Tecnica - Schema system_configuration"
type: "Technical Specification"
status: "Done"
priority: "Alta"
module: "Configuracion del Sistema"
epic: "EAI-006"
version: "1.0"
labels: ["system", "configuration", "database", "schema", "technical"]
created_date: "2026-01-10"
updated_date: "2026-01-10"
---

# ET-SYS-001: Especificacion Tecnica - Schema system_configuration

**ID:** ET-SYS-001
**Titulo:** Schema de Base de Datos para Configuracion del Sistema
**Prioridad:** Alta
**Estado:** Implementado
**Fase:** 1 - Alcance Inicial
**Epica:** EAI-006 - Configuracion del Sistema

---

## Descripcion General

El schema `system_configuration` contiene todas las tablas relacionadas con la configuracion global de la plataforma GAMILIT, incluyendo settings del sistema, feature flags, parametros de gamificacion, configuraciones de notificaciones y rate limiting.

---

## Tablas del Schema

### 1. system_settings

**Archivo DDL:** `ddl/schemas/system_configuration/tables/01-system_settings.sql`

**Proposito:** Almacena configuraciones clave-valor para el sistema.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Identificador unico |
| tenant_id | UUID | SI | NULL | ID del tenant (null = global) |
| setting_key | TEXT | NO | - | Clave unica del setting |
| setting_category | TEXT | SI | - | Categoria (general, gamification, security, email, storage, analytics, integrations) |
| setting_subcategory | TEXT | SI | - | Subcategoria opcional |
| setting_value | TEXT | NO | - | Valor actual |
| value_type | TEXT | SI | 'string' | Tipo (string, number, boolean, json, array) |
| default_value | TEXT | SI | - | Valor por defecto |
| display_name | TEXT | SI | - | Nombre para mostrar |
| description | TEXT | SI | - | Descripcion |
| help_text | TEXT | SI | - | Texto de ayuda |
| is_public | BOOLEAN | SI | false | Accesible sin autenticacion |
| is_readonly | BOOLEAN | SI | false | No modificable por API |
| is_system | BOOLEAN | SI | false | Configuracion de sistema |
| requires_restart | BOOLEAN | SI | false | Requiere reinicio |
| validation_rules | JSONB | SI | '{}' | Reglas de validacion |
| allowed_values | TEXT[] | SI | - | Valores permitidos |
| min_value | NUMERIC | SI | - | Valor minimo |
| max_value | NUMERIC | SI | - | Valor maximo |
| metadata | JSONB | SI | '{}' | Metadatos adicionales |
| created_by | UUID | SI | - | Usuario que creo |
| updated_by | UUID | SI | - | Usuario que actualizo |
| created_at | TIMESTAMPTZ | SI | now_mexico() | Fecha creacion |
| updated_at | TIMESTAMPTZ | SI | now_mexico() | Fecha actualizacion |

**Constraints:**
- PK: `system_settings_pkey` (id)
- UNIQUE: `system_settings_setting_key_key` (setting_key)
- CHECK: `system_settings_setting_category_check` - valores permitidos
- CHECK: `system_settings_value_type_check` - tipos permitidos

**Indices:**
- `idx_settings_category` (setting_category)
- `idx_settings_key` (setting_key)
- `idx_settings_public` (is_public) WHERE is_public = true

**RLS Policies:**
- `system_settings_select_admin` - SELECT para admins
- `system_settings_insert_admin` - INSERT para admins
- `system_settings_update_admin` - UPDATE para admins
- `system_settings_delete_admin` - DELETE para admins
- `system_settings_select_public` - SELECT para settings publicos

---

### 2. feature_flags

**Archivo DDL:** `ddl/schemas/system_configuration/tables/06-feature_flags.sql`

**Proposito:** Gestiona feature flags del sistema con soporte para rollout gradual.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NO | gen_random_uuid() | Identificador unico |
| flag_key | VARCHAR(100) | NO | - | Clave unica del flag |
| flag_name | VARCHAR(255) | NO | - | Nombre del flag |
| description | TEXT | SI | - | Descripcion |
| category | VARCHAR(50) | SI | - | Categoria |
| is_enabled | BOOLEAN | NO | false | Estado global |
| is_system_wide | BOOLEAN | NO | true | Si puede ser sobrescrito |
| rollout_percentage | INTEGER | SI | 100 | Porcentaje de rollout (0-100) |
| rollout_strategy | VARCHAR(50) | SI | 'all' | Estrategia de rollout |
| depends_on_flags | JSONB | SI | '[]' | Dependencias |
| conflicts_with | JSONB | SI | '[]' | Conflictos |
| default_value | JSONB | SI | 'true' | Valor default |
| config_schema | JSONB | SI | - | Schema de validacion |
| config_options | JSONB | SI | '{}' | Opciones adicionales |
| tenant_overrides | JSONB | SI | '{}' | Sobrescrituras por tenant |
| classroom_overrides | JSONB | SI | '{}' | Sobrescrituras por classroom |
| required_role | VARCHAR(50) | SI | - | Rol requerido |
| is_user_configurable | BOOLEAN | SI | false | Configurable por usuario |
| tags | JSONB | SI | '[]' | Tags |
| documentation_url | TEXT | SI | - | URL de documentacion |
| changelog | TEXT | SI | - | Historial de cambios |
| created_by | UUID | SI | - | Usuario que creo |
| created_at | TIMESTAMPTZ | NO | NOW() | Fecha creacion |
| updated_at | TIMESTAMPTZ | NO | NOW() | Fecha actualizacion |
| enabled_at | TIMESTAMPTZ | SI | - | Ultima habilitacion |
| disabled_at | TIMESTAMPTZ | SI | - | Ultima deshabilitacion |
| deprecated_at | TIMESTAMPTZ | SI | - | Fecha de deprecacion |
| will_be_removed_at | TIMESTAMPTZ | SI | - | Fecha planeada de eliminacion |

**Constraints:**
- PK: `feature_flags_pkey` (id)
- UNIQUE: `feature_flags_flag_key_key` (flag_key)
- CHECK: `feature_flags_rollout_percentage_valid` (0-100)
- CHECK: `feature_flags_rollout_strategy_valid` (all, percentage, whitelist, beta_users, gradual)

**Indices:**
- `idx_feature_flags_key` (flag_key)
- `idx_feature_flags_enabled` (flag_key) WHERE is_enabled = true
- `idx_feature_flags_category` (category, is_enabled)
- `idx_feature_flags_system_wide` (is_system_wide, is_enabled)
- `idx_feature_flags_tags` GIN(tags)

**Funciones:**
- `is_feature_enabled(flag_key, tenant_id, classroom_id)` - Verifica si un feature esta habilitado

---

### 3. gamification_parameters

**Archivo DDL:** `ddl/schemas/system_configuration/tables/02-gamification_parameters.sql`

**Proposito:** Parametros configurables para el sistema de gamificacion.

Contiene configuraciones como:
- ML Coins por accion
- XP por tipo de actividad
- Umbrales de niveles
- Multiplicadores de racha

---

### 4. notification_settings

**Archivo DDL:** `ddl/schemas/system_configuration/tables/03-notification_settings.sql`

**Proposito:** Configuracion de notificaciones por usuario/tenant.

---

### 5. notification_settings_global

**Archivo DDL:** `ddl/schemas/system_configuration/tables/05-notification_settings_global.sql`

**Proposito:** Configuracion global de notificaciones del sistema.

---

### 6. rate_limits

**Archivo DDL:** `ddl/schemas/system_configuration/tables/04-rate_limits.sql`

**Proposito:** Configuracion de rate limiting para APIs y acciones.

---

### 7. api_configuration

**Archivo DDL:** `ddl/schemas/system_configuration/tables/api_configuration.sql`

**Proposito:** Configuracion de APIs externas e integraciones.

---

### 8. environment_config

**Archivo DDL:** `ddl/schemas/system_configuration/tables/environment_config.sql`

**Proposito:** Configuraciones especificas por ambiente (dev, staging, prod).

---

### 9. tenant_configurations

**Archivo DDL:** `ddl/schemas/system_configuration/tables/tenant_configurations.sql`

**Proposito:** Configuraciones especificas por tenant/organizacion.

---

## Funciones del Schema

### is_feature_enabled

```sql
system_configuration.is_feature_enabled(
    p_flag_key VARCHAR,
    p_tenant_id UUID DEFAULT NULL,
    p_classroom_id UUID DEFAULT NULL
) RETURNS BOOLEAN
```

**Proposito:** Verifica si un feature flag esta habilitado para un contexto especifico.

**Logica:**
1. Busca el flag por key
2. Si no existe, retorna FALSE
3. Si esta deshabilitado globalmente, retorna FALSE
4. Si es system_wide, retorna TRUE
5. Verifica override de classroom (mayor prioridad)
6. Verifica override de tenant
7. Retorna estado global del flag

---

## Triggers

### Actualizacion de Timestamps

Cada tabla tiene un trigger que actualiza `updated_at` automaticamente en cada UPDATE.

**Ubicacion:** `ddl/schemas/system_configuration/triggers/00-batch_updated_at_triggers.sql`

### Feature Flags Lifecycle

El trigger de feature_flags tambien actualiza `enabled_at` y `disabled_at` cuando cambia el estado.

---

## RLS Policies

El schema implementa Row Level Security para proteger la configuracion:

**Archivo:** `ddl/schemas/system_configuration/rls-policies/01-policies.sql`

- Administradores tienen acceso completo
- Settings publicos son accesibles por todos
- Feature flags siguen reglas de rol requerido

---

## Enums

### setting_type

**Archivo:** `ddl/schemas/system_configuration/enums/setting_type.sql`

Tipos de valores permitidos para settings.

---

## Seeds

### Desarrollo

- `seeds/dev/system_configuration/01-system_settings.sql`
- `seeds/dev/system_configuration/01-feature_flags_seeds.sql`
- `seeds/dev/system_configuration/02-gamification_parameters_seeds.sql`
- `seeds/dev/system_configuration/03-notification_settings_global.sql`
- `seeds/dev/system_configuration/04-rate_limits.sql`

### Produccion

- `seeds/prod/system_configuration/01-system_settings.sql`
- `seeds/prod/system_configuration/01-feature_flags_seeds.sql`
- `seeds/prod/system_configuration/02-gamification_parameters_seeds.sql`
- `seeds/prod/system_configuration/03-notification_settings_global.sql`
- `seeds/prod/system_configuration/04-rate_limits.sql`

---

## Diagrama de Relaciones

```
system_configuration
├── system_settings
│   └── FK: tenant_id -> auth_management.tenants
│   └── FK: created_by/updated_by -> auth_management.profiles
├── feature_flags
│   └── FK: created_by -> auth_management.profiles
├── gamification_parameters
├── notification_settings
│   └── FK: tenant_id -> auth_management.tenants
├── notification_settings_global
├── rate_limits
├── api_configuration
├── environment_config
└── tenant_configurations
    └── FK: tenant_id -> auth_management.tenants
```

---

## Referencias

- **RF-SYS-001:** [Sistema de Configuracion Global](../requirements/RF-SYS-001-settings.md)
- **RF-SYS-002:** [Feature Flags](../requirements/RF-SYS-002-feature-flags.md)
- **RF-SYS-003:** [Notificaciones](../requirements/RF-SYS-003-notifications.md)
- **US-SYS-001:** [Configuraciones](../user-stories/US-SYS-001/US-SYS-001-configuraciones.md)
- **US-SYS-002:** [Feature Flags](../user-stories/US-SYS-002/US-SYS-002-feature-flags.md)

---

## Historial de Cambios

| Fecha | Version | Descripcion |
|-------|---------|-------------|
| 2026-01-10 | 1.0 | Creacion inicial de especificacion |

---

**Creado:** 2026-01-10
**Ultima actualizacion:** 2026-01-10
**Responsable:** Architecture Analyst
**Estado:** Implementado (documentacion retroactiva)
