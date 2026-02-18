---
name: simco-apply-backend-standard
description: "Aplicacion de estandares de codigo backend a modulos NestJS (entidades, DTOs, servicios, controladores)"
version: 1.0.0
simco_source: orchestration/directivas/simco/SIMCO-BACKEND.md
category: domain
priority: P2
capved_required: false
agents_compatible:
  - claude-code
  - gemini-cli
  - windsurf
  - trae
dependencies:
  - simco-apply-standard
  - simco-safe-edit
triggers:
  - on_module_create
  - on_entity_create
  - on_service_create
  - on_controller_create
  - on_dto_create
internal: true
estimated_tokens: 950
tags:
  - backend
  - nestjs
  - typescript
  - entities
  - dtos
  - services
  - controllers
  - clean-architecture
input_schema:
  required:
    - module_path
    - artifact_type
  optional:
    - schema_name
    - table_name
    - existing_ddl_path
output_schema:
  success:
    - standards_applied
    - checklist_passed
    - files_validated
  error:
    - error_code
    - error_message
contract_version: 1.0.0
---

# simco-apply-backend-standard

## Proposito
Garantizar que todo codigo NestJS nuevo o modificado en `apps/backend/` cumple con los estandares del proyecto: estructura de modulo correcta, entidades alineadas con DDL, DTOs con validacion class-validator, servicios con inyeccion de dependencias, controladores con guards y decoradores Swagger, manejo de errores con jerarquia de dominio, y nomenclatura consistente.

## Cuando Usar
- Al crear un modulo NestJS nuevo desde cero.
- Al agregar entities, DTOs, services o controllers a un modulo existente.
- Al revisar codigo backend en code review o auditoria.
- Al migrar codigo legado que no sigue los estandares actuales.
- Al corregir gaps detectados por lint o build.

## Cuando NO Usar
- Para cambios cosmeticos de solo formato (ej: reordenar imports) que no afectan comportamiento.
- Durante prototipado rapido o spikes de investigacion donde el codigo sera descartado.
- Para archivos de configuracion de NestJS (app.module.ts, main.ts) que tienen convenciones propias.
- Para archivos de test (*.spec.ts) — usar simco-testing en su lugar.

## Prerequisitos
- El esquema DDL de la tabla ya existe en `apps/database/ddl/schemas/`.
- El modulo tiene su directorio fisico bajo `apps/backend/src/modules/`.
- Las dependencias del modulo (entities de otros schemas usadas en @ManyToOne) estan identificadas.

## Instrucciones

### Paso 1: Verificar estructura del modulo
Asegurarse de que el directorio del modulo sigue la estructura estandar:

```
apps/backend/src/modules/{modulo}/
├── {modulo}.module.ts        # Module definition con imports, controllers, providers, exports
├── entities/
│   ├── index.ts              # Barrel export de todas las entities
│   └── {nombre}.entity.ts
├── dto/
│   ├── create-{nombre}.dto.ts
│   ├── update-{nombre}.dto.ts
│   └── {nombre}-response.dto.ts
├── services/
│   ├── index.ts              # Barrel export de todos los services
│   └── {nombre}.service.ts
├── controllers/
│   ├── index.ts              # Barrel export de todos los controllers
│   └── {nombre}.controller.ts
└── tests/
    ├── {nombre}.service.spec.ts
    └── {nombre}.controller.spec.ts
```

Verificar que el modulo esta importado en `apps/backend/src/app.module.ts`. Si no lo esta, agregarlo al array de imports del modulo raiz.

### Paso 2: Verificar entidades con decoradores TypeORM
Cada entity debe cumplir:

```typescript
// Correcto: JSDoc con referencia al DDL, @Entity con schema y nombre de tabla exactos
/**
 * {NombreEntity} - {descripcion breve}
 * Mapea a: {schema}.{tabla}
 * @see apps/database/ddl/schemas/{schema}/tables/{archivo}.sql
 */
@Entity({ schema: '{schema}', name: '{tabla}' })
export class {Nombre}Entity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Columnas: @Column con type explicito cuando no es inferible
  @Column({ type: 'varchar', length: 255 })
  name: string;

  // Timestamps: usar decoradores especializados
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relaciones: nombre de columna FK explicito con @JoinColumn
  @ManyToOne(() => ProfileEntity, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: ProfileEntity;
}
```

Verificaciones obligatorias:
- [ ] El nombre del schema en `@Entity({ schema: '...' })` coincide EXACTAMENTE con el DDL.
- [ ] El nombre de la tabla en `@Entity({ name: '...' })` coincide EXACTAMENTE con el DDL.
- [ ] Cada columna tiene un `@Column` con el tipo correcto (varchar, int, boolean, jsonb, etc.).
- [ ] Las columnas `snake_case` del DDL se mapean a propiedades `camelCase` en la entity con `name` explicito cuando difieren.
- [ ] Relaciones tienen `@JoinColumn({ name: 'fk_column_name' })` con el nombre exacto del FK en DDL.
- [ ] Enums usan el tipo PostgreSQL correspondiente: `@Column({ type: 'enum', enum: MyEnum })`.

### Paso 3: Verificar DTOs con class-validator
Cada DTO debe cumplir:

```typescript
import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum, MaxLength, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Create{Nombre}Dto {
  // Propiedades requeridas: @ApiProperty + validadores especificos
  @ApiProperty({ description: 'Descripcion del campo', example: 'valor ejemplo' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  // Propiedades opcionales: @ApiPropertyOptional + @IsOptional primero
  @ApiPropertyOptional({ description: 'Campo opcional' })
  @IsOptional()
  @IsString()
  description?: string;

  // Enums: @IsEnum con el tipo correcto
  @ApiProperty({ enum: MyEnum, description: 'Estado del recurso' })
  @IsEnum(MyEnum)
  status: MyEnum;
}
```

Verificaciones obligatorias:
- [ ] Todos los campos tienen al menos un decorador de validacion class-validator.
- [ ] Campos de texto tienen `@MaxLength` con el limite del DDL (o 255 por defecto).
- [ ] Campos opcionales tienen `@IsOptional()` como PRIMER decorador de validacion.
- [ ] Cada campo tiene `@ApiProperty` o `@ApiPropertyOptional` con description y example.
- [ ] DTOs de respuesta (`{nombre}-response.dto.ts`) usan `@Exclude()` para campos sensibles.
- [ ] Los tipos TypeScript de DTOs coinciden con los tipos de la tabla DDL.

### Paso 4: Verificar servicios con inyeccion de dependencias
Cada service debe cumplir:

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundError } from 'src/common/errors/not-found.error';

@Injectable()
export class {Nombre}Service {
  constructor(
    @InjectRepository({Nombre}Entity)
    private readonly {nombre}Repository: Repository<{Nombre}Entity>,
    // Otros servicios inyectados como readonly
    private readonly otherService: OtherService,
  ) {}

  async findById(id: string): Promise<{Nombre}Entity> {
    const entity = await this.{nombre}Repository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`{Nombre} with id ${id} not found`);
    }
    return entity;
  }
}
```

Verificaciones obligatorias:
- [ ] El servicio esta decorado con `@Injectable()`.
- [ ] Repositorios inyectados con `@InjectRepository({Entity})`.
- [ ] Todas las dependencias son `private readonly` en el constructor.
- [ ] Los metodos `async` retornan `Promise<T>` con tipo explicito.
- [ ] Se usa `NotFoundException` (o error de dominio equivalente) cuando un recurso no existe.
- [ ] No hay logica de presentacion (transformacion HTTP) en el service — eso va en el controller.
- [ ] No hay queries directas a la DB fuera del repositorio (no `this.dataSource.query(...)` salvo casos justificados).

### Paso 5: Verificar controladores con guards y decoradores
Cada controller debe cumplir:

```typescript
import { Controller, Get, Post, Body, Param, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';

@ApiTags('{nombre-modulo}')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('{ruta-base}')
export class {Nombre}Controller {
  constructor(private readonly {nombre}Service: {Nombre}Service) {}

  @Get(':id')
  @Roles('student', 'teacher', 'admin')
  @ApiOperation({ summary: 'Obtener {nombre} por ID' })
  @ApiResponse({ status: HttpStatus.OK, type: {Nombre}ResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: '{Nombre} no encontrado' })
  async findById(@Param('id') id: string): Promise<{Nombre}ResponseDto> {
    return this.{nombre}Service.findById(id);
  }
}
```

Verificaciones obligatorias:
- [ ] El controller tiene `@ApiTags('{modulo}')` y `@ApiBearerAuth()`.
- [ ] Rutas protegidas tienen `@UseGuards(JwtAuthGuard)` como minimo.
- [ ] Endpoints que requieren roles especificos tienen `@Roles(...)`.
- [ ] Cada endpoint tiene `@ApiOperation({ summary: '...' })`.
- [ ] Cada endpoint tiene al menos un `@ApiResponse` con el tipo de respuesta.
- [ ] Los `@Param`, `@Body`, `@Query` usan DTOs o tipos primitivos tipados (no `any`).
- [ ] El controller NO tiene logica de negocio — toda delega al service.

### Paso 6: Verificar manejo de errores
Aplicar la jerarquia de errores de dominio del proyecto:

```typescript
// Usar errores de dominio en lugar de excepciones HTTP directas en servicios
import { ResourceNotFoundError } from 'src/common/errors/not-found.error';
import { BusinessRuleError } from 'src/common/errors/business-rule.error';

// En services: errores de dominio
throw new ResourceNotFoundError('User', id);
throw new BusinessRuleError('Cannot complete mission: not assigned to this classroom');

// En controllers: excepciones HTTP directas son aceptables para casos de presentacion
// (validacion de request format, autenticacion, etc.)
```

Verificaciones obligatorias:
- [ ] Los servicios usan errores de dominio (`src/common/errors/`) en lugar de `HttpException` directa.
- [ ] El `DomainExceptionFilter` esta registrado globalmente en `main.ts` o `app.module.ts`.
- [ ] No hay `try/catch` vacios o que silencian errores.
- [ ] Los mensajes de error son descriptivos e incluyen el ID del recurso cuando aplica.

### Paso 7: Validar nomenclatura y convenciones
Verificar que se cumple la nomenclatura estandar del proyecto:

```yaml
nomenclatura_archivos:
  entity: "{nombre-kebab-case}.entity.ts"
  service: "{nombre-kebab-case}.service.ts"
  controller: "{nombre-kebab-case}.controller.ts"
  dto_create: "create-{nombre-kebab-case}.dto.ts"
  dto_update: "update-{nombre-kebab-case}.dto.ts"
  dto_response: "{nombre-kebab-case}-response.dto.ts"
  module: "{nombre-kebab-case}.module.ts"

nomenclatura_clases:
  entity: "{NombrePascalCase}Entity"
  service: "{NombrePascalCase}Service"
  controller: "{NombrePascalCase}Controller"
  dto: "Create{NombrePascalCase}Dto | Update{NombrePascalCase}Dto | {NombrePascalCase}ResponseDto"

nomenclatura_metodos:
  crear: "create(dto: CreateXxxDto): Promise<XxxEntity>"
  buscar_uno: "findById(id: string): Promise<XxxEntity>"
  buscar_todos: "findAll(filters?: ...): Promise<XxxEntity[]>"
  actualizar: "update(id: string, dto: UpdateXxxDto): Promise<XxxEntity>"
  eliminar: "remove(id: string): Promise<void>"
```

Verificaciones obligatorias:
- [ ] Archivos en `kebab-case` con sufijos correctos.
- [ ] Clases en `PascalCase` con sufijos `Entity`, `Service`, `Controller`, `Dto`.
- [ ] Metodos en `camelCase` comenzando con verbo (`create`, `find`, `update`, `remove`, `get`).
- [ ] Variables y propiedades en `camelCase`.
- [ ] Constantes en `UPPER_SNAKE_CASE`.

## Manejo de Errores

| Escenario | Accion | Ejemplo |
|-----------|--------|---------|
| Entity no alineada con DDL | Revisar DDL, ajustar `@Entity`, `@Column` y `@JoinColumn` para que coincidan exactamente | Tabla `user_stats` tiene columna `daily_streak` — agregar propiedad a entity |
| DTO sin validacion | Agregar class-validator decorators antes del campo; si el tipo no es claro revisar DDL | Campo `status` sin validacion → agregar `@IsEnum(StatusEnum)` |
| Service con logica HTTP | Mover la logica de presentacion al controller; el service solo opera con entidades de dominio | `throw new HttpException(...)` en service → reemplazar con error de dominio |
| Controller sin Swagger | Agregar `@ApiOperation` y `@ApiResponse` a cada endpoint sin documentacion | Endpoint `GET /missions` sin `@ApiOperation` → agregar |
| Modulo no registrado en app.module.ts | Agregar el modulo al array `imports` de `AppModule` y verificar que DataSource incluye las entities | Nuevo modulo `inventory` → agregar `InventoryModule` a `app.module.ts` |
| Nomenclatura incorrecta | Renombrar archivo y clase siguiendo la convencion; actualizar todos los imports | `inventoryService.ts` → `inventory.service.ts`, clase `inventoryService` → `InventoryService` |

## Formato de Salida

```yaml
apply_backend_standard_result:
  module_path: "apps/backend/src/modules/gamification"
  artifact_type: "entity"
  standards_applied:
    - name: "SIMCO-BACKEND.md"
      path: "orchestration/directivas/simco/SIMCO-BACKEND.md"
      sections_used: ["entity-template", "nomenclatura"]
    - name: "02-clean-architecture.md"
      path: "docs/40-standards/backend-profesional/02-clean-architecture.md"
      sections_used: ["module-structure"]
    - name: "06-validacion-datos.md"
      path: "docs/40-standards/backend-profesional/06-validacion-datos.md"
      sections_used: ["class-validator", "dto-pattern"]
  files_validated:
    - path: "apps/backend/src/modules/gamification/entities/achievement.entity.ts"
      status: "pass"
    - path: "apps/backend/src/modules/gamification/dto/achievements/achievement-response.dto.ts"
      status: "fail"
      issues:
        - "Missing @ApiProperty on field 'metadata'"
        - "@IsOptional should be first decorator on field 'icon'"
  checklist_passed: false
  deviations:
    - description: "GameStoreService uses DataSource.query() for complex aggregation"
      justification: "TypeORM QueryBuilder no soporta la subquery requerida"
      documented_in: "inline comment in service"
```

## Checklist de Validacion
- [ ] La estructura de directorios del modulo sigue el estandar (entity/dto/services/controllers/tests + barrels).
- [ ] El modulo esta importado en `app.module.ts` con su datasource configurado.
- [ ] Las entities tienen `@Entity({ schema, name })` con valores exactos del DDL.
- [ ] Todos los campos de entity tienen decoradores TypeORM correctos y tipos coincidentes con DDL.
- [ ] Los DTOs tienen class-validator en cada campo y @ApiProperty en todos.
- [ ] Los servicios usan `@Injectable()`, repositorios con `@InjectRepository`, dependencias `readonly`.
- [ ] Los controllers tienen `@ApiTags`, `@ApiBearerAuth`, guards y `@ApiOperation` por endpoint.
- [ ] El manejo de errores usa la jerarquia de dominio de `src/common/errors/`.
- [ ] La nomenclatura de archivos, clases y metodos sigue las convenciones del proyecto.
- [ ] Build (`npm run build`) pasa sin errores en `apps/backend`.
- [ ] Lint (`npm run lint`) pasa sin errores nuevos.

## Referencias
- `orchestration/directivas/simco/SIMCO-BACKEND.md`
- `docs/40-standards/backend-profesional/01-principios-solid.md`
- `docs/40-standards/backend-profesional/02-clean-architecture.md`
- `docs/40-standards/backend-profesional/05-manejo-errores.md`
- `docs/40-standards/backend-profesional/06-validacion-datos.md`
- `docs/40-standards/backend-profesional/07-testing-patterns.md`
- `apps/backend/src/common/errors/` — jerarquia de errores de dominio (MQ-002)
- CLAUDE.md -- RC2: COHERENCIA ENTRE CAPAS
