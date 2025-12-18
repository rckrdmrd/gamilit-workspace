# Ejemplos de Uso - Tipos Canónicos DTO-001

Esta guía muestra cómo usar los nuevos tipos canónicos creados en DTO-001.

## Imports

### Import único desde barrel

```typescript
// ✅ RECOMENDADO: Import desde barrel
import {
  User,
  UserStats,
  Classroom,
  ExerciseSubmission,
  CreateClassroomDto,
  UserRole,
} from '@shared/types';
```

### Import específico (cuando necesario)

```typescript
// ⚠️ Solo cuando necesites optimizar bundle size
import type { UserStats } from '@shared/types/user-stats.types';
import type { Classroom } from '@shared/types/classroom.types';
```

---

## 1. UserStats - Estadísticas de Usuario

### Uso en componentes

```typescript
import { UserStats, UserStatsSummary } from '@shared/types';

interface StatsWidgetProps {
  stats: UserStats;
}

export function StatsWidget({ stats }: StatsWidgetProps) {
  return (
    <div>
      <h3>Nivel {stats.level}</h3>
      <p>XP: {stats.totalXp} / {stats.xpToNextLevel}</p>
      <p>Rango: {stats.currentRank}</p>
      <p>ML Coins: {stats.mlCoins}</p>
      <p>Racha: {stats.currentStreak} días</p>
    </div>
  );
}

// Uso de la versión simplificada
interface QuickStatsProps {
  stats: UserStatsSummary;
}

export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <div>
      <span>{stats.totalXp} XP</span>
      <span>{stats.mlCoins} ML</span>
      <span>Nivel {stats.level}</span>
    </div>
  );
}
```

### Uso en hooks

```typescript
import { UserStats } from '@shared/types';
import { useQuery } from '@tanstack/react-query';

export function useUserStats(userId: string) {
  return useQuery<UserStats>({
    queryKey: ['user-stats', userId],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/stats`);
      return response.json();
    },
  });
}

// Uso del hook
function DashboardPage() {
  const { data: stats } = useUserStats(currentUserId);

  if (!stats) return <Loading />;

  return <StatsWidget stats={stats} />;
}
```

### Uso en servicios API

```typescript
import { UserStats } from '@shared/types';
import { apiClient } from '@/config/api.config';

export async function getUserStats(userId: string): Promise<UserStats> {
  const { data } = await apiClient.get<UserStats>(`/users/${userId}/stats`);
  return data;
}

export async function getLeaderboardStats(): Promise<UserStats[]> {
  const { data } = await apiClient.get<UserStats[]>('/leaderboard/stats');
  return data;
}
```

---

## 2. Classroom - Gestión de Aulas

### Crear aula

```typescript
import { CreateClassroomDto, Classroom } from '@shared/types';

async function createClassroom(teacherId: string): Promise<Classroom> {
  const newClassroom: CreateClassroomDto = {
    name: 'Matemáticas 5A',
    code: 'MAT-5A-2024',
    description: 'Curso de matemáticas para quinto grado',
    gradeLevel: '5',
    section: 'A',
    subject: 'Matemáticas',
    academicYear: '2024-2025',
    capacity: 40,
    schedule: [
      {
        day: 'lunes',
        startTime: '08:00',
        endTime: '10:00',
      },
      {
        day: 'miércoles',
        startTime: '14:00',
        endTime: '16:00',
      },
    ],
    settings: {
      requireApproval: true,
      visibleInDirectory: true,
      allowSelfEnrollment: false,
      notifyNewActivities: true,
      showLeaderboard: true,
    },
  };

  const response = await apiClient.post<Classroom>('/classrooms', newClassroom);
  return response.data;
}
```

### Listar aulas con filtros

```typescript
import {
  Classroom,
  ClassroomQueryFilters,
  PaginatedClassrooms
} from '@shared/types';

async function getClassrooms(
  filters: ClassroomQueryFilters
): Promise<PaginatedClassrooms> {
  const params = new URLSearchParams();

  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.search) params.append('search', filters.search);
  if (filters.status) params.append('status', filters.status);
  if (filters.gradeLevel) params.append('gradeLevel', filters.gradeLevel);

  const response = await apiClient.get<PaginatedClassrooms>(
    `/classrooms?${params.toString()}`
  );

  return response.data;
}

// Uso en componente
function ClassroomList() {
  const [filters, setFilters] = useState<ClassroomQueryFilters>({
    page: 1,
    limit: 10,
    status: 'active',
  });

  const { data } = useQuery({
    queryKey: ['classrooms', filters],
    queryFn: () => getClassrooms(filters),
  });

  return (
    <div>
      {data?.data.map((classroom) => (
        <ClassroomCard key={classroom.id} classroom={classroom} />
      ))}
      <Pagination {...data?.pagination} />
    </div>
  );
}
```

### Mostrar estudiantes del aula

```typescript
import { StudentInClassroom } from '@shared/types';

interface StudentListProps {
  students: StudentInClassroom[];
}

export function StudentList({ students }: StudentListProps) {
  return (
    <table>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Progreso</th>
          <th>Promedio</th>
          <th>ML Coins</th>
          <th>Rango</th>
          <th>Última Actividad</th>
        </tr>
      </thead>
      <tbody>
        {students.map((student) => (
          <tr key={student.userId}>
            <td>{student.fullName}</td>
            <td>{student.progressPercentage}%</td>
            <td>{student.scoreAverage?.toFixed(1)}</td>
            <td>{student.totalMlCoins}</td>
            <td>{student.currentRank || 'N/A'}</td>
            <td>{formatDate(student.lastActivity)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## 3. ExerciseSubmission - Envíos de Ejercicios

### Enviar ejercicio

```typescript
import {
  CreateExerciseSubmissionDto,
  ExerciseSubmission,
  VerificadorFakeNewsContent,
} from '@shared/types';

async function submitExercise(
  exerciseId: string,
  userId: string
): Promise<ExerciseSubmission> {
  // Contenido específico del ejercicio
  const answerData: VerificadorFakeNewsContent = {
    type: 'verificador_fake_news',
    claimsVerified: [
      {
        claimId: 'claim-1',
        isFake: true,
        evidence: 'La fuente no es verificable y contiene información inconsistente.',
        sources: ['https://factcheck.org/article-123'],
      },
      {
        claimId: 'claim-2',
        isFake: false,
        evidence: 'Confirmado por múltiples fuentes confiables.',
        sources: ['https://reuters.com/article-456', 'https://apnews.com/article-789'],
      },
    ],
  };

  const submission: CreateExerciseSubmissionDto = {
    exerciseId,
    answerData,
    timeSpentSeconds: 420, // 7 minutos
    hintsCount: 1,
    comodinesUsed: ['pistas'],
    mlCoinsSpent: 15,
    startedAt: new Date(Date.now() - 420000).toISOString(),
  };

  const response = await apiClient.post<ExerciseSubmission>(
    `/exercises/${exerciseId}/submissions`,
    submission
  );

  return response.data;
}
```

### Mostrar resultado de envío

```typescript
import { ExerciseSubmission, RankUpInfo } from '@shared/types';

interface SubmissionResultProps {
  submission: ExerciseSubmission;
}

export function SubmissionResult({ submission }: SubmissionResultProps) {
  const scorePercentage = (submission.score / submission.maxScore) * 100;
  const passed = submission.isCorrect || scorePercentage >= 70;

  return (
    <div className={passed ? 'success' : 'fail'}>
      <h2>{passed ? '¡Excelente!' : 'Intenta de nuevo'}</h2>

      <div className="score">
        <span>{submission.score} / {submission.maxScore}</span>
        <span>{scorePercentage.toFixed(1)}%</span>
      </div>

      <div className="rewards">
        <div>
          <span>+{submission.xpEarned} XP</span>
          <span>+{submission.mlCoinsEarned} ML Coins</span>
        </div>

        {submission.rankUp && (
          <RankUpNotification rankUp={submission.rankUp} />
        )}
      </div>

      {submission.feedback && (
        <div className="feedback">
          <p>{submission.feedback}</p>
        </div>
      )}

      <div className="stats">
        <span>Tiempo: {formatTime(submission.timeSpentSeconds)}</span>
        <span>Intento: {submission.attemptNumber}</span>
        {submission.hintsCount > 0 && (
          <span>Pistas usadas: {submission.hintsCount}</span>
        )}
      </div>
    </div>
  );
}

function RankUpNotification({ rankUp }: { rankUp: RankUpInfo }) {
  return (
    <div className="rank-up">
      <h3>¡Ascendiste de rango!</h3>
      <p>{rankUp.previousRank} → {rankUp.newRank}</p>
      <p>Bonus: +{rankUp.bonusMLCoins} ML Coins</p>
      <p>Nuevo multiplicador: {rankUp.newMultiplier}x</p>
    </div>
  );
}
```

### Listar envíos con filtros

```typescript
import {
  SubmissionQueryFilters,
  PaginatedSubmissions
} from '@shared/types';

async function getSubmissions(
  filters: SubmissionQueryFilters
): Promise<PaginatedSubmissions> {
  const params = new URLSearchParams();

  if (filters.userId) params.append('userId', filters.userId);
  if (filters.exerciseId) params.append('exerciseId', filters.exerciseId);
  if (filters.status) params.append('status', filters.status);
  if (filters.minScore) params.append('minScore', filters.minScore.toString());

  const response = await apiClient.get<PaginatedSubmissions>(
    `/submissions?${params.toString()}`
  );

  return response.data;
}

// Uso en componente de historial
function SubmissionHistory({ userId }: { userId: string }) {
  const { data } = useQuery({
    queryKey: ['submissions', userId],
    queryFn: () => getSubmissions({
      userId,
      page: 1,
      limit: 20,
      sortBy: 'submittedAt',
      sortOrder: 'desc',
    }),
  });

  return (
    <div>
      {data?.data.map((submission) => (
        <SubmissionCard key={submission.id} submission={submission} />
      ))}
    </div>
  );
}
```

---

## 4. User - Gestión de Usuarios

### Crear usuario

```typescript
import { CreateUserDto, User, UserRole } from '@shared/types';

async function registerStudent(
  formData: RegisterFormData
): Promise<User> {
  const userData: CreateUserDto = {
    email: formData.email,
    password: formData.password,
    firstName: formData.firstName,
    lastName: formData.lastName,
    role: 'student' as UserRole,
    tenantId: getCurrentTenantId(),
    gradeLevel: formData.gradeLevel,
    schoolId: formData.schoolId,
    preferences: {
      theme: 'light',
      language: 'es',
      sounds: true,
      notifications: true,
      emailNotifications: true,
      pushNotifications: false,
    },
  };

  const response = await apiClient.post<User>('/auth/register', userData);
  return response.data;
}
```

### Actualizar perfil

```typescript
import { UpdateUserDto, User } from '@shared/types';

async function updateProfile(
  userId: string,
  updates: Partial<UpdateUserDto>
): Promise<User> {
  const response = await apiClient.patch<User>(
    `/users/${userId}`,
    updates
  );
  return response.data;
}

// Ejemplo de uso
function ProfileEditForm() {
  const mutation = useMutation({
    mutationFn: (updates: UpdateUserDto) =>
      updateProfile(currentUserId, updates),
    onSuccess: () => {
      toast.success('Perfil actualizado');
      queryClient.invalidateQueries(['user', currentUserId]);
    },
  });

  const handleSubmit = (data: UpdateUserDto) => {
    mutation.mutate({
      firstName: data.firstName,
      lastName: data.lastName,
      avatarUrl: data.avatarUrl,
      bio: data.bio,
      preferences: {
        ...currentPreferences,
        theme: data.preferences?.theme,
        language: data.preferences?.language,
      },
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Listar usuarios con filtros

```typescript
import { UserQueryFilters, PaginatedUsers } from '@shared/types';

async function getUsers(filters: UserQueryFilters): Promise<PaginatedUsers> {
  const params = new URLSearchParams();

  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());
  if (filters.search) params.append('search', filters.search);
  if (filters.role) params.append('role', filters.role);
  if (filters.status) params.append('status', filters.status);

  const response = await apiClient.get<PaginatedUsers>(
    `/users?${params.toString()}`
  );

  return response.data;
}

// Uso en admin panel
function UserManagementTable() {
  const [filters, setFilters] = useState<UserQueryFilters>({
    page: 1,
    limit: 20,
    status: 'active',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => getUsers(filters),
  });

  return (
    <div>
      <UserFilters filters={filters} onChange={setFilters} />
      <table>
        {/* ... tabla de usuarios ... */}
      </table>
      <Pagination {...data?.pagination} />
    </div>
  );
}
```

---

## 5. Type Guards y Utilidades

### Type Guards para discriminated unions

```typescript
import {
  ExerciseSubmissionContent,
  VerificadorFakeNewsContent,
  QuizTikTokContent,
} from '@shared/types';

function isVerificadorFakeNews(
  content: ExerciseSubmissionContent
): content is VerificadorFakeNewsContent {
  return content.type === 'verificador_fake_news';
}

function isQuizTikTok(
  content: ExerciseSubmissionContent
): content is QuizTikTokContent {
  return content.type === 'quiz_tiktok';
}

// Uso en componente
function SubmissionViewer({ content }: { content: ExerciseSubmissionContent }) {
  if (isVerificadorFakeNews(content)) {
    return (
      <div>
        <h3>Verificación de Noticias</h3>
        {content.claimsVerified.map((claim) => (
          <ClaimCard key={claim.claimId} claim={claim} />
        ))}
      </div>
    );
  }

  if (isQuizTikTok(content)) {
    return (
      <div>
        <h3>Quiz TikTok</h3>
        {content.answers.map((answer) => (
          <AnswerCard key={answer.questionId} answer={answer} />
        ))}
      </div>
    );
  }

  return <GenericViewer content={content} />;
}
```

### Utilidades de transformación

```typescript
import { UserStats, UserStatsSummary } from '@shared/types';

function toStatsSummary(stats: UserStats): UserStatsSummary {
  return {
    totalXp: stats.totalXp,
    mlCoins: stats.mlCoins,
    currentRank: stats.currentRank,
    level: stats.level,
    xpToNextLevel: stats.xpToNextLevel,
    exercisesCompleted: stats.exercisesCompleted,
    modulesCompleted: stats.modulesCompleted,
    averageScore: stats.averageScore || 0,
    totalTimeSpentMinutes: stats.totalTimeSpentMinutes,
    currentStreak: stats.currentStreak,
    maxStreak: stats.maxStreak,
    achievementsEarned: stats.achievementsEarned,
    certificatesEarned: stats.certificatesEarned,
  };
}
```

---

## 6. Integración con React Query

### Custom hooks tipados

```typescript
import {
  UserStats,
  Classroom,
  ExerciseSubmission
} from '@shared/types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Hook para estadísticas de usuario
export function useUserStats(userId: string) {
  return useQuery<UserStats>({
    queryKey: ['user-stats', userId],
    queryFn: () => getUserStats(userId),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

// Hook para aulas del profesor
export function useTeacherClassrooms(teacherId: string) {
  return useQuery<Classroom[]>({
    queryKey: ['teacher-classrooms', teacherId],
    queryFn: () => getTeacherClassrooms(teacherId),
  });
}

// Hook para enviar ejercicio
export function useSubmitExercise() {
  const queryClient = useQueryClient();

  return useMutation<
    ExerciseSubmission,
    Error,
    CreateExerciseSubmissionDto
  >({
    mutationFn: submitExercise,
    onSuccess: (submission) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries(['user-stats', submission.userId]);
      queryClient.invalidateQueries(['exercise-progress', submission.exerciseId]);

      // Actualizar cache optimista
      queryClient.setQueryData<ExerciseSubmission>(
        ['submission', submission.id],
        submission
      );
    },
  });
}

// Uso en componente
function ExercisePage() {
  const { data: stats } = useUserStats(currentUserId);
  const submitMutation = useSubmitExercise();

  const handleSubmit = async (answerData: ExerciseSubmissionContent) => {
    try {
      const submission = await submitMutation.mutateAsync({
        exerciseId: currentExerciseId,
        answerData,
        timeSpentSeconds: elapsedTime,
      });

      showSuccessNotification(submission);
    } catch (error) {
      showErrorNotification(error);
    }
  };

  return <ExerciseForm onSubmit={handleSubmit} />;
}
```

---

## Mejores Prácticas

1. **Siempre importar tipos desde el barrel** (`@shared/types`)
2. **Usar type guards** para discriminated unions
3. **Documentar custom hooks** con tipos de retorno explícitos
4. **Evitar `any`** - usar tipos específicos o `unknown`
5. **Crear tipos auxiliares** cuando se repite estructura
6. **Usar `Partial<T>`** para updates opcionales
7. **Usar `Pick<T, K>`** para subconjuntos de tipos
8. **Usar `Omit<T, K>`** para excluir campos

---

**Fecha:** 2025-12-05
**Tarea:** DTO-001
**Autor:** Frontend-Agent para GAMILIT
