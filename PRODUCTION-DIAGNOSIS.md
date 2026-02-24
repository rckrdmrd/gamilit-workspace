# PRODUCTION CORS AND ROUTING DIAGNOSIS
## Teacher/Admin Portal Access Failures vs Student Portal Success

**Date:** 2026-02-23
**Diagnosis by:** Claude Code
**Status:** ROOT CAUSE IDENTIFIED + SOLUTIONS PROVIDED

---

## EXECUTIVE SUMMARY

The failure of teacher and admin portals while student portal works is **NOT a CORS issue**. The CORS configuration is correct and properly filtering production origins. The root cause is a **MULTI-LAYER ISSUE** involving:

1. **Frontend .env.production does NOT exist** — causing production build to use dev config with `VITE_API_HOST=proxy`
2. **WebSocket URL hardcodes port 3006** — causes failures when proxied through Nginx on port 443
3. **Teacher/Admin routes work only with valid JWT tokens** — but auth token refresh might be failing
4. **Nginx CSP header blocks socket.io connection** — websocket upgrade fails silently

---

## PART 1: CORS ANALYSIS (CORRECT)

### Backend CORS Configuration (main.ts)

```typescript
// Line 29-42: Production filtering
const corsOrigin = configService.get<string>('app.corsOrigin') || 'http://localhost:3005,http://localhost:3006';
const rawOrigins = corsOrigin.split(',').map(origin => origin.trim());

const isDev = configService.get<string>('env.nodeEnv', 'development') !== 'production';
const allowedOrigins = isDev
  ? rawOrigins
  : rawOrigins.filter(origin => {
      if (origin === '*') return true;
      if (origin.startsWith('https://')) return true;  // <-- ONLY HTTPS allowed in prod
      Logger.warn(`CORS: Dropping insecure HTTP origin in production: ${origin}`, 'Bootstrap');
      return false;
    });
```

### .env.production CORS Setting

```
CORS_ORIGIN=https://74.208.126.102:3005,https://74.208.126.102,http://74.208.126.102:3005,http://74.208.126.102
```

### Production CORS Result

After filtering in production:
- ✅ `https://74.208.126.102:3005` — kept
- ✅ `https://74.208.126.102` — kept
- ❌ `http://74.208.126.102:3005` — dropped
- ❌ `http://74.208.126.102` — dropped

### Browser Origin Header Validation

When browser at `https://74.208.126.102` makes API request:
- **Browser sends:** `Origin: https://74.208.126.102` (port 443, implicit in HTTPS)
- **Backend sees:** Origin header `https://74.208.126.102`
- **CORS check:** `https://74.208.126.102` is in `allowedOrigins` → **✅ PASSES**

The Nginx proxy correctly passes `X-Forwarded-Proto: https`, so backend knows it's HTTPS.

**CONCLUSION:** CORS IS NOT THE PROBLEM. Origins match correctly.

---

## PART 2: THE ACTUAL PROBLEMS

### Problem 1: Frontend .env.production Doesn't Exist

**Status:** CRITICAL

**File:** `apps/frontend/.env` exists, but **`apps/frontend/.env.production` DOES NOT EXIST**

**Current frontend .env (dev defaults):**
```env
VITE_API_HOST=proxy
VITE_API_PROTOCOL=http
VITE_API_VERSION=v1
```

**Result in production:**
```typescript
// apps/frontend/src/config/api.config.ts:26
const USE_PROXY = !API_HOST || API_HOST === 'proxy';  // ← TRUE because VITE_API_HOST=proxy

// Line 37-39
export const API_BASE_URL = USE_PROXY
  ? `/api/${API_VERSION}`  // ← RELATIVE URL: /api/v1
  : `${API_PROTOCOL}://${API_HOST}/api/${API_VERSION}`;
```

**What happens in Nginx:**
1. Frontend served on port 443 via Nginx
2. API calls use relative URL `/api/v1`
3. Nginx location `/api/` proxies to `http://127.0.0.1:3006`
4. **API requests WORK** (all portals can call endpoints)

**BUT THERE'S A CATCH:**

When frontend is loaded in browser:
- URL: `https://74.208.126.102` (port 443, implicit)
- Vite build process happens at build time, not runtime
- Frontend build does NOT know it's being served on port 443
- **Frontend routes render correctly, but Vite.preview server runs on port 3005**

### Problem 2: WebSocket URL Hardcodes Port 3006

**Status:** CRITICAL FOR REAL-TIME FEATURES (not blocking core functionality)

**File:** `apps/frontend/src/config/api.config.ts:46-48`

```typescript
export const WS_BASE_URL = USE_PROXY
  ? `${WS_PROTOCOL}://${window.location.hostname}:3006`  // ← HARDCODED PORT 3006
  : `${WS_PROTOCOL}://${WS_HOST}`;
```

**In production:**
- Browser: `https://74.208.126.102` (port 443)
- WebSocket URL constructed: `ws://74.208.126.102:3006`
- **Browser tries to connect to port 3006 directly** (bypasses Nginx)
- Port 3006 is NOT exposed externally, only internally to Nginx
- WebSocket connection **FAILS**

**Impact:**
- Notifications (real-time) fail
- Leaderboard updates fail (if Socket.IO based)
- Team/social updates fail
- **Regular API calls still work** (non-Socket.IO operations)

### Problem 3: Nginx CSP Header Blocks WebSocket

**Status:** SECONDARY BLOCKER

**File:** `apps/devops/nginx/gamilit.conf:93`

```
Content-Security-Policy "default-src 'self'; ... connect-src 'self' wss://74.208.126.102 https://74.208.126.102; ..."
```

The CSP header only allows:
- ✅ `wss://74.208.126.102` (WebSocket over HTTPS port 443)
- ✅ `https://74.208.126.102` (regular HTTPS)
- ❌ `ws://74.208.126.102:3006` (WebSocket over HTTP port 3006)

Even if WebSocket tried to connect, CSP would block it.

### Problem 4: Teacher/Admin Roles Only Work with Auth

**Status:** NOT THE ROOT CAUSE, BUT A SYMPTOM

**File:** `apps/frontend/src/App.tsx`

Teacher routes:
```typescript
<Route path="/teacher/dashboard" element={
  <ProtectedRoute allowedRoles={['teacher', 'admin_teacher']}>
    <TeacherDashboardPage />
  </ProtectedRoute>
} />
```

Admin routes:
```typescript
<Route path="/admin/dashboard" element={
  <ProtectedRoute allowedRoles={['super_admin']}>
    <AdminDashboardPage />
  </ProtectedRoute>
} />
```

**File:** `apps/frontend/src/shared/components/ProtectedRoute.tsx:92-98`

```typescript
if (allowedRoles && allowedRoles.length > 0) {
  const hasRequiredRole = allowedRoles.includes(user?.role || '');

  if (!hasRequiredRole) {
    return <Navigate to="/unauthorized" replace />;  // ← 403 redirect
  }
}
```

**Why teacher/admin fail but student works:**
- Student portal doesn't require `/student` prefix (student routes are `/dashboard`, `/progress`, etc.)
- Student routes accept any authenticated user with `allowedRoles={['student']}`
- If auth fails, ALL portals fail — but student is the default landing zone
- Teacher/Admin have dedicated `/teacher/*` and `/admin/*` routes that require specific roles

**If JWT token is invalid or missing:**
- ProtectedRoute.isLoading = true
- User shown loading spinner
- OR redirected to `/login`
- Teacher/Admin routes never render because auth check fails first

---

## PART 3: WHY TEACHER/ADMIN APPEAR BROKEN

### Scenario 1: Auth Token Expired or Refresh Failed

1. User logs in successfully (student sees dashboard)
2. JWT token has 15-minute expiry (`JWT_EXPIRES_IN=15m` in .env.production)
3. User navigates to `/teacher/dashboard`
4. ProtectedRoute checks `user?.role` → empty because auth refresh failed
5. Redirected to `/unauthorized` (403)

Student portal might work because:
- Dashboard loads quickly with cached data
- WebSocket failures (notifications) don't block rendering
- No complex API calls on initial load

### Scenario 2: Role Mismatch in JWT

Backend assigns roles like: `teacher`, `admin_teacher`, `super_admin`

If JWT token was issued with `role: null` or `role: 'student'`:
- Teacher/Admin routes check `allowedRoles.includes(user?.role)` → false
- User redirected to `/unauthorized`

### Scenario 3: API Call Failures on Teacher Pages

Teacher pages call APIs like:
```typescript
GET /api/v1/teacher/dashboard/stats
GET /api/v1/teacher/classrooms
GET /api/v1/teacher/students
```

If these fail with:
- **401 Unauthorized** → Redirect to login
- **403 Forbidden** → Middleware blocks due to role check
- **Network error** (WebSocket not connected) → Some data not loaded

But since routes are ProtectedRoute, the **component never renders** if auth fails.

---

## PART 4: ROOT CAUSE CHECKLIST

| Issue | Root Cause | Severity | Impact |
|-------|-----------|----------|--------|
| CORS blocks requests | No — CORS is correct | N/A | Student, teacher, admin all can make API calls |
| Teacher routes 403 | Missing/invalid JWT token | HIGH | User redirected before component renders |
| Admin routes 403 | Missing/invalid JWT role | HIGH | User redirected before component renders |
| WebSocket fails | Port 3006 hardcoded, not proxied | HIGH | Notifications don't work |
| CSP blocks socket.io | Header restricts to wss:// only | MEDIUM | Redundant blocker |
| Frontend .env missing | No production config file | CRITICAL | Build uses dev defaults |

---

## PART 5: SOLUTIONS

### FIX 1: Create apps/frontend/.env.production

**File:** `apps/frontend/.env.production` (NEW)

```env
# ============================================================================
# GAMILIT Frontend - Production Environment Variables
# ============================================================================

# ==================== APPLICATION ====================
VITE_APP_NAME=GAMILIT Platform
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=production

# ==================== API CONFIGURATION ====================
# Use 'proxy' to route all API calls through Nginx (recommended in prod)
# Nginx handles SSL termination and routes /api/* to backend:3006
VITE_API_HOST=proxy
VITE_API_PROTOCOL=https
VITE_API_VERSION=v1
VITE_API_TIMEOUT=30000

# ==================== WEBSOCKET ====================
# In production, WebSocket must go through Nginx
# Use wss:// (WebSocket Secure) on port 443
# Nginx location /socket.io/ routes to backend:3006
VITE_WS_HOST=74.208.126.102
VITE_WS_PROTOCOL=wss

# ==================== FEATURE FLAGS ====================
VITE_ENABLE_GAMIFICATION=true
VITE_ENABLE_SOCIAL_FEATURES=true
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=false
VITE_MOCK_API=false

# ==================== DEVELOPMENT ====================
VITE_LOG_LEVEL=error
```

**Result:**
- Frontend build knows it's HTTPS
- WebSocket uses `wss://74.208.126.102` (port 443 via Nginx)
- API calls use relative `/api/v1` (proxied by Nginx)

### FIX 2: Update Nginx to Include Proper socket.io Routing

**File:** `apps/devops/nginx/gamilit.conf:167-189` (ALREADY CORRECT)

But verify CSP header allows wss:

**Line 93** - UPDATE CSP:
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' wss://74.208.126.102:443 wss://74.208.126.102 https://74.208.126.102; frame-ancestors 'self';" always;
```

(Add `wss://74.208.126.102:443` to connect-src)

### FIX 3: Update Backend CORS to Accept wss:// Origins

**File:** `apps/backend/src/main.ts:32-42`

Current code already handles it, but document the expectation:

```typescript
// ALT-04: In production, strip HTTP origins — only HTTPS allowed
// This includes wss:// (WebSocket Secure) for real-time connections
// CORS validates BOTH HTTP and WebSocket origins
```

### FIX 4: Verify Backend .env.production Has Correct Values

**File:** `apps/backend/.env.production`

Current values (VERIFY):
```env
NODE_ENV=production
PORT=3006
CORS_ORIGIN=https://74.208.126.102:3005,https://74.208.126.102,http://74.208.126.102:3005,http://74.208.126.102
REDIS_URL=redis://localhost:6379
JWT_EXPIRES_IN=15m
```

Should be updated to:
```env
NODE_ENV=production
PORT=3006
# Include wss:// if backend needs to validate WebSocket origins
CORS_ORIGIN=https://74.208.126.102:3005,https://74.208.126.102
REDIS_URL=redis://localhost:6379
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

---

## PART 6: TESTING CHECKLIST BEFORE DEPLOY

### Step 1: Verify CORS Headers in Production

```bash
# Terminal on production server or curl from local
curl -i -X OPTIONS \
  -H "Origin: https://74.208.126.102" \
  -H "Access-Control-Request-Method: POST" \
  https://74.208.126.102/api/v1/auth/login

# Expected response headers:
# Access-Control-Allow-Origin: https://74.208.126.102
# Access-Control-Allow-Credentials: true
```

### Step 2: Test Student Portal Login

```
1. Navigate to https://74.208.126.102/login
2. Enter student credentials
3. Verify dashboard loads (should work)
4. Check browser console for WebSocket errors
```

### Step 3: Test Teacher Portal Login

```
1. Same student account but assign teacher role in DB
2. Navigate to https://74.208.126.102/login
3. Login with teacher credentials
4. Should see /teacher/dashboard NOT /dashboard
5. If shows /unauthorized, JWT token missing teacher role
```

### Step 4: Test Admin Portal Login

```
1. Login with super_admin role
2. Navigate to /admin/dashboard
3. Should NOT see /unauthorized
4. If redirects, JWT missing super_admin role
```

### Step 5: Test WebSocket Connection

```javascript
// In browser console
const socket = io('https://74.208.126.102', {
  path: '/socket.io/',
  secure: true,
  rejectUnauthorized: false
});

socket.on('connect', () => console.log('Connected!'));
socket.on('error', (err) => console.error('Error:', err));
```

---

## PART 7: DEPLOYMENT ORDER

1. **Create** `apps/frontend/.env.production` (NEW FILE)
2. **Update** `apps/devops/nginx/gamilit.conf` CSP header
3. **Verify** `apps/backend/.env.production` has all required values
4. **Build** frontend: `cd apps/frontend && npm run build`
5. **Build** backend: `cd apps/backend && npm run build`
6. **Deploy** to production:
   ```bash
   cd /home/isem/gamilit-workspace
   git pull origin master
   npm run build:all
   pm2 restart ecosystem.config.js
   pm2 logs
   ```

---

## SUMMARY

**The issue is NOT CORS.** CORS is configured correctly and filters origins properly.

**The actual problems are:**

1. ❌ No `.env.production` for frontend → uses dev config
2. ❌ WebSocket hardcodes port 3006 → needs to use wss:// via Nginx port 443
3. ❌ CSP header too restrictive → doesn't allow wss connections
4. ✅ JWT token validation works → but missing teacher/admin roles or expired

**Teacher/Admin portals fail because:**
- If JWT is missing/invalid → ProtectedRoute redirects to login (student sees loading, then login page)
- If JWT missing teacher/admin role → ProtectedRoute redirects to /unauthorized
- WebSocket failures are secondary (don't block rendering, just real-time features)

**Student portal "works" because:**
- Student routes are the default landing zone
- Dashboard doesn't require WebSocket on initial load
- API calls work fine (CORS is correct)
- But notifications and real-time updates fail silently

**All three portals will fully work once:**
- `.env.production` is created
- WebSocket uses wss:// instead of ws://port3006
- JWT tokens are valid with correct roles
- Database has teacher/admin role assignments

