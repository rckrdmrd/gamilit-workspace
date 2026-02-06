---
id: "RF-TCH-005a"
title: "Analiticas a Nivel de Aula"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "teacher"
epic: "EXT-001"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Analiticas a Nivel de Aula

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-TCH-005a |
| Modulo | teacher |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-001 |

## Descripcion

El sistema debe proporcionar un panel de analiticas agregadas a nivel de aula que muestre metricas como promedio general, distribucion de calificaciones, tasa de entrega, estudiantes en riesgo y tendencias a lo largo del periodo academico. Estas metricas permiten al maestro evaluar el desempeno global del grupo.

## Requerimiento Funcional

- **RF-TCH-005a.1:** El panel muestra metricas agregadas del aula: promedio general, mediana, desviacion estandar, tasa de entrega promedio y numero de estudiantes activos.
- **RF-TCH-005a.2:** Se visualiza la distribucion de calificaciones en histograma y el ranking anonimizado de desempeno (percentiles).
- **RF-TCH-005a.3:** El sistema destaca estudiantes en riesgo academico (promedio <60% o tendencia descendente en 3+ tareas).
- **RF-TCH-005a.4:** Se muestran graficas de tendencia del aula a lo largo del periodo, comparando metricas por tarea.

## Criterios de Aceptacion

- [ ] AC-001: Las metricas agregadas se calculan correctamente y coinciden con los datos individuales.
- [ ] AC-002: El histograma muestra la distribucion real de calificaciones del aula.
- [ ] AC-003: Los estudiantes en riesgo se identifican y listan con el motivo especifico.
- [ ] AC-004: Las graficas de tendencia muestran datos de al menos las ultimas 5 tareas calificadas.
- [ ] AC-005: Las analiticas se actualizan automaticamente cuando se publican nuevas calificaciones.

## Reglas de Negocio

- Las metricas solo incluyen estudiantes activos (no removidos ni suspendidos).
- El umbral de riesgo (60%) es configurable por el maestro a nivel de aula.
- Se requieren al menos 3 tareas calificadas para mostrar tendencias.

## Dependencias

- Vistas materializadas de analiticas de aula.
- Servicio de calculo estadistico (promedio, mediana, desviacion).

## Referencias

- **User Story:** US-PM-005a
- **Especificacion:** ET-TCH-005
- **EPIC:** EXT-001
