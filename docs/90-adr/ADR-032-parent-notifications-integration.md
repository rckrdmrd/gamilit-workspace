# ADR-032: Parent Notifications Integration Strategy

**Estado:** Aceptado
**Fecha:** 2026-02-05
**Contexto:** FIX H-040 (TASK-2026-02-05-ANALISIS-INTEGRAL-MODELADO-BD)

## Contexto

GAMILIT tiene dos sistemas de notificaciones completamente separados:

1. **`notifications.notifications`** (EXT-003): Sistema multi-canal general con queue, rate limiting, delivery tracking, templates.
2. **`auth_management.parent_notifications`** (EXT-010/011): Sistema dedicado para padres con student snapshots, reportes programados, alertas de rendimiento.

Estos sistemas no comparten infraestructura (queue, rate limiting, delivery logs).

## Decision

**Opcion B: Integracion Parcial** - Mantener tablas separadas pero compartir infraestructura.

### Justificacion

La separacion de tablas es **intencionalmente correcta** porque:
- Los padres son stakeholders externos, no usuarios de la plataforma
- `parent_notifications` tiene columnas especificas (student_snapshot, student_id, scheduled_for, action_url) que no aplican al sistema general
- Los tipos de notificacion son completamente diferentes (11 tipos padres vs 6 tipos generales)
- Las reglas de frecuencia difieren (realtime vs daily/weekly/monthly summaries)

Sin embargo, la infraestructura de entrega **debe compartirse** para evitar duplicacion y asegurar confiabilidad.

## Plan de Integracion (4 fases)

### Fase 1: Rate Limiting (Baja complejidad)
- Integrar `ParentAlertService` con `NotificationRateLimitService`
- Agregar limites especificos para canal padre (ej: max 5 emails/hora por padre)

### Fase 2: Queue de Entrega (Media complejidad)
- Rutar entregas de parent_notifications via `notification_queue`
- Aprovechar retry logic y async processing existentes

### Fase 3: Delivery Tracking (Media complejidad)
- Registrar entregas de parent_notifications en `notification_logs`
- Unificar dashboard de monitoreo

### Fase 4: Preferencias Unificadas (Baja prioridad)
- Evaluar migracion de preferencias de ParentAccount → notification_preferences
- Mantener parametros padre-especificos (notification_frequency, alert thresholds)

## Consecuencias

### Positivas
- Reutilizacion de infraestructura de entrega probada
- Rate limiting protege contra spam en ambos sistemas
- Panel unico de monitoreo de notificaciones
- Sin migracion de datos (tablas separadas)

### Negativas
- Acoplamiento entre modulos parents y notifications
- Complejidad adicional en routing de queue
- Las fases 2-4 requieren esfuerzo de implementacion

## Prioridad

Baja - No es bloqueante para produccion. Implementar como mejora incremental post-MVP.

## Referencias

- H-040 en HALLAZGOS-PRELIMINARES.md
- EXT-003: Sistema de Notificaciones Multi-Canal
- EXT-010/011: Portal de Padres
- ADR-031: Portal Parent (arquitectura general padres)
