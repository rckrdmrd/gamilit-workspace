---
id: "RF-AE-002"
title: "Organizations"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "admin_organizations"
epic: "EXT-002"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Organizations

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-AE-002 |
| Modulo | admin_organizations |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-002 |

## Descripcion

El sistema debe permitir a los administradores gestionar organizaciones (tenants) del sistema, incluyendo CRUD completo, asignacion de miembros, configuracion por organizacion y visualizacion de estadisticas agregadas. Las organizaciones son la unidad base de multi-tenancy en la plataforma.

## Requerimiento Funcional

- **RF-AE-002.1:** Listar organizaciones con paginacion, busqueda y filtros por estado (active, suspended, trial).
- **RF-AE-002.2:** Crear nuevas organizaciones con nombre, configuracion inicial y plan asignado.
- **RF-AE-002.3:** Editar configuracion de organizacion: nombre, plan, limites de usuarios y feature flags.
- **RF-AE-002.4:** Ver estadisticas por organizacion: total usuarios, usuarios activos, uso de storage y metricas de engagement.
- **RF-AE-002.5:** Suspender y reactivar organizaciones con impacto en todos sus miembros.

## Criterios de Aceptacion

- [x] AC-001: CRUD completo de organizaciones operativo desde panel admin.
- [x] AC-002: Estadisticas por organizacion muestran al menos 4 metricas clave.
- [x] AC-003: Suspension de organizacion desactiva acceso de todos sus miembros.
- [x] AC-004: Vista organization_stats_summary consumida correctamente desde BD.

## Referencias

- **User Story:** US-AE-002
- **Especificacion:** ET-EXT-002-ARQUITECTURA-TECNICA
- **EPIC:** EXT-002
