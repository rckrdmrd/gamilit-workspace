# Estandar Backend Profesional - Clean Architecture en NestJS

> **Parte de:** [Estandar Backend Profesional](./_INDEX.md) | **Seccion 2 de 8**

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

### 2.5 Arquitectura Hexagonal en NestJS

La Arquitectura Hexagonal (Ports & Adapters) complementa Clean Architecture al definir explicitamente los **puertos** (interfaces) y **adaptadores** (implementaciones) que conectan el nucleo de dominio con el mundo exterior. En gamilit, esta arquitectura se manifiesta de forma natural en la estructura de NestJS.

#### Conceptos Clave

| Concepto Hexagonal | Equivalente en NestJS | Ejemplo en gamilit |
|--------------------|----------------------|---------------------|
| Puerto Primario (Driving) | Controller, Gateway, Cron Job | `AuthController`, `NotificationsGateway`, `MissionsCronService` |
| Puerto Secundario (Driven) | Interfaz de repositorio o servicio externo | `IUserRepository`, `IMailService` |
| Adaptador Primario | Implementacion HTTP/WS/CLI | `@Controller()`, `@WebSocketGateway()`, `@Cron()` |
| Adaptador Secundario | Implementacion de persistencia/infra | `TypeOrmUserRepository`, `RedisIoAdapter`, `MailService` |
| Nucleo de Dominio | Entities, Value Objects, Domain Services | `User`, `Email`, `AuthService` |

#### Diagrama de Arquitectura Hexagonal

```
        ┌──────────── ADAPTADORES PRIMARIOS ────────────┐
        │  Controllers (107)  │  Gateways  │  Cron Jobs  │
        └──────────┬──────────┴─────┬──────┴──────┬──────┘
                   │                │             │
        ┌──────────▼────────────────▼─────────────▼──────┐
        │              PUERTOS PRIMARIOS                  │
        │    (Use Cases / Application Services)           │
        ├─────────────────────────────────────────────────┤
        │              NUCLEO DE DOMINIO                  │
        │    (Entities, Value Objects, Domain Services)    │
        ├─────────────────────────────────────────────────┤
        │              PUERTOS SECUNDARIOS                │
        │    (Repository Interfaces, Service Interfaces)  │
        └──────────┬──────────┬───────────┬──────────────┘
                   │          │           │
        ┌──────────▼──────────▼───────────▼──────────────┐
        │          ADAPTADORES SECUNDARIOS                │
        │  TypeORM Repos  │  Redis  │  Email  │  S3      │
        └─────────────────────────────────────────────────┘
```

#### Puertos Primarios (Driving Ports)

Los puertos primarios son los puntos de entrada al sistema. En gamilit existen tres tipos principales:

**1. HTTP Controllers (107 controllers)**

Son el adaptador primario mas comun. Cada controller recibe peticiones HTTP y las traduce a invocaciones de servicios de aplicacion.

```typescript
// apps/backend/src/modules/auth/controllers/auth.controller.ts
@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<TokenResponse> {
    return this.authService.login(dto);
  }
}
```

**2. WebSocket Gateways (3 gateways)**

Gamilit utiliza Socket.IO para comunicacion en tiempo real. Los gateways actuan como adaptadores primarios para eventos WebSocket.

```typescript
// apps/backend/src/modules/websocket/notifications.gateway.ts
@WebSocketGateway({ cors: true, namespace: '/notifications' })
export class NotificationsGateway {
  // Punto de entrada via WebSocket — traduce eventos a logica de dominio
}

// apps/backend/src/modules/gamification/peer-challenges/gateways/
// - matchmaking.gateway.ts (emparejamiento de desafios)
// - battle.gateway.ts (batallas en tiempo real)
```

**3. Cron Jobs (15+ servicios con @Cron)**

Tareas programadas que disparan logica de dominio en intervalos definidos.

```typescript
// apps/backend/src/modules/tasks/services/missions-cron.service.ts
@Injectable()
export class MissionsCronService {
  @Cron('0 0 * * *') // Cada dia a medianoche
  async resetDailyMissions(): Promise<void> {
    // Dispara logica de dominio para reiniciar misiones diarias
  }
}
```

#### Puertos Secundarios (Driven Ports)

Los puertos secundarios son interfaces que el dominio define para comunicarse con el exterior sin conocer la implementacion concreta.

```typescript
// Interfaz de repositorio (puerto secundario)
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}

// Interfaz de servicio externo (puerto secundario)
export interface IMailService {
  sendVerificationEmail(to: string, token: string): Promise<void>;
  sendPasswordResetEmail(to: string, token: string): Promise<void>;
}
```

#### Adaptadores Secundarios

Los adaptadores secundarios implementan los puertos secundarios con tecnologias concretas.

**TypeORM Repositories** — Implementan persistencia con PostgreSQL:

```typescript
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
}
```

**Redis Adapter** — Comunicacion pub/sub para Socket.IO:

```typescript
// apps/backend/src/adapters/redis-io.adapter.ts
export class RedisIoAdapter extends IoAdapter {
  // Adaptador secundario que conecta Socket.IO con Redis
  // para escalamiento horizontal de WebSockets
  async connectToRedis(): Promise<boolean> { /* ... */ }
  createIOServer(port: number, options?: ServerOptions): any { /* ... */ }
}
```

#### Registro de Adaptadores en NestJS

NestJS facilita la inyeccion de adaptadores secundarios usando `useFactory` y tokens de inyeccion:

```typescript
// Registrar adaptador secundario en el modulo
@Module({
  providers: [
    {
      provide: 'IUserRepository',        // Token del puerto
      useClass: TypeOrmUserRepository,    // Adaptador concreto
    },
    {
      provide: 'IMailService',
      useFactory: (configService: ConfigService) => {
        // Factory permite configuracion dinamica
        return new SmtpMailService(configService.get('SMTP_HOST'));
      },
      inject: [ConfigService],
    },
  ],
})
export class AuthModule {}
```

> **Nota pragmatica:** En gamilit, la mayoria de los modulos usan inyeccion directa de servicios
> sin interfaces explicitas (patron comun en NestJS). La arquitectura hexagonal completa
> con interfaces es recomendada para modulos criticos como `auth`, `gamification` y `educational`.

---

### 2.6 Mapeo Hexagonal en Modulos de Gamilit

La siguiente tabla muestra como los modulos principales de gamilit se mapean a la arquitectura hexagonal:

| Modulo | Puertos Primarios | Nucleo de Dominio | Puertos Secundarios |
|--------|------------------|-------------------|---------------------|
| `auth` | `AuthController`, `PasswordController`, `UsersController`, `JwtStrategy` | `AuthService`, `SecurityService`, `SessionManagementService` | `UserRepository`, `TokenRepository`, `SecurityEventRepository` |
| `educational` | `ModuleController`, `ExerciseController`, `ContentController` | `ExerciseService`, `ModuleService`, `ContentService` | `ExerciseRepository`, `ModuleRepository`, `MediaRepository` |
| `gamification` | `AchievementController`, `LeaderboardController`, `XPController` | `XPService`, `RankService`, `AchievementService`, `MLCoinsService` | `UserStatsRepository`, `AchievementRepository`, `LeaderboardRepository` |
| `progress` | `ProgressController`, `SubmissionController` | `ProgressTrackingService`, `SubmissionService` | `ExerciseSubmissionRepository`, `ProgressRepository` |
| `notifications` | `NotificationController`, `NotificationsGateway` (WebSocket) | `NotificationService`, `NotificationQueueService` | `NotificationRepository`, `EmailService`, `PushService` |
| `teacher` | `TeacherController`, `ClassroomController`, `AssignmentController` | `TeacherService`, `ClassroomService`, `StudentRiskAlertService` | `ClassroomRepository`, `AssignmentRepository`, `ReportRepository` |
| `parents` | `ParentController`, `ParentDashboardController` | `ParentService`, `WeeklyReportCronService` | `ParentAccountRepository`, `ParentStudentLinkRepository` |
| `social` | `SocialController`, `TeamController` | `SocialService`, `TeamService` | `FriendshipRepository`, `TeamRepository` |
| `admin` | `AdminController`, `OrganizationController` | `AdminService`, `AdminMonitoringService` | `TenantRepository`, `UserRepository`, `ReportRepository` |
| `tasks` | Cron Jobs (`@Cron`) — sin controllers HTTP | `AchievementReconciliationService`, `MissionsCronService` | `AchievementRepository`, `MissionRepository`, `MaterializedViewsRepository` |

#### Flujo de una Peticion a traves de las Capas

```
1. HTTP Request: POST /api/auth/login
   │
2. ┌─ ADAPTADOR PRIMARIO ──────────────────────────────┐
   │  AuthController.login(@Body() dto: LoginDto)      │
   └───────────────────────────┬────────────────────────┘
                               │
3. ┌─ PUERTO PRIMARIO / CASO DE USO ──────────────────────┐
   │  AuthService.login(dto)                               │
   │  - Valida credenciales                                │
   │  - Genera tokens JWT                                  │
   │  - Registra sesion                                    │
   └──────────────┬──────────────────────┬─────────────────┘
                  │                      │
4. ┌─ PUERTOS SECUNDARIOS ──────────┐   ┌─ PUERTOS SECUNDARIOS ───────┐
   │  UserRepository.findByEmail()  │   │  SessionRepository.save()   │
   └──────────────┬─────────────────┘   └──────────────┬──────────────┘
                  │                                     │
5. ┌─ ADAPTADORES SECUNDARIOS ──────┐   ┌─ ADAPTADORES SECUNDARIOS ──┐
   │  TypeORM → PostgreSQL (auth)   │   │  TypeORM → PostgreSQL      │
   └────────────────────────────────┘   └─────────────────────────────┘
```

#### Beneficios del Mapeo Hexagonal en gamilit

1. **Testabilidad:** Los puertos secundarios se pueden mockear facilmente en tests unitarios (833 tests passing)
2. **Intercambiabilidad:** El `RedisIoAdapter` puede reemplazarse por un adaptador en memoria sin modificar gateways
3. **Separacion de concerns:** Los 15 guards (`JwtAuthGuard`, `RolesGuard`, `TenantGuard`, etc.) actuan como interceptores en la capa de adaptadores primarios
4. **Multi-datasource:** Los 10 datasources de gamilit mapean a adaptadores secundarios independientes por schema

### Checklist Arquitectura Hexagonal

- [ ] Puertos primarios (controllers/gateways) NO contienen logica de negocio
- [ ] Puertos secundarios definidos como interfaces en la capa de dominio
- [ ] Adaptadores secundarios inyectados via tokens, no hardcodeados
- [ ] Nucleo de dominio sin imports de `@nestjs/typeorm`, `redis`, u otras librerias de infra
- [ ] Tests unitarios usan mocks de puertos secundarios, no bases de datos reales
- [ ] Cada modulo expone su API publica via barrel exports (`index.ts`)
