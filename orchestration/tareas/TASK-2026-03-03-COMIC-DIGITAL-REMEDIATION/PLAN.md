# Plan: Comic Digital — Remediación Completa

**Fecha:** 2026-03-03
**Ejercicio:** comic_digital (Module 5, Exercise 5.2)
**Modelo Orquestador:** Opus 4.6

---

## Diagnóstico Consolidado (4 Agentes de Exploración)

### Issues CRÍTICOS Encontrados

| # | Severidad | Issue | Archivo | Línea |
|---|-----------|-------|---------|-------|
| C1 | CRITICO | Todos los speech bubbles se crean en `x:50, y:30` — se sobreponen al 100% | ComicDigitalExercise.tsx | 148-149 |
| C2 | CRITICO | No hay drag-and-drop ni mecanismo para reposicionar bubbles | ComicDigitalExercise.tsx | N/A (ausente) |
| C3 | ALTO | No hay UI para editar texto de bubbles (inmutable tras crear) | ComicDigitalExercise.tsx | N/A (ausente) |
| C4 | ALTO | No hay reordenamiento de paneles (solo agregar/eliminar) | ComicDigitalExercise.tsx | N/A (ausente) |
| C5 | MEDIO | `layout` ('full'/'half'/'third') almacenado pero NO renderizado | ComicDigitalExercise.tsx | 408-451 |
| C6 | MEDIO | Background global en vez de per-panel | ComicDigitalExercise.tsx | 409 |
| C7 | MEDIO | MIN_PANELS=6 frontend vs 4 backend DTO vs 3 SQL | Cross-layer | — |
| C8 | MEDIO | Validator valida `panel.text` pero DTO envía `panel.dialogue` | exercise-validator.service.ts | 183-196 |
| C9 | BAJO | Mock data, types y schemas no consumidos por el componente | comicDigitalMockData.ts | — |

### Patrones DnD Existentes (Reutilizables)

| Patrón | Librería | Uso Actual | Aplicación Comic |
|--------|----------|-----------|------------------|
| Sortable vertical list | framer-motion `Reorder` | Timeline, PuzzleContexto | **Panel reordering** |
| Free-form 2D canvas drag | framer-motion `drag` prop | MapaConceptual | **Bubble repositioning** |
| Pool → Drop zones | @dnd-kit/core | CausaEfecto, Infografía | No aplica |

### Backend DTO Esperado

```typescript
// ComicDigitalAnswerDto
{
  panels: ComicPanelDto[]  // @ArrayMinSize(4), @ArrayMaxSize(6)
}

// ComicPanelDto
{
  panelNumber: number,      // @Min(1)
  dialogue: string,         // Required — concatenación de speech bubbles
  narration: string,        // Required — texto narrativo
  imageUrl?: string,        // Optional
  visualDescription?: string // Optional
}
```

### Rúbrica (Teacher Manual Review)

| Criterio | Peso | Evaluación |
|----------|------|------------|
| Narrativa y Guion | 30% | Historia coherente, diálogos naturales |
| Organización Visual | 20% | Paneles estructurados, flujo claro |
| Precisión Histórica | 25% | Contenido correcto, contexto apropiado |
| Creatividad | 25% | Enfoque único, técnicas de cómic |

---

## Plan de Ejecución — 6 Fases

### FASE 0: Preparación (Opus directo)
- Leer archivo completo actual para tener contexto de líneas exactas
- Crear task list

### FASE 1: Fix Core — Speech Bubbles + Panel Reorder (3 subagentes paralelos)

| ID | Subagente | Modelo | Tarea | Archivos |
|----|-----------|--------|-------|----------|
| 1A | Bubble DnD + Edit | **Sonnet** | Implementar drag libre para speech bubbles dentro de paneles + edición inline de texto | ComicDigitalExercise.tsx |
| 1B | Panel Reorder | **Sonnet** | Implementar reordenamiento de paneles con framer-motion Reorder | ComicDigitalExercise.tsx |
| 1C | Stagger Spawn | **Haiku** | Offset de coordenadas al crear nuevos bubbles (evitar sobreposición inmediata) | ComicDigitalExercise.tsx |

**NOTA:** Los 3 subagentes modifican el MISMO archivo. Para evitar conflictos, se ejecutan en worktrees aislados y luego se integran manualmente.

**DECISIÓN REVISADA:** Dado que los 3 cambios están en el mismo archivo y son interdependientes, se implementará como UN SOLO subagente Sonnet que aplica las 3 mejoras.

| ID | Subagente | Modelo | Tarea |
|----|-----------|--------|-------|
| 1A | Comic Digital Core Fix | **Opus (directo)** | Implementar: (1) Bubble drag con framer-motion `drag` prop, (2) Bubble text editing inline, (3) Stagger spawn coordinates, (4) Panel reorder con framer-motion `Reorder` |

**Cambios específicos en `ComicDigitalExercise.tsx`:**

1. **Bubble drag (framer-motion `drag`):**
   - Cada `<div>` de speech bubble → `<motion.div drag dragMomentum={false} dragConstraints={panelRef}>`
   - `onDragEnd` actualiza `bubble.x` y `bubble.y` en state
   - Patrón: idéntico a MapaConceptual/ConceptNode

2. **Bubble text editing:**
   - Click en bubble → textarea inline (reemplaza texto estático)
   - `onBlur` o `Enter` guarda texto
   - Estado: `editingBubbleId: string | null`

3. **Stagger spawn:**
   - Nuevos bubbles usan offset basado en cantidad existente:
     ```
     x: 20 + (existingCount * 15) % 60
     y: 20 + (existingCount * 15) % 50
     ```
   - Evita sobreposición inmediata

4. **Panel reorder (framer-motion `Reorder`):**
   - Panel list wrapper → `<Reorder.Group axis="y" values={panels} onReorder={setPanels}>`
   - Cada panel → `<Reorder.Item value={panel}>`
   - GripVertical handle con `useDragControls` (patrón Timeline)

### FASE 2: Fix Visual — Layout + Background (1 subagente)

| ID | Subagente | Modelo | Tarea |
|----|-----------|--------|-------|
| 2A | Panel Visual Fix | **Haiku** | (1) Renderizar `layout` como ancho visual (`full`=100%, `half`=50%, `third`=33%), (2) Background per-panel en vez de global |

**Cambios en `ComicDigitalExercise.tsx`:**

1. **Layout rendering:**
   - Panel wrapper aplica clase según `panel.layout`:
     - `'full'` → `w-full`
     - `'half'` → `w-full sm:w-1/2`
     - `'third'` → `w-full sm:w-1/3`
   - Panels container → `flex flex-wrap`

2. **Per-panel background:**
   - `addPanel()` incluye `background: selectedBackground`
   - Background selector aplica al panel seleccionado, no global
   - Cada panel renderiza su propio `bgClass`

### FASE 3: Fix Cross-Layer — MIN_PANELS + Validator (2 subagentes paralelos)

| ID | Subagente | Modelo | Tarea |
|----|-----------|--------|-------|
| 3A | Frontend MIN_PANELS | **Haiku** | Cambiar `MIN_PANELS_REQUIRED = 6` → `4` (alinear con backend DTO y seed) |
| 3B | Backend Validator | **Haiku** | Fix `validateComicDigital()`: verificar `panel.dialogue` y `panel.narration` en vez de `panel.text` y `panel.image` |

### FASE 4: Validación (3 subagentes paralelos)

| ID | Subagente | Modelo | Tarea |
|----|-----------|--------|-------|
| 4A | Build/Lint/Typecheck | **Haiku** | `cd apps/frontend && npm run build && npm run lint && npm run typecheck` |
| 4B | Backend Build/Test | **Haiku** | `cd apps/backend && npm run build && npm run lint && npm run test -- --testPathPattern=exercise-validator` |
| 4C | Cross-Layer Review | **Sonnet** | Verificar: (1) payload de `handleSubmit` compatible con `ComicDigitalAnswerDto`, (2) `onProgressUpdate` compatible con ExerciseContext Path B, (3) todos los paths de submission funcionan |

**Gate:** Los 3 deben PASAR. Si falla alguno, se corrige antes de continuar.

### FASE 5: Documentación (2 subagentes paralelos)

| ID | Subagente | Modelo | Tarea |
|----|-----------|--------|-------|
| 5A | Report + PROXIMA-ACCION | **Sonnet** | Crear REMEDIATION-REPORT.md, actualizar PROXIMA-ACCION.md |
| 5B | Inventarios | **Haiku** | Version bump FRONTEND_INVENTORY + MASTER_INVENTORY |

### FASE 6: Validación Final (1 subagente)

| ID | Subagente | Modelo | Tarea |
|----|-----------|--------|-------|
| 6A | Final Review | **Sonnet** | Revisión cruzada completa: UX coherente, DnD funcional, payload correcto, no regresiones, dual-path verificado |

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `ComicDigitalExercise.tsx` | Bubble DnD + editing + stagger + panel reorder + layout rendering + per-panel bg |
| `exercise-validator.service.ts` | Fix field names `text`→`dialogue`, `image`→`narration` |
| `REMEDIATION-REPORT.md` | Nuevo — reporte completo |
| `PROXIMA-ACCION.md` | Changelog entry |
| `FRONTEND_INVENTORY.yml` | Version bump |
| `MASTER_INVENTORY.yml` | Version bump |

## Pre-existentes Documentados (NO corregidos en esta tarea)

- Mock data, types y schemas no consumidos por el componente
- `actionsRef` prop definido en types pero no implementado
- Rubric weight mismatch (seed content 25/25/25/25 vs rubric table 30/20/25/25)
- No image upload UI (solo visualDescription texto)
- SQL min_panels=3 vs backend=4 (SQL es más permisivo, no causa issues)

## Resumen de Subagentes

| Fase | Subagentes | Modelos | Paralelo |
|------|------------|---------|----------|
| 0 | 0 | Opus directo | — |
| 1 | 1 | Opus directo | — |
| 2 | 1 | Haiku | — |
| 3 | 2 | Haiku + Haiku | Sí |
| 4 | 3 | Haiku + Haiku + Sonnet | Sí |
| 5 | 2 | Sonnet + Haiku | Sí |
| 6 | 1 | Sonnet | — |
| **Total** | **10** | **1 Opus + 3 Sonnet + 6 Haiku** | — |
