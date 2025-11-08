# Trazabilidad: Educational Mechanics

**Metadata RFC-0001**
- **Tipo:** Especificacion Tecnica - Trazabilidad Modular
- **Categoria:** Educational Content, Exercise Management
- **Version:** 2.0
- **Fecha:** Octubre 2025
- **Stack:** PostgreSQL 16 → Node.js/TypeScript → React/TypeScript
- **Autor:** Sistema GAMILIT
- **Estado:** Activo

---

## Vision General

Este modulo documenta la trazabilidad completa del flujo de envio y evaluacion de ejercicios en la plataforma GAMILIT, incluyendo scoring, rewards y actualizacion de progreso.

**Alcance:** Submit Exercise, Evaluation, Progress Tracking

---

## Flujo 2: Envio de Ejercicio (Submit Exercise)

**Trigger:** Estudiante completa ejercicio y presiona "Submit"

### Frontend - Exercise Component
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

### Backend - Exercise Controller
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

### Backend - Exercise Service (Business Logic)
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

### Database Queries
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

## Tipos de Datos

### Frontend Types
```typescript
interface Submission {
  exerciseId: string;
  answers: Record<string, string>;
  timeSpent: number;
  hintsUsed: number;
  powerupsUsed: string[];
}

interface SubmissionResult {
  submissionId: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  feedback: string;
  rewards: {
    mlCoins: number;
    xp: number;
  };
  achievements: string[];
  newStats: UserStats;
}
```

### Backend Types
```typescript
interface Exercise {
  id: string;
  module_id: string;
  title: string;
  exercise_type: string;
  config: any;
  content: any;
  max_score: number;
  passing_score: number;
  xp_reward: number;
  ml_coins_reward: number;
}

interface ExerciseAttempt {
  id: string;
  user_id: string;
  exercise_id: string;
  attempt_number: number;
  submitted_answers: any;
  is_correct: boolean;
  score: number;
  time_spent_seconds: number;
  hints_used: number;
  comodines_used: string[];
  xp_earned: number;
  ml_coins_earned: number;
  submitted_at: Date;
}
```

---

## Diagrama de Flujo

```
Estudiante → CrucigramaExercise
                ↓
            exercisesAPI.submitExercise()
                ↓
         Backend Controller
                ↓
         ExercisesService
                ↓
    ┌───────────┴───────────┐
    ↓                       ↓
Evaluate Answers      Get Exercise
    ↓                       ↓
Calculate Score       Save Attempt
    ↓                       ↓
Update Progress      Add ML Coins
    ↓                       ↓
   Add XP            Check Achievements
    ↓                       ↓
Send Notification    Return Results
```

---

## Referencias

- **Documento Padre:** TRAZABILIDAD-COMPLETA.md
- **Relacionado con:** 03-economy-transactions.md, 04-gamification-progression.md
- **RFC-0001:** Governance Model GAMILIT Platform
