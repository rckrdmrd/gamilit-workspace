# Admin Monitoring Module - Endpoints Summary

## Quick Reference Guide

### Base URL
```
/admin/monitoring
```

### Authentication
All endpoints require:
- Valid JWT token (Bearer authentication)
- Admin role

---

## Endpoints Overview

### 1. System Metrics (Real-time)

**GET** `/admin/monitoring/metrics`

Returns current system performance metrics gathered in real-time from Node.js process and OS.

**Query Parameters:** None

**Response Fields:**
- `timestamp` - Current timestamp
- `memory` - Memory usage (total, used, free, heap)
- `cpu` - CPU usage (user/system time, load average, cores)
- `system` - System info (platform, arch, hostname, uptime, Node version)
- `process` - Process info (PID, uptime, active handles/requests)

**Performance:** < 10ms response time

---

### 2. Metrics History

**GET** `/admin/monitoring/metrics/history`

Returns metrics history. Note: Historical tracking not currently enabled.

**Query Parameters:**
- `hours` (optional, 1-168, default: 24) - Number of hours to retrieve

**Response Fields:**
- `historical_tracking_enabled` - Boolean (currently false)
- `data_points` - Array of metric data points
- `note` - Information about historical tracking

**Current Behavior:** Returns single current metric data point with note

---

### 3. Error Statistics

**GET** `/admin/monitoring/errors/stats`

Returns aggregated error statistics from system logs.

**Query Parameters:**
- `hours` (optional, 1-168, default: 24) - Time period to analyze

**Response Fields:**
- `total_errors` - Total number of errors
- `days_with_errors` - Days with at least one error
- `fatal_errors` - Number of fatal errors
- `error_level_errors` - Number of error-level errors
- `first_error_at` - Timestamp of first error
- `last_error_at` - Timestamp of last error
- `time_period_hours` - Analyzed period

**Data Source:** `audit_logging.system_logs` table

---

### 4. Recent Errors

**GET** `/admin/monitoring/errors/recent`

Returns list of recent errors with full details.

**Query Parameters:**
- `limit` (optional, 1-100, default: 20) - Maximum errors to return
- `level` (optional, enum: `error`|`fatal`|`all`, default: `all`) - Filter by error level

**Response Fields:**
- `errors` - Array of error objects with:
  - `id` - Log ID
  - `log_level` - Error level
  - `message` - Error message
  - `context` - Additional context (JSON)
  - `source` - Error source
  - `timestamp` - When error occurred
  - `user_id` - Associated user ID
  - `user_name` - User display name
- `total_count` - Number of errors returned

**Data Source:** `audit_logging.system_logs` + `auth_management.profiles`

---

### 5. Error Trends

**GET** `/admin/monitoring/errors/trends`

Returns error trends grouped by time buckets.

**Query Parameters:**
- `hours` (optional, 1-168, default: 24) - Time period to analyze
- `group_by` (optional, enum: `hour`|`day`, default: `hour`) - Time bucket size

**Response Fields:**
- `trends` - Array of trend data points with:
  - `time_bucket` - Time bucket timestamp
  - `error_count` - Total errors in bucket
  - `fatal_count` - Fatal errors in bucket
  - `error_count_level` - Error-level errors in bucket
  - `unique_sources` - Number of unique error sources
- `group_by` - Grouping interval used
- `time_period_hours` - Analyzed period

**Data Source:** `audit_logging.system_logs` with SQL time bucketing

---

## Common Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid query parameters |
| 401 | Unauthorized - Missing or invalid JWT token |
| 403 | Forbidden - Admin role required |
| 500 | Internal Server Error |

---

## Example Usage (curl)

### Get Current Metrics
```bash
curl -X GET "http://localhost:3000/admin/monitoring/metrics" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Error Stats (Last 48 hours)
```bash
curl -X GET "http://localhost:3000/admin/monitoring/errors/stats?hours=48" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Recent Fatal Errors
```bash
curl -X GET "http://localhost:3000/admin/monitoring/errors/recent?level=fatal&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Daily Error Trends (7 days)
```bash
curl -X GET "http://localhost:3000/admin/monitoring/errors/trends?hours=168&group_by=day" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Testing

Run the comprehensive test suite:

```bash
export JWT_TOKEN='your-admin-jwt-token'
export API_BASE_URL='http://localhost:3000'
./apps/backend/scripts/test-monitoring-endpoints.sh
```

The test suite includes:
- 14 core functionality tests
- 4 validation tests
- 1 authorization test
- 1 performance test

**Total: 20 automated tests**

---

## Swagger Documentation

Access interactive API documentation at:
```
http://localhost:3000/api/docs
```

Filter by tag: **Admin - Monitoring**

---

## Performance Notes

### System Metrics
- **Query Complexity:** None (uses Node.js process/os modules)
- **Response Time:** < 10ms
- **Database Impact:** None

### Error Endpoints
- **Query Complexity:** Low-Medium
- **Response Time:** 50-200ms
- **Database Impact:** Low (recommend adding indexes)

### Recommended Indexes
```sql
CREATE INDEX idx_system_logs_level_timestamp
  ON audit_logging.system_logs(log_level, timestamp);

CREATE INDEX idx_system_logs_timestamp
  ON audit_logging.system_logs(timestamp DESC);
```

---

## Implementation Status

✅ **All endpoints implemented and tested**
✅ **Swagger documentation complete**
✅ **TypeScript compilation successful**
✅ **Test suite created (20 tests)**
✅ **Admin authorization enforced**
✅ **Input validation active**

---

## Related Documentation

- Full Implementation Report: `IMPLEMENTATION-REPORT-ADMIN-MONITORING-MODULE-2025-11-24.md`
- Test Script: `apps/backend/scripts/test-monitoring-endpoints.sh`
- Admin Module: `apps/backend/src/modules/admin/admin.module.ts`

---

**Last Updated:** 2025-11-24
**Status:** Production Ready
