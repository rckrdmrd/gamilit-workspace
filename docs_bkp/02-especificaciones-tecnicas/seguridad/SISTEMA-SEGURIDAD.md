# Sistema de Seguridad - GAMILIT Platform

**Version**: 2.0
**Fecha**: Octubre 2025
**Arquitectura de Seguridad**: Defense-in-Depth (5 capas)

---

## 🔗 Trazabilidad

**Casos de uso relacionados:**
- [UC-STU-001: Registro de estudiante](../../01-requerimientos/casos-uso/student/UC-STU-001-registro.md) - Autenticación y registro seguro

**User Stories:**
- [US-FUND-001: Autenticación básica JWT](../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/historias/US-FUND-001-autenticacion-basica-jwt.md) - Sistema JWT (7 días), bcrypt, recuperación
- [US-FUND-005: Sistema de sesiones y estado](../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/historias/US-FUND-005-sistema-sesiones-estado.md) - Gestión de tokens y refresh
- [US-FUND-004: Infraestructura técnica base](../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/historias/US-FUND-004-infraestructura-tecnica-base.md) - PostgreSQL RLS y multi-tenancy

**Épicas:**
- [EAI-001: Fundamentos](../../04-planificacion/01-alcance-inicial/EAI-001-fundamentos/_MAP.md) - Auth base y seguridad
- [EAI-005: Admin Base](../../04-planificacion/01-alcance-inicial/EAI-005-admin-base/_MAP.md) - RBAC y gestión de permisos

**Requerimientos funcionales:**
- [Seguridad y autenticación](../../01-requerimientos/proyecto/) - Políticas de seguridad del proyecto

**ADRs relacionados:**
- [ADR-002: JWT Security Implementation](../adr/ADR-002-jwt-security-implementation.md) - Decisión de implementación JWT

---

## Tabla de Contenidos

1. [Vision General](#vision-general)
2. [Arquitectura de 5 Capas](#arquitectura-de-5-capas)
3. [JWT Authentication](#jwt-authentication)
4. [Row Level Security (RLS)](#row-level-security-rls)
5. [RBAC - Role Based Access Control](#rbac---role-based-access-control)
6. [Multi-Tenancy](#multi-tenancy)
7. [Rate Limiting y Throttling](#rate-limiting-y-throttling)

---

## Vision General

GAMILIT Platform implementa **seguridad en profundidad (defense-in-depth)** con 5 capas de proteccion que trabajan en conjunto para garantizar la confidencialidad, integridad y disponibilidad de los datos.

### Principios de Seguridad

1. **Least Privilege** - Usuarios tienen solo permisos necesarios
2. **Defense in Depth** - Multiples capas de seguridad
3. **Fail Secure** - Fallas resultan en denegacion, no en acceso
4. **Zero Trust** - Validacion en cada capa
5. **Auditability** - Todas las acciones son registradas

---

## Arquitectura de 5 Capas

```
┌────────────────────────────────────────────────────────────┐
│  Layer 1: Network Security                                 │
│  - HTTPS/TLS encryption                                    │
│  - CORS policies                                           │
│  - Rate limiting                                           │
│  - DDoS protection                                         │
└────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│  Layer 2: Authentication & Authorization                   │
│  - JWT tokens (7 days)                                     │
│  - Password hashing (bcrypt 12 rounds)                     │
│  - Multi-factor authentication (planned)                   │
│  - Session management                                      │
└────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│  Layer 3: Row Level Security (RLS)                        │
│  - PostgreSQL native RLS                                   │
│  - 159+ security policies                                  │
│  - Tenant isolation                                        │
│  - User context enforcement                                │
└────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│  Layer 4: Input Validation                                 │
│  - Zod schema validation                                   │
│  - SQL injection prevention                                │
│  - XSS protection                                          │
│  - File upload validation                                  │
└────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│  Layer 5: Output Security                                  │
│  - Content Security Policy                                 │
│  - XSS prevention (React auto-escape)                      │
│  - CSRF protection                                         │
│  - Secure headers (Helmet.js)                              │
└────────────────────────────────────────────────────────────┘
```

---

## JWT Authentication

### Token Structure

```typescript
// JWT Payload
interface JWTPayload {
  sub: string;        // user_id (UUID)
  email: string;      // user email
  role: string;       // 'student' | 'admin_teacher' | 'super_admin'
  tenant_id: string;  // tenant UUID for multi-tenancy
  iat: number;        // issued at timestamp
  exp: number;        // expiration timestamp
}
```

### Token Generation

```typescript
// backend/src/services/auth.service.ts
export class AuthService {
  generateAccessToken(user: User): string {
    return jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        tenant_id: user.tenant_id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d',
        issuer: 'glit-platform',
        audience: 'glit-users'
      }
    );
  }

  generateRefreshToken(user: User): string {
    return jwt.sign(
      { sub: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '30d' }
    );
  }
}
```

### Token Validation

```typescript
// backend/src/middleware/auth.middleware.ts
export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Token not provided' }
      });
    }

    const token = authHeader.substring(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;

    // Attach user to request
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      tenant_id: payload.tenant_id
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: { code: 'TOKEN_EXPIRED', message: 'Token expired' }
      });
    }
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid token' }
    });
  }
};
```

### Password Security

```typescript
// Password hashing with bcrypt
const SALT_ROUNDS = 12;

export class PasswordService {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  validate(password: string): boolean {
    // Min 8 chars, 1 uppercase, 1 lowercase, 1 number
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
  }
}
```

**Password Requirements:**
- Minimo 8 caracteres
- Al menos 1 mayuscula
- Al menos 1 minuscula
- Al menos 1 numero
- bcrypt hashing con 12 rounds (>300ms per hash)

---

## Row Level Security (RLS)

### RLS Architecture

PostgreSQL RLS proporciona seguridad a nivel de fila, garantizando que los usuarios solo puedan acceder a datos autorizados **directamente en la base de datos**.

### Helper Functions

```sql
-- auth.uid() - Get current user ID from JWT
CREATE FUNCTION auth.uid() RETURNS UUID AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.sub', TRUE), '')::UUID;
$$ LANGUAGE sql STABLE;

-- auth.role() - Get current user role from JWT
CREATE FUNCTION auth.role() RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.role', TRUE), '');
$$ LANGUAGE sql STABLE;

-- auth.email() - Get current user email from JWT
CREATE FUNCTION auth.email() RETURNS TEXT AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.email', TRUE), '');
$$ LANGUAGE sql STABLE;

-- auth.tenant_id() - Get current tenant ID from JWT
CREATE FUNCTION auth.tenant_id() RETURNS UUID AS $$
  SELECT NULLIF(current_setting('request.jwt.claim.tenant_id', TRUE), '')::UUID;
$$ LANGUAGE sql STABLE;
```

### RLS Middleware (Node.js)

```typescript
// backend/src/middleware/rls.middleware.ts
export const applyRLS = (pool: Pool) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(); // Skip if not authenticated
    }

    const client = await pool.connect();

    try {
      // Set PostgreSQL session variables from JWT
      await client.query(`
        BEGIN;
        SET LOCAL request.jwt.claim.sub = $1;
        SET LOCAL request.jwt.claim.email = $2;
        SET LOCAL request.jwt.claim.role = $3;
        SET LOCAL request.jwt.claim.tenant_id = $4;
      `, [req.user.id, req.user.email, req.user.role, req.user.tenant_id]);

      // Attach client to request for query execution
      req.dbClient = client;

      // Commit transaction on response finish
      res.on('finish', async () => {
        try {
          await client.query('COMMIT');
        } catch (err) {
          await client.query('ROLLBACK');
        } finally {
          client.release();
        }
      });

      next();
    } catch (error) {
      await client.query('ROLLBACK');
      client.release();
      next(error);
    }
  };
};
```

### Example RLS Policies

#### Students - Own Data Only

```sql
-- Students can only SELECT their own data
CREATE POLICY "student_own_data"
ON progress_tracking.module_progress
FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND auth.role() = 'student');

-- Students can INSERT their own progress
CREATE POLICY "student_insert_own"
ON progress_tracking.module_progress
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND auth.role() = 'student');

-- Students can UPDATE their own progress
CREATE POLICY "student_update_own"
ON progress_tracking.module_progress
FOR UPDATE
TO authenticated
USING (user_id = auth.uid() AND auth.role() = 'student')
WITH CHECK (user_id = auth.uid());
```

#### Teachers - Classroom Students

```sql
-- Teachers can see progress of students in their classrooms
CREATE POLICY "teacher_classroom_students"
ON progress_tracking.module_progress
FOR SELECT
TO authenticated
USING (
  auth.role() = 'admin_teacher'
  AND user_id IN (
    SELECT cm.user_id
    FROM social_features.classroom_members cm
    JOIN social_features.classrooms c ON cm.classroom_id = c.id
    WHERE c.teacher_id = auth.uid()
  )
);
```

#### Super Admins - All Access

```sql
-- Super admins can access all data
CREATE POLICY "super_admin_all_access"
ON progress_tracking.module_progress
FOR ALL
TO authenticated
USING (auth.role() = 'super_admin')
WITH CHECK (auth.role() = 'super_admin');
```

### Multi-Tenant RLS

```sql
-- Ensure tenant isolation across all tables
CREATE POLICY "tenant_isolation"
ON auth_management.profiles
FOR ALL
TO authenticated
USING (tenant_id = auth.tenant_id())
WITH CHECK (tenant_id = auth.tenant_id());
```

### Total RLS Policies: 159+

Distribucion por schema:
- `auth_management`: 20 policies
- `gamification_system`: 35 policies
- `educational_content`: 25 policies
- `progress_tracking`: 30 policies
- `social_features`: 25 policies
- `content_management`: 10 policies
- `system_configuration`: 5 policies
- `audit_logging`: 9 policies

---

## RBAC - Role Based Access Control

### Role Hierarchy

```
super_admin (Full system access)
    │
    ├─── admin_teacher (Classroom + Content management)
    │       │
    │       └─── student (Limited to own data + enrolled classrooms)
```

### Role Definitions

```typescript
export enum UserRole {
  STUDENT = 'student',
  ADMIN_TEACHER = 'admin_teacher',
  SUPER_ADMIN = 'super_admin'
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

export const ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: UserRole.STUDENT,
    permissions: [
      'read:own_profile',
      'update:own_profile',
      'read:own_progress',
      'create:exercise_attempt',
      'read:public_content',
      'join:classroom',
      'read:own_stats',
      'use:powerups'
    ]
  },
  {
    role: UserRole.ADMIN_TEACHER,
    permissions: [
      // All student permissions
      ...ROLE_PERMISSIONS[0].permissions,
      // Plus teacher-specific
      'create:classroom',
      'update:own_classroom',
      'read:classroom_students',
      'create:exercise',
      'update:own_exercise',
      'read:classroom_analytics',
      'create:assignment',
      'update:student_progress'
    ]
  },
  {
    role: UserRole.SUPER_ADMIN,
    permissions: [
      // All permissions
      'admin:*'
    ]
  }
];
```

### Permission Middleware

```typescript
// backend/src/middleware/permissions.middleware.ts
export const requirePermission = (...permissions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' }
      });
    }

    const userPermissions = ROLE_PERMISSIONS.find(
      rp => rp.role === req.user.role
    )?.permissions || [];

    // Super admin has all permissions
    if (req.user.role === UserRole.SUPER_ADMIN) {
      return next();
    }

    // Check if user has required permission
    const hasPermission = permissions.some(p => userPermissions.includes(p));

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions' }
      });
    }

    next();
  };
};
```

### Usage Example

```typescript
// backend/src/modules/educational/exercise.routes.ts
router.get(
  '/exercises',
  authenticateJWT,
  requirePermission('read:public_content'),
  exerciseController.list
);

router.post(
  '/exercises',
  authenticateJWT,
  requirePermission('create:exercise'),
  validateRequest(createExerciseSchema),
  exerciseController.create
);

router.delete(
  '/exercises/:id',
  authenticateJWT,
  requirePermission('admin:*'),
  exerciseController.delete
);
```

---

## Multi-Tenancy

### Tenant Isolation Strategy

GAMILIT implementa **multi-tenancy nativo** a nivel de base de datos usando PostgreSQL RLS:

```sql
-- All tenant-scoped tables include tenant_id
CREATE TABLE auth_management.profiles (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES auth_management.tenants(id),
    email TEXT UNIQUE NOT NULL,
    -- ... other fields
);

-- RLS policy enforces tenant isolation
CREATE POLICY "tenant_isolation"
ON auth_management.profiles
FOR ALL
TO authenticated
USING (tenant_id = auth.tenant_id())
WITH CHECK (tenant_id = auth.tenant_id());
```

### Tenant Context

```typescript
// JWT includes tenant_id
interface JWTPayload {
  sub: string;
  tenant_id: string; // Tenant UUID
  role: string;
  // ...
}

// All queries automatically filtered by tenant
const users = await client.query(
  'SELECT * FROM auth_management.profiles WHERE role = $1',
  ['student']
);
// RLS automatically adds: AND tenant_id = auth.tenant_id()
```

### Benefits

1. **Data Isolation** - Tenants cannot access other tenants' data
2. **Database-Level** - Enforced at PostgreSQL level, not application
3. **Performance** - Single database, efficient queries
4. **Maintenance** - Single schema, easier updates

---

## Rate Limiting y Throttling

### Rate Limit Configuration

```typescript
// backend/src/middleware/rate-limit.middleware.ts
import rateLimit from 'express-rate-limit';

// General API rate limit
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Auth endpoints rate limit (stricter)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 attempts per 15 minutes
  skipSuccessfulRequests: true
});

// File upload rate limit
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10 // 10 uploads per hour
});
```

### Apply to Routes

```typescript
// Apply general limiter to all API routes
app.use('/api', apiLimiter);

// Apply stricter limiter to auth routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Apply upload limiter
app.use('/api/content/upload', uploadLimiter);
```

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

## Security Best Practices

### Input Validation

```typescript
// Use Zod for validation
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

app.post('/auth/login',
  validateRequest({ body: loginSchema }),
  authController.login
);
```

### SQL Injection Prevention

```typescript
// ✅ CORRECT - Parameterized query
await client.query(
  'SELECT * FROM users WHERE email = $1',
  [email]
);

// ❌ WRONG - String concatenation
await client.query(
  `SELECT * FROM users WHERE email = '${email}'`
);
```

### XSS Prevention

```typescript
// React auto-escapes by default
<div>{userInput}</div> // Safe

// For HTML content, use DOMPurify
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{
  __html: DOMPurify.sanitize(htmlContent)
}} />
```

### CSRF Protection

```typescript
// Use SameSite cookies
res.cookie('session', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict'
});

// CSRF tokens for state-changing operations
app.use(csrf());
```

### Security Headers (Helmet.js)

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

---

## Audit Logging

### Audit Trail

```sql
CREATE TABLE audit_logging.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    severity log_severity DEFAULT 'info',
    created_at TIMESTAMPTZ DEFAULT now()
);
```

### Logging Service

```typescript
export class AuditLogger {
  async log(event: AuditEvent): Promise<void> {
    await client.query(`
      INSERT INTO audit_logging.audit_logs
      (user_id, action, resource_type, resource_id, old_values, new_values, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      event.userId,
      event.action,
      event.resourceType,
      event.resourceId,
      JSON.stringify(event.oldValues),
      JSON.stringify(event.newValues),
      event.ipAddress
    ]);
  }
}
```

---

## Security Metrics

| Metrica | Valor |
|---------|-------|
| **Password Hashing** | bcrypt 12 rounds (~300ms) |
| **JWT Expiration** | 7 dias (access), 30 dias (refresh) |
| **RLS Policies** | 159+ policies |
| **Rate Limits** | 5-100 req/15min |
| **Session Timeout** | 7 dias de inactividad |
| **Password Requirements** | 8+ chars, 1 upper, 1 lower, 1 number |

---

## Referencias

> **Fuentes de requerimientos:**
> - [RNF-SEC-001 - Autenticación JWT](../../01-requerimientos/requerimientos-no-funcionales/RNF-SEC-001-autenticacion-jwt.md)
> - [RNF-SEC-002 - Row Level Security](../../01-requerimientos/requerimientos-no-funcionales/RNF-SEC-002-rls.md)

**Especificaciones técnicas:**
- [Backend Architecture](../arquitectura/BACKEND-ARCHITECTURE.md)
- [API Reference](../apis/API-REFERENCE.md)
- [ADR-002 - JWT Security Implementation](../adr/ADR-002-jwt-security-implementation.md)
- [ADR-003 - RLS vs App Layer Authorization](../adr/ADR-003-rls-vs-app-layer-authorization.md)

**Desarrollo:**
- [Base de Datos - Esquema Completo](../../03-desarrollo/base-de-datos/ESQUEMA-COMPLETO.md)
- [Backend - Middleware de Seguridad](../../03-desarrollo/backend/middleware/README.md)

---

**Ultima actualizacion:** Octubre 2025
**Mantenido por:** GAMILIT Platform Team
