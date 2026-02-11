---
id: "RF-PAR-005"
title: "Portal Dashboard"
type: "Requirement"
status: "Partial"
priority: "Alta"
module: "parent_portal"
epic: "EXT-011"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Portal Dashboard

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-PAR-005 |
| Modulo | parent_portal |
| Prioridad | Alta |
| Status | Partial (20%) |
| EPIC | EXT-011 |

## Descripcion

El sistema debe proporcionar un dashboard dedicado para padres con resumen del progreso de cada hijo vinculado. Muestra metricas academicas, actividad de gamificacion, calendario de tareas y acceso a reportes. El dashboard es responsive y optimizado para mobile.

## Requerimiento Funcional

- **RF-PAR-005.1:** Dashboard con selector de hijo (si multi-hijo) y resumen de progreso actual.
- **RF-PAR-005.2:** Metricas visibles: calificacion promedio, modulos completados, racha actual, rango Maya.
- **RF-PAR-005.3:** Calendario de tareas pendientes y proximas entregas del hijo.
- **RF-PAR-005.4:** Grafico de tendencia de rendimiento de los ultimos 30 dias.
- **RF-PAR-005.5:** Acceso directo a reportes semanales y logros recientes.

## Criterios de Aceptacion

- [ ] AC-001: Dashboard carga con datos reales del hijo seleccionado.
- [ ] AC-002: Selector de hijo funcional para padres multi-hijo.
- [ ] AC-003: Calendario muestra tareas pendientes con fechas de entrega.
- [ ] AC-004: Grafico de tendencia renderizado con datos de 30 dias.
- [x] AC-005: Layout responsive funcional en mobile (min 320px).

## Referencias

- **User Story:** US-PP-002
- **Especificacion:** ET-PARPORT-002
- **EPIC:** EXT-011
