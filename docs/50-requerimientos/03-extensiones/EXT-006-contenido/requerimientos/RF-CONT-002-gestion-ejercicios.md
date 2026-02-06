---
id: "RF-CONT-002"
title: "Gestion Ejercicios"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "content"
epic: "EXT-006"
version: "1.0.0"
created_date: "2026-02-06"
updated_date: "2026-02-06"
---

# Gestion Ejercicios

## Metadata

| Campo | Valor |
|-------|-------|
| ID | RF-CONT-002 |
| Modulo | content |
| Prioridad | Alta |
| Status | Done |
| EPIC | EXT-006 |

## Descripcion

El sistema debe proporcionar herramientas avanzadas de gestion de ejercicios para creadores de contenido: CRUD completo, asignacion a modulos, configuracion de dificultad, parametros de calificacion y preview interactivo. Los ejercicios soportan las 6 mecanicas definidas en EAI-002.

## Requerimiento Funcional

- **RF-CONT-002.1:** CRUD de ejercicios con validacion de campos obligatorios y preview en tiempo real.
- **RF-CONT-002.2:** Asignar ejercicios a modulos con orden configurable y prerequisitos.
- **RF-CONT-002.3:** Configurar parametros por ejercicio: dificultad, XP otorgado, tiempo limite, intentos maximos.
- **RF-CONT-002.4:** Preview interactivo que simula la experiencia del estudiante antes de publicar.
- **RF-CONT-002.5:** Clonar ejercicios existentes como base para nuevos con ajustes.

## Criterios de Aceptacion

- [x] AC-001: CRUD completo funcional para las 6 mecanicas de ejercicio.
- [x] AC-002: Preview muestra ejercicio exactamente como lo vera el estudiante.
- [x] AC-003: Clonacion preserva contenido y configuracion, genera nuevo ID.
- [x] AC-004: Validacion impide publicar ejercicios sin respuesta correcta definida.

## Referencias

- **User Story:** US-CONT-002
- **Especificacion:** ET-CONT-001
- **EPIC:** EXT-006
