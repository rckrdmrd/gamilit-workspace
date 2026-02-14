---
titulo: Guia de Design Patterns Aplicados a NestJS
version: 1.0.0
fecha_creacion: 2026-02-14
tags: [patrones, gof, nestjs, typescript]
aplica_a: [backend, frontend]
estado: vigente
---

# Guia de Design Patterns Aplicados a NestJS

> **Aplica a:** `apps/backend/src/` y `apps/frontend/src/` | **Stack:** NestJS 11, TypeORM 0.3.x, React 19, TypeScript 5.x

---

## Indice de Patrones

| # | Patron | Categoria GoF | Uso Principal en gamilit |
|---|--------|--------------|--------------------------|
| 1 | Factory | Creacional | Providers con `useFactory`, modulos dinamicos |
| 2 | Strategy | Comportamiento | Guards (`CanActivate`), estrategias de autenticacion |
| 3 | Adapter | Estructural | TypeORM repositories, Redis adapter |
| 4 | Decorator | Estructural | Decoradores custom (`@Roles`, `@CurrentUser`) |
| 5 | Observer | Comportamiento | Eventos de dominio, comunicacion entre modulos |
| 6 | Builder | Creacional | TypeORM QueryBuilder, consultas complejas |
| 7 | Singleton | Creacional | Providers NestJS, scope por defecto |
| 8 | Template Method | Comportamiento | Base services con hooks abstractos |
| 9 | Repository | Estructural | TypeORM repositories (ver 03-repository-pattern.md) |
| 10 | Frontend Patterns | Varios | Compound Components, Custom Hooks, Zustand |

---

## 1. Factory Pattern

**Categoria GoF:** Creacional

**Descripcion:** El patron Factory encapsula la logica de creacion de objetos, delegando la decision de que clase instanciar a una fabrica en lugar de hacerlo directamente con `new`. En NestJS, este patron se manifiesta en los providers con `useFactory` y en los modulos dinamicos con `forRoot`/`forRootAsync`.

### 1.1 useFactory para Configuracion Dinamica

En gamilit, `useFactory` se utiliza para crear providers que dependen de configuracion en tiempo de ejecucion.

```typescript
// apps/backend/src/modules/auth/auth.module.ts
// Factory para configurar JwtModule con variables de entorno
JwtModule.registerAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService): JwtModuleOptions => ({
    secret: configService.get<string>('JWT_SECRET') || 'dev-secret-change-in-production',
    signOptions: {
      expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '15m',
    } as JwtModuleOptions['signOptions'],
  }),
  inject: [ConfigService],
}),
```

**Por que funciona:** La instanciacion del `JwtModule` se difiere hasta que el `ConfigService` este disponible, permitiendo leer variables de entorno de forma segura.

### 1.2 Factory para Conexiones de Base de Datos

gamilit utiliza 10 datasources (uno por schema de PostgreSQL). Cada datasource se crea con un factory:

```typescript
// apps/backend/src/app.module.ts (patron simplificado)
TypeOrmModule.forRootAsync({
  name: 'auth',           // Nombre del datasource
  imports: [ConfigModule],
  useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: configService.get('DB_HOST'),
    port: configService.get<number>('DB_PORT'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_DATABASE'),
    schema: 'auth_management',
    entities: [User, Profile, Tenant, Role, /* ... */],
    synchronize: false,    // NUNCA en produccion
  }),
  inject: [ConfigService],
}),
```

### 1.3 Modulos Dinamicos: forRoot / forRootAsync

El patron de modulos dinamicos en NestJS es una implementacion del Abstract Factory:

```typescript
// Patron generico de modulo dinamico
@Module({})
export class NotificationModule {
  static forRoot(options: NotificationModuleOptions): DynamicModule {
    return {
      module: NotificationModule,
      providers: [
        {
          provide: 'NOTIFICATION_OPTIONS',
          useValue: options,
        },
        NotificationService,
      ],
      exports: [NotificationService],
    };
  }

  static forRootAsync(options: NotificationModuleAsyncOptions): DynamicModule {
    return {
      module: NotificationModule,
      imports: options.imports || [],
      providers: [
        {
          provide: 'NOTIFICATION_OPTIONS',
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        NotificationService,
      ],
      exports: [NotificationService],
    };
  }
}
```

### Cuando Usar / Cuando NO Usar

| Usar | NO Usar |
|------|---------|
| Configuracion que depende de env vars | Objetos simples sin logica de creacion |
| Conexiones a servicios externos | Cuando `useClass` o `useValue` son suficientes |
| Modulos reutilizables con configuracion variable | Para crear DTOs o Value Objects simples |
| Instanciacion condicional (dev vs prod) | Si la creacion no tiene dependencias |

---

## 2. Strategy Pattern

**Categoria GoF:** Comportamiento

**Descripcion:** El patron Strategy define una familia de algoritmos, encapsula cada uno, y los hace intercambiables. En NestJS, los guards que implementan `CanActivate` son el ejemplo mas claro: todos comparten la misma interfaz pero aplican estrategias de autorizacion distintas.

### 2.1 Guards como Strategy en gamilit

gamilit tiene 15 guards, cada uno implementando la interfaz `CanActivate` con una estrategia diferente:

```typescript
// apps/backend/src/modules/auth/guards/jwt-auth.guard.ts
// Estrategia: Validar token JWT via Passport
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }
}

// apps/backend/src/modules/auth/guards/roles.guard.ts
// Estrategia: Verificar rol del usuario contra roles requeridos
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<GamilityRoleEnum[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}

// apps/backend/src/shared/guards/account-status.guard.ts
// Estrategia: Verificar que la cuenta no esta suspendida
@Injectable()
export class AccountStatusGuard implements CanActivate { /* ... */ }

// apps/backend/src/shared/guards/email-verified.guard.ts
// Estrategia: Verificar que el email esta verificado
@Injectable()
export class EmailVerifiedGuard implements CanActivate { /* ... */ }

// apps/backend/src/modules/teacher/guards/classroom-ownership.guard.ts
// Estrategia: Verificar que el teacher es dueno del classroom
@Injectable()
export class ClassroomOwnershipGuard implements CanActivate { /* ... */ }
```

### 2.2 Seleccion de Estrategia con @UseGuards

NestJS selecciona la estrategia en tiempo de ejecucion mediante el decorador `@UseGuards()`:

```typescript
// Composicion de multiples estrategias (ejecutadas en orden)
@Controller('classrooms')
export class ClassroomController {
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, AccountStatusGuard)
  @Roles(GamilityRoleEnum.TEACHER, GamilityRoleEnum.ADMIN)
  async createClassroom(@Body() dto: CreateClassroomDto) {
    // 1. JwtAuthGuard valida el token
    // 2. RolesGuard verifica que es TEACHER o ADMIN
    // 3. AccountStatusGuard verifica que la cuenta esta activa
  }
}
```

### 2.3 Passport Strategies

El modulo de autenticacion usa Passport Strategies, otra manifestacion del patron Strategy:

```typescript
// apps/backend/src/modules/auth/strategies/jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<RequestUser> {
    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      tenantId: payload.tenantId,
    };
  }
}
```

### Cuando Usar / Cuando NO Usar

| Usar | NO Usar |
|------|---------|
| Multiples algoritmos de autorizacion | Una sola forma de autenticar |
| Validaciones que varian por contexto | Logica de negocio simple en un service |
| Comportamiento intercambiable en runtime | Cuando un `if/else` simple basta |
| Pipelines de validacion composables | Para logica que nunca cambia |

---

## 3. Adapter Pattern

**Categoria GoF:** Estructural

**Descripcion:** El patron Adapter permite que interfaces incompatibles trabajen juntas, envolviendo una clase existente con una interfaz nueva. En gamilit, los repositorios TypeORM adaptan la interfaz de persistencia SQL a la interfaz de dominio, y `RedisIoAdapter` adapta Redis a la interfaz de Socket.IO.

### 3.1 TypeORM Repositories como Adaptadores

Los repositorios TypeORM adaptan la interfaz de persistencia de PostgreSQL a la interfaz de dominio que esperan los servicios:

```typescript
// El adaptador traduce entre dominio e infraestructura
@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {}

  // Adapta la interfaz de dominio a operaciones TypeORM
  async findByEmail(email: string): Promise<User | null> {
    const entity = await this.repository.findOne({ where: { email } });
    return entity ? UserPersistenceMapper.toDomain(entity) : null;
  }

  async save(user: User): Promise<void> {
    const entity = UserPersistenceMapper.toOrmEntity(user);
    await this.repository.save(entity);
  }
}
```

> **Referencia completa:** Ver `docs/40-standards/backend-profesional/03-repository-pattern.md`
> para el patron Repository en detalle.

### 3.2 RedisIoAdapter para Socket.IO

El `RedisIoAdapter` es un adaptador que conecta la interfaz de Socket.IO con Redis para escalamiento horizontal:

```typescript
// apps/backend/src/adapters/redis-io.adapter.ts
export class RedisIoAdapter extends IoAdapter {
  private pubClient: RedisClientType | null = null;
  private subClient: RedisClientType | null = null;

  // Adapta la interfaz de IoAdapter para usar Redis pub/sub
  async connectToRedis(): Promise<boolean> {
    this.pubClient = createClient(clientOptions) as RedisClientType;
    this.subClient = this.pubClient.duplicate() as RedisClientType;
    await Promise.all([this.pubClient.connect(), this.subClient.connect()]);
    this.adapterConstructor = createAdapter(this.pubClient, this.subClient);
    return true;
  }

  // Override del metodo de IoAdapter para inyectar el adaptador Redis
  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, serverOptions);
    if (this.adapterConstructor && this.isConnected) {
      server.adapter(this.adapterConstructor);
    }
    return server;
  }
}
```

**Beneficio clave:** Los gateways de WebSocket (`NotificationsGateway`, `MatchmakingGateway`, `BattleGateway`) no necesitan saber si usan memoria local o Redis. El adaptador encapsula esa decision.

### 3.3 Adaptadores de Servicio Externo

Patron para adaptar servicios externos (email, S3, SMS) a interfaces de dominio:

```typescript
// Interfaz de dominio (puerto secundario)
export interface IFileStorageService {
  upload(file: Buffer, key: string): Promise<string>;
  getUrl(key: string): Promise<string>;
  delete(key: string): Promise<void>;
}

// Adaptador para S3
@Injectable()
export class S3StorageAdapter implements IFileStorageService {
  constructor(private readonly s3Client: S3Client) {}

  async upload(file: Buffer, key: string): Promise<string> {
    await this.s3Client.send(new PutObjectCommand({ /* ... */ }));
    return `https://bucket.s3.amazonaws.com/${key}`;
  }
}

// Adaptador para filesystem local (desarrollo)
@Injectable()
export class LocalStorageAdapter implements IFileStorageService {
  async upload(file: Buffer, key: string): Promise<string> {
    await fs.writeFile(`./uploads/${key}`, file);
    return `/uploads/${key}`;
  }
}
```

### Cuando Usar / Cuando NO Usar

| Usar | NO Usar |
|------|---------|
| Integrar librerias externas con interfaces propias | Cuando la libreria ya expone la interfaz que necesitas |
| Abstraer detalles de persistencia (SQL, Redis, S3) | Para clases que no necesitan ser intercambiables |
| Facilitar testing con mocks/stubs | Si solo hay una implementacion y nunca cambiara |
| Permitir cambio de proveedor sin impacto | Para adaptaciones triviales (un wrapper sin logica) |

---

## 4. Decorator Pattern

**Categoria GoF:** Estructural

**Descripcion:** El patron Decorator agrega responsabilidades a un objeto dinamicamente, sin modificar su clase. En NestJS, los decoradores de TypeScript (`@Decorator()`) son la manifestacion mas directa: agregan metadatos, comportamiento o validaciones a clases y metodos sin alterar su codigo.

### 4.1 Decoradores de Metadata en gamilit

Los decoradores custom de gamilit usan `SetMetadata` y `createParamDecorator` para agregar informacion a los handlers sin modificarlos:

```typescript
// apps/backend/src/shared/decorators/roles.decorator.ts
// Agrega metadata de roles requeridos sin modificar el controller
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// Uso:
@Roles('admin', 'super_admin')
@Delete('users/:id')
deleteUser() { /* ... */ }
```

```typescript
// apps/backend/src/shared/decorators/current-user.decorator.ts
// Extrae el usuario del request sin que el controller conozca la implementacion
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return null;
    return data ? user[data] : user;
  },
);

// Uso:
@Get('profile')
getProfile(@CurrentUser() user: RequestUser) { /* ... */ }

// O para extraer solo una propiedad:
@Get('profile')
getProfile(@CurrentUser('email') email: string) { /* ... */ }
```

### 4.2 Decoradores Adicionales en gamilit

```typescript
// apps/backend/src/shared/decorators/tenant.decorator.ts
// Extrae el tenantId del usuario autenticado
export const TenantId = createParamDecorator(/* ... */);

// apps/backend/src/shared/decorators/permissions.decorator.ts
// Define permisos granulares requeridos
export const Permissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);

// apps/backend/src/shared/decorators/public.decorator.ts
// Marca una ruta como publica (sin autenticacion)
export const Public = () => SetMetadata('isPublic', true);

// apps/backend/src/modules/parents/decorators/parent-account.decorator.ts
// Extrae la cuenta de padre del request
export const ParentAccount = createParamDecorator(/* ... */);

// apps/backend/src/modules/ml/decorators/cache-prediction.decorator.ts
// Cachea resultados de prediccion ML
export const CachePrediction = () => /* ... */;
```

### 4.3 Composicion de Decoradores

Los decoradores se pueden componer para crear "super-decoradores" que combinan multiples responsabilidades:

```typescript
// Composicion: Un solo decorador que aplica autenticacion + documentacion
import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse } from '@nestjs/swagger';

export function ApiAuth(...roles: string[]) {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(...roles),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'Token invalido o expirado' }),
  );
}

// Uso simplificado:
@ApiAuth('teacher', 'admin')
@Post('assignments')
createAssignment() { /* ... */ }
```

### Cuando Usar / Cuando NO Usar

| Usar | NO Usar |
|------|---------|
| Agregar metadata a rutas (roles, permisos, cache) | Para logica de negocio compleja |
| Extraer datos del request de forma reutilizable | Si la extraccion es especifica de un solo endpoint |
| Componer comportamiento transversal (auth + docs) | Para reemplazar guards o interceptors |
| Documentar contratos de API con Swagger | Si el decorador solo agrega complejidad sin beneficio |

---

## 5. Observer Pattern

**Categoria GoF:** Comportamiento

**Descripcion:** El patron Observer define una relacion uno-a-muchos entre objetos, de modo que cuando un objeto cambia de estado, todos sus dependientes son notificados automaticamente. En NestJS, esto se implementa con `EventEmitter2` y el decorador `@OnEvent()`.

### 5.1 Eventos de Dominio en gamilit

Los eventos de dominio permiten desacoplar modulos que necesitan reaccionar a cambios sin conocerse directamente:

```typescript
// Definicion del evento
export class UserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly tenantId: string,
  ) {}
}

// Emisor (no conoce a los listeners)
@Injectable()
export class AuthService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async register(dto: RegisterUserDto): Promise<User> {
    const user = await this.createUser(dto);

    // Emitir evento — NO sabe quien escucha
    this.eventEmitter.emit(
      'user.created',
      new UserCreatedEvent(user.id, user.email, user.tenantId),
    );

    return user;
  }
}
```

### 5.2 Listeners (Observadores)

Los listeners reaccionan a eventos sin conocer al emisor:

```typescript
// Listener de gamificacion — otorga XP inicial
@Injectable()
export class GamificationEventListener {
  constructor(private readonly xpService: XPService) {}

  @OnEvent('user.created')
  async handleUserCreated(event: UserCreatedEvent): Promise<void> {
    await this.xpService.grantInitialXP(event.userId, 100);
    await this.xpService.createUserStats(event.userId);
  }
}

// Listener de notificaciones — envia email de bienvenida
@Injectable()
export class NotificationEventListener {
  constructor(private readonly mailService: MailService) {}

  @OnEvent('user.created')
  async handleUserCreated(event: UserCreatedEvent): Promise<void> {
    await this.mailService.sendWelcomeEmail(event.email);
  }
}

// Listener de analytics — registra evento
@Injectable()
export class AnalyticsEventListener {
  @OnEvent('user.created')
  async handleUserCreated(event: UserCreatedEvent): Promise<void> {
    await this.analyticsService.track('user_registered', {
      userId: event.userId,
      tenantId: event.tenantId,
    });
  }
}
```

### 5.3 Eventos Comunes en gamilit

| Evento | Emisor | Listeners Tipicos |
|--------|--------|-------------------|
| `user.created` | AuthService | Gamificacion (XP inicial), Notificaciones (email), Analytics |
| `exercise.completed` | ProgressService | Gamificacion (XP + logros), Analytics, Teacher (alertas) |
| `achievement.unlocked` | AchievementService | Notificaciones (push), Social (feed), Leaderboard |
| `mission.completed` | MissionService | Gamificacion (rewards), Notificaciones |
| `rank.upgraded` | RankService | Notificaciones (celebracion), Social (anuncio) |
| `session.started` | ProgressService | Analytics (tracking), Parents (notificacion) |

### 5.4 Configuracion de EventEmitter2

```typescript
// app.module.ts
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: false,       // No usar wildcards por rendimiento
      delimiter: '.',        // Separador de eventos: 'user.created'
      maxListeners: 20,      // Maximo listeners por evento
      verboseMemoryLeak: true, // Alertar si se excede maxListeners
    }),
  ],
})
export class AppModule {}
```

### Cuando Usar / Cuando NO Usar

| Usar | NO Usar |
|------|---------|
| Desacoplar modulos que reaccionan a cambios | Cuando la respuesta es sincrona y requerida |
| Multiples acciones derivadas de un solo evento | Para comunicacion directa entre dos servicios |
| Side effects (emails, logs, analytics) | Si el resultado del listener afecta al flujo principal |
| Evitar dependencias circulares entre modulos | Para logica critica que DEBE completarse (usar transacciones) |

---

## 6. Builder Pattern

**Categoria GoF:** Creacional

**Descripcion:** El patron Builder separa la construccion de un objeto complejo de su representacion, permitiendo construir diferentes representaciones con el mismo proceso. En TypeORM, el `QueryBuilder` es el ejemplo canonico: construye consultas SQL complejas paso a paso.

### 6.1 TypeORM QueryBuilder

Para consultas complejas en gamilit que involucran joins, filtros y paginacion:

```typescript
// Consulta compleja con QueryBuilder — modulo progress
@Injectable()
export class ProgressService {
  async findStudentProgress(
    studentId: string,
    tenantId: string,
    filters: ProgressFiltersDto,
  ): Promise<PaginatedResult<StudentProgress>> {
    const qb = this.submissionRepo
      .createQueryBuilder('submission')
      .innerJoinAndSelect('submission.exercise', 'exercise')
      .innerJoinAndSelect('exercise.module', 'module')
      .leftJoinAndSelect('submission.feedback', 'feedback')
      .where('submission.student_id = :studentId', { studentId })
      .andWhere('submission.tenant_id = :tenantId', { tenantId });

    // Filtros opcionales (construidos paso a paso)
    if (filters.moduleId) {
      qb.andWhere('module.id = :moduleId', { moduleId: filters.moduleId });
    }

    if (filters.status) {
      qb.andWhere('submission.status = :status', { status: filters.status });
    }

    if (filters.dateFrom) {
      qb.andWhere('submission.created_at >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    if (filters.dateTo) {
      qb.andWhere('submission.created_at <= :dateTo', { dateTo: filters.dateTo });
    }

    // Ordenamiento y paginacion
    qb.orderBy(`submission.${filters.sortBy || 'created_at'}`, filters.sortOrder || 'DESC')
      .skip((filters.page - 1) * filters.limit)
      .take(filters.limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page: filters.page,
      limit: filters.limit,
      totalPages: Math.ceil(total / filters.limit),
    };
  }
}
```

### 6.2 Builder Custom para Objetos Complejos

Patron para construir objetos de dominio con multiples opciones:

```typescript
// Builder para notificaciones complejas
export class NotificationBuilder {
  private notification: Partial<Notification> = {};

  to(userId: string): this {
    this.notification.recipientId = userId;
    return this;
  }

  withTitle(title: string): this {
    this.notification.title = title;
    return this;
  }

  withBody(body: string): this {
    this.notification.body = body;
    return this;
  }

  viaEmail(): this {
    this.notification.channels = [...(this.notification.channels || []), 'email'];
    return this;
  }

  viaPush(): this {
    this.notification.channels = [...(this.notification.channels || []), 'push'];
    return this;
  }

  withPriority(priority: 'low' | 'normal' | 'high'): this {
    this.notification.priority = priority;
    return this;
  }

  build(): Notification {
    if (!this.notification.recipientId || !this.notification.title) {
      throw new Error('recipientId y title son obligatorios');
    }
    return new Notification(this.notification as NotificationProps);
  }
}

// Uso:
const notification = new NotificationBuilder()
  .to(userId)
  .withTitle('Nuevo logro desbloqueado')
  .withBody('Has alcanzado el rango de Ajaw')
  .viaPush()
  .viaEmail()
  .withPriority('high')
  .build();
```

### Cuando Usar / Cuando NO Usar

| Usar | NO Usar |
|------|---------|
| Consultas SQL complejas con filtros opcionales | Consultas simples (`findOne`, `find`) |
| Objetos con muchos parametros opcionales | Objetos con 2-3 propiedades |
| Construccion paso a paso con validacion | Cuando un constructor simple es suficiente |
| Cuando el orden de construccion importa | Para DTOs que ya tienen class-validator |

---

## 7. Singleton Pattern

**Categoria GoF:** Creacional

**Descripcion:** El patron Singleton garantiza que una clase tenga una unica instancia y provee un punto de acceso global a ella. En NestJS, todos los providers decorados con `@Injectable()` son singletons por defecto dentro del scope del modulo.

### 7.1 Scope Default en NestJS (Singleton)

```typescript
// SINGLETON por defecto — una sola instancia compartida
@Injectable()
export class AuthService {
  // Esta instancia es compartida por TODOS los requests
  // Estado interno persiste entre requests
  constructor(
    @InjectRepository(User, 'auth')
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
}
```

### 7.2 Cuando Usar REQUEST Scope

Para multi-tenancy, gamilit requiere aislar datos por tenant. El scope `REQUEST` crea una nueva instancia por cada peticion HTTP:

```typescript
// REQUEST scope — nueva instancia por request
@Injectable({ scope: Scope.REQUEST })
export class TenantAwareService {
  constructor(
    @Inject(REQUEST)
    private readonly request: Request,
  ) {}

  getTenantId(): string {
    return this.request.user?.tenantId;
  }
}
```

> **Nota sobre rendimiento:** El scope `REQUEST` tiene impacto en rendimiento porque:
> 1. Crea una nueva instancia por cada request
> 2. Propaga el scope a todos los providers que lo inyectan
> 3. Impide caching de instancias
>
> En gamilit, la estrategia preferida es pasar `tenantId` como parametro en vez de usar
> REQUEST scope, evitando el overhead de instanciacion.

### 7.3 TRANSIENT Scope

El scope `TRANSIENT` crea una nueva instancia cada vez que es inyectado (no compartido):

```typescript
// TRANSIENT — nueva instancia por inyeccion
@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
  private context: string;

  setContext(context: string): void {
    this.context = context;
  }

  log(message: string): void {
    console.log(`[${this.context}] ${message}`);
  }
}
```

### Comparacion de Scopes

| Scope | Instancias | Compartido | Uso en gamilit |
|-------|-----------|-----------|----------------|
| `DEFAULT` (Singleton) | 1 por modulo | Si | 95% de los services |
| `REQUEST` | 1 por HTTP request | No | Casos especificos de tenancy |
| `TRANSIENT` | 1 por inyeccion | No | Loggers con contexto |

### Cuando Usar / Cuando NO Usar

| Usar Singleton (DEFAULT) | Usar REQUEST/TRANSIENT |
|--------------------------|----------------------|
| Services sin estado por request | Cuando necesitas datos del request actual |
| Repositorios y conexiones | Logger con contexto especifico |
| Configuracion compartida | Servicios que DEBEN aislarse por request |
| Caches en memoria | Cuando el singleton causa data leaks entre tenants |

---

## 8. Template Method Pattern

**Categoria GoF:** Comportamiento

**Descripcion:** El patron Template Method define el esqueleto de un algoritmo en una clase base, delegando algunos pasos a las subclases. Permite que las subclases redefinan ciertos pasos sin cambiar la estructura general del algoritmo. En gamilit, los base services del modulo ETL son el ejemplo mas claro.

### 8.1 TransformerBaseService en gamilit

El modulo ETL de gamilit utiliza una clase base abstracta que define el flujo de transformacion, delegando los pasos especificos a cada subclase:

```typescript
// apps/backend/src/modules/etl/services/transformers/transformer-base.service.ts
export abstract class TransformerBaseService<TSource, TTarget>
  implements ITransformer<TSource, TTarget>
{
  // TEMPLATE METHOD: Define el algoritmo completo
  async transform(data: TSource[], batchId: string): Promise<TransformationResult<TTarget>> {
    const startTime = Date.now();
    const transformed: TTarget[] = [];
    const rejected: RejectedRecord[] = [];

    // Paso 1: Validar datos (delegado a subclase)
    const validationResult = this.validate(data);

    // Paso 2: Procesar registros en batches
    for (const record of data) {
      // Paso 2a: Validar registro individual (delegado a subclase)
      const preValidation = this.validateRecord(record);
      if (!preValidation.isValid) {
        rejected.push({ /* ... */ });
        continue;
      }

      // Paso 2b: Transformar registro (delegado a subclase)
      const transformedRecord = await this.transformRecord(record);
      if (transformedRecord !== null) {
        transformed.push(transformedRecord);
      }
    }

    // Paso 3: Calcular estadisticas (implementado en base)
    return { transformed, rejected, stats: { /* ... */ } };
  }

  // Metodos abstractos — DEBEN ser implementados por subclases
  abstract validate(data: TSource[]): ValidationResult;
  protected abstract transformRecord(record: TSource): Promise<TTarget | null>;
  protected abstract validateRecord(record: TSource): PreValidationResult;

  // Metodos helper reutilizables (implementados en base)
  protected toUTC(date: Date | string): Date | null { /* ... */ }
  protected normalizeScore(score: number, maxScore: number): number { /* ... */ }
  protected normalizeString(str: string): string { /* ... */ }
}
```

### 8.2 Implementacion Concreta

```typescript
// Subclase que implementa los pasos especificos
@Injectable()
export class StudentProgressTransformer
  extends TransformerBaseService<OLTPStudentProgress, DWFactProgress>
{
  constructor() {
    super('StudentProgressTransformer');
  }

  // Implementa validacion especifica
  validate(data: OLTPStudentProgress[]): ValidationResult {
    const issues = [];
    if (data.some(r => !r.studentId)) {
      issues.push({ field: 'studentId', message: 'Falta studentId' });
    }
    return { isValid: issues.length === 0, issues };
  }

  // Implementa transformacion especifica
  protected async transformRecord(record: OLTPStudentProgress): Promise<DWFactProgress | null> {
    return {
      dateKey: this.getDateKey(new Date(record.completedAt)),
      studentKey: record.studentId,
      exerciseKey: record.exerciseId,
      scoreNormalized: this.normalizeScore(record.score, record.maxScore),
      timeSpentSeconds: record.timeSpent,
      attemptCount: record.attempts,
    };
  }

  // Implementa validacion de registro individual
  protected validateRecord(record: OLTPStudentProgress): PreValidationResult {
    if (!record.studentId) return invalidResult('Falta studentId', 'MISSING_FIELD', 'studentId');
    if (!record.exerciseId) return invalidResult('Falta exerciseId', 'MISSING_FIELD', 'exerciseId');
    return validResult();
  }
}
```

### 8.3 Base Services con Hooks (beforeCreate/afterCreate)

Patron para CRUD services con hooks que las subclases pueden sobreescribir:

```typescript
// Base CRUD service con hooks
export abstract class BaseCrudService<T> {
  constructor(protected readonly repository: Repository<T>) {}

  async create(dto: DeepPartial<T>): Promise<T> {
    // Hook pre-creacion (override opcional)
    await this.beforeCreate(dto);

    const entity = this.repository.create(dto);
    const saved = await this.repository.save(entity);

    // Hook post-creacion (override opcional)
    await this.afterCreate(saved);

    return saved;
  }

  // Hooks sobreescribibles — por defecto no hacen nada
  protected async beforeCreate(dto: DeepPartial<T>): Promise<void> { }
  protected async afterCreate(entity: T): Promise<void> { }

  // CRUD estandar ya implementado
  async findById(id: string): Promise<T | null> {
    return this.repository.findOne({ where: { id } as any });
  }

  async update(id: string, dto: DeepPartial<T>): Promise<T> {
    await this.beforeUpdate(id, dto);
    await this.repository.update(id, dto as any);
    const updated = await this.findById(id);
    await this.afterUpdate(updated);
    return updated;
  }

  protected async beforeUpdate(id: string, dto: DeepPartial<T>): Promise<void> { }
  protected async afterUpdate(entity: T): Promise<void> { }
}

// Implementacion concreta con hooks
@Injectable()
export class ExerciseService extends BaseCrudService<Exercise> {
  protected async afterCreate(exercise: Exercise): Promise<void> {
    // Hook: Notificar a maestros cuando se crea un ejercicio nuevo
    await this.notificationService.notifyTeachers(
      exercise.moduleId,
      `Nuevo ejercicio disponible: ${exercise.title}`,
    );
  }
}
```

### Cuando Usar / Cuando NO Usar

| Usar | NO Usar |
|------|---------|
| Algoritmos con estructura fija y pasos variables | Si cada subclase redefine TODO el algoritmo |
| ETL pipelines (extract, transform, load) | Cuando la herencia crea acoplamiento innecesario |
| CRUD services con hooks personalizables | Si la composicion (inyeccion) es mas clara |
| Batch processing con validacion comun | Para 2-3 clases sin estructura compartida |

---

## 9. Repository Pattern

**Categoria GoF:** Estructural (tambien considerado patron de arquitectura)

**Descripcion:** El patron Repository abstrae la capa de acceso a datos, proporcionando una interfaz de coleccion para acceder a objetos de dominio. Encapsula la logica de persistencia (SQL, NoSQL, cache) detras de una interfaz limpia.

> **Documentacion completa:** Este patron esta documentado en detalle en
> `docs/40-standards/backend-profesional/03-repository-pattern.md`, que cubre:
> - Interfaz base generica (`IRepository<T, ID>`)
> - Interfaces especificas con metodos de dominio
> - Implementacion con TypeORM
> - Specification pattern para consultas complejas
> - Unit of Work pattern
> - Testing de repositories
>
> Consultar ese documento para la referencia completa.

### Resumen Rapido

```typescript
// Interfaz (puerto secundario)
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
  delete(id: string): Promise<void>;
}

// Implementacion (adaptador secundario)
@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly repository: Repository<UserOrmEntity>,
  ) {}
  // ... implementacion
}

// Registro en modulo
@Module({
  providers: [
    { provide: 'IUserRepository', useClass: TypeOrmUserRepository },
  ],
})
```

En gamilit, 152 entities mapean a repositories via TypeORM `Repository<Entity>`, organizados en 10 datasources (uno por schema de PostgreSQL).

---

## 10. Patrones en Frontend (React 19)

Esta seccion cubre brevemente los patrones de diseno aplicados en el frontend de gamilit (`apps/frontend/src/`).

### 10.1 Compound Components

**Categoria:** Estructural

Los Compound Components permiten crear componentes relacionados que comparten estado implicito:

```tsx
// Ejemplo: Componente de Exercise con sub-componentes
// apps/frontend/src/features/exercises/components/
<Exercise moduleId="literal">
  <Exercise.Header />
  <Exercise.Content>
    <Exercise.Question />
    <Exercise.Options />
  </Exercise.Content>
  <Exercise.Footer>
    <Exercise.SubmitButton />
    <Exercise.Timer />
  </Exercise.Footer>
</Exercise>
```

**Implementacion con Context:**

```tsx
const ExerciseContext = createContext<ExerciseState | null>(null);

function Exercise({ children, moduleId }: ExerciseProps) {
  const [state, dispatch] = useReducer(exerciseReducer, initialState);

  return (
    <ExerciseContext.Provider value={{ state, dispatch, moduleId }}>
      <div className="exercise-container">{children}</div>
    </ExerciseContext.Provider>
  );
}

// Sub-componentes acceden al contexto compartido
Exercise.Header = function ExerciseHeader() {
  const { state } = useContext(ExerciseContext);
  return <h2>{state.currentExercise.title}</h2>;
};
```

### 10.2 Custom Hooks como Strategy Pattern

Los custom hooks de gamilit (102 hooks) implementan el patron Strategy para logica reutilizable:

```tsx
// Hook como estrategia de autenticacion
function useAuth() {
  const { user, login, logout } = useContext(AuthContext);
  return { user, login, logout, isAuthenticated: !!user };
}

// Hook como estrategia de gamificacion
function useXP() {
  const { data: xpData } = useQuery(['user-xp'], fetchUserXP);
  return { xp: xpData?.xp, rank: xpData?.rank, nextRankXP: xpData?.nextRankXP };
}

// Hook como estrategia de ejercicios (cambia segun tipo)
function useExerciseLogic(exerciseType: ExerciseType) {
  // Selecciona la estrategia segun el tipo de ejercicio
  switch (exerciseType) {
    case 'multiple-choice': return useMultipleChoiceLogic();
    case 'drag-and-drop': return useDragAndDropLogic();
    case 'fill-in-blank': return useFillInBlankLogic();
    // ... 23 tipos de ejercicio
  }
}
```

### 10.3 Zustand Slices como State Pattern

gamilit usa 14 stores Zustand para estado de cliente. Las slices representan el patron State:

```tsx
// Store con slices — patron State
import { create } from 'zustand';

interface AuthSlice {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  logout: () => void;
}

interface GamificationSlice {
  xp: number;
  rank: string;
  achievements: Achievement[];
  addXP: (amount: number) => void;
}

// Cada slice gestiona su propio estado
const useAppStore = create<AuthSlice & GamificationSlice>((set, get) => ({
  // Auth slice
  user: null,
  isAuthenticated: false,
  login: async (credentials) => { /* ... */ },
  logout: () => set({ user: null, isAuthenticated: false }),

  // Gamification slice
  xp: 0,
  rank: 'Estudiante',
  achievements: [],
  addXP: (amount) => set((state) => ({ xp: state.xp + amount })),
}));
```

### 10.4 React Query como Cache-Aside Pattern

React Query implementa Cache-Aside (Lazy Loading) para datos del servidor:

```tsx
// Cache-Aside: Primero busca en cache, si no existe va al servidor
function useStudentProgress(studentId: string) {
  return useQuery({
    queryKey: ['student-progress', studentId],
    queryFn: () => progressAPI.getStudentProgress(studentId),
    staleTime: 5 * 60 * 1000,    // 5 minutos antes de considerar stale
    cacheTime: 30 * 60 * 1000,   // 30 minutos en cache
    refetchOnWindowFocus: true,   // Refrescar al volver a la ventana
  });
}

// Mutacion con invalidacion de cache
function useCompleteExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CompleteExerciseDto) => exerciseAPI.complete(dto),
    onSuccess: (data, variables) => {
      // Invalidar caches relacionados
      queryClient.invalidateQueries({ queryKey: ['student-progress'] });
      queryClient.invalidateQueries({ queryKey: ['user-xp'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}
```

### Resumen de Patrones Frontend

| Patron | Implementacion en gamilit | Cantidad |
|--------|--------------------------|----------|
| Compound Components | Ejercicios, Dashboard, Formularios | ~15 conjuntos |
| Custom Hooks (Strategy) | Hooks de feature, auth, gamificacion | 102 hooks |
| Zustand (State) | Auth, UI, gamificacion, preferencias | 14 stores |
| React Query (Cache-Aside) | Todos los datos del servidor | 52 API files, 662 calls |
| Provider Pattern | AuthContext, ThemeProvider | 4 providers |

---

## Resumen General

### Matriz de Patrones por Capa

| Patron | Domain | Application | Infrastructure | Frontend |
|--------|--------|-------------|---------------|----------|
| Factory | - | useFactory, DynamicModule | Datasource factories | - |
| Strategy | - | Guards (15) | Passport Strategies | Custom Hooks |
| Adapter | - | - | TypeORM Repos, RedisIoAdapter | - |
| Decorator | - | @Roles, @CurrentUser | @Controller, @Entity | - |
| Observer | Domain Events | EventEmitter2 | @OnEvent listeners | - |
| Builder | - | QueryBuilder | - | - |
| Singleton | - | @Injectable (default) | - | Zustand stores |
| Template Method | - | Base Services | TransformerBase | - |
| Repository | Interfaces | - | TypeORM implementation | - |

### Checklist de Patrones

- [ ] Factories usadas para configuracion con dependencias (no hardcoded)
- [ ] Guards implementan `CanActivate` con responsabilidad unica
- [ ] Adaptadores secundarios implementan interfaces de dominio
- [ ] Decoradores custom son composables y reutilizables
- [ ] Eventos de dominio usados para desacoplar modulos
- [ ] QueryBuilder usado para consultas con >3 filtros opcionales
- [ ] Singleton como scope default; REQUEST/TRANSIENT solo cuando necesario
- [ ] Base services con hooks para codigo DRY
- [ ] Repositories abstraen persistencia detras de interfaces
- [ ] Frontend usa React Query para server state, Zustand para client state
