# Implementación - Type Guards & Validators

**Proyecto:** Gamilit Platform
**Módulo:** Tipos TypeScript Compartidos
**Categoría:** Implementation - Type Guards & Validation
**Archivo original:** SHARED-TYPES-LIBRARY.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Descripción

Este archivo contiene guías de implementación para:
- **Type Guards**: Funciones de validación de tipos en runtime
- **Zod Integration**: Integración con Zod para validación
- **Validation Middleware**: Middleware de validación para backend
- **React Hook Form Integration**: Integración con React Hook Form

---

## 7. Type Guards & Validators

### 7.1 Zod Integration

All types should have corresponding Zod schemas for runtime validation.

**Example Implementation**:

```typescript
// src/auth/auth.schemas.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres')
});

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['student', 'admin_teacher']).default('student')
});

export const authResponseSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    role: z.string(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    displayName: z.string().optional()
  }),
  token: z.string(),
  refreshToken: z.string().optional(),
  expiresIn: z.string()
});
```

### 7.2 Type Guards

**Example Implementation**:

```typescript
// src/auth/auth.guards.ts
import { LoginDto, RegisterDto, AuthResponse } from './auth.types';
import { loginSchema, registerSchema, authResponseSchema } from './auth.schemas';

export function isLoginDto(value: unknown): value is LoginDto {
  return loginSchema.safeParse(value).success;
}

export function isRegisterDto(value: unknown): value is RegisterDto {
  return registerSchema.safeParse(value).success;
}

export function isAuthResponse(value: unknown): value is AuthResponse {
  return authResponseSchema.safeParse(value).success;
}

export function assertLoginDto(value: unknown): asserts value is LoginDto {
  const result = loginSchema.safeParse(value);
  if (!result.success) {
    throw new Error(`Invalid LoginDto: ${result.error.message}`);
  }
}
```

### 7.3 Validation Middleware (Backend)

**Example Implementation**:

```typescript
// middleware/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export function validate<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Datos de entrada inválidos',
            details: error.errors
          }
        });
      } else {
        next(error);
      }
    }
  };
}

// Usage
import { loginSchema } from '@glit/shared-types';

router.post('/login', validate(loginSchema), authController.login);
```

### 7.4 React Hook Form Integration (Frontend)

**Example Implementation**:

```typescript
// hooks/useValidatedForm.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

export function useValidatedForm<T extends z.ZodTypeAny>(schema: T) {
  return useForm<z.infer<T>>({
    resolver: zodResolver(schema)
  });
}

// Component usage
import { LoginDto, loginSchema } from '@glit/shared-types';

const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useValidatedForm(loginSchema);

  const onSubmit = async (data: LoginDto) => {
    await api.post('/auth/login', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" {...register('password')} />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Login</button>
    </form>
  );
};
```

---

