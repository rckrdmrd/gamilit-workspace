# Schema: system_configuration

Configuración del sistema: feature flags, ajustes, configuración del sistema

## Estructura

- **tables/**: 6 archivos
- **functions/**: 2 archivos
- **triggers/**: 2 archivos
- **rls-policies/**: 1 archivos

**Total:** 11 objetos

## Contenido Detallado

### tables/ (6 archivos)

```
01-system_settings.sql
02-feature_flags.sql
03-notification_settings.sql
api_configuration.sql
environment_config.sql
tenant_configurations.sql
```

### functions/ (2 archivos)

```
is_feature_enabled.sql
update_feature_flag.sql
```

### triggers/ (2 archivos)

```
29-trg_feature_flags_updated_at.sql
30-trg_system_settings_updated_at.sql
```

### rls-policies/ (1 archivos)

```
01-policies.sql
```

---

**Última actualización:** 2025-11-09
**Reorganización:** 2025-11-09
