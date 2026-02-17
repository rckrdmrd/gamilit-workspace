# Guía de Testing Backend

**Versión:** 1.0.0
**Última Actualización:** 2025-11-28
**Aplica a:** apps/backend/src/

---

## Resumen

GAMILIT utiliza Jest como framework de testing para el backend. Esta guía cubre tests unitarios, de integración y end-to-end.

---

## Estructura de Tests

```
apps/backend/
├── src/
│   └── modules/
│       └── gamification/
│           ├── services/
│           │   ├── user-stats.service.ts
│           │   └── __tests__/
│           │       └── user-stats.service.spec.ts
│           └── controllers/
│               ├── user-stats.controller.ts
│               └── __tests__/
│                   └── user-stats.controller.spec.ts
└── test/
    ├── app.e2e-spec.ts
    └── jest-e2e.json
```

---

## Ejecutar Tests

### Tests Unitarios

```bash
# Todos los tests
npm run test

# Con coverage
npm run test:cov

# En modo watch
npm run test:watch

# Un archivo específico
npm run test -- user-stats.service.spec.ts
```

### Tests E2E

```bash
npm run test:e2e
```

---

## Tests Unitarios de Servicios

### Estructura Básica

```typescript
// modules/gamification/services/__tests__/user-stats.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserStatsService } from '../user-stats.service';
import { UserStatsEntity } from '../../entities/user-stats.entity';

describe('UserStatsService', () => {
  let service: UserStatsService;
  let repository: jest.Mocked<Repository<UserStatsEntity>>;

  const mockRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserStatsService,
        {
          provide: getRepositoryToken(UserStatsEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserStatsService>(UserStatsService);
    repository = module.get(getRepositoryToken(UserStatsEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUserId', () => {
    it('should return user stats when found', async () => {
      const mockStats = {
        id: 'stats-uuid',
        userId: 'user-uuid',
        totalXp: 500,
        mlCoins: 100,
      };

      mockRepository.findOne.mockResolvedValue(mockStats);

      const result = await service.findByUserId('user-uuid');

      expect(result).toEqual(mockStats);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { userId: 'user-uuid' },
      });
    });

    it('should return null when not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByUserId('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('addXp', () => {
    it('should add XP and update level if threshold reached', async () => {
      const currentStats = {
        id: 'stats-uuid',
        userId: 'user-uuid',
        totalXp: 450,
        currentLevel: 1,
      };

      mockRepository.findOne.mockResolvedValue(currentStats);
      mockRepository.save.mockImplementation((entity) => Promise.resolve(entity));

      const result = await service.addXp('user-uuid', 100);

      expect(result.totalXp).toBe(550);
      expect(result.currentLevel).toBe(2); // Level up!
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });
});
```

---

## Tests de Controladores

```typescript
// modules/gamification/controllers/__tests__/user-stats.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserStatsController } from '../user-stats.controller';
import { UserStatsService } from '../../services/user-stats.service';

describe('UserStatsController', () => {
  let controller: UserStatsController;
  let service: jest.Mocked<UserStatsService>;

  const mockService = {
    findByUserId: jest.fn(),
    addXp: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserStatsController],
      providers: [
        {
          provide: UserStatsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<UserStatsController>(UserStatsController);
    service = module.get(UserStatsService);
  });

  describe('getMyStats', () => {
    it('should return stats for authenticated user', async () => {
      const mockUser = { id: 'user-uuid' };
      const mockStats = { totalXp: 500, mlCoins: 100 };

      mockService.findByUserId.mockResolvedValue(mockStats);

      const result = await controller.getMyStats(mockUser);

      expect(result).toEqual(mockStats);
      expect(mockService.findByUserId).toHaveBeenCalledWith('user-uuid');
    });
  });
});
```

---

## Mocking Dependencias Comunes

### TypeORM Repository

```typescript
const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
    getOne: jest.fn(),
  })),
};
```

### ConfigService

```typescript
const mockConfigService = {
  get: jest.fn((key: string) => {
    const config = {
      'JWT_SECRET': 'test-secret',
      'DB_HOST': 'localhost',
    };
    return config[key];
  }),
};

providers: [
  {
    provide: ConfigService,
    useValue: mockConfigService,
  },
],
```

### DataSource (para transacciones)

```typescript
const mockDataSource = {
  transaction: jest.fn((callback) => callback(mockEntityManager)),
  query: jest.fn(),
};

const mockEntityManager = {
  findOne: jest.fn(),
  save: jest.fn(),
};
```

---

## Testing Excepciones

```typescript
describe('findOne', () => {
  it('should throw NotFoundException when user not found', async () => {
    mockRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne('non-existent'))
      .rejects
      .toThrow(NotFoundException);
  });

  it('should throw BadRequestException for invalid input', async () => {
    await expect(service.addXp('user-uuid', -100))
      .rejects
      .toThrow(BadRequestException);
  });
});
```

---

## Tests E2E

```typescript
// test/gamification.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Gamification (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login to get token
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'password' });

    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/v1/gamification/stats', () => {
    it('should return user stats', () => {
      return request(app.getHttpServer())
        .get('/api/v1/gamification/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalXp');
          expect(res.body).toHaveProperty('mlCoins');
        });
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/v1/gamification/stats')
        .expect(401);
    });
  });
});
```

---

## Coverage Thresholds

### jest.config.js

```javascript
module.exports = {
  // ...
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.e2e-spec.ts',
    '!src/main.ts',
  ],
};
```

---

## Fixtures y Factories

### Crear Factory

```typescript
// test/factories/user-stats.factory.ts
import { UserStatsEntity } from '../../src/modules/gamification/entities/user-stats.entity';

export const createMockUserStats = (
  overrides: Partial<UserStatsEntity> = {},
): UserStatsEntity => ({
  id: 'stats-uuid',
  userId: 'user-uuid',
  tenantId: 'tenant-uuid',
  totalXp: 500,
  currentLevel: 2,
  mlCoins: 100,
  currentStreak: 5,
  longestStreak: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
```

### Uso

```typescript
const stats = createMockUserStats({ totalXp: 1000 });
mockRepository.findOne.mockResolvedValue(stats);
```

---

## Testing de Validación

```typescript
import { validate } from 'class-validator';
import { CreateAchievementDto } from '../dto/create-achievement.dto';

describe('CreateAchievementDto', () => {
  it('should fail with empty name', async () => {
    const dto = new CreateAchievementDto();
    dto.name = '';
    dto.xpReward = 50;

    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should pass with valid data', async () => {
    const dto = new CreateAchievementDto();
    dto.name = 'First Steps';
    dto.xpReward = 50;
    dto.categoryId = 'valid-uuid';

    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });
});
```

---

## Buenas Prácticas

1. **Nombrar tests descriptivamente**: `it('should throw NotFoundException when user not found')`
2. **Un assert por test** cuando sea posible
3. **Aislar tests**: Cada test debe ser independiente
4. **Usar factories**: Para crear datos de prueba consistentes
5. **Mockear solo lo necesario**: No sobre-mockear
6. **Tests de happy path primero**: Luego edge cases
7. **Coverage no es todo**: Priorizar tests de valor

---

## Ver También

- [../../testing/TESTING-GUIDE.md](../../testing/TESTING-GUIDE.md) - Guía general de testing
- [ESTRUCTURA-MODULOS.md](./ESTRUCTURA-MODULOS.md) - Dónde ubicar tests
- [ERROR-HANDLING.md](./ERROR-HANDLING.md) - Testing de errores
