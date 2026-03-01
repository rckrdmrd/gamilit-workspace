---
titulo: Integracion Tienda — Rank Card Cosmeticos + Consumibles en Ejercicios
tipo: reporte
fecha: "2026-02-28"
estado: completado
---

# Integracion Tienda — Rank Card Cosmeticos + Consumibles en Ejercicios

**Fecha:** 2026-02-28
**Estado:** Completado
**Subagentes:** ~14 (4 Sonnet + 10 Haiku)
**Archivos Modificados:** 18

---

## Resumen

Dos gaps de integracion resueltos:

1. **RankProgressWidget** (dashboard estudiante) ahora muestra frame border y badge equipado de la tienda
2. **Consumibles/comodines** en ejercicios: efectos visuales funcionales (hints, vision lectora, segunda oportunidad) + payload de submission actualizado

## Fases Ejecutadas

### Fase 1: Analisis (3 Haiku paralelos)
- Confirmado: GamifiedHeader usa useEquippedVisuals (avatar + frame)
- Confirmado: 7 mecanicas no aceptaban comodinesContext
- Confirmado: ExerciseGuide no tenia forceExpanded prop
- Confirmado: handleSubmit solo enviaba powerUps legacy

### Fase 2: Rank Card Cosmeticos (1 Sonnet)
- `RankProgressWidget.tsx`: Integrado `useEquippedVisuals` hook
- Frame: borderColor override con inline style (3px border)
- Badge: imagen con fallback a nombre tag

### Fase 3: Consumibles en Ejercicios (3 Sonnet paralelos)

#### 3.1 ExerciseContext handleSubmit
- Agregado `getUsedComodinTypes()` merge en `powerupsUsed[]`

#### 3.2 ExerciseLayout efectos visuales
- `ExerciseGuide`: nuevo prop `forceExpanded` con useEffect one-way ratchet
- `ExerciseLayout`: `forceExpanded={comodinesContext.hintsRevealed > 0}`
- `ExerciseLayout`: clase CSS `vision-lectora-active` cuando visionActive
- `ExerciseLayout`: banner amber "Segunda Oportunidad activa" cuando hasSecondChance
- `index.css`: estilos `.vision-lectora-active` (amber underline highlight + hover expansion)

#### 3.3 Mecanicas M1-M2 (7 archivos)
- Todas reciben `comodinesContext?: ExerciseComodinesContext` prop
- Todas implementan logica segunda oportunidad:
  - Si `score < 70 && hasSecondChance && !secondChanceUsed`
  - Intercepta feedback error → muestra feedback info
  - Desbloquea UI → permite reintento
- Mecanicas: Crucigrama, VerdaderoFalso, CompletarEspacios, SopaLetras, Timeline, DetectiveTextual, PuzzleContexto

### Fase 4: Validacion (2 Sonnet paralelos)
- TypeScript: 0 errores
- Build: exitoso (20.7s)
- Lint: 0 errores, 98 warnings (baja de 104)

### Fase 5: Documentacion (3 Haiku paralelos)
- MASTER_INVENTORY: v14.8.0 → v14.8.1
- FRONTEND_INVENTORY: v12.5.0 → v12.5.1

## Archivos Modificados

| # | Archivo | Cambio |
|---|---------|--------|
| 1 | `apps/frontend/src/apps/student/components/dashboard/RankProgressWidget.tsx` | useEquippedVisuals, frame border, badge display |
| 2 | `apps/frontend/src/features/exercises/context/ExerciseContext.tsx` | handleSubmit comodines merge |
| 3 | `apps/frontend/src/features/exercises/components/ExerciseLayout.tsx` | forceExpanded, vision-lectora, segunda oportunidad banner |
| 4 | `apps/frontend/src/features/exercises/components/ExerciseGuide.tsx` | forceExpanded prop + useEffect |
| 5 | `apps/frontend/src/shared/styles/index.css` | .vision-lectora-active CSS |
| 6 | `features/mechanics/module1/Crucigrama/CrucigramaExercise.tsx` | comodinesContext + segunda oportunidad |
| 7 | `features/mechanics/module1/VerdaderoFalso/VerdaderoFalsoExercise.tsx` | comodinesContext + segunda oportunidad |
| 8 | `features/mechanics/module1/VerdaderoFalso/verdaderoFalsoTypes.ts` | comodinesContext prop |
| 9 | `features/mechanics/module1/CompletarEspacios/CompletarEspaciosExercise.tsx` | comodinesContext + segunda oportunidad |
| 10 | `features/mechanics/module1/SopaLetras/SopaLetrasExercise.tsx` | comodinesContext + segunda oportunidad |
| 11 | `features/mechanics/module1/Timeline/TimelineExercise.tsx` | comodinesContext + segunda oportunidad |
| 12 | `features/mechanics/module1/Timeline/timelineTypes.ts` | comodinesContext prop |
| 13 | `features/mechanics/module2/DetectiveTextual/DetectiveTextualExercise.tsx` | comodinesContext + segunda oportunidad |
| 14 | `features/mechanics/module2/DetectiveTextual/detectiveTextualTypes.ts` | comodinesContext prop |
| 15 | `features/mechanics/module2/PuzzleContexto/PuzzleContextoExercise.tsx` | comodinesContext + segunda oportunidad |
| 16 | `features/mechanics/module2/PuzzleContexto/puzzleContextoTypes.ts` | comodinesContext prop |
| 17 | `orchestration/inventarios/MASTER_INVENTORY.yml` | v14.8.1 |
| 18 | `orchestration/inventarios/FRONTEND_INVENTORY.yml` | v12.5.1 |

## Gaps Identificados (Auditoria Post-Implementacion)

| # | Gap | Severidad | Estado |
|---|-----|-----------|--------|
| 1 | Vision lectora CSS (blanket highlight) vs ET-GAM-002 (highlightedSentences[] indices) | Media | Documentado |
| 2 | Export const arrow functions vs export function (pre-existente, no introducido) | Baja | Pre-existente |
| 3 | Dual exports sin justificacion comments (pre-existente) | Baja | Pre-existente |
| 4 | forceExpanded one-way ratchet sin comment explicativo | Baja | Pendiente |

## Inventarios Actualizados

- MASTER_INVENTORY: v14.8.1
- FRONTEND_INVENTORY: v12.5.1
