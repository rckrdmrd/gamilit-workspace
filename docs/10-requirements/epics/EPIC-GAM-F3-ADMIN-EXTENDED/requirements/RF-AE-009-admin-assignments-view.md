---
id: "RF-AE-009"
title: "Admin Assignments View"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "admin_assignments"
epic: "EXT-002"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Admin Assignments View

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-AE-009 |
| Modulo | admin_assignments |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-002 |

## Descripcion

El sistema debe proporcionar a los administradores una vista panoramica de todas las asignaciones (tareas) del sistema con estadisticas de entregas, calificaciones y progreso. Consume la vista assignment_submission_stats de BD para mostrar metricas agregadas por asignacion.

## Requerimiento Funcional

- **RF-AE-009.1:** Listar todas las asignaciones del sistema con estadisticas de entregas y calificaciones.
- **RF-AE-009.2:** Mostrar por asignacion: total submissions, completed, in_progress, not_started, graded.
- **RF-AE-009.3:** Calcular metricas: submission_rate_percent, avg_score, max_score, min_score.
- **RF-AE-009.4:** Filtrar por aula, maestro, tipo de asignacion y rango de fechas.
- **RF-AE-009.5:** Consumir vista admin_dashboard.assignment_submission_stats con limite de 100 resultados.

## Criterios de Aceptacion

- [x] AC-001: GET /admin/dashboard/assignment-stats retorna estadisticas de asignaciones.
- [x] AC-002: Cada item incluye al menos 19 campos de metricas.
- [x] AC-003: Datos incluyen nombre de aula y datos del maestro via JOINs.
- [x] AC-004: Resultados limitados a 100 por consulta con manejo de errores.

## Referencias

- **User Story:** US-AE-009
- **Especificacion:** ET-EXT-002-ARQUITECTURA-TECNICA
- **EPIC:** EXT-002
