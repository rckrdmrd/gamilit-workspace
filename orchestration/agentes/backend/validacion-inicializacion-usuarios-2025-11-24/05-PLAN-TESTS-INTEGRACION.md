# PLAN DE TESTS DE INTEGRACIÓN

**Fecha:** 2025-11-24
**Agente:** Backend-Agent
**Contexto:** Tests recomendados post-corrección de inicialización de usuarios
**Objetivo:** Validar flujos end-to-end del backend

---

## RESUMEN EJECUTIVO

Este documento especifica un plan completo de tests de integración para validar que el backend funciona correctamente después de las correcciones de inicialización de usuarios.

**Alcance:**
- ✅ Registro e inicialización de usuarios
- ✅ Login y autenticación
- ✅ Obtención de estadísticas
- ✅ Flujo completo de misiones
- ✅ Actualización de user_stats

**Framework:** Jest + Supertest
**Ubicación:** `apps/backend/test/integration/`

---

## CONFIGURACIÓN DE TESTS

### Setup de Base de Datos de Test

**Archivo:** `apps/backend/test/integration/setup.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@/app.module';
import { DataSource } from 'typeorm';

export let app: INestApplication;
export let dataSource: DataSource;

export async function setupTestApp(): Promise<void> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleFixture.createNestApplication();
  await app.init();

  dataSource = app.get(DataSource);
}

export async function teardownTestApp(): Promise<void> {
  await dataSource.destroy();
  await app.close();
}

export async function cleanDatabase(): Promise<void> {
  // Limpiar tablas en orden inverso a FKs
  await dataSource.query('DELETE FROM progress_tracking.module_progress;');
  await dataSource.query('DELETE FROM gamification_system.comodines_inventory;');
  await dataSource.query('DELETE FROM gamification_system.user_ranks;');
  await dataSource.query('DELETE FROM gamification_system.user_stats;');
  await dataSource.query('DELETE FROM auth_management.profiles;');
  await dataSource.query('DELETE FROM auth.users;');
}
```

---

## TEST SUITE 1: Registro e Inicialización

### Test 1.1: Registro Exitoso con Inicialización Completa

**Objetivo:** Validar que el registro de usuario inicializa todas las tablas relacionadas

**Archivo:** `apps/backend/test/integration/auth/register.spec.ts`

```typescript
import request from 'supertest';
import { setupTestApp, teardownTestApp, cleanDatabase, app, dataSource } from '../setup';
import { Repository } from 'typeorm';
import { User } from '@/modules/auth/entities/user.entity';
import { Profile } from '@/modules/auth/entities/profile.entity';
import { UserStats } from '@/modules/gamification/entities/user-stats.entity';
import { ComodinesInventory } from '@/modules/gamification/entities/comodines-inventory.entity';
import { ModuleProgress } from '@/modules/progress/entities/module-progress.entity';
import { UserRank } from '@/modules/gamification/entities/user-rank.entity';

describe('POST /api/auth/register (Integration)', () => {
  let userRepo: Repository<User>;
  let profileRepo: Repository<Profile>;
  let userStatsRepo: Repository<UserStats>;
  let comodinesRepo: Repository<ComodinesInventory>;
  let moduleProgressRepo: Repository<ModuleProgress>;
  let userRankRepo: Repository<UserRank>;

  beforeAll(async () => {
    await setupTestApp();
    userRepo = dataSource.getRepository(User);
    profileRepo = dataSource.getRepository(Profile);
    userStatsRepo = dataSource.getRepository(UserStats);
    comodinesRepo = dataSource.getRepository(ComodinesInventory);
    moduleProgressRepo = dataSource.getRepository(ModuleProgress);
    userRankRepo = dataSource.getRepository(UserRank);
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  it('debe crear usuario con profile y estadísticas inicializadas', async () => {
    // Act: Registrar usuario
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        first_name: 'Test',
        last_name: 'User',
      })
      .expect(201);

    // Assert: Respuesta del endpoint
    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toBe('test@example.com');
    expect(response.body.role).toBe('student');
    expect(response.body).not.toHaveProperty('encrypted_password'); // No debe exponer password

    const userId = response.body.id;

    // Assert: Usuario creado en auth.users
    const user = await userRepo.findOne({ where: { id: userId } });
    expect(user).toBeDefined();
    expect(user.email).toBe('test@example.com');

    // Assert: Profile creado con estrategia unificada
    const profile = await profileRepo.findOne({ where: { user_id: userId } });
    expect(profile).toBeDefined();
    expect(profile.id).toBe(userId); // ✅ CRÍTICO: profiles.id = auth.users.id
    expect(profile.user_id).toBe(userId); // ✅ self-reference
    expect(profile.email).toBe('test@example.com');
    expect(profile.first_name).toBe('Test');
    expect(profile.last_name).toBe('User');

    // Assert: UserStats inicializado
    const stats = await userStatsRepo.findOne({ where: { user_id: userId } });
    expect(stats).toBeDefined();
    expect(stats.user_id).toBe(userId); // ✅ Apunta a auth.users.id
    expect(stats.ml_coins).toBe(100); // Welcome bonus
    expect(stats.ml_coins_earned_total).toBe(100);
    expect(stats.level).toBe(1);
    expect(stats.total_xp).toBe(0);
    expect(stats.current_rank).toBe('Ajaw');
    expect(stats.current_streak).toBe(0);
    expect(stats.exercises_completed).toBe(0);

    // Assert: ComodinesInventory inicializado
    const comodines = await comodinesRepo.findOne({ where: { user_id: profile.id } });
    expect(comodines).toBeDefined();
    expect(comodines.user_id).toBe(profile.id); // ✅ Apunta a profiles.id
    expect(comodines.pistas_available).toBe(0);
    expect(comodines.vision_lectora_available).toBe(0);
    expect(comodines.segunda_oportunidad_available).toBe(0);

    // Assert: UserRank inicializado
    const rank = await userRankRepo.findOne({ where: { user_id: userId } });
    expect(rank).toBeDefined();
    expect(rank.user_id).toBe(userId); // ✅ Apunta a auth.users.id
    expect(rank.current_rank).toBe('Ajaw');
    expect(rank.rank_progress_percentage).toBe(0);

    // Assert: ModuleProgress inicializado para todos los módulos publicados
    const moduleProgress = await moduleProgressRepo.find({ where: { user_id: profile.id } });
    expect(moduleProgress.length).toBeGreaterThan(0); // Al menos 1 módulo publicado
    moduleProgress.forEach((progress) => {
      expect(progress.user_id).toBe(profile.id); // ✅ Apunta a profiles.id
      expect(progress.status).toBe('not_started');
      expect(progress.progress_percentage).toBe(0);
    });
  });

  it('debe fallar con email duplicado', async () => {
    // Arrange: Crear usuario previo
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'duplicate@example.com',
        password: 'SecurePass123!',
      })
      .expect(201);

    // Act & Assert: Intentar registrar con mismo email
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'duplicate@example.com',
        password: 'AnotherPass456!',
      })
      .expect(409); // Conflict
  });

  it('debe validar password mínimo 8 caracteres', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'short',
      })
      .expect(400); // Bad Request
  });

  it('debe validar formato de email', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'invalid-email',
        password: 'SecurePass123!',
      })
      .expect(400); // Bad Request
  });
});
```

---

## TEST SUITE 2: Login y Estadísticas

### Test 2.1: Login Exitoso

**Archivo:** `apps/backend/test/integration/auth/login.spec.ts`

```typescript
describe('POST /api/auth/login (Integration)', () => {
  let testUserId: string;

  beforeAll(async () => {
    await setupTestApp();
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  beforeEach(async () => {
    await cleanDatabase();

    // Crear usuario de prueba
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'logintest@example.com',
        password: 'SecurePass123!',
      });
    testUserId = response.body.id;
  });

  it('debe autenticar con credenciales correctas', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'logintest@example.com',
        password: 'SecurePass123!',
      })
      .expect(200);

    expect(response.body).toHaveProperty('user');
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');

    expect(response.body.user.id).toBe(testUserId);
    expect(response.body.user.email).toBe('logintest@example.com');
    expect(response.body.accessToken).toBeTruthy();
  });

  it('debe fallar con credenciales incorrectas', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'logintest@example.com',
        password: 'WrongPassword123!',
      })
      .expect(401); // Unauthorized
  });

  it('debe fallar con email no registrado', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'SecurePass123!',
      })
      .expect(401); // Unauthorized
  });
});
```

### Test 2.2: Obtener Estadísticas sin Error 404

**Archivo:** `apps/backend/test/integration/gamification/user-stats.spec.ts`

```typescript
describe('GET /api/v1/gamification/users/:userId/stats (Integration)', () => {
  let testUserId: string;
  let accessToken: string;

  beforeAll(async () => {
    await setupTestApp();
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  beforeEach(async () => {
    await cleanDatabase();

    // Crear usuario y autenticar
    const registerRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'statstest@example.com',
        password: 'SecurePass123!',
      });
    testUserId = registerRes.body.id;

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'statstest@example.com',
        password: 'SecurePass123!',
      });
    accessToken = loginRes.body.accessToken;
  });

  it('debe retornar estadísticas sin error 404', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/gamification/users/${testUserId}/stats`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    // Assert: Estructura de estadísticas
    expect(response.body).toHaveProperty('user_id', testUserId);
    expect(response.body).toHaveProperty('level', 1);
    expect(response.body).toHaveProperty('total_xp', 0);
    expect(response.body).toHaveProperty('ml_coins', 100);
    expect(response.body).toHaveProperty('current_rank', 'Ajaw');
    expect(response.body).toHaveProperty('current_streak', 0);
    expect(response.body).toHaveProperty('exercises_completed', 0);
  });

  it('debe retornar 401 sin autenticación', async () => {
    await request(app.getHttpServer())
      .get(`/api/v1/gamification/users/${testUserId}/stats`)
      .expect(401);
  });

  it('debe retornar resumen de gamificación', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/gamification/users/${testUserId}/summary`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('userId', testUserId);
    expect(response.body).toHaveProperty('level', 1);
    expect(response.body).toHaveProperty('totalXP', 0);
    expect(response.body).toHaveProperty('mlCoins', 100);
    expect(response.body).toHaveProperty('rank', 'Ajaw');
    expect(response.body).toHaveProperty('rankColor');
    expect(response.body).toHaveProperty('progressToNextLevel');
  });
});
```

---

## TEST SUITE 3: Flujo de Misiones

### Test 3.1: Obtener Misiones Diarias

**Archivo:** `apps/backend/test/integration/gamification/missions.spec.ts`

```typescript
describe('GET /api/v1/gamification/missions/* (Integration)', () => {
  let testUserId: string;
  let accessToken: string;

  beforeAll(async () => {
    await setupTestApp();
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  beforeEach(async () => {
    await cleanDatabase();

    // Setup: Crear usuario y autenticar
    const registerRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({
        email: 'missions@example.com',
        password: 'SecurePass123!',
      });
    testUserId = registerRes.body.id;

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({
        email: 'missions@example.com',
        password: 'SecurePass123!',
      });
    accessToken = loginRes.body.accessToken;
  });

  it('debe generar 3 misiones diarias automáticamente', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/gamification/missions/daily')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toHaveLength(3);

    response.body.forEach((mission: any) => {
      expect(mission).toHaveProperty('id');
      expect(mission).toHaveProperty('mission_type', 'daily');
      expect(mission).toHaveProperty('status', 'active');
      expect(mission).toHaveProperty('objectives');
      expect(mission).toHaveProperty('rewards');
      expect(mission.objectives).toBeInstanceOf(Array);
      expect(mission.rewards).toHaveProperty('ml_coins');
      expect(mission.rewards).toHaveProperty('xp');
    });
  });

  it('debe generar 2 misiones semanales automáticamente', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/gamification/missions/weekly')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toHaveLength(2);

    response.body.forEach((mission: any) => {
      expect(mission).toHaveProperty('mission_type', 'weekly');
      expect(mission).toHaveProperty('status', 'active');
    });
  });

  it('debe retornar array vacío para misiones especiales', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/gamification/missions/special')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toEqual([]); // No hay misiones especiales por defecto
  });
});
```

### Test 3.2: Actualizar Progreso de Misión

```typescript
describe('PATCH /api/v1/gamification/missions/:id/progress (Integration)', () => {
  let missionId: string;
  let accessToken: string;

  beforeEach(async () => {
    await cleanDatabase();

    // Setup: Usuario + misiones
    const registerRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'progress@example.com', password: 'SecurePass123!' });

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'progress@example.com', password: 'SecurePass123!' });
    accessToken = loginRes.body.accessToken;

    const missionsRes = await request(app.getHttpServer())
      .get('/api/v1/gamification/missions/daily')
      .set('Authorization', `Bearer ${accessToken}`);
    missionId = missionsRes.body[0].id;
  });

  it('debe actualizar progreso de objetivo', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/api/v1/gamification/missions/${missionId}/progress`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        objective_type: 'complete_exercises',
        increment: 1,
      })
      .expect(200);

    expect(response.body).toHaveProperty('objectives');
    expect(response.body.objectives[0].current).toBe(1);
    expect(response.body.progress).toBeGreaterThan(0);
    expect(response.body.status).toBe('in_progress');
  });

  it('debe marcar como completada al alcanzar 100%', async () => {
    // Completar objetivo (target = 3)
    await request(app.getHttpServer())
      .patch(`/api/v1/gamification/missions/${missionId}/progress`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        objective_type: 'complete_exercises',
        increment: 3,
      })
      .expect(200);

    // Verificar que está completada
    const missionsRes = await request(app.getHttpServer())
      .get('/api/v1/gamification/missions/daily')
      .set('Authorization', `Bearer ${accessToken}`);

    const mission = missionsRes.body.find((m: any) => m.id === missionId);
    expect(mission.status).toBe('completed');
    expect(mission.progress).toBe(100);
  });
});
```

### Test 3.3: Reclamar Recompensas sin Error 404

```typescript
describe('POST /api/v1/gamification/missions/:id/claim (Integration)', () => {
  let missionId: string;
  let testUserId: string;
  let accessToken: string;
  let statsRepo: Repository<UserStats>;

  beforeAll(async () => {
    await setupTestApp();
    statsRepo = dataSource.getRepository(UserStats);
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  beforeEach(async () => {
    await cleanDatabase();

    // Setup: Usuario + misión completada
    const registerRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'claim@example.com', password: 'SecurePass123!' });
    testUserId = registerRes.body.id;

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'claim@example.com', password: 'SecurePass123!' });
    accessToken = loginRes.body.accessToken;

    const missionsRes = await request(app.getHttpServer())
      .get('/api/v1/gamification/missions/daily')
      .set('Authorization', `Bearer ${accessToken}`);
    missionId = missionsRes.body[0].id;

    // Completar misión
    await request(app.getHttpServer())
      .patch(`/api/v1/gamification/missions/${missionId}/progress`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ objective_type: 'complete_exercises', increment: 3 });
  });

  it('debe otorgar recompensas sin error 404', async () => {
    // Act: Reclamar recompensas
    const response = await request(app.getHttpServer())
      .post(`/api/v1/gamification/missions/${missionId}/claim`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    // Assert: Respuesta del endpoint
    expect(response.body).toHaveProperty('mission');
    expect(response.body).toHaveProperty('rewards');
    expect(response.body).toHaveProperty('rewards_granted');

    expect(response.body.mission.status).toBe('claimed');
    expect(response.body.mission.claimed_at).toBeTruthy();

    expect(response.body.rewards_granted.xp_awarded).toBeGreaterThan(0);
    expect(response.body.rewards_granted.ml_coins_awarded).toBeGreaterThan(0);

    // Assert: Estadísticas actualizadas en BD
    const stats = await statsRepo.findOne({ where: { user_id: testUserId } });
    expect(stats).toBeDefined();
    expect(stats.ml_coins).toBeGreaterThan(100); // 100 inicial + recompensa
    expect(stats.total_xp).toBeGreaterThan(0);
  });

  it('debe detectar promoción de rango si corresponde', async () => {
    // Otorgar suficiente XP para subir de rango (múltiples misiones)
    // ... (implementar lógica de múltiples reclamaciones)

    // Assert: rewards_granted.rank_promotion = true
    // Assert: rewards_granted.new_rank !== null
  });

  it('debe fallar si misión no está completada', async () => {
    // Crear nueva misión sin completar
    const missionsRes = await request(app.getHttpServer())
      .get('/api/v1/gamification/missions/daily')
      .set('Authorization', `Bearer ${accessToken}`);
    const incompleteMissionId = missionsRes.body[1].id;

    await request(app.getHttpServer())
      .post(`/api/v1/gamification/missions/${incompleteMissionId}/claim`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400); // Bad Request
  });

  it('debe fallar si misión ya fue reclamada', async () => {
    // Primera reclamación
    await request(app.getHttpServer())
      .post(`/api/v1/gamification/missions/${missionId}/claim`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    // Segunda reclamación (debe fallar)
    await request(app.getHttpServer())
      .post(`/api/v1/gamification/missions/${missionId}/claim`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);
  });
});
```

---

## TEST SUITE 4: Actualización de UserStats

### Test 4.1: Añadir XP y Subir de Nivel

**Archivo:** `apps/backend/test/integration/gamification/user-stats-xp.spec.ts`

```typescript
describe('UserStats - XP and Level System (Integration)', () => {
  let testUserId: string;
  let accessToken: string;
  let statsRepo: Repository<UserStats>;

  beforeAll(async () => {
    await setupTestApp();
    statsRepo = dataSource.getRepository(UserStats);
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  beforeEach(async () => {
    await cleanDatabase();

    // Setup
    const registerRes = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'xptest@example.com', password: 'SecurePass123!' });
    testUserId = registerRes.body.id;

    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'xptest@example.com', password: 'SecurePass123!' });
    accessToken = loginRes.body.accessToken;
  });

  it('debe incrementar XP correctamente', async () => {
    // Añadir XP mediante misión
    const missionsRes = await request(app.getHttpServer())
      .get('/api/v1/gamification/missions/daily')
      .set('Authorization', `Bearer ${accessToken}`);
    const missionId = missionsRes.body[0].id;

    await request(app.getHttpServer())
      .patch(`/api/v1/gamification/missions/${missionId}/progress`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ objective_type: 'complete_exercises', increment: 3 });

    await request(app.getHttpServer())
      .post(`/api/v1/gamification/missions/${missionId}/claim`)
      .set('Authorization', `Bearer ${accessToken}`);

    // Verificar XP actualizado
    const stats = await statsRepo.findOne({ where: { user_id: testUserId } });
    expect(stats.total_xp).toBeGreaterThan(0);
  });

  it('debe subir de nivel al alcanzar XP necesario', async () => {
    // Simular múltiples misiones para alcanzar nivel 2
    // ...

    const stats = await statsRepo.findOne({ where: { user_id: testUserId } });
    expect(stats.level).toBeGreaterThan(1);
  });
});
```

---

## EJECUCIÓN DE TESTS

### Comandos

```bash
# Ejecutar todos los tests de integración
npm run test:integration

# Ejecutar test suite específico
npm run test:integration -- --testPathPattern=register.spec.ts

# Ejecutar con cobertura
npm run test:integration -- --coverage

# Ejecutar en modo watch
npm run test:integration -- --watch
```

### Configuración en package.json

```json
{
  "scripts": {
    "test:integration": "jest --config ./test/integration/jest.config.ts --runInBand",
    "test:integration:watch": "jest --config ./test/integration/jest.config.ts --watch",
    "test:integration:coverage": "jest --config ./test/integration/jest.config.ts --coverage"
  }
}
```

### Jest Config para Integration Tests

**Archivo:** `apps/backend/test/integration/jest.config.ts`

```typescript
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  displayName: 'integration',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '../../',
  testMatch: ['**/test/integration/**/*.spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/test/integration/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.spec.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.entity.ts',
  ],
  coverageDirectory: '<rootDir>/coverage/integration',
  testTimeout: 10000, // 10 segundos por test
};

export default config;
```

---

## CRITERIOS DE ACEPTACIÓN

### Para que los tests pasen, deben cumplirse:

1. **Test 1.1 (Registro):**
   - ✅ Usuario creado en `auth.users`
   - ✅ Profile creado con `profiles.id = auth.users.id`
   - ✅ UserStats inicializado con ml_coins=100, level=1
   - ✅ ComodinesInventory inicializado
   - ✅ UserRank inicializado con rank='Ajaw'
   - ✅ ModuleProgress inicializado para todos los módulos

2. **Test 2.2 (Estadísticas):**
   - ✅ GET /users/:userId/stats retorna 200 (NO 404)
   - ✅ Estructura de estadísticas correcta
   - ✅ Valores iniciales correctos

3. **Test 3.1 (Misiones):**
   - ✅ 3 misiones diarias generadas automáticamente
   - ✅ 2 misiones semanales generadas automáticamente
   - ✅ Estructura de misiones correcta

4. **Test 3.3 (Reclamar):**
   - ✅ POST /missions/:id/claim retorna 200 (NO 404)
   - ✅ ML Coins incrementados en BD
   - ✅ XP incrementado en BD
   - ✅ Misión marcada como 'claimed'

---

## COBERTURA ESPERADA

| Capa | Cobertura Objetivo | Archivos Críticos |
|------|-------------------|-------------------|
| Services | 80%+ | AuthService, UserStatsService, MissionsService |
| Controllers | 90%+ | AuthController, MissionsController, UserStatsController |
| Entities | 100% | Todos los entities con FKs |

---

## CONCLUSIÓN

Este plan de tests de integración garantiza que:

1. ✅ La inicialización de usuarios funciona end-to-end
2. ✅ NO hay errores 404 al buscar estadísticas
3. ✅ El flujo de gamificación funciona correctamente
4. ✅ Las recompensas se otorgan correctamente

**Prioridad:** MEDIA (recomendado para CI/CD)

**Esfuerzo Estimado:** 2-3 horas de implementación

**Mantenimiento:** Bajo (los tests son robustos y cubren casos críticos)
