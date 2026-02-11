---
id: "RF-AE-012"
title: "Roles Management"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "admin_roles"
epic: "EXT-002"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Roles Management

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-AE-012 |
| Modulo | admin_roles |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-002 |

## Descripcion

El sistema debe permitir a los administradores gestionar roles y permisos del sistema RBAC de forma granular. Incluye listar roles, ver permisos por rol, actualizar permisos asignados y ver permisos disponibles organizados por categoria (content, users, system, reports, gamification, analytics).

## Requerimiento Funcional

- **RF-AE-012.1:** Listar todos los roles del sistema con conteo de usuarios asignados a cada rol.
- **RF-AE-012.2:** Obtener permisos disponibles organizados por categoria (6 categorias definidas).
- **RF-AE-012.3:** Ver permisos asignados a un rol especifico.
- **RF-AE-012.4:** Actualizar permisos de un rol existente con validacion de permisos validos.
- **RF-AE-012.5:** Los 16 permisos granulares deben incluir nombre tecnico y nombre descriptivo.

## Criterios de Aceptacion

- [x] AC-001: GET /admin/roles lista roles con conteo de usuarios.
- [x] AC-002: GET /admin/roles/permissions retorna 16 permisos en 6 categorias.
- [x] AC-003: GET /admin/roles/:id/permissions muestra permisos del rol.
- [x] AC-004: PUT /admin/roles/:id/permissions actualiza permisos correctamente.

## Referencias

- **User Story:** US-AE-012
- **Especificacion:** ET-EXT-002-ARQUITECTURA-TECNICA
- **EPIC:** EXT-002
