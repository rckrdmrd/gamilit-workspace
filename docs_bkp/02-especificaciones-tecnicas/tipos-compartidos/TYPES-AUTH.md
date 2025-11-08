# Tipos Compartidos - Autenticación

**Proyecto:** Gamilit Platform
**Módulo:** Tipos TypeScript Compartidos
**Categoría:** Authentication (Login, Register, Tokens, Password Recovery)
**Archivo original:** SHARED-TYPES-LIBRARY.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Descripción

Este archivo contiene todos los tipos relacionados con autenticación y autorización:
- **LoginDto**: Payload de inicio de sesión
- **RegisterDto**: Payload de registro de usuario
- **AuthResponse**: Respuesta de autenticación con tokens
- **RefreshTokenDto**: Solicitud de refresh token
- **UpdatePasswordDto**: Cambio de contraseña
- **ForgotPasswordDto**: Recuperación de contraseña
- **ResetPasswordDto**: Reseteo de contraseña con token
- **VerifyEmailDto**: Verificación de email
- **SessionInfoDto**: Información de sesión

---

### 6.2 Auth Types

#### 6.2.1 LoginDto

**Description**: Login request payload

**TypeScript Definition**:
```typescript
interface LoginDto {
  email: string;
  password: string;
}
```

**Zod Schema**:
```typescript
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});
```

**Type Guard**:
```typescript
function isLoginDto(value: unknown): value is LoginDto {
  return loginSchema.safeParse(value).success;
}
```

**Backend Usage**:
```typescript
import { LoginDto, loginSchema } from '@glit/shared-types';

router.post('/login', async (req: Request, res: Response) => {
  const validatedData = loginSchema.parse(req.body);
  const result = await authService.login(validatedData);
  res.json(result);
});
```

**Frontend Usage**:
```typescript
import { LoginDto, loginSchema } from '@glit/shared-types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginDto>({
    resolver: zodResolver(loginSchema)
  });

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

#### 6.2.2 RegisterDto

**Description**: Registration request payload

**TypeScript Definition**:
```typescript
interface RegisterDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: 'student' | 'admin_teacher' | 'super_admin';
}
```

**Zod Schema**:
```typescript
const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  role: z.enum(['student', 'admin_teacher', 'super_admin']).default('student'),
});
```

**Example Data**:
```typescript
const exampleRegister: RegisterDto = {
  email: 'nuevo@estudiante.com',
  password: 'SecurePass123',
  firstName: 'Juan',
  lastName: 'Pérez',
  role: 'student'
};
```

---

#### 6.2.3 AuthResponse

**Description**: Authentication response with tokens

**TypeScript Definition**:
```typescript
interface AuthResponse {
  user: {
    id: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
    displayName?: string;
  };
  token: string;
  refreshToken?: string;
  expiresIn: string;
}
```

**Zod Schema**:
```typescript
const authResponseSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    role: z.string(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    displayName: z.string().optional(),
  }),
  token: z.string(),
  refreshToken: z.string().optional(),
  expiresIn: z.string(),
});
```

**Example Data**:
```typescript
const exampleAuthResponse: AuthResponse = {
  user: {
    id: 'user-123',
    email: 'estudiante@glit.com',
    role: 'student',
    firstName: 'María',
    lastName: 'García',
    displayName: 'María G.'
  },
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  expiresIn: '7d'
};
```

**Backend Usage**:
```typescript
import { AuthResponse } from '@glit/shared-types';

async function login(credentials: LoginDto): Promise<AuthResponse> {
  const user = await validateCredentials(credentials);
  const token = generateJWT(user);
  const refreshToken = generateRefreshToken(user);

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      displayName: user.display_name
    },
    token,
    refreshToken,
    expiresIn: '7d'
  };
}
```

---

#### 6.2.4 RefreshTokenDto

**Description**: Refresh token request

**TypeScript Definition**:
```typescript
interface RefreshTokenDto {
  refreshToken: string;
}
```

**Zod Schema**:
```typescript
const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token es requerido'),
});
```

---

#### 6.2.5 UpdatePasswordDto

**Description**: Update password request

**TypeScript Definition**:
```typescript
interface UpdatePasswordDto {
  currentPassword: string;
  newPassword: string;
}
```

**Zod Schema**:
```typescript
const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual requerida'),
  newPassword: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
}).refine(data => data.currentPassword !== data.newPassword, {
  message: 'La nueva contraseña debe ser diferente a la actual',
  path: ['newPassword']
});
```

---

#### 6.2.6 ForgotPasswordDto

**Description**: Forgot password request

**TypeScript Definition**:
```typescript
interface ForgotPasswordDto {
  email: string;
}
```

**Zod Schema**:
```typescript
const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});
```

---

#### 6.2.7 ResetPasswordDto

**Description**: Reset password with token

**TypeScript Definition**:
```typescript
interface ResetPasswordDto {
  token: string;
  newPassword: string;
}
```

**Zod Schema**:
```typescript
const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  newPassword: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
});
```

---

#### 6.2.8 VerifyEmailDto

**Description**: Email verification request

**TypeScript Definition**:
```typescript
interface VerifyEmailDto {
  token: string;
}
```

**Zod Schema**:
```typescript
const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
});
```

---

#### 6.2.9 SessionInfoDto

**Description**: Session information response

**TypeScript Definition**:
```typescript
interface SessionInfoDto {
  id: string;
  deviceType: string;
  browser: string;
  os: string;
  ipAddress: string;
  location: string;
  createdAt: string;
  lastActivity: string;
  isCurrent: boolean;
}
```

**Zod Schema**:
```typescript
const sessionInfoSchema = z.object({
  id: z.string().uuid(),
  deviceType: z.string(),
  browser: z.string(),
  os: z.string(),
  ipAddress: z.string(),
  location: z.string(),
  createdAt: z.string(),
  lastActivity: z.string(),
  isCurrent: z.boolean(),
});
```

---

## ENUMs de Autenticación

### GamilitRole

**Description**: Roles de usuario en el sistema

**TypeScript Definition**:
```typescript
type GamilitRole = 'student' | 'admin_teacher' | 'super_admin';
```

**Zod Schema**:
```typescript
const gamilitRoleSchema = z.enum(['student', 'admin_teacher', 'super_admin']);
```

**PostgreSQL ENUM**:
```sql
CREATE TYPE auth_management.gamilit_role AS ENUM ('student', 'admin_teacher', 'super_admin');
```

**Valores**:
- `student` - Estudiante (rol por defecto)
- `admin_teacher` - Profesor/Administrador con acceso a portal de profesores
- `super_admin` - Super administrador con acceso completo al sistema

**Ejemplo de uso**:
```typescript
interface User {
  id: string;
  email: string;
  role: GamilitRole;
}

const student: User = {
  id: '123',
  email: 'estudiante@ejemplo.com',
  role: 'student'
};
```

---

### UserStatus

**Description**: Estados posibles de un usuario

**TypeScript Definition**:
```typescript
type UserStatus = 'active' | 'inactive' | 'suspended' | 'banned' | 'pending';
```

**Zod Schema**:
```typescript
const userStatusSchema = z.enum(['active', 'inactive', 'suspended', 'banned', 'pending']);
```

**PostgreSQL ENUM**:
```sql
CREATE TYPE auth_management.user_status AS ENUM ('active', 'inactive', 'suspended', 'banned', 'pending');
```

**Valores**:
- `active` - Usuario activo (puede usar el sistema)
- `inactive` - Usuario inactivo (no puede iniciar sesión)
- `suspended` - Usuario suspendido temporalmente
- `banned` - Usuario baneado permanentemente
- `pending` - Usuario pendiente de activación/verificación

**Ejemplo de uso**:
```typescript
interface UserProfile {
  id: string;
  email: string;
  status: UserStatus;
}

const profile: UserProfile = {
  id: '123',
  email: 'usuario@ejemplo.com',
  status: 'active'
};
```

---

### AuthProvider

**Description**: Proveedores de autenticación soportados

**TypeScript Definition**:
```typescript
type AuthProvider = 'local' | 'google' | 'facebook' | 'apple' | 'microsoft' | 'github';
```

**Zod Schema**:
```typescript
const authProviderSchema = z.enum(['local', 'google', 'facebook', 'apple', 'microsoft', 'github']);
```

**PostgreSQL ENUM**:
```sql
CREATE TYPE public.auth_provider AS ENUM ('local', 'google', 'facebook', 'apple', 'microsoft', 'github');
```

**Valores**:
- `local` - Autenticación local (email/password)
- `google` - Autenticación con Google OAuth
- `facebook` - Autenticación con Facebook OAuth
- `apple` - Autenticación con Apple Sign In
- `microsoft` - Autenticación con Microsoft OAuth
- `github` - Autenticación con GitHub OAuth

**Ejemplo de uso**:
```typescript
interface AuthProviderInfo {
  provider: AuthProvider;
  providerId: string;
  email: string;
}

const googleAuth: AuthProviderInfo = {
  provider: 'google',
  providerId: 'google-user-123',
  email: 'usuario@gmail.com'
};
```

---

## Referencias Cruzadas

- **Database Schema**: Ver [ESQUEMA-COMPLETO.md](../../03-desarrollo/base-de-datos/ESQUEMA-COMPLETO.md#12-schema-auth_management)
- **API Reference**: Ver [AUTH-API.md](../apis/api-reference/01-AUTH-API.md)
- **Requerimientos**: Ver [RF-AUTH-001-roles.md](../../01-requerimientos/autenticacion/RF-AUTH-001-roles.md)

---

**Última actualización:** 2025-11-07
**Estado:** ✅ Sincronizado con DDL (auth_management.gamilit_role, auth_management.user_status, public.auth_provider)

---

