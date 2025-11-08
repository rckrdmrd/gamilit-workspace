# TESTING STRATEGY - GAMILIT PLATFORM

**Proyecto:** Gamilit Platform
**Fecha:** 28 de Octubre, 2025
**Versión:** 1.0
**Estado:** Documento Base

---

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Pirámide de Testing](#pirámide-de-testing)
3. [Unit Testing](#unit-testing)
4. [Integration Testing](#integration-testing)
5. [End-to-End Testing](#end-to-end-testing)
6. [Performance Testing](#performance-testing)
7. [Security Testing](#security-testing)
8. [Test Data Management](#test-data-management)
9. [Coverage Targets](#coverage-targets)
10. [Continuous Testing](#continuous-testing)
11. [Best Practices](#best-practices)
12. [Testing Infrastructure](#testing-infrastructure)

---

## 1. Introducción

### 1.1 Propósito

Definir la estrategia completa de testing para garantizar calidad, confiabilidad y performance de la plataforma Gamilit, una plataforma educativa gamificada que requiere los más altos estándares de calidad.

### 1.2 Objetivos de Calidad

| Objetivo | Target | Actual | Prioridad |
|----------|--------|--------|-----------|
| **Functional Correctness** | 99.5%+ features según spec | TBD | 🔴 CRÍTICO |
| **Code Coverage Backend** | 80%+ | TBD | 🟡 ALTA |
| **Code Coverage Frontend** | 70%+ | TBD | 🟡 ALTA |
| **Performance P95** | < 500ms | TBD | 🟡 ALTA |
| **Security Vulnerabilities** | 0 críticas | TBD | 🔴 CRÍTICO |
| **Availability** | 99.5% uptime | TBD | 🟡 ALTA |
| **Test Execution Time** | < 5 min (unit), < 15 min (all) | TBD | 🟢 MEDIA |

### 1.3 Herramientas y Frameworks

#### Backend (Node.js + TypeScript + Express)

```json
{
  "testing": {
    "unit-integration": "Jest 30.x",
    "e2e": "Supertest",
    "mocking": "jest.mock",
    "coverage": "Istanbul (built-in Jest)",
    "test-db": "PostgreSQL Test Instance",
    "assertions": "Jest Matchers"
  }
}
```

**Configuración Actual:**
- **Jest:** v30.2.0 (configurado en package.json)
- **ts-jest:** v29.4.5 (TypeScript support)
- Scripts disponibles:
  - `npm test` - Run all tests
  - `npm run test:watch` - Watch mode
  - `npm run test:coverage` - Coverage report

#### Frontend (React + Vite + TypeScript)

```json
{
  "testing": {
    "unit-integration": "Vitest 3.x",
    "component-testing": "React Testing Library 16.x",
    "e2e": "Playwright (recomendado)",
    "mocking": "vi (Vitest)",
    "coverage": "c8 (via Vitest)",
    "dom-testing": "jsdom 27.x",
    "user-simulation": "@testing-library/user-event 14.x",
    "accessibility": "@axe-core/react 4.x"
  }
}
```

**Configuración Actual (vitest.config.ts):**
```typescript
{
  environment: 'jsdom',
  setupFiles: './src/test/setup.ts',
  css: true,
  globals: true
}
```

#### Performance Testing

| Tool | Purpose | Target Metrics |
|------|---------|----------------|
| **k6** | Load testing | Concurrent users, throughput |
| **Artillery** | Alternative load testing | RPS, latency |
| **Lighthouse** | Frontend performance | LCP < 2.5s, FID < 100ms |

#### Security Testing

| Tool | Type | Frequency |
|------|------|-----------|
| **SonarQube** | SAST | Every commit (CI/CD) |
| **npm audit** | Dependency scan | Daily |
| **Snyk** | Vulnerability scan | Weekly |
| **OWASP ZAP** | DAST | Weekly (staging) |

---

## 2. Pirámide de Testing

```
                    ┌──────────────┐
                    │  E2E (10%)   │  ← 7 flujos críticos
                    │   ~30 tests  │     User journeys completos
                    └──────────────┘
                  ┌──────────────────┐
                  │ Integration (20%)│  ← 60 tests
                  │   API + DB       │     Contratos, endpoints
                  └──────────────────┘
               ┌────────────────────────┐
               │   Unit Tests (70%)     │  ← 210 tests
               │  Functions, Services   │     Business logic, utils
               └────────────────────────┘
```

**Distribución Objetivo (300 tests total):**
- **210 Unit Tests (70%):** Funciones puras, services, utils, validations
- **60 Integration Tests (20%):** API endpoints, database operations, service integration
- **30 E2E Tests (10%):** User flows críticos end-to-end

**Estado Actual (Tests Existentes):**

```
Backend:
✅ src/middleware/__tests__/rls.middleware.security.test.ts
✅ src/middleware/__tests__/ownership.middleware.test.ts
✅ src/__tests__/integration/idor-protection.test.ts
✅ src/modules/auth/__tests__/security-token-hashing.test.ts
✅ tests/maya-ranks-consistency.test.ts

Frontend:
✅ src/apps/student/pages/__tests__/LoginPage.test.tsx
✅ src/apps/student/pages/__tests__/RegisterPage.test.tsx
✅ src/apps/student/pages/__tests__/EmailVerificationPage.test.tsx
✅ src/apps/student/pages/admin/__tests__/UserManagementPage.test.tsx
✅ src/shared/components/base/__tests__/StatusBadge.test.tsx
✅ src/features/admin/components/__tests__/DeactivateUserModal.test.tsx
✅ src/features/gamification/leaderboard/LiveLeaderboard.test.tsx
✅ src/shared/hooks/useSanitizedHTML.test.ts
```

**Gap Analysis:**
- ❌ **Cobertura insuficiente:** ~13 tests vs 300 objetivo
- ❌ **Falta testing de:** Ejercicios educativos, gamificación completa, social features
- ✅ **Buena base:** Security tests (IDOR, SQL injection, token hashing)

---

## 3. Unit Testing

### 3.1 Alcance

#### Backend Modules

```
src/
├── modules/
│   ├── auth/
│   │   ├── services/          ← 90% coverage target
│   │   ├── validators/        ← 95% coverage target
│   │   └── utils/             ← 95% coverage target
│   ├── educational/
│   │   ├── services/          ← 90% coverage target
│   │   ├── exercise-engine/   ← 95% coverage target (crítico)
│   │   └── grading/           ← 95% coverage target (crítico)
│   ├── gamification/
│   │   ├── services/          ← 90% coverage target
│   │   ├── rank-system/       ← 95% coverage target (crítico)
│   │   └── rewards/           ← 90% coverage target
│   └── social/
│       ├── services/          ← 85% coverage target
│       └── guilds/            ← 85% coverage target
├── shared/
│   ├── utils/                 ← 95% coverage target
│   ├── validators/            ← 95% coverage target
│   └── middlewares/           ← 85% coverage target
```

**Prioridad CRÍTICA (95% coverage):**
1. ✅ **Security:** SQL injection protection, IDOR prevention, token hashing
2. ❌ **Exercise Engine:** Crucigrama, word search, matching
3. ❌ **Grading System:** Auto-grading, ML Coins calculation
4. ❌ **Rank System:** Maya rank progression, XP calculation
5. ❌ **Validators:** Zod schemas, input validation

#### Frontend Components

```
src/
├── apps/
│   ├── student/
│   │   ├── pages/             ← 70% coverage target
│   │   └── components/        ← 75% coverage target
│   ├── teacher/
│   │   ├── pages/             ← 70% coverage target
│   │   └── components/        ← 75% coverage target
│   └── admin/
│       ├── pages/             ← 70% coverage target
│       └── components/        ← 75% coverage target
├── features/
│   ├── educational/
│   │   ├── exercises/         ← 80% coverage target (crítico)
│   │   └── progress/          ← 75% coverage target
│   ├── gamification/
│   │   ├── components/        ← 75% coverage target
│   │   └── hooks/             ← 85% coverage target
│   └── auth/
│       ├── hooks/             ← 85% coverage target
│       └── components/        ← 75% coverage target
├── shared/
│   ├── components/            ← 80% coverage target
│   ├── hooks/                 ← 90% coverage target
│   └── utils/                 ← 95% coverage target
```

### 3.2 Backend: Jest Configuration

**jest.config.js (Recomendado - crear este archivo):**

```javascript
/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/*.test.ts',
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',
    '!src/server.ts',
    '!src/app.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    // Critical modules - higher threshold
    './src/modules/educational/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    './src/shared/utils/': {
      branches: 95,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  testTimeout: 10000,
  verbose: true,
};
```

### 3.3 Unit Test Patterns

#### Pattern 1: Service Testing (Backend)

```typescript
// src/modules/gamification/services/__tests__/rank.service.test.ts

import { RankService } from '../rank.service';
import { RankRepository } from '../../repositories/rank.repository';

// Mock dependencies
jest.mock('../../repositories/rank.repository');

describe('RankService', () => {
  let rankService: RankService;
  let mockRankRepository: jest.Mocked<RankRepository>;

  beforeEach(() => {
    mockRankRepository = {
      getUserRank: jest.fn(),
      updateRank: jest.fn(),
      getRankRequirements: jest.fn(),
    } as any;

    rankService = new RankService(mockRankRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateRankUp', () => {
    it('should promote user from Ixchel to Chaak when XP threshold met', async () => {
      // Arrange
      const userId = 'user-123';
      const currentRank = {
        rankId: 'ixchel',
        currentXp: 1500,
        name: 'Ixchel - Diosa de la Luna',
      };

      const nextRank = {
        rankId: 'chaak',
        requiredXp: 1000,
        name: 'Chaak - Dios de la Lluvia',
      };

      mockRankRepository.getUserRank.mockResolvedValue(currentRank);
      mockRankRepository.getRankRequirements.mockResolvedValue(nextRank);

      // Act
      const result = await rankService.calculateRankUp(userId);

      // Assert
      expect(result.shouldRankUp).toBe(true);
      expect(result.newRank).toBe('chaak');
      expect(mockRankRepository.updateRank).toHaveBeenCalledWith(
        userId,
        'chaak',
        expect.any(Number)
      );
    });

    it('should not promote user when XP threshold not met', async () => {
      // Arrange
      const userId = 'user-123';
      const currentRank = {
        rankId: 'ixchel',
        currentXp: 500,
        name: 'Ixchel - Diosa de la Luna',
      };

      mockRankRepository.getUserRank.mockResolvedValue(currentRank);

      // Act
      const result = await rankService.calculateRankUp(userId);

      // Assert
      expect(result.shouldRankUp).toBe(false);
      expect(mockRankRepository.updateRank).not.toHaveBeenCalled();
    });

    it('should throw error when user is at max rank (Kukulkán)', async () => {
      // Arrange
      const userId = 'user-123';
      const maxRank = {
        rankId: 'kukulkan',
        currentXp: 50000,
        name: 'Kukulkán - Serpiente Emplumada',
      };

      mockRankRepository.getUserRank.mockResolvedValue(maxRank);

      // Act & Assert
      await expect(rankService.calculateRankUp(userId)).rejects.toThrow(
        'User already at maximum rank'
      );
    });
  });

  describe('calculateMLCoinsReward', () => {
    it('should calculate correct ML Coins based on rank multiplier', () => {
      // Arrange
      const baseReward = 10;
      const rank = 'chaak'; // Multiplier: 1.5x

      // Act
      const coins = rankService.calculateMLCoinsReward(baseReward, rank);

      // Assert
      expect(coins).toBe(15); // 10 * 1.5
    });

    it('should use 1x multiplier for base rank (Ixchel)', () => {
      const coins = rankService.calculateMLCoinsReward(10, 'ixchel');
      expect(coins).toBe(10);
    });
  });
});
```

#### Pattern 2: Component Testing (Frontend)

```typescript
// src/features/educational/exercises/__tests__/CrucigramaExercise.test.tsx

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CrucigramaExercise } from '../CrucigramaExercise';

describe('CrucigramaExercise', () => {
  const mockExercise = {
    id: 'exercise-123',
    type: 'crucigrama',
    title: 'Elementos Químicos Descubiertos por Marie Curie',
    words: [
      { word: 'RADIO', clue: 'Elemento químico Ra, descubierto en 1898' },
      { word: 'POLONIO', clue: 'Elemento químico Po, nombrado por Polonia' },
      { word: 'CURIE', clue: 'Unidad de radiactividad' },
    ],
    mlCoins: 20,
  };

  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render crossword grid', () => {
    render(<CrucigramaExercise exercise={mockExercise} onSubmit={mockOnSubmit} />);

    expect(screen.getByText('Elementos Químicos Descubiertos por Marie Curie')).toBeInTheDocument();
    expect(screen.getByTestId('crossword-grid')).toBeInTheDocument();
  });

  it('should display clues for all words', () => {
    render(<CrucigramaExercise exercise={mockExercise} onSubmit={mockOnSubmit} />);

    expect(screen.getByText(/Elemento químico Ra/i)).toBeInTheDocument();
    expect(screen.getByText(/Elemento químico Po/i)).toBeInTheDocument();
    expect(screen.getByText(/Unidad de radiactividad/i)).toBeInTheDocument();
  });

  it('should accept correct answers', async () => {
    const user = userEvent.setup();
    render(<CrucigramaExercise exercise={mockExercise} onSubmit={mockOnSubmit} />);

    // Fill in answers
    const radioInput = screen.getByTestId('word-input-0');
    await user.type(radioInput, 'RADIO');

    const polonioInput = screen.getByTestId('word-input-1');
    await user.type(polonioInput, 'POLONIO');

    const curieInput = screen.getByTestId('word-input-2');
    await user.type(curieInput, 'CURIE');

    // Submit
    const submitButton = screen.getByRole('button', { name: /verificar/i });
    await user.click(submitButton);

    // Assert
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        exerciseId: 'exercise-123',
        answers: ['RADIO', 'POLONIO', 'CURIE'],
        score: 100,
        mlCoinsEarned: 20,
      });
    });
  });

  it('should highlight incorrect answers', async () => {
    const user = userEvent.setup();
    render(<CrucigramaExercise exercise={mockExercise} onSubmit={mockOnSubmit} />);

    // Fill incorrect answer
    const radioInput = screen.getByTestId('word-input-0');
    await user.type(radioInput, 'RADON'); // Wrong!

    // Submit
    await user.click(screen.getByRole('button', { name: /verificar/i }));

    // Assert
    await waitFor(() => {
      expect(radioInput).toHaveClass('border-red-500');
      expect(screen.getByText(/respuesta incorrecta/i)).toBeInTheDocument();
    });
  });

  it('should use power-up when available', async () => {
    const user = userEvent.setup();
    const mockUsePowerUp = vi.fn();

    render(
      <CrucigramaExercise
        exercise={mockExercise}
        onSubmit={mockOnSubmit}
        powerUps={[{ type: 'hint', remaining: 1 }]}
        onUsePowerUp={mockUsePowerUp}
      />
    );

    // Click hint power-up
    const hintButton = screen.getByRole('button', { name: /pista/i });
    await user.click(hintButton);

    expect(mockUsePowerUp).toHaveBeenCalledWith('hint');
  });
});
```

#### Pattern 3: Validation Testing (Zod)

```typescript
// src/shared/validators/__tests__/exercise.validator.test.ts

import { exerciseSchema, submitExerciseSchema } from '../exercise.validator';

describe('Exercise Validators', () => {
  describe('exerciseSchema', () => {
    it('should validate correct exercise data', () => {
      const validExercise = {
        type: 'crucigrama',
        title: 'Test Exercise',
        difficulty: 'medium',
        mlCoins: 20,
        content: {
          words: ['RADIO', 'POLONIO'],
        },
      };

      const result = exerciseSchema.safeParse(validExercise);
      expect(result.success).toBe(true);
    });

    it('should reject negative ML Coins', () => {
      const invalidExercise = {
        type: 'crucigrama',
        title: 'Test',
        mlCoins: -10, // Invalid!
      };

      const result = exerciseSchema.safeParse(invalidExercise);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('positive');
      }
    });

    it('should reject empty title', () => {
      const result = exerciseSchema.safeParse({ title: '' });
      expect(result.success).toBe(false);
    });

    it('should reject invalid exercise type', () => {
      const result = exerciseSchema.safeParse({ type: 'invalid_type' });
      expect(result.success).toBe(false);
    });
  });
});
```

### 3.4 Mocking Strategies

#### Database Mocking

```typescript
// Option 1: Mock repository
jest.mock('../repositories/user.repository', () => ({
  UserRepository: jest.fn().mockImplementation(() => ({
    findById: jest.fn().mockResolvedValue(mockUser),
    create: jest.fn().mockResolvedValue(createdUser),
    update: jest.fn().mockResolvedValue(updatedUser),
  })),
}));

// Option 2: Mock pg pool
jest.mock('../../database/pool', () => ({
  pool: {
    query: jest.fn(),
    connect: jest.fn(),
  },
}));
```

#### External APIs

```typescript
// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

mockedAxios.get.mockResolvedValue({
  data: { success: true },
  status: 200,
});
```

#### Time Mocking

```typescript
// Mock Date for consistent tests
beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2025-10-28T00:00:00.000Z'));
});

afterAll(() => {
  jest.useRealTimers();
});
```

### 3.5 Coverage Targets

| Módulo | Target | Actual | Status | Priority |
|--------|--------|--------|--------|----------|
| **Backend** |
| Auth Services | 90% | TBD | 🔴 | CRÍTICO |
| Educational Services | 90% | TBD | 🔴 | CRÍTICO |
| Exercise Engine | 95% | TBD | 🔴 | CRÍTICO |
| Gamification Services | 90% | TBD | 🟡 | ALTA |
| Rank System | 95% | TBD | 🔴 | CRÍTICO |
| Social Services | 85% | TBD | 🟢 | MEDIA |
| Utils | 95% | TBD | 🟡 | ALTA |
| Validators | 95% | TBD | 🟡 | ALTA |
| Middlewares | 85% | ~30% | 🔴 | ALTA |
| **Frontend** |
| Auth Components | 75% | ~40% | 🟡 | ALTA |
| Exercise Components | 80% | 0% | 🔴 | CRÍTICO |
| Gamification Components | 75% | ~20% | 🔴 | ALTA |
| Shared Components | 80% | ~30% | 🟡 | ALTA |
| Hooks | 90% | ~50% | 🟡 | ALTA |
| Utils | 95% | ~50% | 🟡 | ALTA |
| **GLOBAL** | **80%** | **~15%** | **🔴** | **CRÍTICO** |

---

## 4. Integration Testing

### 4.1 Alcance

**Backend API Integration Tests:**

```
✅ Implemented:
- IDOR Protection (idor-protection.test.ts)

❌ Missing Critical Tests:
- Educational API endpoints
- Gamification API endpoints
- Social API endpoints
- WebSocket real-time features
```

### 4.2 API Testing con Supertest

**Ejemplo: Educational Exercises API**

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

### 4.3 Test Database Strategy

**Option 1: Dedicated Test Database**

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

**Option 2: Transactions (Faster)**

```typescript
beforeEach(async () => {
  await pool.query('BEGIN');
});

afterEach(async () => {
  await pool.query('ROLLBACK');
});
```

### 4.4 WebSocket Testing

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
});
```

---

## 5. End-to-End Testing

### 5.1 Flujos Críticos a Testear

**Prioridad CRÍTICA (7 flujos):**

1. ✅ **User Registration → Email Verification → Login**
   - Estado: Parcialmente implementado (LoginPage.test.tsx, RegisterPage.test.tsx)
   - Gap: Falta flujo completo E2E

2. ❌ **Student: Browse → Select Exercise → Solve → Submit → See Results**
   - Estado: NO IMPLEMENTADO
   - Prioridad: CRÍTICA
   - Valor de negocio: Core functionality

3. ❌ **Student: Buy Power-up → Use in Exercise → See Effect**
   - Estado: NO IMPLEMENTADO
   - Prioridad: ALTA

4. ❌ **Student: Complete Module → Rank Up → Unlock New Content**
   - Estado: NO IMPLEMENTADO
   - Prioridad: CRÍTICA (Sistema de progresión)

5. ❌ **Teacher: Create Classroom → Invite Students → Assign Task**
   - Estado: NO IMPLEMENTADO
   - Prioridad: ALTA

6. ❌ **Teacher: Grade Submission → Give Feedback → Student Notified**
   - Estado: NO IMPLEMENTADO
   - Prioridad: MEDIA

7. ✅ **Admin: Moderate Content → Approve/Reject → Notify Creator**
   - Estado: Parcialmente implementado (UserManagementPage.test.tsx)

### 5.2 Playwright Setup (Recomendado)

**playwright.config.ts (Crear este archivo):**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: [
    {
      command: 'npm run dev',
      cwd: './projects/gamilit-platform-web',
      port: 5173,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run dev',
      cwd: './projects/gamilit-platform-backend',
      port: 3000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
```

### 5.3 E2E Test Example

```typescript
// e2e/student-exercise-flow.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Student Exercise Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:5173/login');
    await page.fill('[data-testid="email-input"]', 'student@test.com');
    await page.fill('[data-testid="password-input"]', 'Test1234');
    await page.click('[data-testid="login-button"]');

    // Wait for dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('should complete crucigrama exercise and earn ML Coins', async ({ page }) => {
    // Navigate to exercises
    await page.click('[data-testid="exercises-link"]');
    await expect(page).toHaveURL(/\/exercises/);

    // Filter by type
    await page.selectOption('[data-testid="exercise-type-filter"]', 'crucigrama');

    // Select exercise
    await page.click('[data-testid="exercise-card-crucigrama-marie-curie"]');
    await expect(page).toHaveURL(/\/exercises\/crucigrama-marie-curie/);

    // Verify exercise loaded
    await expect(page.locator('h1')).toContainText('Elementos Químicos');
    await expect(page.locator('[data-testid="ml-coins-reward"]')).toContainText('20 ML Coins');

    // Start exercise
    await page.click('[data-testid="start-exercise-button"]');

    // Fill answers
    await page.fill('[data-testid="answer-1-across"]', 'RADIO');
    await page.fill('[data-testid="answer-2-down"]', 'POLONIO');
    await page.fill('[data-testid="answer-3-across"]', 'CURIE');

    // Submit
    await page.click('[data-testid="submit-button"]');

    // Wait for results
    await expect(page.locator('[data-testid="results-modal"]')).toBeVisible();

    // Verify score
    await expect(page.locator('[data-testid="score"]')).toContainText('100');
    await expect(page.locator('[data-testid="ml-coins-earned"]')).toContainText('20');

    // Verify confetti animation
    await expect(page.locator('[data-testid="confetti"]')).toBeVisible();

    // Go to dashboard
    await page.click('[data-testid="back-to-dashboard"]');
    await expect(page).toHaveURL('/dashboard');

    // Verify ML Coins updated
    const mlCoinsBalance = await page.locator('[data-testid="ml-coins-balance"]').textContent();
    expect(parseInt(mlCoinsBalance || '0')).toBeGreaterThanOrEqual(20);

    // Verify progress updated
    await expect(page.locator('[data-testid="exercises-completed"]')).not.toContainText('0');
  });

  test('should use power-up during exercise', async ({ page }) => {
    // Buy power-up first
    await page.click('[data-testid="store-link"]');
    await page.click('[data-testid="buy-hint-powerup"]');
    await page.click('[data-testid="confirm-purchase"]');

    // Go to exercise
    await page.click('[data-testid="exercises-link"]');
    await page.click('[data-testid="exercise-card-crucigrama-marie-curie"]');
    await page.click('[data-testid="start-exercise-button"]');

    // Use hint power-up
    await page.click('[data-testid="powerup-hint"]');

    // Verify hint revealed
    await expect(page.locator('[data-testid="hint-revealed"]')).toBeVisible();
    await expect(page.locator('[data-testid="hint-revealed"]')).toContainText('R');

    // Verify power-up count decreased
    await expect(page.locator('[data-testid="powerup-hint-count"]')).toContainText('0');
  });

  test('should show rank up notification after completing module', async ({ page }) => {
    // Complete all exercises in module (simulate by API)
    // ...

    // Complete final exercise
    await page.click('[data-testid="exercise-final"]');
    await page.click('[data-testid="start-exercise-button"]');
    // ... fill and submit

    // Verify rank up modal
    await expect(page.locator('[data-testid="rank-up-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="new-rank"]')).toContainText('Chaak');
    await expect(page.locator('[data-testid="rank-icon"]')).toBeVisible();

    // Close modal
    await page.click('[data-testid="close-rank-up-modal"]');

    // Verify rank updated in header
    await expect(page.locator('[data-testid="user-rank"]')).toContainText('Chaak');
  });
});
```

### 5.4 Page Object Model

```typescript
// e2e/pages/LoginPage.ts

import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('[data-testid="email-input"]');
    this.passwordInput = page.locator('[data-testid="password-input"]');
    this.loginButton = page.locator('[data-testid="login-button"]');
    this.rememberMeCheckbox = page.locator('[data-testid="remember-me"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string, rememberMe = false) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);

    if (rememberMe) {
      await this.rememberMeCheckbox.check();
    }

    await this.loginButton.click();
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }
}

// Usage in test:
import { LoginPage } from './pages/LoginPage';

test('login with valid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('student@test.com', 'Test1234');

  await expect(page).toHaveURL('/dashboard');
});
```

---

## 6. Performance Testing

### 6.1 k6 Load Testing Scripts

**load-tests/api-exercises.js:**

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const exerciseDuration = new Trend('exercise_duration');

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '3m', target: 50 },   // Stay at 50 users
    { duration: '1m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '1m', target: 200 },  // Spike to 200 users
    { duration: '3m', target: 200 },  // Sustain spike
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],      // 95% of requests < 500ms
    http_req_failed: ['rate<0.01'],        // < 1% failures
    errors: ['rate<0.05'],                 // < 5% error rate
    exercise_duration: ['p(90)<2000'],     // 90% of exercises < 2s
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export function setup() {
  // Login and get auth token
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'loadtest@test.com',
    password: 'LoadTest123!',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  return { token: loginRes.json('token') };
}

export default function (data) {
  const headers = {
    'Authorization': `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  };

  // Scenario 1: Browse exercises (60% of traffic)
  if (Math.random() < 0.6) {
    const res = http.get(`${BASE_URL}/api/educational/exercises`, { headers });

    check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 500ms': (r) => r.timings.duration < 500,
      'has exercises': (r) => r.json('data.exercises').length > 0,
    });

    errorRate.add(res.status !== 200);
  }

  // Scenario 2: Start and submit exercise (30% of traffic)
  else if (Math.random() < 0.9) {
    const startTime = new Date();

    // Start exercise
    const startRes = http.post(
      `${BASE_URL}/api/educational/exercises/exercise-123/start`,
      null,
      { headers }
    );

    check(startRes, {
      'exercise started': (r) => r.status === 201,
    });

    sleep(2); // Simulate user solving

    // Submit exercise
    const submitRes = http.post(
      `${BASE_URL}/api/educational/exercises/exercise-123/submit`,
      JSON.stringify({
        attemptId: startRes.json('data.attempt.id'),
        answers: { '1': 'RADIO', '2': 'POLONIO', '3': 'CURIE' },
      }),
      { headers }
    );

    check(submitRes, {
      'exercise submitted': (r) => r.status === 200,
      'score calculated': (r) => r.json('data.score') !== undefined,
    });

    const duration = new Date() - startTime;
    exerciseDuration.add(duration);
    errorRate.add(submitRes.status !== 200);
  }

  // Scenario 3: View leaderboard (10% of traffic)
  else {
    const res = http.get(`${BASE_URL}/api/gamification/leaderboard/classroom-123`, { headers });

    check(res, {
      'leaderboard loaded': (r) => r.status === 200,
      'has rankings': (r) => r.json('data.rankings').length > 0,
    });

    errorRate.add(res.status !== 200);
  }

  sleep(1); // Think time
}

export function teardown(data) {
  // Cleanup if needed
  console.log('Load test completed');
}
```

**Run commands:**

```bash
# Normal load test
k6 run load-tests/api-exercises.js

# Stress test (find breaking point)
k6 run --vus 500 --duration 10m load-tests/stress-test.js

# Spike test
k6 run --stage "0s:0,10s:1000,20s:0" load-tests/spike-test.js

# Smoke test (sanity check)
k6 run --vus 1 --duration 1m load-tests/smoke-test.js
```

### 6.2 Performance Benchmarks

#### Backend API Targets

| Endpoint | P50 | P95 | P99 | Max | Status |
|----------|-----|-----|-----|-----|--------|
| GET /exercises | 100ms | 300ms | 500ms | 1s | 🟡 TBD |
| POST /exercises/:id/start | 150ms | 400ms | 800ms | 1.5s | 🟡 TBD |
| POST /exercises/:id/submit | 200ms | 500ms | 1s | 2s | 🟡 TBD |
| GET /leaderboard | 80ms | 200ms | 400ms | 800ms | 🟡 TBD |
| GET /user/stats | 50ms | 150ms | 300ms | 500ms | 🟡 TBD |
| POST /auth/login | 300ms | 800ms | 1.2s | 2s | 🟡 TBD |
| WebSocket message | 20ms | 50ms | 100ms | 200ms | 🟡 TBD |

#### Frontend Performance (Lighthouse)

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| **Largest Contentful Paint (LCP)** | < 2.5s | TBD | 🟡 |
| **First Input Delay (FID)** | < 100ms | TBD | 🟡 |
| **Cumulative Layout Shift (CLS)** | < 0.1 | TBD | 🟡 |
| **Time to Interactive (TTI)** | < 3.8s | TBD | 🟡 |
| **Total Blocking Time (TBT)** | < 200ms | TBD | 🟡 |
| **Performance Score** | > 90 | TBD | 🟡 |
| **Accessibility Score** | > 95 | TBD | 🟡 |
| **Best Practices Score** | > 90 | TBD | 🟡 |

### 6.3 Database Performance Testing

```sql
-- Query performance test
EXPLAIN ANALYZE
SELECT
  e.*,
  COUNT(ea.id) as total_attempts,
  AVG(ea.score) as average_score
FROM educational.exercises e
LEFT JOIN educational.exercise_attempts ea ON e.id = ea.exercise_id
WHERE e.tenant_id = 'tenant-123'
GROUP BY e.id
ORDER BY e.created_at DESC
LIMIT 20;

-- Expected: < 50ms for 10k exercises, < 200ms for 100k exercises

-- Index performance
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'educational'
ORDER BY idx_scan DESC;
```

---

## 7. Security Testing

### 7.1 Security Test Coverage (Actual)

**✅ Implemented Security Tests:**

1. **SQL Injection Protection** (`rls.middleware.security.test.ts`)
   - ✅ Parameterized queries validation
   - ✅ Malicious input testing
   - ✅ Special characters handling
   - ✅ Multi-statement injection prevention

2. **IDOR Protection** (`idor-protection.test.ts`)
   - ✅ User data isolation
   - ✅ Role-based access control
   - ✅ Cross-user enumeration prevention
   - ✅ Bulk attack scenarios

3. **Token Security** (`security-token-hashing.test.ts`)
   - ✅ Token hashing validation
   - ✅ Token comparison security

4. **Ownership Validation** (`ownership.middleware.test.ts`)
   - ✅ Resource ownership checks

### 7.2 SAST (Static Application Security Testing)

**SonarQube Configuration (sonar-project.properties):**

```properties
sonar.projectKey=gamilit-platform
sonar.projectName=Gamilit Platform
sonar.sources=src
sonar.tests=src/__tests__,tests
sonar.test.inclusions=**/*.test.ts,**/*.test.tsx
sonar.exclusions=**/node_modules/**,**/dist/**,**/coverage/**

# Language
sonar.language=ts

# Coverage
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.typescript.lcov.reportPaths=coverage/lcov.info

# Security
sonar.security.hotspots.enabled=true
sonar.security.vulnerabilities.enabled=true

# Quality Gates
sonar.qualitygate.wait=true
sonar.qualitygate.timeout=300
```

**Security Rules to Enable:**
- ✅ SQL Injection detection
- ✅ XSS vulnerability detection
- ✅ Hardcoded credentials detection
- ✅ Weak cryptography detection
- ✅ Path traversal detection
- ✅ Command injection detection
- ✅ Insecure random number generation

### 7.3 Dependency Scanning

```bash
# npm audit (built-in)
npm audit --audit-level=moderate
npm audit fix

# Snyk (recommended)
snyk test                    # Test for vulnerabilities
snyk monitor                 # Monitor project
snyk wizard                  # Interactive fix

# Check outdated dependencies
npm outdated

# Update safely
npm update --save
```

**CI/CD Integration:**

```yaml
# .github/workflows/security.yml
name: Security Scan

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Run npm audit
        run: npm audit --audit-level=high

      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

      - name: SonarQube Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

### 7.4 DAST (Dynamic Application Security Testing)

**OWASP ZAP Baseline Scan:**

```bash
# Docker-based scan
docker run -t owasp/zap2docker-stable zap-baseline.py \
  -t http://staging.gamilit.com \
  -r zap-report.html \
  -J zap-report.json

# Full scan (longer, more thorough)
docker run -t owasp/zap2docker-stable zap-full-scan.py \
  -t http://staging.gamilit.com \
  -r zap-full-report.html
```

### 7.5 Security Testing Checklist

**Authentication & Authorization:**
- [ ] Test password strength requirements
- [ ] Test account lockout after failed attempts
- [ ] Test session timeout
- [ ] Test JWT token expiration
- [ ] Test refresh token rotation
- [ ] Test password reset flow security
- [ ] Test email verification bypass attempts
- [x] Test IDOR vulnerabilities (implemented)
- [ ] Test privilege escalation attempts
- [ ] Test RBAC enforcement

**Input Validation:**
- [x] Test SQL injection (implemented)
- [ ] Test XSS (reflected, stored, DOM-based)
- [ ] Test CSRF protection
- [ ] Test file upload validation
- [ ] Test command injection
- [ ] Test LDAP injection
- [ ] Test XML injection
- [ ] Test path traversal

**Data Protection:**
- [x] Test token hashing (implemented)
- [ ] Test password hashing (bcrypt)
- [ ] Test sensitive data exposure in logs
- [ ] Test sensitive data in URLs
- [ ] Test database encryption at rest
- [ ] Test TLS/SSL configuration
- [ ] Test secure cookies (httpOnly, secure, sameSite)

**API Security:**
- [ ] Test rate limiting
- [ ] Test API authentication
- [ ] Test API authorization
- [ ] Test excessive data exposure
- [ ] Test mass assignment
- [ ] Test security misconfiguration
- [ ] Test CORS configuration
- [ ] Test HTTP headers (CSP, X-Frame-Options, etc.)

---

## 8. Test Data Management

### 8.1 Test Data Strategy

**Fixtures (Static Test Data):**

```typescript
// src/__tests__/fixtures/users.ts

export const testUsers = {
  student: {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'student@test.com',
    password: 'Test1234!',
    role: 'student',
    fullName: 'Test Student',
    rank: 'ixchel',
    mlCoins: 100,
  },
  teacher: {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'teacher@test.com',
    password: 'Test1234!',
    role: 'teacher',
    fullName: 'Test Teacher',
  },
  admin: {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'admin@test.com',
    password: 'Test1234!',
    role: 'super_admin',
    fullName: 'Test Admin',
  },
};

export const testExercises = {
  crucigrama: {
    id: 'exercise-crucigrama-123',
    type: 'crucigrama',
    title: 'Elementos Químicos - Marie Curie',
    difficulty: 'medium',
    mlCoins: 20,
    requiredRank: 'ixchel',
    content: {
      words: [
        { word: 'RADIO', clue: 'Elemento Ra, descubierto en 1898' },
        { word: 'POLONIO', clue: 'Elemento Po, nombrado por Polonia' },
        { word: 'CURIE', clue: 'Unidad de radiactividad' },
      ],
    },
  },
};
```

### 8.2 Test Data Builders

```typescript
// src/__tests__/builders/UserBuilder.ts

export class UserBuilder {
  private user: Partial<User> = {
    role: 'student',
    emailVerified: true,
    status: 'active',
  };

  withRole(role: 'student' | 'teacher' | 'super_admin'): this {
    this.user.role = role;
    return this;
  }

  withEmail(email: string): this {
    this.user.email = email;
    return this;
  }

  withRank(rank: string): this {
    this.user.rank = rank;
    return this;
  }

  inactive(): this {
    this.user.status = 'inactive';
    return this;
  }

  build(): User {
    return {
      id: randomUUID(),
      email: this.user.email || `test-${randomUUID()}@test.com`,
      password: 'Test1234!',
      fullName: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...this.user,
    } as User;
  }

  async create(): Promise<User> {
    const user = this.build();
    await pool.query(
      `INSERT INTO auth.users (id, email, password, role, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, user.email, user.password, user.role, user.status]
    );
    return user;
  }
}

// Usage:
const student = await new UserBuilder()
  .withRole('student')
  .withEmail('john@test.com')
  .withRank('chaak')
  .create();
```

### 8.3 Database Seeding

```typescript
// src/__tests__/seeds/seed.ts

export async function seedDatabase() {
  // Users
  await pool.query(`
    INSERT INTO auth.users (id, email, password, role, tenant_id)
    VALUES
      ('11111111-1111-1111-1111-111111111111', 'student@test.com', 'hashed', 'student', 'tenant-1'),
      ('22222222-2222-2222-2222-222222222222', 'teacher@test.com', 'hashed', 'teacher', 'tenant-1'),
      ('33333333-3333-3333-3333-333333333333', 'admin@test.com', 'hashed', 'super_admin', 'tenant-1')
    ON CONFLICT (id) DO NOTHING
  `);

  // Exercises
  await pool.query(`
    INSERT INTO educational.exercises (id, title, type, difficulty, ml_coins, tenant_id)
    VALUES
      ('exercise-1', 'Crucigrama: Marie Curie', 'crucigrama', 'medium', 20, 'tenant-1'),
      ('exercise-2', 'Sopa de Letras: Química', 'word_search', 'easy', 10, 'tenant-1')
    ON CONFLICT (id) DO NOTHING
  `);

  // Ranks
  await pool.query(`
    INSERT INTO gamification.maya_ranks (id, name, required_xp, ml_coin_multiplier)
    VALUES
      ('ixchel', 'Ixchel - Diosa de la Luna', 0, 1.0),
      ('chaak', 'Chaak - Dios de la Lluvia', 1000, 1.5),
      ('itzamna', 'Itzamná - Señor de los Cielos', 5000, 2.0),
      ('kukulkan', 'Kukulkán - Serpiente Emplumada', 20000, 3.0)
    ON CONFLICT (id) DO NOTHING
  `);
}

export async function cleanDatabase() {
  await pool.query(`
    TRUNCATE TABLE
      educational.exercise_attempts,
      educational.exercises,
      gamification.user_coins,
      gamification.user_ranks,
      auth_management.profiles,
      auth.users
    CASCADE
  `);
}
```

---

## 9. Coverage Targets

### 9.1 Overall Coverage Goals

```
┌──────────────────────┬─────────┬─────────┬──────────┐
│ Component            │ Target  │ Actual  │ Status   │
├──────────────────────┼─────────┼─────────┼──────────┤
│ Backend Global       │ 80%     │ ~15%    │ 🔴 GAP   │
│ Frontend Global      │ 70%     │ ~20%    │ 🔴 GAP   │
│ Critical Modules     │ 95%     │ ~30%    │ 🔴 GAP   │
│ Security Functions   │ 100%    │ ~60%    │ 🟡 GOOD  │
└──────────────────────┴─────────┴─────────┴──────────┘
```

### 9.2 Module-Specific Targets

**Backend:**

```typescript
// Coverage thresholds in jest.config.js

coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
  './src/modules/educational/': {
    branches: 90,
    functions: 90,
    lines: 90,
    statements: 90,
  },
  './src/modules/gamification/rank-system/': {
    branches: 95,
    functions: 95,
    lines: 95,
    statements: 95,
  },
  './src/shared/utils/': {
    branches: 95,
    functions: 95,
    lines: 95,
    statements: 95,
  },
  './src/middleware/': {
    branches: 85,
    functions: 85,
    lines: 85,
    statements: 85,
  },
}
```

### 9.3 Coverage Reports

**Generate Reports:**

```bash
# Backend
cd projects/gamilit-platform-backend
npm run test:coverage

# Frontend
cd projects/gamilit-platform-web
npm run test:coverage

# View HTML report
open coverage/index.html
```

**CI/CD Integration:**

```yaml
# Upload to Codecov
- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
    flags: unittests
    name: codecov-gamilit
```

---

## 10. Continuous Testing

### 10.1 CI/CD Pipeline

**GitHub Actions Workflow:**

```yaml
# .github/workflows/test.yml

name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests-backend:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: gamilit_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: projects/gamilit-platform-backend/package-lock.json

      - name: Install dependencies
        working-directory: projects/gamilit-platform-backend
        run: npm ci

      - name: Run migrations
        working-directory: projects/gamilit-platform-backend
        run: npm run migrate:test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/gamilit_test

      - name: Run unit tests
        working-directory: projects/gamilit-platform-backend
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./projects/gamilit-platform-backend/coverage/lcov.info
          flags: backend

  unit-tests-frontend:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: projects/gamilit-platform-web/package-lock.json

      - name: Install dependencies
        working-directory: projects/gamilit-platform-web
        run: npm ci

      - name: Run unit tests
        working-directory: projects/gamilit-platform-web
        run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./projects/gamilit-platform-web/coverage/lcov.info
          flags: frontend

  integration-tests:
    needs: [unit-tests-backend, unit-tests-frontend]
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: gamilit_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install backend dependencies
        working-directory: projects/gamilit-platform-backend
        run: npm ci

      - name: Run integration tests
        working-directory: projects/gamilit-platform-backend
        run: npm run test:integration

  e2e-tests:
    needs: integration-tests
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Install dependencies
        run: |
          cd projects/gamilit-platform-backend && npm ci
          cd ../gamilit-platform-web && npm ci

      - name: Start servers
        run: |
          cd projects/gamilit-platform-backend && npm run dev &
          cd projects/gamilit-platform-web && npm run dev &
          sleep 30

      - name: Run E2E tests
        run: npx playwright test

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  security-scan:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Run npm audit
        working-directory: projects/gamilit-platform-backend
        run: npm audit --audit-level=high || true

      - name: Run Snyk
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
```

### 10.2 Pre-commit Hooks

**husky + lint-staged:**

```json
// package.json
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "vitest related --run"
    ]
  }
}
```

**.husky/pre-commit:**

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run linter
npm run lint

# Run unit tests for changed files
npm run test:changed

# Type check
npm run type-check
```

### 10.3 Test Execution Strategy

**Local Development:**
```bash
# Watch mode (fast feedback)
npm run test:watch

# Single test file
npm test -- LoginPage.test.tsx

# Coverage
npm run test:coverage
```

**CI/CD:**
```bash
# Run all tests
npm test

# Run with retry (flaky tests)
npm test -- --maxWorkers=2 --retry=2

# Run integration tests separately
npm run test:integration
```

---

## 11. Best Practices

### 11.1 Test Structure (AAA Pattern)

```typescript
it('should calculate ML Coins with rank multiplier', () => {
  // ARRANGE: Setup test data
  const baseReward = 10;
  const rank = 'chaak';
  const expectedCoins = 15;

  // ACT: Execute function
  const actualCoins = calculateMLCoins(baseReward, rank);

  // ASSERT: Verify result
  expect(actualCoins).toBe(expectedCoins);
});
```

### 11.2 Test Independence

```typescript
// ❌ BAD: Tests depend on each other
let userId: string;

test('create user', () => {
  userId = createUser();
});

test('update user', () => {
  updateUser(userId); // Depends on previous test!
});

// ✅ GOOD: Each test is independent
test('create user', () => {
  const userId = createUser();
  expect(userId).toBeDefined();
});

test('update user', () => {
  const userId = createUser(); // Independent setup
  updateUser(userId);
  expect(getUser(userId).updated).toBe(true);
});
```

### 11.3 Descriptive Test Names

```typescript
// ❌ BAD
it('works', () => { ... });
it('test 1', () => { ... });
it('handles error', () => { ... });

// ✅ GOOD
it('should calculate correct ML Coins when user has Chaak rank', () => { ... });
it('should throw ValidationError when exercise answers are empty', () => { ... });
it('should prevent IDOR attack when student tries to access another user progress', () => { ... });
```

### 11.4 Don't Test Implementation Details

```typescript
// ❌ BAD: Testing internal state
it('sets isLoading to true', () => {
  const component = render(<LoginPage />);
  expect(component.state.isLoading).toBe(true);
});

// ✅ GOOD: Testing user-visible behavior
it('shows loading spinner while logging in', async () => {
  render(<LoginPage />);
  const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

  fireEvent.click(submitButton);

  expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
});
```

### 11.5 Avoid Test Flakiness

```typescript
// ❌ BAD: Time-dependent test
it('shows notification', () => {
  showNotification();
  expect(screen.getByText('Success')).toBeInTheDocument(); // May fail if slow
});

// ✅ GOOD: Use waitFor
it('shows notification', async () => {
  showNotification();
  await waitFor(() => {
    expect(screen.getByText('Success')).toBeInTheDocument();
  });
});

// ✅ GOOD: Mock timers
it('closes notification after 3 seconds', () => {
  jest.useFakeTimers();

  showNotification();
  expect(screen.getByText('Success')).toBeInTheDocument();

  jest.advanceTimersByTime(3000);
  expect(screen.queryByText('Success')).not.toBeInTheDocument();

  jest.useRealTimers();
});
```

### 11.6 Test Data Isolation

```typescript
// ✅ Use beforeEach for isolation
beforeEach(async () => {
  await cleanDatabase();
  await seedFixtures();
});

// ✅ Use transactions for speed
beforeEach(async () => {
  await pool.query('BEGIN');
});

afterEach(async () => {
  await pool.query('ROLLBACK');
});
```

### 11.7 Meaningful Assertions

```typescript
// ❌ BAD: Vague assertion
expect(result).toBeTruthy();

// ✅ GOOD: Specific assertions
expect(result.score).toBe(100);
expect(result.mlCoinsEarned).toBe(20);
expect(result.passed).toBe(true);
expect(result.feedback).toContain('¡Excelente trabajo!');
```

---

## 12. Testing Infrastructure

### 12.1 Test Environment Setup

**Backend .env.test:**

```env
NODE_ENV=test
DATABASE_URL=postgresql://test:test@localhost:5432/gamilit_test
JWT_SECRET=test-secret-key-do-not-use-in-production
LOG_LEVEL=error
PORT=3001
```

**Frontend test setup:**

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
});

// Mock environment variables
process.env.VITE_API_URL = 'http://localhost:3001';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

### 12.2 Test Utilities

**Backend helpers:**

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

**Frontend test utilities:**

```typescript
// src/test/test-utils.tsx

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string;
}

export function renderWithRouter(
  ui: ReactElement,
  { initialRoute = '/', ...options }: CustomRenderOptions = {}
) {
  window.history.pushState({}, 'Test page', initialRoute);

  return render(ui, {
    wrapper: ({ children }) => <BrowserRouter>{children}</BrowserRouter>,
    ...options,
  });
}

export function mockAuthUser(user: Partial<User> = {}) {
  const defaultUser = {
    id: '1',
    email: 'test@test.com',
    role: 'student',
    fullName: 'Test User',
    ...user,
  };

  vi.mock('@features/auth/store/authStore', () => ({
    useAuthStore: {
      getState: () => ({ user: defaultUser }),
    },
  }));

  return defaultUser;
}
```

### 12.3 Custom Matchers

```typescript
// src/__tests__/matchers/custom-matchers.ts

expect.extend({
  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);

    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be a valid UUID`
          : `expected ${received} to be a valid UUID`,
    };
  },

  toHaveMLCoins(received: any, expected: number) {
    const actual = received.mlCoins || received.ml_coins;
    const pass = actual === expected;

    return {
      pass,
      message: () =>
        pass
          ? `expected ML Coins not to be ${expected}`
          : `expected ${actual} ML Coins to be ${expected}`,
    };
  },
});

// Usage:
expect(user.id).toBeValidUUID();
expect(result).toHaveMLCoins(20);
```

---

## Resumen Ejecutivo

### Estado Actual del Testing

**Cobertura Global:**
- ✅ **Security Tests:** ~60% (BUENO - SQL injection, IDOR, token hashing)
- 🔴 **Unit Tests:** ~15% (CRÍTICO - falta cobertura en exercise engine, gamification)
- 🔴 **Integration Tests:** ~10% (CRÍTICO - solo IDOR protection)
- 🔴 **E2E Tests:** 0% (CRÍTICO - ningún flujo completo implementado)

**Tests Existentes (13 archivos):**

Backend (5):
1. `rls.middleware.security.test.ts` - SQL injection protection ✅
2. `ownership.middleware.test.ts` - Ownership validation ✅
3. `idor-protection.test.ts` - IDOR integration tests ✅
4. `security-token-hashing.test.ts` - Token security ✅
5. `maya-ranks-consistency.test.ts` - Rank system tests ✅

Frontend (8):
1. `LoginPage.test.tsx` - Login flow + account states ✅
2. `RegisterPage.test.tsx` - Registration flow ✅
3. `EmailVerificationPage.test.tsx` - Email verification ✅
4. `UserManagementPage.test.tsx` - Admin user management ✅
5. `StatusBadge.test.tsx` - UI component ✅
6. `DeactivateUserModal.test.tsx` - Admin modal ✅
7. `LiveLeaderboard.test.tsx` - Leaderboard component ✅
8. `useSanitizedHTML.test.ts` - Security hook ✅

**Gaps Críticos:**
1. ❌ Exercise engine (crucigrama, word search, matching) - 0 tests
2. ❌ Gamification system (ML Coins, ranks, power-ups) - 0 tests
3. ❌ Social features (guilds, chat) - 0 tests
4. ❌ E2E user flows - 0 tests
5. ❌ Performance tests - 0 tests
6. ❌ Load tests - 0 tests

**Próximos Pasos (Prioridad):**
1. 🔴 Crear tests para exercise engine (CRÍTICO para core business)
2. 🔴 Implementar E2E tests para flujo estudiante completo
3. 🟡 Aumentar cobertura de gamification system
4. 🟡 Setup de Playwright para E2E
5. 🟢 Configurar k6 para performance testing

---

**Documento creado:** 28 de Octubre, 2025
**Próxima revisión:** Cada sprint
**Owner:** QA Team + Engineering Team
