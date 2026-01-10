# Schema: audit_logging

Auditoria y logging: actividad de usuarios, eventos del sistema, metricas de rendimiento.

## Estructura

- **tables/**: 7 archivos (user_activity eliminada 2026-01-07)
- **enums/**: 5 archivos activos (log_level, audit_action, alert_severity, alert_status, metric_type)
- **enums/_deprecated/**: 1 archivo (aggregation_period - sin uso)
- **functions/**: 6 archivos
- **triggers/**: 1 archivo activo (00-batch_updated_at_triggers.sql consolidado)
- **triggers/_deprecated/**: 1 archivo (trigger updated_at individual)
- **indexes/**: 14 archivos
- **rls-policies/**: 1 archivo

**Total:** 36 objetos DDL

## Tablas Principales

| Tabla | Proposito | Estado |
|-------|-----------|--------|
| `audit_logs` | Registro de eventos de auditoria (cambios de rol, status, etc.) | Activa |
| `performance_metrics` | Metricas de rendimiento del sistema | Activa |
| `system_alerts` | Alertas del sistema | Activa |
| `system_logs` | Logs generales del sistema | Activa |
| `user_activity_logs` | Logs de actividad de usuarios (analytics detallado) | Activa |
| `activity_log` | Log de actividad para admin dashboard | **CANONICA** |
| ~~`user_activity`~~ | ~~Resumen de actividad por usuario~~ | **ELIMINADA 2026-01-07** |
| `pending_user_initialization` | Usuarios cuya inicializacion de gamificacion fallo (retry automatico) | Activa |

## Migracion de Duplicados - COMPLETADA

**Ver:** `MIGRATION-DUPLICATE-TABLES.md`

| Tabla | Estado | Fecha |
|-------|--------|-------|
| `user_activity` | **ELIMINADA** - Migrado a `activity_log` | 2026-01-07 |

## Funciones

| Funcion | Proposito |
|---------|-----------|
| `cleanup_old_system_logs` | Limpieza de logs antiguos |
| `cleanup_old_user_activity` | Limpieza de actividad antigua |
| `log_audit_event` | Registrar evento de auditoria |
| `log_system_event` | Registrar evento del sistema |
| `resolve_pending_initialization` | Marcar inicializacion pendiente como resuelta |
| `retry_pending_initializations` | Reintenta inicializacion de usuarios con gamificacion fallida |
| `get_pending_initialization_stats` | Estadisticas de registros pendientes agrupados por status |

## Tabla pending_user_initialization

Tabla especial para monitorear y reintentar inicializaciones fallidas:

```sql
-- Campos principales
user_id UUID        -- Usuario que fallo
profile_id UUID     -- Perfil asociado
error_message TEXT  -- Mensaje de error
error_code TEXT     -- SQLSTATE
retry_count INT     -- Intentos realizados
status TEXT         -- pending, retrying, resolved, failed, manual
next_retry_at TIMESTAMPTZ  -- Proximo intento programado
```

**Usos:**
1. Triggers de gamificacion registran aqui errores sin bloquear creacion de usuario
2. Funcion `retry_pending_initializations()` reintenta automaticamente
3. Admin puede revisar y resolver manualmente

**Estadisticas:**
```sql
SELECT * FROM audit_logging.get_pending_initialization_stats();
-- Retorna conteo por status
```

## Consolidacion de Triggers (2026-01-07)

Trigger `system_alerts_updated_at` consolidado en `00-batch_updated_at_triggers.sql`.

Archivo original movido a `triggers/_deprecated/`.

## Migracion de ENUMs (2026-01-07)

ENUMs migrados desde `00-prerequisites.sql` a archivos individuales en `enums/`:
- `log_level` - Niveles de log
- `audit_action` - Acciones de auditoria
- `alert_severity` - Severidad de alertas
- `alert_status` - Estados de alertas
- `metric_type` - Tipos de metricas

---

**Ultima actualizacion:** 2026-01-07
**Cambios recientes:**
- CONSOLIDACION BD: Triggers updated_at consolidados (2026-01-07)
- CONSOLIDACION BD: ENUMs migrados a archivos individuales (2026-01-07)
- **user_activity ELIMINADA** - Migracion completada (2026-01-07)
- DDL movido a `_deprecated/07-user_activity.sql`
- Constante eliminada de `database.constants.ts`
- user_activity marcada como DEPRECATED (2026-01-04)
- Agregado MIGRATION-DUPLICATE-TABLES.md
