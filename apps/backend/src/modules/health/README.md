# Health Module

Production-ready health check endpoint for monitoring and load balancer integration.

## Quick Start

```bash
# Check health
curl http://localhost:3006/api/health | jq '.'

# Expected response (healthy)
{
  "status": "healthy",
  "timestamp": "2025-11-23T19:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "checks": {
    "database": { "status": "healthy", "responseTime": 15, "message": "PostgreSQL connected" },
    "tables": { "status": "healthy", "responseTime": 42, "message": "All critical tables exist" }
  },
  "version": "1.0.0"
}
```

## Endpoint

- **URL:** `GET /api/health`
- **Auth:** Public (no authentication)
- **Format:** JSON
- **Status Codes:** 200 (healthy) | 503 (unhealthy/degraded)

## Health Checks

1. **Database Connectivity** - Tests PostgreSQL connection across 8 datasources
2. **Critical Tables** - Verifies 9 essential tables across 7 schemas
3. **System Metrics** - Uptime, environment, version

## Files

- `health.module.ts` - Module definition
- `health.controller.ts` - HTTP endpoint handler
- `health.service.ts` - Health check logic
- `dto/health-check.dto.ts` - Response types and Swagger schemas
- `__tests__/` - Unit and E2E tests (43 tests total)

## Testing

```bash
# Run all health tests
npm test -- health

# Run service tests
npm test -- health.service.spec.ts

# Run controller tests
npm test -- health.controller.spec.ts
```

## Integration

### Kubernetes

```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 3006
  periodSeconds: 10
```

### Docker Compose

```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3006/api/health"]
  interval: 30s
```

### NGINX

```nginx
health_check uri=/api/health;
```

## Documentation

Full documentation available in:
- `/orchestration/agentes/backend/backend-health-endpoint-2025-11-23/REPORTE-HEALTH-ENDPOINT.md`
- Swagger UI: `http://localhost:3006/api/docs`

## Performance

- Average response time: ~57ms
- Database check: ~15ms
- Tables check: ~42ms
- Supports concurrent requests

## Status

✅ Production Ready
- 43 tests passing
- Full Swagger documentation
- Comprehensive error handling
- Performance validated
