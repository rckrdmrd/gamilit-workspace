---
id: "RF-PERF-005"
title: "Personalizacion Dashboard"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "profiles"
epic: "EXT-004"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Personalizacion Dashboard

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-PERF-005 |
| Modulo | profiles |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-004 |

## Descripcion

El sistema debe permitir a los usuarios personalizar la disposicion de su dashboard principal: reorganizar widgets, mostrar/ocultar secciones, elegir metricas destacadas y configurar la vista de inicio. La configuracion se persiste por usuario y se aplica al cargar el dashboard.

## Requerimiento Funcional

- **RF-PERF-005.1:** Reorganizar widgets del dashboard mediante drag & drop.
- **RF-PERF-005.2:** Mostrar/ocultar secciones del dashboard: progreso, gamificacion, tareas, actividad.
- **RF-PERF-005.3:** Seleccionar metricas destacadas que aparecen en la parte superior del dashboard.
- **RF-PERF-005.4:** Configurar vista de inicio: dashboard completo, resumen compacto, ultima actividad.
- **RF-PERF-005.5:** Restaurar configuracion de dashboard a valores por defecto.

## Criterios de Aceptacion

- [x] AC-001: Drag & drop funcional para reordenar widgets del dashboard.
- [x] AC-002: Secciones ocultas no se renderizan ni consumen datos.
- [x] AC-003: Configuracion persistida entre sesiones por usuario.
- [x] AC-004: Boton de reset restaura layout original.

## Referencias

- **User Story:** US-PERF-005
- **Especificacion:** ET-PERF-002
- **EPIC:** EXT-004
