---
id: "RF-TCH-002c"
title: "Vista de Entregas de Estudiantes"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "teacher"
epic: "EXT-001"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Vista de Entregas de Estudiantes

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-TCH-002c |
| Modulo | teacher |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-001 |

## Descripcion

El sistema debe proporcionar al maestro una vista consolidada de todas las entregas (submissions) de una tarea. La vista permite filtrar por estado de entrega, ordenar por fecha o estudiante, y acceder rapidamente a la interfaz de calificacion. Incluye indicadores visuales de entregas a tiempo, tardias y pendientes.

## Requerimiento Funcional

- **RF-TCH-002c.1:** El maestro puede ver una tabla con todas las entregas de una tarea mostrando estudiante, fecha de entrega, estado (entregado, tarde, pendiente, calificado) y calificacion.
- **RF-TCH-002c.2:** La vista permite filtrar entregas por estado y ordenar por cualquier columna (nombre, fecha, calificacion).
- **RF-TCH-002c.3:** Cada entrega muestra un indicador visual de si fue a tiempo (verde), tardia (amarillo) o no entregada (rojo).
- **RF-TCH-002c.4:** El maestro puede descargar todas las entregas de una tarea en un archivo ZIP para revision offline.

## Criterios de Aceptacion

- [ ] AC-001: La tabla muestra correctamente todas las entregas con los campos especificados.
- [ ] AC-002: Los filtros por estado funcionan y actualizan la tabla en tiempo real.
- [ ] AC-003: Los indicadores de color reflejan correctamente el estado temporal de cada entrega.
- [ ] AC-004: La descarga ZIP incluye todos los archivos entregados organizados por carpeta de estudiante.
- [ ] AC-005: Hacer clic en una entrega navega directamente a la interfaz de calificacion de esa entrega.

## Reglas de Negocio

- Las entregas tardias se marcan automaticamente comparando fecha de entrega con fecha limite.
- El estado "pendiente" aplica a estudiantes asignados que no han entregado.
- La descarga ZIP esta limitada a 500MB por tarea.

## Dependencias

- Tabla `submissions` en esquema `assignment`.
- Servicio de generacion de archivos ZIP.

## Referencias

- **User Story:** US-PM-002c
- **Especificacion:** ET-TCH-002
- **EPIC:** EXT-001
