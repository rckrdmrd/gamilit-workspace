---
id: "RF-TCH-001a"
title: "CRUD de Aulas"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "teacher"
epic: "EXT-001"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# CRUD de Aulas

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-TCH-001a |
| Modulo | teacher |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-001 |

## Descripcion

El sistema debe permitir a los maestros crear, leer, actualizar y eliminar (archivar) aulas virtuales. Cada aula tiene un nombre, descripcion, nivel educativo, materia, periodo y capacidad maxima de estudiantes. Las aulas son la unidad organizativa principal del portal de maestros.

## Requerimiento Funcional

- **RF-TCH-001a.1:** El maestro puede crear una nueva aula proporcionando nombre, descripcion, nivel, materia, periodo academico y capacidad maxima.
- **RF-TCH-001a.2:** El maestro puede editar los datos de un aula existente siempre que no este archivada.
- **RF-TCH-001a.3:** El maestro puede archivar un aula (soft delete), lo que la oculta del dashboard pero preserva los datos historicos.
- **RF-TCH-001a.4:** El sistema genera automaticamente un codigo unico de acceso para cada aula que los estudiantes usan para inscribirse.

## Criterios de Aceptacion

- [ ] AC-001: El maestro puede crear un aula con todos los campos requeridos y recibe confirmacion exitosa.
- [ ] AC-002: El codigo de acceso generado es unico, alfanumerico y de 6-8 caracteres.
- [ ] AC-003: Un aula archivada no aparece en el listado activo pero es accesible desde el historial.
- [ ] AC-004: La edicion de un aula refleja los cambios inmediatamente en el dashboard.
- [ ] AC-005: No se permite crear aulas con nombres duplicados para el mismo maestro y periodo.

## Reglas de Negocio

- Un maestro puede tener hasta 20 aulas activas simultaneamente.
- El codigo de acceso se regenera si el maestro lo solicita explicitamente.
- Al archivar un aula, las tareas pendientes de calificar se marcan como cerradas.

## Dependencias

- Tabla `classrooms` en esquema `classroom`.
- Servicio de generacion de codigos unicos.

## Referencias

- **User Story:** US-PM-001a
- **Especificacion:** ET-TCH-001
- **EPIC:** EXT-001
