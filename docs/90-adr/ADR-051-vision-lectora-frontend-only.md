---
titulo: "ADR-051: Vision Lectora — Frontend-Only CSS Scoped Implementation"
tipo: adr
fecha_creacion: "2026-02-28"
ultima_actualizacion: "2026-02-28"
estado: aceptada
---

# ADR-051: Vision Lectora — Frontend-Only CSS Scoped Implementation

**Estado:** Aceptada
**Date:** 2026-02-28
**Deciders:** Frontend Team, Architecture
**Tags:** frontend, gamification, comodines, vision-lectora, css, exercise-mechanics

---

## Context

### Spec ET-GAM-002 (Diseno Original)

La especificacion tecnica ET-GAM-002 describia el comodin "Vision Lectora" como un sistema backend-driven:

1. **Backend:** `ComodinService.generateReadingVision(exerciseId)` analizaria el contenido del ejercicio y su `answer_key` para determinar oraciones relevantes
2. **Response:** `POST /comodines/use` retornaria `{ effect: { highlightedSentences: [1, 3, 5] } }` — indices de oraciones a resaltar
3. **Frontend:** Dividiria el texto en oraciones, renderizaria cada una en un `<span>`, y aplicaria highlight selectivo a los indices recibidos

### Implementacion Real (MVP)

Al auditar el codebase (2026-02-28), se encontro:

1. **`generateReadingVision()` nunca fue implementado** — el codigo en ET-GAM-002 es pseudocodigo con `// TODO: Implementar algoritmo de NLP real` y placeholder `[1, 3, 5]`
2. **Backend `use_comodin()` SQL** retorna `{ success, comodin_type, hint_number, remaining_quantity }` — sin campo `effect` ni `highlightedSentences`
3. **Frontend** usa CSS blanket: clase `.vision-lectora-active` en `ExerciseLayout.tsx` con selectores globales `p, span, li` que resaltan TODO el contenido del ejercicio — incluyendo botones, labels, word banks, y controles UI
4. **`highlightedSentences`** — 0 resultados en grep de todo el codebase
5. **Ninguna mecanica** lee `visionActive` del contexto de comodines

### Problema del CSS Blanket

El selector `.vision-lectora-active p, .vision-lectora-active span, .vision-lectora-active li` afectaba:
- Botones de opciones de respuesta (DetectiveTextual)
- Labels de "Validar Palabra" (SopaLetras)
- Word bank buttons (CompletarEspacios)
- Progress bars, iconos, todo elemento `span` del UI

### Viabilidad de Alternativas

| Mecanica | Tiene Pasaje | Viabilidad NLP |
|----------|-------------|----------------|
| DetectiveTextual | SI (passage) | Alta — candidato principal |
| CompletarEspacios | PARCIAL (texto con blanks) | Media |
| PuzzleContexto | Fragmentos separados | Baja |
| VerdaderoFalso | 1 oracion por statement | Muy baja |
| Crucigrama, SopaLetras, Timeline | No tienen pasaje | No aplica |

Solo 1-2 mecanicas se beneficiarian del sentence-level highlighting.

---

## Decision

Vision lectora se implementa como **efecto CSS frontend-only scoped a contenedores `.exercise-passage`**:

1. **CSS:** Reemplazar selectores blanket (`p, span, li`) con scoped (`.exercise-passage p, .exercise-passage li`)
2. **Mecanicas con pasaje:** Agregan clase `exercise-passage` a su contenedor de texto de lectura
3. **Mecanicas sin pasaje:** No reciben highlight (comportamiento correcto — no hay texto que resaltar)
4. **Backend:** Sin cambios — `use_comodin()` sigue retornando confirmacion de inventario
5. **ExerciseLayout.tsx:** Sin cambios — sigue aplicando `.vision-lectora-active` al wrapper

### Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `shared/styles/index.css` | Selectores CSS: `p, span, li` → `.exercise-passage p, .exercise-passage li` + border-left accent |
| `DetectiveTextualExercise.tsx` | Wrap pasaje en `<div class="exercise-passage">` |
| `CompletarEspaciosExercise.tsx` | Agregar `exercise-passage` class al contenedor de texto |

---

## Rationale

1. **MVP 99% completado:** Implementar NLP backend (`generateReadingVision()`) es desproporcionado. Solo 1-2 mecanicas se beneficiarian.
2. **Keyword proximity rechazado (Approach B):** Resaltar oraciones que contengan palabras clave de las preguntas/respuestas **filtraria las respuestas al estudiante**, anulando el proposito pedagogico del ejercicio.
3. **CSS-only insuficiente (Approach C):** Refinar selectores sin agregar `.exercise-passage` wrappers no resolveria el problema de botones/controles resaltados en mecanicas sin pasaje.
4. **Zero regresion:** ExerciseLayout.tsx no cambia. Mecanicas sin pasaje dejan de recibir highlight erroneo. Mecanicas con pasaje reciben highlight focalizado.

---

## Consequences

### Positivas

- **UX corregido:** Vision lectora resalta solo el texto de lectura, no botones ni controles UI
- **Pedagogicamente apropiado:** No revela respuestas al estudiante
- **Zero cambios backend:** Sin riesgo de regresion en API ni base de datos
- **Future-proof:** La clase `.exercise-passage` establece el patron para sentence-level highlighting futuro

### Negativas

- **Sin granularidad por oracion en MVP:** Todo el pasaje se resalta uniformemente (vs indices selectivos)
- **Solo 2 mecanicas soportadas:** DetectiveTextual y CompletarEspacios. Otras mecanicas no tienen pasaje relevante.

---

## Alternatives Considered

| Approach | Descripcion | Veredicto |
|----------|-------------|-----------|
| A — Backend NLP | Implementar `generateReadingVision()` con analisis de contenido | **Diferido** — desproporcionado para MVP. Path futuro viable. |
| B — Frontend keyword proximity | Highlight oraciones que contengan keywords de preguntas | **Rechazado** — filtra respuestas al estudiante |
| C — Solo CSS tightening | Refinar selectores sin wrappers en mecanicas | **Insuficiente** — no resuelve highlight en mecanicas sin pasaje |
| **D — Hybrid scoped (elegido)** | **CSS scoped `.exercise-passage` + wrappers en mecanicas** | **Aceptado** |

---

## Future Path (v2)

Si se decide implementar sentence-level highlighting en el futuro:

1. Backend agrega `highlightedSentences: number[]` al response de `use_comodin()` para `vision_lectora`
2. Frontend splitea el pasaje en oraciones: `passage.split(/(?<=[.!?])\s+/)`
3. Renderiza cada oracion en `<span className={highlighted ? 'vision-lectora-highlighted' : ''}>`
4. CSS targetea `.vision-lectora-highlighted` en lugar de `.exercise-passage p`
5. La clase `.exercise-passage` sigue siendo util como scope container

---

## References

- ET-GAM-002: Especificacion tecnica comodines (`docs/10-requirements/epics/EPIC-GAM-F1-GAMIFICATION/specifications/ET-GAM-002-comodines.md`)
- GAP-P3-001 en SPEC-EXERCISES (`docs/60-portals/student/specs/SPEC-EXERCISES.md`)
- ExerciseLayout.tsx — aplica `.vision-lectora-active` (L109)
- useExerciseComodines.ts — expone `visionActive: boolean`

---

*GAMILIT - Architecture Decision Record*
