# Servicios Principales del Backend GAMILIT

## Índice de Servicios

1. [AuthService](#1-authservice)
2. [GamificationService](#2-gamificationservice)
3. [MissionsService](#3-missionsservice)
4. [NotificationsService](#4-notificationsservice)
5. [RealtimeService](#5-realtimeservice)
6. [EducationalService](#6-educationalservice)
7. [ClassroomService](#7-classroomservice)
8. [SessionManagementService](#8-sessionmanagementservice)
9. [SecurityService](#9-securityservice)

---

## 1. AuthService

**Archivo:** `/src/modules/auth/auth.service.ts`

**Responsabilidad:** Gestión completa de autenticación y autorización

### Métodos Principales

#### `register(registerDto: RegisterDto): Promise<AuthResponse>`

Registra un nuevo usuario en el sistema.

**Flujo:**
```
1. Validar email no existe
2. Validar fuerza de contraseña
3. Hash contraseña (bcrypt, 10 rounds)
4. Crear usuario en DB (email_verified=true por defecto)
5. Generar access token + refresh token
6. Retornar respuesta con tokens
```

**Ejemplo de Uso:**
```typescript
const authService = new AuthService(authRepository, sessionService);

const response = await authService.register({
  email: 'student@example.com',
  password: 'SecurePass123',
  role: 'student',
  firstName: 'John',
  lastName: 'Doe'
});

// Respuesta:
{
  user: {
    id: 'uuid',
    email: 'student@example.com',
    role: 'student',
    firstName: 'John',
    lastName: 'Doe',
    displayName: 'John'
  },
  token: 'eyJhbGciOiJIUzI1NiIs...',
  refreshToken: 'eyJhbGciOiJIUzI1NiIs...',
  expiresIn: '7d'
}
```

**Validaciones:**
- Email único (código: `EMAIL_EXISTS`)
- Contraseña fuerte: min 8 caracteres, 1 mayúscula, 1 minúscula, 1 número
- Rol válido: `student`, `teacher`, `admin`, `super_admin`

**NOTA IMPORTANTE:** La verificación de email está DESHABILITADA. Los usuarios son activados inmediatamente.

---

#### `login(loginDto: LoginDto, userAgent?, ipAddress?): Promise<AuthResponse>`

Autentica usuario existente.

**Flujo:**
```
1. Buscar usuario por email
2. Verificar usuario no eliminado (deleted_at IS NULL)
3. Comparar contraseña (bcrypt.compare)
4. Validar estado de cuenta (status != 'inactive', 'suspended', 'pending')
5. Actualizar last_sign_in timestamp
6. Generar tokens
7. Crear sesión (opcional, si SessionManagementService disponible)
8. Retornar respuesta con tokens
```

**Ejemplo de Uso:**
```typescript
const response = await authService.login(
  { email: 'student@example.com', password: 'SecurePass123' },
  'Mozilla/5.0...',
  '192.168.1.100'
);

// Respuesta idéntica a register()
```

**Estados de Cuenta:**
- `active` - Puede acceder
- `inactive` - Bloqueado (retorna 401)
- `suspended` - Suspendido temporalmente (retorna 403)
- `pending` - Pendiente de activación (retorna 403)

**Códigos de Error:**
- `INVALID_CREDENTIALS` - Credenciales incorrectas
- `ACCOUNT_INACTIVE` - Cuenta desactivada
- `ACCOUNT_SUSPENDED` - Cuenta suspendida

---

#### `refreshToken(refreshToken: string): Promise<{token: string, expiresIn: string}>`

Renueva access token usando refresh token.

**Flujo:**
```
1. Verificar refresh token (JWT)
2. Validar type === 'refresh'
3. Buscar usuario en DB
4. Validar estado de cuenta
5. Generar nuevo access token
6. Retornar nuevo token
```

**Ejemplo de Uso:**
```typescript
const result = await authService.refreshToken(refreshToken);

// Respuesta:
{
  token: 'eyJhbGciOiJIUzI1NiIs...',
  expiresIn: '7d'
}
```

---

#### `getUserProfile(userId: string): Promise<UserProfile>`

Obtiene perfil completo del usuario.

**Ejemplo de Uso:**
```typescript
const profile = await authService.getUserProfile(userId);

// Respuesta:
{
  id: 'uuid',
  email: 'student@example.com',
  role: 'student',
  firstName: 'John',
  lastName: 'Doe',
  displayName: 'John Doe',
  avatarUrl: 'https://...',
  createdAt: '2024-01-01T00:00:00Z'
}
```

---

#### `updatePassword(userId, currentPassword, newPassword): Promise<void>`

Actualiza contraseña del usuario.

**Flujo:**
```
1. Verificar usuario existe
2. Validar contraseña actual
3. Validar fuerza de nueva contraseña
4. Hash nueva contraseña
5. Actualizar en DB
6. Log de auditoría
```

---

### Métodos Privados

#### `generateAccessToken(user): string`

Genera JWT access token.

**Payload:**
```typescript
{
  sub: userId,        // Subject (user ID)
  email: userEmail,
  role: userRole,
  iat: timestamp,     // Issued at
  exp: timestamp,     // Expiration
  iss: 'glit-api',   // Issuer
  aud: 'glit-app'    // Audience
}
```

**Configuración:**
- Algoritmo: HS256
- Expiración: 7 días (configurable)
- Secret: `process.env.JWT_SECRET`

---

#### `generateRefreshToken(user): string`

Genera JWT refresh token.

**Payload:**
```typescript
{
  sub: userId,
  type: 'refresh',
  iat: timestamp,
  exp: timestamp,     // 30 días
  iss: 'glit-api'
}
```

---

#### `isPasswordStrong(password: string): boolean`

Valida fuerza de contraseña.

**Regex:**
```javascript
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
```

**Requisitos:**
- Mínimo 8 caracteres
- Al menos 1 mayúscula
- Al menos 1 minúscula
- Al menos 1 número

---

## 2. GamificationService

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

## 3. MissionsService

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

## 4. NotificationsService

**Archivo:** `/src/modules/notifications/notifications.service.ts`

**Responsabilidad:** Sistema de notificaciones persistentes

### Métodos Principales

#### `createNotification(notificationDto): Promise<Notification>`

Crea una nueva notificación.

**Tipos de Notificaciones:**
```typescript
type NotificationType =
  | 'achievement_unlocked'
  | 'mission_completed'
  | 'level_up'
  | 'friend_request'
  | 'guild_invitation'
  | 'assignment_graded'
  | 'new_assignment'
  | 'system_announcement';
```

**Ejemplo de Uso:**
```typescript
const notification = await notificationsService.createNotification({
  userId: 'uuid',
  type: 'achievement_unlocked',
  title: 'Achievement Unlocked!',
  message: 'You unlocked "First Steps"',
  data: {
    achievementId: 'uuid',
    achievementName: 'First Steps',
    rewards: { mlCoins: 50, xp: 100 }
  },
  priority: 'high'
});

// Respuesta:
{
  id: 'uuid',
  userId: 'uuid',
  type: 'achievement_unlocked',
  title: 'Achievement Unlocked!',
  message: 'You unlocked "First Steps"',
  data: { ... },
  priority: 'high',
  isRead: false,
  createdAt: '2025-10-27T10:30:00Z'
}
```

**Prioridades:**
- `low` - Informacional
- `medium` - Normal (default)
- `high` - Importante
- `urgent` - Crítico

**Integración con WebSocket:**
Al crear notificación, automáticamente se emite via Socket.IO:
```typescript
realtimeService.emitNotificationToUser(userId, notification);
```

---

#### `getUserNotifications(userId, options): Promise<Notification[]>`

Obtiene notificaciones del usuario.

**Opciones:**
```typescript
interface GetNotificationsOptions {
  limit?: number;       // Default: 20
  offset?: number;      // Default: 0
  unreadOnly?: boolean; // Default: false
  type?: NotificationType;
}
```

**Ejemplo de Uso:**
```typescript
const notifications = await notificationsService.getUserNotifications(
  userId,
  { limit: 10, unreadOnly: true }
);

// Respuesta: Array de notificaciones no leídas
```

---

#### `markAsRead(userId, notificationId): Promise<void>`

Marca notificación como leída.

**Flujo:**
```
1. Verificar notificación pertenece al usuario
2. Actualizar is_read = true
3. Actualizar read_at timestamp
4. Emitir evento via WebSocket (notification_read)
5. Actualizar contador de no leídas
```

---

#### `markAllAsRead(userId): Promise<number>`

Marca todas las notificaciones como leídas.

**Retorna:** Número de notificaciones actualizadas

---

#### `getUnreadCount(userId): Promise<number>`

Obtiene contador de notificaciones no leídas.

**Ejemplo:**
```typescript
const count = await notificationsService.getUnreadCount(userId);
// count: 5
```

---

#### `cleanupOldNotifications(daysOld: number): Promise<number>`

Elimina notificaciones leídas antiguas.

**Uso en Cron Job:**
```typescript
// Ejecutado diariamente a las 2:00 AM
const deletedCount = await notificationsService.cleanupOldNotifications(30);
// Elimina notificaciones leídas con más de 30 días
```

---

## 5. RealtimeService

**Archivo:** `/src/modules/notifications/services/realtime.service.ts`

**Responsabilidad:** Gestión de conexiones WebSocket y emisión en tiempo real

### Métodos Principales

#### `initialize(io: SocketIOServer): void`

Inicializa el servicio con instancia de Socket.IO.

```typescript
realtimeService.initialize(io);
```

---

#### `registerUserSocket(userId, socketId): void`

Registra socket del usuario.

**Estructura Interna:**
```typescript
private userSockets: Map<string, Set<string>> = new Map();

// Permite múltiples conexiones por usuario
userSockets.set(userId, new Set([socketId1, socketId2]));
```

---

#### `unregisterUserSocket(userId, socketId): void`

Desregistra socket cuando se desconecta.

---

#### `emitNotificationToUser(userId, notification): void`

Emite notificación a usuario específico.

**Ejemplo:**
```typescript
realtimeService.emitNotificationToUser(userId, {
  id: 'uuid',
  type: 'achievement_unlocked',
  title: 'Achievement Unlocked!',
  message: 'You unlocked "First Steps"',
  data: { ... },
  createdAt: '2025-10-27T10:30:00Z'
});

// Se emite a todas las conexiones activas del usuario
// Evento: 'new_notification'
```

---

#### `emitUnreadCountUpdate(userId, count): void`

Emite actualización de contador no leídas.

```typescript
realtimeService.emitUnreadCountUpdate(userId, 5);

// Cliente recibe:
// Evento: 'unread_count_updated'
// Data: { count: 5, timestamp: '...' }
```

---

#### `broadcastToAllUsers(notification): void`

Broadcast a todos los usuarios conectados.

**Uso:**
```typescript
// Anuncios del sistema
realtimeService.broadcastToAllUsers({
  type: 'system_announcement',
  title: 'Maintenance Notice',
  message: 'System will be down for maintenance...',
  priority: 'urgent'
});
```

---

#### `getConnectedUsersCount(): number`

Obtiene número de usuarios conectados.

---

#### `isUserConnected(userId): boolean`

Verifica si usuario está conectado.

```typescript
if (realtimeService.isUserConnected(userId)) {
  // Usuario online, enviar notificación en tiempo real
} else {
  // Usuario offline, solo persistir en DB
}
```

---

## 6. EducationalService

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

## 7. ClassroomService

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

## 8. SessionManagementService

**Archivo:** `/src/modules/auth/session-management.service.ts`

**Responsabilidad:** Gestión de sesiones de usuario

### Métodos Principales

#### `createSession(userId, accessToken, refreshToken, userAgent, ipAddress): Promise<Session>`

Crea nueva sesión.

**Almacena:**
- Token hash (SHA-256)
- User agent
- IP address
- Timestamp de creación
- Timestamp de expiración

---

#### `getActiveSessions(userId): Promise<Session[]>`

Obtiene sesiones activas del usuario.

**Ejemplo:**
```typescript
const sessions = await sessionService.getActiveSessions(userId);

// Respuesta:
[
  {
    id: 'uuid',
    userId: 'uuid',
    userAgent: 'Mozilla/5.0...',
    ipAddress: '192.168.1.100',
    createdAt: '2025-10-27T08:00:00Z',
    expiresAt: '2025-11-03T08:00:00Z',
    isActive: true,
    isCurrent: true  // Sesión actual
  },
  {
    id: 'uuid',
    userId: 'uuid',
    userAgent: 'Mobile App',
    ipAddress: '192.168.1.50',
    createdAt: '2025-10-26T10:00:00Z',
    expiresAt: '2025-11-02T10:00:00Z',
    isActive: true,
    isCurrent: false
  }
]
```

---

#### `revokeSession(userId, sessionId): Promise<void>`

Revoca sesión específica.

**Efecto:**
- Marca sesión como inactiva
- Token ya no válido en siguientes requests
- Usuario debe hacer login nuevamente en ese dispositivo

---

#### `revokeAllSessions(userId, exceptSessionId?): Promise<number>`

Revoca todas las sesiones excepto la actual.

**Uso:** "Cerrar sesión en todos los dispositivos"

**Retorna:** Número de sesiones revocadas

---

## 9. SecurityService

**Archivo:** `/src/modules/auth/security.service.ts`

**Responsabilidad:** Logs de seguridad y auditoría

### Métodos Principales

#### `logSecurityEvent(eventData): Promise<void>`

Registra evento de seguridad.

**Tipos de Eventos:**
```typescript
type SecurityEventType =
  | 'login_success'
  | 'login_failed'
  | 'password_change'
  | 'password_reset'
  | 'account_suspended'
  | 'session_revoked'
  | 'suspicious_activity';
```

**Ejemplo:**
```typescript
await securityService.logSecurityEvent({
  userId: 'uuid',
  eventType: 'login_failed',
  ipAddress: '192.168.1.100',
  userAgent: 'Mozilla/5.0...',
  details: { reason: 'invalid_password', attempts: 3 }
});
```

---

#### `getSecurityLogs(userId, filters): Promise<SecurityLog[]>`

Obtiene logs de seguridad del usuario.

**Filtros:**
```typescript
{
  eventType?: SecurityEventType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}
```

---

#### `detectSuspiciousActivity(userId): Promise<boolean>`

Detecta actividad sospechosa.

**Detecta:**
- Múltiples intentos de login fallidos
- Logins desde IPs diferentes en corto tiempo
- Cambios frecuentes de contraseña
- Acceso desde ubicaciones inusuales

---

## Diagrama de Interacción de Servicios

```
┌─────────────────────────────────────────────────────────────┐
│                        Controller                            │
│                     (HTTP Request)                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                    AuthService                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ - register()                                         │   │
│  │ - login() ─────────────┐                            │   │
│  │ - refreshToken()       │                            │   │
│  └──────────┬─────────────┘                            │   │
│             │                                           │   │
│             ↓                                           │   │
│  ┌──────────────────────┐    ┌──────────────────────┐  │   │
│  │ SessionManagement    │    │  SecurityService     │  │   │
│  │ Service              │    │                      │  │   │
│  │ - createSession()    │    │ - logSecurityEvent() │  │   │
│  │ - getActive()        │    │ - detectSuspicious() │  │   │
│  └──────────────────────┘    └──────────────────────┘  │   │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ↓
       ┌────────────────────────┐
       │   AuthRepository       │
       │   (Database Access)    │
       └────────────────────────┘
```

---

## Convenciones de Servicios

**Constructor Dependency Injection:**
```typescript
export class MyService {
  constructor(
    private repository: MyRepository,
    private otherService?: OtherService
  ) {}
}
```

**Manejo de Errores:**
```typescript
try {
  // Lógica de negocio
} catch (error) {
  if (error instanceof AppError) {
    throw error;  // Re-throw custom errors
  }
  log.error('Error in service:', error);
  throw new AppError('Generic message', 500, ErrorCode.INTERNAL_ERROR);
}
```

**Uso de dbClient Opcional:**
```typescript
async method(userId: string, dbClient?: PoolClient) {
  // Si se provee dbClient, usar para transacciones
  // Si no, usar pool directamente
}
```

---

## Próximos Documentos

- `GUARDS-Y-SEGURIDAD.md` - NestJS Guards y sistema de seguridad
- `API-ENDPOINTS.md` - Documentación completa de API
- `WEBSOCKET-REALTIME.md` - WebSocket y eventos
- `CRON-JOBS.md` - Tareas programadas
