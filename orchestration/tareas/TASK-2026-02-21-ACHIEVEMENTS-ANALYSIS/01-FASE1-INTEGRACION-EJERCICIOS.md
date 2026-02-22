# FASE 1: Integracion Ejercicios -> Achievements

**Fecha:** 2026-02-21
**Autor:** Claude Opus 4.6
**Tipo:** ANALYSIS (solo lectura)
**Archivos analizados:** 8 archivos de codigo + 4 archivos DDL

---

## DIAGRAMA DE FLUJO

```
=======================================================================
FLUJO M1-M2 (Auto-graded via ExerciseAttemptService)
=======================================================================

Student completes exercise (M1-M2)
  |
  v
ExerciseAttemptService.submitAttempt()          [exercise-attempt.service.ts:145]
  |
  +-- calculateScore() via SQL validate_and_audit()
  |
  +-- Si is_correct:
  |     +-- calculateXpReward() / calculateCoinsReward()
  |     +-- attemptRepo.save(attempt)                     [line 185]
  |     |    |
  |     |    +-- DB TRIGGER: trg_update_user_stats_on_exercise
  |     |    |   (AFTER INSERT ON exercise_attempts)
  |     |    |   -> gamilit.update_user_stats_on_exercise_complete()
  |     |    |   -> exercises_completed++, total_xp += xp, ml_coins += coins
  |     |    |   [DDL: triggers/21, functions/14]
  |     |    |
  |     |    +-- DB TRIGGER: trg_update_missions_on_perfect_scores
  |     |         (AFTER INSERT, WHEN score=100)
  |     |         [DDL: triggers/28]
  |     |
  |     +-- awardRewards()                                [line 189]
  |     |    +-- mlCoinsService.addCoins()                (DOBLE CONTEO con trigger!)
  |     |    +-- userStatsService.addXp()                 (DOBLE CONTEO con trigger!)
  |     |    +-- updateModuleProgressAfterCompletion()
  |     |
  |     +-- achievementsService.detectAndGrantEarned()    [line 193]
  |          +-- Lee userStatsRepo (con valores DOBLE-CONTADOS)
  |          +-- findAll() (EXCLUYE is_secret=true!)
  |          +-- Para cada achievement: meetsConditions()
  |          +-- Si cumple: grantAchievement()
  |
  +-- Si !is_correct: return savedAttempt (no rewards, no achievements)

=======================================================================
FLUJO M3-M5 (Manual-graded via ExerciseSubmissionService)
=======================================================================

Student submits exercise (M3-M5)
  |
  v
ExerciseSubmissionService.submitExercise()      [exercise-submission.service.ts:214]
  |
  +-- Validates requires_manual_grading = true
  +-- Saves submission with status='submitted'
  +-- updateModuleProgressOnSubmission()         [line 366]
  +-- notifyTeacherOfSubmission()                [line 376]
  +-- RETURN (NO rewards, NO achievements yet)
  |
  ... Teacher reviews ...
  |
  v
ExerciseSubmissionService.gradeSubmission(id, { final_score, grader_id, feedback })
                                                 [exercise-submission.service.ts:415]
  |
  +-- submission.score = final_score
  +-- submission.is_correct = score >= 60%
  +-- submission.status = 'graded'
  +-- submissionRepo.save(submission)             [line 460]
  |    |
  |    +-- DB TRIGGER: trg_update_user_stats_on_submission
  |         (AFTER UPDATE, WHEN status IN ('graded','reviewed') AND is_correct)
  |         -> gamilit.update_user_stats_on_submission_graded()
  |         -> exercises_completed++, total_xp += xp, ml_coins += coins
  |         [DDL: triggers/31, functions/27]
  |         NOTA: Este trigger requiere xp_earned > 0, pero submission
  |               se guarda con xp_earned=0 ANTES de claimRewards!
  |
  +-- Si is_correct:
  |     +-- claimRewards()                        [line 468]
  |     |    +-- userStatsService.addXp()         (DOBLE CONTEO si trigger ya ejecuto)
  |     |    +-- mlCoinsService.addCoins()        (DOBLE CONTEO si trigger ya ejecuto)
  |     |    +-- updateModuleProgressAfterCompletion()
  |     |    +-- updateMissionsProgressAfterCompletion()
  |     |    +-- submission.xp_earned = xpEarned
  |     |    +-- submission.ml_coins_earned = mlCoinsEarned
  |     |    +-- submissionRepo.save(submission)
  |     |         |
  |     |         +-- DB TRIGGER: trg_update_user_stats_on_submission
  |     |              PERO: OLD.status = 'graded', NEW.status = 'graded'
  |     |              -> NO se ejecuta (status no cambio)
  |     |
  |     +-- achievementsService.detectAndGrantEarned()  [line 486]
  |          (misma logica que M1-M2)
  |
  +-- Si !is_correct: return (reward error caught silently)

=======================================================================
FLUJO M1-M2 (Auto-graded via ExerciseSubmissionService - raro)
=======================================================================

ExerciseSubmissionService.submitExercise()
  |
  +-- Validates requires_manual_grading = false -> throw BadRequestException!
      "This exercise is auto-graded and allows multiple attempts."
      (Este path BLOQUEA; M1-M2 solo usa ExerciseAttemptService)

PERO: gradeSubmission() sin manualGrade (auto-grading path):
  +-- autoGrade() via SQL validate_and_audit()
  +-- submissionRepo.save(submission)             [line 542]
  |    +-- DB TRIGGER: trg_update_user_stats_on_submission
  |         PERO: Este es AFTER UPDATE, no INSERT.
  |         Submission ya existia con status='submitted'
  |         -> SI se ejecuta (status cambio submitted->graded)
  |         -> PERO xp_earned aun es 0 en la row! (no se calcula aqui)
  |
  +-- achievementsService.detectAndGrantEarned()  [line 546]
       (Ejecuta ANTES de claimRewards en submitExercise!)
       (Evaluara condiciones con stats parcialmente actualizados)

submitExercise() continua [line 397]:
  +-- Si is_correct: claimRewards()
       (achievements ya se evaluaron ANTES de dar rewards!)
```

---

## VERIFICACION PUNTO POR PUNTO

### VP-1: UserStats actualizado ANTES de detectAndGrantEarned()

**RESULTADO: PARCIALMENTE CORRECTO - depende del flujo**

**Flujo ExerciseAttemptService (M1-M2):**
- `attemptRepo.save()` en linea 185 dispara el trigger DB `trg_update_user_stats_on_exercise` que hace `exercises_completed++` y `total_xp += xp_earned`
- LUEGO `awardRewards()` en linea 189 llama `userStatsService.addXp()` que TAMBIEN incrementa `total_xp` (DOBLE CONTEO)
- LUEGO `detectAndGrantEarned()` en linea 193 lee userStats con valores ya doble-contados
- **Orden: DB trigger (increment) -> Backend addXp (increment OTRA VEZ) -> detectAndGrantEarned()**
- **exercises_completed: SI actualizado (por trigger DB)**
- **total_xp: DOBLE CONTADO (trigger + backend)**

**Flujo ExerciseSubmissionService (M3-M5) - Manual grading:**
- `submissionRepo.save()` en linea 460 tiene `xp_earned = 0` todavia, asi que trigger DB se ejecuta pero `IF NEW.xp_earned <= 0 THEN RETURN NEW` (linea 30 de funcion 27) -> trigger RETORNA sin actualizar
- `claimRewards()` en linea 468 llama `addXp()` que incrementa `total_xp` correctamente
- `claimRewards()` luego actualiza `submission.xp_earned` y hace `save()` -> trigger DB ve status 'graded'->'graded' sin cambio -> NO se ejecuta
- `detectAndGrantEarned()` en linea 486 lee stats con XP correcto (solo backend)
- **PERO: exercises_completed NUNCA se incremento en este flujo!**
  - El trigger DB retorno temprano por `xp_earned <= 0`
  - El backend NUNCA incrementa `exercises_completed` explicitamente
  - **exercises_completed esta DESACTUALIZADO cuando detectAndGrantEarned evalua**

**Evidencia:**
- `exercise-submission.service.ts:1089` - `addXp()` solo suma XP, no incrementa `exercises_completed`
- `user-stats.service.ts:224-237` - `addXp()` solo hace `stats.total_xp += xpAmount`
- `gamilit/functions/27:30` - trigger retorna si `NEW.xp_earned <= 0`
- No hay ningun `incrementField(userId, 'exercises_completed')` en el backend

---

### VP-2: detectAndGrantEarned() es alcanzable (no hay early returns/try-catch silenciosos que lo bloqueen)

**RESULTADO: SI ES ALCANZABLE, pero envuelto en try-catch que traga errores**

**ExerciseAttemptService (lineas 192-204):**
```typescript
try {
  const earnedAchievements = await this.achievementsService.detectAndGrantEarned(attempt.user_id);
  if (earnedAchievements.length > 0) {
    this.logger.log(`Granted ${earnedAchievements.length} achievement(s)...`);
  }
} catch (error) {
  this.logger.error(`Error detecting achievements: ${error.message}`);
}
```

**ExerciseSubmissionService - manual grading (lineas 485-492):**
```typescript
try {
  const earned = await this.achievementsService.detectAndGrantEarned(submission.user_id);
  if (earned.length > 0) {
    this.logger.log(`[IMPL-004] Granted ${earned.length} achievements...`);
  }
} catch (achievementError) {
  this.logger.error(`[IMPL-004] Error detecting achievements: ${achievementError.message}`);
}
```

**ExerciseSubmissionService - auto-grading (lineas 545-552):**
Identica estructura try-catch.

**Dentro de detectAndGrantEarned() (achievements.service.ts:532-587):**
- `userStatsRepo.findOne()` -> throws `NotFoundException` si no hay stats -> CAPTURADO por try-catch del caller, logueado, y **silenciado**
- `meetsConditions()` (linea 602-958) -> tiene su propio try-catch interno (linea 953-957) que retorna `false` en caso de error -> silencia errores de evaluacion individual
- `grantAchievement()` -> puede ser bloqueado por rate limit

**PROBLEMA:** Los errores internos de `meetsConditions()` retornan `false` silenciosamente. Si una query SQL falla para un tipo de condition especifico (ej: `module_completion` con tabla `modules` vacia), el achievement simplemente no se evalua y no hay alerta visible.

---

### VP-3: Campos de UserStats evaluados por conditions son incrementados correctamente

**RESULTADO: MULTIPLES CAMPOS NO SE INCREMENTAN CORRECTAMENTE**

| Campo UserStats | Usado por condition type | Quien lo incrementa | Estado |
|----------------|-------------------------|---------------------|--------|
| `exercises_completed` | `exercise_completion`, `progress`, `exploration` | DB trigger 14 (attempts AFTER INSERT), DB trigger 27 (submissions AFTER UPDATE cuando xp>0) | **PROBLEMA**: Trigger 14 incrementa para TODO attempt (correcto o incorrecto). Trigger 27 solo cuando xp>0 (y falla para M3-M5 por xp_earned=0 al momento del trigger). Backend NUNCA incrementa explicitamente. |
| `current_streak` | `streak` | Solo DB function `update_leaderboard_streaks()` llamada desde `ExerciseAttemptService.updateModuleProgressAfterCompletion` linea 669 | **OK** para attempts. **PROBLEMA**: No se llama desde ExerciseSubmissionService despues de manual grading. |
| `perfect_scores` | `perfect_score`, `skill_mastery`, `score` | **NADIE LO INCREMENTA** - No hay trigger ni codigo backend que haga `perfect_scores++` | **CRITICO**: Campo siempre es 0. Achievements de tipo `perfect_score` nunca se desbloquean. |
| `modules_completed` | `all_modules_completion` | ExerciseAttemptService.updateModuleProgressAfterCompletion linea 649-665 | **PARCIAL**: Solo se incrementa via ExerciseAttemptService, no desde ExerciseSubmissionService. |
| `average_score` | `all_modules_completion`, `score` | **NADIE LO ACTUALIZA** | **CRITICO**: Campo siempre es 0 o null. |
| `ml_coins_earned_total` | `ml_coins` | DB triggers 14/27 + backend MLCoinsService | Funcional pero posible doble conteo. |
| `level` | `level` | Solo DB trigger `trg_check_rank_promotion_on_xp_gain` (via total_xp) | OK (delegado a DB). |
| `current_rank` | `rank` | DB trigger automatico basado en XP | OK. |

---

### VP-4: Flujo funciona para M1-M2 AND M3-M5

**RESULTADO: FUNCIONA PARCIALMENTE PARA AMBOS, CON PROBLEMAS DISTINTOS**

**M1-M2 (ExerciseAttemptService):**
- `detectAndGrantEarned()` SE llama (linea 193) -> OK
- UserStats SE actualiza ANTES via DB trigger -> OK (pero doble conteo de XP)
- `exercises_completed` se incrementa para TODOS los attempts (incluso incorrectos) -> INCORRECTO para logica de negocio (deberia ser solo correctos)
- `perfect_scores` NUNCA se incrementa -> CRITICO

**M3-M5 (ExerciseSubmissionService - manual grading):**
- `detectAndGrantEarned()` SE llama (linea 486) -> OK
- PERO: `exercises_completed` NO se incrementa (trigger retorna por xp_earned=0) -> CRITICO
- PERO: `current_streak` NO se actualiza despues de manual grading -> MEDIO
- `perfect_scores` NUNCA se incrementa -> CRITICO

**Evidencia:**
- `exercise-submission.service.ts:460` - save con xp_earned=0 ANTES de claimRewards
- `gamilit/functions/27:30` - `IF NEW.xp_earned <= 0 THEN RETURN NEW;`
- `exercise-submission.service.ts:1186` - segundo save despues de claimRewards con xp_earned>0, pero trigger no ejecuta por status sin cambio

---

### VP-5: Silent try-catch blocks que esconden errores

**RESULTADO: SI, MULTIPLES BLOQUES TRY-CATCH SILENCIOSOS**

| Ubicacion | Lineas | Que se pierde |
|-----------|--------|---------------|
| `exercise-attempt.service.ts` | 192-204 | Error en detectAndGrantEarned -> logueado como error, no se propaga |
| `exercise-submission.service.ts` | 485-492 | Error en detectAndGrantEarned (manual grading) -> logueado, no se propaga |
| `exercise-submission.service.ts` | 545-552 | Error en detectAndGrantEarned (auto grading) -> logueado, no se propaga |
| `exercise-submission.service.ts` | 478-481 | Error en claimRewards despues de manual grading -> logueado, no se propaga |
| `achievements.service.ts` | 953-957 | Error en meetsConditions -> retorna `false` (silencia la evaluacion) |
| `achievements.service.ts` | 521-523 | Error en updateIncrementalProgress -> logueado, no se propaga |
| `exercise-attempt.service.ts` | 499-503 | Error en mlCoinsService.addCoins -> logueado, continua |
| `exercise-attempt.service.ts` | 514-518 | Error en userStatsService.addXp -> logueado, continua |

**Impacto:** Si `addXp` falla silenciosamente en ExerciseAttemptService, el detectAndGrantEarned posterior evaluara condiciones de XP con valores viejos. No habra error visible - el usuario simplemente no recibira su achievement.

El patron es intencional (resilience-first: no fallar el flujo principal por errores de gamificacion), pero la falta de mecanismo de reintentos significa que achievements perdidos son **permanentemente perdidos** hasta la proxima ejecucion de ejercicio.

---

### VP-6: Rate limiting (5/min/user) y perdida de achievements

**RESULTADO: RIESGO REAL DE PERDIDA DE ACHIEVEMENTS**

**Mecanismo:**
```typescript
// achievements.service.ts:139-168
private checkRateLimit(userId: string): boolean {
  // Ventana de 60 segundos, maximo 5 achievements
  if (entry.count >= this.RATE_LIMIT_MAX) {
    this.logger.warn(`Rate limit reached for user ${userId}. Queuing achievement grant.`);
    return false; // <-- El log dice "Queuing" pero NO hay queue!
  }
}
```

**El problema:**
- El log dice "Queuing achievement grant" pero NO EXISTE ningun mecanismo de queue/retry
- Cuando `checkRateLimit` retorna `false`, `grantAchievement` (linea 291-298) retorna el registro existente o simplemente omite la creacion
- Si `detectAndGrantEarned` encuentra 7 achievements elegibles, los primeros 5 se otorgan y los ultimos 2 se **pierden permanentemente**
- No hay retry, no hay job de background, no hay "pending queue"

**Escenario realista:**
Un estudiante que no ha jugado en semanas regresa y completa 3 ejercicios rapidamente. Sus stats saltan de exercises_completed=0 a exercises_completed=3. Si hay achievements para 1, 2, y 3 ejercicios, mas achievements por streak, primer login, etc., facilmente podria desbloquear >5 en un solo `detectAndGrantEarned()`.

**Ademas:** `detectAndGrantEarned` es llamado en CADA ejercicio completado. Si el usuario completa 2 ejercicios en menos de 1 minuto, la segunda invocacion podria estar dentro de la misma ventana de rate limit.

**Nota de `findAll()`:** `detectAndGrantEarned` llama `findAll()` SIN `includeSecret=true` (linea 542), lo que significa que **achievements secretos NUNCA son evaluados** por la deteccion automatica. Esto puede ser intencional, pero no esta documentado.

---

## HALLAZGOS (Lo que funciona correctamente)

### H-01: Flujo basico de deteccion existe y es alcanzable
- `detectAndGrantEarned()` es llamado desde ambos paths (attempts y submissions)
- El metodo esta correctamente integrado en el flujo post-grading
- **Archivos:** `exercise-attempt.service.ts:193`, `exercise-submission.service.ts:486,546`

### H-02: meetsConditions soporta multiples tipos de achievement
- 16 tipos de condicion implementados: `exercise_completion`, `streak`, `module_completion`, `all_modules_completion`, `perfect_score`, `skill_mastery`, `exploration`, `social`, `special`, `module_first_exercise`, `exercise_score`, `exercise_repetition`, `exercise_speed`, `content_analysis`, `module_average_score`, + legacy types
- Tipos M3-M5 (CORR-009) usan queries SQL directas para mayor precision
- **Archivo:** `achievements.service.ts:602-958`

### H-03: Proteccion contra achievements duplicados
- `detectAndGrantEarned()` verifica `is_completed: true` antes de re-evaluar (linea 546-556)
- `is_repeatable` flag permite achievements repetibles
- **Archivo:** `achievements.service.ts:544-556`

### H-04: Notificacion WebSocket al desbloquear achievement
- `notifyAchievementUnlocked()` emite evento WebSocket + crea notificacion in-app
- Integrado en `grantAchievement()` (linea 354-356) y `updateIncrementalProgress()` (linea 516)
- **Archivo:** `achievements.service.ts:978-1034`

### H-05: Rate limiting existe como mecanismo de proteccion
- Cache in-memory con ventana de 60 segundos, maximo 5 achievements
- Previene spam/abuse de achievement granting
- **Archivo:** `achievements.service.ts:139-168`

### H-06: Claim rewards de achievements es atomico via SQL
- `claim_achievement_reward()` es funcion SQL atomica que valida, marca y distribuye rewards
- **Archivo:** `achievements.service.ts:1052-1082`

### H-07: DB triggers como capa de defensa para user_stats
- Trigger 14 actualiza user_stats en exercise_attempts
- Trigger 31/27 actualiza user_stats en exercise_submissions
- Patron UPSERT para crear stats si no existen
- **Archivos DDL:** `triggers/21`, `triggers/31`, `functions/14`, `functions/27`

---

## PROBLEMAS

### P-01 [CRITICO]: `perfect_scores` NUNCA se incrementa en user_stats

**Descripcion:** El campo `gamification_system.user_stats.perfect_scores` es evaluado por achievement conditions de tipo `perfect_score` (linea 694), `skill_mastery` (linea 708), y `score` (linea 937), pero NINGUN codigo ni trigger lo incrementa jamas.

**Evidencia:**
- Trigger function 14 (`update_user_stats_on_exercise_complete`) NO actualiza `perfect_scores` (solo `exercises_completed`, `total_xp`, `ml_coins`)
- Trigger function 27 (`update_user_stats_on_submission_graded`) NO actualiza `perfect_scores`
- No existe `incrementField(userId, 'perfect_scores')` en ningun servicio
- `UserStatsService.addXp()` solo incrementa `total_xp`
- `UserStatsService.updateStats()` existe pero nunca se llama con `perfect_scores`

**Impacto:** Todos los achievements con condition type `perfect_score`, `skill_mastery`, o `score` (que verifica `min_perfect_scores`) son IMPOSIBLES de desbloquear. El campo siempre es 0.

**Archivos afectados:**
- `achievements.service.ts:691-696` (evaluacion)
- `user-stats.entity.ts:209` (campo definido)
- `functions/14` y `functions/27` (deberian incrementar, no lo hacen)

---

### P-02 [CRITICO]: `average_score` NUNCA se actualiza en user_stats

**Descripcion:** El campo `gamification_system.user_stats.average_score` es evaluado por conditions `all_modules_completion` (linea 678) y `score` (linea 936), pero ningun codigo lo calcula ni actualiza.

**Evidencia:**
- No hay UPDATE de `average_score` en ningun trigger DB
- No hay llamada a `updateStats({average_score: ...})` en ningun servicio
- El campo permanece en su valor default (0 o null)

**Impacto:** Achievements de tipo `all_modules_completion` con `min_score_average` >0 y tipo `score` con `min_average_score` >0 son IMPOSIBLES de desbloquear.

---

### P-03 [CRITICO]: `exercises_completed` NO se incrementa para M3-M5 manual grading

**Descripcion:** En el flujo de calificacion manual (M3-M5), el trigger DB `trg_update_user_stats_on_submission` no ejecuta su logica porque `xp_earned = 0` al momento del primer save. El backend nunca incrementa `exercises_completed` explicitamente.

**Cadena de eventos:**
1. `gradeSubmission()` establece `score`, `is_correct`, `status='graded'` con `xp_earned=0`
2. `submissionRepo.save()` dispara trigger 31
3. Trigger function 27 verifica `IF NEW.xp_earned <= 0 THEN RETURN NEW` -> sale sin actualizar
4. `claimRewards()` calcula y asigna XP via `addXp()`
5. `claimRewards()` guarda submission con `xp_earned > 0`
6. Trigger 31 se re-evalua pero `OLD.status = NEW.status = 'graded'` -> no ejecuta

**Resultado:** `exercises_completed` NO se incrementa para submissions M3-M5 calificadas manualmente.

**Impacto:** Achievements de tipo `exercise_completion` basados en `exercises_completed` no cuentan ejercicios M3-M5.

**Archivos:**
- `exercise-submission.service.ts:460` (save con xp_earned=0)
- `gamilit/functions/27:30` (early return)
- `triggers/31:73-81` (condicion WHEN)

---

### P-04 [ALTO]: Doble conteo de XP y ML Coins en ExerciseAttemptService

**Descripcion:** Para exercise_attempts, el XP y ML Coins se suman DOS veces:
1. El DB trigger `trg_update_user_stats_on_exercise` (AFTER INSERT) suma `total_xp += NEW.xp_earned` y `ml_coins += NEW.ml_coins_earned`
2. Inmediatamente despues, `awardRewards()` llama `userStatsService.addXp()` que hace `stats.total_xp += xpAmount` y `mlCoinsService.addCoins()`

**Evidencia:**
- `exercise-attempt.service.ts:185` - save que dispara trigger
- `exercise-attempt.service.ts:189` - awardRewards que vuelve a sumar
- `gamilit/functions/14:33-41` - trigger que incrementa

**Impacto:** Los usuarios reciben el DOBLE de XP y ML Coins por cada ejercicio M1-M2. Esto infla artificialmente los stats y puede causar:
- Desbloqueo prematuro de achievements basados en XP/nivel
- Rankings inflados en leaderboards
- Economia de ML Coins desbalanceada

---

### P-05 [ALTO]: `exercises_completed` se incrementa para TODOS los attempts (incluso incorrectos)

**Descripcion:** El trigger DB `update_user_stats_on_exercise_complete()` (function 14) ejecuta `exercises_completed = exercises_completed + 1` incondicionalmente en linea 35, antes de calcular si el ejercicio fue correcto o no. Solo el XP y coins estan condicionados a `v_is_correct`.

**Evidencia:**
```sql
-- gamilit/functions/14, lineas 33-41
UPDATE gamification_system.user_stats
SET
    exercises_completed = exercises_completed + 1,  -- SIEMPRE incrementa
    total_xp = total_xp + v_xp_earned,             -- Solo > 0 si correcto
    ml_coins = ml_coins + v_coins_earned,           -- Solo > 0 si correcto
    ...
WHERE user_id = NEW.user_id;
```

**Impacto:** `exercises_completed` cuenta intentos totales, no ejercicios completados correctamente. Achievements de tipo `exercise_completion` se desbloquean con intentos fallidos.

---

### P-06 [ALTO]: achievements secretos (is_secret=true) NUNCA se evaluan automaticamente

**Descripcion:** `detectAndGrantEarned()` llama `findAll()` sin `includeSecret=true` (linea 542). `findAll()` por defecto excluye `is_secret=true` (linea 189-191).

**Evidencia:**
```typescript
// achievements.service.ts:542
const allAchievements = await this.findAll(); // includeSecret defaults to false

// achievements.service.ts:186-191
async findAll(includeSecret: boolean = false): Promise<Achievement[]> {
    ...
    if (!includeSecret) {
      query.andWhere('a.is_secret = false');
    }
}
```

**Impacto:** Achievements con `is_secret = true` nunca son evaluados por auto-detection. Si hay achievements secretos que deberian desbloquearse automaticamente (ej: "Completar todos los modulos"), estos nunca se detectaran.

---

### P-07 [ALTO]: Rate limit dice "Queuing" pero NO hay queue

**Descripcion:** Cuando el rate limit se alcanza, el log dice "Queuing achievement grant" pero no existe ningun mecanismo de queue, retry, o procesamiento posterior.

**Evidencia:**
```typescript
// achievements.service.ts:158-159
this.logger.warn(`Rate limit reached for user ${userId}. Queuing achievement grant.`);
return false; // <-- No hay queue
```

En `grantAchievement()` lineas 291-298, cuando rate limit retorna false:
```typescript
if (grantDto.is_completed && !this.checkRateLimit(userId)) {
  const existing = await this.userAchievementRepo.findOne(...);
  if (existing) return existing;
  // If no existing record, fall through to create one without completion
}
```
- Si existe registro previo: retorna sin marcar como completado
- Si no existe: cae al flujo normal pero el `is_completed` del DTO ya se ignoro parcialmente

**Impacto:** Achievements que exceden el limite de 5/minuto se pierden permanentemente.

---

### P-08 [MEDIO]: `current_streak` NO se actualiza despues de manual grading (M3-M5)

**Descripcion:** La llamada a `update_leaderboard_streaks()` (que actualiza `current_streak` en user_stats) solo existe en `ExerciseAttemptService.updateModuleProgressAfterCompletion()` (linea 669). No existe en `ExerciseSubmissionService.updateModuleProgressAfterCompletion()`.

**Evidencia:**
- `exercise-attempt.service.ts:668-677` - llama `update_leaderboard_streaks()`
- `exercise-submission.service.ts:1324-1437` - NO llama `update_leaderboard_streaks()`

**Impacto:** Completar ejercicios M3-M5 no actualiza el streak del usuario. Achievements de tipo `streak` pueden no reflejar la actividad real.

---

### P-09 [MEDIO]: `modules_completed` solo se incrementa desde ExerciseAttemptService

**Descripcion:** El campo `modules_completed` se incrementa en `ExerciseAttemptService.updateModuleProgressAfterCompletion()` (lineas 647-665) cuando un modulo pasa a status `completed`. Este codigo NO existe en `ExerciseSubmissionService.updateModuleProgressAfterCompletion()`.

**Impacto:** Si el ultimo ejercicio de un modulo es de tipo M3-M5, el modulo puede marcarse como `completed` en `module_progress` pero `user_stats.modules_completed` no se incrementa. Achievements de tipo `all_modules_completion` podrian no desbloquearse.

---

### P-10 [MEDIO]: progress/max_progress en grantDto usa solo `exercises_completed` como fallback

**Descripcion:** En `detectAndGrantEarned()` lineas 567-570:
```typescript
const conditionsTyped = achievement.conditions as { requirements?: { exercises_completed?: number } };
const reqs = conditionsTyped.requirements || {};
grantDto.progress = reqs.exercises_completed || 100;
grantDto.max_progress = reqs.exercises_completed || 100;
```

Solo lee `exercises_completed` de requirements. Para achievements con `consecutive_days`, `perfect_exercises`, `modules_completed`, etc., progress y max_progress siempre seran 100.

**Impacto:** La barra de progreso en el frontend para achievements no-exercise-completion siempre mostrara 100/100, no el progreso real.

---

### P-11 [BAJO]: `updateIncrementalProgress()` esta definido pero NUNCA se llama

**Descripcion:** El metodo `updateIncrementalProgress()` (linea 415) en AchievementsService es un mecanismo alternativo para tracking incremental de progreso, pero no es llamado desde ningun servicio externo.

**Evidencia:**
- Solo aparece en `achievements.service.ts` (definicion)
- No hay importaciones ni llamadas desde exercise-attempt.service.ts ni exercise-submission.service.ts
- Grep confirma: solo 1 resultado en todo el backend

**Impacto:** Codigo muerto. El tracking incremental de progreso (ej: actualizaciones parciales de achievements en-progreso) no funciona. Solo el metodo `detectAndGrantEarned()` (todo-o-nada) se usa.

---

### P-12 [BAJO]: Column name mismatch en exercise_speed query

**Descripcion:** La query SQL para achievement type `exercise_speed` (linea 866) referencia `es.time_spent` pero la columna real en la tabla `exercise_submissions` es `time_spent_seconds`.

**Evidencia:**
```sql
-- achievements.service.ts:866
AND es.time_spent <= $4
```
```sql
-- DDL exercise_submissions table
time_spent_seconds integer,
```

**Impacto:** Achievements de tipo `exercise_speed` SIEMPRE fallan con error SQL (column does not exist). El error es capturado por el try-catch de `meetsConditions()` (linea 953) y retorna `false` silenciosamente.

---

## RECOMENDACIONES

### R-01 [CRITICO]: Implementar incremento de `perfect_scores` -> Resuelve P-01

**Opcion A (DB trigger - recomendada):** Agregar logica al trigger function 14 y 27:
```sql
-- En update_user_stats_on_exercise_complete / update_user_stats_on_submission_graded:
IF v_is_correct AND NEW.score = 100 THEN  -- o NEW.score = NEW.max_score
    perfect_scores = perfect_scores + 1,
END IF;
```

**Opcion B (Backend):** Despues de `awardRewards()` y antes de `detectAndGrantEarned()`:
```typescript
if (attempt.score === 100 && !attempt.hints_used) {
  await this.userStatsService.incrementField(userId, 'perfect_scores');
}
```

### R-02 [CRITICO]: Implementar actualizacion de `average_score` -> Resuelve P-02

Agregar calculo de promedio al trigger o al backend despues de cada ejercicio completado:
```sql
average_score = (
  SELECT AVG(score) FROM progress_tracking.exercise_attempts
  WHERE user_id = NEW.user_id AND is_correct = true
)
```

### R-03 [CRITICO]: Corregir orden de operaciones para M3-M5 -> Resuelve P-03

**Opcion A:** Mover `exercises_completed++` al backend:
```typescript
// En gradeSubmission(), despues de save con status='graded':
await this.userStatsService.incrementField(submission.user_id, 'exercises_completed');
```

**Opcion B:** Cambiar trigger 27 para no depender de `xp_earned`:
```sql
-- Remover la condicion:
-- IF NEW.xp_earned <= 0 THEN RETURN NEW; END IF;
-- Reemplazar con:
IF NEW.is_correct IS NOT TRUE THEN RETURN NEW; END IF;
```

### R-04 [ALTO]: Eliminar doble conteo de XP/ML Coins -> Resuelve P-04

**Opcion preferida:** Remover `awardRewards()` del ExerciseAttemptService y dejar que SOLO los DB triggers manejen XP/coins, O remover los campos `xp_earned`/`ml_coins_earned` del row de attempt para que el trigger no los sume.

Alternativamente, hacer que el trigger NO sume XP/coins y dejar eso solo al backend. Mantener una sola fuente de verdad.

### R-05 [ALTO]: Condicionar `exercises_completed++` a ejercicios correctos -> Resuelve P-05

En trigger function 14, envolver el incremento:
```sql
IF v_is_correct THEN
    exercises_completed = exercises_completed + 1,
    total_xp = total_xp + v_xp_earned,
    ...
END IF;
```

### R-06 [ALTO]: Evaluar achievements secretos en detectAndGrantEarned -> Resuelve P-06

Cambiar la llamada en linea 542:
```typescript
const allAchievements = await this.findAll(true); // includeSecret = true
```

O crear metodo separado `findAllForDetection()` que incluya secretos.

### R-07 [ALTO]: Implementar queue real para achievements rate-limited -> Resuelve P-07

Opciones:
1. **Redis queue:** Encolar achievements pendientes y procesarlos con job de background
2. **DB table:** Tabla `pending_achievements` + cron job
3. **Simplemente aumentar el limite** a 20/min (mas pragmatico para MVP)
4. **Eliminar rate limit en detectAndGrantEarned** (el rate limit solo aplica para el endpoint manual de grant, no para auto-detection)

### R-08 [MEDIO]: Agregar update_leaderboard_streaks a submissions -> Resuelve P-08

Agregar a `ExerciseSubmissionService.updateModuleProgressAfterCompletion()`:
```typescript
// Despues del UPSERT de module_progress:
try {
  await this.entityManager.query(
    `SELECT * FROM gamification_system.update_leaderboard_streaks($1)`,
    [userId]
  );
} catch (streakError) {
  this.logger.warn(`Could not update streak: ${streakError}`);
}
```

### R-09 [MEDIO]: Agregar modules_completed increment a submissions -> Resuelve P-09

Copiar el bloque IMPL-002 de ExerciseAttemptService (lineas 647-665) a ExerciseSubmissionService.updateModuleProgressAfterCompletion().

### R-10 [MEDIO]: Corregir progress/max_progress en detectAndGrantEarned -> Resuelve P-10

Leer el campo correcto segun el tipo de condition:
```typescript
const maxProgress = reqs.exercises_completed || reqs.consecutive_days ||
  reqs.perfect_exercises || reqs.modules_completed || 100;
```

### R-11 [BAJO]: Corregir column name en exercise_speed query -> Resuelve P-12

```typescript
// achievements.service.ts:866
// Cambiar: AND es.time_spent <= $4
// Por:     AND es.time_spent_seconds <= $4
```

### R-12 [BAJO]: Integrar o eliminar updateIncrementalProgress -> Resuelve P-11

Integrar `updateIncrementalProgress()` en el flujo de ejercicios para tracking incremental, o eliminarlo como codigo muerto.

---

## RESUMEN DE SEVERIDADES

| Severidad | Count | IDs |
|-----------|-------|-----|
| CRITICO   | 3     | P-01, P-02, P-03 |
| ALTO      | 4     | P-04, P-05, P-06, P-07 |
| MEDIO     | 3     | P-08, P-09, P-10 |
| BAJO      | 2     | P-11, P-12 |
| **Total** | **12** | |

---

## ARCHIVOS CLAVE REFERENCIADOS

| Archivo | Path absoluto |
|---------|---------------|
| ExerciseSubmissionService | `apps/backend/src/modules/progress/services/exercise-submission.service.ts` |
| ExerciseAttemptService | `apps/backend/src/modules/progress/services/exercise-attempt.service.ts` |
| AchievementsService | `apps/backend/src/modules/gamification/services/achievements.service.ts` |
| UserStatsService | `apps/backend/src/modules/gamification/services/user-stats.service.ts` |
| Trigger 21 (attempts -> user_stats) | `apps/database/ddl/schemas/progress_tracking/triggers/21-trg_update_user_stats_on_exercise.sql` |
| Trigger 31 (submissions -> user_stats) | `apps/database/ddl/schemas/progress_tracking/triggers/31-trg_update_user_stats_on_submission.sql` |
| Function 14 (user_stats on attempt) | `apps/database/ddl/schemas/gamilit/functions/14-update_user_stats_on_exercise_complete.sql` |
| Function 27 (user_stats on submission) | `apps/database/ddl/schemas/gamilit/functions/27-update_user_stats_on_submission_graded.sql` |
| UserStats entity | `apps/backend/src/modules/gamification/entities/user-stats.entity.ts` |
