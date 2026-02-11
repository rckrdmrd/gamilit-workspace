---
id: "RF-TCH-005c"
title: "Metricas de Engagement de Estudiantes"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "teacher"
epic: "EXT-001"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Metricas de Engagement de Estudiantes

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-TCH-005c |
| Modulo | teacher |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-001 |

## Descripcion

El sistema debe proporcionar metricas de engagement (compromiso) de los estudiantes, midiendo su nivel de participacion e interaccion con la plataforma. Incluye frecuencia de login, tiempo en plataforma, interacciones con contenido gamificado, participacion en actividades y racha de actividad. Estas metricas complementan las academicas para dar una vision holistica.

## Requerimiento Funcional

- **RF-TCH-005c.1:** El sistema muestra por estudiante: frecuencia de login (diaria/semanal), tiempo promedio en plataforma, interacciones con contenido y racha de actividad consecutiva.
- **RF-TCH-005c.2:** Se visualiza un heatmap de actividad semanal del aula mostrando los dias y horas con mayor participacion.
- **RF-TCH-005c.3:** El sistema calcula un indice de engagement (0-100) por estudiante basado en ponderacion de las metricas de actividad.
- **RF-TCH-005c.4:** Se identifican automaticamente estudiantes con engagement bajo (<30) o en descenso sostenido.

## Criterios de Aceptacion

- [ ] AC-001: Las metricas de login y tiempo se calculan correctamente con datos de los ultimos 30 dias.
- [ ] AC-002: El heatmap refleja patrones reales de actividad del aula.
- [ ] AC-003: El indice de engagement se actualiza diariamente y refleja la actividad reciente.
- [ ] AC-004: Los estudiantes con engagement bajo se destacan visualmente en la lista del aula.
- [ ] AC-005: El maestro puede ver el detalle de actividad de un estudiante al hacer clic en su indice.

## Reglas de Negocio

- El indice de engagement pondera: login 20%, tiempo 20%, entregas 30%, gamificacion 30%.
- Las metricas se calculan sobre los ultimos 30 dias activos del aula.
- Los dias sin actividad programada no penalizan el indice.

## Dependencias

- Eventos de tracking de actividad del estudiante.
- Vistas materializadas de engagement en esquema `analytics`.

## Referencias

- **User Story:** US-PM-005c
- **Especificacion:** ET-TCH-005
- **EPIC:** EXT-001
