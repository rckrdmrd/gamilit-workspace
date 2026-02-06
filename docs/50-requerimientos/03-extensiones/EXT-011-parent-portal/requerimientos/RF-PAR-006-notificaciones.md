---
id: "RF-PAR-006"
title: "Notificaciones Portal Padres"
type: "Requirement"
status: "Partial"
priority: "Alta"
module: "parent_portal"
epic: "EXT-011"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Notificaciones Portal Padres

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-PAR-006 |
| Modulo | parent_portal |
| Prioridad | Alta |
| Status | Partial (15%) |
| EPIC | EXT-011 |

## Descripcion

El sistema debe integrar el centro de notificaciones dentro del portal de padres con notificaciones especificas para su rol: alertas de rendimiento, logros de hijos, comunicaciones del maestro y avisos del sistema. Se integra con EXT-010 para notificaciones de rendimiento y logros.

## Requerimiento Funcional

- **RF-PAR-006.1:** Centro de notificaciones en el portal de padres con filtro por tipo y por hijo.
- **RF-PAR-006.2:** Notificaciones in-app en tiempo real via WebSocket (reutilizando infraestructura EXT-003).
- **RF-PAR-006.3:** Recibir comunicaciones directas del maestro del hijo (mensajes, avisos).
- **RF-PAR-006.4:** Notificaciones de sistema: mantenimiento programado, cambios en politicas, novedades.
- **RF-PAR-006.5:** Configurar canales de entrega por tipo: in-app, email, push.

## Criterios de Aceptacion

- [x] AC-001: Modelo de datos para notificaciones de padres creado.
- [ ] AC-002: Centro de notificaciones visible en el portal de padres.
- [ ] AC-003: Notificaciones en tiempo real entregadas via WebSocket.
- [ ] AC-004: Comunicaciones del maestro recibidas y visibles.
- [ ] AC-005: Preferencias de canales configurables por el padre.

## Referencias

- **User Story:** US-PP-003
- **Especificacion:** ET-PARPORT-002
- **EPIC:** EXT-011
