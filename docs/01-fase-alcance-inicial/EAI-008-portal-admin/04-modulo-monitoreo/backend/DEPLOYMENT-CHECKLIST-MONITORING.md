# Admin Monitoring Module - Deployment Checklist

**Module:** Admin Portal - Monitoring (Plan 4)
**Status:** Ready for Deployment
**Date:** 2025-11-24

---

## Pre-Deployment Verification

### Code Quality
- [x] TypeScript compilation successful (0 errors)
- [x] All endpoints implemented (5/5)
- [x] All DTOs created with validation (10+)
- [x] Service methods implemented (5 main + 3 helpers)
- [x] Controller properly configured with guards
- [x] Module integration complete
- [x] Swagger documentation added

### Testing
- [x] Test script created (20 tests)
- [ ] Test script executed with admin JWT token
- [ ] All endpoints return expected responses
- [ ] Validation errors handled correctly
- [ ] Authorization checks working

### Documentation
- [x] Implementation report complete
- [x] API endpoints documented
- [x] Quick start guide created
- [x] Swagger annotations complete
- [ ] Frontend team notified

---

## Database Setup

### Recommended Indexes
Execute in production database:

```sql
-- Index for error queries filtered by level and time
CREATE INDEX IF NOT EXISTS idx_system_logs_level_timestamp
  ON audit_logging.system_logs(log_level, timestamp);

-- Index for timestamp ordering
CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp
  ON audit_logging.system_logs(timestamp DESC);

-- Verify indexes created
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'system_logs'
  AND schemaname = 'audit_logging'
ORDER BY indexname;
```

### Verify Table Structure
```sql
-- Verify system_logs table exists and has required columns
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'audit_logging'
  AND table_name = 'system_logs'
ORDER BY ordinal_position;

-- Expected columns:
-- id, log_level, message, context, timestamp, source, user_id
```

---

## Environment Configuration

### Required Environment Variables
- [x] `DATABASE_URL` - Connection to database with audit_logging schema
- [x] `JWT_SECRET` - For token verification
- [x] `PORT` - API server port (default: 3000)

### No Additional Configuration Required
- No new environment variables needed
- Uses existing database connections
- Leverages existing authentication system

---

## Deployment Steps

### Step 1: Deploy Code
```bash
# Pull latest code
git pull origin main

# Install dependencies (if needed)
npm install

# Build application
npm run build

# Restart application
pm2 restart gamilit-backend
# OR
systemctl restart gamilit-backend
```

### Step 2: Verify Deployment
```bash
# Check application is running
curl http://localhost:3000/health

# Test monitoring endpoint (requires admin JWT)
export JWT_TOKEN='admin-jwt-token'
curl -H "Authorization: Bearer $JWT_TOKEN" \
  http://localhost:3000/admin/monitoring/metrics
```

### Step 3: Run Test Suite
```bash
export JWT_TOKEN='admin-jwt-token'
export API_BASE_URL='http://localhost:3000'
./apps/backend/scripts/test-monitoring-endpoints.sh
```

Expected output: **20/20 tests passing**

### Step 4: Verify Swagger Documentation
- Navigate to: `http://your-domain.com/api/docs`
- Find section: "Admin - Monitoring"
- Verify all 5 endpoints are listed
- Test each endpoint through Swagger UI

---

## Post-Deployment Verification

### Functional Tests
- [ ] System metrics endpoint returns data
- [ ] Metrics history endpoint returns note about tracking
- [ ] Error stats endpoint returns zero or actual errors
- [ ] Recent errors endpoint returns recent logs
- [ ] Error trends endpoint returns bucketed data

### Performance Tests
- [ ] System metrics responds < 100ms
- [ ] Error endpoints respond < 500ms
- [ ] No memory leaks after 1000 requests
- [ ] CPU usage remains stable

### Security Tests
- [ ] Endpoints reject requests without JWT token (401)
- [ ] Endpoints reject non-admin users (403)
- [ ] Query parameter validation working (400 for invalid input)
- [ ] No sensitive data exposed to non-admins

---

## Monitoring Setup

### Application Logs
Monitor for errors in monitoring endpoints:

```bash
# View recent logs
pm2 logs gamilit-backend --lines 100

# Filter for monitoring errors
pm2 logs gamilit-backend | grep "AdminMonitoring"
```

### Database Performance
Monitor query performance:

```sql
-- Enable query logging (PostgreSQL)
ALTER DATABASE your_database SET log_min_duration_statement = 100;

-- Check slow queries on system_logs
SELECT
  query,
  calls,
  mean_exec_time,
  max_exec_time
FROM pg_stat_statements
WHERE query LIKE '%system_logs%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### Endpoint Metrics
Set up monitoring for:
- Request rate per endpoint
- Response time (p50, p95, p99)
- Error rate
- CPU/Memory usage during monitoring calls

---

## Rollback Plan

If issues occur after deployment:

### Quick Rollback
```bash
# Revert to previous version
git revert HEAD
npm run build
pm2 restart gamilit-backend

# OR restore from backup
git checkout previous-stable-commit
npm run build
pm2 restart gamilit-backend
```

### Module-Specific Rollback
If only monitoring module has issues:

1. Comment out `AdminMonitoringController` in `admin.module.ts`
2. Rebuild and restart
3. Monitoring endpoints will return 404 (graceful degradation)
4. Other admin endpoints continue working

### Database Rollback
If indexes cause issues:

```sql
-- Drop indexes if they cause problems
DROP INDEX IF EXISTS audit_logging.idx_system_logs_level_timestamp;
DROP INDEX IF EXISTS audit_logging.idx_system_logs_timestamp;
```

---

## Known Issues & Workarounds

### Issue 1: Historical Metrics Not Available
**Status:** Expected behavior
**Impact:** `/metrics/history` returns single data point
**Workaround:** Frontend can poll `/metrics` for real-time data
**Future Fix:** Implement metrics collection service

### Issue 2: Large Error Logs Table
**Status:** Potential performance issue
**Impact:** Slow queries on error endpoints
**Workaround:** Add recommended indexes
**Monitoring:** Track query execution times

### Issue 3: No Pagination on Trends
**Status:** Known limitation
**Impact:** May timeout with millions of logs
**Workaround:** Limit time range to 7 days maximum
**Future Fix:** Add offset/limit pagination

---

## Success Criteria

Deployment is successful when:

- [x] All 5 endpoints deployed and accessible
- [ ] Test suite passes (20/20 tests)
- [ ] Response times acceptable (< 500ms for error endpoints)
- [ ] No errors in application logs
- [ ] Swagger documentation accessible
- [ ] Frontend team can integrate successfully
- [ ] No performance degradation on other endpoints

---

## Frontend Integration Readiness

### API Endpoints Ready
All 5 endpoints are documented and ready for frontend:

1. System Metrics Dashboard
   - Endpoint: `GET /admin/monitoring/metrics`
   - Update frequency: Every 5-10 seconds
   - Display: CPU, memory, process info

2. Error Statistics Panel
   - Endpoint: `GET /admin/monitoring/errors/stats`
   - Update frequency: Every 30-60 seconds
   - Display: Total errors, fatal count, time range

3. Error Logs Table
   - Endpoint: `GET /admin/monitoring/errors/recent`
   - Pagination: limit parameter (1-100)
   - Filtering: level parameter (error/fatal/all)

4. Error Trends Chart
   - Endpoint: `GET /admin/monitoring/errors/trends`
   - Time buckets: hourly or daily
   - Display: Line/bar chart

5. Metrics History (Future)
   - Endpoint: `GET /admin/monitoring/metrics/history`
   - Current: Single data point
   - Future: Full historical data

### Frontend Developer Notes
- All endpoints require JWT Bearer token
- All endpoints require admin role
- Response format: JSON
- Error handling: Standard HTTP codes (400, 401, 403, 500)
- Swagger docs: `/api/docs` (tag: "Admin - Monitoring")

---

## Support Contacts

### Issues During Deployment
- Review logs in `pm2 logs gamilit-backend`
- Check implementation report for details
- Run test suite for diagnostics
- Verify database connectivity

### Documentation References
- Full Report: `IMPLEMENTATION-REPORT-ADMIN-MONITORING-MODULE-2025-11-24.md`
- Quick Start: `MONITORING-QUICK-START.md`
- API Summary: `ADMIN-MONITORING-ENDPOINTS-SUMMARY.md`
- This Checklist: `DEPLOYMENT-CHECKLIST-MONITORING.md`

---

## Post-Deployment Tasks

### Immediate (Day 1)
- [ ] Verify all endpoints working in production
- [ ] Check error logs for any issues
- [ ] Monitor response times
- [ ] Notify frontend team of availability

### Short Term (Week 1)
- [ ] Add database indexes if not already done
- [ ] Set up automated monitoring alerts
- [ ] Review query performance
- [ ] Gather feedback from frontend team

### Long Term (Month 1)
- [ ] Analyze usage patterns
- [ ] Optimize slow queries if needed
- [ ] Plan historical metrics collection
- [ ] Implement threshold-based alerts

---

## Completion Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Backend Developer | Backend-Agent | 2025-11-24 | ✅ Complete |
| Code Reviewer | | | |
| QA Tester | | | |
| DevOps Engineer | | | |
| Product Owner | | | |

---

**Deployment Status:** READY
**Last Updated:** 2025-11-24
**Version:** 1.0.0
