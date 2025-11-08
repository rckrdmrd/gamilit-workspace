# Backups de Archivos Duplicados - 2025-11-07

## Razón del Backup
Archivos duplicados detectados por análisis de dependencias.
Estos archivos fueron eliminados tras confirmar que no tienen referencias activas.

## Archivos en este backup
1. `auth_get_current_user_id.sql` - Duplicado de gamilit/functions/02-get_current_user_id.sql (0 referencias)
2. `public_trg_feature_flags_updated_at.sql` - Duplicado en schema incorrecto
3. `public_trg_system_settings_updated_at.sql` - Duplicado en schema incorrecto

## Análisis Completo
Ver: `/gamilit/orchestration/05-validaciones/database/ANALISIS-DEPENDENCIAS-DUPLICADOS-2025-11-07.md`

## Versiones Canónicas (MANTENER)
1. `gamilit/functions/02-get_current_user_id.sql` - 73 referencias en DDL
2. `system_configuration/triggers/29-trg_feature_flags_updated_at.sql` - Ubicación correcta
3. `system_configuration/triggers/30-trg_system_settings_updated_at.sql` - Ubicación correcta

## Restauración (solo si es necesario)
```bash
# Restaurar función (NO RECOMENDADO - 0 referencias)
cp auth_get_current_user_id.sql ../../ddl/schemas/auth/functions/get_current_user_id.sql

# Restaurar triggers (NO RECOMENDADO - schema incorrecto)
cp public_trg_feature_flags_updated_at.sql ../../ddl/schemas/public/triggers/29-trg_feature_flags_updated_at.sql
cp public_trg_system_settings_updated_at.sql ../../ddl/schemas/public/triggers/30-trg_system_settings_updated_at.sql
```

**IMPORTANTE:** Los archivos eliminados NO tienen referencias activas o están en ubicación incorrecta.
La restauración solo debe hacerse si se detecta un error específico.

## Timestamp
- **Fecha backup:** 2025-11-07T18:45:00Z
- **Análisis basado en:** 73 referencias medidas en DDL, Backend, Frontend y Docs
- **Decisión:** Data-driven
