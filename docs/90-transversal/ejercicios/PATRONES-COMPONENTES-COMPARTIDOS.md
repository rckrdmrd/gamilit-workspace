# Guia de Patrones de Componentes Compartidos

**Version:** 1.0.0
**Fecha:** 2026-01-20
**Autor:** Sistema de Documentacion SIMCO
**Tarea:** SUBTASK-3.3 de TASK-2026-01-20-EXERCISES-VALIDATION
**Tipo:** Guia de Desarrollo Frontend

---

## Indice

1. [Vision General](#1-vision-general)
2. [Catalogo de Componentes](#2-catalogo-de-componentes)
3. [Catalogo de Hooks](#3-catalogo-de-hooks)
4. [Patrones de Integracion por Tipo de Ejercicio](#4-patrones-de-integracion-por-tipo-de-ejercicio)
5. [Checklist de Integracion](#5-checklist-de-integracion)
6. [Errores Comunes y Soluciones](#6-errores-comunes-y-soluciones)
7. [Referencias](#7-referencias)

---

## 1. Vision General

### 1.1 Arquitectura de Ejercicios

El sistema de ejercicios de GAMILIT sigue una arquitectura basada en componentes compartidos para garantizar consistencia en la experiencia del usuario y facilitar el mantenimiento del codigo.

```
+--------------------------------------------------+
|                    Ejercicio                      |
+--------------------------------------------------+
|                                                   |
|  +---------------------------------------------+  |
|  |          Componente de Mecanica             |  |
|  |  (VerdaderoFalso, Emparejamiento, etc.)     |  |
|  +---------------------------------------------+  |
|                       |                           |
|                       v                           |
|  +---------------------------------------------+  |
|  |       Componentes Compartidos               |  |
|  |  - SubmitExerciseButton                     |  |
|  |  - FeedbackModal                            |  |
|  |  - HintSystem / HintModal                   |  |
|  |  - CompletionModal                          |  |
|  +---------------------------------------------+  |
|                       |                           |
|                       v                           |
|  +---------------------------------------------+  |
|  |              Hooks Compartidos              |  |
|  |  - useExerciseSubmission (Simple/SECURE)   |  |
|  |  - useExerciseTimer                         |  |
|  |  - useExerciseRewards                       |  |
|  +---------------------------------------------+  |
|                       |                           |
|                       v                           |
|  +---------------------------------------------+  |
|  |                 Backend API                 |  |
|  |  POST /educational/exercises/:id/submit    |  |
|  +---------------------------------------------+  |
|                                                   |
+--------------------------------------------------+
```

### 1.2 Componentes Disponibles

| Componente | Ubicacion | Proposito | Estado de Uso |
|------------|-----------|-----------|---------------|
| `SubmitExerciseButton` | `shared/components/mechanics/` | Boton de envio estandarizado | Recomendado |
| `FeedbackModal` | `shared/components/mechanics/` | Modal de resultados | En uso (100%) |
| `HintSystem` | `shared/components/mechanics/` | Sistema de hints gratuito | En uso (10%) |
| `HintModal` | `apps/student/components/exercise/` | Sistema de hints premium (ML Coins) | Sin uso |
| `CompletionModal` | `apps/student/components/exercise/` | Modal de finalizacion avanzado | Sin uso |
| `ExerciseFeedback` | `features/exercises/components/` | Feedback inline (no modal) | Sin uso |

### 1.3 Hooks Disponibles

| Hook | Ubicacion | Proposito | Recomendado Para |
|------|-----------|-----------|------------------|
| `useExerciseSubmission` (Simple) | `features/exercises/hooks/` | Envio basico | M1-M3 |
| `useExerciseSubmission` (SECURE) | `features/mechanics/shared/hooks/` | Envio con validacion Zod y anti-cheat | M4-M5 |
| `useExerciseTimer` | `features/exercises/hooks/` | Control de tiempo | Todos |
| `useExerciseRewards` | `features/exercises/hooks/` | Gestion de ML Coins y hints | Con HintModal |

---

## 2. Catalogo de Componentes

### 2.1 SubmitExerciseButton

**Ubicacion:** `/apps/frontend/src/shared/components/mechanics/SubmitExerciseButton.tsx`

#### Descripcion
Componente reutilizable para el boton de envio de ejercicios. Estandariza el comportamiento y estados visuales en todos los ejercicios.

#### Cuando Usar
- En TODOS los ejercicios para el boton de envio principal
- Cuando se necesita consistencia visual en el flujo de submission
- Para ejercicios que requieren feedback visual durante el envio

#### Props

| Prop | Tipo | Default | Requerido | Descripcion |
|------|------|---------|-----------|-------------|
| `isSubmitting` | `boolean` | - | Si | Indica si se esta enviando |
| `isSubmitted` | `boolean` | - | Si | Indica si ya fue enviado |
| `onClick` | `() => void` | - | Si | Callback cuando se hace click |
| `disabled` | `boolean` | `false` | No | Si el boton esta deshabilitado |
| `label` | `string` | `'Enviar Respuestas'` | No | Texto del boton en estado normal |
| `loadingLabel` | `string` | `'Enviando...'` | No | Texto durante envio |
| `submittedLabel` | `string` | `'Enviado'` | No | Texto despues de enviar |
| `variant` | `'primary' \| 'gold' \| 'blue'` | `'primary'` | No | Variante visual |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | No | Tamano del boton |
| `fullWidth` | `boolean` | `false` | No | Ancho completo |
| `className` | `string` | `''` | No | Clase CSS adicional |

#### Estados Visuales

| Estado | Icono | Color | Condicion |
|--------|-------|-------|-----------|
| Default | `Send` | Segun variant | `!isSubmitting && !isSubmitted && !disabled` |
| Loading | `Loader2` (animado) | primary | `isSubmitting` |
| Submitted | `CheckCircle` | green | `isSubmitted` |
| Disabled | `Send` | gris | `disabled` |

#### Ejemplo de Integracion

```tsx
import { useState } from 'react';
import { SubmitExerciseButton } from '@shared/components/mechanics/SubmitExerciseButton';
import { useExerciseSubmission } from '@/features/exercises/hooks/useExerciseSubmission';

export const MiEjercicio = ({ exercise, onComplete }) => {
  const { submitExercise, isSubmitting, result } = useExerciseSubmission();
  const [answers, setAnswers] = useState({});

  const isValid = Object.keys(answers).length >= exercise.minAnswers;
  const isSubmitted = result !== null;

  const handleSubmit = async () => {
    await submitExercise({
      userId: user.id,
      exerciseId: exercise.id,
      answers,
    });
  };

  return (
    <div>
      {/* UI del ejercicio */}

      <SubmitExerciseButton
        isSubmitting={isSubmitting}
        isSubmitted={isSubmitted}
        onClick={handleSubmit}
        disabled={!isValid}
        label="Verificar Respuestas"
        variant="gold"
        fullWidth
      />
    </div>
  );
};
```

---

### 2.2 FeedbackModal

**Ubicacion:** `/apps/frontend/src/shared/components/mechanics/FeedbackModal.tsx`

#### Descripcion
Modal animado para mostrar el resultado del ejercicio con soporte para confetti, rewards, detalles por pregunta y estado de revision pendiente.

#### Cuando Usar
- Despues de CADA submission de ejercicio
- Para mostrar resultados (score, XP, ML Coins)
- Para ejercicios M3-M5 con `pendingReview: true`

#### Props

| Prop | Tipo | Default | Requerido | Descripcion |
|------|------|---------|-----------|-------------|
| `isOpen` | `boolean` | - | Si | Controla visibilidad del modal |
| `feedback` | `FeedbackData` | - | Si | Datos del feedback |
| `onClose` | `() => void` | - | Si | Callback al cerrar |
| `onRetry` | `() => void` | - | No | Callback para reintentar |
| `onNext` | `() => void` | - | No | Callback para siguiente ejercicio |

#### Interface FeedbackData

```typescript
interface FeedbackData {
  type: 'success' | 'error' | 'partial' | 'info';
  title: string;
  message: string;
  score?: number;              // Score 0-100
  xpEarned?: number;           // XP ganado
  mlCoinsEarned?: number;      // ML Coins ganados
  showConfetti?: boolean;      // Activar confetti en success
  pendingReview?: boolean;     // Para M3-M5: indica revision manual
  details?: Array<{            // Detalles por fragmento/pregunta
    score: number;
    maxScore: number;
    feedback: string;
    categoryUsed?: string;
    keywordsFound?: string[];
    keywordsExpected?: string[];
  }>;
}
```

#### Uso de `type`

| Tipo | Cuando Usar | Icono | Color |
|------|-------------|-------|-------|
| `success` | Score >= passing_score o ejercicio perfecto | CheckCircle2 | Verde |
| `partial` | Score >= 50% pero < passing_score | Info | Amarillo |
| `error` | Score < 50% o fallo | XCircle | Rojo |
| `info` | Informacion general, `pendingReview: true` | Info | Azul |

#### Ejemplo: Ejercicio Auto-evaluado (M1-M2)

```tsx
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';

const handleSubmitSuccess = (response) => {
  setFeedback({
    type: response.isPerfect ? 'success' : response.score >= 70 ? 'partial' : 'error',
    title: response.isPerfect ? 'Perfecto!' : 'Buen intento',
    message: response.feedback?.overall || `Score: ${response.score}%`,
    score: response.score,
    xpEarned: response.rewards?.xp,           // IMPORTANTE: Siempre pasar
    mlCoinsEarned: response.rewards?.mlCoins, // IMPORTANTE: Siempre pasar
    showConfetti: response.isPerfect,
  });
  setShowFeedback(true);
};

return (
  <FeedbackModal
    isOpen={showFeedback}
    feedback={feedback}
    onClose={() => {
      setShowFeedback(false);
      if (feedback.type === 'success') onComplete?.();
    }}
    onRetry={() => {
      setShowFeedback(false);
      resetExercise();
    }}
    onNext={onNextExercise}
  />
);
```

#### Ejemplo: Ejercicio con Revision Manual (M3-M5)

```tsx
// Para ejercicios que requieren revision del docente
const handleSubmitSuccess = (response) => {
  setFeedback({
    type: 'info',
    title: 'Trabajo Enviado',
    message: 'Tu trabajo ha sido enviado para revision.',
    pendingReview: true,  // Activa seccion especial
    // NO incluir xpEarned/mlCoinsEarned (se asignan tras revision)
  });
  setShowFeedback(true);
};
```

---

### 2.3 HintSystem

**Ubicacion:** `/apps/frontend/src/shared/components/mechanics/HintSystem.tsx`

#### Descripcion
Sistema simple de hints que revela pistas progresivamente sin costo de ML Coins.

#### Cuando Usar
- Para ejercicios donde las hints son gratuitas
- Cuando no se requiere integracion con el sistema de economia

#### Props

| Prop | Tipo | Default | Requerido | Descripcion |
|------|------|---------|-----------|-------------|
| `hints` | `string[]` | - | Si | Array de textos de hints |
| `maxHints` | `number` | `hints.length` | No | Maximo de hints a revelar |
| `onHintUsed` | `(index: number) => void` | - | No | Callback cuando se revela un hint |

#### Ejemplo de Integracion

```tsx
import { HintSystem } from '@shared/components/mechanics/HintSystem';

const ejercicioHints = [
  'Observa el patron en la primera oracion.',
  'Recuerda las reglas de concordancia.',
  'La respuesta esta relacionada con el contexto historico.',
];

return (
  <div>
    {/* UI del ejercicio */}

    <HintSystem
      hints={ejercicioHints}
      maxHints={3}
      onHintUsed={(index) => {
        console.log(`Hint ${index + 1} revelado`);
        // Opcional: trackear para penalizacion de XP
      }}
    />
  </div>
);
```

---

### 2.4 HintModal

**Ubicacion:** `/apps/frontend/src/apps/student/components/exercise/HintModal.tsx`

#### Descripcion
Modal avanzado para sistema de hints con costo en ML Coins. Soporta hints escalonados por nivel con precios diferentes.

#### Cuando Usar
- Para implementar sistema de hints premium
- Cuando los hints tienen costo en ML Coins
- Para incentivar la economia del juego

#### Props

| Prop | Tipo | Default | Requerido | Descripcion |
|------|------|---------|-----------|-------------|
| `isOpen` | `boolean` | - | Si | Controla visibilidad |
| `hints` | `Hint[]` | - | Si | Array de hints con nivel y costo |
| `currentHintLevel` | `number` | - | Si | Nivel de hint actual desbloqueado |
| `availableCoins` | `number` | - | Si | ML Coins disponibles del usuario |
| `onClose` | `() => void` | - | Si | Callback al cerrar |
| `onUseHint` | `(hint: Hint) => void` | - | Si | Callback al usar hint |

#### Interface Hint

```typescript
interface Hint {
  id: string;
  level: number;      // 1, 2, 3...
  text: string;
  cost: number;       // Costo en ML Coins (0 = gratis)
}
```

#### Ejemplo de Integracion con useExerciseRewards

```tsx
import { useState } from 'react';
import { HintModal } from '@/apps/student/components/exercise/HintModal';
import { useExerciseRewards } from '@/features/exercises/hooks/useExerciseRewards';

export const EjercicioConHintsPremium = ({ exercise, userCoins }) => {
  const [showHints, setShowHints] = useState(false);
  const [currentHintLevel, setCurrentHintLevel] = useState(0);

  const { mlCoinsBalance, unlockHint } = useExerciseRewards({
    initialMLCoins: userCoins,
  });

  const hints = [
    { id: 'h1', level: 1, text: 'Primera pista basica...', cost: 0 },
    { id: 'h2', level: 2, text: 'Segunda pista con mas detalle...', cost: 15 },
    { id: 'h3', level: 3, text: 'Tercera pista muy especifica...', cost: 30 },
  ];

  const handleUseHint = (hint) => {
    // Descontar ML Coins si tiene costo
    if (hint.cost > 0) {
      const success = unlockHint({
        id: hint.id,
        ml_coins_cost: hint.cost,
      });
      if (!success) {
        toast.error('No tienes suficientes ML Coins');
        return;
      }
    }
    setCurrentHintLevel(hint.level);
  };

  return (
    <>
      <button onClick={() => setShowHints(true)}>
        Ver Pistas ({mlCoinsBalance} ML Coins)
      </button>

      <HintModal
        isOpen={showHints}
        hints={hints}
        currentHintLevel={currentHintLevel}
        availableCoins={mlCoinsBalance}
        onClose={() => setShowHints(false)}
        onUseHint={handleUseHint}
      />
    </>
  );
};
```

---

### 2.5 CompletionModal

**Ubicacion:** `/apps/frontend/src/apps/student/components/exercise/CompletionModal.tsx`

#### Descripcion
Modal avanzado para celebrar la finalizacion de un ejercicio o modulo. Incluye animaciones de XP/ML Coins, achievements, rank-up y streaks.

#### Cuando Usar
- Al completar un modulo completo
- Cuando el estudiante desbloquea un achievement
- Para celebrar streaks o rank-ups
- Como alternativa mas elaborada a FeedbackModal

#### Props

| Prop | Tipo | Default | Requerido | Descripcion |
|------|------|---------|-----------|-------------|
| `isOpen` | `boolean` | - | Si | Controla visibilidad |
| `success` | `boolean` | - | Si | Si fue exitoso |
| `score` | `number` | - | Si | Puntaje obtenido |
| `maxScore` | `number` | - | Si | Puntaje maximo |
| `xpGained` | `number` | - | Si | XP ganado |
| `mlCoinsGained` | `number` | - | Si | ML Coins ganados |
| `timeSpent` | `number` | - | Si | Tiempo en segundos |
| `hintsUsed` | `number` | - | Si | Numero de hints usados |
| `moduleId` | `string` | - | Si | ID del modulo |
| `exerciseId` | `string` | `'unknown'` | No | ID del ejercicio |
| `onClose` | `() => void` | - | Si | Callback al cerrar |
| `onRetry` | `() => void` | - | Si | Callback para reintentar |
| `onNextExercise` | `() => void` | - | No | Callback siguiente ejercicio |
| `achievements` | `Achievement[]` | `[]` | No | Logros desbloqueados |
| `rankUp` | `RankUpInfo \| null` | - | No | Info de promocion de rango |
| `streakInfo` | `StreakInfo` | - | No | Info de racha |

#### Ejemplo de Integracion

```tsx
import { CompletionModal } from '@/apps/student/components/exercise/CompletionModal';

const [completionData, setCompletionData] = useState(null);

const handleExerciseComplete = (result) => {
  setCompletionData({
    success: result.isPerfect || result.score >= 70,
    score: result.score,
    maxScore: 100,
    xpGained: result.rewards.xp,
    mlCoinsGained: result.rewards.mlCoins,
    timeSpent: elapsedSeconds,
    hintsUsed: hintsCount,
    achievements: result.achievements || [],
    rankUp: result.rankUp,
  });
};

return (
  <CompletionModal
    isOpen={!!completionData}
    {...completionData}
    moduleId={module.id}
    exerciseId={exercise.id}
    onClose={() => setCompletionData(null)}
    onRetry={handleRetry}
    onNextExercise={handleNextExercise}
  />
);
```

---

## 3. Catalogo de Hooks

### 3.1 useExerciseSubmission (Simple)

**Ubicacion:** `/apps/frontend/src/features/exercises/hooks/useExerciseSubmission.ts`

#### Descripcion
Hook basico para enviar respuestas de ejercicios. Maneja estado de loading, errores y resultados.

#### Recomendado Para
- Ejercicios M1-M3 (auto-evaluados)
- Casos simples sin tracking avanzado

#### Interface

```typescript
interface UseExerciseSubmissionOptions {
  onSuccess?: (result: ExerciseSubmissionResult) => void;
  onError?: (error: Error) => void;
}

const {
  submitExercise,  // async (submission) => Promise<Result | null>
  isSubmitting,    // boolean
  error,           // Error | null
  result,          // ExerciseSubmissionResult | null
  reset,           // () => void
} = useExerciseSubmission(options);
```

#### Ejemplo Completo

```tsx
import { useExerciseSubmission } from '@/features/exercises/hooks/useExerciseSubmission';

export const EjercicioSimple = ({ exercise, user }) => {
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const { submitExercise, isSubmitting, result } = useExerciseSubmission({
    onSuccess: (response) => {
      setFeedback({
        type: response.is_correct ? 'success' : 'error',
        title: response.is_correct ? 'Correcto!' : 'Intenta de nuevo',
        message: response.feedback,
        score: response.score_percentage,
        xpEarned: response.xp_earned,
        mlCoinsEarned: response.ml_coins_earned,
        showConfetti: response.score_percentage === 100,
      });
      setShowFeedback(true);
    },
    onError: (error) => {
      toast.error('Error al enviar: ' + error.message);
    },
  });

  const handleSubmit = async () => {
    await submitExercise({
      userId: user.id,
      exerciseId: exercise.id,
      answers,
    });
  };

  return (
    <>
      {/* UI del ejercicio */}

      <SubmitExerciseButton
        isSubmitting={isSubmitting}
        isSubmitted={result !== null}
        onClick={handleSubmit}
        disabled={Object.keys(answers).length === 0}
      />

      {feedback && (
        <FeedbackModal
          isOpen={showFeedback}
          feedback={feedback}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </>
  );
};
```

---

### 3.2 useExerciseSubmission (SECURE)

**Ubicacion:** `/apps/frontend/src/features/mechanics/shared/hooks/useExerciseSubmission.ts`

#### Descripcion
Hook avanzado con validacion Zod, tracking anti-cheat, manejo de rate limiting e invalidacion automatica de cache.

#### Recomendado Para
- Ejercicios M4-M5 (evaluacion manual)
- Ejercicios que requieren tracking de hints/powerups
- Casos donde se necesita anti-cheat

#### Caracteristicas Adicionales

| Caracteristica | Simple | SECURE |
|----------------|--------|--------|
| Validacion Zod | No | Si |
| Session ID | No | Si |
| Tracking Hints | No | Si |
| Tracking Powerups | No | Si |
| Rate Limiting | No | Si |
| Cache Invalidation | Manual | Automatica |

#### Interface

```typescript
interface UseExerciseSubmissionOptions {
  onSuccess?: (result: SubmissionResult) => void;
  onError?: (error: any) => void;
  onRateLimitError?: (retryAfter: number) => void;
  trackHints?: boolean;
  trackPowerups?: boolean;
}

const {
  // Mutation state
  submit,              // (answers) => void
  submitAsync,         // async (answers) => Promise<Result>
  isSubmitting,        // boolean
  isSuccess,           // boolean
  isError,             // boolean
  error,               // Error | null
  data,                // SubmissionResult | null
  reset,               // () => void

  // Helper functions
  recordHintUsed,      // () => void
  recordPowerupUsed,   // (powerup) => void
  getTimeElapsed,      // () => number (seconds)
  resetTracking,       // () => void

  // Tracking data
  hintsUsed,           // number
  powerupsUsed,        // string[]
  sessionId,           // string (UUID)
  startTime,           // number (timestamp)
} = useExerciseSubmission(exerciseId, options);
```

#### Ejemplo Completo

```tsx
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';

export const EjercicioAvanzado = ({ exercise }) => {
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const {
    submit,
    isSubmitting,
    data: result,
    recordHintUsed,
    getTimeElapsed,
  } = useExerciseSubmission(exercise.id, {
    trackHints: true,
    trackPowerups: true,
    onSuccess: (result) => {
      setFeedback({
        type: result.requiresManualReview ? 'info' :
              result.isPerfect ? 'success' : 'partial',
        title: result.requiresManualReview ? 'Enviado' :
               result.isPerfect ? 'Excelente!' : 'Buen trabajo',
        message: result.feedback?.overall || 'Tu trabajo ha sido enviado.',
        score: result.score,
        xpEarned: result.rewards?.xp,
        mlCoinsEarned: result.rewards?.mlCoins,
        showConfetti: result.isPerfect,
        pendingReview: result.requiresManualReview,
      });
      setShowFeedback(true);
    },
    onError: (error) => {
      console.error('[Submission Error]', error);
    },
    onRateLimitError: (retryAfter) => {
      toast.error(`Espera ${retryAfter} segundos antes de reintentar.`);
    },
  });

  const handleHintClick = () => {
    recordHintUsed();
    // Mostrar hint...
  };

  const handleSubmit = () => {
    submit(answers);
  };

  return (
    <>
      {/* UI del ejercicio */}

      <button onClick={handleHintClick}>Usar Pista</button>

      <SubmitExerciseButton
        isSubmitting={isSubmitting}
        isSubmitted={result !== null}
        onClick={handleSubmit}
        label="Enviar para Revision"
        variant="blue"
      />

      {feedback && (
        <FeedbackModal
          isOpen={showFeedback}
          feedback={feedback}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </>
  );
};
```

---

### 3.3 useExerciseTimer

**Ubicacion:** `/apps/frontend/src/features/exercises/hooks/useExerciseTimer.ts`

#### Descripcion
Hook para manejar el temporizador del ejercicio con soporte para limite de tiempo opcional.

#### Interface

```typescript
interface UseExerciseTimerOptions {
  timeLimitSeconds?: number;
  onTimeExpired?: () => void;
  autoStart?: boolean;
}

const {
  elapsedSeconds,        // number
  remainingSeconds,      // number | null
  isRunning,             // boolean
  isTimeExpired,         // boolean
  start,                 // () => void
  pause,                 // () => void
  reset,                 // () => void
  stop,                  // () => number (returns elapsed)
  formatTime,            // (seconds) => string "MM:SS"
  formattedElapsed,      // string "MM:SS"
  formattedRemaining,    // string "MM:SS" | null
} = useExerciseTimer(options);
```

#### Ejemplo de Integracion

```tsx
import { useExerciseTimer } from '@/features/exercises/hooks/useExerciseTimer';

export const EjercicioConTiempo = ({ exercise, timeLimitMinutes }) => {
  const {
    formattedElapsed,
    formattedRemaining,
    isTimeExpired,
    start,
    stop,
  } = useExerciseTimer({
    timeLimitSeconds: timeLimitMinutes ? timeLimitMinutes * 60 : undefined,
    onTimeExpired: () => {
      toast.warning('Tiempo agotado!');
      handleAutoSubmit();
    },
    autoStart: true,
  });

  const handleSubmit = () => {
    const timeSpent = stop();
    // Usar timeSpent en el submission...
  };

  return (
    <div>
      <div className="timer">
        {timeLimitMinutes ? (
          <span>Tiempo restante: {formattedRemaining}</span>
        ) : (
          <span>Tiempo: {formattedElapsed}</span>
        )}
      </div>

      {isTimeExpired && (
        <div className="warning">El tiempo ha expirado</div>
      )}

      {/* UI del ejercicio */}
    </div>
  );
};
```

---

### 3.4 useExerciseRewards

**Ubicacion:** `/apps/frontend/src/features/exercises/hooks/useExerciseRewards.ts`

#### Descripcion
Hook para manejar la economia de ML Coins durante un ejercicio, incluyendo compra de hints.

#### Interface

```typescript
interface UseExerciseRewardsOptions {
  initialMLCoins: number;
  onMLCoinsChange?: (newBalance: number) => void;
}

const {
  mlCoinsBalance,        // number
  mlCoinsSpent,          // number
  unlockedHints,         // string[]
  canAffordHint,         // (hint) => boolean
  unlockHint,            // (hint) => boolean
  isHintUnlocked,        // (hintId) => boolean
  calculateXPEarned,     // (baseXP, isCorrect, hintsUsed) => number
  calculateMLCoinsEarned,// (baseCoins, isCorrect, hintsUsed) => number
  addMLCoins,            // (amount) => void
  reset,                 // () => void
} = useExerciseRewards(options);
```

#### Ejemplo de Integracion

```tsx
import { useExerciseRewards } from '@/features/exercises/hooks/useExerciseRewards';

export const EjercicioConEconomia = ({ exercise, userCoins }) => {
  const {
    mlCoinsBalance,
    unlockHint,
    calculateXPEarned,
    calculateMLCoinsEarned,
  } = useExerciseRewards({
    initialMLCoins: userCoins,
    onMLCoinsChange: (newBalance) => {
      // Sincronizar con backend si es necesario
    },
  });

  const handleUnlockHint = (hint) => {
    const success = unlockHint({
      id: hint.id,
      ml_coins_cost: hint.cost,
    });

    if (!success) {
      toast.error(`Necesitas ${hint.cost} ML Coins`);
    }
  };

  const handleComplete = (isCorrect, hintsUsed) => {
    const xp = calculateXPEarned(exercise.xp_reward, isCorrect, hintsUsed);
    const coins = calculateMLCoinsEarned(exercise.ml_coins_reward, isCorrect, hintsUsed);

    // XP y coins tienen penalizacion por hints usados
    console.log(`Ganaste ${xp} XP y ${coins} ML Coins`);
  };

  return (
    <div>
      <div className="coins-display">
        ML Coins: {mlCoinsBalance}
      </div>
      {/* UI del ejercicio */}
    </div>
  );
};
```

---

## 4. Patrones de Integracion por Tipo de Ejercicio

### 4.1 Ejercicio M1-M2 (Auto-evaluado)

Los ejercicios de modulos 1 y 2 son auto-evaluados por el sistema. El feedback es inmediato.

```tsx
// Patron recomendado para M1-M2
import { useState } from 'react';
import { SubmitExerciseButton } from '@shared/components/mechanics/SubmitExerciseButton';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { useExerciseSubmission } from '@/features/exercises/hooks/useExerciseSubmission';
import { useExerciseTimer } from '@/features/exercises/hooks/useExerciseTimer';
import { useAuth } from '@/features/auth/hooks/useAuth';

export const EjercicioM1M2 = ({ exercise, onComplete }) => {
  const { user } = useAuth();
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const { formattedElapsed, stop: stopTimer } = useExerciseTimer({ autoStart: true });

  const { submitExercise, isSubmitting, result } = useExerciseSubmission({
    onSuccess: (response) => {
      setFeedback({
        type: response.isPerfect ? 'success' :
              response.score >= 70 ? 'partial' : 'error',
        title: response.isPerfect ? 'Perfecto!' :
               response.score >= 70 ? 'Buen trabajo!' : 'Sigue practicando',
        message: response.feedback?.overall || `Score: ${response.score}%`,
        score: response.score,
        xpEarned: response.rewards?.xp,           // OBLIGATORIO
        mlCoinsEarned: response.rewards?.mlCoins, // OBLIGATORIO
        showConfetti: response.isPerfect,
      });
      setShowFeedback(true);
    },
  });

  const isValid = /* validacion de completitud */;
  const isSubmitted = result !== null;

  const handleSubmit = async () => {
    const timeSpent = stopTimer();
    await submitExercise({
      userId: user.id,
      exerciseId: exercise.id,
      answers,
      timeSpent,
    });
  };

  return (
    <>
      {/* UI del ejercicio con tiempo */}
      <div>Tiempo: {formattedElapsed}</div>

      <SubmitExerciseButton
        isSubmitting={isSubmitting}
        isSubmitted={isSubmitted}
        onClick={handleSubmit}
        disabled={!isValid}
        variant="gold"
        fullWidth
      />

      {feedback && (
        <FeedbackModal
          isOpen={showFeedback}
          feedback={feedback}
          onClose={() => {
            setShowFeedback(false);
            if (feedback.type === 'success') onComplete?.();
          }}
          onRetry={() => {
            setShowFeedback(false);
            setAnswers({});
          }}
        />
      )}
    </>
  );
};
```

### 4.2 Ejercicio M3-M5 (Evaluacion Manual)

Los ejercicios de modulos 3-5 requieren revision del docente. El feedback indica `pendingReview`.

```tsx
// Patron recomendado para M3-M5
import { useState } from 'react';
import { SubmitExerciseButton } from '@shared/components/mechanics/SubmitExerciseButton';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';

export const EjercicioM3M5 = ({ exercise, onComplete }) => {
  const [content, setContent] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  // Usar version SECURE con tracking
  const {
    submit,
    isSubmitting,
    data: result,
    recordHintUsed,
  } = useExerciseSubmission(exercise.id, {
    trackHints: true,
    onSuccess: (response) => {
      // M3-M5 siempre muestran pendingReview
      setFeedback({
        type: 'info',
        title: 'Trabajo Enviado',
        message: response.message || 'Tu trabajo ha sido enviado para revision.',
        pendingReview: true,  // OBLIGATORIO para M3-M5
        // NO incluir xpEarned/mlCoinsEarned - se asignan tras revision
      });
      setShowFeedback(true);
    },
  });

  const isValid = /* validacion de requisitos minimos */;
  const isSubmitted = result !== null;

  const handleSubmit = () => {
    submit(content);
  };

  return (
    <>
      {/* UI del ejercicio creativo */}

      <SubmitExerciseButton
        isSubmitting={isSubmitting}
        isSubmitted={isSubmitted}
        onClick={handleSubmit}
        disabled={!isValid}
        label="Enviar para Revision"
        variant="blue"
        fullWidth
      />

      {feedback && (
        <FeedbackModal
          isOpen={showFeedback}
          feedback={feedback}
          onClose={() => {
            setShowFeedback(false);
            onComplete?.();
          }}
        />
      )}
    </>
  );
};
```

### 4.3 Ejercicio con Multimedia (M5)

Ejercicios que incluyen carga de archivos multimedia.

```tsx
// Patron para ejercicios con multimedia
import { useState } from 'react';
import { MediaUploader } from '@shared/components/mechanics/MediaUploader';
import { SubmitExerciseButton } from '@shared/components/mechanics/SubmitExerciseButton';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';

export const EjercicioMultimedia = ({ exercise }) => {
  const [textContent, setTextContent] = useState('');
  const [mediaUrls, setMediaUrls] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const { submit, isSubmitting, data: result } = useExerciseSubmission(exercise.id, {
    onSuccess: (response) => {
      setFeedback({
        type: 'info',
        title: 'Trabajo Enviado',
        message: 'Tu trabajo multimedia ha sido enviado para revision.',
        pendingReview: true,
      });
      setShowFeedback(true);
    },
  });

  // Validacion de requisitos minimos
  const wordCount = textContent.split(/\s+/).filter(Boolean).length;
  const isValid = wordCount >= 150 && mediaUrls.length > 0;

  const handleMediaUpload = (urls) => {
    setMediaUrls(urls);
  };

  const handleSubmit = () => {
    submit({
      content: textContent,
      mediaUrls: mediaUrls,
    });
  };

  return (
    <>
      <textarea
        value={textContent}
        onChange={(e) => setTextContent(e.target.value)}
        placeholder="Escribe tu contenido aqui..."
      />

      <p>Palabras: {wordCount}/150 minimo</p>

      <MediaUploader
        accept="image/*,video/*,audio/*"
        maxFiles={5}
        onUpload={handleMediaUpload}
      />

      <SubmitExerciseButton
        isSubmitting={isSubmitting}
        isSubmitted={result !== null}
        onClick={handleSubmit}
        disabled={!isValid}
        label="Enviar Trabajo"
        variant="blue"
        fullWidth
      />

      {feedback && (
        <FeedbackModal
          isOpen={showFeedback}
          feedback={feedback}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </>
  );
};
```

---

## 5. Checklist de Integracion

### 5.1 Checklist General

Al implementar un nuevo ejercicio, verificar:

#### Configuracion Inicial
- [ ] Importar componentes desde ubicaciones correctas (`@shared/components/mechanics/`)
- [ ] Usar hook de submission apropiado (Simple para M1-M3, SECURE para M4-M5)
- [ ] Configurar estado inicial para respuestas
- [ ] Obtener usuario autenticado via `useAuth()`

#### UI del Ejercicio
- [ ] Implementar logica especifica de la mecanica
- [ ] Validar completitud de respuestas antes de habilitar envio
- [ ] Mostrar indicadores de progreso si aplica

#### Sistema de Envio
- [ ] Usar `SubmitExerciseButton` en lugar de boton inline
- [ ] Pasar `isSubmitting` e `isSubmitted` correctamente
- [ ] Implementar validacion de requisitos minimos en `disabled`
- [ ] Usar variant apropiada (`gold` para M1-M2, `blue` para M3-M5)

#### Feedback
- [ ] Configurar `FeedbackModal` con todos los campos
- [ ] **SIEMPRE** pasar `xpEarned` y `mlCoinsEarned` para M1-M2
- [ ] **SIEMPRE** usar `pendingReview: true` para M3-M5
- [ ] Configurar `showConfetti: true` para puntaje perfecto
- [ ] Implementar `onRetry` si se permite reintentar
- [ ] Implementar `onNext` si hay siguiente ejercicio

#### Sistema de Hints (Opcional)
- [ ] Decidir entre `HintSystem` (gratis) o `HintModal` (premium)
- [ ] Configurar hints en el ejercicio o cargar desde backend
- [ ] Trackear hints usados si afectan puntuacion

#### Timer (Opcional)
- [ ] Usar `useExerciseTimer` si el ejercicio tiene limite
- [ ] Implementar `onTimeExpired` para manejo automatico
- [ ] Mostrar tiempo en UI

### 5.2 Checklist por Tipo de Ejercicio

#### M1-M2 (Auto-evaluado)
- [ ] Usar `useExerciseSubmission` (Simple)
- [ ] Preparar payload en formato correcto para el tipo
- [ ] Mapear respuesta a FeedbackData con `xpEarned` y `mlCoinsEarned`
- [ ] Tipo de feedback: `success`, `partial`, o `error`

#### M3-M5 (Revision Manual)
- [ ] Usar `useExerciseSubmission` (SECURE)
- [ ] Habilitar `trackHints: true`
- [ ] Siempre usar `pendingReview: true` en feedback
- [ ] Tipo de feedback: `info`
- [ ] NO mostrar XP/MLCoins (se asignan tras revision)

#### Con Multimedia (M5)
- [ ] Validar requisitos minimos (palabras, duracion, etc.)
- [ ] Usar URLs permanentes (no blob:)
- [ ] Incluir mediaUrls en submission

---

## 6. Errores Comunes y Soluciones

### 6.1 FeedbackModal no muestra XP/MLCoins

**Problema:** El modal muestra el resultado pero no las recompensas.

**Causa:** No se pasan las props `xpEarned` y `mlCoinsEarned`.

**Solucion:**
```tsx
// INCORRECTO
setFeedback({
  type: 'success',
  title: 'Correcto!',
  message: 'Buen trabajo',
  score: response.score,
  // Falta xpEarned y mlCoinsEarned
});

// CORRECTO
setFeedback({
  type: 'success',
  title: 'Correcto!',
  message: 'Buen trabajo',
  score: response.score,
  xpEarned: response.rewards?.xp || response.xp_earned,
  mlCoinsEarned: response.rewards?.mlCoins || response.ml_coins_earned,
  showConfetti: response.score === 100,
});
```

### 6.2 Ejercicio M3-M5 no muestra estado de revision

**Problema:** El estudiante no sabe que su trabajo esta pendiente de revision.

**Causa:** No se usa `pendingReview: true`.

**Solucion:**
```tsx
// INCORRECTO para M3-M5
setFeedback({
  type: 'success',
  title: 'Enviado',
  message: 'Trabajo enviado',
});

// CORRECTO para M3-M5
setFeedback({
  type: 'info',  // Usar 'info' no 'success'
  title: 'Trabajo Enviado',
  message: 'Tu trabajo ha sido enviado para revision.',
  pendingReview: true,  // OBLIGATORIO
});
```

### 6.3 Cache no se actualiza despues de submission

**Problema:** El dashboard no refleja el ejercicio completado.

**Causa:** Usando hook Simple sin invalidacion de cache manual.

**Solucion A:** Usar hook SECURE (tiene invalidacion automatica)
```tsx
// SECURE invalida cache automaticamente
const { submit } = useExerciseSubmission(exerciseId, options);
```

**Solucion B:** Invalidar manualmente con hook Simple
```tsx
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

const { submitExercise } = useExerciseSubmission({
  onSuccess: async (result) => {
    // Invalidar cache manualmente
    await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    await queryClient.invalidateQueries({ queryKey: ['userModules'] });
    // Mostrar feedback...
  },
});
```

### 6.4 Boton de submit siempre deshabilitado

**Problema:** El boton nunca se habilita aunque hay respuestas.

**Causa:** Logica de validacion incorrecta.

**Solucion:**
```tsx
// INCORRECTO - compara objeto vacio
const isValid = answers !== {};

// CORRECTO - verificar contenido
const isValid = Object.keys(answers).length >= minAnswers;

// O para verificar todas las preguntas respondidas
const isValid = Object.keys(answers).length === totalQuestions;
```

### 6.5 Rate limiting sin manejo

**Problema:** Usuario ve error generico al enviar muy rapido.

**Causa:** No se implementa `onRateLimitError` en hook SECURE.

**Solucion:**
```tsx
const { submit } = useExerciseSubmission(exerciseId, {
  onRateLimitError: (retryAfter) => {
    toast.error(`Por favor espera ${retryAfter} segundos antes de reintentar.`);
    // Opcional: deshabilitar boton temporalmente
    setIsRateLimited(true);
    setTimeout(() => setIsRateLimited(false), retryAfter * 1000);
  },
});
```

### 6.6 Hints no se trackean para penalizacion

**Problema:** Usuario usa hints pero no afecta su puntuacion final.

**Causa:** `trackHints: true` no configurado o `recordHintUsed()` no llamado.

**Solucion:**
```tsx
const { submit, recordHintUsed } = useExerciseSubmission(exerciseId, {
  trackHints: true,  // 1. Habilitar tracking
});

const handleUseHint = () => {
  recordHintUsed();  // 2. Llamar al revelar cada hint
  // Mostrar hint...
};
```

### 6.7 Multimedia con URL blob: no accesible

**Problema:** Teacher Portal no puede ver los archivos multimedia subidos.

**Causa:** Se guardan URLs temporales `blob:` en lugar de URLs permanentes.

**Solucion:** Subir a servicio de storage antes de guardar.
```tsx
// INCORRECTO - URL temporal que expira
const blobUrl = URL.createObjectURL(file);
setMediaUrls([...mediaUrls, blobUrl]);

// CORRECTO - Subir a storage y usar URL permanente
const uploadResponse = await uploadToStorage(file);
setMediaUrls([...mediaUrls, uploadResponse.permanentUrl]);
```

**Nota:** GAP-EX-004 documenta que este servicio de upload aun no esta implementado.

---

## 7. Referencias

### 7.1 Archivos de Codigo

#### Componentes Compartidos
- `/apps/frontend/src/shared/components/mechanics/SubmitExerciseButton.tsx`
- `/apps/frontend/src/shared/components/mechanics/FeedbackModal.tsx`
- `/apps/frontend/src/shared/components/mechanics/HintSystem.tsx`
- `/apps/frontend/src/shared/components/mechanics/mechanicsTypes.ts`

#### Componentes Student
- `/apps/frontend/src/apps/student/components/exercise/HintModal.tsx`
- `/apps/frontend/src/apps/student/components/exercise/CompletionModal.tsx`

#### Hooks
- `/apps/frontend/src/features/exercises/hooks/useExerciseSubmission.ts` (Simple)
- `/apps/frontend/src/features/mechanics/shared/hooks/useExerciseSubmission.ts` (SECURE)
- `/apps/frontend/src/features/exercises/hooks/useExerciseTimer.ts`
- `/apps/frontend/src/features/exercises/hooks/useExerciseRewards.ts`

### 7.2 Documentacion Relacionada

- [FLUJO-ENVIO-RESPUESTAS.md](./FLUJO-ENVIO-RESPUESTAS.md) - Flujo completo de submission
- [CICLO-VIDA-EJERCICIO.md](./CICLO-VIDA-EJERCICIO.md) - Estados y transiciones
- [GAPS-EJERCICIOS-ANALISIS.md](./GAPS-EJERCICIOS-ANALISIS.md) - GAPs identificados

### 7.3 Backend Endpoints

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/educational/exercises/:id/submit` | POST | Enviar respuestas |
| `/educational/exercises/:id` | GET | Obtener ejercicio |
| `/progress/submissions/:id` | GET | Obtener submission |

### 7.4 Tipos Importantes

```typescript
// FeedbackData - shared/components/mechanics/mechanicsTypes.ts
interface FeedbackData {
  type: 'success' | 'error' | 'partial' | 'info';
  title: string;
  message: string;
  score?: number;
  xpEarned?: number;
  mlCoinsEarned?: number;
  showConfetti?: boolean;
  pendingReview?: boolean;
  details?: Record<string, unknown>;
}

// SubmissionResult - features/mechanics/shared/hooks/useExerciseSubmission.ts
interface SubmissionResult {
  attemptId: string;
  score: number;
  isPerfect: boolean;
  rewards: { mlCoins: number; xp: number; bonuses: {...} };
  feedback: { overall: string; answerReview: [...] };
  correctAnswers: Record<string, unknown>;
  status?: 'draft' | 'submitted' | 'graded' | 'reviewed' | 'pending_review';
  requiresManualReview?: boolean;
}
```

---

## Historial de Cambios

| Fecha | Version | Cambios |
|-------|---------|---------|
| 2026-01-20 | 1.0.0 | Documento inicial completo |

---

*Documento creado como parte de SUBTASK-3.3 de TASK-2026-01-20-EXERCISES-VALIDATION*
*Guia de desarrollo para integracion de componentes compartidos en ejercicios GAMILIT*
