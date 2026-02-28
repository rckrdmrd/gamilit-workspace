---
titulo: "ET-SYS-001: Especificacion Sistema de Configuracion"
tipo: especificacion-tecnica
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# ET-SYS-001: Especificacion Sistema de Configuracion

**Version:** 1.0.0
**Fecha:** 2026-02-03
**Epic:** EAI-006 (Configuracion Sistema)
**Prioridad:** P0 - CRITICA
**Estado:** Documentado

---

## 1. Descripcion General

El Sistema de Configuracion de GAMILIT proporciona una arquitectura robusta y flexible para gestionar la configuracion de la plataforma a multiples niveles: global, tenant, classroom y usuario. Este sistema permite la personalizacion de la experiencia de usuario, control de funcionalidades mediante feature flags, limites de tasa, parametros de gamificacion y configuraciones de notificaciones.

### 1.1 Objetivos
- Centralizar todas las configuraciones del sistema en un schema dedicado
- Soportar multi-tenancy con configuraciones heredables y sobreescribibles
- Proporcionar feature flags con rollout gradual y A/B testing
- Gestionar rate limiting para proteccion de API
- Permitir parametrizacion de mecanicas de gamificacion

### 1.2 Alcance
- Schema: `system_configuration`
- Backend Module: `admin/services/admin-system.service.ts`
- Controller: `admin/controllers/admin-system.controller.ts`

---

## 2. Tablas Involucradas

### 2.1 system_settings
**Proposito:** Configuracion global de la plataforma

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | UUID | Identificador unico |
| tenant_id | UUID | FK a tenants (opcional para config global) |
| setting_key | TEXT | Clave unica del setting |
| setting_category | TEXT | general, gamification, security, email, storage, analytics, integrations |
| setting_subcategory | TEXT | Subcategoria opcional |
| setting_value | TEXT | Valor actual |
| value_type | TEXT | string, number, boolean, json, array |
| default_value | TEXT | Valor por defecto |
| display_name | TEXT | Nombre para UI |
| description | TEXT | Descripcion detallada |
| is_public | BOOLEAN | Visible para usuarios no-admin |
| is_readonly | BOOLEAN | No modificable via UI |
| is_system | BOOLEAN | No modificable por usuarios |
| requires_restart | BOOLEAN | Requiere reinicio para aplicar |
| validation_rules | JSONB | Reglas de validacion |
| allowed_values | TEXT[] | Valores permitidos |
| min_value | NUMERIC | Valor minimo (para numeros) |
| max_value | NUMERIC | Valor maximo (para numeros) |
| metadata | JSONB | Metadatos adicionales |

**RLS Policies:**
- `system_settings_select_admin`: Admins tienen acceso completo
- `system_settings_select_public`: Usuarios ven settings publicos
- `system_settings_select_all`: Usuarios autenticados pueden leer

### 2.2 feature_flags
**Proposito:** Control de funcionalidades con rollout gradual

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | UUID | Identificador unico |
| flag_key | VARCHAR(100) | Clave unica del feature flag |
| flag_name | VARCHAR(255) | Nombre descriptivo |
| description | TEXT | Descripcion del feature |
| category | VARCHAR(50) | gamification, educational, admin, social, integration |
| is_enabled | BOOLEAN | Estado global del flag |
| is_system_wide | BOOLEAN | Si aplica a todo el sistema |
| rollout_percentage | INTEGER | Porcentaje de rollout (0-100) |
| rollout_strategy | VARCHAR(50) | all, percentage, whitelist, beta_users, gradual |
| target_users | UUID[] | Lista de usuarios whitelisted |
| target_roles | gamilit_role[] | Roles con acceso |
| starts_at | TIMESTAMPTZ | Inicio de disponibilidad |
| ends_at | TIMESTAMPTZ | Fin de disponibilidad |
| depends_on_flags | JSONB | Dependencias de otros flags |
| conflicts_with | JSONB | Conflictos con otros flags |
| tenant_overrides | JSONB | Overrides por tenant |
| classroom_overrides | JSONB | Overrides por classroom |
| is_user_configurable | BOOLEAN | Usuarios pueden modificar |

**Funcion Principal:** `system_configuration.is_feature_enabled(flag_key, user_id, tenant_id, classroom_id)`
- Prioridad de evaluacion:
  1. Classroom override (maxima prioridad)
  2. Tenant override
  3. System-wide flag
  4. User whitelist
  5. Role-based access
  6. Rollout percentage
  7. Time windows

### 2.3 rate_limits
**Proposito:** Proteccion de API mediante rate limiting

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | UUID | Identificador unico |
| resource_type | TEXT | endpoint, operation |
| resource_identifier | TEXT | Ruta o nombre de operacion |
| max_requests | INTEGER | Maximo de requests permitidos |
| window_seconds | INTEGER | Ventana de tiempo |
| scope | TEXT | ip, user, consumer, global |
| is_enabled | BOOLEAN | Limite activo |
| burst_size | INTEGER | Tamano de burst permitido |
| description | TEXT | Descripcion del limite |
| metadata | JSONB | Configuracion adicional |

**Casos de Uso:**
- Proteccion contra ataques de fuerza bruta
- Limites de API para consumidores LTI
- Throttling de operaciones costosas
- Fair usage entre usuarios

### 2.4 gamification_parameters
**Proposito:** Parametros configurables de gamificacion

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | UUID | Identificador unico |
| param_key | VARCHAR(100) | Clave unica del parametro |
| param_name | VARCHAR(255) | Nombre descriptivo |
| category | VARCHAR(50) | points, levels, ranks, badges, rewards, penalties, multipliers |
| param_value | JSONB | Valor actual |
| default_value | JSONB | Valor por defecto |
| value_type | VARCHAR(50) | number, string, boolean, object, array |
| scope | VARCHAR(50) | global, tenant, classroom, student, teacher |
| is_system_managed | BOOLEAN | No modificable via UI |
| is_overridable | BOOLEAN | Permite overrides |
| tenant_overrides | JSONB | Overrides por tenant |
| classroom_overrides | JSONB | Overrides por classroom |
| affects_systems | JSONB | Sistemas afectados |

**Funciones:**
- `system_configuration.get_gamification_param(param_key, tenant_id, classroom_id)`
- `system_configuration.set_classroom_gamification_override(param_key, classroom_id, value, reason)`

### 2.5 notification_settings_global
**Proposito:** Configuracion global de notificaciones

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | UUID | Identificador unico |
| notification_type | TEXT | Tipo de notificacion |
| channel | TEXT | email, sms, push, in_app |
| is_enabled | BOOLEAN | Habilitado globalmente |
| priority | TEXT | urgent, high, normal, low |
| template_id | UUID | Template a usar |
| throttle_minutes | INTEGER | Minutos entre notificaciones |
| batch_enabled | BOOLEAN | Agrupar notificaciones |
| batch_window_minutes | INTEGER | Ventana de agrupacion |
| settings | JSONB | Configuracion adicional |

### 2.6 api_configuration
**Proposito:** Configuracion de APIs externas

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | UUID | Identificador unico |
| service_name | VARCHAR(100) | Nombre del servicio |
| service_type | VARCHAR(50) | oauth, payment, email, sms, storage, analytics, other |
| api_endpoint | TEXT | URL del endpoint |
| api_key_encrypted | TEXT | API key encriptada |
| api_secret_encrypted | TEXT | API secret encriptado |
| additional_config | JSONB | Configuracion adicional |
| is_active | BOOLEAN | Servicio activo |
| rate_limit_per_minute | INTEGER | Limite de llamadas |
| timeout_seconds | INTEGER | Timeout de conexion |
| retry_attempts | INTEGER | Intentos de reintento |

### 2.7 environment_config
**Proposito:** Configuracion por ambiente

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | UUID | Identificador unico |
| environment | VARCHAR(50) | development, staging, production, test |
| config_key | VARCHAR(100) | Clave de configuracion |
| config_value | TEXT | Valor |
| is_encrypted | BOOLEAN | Valor encriptado |
| is_sensitive | BOOLEAN | Dato sensible |
| description | TEXT | Descripcion |

### 2.8 tenant_configurations
**Proposito:** Configuraciones especificas por tenant

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | UUID | Identificador unico |
| tenant_id | UUID | FK a tenants |
| config_key | VARCHAR(100) | Clave de configuracion |
| config_value | JSONB | Valor en JSONB |
| config_type | VARCHAR(50) | branding, features, limits, permissions, integrations, other |
| is_overridable | BOOLEAN | Permite override por tenant |

---

## 3. APIs

### 3.1 Endpoints de Sistema (Admin)

**Base Path:** `/admin/system`

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/health` | Estado de salud del sistema |
| GET | `/metrics` | Metricas de rendimiento |
| GET | `/config` | Configuracion actual del sistema |
| POST | `/config` | Actualizar configuracion |
| GET | `/config/categories` | Categorias de configuracion disponibles |
| POST | `/config/validate` | Validar configuracion antes de aplicar |
| GET | `/config/:category` | Configuracion por categoria |
| PUT | `/config/:category` | Actualizar configuracion por categoria |
| GET | `/logs` | Logs del sistema paginados |
| GET | `/audit-log` | Logs de auditoria |
| POST | `/maintenance` | Toggle modo mantenimiento |
| POST | `/maintenance/cleanup-logs` | Limpieza de logs antiguos |
| POST | `/maintenance/cleanup-activity` | Limpieza de actividad de usuarios |
| POST | `/maintenance/optimize-database` | Optimizacion de BD (VACUUM) |
| POST | `/maintenance/clear-cache` | Limpiar cache |
| POST | `/maintenance/cleanup-sessions` | Limpiar sesiones expiradas |
| GET | `/cron/status` | Estado de jobs CRON |

### 3.2 DTOs Principales

```typescript
// UpdateSystemConfigDto
interface UpdateSystemConfigDto {
  maintenance_mode?: boolean;
  allow_registration?: boolean;
  require_email_verification?: boolean;
  session_timeout_minutes?: number;
  max_login_attempts?: number;
  lockout_duration_minutes?: number;
}

// SystemConfigDto (Response)
interface SystemConfigDto {
  maintenance_mode: boolean;
  maintenance_message?: string;
  allow_registration: boolean;
  require_email_verification: boolean;
  session_timeout_minutes: number;
  max_login_attempts: number;
  lockout_duration_minutes: number;
  updated_at: string;
  updated_by?: string;
}

// ValidateConfigDto
interface ValidateConfigDto {
  category: string;
  config: Record<string, unknown>;
}

// ConfigValidationResultDto
interface ConfigValidationResultDto {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
}
```

---

## 4. Campos de Configuracion

### 4.1 Categorias de Settings

| Categoria | Descripcion | Ejemplos |
|-----------|-------------|----------|
| general | Configuracion general | app_name, default_language, timezone |
| gamification | Parametros de juego | xp_per_exercise, level_thresholds |
| security | Seguridad | max_login_attempts, session_timeout |
| email | Configuracion email | smtp_host, from_address |
| storage | Almacenamiento | max_upload_size, allowed_extensions |
| analytics | Analiticas | retention_days, sampling_rate |
| integrations | Integraciones | lti_enabled, oauth_providers |

### 4.2 Feature Flags Principales

| Flag Key | Descripcion | Default |
|----------|-------------|---------|
| enable_gamification | Activar sistema de gamificacion | true |
| enable_ai_hints | Pistas con IA | false |
| enable_peer_challenges | Desafios P2P | true |
| enable_leaderboards | Tablas de clasificacion | true |
| enable_achievements | Sistema de logros | true |
| enable_social_features | Funciones sociales | true |
| enable_parent_portal | Portal para padres | false |
| enable_lti_integration | Integracion LTI | true |

---

## 5. Validaciones

### 5.1 Validaciones de Settings
- Tipo de valor debe coincidir con `value_type`
- Valores numericos dentro de `min_value` y `max_value`
- Valores permitidos verificados contra `allowed_values`
- Reglas de validacion aplicadas desde `validation_rules`
- Settings `is_system` no modificables via API

### 5.2 Validaciones de Feature Flags
- `rollout_percentage` entre 0 y 100
- `rollout_strategy` en valores permitidos
- Ventanas de tiempo validas (`starts_at` < `ends_at`)
- Dependencias de flags verificadas
- Conflictos detectados antes de activar

### 5.3 Validaciones de Rate Limits
- `max_requests` > 0
- `window_seconds` > 0
- `burst_size` > 0 si presente
- Combinacion unica de `resource_type` + `resource_identifier` + `scope`

---

## 6. Dependencias

### 6.1 Dependencias de Schema
- `auth_management.profiles` - Referencias a usuarios
- `auth_management.tenants` - Multi-tenancy
- `auth_management.gamilit_role` - Enum de roles

### 6.2 Dependencias de Backend
- `AdminSystemService` - Logica de negocio
- `GamificationConfigService` - Parametros de gamificacion
- `SecurityService` - Validaciones de seguridad
- `JwtAuthGuard` - Autenticacion
- `AdminGuard` - Autorizacion de admin

### 6.3 Funciones de Base de Datos
- `gamilit.is_admin()` - Verificar rol admin
- `gamilit.is_super_admin()` - Verificar super admin
- `gamilit.get_current_user_id()` - Obtener usuario actual
- `gamilit.get_current_tenant_id()` - Obtener tenant actual

---

## 7. Seguridad

### 7.1 Control de Acceso
- Todas las operaciones requieren autenticacion (`JwtAuthGuard`)
- Modificaciones requieren rol admin (`AdminGuard`)
- RLS habilitado en todas las tablas
- Auditoría de cambios via `updated_by` y `updated_at`

### 7.2 Datos Sensibles
- API keys encriptadas en `api_configuration`
- Passwords marcados como `is_sensitive` en `environment_config`
- No exposicion de settings con `is_public = false` a usuarios no-admin

---

## 8. Referencias

- **DDL:** `apps/database/ddl/schemas/system_configuration/`
- **Backend Service:** `apps/backend/src/modules/admin/services/admin-system.service.ts`
- **Controller:** `apps/backend/src/modules/admin/controllers/admin-system.controller.ts`
- **Entities:** `apps/backend/src/modules/admin/entities/`
- **DTOs:** `apps/backend/src/modules/admin/dto/system/`

---

*Documento generado automaticamente - BLOQUE 2 Plan Maestro GAMILIT*
*Fecha: 2026-02-03 | Version: 1.0.0*
