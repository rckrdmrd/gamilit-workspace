# DECISION-001: Mantener audit_logs y system_logs Separadas

**Fecha:** 2026-01-10
**Estado:** APROBADA
**Autor:** Claude (Analisis Tecnico)
**Contexto:** Sprint 1 - Opcion B

---

## Resumen

Se decide **MANTENER SEPARADAS** las tablas `audit_logging.audit_logs` y `audit_logging.system_logs`.

## Analisis

### audit_logs (27 columnas)
**Proposito:** Auditoria de acciones de usuario (compliance, seguridad)

| Categoria | Columnas |
|-----------|----------|
| Actor | actor_id, actor_type, actor_ip, actor_user_agent |
| Accion | action, event_type, resource_type, resource_id |
| Cambios | old_values, new_values, changes (JSONB) |
| Target | target_id, target_type |
| Metadata | severity, status, tags |

**Casos de uso:**
- Quien modifico un registro
- Historial de cambios de datos
- Auditoria de seguridad
- Compliance (GDPR, SOC2)

### system_logs (25 columnas)
**Proposito:** Logs tecnicos/operativos (debugging, monitoreo)

| Categoria | Columnas |
|-----------|----------|
| Logging | log_level, logger_name, message |
| Codigo | module_name, function_name, line_number, file_path |
| Errores | exception_type, exception_message, stack_trace |
| Performance | execution_time_ms, memory_usage_mb, cpu_usage_percent |
| Infra | environment, server_name, thread_id |

**Casos de uso:**
- Debugging de errores
- Monitoreo de performance
- Alertas de sistema
- Diagnostico de problemas

## Solapamiento Real

| Columna Comun | audit_logs | system_logs | Uso Diferente |
|---------------|------------|-------------|---------------|
| id | PK | PK | No |
| tenant_id | Contexto negocio | Contexto infra | Si |
| session_id | Sesion usuario | Sesion request | Si |
| request_id | Trazabilidad | Trazabilidad | No |
| correlation_id | Trazabilidad | Trazabilidad | No |
| stack_trace | Error de accion | Error de sistema | Si |
| created_at | Timestamp | Timestamp | No |

**Solapamiento estructural:** ~25% (7 de 27 columnas)
**Solapamiento funcional:** 0% (propositos completamente diferentes)

## Decision

**MANTENER SEPARADAS** por las siguientes razones:

1. **Propositos diferentes:** Usuario vs Sistema
2. **Consumidores diferentes:** Auditores/Legal vs DevOps/SRE
3. **Retencion diferente:** audit_logs (anos) vs system_logs (dias/semanas)
4. **Volumen diferente:** system_logs genera 100x mas registros
5. **Queries diferentes:** Optimizaciones distintas requeridas

## Accion

- No se requiere migracion ni consolidacion
- Cerrar Opcion B como RESUELTA
- Actualizar documentacion

---

*Sistema NEXUS v4.0 - SIMCO*
