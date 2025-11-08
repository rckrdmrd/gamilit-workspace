# Tipos Compartidos - Progreso Educativo

**Proyecto:** Gamilit Platform
**Módulo:** Tipos TypeScript Compartidos
**Categoría:** Educational Content - Submissions, Progress & Analytics
**Archivo original:** SHARED-TYPES-LIBRARY.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Descripción

Este archivo contiene los tipos relacionados con envíos, progreso y analíticas educativas:
- **SubmitExerciseDto**: Payload de envío de ejercicio
- **SubmissionResponse**: Respuesta de evaluación de ejercicio
- **ExerciseAttempt**: Registro de intento de ejercicio
- **ModuleProgress**: Progreso del estudiante en módulos
- **LearningAnalytics**: Analíticas de aprendizaje

---

#### 6.3.3 SubmitExerciseDto

**Description**: Exercise submission payload

**TypeScript Definition**:
```typescript
interface SubmitExerciseDto {
  userId: string;
  exerciseId: string;
  answer?: any;
  answers?: any;
  timeSpent: number;
  hintsUsed: number;
  powerupsUsed?: ComodinType[];
  comodinesUsed?: {
    type: ComodinType;
    count: number;
  }[];
  attemptNumber?: number;
  startedAt?: string | Date;
  sessionId?: string;
}
```

**Zod Schema**:
```typescript
const submitExerciseSchema = z.object({
  userId: z.string().uuid(),
  exerciseId: z.string().uuid(),
  answer: z.any().optional(),
  answers: z.any().optional(),
  timeSpent: z.number().int().min(0),
  hintsUsed: z.number().int().min(0).default(0),
  powerupsUsed: z.array(comodinTypeSchema).optional().default([]),
  comodinesUsed: z.array(z.object({
    type: comodinTypeSchema,
    count: z.number().int().positive()
  })).optional(),
  attemptNumber: z.number().int().positive().default(1),
  startedAt: z.union([z.string().datetime(), z.date()]).optional(),
  sessionId: z.string().optional(),
}).refine(data => data.answer !== undefined || data.answers !== undefined, {
  message: 'Se requiere answer o answers'
});
```

**Backend Usage**:
```typescript
import { SubmitExerciseDto, submitExerciseSchema } from '@glit/shared-types';

router.post('/exercises/:id/submit', async (req: AuthRequest, res: Response) => {
  const exerciseId = req.params.id;
  const userId = req.user!.id;

  const validatedData = submitExerciseSchema.parse({
    ...req.body,
    userId,
    exerciseId
  });

  const result = await exerciseService.submitExercise(validatedData);
  res.json(result);
});
```

---

#### 6.3.4 SubmissionResponse

**Description**: Exercise submission result

**TypeScript Definition**:
```typescript
interface SubmissionResponse {
  attemptId: string;
  score: number;
  isPerfect: boolean;
  correctAnswers: number;
  totalQuestions: number;
  rewards: SubmissionRewards;
  feedback: SubmissionFeedback;
  achievements: AchievementUnlocked[];
  rankUp?: RankUpInfo | null;
  createdAt: Date;
}

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

interface AchievementUnlocked {
  id: string;
  name: string;
  icon: string;
  rarity: string;
}

interface RankUpInfo {
  newRank: string;
  previousRank?: string;
  bonusMLCoins: number;
  newMultiplier: number;
}
```

**Zod Schema**:
```typescript
const submissionResponseSchema = z.object({
  attemptId: z.string().uuid(),
  score: z.number().min(0).max(100),
  isPerfect: z.boolean(),
  correctAnswers: z.number().int().min(0),
  totalQuestions: z.number().int().positive(),
  rewards: z.object({
    mlCoins: z.number().int().min(0),
    xp: z.number().int().min(0),
    bonuses: z.object({
      perfectScore: z.number().int().min(0).optional(),
      noHints: z.number().int().min(0).optional(),
      speedBonus: z.number().int().min(0).optional(),
      firstAttempt: z.number().int().min(0).optional(),
    })
  }),
  feedback: z.object({
    overall: z.string(),
    answerReview: z.array(z.object({
      questionId: z.string(),
      isCorrect: z.boolean(),
      userAnswer: z.string(),
      correctAnswer: z.string(),
      explanation: z.string().optional()
    }))
  }),
  achievements: z.array(z.object({
    id: z.string().uuid(),
    name: z.string(),
    icon: z.string(),
    rarity: z.string()
  })),
  rankUp: z.object({
    newRank: z.string(),
    previousRank: z.string().optional(),
    bonusMLCoins: z.number().int().min(0),
    newMultiplier: z.number().min(1)
  }).nullable().optional(),
  createdAt: z.date()
});
```

**Example Data**:
```typescript
const exampleSubmissionResponse: SubmissionResponse = {
  attemptId: 'attempt-123',
  score: 85,
  isPerfect: false,
  correctAnswers: 17,
  totalQuestions: 20,
  rewards: {
    mlCoins: 50,
    xp: 100,
    bonuses: {
      speedBonus: 10,
      firstAttempt: 20
    }
  },
  feedback: {
    overall: 'Buen trabajo! Alcanzaste el 85% de respuestas correctas',
    answerReview: [
      {
        questionId: 'q1',
        isCorrect: true,
        userAnswer: 'POLONIA',
        correctAnswer: 'POLONIA'
      },
      {
        questionId: 'q2',
        isCorrect: false,
        userAnswer: 'RADIO',
        correctAnswer: 'POLONIO',
        explanation: 'Marie Curie descubrió el elemento Polonio, nombrado por su país natal'
      }
    ]
  },
  achievements: [],
  rankUp: null,
  createdAt: new Date('2025-01-15T10:30:00Z')
};
```

---

#### 6.3.5 ExerciseAttempt

**Description**: Historical exercise attempt record

**TypeScript Definition**:
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
  powerupsUsed: ComodinType[];
  answers: any;
  feedback: any;
  isPerfect: boolean;
  mlCoinsEarned: number;
  xpEarned: number;
  attemptNumber: number;
  startedAt: Date;
  completedAt: Date;
}
```

**Zod Schema**:
```typescript
const exerciseAttemptSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  exerciseId: z.string().uuid(),
  exerciseTitle: z.string(),
  score: z.number().min(0),
  maxScore: z.number().positive(),
  percentage: z.number().min(0).max(100),
  timeSpent: z.number().int().min(0),
  hintsUsed: z.number().int().min(0),
  powerupsUsed: z.array(comodinTypeSchema),
  answers: z.any(),
  feedback: z.any(),
  isPerfect: z.boolean(),
  mlCoinsEarned: z.number().int().min(0),
  xpEarned: z.number().int().min(0),
  attemptNumber: z.number().int().positive(),
  startedAt: z.date(),
  completedAt: z.date()
});
```

---

#### 6.3.6 ModuleProgress

**Description**: User progress in a module

**TypeScript Definition**:
```typescript
interface ModuleProgress {
  userId: string;
  moduleId: string;
  moduleName: string;
  totalExercises: number;
  completedExercises: number;
  progressPercentage: number;
  averageScore: number;
  timeSpent: number;
  lastActivityAt: Date;
}
```

**Zod Schema**:
```typescript
const moduleProgressSchema = z.object({
  userId: z.string().uuid(),
  moduleId: z.string().uuid(),
  moduleName: z.string(),
  totalExercises: z.number().int().min(0),
  completedExercises: z.number().int().min(0),
  progressPercentage: z.number().min(0).max(100),
  averageScore: z.number().min(0).max(100),
  timeSpent: z.number().int().min(0),
  lastActivityAt: z.date()
});
```

---

#### 6.3.7 LearningAnalytics

**Description**: Comprehensive learning analytics

**TypeScript Definition**:
```typescript
interface LearningAnalytics {
  timeframe: string;
  summary: AnalyticsSummary;
  performanceByModule: ModulePerformance[];
  performanceByType: TypePerformance[];
  studyPattern: StudyPattern;
  trends: AnalyticsTrends;
}

interface AnalyticsSummary {
  totalTimeStudied: number;
  exercisesCompleted: number;
  averageScore: number;
  perfectScores: number;
  improvementRate: number;
}

interface ModulePerformance {
  moduleId: string;
  moduleName: string;
  averageScore: number;
  exercisesCompleted: number;
  timeSpent: number;
  improvement: number;
}

interface TypePerformance {
  exerciseType: ExerciseType;
  averageScore: number;
  totalAttempts: number;
  successRate: number;
}

interface StudyPattern {
  averageSessionDuration: number;
  preferredStudyTime: string;
  mostActiveDay: string;
  studyConsistency: number;
}

interface AnalyticsTrends {
  scoreOverTime: Array<{ date: string; averageScore: number }>;
  activityOverTime: Array<{
    date: string;
    exercisesCompleted: number;
    minutesStudied: number
  }>;
}
```

**Zod Schema**:
```typescript
const learningAnalyticsSchema = z.object({
  timeframe: z.string(),
  summary: z.object({
    totalTimeStudied: z.number().min(0),
    exercisesCompleted: z.number().int().min(0),
    averageScore: z.number().min(0).max(100),
    perfectScores: z.number().int().min(0),
    improvementRate: z.number()
  }),
  performanceByModule: z.array(z.object({
    moduleId: z.string().uuid(),
    moduleName: z.string(),
    averageScore: z.number().min(0).max(100),
    exercisesCompleted: z.number().int().min(0),
    timeSpent: z.number().int().min(0),
    improvement: z.number()
  })),
  performanceByType: z.array(z.object({
    exerciseType: exerciseTypeSchema,
    averageScore: z.number().min(0).max(100),
    totalAttempts: z.number().int().min(0),
    successRate: z.number().min(0).max(100)
  })),
  studyPattern: z.object({
    averageSessionDuration: z.number().min(0),
    preferredStudyTime: z.string(),
    mostActiveDay: z.string(),
    studyConsistency: z.number().min(0).max(100)
  }),
  trends: z.object({
    scoreOverTime: z.array(z.object({
      date: z.string(),
      averageScore: z.number().min(0).max(100)
    })),
    activityOverTime: z.array(z.object({
      date: z.string(),
      exercisesCompleted: z.number().int().min(0),
      minutesStudied: z.number().int().min(0)
    }))
  })
});
```

---

