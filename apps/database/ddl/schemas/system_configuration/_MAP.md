# Schema: system_configuration

Configuración del sistema: feature flags, ajustes, rate limiting.

## Estructura

- **tables/**: 8 archivos
- **functions/**: 2 archivos
- **triggers/**: 2 archivos
- **rls-policies/**: 1 archivo

**Total:** 13 objetos DDL

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

---

**Última actualización:** 2025-12-27
