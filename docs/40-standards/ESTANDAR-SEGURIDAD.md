---
titulo: Estandar de Seguridad
tipo: estandar-workspace
scope: workspace
version: 2.0.0
fecha_creacion: 2026-02-02
ultima_actualizacion: 2026-02-27
herencia: |
  Este estandar aplica a nivel WORKSPACE.
  Los proyectos pueden EXTENDER (no contradecir) con estandares locales.
  Ejemplo: workspace-projects/projects/{proyecto}/docs/SECURITY-STANDARDS.md para requisitos especificos.
tags:
  - seguridad
  - owasp
  - autenticacion
  - autorizacion
  - nestjs
  - typescript
---

# Estandar de Seguridad

> Lineamientos de seguridad basados en OWASP Top 10, mejores practicas de autenticacion, autorizacion y proteccion de datos

---

## 1. OWASP Top 10 (2021)

> Referencia oficial: https://owasp.org/Top10/

### 1.1 A01: Broken Access Control

**Riesgo:** Usuarios acceden a recursos no autorizados.

**Mitigacion:**

```typescript
// CORRECTO: Validar permisos en cada operacion
@Injectable()
export class ProjectService {
  async findById(projectId: string, userId: string): Promise<Project> {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    // Validar que el usuario tiene acceso
    const hasAccess = await this.accessControlService.canAccess(
      userId,
      project.id,
      'project:read'
    );

    if (!hasAccess) {
      throw new ForbiddenException('No tiene permisos para acceder a este proyecto');
    }

    return project;
  }
}

// INCORRECTO: Confiar solo en el ID del request
@Get(':id')
async findById(@Param('id') id: string): Promise<Project> {
  return this.projectRepository.findById(id); // Sin validar permisos
}
```

**Controles obligatorios:**
- Denegar por defecto
- Validar permisos en cada endpoint
- Implementar RBAC
- Registrar intentos de acceso no autorizado

---

### 1.2 A02: Cryptographic Failures

**Riesgo:** Exposicion de datos sensibles por criptografia debil o inexistente.

**Mitigacion:**

```typescript
// CORRECTO: Usar bcrypt con cost adecuado
import * as bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 12; // Minimo recomendado

@Injectable()
export class PasswordService {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

// INCORRECTO: Usar algoritmos obsoletos
import * as crypto from 'crypto';
const hash = crypto.createHash('md5').update(password).digest('hex'); // PROHIBIDO
const hash = crypto.createHash('sha1').update(password).digest('hex'); // PROHIBIDO
```

**Reglas:**
- **PROHIBIDO:** MD5, SHA1 para passwords
- **OBLIGATORIO:** bcrypt con cost >= 12
- **SENSIBLE:** Encriptar datos PII en reposo (AES-256)
- **TRANSMISION:** Solo HTTPS (TLS 1.2+)

---

### 1.3 A03: Injection

**Riesgo:** Codigo malicioso ejecutado via input del usuario.

**Mitigacion:**

```typescript
// CORRECTO: Queries parametrizadas con TypeORM
@Injectable()
export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return this.repository
      .createQueryBuilder('user')
      .where('user.email = :email', { email }) // Parametro seguro
      .getOne();
  }

  async searchByName(name: string): Promise<User[]> {
    return this.repository
      .createQueryBuilder('user')
      .where('user.name ILIKE :name', { name: `%${name}%` })
      .getMany();
  }
}

// INCORRECTO: Concatenacion de strings (SQL Injection)
async findByEmail(email: string): Promise<User> {
  return this.repository.query(
    `SELECT * FROM users WHERE email = '${email}'` // VULNERABLE
  );
}
```

**Controles:**
- Usar ORM con parametros
- Validar y sanitizar todo input
- Escapar caracteres especiales
- Usar prepared statements

---

### 1.4 A04: Insecure Design

**Riesgo:** Fallas de seguridad por diseno deficiente.

**Mitigacion:**

```typescript
// CORRECTO: Threat modeling desde el diseno
interface SecurityRequirements {
  authentication: 'jwt' | 'session';
  authorization: 'rbac' | 'abac';
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
  auditLevel: 'none' | 'basic' | 'full';
}

// Definir requisitos de seguridad por modulo
const moduleSecurityConfig: SecurityRequirements = {
  authentication: 'jwt',
  authorization: 'rbac',
  dataClassification: 'confidential',
  auditLevel: 'full',
};
```

**Proceso obligatorio:**
1. Threat modeling antes de implementar
2. Identificar activos sensibles
3. Definir boundaries de confianza
4. Documentar supuestos de seguridad

---

### 1.5 A05: Security Misconfiguration

**Riesgo:** Configuraciones por defecto o incompletas.

**Mitigacion:**

```typescript
// CORRECTO: Configuracion segura de CORS
@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production', 'test').required(),
        JWT_SECRET: Joi.string().min(32).required(),
        JWT_EXPIRATION: Joi.string().required(),
        CORS_ORIGINS: Joi.string().required(),
      }),
    }),
  ],
})
export class AppModule {}

// main.ts - Configuracion segura
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS restrictivo
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || [],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  });

  // Deshabilitar headers que exponen informacion
  app.getHttpAdapter().getInstance().disable('x-powered-by');
}
```

**Checklist:**
- [ ] Deshabilitar debug en produccion
- [ ] Remover endpoints de prueba
- [ ] Configurar CORS restrictivo
- [ ] No usar credenciales por defecto
- [ ] Ocultar headers que revelan tecnologia

---

### 1.6 A06: Vulnerable and Outdated Components

**Riesgo:** Dependencias con vulnerabilidades conocidas.

**Mitigacion:**

```bash
# Auditoria regular de dependencias
npm audit
npm audit fix

# Usar Snyk para monitoreo continuo
npx snyk test

# Actualizar dependencias
npm outdated
npm update
```

```json
// package.json - Definir politica de versiones
{
  "scripts": {
    "security:audit": "npm audit --audit-level=high",
    "security:check": "snyk test",
    "preinstall": "npm audit --audit-level=critical"
  }
}
```

**Politica:**
- Ejecutar `npm audit` en cada CI/CD
- Vulnerabilidades criticas: corregir en 24h
- Vulnerabilidades altas: corregir en 7 dias
- Actualizar dependencias mensualmente

---

### 1.7 A07: Identification and Authentication Failures

**Riesgo:** Autenticacion debil permite acceso no autorizado.

**Mitigacion:**

```typescript
// CORRECTO: Rate limiting para login
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // 1 minuto
          limit: 5,   // 5 intentos por minuto
        },
      ],
    }),
  ],
})
export class AuthModule {}

@Controller('auth')
export class AuthController {
  @Post('login')
  @UseGuards(ThrottlerGuard)
  async login(@Body() credentials: LoginDto): Promise<TokenResponse> {
    return this.authService.login(credentials);
  }
}

// Validacion de password fuerte
export class RegisterDto {
  @IsString()
  @MinLength(12)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: 'Password debe contener mayusculas, minusculas, numeros y caracteres especiales' }
  )
  password: string;
}
```

**Controles obligatorios:**
- MFA para cuentas privilegiadas
- Rate limiting en login (max 5 intentos/minuto)
- Bloqueo temporal tras 10 intentos fallidos
- Passwords: minimo 12 caracteres, complejidad requerida

---

### 1.8 A08: Software and Data Integrity Failures

**Riesgo:** Codigo o datos modificados sin verificacion.

**Mitigacion:**

```json
// package-lock.json - Siempre commitear
// Verificar integridad en CI/CD

// .npmrc - Configurar registro seguro
{
  "scripts": {
    "postinstall": "npm audit signatures"
  }
}
```

```typescript
// Verificar integridad de datos criticos
@Injectable()
export class DataIntegrityService {
  async verifyChecksum(data: Buffer, expectedHash: string): Promise<boolean> {
    const hash = crypto.createHash('sha256').update(data).digest('hex');
    return crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(expectedHash)
    );
  }
}
```

**Controles:**
- Lockfiles en control de versiones
- Verificar firmas de paquetes
- Subresource Integrity (SRI) para CDN
- Code signing en releases

---

### 1.9 A09: Security Logging and Monitoring Failures

**Riesgo:** Ataques no detectados por falta de logging.

**Mitigacion:**

```typescript
// CORRECTO: Logging de acciones sensibles
@Injectable()
export class AuditService {
  constructor(private readonly logger: Logger) {}

  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    await this.logger.log({
      timestamp: new Date().toISOString(),
      type: event.type,
      userId: event.userId,
      action: event.action,
      resource: event.resource,
      ip: event.ip,
      userAgent: event.userAgent,
      success: event.success,
      details: event.details,
    });
  }
}

// Interceptor para auditar automaticamente
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => this.logSuccess(request, startTime),
        error: (error) => this.logError(request, error, startTime),
      }),
    );
  }
}
```

**Eventos a registrar obligatoriamente:**
- Login exitoso/fallido
- Cambios de password
- Cambios de permisos
- Acceso a datos sensibles
- Operaciones CRUD en entidades criticas
- Errores 4xx y 5xx

---

### 1.10 A10: Server-Side Request Forgery (SSRF)

**Riesgo:** Servidor manipulado para hacer requests a recursos internos.

**Mitigacion:**

```typescript
// CORRECTO: Validar URLs externas
import { URL } from 'url';

@Injectable()
export class UrlValidationService {
  private readonly allowedDomains = ['api.example.com', 'cdn.example.com'];
  private readonly blockedPrefixes = ['127.', '10.', '192.168.', '172.16.', 'localhost'];

  validateExternalUrl(urlString: string): void {
    const url = new URL(urlString);

    // Bloquear IPs internas
    for (const prefix of this.blockedPrefixes) {
      if (url.hostname.startsWith(prefix)) {
        throw new BadRequestException('URL interna no permitida');
      }
    }

    // Validar protocolo
    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new BadRequestException('Protocolo no permitido');
    }

    // Whitelist de dominios (si aplica)
    if (this.allowedDomains.length > 0 && !this.allowedDomains.includes(url.hostname)) {
      throw new BadRequestException('Dominio no permitido');
    }
  }
}

// Uso en servicio
@Injectable()
export class WebhookService {
  constructor(
    private readonly urlValidator: UrlValidationService,
    private readonly httpService: HttpService,
  ) {}

  async sendWebhook(targetUrl: string, payload: object): Promise<void> {
    this.urlValidator.validateExternalUrl(targetUrl);
    await this.httpService.post(targetUrl, payload).toPromise();
  }
}
```

**Controles:**
- Whitelist de dominios permitidos
- Bloquear rangos de IP internos
- No resolver DNS antes de validar
- Timeout y limites de tamano

---

## 1B. OWASP API Security Top 10 (2023)

> Referencia oficial: https://owasp.org/API-Security/
>
> Las APIs representan la superficie de ataque principal en aplicaciones modernas. gamilit expone 912 endpoints REST que requieren proteccion especifica mas alla del OWASP Top 10 web tradicional. Esta seccion cubre los 10 riesgos criticos de seguridad en APIs segun OWASP 2023, con ejemplos concretos del stack NestJS 11 + TypeORM + PostgreSQL de gamilit.

---

### 1B.1 API1:2023 — Broken Object Level Authorization (BOLA)

**Riesgo:** Un atacante manipula IDs de recursos en los endpoints para acceder a objetos de otros tenants o usuarios. En un sistema multi-tenant como gamilit, esto permite a un estudiante ver datos de otro estudiante o de otra organizacion educativa.

**Mitigacion en gamilit:**

```typescript
// apps/backend/src/shared/guards/resource-ownership.guard.ts
// Guard que verifica que el usuario sea dueno del recurso
@Injectable()
export class ResourceOwnershipGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('No user authenticated');
    }

    // Administradores pueden acceder a todo
    if (user.role === 'super_admin' || user.role === 'admin') {
      return true;
    }

    // Extraer ID del recurso y comparar con el usuario autenticado
    const resourceUserId = this.extractResourceUserId(request);
    const currentUserId = user.sub || user.id || user.userId;

    if (resourceUserId !== currentUserId) {
      throw new ForbiddenException(
        'You do not have permission to access this resource',
      );
    }

    return true;
  }
}

// Uso en controller de progreso de estudiantes
@Controller('students')
@UseGuards(JwtAuthGuard, ResourceOwnershipGuard)
export class StudentProgressController {
  @Get(':userId/progress')
  @OwnershipField('userId')
  async getProgress(@Param('userId') userId: string) {
    return this.progressService.getStudentProgress(userId);
  }
}
```

```sql
-- apps/database/ddl/07-enable-rls.sql
-- RLS como segunda capa de defensa: el estudiante solo ve datos de su tenant
ALTER TABLE gamilit.student_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY student_progress_tenant_isolation ON gamilit.student_progress
  FOR ALL
  USING (
    tenant_id = current_setting('app.current_tenant_id')::uuid
  );
```

**Controles obligatorios:**
- Usar `ResourceOwnershipGuard` en endpoints que acceden a recursos por ID
- Aplicar RLS en PostgreSQL como segunda capa de defensa (418 politicas activas)
- Validar `tenant_id` en cada consulta que cruza boundaries de organizacion
- Registrar en audit log todo intento de acceso cross-tenant
- Nunca confiar solo en el ID del request; siempre cruzar con el JWT

---

### 1B.2 API2:2023 — Broken Authentication

**Riesgo:** Mecanismos de autenticacion debiles permiten a atacantes asumir la identidad de otros usuarios. Tokens sin expiracion, ausencia de rotacion de refresh tokens, o endpoints de autenticacion sin rate limiting son vectores comunes.

**Mitigacion en gamilit:**

```typescript
// apps/backend/src/modules/auth/ — AuthModule con JWT + Passport
// Access tokens de vida corta + refresh token rotation
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(user: UserEntity): Promise<TokenPair> {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    // Access token: vida corta (15 minutos)
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    // Refresh token: vida moderada (7 dias) con rotacion
    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { expiresIn: '7d' },
    );

    // Almacenar hash del refresh token (nunca el token en claro)
    await this.storeRefreshTokenHash(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async refreshAccessToken(oldRefreshToken: string): Promise<TokenPair> {
    // Verificar validez del refresh token
    const decoded = this.jwtService.verify(oldRefreshToken);

    // Invalidar el refresh token anterior (rotacion)
    await this.invalidateRefreshToken(decoded.sub, oldRefreshToken);

    // Generar nuevo par de tokens
    const user = await this.usersService.findById(decoded.sub);
    return this.generateTokens(user);
  }
}
```

```typescript
// apps/backend/src/modules/auth/guards/jwt-auth.guard.ts
// Guard global que protege todos los endpoints autenticados
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    // Verificar expiracion, firma y claims del JWT
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any): any {
    if (err || !user) {
      throw new UnauthorizedException(
        'Token invalido o expirado. Inicie sesion nuevamente.',
      );
    }
    return user;
  }
}
```

**Controles obligatorios:**
- Access tokens con expiracion maxima de 15 minutos
- Refresh tokens con rotacion obligatoria (invalidar el anterior al renovar)
- Almacenar refresh tokens hasheados (bcrypt), nunca en texto plano
- Rate limiting en `/auth/login` (maximo 5 intentos por minuto)
- Bloqueo temporal de cuenta tras 10 intentos fallidos consecutivos
- Registrar todos los eventos de autenticacion (login exitoso/fallido)

---

### 1B.3 API3:2023 — Broken Object Property Level Authorization (BOPLA)

**Riesgo:** La API expone propiedades de objetos que el usuario no deberia ver o modificar. Un estudiante podria enviar `{ "role": "super_admin" }` en un request de actualizacion de perfil y escalar privilegios si el backend no filtra propiedades.

**Mitigacion en gamilit:**

```typescript
// ValidationPipe global en apps/backend/src/main.ts
// gamilit usa whitelist + forbidNonWhitelisted para filtrar propiedades no autorizadas
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,            // Elimina propiedades no decoradas en el DTO
    forbidNonWhitelisted: true, // Lanza error si envian propiedades no permitidas
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);

// Ejemplo: DTO de actualizacion de perfil de estudiante
// Solo permite campos especificos — 'role' y 'tenantId' NO estan decorados
export class UpdateStudentProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string;

  // NOTA: 'role', 'tenantId', 'xp', 'mlCoins' NO se incluyen
  // ValidationPipe con whitelist los eliminara automaticamente
  // forbidNonWhitelisted lanzara BadRequestException si se envian
}

// DTO de respuesta: excluir datos sensibles con class-transformer
export class StudentResponseDto {
  @Expose() id: string;
  @Expose() displayName: string;
  @Expose() avatarUrl: string;
  @Expose() currentRank: string;
  @Expose() xp: number;

  @Exclude() email: string;        // No exponer a otros estudiantes
  @Exclude() tenantId: string;     // Dato interno
  @Exclude() passwordHash: string; // Nunca exponer
  @Exclude() refreshTokenHash: string;
}
```

**Controles obligatorios:**
- `whitelist: true` en ValidationPipe global (activo en gamilit)
- `forbidNonWhitelisted: true` para rechazar propiedades no declaradas
- DTOs separados para crear, actualizar y responder (399 DTOs en gamilit)
- Usar `@Exclude()` de class-transformer en propiedades sensibles de respuesta
- Nunca retornar entities directamente; siempre mapear a DTOs de respuesta
- Campos sensibles (`role`, `tenantId`, `permissions`) solo modificables por admin

---

### 1B.4 API4:2023 — Unrestricted Resource Consumption

**Riesgo:** La API no limita la cantidad de requests, tamano de payloads, o recursos computacionales consumidos. Un atacante puede causar DoS enviando miles de requests, payloads enormes, o consultas que generan procesamiento excesivo (e.g., pedir todos los ejercicios de todos los modulos sin paginacion).

**Mitigacion en gamilit:**

```typescript
// Rate limiting con @nestjs/throttler
// Configuracion recomendada para gamilit
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: 1000,   // 1 segundo
          limit: 3,    // 3 requests por segundo
        },
        {
          name: 'medium',
          ttl: 10000,  // 10 segundos
          limit: 20,   // 20 requests por 10 segundos
        },
        {
          name: 'long',
          ttl: 60000,  // 1 minuto
          limit: 100,  // 100 requests por minuto
        },
      ],
    }),
  ],
})
export class AppModule {}

// Limites especificos por endpoint critico
@Controller('gamification')
export class GamificationController {
  // Endpoint de calculo de XP: limitar agresivamente
  @Post('xp/calculate')
  @Throttle({ short: { limit: 1, ttl: 2000 } }) // 1 request cada 2 segundos
  @UseGuards(JwtAuthGuard)
  async calculateXp(@Body() dto: CalculateXpDto) {
    return this.gamificationService.calculateXp(dto);
  }

  // Endpoint de compra con ML Coins: limitar para prevenir abuso
  @Post('store/purchase')
  @Throttle({ short: { limit: 2, ttl: 5000 } }) // 2 compras cada 5 segundos
  @UseGuards(JwtAuthGuard, ResourceOwnershipGuard)
  async purchase(@Body() dto: PurchaseItemDto) {
    return this.storeService.processPurchase(dto);
  }
}

// Paginacion obligatoria en endpoints de listado
export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)  // Maximo 100 items por pagina
  limit?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}
```

**Controles obligatorios:**
- Rate limiting global configurado con `@nestjs/throttler`
- Limites agresivos en endpoints de gamificacion (XP, ML Coins, logros)
- Paginacion obligatoria en todos los endpoints de listado (`limit` maximo 100)
- Limitar tamano de payload con `app.use(json({ limit: '1mb' }))` en `main.ts`
- Timeout de queries en TypeORM para prevenir consultas lentas
- Monitorear consumo por tenant para detectar patrones anomalos

---

### 1B.5 API5:2023 — Broken Function Level Authorization (BFLA)

**Riesgo:** Un usuario con rol de estudiante accede a endpoints administrativos o de maestro porque la autorizacion a nivel de funcion/endpoint no esta implementada o es inconsistente. En gamilit, un estudiante no debe poder acceder a endpoints de `/admin/*` o `/teacher/*`.

**Mitigacion en gamilit:**

```typescript
// apps/backend/src/shared/decorators/roles.decorator.ts
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// apps/backend/src/modules/auth/guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    return requiredRoles.some((role) => user.role === role);
  }
}

// Uso en controllers con segregacion clara por portal
// apps/backend/src/modules/admin/guards/admin.guard.ts — protege portal admin
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'admin_teacher')
export class AdminUsersController {
  @Delete(':id')
  @Roles('super_admin') // Solo super_admin puede eliminar usuarios
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }
}

// apps/backend/src/modules/teacher/guards/teacher.guard.ts — protege portal maestro
@Controller('teacher/classrooms')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin_teacher')
export class TeacherClassroomsController {
  @Post()
  async createClassroom(@Body() dto: CreateClassroomDto) {
    return this.classroomService.create(dto);
  }
}
```

**Controles obligatorios:**
- `RolesGuard` aplicado a nivel de clase en todos los controllers protegidos
- `@Roles()` decorator con roles especificos por endpoint (15 guards en gamilit)
- Segregacion de controllers por portal: `/admin/*`, `/teacher/*`, `/student/*`
- Roles definidos en `GamilityRoleEnum`: `student`, `admin_teacher`, `super_admin`
- Denegar por defecto: endpoints sin `@Roles()` explicito deben requerir autenticacion
- Tests automatizados que verifican que endpoints admin retornan 403 para estudiantes

---

### 1B.6 API6:2023 — Unrestricted Access to Sensitive Business Flows

**Riesgo:** Flujos de negocio criticos pueden ser abusados cuando no se limita su uso. En gamilit, esto incluye: calculo de XP (inflacion artificial), transacciones de ML Coins (economia virtual), generacion de logros, y envio masivo de notificaciones.

**Mitigacion en gamilit:**

```typescript
// Rate limiting especifico para flujos criticos de gamificacion
// apps/backend/src/modules/notifications/guards/rate-limit.guard.ts
@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.sub;
    const endpoint = request.route?.path;

    const key = `rate:${endpoint}:${userId}`;
    const count = await this.redisService.incr(key);

    if (count === 1) {
      await this.redisService.expire(key, 60); // TTL 1 minuto
    }

    if (count > this.getLimit(endpoint)) {
      throw new TooManyRequestsException(
        'Limite de operaciones excedido. Intente en un momento.',
      );
    }

    return true;
  }

  private getLimit(endpoint: string): number {
    // Limites por flujo de negocio
    const limits: Record<string, number> = {
      '/gamification/xp/award': 10,       // 10 XP awards por minuto
      '/gamification/coins/transfer': 5,  // 5 transferencias por minuto
      '/gamification/achievements/claim': 3, // 3 claims por minuto
      '/notifications/send': 20,          // 20 notificaciones por minuto
    };
    return limits[endpoint] || 60;
  }
}

// Validacion de reglas de negocio en el servicio
@Injectable()
export class GamificationXpService {
  async awardXp(studentId: string, amount: number, source: string): Promise<void> {
    // Validar limites diarios de XP
    const todayXp = await this.getTodayXp(studentId);
    const MAX_DAILY_XP = 500;

    if (todayXp + amount > MAX_DAILY_XP) {
      throw new BadRequestException(
        `Limite diario de XP alcanzado (${MAX_DAILY_XP}). Vuelve manana.`,
      );
    }

    // Validar que la fuente es legitima
    const validSources = ['exercise_complete', 'mission_complete', 'daily_login', 'achievement'];
    if (!validSources.includes(source)) {
      throw new BadRequestException('Fuente de XP no valida');
    }

    await this.xpRepository.award(studentId, amount, source);
  }
}
```

**Controles obligatorios:**
- Rate limiting por usuario en flujos de gamificacion (XP, ML Coins, logros)
- Limites diarios configurables para XP y ML Coins por estudiante
- Validar fuentes legitimas de XP (solo exercise_complete, mission_complete, etc.)
- Registrar todas las transacciones economicas (ML Coins) en audit log
- Alertas automaticas ante patrones anomalos (e.g., estudiante gana XP 10x mas rapido)
- Usar Redis para contadores atomicos de rate limiting

---

### 1B.7 API7:2023 — Server Side Request Forgery (SSRF)

**Riesgo:** Un atacante manipula la API para que el servidor realice requests a recursos internos no autorizados. En gamilit, esto puede ocurrir al procesar URLs de avatares, contenido multimedia externo, o integraciones LTI que aceptan URLs configurables.

**Mitigacion en gamilit:**

```typescript
// Servicio de validacion de URLs para contenido multimedia
// apps/backend/src/modules/content/ — validar URLs de media_files
@Injectable()
export class UrlValidationService {
  private readonly BLOCKED_HOSTS = [
    'localhost', '127.0.0.1', '0.0.0.0',
    '169.254.169.254', // AWS metadata
    'metadata.google.internal', // GCP metadata
  ];

  private readonly BLOCKED_CIDRS = [
    '10.0.0.0/8',      // RFC 1918
    '172.16.0.0/12',   // RFC 1918
    '192.168.0.0/16',  // RFC 1918
    '127.0.0.0/8',     // Loopback
    '::1/128',         // IPv6 loopback
  ];

  private readonly ALLOWED_PROTOCOLS = ['https:'];

  validateExternalUrl(urlString: string): void {
    let url: URL;
    try {
      url = new URL(urlString);
    } catch {
      throw new BadRequestException('URL con formato invalido');
    }

    // Solo HTTPS en produccion
    if (!this.ALLOWED_PROTOCOLS.includes(url.protocol)) {
      throw new BadRequestException(
        'Solo se permiten URLs con protocolo HTTPS',
      );
    }

    // Bloquear hosts internos
    if (this.BLOCKED_HOSTS.includes(url.hostname)) {
      throw new BadRequestException('URL a host interno no permitida');
    }

    // Bloquear IPs en rangos privados
    if (this.isPrivateIp(url.hostname)) {
      throw new BadRequestException('URL a IP privada no permitida');
    }

    // Bloquear puertos no estandar
    if (url.port && !['443', '80'].includes(url.port)) {
      throw new BadRequestException('Puerto no permitido en URL externa');
    }
  }

  private isPrivateIp(hostname: string): boolean {
    const ipParts = hostname.split('.').map(Number);
    if (ipParts.length !== 4 || ipParts.some(isNaN)) return false;

    return (
      ipParts[0] === 10 ||
      (ipParts[0] === 172 && ipParts[1] >= 16 && ipParts[1] <= 31) ||
      (ipParts[0] === 192 && ipParts[1] === 168) ||
      ipParts[0] === 127
    );
  }
}

// Uso al subir contenido multimedia
@Controller('content/media')
export class MediaController {
  @Post('from-url')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin_teacher')
  async importFromUrl(@Body() dto: ImportMediaUrlDto) {
    // Validar URL antes de hacer fetch
    this.urlValidationService.validateExternalUrl(dto.sourceUrl);
    return this.mediaService.importFromUrl(dto);
  }
}
```

**Controles obligatorios:**
- Validar toda URL externa antes de realizar fetch desde el servidor
- Bloquear IPs privadas (RFC 1918), loopback, y metadatos cloud (169.254.169.254)
- Solo permitir protocolos HTTPS en produccion
- Whitelist de dominios si el caso de uso lo permite
- No resolver DNS antes de validar (prevenir DNS rebinding)
- Timeout agresivo (5 segundos) y limite de tamano en responses externas

---

### 1B.8 API8:2023 — Security Misconfiguration

**Riesgo:** Configuraciones por defecto, headers faltantes, CORS permisivo, Swagger expuesto en produccion, o mensajes de error verbosos revelan informacion que facilita ataques.

**Mitigacion en gamilit:**

```typescript
// apps/backend/src/main.ts — Configuracion de seguridad de gamilit

// 1. Helmet para security headers
import helmet from 'helmet';
app.use(helmet());

// 2. CORS restrictivo — solo origenes configurados
const corsOrigin = configService.get<string>('app.corsOrigin');
const allowedOrigins = corsOrigin.split(',').map(origin => origin.trim());
app.enableCors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // Server-to-server
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id'],
});

// 3. Swagger: configurar segun ambiente
// En produccion (74.208.126.102): Swagger DESHABILITADO
// En desarrollo (localhost:3006): Swagger HABILITADO
if (nodeEnv !== 'production') {
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${API_PREFIX}/${API_VERSION}/docs`, app, document);
}

// 4. ValidationPipe global con whitelist
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);

// 5. Filtro global de excepciones — NO exponer stack traces en produccion
// apps/backend/src/shared/filters/http-exception.filter.ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : 500;

    response.status(status).json({
      statusCode: status,
      message: status === 500
        ? 'Error interno del servidor' // Mensaje generico en prod
        : (exception as any).message,
      // NUNCA incluir stack trace en produccion
      ...(process.env.NODE_ENV === 'development' && {
        stack: (exception as Error).stack,
      }),
    });
  }
}
```

**Controles obligatorios:**
- Helmet habilitado con configuracion restrictiva (CSP, HSTS, X-Frame-Options)
- CORS con whitelist explicita de origenes (no usar `origin: '*'` en produccion)
- Swagger deshabilitado en produccion (solo accesible en desarrollo)
- `x-powered-by` deshabilitado (Helmet lo hace automaticamente)
- Mensajes de error genericos en produccion (sin stack traces ni rutas internas)
- Validar todas las variables de entorno al arrancar (ConfigModule + Joi)
- Header `x-tenant-id` solo aceptado desde origenes autorizados

---

### 1B.9 API9:2023 — Improper Inventory Management

**Riesgo:** Endpoints obsoletos, no documentados, o de versiones anteriores quedan expuestos sin proteccion. En gamilit con 912 endpoints, mantener un inventario preciso es critico para evitar superficies de ataque desconocidas.

**Mitigacion en gamilit:**

```typescript
// Swagger como fuente de verdad para inventario de endpoints
// apps/backend/src/main.ts
const swaggerConfig = new DocumentBuilder()
  .setTitle('GAMILIT API')
  .setDescription('Educational Gamification Platform')
  .setVersion('1.0.0')
  .addBearerAuth()
  .addTag('Auth', 'Authentication and authorization endpoints')
  .addTag('Educational', 'Educational content (modules, exercises)')
  .addTag('Progress', 'Student progress tracking')
  .addTag('Social', 'Social features (classrooms, teams, friendships)')
  .addTag('Content', 'Content management and templates')
  .addTag('Gamification', 'Gamification system (XP, ML Coins, Ranks)')
  .addTag('Admin - Users', 'Admin user management')
  .addTag('Admin - Organizations', 'Admin organization/tenant management')
  .addTag('Admin - Content', 'Admin content approval')
  .addTag('Admin - System', 'Admin system monitoring and configuration')
  .build();

// Todos los controllers deben usar @ApiTags() y @ApiOperation()
@Controller('educational/exercises')
@ApiTags('Educational')
export class ExercisesController {
  @Get()
  @ApiOperation({ summary: 'Listar ejercicios con filtros y paginacion' })
  @ApiQuery({ name: 'moduleId', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, enum: ExerciseType })
  @ApiResponse({ status: 200, description: 'Lista paginada de ejercicios' })
  async findAll(@Query() query: ExerciseFilterDto) {
    return this.exerciseService.findAll(query);
  }
}
```

```yaml
# orchestration/inventarios/BACKEND_INVENTORY.yml
# Inventario SSOT sincronizado con el codigo fuente
endpoints:
  total: 905
  por_modulo:
    auth: 12
    educational: 187
    gamification: 134
    admin: 98
    teacher: 156
    # ... (23 modulos documentados)

  auditoria:
    ultima_fecha: 2026-02-14
    endpoints_sin_swagger: 0      # Objetivo: 0
    endpoints_deprecados: 0       # Remover en siguiente release
    endpoints_sin_auth_guard: 3   # Solo: health, docs, public-info
```

**Controles obligatorios:**
- Todos los 912 endpoints documentados con decoradores Swagger (`@ApiTags`, `@ApiOperation`)
- Inventario SSOT en `BACKEND_INVENTORY.yml` sincronizado con codigo fuente
- Auditar periodicamente endpoints sin `@UseGuards()` — solo health y docs deben ser publicos
- Versionado de API con prefijo `/api/v1/` para facilitar deprecacion
- Endpoints deprecados marcados con `@ApiDeprecated()` y fecha de remocion
- Revisar inventario en cada sprint para detectar endpoints huerfanos

---

### 1B.10 API10:2023 — Unsafe Consumption of Third-Party APIs

**Riesgo:** La API consume respuestas de servicios externos (LTI, proveedores de contenido, APIs de email) sin validar su estructura, tamano, o contenido. Un servicio externo comprometido podria inyectar datos maliciosos.

**Mitigacion en gamilit:**

```typescript
// Validar respuestas de APIs externas con DTOs y timeouts
// apps/backend/src/modules/lti/ — Integracion LTI con plataformas educativas
@Injectable()
export class LtiIntegrationService {
  constructor(private readonly httpService: HttpService) {}

  async fetchExternalContent(ltiUrl: string): Promise<LtiContentDto> {
    // 1. Validar URL antes de hacer request
    this.urlValidationService.validateExternalUrl(ltiUrl);

    let response: AxiosResponse;
    try {
      // 2. Timeout agresivo y limite de tamano
      response = await firstValueFrom(
        this.httpService.get(ltiUrl, {
          timeout: 5000,                // 5 segundos maximo
          maxContentLength: 5 * 1024 * 1024, // 5MB maximo
          maxRedirects: 2,              // Maximo 2 redirects
          headers: {
            'Accept': 'application/json',
          },
        }),
      );
    } catch (error) {
      throw new BadGatewayException(
        'Error al comunicarse con el servicio externo',
      );
    }

    // 3. Validar estructura de la respuesta con class-validator
    const dto = plainToInstance(LtiContentDto, response.data);
    const errors = await validate(dto);

    if (errors.length > 0) {
      this.logger.warn(
        `Respuesta invalida de servicio externo: ${ltiUrl}`,
        errors,
      );
      throw new BadGatewayException(
        'Respuesta del servicio externo no cumple formato esperado',
      );
    }

    // 4. Sanitizar contenido HTML si existe
    if (dto.htmlContent) {
      dto.htmlContent = this.sanitizationService.sanitizeHtml(dto.htmlContent);
    }

    return dto;
  }
}

// DTO para validar respuesta de API externa
export class LtiContentDto {
  @IsString()
  @MaxLength(500)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(50000)
  htmlContent?: string;

  @IsOptional()
  @IsUrl()
  resourceUrl?: string;

  @IsEnum(LtiContentType)
  type: LtiContentType;
}
```

**Controles obligatorios:**
- Validar toda respuesta de API externa con DTOs y class-validator
- Timeout de 5 segundos para requests a servicios externos
- Limite de tamano en responses (maxContentLength: 5MB)
- Limitar redirects (maximo 2) para prevenir redirect loops
- Sanitizar contenido HTML recibido de fuentes externas
- Circuit breaker para servicios externos con alta tasa de fallo
- Registrar en logs toda comunicacion con APIs externas (sin datos sensibles)
- No confiar en headers de content-type de servicios externos; validar el body

---

### 1B.11 Resumen de Controles por Riesgo

| # | Riesgo OWASP API | Guard/Mecanismo Principal | Ubicacion en gamilit |
|---|------------------|--------------------------|---------------------|
| API1 | BOLA | `ResourceOwnershipGuard` + RLS | `shared/guards/resource-ownership.guard.ts` |
| API2 | Auth Rota | `JwtAuthGuard` + refresh rotation | `modules/auth/guards/jwt-auth.guard.ts` |
| API3 | BOPLA | `ValidationPipe(whitelist)` + DTOs | `main.ts` + 399 DTOs |
| API4 | Consumo sin limite | `ThrottlerModule` + paginacion | Config global + DTOs de query |
| API5 | BFLA | `RolesGuard` + `@Roles()` | `modules/auth/guards/roles.guard.ts` |
| API6 | Flujos sensibles | Rate limiting por flujo + Redis | `modules/notifications/guards/rate-limit.guard.ts` |
| API7 | SSRF | `UrlValidationService` | `modules/content/` + validacion URL |
| API8 | Misconfiguracion | Helmet + CORS + Swagger condicional | `main.ts` |
| API9 | Inventario | Swagger decorators + SSOT YAML | `BACKEND_INVENTORY.yml` |
| API10 | APIs externas | Validacion DTO + timeout + sanitizacion | `modules/lti/` |

---

## 2. Validacion de Entrada

### 2.1 DTOs con class-validator

```typescript
import {
  IsString,
  IsEmail,
  IsUUID,
  MinLength,
  MaxLength,
  IsOptional,
  IsEnum,
  ValidateNested,
  IsArray,
  ArrayMaxSize,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

// DTO seguro con validaciones completas
export class CreateUserDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsEmail()
  @MaxLength(255)
  @Transform(({ value }) => value?.toLowerCase().trim())
  email: string;

  @IsString()
  @MinLength(12)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsUUID('4', { each: true })
  projectIds?: string[];
}

// Habilitar validacion global
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,           // Eliminar propiedades no decoradas
    forbidNonWhitelisted: true, // Error si hay propiedades extra
    transform: true,            // Transformar tipos automaticamente
    transformOptions: {
      enableImplicitConversion: false, // No convertir implicito
    },
  }),
);
```

### 2.2 Sanitizacion de Input

```typescript
import { sanitize } from 'class-sanitizer';
import * as sanitizeHtml from 'sanitize-html';

@Injectable()
export class SanitizationService {
  // Sanitizar HTML (prevenir XSS stored)
  sanitizeHtml(input: string): string {
    return sanitizeHtml(input, {
      allowedTags: ['b', 'i', 'em', 'strong', 'p', 'br'],
      allowedAttributes: {},
    });
  }

  // Sanitizar para SQL (adicional a parametrizacion)
  sanitizeForSearch(input: string): string {
    return input
      .replace(/[%_]/g, '\\$&')  // Escapar wildcards de LIKE
      .trim()
      .slice(0, 100);            // Limitar longitud
  }
}
```

---

## 3. Sanitizacion de Salida

### 3.1 DTOs de Respuesta

```typescript
// CORRECTO: Usar DTOs de respuesta para controlar datos expuestos
import { Exclude, Expose, Type } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  role: string;

  @Expose()
  createdAt: Date;

  // Excluir datos sensibles
  @Exclude()
  password: string;

  @Exclude()
  passwordResetToken: string;

  @Exclude()
  internalNotes: string;
}

// Aplicar transformacion
@Controller('users')
export class UserController {
  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async findById(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.userService.findById(id);
    return plainToInstance(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });
  }
}
```

### 3.2 Prevencion de XSS

```typescript
// Interceptor para sanitizar respuestas HTML
@Injectable()
export class XssInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => this.sanitizeObject(data)),
    );
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.escapeHtml(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeObject(value);
      }
      return sanitized;
    }
    return obj;
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
```

---

## 4. Autenticacion

### 4.1 JWT con Expiracion Corta

```typescript
// auth.module.ts
@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: {
          expiresIn: '15m',  // Access token: 15 minutos
          issuer: 'your-app',
          audience: 'your-app-users',
        },
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AuthModule {}

// auth.service.ts
@Injectable()
export class AuthService {
  async generateTokens(user: User): Promise<TokenPair> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { expiresIn: '7d' }
    );

    // Almacenar refresh token hasheado
    await this.storeRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  private async storeRefreshToken(userId: string, token: string): Promise<void> {
    const hash = await bcrypt.hash(token, 10);
    await this.refreshTokenRepository.save({
      userId,
      tokenHash: hash,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
  }
}
```

### 4.2 Password Hashing Seguro

```typescript
@Injectable()
export class PasswordService {
  private readonly BCRYPT_ROUNDS = 12;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.BCRYPT_ROUNDS);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Validar fortaleza de password
  validateStrength(password: string): ValidationResult {
    const errors: string[] = [];

    if (password.length < 12) {
      errors.push('Minimo 12 caracteres');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Requiere al menos una mayuscula');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Requiere al menos una minuscula');
    }
    if (!/\d/.test(password)) {
      errors.push('Requiere al menos un numero');
    }
    if (!/[@$!%*?&]/.test(password)) {
      errors.push('Requiere al menos un caracter especial (@$!%*?&)');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
```

---

## 5. Autorizacion

### 5.1 RBAC (Role-Based Access Control)

```typescript
// roles.decorator.ts
export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// permissions.decorator.ts
export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}

// Uso en controller
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('users')
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  async findAllUsers(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Delete('users/:id')
  @Roles(Role.SUPER_ADMIN)
  @Permissions('users:delete')
  async deleteUser(@Param('id') id: string): Promise<void> {
    return this.userService.delete(id);
  }
}
```

### 5.2 Row-Level Security (PostgreSQL)

```sql
-- Habilitar RLS en tabla
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Politica para lectura: solo proyectos donde el usuario es miembro
CREATE POLICY project_select_policy ON projects
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = projects.id
      AND project_members.user_id = current_setting('app.current_user_id')::uuid
    )
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = current_setting('app.current_user_id')::uuid
      AND users.role = 'admin'
    )
  );

-- Politica para modificacion: solo propietarios
CREATE POLICY project_update_policy ON projects
  FOR UPDATE
  USING (owner_id = current_setting('app.current_user_id')::uuid);
```

```typescript
// Configurar contexto de usuario en cada request
@Injectable()
export class RlsMiddleware implements NestMiddleware {
  constructor(private readonly dataSource: DataSource) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (req.user?.id) {
      await this.dataSource.query(
        `SET LOCAL app.current_user_id = '${req.user.id}'`
      );
    }
    next();
  }
}
```

---

## 6. Secrets Management

### 6.1 Variables de Entorno

```typescript
// config/configuration.ts
export default () => ({
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  },
  // NUNCA valores por defecto para secrets
});

// Validacion obligatoria
const validationSchema = Joi.object({
  DB_HOST: Joi.string().required(),
  DB_PASSWORD: Joi.string().min(16).required(),
  JWT_SECRET: Joi.string().min(32).required(),
});
```

### 6.2 Gitignore Obligatorio

```gitignore
# .gitignore - NUNCA commitear
.env
.env.local
.env.*.local
*.pem
*.key
credentials.json
secrets/
```

### 6.3 Rotacion de Credentials

```typescript
// Politica de rotacion
interface CredentialRotationPolicy {
  type: string;
  rotationPeriodDays: number;
  notifyBeforeDays: number;
}

const rotationPolicies: CredentialRotationPolicy[] = [
  { type: 'database_password', rotationPeriodDays: 90, notifyBeforeDays: 14 },
  { type: 'jwt_secret', rotationPeriodDays: 180, notifyBeforeDays: 30 },
  { type: 'api_keys', rotationPeriodDays: 365, notifyBeforeDays: 30 },
];
```

---

## 7. Security Headers

### 7.1 Helmet Middleware

```typescript
// main.ts
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Helmet con configuracion personalizada
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", process.env.API_URL],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: true,
      crossOriginOpenerPolicy: { policy: 'same-origin' },
      crossOriginResourcePolicy: { policy: 'same-origin' },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      noSniff: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      xssFilter: true,
    }),
  );
}
```

### 7.2 Headers de Seguridad Obligatorios

| Header | Valor | Proposito |
|--------|-------|-----------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Forzar HTTPS |
| `X-Content-Type-Options` | `nosniff` | Prevenir MIME sniffing |
| `X-Frame-Options` | `DENY` | Prevenir clickjacking |
| `X-XSS-Protection` | `1; mode=block` | Filtro XSS del navegador |
| `Content-Security-Policy` | Ver configuracion arriba | Controlar recursos |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controlar referrer |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Restringir APIs |

---

## 8. Checklist de Seguridad

### 8.1 Pre-Deploy

- [ ] **Dependencias:** `npm audit` sin vulnerabilidades criticas/altas
- [ ] **Secrets:** Ninguna credencial hardcodeada o en git
- [ ] **HTTPS:** TLS 1.2+ configurado
- [ ] **Headers:** Helmet configurado con CSP
- [ ] **CORS:** Origenes restringidos a dominios conocidos
- [ ] **Validacion:** DTOs con class-validator en todos los endpoints
- [ ] **Autenticacion:** JWT con expiracion corta (< 1h)
- [ ] **Autorizacion:** Guards en todos los endpoints protegidos
- [ ] **Logging:** Eventos de seguridad registrados
- [ ] **Rate Limiting:** Configurado en endpoints criticos

### 8.2 Durante Desarrollo

- [ ] Validar input en CADA endpoint
- [ ] Usar parametros en queries (nunca concatenar)
- [ ] No exponer datos sensibles en respuestas
- [ ] Sanitizar output que se renderiza como HTML
- [ ] Verificar permisos antes de acceder a recursos
- [ ] Registrar acciones sensibles en audit log

### 8.3 Code Review de Seguridad

- [ ] No hay SQL sin parametrizar
- [ ] No hay secrets en codigo
- [ ] DTOs tienen validaciones apropiadas
- [ ] Respuestas no exponen datos internos
- [ ] Permisos validados en cada operacion
- [ ] Errores no revelan informacion sensible
- [ ] Input sanitizado antes de usar

### 8.4 Periodicidad de Auditorias

| Actividad | Frecuencia | Responsable |
|-----------|------------|-------------|
| `npm audit` | Cada build | CI/CD |
| Revision de dependencias | Semanal | Desarrollo |
| Penetration testing | Trimestral | Seguridad |
| Revision de permisos | Mensual | Administradores |
| Rotacion de secrets | Ver politica | Operaciones |
| Revision de logs de seguridad | Diario | Monitoreo |

---

## Referencias

### Implementacion
- [ESTANDAR-API](ESTANDAR-API.md) - Endpoints donde se implementa la seguridad

### Externas
- OWASP Top 10 (2021): https://owasp.org/Top10/
- OWASP API Security Top 10 (2023): https://owasp.org/API-Security/
- OWASP Cheat Sheet Series: https://cheatsheetseries.owasp.org/
- NestJS Security: https://docs.nestjs.com/security/authentication
- class-validator: https://github.com/typestack/class-validator
- Helmet.js: https://helmetjs.github.io/
