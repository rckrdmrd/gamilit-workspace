---
id: "RF-TCH-003b"
title: "Interfaz de Calificacion con Rubricas"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "teacher"
epic: "EXT-001"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Interfaz de Calificacion con Rubricas

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-TCH-003b |
| Modulo | teacher |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-001 |

## Descripcion

El sistema debe proporcionar una interfaz de calificacion completa que permita al maestro evaluar entregas usando rubricas predefinidas, asignar puntuaciones por criterio, agregar comentarios de retroalimentacion por seccion y registrar la calificacion final. La interfaz muestra la entrega del estudiante junto a la rubrica lado a lado.

## Requerimiento Funcional

- **RF-TCH-003b.1:** La interfaz muestra la entrega del estudiante en el panel izquierdo y la rubrica con criterios evaluables en el panel derecho (layout side-by-side).
- **RF-TCH-003b.2:** El maestro puede asignar puntuacion por cada criterio de la rubrica y agregar comentarios especificos por criterio.
- **RF-TCH-003b.3:** El sistema calcula automaticamente la calificacion total sumando los criterios y permite al maestro ajustarla manualmente con justificacion.
- **RF-TCH-003b.4:** El maestro puede guardar el progreso de calificacion como borrador y publicar la calificacion cuando este completa.

## Criterios de Aceptacion

- [ ] AC-001: La vista side-by-side muestra entrega y rubrica simultáneamente en pantallas >= 1024px.
- [ ] AC-002: Cada criterio de rubrica permite asignar puntuacion dentro del rango definido.
- [ ] AC-003: La calificacion total se recalcula automaticamente al modificar cualquier criterio.
- [ ] AC-004: Los comentarios por criterio se guardan y son visibles para el estudiante al publicar.
- [ ] AC-005: El borrador de calificacion persiste entre sesiones hasta que se publique.

## Reglas de Negocio

- La calificacion manual no puede exceder la puntuacion maxima de la tarea.
- Al publicar la calificacion, el estudiante recibe notificacion automatica.
- Los ajustes manuales requieren un campo de justificacion obligatorio.

## Dependencias

- Tablas `grades`, `rubrics`, `rubric_criteria` en esquema `grading`.
- Servicio de calculo de calificaciones.

## Referencias

- **User Story:** US-PM-003b
- **Especificacion:** ET-TCH-003
- **EPIC:** EXT-001
