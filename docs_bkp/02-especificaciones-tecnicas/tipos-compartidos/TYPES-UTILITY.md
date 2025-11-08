# Tipos Compartidos - Utility Types

**Proyecto:** Gamilit Platform
**Módulo:** Tipos TypeScript Compartidos
**Categoría:** Utility Types & Common Patterns
**Archivo original:** SHARED-TYPES-LIBRARY.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Descripción

Este archivo contiene tipos utilitarios compartidos:
- **Timestamps**: Campos de fecha común
- **SoftDelete**: Patrón de eliminación lógica
- **AuditFields**: Campos de auditoría
- **PaginationParams**: Parámetros de paginación
- **FilterOptions**: Opciones de filtrado

---

### 6.10 Utility Types

#### 6.10.1 Timestamps

**Description**: Common timestamp fields

**TypeScript Definition**:
```typescript
interface Timestamps {
  created_at: Date;
  updated_at: Date;
}

interface TimestampsOptional {
  created_at?: Date;
  updated_at?: Date;
}
```

**Zod Schema**:
```typescript
const timestampsSchema = z.object({
  created_at: z.date(),
  updated_at: z.date()
});

const timestampsOptionalSchema = z.object({
  created_at: z.date().optional(),
  updated_at: z.date().optional()
});
```

---

#### 6.10.2 SoftDelete

**Description**: Soft delete functionality

**TypeScript Definition**:
```typescript
interface SoftDelete {
  deleted_at?: Date;
  is_deleted?: boolean;
}
```

**Zod Schema**:
```typescript
const softDeleteSchema = z.object({
  deleted_at: z.date().optional(),
  is_deleted: z.boolean().optional()
});
```

---

#### 6.10.3 AuditFields

**Description**: Audit trail fields

**TypeScript Definition**:
```typescript
interface AuditFields {
  created_by?: string;
  updated_by?: string;
  created_at: Date;
  updated_at: Date;
}
```

**Zod Schema**:
```typescript
const auditFieldsSchema = z.object({
  created_by: z.string().uuid().optional(),
  updated_by: z.string().uuid().optional(),
  created_at: z.date(),
  updated_at: z.date()
});
```

---

#### 6.10.4 PaginationParams

**Description**: Query parameters for pagination

**TypeScript Definition**:
```typescript
interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}
```

**Zod Schema**:
```typescript
const paginationParamsSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
  sortBy: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('asc')
});
```

---

#### 6.10.5 FilterOptions

**Description**: Generic filter options

**TypeScript Definition**:
```typescript
interface FilterOptions {
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  [key: string]: any;
}
```

**Zod Schema**:
```typescript
const filterOptionsSchema = z.object({
  search: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  status: z.string().optional()
}).passthrough();
```

---

