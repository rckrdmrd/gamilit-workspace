# SIMCO-ALINEACION

**Versión:** 1.0.0
**Fecha:** 2025-12-08
**Sistema:** SIMCO + CCA + CAPVED + Niveles + Economía de Tokens
**Propósito:** Protocolo de validación de alineación entre capas (DDL ↔ Entity ↔ DTO ↔ Types)

---

## PROBLEMA QUE RESUELVE

Cuando multiples agentes trabajan en capas diferentes de la misma HU:
- Database-Agent crea tabla con 7 columnas
- Backend-Agent crea Entity con 6 columnas (olvido una)
- Frontend-Agent crea Types basados en DTO incompleto

**Resultado:** Bugs de integracion que se descubren tarde.

Este protocolo define QUIEN valida QUE y CUANDO.

---

## PRINCIPIO FUNDAMENTAL

```
╔═══════════════════════════════════════════════════════════════════════╗
║  LA CAPA INFERIOR ES LA FUENTE DE VERDAD                              ║
║                                                                        ║
║  DDL (Database) → Entity (Backend) → DTO (Backend) → Types (Frontend) ║
║       ▲                                                                ║
║       │                                                                ║
║  SIEMPRE verificar contra la capa anterior antes de crear              ║
╚═══════════════════════════════════════════════════════════════════════╝
```

---

## MATRIZ DE RESPONSABILIDADES

| Alineacion | Responsable | Cuando | Como |
|------------|-------------|--------|------|
| DDL ↔ Entity | Backend-Agent | ANTES de crear Entity | Leer DDL, verificar campos |
| Entity ↔ DTO | Backend-Agent | ANTES de crear DTO | Verificar contra Entity |
| DTO ↔ Types | Frontend-Agent | ANTES de crear Types | Leer Swagger/DTO |
| API Contract | Orquestador | Gate Fase V | Validacion cruzada |

---

## PROTOCOLO POR CAPA

### 1. Database-Agent crea tabla

```yaml
ANTES de crear DDL:
  - [ ] Verificar que NO existe tabla con mismo nombre
  - [ ] Verificar convenciones de nomenclatura
  - [ ] Documentar TODOS los campos con tipos exactos

AL crear DDL:
  - [ ] Usar tipos PostgreSQL correctos
  - [ ] Documentar constraints (NOT NULL, DEFAULT, UNIQUE)
  - [ ] Documentar relaciones (FK)
  - [ ] Agregar COMMENT ON para documentar

DESPUES de crear DDL:
  - [ ] Ejecutar carga limpia ✓
  - [ ] Registrar en DATABASE_INVENTORY.yml
  - [ ] Documentar en TRAZA-TAREAS-DATABASE.md
  - [ ] Notificar campos a Backend-Agent (si delegacion)
```

**Formato de notificacion a Backend:**

```yaml
tabla_creada:
  schema: auth
  nombre: notifications
  columnas:
    - nombre: id
      tipo: UUID
      constraint: PRIMARY KEY, DEFAULT gen_random_uuid()
    - nombre: user_id
      tipo: UUID
      constraint: NOT NULL, FK → auth.users(id)
    - nombre: title
      tipo: VARCHAR(255)
      constraint: NOT NULL
    - nombre: message
      tipo: TEXT
      constraint: NULL
    - nombre: read
      tipo: BOOLEAN
      constraint: DEFAULT false
    - nombre: created_at
      tipo: TIMESTAMPTZ
      constraint: DEFAULT NOW()
    - nombre: updated_at
      tipo: TIMESTAMPTZ
      constraint: NULL
```

---

### 2. Backend-Agent crea Entity

```yaml
ANTES de crear Entity:
  - [ ] LEER el DDL de la tabla
  - [ ] Contar columnas: DDL tiene N, Entity debe tener N
  - [ ] Verificar mapeo de tipos (ver tabla abajo)
  - [ ] Verificar constraints

AL crear Entity:
  - [ ] Nombre de tabla exacto (schema.table)
  - [ ] TODOS los campos del DDL presentes
  - [ ] Decoradores correctos (@Column, @PrimaryColumn, etc.)
  - [ ] Tipos TypeScript correctos
  - [ ] Relaciones decoradas (@ManyToOne, @OneToMany)

DESPUES de crear Entity:
  - [ ] Build pasa ✓
  - [ ] Registrar en BACKEND_INVENTORY.yml
```

**Tabla de mapeo de tipos PostgreSQL → TypeScript:**

```
┌─────────────────────┬───────────────────┬─────────────────────────────┐
│ PostgreSQL          │ TypeScript        │ Decorador TypeORM           │
├─────────────────────┼───────────────────┼─────────────────────────────┤
│ UUID                │ string            │ @Column('uuid')             │
│ VARCHAR(n)          │ string            │ @Column({ length: n })      │
│ TEXT                │ string            │ @Column('text')             │
│ INTEGER             │ number            │ @Column('int')              │
│ BIGINT              │ string | bigint   │ @Column('bigint')           │
│ NUMERIC(p,s)        │ string | number   │ @Column('decimal')          │
│ BOOLEAN             │ boolean           │ @Column('boolean')          │
│ TIMESTAMPTZ         │ Date              │ @Column('timestamptz')      │
│ DATE                │ Date | string     │ @Column('date')             │
│ JSONB               │ Record<string,any>│ @Column('jsonb')            │
│ ARRAY               │ T[]               │ @Column('simple-array')     │
│ ENUM                │ enum              │ @Column({ type: 'enum' })   │
└─────────────────────┴───────────────────┴─────────────────────────────┘
```

**Ejemplo de validacion:**

```typescript
// DDL tiene:
// id UUID PRIMARY KEY DEFAULT gen_random_uuid()
// user_id UUID NOT NULL REFERENCES auth.users(id)
// title VARCHAR(255) NOT NULL
// message TEXT
// read BOOLEAN DEFAULT false
// created_at TIMESTAMPTZ DEFAULT NOW()
// updated_at TIMESTAMPTZ

// Entity DEBE tener:
@Entity('notifications', { schema: 'auth' })
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;                           // ✓ UUID → string

  @Column('uuid')
  user_id: string;                      // ✓ UUID → string

  @Column({ length: 255 })
  title: string;                        // ✓ VARCHAR(255) → string

  @Column('text', { nullable: true })
  message: string;                      // ✓ TEXT nullable

  @Column('boolean', { default: false })
  read: boolean;                        // ✓ BOOLEAN

  @CreateDateColumn()
  created_at: Date;                     // ✓ TIMESTAMPTZ

  @Column('timestamptz', { nullable: true })
  updated_at: Date;                     // ✓ TIMESTAMPTZ nullable

  // Relacion
  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
// Total: 7 columnas ✓ (igual que DDL)
```

---

### 3. Backend-Agent crea DTO

```yaml
ANTES de crear DTO:
  - [ ] Entity existe y esta validada
  - [ ] Identificar campos para cada DTO

AL crear DTOs:
  CreateDto:
    - [ ] Excluir: id, created_at, updated_at (autogenerados)
    - [ ] Incluir: campos requeridos para creacion
    - [ ] Decoradores de validacion (@IsString, @IsUUID, etc.)

  UpdateDto:
    - [ ] Todos los campos opcionales (PartialType)
    - [ ] Excluir: id (no se actualiza)
    - [ ] Excluir: campos no-actualizables

  ResponseDto:
    - [ ] Todos los campos que se exponen
    - [ ] Incluir relaciones si se devuelven

DESPUES de crear DTOs:
  - [ ] Swagger los documenta correctamente
```

**Ejemplo:**

```typescript
// CreateNotificationDto
export class CreateNotificationDto {
  @IsUUID()
  user_id: string;              // Requerido

  @IsString()
  @MaxLength(255)
  title: string;                // Requerido

  @IsString()
  @IsOptional()
  message?: string;             // Opcional (NULL en DDL)
}
// Excluidos: id, read, created_at, updated_at (autogenerados/default)

// UpdateNotificationDto
export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {
  @IsBoolean()
  @IsOptional()
  read?: boolean;               // Se puede actualizar
}

// NotificationResponseDto
export class NotificationResponseDto {
  id: string;
  user_id: string;
  title: string;
  message: string | null;
  read: boolean;
  created_at: Date;
  updated_at: Date | null;
}
```

---

### 4. Frontend-Agent crea Types

```yaml
ANTES de crear Types:
  - [ ] Leer Swagger o DTOs del backend
  - [ ] Verificar nombres de campos exactos
  - [ ] Verificar tipos

AL crear Types:
  - [ ] Nombres en camelCase (si backend usa snake_case, transformar)
  - [ ] Tipos TypeScript correctos
  - [ ] Optional (?) donde backend tiene null

DESPUES de crear Types:
  - [ ] Build pasa ✓
  - [ ] Tipos son importables desde componentes
```

**Ejemplo:**

```typescript
// Notification.types.ts

// Basado en NotificationResponseDto
export interface Notification {
  id: string;
  userId: string;               // Transformado de user_id
  title: string;
  message: string | null;
  read: boolean;
  createdAt: Date;              // Transformado de created_at
  updatedAt: Date | null;
}

// Basado en CreateNotificationDto
export interface CreateNotificationInput {
  userId: string;
  title: string;
  message?: string;
}

// Basado en UpdateNotificationDto
export interface UpdateNotificationInput {
  userId?: string;
  title?: string;
  message?: string;
  read?: boolean;
}
```

---

## CHECKLIST DE VALIDACION CRUZADA

### Pre-Integracion (Antes de marcar HU como Done)

```markdown
## Validacion DDL ↔ Entity

- [ ] Todas las columnas en DDL existen en Entity
- [ ] Numero de columnas coincide
- [ ] Tipos PostgreSQL mapeados correctamente a TypeScript
- [ ] Constraints (NOT NULL) reflejados como required
- [ ] DEFAULT reflejados en decoradores
- [ ] FK tienen relacion definida

## Validacion Entity ↔ DTO

- [ ] CreateDto tiene campos necesarios para crear
- [ ] CreateDto NO tiene campos autogenerados
- [ ] UpdateDto tiene campos actualizables
- [ ] ResponseDto expone todos los campos publicos
- [ ] Validadores (@IsString, @IsUUID) presentes

## Validacion DTO ↔ Types (Frontend)

- [ ] Types frontend matchean DTOs
- [ ] Transformacion de nomenclatura correcta (snake_case → camelCase)
- [ ] Optional fields coinciden
- [ ] Enums sincronizados entre backend y frontend

## Validacion API

- [ ] Swagger documenta todos los endpoints
- [ ] Request bodies matchean DTOs
- [ ] Response bodies matchean DTOs
- [ ] Codigos de status documentados
```

---

## PROCESO DE VALIDACION

### Quien ejecuta esta validacion

```yaml
Escenario A: Agente individual crea DDL + Entity + DTO
  Responsable: El mismo agente
  Cuando: Despues de crear cada capa

Escenario B: Diferentes agentes por capa (delegacion)
  Responsable: Orquestador en Gate Fase V
  Cuando: Antes de marcar HU como Done
  Como: Verificar que:
    - Database-Agent documento campos correctamente
    - Backend-Agent creo Entity alineada
    - Frontend-Agent creo Types alineados

Escenario C: Validacion post-hoc (revisar existente)
  Responsable: Architecture-Analyst (cuando exista)
  Cuando: Auditorias periodicas
```

### Herramienta de validacion (futuro)

```bash
# Script conceptual (a implementar)
./validate-alignment.sh --table auth.notifications

Output:
  DDL columns: 7
  Entity columns: 7 ✓
  DTO fields: OK ✓
  Frontend types: OK ✓

  Mismatches found: 0
```

---

## ERRORES COMUNES Y SOLUCION

### Error 1: Entity con menos columnas que DDL

```yaml
Problema:
  DDL tiene: id, user_id, title, message, read, created_at, updated_at (7)
  Entity tiene: id, userId, title, message, read, createdAt (6)
  Falta: updated_at

Causa: Olvido al transcribir

Solucion:
  1. Backend-Agent DEBE leer DDL antes de crear Entity
  2. Contar columnas explicitamente
  3. Usar checklist de validacion
```

### Error 2: Tipos incompatibles

```yaml
Problema:
  DDL: NUMERIC(10,2)
  Entity: number
  Resultado: Perdida de precision en decimales grandes

Solucion:
  - NUMERIC → usar string o Decimal.js
  - Documentar en Entity con comentario
```

### Error 3: Nombres transformados incorrectamente

```yaml
Problema:
  DDL: user_id (snake_case)
  Entity: userId (camelCase)
  Frontend: userid (lowercase)

Causa: Transformacion inconsistente

Solucion:
  - Definir convencion por proyecto
  - Backend usa snake_case o camelCase (consistente)
  - Frontend transforma de forma predecible
```

### Error 4: Nullable no propagado

```yaml
Problema:
  DDL: message TEXT (nullable por defecto)
  Entity: message: string (required)
  Resultado: Error al insertar con message = null

Solucion:
  - DDL explicito: TEXT NULL o TEXT NOT NULL
  - Entity: message: string | null
  - DTO: message?: string
```

---

## QUICK REFERENCE

```
┌─────────────────────────────────────────────────────────────────────┐
│                 VALIDACION DE ALINEACION                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ANTES de crear Entity:                                             │
│    1. Leer DDL de la tabla                                          │
│    2. Contar columnas (deben coincidir)                             │
│    3. Mapear tipos (ver tabla de mapeo)                             │
│    4. Verificar constraints (NOT NULL, DEFAULT)                     │
│                                                                      │
│  ANTES de crear DTO:                                                │
│    1. Verificar Entity existe                                        │
│    2. CreateDto: excluir autogenerados (id, timestamps)             │
│    3. UpdateDto: hacer campos opcionales                            │
│    4. Agregar validadores                                           │
│                                                                      │
│  ANTES de crear Types (Frontend):                                   │
│    1. Leer Swagger o DTOs                                           │
│    2. Transformar nomenclatura consistentemente                     │
│    3. Verificar optional fields                                     │
│                                                                      │
│  Gate de validacion:                                                │
│    - DDL columns == Entity columns                                  │
│    - Tipos mapeados correctamente                                   │
│    - Nullable propagado                                             │
│    - Build pasa en todas las capas                                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## REFERENCIAS

- `SIMCO-DDL.md` - Directivas de base de datos
- `SIMCO-BACKEND.md` - Directivas de backend
- `SIMCO-FRONTEND.md` - Directivas de frontend
- `SIMCO-VALIDAR.md` - Validacion general
- `CHECKLIST-CODE-REVIEW-API.md` - Checklist de revision

---

*Sistema SIMCO v2.2.0*
*Creado: 2025-12-08*
