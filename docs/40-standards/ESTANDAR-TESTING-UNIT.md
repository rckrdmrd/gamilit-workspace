---
titulo: Estandar de Testing — Unit Tests
tipo: estandar-proyecto
version: 3.0.0
fecha_creacion: 2026-02-02
ultima_actualizacion: 2026-02-27
autor: Equipo de Arquitectura
categoria: estandares
tags:
  - testing
  - unit-tests
  - jest
  - naming
  - mocking
  - test-data
aplica_a:
  - backend
  - frontend
  - fullstack
estado: vigente
---

# Estandar de Testing — Unit Tests

> Archivo especializado extraido de `ESTANDAR-TESTING.md`. Ver [ESTANDAR-TESTING.md](ESTANDAR-TESTING.md) para el indice completo y secciones de Cobertura y Checklists.

> **Cross-reference:** For practical implementation guidance and coverage targets, see [GUIA-COVERAGE-TESTING.md](../50-guides/testing/GUIA-COVERAGE-TESTING.md).

## Referencias Cruzadas

| Archivo | Contenido |
|---------|-----------|
| [ESTANDAR-TESTING.md](ESTANDAR-TESTING.md) | Indice, Cobertura Minima (Sec. 5), Checklists (Sec. 9), Referencias |
| [ESTANDAR-TESTING-INTEGRATION.md](ESTANDAR-TESTING-INTEGRATION.md) | Integration Tests (backend, frontend, DB) |
| [ESTANDAR-TESTING-E2E.md](ESTANDAR-TESTING-E2E.md) | E2E Tests + Visual Regression |
| [ESTANDAR-TESTING-ARCHITECTURE.md](ESTANDAR-TESTING-ARCHITECTURE.md) | Architecture Tests (ts-arch, circular deps) |

---

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
