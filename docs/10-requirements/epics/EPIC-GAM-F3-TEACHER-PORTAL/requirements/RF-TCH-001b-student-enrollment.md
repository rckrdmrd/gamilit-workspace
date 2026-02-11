---
id: "RF-TCH-001b"
title: "Inscripcion de Estudiantes en Aulas"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "teacher"
epic: "EXT-001"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Inscripcion de Estudiantes en Aulas

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-TCH-001b |
| Modulo | teacher |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-001 |

## Descripcion

El sistema debe permitir gestionar la inscripcion de estudiantes en aulas. Los estudiantes pueden unirse mediante codigo de acceso o invitacion directa del maestro. El maestro puede ver la lista de inscritos, aprobar solicitudes pendientes y remover estudiantes cuando sea necesario.

## Requerimiento Funcional

- **RF-TCH-001b.1:** El maestro puede invitar estudiantes directamente proporcionando su email o nombre de usuario, generando una notificacion al estudiante.
- **RF-TCH-001b.2:** El maestro puede ver la lista completa de estudiantes inscritos con su estado (activo, pendiente, suspendido) y fecha de inscripcion.
- **RF-TCH-001b.3:** El maestro puede aprobar o rechazar solicitudes de inscripcion pendientes cuando el aula esta configurada con aprobacion manual.
- **RF-TCH-001b.4:** El maestro puede remover a un estudiante del aula, preservando su historial de tareas y calificaciones.

## Criterios de Aceptacion

- [ ] AC-001: Un estudiante invitado recibe notificacion y puede aceptar o rechazar la invitacion.
- [ ] AC-002: La lista de estudiantes muestra nombre, avatar, estado y fecha de inscripcion correctamente.
- [ ] AC-003: Al remover un estudiante, sus datos historicos permanecen accesibles para reportes.
- [ ] AC-004: No se permite inscribir mas estudiantes que la capacidad maxima del aula.
- [ ] AC-005: Las solicitudes pendientes muestran un badge contador en el dashboard del maestro.

## Reglas de Negocio

- La capacidad maxima del aula se respeta tanto para invitaciones como para inscripciones por codigo.
- Un estudiante removido puede ser re-inscrito por el maestro si hay capacidad.
- Las invitaciones expiran despues de 7 dias si no son aceptadas.

## Dependencias

- Tabla `classroom_students` en esquema `classroom`.
- Sistema de notificaciones para invitaciones.

## Referencias

- **User Story:** US-PM-001b
- **Especificacion:** ET-TCH-001
- **EPIC:** EXT-001
