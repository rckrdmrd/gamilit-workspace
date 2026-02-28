---
titulo: Estandar de API - Paginacion y Filtros
status: activo
last_updated: "2026-02-28"
---

# Paginacion y Filtros

> Query parameters estandar, DTOs de paginacion y filtros avanzados para APIs NestJS

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
