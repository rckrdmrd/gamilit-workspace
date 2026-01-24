# F3: PLAN DE CORRECCION - TAREA-002 EDUCATIONAL_CONTENT

## Metadata

| Campo | Valor |
|-------|-------|
| **Tarea** | TAREA-002 |
| **Fase** | F3 - Planeacion |
| **Fecha** | 2026-01-10 |
| **Estado** | COMPLETADO |
| **Basado en** | F2-ANALISIS-DETALLADO-EDUCATIONAL-2026-01-10.md |

---

## 1. OBJETIVO

Disenar plan de accion para resolver las inconsistencias identificadas en F2, priorizadas por impacto y riesgo.

---

## 2. RESUMEN DE ACCIONES

| Prioridad | Cantidad | Tiempo Est. | Riesgo |
|-----------|----------|-------------|--------|
| **P0 (Critico)** | 4 | Sprint actual | ALTO |
| **P1 (Alto)** | 8 | Sprint actual | MEDIO |
| **P2 (Medio)** | 6 | Siguiente sprint | BAJO |
| **P3 (Bajo)** | 5 | Backlog | MINIMO |

---

## 3. PLAN DETALLADO POR PRIORIDAD

### 3.1 PRIORIDAD P0 - CRITICO (Ejecutar Inmediatamente)

#### ACCION P0-001: Actualizar ExerciseType Enum en Frontend

| Campo | Valor |
|-------|-------|
| **ID** | P0-001 |
| **Issue** | ExerciseType enum incompleto (6 vs 27 tipos) |
| **Archivo** | `apps/frontend/src/features/exercises/types/exerciseTypes.ts` |
| **Cambio** | Agregar 24 tipos faltantes al enum |
| **Impacto** | Frontend puede renderizar todos los ejercicios |
| **Dependencias** | Ninguna |
| **Agente** | @PERFIL_FRONTEND |

**Codigo a agregar:**
```typescript
export type ExerciseType =
  // Existentes
  | 'multiple_choice'
  | 'true_false'
  | 'fill_blank'
  | 'drag_drop'
  | 'ordering'
  | 'matching'
  // Modulo 1: Comprension Literal
  | 'crucigrama'
  | 'sopa_letras'
  | 'emparejamiento'
  | 'linea_tiempo'
  | 'mapa_conceptual'
  | 'verdadero_falso'
  | 'completar_espacios'
  // Modulo 2: Comprension Inferencial
  | 'detective_textual'
  | 'construccion_hipotesis'
  | 'prediccion_narrativa'
  | 'puzzle_contexto'
  | 'rueda_inferencias'
  // Modulo 3: Comprension Critica
  | 'tribunal_opiniones'
  | 'debate_digital'
  | 'analisis_fuentes'
  | 'podcast_argumentativo'
  | 'matriz_perspectivas'
  // Modulo 4: Lectura Digital
  | 'verificador_fake_news'
  | 'infografia_interactiva'
  | 'quiz_tiktok'
  | 'navegacion_hipertextual'
  | 'analisis_memes'
  // Modulo 5: Produccion Lectora
  | 'diario_multimedia'
  | 'comic_digital'
  | 'video_carta'
  // Auxiliares
  | 'comprension_auditiva'
  | 'collage_prensa'
  | 'texto_movimiento'
  | 'call_to_action';
```

---

#### ACCION P0-002: Fix Time Unit Conversion

| Campo | Valor |
|-------|-------|
| **ID** | P0-002 |
| **Issue** | Backend usa minutos, Frontend usa segundos |
| **Archivo** | `apps/frontend/src/features/content/api/contentAPI.ts` |
| **Cambio** | Convertir time_limit_minutes * 60 al recibir |
| **Impacto** | Timers funcionan correctamente |
| **Dependencias** | Ninguna |
| **Agente** | @PERFIL_FRONTEND |

**Codigo a agregar:**
```typescript
// En getExercise response transformation
const transformExercise = (exercise: BackendExercise): Exercise => ({
  ...exercise,
  time_limit_seconds: exercise.time_limit_minutes
    ? exercise.time_limit_minutes * 60
    : undefined,
});
```

---

#### ACCION P0-003: Transformar Hints Structure

| Campo | Valor |
|-------|-------|
| **ID** | P0-003 |
| **Issue** | Backend: string[], Frontend: ExerciseHint[] |
| **Archivo** | `apps/frontend/src/features/content/api/contentAPI.ts` |
| **Cambio** | Transformar array de strings a objetos ExerciseHint |
| **Impacto** | Sistema de hints funciona correctamente |
| **Dependencias** | Ninguna |
| **Agente** | @PERFIL_FRONTEND |

**Codigo a agregar:**
```typescript
// Transformar hints de backend a frontend
const transformHints = (
  hints: string[] | undefined,
  globalCost: number
): ExerciseHint[] => {
  if (!hints || hints.length === 0) return [];

  return hints.map((text, index) => ({
    id: `hint-${index + 1}`,
    text,
    ml_coins_cost: globalCost, // Costo global aplicado a cada hint
    order: index + 1,
  }));
};
```

---

#### ACCION P0-004: Crear Content Interfaces por Tipo

| Campo | Valor |
|-------|-------|
| **ID** | P0-004 |
| **Issue** | Frontend asume structure multiple_choice para todos |
| **Archivo** | `apps/frontend/src/features/exercises/types/contentTypes.ts` (NUEVO) |
| **Cambio** | Crear interfaces discriminadas por exercise_type |
| **Impacto** | Type safety para 27 tipos de ejercicios |
| **Dependencias** | P0-001 |
| **Agente** | @PERFIL_FRONTEND |

**Codigo a crear:**
```typescript
// Discriminated union por tipo de ejercicio
export type ExerciseContent =
  | MultipleChoiceContent
  | CrucigramaContent
  | SopaLetrasContent
  | TimelineContent
  | MapaConceptualContent
  | DetectiveTextualContent
  // ... (27 tipos)
  | GenericContent;

export interface MultipleChoiceContent {
  type: 'multiple_choice';
  question: string;
  options: { id: string; text: string; }[];
  explanation?: string;
}

export interface CrucigramaContent {
  type: 'crucigrama';
  grid: string[][];
  clues: { across: ClueItem[]; down: ClueItem[]; };
  word_bank?: string[];
}

export interface SopaLetrasContent {
  type: 'sopa_letras';
  grid: string[][];
  words_to_find: string[];
  theme?: string;
}

// ... interfaces para cada tipo
```

---

### 3.2 PRIORIDAD P1 - ALTO (Completar esta semana)

#### ACCION P1-001: Agregar module_id al tipo Exercise

| Campo | Valor |
|-------|-------|
| **ID** | P1-001 |
| **Issue** | Frontend no tiene module_id |
| **Archivo** | `apps/frontend/src/features/exercises/types/exerciseTypes.ts` |
| **Cambio** | Agregar `module_id: string` al interface Exercise |
| **Agente** | @PERFIL_FRONTEND |

---

#### ACCION P1-002: Agregar campos pedagogicos

| Campo | Valor |
|-------|-------|
| **ID** | P1-002 |
| **Issue** | Campos pedagogicos faltantes |
| **Archivo** | `apps/frontend/src/features/exercises/types/exerciseTypes.ts` |
| **Cambio** | Agregar objective, how_to_solve, recommended_strategy, pedagogical_notes |
| **Agente** | @PERFIL_FRONTEND |

**Campos a agregar:**
```typescript
interface Exercise {
  // ... campos existentes

  // Campos pedagogicos (DB-125)
  objective?: string;
  how_to_solve?: string;
  recommended_strategy?: string;
  pedagogical_notes?: string;
}
```

---

#### ACCION P1-003: Agregar campos comodines

| Campo | Valor |
|-------|-------|
| **ID** | P1-003 |
| **Issue** | Comodines no expuestos en Frontend |
| **Archivo** | `apps/frontend/src/features/exercises/types/exerciseTypes.ts` |
| **Cambio** | Agregar comodines_allowed, comodines_config |
| **Agente** | @PERFIL_FRONTEND |

**Campos a agregar:**
```typescript
type ComodinType = 'pistas' | 'vision_lectora' | 'segunda_oportunidad';

interface Exercise {
  // ... campos existentes

  comodines_allowed?: ComodinType[];
  comodines_config?: {
    pistas?: { max_uses: number; cost_per_use: number; };
    vision_lectora?: { duration_seconds: number; cost: number; };
    segunda_oportunidad?: { max_uses: number; cost_per_use: number; };
  };
}
```

---

#### ACCION P1-004: Agregar campos gamificacion

| Campo | Valor |
|-------|-------|
| **ID** | P1-004 |
| **Issue** | bonus_multiplier, max_points faltantes |
| **Archivo** | `apps/frontend/src/features/exercises/types/exerciseTypes.ts` |
| **Cambio** | Agregar bonus_multiplier, max_points, passing_score |
| **Agente** | @PERFIL_FRONTEND |

---

#### ACCION P1-005: Agregar order_index

| Campo | Valor |
|-------|-------|
| **ID** | P1-005 |
| **Archivo** | `apps/frontend/src/features/exercises/types/exerciseTypes.ts` |
| **Cambio** | Agregar order_index: number |

---

#### ACCION P1-006: Agregar config field

| Campo | Valor |
|-------|-------|
| **ID** | P1-006 |
| **Archivo** | `apps/frontend/src/features/exercises/types/exerciseTypes.ts` |
| **Cambio** | Agregar config: Record<string, unknown> |

---

#### ACCION P1-007: Agregar auto_gradable flag

| Campo | Valor |
|-------|-------|
| **ID** | P1-007 |
| **Archivo** | `apps/frontend/src/features/exercises/types/exerciseTypes.ts` |
| **Cambio** | Agregar auto_gradable: boolean |

---

#### ACCION P1-008: Agregar subtitle field

| Campo | Valor |
|-------|-------|
| **ID** | P1-008 |
| **Archivo** | `apps/frontend/src/features/exercises/types/exerciseTypes.ts` |
| **Cambio** | Agregar subtitle?: string |

---

### 3.3 PRIORIDAD P2 - MEDIO (Siguiente Sprint)

| ID | Accion | Archivo | Issue |
|----|--------|---------|-------|
| P2-001 | @Unique(['module_code']) | module.entity.ts | M-001 |
| P2-002 | @Min(0) xp_reward | create-module.dto.ts | M-002 |
| P2-003 | @Min(0) ml_coins_reward | create-module.dto.ts | M-003 |
| P2-004 | Agregar is_active, is_optional, is_bonus | exerciseTypes.ts | Status fields |
| P2-005 | Agregar version, version_notes | exerciseTypes.ts | Versioning |
| P2-006 | Agregar created_by, reviewed_by | exerciseTypes.ts | Audit fields |

---

### 3.4 PRIORIDAD P3 - BAJO (Backlog)

| ID | Accion | Archivo | Issue |
|----|--------|---------|-------|
| P3-001 | @ManyToOne para created_by | module.entity.ts | FK relation |
| P3-002 | @ManyToOne para reviewed_by | module.entity.ts | FK relation |
| P3-003 | @ManyToOne para approved_by | module.entity.ts | FK relation |
| P3-004 | Evaluar gamilit.now_mexico() | Entities | Timezone |
| P3-005 | Agregar adaptive_difficulty, prerequisites | exerciseTypes.ts | Advanced |

---

## 4. SECUENCIA DE EJECUCION

```
FASE 1: P0 (Criticos) - Orden de ejecucion
┌────────────────────────────────────────────────────────────┐
│  P0-001 (ExerciseType enum)                                │
│      ↓                                                     │
│  P0-004 (Content interfaces) ← Depende de P0-001          │
│      ↓                                                     │
│  P0-002 (Time unit) ── P0-003 (Hints structure)           │
│                        (paralelo)                          │
└────────────────────────────────────────────────────────────┘

FASE 2: P1 (Altos) - Paralelo
┌────────────────────────────────────────────────────────────┐
│  P1-001 a P1-008 (todos independientes, paralelo)         │
│  - module_id, pedagogicos, comodines, gamificacion        │
│  - order_index, config, auto_gradable, subtitle           │
└────────────────────────────────────────────────────────────┘

FASE 3: P2/P3 - Siguiente sprint
┌────────────────────────────────────────────────────────────┐
│  P2-001..P2-006 (Backend validations, Frontend fields)    │
│  P3-001..P3-005 (Backlog, sin urgencia)                   │
└────────────────────────────────────────────────────────────┘
```

---

## 5. RECURSOS REQUERIDOS

### 5.1 Agentes Asignados

| Agente | Acciones | Responsabilidad |
|--------|----------|-----------------|
| @PERFIL_FRONTEND | P0-001 a P0-004, P1-001 a P1-008 | Types, API transforms |
| @PERFIL_BACKEND | P2-001 a P2-003 | Entity/DTO validations |

### 5.2 Archivos a Modificar

| Archivo | Acciones |
|---------|----------|
| exerciseTypes.ts | P0-001, P1-001 a P1-008, P2-004 a P2-006 |
| contentTypes.ts (NUEVO) | P0-004 |
| contentAPI.ts | P0-002, P0-003 |
| module.entity.ts | P2-001, P3-001 a P3-003 |
| create-module.dto.ts | P2-002, P2-003 |

---

## 6. CRITERIOS DE ACEPTACION

### 6.1 Por Accion P0

| Accion | Criterio | Verificacion |
|--------|----------|--------------|
| P0-001 | 27 ExerciseType definidos | TypeScript compile |
| P0-002 | time_limit en segundos | Timer funciona correctamente |
| P0-003 | hints como ExerciseHint[] | HintModal renderiza |
| P0-004 | Content type-safe por ejercicio | No any/unknown en render |

### 6.2 Globales

- [ ] `npm run build` sin errores en frontend
- [ ] `npm run build` sin errores en backend
- [ ] Tests existentes pasan
- [ ] Ejercicios renderizan correctamente (visual check)

---

## 7. RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| Breaking change en Exercise type | MEDIA | ALTO | Agregar campos como opcionales |
| Components no manejan nuevos tipos | MEDIA | MEDIO | UnderConstructionExercise fallback |
| API response mismatch | BAJA | ALTO | Validar con backend antes |
| Regresion en ejercicios existentes | BAJA | MEDIO | Tests E2E |

---

## 8. ESTIMACION DE IMPACTO

### 8.1 Archivos Afectados

| Capa | Archivos | Impacto |
|------|----------|---------|
| Frontend Types | 2 (existente + nuevo) | MEDIO |
| Frontend API | 1 | BAJO |
| Backend Entity | 1 | BAJO |
| Backend DTOs | 1 | BAJO |

### 8.2 Tests Afectados

| Suite | Tests Impactados | Accion |
|-------|------------------|--------|
| exercises.spec.ts | 5-10 | Actualizar mocks |
| contentAPI.spec.ts | 3-5 | Agregar transform tests |
| ExercisePage.spec.tsx | 2-3 | Verificar render nuevos tipos |

---

## 9. PROXIMOS PASOS

1. **F4**: Validar este plan contra F2 (cobertura completa)
2. **F5**: Refinar basado en feedback
3. **F6**: Ejecutar acciones P0 y P1
4. **F7**: Validar ejecucion con tests

---

**Documento generado por:** ORQUESTADOR
**Fecha:** 2026-01-10
**Version:** 1.0.0
**Siguiente fase:** F4 - Validacion de Plan
