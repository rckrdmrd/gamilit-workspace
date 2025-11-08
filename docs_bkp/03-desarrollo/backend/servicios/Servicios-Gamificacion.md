# Servicios de Gamificación y Educación

**Proyecto:** GAMILIT
**RFC:** RFC-0001
**Versión:** 1.0.0
**Última Actualización:** 2025-11-01

---

## Índice

1. [GamificationService](#1-gamificationservice)
2. [MissionsService](#2-missionsservice)
3. [EducationalService](#3-educationalservice)
4. [ClassroomService](#4-classroomservice)

---

## 1. GamificationService

**Archivo:** `/src/modules/gamification/gamification.service.ts`

**Responsabilidad:** Sistema de gamificación (monedas, XP, logros)

### Métodos Principales

#### `getUserStats(userId: string, dbClient?): Promise<UserStatsResponse>`

Obtiene estadísticas completas del usuario.

**Ejemplo de Uso:**
```typescript
const stats = await gamificationService.getUserStats(userId);

// Respuesta:
{
  userId: 'uuid',
  mlCoins: 1500,
  mlCoinsEarnedTotal: 5000,
  mlCoinsSpentTotal: 3500,
  totalXP: 12500,
  currentLevel: 15,
  currentRank: 'Gold',
  rankProgress: 75.5,
  streakDays: 7,
  longestStreak: 21,
  lastLoginAt: '2025-10-27T10:00:00Z',
  totalExercisesCompleted: 150,
  perfectScores: 45,
  averageScore: 87.3,
  updatedAt: '2025-10-27T10:30:00Z'
}
```

---

#### `addMLCoins(addCoinsDto, dbClient?): Promise<CoinsTransaction>`

Añade o resta ML Coins al usuario.

**Tipos de Transacciones:**
```typescript
type TransactionType =
  | 'exercise_completion'    // +50-200 coins
  | 'mission_reward'         // +100-500 coins
  | 'achievement_unlock'     // +50-1000 coins
  | 'daily_login'           // +10 coins
  | 'streak_bonus'          // +50-500 coins
  | 'purchase'              // -XXX coins
  | 'admin_adjustment';     // +/- any
```

**Ejemplo de Uso:**
```typescript
const result = await gamificationService.addMLCoins({
  userId: 'uuid',
  amount: 100,
  reason: 'Completed exercise: Variables',
  transactionType: 'exercise_completion',
  referenceId: 'exercise-uuid'
});

// Respuesta:
{
  newBalance: 1600,
  transaction: {
    amount: 100,
    reason: 'Completed exercise: Variables',
    balanceAfter: 1600
  }
}
```

**Validaciones:**
- Amount != 0
- Si amount < 0, verifica saldo suficiente
- Lanza `INSUFFICIENT_FUNDS` si no hay saldo

---

#### `getMLCoinsTransactions(userId, limit?, dbClient?): Promise<Transaction[]>`

Obtiene historial de transacciones.

**Ejemplo de Uso:**
```typescript
const transactions = await gamificationService.getMLCoinsTransactions(
  userId,
  20  // últimas 20 transacciones
);

// Respuesta:
[
  {
    id: 'uuid',
    userId: 'uuid',
    amount: 100,
    transactionType: 'exercise_completion',
    reason: 'Completed exercise: Variables',
    referenceId: 'exercise-uuid',
    balanceAfter: 1600,
    createdAt: '2025-10-27T10:30:00Z'
  },
  // ... más transacciones
]
```

---

#### `getAllAchievements(): Promise<Achievement[]>`

Obtiene todos los logros disponibles.

**Ejemplo de Respuesta:**
```typescript
[
  {
    id: 'uuid',
    name: 'First Steps',
    description: 'Complete your first exercise',
    category: 'progress',
    icon: '🎯',
    rarity: 'common',
    mlCoinsReward: 50,
    xpReward: 100,
    isSecret: false,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'uuid',
    name: 'Code Master',
    description: 'Complete 100 exercises',
    category: 'mastery',
    icon: '👑',
    rarity: 'legendary',
    mlCoinsReward: 1000,
    xpReward: 5000,
    isSecret: false,
    createdAt: '2024-01-01T00:00:00Z'
  }
]
```

**Categorías de Logros:**
- `progress` - Progreso general
- `mastery` - Dominio de temas
- `social` - Interacciones sociales
- `streak` - Rachas de actividad
- `special` - Eventos especiales

**Rareza:**
- `common` - 50-100 coins
- `uncommon` - 100-200 coins
- `rare` - 200-500 coins
- `epic` - 500-1000 coins
- `legendary` - 1000+ coins

---

#### `getUserAchievements(userId, dbClient?): Promise<UserAchievement[]>`

Obtiene logros desbloqueados del usuario.

**Ejemplo de Respuesta:**
```typescript
[
  {
    id: 'uuid',
    userId: 'uuid',
    achievementId: 'uuid',
    achievement: {
      name: 'First Steps',
      description: 'Complete your first exercise',
      icon: '🎯',
      rarity: 'common',
      mlCoinsReward: 50,
      xpReward: 100
    },
    unlockedAt: '2025-10-20T15:30:00Z',
    progress: 100
  }
]
```

---

#### `unlockAchievement(unlockDto, dbClient?): Promise<UnlockResult>`

Desbloquea logro para el usuario.

**Flujo:**
```
1. Verificar logro existe
2. Verificar no desbloqueado previamente
3. Crear registro en user_achievements
4. Otorgar recompensas (coins + XP)
5. Enviar notificación
6. Retornar resultado con recompensas
```

**Ejemplo de Uso:**
```typescript
const result = await gamificationService.unlockAchievement({
  userId: 'uuid',
  achievementId: 'uuid',
  progress: 100
});

// Respuesta:
{
  userAchievement: {
    id: 'uuid',
    userId: 'uuid',
    achievementId: 'uuid',
    unlockedAt: '2025-10-27T10:30:00Z',
    progress: 100
  },
  rewards: {
    mlCoins: 50,
    xp: 100
  }
}
```

**Códigos de Error:**
- `ACHIEVEMENT_ALREADY_UNLOCKED` - Ya desbloqueado
- `ACHIEVEMENT_NOT_FOUND` - No existe

---

## 2. MissionsService

**Archivo:** `/src/modules/gamification/missions/missions.service.ts`

**Responsabilidad:** Sistema de misiones diarias y semanales

### Tipos de Misiones

```typescript
type MissionType = 'daily' | 'weekly' | 'special';

interface Mission {
  id: string;
  userId: string;
  templateId: string;
  title: string;
  description: string;
  type: MissionType;
  objectives: Objective[];
  rewards: Rewards;
  status: 'active' | 'completed' | 'expired' | 'claimed';
  startDate: Date;
  endDate: Date;
  completedAt?: Date;
  claimedAt?: Date;
}

interface Objective {
  id: string;
  description: string;
  target: number;
  current: number;
  completed: boolean;
}

interface Rewards {
  mlCoins: number;
  xp: number;
}
```

### Métodos Principales

#### `getActiveMissions(userId): Promise<Mission[]>`

Obtiene misiones activas del usuario.

**Ejemplo de Respuesta:**
```typescript
[
  {
    id: 'uuid',
    userId: 'uuid',
    templateId: 'daily_exercise_3',
    title: 'Daily Practice',
    description: 'Complete 3 exercises today',
    type: 'daily',
    objectives: [
      {
        id: 'obj1',
        description: 'Complete exercises',
        target: 3,
        current: 1,
        completed: false
      }
    ],
    rewards: {
      mlCoins: 100,
      xp: 200
    },
    status: 'active',
    startDate: '2025-10-27T00:00:00Z',
    endDate: '2025-10-27T23:59:59Z'
  },
  {
    id: 'uuid',
    templateId: 'weekly_streak_5',
    title: 'Consistent Learner',
    description: 'Login 5 days this week',
    type: 'weekly',
    objectives: [
      {
        id: 'obj1',
        description: 'Login days',
        target: 5,
        current: 3,
        completed: false
      }
    ],
    rewards: {
      mlCoins: 500,
      xp: 1000
    },
    status: 'active',
    startDate: '2025-10-21T00:00:00Z',
    endDate: '2025-10-28T00:00:00Z'
  }
]
```

---

#### `updateMissionProgress(userId, missionId, progressData): Promise<Mission>`

Actualiza progreso de una misión.

**Ejemplo de Uso:**
```typescript
const mission = await missionsService.updateMissionProgress(
  userId,
  missionId,
  { objectiveId: 'obj1', increment: 1 }
);

// Si se completa automáticamente:
{
  ...mission,
  status: 'completed',
  completedAt: '2025-10-27T10:30:00Z',
  objectives: [
    {
      id: 'obj1',
      description: 'Complete exercises',
      target: 3,
      current: 3,  // ← Actualizado
      completed: true
    }
  ]
}
```

**Auto-completado:**
- Cuando todos los objetivos alcanzan su target
- Status cambia a `completed`
- Se registra `completedAt`
- Se envía notificación al usuario

---

#### `claimMissionRewards(userId, missionId): Promise<ClaimResult>`

Reclama recompensas de misión completada.

**Flujo:**
```
1. Verificar misión existe y pertenece al usuario
2. Verificar status === 'completed'
3. Verificar no reclamada previamente
4. Otorgar recompensas (coins + XP)
5. Actualizar status a 'claimed'
6. Registrar claimedAt
7. Enviar notificación
8. Retornar resultado
```

**Ejemplo de Uso:**
```typescript
const result = await missionsService.claimMissionRewards(userId, missionId);

// Respuesta:
{
  mission: {
    id: 'uuid',
    status: 'claimed',
    claimedAt: '2025-10-27T10:35:00Z'
  },
  rewards: {
    mlCoins: 100,
    xp: 200
  },
  newBalance: {
    mlCoins: 1700,
    totalXP: 12700
  }
}
```

**Códigos de Error:**
- `MISSION_NOT_FOUND` - No existe
- `MISSION_NOT_COMPLETED` - Aún no completada
- `REWARDS_ALREADY_CLAIMED` - Ya reclamada

---

#### `checkMissionsProgress(userId): Promise<Mission[]>`

Verifica progreso de todas las misiones activas.

**Uso en Cron Job:**
```typescript
// Ejecutado cada hora por missions.cron.ts
const completedMissions = await missionsService.checkMissionsProgress(userId);

// Auto-completa misiones que alcanzaron 100%
// Envía notificaciones de completado
// Retorna array de misiones completadas
```

---

## 3. EducationalService

**Archivo:** `/src/modules/educational/modules.service.ts`

**Responsabilidad:** Gestión de módulos educativos y ejercicios

### Componentes

- `ModulesService` - CRUD de módulos
- `ExercisesService` - CRUD de ejercicios
- `ProgressService` - Tracking de progreso
- `ScoringService` - Sistema de puntuación
- `AnalyticsService` - Métricas de aprendizaje

### ExercisesService - Métodos Clave

#### `submitExercise(userId, exerciseId, submission): Promise<SubmissionResult>`

Procesa envío de ejercicio.

**Flujo:**
```
1. Validar ejercicio existe
2. Validar formato de respuesta
3. Evaluar respuesta (automático o manual)
4. Calcular puntuación
5. Actualizar progreso
6. Otorgar recompensas si completo
7. Verificar logros desbloqueados
8. Enviar notificaciones
9. Retornar resultado
```

**Ejemplo de Uso:**
```typescript
const result = await exercisesService.submitExercise(
  userId,
  exerciseId,
  {
    answers: {
      'question1': 'answer1',
      'question2': ['option1', 'option2']
    },
    timeSpent: 180  // segundos
  }
);

// Respuesta:
{
  submissionId: 'uuid',
  score: 90,
  maxScore: 100,
  percentage: 90,
  passed: true,
  feedback: {
    overall: 'Great job!',
    byQuestion: {
      'question1': { correct: true, feedback: 'Perfect!' },
      'question2': { correct: false, feedback: 'Review this topic...' }
    }
  },
  rewards: {
    mlCoins: 150,
    xp: 300
  },
  achievements: ['uuid'], // IDs de logros desbloqueados
  newStats: {
    totalExercisesCompleted: 151,
    averageScore: 87.5
  }
}
```

---

## 4. ClassroomService

**Archivo:** `/src/modules/teacher/classroom.service.ts`

**Responsabilidad:** Gestión de aulas virtuales para profesores

### Métodos Principales

#### `createClassroom(teacherId, classroomData): Promise<Classroom>`

Crea un aula virtual.

**Ejemplo:**
```typescript
const classroom = await classroomService.createClassroom(teacherId, {
  name: 'Programming 101',
  description: 'Introduction to programming',
  subject: 'Computer Science',
  grade: '10th',
  academicYear: '2024-2025'
});

// Respuesta:
{
  id: 'uuid',
  teacherId: 'uuid',
  name: 'Programming 101',
  code: 'PROG101',  // Auto-generado para que estudiantes se unan
  description: '...',
  subject: 'Computer Science',
  grade: '10th',
  academicYear: '2024-2025',
  isActive: true,
  createdAt: '2025-10-27T10:30:00Z'
}
```

---

#### `addStudent(classroomId, studentId): Promise<void>`

Añade estudiante al aula.

**Validaciones:**
- Classroom existe y activo
- Usuario requester es teacher del aula o admin
- Student existe y role === 'student'
- Student no ya en el aula

---

#### `getClassroomProgress(classroomId): Promise<ClassProgress>`

Obtiene progreso agregado del aula.

**Ejemplo de Respuesta:**
```typescript
{
  classroomId: 'uuid',
  totalStudents: 25,
  averageProgress: 67.5,
  averageScore: 82.3,
  completionRate: 45.2,
  studentsProgress: [
    {
      studentId: 'uuid',
      studentName: 'John Doe',
      progress: 75.5,
      averageScore: 88.0,
      exercisesCompleted: 45,
      lastActivity: '2025-10-27T09:00:00Z'
    },
    // ... más estudiantes
  ],
  moduleProgress: [
    {
      moduleId: 'uuid',
      moduleName: 'Variables',
      averageCompletion: 80.5,
      averageScore: 85.2
    },
    // ... más módulos
  ]
}
```

---

## Diagrama de Flujo de Gamificación

```
┌──────────────────────┐
│  Usuario Completa    │
│  Ejercicio           │
└──────────┬───────────┘
           │
           ↓
┌──────────────────────┐
│  ExercisesService    │
│  submitExercise()    │
└──────────┬───────────┘
           │
           ├─────────────────┬──────────────┬──────────────┐
           │                 │              │              │
           ↓                 ↓              ↓              ↓
┌──────────────────┐  ┌─────────────┐  ┌──────────┐  ┌────────────┐
│ GamificationSvc  │  │ MissionsSvc │  │ ProgressSvc│  │Notifications│
│ addMLCoins()     │  │ updateProg()│  │ update()   │  │ create()   │
│ unlockAchiev()   │  └─────────────┘  └──────────┘  └────────────┘
└──────────────────┘
```

---

## Documentos Relacionados

> **Implementa requerimientos:**
> - [Sistema de Gamificación](../../../01-requerimientos/gamificacion/) - Requerimientos completos
> - [UC-STU-005 - Ganar ML Coins](../../../01-requerimientos/casos-uso/student/UC-STU-005-ganar-ml-coins.md)
> - [UC-STU-006 - Subir de Rango](../../../01-requerimientos/casos-uso/student/UC-STU-006-subir-rango.md)
> - [RNF-GAM-001 - Sistema de Rangos Maya](../../../01-requerimientos/requerimientos-no-funcionales/RNF-GAM-001-rangos-maya.md)

**Especificaciones técnicas:**
- [ADR-004 - Gamification System Design](../../../02-especificaciones-tecnicas/adr/ADR-004-gamification-system-design.md)
- [Gamification API](../../../02-especificaciones-tecnicas/apis/gamificacion-api/README.md) - Especificación completa
- [TYPES-GAMIFICATION](../../../02-especificaciones-tecnicas/tipos-compartidos/TYPES-GAMIFICATION.md) - Tipos TypeScript

**Desarrollo:**
- [API Gamification](../api/API-Gamification.md) - Endpoints de gamificación
- [API Educational](../api/API-Educational.md) - Endpoints educativos
- [Base de Datos - Gamification Schema](../../base-de-datos/schemas/gamification_system/) - Esquema de BD
- [README de Servicios](./README.md) - Índice de servicios

---

**Última revisión:** 2025-11-01
