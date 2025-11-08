# PERFORMANCE TESTING STRATEGY

**Proyecto:** Gamilit Platform
**Módulo:** Testing Strategy - Performance Testing
**Fecha:** 01 de Noviembre, 2025
**Versión:** 1.0
**Estado:** Documento Técnico
**RFC:** RFC-0001 (Modularización de Documentación)

---

## Tabla de Contenidos

1. [Overview](#overview)
2. [Herramientas](#herramientas)
3. [Load Testing con k6](#load-testing-con-k6)
4. [Performance Benchmarks](#performance-benchmarks)
5. [Database Performance](#database-performance)

---

## 1. Overview

### 1.1 Definición

Performance Testing evalúa la **velocidad, estabilidad, escalabilidad y confiabilidad** de la aplicación bajo diferentes cargas de trabajo.

### 1.2 Tipos de Performance Testing

| Tipo | Objetivo | Herramienta |
|------|----------|-------------|
| **Load Testing** | Verificar comportamiento bajo carga esperada | k6, Artillery |
| **Stress Testing** | Encontrar punto de quiebre del sistema | k6 |
| **Spike Testing** | Evaluar respuesta ante picos súbitos | k6 |
| **Endurance Testing** | Verificar estabilidad a largo plazo | k6 |
| **Frontend Performance** | Métricas Core Web Vitals | Lighthouse |
| **Database Performance** | Query optimization | PostgreSQL EXPLAIN |

---

## 2. Herramientas

### 2.1 Backend Performance Testing

| Tool | Purpose | Target Metrics |
|------|---------|----------------|
| **k6** | Load testing | Concurrent users, throughput |
| **Artillery** | Alternative load testing | RPS, latency |

### 2.2 Frontend Performance

| Tool | Purpose | Target Metrics |
|------|---------|----------------|
| **Lighthouse** | Frontend performance | LCP < 2.5s, FID < 100ms |
| **WebPageTest** | Detailed performance analysis | TTFB, TTI |

---

## 3. Load Testing con k6

### 3.1 API Exercises Load Test

**load-tests/api-exercises.js:**

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const exerciseDuration = new Trend('exercise_duration');

export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '3m', target: 50 },   // Stay at 50 users
    { duration: '1m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '1m', target: 200 },  // Spike to 200 users
    { duration: '3m', target: 200 },  // Sustain spike
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],      // 95% of requests < 500ms
    http_req_failed: ['rate<0.01'],        // < 1% failures
    errors: ['rate<0.05'],                 // < 5% error rate
    exercise_duration: ['p(90)<2000'],     // 90% of exercises < 2s
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export function setup() {
  // Login and get auth token
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, JSON.stringify({
    email: 'loadtest@test.com',
    password: 'LoadTest123!',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  return { token: loginRes.json('token') };
}

export default function (data) {
  const headers = {
    'Authorization': `Bearer ${data.token}`,
    'Content-Type': 'application/json',
  };

  // Scenario 1: Browse exercises (60% of traffic)
  if (Math.random() < 0.6) {
    const res = http.get(`${BASE_URL}/api/educational/exercises`, { headers });

    check(res, {
      'status is 200': (r) => r.status === 200,
      'response time < 500ms': (r) => r.timings.duration < 500,
      'has exercises': (r) => r.json('data.exercises').length > 0,
    });

    errorRate.add(res.status !== 200);
  }

  // Scenario 2: Start and submit exercise (30% of traffic)
  else if (Math.random() < 0.9) {
    const startTime = new Date();

    // Start exercise
    const startRes = http.post(
      `${BASE_URL}/api/educational/exercises/exercise-123/start`,
      null,
      { headers }
    );

    check(startRes, {
      'exercise started': (r) => r.status === 201,
    });

    sleep(2); // Simulate user solving

    // Submit exercise
    const submitRes = http.post(
      `${BASE_URL}/api/educational/exercises/exercise-123/submit`,
      JSON.stringify({
        attemptId: startRes.json('data.attempt.id'),
        answers: { '1': 'RADIO', '2': 'POLONIO', '3': 'CURIE' },
      }),
      { headers }
    );

    check(submitRes, {
      'exercise submitted': (r) => r.status === 200,
      'score calculated': (r) => r.json('data.score') !== undefined,
    });

    const duration = new Date() - startTime;
    exerciseDuration.add(duration);
    errorRate.add(submitRes.status !== 200);
  }

  // Scenario 3: View leaderboard (10% of traffic)
  else {
    const res = http.get(`${BASE_URL}/api/gamification/leaderboard/classroom-123`, { headers });

    check(res, {
      'leaderboard loaded': (r) => r.status === 200,
      'has rankings': (r) => r.json('data.rankings').length > 0,
    });

    errorRate.add(res.status !== 200);
  }

  sleep(1); // Think time
}

export function teardown(data) {
  // Cleanup if needed
  console.log('Load test completed');
}
```

### 3.2 Stress Test

**load-tests/stress-test.js:**

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },   // Ramp up to 100 users
    { duration: '5m', target: 100 },   // Stay at 100
    { duration: '2m', target: 200 },   // Ramp to 200
    { duration: '5m', target: 200 },   // Stay at 200
    { duration: '2m', target: 300 },   // Ramp to 300
    { duration: '5m', target: 300 },   // Stay at 300
    { duration: '2m', target: 400 },   // Ramp to 400 (breaking point?)
    { duration: '5m', target: 400 },   // Stay at 400
    { duration: '10m', target: 0 },    // Gradual ramp down
  ],
};

export default function () {
  const res = http.get('http://localhost:3000/api/educational/exercises');

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
```

### 3.3 Spike Test

**load-tests/spike-test.js:**

```javascript
export const options = {
  stages: [
    { duration: '10s', target: 10 },    // Normal load
    { duration: '10s', target: 1000 },  // SPIKE!
    { duration: '30s', target: 1000 },  // Sustain spike
    { duration: '10s', target: 10 },    // Back to normal
    { duration: '30s', target: 10 },    // Recovery
    { duration: '10s', target: 0 },     // Ramp down
  ],
};
```

### 3.4 Run Commands

```bash
# Normal load test
k6 run load-tests/api-exercises.js

# Stress test (find breaking point)
k6 run load-tests/stress-test.js

# Spike test
k6 run load-tests/spike-test.js

# Smoke test (sanity check)
k6 run --vus 1 --duration 1m load-tests/smoke-test.js

# Run with environment variables
k6 run --env BASE_URL=https://staging.gamilit.com load-tests/api-exercises.js

# Generate HTML report
k6 run --out json=results.json load-tests/api-exercises.js
k6 html results.json
```

---

## 4. Performance Benchmarks

### 4.1 Backend API Targets

| Endpoint | P50 | P95 | P99 | Max | Status |
|----------|-----|-----|-----|-----|--------|
| GET /exercises | 100ms | 300ms | 500ms | 1s | 🟡 TBD |
| POST /exercises/:id/start | 150ms | 400ms | 800ms | 1.5s | 🟡 TBD |
| POST /exercises/:id/submit | 200ms | 500ms | 1s | 2s | 🟡 TBD |
| GET /leaderboard | 80ms | 200ms | 400ms | 800ms | 🟡 TBD |
| GET /user/stats | 50ms | 150ms | 300ms | 500ms | 🟡 TBD |
| POST /auth/login | 300ms | 800ms | 1.2s | 2s | 🟡 TBD |
| WebSocket message | 20ms | 50ms | 100ms | 200ms | 🟡 TBD |

**Targets Generales:**
- P95 < 500ms para endpoints de lectura
- P95 < 1s para endpoints de escritura
- Throughput: 100 req/s mínimo
- Error rate: < 1%
- Concurrent users: 200+ simultáneos

### 4.2 Frontend Performance (Lighthouse)

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| **Largest Contentful Paint (LCP)** | < 2.5s | TBD | 🟡 |
| **First Input Delay (FID)** | < 100ms | TBD | 🟡 |
| **Cumulative Layout Shift (CLS)** | < 0.1 | TBD | 🟡 |
| **Time to Interactive (TTI)** | < 3.8s | TBD | 🟡 |
| **Total Blocking Time (TBT)** | < 200ms | TBD | 🟡 |
| **Performance Score** | > 90 | TBD | 🟡 |
| **Accessibility Score** | > 95 | TBD | 🟡 |
| **Best Practices Score** | > 90 | TBD | 🟡 |

**Run Lighthouse:**

```bash
# CLI
lighthouse https://gamilit.com --output html --output-path ./lighthouse-report.html

# Chrome DevTools
# 1. Open DevTools (F12)
# 2. Go to Lighthouse tab
# 3. Click "Generate report"

# CI/CD integration
npm install -g @lhci/cli
lhci autorun
```

### 4.3 Load Test Scenarios

**Scenario 1: Normal Load**
- 50-100 concurrent users
- 80% browsing, 15% completing exercises, 5% viewing leaderboard
- Duration: 10 minutes
- Expected: P95 < 500ms, 0% errors

**Scenario 2: Peak Load**
- 200-300 concurrent users
- Same traffic distribution
- Duration: 30 minutes
- Expected: P95 < 800ms, < 1% errors

**Scenario 3: Spike**
- 10 → 500 users in 30 seconds
- Duration: 5 minutes
- Expected: System recovers, no crashes

**Scenario 4: Endurance**
- 100 concurrent users
- Duration: 2 hours
- Expected: No memory leaks, consistent performance

---

## 5. Database Performance

### 5.1 Query Performance Testing

```sql
-- Query performance test
EXPLAIN ANALYZE
SELECT
  e.*,
  COUNT(ea.id) as total_attempts,
  AVG(ea.score) as average_score
FROM educational.exercises e
LEFT JOIN educational.exercise_attempts ea ON e.id = ea.exercise_id
WHERE e.tenant_id = 'tenant-123'
GROUP BY e.id
ORDER BY e.created_at DESC
LIMIT 20;

-- Expected: < 50ms for 10k exercises, < 200ms for 100k exercises
```

### 5.2 Index Performance

```sql
-- Index usage statistics
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'educational'
ORDER BY idx_scan DESC;

-- Missing indexes detection
SELECT
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  seq_tup_read / seq_scan as avg_seq_tup_read
FROM pg_stat_user_tables
WHERE schemaname = 'educational'
  AND seq_scan > 0
ORDER BY seq_tup_read DESC;
```

### 5.3 Connection Pool Monitoring

```typescript
// Monitor connection pool
import { pool } from './database/pool';

setInterval(() => {
  console.log({
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  });
}, 10000);
```

### 5.4 Slow Query Log

```sql
-- Enable slow query logging (PostgreSQL)
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1s
SELECT pg_reload_conf();

-- View slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

## 6. Performance Monitoring

### 6.1 APM (Application Performance Monitoring)

**Herramientas Recomendadas:**
- **New Relic** - APM completo
- **DataDog** - Monitoring + logs
- **Sentry** - Error tracking + performance

### 6.2 Metrics to Track

**Backend:**
- Request rate (req/s)
- Response time (P50, P95, P99)
- Error rate (%)
- CPU usage (%)
- Memory usage (MB)
- Database connections (count)
- Query duration (ms)

**Frontend:**
- Page load time (ms)
- Time to First Byte (TTFB)
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- JavaScript bundle size (KB)
- API call duration (ms)

---

## Referencias

- [Testing Strategy - Overview](./README.md)
- [Unit Testing](./unit-testing.md)
- [Integration Testing](./integration-testing.md)
- [Test Infrastructure](./test-infrastructure.md)

---

**Documento creado:** 01 de Noviembre, 2025
**Próxima revisión:** Cada sprint
**Owner:** QA Team + DevOps Team
