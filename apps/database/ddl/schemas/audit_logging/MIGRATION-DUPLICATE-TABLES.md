# Migración de Tablas Duplicadas - audit_logging

**Fecha de análisis**: 2025-01-04
**Estado**: Pendiente de migración coordinada con backend

## Resumen de Duplicados Detectados

### Tablas de Actividad de Usuario

Se detectaron 3 tablas con funcionalidad superpuesta:

| Tabla | Archivo | Propósito | Estado |
|-------|---------|-----------|--------|
| `user_activity_logs` | 05-user_activity_logs.sql | Analytics detallado (26+ columnas) | **CANÓNICA** |
| `activity_log` | 06-activity_log.sql | Admin dashboard (entity tracking) | **CANÓNICA** |
| `user_activity` | 07-user_activity.sql | Log simple (8 columnas) | **DEPRECADA** |

### Análisis de Campos

#### user_activity (DEPRECADA)
```sql
id, user_id, activity_type, description, metadata, ip_address, user_agent, created_at
```

#### activity_log (CANÓNICA - Admin Dashboard)
```sql
id, user_id, action_type, entity_type, entity_id, description, metadata, ip_address, user_agent, created_at, updated_at
```

#### user_activity_logs (CANÓNICA - Analytics)
```sql
id, user_id, tenant_id, activity_type, action_detail, page_url, page_title, referrer_url,
session_id, session_duration, element_id, element_type, element_text, coordinates,
module_id, exercise_id, classroom_id, user_agent, ip_address, device_type, browser_name,
browser_version, screen_resolution, load_time_ms, interaction_time_ms, metadata, created_at
```

## Plan de Migración

### Fase 1: Actualizar Backend (Requerido)

**Archivos a modificar en backend:**

1. **Entities**:
   - `apps/backend/src/modules/admin/entities/user-activity.entity.ts`
   - Cambiar referencia de `user_activity` → `activity_log`

2. **DTOs**:
   - `apps/backend/src/modules/admin/dto/user-activity.dto.ts`
   - Mapear `activity_type` → `action_type`

3. **Services**:
   - `apps/backend/src/modules/admin/services/admin.service.ts`
   - `apps/backend/src/modules/admin/services/admin-stats.service.ts`
   - Actualizar queries

4. **Controllers**:
   - `apps/backend/src/modules/admin/controllers/admin.controller.ts`

### Fase 2: Crear Vista de Compatibilidad (Transición)

Después de actualizar el backend, ejecutar:

```sql
-- Paso 1: Renombrar tabla deprecada
ALTER TABLE audit_logging.user_activity RENAME TO _deprecated_user_activity;

-- Paso 2: Crear vista de compatibilidad
CREATE OR REPLACE VIEW audit_logging.user_activity AS
SELECT
    id,
    user_id,
    action_type AS activity_type,
    description,
    metadata,
    ip_address,
    user_agent,
    created_at
FROM audit_logging.activity_log;

COMMENT ON VIEW audit_logging.user_activity IS
    'DEPRECATED: Vista de compatibilidad. Migrar a activity_log. Será eliminada en v2.0';
```

### Fase 3: Eliminar Tabla Deprecada

Después de período de validación (recomendado: 2 sprints):

```sql
DROP VIEW IF EXISTS audit_logging.user_activity;
DROP TABLE IF EXISTS audit_logging._deprecated_user_activity CASCADE;
```

## Referencias Encontradas en Backend/Frontend

### Backend (13+ referencias)
- `apps/backend/src/modules/admin/entities/user-activity.entity.ts`
- `apps/backend/src/modules/admin/dto/user-activity.dto.ts`
- `apps/backend/src/modules/admin/dto/admin-stats.dto.ts`
- `apps/backend/src/modules/admin/services/admin.service.ts`
- `apps/backend/src/modules/admin/services/admin-stats.service.ts`
- `apps/backend/src/modules/admin/controllers/admin.controller.ts`

### Frontend (Portal Admin)
- Componentes de dashboard que consumen endpoints de actividad

## Decisiones Arquitectónicas

1. **Mantener `activity_log`**: Tiene campos adicionales (`entity_type`, `entity_id`, `updated_at`) necesarios para el dashboard de admin

2. **Mantener `user_activity_logs`**: Tiene campos de analytics detallados no disponibles en otras tablas

3. **Deprecar `user_activity`**: Es un subconjunto de `activity_log`, no aporta valor adicional

## Notas Importantes

- NO eliminar tablas sin coordinar con el equipo de backend
- Realizar backup de datos antes de migración
- Ejecutar migración en ambiente de staging primero
- Monitorear logs de error por 48h después de migración
