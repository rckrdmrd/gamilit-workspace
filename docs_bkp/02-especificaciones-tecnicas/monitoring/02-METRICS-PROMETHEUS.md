# Metrics & Monitoring - Prometheus

**Proyecto:** Gamilit Platform
**Módulo:** Monitoring & Observability
**Categoría:** Metrics (Prometheus)
**Archivo original:** MONITORING-OBSERVABILITY.md (líneas 521-914)
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Prometheus Integration

**Status:** ❌ **NO IMPLEMENTADO** (Recomendado)

**Instalación:**
```bash
npm install prom-client
```

**Setup básico:**
```typescript
// src/shared/utils/metrics.ts

import promClient from 'prom-client';

// Create registry
const register = new promClient.Registry();

// Add default metrics (CPU, memory, etc.)
promClient.collectDefaultMetrics({ register });

// Custom metrics
export const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [register],
});

export const httpRequestTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

export { register };
```

---

## Middleware para Métricas HTTP

```typescript
// src/middleware/metrics.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { httpRequestDuration, httpRequestTotal } from '../shared/utils/metrics';

export function metricsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const start = Date.now();

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000; // Convert to seconds

    const route = req.route?.path || req.path;

    httpRequestDuration
      .labels(req.method, route, res.statusCode.toString())
      .observe(duration);

    httpRequestTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();
  });

  next();
}
```

---

## Endpoint para Exponer Métricas

```typescript
// src/modules/metrics/metrics.routes.ts

import { Router, Request, Response } from 'express';
import { register } from '../../shared/utils/metrics';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

export default router;

// En app.ts:
// app.use('/metrics', metricsRouter);
```

---

## Business Metrics

```typescript
export const exerciseMetrics = {
  completed: new promClient.Counter({
    name: 'gamilit_exercises_completed_total',
    help: 'Total exercises completed',
    labelNames: ['type', 'difficulty', 'status'], // status: passed/failed
  }),

  duration: new promClient.Histogram({
    name: 'gamilit_exercise_duration_seconds',
    help: 'Time taken to complete exercises',
    labelNames: ['type', 'difficulty'],
    buckets: [30, 60, 120, 300, 600, 1800], // 30s, 1m, 2m, 5m, 10m, 30m
  }),

  averageScore: new promClient.Gauge({
    name: 'gamilit_exercise_average_score',
    help: 'Average score per exercise type',
    labelNames: ['type', 'difficulty'],
  }),
};

export const gamificationMetrics = {
  mlCoinsEarned: new promClient.Counter({
    name: 'gamilit_ml_coins_earned_total',
    help: 'Total ML Coins earned by users',
    labelNames: ['source'], // 'exercise', 'mission', 'achievement'
  }),

  mlCoinsSpent: new promClient.Counter({
    name: 'gamilit_ml_coins_spent_total',
    help: 'Total ML Coins spent by users',
    labelNames: ['item'], // 'hint', 'skip', 'reveal'
  }),

  rankUps: new promClient.Counter({
    name: 'gamilit_rank_ups_total',
    help: 'Total rank ups achieved',
    labelNames: ['from_rank', 'to_rank'],
  }),

  achievementsUnlocked: new promClient.Counter({
    name: 'gamilit_achievements_unlocked_total',
    help: 'Total achievements unlocked',
    labelNames: ['achievement_type'],
  }),
};

export const userMetrics = {
  registrations: new promClient.Counter({
    name: 'gamilit_user_registrations_total',
    help: 'Total user registrations',
    labelNames: ['role', 'source'],
  }),

  activeUsers: new promClient.Gauge({
    name: 'gamilit_active_users',
    help: 'Currently active users (last 5 minutes)',
    labelNames: ['role'],
  }),

  dailyActiveUsers: new promClient.Gauge({
    name: 'gamilit_daily_active_users',
    help: 'Daily active users (last 24 hours)',
    labelNames: ['role'],
  }),
};
```

---

## Database Metrics

```typescript
export const databaseMetrics = {
  queryDuration: new promClient.Histogram({
    name: 'gamilit_db_query_duration_seconds',
    help: 'Database query duration',
    labelNames: ['operation', 'table', 'status'],
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
  }),

  activeConnections: new promClient.Gauge({
    name: 'gamilit_db_connections_active',
    help: 'Active database connections',
  }),

  poolSize: new promClient.Gauge({
    name: 'gamilit_db_pool_size',
    help: 'Database connection pool size',
    labelNames: ['state'], // idle, active, waiting
  }),

  errors: new promClient.Counter({
    name: 'gamilit_db_errors_total',
    help: 'Total database errors',
    labelNames: ['error_type'], // connection, query, timeout
  }),
};
```

---

## WebSocket Metrics

```typescript
export const websocketMetrics = {
  connections: new promClient.Gauge({
    name: 'gamilit_websocket_connections',
    help: 'Current WebSocket connections',
    labelNames: ['room'], // 'leaderboard', 'chat', 'notifications'
  }),

  messagesTotal: new promClient.Counter({
    name: 'gamilit_websocket_messages_total',
    help: 'Total WebSocket messages',
    labelNames: ['event', 'direction'], // direction: sent/received
  }),

  messageLatency: new promClient.Histogram({
    name: 'gamilit_websocket_message_latency_seconds',
    help: 'WebSocket message latency',
    labelNames: ['event'],
    buckets: [0.01, 0.05, 0.1, 0.5, 1],
  }),
};
```

---

## Uso en Código

```typescript
// Incrementar contador
exerciseMetrics.completed.labels('crucigrama', 'medium', 'passed').inc();

// Observar histograma
exerciseMetrics.duration.labels('crucigrama', 'medium').observe(245);

// Setear gauge
userMetrics.activeUsers.labels('student').set(1523);

// ML Coins
gamificationMetrics.mlCoinsEarned.labels('exercise').inc(20);
gamificationMetrics.rankUps.labels('ixchel', 'chaak').inc();
```

---

**Última actualización:** 2025-11-01
**Owner:** DevOps Team
