# Schema: audit_logging

Auditoria y logging: actividad de usuarios, eventos del sistema, metricas de rendimiento.

## Estructura

- **tables/**: 8 archivos
- **enums/**: 1 archivo activo
- **enums/_deprecated/**: 1 archivo (aggregation_period - sin uso)
- **functions/**: 6 archivos
- **triggers/**: 1 archivo
- **indexes/**: 14 archivos
- **rls-policies/**: 1 archivo

**Total:** 32 objetos DDL

## Tablas Principales

| Tabla | Proposito |
|-------|-----------|
| `audit_logs` | Registro de eventos de auditoria (cambios de rol, status, etc.) |
| `performance_metrics` | Metricas de rendimiento del sistema |
| `system_alerts` | Alertas del sistema |
| `system_logs` | Logs generales del sistema |
| `user_activity_logs` | Logs de actividad de usuarios |
| `activity_log` | Log de actividad detallado |
| `user_activity` | Resumen de actividad por usuario |
| `pending_user_initialization` | Usuarios cuya inicializacion de gamificacion fallo (retry automatico) |

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

---

**Ultima actualizacion:** 2025-12-29
