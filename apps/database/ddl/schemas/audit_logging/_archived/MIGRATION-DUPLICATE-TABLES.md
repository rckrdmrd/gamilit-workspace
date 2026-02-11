# Migración de Tablas Duplicadas - audit_logging

**Fecha de análisis**: 2025-01-04
**Estado**: ✅ **MIGRACIÓN COMPLETADA** (2026-01-07)

---

## RESUMEN DE EJECUCIÓN (2026-01-07)

| Acción | Estado |
|--------|--------|
| Auditoría de referencias backend | ✅ Completada - 0 usos activos encontrados |
| Constante `USER_ACTIVITY` en database.constants.ts | ✅ Eliminada |
| Archivo DDL `07-user_activity.sql` | ✅ Movido a `_deprecated/` |
| Documentación `_MAP.md` | ✅ Actualizada |

**Resultado:** La tabla `audit_logging.user_activity` ha sido eliminada del codebase.
El código ya usaba `activity_log` o `user_activity_logs` - la migración ya estaba implícitamente completada.

---

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

## Plan de Migración - ✅ EJECUTADO

### ~~Fase 1: Actualizar Backend~~ - NO REQUERIDA

**Hallazgo (2026-01-07):** Al auditar el código backend:
- **0 referencias activas** a la tabla `audit_logging.user_activity`
- La entidad `UserActivity` en `/modules/social/` apunta a `social_features.user_activities` (tabla diferente)
- El código ya usaba `activity_log` para admin dashboard
- La migración estaba implícitamente completada

### ~~Fase 2: Vista de Compatibilidad~~ - NO REQUERIDA

No fue necesaria - no había código dependiente.

### Fase 3: Eliminación - ✅ COMPLETADA (2026-01-07)

**Acciones ejecutadas:**
```bash
# 1. Eliminada constante de database.constants.ts
# 2. DDL movido a _deprecated/
mv ddl/schemas/audit_logging/tables/07-user_activity.sql _deprecated/
```

**En producción ejecutar:**
```sql
-- Solo si la tabla existe en la BD
DROP TABLE IF EXISTS audit_logging.user_activity CASCADE;
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
