---
titulo: Estandar de API - RESTful Conventions y Versionamiento
status: activo
last_updated: "2026-02-28"
---

# RESTful Conventions y Versionamiento

> Convenciones RESTful y politicas de versionamiento para APIs backend con NestJS

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
