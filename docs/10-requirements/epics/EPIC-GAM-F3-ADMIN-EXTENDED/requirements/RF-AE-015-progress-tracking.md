---
id: "RF-AE-015"
title: "Progress Tracking"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "admin_progress"
epic: "EXT-002"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Progress Tracking

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-AE-015 |
| Modulo | admin_progress |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-002 |

## Descripcion

El sistema debe permitir a los administradores monitorear el progreso academico de todos los estudiantes del sistema con vistas agregadas por aula, organizacion y plataforma. Incluye identificacion de estudiantes en riesgo, tendencias de completitud y metricas de rendimiento academico.

## Requerimiento Funcional

- **RF-AE-015.1:** Mostrar progreso agregado por aula: promedio, mediana, distribucion de notas.
- **RF-AE-015.2:** Identificar estudiantes en riesgo basado en actividad baja, notas bajas o inactividad prolongada.
- **RF-AE-015.3:** Mostrar tendencias de completitud de modulos y ejercicios a nivel plataforma.
- **RF-AE-015.4:** Filtrar progreso por organizacion, aula, maestro y periodo.
- **RF-AE-015.5:** Exportar datos de progreso para analisis externo.

## Criterios de Aceptacion

- [x] AC-001: Progreso por aula muestra al menos 5 metricas estadisticas.
- [x] AC-002: Algoritmo de deteccion de riesgo identifica correctamente estudiantes inactivos.
- [x] AC-003: Tendencias visibles para periodos de 7, 30 y 90 dias.
- [x] AC-004: Datos de progreso exportables en formato CSV.

## Referencias

- **User Story:** US-AE-015
- **Especificacion:** ET-ADM-009-progress
- **EPIC:** EXT-002
