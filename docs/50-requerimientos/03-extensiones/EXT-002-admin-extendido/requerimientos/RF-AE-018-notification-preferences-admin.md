---
id: "RF-AE-018"
title: "Notification Preferences Admin"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "admin_notifications"
epic: "EXT-002"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Notification Preferences Admin

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-AE-018 |
| Modulo | admin_notifications |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-002 |

## Descripcion

El sistema debe permitir a los administradores configurar las preferencias de notificacion a nivel global y por organizacion: tipos de notificacion habilitados, canales permitidos, frecuencia de envio y politicas de opt-out. Estas configuraciones actuan como defaults para los usuarios de cada organizacion.

## Requerimiento Funcional

- **RF-AE-018.1:** Configurar tipos de notificacion habilitados globalmente (sistema, academicas, gamificacion, sociales).
- **RF-AE-018.2:** Definir canales de notificacion permitidos por organizacion (push, email, SMS, in-app).
- **RF-AE-018.3:** Establecer frecuencia maxima de envio por tipo de notificacion (inmediata, diaria, semanal).
- **RF-AE-018.4:** Configurar politicas de opt-out: cuales notificaciones son obligatorias y cuales opcionales.
- **RF-AE-018.5:** Aplicar configuracion como defaults para nuevos usuarios de cada organizacion.

## Criterios de Aceptacion

- [x] AC-001: Preferencias globales de notificacion editables desde panel admin.
- [x] AC-002: Configuracion por organizacion sobreescribe defaults globales.
- [x] AC-003: Nuevos usuarios heredan las preferencias de su organizacion.
- [x] AC-004: Notificaciones obligatorias no pueden ser desactivadas por usuarios finales.

## Referencias

- **User Story:** US-AE-018
- **Especificacion:** ET-ADM-007-notification-preferences
- **EPIC:** EXT-002
