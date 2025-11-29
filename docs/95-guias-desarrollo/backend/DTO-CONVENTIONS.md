# Convenciones de DTOs - Backend GAMILIT

**Fecha de creacion:** 2025-11-29
**Version:** 1.0
**Estado:** VIGENTE
**Contexto:** Estandarizacion de DTOs para eliminar duplicaciones

---

## 1. Principios Fundamentales

### 1.1 Proposito de los DTOs
- **Data Transfer Objects**: Transportar datos entre capas
- **Validacion**: Aplicar reglas de validacion con `class-validator`
- **Documentacion API**: Generar schemas Swagger con `@nestjs/swagger`
- **Transformacion**: Convertir/serializar datos con `class-transformer`

### 1.2 NO Duplicar
**Prohibido:**
- Crear DTOs con estructura identica a otros existentes
- Copiar campos entre DTOs sin usar herencia/composicion

**Permitido:**
- Extender DTOs base (`extends`)
- Usar utility types (`PartialType`, `OmitType`, `PickType`)
- Crear DTOs genericos reutilizables

---

## 2. DTOs Genericos Base

### 2.1 PaginatedResponseDto<T>
**Ubicacion:** `/shared/dto/common/paginated-response.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class PaginatedResponseDto<T> {
  @ApiProperty({ description: 'Array de elementos', isArray: true })
  data!: T[];

  @ApiProperty({ description: 'Total de elementos', example: 100 })
  total!: number;

  @ApiProperty({ description: 'Pagina actual', example: 1 })
  page!: number;

  @ApiProperty({ description: 'Elementos por pagina', example: 10 })
  limit!: number;

  @ApiProperty({ description: 'Total de paginas', example: 10 })
  total_pages!: number;
}
```

**Uso:**
```typescript
import { PaginatedResponseDto } from '@shared/dto/common';

// Extender para tipo especifico
export class PaginatedUsersDto extends PaginatedResponseDto<UserDetailsDto> {}

// O usar directamente en controller
@ApiOkResponse({ type: () => PaginatedResponseDto<UserDetailsDto> })
async getUsers(): Promise<PaginatedResponseDto<UserDetailsDto>> { ... }
```

### 2.2 BaseResponseDto
**Ubicacion:** `/shared/dto/common/base-response.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { Exclude } from 'class-transformer';

@Exclude()
export class BaseResponseDto {
  @Expose()
  @ApiProperty({ description: 'ID unico', example: 'uuid-here' })
  id!: string;

  @Expose()
  @Type(() => Date)
  @ApiProperty({ description: 'Fecha de creacion' })
  created_at!: Date;

  @Expose()
  @Type(() => Date)
  @ApiProperty({ description: 'Fecha de actualizacion' })
  updated_at!: Date;
}
```

**Uso:**
```typescript
import { BaseResponseDto } from '@shared/dto/common';

export class UserResponseDto extends BaseResponseDto {
  @Expose()
  @ApiProperty()
  email!: string;

  @Expose()
  @ApiProperty()
  username!: string;
}
```

---

## 3. Estructura de Carpetas

### 3.1 DTOs por Modulo
```
modules/[moduleName]/
└── dto/
    ├── index.ts                    # Barrel export
    ├── create-[entity].dto.ts      # DTO para crear
    ├── update-[entity].dto.ts      # DTO para actualizar
    ├── [entity]-response.dto.ts    # DTO de respuesta
    ├── [entity]-filters.dto.ts     # DTO para filtros/query
    └── [subdominio]/               # Subdominios si hay muchos
        ├── index.ts
        └── *.dto.ts
```

### 3.2 DTOs Compartidos
```
shared/
└── dto/
    ├── common/
    │   ├── index.ts
    │   ├── paginated-response.dto.ts
    │   └── base-response.dto.ts
    ├── auth/
    │   └── *.dto.ts
    └── notifications/
        └── *.dto.ts
```

---

## 4. Convenciones de Nombrado

### 4.1 Nombres de Archivos
| Tipo | Patron | Ejemplo |
|------|--------|---------|
| Crear | `create-[entity].dto.ts` | `create-user.dto.ts` |
| Actualizar | `update-[entity].dto.ts` | `update-user.dto.ts` |
| Respuesta | `[entity]-response.dto.ts` | `user-response.dto.ts` |
| Filtros | `[entity]-filters.dto.ts` | `user-filters.dto.ts` |
| Paginado | `paginated-[entities].dto.ts` | `paginated-users.dto.ts` |
| Listado | `list-[entities].dto.ts` | `list-users.dto.ts` |

### 4.2 Nombres de Clases
| Tipo | Patron | Ejemplo |
|------|--------|---------|
| Crear | `Create[Entity]Dto` | `CreateUserDto` |
| Actualizar | `Update[Entity]Dto` | `UpdateUserDto` |
| Respuesta | `[Entity]ResponseDto` | `UserResponseDto` |
| Detalles | `[Entity]DetailsDto` | `UserDetailsDto` |

### 4.3 Campos (snake_case para DB)
```typescript
// Campos que mapean a base de datos: snake_case
export class UserResponseDto {
  user_id!: string;        // snake_case (DB)
  created_at!: Date;       // snake_case (DB)
  total_xp!: number;       // snake_case (DB)
}

// Campos calculados o de UI: camelCase
export class UserFiltersDto {
  searchQuery?: string;    // camelCase (no DB)
  sortOrder?: string;      // camelCase (no DB)
}
```

---

## 5. Decoradores de Validacion

### 5.1 Decoradores Requeridos
```typescript
import {
  IsString, IsEmail, IsNotEmpty, IsOptional,
  IsUUID, IsEnum, IsBoolean, IsNumber,
  MinLength, MaxLength, Min, Max,
  IsArray, ArrayNotEmpty, ValidateNested
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
```

### 5.2 Patron Estandar
```typescript
export class CreateUserDto {
  // Campo requerido
  @ApiProperty({ description: 'Email del usuario', example: 'user@example.com' })
  @IsEmail({}, { message: 'Formato de email invalido' })
  @IsNotEmpty({ message: 'Email es requerido' })
  email!: string;

  // Campo opcional
  @ApiPropertyOptional({ description: 'Nombre del usuario' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  // Campo enum
  @ApiProperty({ enum: UserRoleEnum, description: 'Rol del usuario' })
  @IsEnum(UserRoleEnum, { message: 'Rol invalido' })
  role!: UserRoleEnum;

  // Campo nested
  @ApiProperty({ type: () => AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  address!: AddressDto;
}
```

### 5.3 Mensajes de Error
**Siempre incluir mensajes personalizados:**
```typescript
@IsNotEmpty({ message: 'El campo {property} es requerido' })
@MinLength(8, { message: 'La contrasena debe tener al menos 8 caracteres' })
@IsEnum(Status, { message: 'El estado debe ser uno de: {constraints}' })
```

---

## 6. Utility Types de NestJS

### 6.1 PartialType
```typescript
import { PartialType } from '@nestjs/mapped-types';

// Todos los campos de CreateUserDto se vuelven opcionales
export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

### 6.2 OmitType
```typescript
import { OmitType } from '@nestjs/mapped-types';

// Excluye campos especificos
export class UpdatePasswordDto extends OmitType(CreateUserDto, ['email', 'role']) {}
```

### 6.3 PickType
```typescript
import { PickType } from '@nestjs/mapped-types';

// Solo incluye campos especificos
export class LoginDto extends PickType(CreateUserDto, ['email', 'password']) {}
```

### 6.4 Combinaciones
```typescript
// Combinar: Parcial sin password
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'])
) {}
```

---

## 7. Serializacion con class-transformer

### 7.1 Expose/Exclude
```typescript
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
  @Expose()
  id!: string;

  @Expose()
  email!: string;

  // No expuesto, nunca se serializa
  password!: string;
}
```

### 7.2 Transform
```typescript
import { Transform } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  @Transform(({ value }) => value?.toLowerCase())
  email!: string;

  @Expose()
  @Transform(({ value }) => new Date(value).toISOString())
  created_at!: string;
}
```

---

## 8. Barrel Exports

### 8.1 index.ts de Modulo
```typescript
// modules/auth/dto/index.ts
export * from './create-user.dto';
export * from './update-user.dto';
export * from './user-response.dto';
export * from './login.dto';
```

### 8.2 index.ts de Shared
```typescript
// shared/dto/common/index.ts
export * from './paginated-response.dto';
export * from './base-response.dto';
```

---

## 9. Mapeo DTO <-> Entity <-> Frontend

### 9.1 Flujo de Datos
```
Frontend Request
      ↓
  [CreateUserDto] ← Validacion + Transformacion
      ↓
  [UserEntity]    ← Logica de negocio
      ↓
  [UserResponseDto] ← Serializacion
      ↓
Frontend Response
```

### 9.2 Sincronizacion con Frontend
Los DTOs de respuesta deben coincidir con los types del frontend:

```typescript
// Backend: UserResponseDto
export class UserResponseDto {
  id!: string;
  email!: string;
  created_at!: Date;
}

// Frontend: User type (debe coincidir)
interface User {
  id: string;
  email: string;
  created_at: string; // Date serializada
}
```

**Herramienta de sincronizacion:**
- `npm run generate:api-types` genera types desde OpenAPI
- Frontend debe usar `/generated/api-types.ts` como SSOT

---

## 10. Anti-patrones a Evitar

### 10.1 NO: DTOs Duplicados
```typescript
// MAL: 8 DTOs con misma estructura
class PaginatedUsersDto { data, total, page, limit, total_pages }
class PaginatedAlertsDto { data, total, page, limit, total_pages }
// ... 6 mas

// BIEN: Usar generico
class PaginatedUsersDto extends PaginatedResponseDto<UserDto> {}
```

### 10.2 NO: Validaciones Inconsistentes
```typescript
// MAL: Regex diferente en cada DTO
@Matches(/^[a-z]+$/)  // en CreateUserDto
@Matches(/^[A-Za-z]+$/)  // en UpdateUserDto

// BIEN: Constante compartida
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
@Matches(USERNAME_REGEX)
```

### 10.3 NO: Campos sin Decoradores
```typescript
// MAL: Sin decoradores
export class CreateUserDto {
  email: string;  // Sin validacion
}

// BIEN: Siempre decorar
export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
```

---

## 11. Checklist de Creacion de DTO

Antes de crear un nuevo DTO:

1. [ ] Verificar que no existe DTO similar
2. [ ] Determinar si puede extender DTO base
3. [ ] Usar nombres segun convenciones
4. [ ] Agregar todos los decoradores necesarios
5. [ ] Incluir mensajes de error personalizados
6. [ ] Exportar en barrel file (index.ts)
7. [ ] Documentar con JSDoc si es complejo
8. [ ] Actualizar BACKEND_INVENTORY.yml

---

## 12. Referencias

- **Tipos Frontend:** `docs/95-guias-desarrollo/frontend/TYPES-CONVENTIONS.md`
- **Naming API:** `docs/95-guias-desarrollo/backend/NAMING-CONVENTIONS-API.md`
- **class-validator:** https://github.com/typestack/class-validator
- **class-transformer:** https://github.com/typestack/class-transformer
- **@nestjs/mapped-types:** https://docs.nestjs.com/openapi/mapped-types

---

## 13. Changelog

| Version | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2025-11-29 | Creacion inicial - Plan de estandarizacion |
