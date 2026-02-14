---
tipo: ssot-normativo
nivel: 3-completo
es_ssot: true
sistema: SIMCO v4.0.0
version: 1.0.0
actualizado: 2026-02-02
aplica_a:
  - NestJS (Backend)
  - React (Frontend)
  - TypeScript
---

# PRINCIPIO: SOLID - Fundamentos de Diseno Orientado a Objetos

**Version:** 1.0.0
**Fecha:** 2026-02-02
**Tipo:** Principio Fundamental - HERENCIA OBLIGATORIA - **SSOT**
**Aplica a:** TODOS los desarrollos Backend (NestJS) y Frontend (React)
**Alias:** @SOLID

---

## DECLARACION DEL PRINCIPIO

```
+==============================================================================+
|                                                                               |
|    SOLID: Los 5 principios fundamentales del diseno orientado a objetos      |
|                                                                               |
|    S - Single Responsibility Principle (SRP)                                  |
|    O - Open/Closed Principle (OCP)                                            |
|    L - Liskov Substitution Principle (LSP)                                    |
|    I - Interface Segregation Principle (ISP)                                  |
|    D - Dependency Inversion Principle (DIP)                                   |
|                                                                               |
|    "Codigo que respeta SOLID es codigo mantenible, extensible y testeable"   |
|                                                                               |
+==============================================================================+
```

---

## S - SINGLE RESPONSIBILITY PRINCIPLE (SRP)

### Definicion

> **"Una clase debe tener una, y solo una, razon para cambiar."**
> - Robert C. Martin

Un modulo, clase o funcion debe ser responsable de una unica parte de la funcionalidad proporcionada por el software. Esta responsabilidad debe estar completamente encapsulada por la clase.

### Ejemplo en NestJS - Service con Una Responsabilidad

```typescript
// VIOLACION SRP - Service que hace demasiado
@Injectable()
export class UserService {
  async createUser(dto: CreateUserDto) { /* ... */ }
  async sendWelcomeEmail(user: User) { /* ... */ }    // Responsabilidad de email
  async generatePdfReport(user: User) { /* ... */ }   // Responsabilidad de reportes
  async validatePassword(password: string) { /* ... */ } // Validacion
}

// CORRECTO SRP - Cada service con una responsabilidad
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    return this.userRepository.save(dto);
  }

  async findById(id: string): Promise<User> {
    return this.userRepository.findOne(id);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    return this.userRepository.update(id, dto);
  }
}

@Injectable()
export class EmailService {
  async sendWelcomeEmail(user: User): Promise<void> { /* ... */ }
  async sendPasswordReset(user: User, token: string): Promise<void> { /* ... */ }
}

@Injectable()
export class ReportService {
  async generateUserReport(user: User): Promise<Buffer> { /* ... */ }
}
```

### Ejemplo en React - Componente con Una Responsabilidad

```tsx
// VIOLACION SRP - Componente que hace demasiado
const UserProfile = ({ userId }: Props) => {
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchUser(userId).then(setUser);
    fetchOrders(userId).then(setOrders);
  }, [userId]);

  const handleUpdateProfile = async (data: UpdateData) => { /* ... */ };
  const handleExportToPdf = () => { /* ... */ };

  return (
    <div>
      <h1>{user?.name}</h1>
      {/* Renderiza perfil, ordenes, formularios, reportes... */}
    </div>
  );
};

// CORRECTO SRP - Componentes separados por responsabilidad
const UserProfilePage = ({ userId }: Props) => {
  return (
    <div>
      <UserInfo userId={userId} />
      <UserOrders userId={userId} />
      <UserActions userId={userId} />
    </div>
  );
};

const UserInfo = ({ userId }: { userId: string }) => {
  const { data: user } = useUser(userId);  // Custom hook para fetch
  return <UserCard user={user} />;
};

const UserOrders = ({ userId }: { userId: string }) => {
  const { data: orders } = useUserOrders(userId);
  return <OrderList orders={orders} />;
};
```

### Violaciones Comunes y Como Detectarlas

| Senal de Alerta | Descripcion | Solucion |
|-----------------|-------------|----------|
| Clase/archivo > 200 lineas | Probablemente tiene multiples responsabilidades | Dividir por responsabilidad |
| Nombre con "And" o "Manager" | `UserAndOrderService`, `DataManager` | Separar en services especificos |
| Multiples razones para cambiar | Si cambia email Y reportes afectan la clase | Extraer a clases dedicadas |
| Inyeccion de muchas dependencias | Constructor con >5 dependencias | Evaluar si la clase hace demasiado |
| Metodos no relacionados | `createUser()`, `sendEmail()`, `generatePdf()` | Agrupar por dominio |

### Refactoring Patterns

```typescript
// Pattern: Extract Class
// Antes: Una clase con multiples responsabilidades
// Despues: Varias clases, cada una con una responsabilidad

// Pattern: Move Method
// Mover metodos a la clase que los necesita realmente

// Pattern: Extract Service
// En NestJS, crear un nuevo @Injectable() para la responsabilidad extraida
```

---

## O - OPEN/CLOSED PRINCIPLE (OCP)

### Definicion

> **"Las entidades de software deben estar abiertas para extension, pero cerradas para modificacion."**
> - Bertrand Meyer

Deberias poder extender el comportamiento de una clase sin modificar su codigo fuente existente.

### Ejemplo: Strategy Pattern en NestJS

```typescript
// Interfaz que define el contrato
interface PaymentStrategy {
  process(amount: number): Promise<PaymentResult>;
  getName(): string;
}

// Implementaciones concretas - Extension sin modificar existentes
@Injectable()
export class CreditCardStrategy implements PaymentStrategy {
  async process(amount: number): Promise<PaymentResult> {
    // Logica de tarjeta de credito
    return { success: true, transactionId: 'cc-123' };
  }
  getName() { return 'credit_card'; }
}

@Injectable()
export class PayPalStrategy implements PaymentStrategy {
  async process(amount: number): Promise<PaymentResult> {
    // Logica de PayPal
    return { success: true, transactionId: 'pp-456' };
  }
  getName() { return 'paypal'; }
}

// Agregar nuevo metodo de pago NO requiere modificar codigo existente
@Injectable()
export class CryptoStrategy implements PaymentStrategy {
  async process(amount: number): Promise<PaymentResult> {
    // Nueva logica - extension
    return { success: true, transactionId: 'crypto-789' };
  }
  getName() { return 'crypto'; }
}

// Service que usa las estrategias - CERRADO para modificacion
@Injectable()
export class PaymentService {
  private strategies: Map<string, PaymentStrategy>;

  constructor(
    @Inject('PAYMENT_STRATEGIES') strategies: PaymentStrategy[],
  ) {
    this.strategies = new Map(
      strategies.map(s => [s.getName(), s])
    );
  }

  async processPayment(method: string, amount: number): Promise<PaymentResult> {
    const strategy = this.strategies.get(method);
    if (!strategy) {
      throw new BadRequestException(`Payment method ${method} not supported`);
    }
    return strategy.process(amount);
  }
}
```

### Ejemplo: Component Composition en React

```tsx
// Componente base - Cerrado para modificacion
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const Button = ({ children, onClick, className = '' }: ButtonProps) => (
  <button
    className={`btn-base ${className}`}
    onClick={onClick}
  >
    {children}
  </button>
);

// Extension via composicion - Abierto para extension
const PrimaryButton = (props: ButtonProps) => (
  <Button {...props} className={`btn-primary ${props.className || ''}`} />
);

const DangerButton = (props: ButtonProps) => (
  <Button {...props} className={`btn-danger ${props.className || ''}`} />
);

// Extension con funcionalidad adicional
interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
}

const LoadingButton = ({ isLoading, children, ...props }: LoadingButtonProps) => (
  <Button {...props} disabled={isLoading}>
    {isLoading ? <Spinner /> : children}
  </Button>
);

// Nueva variante sin modificar componentes existentes
const IconButton = ({ icon, children, ...props }: ButtonProps & { icon: string }) => (
  <Button {...props}>
    <Icon name={icon} />
    {children}
  </Button>
);
```

### Como Extender Sin Modificar

| Tecnica | Uso | Ejemplo |
|---------|-----|---------|
| Strategy Pattern | Algoritmos intercambiables | PaymentStrategy, SortStrategy |
| Decorator Pattern | Agregar comportamiento | LoggingDecorator, CachingDecorator |
| Template Method | Pasos personalizables | Abstract base class con hooks |
| Composition | Componentes UI extensibles | HOCs, Render Props, Compound Components |
| Plugin System | Funcionalidad modular | NestJS Modules, React Context |

---

## L - LISKOV SUBSTITUTION PRINCIPLE (LSP)

### Definicion

> **"Los objetos de una superclase deben poder ser reemplazados por objetos de sus subclases sin alterar la correctitud del programa."**
> - Barbara Liskov

Si `S` es un subtipo de `T`, entonces los objetos de tipo `T` pueden ser reemplazados por objetos de tipo `S` sin alterar ninguna de las propiedades deseables del programa.

### Ejemplo de Interfaz y Sus Implementaciones

```typescript
// Interfaz base que define el contrato
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<T>;
  delete(id: string): Promise<void>;
}

// Implementacion PostgreSQL - Cumple LSP
@Injectable()
export class PostgresUserRepository implements Repository<User> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: TypeOrmRepository<UserEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<User[]> {
    const entities = await this.repo.find();
    return entities.map(this.toDomain);
  }

  async save(user: User): Promise<User> {
    const entity = await this.repo.save(this.toEntity(user));
    return this.toDomain(entity);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(entity: UserEntity): User { /* ... */ }
  private toEntity(user: User): UserEntity { /* ... */ }
}

// Implementacion In-Memory - Cumple LSP (puede sustituir a Postgres)
@Injectable()
export class InMemoryUserRepository implements Repository<User> {
  private users: Map<string, User> = new Map();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findAll(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async save(user: User): Promise<User> {
    this.users.set(user.id, user);
    return user;
  }

  async delete(id: string): Promise<void> {
    this.users.delete(id);
  }
}

// Service que usa Repository - Funciona con cualquier implementacion
@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY')
    private readonly repository: Repository<User>,
  ) {}

  // Este metodo funciona identicamente con Postgres o InMemory
  async getUser(id: string): Promise<User> {
    const user = await this.repository.findById(id);
    if (!user) throw new NotFoundException();
    return user;
  }
}
```

### Violaciones Comunes

```typescript
// VIOLACION LSP - Subclase que rompe el contrato
class Bird {
  fly(): void { console.log('Flying...'); }
}

class Penguin extends Bird {
  fly(): void {
    throw new Error('Penguins cannot fly!'); // VIOLA LSP!
  }
}

// CORRECTO - Segregar la interfaz
interface Bird {
  eat(): void;
  sleep(): void;
}

interface FlyingBird extends Bird {
  fly(): void;
}

class Sparrow implements FlyingBird {
  eat(): void { /* ... */ }
  sleep(): void { /* ... */ }
  fly(): void { /* ... */ }
}

class Penguin implements Bird {
  eat(): void { /* ... */ }
  sleep(): void { /* ... */ }
  // No tiene fly() - no viola ningun contrato
}
```

### Contratos que Deben Cumplirse

| Regla | Descripcion |
|-------|-------------|
| Precondiciones | No pueden ser mas fuertes en la subclase |
| Postcondiciones | No pueden ser mas debiles en la subclase |
| Invariantes | Deben mantenerse en la subclase |
| Historia | No debe violar restricciones del tipo base |
| Excepciones | Solo lanzar las declaradas o subtipos |
| Retorno | Covariant (mismo tipo o subtipo) |
| Parametros | Contravariant (mismo tipo o supertipo) |

---

## I - INTERFACE SEGREGATION PRINCIPLE (ISP)

### Definicion

> **"Los clientes no deben ser forzados a depender de interfaces que no utilizan."**
> - Robert C. Martin

Es mejor tener muchas interfaces especificas que una sola interfaz general ("gorda").

### Ejemplo de Interfaces Especificas vs Interfaz Gorda

```typescript
// VIOLACION ISP - Interfaz gorda
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
  attendMeeting(): void;
  writeReport(): void;
  managePeople(): void;  // No todos los workers son managers
}

// Un Developer no necesita managePeople()
class Developer implements Worker {
  work(): void { /* ... */ }
  eat(): void { /* ... */ }
  sleep(): void { /* ... */ }
  attendMeeting(): void { /* ... */ }
  writeReport(): void { /* ... */ }
  managePeople(): void {
    throw new Error('Not a manager'); // Forzado a implementar algo que no usa
  }
}

// CORRECTO ISP - Interfaces segregadas
interface Workable {
  work(): void;
}

interface Feedable {
  eat(): void;
}

interface Restable {
  sleep(): void;
}

interface Meetable {
  attendMeeting(): void;
}

interface Reportable {
  writeReport(): void;
}

interface Manageable {
  managePeople(): void;
}

// Cada clase implementa solo lo que necesita
class Developer implements Workable, Feedable, Restable, Meetable, Reportable {
  work(): void { /* ... */ }
  eat(): void { /* ... */ }
  sleep(): void { /* ... */ }
  attendMeeting(): void { /* ... */ }
  writeReport(): void { /* ... */ }
}

class Manager implements Workable, Feedable, Restable, Meetable, Manageable {
  work(): void { /* ... */ }
  eat(): void { /* ... */ }
  sleep(): void { /* ... */ }
  attendMeeting(): void { /* ... */ }
  managePeople(): void { /* ... */ }
}
```

### Aplicacion en TypeScript

```typescript
// Interfaces especificas para diferentes operaciones
interface Readable<T> {
  findById(id: string): Promise<T | null>;
  findAll(filter?: FilterOptions): Promise<T[]>;
}

interface Writable<T> {
  save(entity: T): Promise<T>;
  update(id: string, partial: Partial<T>): Promise<T>;
}

interface Deletable {
  delete(id: string): Promise<void>;
  softDelete(id: string): Promise<void>;
}

interface Searchable<T> {
  search(query: string): Promise<T[]>;
  findByFilters(filters: FilterCriteria): Promise<T[]>;
}

// Repository puede componer las interfaces que necesita
interface UserRepository extends Readable<User>, Writable<User>, Deletable {
  findByEmail(email: string): Promise<User | null>;
}

// ReadOnlyRepository solo lectura
interface AuditLogRepository extends Readable<AuditLog>, Searchable<AuditLog> {
  // Solo lectura y busqueda - no se pueden modificar logs
}

// Service de reportes solo necesita Readable
@Injectable()
export class ReportService {
  constructor(
    private readonly userRepo: Readable<User>,  // Solo necesita leer
    private readonly orderRepo: Readable<Order>,
  ) {}

  async generateReport(): Promise<Report> {
    const users = await this.userRepo.findAll();
    const orders = await this.orderRepo.findAll();
    // ...
  }
}
```

---

## D - DEPENDENCY INVERSION PRINCIPLE (DIP)

### Definicion

> **"Los modulos de alto nivel no deben depender de modulos de bajo nivel. Ambos deben depender de abstracciones."**
> **"Las abstracciones no deben depender de los detalles. Los detalles deben depender de las abstracciones."**
> - Robert C. Martin

### Ejemplo en NestJS con Inyeccion de Dependencias

```typescript
// VIOLACION DIP - Dependencia directa de implementacion concreta
@Injectable()
export class OrderService {
  private emailService = new SmtpEmailService(); // Acoplamiento fuerte!
  private repository = new PostgresOrderRepository(); // Acoplamiento fuerte!

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const order = await this.repository.save(dto);
    await this.emailService.send(order.userEmail, 'Order created');
    return order;
  }
}

// CORRECTO DIP - Depender de abstracciones

// 1. Definir abstracciones (interfaces)
interface EmailService {
  send(to: string, subject: string, body: string): Promise<void>;
}

interface OrderRepository {
  save(order: CreateOrderDto): Promise<Order>;
  findById(id: string): Promise<Order | null>;
}

// 2. Implementaciones concretas
@Injectable()
export class SmtpEmailService implements EmailService {
  async send(to: string, subject: string, body: string): Promise<void> {
    // Implementacion SMTP real
  }
}

@Injectable()
export class SendGridEmailService implements EmailService {
  async send(to: string, subject: string, body: string): Promise<void> {
    // Implementacion SendGrid
  }
}

@Injectable()
export class PostgresOrderRepository implements OrderRepository {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly repo: TypeOrmRepository<OrderEntity>,
  ) {}

  async save(dto: CreateOrderDto): Promise<Order> { /* ... */ }
  async findById(id: string): Promise<Order | null> { /* ... */ }
}

// 3. Service depende de abstracciones (interfaces), no implementaciones
@Injectable()
export class OrderService {
  constructor(
    @Inject('EMAIL_SERVICE')
    private readonly emailService: EmailService,
    @Inject('ORDER_REPOSITORY')
    private readonly repository: OrderRepository,
  ) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const order = await this.repository.save(dto);
    await this.emailService.send(
      order.userEmail,
      'Order Confirmation',
      `Your order ${order.id} has been created`
    );
    return order;
  }
}

// 4. Configuracion del modulo - Aqui se decide la implementacion concreta
@Module({
  providers: [
    OrderService,
    {
      provide: 'EMAIL_SERVICE',
      useClass: process.env.NODE_ENV === 'production'
        ? SendGridEmailService
        : SmtpEmailService,
    },
    {
      provide: 'ORDER_REPOSITORY',
      useClass: PostgresOrderRepository,
    },
  ],
})
export class OrderModule {}
```

### Diferencia entre Depender de Abstracciones vs Concreciones

```
INCORRECTO (Depende de Concrecion):

  +-------------------+         +----------------------+
  |   OrderService    | ------> | PostgresRepository   |
  +-------------------+         +----------------------+
                                         |
                                         v
                                  [ PostgreSQL DB ]

  - Cambiar de Postgres a MongoDB requiere modificar OrderService
  - Dificil de testear (necesita BD real)
  - Alto acoplamiento


CORRECTO (Depende de Abstraccion):

  +-------------------+         +----------------------+
  |   OrderService    | ------> |  <<interface>>       |
  +-------------------+         |    Repository        |
                                +----------------------+
                                         ^
                                         |
                     +-------------------+-------------------+
                     |                                       |
          +---------------------+              +---------------------+
          | PostgresRepository  |              | MongoRepository     |
          +---------------------+              +---------------------+
                     |                                       |
                     v                                       v
              [ PostgreSQL ]                           [ MongoDB ]

  - Cambiar implementacion: solo configurar el modulo
  - Facil de testear con mocks/stubs
  - Bajo acoplamiento
```

---

## CHECKLIST DE VALIDACION SOLID

### Antes de Crear una Clase/Componente

```
[ ] SRP: Esta clase tiene UNA SOLA razon para cambiar?
[ ] SRP: El nombre describe claramente su unica responsabilidad?
[ ] OCP: Puedo extender comportamiento sin modificar codigo existente?
[ ] OCP: Uso composicion/estrategia en lugar de condicionales?
[ ] LSP: Las subclases pueden sustituir a la clase base sin errores?
[ ] LSP: Todas las implementaciones respetan el contrato de la interfaz?
[ ] ISP: Las interfaces son especificas y cohesivas?
[ ] ISP: Ningun cliente depende de metodos que no usa?
[ ] DIP: Las dependencias son interfaces, no clases concretas?
[ ] DIP: La inyeccion de dependencias permite sustituir implementaciones?
```

### Senales de Violacion SOLID

| Principio | Senal de Alerta | Accion |
|-----------|-----------------|--------|
| SRP | Clase > 200 lineas, >5 dependencias | Dividir responsabilidades |
| OCP | Switch/if extensos por tipo | Usar Strategy/Factory Pattern |
| LSP | Excepciones en metodos heredados | Redisenar jerarquia de clases |
| ISP | Interfaces con metodos no implementados | Segregar en interfaces menores |
| DIP | `new ConcreteClass()` en services | Usar @Inject con interfaces |

### Checklist de Code Review SOLID

```yaml
code_review_solid:
  srp:
    - "Cada clase/componente tiene una sola responsabilidad?"
    - "Los nombres reflejan claramente la responsabilidad?"
    - "Hay metodos que deberian estar en otra clase?"

  ocp:
    - "Se puede agregar funcionalidad sin modificar codigo existente?"
    - "Se usan patrones de extension (Strategy, Decorator)?"
    - "Los switch/if por tipo estan minimizados?"

  lsp:
    - "Las subclases cumplen el contrato del padre?"
    - "Se puede sustituir una implementacion por otra sin errores?"
    - "Las excepciones son consistentes entre implementaciones?"

  isp:
    - "Las interfaces son cohesivas y especificas?"
    - "Los clientes usan todos los metodos de las interfaces que implementan?"
    - "Hay interfaces 'gordas' que deben segregarse?"

  dip:
    - "Las clases dependen de interfaces, no de implementaciones?"
    - "Se usa inyeccion de dependencias correctamente?"
    - "Los modulos de alto nivel estan desacoplados de los de bajo nivel?"
```

---

## REFERENCIAS

| Recurso | Descripcion |
|---------|-------------|
| Clean Code (Robert C. Martin) | Libro fundacional sobre codigo limpio |
| Agile Principles, Patterns, and Practices | Explicacion detallada de SOLID |
| NestJS Documentation | Patrones de inyeccion de dependencias |
| React Patterns | Composicion y HOCs |

---

## ALIAS

```yaml
@SOLID:     orchestration/directivas/principios/PRINCIPIO-SOLID.md
@SRP:       Single Responsibility Principle
@OCP:       Open/Closed Principle
@LSP:       Liskov Substitution Principle
@ISP:       Interface Segregation Principle
@DIP:       Dependency Inversion Principle
```

---

**Este principio es OBLIGATORIO para todo desarrollo Backend y Frontend.**

---

**Version:** 1.0.0 | **Sistema:** SIMCO v4.0.0 | **Tipo:** Principio Fundamental
