---
tipo: estandar-workspace
scope: workspace
version: 1.0.0
herencia: |
  Este estandar aplica a nivel WORKSPACE.
  Los proyectos pueden EXTENDER (no contradecir) con estandares locales.
  Ejemplo: workspace-projects/projects/{proyecto}/docs/BACKEND-STANDARDS.md para APIs especificas.
actualizado: 2026-02-02
tags:
  - backend
  - nestjs
  - solid
  - clean-architecture
  - ddd
  - typescript
---

# Estandar Backend Profesional

> Patrones arquitectonicos, principios de diseno y mejores practicas para desarrollo backend con NestJS

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

---

## 2. Clean Architecture en NestJS

### 2.1 Capas de la Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     INFRASTRUCTURE                          │
│  (Controllers, Repositories impl, External services)        │
├─────────────────────────────────────────────────────────────┤
│                      APPLICATION                            │
│  (Use Cases, DTOs, Application Services)                    │
├─────────────────────────────────────────────────────────────┤
│                        DOMAIN                               │
│  (Entities, Value Objects, Domain Services, Interfaces)     │
└─────────────────────────────────────────────────────────────┘

        ↑ Las dependencias SIEMPRE apuntan hacia adentro ↑
```

### 2.2 Regla de Dependencias

| Capa | Puede Depender De | NO Puede Depender De |
|------|-------------------|----------------------|
| Domain | Nada (es el nucleo) | Application, Infrastructure |
| Application | Domain | Infrastructure |
| Infrastructure | Application, Domain | - |

### 2.3 Estructura de Carpetas Recomendada

```
src/modules/{module}/
├── domain/
│   ├── entities/
│   │   └── user.entity.ts           # Entidad de dominio (NO TypeORM)
│   ├── value-objects/
│   │   ├── email.vo.ts              # Value Object Email
│   │   └── user-id.vo.ts            # Value Object UserId
│   ├── interfaces/
│   │   └── user-repository.interface.ts
│   ├── events/
│   │   └── user-created.event.ts    # Eventos de dominio
│   └── services/
│       └── user-domain.service.ts   # Logica de dominio compleja
├── application/
│   ├── use-cases/
│   │   ├── create-user.use-case.ts
│   │   ├── get-user.use-case.ts
│   │   └── update-user.use-case.ts
│   ├── dto/
│   │   ├── create-user.dto.ts
│   │   ├── update-user.dto.ts
│   │   └── user-response.dto.ts
│   ├── mappers/
│   │   └── user.mapper.ts           # Domain <-> DTO
│   └── ports/
│       └── user.port.ts             # Puertos de entrada
└── infrastructure/
    ├── controllers/
    │   └── user.controller.ts
    ├── repositories/
    │   └── typeorm-user.repository.ts
    ├── entities/
    │   └── user.orm-entity.ts       # Entity TypeORM (persistencia)
    ├── mappers/
    │   └── user-persistence.mapper.ts # Domain <-> ORM Entity
    └── services/
        └── email-notification.service.ts
```

### 2.4 Ejemplo de Implementacion por Capas

#### Domain Layer

```typescript
// domain/entities/user.entity.ts
export class User {
  private constructor(
    private readonly _id: UserId,
    private _email: Email,
    private _name: string,
    private _status: UserStatus,
    private readonly _createdAt: Date,
  ) {}

  static create(props: CreateUserProps): User {
    return new User(
      UserId.generate(),
      Email.create(props.email),
      props.name,
      UserStatus.PENDING,
      new Date(),
    );
  }

  static reconstitute(props: UserProps): User {
    return new User(
      UserId.fromString(props.id),
      Email.create(props.email),
      props.name,
      props.status,
      props.createdAt,
    );
  }

  activate(): void {
    if (this._status !== UserStatus.PENDING) {
      throw new InvalidUserStateError('Solo usuarios pendientes pueden activarse');
    }
    this._status = UserStatus.ACTIVE;
  }

  get id(): string { return this._id.value; }
  get email(): string { return this._email.value; }
  get name(): string { return this._name; }
  get status(): UserStatus { return this._status; }
  get createdAt(): Date { return this._createdAt; }
}

// domain/value-objects/email.vo.ts
export class Email {
  private constructor(private readonly _value: string) {}

  static create(value: string): Email {
    if (!this.isValid(value)) {
      throw new InvalidEmailError(value);
    }
    return new Email(value.toLowerCase().trim());
  }

  private static isValid(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  }

  get value(): string { return this._value; }

  equals(other: Email): boolean {
    return this._value === other._value;
  }
}

// domain/interfaces/user-repository.interface.ts
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}
```

#### Application Layer

```typescript
// application/use-cases/create-user.use-case.ts
@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: CreateUserDto): Promise<UserResponseDto> {
    // Verificar si el email ya existe
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new EmailAlreadyExistsError(dto.email);
    }

    // Crear entidad de dominio
    const user = User.create({
      email: dto.email,
      name: dto.name,
    });

    // Persistir
    await this.userRepository.save(user);

    // Emitir evento de dominio
    this.eventEmitter.emit('user.created', new UserCreatedEvent(user.id, user.email));

    // Retornar DTO de respuesta
    return UserMapper.toResponse(user);
  }
}

// application/dto/create-user.dto.ts
export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;
}

// application/mappers/user.mapper.ts
export class UserMapper {
  static toResponse(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
```

#### Infrastructure Layer

```typescript
// infrastructure/controllers/user.controller.ts
@Controller('users')
@ApiTags('Users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  @ApiResponse({ status: 201, type: UserResponseDto })
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.createUserUseCase.execute(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiResponse({ status: 200, type: UserResponseDto })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
    return this.getUserUseCase.execute(id);
  }
}

// infrastructure/repositories/typeorm-user.repository.ts
@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? UserPersistenceMapper.toDomain(entity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { email } });
    return entity ? UserPersistenceMapper.toDomain(entity) : null;
  }

  async save(user: User): Promise<void> {
    const entity = UserPersistenceMapper.toOrmEntity(user);
    await this.repository.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}

// infrastructure/entities/user.orm-entity.ts
@Entity('users')
export class UserOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: UserStatus })
  status: UserStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

### Checklist Clean Architecture

- [ ] Domain layer no tiene dependencias externas
- [ ] Application layer solo depende de Domain
- [ ] Infrastructure implementa interfaces de Domain
- [ ] Entities de dominio separadas de ORM entities
- [ ] Use cases encapsulan logica de aplicacion
- [ ] Controllers solo delegan a use cases

---

## 3. Repository Pattern

### 3.1 Interfaz del Repository (Port)

```typescript
// domain/interfaces/repository.interface.ts

// Interfaz base generica
export interface IRepository<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<void>;
  delete(id: ID): Promise<void>;
  exists(id: ID): Promise<boolean>;
}

// Interfaz especifica con metodos de dominio
export interface IOrderRepository extends IRepository<Order> {
  findByCustomerId(customerId: string): Promise<Order[]>;
  findByStatus(status: OrderStatus): Promise<Order[]>;
  findPendingOrdersOlderThan(date: Date): Promise<Order[]>;
  countByStatusAndPeriod(status: OrderStatus, from: Date, to: Date): Promise<number>;
}
```

### 3.2 Implementacion con TypeORM (Adapter)

```typescript
// infrastructure/repositories/typeorm-order.repository.ts
@Injectable()
export class TypeOrmOrderRepository implements IOrderRepository {
  constructor(
    @InjectRepository(OrderOrmEntity)
    private readonly repository: Repository<OrderOrmEntity>,
    private readonly mapper: OrderPersistenceMapper,
  ) {}

  async findById(id: string): Promise<Order | null> {
    const entity = await this.repository.findOne({
      where: { id },
      relations: ['items', 'customer'],
    });
    return entity ? this.mapper.toDomain(entity) : null;
  }

  async findAll(): Promise<Order[]> {
    const entities = await this.repository.find({
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
    return entities.map(e => this.mapper.toDomain(e));
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    const entities = await this.repository.find({
      where: { customerId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
    return entities.map(e => this.mapper.toDomain(e));
  }

  async findByStatus(status: OrderStatus): Promise<Order[]> {
    const entities = await this.repository.find({
      where: { status },
      relations: ['items'],
    });
    return entities.map(e => this.mapper.toDomain(e));
  }

  async findPendingOrdersOlderThan(date: Date): Promise<Order[]> {
    const entities = await this.repository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .where('order.status = :status', { status: OrderStatus.PENDING })
      .andWhere('order.createdAt < :date', { date })
      .getMany();
    return entities.map(e => this.mapper.toDomain(e));
  }

  async countByStatusAndPeriod(
    status: OrderStatus,
    from: Date,
    to: Date,
  ): Promise<number> {
    return this.repository.count({
      where: {
        status,
        createdAt: Between(from, to),
      },
    });
  }

  async save(order: Order): Promise<void> {
    const entity = this.mapper.toOrmEntity(order);
    await this.repository.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }
}
```

### 3.3 Inyeccion de Dependencias

```typescript
// orders.module.ts
@Module({
  imports: [TypeOrmModule.forFeature([OrderOrmEntity, OrderItemOrmEntity])],
  controllers: [OrderController],
  providers: [
    // Use Cases
    CreateOrderUseCase,
    GetOrderUseCase,
    CancelOrderUseCase,

    // Repository con token
    {
      provide: 'IOrderRepository',
      useClass: TypeOrmOrderRepository,
    },

    // Mapper
    OrderPersistenceMapper,
  ],
  exports: ['IOrderRepository'],
})
export class OrdersModule {}

// Uso en Use Case
@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject('IOrderRepository')
    private readonly orderRepository: IOrderRepository,
  ) {}

  async execute(dto: CreateOrderDto): Promise<OrderResponseDto> {
    const order = Order.create({
      customerId: dto.customerId,
      items: dto.items.map(item => OrderItem.create(item)),
    });

    await this.orderRepository.save(order);

    return OrderMapper.toResponse(order);
  }
}
```

### Checklist Repository Pattern

- [ ] Interfaces definidas en Domain layer
- [ ] Implementaciones en Infrastructure layer
- [ ] Inyeccion mediante tokens de interfaz
- [ ] Mappers separados para Domain <-> ORM
- [ ] Queries complejas encapsuladas en metodos de repository

---

## 4. Domain-Driven Design (DDD) Basico

### 4.1 Entities vs Value Objects

| Caracteristica | Entity | Value Object |
|----------------|--------|--------------|
| Identidad | Tiene ID unico | Sin identidad propia |
| Igualdad | Por ID | Por valores |
| Mutabilidad | Puede cambiar estado | Inmutable |
| Ciclo de vida | Independiente | Pertenece a Entity |
| Ejemplo | User, Order, Product | Email, Money, Address |

```typescript
// Entity: Tiene identidad unica
export class Product {
  private constructor(
    private readonly _id: ProductId,
    private _name: string,
    private _price: Money,
    private _stock: number,
  ) {}

  // Dos productos son iguales si tienen el mismo ID
  equals(other: Product): boolean {
    return this._id.equals(other._id);
  }

  // Puede cambiar su estado
  updatePrice(newPrice: Money): void {
    if (newPrice.amount <= 0) {
      throw new InvalidPriceError('El precio debe ser mayor a 0');
    }
    this._price = newPrice;
  }

  decreaseStock(quantity: number): void {
    if (quantity > this._stock) {
      throw new InsufficientStockError(this._id.value, quantity, this._stock);
    }
    this._stock -= quantity;
  }
}

// Value Object: Inmutable, igualdad por valores
export class Money {
  private constructor(
    private readonly _amount: number,
    private readonly _currency: Currency,
  ) {}

  static create(amount: number, currency: Currency): Money {
    if (amount < 0) {
      throw new InvalidAmountError('El monto no puede ser negativo');
    }
    return new Money(amount, currency);
  }

  // Dos Money son iguales si tienen mismos valores
  equals(other: Money): boolean {
    return this._amount === other._amount && this._currency === other._currency;
  }

  // Operaciones retornan nuevos objetos (inmutabilidad)
  add(other: Money): Money {
    if (!this._currency.equals(other._currency)) {
      throw new CurrencyMismatchError();
    }
    return new Money(this._amount + other._amount, this._currency);
  }

  multiply(factor: number): Money {
    return new Money(this._amount * factor, this._currency);
  }

  get amount(): number { return this._amount; }
  get currency(): Currency { return this._currency; }
}

// Value Object compuesto
export class Address {
  private constructor(
    private readonly _street: string,
    private readonly _city: string,
    private readonly _state: string,
    private readonly _zipCode: string,
    private readonly _country: string,
  ) {}

  static create(props: AddressProps): Address {
    this.validate(props);
    return new Address(
      props.street,
      props.city,
      props.state,
      props.zipCode,
      props.country,
    );
  }

  private static validate(props: AddressProps): void {
    if (!props.street || props.street.length < 5) {
      throw new InvalidAddressError('Calle invalida');
    }
    if (!props.zipCode || !/^\d{5}$/.test(props.zipCode)) {
      throw new InvalidAddressError('Codigo postal invalido');
    }
    // ... mas validaciones
  }

  equals(other: Address): boolean {
    return (
      this._street === other._street &&
      this._city === other._city &&
      this._state === other._state &&
      this._zipCode === other._zipCode &&
      this._country === other._country
    );
  }

  format(): string {
    return `${this._street}, ${this._city}, ${this._state} ${this._zipCode}, ${this._country}`;
  }
}
```

### 4.2 Aggregates

**Regla:** Un Aggregate es un cluster de objetos de dominio tratados como una unidad.

```typescript
// Order es el Aggregate Root
export class Order {
  private constructor(
    private readonly _id: OrderId,
    private readonly _customerId: CustomerId,
    private _items: OrderItem[],
    private _status: OrderStatus,
    private _shippingAddress: Address,
    private readonly _createdAt: Date,
  ) {}

  static create(props: CreateOrderProps): Order {
    if (props.items.length === 0) {
      throw new EmptyOrderError();
    }

    const order = new Order(
      OrderId.generate(),
      CustomerId.fromString(props.customerId),
      [],
      OrderStatus.PENDING,
      Address.create(props.shippingAddress),
      new Date(),
    );

    // Items se agregan a traves del aggregate root
    props.items.forEach(item => order.addItem(item));

    return order;
  }

  // Todas las modificaciones pasan por el Aggregate Root
  addItem(props: AddItemProps): void {
    if (this._status !== OrderStatus.PENDING) {
      throw new OrderNotModifiableError(this._id.value);
    }

    const existingItem = this._items.find(i => i.productId === props.productId);
    if (existingItem) {
      existingItem.increaseQuantity(props.quantity);
    } else {
      this._items.push(OrderItem.create(props));
    }
  }

  removeItem(productId: string): void {
    if (this._status !== OrderStatus.PENDING) {
      throw new OrderNotModifiableError(this._id.value);
    }

    const index = this._items.findIndex(i => i.productId === productId);
    if (index === -1) {
      throw new ItemNotFoundError(productId);
    }

    this._items.splice(index, 1);

    if (this._items.length === 0) {
      throw new EmptyOrderError();
    }
  }

  confirm(): void {
    if (this._status !== OrderStatus.PENDING) {
      throw new InvalidOrderTransitionError(this._status, OrderStatus.CONFIRMED);
    }
    this._status = OrderStatus.CONFIRMED;
  }

  ship(): void {
    if (this._status !== OrderStatus.CONFIRMED) {
      throw new InvalidOrderTransitionError(this._status, OrderStatus.SHIPPED);
    }
    this._status = OrderStatus.SHIPPED;
  }

  cancel(): void {
    if (this._status === OrderStatus.SHIPPED || this._status === OrderStatus.DELIVERED) {
      throw new OrderCannotBeCancelledError(this._id.value, this._status);
    }
    this._status = OrderStatus.CANCELLED;
  }

  // Calculos delegados dentro del aggregate
  calculateTotal(): Money {
    return this._items.reduce(
      (total, item) => total.add(item.calculateSubtotal()),
      Money.create(0, Currency.USD),
    );
  }

  get id(): string { return this._id.value; }
  get customerId(): string { return this._customerId.value; }
  get items(): readonly OrderItem[] { return [...this._items]; }
  get status(): OrderStatus { return this._status; }
  get shippingAddress(): Address { return this._shippingAddress; }
  get createdAt(): Date { return this._createdAt; }
}

// OrderItem pertenece al aggregate Order
export class OrderItem {
  private constructor(
    private readonly _productId: string,
    private readonly _productName: string,
    private readonly _unitPrice: Money,
    private _quantity: number,
  ) {}

  static create(props: CreateOrderItemProps): OrderItem {
    if (props.quantity <= 0) {
      throw new InvalidQuantityError();
    }
    return new OrderItem(
      props.productId,
      props.productName,
      Money.create(props.unitPrice, Currency.USD),
      props.quantity,
    );
  }

  increaseQuantity(amount: number): void {
    if (amount <= 0) {
      throw new InvalidQuantityError();
    }
    this._quantity += amount;
  }

  calculateSubtotal(): Money {
    return this._unitPrice.multiply(this._quantity);
  }

  get productId(): string { return this._productId; }
  get productName(): string { return this._productName; }
  get unitPrice(): Money { return this._unitPrice; }
  get quantity(): number { return this._quantity; }
}
```

### 4.3 Domain Services

**Regla:** Logica de dominio que no pertenece naturalmente a ninguna entidad.

```typescript
// Domain Service para transferencia entre cuentas
@Injectable()
export class MoneyTransferService {
  async transfer(
    fromAccount: Account,
    toAccount: Account,
    amount: Money,
  ): Promise<TransferResult> {
    // Validacion de negocio
    if (fromAccount.currency !== toAccount.currency) {
      throw new CurrencyMismatchError();
    }

    if (!fromAccount.canWithdraw(amount)) {
      throw new InsufficientFundsError(fromAccount.id, amount);
    }

    // Operacion atomica entre dos entidades
    fromAccount.withdraw(amount);
    toAccount.deposit(amount);

    return {
      success: true,
      fromBalance: fromAccount.balance,
      toBalance: toAccount.balance,
      transferredAmount: amount,
    };
  }
}

// Domain Service para calculo de precios
@Injectable()
export class PricingService {
  calculateOrderPrice(
    order: Order,
    customer: Customer,
    promotions: Promotion[],
  ): PriceCalculation {
    const subtotal = order.calculateTotal();

    // Aplicar descuento por nivel de cliente
    const customerDiscount = this.calculateCustomerDiscount(customer, subtotal);

    // Aplicar promociones
    const promotionDiscount = this.calculatePromotionDiscount(promotions, subtotal);

    // Calcular impuestos
    const taxableAmount = subtotal.subtract(customerDiscount).subtract(promotionDiscount);
    const tax = this.calculateTax(taxableAmount, order.shippingAddress);

    // Total final
    const total = taxableAmount.add(tax);

    return {
      subtotal,
      customerDiscount,
      promotionDiscount,
      tax,
      total,
    };
  }

  private calculateCustomerDiscount(customer: Customer, amount: Money): Money {
    const discountRate = customer.loyaltyTier.discountRate;
    return amount.multiply(discountRate);
  }

  private calculatePromotionDiscount(promotions: Promotion[], amount: Money): Money {
    const applicablePromotions = promotions.filter(p => p.isApplicable(amount));
    return applicablePromotions.reduce(
      (discount, promo) => discount.add(promo.calculateDiscount(amount)),
      Money.create(0, amount.currency),
    );
  }

  private calculateTax(amount: Money, address: Address): Money {
    const taxRate = this.getTaxRate(address);
    return amount.multiply(taxRate);
  }

  private getTaxRate(address: Address): number {
    // Logica de determinacion de impuestos por region
    return 0.16; // 16% IVA
  }
}
```

### Checklist DDD

- [ ] Entities tienen identidad unica y comportamiento
- [ ] Value Objects son inmutables y comparados por valores
- [ ] Aggregates encapsulan invariantes de negocio
- [ ] Solo el Aggregate Root es accesible externamente
- [ ] Domain Services para logica que cruza multiples entidades
- [ ] Lenguaje ubicuo reflejado en el codigo

---

## 5. Manejo de Errores

### 5.1 Jerarquia de Excepciones

```typescript
// domain/errors/base.error.ts
export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly httpStatus: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): ErrorResponse {
    return {
      code: this.code,
      message: this.message,
      timestamp: new Date().toISOString(),
    };
  }
}

// domain/errors/not-found.error.ts
export abstract class NotFoundError extends DomainError {
  readonly httpStatus = 404;
}

// domain/errors/validation.error.ts
export abstract class ValidationError extends DomainError {
  readonly httpStatus = 400;
}

// domain/errors/conflict.error.ts
export abstract class ConflictError extends DomainError {
  readonly httpStatus = 409;
}

// domain/errors/forbidden.error.ts
export abstract class ForbiddenError extends DomainError {
  readonly httpStatus = 403;
}
```

### 5.2 Custom Exceptions Tipadas

```typescript
// domain/errors/user.errors.ts
export class UserNotFoundError extends NotFoundError {
  readonly code = 'USER_NOT_FOUND';

  constructor(identifier: string) {
    super(`Usuario con identificador '${identifier}' no encontrado`);
  }
}

export class EmailAlreadyExistsError extends ConflictError {
  readonly code = 'EMAIL_ALREADY_EXISTS';

  constructor(email: string) {
    super(`El email '${email}' ya esta registrado`);
  }
}

export class InvalidEmailError extends ValidationError {
  readonly code = 'INVALID_EMAIL';

  constructor(email: string) {
    super(`El formato del email '${email}' es invalido`);
  }
}

export class UserInactiveError extends ForbiddenError {
  readonly code = 'USER_INACTIVE';

  constructor(userId: string) {
    super(`El usuario '${userId}' esta inactivo`);
  }
}

// domain/errors/order.errors.ts
export class OrderNotFoundError extends NotFoundError {
  readonly code = 'ORDER_NOT_FOUND';

  constructor(orderId: string) {
    super(`Orden '${orderId}' no encontrada`);
  }
}

export class InsufficientStockError extends ValidationError {
  readonly code = 'INSUFFICIENT_STOCK';

  constructor(productId: string, requested: number, available: number) {
    super(
      `Stock insuficiente para producto '${productId}'. ` +
      `Solicitado: ${requested}, Disponible: ${available}`
    );
  }
}

export class OrderNotModifiableError extends ForbiddenError {
  readonly code = 'ORDER_NOT_MODIFIABLE';

  constructor(orderId: string) {
    super(`La orden '${orderId}' no puede ser modificada en su estado actual`);
  }
}

export class InvalidOrderTransitionError extends ValidationError {
  readonly code = 'INVALID_ORDER_TRANSITION';

  constructor(currentStatus: OrderStatus, targetStatus: OrderStatus) {
    super(`No es posible cambiar de '${currentStatus}' a '${targetStatus}'`);
  }
}
```

### 5.3 Exception Filter Global

```typescript
// infrastructure/filters/domain-exception.filter.ts
@Catch(DomainError)
export class DomainExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: DomainError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse: ErrorResponse = {
      code: exception.code,
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // Log solo errores 5xx o errores no esperados
    if (exception.httpStatus >= 500) {
      this.logger.error(
        `[${exception.code}] ${exception.message}`,
        exception.stack,
      );
    } else {
      this.logger.warn(`[${exception.code}] ${exception.message}`);
    }

    response.status(exception.httpStatus).json(errorResponse);
  }
}

// infrastructure/filters/all-exceptions.filter.ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = 500;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'Ha ocurrido un error interno';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || message;
      code = this.getCodeFromStatus(status);
    }

    this.logger.error(
      `Unhandled exception: ${message}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(status).json({
      code,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private getCodeFromStatus(status: number): string {
    const codeMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      500: 'INTERNAL_SERVER_ERROR',
    };
    return codeMap[status] || 'UNKNOWN_ERROR';
  }
}

// main.ts - Registro de filters
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const logger = app.get(Logger);

  app.useGlobalFilters(
    new AllExceptionsFilter(logger),
    new DomainExceptionFilter(logger),
  );

  await app.listen(3000);
}
```

### 5.4 Codigos de Error Estandarizados

| Categoria | Prefijo | HTTP Status | Ejemplo |
|-----------|---------|-------------|---------|
| Validacion | `VALIDATION_*` | 400 | `VALIDATION_INVALID_EMAIL` |
| Autenticacion | `AUTH_*` | 401 | `AUTH_TOKEN_EXPIRED` |
| Autorizacion | `AUTHZ_*` | 403 | `AUTHZ_INSUFFICIENT_PERMISSIONS` |
| No Encontrado | `*_NOT_FOUND` | 404 | `USER_NOT_FOUND` |
| Conflicto | `*_ALREADY_EXISTS`, `CONFLICT_*` | 409 | `EMAIL_ALREADY_EXISTS` |
| Negocio | `BUSINESS_*` | 422 | `BUSINESS_INSUFFICIENT_STOCK` |
| Interno | `INTERNAL_*` | 500 | `INTERNAL_DATABASE_ERROR` |

### Checklist Manejo de Errores

- [ ] Jerarquia de excepciones de dominio definida
- [ ] Cada error tiene codigo unico y mensaje descriptivo
- [ ] Exception filters globales configurados
- [ ] Errores loggeados apropiadamente (warn vs error)
- [ ] Respuestas de error consistentes (JSON estandarizado)
- [ ] No se exponen detalles internos en produccion

---

## 6. Validacion de Datos

### 6.1 Class-Validator Decorators

```typescript
// application/dto/create-user.dto.ts
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  Matches,
  IsPhoneNumber,
  ValidateNested,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'usuario@email.com' })
  @IsEmail({}, { message: 'Formato de email invalido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8, { message: 'La contrasena debe tener al menos 8 caracteres' })
  @MaxLength(50, { message: 'La contrasena no puede exceder 50 caracteres' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    { message: 'La contrasena debe contener mayusculas, minusculas, numeros y caracteres especiales' },
  )
  password: string;

  @ApiProperty({ example: 'Juan Perez' })
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: 'El nombre solo puede contener letras y espacios',
  })
  name: string;

  @ApiPropertyOptional({ example: '+52 55 1234 5678' })
  @IsOptional()
  @IsPhoneNumber('MX', { message: 'Numero de telefono invalido para Mexico' })
  phoneNumber?: string;

  @ApiProperty({ enum: UserRole, example: UserRole.USER })
  @IsEnum(UserRole, { message: 'Rol invalido' })
  role: UserRole;

  @ApiProperty({ type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiPropertyOptional({ type: [String], example: ['tag1', 'tag2'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10, { message: 'Maximo 10 tags permitidos' })
  tags?: string[];
}

export class AddressDto {
  @ApiProperty({ example: 'Av. Principal 123' })
  @IsString()
  @MinLength(5, { message: 'La calle debe tener al menos 5 caracteres' })
  street: string;

  @ApiProperty({ example: 'Ciudad de Mexico' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'CDMX' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: '01234' })
  @IsString()
  @Matches(/^\d{5}$/, { message: 'El codigo postal debe tener 5 digitos' })
  zipCode: string;
}
```

### 6.2 Custom Validators

```typescript
// common/validators/is-unique.validator.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async validate(value: any, args: ValidationArguments): Promise<boolean> {
    const [entityClass, property] = args.constraints;
    const repository = this.dataSource.getRepository(entityClass);

    const existingEntity = await repository.findOne({
      where: { [property]: value },
    });

    return !existingEntity;
  }

  defaultMessage(args: ValidationArguments): string {
    const [, property] = args.constraints;
    return `El valor de ${property} ya existe`;
  }
}

export function IsUnique(
  entityClass: Function,
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [entityClass, property],
      validator: IsUniqueConstraint,
    });
  };
}

// common/validators/is-date-before.validator.ts
@ValidatorConstraint({ async: false })
export class IsDateBeforeConstraint implements ValidatorConstraintInterface {
  validate(value: Date, args: ValidationArguments): boolean {
    const [relatedPropertyName] = args.constraints;
    const relatedValue = (args.object as any)[relatedPropertyName];

    if (!value || !relatedValue) return true;

    return value < relatedValue;
  }

  defaultMessage(args: ValidationArguments): string {
    const [relatedPropertyName] = args.constraints;
    return `La fecha debe ser anterior a ${relatedPropertyName}`;
  }
}

export function IsDateBefore(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [property],
      validator: IsDateBeforeConstraint,
    });
  };
}

// Uso
export class CreateEventDto {
  @IsDate()
  @Type(() => Date)
  @IsDateBefore('endDate', { message: 'La fecha de inicio debe ser anterior a la fecha de fin' })
  startDate: Date;

  @IsDate()
  @Type(() => Date)
  endDate: Date;
}

export class RegisterUserDto {
  @IsEmail()
  @IsUnique(UserOrmEntity, 'email', { message: 'Este email ya esta registrado' })
  email: string;
}
```

### 6.3 Validacion de DTOs en Pipeline

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // Elimina propiedades no decoradas
      forbidNonWhitelisted: true,   // Error si hay propiedades extra
      transform: true,              // Transforma tipos automaticamente
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map(error => ({
          field: error.property,
          constraints: Object.values(error.constraints || {}),
        }));
        return new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: 'Error de validacion',
          errors: formattedErrors,
        });
      },
    }),
  );

  await app.listen(3000);
}

// Respuesta de error de validacion
{
  "code": "VALIDATION_ERROR",
  "message": "Error de validacion",
  "errors": [
    {
      "field": "email",
      "constraints": ["Formato de email invalido"]
    },
    {
      "field": "password",
      "constraints": [
        "La contrasena debe tener al menos 8 caracteres",
        "La contrasena debe contener mayusculas, minusculas, numeros y caracteres especiales"
      ]
    }
  ],
  "timestamp": "2026-02-02T10:30:00.000Z"
}
```

### Checklist Validacion

- [ ] DTOs con decoradores de validacion apropiados
- [ ] Mensajes de error claros y en espanol
- [ ] ValidationPipe global configurado
- [ ] Custom validators para reglas de negocio
- [ ] Validacion de objetos anidados con @ValidateNested
- [ ] Whitelist habilitado para seguridad

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

---

## Referencias

- [ESTANDAR-CODIGO.md](./ESTANDAR-CODIGO.md) - Convenciones de codigo
- [ESTANDAR-NOMENCLATURA.md](./ESTANDAR-NOMENCLATURA.md) - Nombres de archivos y variables
- [NestJS Documentation](https://docs.nestjs.com/) - Documentacion oficial
- [TypeORM Documentation](https://typeorm.io/) - Documentacion de TypeORM
- [class-validator](https://github.com/typestack/class-validator) - Validadores
