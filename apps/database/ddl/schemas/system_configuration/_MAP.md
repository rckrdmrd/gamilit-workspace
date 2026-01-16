# _MAP: system_configuration/

**Ultima actualizacion:** 2026-01-14
**Estado:** Produccion
**Tipo:** System/Configuration
**Objetos activos:** 14

---

## Proposito

Configuracion del sistema: feature flags, ajustes, rate limiting.
Soporta configuracion multi-tenant y por ambiente (dev, staging, prod).

**Audiencia:** Backend Developers, DevOps

## Estructura

- **tables/**: 8 archivos
- **enums/**: 1 archivo (setting_type)
- **functions/**: 2 archivos
- **triggers/**: 1 archivo activo (00-batch_updated_at_triggers.sql consolidado)
- **triggers/_deprecated/**: 2 archivos (triggers updated_at individuales)
- **rls-policies/**: 1 archivo

**Total:** 14 objetos DDL

## Tablas

| Tabla | Propósito |
|-------|-----------|
| `system_settings` | Configuración general del sistema |
| `feature_flags` | Flags de funcionalidades on/off |
| `notification_settings` | Preferencias de notificaciones por usuario |
| `rate_limits` | Límites de rate para API |
| `notification_settings_global` | Configuración global de notificaciones |
| `api_configuration` | Configuración de API |
| `environment_config` | Configuración por ambiente |
| `tenant_configurations` | Configuración por tenant |

## Funciones

| Función | Propósito |
|---------|-----------|
| `is_feature_enabled` | Verifica si un feature flag está activo |
| `update_feature_flag` | Actualiza estado de feature flag |

## Notificaciones - Dos Tablas Separadas

1. **notification_settings** (por usuario): Preferencias individuales
2. **notification_settings_global** (sistema): Configuración por defecto global

## Rate Limiting

Protección de API contra uso excesivo con:
- Múltiples scopes: ip, user, consumer, global
- Burst allowance para picos temporales

## Consolidacion de Triggers (2026-01-07)

Triggers de `updated_at` consolidados en `00-batch_updated_at_triggers.sql`:
- `feature_flags_updated_at`
- `system_settings_updated_at`

Archivos originales movidos a `triggers/_deprecated/`.

## Migracion de ENUMs (2026-01-07)

ENUMs migrados desde `00-prerequisites.sql` a archivos individuales en `enums/`:
- `setting_type` - Tipos de configuracion

---

**Ultima actualizacion:** 2026-01-07
**Cambios recientes:**
- CONSOLIDACION BD: Triggers updated_at consolidados (2026-01-07)
- CONSOLIDACION BD: ENUMs migrados a archivos individuales (2026-01-07)
