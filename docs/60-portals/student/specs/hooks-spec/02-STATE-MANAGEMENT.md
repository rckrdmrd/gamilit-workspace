---
title: Student Portal Hooks — State Management
status: activo
last_updated: "2026-02-28"
---

## Categoria: State Management

### useExerciseState

**Archivo:** `hooks/useExerciseState.ts`
**Proposito:** Gestiona todo el estado de un ejercicio incluyendo envios, tiempo y persistencia en localStorage.

#### Parametros

| Nombre | Tipo | Requerido | Descripcion |
|--------|------|-----------|-------------|
| exerciseId | `string` | Si | ID del ejercicio |
| onSubmit | `(attempt: ExerciseAttempt) => void` | No | Callback al enviar |
| onComplete | `(attempt: ExerciseAttempt) => void` | No | Callback al completar |
| autoSave | `boolean` | No | Auto-guardar (default: true) |

#### Retorno

```typescript
interface UseExerciseStateReturn {
  // State
  state: ExerciseState;
  isSubmitting: boolean;
  hasUnsavedChanges: boolean;

  // Actions
  updateAnswers: (answers: any) => void;
  updateScore: (score: number) => void;
  useHint: () => void;
  activatePowerUp: (powerUpId: string) => void;
  deactivatePowerUp: (powerUpId: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  submitAttempt: (answers: any, score: number) => Promise<ExerciseAttempt>;
  resetExercise: () => void;
  clearState: () => void;
  saveToLocalStorage: () => void;

  // Computed values
  bestScore: number;
  averageScore: number;
  totalTimeSpent: number;
}

interface ExerciseState {
  currentAttempt: number;
  score: number;
  timeElapsed: number;
  hintsUsed: number;
  powerupsActive: string[];
  answers: any;
  isCompleted: boolean;
  attempts: ExerciseAttempt[];
}

interface ExerciseAttempt {
  id: string;
  score: number;
  completed: boolean;
  time_spent: number;
  hints_used: number;
  powerups_used: string[];
  submitted_at: Date;
  answers?: any;
}
```

#### Ejemplo de uso

```typescript
const {
  state,
  updateAnswers,
  submitAttempt,
  pauseTimer,
  resumeTimer,
  bestScore
} = useExerciseState({
  exerciseId: 'exercise-123',
  onComplete: (attempt) => {
    console.log('Completed with score:', attempt.score);
  }
});

// Actualizar respuestas
const handleChange = (questionId: string, answer: string) => {
  updateAnswers({ ...state.answers, [questionId]: answer });
};

// Enviar intento
const handleSubmit = async () => {
  const calculatedScore = calculateScore(state.answers);
  await submitAttempt(state.answers, calculatedScore);
};
```

#### Endpoints consumidos

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| - | - | Solo persistencia local (localStorage) |

#### Dependencias

- React hooks: `useState`, `useEffect`, `useCallback`, `useRef`
- `localStorage` para persistencia

#### Notas importantes

- El timer se inicia automaticamente al montar
- Auto-guarda cada 30 segundos si `autoSave=true`
- La key de storage es: `exercise_${exerciseId}_state`
- Restaura estado previo al montar

---

### useExerciseAutoSave

**Archivo:** `hooks/useExerciseAutoSave.ts`
**Proposito:** Auto-guarda progreso de ejercicios con debounce y recuperacion automatica.

#### Parametros

| Nombre | Tipo | Requerido | Descripcion |
|--------|------|-----------|-------------|
| exerciseId | `string` | Si | ID del ejercicio |
| enabled | `boolean` | No | Habilitar (default: true) |
| intervalMs | `number` | No | Intervalo auto-save (default: 30000) |
| debounceMs | `number` | No | Debounce (default: 2000) |
| onRecovered | `(data: AutoSaveProgressData) => void` | No | Callback al recuperar datos |
| onSaveSuccess | `(savedAt: Date) => void` | No | Callback save exitoso |
| onSaveError | `(error: Error) => void` | No | Callback error |

#### Retorno

```typescript
interface UseExerciseAutoSaveReturn {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt: Date | null;
  recoveredData: AutoSaveProgressData | null;
  error: string | null;
  saveProgress: (data: AutoSaveProgressData) => void;
  clearRecoveredData: () => void;
  clearAutoSave: () => Promise<void>;
  forceSave: (data: AutoSaveProgressData) => Promise<void>;
}

interface AutoSaveProgressData {
  partialAnswers: Record<string, any>;
  timeSpentSeconds: number;
  currentQuestionIndex?: number;
  // ... campos adicionales segun implementacion
}
```

#### Ejemplo de uso

```typescript
const {
  status,
  lastSavedAt,
  recoveredData,
  saveProgress,
  clearRecoveredData
} = useExerciseAutoSave({
  exerciseId: 'exercise-123',
  intervalMs: 30000,
  onRecovered: (data) => {
    setAnswers(data.partialAnswers);
  }
});

// Recuperar al montar
useEffect(() => {
  if (recoveredData) {
    setAnswers(recoveredData.partialAnswers);
    clearRecoveredData();
  }
}, [recoveredData]);

// Auto-guardar cuando cambian respuestas
useEffect(() => {
  if (answers) {
    saveProgress({
      partialAnswers: answers,
      timeSpentSeconds: timeSpent
    });
  }
}, [answers, timeSpent]);

// Mostrar indicador de estado
return (
  <SaveIndicator status={status} lastSaved={lastSavedAt} />
);
```

#### Endpoints consumidos

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | (via progressAPI) | Auto-guardar progreso |
| GET | (via progressAPI) | Recuperar progreso guardado |
| DELETE | (via progressAPI) | Limpiar progreso guardado |

#### Dependencias

- `autoSaveProgress`, `getAutoSavedProgress`, `clearAutoSavedProgress` de `@/features/progress/api/progressAPI`

---
