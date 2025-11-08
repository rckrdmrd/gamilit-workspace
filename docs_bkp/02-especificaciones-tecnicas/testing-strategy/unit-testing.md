# UNIT TESTING STRATEGY

**Proyecto:** Gamilit Platform
**Módulo:** Testing Strategy - Unit Testing
**Fecha:** 01 de Noviembre, 2025
**Versión:** 1.0
**Estado:** Documento Técnico
**RFC:** RFC-0001 (Modularización de Documentación)

---

## Tabla de Contenidos

1. [Overview](#overview)
2. [Alcance del Unit Testing](#alcance-del-unit-testing)
3. [Herramientas y Configuración](#herramientas-y-configuración)
4. [Patrones de Testing](#patrones-de-testing)
5. [Mocking Strategies](#mocking-strategies)
6. [Coverage Targets](#coverage-targets)

---

## 1. Overview

### 1.1 Definición

El Unit Testing se enfoca en probar **funciones individuales, componentes y servicios de forma aislada**, sin dependencias externas como bases de datos, APIs o sistema de archivos.

### 1.2 Objetivos

| Objetivo | Target | Prioridad |
|----------|--------|-----------|
| **Backend Coverage** | 80%+ | CRÍTICO |
| **Frontend Coverage** | 70%+ | ALTA |
| **Critical Modules** | 95%+ | CRÍTICO |
| **Test Execution Time** | < 5 min | MEDIA |

### 1.3 Distribución en la Pirámide de Testing

```
Unit Tests: 70% del total (~210 tests de 300)
- Backend: 150 tests
- Frontend: 60 tests
```

---

## 2. Alcance del Unit Testing

### 2.1 Backend Modules (Node.js + TypeScript + Express)

```
src/
├── modules/
│   ├── auth/
│   │   ├── services/          ← 90% coverage target
│   │   ├── validators/        ← 95% coverage target
│   │   └── utils/             ← 95% coverage target
│   ├── educational/
│   │   ├── services/          ← 90% coverage target
│   │   ├── exercise-engine/   ← 95% coverage target (CRÍTICO)
│   │   └── grading/           ← 95% coverage target (CRÍTICO)
│   ├── gamification/
│   │   ├── services/          ← 90% coverage target
│   │   ├── rank-system/       ← 95% coverage target (CRÍTICO)
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

### 2.2 Frontend Components (React + Vite + TypeScript)

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
│   │   ├── exercises/         ← 80% coverage target (CRÍTICO)
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

---

## 3. Herramientas y Configuración

### 3.1 Backend: Jest 30.x

**Configuración Actual:**
- **Jest:** v30.2.0
- **ts-jest:** v29.4.5
- Scripts:
  - `npm test` - Run all tests
  - `npm run test:watch` - Watch mode
  - `npm run test:coverage` - Coverage report

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

### 3.2 Frontend: Vitest 3.x

**Configuración Actual (vitest.config.ts):**

```typescript
{
  environment: 'jsdom',
  setupFiles: './src/test/setup.ts',
  css: true,
  globals: true
}
```

**Herramientas:**
- **Unit Testing:** Vitest 3.x
- **Component Testing:** React Testing Library 16.x
- **Mocking:** vi (Vitest)
- **Coverage:** c8 (via Vitest)
- **DOM Testing:** jsdom 27.x
- **User Simulation:** @testing-library/user-event 14.x
- **Accessibility:** @axe-core/react 4.x

---

## 4. Patrones de Testing

### 4.1 Backend: Service Testing

**Pattern: Arrange-Act-Assert (AAA)**

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
    it('should promote user from Ajaw to Nacom when XP threshold met', async () => {
      // Arrange
      const userId = 'user-123';
      const currentRank = {
        rankId: 'Ajaw',
        currentXp: 1500,
        name: 'Ajaw - Señor/Gobernante',
      };

      const nextRank = {
        rankId: 'Nacom',
        requiredXp: 1000,
        name: 'Nacom - Capitán de Guerra',
      };

      mockRankRepository.getUserRank.mockResolvedValue(currentRank);
      mockRankRepository.getRankRequirements.mockResolvedValue(nextRank);

      // Act
      const result = await rankService.calculateRankUp(userId);

      // Assert
      expect(result.shouldRankUp).toBe(true);
      expect(result.newRank).toBe('Nacom');
      expect(mockRankRepository.updateRank).toHaveBeenCalledWith(
        userId,
        'Nacom',
        expect.any(Number)
      );
    });

    it('should not promote user when XP threshold not met', async () => {
      // Arrange
      const userId = 'user-123';
      const currentRank = {
        rankId: 'Ajaw',
        currentXp: 500,
        name: 'Ajaw - Señor/Gobernante',
      };

      mockRankRepository.getUserRank.mockResolvedValue(currentRank);

      // Act
      const result = await rankService.calculateRankUp(userId);

      // Assert
      expect(result.shouldRankUp).toBe(false);
      expect(mockRankRepository.updateRank).not.toHaveBeenCalled();
    });

    it('should throw error when user is at max rank (K\'uk\'ulkan)', async () => {
      // Arrange
      const userId = 'user-123';
      const maxRank = {
        rankId: 'K\'uk\'ulkan',
        currentXp: 50000,
        name: 'K\'uk\'ulkan - Serpiente Emplumada',
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
      const rank = 'Nacom'; // Multiplier: 1.25x

      // Act
      const coins = rankService.calculateMLCoinsReward(baseReward, rank);

      // Assert
      expect(coins).toBe(12.5); // 10 * 1.25
    });

    it('should use 1x multiplier for base rank (Ajaw)', () => {
      const coins = rankService.calculateMLCoinsReward(10, 'Ajaw');
      expect(coins).toBe(10);
    });
  });
});
```

### 4.2 Frontend: Component Testing

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

### 4.3 Validation Testing (Zod)

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

---

## 5. Mocking Strategies

### 5.1 Database Mocking

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

### 5.2 External APIs

```typescript
// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

mockedAxios.get.mockResolvedValue({
  data: { success: true },
  status: 200,
});
```

### 5.3 Time Mocking

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

---

## 6. Coverage Targets

### 6.1 Module-Specific Targets

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

### 6.2 Coverage Reports

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

---

## Referencias

- [Testing Strategy - Overview](./README.md)
- [Integration Testing](./integration-testing.md)
- [E2E Testing](./e2e-testing.md)
- [Test Infrastructure](./test-infrastructure.md)

---

**Documento creado:** 01 de Noviembre, 2025
**Próxima revisión:** Cada sprint
**Owner:** QA Team + Engineering Team
