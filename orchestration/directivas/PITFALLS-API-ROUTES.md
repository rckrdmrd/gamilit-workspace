# ERRORES COMUNES EN RUTAS API

**Versión:** 1.0
**Fecha:** 2025-11-23
**Autor:** Architecture-Analyst
**Motivación:** Documentar errores comunes y sus soluciones para prevenir bugs recurrentes

---

## PROBLEMA IDENTIFICADO

Se han identificado patrones recurrentes de errores en configuración de rutas API que causan bugs en producción. Este documento cataloga los **errores más comunes**, sus **síntomas**, **causas raíz** y **soluciones**.

---

## CATEGORÍAS DE ERRORES

### 1. DUPLICACIÓN DE PREFIJOS `/api`

#### 1.1. Duplicación en Frontend

**Síntoma:**
```
Request URL: http://localhost:3000/api/api/health
Status: 404 Not Found
```

**Causa Raíz:**
```typescript
// ❌ INCORRECTO - apps/frontend/web/src/lib/apiClient.ts
export const apiClient = axios.create({
  baseURL: `${process.env.VITE_API_URL}/api`,  // Ya incluye /api
});

// ❌ INCORRECTO - apps/frontend/web/src/services/healthService.ts
export const healthService = {
  async checkHealth() {
    // Duplica /api porque apiClient.baseURL ya lo incluye
    const response = await apiClient.get('/api/health');  // ❌
    return response.data;
  },
};
```

**Resultado:**
```
Final URL: http://localhost:3000/api + /api/health = /api/api/health
```

**Solución:**
```typescript
// ✅ CORRECTO - apps/frontend/web/src/services/healthService.ts
export const healthService = {
  async checkHealth() {
    // Sin /api porque baseURL ya lo incluye
    const response = await apiClient.get('/health');  // ✅
    return response.data;
  },
};
```

**Resultado:**
```
Final URL: http://localhost:3000/api + /health = /api/health ✅
```

#### 1.2. Duplicación en Backend

**Síntoma:**
```
Endpoint esperado: GET /api/health
Endpoint real: GET /api/api/health
```

**Causa Raíz:**
```typescript
// ❌ INCORRECTO - apps/backend/src/modules/health/health.controller.ts
@Controller('api/health')  // ❌ Ya incluye /api
export class HealthController {
  @Get()
  async checkHealth() {
    // Genera: GET /api/api/health
    return { status: 'ok' };
  }
}
```

**Solución:**
```typescript
// ✅ CORRECTO
@Controller('health')  // ✅ Sin /api porque se agrega globalmente
export class HealthController {
  @Get()
  async checkHealth() {
    // Genera: GET /api/health
    return { status: 'ok' };
  }
}

// En main.ts debe estar configurado:
app.setGlobalPrefix('api');
```

---

### 2. MIXING RELATIVE AND ABSOLUTE PATHS

#### 2.1. Paths Absolutos en Endpoints

**Síntoma:**
```
TypeError: Cannot read property 'baseURL' of undefined
Error: Network request failed
```

**Causa Raíz:**
```typescript
// ❌ INCORRECTO - Usar URL absoluta en vez de path relativo
export const healthService = {
  async checkHealth() {
    const response = await apiClient.get(
      'http://localhost:3000/api/health'  // ❌ URL absoluta
    );
    return response.data;
  },
};
```

**Problemas:**
1. Ignora configuración de `baseURL`
2. Hardcodea URL (no funciona en diferentes ambientes)
3. No usa interceptors configurados
4. Dificulta testing y mocking

**Solución:**
```typescript
// ✅ CORRECTO - Usar path relativo
export const healthService = {
  async checkHealth() {
    const response = await apiClient.get('/health');  // ✅ Path relativo
    return response.data;
  },
};
```

#### 2.2. Falta de Slash Inicial

**Síntoma:**
```
Request URL: http://localhost:3000/apihealth (sin separación)
Status: 404 Not Found
```

**Causa Raíz:**
```typescript
// ❌ INCORRECTO - Sin slash inicial
export const healthService = {
  async checkHealth() {
    const response = await apiClient.get('health');  // ❌ Sin /
    return response.data;
  },
};
```

**Resultado:**
```
baseURL: http://localhost:3000/api
endpoint: health
Final: http://localhost:3000/apihealth ❌
```

**Solución:**
```typescript
// ✅ CORRECTO - Con slash inicial
export const healthService = {
  async checkHealth() {
    const response = await apiClient.get('/health');  // ✅ Con /
    return response.data;
  },
};
```

**Resultado:**
```
baseURL: http://localhost:3000/api
endpoint: /health
Final: http://localhost:3000/api/health ✅
```

---

### 3. HARDCODED URLs

#### 3.1. URLs Hardcodeadas en Código

**Síntoma:**
```
Error: Network request failed (en staging/prod)
CORS error (dominio incorrecto)
```

**Causa Raíz:**
```typescript
// ❌ INCORRECTO - URL hardcodeada
export const apiClient = axios.create({
  baseURL: 'http://localhost:3000/api',  // ❌ Hardcoded
});
```

**Problemas:**
1. No funciona en staging/producción
2. Dificulta testing
3. Requiere cambios de código para cada ambiente
4. Propenso a errores

**Solución:**
```typescript
// ✅ CORRECTO - Usar variables de entorno
export const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,  // ✅ Desde env
});
```

```env
# .env.development
VITE_API_URL=http://localhost:3000

# .env.staging
VITE_API_URL=https://staging-api.gamilit.com

# .env.production
VITE_API_URL=https://api.gamilit.com
```

#### 3.2. URLs en Variables de Entorno Incorrectas

**Síntoma:**
```
Request URL: http://localhost:3000/api/api/health
```

**Causa Raíz:**
```env
# ❌ INCORRECTO - Ya incluye /api en variable
VITE_API_URL=http://localhost:3000/api
```

```typescript
// Configuración
export const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  // Resultado: http://localhost:3000/api/api
});
```

**Solución:**
```env
# ✅ CORRECTO - Sin /api en variable
VITE_API_URL=http://localhost:3000
```

```typescript
// Configuración
export const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  // Resultado: http://localhost:3000/api ✅
});
```

---

### 4. TRAILING SLASHES

#### 4.1. Trailing Slash en baseURL

**Síntoma:**
```
Request URL: http://localhost:3000/api//health (doble slash)
```

**Causa Raíz:**
```typescript
// ❌ PROBLEMA - Trailing slash en baseURL
export const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/`,  // ❌ / al final
});

// Endpoint
apiClient.get('/health');

// Resultado: http://localhost:3000/api//health ❌
```

**Solución:**
```typescript
// ✅ CORRECTO - Sin trailing slash
export const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,  // ✅ Sin / al final
});

// Endpoint
apiClient.get('/health');

// Resultado: http://localhost:3000/api/health ✅
```

#### 4.2. Trailing Slash en Endpoints

**Síntoma:**
```
Algunas veces funciona, otras veces 404
Inconsistencia entre ambientes
```

**Causa Raíz:**
```typescript
// ⚠️ INCONSISTENTE - Algunos con /, otros sin
export const userService = {
  async findAll() {
    return await apiClient.get('/users/');   // Con /
  },
  async findById(id: string) {
    return await apiClient.get(`/users/${id}`);  // Sin /
  },
};
```

**Solución:**
```typescript
// ✅ CORRECTO - Consistente, sin trailing slash
export const userService = {
  async findAll() {
    return await apiClient.get('/users');   // ✅ Sin /
  },
  async findById(id: string) {
    return await apiClient.get(`/users/${id}`);  // ✅ Sin /
  },
};
```

---

### 5. CORS CONFIGURATION MISMATCHES

#### 5.1. Origin Mismatch

**Síntoma:**
```
Access to fetch at 'http://localhost:3000/api/health' from origin
'http://localhost:5173' has been blocked by CORS policy
```

**Causa Raíz:**
```typescript
// ❌ INCORRECTO - CORS no permite origin del frontend
app.enableCors({
  origin: 'http://localhost:3001',  // ❌ Puerto incorrecto
});

// Frontend corre en:
// http://localhost:5173  ❌ No está permitido
```

**Solución:**
```typescript
// ✅ CORRECTO - Permitir origin correcto
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',  // ✅
  credentials: true,
});
```

#### 5.2. Missing CORS Headers

**Síntoma:**
```
Request header field authorization is not allowed by
Access-Control-Allow-Headers
```

**Causa Raíz:**
```typescript
// ❌ INCORRECTO - No permite header Authorization
app.enableCors({
  origin: 'http://localhost:5173',
  allowedHeaders: ['Content-Type'],  // ❌ Falta Authorization
});
```

**Solución:**
```typescript
// ✅ CORRECTO - Incluir todos los headers necesarios
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],  // ✅
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
});
```

---

### 6. BASE URL PORT MISMATCHES

#### 6.1. Puerto Incorrecto

**Síntoma:**
```
Error: connect ECONNREFUSED 127.0.0.1:3001
Network request failed
```

**Causa Raíz:**
```env
# ❌ INCORRECTO - Puerto no coincide con backend
VITE_API_URL=http://localhost:3001
```

```typescript
// Backend corre en puerto 3000
await app.listen(3000);
```

**Solución:**
```env
# ✅ CORRECTO - Puerto coincide
VITE_API_URL=http://localhost:3000
```

#### 6.2. Puerto Default vs Explícito

**Síntoma:**
```
Request works in dev but fails in prod
CORS errors in production
```

**Causa Raíz:**
```env
# ❌ PROBLEMA - Asume puerto default
VITE_API_URL=https://api.gamilit.com  # ¿Puerto 443 (default HTTPS)?
```

```typescript
// Pero backend corre en puerto custom
await app.listen(8080);  // Puerto custom
```

**Solución:**
```env
# ✅ CORRECTO - Especificar puerto si no es default
VITE_API_URL=https://api.gamilit.com:8080

# O usar puerto default (443 para HTTPS)
VITE_API_URL=https://api.gamilit.com
```

---

### 7. INTERCEPTOR ISSUES

#### 7.1. Modificación Incorrecta de URL

**Síntoma:**
```
Request URL cambió inesperadamente
Headers o params perdidos
```

**Causa Raíz:**
```typescript
// ❌ INCORRECTO - Modifica URL sin retornar config
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  config.headers.Authorization = `Bearer ${token}`;
  // ❌ No retorna config
});
```

**Solución:**
```typescript
// ✅ CORRECTO - Retorna config
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;  // ✅ Retornar config
});
```

#### 7.2. Interceptor que Duplica Prefijos

**Síntoma:**
```
Request URL: http://localhost:3000/api/api/health
```

**Causa Raíz:**
```typescript
// ❌ INCORRECTO - Agrega /api en interceptor
apiClient.interceptors.request.use((config) => {
  config.url = `/api${config.url}`;  // ❌ Duplica /api
  return config;
});
```

**Solución:**
```typescript
// ✅ CORRECTO - No modificar URL en interceptor
apiClient.interceptors.request.use((config) => {
  // Solo agregar headers, token, etc.
  // NO modificar URL
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

### 8. TEMPLATE LITERAL ERRORS

#### 8.1. Concatenación en vez de Template Literals

**Síntoma:**
```
Request URL: http://localhost:3000/api/users/[object Object]
TypeError: Cannot convert object to primitive value
```

**Causa Raíz:**
```typescript
// ❌ INCORRECTO - Concatenación puede causar issues
export const userService = {
  async findById(id: string) {
    const response = await apiClient.get('/users/' + id);  // ❌
    return response.data;
  },
};

// Peor aún - pasar objeto
await userService.findById({ id: '123' });  // ❌
// Resultado: /users/[object Object]
```

**Solución:**
```typescript
// ✅ CORRECTO - Template literals con validación
export const userService = {
  async findById(id: string) {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid user ID');
    }

    const response = await apiClient.get(`/users/${id}`);  // ✅
    return response.data;
  },
};

// Uso correcto
await userService.findById('123');  // ✅
```

#### 8.2. IDs no Sanitizados

**Síntoma:**
```
Request URL: http://localhost:3000/api/users/123%20OR%201=1
SQL Injection attempt
```

**Causa Raíz:**
```typescript
// ❌ INCORRECTO - No sanitiza input
export const userService = {
  async findById(id: string) {
    // id podría ser: "123 OR 1=1"
    const response = await apiClient.get(`/users/${id}`);  // ❌
    return response.data;
  },
};
```

**Solución:**
```typescript
// ✅ CORRECTO - Validar y sanitizar
export const userService = {
  async findById(id: string) {
    // Validar formato UUID
    const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!UUID_REGEX.test(id)) {
      throw new Error('Invalid user ID format');
    }

    const response = await apiClient.get(`/users/${id}`);  // ✅
    return response.data;
  },
};
```

---

### 9. QUERY PARAMETERS ISSUES

#### 9.1. Concatenación Manual de Query Params

**Síntoma:**
```
Request URL: http://localhost:3000/api/users?q=john doe&page=1 (sin encoding)
Search fails for multi-word queries
```

**Causa Raíz:**
```typescript
// ❌ INCORRECTO - Concatenación manual sin encoding
export const userService = {
  async searchUsers(query: string, page: number) {
    const response = await apiClient.get(
      `/users?q=${query}&page=${page}`  // ❌ No encodes query
    );
    return response.data;
  },
};

// query = "john doe"
// Resultado: /users?q=john doe&page=1  ❌ (espacio sin encodear)
```

**Solución:**
```typescript
// ✅ CORRECTO - Usar objeto params (auto-encode)
export const userService = {
  async searchUsers(query: string, page: number = 1) {
    const response = await apiClient.get('/users', {
      params: { q: query, page },  // ✅ Auto-encoding
    });
    return response.data;
  },
};

// query = "john doe"
// Resultado: /users?q=john%20doe&page=1  ✅
```

#### 9.2. Params Undefined

**Síntoma:**
```
Request URL: http://localhost:3000/api/users?page=undefined
Backend error: Invalid page number
```

**Causa Raíz:**
```typescript
// ❌ INCORRECTO - No valida params undefined
export const userService = {
  async findAll(page?: number) {
    const response = await apiClient.get('/users', {
      params: { page },  // ❌ page puede ser undefined
    });
    return response.data;
  },
};
```

**Solución:**
```typescript
// ✅ CORRECTO - Filtrar params undefined
export const userService = {
  async findAll(page?: number) {
    const params: Record<string, any> = {};

    if (page !== undefined) {
      params.page = page;
    }

    const response = await apiClient.get('/users', { params });
    return response.data;
  },
};

// O usar default value
export const userService = {
  async findAll(page: number = 1) {  // ✅ Default value
    const response = await apiClient.get('/users', {
      params: { page },
    });
    return response.data;
  },
};
```

---

### 10. ERROR HANDLING

#### 10.1. No Error Handling

**Síntoma:**
```
Unhandled Promise Rejection
Application crashes
User sees technical error
```

**Causa Raíz:**
```typescript
// ❌ INCORRECTO - No maneja errores
export const userService = {
  async findById(id: string) {
    const response = await apiClient.get(`/users/${id}`);  // ❌ Sin try/catch
    return response.data;
  },
};
```

**Solución:**
```typescript
// ✅ CORRECTO - Manejo de errores apropiado
export const userService = {
  async findById(id: string): Promise<User> {
    try {
      const response = await apiClient.get<User>(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('[UserService] Error fetching user:', error);

      // Re-throw con mensaje user-friendly
      throw new Error('Failed to fetch user. Please try again.');
    }
  },
};
```

#### 10.2. Exponer Errores Internos

**Síntoma:**
```
User sees: "TypeError: Cannot read property 'data' of undefined"
Security issue: exposes internal structure
```

**Causa Raíz:**
```typescript
// ❌ INCORRECTO - Expone error técnico
export const userService = {
  async findById(id: string) {
    try {
      const response = await apiClient.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw error;  // ❌ Expone error técnico
    }
  },
};
```

**Solución:**
```typescript
// ✅ CORRECTO - Error user-friendly
export const userService = {
  async findById(id: string): Promise<User> {
    try {
      const response = await apiClient.get<User>(`/users/${id}`);
      return response.data;
    } catch (error) {
      // Log técnico (solo dev)
      if (import.meta.env.DEV) {
        console.error('[UserService] Error:', error);
      }

      // Error user-friendly
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('User not found');
        }
        if (error.response?.status === 500) {
          throw new Error('Server error. Please try again later.');
        }
      }

      throw new Error('Failed to fetch user');
    }
  },
};
```

---

## DETECCIÓN TEMPRANA

### Checklist de Auto-Validación

Antes de commit, verificar:

- [ ] NO hay `/api` en endpoints de servicios
- [ ] Todos los endpoints empiezan con `/`
- [ ] NO hay URLs absolutas hardcodeadas
- [ ] Se usan variables de entorno
- [ ] NO hay trailing slashes inconsistentes
- [ ] Hay manejo de errores
- [ ] Query params usan objeto `params`
- [ ] IDs se validan antes de usar en URLs

### Herramientas de Detección

```typescript
// Setup en apiClient para detectar errores comunes

export const apiClient = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
});

// Interceptor para detectar problemas
apiClient.interceptors.request.use((config) => {
  const url = config.url || '';

  // Detectar /api/api/
  if (url.includes('/api/')) {
    console.error(
      `[API ERROR] Endpoint contains /api prefix: ${url}\n` +
      `Remove /api from endpoint definition.`
    );
    if (import.meta.env.DEV) {
      throw new Error(`Invalid endpoint: ${url}`);
    }
  }

  // Detectar URL absoluta
  if (url.startsWith('http://') || url.startsWith('https://')) {
    console.warn(
      `[API WARNING] Using absolute URL: ${url}\n` +
      `Consider using relative path instead.`
    );
  }

  // Detectar falta de slash inicial
  if (url && !url.startsWith('/')) {
    console.warn(
      `[API WARNING] Endpoint missing leading slash: ${url}\n` +
      `This may cause incorrect URL concatenation.`
    );
  }

  return config;
});
```

---

## REFERENCIAS

- [ESTANDARES-API-ROUTES.md](./ESTANDARES-API-ROUTES.md) - Estándares de rutas API
- [CHECKLIST-CODE-REVIEW-API.md](./CHECKLIST-CODE-REVIEW-API.md) - Checklist de code review
- [ESTANDARES-TESTING-API.md](./ESTANDARES-TESTING-API.md) - Estándares de testing
- [AUTOMATIZACION-VALIDACION-RUTAS.md](./AUTOMATIZACION-VALIDACION-RUTAS.md) - Automatización

---

**Uso:** Consultar al encontrar errores de API
**Actualización:** Agregar nuevos pitfalls conforme se descubran
**Mantenimiento:** Revisar y actualizar cada trimestre
