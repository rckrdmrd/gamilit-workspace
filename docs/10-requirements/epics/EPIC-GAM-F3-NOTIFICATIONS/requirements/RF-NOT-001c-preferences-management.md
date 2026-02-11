---
id: "RF-NOT-001c"
title: "Preferences Management"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "notifications"
epic: "EXT-003"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Preferences Management

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-NOT-001c |
| Modulo | notifications |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-003 |

## Descripcion

El sistema debe permitir a los usuarios configurar sus preferencias de notificacion por tipo y canal. Cada usuario puede activar/desactivar notificaciones por categoria (sistema, academica, gamificacion, social) y por canal (push, email, in-app). Las preferencias heredan defaults de la organizacion.

## Requerimiento Funcional

- **RF-NOT-001c.1:** Interfaz de configuracion de preferencias por tipo de notificacion.
- **RF-NOT-001c.2:** Toggle por canal de entrega para cada tipo: push, email, in-app.
- **RF-NOT-001c.3:** Herencia de defaults de organizacion para nuevos usuarios.
- **RF-NOT-001c.4:** Respetar notificaciones marcadas como obligatorias por el administrador.
- **RF-NOT-001c.5:** Persistir preferencias en tabla notification_management.notification_settings.

## Criterios de Aceptacion

- [x] AC-001: Usuario puede editar preferencias desde seccion de configuracion de perfil.
- [x] AC-002: Toggles por canal reflejados inmediatamente en las entregas.
- [x] AC-003: Notificaciones obligatorias mostradas como no editables (locked).
- [x] AC-004: Nuevos usuarios reciben defaults de su organizacion.
- [x] AC-005: GET y PUT endpoints de preferences operativos.

## Referencias

- **User Story:** US-NOT-001c
- **Especificacion:** ET-NOT-002
- **EPIC:** EXT-003
