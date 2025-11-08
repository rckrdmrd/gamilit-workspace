# ⚠️ DEPRECATED: Seguridad - Rate Limiting

> **IMPORTANTE:** Este documento está OBSOLETO - Rate limiting NO está implementado en el código actual.
>
> **Razón:** El sistema de rate limiting documentado aquí no existe en el backend de GAMILIT.
>
> **Estado actual:** El backend NO tiene rate limiting implementado.
>
> **Futuro:** Rate limiting está planeado para implementación futura (ver planificación de features).
>
> **Fecha de deprecación:** 2025-11-07
>
> ---
>
> El contenido a continuación describe un sistema de rate limiting **NO implementado**.
> Se mantiene este archivo solo para referencia de diseño futuro.

---

## Archivo

**Ubicación planificada:** `/src/middleware/rate-limit.middleware.ts` (NO EXISTE)

---

## Índice

1. [Rate Limiters Pre-configurados](#rate-limiters-pre-configurados)
2. [Custom Rate Limiter](#custom-rate-limiter)
3. [Headers de Rate Limit](#headers-de-rate-limit)
4. [Arquitectura del Sistema](#arquitectura-del-sistema)

---

## Rate Limiters Pre-configurados

### authRateLimiter

Limita intentos de autenticación para prevenir brute-force.

**Configuración:**
- Ventana: 15 minutos
- Máximo: 5 requests
- Key: `auth:${IP}:${email}`

**Uso:**
```typescript
router.post('/api/auth/login',
  authRateLimiter,  // ← 5 intentos / 15 min
  validate(loginSchema),
  authController.login
);
```

**Propósito:** Prevenir brute-force en autenticación

---

### passwordResetRateLimiter

Limita solicitudes de recuperación de contraseña.

**Configuración:**
- Ventana: 1 hora
- Máximo: 1 request
- Key: `password-reset:${email}`

**Uso:**
```typescript
router.post('/api/auth/forgot-password',
  passwordResetRateLimiter,  // ← 1 request / hora
  validate(forgotPasswordSchema),
  authController.forgotPassword
);
```

**Propósito:** Prevenir spam de emails de recuperación

---

### emailVerificationRateLimiter

Limita reenvío de emails de verificación.

**Configuración:**
- Ventana: 1 hora
- Máximo: 3 requests
- Key: `email-verification:${userId}`

**Uso:**
```typescript
router.post('/api/auth/resend-verification',
  authenticateJWT,
  emailVerificationRateLimiter,  // ← 3 requests / hora
  authController.resendVerification
);
```

---

### generalApiRateLimiter

Rate limiter general para API.

**Configuración:**
- Ventana: 15 minutos
- Máximo: 100 requests
- Key: `api:user:${userId}` o `api:ip:${IP}`

**Uso:**
```typescript
// Aplicar a rutas generales
router.use('/api', generalApiRateLimiter);
```

---

### leaderboardRateLimiter

Limita consultas a leaderboards.

**Configuración:**
- Ventana: 1 minuto
- Máximo: 30 requests
- Key: `leaderboard:${userId}`

**Uso:**
```typescript
router.get('/api/gamification/leaderboards/:type',
  authenticateJWT,
  leaderboardRateLimiter,  // ← 30 requests / minuto
  leaderboardsController.getLeaderboard
);
```

**Propósito:** Prevenir abuse de endpoints costosos

---

### fileUploadRateLimiter

Limita uploads de archivos.

**Configuración:**
- Ventana: 1 hora
- Máximo: 10 requests
- Key: `upload:${userId}`

**Uso:**
```typescript
router.post('/api/upload/avatar',
  authenticateJWT,
  fileUploadRateLimiter,  // ← 10 uploads / hora
  uploadController.uploadAvatar
);
```

**Propósito:** Prevenir abuse de uploads

---

## Custom Rate Limiter

### Crear Rate Limiter Personalizado

```typescript
import { createRateLimiter } from '@/middleware/rate-limit.middleware';

const customLimiter = createRateLimiter({
  windowMs: 60 * 1000,     // 1 minuto
  maxRequests: 10,         // 10 requests
  keyGenerator: (req) => {
    return `custom:${req.user?.id || req.ip}`;
  },
  message: 'Too many custom requests',
  skipSuccessfulRequests: false
});

router.get('/api/custom',
  customLimiter,
  controller.customAction
);
```

### Opciones Disponibles

```typescript
interface RateLimiterOptions {
  windowMs: number;              // Ventana en milisegundos
  maxRequests: number;           // Máximo de requests
  keyGenerator?: (req) => string; // Generador de key
  message?: string;              // Mensaje de error
  skipSuccessfulRequests?: boolean; // Skip requests exitosos
  skipFailedRequests?: boolean;  // Skip requests fallidos
}
```

---

## Headers de Rate Limit

### Respuesta Normal

```
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2025-10-27T11:00:00.000Z
```

### Cuando se Excede

```
HTTP/1.1 429 Too Many Requests
Retry-After: 300
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2025-10-27T10:45:00.000Z

{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many authentication attempts...",
    "details": {
      "limit": 5,
      "windowMs": 900000,
      "retryAfter": 300,
      "resetTime": "2025-10-27T10:45:00.000Z"
    }
  }
}
```

---

## Arquitectura del Sistema

### RateLimitStore (In-Memory)

```typescript
class RateLimitStore {
  private store: Map<string, RateLimitEntry> = new Map();

  interface RateLimitEntry {
    count: number;
    resetTime: number;
    firstAttempt: number;
  }

  // Auto-cleanup cada 5 minutos
  private cleanupInterval = setInterval(() => {
    this.cleanup();
  }, 5 * 60 * 1000);

  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now) {
        this.store.delete(key);
      }
    }
  }
}
```

### Flujo de Rate Limiting

```
1. Request llega
   ↓
2. Generar key (userId o IP)
   ↓
3. Buscar entry en store
   ↓
4. Si no existe: crear nueva entry
   Si existe:
     - Verificar si window expiró
     - Si expiró: reset counter
     - Si no expiró: incrementar counter
   ↓
5. Verificar si count > maxRequests
   ↓
6. Si excede:
     - Retornar 429
     - Agregar headers de rate limit
   Si no excede:
     - Agregar headers de rate limit
     - next()
```

---

## Producción: Redis

**NOTA:** En producción, usar Redis para distribuir rate limiting entre instancias.

### Configuración con Redis

```typescript
import Redis from 'ioredis';
import { RateLimiterRedis } from 'rate-limiter-flexible';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379'),
});

const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rate_limit',
  points: 100,        // Máximo de requests
  duration: 15 * 60,  // 15 minutos
});

const rateLimitMiddleware = async (req, res, next) => {
  try {
    const key = req.user?.id || req.ip;
    await rateLimiter.consume(key);
    next();
  } catch (error) {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests',
      },
    });
  }
};
```

---

## Tabla de Rate Limits

| Endpoint | Límite | Ventana | Propósito |
|----------|--------|---------|-----------|
| `/auth/login` | 5 | 15 min | Anti brute-force |
| `/auth/register` | 5 | 15 min | Anti spam |
| `/auth/forgot-password` | 1 | 1 hora | Anti spam emails |
| `/auth/resend-verification` | 3 | 1 hora | Anti spam emails |
| `/api/*` (general) | 100 | 15 min | Anti abuse |
| `/gamification/leaderboards` | 30 | 1 min | Proteger DB |
| `/upload/*` | 10 | 1 hora | Anti abuse storage |

---

## Buenas Prácticas

### 1. Rate Limiters Apropiados

```typescript
// ✓ BIEN - Rate limiter específico para auth
router.post('/api/auth/login',
  authRateLimiter,  // Más restrictivo
  authController.login
);

// ✗ MAL - Rate limiter genérico para auth
router.post('/api/auth/login',
  generalApiRateLimiter,  // Muy permisivo
  authController.login
);
```

### 2. Combinar con General

```typescript
// Aplicar rate limiting general a toda la API
app.use('/api', generalApiRateLimiter);

// Y específicos a endpoints críticos
router.post('/api/auth/login',
  authRateLimiter,  // Más restrictivo que general
  authController.login
);
```

### 3. Claves Únicas

```typescript
// ✓ BIEN - Usar userId si está autenticado
keyGenerator: (req) => req.user?.id || req.ip

// ✗ MAL - Solo IP (usuarios pueden compartir IP)
keyGenerator: (req) => req.ip
```

---

## Documentos Relacionados

- [README de Middleware](./README.md) - Índice de middlewares
- [CORS y Headers](./Seguridad-CORS.md) - Configuración de seguridad

---

**Última revisión:** 2025-11-01
