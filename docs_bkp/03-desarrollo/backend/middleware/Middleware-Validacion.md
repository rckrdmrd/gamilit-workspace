# Middleware de Validación

**Proyecto:** GAMILIT
**RFC:** RFC-0001
**Versión:** 1.0.0
**Última Actualización:** 2025-11-01

---

## Archivo

**Ubicación:** `/src/middleware/validation.middleware.ts`

---

## Índice

1. [validate](#validate)
2. [Shortcuts de Validación](#shortcuts-de-validación)
3. [Esquemas de Validación](#esquemas-de-validación)
4. [Validaciones Comunes](#validaciones-comunes)

---

## validate

Middleware de validación con Joi. Valida body, params o query.

### Signature

```typescript
validate(schema: Joi.Schema, property: 'body' | 'params' | 'query', options?: Joi.ValidationOptions)
```

### Ejemplo de Uso

```typescript
import { validate } from '@/middleware/validation.middleware';
import { registerSchema } from './validations/auth.validation';

router.post('/api/auth/register',
  validate(registerSchema, 'body'),  // ← Validar body
  authController.register
);

router.get('/api/users/:id',
  validate(userIdSchema, 'params'),  // ← Validar params
  usersController.getUser
);

router.get('/api/search',
  validate(searchSchema, 'query'),   // ← Validar query
  searchController.search
);
```

### Opciones de Validación (Joi)

```typescript
const defaultOptions: Joi.ValidationOptions = {
  abortEarly: false,      // Retornar TODOS los errores
  stripUnknown: true,     // Eliminar campos no definidos
  convert: true,          // Auto-convertir tipos
  allowUnknown: false,    // No permitir campos adicionales
};
```

### Respuesta de Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "\"email\" must be a valid email",
        "type": "string.email"
      },
      {
        "field": "password",
        "message": "\"password\" length must be at least 8 characters long",
        "type": "string.min"
      }
    ]
  }
}
```

---

## Shortcuts de Validación

### validateBody

Atajo para `validate(schema, 'body')`

```typescript
import { validateBody } from '@/middleware/validation.middleware';

router.post('/api/auth/register',
  validateBody(registerSchema),
  authController.register
);
```

### validateQuery

Atajo para `validate(schema, 'query')`

```typescript
import { validateQuery } from '@/middleware/validation.middleware';

router.get('/api/search',
  validateQuery(searchSchema),
  searchController.search
);
```

### validateParams

Atajo para `validate(schema, 'params')`

```typescript
import { validateParams } from '@/middleware/validation.middleware';

router.get('/api/users/:id',
  validateParams(userIdSchema),
  usersController.getUser
);
```

---

## Esquemas de Validación

### Ejemplo: auth.validation.ts

```typescript
import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email must be valid',
      'any.required': 'Email is required',
    }),

  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain uppercase, lowercase, and number',
      'any.required': 'Password is required',
    }),

  role: Joi.string()
    .valid('student', 'teacher')
    .default('student'),

  firstName: Joi.string()
    .min(2)
    .max(50)
    .optional(),

  lastName: Joi.string()
    .min(2)
    .max(50)
    .optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});
```

---

## Validaciones Comunes

### UUID

```typescript
const uuidSchema = Joi.string()
  .uuid({ version: 'uuidv4' })
  .required();

export const userIdSchema = Joi.object({
  id: uuidSchema
});
```

### Paginación

```typescript
export const paginationSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0),
});
```

### Fechas

```typescript
export const dateRangeSchema = Joi.object({
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
});
```

### Email

```typescript
const emailSchema = Joi.string()
  .email()
  .lowercase()
  .trim()
  .required();
```

### Password

```typescript
const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])?/)
  .required()
  .messages({
    'string.min': 'Password must be at least 8 characters',
    'string.max': 'Password must not exceed 128 characters',
    'string.pattern.base': 'Password must contain uppercase, lowercase, and number',
  });
```

### Roles

```typescript
const roleSchema = Joi.string()
  .valid('student', 'teacher', 'admin', 'super_admin')
  .required();
```

### Status

```typescript
const statusSchema = Joi.string()
  .valid('active', 'inactive', 'pending', 'suspended')
  .required();
```

---

## Ejemplo Completo: Classroom Validation

```typescript
import Joi from 'joi';

export const createClassroomSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.min': 'Classroom name must be at least 3 characters',
      'string.max': 'Classroom name must not exceed 100 characters',
    }),

  description: Joi.string()
    .max(500)
    .optional()
    .allow(''),

  subject: Joi.string()
    .max(50)
    .required(),

  grade: Joi.string()
    .max(20)
    .optional(),

  academicYear: Joi.string()
    .pattern(/^\d{4}-\d{4}$/)
    .required()
    .messages({
      'string.pattern.base': 'Academic year must be in format YYYY-YYYY (e.g., 2024-2025)',
    }),

  maxStudents: Joi.number()
    .integer()
    .min(1)
    .max(500)
    .default(50),
});

export const updateClassroomSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  description: Joi.string().max(500).optional().allow(''),
  subject: Joi.string().max(50).optional(),
  grade: Joi.string().max(20).optional(),
  isActive: Joi.boolean().optional(),
}).min(1); // Al menos un campo debe estar presente
```

---

## Uso en Rutas

### Validación Simple

```typescript
router.post('/api/auth/register',
  validateBody(registerSchema),
  authController.register
);
```

### Validación Múltiple

```typescript
router.get('/api/users/:id/posts',
  authenticateJWT,
  validateParams(userIdSchema),      // Validar params
  validateQuery(paginationSchema),   // Validar query
  postsController.getUserPosts
);
```

### Validación Completa

```typescript
router.put('/api/classrooms/:id',
  authenticateJWT,
  requireRole('teacher', 'admin'),
  validateParams(classroomIdSchema),
  validateBody(updateClassroomSchema),
  classroomController.updateClassroom
);
```

---

## Buenas Prácticas

### 1. Mensajes Claros

```typescript
// ✓ BIEN - Mensaje específico
password: Joi.string()
  .min(8)
  .messages({
    'string.min': 'Password must be at least 8 characters'
  })

// ✗ MAL - Mensaje genérico de Joi
password: Joi.string().min(8)
```

### 2. Validar Todo

```typescript
// ✓ BIEN - Validar body, params y query
router.put('/api/users/:id',
  validateParams(userIdSchema),
  validateQuery(optionsSchema),
  validateBody(updateUserSchema),
  controller.update
);
```

### 3. Usar Defaults Sensatos

```typescript
export const paginationSchema = Joi.object({
  limit: Joi.number().default(20),    // Default sensato
  offset: Joi.number().default(0),
  sortBy: Joi.string().default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
});
```

### 4. Sanitización

```typescript
const emailSchema = Joi.string()
  .email()
  .lowercase()  // ← Convertir a minúsculas
  .trim()       // ← Eliminar espacios
  .required();
```

---

## Documentos Relacionados

- [README de Middleware](./README.md) - Índice de middlewares
- [Middleware de Autenticación](./Middleware-Autenticacion.md) - Autenticación
- [API Endpoints](../api/README.md) - Endpoints de API

---

**Última revisión:** 2025-11-01
