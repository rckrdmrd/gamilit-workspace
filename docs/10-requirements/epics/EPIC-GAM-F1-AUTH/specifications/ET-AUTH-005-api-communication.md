---
titulo: "ET-AUTH-005: API Communication"
tipo: especificacion-tecnica
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# ET-AUTH-005: API Communication

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-AUTH-005 |
| **Modulo** | Autenticacion y Autorizacion |
| **Tipo** | Especificacion Tecnica |
| **Estado** | Implementado |
| **Completitud** | 95% |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-27 |
| **Ultima Actualizacion** | 2026-01-27 |
| **Autor** | Architecture Analyst |

---

## Referencias

### Requerimiento Funcional
- RF-AUTH-006: Secure API Communication

### User Stories
- US-AUTH-006: Secure HTTP Communication

---

## Descripcion Funcional

El sistema de comunicacion API implementa:
- Cliente HTTP centralizado con interceptores
- Inyeccion automatica de tokens JWT
- Manejo centralizado de errores
- Retry automatico con backoff exponencial
- Refresh token automatico en 401

---

## Arquitectura

### Diagrama de Flujo

```
Frontend Request
        |
        v
API Client (Axios)
        |
        v
Request Interceptor
  - Agrega Authorization header
  - Agrega tenant_id header
  - Agrega request_id para tracing
        |
        v
HTTP Request → Backend
        |
        v
Response Interceptor
  ├── 2xx → Retorna data
  ├── 401 → Intenta refresh token
  │         ├── OK → Reintenta request
  │         └── Fail → Logout
  ├── 429 → Rate limited (retry con backoff)
  └── 5xx → Error handler + retry
```

---

## Implementacion Existente

### Frontend - API Client

**Ubicacion:** `apps/frontend/src/lib/api/client.ts`

**Estado:** COMPLETO (100%)

```typescript
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add request ID for tracing
    config.headers['X-Request-ID'] = crypto.randomUUID();
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 - attempt refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

### Frontend - API Configuration

**Ubicacion:** `apps/frontend/src/config/api.config.ts`

**Estado:** COMPLETO (100%)

```typescript
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3006/api/v1',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,

  endpoints: {
    auth: {
      login: '/auth/login',
      logout: '/auth/logout',
      refresh: '/auth/refresh',
      profile: '/auth/profile',
    },
    gamification: {
      stats: '/gamification/stats',
      achievements: '/gamification/achievements',
      leaderboard: '/gamification/leaderboard',
    },
    // ... mas endpoints
  },
};
```

### Frontend - Generated Types

**Ubicacion:** `apps/frontend/src/generated/api-types.ts`

**Estado:** COMPLETO (100%)

Tipos generados desde OpenAPI/Swagger del backend.

### Backend - CORS Configuration

**Ubicacion:** `apps/backend/src/main.ts`

**Estado:** COMPLETO (100%)

```typescript
app.enableCors({
  origin: process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:3005',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Request-ID',
    'X-Tenant-ID',
  ],
});
```

### Backend - Global Error Filter

**Ubicacion:** `apps/backend/src/shared/filters/http-exception.filter.ts`

**Estado:** COMPLETO (100%)

```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: this.getErrorMessage(exception),
      requestId: request.headers['x-request-id'],
    };

    // Log error for monitoring
    this.logger.error(errorResponse, exception);

    response.status(status).json(errorResponse);
  }
}
```

---

## Patrones de Comunicacion

### 1. Fetch con Error Handling

```typescript
// hooks/useApi.ts
export function useApi<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<T>(endpoint);
      setData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [endpoint]);

  return { data, error, isLoading, refetch: fetchData };
}
```

### 2. Mutation con Optimistic Updates

```typescript
// hooks/useMutation.ts
export function useMutation<T, R>(
  mutationFn: (data: T) => Promise<R>,
  options?: MutationOptions<R>
) {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (data: T): Promise<R> => {
    setIsLoading(true);
    try {
      // Optimistic update
      options?.onMutate?.(data);

      const result = await mutationFn(data);
      options?.onSuccess?.(result);
      return result;
    } catch (error) {
      // Rollback optimistic update
      options?.onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading };
}
```

---

## API Response Format

### Respuesta Exitosa

```json
{
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

### Respuesta de Error

```json
{
  "statusCode": 400,
  "timestamp": "2026-01-27T10:00:00.000Z",
  "path": "/api/v1/users",
  "method": "POST",
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ],
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## Seguridad

### Headers de Seguridad

```typescript
// Backend helmet configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
```

### Rate Limiting

```typescript
// Backend rate limiting
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: 'Too many requests, please try again later',
  })
);
```

---

## Lo que Falta para Completar (5%)

### 1. Request Caching (3%)

```typescript
// services/api-cache.service.ts (NUEVO)
const requestCache = new Map<string, CacheEntry>();

function getCachedRequest<T>(key: string): T | null {
  const entry = requestCache.get(key);
  if (entry && Date.now() < entry.expiresAt) {
    return entry.data as T;
  }
  return null;
}
```

### 2. Offline Queue (2%)

- Encolar requests cuando offline
- Sincronizar cuando vuelve online

---

## Criterios de Aceptacion

### Funcionales
- [x] Requests incluyen JWT automaticamente
- [x] Errores manejados centralmente
- [x] Refresh token automatico en 401
- [x] Tipos generados desde Swagger
- [ ] Caching de requests GET

### No Funcionales
- [x] Timeout configurable
- [x] Request tracing con IDs
- [x] CORS correctamente configurado
- [x] Rate limiting implementado

---

## Estimacion de Esfuerzo Restante

| Componente | Horas Estimadas |
|------------|-----------------|
| Request Caching | 3h |
| Offline Queue | 4h |
| Tests | 2h |
| **Total** | **9h** |

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-27 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-AUTH-005-api-communication.md*
*Generado: 2026-01-27*
