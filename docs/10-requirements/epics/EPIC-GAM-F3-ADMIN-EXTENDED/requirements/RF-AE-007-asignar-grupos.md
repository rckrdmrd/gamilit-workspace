---
id: "RF-AE-007"
title: "Asignar Grupos"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "admin_classrooms"
epic: "EXT-002"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Asignar Grupos

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-AE-007 |
| Modulo | admin_classrooms |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-002 |

## Descripcion

El sistema debe permitir a los administradores asignar grupos (aulas) a maestros, gestionar la relacion maestro-aula y visualizar el overview de todas las aulas del sistema. Incluye la capacidad de reasignar aulas entre maestros y ver estadisticas de cada aula.

## Requerimiento Funcional

- **RF-AE-007.1:** Listar todas las aulas del sistema con su maestro asignado, total de estudiantes y estado.
- **RF-AE-007.2:** Asignar un maestro a una o mas aulas existentes.
- **RF-AE-007.3:** Reasignar aulas de un maestro a otro con notificacion automatica.
- **RF-AE-007.4:** Ver overview de aulas consumiendo vista admin_dashboard.classroom_overview.
- **RF-AE-007.5:** Filtrar aulas por maestro, estado, organizacion y rango de fechas.

## Criterios de Aceptacion

- [x] AC-001: Lista de aulas muestra maestro asignado con nombre y conteo de estudiantes.
- [x] AC-002: Asignacion de maestro a aula actualiza la relacion correctamente en BD.
- [x] AC-003: Vista classroom_overview muestra al menos 16 campos por aula.
- [x] AC-004: Filtros por maestro y organizacion funcionan correctamente.

## Referencias

- **User Story:** US-AE-007
- **Especificacion:** ET-EXT-002-ARQUITECTURA-TECNICA
- **EPIC:** EXT-002
