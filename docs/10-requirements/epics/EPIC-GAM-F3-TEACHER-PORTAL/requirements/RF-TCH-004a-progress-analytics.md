---
id: "RF-TCH-004a"
title: "Analiticas de Progreso de Estudiantes"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "teacher"
epic: "EXT-001"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Analiticas de Progreso de Estudiantes

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-TCH-004a |
| Modulo | teacher |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-001 |

## Descripcion

El sistema debe proporcionar analiticas detalladas del progreso individual de cada estudiante, incluyendo tendencias de calificaciones, tasa de entrega, tiempo promedio de respuesta, areas fuertes y debiles basadas en rubricas, y comparacion anonimizada con el promedio del aula. Estas analiticas ayudan al maestro a identificar estudiantes que necesitan atencion.

## Requerimiento Funcional

- **RF-TCH-004a.1:** El maestro puede ver el perfil analitico de un estudiante con grafica de tendencia de calificaciones en el tiempo, promedio acumulado y tasa de entrega.
- **RF-TCH-004a.2:** El sistema identifica automaticamente areas fuertes y debiles del estudiante basandose en los criterios de rubrica con mejor y peor desempeno.
- **RF-TCH-004a.3:** Se muestra una comparacion del estudiante contra el promedio del aula de forma anonimizada (sin revelar datos de otros estudiantes).
- **RF-TCH-004a.4:** El sistema genera alertas automaticas cuando un estudiante muestra tendencia descendente en sus ultimas 3 calificaciones consecutivas.

## Criterios de Aceptacion

- [ ] AC-001: La grafica de tendencia muestra al menos las ultimas 10 calificaciones con linea de tendencia.
- [ ] AC-002: Las areas fuertes/debiles se calculan correctamente basandose en criterios de rubrica.
- [ ] AC-003: La comparacion con el aula no revela identidades de otros estudiantes.
- [ ] AC-004: Las alertas de tendencia descendente se generan y aparecen en el dashboard del maestro.
- [ ] AC-005: Los datos analiticos se actualizan dentro de los 5 minutos posteriores a una calificacion.

## Reglas de Negocio

- Las analiticas solo incluyen tareas calificadas (no borradores ni pendientes).
- La comparacion con el aula requiere al menos 5 estudiantes con calificaciones.
- Las alertas de tendencia se evaluan solo con calificaciones del periodo actual.

## Dependencias

- Vistas materializadas de analiticas en esquema `analytics`.
- Servicio de calculo de tendencias y promedios.

## Referencias

- **User Story:** US-PM-004a
- **Especificacion:** ET-TCH-004
- **EPIC:** EXT-001
