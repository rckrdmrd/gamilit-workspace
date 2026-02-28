---
titulo: Estandar de Seguridad Web
tipo: estandar-proyecto
scope: proyecto
version: 1.0.0
fecha_creacion: 2026-02-27
ultima_actualizacion: 2026-02-27
basado_en: ESTANDAR-SEGURIDAD.md v2.0.0
tags:
  - seguridad
  - owasp
  - autenticacion
  - autorizacion
  - nestjs
  - typescript
---

# Estandar de Seguridad Web — GAMILIT

> Lineamientos de seguridad basados en OWASP Top 10 (2021), mejores practicas de autenticacion, autorizacion y proteccion de datos.

> Complemento API: Ver [ESTANDAR-SEGURIDAD-API.md](ESTANDAR-SEGURIDAD-API.md) para OWASP API Security Top 10.

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
## Auditoria regular de dependencias
npm audit
npm audit fix

## Usar Snyk para monitoreo continuo
npx snyk test

## Actualizar dependencias
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
## .gitignore - NUNCA commitear
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

## Referencias

- [ESTANDAR-SEGURIDAD.md](ESTANDAR-SEGURIDAD.md) - Indice principal + Checklist de seguridad
- [ESTANDAR-SEGURIDAD-API.md](ESTANDAR-SEGURIDAD-API.md) - OWASP API Security Top 10
- [ESTANDAR-API.md](ESTANDAR-API.md) - Endpoints donde se implementa la seguridad
- OWASP Top 10 (2021): https://owasp.org/Top10/
- OWASP Cheat Sheet Series: https://cheatsheetseries.owasp.org/
- NestJS Security: https://docs.nestjs.com/security/authentication
- class-validator: https://github.com/typestack/class-validator
- Helmet.js: https://helmetjs.github.io/
