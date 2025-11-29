# ESTÁNDARES DE RUTAS Y CONFIGURACIÓN DE API

**Versión:** 1.0.0
**Fecha:** 2025-11-29
**Fuente:** Consolidado desde orchestration/directivas/ESTANDARES-API-ROUTES.md
**Audiencia:** Backend y Frontend developers

---

## PROBLEMA QUE RESUELVE

Prevenir bugs de rutas duplicadas que generan URLs incorrectas del tipo `/api/api/endpoint` en lugar de `/api/endpoint`. Este problema surge por:

1. Configuración incorrecta de baseURL en cliente API
2. Duplicación de prefijo `/api` entre baseURL y endpoints
3. Falta de estándares claros sobre separación de responsabilidades
4. Inconsistencia entre configuración backend y frontend

---

## SEPARACIÓN DE RESPONSABILIDADES

### Regla Fundamental

```yaml
baseURL: Define el protocolo, dominio, puerto y prefijo global (/api)
endpoint: Define solo la ruta específica del recurso (sin prefijos globales)
```

### Responsabilidades Claras

```typescript
// ✅ CORRECTO - Separación clara

// baseURL contiene:
// - Protocolo (http:// o https://)
// - Dominio/host (localhost, api.gamilit.com)
// - Puerto (si no es default)
// - Prefijo global de API (/api)
const baseURL = 'http://localhost:3000/api';

// endpoint contiene SOLO:
// - Ruta del recurso
// - Sin protocolo, sin dominio, sin puerto
// - Sin prefijo /api
const endpoint = '/health';
const endpoint = '/users';
const endpoint = '/exercises/123';
```

---

## CONFIGURACIÓN DE API CLIENT

### Configuración Correcta con Axios

```typescript
// ✅ CORRECTO - apps/frontend/web/src/lib/apiClient.ts

import axios from 'axios';

/**
 * API Client Configuration
 *
 * baseURL incluye:
 * - Protocolo + dominio + puerto (desde env)
 * - Prefijo global /api
 *
 * Los endpoints NO deben repetir /api
 */
export const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  // Ejemplo real: 'http://localhost:3000/api'
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors para logging (opcional)
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    // URL final será: baseURL + url
    // Ejemplo: 'http://localhost:3000/api' + '/health' = 'http://localhost:3000/api/health'
    return config;
  },
  (error) => Promise.reject(error)
);
```

### Variables de Entorno

```env
# ✅ CORRECTO - .env (frontend)

# Base URL SIN el prefijo /api
VITE_API_URL=http://localhost:3000

# El prefijo /api se agrega en la configuración del cliente
# NO en la variable de entorno
```

```env
# ❌ INCORRECTO - NO incluir /api en env
VITE_API_URL=http://localhost:3000/api  # ❌ NO HACER ESTO
```

---

## DEFINICIÓN DE ENDPOINTS

### Servicios de API (Frontend)

```typescript
// ✅ CORRECTO - apps/frontend/web/src/services/exerciseService.ts

import { apiClient } from '@/lib/apiClient';

export const exerciseService = {
  /**
   * Get all exercises
   * GET /api/exercises
   */
  async findAll() {
    // endpoint sin /api porque baseURL ya lo incluye
    const response = await apiClient.get('/exercises');
    return response.data;
  },

  /**
   * Get exercise by ID
   * GET /api/exercises/:id
   */
  async findById(id: string) {
    const response = await apiClient.get(`/exercises/${id}`);
    return response.data;
  },

  /**
   * Submit exercise answer
   * POST /api/exercises/:id/submit
   */
  async submitAnswer(id: string, answer: SubmitAnswerDto) {
    const response = await apiClient.post(`/exercises/${id}/submit`, answer);
    return response.data;
  },
};
```

```typescript
// ❌ INCORRECTO - NO duplicar /api

export const exerciseService = {
  async findAll() {
    // ❌ INCORRECTO: genera /api/api/exercises
    const response = await apiClient.get('/api/exercises');
    return response.data;
  },
};
```

### Endpoints con Parámetros

```typescript
// ✅ CORRECTO - Endpoints con parámetros

export const userService = {
  async findById(userId: string) {
    // GET /api/users/123
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  async searchUsers(query: string, page: number = 1) {
    // GET /api/users?q=john&page=1
    const response = await apiClient.get('/users', {
      params: { q: query, page },
    });
    return response.data;
  },
};
```

### Endpoints Anidados

```typescript
// ✅ CORRECTO - Recursos anidados

export const classroomService = {
  // GET /api/classrooms/123/students
  async getStudents(classroomId: string) {
    const response = await apiClient.get(`/classrooms/${classroomId}/students`);
    return response.data;
  },

  // POST /api/classrooms/123/assignments
  async createAssignment(classroomId: string, data: CreateAssignmentDto) {
    const response = await apiClient.post(
      `/classrooms/${classroomId}/assignments`,
      data
    );
    return response.data;
  },

  // GET /api/classrooms/123/assignments/456/submissions
  async getSubmissions(classroomId: string, assignmentId: string) {
    const response = await apiClient.get(
      `/classrooms/${classroomId}/assignments/${assignmentId}/submissions`
    );
    return response.data;
  },
};
```

---

## CONFIGURACIÓN BACKEND (NestJS)

### Prefijo Global de API

```typescript
// ✅ CORRECTO - apps/backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api');

  await app.listen(3000);
  console.log('API running on http://localhost:3000/api');
}
bootstrap();
```

### Controladores

```typescript
// ✅ CORRECTO - apps/backend/src/modules/exercises/exercises.controller.ts

import { Controller, Get, Post, Body, Param } from '@nestjs/common';

/**
 * Exercises Controller
 *
 * Ruta base: /exercises (sin /api porque se agrega globalmente)
 * Rutas finales:
 * - GET /api/exercises
 * - GET /api/exercises/:id
 * - POST /api/exercises/:id/submit
 */
@Controller('exercises')  // ✅ Sin prefijo /api
export class ExercisesController {

  @Get()
  async findAll() {
    // Ruta final: GET /api/exercises
    return this.exercisesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    // Ruta final: GET /api/exercises/:id
    return this.exercisesService.findById(id);
  }

  @Post(':id/submit')
  async submitAnswer(
    @Param('id') id: string,
    @Body() dto: SubmitAnswerDto
  ) {
    // Ruta final: POST /api/exercises/:id/submit
    return this.exercisesService.submitAnswer(id, dto);
  }
}
```

```typescript
// ❌ INCORRECTO - NO incluir /api en @Controller

@Controller('api/exercises')  // ❌ Genera /api/api/exercises
export class ExercisesController {
  // ...
}
```

### Organización de Rutas

```typescript
// ✅ CORRECTO - Organización de módulos

@Controller('users')
export class UsersController {
  @Get()              // GET /api/users
  @Get(':id')         // GET /api/users/:id
  @Post()             // POST /api/users
  @Put(':id')         // PUT /api/users/:id
  @Delete(':id')      // DELETE /api/users/:id
}

@Controller('classrooms')
export class ClassroomsController {
  @Get()                          // GET /api/classrooms
  @Get(':id')                     // GET /api/classrooms/:id
  @Get(':id/students')            // GET /api/classrooms/:id/students
  @Post(':id/assignments')        // POST /api/classrooms/:id/assignments
}

@Controller('gamification')
export class GamificationController {
  @Get('leaderboard')             // GET /api/gamification/leaderboard
  @Get('achievements')            // GET /api/gamification/achievements
  @Post('comodines/use')          // POST /api/gamification/comodines/use
}
```

---

## PATRONES DE URLs

### Estructura Estándar

```yaml
Formato completo de URL:
  {protocol}://{domain}:{port}/{globalPrefix}/{controller}/{endpoint}/{params}

Ejemplo:
  http://localhost:3000/api/exercises/123/submit

Desglose:
  - protocol: http
  - domain: localhost
  - port: 3000
  - globalPrefix: api (configurado en main.ts)
  - controller: exercises (definido en @Controller)
  - endpoint: 123/submit (definido en @Post)
```

### Ejemplos Correctos

```typescript
// URLs finales esperadas para GAMILIT:

// Exercises
GET    http://localhost:3000/api/exercises
GET    http://localhost:3000/api/exercises/123
POST   http://localhost:3000/api/exercises/123/submit

// Modules
GET    http://localhost:3000/api/modules
GET    http://localhost:3000/api/modules/123/exercises

// Gamification
GET    http://localhost:3000/api/gamification/user-stats
GET    http://localhost:3000/api/gamification/leaderboard
POST   http://localhost:3000/api/gamification/comodines/use
GET    http://localhost:3000/api/gamification/achievements

// Progress
GET    http://localhost:3000/api/progress/modules
GET    http://localhost:3000/api/progress/exercises/123

// Auth
POST   http://localhost:3000/api/auth/login
POST   http://localhost:3000/api/auth/register
POST   http://localhost:3000/api/auth/refresh
```

### Ejemplos Incorrectos (Bugs Comunes)

```typescript
// ❌ INCORRECTO - Duplicación de /api

http://localhost:3000/api/api/exercises         // Duplicado
http://localhost:3000/api/api/users             // Duplicado
http://localhost:3000/apiapi/modules            // Sin separador

// ❌ INCORRECTO - Falta de prefijo

http://localhost:3000/exercises                 // Falta /api
http://localhost:3000/users                     // Falta /api

// ❌ INCORRECTO - Prefijo incorrecto

http://localhost:3000/v1/exercises              // Prefijo diferente
http://localhost:3000/rest/users                // Prefijo diferente
```

---

## CONFIGURACIÓN POR AMBIENTE

### Variables de Entorno por Ambiente

```env
# .env.development (frontend)
VITE_API_URL=http://localhost:3000

# .env.staging (frontend)
VITE_API_URL=https://staging-api.gamilit.com

# .env.production (frontend)
VITE_API_URL=https://api.gamilit.com
```

### Configuración Dinámica

```typescript
// ✅ CORRECTO - Configuración dinámica por ambiente

// apps/frontend/web/src/config/api.config.ts
export const apiConfig = {
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  timeout: 10000,
  enableLogging: import.meta.env.DEV,
};

// apps/frontend/web/src/lib/apiClient.ts
import { apiConfig } from '@/config/api.config';

export const apiClient = axios.create(apiConfig);

if (apiConfig.enableLogging) {
  apiClient.interceptors.request.use((config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  });
}
```

---

## CORS Y SEGURIDAD

### Configuración CORS (Backend)

```typescript
// ✅ CORRECTO - apps/backend/src/main.ts

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configurar CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.setGlobalPrefix('api');
  await app.listen(3000);
}
```

### Headers de Seguridad

```typescript
// ✅ CORRECTO - Configuración de headers

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## TRAILING SLASHES

### Regla de Trailing Slashes

```typescript
// ✅ CORRECTO - Sin trailing slash al final

const endpoint = '/exercises';        // ✅
const endpoint = '/users/123';        // ✅
const endpoint = '/modules';          // ✅

// ❌ EVITAR - Trailing slash puede causar issues

const endpoint = '/exercises/';       // ❌ Evitar
const endpoint = '/users/123/';       // ❌ Evitar
```

---

## CHECKLIST DE VALIDACIÓN

### Pre-Implementation Checklist

- [ ] Verificar que `baseURL` incluye protocolo + dominio + puerto + `/api`
- [ ] Verificar que `baseURL` NO incluye rutas de recursos
- [ ] Verificar que endpoints NO incluyen prefijo `/api`
- [ ] Verificar que endpoints comienzan con `/`
- [ ] Verificar que NO hay trailing slashes innecesarios
- [ ] Verificar que variables de entorno están configuradas
- [ ] Verificar que CORS está configurado correctamente
- [ ] Verificar que prefijo global está en `main.ts` del backend

### Post-Implementation Checklist

- [ ] Probar endpoint en navegador (Network tab)
- [ ] Verificar URL final no tiene duplicados (/api/api/)
- [ ] Verificar que respuesta es correcta (200 OK)
- [ ] Verificar que no hay errores de CORS
- [ ] Probar en diferentes ambientes (dev, staging, prod)
- [ ] Verificar logs de requests en consola
- [ ] Verificar que token de autenticación se envía
- [ ] Probar casos de error (404, 500)

### Code Review Checklist

- [ ] Revisar que NO hay `/api` hardcodeado en endpoints
- [ ] Revisar que `baseURL` está configurado correctamente
- [ ] Revisar que se usan variables de entorno
- [ ] Revisar que NO hay URLs absolutas hardcodeadas
- [ ] Revisar consistencia entre backend y frontend
- [ ] Revisar que controladores usan rutas relativas
- [ ] Revisar que hay logging adecuado
- [ ] Revisar que hay manejo de errores

---

## VALIDACIÓN EN RUNTIME

### Interceptor para Detectar Duplicaciones

```typescript
// apps/frontend/web/src/lib/apiClient.ts

apiClient.interceptors.request.use((config) => {
  const url = config.url || '';

  // Detectar /api/api/
  if (url.includes('/api/')) {
    console.error(
      `[API ERROR] Endpoint contains /api prefix: ${url}\n` +
      `This will cause duplicate /api/api/ in final URL.\n` +
      `Remove /api from endpoint definition.`
    );

    if (import.meta.env.DEV) {
      throw new Error(`Invalid endpoint: ${url} contains /api prefix`);
    }
  }

  return config;
});
```

### Test Helper

```typescript
// apps/frontend/web/src/tests/helpers/apiTestHelpers.ts

export function validateEndpoint(endpoint: string) {
  if (endpoint.includes('/api/')) {
    throw new Error(
      `Endpoint "${endpoint}" should not include /api prefix. ` +
      `The baseURL already includes /api.`
    );
  }

  if (!endpoint.startsWith('/')) {
    throw new Error(
      `Endpoint "${endpoint}" should start with /`
    );
  }

  if (endpoint.endsWith('/') && endpoint !== '/') {
    console.warn(
      `Endpoint "${endpoint}" has trailing slash. Consider removing it.`
    );
  }
}

// Uso en tests
describe('exerciseService', () => {
  it('should use correct endpoint', () => {
    const endpoint = '/exercises';
    expect(() => validateEndpoint(endpoint)).not.toThrow();
  });

  it('should reject endpoint with /api prefix', () => {
    const endpoint = '/api/exercises';
    expect(() => validateEndpoint(endpoint)).toThrow();
  });
});
```

---

## REFERENCIAS

- [docs/98-standards/NAMING-CONVENTIONS-COMPLETE.md](../../98-standards/NAMING-CONVENTIONS-COMPLETE.md) - Estándares de nomenclatura
- [Axios Documentation](https://axios-http.com/docs/intro)
- [NestJS Controllers](https://docs.nestjs.com/controllers)

---

**Última actualización:** 2025-11-29
**Fuente original:** orchestration/directivas/ESTANDARES-API-ROUTES.md
**Mantenido por:** Architecture-Analyst
