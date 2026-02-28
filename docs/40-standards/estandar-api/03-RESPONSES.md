---
titulo: Estandar de API - Codigos de Respuesta HTTP y Formato de Respuestas
status: activo
last_updated: "2026-02-28"
---

# Codigos de Respuesta HTTP y Formato de Respuestas

> Codigos HTTP correctos y estructura estandar de respuestas para APIs NestJS

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
