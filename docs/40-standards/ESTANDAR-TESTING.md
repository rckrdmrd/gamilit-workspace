---
titulo: Estandar de Testing
version: 2.0.0
fecha_creacion: 2026-02-02
ultima_actualizacion: 2026-02-14
autor: Equipo de Arquitectura
categoria: estandares
tags:
  - testing
  - unit-tests
  - integration-tests
  - e2e-tests
  - jest
  - playwright
aplica_a:
  - backend
  - frontend
  - fullstack
estado: vigente
---

# Estandar de Testing

## 1. Piramide de Testing

La piramide de testing define la proporcion y estrategia de tests en nuestros proyectos.

```
                    /\
                   /  \
                  /E2E \
                 / 10%  \
                /--------\
               /          \
              /Integration \
             /     20%      \
            /----------------\
           /                  \
          /    Unit Tests      \
         /        70%           \
        /------------------------\
```

### Distribucion Recomendada

| Nivel | Porcentaje | Tiempo Ejecucion | Alcance |
|-------|------------|------------------|---------|
| Unit Tests | 70% | Milisegundos | Funciones, clases, componentes aislados |
| Integration Tests | 20% | Segundos | Modulos, APIs, base de datos |
| E2E Tests | 10% | Minutos | Flujos completos de usuario |

### Principios por Nivel

**Unit Tests (Base - 70%)**
- Rapidos: ejecutan en milisegundos
- Aislados: sin dependencias externas
- Deterministas: mismo resultado siempre
- Independientes: no dependen de otros tests

**Integration Tests (Medio - 20%)**
- Validan interaccion entre componentes
- Pueden usar base de datos de prueba
- Verifican contratos entre servicios
- Tiempo de ejecucion moderado

**E2E Tests (Cima - 10%)**
- Simulan comportamiento real del usuario
- Cubren flujos criticos de negocio
- Mayor tiempo de ejecucion
- Detectan problemas de integracion completa

---

## 2. Unit Tests

### 2.1 Caracteristicas Esenciales

```
FAST       → Ejecutan en milisegundos
ISOLATED   → Sin dependencias externas (DB, APIs, filesystem)
REPEATABLE → Mismo resultado en cualquier ambiente
SELF-VALIDATING → Pass/Fail automatico
TIMELY     → Escritos junto con el codigo
```

### 2.2 Naming Convention

Utilizamos el patron `describe/it` con descripcion clara de comportamiento:

```typescript
// Patron: describe('ClassName/FunctionName').it('should [expected] when [condition]')

describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user when valid data is provided', () => {
      // test
    });

    it('should throw ValidationError when email is invalid', () => {
      // test
    });

    it('should hash password before saving', () => {
      // test
    });
  });
});
```

### 2.3 AAA Pattern (Arrange-Act-Assert)

Todo unit test debe seguir el patron AAA:

```typescript
describe('Calculator', () => {
  describe('add', () => {
    it('should return sum of two positive numbers', () => {
      // Arrange - Preparar datos y dependencias
      const calculator = new Calculator();
      const a = 5;
      const b = 3;

      // Act - Ejecutar la accion bajo test
      const result = calculator.add(a, b);

      // Assert - Verificar resultado esperado
      expect(result).toBe(8);
    });
  });
});
```

### 2.4 Ejemplo Backend (Jest + NestJS)

```typescript
// user.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { ConflictException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const mockRepository = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repository = module.get(UserRepository);
  });

  describe('createUser', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'SecurePass123!',
      name: 'Test User',
    };

    it('should create user successfully when email is unique', async () => {
      // Arrange
      repository.findByEmail.mockResolvedValue(null);
      repository.save.mockResolvedValue({ id: '1', ...createUserDto });

      // Act
      const result = await service.createUser(createUserDto);

      // Assert
      expect(result).toHaveProperty('id');
      expect(result.email).toBe(createUserDto.email);
      expect(repository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
    });

    it('should throw ConflictException when email already exists', async () => {
      // Arrange
      repository.findByEmail.mockResolvedValue({ id: '1', ...createUserDto });

      // Act & Assert
      await expect(service.createUser(createUserDto))
        .rejects
        .toThrow(ConflictException);
    });

    it('should hash password before saving', async () => {
      // Arrange
      repository.findByEmail.mockResolvedValue(null);
      repository.save.mockImplementation(async (user) => ({ id: '1', ...user }));

      // Act
      await service.createUser(createUserDto);

      // Assert
      const savedUser = repository.save.mock.calls[0][0];
      expect(savedUser.password).not.toBe(createUserDto.password);
      expect(savedUser.password).toMatch(/^\$2[aby]\$/); // bcrypt hash pattern
    });
  });
});
```

### 2.5 Ejemplo Frontend (React Testing Library)

```typescript
// UserProfile.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '/avatar.png',
  };

  describe('rendering', () => {
    it('should display user name and email', () => {
      // Arrange & Act
      render(<UserProfile user={mockUser} />);

      // Assert
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('should display avatar with correct alt text', () => {
      // Arrange & Act
      render(<UserProfile user={mockUser} />);

      // Assert
      const avatar = screen.getByRole('img', { name: /john doe/i });
      expect(avatar).toHaveAttribute('src', '/avatar.png');
    });
  });

  describe('edit mode', () => {
    it('should show edit form when edit button is clicked', async () => {
      // Arrange
      const user = userEvent.setup();
      render(<UserProfile user={mockUser} />);

      // Act
      await user.click(screen.getByRole('button', { name: /edit/i }));

      // Assert
      expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    });

    it('should call onUpdate with new data when form is submitted', async () => {
      // Arrange
      const user = userEvent.setup();
      const onUpdate = jest.fn();
      render(<UserProfile user={mockUser} onUpdate={onUpdate} />);

      // Act
      await user.click(screen.getByRole('button', { name: /edit/i }));
      await user.clear(screen.getByRole('textbox', { name: /name/i }));
      await user.type(screen.getByRole('textbox', { name: /name/i }), 'Jane Doe');
      await user.click(screen.getByRole('button', { name: /save/i }));

      // Assert
      await waitFor(() => {
        expect(onUpdate).toHaveBeenCalledWith({
          ...mockUser,
          name: 'Jane Doe',
        });
      });
    });
  });
});
```

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

## 4. E2E Tests

### 4.1 Herramientas Recomendadas

| Herramienta | Uso Principal | Ventajas |
|-------------|---------------|----------|
| Playwright | E2E cross-browser | Multi-browser, rapido, auto-wait |
| Cypress | E2E + Component | Developer experience, time-travel |

**Recomendacion:** Playwright para proyectos nuevos.

### 4.2 Escenarios Criticos a Cubrir

```
AUTENTICACION
├── Login exitoso
├── Login fallido (credenciales incorrectas)
├── Logout
├── Recuperacion de password
└── Registro de usuario

FLUJOS CORE DE NEGOCIO
├── Crear/Editar/Eliminar entidades principales
├── Checkout completo (si aplica)
├── Generacion de reportes
└── Flujos de aprobacion/workflow

PERMISOS Y SEGURIDAD
├── Acceso a rutas protegidas sin autenticacion
├── Acceso a recursos sin autorizacion
└── Validacion de roles
```

### 4.3 Ejemplo Playwright con Page Object Model

```typescript
// pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign In' });
    this.errorMessage = page.getByRole('alert');
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() ?? '';
  }
}

// pages/DashboardPage.ts
import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly welcomeMessage: Locator;
  readonly userMenu: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeMessage = page.getByTestId('welcome-message');
    this.userMenu = page.getByTestId('user-menu');
    this.logoutButton = page.getByRole('menuitem', { name: 'Logout' });
  }

  async logout(): Promise<void> {
    await this.userMenu.click();
    await this.logoutButton.click();
  }

  async getWelcomeText(): Promise<string> {
    return await this.welcomeMessage.textContent() ?? '';
  }
}
```

```typescript
// tests/auth.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('Authentication', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // Act
    await loginPage.goto();
    await loginPage.login('admin@example.com', 'AdminPass123!');

    // Assert
    await expect(page).toHaveURL('/dashboard');
    const welcomeText = await dashboardPage.getWelcomeText();
    expect(welcomeText).toContain('Welcome');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);

    // Act
    await loginPage.goto();
    await loginPage.login('wrong@example.com', 'wrongpass');

    // Assert
    await expect(page).toHaveURL('/login');
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Invalid credentials');
  });

  test('should redirect to login when accessing protected route', async ({ page }) => {
    // Act
    await page.goto('/dashboard');

    // Assert
    await expect(page).toHaveURL(/\/login/);
  });

  test('should logout successfully', async ({ page }) => {
    // Arrange - Login first
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.login('admin@example.com', 'AdminPass123!');
    await expect(page).toHaveURL('/dashboard');

    // Act
    await dashboardPage.logout();

    // Assert
    await expect(page).toHaveURL('/login');
  });
});
```

### 4.4 Configuracion Playwright

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
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
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

---

## 5. Cobertura Minima

### 5.1 Objetivos de Cobertura

| Metrica | Minimo | Objetivo | Critico |
|---------|--------|----------|---------|
| Statements | 75% | 80% | 85% |
| Branches | 70% | 75% | 80% |
| Functions | 80% | 85% | 90% |
| Lines | 75% | 80% | 85% |

### 5.2 Configuracion Jest Coverage

```javascript
// jest.config.js
module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/index.ts',
    '!src/main.ts',
    '!src/**/*.mock.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 85,
      lines: 80,
    },
    // Umbrales mas estrictos para codigo critico
    './src/core/auth/**/*.ts': {
      statements: 90,
      branches: 85,
      functions: 95,
      lines: 90,
    },
    './src/core/payments/**/*.ts': {
      statements: 95,
      branches: 90,
      functions: 100,
      lines: 95,
    },
  },
};
```

### 5.3 Excepciones Documentadas

Las excepciones a la cobertura minima deben documentarse:

```typescript
// coverage-exceptions.ts
/**
 * EXCEPCIONES DE COBERTURA
 *
 * Archivo: src/infrastructure/external/legacy-adapter.ts
 * Cobertura actual: 45%
 * Razon: Codigo legacy en proceso de deprecacion
 * Responsable: @dev-lead
 * Fecha revision: 2026-03-01
 * Ticket: TECH-456
 *
 * Archivo: src/utils/dev-tools.ts
 * Cobertura actual: 0%
 * Razon: Utilidades solo para desarrollo, no se ejecutan en produccion
 * Responsable: @platform-team
 */
```

---

## 6. Test Naming Conventions

### 6.1 Patron Recomendado

```
should_[comportamiento_esperado]_when_[condicion]
```

### 6.2 Ejemplos Buenos vs Malos

```typescript
// MAL - Nombres vagos o tecnicos
describe('UserService', () => {
  it('works', () => {});                           // Muy vago
  it('test create', () => {});                     // No describe comportamiento
  it('createUser returns user', () => {});         // No describe cuando/condicion
  it('handles error', () => {});                   // No especifica que error
});

// BIEN - Nombres descriptivos y especificos
describe('UserService', () => {
  describe('createUser', () => {
    it('should create and return new user when valid data is provided', () => {});
    it('should throw ValidationError when email format is invalid', () => {});
    it('should throw ConflictException when email already exists', () => {});
    it('should hash password before persisting to database', () => {});
    it('should send welcome email after successful creation', () => {});
  });

  describe('updateUser', () => {
    it('should update user fields when user exists and has permission', () => {});
    it('should throw NotFoundException when user does not exist', () => {});
    it('should throw ForbiddenException when user lacks permission', () => {});
  });
});
```

### 6.3 Convenciones Adicionales

```typescript
// Agrupar por metodo/funcionalidad
describe('ClassName', () => {
  describe('methodName', () => {
    // Casos de exito primero
    it('should [success case 1]', () => {});
    it('should [success case 2]', () => {});

    // Casos de error despues
    it('should throw [ErrorType] when [condition]', () => {});
    it('should return null when [condition]', () => {});

    // Casos edge
    it('should handle empty input', () => {});
    it('should handle maximum values', () => {});
  });
});

// Para componentes React
describe('ComponentName', () => {
  describe('rendering', () => {
    it('should render correctly with required props', () => {});
    it('should display loading state while fetching', () => {});
  });

  describe('user interactions', () => {
    it('should call onClick handler when button is clicked', () => {});
    it('should update input value when user types', () => {});
  });

  describe('edge cases', () => {
    it('should show empty state when data is empty', () => {});
    it('should show error message when fetch fails', () => {});
  });
});
```

---

## 7. Mocking y Stubbing

### 7.1 Cuando Mockear

```
MOCKEAR:
├── Servicios externos (APIs, bases de datos)
├── Funciones con side effects (email, notificaciones)
├── Operaciones de I/O (filesystem, network)
├── Funciones con comportamiento no determinista (Date.now, Math.random)
├── Dependencias pesadas o lentas
└── Servicios de terceros (Stripe, AWS, etc.)

NO MOCKEAR:
├── La logica que estas probando
├── Objetos de valor (DTOs, Entities simples)
├── Funciones puras sin dependencias
├── Utilidades internas del proyecto
└── Tipos y interfaces
```

### 7.2 jest.mock y jest.spyOn

```typescript
// jest.mock - Mock completo del modulo
jest.mock('./email.service');

import { EmailService } from './email.service';

const mockEmailService = EmailService as jest.Mocked<typeof EmailService>;

describe('UserService', () => {
  beforeEach(() => {
    mockEmailService.sendWelcomeEmail.mockResolvedValue(undefined);
  });

  it('should send welcome email after creating user', async () => {
    await userService.createUser(userData);

    expect(mockEmailService.sendWelcomeEmail).toHaveBeenCalledWith(
      expect.objectContaining({ email: userData.email })
    );
  });
});
```

```typescript
// jest.spyOn - Espiar metodos especificos
describe('PaymentService', () => {
  it('should log payment attempt', async () => {
    const logSpy = jest.spyOn(logger, 'info');

    await paymentService.processPayment(paymentData);

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('Payment initiated'),
      expect.any(Object)
    );

    logSpy.mockRestore();
  });
});
```

### 7.3 MSW para API Mocking

```typescript
// mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  // GET endpoints
  rest.get('/api/users', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: '1', name: 'User 1', email: 'user1@example.com' },
        { id: '2', name: 'User 2', email: 'user2@example.com' },
      ])
    );
  }),

  // POST endpoints
  rest.post('/api/users', async (req, res, ctx) => {
    const body = await req.json();
    return res(
      ctx.status(201),
      ctx.json({ id: '3', ...body })
    );
  }),

  // Error scenarios
  rest.get('/api/users/:id', (req, res, ctx) => {
    const { id } = req.params;

    if (id === 'not-found') {
      return res(ctx.status(404), ctx.json({ message: 'User not found' }));
    }

    return res(ctx.json({ id, name: 'Found User' }));
  }),
];

// mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);

// jest.setup.ts
import { server } from './mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

```typescript
// Uso en tests - Override handlers para casos especificos
import { rest } from 'msw';
import { server } from '../mocks/server';

describe('UserList', () => {
  it('should show error state when API fails', async () => {
    // Override handler para este test
    server.use(
      rest.get('/api/users', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ message: 'Server error' }));
      })
    );

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText(/error loading users/i)).toBeInTheDocument();
    });
  });
});
```

---

## 8. Test Data Management

### 8.1 Factories y Builders

```typescript
// factories/user.factory.ts
import { faker } from '@faker-js/faker';
import { User } from '../entities/user.entity';
import { CreateUserDto } from '../dto/create-user.dto';

export class UserFactory {
  static create(overrides: Partial<User> = {}): User {
    return {
      id: faker.string.uuid(),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      password: faker.internet.password({ length: 12 }),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
      isActive: true,
      role: 'USER',
      ...overrides,
    };
  }

  static createDto(overrides: Partial<CreateUserDto> = {}): CreateUserDto {
    return {
      email: faker.internet.email(),
      name: faker.person.fullName(),
      password: 'SecurePass123!',
      ...overrides,
    };
  }

  static createMany(count: number, overrides: Partial<User> = {}): User[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  static createAdmin(overrides: Partial<User> = {}): User {
    return this.create({ role: 'ADMIN', ...overrides });
  }
}
```

```typescript
// builders/order.builder.ts
import { Order, OrderItem, OrderStatus } from '../entities/order.entity';
import { faker } from '@faker-js/faker';

export class OrderBuilder {
  private order: Partial<Order> = {
    id: faker.string.uuid(),
    status: OrderStatus.PENDING,
    items: [],
    createdAt: new Date(),
  };

  withId(id: string): this {
    this.order.id = id;
    return this;
  }

  withStatus(status: OrderStatus): this {
    this.order.status = status;
    return this;
  }

  withItems(items: OrderItem[]): this {
    this.order.items = items;
    return this;
  }

  addItem(item: Partial<OrderItem>): this {
    const newItem: OrderItem = {
      id: faker.string.uuid(),
      productId: faker.string.uuid(),
      productName: faker.commerce.productName(),
      quantity: 1,
      unitPrice: parseFloat(faker.commerce.price()),
      ...item,
    };
    this.order.items = [...(this.order.items || []), newItem];
    return this;
  }

  withCustomer(customerId: string): this {
    this.order.customerId = customerId;
    return this;
  }

  completed(): this {
    this.order.status = OrderStatus.COMPLETED;
    this.order.completedAt = new Date();
    return this;
  }

  cancelled(): this {
    this.order.status = OrderStatus.CANCELLED;
    this.order.cancelledAt = new Date();
    return this;
  }

  build(): Order {
    const total = (this.order.items || []).reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0
    );
    return { ...this.order, total } as Order;
  }
}

// Uso
const order = new OrderBuilder()
  .withCustomer('customer-123')
  .addItem({ productName: 'Widget', quantity: 2, unitPrice: 29.99 })
  .addItem({ productName: 'Gadget', quantity: 1, unitPrice: 49.99 })
  .completed()
  .build();
```

### 8.2 Fixtures

```typescript
// fixtures/users.fixture.ts
export const userFixtures = {
  admin: {
    id: 'user-admin-001',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'ADMIN',
    isActive: true,
  },
  regularUser: {
    id: 'user-regular-001',
    email: 'user@example.com',
    name: 'Regular User',
    role: 'USER',
    isActive: true,
  },
  inactiveUser: {
    id: 'user-inactive-001',
    email: 'inactive@example.com',
    name: 'Inactive User',
    role: 'USER',
    isActive: false,
  },
  pendingUser: {
    id: 'user-pending-001',
    email: 'pending@example.com',
    name: 'Pending User',
    role: 'USER',
    isActive: true,
    emailVerified: false,
  },
} as const;

// fixtures/products.fixture.ts
export const productFixtures = {
  simpleProduct: {
    id: 'prod-001',
    name: 'Simple Product',
    price: 29.99,
    stock: 100,
    category: 'electronics',
  },
  outOfStock: {
    id: 'prod-002',
    name: 'Out of Stock Product',
    price: 49.99,
    stock: 0,
    category: 'electronics',
  },
  expensiveProduct: {
    id: 'prod-003',
    name: 'Premium Product',
    price: 999.99,
    stock: 10,
    category: 'premium',
  },
} as const;
```

### 8.3 Database Seeding para Tests

```typescript
// test/seeders/test-seeder.ts
import { DataSource } from 'typeorm';
import { userFixtures } from '../fixtures/users.fixture';
import { productFixtures } from '../fixtures/products.fixture';

export class TestSeeder {
  constructor(private dataSource: DataSource) {}

  async seedAll(): Promise<void> {
    await this.seedUsers();
    await this.seedProducts();
    await this.seedOrders();
  }

  async seedUsers(): Promise<void> {
    const userRepo = this.dataSource.getRepository('User');

    for (const user of Object.values(userFixtures)) {
      await userRepo.save({
        ...user,
        password: await hashPassword('TestPass123!'),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  async seedProducts(): Promise<void> {
    const productRepo = this.dataSource.getRepository('Product');

    for (const product of Object.values(productFixtures)) {
      await productRepo.save({
        ...product,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  async seedOrders(): Promise<void> {
    const orderRepo = this.dataSource.getRepository('Order');

    await orderRepo.save({
      id: 'order-001',
      customerId: userFixtures.regularUser.id,
      status: 'PENDING',
      items: [
        {
          productId: productFixtures.simpleProduct.id,
          quantity: 2,
          unitPrice: productFixtures.simpleProduct.price,
        },
      ],
      total: productFixtures.simpleProduct.price * 2,
      createdAt: new Date(),
    });
  }

  async clean(): Promise<void> {
    // Orden inverso de dependencias
    await this.dataSource.query('DELETE FROM order_items');
    await this.dataSource.query('DELETE FROM orders');
    await this.dataSource.query('DELETE FROM products');
    await this.dataSource.query('DELETE FROM users');
  }
}

// Uso en tests
describe('OrderService Integration', () => {
  let seeder: TestSeeder;

  beforeAll(async () => {
    seeder = new TestSeeder(testDataSource);
  });

  beforeEach(async () => {
    await seeder.clean();
    await seeder.seedAll();
  });

  it('should create order for existing user', async () => {
    const order = await orderService.create({
      customerId: userFixtures.regularUser.id,
      items: [{ productId: productFixtures.simpleProduct.id, quantity: 1 }],
    });

    expect(order.customerId).toBe(userFixtures.regularUser.id);
  });
});
```

---

## 9. Checklist de Testing

### 9.1 Antes de Crear un Test

```markdown
[ ] He identificado el tipo de test necesario (unit/integration/e2e)
[ ] He verificado que no existe un test similar
[ ] He preparado los datos de prueba necesarios
[ ] He identificado las dependencias a mockear
```

### 9.2 Durante la Escritura del Test

```markdown
[ ] El nombre del test sigue la convencion should_X_when_Y
[ ] El test sigue el patron AAA (Arrange-Act-Assert)
[ ] El test es independiente de otros tests
[ ] El test es determinista (mismo resultado siempre)
[ ] He mockeado correctamente las dependencias externas
[ ] He evitado mockear la logica bajo test
```

### 9.3 Despues de Escribir el Test

```markdown
[ ] El test pasa consistentemente
[ ] El test falla cuando la funcionalidad esta rota
[ ] La cobertura cumple con los umbrales minimos
[ ] He ejecutado la suite completa para verificar no hay regresiones
[ ] He documentado casos especiales o excepciones
```

### 9.4 Para Tests de Integracion/E2E

```markdown
[ ] He configurado el cleanup de base de datos
[ ] He verificado que los tests se pueden ejecutar en paralelo
[ ] He configurado timeouts apropiados
[ ] He manejado estados de espera (loading, async)
[ ] He verificado que funcionan en CI/CD
```

### 9.5 Revision de PR con Tests

```markdown
[ ] Los tests nuevos cubren el codigo nuevo
[ ] No hay tests comentados o saltados sin justificacion
[ ] Los mocks son apropiados y minimos
[ ] Los nombres de test son descriptivos
[ ] No hay hardcoded waits (usar waitFor, expect.poll)
[ ] Los tests son mantenibles y legibles
```

---

## 10. Architecture Tests

### 10.1 Proposito

Validar automaticamente que las reglas arquitectonicas del proyecto se mantienen conforme el codebase crece. Estos tests actuan como guardianes de la arquitectura, detectando violaciones de las convenciones establecidas antes de que lleguen a produccion.

En gamilit, con 22 modulos, 152 entities, 107 controllers y 170 services, es esencial automatizar la validacion de dependencias entre capas para prevenir acoplamiento indebido.

### 10.2 Herramientas

| Herramienta | Uso | Package |
|-------------|-----|---------|
| ts-arch | Enforcement de reglas arquitectonicas | `ts-arch` |
| madge | Deteccion de dependencias circulares | `madge` |
| eslint-plugin-boundaries | Enforcement de limites de importacion | `eslint-plugin-boundaries` |

### 10.3 Reglas Obligatorias para Gamilit

Las siguientes reglas arquitectonicas DEBEN validarse automaticamente:

```
REGLA 1: Controllers NO importan Repositories directamente
  Controllers → Services → Repositories (siempre via service)
  Razon: Separacion de responsabilidades

REGLA 2: Entities NO dependen de Controllers
  Entities son clases puras de datos, sin logica de presentacion
  Razon: Entities pertenecen a la capa de dominio

REGLA 3: Sin dependencias circulares entre los 22 modulos
  Modulo A → Modulo B → Modulo A = PROHIBIDO
  Razon: Acoplamiento inmanejable a escala

REGLA 4: Guards solo en auth/ o shared/
  Ningun modulo define sus propios guards fuera de estas ubicaciones
  Razon: Centralizacion de seguridad

REGLA 5: DTOs no contienen logica de negocio
  DTOs solo tienen decoradores de validacion (@IsString, @IsEmail, etc.)
  Razon: DTOs son contratos de transporte, no entidades de dominio
```

### 10.4 Ejemplo de Validacion con ts-arch

```typescript
// tests/architecture/architecture.spec.ts
import { filesOfProject } from 'ts-arch';

describe('Architecture Rules', () => {
  it('controllers should not import repositories directly', async () => {
    const rule = filesOfProject()
      .inFolder('controllers')
      .shouldNot()
      .dependOnFiles()
      .inFolder('repositories');

    await expect(rule).toPassAsync();
  });

  it('entities should not depend on controllers', async () => {
    const rule = filesOfProject()
      .inFolder('entities')
      .shouldNot()
      .dependOnFiles()
      .inFolder('controllers');

    await expect(rule).toPassAsync();
  });
});
```

### 10.5 Deteccion de Dependencias Circulares

```bash
# Verificar dependencias circulares en backend
cd apps/backend && npx madge --circular --extensions ts src/

# Verificar dependencias circulares en frontend
cd apps/frontend && npx madge --circular --extensions ts,tsx src/

# Generar grafico visual de dependencias
npx madge --image graph.svg --extensions ts src/modules/
```

### 10.6 Frecuencia de Ejecucion

| Validacion | Cuando | Donde |
|-----------|--------|-------|
| Dependencias circulares | En cada PR | CI/CD (GitHub Actions) |
| Reglas ts-arch | En cada PR | CI/CD (GitHub Actions) |
| Limites de importacion (ESLint) | En cada save | Pre-commit hook + CI |

Ver: [GUIA-ARCHITECTURE-TESTING](../50-guides/testing/GUIA-ARCHITECTURE-TESTING.md) para implementacion detallada.

---

## 11. Visual Regression Testing

### 11.1 Cuando Usar

Visual regression testing debe aplicarse en los siguientes escenarios:

- **Componentes UI criticos:** Dashboards de los 4 portales, paginas de ejercicios, sistema de gamificacion (XP, rangos maya, logros, tienda)
- **Despues de actualizar TailwindCSS o dependencias de UI:** Cualquier cambio en la configuracion de estilos puede causar regresiones visuales no intencionales
- **Cross-browser rendering verification:** Verificar que la apariencia es consistente en Chromium, Firefox y WebKit
- **Despues de refactors de componentes:** Garantizar que la apariencia se mantiene identica tras cambios internos

### 11.2 Herramienta: Playwright Screenshots

Playwright incluye soporte nativo para comparacion de screenshots mediante `toHaveScreenshot()`.

```typescript
// Ejemplo basico
test('dashboard estudiante deberia coincidir con baseline', async ({ page }) => {
  await page.goto('/student/dashboard');
  await page.waitForLoadState('networkidle');

  await expect(page).toHaveScreenshot('student-dashboard.png', {
    maxDiffPixelRatio: 0.002, // 0.2% de diferencia permitida
  });
});
```

### 11.3 Configuracion

| Parametro | Valor Recomendado | Descripcion |
|-----------|-------------------|-------------|
| `maxDiffPixelRatio` | 0.002 (0.2%) | Porcentaje maximo de pixeles diferentes |
| `threshold` | 0.2 | Sensibilidad de comparacion por pixel (0-1) |
| `animations` | `'disabled'` | Deshabilitar animaciones CSS para consistencia |
| `fullPage` | `false` | Capturar solo viewport visible por defecto |

### 11.4 Gestion de Baselines

- Los screenshots baseline se versionan en git dentro de `e2e/screenshots/`
- Actualizar baselines: `npx playwright test --update-snapshots`
- Cada navegador/proyecto genera su propio baseline (sufijo automatico)
- Revisar diferencias: `npx playwright show-report`

### 11.5 Componentes Prioritarios para Visual Regression en gamilit

| Componente | Portal | Justificacion |
|-----------|--------|---------------|
| Dashboard principal | Estudiante | Punto de entrada, XP, rango maya |
| Pagina de ejercicio | Estudiante | 30 mecanicas, interacciones criticas |
| Tienda ML Coins | Estudiante | Economia virtual, items visuales |
| Dashboard de aulas | Maestro | Vista principal del maestro |
| Reportes de progreso | Maestro | Graficas y tablas de datos |
| Gestion de contenido | Admin | Formularios complejos |
| Dashboard de hijo | Padres | Progreso academico visual |

Ver: [GUIA-E2E-PLAYWRIGHT](../50-guides/testing/GUIA-E2E-PLAYWRIGHT.md) seccion Visual Regression para implementacion completa.

---

## Referencias Cruzadas

### Estándares Relacionados
- [ESTANDAR-BACKEND-PROFESIONAL](ESTANDAR-BACKEND-PROFESIONAL.md) - Testing patterns para backend NestJS
- [ESTANDAR-FRONTEND-PROFESIONAL](ESTANDAR-FRONTEND-PROFESIONAL.md) - Testing patterns para React

### Guias de Implementacion
- [GUIA-E2E-PLAYWRIGHT](../50-guides/testing/GUIA-E2E-PLAYWRIGHT.md) - Testing E2E con Playwright para los 4 portales
- [GUIA-COVERAGE-TESTING](../50-guides/testing/GUIA-COVERAGE-TESTING.md) - Estrategia de cobertura y metricas actuales

### Principios Aplicados
- [PRINCIPIO-SOLID](../../orchestration/directivas/principios/PRINCIPIO-SOLID.md) - Diseño testeable (SRP, DIP)
- [PRINCIPIO-VALIDACION-OBLIGATORIA](../../orchestration/directivas/principios/PRINCIPIO-VALIDACION-OBLIGATORIA.md) - Principio de validacion obligatoria (build + lint + tests)

---

## Referencias

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [MSW - Mock Service Worker](https://mswjs.io/docs/)
- [Testing Trophy - Kent C. Dodds](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
