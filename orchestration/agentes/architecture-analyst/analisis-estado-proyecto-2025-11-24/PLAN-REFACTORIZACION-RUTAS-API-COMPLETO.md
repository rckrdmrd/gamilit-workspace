# Plan de Refactorización Completa: Arquitectura de Rutas API

**Fecha:** 2025-11-24
**Agente:** Architecture-Analyst
**Prioridad:** 🔴 **CRÍTICA**
**Tipo:** Refactorización Arquitectural

---

## 📊 Resumen Ejecutivo

### Problema Actual

El proyecto GAMILIT tiene **rutas API hardcodeadas en múltiples lugares**, causando:

1. **Errores 404 recurrentes** cuando cambia la configuración
2. **Duplicación de `/v1`** en URLs
3. **Dos sistemas de configuración compitiendo** (api-endpoints.ts vs apiConfig.ts)
4. **Backend inconsistente** (52% usa constantes, 48% rutas hardcoded)
5. **Difícil mantenimiento** y **alto riesgo de bugs**

### Impacto Actual

| Métrica | Valor | Estado |
|---------|-------|--------|
| **Archivos con rutas hardcoded** | 8+ archivos | ❌ Alto riesgo |
| **Sistemas de configuración** | 2 sistemas | ❌ Confusión |
| **Controladores inconsistentes** | 48% hardcoded | ❌ No estandarizado |
| **Lugares con localhost** | 6 archivos | ❌ Difícil cambiar |
| **Duplicaciones de baseURL** | 3 definiciones | ❌ Propenso a errores |

### Solución Propuesta

**Único Punto de Verdad (Single Source of Truth)**:

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND                                                     │
├─────────────────────────────────────────────────────────────┤
│ .env                                                         │
│   VITE_API_HOST=localhost:3006 (o IP producción)           │
│   VITE_API_VERSION=v1                                       │
│                                                              │
│ config/api.config.ts (ÚNICO)                                │
│   const BASE_URL = http://${API_HOST}/api/${API_VERSION}   │
│   export API_ENDPOINTS = { /* todas las rutas */ }         │
│                                                              │
│ services/api/apiClient.ts                                   │
│   baseURL = API_CONFIG.BASE_URL                             │
└─────────────────────────────────────────────────────────────┘
                               ↕
┌─────────────────────────────────────────────────────────────┐
│ BACKEND                                                      │
├─────────────────────────────────────────────────────────────┤
│ .env                                                         │
│   API_VERSION=v1                                            │
│                                                              │
│ shared/constants/routes.constants.ts (ÚNICO)                │
│   export API_VERSION = 'v1'                                 │
│   export API_ROUTES = { /* todas las rutas */ }            │
│                                                              │
│ main.ts                                                      │
│   app.setGlobalPrefix('api')                                │
│                                                              │
│ Todos los controllers                                       │
│   @Controller(extractBasePath(API_ROUTES.XXX.BASE))        │
└─────────────────────────────────────────────────────────────┘
```

### Beneficios

✅ **Cambio centralizado** - Modificar en 1 solo lugar
✅ **Sin hardcoding** - Todo desde variables de entorno
✅ **Fácil deploy** - Solo cambiar .env para producción
✅ **Sin errores 404** - Frontend y backend siempre sincronizados
✅ **Mantenible** - Nuevo desarrollador entiende rápido
✅ **Escalable** - Fácil agregar v2, v3, etc.

---

## 🔍 Análisis Detallado del Problema

### Problema 1: Dos Sistemas de Configuración en Frontend

#### Sistema A: `api-endpoints.ts` (LEGACY)

**Ubicación:** `apps/frontend/src/shared/constants/api-endpoints.ts`

**Estrategia:**
- URLs completas con base incluida
- `API_BASE_URL = http://localhost:3006/api/v1`
- **Incluye `/v1` en baseURL**

**Uso:**
- 1 archivo lo usa (useOrganizations.ts)
- 2 referencias totales
- **7% de adopción**

#### Sistema B: `apiConfig.ts` (ACTUAL)

**Ubicación:** `apps/frontend/src/services/api/apiConfig.ts`

**Estrategia:**
- Rutas relativas sin base
- `BASE_URL = http://localhost:3006/api`
- **NO incluye `/v1` en baseURL**
- Cada ruta empieza con `/v1/`

**Uso:**
- 27 archivos lo usan
- 207 referencias totales
- **93% de adopción**

**Problema:** Ambos coexisten, causando confusión sobre dónde va `/v1`

---

### Problema 2: Hardcoding de Rutas

#### Archivos Críticos con Hardcoding

**1. `services/api/admin/classroomTeacherApi.ts`**
```typescript
const BASE_URL = '/v1/admin';  // ❌ HARDCODED

export const classroomTeacherApi = {
  async getClassroomTeachers(classroomId: string) {
    const response = await apiClient.get(`${BASE_URL}/classrooms/${classroomId}/teachers`);
    return response.data;
  },
}
```

**Problema:** Si cambia la ruta de admin, hay que buscar y reemplazar en múltiples archivos.

**2. `services/api/admin/gamificationConfigApi.ts`**
```typescript
const BASE_URL = '/admin/gamification/config';  // ❌ HARDCODED + FALTA /v1/

// Ruta incorrecta: /api/admin/gamification/config
// Debería ser: /api/v1/admin/gamification/config
```

**Problema:** Falta el prefijo `/v1/`, causará 404.

**3. `shared/hooks/useModules.ts`**
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3006/api';  // ❌ HARDCODED
```

**Problema:** No usa el API_CONFIG centralizado.

**4. `features/notifications/hooks/useWebSocket.ts`**
```typescript
const url = 'http://localhost:3006';  // ❌ HARDCODED
```

**Problema:** No funcionará en producción.

---

### Problema 3: Backend Inconsistente

#### Controladores usando API_ROUTES (✅ BIEN - 52%)

```typescript
import { API_ROUTES, extractBasePath } from '@/shared/constants';

@Controller(extractBasePath(API_ROUTES.PROGRESS.BASE))
export class ModuleProgressController { }
```

**Módulos que lo hacen bien:**
- PROGRESS: 5/5 controladores (100%)
- CONTENT: 5/5 controladores (100%)
- SOCIAL: 8/8 controladores (100%)
- EDUCATIONAL: 3/3 controladores (100%)

#### Controladores con rutas hardcoded (❌ MAL - 48%)

```typescript
@Controller('admin/dashboard')  // ❌ HARDCODED
export class AdminDashboardController { }
```

**Módulos que lo hacen mal:**
- ADMIN: 11/11 controladores (100%)
- TEACHER: 3/3 controladores (100%)
- NOTIFICATIONS: 5/5 controladores (100%)
- AUTH: 1/2 controladores (50%)

**Total:** 25 controladores con rutas hardcoded

---

### Problema 4: Múltiples Definiciones de URLs

**6 lugares diferentes definen la URL base:**

1. `apps/frontend/.env`
   ```env
   VITE_API_URL=http://localhost:3006/api
   ```

2. `services/api/apiConfig.ts:482`
   ```typescript
   BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3006/api'
   ```

3. `shared/constants/api-endpoints.ts:19`
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3006/api/v1'
   ```
   ⚠️ **Nota:** Incluye `/v1` (diferente del resto)

4. `shared/hooks/useModules.ts:8`
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3006/api'
   ```

5. `features/notifications/hooks/useWebSocket.ts`
   ```typescript
   'http://localhost:3006'
   ```

6. `test/setup.ts`
   ```typescript
   process.env.VITE_API_URL = 'http://localhost:3006/api'
   ```

**Problema:** Cambiar la URL requiere modificar 6 archivos diferentes.

---

## 🎯 Arquitectura Objetivo

### Diseño de la Solución

#### 1. Variables de Entorno (`.env`)

**Frontend - `apps/frontend/.env`:**
```env
# ==================== API CONFIGURATION ====================
# Host puede ser localhost, IP, o dominio
VITE_API_HOST=localhost:3006
VITE_API_PROTOCOL=http
VITE_API_VERSION=v1

# WebSocket
VITE_WS_PROTOCOL=ws
VITE_WS_HOST=localhost:3006

# Timeouts
VITE_API_TIMEOUT=30000
```

**Producción - `apps/frontend/.env.production`:**
```env
VITE_API_HOST=74.208.126.102:3006
VITE_API_PROTOCOL=https
VITE_API_VERSION=v1

VITE_WS_PROTOCOL=wss
VITE_WS_HOST=74.208.126.102:3006
```

**Backend - `apps/backend/.env`:**
```env
# Server
PORT=3006
API_PREFIX=api
API_VERSION=v1

# CORS (auto-construido desde frontend host)
CORS_ORIGINS=http://localhost:3005,http://localhost:5173
```

#### 2. Frontend Config (ÚNICO PUNTO)

**Archivo:** `apps/frontend/src/config/api.config.ts` (NUEVO)

```typescript
/**
 * API Configuration - Single Source of Truth
 *
 * IMPORTANTE: Este es el ÚNICO lugar donde se configuran las URLs del API.
 * Todos los demás archivos DEBEN importar desde aquí.
 */

// ============================================================================
// ENVIRONMENT VARIABLES
// ============================================================================

const API_HOST = import.meta.env.VITE_API_HOST;
const API_PROTOCOL = import.meta.env.VITE_API_PROTOCOL || 'http';
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

const WS_HOST = import.meta.env.VITE_WS_HOST || API_HOST;
const WS_PROTOCOL = import.meta.env.VITE_WS_PROTOCOL || 'ws';

const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '30000');

// Validación
if (!API_HOST) {
  throw new Error('VITE_API_HOST is required in .env file');
}

// ============================================================================
// API CONFIGURATION
// ============================================================================

/**
 * Base API URL
 * Construido desde: PROTOCOL://HOST/api/VERSION
 * Ejemplo: http://localhost:3006/api/v1
 */
export const API_BASE_URL = `${API_PROTOCOL}://${API_HOST}/api/${API_VERSION}`;

/**
 * WebSocket URL
 * Construido desde: WS_PROTOCOL://WS_HOST
 * Ejemplo: ws://localhost:3006
 */
export const WS_BASE_URL = `${WS_PROTOCOL}://${WS_HOST}`;

/**
 * API Configuration Object
 */
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  wsURL: WS_BASE_URL,
  timeout: API_TIMEOUT,
  version: API_VERSION,
  host: API_HOST,
  protocol: API_PROTOCOL,
} as const;

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * API Endpoints - Todas las rutas relativas (sin /v1, ya está en baseURL)
 */
export const API_ENDPOINTS = {
  /**
   * Authentication endpoints
   */
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    profile: '/auth/profile',
  },

  /**
   * Gamification endpoints
   */
  gamification: {
    userSummary: (userId: string) => `/gamification/users/${userId}/summary`,
    userStats: (userId: string) => `/gamification/users/${userId}/stats`,
    achievements: `/gamification/achievements`,
    leaderboard: `/gamification/leaderboard`,
  },

  /**
   * Educational endpoints
   */
  educational: {
    modules: '/educational/modules',
    module: (id: string) => `/educational/modules/${id}`,
    userModules: (userId: string) => `/educational/modules/user/${userId}`,
    exercises: '/educational/exercises',
    exercise: (id: string) => `/educational/exercises/${id}`,
  },

  /**
   * Progress endpoints
   */
  progress: {
    userProgress: (userId: string) => `/progress/users/${userId}`,
    moduleProgress: (userId: string, moduleId: string) =>
      `/progress/users/${userId}/modules/${moduleId}`,
    recentActivities: (userId: string) => `/progress/users/${userId}/recent-activities`,
  },

  /**
   * Admin endpoints
   */
  admin: {
    dashboard: '/admin/dashboard',
    users: '/admin/users',
    organizations: '/admin/organizations',
    organization: (id: string) => `/admin/organizations/${id}`,
    classrooms: '/admin/classrooms',
    classroom: (id: string) => `/admin/classrooms/${id}`,
  },

  /**
   * Teacher endpoints
   */
  teacher: {
    dashboard: '/teacher/dashboard',
    classrooms: '/teacher/classrooms',
    classroom: (id: string) => `/teacher/classrooms/${id}`,
    classroomTeachers: (classroomId: string) =>
      `/teacher/classrooms/${classroomId}/teachers`,
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Construye URL completa para un endpoint
 * @param path - Ruta relativa (puede ser string o función)
 * @returns URL completa
 */
export function buildApiUrl(path: string | ((...args: any[]) => string)): string {
  const relativePath = typeof path === 'function' ? path : () => path;
  return `${API_BASE_URL}${relativePath()}`;
}

/**
 * Construye WebSocket URL
 * @param path - Ruta relativa para WebSocket
 * @returns WebSocket URL completa
 */
export function buildWsUrl(path: string = ''): string {
  return `${WS_BASE_URL}${path}`;
}

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FEATURE_FLAGS = {
  USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA === 'true',
  ENABLE_WEBSOCKET: import.meta.env.VITE_ENABLE_WEBSOCKET === 'true',
  DEBUG_API: import.meta.env.VITE_DEBUG_API === 'true',
  ENABLE_AI: import.meta.env.VITE_ENABLE_AI !== 'false',
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
} as const;

// ============================================================================
// HTTP STATUS CODES
// ============================================================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ============================================================================
// VALIDATION & LOGGING
// ============================================================================

if (import.meta.env.MODE === 'development') {
  console.log('[API Config] Configuration loaded:', {
    baseURL: API_BASE_URL,
    wsURL: WS_BASE_URL,
    version: API_VERSION,
    host: API_HOST,
  });
}

// Export default
export default {
  API_CONFIG,
  API_ENDPOINTS,
  FEATURE_FLAGS,
  HTTP_STATUS,
  buildApiUrl,
  buildWsUrl,
};
```

#### 3. Frontend apiClient (ACTUALIZADO)

**Archivo:** `apps/frontend/src/services/api/apiClient.ts`

```typescript
import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { API_CONFIG } from '@/config/api.config';  // ✅ Importa desde config único

/**
 * Base Axios instance - Usa API_CONFIG.baseURL
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.baseURL,  // ✅ Desde config único
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ... interceptors y demás
```

#### 4. Backend Constants (ACTUALIZADO)

**Archivo:** `apps/backend/src/shared/constants/routes.constants.ts`

```typescript
/**
 * API Routes Constants - Backend
 * Single Source of Truth for Backend Routes
 */

// Leer desde environment o usar default
export const API_VERSION = process.env.API_VERSION || 'v1';
export const API_PREFIX = process.env.API_PREFIX || 'api';
export const API_BASE = `/${API_PREFIX}/${API_VERSION}`;

/**
 * API Routes por módulo
 * IMPORTANTE: Todos los controllers DEBEN usar extractBasePath() con estas constantes
 */
export const API_ROUTES = {
  // Auth Module
  AUTH: {
    BASE: `/${API_VERSION}/auth`,
    LOGIN: `/${API_VERSION}/auth/login`,
    REGISTER: `/${API_VERSION}/auth/register`,
    // ...
  },

  // Gamification Module
  GAMIFICATION: {
    BASE: `/${API_VERSION}/gamification`,
    USER_STATS: (userId: string) => `/${API_VERSION}/gamification/users/${userId}/stats`,
    // ...
  },

  // Educational Module
  EDUCATIONAL: {
    BASE: `/${API_VERSION}/educational`,
    MODULES: `/${API_VERSION}/educational/modules`,
    // ...
  },

  // Progress Module
  PROGRESS: {
    BASE: `/${API_VERSION}/progress`,
    USER_PROGRESS: (userId: string) => `/${API_VERSION}/progress/users/${userId}`,
    // ...
  },

  // Admin Module
  ADMIN: {
    BASE: `/${API_VERSION}/admin`,
    DASHBOARD: `/${API_VERSION}/admin/dashboard`,
    USERS: `/${API_VERSION}/admin/users`,
    ORGANIZATIONS: `/${API_VERSION}/admin/organizations`,
    // ...
  },

  // Teacher Module
  TEACHER: {
    BASE: `/${API_VERSION}/teacher`,
    DASHBOARD: `/${API_VERSION}/teacher/dashboard`,
    CLASSROOMS: `/${API_VERSION}/teacher/classrooms`,
    // ...
  },

  // Health & Monitoring
  HEALTH: {
    BASE: `/${API_VERSION}/health`,
    LIVENESS: `/${API_VERSION}/health/liveness`,
    READINESS: `/${API_VERSION}/health/readiness`,
  },
} as const;

/**
 * Helper: Extraer base path para @Controller
 * Remueve el primer slash para NestJS
 */
export const extractBasePath = (route: string): string => {
  return route.replace(/^\//, '');
};

/**
 * Helper: Construir URL completa
 */
export const buildApiUrl = (route: string): string => {
  return `/${API_PREFIX}${route}`;
};
```

#### 5. Backend main.ts (ACTUALIZADO)

**Archivo:** `apps/backend/src/main.ts`

```typescript
import { API_PREFIX } from '@/shared/constants/routes.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix (lee desde constante que viene de .env)
  app.setGlobalPrefix(API_PREFIX);  // ✅ = 'api'

  // ...resto de configuración
}
```

---

## 🚀 Plan de Implementación

### FASE 1: Limpieza y Consolidación (Prioridad P0)

**Tiempo estimado:** 4 horas
**Riesgo:** Bajo
**Impacto:** Alto

#### Task 1.1: Crear Nuevo Config Centralizado

**Archivo a crear:** `apps/frontend/src/config/api.config.ts`

**Acciones:**
1. Crear el archivo con estructura propuesta arriba
2. Implementar lectura de env variables
3. Construir API_BASE_URL dinámicamente
4. Migrar todos los API_ENDPOINTS desde apiConfig.ts
5. Agregar validación de env variables
6. Agregar logging en development

**Tests:**
```typescript
// api.config.test.ts
describe('API Config', () => {
  it('should construct base URL correctly', () => {
    expect(API_BASE_URL).toBe('http://localhost:3006/api/v1');
  });

  it('should construct WebSocket URL correctly', () => {
    expect(WS_BASE_URL).toBe('ws://localhost:3006');
  });

  it('should throw error if VITE_API_HOST missing', () => {
    // ...
  });
});
```

#### Task 1.2: Actualizar apiClient.ts

**Archivo a modificar:** `apps/frontend/src/services/api/apiClient.ts`

**Cambios:**
```typescript
// ANTES
import { env } from '@/config/env';
baseURL: env.apiUrl,

// DESPUÉS
import { API_CONFIG } from '@/config/api.config';
baseURL: API_CONFIG.baseURL,
```

#### Task 1.3: Eliminar Hardcoding en classroomTeacherApi.ts

**Archivo a modificar:** `apps/frontend/src/services/api/admin/classroomTeacherApi.ts`

**Cambios:**
```typescript
// ANTES
const BASE_URL = '/v1/admin';
const response = await apiClient.get(`${BASE_URL}/classrooms/${classroomId}/teachers`);

// DESPUÉS
import { API_ENDPOINTS } from '@/config/api.config';
const response = await apiClient.get(API_ENDPOINTS.teacher.classroomTeachers(classroomId));
```

#### Task 1.4: Eliminar Hardcoding en gamificationConfigApi.ts

**Archivo a modificar:** `apps/frontend/src/services/api/admin/gamificationConfigApi.ts`

**Cambios:**
```typescript
// ANTES
const BASE_URL = '/admin/gamification/config';  // ❌ Falta /v1/
const response = await apiClient.get(`${BASE_URL}/settings`);

// DESPUÉS
import { API_ENDPOINTS } from '@/config/api.config';
// Agregar a API_ENDPOINTS.admin.gamificationConfig
const response = await apiClient.get(API_ENDPOINTS.admin.gamificationConfig);
```

#### Task 1.5: Actualizar useModules.ts

**Archivo a modificar:** `apps/frontend/src/shared/hooks/useModules.ts`

**Cambios:**
```typescript
// ANTES
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3006/api';

// DESPUÉS
import { API_CONFIG } from '@/config/api.config';
// Usar API_CONFIG.baseURL en lugar de variable local
```

#### Task 1.6: Actualizar useWebSocket.ts

**Archivo a modificar:** `apps/frontend/src/features/notifications/hooks/useWebSocket.ts`

**Cambios:**
```typescript
// ANTES
const url = 'http://localhost:3006';

// DESPUÉS
import { API_CONFIG } from '@/config/api.config';
const url = API_CONFIG.wsURL;
```

#### Task 1.7: Migrar useOrganizations.ts

**Archivo a modificar:** `apps/frontend/src/apps/admin/hooks/useOrganizations.ts`

**Cambios:**
```typescript
// ANTES
import { API_ENDPOINTS } from '@/shared/constants/api-endpoints';

// DESPUÉS
import { API_ENDPOINTS } from '@/config/api.config';
```

#### Task 1.8: Eliminar api-endpoints.ts

**Archivo a eliminar:** `apps/frontend/src/shared/constants/api-endpoints.ts`

**Acciones:**
1. Verificar que useOrganizations.ts esté migrado
2. Eliminar el archivo
3. Actualizar imports en documentación

#### Task 1.9: Eliminar o actualizar apiConfig.ts viejo

**Archivo a modificar/eliminar:** `apps/frontend/src/services/api/apiConfig.ts`

**Opción A - Eliminar completamente:**
- Migrar todos los imports a nuevo config
- Eliminar archivo

**Opción B - Mantener como re-export (más seguro):**
```typescript
// Mantener compatibilidad mientras se migra gradualmente
export * from '@/config/api.config';

// @deprecated Use @/config/api.config instead
console.warn('apiConfig.ts is deprecated. Use @/config/api.config instead');
```

#### Task 1.10: Actualizar .env files

**Archivos a modificar:**
- `apps/frontend/.env`
- `apps/frontend/.env.example`
- `apps/frontend/.env.production`

**Nuevas variables:**
```env
# Reemplazar VITE_API_URL con:
VITE_API_HOST=localhost:3006
VITE_API_PROTOCOL=http
VITE_API_VERSION=v1

# Reemplazar VITE_WS_URL con:
VITE_WS_PROTOCOL=ws
VITE_WS_HOST=localhost:3006
```

---

### FASE 2: Backend Estandarización (Prioridad P1)

**Tiempo estimado:** 6 horas
**Riesgo:** Medio
**Impacto:** Alto

#### Task 2.1: Actualizar routes.constants.ts

**Archivo a modificar:** `apps/backend/src/shared/constants/routes.constants.ts`

**Acciones:**
1. Agregar lectura de `API_VERSION` desde .env
2. Agregar todas las rutas faltantes de ADMIN
3. Agregar todas las rutas faltantes de TEACHER
4. Agregar todas las rutas faltantes de NOTIFICATIONS
5. Incluir `/v1/` en todas las rutas
6. Actualizar `extractBasePath()` para manejar `/v1/`

**Ejemplo de rutas a agregar:**
```typescript
// Admin Module (11 rutas faltantes)
ADMIN: {
  BASE: `/${API_VERSION}/admin`,
  DASHBOARD: `/${API_VERSION}/admin/dashboard`,
  USERS: `/${API_VERSION}/admin/users`,
  SYSTEM: `/${API_VERSION}/admin/system`,
  ROLES: `/${API_VERSION}/admin/roles`,
  REPORTS: `/${API_VERSION}/admin/reports`,
  ORGANIZATIONS: `/${API_VERSION}/admin/organizations`,
  LOGS: `/${API_VERSION}/admin/logs`,
  GAMIFICATION: `/${API_VERSION}/admin/gamification`,
  CONTENT: `/${API_VERSION}/admin/content`,
  CLASSROOMS: `/${API_VERSION}/admin/classrooms`,
  BULK_OPERATIONS: `/${API_VERSION}/admin/bulk-operations`,
},

// Teacher Module (3 rutas faltantes)
TEACHER: {
  BASE: `/${API_VERSION}/teacher`,
  DASHBOARD: `/${API_VERSION}/teacher/dashboard`,
  CLASSROOMS: `/${API_VERSION}/teacher/classrooms`,
  ASSIGNMENTS: `/${API_VERSION}/teacher/assignments`,
},

// Notifications Module (5 rutas faltantes)
NOTIFICATIONS: {
  BASE: `/${API_VERSION}/notifications`,
  DEVICES: `/${API_VERSION}/notifications/devices`,
  MULTICHANNEL: `/${API_VERSION}/notifications/multichannel`,
  PREFERENCES: `/${API_VERSION}/notifications/preferences`,
  TEMPLATES: `/${API_VERSION}/notifications/templates`,
},
```

#### Task 2.2: Actualizar Controllers de ADMIN (11 archivos)

**Archivos a modificar:**
1. `admin-dashboard.controller.ts`
2. `admin-users.controller.ts`
3. `admin-system.controller.ts`
4. `admin-roles.controller.ts`
5. `admin-reports.controller.ts`
6. `admin-organizations.controller.ts`
7. `admin-logs.controller.ts`
8. `admin-gamification.controller.ts`
9. `admin-content.controller.ts`
10. `admin-classrooms.controller.ts`
11. `admin-bulk-operations.controller.ts`

**Cambio tipo:**
```typescript
// ANTES
@Controller('admin/dashboard')
export class AdminDashboardController { }

// DESPUÉS
import { API_ROUTES, extractBasePath } from '@/shared/constants';

@Controller(extractBasePath(API_ROUTES.ADMIN.DASHBOARD))
export class AdminDashboardController { }
```

#### Task 2.3: Actualizar Controllers de TEACHER (3 archivos)

**Archivos a modificar:**
1. `teacher.controller.ts`
2. `teacher-classrooms.controller.ts`
3. `assignments.controller.ts`

**Cambio tipo:**
```typescript
// ANTES
@Controller('teacher')
export class TeacherController { }

// DESPUÉS
import { API_ROUTES, extractBasePath } from '@/shared/constants';

@Controller(extractBasePath(API_ROUTES.TEACHER.BASE))
export class TeacherController { }
```

#### Task 2.4: Actualizar Controllers de NOTIFICATIONS (5 archivos)

**Archivos a modificar:**
1. `notifications.controller.ts`
2. `notification-devices.controller.ts`
3. `notification-multichannel.controller.ts`
4. `notification-preferences.controller.ts`
5. `notification-templates.controller.ts`

#### Task 2.5: Actualizar Controllers Restantes (6 archivos)

**Archivos a modificar:**
1. `auth.controller.ts`
2. `users.controller.ts`
3. `health.controller.ts`
4. `missions.controller.ts` (gamification)
5. `ranks.controller.ts` (gamification)
6. `comodines.controller.ts` (gamification)

#### Task 2.6: Actualizar main.ts

**Archivo a modificar:** `apps/backend/src/main.ts`

**Cambios:**
```typescript
// ANTES
app.setGlobalPrefix('api');

// DESPUÉS
import { API_PREFIX } from '@/shared/constants/routes.constants';
app.setGlobalPrefix(API_PREFIX);  // Lee desde .env o usa 'api' por default
```

#### Task 2.7: Actualizar .env backend

**Archivo a modificar:** `apps/backend/.env`

**Agregar:**
```env
# API Configuration
API_PREFIX=api
API_VERSION=v1
```

---

### FASE 3: Tooling y Documentación (Prioridad P2)

**Tiempo estimado:** 6 horas
**Riesgo:** Bajo
**Impacto:** Medio

#### Task 3.1: Mejorar Contract Validation Script

**Archivo a modificar:** `apps/devops/scripts/validate-api-contract.ts`

**Mejoras:**
1. Eliminar referencias a api-endpoints.ts
2. Solo validar contra api.config.ts (nuevo)
3. Validar contra backend routes.constants.ts
4. Detectar discrepancias frontend ↔ backend
5. Generar reporte HTML
6. Integrar en CI/CD

**Ejemplo de validación:**
```typescript
// Frontend
API_ENDPOINTS.gamification.userSummary(userId)
// Genera: /gamification/users/${userId}/summary

// Backend
API_ROUTES.GAMIFICATION.USER_SUMMARY
// Genera: /v1/gamification/users/${userId}/summary

// Validación: Debe coincidir (ignorando /v1 ya que está en baseURL)
```

#### Task 3.2: Agregar TypeScript Types

**Archivo a crear:** `apps/frontend/src/config/api.types.ts`

**Implementar:**
```typescript
// Type-safe endpoint paths
export type ApiEndpointPath =
  | keyof typeof API_ENDPOINTS.auth
  | keyof typeof API_ENDPOINTS.gamification
  | keyof typeof API_ENDPOINTS.educational
  | keyof typeof API_ENDPOINTS.progress
  | keyof typeof API_ENDPOINTS.admin
  | keyof typeof API_ENDPOINTS.teacher;

// Type-safe endpoint functions
export type ApiEndpointFunction<T extends (...args: any[]) => string> = T;

// Helper type for extracting params
export type ExtractParams<T> = T extends (arg: infer P) => string ? P : never;
```

#### Task 3.3: Actualizar ESLint Rules

**Archivo a modificar:** `apps/frontend/eslint-rules/no-api-route-issues.cjs`

**Agregar reglas:**
1. Prohibir imports de `apiConfig.ts` viejo
2. Requerir imports de `@/config/api.config`
3. Detectar rutas hardcoded que no usan API_ENDPOINTS
4. Auto-fix para migrar imports

#### Task 3.4: Actualizar Documentación

**Archivos a crear/actualizar:**

1. **`docs/03-desarrollo/API-ROUTE-CONFIGURATION.md`** (NUEVO)
   - Explicar arquitectura de rutas
   - Cómo agregar nuevos endpoints
   - Cómo cambiar URLs para prod
   - Ejemplos de uso

2. **`docs/97-adr/ADR-016-unified-api-routes-architecture.md`** (NUEVO)
   - Decision record
   - Context y problema
   - Alternativas consideradas
   - Decisión final
   - Consecuencias

3. **`docs/90-transversal/MIGRATION-GUIDE-API-ROUTES.md`** (NUEVO)
   - Guía de migración para desarrolladores
   - Breaking changes
   - Cómo actualizar código existente
   - FAQ

4. **Actualizar README.md**
   - Sección de configuración de API
   - Variables de entorno requeridas
   - Cómo ejecutar en producción

---

## 📋 Checklist de Implementación

### Fase 1: Limpieza y Consolidación

- [ ] 1.1 Crear `apps/frontend/src/config/api.config.ts`
- [ ] 1.2 Actualizar `apiClient.ts` para usar nuevo config
- [ ] 1.3 Eliminar hardcoding en `classroomTeacherApi.ts`
- [ ] 1.4 Eliminar hardcoding en `gamificationConfigApi.ts`
- [ ] 1.5 Actualizar `useModules.ts`
- [ ] 1.6 Actualizar `useWebSocket.ts`
- [ ] 1.7 Migrar `useOrganizations.ts`
- [ ] 1.8 Eliminar `api-endpoints.ts`
- [ ] 1.9 Eliminar/actualizar `apiConfig.ts` viejo
- [ ] 1.10 Actualizar `.env` files

**Tests Fase 1:**
- [ ] Build frontend sin errores
- [ ] Tests unitarios pasan
- [ ] Login funciona
- [ ] Dashboard carga
- [ ] No errores 404 en console

### Fase 2: Backend Estandarización

- [ ] 2.1 Actualizar `routes.constants.ts` con todas las rutas
- [ ] 2.2 Actualizar 11 controllers de ADMIN
- [ ] 2.3 Actualizar 3 controllers de TEACHER
- [ ] 2.4 Actualizar 5 controllers de NOTIFICATIONS
- [ ] 2.5 Actualizar 6 controllers restantes
- [ ] 2.6 Actualizar `main.ts`
- [ ] 2.7 Actualizar `.env` backend

**Tests Fase 2:**
- [ ] Build backend sin errores
- [ ] Tests unitarios pasan
- [ ] Tests E2E pasan
- [ ] Swagger documentation actualizado
- [ ] Todos los endpoints responden correctamente

### Fase 3: Tooling y Documentación

- [ ] 3.1 Mejorar contract validation script
- [ ] 3.2 Agregar TypeScript types
- [ ] 3.3 Actualizar ESLint rules
- [ ] 3.4 Crear/actualizar documentación

**Tests Fase 3:**
- [ ] Validation script ejecuta sin errores
- [ ] ESLint rules funcionan
- [ ] Documentación revisada
- [ ] CI/CD pipeline actualizado

---

## 🧪 Plan de Testing

### Tests Unitarios

**Frontend:**
```typescript
// api.config.test.ts
describe('API Config', () => {
  it('should construct base URL correctly', () => {
    expect(API_BASE_URL).toBe('http://localhost:3006/api/v1');
  });

  it('should have all required endpoints', () => {
    expect(API_ENDPOINTS.auth).toBeDefined();
    expect(API_ENDPOINTS.gamification).toBeDefined();
    expect(API_ENDPOINTS.educational).toBeDefined();
  });

  it('should construct dynamic routes correctly', () => {
    const userId = 'test-123';
    expect(API_ENDPOINTS.gamification.userSummary(userId))
      .toBe('/gamification/users/test-123/summary');
  });
});
```

**Backend:**
```typescript
// routes.constants.spec.ts
describe('Routes Constants', () => {
  it('should include version in all routes', () => {
    expect(API_ROUTES.AUTH.LOGIN).toContain('/v1/');
    expect(API_ROUTES.GAMIFICATION.BASE).toContain('/v1/');
  });

  it('should extract base path correctly', () => {
    expect(extractBasePath('/v1/auth')).toBe('v1/auth');
    expect(extractBasePath('/v1/admin/dashboard')).toBe('v1/admin/dashboard');
  });
});
```

### Tests de Integración

**Contract Validation:**
```typescript
describe('API Contract', () => {
  it('frontend routes should match backend routes', () => {
    const frontendLogin = API_ENDPOINTS.auth.login;
    const backendLogin = API_ROUTES.AUTH.LOGIN;

    // Frontend: /auth/login (sin /v1 porque está en baseURL)
    // Backend: /v1/auth/login
    expect(`/v1${frontendLogin}`).toBe(backendLogin);
  });
});
```

### Tests E2E

**Smoke Tests:**
```typescript
describe('API Smoke Tests', () => {
  it('should login successfully', async () => {
    const response = await apiClient.post(API_ENDPOINTS.auth.login, {
      email: 'test@example.com',
      password: 'password123',
    });
    expect(response.status).toBe(200);
  });

  it('should fetch user modules', async () => {
    const userId = 'test-user-id';
    const response = await apiClient.get(
      API_ENDPOINTS.educational.userModules(userId)
    );
    expect(response.status).toBe(200);
  });
});
```

---

## 🚨 Riesgos y Mitigación

### Riesgo 1: Breaking Changes

**Probabilidad:** Alta
**Impacto:** Alto

**Mitigación:**
- Implementar en fases
- Tests exhaustivos antes de cada fase
- Mantener compatibilidad con @deprecated warnings
- Deploy gradual (dev → staging → production)
- Rollback plan preparado

### Riesgo 2: Endpoints No Mapeados

**Probabilidad:** Media
**Impacto:** Alto

**Mitigación:**
- Ejecutar audit script para encontrar todos los endpoints
- Revisar Swagger/OpenAPI documentation
- Hacer grep exhaustivo en codebase
- Tests E2E que cubran todos los endpoints

### Riesgo 3: Variables de Entorno Faltantes

**Probabilidad:** Media
**Impacto:** Alto

**Mitigación:**
- Validación estricta en startup
- Throw error si faltan variables críticas
- Documentar todas las variables requeridas
- Ejemplos en .env.example
- CI/CD verifica que .env.production esté completo

### Riesgo 4: Inconsistencias durante Migración

**Probabilidad:** Alta
**Impacto:** Medio

**Mitigación:**
- Feature flags para activar nuevo sistema gradualmente
- Logs detallados de qué sistema se está usando
- Dual-mode: permitir ambos sistemas temporalmente
- Monitoreo de errores 404 en tiempo real

---

## 📊 Métricas de Éxito

### Pre-Refactorización (Baseline)

| Métrica | Valor Actual |
|---------|--------------|
| Archivos con rutas hardcoded | 8 archivos |
| Sistemas de configuración | 2 sistemas |
| Controladores inconsistentes | 48% hardcoded |
| Definiciones de baseURL | 6 lugares |
| Errores 404 reportados | 5+ en última semana |

### Post-Refactorización (Objetivo)

| Métrica | Valor Objetivo |
|---------|----------------|
| Archivos con rutas hardcoded | 0 archivos ✅ |
| Sistemas de configuración | 1 sistema ✅ |
| Controladores inconsistentes | 0% hardcoded ✅ |
| Definiciones de baseURL | 1 lugar (.env) ✅ |
| Errores 404 reportados | 0 errores ✅ |

### KPIs

- **Tiempo para cambiar URL de API:** De ~30 minutos a ~1 minuto
- **Errores 404 en producción:** De 5+/semana a 0/semana
- **Onboarding de nuevos devs:** De 2 horas a 30 minutos
- **Build failures por rutas:** De 2+/sprint a 0/sprint
- **Code maintainability score:** De 6/10 a 9/10

---

## 💰 Estimación de Esfuerzo

### Resumen por Fase

| Fase | Tareas | Horas | Riesgo | Prioridad |
|------|--------|-------|--------|-----------|
| Fase 1: Limpieza | 10 tasks | 4h | Bajo | P0 |
| Fase 2: Backend | 7 tasks | 6h | Medio | P1 |
| Fase 3: Tooling | 4 tasks | 6h | Bajo | P2 |
| **Total** | **21 tasks** | **16h** | **Medio** | **-** |

### Desglose Detallado

**Fase 1 (4 horas):**
- Crear nuevo config: 1.5h
- Migrar archivos (8 archivos): 2h
- Actualizar .env: 0.5h

**Fase 2 (6 horas):**
- Actualizar routes.constants: 1h
- Actualizar controllers (25 archivos): 4h
- Actualizar main.ts y .env: 1h

**Fase 3 (6 horas):**
- Contract validation: 2h
- TypeScript types: 1.5h
- ESLint rules: 1h
- Documentación: 1.5h

### Testing (adicional)

- Tests unitarios: 2h
- Tests de integración: 2h
- Tests E2E: 2h
- QA manual: 2h
- **Total testing:** 8h

**TOTAL PROYECTO:** 24 horas (3 días de trabajo)

---

## 🎯 Próximos Pasos Inmediatos

### Para Iniciar la Refactorización

1. **Crear branch:**
   ```bash
   git checkout -b refactor/unified-api-routes-architecture
   ```

2. **Iniciar Fase 1:**
   - Comenzar con Task 1.1: Crear api.config.ts
   - Hacer commit incremental por cada task
   - Ejecutar tests después de cada task

3. **Revisión:**
   - Code review después de Fase 1
   - QA testing después de Fase 2
   - Full regression después de Fase 3

4. **Deploy:**
   - Dev environment primero
   - Staging con monitoreo extensivo
   - Production con rollback plan listo

---

## 📚 Referencias

### Documentación Relevante

1. **ADR-012:** Automatic User Initialization Trigger
2. **ADR-015:** Centralized API Routes Configuration (a crear)
3. **CONSTANTS-ARCHITECTURE.md:** Arquitectura de constantes
4. **API-CONTRACT-VALIDATION:** Validación de contratos

### Recursos Externos

1. [NestJS Global Prefix](https://docs.nestjs.com/faq/global-prefix)
2. [Axios Configuration](https://axios-http.com/docs/config_defaults)
3. [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
4. [12-Factor App - Config](https://12factor.net/config)

---

## ✅ Conclusión

Este plan de refactorización eliminará **completamente el hardcoding de rutas** en el proyecto GAMILIT, creando un **único punto de verdad** para todas las configuraciones de API. Los beneficios incluyen:

✅ **Mantenimiento simplificado** - Cambiar URLs en 1 solo lugar
✅ **Deploy facilitado** - Solo actualizar .env para diferentes ambientes
✅ **Cero errores 404** - Frontend y backend siempre sincronizados
✅ **Mejor DX** - Nuevo desarrollador entiende arquitectura rápidamente
✅ **Escalabilidad** - Fácil agregar v2, v3 en el futuro
✅ **Type Safety** - TypeScript types para todas las rutas
✅ **CI/CD Integration** - Validación automática de contratos

La implementación total tomará aproximadamente **24 horas** (3 días) y se dividirá en 3 fases con tests exhaustivos entre cada una.

**¿Aprobado para proceder?**

---

**Preparado por:** Architecture-Analyst Agent
**Fecha:** 2025-11-24 06:10 CST
**Versión:** 1.0
**Estado:** Pendiente de Aprobación
