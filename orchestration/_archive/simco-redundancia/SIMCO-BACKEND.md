# SIMCO: OPERACIONES BACKEND (NestJS/TypeScript)

**Versión:** 1.0.0
**Fecha:** 2025-12-08
**Aplica a:** Todo agente que trabaje con código backend NestJS
**Prioridad:** OBLIGATORIA para operaciones de backend

---

## RESUMEN EJECUTIVO

> **Entity alineada con DDL + Service con lógica + Controller con Swagger = Backend completo.**

---

## PRINCIPIO FUNDAMENTAL

```
╔══════════════════════════════════════════════════════════════════════╗
║  ALINEACIÓN DB ↔ BACKEND                                             ║
║                                                                       ║
║  • Entity DEBE coincidir 100% con tabla DDL                          ║
║  • Tipos TypeScript DEBEN coincidir con tipos PostgreSQL             ║
║  • Nombres de columnas DEBEN ser idénticos                           ║
║  • Si DDL cambia, Entity DEBE cambiar                                ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## ESTRUCTURA DE MÓDULOS

```
{BACKEND_SRC}/
├── app.module.ts                    # Módulo raíz
├── main.ts                          # Entry point
├── shared/                          # Compartido
│   ├── config/                      # Configuraciones
│   ├── constants/                   # Constantes (SSOT)
│   ├── database/                    # TypeORM config
│   ├── guards/                      # Guards compartidos
│   ├── decorators/                  # Decorators custom
│   ├── interceptors/                # Interceptors
│   ├── filters/                     # Exception filters
│   └── utils/                       # Utilidades
└── modules/                         # Módulos de negocio
    └── {modulo}/
        ├── {modulo}.module.ts       # Module definition
        ├── entities/
        │   └── {nombre}.entity.ts   # TypeORM Entity
        ├── dto/
        │   ├── create-{nombre}.dto.ts
        │   ├── update-{nombre}.dto.ts
        │   └── {nombre}-response.dto.ts
        ├── services/
        │   └── {nombre}.service.ts
        ├── controllers/
        │   └── {nombre}.controller.ts
        └── tests/
            ├── {nombre}.service.spec.ts
            └── {nombre}.controller.spec.ts
```

---

## CONVENCIONES DE NOMENCLATURA

### Archivos
```typescript
// Entities: {nombre}.entity.ts
user.entity.ts
student-progress.entity.ts
badge-award.entity.ts

// Services: {nombre}.service.ts
user.service.ts
gamification.service.ts

// Controllers: {nombre}.controller.ts
user.controller.ts
auth.controller.ts

// DTOs: {accion}-{nombre}.dto.ts
create-user.dto.ts
update-user.dto.ts
login.dto.ts
```

### Clases
```typescript
// Entities: PascalCase + Entity suffix
export class UserEntity {}
export class StudentProgressEntity {}
export class BadgeAwardEntity {}

// Services: PascalCase + Service suffix
export class UserService {}
export class GamificationService {}

// Controllers: PascalCase + Controller suffix
export class UserController {}
export class AuthController {}

// DTOs: PascalCase + Dto suffix
export class CreateUserDto {}
export class UpdateUserDto {}
export class LoginDto {}
```

### Métodos y Variables
```typescript
// Métodos: camelCase con verbo
async createUser()
async findById()
async updateStatus()
async deleteUser()

// Variables: camelCase
const userRepository
const isActive
const createdAt

// Constantes: UPPER_SNAKE_CASE
const MAX_LOGIN_ATTEMPTS = 5
const DEFAULT_PAGE_SIZE = 20
```

---

## TEMPLATES

### Entity (TypeORM)

```typescript
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

/**
 * {NombreEntity} - {descripción breve}
 *
 * Representa {descripción del dominio}.
 * Mapea a: {schema}.{tabla}
 *
 * @see {DB_DDL_PATH}/schemas/{schema}/tables/{archivo}.sql
 */
@Entity({ schema: '{schema}', name: '{tabla}' })
export class {Nombre}Entity {
    /**
     * Identificador único (UUID)
     */
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /**
     * {descripción del campo}
     */
    @Column({ type: 'varchar', length: 100, nullable: false })
    name: string;

    /**
     * {descripción del campo}
     */
    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    /**
     * {descripción del campo con valores válidos}
     */
    @Column({
        type: 'varchar',
        length: 20,
        default: 'active',
    })
    status: string;

    /**
     * Relación con {entidad relacionada}
     */
    @ManyToOne(() => RelatedEntity, { nullable: true })
    @JoinColumn({ name: 'related_id' })
    related: RelatedEntity;

    @Column({ type: 'uuid', nullable: true })
    relatedId: string;

    /**
     * Fecha de creación
     */
    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    /**
     * Fecha de última actualización
     */
    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
}
```

### DTO (Create)

```typescript
import {
    IsString,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsEnum,
    IsUUID,
    Length,
    MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para crear {nombre}
 */
export class Create{Nombre}Dto {
    /**
     * {descripción del campo}
     */
    @ApiProperty({
        description: '{descripción}',
        example: '{ejemplo}',
        minLength: 3,
        maxLength: 100,
    })
    @IsString()
    @IsNotEmpty()
    @Length(3, 100)
    name: string;

    /**
     * {descripción del campo}
     */
    @ApiProperty({
        description: 'Email del usuario',
        example: 'user@example.com',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    /**
     * {descripción del campo opcional}
     */
    @ApiPropertyOptional({
        description: '{descripción}',
        example: '{ejemplo}',
    })
    @IsOptional()
    @IsString()
    description?: string;

    /**
     * {descripción del campo enum}
     */
    @ApiProperty({
        description: '{descripción}',
        enum: ['option1', 'option2', 'option3'],
        example: 'option1',
    })
    @IsEnum(['option1', 'option2', 'option3'])
    type: string;

    /**
     * Relación con {entidad}
     */
    @ApiPropertyOptional({
        description: 'ID de {entidad relacionada}',
        example: 'uuid-here',
    })
    @IsOptional()
    @IsUUID()
    relatedId?: string;
}
```

### DTO (Update)

```typescript
import { PartialType } from '@nestjs/swagger';
import { Create{Nombre}Dto } from './create-{nombre}.dto';

/**
 * DTO para actualizar {nombre}
 *
 * Todos los campos son opcionales (PartialType)
 */
export class Update{Nombre}Dto extends PartialType(Create{Nombre}Dto) {}
```

### Service

```typescript
import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { {Nombre}Entity } from '../entities/{nombre}.entity';
import { Create{Nombre}Dto } from '../dto/create-{nombre}.dto';
import { Update{Nombre}Dto } from '../dto/update-{nombre}.dto';

/**
 * Service para gestión de {nombre}
 *
 * Provee operaciones CRUD y lógica de negocio.
 */
@Injectable()
export class {Nombre}Service {
    constructor(
        @InjectRepository({Nombre}Entity)
        private readonly repository: Repository<{Nombre}Entity>,
    ) {}

    /**
     * Crea un nuevo {nombre}
     *
     * @param dto - Datos para crear
     * @returns {Nombre} creado
     * @throws ConflictException si ya existe
     */
    async create(dto: Create{Nombre}Dto): Promise<{Nombre}Entity> {
        // Validar unicidad si aplica
        const existing = await this.repository.findOne({
            where: { email: dto.email },
        });
        if (existing) {
            throw new ConflictException('Email already exists');
        }

        const entity = this.repository.create(dto);
        return await this.repository.save(entity);
    }

    /**
     * Obtiene todos los {nombre}
     *
     * @returns Lista de {nombre}
     */
    async findAll(): Promise<{Nombre}Entity[]> {
        return await this.repository.find({
            order: { createdAt: 'DESC' },
        });
    }

    /**
     * Obtiene un {nombre} por ID
     *
     * @param id - UUID del {nombre}
     * @returns {Nombre} encontrado
     * @throws NotFoundException si no existe
     */
    async findOne(id: string): Promise<{Nombre}Entity> {
        const entity = await this.repository.findOne({
            where: { id },
        });

        if (!entity) {
            throw new NotFoundException(`{Nombre} with ID ${id} not found`);
        }

        return entity;
    }

    /**
     * Actualiza un {nombre}
     *
     * @param id - UUID del {nombre}
     * @param dto - Datos a actualizar
     * @returns {Nombre} actualizado
     * @throws NotFoundException si no existe
     */
    async update(id: string, dto: Update{Nombre}Dto): Promise<{Nombre}Entity> {
        const entity = await this.findOne(id);
        Object.assign(entity, dto);
        return await this.repository.save(entity);
    }

    /**
     * Elimina un {nombre}
     *
     * @param id - UUID del {nombre}
     * @throws NotFoundException si no existe
     */
    async remove(id: string): Promise<void> {
        const entity = await this.findOne(id);
        await this.repository.remove(entity);
    }
}
```

### Controller

```typescript
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    ParseUUIDPipe,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiParam,
} from '@nestjs/swagger';
import { {Nombre}Service } from '../services/{nombre}.service';
import { {Nombre}Entity } from '../entities/{nombre}.entity';
import { Create{Nombre}Dto } from '../dto/create-{nombre}.dto';
import { Update{Nombre}Dto } from '../dto/update-{nombre}.dto';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';

/**
 * Controller para gestión de {nombre}
 *
 * Endpoints:
 * - GET    /{nombre}      - Listar todos
 * - GET    /{nombre}/:id  - Obtener por ID
 * - POST   /{nombre}      - Crear nuevo
 * - PUT    /{nombre}/:id  - Actualizar
 * - DELETE /{nombre}/:id  - Eliminar
 */
@ApiTags('{Nombre}')
@Controller('{nombre}')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class {Nombre}Controller {
    constructor(private readonly service: {Nombre}Service) {}

    /**
     * Lista todos los {nombre}
     */
    @Get()
    @ApiOperation({ summary: 'Listar todos los {nombre}' })
    @ApiResponse({
        status: 200,
        description: 'Lista de {nombre}',
        type: [{Nombre}Entity],
    })
    async findAll(): Promise<{Nombre}Entity[]> {
        return await this.service.findAll();
    }

    /**
     * Obtiene un {nombre} por ID
     */
    @Get(':id')
    @ApiOperation({ summary: 'Obtener {nombre} por ID' })
    @ApiParam({ name: 'id', description: 'UUID del {nombre}' })
    @ApiResponse({
        status: 200,
        description: '{Nombre} encontrado',
        type: {Nombre}Entity,
    })
    @ApiResponse({ status: 404, description: '{Nombre} no encontrado' })
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<{Nombre}Entity> {
        return await this.service.findOne(id);
    }

    /**
     * Crea un nuevo {nombre}
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Crear nuevo {nombre}' })
    @ApiResponse({
        status: 201,
        description: '{Nombre} creado',
        type: {Nombre}Entity,
    })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    @ApiResponse({ status: 409, description: 'Conflicto (ya existe)' })
    async create(@Body() dto: Create{Nombre}Dto): Promise<{Nombre}Entity> {
        return await this.service.create(dto);
    }

    /**
     * Actualiza un {nombre}
     */
    @Put(':id')
    @ApiOperation({ summary: 'Actualizar {nombre}' })
    @ApiParam({ name: 'id', description: 'UUID del {nombre}' })
    @ApiResponse({
        status: 200,
        description: '{Nombre} actualizado',
        type: {Nombre}Entity,
    })
    @ApiResponse({ status: 404, description: '{Nombre} no encontrado' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: Update{Nombre}Dto,
    ): Promise<{Nombre}Entity> {
        return await this.service.update(id, dto);
    }

    /**
     * Elimina un {nombre}
     */
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Eliminar {nombre}' })
    @ApiParam({ name: 'id', description: 'UUID del {nombre}' })
    @ApiResponse({ status: 204, description: '{Nombre} eliminado' })
    @ApiResponse({ status: 404, description: '{Nombre} no encontrado' })
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        return await this.service.remove(id);
    }
}
```

### Module

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { {Nombre}Entity } from './entities/{nombre}.entity';
import { {Nombre}Service } from './services/{nombre}.service';
import { {Nombre}Controller } from './controllers/{nombre}.controller';

@Module({
    imports: [TypeOrmModule.forFeature([{Nombre}Entity])],
    controllers: [{Nombre}Controller],
    providers: [{Nombre}Service],
    exports: [{Nombre}Service],
})
export class {Nombre}Module {}
```

---

## VALIDACIONES OBLIGATORIAS

```bash
# 1. Build (OBLIGATORIO)
cd @BACKEND_ROOT
npm run build
# ✅ Debe completar sin errores

# 2. Lint (OBLIGATORIO)
npm run lint
# ✅ Debe pasar

# 3. Tests (si existen)
npm run test
# ✅ Deben pasar

# 4. Iniciar aplicación
npm run start:dev
# ✅ Debe iniciar sin errores

# 5. Verificar endpoint
curl http://localhost:3000/api/{recurso}
# ✅ Debe responder correctamente
```

---

## CHECKLIST BACKEND

```
ENTITY
├── [ ] Mapea correctamente a tabla DDL
├── [ ] Tipos coinciden (UUID, VARCHAR, etc.)
├── [ ] Nombres de columnas idénticos a DDL
├── [ ] Relaciones (@ManyToOne, @OneToMany) correctas
├── [ ] Decoradores TypeORM completos
└── [ ] JSDoc con referencia a DDL

DTO
├── [ ] Validaciones class-validator
├── [ ] Decoradores Swagger (@ApiProperty)
├── [ ] Tipos alineados con Entity
├── [ ] UpdateDto extiende PartialType(CreateDto)
└── [ ] Ejemplos en Swagger

SERVICE
├── [ ] Inyección de repositorio
├── [ ] Métodos CRUD implementados
├── [ ] Manejo de errores (NotFoundException, etc.)
├── [ ] JSDoc en métodos públicos
└── [ ] Lógica de negocio documentada

CONTROLLER
├── [ ] Decoradores Swagger completos
├── [ ] Guards de autenticación
├── [ ] ParseUUIDPipe en parámetros UUID
├── [ ] HttpCode correcto por método
└── [ ] JSDoc en endpoints

MODULE
├── [ ] TypeOrmModule.forFeature con entities
├── [ ] Controllers registrados
├── [ ] Providers registrados
└── [ ] Exports si se usa en otros módulos

VALIDACIÓN
├── [ ] npm run build pasa
├── [ ] npm run lint pasa
├── [ ] npm run test pasa
├── [ ] Aplicación inicia
└── [ ] Endpoints responden
```

---

## ERRORES COMUNES

| Error | Causa | Solución |
|-------|-------|----------|
| Entity no mapea | Schema/tabla incorrectos | Verificar @Entity({ schema, name }) |
| Tipos no coinciden | DDL vs TypeScript | Alinear tipos exactamente |
| Circular dependency | Imports cruzados | Usar forwardRef() |
| Swagger incompleto | Faltan decoradores | Agregar @ApiProperty, @ApiOperation |
| Build falla | Errores TypeScript | Corregir antes de continuar |

---

## REFERENCIAS

- **Crear archivos:** @CREAR (SIMCO-CREAR.md)
- **Validar:** @VALIDAR (SIMCO-VALIDAR.md)
- **DDL:** @OP_DDL (SIMCO-DDL.md)
- **Guías Backend:** @GUIAS_BE
- **Nomenclatura:** @DIRECTIVAS/ESTANDARES-NOMENCLATURA-BASE.md

---

**Versión:** 1.0.0 | **Sistema:** SIMCO | **Mantenido por:** Tech Lead
