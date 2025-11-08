# ET-XXX-NNN: [Título de la Especificación Técnica]

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-XXX-NNN |
| **Módulo** | [XX - Nombre del Módulo] |
| **Título** | [Título de la Especificación] |
| **Prioridad** | [Alta / Media / Baja] |
| **Estado** | [🔴 Pendiente / 🟡 En Progreso / ✅ Implementado / ⏸️  En Pausa] |
| **Versión** | 1.0 |
| **Fecha Creación** | YYYY-MM-DD |
| **Última Actualización** | YYYY-MM-DD |
| **Autor** | [Nombre del Autor / Equipo] |
| **Reviewers** | [Lista de reviewers] |

---

## 🔗 Referencias

### Requerimiento Funcional

📘 **Documento RF:**
- [RF-XXX-NNN: Título](../../01-requerimientos/modulo/RF-XXX-NNN-titulo.md)

### Implementación DDL

🗄️ **ENUMs:**
- `schema.enum_name` → `apps/database/ddl/...`

🗄️ **Tablas:**
- `schema.table_name` → Ubicación completa

🗄️ **Funciones:**
- `function_name()` → Ubicación completa

🗄️ **Triggers:**
- `trg_trigger_name` → Ubicación completa

### Backend

💻 **Controllers:**
- `apps/backend/src/modules/module/controllers/controller.controller.ts`

💻 **Services:**
- `apps/backend/src/modules/module/services/service.service.ts`

💻 **DTOs:**
- `apps/backend/src/modules/module/dto/create-dto.dto.ts`
- `apps/backend/src/modules/module/dto/update-dto.dto.ts`

### Frontend

🎨 **Componentes:**
- `apps/frontend/src/features/module/components/Component.tsx`

🎨 **Hooks:**
- `apps/frontend/src/features/module/hooks/useHook.ts`

🎨 **Types:**
- `apps/frontend/src/types/module.types.ts`

---

## 🏗️ Arquitectura

### Diagrama de Capas

```
┌─────────────────────────────────────────────────────────┐
│                 FRONTEND (React + TypeScript)           │
│  - ComponentName                                        │
│  - useHook                                              │
│  - Types                                                │
└─────────────────┬───────────────────────────────────────┘
                  │ REST API / WebSocket
┌─────────────────▼───────────────────────────────────────┐
│              BACKEND (NestJS + TypeScript)              │
│  - Controller                                           │
│  - Service                                              │
│  - DTOs                                                 │
└─────────────────┬───────────────────────────────────────┘
                  │ SQL Queries / ORM
┌─────────────────▼───────────────────────────────────────┐
│            DATABASE (PostgreSQL)                        │
│  - Tables                                               │
│  - Functions                                            │
│  - Triggers                                             │
│  - RLS Policies                                         │
└─────────────────────────────────────────────────────────┘
```

### Flujo de Datos

```
[Descripción del flujo de datos principal]

User Action
    ↓
Frontend Component
    ↓
API Call (HTTP/WS)
    ↓
Backend Controller
    ↓
Service Layer
    ↓
Database Query
    ↓
Response ← ← ← ←
```

---

## 💾 Implementación de Base de Datos

### 1. ENUM: [nombre_enum]

**Ubicación:** `apps/database/ddl/...`

```sql
CREATE TYPE schema.enum_name AS ENUM (
    'valor1',  -- Descripción
    'valor2',  -- Descripción
    'valor3'   -- Descripción
);

COMMENT ON TYPE schema.enum_name IS 'Descripción del enum';
```

### 2. Tabla: [nombre_tabla]

**Ubicación:** `apps/database/ddl/schemas/schema/tables/table_name.sql`

```sql
CREATE TABLE schema.table_name (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campo1 TEXT NOT NULL,
    campo2 INTEGER DEFAULT 0,
    campo3 ENUM_TYPE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Foreign Keys
    CONSTRAINT fk_relation FOREIGN KEY (campo1)
        REFERENCES other_schema.other_table(id)
        ON DELETE CASCADE,

    -- Constraints
    CONSTRAINT chk_campo2_positive CHECK (campo2 >= 0)
);

-- Indexes
CREATE INDEX idx_table_campo1 ON schema.table_name(campo1);
CREATE INDEX idx_table_search ON schema.table_name USING gin(campo1 gin_trgm_ops);

COMMENT ON TABLE schema.table_name IS 'Descripción de la tabla';
COMMENT ON COLUMN schema.table_name.campo1 IS 'Descripción del campo';
```

### 3. Función: [nombre_funcion]

**Ubicación:** `apps/database/ddl/schemas/schema/functions/function_name.sql`

```sql
CREATE OR REPLACE FUNCTION schema.function_name(
    p_param1 TYPE1,
    p_param2 TYPE2
)
RETURNS TYPE
LANGUAGE plpgsql
AS $$
BEGIN
    -- Lógica de la función
    RETURN result;
END;
$$;

COMMENT ON FUNCTION schema.function_name IS 'Descripción de la función';
```

---

## 💻 Implementación Backend

### 1. Controller

**Ubicación:** `apps/backend/src/modules/module/controllers/controller.controller.ts`

```typescript
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ServiceName } from '../services/service.service';

/**
 * Controller para [descripción]
 *
 * @see {@link RF-XXX-NNN} docs/01-requerimientos/modulo/RF-XXX-NNN.md
 * @see {@link ET-XXX-NNN} docs/02-especificaciones-tecnicas/modulo/ET-XXX-NNN.md
 */
@Controller('api/module/resource')
export class ControllerName {
  constructor(private readonly service: ServiceName) {}

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Post()
  async create(@Body() dto: CreateDto) {
    return this.service.create(dto);
  }
}
```

### 2. Service

**Ubicación:** `apps/backend/src/modules/module/services/service.service.ts`

```typescript
import { Injectable } from '@nestjs/common';

/**
 * Service para [descripción]
 *
 * @see {@link RF-XXX-NNN} docs/01-requerimientos/modulo/RF-XXX-NNN.md
 */
@Injectable()
export class ServiceName {
  async findAll() {
    // Implementación
  }

  async create(dto: CreateDto) {
    // Implementación
  }
}
```

### 3. DTOs

**Ubicación:** `apps/backend/src/modules/module/dto/create-dto.dto.ts`

```typescript
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

/**
 * DTO para crear [recurso]
 */
export class CreateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  campo1: string;

  @IsString()
  campo2?: string;
}
```

---

## 🎨 Implementación Frontend

### 1. Componente Principal

**Ubicación:** `apps/frontend/src/features/module/components/Component.tsx`

```typescript
import React from 'react';
import { useHook } from '../hooks/useHook';

/**
 * Componente para [descripción]
 *
 * @see {@link RF-XXX-NNN} docs/01-requerimientos/modulo/RF-XXX-NNN.md
 */
export const ComponentName: React.FC<Props> = ({ prop1, prop2 }) => {
  const { data, loading, error } = useHook();

  if (loading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <div>
      {/* Implementación */}
    </div>
  );
};
```

### 2. Hook Personalizado

**Ubicación:** `apps/frontend/src/features/module/hooks/useHook.ts`

```typescript
import { useState, useEffect } from 'react';
import { api } from '@/services/api';

/**
 * Hook para [descripción]
 */
export const useHook = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Implementación
  }, []);

  return { data, loading, error };
};
```

### 3. Types

**Ubicación:** `apps/frontend/src/types/module.types.ts`

```typescript
/**
 * Tipos para [descripción]
 *
 * @see {@link RF-XXX-NNN} docs/01-requerimientos/modulo/RF-XXX-NNN.md
 */

export interface EntityType {
  id: string;
  campo1: string;
  campo2: number;
  createdAt: string;
}

export type CreateEntityInput = Omit<EntityType, 'id' | 'createdAt'>;
```

---

## 🔧 Configuración y Deployment

### Variables de Entorno

```bash
# Backend
MODULE_ENABLED=true
MODULE_CACHE_TTL=3600

# Database
DB_SCHEMA=schema_name
```

### Migraciones

```bash
# Aplicar migración
npm run migration:run

# Rollback
npm run migration:revert
```

---

## 🧪 Testing

### Unit Tests

```typescript
describe('ServiceName', () => {
  let service: ServiceName;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ServiceName],
    }).compile();

    service = module.get<ServiceName>(ServiceName);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create entity', async () => {
    const dto = { campo1: 'test' };
    const result = await service.create(dto);
    expect(result).toBeDefined();
  });
});
```

### Integration Tests

```typescript
describe('Controller E2E', () => {
  it('/GET resource', () => {
    return request(app.getHttpServer())
      .get('/api/module/resource')
      .expect(200);
  });
});
```

---

## 📊 Optimización y Performance

### Indexes

| Índice | Tabla | Columnas | Tipo | Propósito |
|--------|-------|----------|------|-----------|
| idx_name | table | campo1, campo2 | B-tree | Búsquedas por... |

### Caching

- **Estrategia:** [Redis / In-memory / None]
- **TTL:** [Tiempo de vida]
- **Invalidación:** [Cuándo se invalida]

---

## 🔗 Referencias Adicionales

### Standards y Convenciones

- [Naming conventions](../../standards/naming-conventions.md)
- [Code style guide](../../standards/code-style.md)

### ADRs

- [ADR-NNN: Título](../adr/ADR-NNN-titulo.md)

---

## 📅 Historial de Cambios

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | YYYY-MM-DD | [Autor] | Creación del documento |

---

**Documento:** `docs/02-especificaciones-tecnicas/XX-modulo/ET-XXX-NNN-titulo.md`
**Propósito:** Especificación técnica detallada de [breve descripción]
**Audiencia:** Backend Dev, Frontend Dev, Database Admin, QA Team
