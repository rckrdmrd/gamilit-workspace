---
id: US-M5-002
title: Calificacion docentes con rubricas
epic: EAI-007
et: ET-M4M5-002
status: Done
story_points: 8
sprint: 8
created: 2025-12-05
updated: 2026-01-04
---

# US-M5-002: Calificacion Docentes con Rubricas

## Historia de Usuario

**Como** docente
**Quiero** calificar ejercicios M4-M5 usando rubricas predefinidas
**Para** evaluar de forma consistente las competencias de los estudiantes

## Criterios de Aceptacion

- [x] Interfaz de calificacion muestra rubrica con criterios
- [x] Docente puede asignar puntuacion por criterio (0-100)
- [x] Sistema calcula puntuacion final ponderada
- [x] Docente puede agregar feedback textual
- [x] Al guardar calificacion, se dispara calculo de XP/ML
- [x] Estudiante recibe notificacion de ejercicio calificado

## Rubricas por Tipo

| Ejercicio | Criterios |
|-----------|-----------|
| Ensayo | Contenido, Estructura, Creatividad, Ortografia |
| Carta | Empatia, Coherencia, Creatividad, Presentacion |
| Proyecto | Contenido, Calidad Tecnica, Originalidad, Esfuerzo |

## Notas de Implementacion

Implementado en Sprint 8. La UI de calificacion esta en:
`apps/frontend/src/features/teacher/pages/ManualReviewsPage.tsx`

---

**Estado:** Done
