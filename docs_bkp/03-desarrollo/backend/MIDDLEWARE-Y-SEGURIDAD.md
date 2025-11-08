# ⚠️ DEPRECATED: Middleware y Seguridad del Backend GAMILIT

> **IMPORTANTE:** Este documento está OBSOLETO y contiene información arquitecturalmente incorrecta.
>
> **Razón:** El backend de GAMILIT usa **NestJS** con Guards, NO Express con middleware tradicional.
>
> **Documento actualizado:** Ver [GUARDS-Y-SEGURIDAD.md](./GUARDS-Y-SEGURIDAD.md)
>
> **Fecha de deprecación:** 2025-11-07
>
> ---
>
> El contenido a continuación describe una arquitectura de Express middleware que **NO está implementada**.
> Se mantiene este archivo solo para referencia histórica.

---

## Índice

1. [Los 8 Middlewares Principales](#los-8-middlewares-principales)
2. [auth.middleware.ts](#1-authmiddlewarets)
3. [validation.middleware.ts](#2-validationmiddlewarets)
4. [rate-limit.middleware.ts](#3-rate-limitmiddlewarets)
5. [ownership.middleware.ts](#4-ownershipmiddlewarets)
6. [permission.middleware.ts](#5-permissionmiddlewarets)
7. [error.middleware.ts](#6-errormiddlewarets)
8. [tenant.middleware.ts](#7-tenantmiddlewarets)
9. [rls.middleware.ts](#8-rlsmiddlewarets)
10. [Esquemas de Validación](#esquemas-de-validación)
11. [Buenas Prácticas](#buenas-prácticas-de-seguridad)

---

## Los 8 Middlewares Principales

| Middleware | Propósito | Ubicación en Pipeline |
|-----------|-----------|----------------------|
| **helmet** | Seguridad HTTP headers | Global (primero) |
| **cors** | CORS policy | Global (segundo) |
| **auth** | Autenticación JWT | Por ruta |
| **validation** | Validación de datos | Por ruta |
| **rate-limit** | Limitación de tasa | Por ruta |
| **ownership** | Anti-IDOR | Por ruta |
| **permission** | Autorización granular | Por ruta |
| **error** | Manejo de errores | Global (último) |

**Pipeline de Request:**
```
Request
  ↓
helmet (seguridad headers)
  ↓
cors (validar origen)
  ↓
body parser (JSON)
  ↓
logging (si dev)
  ↓
rate-limit (si configurado)
  ↓
auth (si requiere autenticación)
  ↓
validation (si hay esquema)
  ↓
ownership/permission (si requiere)
  ↓
Controller
  ↓
error handler (si hay error)
  ↓
Response
```

---

## 1. auth.middleware.ts

**Archivo:** `/src/middleware/auth.middleware.ts`

### `authenticateJWT`

Middleware principal de autenticación. Valida JWT y estado de cuenta.

**Flujo de Autenticación:**
```
1. Extraer token de header Authorization
2. Validar formato: "Bearer TOKEN"
3. Verificar JWT con secret
4. Consultar DB para estado de cuenta
5. Validar cuenta no eliminada (deleted_at IS NULL)
6. Validar estado activo (status = 'active')
7. Adjuntar usuario a req.user
8. Next()
```

**Ejemplo de Uso:**
```typescript
import { authenticateJWT } from '@/middleware/auth.middleware';

// Proteger ruta
router.get('/api/gamification/stats',
  authenticateJWT,  // ← Requiere autenticación
  gamificationController.getUserStats
);
```

**Estados de Cuenta Validados:**
```typescript
// ✓ Permitido
status: 'active' && deleted_at IS NULL

// ✗ Bloqueado (401)
status: 'inactive'  // "Account is inactive"
deleted_at IS NOT NULL  // "Account is inactive"

// ✗ Bloqueado (403)
status: 'suspended'  // "Your account has been suspended..."
status: 'pending'    // "Your account is pending activation..."
```

**Request Enriquecido:**
```typescript
// Después de authenticateJWT, req.user contiene:
interface AuthRequest extends Request {
  user?: {
    id: string;           // UUID del usuario
    email: string;        // Email
    role: string;         // 'student' | 'teacher' | 'admin' | 'super_admin'
    tenant_id?: string;   // ID de organización (multi-tenant)
  };
}
```

**Códigos de Error:**
```typescript
// 401 Unauthorized
'UNAUTHORIZED' - Token no proporcionado
'INVALID_TOKEN' - Token inválido o malformado
'TOKEN_EXPIRED' - Token expirado
'ACCOUNT_INACTIVE' - Cuenta desactivada o eliminada

// 403 Forbidden
'ACCOUNT_SUSPENDED' - Cuenta suspendida
```

---

### `requireRole(...roles: string[])`

Middleware de autorización por rol. Valida que el usuario tenga uno de los roles permitidos.

**Ejemplo de Uso:**
```typescript
import { authenticateJWT, requireRole } from '@/middleware/auth.middleware';

// Solo teachers y admins
router.post('/api/teacher/classrooms',
  authenticateJWT,
  requireRole('teacher', 'admin', 'super_admin'),
  classroomController.createClassroom
);

// Solo super_admin
router.delete('/api/admin/users/:id',
  authenticateJWT,
  requireRole('super_admin'),
  adminController.deleteUser
);
```

**Jerarquía de Roles:**
```
super_admin     ← Acceso total
    ↓
admin           ← Administra organización
    ↓
teacher         ← Gestiona aulas
    ↓
student         ← Usuario final
```

---

### `optionalAuth`

Middleware de autenticación opcional. No bloquea si no hay token.

**Uso:**
```typescript
// Endpoint funciona autenticado o no
router.get('/api/educational/modules',
  optionalAuth,  // ← Si hay token, autenticar; si no, continuar
  modulesController.getModules
);

// En controller:
export const getModules = async (req: AuthRequest, res: Response) => {
  if (req.user) {
    // Usuario autenticado, retornar módulos + progreso
    return getModulesWithProgress(req.user.id);
  } else {
    // Usuario anónimo, retornar solo módulos públicos
    return getPublicModules();
  }
};
```

---

## 2. validation.middleware.ts

**Archivo:** `/src/middleware/validation.middleware.ts`

### `validate(schema, property, options)`

Middleware de validación con Joi. Valida body, params o query.

**Ejemplo de Uso:**
```typescript
import { validate } from '@/middleware/validation.middleware';
import { registerSchema } from './validations/auth.validation';

router.post('/api/auth/register',
  validate(registerSchema, 'body'),  // ← Validar body
  authController.register
);

router.get('/api/users/:id',
  validate(userIdSchema, 'params'),  // ← Validar params
  usersController.getUser
);

router.get('/api/search',
  validate(searchSchema, 'query'),   // ← Validar query
  searchController.search
);
```

**Opciones de Validación (Joi):**
```typescript
const defaultOptions: Joi.ValidationOptions = {
  abortEarly: false,      // Retornar TODOS los errores
  stripUnknown: true,     // Eliminar campos no definidos
  convert: true,          // Auto-convertir tipos
  allowUnknown: false,    // No permitir campos adicionales
};
```

**Respuesta de Error:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "\"email\" must be a valid email",
        "type": "string.email"
      },
      {
        "field": "password",
        "message": "\"password\" length must be at least 8 characters long",
        "type": "string.min"
      }
    ]
  }
}
```

**Shortcuts:**
```typescript
// Atajos para body, query, params
validateBody(schema)    // = validate(schema, 'body')
validateQuery(schema)   // = validate(schema, 'query')
validateParams(schema)  // = validate(schema, 'params')
```

---

## 3. rate-limit.middleware.ts

**Archivo:** `/src/middleware/rate-limit.middleware.ts`

### Rate Limiters Pre-configurados

#### `authRateLimiter`

**Configuración:**
- Ventana: 15 minutos
- Máximo: 5 requests
- Key: `auth:${IP}:${email}`

**Uso:**
```typescript
router.post('/api/auth/login',
  authRateLimiter,  // ← 5 intentos / 15 min
  validate(loginSchema),
  authController.login
);
```

**Propósito:** Prevenir brute-force en autenticación

---

#### `passwordResetRateLimiter`

**Configuración:**
- Ventana: 1 hora
- Máximo: 1 request
- Key: `password-reset:${email}`

**Uso:**
```typescript
router.post('/api/auth/forgot-password',
  passwordResetRateLimiter,  // ← 1 request / hora
  validate(forgotPasswordSchema),
  authController.forgotPassword
);
```

**Propósito:** Prevenir spam de emails de recuperación

---

#### `emailVerificationRateLimiter`

**Configuración:**
- Ventana: 1 hora
- Máximo: 3 requests
- Key: `email-verification:${userId}`

**Uso:**
```typescript
router.post('/api/auth/resend-verification',
  authenticateJWT,
  emailVerificationRateLimiter,  // ← 3 requests / hora
  authController.resendVerification
);
```

---

#### `generalApiRateLimiter`

**Configuración:**
- Ventana: 15 minutos
- Máximo: 100 requests
- Key: `api:user:${userId}` o `api:ip:${IP}`

**Uso:**
```typescript
// Aplicar a rutas generales
router.use('/api', generalApiRateLimiter);
```

---

#### `leaderboardRateLimiter`

**Configuración:**
- Ventana: 1 minuto
- Máximo: 30 requests
- Key: `leaderboard:${userId}`

**Uso:**
```typescript
router.get('/api/gamification/leaderboards/:type',
  authenticateJWT,
  leaderboardRateLimiter,  // ← 30 requests / minuto
  leaderboardsController.getLeaderboard
);
```

---

#### `fileUploadRateLimiter`

**Configuración:**
- Ventana: 1 hora
- Máximo: 10 requests
- Key: `upload:${userId}`

**Uso:**
```typescript
router.post('/api/upload/avatar',
  authenticateJWT,
  fileUploadRateLimiter,  // ← 10 uploads / hora
  uploadController.uploadAvatar
);
```

---

### Custom Rate Limiter

**Crear rate limiter personalizado:**
```typescript
import { createRateLimiter } from '@/middleware/rate-limit.middleware';

const customLimiter = createRateLimiter({
  windowMs: 60 * 1000,     // 1 minuto
  maxRequests: 10,         // 10 requests
  keyGenerator: (req) => {
    return `custom:${req.user?.id || req.ip}`;
  },
  message: 'Too many custom requests',
  skipSuccessfulRequests: false
});

router.get('/api/custom',
  customLimiter,
  controller.customAction
);
```

---

### Headers de Rate Limit

**Respuesta con Rate Limit Headers:**
```
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2025-10-27T11:00:00.000Z
```

**Cuando se excede:**
```
HTTP/1.1 429 Too Many Requests
Retry-After: 300
X-RateLimit-Limit: 5
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 2025-10-27T10:45:00.000Z

{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many authentication attempts...",
    "details": {
      "limit": 5,
      "windowMs": 900000,
      "retryAfter": 300,
      "resetTime": "2025-10-27T10:45:00.000Z"
    }
  }
}
```

---

### Arquitectura del Rate Limiter

```
┌─────────────────────────────────────────┐
│     RateLimitStore (In-Memory)          │
├─────────────────────────────────────────┤
│ Map<key, RateLimitEntry>                │
│                                         │
│ RateLimitEntry {                        │
│   count: number;                        │
│   resetTime: number;                    │
│   firstAttempt: number;                 │
│ }                                       │
│                                         │
│ - Auto-cleanup cada 5 minutos           │
│ - Expiración automática por ventana     │
└─────────────────────────────────────────┘

NOTA: En producción, usar Redis para
distribuir rate limiting entre instancias
```

---

## 4. ownership.middleware.ts

**Archivo:** `/src/middleware/ownership.middleware.ts`

**Propósito:** Prevenir ataques IDOR (Insecure Direct Object Reference)

**SEGURIDAD:** GAMILITSEC-004 Fix - CWE-639
**CVSS 3.1:** 7.8 (HIGH)

### `requireOwnership(paramName)`

Valida que el usuario autenticado sea el propietario del recurso.

**Ejemplo de IDOR Prevenido:**
```typescript
// ❌ SIN PROTECCIÓN (VULNERABLE)
router.get('/api/progress/user/:userId',
  authenticateJWT,
  progressController.getUserProgress
);

// Usuario A (id=111) puede acceder a datos de Usuario B (id=222):
// GET /api/progress/user/222  ← IDOR vulnerability

// ✓ CON PROTECCIÓN
router.get('/api/progress/user/:userId',
  authenticateJWT,
  requireOwnership('userId'),  // ← Valida userId === req.user.id
  progressController.getUserProgress
);

// Ahora Usuario A (id=111) intentando acceder a User B (id=222):
// GET /api/progress/user/222  ← 403 Forbidden
```

**Flujo de Validación:**
```
1. Extraer targetUserId de req.params[paramName]
2. Obtener authenticatedUserId de req.user.id
3. Comparar: targetUserId === authenticatedUserId
4. Si NO coinciden:
   - Log warning con detalles del intento
   - Retornar 403 Forbidden
5. Si coinciden:
   - Log debug de validación exitosa
   - next()
```

**Logging de Intentos IDOR:**
```typescript
log.warn(
  `IDOR attempt detected: User ${authenticatedUserId} (${email}) ` +
  `attempted to access resources of user ${targetUserId}`,
  {
    authenticatedUser: authenticatedUserId,
    targetUser: targetUserId,
    endpoint: req.path,
    method: req.method,
    ip: req.ip,
  }
);
```

---

### `requireOwnershipOrAdmin(paramName)`

Permite acceso al propietario O a super_admin.

**Uso:**
```typescript
// Estudiante puede ver su progreso
// O admin puede ver progreso de cualquier estudiante
router.get('/api/progress/user/:userId',
  authenticateJWT,
  requireOwnershipOrAdmin('userId'),
  progressController.getUserProgress
);
```

**Flujo:**
```
1. Si user.role === 'super_admin': next() ✓
2. Sino, validar ownership normal
```

---

### `requireOwnershipOrTeacher(paramName)`

Permite acceso al propietario O a teachers/admins.

**Uso:**
```typescript
// Estudiante ve su progreso
// O profesor ve progreso de sus estudiantes
router.get('/api/progress/user/:userId',
  authenticateJWT,
  requireOwnershipOrTeacher('userId'),
  progressController.getUserProgress
);
```

**IMPORTANTE:** Este middleware solo valida el rol. La validación de relación classroom-student debe hacerse en la capa de servicio.

```typescript
// En el servicio:
async getUserProgress(requesterId: string, targetUserId: string) {
  const requester = await this.getUserRole(requesterId);

  if (requester.role === 'teacher') {
    // Validar que teacher tiene acceso al estudiante
    const hasAccess = await this.teacherHasAccessToStudent(
      requesterId,
      targetUserId
    );

    if (!hasAccess) {
      throw new AppError(
        'You do not have access to this student',
        403,
        'FORBIDDEN'
      );
    }
  }

  // Continuar con lógica...
}
```

---

### `requireStudentOwnership()`

Shortcut para `requireOwnership('studentId')`.

**Uso:**
```typescript
router.delete('/api/classrooms/:classId/students/:studentId',
  authenticateJWT,
  requireStudentOwnership(),  // ← Valida studentId === req.user.id
  classroomController.removeStudent
);
```

---

## 5. permission.middleware.ts

**Archivo:** `/src/middleware/permission.middleware.ts`

**Propósito:** Autorización granular basada en permisos

### Sistema de Permisos

**Definición de Permisos por Rol:**
```typescript
const ROLE_PERMISSIONS = {
  student: [
    'read:own_profile',
    'update:own_profile',
    'read:modules',
    'submit:exercises',
    'read:own_progress',
    'read:leaderboards',
    'manage:own_friends',
    'join:guilds',
  ],

  teacher: [
    ...STUDENT_PERMISSIONS,
    'create:classrooms',
    'manage:own_classrooms',
    'read:student_progress',
    'create:assignments',
    'grade:assignments',
    'read:classroom_analytics',
  ],

  admin: [
    ...TEACHER_PERMISSIONS,
    'manage:organization',
    'manage:users',
    'read:all_analytics',
  ],

  super_admin: [
    '*:*',  // Todos los permisos
  ],
};
```

---

### `requirePermission(permission)`

Valida que el usuario tenga un permiso específico.

**Uso:**
```typescript
router.post('/api/teacher/classrooms',
  authenticateJWT,
  requirePermission('create:classrooms'),
  classroomController.createClassroom
);

router.get('/api/admin/analytics',
  authenticateJWT,
  requirePermission('read:all_analytics'),
  adminController.getAnalytics
);
```

**Respuesta si no tiene permiso:**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions",
    "details": {
      "required": "create:classrooms",
      "userRole": "student"
    }
  }
}
```

---

### `requireAnyPermission(...permissions)`

Valida que el usuario tenga AL MENOS UNO de los permisos.

**Uso:**
```typescript
// Requiere ser teacher O admin
router.get('/api/classrooms/:id/students',
  authenticateJWT,
  requireAnyPermission(
    'manage:own_classrooms',
    'manage:organization'
  ),
  classroomController.getStudents
);
```

---

### `requireAllPermissions(...permissions)`

Valida que el usuario tenga TODOS los permisos.

**Uso:**
```typescript
// Requiere múltiples permisos simultáneos
router.post('/api/admin/users/:id/promote',
  authenticateJWT,
  requireAllPermissions(
    'manage:users',
    'manage:roles',
    'read:all_analytics'
  ),
  adminController.promoteUser
);
```

---

### `requireOwnershipOrPermission(resourceGetter, adminPermission)`

Permite acceso si es propietario O tiene permiso admin.

**Uso:**
```typescript
router.put('/api/profiles/:userId',
  authenticateJWT,
  requireOwnershipOrPermission(
    (req) => req.params.userId,     // Getter del owner ID
    'manage:users'                   // Permiso admin
  ),
  profileController.updateProfile
);
```

**Flujo:**
```
1. Extraer resourceUserId con getter
2. Si req.user.id === resourceUserId: next() ✓
3. Si tiene permiso admin: next() ✓
4. Sino: 403 Forbidden
```

---

### `attachPermissions`

Adjunta permisos del usuario al request (informativo).

**Uso:**
```typescript
router.use('/api', authenticateJWT, attachPermissions);

// En controller, acceder a permisos:
export const someAction = (req: AuthRequest, res: Response) => {
  if (req.userPermissions?.includes('create:classrooms')) {
    // Usuario puede crear classrooms
  }
};
```

---

## 6. error.middleware.ts

**Archivo:** `/src/middleware/error.middleware.ts`

### `errorHandler`

Middleware global de manejo de errores. Debe ser el último en el pipeline.

**Estructura de AppError:**
```typescript
class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

**Uso en Servicios:**
```typescript
// Lanzar error personalizado
throw new AppError(
  'User not found',
  404,
  ErrorCode.NOT_FOUND
);

throw new AppError(
  'Insufficient ML Coins',
  400,
  ErrorCode.INSUFFICIENT_FUNDS
);
```

**Respuesta Formateada:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "User not found"
  }
}
```

**Manejo de Errores de PostgreSQL:**
```typescript
// Error de unique constraint
if (error.code === '23505') {
  return res.status(409).json({
    "success": false,
    "error": {
      "code": "CONFLICT",
      "message": "Resource already exists"
    }
  });
}

// Error de foreign key
if (error.code === '23503') {
  return res.status(400).json({
    "success": false,
    "error": {
      "code": "INVALID_REFERENCE",
      "message": "Referenced resource does not exist"
    }
  });
}
```

---

### `notFoundHandler`

Middleware de 404 para rutas no encontradas.

**Respuesta:**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Endpoint not found: GET /api/nonexistent"
  }
}
```

---

## 7. tenant.middleware.ts

**Archivo:** `/src/middleware/tenant.middleware.ts`

**Propósito:** Multi-tenancy - Aislar datos por organización

**Uso:**
```typescript
router.use('/api',
  authenticateJWT,
  extractTenantId  // ← Extrae tenant_id del JWT o header
);
```

**Flujo:**
```
1. Extraer tenant_id de JWT payload
2. O extraer de header X-Tenant-ID
3. Adjuntar a req.user.tenant_id
4. Usar en queries para filtrar por tenant
```

---

## 8. rls.middleware.ts

**Archivo:** `/src/middleware/rls.middleware.ts`

**Propósito:** Row Level Security - Configurar contexto de PostgreSQL RLS

**Uso:**
```typescript
import { withRLS } from '@/middleware/rls.middleware';

router.get('/api/data',
  authenticateJWT,
  withRLS,  // ← Configura RLS para este request
  dataController.getData
);
```

**Configuración de RLS en PostgreSQL:**
```sql
-- Configura variables de sesión para RLS
SET LOCAL app.user_id = 'user-uuid';
SET LOCAL app.tenant_id = 'tenant-uuid';
SET LOCAL app.user_role = 'student';
```

**Uso en Policies:**
```sql
CREATE POLICY "Users see own data"
  ON user_data
  FOR SELECT
  USING (
    user_id = current_setting('app.user_id')::UUID
  );
```

---

## Esquemas de Validación

### Ejemplo: auth.validation.ts

```typescript
import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Email must be valid',
      'any.required': 'Email is required',
    }),

  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain uppercase, lowercase, and number',
      'any.required': 'Password is required',
    }),

  role: Joi.string()
    .valid('student', 'teacher')
    .default('student'),

  firstName: Joi.string()
    .min(2)
    .max(50)
    .optional(),

  lastName: Joi.string()
    .min(2)
    .max(50)
    .optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});
```

### Validaciones Comunes

**UUID:**
```typescript
const uuidSchema = Joi.string()
  .uuid({ version: 'uuidv4' })
  .required();
```

**Paginación:**
```typescript
const paginationSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(20),
  offset: Joi.number().integer().min(0).default(0),
});
```

**Fechas:**
```typescript
const dateRangeSchema = Joi.object({
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
});
```

---

## Buenas Prácticas de Seguridad

### 1. Aplicar Middlewares en Orden Correcto

```typescript
// ✓ Orden correcto
router.post('/api/resource',
  authRateLimiter,           // 1. Rate limiting primero
  authenticateJWT,           // 2. Autenticación
  requireRole('admin'),      // 3. Autorización por rol
  requirePermission('perm'), // 4. Autorización por permiso
  validate(schema),          // 5. Validación de datos
  controller.action          // 6. Controller
);

// ❌ Orden incorrecto (validación antes de auth)
router.post('/api/resource',
  validate(schema),          // ← Desperdicia CPU validando requests no autenticados
  authenticateJWT,
  controller.action
);
```

---

### 2. Usar requireOwnership en Endpoints de Usuario

```typescript
// ❌ VULNERABLE A IDOR
router.get('/api/users/:userId/data',
  authenticateJWT,
  dataController.getData
);

// ✓ PROTEGIDO
router.get('/api/users/:userId/data',
  authenticateJWT,
  requireOwnership('userId'),
  dataController.getData
);
```

---

### 3. Combinar Rate Limiters

```typescript
// Aplicar rate limiting general + específico
app.use('/api', generalApiRateLimiter);  // Global

router.post('/api/auth/login',
  authRateLimiter,  // Más restrictivo para auth
  validate(loginSchema),
  authController.login
);
```

---

### 4. Validar TODOS los Inputs

```typescript
// ✓ Validar body, params Y query
router.get('/api/users/:id/posts',
  authenticateJWT,
  validateParams(userIdSchema),  // ← params
  validateQuery(paginationSchema),  // ← query
  controller.getUserPosts
);
```

---

### 5. No Exponer Información Sensible en Errores

```typescript
// ❌ MAL - Expone existencia de email
if (!user) {
  throw new AppError('User with email X not found', 404, 'NOT_FOUND');
}

// ✓ BIEN - Mensaje genérico
if (!user || !isPasswordValid) {
  throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
}
```

---

### 6. Logging de Seguridad

```typescript
// Log intentos sospechosos
log.warn('IDOR attempt detected', {
  authenticatedUser: req.user.id,
  targetResource: resourceId,
  ip: req.ip,
  endpoint: req.path,
});

// Log acciones sensibles
log.info('User role changed', {
  adminId: req.user.id,
  targetUserId: userId,
  oldRole: 'student',
  newRole: 'teacher',
});
```

---

### 7. HTTPS en Producción

```typescript
// Forzar HTTPS en producción
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

---

## Diagrama de Seguridad en Capas

```
┌─────────────────────────────────────────────────────┐
│ Capa 1: Network Security                           │
│ - HTTPS/TLS                                         │
│ - Firewall rules                                    │
│ - DDoS protection                                   │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ Capa 2: HTTP Security (helmet)                     │
│ - Content Security Policy                           │
│ - X-Frame-Options: DENY                             │
│ - X-Content-Type-Options: nosniff                   │
│ - HSTS                                              │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ Capa 3: Rate Limiting                              │
│ - Previene brute force                              │
│ - Previene DDoS                                     │
│ - Limita abuse                                      │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ Capa 4: Authentication (JWT)                       │
│ - Verifica identidad                                │
│ - Valida token válido                               │
│ - Valida cuenta activa                              │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ Capa 5: Authorization                              │
│ - Roles (requireRole)                               │
│ - Permisos (requirePermission)                      │
│ - Ownership (requireOwnership) ← Anti-IDOR          │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ Capa 6: Input Validation                           │
│ - Joi schemas                                       │
│ - Type checking                                     │
│ - Sanitization                                      │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ Capa 7: Business Logic                            │
│ - Service layer validations                         │
│ - Business rules                                    │
│ - Data integrity checks                             │
└──────────────────┬──────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────┐
│ Capa 8: Data Layer (PostgreSQL RLS)               │
│ - Row Level Security                                │
│ - SQL injection prevention (parametrized queries)   │
│ - Tenant isolation                                  │
└─────────────────────────────────────────────────────┘
```

---

## Checklist de Seguridad

**Para cada endpoint nuevo:**

- [ ] Requiere autenticación? → `authenticateJWT`
- [ ] Requiere rol específico? → `requireRole(...)`
- [ ] Requiere permisos? → `requirePermission(...)`
- [ ] Accede a datos de usuario? → `requireOwnership(...)`
- [ ] Es sensible a abuse? → Rate limiter apropiado
- [ ] Valida inputs? → `validate(schema)`
- [ ] Logs de seguridad? → `log.warn(...)` para intentos sospechosos
- [ ] Manejo de errores? → No expone info sensible
- [ ] Tests de seguridad? → Tests de IDOR, auth bypass, etc.

---

## Próximos Documentos

- `API-ENDPOINTS.md` - Documentación completa de endpoints
- `WEBSOCKET-REALTIME.md` - WebSocket y tiempo real
- `CRON-JOBS.md` - Tareas programadas
