# Production Deployment Pre-Flight Checklist

**Server:** 74.208.126.102
**User:** isem
**Date:** 2026-02-28

---

## Phase 1: Configuration Validation (Do This First!)

### .env.production File

```bash
# Connect to production server
ssh isem@74.208.126.102

# Navigate to project
cd ~/gamilit-workspace

# Check if .env.production exists
ls -la apps/backend/.env.production
```

- [ ] File exists and is NOT readable to group/others
  ```bash
  stat apps/backend/.env.production
  # Should show: Access: (0600/-rw-------)
  # If not: chmod 600 apps/backend/.env.production
  ```

### Database Credentials

```bash
# Verify DB connection works BEFORE deployment
psql -h localhost -U gamilit_user -d gamilit_platform -c "SELECT 1 AS connection_test;"
```

- [ ] PostgreSQL connection successful
- [ ] User `gamilit_user` has permissions
- [ ] Database `gamilit_platform` exists and is accessible

### JWT Secrets

```bash
# Check JWT_SECRET length
grep JWT_SECRET apps/backend/.env.production | head -c 100
# Should be 32+ characters, NOT contain <...> or placeholder text
```

- [ ] `JWT_SECRET` is present and 32+ characters
- [ ] `JWT_SECRET` does NOT contain `<`, `>`, or `CHANGE_ME`
- [ ] `JWT_REFRESH_SECRET` is present and different from `JWT_SECRET`
- [ ] `SESSION_SECRET` is present and 32+ characters

### Redis Configuration

```bash
# Check if Redis is configured
grep REDIS_ENABLED apps/backend/.env.production
grep REDIS_URL apps/backend/.env.production
grep REDIS_PASSWORD apps/backend/.env.production
```

- [ ] `REDIS_ENABLED=true` is set
- [ ] `REDIS_URL=redis://localhost:6379` (or correct remote host)
- [ ] `REDIS_PASSWORD` is set (or empty if no auth required)

```bash
# Test Redis connection
redis-cli PING
# Should respond: PONG
```

- [ ] Redis service is running
- [ ] `redis-cli` can connect successfully

### Database Pool Configuration

```bash
# Check pool size
grep DB_POOL_MAX apps/backend/.env.production
```

- [ ] `DB_POOL_MAX=5` (or calculated value for your instance count)
- [ ] `DB_POOL_MAX × number_of_datasources (11) < PostgreSQL max_connections (100)`
  - Example: 5 × 11 = 55 (safe)

### CORS Configuration

```bash
# Check CORS origins
grep CORS_ORIGIN apps/backend/.env.production
```

- [ ] `CORS_ORIGIN` contains `https://74.208.126.102:3005` or `https://74.208.126.102`
- [ ] `CORS_ORIGIN` does NOT contain insecure `http://` origins
  - (They will be filtered, but shouldn't be there)

### Schema Synchronization

```bash
# Verify DB_SYNCHRONIZE is disabled
grep DB_SYNCHRONIZE apps/backend/.env.production
```

- [ ] `DB_SYNCHRONIZE=false` is explicitly set
- [ ] File does NOT contain `DB_SYNCHRONIZE=true`

---

## Phase 2: Build Validation

```bash
# Navigate to backend
cd ~/gamilit-workspace/apps/backend

# Install dependencies
npm install

# Build backend
npm run build

# Check for errors
echo $?
# Should return 0 (success)
```

- [ ] `npm install` completes without errors
- [ ] `npm run build` completes without errors
- [ ] `dist/` directory is created
- [ ] `dist/main.js` exists

### Type Checking

```bash
npm run typecheck
```

- [ ] TypeScript type checking passes

### Linting

```bash
npm run lint
```

- [ ] ESLint passes (or only warnings, no errors)

---

## Phase 3: Database Connectivity Check

```bash
# Test with actual backend configuration
NODE_ENV=production npm run start:debug > /tmp/backend-startup.log 2>&1 &

# Wait 10 seconds
sleep 10

# Check log for errors
tail -50 /tmp/backend-startup.log | grep -E "ERROR|FATAL|Connection refused"
```

- [ ] No "Connection refused" errors
- [ ] No "FATAL" errors
- [ ] Backend started successfully (look for "Server running at")
- [ ] Redis connection status logged (connected or failed gracefully)

### Health Check

```bash
# Test health endpoint
curl -s http://localhost:3006/api/v1/health | jq .
```

- [ ] Health endpoint responds
- [ ] Database status is "connected" or "disconnected" (visible)
- [ ] Redis status is shown (for monitoring)

---

## Phase 4: Connection Pool Verification

```bash
# Check current database connections
psql -h localhost -U gamilit_user -d gamilit_platform -c \
  "SELECT count(*) as total_connections, \
          usename \
   FROM pg_stat_activity \
   GROUP BY usename \
   ORDER BY count(*) DESC;"
```

Expected output:
```
 total_connections | usename
-------------------+------------------
                15 | gamilit_user
                 3 | postgres
                 1 | root
```

- [ ] `gamilit_user` connections are reasonable (10-20 range)
- [ ] Total connections < 80 (leaving headroom)
- [ ] No connection count continuously growing (leak indicator)

---

## Phase 5: Frontend Build Check

```bash
# Navigate to frontend
cd ~/gamilit-workspace/apps/frontend

# Install
npm install

# Build
npm run build

# Verify dist/ created
ls -la dist/ | head -5
```

- [ ] `npm install` succeeds
- [ ] `npm run build` completes
- [ ] `dist/` directory exists
- [ ] `dist/index.html` exists

---

## Phase 6: PM2 Deployment

```bash
# Stop existing processes (if any)
pm2 stop all
pm2 delete all

# Verify clean state
pm2 list
# Should show empty

# Start backend
pm2 start ecosystem.config.js --only gamilit-backend --env production

# Start frontend
pm2 start ecosystem.config.js --only gamilit-frontend --env production

# Verify both started
pm2 list
```

- [ ] Both processes show "online" status
- [ ] No processes show "errored" status

### Check Logs

```bash
# Check backend logs
pm2 logs gamilit-backend --lines 50 | tail -20

# Check frontend logs
pm2 logs gamilit-frontend --lines 50 | tail -20
```

- [ ] No "ERROR" entries in recent logs
- [ ] No "FATAL" entries
- [ ] No "Connection refused" entries

### Save PM2 Configuration

```bash
pm2 save
pm2 startup
# Follow the instructions PM2 provides
```

- [ ] PM2 configuration saved
- [ ] PM2 startup hook configured for auto-start on reboot

---

## Phase 7: Functional Testing

### API Testing

```bash
# Test backend API endpoint (health)
curl -s https://74.208.126.102/api/v1/health | jq .
```

- [ ] Response code: 200 OK
- [ ] Database: "connected"
- [ ] Redis: shows status

### Frontend Testing

```bash
# Test frontend is serving
curl -s https://74.208.126.102/ | head -20
# Should see HTML with <title>GAMILIT</title>
```

- [ ] Response code: 200 OK
- [ ] Contains HTML content

### Authentication Testing (Optional but Recommended)

```bash
# Test login endpoint
curl -X POST https://74.208.126.102/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@example.com","password":"test123"}' | jq .
```

- [ ] Response includes error or success (not timeout/500)
- [ ] No database connectivity errors

---

## Phase 8: Performance & Load Check

### Monitor Process Memory

```bash
# Watch memory usage
pm2 monit

# Press Ctrl+C to exit
```

- [ ] Backend memory usage < 500 MB
- [ ] Frontend memory usage < 300 MB
- [ ] No memory continuously growing (leak indicator)

### Database Connection Monitoring

```bash
# In another terminal, watch connections
watch -n 2 'psql -h localhost -U gamilit_user -d gamilit_platform \
  -c "SELECT count(*) FROM pg_stat_activity WHERE usename='\''gamilit_user'\'';" 2>/dev/null || echo "N/A"'
```

- [ ] Connection count stable (not growing)
- [ ] Connection count < 50

---

## Phase 9: Backup Verification

```bash
# Check if backup exists
ls -lh ~/gamilit-workspace/apps/database/backups/ 2>/dev/null || echo "No backup directory"

# Create pre-deployment backup (RECOMMENDED)
pg_dump -h localhost -U gamilit_user gamilit_platform > \
  ~/gamilit-workspace/backups/pre-deploy-$(date +%Y%m%d-%H%M%S).sql

# Verify backup
ls -lh ~/gamilit-workspace/backups/pre-deploy-*.sql | tail -1
```

- [ ] Backup created successfully
- [ ] Backup file size > 1 MB (indicates data was backed up)

---

## Phase 10: Monitoring & Alerting

### Configure Monitoring

```bash
# Set up log monitoring (example with PM2 Plus)
# Or use your monitoring tool (NewRelic, DataDog, etc.)

# At minimum, watch these files:
tail -f ~/logs/backend-error.log
tail -f ~/logs/backend-out.log
tail -f ~/logs/frontend-error.log
```

- [ ] Error logs are being written to
- [ ] Logs are readable by your monitoring system

### Configure Alerts

- [ ] Alert if backend process restarts
- [ ] Alert if Redis connection lost
- [ ] Alert if database connections exceed 80
- [ ] Alert if backend memory > 700 MB
- [ ] Alert if HTTP response time > 5 seconds

---

## Final Verification Checklist

**Security:**
- [ ] `.env.production` file permissions: 600 (only owner can read)
- [ ] No placeholder values in `.env.production`
- [ ] All secrets are 32+ characters
- [ ] CORS origins are HTTPS only
- [ ] Swagger is disabled in production logs

**Configuration:**
- [ ] All critical env vars are set (see Section 1)
- [ ] DB connection works
- [ ] Redis connection works
- [ ] Pool size calculated and set

**Deployment:**
- [ ] Backend built successfully
- [ ] Frontend built successfully
- [ ] PM2 processes are "online"
- [ ] No errors in PM2 logs
- [ ] Health endpoints respond

**Functionality:**
- [ ] API endpoints respond (health check)
- [ ] Frontend loads (root path)
- [ ] Authentication endpoints respond
- [ ] No timeout/connection errors in logs

**Performance:**
- [ ] Memory usage is stable
- [ ] Database connections < 50
- [ ] Response times < 5 seconds
- [ ] No memory leaks (watch over 5 minutes)

**Readiness:**
- [ ] Database backup created
- [ ] Monitoring tools configured
- [ ] Alerting rules configured
- [ ] Rollback plan documented

---

## Rollback Procedure (If Needed)

```bash
# Stop PM2 processes
pm2 stop all

# Revert to previous version (if using git)
git log --oneline | head -3
git reset --hard <previous_commit_hash>

# Restore from backup
psql -h localhost -U gamilit_user gamilit_platform < \
  ~/gamilit-workspace/backups/pre-deploy-<timestamp>.sql

# Rebuild and restart
npm run build:all
pm2 restart all
```

---

## Sign-Off

- [ ] All checklist items completed
- [ ] No blockers found
- [ ] Ready for production deployment

**Deployment Date:** ________________
**Deployed By:** ________________
**Verified By:** ________________

---

## Support & Troubleshooting

**Issue: Backend won't start**
```bash
# Check logs
pm2 logs gamilit-backend

# Common causes:
# 1. Missing .env.production file
# 2. Placeholder values in .env.production
# 3. PostgreSQL not running
# 4. Port 3006 already in use
```

**Issue: Redis connection failing**
```bash
# Check Redis is running
redis-cli PING

# Check Redis config in .env.production
grep REDIS_URL apps/backend/.env.production

# Test connection manually
redis-cli -u redis://localhost:6379 PING
```

**Issue: Database connections exhausted**
```bash
# Check current connections
psql -h localhost -U gamilit_user -d gamilit_platform \
  -c "SELECT count(*) FROM pg_stat_activity WHERE usename='gamilit_user';"

# Increase pool size
# Edit apps/backend/.env.production: DB_POOL_MAX=10
# Restart backend: pm2 restart gamilit-backend
```

**Issue: CORS errors in frontend**
```bash
# Check CORS configuration
grep CORS_ORIGIN apps/backend/.env.production

# Restart backend
pm2 restart gamilit-backend

# Check browser console for specific origin being rejected
```

---

**Last Updated:** 2026-02-28
**Reference:** TASK-2026-02-28-PROD-DB-AUDIT
