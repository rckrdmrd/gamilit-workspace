---
titulo: Estandar de Testing — Integration Tests
tipo: estandar-proyecto
version: 3.0.0
fecha_creacion: 2026-02-02
ultima_actualizacion: 2026-02-27
autor: Equipo de Arquitectura
categoria: estandares
tags:
  - testing
  - integration-tests
  - jest
  - supertest
  - msw
aplica_a:
  - backend
  - frontend
  - fullstack
estado: vigente
---

# Estandar de Testing — Integration Tests

> Archivo especializado extraido de `ESTANDAR-TESTING.md`. Ver [ESTANDAR-TESTING.md](ESTANDAR-TESTING.md) para el indice completo y secciones de Cobertura y Checklists.

> **Cross-reference:** For practical implementation guidance and coverage targets, see [GUIA-COVERAGE-TESTING.md](../50-guides/testing/GUIA-COVERAGE-TESTING.md).

## Referencias Cruzadas

| Archivo | Contenido |
|---------|-----------|
| [ESTANDAR-TESTING.md](ESTANDAR-TESTING.md) | Indice, Cobertura Minima (Sec. 5), Checklists (Sec. 9), Referencias |
| [ESTANDAR-TESTING-UNIT.md](ESTANDAR-TESTING-UNIT.md) | Unit Tests, Naming Conventions, Mocking, Test Data |
| [ESTANDAR-TESTING-E2E.md](ESTANDAR-TESTING-E2E.md) | E2E Tests + Visual Regression |
| [ESTANDAR-TESTING-ARCHITECTURE.md](ESTANDAR-TESTING-ARCHITECTURE.md) | Architecture Tests (ts-arch, circular deps) |

---

## 3. Integration Tests

### 3.1 Backend - Testing de Endpoints

```typescript
// user.controller.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

describe('UserController (Integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Limpiar tablas antes de cada test
    await dataSource.query('TRUNCATE TABLE users CASCADE');
  });

  describe('POST /users', () => {
    it('should create user and return 201', async () => {
      // Arrange
      const createUserDto = {
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: expect.any(String),
        email: createUserDto.email,
        name: createUserDto.name,
      });
      expect(response.body).not.toHaveProperty('password');
    });

    it('should return 400 when email is invalid', async () => {
      // Arrange
      const invalidDto = {
        email: 'invalid-email',
        password: 'SecurePass123!',
        name: 'Test User',
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(invalidDto);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('email');
    });

    it('should return 409 when email already exists', async () => {
      // Arrange
      const createUserDto = {
        email: 'duplicate@example.com',
        password: 'SecurePass123!',
        name: 'First User',
      };

      await request(app.getHttpServer())
        .post('/users')
        .send(createUserDto);

      // Act
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({ ...createUserDto, name: 'Second User' });

      // Assert
      expect(response.status).toBe(409);
    });
  });

  describe('GET /users/:id', () => {
    it('should return user when exists', async () => {
      // Arrange
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'find@example.com',
          password: 'SecurePass123!',
          name: 'Find Me',
        });
      const userId = createResponse.body.id;

      // Act
      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(userId);
    });

    it('should return 404 when user not found', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/users/non-existent-id');

      // Assert
      expect(response.status).toBe(404);
    });
  });
});
```

### 3.2 Frontend - Testing de Features Completas

```typescript
// checkout.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { CheckoutPage } from './CheckoutPage';
import { CartProvider } from '../context/CartContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const server = setupServer(
  rest.get('/api/cart', (req, res, ctx) => {
    return res(ctx.json({
      items: [
        { id: '1', name: 'Product A', price: 29.99, quantity: 2 },
        { id: '2', name: 'Product B', price: 49.99, quantity: 1 },
      ],
      total: 109.97,
    }));
  }),
  rest.post('/api/orders', (req, res, ctx) => {
    return res(ctx.json({ orderId: 'ORD-123', status: 'confirmed' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('CheckoutPage Integration', () => {
  const renderCheckout = () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <CheckoutPage />
        </CartProvider>
      </QueryClientProvider>
    );
  };

  it('should display cart items and total', async () => {
    // Arrange & Act
    renderCheckout();

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Product A')).toBeInTheDocument();
      expect(screen.getByText('Product B')).toBeInTheDocument();
      expect(screen.getByText('$109.97')).toBeInTheDocument();
    });
  });

  it('should complete checkout flow successfully', async () => {
    // Arrange
    const user = userEvent.setup();
    renderCheckout();

    await waitFor(() => {
      expect(screen.getByText('Product A')).toBeInTheDocument();
    });

    // Act - Fill shipping info
    await user.type(screen.getByLabelText(/address/i), '123 Main St');
    await user.type(screen.getByLabelText(/city/i), 'New York');
    await user.type(screen.getByLabelText(/zip/i), '10001');

    // Act - Fill payment info
    await user.type(screen.getByLabelText(/card number/i), '4111111111111111');
    await user.type(screen.getByLabelText(/expiry/i), '12/28');
    await user.type(screen.getByLabelText(/cvv/i), '123');

    // Act - Submit
    await user.click(screen.getByRole('button', { name: /place order/i }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/order confirmed/i)).toBeInTheDocument();
      expect(screen.getByText('ORD-123')).toBeInTheDocument();
    });
  });
});
```

### 3.3 Database - Estrategias de Limpieza

```typescript
// test/database-helpers.ts
import { DataSource } from 'typeorm';

export class TestDatabaseHelper {
  constructor(private dataSource: DataSource) {}

  /**
   * Trunca todas las tablas en orden correcto (respetando FK)
   */
  async cleanDatabase(): Promise<void> {
    const entities = this.dataSource.entityMetadatas;

    for (const entity of entities) {
      const repository = this.dataSource.getRepository(entity.name);
      await repository.query(
        `TRUNCATE TABLE "${entity.tableName}" RESTART IDENTITY CASCADE`
      );
    }
  }

  /**
   * Seed datos de prueba minimos
   */
  async seedTestData(): Promise<void> {
    await this.dataSource.query(`
      INSERT INTO roles (id, name) VALUES
        ('role-admin', 'ADMIN'),
        ('role-user', 'USER');
    `);
  }

  /**
   * Ejecuta test dentro de una transaccion que hace rollback
   */
  async runInTransaction<T>(fn: () => Promise<T>): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.startTransaction();

    try {
      const result = await fn();
      return result;
    } finally {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
    }
  }
}
```

---

## Referencias Cruzadas

### Estandares Relacionados
- [ESTANDAR-BACKEND-PROFESIONAL.md](ESTANDAR-BACKEND-PROFESIONAL.md) - Testing patterns para backend NestJS
- [ESTANDAR-FRONTEND-PROFESIONAL.md](ESTANDAR-FRONTEND-PROFESIONAL.md) - Testing patterns para React

### Guias de Implementacion
- [GUIA-COVERAGE-TESTING](../50-guides/testing/GUIA-COVERAGE-TESTING.md) - Estrategia de cobertura y metricas actuales

### Principios Aplicados
- [PRINCIPIO-SOLID](../../orchestration/directivas/principios/PRINCIPIO-SOLID.md) - Diseño testeable (SRP, DIP)
- [PRINCIPIO-VALIDACION-OBLIGATORIA](../../orchestration/directivas/principios/PRINCIPIO-VALIDACION-OBLIGATORIA.md) - Principio de validacion obligatoria (build + lint + tests)

## Referencias
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/)
- [MSW - Mock Service Worker](https://mswjs.io/docs/)
