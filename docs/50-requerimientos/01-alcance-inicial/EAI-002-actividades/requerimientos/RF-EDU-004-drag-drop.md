---
id: "RF-EDU-004"
title: "Mecanica de Ejercicio Drag and Drop"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "Contenido Educativo"
epic: "EAI-002"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Mecanica de Ejercicio Drag and Drop

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-EDU-004 |
| Modulo | Contenido Educativo |
| Prioridad | Alta |
| Status | Done |
| EPIC | EAI-002 |

## Descripcion

El sistema debe soportar ejercicios de tipo Drag and Drop donde los estudiantes arrastran elementos (textos, imagenes) a zonas de destino especificas. Esta mecanica interactiva es ideal para actividades de clasificacion, organizacion espacial y relacion de conceptos, implementada con la libreria dnd-kit.

## Requerimiento Funcional

- **RF-EDU-004.1:** Renderizar elementos arrastrables (draggables) con soporte para texto e imagenes, incluyendo indicadores visuales de que el elemento es interactivo (cursor grab, sombra al arrastrar).
- **RF-EDU-004.2:** Definir zonas de destino (drop zones) con feedback visual al pasar un elemento sobre ellas (highlight, borde punteado) y snap automatico al soltar en zona valida.
- **RF-EDU-004.3:** Validar la respuesta comparando la posicion final de cada elemento contra la respuesta correcta almacenada en BD (tabla educational_content.exercises, campo config JSONB).
- **RF-EDU-004.4:** Soportar multiples variantes: clasificacion (N elementos en M categorias), completar diagrama (elementos en posiciones fijas), y ordenar en contenedores.
- **RF-EDU-004.5:** Garantizar accesibilidad basica: soporte para teclado (tab + enter para seleccionar, flechas para mover) y feedback auditivo opcional.

## Criterios de Aceptacion

- [ ] AC-001: Los elementos se arrastran y sueltan fluidamente sin lag visible
- [ ] AC-002: Las zonas de destino proporcionan feedback visual al hover
- [ ] AC-003: La validacion determina correctamente si la respuesta es acertada
- [ ] AC-004: Funciona en desktop y tablet con touch support
- [ ] AC-005: El ejercicio se puede reintentar sin recargar la pagina

## Referencias

- **User Story:** US-ACT-004
- **Especificacion:** ET-EDU-004
- **EPIC:** EAI-002
