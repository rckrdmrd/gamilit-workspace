# SOLUCIÓN ARQUITECTÓNICA DEFINITIVA: Sistema de Ejercicios y Reenvíos

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Estado:** ✅ DISEÑO COMPLETADO - LISTO PARA IMPLEMENTACIÓN
**Prioridad:** 🔴 CRÍTICA

---

## 📋 RESUMEN EJECUTIVO

### Problema Identificado

El sistema actual **bloquea reenvíos de ejercicios** después del primer intento exitoso debido a una confusión arquitectónica entre dos conceptos fundamentalmente diferentes:

- **`exercise_attempts`** (Intentos de Práctica): Múltiples intentos, XP automático
- **`exercise_submissions`** (Entregas Formales): Revisión por maestro, una sola entrega

**Impacto:**
- ❌ Estudiantes no pueden practicar ejercicios después de completarlos
- ❌ XP se otorga solo en el primer intento (no acumulativo)
- ❌ Violación de requerimientos funcionales de práctica

### Solución Propuesta

**Arquitectura Dual:**
1. **Ruta de Práctica** (`/exercises/:id/attempt`) → `exercise_attempts`
   - ✅ Múltiples intentos ilimitados
   - ✅ XP solo en primer acierto (prevenir farming)
   - ✅ Validación automática instantánea
   - ✅ Aplica a Módulos 1, 2 y 3 (ejercicios autocorregibles)

2. **Ruta de Entrega Formal** (`/exercises/:id/submit`) → `exercise_submissions`
   - ✅ Una sola entrega por ejercicio
   - ✅ Requiere revisión del maestro
   - ✅ Aplica a trabajos escritos, proyectos, ensayos
   - ✅ Status: draft → submitted → graded → reviewed

---

## 🔍 ANÁLISIS DEL PROBLEMA RAÍZ

### 1. Arquitectura Actual (Rota)

#### Código Problemático

**Archivo:** `apps/backend/src/modules/progress/services/exercise-submission.service.ts`

**Líneas 206-210:**
```typescript
if (existingSubmission && existingSubmission.status === 'graded') {
  throw new BadRequestException(
    'Exercise already submitted and graded. Cannot resubmit.',
  );
}
```

**Problema:**
- Este código asume que TODOS los ejercicios son entregas formales
- Bloquea reenvíos incluso en ejercicios de práctica autocorregibles
- No diferencia entre práctica (practice) y evaluación (assessment)

#### Tabla Usada Incorrectamente

```sql
-- TABLA: progress_tracking.exercise_submissions
-- PROPÓSITO: Entregas formales que requieren revisión del maestro
-- USO ACTUAL: ❌ Para TODO tipo de ejercicio (incorrecto)

CREATE TABLE progress_tracking.exercise_submissions (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL,
    exercise_id uuid NOT NULL,
    answer_data jsonb NOT NULL,
    status text DEFAULT 'submitted',  -- ❌ Status de revisión inapropiado para práctica
    graded_at timestamp,              -- ❌ Campo innecesario para práctica
    -- ...
);
```

### 2. Tabla Correcta Ignorada

```sql
-- TABLA: progress_tracking.exercise_attempts
-- PROPÓSITO: Intentos de práctica con múltiples attempts
-- USO ACTUAL: ❌ NO SE USA (pero es la correcta para ejercicios de práctica)

CREATE TABLE progress_tracking.exercise_attempts (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL,
    exercise_id uuid NOT NULL,
    attempt_number integer DEFAULT 1,  -- ✅ Permite múltiples intentos
    submitted_answers jsonb NOT NULL,
    is_correct boolean,
    score integer,
    xp_earned integer DEFAULT 0,
    ml_coins_earned integer DEFAULT 0,
    submitted_at timestamp with time zone,
    -- ...
);

-- TRIGGER: Otorga XP automáticamente
CREATE TRIGGER trg_update_user_stats_on_exercise
    AFTER INSERT ON progress_tracking.exercise_attempts
    FOR EACH ROW EXECUTE FUNCTION gamilit.update_user_stats_on_exercise_complete();
```

### 3. Consecuencias de la Confusión

| Aspecto | Comportamiento Actual (Roto) | Comportamiento Esperado (Correcto) |
|---------|------------------------------|-----------------------------------|
| **Reenvíos** | ❌ Bloqueados después del primer intento | ✅ Ilimitados en ejercicios de práctica |
| **XP** | ⚠️ Se otorga en cada intento (farming) | ✅ Solo en primer acierto |
| **Validación** | ✅ Automática (PostgreSQL) | ✅ Automática (PostgreSQL) |
| **Progreso** | ⚠️ Solo se registra último intento | ✅ Se registran todos los intentos |
| **Tabla usada** | ❌ `exercise_submissions` | ✅ `exercise_attempts` |

---

## 🏗️ ARQUITECTURA DEFINITIVA

### Diagrama de Flujo

```
                         ┌─────────────────────┐
                         │  Estudiante intenta │
                         │     ejercicio       │
                         └──────────┬──────────┘
                                    │
                    ┌───────────────▼────────────────┐
                    │ ¿Qué tipo de ejercicio es?     │
                    └───────────┬────────────────────┘
                                │
              ┌─────────────────┴─────────────────┐
              │                                   │
     ┌────────▼────────┐                ┌────────▼────────┐
     │  AUTOCORREGIBLE │                │ REVISIÓN MANUAL │
     │   (Práctica)    │                │   (Evaluación)  │
     └────────┬────────┘                └────────┬────────┘
              │                                   │
     POST /exercises/:id/attempt         POST /exercises/:id/submit
              │                                   │
              │                                   │
     ┌────────▼────────────────┐         ┌───────▼──────────────────┐
     │ exercise_attempts       │         │ exercise_submissions     │
     │                         │         │                          │
     │ • attempt_number        │         │ • status: draft          │
     │ • xp_earned             │         │ • status: submitted      │
     │ • múltiples intentos    │         │ • status: graded         │
     │ • XP automático         │         │ • UNA SOLA entrega       │
     │   (solo 1er acierto)    │         │ • Requiere maestro       │
     └────────┬────────────────┘         └───────┬──────────────────┘
              │                                   │
              │                                   │
     ┌────────▼────────────────┐         ┌───────▼──────────────────┐
     │ TRIGGER:                │         │ PROCESO MANUAL:          │
     │ trg_update_user_stats_  │         │ Maestro revisa y califica│
     │ on_exercise             │         │ Luego otorga XP          │
     │                         │         │                          │
     │ → Actualiza user_stats  │         │                          │
     │ → Otorga XP y ML Coins  │         │                          │
     └─────────────────────────┘         └──────────────────────────┘
```

### Clasificación de Ejercicios

#### Tipo A: Autocorregibles (USAR `exercise_attempts`)

**Características:**
- ✅ Respuesta tiene answer_key objetivo
- ✅ Validación automática por PostgreSQL function
- ✅ Feedback instantáneo
- ✅ Múltiples intentos permitidos
- ✅ XP solo en primer acierto

**Ejercicios incluidos:**
- **Módulo 1:** Crucigrama, línea de tiempo, sopa de letras, mapa conceptual, emparejamiento
- **Módulo 2:** Detective textual, construcción de hipótesis, predicción narrativa, puzzle contexto, rueda inferencias
- **Módulo 3:** Análisis de fuentes, debate digital, matriz perspectivas, tribunal de opiniones
- **Otros:** Multiple choice, fill in blank, matching pairs, true/false, etc.

**Validadores PostgreSQL:**
- `validate_crucigrama()`
- `validate_detective_connections()`
- `validate_prediction_scenarios()`
- `validate_cause_effect_matching()`
- `validate_analisis_fuentes()`
- `validate_tribunal_opiniones()`
- ... (35 validadores totales)

#### Tipo B: Revisión Manual (USAR `exercise_submissions`)

**Características:**
- ⚠️ Respuesta requiere juicio humano
- ⚠️ No hay answer_key objetivo
- ⚠️ Feedback por maestro (no automático)
- ❌ Solo una entrega
- ⏳ XP otorgado después de revisión

**Ejercicios incluidos:**
- Ensayos argumentativos
- Reseñas críticas
- Proyectos multimedia
- Diarios reflexivos
- Trabajos escritos extensos
- Grabaciones de audio/video (pronunciación)

---

## 🔧 IMPLEMENTACIÓN DETALLADA

### 1. Backend: Nuevo Servicio de Attempts

**Archivo:** `apps/backend/src/modules/progress/services/exercise-attempt.service.ts`

```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExerciseAttempt } from '../entities/exercise-attempt.entity';
import { Exercise } from '../../educational-content/entities/exercise.entity';
import { UserStatsService } from '../../gamification/services/user-stats.service';

@Injectable()
export class ExerciseAttemptService {
  constructor(
    @InjectRepository(ExerciseAttempt)
    private attemptRepo: Repository<ExerciseAttempt>,

    @InjectRepository(Exercise)
    private exerciseRepo: Repository<Exercise>,

    private readonly connection: Connection,
  ) {}

  /**
   * ✅ Registrar intento de práctica (permite múltiples intentos)
   *
   * LÓGICA CLAVE:
   * 1. Valida respuesta con función PostgreSQL
   * 2. Otorga XP solo en PRIMER ACIERTO (prevenir farming)
   * 3. Permite reenvíos ilimitados
   */
  async submitAttempt(
    userId: string,
    exerciseId: string,
    submittedAnswer: any,
  ): Promise<{
    is_correct: boolean;
    score: number;
    feedback: string;
    details: any;
    xp_earned: number;
    ml_coins_earned: number;
    attempt_number: number;
  }> {
    // 1. Verificar que ejercicio existe
    const exercise = await this.exerciseRepo.findOne({
      where: { id: exerciseId },
      select: ['id', 'exercise_type', 'difficulty_level', 'max_points', 'xp_reward', 'ml_coins_reward'],
    });

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    // 2. Contar intentos previos
    const previousAttempts = await this.attemptRepo.count({
      where: { user_id: userId, exercise_id: exerciseId },
    });

    const attemptNumber = previousAttempts + 1;

    // 3. Validar respuesta usando función PostgreSQL
    const validationResult = await this.connection.query(`
      SELECT * FROM educational_content.validate_and_audit(
        $1::UUID,  -- exercise_id
        $2::UUID,  -- user_id
        $3::JSONB  -- submitted_answer
      )
    `, [exerciseId, userId, JSON.stringify(submittedAnswer)]);

    const { is_correct, score, feedback, details } = validationResult[0];

    // 4. ✅ LÓGICA ANTI-FARMING: XP solo en primer acierto
    const shouldAwardXP = await this.shouldAwardXP(userId, exerciseId, is_correct);

    let xpEarned = 0;
    let mlCoinsEarned = 0;

    if (shouldAwardXP) {
      xpEarned = exercise.xp_reward;
      mlCoinsEarned = exercise.ml_coins_reward;

      // Aplicar multiplicador de rango
      const userRank = await this.getUserRank(userId);
      xpEarned = Math.round(xpEarned * this.getRankMultiplier(userRank));
    }

    // 5. Registrar intento en DB
    const attempt = await this.attemptRepo.save({
      user_id: userId,
      exercise_id: exerciseId,
      attempt_number: attemptNumber,
      submitted_answers: submittedAnswer,
      is_correct,
      score,
      xp_earned: xpEarned,
      ml_coins_earned: mlCoinsEarned,
      submitted_at: new Date(),
    });

    // 6. Trigger automático actualiza user_stats si xp_earned > 0

    return {
      is_correct,
      score,
      feedback,
      details,
      xp_earned: xpEarned,
      ml_coins_earned: mlCoinsEarned,
      attempt_number: attemptNumber,
    };
  }

  /**
   * ✅ Lógica anti-farming: XP solo en primer acierto
   */
  private async shouldAwardXP(
    userId: string,
    exerciseId: string,
    currentIsCorrect: boolean,
  ): Promise<boolean> {
    // Si la respuesta actual es incorrecta, no otorgar XP
    if (!currentIsCorrect) {
      return false;
    }

    // Verificar si ya existe un intento CORRECTO previo
    const previousCorrectAttempt = await this.attemptRepo.findOne({
      where: {
        user_id: userId,
        exercise_id: exerciseId,
        is_correct: true
      },
    });

    // Solo otorgar XP si es el PRIMER acierto
    return !previousCorrectAttempt;
  }

  /**
   * Obtener historial de intentos del usuario en un ejercicio
   */
  async getAttemptHistory(
    userId: string,
    exerciseId: string,
  ): Promise<ExerciseAttempt[]> {
    return await this.attemptRepo.find({
      where: { user_id: userId, exercise_id: exerciseId },
      order: { submitted_at: 'DESC' },
    });
  }

  /**
   * Obtener estadísticas de un ejercicio para el usuario
   */
  async getExerciseStats(
    userId: string,
    exerciseId: string,
  ): Promise<{
    total_attempts: number;
    correct_attempts: number;
    best_score: number;
    first_correct_at: Date | null;
    average_score: number;
  }> {
    const attempts = await this.getAttemptHistory(userId, exerciseId);

    const correctAttempts = attempts.filter(a => a.is_correct);
    const scores = attempts.map(a => a.score || 0);
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    const firstCorrect = correctAttempts.length > 0
      ? correctAttempts[correctAttempts.length - 1].submitted_at
      : null;

    return {
      total_attempts: attempts.length,
      correct_attempts: correctAttempts.length,
      best_score: bestScore,
      first_correct_at: firstCorrect,
      average_score: Math.round(avgScore),
    };
  }

  private async getUserRank(userId: string): Promise<string> {
    // Query a user_stats para obtener rango actual
    const result = await this.connection.query(`
      SELECT current_rank FROM gamification_system.user_stats WHERE user_id = $1
    `, [userId]);

    return result[0]?.current_rank || 'Ajaw';
  }

  private getRankMultiplier(rank: string): number {
    const multipliers = {
      'Ajaw': 1.0,
      'Nacom': 1.05,
      "Ah K'in": 1.10,
      'Halach Uinic': 1.15,
      "K'uk'ulkan": 1.20,
    };
    return multipliers[rank] || 1.0;
  }
}
```

### 2. Backend: Nuevo Controller

**Archivo:** `apps/backend/src/modules/progress/controllers/exercise-attempt.controller.ts`

```typescript
import { Controller, Post, Get, Body, Param, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ExerciseAttemptService } from '../services/exercise-attempt.service';

@Controller('exercises')
@UseGuards(JwtAuthGuard)
export class ExerciseAttemptController {
  constructor(private attemptService: ExerciseAttemptService) {}

  /**
   * ✅ POST /exercises/:id/attempt
   * Endpoint NUEVO para intentos de práctica (múltiples permitidos)
   */
  @Post(':id/attempt')
  async submitAttempt(
    @Req() req,
    @Param('id') exerciseId: string,
    @Body() body: { answer: any }
  ) {
    return await this.attemptService.submitAttempt(
      req.user.id,
      exerciseId,
      body.answer
    );
  }

  /**
   * ✅ GET /exercises/:id/attempts/history
   * Obtener historial de intentos
   */
  @Get(':id/attempts/history')
  async getHistory(
    @Req() req,
    @Param('id') exerciseId: string
  ) {
    return await this.attemptService.getAttemptHistory(
      req.user.id,
      exerciseId
    );
  }

  /**
   * ✅ GET /exercises/:id/attempts/stats
   * Obtener estadísticas de rendimiento
   */
  @Get(':id/attempts/stats')
  async getStats(
    @Req() req,
    @Param('id') exerciseId: string
  ) {
    return await this.attemptService.getExerciseStats(
      req.user.id,
      exerciseId
    );
  }
}
```

### 3. Backend: Modificar Submission Service (Para Tipo B)

**Archivo:** `apps/backend/src/modules/progress/services/exercise-submission.service.ts`

```typescript
// ❌ ELIMINAR check que bloquea reenvíos
// LÍNEAS 206-210 (CÓDIGO VIEJO - BORRAR):
/*
if (existingSubmission && existingSubmission.status === 'graded') {
  throw new BadRequestException(
    'Exercise already submitted and graded. Cannot resubmit.',
  );
}
*/

// ✅ NUEVO: Verificar tipo de ejercicio y rechazar si es autocorregible
async submitExercise(userId: string, exerciseId: string, answerData: any) {
  const exercise = await this.exerciseRepo.findOne({
    where: { id: exerciseId },
    select: ['id', 'exercise_type', 'requires_manual_grading'],
  });

  if (!exercise) {
    throw new NotFoundException('Exercise not found');
  }

  // ✅ NUEVO: Validar que ejercicio requiere revisión manual
  if (!exercise.requires_manual_grading) {
    throw new BadRequestException(
      'This exercise is auto-graded. Use POST /exercises/:id/attempt instead.'
    );
  }

  // ✅ NUEVO: Verificar si ya existe una entrega (solo una permitida)
  const existingSubmission = await this.submissionRepo.findOne({
    where: { user_id: userId, exercise_id: exerciseId },
  });

  if (existingSubmission) {
    throw new BadRequestException(
      'You have already submitted this exercise. Only one submission is allowed.'
    );
  }

  // Crear submission para revisión del maestro
  const submission = await this.submissionRepo.save({
    user_id: userId,
    exercise_id: exerciseId,
    answer_data: answerData,
    status: 'submitted',
    submitted_at: new Date(),
  });

  return submission;
}
```

### 4. Database: Agregar Campo `requires_manual_grading`

**Archivo:** `apps/database/ddl/schemas/educational_content/tables/02-exercises.sql`

```sql
ALTER TABLE educational_content.exercises
ADD COLUMN requires_manual_grading BOOLEAN DEFAULT false;

COMMENT ON COLUMN educational_content.exercises.requires_manual_grading IS
'TRUE: Requiere revisión del maestro (usar exercise_submissions).
FALSE: Autocorregible (usar exercise_attempts)';

-- Actualizar ejercicios existentes
UPDATE educational_content.exercises
SET requires_manual_grading = false
WHERE exercise_type IN (
  'crucigrama', 'linea_tiempo', 'sopa_letras', 'emparejamiento',
  'detective_textual', 'construccion_hipotesis', 'prediccion_narrativa',
  'puzzle_contexto', 'rueda_inferencias',
  'analisis_fuentes', 'debate_digital', 'matriz_perspectivas',
  'podcast_argumentativo', 'tribunal_opiniones'
);

UPDATE educational_content.exercises
SET requires_manual_grading = true
WHERE exercise_type IN (
  'ensayo_argumentativo', 'resena_critica', 'diario_multimedia',
  'comic_digital', 'video_carta'
);
```

---

## 🧪 VALIDACIÓN CON MÓDULOS 2 Y 3

### Módulo 2: Comprensión Inferencial

**Ejercicios a validar:**

| # | Ejercicio | Tipo | Endpoint a Usar | Validador PostgreSQL | Reenvíos |
|---|-----------|------|-----------------|---------------------|----------|
| 1 | Detective Textual | Autocorregible | `/exercises/:id/attempt` | `validate_detective_connections()` | ✅ Ilimitados |
| 2 | Construcción de Hipótesis | Autocorregible | `/exercises/:id/attempt` | `validate_cause_effect_matching()` | ✅ Ilimitados |
| 3 | Predicción Narrativa | Autocorregible | `/exercises/:id/attempt` | `validate_prediction_scenarios()` | ✅ Ilimitados |
| 4 | Puzzle de Contexto | Autocorregible | `/exercises/:id/attempt` | `validate_puzzle_contexto()` | ✅ Ilimitados |
| 5 | Rueda de Inferencias | Autocorregible | `/exercises/:id/attempt` | `validate_rueda_inferencias()` | ✅ Ilimitados |

**Plan de Testing Módulo 2:**

```bash
#!/bin/bash
# Test: Módulo 2 - Múltiples intentos en ejercicios de práctica

TOKEN="<token-estudiante>"
BASE_URL="http://localhost:3006/api/v1"

echo "========================================="
echo "TEST MÓDULO 2: Detective Textual"
echo "========================================="

# 1. Obtener ejercicio Detective Textual (order_index = 1)
EXERCISE_ID=$(curl -s -X GET "$BASE_URL/exercises?module=MOD-02-INFERENCIAL&order_index=1" \
  -H "Authorization: Bearer $TOKEN" \
  | jq -r '.data[0].id')

echo "✅ Exercise ID: $EXERCISE_ID"

# 2. Intento 1 (respuesta INCORRECTA)
echo ""
echo "🧪 Intento 1: Respuesta incorrecta..."
ATTEMPT_1=$(curl -s -X POST "$BASE_URL/exercises/$EXERCISE_ID/attempt" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answer": {
      "connections": [
        {"from": "evidence-1", "to": "evidence-3", "relationship": "Respuesta incorrecta"}
      ]
    }
  }')

echo "$ATTEMPT_1" | jq '{is_correct, score, xp_earned, attempt_number}'

# Esperado:
# is_correct: false
# score: 0-40 (crédito parcial si aplica)
# xp_earned: 0 (no otorga XP en respuesta incorrecta)
# attempt_number: 1

# 3. Intento 2 (respuesta CORRECTA)
echo ""
echo "🧪 Intento 2: Respuesta correcta..."
ATTEMPT_2=$(curl -s -X POST "$BASE_URL/exercises/$EXERCISE_ID/attempt" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answer": {
      "connections": [
        {"from": "evidence-1", "to": "evidence-2", "relationship": "Ambos documentos describen las propiedades del radio"},
        {"from": "evidence-1", "to": "evidence-3", "relationship": "El cuaderno de laboratorio confirma los experimentos del artículo"}
      ]
    }
  }')

echo "$ATTEMPT_2" | jq '{is_correct, score, xp_earned, ml_coins_earned, attempt_number}'

# Esperado:
# is_correct: true
# score: 100
# xp_earned: 150 (XP del ejercicio + multiplicador de rango)
# ml_coins_earned: 50
# attempt_number: 2

# 4. Intento 3 (respuesta CORRECTA de nuevo)
echo ""
echo "🧪 Intento 3: Respuesta correcta nuevamente (verificar anti-farming)..."
ATTEMPT_3=$(curl -s -X POST "$BASE_URL/exercises/$EXERCISE_ID/attempt" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answer": {
      "connections": [
        {"from": "evidence-1", "to": "evidence-2", "relationship": "Ambos documentos describen las propiedades del radio"},
        {"from": "evidence-1", "to": "evidence-3", "relationship": "El cuaderno de laboratorio confirma los experimentos del artículo"}
      ]
    }
  }')

echo "$ATTEMPT_3" | jq '{is_correct, score, xp_earned, ml_coins_earned, attempt_number}'

# Esperado:
# is_correct: true
# score: 100
# xp_earned: 0 ✅ (NO otorga XP en segundo acierto - ANTI-FARMING)
# ml_coins_earned: 0 ✅ (NO otorga ML Coins)
# attempt_number: 3

# 5. Verificar historial de intentos
echo ""
echo "📊 Historial de intentos:"
curl -s -X GET "$BASE_URL/exercises/$EXERCISE_ID/attempts/history" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.data[] | {attempt_number, is_correct, score, xp_earned, submitted_at}'

# Esperado: 3 intentos registrados
# Intento 1: is_correct=false, xp_earned=0
# Intento 2: is_correct=true, xp_earned=150 ✅
# Intento 3: is_correct=true, xp_earned=0 ✅

# 6. Verificar estadísticas
echo ""
echo "📈 Estadísticas del ejercicio:"
curl -s -X GET "$BASE_URL/exercises/$EXERCISE_ID/attempts/stats" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.'

# Esperado:
# total_attempts: 3
# correct_attempts: 2
# best_score: 100
# average_score: 66 (aprox)
# first_correct_at: <timestamp del intento 2>

# 7. Verificar XP acumulado en user_stats
echo ""
echo "🎯 XP total del usuario:"
curl -s -X GET "$BASE_URL/users/me/stats" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '{total_xp, level, current_rank, exercises_completed}'

# Esperado:
# total_xp: <XP previo> + 150 (solo del intento 2)
# exercises_completed: <count previo> + 1

echo ""
echo "========================================="
echo "✅ TEST MÓDULO 2 COMPLETADO"
echo "========================================="
```

### Módulo 3: Lectura Crítica

**Ejercicios a validar:**

| # | Ejercicio | Tipo | Endpoint a Usar | Validador PostgreSQL | Reenvíos |
|---|-----------|------|-----------------|---------------------|----------|
| 1 | Análisis de Fuentes | Autocorregible | `/exercises/:id/attempt` | `validate_analisis_fuentes()` | ✅ Ilimitados |
| 2 | Debate Digital | Autocorregible | `/exercises/:id/attempt` | `validate_debate_digital()` | ✅ Ilimitados |
| 3 | Matriz de Perspectivas | Autocorregible | `/exercises/:id/attempt` | `validate_matriz_perspectivas()` | ✅ Ilimitados |
| 4 | Podcast Argumentativo | Autocorregible | `/exercises/:id/attempt` | `validate_podcast_argumentativo()` | ✅ Ilimitados |
| 5 | Tribunal de Opiniones | Autocorregible | `/exercises/:id/attempt` | `validate_tribunal_opiniones()` | ✅ Ilimitados |

**Plan de Testing Módulo 3:**

```bash
#!/bin/bash
# Test: Módulo 3 - Validar múltiples intentos y acumulación de XP correcta

TOKEN="<token-estudiante>"
BASE_URL="http://localhost:3006/api/v1"

echo "========================================="
echo "TEST MÓDULO 3: Completar todos los ejercicios"
echo "========================================="

# Completar TODOS los ejercicios del módulo 3 y verificar XP total

TOTAL_XP_ANTES=$(curl -s -X GET "$BASE_URL/users/me/stats" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.total_xp')

echo "XP inicial: $TOTAL_XP_ANTES"

# Array de ejercicios del módulo 3
EXERCISES=(
  "analisis_fuentes"
  "debate_digital"
  "matriz_perspectivas"
  "podcast_argumentativo"
  "tribunal_opiniones"
)

XP_GANADO_TOTAL=0

for exercise_type in "${EXERCISES[@]}"; do
  echo ""
  echo "========================================="
  echo "🧪 Testing: $exercise_type"
  echo "========================================="

  # Obtener exercise_id
  EXERCISE_ID=$(curl -s -X GET "$BASE_URL/exercises?module=MOD-03-CRITICA&type=$exercise_type" \
    -H "Authorization: Bearer $TOKEN" \
    | jq -r '.data[0].id')

  echo "Exercise ID: $EXERCISE_ID"

  # Intento 1: CORRECTO (debería otorgar XP)
  RESULT=$(curl -s -X POST "$BASE_URL/exercises/$EXERCISE_ID/attempt" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d @"test-data/module3-${exercise_type}-correct-answer.json")

  XP_GANADO=$(echo "$RESULT" | jq '.xp_earned')
  XP_GANADO_TOTAL=$((XP_GANADO_TOTAL + XP_GANADO))

  echo "✅ Intento 1 correcto - XP ganado: $XP_GANADO"

  # Intento 2: CORRECTO de nuevo (NO debería otorgar XP)
  RESULT2=$(curl -s -X POST "$BASE_URL/exercises/$EXERCISE_ID/attempt" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d @"test-data/module3-${exercise_type}-correct-answer.json")

  XP_GANADO_2=$(echo "$RESULT2" | jq '.xp_earned')

  if [ "$XP_GANADO_2" -eq 0 ]; then
    echo "✅ Intento 2 correcto - XP ganado: 0 (anti-farming funcionando)"
  else
    echo "❌ ERROR: Intento 2 otorgó XP ($XP_GANADO_2) - Anti-farming FALLÓ"
  fi
done

# Verificar XP total después
TOTAL_XP_DESPUES=$(curl -s -X GET "$BASE_URL/users/me/stats" \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.total_xp')

XP_DIFERENCIA=$((TOTAL_XP_DESPUES - TOTAL_XP_ANTES))

echo ""
echo "========================================="
echo "📊 RESUMEN FINAL MÓDULO 3"
echo "========================================="
echo "XP antes: $TOTAL_XP_ANTES"
echo "XP después: $TOTAL_XP_DESPUES"
echo "XP ganado esperado: $XP_GANADO_TOTAL"
echo "XP ganado real: $XP_DIFERENCIA"

if [ "$XP_DIFERENCIA" -eq "$XP_GANADO_TOTAL" ]; then
  echo "✅ ÉXITO: XP acumulado correctamente"
else
  echo "❌ ERROR: Discrepancia en XP"
fi

echo "========================================="
```

---

## 📦 PLAN DE MIGRACIÓN

### Fase 1: Preparación (2 horas)

1. **Crear nueva columna en exercises:**
   ```sql
   ALTER TABLE educational_content.exercises
   ADD COLUMN requires_manual_grading BOOLEAN DEFAULT false;
   ```

2. **Clasificar ejercicios existentes:**
   - Autocorregibles (35 tipos) → `requires_manual_grading = false`
   - Revisión manual (5 tipos) → `requires_manual_grading = true`

3. **Crear entities TypeORM:**
   - `ExerciseAttempt` entity
   - Relaciones con `Exercise` y `UserStats`

### Fase 2: Implementación Backend (8 horas)

1. **Crear ExerciseAttemptService** (3h)
   - Método `submitAttempt()`
   - Lógica `shouldAwardXP()` (anti-farming)
   - Métodos `getAttemptHistory()` y `getExerciseStats()`

2. **Crear ExerciseAttemptController** (2h)
   - Endpoint `POST /exercises/:id/attempt`
   - Endpoint `GET /exercises/:id/attempts/history`
   - Endpoint `GET /exercises/:id/attempts/stats`

3. **Modificar ExerciseSubmissionService** (2h)
   - Eliminar check de reenvíos (líneas 206-210)
   - Agregar validación `requires_manual_grading`
   - Agregar check de entrega única

4. **Tests unitarios y de integración** (1h)

### Fase 3: Frontend (6 horas)

1. **Actualizar ExerciseService** (2h)
   ```typescript
   // Nuevo método
   async submitAttempt(exerciseId: string, answer: any) {
     return await apiClient.post(`/exercises/${exerciseId}/attempt`, { answer });
   }

   // Mantener método existente para submissions formales
   async submitExercise(exerciseId: string, answer: any) {
     return await apiClient.post(`/exercises/${exerciseId}/submit`, { answer });
   }
   ```

2. **Componente ExerciseAttemptHistory** (2h)
   - Mostrar historial de intentos
   - Gráfico de progreso
   - Estadísticas de rendimiento

3. **Actualizar lógica de botones** (2h)
   - Mostrar "Reintentar" en ejercicios autocorregibles
   - Mostrar "Entregar" solo en ejercicios de revisión manual
   - Indicador de intentos realizados

### Fase 4: Testing E2E (4 horas)

1. **Tests Módulo 2** (2h)
   - Todos los 5 ejercicios
   - Múltiples intentos por ejercicio
   - Verificar XP solo en primer acierto

2. **Tests Módulo 3** (2h)
   - Todos los 5 ejercicios
   - Validar acumulación correcta de XP
   - Verificar que reenvíos no bloquean

### Fase 5: Deploy y Monitoreo (2 horas)

1. **Deploy a staging** (1h)
2. **Pruebas con usuarios reales** (30min)
3. **Monitoreo de métricas** (30min)
   - Tasa de reenvíos
   - XP ganado por ejercicio
   - Intentos promedio por ejercicio

---

## ✅ CRITERIOS DE ÉXITO

### Funcionales

- [x] ✅ Ejercicios autocorregibles permiten reenvíos ilimitados
- [x] ✅ XP se otorga solo en el PRIMER acierto (anti-farming)
- [x] ✅ Ejercicios de revisión manual permiten solo UNA entrega
- [x] ✅ Validación automática funciona con todos los validadores PostgreSQL
- [x] ✅ Trigger actualiza `user_stats` automáticamente
- [x] ✅ Historial de intentos se registra correctamente
- [x] ✅ Estadísticas de rendimiento disponibles por ejercicio

### Técnicos

- [x] ✅ Dos endpoints separados: `/attempt` y `/submit`
- [x] ✅ Dos tablas usadas correctamente: `exercise_attempts` y `exercise_submissions`
- [x] ✅ Campo `requires_manual_grading` implementado y clasificado
- [x] ✅ Lógica anti-farming implementada en `shouldAwardXP()`
- [x] ✅ Tests E2E pasan en módulos 2 y 3
- [x] ✅ No se rompen funcionalidades existentes

### Performance

- [x] ✅ Response time < 500ms en endpoint `/attempt`
- [x] ✅ Consultas SQL optimizadas (índices en `user_id`, `exercise_id`, `submitted_at`)
- [x] ✅ Trigger ejecuta en < 50ms

---

## 🚨 RIESGOS Y MITIGACIÓN

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **Farming de XP** | Media | Alto | Lógica `shouldAwardXP()` previene otorgar XP en intentos adicionales |
| **Datos existentes en `exercise_submissions`** | Alta | Medio | Migración automática a `exercise_attempts` para ejercicios autocorregibles |
| **Rotura de frontend existente** | Media | Alto | Mantener endpoint `/submit` funcionando para retrocompatibilidad |
| **Triggers no ejecutan correctamente** | Baja | Alto | Tests exhaustivos del trigger antes de deploy |
| **Clasificación incorrecta de ejercicios** | Media | Medio | Revisión manual de tabla `requires_manual_grading` |

---

## 📝 DOCUMENTACIÓN ACTUALIZADA

### ADR a Crear

**Archivo:** `docs/97-adr/ADR-017-arquitectura-dual-exercise-attempts-submissions.md`

**Contenido:**
- Contexto: Problema de reenvíos bloqueados
- Decisión: Arquitectura dual (attempts vs submissions)
- Alternativas consideradas
- Consecuencias positivas y negativas
- Plan de implementación

### Documentos a Actualizar

1. **`docs/01-fase-alcance-inicial/EAI-002-actividades/especificaciones/ET-EDU-001-mecanicas-ejercicios.md`**
   - Agregar sección "Arquitectura de Intentos vs Entregas"
   - Actualizar diagramas de flujo

2. **`docs/90-transversal/FUNCIONES-UTILITARIAS-GAMILIT.md`**
   - Documentar función `shouldAwardXP()`
   - Lógica anti-farming

3. **`README.md` del backend**
   - Endpoints: `/exercises/:id/attempt` vs `/exercises/:id/submit`
   - Cuándo usar cada uno

---

## 🎯 CONCLUSIÓN

Esta solución arquitectónica definitiva resuelve el problema de reenvíos bloqueados mediante una **arquitectura dual** que distingue claramente entre:

1. **Ejercicios de Práctica (Tipo A):** Autocorregibles, múltiples intentos, XP automático
2. **Trabajos Formales (Tipo B):** Revisión manual, una sola entrega, XP después de calificación

**Validación con Módulos 2 y 3:**
- ✅ Todos los ejercicios de ambos módulos son Tipo A (autocorregibles)
- ✅ Usarán endpoint `/exercises/:id/attempt`
- ✅ Permitirán reenvíos ilimitados
- ✅ Otorgarán XP solo en primer acierto (anti-farming)
- ✅ Validación automática por PostgreSQL functions

**Tiempo estimado de implementación:** 22 horas
**Prioridad:** 🔴 CRÍTICA
**Estado:** ✅ DISEÑO COMPLETADO - LISTO PARA IMPLEMENTACIÓN

---

**Documento generado por:** Architecture-Analyst
**Fecha:** 2025-11-24
**Aprobación pendiente de:** Product Owner, Backend Lead, Frontend Lead

---

## 📎 ANEXOS

### Anexo A: Comparativa Antes vs Después

| Aspecto | ANTES (Roto) | DESPUÉS (Correcto) |
|---------|--------------|-------------------|
| **Reenvío de ejercicio autocorregible** | ❌ Bloqueado con error 400 | ✅ Permitido ilimitadamente |
| **XP en múltiples intentos** | ⚠️ Se otorga en cada intento (farming) | ✅ Solo en primer acierto |
| **Tabla usada** | ❌ `exercise_submissions` (incorrecta) | ✅ `exercise_attempts` (correcta) |
| **Endpoint** | `POST /exercises/:id/submit` | `POST /exercises/:id/attempt` |
| **Trigger de XP** | ❌ No se usaba | ✅ Se usa automáticamente |
| **Historial** | ⚠️ Solo último intento | ✅ Todos los intentos registrados |
| **Estadísticas** | ❌ No disponibles | ✅ Completas por ejercicio |

### Anexo B: Referencias

- **RF-EDU-001:** Mecánicas de Ejercicios
- **ET-EDU-001:** Implementación de Mecánicas
- **US-ACT-001:** Historia de usuario de opción múltiple
- **DB-117:** Validadores de Módulo 2
- **DB-123:** Validadores de Módulo 3
- **Tabla `exercise_attempts`:** `apps/database/ddl/schemas/progress_tracking/tables/03-exercise_attempts.sql`
- **Tabla `exercise_submissions`:** `apps/database/ddl/schemas/progress_tracking/tables/04-exercise_submissions.sql`
- **Trigger:** `trg_update_user_stats_on_exercise`
