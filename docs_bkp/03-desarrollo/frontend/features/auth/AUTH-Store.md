# AUTH - Zustand Store

**Proyecto:** GAMILIT Platform
**Feature:** Authentication System
**Componente:** Zustand Global State Store
**Versión:** 2.0
**Fecha:** 2025-11-07
**Ubicación:** `apps/frontend/src/features/auth/store/authStore.ts`

---

## 📋 Índice

1. [Propósito](#-propósito)
2. [Referencias](#-referencias-a-documentación-base)
3. [Estructura del Store](#-estructura-del-store)
4. [Estado (State)](#-estado-state)
5. [Acciones (Actions)](#-acciones-actions)
6. [Persistencia](#-persistencia)
7. [Selectors](#-selectors)
8. [Integración](#-integración)
9. [Testing](#-testing)

---

## 🎯 Propósito

El **authStore** es el store global de Zustand que maneja todo el estado de autenticación de la aplicación:
- Usuario autenticado actual
- Tokens JWT (access y refresh)
- Estado de carga y errores
- Sesión activa y expiración
- Operaciones de login, logout, registro

**Beneficios:**
- ✅ Estado global centralizado
- ✅ Persistencia automática en localStorage
- ✅ Type-safe con TypeScript
- ✅ Minimal boilerplate comparado con Redux
- ✅ DevTools integration

---

## 📚 Referencias a Documentación Base

### Requerimientos
- **Casos de Uso:** [`docs/01-requerimientos/casos-uso/student/UC-STU-001-registro.md`](../../../../01-requerimientos/casos-uso/student/UC-STU-001-registro.md)
  - Registro de estudiante con login automático
  - Flujo de autenticación completo

### Especificaciones Técnicas
- **Tipos Compartidos:** [`docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-AUTH.md`](../../../../02-especificaciones-tecnicas/tipos-compartidos/TYPES-AUTH.md)
  - AuthResponse, LoginDto, RegisterDto
  - Tipos User, UserRole, UserStatus

- **Trazabilidad:** [`docs/02-especificaciones-tecnicas/trazabilidad/01-foundation-authentication.md`](../../../../02-especificaciones-tecnicas/trazabilidad/01-foundation-authentication.md)
  - Flujo completo de autenticación
  - Ejemplo de implementación del store

- **ADRs:** [`docs/02-especificaciones-tecnicas/adr/ADR-002-jwt-security-implementation.md`](../../../../02-especificaciones-tecnicas/adr/ADR-002-jwt-security-implementation.md)
  - Gestión de tokens JWT
  - Refresh token rotation

### Documentación Feature
- **Overview:** [README.md](./README.md#1-authstore-zustand)
- **API Client:** [AUTH-API.md](./AUTH-API.md)
- **Hooks:** [AUTH-Hooks.md](./AUTH-Hooks.md)

---

## 🏗️ Estructura del Store

### Archivo Principal

```typescript
// apps/frontend/src/features/auth/store/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { authApi } from '../api/authApi';
import type { User, AuthResponse, LoginDto, RegisterDto } from '@glit/shared-types';

interface AuthState {
  // Estado
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionExpiresAt: number | null;

  // Acciones
  login: (credentials: LoginDto) => Promise<void>;
  register: (userData: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
  checkSession: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        // Estado inicial
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        sessionExpiresAt: null,

        // Implementación de acciones...
        // (Ver secciones siguientes)
      }),
      {
        name: 'auth-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          user: state.user,
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
          sessionExpiresAt: state.sessionExpiresAt,
        }),
      }
    ),
    { name: 'AuthStore' }
  )
);
```

---

## 🗄️ Estado (State)

### Propiedades del Estado

| Propiedad | Tipo | Descripción | Default |
|-----------|------|-------------|---------|
| `user` | `User \| null` | Usuario autenticado actual | `null` |
| `accessToken` | `string \| null` | JWT access token (7 días) | `null` |
| `refreshToken` | `string \| null` | JWT refresh token (30 días) | `null` |
| `isAuthenticated` | `boolean` | Si el usuario está autenticado | `false` |
| `isLoading` | `boolean` | Cargando operación de auth | `false` |
| `error` | `string \| null` | Mensaje de error actual | `null` |
| `sessionExpiresAt` | `number \| null` | Timestamp de expiración | `null` |

### Tipo User

```typescript
// Referencia: TYPES-AUTH.md
interface User {
  id: string;              // UUID del usuario
  email: string;           // Email validado
  role: UserRole;          // 'student' | 'admin_teacher' | 'admin_platform'
  firstName?: string;      // Nombre
  lastName?: string;       // Apellido
  displayName?: string;    // Nombre a mostrar
  avatarUrl?: string;      // URL del avatar
  status: UserStatus;      // 'active' | 'inactive' | 'suspended'
}
```

**Referencia:** [`TYPES-AUTH.md`](../../../../02-especificaciones-tecnicas/tipos-compartidos/TYPES-AUTH.md#623-authresponse)

---

## ⚡ Acciones (Actions)

### 1. login()

Autentica un usuario con email y password.

```typescript
login: async (credentials: LoginDto) => {
  set({ isLoading: true, error: null });

  try {
    const response = await authApi.login(credentials);

    set({
      user: response.user,
      accessToken: response.token,
      refreshToken: response.refreshToken,
      isAuthenticated: true,
      sessionExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 días
      isLoading: false,
    });
  } catch (error) {
    set({
      error: error instanceof Error ? error.message : 'Error al iniciar sesión',
      isLoading: false,
    });
    throw error;
  }
}
```

**Uso:**
```typescript
import { useAuthStore } from '@/features/auth/store';

const LoginPage = () => {
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

  const handleLogin = async () => {
    try {
      await login({ email: 'user@example.com', password: 'SecurePass123' });
      // Redirigir a dashboard
    } catch (error) {
      // Manejar error
    }
  };
};
```

**Backend Integration:**
- **Endpoint:** `POST /api/auth/login`
- **Request:** `{ email: string, password: string }`
- **Response:** `AuthResponse` con user, token, refreshToken

**Referencia:** [`01-AUTH-API.md`](../../../../02-especificaciones-tecnicas/apis/api-reference/01-AUTH-API.md#1-post-authlogin)

---

### 2. register()

Registra un nuevo usuario y autentica automáticamente.

```typescript
register: async (userData: RegisterDto) => {
  set({ isLoading: true, error: null });

  try {
    const response = await authApi.register(userData);

    // Auto-login después del registro
    set({
      user: response.user,
      accessToken: response.token,
      refreshToken: response.refreshToken,
      isAuthenticated: true,
      sessionExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      isLoading: false,
    });
  } catch (error) {
    set({
      error: error instanceof Error ? error.message : 'Error al registrarse',
      isLoading: false,
    });
    throw error;
  }
}
```

**Uso:**
```typescript
const RegisterPage = () => {
  const register = useAuthStore((state) => state.register);

  const handleRegister = async (data: RegisterDto) => {
    await register(data);
    // Usuario queda autenticado automáticamente
    // Redirigir a onboarding
  };
};
```

**Backend Integration:**
- **Endpoint:** `POST /api/auth/register`
- **Request:** `RegisterDto`
- **Response:** `AuthResponse` (igual que login)

---

### 3. logout()

Cierra la sesión del usuario.

```typescript
logout: async () => {
  set({ isLoading: true });

  try {
    const { refreshToken } = get();

    if (refreshToken) {
      // Invalidar tokens en backend
      await authApi.logout(refreshToken);
    }

    // Limpiar estado
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      sessionExpiresAt: null,
      isLoading: false,
      error: null,
    });
  } catch (error) {
    // Limpiar estado incluso si falla la llamada al backend
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      sessionExpiresAt: null,
      isLoading: false,
      error: null,
    });
  }
}
```

**Uso:**
```typescript
const Header = () => {
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    // Redirigir a login
  };
};
```

**Backend Integration:**
- **Endpoint:** `POST /api/auth/logout`
- **Request:** `{ refreshToken: string }`
- **Response:** `{ success: true }`

---

### 4. refreshSession()

Renueva el access token usando el refresh token.

```typescript
refreshSession: async () => {
  const { refreshToken } = get();

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await authApi.refresh(refreshToken);

    set({
      accessToken: response.token,
      refreshToken: response.refreshToken, // Token rotado
      sessionExpiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });
  } catch (error) {
    // Si falla el refresh, logout automático
    await get().logout();
    throw error;
  }
}
```

**Uso:** Esta acción normalmente es llamada automáticamente por el interceptor de axios cuando detecta un 401.

```typescript
// En el interceptor de axios
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshSession = useAuthStore.getState().refreshSession;
      await refreshSession();
      // Retry request original
    }
    return Promise.reject(error);
  }
);
```

**Backend Integration:**
- **Endpoint:** `POST /api/auth/refresh`
- **Request:** `{ refreshToken: string }`
- **Response:** `{ token: string, refreshToken: string }`

**Referencia:** [`ADR-002`](../../../../02-especificaciones-tecnicas/adr/ADR-002-jwt-security-implementation.md) - Refresh token rotation

---

### 5. updateUser()

Actualiza los datos del usuario autenticado.

```typescript
updateUser: async (userData: Partial<User>) => {
  set({ isLoading: true, error: null });

  try {
    const response = await authApi.updateProfile(userData);

    set({
      user: response.user,
      isLoading: false,
    });
  } catch (error) {
    set({
      error: error instanceof Error ? error.message : 'Error al actualizar perfil',
      isLoading: false,
    });
    throw error;
  }
}
```

---

### 6. clearError()

Limpia el mensaje de error actual.

```typescript
clearError: () => {
  set({ error: null });
}
```

---

### 7. checkSession()

Verifica si la sesión actual es válida.

```typescript
checkSession: () => {
  const { isAuthenticated, sessionExpiresAt } = get();

  if (!isAuthenticated || !sessionExpiresAt) {
    return false;
  }

  const isExpired = Date.now() > sessionExpiresAt;

  if (isExpired) {
    get().logout();
    return false;
  }

  return true;
}
```

---

## 💾 Persistencia

### Configuración

El store usa `zustand/persist` middleware para persistir estado en `localStorage`.

```typescript
persist(
  (set, get) => ({ /* store */ }),
  {
    name: 'auth-storage',           // Key en localStorage
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({       // Solo persistir estos campos
      user: state.user,
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
      isAuthenticated: state.isAuthenticated,
      sessionExpiresAt: state.sessionExpiresAt,
    }),
  }
)
```

### Datos Persistidos

```json
{
  "user": {
    "id": "user-123",
    "email": "estudiante@glit.com",
    "role": "student",
    "displayName": "María G."
  },
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "isAuthenticated": true,
  "sessionExpiresAt": 1730000000000
}
```

**Nota:** Los campos `isLoading` y `error` NO se persisten (son estado transitorio).

---

## 🎯 Selectors

### Selectors Básicos

```typescript
// Usar campos individuales
const user = useAuthStore((state) => state.user);
const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
const isLoading = useAuthStore((state) => state.isLoading);

// Usar acciones
const login = useAuthStore((state) => state.login);
const logout = useAuthStore((state) => state.logout);
```

### Selectors Computados

```typescript
// Verificar si es estudiante
const isStudent = useAuthStore((state) => state.user?.role === 'student');

// Verificar si es admin
const isAdmin = useAuthStore((state) =>
  state.user?.role === 'admin_teacher' || state.user?.role === 'admin_platform'
);

// Obtener nombre completo
const fullName = useAuthStore((state) =>
  state.user ? `${state.user.firstName} ${state.user.lastName}` : ''
);
```

### Usar fuera de componentes React

```typescript
// Obtener estado actual
const currentUser = useAuthStore.getState().user;
const isAuth = useAuthStore.getState().isAuthenticated;

// Ejecutar acciones
await useAuthStore.getState().login(credentials);
await useAuthStore.getState().logout();
```

---

## 🔗 Integración

### Con AuthProvider

```typescript
// apps/frontend/src/features/auth/providers/AuthProvider.tsx
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const checkSession = useAuthStore((state) => state.checkSession);
  const refreshSession = useAuthStore((state) => state.refreshSession);

  useEffect(() => {
    // Verificar sesión al montar
    const isValid = checkSession();

    if (isValid) {
      // Programar refresh antes de expiración
      const refreshInterval = setInterval(async () => {
        await refreshSession();
      }, 6 * 24 * 60 * 60 * 1000); // 6 días

      return () => clearInterval(refreshInterval);
    }
  }, []);

  return <>{children}</>;
};
```

### Con ProtectedRoute

```typescript
// apps/frontend/src/shared/components/ProtectedRoute.tsx
export const ProtectedRoute = ({ children, requiredRole }: Props) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const checkSession = useAuthStore((state) => state.checkSession);

  const isValid = checkSession();

  if (!isValid || !isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
};
```

---

## 🧪 Testing

### Test del Store

```typescript
// __tests__/authStore.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '../authStore';
import { authApi } from '../../api/authApi';

vi.mock('../../api/authApi');

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it('should login successfully', async () => {
    const mockResponse = {
      user: { id: '1', email: 'test@example.com', role: 'student' },
      token: 'access-token',
      refreshToken: 'refresh-token',
    };

    vi.mocked(authApi.login).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'pass' });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(mockResponse.user);
    expect(result.current.accessToken).toBe('access-token');
  });

  it('should handle login error', async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useAuthStore());

    await act(async () => {
      try {
        await result.current.login({ email: 'test@example.com', password: 'wrong' });
      } catch (error) {
        // Expected error
      }
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe('Invalid credentials');
  });
});
```

---

## 📊 Métricas

| Métrica | Valor |
|---------|-------|
| Propiedades de estado | 7 |
| Acciones | 7 |
| Middleware | 2 (persist, devtools) |
| Persistencia | localStorage |
| Tests | 15 |
| Cobertura | 85% |

---

**Mantenedores:** @frontend-team, @auth-owner
**Última actualización:** 2025-11-07
**Documentos relacionados:** [README.md](./README.md), [AUTH-Hooks.md](./AUTH-Hooks.md), [AUTH-API.md](./AUTH-API.md)
