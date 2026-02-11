---
id: "RF-GAM-015"
title: "Gestion de Miembros de Gremio"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "social_features, gamification_system"
epic: "EAI-003-EXT"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# RF-GAM-015: Gestion de Miembros de Gremio

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-GAM-015 |
| Modulo | social_features, gamification_system |
| Status | Done |
| EPIC | EAI-003-EXT - Gamificacion Social |

## Descripcion

Implementar herramientas de administracion para lideres y oficiales de gremio que permitan gestionar solicitudes de union, expulsar miembros inactivos, promover/degradar roles y transferir liderazgo. El sistema define 3 roles jerarquicos: Lider (control total), Oficial (aprobaciones y expulsiones) y Miembro (participacion sin permisos admin).

## Requerimiento Funcional

- **RF-GAM-015.1:** Permitir a lideres y oficiales ver y gestionar solicitudes de union pendientes: aprobar (agrega como miembro) o rechazar (notifica al solicitante con motivo opcional).
- **RF-GAM-015.2:** Permitir a lideres y oficiales expulsar miembros del gremio, con registro del motivo de expulsion y notificacion al usuario expulsado. Un oficial no puede expulsar a otro oficial ni al lider.
- **RF-GAM-015.3:** Permitir al lider promover miembros a oficial y degradar oficiales a miembro, con un maximo de 3 oficiales por gremio para mantener gobernanza controlada.
- **RF-GAM-015.4:** Permitir al lider transferir el liderazgo a otro miembro u oficial, convirtiendose automaticamente en oficial tras la transferencia.
- **RF-GAM-015.5:** Permitir al lider editar la configuracion del gremio: nombre, descripcion, emblema, y estado de solicitudes (abierto/cerrado). Cambios de nombre sujetos a cooldown de 7 dias.

## Criterios de Aceptacion

- [ ] AC-001: Solo lider y oficiales pueden aprobar/rechazar solicitudes (RBAC enforced)
- [ ] AC-002: Oficiales no pueden expulsar a otros oficiales ni al lider
- [ ] AC-003: Maximo 3 oficiales por gremio (constraint en backend)
- [ ] AC-004: Transferencia de liderazgo requiere confirmacion del lider actual
- [ ] AC-005: Cambio de nombre de gremio tiene cooldown de 7 dias
- [ ] AC-006: Todas las acciones de gestion quedan registradas en log de auditoria del gremio

## Referencias

- **User Story:** US-GAM-015 - Gestion de Miembros de Gremio
- **Especificacion:** ET-SOC-002 - Diseno Tecnico Sistema de Gremios
- **EPIC:** EAI-003-EXT - Gamificacion Social
- **Dependencia:** RF-GAM-013 (Sistema de Gremios debe estar implementado)
- **Tablas DDL:** `social_features.guilds`, `social_features.guild_members`
