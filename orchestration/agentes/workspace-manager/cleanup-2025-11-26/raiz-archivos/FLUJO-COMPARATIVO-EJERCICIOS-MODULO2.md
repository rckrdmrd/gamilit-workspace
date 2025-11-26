# Documentación: Flujo Completo de Ejercicios del Módulo 2
## DetectiveTextualExercise (FUNCIONAL) vs LecturaInferencialExercise (INCOMPLETO)

**Fecha:** 2025-11-26  
**Contexto:** Análisis de por qué DetectiveTextual SÍ funciona con submitExercise() y LecturaInferencial NO

---

## 1. COMPARACIÓN VISUAL - FLUJO COMPLETO

### DetectiveTextualExercise (FUNCIONAL)
```
┌─────────────────────────────────────────────────────────────────┐
│                    Usuario interactúa                           │
│              (crea conexiones entre evidencias)                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│        handleSubmitSolution() [Línea 149-220]                  │
│                                                                   │
│  1. Valida que haya conexiones (línea 150)                       │
│  2. Valida usuario autenticado (línea 164)                       │
│  3. Prepara formato DTO: { connections: [...] } (línea 179)     │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│  submitExercise(exerciseId, userId, answers) [Línea 186]       │
│  IMPORTADO: from '@/features/progress/api/progressAPI'          │
│                                                                   │
│  POST /api/progress/submissions/submit                          │
│  Payload: { userId, exerciseId, answers: {...} }               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│               Backend Processing                                 │
│                                                                   │
│  ✓ Valida respuestas                                            │
│  ✓ Calcula puntaje (0-100)                                      │
│  ✓ Genera rewards (mlCoins, XP, bonuses)                        │
│  ✓ Desbloquea achievements                                      │
│  ✓ Actualiza ranking                                            │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│    SubmitExerciseResponse (progressAPI.ts:35-76)               │
│                                                                   │
│  {                                                               │
│    attemptId: string                                            │
│    score: number (0-100)                        ← IMPORTANTE    │
│    isPerfect: boolean                           ← IMPORTANTE    │
│    rewards: {                                                    │
│      mlCoins: number                                            │
│      xp: number                                                 │
│      bonuses: {...}                                             │
│    }                                                             │
│    feedback: {...}                                              │
│    achievements?: [...]                                         │
│    rankUp?: {...}                                               │
│  }                                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│       setFeedback() [Línea 189-201]                             │
│                                                                   │
│  Muestra modal con:                                              │
│  - Tipo: 'success', 'partial', o 'error'                        │
│  - Score del backend                                             │
│  - Rewards (mlCoins, XP)                                        │
│  - Feedback del servidor                                        │
│  - Confetti si isPerfect = true                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│   FeedbackModal cierra → onComplete() [Línea 325-327]          │
│                                                                   │
│  if (feedback.type === 'success' && onComplete) {               │
│    onComplete(progress.score, progress.timeSpent)              │
│  }                                                               │
│                                                                   │
│  → ExercisePage actualiza estado                               │
│  → Navega a siguiente ejercicio/módulo                          │
│  → Stores se actualizan con rewards                             │
└─────────────────────────────────────────────────────────────────┘
```

### LecturaInferencialExercise (INCOMPLETO)
```
┌─────────────────────────────────────────────────────────────────┐
│              Usuario selecciona respuestas                       │
│                (multiple choice)                                 │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│        handleCheck() [Línea 63-133]                             │
│                                                                   │
│  1. Valida todas las preguntas respondidas (línea 88-97)        │
│  2. Calcula correctas LOCALMENTE (línea 100-118)                │
│  3. Calcula score LOCALMENTE (línea 117)                        │
│  4. Muestra modal con feedback LOCAL (línea 120-131)            │
│                                                                   │
│  ❌ NO llama submitExercise()                                    │
│  ❌ NO envía al backend                                          │
│  ❌ NO hay validación del servidor                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│   setFeedback() [Línea 120-131]                                 │
│                                                                   │
│  Muestra modal CON:                                              │
│  - Score calculado LOCALMENTE                                    │
│  - Tipo: 'success', 'partial', o 'error'                        │
│                                                                   │
│  PERO SIN:                                                       │
│  ❌ Rewards (mlCoins, XP)                                        │
│  ❌ Validación de servidor                                       │
│  ❌ Anti-cheating                                                │
│  ❌ Achievements unlock                                          │
│  ❌ Ranking update                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│   FeedbackModal cierra → onComplete() [Línea 342-345]          │
│                                                                   │
│  if (feedback.type === 'success' && onComplete) {               │
│    const timeSpent = ...                                        │
│    onComplete(feedback.score || 0, timeSpent)                  │
│  }                                                               │
│                                                                   │
│  → ExercisePage recibe score LOCAL (sin validación)            │
│  → NO actualiza rewards en stores (nunca fueron ganados)       │
│  → Usuario ve puntos falsos                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. TABLA COMPARATIVA DETALLADA

| Aspecto | DetectiveTextual | LecturaInferencial | Estado |
|---------|------------------|-------------------|--------|
| **Importa submitExercise** | ✓ Línea 17 | ✗ NO | Falta |
| **useAuth hook** | ✓ Línea 18 | ✗ NO | Falta |
| **Valida usuario autenticado** | ✓ Línea 164 | ✗ NO | Falta |
| **Prepara DTO payload** | ✓ Línea 179-183 | ✗ NO | Falta |
| **Llama submitExercise()** | ✓ Línea 186 | ✗ NO | CRÍTICO |
| **Envía POST a backend** | ✓ progressAPI:385 | ✗ NO | CRÍTICO |
| **Recibe SubmitExerciseResponse** | ✓ Línea 186 | ✗ NO | CRÍTICO |
| **Score viene del backend** | ✓ response.score | ✗ Score local | CRÍTICO |
| **Rewards (mlCoins, XP)** | ✓ response.rewards | ✗ No hay rewards | CRÍTICO |
| **Valida isPerfect** | ✓ response.isPerfect | ✗ NO (local) | Falta |
| **Feedback del servidor** | ✓ response.feedback | ✗ NO (local) | Falta |
| **Achievements unlock** | ✓ response.achievements | ✗ NO | Falta |
| **Rank up celebration** | ✓ response.rankUp | ✗ NO | Falta |
| **Error handling** | ✓ try-catch 176-219 | ✗ Mínimo | Falta |
| **onComplete() callback** | ✓ Línea 325-327 | ✓ Línea 342-345 | OK (pero con datos falsos) |
| **showConfetti** | ✓ response.isPerfect | ✗ percentage >= 70 | Diferente |

---

## 3. LÍNEAS DE CÓDIGO FALTANTES EN LecturaInferencial

### 3.1 Imports Faltantes (al inicio del archivo)
```typescript
// FALTA:
import { submitExercise } from '@/features/progress/api/progressAPI';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { SubmitExerciseResponse } from '@/features/progress/api/progressAPI';
```

**Localización actual:** Línea 1-7 de LecturaInferencial  
**Debería estar:** Mismo lugar

---

### 3.2 Hook useAuth Faltante (en el componente)
```typescript
// FALTA en LecturaInferencialExercise() - después de destructuring de props
const { user } = useAuth();  // ← AÑADIR LÍNEA 14-15
```

**Localización actual:** Línea 9-14 (después de destructuring de props)  
**Debería estar:** Línea 14-15 (como en DetectiveTextual:27)

---

### 3.3 Estado para isSubmitting Faltante
```typescript
// FALTA:
const [isSubmitting, setIsSubmitting] = useState(false);  // Para bloquear botón
```

**Localización actual:** Línea 20 (después de useState declarations)  
**Debería estar:** Línea 20-21

---

### 3.4 Refactorizar handleCheck() a handleSubmit()

**Problema:** `handleCheck()` solo valida localmente y no llama submitExercise()

**Cambios necesarios en handleCheck (línea 63-133):**

```typescript
// VERSIÓN ACTUAL (LÍNEA 63-133) - ROMPE AQUÍ
const handleCheck = useCallback(() => {
  if (validated) {
    // Already validated, show results again
    const correctAnswers = answers.filter((a) => a.isCorrect).length;
    const totalQuestions = questions.length;
    const finalScore = calculateScore(correctAnswers, totalQuestions);
    // ... muestra feedback local ...
    return;
  }

  // Validate all answers LOCALLY
  const validatedAnswers: QuestionAnswer[] = questions.map((q) => {
    const selectedOption = selectedAnswers[q.id];
    const isCorrect = selectedOption === q.correctAnswer;
    return {
      questionId: q.id,
      selectedOption,
      isCorrect,  // ← PROBLEMA: Esto se calcula sin validación del servidor
      timeSpent: Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
    };
  });

  setAnswers(validatedAnswers);
  setValidated(true);

  // Show final results
  const correctAnswers = validatedAnswers.filter((a) => a.isCorrect).length;
  // ... muestra feedback local ...
}, [selectedAnswers, validated, answers, questions, startTime]);


// VERSIÓN CORRECTA - DEBERÍA SER:
const handleCheck = useCallback(async () => {
  if (validated) {
    // Ya validado, mostrar resultados de nuevo
    const correctAnswers = answers.filter((a) => a.isCorrect).length;
    const totalQuestions = questions.length;
    const finalScore = calculateScore(correctAnswers, totalQuestions);
    // ... keep existing feedback logic ...
    return;
  }

  // Validar que todas las preguntas estén respondidas
  const answeredCount = Object.keys(selectedAnswers).length;
  if (answeredCount < questions.length) {
    setFeedback({
      type: 'error',
      title: 'Faltan preguntas por responder',
      message: `Has respondido ${answeredCount} de ${questions.length} preguntas.`,
    });
    setShowFeedback(true);
    return;
  }

  // Validar que usuario está autenticado
  if (!user?.id) {
    setFeedback({
      type: 'error',
      title: 'Error de Autenticación',
      message: 'Debes estar autenticado para enviar el ejercicio.',
    });
    setShowFeedback(true);
    return;
  }

  setIsSubmitting(true);

  try {
    // Preparar respuestas en formato DTO del backend
    const userAnswers: Record<string, string> = {};
    Object.entries(selectedAnswers).forEach(([questionId, optionIndex]) => {
      userAnswers[questionId] = String(optionIndex);
    });

    // CRÍTICO: Enviar al backend para validación y rewards
    const response = await submitExercise(exerciseId, user.id, { questions: userAnswers });

    // Marcar como validado
    setValidated(true);

    // Mostrar feedback DEL SERVIDOR (no local)
    setFeedback({
      type: response.isPerfect ? 'success' : response.score >= 70 ? 'partial' : 'error',
      title: response.isPerfect
        ? '¡Perfecto!'
        : response.score >= 70
          ? '¡Buen trabajo!'
          : 'Intenta de nuevo',
      message: response.feedback?.overall || 
        `Respondiste correctamente ${response.correctAnswersCount} de ${response.totalQuestions} preguntas.`,
      score: response.score,  // ← Del servidor, no local
      showConfetti: response.isPerfect,  // ← Del servidor
    });

    // Guardar respuestas validadas
    const validatedAnswers: QuestionAnswer[] = questions.map((q) => {
      const selectedOption = selectedAnswers[q.id];
      return {
        questionId: q.id,
        selectedOption,
        // isCorrect viene del servidor ahora
        isCorrect: response.feedback?.answerReview?.find(a => a.questionId === q.id)?.isCorrect || false,
        timeSpent: Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
      };
    });

    setAnswers(validatedAnswers);
    setShowFeedback(true);

    console.log('✅ [LecturaInferencial] Submission successful:', {
      attemptId: response.attemptId,
      score: response.score,
      rewards: response.rewards,
    });
  } catch (error) {
    console.error('❌ [LecturaInferencial] Submission error:', error);
    setFeedback({
      type: 'error',
      title: 'Error al Enviar',
      message: 'Hubo un problema al enviar tu respuesta. Por favor, intenta nuevamente.',
    });
    setShowFeedback(true);
  } finally {
    setIsSubmitting(false);
  }
}, [selectedAnswers, validated, answers, questions, startTime, user, exerciseId]);
```

---

### 3.5 Actualizar FeedbackModal onClose (línea 340-346)

**Actual:**
```typescript
{feedback && (
  <FeedbackModal
    isOpen={showFeedback}
    feedback={feedback}
    onClose={() => {
      setShowFeedback(false);
      if (feedback.type === 'success' && onComplete) {
        const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
        onComplete(feedback.score || 0, timeSpent);
      }
    }}
    onRetry={() => {
      setShowFeedback(false);
      handleReset();
    }}
  />
)}
```

**Debería ser:** (Igual que DetectiveTextual)
```typescript
{feedback && (
  <FeedbackModal
    isOpen={showFeedback}
    feedback={feedback}
    onClose={() => {
      setShowFeedback(false);
      if (feedback.type === 'success' && onComplete) {
        const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
        onComplete(feedback.score || 0, timeSpent);  // ← Ahora score VIENE del servidor
      }
    }}
    onRetry={() => {
      setShowFeedback(false);
      handleReset();
    }}
  />
)}
```

---

## 4. RESUMEN DE CAMBIOS NECESARIOS

### 4.1 Cambios en Imports (Línea 1-7)
```diff
  import React, { useState, useEffect, useCallback } from 'react';
  import { motion } from 'framer-motion';
  import { BookOpen, CheckCircle, XCircle } from 'lucide-react';
  import { DetectiveCard } from '@shared/components/base/DetectiveCard';
  import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
  import { calculateScore, FeedbackData } from '@shared/components/mechanics/mechanicsTypes';
  import type { LecturaInferencialExerciseProps, QuestionAnswer } from './lecturaInferencialTypes';
  
+ import { submitExercise } from '@/features/progress/api/progressAPI';
+ import { useAuth } from '@/features/auth/hooks/useAuth';
```

### 4.2 Cambios en Props Destructuring (Línea 9-14)
```diff
  export const LecturaInferencialExercise: React.FC<LecturaInferencialExerciseProps> = ({
    exercise,
    onComplete,
    onProgressUpdate,
    actionsRef,
  }) => {
+   const { user } = useAuth();
```

### 4.3 Cambios en State (Línea 15-20)
```diff
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [validated, setValidated] = useState(false);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [startTime] = useState(new Date());
  
+ const [isSubmitting, setIsSubmitting] = useState(false);
```

### 4.4 Cambios en handleCheck() (líneas 63-133)
- Cambiar a `async`
- Añadir validación de usuario autenticado
- Llamar a `submitExercise()` con respuestas en DTO format
- Usar `response.isPerfect`, `response.score`, `response.rewards` del servidor
- Mantener try-catch con proper error handling

### 4.5 Actualizar actionsRef (línea 144-151)
```diff
  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        handleReset,
        handleCheck,
      };
    }
  }, [actionsRef, handleReset, handleCheck]);
```
No necesita cambios - ya está correcto.

---

## 5. COMPARACIÓN DE PAYLOADS

### DetectiveTextual Payload (detectiveTextualExercise.tsx:179-186)
```typescript
const connectionsData = progress.connections.map((conn) => ({
  from: conn.fromEvidenceId,
  to: conn.toEvidenceId,
  relationship: conn.relationship,
}));

const response = await submitExercise(exerciseId, user.id, { 
  connections: connectionsData  // ← El "answers" parameter
});
```

**Backend recibe:**
```json
{
  "userId": "user123",
  "exerciseId": "exercise456",
  "answers": {
    "connections": [
      { "from": "ev1", "to": "ev2", "relationship": "causa" },
      { "from": "ev2", "to": "ev3", "relationship": "contradice" }
    ]
  }
}
```

### LecturaInferencial Payload (DEBE SER)
```typescript
const userAnswers: Record<string, string> = {};
Object.entries(selectedAnswers).forEach(([questionId, optionIndex]) => {
  userAnswers[questionId] = String(optionIndex);
});

const response = await submitExercise(exerciseId, user.id, { 
  questions: userAnswers  // ← El "answers" parameter
});
```

**Backend recibe:**
```json
{
  "userId": "user123",
  "exerciseId": "exercise456",
  "answers": {
    "questions": {
      "q1": "0",
      "q2": "2",
      "q3": "1"
    }
  }
}
```

---

## 6. FLUJO DE ExercisePage CON AMBOS EJERCICIOS

### Cuando se llama onProgressUpdate (ExercisePage.tsx:482-501)

**DetectiveTextual:**
```typescript
// ExercisePage.tsx línea 482-501
const handleProgressUpdate = React.useCallback(
  (update: Partial<ExerciseProgress> | ProgressUpdate) => {
    // Check if this is the new format (object with progress + answers)
    if (update && typeof update === 'object' && 'progress' in update && 'answers' in update) {
      const progressUpdate = update as ProgressUpdate;
      setProgress((prev) => ({ ...prev, ...progressUpdate.progress }));
      setUserAnswers(progressUpdate.answers);  // ← GUARDAMOS RESPUESTAS REALES
      console.log('📤 [ExercisePage] Progress update received:', {
        progress: progressUpdate.progress,
        answersReceived: !!progressUpdate.answers,
      });
    }
  },
  [],
);
```

**LecturaInferencial SÍ ESTÁ ENVIANDO correctamente:**
```typescript
// LecturaInferencial línea 25-52
useEffect(() => {
  if (onProgressUpdate) {
    const answeredCount = Object.keys(selectedAnswers).length;

    // Prepare user answers in backend DTO format
    const userAnswers: Record<string, string> = {};
    Object.entries(selectedAnswers).forEach(([questionId, optionIndex]) => {
      userAnswers[questionId] = String(optionIndex);
    });

    onProgressUpdate({
      progress: {
        currentStep: answeredCount,
        totalSteps: questions.length,
        score: 0, // FE-059: Score calculated by backend only
        hintsUsed: 0,
        timeSpent: Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
      },
      answers: { questions: userAnswers }, // ← ENVIANDO FORMATO CORRECTO
    });
  }
}, [selectedAnswers, validated, startTime, onProgressUpdate, questions.length]);
```

**PERO cuando envía el formulario:**
```typescript
// ExercisePage.tsx línea 372-405 - handleSubmit()
const handleSubmit = async () => {
  if (!exerciseId) return;

  // FE-055: Validate that we have user answers before submitting
  if (!userAnswers) {
    console.error('❌ [ExercisePage] Cannot submit: No user answers available');
    // ... error ...
  }

  try {
    // FE-055: Submit exercise with REAL user answers (not progress metadata)
    const result = await submitExercise(exerciseId, {
      answers: userAnswers, // ← RESPUESTAS DEL onProgressUpdate
      startedAt: startTime.getTime(),
      hintsUsed: progress.hintsUsed || 0,
      powerupsUsed: progress.powerupsUsed || [],
    });
```

**PROBLEMA:** ExercisePage espera que submitExercise() TAMBIÉN sea llamado desde el componente mecánico, pero:
- DetectiveTextual SÍ lo llama (línea 186) ✓
- LecturaInferencial NO lo llama ✗

---

## 7. CRONOLOGÍA DE EVENTOS - VISTA COMPLETA

### DetectiveTextual (CORRECTO)
```
1. Usuario hace click en "Verificar"
   └→ handleSubmitSolution() [línea 149]
   
2. Valida condiciones locales
   └→ if (!hasConnections || !hasDiscoveredEvidence) → error modal
   └→ if (!user?.id) → error modal
   
3. Prepara DTO del ejercicio
   └→ connectionsData = [...] [línea 179-183]
   
4. ENVÍA AL BACKEND
   └→ await submitExercise(exerciseId, user.id, { connections })  [línea 186]
   
5. Recibe SubmitExerciseResponse del servidor
   └→ response.score (0-100)
   └→ response.isPerfect
   └→ response.rewards { mlCoins, xp, bonuses }
   └→ response.feedback { overall, answerReview }
   └→ response.achievements[]
   └→ response.rankUp
   
6. Muestra feedback del servidor
   └→ setFeedback({ score: response.score, ... }) [línea 189-201]
   
7. Modal cierra → onComplete()
   └→ onComplete(progress.score, progress.timeSpent) [línea 326]
   └→ ExercisePage actualiza state con score del servidor
   └→ Rewards ya fueron procesados por backend
```

### LecturaInferencial (INCORRECTO)
```
1. Usuario hace click en "Verificar"
   └→ handleCheck() [línea 63]
   
2. Valida que todas las preguntas estén respondidas
   └→ if (answeredCount < questions.length) → error modal
   
3. Calcula LOCALMENTE correctness de respuestas
   └→ validatedAnswers = questions.map(...) [línea 100-109]
   └→ const isCorrect = selectedOption === q.correctAnswer [línea 102]
   
4. Calcula score LOCALMENTE
   └→ finalScore = calculateScore(correctAnswers, totalQuestions) [línea 117]
   
5. ❌ NO ENVÍA AL BACKEND
   └→ submitExercise() NUNCA es llamado
   └→ No hay validación del servidor
   └→ No hay rewards generados
   └→ No hay achievements desbloquedos
   └→ No hay ranking actualizado
   
6. Muestra feedback LOCAL
   └→ setFeedback({ score: finalScore, ... }) [línea 120-131]
   └→ Score es CALCULADO LOCALMENTE sin validación
   
7. Modal cierra → onComplete()
   └→ onComplete(feedback.score || 0, timeSpent) [línea 344]
   └→ ExercisePage recibe score LOCAL (FALSO)
   └→ Rewards nunca fueron generados (usuario estafado)
```

---

## 8. IMPACTO EN USUARIO

### DetectiveTextual
- ✓ Respuestas validadas por backend
- ✓ Score confiable (anti-cheating)
- ✓ Rewards ganados (mlCoins, XP)
- ✓ Achievements desbloqueados
- ✓ Ranking actualizado
- ✓ Experiencia de juego completa

### LecturaInferencial
- ✗ Respuestas NO validadas
- ✗ Score calculado localmente (user puede engañar)
- ✗ NO hay rewards generados
- ✗ NO hay achievements desbloqueados
- ✗ NO hay ranking actualizado
- ✗ Experiencia de juego ROTA

---

## 9. CHECKSUM DE CAMBIOS NECESARIOS

| Línea | Cambio | Tipo | Prioridad |
|-------|--------|------|-----------|
| 1-7 | Importar submitExercise, useAuth | Import | CRÍTICO |
| 14-15 | Añadir useAuth hook | Hook | CRÍTICO |
| 19-20 | Añadir isSubmitting state | State | CRÍTICO |
| 63-133 | Refactorizar handleCheck → async + submitExercise | Logic | CRÍTICO |
| 63 | Cambiar a `const handleCheck = useCallback(async () => {` | Syntax | CRÍTICO |
| 174-180 | Añadir user validation | Validation | CRÍTICO |
| 181-193 | Añadir try-catch y submitExercise call | Logic | CRÍTICO |
| 194-215 | Usar response del backend para feedback | UI | CRÍTICO |
| 266-272 | Actualizar dependencies del useCallback | Hooks | CRÍTICO |

---

## 10. ARCHIVOS AFECTADOS

```
PRIMARY (debe modificarse):
├─ apps/frontend/src/features/mechanics/module2/LecturaInferencial/LecturaInferencialExercise.tsx

DEPENDENCIES (NO modificar - estos están correctos):
├─ apps/frontend/src/features/progress/api/progressAPI.ts (submitExercise exists)
├─ apps/frontend/src/apps/student/pages/ExercisePage.tsx (handleProgressUpdate correct)
├─ apps/frontend/src/features/mechanics/module2/DetectiveTextual/DetectiveTextualExercise.tsx (reference impl)

RELATED (revisar pero no crítico):
├─ apps/frontend/src/features/missions/store/missionsStore.ts
├─ apps/frontend/src/shared/types/progress.types.ts
```

---

## 11. EVIDENCE FROM CODE

### Línea 17 (DetectiveTextual) - submitExercise IS IMPORTED
```typescript
import { submitExercise } from '@/features/progress/api/progressAPI';
```

### Línea 186 (DetectiveTextual) - submitExercise IS CALLED
```typescript
const response = await submitExercise(exerciseId, user.id, { connections: connectionsData });
```

### Línea 1-7 (LecturaInferencial) - submitExercise NOT IMPORTED ❌
```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { calculateScore, FeedbackData } from '@shared/components/mechanics/mechanicsTypes';
import type { LecturaInferencialExerciseProps, QuestionAnswer } from './lecturaInferencialTypes';
// ❌ FALTA submitExercise
// ❌ FALTA useAuth
```

### Línea 100-109 (LecturaInferencial) - LOCAL VALIDATION ONLY ❌
```typescript
const validatedAnswers: QuestionAnswer[] = questions.map((q) => {
  const selectedOption = selectedAnswers[q.id];
  const isCorrect = selectedOption === q.correctAnswer;  // ← LOCAL VALIDATION
  return {
    questionId: q.id,
    selectedOption,
    isCorrect,  // ← SIN VALIDACIÓN DEL SERVIDOR
    timeSpent: Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
  };
});
```

### Línea 117 (LecturaInferencial) - LOCAL SCORE CALCULATION ❌
```typescript
const finalScore = calculateScore(correctAnswers, totalQuestions);  // ← LOCAL
```

---

## 12. PRUEBA DE CONCEPTO - Qué Debería Pasar

### Test Case: Usuario responde 3 de 3 preguntas correctas

**DetectiveTextual:**
1. Usuario hace click "Verificar"
2. submitExercise() → Backend
3. Backend valida: 3/3 correctas = 100 puntos
4. Backend genera: +30 mlCoins, +150 XP
5. Backend unlocks: "Perfecto" achievement
6. Backend returns: `{ score: 100, isPerfect: true, rewards: {...}, achievements: [...] }`
7. Modal muestra: "¡Perfecto! +150 XP, +30 ML Coins"
8. Usuario recibe rewards reales

**LecturaInferencial (ACTUAL):**
1. Usuario hace click "Verificar"
2. handleCheck() calcula localmente: 3/3 = 100 puntos ✓
3. ❌ submitExercise() NO se llama
4. ❌ Backend NO valida
5. ❌ Backend NO genera rewards
6. ❌ Usuario NO recibe rewards
7. Modal muestra: "¡Excelente!" pero sin rewards

**LecturaInferencial (DESPUÉS DE CORRECCIÓN):**
1. Usuario hace click "Verificar"
2. submitExercise() → Backend
3. Backend valida: 3/3 correctas = 100 puntos
4. Backend genera: +30 mlCoins, +150 XP
5. Backend unlocks: "Perfecto" achievement
6. Backend returns: `{ score: 100, isPerfect: true, rewards: {...}, achievements: [...] }`
7. Modal muestra: "¡Excelente! +150 XP, +30 ML Coins"
8. Usuario recibe rewards reales ✓

---

## CONCLUSIÓN

**LecturaInferencialExercise no funciona completamente porque:**

1. **No importa submitExercise()** - No hay forma de enviar al backend
2. **No obtiene user ID** - No usa useAuth hook
3. **Valida localmente** - Cálculos sin verificación del servidor
4. **No hay rewards** - Backend nunca procesa la respuesta
5. **Score es falso** - Calculado localmente sin validación

**La solución es:**
- Importar submitExercise y useAuth (2 líneas)
- Hacer handleCheck async (1 palabra)
- Añadir validación de usuario (5 líneas)
- Llamar submitExercise() (3 líneas)
- Usar response del servidor para feedback (10 líneas)

**Esfuerzo estimado:** 30 minutos
**Complejidad:** Baja (copy-paste de DetectiveTextual + adaptaciones menores)

