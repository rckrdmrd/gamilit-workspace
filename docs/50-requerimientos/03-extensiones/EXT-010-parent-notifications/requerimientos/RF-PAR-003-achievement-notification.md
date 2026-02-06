---
id: "RF-PAR-003"
title: "Achievement Notification"
type: "Requirement"
status: "Partial"
priority: "Alta"
module: "parent_notifications"
epic: "EXT-010"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Achievement Notification

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-PAR-003 |
| Modulo | parent_notifications |
| Prioridad | Alta |
| Status | Partial (30%) |
| EPIC | EXT-010 |

## Descripcion

El sistema debe notificar a los padres cuando sus hijos desbloquean logros significativos en la plataforma: ascenso de rango Maya, insignias especiales, rachas largas, completar modulos y obtener calificaciones perfectas. Las notificaciones incluyen imagen del logro y contexto motivacional.

## Requerimiento Funcional

- **RF-PAR-003.1:** Notificar ascenso de rango Maya con nombre del nuevo rango e imagen.
- **RF-PAR-003.2:** Notificar desbloqueo de insignias especiales (solo las de alta rareza: epica, legendaria).
- **RF-PAR-003.3:** Notificar rachas significativas: 7, 14, 30, 60, 100 dias consecutivos.
- **RF-PAR-003.4:** Notificar completitud de modulo con calificacion obtenida.
- **RF-PAR-003.5:** Configurar cuales logros generan notificacion a padres (filtrable por tipo e importancia).

## Criterios de Aceptacion

- [x] AC-001: Modelo de parent_notification_preferences creado con tipos configurables.
- [ ] AC-002: Ascenso de rango genera notificacion automatica al padre vinculado.
- [ ] AC-003: Insignias epicas y legendarias disparan notificacion con imagen.
- [ ] AC-004: Rachas en hitos significativos generan notificacion celebratoria.
- [ ] AC-005: Padre puede configurar que tipos de logros desea recibir.

## Referencias

- **User Story:** US-PARENT-003
- **Especificacion:** ET-PARN-002
- **EPIC:** EXT-010
