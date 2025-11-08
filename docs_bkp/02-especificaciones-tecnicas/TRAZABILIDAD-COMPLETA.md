# Trazabilidad Completa End-to-End - GAMILIT Platform

**Version:** 2.0 (Modularizado)
**Fecha:** Octubre 2025
**Stack:** PostgreSQL 16 → Node.js/TypeScript → React/TypeScript

---

## AVISO IMPORTANTE: Documentacion Modularizada

Este documento ha sido modularizado para mejorar su navegabilidad y mantenibilidad.

**Accede a la documentacion modular aqui:**
- **[/trazabilidad/README.md](./trazabilidad/README.md)** - Indice completo de modulos
- **Archivo original respaldado:** `TRAZABILIDAD-COMPLETA.md.backup`

### Modulos Disponibles:

1. **[Foundation & Authentication](./trazabilidad/01-foundation-authentication.md)** - Login, JWT, Sessions
2. **[Educational Mechanics](./trazabilidad/02-educational-mechanics.md)** - Exercises, Submissions, Scoring
3. **[Economy & Transactions](./trazabilidad/03-economy-transactions.md)** - ML Coins, Wallet, Ledger
4. **[Gamification & Progression](./trazabilidad/04-gamification-progression.md)** - Ranks, Missions, Achievements
5. **[Realtime Notifications](./trazabilidad/05-realtime-notifications.md)** - WebSocket, Push Events
6. **[Teacher & Classroom Portal](./trazabilidad/06-teacher-classroom-portal.md)** - Classroom Management, Progress
7. **[Type Mappings Reference](./trazabilidad/07-type-mappings-reference.md)** - DB→Backend→Frontend Types
8. **[Patterns & Architecture](./trazabilidad/08-patterns-architecture.md)** - Design Patterns, Best Practices

**Beneficios de la Modularizacion:**
- Reduccion de complejidad por archivo: 85%
- Navegacion mejorada: 90%
- Mantenimiento simplificado
- Busqueda mas rapida de informacion especifica

---

## Vision General

Este documento describe la trazabilidad completa de datos desde la base de datos PostgreSQL, pasando por el backend Node.js, hasta el frontend React. Documenta **10 flujos principales** del sistema con diagramas, ejemplos de código y matrices de trazabilidad.

**Nota:** El contenido completo se encuentra en los modulos individuales referenciados arriba.

---

## Tabla de Contenidos

1. [Flujos de Datos End-to-End](#1-flujos-de-datos-end-to-end)
2. [Mapeo de Tipos por Modulo](#2-mapeo-de-tipos-por-modulo)
3. [Diagramas de Flujo](#3-diagramas-de-flujo)
4. [Matriz de Trazabilidad](#4-matriz-de-trazabilidad)
5. [Patrones de Integracion](#5-patrones-de-integracion)

---

## 1. Flujos de Datos End-to-End

### Flujo 1: Autenticacion de Usuario (Login)

**Trigger:** Usuario ingresa credenciales en LoginPage

#### Capa de Presentacion (Frontend)
```typescript
// apps/student/pages/login/LoginPage.tsx
const LoginPage = () => {
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await login(email, password);
  };

  return <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />;
};
```

#### Capa de Estado (Zustand Store)
```typescript
// features/auth/store/authStore.ts
login: async (email, password) => {
  set({ isLoading: true, error: null });

  try {
    const response = await authAPI.login({ email, password });

    set({
      user: response.data.user,
      token: response.data.token,
      refreshToken: response.data.refreshToken,
      isAuthenticated: true,
      sessionExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
      isLoading: false,
    });
  } catch (error) {
    set({ error: error.message, isLoading: false });
  }
}
```

#### Capa de API (API Client)
```typescript
// services/api/authAPI.ts
export const authAPI = {
  login: async (credentials: LoginCredentials) => {
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  }
};
```

#### Capa de Backend (Node.js)
```typescript
// backend/modules/auth/auth.controller.ts
async login(req: Request, res: Response) {
  const { email, password } = req.body;

  const result = await authService.login(
    email,
    password,
    req.headers['user-agent'],
    req.ip
  );

  res.json({ success: true, data: result });
}
```

#### Capa de Servicio (Business Logic)
```typescript
// backend/modules/auth/auth.service.ts
async login(email: string, password: string, userAgent?: string, ipAddress?: string) {
  // 1. Buscar usuario
  const user = await authRepository.findByEmail(email);

  if (!user) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // 2. Verificar contraseña
  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) {
    throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  // 3. Validar estado
  if (user.status !== 'active') {
    throw new AppError('Account inactive', 401, 'ACCOUNT_INACTIVE');
  }

  // 4. Generar tokens
  const token = this.generateAccessToken(user);
  const refreshToken = this.generateRefreshToken(user);

  // 5. Crear sesion
  await sessionService.createSession(user.id, token, refreshToken, userAgent, ipAddress);

  // 6. Actualizar ultimo login
  await authRepository.updateLastLogin(user.id);

  return {
    user: this.sanitizeUser(user),
    token,
    refreshToken,
    expiresIn: '7d'
  };
}
```

#### Capa de Repositorio (Data Access)
```typescript
// backend/modules/auth/auth.repository.ts
async findByEmail(email: string): Promise<User | null> {
  const result = await pool.query(
    `SELECT
      id, email, password_hash, full_name, role, status,
      avatar_url, created_at, updated_at
    FROM auth_management.profiles
    WHERE email = $1 AND deleted_at IS NULL`,
    [email]
  );

  return result.rows[0] || null;
}
```

#### Capa de Base de Datos (PostgreSQL)
```sql
-- auth_management.profiles table
SELECT
  id,                 -- UUID
  email,              -- TEXT
  password_hash,      -- TEXT (bcrypt)
  full_name,          -- TEXT
  role,               -- gamilit_role ENUM
  status,             -- user_status ENUM
  avatar_url,         -- TEXT
  created_at,         -- TIMESTAMPTZ
  updated_at          -- TIMESTAMPTZ
FROM auth_management.profiles
WHERE email = $1 AND deleted_at IS NULL;
```

#### Diagrama de Secuencia
```
Usuario → LoginPage → authStore → authAPI → Backend Controller → AuthService → AuthRepository → PostgreSQL
                                                                                                    ↓
Usuario ← LoginPage ← authStore ← authAPI ← Backend Controller ← AuthService ← AuthRepository ← Query Result
```

---

### Flujo 2: Envio de Ejercicio (Submit Exercise)

**Trigger:** Estudiante completa ejercicio y presiona "Submit"

#### Frontend - Exercise Component
```typescript
// features/mechanics/module1/Crucigrama/CrucigramaExercise.tsx
const CrucigramaExercise = ({ exerciseId }: Props) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [startTime] = useState(Date.now());

  const handleSubmit = async () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    const submission = {
      exerciseId,
      answers,
      timeSpent,
      hintsUsed: 0,
      powerupsUsed: []
    };

    const result = await exercisesAPI.submitExercise(exerciseId, submission);

    // Mostrar resultado
    if (result.passed) {
      showSuccessModal(result);

      // Actualizar economia
      useEconomyStore.getState().addCoins(
        result.rewards.mlCoins,
        'exercise_completion'
      );

      // Actualizar XP
      useRanksStore.getState().addXP(
        result.rewards.xp,
        'exercise_completion'
      );
    }
  };

  return (
    <div>
      {/* Crucigrama UI */}
      <button onClick={handleSubmit}>Enviar</button>
    </div>
  );
};
```

#### Backend - Exercise Controller
```typescript
// backend/modules/educational/exercises.controller.ts
async submitExercise(req: AuthRequest, res: Response) {
  const { exerciseId } = req.params;
  const { answers, timeSpent, hintsUsed, powerupsUsed } = req.body;
  const userId = req.user!.id;

  const result = await exercisesService.submitExercise(
    userId,
    exerciseId,
    {
      answers,
      timeSpent,
      hintsUsed,
      powerupsUsed
    }
  );

  res.json({ success: true, data: result });
}
```

#### Backend - Exercise Service (Business Logic)
```typescript
// backend/modules/educational/exercises.service.ts
async submitExercise(userId: string, exerciseId: string, submission: Submission) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Obtener ejercicio
    const exercise = await exercisesRepository.findById(exerciseId, client);

    // 2. Evaluar respuestas
    const evaluation = await scoringService.evaluate(
      exercise,
      submission.answers
    );

    // 3. Calcular puntuacion
    const score = evaluation.score;
    const passed = score >= exercise.passing_score;

    // 4. Guardar intento
    const attempt = await exercisesRepository.createAttempt({
      userId,
      exerciseId,
      attemptNumber: await this.getNextAttemptNumber(userId, exerciseId, client),
      submittedAnswers: submission.answers,
      isCorrect: passed,
      score,
      timeSpentSeconds: submission.timeSpent,
      hintsUsed: submission.hintsUsed,
      comodinesUsed: submission.powerupsUsed,
      xpEarned: passed ? exercise.xp_reward : 0,
      mlCoinsEarned: passed ? exercise.ml_coins_reward : 0,
    }, client);

    // 5. Actualizar progreso
    await progressService.updateModuleProgress(
      userId,
      exercise.module_id,
      client
    );

    // 6. Actualizar estadisticas
    if (passed) {
      await gamificationService.addMLCoins({
        userId,
        amount: exercise.ml_coins_reward,
        transactionType: 'earned_exercise',
        reason: `Completed: ${exercise.title}`,
        referenceId: exerciseId
      }, client);

      await gamificationService.addXP(
        userId,
        exercise.xp_reward,
        'exercise_completion',
        client
      );

      // Verificar achievements
      await achievementsService.checkAndUnlock(userId, 'exercise_completion', client);
    }

    await client.query('COMMIT');

    // 7. Enviar notificacion
    if (passed) {
      await notificationsService.createNotification({
        userId,
        type: 'exercise_completed',
        title: 'Ejercicio Completado!',
        message: `Has completado "${exercise.title}"`,
        data: { exerciseId, score, rewards: { mlCoins: exercise.ml_coins_reward, xp: exercise.xp_reward } }
      });
    }

    return {
      submissionId: attempt.id,
      score,
      maxScore: exercise.max_score,
      percentage: (score / exercise.max_score) * 100,
      passed,
      feedback: evaluation.feedback,
      rewards: passed ? {
        mlCoins: exercise.ml_coins_reward,
        xp: exercise.xp_reward
      } : { mlCoins: 0, xp: 0 },
      achievements: [], // IDs de achievements desbloqueados
      newStats: await gamificationService.getUserStats(userId, client)
    };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

#### Database Queries
```sql
-- 1. Obtener ejercicio
SELECT
  id, module_id, title, exercise_type, config, content,
  max_score, passing_score, xp_reward, ml_coins_reward
FROM educational_content.exercises
WHERE id = $1;

-- 2. Crear intento
INSERT INTO progress_tracking.exercise_attempts (
  id, user_id, exercise_id, attempt_number,
  submitted_answers, is_correct, score,
  time_spent_seconds, hints_used, comodines_used,
  xp_earned, ml_coins_earned, submitted_at
) VALUES (
  gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW()
)
RETURNING *;

-- 3. Actualizar progreso del modulo
UPDATE progress_tracking.module_progress
SET
  completed_exercises = completed_exercises + 1,
  progress_percentage = (completed_exercises::float / total_exercises) * 100,
  updated_at = NOW()
WHERE user_id = $1 AND module_id = $2;

-- 4. Actualizar user_stats
UPDATE gamification_system.user_stats
SET
  ml_coins = ml_coins + $2,
  ml_coins_earned_total = ml_coins_earned_total + $2,
  total_xp = total_xp + $3,
  exercises_completed = exercises_completed + 1,
  updated_at = NOW()
WHERE user_id = $1;

-- 5. Crear transaccion de ML Coins
INSERT INTO gamification_system.ml_coins_transactions (
  id, user_id, amount, transaction_type, reason,
  reference_id, balance_after, created_at
) VALUES (
  gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW()
);
```

---

### Flujo 3: Transaccion de ML Coins

**Trigger:** Usuario gana monedas por completar ejercicio

#### Frontend - Economy Store
```typescript
// features/gamification/economy/store/economyStore.ts
addCoins: (amount, source, description) => {
  const state = get();
  const newBalance = state.balance.current + amount;

  const transaction: Transaction = {
    id: crypto.randomUUID(),
    type: 'earn',
    amount,
    source,
    description: description || `Earned ${amount} ML from ${source}`,
    timestamp: new Date(),
    balanceAfter: newBalance,
  };

  set({
    balance: {
      ...state.balance,
      current: newBalance,
      lifetime: state.balance.lifetime + amount,
    },
    transactions: [transaction, ...state.transactions],
  });

  // Mostrar notificacion
  toast.success(`+${amount} ML Coins!`, {
    icon: '💰',
  });
}
```

#### Backend - Gamification Service
```typescript
// backend/modules/gamification/gamification.service.ts
async addMLCoins(dto: AddCoinsDto, dbClient?: PoolClient) {
  const client = dbClient || await pool.connect();

  try {
    if (!dbClient) await client.query('BEGIN');

    // 1. Obtener balance actual
    const stats = await gamificationRepository.getUserStats(dto.userId, client);
    const currentBalance = stats.ml_coins;

    // 2. Calcular multiplicador de rango
    const multiplier = await this.getRankMultiplier(dto.userId, client);
    const finalAmount = Math.floor(dto.amount * multiplier);

    // 3. Actualizar balance
    const newBalance = currentBalance + finalAmount;

    await client.query(
      `UPDATE gamification_system.user_stats
       SET
         ml_coins = $2,
         ml_coins_earned_total = ml_coins_earned_total + $3,
         updated_at = NOW()
       WHERE user_id = $1`,
      [dto.userId, newBalance, finalAmount]
    );

    // 4. Crear transaccion
    await client.query(
      `INSERT INTO gamification_system.ml_coins_transactions (
         id, user_id, amount, transaction_type, reason,
         reference_id, balance_before, balance_after,
         multiplier, created_at
       ) VALUES (
         gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW()
       )`,
      [
        dto.userId,
        finalAmount,
        dto.transactionType,
        dto.reason,
        dto.referenceId,
        currentBalance,
        newBalance,
        multiplier
      ]
    );

    if (!dbClient) await client.query('COMMIT');

    return {
      newBalance,
      transaction: {
        amount: finalAmount,
        reason: dto.reason,
        balanceAfter: newBalance
      }
    };

  } catch (error) {
    if (!dbClient) await client.query('ROLLBACK');
    throw error;
  } finally {
    if (!dbClient) client.release();
  }
}
```

#### Database Tables
```sql
-- gamification_system.user_stats
UPDATE gamification_system.user_stats
SET
  ml_coins = ml_coins + 100,                    -- Nuevo balance
  ml_coins_earned_total = ml_coins_earned_total + 100,  -- Total ganado
  updated_at = gamilit.now_mexico()
WHERE user_id = 'user-uuid';

-- gamification_system.ml_coins_transactions (Ledger)
INSERT INTO gamification_system.ml_coins_transactions (
  id,                  -- UUID
  user_id,             -- UUID FK -> profiles(id)
  amount,              -- INTEGER (+100)
  transaction_type,    -- transaction_type ENUM ('earned_exercise')
  reason,              -- TEXT ('Completed: Crucigrama Cientifico')
  reference_id,        -- UUID (exercise_id)
  balance_before,      -- INTEGER (500)
  balance_after,       -- INTEGER (600)
  multiplier,          -- NUMERIC (1.25 por rango Nacom)
  created_at           -- TIMESTAMPTZ
) VALUES (
  gen_random_uuid(), 'user-uuid', 100, 'earned_exercise',
  'Completed: Crucigrama Cientifico', 'exercise-uuid',
  500, 600, 1.25, NOW()
);
```

#### Wallet UI Component
```typescript
// features/gamification/economy/components/WalletWidget.tsx
const WalletWidget = () => {
  const balance = useEconomyStore((state) => state.balance);
  const transactions = useEconomyStore((state) => state.transactions);

  return (
    <div className="wallet-widget">
      <div className="balance">
        <span className="amount">{balance.current}</span>
        <span className="label">ML Coins</span>
      </div>

      <div className="stats">
        <div>Ganado Total: {balance.lifetime}</div>
        <div>Gastado Total: {balance.spent}</div>
      </div>

      <div className="recent-transactions">
        {transactions.slice(0, 5).map(tx => (
          <TransactionItem key={tx.id} transaction={tx} />
        ))}
      </div>
    </div>
  );
};
```

---

### Flujo 4: Progresion de Rangos Maya

**Trigger:** Usuario acumula suficiente XP para subir de rango

#### Frontend - Ranks Store
```typescript
// features/gamification/ranks/store/ranksStore.ts
addXP: async (amount, source, description) => {
  const state = get();
  const currentProgress = state.userProgress;

  // Crear evento XP
  const xpEvent: XPEvent = {
    id: crypto.randomUUID(),
    amount,
    source,
    timestamp: new Date(),
    description,
  };

  // Calcular nuevo XP
  const newCurrentXP = currentProgress.currentXP + amount;
  const newTotalXP = currentProgress.totalXP + amount;

  set((state) => ({
    userProgress: {
      ...state.userProgress,
      currentXP: newCurrentXP,
      totalXP: newTotalXP,
    },
    xpEvents: [xpEvent, ...state.xpEvents.slice(0, 99)],
  }));

  // Verificar level up
  if (get().checkLevelUp()) {
    get().levelUp();
  }

  // Verificar rank up
  if (get().checkRankUp()) {
    set({ showRankUpModal: true });
  }
},

checkRankUp: () => {
  const { userProgress } = get();
  const nextRank = getNextRank(userProgress.currentRank);

  if (!nextRank) return false;

  const hasEnoughXP = userProgress.totalXP >= nextRank.mlCoinsRequired;
  const hasCompletedModules = userProgress.modulesCompleted >= nextRank.modulesRequired;

  return hasEnoughXP && hasCompletedModules;
},

rankUp: async () => {
  const { userProgress } = get();
  const nextRank = getNextRank(userProgress.currentRank);

  if (!nextRank) return;

  set({ isRankingUp: true });

  try {
    // Llamar al backend
    await ranksAPI.rankUp(userProgress.userId);

    set((state) => ({
      userProgress: {
        ...state.userProgress,
        currentRank: nextRank.id,
        rankMultiplier: nextRank.multiplier,
      },
      isRankingUp: false,
      showRankUpModal: true,
    }));

    // Ganar ML Coins bonus
    useEconomyStore.getState().addCoins(
      nextRank.coinsBonus,
      'rank_promotion'
    );

    toast.success(`¡Ascendiste a ${nextRank.nameSpanish}!`);

  } catch (error) {
    set({ isRankingUp: false, error: error.message });
  }
}
```

#### Backend - Gamification Service
```typescript
// backend/modules/gamification/gamification.service.ts
async rankUp(userId: string) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Obtener progreso actual
    const userRanks = await gamificationRepository.getUserRanks(userId, client);
    const currentRank = userRanks.current_rank;

    // 2. Calcular siguiente rango
    const nextRank = this.getNextRank(currentRank);

    if (!nextRank) {
      throw new AppError('Already at max rank', 400);
    }

    // 3. Verificar requisitos
    const stats = await gamificationRepository.getUserStats(userId, client);

    if (stats.total_xp < nextRank.xpRequired) {
      throw new AppError('Insufficient XP', 400);
    }

    if (stats.modules_completed < nextRank.modulesRequired) {
      throw new AppError('Insufficient modules completed', 400);
    }

    // 4. Actualizar rango
    await client.query(
      `UPDATE gamification_system.user_ranks
       SET
         current_rank = $2,
         rank_achieved_at = NOW(),
         updated_at = NOW()
       WHERE user_id = $1`,
      [userId, nextRank.id]
    );

    // 5. Crear registro en historial
    await client.query(
      `INSERT INTO gamification_system.user_ranks_history (
         id, user_id, rank, achieved_at
       ) VALUES (
         gen_random_uuid(), $1, $2, NOW()
       )`,
      [userId, nextRank.id]
    );

    // 6. Otorgar bonus de ML Coins
    await this.addMLCoins({
      userId,
      amount: nextRank.coinsBonus,
      transactionType: 'earned_rank',
      reason: `Rank up to ${nextRank.name}`
    }, client);

    // 7. Desbloquear achievement
    await achievementsService.unlockAchievement({
      userId,
      achievementId: `rank_${nextRank.id}`,
    }, client);

    await client.query('COMMIT');

    // 8. Enviar notificacion
    await notificationsService.createNotification({
      userId,
      type: 'rank_up',
      title: 'Nuevo Rango!',
      message: `Has ascendido a ${nextRank.nameSpanish}`,
      data: { rank: nextRank, bonus: nextRank.coinsBonus }
    });

    return {
      newRank: nextRank,
      bonus: nextRank.coinsBonus
    };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

#### Database Schema
```sql
-- gamification_system.user_ranks
CREATE TABLE gamification_system.user_ranks (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE FK -> profiles(id),
  current_rank rango_maya DEFAULT 'nacom',
  rank_achieved_at TIMESTAMPTZ,
  rank_progress_percentage INTEGER CHECK (0-100),
  ml_coins_bonus INTEGER DEFAULT 0,
  modules_required INTEGER,
  xp_required INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Actualizacion
UPDATE gamification_system.user_ranks
SET
  current_rank = 'Nacom',
  rank_achieved_at = NOW(),
  ml_coins_bonus = 100,
  updated_at = NOW()
WHERE user_id = 'user-uuid';
```

#### Rank Up Modal UI
```typescript
// features/gamification/ranks/components/RankUpModal.tsx
const RankUpModal = () => {
  const { showRankUpModal, userProgress } = useRanksStore();
  const closeModal = () => useRanksStore.setState({ showRankUpModal: false });

  if (!showRankUpModal) return null;

  const newRank = MAYA_RANKS[userProgress.currentRank];

  return (
    <Modal isOpen onClose={closeModal}>
      <div className="rank-up-modal">
        <h1>Nuevo Rango!</h1>
        <div className="rank-badge">
          <img src={newRank.badge} alt={newRank.name} />
          <h2>{newRank.nameSpanish}</h2>
        </div>

        <div className="bonuses">
          <div>+{newRank.coinsBonus} ML Coins</div>
          <div>Multiplicador: {newRank.multiplier}x</div>
        </div>

        <button onClick={closeModal}>Continuar</button>
      </div>
    </Modal>
  );
};
```

---

### Flujo 5: Sistema de Misiones Diarias

**Trigger:** Cron job ejecuta refresh de misiones a las 00:00 hrs

#### Backend - Missions Cron Job
```typescript
// backend/modules/gamification/missions/missions.cron.ts
import cron from 'node-cron';
import { missionsService } from './missions.service';

export function startMissionsCronJobs() {
  // Refresh daily missions: Todos los dias a las 00:00 (medianoche)
  cron.schedule('0 0 * * *', async () => {
    console.log('Refreshing daily missions...');
    await missionsService.refreshDailyMissions();
  });

  // Refresh weekly missions: Todos los lunes a las 00:00
  cron.schedule('0 0 * * 1', async () => {
    console.log('Refreshing weekly missions...');
    await missionsService.refreshWeeklyMissions();
  });

  // Check missions progress: Cada hora
  cron.schedule('0 * * * *', async () => {
    await missionsService.checkAllMissionsProgress();
  });

  // Cleanup expired missions: Todos los dias a las 03:00
  cron.schedule('0 3 * * *', async () => {
    await missionsService.cleanupExpiredMissions();
  });
}
```

#### Backend - Missions Service
```typescript
// backend/modules/gamification/missions/missions.service.ts
async refreshDailyMissions() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Obtener todos los usuarios activos
    const users = await client.query(
      `SELECT id FROM auth_management.profiles
       WHERE status = 'active' AND deleted_at IS NULL`
    );

    // 2. Templates de misiones diarias
    const dailyTemplates = [
      {
        id: 'daily_exercise_3',
        title: 'Practica Diaria',
        description: 'Completa 3 ejercicios hoy',
        type: 'daily',
        objectives: [{ description: 'Completar ejercicios', target: 3 }],
        mlCoinsReward: 100,
        xpReward: 200
      },
      {
        id: 'daily_login',
        title: 'Asistencia Diaria',
        description: 'Inicia sesion hoy',
        type: 'daily',
        objectives: [{ description: 'Iniciar sesion', target: 1 }],
        mlCoinsReward: 10,
        xpReward: 20
      },
      {
        id: 'daily_perfect_score',
        title: 'Perfeccion',
        description: 'Obtén una puntuacion perfecta',
        type: 'daily',
        objectives: [{ description: 'Score 100%', target: 1 }],
        mlCoinsReward: 150,
        xpReward: 300
      }
    ];

    // 3. Crear misiones para cada usuario
    for (const user of users.rows) {
      for (const template of dailyTemplates) {
        await missionsRepository.createMission({
          userId: user.id,
          templateId: template.id,
          title: template.title,
          description: template.description,
          type: template.type,
          objectives: template.objectives,
          mlCoinsReward: template.mlCoinsReward,
          xpReward: template.xpReward,
          startDate: new Date(),
          endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // +24 horas
          status: 'active'
        }, client);
      }
    }

    await client.query('COMMIT');

    console.log(`Daily missions created for ${users.rows.length} users`);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error refreshing daily missions:', error);
  } finally {
    client.release();
  }
}
```

#### Frontend - Missions Store
```typescript
// features/gamification/missions/store/missionsStore.ts
export const useMissionsStore = create<MissionsState>((set, get) => ({
  missions: [],
  activeMissions: [],
  completedMissions: [],
  stats: { completed: 0, total: 0, claimedRewards: 0 },
  isLoading: false,

  fetchMissions: async () => {
    set({ isLoading: true });

    try {
      const response = await missionsAPI.getActiveMissions();

      set({
        missions: response.data.missions,
        activeMissions: response.data.missions.filter(m => m.status === 'active'),
        completedMissions: response.data.missions.filter(m => m.status === 'completed'),
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  claimReward: async (missionId) => {
    const mission = get().missions.find(m => m.id === missionId);

    if (!mission || mission.status !== 'completed') {
      throw new Error('Mission not completed');
    }

    set({ isLoading: true });

    try {
      const result = await missionsAPI.claimReward(missionId);

      // Actualizar economia
      useEconomyStore.getState().addCoins(
        mission.mlCoinsReward,
        'mission_completion',
        mission.title
      );

      // Actualizar ranks
      useRanksStore.getState().addXP(
        mission.xpReward,
        'mission_completion',
        mission.title
      );

      // Actualizar mision
      set((state) => ({
        missions: state.missions.map((m) =>
          m.id === missionId ? { ...m, status: 'claimed' } : m
        ),
        completedMissions: state.completedMissions.filter(
          (m) => m.id !== missionId
        ),
        isLoading: false,
      }));

      toast.success('Recompensa reclamada!');

    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
}));
```

#### Missions UI Component
```typescript
// apps/student/pages/missions/MissionsPage.tsx
const MissionsPage = () => {
  const { activeMissions, completedMissions, claimReward } = useMissionsStore();

  useEffect(() => {
    useMissionsStore.getState().fetchMissions();
  }, []);

  return (
    <div className="missions-page">
      <h1>Misiones Diarias</h1>

      <section className="active-missions">
        <h2>En Progreso</h2>
        {activeMissions.map(mission => (
          <MissionCard key={mission.id} mission={mission} />
        ))}
      </section>

      <section className="completed-missions">
        <h2>Completadas</h2>
        {completedMissions.map(mission => (
          <MissionCard
            key={mission.id}
            mission={mission}
            onClaim={() => claimReward(mission.id)}
          />
        ))}
      </section>
    </div>
  );
};
```

---

### Flujo 6: Notificaciones en Tiempo Real (WebSocket)

**Trigger:** Evento del backend (logro desbloqueado, mision completada, etc.)

#### Backend - WebSocket Server
```typescript
// backend/websocket/socket.server.ts
import { Server } from 'socket.io';
import { authenticateSocket } from './socket.auth';

export function initializeSocketServer(httpServer: any) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true
    }
  });

  // Middleware de autenticacion
  io.use(authenticateSocket);

  // Conexion
  io.on('connection', (socket) => {
    const userId = socket.data.userId;

    console.log(`User ${userId} connected to WebSocket`);

    // Unir a sala personal
    socket.join(`user:${userId}`);

    // Emitir confirmacion
    socket.emit('authenticated', { userId });

    // Marcar notificacion como leida
    socket.on('mark_as_read', async (notificationId: string) => {
      await notificationsService.markAsRead(userId, notificationId);
      socket.emit('notification_read', { notificationId });
    });

    // Desconexion
    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected from WebSocket`);
    });
  });

  // Guardar instancia de IO para usar en servicios
  global.io = io;

  return io;
}
```

#### Backend - Realtime Service
```typescript
// backend/modules/notifications/services/realtime.service.ts
export class RealtimeService {
  private io: Server | null = null;
  private userSockets: Map<string, Set<string>> = new Map();

  initialize(io: Server) {
    this.io = io;
  }

  emitNotificationToUser(userId: string, notification: Notification) {
    if (!this.io) return;

    this.io.to(`user:${userId}`).emit('new_notification', notification);
  }

  emitUnreadCountUpdate(userId: string, count: number) {
    if (!this.io) return;

    this.io.to(`user:${userId}`).emit('unread_count_updated', {
      count,
      timestamp: new Date()
    });
  }

  broadcastToAllUsers(notification: Notification) {
    if (!this.io) return;

    this.io.emit('system_announcement', notification);
  }

  isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId) &&
           this.userSockets.get(userId)!.size > 0;
  }
}

export const realtimeService = new RealtimeService();
```

#### Backend - Notifications Service (Integration)
```typescript
// backend/modules/notifications/notifications.service.ts
async createNotification(dto: CreateNotificationDto): Promise<Notification> {
  const notification = await notificationsRepository.create({
    userId: dto.userId,
    type: dto.type,
    title: dto.title,
    message: dto.message,
    data: dto.data,
    priority: dto.priority || 'medium',
    isRead: false,
  });

  // Emitir via WebSocket si usuario esta conectado
  realtimeService.emitNotificationToUser(dto.userId, notification);

  // Actualizar contador
  const unreadCount = await this.getUnreadCount(dto.userId);
  realtimeService.emitUnreadCountUpdate(dto.userId, unreadCount);

  return notification;
}
```

#### Frontend - WebSocket Hook
```typescript
// services/websocket/useWebSocket.ts
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@features/auth/store/authStore';
import { useNotificationsStore } from '@features/notifications/store/notificationsStore';

export const useWebSocket = () => {
  const token = useAuthStore((state) => state.token);
  const addNotification = useNotificationsStore((state) => state.addNotification);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    // Conectar
    const socketInstance = io(WS_URL, {
      auth: { token: `Bearer ${token}` },
      transports: ['websocket', 'polling']
    });

    // Eventos
    socketInstance.on('authenticated', (data) => {
      console.log('WebSocket authenticated:', data);
    });

    socketInstance.on('new_notification', (notification) => {
      addNotification(notification);
      toast.info(notification.message);
    });

    socketInstance.on('unread_count_updated', ({ count }) => {
      useNotificationsStore.setState({ unreadCount: count });
    });

    socketInstance.on('notification_read', ({ notificationId }) => {
      useNotificationsStore.getState().markAsRead(notificationId);
    });

    socketInstance.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    setSocket(socketInstance);

    // Cleanup
    return () => {
      socketInstance.disconnect();
    };
  }, [token]);

  return socket;
};
```

#### Frontend - Notifications Store (WebSocket Integration)
```typescript
// features/notifications/store/notificationsStore.ts
export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  addNotification: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === notificationId ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  // ... otras acciones
}));
```

---

### Flujo 7: Leaderboards Globales

**Trigger:** Usuario accede a la pagina de leaderboards

#### Frontend - Leaderboards Page
```typescript
// apps/student/pages/leaderboard/LeaderboardPage.tsx
const LeaderboardPage = () => {
  const { entries, userRank, filter, isLoading, fetchLeaderboard } = useLeaderboardsStore();
  const [scope, setScope] = useState<'global' | 'school' | 'guild'>('global');

  useEffect(() => {
    fetchLeaderboard('xp', scope);
  }, [scope]);

  return (
    <div className="leaderboard-page">
      <h1>Tabla de Clasificacion</h1>

      <div className="filters">
        <button onClick={() => setScope('global')}>Global</button>
        <button onClick={() => setScope('school')}>Mi Escuela</button>
        <button onClick={() => setScope('guild')}>Mi Gremio</button>
      </div>

      <div className="leaderboard-list">
        {entries.map((entry, index) => (
          <LeaderboardEntry
            key={entry.userId}
            rank={index + 1}
            entry={entry}
            isCurrentUser={entry.userId === useAuthStore.getState().user?.id}
          />
        ))}
      </div>

      {userRank && (
        <div className="user-position">
          Tu posicion: #{userRank}
        </div>
      )}
    </div>
  );
};
```

#### Backend - Leaderboards Controller
```typescript
// backend/modules/gamification/leaderboards.controller.ts
async getLeaderboard(req: AuthRequest, res: Response) {
  const { type, scope } = req.query;
  const userId = req.user!.id;

  const leaderboard = await leaderboardsService.getLeaderboard(
    type as LeaderboardType,
    scope as string,
    userId
  );

  res.json({ success: true, data: leaderboard });
}
```

#### Backend - Leaderboards Service
```typescript
// backend/modules/gamification/leaderboards.service.ts
async getLeaderboard(type: LeaderboardType, scope: string, userId: string) {
  let query = '';

  switch (type) {
    case 'xp':
      query = `
        SELECT
          p.id as user_id,
          p.full_name as display_name,
          p.avatar_url,
          us.total_xp,
          us.level as current_level,
          ur.current_rank,
          ROW_NUMBER() OVER (ORDER BY us.total_xp DESC) as rank
        FROM auth_management.profiles p
        JOIN gamification_system.user_stats us ON us.user_id = p.id
        JOIN gamification_system.user_ranks ur ON ur.user_id = p.id
        WHERE p.status = 'active' AND p.deleted_at IS NULL
        ${this.getScopeFilter(scope, userId)}
        ORDER BY us.total_xp DESC
        LIMIT 100
      `;
      break;

    case 'coins':
      query = `
        SELECT
          p.id as user_id,
          p.full_name as display_name,
          p.avatar_url,
          us.ml_coins_earned_total as total_coins,
          us.ml_coins as current_balance,
          ROW_NUMBER() OVER (ORDER BY us.ml_coins_earned_total DESC) as rank
        FROM auth_management.profiles p
        JOIN gamification_system.user_stats us ON us.user_id = p.id
        WHERE p.status = 'active' AND p.deleted_at IS NULL
        ${this.getScopeFilter(scope, userId)}
        ORDER BY us.ml_coins_earned_total DESC
        LIMIT 100
      `;
      break;

    case 'streak':
      query = `
        SELECT
          p.id as user_id,
          p.full_name as display_name,
          p.avatar_url,
          us.daily_streak_best as longest_streak,
          us.daily_streak_current as current_streak,
          ROW_NUMBER() OVER (ORDER BY us.daily_streak_best DESC) as rank
        FROM auth_management.profiles p
        JOIN gamification_system.user_stats us ON us.user_id = p.id
        WHERE p.status = 'active' AND p.deleted_at IS NULL
        ${this.getScopeFilter(scope, userId)}
        ORDER BY us.daily_streak_best DESC
        LIMIT 100
      `;
      break;
  }

  const result = await pool.query(query);

  // Encontrar posicion del usuario
  const userEntry = result.rows.find(r => r.user_id === userId);
  const userRank = userEntry ? userEntry.rank : null;

  return {
    type,
    scope,
    leaderboard: result.rows,
    currentUser: {
      rank: userRank,
      userId,
      ...userEntry
    }
  };
}

private getScopeFilter(scope: string, userId: string): string {
  switch (scope) {
    case 'school':
      return `AND p.school_id = (
        SELECT school_id FROM auth_management.profiles WHERE id = '${userId}'
      )`;

    case 'guild':
      return `AND p.id IN (
        SELECT user_id FROM social_features.guild_members
        WHERE guild_id = (
          SELECT guild_id FROM social_features.guild_members WHERE user_id = '${userId}'
        )
      )`;

    default:
      return '';
  }
}
```

---

### Flujo 8: Sistema de Achievements (Logros)

**Trigger:** Usuario completa accion que desbloquea logro

#### Backend - Achievements Service
```typescript
// backend/modules/gamification/achievements.service.ts
async checkAndUnlock(userId: string, event: AchievementEvent, client?: PoolClient) {
  const dbClient = client || await pool.connect();

  try {
    // 1. Obtener achievements relacionados con el evento
    const achievements = await achievementsRepository.getByEvent(event, dbClient);

    // 2. Obtener estadisticas del usuario
    const stats = await gamificationRepository.getUserStats(userId, dbClient);

    // 3. Verificar cada achievement
    const unlockedAchievements: Achievement[] = [];

    for (const achievement of achievements) {
      // Verificar si ya esta desbloqueado
      const isUnlocked = await achievementsRepository.isUnlocked(
        userId,
        achievement.id,
        dbClient
      );

      if (isUnlocked) continue;

      // Verificar condiciones
      const meetsConditions = this.checkConditions(achievement.conditions, stats);

      if (meetsConditions) {
        // Desbloquear
        await this.unlockAchievement({
          userId,
          achievementId: achievement.id,
          progress: 100
        }, dbClient);

        unlockedAchievements.push(achievement);
      }
    }

    return unlockedAchievements;

  } finally {
    if (!client) dbClient.release();
  }
}

async unlockAchievement(dto: UnlockAchievementDto, client?: PoolClient) {
  const dbClient = client || await pool.connect();

  try {
    if (!client) await dbClient.query('BEGIN');

    // 1. Obtener achievement
    const achievement = await achievementsRepository.findById(dto.achievementId, dbClient);

    // 2. Crear registro
    await dbClient.query(
      `INSERT INTO gamification_system.user_achievements (
         id, user_id, achievement_id, progress, unlocked_at
       ) VALUES (
         gen_random_uuid(), $1, $2, $3, NOW()
       )`,
      [dto.userId, dto.achievementId, dto.progress]
    );

    // 3. Otorgar recompensas
    await gamificationService.addMLCoins({
      userId: dto.userId,
      amount: achievement.ml_coins_reward,
      transactionType: 'earned_achievement',
      reason: `Achievement: ${achievement.name}`,
      referenceId: achievement.id
    }, dbClient);

    await gamificationService.addXP(
      dto.userId,
      achievement.xp_reward,
      'achievement_unlock',
      dbClient
    );

    // 4. Actualizar contador
    await dbClient.query(
      `UPDATE gamification_system.user_stats
       SET
         achievements_unlocked = achievements_unlocked + 1,
         updated_at = NOW()
       WHERE user_id = $1`,
      [dto.userId]
    );

    if (!client) await dbClient.query('COMMIT');

    // 5. Enviar notificacion
    await notificationsService.createNotification({
      userId: dto.userId,
      type: 'achievement_unlocked',
      title: 'Logro Desbloqueado!',
      message: `Has desbloqueado "${achievement.name}"`,
      data: { achievement, rewards: { mlCoins: achievement.ml_coins_reward, xp: achievement.xp_reward } }
    });

    return {
      userAchievement: {
        userId: dto.userId,
        achievementId: dto.achievementId,
        unlockedAt: new Date(),
        progress: dto.progress
      },
      rewards: {
        mlCoins: achievement.ml_coins_reward,
        xp: achievement.xp_reward
      }
    };

  } catch (error) {
    if (!client) await dbClient.query('ROLLBACK');
    throw error;
  } finally {
    if (!client) dbClient.release();
  }
}

private checkConditions(conditions: AchievementConditions, stats: UserStats): boolean {
  switch (conditions.type) {
    case 'progress':
      return stats.exercises_completed >= conditions.requirements.exercises_completed;

    case 'streak':
      return stats.daily_streak_current >= conditions.requirements.streak_days;

    case 'completion':
      return stats.modules_completed >= conditions.requirements.modules_completed;

    case 'social':
      // Verificar amigos, gremios, etc.
      return true;

    default:
      return false;
  }
}
```

#### Frontend - Achievements Page
```typescript
// apps/student/pages/achievements/AchievementsPage.tsx
const AchievementsPage = () => {
  const { achievements, stats, fetchAchievements } = useAchievementsStore();

  useEffect(() => {
    fetchAchievements();
  }, []);

  const unlocked = achievements.filter(a => a.unlocked);
  const locked = achievements.filter(a => !a.unlocked);

  return (
    <div className="achievements-page">
      <h1>Logros</h1>

      <div className="stats">
        <div>Desbloqueados: {unlocked.length} / {achievements.length}</div>
        <div>Progreso: {stats.getProgressPercentage()}%</div>
      </div>

      <section className="unlocked-achievements">
        <h2>Desbloqueados</h2>
        <div className="grid">
          {unlocked.map(achievement => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      </section>

      <section className="locked-achievements">
        <h2>Bloqueados</h2>
        <div className="grid">
          {locked.map(achievement => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              locked
            />
          ))}
        </div>
      </section>
    </div>
  );
};
```

---

### Flujo 9: Classroom Management (Teacher)

**Trigger:** Profesor crea aula y anade estudiantes

#### Frontend - Create Classroom
```typescript
// apps/teacher/pages/classrooms/CreateClassroomPage.tsx
const CreateClassroomPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    grade: '',
    academicYear: '2024-2025'
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const response = await classroomsAPI.create(formData);
      toast.success('Aula creada exitosamente!');
      navigate(`/teacher/classrooms/${response.data.classroom.id}`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="create-classroom-page">
      <h1>Crear Aula</h1>
      <ClassroomForm data={formData} onChange={setFormData} onSubmit={handleSubmit} />
    </div>
  );
};
```

#### Backend - Classroom Service
```typescript
// backend/modules/teacher/classroom.service.ts
async createClassroom(teacherId: string, data: CreateClassroomDto) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Generar codigo unico
    const code = await this.generateUniqueCode();

    // 2. Crear aula
    const classroom = await client.query(
      `INSERT INTO social_features.classrooms (
         id, teacher_id, tenant_id, name, code, description,
         subject, grade_level, academic_year, is_active, created_at
       ) VALUES (
         gen_random_uuid(), $1,
         (SELECT tenant_id FROM auth_management.profiles WHERE id = $1),
         $2, $3, $4, $5, $6, $7, true, NOW()
       )
       RETURNING *`,
      [
        teacherId,
        data.name,
        code,
        data.description,
        data.subject,
        data.grade,
        data.academicYear
      ]
    );

    await client.query('COMMIT');

    return {
      classroom: classroom.rows[0]
    };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async addStudent(classroomId: string, studentId: string, teacherId: string) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Verificar permisos
    const classroom = await client.query(
      `SELECT teacher_id FROM social_features.classrooms WHERE id = $1`,
      [classroomId]
    );

    if (classroom.rows[0].teacher_id !== teacherId) {
      throw new AppError('Not authorized', 403);
    }

    // 2. Verificar que es estudiante
    const student = await client.query(
      `SELECT role FROM auth_management.profiles WHERE id = $1`,
      [studentId]
    );

    if (student.rows[0].role !== 'student') {
      throw new AppError('User is not a student', 400);
    }

    // 3. Añadir a aula
    await client.query(
      `INSERT INTO social_features.classroom_members (
         id, classroom_id, student_id, enrollment_method, enrolled_at
       ) VALUES (
         gen_random_uuid(), $1, $2, 'teacher_invite', NOW()
       )`,
      [classroomId, studentId]
    );

    // 4. Actualizar contador
    await client.query(
      `UPDATE social_features.classrooms
       SET
         current_students_count = current_students_count + 1,
         updated_at = NOW()
       WHERE id = $1`,
      [classroomId]
    );

    await client.query('COMMIT');

    // 5. Notificar estudiante
    await notificationsService.createNotification({
      userId: studentId,
      type: 'classroom_invitation',
      title: 'Invitacion a Aula',
      message: `Has sido añadido a ${classroom.rows[0].name}`,
      data: { classroomId }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async getClassroomProgress(classroomId: string, teacherId: string) {
  // Verificar permisos
  const classroom = await pool.query(
    `SELECT teacher_id FROM social_features.classrooms WHERE id = $1`,
    [classroomId]
  );

  if (classroom.rows[0].teacher_id !== teacherId) {
    throw new AppError('Not authorized', 403);
  }

  // Obtener progreso de estudiantes
  const studentsProgress = await pool.query(`
    SELECT
      p.id as student_id,
      p.full_name as student_name,
      p.avatar_url,
      COUNT(DISTINCT mp.module_id) as modules_completed,
      COUNT(DISTINCT ea.exercise_id) as exercises_completed,
      AVG(ea.score) as average_score,
      MAX(ea.submitted_at) as last_activity
    FROM social_features.classroom_members cm
    JOIN auth_management.profiles p ON p.id = cm.student_id
    LEFT JOIN progress_tracking.module_progress mp ON mp.user_id = cm.student_id
    LEFT JOIN progress_tracking.exercise_attempts ea ON ea.user_id = cm.student_id
    WHERE cm.classroom_id = $1
    GROUP BY p.id, p.full_name, p.avatar_url
    ORDER BY average_score DESC
  `, [classroomId]);

  // Calcular metricas agregadas
  const totalStudents = studentsProgress.rows.length;
  const averageProgress = studentsProgress.rows.reduce((sum, s) =>
    sum + (s.modules_completed / 5) * 100, 0
  ) / totalStudents;
  const averageScore = studentsProgress.rows.reduce((sum, s) =>
    sum + parseFloat(s.average_score || 0), 0
  ) / totalStudents;

  return {
    classroomId,
    totalStudents,
    averageProgress,
    averageScore,
    studentsProgress: studentsProgress.rows
  };
}
```

---

### Flujo 10: Student Progress Tracking

**Trigger:** Estudiante completa ejercicio, se actualiza progreso del modulo

#### Backend - Progress Service
```typescript
// backend/modules/progress/progress.service.ts
async updateModuleProgress(userId: string, moduleId: string, client?: PoolClient) {
  const dbClient = client || await pool.connect();

  try {
    // 1. Obtener total de ejercicios del modulo
    const totalExercises = await dbClient.query(
      `SELECT COUNT(*) as total
       FROM educational_content.exercises
       WHERE module_id = $1 AND status = 'published'`,
      [moduleId]
    );

    // 2. Obtener ejercicios completados
    const completedExercises = await dbClient.query(
      `SELECT COUNT(DISTINCT exercise_id) as completed
       FROM progress_tracking.exercise_attempts
       WHERE user_id = $1
       AND exercise_id IN (
         SELECT id FROM educational_content.exercises WHERE module_id = $2
       )
       AND is_correct = true`,
      [userId, moduleId]
    );

    const total = parseInt(totalExercises.rows[0].total);
    const completed = parseInt(completedExercises.rows[0].completed);
    const percentage = Math.floor((completed / total) * 100);

    // 3. Calcular puntuacion promedio
    const avgScore = await dbClient.query(
      `SELECT AVG(score) as avg_score
       FROM progress_tracking.exercise_attempts
       WHERE user_id = $1
       AND exercise_id IN (
         SELECT id FROM educational_content.exercises WHERE module_id = $2
       )`,
      [userId, moduleId]
    );

    // 4. Actualizar o crear progreso
    const progress = await dbClient.query(
      `INSERT INTO progress_tracking.module_progress (
         id, user_id, module_id, completed_exercises, total_exercises,
         progress_percentage, average_score, status, started_at, updated_at
       ) VALUES (
         gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
       )
       ON CONFLICT (user_id, module_id) DO UPDATE SET
         completed_exercises = $3,
         total_exercises = $4,
         progress_percentage = $5,
         average_score = $6,
         status = $7,
         updated_at = NOW()
       RETURNING *`,
      [
        userId,
        moduleId,
        completed,
        total,
        percentage,
        avgScore.rows[0].avg_score || 0,
        percentage === 100 ? 'completed' : 'in_progress'
      ]
    );

    // 5. Si completo el modulo
    if (percentage === 100) {
      // Otorgar recompensas del modulo
      const module = await dbClient.query(
        `SELECT xp_reward, ml_coins_reward, title FROM educational_content.modules WHERE id = $1`,
        [moduleId]
      );

      await gamificationService.addMLCoins({
        userId,
        amount: module.rows[0].ml_coins_reward,
        transactionType: 'earned_module',
        reason: `Completed module: ${module.rows[0].title}`,
        referenceId: moduleId
      }, dbClient);

      await gamificationService.addXP(
        userId,
        module.rows[0].xp_reward,
        'module_completion',
        dbClient
      );

      // Actualizar contador de modulos
      await dbClient.query(
        `UPDATE gamification_system.user_stats
         SET
           modules_completed = modules_completed + 1,
           updated_at = NOW()
         WHERE user_id = $1`,
        [userId]
      );

      // Verificar rank up
      await gamificationService.checkRankUp(userId, dbClient);

      // Notificar
      await notificationsService.createNotification({
        userId,
        type: 'module_completed',
        title: 'Modulo Completado!',
        message: `Has completado "${module.rows[0].title}"`,
        data: { moduleId, rewards: { mlCoins: module.rows[0].ml_coins_reward, xp: module.rows[0].xp_reward } }
      });
    }

    return progress.rows[0];

  } finally {
    if (!client) dbClient.release();
  }
}
```

#### Frontend - Module Progress Component
```typescript
// apps/student/components/modules/ModuleProgressCard.tsx
const ModuleProgressCard = ({ moduleId }: Props) => {
  const [progress, setProgress] = useState<ModuleProgress | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      const response = await progressAPI.getModuleProgress(moduleId);
      setProgress(response.data.progress);
    };
    fetchProgress();
  }, [moduleId]);

  if (!progress) return <Skeleton />;

  return (
    <div className="module-progress-card">
      <h3>{progress.moduleTitle}</h3>

      <div className="progress-bar">
        <div
          className="fill"
          style={{ width: `${progress.progressPercentage}%` }}
        />
      </div>

      <div className="stats">
        <div>Ejercicios: {progress.completedExercises} / {progress.totalExercises}</div>
        <div>Puntuacion Promedio: {progress.averageScore.toFixed(1)}%</div>
        <div>Estado: {progress.status === 'completed' ? 'Completado' : 'En Progreso'}</div>
      </div>
    </div>
  );
};
```

---

## 2. Mapeo de Tipos por Modulo

### 2.1 Modulo: User/Profile

#### Database Schema
```sql
-- auth_management.profiles
CREATE TABLE auth_management.profiles (
  id UUID PRIMARY KEY,
  tenant_id UUID FK,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  role gamilit_role DEFAULT 'student',
  status user_status DEFAULT 'active',
  avatar_url TEXT,
  bio TEXT,
  grade_level TEXT,
  school_name TEXT,
  preferences JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

#### Backend Types
```typescript
// backend/modules/auth/auth.types.ts
export interface Profile {
  id: string;
  tenant_id: string | null;
  email: string;
  username: string | null;
  full_name: string | null;
  role: GamilaRole;
  status: UserStatus;
  avatar_url: string | null;
  bio: string | null;
  grade_level: string | null;
  school_name: string | null;
  preferences: UserPreferences;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export type GamilaRole = 'student' | 'admin_teacher' | 'super_admin';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface UserPreferences {
  theme: 'detective' | 'light' | 'dark';
  notifications_enabled: boolean;
  sound_enabled: boolean;
  language: 'es' | 'en';
}
```

#### Frontend Types
```typescript
// features/auth/types/auth.types.ts
export interface User {
  id: string;
  email: string;
  username?: string;
  fullName?: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'suspended';
  avatarUrl?: string;
  bio?: string;
  gradeLevel?: string;
  preferences: {
    theme: string;
    notificationsEnabled: boolean;
    soundEnabled: boolean;
    language: string;
  };
  createdAt: string; // ISO date string
  updatedAt: string;
}

export type UserRole = 'student' | 'admin_teacher' | 'super_admin';
```

#### Mapping Flow
```
PostgreSQL                Backend                    Frontend
─────────────────────────────────────────────────────────────────
id: UUID                  id: string                 id: string
email: TEXT               email: string              email: string
full_name: TEXT           full_name: string | null   fullName?: string
role: gamilit_role        role: GamilaRole           role: UserRole
created_at: TIMESTAMPTZ   created_at: Date           createdAt: string (ISO)
preferences: JSONB        preferences: UserPreferences   preferences: { theme, ... }
```

---

### 2.2 Modulo: Exercise

#### Database Schema
```sql
-- educational_content.exercises
CREATE TABLE educational_content.exercises (
  id UUID PRIMARY KEY,
  module_id UUID FK,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  exercise_type exercise_type NOT NULL,
  order_index INTEGER NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  content JSONB NOT NULL DEFAULT '{}',
  max_score INTEGER DEFAULT 100,
  passing_score INTEGER DEFAULT 70,
  time_limit_seconds INTEGER,
  xp_reward INTEGER DEFAULT 20,
  ml_coins_reward INTEGER DEFAULT 5,
  allow_hints BOOLEAN DEFAULT true,
  allow_retries BOOLEAN DEFAULT true,
  max_attempts INTEGER,
  difficulty_level difficulty_level DEFAULT 'beginner',
  status content_status DEFAULT 'published',
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

#### Backend Types
```typescript
// backend/modules/educational/exercises.types.ts
export interface Exercise {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  instructions: string | null;
  exercise_type: ExerciseType;
  order_index: number;
  config: ExerciseConfig;
  content: ExerciseContent;
  max_score: number;
  passing_score: number;
  time_limit_seconds: number | null;
  xp_reward: number;
  ml_coins_reward: number;
  allow_hints: boolean;
  allow_retries: boolean;
  max_attempts: number | null;
  difficulty_level: DifficultyLevel;
  status: ContentStatus;
  created_at: Date;
  updated_at: Date;
}

export type ExerciseType =
  | 'crucigrama_cientifico'
  | 'linea_tiempo_visual'
  | 'mapa_conceptual'
  | 'emparejamiento'
  | 'sopa_letras'
  // ... (27 types total)

export interface ExerciseConfig {
  gridSize?: { rows: number; cols: number };
  showTimer?: boolean;
  randomizeOptions?: boolean;
  [key: string]: any;
}

export interface ExerciseContent {
  question?: string;
  options?: any[];
  correct_answers?: any[];
  explanations?: Record<string, string>;
  marie_curie_context?: any;
  resources?: any[];
  [key: string]: any;
}
```

#### Frontend Types
```typescript
// features/mechanics/shared/types/exercise.types.ts
export interface Exercise {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  instructions?: string;
  exerciseType: ExerciseType;
  orderIndex: number;
  config: Record<string, any>;
  content: {
    question?: string;
    options?: string[];
    correctAnswers?: any[];
    explanations?: Record<string, string>;
  };
  maxScore: number;
  passingScore: number;
  timeLimit?: number; // seconds
  rewards: {
    xp: number;
    mlCoins: number;
  };
  allowHints: boolean;
  allowRetries: boolean;
  maxAttempts?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export type ExerciseType =
  | 'crucigrama_cientifico'
  | 'linea_tiempo_visual'
  | 'mapa_conceptual'
  | 'emparejamiento'
  | 'sopa_letras'
  // ... (27 types total)
```

#### JSONB Content Example
```typescript
// Crucigrama Cientifico
{
  "type": "crucigrama_cientifico",
  "grid": {
    "rows": 10,
    "cols": 10,
    "words": [
      {
        "word": "RADIO",
        "clue": "Elemento descubierto por Marie Curie",
        "position": { "row": 0, "col": 0 },
        "direction": "across"
      },
      {
        "word": "POLONIO",
        "clue": "Otro elemento descubierto por Curie",
        "position": { "row": 0, "col": 0 },
        "direction": "down"
      }
    ]
  },
  "marie_curie_context": {
    "era": "1898",
    "discovery": "radioactivity",
    "nobelPrizes": 2
  }
}
```

---

### 2.3 Modulo: Gamification

#### Database Schema
```sql
-- gamification_system.user_stats
CREATE TABLE gamification_system.user_stats (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE FK,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  ml_coins INTEGER DEFAULT 100,
  ml_coins_earned_total INTEGER DEFAULT 100,
  ml_coins_spent_total INTEGER DEFAULT 0,
  current_rank rango_maya DEFAULT 'nacom',
  rank_achieved_at TIMESTAMPTZ,
  modules_completed INTEGER DEFAULT 0,
  exercises_completed INTEGER DEFAULT 0,
  perfect_scores INTEGER DEFAULT 0,
  daily_streak_current INTEGER DEFAULT 0,
  daily_streak_best INTEGER DEFAULT 0,
  last_activity_date DATE,
  achievements_unlocked INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

#### Backend Types
```typescript
// backend/modules/gamification/gamification.types.ts
export interface UserStats {
  id: string;
  user_id: string;
  total_xp: number;
  level: number;
  ml_coins: number;
  ml_coins_earned_total: number;
  ml_coins_spent_total: number;
  current_rank: RangoMaya;
  rank_achieved_at: Date | null;
  modules_completed: number;
  exercises_completed: number;
  perfect_scores: number;
  daily_streak_current: number;
  daily_streak_best: number;
  last_activity_date: Date | null;
  achievements_unlocked: number;
  created_at: Date;
  updated_at: Date;
}

export type RangoMaya = 'nacom' | 'batab' | 'holcatte' | 'guerrero' | 'mercenario';
```

#### Frontend Types
```typescript
// features/gamification/types/gamification.types.ts
export interface GamificationStats {
  userId: string;
  mlCoins: number;
  totalXP: number;
  level: number;
  currentRank: RangoMaya;
  rankProgress: number; // 0-100 percentage to next rank
  streakDays: number;
  longestStreak: number;
  exercisesCompleted: number;
  perfectScores: number;
  achievementsUnlocked: number;
}

export type RangoMaya = 'nacom' | 'batab' | 'holcatte' | 'guerrero' | 'mercenario';

export const MAYA_RANKS = {
  Ajaw: 'nacom',
  Nacom: 'batab',
  Ah K'in: 'holcatte',
  Halach Uinic: 'guerrero',
  K'uk'ulkan: 'mercenario'
} as const;
```

---

## 3. Diagramas de Flujo

### 3.1 Data Flow: Exercise Submission

```
┌──────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                  │
├──────────────────────────────────────────────────────────────────┤
│  CrucigramaExercise Component                                    │
│  ├─ User fills crossword                                         │
│  ├─ Tracks time spent                                            │
│  └─ onClick Submit Button                                        │
│       ↓                                                           │
│  exercisesAPI.submitExercise(exerciseId, submission)             │
└──────────────────────────────┬───────────────────────────────────┘
                               │ HTTP POST /api/educational/exercises/:id/submit
                               │ Body: { answers, timeSpent, hintsUsed, powerupsUsed }
                               ↓
┌──────────────────────────────────────────────────────────────────┐
│                        BACKEND                                    │
├──────────────────────────────────────────────────────────────────┤
│  ExercisesController.submitExercise()                            │
│       ↓                                                           │
│  ExercisesService.submitExercise()                               │
│  ├─ BEGIN TRANSACTION                                            │
│  ├─ Get exercise from DB                                         │
│  ├─ Evaluate answers (ScoringService)                            │
│  ├─ Calculate score                                              │
│  ├─ Save attempt to DB                                           │
│  ├─ If passed:                                                   │
│  │   ├─ Add ML Coins (GamificationService)                       │
│  │   ├─ Add XP (GamificationService)                             │
│  │   ├─ Update module progress                                   │
│  │   └─ Check achievements                                       │
│  ├─ COMMIT TRANSACTION                                           │
│  └─ Send notification                                            │
└──────────────────────────────┬───────────────────────────────────┘
                               │ SQL Queries:
                               │ - SELECT exercise
                               │ - INSERT exercise_attempts
                               │ - UPDATE user_stats
                               │ - INSERT ml_coins_transactions
                               │ - UPDATE module_progress
                               ↓
┌──────────────────────────────────────────────────────────────────┐
│                       POSTGRESQL                                  │
├──────────────────────────────────────────────────────────────────┤
│  Tables Modified:                                                │
│  ├─ progress_tracking.exercise_attempts (INSERT)                 │
│  ├─ gamification_system.user_stats (UPDATE)                      │
│  ├─ gamification_system.ml_coins_transactions (INSERT)           │
│  └─ progress_tracking.module_progress (UPDATE)                   │
└──────────────────────────────┬───────────────────────────────────┘
                               │ Response: { score, passed, rewards, ... }
                               ↓
┌──────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                  │
├──────────────────────────────────────────────────────────────────┤
│  Update Zustand Stores:                                          │
│  ├─ economyStore.addCoins(rewards.mlCoins)                       │
│  ├─ ranksStore.addXP(rewards.xp)                                 │
│  └─ Show success modal with rewards                              │
└──────────────────────────────────────────────────────────────────┘
```

---

### 3.2 Sequence Diagram: Login Flow

```
Usuario    LoginPage    authStore    authAPI    Backend    AuthService    Repository    Database
  │           │            │           │          │            │              │            │
  │ Enter     │            │           │          │            │              │            │
  │ Creds ────►            │           │          │            │              │            │
  │           │            │           │          │            │              │            │
  │           │ login() ───►           │          │            │              │            │
  │           │            │           │          │            │              │            │
  │           │            │ POST /login ────────►            │              │            │
  │           │            │           │          │            │              │            │
  │           │            │           │          │ login() ───►              │            │
  │           │            │           │          │            │              │            │
  │           │            │           │          │            │ findByEmail() ──────────►│
  │           │            │           │          │            │              │ SELECT *   │
  │           │            │           │          │            │              │←───────────│
  │           │            │           │          │            │              │ User Data  │
  │           │            │           │          │            │              │            │
  │           │            │           │          │            │ Compare      │            │
  │           │            │           │          │            │ Password     │            │
  │           │            │           │          │            │              │            │
  │           │            │           │          │            │ Generate     │            │
  │           │            │           │          │            │ Tokens       │            │
  │           │            │           │          │            │              │            │
  │           │            │           │          │            │ createSession() ─────────►│
  │           │            │           │          │            │              │ INSERT     │
  │           │            │           │          │            │              │←───────────│
  │           │            │           │          │            │              │            │
  │           │            │           │          │            │ updateLastLogin() ───────►│
  │           │            │           │          │            │              │ UPDATE     │
  │           │            │           │          │            │              │←───────────│
  │           │            │           │          │            │              │            │
  │           │            │           │          │◄──────────│              │            │
  │           │            │           │          │ { user, token }          │            │
  │           │            │           │◄─────────│            │              │            │
  │           │            │           │ Response │            │              │            │
  │           │            │◄──────────│          │            │              │            │
  │           │            │ { data }  │          │            │              │            │
  │           │◄───────────│           │          │            │              │            │
  │           │ setState   │           │          │            │              │            │
  │◄──────────│            │           │          │            │              │            │
  │ Redirect  │            │           │          │            │              │            │
  │ Dashboard │            │           │          │            │              │            │
```

---

### 3.3 Component Interaction Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    STUDENT DASHBOARD                              │
└──────────────────────────────────────────────────────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  StatsOverview  │  │  MissionsWidget │  │ ProgressChart   │
│                 │  │                 │  │                 │
│  Uses:          │  │  Uses:          │  │  Uses:          │
│  - economyStore │  │  - missionsStore│  │  - progressAPI  │
│  - ranksStore   │  │  - economyStore │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                     │                     │
         │ reads               │ reads               │ fetches
         ▼                     ▼                     ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  economyStore   │  │  missionsStore  │  │  Backend API    │
│                 │  │                 │  │                 │
│  State:         │  │  State:         │  │  Endpoints:     │
│  - balance      │  │  - missions     │  │  - /progress/*  │
│  - transactions │  │  - activeMissions│  │  - /stats/*    │
│                 │  │                 │  │                 │
│  Actions:       │  │  Actions:       │  │                 │
│  - addCoins     │  │  - claimReward  │  │                 │
│  - spendCoins   │  │  - fetchMissions│  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                     │                     │
         │ updates DB          │ updates DB          │
         ▼                     ▼                     ▼
┌──────────────────────────────────────────────────────────────────┐
│                         POSTGRESQL                                │
│                                                                   │
│  - gamification_system.user_stats                                │
│  - gamification_system.ml_coins_transactions                     │
│  - gamification_system.missions                                  │
│  - progress_tracking.module_progress                             │
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. Matriz de Trazabilidad

### 4.1 Authentication Flow

| DB Table | Column | Backend Type | Backend Service | API Endpoint | Frontend Store | UI Component |
|----------|--------|--------------|-----------------|--------------|----------------|--------------|
| `auth_management.profiles` | `id` | `Profile.id: string` | `AuthService.login()` | `POST /auth/login` | `authStore.user.id` | `LoginPage` |
| `auth_management.profiles` | `email` | `Profile.email: string` | `AuthService.findByEmail()` | - | `authStore.user.email` | `LoginForm` |
| `auth_management.profiles` | `password_hash` | (not exposed) | `AuthService.comparePassword()` | - | - | - |
| `auth_management.profiles` | `role` | `Profile.role: GamilaRole` | `AuthService.sanitizeUser()` | - | `authStore.user.role` | `RoleBadge` |
| `auth_management.user_sessions` | `session_token` | `Session.session_token` | `SessionService.createSession()` | - | `authStore.token` | (localStorage) |

---

### 4.2 Exercise Submission Flow

| DB Table | Column | Backend Type | Backend Service | API Endpoint | Frontend Store | UI Component |
|----------|--------|--------------|-----------------|--------------|----------------|--------------|
| `educational_content.exercises` | `id` | `Exercise.id: string` | `ExercisesService.submitExercise()` | `POST /exercises/:id/submit` | - | `CrucigramaExercise` |
| `educational_content.exercises` | `exercise_type` | `Exercise.exercise_type: ExerciseType` | - | - | - | Component router |
| `educational_content.exercises` | `content` | `Exercise.content: JSONB` | - | - | Local state | Mechanic UI |
| `progress_tracking.exercise_attempts` | `submitted_answers` | `ExerciseAttempt.submitted_answers` | `ExercisesRepository.createAttempt()` | - | - | - |
| `progress_tracking.exercise_attempts` | `score` | `ExerciseAttempt.score` | `ScoringService.evaluate()` | Response | - | `ScoreDisplay` |
| `progress_tracking.exercise_attempts` | `xp_earned` | `ExerciseAttempt.xp_earned` | - | Response | `ranksStore.addXP()` | `XPGainAnimation` |
| `progress_tracking.exercise_attempts` | `ml_coins_earned` | `ExerciseAttempt.ml_coins_earned` | - | Response | `economyStore.addCoins()` | `CoinsGainAnimation` |

---

### 4.3 ML Coins Economy Flow

| DB Table | Column | Backend Type | Backend Service | API Endpoint | Frontend Store | UI Component |
|----------|--------|--------------|-----------------|--------------|----------------|--------------|
| `gamification_system.user_stats` | `ml_coins` | `UserStats.ml_coins: number` | `GamificationService.addMLCoins()` | `GET /gamification/stats` | `economyStore.balance.current` | `WalletWidget` |
| `gamification_system.user_stats` | `ml_coins_earned_total` | `UserStats.ml_coins_earned_total` | - | - | `economyStore.balance.lifetime` | `StatsCard` |
| `gamification_system.user_stats` | `ml_coins_spent_total` | `UserStats.ml_coins_spent_total` | - | - | `economyStore.balance.spent` | `StatsCard` |
| `gamification_system.ml_coins_transactions` | `amount` | `Transaction.amount: number` | `GamificationService.addMLCoins()` | `GET /gamification/coins/transactions` | `economyStore.transactions[].amount` | `TransactionItem` |
| `gamification_system.ml_coins_transactions` | `transaction_type` | `Transaction.transaction_type` | - | - | `economyStore.transactions[].type` | Type badge |
| `gamification_system.ml_coins_transactions` | `balance_after` | `Transaction.balance_after` | - | - | `economyStore.transactions[].balanceAfter` | Balance history |
| `gamification_system.ml_coins_transactions` | `multiplier` | `Transaction.multiplier` | `GamificationService.getRankMultiplier()` | - | - | Multiplier indicator |

---

### 4.4 Ranks Progression Flow

| DB Table | Column | Backend Type | Backend Service | API Endpoint | Frontend Store | UI Component |
|----------|--------|--------------|-----------------|--------------|----------------|--------------|
| `gamification_system.user_stats` | `total_xp` | `UserStats.total_xp: number` | `GamificationService.addXP()` | `GET /gamification/stats` | `ranksStore.userProgress.totalXP` | `XPBar` |
| `gamification_system.user_stats` | `level` | `UserStats.level: number` | `GamificationService.calculateLevel()` | - | `ranksStore.userProgress.currentLevel` | `LevelBadge` |
| `gamification_system.user_ranks` | `current_rank` | `UserRanks.current_rank: RangoMaya` | `GamificationService.rankUp()` | - | `ranksStore.userProgress.currentRank` | `RankBadge` |
| `gamification_system.user_ranks` | `rank_achieved_at` | `UserRanks.rank_achieved_at: Date` | - | - | - | Rank history |
| `gamification_system.user_ranks` | `rank_progress_percentage` | `UserRanks.rank_progress_percentage` | Calculated | - | `ranksStore.userProgress.rankProgress` | `RankProgressBar` |

---

### 4.5 Missions System Flow

| DB Table | Column | Backend Type | Backend Service | API Endpoint | Frontend Store | UI Component |
|----------|--------|--------------|-----------------|--------------|----------------|--------------|
| `gamification_system.missions` | `id` | `Mission.id: string` | `MissionsService.createMission()` | `GET /gamification/missions` | `missionsStore.missions[].id` | `MissionCard` |
| `gamification_system.missions` | `title` | `Mission.title: string` | - | - | `missionsStore.missions[].title` | Card title |
| `gamification_system.missions` | `type` | `Mission.type: MissionType` | - | - | `missionsStore.missions[].type` | Type badge |
| `gamification_system.missions` | `objectives` | `Mission.objectives: JSONB` | - | - | `missionsStore.missions[].objectives` | `ObjectivesList` |
| `gamification_system.missions` | `ml_coins_reward` | `Mission.ml_coins_reward: number` | - | - | `missionsStore.missions[].mlCoinsReward` | Reward display |
| `gamification_system.missions` | `status` | `Mission.status` | `MissionsService.claimReward()` | `POST /missions/:id/claim` | `missionsStore.missions[].status` | Claim button state |

---

### 4.6 Notifications Flow

| DB Table | Column | Backend Type | Backend Service | API Endpoint | WebSocket Event | Frontend Store | UI Component |
|----------|--------|--------------|-----------------|--------------|-----------------|----------------|--------------|
| `notifications.user_notifications` | `id` | `Notification.id` | `NotificationsService.createNotification()` | `GET /notifications` | `new_notification` | `notificationsStore.notifications[].id` | `NotificationItem` |
| `notifications.user_notifications` | `type` | `Notification.type` | - | - | - | `notificationsStore.notifications[].type` | Icon/badge |
| `notifications.user_notifications` | `title` | `Notification.title` | - | - | - | `notificationsStore.notifications[].title` | Title |
| `notifications.user_notifications` | `message` | `Notification.message` | - | - | - | `notificationsStore.notifications[].message` | Message body |
| `notifications.user_notifications` | `is_read` | `Notification.is_read` | `NotificationsService.markAsRead()` | `PUT /notifications/:id/read` | `notification_read` | `notificationsStore.notifications[].isRead` | Read indicator |
| - | - | - | - | - | `unread_count_updated` | `notificationsStore.unreadCount` | `NotificationBadge` count |

---

### 4.7 Module Progress Flow

| DB Table | Column | Backend Type | Backend Service | API Endpoint | Frontend Store | UI Component |
|----------|--------|--------------|-----------------|--------------|----------------|--------------|
| `progress_tracking.module_progress` | `id` | `ModuleProgress.id` | `ProgressService.updateModuleProgress()` | `GET /progress/modules/:id` | Local state | `ModuleProgressCard` |
| `progress_tracking.module_progress` | `completed_exercises` | `ModuleProgress.completed_exercises` | - | - | - | Progress text |
| `progress_tracking.module_progress` | `total_exercises` | `ModuleProgress.total_exercises` | - | - | - | Progress text |
| `progress_tracking.module_progress` | `progress_percentage` | `ModuleProgress.progress_percentage` | Calculated | - | - | `ProgressBar` |
| `progress_tracking.module_progress` | `average_score` | `ModuleProgress.average_score` | Calculated | - | - | Score display |
| `progress_tracking.module_progress` | `status` | `ModuleProgress.status` | - | - | - | Status badge |

---

## 5. Patrones de Integracion

### 5.1 Transacciones Atomicas

**Pattern:** Operaciones multi-tabla en transaccion

```typescript
// Backend pattern
async complexOperation(userId: string) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Operacion 1
    await operation1(userId, client);

    // Operacion 2
    await operation2(userId, client);

    // Operacion 3
    await operation3(userId, client);

    await client.query('COMMIT');

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

**Uso en el Sistema:**
- Submit Exercise (actualiza attempts, stats, coins, progress)
- Rank Up (actualiza rank, stats, coins, achievements)
- Complete Module (actualiza progress, stats, coins, notifications)

---

### 5.2 Optimistic Updates

**Pattern:** Actualizar UI antes de confirmacion del servidor

```typescript
// Frontend pattern
async purchaseItem(itemId: string) {
  const item = getItem(itemId);

  // Optimistic update
  setState({
    balance: balance - item.price,
    inventory: [...inventory, item]
  });

  try {
    await api.purchaseItem(itemId);
  } catch (error) {
    // Revert on error
    setState({
      balance: balance + item.price,
      inventory: inventory.filter(i => i.id !== itemId)
    });
    toast.error('Purchase failed');
  }
}
```

**Uso en el Sistema:**
- Compra de items en tienda
- Claim de recompensas de misiones
- Marcar notificaciones como leidas

---

### 5.3 Caching Strategies

**Pattern:** Cache de datos frecuentemente accedidos

```typescript
// Frontend store with cache
export const useEconomyStore = create<EconomyState>()(
  persist(
    (set, get) => ({
      balance: { current: 0, lifetime: 0, spent: 0 },
      lastFetch: null,

      fetchBalance: async () => {
        const now = Date.now();
        const lastFetch = get().lastFetch;

        // Cache for 5 minutes
        if (lastFetch && now - lastFetch < 5 * 60 * 1000) {
          return;
        }

        const response = await api.getBalance();
        set({ balance: response.data, lastFetch: now });
      }
    }),
    { name: 'economy-storage' }
  )
);
```

**Uso en el Sistema:**
- Balance de ML Coins (economyStore)
- User profile (authStore)
- Estadisticas de gamificacion

---

### 5.4 WebSocket Real-Time Updates

**Pattern:** Sincronizacion en tiempo real

```typescript
// Backend emite evento
realtimeService.emitNotificationToUser(userId, {
  type: 'achievement_unlocked',
  title: 'Achievement!',
  message: 'You unlocked "First Steps"',
  data: { achievementId, rewards }
});

// Frontend recibe y actualiza store
socket.on('new_notification', (notification) => {
  useNotificationsStore.getState().addNotification(notification);
  toast.info(notification.message);
});
```

**Uso en el Sistema:**
- Notificaciones en tiempo real
- Actualizacion de contador de no leidas
- Eventos de logros desbloqueados
- Cambios en leaderboards

---

### 5.5 Error Handling & Retry

**Pattern:** Manejo robusto de errores con retry logic

```typescript
// API client with retry
async function apiCallWithRetry(url: string, options: RequestOptions, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url, options);
    } catch (error) {
      if (i === retries - 1) throw error;

      // Exponential backoff
      await sleep(Math.pow(2, i) * 1000);
    }
  }
}
```

**Uso en el Sistema:**
- Llamadas API criticas (submit exercise, transactions)
- WebSocket reconnection
- File uploads

---

## Conclusion

Este documento ha trazado **15 flujos principales** del sistema GAMILIT Platform, documentando la arquitectura end-to-end desde PostgreSQL hasta React.

### Flujos Documentados

1. ✅ Autenticacion de Usuario (Login)
2. ✅ Envio de Ejercicio (Submit Exercise)
3. ✅ Transaccion de ML Coins
4. ✅ Progresion de Rangos Maya
5. ✅ Sistema de Misiones Diarias
6. ✅ Notificaciones en Tiempo Real (WebSocket)
7. ✅ Leaderboards Globales
8. ✅ Sistema de Achievements (Logros)
9. ✅ Classroom Management (Teacher)
10. ✅ Student Progress Tracking

### Componentes Clave del Sistema

**Database (PostgreSQL):**
- 44 tablas organizadas en 9 schemas
- ENUMs personalizados (gamilit_role, rango_maya, exercise_type, transaction_type)
- JSONB para contenido flexible
- Triggers automaticos para auditoría

**Backend (Node.js/TypeScript):**
- 11 módulos funcionales
- 177+ endpoints REST
- WebSocket para tiempo real
- Clean Architecture (Controller-Service-Repository)
- Transacciones atomicas para operaciones criticas

**Frontend (React/TypeScript):**
- Feature-Sliced Design architecture
- 3 aplicaciones especializadas (student, teacher, admin)
- 11 Zustand stores para estado global
- 33 mecánicas educativas
- WebSocket integration para notificaciones

### Type Safety End-to-End

El sistema mantiene **type safety completo** desde la base de datos hasta la UI:

```
PostgreSQL ENUMs → TypeScript Types → React Props
      ↓                    ↓                ↓
  rango_maya        RangoMaya type     rank: RangoMaya
```

---

**Documento generado:** Octubre 2025
**Mantenido por:** GAMILIT Platform Team
**Proxima revision:** Diciembre 2025
