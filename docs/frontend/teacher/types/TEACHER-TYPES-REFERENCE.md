# Referencia de Tipos - Teacher Portal

**Version:** 1.0.0
**Fecha:** 2025-12-18
**Ubicacion:** `apps/frontend/src/apps/teacher/types/index.ts`

---

## TIPOS DE MONITOREO DE ESTUDIANTES

### StudentMonitoring

Representa el estado actual de monitoreo de un estudiante.

```typescript
interface StudentMonitoring {
  // Identificacion
  id: string;
  userId: string;
  name: string;
  email: string;
  avatarUrl?: string;

  // Estado actual
  currentModule?: string;
  currentModuleName?: string;
  currentExercise?: string;
  currentExerciseName?: string;
  lastActivityAt: string;

  // Estadisticas generales
  exercisesCompleted: number;
  totalExercises: number;
  averageScore: number;
  progressPercentage: number;
  timeSpentMinutes: number;

  // Gamificacion
  currentStreak: number;
  maxStreak: number;
  firstAttemptRate: number;
  powerUpsUsed: number;
  hintsUsed: number;
  totalSessions: number;

  // Progreso detallado
  moduleProgress: ModuleProgress[];
}
```

### ModuleProgress

Progreso de un estudiante en un modulo especifico.

```typescript
interface ModuleProgress {
  moduleId: string;
  moduleName: string;
  completedExercises: number;
  totalExercises: number;
  progressPercentage: number;
  averageScore?: number;
  timeSpentMinutes?: number;
}
```

### StudentStatus

Estado de actividad de un estudiante.

```typescript
type StudentStatus =
  | 'active'      // < 5 min sin actividad
  | 'in_exercise' // Ejercicio en progreso + < 30 min
  | 'inactive'    // 5-30 min sin actividad
  | 'offline';    // > 30 min sin actividad
```

### StudentPerformanceLevel

Nivel de rendimiento de un estudiante.

```typescript
type StudentPerformanceLevel =
  | 'high'   // > 80% score promedio
  | 'medium' // 50-80% score promedio
  | 'low';   // < 50% score promedio
```

---

## TIPOS DE RESPUESTAS DE EJERCICIOS

### AttemptResponse

Representa un intento de ejercicio por un estudiante.

```typescript
interface AttemptResponse {
  // Identificacion
  id: string;
  attemptNumber: number;

  // Estudiante
  studentId: string;
  studentName: string;
  studentEmail?: string;
  studentAvatarUrl?: string;

  // Ejercicio
  exerciseId: string;
  exerciseTitle: string;
  exerciseType: ExerciseType;
  moduleId: string;
  moduleName: string;

  // Resultado
  isCorrect: boolean;
  score: number;
  maxScore: number;
  timeSpentSeconds: number;

  // Respuestas
  studentAnswer: any;
  correctAnswer: any;

  // Gamificacion
  xpEarned: number;
  coinsEarned: number;
  hintsUsed: number;
  powerUpsUsed: string[];

  // Metadata
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  needsManualReview: boolean;
}
```

### GetAttemptsQuery

Parametros de consulta para obtener intentos.

```typescript
interface GetAttemptsQuery {
  classroomId?: string;
  studentId?: string;
  studentName?: string;
  exerciseId?: string;
  moduleId?: string;
  dateFrom?: string;
  dateTo?: string;
  isCorrect?: boolean;
  needsReview?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'submitted_at' | 'score' | 'time_spent';
  sortOrder?: 'asc' | 'desc';
}
```

### AttemptDetail

Detalle completo de un intento individual.

```typescript
interface AttemptDetail extends AttemptResponse {
  // Detalle adicional
  feedbackGiven?: string;
  teacherNotes?: string;
  autoFeedback?: string;

  // Comparacion de respuestas
  answerComparison?: {
    student: any;
    correct: any;
    differences?: string[];
  };

  // Historial de intentos
  previousAttempts?: {
    attemptNumber: number;
    score: number;
    isCorrect: boolean;
    submittedAt: string;
  }[];
}
```

---

## TIPOS DE NOTAS DEL PROFESOR

### TeacherNote

Nota privada del profesor sobre un estudiante.

```typescript
interface TeacherNote {
  id: string;
  teacherId: string;
  studentId: string;
  classroomId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  isPrivate: boolean;
}
```

### CreateNoteRequest

```typescript
interface CreateNoteRequest {
  studentId: string;
  classroomId: string;
  content: string;
  isPrivate?: boolean;
}
```

---

## TIPOS DE ALERTAS DE INTERVENCION

### InterventionAlert

Alerta de intervencion para un estudiante.

```typescript
interface InterventionAlert {
  id: string;
  studentId: string;
  studentName: string;
  type: InterventionAlertType;
  priority: AlertPriority;
  message: string;
  triggeredAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  metadata?: Record<string, any>;
}

type InterventionAlertType =
  | 'low_performance'      // Bajo rendimiento
  | 'inactivity'           // Inactividad prolongada
  | 'struggling'           // Dificultad repetida
  | 'missing_assignments'  // Tareas faltantes
  | 'streak_broken';       // Racha perdida

type AlertPriority =
  | 'high'
  | 'medium'
  | 'low';
```

---

## TIPOS DE PAGINACION

### PaginationParams

Parametros genericos de paginacion.

```typescript
interface PaginationParams {
  page?: number;
  limit?: number;
}
```

### PaginatedResponse<T>

Respuesta paginada generica.

```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
```

---

## TIPOS DE CLASSROOM

### ClassroomBasic

Informacion basica de un aula.

```typescript
interface ClassroomBasic {
  id: string;
  name: string;
  grade?: string;
  section?: string;
  schoolId?: string;
  teacherId?: string;
  studentCount?: number;
  isActive?: boolean;
}
```

### ClassroomDetail

Informacion completa de un aula.

```typescript
interface ClassroomDetail extends ClassroomBasic {
  description?: string;
  createdAt: string;
  updatedAt?: string;
  students?: StudentBasic[];
  assignments?: AssignmentBasic[];
}
```

---

## ENUMS Y CONSTANTES

### ExerciseType

```typescript
type ExerciseType =
  | 'multiple_choice'
  | 'drag_and_drop'
  | 'fill_blanks'
  | 'ordering'
  | 'matching'
  | 'open_response'
  | 'rueda_inferencias'
  | 'podcast_argumentativo'
  | 'verificador_fake_news'
  | 'quiz_tiktok'
  | 'analisis_memes'
  | 'infografia_interactiva'
  | 'navegacion_hipertextual'
  | 'diario_multimedia'
  | 'comic_digital'
  | 'video_carta';
```

### ModuleId

```typescript
type ModuleId =
  | 'module1'
  | 'module2'
  | 'module3'
  | 'module4'
  | 'module5';
```

---

## USO CON HOOKS

### useStudentMonitoring

```typescript
const {
  students,      // StudentMonitoring[]
  pagination,    // PaginatedResponse['pagination']
  isLoading,
  fetchStudents
} = useStudentMonitoring(classroomId);
```

### useExerciseResponses

```typescript
const {
  attempts,      // AttemptResponse[]
  pagination,    // PaginatedResponse['pagination']
  isLoading,
  fetchAttempts
} = useExerciseResponses(query: GetAttemptsQuery);
```

### useAttemptDetail

```typescript
const {
  attempt,       // AttemptDetail | null
  isLoading,
  error
} = useAttemptDetail(attemptId);
```

---

## REFERENCIAS

- [TEACHER-MONITORING-COMPONENTS.md](../components/TEACHER-MONITORING-COMPONENTS.md)
- [TEACHER-RESPONSE-MANAGEMENT.md](../components/TEACHER-RESPONSE-MANAGEMENT.md)
- [TEACHER-PAGES-SPECIFICATIONS.md](../pages/TEACHER-PAGES-SPECIFICATIONS.md)

---

**Ultima actualizacion:** 2025-12-18
