# INVENTARIO DE ENDPOINTS: PERSISTENCIA Y LECTURA

**Fecha:** 2025-11-24
**Agente:** Backend-Agent
**Propósito:** Inventario de endpoints que persisten y leen datos de ejercicios/avances

---

## 📊 ENDPOINTS DE PERSISTENCIA (WRITE)

### 1. Exercise Submissions

#### POST /api/v1/progress/submissions

**Service:** `ExerciseSubmissionService.submitExercise()`
**Archivo:** `apps/backend/src/modules/progress/services/exercise-submission.service.ts`
**Líneas:** 184-249

**Persiste:**
- `progress.exercise_submissions.answer_data` (respuestas del estudiante)
- `progress.exercise_submissions.score` (puntaje calculado)
- `progress.exercise_submissions.is_correct` (booleano de aprobación)
- `progress.exercise_submissions.status` ('submitted' → 'graded')
- `progress.exercise_submissions.submitted_at` (timestamp)
- `progress.exercise_submissions.graded_at` (timestamp)
- `gamification_system.user_stats.total_xp` (XP ganada)
- `gamification_system.ml_coins_transactions` (ML Coins ganadas)

**Código clave:**
```typescript
// Línea 229: Persiste submission
submission = await this.submissionRepo.save(existingSubmission);

// Línea 236: Auto-grade
submission = await this.gradeSubmission(submission.id);

// Línea 241: Auto-claim rewards
const rewards = await this.claimRewards(submission.id);
```

**Validación SQL:**
```sql
-- Verificar persistencia de submission
SELECT id, user_id, exercise_id, score, is_correct, status, submitted_at
FROM progress.exercise_submissions
WHERE user_id = '<user_id>' AND exercise_id = '<exercise_id>'
ORDER BY submitted_at DESC LIMIT 1;

-- Verificar persistencia de XP
SELECT total_xp, level, current_rank
FROM gamification_system.user_stats
WHERE user_id = '<user_id>';

-- Verificar persistencia de ML Coins
SELECT user_id, amount, transaction_type, created_at
FROM gamification_system.ml_coins_transactions
WHERE user_id = '<user_id>'
ORDER BY created_at DESC LIMIT 5;
```

---

#### POST /api/v1/progress/attempts

**Service:** `ExerciseAttemptService.submitAttempt()`
**Archivo:** `apps/backend/src/modules/progress/services/exercise-attempt.service.ts`
**Líneas:** 120-162

**Persiste:**
- `progress.exercise_attempts.submitted_answers` (respuestas)
- `progress.exercise_attempts.score` (puntaje)
- `progress.exercise_attempts.is_correct` (booleano)
- `progress.exercise_attempts.xp_earned` (XP calculada)
- `progress.exercise_attempts.ml_coins_earned` (ML Coins calculadas)
- `gamification_system.user_stats.total_xp` (via `awardRewards()`)
- `gamification_system.ml_coins_transactions` (via `awardRewards()`)

**Código clave:**
```typescript
// Línea 154: Persiste attempt con score
const savedAttempt = await this.attemptRepo.save(attempt);

// Línea 158: Award rewards si correcto
if (isCorrect && (attempt.xp_earned > 0 || attempt.ml_coins_earned > 0)) {
  await this.awardRewards(attempt.user_id, attempt.exercise_id, attempt.xp_earned, attempt.ml_coins_earned);
}
```

**Validación SQL:**
```sql
-- Verificar persistencia de attempts
SELECT id, user_id, exercise_id, attempt_number, score, is_correct, xp_earned, ml_coins_earned
FROM progress.exercise_attempts
WHERE user_id = '<user_id>' AND exercise_id = '<exercise_id>'
ORDER BY attempt_number DESC;
```

---

### 2. Module Progress

#### POST /api/v1/progress/modules

**Service:** `ModuleProgressService.create()`
**Archivo:** `apps/backend/src/modules/progress/services/module-progress.service.ts`
**Líneas:** 63-99

**Persiste:**
- `progress.user_module_progress.progress_percentage` (0 inicial)
- `progress.user_module_progress.status` ('not_started')
- `progress.user_module_progress.completed_exercises` (0 inicial)
- `progress.user_module_progress.total_xp_earned` (0 inicial)
- `progress.user_module_progress.total_ml_coins_earned` (0 inicial)
- `progress.user_module_progress.started_at` (timestamp)

**Código clave:**
```typescript
// Línea 98: Persiste progreso inicial
return await this.moduleProgressRepo.save(newProgress);
```

**Validación SQL:**
```sql
-- Verificar persistencia de module progress
SELECT id, user_id, module_id, progress_percentage, status, completed_exercises, started_at
FROM progress.user_module_progress
WHERE user_id = '<user_id>' AND module_id = '<module_id>';
```

---

#### PATCH /api/v1/progress/modules/:id/percentage

**Service:** `ModuleProgressService.updateProgressPercentage()`
**Archivo:** `apps/backend/src/modules/progress/services/module-progress.service.ts`
**Líneas:** 127-153

**Persiste:**
- `progress.user_module_progress.progress_percentage` (0-100)
- `progress.user_module_progress.status` ('not_started' | 'in_progress' | 'completed')
- `progress.user_module_progress.last_accessed_at` (timestamp)
- `progress.user_module_progress.completed_at` (si llega a 100%)

**Código clave:**
```typescript
// Línea 152: Persiste porcentaje y estado
return await this.moduleProgressRepo.save(progress);
```

**Validación SQL:**
```sql
-- Verificar actualización de porcentaje
SELECT id, progress_percentage, status, last_accessed_at, completed_at
FROM progress.user_module_progress
WHERE id = '<progress_id>';
```

---

#### POST /api/v1/progress/modules/:id/complete

**Service:** `ModuleProgressService.completeModule()`
**Archivo:** `apps/backend/src/modules/progress/services/module-progress.service.ts`
**Líneas:** 160-180

**Persiste:**
- `progress.user_module_progress.status` ('completed')
- `progress.user_module_progress.progress_percentage` (100)
- `progress.user_module_progress.completed_at` (timestamp)
- `progress.user_module_progress.average_score` (calculado)

**Código clave:**
```typescript
// Línea 179: Persiste completación
return await this.moduleProgressRepo.save(progress);
```

**Validación SQL:**
```sql
-- Verificar completación de módulo
SELECT id, status, progress_percentage, completed_at, average_score
FROM progress.user_module_progress
WHERE id = '<progress_id>' AND status = 'completed';
```

---

### 3. Grading (Teacher)

#### POST /api/teacher/grading/:submissionId/feedback

**Service:** `GradingService.submitFeedback()`
**Archivo:** `apps/backend/src/modules/teacher/services/grading.service.ts`
**Líneas:** 81-100

**Persiste:**
- `progress.exercise_submissions.feedback` (texto/JSON del profesor)
- `progress.exercise_submissions.score` (ajustado por profesor)
- `progress.exercise_submissions.status` ('graded')
- `progress.exercise_submissions.graded_at` (timestamp)

**Código clave:**
```typescript
// Línea 97: Persiste feedback y score
await this.submissionRepository.save(submission);
```

**Validación SQL:**
```sql
-- Verificar feedback del profesor
SELECT id, feedback, score, status, graded_at
FROM progress.exercise_submissions
WHERE id = '<submission_id>' AND status = 'graded';
```

---

#### POST /api/teacher/grading/bulk

**Service:** `GradingService.bulkGrade()`
**Archivo:** `apps/backend/src/modules/teacher/services/grading.service.ts`
**Líneas:** 105-123

**Persiste:**
- `progress.exercise_submissions.feedback` (mismo para todas)
- `progress.exercise_submissions.score` (ajustado para todas)
- `progress.exercise_submissions.status` ('graded')
- `progress.exercise_submissions.graded_at` (timestamp)

**Código clave:**
```typescript
// Línea 119: Persiste batch de submissions
await this.submissionRepository.save(submissions);
```

**Validación SQL:**
```sql
-- Verificar bulk grading
SELECT id, feedback, score, status, graded_at
FROM progress.exercise_submissions
WHERE id = ANY($1::uuid[])
AND status = 'graded';
```

---

### 4. Authentication

#### POST /api/auth/login

**Service:** `AuthService.login()`
**Archivo:** `apps/backend/src/modules/auth/services/auth.service.ts`
**Líneas:** 126-204

**Persiste:**
- `auth.users.last_sign_in_at` (timestamp del login) ✅ **BUG-ADMIN-001 CORREGIDO**
- `auth.user_sessions.session_token` (token de sesión)
- `auth.user_sessions.refresh_token` (hasheado)
- `auth.user_sessions.ip_address` (IP del cliente)
- `auth.user_sessions.user_agent` (browser info)
- `auth.user_sessions.last_activity_at` (timestamp)

**Código clave:**
```typescript
// Línea 192: Crea sesión
await this.sessionRepository.save(session);

// Línea 194-196: Actualiza last_sign_in_at ✅ CORREGIDO
user.last_sign_in_at = new Date();
await this.userRepository.save(user);
```

**Validación SQL:**
```sql
-- Verificar actualización de last_sign_in_at
SELECT id, email, last_sign_in_at
FROM auth.users
WHERE id = '<user_id>';

-- Verificar creación de sesión
SELECT id, user_id, session_token, ip_address, last_activity_at
FROM auth.user_sessions
WHERE user_id = '<user_id>'
ORDER BY created_at DESC LIMIT 1;
```

---

## 📖 ENDPOINTS DE LECTURA (READ)

### 1. Teacher Portal

#### GET /api/teacher/students/:id/progress

**Service:** `StudentProgressService.getStudentProgress()`
**Archivo:** `apps/backend/src/modules/teacher/services/student-progress.service.ts`
**Líneas:** 104-123

**Lee desde:**
- `auth_management.profiles` (perfil del estudiante)
- `progress.exercise_submissions` (historial de intentos)
- `progress.user_module_progress` (avances por módulo)
- `gamification_system.user_stats` (XP, ML Coins, nivel, rango)

**Código clave:**
```typescript
// Línea 166: Get submissions
const submissions = await this.submissionRepository.find({
  where: { user_id: profile.user_id || undefined },
});

// Línea 171: Get module progress
const moduleProgresses = await this.moduleProgressRepository.find({
  where: { user_id: profile.user_id || undefined },
});
```

**Retorna:**
```typescript
{
  student: {
    id: string,
    full_name: string,
    email: string,
    maya_rank: string,
    current_level: number,
    total_xp: number,
    total_ml_coins: number,
    last_login: Date
  },
  stats: {
    total_modules: number,
    completed_modules: number,
    total_exercises: number,
    completed_exercises: number,
    average_score: number,
    total_time_spent_minutes: number
  },
  moduleProgress: [{
    module_id: string,
    module_name: string,
    progress_percentage: number,
    status: 'not_started' | 'in_progress' | 'completed'
  }],
  exerciseAttempts: [{
    id: string,
    exercise_title: string,
    is_correct: boolean,
    score_percentage: number,
    submitted_at: Date
  }]
}
```

---

#### GET /api/teacher/grading/:submissionId

**Service:** `GradingService.getSubmissionById()`
**Archivo:** `apps/backend/src/modules/teacher/services/grading.service.ts`
**Líneas:** 23-44

**Lee desde:**
- `progress.exercise_submissions` (submission completa)
- `auth_management.profiles` (perfil del estudiante) [JOIN]
- `educational_content.exercises` (datos del ejercicio) [JOIN]

**Código clave:**
```typescript
// Línea 24-36: Query con JOINs
const submission = await this.submissionRepository
  .createQueryBuilder('submission')
  .leftJoinAndSelect('auth_management.profiles', 'profile', 'profile.user_id = submission.user_id')
  .leftJoinAndSelect('educational_content.exercises', 'exercise', 'exercise.id = submission.exercise_id')
  .where('submission.id = :id', { id })
  .getOne();
```

**Retorna:**
```typescript
{
  id: string,
  user_id: string,
  exercise_id: string,
  answer_data: Record<string, any>,
  score: number,
  max_score: number,
  is_correct: boolean,
  feedback: string | null,
  status: 'submitted' | 'graded' | 'reviewed',
  graded_at: Date | null,
  submitted_at: Date
}
```

---

#### GET /api/teacher/grading/submissions

**Service:** `GradingService.getSubmissions()`
**Archivo:** `apps/backend/src/modules/teacher/services/grading.service.ts`
**Líneas:** 49-76

**Lee desde:**
- `progress.exercise_submissions` (con filtros)
- `auth_management.profiles` (perfil del estudiante) [JOIN]

**Filtros soportados:**
- `status`: 'submitted' | 'graded' | 'reviewed'
- `student_id`: UUID del estudiante
- `sort_by`: 'score' | 'time' | 'submitted_at'
- `page`, `limit`: Paginación

**Código clave:**
```typescript
// Línea 50-56: Query builder con filtros
const qb = this.submissionRepository
  .createQueryBuilder('submission')
  .leftJoinAndSelect('auth_management.profiles', 'profile', 'profile.user_id = submission.user_id');

if (query.status) {
  qb.andWhere('submission.status = :status', { status: query.status });
}
```

**Retorna:**
```typescript
{
  submissions: ExerciseSubmission[],
  total: number,
  page: number,
  limit: number
}
```

---

### 2. Admin Portal

#### GET /api/admin/dashboard/stats

**Service:** `AdminDashboardService.getDashboardStats()`
**Archivo:** `apps/backend/src/modules/admin/services/admin-dashboard.service.ts`
**Líneas:** 67-109

**Lee desde:**
- `auth.users` (total usuarios, activos, nuevos)
- `auth.tenants` (total organizaciones)
- `educational_content.exercises` (total ejercicios)
- `educational_content.modules` (total módulos)
- `audit_logging.activity_log` (actividad reciente)

**Código clave:**
```typescript
// Línea 72-93: Queries en paralelo
const [
  totalUsers,
  activeUsers24h,
  newUsersToday,
  totalOrganizations,
  totalExercises,
  totalModules,
  exercisesCompleted24h,
] = await Promise.all([
  this.userRepo.count(),
  this.getActiveUsers24h(oneDayAgo),  // Usa last_sign_in_at
  this.userRepo.count({ where: { created_at: MoreThanOrEqual(todayStart) } }),
  this.tenantRepo.count(),
  this.exerciseRepo.count(),
  this.moduleRepo.count(),
  this.getExercisesCompleted24h(oneDayAgo),
]);
```

**Retorna:**
```typescript
{
  totalUsers: number,
  activeUsers: number,           // Últimas 24h (usa last_sign_in_at)
  newUsersToday: number,
  totalOrganizations: number,
  totalExercises: number,
  totalModules: number,
  exercisesCompleted24h: number,
  systemHealth: 'healthy' | 'warning' | 'critical',
  avgResponseTime: number
}
```

---

#### GET /api/admin/actions/recent

**Service:** `AdminDashboardService.getRecentActions()`
**Archivo:** `apps/backend/src/modules/admin/services/admin-dashboard.service.ts`
**Líneas:** 536-592

**Estado:** ✅ **IMPLEMENTADO** (corrige BUG-ADMIN-002)

**Lee desde:**
- `auth.users` (usuarios creados recientemente)
- `auth.tenants` (organizaciones actualizadas)

**Código clave:**
```typescript
// Línea 539-550: Query recent user creations
const recentUserCreations = await this.authConnection.query(
  `SELECT
    'user_created' as type,
    'Super Admin' as user,
    'Usuario ' || email || ' creado' as description,
    created_at as timestamp,
    'success' as status
  FROM auth.users
  WHERE created_at >= NOW() - INTERVAL '7 days'
  ORDER BY created_at DESC
  LIMIT $1`,
  [Math.min(limit, 50)],
);
```

**Retorna:**
```typescript
[{
  type: 'user_created' | 'organization_updated',
  user: string,          // Nombre del admin
  description: string,   // Descripción de la acción
  timestamp: Date,
  status: 'success' | 'error'
}]
```

---

#### GET /api/admin/alerts

**Service:** `AdminDashboardService.getAlerts()`
**Archivo:** `apps/backend/src/modules/admin/services/admin-dashboard.service.ts`
**Líneas:** 606-709

**Estado:** ✅ **IMPLEMENTADO** (corrige BUG-ADMIN-003)

**Lee desde:**
- `educational_content.content_approvals` (contenidos pendientes)
- `auth.users` (usuarios inactivos, sin verificar)
- `audit_logging.activity_log` (baja participación)

**Código clave:**
```typescript
// Línea 611-627: ALERT 1 - Pending content
const pendingContent = await this.authConnection.query(
  `SELECT COUNT(*) as count
   FROM educational_content.content_approvals
   WHERE status = 'pending'`,
);

// Línea 630-646: ALERT 2 - Inactive users
const inactiveUsers = await this.authConnection.query(
  `SELECT COUNT(*) as count
   FROM auth.users
   WHERE last_sign_in_at < NOW() - INTERVAL '30 days'
   AND deleted_at IS NULL`,
);
```

**Retorna:**
```typescript
[{
  id: string,
  type: 'content' | 'security' | 'system' | 'performance',
  severity: 'critical' | 'high' | 'medium' | 'low',
  message: string,
  timestamp: Date,
  acknowledged: boolean
}]
```

---

#### GET /api/admin/analytics/user-activity

**Service:** `AdminDashboardService.getUserActivity()`
**Archivo:** `apps/backend/src/modules/admin/services/admin-dashboard.service.ts`
**Líneas:** 721-787

**Estado:** ✅ **IMPLEMENTADO** (corrige BUG-ADMIN-004)

**Lee desde:**
- `auth.users.last_sign_in_at` (actividad de usuarios)

**Parámetros:**
- `startDate`: Fecha de inicio (default: últimos 30 días)
- `endDate`: Fecha de fin (default: hoy)
- `groupBy`: 'day' | 'week' | 'month'

**Código clave:**
```typescript
// Línea 754-765: Query con agrupación temporal
const activityData = await this.authConnection.query(
  `SELECT
    TO_CHAR(DATE_TRUNC($3, last_sign_in_at), $4) as period,
    COUNT(DISTINCT id) as active_users
  FROM auth.users
  WHERE last_sign_in_at >= $1
    AND last_sign_in_at <= $2
    AND deleted_at IS NULL
  GROUP BY DATE_TRUNC($3, last_sign_in_at)
  ORDER BY DATE_TRUNC($3, last_sign_in_at) ASC`,
  [start, end, dateTrunc, dateFormat],
);
```

**Retorna:**
```typescript
{
  labels: string[],      // ['2025-11-01', '2025-11-02', ...]
  data: number[]         // [45, 52, 38, ...]
}
```

---

## 🔍 VALIDACIÓN DE INTEGRACIÓN BD-BACKEND

### Método 1: Validar persistencia de submission

```bash
# 1. Enviar submission desde frontend/Postman
POST /api/v1/progress/submissions
{
  "userId": "<user_id>",
  "exerciseId": "<exercise_id>",
  "answers": { "question1": "answer1" }
}

# 2. Validar en BD usando psql
psql -h localhost -U gamilit_user -d gamilit_db

SELECT id, user_id, exercise_id, score, is_correct, status, submitted_at, graded_at
FROM progress.exercise_submissions
WHERE user_id = '<user_id>' AND exercise_id = '<exercise_id>'
ORDER BY submitted_at DESC LIMIT 1;

# 3. Validar XP otorgada
SELECT total_xp, level, current_rank
FROM gamification_system.user_stats
WHERE user_id = '<user_id>';

# 4. Validar ML Coins otorgadas
SELECT user_id, amount, transaction_type, description, created_at
FROM gamification_system.ml_coins_transactions
WHERE user_id = '<user_id>'
ORDER BY created_at DESC LIMIT 5;
```

### Método 2: Validar actualización de last_sign_in_at

```bash
# 1. Login desde frontend/Postman
POST /api/auth/login
{
  "email": "estudiante@example.com",
  "password": "password123"
}

# 2. Validar en BD
SELECT id, email, last_sign_in_at, created_at
FROM auth.users
WHERE email = 'estudiante@example.com';

# Debe mostrar last_sign_in_at actualizado a timestamp del login
```

### Método 3: Validar progreso de módulo

```bash
# 1. Actualizar progreso desde frontend/Postman
PATCH /api/v1/progress/modules/<progress_id>/percentage
{
  "percentage": 75
}

# 2. Validar en BD
SELECT id, user_id, module_id, progress_percentage, status, last_accessed_at
FROM progress.user_module_progress
WHERE id = '<progress_id>';

# Debe mostrar progress_percentage = 75 y status = 'in_progress'
```

---

## 📊 MATRIZ DE COBERTURA

| Operación | Endpoint | Service | Tabla BD | Estado |
|-----------|----------|---------|----------|--------|
| **Crear Submission** | POST /submissions | ExerciseSubmissionService.submitExercise() | progress.exercise_submissions | ✅ |
| **Crear Attempt** | POST /attempts | ExerciseAttemptService.submitAttempt() | progress.exercise_attempts | ✅ |
| **Crear Module Progress** | POST /modules | ModuleProgressService.create() | progress.user_module_progress | ✅ |
| **Actualizar Progreso** | PATCH /modules/:id/percentage | ModuleProgressService.updateProgressPercentage() | progress.user_module_progress | ✅ |
| **Completar Módulo** | POST /modules/:id/complete | ModuleProgressService.completeModule() | progress.user_module_progress | ✅ |
| **Calificar Submission** | POST /grading/:id/feedback | GradingService.submitFeedback() | progress.exercise_submissions | ✅ |
| **Calificar Batch** | POST /grading/bulk | GradingService.bulkGrade() | progress.exercise_submissions | ✅ |
| **Login** | POST /auth/login | AuthService.login() | auth.users.last_sign_in_at | ✅ |
| **Otorgar XP** | - | UserStatsService.addXp() | gamification_system.user_stats | ✅ |
| **Otorgar ML Coins** | - | MLCoinsService.addCoins() | gamification_system.ml_coins_transactions | ✅ |
| **Leer Progreso Estudiante** | GET /teacher/students/:id/progress | StudentProgressService.getStudentProgress() | Multiple | ⚠️ Falta controller |
| **Leer Submission** | GET /teacher/grading/:id | GradingService.getSubmissionById() | progress.exercise_submissions | ⚠️ Falta controller |
| **Leer Dashboard Stats** | GET /admin/dashboard/stats | AdminDashboardService.getDashboardStats() | Multiple | ✅ |
| **Leer Recent Actions** | GET /admin/actions/recent | AdminDashboardService.getRecentActions() | auth.users, auth.tenants | ✅ |
| **Leer Alerts** | GET /admin/alerts | AdminDashboardService.getAlerts() | Multiple | ✅ |
| **Leer User Activity** | GET /admin/analytics/user-activity | AdminDashboardService.getUserActivity() | auth.users | ✅ |

**Leyenda:**
- ✅ Implementado y funcional
- ⚠️ Service implementado, falta controller
- ❌ No implementado

---

**FIN DEL INVENTARIO**

**Fecha:** 2025-11-24
**Agente:** Backend-Agent
**Estado:** ✅ INVENTARIO COMPLETO
