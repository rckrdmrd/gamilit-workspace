---
id: US-SYS-003
title: Preferencias de Notificacion
epic: EAI-006
rf_parent: RF-SYS-003
story_points: 3
status: Done
created: 2025-10-27
updated: 2026-01-04
---

# US-SYS-003: Preferencias de Notificacion

## User Story

**Como** usuario del sistema
**Quiero** configurar mis preferencias de notificacion
**Para** recibir solo las notificaciones que me interesan

## Contexto

Sistema de preferencias de notificacion por usuario que permite configurar canales y tipos de notificacion.

## Criterios de Aceptacion

- [x] Tabla notification_settings por usuario
- [x] Configuracion de canales (email, push, in-app)
- [x] Tipos de notificacion habilitados
- [x] Frecuencia de resumenes (inmediato, diario, semanal)
- [x] API para leer/actualizar preferencias
- [x] Valores por defecto para nuevos usuarios

## Canales Soportados

| Canal | Descripcion |
|-------|-------------|
| email | Notificaciones por correo |
| push | Notificaciones push (mobile) |
| in_app | Notificaciones en aplicacion |

## Tipos de Notificacion

- Logros desbloqueados
- Subida de rango
- Tareas asignadas
- Recordatorios
- Anuncios del sistema

## Implementacion

**Schema:** system_configuration
**Tabla:** notification_settings
**Endpoint:** /api/users/notification-settings

## Notas

- Implementado: 2025-10-27
- Documentado retroactivamente: 2026-01-04

---

**Estado:** Done
