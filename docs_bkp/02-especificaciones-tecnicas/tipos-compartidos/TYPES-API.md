# Tipos Compartidos - API Responses

**Proyecto:** Gamilit Platform
**Módulo:** Tipos TypeScript Compartidos
**Categoría:** API Response Types & Error Handling
**Archivo original:** SHARED-TYPES-LIBRARY.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Descripción

Este archivo contiene tipos para respuestas de API:
- **APIResponse**: Estructura estándar de respuesta
- **PaginatedResponse**: Respuesta paginada
- **ErrorCode**: Códigos de error del sistema

---

### 6.9 API Response Types

#### 6.9.1 APIResponse

**Description**: Standard API response wrapper

**TypeScript Definition**:
```typescript
interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  meta?: ResponseMeta;
}

interface APIError {
  code: string;
  message: string;
  details?: any;
}

interface ResponseMeta {
  timestamp: string;
  requestId?: string;
}
```

**Zod Schema**:
```typescript
const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.any().optional()
});

const responseMetaSchema = z.object({
  timestamp: z.string().datetime(),
  requestId: z.string().optional()
});

const apiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: apiErrorSchema.optional(),
    meta: responseMetaSchema.optional()
  });
```

**Example Usage**:
```typescript
// Backend
const response: APIResponse<User> = {
  success: true,
  data: user,
  meta: {
    timestamp: new Date().toISOString(),
    requestId: 'req-123'
  }
};

// Frontend
const handleResponse = async () => {
  const response = await api.get<APIResponse<User>>('/users/me');
  if (response.data.success && response.data.data) {
    setUser(response.data.data);
  }
};
```

---

#### 6.9.2 PaginatedResponse

**Description**: Paginated list response

**TypeScript Definition**:
```typescript
interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

**Zod Schema**:
```typescript
const paginationMetaSchema = z.object({
  total: z.number().int().min(0),
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().min(0)
});

const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    success: z.literal(true),
    data: z.array(itemSchema),
    meta: paginationMetaSchema
  });
```

**Example Usage**:
```typescript
const response: PaginatedResponse<Module> = {
  success: true,
  data: modules,
  meta: {
    total: 25,
    page: 1,
    limit: 10,
    totalPages: 3
  }
};
```

---

#### 6.9.3 ErrorCode

**Description**: Standard error codes

**TypeScript Definition**:
```typescript
enum ErrorCode {
  // Authentication
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  EMAIL_EXISTS = 'EMAIL_EXISTS',
  ACCOUNT_INACTIVE = 'ACCOUNT_INACTIVE',
  ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',

  // Authorization
  FORBIDDEN = 'FORBIDDEN',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  WEAK_PASSWORD = 'WEAK_PASSWORD',

  // Resources
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',

  // Server
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
}
```

**Zod Schema**:
```typescript
const errorCodeSchema = z.enum([
  'UNAUTHORIZED',
  'INVALID_TOKEN',
  'TOKEN_EXPIRED',
  'INVALID_CREDENTIALS',
  'EMAIL_EXISTS',
  'ACCOUNT_INACTIVE',
  'ACCOUNT_SUSPENDED',
  'FORBIDDEN',
  'VALIDATION_ERROR',
  'WEAK_PASSWORD',
  'NOT_FOUND',
  'ALREADY_EXISTS',
  'INSUFFICIENT_FUNDS',
  'INTERNAL_ERROR',
  'DATABASE_ERROR'
]);
```

---

