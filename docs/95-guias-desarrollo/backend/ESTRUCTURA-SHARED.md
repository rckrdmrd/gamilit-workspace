# Estructura de Código Compartido Backend

**Versión:** 1.0.0
**Última Actualización:** 2025-11-28
**Aplica a:** apps/backend/src/shared/

---

## Resumen

La carpeta `shared/` contiene código reutilizable que no pertenece a ningún módulo específico. Incluye decoradores, guards, interceptores, filtros, DTOs comunes y utilidades.

---

## Estructura de Carpetas

```
shared/
├── config/                    # Configuración de la aplicación
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── app.config.ts
├── constants/                 # Constantes globales
│   ├── database.constants.ts  # Nombres de tablas, esquemas
│   ├── roles.constants.ts     # Roles del sistema
│   └── error-codes.constants.ts
├── decorators/                # Decoradores personalizados
│   ├── api-paginated-response.decorator.ts
│   ├── current-user.decorator.ts
│   ├── roles.decorator.ts
│   └── tenant.decorator.ts
├── dto/                       # DTOs compartidos
│   ├── auth/
│   │   ├── admin-reset-password.dto.ts
│   │   └── reset-password.dto.ts
│   ├── notifications/
│   │   ├── create-notification.dto.ts
│   │   └── notification-response.dto.ts
│   ├── permissions/
│   │   ├── update-role-permissions.dto.ts
│   │   └── update-student-permissions.dto.ts
│   ├── reports/
│   │   └── generate-report.dto.ts
│   └── pagination.dto.ts
├── filters/                   # Exception filters
│   └── http-exception.filter.ts
├── guards/                    # Guards de autorización
│   ├── jwt-auth.guard.ts
│   ├── roles.guard.ts
│   └── rls.guard.ts
├── interceptors/              # Interceptores
│   ├── performance.interceptor.ts
│   ├── rls.interceptor.ts
│   └── transform.interceptor.ts
├── services/                  # Servicios compartidos
│   └── rate-limiter.service.ts
└── utils/                     # Funciones utilitarias
    ├── logger.util.ts
    ├── progress.util.ts
    ├── string.util.ts
    └── validation.util.ts
```

---

## Componentes Principales

### 1. Decoradores (`decorators/`)

#### @CurrentUser
Extrae el usuario autenticado del request:
```typescript
// Definición
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

// Uso
@Get('profile')
async getProfile(@CurrentUser() user: UserEntity) {
  return user;
}
```

#### @Roles
Define roles requeridos para acceder a un endpoint:
```typescript
// Definición
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// Uso
@Post()
@Roles('admin', 'teacher')
async createContent() { }
```

#### @ApiPaginatedResponse
Documenta respuestas paginadas en Swagger:
```typescript
@Get()
@ApiPaginatedResponse(UserDto)
async findAll(): Promise<PaginatedResponse<UserDto>> { }
```

---

### 2. Guards (`guards/`)

#### JwtAuthGuard
Valida tokens JWT en requests:
```typescript
@Controller('protected')
@UseGuards(JwtAuthGuard)
export class ProtectedController { }
```

#### RolesGuard
Verifica que el usuario tenga los roles requeridos:
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController { }
```

#### RlsGuard
Aplica Row-Level Security basado en tenant:
```typescript
@UseGuards(JwtAuthGuard, RlsGuard)
export class TenantScopedController { }
```

---

### 3. Interceptores (`interceptors/`)

#### RlsInterceptor
Configura el contexto de RLS antes de cada query:
```typescript
@Injectable()
export class RlsInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.user?.tenantId;

    // SET app.current_tenant_id = tenantId
    await this.dataSource.query(`SET app.current_tenant_id = '${tenantId}'`);

    return next.handle();
  }
}
```

#### PerformanceInterceptor
Mide tiempo de ejecución de endpoints:
```typescript
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const start = Date.now();
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        this.logger.log(`${method} ${url} - ${duration}ms`);
      }),
    );
  }
}
```

---

### 4. Filtros (`filters/`)

#### HttpExceptionFilter
Formatea errores HTTP de manera consistente:
```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const status = exception.getStatus();

    response.status(status).json({
      success: false,
      error: {
        code: status,
        message: exception.message,
        timestamp: new Date().toISOString(),
      },
    });
  }
}
```

---

### 5. Constantes (`constants/`)

#### database.constants.ts
```typescript
export const SCHEMAS = {
  AUTH_MANAGEMENT: 'auth_management',
  EDUCATIONAL_CONTENT: 'educational_content',
  GAMIFICATION_SYSTEM: 'gamification_system',
  USER_PROGRESS: 'user_progress',
  SOCIAL_FEATURES: 'social_features',
  NOTIFICATION_SYSTEM: 'notification_system',
  AUDIT_LOGGING: 'audit_logging',
  ADMIN_DASHBOARD: 'admin_dashboard',
  SYSTEM_CONFIGURATION: 'system_configuration',
} as const;

export const TABLES = {
  USERS: `${SCHEMAS.AUTH_MANAGEMENT}.users`,
  USER_STATS: `${SCHEMAS.GAMIFICATION_SYSTEM}.user_stats`,
  // ...
} as const;
```

---

### 6. DTOs Compartidos (`dto/`)

#### PaginationDto
```typescript
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
```

#### PaginatedResponse
```typescript
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

---

### 7. Utilidades (`utils/`)

#### logger.util.ts
```typescript
export const createLogger = (context: string) => {
  return new Logger(context);
};
```

#### validation.util.ts
```typescript
export const isValidUUID = (value: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
};
```

#### string.util.ts
```typescript
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};
```

---

### 8. Servicios Compartidos (`services/`)

#### RateLimiterService
```typescript
@Injectable()
export class RateLimiterService {
  private readonly store = new Map<string, RateLimitEntry>();

  async checkLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
    const entry = this.store.get(key);
    const now = Date.now();

    if (!entry || now - entry.timestamp > windowMs) {
      this.store.set(key, { count: 1, timestamp: now });
      return true;
    }

    if (entry.count >= limit) {
      return false;
    }

    entry.count++;
    return true;
  }
}
```

---

## Registro Global

Los componentes compartidos se registran globalmente en `app.module.ts`:

```typescript
@Module({
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: RlsInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: PerformanceInterceptor,
    },
    RateLimiterService,
  ],
})
export class AppModule {}
```

---

## Buenas Prácticas

1. **No duplicar**: Si algo se usa en 2+ módulos, moverlo a shared/
2. **Documentar decoradores**: Incluir JSDoc con ejemplos de uso
3. **Tests para utilidades**: Las funciones en utils/ deben tener tests
4. **Constantes tipadas**: Usar `as const` para type safety
5. **Exports centralizados**: Crear `index.ts` en cada subcarpeta

---

## Ver También

- [ESTRUCTURA-MODULOS.md](./ESTRUCTURA-MODULOS.md) - Estructura de módulos
- [ERROR-HANDLING.md](./ERROR-HANDLING.md) - Manejo de errores
- [API-CONVENTIONS.md](./API-CONVENTIONS.md) - Convenciones de API
