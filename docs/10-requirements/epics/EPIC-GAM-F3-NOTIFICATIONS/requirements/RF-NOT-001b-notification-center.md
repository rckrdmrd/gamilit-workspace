---
id: "RF-NOT-001b"
title: "Notification Center"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "notifications"
epic: "EXT-003"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Notification Center

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-NOT-001b |
| Modulo | notifications |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-003 |

## Descripcion

El sistema debe proporcionar un centro de notificaciones integrado en la interfaz que muestre todas las notificaciones del usuario organizadas por tipo y fecha. Incluye badge con conteo de no leidas, marcado individual y masivo como leido, y navegacion a la accion relacionada.

## Requerimiento Funcional

- **RF-NOT-001b.1:** Mostrar lista de notificaciones del usuario con paginacion infinita ordenadas por fecha.
- **RF-NOT-001b.2:** Badge de notificaciones no leidas visible en el header de la aplicacion.
- **RF-NOT-001b.3:** Marcar notificaciones como leidas individualmente o todas a la vez.
- **RF-NOT-001b.4:** Categorizar notificaciones por tipo: sistema, academica, gamificacion, social.
- **RF-NOT-001b.5:** Click en notificacion navega a la accion o recurso relacionado.

## Criterios de Aceptacion

- [x] AC-001: Centro de notificaciones accesible desde icono en header.
- [x] AC-002: Badge muestra conteo correcto de notificaciones no leidas.
- [x] AC-003: Marcar como leida actualiza badge en tiempo real.
- [x] AC-004: Scroll infinito carga notificaciones en lotes de 20.
- [x] AC-005: Filtro por tipo de notificacion funcional.

## Referencias

- **User Story:** US-NOT-001b
- **Especificacion:** ET-NOT-001
- **EPIC:** EXT-003
