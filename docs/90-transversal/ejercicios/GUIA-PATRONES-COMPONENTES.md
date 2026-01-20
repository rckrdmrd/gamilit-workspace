# Guia de Patrones para Componentes Compartidos en Ejercicios GAMILIT

**Version:** 1.0.0
**Fecha:** 2026-01-20
**Estado:** Activo

---

## Tabla de Contenidos

1. [Introduccion](#1-introduccion)
2. [Componentes de Envio](#2-componentes-de-envio)
3. [Componentes de Feedback](#3-componentes-de-feedback)
4. [Componentes de Hints (Pistas)](#4-componentes-de-hints-pistas)
5. [Hooks Recomendados](#5-hooks-recomendados)
6. [Template de Ejercicio](#6-template-de-ejercicio)
7. [Checklist de Integracion](#7-checklist-de-integracion)
8. [Errores Comunes y Soluciones](#8-errores-comunes-y-soluciones)

---

## 1. Introduccion

Esta guia establece los patrones estandarizados para integrar componentes compartidos en los ejercicios de GAMILIT. El objetivo es garantizar consistencia en la experiencia del usuario y facilitar el mantenimiento del codigo.

### Estado Actual de Adopcion

| Componente | Uso Actual | Objetivo |
|------------|------------|----------|
| SubmitExerciseButton | 0% | 100% |
| HintSystem | 10% | 100% |
| FeedbackModal | 100% (inconsistente) | 100% (estandarizado) |
| CompletionModal | 0% | 100% |

### Ubicacion de Componentes

```
apps/frontend/src/
├── shared/components/mechanics/
│   ├── SubmitExerciseButton.tsx    # Boton de envio estandarizado
│   ├── FeedbackModal.tsx           # Modal de retroalimentacion
│   ├── HintSystem.tsx              # Sistema de pistas inline
│   └── mechanicsTypes.ts           # Tipos compartidos
│
├── apps/student/components/exercise/
│   ├── HintModal.tsx               # Modal de pistas con ML Coins
│   └── CompletionModal.tsx         # Modal de completacion con gamificacion
│
└── features/mechanics/shared/hooks/
    ├── useExerciseSubmission.ts    # Hook de envio seguro
    └── useExerciseRewards.ts       # Hook de recompensas
```

---

## 2. Componentes de Envio

### 2.1 SubmitExerciseButton

Componente estandarizado para el boton de envio de ejercicios.

**Ubicacion:** `@shared/components/mechanics/SubmitExerciseButton.tsx`

#### Props

| Prop | Tipo | Requerido | Default | Descripcion |
|------|------|-----------|---------|-------------|
| `isSubmitting` | `boolean` | Si | - | Indica si se esta enviando |
| `isSubmitted` | `boolean` | Si | - | Indica si ya fue enviado |
| `onClick` | `() => void` | Si | - | Callback al hacer click |
| `disabled` | `boolean` | No | `false` | Deshabilita el boton |
| `label` | `string` | No | `'Enviar Respuestas'` | Texto en estado normal |
| `loadingLabel` | `string` | No | `'Enviando...'` | Texto mientras envia |
| `submittedLabel` | `string` | No | `'Enviado'` | Texto despues de enviar |
| `variant` | `'primary' \| 'gold' \| 'blue'` | No | `'primary'` | Variante visual |
| `size` | `'sm' \| 'md' \| 'lg'` | No | `'md'` | Tamano del boton |
| `fullWidth` | `boolean` | No | `false` | Ancho completo |

#### Cuando Usar

- En TODOS los ejercicios que requieran envio de respuestas
- Reemplaza botones custom de envio por consistencia
- Integra con `useExerciseSubmission` hook

#### Ejemplo de Uso

```tsx
import { SubmitExerciseButton } from '@shared/components/mechanics/SubmitExerciseButton';
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';

const MiEjercicio: React.FC<ExerciseProps> = ({ exerciseId }) => {
  const { submit, isSubmitting, isSuccess } = useExerciseSubmission(exerciseId);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [isValid, setIsValid] = useState(false);

  const handleSubmit = () => {
    submit(answers);
  };

  return (
    <div>
      {/* ... contenido del ejercicio ... */}

      <SubmitExerciseButton
        isSubmitting={isSubmitting}
        isSubmitted={isSuccess}
        onClick={handleSubmit}
        disabled={!isValid}
        label="Enviar Verificacion"
        variant="gold"
        size="lg"
        fullWidth
      />
    </div>
  );
};
```

#### Errores Comunes

1. **No sincronizar estados con el hook:**
   ```tsx
   // MAL - estados manuales
   const [loading, setLoading] = useState(false);

   // BIEN - usar estados del hook
   const { isSubmitting, isSuccess } = useExerciseSubmission(exerciseId);
   ```

2. **No deshabilitar cuando es invalido:**
   ```tsx
   // MAL
   <SubmitExerciseButton onClick={handleSubmit} />

   // BIEN
   <SubmitExerciseButton onClick={handleSubmit} disabled={!isValid} />
   ```

---

## 3. Componentes de Feedback

### 3.1 FeedbackModal

Modal de retroalimentacion que muestra resultados, recompensas y estado de revision.

**Ubicacion:** `@shared/components/mechanics/FeedbackModal.tsx`

#### Props

| Prop | Tipo | Requerido | Default | Descripcion |
|------|------|-----------|---------|-------------|
| `isOpen` | `boolean` | Si | - | Controla visibilidad |
| `feedback` | `FeedbackData` | Si | - | Datos de retroalimentacion |
| `onClose` | `() => void` | Si | - | Callback al cerrar |
| `onRetry` | `() => void` | No | - | Callback para reintentar |
| `onNext` | `() => void` | No | - | Callback para siguiente |

#### Interface FeedbackData

```typescript
interface FeedbackData {
  type: 'success' | 'error' | 'partial' | 'info';
  title: string;
  message: string;
  score?: number;              // Puntuacion obtenida
  xpEarned?: number;           // XP ganados
  mlCoinsEarned?: number;      // ML Coins ganados
  showConfetti?: boolean;      // Mostrar confetti en exito
  pendingReview?: boolean;     // Indica revision manual pendiente
  details?: Array<{            // Detalles por pregunta/fragmento
    score: number;
    maxScore: number;
    feedback: string;
    categoryUsed?: string;
    keywordsFound?: string[];
    keywordsExpected?: string[];
  }>;
}
```

#### Cuando Usar

- Despues de cada envio de ejercicio
- Para mostrar resultados de evaluacion automatica
- Para indicar estado de revision manual (M3-M5)

#### Ejemplo de Uso Basico

```tsx
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import type { FeedbackData } from '@shared/components/mechanics/mechanicsTypes';

const MiEjercicio: React.FC = () => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);

  const handleSubmitSuccess = (result: SubmissionResult) => {
    setFeedback({
      type: 'success',
      title: 'Excelente trabajo!',
      message: 'Has completado el ejercicio correctamente.',
      score: result.score,
      xpEarned: result.rewards?.xp,
      mlCoinsEarned: result.rewards?.mlCoins,
      showConfetti: result.isPerfect,
    });
    setShowFeedback(true);
  };

  return (
    <>
      {/* ... ejercicio ... */}

      {feedback && (
        <FeedbackModal
          isOpen={showFeedback}
          feedback={feedback}
          onClose={() => setShowFeedback(false)}
          onRetry={() => {
            setShowFeedback(false);
            resetExercise();
          }}
          onNext={onNextExercise}
        />
      )}
    </>
  );
};
```

#### Ejemplo con Revision Manual (M3-M5)

```tsx
// Para ejercicios que requieren revision manual del maestro
const handleSubmitSuccess = (result: SubmissionResult) => {
  if (result.status === 'pending_review' || result.requiresManualReview) {
    setFeedback({
      type: 'info',
      title: 'Ejercicio Enviado',
      message: 'Tu trabajo ha sido enviado para revision del maestro.',
      pendingReview: true,  // <-- IMPORTANTE: Activa seccion especial
    });
  } else {
    setFeedback({
      type: 'success',
      title: 'Completado!',
      message: 'Tu ejercicio ha sido evaluado.',
      score: result.score,
      xpEarned: result.rewards?.xp,
      mlCoinsEarned: result.rewards?.mlCoins,
    });
  }
  setShowFeedback(true);
};
```

#### Ejemplo con Feedback Detallado

```tsx
// Para ejercicios con multiples preguntas/fragmentos
setFeedback({
  type: 'partial',
  title: 'Buen intento',
  message: 'Revisa los detalles de cada respuesta.',
  score: 75,
  xpEarned: 50,
  mlCoinsEarned: 25,
  details: result.feedback.answerReview.map((item, idx) => ({
    score: item.isCorrect ? 10 : 0,
    maxScore: 10,
    feedback: item.explanation || 'Sin comentarios',
    categoryUsed: `Pregunta ${idx + 1}`,
    keywordsFound: item.isCorrect ? ['correcto'] : [],
    keywordsExpected: ['respuesta esperada'],
  })),
});
```

### 3.2 CompletionModal

Modal avanzado de completacion con animaciones de gamificacion.

**Ubicacion:** `@/apps/student/components/exercise/CompletionModal.tsx`

#### Props

| Prop | Tipo | Requerido | Default | Descripcion |
|------|------|-----------|---------|-------------|
| `isOpen` | `boolean` | Si | - | Controla visibilidad |
| `success` | `boolean` | Si | - | Si fue exitoso |
| `score` | `number` | Si | - | Puntuacion obtenida |
| `maxScore` | `number` | Si | - | Puntuacion maxima |
| `xpGained` | `number` | Si | - | XP ganados |
| `mlCoinsGained` | `number` | Si | - | ML Coins ganados |
| `timeSpent` | `number` | Si | - | Tiempo en segundos |
| `hintsUsed` | `number` | Si | - | Pistas usadas |
| `achievements` | `Achievement[]` | No | `[]` | Logros desbloqueados |
| `moduleId` | `string` | Si | - | ID del modulo |
| `exerciseId` | `string` | No | `'unknown'` | ID del ejercicio |
| `onClose` | `() => void` | Si | - | Callback al cerrar |
| `onRetry` | `() => void` | Si | - | Callback para reintentar |
| `onNextExercise` | `() => void` | No | - | Callback para siguiente |
| `rankUp` | `RankUpInfo \| null` | No | - | Info de subida de rango |
| `streakInfo` | `StreakInfo` | No | - | Info de racha |

#### Cuando Usar vs FeedbackModal

| Usar CompletionModal | Usar FeedbackModal |
|---------------------|-------------------|
| Completacion final de ejercicio | Feedback parcial/intermedio |
| Necesitas animaciones de XP/Coins | Feedback simple de error/exito |
| Mostrar logros desbloqueados | Feedback de revision manual |
| Mostrar subida de rango | Ejercicios simples M1-M2 |
| Mostrar racha | - |

#### Ejemplo de Uso

```tsx
import { CompletionModal } from '@/apps/student/components/exercise/CompletionModal';

const MiEjercicio: React.FC<ExerciseProps> = ({ exerciseId, moduleId }) => {
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionData, setCompletionData] = useState<CompletionData | null>(null);

  const handleComplete = (result: SubmissionResult) => {
    setCompletionData({
      success: result.score >= 60,
      score: result.score,
      maxScore: 100,
      xpGained: result.rewards.xp,
      mlCoinsGained: result.rewards.mlCoins,
      timeSpent: getTimeElapsed(),
      hintsUsed: hintsUsedCount,
      achievements: result.achievements,
    });
    setShowCompletion(true);
  };

  return (
    <>
      {/* ... ejercicio ... */}

      {completionData && (
        <CompletionModal
          isOpen={showCompletion}
          success={completionData.success}
          score={completionData.score}
          maxScore={completionData.maxScore}
          xpGained={completionData.xpGained}
          mlCoinsGained={completionData.mlCoinsGained}
          timeSpent={completionData.timeSpent}
          hintsUsed={completionData.hintsUsed}
          achievements={completionData.achievements}
          moduleId={moduleId}
          exerciseId={exerciseId}
          onClose={() => setShowCompletion(false)}
          onRetry={handleReset}
          onNextExercise={onNext}
        />
      )}
    </>
  );
};
```

---

## 4. Componentes de Hints (Pistas)

### 4.1 HintSystem (Inline)

Sistema de pistas colapsable inline.

**Ubicacion:** `@shared/components/mechanics/HintSystem.tsx`

#### Props

| Prop | Tipo | Requerido | Default | Descripcion |
|------|------|-----------|---------|-------------|
| `hints` | `string[]` | Si | - | Array de pistas |
| `maxHints` | `number` | No | `hints.length` | Maximo de pistas |
| `onHintUsed` | `(index: number) => void` | No | - | Callback al usar pista |

#### Cuando Usar

- Ejercicios simples sin economia de ML Coins
- Pistas gratuitas o sin costo
- UI minimalista requerida

#### Ejemplo de Uso

```tsx
import { HintSystem } from '@shared/components/mechanics/HintSystem';

const MiEjercicio: React.FC = () => {
  const [hintsUsed, setHintsUsed] = useState(0);

  const hints = [
    'Recuerda verificar la fuente de la informacion.',
    'Busca fechas y nombres especificos.',
    'Compara con otras fuentes confiables.',
  ];

  return (
    <div>
      {/* ... ejercicio ... */}

      <HintSystem
        hints={hints}
        maxHints={3}
        onHintUsed={(index) => {
          setHintsUsed(index + 1);
          console.log(`Pista ${index + 1} usada`);
        }}
      />
    </div>
  );
};
```

### 4.2 HintModal (Con ML Coins)

Modal de pistas con sistema de economia.

**Ubicacion:** `@/apps/student/components/exercise/HintModal.tsx`

#### Props

| Prop | Tipo | Requerido | Default | Descripcion |
|------|------|-----------|---------|-------------|
| `isOpen` | `boolean` | Si | - | Controla visibilidad |
| `hints` | `Hint[]` | Si | - | Array de pistas con costo |
| `currentHintLevel` | `number` | Si | - | Nivel actual desbloqueado |
| `availableCoins` | `number` | Si | - | ML Coins disponibles |
| `onClose` | `() => void` | Si | - | Callback al cerrar |
| `onUseHint` | `(hint: Hint) => void` | Si | - | Callback al usar pista |

#### Interface Hint

```typescript
interface Hint {
  id: string;
  level: number;      // Nivel progresivo (1, 2, 3...)
  text: string;       // Contenido de la pista
  cost: number;       // Costo en ML Coins (0 = gratis)
}
```

#### Cuando Usar

- Ejercicios con economia de ML Coins
- Pistas progresivas (desbloqueo secuencial)
- Gamificacion avanzada

#### Ejemplo de Uso

```tsx
import { HintModal } from '@/apps/student/components/exercise/HintModal';
import { useExerciseRewards } from '@/features/exercises/hooks/useExerciseRewards';

const MiEjercicio: React.FC = () => {
  const [showHints, setShowHints] = useState(false);
  const [currentHintLevel, setCurrentHintLevel] = useState(0);

  const { mlCoinsBalance, unlockHint } = useExerciseRewards({
    initialMLCoins: 100,
  });

  const hints: Hint[] = [
    { id: 'hint-1', level: 1, text: 'Primera pista...', cost: 0 },    // Gratis
    { id: 'hint-2', level: 2, text: 'Segunda pista...', cost: 10 },   // 10 ML Coins
    { id: 'hint-3', level: 3, text: 'Tercera pista...', cost: 25 },   // 25 ML Coins
  ];

  const handleUseHint = (hint: Hint) => {
    if (hint.cost > 0) {
      // Descontar ML Coins
      unlockHint({ id: hint.id, ml_coins_cost: hint.cost });
    }
    setCurrentHintLevel(hint.level);
  };

  return (
    <>
      <button onClick={() => setShowHints(true)}>
        Ver Pistas ({currentHintLevel}/{hints.length})
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

## 5. Hooks Recomendados

### 5.1 useExerciseSubmission (Seguro)

Hook principal para envio de ejercicios con validacion y anti-cheat.

**Ubicacion:** `@/features/mechanics/shared/hooks/useExerciseSubmission.ts`

#### Parametros

```typescript
function useExerciseSubmission(
  exerciseId: string,
  options?: UseExerciseSubmissionOptions
): UseExerciseSubmissionReturn;

interface UseExerciseSubmissionOptions {
  onSuccess?: (result: SubmissionResult) => void;
  onError?: (error: any) => void;
  onRateLimitError?: (retryAfter: number) => void;
  trackHints?: boolean;      // Rastrear pistas usadas
  trackPowerups?: boolean;   // Rastrear powerups usados
}
```

#### Return

```typescript
interface UseExerciseSubmissionReturn {
  // Mutation state
  submit: (answers: Record<string, unknown>) => void;
  submitAsync: (answers: Record<string, unknown>) => Promise<SubmissionResult>;
  isSubmitting: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: any;
  data: SubmissionResult | undefined;
  reset: () => void;

  // Helper functions
  recordHintUsed: () => void;
  recordPowerupUsed: (powerup: string) => void;
  getTimeElapsed: () => number;
  resetTracking: () => void;

  // Tracking data
  hintsUsed: number;
  powerupsUsed: string[];
  sessionId: string;
  startTime: number;
}
```

#### Ejemplo Completo

```tsx
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';

const MiEjercicio: React.FC<{ exerciseId: string }> = ({ exerciseId }) => {
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const {
    submit,
    isSubmitting,
    isSuccess,
    isError,
    data,
    recordHintUsed,
    getTimeElapsed,
  } = useExerciseSubmission(exerciseId, {
    onSuccess: (result) => {
      // Manejar revision manual
      if (result.status === 'pending_review') {
        setFeedback({
          type: 'info',
          title: 'Enviado',
          message: 'Tu trabajo esta pendiente de revision.',
          pendingReview: true,
        });
      } else {
        setFeedback({
          type: result.isPerfect ? 'success' : 'partial',
          title: result.isPerfect ? 'Perfecto!' : 'Buen trabajo',
          message: result.feedback.overall,
          score: result.score,
          xpEarned: result.rewards.xp,
          mlCoinsEarned: result.rewards.mlCoins,
          showConfetti: result.isPerfect,
        });
      }
      setShowFeedback(true);
    },
    onError: (error) => {
      setFeedback({
        type: 'error',
        title: 'Error',
        message: error.message || 'Error al enviar.',
      });
      setShowFeedback(true);
    },
    trackHints: true,
  });

  const handleUseHint = () => {
    recordHintUsed();
    // ... mostrar pista
  };

  const handleSubmit = () => {
    submit(answers);
  };

  return (
    <>
      {/* ... UI del ejercicio ... */}

      <SubmitExerciseButton
        isSubmitting={isSubmitting}
        isSubmitted={isSuccess}
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

### 5.2 useExerciseRewards

Hook para gestionar economia de recompensas.

**Ubicacion:** `@/features/exercises/hooks/useExerciseRewards.ts`

#### Uso

```typescript
const {
  mlCoinsBalance,        // Balance actual
  mlCoinsSpent,          // Gastado en esta sesion
  canAffordHint,         // (hint) => boolean
  unlockHint,            // (hint) => boolean
  isHintUnlocked,        // (hintId) => boolean
  calculateXPEarned,     // (baseXP, isCorrect, hintsUsed) => number
  calculateMLCoinsEarned, // (baseCoins, isCorrect, hintsUsed) => number
  addMLCoins,            // (amount) => void
  reset,                 // () => void
} = useExerciseRewards({
  initialMLCoins: 100,
  onMLCoinsChange: (newBalance) => console.log('Nuevo balance:', newBalance),
});
```

---

## 6. Template de Ejercicio

### Template Completo con Todos los Componentes

```tsx
/**
 * [NombreEjercicio]Exercise.tsx
 *
 * Ejercicio de [descripcion] para Modulo [N].
 * Integra: SubmitExerciseButton, FeedbackModal, HintSystem/HintModal
 */

import React, { useState, useEffect } from 'react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { SubmitExerciseButton } from '@shared/components/mechanics/SubmitExerciseButton';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { HintSystem } from '@shared/components/mechanics/HintSystem';
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';
import type { FeedbackData, ExerciseProgressUpdate } from '@shared/components/mechanics/mechanicsTypes';

// ============================================================================
// TIPOS
// ============================================================================

interface ExerciseProps {
  exerciseId: string;
  moduleId: string;
  onComplete?: (score: number, timeSpent: number) => void;
  onProgressUpdate?: (data: {
    progress: ExerciseProgressUpdate;
    answers: Record<string, unknown>;
  }) => void;
  initialData?: Record<string, unknown>;
  exercise?: ExerciseConfig;
}

interface ExerciseConfig {
  title: string;
  instructions: string;
  hints?: string[];
  // ... campos especificos del ejercicio
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const NombreEjercicio: React.FC<ExerciseProps> = ({
  exerciseId,
  moduleId,
  onComplete,
  onProgressUpdate,
  initialData,
  exercise,
}) => {
  // -------------------------------------------------------------------------
  // STATE
  // -------------------------------------------------------------------------
  const [answers, setAnswers] = useState<Record<string, unknown>>(
    initialData?.answers as Record<string, unknown> || {}
  );
  const [startTime] = useState(Date.now());
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);

  // -------------------------------------------------------------------------
  // HOOKS
  // -------------------------------------------------------------------------
  const {
    submit,
    isSubmitting,
    isSuccess,
    recordHintUsed,
    getTimeElapsed,
  } = useExerciseSubmission(exerciseId, {
    onSuccess: (result) => {
      // Determinar tipo de feedback basado en resultado
      if (result.status === 'pending_review' || result.requiresManualReview) {
        setFeedback({
          type: 'info',
          title: 'Ejercicio Enviado',
          message: 'Tu trabajo ha sido enviado para revision.',
          pendingReview: true,
        });
      } else {
        setFeedback({
          type: result.isPerfect ? 'success' : result.score >= 60 ? 'partial' : 'error',
          title: result.isPerfect ? 'Excelente!' : result.score >= 60 ? 'Buen trabajo' : 'Sigue practicando',
          message: result.feedback?.overall || 'Ejercicio completado.',
          score: result.score,
          xpEarned: result.rewards?.xp || 0,
          mlCoinsEarned: result.rewards?.mlCoins || 0,
          showConfetti: result.isPerfect,
        });
      }
      setShowFeedback(true);

      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      onComplete?.(result.score, timeSpent);
    },
    onError: (error) => {
      setFeedback({
        type: 'error',
        title: 'Error',
        message: error?.message || 'Hubo un problema al enviar. Intenta de nuevo.',
      });
      setShowFeedback(true);
    },
    trackHints: true,
  });

  // -------------------------------------------------------------------------
  // PROGRESS TRACKING
  // -------------------------------------------------------------------------
  useEffect(() => {
    const score = calculateScore();
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    onProgressUpdate?.({
      progress: {
        currentStep: Object.keys(answers).length,
        totalSteps: getTotalSteps(),
        score,
        hintsUsed,
        timeSpent,
      },
      answers,
    });
  }, [answers, hintsUsed]);

  // -------------------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------------------
  const calculateScore = (): number => {
    // Implementar logica de calculo de score
    const totalAnswers = Object.keys(answers).length;
    if (totalAnswers === 0) return 0;
    // ... logica especifica
    return Math.min(100, Math.round((totalAnswers / getTotalSteps()) * 100));
  };

  const getTotalSteps = (): number => {
    // Retornar total de pasos/preguntas
    return exercise?.questions?.length || 5;
  };

  const isValidForSubmission = (): boolean => {
    // Validar que se puede enviar
    return Object.keys(answers).length >= getTotalSteps();
  };

  const handleHintUsed = (index: number) => {
    setHintsUsed(index + 1);
    recordHintUsed();
  };

  const handleSubmit = () => {
    if (!isValidForSubmission()) return;
    submit(answers);
  };

  const handleReset = () => {
    setAnswers({});
    setHintsUsed(0);
    setFeedback(null);
    setShowFeedback(false);
  };

  // -------------------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------------------
  return (
    <>
      <DetectiveCard variant="default" padding="lg">
        <div className="space-y-6">
          {/* Header del Ejercicio */}
          <div className="rounded-xl bg-gradient-to-r from-detective-blue to-detective-orange p-6 text-white">
            <h2 className="text-2xl font-bold">{exercise?.title || 'Ejercicio'}</h2>
            <p className="mt-2 opacity-90">{exercise?.instructions || 'Completa el ejercicio.'}</p>
          </div>

          {/* Sistema de Pistas */}
          {exercise?.hints && exercise.hints.length > 0 && (
            <HintSystem
              hints={exercise.hints}
              maxHints={3}
              onHintUsed={handleHintUsed}
            />
          )}

          {/* Contenido del Ejercicio */}
          <div className="space-y-4">
            {/* ... UI especifica del ejercicio ... */}
          </div>

          {/* Boton de Envio */}
          <div className="flex justify-end">
            <SubmitExerciseButton
              isSubmitting={isSubmitting}
              isSubmitted={isSuccess}
              onClick={handleSubmit}
              disabled={!isValidForSubmission()}
              label="Enviar Respuestas"
              variant="gold"
              size="lg"
            />
          </div>
        </div>
      </DetectiveCard>

      {/* Modal de Feedback */}
      {feedback && (
        <FeedbackModal
          isOpen={showFeedback}
          feedback={feedback}
          onClose={() => setShowFeedback(false)}
          onRetry={handleReset}
        />
      )}
    </>
  );
};

export default NombreEjercicio;
```

---

## 7. Checklist de Integracion

### Pre-implementacion

- [ ] Revisar tipo de ejercicio (automatico vs revision manual)
- [ ] Definir estructura de `answers` que espera el backend
- [ ] Identificar pistas necesarias y su costo
- [ ] Definir criterios de validacion para habilitar envio

### Componentes Obligatorios

- [ ] Usa `useExerciseSubmission` hook (no fetch manual)
- [ ] Usa `SubmitExerciseButton` (no botones custom)
- [ ] Usa `FeedbackModal` para mostrar resultados
- [ ] Implementa `onProgressUpdate` callback correctamente

### Feedback y Recompensas

- [ ] Muestra XP ganados (`xpEarned`) en feedback
- [ ] Muestra ML Coins ganados (`mlCoinsEarned`) en feedback
- [ ] Implementa `pendingReview: true` si es revision manual
- [ ] Usa `showConfetti: true` solo para puntaje perfecto

### Sistema de Pistas

- [ ] Implementa sistema de pistas (HintSystem o HintModal)
- [ ] Rastrea pistas usadas con `recordHintUsed()`
- [ ] Pasa `hintsUsed` en progress update

### Validaciones

- [ ] Boton deshabilitado cuando no es valido
- [ ] Maneja estado `isSubmitting` correctamente
- [ ] Maneja estado `isSubmitted` para evitar doble envio
- [ ] Maneja errores con feedback apropiado

### Estados de Revision Manual (M3-M5)

- [ ] Detecta `status === 'pending_review'`
- [ ] Detecta `requiresManualReview === true`
- [ ] Muestra mensaje apropiado de revision pendiente
- [ ] No muestra recompensas hasta que se evaluen

### Progreso y Persistencia

- [ ] Implementa auto-save si es ejercicio largo
- [ ] Restaura estado desde `initialData`
- [ ] Actualiza progreso en tiempo real

---

## 8. Errores Comunes y Soluciones

### 8.1 Recompensas No Se Muestran

**Problema:** El FeedbackModal no muestra XP o ML Coins.

**Causa:** No se pasan las propiedades `xpEarned` y `mlCoinsEarned`.

**Solucion:**
```tsx
// MAL
setFeedback({
  type: 'success',
  title: 'Completado',
  message: 'Buen trabajo',
});

// BIEN
setFeedback({
  type: 'success',
  title: 'Completado',
  message: 'Buen trabajo',
  score: result.score,
  xpEarned: result.rewards?.xp || 0,      // <-- Agregar
  mlCoinsEarned: result.rewards?.mlCoins || 0,  // <-- Agregar
});
```

### 8.2 Revision Manual No Se Detecta

**Problema:** Ejercicios M3-M5 no muestran mensaje de revision pendiente.

**Solucion:**
```tsx
// Verificar AMBOS campos
if (result.status === 'pending_review' || result.requiresManualReview) {
  setFeedback({
    type: 'info',
    title: 'Enviado',
    message: '...',
    pendingReview: true,  // <-- IMPORTANTE
  });
}
```

### 8.3 Doble Envio

**Problema:** Usuario puede enviar multiples veces.

**Solucion:**
```tsx
// Usar isSuccess del hook
<SubmitExerciseButton
  isSubmitting={isSubmitting}
  isSubmitted={isSuccess}  // <-- Esto deshabilita despues de enviar
  onClick={handleSubmit}
/>
```

### 8.4 Cache No Se Actualiza

**Problema:** Dashboard no refleja progreso despues de completar.

**Causa:** El hook `useExerciseSubmission` ya invalida cache automaticamente.

**Verificar:** Asegurar que se usa el hook correcto de `features/mechanics/shared/hooks/`.

### 8.5 Pistas No Se Registran

**Problema:** Pistas usadas no afectan recompensas.

**Solucion:**
```tsx
const { recordHintUsed } = useExerciseSubmission(exerciseId, {
  trackHints: true,  // <-- Habilitar tracking
});

const handleUseHint = () => {
  recordHintUsed();  // <-- Llamar cada vez que se usa pista
  // ... mostrar pista
};
```

---

## Referencias

- **SubmitExerciseButton:** `/home/isem/workspace-v2/projects/gamilit/apps/frontend/src/shared/components/mechanics/SubmitExerciseButton.tsx`
- **FeedbackModal:** `/home/isem/workspace-v2/projects/gamilit/apps/frontend/src/shared/components/mechanics/FeedbackModal.tsx`
- **HintSystem:** `/home/isem/workspace-v2/projects/gamilit/apps/frontend/src/shared/components/mechanics/HintSystem.tsx`
- **HintModal:** `/home/isem/workspace-v2/projects/gamilit/apps/frontend/src/apps/student/components/exercise/HintModal.tsx`
- **CompletionModal:** `/home/isem/workspace-v2/projects/gamilit/apps/frontend/src/apps/student/components/exercise/CompletionModal.tsx`
- **useExerciseSubmission:** `/home/isem/workspace-v2/projects/gamilit/apps/frontend/src/features/mechanics/shared/hooks/useExerciseSubmission.ts`
- **useExerciseRewards:** `/home/isem/workspace-v2/projects/gamilit/apps/frontend/src/features/exercises/hooks/useExerciseRewards.ts`
- **Ejemplo Referencia:** `/home/isem/workspace-v2/projects/gamilit/apps/frontend/src/features/mechanics/module4/VerificadorFakeNews/VerificadorFakeNewsExercise.tsx`

---

*Documento creado el 2026-01-20 como parte de la validacion de coherencia entre componentes compartidos y ejercicios.*
