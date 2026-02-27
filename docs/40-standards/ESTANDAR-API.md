---
titulo: Estandar de API
tipo: estandar-workspace
scope: workspace
version: 1.0.0
fecha_creacion: 2026-02-02
ultima_actualizacion: 2026-02-27
herencia: |
  Este estandar aplica a nivel WORKSPACE.
  Los proyectos pueden EXTENDER (no contradecir) con estandares locales.
  Ejemplo: workspace-projects/projects/{proyecto}/docs/API-STANDARDS.md para endpoints especificos.
tags:
  - api
  - rest
  - swagger
  - http
  - nestjs
  - seguridad
---

# Estandar de APIs REST

> Convenciones RESTful, documentacion Swagger, codigos de respuesta y seguridad para APIs backend con NestJS

---

## 1. RESTful Conventions

### 1.1 Verbos HTTP

| Verbo | Proposito | Idempotente | Body Request | Ejemplo |
|-------|-----------|-------------|--------------|---------|
| GET | Obtener recursos | Si | No | `GET /users/123` |
| POST | Crear recurso nuevo | No | Si | `POST /users` |
| PUT | Reemplazar recurso completo | Si | Si | `PUT /users/123` |
| PATCH | Actualizar parcialmente | No | Si | `PATCH /users/123` |
| DELETE | Eliminar recurso | Si | No | `DELETE /users/123` |

**Cuando usar cada verbo:**

```typescript
// GET: Obtener sin modificar estado
@Get('users')
async findAll(): Promise<UserResponseDto[]> {}

@Get('users/:id')
async findOne(@Param('id') id: string): Promise<UserResponseDto> {}

// POST: Crear nuevo recurso (el servidor genera el ID)
@Post('users')
async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {}

// PUT: Reemplazo completo (enviar TODOS los campos)
@Put('users/:id')
async replace(
  @Param('id') id: string,
  @Body() dto: ReplaceUserDto,
): Promise<UserResponseDto> {}

// PATCH: Actualizacion parcial (solo campos a modificar)
@Patch('users/:id')
async update(
  @Param('id') id: string,
  @Body() dto: UpdateUserDto,
): Promise<UserResponseDto> {}

// DELETE: Eliminar recurso
@Delete('users/:id')
async remove(@Param('id') id: string): Promise<void> {}
```

### 1.2 Estructura de URLs

**Reglas fundamentales:**

1. Usar **sustantivos en plural** para colecciones
2. Usar **minusculas** y **guiones** para separar palabras
3. No incluir verbos en la URL (el verbo HTTP lo indica)
4. Recursos anidados para relaciones claras

**Patrones de URL:**

| Patron | Descripcion | Ejemplo |
|--------|-------------|---------|
| `/resources` | Coleccion | `GET /users` |
| `/resources/{id}` | Recurso individual | `GET /users/123` |
| `/resources/{id}/subresources` | Subcoleccion | `GET /users/123/orders` |
| `/resources/{id}/subresources/{subId}` | Subrecurso | `GET /users/123/orders/456` |
| `/resources/{id}/actions` | Acciones especiales | `POST /orders/123/cancel` |

**Ejemplos correctos vs incorrectos:**

```typescript
// CORRECTO
GET    /api/v1/users                    // Listar usuarios
GET    /api/v1/users/123                // Obtener usuario
POST   /api/v1/users                    // Crear usuario
PATCH  /api/v1/users/123                // Actualizar usuario
DELETE /api/v1/users/123                // Eliminar usuario
GET    /api/v1/users/123/orders         // Ordenes de un usuario
POST   /api/v1/orders/123/cancel        // Accion: cancelar orden
GET    /api/v1/order-items              // Recurso con guiones

// INCORRECTO
GET    /api/v1/getUsers                 // Verbo en URL
GET    /api/v1/user/123                 // Singular para coleccion
POST   /api/v1/users/create             // Verbo redundante
GET    /api/v1/users/123/getOrders      // Verbo en URL
DELETE /api/v1/deleteUser/123           // Verbo en URL
GET    /api/v1/orderItems               // CamelCase en URL
GET    /api/v1/order_items              // Guion bajo
```

### 1.3 Implementacion en NestJS

```typescript
// users.controller.ts
@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los usuarios' })
  async findAll(@Query() query: PaginationDto): Promise<PaginatedResponse<UserResponseDto>> {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo usuario' })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar usuario parcialmente' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar usuario' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}

// Subrecursos: user-orders.controller.ts
@Controller('users/:userId/orders')
@ApiTags('User Orders')
export class UserOrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar ordenes de un usuario' })
  async findUserOrders(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() query: PaginationDto,
  ): Promise<PaginatedResponse<OrderResponseDto>> {
    return this.ordersService.findByUserId(userId, query);
  }

  @Get(':orderId')
  @ApiOperation({ summary: 'Obtener orden especifica de un usuario' })
  async findOne(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('orderId', ParseUUIDPipe) orderId: string,
  ): Promise<OrderResponseDto> {
    return this.ordersService.findOneByUser(userId, orderId);
  }
}
```

---

## 2. Versionamiento de APIs

### 2.1 URL Versioning (RECOMENDADO)

**Formato:** `/api/v{N}/resource`

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global con version
  app.setGlobalPrefix('api/v1');

  await app.listen(3000);
}

// Para multiples versiones simultaneas
@Controller({
  path: 'users',
  version: '1',
})
export class UsersV1Controller {
  // Endpoints v1
}

@Controller({
  path: 'users',
  version: '2',
})
export class UsersV2Controller {
  // Endpoints v2 con cambios breaking
}

// app.module.ts - Habilitar versionamiento
import { VersioningType } from '@nestjs/common';

app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: '1',
});
```

**Ejemplos de URLs versionadas:**

```
GET /api/v1/users           # Version 1
GET /api/v2/users           # Version 2 (formato de respuesta diferente)
GET /api/v1/users/123       # Recurso especifico v1
```

### 2.2 Header Versioning (Alternativo)

```typescript
// Configuracion para header versioning
app.enableVersioning({
  type: VersioningType.HEADER,
  header: 'X-API-Version',
});

// Uso en cliente
// GET /api/users
// Headers: { "X-API-Version": "2" }

@Controller('users')
@Version('2')
export class UsersV2Controller {}
```

### 2.3 Politica de Deprecacion

| Fase | Duracion | Accion |
|------|----------|--------|
| Anuncio | -6 meses | Header `Deprecation: true`, documentar nueva version |
| Sunset | -3 meses | Header `Sunset: <fecha>`, logs de uso |
| Desactivacion | Fecha limite | Retornar 410 Gone |

```typescript
// Decorator para marcar endpoints deprecados
@Deprecated('2026-06-01', 'Use GET /api/v2/users instead')
@Get()
async findAllDeprecated(): Promise<UserResponseDto[]> {
  // Agrega headers automaticamente
}

// Interceptor para agregar headers de deprecacion
@Injectable()
export class DeprecationInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();

    response.setHeader('Deprecation', 'true');
    response.setHeader('Sunset', 'Sat, 01 Jun 2026 00:00:00 GMT');
    response.setHeader('Link', '</api/v2/users>; rel="successor-version"');

    return next.handle();
  }
}
```

---

## 3. Documentacion Swagger

### 3.1 Configuracion Base

```typescript
// main.ts
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API de Usuarios')
    .setDescription('API REST para gestion de usuarios del sistema')
    .setVersion('1.0.0')
    .setContact('Equipo Backend', 'https://empresa.com', 'backend@empresa.com')
    .addServer('http://localhost:3006', 'Desarrollo')
    .addServer('https://api.staging.empresa.com', 'Staging')
    .addServer('https://api.empresa.com', 'Produccion')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Ingrese el token JWT',
      },
      'JWT-auth',
    )
    .addTag('Users', 'Operaciones de usuarios')
    .addTag('Orders', 'Operaciones de ordenes')
    .addTag('Auth', 'Autenticacion y autorizacion')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  await app.listen(3000);
}
```

### 3.2 Decoradores Obligatorios

**En Controllers:**

```typescript
@Controller('users')
@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@ApiExtraModels(UserResponseDto, ErrorResponseDto)
export class UsersController {
  @Get()
  @ApiOperation({
    summary: 'Listar usuarios',
    description: 'Obtiene una lista paginada de usuarios con filtros opcionales',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'status', required: false, enum: UserStatus })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios obtenida exitosamente',
    type: PaginatedUserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'No autorizado - Token invalido o expirado',
    type: ErrorResponseDto,
  })
  async findAll(@Query() query: PaginationDto): Promise<PaginatedResponse<UserResponseDto>> {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiParam({
    name: 'id',
    description: 'UUID del usuario',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @ApiResponse({ status: 200, description: 'Usuario encontrado', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado', type: ErrorResponseDto })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear nuevo usuario' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente', type: UserResponseDto })
  @ApiResponse({ status: 400, description: 'Datos de entrada invalidos', type: ErrorResponseDto })
  @ApiResponse({ status: 409, description: 'Email ya registrado', type: ErrorResponseDto })
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar usuario parcialmente' })
  @ApiParam({ name: 'id', description: 'UUID del usuario' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Usuario actualizado', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado', type: ErrorResponseDto })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar usuario' })
  @ApiParam({ name: 'id', description: 'UUID del usuario' })
  @ApiResponse({ status: 204, description: 'Usuario eliminado exitosamente' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado', type: ErrorResponseDto })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
```

### 3.3 Documentar DTOs

```typescript
// dto/create-user.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength, IsEnum, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email del usuario (debe ser unico)',
    example: 'usuario@empresa.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Formato de email invalido' })
  email: string;

  @ApiProperty({
    description: 'Nombre completo del usuario',
    example: 'Juan Perez Garcia',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Contrasena del usuario',
    example: 'Password123!',
    minLength: 8,
    maxLength: 50,
    format: 'password',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  password: string;

  @ApiProperty({
    description: 'Rol del usuario en el sistema',
    enum: UserRole,
    example: UserRole.USER,
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({
    description: 'Numero de telefono (opcional)',
    example: '+52 55 1234 5678',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({
    description: 'Direccion del usuario',
    type: () => AddressDto,
  })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}

// dto/user-response.dto.ts
export class UserResponseDto {
  @ApiProperty({
    description: 'Identificador unico del usuario',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@empresa.com',
  })
  email: string;

  @ApiProperty({
    description: 'Nombre completo',
    example: 'Juan Perez Garcia',
  })
  name: string;

  @ApiProperty({
    description: 'Estado del usuario',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @ApiProperty({
    description: 'Fecha de creacion',
    example: '2026-02-02T10:30:00.000Z',
    format: 'date-time',
  })
  createdAt: string;

  @ApiPropertyOptional({
    description: 'Fecha de ultima actualizacion',
    example: '2026-02-02T15:45:00.000Z',
    format: 'date-time',
  })
  updatedAt?: string;
}

// dto/error-response.dto.ts
export class ErrorResponseDto {
  @ApiProperty({
    description: 'Codigo de error unico',
    example: 'USER_NOT_FOUND',
  })
  code: string;

  @ApiProperty({
    description: 'Mensaje descriptivo del error',
    example: 'Usuario con ID 550e8400... no encontrado',
  })
  message: string;

  @ApiProperty({
    description: 'Timestamp del error',
    example: '2026-02-02T10:30:00.000Z',
    format: 'date-time',
  })
  timestamp: string;

  @ApiPropertyOptional({
    description: 'Ruta que genero el error',
    example: '/api/v1/users/550e8400...',
  })
  path?: string;

  @ApiPropertyOptional({
    description: 'Detalles adicionales del error (para validaciones)',
    type: [ValidationErrorDetail],
  })
  errors?: ValidationErrorDetail[];
}

export class ValidationErrorDetail {
  @ApiProperty({ example: 'email' })
  field: string;

  @ApiProperty({ example: ['Formato de email invalido'] })
  constraints: string[];
}
```

---

## 4. Codigos de Respuesta HTTP

### 4.1 Codigos 2xx (Exito)

| Codigo | Nombre | Uso | Ejemplo |
|--------|--------|-----|---------|
| 200 | OK | Operacion exitosa con contenido | GET, PATCH, PUT |
| 201 | Created | Recurso creado exitosamente | POST |
| 204 | No Content | Operacion exitosa sin contenido | DELETE |

```typescript
// 200 OK - Respuesta con datos
@Get(':id')
async findOne(@Param('id') id: string): Promise<UserResponseDto> {
  return this.usersService.findOne(id); // Automaticamente 200
}

// 201 Created - Recurso creado
@Post()
@HttpCode(HttpStatus.CREATED)
async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
  return this.usersService.create(dto);
}

// 204 No Content - Sin cuerpo de respuesta
@Delete(':id')
@HttpCode(HttpStatus.NO_CONTENT)
async remove(@Param('id') id: string): Promise<void> {
  return this.usersService.remove(id);
}
```

### 4.2 Codigos 4xx (Error del Cliente)

| Codigo | Nombre | Uso | Cuando Usar |
|--------|--------|-----|-------------|
| 400 | Bad Request | Sintaxis invalida | JSON malformado, tipos incorrectos |
| 401 | Unauthorized | Sin autenticacion | Token ausente o invalido |
| 403 | Forbidden | Sin autorizacion | Permisos insuficientes |
| 404 | Not Found | Recurso no existe | ID no encontrado |
| 409 | Conflict | Conflicto de estado | Email duplicado |
| 422 | Unprocessable Entity | Validacion de negocio | Reglas de negocio violadas |
| 429 | Too Many Requests | Rate limit excedido | Demasiadas solicitudes |

```typescript
// 400 Bad Request - Validacion de formato/sintaxis
throw new BadRequestException({
  code: 'VALIDATION_ERROR',
  message: 'Datos de entrada invalidos',
  errors: [
    { field: 'email', constraints: ['Formato de email invalido'] },
  ],
});

// 401 Unauthorized - Sin autenticacion
throw new UnauthorizedException({
  code: 'AUTH_TOKEN_INVALID',
  message: 'Token de autenticacion invalido o expirado',
});

// 403 Forbidden - Sin permisos
throw new ForbiddenException({
  code: 'AUTHZ_INSUFFICIENT_PERMISSIONS',
  message: 'No tiene permisos para realizar esta accion',
});

// 404 Not Found - Recurso no existe
throw new NotFoundException({
  code: 'USER_NOT_FOUND',
  message: `Usuario con ID '${id}' no encontrado`,
});

// 409 Conflict - Estado conflictivo
throw new ConflictException({
  code: 'EMAIL_ALREADY_EXISTS',
  message: `El email '${email}' ya esta registrado`,
});

// 422 Unprocessable Entity - Regla de negocio
throw new UnprocessableEntityException({
  code: 'BUSINESS_INSUFFICIENT_STOCK',
  message: 'Stock insuficiente para completar la orden',
});
```

### 4.3 Codigos 5xx (Error del Servidor)

| Codigo | Nombre | Uso |
|--------|--------|-----|
| 500 | Internal Server Error | Error no manejado |
| 502 | Bad Gateway | Error en servicio externo |
| 503 | Service Unavailable | Servicio temporalmente no disponible |
| 504 | Gateway Timeout | Timeout en servicio externo |

```typescript
// 500 Internal Server Error - Error no esperado
throw new InternalServerErrorException({
  code: 'INTERNAL_ERROR',
  message: 'Ha ocurrido un error interno. Por favor intente mas tarde.',
});

// 503 Service Unavailable - Mantenimiento
throw new ServiceUnavailableException({
  code: 'SERVICE_MAINTENANCE',
  message: 'El servicio esta en mantenimiento. Intente en 30 minutos.',
});
```

### 4.4 Tabla de Decision: Que Codigo Usar

| Situacion | Codigo |
|-----------|--------|
| JSON malformado | 400 |
| Campo requerido faltante | 400 |
| Tipo de dato incorrecto | 400 |
| Token JWT ausente | 401 |
| Token JWT expirado | 401 |
| Token JWT invalido | 401 |
| Usuario sin rol necesario | 403 |
| Acceso a recurso de otro usuario | 403 |
| ID no existe en BD | 404 |
| Ruta no existe | 404 |
| Email ya registrado | 409 |
| Estado no permite operacion | 409 |
| Stock insuficiente | 422 |
| Fecha en el pasado | 422 |
| Error de base de datos | 500 |
| Servicio externo fallo | 502 |

---

## 5. Formato de Respuestas

### 5.1 Estructura Estandar para Exito

```typescript
// Respuesta individual
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "usuario@empresa.com",
    "name": "Juan Perez",
    "status": "ACTIVE",
    "createdAt": "2026-02-02T10:30:00.000Z"
  }
}

// Respuesta de coleccion paginada
{
  "data": [
    { "id": "...", "email": "...", "name": "..." },
    { "id": "...", "email": "...", "name": "..." }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 5.2 Estructura Estandar para Errores

```typescript
// Error simple
{
  "code": "USER_NOT_FOUND",
  "message": "Usuario con ID '550e8400...' no encontrado",
  "timestamp": "2026-02-02T10:30:00.000Z",
  "path": "/api/v1/users/550e8400..."
}

// Error de validacion con detalles
{
  "code": "VALIDATION_ERROR",
  "message": "Error de validacion en los datos de entrada",
  "timestamp": "2026-02-02T10:30:00.000Z",
  "path": "/api/v1/users",
  "errors": [
    {
      "field": "email",
      "constraints": ["Formato de email invalido"]
    },
    {
      "field": "password",
      "constraints": [
        "Debe tener al menos 8 caracteres",
        "Debe contener al menos una mayuscula"
      ]
    }
  ]
}
```

### 5.3 Implementacion con Interceptor

```typescript
// interceptors/response.interceptor.ts
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map(data => {
        // Si ya tiene formato de paginacion, mantenerlo
        if (data && 'data' in data && 'meta' in data) {
          return data;
        }
        // Envolver en estructura estandar
        return { data };
      }),
    );
  }
}

// interfaces/api-response.interface.ts
export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ErrorResponse {
  code: string;
  message: string;
  timestamp: string;
  path?: string;
  errors?: ValidationError[];
}
```

---

## 6. Paginacion y Filtros

### 6.1 Query Parameters Estandar

| Parametro | Tipo | Default | Descripcion |
|-----------|------|---------|-------------|
| `page` | number | 1 | Numero de pagina (1-indexed) |
| `limit` | number | 10 | Items por pagina (max 100) |
| `sort` | string | createdAt:desc | Campo:direccion |
| `search` | string | - | Busqueda general |
| `filter[campo]` | string | - | Filtro especifico |

**Ejemplos de URLs:**

```
GET /api/v1/users?page=2&limit=20
GET /api/v1/users?sort=name:asc
GET /api/v1/users?sort=createdAt:desc,name:asc
GET /api/v1/users?search=juan
GET /api/v1/users?filter[status]=ACTIVE
GET /api/v1/users?filter[role]=ADMIN&filter[status]=ACTIVE
GET /api/v1/users?page=1&limit=10&sort=name:asc&filter[status]=ACTIVE
```

### 6.2 DTO de Paginacion

```typescript
// dto/pagination.dto.ts
import { IsOptional, IsInt, Min, Max, IsString, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({
    description: 'Numero de pagina',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items por pagina',
    minimum: 1,
    maximum: 100,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Ordenamiento (campo:asc|desc)',
    example: 'createdAt:desc',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z]+:(asc|desc)(,[a-zA-Z]+:(asc|desc))*$/, {
    message: 'Formato de ordenamiento invalido. Use: campo:asc o campo:desc',
  })
  sort?: string = 'createdAt:desc';

  @ApiPropertyOptional({
    description: 'Busqueda general',
    example: 'juan',
  })
  @IsOptional()
  @IsString()
  search?: string;

  get skip(): number {
    return (this.page - 1) * this.limit;
  }

  get take(): number {
    return this.limit;
  }

  parseSort(): { field: string; order: 'ASC' | 'DESC' }[] {
    if (!this.sort) return [{ field: 'createdAt', order: 'DESC' }];

    return this.sort.split(',').map(part => {
      const [field, order] = part.split(':');
      return {
        field,
        order: order.toUpperCase() as 'ASC' | 'DESC',
      };
    });
  }
}

// dto/paginated-response.dto.ts
export class PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;

  static create<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedResponse<T> {
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }
}
```

### 6.3 Implementacion en Service

```typescript
// users.service.ts
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findAll(query: PaginationDto): Promise<PaginatedResponse<UserResponseDto>> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Aplicar busqueda
    if (query.search) {
      queryBuilder.andWhere(
        '(user.name ILIKE :search OR user.email ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    // Aplicar ordenamiento
    const sortOptions = query.parseSort();
    sortOptions.forEach(({ field, order }) => {
      queryBuilder.addOrderBy(`user.${field}`, order);
    });

    // Contar total
    const total = await queryBuilder.getCount();

    // Aplicar paginacion
    queryBuilder.skip(query.skip).take(query.take);

    // Ejecutar query
    const users = await queryBuilder.getMany();

    // Mapear a DTOs
    const data = users.map(user => UserMapper.toResponse(user));

    return PaginatedResponse.create(data, total, query.page, query.limit);
  }
}
```

### 6.4 Filtros Avanzados

```typescript
// dto/user-filter.dto.ts
export class UserFilterDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    enum: UserStatus,
  })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;

  @ApiPropertyOptional({
    description: 'Filtrar por rol',
    enum: UserRole,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({
    description: 'Filtrar por fecha de creacion (desde)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por fecha de creacion (hasta)',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsDateString()
  createdTo?: string;
}

// Aplicacion en service
async findAll(query: UserFilterDto): Promise<PaginatedResponse<UserResponseDto>> {
  const queryBuilder = this.userRepository.createQueryBuilder('user');

  if (query.status) {
    queryBuilder.andWhere('user.status = :status', { status: query.status });
  }

  if (query.role) {
    queryBuilder.andWhere('user.role = :role', { role: query.role });
  }

  if (query.createdFrom) {
    queryBuilder.andWhere('user.createdAt >= :from', { from: query.createdFrom });
  }

  if (query.createdTo) {
    queryBuilder.andWhere('user.createdAt <= :to', { to: query.createdTo });
  }

  // ... resto de la logica
}
```

---

## 7. Rate Limiting

### 7.1 Configuracion con @nestjs/throttler

```typescript
// app.module.ts
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,   // 1 segundo
        limit: 3,    // 3 requests
      },
      {
        name: 'medium',
        ttl: 10000,  // 10 segundos
        limit: 20,   // 20 requests
      },
      {
        name: 'long',
        ttl: 60000,  // 1 minuto
        limit: 100,  // 100 requests
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

### 7.2 Headers de Rate Limit

```typescript
// interceptors/rate-limit-headers.interceptor.ts
@Injectable()
export class RateLimitHeadersInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse();

    // Estos headers se calculan basados en la configuracion del throttler
    // En produccion, obtener valores reales del guard
    response.setHeader('X-RateLimit-Limit', '100');
    response.setHeader('X-RateLimit-Remaining', '95');
    response.setHeader('X-RateLimit-Reset', Math.floor(Date.now() / 1000) + 60);

    return next.handle();
  }
}
```

### 7.3 Respuesta 429 Personalizada

```typescript
// filters/throttle-exception.filter.ts
@Catch(ThrottlerException)
export class ThrottleExceptionFilter implements ExceptionFilter {
  catch(exception: ThrottlerException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    response.status(429).json({
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Demasiadas solicitudes. Por favor espere antes de intentar nuevamente.',
      timestamp: new Date().toISOString(),
      path: request.url,
      retryAfter: 60, // segundos
    });
  }
}
```

### 7.4 Rate Limit por Endpoint

```typescript
// Limite especifico para endpoint sensible
@Controller('auth')
export class AuthController {
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 intentos por minuto
  async login(@Body() dto: LoginDto): Promise<TokenResponseDto> {
    return this.authService.login(dto);
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 300000 } }) // 3 por 5 minutos
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<void> {
    return this.authService.forgotPassword(dto);
  }
}

// Omitir rate limit para endpoints especificos
@Controller('health')
export class HealthController {
  @Get()
  @SkipThrottle()
  check(): { status: string } {
    return { status: 'ok' };
  }
}
```

---

## 8. Seguridad en APIs

> **Referencia completa:** La seguridad de APIs esta documentada en detalle en los estandares de seguridad dedicados.

| Tema | Referencia |
|------|-----------|
| OWASP Web Top 10 | [ESTANDAR-SEGURIDAD.md](ESTANDAR-SEGURIDAD.md) §1 |
| OWASP API Security Top 10 | [ESTANDAR-SEGURIDAD.md](ESTANDAR-SEGURIDAD.md) §1 |
| Validacion de Input (class-validator) | [ESTANDAR-SEGURIDAD.md](ESTANDAR-SEGURIDAD.md) §2 |
| Sanitizacion de Output | [ESTANDAR-SEGURIDAD.md](ESTANDAR-SEGURIDAD.md) §3 |
| Headers de Seguridad (Helmet) | [ESTANDAR-SEGURIDAD.md](ESTANDAR-SEGURIDAD.md) §7 |

### Resumen Rapido

Los endpoints de GAMILIT DEBEN cumplir:

1. **CORS:** Configurado via `@nestjs/common` con whitelist de origenes permitidos
2. **Input:** Todos los DTOs usan `class-validator` + `ValidationPipe` global
3. **Output:** Response DTOs con `@Exclude()` para campos sensibles
4. **Headers:** Helmet middleware habilitado globalmente
5. **Rate Limiting:** `@nestjs/throttler` con limites por endpoint (ver §7 de este documento)

---

## 9. Checklist de Validacion

### 9.1 Checklist RESTful

- [ ] URLs usan sustantivos en plural
- [ ] URLs en minusculas con guiones
- [ ] No hay verbos en las URLs
- [ ] Verbos HTTP usados correctamente
- [ ] Subrecursos anidados cuando corresponde

### 9.2 Checklist Versionamiento

- [ ] API tiene prefijo de version `/api/v1/`
- [ ] Politica de deprecacion documentada
- [ ] Headers de deprecacion en endpoints obsoletos

### 9.3 Checklist Swagger

- [ ] Todos los endpoints tienen @ApiOperation
- [ ] Todos los parametros documentados (@ApiParam, @ApiQuery)
- [ ] Todos los DTOs con @ApiProperty
- [ ] Todos los codigos de respuesta documentados (@ApiResponse)
- [ ] Ejemplos incluidos en la documentacion
- [ ] Autenticacion documentada (@ApiBearerAuth)

### 9.4 Checklist Codigos HTTP

- [ ] 200 para GET/PATCH/PUT exitosos
- [ ] 201 para POST exitoso (creacion)
- [ ] 204 para DELETE exitoso
- [ ] 400 para errores de formato/sintaxis
- [ ] 401 para falta de autenticacion
- [ ] 403 para falta de autorizacion
- [ ] 404 para recursos no encontrados
- [ ] 409 para conflictos de estado
- [ ] 422 para errores de logica de negocio

### 9.5 Checklist Respuestas

- [ ] Estructura consistente: `{ data, meta? }`
- [ ] Errores con: `{ code, message, timestamp }`
- [ ] Paginacion incluye metadata completa
- [ ] Campos sensibles excluidos de respuestas

### 9.6 Checklist Seguridad

> Ver checklist completo en [ESTANDAR-SEGURIDAD.md](ESTANDAR-SEGURIDAD.md).

Verificaciones minimas para endpoints de esta API:

- [ ] CORS configurado con whitelist de origenes (ver §8 de este documento)
- [ ] ValidationPipe global activo con `whitelist: true`
- [ ] Helmet middleware habilitado globalmente
- [ ] Rate limiting implementado (ver §7 de este documento)
- [ ] Response DTOs con `@Exclude()` en campos sensibles

---

## Referencias

### Seguridad
- [ESTANDAR-SEGURIDAD](ESTANDAR-SEGURIDAD.md) - OWASP Top 10, autenticacion JWT, validacion de inputs

### Relacionados
- [ESTANDAR-BACKEND-PROFESIONAL.md](./ESTANDAR-BACKEND-PROFESIONAL.md) - Patrones backend
- [ESTANDAR-CODIGO.md](./ESTANDAR-CODIGO.md) - Convenciones de codigo
- [ESTANDAR-NOMENCLATURA.md](./ESTANDAR-NOMENCLATURA.md) - Nombres de archivos
- [NestJS Documentation](https://docs.nestjs.com/) - Documentacion oficial
- [Swagger/OpenAPI](https://swagger.io/) - Especificacion OpenAPI
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) - Codigos HTTP MDN
