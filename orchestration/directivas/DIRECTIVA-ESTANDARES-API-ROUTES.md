# ESTÁNDARES DE RUTAS Y CONFIGURACIÓN DE API

**Versión:** 1.0
**Fecha:** 2025-11-23
**Autor:** Architecture-Analyst
**Motivación:** Prevenir bugs de rutas duplicadas y garantizar configuración correcta de endpoints API

---

## PROBLEMA IDENTIFICADO

Se detectó un bug crítico de duplicación de rutas que generaba URLs incorrectas del tipo `/api/api/endpoint` en lugar de `/api/endpoint`. Este problema surgió por:

1. **Configuración incorrecta de baseURL** en cliente API
2. **Duplicación de prefijo `/api`** entre baseURL y definición de endpoints
3. **Falta de estándares claros** sobre separación de responsabilidades
4. **Ausencia de validación** de configuración de rutas
5. **Inconsistencia** entre configuración backend y frontend

---

## ESTÁNDARES Y MEJORES PRÁCTICAS

### 1. SEPARACIÓN DE RESPONSABILIDADES

#### Regla Fundamental

```yaml
baseURL: Define el protocolo, dominio, puerto y prefijo global
endpoint: Define solo la ruta específica del recurso (sin prefijos globales)
```

#### Responsabilidades Claras

```typescript
// ✅ CORRECTO - Separación clara de responsabilidades

// baseURL contiene:
// - Protocolo (http:// o https://)
// - Dominio/host (localhost, api.gamilit.com)
// - Puerto (si no es default)
// - Prefijo global de API (/api)

const baseURL = 'http://localhost:3000/api';

// endpoint contiene SOLO:
// - Ruta del recurso
// - Sin protocolo
// - Sin dominio
// - Sin puerto
// - Sin prefijo /api

const endpoint = '/health';
const endpoint = '/users';
const endpoint = '/projects/123';
```

---

### 2. CONFIGURACIÓN DE API CLIENT

#### 2.1. Configuración Correcta con Axios

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
  baseURL: `${process.env.VITE_API_URL}/api`,
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

#### 2.2. Configuración con Fetch

```typescript
// ✅ CORRECTO - Si usas fetch nativo

const API_BASE_URL = `${process.env.VITE_API_URL}/api`;

async function apiRequest(endpoint: string, options?: RequestInit) {
  // Combina baseURL + endpoint
  const url = `${API_BASE_URL}${endpoint}`;

  console.log(`[API] ${options?.method || 'GET'} ${url}`);

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  return response.json();
}
```

#### 2.3. Variables de Entorno

```env
# ✅ CORRECTO - .env (frontend)

# Base URL SIN el prefijo /api
VITE_API_URL=http://localhost:3000

# El prefijo /api se agrega en la configuración del cliente
# NO en la variable de entorno
```

```typescript
// ✅ CORRECTO - Uso en código

const baseURL = `${process.env.VITE_API_URL}/api`;
// Resultado: 'http://localhost:3000/api'
```

```env
# ❌ INCORRECTO - NO incluir /api en env

VITE_API_URL=http://localhost:3000/api  # ❌ NO HACER ESTO
```

---

### 3. DEFINICIÓN DE ENDPOINTS

#### 3.1. Servicios de API (Frontend)

```typescript
// ✅ CORRECTO - apps/frontend/web/src/services/healthService.ts

import { apiClient } from '@/lib/apiClient';

export const healthService = {
  /**
   * Check API health
   * GET /api/health
   */
  async checkHealth() {
    // endpoint sin /api porque baseURL ya lo incluye
    const response = await apiClient.get('/health');
    return response.data;
  },

  /**
   * Check database health
   * GET /api/health/database
   */
  async checkDatabase() {
    const response = await apiClient.get('/health/database');
    return response.data;
  },
};
```

```typescript
// ❌ INCORRECTO - NO duplicar /api

export const healthService = {
  async checkHealth() {
    // ❌ INCORRECTO: genera /api/api/health
    const response = await apiClient.get('/api/health');
    return response.data;
  },
};
```

#### 3.2. Endpoints con Parámetros

```typescript
// ✅ CORRECTO - Endpoints con parámetros

export const userService = {
  async findById(userId: string) {
    // GET /api/users/123
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  },

  async updateUser(userId: string, data: UpdateUserDto) {
    // PUT /api/users/123
    const response = await apiClient.put(`/users/${userId}`, data);
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

#### 3.3. Endpoints Anidados

```typescript
// ✅ CORRECTO - Recursos anidados

export const projectService = {
  // GET /api/projects/123/tasks
  async getProjectTasks(projectId: string) {
    const response = await apiClient.get(`/projects/${projectId}/tasks`);
    return response.data;
  },

  // POST /api/projects/123/tasks
  async createProjectTask(projectId: string, taskData: CreateTaskDto) {
    const response = await apiClient.post(
      `/projects/${projectId}/tasks`,
      taskData
    );
    return response.data;
  },

  // GET /api/projects/123/tasks/456/comments
  async getTaskComments(projectId: string, taskId: string) {
    const response = await apiClient.get(
      `/projects/${projectId}/tasks/${taskId}/comments`
    );
    return response.data;
  },
};
```

---

### 4. CONFIGURACIÓN BACKEND (NestJS)

#### 4.1. Prefijo Global de API

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

#### 4.2. Controladores

```typescript
// ✅ CORRECTO - apps/backend/src/modules/health/health.controller.ts

import { Controller, Get } from '@nestjs/common';

/**
 * Health Controller
 *
 * Ruta base: /health (sin /api porque se agrega globalmente)
 * Rutas finales:
 * - GET /api/health
 * - GET /api/health/database
 */
@Controller('health')  // ✅ Sin prefijo /api
export class HealthController {

  @Get()
  async checkHealth() {
    // Ruta final: GET /api/health
    return { status: 'ok', timestamp: new Date() };
  }

  @Get('database')
  async checkDatabase() {
    // Ruta final: GET /api/health/database
    return { database: 'connected' };
  }
}
```

```typescript
// ❌ INCORRECTO - NO incluir /api en @Controller

@Controller('api/health')  // ❌ Genera /api/api/health
export class HealthController {
  // ...
}
```

#### 4.3. Módulos y Rutas

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

@Controller('projects')
export class ProjectsController {
  @Get()                          // GET /api/projects
  @Get(':id')                     // GET /api/projects/:id
  @Get(':id/tasks')               // GET /api/projects/:id/tasks
  @Post(':id/tasks')              // POST /api/projects/:id/tasks
}
```

---

### 5. PATRONES DE URLS

#### 5.1. Estructura Estándar

```yaml
Formato completo de URL:
  {protocol}://{domain}:{port}/{globalPrefix}/{controller}/{endpoint}/{params}

Ejemplo:
  http://localhost:3000/api/projects/123/tasks

Desglose:
  - protocol: http
  - domain: localhost
  - port: 3000
  - globalPrefix: api (configurado en main.ts)
  - controller: projects (definido en @Controller)
  - endpoint: 123/tasks (definido en @Get)
```

#### 5.2. Ejemplos Correctos

```typescript
// URLs finales esperadas:

GET    http://localhost:3000/api/health
GET    http://localhost:3000/api/health/database
GET    http://localhost:3000/api/users
GET    http://localhost:3000/api/users/123
POST   http://localhost:3000/api/users
PUT    http://localhost:3000/api/users/123
DELETE http://localhost:3000/api/users/123
GET    http://localhost:3000/api/projects
GET    http://localhost:3000/api/projects/123/tasks
POST   http://localhost:3000/api/projects/123/tasks/456/comments
```

#### 5.3. Ejemplos Incorrectos (Bugs Comunes)

```typescript
// ❌ INCORRECTO - Duplicación de /api

http://localhost:3000/api/api/health         // Duplicado
http://localhost:3000/api/api/users          // Duplicado
http://localhost:3000/apiapi/projects        // Sin separador

// ❌ INCORRECTO - Falta de prefijo

http://localhost:3000/health                 // Falta /api
http://localhost:3000/users                  // Falta /api

// ❌ INCORRECTO - Prefijo incorrecto

http://localhost:3000/v1/health              // Prefijo diferente
http://localhost:3000/rest/users             // Prefijo diferente
```

---

### 6. CONFIGURACIÓN POR AMBIENTE

#### 6.1. Variables de Entorno por Ambiente

```env
# .env.development (frontend)
VITE_API_URL=http://localhost:3000

# .env.staging (frontend)
VITE_API_URL=https://staging-api.gamilit.com

# .env.production (frontend)
VITE_API_URL=https://api.gamilit.com
```

```env
# .env.development (backend)
PORT=3000
NODE_ENV=development

# .env.staging (backend)
PORT=3000
NODE_ENV=staging

# .env.production (backend)
PORT=3000
NODE_ENV=production
```

#### 6.2. Configuración Dinámica

```typescript
// ✅ CORRECTO - Configuración dinámica por ambiente

// apps/frontend/web/src/config/api.config.ts
export const apiConfig = {
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  timeout: 10000,

  // Logging solo en desarrollo
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

### 7. CORS Y SEGURIDAD

#### 7.1. Configuración CORS (Backend)

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

#### 7.2. Headers de Seguridad

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

### 8. TRAILING SLASHES

#### 8.1. Regla de Trailing Slashes

```typescript
// ✅ CORRECTO - Sin trailing slash al final

const endpoint = '/health';        // ✅
const endpoint = '/users/123';     // ✅
const endpoint = '/projects';      // ✅

// ❌ EVITAR - Trailing slash puede causar issues

const endpoint = '/health/';       // ❌ Evitar
const endpoint = '/users/123/';    // ❌ Evitar
```

#### 8.2. Configuración de Trailing Slashes

```typescript
// ✅ CORRECTO - Normalizar trailing slashes

function normalizeEndpoint(endpoint: string): string {
  // Eliminar trailing slash
  return endpoint.replace(/\/$/, '');
}

export const apiClient = axios.create({
  baseURL: normalizeEndpoint(`${process.env.VITE_API_URL}/api`),
});
```

---

## EJEMPLOS

### Ejemplo Completo: Módulo de Health Check

#### Backend

```typescript
// apps/backend/src/modules/health/health.controller.ts

import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

@Controller('health')  // Ruta base: /health
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()  // GET /api/health
  async checkHealth() {
    return this.healthService.checkHealth();
  }

  @Get('database')  // GET /api/health/database
  async checkDatabase() {
    return this.healthService.checkDatabase();
  }
}
```

#### Frontend - Configuración

```typescript
// apps/frontend/web/src/lib/apiClient.ts

import axios from 'axios';

export const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  timeout: 10000,
});
```

#### Frontend - Service

```typescript
// apps/frontend/web/src/services/healthService.ts

import { apiClient } from '@/lib/apiClient';

export const healthService = {
  async checkHealth() {
    const response = await apiClient.get('/health');
    return response.data;
  },

  async checkDatabase() {
    const response = await apiClient.get('/health/database');
    return response.data;
  },
};
```

#### Frontend - Uso en Componente

```typescript
// apps/frontend/web/src/components/HealthCheck.tsx

import { useEffect, useState } from 'react';
import { healthService } from '@/services/healthService';

export const HealthCheck = () => {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    const checkHealth = async () => {
      const data = await healthService.checkHealth();
      setHealth(data);
    };

    checkHealth();
  }, []);

  return <div>Health: {health?.status}</div>;
};
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

## HERRAMIENTAS DE AUTOMATIZACIÓN

### 1. ESLint Rule - No API Prefix in Endpoints

```javascript
// .eslintrc.js - Custom rule

module.exports = {
  rules: {
    'no-api-prefix-in-endpoints': {
      create(context) {
        return {
          CallExpression(node) {
            // Detectar apiClient.get('/api/...')
            if (
              node.callee?.object?.name === 'apiClient' &&
              node.arguments?.[0]?.type === 'Literal' &&
              typeof node.arguments[0].value === 'string' &&
              node.arguments[0].value.startsWith('/api/')
            ) {
              context.report({
                node,
                message: 'Endpoint should not include /api prefix. Remove /api from endpoint path.',
              });
            }
          },
        };
      },
    },
  },
};
```

### 2. Test Helpers

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
describe('healthService', () => {
  it('should use correct endpoint', () => {
    const endpoint = '/health';
    expect(() => validateEndpoint(endpoint)).not.toThrow();
  });

  it('should reject endpoint with /api prefix', () => {
    const endpoint = '/api/health';
    expect(() => validateEndpoint(endpoint)).toThrow();
  });
});
```

### 3. Runtime Validation

```typescript
// apps/frontend/web/src/lib/apiClient.ts

export const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

// Interceptor para detectar duplicaciones
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

### 4. Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Validating API endpoints..."

# Buscar /api/ en endpoints de servicios
if git diff --cached --name-only | grep -E 'services/.*Service\.ts$'; then
  if git diff --cached | grep -E "apiClient\.(get|post|put|delete|patch)\(['\"]\/api\/"; then
    echo "ERROR: Found /api prefix in endpoint definition"
    echo "Endpoints should not include /api prefix"
    echo "The baseURL already includes /api"
    exit 1
  fi
fi

echo "API endpoint validation passed"
```

---

## REFERENCIAS

- [ESTANDARES-NOMENCLATURA.md](./ESTANDARES-NOMENCLATURA.md) - Estándares de nomenclatura
- [CHECKLIST-CODE-REVIEW-API.md](./CHECKLIST-CODE-REVIEW-API.md) - Checklist de code review
- [ESTANDARES-TESTING-API.md](./ESTANDARES-TESTING-API.md) - Estándares de testing
- [PITFALLS-API-ROUTES.md](./PITFALLS-API-ROUTES.md) - Errores comunes
- [Axios Documentation](https://axios-http.com/docs/intro)
- [NestJS Controllers](https://docs.nestjs.com/controllers)

---

**Uso:** Referencia obligatoria para configuración de rutas API
**Validación:** Obligatoria en code reviews y antes de merge
**Actualización:** Mantener sincronizado con cambios en arquitectura
