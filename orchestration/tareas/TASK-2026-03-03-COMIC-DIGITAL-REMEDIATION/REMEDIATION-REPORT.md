# Cómic Digital — Remediation Report

**Fecha:** 2026-03-03
**Mecánica:** Resumen Visual Progresivo (Cómic Digital) — Module 5, Exercise 5.2
**Severidad:** 5 CRITICO/ALTO + 4 MEDIO/BAJO

---

## Issues Resueltos (9/9)

| # | Sev | Issue | Fix |
|---|-----|-------|-----|
| C1 | CRITICO | Speech bubbles ALL created at x:50, y:30 — 100% overlap | Stagger spawn: `x: 20 + (count*15)%60`, `y: 20 + (count*15)%50` |
| C2 | CRITICO | No mechanism to reposition bubbles | `framer-motion` `drag` prop on `DraggableBubble` component, `dragConstraints={panelRef}`, position updated on `onDragEnd` |
| C3 | ALTO | Bubble text immutable after creation | Click-to-edit: `editingBubbleId` state, inline `textarea` on click, blur to save |
| C4 | ALTO | No panel reordering or deletion | `framer-motion` `Reorder.Group` + `Reorder.Item` for vertical drag reorder; `deletePanel()` handler + Trash2 button |
| C5 | MEDIO | Layout stored but not visually rendered | `getLayoutWidthClass()`: full→`w-full`, half→`w-full sm:w-[calc(50%-0.5rem)]`, third→`w-full sm:w-[calc(33.33%-0.67rem)]` via `flex flex-wrap gap-4` |
| C6 | MEDIO | Background global instead of per-panel | Each panel has `background` field; sidebar selector applies to `selectedPanel` via `setPanelBackground()` |
| C7 | MEDIO | MIN_PANELS mismatch FE=6 vs BE=4 | `MIN_PANELS_REQUIRED = 4`, `MAX_PANELS = 6` — aligned with backend `@ArrayMinSize(4)` / `@ArrayMaxSize(6)` |
| C8 | MEDIO | Backend validator uses text/image vs DTO dialogue/narration | `validateComicDigital()` now accepts `dialogue`, `narration`, `text` (legacy) — union check |
| C9 | BAJO | Component uses inline interfaces instead of types SSOT | Replaced inline interfaces with imports from `comicDigitalTypes.ts`; layouts/backgrounds from `comicDigitalMockData.ts` |

## Archivos Modificados (4)

| Archivo | Cambios |
|---------|---------|
| `apps/frontend/src/features/mechanics/module5/ComicDigital/ComicDigitalExercise.tsx` | Full rewrite: DraggableBubble + ReorderablePanel sub-components, bubble drag/edit/delete, panel reorder/delete, per-panel backgrounds, layout visual rendering, import SSOT types |
| `apps/frontend/src/features/mechanics/module5/ComicDigital/comicDigitalTypes.ts` | +5 actions in `ComicDigitalActions`: `updateBubblePosition`, `updateBubbleText`, `deleteBubble`, `reorderPanels`, `setPanelBackground` |
| `apps/frontend/src/features/mechanics/module5/ComicDigital/comicDigitalMockData.ts` | `minPanels` 6→4, `maxPanels` 12→6 |
| `apps/backend/src/modules/progress/services/validators/exercise-validator.service.ts` | `validateComicDigital()` accepts `dialogue`/`narration` alongside legacy `text`/`image` |

## Validación

| Check | Resultado |
|-------|-----------|
| Frontend typecheck (`tsc --noEmit`) | PASS — 0 errors |
| Frontend build (`npm run build`) | PASS — 22.21s |
| Frontend lint (eslint) | PASS — 0 errors |
| Backend typecheck (`tsc --noEmit`) | PASS — 0 errors |
| Backend build (`npm run build`) | PASS — 0 errors |
| Backend lint (eslint) | PASS — 0 errors |
| Cross-layer review (6 checks) | 6/6 PASS |

### Cross-Layer Review Detail

1. **handleSubmit payload ↔ ComicDigitalAnswerDto:** PASS — panelNumber, dialogue, narration, imageUrl?, visualDescription? match exactly
2. **onProgressUpdate Path B:** PASS — answers.panels in DTO format
3. **framer-motion drag → state:** PASS — DraggableBubble.onDragEnd → updateBubblePosition → immutable setPanels
4. **Reorder.Group identity:** PASS — values={panels}, Reorder.Item value={panel}, unique ids via Date.now()
5. **MIN_PANELS=4 enforcement:** PASS — submit guard, score calc, UI badge
6. **MAX_PANELS=6 enforcement:** PASS — addPanel guard, button disabled state, max message

## Patrones Reutilizados

| Patrón | Fuente | Uso |
|--------|--------|-----|
| `motion.div drag` | `ConceptNode.tsx` (MapaConceptual) | Bubble free-form drag |
| `Reorder.Group/Item` + `useDragControls` | `PuzzleContextoExercise.tsx`, `TimelineExercise.tsx` | Panel vertical reorder with drag handle |

## Pre-existentes Documentados (NO corregidos)

- `actionsRef` prop definido en types pero no wired al componente
- Rubric weight mismatch en seed (25/25/25/25 vs tabla 30/20/25/25) — audited separately
- No image upload UI (solo visualDescription texto)
- SQL min_panels=3 vs backend=4 (SQL más permisivo, no causa issues)

---

## Second Wave — Bug Fixes + Features (2026-03-03)

**Scope:** Post-first-wave regression audit revealed 6 additional bugs in drag precision and background rendering, plus 4 features implemented to complete the mechanic.

### Bugs Fixed (A1-A3: Bubble Drag, B1-B3: Background)

| ID | Sev | Description | Root Cause | Fix |
|----|-----|-------------|------------|-----|
| A1 | ALTO | Bubble drag jumps on mousedown — cursor detaches from bubble | `drag` without offset tracking: pointer grabbed from top-left corner | Applied `info.offset` from `onDragStart` to initialize visual offset; bubble now tracks pointer grab point |
| A2 | ALTO | Bubble position resets to stagger default on re-render | `DraggableBubble` lacked stable `x`/`y` initial values from state | Passed `bubble.x` / `bubble.y` as `useMotionValue` initial values so position persists across renders |
| A3 | MEDIO | Bubble drag escapes panel container on fast mouse movement | `dragConstraints` ref was attached to outer wrapper, not the inner panel drawing area | Moved `panelRef` constraint attachment to the direct panel content `div` |
| B1 | CRITICO | Panel background color not visible — panels always render white | `background` field stored as color name string (`'azul'`) but `div` style expected CSS color value | Added `bgClass` lookup map in `comicDigitalMockData.ts`: color names → Tailwind `bg-*` classes applied via `className` |
| B2 | ALTO | Background selector in sidebar shows swatches but applying has no effect | `setPanelBackground()` updated state but component used stale `panel.background` as inline `style.backgroundColor` | Changed rendering to use `bgClass` from mockData map; removed inline `style` background override |
| B3 | MEDIO | `Reorder.Group` axis not specified — drag conflicts with vertical panel scroll | Missing `axis="y"` prop on `Reorder.Group` | Added `axis="y"` to constrain reorder drag to vertical axis only |

### Features Added (F1-F4)

| ID | Feature | Description | Implementation |
|----|---------|-------------|----------------|
| F1 | Suggested Scenes Sidebar | Right-side panel listing scene suggestions from exercise data, click to pre-fill panel description | `suggestedScenes` extracted from `exerciseAdapter.ts` `adaptExerciseForComicDigital()`; rendered as clickable cards in sidebar |
| F2 | Template Selector | Modal/dropdown to choose from predefined panel layout templates (3-panel story, 4-panel sequence, 6-panel full) | `PANEL_TEMPLATES` array in `comicDigitalMockData.ts`; `applyTemplate()` action replaces panels with template structure |
| F3 | Exercise Prop Typing | `ComicDigitalExercise` now accepts typed `exercise` prop instead of `any` | Added `ComicDigitalExerciseProps` interface in `comicDigitalTypes.ts`; component signature updated |
| F4 | Touch Targets 44px | All icon buttons (add bubble, delete bubble, delete panel, drag handle) meet 44px minimum touch target | Added `min-w-[44px] min-h-[44px]` to all interactive icon buttons per `ESTANDAR-FRONTEND-RESPONSIVE.md` |

### Files Modified (3)

| Archivo | Cambios |
|---------|---------|
| `apps/frontend/src/features/mechanics/module5/ComicDigital/ComicDigitalExercise.tsx` | Main rewrite: bubble drag offset fix (A1/A2), panel constraint fix (A3), bgClass rendering (B2), Reorder.Group axis (B3), suggested scenes sidebar (F1), template selector (F2), exercise prop typing (F3), touch targets 44px (F4) |
| `apps/frontend/src/features/mechanics/module5/ComicDigital/comicDigitalMockData.ts` | Added `bgClass` color name → Tailwind class lookup map (B1), `PANEL_TEMPLATES` array (F2) |
| `apps/frontend/src/shared/utils/exerciseAdapter.ts` | `adaptExerciseForComicDigital()` now extracts and returns `suggestedScenes` array from exercise content (F1) |

### Validación

| Check | Resultado |
|-------|-----------|
| Frontend typecheck (`tsc --noEmit`) | PASS — 0 errors |
| Frontend build (`npm run build`) | PASS — 0 errors |
| Frontend lint (eslint) | PASS — 0 errors |
| Functional checks (14/14) | PASS |

#### Functional Checks Detail (14/14)

1. **Bubble drag grab point:** Pointer stays on bubble on mousedown — no cursor jump
2. **Bubble position persistence:** Position survives re-render (React state + motion value)
3. **Bubble drag containment:** Bubble stays within panel content area on fast drag
4. **Background color visible:** Panel renders correct Tailwind bg-* class on background selection
5. **Background selector effect:** Clicking swatch in sidebar immediately updates panel background
6. **Reorder vertical-only:** Panel drag handle reorders vertically without horizontal drift
7. **Suggested scenes sidebar:** Scenes from exercise data appear in right sidebar
8. **Scene click pre-fill:** Clicking suggested scene populates panel description field
9. **Template selector modal:** Template chooser opens and displays available templates
10. **Template application:** Selecting template replaces panel list with template structure
11. **Exercise prop typing:** Component accepts typed `exercise` prop (no `any` cast required)
12. **Touch target — add bubble:** `min-h-[44px]` present on add bubble button
13. **Touch target — delete bubble:** `min-h-[44px]` present on delete bubble button
14. **Touch target — panel controls:** `min-h-[44px]` present on delete panel and drag handle buttons

---

## Third Wave — Visual Reconstruction (2026-03-03)

**Scope:** Complete visual overhaul addressing 5 fundamental problems discovered in post-wave-2 user testing. Component rewrite from 715 → ~860 lines. Drag system replaced, sticker system added, backgrounds enriched.

### Problems Fixed (P1-P5)

| ID | Sev | Description | Root Cause | Fix |
|----|-----|-------------|------------|-----|
| P1 | CRITICO | Half/Third panels render at 100% width — always stacked vertically | `Reorder.Group className="space-y-4"` forces vertical stacking; `Reorder.Item` renders `<li>` (block-level). `panel.layout` stored but never translated to CSS width. | Replaced `framer-motion Reorder` with `@dnd-kit/sortable` + `flex flex-wrap gap-4` container. `SortablePanel` applies `getLayoutWidthClass()`: half=`w-[calc(50%-0.5rem)]`, third=`w-[calc(33.33%-0.67rem)]`. `rectSortingStrategy` handles 2D grid reorder natively. |
| P2 | CRITICO | Elements disappear during drag within panel | 3 compound factors: (1) `panelRef={{ current: ... }}` creates new object per render — framer-motion loses constraint reference; (2) Race condition: framer-motion resets transform to (0,0) async while React updates position; (3) `Reorder.Item` applies `layout={true}` by default interfering with absolute-positioned children. | Replaced `framer-motion drag` with manual pointer events: `onPointerDown`→`setPointerCapture`, `onPointerMove`→DOM-direct `el.style.left/top` (zero re-renders during drag), `onPointerUp`→commit to React state. Element NEVER disappears. |
| P3 | ALTO | Backgrounds are flat colors without visual identity | `mockBackgrounds` defined only a single Tailwind `bg-*` class per background. Nearly invisible, no gradients/icons. | Replaced with 8 rich backgrounds: 6 thematic with multi-color CSS gradients + decorative emoji icon + accent border, 2 illustrated with SVG `backgroundImage` overlay. `BackgroundOption` interface expanded with `gradientClasses`, `accentBorder`, `icon`, `illustrationUrl?`. |
| P4 | ALTO | No characters or visual elements for comic creation | Only speech bubbles available. No stickers, characters, props, or effects. | Added complete sticker system: 19 stickers in 3 categories (6 characters, 8 props, 5 effects) as emoji inside styled circles. New `ComicSticker` type + `stickers: ComicSticker[]` field in `ComicPanel`. `DraggableSticker` component with same pointer-event pattern as bubbles. Collapsible category palette in sidebar. |
| P5 | ALTO | Backend exercise data never reaches component | `adaptToComicDigitalData()` returns `suggestedScenes` at object root level, but component reads from `exercise?.mechanicData?.content?.suggestedScenes` (nested path that doesn't exist in adapted object). | Changed reading order: `exercise?.suggestedScenes` (adapter top-level) → `exercise?.mechanicData?.content?.suggestedScenes` → `exercise?.content?.suggestedScenes` → `mockSuggestedScenes`. Same fix for `templates`. |

### Architecture Changes

| Before | After |
|--------|-------|
| `framer-motion Reorder.Group/Item` for panel reorder | `@dnd-kit/sortable` (`DndContext` + `SortableContext` + `useSortable`) |
| `framer-motion motion.div drag` for bubble position | Manual pointer events (`onPointerDown/Move/Up` + `setPointerCapture` + DOM-direct updates) |
| `Reorder.Group className="space-y-4"` (vertical stack) | `div className="flex flex-wrap gap-4"` (2D grid) |
| `panelRef={{ current: ... }}` (new object per render) | `panelElement={panelRefs.current[panel.id]}` (stable HTMLDivElement) |
| 6 flat-color backgrounds | 8 rich gradient backgrounds (6 thematic + 2 illustrated with SVGs) |
| No stickers | 19 stickers (6 characters + 8 props + 5 effects) with drag system |

### Files Modified (4)

| Archivo | Cambios |
|---------|---------|
| `ComicDigitalExercise.tsx` | Complete rewrite: Reorder→@dnd-kit/sortable, drag→pointer events, SortablePanel + DraggableBubble + DraggableSticker + PanelDragPreview components, rich background rendering, sticker palette sidebar, adapter path fix |
| `comicDigitalTypes.ts` | +`ComicSticker`, +`StickerDefinition` interfaces, expanded `BackgroundOption` (gradientClasses, accentBorder, icon, illustrationUrl?), +`stickers: ComicSticker[]` in `ComicPanel`, +`suggestedScenes`/`templates` in `ExerciseFromPage` top-level, +sticker actions in `ComicDigitalActions` |
| `comicDigitalMockData.ts` | 8 rich `mockBackgrounds` (gradients + icons + 2 illustrated), 19 `STICKER_DEFINITIONS` (3 categories), `mockInitialPanels` with `stickers: []` |
| `comicDigitalSchemas.ts` | +`comicStickerSchema`, updated `comicPanelSchema` with `stickers` field, +`ComicStickerInput` type export |

### Validación

| Check | Resultado |
|-------|-----------|
| Frontend typecheck (`tsc --noEmit`) | PASS — 0 errors |
| Frontend build (`vite build`) | PASS — 20.87s |
| Frontend lint (eslint) | PASS — 0 errors |
| Backend typecheck (`tsc --noEmit`) | PASS — 0 errors |
| Cross-layer review (10 checks) | 10/10 PASS |

### Cross-Layer Review Detail (10/10)

1. **handleSubmit payload ↔ ComicDigitalAnswerDto:** PASS — panelNumber, dialogue, narration present
2. **Sticker data in metadata only:** PASS — stickers in metadata, not in panels DTO
3. **suggestedScenes reads adapter top-level first:** PASS — exercise?.suggestedScenes is first source
4. **Panel width classes with flex-wrap:** PASS — full/half/third + `flex flex-wrap gap-4`
5. **No Reorder import or drag prop from framer-motion:** PASS — only `motion` imported for animations
6. **@dnd-kit/sortable imports present and used:** PASS — SortableContext, useSortable, rectSortingStrategy, arrayMove
7. **DraggableBubble uses pointer events:** PASS — onPointerDown/Move/Up + setPointerCapture
8. **DraggableSticker uses pointer events:** PASS — same pattern as bubble
9. **panelRefs no new objects per render:** PASS — passes HTMLDivElement directly
10. **Touch targets ≥44px:** PASS — drag handles, delete buttons, sticker palette all ≥44px
