# AUTH - Custom Hooks

**Proyecto:** GAMILIT Platform
**Feature:** Authentication System
**Componente:** Custom React Hooks
**Versión:** 2.0
**Fecha:** 2025-11-07
**Ubicación:** `apps/frontend/src/features/auth/hooks/`

---

## 📋 Índice

1. [Propósito](#-propósito)
2. [Referencias](#-referencias-a-documentación-base)
3. [Hooks Disponibles](#-hooks-disponibles)
4. [useAuth](#1-useauth)
5. [useUser](#2-useuser)
6. [useSession](#3-usesession)
7. [useLogin](#4-uselogin)
8. [useRegister](#5-useregister)
9. [Testing](#-testing)

---

## 🎯 Propósito

Los **custom hooks** de autenticación encapsulan lógica reutilizable relacionada con:
- Acceso al estado de autenticación
- Operaciones de login/logout/registro
- Validación de formularios con Zod
- Manejo de errores y loading states
- Integración con authStore

**Beneficios:**
- ✅ Lógica reutilizable en múltiples componentes
- ✅ Separación de concerns (UI vs lógica)
- ✅ Fácil testing
- ✅ Type-safe con TypeScript
- ✅ Consistencia en toda la aplicación

---

## 📚 Referencias a Documentación Base

### Requerimientos
- **Casos de Uso:** [`docs/01-requerimientos/casos-uso/student/UC-STU-001-registro.md`](../../../../01-requerimientos/casos-uso/student/UC-STU-001-registro.md)
  - Flujos de login y registro

### Especificaciones Técnicas
- **Tipos Compartidos:** [`docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-AUTH.md`](../../../../02-especificaciones-tecnicas/tipos-compartidos/TYPES-AUTH.md)
  - LoginDto, RegisterDto, AuthResponse
  - Schemas Zod de validación

- **API Reference:** [`docs/02-especificaciones-tecnicas/apis/api-reference/01-AUTH-API.md`](../../../../02-especificaciones-tecnicas/apis/api-reference/01-AUTH-API.md)
  - Endpoints de autenticación

### Documentación Feature
- **Overview:** [README.md](./README.md#2-hooks-principales)
- **Store:** [AUTH-Store.md](./AUTH-Store.md)
- **Components:** [AUTH-Components.md](./AUTH-Components.md)

---

## 🪝 Hooks Disponibles

| Hook | Propósito | Retorna |
|------|-----------|---------|
| **useAuth** | Hook principal con todo el estado y acciones | `AuthState & AuthActions` |
| **useUser** | Acceso al usuario actual | `User \| null` |
| **useSession** | Información de sesión y validación | `SessionInfo` |
| **useLogin** | Lógica de login con validación | `LoginHandlers` |
| **useRegister** | Lógica de registro con validación | `RegisterHandlers` |

---

## 1. useAuth()

Hook principal que expone todo el estado y acciones de autenticación.

### Propósito

Proporciona acceso completo al authStore para componentes que necesitan múltiples operaciones de auth.

### Implementación

```typescript
// apps/frontend/src/features/auth/hooks/useAuth.ts
import { useAuthStore } from '../store/authStore';
import type { User } from '@glit/shared-types';

interface UseAuthReturn {
  // Estado
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Acciones
  login: (credentials: LoginDto) => Promise<void>;
  register: (userData: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  const login = useAuthStore((state) => state.login);
  const register = useAuthStore((state) => state.register);
  const logout = useAuthStore((state) => state.logout);
  const refreshSession = useAuthStore((state) => state.refreshSession);
  const updateUser = useAuthStore((state) => state.updateUser);
  const clearError = useAuthStore((state) => state.clearError);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshSession,
    updateUser,
    clearError,
  };
};
```

### Uso

```typescript
import { useAuth } from '@/features/auth/hooks';

const Dashboard = () => {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <h1>Bienvenido, {user?.displayName}</h1>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
};
```

### Uso en Header

```typescript
const Header = () => {
  const { user, isAuthenticated, logout, isLoading } = useAuth();

  return (
    <header>
      {isAuthenticated ? (
        <>
          <Avatar src={user?.avatarUrl} />
          <span>{user?.displayName}</span>
          <button onClick={logout} disabled={isLoading}>
            Logout
          </button>
        </>
      ) : (
        <Link to="/login">Iniciar Sesión</Link>
      )}
    </header>
  );
};
```

---

## 2. useUser()

Hook simplificado para acceder solo al usuario actual.

### Propósito

Proporciona acceso rápido al usuario autenticado sin exponer acciones ni otros estados.

### Implementación

```typescript
// apps/frontend/src/features/auth/hooks/useUser.ts
import { useAuthStore } from '../store/authStore';
import type { User } from '@glit/shared-types';

interface UseUserReturn {
  user: User | null;
  isStudent: boolean;
  isTeacher: boolean;
  isAdmin: boolean;
  fullName: string;
}

export const useUser = (): UseUserReturn => {
  const user = useAuthStore((state) => state.user);

  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'admin_teacher';
  const isAdmin = user?.role === 'admin_platform';

  const fullName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
    : '';

  return {
    user,
    isStudent,
    isTeacher,
    isAdmin,
    fullName,
  };
};
```

### Uso

```typescript
import { useUser } from '@/features/auth/hooks';

const ProfilePage = () => {
  const { user, fullName, isStudent } = useUser();

  return (
    <div>
      <h1>{fullName}</h1>
      <p>Email: {user?.email}</p>
      {isStudent && <StudentDashboard />}
    </div>
  );
};
```

### Uso en Componente de Avatar

```typescript
const UserAvatar = () => {
  const { user, fullName } = useUser();

  return (
    <div className="avatar">
      <img src={user?.avatarUrl || '/default-avatar.png'} alt={fullName} />
      <span>{fullName}</span>
    </div>
  );
};
```

---

## 3. useSession()

Hook para validar y monitorear la sesión activa.

### Propósito

Maneja la validación de sesión, expiración, y refresh automático.

### Implementación

```typescript
// apps/frontend/src/features/auth/hooks/useSession.ts
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

interface UseSessionReturn {
  isValid: boolean;
  expiresAt: number | null;
  timeRemaining: number | null;
  isExpiringSoon: boolean;
}

export const useSession = (): UseSessionReturn => {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const sessionExpiresAt = useAuthStore((state) => state.sessionExpiresAt);
  const checkSession = useAuthStore((state) => state.checkSession);
  const refreshSession = useAuthStore((state) => state.refreshSession);

  const isValid = checkSession();

  useEffect(() => {
    if (!sessionExpiresAt) {
      setTimeRemaining(null);
      return;
    }

    const updateTime = () => {
      const remaining = sessionExpiresAt - Date.now();
      setTimeRemaining(remaining > 0 ? remaining : 0);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [sessionExpiresAt]);

  // Auto-refresh si expira en menos de 1 día
  useEffect(() => {
    if (timeRemaining && timeRemaining < 24 * 60 * 60 * 1000) {
      refreshSession().catch((error) => {
        console.error('Failed to refresh session:', error);
      });
    }
  }, [timeRemaining]);

  const isExpiringSoon = timeRemaining !== null && timeRemaining < 60 * 60 * 1000; // < 1 hora

  return {
    isValid,
    expiresAt: sessionExpiresAt,
    timeRemaining,
    isExpiringSoon,
  };
};
```

### Uso

```typescript
import { useSession } from '@/features/auth/hooks';

const SessionWarning = () => {
  const { isExpiringSoon, timeRemaining } = useSession();

  if (!isExpiringSoon || !timeRemaining) {
    return null;
  }

  const minutesRemaining = Math.floor(timeRemaining / (60 * 1000));

  return (
    <div className="warning">
      Tu sesión expirará en {minutesRemaining} minutos
    </div>
  );
};
```

---

## 4. useLogin()

Hook con lógica completa de login incluyendo validación con Zod.

### Propósito

Encapsula toda la lógica de login: validación de formulario, llamada a API, manejo de errores.

### Implementación

```typescript
// apps/frontend/src/features/auth/hooks/useLogin.ts
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';
import type { LoginDto } from '@glit/shared-types';

// Zod schema de validación
const loginSchema = z.object({
  email: z.string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
  rememberMe: z.boolean().optional(),
});

interface UseLoginReturn {
  // Form state
  register: ReturnType<typeof useForm>['register'];
  handleSubmit: ReturnType<typeof useForm>['handleSubmit'];
  errors: ReturnType<typeof useForm>['formState']['errors'];

  // Auth state
  isLoading: boolean;
  error: string | null;

  // Actions
  onSubmit: (data: LoginDto) => Promise<void>;
  clearError: () => void;
}

export const useLogin = (
  onSuccess?: (user: User) => void,
  onError?: (error: Error) => void
): UseLoginReturn => {
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const storeError = useAuthStore((state) => state.error);
  const clearStoreError = useAuthStore((state) => state.clearError);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginDto) => {
    try {
      await login(data);
      const user = useAuthStore.getState().user;
      if (user && onSuccess) {
        onSuccess(user);
      }
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    isLoading,
    error: storeError,
    onSubmit,
    clearError: clearStoreError,
  };
};
```

### Uso

```typescript
import { useLogin } from '@/features/auth/hooks';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();

  const { register, handleSubmit, errors, isLoading, error, onSubmit, clearError } = useLogin(
    (user) => {
      // Éxito: redirigir según rol
      if (user.role === 'student') {
        navigate('/student/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    },
    (error) => {
      console.error('Login failed:', error);
    }
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        type="email"
        {...register('email')}
        placeholder="Email"
      />
      {errors.email && <span className="error">{errors.email.message}</span>}

      <input
        type="password"
        {...register('password')}
        placeholder="Contraseña"
      />
      {errors.password && <span className="error">{errors.password.message}</span>}

      <label>
        <input type="checkbox" {...register('rememberMe')} />
        Recordarme
      </label>

      {error && (
        <div className="error-banner">
          {error}
          <button onClick={clearError}>×</button>
        </div>
      )}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </button>
    </form>
  );
};
```

**Referencia Zod Schema:** [`TYPES-AUTH.md`](../../../../02-especificaciones-tecnicas/tipos-compartidos/TYPES-AUTH.md#621-logindto)

---

## 5. useRegister()

Hook con lógica completa de registro incluyendo validación.

### Propósito

Encapsula la lógica de registro: validación de formulario, password strength, llamada a API.

### Implementación

```typescript
// apps/frontend/src/features/auth/hooks/useRegister.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';
import type { RegisterDto } from '@glit/shared-types';

// Zod schema de validación
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
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  role: z.enum(['student', 'admin_teacher']).default('student'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface UseRegisterReturn {
  register: ReturnType<typeof useForm>['register'];
  handleSubmit: ReturnType<typeof useForm>['handleSubmit'];
  errors: ReturnType<typeof useForm>['formState']['errors'];
  isLoading: boolean;
  error: string | null;
  onSubmit: (data: RegisterFormData) => Promise<void>;
  clearError: () => void;
}

export const useRegister = (
  onSuccess?: (user: User) => void,
  onError?: (error: Error) => void
): UseRegisterReturn => {
  const registerUser = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const storeError = useAuthStore((state) => state.error);
  const clearStoreError = useAuthStore((state) => state.clearError);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    const { confirmPassword, ...registerDto } = data;

    try {
      await registerUser(registerDto);
      const user = useAuthStore.getState().user;
      if (user && onSuccess) {
        onSuccess(user);
      }
    } catch (error) {
      if (onError) {
        onError(error as Error);
      }
    }
  };

  return {
    register,
    handleSubmit,
    errors,
    isLoading,
    error: storeError,
    onSubmit,
    clearError: clearStoreError,
  };
};
```

### Uso

```typescript
import { useRegister } from '@/features/auth/hooks';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate();

  const { register, handleSubmit, errors, isLoading, onSubmit } = useRegister(
    (user) => {
      // Auto-login exitoso, redirigir a onboarding
      navigate('/onboarding');
    }
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('firstName')} placeholder="Nombre" />
      {errors.firstName && <span>{errors.firstName.message}</span>}

      <input {...register('lastName')} placeholder="Apellido" />
      {errors.lastName && <span>{errors.lastName.message}</span>}

      <input type="email" {...register('email')} placeholder="Email" />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" {...register('password')} placeholder="Contraseña" />
      {errors.password && <span>{errors.password.message}</span>}

      <input
        type="password"
        {...register('confirmPassword')}
        placeholder="Confirmar Contraseña"
      />
      {errors.confirmPassword && <span>{errors.confirmPassword.message}</span>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Registrando...' : 'Registrarse'}
      </button>
    </form>
  );
};
```

**Referencia Zod Schema:** [`TYPES-AUTH.md`](../../../../02-especificaciones-tecnicas/tipos-compartidos/TYPES-AUTH.md#622-registerdto)

---

## 🧪 Testing

### Test de useAuth

```typescript
// __tests__/useAuth.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { useAuthStore } from '../../store/authStore';

describe('useAuth', () => {
  it('should expose all auth state and actions', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current).toHaveProperty('user');
    expect(result.current).toHaveProperty('isAuthenticated');
    expect(result.current).toHaveProperty('login');
    expect(result.current).toHaveProperty('logout');
  });

  it('should call login action', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'pass' });
    });

    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

### Test de useLogin

```typescript
// __tests__/useLogin.test.ts
import { renderHook, act } from '@testing-library/react';
import { useLogin } from '../useLogin';

describe('useLogin', () => {
  it('should validate email format', async () => {
    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.handleSubmit(result.current.onSubmit)({
        email: 'invalid-email',
        password: 'ValidPass123',
      });
    });

    expect(result.current.errors.email?.message).toBe('Email inválido');
  });

  it('should validate password length', async () => {
    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.handleSubmit(result.current.onSubmit)({
        email: 'test@example.com',
        password: 'short',
      });
    });

    expect(result.current.errors.password?.message).toContain('8 caracteres');
  });
});
```

---

## 📊 Resumen

| Hook | Líneas | Dependencias | Tests | Uso Principal |
|------|--------|--------------|-------|---------------|
| useAuth | ~45 | authStore | 8 | Estado completo |
| useUser | ~30 | authStore | 5 | Usuario actual |
| useSession | ~60 | authStore | 6 | Validación sesión |
| useLogin | ~80 | authStore, react-hook-form, zod | 12 | Login form |
| useRegister | ~90 | authStore, react-hook-form, zod | 10 | Register form |

---

**Mantenedores:** @frontend-team, @auth-owner
**Última actualización:** 2025-11-07
**Documentos relacionados:** [README.md](./README.md), [AUTH-Store.md](./AUTH-Store.md), [AUTH-Components.md](./AUTH-Components.md)
