# Convenciones de API REST

**Versión:** 1.0.0
**Última Actualización:** 2025-11-28
**Aplica a:** apps/backend/src/modules/*/controllers/

---

## Resumen

Este documento define las convenciones para diseñar y documentar endpoints REST en GAMILIT. Todos los endpoints siguen estándares RESTful con documentación OpenAPI/Swagger.

---

## Estructura de URLs

### Patrón Base

```
/api/v1/{resource}
/api/v1/{resource}/{id}
/api/v1/{resource}/{id}/{sub-resource}
```

### Ejemplos

| Operación | Método | URL |
|-----------|--------|-----|
| Listar usuarios | GET | `/api/v1/users` |
| Obtener usuario | GET | `/api/v1/users/:id` |
| Crear usuario | POST | `/api/v1/users` |
| Actualizar usuario | PATCH | `/api/v1/users/:id` |
| Eliminar usuario | DELETE | `/api/v1/users/:id` |
| Logros del usuario | GET | `/api/v1/users/:id/achievements` |

---

## Códigos de Estado HTTP

| Código | Significado | Cuándo Usar |
|--------|-------------|-------------|
| 200 | OK | GET exitoso, PATCH exitoso |
| 201 | Created | POST exitoso |
| 204 | No Content | DELETE exitoso |
| 400 | Bad Request | Validación fallida |
| 401 | Unauthorized | No autenticado |
| 403 | Forbidden | Sin permisos |
| 404 | Not Found | Recurso no existe |
| 409 | Conflict | Duplicado o conflicto de estado |
| 422 | Unprocessable Entity | Lógica de negocio fallida |
| 500 | Internal Server Error | Error del servidor |

---

## Formato de Respuestas

### Respuesta Exitosa Simple

```json
{
  "id": "uuid",
  "name": "Ejemplo",
  "createdAt": "2025-11-28T10:00:00Z"
}
```

### Respuesta Exitosa Paginada

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
    "totalPages": 5
  }
}
```

### Respuesta de Error

```json
{
  "statusCode": 400,
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

## Decoradores de Controlador

### Controlador Básico

```typescript
@Controller('api/v1/achievements')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Achievements')
@ApiBearerAuth()
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}
}
```

### Endpoint GET (Listar)

```typescript
@Get()
@Roles('admin', 'teacher', 'student')
@ApiOperation({ summary: 'List all achievements' })
@ApiQuery({ name: 'page', required: false, type: Number })
@ApiQuery({ name: 'limit', required: false, type: Number })
@ApiQuery({ name: 'category', required: false, type: String })
@ApiResponse({ status: 200, description: 'List of achievements', type: [AchievementResponseDto] })
async findAll(
  @Query() query: ListAchievementsDto,
): Promise<PaginatedResponse<AchievementResponseDto>> {
  return this.achievementsService.findAll(query);
}
```

### Endpoint GET (Uno)

```typescript
@Get(':id')
@Roles('admin', 'teacher', 'student')
@ApiOperation({ summary: 'Get achievement by ID' })
@ApiParam({ name: 'id', type: String, description: 'Achievement UUID' })
@ApiResponse({ status: 200, description: 'Achievement details', type: AchievementResponseDto })
@ApiResponse({ status: 404, description: 'Achievement not found' })
async findOne(
  @Param('id', ParseUUIDPipe) id: string,
): Promise<AchievementResponseDto> {
  return this.achievementsService.findOne(id);
}
```

### Endpoint POST

```typescript
@Post()
@Roles('admin')
@ApiOperation({ summary: 'Create new achievement' })
@ApiBody({ type: CreateAchievementDto })
@ApiResponse({ status: 201, description: 'Achievement created', type: AchievementResponseDto })
@ApiResponse({ status: 400, description: 'Validation failed' })
async create(
  @Body() createDto: CreateAchievementDto,
  @CurrentUser() user: UserEntity,
): Promise<AchievementResponseDto> {
  return this.achievementsService.create(createDto, user.id);
}
```

### Endpoint PATCH

```typescript
@Patch(':id')
@Roles('admin')
@ApiOperation({ summary: 'Update achievement' })
@ApiParam({ name: 'id', type: String })
@ApiBody({ type: UpdateAchievementDto })
@ApiResponse({ status: 200, description: 'Achievement updated', type: AchievementResponseDto })
@ApiResponse({ status: 404, description: 'Achievement not found' })
async update(
  @Param('id', ParseUUIDPipe) id: string,
  @Body() updateDto: UpdateAchievementDto,
): Promise<AchievementResponseDto> {
  return this.achievementsService.update(id, updateDto);
}
```

### Endpoint DELETE

```typescript
@Delete(':id')
@Roles('admin')
@HttpCode(HttpStatus.NO_CONTENT)
@ApiOperation({ summary: 'Delete achievement' })
@ApiParam({ name: 'id', type: String })
@ApiResponse({ status: 204, description: 'Achievement deleted' })
@ApiResponse({ status: 404, description: 'Achievement not found' })
async remove(
  @Param('id', ParseUUIDPipe) id: string,
): Promise<void> {
  return this.achievementsService.remove(id);
}
```

---

## DTOs de Request

### CreateDto

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
  xpReward: number;

  @ApiProperty({ description: 'Category ID', format: 'uuid' })
  @IsUUID()
  categoryId: string;
}
```

### UpdateDto

```typescript
export class UpdateAchievementDto extends PartialType(
  OmitType(CreateAchievementDto, ['categoryId'] as const)
) {}
```

### ListDto (Query Params)

```typescript
export class ListAchievementsDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by category' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ enum: ['name', 'createdAt', 'xpReward'] })
  @IsOptional()
  @IsIn(['name', 'createdAt', 'xpReward'])
  sortBy?: string;
}
```

---

## DTOs de Response

```typescript
export class AchievementResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  xpReward: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}
```

---

## Validación

### Pipes Globales

```typescript
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,           // Eliminar propiedades no definidas
    forbidNonWhitelisted: true, // Error si hay propiedades extras
    transform: true,           // Transformar a tipos correctos
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
```

### Pipes Específicos

```typescript
@Get(':id')
async findOne(
  @Param('id', ParseUUIDPipe) id: string,  // Valida UUID
  @Query('limit', ParseIntPipe) limit: number, // Valida entero
) { }
```

---

## Documentación Swagger

### Acceso
- URL: `http://localhost:3000/api/docs`
- JSON: `http://localhost:3000/api/docs-json`

### Configuración

```typescript
// main.ts
const config = new DocumentBuilder()
  .setTitle('GAMILIT API')
  .setDescription('API de gamificación educativa')
  .setVersion('2.3.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

---

## Endpoints por Módulo

### Auth (`/api/v1/auth`)
- POST `/register` - Registrar usuario
- POST `/login` - Iniciar sesión
- POST `/logout` - Cerrar sesión
- POST `/refresh` - Refrescar token
- POST `/forgot-password` - Solicitar reset
- POST `/reset-password` - Aplicar reset

### Gamification (`/api/v1/gamification`)
- GET `/stats` - Estadísticas del usuario
- GET `/achievements` - Logros disponibles
- GET `/achievements/user` - Logros del usuario
- GET `/leaderboard` - Tabla de posiciones
- GET `/ranks` - Rangos Maya
- POST `/comodines/purchase` - Comprar comodín
- POST `/comodines/use` - Usar comodín

### Educational (`/api/v1/educational`)
- GET `/modules` - Módulos educativos
- GET `/exercises` - Ejercicios
- POST `/exercises/:id/submit` - Enviar respuesta

### Progress (`/api/v1/progress`)
- GET `/sessions` - Sesiones de aprendizaje
- GET `/submissions` - Entregas del usuario
- GET `/module/:id` - Progreso por módulo

---

## Buenas Prácticas

1. **Versionado en URL**: Siempre `/api/v1/`
2. **Recursos en plural**: `/users`, no `/user`
3. **Verbos HTTP correctos**: GET lee, POST crea, PATCH actualiza, DELETE elimina
4. **IDs en URL**: No en query params para recursos específicos
5. **Filtros en query**: `?status=active&page=1`
6. **Documentar todo**: Cada endpoint con @ApiOperation
7. **Validar entrada**: Usar DTOs con class-validator
8. **Respuestas consistentes**: Mismo formato siempre

---

## Ver También

- [ERROR-HANDLING.md](../ERROR-HANDLING.md) - Manejo de errores
- [ESTRUCTURA-MODULOS.md](../ESTRUCTURA-MODULOS.md) - Estructura de módulos
- Swagger UI: `http://localhost:3000/api/docs`
