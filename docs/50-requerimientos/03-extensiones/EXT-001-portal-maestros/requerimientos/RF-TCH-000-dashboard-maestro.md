---
id: "RF-TCH-000"
title: "Dashboard Base para Maestros"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "teacher"
epic: "EXT-001"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Dashboard Base para Maestros

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-TCH-000 |
| Modulo | teacher |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-001 |

## Descripcion

El sistema debe proporcionar un dashboard principal para maestros que centralice la informacion mas relevante de sus aulas, tareas pendientes de calificar, alertas y metricas de rendimiento de estudiantes. Este dashboard es el punto de entrada principal tras el login del maestro y debe cargar en menos de 2 segundos.

## Requerimiento Funcional

- **RF-TCH-000.1:** El dashboard debe mostrar un resumen de aulas activas con conteo de estudiantes inscritos, tareas pendientes de calificar y alertas recientes por cada aula.
- **RF-TCH-000.2:** Debe incluir widgets configurables para metricas clave: promedio general, tasa de entrega de tareas, estudiantes en riesgo y actividad reciente.
- **RF-TCH-000.3:** Debe proporcionar accesos directos (quick actions) a las operaciones mas frecuentes: crear tarea, calificar pendientes, ver reportes y gestionar aulas.
- **RF-TCH-000.4:** El dashboard debe actualizarse automaticamente cada 60 segundos o mediante accion manual del maestro.

## Criterios de Aceptacion

- [ ] AC-001: El maestro ve al menos 4 widgets con metricas actualizadas al cargar el dashboard.
- [ ] AC-002: Los accesos directos permiten navegar a crear tarea, calificar y reportes en un solo clic.
- [ ] AC-003: El dashboard carga completamente en menos de 2 segundos con datos reales.
- [ ] AC-004: Las aulas activas se muestran con su nombre, conteo de estudiantes y tareas pendientes.
- [ ] AC-005: El maestro puede reorganizar o mostrar/ocultar widgets segun su preferencia.

## Reglas de Negocio

- Solo se muestran aulas donde el maestro tiene rol activo (no archivadas).
- Las metricas se calculan sobre el periodo academico actual.
- Las alertas muestran solo los ultimos 7 dias de actividad.

## Dependencias

- Requiere modulo de autenticacion con rol `teacher` verificado.
- Depende de los endpoints de aulas, tareas y analiticas.

## Referencias

- **User Story:** US-PM-000
- **Especificacion:** ET-TCH-000
- **EPIC:** EXT-001
