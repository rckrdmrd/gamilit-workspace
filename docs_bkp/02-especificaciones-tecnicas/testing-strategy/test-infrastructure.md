# TEST INFRASTRUCTURE & BEST PRACTICES

**Proyecto:** Gamilit Platform
**Módulo:** Testing Strategy - Infrastructure & Best Practices
**Fecha:** 01 de Noviembre, 2025
**Versión:** 1.0
**Estado:** Documento Técnico
**RFC:** RFC-0001 (Modularización de Documentación)

---

## Tabla de Contenidos

1. [Overview](#overview)
2. [Test Environment Setup](#test-environment-setup)
3. [Test Utilities](#test-utilities)
4. [Test Data Management](#test-data-management)
5. [Continuous Testing (CI/CD)](#continuous-testing-cicd)
6. [Best Practices](#best-practices)
7. [Coverage Reporting](#coverage-reporting)

---

## 1. Overview

### 1.1 Definición

La infraestructura de testing proporciona el **entorno, herramientas y prácticas** necesarias para ejecutar tests de forma consistente, eficiente y automatizada.

---

## 2. Test Environment Setup

### 2.1 Backend Environment

**Backend .env.test:**

```env
NODE_ENV=test
DATABASE_URL=postgresql://test:test@localhost:5432/gamilit_test
JWT_SECRET=test-secret-key-do-not-use-in-production
LOG_LEVEL=error
PORT=3001
REDIS_URL=redis://localhost:6379/1
```

**Test Setup File:**

```typescript
// src/__tests__/setup.ts

import { pool } from '../database/pool';
import { runMigrations } from '../database/migrations';

beforeAll(async () => {
  // Run migrations on test database
  await runMigrations();

  // Seed initial data
  await seedTestData();
});

afterAll(async () => {
  // Cleanup
  await cleanupDatabase();
  await pool.end();
});

beforeEach(async () => {
  // Truncate tables between tests (or use transactions)
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

### 2.2 Frontend Environment

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

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
};
```

---

## 3. Test Utilities

### 3.1 Backend Helpers

```typescript
// src/__tests__/helpers/test-utils.ts

import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { jwtConfig } from '../../config/jwt';
import { pool } from '../../database/pool';

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

export async function createTestExercise(overrides: Partial<Exercise> = {}): Promise<Exercise> {
  const exercise = {
    id: randomUUID(),
    title: 'Test Exercise',
    type: 'crucigrama',
    difficulty: 'medium',
    ml_coins: 20,
    tenant_id: 'test-tenant',
    ...overrides,
  };

  await pool.query(
    `INSERT INTO educational.exercises (id, title, type, difficulty, ml_coins, tenant_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [exercise.id, exercise.title, exercise.type, exercise.difficulty, exercise.ml_coins, exercise.tenant_id]
  );

  return exercise;
}
```

### 3.2 Frontend Test Utilities

```typescript
// src/test/test-utils.tsx

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialRoute?: string;
}

export function renderWithRouter(
  ui: ReactElement,
  { initialRoute = '/', ...options }: CustomRenderOptions = {}
) {
  window.history.pushState({}, 'Test page', initialRoute);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(ui, {
    wrapper: ({ children }) => (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>{children}</BrowserRouter>
      </QueryClientProvider>
    ),
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

### 3.3 Custom Matchers

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

## 4. Test Data Management

### 4.1 Fixtures (Static Test Data)

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

### 4.2 Test Data Builders

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

### 4.3 Database Seeding

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

## 5. Continuous Testing (CI/CD)

### 5.1 GitHub Actions Workflow

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
```

### 5.2 Pre-commit Hooks

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

---

## 6. Best Practices

### 6.1 Test Structure (AAA Pattern)

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

### 6.2 Test Independence

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

### 6.3 Descriptive Test Names

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

### 6.4 Don't Test Implementation Details

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

### 6.5 Avoid Test Flakiness

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
```

---

## 7. Coverage Reporting

### 7.1 Generate Reports

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

### 7.2 CI/CD Integration

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

## Referencias

- [Testing Strategy - Overview](./README.md)
- [Unit Testing](./unit-testing.md)
- [Integration Testing](./integration-testing.md)
- [E2E Testing](./e2e-testing.md)
- [Security Testing](./security-testing.md)

---

**Documento creado:** 01 de Noviembre, 2025
**Próxima revisión:** Cada sprint
**Owner:** QA Team + DevOps Team
