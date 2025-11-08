# Servicios de Autenticación

**Proyecto:** GAMILIT
**RFC:** RFC-0001
**Versión:** 1.0.0
**Última Actualización:** 2025-11-01

---

## Índice

1. [AuthService](#1-authservice)
2. [SessionManagementService](#2-sessionmanagementservice)
3. [SecurityService](#3-securityservice)

---

## 1. AuthService

**Archivo:** `/src/modules/auth/auth.service.ts`

**Responsabilidad:** Gestión completa de autenticación y autorización

### Métodos Principales

#### `register(registerDto: RegisterDto): Promise<AuthResponse>`

Registra un nuevo usuario en el sistema.

**Flujo:**
```
1. Validar email no existe
2. Validar fuerza de contraseña
3. Hash contraseña (bcrypt, 10 rounds)
4. Crear usuario en DB (email_verified=true por defecto)
5. Generar access token + refresh token
6. Retornar respuesta con tokens
```

**Ejemplo de Uso:**
```typescript
const authService = new AuthService(authRepository, sessionService);

const response = await authService.register({
  email: 'student@example.com',
  password: 'SecurePass123',
  role: 'student',
  firstName: 'John',
  lastName: 'Doe'
});

// Respuesta:
{
  user: {
    id: 'uuid',
    email: 'student@example.com',
    role: 'student',
    firstName: 'John',
    lastName: 'Doe',
    displayName: 'John'
  },
  token: 'eyJhbGciOiJIUzI1NiIs...',
  refreshToken: 'eyJhbGciOiJIUzI1NiIs...',
  expiresIn: '7d'
}
```

**Validaciones:**
- Email único (código: `EMAIL_EXISTS`)
- Contraseña fuerte: min 8 caracteres, 1 mayúscula, 1 minúscula, 1 número
- Rol válido: `student`, `teacher`, `admin`, `super_admin`

**NOTA IMPORTANTE:** La verificación de email está DESHABILITADA. Los usuarios son activados inmediatamente.

---

#### `login(loginDto: LoginDto, userAgent?, ipAddress?): Promise<AuthResponse>`

Autentica usuario existente.

**Flujo:**
```
1. Buscar usuario por email
2. Verificar usuario no eliminado (deleted_at IS NULL)
3. Comparar contraseña (bcrypt.compare)
4. Validar estado de cuenta (status != 'inactive', 'suspended', 'pending')
5. Actualizar last_sign_in timestamp
6. Generar tokens
7. Crear sesión (opcional, si SessionManagementService disponible)
8. Retornar respuesta con tokens
```

**Ejemplo de Uso:**
```typescript
const response = await authService.login(
  { email: 'student@example.com', password: 'SecurePass123' },
  'Mozilla/5.0...',
  '192.168.1.100'
);

// Respuesta idéntica a register()
```

**Estados de Cuenta:**
- `active` - Puede acceder
- `inactive` - Bloqueado (retorna 401)
- `suspended` - Suspendido temporalmente (retorna 403)
- `pending` - Pendiente de activación (retorna 403)

**Códigos de Error:**
- `INVALID_CREDENTIALS` - Credenciales incorrectas
- `ACCOUNT_INACTIVE` - Cuenta desactivada
- `ACCOUNT_SUSPENDED` - Cuenta suspendida

---

#### `refreshToken(refreshToken: string): Promise<{token: string, expiresIn: string}>`

Renueva access token usando refresh token.

**Flujo:**
```
1. Verificar refresh token (JWT)
2. Validar type === 'refresh'
3. Buscar usuario en DB
4. Validar estado de cuenta
5. Generar nuevo access token
6. Retornar nuevo token
```

**Ejemplo de Uso:**
```typescript
const result = await authService.refreshToken(refreshToken);

// Respuesta:
{
  token: 'eyJhbGciOiJIUzI1NiIs...',
  expiresIn: '7d'
}
```

---

#### `getUserProfile(userId: string): Promise<UserProfile>`

Obtiene perfil completo del usuario.

**Ejemplo de Uso:**
```typescript
const profile = await authService.getUserProfile(userId);

// Respuesta:
{
  id: 'uuid',
  email: 'student@example.com',
  role: 'student',
  firstName: 'John',
  lastName: 'Doe',
  displayName: 'John Doe',
  avatarUrl: 'https://...',
  createdAt: '2024-01-01T00:00:00Z'
}
```

---

#### `updatePassword(userId, currentPassword, newPassword): Promise<void>`

Actualiza contraseña del usuario.

**Flujo:**
```
1. Verificar usuario existe
2. Validar contraseña actual
3. Validar fuerza de nueva contraseña
4. Hash nueva contraseña
5. Actualizar en DB
6. Log de auditoría
```

---

### Métodos Privados

#### `generateAccessToken(user): string`

Genera JWT access token.

**Payload:**
```typescript
{
  sub: userId,        // Subject (user ID)
  email: userEmail,
  role: userRole,
  iat: timestamp,     // Issued at
  exp: timestamp,     // Expiration
  iss: 'glit-api',   // Issuer
  aud: 'glit-app'    // Audience
}
```

**Configuración:**
- Algoritmo: HS256
- Expiración: 7 días (configurable)
- Secret: `process.env.JWT_SECRET`

---

#### `generateRefreshToken(user): string`

Genera JWT refresh token.

**Payload:**
```typescript
{
  sub: userId,
  type: 'refresh',
  iat: timestamp,
  exp: timestamp,     // 30 días
  iss: 'glit-api'
}
```

---

#### `isPasswordStrong(password: string): boolean`

Valida fuerza de contraseña.

**Regex:**
```javascript
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
```

**Requisitos:**
- Mínimo 8 caracteres
- Al menos 1 mayúscula
- Al menos 1 minúscula
- Al menos 1 número

---

## 2. SessionManagementService

**Archivo:** `/src/modules/auth/session-management.service.ts`

**Responsabilidad:** Gestión de sesiones de usuario

### Métodos Principales

#### `createSession(userId, accessToken, refreshToken, userAgent, ipAddress): Promise<Session>`

Crea nueva sesión.

**Almacena:**
- Token hash (SHA-256)
- User agent
- IP address
- Timestamp de creación
- Timestamp de expiración

---

#### `getActiveSessions(userId): Promise<Session[]>`

Obtiene sesiones activas del usuario.

**Ejemplo:**
```typescript
const sessions = await sessionService.getActiveSessions(userId);

// Respuesta:
[
  {
    id: 'uuid',
    userId: 'uuid',
    userAgent: 'Mozilla/5.0...',
    ipAddress: '192.168.1.100',
    createdAt: '2025-10-27T08:00:00Z',
    expiresAt: '2025-11-03T08:00:00Z',
    isActive: true,
    isCurrent: true  // Sesión actual
  },
  {
    id: 'uuid',
    userId: 'uuid',
    userAgent: 'Mobile App',
    ipAddress: '192.168.1.50',
    createdAt: '2025-10-26T10:00:00Z',
    expiresAt: '2025-11-02T10:00:00Z',
    isActive: true,
    isCurrent: false
  }
]
```

---

#### `revokeSession(userId, sessionId): Promise<void>`

Revoca sesión específica.

**Efecto:**
- Marca sesión como inactiva
- Token ya no válido en siguientes requests
- Usuario debe hacer login nuevamente en ese dispositivo

---

#### `revokeAllSessions(userId, exceptSessionId?): Promise<number>`

Revoca todas las sesiones excepto la actual.

**Uso:** "Cerrar sesión en todos los dispositivos"

**Retorna:** Número de sesiones revocadas

---

## 3. SecurityService

**Archivo:** `/src/modules/auth/security.service.ts`

**Responsabilidad:** Logs de seguridad y auditoría

### Métodos Principales

#### `logSecurityEvent(eventData): Promise<void>`

Registra evento de seguridad.

**Tipos de Eventos:**
```typescript
type SecurityEventType =
  | 'login_success'
  | 'login_failed'
  | 'password_change'
  | 'password_reset'
  | 'account_suspended'
  | 'session_revoked'
  | 'suspicious_activity';
```

**Ejemplo:**
```typescript
await securityService.logSecurityEvent({
  userId: 'uuid',
  eventType: 'login_failed',
  ipAddress: '192.168.1.100',
  userAgent: 'Mozilla/5.0...',
  details: { reason: 'invalid_password', attempts: 3 }
});
```

---

#### `getSecurityLogs(userId, filters): Promise<SecurityLog[]>`

Obtiene logs de seguridad del usuario.

**Filtros:**
```typescript
{
  eventType?: SecurityEventType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}
```

---

#### `detectSuspiciousActivity(userId): Promise<boolean>`

Detecta actividad sospechosa.

**Detecta:**
- Múltiples intentos de login fallidos
- Logins desde IPs diferentes en corto tiempo
- Cambios frecuentes de contraseña
- Acceso desde ubicaciones inusuales

---

## Diagrama de Flujo de Autenticación

```
┌───────────────┐
│   Register    │
└───────┬───────┘
        │
        ↓
┌────────────────────┐
│  Validate Email    │
│  Validate Password │
└────────┬───────────┘
         │
         ↓
┌────────────────────┐
│  Hash Password     │
│  (bcrypt, 10)      │
└────────┬───────────┘
         │
         ↓
┌────────────────────┐
│  Create User in DB │
└────────┬───────────┘
         │
         ↓
┌────────────────────┐
│  Generate Tokens   │
│  - Access Token    │
│  - Refresh Token   │
└────────┬───────────┘
         │
         ↓
┌────────────────────┐
│  Create Session    │
│  (if enabled)      │
└────────┬───────────┘
         │
         ↓
┌────────────────────┐
│  Return Auth       │
│  Response          │
└────────────────────┘
```

---

## Documentos Relacionados

> **Implementa requerimientos:**
> - [UC-STU-001 - Registro de Usuario](../../../01-requerimientos/casos-uso/student/UC-STU-001-registro.md)
> - [UC-STU-002 - Login](../../../01-requerimientos/casos-uso/student/UC-STU-002-login.md)
> - [RNF-SEC-001 - Autenticación JWT](../../../01-requerimientos/requerimientos-no-funcionales/RNF-SEC-001-autenticacion-jwt.md)

**Especificaciones técnicas:**
- [Sistema de Seguridad](../../../02-especificaciones-tecnicas/seguridad/SISTEMA-SEGURIDAD.md) - Arquitectura de seguridad
- [ADR-002 - JWT Security Implementation](../../../02-especificaciones-tecnicas/adr/ADR-002-jwt-security-implementation.md)
- [TYPES-AUTH](../../../02-especificaciones-tecnicas/tipos-compartidos/TYPES-AUTH.md) - Tipos de autenticación

**Desarrollo:**
- [API Auth Endpoints](../api/API-Auth.md) - Endpoints de autenticación
- [Middleware de Autenticación](../middleware/Middleware-Autenticacion.md) - JWT middleware
- [README de Servicios](./README.md) - Índice de servicios

---

**Última revisión:** 2025-11-01
