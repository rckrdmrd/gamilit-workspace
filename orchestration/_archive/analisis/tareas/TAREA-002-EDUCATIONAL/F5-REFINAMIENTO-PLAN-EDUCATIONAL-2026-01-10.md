# F5: REFINAMIENTO DE PLAN - TAREA-002 EDUCATIONAL_CONTENT

## Metadata

| Campo | Valor |
|-------|-------|
| **Tarea** | TAREA-002 |
| **Fase** | F5 - Refinamiento |
| **Fecha** | 2026-01-10 |
| **Estado** | COMPLETADO |
| **Basado en** | F3 + F4 |

---

## 1. HALLAZGOS ACTUALIZADOS

### 1.1 Problema de Duplicacion de Tipos

Se identifico que existen **DOS archivos de tipos** en Frontend que definen `ExerciseType`:

| Archivo | ExerciseType Count | Estado |
|---------|-------------------|--------|
| `contentAPI.ts:38-75` | 31 tipos | Completo |
| `exercise.types.ts:29-35` | 6 tipos | Desactualizado |

**Problema:** Componentes que importan de `exercise.types.ts` solo ven 6 tipos.

### 1.2 Estado Real de Inconsistencias

| Issue | Estado Pre-F5 | Estado Real |
|-------|---------------|-------------|
| P0-001 (ExerciseType 6 vs 27) | Pendiente | **Parcial** - contentAPI.ts ya tiene 31 tipos |
| P0-002 (Time minutes vs seconds) | Pendiente | Confirmado - Backend usa minutos |
| P0-003 (Hints string[] vs object[]) | Pendiente | Confirmado - Necesita transformacion |
| P0-004 (Content type generico) | Pendiente | Confirmado - Usar discriminated union |

---

## 2. PLAN REFINADO

### 2.1 Estrategia: Consolidacion de Tipos

En lugar de duplicar tipos, se propone:

1. **Mantener `contentAPI.ts`** como fuente de verdad para tipos de API
2. **Actualizar `exercise.types.ts`** para reutilizar tipos de contentAPI
3. **Agregar transformaciones** en contentAPI para alinear con frontend

### 2.2 Acciones Refinadas

#### FASE 1: P0 - Criticos (Este Sprint)

| ID | Accion Refinada | Archivo | Commit |
|----|-----------------|---------|--------|
| **P0-001** | Actualizar ExerciseType en exercise.types.ts (importar de contentAPI o copiar 31 tipos) | exercise.types.ts | COMMIT-01 |
| **P0-002** | Agregar transformTimeToSeconds() en contentAPI.ts | contentAPI.ts | COMMIT-02 |
| **P0-003** | Agregar transformHints() en contentAPI.ts | contentAPI.ts | COMMIT-02 |
| **P0-004** | Crear contentTypes.ts con discriminated union por ExerciseType | contentTypes.ts (nuevo) | COMMIT-03 |

#### FASE 2: P1 - Agregar Campos (Este Sprint)

| ID | Campo | Tipo | Commit |
|----|-------|------|--------|
| P1-001 | module_id | string | COMMIT-04 |
| P1-002 | objective | string? | COMMIT-04 |
| P1-003 | how_to_solve | string? | COMMIT-04 |
| P1-004 | recommended_strategy | string? | COMMIT-04 |
| P1-005 | pedagogical_notes | string? | COMMIT-04 |
| P1-006 | comodines_allowed | ComodinType[] | COMMIT-04 |
| P1-007 | comodines_config | Record<string, unknown> | COMMIT-04 |
| P1-008 | bonus_multiplier | number | COMMIT-04 |
| P1-009 | max_points | number | COMMIT-04 |
| P1-010 | order_index | number | COMMIT-04 |
| P1-011 | config | Record<string, unknown> | COMMIT-04 |
| P1-012 | auto_gradable | boolean | COMMIT-04 |
| P1-013 | subtitle | string? | COMMIT-04 |

---

## 3. SECUENCIA DE COMMITS

```
COMMIT-01: fix(frontend): Actualizar ExerciseType enum a 31 tipos
  - exercise.types.ts: Expandir ExerciseType con todos los tipos

COMMIT-02: feat(frontend): Agregar transformaciones API para ejercicios
  - contentAPI.ts: transformTimeToSeconds()
  - contentAPI.ts: transformHints()

COMMIT-03: feat(frontend): Crear tipos de contenido discriminados
  - contentTypes.ts: Interfaces por tipo de ejercicio
  - Importar desde exercise.types.ts

COMMIT-04: feat(frontend): Agregar campos faltantes a Exercise interface
  - exercise.types.ts: module_id, campos pedagogicos, comodines, gamificacion
  - Alinear con ExerciseResponseDto del backend
```

---

## 4. CODIGO A IMPLEMENTAR

### 4.1 P0-001: ExerciseType Actualizado

**Archivo:** `exercise.types.ts`

```typescript
/**
 * Exercise types/mechanics (31 tipos - alineado con Backend)
 * @see ExerciseTypeEnum en backend
 */
export type ExerciseType =
  // Module 1 - Comprension Literal
  | 'crucigrama'
  | 'linea_tiempo'
  | 'sopa_letras'
  | 'mapa_conceptual'
  | 'emparejamiento'
  | 'verdadero_falso'
  | 'completar_espacios'
  // Module 2 - Comprension Inferencial
  | 'detective_textual'
  | 'construccion_hipotesis'
  | 'prediccion_narrativa'
  | 'puzzle_contexto'
  | 'rueda_inferencias'
  // Module 3 - Comprension Critica
  | 'tribunal_opiniones'
  | 'debate_digital'
  | 'analisis_fuentes'
  | 'podcast_argumentativo'
  | 'matriz_perspectivas'
  // Module 4 - Lectura Digital
  | 'verificador_fake_news'
  | 'infografia_interactiva'
  | 'quiz_tiktok'
  | 'navegacion_hipertextual'
  | 'analisis_memes'
  // Module 5 - Produccion Lectora
  | 'diario_multimedia'
  | 'comic_digital'
  | 'video_carta'
  // Auxiliares
  | 'comprension_auditiva'
  | 'collage_prensa'
  | 'texto_movimiento'
  | 'call_to_action'
  | 'diario_interactivo'
  | 'resumen_visual'
  // Genericos (legacy)
  | 'multiple_choice'
  | 'true_false'
  | 'fill_blank'
  | 'drag_drop'
  | 'ordering'
  | 'matching';
```

### 4.2 P0-002 + P0-003: Transformaciones API

**Archivo:** `contentAPI.ts`

```typescript
// ============================================================================
// TRANSFORM FUNCTIONS (P0-002, P0-003)
// ============================================================================

/**
 * Convierte time_limit de minutos (backend) a segundos (frontend)
 */
const transformTimeToSeconds = (minutes: number | undefined): number | undefined => {
  return minutes ? minutes * 60 : undefined;
};

/**
 * Transforma hints de string[] (backend) a ExerciseHint[] (frontend)
 */
const transformHints = (
  hints: string[] | undefined,
  hintCostMlCoins: number = 5
): ExerciseHint[] => {
  if (!hints || hints.length === 0) return [];

  return hints.map((text, index) => ({
    id: `hint-${index + 1}`,
    text,
    ml_coins_cost: hintCostMlCoins,
    order: index + 1,
  }));
};

/**
 * Transforma respuesta del backend a formato frontend
 */
const transformExerciseResponse = (
  response: BackendExerciseResponse
): Exercise => ({
  id: response.id,
  module_id: response.module_id,
  type: response.exercise_type,
  title: response.title,
  subtitle: response.subtitle,
  description: response.description,
  instructions: response.instructions ?? '',
  difficulty: response.difficulty_level,
  xp_reward: response.xp_reward,
  ml_coins_reward: response.ml_coins_reward,
  time_limit_seconds: transformTimeToSeconds(response.time_limit_minutes),
  max_attempts: response.max_attempts,
  hints: transformHints(response.hints, response.hint_cost_ml_coins),
  content: response.content,
  // Campos pedagogicos
  objective: response.objective,
  how_to_solve: response.how_to_solve,
  recommended_strategy: response.recommended_strategy,
  pedagogical_notes: response.pedagogical_notes,
  // Comodines
  comodines_allowed: response.comodines_allowed,
  comodines_config: response.comodines_config,
  // Gamificacion
  bonus_multiplier: response.bonus_multiplier,
  max_points: response.max_points,
  passing_score: response.passing_score,
  // Metadata
  order_index: response.order_index,
  config: response.config,
  auto_gradable: response.auto_gradable,
  is_active: response.is_active,
  is_optional: response.is_optional,
  is_bonus: response.is_bonus,
});
```

### 4.3 P1: Exercise Interface Actualizada

**Archivo:** `exercise.types.ts`

```typescript
/**
 * Tipo de comodin (power-up)
 */
export type ComodinType = 'pistas' | 'vision_lectora' | 'segunda_oportunidad';

/**
 * Base exercise interface (alineado con ExerciseResponseDto)
 */
export interface Exercise {
  id: string;
  module_id: string;
  type: ExerciseType;
  title: string;
  subtitle?: string;
  description?: string;
  instructions: string;
  difficulty: ExerciseDifficulty;
  xp_reward: number;
  ml_coins_reward: number;
  time_limit_seconds?: number;
  max_attempts?: number;
  hints: ExerciseHint[];
  content: ExerciseContent;

  // Campos pedagogicos (DB-125)
  objective?: string;
  how_to_solve?: string;
  recommended_strategy?: string;
  pedagogical_notes?: string;

  // Comodines
  comodines_allowed?: ComodinType[];
  comodines_config?: Record<string, unknown>;

  // Gamificacion
  bonus_multiplier?: number;
  max_points?: number;
  passing_score?: number;

  // Metadata
  order_index?: number;
  config?: Record<string, unknown>;
  auto_gradable?: boolean;
  is_active?: boolean;
  is_optional?: boolean;
  is_bonus?: boolean;
}
```

---

## 5. VALIDACION PRE-EJECUCION

### 5.1 Comandos de Verificacion

```bash
# Verificar tipos actuales
grep -n "ExerciseType" apps/frontend/src/features/exercises/types/exercise.types.ts

# Verificar imports en componentes
grep -rn "from.*exercise.types" apps/frontend/src/

# Verificar build antes de cambios
cd apps/frontend && npm run build

# Verificar tests
cd apps/frontend && npm test -- --passWithNoTests
```

### 5.2 Archivos Afectados

| Archivo | Cambio | Riesgo |
|---------|--------|--------|
| exercise.types.ts | Expandir ExerciseType + Exercise interface | BAJO (aditivo) |
| contentAPI.ts | Agregar funciones transform | BAJO (nuevas funciones) |
| contentTypes.ts (nuevo) | Crear archivo | NINGUNO |

---

## 6. CRITERIOS DE ACEPTACION

- [ ] ExerciseType tiene 31+ valores en exercise.types.ts
- [ ] transformTimeToSeconds() convierte minutos a segundos
- [ ] transformHints() genera ExerciseHint[] desde string[]
- [ ] Exercise interface incluye todos los campos P1
- [ ] `npm run build` sin errores
- [ ] No breaking changes en componentes existentes

---

## 7. DECISION FINAL

**PLAN REFINADO APROBADO PARA EJECUCION (F6)**

Cambios clave del refinamiento:
1. Consolidar tipos en lugar de duplicar
2. Agregar funciones de transformacion en vez de modificar backend
3. Mantener compatibilidad con componentes existentes (campos opcionales)
4. Agrupar P1 en un solo commit (13 campos)

---

## 8. PROXIMOS PASOS

1. **F6**: Ejecutar COMMIT-01 a COMMIT-04
2. **F7**: Validar builds y tests
3. **TAREA-003**: Iniciar analisis de gamification_system

---

**Documento generado por:** @PERFIL_ORQUESTADOR
**Fecha:** 2026-01-10
**Version:** 1.0.0
**Siguiente fase:** F6 - Ejecucion
