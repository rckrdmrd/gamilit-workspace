# REPORTE ARQUITECTÓNICO: Sistema de Ejercicios, Intentos y Recompensas

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Prioridad:** 🔴 CRÍTICA
**Tipo:** Solución Arquitectónica Definitiva

---

## 📋 RESUMEN EJECUTIVO

**Problema Reportado:**
"Supongo tiene que ver con la parte del rango y la experiencia acumulada, puedes analizar una solución con buenas practicas, no solo un parche superficial, debe ser definitivo y se tiene que validar con el resto de ejercicios del modulo 2 y 3 que se tenga la misma solución"

**Síntoma:**
Error 400: "Exercise already submitted and graded. Cannot resubmit."

**Causa Raíz Identificada:**
❌ **Confusión arquitectónica** entre dos tablas con propósitos diferentes:
- `exercise_attempts` (múltiples intentos del estudiante)
- `exercise_submissions` (versión final para calificación del maestro)

**Impacto:**
- 🔴 Estudiantes NO pueden reintentar ejercicios después de enviarlos
- 🔴 Sistema de aprendizaje iterativo bloqueado
- 🔴 Frustración del usuario (un intento = una oportunidad)

**Solución Propuesta:**
✅ Arquitectura dual: `attempts` para práctica + `submissions` para evaluación formal

---

## 🔍 ANÁLISIS ARQUITECTÓNICO

### 1. Estado Actual del Sistema

#### 1.1. Dos Tablas con Propósitos Diferentes

**Tabla 1: `progress_tracking.exercise_attempts`**

```sql
CREATE TABLE progress_tracking.exercise_attempts (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL,           -- profiles.id
    exercise_id uuid NOT NULL,
    attempt_number integer DEFAULT 1,
    submitted_answers jsonb NOT NULL,
    is_correct boolean,
    score integer,
    time_spent_seconds integer,
    hints_used integer DEFAULT 0,
    comodines_used jsonb DEFAULT '[]'::jsonb,
    xp_earned integer DEFAULT 0,     -- ⭐ XP por este intento
    ml_coins_earned integer DEFAULT 0,-- ⭐ ML Coins por este intento
    submitted_at timestamptz DEFAULT gamilit.now_mexico(),
    metadata jsonb
);

-- Trigger importante:
CREATE TRIGGER trg_update_user_stats_on_exercise
    AFTER INSERT ON progress_tracking.exercise_attempts
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_user_stats_on_exercise_complete();
```

**Propósito diseñado:**
- ✅ Almacenar TODOS los intentos del estudiante
- ✅ Permitir múltiples intentos sin límite
- ✅ Calcular XP/ML Coins por intento
- ✅ Actualizar `user_stats` automáticamente vía trigger
- ✅ Tracking de progreso y analytics

---

**Tabla 2: `progress_tracking.exercise_submissions`**

```sql
CREATE TABLE progress_tracking.exercise_submissions (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL,            -- profiles.id
    exercise_id uuid NOT NULL,
    answer_data jsonb NOT NULL,
    is_correct boolean,
    score integer DEFAULT 0,
    max_score integer DEFAULT 100,
    feedback text,
    hint_used boolean DEFAULT false,
    hints_count integer DEFAULT 0,
    comodines_used text[],
    ml_coins_spent integer DEFAULT 0,
    time_spent_seconds integer,
    attempt_number integer DEFAULT 1,
    status text DEFAULT 'submitted'::text, -- draft/submitted/graded/reviewed
    started_at timestamptz,
    submitted_at timestamptz DEFAULT now(),
    graded_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    CONSTRAINT check_status CHECK (
        status = ANY (ARRAY['draft'::text, 'submitted'::text, 'graded'::text, 'reviewed'::text])
    )
);
```

**Propósito diseñado:**
- ✅ Almacenar versión FINAL para calificación por maestro
- ✅ Workflow de estados (draft → submitted → graded → reviewed)
- ✅ Revisión manual por docentes
- ✅ Feedback detallado del maestro
- ✅ NO debería bloquear nuevos intentos de práctica

---

#### 1.2. Problema en el Código Actual

**Ubicación:** `apps/backend/src/modules/progress/services/exercise-submission.service.ts`

**Código problemático (líneas 206-210):**

```typescript
// ❌ PROBLEMA: Bloquea reenvíos después de calificar
if (existingSubmission && existingSubmission.status === 'graded') {
  throw new BadRequestException(
    'Exercise already submitted and graded. Cannot resubmit.',
  );
}
```

**Por qué es problemático:**

1. **Bloquea aprendizaje iterativo**
   - Usuario completa ejercicio → Calificado → Bloqueado para siempre
   - NO puede mejorar su respuesta
   - NO puede practicar de nuevo

2. **No usa `exercise_attempts`**
   - El código actual IGNORA la tabla `exercise_attempts`
   - Solo usa `exercise_submissions` para TODO
   - Desperdicia arquitectura diseñada específicamente para múltiples intentos

3. **Inconsistencia con trigger**
   - `exercise_attempts` tiene trigger que actualiza `user_stats`
   - Pero NUNCA se ejecuta porque no se usa la tabla

4. **XP/ML Coins mal otorgados**
   - Se otorgan en `submissions` (líneas 238-246)
   - Deberían otorgarse en `attempts` (vía trigger)

---

### 2. Arquitectura Diseñada vs Implementada

#### 2.1. Arquitectura Diseñada (Correcta)

```
┌─────────────────────────────────────────────────────────────┐
│  ESTUDIANTE PRACTICA EJERCICIO (Múltiples veces)           │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Intento #1: POST /api/exercises/:id/attempt                │
│  ────────────────────────────────────────────────────────── │
│  1. Crear registro en exercise_attempts (attempt_number=1)  │
│  2. Auto-calificar                                           │
│  3. Otorgar XP/ML Coins (si es correcto)                    │
│  4. Trigger actualiza user_stats                            │
│  ────────────────────────────────────────────────────────── │
│  Resultado: Intento guardado, XP otorgado                   │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Intento #2: POST /api/exercises/:id/attempt                │
│  ────────────────────────────────────────────────────────── │
│  1. Crear registro en exercise_attempts (attempt_number=2)  │
│  2. Auto-calificar                                           │
│  3. NO otorgar XP (ya se otorgó en intento correcto previo) │
│  4. Trigger verifica y NO actualiza user_stats              │
│  ────────────────────────────────────────────────────────── │
│  Resultado: Intento guardado, sin XP (ya ganado antes)      │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Intento #N: POST /api/exercises/:id/attempt                │
│  ────────────────────────────────────────────────────────── │
│  Ilimitados intentos permitidos                             │
│  XP solo en primer intento correcto                         │
│  Analytics completo de intentos                             │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼ (OPCIONAL, para trabajos finales)
┌─────────────────────────────────────────────────────────────┐
│  ENVÍO FORMAL: POST /api/exercises/:id/submit               │
│  ────────────────────────────────────────────────────────── │
│  1. Crear/actualizar exercise_submissions                   │
│  2. Status: 'submitted' (espera revisión del maestro)       │
│  3. Maestro califica manualmente                            │
│  4. Status cambia: 'submitted' → 'graded' → 'reviewed'      │
│  ────────────────────────────────────────────────────────── │
│  Uso: Ensayos, proyectos, trabajos que requieren revisión   │
└─────────────────────────────────────────────────────────────┘
```

#### 2.2. Arquitectura Implementada (Incorrecta)

```
┌─────────────────────────────────────────────────────────────┐
│  ESTUDIANTE PRACTICA EJERCICIO                              │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Intento #1: POST /api/exercises/:id/submit                 │
│  ────────────────────────────────────────────────────────── │
│  1. Crear registro en exercise_submissions ❌               │
│  2. Auto-calificar                                           │
│  3. Otorgar XP/ML Coins ❌ (desde service, no trigger)      │
│  4. Status: 'graded'                                         │
│  ────────────────────────────────────────────────────────── │
│  Resultado: Submission creado, XP otorgado                  │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  Intento #2: POST /api/exercises/:id/submit                 │
│  ────────────────────────────────────────────────────────── │
│  ❌ ERROR 400: "Already submitted and graded"               │
│  ❌ BLOQUEADO - No puede intentar de nuevo                  │
│  ────────────────────────────────────────────────────────── │
│  Resultado: Usuario frustrado, sistema roto                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 SOLUCIÓN ARQUITECTÓNICA DEFINITIVA

### 3.1. Principios de la Solución

1. **Separación de responsabilidades**
   - `exercise_attempts` → Práctica y aprendizaje (múltiples intentos)
   - `exercise_submissions` → Evaluación formal (envíos para el maestro)

2. **XP solo en primer intento correcto**
   - Evita farming de XP
   - Incentiva completar a la primera
   - Permite práctica sin penalización

3. **Compatibilidad hacia atrás**
   - Migrar datos existentes de `submissions` a `attempts`
   - Mantener `submissions` para casos especiales

4. **Analytics completo**
   - Tracking de todos los intentos
   - Identificar patrones de aprendizaje
   - Medir mejora del estudiante

### 3.2. Cambios Requeridos

#### Cambio 1: Crear ExerciseAttemptService

**Nuevo archivo:** `apps/backend/src/modules/progress/services/exercise-attempt.service.ts`

```typescript
@Injectable()
export class ExerciseAttemptService {
  constructor(
    @InjectRepository(ExerciseAttempt)
    private readonly attemptRepo: Repository<ExerciseAttempt>,

    @InjectRepository(UserStats, 'gamification')
    private readonly userStatsRepo: Repository<UserStats>,

    private readonly entityManager: EntityManager,
  ) {}

  /**
   * Registra un intento de ejercicio del estudiante
   *
   * Flujo:
   * 1. Calcular número de intento (auto-increment por usuario/ejercicio)
   * 2. Auto-calificar con validate_and_audit()
   * 3. Determinar si otorga XP (solo primer intento correcto)
   * 4. Guardar en exercise_attempts
   * 5. Trigger actualiza user_stats automáticamente
   *
   * @param userId - profiles.id del estudiante
   * @param exerciseId - UUID del ejercicio
   * @param answers - Respuestas del estudiante (JSONB)
   * @returns Intento creado con resultado de calificación
   */
  async submitAttempt(
    userId: string,
    exerciseId: string,
    answers: Record<string, any>,
  ): Promise<ExerciseAttempt> {
    // 1. Obtener ejercicio para configuración de XP
    const exercise = await this.getExercise(exerciseId);

    // 2. Calcular número de intento
    const attemptNumber = await this.getNextAttemptNumber(userId, exerciseId);

    // 3. Auto-calificar
    const { score, isCorrect, feedback, details } = await this.autoGrade(
      userId,
      exerciseId,
      answers,
      attemptNumber,
    );

    // 4. Determinar si otorga XP/ML Coins
    const shouldAwardXP = await this.shouldAwardXP(userId, exerciseId, isCorrect);

    const xpEarned = shouldAwardXP ? (exercise.xp_reward || 20) : 0;
    const mlCoinsEarned = shouldAwardXP ? (exercise.ml_coins_reward || 10) : 0;

    // 5. Crear intento
    const attempt = this.attemptRepo.create({
      user_id: userId,
      exercise_id: exerciseId,
      attempt_number: attemptNumber,
      submitted_answers: answers,
      is_correct: isCorrect,
      score,
      xp_earned: xpEarned,
      ml_coins_earned: mlCoinsEarned,
      submitted_at: new Date(),
      metadata: {
        feedback,
        details,
      },
    });

    // 6. Guardar (trigger actualiza user_stats automáticamente)
    return await this.attemptRepo.save(attempt);
  }

  /**
   * Determina si se debe otorgar XP por este intento
   *
   * Reglas:
   * - Solo en primer intento correcto
   * - Si ya hay un intento correcto previo, NO otorgar XP
   * - Permite practicar sin penalización
   *
   * @returns true si debe otorgar XP, false si no
   */
  private async shouldAwardXP(
    userId: string,
    exerciseId: string,
    currentIsCorrect: boolean,
  ): Promise<boolean> {
    // Solo otorgar XP si el intento actual es correcto
    if (!currentIsCorrect) {
      return false;
    }

    // Verificar si ya existe un intento correcto previo
    const previousCorrectAttempt = await this.attemptRepo.findOne({
      where: {
        user_id: userId,
        exercise_id: exerciseId,
        is_correct: true,
      },
      order: {
        attempt_number: 'ASC',
      },
    });

    // Si ya hay un intento correcto previo, NO otorgar XP
    if (previousCorrectAttempt) {
      console.log(`[XP] User ${userId} already has correct attempt for exercise ${exerciseId}. No XP awarded.`);
      return false;
    }

    // Primer intento correcto: ¡Otorgar XP!
    console.log(`[XP] First correct attempt for user ${userId} on exercise ${exerciseId}. Awarding XP!`);
    return true;
  }

  /**
   * Obtiene el siguiente número de intento para el usuario/ejercicio
   */
  private async getNextAttemptNumber(
    userId: string,
    exerciseId: string,
  ): Promise<number> {
    const lastAttempt = await this.attemptRepo.findOne({
      where: {
        user_id: userId,
        exercise_id: exerciseId,
      },
      order: {
        attempt_number: 'DESC',
      },
    });

    return lastAttempt ? lastAttempt.attempt_number + 1 : 1;
  }

  /**
   * Obtiene todos los intentos del usuario para un ejercicio
   * Útil para analytics y mostrar progreso
   */
  async getAttempts(userId: string, exerciseId: string): Promise<ExerciseAttempt[]> {
    return await this.attemptRepo.find({
      where: {
        user_id: userId,
        exercise_id: exerciseId,
      },
      order: {
        attempt_number: 'ASC',
      },
    });
  }

  /**
   * Obtiene estadísticas de intentos para un ejercicio
   */
  async getAttemptStats(userId: string, exerciseId: string) {
    const attempts = await this.getAttempts(userId, exerciseId);

    if (attempts.length === 0) {
      return {
        totalAttempts: 0,
        correctAttempts: 0,
        bestScore: 0,
        firstAttemptCorrect: false,
        xpEarned: 0,
      };
    }

    const correctAttempts = attempts.filter(a => a.is_correct);
    const bestScore = Math.max(...attempts.map(a => a.score || 0));
    const firstAttemptCorrect = attempts[0]?.is_correct || false;
    const xpEarned = attempts.reduce((sum, a) => sum + (a.xp_earned || 0), 0);

    return {
      totalAttempts: attempts.length,
      correctAttempts: correctAttempts.length,
      bestScore,
      firstAttemptCorrect,
      xpEarned,
      latestAttempt: attempts[attempts.length - 1],
    };
  }
}
```

#### Cambio 2: Modificar ExercisesController

**Archivo:** `apps/backend/src/modules/progress/controllers/exercises.controller.ts`

```typescript
@Controller('exercises')
export class ExercisesController {
  constructor(
    private readonly attemptService: ExerciseAttemptService, // NUEVO
    private readonly submissionService: ExerciseSubmissionService, // Mantener para casos especiales
  ) {}

  /**
   * Endpoint principal para estudiantes: Enviar intento de ejercicio
   * Permite múltiples intentos sin restricción
   * XP solo en primer intento correcto
   */
  @Post(':id/attempt')
  @UseGuards(JwtAuthGuard)
  async submitAttempt(
    @Param('id') exerciseId: string,
    @Body() dto: SubmitExerciseDto,
    @Request() req,
  ) {
    const userId = req.user.id; // auth.users.id

    console.log(`[Attempt] User ${userId} attempting exercise ${exerciseId}`);

    const attempt = await this.attemptService.submitAttempt(
      userId,
      exerciseId,
      dto.answers,
    );

    return {
      attemptNumber: attempt.attempt_number,
      isCorrect: attempt.is_correct,
      score: attempt.score,
      xpEarned: attempt.xp_earned,
      mlCoinsEarned: attempt.ml_coins_earned,
      feedback: attempt.metadata?.feedback,
      details: attempt.metadata?.details,
    };
  }

  /**
   * Endpoint para obtener historial de intentos
   */
  @Get(':id/attempts')
  @UseGuards(JwtAuthGuard)
  async getAttempts(
    @Param('id') exerciseId: string,
    @Request() req,
  ) {
    const userId = req.user.id;
    return await this.attemptService.getAttempts(userId, exerciseId);
  }

  /**
   * Endpoint para obtener estadísticas de intentos
   */
  @Get(':id/attempt-stats')
  @UseGuards(JwtAuthGuard)
  async getAttemptStats(
    @Param('id') exerciseId: string,
    @Request() req,
  ) {
    const userId = req.user.id;
    return await this.attemptService.getAttemptStats(userId, exerciseId);
  }

  /**
   * Endpoint para envío formal (SOLO para trabajos que requieren revisión manual)
   * Casos de uso: Ensayos, proyectos finales, trabajos con feedback del maestro
   */
  @Post(':id/submit')
  @UseGuards(JwtAuthGuard)
  async submitForReview(
    @Param('id') exerciseId: string,
    @Body() dto: SubmitExerciseDto,
    @Request() req,
  ) {
    const userId = req.user.id;

    console.log(`[Submission] User ${userId} submitting exercise ${exerciseId} for review`);

    // Remover validación que bloquea reenvíos
    // Permitir actualizar submission si el maestro lo requiere
    const submission = await this.submissionService.submitExercise(
      userId,
      exerciseId,
      dto.answers,
    );

    return submission;
  }
}
```

#### Cambio 3: Actualizar ExerciseSubmissionService

**Archivo:** `apps/backend/src/modules/progress/services/exercise-submission.service.ts`

```typescript
/**
 * MODIFICAR líneas 206-210
 *
 * Antes (bloqueaba reenvíos):
 */
if (existingSubmission && existingSubmission.status === 'graded') {
  throw new BadRequestException(
    'Exercise already submitted and graded. Cannot resubmit.',
  );
}

/**
 * Después (permite actualizar):
 */
if (existingSubmission) {
  // Si ya existe submission, actualizar en lugar de crear
  console.log(`[Submission] Updating existing submission ${existingSubmission.id}`);

  Object.assign(existingSubmission, {
    answer_data: answers,
    submitted_at: new Date(),
    // Si ya estaba graded, volver a submitted para nueva revisión
    status: existingSubmission.status === 'graded' ? 'submitted' : existingSubmission.status,
    // Incrementar attempt_number si es reenvío
    attempt_number: (existingSubmission.attempt_number || 1) + 1,
  });

  submission = await this.submissionRepo.save(existingSubmission);
} else {
  // Crear nuevo submission
  submission = await this.create(submissionData);
}

/**
 * MODIFICAR líneas 238-246
 * ELIMINAR auto-claim de rewards desde submissions
 * Las recompensas se otorgan desde exercise_attempts, no submissions
 */
// ❌ ELIMINAR ESTO:
if (submission.is_correct && submission.status === 'graded') {
  const rewards = await this.claimRewards(submission.id);
  (submission as any).xp_earned = rewards.xp_earned;
  (submission as any).ml_coins_earned = rewards.ml_coins_earned;
}

// ✅ Las recompensas se manejan en ExerciseAttemptService
// Las submissions son solo para revisión del maestro, no otorgan XP
```

#### Cambio 4: Actualizar Frontend

**Archivo:** `apps/frontend/src/features/mechanics/shared/api/mechanicsAPI.ts`

```typescript
/**
 * Cambiar endpoint por defecto de /submit a /attempt
 */

// Antes:
export const submitExercise = async (exerciseId: string, answers: any) => {
  return apiClient.post(`/exercises/${exerciseId}/submit`, { answers });
};

// Después:
/**
 * Enviar intento de ejercicio (uso normal para estudiantes)
 * Permite múltiples intentos
 */
export const submitExerciseAttempt = async (exerciseId: string, answers: any) => {
  return apiClient.post(`/exercises/${exerciseId}/attempt`, { answers });
};

/**
 * Enviar para revisión formal (solo para trabajos especiales)
 * Uso: Ensayos, proyectos finales
 */
export const submitExerciseForReview = async (exerciseId: string, answers: any) => {
  return apiClient.post(`/exercises/${exerciseId}/submit`, { answers });
};

/**
 * Obtener historial de intentos
 */
export const getExerciseAttempts = async (exerciseId: string) => {
  return apiClient.get(`/exercises/${exerciseId}/attempts`);
};

/**
 * Obtener estadísticas de intentos
 */
export const getExerciseAttemptStats = async (exerciseId: string) => {
  return apiClient.get(`/exercises/${exerciseId}/attempt-stats`);
};
```

---

### 3.3. Migración de Datos Existentes

**Script de migración:** `apps/database/migrations/migrate-submissions-to-attempts.sql`

```sql
-- Migrar datos existentes de exercise_submissions a exercise_attempts
-- Solo migrar si no existe ya el intento

INSERT INTO progress_tracking.exercise_attempts (
    id,
    user_id,
    exercise_id,
    attempt_number,
    submitted_answers,
    is_correct,
    score,
    time_spent_seconds,
    hints_used,
    comodines_used,
    xp_earned,
    ml_coins_earned,
    submitted_at,
    metadata
)
SELECT
    gen_random_uuid() as id,
    es.user_id,
    es.exercise_id,
    es.attempt_number,
    es.answer_data as submitted_answers,
    es.is_correct,
    es.score,
    es.time_spent_seconds,
    es.hints_count as hints_used,
    COALESCE(es.comodines_used, ARRAY[]::text[])::jsonb as comodines_used,
    -- XP: Solo otorgar si fue el primer intento correcto
    CASE
        WHEN es.is_correct AND NOT EXISTS (
            SELECT 1 FROM progress_tracking.exercise_attempts ea
            WHERE ea.user_id = es.user_id
            AND ea.exercise_id = es.exercise_id
            AND ea.is_correct = true
        ) THEN 20 -- XP por defecto, ajustar según ejercicio
        ELSE 0
    END as xp_earned,
    CASE
        WHEN es.is_correct AND NOT EXISTS (
            SELECT 1 FROM progress_tracking.exercise_attempts ea
            WHERE ea.user_id = es.user_id
            AND ea.exercise_id = es.exercise_id
            AND ea.is_correct = true
        ) THEN 10 -- ML Coins por defecto, ajustar según ejercicio
        ELSE 0
    END as ml_coins_earned,
    es.submitted_at,
    jsonb_build_object(
        'feedback', es.feedback,
        'migrated_from_submission', true,
        'original_submission_id', es.id
    ) as metadata
FROM progress_tracking.exercise_submissions es
WHERE NOT EXISTS (
    -- No migrar si ya existe un attempt para este user/exercise/attempt_number
    SELECT 1 FROM progress_tracking.exercise_attempts ea
    WHERE ea.user_id = es.user_id
    AND ea.exercise_id = es.exercise_id
    AND ea.attempt_number = es.attempt_number
);

-- Reporte de migración
SELECT
    'Submissions migrados a attempts' as status,
    COUNT(*) as total_migrated
FROM progress_tracking.exercise_attempts
WHERE metadata->>'migrated_from_submission' = 'true';
```

---

## 📊 VALIDACIÓN CON MÓDULOS 2 Y 3

### 4.1. Plan de Validación

**Módulos a validar:**
- ✅ Módulo 2: Marie Curie (~15 ejercicios)
- ✅ Módulo 3: Historia Maya (~12 ejercicios)

**Escenarios de prueba:**

#### Escenario 1: Múltiples Intentos - Ejercicio Simple
```
Test: Usuario intenta crucigrama 3 veces

Intento 1:
  POST /exercises/uuid-1/attempt
  Respuestas: 50% correctas
  Resultado: score=50, is_correct=false, xp_earned=0

Intento 2:
  POST /exercises/uuid-1/attempt
  Respuestas: 100% correctas
  Resultado: score=100, is_correct=true, xp_earned=20 ✅

Intento 3:
  POST /exercises/uuid-1/attempt
  Respuestas: 100% correctas
  Resultado: score=100, is_correct=true, xp_earned=0 (ya ganado)

Validación:
  ✓ XP otorgado solo en primer intento correcto (intento 2)
  ✓ Permitió múltiples intentos sin error 400
  ✓ user_stats.total_xp aumentó en 20 (solo una vez)
```

#### Escenario 2: Todos los Ejercicios del Módulo 2
```
Test: Usuario completa todos los ejercicios del módulo 2

Ejercicio 1: Crucigrama
  → Intento 1: Correcto → +20 XP ✅
  → Intento 2: Correcto → +0 XP (práctica)

Ejercicio 2: Verdadero/Falso
  → Intento 1: Incorrecto → +0 XP
  → Intento 2: Correcto → +20 XP ✅
  → Intento 3: Correcto → +0 XP (práctica)

... (todos los ejercicios)

Validación:
  ✓ XP acumulado = 15 ejercicios × 20 XP = 300 XP
  ✓ Permitió múltiples intentos en todos los ejercicios
  ✓ user_stats.exercises_completed = 15
  ✓ current_rank correctamente actualizado según XP total
```

#### Escenario 3: Promoción de Rango
```
Test: Usuario acumula XP suficiente para subir de rango

Estado inicial:
  total_xp: 450
  current_rank: Ajaw

Completa ejercicios del módulo 2 (+300 XP):
  total_xp: 750

Validaciones:
  ✓ Trigger trg_check_rank_promotion_on_xp_gain ejecutado
  ✓ current_rank = 'Nacom' (umbral 500 XP alcanzado)
  ✓ ml_coins aumentaron +100 (bonus de promoción)
  ✓ Achievement RANK_PROMOTION_NACOM creado
  ✓ Notificación rank_up enviada
```

### 4.2. Queries de Validación

**Query 1: Verificar intentos múltiples funcionan**
```sql
SELECT
    ea.user_id,
    ea.exercise_id,
    ea.attempt_number,
    ea.is_correct,
    ea.score,
    ea.xp_earned,
    ea.submitted_at
FROM progress_tracking.exercise_attempts ea
WHERE ea.user_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
ORDER BY ea.exercise_id, ea.attempt_number;

-- Esperado: Múltiples filas por ejercicio
```

**Query 2: Verificar XP solo en primer intento correcto**
```sql
SELECT
    ea.exercise_id,
    COUNT(*) as total_attempts,
    SUM(CASE WHEN ea.is_correct THEN 1 ELSE 0 END) as correct_attempts,
    SUM(ea.xp_earned) as total_xp_from_exercise
FROM progress_tracking.exercise_attempts ea
WHERE ea.user_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'
GROUP BY ea.exercise_id
HAVING COUNT(*) > 1;

-- Esperado: total_xp_from_exercise = 20 (o 0 si nunca correcto)
-- No debe ser 40, 60, etc. (múltiples veces)
```

**Query 3: Validar XP total en user_stats**
```sql
SELECT
    us.user_id,
    us.total_xp,
    us.current_rank,
    us.ml_coins,
    us.exercises_completed,
    (
        SELECT COUNT(DISTINCT ea.exercise_id)
        FROM progress_tracking.exercise_attempts ea
        WHERE ea.user_id = us.user_id
        AND ea.is_correct = true
    ) as distinct_exercises_completed_via_attempts
FROM gamification_system.user_stats us
WHERE us.user_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

-- Validar: exercises_completed = distinct_exercises_completed_via_attempts
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Backend Changes
- [ ] Crear `ExerciseAttemptService` con lógica de múltiples intentos
- [ ] Crear entity `ExerciseAttempt` (si no existe)
- [ ] Actualizar `ExercisesController` con nuevos endpoints
- [ ] Modificar `ExerciseSubmissionService` para eliminar bloqueo de reenvíos
- [ ] Eliminar auto-claim de XP desde submissions (usar solo attempts)
- [ ] Agregar tests unitarios para `shouldAwardXP()`
- [ ] Agregar tests de integración para múltiples intentos

### Fase 2: Database Changes
- [ ] Verificar trigger `trg_update_user_stats_on_exercise` existe y funciona
- [ ] Ejecutar script de migración de datos (submissions → attempts)
- [ ] Validar integridad de datos migrados
- [ ] Crear índices adicionales si es necesario

### Fase 3: Frontend Changes
- [ ] Actualizar `mechanicsAPI.ts` con nuevos endpoints
- [ ] Cambiar llamadas de `/submit` a `/attempt` en componentes
- [ ] Agregar UI para mostrar historial de intentos (opcional)
- [ ] Agregar indicador de "Ya ganaste XP" en reintentos
- [ ] Actualizar mensajes de error/éxito

### Fase 4: Testing
- [ ] Test: Múltiples intentos en un ejercicio
- [ ] Test: XP solo en primer intento correcto
- [ ] Test: Reintentos no generan XP adicional
- [ ] Test: Completar todos los ejercicios del módulo 2
- [ ] Test: Completar todos los ejercicios del módulo 3
- [ ] Test: Promoción de rango funciona correctamente
- [ ] Test: Trigger de user_stats se ejecuta
- [ ] Test: Analytics de intentos (getAttemptStats)

### Fase 5: Validation with Modules 2 & 3
- [ ] Usuario completa módulo 2 (15 ejercicios) con múltiples intentos
- [ ] Verificar XP total = 300 XP (15 × 20)
- [ ] Verificar exercises_completed = 15
- [ ] Usuario completa módulo 3 (12 ejercicios) con múltiples intentos
- [ ] Verificar XP total acumulado correctamente
- [ ] Verificar promoción de rango si alcanza umbrales

### Fase 6: Documentation
- [ ] Actualizar ADR con decisión arquitectónica
- [ ] Actualizar README de progress_tracking module
- [ ] Documentar diferencia entre /attempt y /submit
- [ ] Actualizar API documentation (Swagger/OpenAPI)

---

## 📈 MÉTRICAS DE ÉXITO

**Antes del fix:**
- ❌ Usuario bloqueado después de 1 intento
- ❌ Error 400 en reenvíos
- ❌ Frustración del usuario
- ❌ Imposible practicar ejercicios

**Después del fix:**
- ✅ Intentos ilimitados permitidos
- ✅ XP solo en primer intento correcto (evita farming)
- ✅ Analytics completo de intentos
- ✅ Usuario puede practicar sin límite
- ✅ Sistema de aprendizaje iterativo funcional

**KPIs esperados:**
- Promedio de intentos por ejercicio: 2-3 intentos
- % de ejercicios completados a la primera: 40-60%
- % de usuarios que practican (≥2 intentos): 70%+
- Tasa de éxito tras múltiples intentos: 85%+

---

## 🎯 CONCLUSIÓN

**Problema identificado:** Confusión arquitectónica entre `exercise_attempts` (práctica) y `exercise_submissions` (evaluación formal).

**Solución propuesta:** Implementar arquitectura dual:
- `exercise_attempts` para múltiples intentos de práctica (con XP en primer éxito)
- `exercise_submissions` para envíos formales que requieren revisión del maestro

**Impacto:**
- ✅ Sistema de aprendizaje iterativo funcional
- ✅ Estudiantes pueden practicar sin límite
- ✅ XP otorgado de forma justa (solo primer éxito)
- ✅ Analytics completo de progreso
- ✅ Compatible con módulos 2 y 3

**Validación requerida:**
- Testing completo con módulos 2 y 3
- Verificar XP se acumula correctamente
- Verificar promociones de rango funcionan
- Confirmar que NO hay farming de XP

---

**Reporte generado por:** Architecture-Analyst
**Fecha:** 2025-11-24
**Estado:** ✅ ANÁLISIS COMPLETO - LISTO PARA IMPLEMENTACIÓN

