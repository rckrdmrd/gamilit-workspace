---
id: "RF-ADM-005"
title: "Gestion de Grupos de Estudiantes"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "Admin Base"
epic: "EAI-005"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Gestion de Grupos de Estudiantes

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-ADM-005 |
| Modulo | Admin Base |
| Prioridad | Alta |
| Status | Done |
| EPIC | EAI-005 |

## Descripcion

El sistema debe permitir a los profesores crear grupos dentro de sus aulas y asignar estudiantes manualmente para organizar mejor la clase y facilitar actividades colaborativas. Esta funcionalidad es basica: no incluye asignacion automatica, grupos dinamicos, rotacion, ni analytics de grupo (esas funcionalidades van a EXT-001 Portal de Maestros Completo).

## Requerimiento Funcional

- **RF-ADM-005.1:** Permitir crear grupos dentro de un aula con nombre, descripcion opcional, color identificador, y limite maximo de miembros. Los grupos se almacenan en social_features.classroom_groups.
- **RF-ADM-005.2:** Permitir asignar estudiantes del aula a un grupo mediante seleccion multiple, con validacion de que un estudiante solo pertenece a un grupo a la vez (o a multiples, segun configuracion del aula).
- **RF-ADM-005.3:** Permitir editar y eliminar grupos existentes. Al eliminar un grupo, los estudiantes vuelven a estado "sin grupo" sin afectar su progreso individual.
- **RF-ADM-005.4:** Mostrar vista de grupos del aula con lista de miembros por grupo, conteo de estudiantes, y estudiantes sin asignar.
- **RF-ADM-005.5:** Permitir mover estudiantes entre grupos mediante drag and drop o seleccion manual, con confirmacion antes de ejecutar el cambio.

## Criterios de Aceptacion

- [ ] AC-001: Se pueden crear grupos con nombre y color dentro de un aula
- [ ] AC-002: Los estudiantes se asignan a grupos correctamente con validacion
- [ ] AC-003: La eliminacion de un grupo no afecta el progreso de los estudiantes
- [ ] AC-004: La vista de grupos muestra miembros y estudiantes sin asignar
- [ ] AC-005: Los estudiantes se pueden mover entre grupos sin perder datos

## Referencias

- **User Story:** US-ADM-005
- **Especificacion:** ET-ADM-005
- **EPIC:** EAI-005
