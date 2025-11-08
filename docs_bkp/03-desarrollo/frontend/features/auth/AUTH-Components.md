# Componentes de Autenticación

**Feature:** auth
**Tipo:** UI Components
**Ubicación:** `apps/frontend/src/features/auth/components/`
**Versión:** 2.0
**Fecha:** 2025-11-07

---

## 📋 Índice

1. [LoginForm](#1-loginform)
2. [RegisterForm](#2-registerform)
3. [ForgotPasswordForm](#3-forgotpasswordform)
4. [ResetPasswordForm](#4-resetpasswordform)
5. [ChangePasswordForm](#5-changepasswordform)
6. [Referencias](#referencias)

---

## 1. LoginForm

### Propósito
Formulario de inicio de sesión con validación en tiempo real y manejo de errores.

### Ubicación
`apps/frontend/src/features/auth/components/LoginForm.tsx`

### Props

```typescript
interface LoginFormProps {
  onSuccess?: (user: User) => void;
  onError?: (error: Error) => void;
  redirectTo?: string;
  showRegisterLink?: boolean;
  showForgotPasswordLink?: boolean;
  className?: string;
}
```

### Estado Interno

```typescript
interface LoginFormState {
  email: string;
  password: string;
  rememberMe: boolean;
  isLoading: boolean;
  error: string | null;
}
```

### Validación (Zod Schema)

```typescript
const loginSchema = z.object({
  email: z.string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
  rememberMe: z.boolean().optional()
});
```

**Referencia:** [`auth/schemas/login.schema.ts`](../../../../../apps/frontend/src/features/auth/schemas/login.schema.ts)

### Ejemplo de Uso

```tsx
import { LoginForm } from '@/features/auth/components';

function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="auth-container">
      <LoginForm
        onSuccess={(user) => {
          console.log('Login exitoso:', user);
          navigate(user.role === 'student' ? '/dashboard' : '/teacher/dashboard');
        }}
        onError={(error) => {
          toast.error(error.message);
        }}
        showRegisterLink={true}
        showForgotPasswordLink={true}
      />
    </div>
  );
}
```

### Flujo Interno

```
1. Usuario ingresa email y password
2. onChange → Validación en tiempo real (Zod)
3. onSubmit → useLogin hook
   ├─ Validación final
   ├─ authApi.login()
   ├─ authStore.setUser()
   └─ onSuccess callback
4. Redirección según rol
```

### Integración con Backend

- **Endpoint:** `POST /api/auth/login`
- **Request:**
  ```json
  {
    "email": "student@example.com",
    "password": "securePassword123"
  }
  ```
- **Response:**
  ```json
  {
    "user": { "id": "uuid", "email": "...", "role": "student" },
    "access_token": "jwt...",
    "refresh_token": "jwt..."
  }
  ```

**Referencia API:** [`docs/02-especificaciones-tecnicas/apis/api-reference/01-AUTH-API.md`](../../../../../02-especificaciones-tecnicas/apis/api-reference/01-AUTH-API.md#post-apiauthlogin)

### Estados Visuales

| Estado | Descripción | UI |
|--------|-------------|-----|
| `idle` | Formulario vacío | Campos habilitados |
| `validating` | Validando en tiempo real | Mensajes de error inline |
| `loading` | Enviando login | Spinner en botón, campos disabled |
| `success` | Login exitoso | Mensaje de éxito + redirección |
| `error` | Error de login | Alert con mensaje de error |

### Estilos

- **Tema:** Detective (oscuro)
- **Componentes base:** Button, Input (shared)
- **Clases Tailwind:** `bg-gray-900`, `text-amber-400`

**Referencia:** [`docs/03-desarrollo/frontend/estilos/TEMA_DETECTIVE_APLICADO.md`](../../estilos/TEMA_DETECTIVE_APLICADO.md)

---

## 2. RegisterForm

### Propósito
Formulario de registro de nuevos usuarios con validación compleja y confirmación de contraseña.

### Ubicación
`apps/frontend/src/features/auth/components/RegisterForm.tsx`

### Props

```typescript
interface RegisterFormProps {
  onSuccess?: (user: User) => void;
  onError?: (error: Error) => void;
  defaultRole?: UserRole;
  showLoginLink?: boolean;
  requireEmailVerification?: boolean; // Deprecated (ADR-001)
  className?: string;
}
```

### Estado Interno

```typescript
interface RegisterFormState {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  role: UserRole;
  gradeLevel?: string;
  acceptTerms: boolean;
  isLoading: boolean;
  error: string | null;
}
```

### Validación (Zod Schema)

```typescript
const registerSchema = z.object({
  email: z.string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  confirmPassword: z.string(),
  fullName: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres'),
  role: z.enum(['student', 'admin_teacher', 'super_admin']),
  gradeLevel: z.string().optional(),
  acceptTerms: z.boolean()
    .refine(val => val === true, 'Debes aceptar los términos')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});
```

**Referencia:** [`auth/schemas/register.schema.ts`](../../../../../apps/frontend/src/features/auth/schemas/register.schema.ts)

### Ejemplo de Uso

```tsx
import { RegisterForm } from '@/features/auth/components';

function RegisterPage() {
  return (
    <div className="auth-container">
      <RegisterForm
        defaultRole="student"
        onSuccess={(user) => {
          // Usuario creado y logueado automáticamente
          navigate('/onboarding');
        }}
        onError={(error) => {
          toast.error(error.message);
        }}
        showLoginLink={true}
      />
    </div>
  );
}
```

### Flujo Interno

```
1. Usuario completa formulario
2. Validación en tiempo real de cada campo
3. Validación de contraseña fuerte
4. Validación de confirmación de contraseña
5. onSubmit → useRegister hook
   ├─ Validación final
   ├─ authApi.register()
   ├─ Backend crea usuario + inicializa gamificación
   ├─ Login automático
   ├─ authStore.setUser()
   └─ onSuccess callback
6. Redirección a onboarding
```

### Integración con Backend

- **Endpoint:** `POST /api/auth/register`
- **Request:**
  ```json
  {
    "email": "newstudent@example.com",
    "password": "SecurePass123",
    "full_name": "Juan Pérez",
    "role": "student",
    "grade_level": "5to grado"
  }
  ```
- **Response:**
  ```json
  {
    "user": {
      "id": "uuid",
      "email": "newstudent@example.com",
      "full_name": "Juan Pérez",
      "role": "student",
      "status": "active"
    },
    "access_token": "jwt...",
    "refresh_token": "jwt..."
  }
  ```

**Referencia API:** [`docs/02-especificaciones-tecnicas/apis/api-reference/01-AUTH-API.md`](../../../../../02-especificaciones-tecnicas/apis/api-reference/01-AUTH-API.md#post-apiauthregister)

**Caso de Uso:** [`docs/01-requerimientos/casos-uso/student/UC-STU-001-registro.md`](../../../../../01-requerimientos/casos-uso/student/UC-STU-001-registro.md)

### Validación de Contraseña Visual

Indicador de fuerza de contraseña:
- ❌ Débil (< 8 caracteres)
- 🟡 Media (8+ caracteres, sin requisitos)
- ✅ Fuerte (8+ caracteres + mayúscula + minúscula + número)

### Notas Importantes

⚠️ **Email Verification Deshabilitada** (ADR-001)
- No se requiere verificación de email
- Usuario activo inmediatamente tras registro
- Reducción de fricción en onboarding

**Referencia:** [`docs/02-especificaciones-tecnicas/adr/ADR-001-email-verification-removal.md`](../../../../../02-especificaciones-tecnicas/adr/ADR-001-email-verification-removal.md)

---

## 3. ForgotPasswordForm

### Propósito
Formulario para solicitar recuperación de contraseña mediante email.

### Ubicación
`apps/frontend/src/features/auth/components/ForgotPasswordForm.tsx`

### Props

```typescript
interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  showLoginLink?: boolean;
  className?: string;
}
```

### Estado Interno

```typescript
interface ForgotPasswordFormState {
  email: string;
  isLoading: boolean;
  isSubmitted: boolean;
  error: string | null;
}
```

### Validación (Zod Schema)

```typescript
const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, 'El email es requerido')
    .email('Email inválido')
});
```

### Ejemplo de Uso

```tsx
import { ForgotPasswordForm } from '@/features/auth/components';

function ForgotPasswordPage() {
  return (
    <ForgotPasswordForm
      onSuccess={() => {
        toast.success('Revisa tu email para restablecer tu contraseña');
      }}
      onError={(error) => {
        toast.error(error.message);
      }}
      showLoginLink={true}
    />
  );
}
```

### Flujo Interno

```
1. Usuario ingresa email
2. Validación de formato
3. onSubmit → authApi.forgotPassword()
4. Backend:
   ├─ Valida email existe
   ├─ Genera token de recuperación
   ├─ Envía email con link
   └─ Responde success (sin revelar si email existe)
5. Mostrar mensaje de confirmación
```

### Integración con Backend

- **Endpoint:** `POST /api/auth/forgot-password`
- **Request:**
  ```json
  {
    "email": "student@example.com"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Si el email existe, recibirás instrucciones"
  }
  ```

**Seguridad:** El backend no revela si el email existe (prevención de email enumeration).

**Referencia API:** [`docs/02-especificaciones-tecnicas/apis/api-reference/01-AUTH-API.md`](../../../../../02-especificaciones-tecnicas/apis/api-reference/01-AUTH-API.md#post-apiauth/forgot-password)

---

## 4. ResetPasswordForm

### Propósito
Formulario para restablecer contraseña usando token de recuperación.

### Ubicación
`apps/frontend/src/features/auth/components/ResetPasswordForm.tsx`

### Props

```typescript
interface ResetPasswordFormProps {
  token: string; // Token de URL query param
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}
```

### Estado Interno

```typescript
interface ResetPasswordFormState {
  password: string;
  confirmPassword: string;
  isLoading: boolean;
  error: string | null;
}
```

### Validación (Zod Schema)

```typescript
const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword']
});
```

### Ejemplo de Uso

```tsx
import { ResetPasswordForm } from '@/features/auth/components';
import { useSearchParams } from 'react-router-dom';

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  if (!token) {
    return <div>Token inválido o expirado</div>;
  }

  return (
    <ResetPasswordForm
      token={token}
      onSuccess={() => {
        toast.success('Contraseña actualizada exitosamente');
        navigate('/login');
      }}
      onError={(error) => {
        toast.error(error.message);
      }}
    />
  );
}
```

### Flujo Interno

```
1. Usuario accede desde link de email (con token en URL)
2. Componente extrae token
3. Usuario ingresa nueva contraseña
4. Validación de contraseña fuerte
5. onSubmit → authApi.resetPassword(token, newPassword)
6. Backend:
   ├─ Valida token no expirado
   ├─ Hash nueva contraseña
   ├─ Actualiza BD
   └─ Invalida token
7. Redirección a login
```

### Integración con Backend

- **Endpoint:** `POST /api/auth/reset-password`
- **Request:**
  ```json
  {
    "token": "abc123...",
    "password": "NewSecurePass123"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Contraseña actualizada exitosamente"
  }
  ```

**Referencia API:** [`docs/02-especificaciones-tecnicas/apis/api-reference/01-AUTH-API.md`](../../../../../02-especificaciones-tecnicas/apis/api-reference/01-AUTH-API.md#post-apiauthresetpassword)

---

## 5. ChangePasswordForm

### Propósito
Formulario para que usuarios autenticados cambien su contraseña actual.

### Ubicación
`apps/frontend/src/features/auth/components/ChangePasswordForm.tsx`

### Props

```typescript
interface ChangePasswordFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}
```

### Estado Interno

```typescript
interface ChangePasswordFormState {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
  isLoading: boolean;
  error: string | null;
}
```

### Validación (Zod Schema)

```typescript
const changePasswordSchema = z.object({
  currentPassword: z.string()
    .min(1, 'La contraseña actual es requerida'),
  newPassword: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  confirmNewPassword: z.string()
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmNewPassword']
}).refine(data => data.currentPassword !== data.newPassword, {
  message: 'La nueva contraseña debe ser diferente a la actual',
  path: ['newPassword']
});
```

### Ejemplo de Uso

```tsx
import { ChangePasswordForm } from '@/features/auth/components';

function ProfileSettingsPage() {
  return (
    <div className="settings-section">
      <h2>Cambiar Contraseña</h2>
      <ChangePasswordForm
        onSuccess={() => {
          toast.success('Contraseña actualizada exitosamente');
        }}
        onError={(error) => {
          toast.error(error.message);
        }}
      />
    </div>
  );
}
```

### Flujo Interno

```
1. Usuario autenticado accede a configuración
2. Ingresa contraseña actual
3. Ingresa nueva contraseña (2 veces)
4. Validación de contraseña fuerte
5. onSubmit → authApi.changePassword()
6. Backend:
   ├─ Verifica contraseña actual
   ├─ Valida nueva contraseña diferente
   ├─ Hash nueva contraseña
   ├─ Actualiza BD
   └─ Invalida sesiones antiguas (opcional)
7. Mensaje de éxito
```

### Integración con Backend

- **Endpoint:** `PUT /api/auth/password`
- **Headers:** `Authorization: Bearer {access_token}`
- **Request:**
  ```json
  {
    "current_password": "OldPass123",
    "new_password": "NewSecurePass456"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Contraseña actualizada exitosamente"
  }
  ```

**Referencia API:** [`docs/02-especificaciones-tecnicas/apis/api-reference/01-AUTH-API.md`](../../../../../02-especificaciones-tecnicas/apis/api-reference/01-AUTH-API.md#put-apiauthpassword)

---

## 📊 Comparativa de Componentes

| Componente | Autenticación Requerida | Validación Contraseña | Redirección | Casos de Uso |
|------------|-------------------------|----------------------|-------------|--------------|
| **LoginForm** | ❌ No | Simple (min 8 chars) | Según rol | Login normal |
| **RegisterForm** | ❌ No | Fuerte (8+ chars + requisitos) | Onboarding | Nuevo usuario |
| **ForgotPasswordForm** | ❌ No | N/A | N/A | Olvidó contraseña |
| **ResetPasswordForm** | ❌ No (token) | Fuerte | Login | Desde email |
| **ChangePasswordForm** | ✅ Sí | Fuerte | N/A | Usuario autenticado |

---

## 🎨 Componentes Compartidos Usados

| Componente | Ubicación | Propósito |
|------------|-----------|-----------|
| **Button** | `shared/components/base/Button.tsx` | Botones de submit |
| **Input** | `shared/components/base/Input.tsx` | Campos de texto |
| **Card** | `shared/components/base/Card.tsx` | Contenedor del formulario |
| **Alert** | `shared/components/base/Alert.tsx` | Mensajes de error/éxito |
| **LoadingSpinner** | `shared/components/common/LoadingSpinner.tsx` | Indicador de carga |

**Referencia:** [`docs/03-desarrollo/frontend/componentes/README.md`](../../componentes/README.md)

---

## 🔗 Integraciones

### Con Hooks

Todos los componentes usan hooks custom:
- `useLogin()` - LoginForm
- `useRegister()` - RegisterForm
- `usePasswordRecovery()` - ForgotPasswordForm, ResetPasswordForm
- `usePasswordChange()` - ChangePasswordForm

**Ver:** [AUTH-Hooks.md](./AUTH-Hooks.md)

### Con Store

Todos interactúan con `authStore`:
- Lectura: `isAuthenticated`, `user`, `isLoading`, `error`
- Acciones: `login()`, `register()`, `logout()`, `updateUser()`

**Ver:** [AUTH-Store.md](./AUTH-Store.md)

### Con API

Llamadas directas a `authApi`:
- `authApi.login()`
- `authApi.register()`
- `authApi.forgotPassword()`
- `authApi.resetPassword()`
- `authApi.changePassword()`

**Ver:** [AUTH-API.md](./AUTH-API.md)

---

## 🧪 Testing

### Ejemplo de Test (LoginForm)

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('debe mostrar errores de validación', async () => {
    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/el email es requerido/i)).toBeInTheDocument();
    });
  });

  it('debe llamar onSuccess al login exitoso', async () => {
    const onSuccess = jest.fn();
    render(<LoginForm onSuccess={onSuccess} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({
        email: 'test@example.com'
      }));
    });
  });
});
```

---

## Referencias

### Documentación Base

- **Requerimientos:** [`docs/01-requerimientos/casos-uso/student/UC-STU-001-registro.md`](../../../../../01-requerimientos/casos-uso/student/UC-STU-001-registro.md)
- **API Spec:** [`docs/02-especificaciones-tecnicas/apis/api-reference/01-AUTH-API.md`](../../../../../02-especificaciones-tecnicas/apis/api-reference/01-AUTH-API.md)
- **Tipos:** [`docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-AUTH.md`](../../../../../02-especificaciones-tecnicas/tipos-compartidos/TYPES-AUTH.md)
- **Trazabilidad:** [`docs/02-especificaciones-tecnicas/trazabilidad/01-foundation-authentication.md`](../../../../../02-especificaciones-tecnicas/trazabilidad/01-foundation-authentication.md)
- **ADR:** [`docs/02-especificaciones-tecnicas/adr/ADR-001-email-verification-removal.md`](../../../../../02-especificaciones-tecnicas/adr/ADR-001-email-verification-removal.md)

### Documentación Frontend

- **Feature README:** [README.md](./README.md)
- **Store:** [AUTH-Store.md](./AUTH-Store.md)
- **Hooks:** [AUTH-Hooks.md](./AUTH-Hooks.md)
- **API:** [AUTH-API.md](./AUTH-API.md)
- **Flujos:** [AUTH-Flows.md](./AUTH-Flows.md)

---

**Mantenedores:** @frontend-team
**Última actualización:** 2025-11-07
**Próxima revisión:** Mensual
