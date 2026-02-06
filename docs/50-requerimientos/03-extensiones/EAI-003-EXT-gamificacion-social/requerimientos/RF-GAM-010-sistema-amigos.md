---
id: "RF-GAM-010"
title: "Sistema de Amigos"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "social_features"
epic: "EAI-003-EXT"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# RF-GAM-010: Sistema de Amigos

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-GAM-010 |
| Modulo | social_features, gamification_system |
| Status | Done |
| EPIC | EAI-003-EXT - Gamificacion Social |

## Descripcion

Implementar un sistema completo de amigos que permita a los estudiantes buscar usuarios, enviar solicitudes de amistad, aceptar o rechazar solicitudes y gestionar su lista de amigos. Este sistema es la base para el leaderboard de amigos y las futuras interacciones sociales de la plataforma.

## Requerimiento Funcional

- **RF-GAM-010.1:** Permitir busqueda de usuarios por nombre o email con resultados paginados y respeto de privacidad de perfiles, excluyendo usuarios bloqueados.
- **RF-GAM-010.2:** Permitir enviar solicitudes de amistad con rate limiting (maximo 20 solicitudes pendientes por usuario) y notificacion al destinatario.
- **RF-GAM-010.3:** Permitir ver, aceptar y rechazar solicitudes pendientes (enviadas y recibidas), creando la relacion bidireccional de amistad al aceptar.
- **RF-GAM-010.4:** Permitir eliminar amigos existentes, removiendo la relacion bidireccional y notificando al otro usuario de forma discreta.
- **RF-GAM-010.5:** Proveer endpoint y vista para listar todos los amigos del usuario con informacion basica (nombre, avatar, rango, ultimo acceso) ordenados por actividad reciente.

## Criterios de Aceptacion

- [ ] AC-001: Busqueda de usuarios retorna resultados en menos de 500ms con paginacion
- [ ] AC-002: Solicitud de amistad genera notificacion push al destinatario
- [ ] AC-003: Aceptar solicitud crea relacion bidireccional (ambos se ven como amigos)
- [ ] AC-004: No se pueden enviar solicitudes duplicadas ni a usuarios bloqueados
- [ ] AC-005: RLS policies aseguran que solo el usuario ve sus amigos y solicitudes
- [ ] AC-006: Rate limiting previene spam de solicitudes (max 20 pendientes)

## Referencias

- **User Story:** US-GAM-010 - Sistema de Amigos
- **Especificacion:** ET-SOC-001 - Diseno Tecnico Sistema de Amigos
- **EPIC:** EAI-003-EXT - Gamificacion Social
- **Tablas DDL:** `social_features.friendships`, `social_features.friend_requests`
