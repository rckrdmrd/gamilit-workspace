# Estandar Backend Profesional - Principios SOLID Aplicados a NestJS

> **Parte de:** [Estandar Backend Profesional](./_INDEX.md) | **Seccion 1 de 8**

---

## 1. Principios SOLID Aplicados a NestJS

> Referencia completa: `orchestration/directivas/principios/PRINCIPIO-SOLID.md`

### 1.1 Single Responsibility Principle (SRP)

**Regla:** Una clase debe tener una unica razon para cambiar.

```typescript
// CORRECTO: Cada clase tiene una responsabilidad
@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findById(id);
  }
}

@Injectable()
export class UserNotificationService {
  constructor(private readonly emailService: EmailService) {}

  async notifyUserCreated(user: User): Promise<void> {
    await this.emailService.send(user.email, 'Bienvenido');
  }
}

// INCORRECTO: Service con multiples responsabilidades
@Injectable()
export class UserService {
  async findById(id: string): Promise<User> { /* ... */ }
  async sendEmail(user: User): Promise<void> { /* ... */ }
  async generateReport(users: User[]): Promise<Report> { /* ... */ }
}
```

### 1.2 Open/Closed Principle (OCP)

**Regla:** Abierto para extension, cerrado para modificacion.

```typescript
// CORRECTO: Extensible mediante estrategias
interface PaymentStrategy {
  process(amount: number): Promise<PaymentResult>;
}

@Injectable()
export class CreditCardPayment implements PaymentStrategy {
  async process(amount: number): Promise<PaymentResult> {
    // Implementacion tarjeta de credito
    return { success: true, transactionId: 'cc-123' };
  }
}

@Injectable()
export class PayPalPayment implements PaymentStrategy {
  async process(amount: number): Promise<PaymentResult> {
    // Implementacion PayPal
    return { success: true, transactionId: 'pp-456' };
  }
}

@Injectable()
export class PaymentService {
  constructor(
    @Inject('PAYMENT_STRATEGIES')
    private readonly strategies: Map<string, PaymentStrategy>,
  ) {}

  async processPayment(method: string, amount: number): Promise<PaymentResult> {
    const strategy = this.strategies.get(method);
    if (!strategy) {
      throw new UnsupportedPaymentMethodError(method);
    }
    return strategy.process(amount);
  }
}
```

### 1.3 Liskov Substitution Principle (LSP)

**Regla:** Las clases derivadas deben ser sustituibles por sus clases base.

```typescript
// CORRECTO: Subtipos compatibles
abstract class BaseRepository<T> {
  abstract findById(id: string): Promise<T | null>;
  abstract save(entity: T): Promise<T>;
}

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {
    super();
  }

  async findById(id: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async save(user: User): Promise<User> {
    const entity = this.toEntity(user);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }
}
```

### 1.4 Interface Segregation Principle (ISP)

**Regla:** Los clientes no deben depender de interfaces que no usan.

```typescript
// CORRECTO: Interfaces segregadas
interface Readable<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
}

interface Writable<T> {
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}

interface Repository<T> extends Readable<T>, Writable<T> {}

// Service que solo necesita lectura
@Injectable()
export class ReportService {
  constructor(
    @Inject('USER_READER')
    private readonly userReader: Readable<User>,
  ) {}

  async generateReport(): Promise<Report> {
    const users = await this.userReader.findAll();
    // Generar reporte...
  }
}

// INCORRECTO: Interface monolitica
interface CrudRepository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
  bulkInsert(entities: T[]): Promise<T[]>;
  executeRawQuery(sql: string): Promise<any>;
  // Muchos metodos que no todos los clientes necesitan
}
```

### 1.5 Dependency Inversion Principle (DIP)

**Regla:** Depender de abstracciones, no de implementaciones concretas.

```typescript
// CORRECTO: Dependencia mediante interfaces
// domain/interfaces/user-repository.interface.ts
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  save(user: User): Promise<User>;
}

// application/services/user.service.ts
@Injectable()
export class UserService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async getUser(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new UserNotFoundError(id);
    return user;
  }
}

// infrastructure/repositories/typeorm-user.repository.ts
@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    // Implementacion con TypeORM
  }

  async save(user: User): Promise<User> {
    // Implementacion con TypeORM
  }
}

// users.module.ts
@Module({
  providers: [
    UserService,
    {
      provide: 'IUserRepository',
      useClass: TypeOrmUserRepository,
    },
  ],
})
export class UsersModule {}
```

### Checklist SOLID

- [ ] Cada clase tiene una unica responsabilidad (SRP)
- [ ] Nuevas funcionalidades se agregan por extension, no modificacion (OCP)
- [ ] Las clases derivadas son sustituibles por sus bases (LSP)
- [ ] Interfaces pequenas y especificas (ISP)
- [ ] Dependencias inyectadas mediante abstracciones (DIP)
