---
id: "RF-TCH-012"
title: "Centro de Notificaciones para Maestros"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "teacher"
epic: "EXT-001"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Centro de Notificaciones para Maestros

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-TCH-012 |
| Modulo | teacher |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-001 |

## Descripcion

El sistema debe proporcionar un centro de notificaciones centralizado para maestros que muestre todas las notificaciones recibidas: nuevas entregas de tareas, solicitudes de inscripcion, mensajes de estudiantes, alertas de rendimiento y eventos del sistema. Las notificaciones se muestran en orden cronologico con indicadores de leido/no leido.

## Requerimiento Funcional

- **RF-TCH-012.1:** El centro de notificaciones muestra todas las notificaciones en orden cronologico con indicador visual de leido/no leido, tipo (entrega, inscripcion, mensaje, alerta, sistema) e icono correspondiente.
- **RF-TCH-012.2:** El maestro puede filtrar notificaciones por tipo, aula y estado (leido/no leido) y buscar por texto.
- **RF-TCH-012.3:** Cada notificacion incluye un enlace directo a la accion relevante (e.g., calificar entrega, aprobar inscripcion, ver mensaje).
- **RF-TCH-012.4:** El sistema muestra un badge con el conteo de notificaciones no leidas en el header de la aplicacion, actualizado en tiempo real.

## Criterios de Aceptacion

- [ ] AC-001: Las notificaciones aparecen en menos de 5 segundos despues del evento que las genera.
- [ ] AC-002: El filtro por tipo muestra solo las notificaciones de la categoria seleccionada.
- [ ] AC-003: El enlace directo navega correctamente a la pantalla de accion correspondiente.
- [ ] AC-004: El badge se actualiza automaticamente sin necesidad de refrescar la pagina.
- [ ] AC-005: El maestro puede marcar todas las notificaciones como leidas con un solo clic.

## Reglas de Negocio

- Las notificaciones se retienen por 90 dias; las mas antiguas se archivan automaticamente.
- El badge muestra maximo "99+" para conteos superiores.
- Las notificaciones de sistema (mantenimiento, actualizaciones) tienen prioridad visual distinta.

## Dependencias

- Tabla `notifications` en esquema `notification`.
- WebSocket para actualizacion en tiempo real del badge.

## Referencias

- **User Story:** US-PM-012
- **Especificacion:** ET-TCH-012
- **EPIC:** EXT-001
