# Progress API Client

**Proyecto:** GAMILIT Platform
**Feature:** Progress Tracking - API Client
**Versión:** 2.0
**Fecha:** 2025-11-07
**Ubicación:** `apps/frontend/src/features/progress/api/`

---

## 📋 Propósito

Cliente de API para **tracking de progreso educativo**, envío de ejercicios, y consulta de analytics.

**Características:**
- ✅ 8 métodos de API client
- ✅ 19 interfaces TypeScript
- ✅ Mock data para desarrollo
- ✅ Error handling con `handleAPIError`
- ✅ Integración con backend `/api/educational/*`

---

## 🔗 Referencias

### Requerimientos
- [`docs/01-requerimientos/casos-uso/student/UC-STU-003-resolver-ejercicio.md`](../../../../01-requerimientos/casos-uso/student/UC-STU-003-resolver-ejercicio.md)
- [`docs/01-requerimientos/casos-uso/student/UC-STU-004-ver-progreso.md`](../../../../01-requerimientos/casos-uso/student/UC-STU-004-ver-progreso.md)

### Especificaciones Técnicas
- [`docs/02-especificaciones-tecnicas/apis/api-reference/05-PROGRESS-API.md`](../../../../02-especificaciones-tecnicas/apis/api-reference/05-PROGRESS-API.md)
- [`docs/02-especificaciones-tecnicas/trazabilidad/02-educational-mechanics.md`](../../../../02-especificaciones-tecnicas/trazabilidad/02-educational-mechanics.md)

### Código
- `apps/frontend/src/features/progress/api/progressAPI.ts` (650 líneas)
- `apps/frontend/src/features/progress/api/progressTypes.ts` (398 líneas)

---

## 📚 API Client Methods

### 1. submitExercise()

Envía las respuestas de un ejercicio para evaluación.

```typescript
submitExercise(
  exerciseId: string,
  request: Omit<SubmitExerciseRequest, 'exerciseId'>
): Promise<SubmitExerciseResponse>
```

**Parámetros:**
- `exerciseId` - ID del ejercicio
- `request.userId` - ID del usuario
- `request.answers` - Respuestas del ejercicio (tipo varía según mechanic)
- `request.startedAt` - Timestamp de inicio (Date | number)
- `request.hintsUsed?` - Cantidad de pistas usadas
- `request.powerupsUsed?` - PowerUps utilizados (`['pistas', 'vision_lectora']`)
- `request.sessionId?` - ID de sesión

**Response:**
```typescript
{
  attemptId: string;
  score: number;              // 0-100
  isPerfect: boolean;
  correctAnswers: number;
  totalQuestions: number;
  rewards: {
    mlCoins: number;
    xp: number;
    bonuses: {
      perfectScore?: number;
      noHints?: number;
      speedBonus?: number;
      firstAttempt?: number;
    };
  };
  feedback: {
    overall: string;
    answerReview: AnswerReview[];
  };
  achievements?: Achievement[];
  rankUp?: RankUpInfo | null;
  createdAt: Date;
}
```

**Endpoint:** `POST /api/educational/exercises/:exerciseId/submit`

**Ejemplo:**
```typescript
const submission = {
  userId: 'user-123',
  answers: { q1: 'A', q2: 'B', q3: 'C' },
  startedAt: Date.now() - 5 * 60 * 1000, // Started 5 mins ago
  hintsUsed: 1,
  powerupsUsed: ['pistas']
};

const result = await submitExercise('exercise-456', submission);

console.log(result.score);          // 85
console.log(result.rewards.mlCoins); // 20
console.log(result.isPerfect);      // false
```

---

### 2. getProgress()

Obtiene vista general del progreso del usuario.

```typescript
getProgress(userId: string): Promise<UserProgressOverview>
```

**Parámetros:**
- `userId` - ID del usuario

**Response:**
```typescript
{
  userId: string;
  overallProgress: {
    totalModules: number;
    completedModules: number;
    totalExercises: number;
    completedExercises: number;
    overallPercentage: number;
  };
  moduleProgress: ModuleProgressSummary[];
  recentActivity: Activity[];
  studyStreak: {
    currentStreak: number;
    longestStreak: number;
    lastStudyDate: Date;
  };
}
```

**Endpoint:** `GET /api/educational/progress/:userId`

**Ejemplo:**
```typescript
const progress = await getProgress('user-123');

console.log(progress.overallProgress.overallPercentage); // 45
console.log(progress.studyStreak.currentStreak);         // 7 días
console.log(progress.moduleProgress.length);             // 5 módulos
```

---

### 3. getModuleProgress()

Obtiene progreso detallado de un módulo específico.

```typescript
getModuleProgress(
  userId: string,
  moduleId: string
): Promise<ModuleProgressDetail>
```

**Parámetros:**
- `userId` - ID del usuario
- `moduleId` - ID del módulo

**Response:**
```typescript
{
  userId: string;
  moduleId: string;
  startedAt: Date;
  completedAt?: Date;
  progressPercentage: number;
  totalExercises: number;
  completedExercises: number;
  averageScore: number;
  totalTimeSpent: number;
  exerciseProgress: ExerciseProgress[];
  strengths: string[];        // ["Comprension literal", "Analisis"]
  weaknesses: string[];       // ["Inferencia", "Vocabulario"]
  updatedAt: Date;
}
```

**Endpoint:** `GET /api/educational/progress/:userId/module/:moduleId`

**Ejemplo:**
```typescript
const detail = await getModuleProgress('user-123', 'module-comp-lit');

console.log(detail.progressPercentage);      // 80
console.log(detail.averageScore);            // 85
console.log(detail.exerciseProgress.length); // 10 ejercicios
console.log(detail.strengths);               // ["Analisis", "Contexto"]
```

---

### 4. getExerciseAttempts()

Obtiene historial de intentos de ejercicios del usuario.

```typescript
getExerciseAttempts(
  userId: string,
  filters?: { exerciseId?: string; moduleId?: string }
): Promise<ExerciseAttempt[]>
```

**Parámetros:**
- `userId` - ID del usuario
- `filters.exerciseId?` - Filtrar por ejercicio específico
- `filters.moduleId?` - Filtrar por módulo específico

**Response:**
```typescript
Array<{
  id: string;
  userId: string;
  exerciseId: string;
  exerciseTitle: string;
  score: number;
  percentage: number;
  timeSpent: number;
  hintsUsed: number;
  powerupsUsed: PowerupType[];
  isPerfect: boolean;
  mlCoinsEarned: number;
  xpEarned: number;
  attemptNumber: number;
  startedAt: Date;
  completedAt: Date;
}>
```

**Endpoint:** `GET /api/educational/attempts/:userId?exerciseId=X&moduleId=Y`

**Ejemplo:**
```typescript
// Todos los intentos del usuario
const allAttempts = await getExerciseAttempts('user-123');

// Intentos de un ejercicio específico
const exerciseAttempts = await getExerciseAttempts('user-123', {
  exerciseId: 'exercise-456'
});

console.log(exerciseAttempts[0].score);          // 85
console.log(exerciseAttempts[0].mlCoinsEarned);  // 20
console.log(exerciseAttempts[0].attemptNumber);  // 2
```

---

### 5. getUserActivities()

Obtiene actividades recientes del usuario.

```typescript
getUserActivities(
  userId: string,
  limit?: number
): Promise<Activity[]>
```

**Parámetros:**
- `userId` - ID del usuario
- `limit` - Límite de resultados (default: 10)

**Response:**
```typescript
Array<{
  type: 'exercise_completed' | 'achievement_unlocked' |
        'rank_advanced' | 'module_completed';
  description: string;
  timestamp: Date;
  metadata: unknown;
}>
```

**Endpoint:** `GET /api/educational/activities/:userId?limit=10`

**Ejemplo:**
```typescript
const activities = await getUserActivities('user-123', 20);

activities.forEach(activity => {
  console.log(activity.type);         // 'exercise_completed'
  console.log(activity.description);  // 'Completaste: Detective Textual'
  console.log(activity.timestamp);    // Date
});
```

---

### 6. getActivityStats()

Obtiene estadísticas de actividad del usuario.

```typescript
getActivityStats(userId: string): Promise<ActivityStats>
```

**Parámetros:**
- `userId` - ID del usuario

**Response:**
```typescript
{
  totalActivities: number;
  exercisesCompleted: number;
  achievementsUnlocked: number;
  modulesCompleted: number;
  recentActivities: Activity[];
}
```

**Endpoint:** `GET /api/educational/stats/:userId`

**Ejemplo:**
```typescript
const stats = await getActivityStats('user-123');

console.log(stats.totalActivities);       // 50
console.log(stats.exercisesCompleted);    // 25
console.log(stats.achievementsUnlocked);  // 10
console.log(stats.modulesCompleted);      // 2
```

---

### 7. getUserActivitiesByType()

Obtiene actividades filtradas por tipo.

```typescript
getUserActivitiesByType(
  userId: string,
  type: 'exercise_completed' | 'achievement_unlocked' | 'module_completed',
  limit?: number
): Promise<Activity[]>
```

**Parámetros:**
- `userId` - ID del usuario
- `type` - Tipo de actividad
- `limit` - Límite de resultados (default: 10)

**Endpoint:** `GET /api/educational/activities/:userId/:type?limit=10`

**Ejemplo:**
```typescript
// Solo ejercicios completados
const exercises = await getUserActivitiesByType(
  'user-123',
  'exercise_completed',
  15
);

// Solo achievements desbloqueados
const achievements = await getUserActivitiesByType(
  'user-123',
  'achievement_unlocked'
);
```

---

### 8. getUserDashboard()

Obtiene datos consolidados para el dashboard del usuario.

```typescript
getUserDashboard(userId: string): Promise<UserDashboard>
```

**Parámetros:**
- `userId` - ID del usuario

**Response:**
```typescript
{
  currentModule: {
    moduleId: string;
    moduleName: string;
    progressPercentage: number;
  } | null;
  recentActivities: Activity[];
  upcomingExercises: Array<{
    exerciseId: string;
    title: string;
    moduleId: string;
    difficulty: string;
  }>;
  progressCharts: {
    moduleProgress: Array<{ moduleId: string; percentage: number }>;
    scoresTrend: Array<{ date: string; score: number }>;
    timeSpent: Array<{ date: string; minutes: number }>;
  };
  stats: {
    mlCoins: number;
    totalXP: number;
    currentRank: string;
    streakDays: number;
    exercisesCompleted: number;
    averageScore: number;
  };
}
```

**Endpoint:** `GET /api/educational/dashboard/:userId`

**Ejemplo:**
```typescript
const dashboard = await getUserDashboard('user-123');

console.log(dashboard.currentModule?.moduleName);     // 'Comprension Literal'
console.log(dashboard.stats.mlCoins);                 // 500
console.log(dashboard.stats.currentRank);             // 'Nacom'
console.log(dashboard.progressCharts.scoresTrend);    // [{date, score}]
```

---

## 🎯 TypeScript Types

### Submission Types

#### SubmitExerciseRequest

```typescript
interface SubmitExerciseRequest {
  exerciseId: string;
  userId: string;
  answers: unknown;               // Tipo varía según mechanic
  startedAt: number | Date;
  hintsUsed?: number;
  powerupsUsed?: PowerupType[];
  sessionId?: string;
}
```

#### SubmitExerciseResponse

```typescript
interface SubmitExerciseResponse {
  attemptId: string;
  score: number;                  // 0-100
  isPerfect: boolean;
  correctAnswers: number;
  totalQuestions: number;
  rewards: SubmissionRewards;
  feedback: SubmissionFeedback;
  achievements?: Achievement[];
  rankUp?: RankUpInfo | null;
  correctAnswers?: unknown;
  explanations?: Record<string, string>;
  createdAt: Date;
}
```

#### SubmissionRewards

```typescript
interface SubmissionRewards {
  mlCoins: number;
  xp: number;
  bonuses: {
    perfectScore?: number;
    noHints?: number;
    speedBonus?: number;
    firstAttempt?: number;
  };
}
```

#### SubmissionFeedback

```typescript
interface SubmissionFeedback {
  overall: string;
  answerReview: AnswerReview[];
}

interface AnswerReview {
  questionId: string;
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  explanation?: string;
}
```

---

### Progress Types

#### UserProgressOverview

```typescript
interface UserProgressOverview {
  userId: string;
  overallProgress: OverallProgress;
  moduleProgress: ModuleProgressSummary[];
  recentActivity: Activity[];
  studyStreak: StudyStreak;
}
```

#### OverallProgress

```typescript
interface OverallProgress {
  totalModules: number;
  completedModules: number;
  totalExercises: number;
  completedExercises: number;
  overallPercentage: number;
}
```

#### ModuleProgressSummary

```typescript
interface ModuleProgressSummary {
  moduleId: string;
  moduleName: string;
  totalExercises: number;
  completedExercises: number;
  progressPercentage: number;
  averageScore: number;
  timeSpent: number;              // minutes
  lastActivityAt: Date;
}
```

#### ModuleProgressDetail

```typescript
interface ModuleProgressDetail {
  userId: string;
  moduleId: string;
  startedAt: Date;
  completedAt?: Date;
  progressPercentage: number;
  totalExercises: number;
  completedExercises: number;
  averageScore: number;
  totalTimeSpent: number;
  exerciseProgress: ExerciseProgress[];
  strengths: string[];
  weaknesses: string[];
  updatedAt: Date;
}
```

#### ExerciseProgress

```typescript
interface ExerciseProgress {
  exerciseId: string;
  exerciseTitle: string;
  attempts: number;
  bestScore: number;
  averageScore: number;
  completed: boolean;
  perfectScore: boolean;
  timeSpent: number;
  lastAttemptedAt: Date;
}
```

#### StudyStreak

```typescript
interface StudyStreak {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: Date;
}
```

---

### Activity Types

#### Activity

```typescript
interface Activity {
  type: ActivityType;
  description: string;
  timestamp: Date;
  metadata: unknown;
}

enum ActivityType {
  EXERCISE_COMPLETED = 'exercise_completed',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  RANK_ADVANCED = 'rank_advanced',
  MODULE_COMPLETED = 'module_completed',
}
```

#### ActivityStats

```typescript
interface ActivityStats {
  totalActivities: number;
  exercisesCompleted: number;
  achievementsUnlocked: number;
  modulesCompleted: number;
  recentActivities: Activity[];
}
```

---

### Attempt Types

#### ExerciseAttempt

```typescript
interface ExerciseAttempt {
  id: string;
  userId: string;
  exerciseId: string;
  exerciseTitle: string;
  score: number;
  maxScore: number;
  percentage: number;
  timeSpent: number;
  hintsUsed: number;
  powerupsUsed: PowerupType[];
  answers: unknown;
  feedback: unknown;
  isPerfect: boolean;
  mlCoinsEarned: number;
  xpEarned: number;
  attemptNumber: number;
  startedAt: Date;
  completedAt: Date;
}
```

---

### Dashboard Types

#### UserDashboard

```typescript
interface UserDashboard {
  currentModule: CurrentModuleInfo | null;
  recentActivities: Activity[];
  upcomingExercises: UpcomingExercise[];
  progressCharts: ProgressCharts;
  stats: DashboardStats;
}
```

#### DashboardStats

```typescript
interface DashboardStats {
  mlCoins: number;
  totalXP: number;
  currentRank: string;
  streakDays: number;
  exercisesCompleted: number;
  averageScore: number;
}
```

---

### Enums

#### PowerupType

```typescript
enum PowerupType {
  PISTAS = 'pistas',
  VISION_LECTORA = 'vision_lectora',
  SEGUNDA_OPORTUNIDAD = 'segunda_oportunidad',
}
```

#### MayaRank

```typescript
enum MayaRank {
  AJAW = 'Ajaw',
  NACOM = 'Nacom',
  AH_KIN = 'Ah K\'in',
  HALACH_UINIC = 'Halach Uinic',
  KUKULKAN = 'K\'uk\'ulkan',
}
```

---

## 💡 Ejemplos de Uso

### Envío de Ejercicio Completo

```typescript
import { submitExercise } from '@/features/progress/api';

const ExerciseSubmit = () => {
  const [answers, setAnswers] = useState({});
  const [startTime] = useState(Date.now());

  const handleSubmit = async () => {
    try {
      const result = await submitExercise('exercise-123', {
        userId: 'user-456',
        answers: {
          q1: 'A',
          q2: 'B',
          q3: 'C'
        },
        startedAt: startTime,
        hintsUsed: 1,
        powerupsUsed: ['pistas']
      });

      // Mostrar resultado
      console.log(`Score: ${result.score}/100`);
      console.log(`ML Coins: +${result.rewards.mlCoins}`);
      console.log(`XP: +${result.rewards.xp}`);

      // Verificar achievements
      if (result.achievements && result.achievements.length > 0) {
        result.achievements.forEach(ach => {
          showNotification(`Desbloqueaste: ${ach.name}!`);
        });
      }

      // Verificar rank up
      if (result.rankUp) {
        showRankUpModal(result.rankUp);
      }
    } catch (error) {
      console.error('Error submitting exercise:', error);
    }
  };

  return <button onClick={handleSubmit}>Enviar Ejercicio</button>;
};
```

---

### Dashboard de Progreso

```typescript
import { getProgress, getUserDashboard } from '@/features/progress/api';
import { useQuery } from '@tanstack/react-query';

const ProgressDashboard = ({ userId }: { userId: string }) => {
  const { data: progress, isLoading } = useQuery({
    queryKey: ['progress', userId],
    queryFn: () => getProgress(userId)
  });

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard', userId],
    queryFn: () => getUserDashboard(userId)
  });

  if (isLoading) return <Spinner />;

  return (
    <div className="dashboard">
      {/* Overall Progress */}
      <section>
        <h2>Progreso General</h2>
        <ProgressBar
          value={progress.overallProgress.overallPercentage}
        />
        <p>
          {progress.overallProgress.completedModules} de{' '}
          {progress.overallProgress.totalModules} módulos completados
        </p>
      </section>

      {/* Study Streak */}
      <section>
        <h3>Racha de Estudio</h3>
        <StreakBadge days={progress.studyStreak.currentStreak} />
        <p>Récord: {progress.studyStreak.longestStreak} días</p>
      </section>

      {/* Modules Progress */}
      <section>
        <h3>Módulos</h3>
        {progress.moduleProgress.map(module => (
          <ModuleCard
            key={module.moduleId}
            name={module.moduleName}
            progress={module.progressPercentage}
            avgScore={module.averageScore}
          />
        ))}
      </section>

      {/* Dashboard Stats */}
      {dashboard && (
        <section>
          <StatCard icon="coin" value={dashboard.stats.mlCoins} label="ML Coins" />
          <StatCard icon="star" value={dashboard.stats.totalXP} label="XP" />
          <StatCard icon="rank" value={dashboard.stats.currentRank} label="Rango" />
        </section>
      )}
    </div>
  );
};
```

---

### Historial de Intentos

```typescript
import { getExerciseAttempts } from '@/features/progress/api';

const AttemptsHistory = ({ userId, exerciseId }: Props) => {
  const [attempts, setAttempts] = useState<ExerciseAttempt[]>([]);

  useEffect(() => {
    const fetchAttempts = async () => {
      const data = await getExerciseAttempts(userId, { exerciseId });
      setAttempts(data);
    };
    fetchAttempts();
  }, [userId, exerciseId]);

  return (
    <table>
      <thead>
        <tr>
          <th>Intento</th>
          <th>Score</th>
          <th>Tiempo</th>
          <th>Recompensas</th>
          <th>Fecha</th>
        </tr>
      </thead>
      <tbody>
        {attempts.map(attempt => (
          <tr key={attempt.id}>
            <td>#{attempt.attemptNumber}</td>
            <td>
              {attempt.score}/{attempt.maxScore}
              {attempt.isPerfect && ' ⭐'}
            </td>
            <td>{Math.floor(attempt.timeSpent / 60)}m</td>
            <td>
              {attempt.mlCoinsEarned} ML + {attempt.xpEarned} XP
            </td>
            <td>{formatDate(attempt.completedAt)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

---

## ⚠️ Error Handling

### Manejo de Errores

Todos los métodos usan `handleAPIError` para manejo consistente de errores.

```typescript
import { submitExercise } from '@/features/progress/api';

try {
  const result = await submitExercise('exercise-123', submission);
} catch (error) {
  if (error.code === 'EXERCISE_NOT_FOUND') {
    showError('Ejercicio no encontrado');
  } else if (error.code === 'INVALID_ANSWERS') {
    showError('Respuestas inválidas');
  } else if (error.code === 'NETWORK_ERROR') {
    showError('Error de conexión. Intenta de nuevo.');
  } else {
    showError('Error inesperado');
  }
}
```

### Códigos de Error Comunes

| Código | Descripción |
|--------|-------------|
| `EXERCISE_NOT_FOUND` | Ejercicio no existe |
| `INVALID_ANSWERS` | Formato de respuestas inválido |
| `ALREADY_COMPLETED` | Ejercicio ya completado (si tiene límite) |
| `INSUFFICIENT_POWERUPS` | PowerUp no disponible |
| `NETWORK_ERROR` | Error de red |
| `UNAUTHORIZED` | Token expirado o inválido |

---

## 🧪 Testing

### Mock Data

El API client incluye mock data para desarrollo:

```typescript
// apiConfig.ts
export const FEATURE_FLAGS = {
  USE_MOCK_DATA: process.env.VITE_USE_MOCK_DATA === 'true'
};
```

**Activar mocks:**
```bash
# .env.development
VITE_USE_MOCK_DATA=true
```

### Unit Tests

```typescript
import { submitExercise, getProgress } from '@/features/progress/api';
import { vi } from 'vitest';

describe('progressAPI', () => {
  describe('submitExercise', () => {
    it('should submit exercise and return result', async () => {
      const submission = {
        userId: 'user-1',
        answers: { q1: 'A' },
        startedAt: Date.now(),
        hintsUsed: 0,
        powerupsUsed: []
      };

      const result = await submitExercise('exercise-1', submission);

      expect(result.attemptId).toBeDefined();
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(result.rewards).toBeDefined();
      expect(result.rewards.mlCoins).toBeGreaterThan(0);
    });

    it('should award bonus for perfect score', async () => {
      // Mock perfect score
      const submission = {
        userId: 'user-1',
        answers: { /* all correct */ },
        startedAt: Date.now(),
        hintsUsed: 0
      };

      const result = await submitExercise('exercise-1', submission);

      if (result.isPerfect) {
        expect(result.rewards.bonuses.perfectScore).toBeDefined();
        expect(result.rewards.bonuses.noHints).toBeDefined();
      }
    });
  });

  describe('getProgress', () => {
    it('should fetch user progress', async () => {
      const progress = await getProgress('user-1');

      expect(progress.userId).toBe('user-1');
      expect(progress.overallProgress).toBeDefined();
      expect(progress.moduleProgress).toBeInstanceOf(Array);
      expect(progress.studyStreak).toBeDefined();
    });

    it('should calculate overall percentage correctly', async () => {
      const progress = await getProgress('user-1');

      const { completedExercises, totalExercises } = progress.overallProgress;
      const expectedPercentage = (completedExercises / totalExercises) * 100;

      expect(progress.overallProgress.overallPercentage)
        .toBeCloseTo(expectedPercentage);
    });
  });
});
```

---

## 🎯 Integración con React Query

### Setup Queries

```typescript
// queries/progressQueries.ts
import { queryOptions } from '@tanstack/react-query';
import * as progressAPI from '@/features/progress/api';

export const progressQueries = {
  progress: (userId: string) =>
    queryOptions({
      queryKey: ['progress', userId],
      queryFn: () => progressAPI.getProgress(userId),
      staleTime: 5 * 60 * 1000, // 5 minutes
    }),

  moduleProgress: (userId: string, moduleId: string) =>
    queryOptions({
      queryKey: ['moduleProgress', userId, moduleId],
      queryFn: () => progressAPI.getModuleProgress(userId, moduleId),
      staleTime: 5 * 60 * 1000,
    }),

  attempts: (userId: string, filters?: ExerciseAttemptFilters) =>
    queryOptions({
      queryKey: ['attempts', userId, filters],
      queryFn: () => progressAPI.getExerciseAttempts(userId, filters),
    }),
};
```

### Uso en Componentes

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { progressQueries } from '@/queries/progressQueries';
import * as progressAPI from '@/features/progress/api';

const Dashboard = ({ userId }: Props) => {
  // Fetch progress
  const { data, isLoading, error } = useQuery(
    progressQueries.progress(userId)
  );

  // Submit exercise mutation
  const submitMutation = useMutation({
    mutationFn: ({ exerciseId, submission }) =>
      progressAPI.submitExercise(exerciseId, submission),
    onSuccess: (data) => {
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  });

  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

  return <ProgressView data={data} />;
};
```

---

## 📊 Comparación con Backend API

| Frontend Method | Backend Endpoint | Método |
|----------------|------------------|--------|
| `submitExercise()` | `/api/educational/exercises/:id/submit` | POST |
| `getProgress()` | `/api/educational/progress/:userId` | GET |
| `getModuleProgress()` | `/api/educational/progress/:userId/module/:moduleId` | GET |
| `getExerciseAttempts()` | `/api/educational/attempts/:userId` | GET |
| `getUserActivities()` | `/api/educational/activities/:userId` | GET |
| `getActivityStats()` | `/api/educational/stats/:userId` | GET |
| `getUserActivitiesByType()` | `/api/educational/activities/:userId/:type` | GET |
| `getUserDashboard()` | `/api/educational/dashboard/:userId` | GET |

**Ver:** [`05-PROGRESS-API.md`](../../../../02-especificaciones-tecnicas/apis/api-reference/05-PROGRESS-API.md)

---

**Mantenedores:** @frontend-team, @backend-team
**Última actualización:** 2025-11-07
**Próxima revisión:** Trimestral
