# Arquitectura de API Clients - Frontend

**Versión:** 1.0.0
**Fecha:** 2025-11-23
**Proyecto:** GAMILIT - Sistema de Gamificación Educativa
**Mantenido por:** Frontend Team

---

## 📋 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Estructura General](#estructura-general)
3. [Cliente Base Axios](#cliente-base-axios)
4. [Módulos API Específicos](#módulos-api-específicos)
5. [Uso en Hooks y Componentes](#uso-en-hooks-y-componentes)
6. [Convenciones de Rutas](#convenciones-de-rutas)
7. [Ejemplos Completos](#ejemplos-completos)
8. [Mejores Prácticas](#mejores-prácticas)
9. [Anti-Patrones](#anti-patrones)
10. [Testing](#testing)

---

## 🎯 Introducción

Este documento describe la arquitectura de API clients en el frontend de GAMILIT. Define cómo estructurar, implementar y usar clientes API para comunicarse con el backend.

### Objetivos

- ✅ **Centralización:** Rutas API definidas en un solo lugar
- ✅ **Type Safety:** Uso completo de TypeScript types
- ✅ **Mantenibilidad:** Fácil de actualizar cuando el backend cambia
- ✅ **Consistencia:** Patrón único en toda la aplicación
- ✅ **Testability:** Fácil de mockear y testear

### Audiencia

- Desarrolladores frontend de GAMILIT
- Tech leads revisando PRs
- Nuevos miembros del equipo

---

## 🏗️ Estructura General

```
apps/frontend/src/
├── services/
│   └── api/
│       ├── apiClient.ts           # ⭐ Cliente Axios base
│       ├── apiConfig.ts           # Configuraciones
│       ├── apiErrorHandler.ts     # Manejo de errores
│       ├── apiInterceptors.ts     # Interceptors adicionales
│       └── apiTypes.ts            # Types comunes
│
├── services/api/
│   ├── gamification/
│   │   └── gamificationAPI.ts     # 🔵 Módulo API: Gamificación
│   ├── progress/
│   │   └── progressAPI.ts         # 🔵 Módulo API: Progreso
│   └── ...
│
└── features/
    └── auth/api/
        └── authAPI.ts             # 🔵 Módulo API: Autenticación
```

### División de Responsabilidades

| Capa | Responsabilidad | Ejemplo |
|------|----------------|---------|
| **services/api/apiClient.ts** | Cliente Axios base, interceptors, config | `apiClient.get()` |
| **services/api/{domain}/{domain}API.ts** | Métodos API por dominio | `gamificationApi.getUserStats()` |
| **hooks/** | Lógica de UI + state management | `useUserGamification()` |
| **components/** | Presentación de datos | `<GamifiedHeader />` |

---

## ⚙️ Cliente Base Axios

### Ubicación
`apps/frontend/src/services/api/apiClient.ts`

### Responsabilidad

El cliente base Axios es la **única instancia de Axios** configurada globalmente. Proporciona:

- ✅ BaseURL configurado (`/api`)
- ✅ Timeout global (30s)
- ✅ Headers por defecto (`Content-Type: application/json`)
- ✅ Interceptor de request (auth token, tenant-id)
- ✅ Interceptor de response (refresh token, manejo de errores)
- ✅ Funciones utilitarias (setAuthToken, clearAuthTokens, isAuthenticated)

### Configuración

```typescript
// apps/frontend/src/services/api/apiClient.ts
import axios, { AxiosInstance } from 'axios';

/**
 * API Base URL from environment
 * Default: http://localhost:3006/api
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3006/api';

/**
 * Base Axios instance
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,     // http://localhost:3006/api
  timeout: 30000,             // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Request Interceptor

```typescript
apiClient.interceptors.request.use(
  (config) => {
    // Add JWT token from localStorage
    const token = localStorage.getItem('auth-token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add tenant-id header
    const tenantId = localStorage.getItem('tenant-id');
    if (tenantId && config.headers) {
      config.headers['X-Tenant-Id'] = tenantId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
```

### Response Interceptor

```typescript
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 - Token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh-token');
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        localStorage.setItem('auth-token', data.token);
        originalRequest.headers.Authorization = `Bearer ${data.token}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

### Utility Functions

```typescript
/**
 * Set authentication token
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem('auth-token', token);
};

/**
 * Clear authentication tokens
 */
export const clearAuthTokens = (): void => {
  localStorage.removeItem('auth-token');
  localStorage.removeItem('refresh-token');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('auth-token');
};

export default apiClient;
```

---

## 🔵 Módulos API Específicos

### Ubicación
`apps/frontend/src/services/api/` (por dominio) y `apps/frontend/src/features/*/api/` (por feature)

### Responsabilidad

Los módulos API específicos definen métodos para cada dominio del backend:

- **features/auth/api/authAPI.ts** → Autenticación (login, register, logout, profile)
- **services/api/gamification/gamificationAPI.ts** → Gamificación (stats, achievements, leaderboard, ML coins)
- **services/api/progress/progressAPI.ts** → Progreso (módulos, sesiones, intentos, actividades)
- **services/api/educationalAPI.ts** → Contenido educativo (módulos, ejercicios)

### Patrón de Implementación

```typescript
// apps/frontend/src/services/api/gamification/gamificationAPI.ts
import apiClient from '@/services/api/apiClient';
import type {
  UserStats,
  Achievement,
  LeaderboardResponse,
} from '@/shared/types';

/**
 * Gamification API Client
 * Provides methods to interact with gamification backend module
 */
export const gamificationApi = {
  /**
   * Get user statistics
   * @param userId - User ID
   * @returns User stats including XP, level, streak, etc.
   */
  getUserStats: async (userId: string): Promise<UserStats> => {
    const { data } = await apiClient.get<UserStats>(
      `/gamification/users/${userId}/stats`
    );
    return data;
  },

  /**
   * Get user achievements
   * @param userId - User ID
   * @returns List of user achievements with progress
   */
  getUserAchievements: async (userId: string): Promise<Achievement[]> => {
    const { data } = await apiClient.get<Achievement[]>(
      `/gamification/users/${userId}/achievements`
    );
    return data;
  },

  /**
   * Get global leaderboard
   * @param limit - Number of entries (default: 100)
   * @param offset - Pagination offset (default: 0)
   * @returns Leaderboard with top users
   */
  getGlobalLeaderboard: async (
    limit: number = 100,
    offset: number = 0
  ): Promise<LeaderboardResponse> => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    const { data } = await apiClient.get<LeaderboardResponse>(
      `/gamification/leaderboard/global?${params.toString()}`
    );
    return data;
  },
};

export default gamificationApi;
```

### Convenciones

1. **Nombre del módulo:** `{dominio}Api` (camelCase)
2. **Nombre del archivo:** `{dominio}API.ts` (camelCase con API suffix)
3. **Export named + default:** Ambos exports disponibles
4. **JSDoc comments:** Documentar cada método
5. **TypeScript types:** Tipado completo en params y returns
6. **Rutas relativas:** Sin `/api` (ya está en baseURL)

---

## 🎨 Uso en Hooks y Componentes

### ✅ CORRECTO: Usar Módulos API

```typescript
// apps/frontend/src/hooks/useUserGamification.ts
import { useState, useEffect } from 'react';
import { gamificationApi } from '@/services/api/gamification/gamificationAPI';
import type { UserStats, Achievement } from '@/shared/types';

export function useUserGamification(userId: string) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // ✅ Usa métodos del API module
        const [statsData, achievementsData] = await Promise.all([
          gamificationApi.getUserStats(userId),
          gamificationApi.getUserAchievements(userId),
        ]);

        setStats(statsData);
        setAchievements(achievementsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  return { stats, achievements, loading, error };
}
```

### ❌ INCORRECTO: Hard-coding de Rutas

```typescript
// ❌ NO HAGAS ESTO
import { apiClient } from '@/services/api/apiClient';

export function useUserGamification(userId: string) {
  const fetchData = async () => {
    // ❌ Hard-coded routes
    const statsResponse = await apiClient.get(`/gamification/users/${userId}/stats`);
    const achievementsResponse = await apiClient.get(`/gamification/users/${userId}/achievements`);

    const stats = statsResponse.data;
    const achievements = achievementsResponse.data;
  };
}
```

**Problemas:**
- ❌ Rutas hard-coded (difícil de mantener)
- ❌ Duplicación de rutas en múltiples hooks
- ❌ Sin TypeScript types en respuestas
- ❌ Propenso a errores de tipeo

---

## 🛣️ Convenciones de Rutas

### Regla Principal

**Las rutas frontend deben coincidir EXACTAMENTE con las expuestas por el backend.**

### Backend Configuration

```typescript
// apps/backend/src/main.ts
app.setGlobalPrefix('api');  // Global prefix: /api

// apps/backend/src/modules/gamification/controllers/user-stats.controller.ts
@Controller('gamification')  // Controller base: gamification
@Get('users/:userId/stats')  // Route method: users/:userId/stats

// Ruta completa backend: /api/gamification/users/:userId/stats
```

### Frontend Configuration

```typescript
// apps/frontend/src/services/api/apiClient.ts
const API_BASE_URL = 'http://localhost:3006/api';  // baseURL incluye /api

// apps/frontend/src/services/api/gamification/gamificationAPI.ts
apiClient.get(`/gamification/users/${userId}/stats`)
//           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//           Ruta sin /api (ya está en baseURL)

// Ruta completa llamada: http://localhost:3006/api/gamification/users/:userId/stats ✅
```

### ⚠️ IMPORTANTE: NO agregar `/v1/`

```typescript
// ❌ INCORRECTO - con /v1/
apiClient.get(`/v1/gamification/users/${userId}/stats`)
// Llamará a: http://localhost:3006/api/v1/gamification/users/:userId/stats
// Backend no tiene /v1/ en global prefix → 404 Error

// ✅ CORRECTO - sin /v1/
apiClient.get(`/gamification/users/${userId}/stats`)
// Llamará a: http://localhost:3006/api/gamification/users/:userId/stats
// Backend: /api + /gamification + /users/:userId/stats → Match ✅
```

### Mapeo Frontend ↔ Backend

| Frontend Route | Backend Route | Match |
|----------------|---------------|-------|
| `/auth/login` | `/api/auth/login` | ✅ |
| `/gamification/users/:id/stats` | `/api/gamification/users/:id/stats` | ✅ |
| `/progress/users/:id` | `/api/progress/users/:id` | ✅ |
| `/educational/modules` | `/api/educational/modules` | ✅ |

---

## 💡 Ejemplos Completos

### Ejemplo 1: Auth API Module

```typescript
// apps/frontend/src/features/auth/api/authAPI.ts
import apiClient from '@/services/api/apiClient';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials);
    if (data.accessToken) {
      localStorage.setItem('auth-token', data.accessToken);
    }
    return data;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem('auth-token');
      localStorage.removeItem('refresh-token');
    }
  },

  getProfile: async (): Promise<AuthResponse['user']> => {
    const { data } = await apiClient.get('/auth/profile');
    return data;
  },
};

export default authApi;
```

### Ejemplo 2: Hook usando Auth API

```typescript
// apps/frontend/src/hooks/useAuth.ts
import { useState } from 'react';
import { authApi, LoginCredentials, AuthResponse } from '@/features/auth/api/authAPI';

export function useAuth() {
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);

      const response = await authApi.login(credentials);  // ✅ Usa authApi
      setUser(response.user);

      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();  // ✅ Usa authApi
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return { user, login, logout, loading, error };
}
```

---

## ✅ Mejores Prácticas

### 1. Type Safety

```typescript
// ✅ BIEN: TypeScript types en params y returns
getUserStats: async (userId: string): Promise<UserStats> => {
  const { data } = await apiClient.get<UserStats>(`/gamification/users/${userId}/stats`);
  return data;
}

// ❌ MAL: Sin types
getUserStats: async (userId) => {
  const { data } = await apiClient.get(`/gamification/users/${userId}/stats`);
  return data;
}
```

### 2. Error Handling

```typescript
// ✅ BIEN: Error handling en hook, no en API module
export function useUserStats(userId: string) {
  try {
    const stats = await gamificationApi.getUserStats(userId);
    setStats(stats);
  } catch (error) {
    // Handle error en el hook
    setError(error.message);
    // Log, toast notification, etc.
  }
}

// ❌ MAL: Error handling en API module
getUserStats: async (userId: string) => {
  try {
    const { data } = await apiClient.get(`...`);
    return data;
  } catch (error) {
    // ❌ No manejar errores aquí
    console.error(error);
  }
}
```

### 3. Query Parameters

```typescript
// ✅ BIEN: URLSearchParams para query strings
getLeaderboard: async (limit: number, offset: number) => {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });

  const { data } = await apiClient.get(`/gamification/leaderboard?${params.toString()}`);
  return data;
}

// ❌ MAL: String concatenation
getLeaderboard: async (limit: number, offset: number) => {
  const { data } = await apiClient.get(`/gamification/leaderboard?limit=${limit}&offset=${offset}`);
  return data;
}
```

### 4. Documentación

```typescript
// ✅ BIEN: JSDoc completo
/**
 * Get user statistics
 *
 * @param userId - User ID (UUID format)
 * @returns User stats including XP, level, streak, etc.
 * @throws {AxiosError} If user not found or unauthorized
 *
 * @example
 * const stats = await gamificationApi.getUserStats('550e8400-...');
 */
getUserStats: async (userId: string): Promise<UserStats> => {
  // ...
}
```

---

## 🚫 Anti-Patrones

### ❌ 1. Hard-coding de Rutas en Hooks

```typescript
// ❌ NO HAGAS ESTO
const { data } = await apiClient.get(`/gamification/users/${userId}/stats`);
```

**Por qué es malo:**
- Rutas duplicadas en múltiples lugares
- Difícil de actualizar si backend cambia
- Sin TypeScript types

**Solución:**
```typescript
// ✅ HAZ ESTO
const stats = await gamificationApi.getUserStats(userId);
```

---

### ❌ 2. Múltiples Instancias de Axios

```typescript
// ❌ NO HAGAS ESTO
import axios from 'axios';

const customClient = axios.create({ baseURL: 'http://localhost:3006/api' });
const data = await customClient.get('/gamification/users/.../stats');
```

**Por qué es malo:**
- No usa interceptors configurados
- No tiene manejo de refresh token
- Inconsistente con el resto de la app

**Solución:**
```typescript
// ✅ HAZ ESTO
import apiClient from '@/services/api/apiClient';

const { data } = await apiClient.get('/gamification/users/.../stats');
```

---

### ❌ 3. Agregar `/v1/` a las Rutas

```typescript
// ❌ NO HAGAS ESTO
apiClient.get(`/v1/gamification/users/${userId}/stats`);
```

**Por qué es malo:**
- Backend NO tiene `/v1/` en global prefix
- Resulta en 404 errors

**Solución:**
```typescript
// ✅ HAZ ESTO
apiClient.get(`/gamification/users/${userId}/stats`);
```

---

### ❌ 4. No Usar Types de TypeScript

```typescript
// ❌ NO HAGAS ESTO
const getUserStats = async (userId: string) => {
  const { data } = await apiClient.get(`/gamification/users/${userId}/stats`);
  return data;  // data es `any`
}
```

**Por qué es malo:**
- Pierde type safety
- No hay IntelliSense
- Errores en runtime

**Solución:**
```typescript
// ✅ HAZ ESTO
const getUserStats = async (userId: string): Promise<UserStats> => {
  const { data } = await apiClient.get<UserStats>(`/gamification/users/${userId}/stats`);
  return data;  // data es `UserStats`
}
```

---

## 🧪 Testing

### Mockear Módulos API

```typescript
// apps/frontend/src/services/api/gamification/__mocks__/gamificationAPI.ts
export const gamificationApi = {
  getUserStats: jest.fn().mockResolvedValue({
    user_id: 'test-user-id',
    level: 5,
    total_xp: 500,
    ml_coins: 1000,
    current_rank: 'Nacom',
  }),

  getUserAchievements: jest.fn().mockResolvedValue([
    {
      id: 'ach-1',
      name: 'First Step',
      unlocked: true,
    },
  ]),
};

export default gamificationApi;
```

### Test de Hook

```typescript
// apps/frontend/src/hooks/__tests__/useUserGamification.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useUserGamification } from '../useUserGamification';

// Mock el módulo API
jest.mock('@/services/api/gamification/gamificationAPI');

describe('useUserGamification', () => {
  it('should fetch user stats and achievements', async () => {
    const { result } = renderHook(() => useUserGamification('test-user-id'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.stats).toEqual({
      user_id: 'test-user-id',
      level: 5,
      total_xp: 500,
      ml_coins: 1000,
      current_rank: 'Nacom',
    });

    expect(result.current.achievements).toHaveLength(1);
  });
});
```

---

## 📚 Referencias

- [ADR-011: Frontend API Client Structure](../../../90-adr/ADR-011-frontend-api-client-structure.md)
- [Backend API Routes Constants](../../../../apps/backend/src/shared/constants/routes.constants.ts)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

**Versión:** 1.0.0
**Última actualización:** 2025-11-23
**Mantenido por:** Frontend Team
**Proyecto:** GAMILIT
