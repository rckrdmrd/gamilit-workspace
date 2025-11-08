# ET-PRG-001: Implementación de Tracking de Progreso

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-PRG-001 |
| **Módulo** | 04 - Progreso y Seguimiento |
| **Título** | Implementación de Tracking de Progreso |
| **Prioridad** | Crítica |
| **Estado** | ✅ Implementado |
| **Versión** | 1.0 |
| **Fecha Creación** | 2025-11-07 |
| **Última Actualización** | 2025-11-07 |
| **Autor** | Database Team, Backend Team |
| **Reviewers** | Backend Lead, QA Lead |

---

## 🔗 Referencias

### Requerimiento Funcional

📘 **Documento RF:**
- [RF-PRG-001: Estados de Progreso y Tracking](../../01-requerimientos/04-progreso-seguimiento/RF-PRG-001-estados-progreso.md)

### Implementación DDL

🗄️ **ENUMs:**
- `progress_tracking.progress_status` - `apps/database/ddl/00-prerequisites.sql:66-70`
- `progress_tracking.attempt_status` - `apps/database/ddl/00-prerequisites.sql:71-75`

🗄️ **Tablas:**
- `progress_tracking.module_progress`
- `progress_tracking.lesson_progress`
- `progress_tracking.exercise_attempts`

---

## 🏗️ Arquitectura

### Flujo de Actualización de Progreso

```
Usuario completa ejercicio
        ↓
ExerciseService.submitAnswer()
        ↓
    ┌──────────────────────────────────┐
    │ INSERT exercise_attempts         │
    │ - attempt_number                 │
    │ - is_correct = true              │
    │ - score = 95                     │
    └─────────────┬────────────────────┘
                  ↓
    ┌──────────────────────────────────┐
    │ Trigger: update_lesson_progress  │
    │ - exercises_completed += 1       │
    │ - completion_percentage = calc   │
    │ - status = check_status()        │
    └─────────────┬────────────────────┘
                  ↓
    ┌──────────────────────────────────┐
    │ Trigger: update_module_progress  │
    │ - exercises_completed += 1       │
    │ - completion_percentage = calc   │
    │ - status = check_status()        │
    └─────────────┬────────────────────┘
                  ↓
    ┌──────────────────────────────────┐
    │ Event: progress.updated          │
    │ - AchievementListener            │
    │ - NotificationService            │
    └──────────────────────────────────┘
```

---

## 💾 Implementación de Base de Datos

### 1. ENUM: progress_status

**Ubicación:** `apps/database/ddl/00-prerequisites.sql:66-70`

```sql
-- Progress Status (Módulos y Lecciones)
CREATE TYPE progress_tracking.progress_status AS ENUM (
    'not_started',      -- No ha intentado ningún ejercicio
    'in_progress',      -- Algunos ejercicios completados
    'completed',        -- Todos los ejercicios completados
    'mastered'          -- Completado con excelencia (avg_score >= 90)
);

COMMENT ON TYPE progress_tracking.progress_status IS 'Estados de progreso en módulos y lecciones';
```

### 2. ENUM: attempt_status

**Ubicación:** `apps/database/ddl/00-prerequisites.sql:71-75`

```sql
-- Attempt Status (Intentos de Ejercicio)
CREATE TYPE progress_tracking.attempt_status AS ENUM (
    'started',          -- Usuario abrió ejercicio
    'in_progress',      -- Usuario interactuando
    'submitted',        -- Respuesta enviada
    'evaluated',        -- Validado (correcto o incorrecto)
    'discounted'        -- No cuenta (usado con Segunda Oportunidad)
);

COMMENT ON TYPE progress_tracking.attempt_status IS 'Estados de intentos de ejercicios';
```

### 3. Tabla: module_progress

**Ubicación:** `apps/database/ddl/schemas/progress_tracking/tables/module_progress.sql`

```sql
CREATE TABLE IF NOT EXISTS progress_tracking.module_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relaciones
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES educational_content.modules(id) ON DELETE CASCADE,

    -- Estado y progreso
    status progress_tracking.progress_status NOT NULL DEFAULT 'not_started',
    completion_percentage INTEGER NOT NULL DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),

    -- Contadores
    exercises_completed INTEGER NOT NULL DEFAULT 0,
    exercises_total INTEGER NOT NULL, -- Denormalizado para performance

    -- Scores
    avg_score NUMERIC(5,2), -- Promedio de scores de ejercicios completados
    best_score NUMERIC(5,2), -- Mejor score alcanzado

    -- Tiempo
    total_time_spent_seconds INTEGER DEFAULT 0,
    last_activity_at TIMESTAMPTZ,

    -- Maestría
    mastered_at TIMESTAMPTZ,
    mastery_achievement_id UUID REFERENCES gamification_system.user_achievements(id),

    -- Auditoría
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraint
    UNIQUE(user_id, module_id)
);

-- Índices
CREATE INDEX idx_module_progress_user ON progress_tracking.module_progress(user_id);
CREATE INDEX idx_module_progress_module ON progress_tracking.module_progress(module_id);
CREATE INDEX idx_module_progress_status ON progress_tracking.module_progress(status);
CREATE INDEX idx_module_progress_completion ON progress_tracking.module_progress(completion_percentage);

-- Trigger para updated_at
CREATE TRIGGER trg_module_progress_updated_at
    BEFORE UPDATE ON progress_tracking.module_progress
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

COMMENT ON TABLE progress_tracking.module_progress IS 'Progreso del usuario en cada módulo';
```

### 4. Tabla: lesson_progress

```sql
CREATE TABLE IF NOT EXISTS progress_tracking.lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES educational_content.lessons(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES educational_content.modules(id) ON DELETE CASCADE,

    status progress_tracking.progress_status NOT NULL DEFAULT 'not_started',
    completion_percentage INTEGER NOT NULL DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),

    exercises_completed INTEGER NOT NULL DEFAULT 0,
    exercises_total INTEGER NOT NULL,

    avg_score NUMERIC(5,2),
    total_time_spent_seconds INTEGER DEFAULT 0,

    last_activity_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    mastered_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, lesson_id)
);

CREATE INDEX idx_lesson_progress_user ON progress_tracking.lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson ON progress_tracking.lesson_progress(lesson_id);
CREATE INDEX idx_lesson_progress_module ON progress_tracking.lesson_progress(module_id);
```

### 5. Tabla: exercise_attempts

**Ubicación:** `apps/database/ddl/schemas/progress_tracking/tables/exercise_attempts.sql`

```sql
CREATE TABLE IF NOT EXISTS progress_tracking.exercise_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Relaciones
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES educational_content.exercises(id) ON DELETE CASCADE,

    -- Intento
    attempt_number INTEGER NOT NULL DEFAULT 1,
    status progress_tracking.attempt_status NOT NULL DEFAULT 'started',

    -- Resultado
    is_correct BOOLEAN,
    score NUMERIC(5,2) CHECK (score >= 0 AND score <= 100),
    feedback TEXT,

    -- Respuesta del usuario (JSONB)
    user_answer JSONB,

    -- Tiempo
    time_spent_seconds INTEGER,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    evaluated_at TIMESTAMPTZ,

    -- Comodines usados
    comodines_used JSONB, -- { "pistas": 2, "vision_lectora": 1 }

    -- Metadata
    is_discounted BOOLEAN DEFAULT false, -- Si es true, no cuenta en estadísticas
    device_type VARCHAR(50), -- web, mobile_android, mobile_ios
    ip_address INET,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraint
    CHECK (attempt_number > 0)
);

-- Índices
CREATE INDEX idx_exercise_attempts_user ON progress_tracking.exercise_attempts(user_id);
CREATE INDEX idx_exercise_attempts_exercise ON progress_tracking.exercise_attempts(exercise_id);
CREATE INDEX idx_exercise_attempts_user_exercise ON progress_tracking.exercise_attempts(user_id, exercise_id);
CREATE INDEX idx_exercise_attempts_status ON progress_tracking.exercise_attempts(status);
CREATE INDEX idx_exercise_attempts_started_at ON progress_tracking.exercise_attempts(started_at DESC);

COMMENT ON TABLE progress_tracking.exercise_attempts IS 'Cada intento de ejercicio (múltiples por ejercicio)';
COMMENT ON COLUMN progress_tracking.exercise_attempts.is_discounted IS 'Si true, no cuenta en estadísticas (usado con Segunda Oportunidad)';
```

### 6. Trigger: Actualizar Lesson Progress

**Ubicación:** `apps/database/ddl/schemas/progress_tracking/triggers/update_lesson_progress.sql`

```sql
CREATE OR REPLACE FUNCTION progress_tracking.fn_update_lesson_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_lesson_id UUID;
    v_exercises_total INTEGER;
    v_exercises_completed INTEGER;
    v_completion_percentage INTEGER;
    v_avg_score NUMERIC(5,2);
    v_new_status progress_tracking.progress_status;
BEGIN
    -- Solo actualizar si el intento es exitoso y no está descontado
    IF NEW.is_correct = true AND NEW.is_discounted = false THEN

        -- Obtener lesson_id del ejercicio
        SELECT lesson_id INTO v_lesson_id
        FROM educational_content.exercises
        WHERE id = NEW.exercise_id;

        -- Contar ejercicios completados vs totales
        SELECT
            COUNT(DISTINCT e.id) as total,
            COUNT(DISTINCT CASE
                WHEN ea.is_correct = true AND ea.is_discounted = false
                THEN ea.exercise_id
            END) as completed
        INTO v_exercises_total, v_exercises_completed
        FROM educational_content.exercises e
        LEFT JOIN progress_tracking.exercise_attempts ea
            ON e.id = ea.exercise_id AND ea.user_id = NEW.user_id
        WHERE e.lesson_id = v_lesson_id;

        -- Calcular porcentaje
        v_completion_percentage := ROUND((v_exercises_completed::NUMERIC / v_exercises_total) * 100);

        -- Calcular avg_score
        SELECT AVG(score) INTO v_avg_score
        FROM progress_tracking.exercise_attempts
        WHERE user_id = NEW.user_id
            AND exercise_id IN (
                SELECT id FROM educational_content.exercises WHERE lesson_id = v_lesson_id
            )
            AND is_correct = true
            AND is_discounted = false;

        -- Determinar nuevo status
        IF v_completion_percentage = 0 THEN
            v_new_status := 'not_started';
        ELSIF v_completion_percentage = 100 THEN
            IF v_avg_score >= 90 THEN
                v_new_status := 'mastered';
            ELSE
                v_new_status := 'completed';
            END IF;
        ELSE
            v_new_status := 'in_progress';
        END IF;

        -- Upsert lesson_progress
        INSERT INTO progress_tracking.lesson_progress (
            user_id,
            lesson_id,
            module_id,
            status,
            completion_percentage,
            exercises_completed,
            exercises_total,
            avg_score,
            last_activity_at,
            started_at,
            completed_at,
            mastered_at
        ) VALUES (
            NEW.user_id,
            v_lesson_id,
            (SELECT module_id FROM educational_content.lessons WHERE id = v_lesson_id),
            v_new_status,
            v_completion_percentage,
            v_exercises_completed,
            v_exercises_total,
            v_avg_score,
            NOW(),
            CASE WHEN v_exercises_completed = 1 THEN NOW() ELSE NULL END,
            CASE WHEN v_new_status IN ('completed', 'mastered') THEN NOW() ELSE NULL END,
            CASE WHEN v_new_status = 'mastered' THEN NOW() ELSE NULL END
        )
        ON CONFLICT (user_id, lesson_id) DO UPDATE SET
            status = v_new_status,
            completion_percentage = v_completion_percentage,
            exercises_completed = v_exercises_completed,
            avg_score = v_avg_score,
            last_activity_at = NOW(),
            completed_at = CASE
                WHEN v_new_status IN ('completed', 'mastered') AND progress_tracking.lesson_progress.completed_at IS NULL
                THEN NOW()
                ELSE progress_tracking.lesson_progress.completed_at
            END,
            mastered_at = CASE
                WHEN v_new_status = 'mastered' AND progress_tracking.lesson_progress.mastered_at IS NULL
                THEN NOW()
                ELSE progress_tracking.lesson_progress.mastered_at
            END,
            updated_at = NOW();

        RAISE NOTICE 'Lesson progress updated: user=%, lesson=%, status=%', NEW.user_id, v_lesson_id, v_new_status;
    END IF;

    RETURN NEW;
END;
$$;

-- Crear trigger
CREATE TRIGGER trg_update_lesson_progress
    AFTER INSERT OR UPDATE OF is_correct ON progress_tracking.exercise_attempts
    FOR EACH ROW
    WHEN (NEW.is_correct = true)
    EXECUTE FUNCTION progress_tracking.fn_update_lesson_progress();
```

### 7. Trigger: Actualizar Module Progress

```sql
CREATE OR REPLACE FUNCTION progress_tracking.fn_update_module_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_module_id UUID;
    v_exercises_total INTEGER;
    v_exercises_completed INTEGER;
    v_completion_percentage INTEGER;
    v_avg_score NUMERIC(5,2);
    v_new_status progress_tracking.progress_status;
BEGIN
    v_module_id := NEW.module_id;

    -- Contar ejercicios
    SELECT
        COUNT(DISTINCT e.id) as total,
        COUNT(DISTINCT CASE
            WHEN ea.is_correct = true AND ea.is_discounted = false
            THEN ea.exercise_id
        END) as completed
    INTO v_exercises_total, v_exercises_completed
    FROM educational_content.exercises e
    LEFT JOIN progress_tracking.exercise_attempts ea
        ON e.id = ea.exercise_id AND ea.user_id = NEW.user_id
    WHERE e.module_id = v_module_id;

    v_completion_percentage := ROUND((v_exercises_completed::NUMERIC / v_exercises_total) * 100);

    -- Calcular avg_score
    SELECT AVG(score) INTO v_avg_score
    FROM progress_tracking.exercise_attempts
    WHERE user_id = NEW.user_id
        AND exercise_id IN (
            SELECT id FROM educational_content.exercises WHERE module_id = v_module_id
        )
        AND is_correct = true
        AND is_discounted = false;

    -- Determinar status
    IF v_completion_percentage = 0 THEN
        v_new_status := 'not_started';
    ELSIF v_completion_percentage = 100 THEN
        IF v_avg_score >= 90 THEN
            v_new_status := 'mastered';
        ELSE
            v_new_status := 'completed';
        END IF;
    ELSE
        v_new_status := 'in_progress';
    END IF;

    -- Upsert module_progress
    INSERT INTO progress_tracking.module_progress (
        user_id,
        module_id,
        status,
        completion_percentage,
        exercises_completed,
        exercises_total,
        avg_score,
        last_activity_at,
        started_at,
        completed_at,
        mastered_at
    ) VALUES (
        NEW.user_id,
        v_module_id,
        v_new_status,
        v_completion_percentage,
        v_exercises_completed,
        v_exercises_total,
        v_avg_score,
        NOW(),
        CASE WHEN v_exercises_completed = 1 THEN NOW() ELSE NULL END,
        CASE WHEN v_new_status IN ('completed', 'mastered') THEN NOW() ELSE NULL END,
        CASE WHEN v_new_status = 'mastered' THEN NOW() ELSE NULL END
    )
    ON CONFLICT (user_id, module_id) DO UPDATE SET
        status = v_new_status,
        completion_percentage = v_completion_percentage,
        exercises_completed = v_exercises_completed,
        avg_score = v_avg_score,
        last_activity_at = NOW(),
        completed_at = CASE
            WHEN v_new_status IN ('completed', 'mastered') AND progress_tracking.module_progress.completed_at IS NULL
            THEN NOW()
            ELSE progress_tracking.module_progress.completed_at
        END,
        mastered_at = CASE
            WHEN v_new_status = 'mastered' AND progress_tracking.module_progress.mastered_at IS NULL
            THEN NOW()
            ELSE progress_tracking.module_progress.mastered_at
        END,
        updated_at = NOW();

    RAISE NOTICE 'Module progress updated: user=%, module=%, status=%', NEW.user_id, v_module_id, v_new_status;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_module_progress
    AFTER INSERT OR UPDATE ON progress_tracking.lesson_progress
    FOR EACH ROW
    EXECUTE FUNCTION progress_tracking.fn_update_module_progress();
```

---

## 🔧 Implementación Backend (NestJS)

### 1. Enums TypeScript

```typescript
export enum ProgressStatusEnum {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  MASTERED = 'mastered',
}

export enum AttemptStatusEnum {
  STARTED = 'started',
  IN_PROGRESS = 'in_progress',
  SUBMITTED = 'submitted',
  EVALUATED = 'evaluated',
  DISCOUNTED = 'discounted',
}
```

### 2. Entities

```typescript
@Entity({ schema: 'progress_tracking', name: 'module_progress' })
export class ModuleProgress {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'uuid', name: 'module_id' })
  moduleId: string;

  @Column({ type: 'enum', enum: ProgressStatusEnum, default: ProgressStatusEnum.NOT_STARTED })
  status: ProgressStatusEnum;

  @Column({ type: 'integer', default: 0, name: 'completion_percentage' })
  completionPercentage: number;

  @Column({ type: 'integer', default: 0, name: 'exercises_completed' })
  exercisesCompleted: number;

  @Column({ type: 'integer', name: 'exercises_total' })
  exercisesTotal: number;

  @Column({ type: 'numeric', precision: 5, scale: 2, nullable: true, name: 'avg_score' })
  avgScore?: number;

  @Column({ type: 'integer', default: 0, name: 'total_time_spent_seconds' })
  totalTimeSpentSeconds: number;

  @Column({ type: 'timestamptz', nullable: true, name: 'last_activity_at' })
  lastActivityAt?: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'started_at' })
  startedAt?: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'completed_at' })
  completedAt?: Date;

  @Column({ type: 'timestamptz', nullable: true, name: 'mastered_at' })
  masteredAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### 3. ProgressService

```typescript
@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(ModuleProgress)
    private moduleProgressRepo: Repository<ModuleProgress>,

    @InjectRepository(LessonProgress)
    private lessonProgressRepo: Repository<LessonProgress>,

    @InjectRepository(ExerciseAttempt)
    private attemptRepo: Repository<ExerciseAttempt>,
  ) {}

  /**
   * Obtener progreso de usuario en módulo
   */
  async getModuleProgress(userId: string, moduleId: string): Promise<ModuleProgress> {
    let progress = await this.moduleProgressRepo.findOne({
      where: { userId, moduleId },
    });

    if (!progress) {
      // Crear registro inicial
      const module = await this.getModule(moduleId);

      progress = await this.moduleProgressRepo.save({
        userId,
        moduleId,
        exercisesTotal: module.exercises_total,
        status: ProgressStatusEnum.NOT_STARTED,
        completionPercentage: 0,
        exercisesCompleted: 0,
      });
    }

    return progress;
  }

  /**
   * Obtener todos los módulos con progreso
   */
  async getUserProgress(userId: string): Promise<{
    modules: ModuleProgress[];
    overall: {
      totalModules: number;
      completedModules: number;
      masteredModules: number;
      overallPercentage: number;
    };
  }> {
    const modules = await this.moduleProgressRepo.find({
      where: { userId },
      order: { lastActivityAt: 'DESC' },
    });

    const totalModules = modules.length;
    const completedModules = modules.filter((m) =>
      [ProgressStatusEnum.COMPLETED, ProgressStatusEnum.MASTERED].includes(m.status)
    ).length;
    const masteredModules = modules.filter((m) => m.status === ProgressStatusEnum.MASTERED).length;

    const overallPercentage =
      totalModules > 0
        ? Math.round(modules.reduce((sum, m) => sum + m.completionPercentage, 0) / totalModules)
        : 0;

    return {
      modules,
      overall: {
        totalModules,
        completedModules,
        masteredModules,
        overallPercentage,
      },
    };
  }

  /**
   * Registrar intento de ejercicio
   */
  async recordAttempt(
    userId: string,
    exerciseId: string,
    userAnswer: any,
    isCorrect: boolean,
    score: number,
    timeSpent: number
  ): Promise<ExerciseAttempt> {
    // Obtener attempt_number
    const previousAttempts = await this.attemptRepo.count({
      where: { userId, exerciseId },
    });

    const attemptNumber = previousAttempts + 1;

    const attempt = await this.attemptRepo.save({
      userId,
      exerciseId,
      attemptNumber,
      status: AttemptStatusEnum.EVALUATED,
      isCorrect,
      score,
      userAnswer,
      timeSpentSeconds: timeSpent,
      startedAt: new Date(Date.now() - timeSpent * 1000),
      submittedAt: new Date(),
      evaluatedAt: new Date(),
    });

    // Los triggers de DB se encargan de actualizar lesson_progress y module_progress

    return attempt;
  }

  /**
   * Marcar intento como descontado (Segunda Oportunidad)
   */
  async discountAttempt(attemptId: string): Promise<void> {
    await this.attemptRepo.update(attemptId, {
      isDiscounted: true,
      status: AttemptStatusEnum.DISCOUNTED,
    });
  }
}
```

### 4. Controller

```typescript
@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  @Get('modules/:moduleId')
  async getModuleProgress(@Req() req, @Param('moduleId') moduleId: string) {
    return await this.progressService.getModuleProgress(req.user.id, moduleId);
  }

  @Get('overview')
  async getUserProgress(@Req() req) {
    return await this.progressService.getUserProgress(req.user.id);
  }
}
```

---

## 🎨 Implementación Frontend (React)

### Component: ProgressDashboard

```typescript
export const ProgressDashboard: React.FC = () => {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    const data = await progressService.getUserProgress();
    setProgress(data);
  };

  if (!progress) return <div>Loading...</div>;

  return (
    <div className="progress-dashboard">
      <h1>Mi Progreso</h1>

      {/* Overall Stats */}
      <div className="overall-stats">
        <StatCard
          title="Módulos Completados"
          value={`${progress.overall.completedModules} / ${progress.overall.totalModules}`}
        />
        <StatCard title="Módulos Dominados" value={progress.overall.masteredModules} icon="🏆" />
        <StatCard title="Progreso General" value={`${progress.overall.overallPercentage}%`} />
      </div>

      {/* Modules List */}
      <div className="modules-list">
        {progress.modules.map((module) => (
          <ModuleProgressCard key={module.id} module={module} />
        ))}
      </div>
    </div>
  );
};
```

---

## 🧪 Testing

### Test Case: Trigger Actualiza Progreso

```typescript
test('Completing exercise triggers lesson and module progress update', async () => {
  const user = await createUser();
  const module = await createModule({ exercises_total: 10 });
  const lesson = await createLesson({ module_id: module.id, exercises_total: 5 });
  const exercise = await createExercise({ lesson_id: lesson.id });

  // Completar ejercicio
  await progressService.recordAttempt(user.id, exercise.id, { answer: 'correct' }, true, 100, 60);

  // Esperar triggers
  await delay(100);

  // Verificar lesson_progress
  const lessonProgress = await getLessonProgress(user.id, lesson.id);
  expect(lessonProgress.exercises_completed).toBe(1);
  expect(lessonProgress.completion_percentage).toBe(20); // 1/5 * 100

  // Verificar module_progress
  const moduleProgress = await getModuleProgress(user.id, module.id);
  expect(moduleProgress.exercises_completed).toBe(1);
  expect(moduleProgress.completion_percentage).toBe(10); // 1/10 * 100
});
```

---

## 📊 Performance

### Índices Críticos

```sql
CREATE INDEX idx_module_progress_user ON progress_tracking.module_progress(user_id);
CREATE INDEX idx_exercise_attempts_user_exercise ON progress_tracking.exercise_attempts(user_id, exercise_id);
```

### Denormalización

- `exercises_total` se guarda en `module_progress` y `lesson_progress` para evitar COUNT() costosos

---

## 📅 Historial de Cambios

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2025-11-07 | Database Team | Creación del documento |

---

**Documento:** `docs/02-especificaciones-tecnicas/04-progreso-seguimiento/ET-PRG-001-estados-progreso.md`
**Propósito:** Especificación técnica completa del tracking de progreso
**Audiencia:** Backend Developers, QA Team
