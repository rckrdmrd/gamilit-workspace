---
id: "RF-REP-003"
title: "Analytics Predictivo"
type: "Requirement"
status: "Partial"
priority: "Alta"
module: "reports"
epic: "EXT-005"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Analytics Predictivo

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-REP-003 |
| Modulo | reports |
| Prioridad | Alta |
| Status | Partial (40%) |
| EPIC | EXT-005 |

## Descripcion

El sistema debe implementar analiticas predictivas para identificar estudiantes en riesgo de abandono, predecir rendimiento futuro y sugerir intervenciones. Utiliza modelos estadisticos basados en patrones de actividad, calificaciones y engagement con la plataforma.

## Requerimiento Funcional

- **RF-REP-003.1:** Algoritmo de deteccion de riesgo de abandono basado en inactividad, tendencia de notas y engagement.
- **RF-REP-003.2:** Score de riesgo por estudiante (0-100) con factores contribuyentes detallados.
- **RF-REP-003.3:** Prediccion de rendimiento a fin de periodo basada en tendencia actual.
- **RF-REP-003.4:** Sugerencias automaticas de intervencion para estudiantes en riesgo alto.
- **RF-REP-003.5:** Dashboard de early warning con listado priorizado de estudiantes en riesgo.

## Criterios de Aceptacion

- [x] AC-001: Score de riesgo calculado para cada estudiante activo.
- [x] AC-002: Factores de riesgo desglosados en la vista individual.
- [ ] AC-003: Prediccion de rendimiento con margen de error documentado.
- [ ] AC-004: Sugerencias de intervencion generadas para riesgo > 70.
- [ ] AC-005: Early warning dashboard operativo con actualizacion diaria.

## Referencias

- **User Story:** US-REP-003
- **Especificacion:** ET-REP-003
- **EPIC:** EXT-005
