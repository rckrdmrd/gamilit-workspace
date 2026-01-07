# 🌐 API ENDPOINTS - SISTEMA DE RECOMPENSAS

**Versión:** v2.3.0
**Fecha:** 2025-11-12

---

## 📋 Índice de Endpoints

| Endpoint | Método | Auth | Modificado | Descripción |
|----------|--------|------|------------|-------------|
| `/api/educational/exercises` | GET | ✅ | ✅ SÍ | Lista ejercicios con campo `completed` |
| `/api/educational/exercises/:id` | GET | ✅ | ✅ SÍ | Detalle de ejercicio con `completed` |
| `/api/educational/exercises/:id/submit` | POST | ✅ | ❌ NO | Submit ejercicio (ya existía) |
| `/api/educational/modules` | GET | ✅ | ✅ SÍ | Lista módulos con progreso |
| `/api/educational/modules/:id` | GET | ❌ | ❌ NO | Detalle de módulo (sin cambios) |
| `/api/gamification/users/:id/stats` | GET | ✅ | ❌ NO | Stats del usuario (sin cambios) |

---

## 📚 1. GET /api/educational/exercises

### Descripción
Obtiene todos los ejercicios con el campo `completed` para el usuario autenticado.

### Request

**Endpoint:**
```
GET /api/educational/exercises
```

**Headers:**
```http
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Query Parameters:** Ninguno

---

### Response

**Status:** `200 OK`

**Body:**
```json
[
  {
    "id": "5d682cbc-5875-4423-96a1-dad1b7dbfc5b",
    "module_id": "896899ce-dd1d-4a36-a3ba-ab7f3531b517",
    "title": "Mapa Conceptual: Descubrimientos de Marie Curie",
    "subtitle": "Organiza los Conceptos Científicos",
    "description": "Completa el mapa conceptual...",
    "exercise_type": "mapa_conceptual",
    "difficulty_level": "beginner",
    "max_points": 100,
    "xp_reward": 25,
    "ml_coins_reward": 12,
    "order_index": 4,
    "completed": true,  // ⬅️ NUEVO CAMPO
    "is_active": true,
    "created_at": "2025-11-12T02:56:52.392Z",
    "updated_at": "2025-11-12T02:56:52.392Z"
  },
  {
    "id": "1b439bd0-5988-4c58-b348-917662f0660a",
    "module_id": "896899ce-dd1d-4a36-a3ba-ab7f3531b517",
    "title": "Crucigrama: Infancia de Marie",
    "completed": false,  // ⬅️ NUEVO CAMPO
    ...
  }
]
```

---

### Lógica Implementada

```typescript
@UseGuards(JwtAuthGuard)
@Get('exercises')
async findAll(@Request() req: any) {
  const userId = req.user.id;

  // 1. Obtener todos los ejercicios
  const exercises = await this.exercisesService.findAll();

  // 2. Obtener submissions del usuario
  const allSubmissions = await this.exerciseSubmissionService.findByUserId(userId);

  // 3. Crear Map de ejercicios completados (graded)
  const completedExercisesMap = new Map<string, boolean>();
  allSubmissions.forEach((submission) => {
    if (submission.status === 'graded') {
      completedExercisesMap.set(submission.exercise_id, true);
    }
  });

  // 4. Agregar campo 'completed' a cada ejercicio
  return exercises.map((exercise) => ({
    ...exercise,
    completed: completedExercisesMap.get(exercise.id) || false,
  }));
}
```

---

### Casos de Uso

1. **Listar ejercicios en página de módulo**
   - Frontend muestra badge "Completado" en ejercicios con `completed: true`

2. **Verificar progreso general**
   - Admin dashboard puede ver todos los ejercicios disponibles

---

## 📖 2. GET /api/educational/exercises/:id

### Descripción
Obtiene el detalle de un ejercicio específico con el campo `completed` para el usuario autenticado.

### Request

**Endpoint:**
```
GET /api/educational/exercises/5d682cbc-5875-4423-96a1-dad1b7dbfc5b
```

**Headers:**
```http
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**URL Parameters:**
- `id` (UUID, required): ID del ejercicio

---

### Response

**Status:** `200 OK`

**Body:**
```json
{
  "id": "5d682cbc-5875-4423-96a1-dad1b7dbfc5b",
  "module_id": "896899ce-dd1d-4a36-a3ba-ab7f3531b517",
  "title": "Mapa Conceptual: Descubrimientos de Marie Curie",
  "subtitle": "Organiza los Conceptos Científicos",
  "description": "Completa el mapa conceptual arrastrando los conceptos correctos a sus posiciones correspondientes.",
  "instructions": "Arrastra cada concepto a su lugar correcto en el mapa.",
  "order_index": 4,
  "exercise_type": "mapa_conceptual",
  "config": {
    "layout": "hierarchical",
    "autoConnect": true,
    "dragAndDrop": true,
    "allowConnections": true
  },
  "content": {
    "nodes": [...],
    "connections": [...],
    "centralConcept": {...}
  },
  "solution": {...},
  "difficulty_level": "beginner",
  "max_points": 100,
  "passing_score": 70,
  "estimated_time_minutes": 15,
  "time_limit_minutes": 25,
  "max_attempts": 3,
  "allow_retry": true,
  "hints": [...],
  "enable_hints": true,
  "hint_cost_ml_coins": 15,
  "xp_reward": 25,
  "ml_coins_reward": 12,
  "bonus_multiplier": "1.00",
  "is_active": true,
  "completed": true,  // ⬅️ NUEVO CAMPO
  "created_at": "2025-11-12T02:56:52.392Z",
  "updated_at": "2025-11-12T02:56:52.392Z"
}
```

---

### Lógica Implementada

```typescript
@UseGuards(JwtAuthGuard)
@Get('exercises/:id')
async findOne(@Param('id') id: string, @Request() req: any) {
  const userId = req.user.id;

  // 1. Obtener ejercicio
  const exercise = await this.exercisesService.findById(id);

  if (!exercise) {
    throw new NotFoundException(`Exercise with ID ${id} not found`);
  }

  // 2. Verificar si el usuario ha completado este ejercicio
  const submission = await this.exerciseSubmissionService.findByUserAndExercise(
    userId,
    id
  );

  const completed = submission ? submission.status === 'graded' : false;

  // 3. Retornar ejercicio con campo 'completed'
  return {
    ...exercise,
    completed,
  };
}
```

---

### Errores Posibles

**404 Not Found**
```json
{
  "statusCode": 404,
  "message": "Exercise with ID {id} not found",
  "error": "Not Found"
}
```

**401 Unauthorized**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

## 📊 3. GET /api/educational/modules

### Descripción
Obtiene todos los módulos educativos con progreso calculado para el usuario autenticado.

### Request

**Endpoint:**
```
GET /api/educational/modules
```

**Headers:**
```http
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

---

### Response

**Status:** `200 OK`

**Body:**
```json
[
  {
    "id": "896899ce-dd1d-4a36-a3ba-ab7f3531b517",
    "tenant_id": null,
    "title": "Módulo 1: Comprensión Literal",
    "subtitle": null,
    "description": "Identifica información explícita en textos sobre la vida de Marie Curie",
    "summary": null,
    "order_index": 1,
    "module_code": "MOD-01-LITERAL",
    "difficulty_level": "beginner",
    "grade_levels": ["6", "7", "8"],
    "subjects": ["Literatura", "Ciencias"],
    "estimated_duration_minutes": 120,
    "estimated_sessions": 4,
    "learning_objectives": [
      "Identificar datos explícitos",
      "Comprender hechos históricos",
      "Reconocer personajes y lugares"
    ],
    "xp_reward": 100,
    "ml_coins_reward": 50,
    "status": "published",
    "is_published": true,
    "is_featured": false,
    "is_free": true,
    "created_at": "2025-11-12T02:56:52.349Z",
    "updated_at": "2025-11-12T02:56:52.392Z",

    "total_exercises": 5,         // ⬅️ NUEVO CAMPO
    "completed_exercises": 1,     // ⬅️ NUEVO CAMPO
    "progress": 20,               // ⬅️ NUEVO CAMPO (porcentaje 0-100)
    "completed": false            // ⬅️ NUEVO CAMPO (boolean)
  },
  {
    "id": "1a0a7b7e-a5ee-4723-8536-0ae03fd030ed",
    "title": "Módulo 2: Comprensión Inferencial",
    "total_exercises": 5,
    "completed_exercises": 0,
    "progress": 0,
    "completed": false,
    ...
  }
]
```

---

### Lógica Implementada

```typescript
@UseGuards(JwtAuthGuard)
@Get('modules')
async findAll(@Request() req: any) {
  const userId = req.user.id;

  // 1. Obtener todos los módulos
  const modules = await this.modulesService.findAll();

  // 2. Obtener todas las submissions del usuario
  const allSubmissions = await this.exerciseSubmissionService.findByUserId(userId);

  // 3. Crear Map de ejercicios completados
  const completedExercisesMap = new Map<string, boolean>();
  allSubmissions.forEach((submission) => {
    if (submission.status === 'graded') {
      completedExercisesMap.set(submission.exercise_id, true);
    }
  });

  // 4. Obtener todos los ejercicios
  const allExercises = await this.exercisesService.findAll();

  // 5. Agrupar ejercicios por módulo
  const exercisesByModule = new Map<string, any[]>();
  allExercises.forEach((exercise) => {
    if (!exercisesByModule.has(exercise.module_id)) {
      exercisesByModule.set(exercise.module_id, []);
    }
    exercisesByModule.get(exercise.module_id)!.push(exercise);
  });

  // 6. Calcular progreso para cada módulo
  return modules.map((module) => {
    const moduleExercises = exercisesByModule.get(module.id) || [];
    const totalExercises = moduleExercises.length;
    const completedExercises = moduleExercises.filter((ex) =>
      completedExercisesMap.has(ex.id),
    ).length;
    const progress = totalExercises > 0
      ? Math.round((completedExercises / totalExercises) * 100)
      : 0;
    const completed = totalExercises > 0 && completedExercises === totalExercises;

    return {
      ...module,
      total_exercises: totalExercises,
      completed_exercises: completedExercises,
      progress,
      completed,
    };
  });
}
```

---

### Casos de Uso

1. **Dashboard del estudiante**
   - Mostrar progreso en todos los módulos
   - Barras de progreso visuales (20%, 40%, etc.)

2. **Módulo seleccionado**
   - Mostrar "Completado 2/5 ejercicios (40%)"

---

## 🎮 4. POST /api/educational/exercises/:id/submit

### Descripción
Envía la solución de un ejercicio y obtiene recompensas. **Este endpoint no fue modificado**, pero es crítico para el flujo.

### Request

**Endpoint:**
```
POST /api/educational/exercises/5d682cbc-5875-4423-96a1-dad1b7dbfc5b/submit
```

**Headers:**
```http
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Body:**
```json
{
  "answers": {
    "score": 100
  },
  "startedAt": 1731366000000,
  "hintsUsed": 0,
  "powerupsUsed": []
}
```

---

### Response

**Status:** `200 OK`

**Body:**
```json
{
  "score": 100,
  "isPerfect": true,
  "rewards": {
    "xp": 200,
    "mlCoins": 50,
    "bonuses": []
  },
  "rankUp": null
}
```

---

### Flujo Interno (Lo que sucede en Backend + BD)

```
1. ExerciseAttemptService.createAttempt()
   ├─▶ Calcular score
   ├─▶ Calcular xp_earned
   ├─▶ Calcular ml_coins_earned
   └─▶ INSERT INTO exercise_attempts

2. Trigger automático: trg_update_user_stats_on_exercise
   └─▶ gamilit.update_user_stats_on_exercise_complete()
       └─▶ UPDATE gamification_system.user_stats

3. Response con rewards calculados
```

---

## 📊 5. GET /api/gamification/users/:userId/stats

### Descripción
Obtiene las estadísticas del usuario. **No fue modificado**, pero muestra los valores actualizados por el trigger.

### Request

**Endpoint:**
```
GET /api/gamification/users/cccccccc-cccc-cccc-cccc-cccccccccccc/stats
```

**Headers:**
```http
Authorization: Bearer {JWT_TOKEN}
```

---

### Response

**Status:** `200 OK`

**Body:**
```json
{
  "id": "12862fee-8887-4ca5-8221-e504f516144a",
  "user_id": "cccccccc-cccc-cccc-cccc-cccccccccccc",
  "tenant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "level": 2,
  "total_xp": 200,
  "xp_to_next_level": 100,
  "current_rank": "Ajaw",
  "rank_progress": "0.00",
  "ml_coins": 150,
  "ml_coins_earned_total": 50,
  "ml_coins_spent_total": 0,
  "exercises_completed": 1,
  "modules_completed": 0,
  "perfect_scores": 0,
  "achievements_earned": 0,
  "last_activity_at": "2025-11-12T05:58:57.132Z",
  "created_at": "2025-11-12T02:56:52.133Z",
  "updated_at": "2025-11-12T05:58:57.132Z"
}
```

---

## 🔐 Autenticación y Seguridad

### JWT Authentication

Todos los endpoints modificados requieren autenticación JWT:

```typescript
@UseGuards(JwtAuthGuard)
```

### Extracción de User ID

```typescript
@Get('exercises')
async findAll(@Request() req: any) {
  const userId = req.user.id;  // Extraído del JWT token
  // ...
}
```

### RLS (Row Level Security)

Las políticas de RLS en PostgreSQL aseguran que:
- Users solo ven sus propias submissions
- Queries automáticamente filtran por tenant_id

---

## 📈 Performance y Optimización

### Batch Queries

Todos los endpoints modificados usan batch fetch para evitar N+1 queries:

```typescript
// ✅ UNA query para todas las submissions
const allSubmissions = await findByUserId(userId);

// ❌ EVITADO: N queries (una por cada ejercicio)
for (const exercise of exercises) {
  const submission = await findSubmission(userId, exercise.id);
}
```

### Índices de BD

```sql
CREATE INDEX idx_exercise_submissions_user ON exercise_submissions(user_id);
CREATE INDEX idx_exercise_submissions_exercise ON exercise_submissions(exercise_id);
```

---

**Última actualización:** 2025-11-12
**Autor:** Sistema Gamilit
**Versión:** 1.0
