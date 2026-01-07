# Admin Monitoring Module - Quick Start Guide

## TL;DR

5 new monitoring endpoints ready to use:

```bash
# 1. Current system metrics
GET /admin/monitoring/metrics

# 2. Metrics history
GET /admin/monitoring/metrics/history?hours=24

# 3. Error statistics
GET /admin/monitoring/errors/stats?hours=24

# 4. Recent errors
GET /admin/monitoring/errors/recent?limit=20&level=all

# 5. Error trends
GET /admin/monitoring/errors/trends?hours=24&group_by=hour
```

**Auth Required:** JWT Bearer token + Admin role

---

## Quick Test

```bash
# Set your admin JWT token
export JWT_TOKEN='your-admin-jwt-token-here'

# Run comprehensive test suite (20 tests)
./apps/backend/scripts/test-monitoring-endpoints.sh
```

---

## Example: Get System Metrics

```bash
curl -X GET "http://localhost:3000/admin/monitoring/metrics" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  | jq '.'
```

**Response:**
```json
{
  "timestamp": "2025-11-24T18:30:00.000Z",
  "memory": {
    "total_mb": 16384.00,
    "used_mb": 8192.00,
    "free_mb": 8192.00,
    "usage_percent": 50.00,
    "heap_used_mb": 128.50,
    "heap_total_mb": 256.00
  },
  "cpu": {
    "user_ms": 12345.67,
    "system_ms": 5678.90,
    "load_average": [1.23, 1.45, 1.67],
    "cores": 8
  },
  "system": {
    "platform": "linux",
    "arch": "x64",
    "hostname": "gamilit-server",
    "uptime_seconds": 86400,
    "node_version": "v18.17.0"
  },
  "process": {
    "pid": 12345,
    "uptime_seconds": 3600,
    "active_handles": 42,
    "active_requests": 5
  }
}
```

---

## Example: Get Error Stats

```bash
curl -X GET "http://localhost:3000/admin/monitoring/errors/stats?hours=48" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  | jq '.'
```

**Response:**
```json
{
  "total_errors": 42,
  "days_with_errors": 3,
  "fatal_errors": 2,
  "error_level_errors": 40,
  "first_error_at": "2025-11-22T10:00:00.000Z",
  "last_error_at": "2025-11-24T18:00:00.000Z",
  "time_period_hours": 48
}
```

---

## Files Created

```
apps/backend/src/modules/admin/
├── controllers/
│   └── admin-monitoring.controller.ts       ← 5 REST endpoints
├── services/
│   └── admin-monitoring.service.ts          ← Business logic
└── dto/monitoring/
    ├── system-metrics.dto.ts                ← Real-time metrics
    ├── metrics-history.dto.ts               ← History DTOs
    ├── error-stats.dto.ts                   ← Statistics DTOs
    ├── recent-errors.dto.ts                 ← Error list DTOs
    ├── error-trends.dto.ts                  ← Trends DTOs
    └── index.ts                             ← Barrel export
```

---

## Swagger Documentation

**Access at:** http://localhost:3000/api/docs

**Filter by tag:** `Admin - Monitoring`

---

## Need More Info?

- **Full Implementation Report:** `IMPLEMENTATION-REPORT-ADMIN-MONITORING-MODULE-2025-11-24.md`
- **Endpoints Summary:** `ADMIN-MONITORING-ENDPOINTS-SUMMARY.md`
- **Completion Report:** `ADMIN-MONITORING-IMPLEMENTATION-COMPLETE.md`

---

## Status

✅ All 5 endpoints implemented
✅ TypeScript compiles (0 errors)
✅ Swagger docs complete
✅ 20 automated tests
✅ **PRODUCTION READY**

**Created:** 2025-11-24
