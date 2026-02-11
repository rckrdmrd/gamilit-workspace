---
id: "RF-AE-000"
title: "Dashboard Administrativo"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "admin_dashboard"
epic: "EXT-002"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Dashboard Administrativo

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-AE-000 |
| Modulo | admin_dashboard |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-002 |

## Descripcion

El sistema debe proporcionar un dashboard centralizado para administradores con estadisticas clave del sistema, actividad reciente y metricas de rendimiento. Incluye widgets de usuarios activos, organizaciones, ejercicios completados y estado de salud del sistema. Solo accesible para usuarios con rol admin o super_admin.

## Requerimiento Funcional

- **RF-AE-000.1:** Mostrar estadisticas generales del sistema: total de usuarios, usuarios activos, nuevos usuarios hoy, total de organizaciones, total de ejercicios y modulos, ejercicios completados en ultimas 24h.
- **RF-AE-000.2:** Mostrar estado de salud del sistema (healthy/warning/critical) basado en metricas internas.
- **RF-AE-000.3:** Incluir actividad reciente de usuarios y administradores con paginacion.
- **RF-AE-000.4:** Las estadisticas deben actualizarse en tiempo real o mediante polling periodico.
- **RF-AE-000.5:** Consumir vistas de BD: user_stats_summary, organization_stats_summary, moderation_queue, classroom_overview, assignment_submission_stats.

## Criterios de Aceptacion

- [x] AC-001: El dashboard muestra al menos 6 metricas clave al cargar.
- [x] AC-002: Estado de salud del sistema visible con indicador visual.
- [x] AC-003: Actividad reciente paginada con al menos 10 items por pagina.
- [x] AC-004: Solo accesible para roles admin/super_admin (guard RBAC activo).
- [x] AC-005: Endpoints GET /admin/dashboard, /stats, /recent-activity operativos.

## Reglas de Negocio

- Dashboard accesible solo para usuarios con permiso can_view_analytics o rol admin.
- Metricas calculadas sobre datos del ultimo periodo configurado.

## Referencias

- **User Story:** US-AE-000
- **Especificacion:** ET-EXT-002-ARQUITECTURA-TECNICA
- **EPIC:** EXT-002
