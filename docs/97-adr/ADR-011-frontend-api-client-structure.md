# ADR-011: Estructura de API Clients en Frontend

**Estado:** Aceptado
**Fecha:** 2025-11-23
**Autor:** Architecture-Analyst
**Relacionado con:** BUG-FRONTEND-001, BUG-FRONTEND-002, Frontend API Architecture

---

## Contexto

El frontend de GAMILIT necesita comunicarse con el backend a través de APIs REST. Hemos identificado varios problemas relacionados con la estructura y uso de API clients:

1. **BUG-FRONTEND-001:** Imports rotos causaron caída completa del frontend
2. **BUG-FRONTEND-002:** Rutas hard-coded con `/v1/` incorrectas causaron errores 404
3. **Inconsistencia:** Diferentes formas de llamar a las mismas APIs (hooks vs API modules)
4. **Falta de documentación:** No existía guía clara sobre cómo estructurar y usar API clients

### Problemas Identificados

- Hard-coding de rutas en hooks (anti-patrón)
- Rutas duplicadas y inconsistentes
- Imports rotos por refactorizaciones incompletas
- No hay single source of truth para rutas

---

## Decisión

Adoptamos la siguiente estructura de API clients para el frontend:

### 1. Cliente Base Axios (`services/api/apiClient.ts`)

**Responsabilidad:** Instancia base de Axios con configuración global

**Ubicación:** `apps/frontend/src/services/api/apiClient.ts`

**Contenido:**
- Instancia de Axios configurada con baseURL, timeout, headers
- Interceptors de request (auth token, tenant-id)
- Interceptors de response (refresh token, manejo de errores)
- Funciones utilitarias (setAuthToken, clearAuthTokens, isAuthenticated)

**Export:** `export default apiClient`

**Ejemplo:**
```typescript
// apps/frontend/src/services/api/apiClient.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3006/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors...
export default apiClient;
```

---

### 2. Módulos API Específicos (`lib/api/*.api.ts`)

**Responsabilidad:** Definir métodos de API por dominio/módulo

**Ubicación:** `apps/frontend/src/lib/api/`

**Estructura:**
```
apps/frontend/src/lib/api/
├── auth.api.ts          # Autenticación (login, register, logout, profile)
├── gamification.api.ts  # Gamificación (stats, achievements, leaderboard, ML coins)
├── progress.api.ts      # Progreso (módulos, sesiones, intentos, actividades)
├── educational.api.ts   # Contenido educativo (módulos, ejercicios, búsqueda)
└── index.ts             # Re-exportación de todos los APIs
```

**Patrón de implementación:**
```typescript
// apps/frontend/src/lib/api/gamification.api.ts
import apiClient from '@/services/api/apiClient';
import type { UserStats, Achievement } from '@/shared/types';

export const gamificationApi = {
  getUserStats: async (userId: string): Promise<UserStats> => {
    const { data } = await apiClient.get<UserStats>(`/gamification/users/${userId}/stats`);
    return data;
  },

  getUserAchievements: async (userId: string): Promise<Achievement[]> => {
    const { data } = await apiClient.get<Achievement[]>(`/gamification/users/${userId}/achievements`);
    return data;
  },
};

export default gamificationApi;
```

---

### 3. Uso en Hooks y Componentes

**Regla:** Hooks y componentes DEBEN usar módulos API, NO hacer llamadas directas con `apiClient`.

**✅ CORRECTO:**
```typescript
// apps/frontend/src/hooks/useUserGamification.ts
import { gamificationApi } from '@/lib/api/gamification.api';

export function useUserGamification(userId: string) {
  const fetchData = async () => {
    const [stats, achievements] = await Promise.all([
      gamificationApi.getUserStats(userId),          // ✅ Usa API module
      gamificationApi.getUserAchievements(userId)    // ✅ Usa API module
    ]);
  };
}
```

**❌ INCORRECTO:**
```typescript
// ❌ Hard-coding de rutas en hooks
import { apiClient } from '@/services/api/apiClient';

export function useUserGamification(userId: string) {
  const fetchData = async () => {
    const statsResponse = await apiClient.get(`/gamification/users/${userId}/stats`); // ❌
    const achievementsResponse = await apiClient.get(`/gamification/users/${userId}/achievements`); // ❌
  };
}
```

---

### 4. Estructura de Rutas

**Regla:** Las rutas deben coincidir EXACTAMENTE con las expuestas por el backend.

**Backend:**
```typescript
// apps/backend/src/main.ts
app.setGlobalPrefix('api');  // Global prefix: /api

// apps/backend/src/modules/gamification/controllers/user-stats.controller.ts
@Controller('gamification')  // Controller base: gamification
@Get('users/:userId/stats')  // Route: users/:userId/stats

// Ruta final: /api/gamification/users/:userId/stats
```

**Frontend:**
```typescript
// apps/frontend/src/services/api/apiClient.ts
const API_BASE_URL = 'http://localhost:3006/api';  // baseURL incluye /api

// apps/frontend/src/lib/api/gamification.api.ts
apiClient.get(`/gamification/users/${userId}/stats`)
//           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
//           Ruta sin /api (ya está en baseURL)
//           Ruta final: http://localhost:3006/api/gamification/users/:userId/stats ✅
```

**⚠️ IMPORTANTE:** NO agregar `/v1/` a las rutas a menos que el backend lo tenga en el global prefix.

---

## Consecuencias

### Positivas ✅

1. **Single Source of Truth**
   - Rutas definidas una sola vez en módulos `*.api.ts`
   - Fácil de actualizar si backend cambia rutas

2. **Type Safety**
   - TypeScript types en todos los API methods
   - Intellisense para parameters y return types

3. **Mantenibilidad**
   - Cambios en rutas se hacen en un solo lugar
   - Hooks usan métodos typed, no strings hardcoded

4. **Testability**
   - Módulos API pueden mockearse fácilmente
   - Tests unitarios más simples

5. **Prevención de Bugs**
   - Imports claros y centralizados
   - No más hard-coding de rutas
   - Refactorings más seguros

### Negativas ⚠️

1. **Capa Adicional**
   - Una capa extra entre hooks y Axios
   - Pequeño overhead de abstracción

2. **Duplicación de Types**
   - Types deben definirse tanto en frontend como backend
   - Requiere sincronización manual

### Mitigaciones 🛡️

1. **Para duplicación de types:**
   - Usar generadores automáticos de tipos (futuro: OpenAPI/Swagger)
   - Documentar contratos en shared types

2. **Para sincronización frontend-backend:**
   - Implementar validación automática de contratos en CI/CD (futuro)
   - Documentar rutas en `routes.constants.ts` como referencia

---

## Alternativas Consideradas

### Alternativa 1: Usar directamente `apiClient` en hooks

**Descartada porque:**
- Hard-coding de rutas en múltiples lugares
- Propenso a errores (como vimos en BUG-FRONTEND-002)
- Difícil de mantener

### Alternativa 2: Usar librería como RTK Query o React Query

**Descartada porque:**
- Overhead de aprendizaje del equipo
- Refactorización masiva del código existente
- No resuelve el problema de hard-coding de rutas

### Alternativa 3: Generación automática desde OpenAPI/Swagger

**Considerada para futuro:**
- Requiere configurar OpenAPI en backend (no existe actualmente)
- Puede implementarse como mejora futura sin romper esta arquitectura
- Compatible con la estructura actual

---

## Guía de Implementación

### Para Crear un Nuevo Módulo API

1. **Crear archivo `*.api.ts` en `lib/api/`**
   ```typescript
   // apps/frontend/src/lib/api/nuevo-modulo.api.ts
   import apiClient from '@/services/api/apiClient';
   import type { TypeA, TypeB } from '@/shared/types';

   export const nuevoModuloApi = {
     getItem: async (id: string): Promise<TypeA> => {
       const { data } = await apiClient.get<TypeA>(`/nuevo-modulo/items/${id}`);
       return data;
     },

     createItem: async (payload: TypeB): Promise<TypeA> => {
       const { data } = await apiClient.post<TypeA>(`/nuevo-modulo/items`, payload);
       return data;
     },
   };

   export default nuevoModuloApi;
   ```

2. **Agregar export en `lib/api/index.ts`**
   ```typescript
   export * from './nuevo-modulo.api';
   ```

3. **Usar en hooks/componentes**
   ```typescript
   import { nuevoModuloApi } from '@/lib/api';

   const item = await nuevoModuloApi.getItem(id);
   ```

---

### Para Refactorizar un Hook Existente

**Antes (hard-coded routes):**
```typescript
import { apiClient } from '@/services/api/apiClient';

const response = await apiClient.get(`/gamification/users/${userId}/stats`);
const stats = response.data;
```

**Después (usa API module):**
```typescript
import { gamificationApi } from '@/lib/api/gamification.api';

const stats = await gamificationApi.getUserStats(userId);
```

---

## Validación

Esta decisión se valida mediante:

1. **Code reviews:** Verificar que nuevos PRs siguen esta estructura
2. **ESLint rules (futuro):** Regla custom para detectar hard-coding de rutas
3. **Documentación:** Este ADR + guía en `docs/frontend/api-architecture.md`

---

## Referencias

- [BUG-FRONTEND-001 Analysis](../orchestration/agentes/architecture-analyst/frontend-api-broken-imports-2025-11-23/01-ANALISIS-PROBLEMA.md)
- [BUG-FRONTEND-002 Analysis](../orchestration/agentes/architecture-analyst/frontend-api-routes-404-2025-11-23/01-ANALISIS-RUTAS-404.md)
- [API Client Source](../apps/frontend/src/services/api/apiClient.ts)
- [Gamification API Module](../apps/frontend/src/lib/api/gamification.api.ts)

---

## Notas

- Este ADR se creó después de resolver BUG-FRONTEND-001 y BUG-FRONTEND-002
- La estructura actual ya sigue parcialmente este patrón
- Se requiere refactorizar hooks que aún usan hard-coded routes

---

**Versión:** 1.0.0
**Última actualización:** 2025-11-23
**Estado:** Aceptado
**Proyecto:** GAMILIT - Sistema de Gamificación Educativa
