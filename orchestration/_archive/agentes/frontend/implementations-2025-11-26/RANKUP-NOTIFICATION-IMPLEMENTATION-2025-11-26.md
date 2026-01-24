# Implementación de Notificación de RankUp en Ejercicios

**Fecha**: 2025-11-26
**Versión**: 1.0
**Estado**: Implementado
**Autor**: Architecture-Analyst (Orquestación de Agentes)

---

## Resumen Ejecutivo

Se implementó la funcionalidad de notificación de promoción de rango (RankUp) cuando un estudiante completa ejercicios exitosamente. Anteriormente, aunque el backend procesaba correctamente las promociones de rango via triggers de base de datos, el frontend no mostraba ninguna celebración al usuario.

### Ejercicios Afectados
- **M1-E5**: Sopa de Letras
- **M2-E1**: Detective Textual
- **M2-E2**: Causa-Efecto
- **M2-E3**: Predicción Narrativa
- **M2-E4**: Puzzle Contexto
- **M2-E5**: Rueda de Inferencias

---

## Problema Original

### Síntomas
1. Usuario completaba ejercicios correctamente
2. XP y ML Coins se acumulaban en backend
3. Rango se actualizaba en base de datos (trigger funcionaba)
4. Frontend NO mostraba notificación de subida de rango
5. Usuario no sabía que había sido promovido

### Causa Raíz
1. `ExerciseSubmissionResponseDto` no exponía campos de gamificación (`xp_earned`, `ml_coins_earned`, `rankUp`)
2. `claimRewards()` no detectaba si había ocurrido una promoción de rango
3. Componentes de ejercicio no integraban `RankUpModal`

---

## Arquitectura de la Solución

### Diagrama de Flujo

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           FLUJO IMPLEMENTADO                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  FRONTEND                    BACKEND                      DATABASE              │
│  ─────────                   ───────                      ────────              │
│                                                                                 │
│  submitExercise() ────────► POST /progress/              claimRewards()        │
│       │                     submissions/submit                │                 │
│       │                          │                           │                 │
│       │                    [1] Guarda previousRank           │                 │
│       │                          │                           │                 │
│       │                    [2] addXp() ──────────────► TRIGGER FIRES           │
│       │                          │                    check_rank_promotion()   │
│       │                          │                    promote_to_next_rank()   │
│       │                          │                           │                 │
│       │                    [3] Consulta newRank              │                 │
│       │                          │                           │                 │
│       │                    [4] Compara rangos                │                 │
│       │                    previousRank vs newRank           │                 │
│       │                          │                           │                 │
│       │                    [5] Construye rankUp              │                 │
│       │                    si son diferentes                 │                 │
│       │                          │                           │                 │
│       │                   DTO Serialization                                     │
│       │                   ✅ CAMPOS INCLUIDOS:                                  │
│       │                   - xp_earned                                          │
│       │                   - ml_coins_earned                                    │
│       │                   - rankUp { newRank, previousRank, bonus, multiplier }│
│       │                          │                                              │
│       ◄──────────────────────────┤                                              │
│  Recibe response                                                                │
│       │                                                                         │
│       ▼                                                                         │
│  [6] FeedbackModal                                                             │
│  (muestra score)                                                               │
│       │                                                                         │
│       ▼ [7] Si rankUp presente                                                 │
│  RankUpModal                                                                   │
│  (celebración 8s)                                                              │
│       │                                                                         │
│       ▼                                                                         │
│  [8] onComplete()                                                              │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Objetos Nuevos y Modificados

### 1. ExerciseSubmissionResponseDto (Backend)

**Archivo**: `apps/backend/src/modules/progress/dto/exercise-submission-response.dto.ts`

**Campos Agregados**:

```typescript
// =====================================================
// GAMIFICATION REWARDS
// =====================================================

/**
 * XP ganada en esta sumisión
 */
@Expose()
xp_earned?: number;

/**
 * ML Coins ganadas en esta sumisión
 */
@Expose()
ml_coins_earned?: number;

/**
 * Información de ascenso de rango (si aplica)
 * Null si no hubo promoción de rango
 */
@Expose()
rankUp?: {
  newRank: string;
  previousRank?: string;
  bonusMLCoins: number;
  newMultiplier: number;
} | null;
```

**Uso**:
- Estos campos se serializan automáticamente via `class-transformer` al enviar respuesta HTTP
- `xp_earned` y `ml_coins_earned` siempre presentes (default 0)
- `rankUp` es `null` cuando no hay promoción, objeto cuando sí hay

---

### 2. ExerciseSubmission Entity (Backend)

**Archivo**: `apps/backend/src/modules/progress/entities/exercise-submission.entity.ts`

**Columnas Agregadas**:

```typescript
// =====================================================
// GAMIFICATION REWARDS
// =====================================================

/**
 * XP ganada por completar este ejercicio correctamente
 * Se calcula y persiste al momento de claimRewards()
 */
@Column({ type: 'integer', default: 0 })
xp_earned!: number;

/**
 * ML Coins ganadas por completar este ejercicio
 * Se calcula y persiste al momento de claimRewards()
 */
@Column({ type: 'integer', default: 0 })
ml_coins_earned!: number;
```

**Beneficios**:
- Datos persistentes (se pueden recuperar históricamente)
- Entity y DTO alineados
- Permite analytics de rewards por ejercicio

---

### 3. DDL exercise_submissions (Database)

**Archivo**: `apps/database/ddl/schemas/progress_tracking/tables/04-exercise_submissions.sql`

**SQL Agregado**:

```sql
-- Nuevas columnas
xp_earned integer DEFAULT 0,
ml_coins_earned integer DEFAULT 0,

-- Nuevos comentarios
COMMENT ON COLUMN progress_tracking.exercise_submissions.xp_earned
  IS 'XP earned for completing this exercise correctly';

COMMENT ON COLUMN progress_tracking.exercise_submissions.ml_coins_earned
  IS 'ML Coins earned for completing this exercise';
```

**Migración Manual** (si base de datos ya existe):
```sql
ALTER TABLE progress_tracking.exercise_submissions
  ADD COLUMN xp_earned INTEGER DEFAULT 0,
  ADD COLUMN ml_coins_earned INTEGER DEFAULT 0;
```

---

### 4. Método claimRewards() (Backend Service)

**Archivo**: `apps/backend/src/modules/progress/services/exercise-submission.service.ts`

**Tipo de Retorno Actualizado**:

```typescript
async claimRewards(id: string): Promise<{
  submission: ExerciseSubmission;
  xp_earned: number;
  ml_coins_earned: number;
  rankUp: {
    newRank: string;
    previousRank: string;
    bonusMLCoins: number;
    newMultiplier: number;
  } | null;
}>
```

**Lógica de Detección de RankUp**:

```typescript
// 1. Guardar rango ANTES de addXp()
const userStatsBefore = await this.userStatsService.findByUserId(submission.user_id);
const previousRank = userStatsBefore.current_rank;

// 2. Ejecutar addXp() (trigger de BD hace promoción si corresponde)
await this.userStatsService.addXp(submission.user_id, xpEarned);

// 3. Consultar rango DESPUÉS
const userStatsAfter = await this.userStatsService.findByUserId(submission.user_id);
const newRank = userStatsAfter.current_rank;

// 4. Comparar y construir objeto si hubo cambio
let rankUpData = null;
if (previousRank !== newRank) {
  rankUpData = {
    newRank: newRank,
    previousRank: previousRank,
    bonusMLCoins: rankBonuses[newRank] || 0,
    newMultiplier: rankMultipliers[newRank] || 1.0,
  };
}
```

**Configuración de Rangos Maya** (hardcoded basado en especificación):

| Rango | XP Requerido | Bonus ML Coins | Multiplicador |
|-------|-------------|----------------|---------------|
| Ajaw | 0-499 | 0 | 1.00 |
| Nacom | 500-999 | 100 | 1.10 |
| Ah K'in | 1,000-1,499 | 250 | 1.15 |
| Halach Uinic | 1,500-1,899 | 500 | 1.20 |
| K'uk'ulkan | 1,900+ | 1,000 | 1.25 |

---

### 5. Hook useRankUpNotification (Frontend)

**Archivo**: `apps/frontend/src/features/gamification/ranks/hooks/useRankUpNotification.ts`

**Propósito**: Manejar la cascada de modales (FeedbackModal → RankUpModal) de forma reutilizable.

**Interface**:

```typescript
interface UseRankUpNotificationReturn {
  // State
  showFeedbackModal: boolean;
  showRankUpModal: boolean;
  feedback: FeedbackData | null;
  rankUpData: SubmitExerciseResponse['rankUp'] | null;

  // Actions
  processSubmitResponse: (response: SubmitExerciseResponse) => FeedbackData;
  handleFeedbackClose: () => void;
  handleRankUpClose: () => void;
  reset: () => void;
}

export function useRankUpNotification(onComplete?: () => void): UseRankUpNotificationReturn;
```

**Comportamiento**:
1. `processSubmitResponse()` - Procesa respuesta del ejercicio, extrae feedback y rankUp
2. `handleFeedbackClose()` - Al cerrar FeedbackModal, muestra RankUpModal si existe (con delay 300ms)
3. `handleRankUpClose()` - Al cerrar RankUpModal, llama a `onComplete()`
4. `reset()` - Limpia todos los estados

---

### 6. RankUpModal (Frontend Component)

**Archivo**: `apps/frontend/src/features/gamification/ranks/components/RankUpModal.tsx`

**Props**:

```typescript
interface RankUpModalProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Características**:
- Auto-cierre después de 8 segundos
- 50 partículas de confetti
- Muestra progresión visual (rango anterior → nuevo)
- Detalla beneficios desbloqueados
- Usa hooks internos (`useRank`, `useProgression`) para obtener datos

---

### 7. Integración en Componentes de Ejercicio

**Archivos Modificados**:
- `SopaLetrasExercise.tsx`
- `DetectiveTextualExercise.tsx`
- `CausaEfectoExercise.tsx`
- `PrediccionNarrativaExercise.tsx`
- `PuzzleContextoExercise.tsx`
- `RuedaInferenciasExercise.tsx`

**Patrón de Integración** (ejemplo SopaLetras):

```typescript
// 1. Import
import { RankUpModal } from '@/features/gamification/ranks/components/RankUpModal';

// 2. Estados
const [showRankUpModal, setShowRankUpModal] = useState(false);
const [rankUpData, setRankUpData] = useState<{...} | null>(null);

// 3. En handleCheck, guardar rankUp
const response = await submitExercise(...);
if (response.rankUp) {
  setRankUpData(response.rankUp);
}

// 4. Modificar onClose de FeedbackModal
onClose={() => {
  setShowFeedback(false);
  if (rankUpData) {
    setTimeout(() => setShowRankUpModal(true), 300);
  } else if (feedback?.type === 'success') {
    onComplete?.();
  }
}}

// 5. Agregar RankUpModal al JSX
{showRankUpModal && rankUpData && (
  <RankUpModal
    isOpen={showRankUpModal}
    onClose={() => {
      setShowRankUpModal(false);
      setRankUpData(null);
      if (feedback?.type === 'success') {
        onComplete?.();
      }
    }}
  />
)}
```

---

## Testing

### Casos de Prueba Recomendados

| Caso | Precondición | Acción | Resultado Esperado |
|------|-------------|--------|-------------------|
| Sin promoción | Usuario con 300 XP (Ajaw) | Completar ejercicio (100 XP) | FeedbackModal → onComplete (sin RankUpModal) |
| Con promoción | Usuario con 450 XP (Ajaw) | Completar ejercicio (100 XP) | FeedbackModal → RankUpModal → onComplete |
| Rango máximo | Usuario K'uk'ulkan | Completar ejercicio | FeedbackModal → onComplete (sin RankUpModal) |
| XP exacto al umbral | Usuario con 400 XP | Completar ejercicio (100 XP = 500) | FeedbackModal → RankUpModal a Nacom |

### Verificación Manual

1. Crear usuario de prueba con ~450 XP total
2. Completar cualquier ejercicio de M1-E5 o M2-E1 a E5
3. Verificar que aparece:
   - Primero: FeedbackModal con score
   - Después (300ms): RankUpModal con celebración
4. Cerrar RankUpModal y verificar que se ejecuta `onComplete()`

---

## Dependencias

### Backend
- `class-transformer` - Para serialización con @Expose()
- `typeorm` - Para @Column en entity

### Frontend
- `react` - useState, useCallback
- `RankUpModal` component existente
- `FeedbackModal` component existente
- Stores: `useRanksStore`, `useEconomyStore`

---

## Consideraciones de Migración

### Base de Datos Existente

Si la base de datos ya tiene registros en `exercise_submissions`:

```sql
-- Agregar columnas a tabla existente
ALTER TABLE progress_tracking.exercise_submissions
  ADD COLUMN IF NOT EXISTS xp_earned INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ml_coins_earned INTEGER DEFAULT 0;

-- Agregar comentarios
COMMENT ON COLUMN progress_tracking.exercise_submissions.xp_earned
  IS 'XP earned for completing this exercise correctly';
COMMENT ON COLUMN progress_tracking.exercise_submissions.ml_coins_earned
  IS 'ML Coins earned for completing this exercise';
```

### Recreación Completa

```bash
cd apps/database
./drop-and-recreate-database.sh
```

---

## Referencias

- **Especificación de Rangos Maya**: `docs/00-vision-general/ESPECIFICACION-TECNICA-RANGOS-MAYA-v2.1.md`
- **Seed de Rangos**: `apps/database/seeds/dev/gamification_system/03-maya_ranks.sql`
- **Trigger de Promoción**: `apps/database/ddl/schemas/gamification_system/triggers/trg_check_rank_promotion_on_xp_gain.sql`
- **Función de Promoción**: `apps/database/ddl/schemas/gamification_system/functions/promote_to_next_rank.sql`

---

## Changelog

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2025-11-26 | Implementación inicial de notificación de RankUp |
