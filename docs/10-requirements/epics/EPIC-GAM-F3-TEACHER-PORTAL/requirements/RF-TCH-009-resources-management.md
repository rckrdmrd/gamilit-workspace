---
id: "RF-TCH-009"
title: "Gestion de Recursos Didacticos"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "teacher"
epic: "EXT-001"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Gestion de Recursos Didacticos

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-TCH-009 |
| Modulo | teacher |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-001 |

## Descripcion

El sistema debe permitir a los maestros gestionar una biblioteca de recursos didacticos por aula. Los recursos incluyen documentos, enlaces, videos y materiales de apoyo que el maestro comparte con sus estudiantes. Los recursos se organizan por carpetas tematicas y pueden asociarse a tareas especificas como material complementario.

## Requerimiento Funcional

- **RF-TCH-009.1:** El maestro puede subir archivos (PDF, DOCX, PPTX, imagenes, videos) y agregar enlaces externos como recursos del aula, organizados en carpetas tematicas.
- **RF-TCH-009.2:** Cada recurso tiene titulo, descripcion, tipo, etiquetas y visibilidad (visible a todos, visible por grupo, oculto/borrador).
- **RF-TCH-009.3:** El maestro puede vincular recursos a tareas especificas como material de referencia, apareciendo en la vista de la tarea del estudiante.
- **RF-TCH-009.4:** El sistema muestra estadisticas de acceso por recurso: numero de visualizaciones, descargas y estudiantes unicos que accedieron.

## Criterios de Aceptacion

- [ ] AC-001: Los archivos se suben correctamente y son accesibles para los estudiantes con visibilidad adecuada.
- [ ] AC-002: Las carpetas tematicas permiten organizar y navegar recursos de forma jerarquica.
- [ ] AC-003: Un recurso vinculado a una tarea aparece como material de referencia en la vista del estudiante.
- [ ] AC-004: Las estadisticas de acceso muestran datos correctos de visualizaciones y descargas.
- [ ] AC-005: El almacenamiento total por aula no excede 1GB y muestra uso actual vs limite.

## Reglas de Negocio

- Limite de almacenamiento: 1GB por aula, archivos individuales maximo 100MB.
- Los recursos ocultos no son visibles para estudiantes pero si para el maestro.
- Al archivar un aula, los recursos permanecen accesibles en modo solo lectura.

## Dependencias

- Servicio de almacenamiento de archivos (storage).
- Tabla `resources` en esquema `classroom` o `content`.

## Referencias

- **User Story:** US-PM-009
- **Especificacion:** ET-TCH-009
- **EPIC:** EXT-001
