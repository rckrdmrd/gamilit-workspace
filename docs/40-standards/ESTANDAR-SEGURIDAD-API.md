---
titulo: Estandar de Seguridad API
tipo: estandar-proyecto
scope: proyecto
version: 1.0.0
fecha_creacion: 2026-02-27
ultima_actualizacion: 2026-02-27
basado_en: ESTANDAR-SEGURIDAD.md v2.0.0 (seccion 1B)
tags:
  - seguridad
  - owasp
  - api-security
  - nestjs
  - typescript
  - multi-tenant
---

# Estandar de Seguridad API — GAMILIT

> Lineamientos de seguridad especificos para APIs REST basados en OWASP API Security Top 10 (2023).

> Complemento Web: Ver [ESTANDAR-SEGURIDAD-WEB.md](ESTANDAR-SEGURIDAD-WEB.md) para OWASP Web Top 10.

---

## 1. OWASP API Security Top 10 (2023)

> Referencia oficial: https://owasp.org/API-Security/
>
> Las APIs representan la superficie de ataque principal en aplicaciones modernas. gamilit expone 912 endpoints REST que requieren proteccion especifica mas alla del OWASP Top 10 web tradicional. Esta seccion cubre los 10 riesgos criticos de seguridad en APIs segun OWASP 2023, con ejemplos concretos del stack NestJS 11 + TypeORM + PostgreSQL de gamilit.

---

### 1.1 API1:2023 — Broken Object Level Authorization (BOLA)

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

### 1.2 API2:2023 — Broken Authentication

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

### 1.3 API3:2023 — Broken Object Property Level Authorization (BOPLA)

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

### 1.4 API4:2023 — Unrestricted Resource Consumption

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

### 1.5 API5:2023 — Broken Function Level Authorization (BFLA)

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

### 1.6 API6:2023 — Unrestricted Access to Sensitive Business Flows

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

### 1.7 API7:2023 — Server Side Request Forgery (SSRF)

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

### 1.8 API8:2023 — Security Misconfiguration

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

### 1.9 API9:2023 — Improper Inventory Management

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

### 1.10 API10:2023 — Unsafe Consumption of Third-Party APIs

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

## 2. Resumen de Controles por Riesgo

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

## Referencias

- [ESTANDAR-SEGURIDAD.md](ESTANDAR-SEGURIDAD.md) - Indice principal + Checklist de seguridad
- [ESTANDAR-SEGURIDAD-WEB.md](ESTANDAR-SEGURIDAD-WEB.md) - OWASP Web Top 10 (2021)
- [ESTANDAR-API.md](ESTANDAR-API.md) - Endpoints donde se implementa la seguridad
- OWASP API Security Top 10 (2023): https://owasp.org/API-Security/
- OWASP Cheat Sheet Series: https://cheatsheetseries.owasp.org/
- NestJS Security: https://docs.nestjs.com/security/authentication
- class-validator: https://github.com/typestack/class-validator
- Helmet.js: https://helmetjs.github.io/
