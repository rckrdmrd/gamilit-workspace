# Stores de Contenido Educativo - GAMILIT Platform v2

**Dominio:** Módulos, ejercicios y progreso académico
**Total de Stores:** 3
**Persistencia:** Ninguno

---

## 1. moduleStore

**Ubicación:** `/src/features/education/store/moduleStore.ts`
**Persistencia:** ❌ No

### Responsabilidad

- Catálogo de módulos educativos
- Información de módulos
- Módulos desbloqueados por usuario
- Progreso general de módulos

### State Shape

```typescript
interface ModuleState {
  // State
  modules: Module[];
  currentModule: Module | null;
  unlockedModules: string[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchModules: () => Promise<void>;
  fetchModuleById: (moduleId: string) => Promise<void>;
  unlockModule: (moduleId: string) => void;
  isModuleUnlocked: (moduleId: string) => boolean;
  getNextModule: (currentModuleId: string) => Module | null;
}

interface Module {
  id: string;
  title: string;
  description: string;
  orderIndex: number;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  xpReward: number;
  mlCoinsReward: number;
  prerequisites: string[]; // IDs de módulos prerequisito
  exercises: Exercise[];
  isLocked: boolean;
  completionRate: number; // 0-100
}
```

### Implementación

```typescript
export const useModuleStore = create<ModuleState>()((set, get) => ({
  modules: [],
  currentModule: null,
  unlockedModules: [],
  isLoading: false,
  error: null,

  fetchModules: async () => {
    set({ isLoading: true, error: null });

    try {
      const modules = await modulesAPI.getAll();
      set({ modules, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchModuleById: async (moduleId) => {
    set({ isLoading: true, error: null });

    try {
      const module = await modulesAPI.getById(moduleId);
      set({ currentModule: module, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  unlockModule: (moduleId) => {
    set((state) => ({
      unlockedModules: [...new Set([...state.unlockedModules, moduleId])],
      modules: state.modules.map((m) =>
        m.id === moduleId ? { ...m, isLocked: false } : m
      ),
    }));
  },

  isModuleUnlocked: (moduleId) => {
    return get().unlockedModules.includes(moduleId);
  },

  getNextModule: (currentModuleId) => {
    const modules = get().modules;
    const currentModule = modules.find((m) => m.id === currentModuleId);
    if (!currentModule) return null;

    const nextModule = modules.find(
      (m) => m.orderIndex === currentModule.orderIndex + 1
    );
    return nextModule || null;
  },
}));
```

### Uso en Componentes

```typescript
// Componente de lista de módulos
const ModulesListComponent = () => {
  const { modules, fetchModules, isLoading } = useModuleStore();
  const isModuleUnlocked = useModuleStore((state) => state.isModuleUnlocked);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="modules-grid">
      {modules.map((module) => (
        <ModuleCard
          key={module.id}
          module={module}
          isUnlocked={isModuleUnlocked(module.id)}
        />
      ))}
    </div>
  );
};
```

---

## 2. exerciseStore

**Ubicación:** `/src/features/education/store/exerciseStore.ts`
**Persistencia:** ❌ No

### Responsabilidad

- Catálogo de ejercicios
- Estado de ejercicio actual
- Respuestas del usuario
- Envío de ejercicios

### State Shape

```typescript
interface ExerciseState {
  // State
  exercises: Exercise[];
  currentExercise: Exercise | null;
  userAnswers: Record<string, any>;
  attemptStartTime: number | null;
  isSubmitting: boolean;
  submitResult: SubmitResult | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchExercises: (moduleId: string) => Promise<void>;
  loadExercise: (exerciseId: string) => Promise<void>;
  updateAnswer: (questionId: string, answer: any) => void;
  submitExercise: () => Promise<SubmitResult>;
  resetExercise: () => void;
  getExerciseAttempts: (exerciseId: string) => Promise<ExerciseAttempt[]>;
}

interface Exercise {
  id: string;
  moduleId: string;
  title: string;
  type: ExerciseType;
  config: ExerciseConfig;
  content: any; // JSON específico del tipo de ejercicio
  xpReward: number;
  mlCoinsReward: number;
  maxAttempts: number;
  attemptsUsed: number;
  comodinesAllowed: string[];
}

interface SubmitResult {
  score: number;
  mlCoinsEarned: number;
  xpEarned: number;
  correctAnswers: number;
  totalQuestions: number;
  feedback: string;
  bonuses?: {
    timeBonus: number;
    accuracyBonus: number;
  };
}
```

### Implementación

```typescript
export const useExerciseStore = create<ExerciseState>()((set, get) => ({
  exercises: [],
  currentExercise: null,
  userAnswers: {},
  attemptStartTime: null,
  isSubmitting: false,
  submitResult: null,
  isLoading: false,
  error: null,

  fetchExercises: async (moduleId) => {
    set({ isLoading: true, error: null });

    try {
      const exercises = await exercisesAPI.getByModule(moduleId);
      set({ exercises, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  loadExercise: async (exerciseId) => {
    set({ isLoading: true, error: null });

    try {
      const exercise = await exercisesAPI.getById(exerciseId);
      set({
        currentExercise: exercise,
        userAnswers: {},
        attemptStartTime: Date.now(),
        submitResult: null,
        isLoading: false,
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateAnswer: (questionId, answer) => {
    set((state) => ({
      userAnswers: {
        ...state.userAnswers,
        [questionId]: answer,
      },
    }));
  },

  submitExercise: async () => {
    const { currentExercise, userAnswers, attemptStartTime } = get();

    if (!currentExercise || !attemptStartTime) {
      throw new Error('No exercise loaded');
    }

    set({ isSubmitting: true });

    try {
      const timeSpent = (Date.now() - attemptStartTime) / 1000; // segundos

      const result = await exercisesAPI.submit({
        exerciseId: currentExercise.id,
        answers: userAnswers,
        timeSpent,
      });

      // Actualizar economía y rangos
      if (result.mlCoinsEarned > 0) {
        useEconomyStore.getState().addCoins(
          result.mlCoinsEarned,
          'exercise_completion'
        );
      }

      if (result.xpEarned > 0) {
        useRanksStore.getState().addXP(
          result.xpEarned,
          'exercise_completion'
        );
      }

      set({
        submitResult: result,
        isSubmitting: false,
      });

      return result;
    } catch (error) {
      set({
        error: error.message,
        isSubmitting: false,
      });
      throw error;
    }
  },

  resetExercise: () => {
    set({
      currentExercise: null,
      userAnswers: {},
      attemptStartTime: null,
      submitResult: null,
    });
  },

  getExerciseAttempts: async (exerciseId) => {
    const attempts = await exercisesAPI.getAttempts(exerciseId);
    return attempts;
  },
}));
```

### Hook personalizado para ejercicios

```typescript
// features/education/hooks/useExercise.ts
export const useExercise = (exerciseId: string) => {
  const {
    currentExercise,
    loadExercise,
    updateAnswer,
    submitExercise,
    resetExercise,
    isLoading,
    isSubmitting,
    submitResult,
  } = useExerciseStore();

  useEffect(() => {
    loadExercise(exerciseId);

    return () => {
      resetExercise();
    };
  }, [exerciseId]);

  return {
    exercise: currentExercise,
    updateAnswer,
    submitExercise,
    isLoading,
    isSubmitting,
    submitResult,
  };
};
```

---

## 3. progressStore

**Ubicación:** `/src/features/education/store/progressStore.ts`
**Persistencia:** ❌ No

### Responsabilidad

- Progreso general del estudiante
- Estadísticas de aprendizaje
- Historial de completación
- Métricas de desempeño

### State Shape

```typescript
interface ProgressState {
  // State
  overallProgress: OverallProgress;
  moduleProgress: Record<string, ModuleProgress>;
  recentActivity: Activity[];
  stats: LearningStats;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProgress: () => Promise<void>;
  fetchModuleProgress: (moduleId: string) => Promise<void>;
  updateProgress: (moduleId: string, exerciseId: string, score: number) => void;
  getCompletionPercentage: () => number;
  getWeeklyActivity: () => WeeklyActivity[];
}

interface OverallProgress {
  totalModules: number;
  completedModules: number;
  totalExercises: number;
  completedExercises: number;
  averageScore: number;
  totalTimeSpent: number; // minutos
  streak: number; // días consecutivos
  lastActive: Date;
}

interface ModuleProgress {
  moduleId: string;
  completedExercises: number;
  totalExercises: number;
  averageScore: number;
  timeSpent: number;
  completionRate: number; // 0-100
  isCompleted: boolean;
  completedAt?: Date;
}

interface Activity {
  id: string;
  type: 'exercise_completed' | 'module_completed' | 'achievement_unlocked';
  timestamp: Date;
  details: {
    title: string;
    score?: number;
    mlCoinsEarned?: number;
    xpEarned?: number;
  };
}

interface LearningStats {
  totalScore: number;
  averageAccuracy: number;
  fastestCompletion: number;
  perfectScores: number;
  improvementRate: number;
}
```

### Implementación

```typescript
export const useProgressStore = create<ProgressState>()((set, get) => ({
  overallProgress: {
    totalModules: 0,
    completedModules: 0,
    totalExercises: 0,
    completedExercises: 0,
    averageScore: 0,
    totalTimeSpent: 0,
    streak: 0,
    lastActive: new Date(),
  },
  moduleProgress: {},
  recentActivity: [],
  stats: {
    totalScore: 0,
    averageAccuracy: 0,
    fastestCompletion: 0,
    perfectScores: 0,
    improvementRate: 0,
  },
  isLoading: false,
  error: null,

  fetchProgress: async () => {
    set({ isLoading: true, error: null });

    try {
      const [overallProgress, recentActivity, stats] = await Promise.all([
        progressAPI.getOverall(),
        progressAPI.getRecentActivity(),
        progressAPI.getStats(),
      ]);

      set({
        overallProgress,
        recentActivity,
        stats,
        isLoading: false,
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchModuleProgress: async (moduleId) => {
    try {
      const progress = await progressAPI.getModuleProgress(moduleId);
      set((state) => ({
        moduleProgress: {
          ...state.moduleProgress,
          [moduleId]: progress,
        },
      }));
    } catch (error) {
      set({ error: error.message });
    }
  },

  updateProgress: (moduleId, exerciseId, score) => {
    const state = get();

    // Actualizar progreso del módulo
    const moduleProgress = state.moduleProgress[moduleId];
    if (moduleProgress) {
      const newCompletedExercises = moduleProgress.completedExercises + 1;
      const newAverageScore =
        (moduleProgress.averageScore * moduleProgress.completedExercises + score) /
        newCompletedExercises;

      set((state) => ({
        moduleProgress: {
          ...state.moduleProgress,
          [moduleId]: {
            ...moduleProgress,
            completedExercises: newCompletedExercises,
            averageScore: newAverageScore,
            completionRate:
              (newCompletedExercises / moduleProgress.totalExercises) * 100,
            isCompleted: newCompletedExercises === moduleProgress.totalExercises,
          },
        },
      }));
    }

    // Actualizar progreso general
    set((state) => ({
      overallProgress: {
        ...state.overallProgress,
        completedExercises: state.overallProgress.completedExercises + 1,
        lastActive: new Date(),
      },
    }));
  },

  getCompletionPercentage: () => {
    const { overallProgress } = get();
    if (overallProgress.totalExercises === 0) return 0;

    return Math.round(
      (overallProgress.completedExercises / overallProgress.totalExercises) * 100
    );
  },

  getWeeklyActivity: () => {
    const { recentActivity } = get();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyActivity = recentActivity.filter(
      (activity) => new Date(activity.timestamp) >= weekAgo
    );

    // Agrupar por día
    const grouped = weeklyActivity.reduce((acc, activity) => {
      const day = new Date(activity.timestamp).toLocaleDateString();
      if (!acc[day]) {
        acc[day] = { day, count: 0 };
      }
      acc[day].count++;
      return acc;
    }, {} as Record<string, WeeklyActivity>);

    return Object.values(grouped);
  },
}));
```

### Dashboard de Progreso

```typescript
// Componente de dashboard
const ProgressDashboard = () => {
  const {
    overallProgress,
    fetchProgress,
    getCompletionPercentage,
    isLoading,
  } = useProgressStore();

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="progress-dashboard">
      <div className="completion-circle">
        <CircleProgress percentage={getCompletionPercentage()} />
      </div>

      <div className="stats-grid">
        <StatCard
          label="Módulos Completados"
          value={`${overallProgress.completedModules}/${overallProgress.totalModules}`}
        />
        <StatCard
          label="Ejercicios Completados"
          value={`${overallProgress.completedExercises}/${overallProgress.totalExercises}`}
        />
        <StatCard
          label="Puntuación Promedio"
          value={`${Math.round(overallProgress.averageScore)}%`}
        />
        <StatCard label="Racha" value={`${overallProgress.streak} días`} />
      </div>

      <div className="recent-activity">
        <h3>Actividad Reciente</h3>
        <ActivityFeed />
      </div>
    </div>
  );
};
```

---

## Integración entre Stores Educativos

### Flujo completo de aprendizaje

```typescript
// Cuando un estudiante selecciona un módulo
const startModule = async (moduleId: string) => {
  // 1. Cargar módulo
  await useModuleStore.getState().fetchModuleById(moduleId);

  // 2. Cargar ejercicios del módulo
  await useExerciseStore.getState().fetchExercises(moduleId);

  // 3. Cargar progreso del módulo
  await useProgressStore.getState().fetchModuleProgress(moduleId);

  // 4. Navegar al módulo
  navigate(`/module/${moduleId}`);
};

// Cuando completa un ejercicio
const completeExercise = async (moduleId: string, exerciseId: string) => {
  // 1. Enviar respuestas
  const result = await useExerciseStore.getState().submitExercise();

  // 2. Actualizar progreso
  useProgressStore.getState().updateProgress(moduleId, exerciseId, result.score);

  // 3. Verificar si desbloqueó siguiente módulo
  const nextModule = useModuleStore.getState().getNextModule(moduleId);
  if (nextModule && shouldUnlock(nextModule)) {
    useModuleStore.getState().unlockModule(nextModule.id);
  }

  // 4. Mostrar resultado
  showResultModal(result);
};
```

---

**Última actualización:** 2025-10-27
**Versión:** 1.0
