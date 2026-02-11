---
id: "RF-TCH-013"
title: "Gestion de Preferencias de Notificacion"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "teacher"
epic: "EXT-001"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Gestion de Preferencias de Notificacion

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-TCH-013 |
| Modulo | teacher |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-001 |

## Descripcion

El sistema debe permitir a los maestros configurar sus preferencias de notificacion de forma granular. El maestro puede elegir que tipos de eventos generan notificacion, por que canal (in-app, email, push) y en que horarios. Incluye modo "no molestar" y la posibilidad de silenciar notificaciones de aulas especificas temporalmente.

## Requerimiento Funcional

- **RF-TCH-013.1:** El maestro puede configurar por cada tipo de evento (nueva entrega, inscripcion, mensaje, alerta, sistema) si desea recibir notificacion in-app, email, push o ninguna.
- **RF-TCH-013.2:** El maestro puede definir un horario de notificaciones (e.g., solo de 8:00 a 20:00), fuera del cual se acumulan y entregan al inicio del siguiente periodo.
- **RF-TCH-013.3:** El maestro puede activar modo "no molestar" por un periodo definido (1h, 4h, 24h, personalizado) que silencia todas las notificaciones excepto las criticas de sistema.
- **RF-TCH-013.4:** El maestro puede silenciar notificaciones de un aula especifica sin afectar las demas, con opcion de reactivar en cualquier momento.

## Criterios de Aceptacion

- [ ] AC-001: La configuracion por tipo de evento se aplica correctamente a las notificaciones generadas.
- [ ] AC-002: Las notificaciones fuera del horario configurado se acumulan y entregan al inicio del horario.
- [ ] AC-003: El modo no molestar silencia todas las notificaciones excepto las criticas de sistema.
- [ ] AC-004: Silenciar un aula detiene solo las notificaciones de esa aula.
- [ ] AC-005: Los cambios en preferencias se aplican inmediatamente sin necesidad de reiniciar sesion.

## Reglas de Negocio

- Las notificaciones criticas de sistema (mantenimiento programado, seguridad) nunca se silencian.
- El modo no molestar se desactiva automaticamente al cumplirse el periodo configurado.
- La configuracion por defecto envia todas las notificaciones por in-app y email.

## Dependencias

- Tabla `notification_preferences` en esquema `notification`.
- Servicio de entrega de notificaciones con filtro de preferencias.

## Referencias

- **User Story:** US-PM-013
- **Especificacion:** ET-TCH-013
- **EPIC:** EXT-001
