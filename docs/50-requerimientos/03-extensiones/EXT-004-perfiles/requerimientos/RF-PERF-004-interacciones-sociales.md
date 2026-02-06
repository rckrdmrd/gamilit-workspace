---
id: "RF-PERF-004"
title: "Interacciones Sociales"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "profiles"
epic: "EXT-004"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Interacciones Sociales

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-PERF-004 |
| Modulo | profiles |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-004 |

## Descripcion

El sistema debe permitir a los usuarios gestionar sus interacciones sociales desde el perfil: lista de amigos, solicitudes pendientes, bloqueo de usuarios y configuracion de visibilidad en leaderboards. Se integra con el sistema de amigos de EAI-003-EXT y el sistema de gremios.

## Requerimiento Funcional

- **RF-PERF-004.1:** Ver lista de amigos con estado online/offline y ultima actividad.
- **RF-PERF-004.2:** Gestionar solicitudes de amistad pendientes (aceptar, rechazar).
- **RF-PERF-004.3:** Bloquear y desbloquear usuarios con efecto inmediato en todas las interacciones.
- **RF-PERF-004.4:** Configurar visibilidad en leaderboards: visible, anonimo, oculto.
- **RF-PERF-004.5:** Ver gremio actual, historial de gremios y estadisticas sociales.

## Criterios de Aceptacion

- [x] AC-001: Lista de amigos muestra estado online actualizado en tiempo real.
- [x] AC-002: Solicitudes de amistad gestionables con notificacion al remitente.
- [x] AC-003: Bloqueo de usuario impide toda interaccion social y visibilidad mutua.
- [x] AC-004: Configuracion de leaderboard respetada en todas las tablas de clasificacion.

## Referencias

- **User Story:** US-PERF-004
- **Especificacion:** ET-PERF-003
- **EPIC:** EXT-004
