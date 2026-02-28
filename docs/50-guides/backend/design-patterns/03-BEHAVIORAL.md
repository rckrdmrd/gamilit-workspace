---
titulo: Patrones de Comportamiento en NestJS (Strategy, Observer, Template Method)
version: 1.0.0
fecha_creacion: 2026-02-14
tags: [patrones, gof, nestjs, typescript, comportamiento]
aplica_a: [backend]
estado: vigente
origen: GUIA-DESIGN-PATTERNS-NESTJS.md
seccion: "Secciones 2, 5, 8"
---

# Patrones de Comportamiento en NestJS (Strategy, Observer, Template Method)

> **Aplica a:** `apps/backend/src/` | **Stack:** NestJS 11, TypeORM 0.3.x, TypeScript 5.x

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
