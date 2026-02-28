---
titulo: Estandar de API - Documentacion Swagger
status: activo
last_updated: "2026-02-28"
---

# Documentacion Swagger

> Configuracion y uso de Swagger/OpenAPI para documentacion de endpoints NestJS

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
