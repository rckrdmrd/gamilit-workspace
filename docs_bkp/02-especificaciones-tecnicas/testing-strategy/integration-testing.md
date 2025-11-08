# INTEGRATION TESTING STRATEGY

**Proyecto:** Gamilit Platform
**Módulo:** Testing Strategy - Integration Testing
**Fecha:** 01 de Noviembre, 2025
**Versión:** 1.0
**Estado:** Documento Técnico
**RFC:** RFC-0001 (Modularización de Documentación)

---

## Tabla de Contenidos

1. [Overview](#overview)
2. [Alcance](#alcance)
3. [API Testing con Supertest](#api-testing-con-supertest)
4. [Test Database Strategy](#test-database-strategy)
5. [WebSocket Testing](#websocket-testing)

---

## 1. Overview

### 1.1 Definición

Integration Testing verifica que **múltiples componentes funcionen correctamente juntos**: API endpoints con base de datos, servicios con repositorios, y comunicación entre módulos.

### 1.2 Distribución en la Pirámide de Testing

```
Integration Tests: 20% del total (~60 tests de 300)
- API Endpoints: 40 tests
- Database Operations: 15 tests
- WebSocket Features: 5 tests
```

### 1.3 Estado Actual

```
✅ Implemented:
- IDOR Protection (idor-protection.test.ts)

❌ Missing Critical Tests:
- Educational API endpoints
- Gamification API endpoints
- Social API endpoints
- WebSocket real-time features
```

---

## 2. Alcance

### 2.1 Backend API Integration Tests

**Módulos Prioritarios:**

```
Educational Module:
- GET /api/educational/exercises
- POST /api/educational/exercises/:id/start
- POST /api/educational/exercises/:id/submit
- GET /api/educational/progress/user/:userId

Gamification Module:
- GET /api/gamification/leaderboard/:classroomId
- POST /api/gamification/powerups/purchase
- POST /api/gamification/powerups/use
- GET /api/gamification/ranks/user/:userId

Social Module:
- POST /api/social/guilds/create
- POST /api/social/guilds/:id/join
- GET /api/social/guilds/:id/members
- POST /api/social/chat/send

Auth Module:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/verify-email
- POST /api/auth/refresh-token
```

---

## 3. API Testing con Supertest

### 3.1 Educational Exercises API

```typescript
// src/__tests__/integration/educational-exercises.test.ts

import request from 'supertest';
import { app } from '../../app';
import { pool } from '../../database/pool';
import { createAuthToken, createTestUser } from '../helpers/test-utils';

describe('Educational Exercises API - Integration Tests', () => {
  let studentToken: string;
  let teacherToken: string;
  let studentId: string;
  let teacherId: string;
  let exerciseId: string;

  beforeAll(async () => {
    // Setup test users
    const student = await createTestUser({ role: 'student' });
    const teacher = await createTestUser({ role: 'teacher' });

    studentId = student.id;
    teacherId = teacher.id;

    studentToken = createAuthToken(student);
    teacherToken = createAuthToken(teacher);

    // Create test exercise
    const exerciseResult = await pool.query(
      `INSERT INTO educational.exercises (title, type, difficulty, ml_coins)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      ['Test Crucigrama', 'crucigrama', 'medium', 20]
    );
    exerciseId = exerciseResult.rows[0].id;
  });

  afterAll(async () => {
    // Cleanup
    await pool.query('DELETE FROM educational.exercises WHERE id = $1', [exerciseId]);
    await pool.query('DELETE FROM auth.users WHERE id IN ($1, $2)', [studentId, teacherId]);
    await pool.end();
  });

  describe('GET /api/educational/exercises', () => {
    it('should return list of exercises for authenticated student', async () => {
      const response = await request(app)
        .get('/api/educational/exercises')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.exercises)).toBe(true);
      expect(response.body.data.exercises.length).toBeGreaterThan(0);
    });

    it('should filter exercises by difficulty', async () => {
      const response = await request(app)
        .get('/api/educational/exercises?difficulty=medium')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.data.exercises.every(ex => ex.difficulty === 'medium')).toBe(true);
    });

    it('should return 401 for unauthenticated request', async () => {
      await request(app)
        .get('/api/educational/exercises')
        .expect(401);
    });
  });

  describe('POST /api/educational/exercises/:id/start', () => {
    it('should start exercise and create attempt', async () => {
      const response = await request(app)
        .post(`/api/educational/exercises/${exerciseId}/start`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.attempt).toHaveProperty('id');
      expect(response.body.data.attempt.status).toBe('in_progress');
      expect(response.body.data.attempt.exerciseId).toBe(exerciseId);
    });

    it('should return 403 if exercise locked by rank', async () => {
      // Create advanced exercise requiring high rank
      const advancedExercise = await pool.query(
        `INSERT INTO educational.exercises (title, type, difficulty, ml_coins, required_rank)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        ['Advanced Exercise', 'crucigrama', 'hard', 50, 'kukulkan']
      );

      const response = await request(app)
        .post(`/api/educational/exercises/${advancedExercise.rows[0].id}/start`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(403);

      expect(response.body.error.code).toBe('EXERCISE_LOCKED');

      // Cleanup
      await pool.query('DELETE FROM educational.exercises WHERE id = $1', [advancedExercise.rows[0].id]);
    });
  });

  describe('POST /api/educational/exercises/:id/submit', () => {
    let attemptId: string;

    beforeEach(async () => {
      // Start exercise
      const startResponse = await request(app)
        .post(`/api/educational/exercises/${exerciseId}/start`)
        .set('Authorization', `Bearer ${studentToken}`);

      attemptId = startResponse.body.data.attempt.id;
    });

    it('should submit correct answers and award ML Coins', async () => {
      const response = await request(app)
        .post(`/api/educational/exercises/${exerciseId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          attemptId,
          answers: {
            '1': 'RADIO',
            '2': 'POLONIO',
            '3': 'CURIE',
          },
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.score).toBe(100);
      expect(response.body.data.mlCoinsEarned).toBe(20);
      expect(response.body.data.passed).toBe(true);
    });

    it('should calculate partial score for incorrect answers', async () => {
      const response = await request(app)
        .post(`/api/educational/exercises/${exerciseId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          attemptId,
          answers: {
            '1': 'RADIO',      // Correct
            '2': 'PLUTONIO',   // Wrong
            '3': 'CURIE',      // Correct
          },
        })
        .expect(200);

      expect(response.body.data.score).toBe(67); // 2/3 correct
      expect(response.body.data.mlCoinsEarned).toBeLessThan(20);
    });

    it('should update user ML Coins balance in database', async () => {
      // Get initial balance
      const initialBalance = await pool.query(
        'SELECT ml_coins FROM gamification.user_coins WHERE user_id = $1',
        [studentId]
      );

      // Submit exercise
      await request(app)
        .post(`/api/educational/exercises/${exerciseId}/submit`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          attemptId,
          answers: { '1': 'RADIO', '2': 'POLONIO', '3': 'CURIE' },
        });

      // Verify balance updated
      const finalBalance = await pool.query(
        'SELECT ml_coins FROM gamification.user_coins WHERE user_id = $1',
        [studentId]
      );

      expect(finalBalance.rows[0].ml_coins).toBeGreaterThan(
        initialBalance.rows[0]?.ml_coins || 0
      );
    });
  });

  describe('GET /api/educational/progress/user/:userId', () => {
    it('should return user progress statistics', async () => {
      const response = await request(app)
        .get(`/api/educational/progress/user/${studentId}`)
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('exercisesCompleted');
      expect(response.body.data).toHaveProperty('totalScore');
      expect(response.body.data).toHaveProperty('averageScore');
    });

    it('should enforce IDOR protection', async () => {
      const otherStudent = await createTestUser({ role: 'student' });
      const otherToken = createAuthToken(otherStudent);

      await request(app)
        .get(`/api/educational/progress/user/${studentId}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      await pool.query('DELETE FROM auth.users WHERE id = $1', [otherStudent.id]);
    });
  });
});
```

### 3.2 Gamification API

```typescript
// src/__tests__/integration/gamification.test.ts

describe('Gamification API - Integration Tests', () => {
  describe('POST /api/gamification/powerups/purchase', () => {
    it('should purchase power-up and deduct ML Coins', async () => {
      const response = await request(app)
        .post('/api/gamification/powerups/purchase')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          powerUpType: 'hint',
          quantity: 1,
        })
        .expect(200);

      expect(response.body.data.purchased).toBe(true);
      expect(response.body.data.mlCoinsSpent).toBe(5);

      // Verify database
      const powerUps = await pool.query(
        'SELECT * FROM gamification.user_powerups WHERE user_id = $1 AND type = $2',
        [studentId, 'hint']
      );

      expect(powerUps.rows[0].quantity).toBeGreaterThan(0);
    });

    it('should return 400 if insufficient ML Coins', async () => {
      // Set user balance to 0
      await pool.query(
        'UPDATE gamification.user_coins SET ml_coins = 0 WHERE user_id = $1',
        [studentId]
      );

      const response = await request(app)
        .post('/api/gamification/powerups/purchase')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          powerUpType: 'hint',
          quantity: 1,
        })
        .expect(400);

      expect(response.body.error.code).toBe('INSUFFICIENT_ML_COINS');
    });
  });

  describe('GET /api/gamification/leaderboard/:classroomId', () => {
    it('should return top 10 students by XP', async () => {
      const response = await request(app)
        .get('/api/gamification/leaderboard/classroom-123')
        .set('Authorization', `Bearer ${studentToken}`)
        .expect(200);

      expect(response.body.data.rankings).toHaveLength(10);
      expect(response.body.data.rankings[0].xp).toBeGreaterThanOrEqual(
        response.body.data.rankings[1].xp
      );
    });
  });
});
```

---

## 4. Test Database Strategy

### 4.1 Option 1: Dedicated Test Database

```typescript
// src/__tests__/setup.ts

import { pool } from '../database/pool';

beforeAll(async () => {
  // Run migrations on test database
  await runMigrations();

  // Seed test data
  await seedTestData();
});

afterAll(async () => {
  // Cleanup
  await cleanupDatabase();
  await pool.end();
});

beforeEach(async () => {
  // Truncate tables between tests
  await pool.query(`
    TRUNCATE TABLE
      educational.exercise_attempts,
      educational.exercises,
      gamification.user_coins,
      auth.users
    CASCADE
  `);
});
```

### 4.2 Option 2: Transactions (Faster)

```typescript
beforeEach(async () => {
  await pool.query('BEGIN');
});

afterEach(async () => {
  await pool.query('ROLLBACK');
});
```

### 4.3 Test Helpers

```typescript
// src/__tests__/helpers/test-utils.ts

import jwt from 'jsonwebtoken';
import { jwtConfig } from '../../config/jwt';

export function createAuthToken(user: any): string {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenant_id: user.tenant_id,
    },
    jwtConfig.secret,
    { expiresIn: '1h' }
  );
}

export async function createTestUser(overrides: Partial<User> = {}): Promise<User> {
  const user = {
    id: randomUUID(),
    email: `test-${randomUUID()}@test.com`,
    password: 'Test1234!',
    role: 'student',
    tenant_id: 'test-tenant',
    ...overrides,
  };

  await pool.query(
    `INSERT INTO auth.users (id, email, password, role, tenant_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [user.id, user.email, user.password, user.role, user.tenant_id]
  );

  return user;
}
```

---

## 5. WebSocket Testing

### 5.1 Real-time Leaderboard

```typescript
// src/__tests__/integration/realtime-leaderboard.test.ts

import { io as ioClient, Socket } from 'socket.io-client';
import { createServer } from 'http';
import { app } from '../../app';

describe('Real-time Leaderboard WebSocket', () => {
  let httpServer: any;
  let clientSocket: Socket;

  beforeAll((done) => {
    httpServer = createServer(app);
    httpServer.listen(() => {
      const port = (httpServer.address() as any).port;
      clientSocket = ioClient(`http://localhost:${port}`);
      clientSocket.on('connect', done);
    });
  });

  afterAll(() => {
    clientSocket.close();
    httpServer.close();
  });

  it('should receive leaderboard updates when user completes exercise', (done) => {
    clientSocket.emit('join-leaderboard', { classroomId: 'classroom-123' });

    clientSocket.on('leaderboard-update', (data) => {
      expect(data).toHaveProperty('rankings');
      expect(Array.isArray(data.rankings)).toBe(true);
      done();
    });

    // Trigger update by completing exercise
    // (simulate via API call)
  });

  it('should disconnect properly', (done) => {
    clientSocket.on('disconnect', () => {
      done();
    });

    clientSocket.disconnect();
  });
});
```

### 5.2 Chat WebSocket

```typescript
describe('Chat WebSocket', () => {
  it('should broadcast message to all users in guild', (done) => {
    const socket1 = ioClient(`http://localhost:${port}`);
    const socket2 = ioClient(`http://localhost:${port}`);

    socket1.emit('join-guild', { guildId: 'guild-123' });
    socket2.emit('join-guild', { guildId: 'guild-123' });

    socket2.on('chat-message', (data) => {
      expect(data.message).toBe('Hello guild!');
      expect(data.userId).toBe('user-1');
      done();

      socket1.close();
      socket2.close();
    });

    socket1.emit('send-message', {
      guildId: 'guild-123',
      message: 'Hello guild!',
      userId: 'user-1',
    });
  });
});
```

---

## Referencias

- [Testing Strategy - Overview](./README.md)
- [Unit Testing](./unit-testing.md)
- [E2E Testing](./e2e-testing.md)
- [Test Infrastructure](./test-infrastructure.md)

---

**Documento creado:** 01 de Noviembre, 2025
**Próxima revisión:** Cada sprint
**Owner:** QA Team + Engineering Team
