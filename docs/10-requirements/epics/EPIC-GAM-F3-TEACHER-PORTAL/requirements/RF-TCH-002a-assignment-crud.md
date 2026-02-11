---
id: "RF-TCH-002a"
title: "Creacion y Gestion de Tareas"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "teacher"
epic: "EXT-001"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Creacion y Gestion de Tareas

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-TCH-002a |
| Modulo | teacher |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-001 |

## Descripcion

El sistema debe permitir a los maestros crear, editar y gestionar tareas (assignments) para sus aulas. Cada tarea incluye titulo, descripcion, instrucciones, fecha limite, puntuacion maxima, rubrica opcional y archivos adjuntos. Las tareas pueden ser de tipo cuestionario, ensayo, proyecto o actividad gamificada.

## Requerimiento Funcional

- **RF-TCH-002a.1:** El maestro puede crear una tarea especificando titulo, descripcion, tipo (quiz, essay, project, gamified), fecha limite, puntuacion maxima y rubrica.
- **RF-TCH-002a.2:** El maestro puede adjuntar archivos de referencia (PDF, imagenes, documentos) a una tarea con un limite de 10 archivos y 50MB total.
- **RF-TCH-002a.3:** El maestro puede editar una tarea en estado borrador o publicada, con advertencia si ya hay entregas realizadas.
- **RF-TCH-002a.4:** El maestro puede duplicar una tarea existente para reutilizarla en otra aula o periodo.

## Criterios de Aceptacion

- [ ] AC-001: Se crea una tarea con todos los campos requeridos y se guarda en estado borrador.
- [ ] AC-002: Los archivos adjuntos se suben correctamente y son accesibles desde la vista de la tarea.
- [ ] AC-003: Al editar una tarea con entregas existentes, se muestra advertencia y se registra el cambio.
- [ ] AC-004: La duplicacion copia todos los campos excepto entregas y calificaciones.
- [ ] AC-005: Los tipos de tarea disponibles coinciden con los configurados en el modulo de gamificacion.

## Reglas de Negocio

- Una tarea en borrador no es visible para los estudiantes.
- La fecha limite no puede ser anterior a la fecha actual al momento de publicar.
- Al duplicar, el maestro debe seleccionar el aula destino.

## Dependencias

- Tabla `assignments` en esquema `assignment`.
- Servicio de almacenamiento para archivos adjuntos.

## Referencias

- **User Story:** US-PM-002a
- **Especificacion:** ET-TCH-002
- **EPIC:** EXT-001
