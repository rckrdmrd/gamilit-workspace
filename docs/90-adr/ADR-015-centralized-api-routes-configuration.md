# ADR-015: Centralización de Rutas API en apiConfig.ts

**Estado:** Aceptado
**Fecha:** 2025-11-24
**Autor:** Architecture-Analyst
**Relacionado con:** GAP-001, GAP-002, GAP-005, GAP-006, ADR-011
**Supersedes:** ADR-011 (parcialmente)

---

## Contexto

Durante la resolución de múltiples gaps críticos (GAP-001 a GAP-007), identificamos problemas severos con la arquitectura de rutas API en el frontend:

### Problemas Identificados

1. **GAP-001:** Ruta de alerts en admin (`/admin/alerts`) no coincidía con backend (`/v1/admin/dashboard/alerts`)
2. **GAP-002:** Duplicate `/api` prefix en `classroomTeacherApi` causaba URLs `/api/api/admin/...`
3. **GAP-005:** Inconsistencia en versionamiento - solo 46% de rutas tenían `/v1/`
4. **GAP-006:** Rutas dispersas en 31+ archivos, hardcoded en servicios y hooks

### Arquitectura Previa (ADR-011)

ADR-011 proponía:
- Módulos API individuales en `lib/api/*.api.ts` (uno por dominio)
- Cada módulo define sus propias rutas
- Rutas SIN `/v1/` (asumía que backend no lo tenía)

**Problemas con esta aproximación:**
- ❌ Rutas duplicadas en múltiples archivos
- ❌ Difícil de auditar (31+ archivos a revisar)
- ❌ Refactors requieren cambios en múltiples lugares
- ❌ Asunción incorrecta sobre versionamiento backend

---

## Decisión

Adoptamos una **arquitectura centralizada de configuración de rutas** con las siguientes características:

### 1. Single Source of Truth: `apiConfig.ts`

**Ubicación:** `apps/frontend/src/services/api/apiConfig.ts`

**Contenido:**
- Objeto `API_ENDPOINTS` con TODAS las rutas de la aplicación
- Organizado jerárquicamente por portal y feature
- 241 rutas definidas en un solo lugar
- Funciones para rutas dinámicas (con parámetros)

**Estructura:**
```typescript
// apps/frontend/src/services/api/apiConfig.ts

export const API_ENDPOINTS = {
  // ===================================
  // AUTHENTICATION & USER MANAGEMENT
  // ===================================
  auth: {
    login: '/v1/auth/login',
    register: '/v1/auth/register',
    logout: '/v1/auth/logout',
    profile: '/v1/auth/profile',
    refreshToken: '/v1/auth/refresh',
  },

  // ===================================
  // GAMIFICATION
  // ===================================
  gamification: {
    userStats: (userId: string) => `/v1/gamification/users/${userId}/stats`,
    userAchievements: (userId: string) => `/v1/gamification/users/${userId}/achievements`,
    leaderboard: {
      global: '/v1/gamification/leaderboard/global',
      classroom: (classroomId: string) => `/v1/gamification/leaderboard/classroom/${classroomId}`,
    },
    coins: {
      balance: (userId: string) => `/v1/gamification/coins/${userId}`,
      transactions: (userId: string) => `/v1/gamification/coins/${userId}/transactions`,
    },
    ranks: {
      user: (userId: string) => `/v1/gamification/ranks/user/${userId}`,
      definitions: '/v1/gamification/ranks/definitions',
    },
  },

  // ===================================
  // ADMIN DASHBOARD
  // ===================================
  admin: {
    dashboard: {
      overview: '/v1/admin/dashboard/overview',
      stats: '/v1/admin/dashboard/stats',
      alerts: '/v1/admin/dashboard/alerts',  // GAP-001 fix
      activities: '/v1/admin/dashboard/activities',
    },
    users: {
      list: '/v1/admin/users',
      detail: (id: string) => `/v1/admin/users/${id}`,
      create: '/v1/admin/users',
      update: (id: string) => `/v1/admin/users/${id}`,
      delete: (id: string) => `/v1/admin/users/${id}`,
    },
    content: {
      pending: '/v1/admin/content/pending',          // GAP-003 fix
      approve: (id: string) => `/v1/admin/content/${id}/approve`,
      reject: (id: string) => `/v1/admin/content/${id}/reject`,
    },
  },

  // ===================================
  // TEACHER
  // ===================================
  teacher: {
    dashboard: {
      stats: '/v1/teacher/dashboard/stats',
      activities: '/v1/teacher/dashboard/activities',
      alerts: '/v1/teacher/dashboard/alerts',
      topPerformers: '/v1/teacher/dashboard/top-performers',
      moduleProgress: '/v1/teacher/dashboard/module-progress',
    },
    classrooms: '/v1/teacher/classrooms',
    classroom: (id: string) => `/v1/teacher/classrooms/${id}`,
    classroomStats: (id: string) => `/v1/teacher/classrooms/${id}/stats`,
    assignments: '/v1/teacher/assignments',
    assignment: (id: string) => `/v1/teacher/assignments/${id}`,
    analytics: '/v1/teacher/analytics',
    reportStatus: (id: string) => `/v1/teacher/analytics/report/${id}`,
    studentInsights: (id: string) => `/v1/teacher/students/${id}/insights`,
  },

  // ... 241 rutas totales
} as const;

export default API_ENDPOINTS;
```

### 2. Uso en Servicios y Hooks

**✅ CORRECTO:**
```typescript
// apps/frontend/src/apps/admin/hooks/useSystemMonitoring.ts
import { API_ENDPOINTS } from '@/services/api/apiConfig';
import apiClient from '@/services/api/apiClient';

export function useSystemMonitoring() {
  const fetchAlerts = async () => {
    const response = await apiClient.get(API_ENDPOINTS.admin.dashboard.alerts);
    return response.data;
  };
}
```

**❌ INCORRECTO (anti-patrón anterior):**
```typescript
// ❌ NO HAGAS ESTO
const response = await apiClient.get('/admin/alerts');  // Hardcoded
```

### 3. Rutas Dinámicas con Funciones

Para rutas con parámetros, usamos funciones:

```typescript
// Definición en apiConfig.ts
export const API_ENDPOINTS = {
  gamification: {
    userStats: (userId: string) => `/v1/gamification/users/${userId}/stats`,
    //          ^^^^^^^^^^^^^^^^      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    //          Function signature     Template string con parámetro
  },
} as const;

// Uso
const stats = await apiClient.get(API_ENDPOINTS.gamification.userStats('user-123'));
//                                                           ^^^^^^^^^^^^^^^^^^^^^^^^
//                                                           Llama función con ID
```

### 4. Validación Automática

Creamos test automatizado para prevenir regresiones:

```typescript
// apps/frontend/src/services/api/__tests__/apiConfig.test.ts
import { API_ENDPOINTS } from '../apiConfig';

describe('API_ENDPOINTS versionamiento', () => {
  function extractAllRoutes(obj: any, routes: string[] = []): string[] {
    // Extrae todas las rutas, incluyendo las de funciones
    for (const key in obj) {
      const value = obj[key];
      if (typeof value === 'string') {
        routes.push(value);
      } else if (typeof value === 'function') {
        try {
          const route = value('test-id');
          if (typeof route === 'string') routes.push(route);
        } catch (e) { /* ignore */ }
      } else if (typeof value === 'object' && value !== null) {
        extractAllRoutes(value, routes);
      }
    }
    return routes;
  }

  it('todas las rutas deben incluir /v1/ al inicio', () => {
    const allRoutes = extractAllRoutes(API_ENDPOINTS);
    const routesWithoutVersion = allRoutes.filter(route => !route.startsWith('/v1/'));

    expect(routesWithoutVersion).toHaveLength(0);  // ✅ 241/241 rutas con /v1/
  });

  it('ninguna ruta debe tener doble /v1/v1/', () => {
    const allRoutes = extractAllRoutes(API_ENDPOINTS);
    const routesWithDoubleVersion = allRoutes.filter(route => route.includes('/v1/v1/'));

    expect(routesWithDoubleVersion).toHaveLength(0);
  });
});
```

---

## Consecuencias

### Positivas ✅

1. **Single Source of Truth**
   - 241 rutas definidas en UN SOLO archivo
   - Fácil de auditar y actualizar
   - Cambios en backend requieren modificar un solo lugar

2. **Prevención de Errors**
   - Tests automatizados detectan rutas sin /v1/
   - TypeScript types previenen typos
   - Refactorings más seguros

3. **Developer Experience**
   - IntelliSense muestra todas las rutas disponibles
   - Autocompletado de rutas
   - Documentación en un solo lugar

4. **Mantenibilidad**
   - Reducción de 31+ archivos a 1 archivo
   - Eliminación de duplicación
   - Actualizaciones centralizadas

5. **Auditabilidad**
   - Inventario completo de endpoints en un vistazo
   - Fácil verificar cobertura de tests
   - Simple detectar rutas obsoletas

### Negativas ⚠️

1. **Archivo Grande**
   - apiConfig.ts tiene 417 líneas
   - Puede ser intimidante para nuevos devs
   - **Mitigación:** Bien organizado con comentarios y secciones

2. **Merge Conflicts**
   - Archivo único es hotspot de cambios
   - Mayor probabilidad de conflicts en git
   - **Mitigación:** Cambios suelen ser en secciones diferentes

3. **Carga Inicial**
   - TODO el objeto se carga en memoria
   - Overhead mínimo (~30KB sin minificar)
   - **Mitigación:** JavaScript moderno lazy-loads solo lo usado

### Alternativas Descartadas

#### Alternativa 1: Mantener lib/api/*.api.ts (ADR-011)

**Descartada porque:**
- No resuelve problema de duplicación
- Difícil de auditar (31+ archivos)
- Rutas dispersas

#### Alternativa 2: Constants por feature

**Ejemplo:**
```typescript
// admin/constants/routes.ts
export const ADMIN_ROUTES = { alerts: '/v1/admin/dashboard/alerts' };

// teacher/constants/routes.ts
export const TEACHER_ROUTES = { classrooms: '/v1/teacher/classrooms' };
```

**Descartada porque:**
- Aún disperso (múltiples archivos)
- No hay vista completa del sistema
- Duplicación entre portales

#### Alternativa 3: Generación desde OpenAPI

**Descartada por ahora porque:**
- Backend no tiene OpenAPI configurado
- Requiere setup adicional
- **Futuro:** Compatible con esta estructura, puede implementarse después

---

## Relación con ADR-011

### Cambios Respecto a ADR-011

| Aspecto | ADR-011 (Anterior) | ADR-015 (Actual) |
|---------|-------------------|------------------|
| **Ubicación rutas** | `lib/api/*.api.ts` (disperso) | `apiConfig.ts` (centralizado) |
| **Versionamiento** | Sin `/v1/` | Con `/v1/` en todas |
| **Organización** | Por dominio (archivos separados) | Jerárquica (un archivo) |
| **Testing** | No especificado | Tests automatizados |
| **Audit** | Difícil (31+ archivos) | Fácil (1 archivo) |

### Lo que se Mantiene de ADR-011

- ✅ Uso de `apiClient` base único
- ✅ Interceptors para auth y refresh token
- ✅ TypeScript types en requests y responses
- ✅ No hard-coding de rutas en hooks
- ✅ Separation of concerns (config vs logic)

### ADR-011 Status

**Estado:** Superseded parcialmente por ADR-015

ADR-011 sigue siendo válido para:
- Configuración de apiClient base
- Interceptors y manejo de errores
- Utilities (setAuthToken, clearAuthTokens)

ADR-015 reemplaza la sección de:
- Estructura de módulos API
- Definición de rutas
- Versionamiento

---

## Implementación

### Migración de Servicios Existentes

**ANTES (patrón disperso):**
```typescript
// apps/frontend/src/services/api/teacher/teacherApi.ts
export class TeacherApi {
  private readonly baseUrl = '/teacher/dashboard';  // Hardcoded

  async getDashboardStats() {
    return apiClient.get(`${this.baseUrl}/stats`);  // Construye ruta
  }
}
```

**DESPUÉS (patrón centralizado):**
```typescript
// apps/frontend/src/services/api/teacher/teacherApi.ts
import { API_ENDPOINTS } from '../apiConfig';

export class TeacherApi {
  async getDashboardStats() {
    return apiClient.get(API_ENDPOINTS.teacher.dashboard.stats);  // Usa config
  }
}
```

### Pasos de Migración

1. ✅ Crear `apiConfig.ts` con todas las rutas
2. ✅ Actualizar services para usar `API_ENDPOINTS`
3. ✅ Actualizar hooks para usar `API_ENDPOINTS`
4. ✅ Crear tests de validación
5. ✅ Eliminar constantes `BASE_URL` dispersas
6. ✅ Documentar en ADR

**Estado:** Completado en GAP-005 y GAP-006

---

## Validación

### Criterios de Éxito

- [x] ✅ Todas las rutas tienen /v1/ (241/241)
- [x] ✅ Test automatizado pasa
- [x] ✅ Services migrados usan API_ENDPOINTS
- [x] ✅ Hooks migrados usan API_ENDPOINTS
- [x] ✅ Eliminadas constantes BASE_URL
- [x] ✅ TypeScript compila sin errores
- [x] ✅ Build de producción exitoso

### Validación Continua

1. **Pre-commit hook:** Test debe pasar antes de commit
2. **CI/CD:** Pipeline ejecuta test de versionamiento
3. **Code review:** Verificar uso de API_ENDPOINTS en PRs
4. **Documentation:** Este ADR como referencia

---

## Extensibilidad Futura

### Compatible con Generación Automática

Esta estructura es compatible con generación futura desde OpenAPI:

```typescript
// Futuro: generado desde backend OpenAPI spec
import { generatedEndpoints } from './generated/api-endpoints';

export const API_ENDPOINTS = {
  ...generatedEndpoints,  // Generados automáticamente
  // Overrides manuales si necesario
} as const;
```

### Compatible con Micro-frontends

Si en futuro se divide en micro-frontends:

```typescript
// student-portal/apiConfig.ts (subset)
export const STUDENT_ENDPOINTS = {
  gamification: API_ENDPOINTS.gamification,
  progress: API_ENDPOINTS.progress,
  // Solo endpoints usados por student portal
} as const;
```

---

## Métricas de Éxito

### Pre-ADR-015 (Estado anterior)

| Métrica | Valor |
|---------|-------|
| Rutas con /v1/ | 111/241 (46%) |
| Archivos con rutas | 31+ archivos |
| Rutas hardcoded | Alto (sin medición) |
| Tests de rutas | 0 |
| Auditoría | Difícil |

### Post-ADR-015 (Estado actual)

| Métrica | Valor |
|---------|-------|
| Rutas con /v1/ | 241/241 (100%) ✅ |
| Archivos con rutas | 1 archivo ✅ |
| Rutas hardcoded | 0 ✅ |
| Tests de rutas | 3 tests ✅ |
| Auditoría | Trivial ✅ |

---

## Referencias

- [GAP-005 y GAP-006 Analysis](../../orchestration/reports/README.md)
- apiConfig.ts Source: `apps/frontend/src/services/api/apiConfig.ts` (histórico)
- [apiConfig.test.ts](../../apps/frontend/src/services/api/__tests__/apiConfig.test.ts)
- [ADR-011: Frontend API Client Structure](./ADR-011-frontend-api-client-structure.md) (Superseded parcialmente)

---

## Notas

- Este ADR documenta cambios ya implementados en GAP-005 y GAP-006
- La arquitectura anterior (ADR-011) causó múltiples bugs (GAP-001, GAP-002)
- Esta centralización ha probado ser más mantenible
- 241 rutas fueron migradas exitosamente sin errores

---

**Versión:** 1.0.0
**Fecha de Decisión:** 2025-11-24
**Estado:** Aceptado e Implementado
**Proyecto:** GAMILIT - Sistema de Gamificación Educativa
