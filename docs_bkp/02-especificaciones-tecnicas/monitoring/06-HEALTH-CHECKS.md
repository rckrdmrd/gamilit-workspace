# Health Checks

**Proyecto:** Gamilit Platform
**Módulo:** Monitoring & Observability
**Categoría:** Health Checks & Uptime
**Archivo original:** MONITORING-OBSERVABILITY.md (líneas 1308-1520)
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Implementación Actual

**Estado:** ✅ **IMPLEMENTADO** (`src/modules/health/health.routes.ts`)

**Endpoints disponibles:**

```typescript
// Basic health check
GET /api/health
Response: {
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-10-28T14:32:15.123Z",
    "uptime": 3600,
    "environment": "production",
    "version": "1.0.0"
  }
}

// Database health
GET /api/health/db
Response: {
  "success": true,
  "data": {
    "status": "connected",
    "responseTime": "23ms",
    "serverTime": "2025-10-28T14:32:15.123Z",
    "version": "PostgreSQL 16.1",
    "pool": {
      "total": 20,
      "idle": 15,
      "waiting": 0
    }
  }
}

// Detailed health check
GET /api/health/detailed
Response: {
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-10-28T14:32:15.123Z",
    "system": {
      "uptime": 3600,
      "environment": "production",
      "nodeVersion": "v20.10.0",
      "platform": "linux",
      "memory": {
        "total": 134217728,
        "used": 89478485,
        "external": 2097152
      }
    },
    "database": {
      "status": "connected",
      "responseTime": "23ms",
      "pool": {
        "total": 20,
        "idle": 15,
        "waiting": 0
      }
    }
  }
}
```

---

## Mejorar Health Checks

```typescript
export class HealthService {
  async checkDatabase(): Promise<HealthStatus> {
    try {
      const start = Date.now();
      await pool.query('SELECT 1');
      const duration = Date.now() - start;

      return {
        status: duration < 100 ? 'healthy' : 'degraded',
        responseTime: `${duration}ms`,
        details: getPoolStats(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }

  async checkRedis(): Promise<HealthStatus> {
    try {
      const start = Date.now();
      await redis.ping();
      const duration = Date.now() - start;

      return {
        status: 'healthy',
        responseTime: `${duration}ms`,
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
      };
    }
  }

  async getOverallHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: Record<string, HealthStatus>;
  }> {
    const [database, redis] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
    ]);

    const components = { database, redis };

    const unhealthy = Object.values(components).some((c) => c.status === 'unhealthy');
    const degraded = Object.values(components).some((c) => c.status === 'degraded');

    const status = unhealthy ? 'unhealthy' : degraded ? 'degraded' : 'healthy';

    return { status, components };
  }
}
```

---

## Readiness vs Liveness Probes

**Kubernetes-style health checks:**

```typescript
// GET /health/live - Liveness probe (is app running?)
router.get('/live', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// GET /health/ready - Readiness probe (can app handle traffic?)
router.get('/ready', async (req, res) => {
  const health = await healthService.getOverallHealth();

  if (health.status === 'unhealthy') {
    return res.status(503).json({
      status: 'not ready',
      components: health.components,
    });
  }

  res.json({
    status: 'ready',
    components: health.components,
  });
});
```

---

## Uptime Monitoring

**External monitoring tools:**

- **Uptime Robot** (Free tier: 50 monitors, 5-min intervals)
- **Pingdom** (Paid, more features)
- **Better Uptime** (Modern, good free tier)

**Setup (Uptime Robot example):**
```
Monitor 1:
  Type: HTTP(s)
  URL: https://api.gamilit.com/api/health
  Interval: 5 minutes
  Alert: Email, Slack

Monitor 2:
  Type: HTTP(s)
  URL: https://gamilit.com
  Interval: 5 minutes

Monitor 3:
  Type: Keyword
  URL: https://api.gamilit.com/api/health
  Keyword: "healthy"
  Alert if NOT found
```

---

**Última actualización:** 2025-11-01
**Owner:** DevOps Team
