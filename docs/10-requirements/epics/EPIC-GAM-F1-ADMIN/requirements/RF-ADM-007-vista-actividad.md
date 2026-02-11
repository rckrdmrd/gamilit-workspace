---
id: "RF-ADM-007"
title: "Vista de Actividad del Aula"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "Admin Base"
epic: "EAI-005"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Vista de Actividad del Aula

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-ADM-007 |
| Modulo | Admin Base |
| Prioridad | Alta |
| Status | Done |
| EPIC | EAI-005 |

## Descripcion

El sistema debe proporcionar al profesor un resumen de la actividad reciente de su aula para conocer que estudiantes estan activos, que modulos estan usando, y tener un snapshot rapido del pulso de la clase. Esta vista es basica y en tiempo casi real. No incluye analisis de patrones, heatmaps, ni metricas de engagement avanzadas (eso va a EAI-004 Analytics y EXT-005 Reportes Avanzados).

## Requerimiento Funcional

- **RF-ADM-007.1:** Mostrar contador de estudiantes activos hoy (que han iniciado sesion y/o completado al menos una actividad en las ultimas 24 horas) vs total de estudiantes del aula.
- **RF-ADM-007.2:** Mostrar lista de modulos en progreso con porcentaje de avance promedio del aula, y cantidad de estudiantes trabajando activamente en cada modulo.
- **RF-ADM-007.3:** Mostrar feed de ultimas actividades completadas (ultimas 10-20) con nombre del estudiante, nombre de la actividad, puntuacion obtenida, y timestamp.
- **RF-ADM-007.4:** Mostrar alertas basicas: estudiantes inactivos por mas de 3 dias, estudiantes con puntuacion promedio baja (<50%), y modulos sin actividad reciente.
- **RF-ADM-007.5:** Permitir filtrar la vista por periodo (hoy, esta semana, este mes) y por grupo si el aula tiene grupos configurados.

## Criterios de Aceptacion

- [ ] AC-001: El contador de estudiantes activos se actualiza correctamente
- [ ] AC-002: Los modulos en progreso muestran porcentaje promedio real del aula
- [ ] AC-003: El feed de actividades recientes se muestra en orden cronologico
- [ ] AC-004: Las alertas de inactividad y bajo rendimiento se generan correctamente
- [ ] AC-005: Los filtros por periodo y grupo funcionan sin errores

## Referencias

- **User Story:** US-ADM-007
- **Especificacion:** ET-ADM-007
- **EPIC:** EAI-005
