---
titulo: Estándares de API REST
tipo: guia
dominio: backend
ultima_actualizacion: 2026-02-27
---

# Estandares de API REST - GAMILIT

**Version:** 2.0.0
**Ultima Actualizacion:** 2026-02-03
**Estado:** Activo
**Aplica a:** apps/backend/src/modules/*/controllers/, apps/frontend/web/src/

---

## Resumen

Este documento consolida todos los estandares de API REST para GAMILIT, incluyendo:
- Convenciones de nomenclatura
- Estructura de URLs
- Formatos de request/response
- Manejo de errores
- Versionado
- Autenticacion
- Rate limiting
- Documentacion

**Documentos consolidados:**
- API-CONVENTIONS.md (archivado)
- NAMING-CONVENTIONS-API.md (archivado)

---

## 1. Convenciones de Nomenclatura

### 1.1 Regla General de Casing

| Contexto | Convencion | Ejemplo |
|----------|------------|---------|
| URLs/Endpoints | kebab-case | `/api/v1/user-profiles` |
| Query params | snake_case | `?sort_by=created_at` |
| JSON fields (Backend) | snake_case | `{ "first_name": "John" }` |
| JSON fields (Frontend interno) | camelCase | `{ firstName: "John" }` |
| Headers | kebab-case | `Content-Type`, `X-Request-Id` |

### 1.2 Transformacion Frontend-Backend

El frontend usa camelCase internamente pero DEBE transformar a snake_case antes de enviar al backend.

```typescript
// Tipos para Backend API
export interface RegisterPayload {
  email: string;
  password: string;
  first_name?: string;  // snake_case para backend
  last_name?: string;
}

// Tipos internos del Frontend
export interface RegisterFormData {
  email: string;
  password: string;
  firstName?: string;   // camelCase interno
  lastName?: string;
}

// Funcion de transformacion
function toBackendPayload(data: RegisterFormData): RegisterPayload {
  return {
    email: data.email,
    password: data.password,
    first_name: data.firstName,
    last_name: data.lastName
  };
}
```

### 1.3 Tabla de Referencia Rapida

| Frontend (camelCase) | Backend (snake_case) |
|---------------------|---------------------|
| firstName | first_name |
| lastName | last_name |
| displayName | display_name |
| avatarUrl | avatar_url |
| phoneNumber | phone_number |
| dateOfBirth | date_of_birth |
| createdAt | created_at |
| updatedAt | updated_at |

### 1.4 Errores Comunes de Nomenclatura

```typescript
// INCORRECTO - causa error 400/500
await apiClient.post('/auth/register', {
  firstName: "John",     // Backend no reconoce camelCase
  lastName: "Doe"
});

// CORRECTO
await apiClient.post('/auth/register', {
  first_name: "John",
  last_name: "Doe"
});
```

---

## 2. Estructura de URLs

### 2.1 Patron Base

```
{protocol}://{domain}:{port}/{globalPrefix}/{version}/{resource}
```

Ejemplos:
```
/api/v1/{resource}
/api/v1/{resource}/{id}
/api/v1/{resource}/{id}/{sub-resource}
```

### 2.2 Ejemplos de URLs

| Operacion | Metodo | URL |
|-----------|--------|-----|
| Listar usuarios | GET | `/api/v1/users` |
| Obtener usuario | GET | `/api/v1/users/:id` |
| Crear usuario | POST | `/api/v1/users` |
| Actualizar usuario | PATCH | `/api/v1/users/:id` |
| Eliminar usuario | DELETE | `/api/v1/users/:id` |
| Logros del usuario | GET | `/api/v1/users/:id/achievements` |

### 2.3 Separacion de Responsabilidades

```typescript
// baseURL contiene: protocolo + dominio + puerto + prefijo global
const baseURL = 'http://localhost:3006/api';

// endpoint contiene SOLO la ruta del recurso (sin /api)
const endpoint = '/health';
const endpoint = '/users';
const endpoint = '/exercises/123';
```

### 2.4 Prevencion de Duplicacion /api/api

```typescript
// INCORRECTO - genera /api/api/exercises
const endpoint = '/api/exercises';

// CORRECTO - baseURL ya incluye /api
const endpoint = '/exercises';
```

### 2.5 Trailing Slashes

```typescript
// CORRECTO - sin trailing slash
const endpoint = '/exercises';
const endpoint = '/users/123';

// EVITAR - trailing slash puede causar problemas
const endpoint = '/exercises/';
```

---

## 3. Formatos de Request/Response

### 3.1 Request Headers

```http
Content-Type: application/json
Authorization: Bearer {token}
Accept: application/json
X-Request-Id: {uuid}
```

### 3.2 Response Exitosa Simple

```json
{
  "id": "uuid",
  "name": "Ejemplo",
  "created_at": "2025-11-28T10:00:00Z"
}
```

### 3.3 Response Exitosa Paginada

```json
{
  "data": [
    { "id": "uuid1", "name": "Item 1" },
    { "id": "uuid2", "name": "Item 2" }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "total_pages": 5
  }
}
```

### 3.4 Response de Error

```json
{
  "status_code": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "must be a valid email"
    }
  ],
  "timestamp": "2025-11-28T10:00:00Z"
}
```

---

## 4. Codigos de Estado HTTP

| Codigo | Significado | Cuando Usar |
|--------|-------------|-------------|
| 200 | OK | GET exitoso, PATCH exitoso |
| 201 | Created | POST exitoso |
| 204 | No Content | DELETE exitoso |
| 400 | Bad Request | Validacion fallida |
| 401 | Unauthorized | No autenticado |
| 403 | Forbidden | Sin permisos |
| 404 | Not Found | Recurso no existe |
| 409 | Conflict | Duplicado o conflicto de estado |
| 422 | Unprocessable Entity | Logica de negocio fallida |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Error del servidor |

---

## 5. Manejo de Errores

### 5.1 Estructura de Error Estandar

```typescript
interface ApiError {
  status_code: number;
  message: string;
  errors?: FieldError[];
  error_code?: string;
  timestamp: string;
}

interface FieldError {
  field: string;
  message: string;
}
```

### 5.2 Codigos de Error de Negocio

| Codigo | Descripcion |
|--------|-------------|
| AUTH001 | Credenciales invalidas |
| AUTH002 | Token expirado |
| AUTH003 | Token invalido |
| VAL001 | Validacion de campo fallida |
| BIZ001 | Regla de negocio violada |
| RES001 | Recurso no encontrado |
| RES002 | Recurso duplicado |

### 5.3 Interceptor de Errores (Frontend)

```typescript
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 6. Versionado de API

### 6.1 Estrategia

- Versionado en URL: `/api/v1/`, `/api/v2/`
- Incremento mayor para breaking changes
- Mantener compatibilidad hacia atras minimo 6 meses

### 6.2 Configuracion Backend

```typescript
// main.ts
app.setGlobalPrefix('api');

// Controlador con version
@Controller('v1/users')
export class UsersV1Controller {}

@Controller('v2/users')
export class UsersV2Controller {}
```

---

## 7. Autenticacion

### 7.1 Esquema

- Tipo: Bearer Token (JWT)
- Header: `Authorization: Bearer {token}`
- Expiracion: 15 minutos (access token)
- Refresh: 7 dias (refresh token)

### 7.2 Endpoints de Auth

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/v1/auth/register` | POST | Registrar usuario |
| `/api/v1/auth/login` | POST | Iniciar sesion |
| `/api/v1/auth/logout` | POST | Cerrar sesion |
| `/api/v1/auth/refresh` | POST | Refrescar token |
| `/api/v1/auth/forgot-password` | POST | Solicitar reset |
| `/api/v1/auth/reset-password` | POST | Aplicar reset |

### 7.3 Decoradores de Autenticacion

```typescript
@Controller('api/v1/achievements')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Achievements')
@ApiBearerAuth()
export class AchievementsController {}
```

---

## 8. Rate Limiting

### 8.1 Limites por Defecto

| Tipo | Limite | Ventana |
|------|--------|---------|
| Anonimo | 100 req | 15 min |
| Autenticado | 1000 req | 15 min |
| Auth endpoints | 10 req | 5 min |

### 8.2 Headers de Rate Limit

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

## 9. Documentacion (Swagger/OpenAPI)

### 9.1 Acceso

- Swagger UI: `http://localhost:3006/api/docs`
- OpenAPI JSON: `http://localhost:3006/api/docs-json`

### 9.2 Configuracion

```typescript
const config = new DocumentBuilder()
  .setTitle('GAMILIT API')
  .setDescription('API de gamificacion educativa')
  .setVersion('2.3.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

### 9.3 Decoradores de Documentacion

```typescript
@Get()
@Roles('admin', 'teacher', 'student')
@ApiOperation({ summary: 'List all achievements' })
@ApiQuery({ name: 'page', required: false, type: Number })
@ApiQuery({ name: 'limit', required: false, type: Number })
@ApiResponse({ status: 200, description: 'List of achievements', type: [AchievementResponseDto] })
async findAll(@Query() query: ListAchievementsDto) {}
```

---

## 10. DTOs (Data Transfer Objects)

### 10.1 CreateDto

```typescript
export class CreateAchievementDto {
  @ApiProperty({ description: 'Achievement name', example: 'First Steps' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Achievement description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'XP reward', example: 50 })
  @IsInt()
  @Min(0)
  @Max(1000)
  xp_reward: number;

  @ApiProperty({ description: 'Category ID', format: 'uuid' })
  @IsUUID()
  category_id: string;
}
```

### 10.2 UpdateDto

```typescript
export class UpdateAchievementDto extends PartialType(
  OmitType(CreateAchievementDto, ['category_id'] as const)
) {}
```

### 10.3 ListDto (Query Params)

```typescript
export class ListAchievementsDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by category' })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ enum: ['name', 'created_at', 'xp_reward'] })
  @IsOptional()
  @IsIn(['name', 'created_at', 'xp_reward'])
  sort_by?: string;
}
```

### 10.4 ResponseDto

```typescript
export class AchievementResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  xp_reward: number;

  @ApiProperty()
  is_active: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  created_at: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updated_at: Date;
}
```

---

## 11. Validacion

### 11.1 Pipes Globales

```typescript
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
```

### 11.2 Pipes Especificos

```typescript
@Get(':id')
async findOne(
  @Param('id', ParseUUIDPipe) id: string,
  @Query('limit', ParseIntPipe) limit: number,
) {}
```

---

## 12. Configuracion del API Client (Frontend)

### 12.1 Configuracion Axios

```typescript
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de autenticacion
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 12.2 Variables de Entorno

```env
# .env.development
VITE_API_URL=http://localhost:3006

# .env.staging
VITE_API_URL=https://staging-api.gamilit.com

# .env.production
VITE_API_URL=https://api.gamilit.com
```

### 12.3 Servicios de API

```typescript
export const exerciseService = {
  async findAll() {
    const response = await apiClient.get('/exercises');
    return response.data;
  },

  async findById(id: string) {
    const response = await apiClient.get(`/exercises/${id}`);
    return response.data;
  },

  async submitAnswer(id: string, answer: SubmitAnswerDto) {
    const response = await apiClient.post(`/exercises/${id}/submit`, answer);
    return response.data;
  },
};
```

---

## 13. Configuracion Backend (NestJS)

### 13.1 Prefijo Global

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  await app.listen(3000);
}
```

### 13.2 Controladores

```typescript
// Sin prefijo /api porque se agrega globalmente
@Controller('exercises')
export class ExercisesController {
  @Get()
  async findAll() {
    // Ruta final: GET /api/exercises
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    // Ruta final: GET /api/exercises/:id
  }

  @Post(':id/submit')
  async submitAnswer(@Param('id') id: string, @Body() dto: SubmitAnswerDto) {
    // Ruta final: POST /api/exercises/:id/submit
  }
}
```

---

## 14. Endpoints por Modulo

### 14.1 Auth (`/api/v1/auth`)

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/register` | Registrar usuario |
| POST | `/login` | Iniciar sesion |
| POST | `/logout` | Cerrar sesion |
| POST | `/refresh` | Refrescar token |
| POST | `/forgot-password` | Solicitar reset |
| POST | `/reset-password` | Aplicar reset |

### 14.2 Gamification (`/api/v1/gamification`)

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/stats` | Estadisticas del usuario |
| GET | `/achievements` | Logros disponibles |
| GET | `/achievements/user` | Logros del usuario |
| GET | `/leaderboard` | Tabla de posiciones |
| GET | `/ranks` | Rangos Maya |
| POST | `/comodines/purchase` | Comprar comodin |
| POST | `/comodines/use` | Usar comodin |

### 14.3 Educational (`/api/v1/educational`)

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/modules` | Modulos educativos |
| GET | `/exercises` | Ejercicios |
| POST | `/exercises/:id/submit` | Enviar respuesta |

### 14.4 Progress (`/api/v1/progress`)

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/sessions` | Sesiones de aprendizaje |
| GET | `/submissions` | Entregas del usuario |
| GET | `/module/:id` | Progreso por modulo |

---

## 15. Buenas Practicas

1. **Versionado en URL**: Siempre `/api/v1/`
2. **Recursos en plural**: `/users`, no `/user`
3. **Verbos HTTP correctos**: GET lee, POST crea, PATCH actualiza, DELETE elimina
4. **IDs en URL**: No en query params para recursos especificos
5. **Filtros en query**: `?status=active&page=1`
6. **Documentar todo**: Cada endpoint con @ApiOperation
7. **Validar entrada**: Usar DTOs con class-validator
8. **Respuestas consistentes**: Mismo formato siempre
9. **snake_case en JSON**: Para compatibilidad con PostgreSQL
10. **Sin trailing slashes**: Evitar `/users/` en favor de `/users`

---

## 16. Checklists de Validacion

### 16.1 Pre-Implementacion

- [ ] baseURL incluye protocolo + dominio + puerto + `/api`
- [ ] baseURL NO incluye rutas de recursos
- [ ] Endpoints NO incluyen prefijo `/api`
- [ ] Endpoints comienzan con `/`
- [ ] NO hay trailing slashes innecesarios
- [ ] Variables de entorno configuradas
- [ ] CORS configurado correctamente
- [ ] Prefijo global en `main.ts`

### 16.2 Post-Implementacion

- [ ] Probar endpoint en navegador (Network tab)
- [ ] URL final no tiene duplicados (/api/api/)
- [ ] Respuesta correcta (200 OK)
- [ ] No hay errores de CORS
- [ ] Token de autenticacion se envia
- [ ] Campos usan snake_case

### 16.3 Code Review

- [ ] NO hay `/api` hardcodeado en endpoints
- [ ] baseURL configurado correctamente
- [ ] Se usan variables de entorno
- [ ] NO hay URLs absolutas hardcodeadas
- [ ] Controladores usan rutas relativas
- [ ] Hay manejo de errores

---

## Ver Tambien

- [ERROR-HANDLING.md](./ERROR-HANDLING.md) - Manejo de errores detallado
- [ESTRUCTURA-MODULOS.md](./ESTRUCTURA-MODULOS.md) - Estructura de modulos
- [DTO-CONVENTIONS.md](./DTO-CONVENTIONS.md) - Convenciones de DTOs
- Swagger UI: `http://localhost:3006/api/docs`

---

## Historial de Cambios

| Version | Fecha | Cambios |
|---------|-------|---------|
| 2.0.0 | 2026-02-03 | Consolidacion de API-CONVENTIONS.md, NAMING-CONVENTIONS-API.md y API-STANDARDS.md |
| 1.0.0 | 2025-11-29 | Version inicial |

---

**Documento consolidado:** 2026-02-03
**Documentos archivados:** API-CONVENTIONS.md, NAMING-CONVENTIONS-API.md
**Responsable:** @DOC_AGENT
