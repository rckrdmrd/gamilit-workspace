---
id: "RF-GAM-013"
title: "Sistema de Gremios"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "social_features, gamification_system"
epic: "EAI-003-EXT"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# RF-GAM-013: Sistema de Gremios

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-GAM-013 |
| Modulo | social_features, gamification_system |
| Status | Done |
| EPIC | EAI-003-EXT - Gamificacion Social |

## Descripcion

Implementar el sistema de gremios que permite a los estudiantes formar grupos colaborativos con nombre, emblema y descripcion. Los gremios promueven la colaboracion y el sentido de pertenencia, con reglas de negocio claras: maximo 20 miembros, un solo gremio por usuario, y el creador es automaticamente lider.

## Requerimiento Funcional

- **RF-GAM-013.1:** Permitir crear un nuevo gremio proporcionando nombre (unico, 3-30 caracteres), descripcion (max 200 caracteres) y emblema seleccionable de un catalogo predefinido. El creador se asigna automaticamente como lider.
- **RF-GAM-013.2:** Permitir buscar gremios existentes por nombre o descripcion con resultados paginados, mostrando cantidad de miembros, nivel del gremio y estado (abierto/cerrado a solicitudes).
- **RF-GAM-013.3:** Permitir solicitar union a un gremio abierto. La solicitud queda pendiente hasta aprobacion de un lider u oficial. Un usuario solo puede pertenecer a 1 gremio simultaneamente.
- **RF-GAM-013.4:** Permitir ver detalles de un gremio: lista de miembros con roles, estadisticas colectivas (XP total, misiones completadas), fecha de creacion y ranking de gremio.
- **RF-GAM-013.5:** Permitir abandonar un gremio. Si el lider abandona sin transferir liderazgo, el oficial con mayor antiguedad hereda el rol; si no hay oficiales, el miembro mas antiguo.

## Criterios de Aceptacion

- [ ] AC-001: Nombre de gremio es unico en toda la plataforma (validacion case-insensitive)
- [ ] AC-002: Maximo 20 miembros por gremio (enforced en backend y DDL constraint)
- [ ] AC-003: Usuario no puede pertenecer a mas de 1 gremio (constraint de unicidad)
- [ ] AC-004: Sucesion de liderazgo automatica al abandonar (oficial > miembro mas antiguo)
- [ ] AC-005: RLS policies aseguran que solo miembros ven informacion interna del gremio
- [ ] AC-006: Pagina de busqueda de gremios carga en menos de 2 segundos

## Referencias

- **User Story:** US-GAM-013 - Sistema de Gremios
- **Especificacion:** ET-SOC-002 - Diseno Tecnico Sistema de Gremios
- **EPIC:** EAI-003-EXT - Gamificacion Social
- **Tablas DDL:** `social_features.guilds`, `social_features.guild_members`
