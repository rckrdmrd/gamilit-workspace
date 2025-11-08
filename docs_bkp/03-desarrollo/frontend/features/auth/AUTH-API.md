# AUTH - API Client

**Proyecto:** GAMILIT Platform
**Feature:** Authentication System
**Componente:** API Client Layer
**Versión:** 2.0
**Fecha:** 2025-11-07
**Ubicación:** `apps/frontend/src/features/auth/api/authApi.ts`

---

## 📋 Índice

1. [Propósito](#-propósito)
2. [Referencias](#-referencias-a-documentación-base)
3. [Arquitectura](#-arquitectura)
4. [Configuración Base](#-configuración-base)
5. [Métodos de API](#-métodos-de-api)
6. [Interceptores](#-interceptores)
7. [Error Handling](#-error-handling)
8. [Testing](#-testing)

---

## 🎯 Propósito

El **authApi** es el cliente de API que maneja todas las comunicaciones HTTP relacionadas con autenticación:
- Llamadas a endpoints de auth
- Gestión automática de tokens JWT
- Interceptores para refresh automático
- Manejo centralizado de errores
- Retry logic para requests fallidos

**Beneficios:**
- ✅ Separación de concerns (API vs lógica de negocio)
- ✅ Configuración centralizada de axios
- ✅ Type-safe con TypeScript
- ✅ Error handling consistente
- ✅ Refresh automático de tokens

---

## 📚 Referencias a Documentación Base

### Requerimientos
- **Casos de Uso:** [`docs/01-requerimientos/casos-uso/student/UC-STU-001-registro.md`](../../../../01-requerimientos/casos-uso/student/UC-STU-001-registro.md)
  - Flujo de registro e login

### Especificaciones Técnicas
- **API Reference:** [`docs/02-especificaciones-tecnicas/apis/api-reference/01-AUTH-API.md`](../../../../02-especificaciones-tecnicas/apis/api-reference/01-AUTH-API.md)
  - 15 endpoints de autenticación
  - Request/Response schemas
  - Rate limiting: 5 req/15min

- **Tipos Compartidos:** [`docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-AUTH.md`](../../../../02-especificaciones-tecnicas/tipos-compartidos/TYPES-AUTH.md)
  - LoginDto, RegisterDto, AuthResponse

- **Trazabilidad:** [`docs/02-especificaciones-tecnicas/trazabilidad/01-foundation-authentication.md`](../../../../02-especificaciones-tecnicas/trazabilidad/01-foundation-authentication.md)
  - Flujo Frontend → Backend

- **ADRs:** [`docs/02-especificaciones-tecnicas/adr/ADR-002-jwt-security-implementation.md`](../../../../02-especificaciones-tecnicas/adr/ADR-002-jwt-security-implementation.md)
  - JWT RS256 signing
  - Refresh token rotation

### Documentación Feature
- **Overview:** [README.md](./README.md#4-api-client)
- **Store:** [AUTH-Store.md](./AUTH-Store.md)
- **Hooks:** [AUTH-Hooks.md](./AUTH-Hooks.md)

---

## 🏗️ Arquitectura

### Estructura de Archivos

```
apps/frontend/src/features/auth/api/
├── authApi.ts          # Cliente principal de auth
├── sessionApi.ts       # API de sesiones
├── apiClient.ts        # Configuración base de axios
└── index.ts            # Exports públicos
```

### Flujo de Comunicación

```
Component → Hook → Store → authApi → axios → Backend
                                              ↓
Component ← Hook ← Store ← authApi ← axios ← Response
```

---

## ⚙️ Configuración Base

### API Client (axios)

```typescript
// apps/frontend/src/features/auth/api/apiClient.ts
import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Para httpOnly cookies
});

// Request interceptor: agregar token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: manejar 401 con refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si es 401 y no se ha reintentado
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshSession = useAuthStore.getState().refreshSession;
        await refreshSession();

        // Retry request original con nuevo token
        const newToken = useAuthStore.getState().accessToken;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Si el refresh falla, logout
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

**Configuración:**
- **Base URL:** Variable de entorno `VITE_API_URL`
- **Timeout:** 10 segundos
- **Credentials:** Incluye cookies httpOnly
- **Auto-refresh:** Maneja 401 automáticamente

---

## 📡 Métodos de API

### 1. login()

Autentica usuario con email y password.

```typescript
// apps/frontend/src/features/auth/api/authApi.ts
import { apiClient } from './apiClient';
import type { LoginDto, AuthResponse } from '@glit/shared-types';

export const authApi = {
  async login(credentials: LoginDto): Promise<AuthResponse> {
    const response = await apiClient.post<{ success: boolean; data: AuthResponse }>(
      '/api/auth/login',
      credentials
    );

    return response.data.data;
  },
};
```

**Endpoint:** `POST /api/auth/login`

**Request:**
```typescript
{
  email: 'estudiante@glit.com',
  password: 'SecurePass123'
}
```

**Response:**
```typescript
{
  user: {
    id: 'uuid',
    email: 'estudiante@glit.com',
    role: 'student',
    displayName: 'María G.'
  },
  token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  refreshToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
  expiresIn: '7d'
}
```

**Rate Limit:** 5 requests / 15 min

**Referencia:** [`01-AUTH-API.md`](../../../../02-especificaciones-tecnicas/apis/api-reference/01-AUTH-API.md#post-apiauthlogin)

---

### 2. register()

Registra un nuevo usuario.

```typescript
async register(userData: RegisterDto): Promise<AuthResponse> {
  const response = await apiClient.post<{ success: boolean; data: AuthResponse }>(
    '/api/auth/register',
    userData
  );

  return response.data.data;
}
```

**Endpoint:** `POST /api/auth/register`

**Request:**
```typescript
{
  email: 'nuevo@estudiante.com',
  password: 'SecurePass123',
  firstName: 'Juan',
  lastName: 'Pérez',
  role: 'student'
}
```

**Response:** Igual a `login()` (AuthResponse)

**Referencia:** [`01-AUTH-API.md`](../../../../02-especificaciones-tecnicas/apis/api-reference/01-AUTH-API.md#post-apiauthregister)

---

### 3. logout()

Cierra sesión e invalida tokens.

```typescript
async logout(refreshToken: string): Promise<void> {
  await apiClient.post('/api/auth/logout', { refreshToken });
}
```

**Endpoint:** `POST /api/auth/logout`

**Request:**
```typescript
{
  refreshToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...'
}
```

**Response:**
```typescript
{
  success: true,
  message: 'Sesión cerrada correctamente'
}
```

---

### 4. refresh()

Renueva access token usando refresh token.

```typescript
async refresh(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
  const response = await apiClient.post<{
    success: boolean;
    data: { token: string; refreshToken: string };
  }>('/api/auth/refresh', { refreshToken });

  return response.data.data;
}
```

**Endpoint:** `POST /api/auth/refresh`

**Request:**
```typescript
{
  refreshToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...'
}
```

**Response:**
```typescript
{
  token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',      // Nuevo access token
  refreshToken: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...' // Refresh token rotado
}
```

**Nota:** El refresh token se rota en cada uso (ADR-002).

---

### 5. me()

Obtiene información del usuario autenticado.

```typescript
async me(): Promise<User> {
  const response = await apiClient.get<{ success: boolean; data: { user: User } }>(
    '/api/auth/me'
  );

  return response.data.data.user;
}
```

**Endpoint:** `GET /api/auth/me`

**Headers:** `Authorization: Bearer <token>` (agregado automáticamente)

**Response:**
```typescript
{
  user: {
    id: 'uuid',
    email: 'estudiante@glit.com',
    fullName: 'Juan Pérez',
    role: 'student',
    avatarUrl: 'https://...'
  },
  stats: {
    mlCoins: 150,
    totalXP: 320,
    currentRank: 'batab'
  }
}
```

**Referencia:** [`01-AUTH-API.md`](../../../../02-especificaciones-tecnicas/apis/api-reference/01-AUTH-API.md#get-apiauthme)

---

### 6. updateProfile()

Actualiza perfil del usuario.

```typescript
async updateProfile(userData: Partial<User>): Promise<{ user: User }> {
  const response = await apiClient.put<{ success: boolean; data: { user: User } }>(
    '/api/auth/profile',
    userData
  );

  return response.data.data;
}
```

**Endpoint:** `PUT /api/auth/profile`

---

### 7. changePassword()

Cambia la contraseña del usuario autenticado.

```typescript
async changePassword(data: UpdatePasswordDto): Promise<void> {
  await apiClient.put('/api/auth/password', data);
}
```

**Endpoint:** `PUT /api/auth/password`

**Request:**
```typescript
{
  currentPassword: 'OldPass123',
  newPassword: 'NewSecurePass456'
}
```

---

### 8. forgotPassword()

Solicita recuperación de contraseña.

```typescript
async forgotPassword(email: string): Promise<void> {
  await apiClient.post('/api/auth/forgot-password', { email });
}
```

**Endpoint:** `POST /api/auth/forgot-password`

**Request:**
```typescript
{
  email: 'estudiante@glit.com'
}
```

**Response:**
```typescript
{
  success: true,
  message: 'Email de recuperación enviado'
}
```

---

### 9. resetPassword()

Restablece contraseña con token.

```typescript
async resetPassword(data: ResetPasswordDto): Promise<void> {
  await apiClient.post('/api/auth/reset-password', data);
}
```

**Endpoint:** `POST /api/auth/reset-password`

**Request:**
```typescript
{
  token: 'reset-token-from-email',
  newPassword: 'NewSecurePass456'
}
```

---

### 10. getSessions()

Obtiene sesiones activas del usuario.

```typescript
async getSessions(): Promise<SessionInfoDto[]> {
  const response = await apiClient.get<{ success: boolean; data: SessionInfoDto[] }>(
    '/api/auth/sessions'
  );

  return response.data.data;
}
```

**Endpoint:** `GET /api/auth/sessions`

**Response:**
```typescript
[
  {
    id: 'session-1',
    deviceType: 'Desktop',
    browser: 'Chrome 120',
    os: 'Windows 10',
    ipAddress: '192.168.1.1',
    location: 'Mérida, Yucatán',
    createdAt: '2025-11-07T10:00:00Z',
    lastActivity: '2025-11-07T15:30:00Z',
    isCurrent: true
  }
]
```

---

## 🔄 Interceptores

### Request Interceptor

Agrega token JWT automáticamente a cada request.

```typescript
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

**Beneficio:** No necesitas agregar manualmente el header Authorization en cada llamada.

---

### Response Interceptor

Maneja errores 401 con refresh automático.

```typescript
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh token
        await useAuthStore.getState().refreshSession();

        // Retry request original
        const newToken = useAuthStore.getState().accessToken;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Logout si falla refresh
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

**Flujo:**
1. Request falla con 401
2. Intenta refresh automático
3. Retry request original con nuevo token
4. Si refresh falla → logout automático

---

## ⚠️ Error Handling

### Tipos de Errores

```typescript
interface ApiError {
  message: string;
  code: string;
  statusCode: number;
  details?: unknown;
}
```

### Error Handler

```typescript
// apps/frontend/src/features/auth/api/errorHandler.ts
export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    return {
      message: error.response?.data?.message || 'Error de red',
      code: error.response?.data?.code || 'NETWORK_ERROR',
      statusCode: error.response?.status || 500,
      details: error.response?.data?.details,
    };
  }

  return {
    message: 'Error desconocido',
    code: 'UNKNOWN_ERROR',
    statusCode: 500,
  };
};
```

### Uso en Store

```typescript
login: async (credentials: LoginDto) => {
  try {
    const response = await authApi.login(credentials);
    // ...
  } catch (error) {
    const apiError = handleApiError(error);
    set({ error: apiError.message, isLoading: false });
    throw apiError;
  }
}
```

### Errores Comunes

| Status | Code | Descripción | Acción |
|--------|------|-------------|--------|
| 401 | INVALID_CREDENTIALS | Email/password incorrectos | Mostrar error en form |
| 401 | ACCOUNT_INACTIVE | Cuenta inactiva | Redirigir a verificación |
| 429 | RATE_LIMIT_EXCEEDED | Demasiados intentos | Mostrar cooldown |
| 500 | INTERNAL_ERROR | Error de servidor | Retry o contactar soporte |

---

## 🧪 Testing

### Mock de authApi

```typescript
// __tests__/authApi.test.ts
import { vi } from 'vitest';
import { authApi } from '../authApi';
import { apiClient } from '../apiClient';

vi.mock('../apiClient');

describe('authApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call login endpoint', async () => {
    const mockResponse = {
      data: {
        success: true,
        data: {
          user: { id: '1', email: 'test@example.com', role: 'student' },
          token: 'access-token',
          refreshToken: 'refresh-token',
        },
      },
    };

    vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

    const result = await authApi.login({
      email: 'test@example.com',
      password: 'pass',
    });

    expect(apiClient.post).toHaveBeenCalledWith('/api/auth/login', {
      email: 'test@example.com',
      password: 'pass',
    });

    expect(result.user.email).toBe('test@example.com');
    expect(result.token).toBe('access-token');
  });

  it('should handle login error', async () => {
    vi.mocked(apiClient.post).mockRejectedValue(
      new Error('Invalid credentials')
    );

    await expect(
      authApi.login({ email: 'test@example.com', password: 'wrong' })
    ).rejects.toThrow('Invalid credentials');
  });
});
```

### MSW (Mock Service Worker)

```typescript
// __tests__/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json();

    if (body.email === 'test@example.com' && body.password === 'pass') {
      return HttpResponse.json({
        success: true,
        data: {
          user: { id: '1', email: 'test@example.com', role: 'student' },
          token: 'mock-token',
          refreshToken: 'mock-refresh',
        },
      });
    }

    return HttpResponse.json(
      { success: false, message: 'Invalid credentials' },
      { status: 401 }
    );
  }),
];
```

---

## 📊 Resumen

| Método | Endpoint | Autenticación | Rate Limit |
|--------|----------|---------------|------------|
| login | POST /api/auth/login | No | 5/15min |
| register | POST /api/auth/register | No | 5/15min |
| logout | POST /api/auth/logout | Sí | - |
| refresh | POST /api/auth/refresh | No | - |
| me | GET /api/auth/me | Sí | - |
| updateProfile | PUT /api/auth/profile | Sí | - |
| changePassword | PUT /api/auth/password | Sí | - |
| forgotPassword | POST /api/auth/forgot-password | No | 5/15min |
| resetPassword | POST /api/auth/reset-password | No | - |
| getSessions | GET /api/auth/sessions | Sí | - |

**Total:** 10 métodos documentados

---

**Mantenedores:** @frontend-team, @auth-owner
**Última actualización:** 2025-11-07
**Documentos relacionados:** [README.md](./README.md), [AUTH-Store.md](./AUTH-Store.md), [AUTH-Hooks.md](./AUTH-Hooks.md)
