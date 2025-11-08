# Middleware de Autenticación

**Proyecto:** GAMILIT
**RFC:** RFC-0001
**Versión:** 1.0.0
**Última Actualización:** 2025-11-01

---

## Archivo

**Ubicación:** `/src/middleware/auth.middleware.ts`

---

## Índice

1. [authenticateJWT](#authenticatejwt)
2. [requireRole](#requirerole)
3. [optionalAuth](#optionalauth)
4. [requireOwnership](#requireownership)
5. [requireOwnershipOrAdmin](#requireownershiporadmin)

---

## authenticateJWT

Middleware principal de autenticación. Valida JWT y estado de cuenta.

### Flujo de Autenticación

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

### Ejemplo de Uso

```typescript
import { authenticateJWT } from '@/middleware/auth.middleware';

// Proteger ruta
router.get('/api/gamification/stats',
  authenticateJWT,  // ← Requiere autenticación
  gamificationController.getUserStats
);
```

### Estados de Cuenta Validados

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

### Request Enriquecido

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

### Códigos de Error

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

## requireRole

Middleware de autorización por rol. Valida que el usuario tenga uno de los roles permitidos.

### Ejemplo de Uso

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

### Jerarquía de Roles

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

## optionalAuth

Middleware de autenticación opcional. No bloquea si no hay token.

### Uso

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

## requireOwnership

Middleware de autorización de ownership. Previene ataques IDOR (Insecure Direct Object Reference).

**SEGURIDAD:** GAMILITSEC-004 Fix - CWE-639
**CVSS 3.1:** 7.8 (HIGH)

### Ejemplo de IDOR Prevenido

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

### Flujo de Validación

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

### Logging de Intentos IDOR

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

## requireOwnershipOrAdmin

Permite acceso al propietario O a super_admin.

### Uso

```typescript
// Estudiante puede ver su progreso
// O admin puede ver progreso de cualquier estudiante
router.get('/api/progress/user/:userId',
  authenticateJWT,
  requireOwnershipOrAdmin('userId'),
  progressController.getUserProgress
);
```

### Flujo

```
1. Si user.role === 'super_admin': next() ✓
2. Sino, validar ownership normal
```

---

## Ejemplos Completos

### Endpoint Básico Protegido

```typescript
router.get('/api/auth/me',
  authenticateJWT,
  authController.getProfile
);
```

### Endpoint con Rol Específico

```typescript
router.post('/api/admin/users',
  authenticateJWT,
  requireRole('super_admin'),
  adminController.createUser
);
```

### Endpoint con Ownership

```typescript
router.get('/api/users/:userId/stats',
  authenticateJWT,
  requireOwnership('userId'),
  statsController.getUserStats
);
```

### Endpoint Combinado

```typescript
router.put('/api/users/:userId/profile',
  authenticateJWT,
  requireOwnershipOrAdmin('userId'),
  validate(updateProfileSchema),
  profileController.updateProfile
);
```

---

## Seguridad Anti-IDOR

### ¿Qué es IDOR?

IDOR (Insecure Direct Object Reference) ocurre cuando un atacante puede acceder a recursos de otros usuarios simplemente cambiando un ID en la URL.

### Ejemplo de Ataque

```bash
# Usuario malicioso (ID: 111) accede a sus datos
GET /api/progress/user/111  ← OK

# Cambia el ID en la URL
GET /api/progress/user/222  ← Si no hay protección, accede a datos de otro usuario
```

### Solución

```typescript
// Siempre usar requireOwnership para recursos de usuario
router.get('/api/progress/user/:userId',
  authenticateJWT,
  requireOwnership('userId'),  // ← Bloquea IDOR
  progressController.getUserProgress
);
```

---

## Documentos Relacionados

> **Implementa requerimientos:**
> - [RNF-SEC-001 - Autenticación JWT](../../../01-requerimientos/requerimientos-no-funcionales/RNF-SEC-001-autenticacion-jwt.md)
> - [RNF-SEC-003 - RBAC](../../../01-requerimientos/requerimientos-no-funcionales/RNF-SEC-003-rbac.md)

**Especificaciones técnicas:**
- [Sistema de Seguridad](../../../02-especificaciones-tecnicas/seguridad/SISTEMA-SEGURIDAD.md) - Defense in depth
- [ET-AUTH-001 - RBAC](../../../02-especificaciones-tecnicas/01-autenticacion-autorizacion/ET-AUTH-001-rbac.md)
- [ADR-002 - JWT Security](../../../02-especificaciones-tecnicas/adr/ADR-002-jwt-security-implementation.md)

**Desarrollo:**
- [AuthService](../servicios/Servicios-Autenticacion.md) - Lógica de autenticación
- [API Auth](../api/API-Auth.md) - Endpoints de autenticación
- [README de Middleware](./README.md) - Índice de middlewares

---

**Última revisión:** 2025-11-01
