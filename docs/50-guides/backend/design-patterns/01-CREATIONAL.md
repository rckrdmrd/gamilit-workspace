---
titulo: Patrones Creacionales en NestJS (Factory, Builder, Singleton)
version: 1.0.0
fecha_creacion: 2026-02-14
tags: [patrones, gof, nestjs, typescript, creacional]
aplica_a: [backend]
estado: vigente
origen: GUIA-DESIGN-PATTERNS-NESTJS.md
seccion: "Secciones 1, 6, 7"
---

# Patrones Creacionales en NestJS (Factory, Builder, Singleton)

> **Aplica a:** `apps/backend/src/` | **Stack:** NestJS 11, TypeORM 0.3.x, TypeScript 5.x

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
