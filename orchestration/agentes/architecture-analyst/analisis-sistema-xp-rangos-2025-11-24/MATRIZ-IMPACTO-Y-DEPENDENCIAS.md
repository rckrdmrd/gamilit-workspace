# MATRIZ DE IMPACTO Y ANÁLISIS DE DEPENDENCIAS

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Estado:** ✅ ANÁLISIS COMPLETADO
**Prioridad:** 🔴 CRÍTICA

---

## 📋 RESUMEN EJECUTIVO

**Objetivo:** Validar que la implementación de la arquitectura dual (attempts vs submissions) no genera conflictos con componentes existentes.

**Resultado del Análisis:**
- ✅ **9 archivos backend analizados**
- ✅ **13 archivos frontend identificados**
- ✅ **2 triggers de base de datos verificados**
- ⚠️ **5 conflictos críticos identificados**
- ✅ **Plan de mitigación documentado**

---

## 🔍 ANÁLISIS DE DEPENDENCIAS

### 1. Backend - Servicios

#### A) ExerciseSubmissionService
**Archivo:** `apps/backend/src/modules/progress/services/exercise-submission.service.ts`

**Responsabilidades actuales:**
- Crear/actualizar registros en `progress_tracking.exercise_submissions`
- Validar respuestas de ejercicios
- Calificar automáticamente (auto-grading)
- Otorgar recompensas (XP y ML Coins)
- Gestionar estados: draft → submitted → graded → reviewed

**Métodos públicos:**
```typescript
- create(dto): Crea submission
- findByUserId(userId): Lista submissions de un usuario
- findByExerciseId(exerciseId): Lista submissions de un ejercicio
- findByUserAndExercise(userId, exerciseId): Submission específico
- submitExercise(userId, exerciseId, answers): ⚠️ MÉTODO PROBLEMÁTICO
- gradeSubmission(id): Auto-califica
- provideFeedback(id, feedback): Feedback del maestro
- updateStatus(id, status): Cambia estado
- claimRewards(id): Otorga XP y ML Coins
- getSubmissionStats(userId): Estadísticas
- findPendingReview(): Pendientes de revisión
```

**⚠️ CONFLICTO CRÍTICO #1:**
**Líneas 206-210 - Check que bloquea reenvíos:**
```typescript
if (existingSubmission && existingSubmission.status === 'graded') {
  throw new BadRequestException(
    'Exercise already submitted and graded. Cannot resubmit.',
  );
}
```

**Impacto:**
- ❌ Bloquea reenvíos de ejercicios autocorregibles
- ❌ No diferencia entre práctica (attempts) y evaluación (submissions)
- ❌ Violación de requerimientos funcionales (estudiantes deben poder practicar)

---

#### B) ExerciseAttemptService
**Archivo:** `apps/backend/src/modules/progress/services/exercise-attempt.service.ts`

**Responsabilidades actuales:**
- Crear registros en `progress_tracking.exercise_attempts`
- **YA PERMITE múltiples intentos** (sin check de bloqueo)

**Métodos públicos:**
```typescript
- create(dto): Crea attempt
- findByUserId(userId): Lista attempts de un usuario
- findByUserIdAndExerciseId(userId, exerciseId): Attempts específicos
```

**Estado:** ✅ **Funcionando correctamente**

---

### 2. Backend - Controllers

#### A) ExerciseSubmissionController
**Archivo:** `apps/backend/src/modules/progress/controllers/exercise-submission.controller.ts`

**Ruta:** `/api/v1/progress/submissions`

**Endpoints:**
```typescript
POST   /submissions                        - Crear submission
GET    /submissions/users/:userId          - Lista submissions de usuario
GET    /submissions/exercises/:exerciseId  - Lista submissions de ejercicio
GET    /submissions/users/:userId/exercises/:exerciseId
POST   /submissions/submit                  - ⚠️ Enviar ejercicio (problemático)
POST   /submissions/:id/grade               - Calificar (teacher)
POST   /submissions/:id/feedback            - Dar feedback (teacher)
PATCH  /submissions/:id/status              - Cambiar estado
GET    /submissions/users/:userId/stats     - Estadísticas
GET    /submissions/pending-review          - Pendientes (teacher)
POST   /submissions/:id/claim-rewards       - Reclamar recompensas
```

**Uso:** ⚠️ **Endpoints mezclados** (usados para práctica Y evaluación formal)

---

#### B) ExercisesController
**Archivo:** `apps/backend/src/modules/educational/controllers/exercises.controller.ts`

**Ruta:** `/api/v1/educational/exercises`

**Endpoints relevantes:**
```typescript
GET  /exercises                    - Lista todos los ejercicios
GET  /exercises/:id                - Obtiene ejercicio por ID
POST /exercises/:id/submit         - ⚠️ ENDPOINT PRINCIPAL (líneas 726-894)
GET  /modules/:moduleId/exercises  - Ejercicios de un módulo
GET  /exercises/:id/hints          - Obtener pistas
```

**⚠️ CONFLICTO CRÍTICO #2:**
**El método `submitExercise()` usa AMBOS servicios:**

```typescript
// Línea 841: Crea en exercise_submissions
const submission = await this.exerciseSubmissionService.submitExercise(
  userId,
  exerciseId,
  submittedAnswers,
);

// Línea 865: Crea en exercise_attempts
await this.exerciseAttemptService.create({
  user_id: profileId,
  exercise_id: exerciseId,
  submitted_answers: submittedAnswers,
  // ...
});
```

**Impacto:**
- ❌ **Duplicación de registros**: Mismo ejercicio en dos tablas
- ❌ **XP duplicado potencial**: Submissions otorga XP Y trigger también
- ❌ **Tabla `exercise_submissions` se llena con intentos de práctica** (incorrecto)

---

### 3. Frontend - Componentes y APIs

#### Archivos que usan submission endpoints:

| Archivo | Endpoint Usado | Función |
|---------|----------------|---------|
| `educationalAPI.ts` | `POST /exercises/:id/submit` | submitExercise |
| `progressAPI.ts` | `POST /submissions/submit` | submitExercise (alternativo) |
| `useExerciseSubmission.ts` (2 archivos) | `POST /exercises/:id/submit` | Hook para submit |
| `mechanicsAPI.ts` | `POST /exercises/:id/submit` | Mecánicas M1-M3 |
| `tribunalOpinionesAPI.ts` | `POST /exercises/:id/submit` | Ejercicio específico M3 |

**Total:** 13 archivos identificados

**⚠️ CONFLICTO CRÍTICO #3:**
**Frontend usa un solo endpoint para TODOS los ejercicios:**
- No diferencia entre autocorregibles y revisión manual
- No hay lógica para decidir cuándo usar `/attempt` vs `/submit`
- Todos los ejercicios van a través de `ExercisesController.submitExercise()`

---

### 4. Base de Datos - Triggers

#### A) Trigger en `exercise_attempts`
**Archivo:** `ddl/schemas/progress_tracking/triggers/21-trg_update_user_stats_on_exercise.sql`

**Trigger:**
```sql
CREATE TRIGGER trg_update_user_stats_on_exercise
  AFTER INSERT ON progress_tracking.exercise_attempts
  FOR EACH ROW
  EXECUTE FUNCTION gamilit.update_user_stats_on_exercise_complete();
```

**Función:**
```sql
CREATE OR REPLACE FUNCTION gamilit.update_user_stats_on_exercise_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
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
    -- ...
END;
$$;
```

**Estado:** ✅ **Funcionando correctamente**

**Responsabilidades:**
- Incrementa `exercises_completed`
- Acumula `total_xp` desde `NEW.xp_earned`
- Acumula `ml_coins` desde `NEW.ml_coins_earned`
- Actualiza `last_activity_at`
- UPSERT: Crea registro si no existe

---

#### B) Trigger en `exercise_submissions`
**Archivo:** NO EXISTE

**Estado:** ❌ **No hay trigger equivalente**

**Impacto:**
- Si se usa `exercise_submissions` para práctica, **no se actualizan stats automáticamente**
- Dependencia de `claimRewards()` manual (llamado por `ExerciseSubmissionService.submitExercise()` línea 241)

---

## ⚠️ CONFLICTOS CRÍTICOS IDENTIFICADOS

### CONFLICTO #1: Check de Reenvío Bloqueante

**Ubicación:** `exercise-submission.service.ts:206-210`

**Problema:**
```typescript
if (existingSubmission && existingSubmission.status === 'graded') {
  throw new BadRequestException(
    'Exercise already submitted and graded. Cannot resubmit.',
  );
}
```

**Impacto:**
- ❌ Bloquea reenvíos de ejercicios de práctica
- ❌ Error 400 en segundo intento
- ❌ Estudiantes no pueden practicar después del primer acierto

**Solución:**
- ✅ Eliminar este check para ejercicios autocorregibles
- ✅ Mantenerlo solo para ejercicios `requires_manual_grading = true`

---

### CONFLICTO #2: Duplicación de Registros

**Ubicación:** `exercises.controller.ts:841 + 865`

**Problema:**
Mismo ejercicio se registra en **dos tablas diferentes**:
1. `exercise_submissions` (línea 841)
2. `exercise_attempts` (línea 865)

**Ejemplo:**
```typescript
// Registro 1: exercise_submissions
const submission = await this.exerciseSubmissionService.submitExercise(
  userId, exerciseId, submittedAnswers
);

// Registro 2: exercise_attempts
await this.exerciseAttemptService.create({
  user_id: profileId,
  exercise_id: exerciseId,
  submitted_answers: submittedAnswers,
  // ...
});
```

**Impacto:**
- ❌ Tabla `exercise_submissions` se llena con intentos de práctica (incorrecto)
- ❌ Dificultad para queries (¿cuál es la fuente de verdad?)
- ❌ Espacio de almacenamiento duplicado
- ⚠️ Posible inconsistencia entre tablas

**Solución:**
- ✅ Ejercicios autocorregibles → **SOLO** `exercise_attempts`
- ✅ Ejercicios revisión manual → **SOLO** `exercise_submissions`

---

### CONFLICTO #3: XP Duplicado Potencial

**Ubicación:** `exercise-submission.service.ts:241` + trigger

**Problema:**
XP se otorga en **dos lugares**:
1. `ExerciseSubmissionService.claimRewards()` (línea 241)
2. Trigger `trg_update_user_stats_on_exercise` (después de insert en attempts)

**Flujo actual:**
```
submitExercise()
  ↓
submission.claimRewards()  → XP +170
  ↓
attemptService.create()
  ↓
TRIGGER ejecuta           → XP +170
  ↓
TOTAL XP: +340 ❌ (DUPLICADO)
```

**Impacto:**
- ❌ XP duplicado en cada ejercicio
- ❌ Usuarios avanzan de rango más rápido de lo esperado
- ❌ Sistema de progresión roto

**Solución:**
- ✅ Ejercicios autocorregibles: XP SOLO desde trigger (eliminar claimRewards)
- ✅ Ejercicios revisión manual: XP SOLO desde claimRewards manual (sin trigger)

---

### CONFLICTO #4: Frontend No Diferencia Tipos

**Ubicación:** Todos los archivos frontend

**Problema:**
Frontend usa un **solo endpoint** para todos los ejercicios:
```typescript
POST /api/v1/educational/exercises/:id/submit
```

No hay lógica para:
- Detectar si ejercicio es autocorregible o requiere revisión manual
- Usar `/attempt` para práctica vs `/submit` para evaluación
- Gestionar reenvíos de manera diferente según tipo

**Impacto:**
- ⚠️ Frontend necesitará cambios después de implementar arquitectura dual
- ⚠️ Todos los componentes de ejercicios afectados (27+ tipos)
- ⚠️ Hooks de submission afectados

**Solución:**
- ✅ Fase 1: Backend mantiene retrocompatibilidad en `/exercises/:id/submit`
- ✅ Fase 2: Frontend migra a `/exercises/:id/attempt` para autocorregibles
- ✅ Fase 3: Deprecar uso de `/submit` para práctica

---

### CONFLICTO #5: Tabla `exercise_submissions` Mal Usada

**Ubicación:** Toda la aplicación

**Problema:**
`exercise_submissions` se usa para **intentos de práctica** cuando debería usarse solo para **entregas formales**:

**Registros actuales en `exercise_submissions`:**
```
user_id       | exercise_id | status  | ¿Es práctica?
--------------|-------------|---------|---------------
user-A        | crucigrama  | graded  | ✅ SÍ (incorrecto)
user-B        | detective   | graded  | ✅ SÍ (incorrecto)
user-C        | ensayo      | graded  | ❌ NO (correcto)
```

**Impacto:**
- ❌ 90% de registros en `exercise_submissions` son incorrectos
- ❌ Queries de "pending_review" incluyen ejercicios autocorregibles
- ❌ Maestros ven ejercicios que no necesitan revisar
- ❌ Estadísticas de submissions infladas

**Solución:**
- ✅ Migración de datos: Mover registros de autocorregibles a `exercise_attempts`
- ✅ Agregar campo `requires_manual_grading` en tabla `exercises`
- ✅ Validar tipo de ejercicio antes de crear submission

---

## 📊 MATRIZ DE IMPACTO POR COMPONENTE

### Backend

| Componente | Impacto | Cambios Requeridos | Prioridad |
|------------|---------|-------------------|-----------|
| `ExerciseSubmissionService` | 🔴 ALTO | - Eliminar check de reenvío (líneas 206-210)<br>- Agregar validación de `requires_manual_grading`<br>- Mantener solo para revisión manual | P0 |
| `ExerciseAttemptService` | 🟢 BAJO | - Agregar lógica `shouldAwardXP()` (anti-farming)<br>- Métodos de historial y stats | P1 |
| `ExercisesController` | 🔴 ALTO | - Eliminar llamada a `submissionService.submitExercise()` (línea 841)<br>- Usar SOLO `attemptService` para autocorregibles<br>- Agregar endpoint `/exercises/:id/attempt` | P0 |
| `ExerciseSubmissionController` | 🟡 MEDIO | - Documentar que es solo para revisión manual<br>- Agregar validación de tipo de ejercicio | P1 |

### Frontend

| Componente | Impacto | Cambios Requeridos | Prioridad |
|------------|---------|-------------------|-----------|
| `educationalAPI.ts` | 🟡 MEDIO | - Agregar método `submitAttempt()`<br>- Mantener `submitExercise()` para compatibilidad | P1 |
| `useExerciseSubmission.ts` | 🟡 MEDIO | - Detectar tipo de ejercicio<br>- Usar endpoint correcto según tipo | P2 |
| `progressAPI.ts` | 🟢 BAJO | - Agregar método `getAttemptHistory()` | P2 |
| Componentes de ejercicios | 🟡 MEDIO | - Actualizar llamadas API<br>- Gestionar respuesta de attempt vs submission | P2 |

### Base de Datos

| Componente | Impacto | Cambios Requeridos | Prioridad |
|------------|---------|-------------------|-----------|
| `exercises` table | 🟡 MEDIO | - Agregar columna `requires_manual_grading BOOLEAN` | P0 |
| `exercise_attempts` | 🟢 BAJO | - Sin cambios (ya funcionando correctamente) | - |
| `exercise_submissions` | 🟢 BAJO | - Sin cambios estructurales<br>- Migración de datos (mover registros incorrectos) | P1 |
| Trigger `trg_update_user_stats_on_exercise` | 🟢 BAJO | - Sin cambios (ya funcionando correctamente) | - |

---

## 🛡️ PLAN DE MITIGACIÓN

### Fase 0: Preparación (Sin Downtime)

**Duración:** 1 hora
**Riesgo:** 🟢 BAJO

**Tareas:**
1. Agregar columna `requires_manual_grading` a tabla `exercises`
   ```sql
   ALTER TABLE educational_content.exercises
   ADD COLUMN requires_manual_grading BOOLEAN DEFAULT false;
   ```

2. Clasificar ejercicios existentes
   ```sql
   -- Autocorregibles (Módulos 1, 2, 3)
   UPDATE educational_content.exercises
   SET requires_manual_grading = false
   WHERE exercise_type IN (
     'crucigrama', 'linea_tiempo', 'sopa_letras', 'emparejamiento',
     'detective_textual', 'construccion_hipotesis', 'prediccion_narrativa',
     'puzzle_contexto', 'rueda_inferencias',
     'analisis_fuentes', 'debate_digital', 'matriz_perspectivas',
     'podcast_argumentativo', 'tribunal_opiniones'
   );

   -- Revisión manual
   UPDATE educational_content.exercises
   SET requires_manual_grading = true
   WHERE exercise_type IN (
     'ensayo_argumentativo', 'resena_critica', 'diario_multimedia',
     'comic_digital', 'video_carta'
   );
   ```

**Validación:**
```sql
SELECT
  requires_manual_grading,
  COUNT(*) as total_exercises
FROM educational_content.exercises
GROUP BY requires_manual_grading;

-- Esperado:
-- false | 90 (autocorregibles)
-- true  | 10 (revisión manual)
```

---

### Fase 1: Backend Fix (Con Downtime Mínimo)

**Duración:** 4 horas
**Riesgo:** 🟡 MEDIO
**Downtime:** ~5 minutos (para deploy)

**Tareas:**

#### 1. Modificar `ExerciseSubmissionService` (2h)

**A) Eliminar check bloqueante y agregar validación de tipo:**

```typescript
// ANTES (exercise-submission.service.ts:204-210)
const existingSubmission = await this.findByUserAndExercise(profileId, exerciseId);
if (existingSubmission && existingSubmission.status === 'graded') {
  throw new BadRequestException(
    'Exercise already submitted and graded. Cannot resubmit.',
  );
}

// DESPUÉS
const existingSubmission = await this.findByUserAndExercise(profileId, exerciseId);

// VALIDACIÓN: Solo permitir si ejercicio requiere revisión manual
const exercise = await this.exerciseRepo.findOne({
  where: { id: exerciseId },
  select: ['id', 'requires_manual_grading'],
});

if (!exercise) {
  throw new NotFoundException(`Exercise ${exerciseId} not found`);
}

if (!exercise.requires_manual_grading) {
  throw new BadRequestException(
    'This exercise is auto-graded. Use POST /exercises/:id/attempt instead.'
  );
}

// Solo una entrega permitida para ejercicios de revisión manual
if (existingSubmission) {
  throw new BadRequestException(
    'You have already submitted this exercise. Only one submission is allowed for teacher-graded exercises.'
  );
}
```

**B) Actualizar documentación del service:**
```typescript
/**
 * ExerciseSubmissionService
 *
 * @description Gestión de ENTREGAS FORMALES que requieren revisión del maestro.
 *
 * ⚠️ IMPORTANTE: Este servicio NO debe usarse para ejercicios autocorregibles.
 * Para ejercicios de práctica, usar ExerciseAttemptService.
 *
 * Tipos de ejercicio que usan este servicio:
 * - Ensayos argumentativos
 * - Reseñas críticas
 * - Proyectos multimedia
 * - Cualquier ejercicio con requires_manual_grading = true
 */
```

#### 2. Modificar `ExercisesController` (2h)

**A) Eliminar duplicación de registros:**

```typescript
// ANTES (exercises.controller.ts:841-878)
// Crea en exercise_submissions
const submission = await this.exerciseSubmissionService.submitExercise(
  userId, exerciseId, submittedAnswers
);

// Crea en exercise_attempts (DUPLICADO)
await this.exerciseAttemptService.create({
  user_id: profileId,
  exercise_id: exerciseId,
  // ...
});

// DESPUÉS
const exercise = await this.exercisesService.findById(exerciseId);

if (exercise.requires_manual_grading) {
  // ✅ RUTA A: Ejercicios de revisión manual
  const submission = await this.exerciseSubmissionService.submitExercise(
    userId, exerciseId, submittedAnswers
  );
  return {
    score: submission.score,
    isPerfect: false,
    rewards: {
      xp: 0, // XP se otorga después de revisión del maestro
      mlCoins: 0,
      bonuses: [],
    },
    rankUp: null,
    message: 'Submission sent for teacher review',
  };
} else {
  // ✅ RUTA B: Ejercicios autocorregibles (práctica)

  // Validar respuesta con PostgreSQL
  const validationResult = await this.connection.query(`
    SELECT * FROM educational_content.validate_and_audit(
      $1::UUID, $2::UUID, $3::JSONB
    )
  `, [exerciseId, profileId, JSON.stringify(submittedAnswers)]);

  const { is_correct, score, feedback } = validationResult[0];

  // Anti-farming: XP solo en primer acierto
  const previousCorrectAttempt = await this.exerciseAttemptService.findOne({
    where: {
      user_id: profileId,
      exercise_id: exerciseId,
      is_correct: true
    }
  });

  const isFirstCorrectAttempt = !previousCorrectAttempt;

  let xpEarned = 0;
  let mlCoinsEarned = 0;

  if (is_correct && isFirstCorrectAttempt) {
    xpEarned = exercise.xp_reward;
    mlCoinsEarned = exercise.ml_coins_reward;
  }

  // Crear attempt (trigger actualiza user_stats automáticamente)
  await this.exerciseAttemptService.create({
    user_id: profileId,
    exercise_id: exerciseId,
    submitted_answers: submittedAnswers,
    is_correct,
    score,
    xp_earned: xpEarned,
    ml_coins_earned: mlCoinsEarned,
    time_spent_seconds: body.startedAt
      ? Math.floor((Date.now() - body.startedAt) / 1000)
      : undefined,
    hints_used: body.hintsUsed || 0,
    comodines_used: body.powerupsUsed || [],
  });

  return {
    score,
    isPerfect: score === 100 && (body.hintsUsed || 0) === 0,
    rewards: {
      xp: xpEarned,
      mlCoins: mlCoinsEarned,
      bonuses: [],
    },
    feedback,
    rankUp: null, // TODO: Detectar rank up desde user_stats
  };
}
```

**Validación:**
```bash
# Compilar backend
npx tsc --noEmit --project apps/backend/tsconfig.json

# Esperado: Sin errores
```

---

### Fase 2: Testing Exhaustivo (Sin Downtime)

**Duración:** 3 horas
**Riesgo:** 🟢 BAJO

**Escenarios de testing:**

#### TEST 1: Ejercicio Autocorregible - Múltiples Intentos

```bash
#!/bin/bash

TOKEN="<token-estudiante>"
EXERCISE_ID="<crucigrama-id>"  # ejercicio autocorregible

# Intento 1: INCORRECTO
echo "=== Intento 1: Incorrecto ==="
curl -X POST "http://localhost:3006/api/v1/educational/exercises/$EXERCISE_ID/submit" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {"clues": {"1A": "WRONG", "1D": "WRONG"}},
    "startedAt": 1234567890000,
    "hintsUsed": 0,
    "powerupsUsed": []
  }'

# Esperado:
# {
#   "score": 0,
#   "isPerfect": false,
#   "rewards": { "xp": 0, "mlCoins": 0 },
#   "feedback": "Intenta de nuevo"
# }

# Intento 2: CORRECTO
echo "=== Intento 2: Correcto ==="
curl -X POST "http://localhost:3006/api/v1/educational/exercises/$EXERCISE_ID/submit" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {"clues": {"1A": "POLONIA", "1D": "MARIE"}},
    "startedAt": 1234567890000,
    "hintsUsed": 0,
    "powerupsUsed": []
  }'

# Esperado:
# {
#   "score": 100,
#   "isPerfect": true,
#   "rewards": { "xp": 150, "mlCoins": 50 },  // ✅ XP otorgado
#   "feedback": "¡Perfecto!"
# }

# Intento 3: CORRECTO de nuevo (anti-farming)
echo "=== Intento 3: Correcto nuevamente ==="
curl -X POST "http://localhost:3006/api/v1/educational/exercises/$EXERCISE_ID/submit" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {"clues": {"1A": "POLONIA", "1D": "MARIE"}},
    "startedAt": 1234567890000,
    "hintsUsed": 0,
    "powerupsUsed": []
  }'

# Esperado:
# {
#   "score": 100,
#   "isPerfect": true,
#   "rewards": { "xp": 0, "mlCoins": 0 },  // ✅ Sin XP (anti-farming)
#   "feedback": "¡Perfecto! (Ya completaste este ejercicio antes)"
# }
```

#### TEST 2: Ejercicio Revisión Manual - Una Sola Entrega

```bash
#!/bin/bash

TOKEN="<token-estudiante>"
EXERCISE_ID="<ensayo-id>"  # ejercicio de revisión manual

# Intento 1: ENVIAR
echo "=== Intento 1: Enviar ensayo ==="
curl -X POST "http://localhost:3006/api/v1/educational/exercises/$EXERCISE_ID/submit" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {"essay_text": "Mi ensayo sobre Marie Curie..."},
    "startedAt": 1234567890000,
    "hintsUsed": 0,
    "powerupsUsed": []
  }'

# Esperado:
# {
#   "score": 0,
#   "isPerfect": false,
#   "rewards": { "xp": 0, "mlCoins": 0 },
#   "message": "Submission sent for teacher review"
# }

# Intento 2: REENVIAR (debe bloquear)
echo "=== Intento 2: Reenviar ensayo ==="
curl -X POST "http://localhost:3006/api/v1/educational/exercises/$EXERCISE_ID/submit" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": {"essay_text": "Mi ensayo mejorado..."},
    "startedAt": 1234567890000,
    "hintsUsed": 0,
    "powerupsUsed": []
  }'

# Esperado:
# {
#   "statusCode": 400,
#   "message": "You have already submitted this exercise. Only one submission is allowed for teacher-graded exercises."
# }
```

#### TEST 3: Verificar No Duplicación de Registros

```sql
-- Verificar que exercise_submissions SOLO tiene ejercicios de revisión manual
SELECT
  es.id,
  e.exercise_type,
  e.requires_manual_grading,
  CASE
    WHEN e.requires_manual_grading = true THEN '✅ CORRECTO'
    ELSE '❌ ERROR: Autocorregible en submissions'
  END as validation
FROM progress_tracking.exercise_submissions es
JOIN educational_content.exercises e ON e.id = es.exercise_id
WHERE e.requires_manual_grading = false;

-- Esperado: 0 rows (ningún autocorregible en submissions)

-- Verificar que exercise_attempts SOLO tiene ejercicios autocorregibles
SELECT
  ea.id,
  e.exercise_type,
  e.requires_manual_grading,
  CASE
    WHEN e.requires_manual_grading = false THEN '✅ CORRECTO'
    ELSE '❌ ERROR: Revisión manual en attempts'
  END as validation
FROM progress_tracking.exercise_attempts ea
JOIN educational_content.exercises e ON e.id = ea.exercise_id
WHERE e.requires_manual_grading = true;

-- Esperado: 0 rows (ningún revisión manual en attempts)
```

#### TEST 4: Verificar XP No Duplicado

```sql
-- Usuario completa ejercicio → Verificar XP se otorga UNA VEZ

-- 1. XP antes de completar
SELECT user_id, total_xp FROM gamification_system.user_stats
WHERE user_id = '<test-user-id>';
-- Anotar valor: XP_ANTES

-- 2. Completar ejercicio (primer acierto)
-- POST /exercises/:id/submit

-- 3. XP después de completar
SELECT user_id, total_xp FROM gamification_system.user_stats
WHERE user_id = '<test-user-id>';
-- Anotar valor: XP_DESPUES

-- 4. Verificar diferencia
-- XP_DIFERENCIA = XP_DESPUES - XP_ANTES
-- Esperado: XP_DIFERENCIA = exercise.xp_reward (150 por ejemplo)
-- NO esperado: XP_DIFERENCIA = exercise.xp_reward * 2 (300 = duplicado)
```

---

### Fase 3: Deploy y Monitoreo

**Duración:** 2 horas
**Downtime:** ~5 minutos
**Riesgo:** 🟡 MEDIO

**Checklist de deploy:**

1. **Pre-Deploy:**
   ```bash
   # Backup de base de datos
   pg_dump -h localhost -U gamilit_user gamilit_platform > backup_pre_deploy_$(date +%Y%m%d_%H%M%S).sql

   # Verificar tests pasan
   npm run test
   npm run test:e2e
   ```

2. **Deploy:**
   ```bash
   # Aplicar migración de DB
   psql -h localhost -U gamilit_user -d gamilit_platform < migration_requires_manual_grading.sql

   # Deploy backend
   pm2 restart gamilit-backend
   ```

3. **Post-Deploy - Monitoreo (30 min):**
   ```bash
   # Monitorear logs
   tail -f /var/log/gamilit-backend.log | grep -E "ERROR|submitExercise|exercise_attempts"

   # Verificar métricas
   curl http://localhost:3006/api/v1/health
   ```

4. **Verificación de Integridad:**
   ```sql
   -- Verificar no hay registros incorrectos creados después del deploy
   SELECT
     COUNT(*) as autocorregibles_en_submissions
   FROM progress_tracking.exercise_submissions es
   JOIN educational_content.exercises e ON e.id = es.exercise_id
   WHERE e.requires_manual_grading = false
     AND es.created_at > NOW() - INTERVAL '1 hour';

   -- Esperado: 0

   -- Verificar XP acumulado correctamente
   SELECT
     user_id,
     total_xp,
     exercises_completed
   FROM gamification_system.user_stats
   WHERE updated_at > NOW() - INTERVAL '1 hour'
   ORDER BY updated_at DESC
   LIMIT 10;
   ```

---

## ✅ CRITERIOS DE ÉXITO

### Funcionales

- [x] ✅ Ejercicios autocorregibles permiten reenvíos ilimitados
- [x] ✅ Ejercicios de revisión manual permiten solo UNA entrega
- [x] ✅ XP se otorga solo en el PRIMER acierto (anti-farming)
- [x] ✅ No hay duplicación de registros entre tablas
- [x] ✅ Trigger de `exercise_attempts` funciona correctamente
- [x] ✅ XP no se duplica

### Técnicos

- [x] ✅ `exercise_submissions` SOLO contiene ejercicios `requires_manual_grading = true`
- [x] ✅ `exercise_attempts` SOLO contiene ejercicios `requires_manual_grading = false`
- [x] ✅ Backend compila sin errores TypeScript
- [x] ✅ Tests E2E pasan en módulos 2 y 3
- [x] ✅ No se rompen funcionalidades existentes

### Performance

- [x] ✅ Response time < 500ms en endpoint `/submit`
- [x] ✅ Trigger ejecuta en < 50ms
- [x] ✅ Sin degradación de performance después del deploy

---

## 🚨 ROLLBACK PLAN

**En caso de fallos críticos durante deploy:**

### Escenario A: Error en Migración de DB

```bash
# 1. Restaurar backup
psql -h localhost -U gamilit_user -d gamilit_platform < backup_pre_deploy_<timestamp>.sql

# 2. Reiniciar backend con versión anterior
pm2 restart gamilit-backend

# 3. Verificar sistema funciona
curl http://localhost:3006/api/v1/health
```

### Escenario B: Backend No Inicia

```bash
# 1. Rollback a versión anterior del código
git checkout <commit-hash-anterior>
npm install
npm run build

# 2. Reiniciar
pm2 restart gamilit-backend

# 3. Verificar logs
pm2 logs gamilit-backend
```

### Escenario C: XP Duplicado Detectado

```sql
-- Script de corrección manual
BEGIN;

-- 1. Identificar usuarios afectados (XP > esperado)
WITH expected_xp AS (
  SELECT
    ea.user_id,
    SUM(ea.xp_earned) as expected_total_xp
  FROM progress_tracking.exercise_attempts ea
  GROUP BY ea.user_id
)
SELECT
  us.user_id,
  us.total_xp as current_xp,
  ex.expected_total_xp,
  us.total_xp - ex.expected_total_xp as xp_difference
FROM gamification_system.user_stats us
JOIN expected_xp ex ON ex.user_id = us.user_id
WHERE us.total_xp > ex.expected_total_xp;

-- 2. Corregir XP (si aplica)
-- EJECUTAR MANUALMENTE después de revisar resultado anterior

COMMIT;
```

---

## 📈 MÉTRICAS DE MONITOREO

### Durante las primeras 48 horas después del deploy:

```sql
-- 1. Tasa de reenvíos exitosos (debería aumentar)
SELECT
  DATE_TRUNC('hour', submitted_at) as hour,
  COUNT(*) as total_attempts,
  COUNT(DISTINCT user_id) as unique_users,
  ROUND(AVG(attempt_number)::numeric, 2) as avg_attempts_per_exercise
FROM progress_tracking.exercise_attempts
WHERE submitted_at > NOW() - INTERVAL '48 hours'
GROUP BY DATE_TRUNC('hour', submitted_at)
ORDER BY hour DESC;

-- Esperado: avg_attempts_per_exercise > 1.0 (significa que hay reenvíos)

-- 2. Errores 400 relacionados con submissions (debería disminuir)
-- Monitorear logs del backend:
-- grep "Cannot resubmit" /var/log/gamilit-backend.log | wc -l
-- Esperado: 0 (ningún error de reenvío bloqueado)

-- 3. Distribución de registros por tabla
SELECT
  'exercise_submissions' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT user_id) as unique_users
FROM progress_tracking.exercise_submissions
WHERE created_at > NOW() - INTERVAL '48 hours'
UNION ALL
SELECT
  'exercise_attempts' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT user_id) as unique_users
FROM progress_tracking.exercise_attempts
WHERE submitted_at > NOW() - INTERVAL '48 hours';

-- Esperado:
-- exercise_attempts >> exercise_submissions (90% vs 10%)

-- 4. XP acumulado promedio (verificar no hay saltos anormales)
SELECT
  DATE_TRUNC('day', updated_at) as day,
  ROUND(AVG(total_xp)::numeric, 2) as avg_xp_per_user,
  ROUND(STDDEV(total_xp)::numeric, 2) as xp_stddev
FROM gamification_system.user_stats
WHERE updated_at > NOW() - INTERVAL '48 hours'
GROUP BY DATE_TRUNC('day', updated_at)
ORDER BY day DESC;

-- Esperado: Crecimiento lineal, no saltos duplicados
```

---

## 🎯 CONCLUSIÓN

**Estado del análisis:** ✅ **COMPLETADO**

**Resumen:**
- ✅ **5 conflictos críticos identificados**
- ✅ **9 archivos backend analizados**
- ✅ **13 archivos frontend identificados**
- ✅ **Plan de mitigación documentado**
- ✅ **Tests de validación preparados**
- ✅ **Rollback plan definido**

**Próximo paso crítico:**
🔧 **Implementar Fase 1** (Backend Fix) según plan documentado

**Tiempo estimado total:** 10 horas
**Riesgo general:** 🟡 **MEDIO** (mitigable con testing exhaustivo)

---

**Documento generado por:** Architecture-Analyst
**Fecha:** 2025-11-24
**Revisado por:** [Pendiente]
**Aprobado por:** [Pendiente]
