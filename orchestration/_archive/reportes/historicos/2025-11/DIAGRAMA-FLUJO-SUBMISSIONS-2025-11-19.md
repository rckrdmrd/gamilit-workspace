# 🔄 Diagrama de Flujo: Submissions de Ejercicios

**Fecha:** 2025-11-19
**Versión:** 1.0
**Autor:** Database Agent

---

## 🎯 Flujo Completo: Usuario Completa Ejercicio

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                                  │
│                    (React + TypeScript + TanStack Query)               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 1. User completa ejercicio
                                    ▼
┌───────────────────────────────────────────────────────────────────────┐
│  Componente de Ejercicio (ej: CrucigramaExercise.tsx)                │
│  ────────────────────────────────────────────────────────────────────│
│  Estado local:                                                        │
│  {                                                                    │
│    clues: {                                                           │
│      h1: {userInput: "SORBONA"},                                      │
│      h2: {userInput: "NOBEL"}                                         │
│    }                                                                  │
│  }                                                                    │
└───────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 2. User hace clic "Enviar"
                                    ▼
┌───────────────────────────────────────────────────────────────────────┐
│  Validación Client-Side (UI)                                         │
│  ────────────────────────────────────────────────────────────────────│
│  ✓ Campos requeridos completos                                       │
│  ✓ Formato básico correcto                                           │
│  ✗ NO valida corrección (nunca tiene respuestas correctas)           │
└───────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 3. Transform to submission format
                                    ▼
┌───────────────────────────────────────────────────────────────────────┐
│  Transformación a formato API                                         │
│  ────────────────────────────────────────────────────────────────────│
│  Frontend State → API Request:                                        │
│                                                                       │
│  {                                                                    │
│    exerciseId: "uuid-here",                                           │
│    answers: {                                                         │
│      clues: {                                                         │
│        h1: "SORBONA",                                                 │
│        h2: "NOBEL"                                                    │
│      }                                                                │
│    }                                                                  │
│  }                                                                    │
└───────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 4. HTTP POST Request
                                    ▼
═════════════════════════════════════════════════════════════════════════
                         HTTP BOUNDARY (HTTPS/TLS)
═════════════════════════════════════════════════════════════════════════
                                    │
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND LAYER                                   │
│                    (NestJS + TypeScript + TypeORM)                      │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 5. ExercisesController recibe request
                                    ▼
┌───────────────────────────────────────────────────────────────────────┐
│  POST /api/exercises/:id/submit                                       │
│  Controller: exercises.controller.ts                                  │
│  ────────────────────────────────────────────────────────────────────│
│  @Post(':id/submit')                                                  │
│  async submitExercise(                                                │
│    @Param('id') exerciseId: string,                                   │
│    @Body() submission: SubmitExerciseDto,                             │
│    @Request() req                                                     │
│  ) {                                                                  │
│    const userId = req.user.id; // From JWT                            │
│    return this.submissionService.submitAndGrade(                      │
│      userId, exerciseId, submission.answers                           │
│    );                                                                 │
│  }                                                                    │
└───────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 6. ExerciseSubmissionService.submitAndGrade()
                                    ▼
┌───────────────────────────────────────────────────────────────────────┐
│  Step 1: Conversión auth.users.id → profiles.id                      │
│  Service: exercise-submission.service.ts:45-56                        │
│  ────────────────────────────────────────────────────────────────────│
│  const profileId = await this.getProfileId(userId);                   │
│                                                                       │
│  // CRITICAL FIX: exercise_submissions.user_id references profiles.id │
│  // JWT tiene auth.users.id, necesitamos convertir                    │
└───────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 7. Validar estructura de respuesta
                                    ▼
┌───────────────────────────────────────────────────────────────────────┐
│  Step 2: ExerciseAnswerValidator.validate()                          │
│  File: dto/answers/exercise-answer.validator.ts                       │
│  ────────────────────────────────────────────────────────────────────│
│  1. Get exercise type → "crucigrama"                                  │
│  2. Map to DTO → CrucigramaAnswersDto                                 │
│  3. Validate structure with class-validator                           │
│                                                                       │
│  IF invalid structure:                                                │
│    → throw BadRequestException                                        │
│    → Frontend recibe 400 con detalles                                 │
│                                                                       │
│  IF valid structure:                                                  │
│    → Continue ✓                                                       │
└───────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 8. Crear submission record
                                    ▼
┌───────────────────────────────────────────────────────────────────────┐
│  Step 3: Create ExerciseSubmission                                    │
│  ────────────────────────────────────────────────────────────────────│
│  const submissionData = {                                             │
│    user_id: profileId,     // profiles.id (NO auth.users.id)         │
│    exercise_id: exerciseId,                                           │
│    answer_data: answers,                                              │
│    max_score: 100,                                                    │
│    attempt_number: 1,                                                 │
│    status: 'submitted'                                                │
│  };                                                                   │
│                                                                       │
│  const submission = await this.submissionRepo.save(submissionData);   │
└───────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 9. Auto-grading
                                    ▼
┌───────────────────────────────────────────────────────────────────────┐
│  Step 4: autoGrade() → SQL validate_and_audit()                      │
│  Service: exercise-submission.service.ts:251-309                      │
│  ────────────────────────────────────────────────────────────────────│
│  const result = await this.entityManager.query(`                      │
│    SELECT * FROM educational_content.validate_and_audit(              │
│      $1::uuid,    -- exercise_id                                      │
│      $2::uuid,    -- user_id (profiles.id)                            │
│      $3::jsonb,   -- submitted_answer                                 │
│      $4::integer, -- attempt_number                                   │
│      $5::jsonb    -- client_metadata                                  │
│    )                                                                  │
│  `, [exerciseId, profileId, answers, 1, {}]);                         │
│                                                                       │
│  return {                                                             │
│    score: result[0].score,                                            │
│    isCorrect: result[0].is_correct,                                   │
│    correctAnswers: result[0].details?.correct_answers,                │
│    totalQuestions: result[0].details?.total_questions,                │
│    feedback: result[0].feedback,                                      │
│    details: result[0].details,                                        │
│    auditId: result[0].audit_id                                        │
│  };                                                                   │
└───────────────────────────────────────────────────────────────────────┘
                                    │
═════════════════════════════════════════════════════════════════════════
                         DATABASE BOUNDARY (PostgreSQL)
═════════════════════════════════════════════════════════════════════════
                                    │
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE LAYER                                  │
│                    (PostgreSQL 15 + PL/pgSQL Functions)                │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 10. validate_and_audit() comienza
                                    ▼
┌───────────────────────────────────────────────────────────────────────┐
│  Function: validate_and_audit()                                       │
│  File: 20-validate_and_audit.sql                                      │
│  ────────────────────────────────────────────────────────────────────│
│  Step 1: Recuperar ejercicio y configuración                          │
│                                                                       │
│  SELECT exercise_type, content, solution, max_points                  │
│  FROM educational_content.exercises                                   │
│  WHERE id = p_exercise_id AND is_active = true;                       │
│                                                                       │
│  → exercise_type = 'crucigrama'                                       │
│                                                                       │
│  SELECT validation_function, case_sensitive, ...                      │
│  FROM educational_content.exercise_validation_config                  │
│  WHERE exercise_type = 'crucigrama';                                  │
│                                                                       │
│  → validation_function = 'validate_crucigrama'                        │
└───────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 11. Despachar a validador específico
                                    ▼
┌───────────────────────────────────────────────────────────────────────┐
│  Function: validate_answer() (Dispatcher)                             │
│  File: 02-validate_answer.sql                                         │
│  ────────────────────────────────────────────────────────────────────│
│  CASE v_config.validation_function                                    │
│    WHEN 'validate_crucigrama' THEN                                    │
│      SELECT * FROM educational_content.validate_crucigrama(           │
│        v_exercise.solution,      -- Respuestas correctas              │
│        p_submitted_answer,       -- Respuestas del usuario            │
│        max_score,                -- 100                               │
│        v_config.case_sensitive,  -- false                             │
│        v_config.normalize_text   -- true                              │
│      );                                                               │
│  END CASE;                                                            │
└───────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 12. Validar respuestas
                                    ▼
┌───────────────────────────────────────────────────────────────────────┐
│  Function: validate_crucigrama()                                      │
│  File: 03-validate_crucigrama.sql                                     │
│  ────────────────────────────────────────────────────────────────────│
│  Inputs:                                                              │
│  • solution: {"clues": {"h1": "SORBONA", "h2": "NOBEL"}}             │
│  • submitted: {"clues": {"h1": "sorbona", "h2": "nobel"}}            │
│                                                                       │
│  Process:                                                             │
│  1. FOR EACH clue_id IN solution.clues:                               │
│      a. Normalize: UPPER(TRIM(normalize_text(answer)))               │
│      b. Compare: submitted[clue_id] == solution[clue_id]              │
│      c. Count correct_words++                                         │
│                                                                       │
│  2. Calculate:                                                        │
│      score = (correct_words / total_words) * max_points              │
│      is_correct = (correct_words == total_words)                      │
│                                                                       │
│  3. Generate feedback:                                                │
│      "¡Perfecto! Todas las 2 palabras están correctas."              │
│                                                                       │
│  4. Build details JSONB:                                              │
│      {                                                                │
│        "total_words": 2,                                              │
│        "correct_words": 2,                                            │
│        "percentage": 100,                                             │
│        "results_per_word": [                                          │
│          {"clue_id": "h1", "is_correct": true, ...},                  │
│          {"clue_id": "h2", "is_correct": true, ...}                   │
│        ]                                                              │
│      }                                                                │
│                                                                       │
│  Return: (is_correct, score, feedback, details)                       │
└───────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 13. Crear auditoría
                                    ▼
┌───────────────────────────────────────────────────────────────────────┐
│  Back in validate_and_audit(): Create Audit Record                   │
│  ────────────────────────────────────────────────────────────────────│
│  INSERT INTO educational_content.exercise_validation_audit (          │
│    exercise_id,                                                       │
│    user_id,                                                           │
│    attempt_number,                                                    │
│    submitted_answer,              -- Snapshot de respuesta            │
│    exercise_snapshot,             -- Snapshot del ejercicio           │
│    validation_config_snapshot,    -- Snapshot de config               │
│    is_correct,                                                        │
│    score,                                                             │
│    max_score,                                                         │
│    feedback,                                                          │
│    validation_details,                                                │
│    validation_function_used,      -- 'validate_crucigrama'            │
│    validation_timestamp,                                              │
│    validation_duration_ms,        -- Ej: 15ms                         │
│    client_metadata                -- IP, user-agent, etc.             │
│  )                                                                    │
│  RETURNING id INTO audit_id;                                          │
│                                                                       │
│  audit_id = "550e8400-e29b-41d4-a716-446655440000"                    │
└───────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 14. Return result
                                    ▼
┌───────────────────────────────────────────────────────────────────────┐
│  validate_and_audit() returns RECORD:                                 │
│  ────────────────────────────────────────────────────────────────────│
│  {                                                                    │
│    is_correct: true,                                                  │
│    score: 100,                                                        │
│    max_score: 100,                                                    │
│    feedback: "¡Perfecto! Todas las 2 palabras están correctas.",     │
│    details: {                                                         │
│      total_words: 2,                                                  │
│      correct_words: 2,                                                │
│      percentage: 100,                                                 │
│      results_per_word: [...]                                          │
│    },                                                                 │
│    audit_id: "550e8400-..."                                           │
│  }                                                                    │
└───────────────────────────────────────────────────────────────────────┘
                                    │
═════════════════════════════════════════════════════════════════════════
                         BACK TO BACKEND
═════════════════════════════════════════════════════════════════════════
                                    │
                                    │ 15. Process result
                                    ▼
┌───────────────────────────────────────────────────────────────────────┐
│  ExerciseSubmissionService: Update submission                         │
│  ────────────────────────────────────────────────────────────────────│
│  submission.score = 100;                                              │
│  submission.is_correct = true;                                        │
│  submission.status = 'graded';                                        │
│  submission.graded_at = new Date();                                   │
│  submission.feedback = "¡Perfecto!...";                               │
│                                                                       │
│  await this.submissionRepo.save(submission);                          │
└───────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ 16. Transform to API response
                                    ▼
┌───────────────────────────────────────────────────────────────────────┐
│  Response to Frontend                                                 │
│  ────────────────────────────────────────────────────────────────────│
│  return {                                                             │
│    submissionId: submission.id,                                       │
│    score: 100,                                                        │
│    maxScore: 100,                                                     │
│    isCorrect: true,                                                   │
│    feedback: "¡Perfecto! Todas las 2 palabras están correctas.",     │
│    correctAnswers: 2,                                                 │
│    totalQuestions: 2,                                                 │
│    xpEarned: 20,        // From exercise config                       │
│    mlCoinsEarned: 10    // From exercise config                       │
│  };                                                                   │
└───────────────────────────────────────────────────────────────────────┘
                                    │
═════════════════════════════════════════════════════════════════════════
                         BACK TO FRONTEND
═════════════════════════════════════════════════════════════════════════
                                    │
                                    │ 17. Handle response
                                    ▼
┌───────────────────────────────────────────────────────────────────────┐
│  Frontend: Process submission result                                  │
│  ────────────────────────────────────────────────────────────────────│
│  1. Update local state                                                │
│  2. Show success/error feedback to user                               │
│  3. Animate XP/ML Coins earned                                        │
│  4. Update user stats (if correct)                                    │
│  5. Enable "Continuar" button                                         │
│  6. Invalidate queries to refresh dashboard                           │
└───────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                              USER SEES RESULT
```

---

## 🔄 Transformaciones de Datos

### Transformación 1: Frontend State → API Request

**Input (React State):**

```typescript
const [userAnswers, setUserAnswers] = useState({
  h1: { value: "SORBONA", isConfirmed: true },
  h2: { value: "NOBEL", isConfirmed: true }
});
```

**Output (API Request):**

```typescript
POST /api/exercises/uuid-here/submit
{
  "answers": {
    "clues": {
      "h1": "SORBONA",
      "h2": "NOBEL"
    }
  }
}
```

---

### Transformación 2: auth.users.id → profiles.id

**Input (JWT token):**

```typescript
{
  sub: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",  // auth.users.id
  email: "user@example.com",
  role: "student"
}
```

**Process:**

```typescript
const profile = await this.profileRepo.findOne({
  where: { user_id: userId },
  select: ['id']
});
```

**Output:**

```typescript
profileId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"  // profiles.id
```

---

### Transformación 3: Backend Request → SQL Parameters

**Input (Backend):**

```typescript
autoGrade(
  profileId: "bbbbbbbb-...",
  exerciseId: "cccccccc-...",
  answerData: {"clues": {"h1": "SORBONA", "h2": "NOBEL"}},
  attemptNumber: 1,
  clientMetadata: {}
)
```

**SQL Call:**

```sql
SELECT * FROM educational_content.validate_and_audit(
  'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
  '{"clues":{"h1":"SORBONA","h2":"NOBEL"}}'::jsonb,
  1::integer,
  '{}'::jsonb
);
```

---

### Transformación 4: SQL Result → Backend Response

**SQL Output:**

```sql
is_correct  | score | max_score | feedback                              | details                  | audit_id
------------|-------|-----------|---------------------------------------|--------------------------|----------
true        | 100   | 100       | ¡Perfecto! Todas las 2 palabras...    | {"total_words": 2, ...}  | uuid-here
```

**Backend Response:**

```typescript
{
  score: 100,
  isCorrect: true,
  correctAnswers: 2,
  totalQuestions: 2,
  feedback: "¡Perfecto! Todas las 2 palabras están correctas.",
  details: {
    total_words: 2,
    correct_words: 2,
    percentage: 100,
    results_per_word: [...]
  },
  auditId: "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## 🔒 Puntos de Validación

| # | Capa | Tipo de Validación | Si Falla |
|---|------|--------------------|----------|
| **1** | Frontend UI | Campos requeridos, formato básico | Botón "Enviar" deshabilitado |
| **2** | Backend DTO | Estructura de datos (class-validator) | `400 Bad Request` |
| **3** | Backend Auth | Usuario autenticado, permisos | `401 Unauthorized` / `403 Forbidden` |
| **4** | Backend Logic | auth.users.id → profiles.id conversion | `404 Not Found` (profile not found) |
| **5** | Database SQL | Corrección de respuestas | Score = 0-100, is_correct = false |

---

## 📐 Casos Edge

### Caso 1: Usuario envía respuesta sin autenticar

```
Frontend → POST /api/exercises/:id/submit
           (Sin header Authorization)

Backend  → Guard rechaza request
           → 401 Unauthorized

Frontend ← "No autorizado. Por favor inicia sesión."
```

---

### Caso 2: Estructura de respuesta inválida

```
Frontend → POST /api/exercises/:id/submit
           {
             "answers": {
               "invalid_key": "data"  // Falta "clues"
             }
           }

Backend  → ExerciseAnswerValidator.validate('crucigrama', answers)
           → ValidationError: "clues is required"
           → 400 Bad Request

Frontend ← {
             "statusCode": 400,
             "message": "Validation failed for exercise type 'crucigrama': clues is required"
           }
```

---

### Caso 3: Ejercicio no existe o inactivo

```
Frontend → POST /api/exercises/invalid-uuid/submit

Backend  → autoGrade() calls validate_and_audit()

Database → SELECT ... WHERE id = 'invalid-uuid' AND is_active = true;
           → NOT FOUND
           → RAISE EXCEPTION 'Exercise not found or inactive'

Backend  ← InternalServerErrorException
           → 500 Internal Server Error

Frontend ← "Error al validar. Contacte al administrador."
```

---

### Caso 4: Usuario sin profile (datos inconsistentes)

```
Backend → getProfileId(userId)
          → SELECT ... FROM profiles WHERE user_id = 'user-id'
          → NOT FOUND
          → throw NotFoundException('Profile not found for user')
          → 404 Not Found

Frontend ← "Perfil no encontrado. Contacte soporte."
```

---

## ⏱️ Performance

### Métricas Típicas

| Fase | Tiempo típico | Notas |
|------|---------------|-------|
| Frontend validation | < 1ms | Síncrono, local |
| HTTP request | 10-50ms | Depende de latencia red |
| Backend DTO validation | 1-5ms | class-validator |
| SQL validate_and_audit() | 5-20ms | Incluye auditoría |
| Database commit | 1-5ms | Write to disk |
| HTTP response | 10-50ms | Latencia red |
| **Total (typical)** | **50-150ms** | E2E time |

**Optimizaciones aplicadas:**

- ✅ Validación client-side reduce requests inválidos
- ✅ Índices en `exercises.id`, `profiles.user_id`
- ✅ Función SQL `IMMUTABLE` cuando posible
- ✅ Auditoría asíncrona (no bloquea respuesta)

---

## 🎯 Conclusiones

1. **Flujo bien definido:** 3 capas claramente separadas
2. **Validaciones defensivas:** 5 puntos de validación
3. **Trazabilidad completa:** Auditoría de cada submission
4. **Seguridad por capas:** Respuestas correctas NUNCA llegan a frontend
5. **Performance aceptable:** 50-150ms E2E típico

---

**Última actualización:** 2025-11-19
**Ver también:** ESPECIFICACION-VALIDACIONES-POR-TIPO-2025-11-19.md
