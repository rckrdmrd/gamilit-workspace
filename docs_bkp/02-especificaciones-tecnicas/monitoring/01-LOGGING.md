# Logging Strategy

**Proyecto:** Gamilit Platform
**Módulo:** Monitoring & Observability
**Categoría:** Logging (Winston)
**Archivo original:** MONITORING-OBSERVABILITY.md (líneas 90-520)
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Implementación Actual (Winston)

**Estado:** ✅ **IMPLEMENTADO** (`src/shared/utils/logger.ts`)

```typescript
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

---

## Niveles de Log

```typescript
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

---

## Cuándo Usar Cada Nivel

| Level | Cuándo usar | Ejemplo |
|-------|-------------|---------|
| **error** | Errores que impiden operaciones críticas | Database connection failed, Payment processing error |
| **warn** | Situaciones anormales que no detienen la app | Rate limit approaching, Deprecated API usage |
| **info** | Eventos importantes del negocio | User registered, Exercise completed, Rank up achieved |
| **http** | HTTP requests/responses | GET /api/exercises - 200 OK - 245ms |
| **debug** | Información de debugging (dev only) | Cache miss, Query execution time |

---

## Structured Logging (JSON Format)

**Recomendación para producción:**

```typescript
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

---

## Request Context Middleware

```typescript
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../shared/utils/logger';

export function requestContextMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const requestId = uuidv4();
  req.requestId = requestId;

  const requestLogger = logger.child({
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    userId: req.user?.id,
  });

  req.logger = requestLogger;

  requestLogger.http('Incoming request', {
    method: req.method,
    url: req.originalUrl,
    query: req.query,
  });

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

---

## Categorización de Logs

### Authentication Logs
```typescript
log.info('User login attempt', {
  category: 'auth',
  email: email,
  success: false,
  reason: 'Invalid credentials',
  ip: req.ip,
});
```

### Business Events Logs
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
```

### Performance Logs
```typescript
log.debug('Database query executed', {
  category: 'performance.database',
  query: 'SELECT * FROM exercises WHERE difficulty = $1',
  duration: 45,
  rowCount: 23,
});
```

### Error Logs
```typescript
log.error('Database connection failed', {
  category: 'error.database',
  error: error.message,
  stack: error.stack,
  code: error.code,
  retryAttempt: 3,
});
```

### Security Logs (Audit)
```typescript
log.warn('IDOR attempt detected', {
  category: 'security.idor',
  userId: attackerId,
  targetUserId: victimId,
  endpoint: '/api/educational/progress/user/:userId',
  ip: req.ip,
  blocked: true,
});
```

---

## Log Aggregation

### Option 1: ELK Stack (Elasticsearch + Logstash + Kibana)

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

### Option 2: Grafana Loki (Lightweight)

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

---

## Log Rotation

**Winston file rotation (implementado básicamente):**
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

## Log Retention Policy

| Log Type | Retention | Storage | Archive |
|----------|-----------|---------|---------|
| **Application Logs** | 30 days (hot) | Elasticsearch | 1 year (S3) |
| **Access Logs** | 90 days (hot) | Elasticsearch | 1 year (S3) |
| **Audit Logs** | 1 year (hot) | Elasticsearch | 7 years (S3) |
| **Error Logs** | 90 days (hot) | Elasticsearch | 2 years (S3) |
| **Security Logs** | 1 year (hot) | Elasticsearch | 7 years (S3) |

---

## Log Queries (Kibana/Elasticsearch)

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
```

---

**Última actualización:** 2025-11-01
**Owner:** DevOps Team
