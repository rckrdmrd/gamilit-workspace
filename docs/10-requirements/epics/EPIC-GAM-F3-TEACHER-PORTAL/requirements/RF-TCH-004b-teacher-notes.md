---
id: "RF-TCH-004b"
title: "Notas del Maestro por Estudiante"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "teacher"
epic: "EXT-001"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Notas del Maestro por Estudiante

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-TCH-004b |
| Modulo | teacher |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-001 |

## Descripcion

El sistema debe permitir a los maestros registrar notas privadas sobre cada estudiante. Estas notas son visibles unicamente para el maestro y sirven para documentar observaciones, acuerdos, seguimiento de comportamiento y cualquier informacion relevante para el proceso educativo. Las notas se organizan cronologicamente y son buscables.

## Requerimiento Funcional

- **RF-TCH-004b.1:** El maestro puede crear notas de texto libre asociadas a un estudiante especifico dentro de un aula, con fecha automatica y categoria opcional (observacion, acuerdo, seguimiento, general).
- **RF-TCH-004b.2:** Las notas se muestran en orden cronologico descendente y son buscables por texto y categoria.
- **RF-TCH-004b.3:** El maestro puede editar o eliminar sus propias notas dentro de las primeras 24 horas de creacion.
- **RF-TCH-004b.4:** Las notas son estrictamente privadas del maestro y no son visibles para estudiantes, padres ni otros maestros.

## Criterios de Aceptacion

- [ ] AC-001: El maestro puede crear una nota desde el perfil del estudiante y verla en la lista cronologica.
- [ ] AC-002: La busqueda por texto encuentra notas que contienen el termino buscado.
- [ ] AC-003: La edicion de notas esta bloqueada despues de 24 horas de su creacion.
- [ ] AC-004: Las notas no aparecen en ningun reporte ni vista accesible por estudiantes.
- [ ] AC-005: Cada nota muestra fecha, hora, categoria y texto completo.

## Reglas de Negocio

- Las notas estan vinculadas a la relacion maestro-estudiante-aula.
- Al archivar un aula, las notas permanecen accesibles desde el historial.
- No hay limite de cantidad de notas por estudiante.

## Dependencias

- Tabla `teacher_notes` en esquema `teacher`.
- Politica RLS para privacidad estricta.

## Referencias

- **User Story:** US-PM-004b
- **Especificacion:** ET-TCH-004
- **EPIC:** EXT-001
