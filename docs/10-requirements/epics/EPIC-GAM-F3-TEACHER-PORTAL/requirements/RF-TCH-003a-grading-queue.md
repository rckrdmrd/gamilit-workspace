---
id: "RF-TCH-003a"
title: "Cola de Calificacion"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "teacher"
epic: "EXT-001"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Cola de Calificacion

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-TCH-003a |
| Modulo | teacher |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-001 |

## Descripcion

El sistema debe proporcionar una cola de calificacion centralizada que muestre todas las entregas pendientes de calificar del maestro, priorizadas por fecha limite y urgencia. La cola permite al maestro gestionar eficientemente su carga de trabajo de calificacion a traves de multiples aulas.

## Requerimiento Funcional

- **RF-TCH-003a.1:** La cola muestra todas las entregas pendientes de calificar agrupadas por tarea, con conteo total y tiempo transcurrido desde la entrega.
- **RF-TCH-003a.2:** El maestro puede filtrar la cola por aula, tarea, fecha de entrega o prioridad (urgente, normal, baja).
- **RF-TCH-003a.3:** La cola prioriza automaticamente las entregas mas antiguas y aquellas proximas a plazos de retroalimentacion comprometidos.
- **RF-TCH-003a.4:** El maestro puede iniciar calificacion secuencial desde la cola, avanzando automaticamente a la siguiente entrega al completar una.

## Criterios de Aceptacion

- [ ] AC-001: La cola muestra el total de entregas pendientes con desglose por tarea y aula.
- [ ] AC-002: Los filtros por aula y tarea reducen la lista correctamente.
- [ ] AC-003: Las entregas con mas de 48 horas sin calificar se marcan como urgentes.
- [ ] AC-004: La calificacion secuencial avanza automaticamente sin necesidad de volver a la cola.
- [ ] AC-005: El badge de pendientes en el dashboard se actualiza en tiempo real al calificar.

## Reglas de Negocio

- La prioridad urgente se activa a las 48 horas sin calificar.
- Las entregas de tareas archivadas no aparecen en la cola.
- La cola solo muestra entregas de aulas activas del maestro.

## Dependencias

- Tabla `submissions` con estado `submitted` (no calificado).
- Endpoints de entregas y calificaciones.

## Referencias

- **User Story:** US-PM-003a
- **Especificacion:** ET-TCH-003
- **EPIC:** EXT-001
