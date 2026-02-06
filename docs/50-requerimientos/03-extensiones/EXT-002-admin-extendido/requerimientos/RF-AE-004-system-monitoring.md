---
id: "RF-AE-004"
title: "System Monitoring"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "admin_system"
epic: "EXT-002"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# System Monitoring

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-AE-004 |
| Modulo | admin_system |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-002 |

## Descripcion

El sistema debe proporcionar herramientas de monitoreo para administradores incluyendo estado de salud del sistema, operaciones de mantenimiento automatizadas, logs de sistema y metricas de rendimiento. Permite ejecutar tareas de limpieza, optimizacion de BD y gestion de cache.

## Requerimiento Funcional

- **RF-AE-004.1:** Mostrar estado de salud del sistema con indicadores de healthy/warning/critical.
- **RF-AE-004.2:** Ejecutar operaciones de mantenimiento: cleanup-logs, cleanup-activity, optimize-database, clear-cache, cleanup-sessions.
- **RF-AE-004.3:** Configurar retencion de logs y actividad (default 90 y 180 dias respectivamente).
- **RF-AE-004.4:** Optimizar tablas criticas de BD via VACUUM ANALYZE (users, activity_log, system_logs, exercises, modules).
- **RF-AE-004.5:** Reportar registros afectados y tiempo de ejecucion de cada operacion.

## Criterios de Aceptacion

- [x] AC-001: Operaciones de mantenimiento ejecutan sin errores y reportan resultados.
- [x] AC-002: Cleanup de logs respeta parametro de retencion configurable.
- [x] AC-003: VACUUM ANALYZE ejecuta sobre las 5 tablas criticas definidas.
- [x] AC-004: Cada operacion retorna success, message, affected_records y metadata.
- [x] AC-005: Endpoints de mantenimiento protegidos con guard de admin.

## Referencias

- **User Story:** US-AE-004
- **Especificacion:** ET-EXT-002-ARQUITECTURA-TECNICA
- **EPIC:** EXT-002
