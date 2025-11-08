# MONITORING & OBSERVABILITY - GAMILIT PLATFORM

**Proyecto:** Gamilit Platform
**Fecha:** 28 de Octubre, 2025
**Versión:** 1.0
**Estado:** Documento Base

---

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Logging Strategy](#logging-strategy)
3. [Metrics & Monitoring](#metrics--monitoring)
4. [Application Performance Monitoring (APM)](#application-performance-monitoring-apm)
5. [Error Tracking](#error-tracking)
6. [Health Checks](#health-checks)
7. [Alerting](#alerting)
8. [Dashboards](#dashboards)
9. [Distributed Tracing](#distributed-tracing)
10. [Log Management](#log-management)
11. [Security Monitoring](#security-monitoring)
12. [Infrastructure Monitoring](#infrastructure-monitoring)

---

## 1. Introducción

### 1.1 Propósito

Establecer una estrategia completa de **Observability** (observabilidad) para la plataforma Gamilit, permitiendo:
- Detección proactiva de problemas
- Diagnóstico rápido de incidentes
- Optimización de performance
- Mejora continua de la experiencia del usuario
- Auditoría de seguridad

### 1.2 Los Tres Pilares de Observability

```
┌─────────────────────────────────────────────────────┐
│         OBSERVABILITY PILLARS                       │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1. LOGS                                            │
│     ├─ Application logs (Winston)                  │
│     ├─ Access logs (HTTP requests)                 │
│     ├─ Audit logs (security events)                │
│     └─ Error logs (exceptions, failures)           │
│                                                     │
│  2. METRICS                                         │
│     ├─ System metrics (CPU, memory, disk)          │
│     ├─ Application metrics (requests, latency)     │
│     ├─ Business metrics (users, exercises, coins)  │
│     └─ Custom metrics (rank-ups, purchases)        │
│                                                     │
│  3. TRACES                                          │
│     ├─ Distributed tracing (request flows)         │
│     ├─ Performance profiling                       │
│     └─ Database query tracing                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 1.3 Herramientas Recomendadas

| Categoría | Tool | Status | Prioridad |
|-----------|------|--------|-----------|
| **Logging** | Winston | ✅ Implementado | CRÍTICO |
| **Log Aggregation** | ELK Stack / Loki | ❌ No implementado | ALTA |
| **Metrics** | Prometheus | ❌ No implementado | CRÍTICO |
| **Visualization** | Grafana | ❌ No implementado | CRÍTICO |
| **APM** | New Relic / Datadog | ❌ No implementado | ALTA |
| **Error Tracking** | Sentry | ❌ No implementado | CRÍTICO |
| **Uptime Monitoring** | Uptime Robot | ❌ No implementado | MEDIA |
| **Tracing** | Jaeger / Zipkin | ❌ No implementado | MEDIA |

### 1.4 Objetivos SLA/SLO

| Métrica | Target | Actual | Status |
|---------|--------|--------|--------|
| **Uptime** | 99.5% | TBD | 🟡 |
| **Response Time (P95)** | < 500ms | TBD | 🟡 |
| **Error Rate** | < 0.1% | TBD | 🟡 |
| **MTTD (Mean Time to Detect)** | < 5 min | TBD | 🟡 |
| **MTTR (Mean Time to Resolve)** | < 30 min | TBD | 🟡 |
| **Log Retention** | 30 days | TBD | 🟡 |

---

## 2. Logging Strategy

### 2.1 Implementación Actual (Winston)

**Estado:** ✅ **IMPLEMENTADO** (`src/shared/utils/logger.ts`)

```typescript
// Configuración actual de Winston
import winston from 'winston';

export const logger = winston.createLogger({
  level: envConfig.logLevel || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.printf(({ timestamp, level, message, stack }) => {
      return stack
        ? `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`
        : `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  defaultMeta: { service: 'gamilit-backend' },
  transports: [
    new winston.transports.Console({
      format: winston.format.colorize(),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});
```

**Funciones disponibles:**

```typescript
import { log } from '@shared/utils/logger';

log.info('User logged in', { userId: '123', email: 'user@test.com' });
log.warn('Rate limit approaching', { userId: '123', attempts: 4 });
log.error('Database connection failed', error);
log.debug('Cache hit', { key: 'user:123', ttl: 3600 });
```

### 2.2 Niveles de Log

```typescript
// LOG LEVELS (Winston default)
{
  error: 0,   // Errores críticos que requieren atención inmediata
  warn: 1,    // Advertencias que podrían indicar problemas
  info: 2,    // Información general de operaciones importantes
  http: 3,    // HTTP request/response logs
  verbose: 4, // Información detallada para debugging
  debug: 5,   // Debugging information (solo development)
  silly: 6    // Información muy detallada (rara vez usado)
}
```

**Cuándo usar cada nivel:**

| Level | Cuándo usar | Ejemplo |
|-------|-------------|---------|
| **error** | Errores que impiden operaciones críticas | Database connection failed, Payment processing error |
| **warn** | Situaciones anormales que no detienen la app | Rate limit approaching, Deprecated API usage |
| **info** | Eventos importantes del negocio | User registered, Exercise completed, Rank up achieved |
| **http** | HTTP requests/responses | GET /api/exercises - 200 OK - 245ms |
| **debug** | Información de debugging (dev only) | Cache miss, Query execution time, Function parameters |

### 2.3 Log Structure (Structured Logging)

**Recomendación: JSON Format para producción**

```typescript
// Mejorar configuración actual con JSON format

const productionFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const developmentFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} ${level}: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    }`;
  })
);

export const logger = winston.createLogger({
  format: process.env.NODE_ENV === 'production'
    ? productionFormat
    : developmentFormat,
  // ...
});
```

**Ejemplo de log estructurado:**

```json
{
  "timestamp": "2025-10-28T14:32:15.123Z",
  "level": "info",
  "message": "Exercise completed",
  "service": "gamilit-backend",
  "userId": "user-123",
  "exerciseId": "exercise-456",
  "score": 95,
  "mlCoinsEarned": 20,
  "duration": 245,
  "rank": "chaak",
  "environment": "production",
  "hostname": "api-server-01",
  "requestId": "req-789abc"
}
```

### 2.4 Contexto Enriquecido (Request Correlation)

**Middleware para agregar context a logs:**

```typescript
// src/middleware/request-context.middleware.ts

import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../shared/utils/logger';

export function requestContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Generate unique request ID
  const requestId = uuidv4();
  req.requestId = requestId;

  // Add request context to logger
  const requestLogger = logger.child({
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id,
  });

  req.logger = requestLogger;

  // Log request
  requestLogger.http('Incoming request', {
    method: req.method,
    url: req.originalUrl,
    query: req.query,
  });

  // Track response time
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;

    requestLogger.http('Request completed', {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
}
```

### 2.5 Log Categorization

**Categorías de logs importantes:**

#### A. Authentication Logs

```typescript
log.info('User login attempt', {
  category: 'auth',
  email: email,
  success: false,
  reason: 'Invalid credentials',
  ip: req.ip,
});

log.info('User logged in successfully', {
  category: 'auth',
  userId: user.id,
  email: user.email,
  role: user.role,
  ip: req.ip,
  sessionId: session.id,
});

log.warn('Multiple failed login attempts', {
  category: 'auth.security',
  email: email,
  attempts: 5,
  ip: req.ip,
  timestamp: new Date(),
});
```

#### B. Business Events Logs

```typescript
log.info('Exercise completed', {
  category: 'business.exercise',
  userId: userId,
  exerciseId: exerciseId,
  exerciseType: 'crucigrama',
  score: 95,
  mlCoinsEarned: 20,
  duration: 245,
  perfectScore: true,
});

log.info('Rank up achieved', {
  category: 'business.gamification',
  userId: userId,
  oldRank: 'ixchel',
  newRank: 'chaak',
  totalXP: 1500,
  unlockedContent: ['advanced-exercises', 'guild-features'],
});

log.info('Power-up purchased', {
  category: 'business.store',
  userId: userId,
  powerUpType: 'hint',
  quantity: 3,
  mlCoinsSpent: 30,
  remainingCoins: 170,
});
```

#### C. Performance Logs

```typescript
log.debug('Database query executed', {
  category: 'performance.database',
  query: 'SELECT * FROM exercises WHERE difficulty = $1',
  duration: 45,
  rowCount: 23,
});

log.warn('Slow query detected', {
  category: 'performance.database',
  query: 'SELECT * FROM user_progress ...',
  duration: 1200,
  threshold: 1000,
});

log.info('Cache hit', {
  category: 'performance.cache',
  key: 'leaderboard:classroom-123',
  ttl: 300,
});
```

#### D. Error Logs

```typescript
log.error('Database connection failed', {
  category: 'error.database',
  error: error.message,
  stack: error.stack,
  code: error.code,
  retryAttempt: 3,
});

log.error('Payment processing failed', {
  category: 'error.payment',
  userId: userId,
  amount: 9.99,
  provider: 'stripe',
  error: error.message,
  transactionId: txId,
});
```

#### E. Security Logs (Audit)

```typescript
log.warn('IDOR attempt detected', {
  category: 'security.idor',
  userId: attackerId,
  targetUserId: victimId,
  endpoint: '/api/educational/progress/user/:userId',
  ip: req.ip,
  blocked: true,
});

log.warn('SQL injection attempt', {
  category: 'security.sql-injection',
  userId: userId,
  input: sanitized(suspiciousInput),
  endpoint: req.path,
  ip: req.ip,
  blocked: true,
});

log.info('Admin action performed', {
  category: 'security.audit',
  adminId: admin.id,
  action: 'deactivate_user',
  targetUserId: targetUser.id,
  reason: 'Terms violation',
  timestamp: new Date(),
});
```

### 2.6 Log Aggregation (Recomendado)

**Option 1: ELK Stack (Elasticsearch + Logstash + Kibana)**

```yaml
# docker-compose.yml for ELK Stack

version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data

  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline
    ports:
      - "5044:5044"
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch

volumes:
  elasticsearch-data:
```

**Winston transport para Elasticsearch:**

```typescript
import { ElasticsearchTransport } from 'winston-elasticsearch';

const esTransportOpts = {
  level: 'info',
  clientOpts: {
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
  },
  index: 'gamilit-logs',
};

logger.add(new ElasticsearchTransport(esTransportOpts));
```

**Option 2: Grafana Loki (Lightweight)**

```typescript
import LokiTransport from 'winston-loki';

logger.add(
  new LokiTransport({
    host: 'http://localhost:3100',
    labels: { app: 'gamilit-backend', environment: 'production' },
    json: true,
    format: winston.format.json(),
    replaceTimestamp: true,
    onConnectionError: (err) => console.error('Loki connection error:', err),
  })
);
```

### 2.7 Log Rotation

**Winston file rotation (ya implementado básicamente):**

```typescript
new winston.transports.File({
  filename: 'logs/combined.log',
  maxsize: 5242880,  // 5MB
  maxFiles: 5,       // Keep last 5 files
});
```

**Mejorar con winston-daily-rotate-file:**

```typescript
import DailyRotateFile from 'winston-daily-rotate-file';

logger.add(
  new DailyRotateFile({
    filename: 'logs/application-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d', // Keep logs for 30 days
    zippedArchive: true,
  })
);
```

---

## 3. Metrics & Monitoring

### 3.1 Prometheus Integration

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

export const activeUsers = new promClient.Gauge({
  name: 'active_users_total',
  help: 'Number of currently active users',
  registers: [register],
});

export const exercisesCompleted = new promClient.Counter({
  name: 'exercises_completed_total',
  help: 'Total number of completed exercises',
  labelNames: ['exercise_type', 'difficulty'],
  registers: [register],
});

export const mlCoinsDistributed = new promClient.Counter({
  name: 'ml_coins_distributed_total',
  help: 'Total ML Coins distributed to users',
  labelNames: ['reason'], // 'exercise', 'mission', 'achievement'
  registers: [register],
});

export const databaseQueryDuration = new promClient.Histogram({
  name: 'database_query_duration_seconds',
  help: 'Duration of database queries',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.01, 0.05, 0.1, 0.5, 1],
  registers: [register],
});

export { register };
```

**Middleware para capturar métricas HTTP:**

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

**Endpoint para exponer métricas:**

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

### 3.2 Métricas de Aplicación

#### A. System Metrics (Default de Prometheus)

```typescript
// Métricas automáticas de prom-client.collectDefaultMetrics():

- process_cpu_user_seconds_total
- process_cpu_system_seconds_total
- process_heap_bytes
- process_resident_memory_bytes
- nodejs_eventloop_lag_seconds
- nodejs_active_handles_total
- nodejs_active_requests_total
- nodejs_version_info
```

#### B. HTTP Metrics

```typescript
// Request rate
http_requests_total{method="GET", route="/api/exercises", status_code="200"} 1523

// Request duration
http_request_duration_seconds_bucket{method="POST", route="/api/exercises/:id/submit", status_code="200", le="0.1"} 145
http_request_duration_seconds_bucket{method="POST", route="/api/exercises/:id/submit", status_code="200", le="0.5"} 198
http_request_duration_seconds_sum{method="POST", route="/api/exercises/:id/submit", status_code="200"} 87.3
http_request_duration_seconds_count{method="POST", route="/api/exercises/:id/submit", status_code="200"} 200

// Error rate
http_requests_total{method="GET", route="/api/exercises", status_code="500"} 3
```

#### C. Business Metrics

```typescript
// Custom business metrics

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

// Usage in code:
exerciseMetrics.completed.labels('crucigrama', 'medium', 'passed').inc();
exerciseMetrics.duration.labels('crucigrama', 'medium').observe(245);
gamificationMetrics.mlCoinsEarned.labels('exercise').inc(20);
gamificationMetrics.rankUps.labels('ixchel', 'chaak').inc();
```

#### D. Database Metrics

```typescript
export const databaseMetrics = {
  queryDuration: new promClient.Histogram({
    name: 'gamilit_db_query_duration_seconds',
    help: 'Database query duration',
    labelNames: ['operation', 'table', 'status'], // operation: SELECT, INSERT, UPDATE, DELETE
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

// Wrapper para queries con métricas
export async function queryWithMetrics(
  sql: string,
  params: any[],
  operation: string,
  table: string
) {
  const end = databaseMetrics.queryDuration.startTimer({
    operation,
    table,
    status: 'success',
  });

  try {
    const result = await pool.query(sql, params);
    end();
    return result;
  } catch (error) {
    databaseMetrics.queryDuration
      .labels(operation, table, 'error')
      .observe(0);
    databaseMetrics.errors.labels('query').inc();
    throw error;
  }
}
```

#### E. WebSocket Metrics

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

### 3.3 Grafana Dashboards

**Dashboard JSON (ejemplo - Gamilit Overview):**

```json
{
  "dashboard": {
    "title": "Gamilit Platform - Overview",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Request Duration (P95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Active Users",
        "targets": [
          {
            "expr": "gamilit_active_users"
          }
        ],
        "type": "stat"
      },
      {
        "title": "Exercises Completed (Last Hour)",
        "targets": [
          {
            "expr": "sum(increase(gamilit_exercises_completed_total[1h]))"
          }
        ],
        "type": "stat"
      },
      {
        "title": "ML Coins Earned/Spent",
        "targets": [
          {
            "expr": "rate(gamilit_ml_coins_earned_total[5m])",
            "legendFormat": "Earned"
          },
          {
            "expr": "rate(gamilit_ml_coins_spent_total[5m])",
            "legendFormat": "Spent"
          }
        ],
        "type": "graph"
      },
      {
        "title": "Database Query Performance",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(gamilit_db_query_duration_seconds_bucket[5m]))"
          }
        ],
        "type": "graph"
      }
    ]
  }
}
```

---

## 4. Application Performance Monitoring (APM)

### 4.1 Herramientas Recomendadas

**Option 1: New Relic**

```typescript
// Install
npm install newrelic

// newrelic.js (root directory)
exports.config = {
  app_name: ['Gamilit Platform'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: 'info',
  },
  allow_all_headers: true,
  attributes: {
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
    ],
  },
  transaction_tracer: {
    enabled: true,
    record_sql: 'obfuscated',
  },
};

// En server.ts (DEBE SER LA PRIMERA LÍNEA)
import 'newrelic';
import express from 'express';
// ...
```

**Option 2: Datadog**

```typescript
// Install
npm install dd-trace

// En server.ts (PRIMERA LÍNEA)
import tracer from 'dd-trace';

tracer.init({
  service: 'gamilit-backend',
  env: process.env.NODE_ENV,
  version: '1.0.0',
  logInjection: true,
  runtimeMetrics: true,
});

// Resto de imports
import express from 'express';
// ...
```

**Option 3: Open Source - Elastic APM**

```typescript
// Install
npm install elastic-apm-node

// En server.ts (PRIMERA LÍNEA)
const apm = require('elastic-apm-node').start({
  serviceName: 'gamilit-backend',
  serverUrl: process.env.ELASTIC_APM_SERVER_URL,
  environment: process.env.NODE_ENV,
});
```

### 4.2 Custom Instrumentation

```typescript
// Trace specific functions
import tracer from 'dd-trace';

export async function calculateRankUp(userId: string) {
  const span = tracer.startSpan('rank.calculate_rank_up');
  span.setTag('user.id', userId);

  try {
    const currentRank = await getUserRank(userId);
    span.setTag('rank.current', currentRank.rankId);

    const shouldRankUp = await checkRankUpEligibility(userId, currentRank);

    if (shouldRankUp) {
      const newRank = await promoteUser(userId);
      span.setTag('rank.new', newRank.rankId);
      span.setTag('rank.promoted', true);
      return newRank;
    }

    span.setTag('rank.promoted', false);
    return currentRank;
  } catch (error) {
    span.setTag('error', true);
    span.setTag('error.message', error.message);
    throw error;
  } finally {
    span.finish();
  }
}
```

### 4.3 Frontend Performance Monitoring

**Option 1: Sentry Performance**

```typescript
// Install
npm install @sentry/react

// src/main.tsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    new Sentry.BrowserTracing({
      tracePropagationTargets: ['localhost', /^https:\/\/api\.gamilit\.com/],
      routingInstrumentation: Sentry.reactRouterV6Instrumentation(
        React.useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes
      ),
    }),
    new Sentry.Replay({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  tracesSampleRate: 1.0, // 100% in dev, lower in prod (0.1 = 10%)
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% if error
});
```

**Option 2: Google Analytics + Web Vitals**

```typescript
// Install
npm install web-vitals

// src/utils/reportWebVitals.ts
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Send to Google Analytics
  if (window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }

  // Also send to custom backend
  fetch('/api/metrics/web-vitals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metric),
  });
}

export function reportWebVitals() {
  getCLS(sendToAnalytics);
  getFID(sendToAnalytics);
  getFCP(sendToAnalytics);
  getLCP(sendToAnalytics);
  getTTFB(sendToAnalytics);
}

// En main.tsx
import { reportWebVitals } from './utils/reportWebVitals';
reportWebVitals();
```

---

## 5. Error Tracking

### 5.1 Sentry Integration (Recomendado)

**Status:** ❌ **NO IMPLEMENTADO**

**Backend:**

```typescript
// Install
npm install @sentry/node @sentry/profiling-node

// src/shared/utils/sentry.ts
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

export function initSentry() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: `gamilit-backend@${process.env.npm_package_version}`,

    integrations: [
      new ProfilingIntegration(),
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app: express() }),
      new Sentry.Integrations.Postgres(),
    ],

    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    profilesSampleRate: 1.0,

    beforeSend(event, hint) {
      // Filter out sensitive data
      if (event.request) {
        delete event.request.cookies;
        delete event.request.headers?.authorization;
      }

      return event;
    },
  });
}

// En app.ts
import { initSentry } from './shared/utils/sentry';
import * as Sentry from '@sentry/node';

initSentry();

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// ... routes ...

app.use(Sentry.Handlers.errorHandler());
```

**Frontend:**

```typescript
// Install
npm install @sentry/react

// src/utils/sentry.ts
import * as Sentry from '@sentry/react';
import { BrowserRouter } from 'react-router-dom';

export function initSentry() {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    release: `gamilit-frontend@${import.meta.env.VITE_APP_VERSION}`,

    integrations: [
      new Sentry.BrowserTracing({
        routingInstrumentation: Sentry.reactRouterV6Instrumentation(
          React.useEffect,
          useLocation,
          useNavigationType,
          createRoutesFromChildren,
          matchRoutes
        ),
      }),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    tracesSampleRate: import.meta.env.MODE === 'production' ? 0.1 : 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    beforeSend(event, hint) {
      // Add user context
      const user = useAuthStore.getState().user;
      if (user) {
        Sentry.setUser({
          id: user.id,
          email: user.email,
          role: user.role,
        });
      }

      return event;
    },
  });
}

// Wrap app with ErrorBoundary
import { ErrorBoundary } from '@sentry/react';

<ErrorBoundary
  fallback={<ErrorFallback />}
  showDialog
  dialogOptions={{
    title: 'Ha ocurrido un error',
    subtitle: 'Nuestro equipo ha sido notificado.',
    user: {
      email: user?.email,
      name: user?.fullName,
    },
  }}
>
  <App />
</ErrorBoundary>
```

### 5.2 Error Context Enrichment

```typescript
// Add custom context to errors
import * as Sentry from '@sentry/node';

try {
  await submitExercise(exerciseId, answers);
} catch (error) {
  Sentry.withScope((scope) => {
    scope.setTag('module', 'educational');
    scope.setTag('operation', 'submit_exercise');
    scope.setContext('exercise', {
      id: exerciseId,
      type: exercise.type,
      difficulty: exercise.difficulty,
    });
    scope.setContext('user', {
      id: userId,
      rank: userRank,
      mlCoins: userCoins,
    });
    scope.setLevel('error');

    Sentry.captureException(error);
  });

  throw error;
}
```

### 5.3 Error Categorization

```typescript
// Custom error classes for better categorization

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string, public requiredPermission?: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ExternalServiceError extends Error {
  constructor(message: string, public service: string) {
    super(message);
    this.name = 'ExternalServiceError';
  }
}

// Usage
throw new ValidationError('Invalid email format', 'email');
throw new AuthorizationError('Missing admin permission', 'admin:users:delete');
throw new DatabaseError('Connection timeout', originalError);
```

---

## 6. Health Checks

### 6.1 Implementación Actual

**Status:** ✅ **IMPLEMENTADO** (`src/modules/health/health.routes.ts`)

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

### 6.2 Mejorar Health Checks

**Agregar más componentes:**

```typescript
// src/modules/health/health.service.ts

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

  async checkExternalAPIs(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      fetch('https://api.stripe.com/v1/health').then((r) => r.json()),
      // Add other external APIs
    ]);

    const allHealthy = checks.every((c) => c.status === 'fulfilled');

    return {
      status: allHealthy ? 'healthy' : 'degraded',
      details: checks,
    };
  }

  async getOverallHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: Record<string, HealthStatus>;
  }> {
    const [database, redis, externalAPIs] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkExternalAPIs(),
    ]);

    const components = { database, redis, externalAPIs };

    // Determine overall status
    const unhealthy = Object.values(components).some((c) => c.status === 'unhealthy');
    const degraded = Object.values(components).some((c) => c.status === 'degraded');

    const status = unhealthy ? 'unhealthy' : degraded ? 'degraded' : 'healthy';

    return { status, components };
  }
}
```

### 6.3 Readiness vs Liveness Probes

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

### 6.4 Uptime Monitoring

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

## 7. Alerting

### 7.1 Alert Rules (Prometheus + Alertmanager)

**alert.rules.yml:**

```yaml
groups:
  - name: gamilit_alerts
    interval: 30s
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status_code=~"5.."}[5m]))
          /
          sum(rate(http_requests_total[5m]))
          > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }} (threshold: 5%)"

      # Slow response time
      - alert: SlowResponseTime
        expr: |
          histogram_quantile(0.95,
            rate(http_request_duration_seconds_bucket[5m])
          ) > 1
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Slow API response time"
          description: "P95 response time is {{ $value }}s (threshold: 1s)"

      # Database connection issues
      - alert: DatabaseConnectionPoolExhausted
        expr: gamilit_db_pool_size{state="waiting"} > 5
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Database connection pool exhausted"
          description: "{{ $value }} queries waiting for connections"

      # Memory usage high
      - alert: HighMemoryUsage
        expr: |
          (process_resident_memory_bytes / 1024 / 1024) > 512
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value }}MB (threshold: 512MB)"

      # Low disk space
      - alert: LowDiskSpace
        expr: |
          (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"})
          < 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Low disk space"
          description: "Only {{ $value | humanizePercentage }} disk space available"

      # Service down
      - alert: ServiceDown
        expr: up{job="gamilit-backend"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Gamilit backend service is down"
          description: "Service {{ $labels.instance }} is unreachable"

      # Business metrics alerts
      - alert: NoExercisesCompletedIn1Hour
        expr: |
          sum(increase(gamilit_exercises_completed_total[1h])) == 0
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "No exercises completed in the last hour"
          description: "This might indicate a problem with the exercise system"

      - alert: AbnormallyHighRankUps
        expr: |
          sum(rate(gamilit_rank_ups_total[5m])) > 10
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Abnormally high rank-up rate"
          description: "{{ $value }} rank-ups per second (possible exploit?)"
```

### 7.2 Alertmanager Configuration

**alertmanager.yml:**

```yaml
global:
  resolve_timeout: 5m
  slack_api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'

route:
  group_by: ['alertname', 'severity']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'team-alerts'

  routes:
    - match:
        severity: critical
      receiver: 'critical-alerts'
      continue: true

    - match:
        severity: warning
      receiver: 'warning-alerts'

receivers:
  - name: 'team-alerts'
    email_configs:
      - to: 'team@gamilit.com'
        from: 'alerts@gamilit.com'
        smarthost: 'smtp.gmail.com:587'
        auth_username: 'alerts@gamilit.com'
        auth_password: 'password'

  - name: 'critical-alerts'
    slack_configs:
      - channel: '#alerts-critical'
        title: '🚨 CRITICAL: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
    pagerduty_configs:
      - service_key: 'YOUR_PAGERDUTY_KEY'

  - name: 'warning-alerts'
    slack_configs:
      - channel: '#alerts-warning'
        title: '⚠️ WARNING: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
```

### 7.3 On-Call Rotation

**PagerDuty / Opsgenie Setup:**

```yaml
# Example schedule
Schedule:
  - Week 1: John Doe (Engineering Lead)
  - Week 2: Jane Smith (Backend Dev)
  - Week 3: Bob Johnson (DevOps)
  - Week 4: Alice Williams (Full Stack)

Escalation Policy:
  Level 1: On-call engineer (immediately)
  Level 2: Team lead (after 15 minutes)
  Level 3: CTO (after 30 minutes)

Alert Channels:
  - Phone call (critical only)
  - SMS (critical + high)
  - Slack (all severities)
  - Email (all severities)
```

---

## 8. Dashboards

### 8.1 Grafana Dashboards Completos

**Dashboard 1: System Overview**

```json
{
  "title": "Gamilit - System Overview",
  "panels": [
    {
      "title": "Request Rate",
      "gridPos": { "x": 0, "y": 0, "w": 12, "h": 8 },
      "targets": [
        {
          "expr": "sum(rate(http_requests_total[5m])) by (status_code)",
          "legendFormat": "{{ status_code }}"
        }
      ]
    },
    {
      "title": "Response Time (P50, P95, P99)",
      "gridPos": { "x": 12, "y": 0, "w": 12, "h": 8 },
      "targets": [
        {
          "expr": "histogram_quantile(0.50, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
          "legendFormat": "P50"
        },
        {
          "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
          "legendFormat": "P95"
        },
        {
          "expr": "histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
          "legendFormat": "P99"
        }
      ]
    },
    {
      "title": "Error Rate",
      "gridPos": { "x": 0, "y": 8, "w": 8, "h": 6 },
      "targets": [
        {
          "expr": "sum(rate(http_requests_total{status_code=~\"5..\"}[5m])) / sum(rate(http_requests_total[5m]))"
        }
      ]
    },
    {
      "title": "Active Users",
      "gridPos": { "x": 8, "y": 8, "w": 8, "h": 6 },
      "targets": [
        {
          "expr": "gamilit_active_users"
        }
      ]
    },
    {
      "title": "Database Query Performance",
      "gridPos": { "x": 16, "y": 8, "w": 8, "h": 6 },
      "targets": [
        {
          "expr": "histogram_quantile(0.95, rate(gamilit_db_query_duration_seconds_bucket[5m]))"
        }
      ]
    }
  ]
}
```

**Dashboard 2: Business Metrics**

```json
{
  "title": "Gamilit - Business Metrics",
  "panels": [
    {
      "title": "Exercises Completed (by type)",
      "targets": [
        {
          "expr": "sum(increase(gamilit_exercises_completed_total[1h])) by (type)"
        }
      ]
    },
    {
      "title": "ML Coins Economy",
      "targets": [
        {
          "expr": "sum(rate(gamilit_ml_coins_earned_total[5m]))",
          "legendFormat": "Earned"
        },
        {
          "expr": "sum(rate(gamilit_ml_coins_spent_total[5m]))",
          "legendFormat": "Spent"
        }
      ]
    },
    {
      "title": "Rank Distribution",
      "type": "piechart",
      "targets": [
        {
          "expr": "sum(gamilit_users_by_rank) by (rank)"
        }
      ]
    },
    {
      "title": "Daily Active Users Trend",
      "targets": [
        {
          "expr": "gamilit_daily_active_users"
        }
      ]
    }
  ]
}
```

**Dashboard 3: Database Performance**

```json
{
  "title": "Gamilit - Database Performance",
  "panels": [
    {
      "title": "Query Duration by Table",
      "targets": [
        {
          "expr": "histogram_quantile(0.95, rate(gamilit_db_query_duration_seconds_bucket[5m])) by (table)"
        }
      ]
    },
    {
      "title": "Connection Pool Status",
      "targets": [
        {
          "expr": "gamilit_db_pool_size",
          "legendFormat": "{{ state }}"
        }
      ]
    },
    {
      "title": "Database Errors",
      "targets": [
        {
          "expr": "sum(rate(gamilit_db_errors_total[5m])) by (error_type)"
        }
      ]
    },
    {
      "title": "Slow Queries (> 100ms)",
      "targets": [
        {
          "expr": "sum(rate(gamilit_db_query_duration_seconds_bucket{le=\"0.1\"}[5m])) by (table)"
        }
      ]
    }
  ]
}
```

### 8.2 Custom Grafana Variables

```json
{
  "templating": {
    "list": [
      {
        "name": "environment",
        "type": "custom",
        "options": ["production", "staging", "development"]
      },
      {
        "name": "time_range",
        "type": "interval",
        "options": ["5m", "15m", "1h", "6h", "24h", "7d"]
      },
      {
        "name": "exercise_type",
        "type": "query",
        "query": "label_values(gamilit_exercises_completed_total, type)"
      }
    ]
  }
}
```

---

## 9. Distributed Tracing

### 9.1 OpenTelemetry Setup

**Install:**

```bash
npm install @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node
```

**Configuration:**

```typescript
// src/shared/utils/tracing.ts

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'gamilit-backend',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  }),
  traceExporter: new JaegerExporter({
    endpoint: 'http://localhost:14268/api/traces',
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-http': {
        enabled: true,
      },
      '@opentelemetry/instrumentation-express': {
        enabled: true,
      },
      '@opentelemetry/instrumentation-pg': {
        enabled: true,
      },
    }),
  ],
});

sdk.start();

process.on('SIGTERM', () => {
  sdk
    .shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.error('Error shutting down tracing', error))
    .finally(() => process.exit(0));
});
```

**Usage:**

```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('gamilit-backend');

export async function submitExercise(exerciseId: string, answers: any) {
  return tracer.startActiveSpan('submitExercise', async (span) => {
    span.setAttribute('exercise.id', exerciseId);
    span.setAttribute('exercise.type', exercise.type);

    try {
      // Validate answers
      const validationSpan = tracer.startSpan('validateAnswers');
      const isValid = await validateAnswers(answers);
      validationSpan.end();

      // Calculate score
      const scoringSpan = tracer.startSpan('calculateScore');
      const score = await calculateScore(answers);
      scoringSpan.setAttribute('score', score);
      scoringSpan.end();

      // Award coins
      const coinsSpan = tracer.startSpan('awardMLCoins');
      const coins = await awardMLCoins(userId, score);
      coinsSpan.setAttribute('coins.earned', coins);
      coinsSpan.end();

      span.setStatus({ code: SpanStatusCode.OK });
      return { score, coins };
    } catch (error) {
      span.recordException(error);
      span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
      throw error;
    } finally {
      span.end();
    }
  });
}
```

---

## 10. Log Management

### 10.1 Log Aggregation Pipeline

```
┌──────────────┐
│ Application  │
│   (Winston)  │
└──────┬───────┘
       │
       │ JSON logs
       ▼
┌──────────────┐
│  Fluentd /   │  ← Log collector
│  Logstash    │
└──────┬───────┘
       │
       │ Parsed & enriched
       ▼
┌──────────────┐
│ Elasticsearch│  ← Storage
└──────┬───────┘
       │
       │ Query
       ▼
┌──────────────┐
│   Kibana     │  ← Visualization
└──────────────┘
```

### 10.2 Log Retention Policy

| Log Type | Retention | Storage | Archive |
|----------|-----------|---------|---------|
| **Application Logs** | 30 days (hot) | Elasticsearch | 1 year (S3) |
| **Access Logs** | 90 days (hot) | Elasticsearch | 1 year (S3) |
| **Audit Logs** | 1 year (hot) | Elasticsearch | 7 years (S3) |
| **Error Logs** | 90 days (hot) | Elasticsearch | 2 years (S3) |
| **Security Logs** | 1 year (hot) | Elasticsearch | 7 years (S3) |

### 10.3 Log Queries (Kibana/Elasticsearch)

**Ejemplos de queries útiles:**

```
# Find all errors in last hour
level: "error" AND timestamp: [now-1h TO now]

# Find login attempts from specific IP
category: "auth" AND ip: "192.168.1.100"

# Find slow database queries
category: "performance.database" AND duration: >1000

# Find IDOR attempts
category: "security.idor" AND blocked: true

# Find exercises completed by type
category: "business.exercise" AND exerciseType: "crucigrama"

# Find all rank-ups today
category: "business.gamification" AND message: "Rank up achieved" AND timestamp: [now/d TO now]
```

---

## 11. Security Monitoring

### 11.1 Security Events to Monitor

```typescript
// Security logging helper
export class SecurityLogger {
  static logAuthAttempt(success: boolean, context: any) {
    logger.warn('Authentication attempt', {
      category: 'security.auth',
      success,
      email: context.email,
      ip: context.ip,
      userAgent: context.userAgent,
      timestamp: new Date(),
    });
  }

  static logIDORAttempt(context: any) {
    logger.error('IDOR attempt detected', {
      category: 'security.idor',
      attackerId: context.userId,
      targetUserId: context.targetUserId,
      endpoint: context.endpoint,
      ip: context.ip,
      blocked: true,
    });

    // Also send to Sentry
    Sentry.captureMessage('IDOR attempt', {
      level: 'warning',
      tags: {
        security: 'idor',
        attacker: context.userId,
      },
      extra: context,
    });
  }

  static logSQLInjectionAttempt(context: any) {
    logger.error('SQL injection attempt detected', {
      category: 'security.sql-injection',
      userId: context.userId,
      input: context.sanitizedInput,
      endpoint: context.endpoint,
      ip: context.ip,
      blocked: true,
    });
  }

  static logRateLimitExceeded(context: any) {
    logger.warn('Rate limit exceeded', {
      category: 'security.rate-limit',
      userId: context.userId,
      ip: context.ip,
      endpoint: context.endpoint,
      attempts: context.attempts,
      window: context.window,
    });
  }

  static logSuspiciousActivity(context: any) {
    logger.error('Suspicious activity detected', {
      category: 'security.suspicious',
      userId: context.userId,
      activity: context.activity,
      reason: context.reason,
      ip: context.ip,
      metadata: context.metadata,
    });
  }
}
```

### 11.2 Security Alerts

```yaml
# Alert on multiple failed login attempts
- alert: BruteForceAttackDetected
  expr: |
    sum(rate(security_auth_failed_total{ip!=""}[5m])) by (ip) > 10
  for: 5m
  labels:
    severity: critical
  annotations:
    summary: "Brute force attack detected"
    description: "IP {{ $labels.ip }} has {{ $value }} failed login attempts"

# Alert on IDOR attempts
- alert: IDORAttackDetected
  expr: |
    sum(increase(security_idor_attempts_total[5m])) > 0
  for: 1m
  labels:
    severity: critical
  annotations:
    summary: "IDOR attack detected"
    description: "{{ $value }} IDOR attempts in last 5 minutes"

# Alert on SQL injection attempts
- alert: SQLInjectionDetected
  expr: |
    sum(increase(security_sql_injection_attempts_total[5m])) > 0
  for: 1m
  labels:
    severity: critical
  annotations:
    summary: "SQL injection attack detected"
```

---

## 12. Infrastructure Monitoring

### 12.1 Node Exporter Metrics

**System metrics to monitor:**

```yaml
CPU:
  - node_cpu_seconds_total
  - node_load1, node_load5, node_load15

Memory:
  - node_memory_MemTotal_bytes
  - node_memory_MemAvailable_bytes
  - node_memory_Cached_bytes

Disk:
  - node_filesystem_avail_bytes
  - node_filesystem_size_bytes
  - node_disk_io_time_seconds_total

Network:
  - node_network_receive_bytes_total
  - node_network_transmit_bytes_total
  - node_network_receive_errors_total
```

### 12.2 Docker Monitoring

**cAdvisor metrics:**

```yaml
Container CPU:
  - container_cpu_usage_seconds_total
  - container_cpu_system_seconds_total

Container Memory:
  - container_memory_usage_bytes
  - container_memory_cache
  - container_memory_rss

Container Network:
  - container_network_receive_bytes_total
  - container_network_transmit_bytes_total
```

### 12.3 PostgreSQL Monitoring

**PostgreSQL Exporter:**

```yaml
Connections:
  - pg_stat_database_numbackends
  - pg_settings_max_connections

Queries:
  - pg_stat_statements_calls_total
  - pg_stat_statements_mean_time_seconds

Replication:
  - pg_replication_lag_seconds

Cache:
  - pg_stat_database_blks_hit
  - pg_stat_database_blks_read
```

---

## Resumen Ejecutivo

### Estado Actual de Observability

**Implementado (✅):**
1. **Logging básico** - Winston con file rotation
2. **Health checks** - Basic, DB, y Detailed endpoints
3. **Structured logging** - JSON format configurado

**No Implementado (❌):**
1. **Log Aggregation** - ELK Stack / Loki
2. **Metrics** - Prometheus + Grafana
3. **APM** - New Relic / Datadog
4. **Error Tracking** - Sentry
5. **Distributed Tracing** - Jaeger / Zipkin
6. **Alerting** - Alertmanager
7. **Uptime Monitoring** - Uptime Robot

### Prioridades de Implementación

**Fase 1 - Crítico (Próximas 2 semanas):**
1. 🔴 Sentry para error tracking (backend + frontend)
2. 🔴 Prometheus + Grafana para metrics
3. 🔴 Uptime Robot para monitoring externo
4. 🔴 Mejorar logging con request correlation

**Fase 2 - Alta (Próximo mes):**
1. 🟡 Alertmanager + PagerDuty para on-call
2. 🟡 APM (New Relic o Datadog)
3. 🟡 ELK Stack para log aggregation
4. 🟡 Custom business metrics dashboard

**Fase 3 - Media (Próximos 2-3 meses):**
1. 🟢 Distributed tracing (OpenTelemetry + Jaeger)
2. 🟢 Advanced security monitoring
3. 🟢 Custom anomaly detection
4. 🟢 Automated runbooks

### Métricas Clave a Monitorear

**Golden Signals:**
1. **Latency** - Response time P50, P95, P99
2. **Traffic** - Requests per second
3. **Errors** - Error rate percentage
4. **Saturation** - CPU, memory, database connections

**Business Metrics:**
1. Exercises completed per hour
2. ML Coins earned/spent ratio
3. Rank-up rate
4. Daily/Monthly active users
5. Average session duration

---

**Documento creado:** 28 de Octubre, 2025
**Próxima revisión:** Mensual
**Owner:** DevOps Team + SRE Team
