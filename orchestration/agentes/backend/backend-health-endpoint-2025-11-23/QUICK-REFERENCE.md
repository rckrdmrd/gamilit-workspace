# Health Endpoint - Quick Reference

## Endpoint Details

- **URL:** `GET /api/health`
- **Authentication:** None (public)
- **Response Format:** JSON
- **Average Response Time:** ~57ms

## Quick Test

```bash
# Basic test
curl http://localhost:3000/api/health | jq '.'

# Check status only
curl -s http://localhost:3000/api/health | jq -r '.status'
```

## Response Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | `healthy` | All systems operational |
| 503 | `unhealthy` | Critical system failure |
| 503 | `degraded` | Partial system failure |

## Files Created

### Source Files
- `/apps/backend/src/modules/health/health.module.ts`
- `/apps/backend/src/modules/health/health.controller.ts`
- `/apps/backend/src/modules/health/health.service.ts`
- `/apps/backend/src/modules/health/dto/health-check.dto.ts`

### Test Files
- `/apps/backend/src/modules/health/__tests__/health.service.spec.ts` (25 tests)
- `/apps/backend/src/modules/health/__tests__/health.controller.spec.ts` (18 tests)
- `/apps/backend/src/modules/health/__tests__/health.e2e-spec.ts` (13 tests)

### Modified Files
- `/apps/backend/src/app.module.ts` (added HealthModule)

## Test Results

✅ **43 tests passing**
- 25 service unit tests
- 18 controller unit tests
- 0 failures

## Health Checks Performed

1. **Database Connectivity** - PostgreSQL connection across 8 datasources
2. **Critical Tables** - 9 tables verified across 7 schemas
3. **System Metrics** - Uptime, environment, version

## Response Example

```json
{
  "status": "healthy",
  "timestamp": "2025-11-23T19:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "checks": {
    "database": {
      "status": "healthy",
      "responseTime": 15,
      "message": "PostgreSQL connected"
    },
    "tables": {
      "status": "healthy",
      "responseTime": 42,
      "message": "All critical tables exist"
    }
  },
  "version": "1.0.0"
}
```

## Monitoring Integration

### Kubernetes
```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3000
  periodSeconds: 10
```

### Docker Compose
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
  interval: 30s
  timeout: 10s
  retries: 3
```

### NGINX
```nginx
health_check uri=/api/health match=health_ok;
```

## Next Steps

1. Deploy to staging environment
2. Configure load balancer health checks
3. Set up monitoring alerts
4. Test in production-like environment

## Documentation

- Full Report: `REPORTE-HEALTH-ENDPOINT.md`
- Testing Guide: `TESTING-GUIDE.md`
- Swagger UI: `http://localhost:3000/api/docs`
