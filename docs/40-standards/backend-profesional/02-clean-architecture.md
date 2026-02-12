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
