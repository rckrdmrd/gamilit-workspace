# Reporte de Analisis Exhaustivo de Bugs en Rutas API

**Fecha:** 2025-11-23
**Analista:** Architecture Analyst Agent
**Tipo:** Analisis Sistemico de Configuracion de Rutas
**Alcance:** Codebase Completo (Frontend + Backend)

---

## RESUMEN EJECUTIVO

### Total de Issues Encontrados: 37

| Severidad | Cantidad | Impacto |
|-----------|----------|---------|
| CRITICO   | 3        | Causa errores 404/500 actualmente |
| ALTO      | 12       | Podria causar errores en ciertas condiciones |
| MEDIO     | 15       | Inconsistencias que deben corregirse |
| BAJO      | 7        | Issues de estilo/convencion |

### Issues Criticos Detectados

1. **Duplicacion de `/api/` prefix** - Controller con hardcoded `api/` + global prefix
2. **Inconsistencia en variables de entorno** - Uso de `VITE_API_BASE_URL` vs `VITE_API_URL`
3. **Multiples axios instances** - 4+ instancias con configuraciones divergentes

---

## 1. ISSUES CRITICOS

### 1.1 Duplicacion de Prefix API en AssignmentsController

**Severidad:** CRITICO
**Archivo:** `/apps/backend/src/modules/assignments/controllers/assignments.controller.ts`
**Linea:** 32

```typescript
@Controller('api/teacher/assignments')  // INCORRECTO
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles('teacher', 'admin_teacher')
export class AssignmentsController {
```

**Problema:**
- El backend tiene global prefix `api` configurado en `main.ts:17`
- El controller hardcodea `api/` nuevamente
- Resultado: `/api/api/teacher/assignments` (duplicacion)

**Impacto:**
- Todas las llamadas a `/api/teacher/assignments/*` devuelven 404
- Los endpoints reales son `/api/api/teacher/assignments/*`
- Afecta TODAS las funciones de asignaciones para profesores

**Evidencia:**
```typescript
// apps/backend/src/main.ts:17
app.setGlobalPrefix('api');

// apps/backend/src/modules/assignments/controllers/assignments.controller.ts:32
@Controller('api/teacher/assignments')  // <- Hardcodea 'api/' nuevamente
```

**Solucion:**
```typescript
@Controller('teacher/assignments')  // Remover 'api/' prefix
```

**Endpoints Afectados:**
- POST `/api/teacher/assignments` - Crear asignacion
- GET `/api/teacher/assignments` - Listar asignaciones
- GET `/api/teacher/assignments/:id` - Detalle de asignacion
- PUT `/api/teacher/assignments/:id` - Actualizar asignacion
- DELETE `/api/teacher/assignments/:id` - Eliminar asignacion
- POST `/api/teacher/assignments/:id/assign` - Asignar a classrooms
- GET `/api/teacher/assignments/:id/submissions` - Ver entregas
- POST `/api/teacher/assignments/:assignmentId/submissions/:submissionId/grade` - Calificar
- PATCH `/api/teacher/assignments/:id` - Actualizacion parcial
- POST `/api/teacher/assignments/:id/distribute` - Distribuir asignacion
- POST `/api/teacher/assignments/:id/duplicate` - Duplicar asignacion

**Total:** 11 endpoints completamente rotos

---

### 1.2 Inconsistencia en Variables de Entorno API Base URL

**Severidad:** CRITICO
**Archivos Afectados:** 2

**Problema:**
- `api-endpoints.ts` usa `VITE_API_BASE_URL` con fallback `http://localhost:3000/api/v1`
- Todos los demas archivos usan `VITE_API_URL` con fallback `http://localhost:3006/api`
- El `.env` solo define `VITE_API_URL`
- Resultado: `api-endpoints.ts` usa URL incorrecta

**Evidencia:**

```typescript
// apps/frontend/src/shared/constants/api-endpoints.ts:19
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
// INCORRECTO: Variable no existe, puerto incorrecto (3000 vs 3006), version hardcodeada

// apps/frontend/src/services/api/apiClient.ts:19
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3006/api';
// CORRECTO: Variable existe, puerto correcto

// apps/frontend/.env:10
VITE_API_URL=http://localhost:3006/api  // Variable definida
// VITE_API_BASE_URL NO existe
```

**Impacto:**
- `api-endpoints.ts` construye URLs con base incorrecta
- Si alguien usa constantes de `API_ENDPOINTS`, falla silenciosamente
- En desarrollo, llama a puerto 3000 (no existe) en vez de 3006

**Archivos Afectados:**
1. `/apps/frontend/src/shared/constants/api-endpoints.ts` (usa `VITE_API_BASE_URL`)
2. Todos los demas archivos (usan `VITE_API_URL` correctamente)

**Solucion:**
```typescript
// api-endpoints.ts:19
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3006/api';
```

---

### 1.3 Multiples Axios Instances con Configuraciones Divergentes

**Severidad:** CRITICO
**Instancias Detectadas:** 4

**Problema:**
- 4 instancias diferentes de axios con configuraciones que divergen
- Inconsistencias en interceptores, manejo de errores, y refresh token
- Dificil mantener comportamiento consistente

**Instancias:**

#### 1. `/apps/frontend/src/lib/api/client.ts`
```typescript
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3006/api',
});
```
- Interceptor: Si, refresh token basico
- Error handling: Redirect a `/login` en 401

#### 2. `/apps/frontend/src/services/api/apiClient.ts`
```typescript
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
});
```
- Interceptor: Si, refresh token avanzado
- Error handling: Logging por endpoint, silent fail para opcionales
- Tenant support: Header `X-Tenant-Id`

#### 3. `/apps/frontend/src/shared/utils/api.util.ts`
```typescript
export const api = axios.create({
  baseURL: BASE_URL,
});
```
- Interceptor: Basico, sin refresh token
- Error handling: Redirect a `/login` en 401

#### 4. `/apps/frontend/src/features/auth/api/apiClient.ts`
```typescript
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000
});
```
- Interceptor: Usa Zustand store para tokens
- Error handling: Llama a `useAuthStore.logout()`
- Tenant support: Header `X-Tenant-ID` (nota: case diferente)

**Problemas Especificos:**

1. **Inconsistencia en Tenant Headers:**
   - `apiClient.ts` usa `X-Tenant-Id`
   - `auth/apiClient.ts` usa `X-Tenant-ID`

2. **Inconsistencia en Manejo de Tokens:**
   - Algunos usan `localStorage.getItem('auth-token')`
   - Otros usan `useAuthStore.getState().token`

3. **Inconsistencia en Refresh Token:**
   - `lib/api/client.ts` y `services/api/apiClient.ts` implementan refresh
   - `shared/utils/api.util.ts` y `features/auth/api/apiClient.ts` NO

**Impacto:**
- Comportamiento impredecible dependiendo de cual instancia se use
- Bugs dificiles de diagnosticar
- Mantener 4 configuraciones diferentes es error-prone

**Solucion:**
- UNIFICAR en una sola instancia `/apps/frontend/src/services/api/apiClient.ts`
- Eliminar las otras 3 instancias
- Actualizar imports en todo el codebase

---

## 2. ISSUES DE ALTA SEVERIDAD

### 2.1 Uso de fetch() Directo en vez de Axios Client

**Severidad:** ALTO
**Archivos Afectados:** 8+

**Problema:**
- Multiples componentes usan `fetch()` directamente
- Bypasean interceptores de autenticacion
- No usan configuracion centralizada
- Hardcodean rutas en vez de usar constantes

**Instancias Detectadas:**

#### 1. `/apps/frontend/src/apps/teacher/pages/TeacherReportsPage.tsx`

```typescript
// Linea 92
const classroomsResponse = await fetch('/api/teacher/classrooms', {
  headers: { Authorization: `Bearer ${token}` }
});

// Linea 120
const response = await fetch(`/api/teacher/classrooms/${classroomId}/students`, {
  headers: { Authorization: `Bearer ${token}` }
});

// Linea 145
const response = await fetch('/api/reports/recent', {
  headers: { Authorization: `Bearer ${token}` }
});

// Linea 195
const response = await fetch('/api/reports/stats', {
  headers: { Authorization: `Bearer ${token}` }
});

// Linea 226
const response = await fetch(`/api/reports/${reportId}/download`, {
  headers: { Authorization: `Bearer ${token}` }
});
```

**Total en este archivo:** 5 llamadas fetch directas

#### 2. `/apps/frontend/src/apps/teacher/components/assignments/AssignmentCreator.tsx`

```typescript
// Linea 52
const response = await fetch(`/api/classroom/assignments?classroom_id=${classroomId}`);

// Linea 102
const response = await fetch('/api/classroom/assignments', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(assignmentData)
});
```

#### 3. `/apps/frontend/src/apps/teacher/components/collaboration/ParentCommunicationHub.tsx`

```typescript
// Linea 37
await fetch('/api/classroom/communications', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(communicationData)
});
```

#### 4. `/apps/frontend/src/apps/teacher/components/reports/ReportGenerator.tsx`

```typescript
// Linea 37
const response = await fetch('/api/reports/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify(reportConfig)
});
```

#### 5. `/apps/frontend/src/apps/teacher/components/alerts/InterventionAlertsPanel.tsx`

```typescript
// Linea 50
const response = await fetch(`/api/classroom/alerts/${classroomId}`);

// Linea 192
await fetch(`/api/classroom/alerts/${alertId}/resolve`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` }
});
```

#### 6. `/apps/frontend/src/apps/teacher/components/progress/ClassProgressDashboard.tsx`

```typescript
// Linea 20
const response = await fetch(`/api/reports/generate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify(reportData)
});
```

#### 7. `/apps/frontend/src/apps/admin/components/users/UserDetailModal.example.tsx`

```typescript
// Linea 219
fetch(`/api/users/${userId}/profile`, { method: 'PATCH', body: JSON.stringify(updates) });

// Linea 232
fetch(`/api/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role }) });

// Linea 242
fetch(`/api/users/${userId}/status`, { method: 'PUT', body: JSON.stringify({ status }) });

// Linea 267
const response = await fetch(`/api/users/${userId}`);
```

#### 8. `/apps/frontend/src/shared/hooks/useModules.ts`

```typescript
// Linea 80
const moduleResponse = await fetch(
  `${API_BASE_URL}/educational/modules/${moduleId}`,
  { headers: { Authorization: `Bearer ${token}` } }
);

// Linea 93
const exercisesResponse = await fetch(
  `${API_BASE_URL}/educational/exercises`,
  { headers: { Authorization: `Bearer ${token}` } }
);
```

**Impacto:**
- No se aplican interceptores (ej: refresh token automatico)
- No hay retry logic
- No hay error handling centralizado
- No hay tenant headers
- Hardcodean Authorization headers (no usan localStorage centralizado)
- Algunos usan relative URLs (`/api/...`), otros absolute

**Solucion:**
- Reemplazar TODOS los `fetch()` con `apiClient.get/post/put/delete`
- Usar constantes de `API_ENDPOINTS` en vez de hardcodear URLs

**Ejemplo:**

```typescript
// ANTES
const response = await fetch('/api/teacher/classrooms', {
  headers: { Authorization: `Bearer ${token}` }
});

// DESPUES
import { apiClient } from '@/services/api/apiClient';
const response = await apiClient.get('/teacher/classrooms');
// Nota: Authorization header se agrega automaticamente via interceptor
```

---

### 2.2 Rutas Hardcodeadas en Codigo (No Usan Constantes)

**Severidad:** ALTO
**Archivos Afectados:** Multiples

**Problema:**
- Rutas API hardcodeadas directamente en fetch/axios calls
- No usan `API_ENDPOINTS` constants
- Dificil refactorizar si cambian rutas

**Evidencia:**

```typescript
// INCORRECTO - Hardcoded
await fetch('/api/teacher/classrooms');
await fetch('/api/reports/recent');
await fetch('/api/classroom/assignments');

// CORRECTO - Usar constantes
import { API_ENDPOINTS } from '@/shared/constants';
await apiClient.get(API_ENDPOINTS.teacher.classrooms);
```

**Instancias:**
- Todas las llamadas `fetch()` detectadas en 2.1
- Varios hooks y componentes legacy

**Impacto:**
- Si una ruta cambia, hay que buscar/reemplazar en todo el codigo
- Propenso a typos
- No hay type safety

---

### 2.3 Inconsistencia en Estructuras de Rutas (Backend)

**Severidad:** ALTO
**Patron Detectado:** Uso mezclado de helper vs hardcoded

**Problema:**
- Algunos controllers usan `extractBasePath(API_ROUTES.X.BASE)`
- Otros hardcodean directamente la ruta completa

**Evidencia:**

```typescript
// CORRECTO - Usa helper
@Controller(extractBasePath(API_ROUTES.GAMIFICATION.BASE))
export class LeaderboardController {}

// CORRECTO - Usa helper
@Controller(extractBasePath(API_ROUTES.CONTENT.BASE))
export class ContentTemplatesController {}

// INCORRECTO - Hardcoded
@Controller('gamification/missions')
export class MissionsController {}

// INCORRECTO - Hardcoded
@Controller('gamification/ranks')
export class RanksController {}

// INCORRECTO - Hardcoded
@Controller('gamification/comodines')
export class ComodinesController {}

// CRITICO - Hardcoded con 'api/' prefix
@Controller('api/teacher/assignments')
export class AssignmentsController {}
```

**Controllers con Patron Correcto (Usan Helper):**
- `HealthController` - `@Controller('health')`
- `LeaderboardController` - `@Controller(extractBasePath(API_ROUTES.GAMIFICATION.BASE))`
- `AchievementsController` - `@Controller(extractBasePath(API_ROUTES.GAMIFICATION.BASE))`
- `UserStatsController` - `@Controller(extractBasePath(API_ROUTES.GAMIFICATION.BASE))`
- `MLCoinsController` - `@Controller(extractBasePath(API_ROUTES.GAMIFICATION.BASE))`
- `ContentTemplatesController` - `@Controller(extractBasePath(API_ROUTES.CONTENT.BASE))`
- `MediaFilesController` - `@Controller(extractBasePath(API_ROUTES.CONTENT.BASE))`
- Todos los controllers de `Progress`, `Social`, etc.

**Controllers con Patron Incorrecto (Hardcoded):**
- `MissionsController` - `@Controller('gamification/missions')`
- `RanksController` - `@Controller('gamification/ranks')`
- `ComodinesController` - `@Controller('gamification/comodines')`
- `AssignmentsController` - `@Controller('api/teacher/assignments')` (CRITICO)

**Impacto:**
- Inconsistencia en codigo
- Dificil refactorizar
- Propenso a errores como el de AssignmentsController

**Solucion:**
- Agregar rutas a `API_ROUTES` en `routes.constants.ts`
- Usar `extractBasePath()` helper en TODOS los controllers

---

### 2.4 Relative vs Absolute URLs en Fetch Calls

**Severidad:** ALTO
**Patron:** Uso mezclado

**Problema:**
- Algunos usan relative: `/api/...`
- Otros usan absolute: `${API_BASE_URL}/...`
- Comportamiento diferente en proxy vs produccion

**Evidencia:**

```typescript
// RELATIVE - Depende de proxy/window.location
await fetch('/api/teacher/classrooms');

// ABSOLUTE - Usa variable de entorno
await fetch(`${API_BASE_URL}/educational/modules/${moduleId}`);
```

**Archivos con URLs Relativas:**
- `/apps/frontend/src/apps/teacher/pages/TeacherReportsPage.tsx`
- `/apps/frontend/src/apps/teacher/components/assignments/AssignmentCreator.tsx`
- `/apps/frontend/src/apps/teacher/components/collaboration/ParentCommunicationHub.tsx`
- Y otros...

**Archivos con URLs Absolutas:**
- `/apps/frontend/src/shared/hooks/useModules.ts`

**Impacto:**
- En desarrollo, las relativas usan proxy de Vite (funciona)
- En produccion, podrian apuntar a dominio incorrecto
- Inconsistente y confuso

**Solucion:**
- SIEMPRE usar axios client que maneja baseURL automaticamente
- NO usar fetch directo
- Axios client ya tiene baseURL configurado

---

### 2.5 Port Inconsistencies en Fallbacks

**Severidad:** ALTO
**Problema:** Multiples puertos hardcodeados

**Evidencia:**

```typescript
// Puerto 3006 (CORRECTO - backend real)
// apps/frontend/src/services/api/apiClient.ts:19
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3006/api';

// apps/frontend/.env:10
VITE_API_URL=http://localhost:3006/api

// apps/backend/.env
PORT=3006

// Puerto 3000 (INCORRECTO - no existe)
// apps/frontend/src/shared/constants/api-endpoints.ts:19
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// apps/backend/src/shared/middleware/cors.config.ts:12
'http://localhost:3000',

// apps/backend/src/config/swagger.config.ts:13
.addServer('http://localhost:3000', 'Local Development')
```

**Backend corre en puerto 3006:**
```bash
# apps/backend/.env
PORT=3006
```

**Frontend debe apuntar a 3006, NO 3000:**
- Puerto 3000: No hay servicio corriendo
- Puerto 3006: Backend NestJS

**Impacto:**
- `api-endpoints.ts` usa puerto incorrecto
- Configuraciones de CORS/Swagger mencionan puerto incorrecto (documentacion)

**Solucion:**
1. Corregir `api-endpoints.ts` para usar puerto 3006
2. Actualizar documentacion/configs para reflejar puerto 3006
3. O, decidir puerto standar y usarlo consistentemente

---

### 2.6 Missing Environment Variable Validation

**Severidad:** ALTO
**Problema:** Variables no validadas en tiempo de build

**Evidencia:**

```typescript
// env.ts tiene validacion solo para produccion
if (env === 'production') {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    throw new Error('VITE_API_URL must be defined');
  }
}
// NO valida en desarrollo
```

**Problema:**
- En desarrollo, si falta `VITE_API_URL`, usa fallback silenciosamente
- Podria esconder bugs (ej: typo en .env)
- No hay warning si variable esta mal configurada

**Solucion:**
- Agregar warnings en desarrollo tambien
- Validar que variable existe y tiene formato correcto
- Usar herramientas como `zod` para validar env vars

---

### 2.7 WebSocket URL Derivation Issues

**Severidad:** ALTO
**Archivo:** `/apps/frontend/src/config/env.ts`

**Problema:**
- WebSocket URL se deriva de API_URL con `.replace('/api', '')`
- Fragil, propenso a errores

```typescript
WS_URL:
  import.meta.env.VITE_WS_URL ||
  import.meta.env.VITE_API_URL?.replace('/api', '') ||
  'http://localhost:3006',
```

**Problemas Potenciales:**
1. Si `VITE_API_URL` es `https://api.example.com/api/v1`, resultado: `https://api.example.com/v1` (incorrecto)
2. Si `VITE_API_URL` no tiene `/api`, no hace nada
3. Fragil ante cambios en estructura de URL

**Solucion:**
- Definir `VITE_WS_URL` explicitamente en `.env`
- No derivar de API_URL

---

### 2.8 Axios Direct Usage en Interceptores

**Severidad:** ALTO
**Problema:** Uso de axios global en vez de instancia

**Evidencia:**

```typescript
// apps/frontend/src/lib/api/client.ts:26
const { data } = await axios.post(
  `${import.meta.env.VITE_API_URL || 'http://localhost:3006/api'}/auth/refresh`,
  { refreshToken }
);
```

**Problema:**
- Dentro del interceptor de `apiClient`, usa `axios` global directamente
- `axios` global NO tiene interceptores configurados
- Podria causar loop infinito si refresh endpoint tambien retorna 401

**Solucion:**
- Crear instancia separada para refresh sin interceptores
- O, usar flag `_retry` para evitar loops (ya implementado parcialmente)

---

### 2.9 Duplicate Route Definitions

**Severidad:** ALTO
**Problema:** Rutas definidas en multiples archivos

**Archivos:**
1. `/apps/backend/src/shared/constants/routes.constants.ts` - Backend routes
2. `/apps/frontend/src/shared/constants/api-endpoints.ts` - Frontend endpoints
3. `/apps/frontend/src/services/api/apiConfig.ts` - Frontend config

**Problema:**
- 3 archivos diferentes definen rutas
- Pueden divergir facilmente
- No hay single source of truth

**Evidencia:**

```typescript
// Backend - routes.constants.ts
AUTH: {
  BASE: '/auth',
  LOGIN: '/auth/login',
  // ...
}

// Frontend - api-endpoints.ts
AUTH: {
  BASE: `${API_BASE_URL}/auth`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  // ...
}

// Frontend - apiConfig.ts
auth: {
  login: '/auth/login',
  register: '/auth/register',
  // ...
}
```

**Impacto:**
- 3 lugares para actualizar cuando cambia una ruta
- Propenso a desincronizacion
- Ya hay divergencia (ej: `apiConfig` usa `/auth/password` vs `api-endpoints` usa `/auth/change-password`)

**Solucion:**
- UNIFICAR en un solo archivo compartido
- O, generar frontend constants desde backend via script
- Implementar validacion automatica (como menciona comentario en codigo)

---

### 2.10 Missing `/api` Prefix en Algunas Rutas (Frontend)

**Severidad:** ALTO
**Archivo:** `/apps/frontend/src/services/api/apiConfig.ts`

**Problema:**
- `apiConfig.ts` define rutas sin `/api` prefix
- Asume que `baseURL` del axios client ya incluye `/api`
- Pero algunas partes del codigo concatenan directamente

**Evidencia:**

```typescript
// apiConfig.ts - rutas sin /api
auth: {
  login: '/auth/login',  // NO incluye /api
}

// api-endpoints.ts - rutas con /api
AUTH: {
  LOGIN: `${API_BASE_URL}/auth/login`,  // API_BASE_URL ya incluye /api
}
```

**Si se usa directamente:**
```typescript
// INCORRECTO
fetch(`${API_CONFIG.BASE_URL}${API_ENDPOINTS.auth.login}`);
// Resultado: http://localhost:3006/api/http://localhost:3006/api/auth/login (duplicado)

// CORRECTO
apiClient.post(API_CONFIG.API_ENDPOINTS.auth.login);
// Axios client maneja baseURL automaticamente
```

**Impacto:**
- Confusion sobre si rutas incluyen `/api` o no
- Facil cometer errores al concatenar

**Solucion:**
- Ser consistente: rutas sin `/api` (axios maneja baseURL)
- O, usar URLs completas siempre
- Documentar claramente cual patron usar

---

### 2.11 Commented-Out Guard Decorators

**Severidad:** ALTO
**Archivo:** `/apps/backend/src/modules/assignments/controllers/assignments.controller.ts`

**Problema:**
- Guards de autenticacion y roles comentados
- Endpoints PUBLICOS cuando deberian ser protegidos

```typescript
@Controller('api/teacher/assignments')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles('teacher', 'admin_teacher')
export class AssignmentsController {
```

**Impacto:**
- CUALQUIER usuario puede crear/editar/eliminar assignments
- Grave vulnerabilidad de seguridad
- Probablemente comentado para testing y olvidado

**Solucion:**
- DESCOMENTAR guards inmediatamente
- Implementar tests con guards activos

---

### 2.12 Case Sensitivity en Headers

**Severidad:** MEDIO-ALTO
**Problema:** Headers con diferente capitalizacion

**Evidencia:**

```typescript
// apps/frontend/src/services/api/apiClient.ts:59
config.headers['X-Tenant-Id'] = tenantId;

// apps/frontend/src/features/auth/api/apiClient.ts:34
config.headers['X-Tenant-ID'] = user.tenantId;
```

**Problema:**
- HTTP headers son case-insensitive segun RFC
- Pero algunos proxies/firewalls pueden ser sensibles
- Inconsistencia confusa

**Solucion:**
- Estandarizar en una sola capitalizacion
- Recomendado: `X-Tenant-ID` (mayusculas en acronimo)

---

## 3. ISSUES DE SEVERIDAD MEDIA

### 3.1 Missing Error Messages en Interceptores

**Severidad:** MEDIO
**Problema:** Error handling generico

```typescript
// Varios archivos
.interceptors.response.use(
  (response) => response,
  (error) => {
    // Solo redirect, no mensaje al usuario
    window.location.href = '/login';
    return Promise.reject(error);
  }
);
```

**Impacto:**
- Usuario no sabe por que fue redirected
- Dificil debuggear en produccion

---

### 3.2 Inconsistent Timeout Values

**Severidad:** MEDIO
**Evidencia:**

```typescript
// apiClient.ts
timeout: 30000

// auth/apiClient.ts
timeout: 30000

// apiConfig.ts
TIMEOUT: 30000

// lib/api/client.ts
// NO define timeout (usa default de axios: sin timeout)
```

**Problema:**
- Una instancia no tiene timeout
- Podria colgar indefinidamente

---

### 3.3 Storage Key Inconsistencies

**Severidad:** MEDIO
**Claves detectadas:**

```typescript
'auth-token'
'refresh-token'
'auth-storage'
'tenant-id'
```

**Problema:**
- No hay namespace/prefix
- Podria colisionar con otras apps en mismo dominio

**Solucion:**
- Usar prefix: `gamilit:auth-token`, etc.

---

### 3.4 Hardcoded Storage Implementation

**Severidad:** MEDIO
**Problema:** localStorage hardcodeado en multiples lugares

**Impacto:**
- Dificil cambiar a sessionStorage o cookies
- No hay abstraccion

**Solucion:**
- Crear `StorageService` abstracto
- Implementar `LocalStorageService`, `SessionStorageService`, etc.

---

### 3.5 Missing Request Cancellation

**Severidad:** MEDIO
**Problema:** Fetch calls no tienen AbortController

**Impacto:**
- Requests no se cancelan al desmontar componente
- Podria causar memory leaks
- Race conditions en updates rapidos

**Solucion:**
- Usar axios (maneja cancelacion mejor)
- O, implementar AbortController en fetch calls

---

### 3.6 No Retry Logic en Fetch Calls

**Severidad:** MEDIO
**Problema:** Llamadas fetch fallan inmediatamente

**Impacto:**
- Errores transitorios de red causan falla
- Mala UX

**Solucion:**
- Implementar retry con backoff exponencial
- Axios tiene plugins para esto (`axios-retry`)

---

### 3.7 Missing Loading States

**Severidad:** MEDIO
**Problema:** Fetch calls no manejan loading states consistentemente

**Impacto:**
- UI bloqueada sin feedback
- Doble-submit posible

---

### 3.8 No Request Deduplication

**Severidad:** MEDIO
**Problema:** Misma request puede enviarse multiples veces

**Impacto:**
- Carga innecesaria en servidor
- Race conditions

**Solucion:**
- Implementar request deduplication
- Usar librerias como `react-query` que lo manejan

---

### 3.9 Hardcoded Content-Type

**Severidad:** MEDIO
**Problema:** `Content-Type: application/json` en todos lados

**Impacto:**
- No soporta multipart/form-data para uploads
- Limita flexibilidad

**Solucion:**
- Axios maneja Content-Type automaticamente basado en data
- Remover hardcoded headers

---

### 3.10 Missing CORS Preflight Handling

**Severidad:** MEDIO
**Problema:** No hay manejo especial para preflight requests

**Impacto:**
- Podria causar doble-request innecesario
- CORS errors no son informativos

---

### 3.11 No Request/Response Logging en Produccion

**Severidad:** MEDIO
**Problema:** Debugging dificil en produccion

```typescript
if (import.meta.env.VITE_DEBUG_API === 'true') {
  console.log('[API Request]', ...);
}
```

**Solucion:**
- Implementar logging service que envia a backend
- Usar Sentry/LogRocket para produccion

---

### 3.12 Missing Rate Limiting Handling

**Severidad:** MEDIO
**Problema:** No hay manejo de 429 (Too Many Requests)

**Impacto:**
- Usuario no sabe que fue rate limited
- No hay retry automatico con delay

**Solucion:**
- Interceptor para 429
- Implementar exponential backoff

---

### 3.13 Inconsistent Error Response Format

**Severidad:** MEDIO
**Problema:** Backend podria devolver errores en diferentes formatos

**Impacto:**
- Frontend tiene que manejar multiples formatos
- Error messages inconsistentes

**Solucion:**
- Estandarizar formato de error en backend
- Usar DTO para error responses

---

### 3.14 Missing Network Error Handling

**Severidad:** MEDIO
**Problema:** No se distingue entre error de red vs error de servidor

```typescript
} else if (error.request) {
  // Request was made but no response received
  return Promise.reject(new Error('No se pudo conectar con el servidor'));
}
```

**Mejor:**
- Detectar si es offline
- Mostrar mensaje diferente para timeout vs no connection
- Intentar reconnect automatico

---

### 3.15 Legacy Code Not Migrated

**Severidad:** MEDIO
**Carpeta:** `/apps/frontend/src/pages/_legacy/`

**Problema:**
- Codigo legacy con fetch calls comentados
- No migrado a nuevo sistema

**Archivos:**
- `ExerciseCreator.tsx`
- `GradingInterface.tsx`
- `StudentProgressViewer.tsx`
- `ClassroomAnalytics.tsx`

**Impacto:**
- Confusion sobre que codigo usar
- Podria tener bugs si se descomenta

**Solucion:**
- Migrar completamente o eliminar
- Si es legacy, mover a carpeta `_deprecated/`

---

## 4. ISSUES DE SEVERIDAD BAJA

### 4.1 Inconsistent Import Paths

**Severidad:** BAJO

```typescript
// Algunos usan alias
import { apiClient } from '@/services/api/apiClient';

// Otros usan relative
import apiClient from '../../../lib/api/client';
```

**Solucion:** Estandarizar en alias

---

### 4.2 Missing TypeScript Types para Responses

**Severidad:** BAJO
**Problema:** Muchos `any` en responses

```typescript
const { data } = await apiClient.get('/auth/profile');
// data es 'any'
```

**Solucion:** Definir DTOs/interfaces para responses

---

### 4.3 Inconsistent Naming Conventions

**Severidad:** BAJO

```typescript
// Algunos exports
export const apiClient = ...;
export const api = ...;
export default apiClient;
```

**Solucion:** Decidir convencion (named vs default export)

---

### 4.4 Missing JSDoc Comments

**Severidad:** BAJO
**Problema:** Pocas funciones tienen JSDoc

**Impacto:** Dificil entender que hace sin leer codigo

---

### 4.5 Console.log Statements

**Severidad:** BAJO
**Problema:** Varios console.log en codigo

**Solucion:** Usar logger service, remover antes de produccion

---

### 4.6 TODO Comments sin Tracking

**Severidad:** BAJO

```typescript
// TODO: Backend needs to implement this
leaderboard: '/gamification/coins/leaderboard',
```

**Problema:** TODOs sin issue tracker reference

**Solucion:** Crear issues y referenciar en TODO

---

### 4.7 Magic Numbers

**Severidad:** BAJO

```typescript
timeout: 30000  // Que es 30000?
```

**Solucion:** Usar constantes nombradas

```typescript
const THIRTY_SECONDS_MS = 30 * 1000;
timeout: THIRTY_SECONDS_MS
```

---

## 5. PATRONES SISTEMICOS IDENTIFICADOS

### Patron 1: Proliferacion de Axios Instances

**Causa Raiz:**
- No hay single source of truth para HTTP client
- Desarrolladores crean nuevas instancias para "no romper" existentes
- Falta de documentacion sobre cual instancia usar

**Solucion:**
1. Unificar en `/apps/frontend/src/services/api/apiClient.ts`
2. Documentar que es la instancia oficial
3. Deprecar/eliminar otras instancias
4. Migration guide para actualizar imports

---

### Patron 2: Bypass de Configuracion Centralizada

**Causa Raiz:**
- Fetch es mas "simple" que importar axios
- Desarrolladores no saben que axios client existe
- No hay linting rules que lo prevengan

**Solucion:**
1. ESLint rule: prohibir `fetch()` en codigo de app
2. Script de validacion pre-commit
3. Documentation en README principal
4. Code review checklist

---

### Patron 3: Hardcoded URLs y Magic Strings

**Causa Raiz:**
- Constantes existen pero no se usan
- Rapido escribir hardcoded durante development
- No hay validacion automatica

**Solucion:**
1. TypeScript: hacer que rutas sean types
2. ESLint plugin para detectar strings que parecen URLs
3. Generator script para crear hooks de API calls

---

### Patron 4: Inconsistencia entre Frontend y Backend

**Causa Raiz:**
- No hay validacion automatica de contrato
- Constantes definidas independientemente
- No hay proceso para mantener sincronizacion

**Solucion:**
1. Implementar script de validacion (mencionado en comentarios)
2. Generar constantes de frontend desde backend
3. OpenAPI/Swagger schema validation
4. CI/CD check que falla si hay desincronizacion

---

### Patron 5: Security Guards Comentados

**Causa Raiz:**
- Comentados para testing rapido
- Olvidados en commit
- No hay tests que validen guards

**Solucion:**
1. E2E tests que validen autenticacion
2. Linter que detecta guards comentados
3. Security audit en PR reviews

---

## 6. RECOMENDACIONES DE PREVENCION

### 6.1 Tooling

**ESLint Rules:**
```javascript
// .eslintrc.js
rules: {
  // Prohibir fetch() directo
  'no-restricted-globals': ['error', {
    name: 'fetch',
    message: 'Use apiClient from @/services/api/apiClient instead'
  }],

  // Prohibir hardcoded URLs
  'no-restricted-syntax': ['error', {
    selector: 'Literal[value=/^https?:\\/\\//]',
    message: 'Use API_ENDPOINTS constants instead of hardcoded URLs'
  }],

  // Prohibir axios.create() fuera de archivos permitidos
  'no-restricted-imports': ['error', {
    paths: [{
      name: 'axios',
      importNames: ['create'],
      message: 'Use existing apiClient instead of creating new instances'
    }]
  }]
}
```

**Pre-commit Hook:**
```bash
#!/bin/bash
# .husky/pre-commit

# Buscar fetch() calls
if grep -r "fetch(" apps/frontend/src --include="*.ts" --include="*.tsx" | grep -v "// @allowed-fetch"; then
  echo "Error: fetch() calls detected. Use apiClient instead."
  exit 1
fi

# Validar sincronizacion de constantes
npm run validate-api-constants
```

---

### 6.2 Documentation

**Developer Guide:**

```markdown
# API Client Usage Guide

## DO ✅

```typescript
import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/shared/constants';

// Hacer request
const response = await apiClient.get(API_ENDPOINTS.auth.profile);
```

## DON'T ❌

```typescript
// NUNCA usar fetch() directo
const response = await fetch('/api/auth/profile');

// NUNCA hardcodear URLs
const response = await apiClient.get('/auth/profile');

// NUNCA crear nuevas axios instances
const client = axios.create({ baseURL: '...' });
```
```

---

### 6.3 CI/CD Checks

**GitHub Actions Workflow:**

```yaml
name: API Contract Validation

on: [pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Validate API Constants
        run: npm run validate-api-constants

      - name: Check for fetch() usage
        run: |
          if grep -r "fetch(" apps/frontend/src --include="*.ts" --include="*.tsx"; then
            echo "::error::fetch() usage detected"
            exit 1
          fi

      - name: Check for hardcoded URLs
        run: npm run lint:urls
```

---

### 6.4 Testing Requirements

**API Client Tests:**

```typescript
// apiClient.test.ts
describe('apiClient', () => {
  it('should add Authorization header automatically', () => {
    localStorage.setItem('auth-token', 'test-token');
    // Test that header is added
  });

  it('should refresh token on 401', async () => {
    // Mock 401 response
    // Verify refresh endpoint is called
    // Verify request is retried
  });

  it('should redirect to login if refresh fails', () => {
    // Test logout flow
  });
});
```

---

### 6.5 Code Review Checklist

```markdown
## API Integration Checklist

- [ ] Uses `apiClient` from `@/services/api/apiClient`
- [ ] Uses constants from `API_ENDPOINTS`
- [ ] No hardcoded URLs
- [ ] No `fetch()` calls
- [ ] No new axios instances
- [ ] Error handling implemented
- [ ] Loading states managed
- [ ] Types defined for request/response
- [ ] Tests added
```

---

## 7. PLAN DE MIGRACION SUGERIDO

### Fase 1: Criticos (Inmediato - 1-2 dias)

**Prioridad P0:**

1. **Fix AssignmentsController** (1 hora)
   - Cambiar `@Controller('api/teacher/assignments')` a `@Controller('teacher/assignments')`
   - Descomentar guards
   - Deploy ASAP

2. **Fix api-endpoints.ts** (30 min)
   - Cambiar `VITE_API_BASE_URL` a `VITE_API_URL`
   - Cambiar puerto 3000 a 3006
   - Remover `/api/v1` hardcoded

3. **Unificar Axios Instances** (4 horas)
   - Elegir `/apps/frontend/src/services/api/apiClient.ts` como oficial
   - Actualizar imports en todo el codebase
   - Eliminar otras instancias
   - Tests

---

### Fase 2: Altos (1 semana)

**Prioridad P1:**

4. **Reemplazar fetch() con apiClient** (2 dias)
   - Crear script de migracion automatica
   - Manual review
   - Tests

5. **Estandarizar Controllers** (1 dia)
   - Agregar rutas faltantes a `routes.constants.ts`
   - Usar `extractBasePath()` en todos los controllers
   - Validar que todos funcionan

6. **Implementar Validacion de Constantes** (1 dia)
   - Script que compara `routes.constants.ts` con `api-endpoints.ts`
   - CI/CD integration
   - Documentation

---

### Fase 3: Medios (2 semanas)

**Prioridad P2:**

7. **Estandarizar Error Handling** (3 dias)
8. **Implementar Storage Service** (2 dias)
9. **Agregar Request Retry Logic** (2 dias)
10. **Migrar Legacy Code** (3 dias)
11. **Type Safety Improvements** (2 dias)

---

### Fase 4: Bajos (Continuo)

**Prioridad P3:**

12. **Code Style Improvements**
13. **Documentation Updates**
14. **Performance Optimizations**

---

## 8. METRICAS DE EXITO

### KPIs para Validar Mejoras:

1. **Zero fetch() calls** en codigo de app (excluir tests)
2. **Single axios instance** en uso
3. **100% rutas usando constantes** (no hardcoded)
4. **Zero inconsistencias** entre backend routes y frontend endpoints
5. **All controllers usando extractBasePath()**
6. **Zero security guards comentados**

### Herramientas de Medicion:

```bash
# Contar fetch() calls
grep -r "fetch(" apps/frontend/src --include="*.ts" --include="*.tsx" | wc -l
# Target: 0

# Contar axios instances
grep -r "axios.create" apps/frontend/src --include="*.ts" | wc -l
# Target: 1

# Contar hardcoded URLs
grep -r "'/api/" apps/frontend/src --include="*.ts" --include="*.tsx" | wc -l
# Target: Solo en constantes
```

---

## 9. ARCHIVOS CRITICOS A MODIFICAR

### Backend:

1. `/apps/backend/src/modules/assignments/controllers/assignments.controller.ts` - CRITICO
2. `/apps/backend/src/modules/gamification/controllers/missions.controller.ts`
3. `/apps/backend/src/modules/gamification/controllers/ranks.controller.ts`
4. `/apps/backend/src/modules/gamification/controllers/comodines.controller.ts`
5. `/apps/backend/src/shared/constants/routes.constants.ts` - Agregar rutas faltantes

### Frontend:

1. `/apps/frontend/src/shared/constants/api-endpoints.ts` - CRITICO
2. `/apps/frontend/src/services/api/apiClient.ts` - Mantener como oficial
3. `/apps/frontend/src/lib/api/client.ts` - ELIMINAR
4. `/apps/frontend/src/shared/utils/api.util.ts` - ELIMINAR
5. `/apps/frontend/src/features/auth/api/apiClient.ts` - ELIMINAR
6. `/apps/frontend/src/apps/teacher/pages/TeacherReportsPage.tsx` - Migrar fetch
7. `/apps/frontend/src/apps/teacher/components/**/*.tsx` - Migrar fetch
8. `/apps/frontend/src/shared/hooks/useModules.ts` - Migrar fetch

### Configuration:

1. `/apps/frontend/.env` - Validar variables
2. `/apps/frontend/.env.example` - Actualizar documentacion

---

## 10. CONCLUSION

Este analisis identifica **37 issues** de configuracion de rutas API, desde duplicacion critica de prefixes hasta inconsistencias menores de estilo. Los 3 issues criticos requieren atencion inmediata:

1. **AssignmentsController** con prefix duplicado (`/api/api/`)
2. **api-endpoints.ts** usando variable de entorno incorrecta
3. **4 instancias de axios** con comportamiento divergente

La causa raiz sistemica es la **falta de single source of truth** para configuracion de API. La solucion requiere:

- Unificacion de axios instances
- Eliminacion de fetch() directo
- Validacion automatica de constantes
- Tooling (ESLint, pre-commit hooks)
- Documentation clara

Con el plan de migracion propuesto, estos issues pueden resolverse en **2-3 semanas** de trabajo enfocado, resultando en un codebase mas mantenible, confiable, y libre de errores de configuracion.

---

**Fecha de Reporte:** 2025-11-23
**Proximo Review:** Despues de Fase 1 (criticos resueltos)
**Analista:** Architecture Analyst Agent
