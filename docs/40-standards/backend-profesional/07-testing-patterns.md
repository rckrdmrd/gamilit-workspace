# Estandar Backend Profesional - Testing Patterns

> **Parte de:** [Estandar Backend Profesional](./_INDEX.md) | **Seccion 7 de 8**

---

## 7. Testing Patterns

### 7.1 Unit Tests para Services

```typescript
// application/use-cases/__tests__/create-user.use-case.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from '../create-user.use-case';
import { IUserRepository } from '../../../domain/interfaces/user-repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { EmailAlreadyExistsError } from '../../../domain/errors/user.errors';
import { EventEmitter2 } from '@nestjs/event-emitter';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  // Mock factory para repository
  const createMockRepository = (): jest.Mocked<IUserRepository> => ({
    findById: jest.fn(),
    findByEmail: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    exists: jest.fn(),
    findAll: jest.fn(),
  });

  beforeEach(async () => {
    userRepository = createMockRepository();
    eventEmitter = {
      emit: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        {
          provide: 'IUserRepository',
          useValue: userRepository,
        },
        {
          provide: EventEmitter2,
          useValue: eventEmitter,
        },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validDto = {
      email: 'test@example.com',
      name: 'Test User',
    };

    it('debe crear un usuario exitosamente', async () => {
      // Arrange
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.save.mockResolvedValue();

      // Act
      const result = await useCase.execute(validDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.email).toBe(validDto.email.toLowerCase());
      expect(result.name).toBe(validDto.name);
      expect(result.status).toBe('PENDING');
      expect(userRepository.findByEmail).toHaveBeenCalledWith(validDto.email);
      expect(userRepository.save).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        'user.created',
        expect.any(Object),
      );
    });

    it('debe lanzar error si el email ya existe', async () => {
      // Arrange
      const existingUser = User.reconstitute({
        id: 'existing-id',
        email: validDto.email,
        name: 'Existing User',
        status: 'ACTIVE',
        createdAt: new Date(),
      });
      userRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(useCase.execute(validDto)).rejects.toThrow(
        EmailAlreadyExistsError,
      );
      expect(userRepository.save).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('debe normalizar el email a minusculas', async () => {
      // Arrange
      const dtoWithUppercaseEmail = {
        ...validDto,
        email: 'TEST@EXAMPLE.COM',
      };
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.save.mockResolvedValue();

      // Act
      const result = await useCase.execute(dtoWithUppercaseEmail);

      // Assert
      expect(result.email).toBe('test@example.com');
    });
  });
});

// domain/entities/__tests__/order.entity.spec.ts
describe('Order Entity', () => {
  describe('create', () => {
    const validProps = {
      customerId: 'customer-123',
      items: [
        {
          productId: 'product-1',
          productName: 'Product 1',
          unitPrice: 100,
          quantity: 2,
        },
      ],
      shippingAddress: {
        street: 'Calle Principal 123',
        city: 'Ciudad',
        state: 'Estado',
        zipCode: '12345',
        country: 'Mexico',
      },
    };

    it('debe crear una orden con estado PENDING', () => {
      const order = Order.create(validProps);

      expect(order.status).toBe(OrderStatus.PENDING);
      expect(order.customerId).toBe(validProps.customerId);
      expect(order.items).toHaveLength(1);
    });

    it('debe lanzar error si no hay items', () => {
      expect(() =>
        Order.create({ ...validProps, items: [] }),
      ).toThrow(EmptyOrderError);
    });
  });

  describe('addItem', () => {
    it('debe agregar item a orden pendiente', () => {
      const order = Order.create(validProps);
      const newItem = {
        productId: 'product-2',
        productName: 'Product 2',
        unitPrice: 50,
        quantity: 1,
      };

      order.addItem(newItem);

      expect(order.items).toHaveLength(2);
    });

    it('debe incrementar cantidad si item ya existe', () => {
      const order = Order.create(validProps);
      order.addItem({
        productId: 'product-1',
        productName: 'Product 1',
        unitPrice: 100,
        quantity: 3,
      });

      expect(order.items).toHaveLength(1);
      expect(order.items[0].quantity).toBe(5); // 2 + 3
    });

    it('debe lanzar error si orden no esta pendiente', () => {
      const order = Order.create(validProps);
      order.confirm();

      expect(() => order.addItem({
        productId: 'product-2',
        productName: 'Product 2',
        unitPrice: 50,
        quantity: 1,
      })).toThrow(OrderNotModifiableError);
    });
  });

  describe('state transitions', () => {
    it('PENDING -> CONFIRMED', () => {
      const order = Order.create(validProps);
      order.confirm();
      expect(order.status).toBe(OrderStatus.CONFIRMED);
    });

    it('CONFIRMED -> SHIPPED', () => {
      const order = Order.create(validProps);
      order.confirm();
      order.ship();
      expect(order.status).toBe(OrderStatus.SHIPPED);
    });

    it('no debe permitir PENDING -> SHIPPED', () => {
      const order = Order.create(validProps);
      expect(() => order.ship()).toThrow(InvalidOrderTransitionError);
    });
  });
});
```

### 7.2 Integration Tests para Controllers

```typescript
// infrastructure/controllers/__tests__/user.controller.integration.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { DataSource } from 'typeorm';
import { UserOrmEntity } from '../../entities/user.orm-entity';

describe('UserController (Integration)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Limpiar base de datos antes de cada test
    await dataSource.getRepository(UserOrmEntity).clear();
  });

  describe('POST /users', () => {
    const validUserDto = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'Password123!',
      role: 'USER',
      address: {
        street: 'Calle Principal 123',
        city: 'Ciudad de Mexico',
        state: 'CDMX',
        zipCode: '01234',
      },
    };

    it('debe crear un usuario y retornar 201', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(validUserDto)
        .expect(201);

      expect(response.body).toMatchObject({
        email: validUserDto.email.toLowerCase(),
        name: validUserDto.name,
        status: 'PENDING',
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.password).toBeUndefined(); // No exponer password
    });

    it('debe retornar 400 si el email es invalido', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({ ...validUserDto, email: 'invalid-email' })
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.errors).toContainEqual(
        expect.objectContaining({ field: 'email' }),
      );
    });

    it('debe retornar 409 si el email ya existe', async () => {
      // Crear primer usuario
      await request(app.getHttpServer())
        .post('/users')
        .send(validUserDto)
        .expect(201);

      // Intentar crear segundo usuario con mismo email
      const response = await request(app.getHttpServer())
        .post('/users')
        .send(validUserDto)
        .expect(409);

      expect(response.body.code).toBe('EMAIL_ALREADY_EXISTS');
    });

    it('debe rechazar propiedades no permitidas', async () => {
      const response = await request(app.getHttpServer())
        .post('/users')
        .send({ ...validUserDto, isAdmin: true })
        .expect(400);

      expect(response.body.message).toContain('isAdmin');
    });
  });

  describe('GET /users/:id', () => {
    it('debe retornar un usuario existente', async () => {
      // Crear usuario
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'test@example.com',
          name: 'Test User',
          password: 'Password123!',
          role: 'USER',
          address: {
            street: 'Calle Principal 123',
            city: 'Ciudad de Mexico',
            state: 'CDMX',
            zipCode: '01234',
          },
        })
        .expect(201);

      const userId = createResponse.body.id;

      // Obtener usuario
      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(200);

      expect(response.body.id).toBe(userId);
      expect(response.body.email).toBe('test@example.com');
    });

    it('debe retornar 404 si el usuario no existe', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/non-existent-id')
        .expect(404);

      expect(response.body.code).toBe('USER_NOT_FOUND');
    });

    it('debe retornar 400 si el ID no es UUID valido', async () => {
      await request(app.getHttpServer())
        .get('/users/invalid-uuid')
        .expect(400);
    });
  });

  describe('PATCH /users/:id', () => {
    it('debe actualizar un usuario existente', async () => {
      // Crear usuario
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'test@example.com',
          name: 'Test User',
          password: 'Password123!',
          role: 'USER',
          address: {
            street: 'Calle Principal 123',
            city: 'Ciudad de Mexico',
            state: 'CDMX',
            zipCode: '01234',
          },
        })
        .expect(201);

      const userId = createResponse.body.id;

      // Actualizar usuario
      const response = await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .send({ name: 'Updated Name' })
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
      expect(response.body.email).toBe('test@example.com'); // No cambio
    });
  });

  describe('DELETE /users/:id', () => {
    it('debe eliminar un usuario existente', async () => {
      // Crear usuario
      const createResponse = await request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'test@example.com',
          name: 'Test User',
          password: 'Password123!',
          role: 'USER',
          address: {
            street: 'Calle Principal 123',
            city: 'Ciudad de Mexico',
            state: 'CDMX',
            zipCode: '01234',
          },
        })
        .expect(201);

      const userId = createResponse.body.id;

      // Eliminar usuario
      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .expect(204);

      // Verificar que no existe
      await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(404);
    });
  });
});
```

### 7.3 Mocking de Repositories

```typescript
// test/mocks/user-repository.mock.ts
export const createMockUserRepository = (): jest.Mocked<IUserRepository> => {
  const users = new Map<string, User>();

  return {
    findById: jest.fn().mockImplementation((id: string) =>
      Promise.resolve(users.get(id) || null),
    ),

    findByEmail: jest.fn().mockImplementation((email: string) => {
      const user = Array.from(users.values()).find(u => u.email === email);
      return Promise.resolve(user || null);
    }),

    findAll: jest.fn().mockImplementation(() =>
      Promise.resolve(Array.from(users.values())),
    ),

    save: jest.fn().mockImplementation((user: User) => {
      users.set(user.id, user);
      return Promise.resolve();
    }),

    delete: jest.fn().mockImplementation((id: string) => {
      users.delete(id);
      return Promise.resolve();
    }),

    exists: jest.fn().mockImplementation((id: string) =>
      Promise.resolve(users.has(id)),
    ),

    // Helper para tests
    _clear: () => users.clear(),
    _seed: (seedUsers: User[]) => {
      seedUsers.forEach(u => users.set(u.id, u));
    },
  };
};

// Uso en tests
describe('UserService', () => {
  let service: UserService;
  let mockRepository: ReturnType<typeof createMockUserRepository>;

  beforeEach(() => {
    mockRepository = createMockUserRepository();

    // Sembrar datos de prueba
    mockRepository._seed([
      User.reconstitute({
        id: 'user-1',
        email: 'existing@example.com',
        name: 'Existing User',
        status: 'ACTIVE',
        createdAt: new Date(),
      }),
    ]);
  });

  afterEach(() => {
    mockRepository._clear();
  });

  // ... tests
});
```

### 7.4 Test Data Builders

```typescript
// test/builders/user.builder.ts
export class UserBuilder {
  private props: UserProps = {
    id: 'user-' + Math.random().toString(36).substr(2, 9),
    email: 'default@example.com',
    name: 'Default User',
    status: UserStatus.ACTIVE,
    createdAt: new Date(),
  };

  withId(id: string): this {
    this.props.id = id;
    return this;
  }

  withEmail(email: string): this {
    this.props.email = email;
    return this;
  }

  withName(name: string): this {
    this.props.name = name;
    return this;
  }

  withStatus(status: UserStatus): this {
    this.props.status = status;
    return this;
  }

  pending(): this {
    this.props.status = UserStatus.PENDING;
    return this;
  }

  active(): this {
    this.props.status = UserStatus.ACTIVE;
    return this;
  }

  inactive(): this {
    this.props.status = UserStatus.INACTIVE;
    return this;
  }

  build(): User {
    return User.reconstitute(this.props);
  }

  buildDto(): CreateUserDto {
    return {
      email: this.props.email,
      name: this.props.name,
      password: 'Password123!',
      role: UserRole.USER,
      address: {
        street: 'Calle Principal 123',
        city: 'Ciudad',
        state: 'Estado',
        zipCode: '12345',
      },
    };
  }
}

// Uso
const user = new UserBuilder()
  .withEmail('test@example.com')
  .withName('Test User')
  .active()
  .build();

const pendingUser = new UserBuilder()
  .pending()
  .build();
```

### Checklist Testing

- [ ] Unit tests para cada use case
- [ ] Unit tests para entidades de dominio (invariantes)
- [ ] Integration tests para endpoints
- [ ] Mocks tipados para repositories
- [ ] Test data builders para datos de prueba
- [ ] Cobertura minima de 80% en logica de negocio
- [ ] Tests aislados (cada test limpia su estado)
