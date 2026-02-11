---
id: "RF-TCH-002b"
title: "Distribucion de Tareas a Estudiantes"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "teacher"
epic: "EXT-001"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Distribucion de Tareas a Estudiantes

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-TCH-002b |
| Modulo | teacher |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-001 |

## Descripcion

El sistema debe permitir a los maestros publicar y distribuir tareas a los estudiantes de un aula. La distribucion puede ser a toda el aula o a un subgrupo seleccionado. Al publicar, los estudiantes reciben notificacion y la tarea aparece en su panel de actividades pendientes.

## Requerimiento Funcional

- **RF-TCH-002b.1:** El maestro puede publicar una tarea en borrador, cambiando su estado a activa y haciendola visible para los estudiantes asignados.
- **RF-TCH-002b.2:** El maestro puede asignar la tarea a todos los estudiantes del aula o seleccionar un subgrupo especifico.
- **RF-TCH-002b.3:** El maestro puede programar la publicacion para una fecha y hora futura (scheduled publish).
- **RF-TCH-002b.4:** El sistema envia notificacion automatica a todos los estudiantes asignados al momento de la publicacion.

## Criterios de Aceptacion

- [ ] AC-001: Al publicar una tarea, su estado cambia a activa y aparece en el panel del estudiante.
- [ ] AC-002: La asignacion selectiva permite elegir estudiantes individuales de la lista del aula.
- [ ] AC-003: Una tarea programada se publica automaticamente en la fecha/hora configurada.
- [ ] AC-004: Todos los estudiantes asignados reciben notificacion push y/o email segun sus preferencias.
- [ ] AC-005: El maestro puede despublicar una tarea activa si no hay entregas realizadas.

## Reglas de Negocio

- Solo se pueden publicar tareas con todos los campos obligatorios completos.
- La publicacion programada requiere al menos 1 hora de anticipacion.
- Despublicar con entregas existentes no esta permitido; se debe archivar.

## Dependencias

- Tabla `assignment_students` en esquema `assignment`.
- Sistema de notificaciones (push y email).
- Servicio de tareas programadas (cron/scheduler).

## Referencias

- **User Story:** US-PM-002b
- **Especificacion:** ET-TCH-002
- **EPIC:** EXT-001
