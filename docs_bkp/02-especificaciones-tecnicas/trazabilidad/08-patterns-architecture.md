# Trazabilidad: Patterns & Architecture

**Metadata RFC-0001**
- **Tipo:** Especificacion Tecnica - Patrones y Arquitectura
- **Categoria:** Design Patterns, Best Practices, Architecture
- **Version:** 2.0
- **Fecha:** Octubre 2025
- **Stack:** PostgreSQL 16 → Node.js/TypeScript → React/TypeScript
- **Autor:** Sistema GAMILIT
- **Estado:** Activo

---

## Vision General

Este documento describe los patrones de diseno y arquitectura utilizados en la plataforma GAMILIT para garantizar escalabilidad, mantenibilidad y consistencia.

**Alcance:** Design Patterns, Integration Patterns, Best Practices

---

## 1. Patrones de Integracion

### 1.1 Transacciones Atomicas

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

**Ventajas:**
- Garantiza consistencia de datos
- All-or-nothing operations
- Rollback automatico en errores

---

### 1.2 Optimistic Updates

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

**Ventajas:**
- Mejor UX (respuesta inmediata)
- Percepcion de rapidez
- Reversion automatica en errores

---

### 1.3 Caching Strategies

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
    {
      name: 'economy-storage',
      partialize: (state) => ({ balance: state.balance })
    }
  )
);
```

**Uso en el Sistema:**
- User stats (ML Coins, XP)
- Leaderboards
- Achievement progress
- Notifications

**Ventajas:**
- Reduce llamadas al servidor
- Mejora performance
- Funciona offline (parcial)

---

## 2. Patrones de Estado

### 2.1 Zustand Store Pattern

**Pattern:** State management con Zustand

```typescript
interface StoreState {
  data: DataType;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchData: () => Promise<void>;
  updateData: (newData: Partial<DataType>) => void;
  reset: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  data: initialData,
  isLoading: false,
  error: null,

  fetchData: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.fetchData();
      set({ data: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateData: (newData) => {
    set((state) => ({ data: { ...state.data, ...newData } }));
  },

  reset: () => {
    set({ data: initialData, isLoading: false, error: null });
  }
}));
```

**Uso en el Sistema:**
- authStore (authentication)
- economyStore (ML Coins)
- ranksStore (XP, levels, ranks)
- notificationsStore (real-time notifications)
- missionsStore (daily/weekly missions)

---

### 2.2 Event-Driven Updates

**Pattern:** WebSocket events actualizan stores

```typescript
// WebSocket hook
export const useWebSocket = () => {
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    socket.current = io(WS_URL, { auth: { token } });

    // Register event handlers
    socket.current.on('new_notification', (notification) => {
      useNotificationsStore.getState().addNotification(notification);
    });

    socket.current.on('coins_updated', ({ amount, newBalance }) => {
      useEconomyStore.getState().updateBalance(newBalance);
    });

    socket.current.on('xp_gained', ({ amount }) => {
      useRanksStore.getState().addXP(amount);
    });

    return () => {
      socket.current?.disconnect();
    };
  }, [token]);

  return socket.current;
};
```

---

## 3. Patrones de Backend

### 3.1 Repository Pattern

**Pattern:** Separacion de data access logic

```typescript
// Repository interface
export interface IExercisesRepository {
  findById(id: string): Promise<Exercise | null>;
  createAttempt(data: CreateAttemptDto): Promise<ExerciseAttempt>;
  findUserAttempts(userId: string, exerciseId: string): Promise<ExerciseAttempt[]>;
}

// Repository implementation
export class ExercisesRepository implements IExercisesRepository {
  async findById(id: string): Promise<Exercise | null> {
    const result = await pool.query(
      'SELECT * FROM educational_content.exercises WHERE id = $1',
      [id]
    );
    return result.rows[0] || null;
  }

  async createAttempt(data: CreateAttemptDto): Promise<ExerciseAttempt> {
    const result = await pool.query(
      `INSERT INTO progress_tracking.exercise_attempts (...) VALUES (...)`,
      [...]
    );
    return result.rows[0];
  }
}
```

**Ventajas:**
- Testeable (mocking facil)
- Reusable
- Centralized DB logic

---

### 3.2 Service Layer Pattern

**Pattern:** Business logic separada de controllers

```typescript
// Service
export class ExercisesService {
  constructor(
    private readonly repository: IExercisesRepository,
    private readonly scoringService: ScoringService,
    private readonly gamificationService: GamificationService
  ) {}

  async submitExercise(userId: string, exerciseId: string, submission: Submission) {
    // Business logic here
    const exercise = await this.repository.findById(exerciseId);
    const evaluation = await this.scoringService.evaluate(exercise, submission);

    if (evaluation.passed) {
      await this.gamificationService.addRewards(userId, exercise);
    }

    return { score: evaluation.score, passed: evaluation.passed };
  }
}

// Controller
export class ExercisesController {
  constructor(private readonly service: ExercisesService) {}

  async submitExercise(req: Request, res: Response) {
    const result = await this.service.submitExercise(
      req.user!.id,
      req.params.exerciseId,
      req.body
    );
    res.json({ success: true, data: result });
  }
}
```

---

### 3.3 Middleware Chain Pattern

**Pattern:** Request processing pipeline

```typescript
// Middleware stack
app.post(
  '/exercises/:id/submit',
  authenticate,           // 1. Validate JWT
  validateRequest,        // 2. Validate body schema
  checkExerciseAccess,   // 3. Check permissions
  rateLimit,             // 4. Rate limiting
  exercisesController.submitExercise  // 5. Handler
);
```

---

## 4. Patrones de Database

### 4.1 Ledger Pattern

**Pattern:** Immutable transaction history

```sql
-- Ledger table: ml_coins_transactions
-- Never UPDATE or DELETE, only INSERT
INSERT INTO gamification_system.ml_coins_transactions (
  id, user_id, amount, transaction_type,
  balance_before, balance_after, created_at
) VALUES (...);

-- Balance calculation from ledger
SELECT SUM(amount) as balance
FROM gamification_system.ml_coins_transactions
WHERE user_id = 'user-uuid';
```

**Ventajas:**
- Audit trail completo
- Reconstruccion de estado historico
- Debugging facil

---

### 4.2 Soft Delete Pattern

**Pattern:** Logical deletion

```sql
-- Never hard delete, use deleted_at
UPDATE auth_management.profiles
SET deleted_at = NOW()
WHERE id = 'user-uuid';

-- Always filter out soft-deleted records
SELECT * FROM auth_management.profiles
WHERE deleted_at IS NULL;
```

---

### 4.3 UPSERT Pattern

**Pattern:** Insert or Update

```sql
INSERT INTO progress_tracking.module_progress (
  user_id, module_id, progress_percentage, updated_at
) VALUES ($1, $2, $3, NOW())
ON CONFLICT (user_id, module_id) DO UPDATE SET
  progress_percentage = $3,
  updated_at = NOW();
```

---

## 5. Security Patterns

### 5.1 JWT Authentication

```typescript
// Middleware
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await findUserById(decoded.userId);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
```

---

### 5.2 Role-Based Access Control (RBAC)

```typescript
// Authorization middleware
export function requireRole(...allowedRoles: GamilaRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

// Usage
app.get('/admin/stats', authenticate, requireRole('super_admin'), statsController.getStats);
```

---

### 5.3 SQL Injection Prevention

```typescript
// Always use parameterized queries
// GOOD
await pool.query('SELECT * FROM profiles WHERE id = $1', [userId]);

// BAD - Never do this
await pool.query(`SELECT * FROM profiles WHERE id = '${userId}'`);
```

---

## 6. Error Handling Patterns

### 6.1 Custom Error Classes

```typescript
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Usage
throw new AppError('User not found', 404, 'USER_NOT_FOUND');
```

---

### 6.2 Global Error Handler

```typescript
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
      code: error.code
    });
  }

  console.error('Unexpected error:', error);
  res.status(500).json({ error: 'Internal server error' });
});
```

---

## 7. Testing Patterns

### 7.1 Test Structure (AAA Pattern)

```typescript
describe('ExercisesService', () => {
  it('should award coins when exercise passed', async () => {
    // Arrange
    const userId = 'test-user';
    const exerciseId = 'test-exercise';
    const mockExercise = { passing_score: 80, ml_coins_reward: 100 };

    // Act
    const result = await service.submitExercise(userId, exerciseId, submission);

    // Assert
    expect(result.passed).toBe(true);
    expect(result.rewards.mlCoins).toBe(100);
  });
});
```

---

## Referencias

- **Documento Padre:** TRAZABILIDAD-COMPLETA.md
- **Relacionado con:** Todos los modulos de trazabilidad
- **RFC-0001:** Governance Model GAMILIT Platform
- **Clean Code Principles:** Robert C. Martin
- **Design Patterns:** Gang of Four
