# 🗄️ DATABASE SCHEMA - SISTEMA DE RECOMPENSAS

**Versión:** v2.8.0
**Fecha:** 2025-11-29

---

## 📊 Esquema General

```
┌─────────────────────────────────────────────────────────────────────┐
│                    educational_content (schema)                     │
│  ┌──────────────────────────┐  ┌───────────────────────────────┐  │
│  │  modules                 │  │  exercises                    │  │
│  │  - id (PK)               │  │  - id (PK)                    │  │
│  │  - title                 │  │  - module_id (FK)             │  │
│  │  - description           │  │  - title                      │  │
│  │  - xp_reward             │  │  - xp_reward                  │  │
│  │  - ml_coins_reward       │  │  - ml_coins_reward            │  │
│  └──────────────────────────┘  └───────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    progress_tracking (schema)                       │
│  ┌──────────────────────────┐  ┌───────────────────────────────┐  │
│  │  exercise_submissions    │  │  exercise_attempts            │  │
│  │  (WORKFLOW TABLE)        │  │  (REWARDS TABLE)              │  │
│  │  - id (PK)               │  │  - id (PK)                    │  │
│  │  - user_id (FK)          │  │  - user_id (FK)               │  │
│  │  - exercise_id (FK)      │  │  - exercise_id (FK)           │  │
│  │  - status VARCHAR(20)    │  │  - submission_id (FK)         │  │
│  │    • draft               │  │  - score INTEGER              │  │
│  │    • submitted           │  │  - is_correct BOOLEAN         │  │
│  │    • graded              │  │  - xp_earned INTEGER          │  │
│  │  - answers JSONB         │  │  - ml_coins_earned INTEGER    │  │
│  │  - submitted_at          │  │  - hints_used INTEGER         │  │
│  │  - graded_at             │  │  - powerups_used JSONB        │  │
│  │  - feedback TEXT         │  │  - attempt_number INTEGER     │  │
│  │  - created_at            │  │  - time_spent INTEGER         │  │
│  │  - updated_at            │  │  - created_at                 │  │
│  └──────────────────────────┘  └───────────┬───────────────────┘  │
│                                             │                       │
│                                             │ TRIGGER               │
│                                             │                       │
└─────────────────────────────────────────────┼───────────────────────┘
                                              │
                                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       gamilit (schema)                              │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  update_user_stats_on_exercise_complete() - TRIGGER FUNCTION  │ │
│  │                                                                │ │
│  │  DECLARE                                                       │ │
│  │    v_is_correct BOOLEAN;                                       │ │
│  │    v_xp_earned INTEGER;                                        │ │
│  │    v_coins_earned INTEGER;                                     │ │
│  │  BEGIN                                                         │ │
│  │    v_is_correct := (NEW.is_correct OR NEW.score >= 60);       │ │
│  │    v_xp_earned := COALESCE(NEW.xp_earned, 10);                │ │
│  │    v_coins_earned := COALESCE(NEW.ml_coins_earned, 5);        │ │
│  │                                                                │ │
│  │    UPDATE gamification_system.user_stats                       │ │
│  │    SET exercises_completed = exercises_completed + 1,          │ │
│  │        total_xp = total_xp + v_xp_earned,                     │ │
│  │        ml_coins = ml_coins + v_coins_earned,                  │ │
│  │        ml_coins_earned_total = ml_coins_earned_total + ...    │ │
│  │    WHERE user_id = NEW.user_id;                               │ │
│  │                                                                │ │
│  │    IF NOT FOUND THEN                                          │ │
│  │      INSERT INTO user_stats (...) VALUES (...);               │ │
│  │    END IF;                                                     │ │
│  │  END;                                                          │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                              │
                                              │ UPDATE
                                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   gamification_system (schema)                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  user_stats                                                    │ │
│  │  - id (PK)                                                     │ │
│  │  - user_id (FK) UNIQUE                                         │ │
│  │  - tenant_id (FK)                                              │ │
│  │  - level INTEGER                                               │ │
│  │  - total_xp INTEGER                                            │ │
│  │  - xp_to_next_level INTEGER                                    │ │
│  │  - current_rank VARCHAR(50)                                    │ │
│  │  - rank_progress DECIMAL                                       │ │
│  │  - ml_coins INTEGER                  ⬅️ SALDO ACTUAL           │ │
│  │  - ml_coins_earned_total INTEGER    ⬅️ TOTAL GANADO (HISTORY)  │ │
│  │  - ml_coins_spent_total INTEGER     ⬅️ TOTAL GASTADO           │ │
│  │  - exercises_completed INTEGER                                 │ │
│  │  - modules_completed INTEGER                                   │ │
│  │  - perfect_scores INTEGER                                      │ │
│  │  - achievements_earned INTEGER                                 │ │
│  │  - current_streak INTEGER                                      │ │
│  │  - max_streak INTEGER                                          │ │
│  │  - last_activity_at TIMESTAMP                                  │ │
│  │  - created_at TIMESTAMP                                        │ │
│  │  - updated_at TIMESTAMP                                        │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Tablas Detalladas

### 1. `progress_tracking.exercise_attempts`

**Propósito:** Almacena cada intento de ejercicio con las recompensas calculadas

```sql
CREATE TABLE progress_tracking.exercise_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    tenant_id UUID REFERENCES auth.tenants(id),
    exercise_id UUID NOT NULL REFERENCES educational_content.exercises(id),
    submission_id UUID REFERENCES progress_tracking.exercise_submissions(id),

    -- SCORING
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    is_correct BOOLEAN DEFAULT false,
    attempt_number INTEGER DEFAULT 1,

    -- REWARDS (precalculados por ExerciseAttemptService)
    xp_earned INTEGER NOT NULL DEFAULT 0,
    ml_coins_earned INTEGER NOT NULL DEFAULT 0,

    -- GAMEPLAY
    hints_used INTEGER DEFAULT 0,
    powerups_used JSONB DEFAULT '[]'::JSONB,
    time_spent INTEGER, -- segundos

    -- METADATA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- CONSTRAINTS
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id),
    CONSTRAINT fk_exercise FOREIGN KEY (exercise_id) REFERENCES educational_content.exercises(id),
    CONSTRAINT fk_submission FOREIGN KEY (submission_id) REFERENCES progress_tracking.exercise_submissions(id)
);

-- ÍNDICES
CREATE INDEX idx_exercise_attempts_user ON exercise_attempts(user_id);
CREATE INDEX idx_exercise_attempts_exercise ON exercise_attempts(exercise_id);
CREATE INDEX idx_exercise_attempts_submission ON exercise_attempts(submission_id);
CREATE INDEX idx_exercise_attempts_created ON exercise_attempts(created_at DESC);
```

**Trigger Asociado:**
```sql
CREATE TRIGGER trg_update_user_stats_on_exercise
  AFTER INSERT ON progress_tracking.exercise_attempts
  FOR EACH ROW
  EXECUTE FUNCTION gamilit.update_user_stats_on_exercise_complete();
```

**Columnas Clave:**
- `xp_earned`: XP calculado después de penalties (0-200+)
- `ml_coins_earned`: ML Coins calculados después de penalties (0-100+)
- `is_correct`: true si score >= 60 o resultado correcto
- `hints_used`: Número de pistas usadas (afecta rewards)
- `powerups_used`: Array de IDs de powerups usados

---

### 2. `progress_tracking.exercise_submissions`

**Propósito:** Gestión del workflow de evaluación manual

```sql
CREATE TABLE progress_tracking.exercise_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    tenant_id UUID REFERENCES auth.tenants(id),
    exercise_id UUID NOT NULL REFERENCES educational_content.exercises(id),

    -- WORKFLOW
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
      -- 'draft' | 'submitted' | 'graded' | 'reviewed'

    -- ANSWERS
    answers JSONB,
    answer_data JSONB,

    -- SCORING (calculado al calificar)
    is_correct BOOLEAN DEFAULT false,
    xp_earned INTEGER DEFAULT 0,
    ml_coins_earned INTEGER DEFAULT 0,

    -- TIMING
    started_at TIMESTAMP WITH TIME ZONE,
    submitted_at TIMESTAMP WITH TIME ZONE,
    graded_at TIMESTAMP WITH TIME ZONE,

    -- EVALUATION
    feedback TEXT,
    grader_id UUID REFERENCES auth.users(id),

    -- METADATA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- CONSTRAINTS
    CHECK (status IN ('draft', 'submitted', 'graded', 'reviewed'))
);

-- ÍNDICES
CREATE INDEX idx_exercise_submissions_user ON exercise_submissions(user_id);
CREATE INDEX idx_exercise_submissions_exercise ON exercise_submissions(exercise_id);
CREATE INDEX idx_exercise_submissions_status ON exercise_submissions(status);
CREATE INDEX idx_exercise_submissions_graded ON exercise_submissions(graded_at DESC);
```

**Estados del Workflow:**
```
draft ──────▶ submitted ──────▶ graded ──────▶ reviewed
  (Save)        (Submit)        (Teacher)      (Final)
```

**Trigger Asociado (v2.8.0):**
```sql
CREATE TRIGGER trg_update_user_stats_on_submission
  AFTER UPDATE ON progress_tracking.exercise_submissions
  FOR EACH ROW
  WHEN (
      NEW.status IN ('graded', 'reviewed')
      AND NEW.is_correct = true
      AND (OLD.status IS DISTINCT FROM NEW.status
           OR OLD.is_correct IS DISTINCT FROM NEW.is_correct)
  )
  EXECUTE FUNCTION gamilit.update_user_stats_on_submission_graded();
```

**Columnas Clave para Recompensas:**
- `is_correct`: true si el maestro califica como correcto
- `xp_earned`: XP otorgado (calculado por servicio)
- `ml_coins_earned`: ML Coins otorgados (calculado por servicio)

---

### 3. `gamification_system.user_stats`

**Propósito:** Estadísticas acumuladas del usuario

```sql
CREATE TABLE gamification_system.user_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id),
    tenant_id UUID NOT NULL REFERENCES auth.tenants(id),

    -- LEVEL & XP
    level INTEGER DEFAULT 1,
    total_xp INTEGER DEFAULT 0,
    xp_to_next_level INTEGER DEFAULT 100,

    -- RANK
    current_rank VARCHAR(50) DEFAULT 'Ajaw',
    rank_progress DECIMAL(5,2) DEFAULT 0.00,

    -- ML COINS
    ml_coins INTEGER DEFAULT 100,                 -- Saldo actual
    ml_coins_earned_total INTEGER DEFAULT 0,      -- Total histórico ganado
    ml_coins_spent_total INTEGER DEFAULT 0,       -- Total histórico gastado
    ml_coins_earned_today INTEGER DEFAULT 0,
    last_ml_coins_reset TIMESTAMP WITH TIME ZONE,

    -- STREAKS
    current_streak INTEGER DEFAULT 0,
    max_streak INTEGER DEFAULT 0,
    streak_started_at TIMESTAMP WITH TIME ZONE,
    days_active_total INTEGER DEFAULT 0,

    -- EXERCISES
    exercises_completed INTEGER DEFAULT 0,
    modules_completed INTEGER DEFAULT 0,
    perfect_scores INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    average_score DECIMAL(5,2),

    -- ACHIEVEMENTS
    achievements_earned INTEGER DEFAULT 0,
    certificates_earned INTEGER DEFAULT 0,

    -- TIME TRACKING
    total_time_spent JSONB DEFAULT '{}'::JSONB,
    weekly_time_spent JSONB DEFAULT '{}'::JSONB,
    sessions_count INTEGER DEFAULT 0,

    -- LEADERBOARD
    weekly_xp INTEGER DEFAULT 0,
    monthly_xp INTEGER DEFAULT 0,
    weekly_exercises INTEGER DEFAULT 0,
    global_rank_position INTEGER,
    class_rank_position INTEGER,
    school_rank_position INTEGER,

    -- TIMESTAMPS
    last_activity_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- METADATA
    metadata JSONB DEFAULT '{}'::JSONB,

    -- CONSTRAINTS
    CONSTRAINT uq_user_stats_user UNIQUE (user_id),
    CHECK (ml_coins >= 0),
    CHECK (level >= 1)
);

-- ÍNDICES
CREATE INDEX idx_user_stats_user ON user_stats(user_id);
CREATE INDEX idx_user_stats_tenant ON user_stats(tenant_id);
CREATE INDEX idx_user_stats_level ON user_stats(level DESC);
CREATE INDEX idx_user_stats_xp ON user_stats(total_xp DESC);
CREATE INDEX idx_user_stats_coins ON user_stats(ml_coins DESC);
CREATE INDEX idx_user_stats_global_rank ON user_stats(global_rank_position);
```

---

## ⚙️ Función Trigger

### `gamilit.update_user_stats_on_exercise_complete()`

**Archivo:** `apps/database/ddl/schemas/gamilit/functions/14-update_user_stats_on_exercise_complete.sql`

**Código Completo:**

```sql
CREATE OR REPLACE FUNCTION gamilit.update_user_stats_on_exercise_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_is_correct BOOLEAN;
    v_xp_earned INTEGER;
    v_coins_earned INTEGER;
BEGIN
    -- Determinar si el ejercicio fue completado correctamente
    v_is_correct := (NEW.is_correct = true OR NEW.score >= 60);

    -- Calcular XP y monedas ganadas
    IF v_is_correct THEN
        v_xp_earned := COALESCE(NEW.xp_earned, 10);
        v_coins_earned := COALESCE(NEW.ml_coins_earned, 5);
    ELSE
        v_xp_earned := 0;
        v_coins_earned := 0;
    END IF;

    -- Actualizar estadísticas del usuario
    UPDATE gamification_system.user_stats
    SET
        exercises_completed = exercises_completed + 1,
        total_xp = total_xp + v_xp_earned,
        ml_coins = ml_coins + v_coins_earned,
        ml_coins_earned_total = ml_coins_earned_total + v_coins_earned,
        last_activity_at = gamilit.now_mexico(),
        updated_at = gamilit.now_mexico()
    WHERE user_id = NEW.user_id;

    -- Si no existe el registro de estadísticas, crearlo
    IF NOT FOUND THEN
        INSERT INTO gamification_system.user_stats (
            user_id,
            tenant_id,
            exercises_completed,
            total_xp,
            ml_coins,
            ml_coins_earned_total,
            last_activity_at
        ) VALUES (
            NEW.user_id,
            '00000000-0000-0000-0000-000000000000'::UUID,
            1,
            v_xp_earned,
            100 + v_coins_earned, -- Balance inicial de 100
            v_coins_earned,
            gamilit.now_mexico()
        );
    END IF;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error al actualizar estadísticas de usuario %: %', NEW.user_id, SQLERRM;
        RETURN NEW;
END;
$$;
```

**Puntos Clave:**
1. ✅ Usa `NEW.ml_coins_earned` (NO `coins_earned`)
2. ✅ Actualiza `ml_coins` (NO `ml_coins_balance`)
3. ✅ Trackea total ganado en `ml_coins_earned_total`
4. ✅ Balance inicial de 100 ML Coins al crear user
5. ✅ UPSERT pattern (UPDATE + INSERT si no existe)
6. ✅ Exception handler para no bloquear inserts

---

### `gamilit.update_user_stats_on_submission_graded()` (v2.8.0)

**Archivo:** `apps/database/ddl/schemas/gamilit/functions/27-update_user_stats_on_submission_graded.sql`

**Propósito:** Actualiza estadísticas de usuario cuando una submission es calificada (complementa función 14 para el flujo de submissions)

**Código Completo:**

```sql
CREATE OR REPLACE FUNCTION gamilit.update_user_stats_on_submission_graded()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Validar que solo procesemos calificaciones nuevas
    IF NEW.status NOT IN ('graded', 'reviewed') THEN
        RETURN NEW;
    END IF;

    IF NEW.is_correct IS NOT TRUE THEN
        RETURN NEW;
    END IF;

    IF NEW.xp_earned <= 0 THEN
        RETURN NEW;
    END IF;

    -- Evitar re-disparos cuando el status o is_correct no cambiaron
    IF OLD.status IS NOT DISTINCT FROM NEW.status
       AND OLD.is_correct IS NOT DISTINCT FROM NEW.is_correct THEN
        RETURN NEW;
    END IF;

    -- Actualizar estadísticas del usuario (patrón UPSERT)
    UPDATE gamification_system.user_stats
    SET
        exercises_completed = exercises_completed + 1,
        total_xp = total_xp + NEW.xp_earned,
        ml_coins = ml_coins + NEW.ml_coins_earned,
        ml_coins_earned_total = ml_coins_earned_total + NEW.ml_coins_earned,
        last_activity_at = gamilit.now_mexico(),
        updated_at = gamilit.now_mexico()
    WHERE user_id = NEW.user_id;

    -- Si no existe el registro de estadísticas, crearlo
    IF NOT FOUND THEN
        INSERT INTO gamification_system.user_stats (
            user_id, tenant_id, exercises_completed,
            total_xp, ml_coins, ml_coins_earned_total, last_activity_at
        ) VALUES (
            NEW.user_id,
            '00000000-0000-0000-0000-000000000000'::UUID,
            1, NEW.xp_earned, 100 + NEW.ml_coins_earned,
            NEW.ml_coins_earned, gamilit.now_mexico()
        );
    END IF;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error al actualizar estadísticas de usuario % desde submission %: %',
            NEW.user_id, NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;
```

**Diferencias con Función 14 (exercise_attempts):**

| Aspecto | Función 14 (attempts) | Función 27 (submissions) |
|---------|----------------------|--------------------------|
| Evento | AFTER INSERT | AFTER UPDATE |
| Tabla | exercise_attempts | exercise_submissions |
| Validación | is_correct OR score>=60 | status IN ('graded','reviewed') AND is_correct |
| Anti-refire | No necesario (INSERT) | Valida cambio en status/is_correct |

**Cadena de Triggers:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Teacher califica submission (UPDATE exercise_submissions)       │
│   status = 'graded', is_correct = true, xp_earned = 200         │
└────────────────────────────────┬────────────────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ trg_update_user_stats_on_submission (AFTER UPDATE)              │
│   WHEN: status IN ('graded','reviewed') AND is_correct = true  │
└────────────────────────────────┬────────────────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ update_user_stats_on_submission_graded()                        │
│   UPDATE user_stats SET total_xp = total_xp + 200               │
└────────────────────────────────┬────────────────────────────────┘
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ trg_update_missions_on_earn_xp (AFTER UPDATE on user_stats)     │
│   WHEN: NEW.total_xp != OLD.total_xp                            │
│   → Actualiza misiones earn_xp automáticamente                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Queries de Verificación

### Ver Attempts de un Usuario

```sql
SELECT
    id,
    exercise_id,
    score,
    is_correct,
    xp_earned,
    ml_coins_earned,
    hints_used,
    created_at
FROM progress_tracking.exercise_attempts
WHERE user_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
ORDER BY created_at DESC
LIMIT 10;
```

### Ver Stats Actualizados

```sql
SELECT
    user_id,
    level,
    total_xp,
    ml_coins,
    ml_coins_earned_total,
    exercises_completed,
    last_activity_at
FROM gamification_system.user_stats
WHERE user_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';
```

### Ver Submissions de un Usuario

```sql
SELECT
    id,
    exercise_id,
    status,
    submitted_at,
    graded_at
FROM progress_tracking.exercise_submissions
WHERE user_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
ORDER BY created_at DESC;
```

---

## 📊 Relaciones Entre Tablas

```
auth.users (1)
    │
    ├──▶ exercise_submissions (N)
    │        │
    │        └──▶ exercise_attempts (N)
    │                 │
    │                 └──▶ TRIGGER ──▶ user_stats (1)
    │
    └──▶ user_stats (1)
```

**Cardinalidades:**
- 1 User → N Submissions
- 1 Submission → N Attempts (reintent os permitidos)
- 1 User → 1 User Stats (UNIQUE)
- 1 Attempt → 1 Trigger Execution → 1 Stats Update

---

**Última actualización:** 2025-11-29
**Autor:** Sistema Gamilit
**Versión:** 2.8.0
