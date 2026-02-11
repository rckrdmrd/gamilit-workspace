---
id: "US-FUND-006"
title: "API RESTful básica"
type: "User Story"
status: "Done"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EAI-001"
story_points: 10
budget: "$3,600 MXN"
sprint: "Sprint-1"
labels: ["api", "rest", "backend", "swagger", "authentication"]
created_date: "2025-11-02"
updated_date: "2026-01-04"
---

# US-FUND-006: API RESTful básica

**Épica:** EAI-001 - Fundamentos
**Sprint:** Mes 1, Semana 1-2
**Story Points:** 10 SP
**Presupuesto:** $3,600 MXN
**Prioridad:** Alta (Alcance Inicial)
**Estado:** Done (Mes 1)

---

## Descripción

Como **desarrollador**, necesito **una API RESTful bien estructurada y consistente** para **facilitar el desarrollo del frontend y garantizar mantenibilidad del código**.

**Contexto del Alcance Inicial:**
Esta historia establece los estándares y patrones de la API REST que se usarán en todo el proyecto: estructura de endpoints, middleware de autenticación, validación de datos, manejo de errores, y documentación con Swagger. Es fundamental para mantener consistencia en el desarrollo.

---

## Criterios de Aceptación

### Estructura de API
- [ ] **CA-01:** Todos los endpoints siguen convenciones RESTful (GET, POST, PATCH, DELETE)
- [ ] **CA-02:** URLs consistentes: `/api/v1/resource` o `/api/v1/resource/:id`
- [ ] **CA-03:** Respuestas con formato JSON consistente
- [ ] **CA-04:** Códigos de estado HTTP apropiados (200, 201, 400, 401, 404, 500)

### Validación
- [ ] **CA-05:** Todos los DTOs usan class-validator para validación
- [ ] **CA-06:** Validación automática en todos los endpoints
- [ ] **CA-07:** Mensajes de error descriptivos en validaciones

### Autenticación
- [ ] **CA-08:** Middleware de autenticación JWT funcional
- [ ] **CA-09:** Decorador @Public() para endpoints sin autenticación
- [ ] **CA-10:** Decorador @Roles() para control de acceso por rol

### Manejo de Errores
- [ ] **CA-11:** Global exception filter configurado
- [ ] **CA-12:** Errores formateados consistentemente
- [ ] **CA-13:** Logging de errores con contexto

### Documentación
- [ ] **CA-14:** Swagger UI accesible en `/api/docs`
- [ ] **CA-15:** Todos los endpoints documentados con decoradores
- [ ] **CA-16:** Ejemplos de request/response en documentación

---

## Especificaciones Técnicas

### Estructura de Respuestas

**Success Response:**
```typescript
// GET /api/users/123
{
  "data": {
    "id": "123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}

// GET /api/modules (lista)
{
  "data": [
    { "id": "1", "title": "Módulo 1" },
    { "id": "2", "title": "Módulo 2" }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "limit": 10
  }
}
```

**Error Response:**
```typescript
// 400 Bad Request
{
  "statusCode": 400,
  "message": ["email must be an email", "password is too short"],
  "error": "Bad Request",
  "timestamp": "2025-11-02T12:00:00.000Z",
  "path": "/api/auth/register"
}

// 401 Unauthorized
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}

// 404 Not Found
{
  "statusCode": 404,
  "message": "User not found",
  "error": "Not Found"
}
```

### DTOs y Validación

**Ejemplo de DTO:**
```typescript
// dtos/create-user.dto.ts
import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string

  @ApiProperty({ example: 'SecurePassword123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string

  @ApiProperty({ enum: ['student', 'teacher'], example: 'student' })
  @IsEnum(['student', 'teacher'])
  role: 'student' | 'teacher'
}

// dtos/update-user.dto.ts
import { PartialType } from '@nestjs/swagger'

export class UpdateUserDto extends PartialType(CreateUserDto) {
  // Todos los campos son opcionales
}
```

### Guards y Decoradores

**JWT Auth Guard:**
```typescript
// guards/jwt-auth.guard.ts
import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super()
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler())
    if (isPublic) return true

    return super.canActivate(context)
  }
}
```

**Roles Guard:**
```typescript
// guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler())
    if (!requiredRoles) return true

    const request = context.switchToHttp().getRequest()
    const user = request.user

    return requiredRoles.includes(user.role)
  }
}
```

**Decoradores Personalizados:**
```typescript
// decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common'

export const Public = () => SetMetadata('isPublic', true)

// decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common'

export const Roles = (...roles: string[]) => SetMetadata('roles', roles)

// decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return request.user
  }
)
```

**Uso en Controllers:**
```typescript
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  @Get('profile')
  getProfile(@CurrentUser() user: User) {
    return { data: user }
  }

  @Patch('profile')
  updateProfile(
    @CurrentUser() user: User,
    @Body() updateDto: UpdateUserDto
  ) {
    return this.usersService.update(user.id, updateDto)
  }

  @Get()
  @Roles('teacher', 'admin')
  getAllUsers() {
    return this.usersService.findAll()
  }
}

@Controller('auth')
export class AuthController {
  @Post('login')
  @Public()
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto)
  }
}
```

### Global Exception Filter

```typescript
// filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message: string | string[] = 'Internal server error'

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      message = typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || exception.message
    }

    const errorResponse = {
      statusCode: status,
      message,
      error: HttpStatus[status],
      timestamp: new Date().toISOString(),
      path: request.url
    }

    // Log de error
    this.logger.error(
      `${request.method} ${request.url}`,
      JSON.stringify(errorResponse),
      exception instanceof Error ? exception.stack : ''
    )

    response.status(status).json(errorResponse)
  }
}
```

### Swagger Configuration

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Global prefix
  app.setGlobalPrefix('api/v1')

  // Validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  )

  // Exception filter
  app.useGlobalFilters(new HttpExceptionFilter())

  // Global guards
  const reflector = app.get(Reflector)
  app.useGlobalGuards(new JwtAuthGuard(reflector))

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('GAMILIT API')
    .setDescription('API para plataforma educativa gamificada GAMILIT')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Endpoints de autenticación')
    .addTag('users', 'Gestión de usuarios')
    .addTag('modules', 'Módulos educativos')
    .addTag('activities', 'Actividades')
    .addTag('gamification', 'Sistema de gamificación')
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  await app.listen(4000)
}
```

---

## Dependencias

**Antes:**
- US-FUND-004 (Infraestructura)

**Después:**
- Base para todos los módulos de la aplicación

---

## Definición de Hecho (DoD)

- [x] Global validation pipe configurado
- [x] Exception filter implementado
- [x] Guards (JWT, Roles) funcionando
- [x] Decoradores personalizados creados
- [x] Swagger configurado y accesible
- [x] Formato de respuestas estandarizado
- [x] DTOs con validaciones en todos los módulos
- [x] Tests unitarios para guards y filters
- [x] Documentación de estándares API

---

## Notas del Alcance Inicial

- Done API REST estándar (no GraphQL)
- Done Versionado simple (v1 en prefix)
- Done Sin rate limiting avanzado
- Done Sin API key authentication
- Done Sin caching layer (Redis)
- Done Sin compresión de respuestas (gzip)
- **Extensión futura:** EXT-012-API (rate limiting, caching, compresión)
- **Extensión futura:** EXT-013-GraphQL (API GraphQL alternativa)

---

## Testing

### Tests Unitarios
```typescript
describe('HttpExceptionFilter', () => {
  it('should format HttpException correctly')
  it('should handle unknown errors')
  it('should log errors with context')
})

describe('JwtAuthGuard', () => {
  it('should allow public routes')
  it('should reject unauthenticated requests')
  it('should allow authenticated requests')
})

describe('RolesGuard', () => {
  it('should allow if no roles required')
  it('should allow if user has required role')
  it('should reject if user lacks required role')
})
```

### Tests E2E
```typescript
describe('API Standards', () => {
  it('GET /api/v1/users - returns formatted response')
  it('POST /api/v1/users - validates DTO')
  it('POST /api/v1/users - returns validation errors')
  it('GET /api/v1/protected - returns 401 without token')
  it('GET /api/v1/admin - returns 403 for non-admin')
})
```

---

## Estimación

**Desglose de Esfuerzo (10 SP = ~3.5 días):**
- Guards y decoradores: 1 día
- Exception filter: 0.5 días
- DTOs y validaciones: 1 día
- Swagger configuration: 0.5 días
- Estandarización de respuestas: 0.5 días
- Testing: 0.75 días
- Documentación: 0.25 días

**Riesgos:**
- Cambios en estándares pueden requerir refactoring
- Swagger puede ser complejo para casos avanzados

---

**Creado:** 2025-11-02
**Actualizado:** 2026-01-04
**Responsable:** Equipo Backend
