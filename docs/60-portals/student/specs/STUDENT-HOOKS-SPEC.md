# Student Portal Hooks Specification

**Version:** 1.1.0
**Fecha:** 2026-02-18 (v1.1.0: +2 hooks Phase 4)
**Autor:** @PERFIL_FRONTEND + @PERFIL_DOCUMENTATION
**Tarea:** P2-1 (TASK-2026-01-20-AUDITORIA-ANALISIS-PORTALES)

---

## Resumen

Este documento especifica los 14 hooks custom del Student Portal ubicados en:
```
apps/frontend/src/apps/student/hooks/
```

| Categoria | Hooks | Descripcion |
|-----------|-------|-------------|
| Data Fetching | 4 | Obtienen datos del backend via API |
| State Management | 2 | Gestionan estado complejo de ejercicios |
| UI/UX | 4 | Responsive, gestos, teclado |
| Gamification | 2 | Achievements y Power-ups |
| Profile (Phase 4) | 2 | Datos de perfil y avatar |

---

## Categoria: Data Fetching

### useDashboardData

**Archivo:** `hooks/useDashboardData.ts`
**Proposito:** Obtiene datos del dashboard del estudiante usando React Query para manejo de cache y estado del servidor.

#### Parametros

| Nombre | Tipo | Requerido | Descripcion |
|--------|------|-----------|-------------|
| - | - | - | No recibe parametros (usa `useAuth` internamente) |

#### Retorno

```typescript
interface UseDashboardDataReturn {
  coins: MLCoinsData | null;
  rank: RankData;
  achievements: AchievementData[];
  progress: ProgressData | null;
  recentAchievements: AchievementData[];
  loading: boolean;
  error: string | null;
  isRefreshing: boolean;
  refresh: () => Promise<void>;
}

interface MLCoinsData {
  balance: number;
  todayEarned: number;
  todaySpent: number;
  recentTransactions: {
    id: string;
    type: 'earned' | 'spent';
    amount: number;
    description: string;
    timestamp: string;
  }[];
}

interface RankData {
  currentRank: string;
  currentXP: number;
  nextRankXP: number;
  multiplier: number;
  rankIcon: string;
  progress: number;
}

interface AchievementData {
  id: string;
  name: string;
  title?: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category?: string;
  icon: string;
  unlocked: boolean;
  isUnlocked?: boolean;
  unlockedAt?: string;
  progress?: number;
  required?: number;
  mlCoinsReward?: number;
  xpReward?: number;
  rewards?: { ml_coins?: number; xp?: number };
}

interface ProgressData {
  totalModules: number;
  completedModules: number;
  totalExercises: number;
  completedExercises: number;
  averageScore: number;
  totalTimeSpent: number;
  currentStreak: number;
  longestStreak: number;
}
```

#### Ejemplo de uso

```typescript
const {
  coins,
  rank,
  achievements,
  progress,
  loading,
  error,
  refresh
} = useDashboardData();

if (loading) return <Spinner />;
if (error) return <ErrorMessage message={error} />;

return (
  <Dashboard
    mlCoins={coins?.balance ?? 0}
    currentRank={rank.currentRank}
    progressPercent={rank.progress}
  />
);
```

#### Endpoints consumidos

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/v1/gamification/users/:userId/ml-coins` | Balance y transacciones de ML Coins |
| GET | `/api/v1/gamification/ranks/current` | Rango actual del sistema |
| GET | `/api/v1/gamification/ranks/users/:userId/rank-progress` | Progreso hacia siguiente rango |
| GET | `/api/v1/gamification/users/:userId/achievements` | Achievements del usuario |
| GET | `/api/v1/progress/users/:userId/summary` | Resumen de progreso educativo |

#### Dependencias

- `@tanstack/react-query` - Manejo de cache y estado del servidor
- `useAuth` - Obtiene userId del usuario autenticado
- `apiClient` - Cliente HTTP centralizado

#### Query Keys

```typescript
export const dashboardKeys = {
  all: ['dashboard'] as const,
  user: (userId: string) => [...dashboardKeys.all, userId] as const,
  coins: (userId: string) => [...dashboardKeys.user(userId), 'coins'] as const,
  rank: (userId: string) => [...dashboardKeys.user(userId), 'rank'] as const,
  achievements: (userId: string) => [...dashboardKeys.user(userId), 'achievements'] as const,
  progress: (userId: string) => [...dashboardKeys.user(userId), 'progress'] as const,
};
```

---

### useUserClassroom

**Archivo:** `hooks/useUserClassroom.ts`
**Proposito:** Obtiene la membresia de aula principal del usuario para filtrado de contenido.

#### Parametros

| Nombre | Tipo | Requerido | Descripcion |
|--------|------|-----------|-------------|
| userId | `string \| undefined` | Si | ID del usuario |

#### Retorno

```typescript
interface UseUserClassroomReturn {
  classroomId: string | null;
  classroomMember: ClassroomMember | null;
  loading: boolean;
  error: Error | null;
}

// ClassroomMember viene de @/shared/types/social.types
interface ClassroomMember {
  id: string;
  user_id: string;
  classroom_id: string;
  role: 'student' | 'teacher' | 'admin';
  joined_at: string;
  // ... otros campos
}
```

#### Ejemplo de uso

```typescript
const { user } = useAuth();
const { classroomId, loading, error } = useUserClassroom(user?.id);

// Usar classroomId para filtrar modulos
const { modules } = useUserModules({ classroomId });
```

#### Endpoints consumidos

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/v1/social/classroom-members/users/:userId` | Membresias del usuario |

#### Dependencias

- `apiClient` - Cliente HTTP centralizado
- `ClassroomMember` type de `@/shared/types/social.types`

#### Notas importantes

- Los usuarios pueden pertenecer a multiples aulas (relacion M:N)
- Este hook retorna la primera aula activa como "principal"
- El `classroom_id` NO esta en el objeto User directamente

---

### useUserModules

**Archivo:** `hooks/useUserModules.ts`
**Proposito:** Obtiene modulos del usuario con su progreso usando React Query.

#### Parametros

| Nombre | Tipo | Requerido | Descripcion |
|--------|------|-----------|-------------|
| params.classroomId | `string \| undefined` | No | Filtrar por aula |

#### Retorno

```typescript
interface UseUserModulesReturn {
  modules: UserModuleData[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  isRefreshing: boolean;
}

interface UserModuleData {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'in_progress' | 'available' | 'locked' | 'backlog';
  progress: number; // 0-100
  totalExercises: number;
  completedExercises: number;
  estimatedTime: number; // minutos
  xpReward: number;
  icon: string;
  category: string;
  mlCoinsReward?: number;
}
```

#### Ejemplo de uso

```typescript
const { classroomId } = useUserClassroom(userId);
const { modules, loading, refresh } = useUserModules({ classroomId });

return (
  <ModuleList
    modules={modules.filter(m => m.status !== 'locked')}
    onRefresh={refresh}
  />
);
```

#### Endpoints consumidos

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/v1/educational/users/:userId/modules` | Modulos con progreso |

#### Dependencias

- `@tanstack/react-query` - Manejo de cache
- `useAuth` - Usuario autenticado
- `getUserModules` de `@/services/api/educationalAPI`

#### Query Keys

```typescript
export const userModulesKeys = {
  all: ['userModules'] as const,
  user: (userId: string) => [...userModulesKeys.all, userId] as const,
  byClassroom: (userId: string, classroomId?: string) =>
    [...userModulesKeys.user(userId), 'classroom', classroomId ?? 'all'] as const,
};
```

---

### useRecentActivities

**Archivo:** `hooks/useRecentActivities.ts`
**Proposito:** Obtiene las actividades recientes del usuario para el feed de actividad.

#### Parametros

| Nombre | Tipo | Requerido | Descripcion |
|--------|------|-----------|-------------|
| limit | `number` | No | Maximo de actividades (default: 10) |

#### Retorno

```typescript
interface UseRecentActivitiesReturn {
  activities: ActivityData[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  isRefreshing: boolean;
}

interface ActivityData {
  id: string;
  type: 'exercise_completed' | 'achievement_unlocked' | 'streak_milestone' | 'level_up' | 'module_completed';
  title: string;
  description: string;
  timestamp: Date;
  metadata: {
    xp?: number;
    ml?: number;
    exerciseName?: string;
    moduleName?: string;
    achievementName?: string;
    streakDays?: number;
    score?: number;
  };
  category: string;
}
```

#### Ejemplo de uso

```typescript
const { activities, loading, refresh } = useRecentActivities(5);

return (
  <ActivityFeed>
    {activities.map(activity => (
      <ActivityCard key={activity.id} activity={activity} />
    ))}
  </ActivityFeed>
);
```

#### Endpoints consumidos

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/v1/educational/users/:userId/activities` | Actividades recientes |

#### Dependencias

- `useAuth` - Usuario autenticado
- `getUserActivities` de `@/services/api/educationalAPI`

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

## Categoria: UI/UX

### useResponsiveLayout

**Archivo:** `hooks/useResponsiveLayout.ts`
**Proposito:** Detecta breakpoints y orientacion de pantalla para layouts responsivos.

#### Parametros

| Nombre | Tipo | Requerido | Descripcion |
|--------|------|-----------|-------------|
| - | - | - | No recibe parametros |

#### Retorno

```typescript
interface ResponsiveLayoutState {
  breakpoint: Breakpoint;
  orientation: Orientation;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isWide: boolean;
  width: number;
  height: number;
}

type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';
type Orientation = 'portrait' | 'landscape';
```

#### Breakpoints

```typescript
const BREAKPOINTS = {
  mobile: 768,    // < 768px
  tablet: 1024,   // 768px - 1023px
  desktop: 1400,  // 1024px - 1399px
  // wide: >= 1400px
};
```

#### Ejemplo de uso

```typescript
const { isMobile, isTablet, breakpoint, orientation } = useResponsiveLayout();

return (
  <Layout
    sidebar={!isMobile}
    columns={isMobile ? 1 : isTablet ? 2 : 3}
  >
    {isMobile && <MobileNav />}
    {!isMobile && <DesktopNav />}
  </Layout>
);
```

#### Endpoints consumidos

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| - | - | Solo usa window.innerWidth/innerHeight |

#### Dependencias

- React hooks: `useState`, `useEffect`
- `window.addEventListener('resize')`

---

### useMediaQuery

**Archivo:** `hooks/useResponsiveLayout.ts`
**Proposito:** Evalua una media query CSS y retorna si coincide.

#### Parametros

| Nombre | Tipo | Requerido | Descripcion |
|--------|------|-----------|-------------|
| query | `string` | Si | Media query CSS |

#### Retorno

```typescript
boolean // true si la media query coincide
```

#### Ejemplo de uso

```typescript
const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
const isLargeScreen = useMediaQuery('(min-width: 1200px)');
const hasHover = useMediaQuery('(hover: hover)');

return (
  <ThemeProvider theme={prefersDark ? darkTheme : lightTheme}>
    <App />
  </ThemeProvider>
);
```

#### Endpoints consumidos

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| - | - | Solo usa window.matchMedia |

#### Dependencias

- React hooks: `useState`, `useEffect`
- `window.matchMedia`

---

### useKeyboardShortcuts

**Archivo:** `hooks/useResponsiveLayout.ts`
**Proposito:** Registra y maneja atajos de teclado con soporte para secuencias de 2 teclas.

#### Parametros

| Nombre | Tipo | Requerido | Descripcion |
|--------|------|-----------|-------------|
| shortcuts | `Record<string, () => void>` | Si | Mapa de atajos a callbacks |

#### Retorno

```typescript
void // No retorna nada, solo registra listeners
```

#### Ejemplo de uso

```typescript
useKeyboardShortcuts({
  'escape': () => closeModal(),
  'enter': () => submitForm(),
  'g d': () => navigateTo('/dashboard'),  // Secuencia: g + d
  'g m': () => navigateTo('/modules'),     // Secuencia: g + m
});
```

#### Endpoints consumidos

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| - | - | Solo usa window.addEventListener('keydown') |

#### Dependencias

- React hooks: `useEffect`
- `window.addEventListener('keydown')`

#### Notas importantes

- Soporta secuencias de hasta 2 teclas
- La secuencia se resetea despues de 1 segundo
- Previene el comportamiento default del evento

---

### useSwipeGesture / useSwipeableElement

**Archivo:** `hooks/useSwipeGesture.ts`
**Proposito:** Detecta gestos de swipe en dispositivos tactiles.

#### useSwipeGesture - Parametros

| Nombre | Tipo | Requerido | Descripcion |
|--------|------|-----------|-------------|
| onSwipeLeft | `() => void` | No | Callback swipe izquierda |
| onSwipeRight | `() => void` | No | Callback swipe derecha |
| onSwipeUp | `() => void` | No | Callback swipe arriba |
| onSwipeDown | `() => void` | No | Callback swipe abajo |
| threshold | `number` | No | Pixeles minimos (default: 50) |

#### useSwipeGesture - Retorno

```typescript
interface UseSwipeGestureReturn {
  isSwiping: boolean;
  handleTouchStart: (e: TouchEvent) => void;
  handleTouchMove: (e: TouchEvent) => void;
  handleTouchEnd: () => void;
}
```

#### useSwipeableElement - Retorno

```typescript
interface UseSwipeableElementReturn {
  elementRef: RefObject<HTMLDivElement>;
  isSwiping: boolean;
}
```

#### Ejemplo de uso

```typescript
// Opcion 1: useSwipeGesture (manual)
const gesture = useSwipeGesture({
  onSwipeLeft: () => nextSlide(),
  onSwipeRight: () => prevSlide(),
  threshold: 100
});

<div
  onTouchStart={gesture.handleTouchStart}
  onTouchMove={gesture.handleTouchMove}
  onTouchEnd={gesture.handleTouchEnd}
>
  {slides[currentIndex]}
</div>

// Opcion 2: useSwipeableElement (automatico)
const { elementRef, isSwiping } = useSwipeableElement({
  onSwipeLeft: () => nextSlide(),
  onSwipeRight: () => prevSlide()
});

<div ref={elementRef} className={isSwiping ? 'swiping' : ''}>
  {slides[currentIndex]}
</div>
```

#### Endpoints consumidos

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| - | - | Solo usa Touch events |

#### Dependencias

- React hooks: `useState`, `useEffect`, `useRef`
- Touch events API

---

## Categoria: Gamification

### useAchievementsEnhanced

**Archivo:** `hooks/useAchievementsEnhanced.ts`
**Proposito:** Hook completo para achievements con filtrado, busqueda y estadisticas.

#### Parametros

| Nombre | Tipo | Requerido | Descripcion |
|--------|------|-----------|-------------|
| userId | `string \| undefined` | No | ID usuario para fetch real |

#### Retorno

```typescript
interface UseAchievementsEnhancedResult {
  // Data
  achievements: Achievement[];
  filteredAchievements: Achievement[];
  statistics: AchievementStatisticsData;

  // Filters
  filters: AchievementFiltersState;
  setFilter: (key: keyof AchievementFiltersState, value: any) => void;
  clearFilters: () => void;

  // Navigation
  selectedAchievement: Achievement | null;
  selectAchievement: (achievement: Achievement | null) => void;
  nextAchievement: () => void;
  previousAchievement: () => void;
  hasNext: boolean;
  hasPrevious: boolean;

  // State
  loading: boolean;
  error: string | null;

  // Actions
  refresh: () => Promise<void>;
}

interface AchievementFiltersState {
  category: AchievementCategory | 'all';
  rarity: AchievementRarity | 'all';
  status: 'all' | 'unlocked' | 'locked' | 'in_progress';
  searchQuery: string;
  sortBy: 'recent' | 'alphabetical' | 'rarity' | 'progress';
}

interface AchievementStatisticsData {
  total: number;
  unlocked: number;
  locked: number;
  inProgress: number;
  completionRate: number;
  pointsEarned: number;
  mlCoinsEarned: number;
  byRarity: Record<AchievementRarity, number>;
  byCategory: Record<AchievementCategory, number>;
  recentUnlocks: Achievement[];
  rarestUnlocked: Achievement[];
}

type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary';
type AchievementCategory = 'progress' | 'streak' | 'completion' | 'social' | 'special' | 'mastery' | 'exploration' | 'collection' | 'hidden';
```

#### Ejemplo de uso

```typescript
const {
  filteredAchievements,
  statistics,
  filters,
  setFilter,
  clearFilters,
  selectedAchievement,
  selectAchievement,
  loading
} = useAchievementsEnhanced(userId);

return (
  <AchievementsPage>
    <StatsBar
      unlocked={statistics.unlocked}
      total={statistics.total}
      completionRate={statistics.completionRate}
    />

    <FilterBar>
      <Select
        value={filters.category}
        onChange={(v) => setFilter('category', v)}
      />
      <SearchInput
        value={filters.searchQuery}
        onChange={(v) => setFilter('searchQuery', v)}
      />
      <Button onClick={clearFilters}>Clear</Button>
    </FilterBar>

    <AchievementGrid achievements={filteredAchievements} />

    {selectedAchievement && (
      <AchievementModal achievement={selectedAchievement} />
    )}
  </AchievementsPage>
);
```

#### Endpoints consumidos

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | (via achievementsStore) | Lista de achievements del usuario |

#### Dependencias

- `useAchievementsStore` - Zustand store de achievements
- `Achievement`, `AchievementCategory`, `AchievementRarity` types
- `localStorage` para persistir filtros

#### Notas importantes

- Los filtros se persisten en localStorage
- Debounce de 300ms en busqueda
- Si no hay userId, solo refresca estadisticas locales

---

### useExercisePowerUps

**Archivo:** `hooks/useExercisePowerUps.ts`
**Proposito:** Gestiona power-ups durante la ejecucion de ejercicios con sincronizacion al backend.

#### Parametros

| Nombre | Tipo | Requerido | Descripcion |
|--------|------|-----------|-------------|
| exerciseId | `string` | Si | ID del ejercicio |
| userId | `string \| undefined` | No | ID usuario para sync backend |
| onHintReveal | `(hintCount: number) => void` | No | Callback pistas reveladas |
| onTimeExtension | `(seconds: number) => void` | No | Callback extension tiempo |
| onSecondChance | `() => void` | No | Callback segunda oportunidad |
| onVisionActivate | `() => void` | No | Callback vision activa |

#### Retorno

```typescript
interface UseExercisePowerUpsReturn {
  // Power-ups
  availablePowerUps: PowerUp[];
  activePowerUps: PowerUp[];
  allPowerUps: PowerUp[];

  // Actions
  activatePowerUp: (powerUpId: string) => Promise<boolean>;
  resetEffects: () => void;
  getUsedPowerUps: () => string[];
  isPowerUpActive: (effectType: string) => boolean;

  // Effects
  effects: PowerUpEffects;

  // State
  isLoading: boolean;
  error: string | null;

  // Utilities
  hasAvailablePowerUps: boolean;
  hasActivePowerUps: boolean;
}

interface PowerUpEffects {
  hintsRevealed: number;
  timeExtension: number;
  hasSecondChance: boolean;
  visionActive: boolean;
  multiplierActive: boolean;
}
```

#### Ejemplo de uso

```typescript
const {
  availablePowerUps,
  activatePowerUp,
  effects,
  isLoading,
  error,
  getUsedPowerUps
} = useExercisePowerUps({
  exerciseId: 'exercise-123',
  userId: user?.id,
  onHintReveal: (count) => setVisibleHints(count),
  onTimeExtension: (seconds) => addTime(seconds)
});

// Activar power-up
const handleUsePowerUp = async (id: string) => {
  const success = await activatePowerUp(id);
  if (!success) {
    toast.error(error);
  }
};

// Incluir en submission
const handleSubmit = () => {
  submitExercise({
    answers,
    powerUpsUsed: getUsedPowerUps()
  });
};
```

#### Endpoints consumidos

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/api/v1/gamification/comodines/use` | Registrar uso de comodin |

#### Mapeo Frontend a Backend

```typescript
const comodinTypeMap: Record<string, string> = {
  'powerup-001': 'pistas',            // Pistas Mejoradas
  'powerup-002': 'vision_lectora',    // Vision Lectora
  'powerup-003': 'segunda_oportunidad', // Segunda Oportunidad
  'powerup-004': 'pistas',            // Extension de Tiempo (fallback)
};
```

#### Dependencias

- `usePowerUps` de `@/features/gamification/social/hooks/usePowerUps`
- `apiClient` para sync con backend

---

## Categoria: Profile (Phase 4 — 2026-02-18)

### useProfileData

**Archivo:** `hooks/useProfileData.ts`
**Proposito:** Agrega 4 Zustand stores en un solo hook para EnhancedProfilePage, eliminando prop drilling y reduciendo acoplamiento.

#### Retorno

```typescript
interface UseProfileDataReturn {
  user: User | null;
  logout: () => void;
  userProgress: UserRankProgress | null;
  balance: number;
  achievements: Achievement[];
  achievementStats: AchievementStats | null;
}
```

#### Dependencias

- `useAuthStore` — user, logout
- `useRanksStore` — userProgress, fetchUserProgress
- `useEconomyStore` — balance, fetchBalance
- `useAchievementsStore` — achievements, stats, fetchAchievements

#### Notas

- Auto-fetches on mount when `user?.id` exists
- Candidato futuro para migracion a React Query (eliminar dependencia de Zustand stores)

---

### useAvatarUpdate

**Archivo:** `hooks/useAvatarUpdate.ts`
**Proposito:** Actualización optimista de avatar con persistencia via API.

#### Retorno

```typescript
interface UseAvatarUpdateReturn {
  updateAvatar: (avatarUrl: string) => Promise<boolean>;
  isUpdating: boolean;
}
```

#### Comportamiento

1. Actualiza `authStore.user.avatar_url` inmediatamente (optimistic)
2. Persiste via `profileAPI.updateProfile(userId, { avatar_url })`
3. Muestra toast de éxito/error
4. Retorna `boolean` para que el caller sepa si cerrar modal

#### Dependencias

- `useAuthStore` — user, setState
- `profileAPI` — updateProfile
- `react-hot-toast` — notificaciones

---

## Hook Deprecado

### useGamificationData (DEPRECATED)

**Archivo:** `hooks/useGamificationData.ts`
**Estado:** DEPRECADO - No usar en codigo nuevo

**Razon de deprecacion:**
- Reemplazado por `useDashboardData` (React Query)
- Reemplazado por `useUserGamification` de `@/shared/hooks/`

**Alternativas:**
```typescript
// Antes (deprecado)
const { rankData, mlCoins } = useGamificationData(userId);

// Ahora (recomendado)
const { rank, coins } = useDashboardData();
// o
const gamification = useUserGamification();
```

---

## Resumen de Exportaciones

El archivo `index.ts` exporta los siguientes hooks:

```typescript
// Gestos
export { useSwipeGesture, useSwipeableElement } from './useSwipeGesture';

// Responsive
export {
  useResponsiveLayout,
  useMediaQuery,
  useKeyboardShortcuts,
  type Breakpoint,
  type Orientation,
} from './useResponsiveLayout';

// Dashboard Data
export {
  useDashboardData,
  dashboardKeys,
  type MLCoinsData,
  type RankData,
  type AchievementData,
  type ProgressData,
} from './useDashboardData';

// Exercise State
export { useExerciseState } from './useExerciseState';
export type { Exercise, ExerciseAttempt, ExerciseState } from './useExerciseState';

// Auto-save
export { useExerciseAutoSave } from './useExerciseAutoSave';
export type {
  UseExerciseAutoSaveOptions,
  AutoSaveState,
  UseExerciseAutoSaveReturn,
} from './useExerciseAutoSave';

// Classroom
export { useUserClassroom } from './useUserClassroom';

// Modules
export { useUserModules, userModulesKeys, type UserModuleData } from './useUserModules';
```

**Hooks NO exportados en barrel (importar directamente):**
- `useGamificationData` (deprecado)
- `useAchievementsEnhanced`
- `useRecentActivities`
- `useExercisePowerUps`

---

## Matriz de Dependencias

| Hook | React Query | Zustand | localStorage | API Client | useAuth |
|------|:-----------:|:-------:|:------------:|:----------:|:-------:|
| useDashboardData | X | | | X | X |
| useUserClassroom | | | | X | |
| useUserModules | X | | | X | X |
| useRecentActivities | | | | X | X |
| useExerciseState | | | X | | |
| useExerciseAutoSave | | | X | X | |
| useResponsiveLayout | | | | | |
| useMediaQuery | | | | | |
| useKeyboardShortcuts | | | | | |
| useSwipeGesture | | | | | |
| useAchievementsEnhanced | | X | X | | |
| useExercisePowerUps | | X | | X | |
| useProfileData | | X | | | |
| useAvatarUpdate | | X | | X | |

---

## Referencias

- **Tarea origen:** TASK-2026-01-20-AUDITORIA-ANALISIS-PORTALES (P2-1)
- **Ubicacion hooks:** `/apps/frontend/src/apps/student/hooks/`
- **API Client:** `/apps/frontend/src/services/api/apiClient.ts`
- **Auth hook:** `/apps/frontend/src/features/auth/hooks/useAuth.ts`
- **Gamification store:** `/apps/frontend/src/features/gamification/social/store/`

---

**Documento generado:** 2026-01-20
**Actualizado:** 2026-02-18 (v1.1.0: +useProfileData, +useAvatarUpdate)
**Cobertura:** 14/14 hooks (100%)
**Lineas de documentacion:** ~920
