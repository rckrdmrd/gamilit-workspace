# ERR-INT-002: DTOs Desalineados Frontend-Backend

**Categoria:** Integracion
**Severidad:** Alta
**Ocurrencias:** 6+
**Fecha documentacion:** 2025-12-28

---

## Descripcion

Los tipos TypeScript en frontend no coinciden con los DTOs del backend,
causando errores de tipado o comportamiento inesperado en runtime.

---

## Sintoma

- Propiedades undefined en frontend que existen en respuesta
- Errores TypeScript al consumir API
- Campos con nombres diferentes (camelCase vs snake_case)
- Tipos incorrectos (string en FE, number en BE)

---

## Causa Raiz

Definicion manual de tipos en frontend sin sincronizacion con backend:

```typescript
// BACKEND DTO
export class UserResponseDto {
  user_id: string;
  created_at: Date;
  is_active: boolean;
}

// FRONTEND TYPE (desalineado)
interface User {
  userId: string;  // Diferente nombre
  createdAt: string;  // Diferente tipo
  // is_active faltante!
}
```

---

## Solucion

### 1. Usar transformacion consistente

```typescript
// api.config.ts - Transformar respuestas
const api = axios.create({
  transformResponse: [(data) => {
    return JSON.parse(data, (key, value) => {
      // Convertir snake_case a camelCase si es necesario
      return value;
    });
  }],
});
```

### 2. Mantener tipos sincronizados

```typescript
// Crear archivo de tipos compartidos basado en DTOs
// src/types/api/user.types.ts
export interface UserResponse {
  user_id: string;
  created_at: string;  // ISO string desde JSON
  is_active: boolean;
}
```

### 3. Documentar diferencias conocidas

```typescript
/**
 * @note Backend retorna snake_case, frontend usa camelCase
 * Transformacion ocurre en useUserQuery hook
 */
```

---

## Prevencion

- Generar tipos desde OpenAPI/Swagger del backend
- Revisar DTOs de backend al modificar tipos frontend
- Tests de integracion validando estructura de respuesta

---

## Referencias

- `docs/80-references/transversal/api/API-ADMIN-MODULE.md`
- `docs/80-references/transversal/api/API-TEACHER-MODULE.md`
