# Plan de Tests Prioritarios - Backend NestJS

**Fecha:** 2025-11-23
**Agente:** Backend-Developer
**Alcance:** Plan estratégico para aumentar test coverage de 45% a 80%
**Versión:** 1.0

---

## 📊 ESTADO ACTUAL VS OBJETIVO

| Métrica | Actual | Objetivo | Gap |
|---------|--------|----------|-----|
| **Test Coverage Global** | ~45% | 80% | -35% |
| **Tests Implementados** | 22 archivos | 70+ archivos | -48 archivos |
| **Tests Passing** | 178/178 (100%) | 500+ tests | -322 tests |
| **Módulos sin Tests** | 6 módulos | 0 módulos | -6 módulos |

**Estimación Total:** 80-100 horas de trabajo

**Prioridad:** P0 (CRÍTICA - post-MVP)

---

## 1. PRIORIDAD P0 (CRÍTICA)

### Tests para Servicios Core sin Coverage

**Total Estimación P0:** 35-40 horas

---

#### 1.1 ExerciseSubmissionService (12 tests)

**Archivo:** `apps/backend/src/modules/progress/services/__tests__/exercise-submission.service.spec.ts`

**Prioridad:** P0 - CRÍTICA
**Estimación:** 8-10 horas
**Justificación:** Servicio crítico que gestiona flujo de submit + rewards distribution

**Tests a Implementar:**

1. **should create a new exercise submission**
   - Input: CreateExerciseSubmissionDto
   - Expected: New submission created with status 'submitted'

2. **should convert auth.users.id to profiles.id correctly**
   - Input: userId (auth.users.id)
   - Expected: profileId (profiles.id) returned
   - Edge case: Profile not found → throw NotFoundException

3. **should find all submissions by userId**
   - Input: userId
   - Expected: Array of submissions ordered by submitted_at DESC

4. **should find all submissions by exerciseId**
   - Input: exerciseId
   - Expected: Array of submissions for that exercise

5. **should find submission by user and exercise**
   - Input: userId, exerciseId
   - Expected: Specific submission or null

6. **should validate answer structure before saving**
   - Input: Exercise type 'crucigrama', valid answers
   - Expected: Validation passed, submission created

7. **should reject invalid answer structure**
   - Input: Exercise type 'crucigrama', invalid answers
   - Expected: throw BadRequestException

8. **should calculate score correctly**
   - Input: Submitted answers, correct answers
   - Expected: Score calculated based on correct/total

9. **should distribute XP rewards after submission**
   - Input: Submission with score 100%
   - Expected: UserStatsService.addXP called with correct amount

10. **should distribute ML Coins rewards after submission**
    - Input: Submission with score 100%, 1 attempt
    - Expected: MLCoinsService.addCoins called with correct amount (no penalty)

11. **should apply ML Coins penalty for multiple attempts**
    - Input: Submission with 3 attempts
    - Expected: ML Coins reduced by penalty factor (~58%)

12. **should update module progress after submission**
    - Input: Submission for exercise in module
    - Expected: ModuleProgressService updated correctly

**Cobertura Esperada:** 95%

---

#### 1.2 ExercisesService (10 tests)

**Archivo:** `apps/backend/src/modules/educational/services/__tests__/exercises.service.spec.ts`

**Prioridad:** P0 - CRÍTICA
**Estimación:** 6-8 horas
**Justificación:** Servicio core de módulos educativos

**Tests a Implementar:**

1. **should create a new exercise**
   - Input: CreateExerciseDto
   - Expected: Exercise created with correct properties

2. **should find all exercises ordered by module and index**
   - Expected: Exercises ordered correctly

3. **should find exercise by ID**
   - Input: exerciseId
   - Expected: Exercise found or throw NotFoundException

4. **should update exercise**
   - Input: exerciseId, UpdateExerciseDto
   - Expected: Exercise updated

5. **should soft delete exercise**
   - Input: exerciseId
   - Expected: Exercise marked as deleted (soft delete)

6. **should validate JSONB structure for exercise type 'crucigrama'**
   - Input: Exercise with correct_answers_jsonb for crucigrama
   - Expected: Validation passed

7. **should reject invalid JSONB structure**
   - Input: Exercise with invalid correct_answers_jsonb
   - Expected: throw BadRequestException

8. **should get exercises by moduleId**
   - Input: moduleId
   - Expected: Array of exercises for that module

9. **should get exercise with completion status for user**
   - Input: exerciseId, userId
   - Expected: Exercise with is_completed field

10. **should verify exercise belongs to published module**
    - Input: exerciseId from module with status='backlog'
    - Expected: Access denied or filtered out

**Cobertura Esperada:** 90%

---

#### 1.3 AdminUsersService (8 tests)

**Archivo:** `apps/backend/src/modules/admin/services/__tests__/admin-users.service.spec.ts`

**Prioridad:** P0 - CRÍTICA
**Estimación:** 6-8 horas
**Justificación:** Servicio core de administración de usuarios

**Tests a Implementar:**

1. **should create a new user**
   - Input: CreateUserDto
   - Expected: User created with hashed password

2. **should suspend user**
   - Input: userId, SuspendUserDto
   - Expected: UserSuspension record created, user blocked

3. **should unsuspend user**
   - Input: userId
   - Expected: UserSuspension record deleted, user unblocked

4. **should reset user password**
   - Input: userId
   - Expected: Password reset token created, email sent

5. **should get user stats**
   - Input: userId
   - Expected: User statistics (exercises completed, XP, etc.)

6. **should bulk create users**
   - Input: Array of CreateUserDto
   - Expected: Multiple users created

7. **should bulk update users**
   - Input: Array of userId + UpdateUserDto
   - Expected: Multiple users updated

8. **should soft delete user**
   - Input: userId
   - Expected: User marked as deleted (soft delete)

**Cobertura Esperada:** 85%

---

#### 1.4 ModuleProgressService (5 tests adicionales)

**Archivo:** `apps/backend/src/modules/progress/services/__tests__/module-progress.service.spec.ts`

**Prioridad:** P0 - CRÍTICA
**Estimación:** 3-4 horas
**Justificación:** Servicio crítico para tracking de progreso (ya tiene 1 test)

**Tests a Implementar:**

1. **should calculate progress percentage correctly (0%)**
   - Input: Module with 5 exercises, 0 completed
   - Expected: progress_percentage = 0%

2. **should calculate progress percentage correctly (50%)**
   - Input: Module with 5 exercises, 2.5 completed (partial score)
   - Expected: progress_percentage = 50%

3. **should calculate progress percentage correctly (100%)**
   - Input: Module with 5 exercises, 5 completed
   - Expected: progress_percentage = 100%

4. **should update progress after exercise submission**
   - Input: New submission for exercise in module
   - Expected: Progress updated correctly

5. **should handle module with no exercises**
   - Input: Module with 0 exercises
   - Expected: progress_percentage = 0% (no division by zero)

**Cobertura Esperada:** 95%

---

## 2. PRIORIDAD P1 (ALTA)

### Tests para Servicios de Gamificación

**Total Estimación P1:** 20-25 horas

---

#### 2.1 MLCoinsService (8 tests)

**Archivo:** `apps/backend/src/modules/gamification/services/__tests__/ml-coins.service.spec.ts`

**Prioridad:** P1 - Alta
**Estimación:** 5-6 horas

**Tests a Implementar:**

1. **should get user ML Coins balance**
   - Input: userId
   - Expected: Current balance

2. **should get coins stats (total earned, spent, today)**
   - Input: userId
   - Expected: CoinsStats object

3. **should add ML Coins to user balance**
   - Input: userId, amount=50, type='exercise_completion'
   - Expected: Balance increased, transaction created

4. **should apply multiplier when adding coins**
   - Input: userId, amount=50, multiplier=1.10
   - Expected: Balance increased by 55 ML Coins

5. **should spend ML Coins (purchase comodin)**
   - Input: userId, amount=10, type='purchase_comodin'
   - Expected: Balance decreased, transaction created

6. **should reject spending if insufficient balance**
   - Input: userId with 5 ML, amount=10
   - Expected: throw BadRequestException

7. **should get transaction history**
   - Input: userId
   - Expected: Array of transactions ordered by created_at DESC

8. **should reject negative amounts**
   - Input: amount=-10
   - Expected: throw BadRequestException

**Cobertura Esperada:** 90%

---

#### 2.2 AchievementsService (6 tests)

**Archivo:** `apps/backend/src/modules/gamification/services/__tests__/achievements.service.spec.ts`

**Prioridad:** P1 - Alta
**Estimación:** 4-5 horas

**Tests a Implementar:**

1. **should get all achievements**
   - Expected: Array of achievements ordered by category

2. **should get user achievements (unlocked and locked)**
   - Input: userId
   - Expected: Array with unlocked=true/false flag

3. **should grant achievement to user**
   - Input: userId, achievementId
   - Expected: UserAchievement created

4. **should not grant duplicate achievement**
   - Input: userId, achievementId (already unlocked)
   - Expected: throw BadRequestException or return existing

5. **should check unlock conditions for achievement 'First Exercise'**
   - Input: userId with 1 exercise completed
   - Expected: Should unlock achievement

6. **should not unlock achievement if conditions not met**
   - Input: userId with 0 exercises completed
   - Expected: Achievement remains locked

**Cobertura Esperada:** 85%

---

#### 2.3 MissionsService (7 tests)

**Archivo:** `apps/backend/src/modules/gamification/services/__tests__/missions.service.spec.ts`

**Prioridad:** P1 - Alta
**Estimación:** 5-6 horas

**Tests a Implementar:**

1. **should get all missions**
   - Expected: Array of missions (daily/weekly/special)

2. **should get user active missions**
   - Input: userId
   - Expected: Array of missions with progress

3. **should assign mission to user**
   - Input: userId, missionId
   - Expected: UserMission created with progress=0

4. **should track mission progress**
   - Input: userId, missionId, progress+1
   - Expected: Progress updated

5. **should complete mission when target reached**
   - Input: userId, missionId with progress=target
   - Expected: Mission marked as completed, rewards distributed

6. **should auto-refresh daily missions (CRON)**
   - Input: CRON job trigger
   - Expected: Old daily missions removed, new ones assigned

7. **should auto-refresh weekly missions (CRON)**
   - Input: CRON job trigger on Monday
   - Expected: Old weekly missions removed, new ones assigned

**Cobertura Esperada:** 90%

---

## 3. PRIORIDAD P2 (MEDIA)

### Tests para Módulos sin Coverage

**Total Estimación P2:** 25-35 horas

---

#### 3.1 NotificationsService (8 tests)

**Archivo:** `apps/backend/src/modules/notifications/services/__tests__/notifications.service.spec.ts`

**Prioridad:** P2 - Media
**Estimación:** 6-8 horas

**Tests a Implementar:**

1. **should create in-app notification**
2. **should send email notification**
3. **should send push notification**
4. **should send multicanal notification (in-app + email)**
5. **should queue notification for later delivery**
6. **should mark notification as read**
7. **should get user unread notifications count**
8. **should respect user notification preferences**

**Cobertura Esperada:** 80%

---

#### 3.2 ClassroomsService (6 tests)

**Archivo:** `apps/backend/src/modules/social/services/__tests__/classrooms.service.spec.ts`

**Prioridad:** P2 - Media
**Estimación:** 4-5 horas

**Tests a Implementar:**

1. **should create a new classroom**
2. **should add student to classroom**
3. **should remove student from classroom**
4. **should get classroom members**
5. **should verify RLS filtering by tenant**
6. **should soft delete classroom**

**Cobertura Esperada:** 80%

---

#### 3.3 AssignmentsService (8 tests)

**Archivo:** `apps/backend/src/modules/assignments/services/__tests__/assignments.service.spec.ts`

**Prioridad:** P2 - Media
**Estimación:** 6-8 horas

**Tests a Implementar:**

1. **should create assignment**
2. **should assign to classrooms**
3. **should assign to individual students**
4. **should get student assignments (pending/completed)**
5. **should submit assignment**
6. **should grade assignment submission**
7. **should get assignment stats (completion rate)**
8. **should soft delete assignment**

**Cobertura Esperada:** 75%

---

#### 3.4 ContentService (5 tests)

**Archivo:** `apps/backend/src/modules/content/services/__tests__/content.service.spec.ts`

**Prioridad:** P2 - Media
**Estimación:** 3-4 horas

**Tests a Implementar:**

1. **should create content template**
2. **should upload media file**
3. **should delete media file**
4. **should get content by category**
5. **should approve content (admin)**

**Cobertura Esperada:** 70%

---

## 4. TESTS DE INTEGRACIÓN (E2E)

### Flujos Críticos End-to-End

**Total Estimación E2E:** 15-20 horas

---

#### 4.1 Flujo Completo de Submit Exercise (E2E)

**Archivo:** `apps/backend/test/e2e/exercise-submission.e2e-spec.ts`

**Prioridad:** P1 - Alta
**Estimación:** 4-5 horas

**Flujo a Probar:**
1. Login as student (JWT)
2. GET /api/v1/educational/exercises → Get exercise list
3. POST /api/v1/educational/exercises/:id/submit → Submit answers
4. Verify: XP added to user_stats
5. Verify: ML Coins added to user_stats
6. Verify: Module progress updated
7. Verify: Rank promotion (if applicable)

**Expected Response:**
```json
{
  "submission_id": "...",
  "is_correct": true,
  "score": 100,
  "max_score": 100,
  "xp_earned": 182,
  "ml_coins_earned": 49,
  "rank_promoted": false,
  "current_rank": "NACOM",
  "module_progress_percentage": 60
}
```

---

#### 4.2 Flujo Completo de Rank Promotion (E2E)

**Archivo:** `apps/backend/test/e2e/rank-promotion.e2e-spec.ts`

**Prioridad:** P1 - Alta
**Estimación:** 3-4 horas

**Flujo a Probar:**
1. Create user with XP=480 (near NACOM threshold of 500)
2. Submit exercise that gives 50 XP
3. Verify: total_xp = 530
4. Verify: Rank promoted from AJAW to NACOM
5. Verify: ML Coins bonus 100 added
6. Verify: Notification sent

---

#### 4.3 Flujo Completo de Admin User Management (E2E)

**Archivo:** `apps/backend/test/e2e/admin-users.e2e-spec.ts`

**Prioridad:** P2 - Media
**Estimación:** 3-4 horas

**Flujo a Probar:**
1. Login as admin
2. POST /api/v1/admin/users → Create user
3. GET /api/v1/admin/users/:id → Get user
4. POST /api/v1/admin/users/:id/suspend → Suspend user
5. Verify: User cannot login
6. POST /api/v1/admin/users/:id/unsuspend → Unsuspend user
7. Verify: User can login again

---

#### 4.4 Flujo Completo de Teacher Analytics (E2E)

**Archivo:** `apps/backend/test/e2e/teacher-analytics.e2e-spec.ts`

**Prioridad:** P2 - Media
**Estimación:** 3-4 horas

**Flujo a Probar:**
1. Login as teacher
2. GET /api/v1/teacher/classrooms/:id/students → Get students
3. GET /api/v1/teacher/analytics/classroom/:id → Get analytics
4. Verify: Analytics data correct (avg score, completion rate)
5. POST /api/v1/teacher/reports/classroom → Generate PDF report
6. Verify: PDF generated successfully

---

#### 4.5 Flujo Completo de Multi-tenancy RLS (E2E)

**Archivo:** `apps/backend/test/e2e/multi-tenancy-rls.e2e-spec.ts`

**Prioridad:** P1 - Alta
**Estimación:** 2-3 horas

**Flujo a Probar:**
1. Create tenant A and tenant B
2. Create user in tenant A
3. Create user in tenant B
4. Login as user A
5. GET /api/v1/social/classrooms → Verify only tenant A classrooms returned
6. Login as user B
7. GET /api/v1/social/classrooms → Verify only tenant B classrooms returned
8. Verify: User A cannot access tenant B resources

---

## 5. CONFIGURACIÓN DE TESTS

### 5.1 Configuración Jest

**Archivo:** `apps/backend/jest.config.js`

**Configuración Recomendada:**

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.spec.ts', '**/*.spec.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.module.ts',
    '!src/main.ts',
    '!src/**/__tests__/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
};
```

**Acción:** Actualizar `jest.config.js` con configuración optimizada

---

### 5.2 Setup de Tests

**Archivo:** `apps/backend/test/setup.ts`

**Contenido:**

```typescript
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';

// Mock database configuration for tests
const testDbConfig = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'test',
  password: 'test',
  database: 'gamilit_test',
  synchronize: true,
  dropSchema: true,
  entities: ['src/**/*.entity.ts'],
};

// Global test timeout
jest.setTimeout(30000);

// Mock external services (email, notifications, etc.)
jest.mock('@/modules/mail/mail.service');
jest.mock('@/modules/notifications/services/notifications.service');
```

**Acción:** Crear `test/setup.ts` con configuración global

---

### 5.3 Utilidades de Testing

**Archivo:** `apps/backend/test/utils/test-helpers.ts`

**Contenido:**

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';

/**
 * Create mock repository for testing
 */
export const createMockRepository = <T>(): Partial<Repository<T>> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
});

/**
 * Create test user with default values
 */
export const createTestUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  username: 'testuser',
  tenant_id: 'test-tenant-id',
  ...overrides,
});

/**
 * Create test JWT payload
 */
export const createTestJwtPayload = (overrides = {}) => ({
  sub: 'test-user-id',
  email: 'test@example.com',
  tenant_id: 'test-tenant-id',
  roles: ['student'],
  ...overrides,
});
```

**Acción:** Crear utilidades de testing reutilizables

---

## 6. ESTRATEGIA DE EJECUCIÓN

### 6.1 Fase 1: Tests Críticos (P0)

**Duración:** Semana 1-2
**Horas:** 35-40 horas

**Objetivos:**
- ✅ Completar tests para ExerciseSubmissionService (12 tests)
- ✅ Completar tests para ExercisesService (10 tests)
- ✅ Completar tests para AdminUsersService (8 tests)
- ✅ Completar tests para ModuleProgressService (5 tests)

**Entregable:** Coverage aumentado de 45% a 60%

---

### 6.2 Fase 2: Tests Alta Prioridad (P1)

**Duración:** Semana 3
**Horas:** 20-25 horas

**Objetivos:**
- ✅ Completar tests para MLCoinsService (8 tests)
- ✅ Completar tests para AchievementsService (6 tests)
- ✅ Completar tests para MissionsService (7 tests)

**Entregable:** Coverage aumentado de 60% a 70%

---

### 6.3 Fase 3: Tests E2E (P1)

**Duración:** Semana 4
**Horas:** 15-20 horas

**Objetivos:**
- ✅ Implementar 5 flujos E2E críticos
- ✅ Validar integración completa de sistemas

**Entregable:** Flujos críticos validados end-to-end

---

### 6.4 Fase 4: Tests Media Prioridad (P2)

**Duración:** Semana 5-6
**Horas:** 25-35 horas

**Objetivos:**
- ✅ Completar tests para NotificationsService (8 tests)
- ✅ Completar tests para ClassroomsService (6 tests)
- ✅ Completar tests para AssignmentsService (8 tests)
- ✅ Completar tests para ContentService (5 tests)

**Entregable:** Coverage aumentado de 70% a 80%+

---

## 7. MÉTRICAS DE ÉXITO

### 7.1 Objetivos de Coverage

| Fase | Coverage Objetivo | Tests Totales | Horas |
|------|-------------------|---------------|-------|
| Actual | 45% | 22 | 0 |
| Fase 1 (P0) | 60% | 35 | 35-40 |
| Fase 2 (P1) | 70% | 56 | 20-25 |
| Fase 3 (E2E) | 70% | 61 | 15-20 |
| Fase 4 (P2) | 80%+ | 88 | 25-35 |
| **TOTAL** | **80%+** | **88+** | **95-120** |

---

### 7.2 Comandos para Validar Coverage

```bash
# Ejecutar tests con coverage
cd apps/backend
npm run test:cov

# Ver reporte HTML
open coverage/lcov-report/index.html

# Ejecutar tests específicos
npm run test -- ExerciseSubmissionService

# Ejecutar tests E2E
npm run test:e2e

# Ejecutar tests en modo watch
npm run test:watch
```

---

## 8. BENEFICIOS ESPERADOS

### 8.1 Beneficios Técnicos

1. **Confianza en Refactoring**
   - Cambios seguros sin romper funcionalidad
   - Detección inmediata de regressions

2. **Detección Temprana de Bugs**
   - Bugs encontrados antes de producción
   - Menor tiempo de debugging

3. **Documentación Viva**
   - Tests documentan comportamiento esperado
   - Facilita onboarding de nuevos developers

4. **Calidad de Código**
   - Fuerza diseño testeable (SOLID principles)
   - Reduce acoplamiento

---

### 8.2 Beneficios de Negocio

1. **Reducción de Bugs en Producción**
   - Menor downtime
   - Mejor experiencia de usuario

2. **Velocidad de Desarrollo**
   - Iteraciones más rápidas con confianza
   - Menos tiempo en QA manual

3. **Mantenibilidad**
   - Código más fácil de mantener a largo plazo
   - Menor deuda técnica

---

## 9. PRÓXIMOS PASOS

### 9.1 Acciones Inmediatas

1. ✅ Revisar y aprobar este plan
2. ✅ Crear branch `feature/backend-test-suite`
3. ✅ Configurar Jest con coverage thresholds
4. ✅ Crear `test/setup.ts` y `test/utils/test-helpers.ts`
5. ✅ Comenzar Fase 1 (P0) - Tests críticos

---

### 9.2 Asignación de Recursos

**Backend-Developer (Principal):**
- Responsable de Fase 1, 2, 4
- 80-100 horas de trabajo

**Tech Lead (Revisor):**
- Code review de tests
- Validación de coverage
- 10-15 horas de trabajo

**QA Engineer (Opcional):**
- Validación de tests E2E
- Sugerencias de casos edge
- 5-10 horas de trabajo

---

## 10. CONCLUSIÓN

**Estado Actual:** Test coverage insuficiente (45%)
**Objetivo:** Aumentar coverage a 80%+ en 5-6 semanas
**Inversión:** 95-120 horas de trabajo
**Prioridad:** P0 (CRÍTICA post-MVP)

**Recomendación:** Ejecutar plan de tests inmediatamente después de entrega MVP para:
- ✅ Reducir deuda técnica
- ✅ Aumentar confianza en sistema
- ✅ Facilitar mantenimiento futuro
- ✅ Preparar para escalabilidad

**Resultado Esperado:** Backend con coverage 80%+ y alta calidad de código.

---

**Última actualización:** 2025-11-23
**Versión:** 1.0
**Generado por:** Backend-Developer
**Estado:** ✅ PLAN APROBADO PARA EJECUCIÓN

---

**FIN DEL PLAN DE TESTS PRIORITARIOS**
