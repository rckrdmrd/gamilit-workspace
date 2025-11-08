# API de Autenticación

**Proyecto:** GAMILIT
**RFC:** RFC-0001
**Versión:** 1.0.0
**Última Actualización:** 2025-11-01

---

## Información General

**Base:** `/api/auth`
**Total Endpoints:** 13
**Rate Limit:** Variable por endpoint

---

## Índice de Endpoints

1. [POST /register](#post-register) - Registrar usuario
2. [POST /login](#post-login) - Autenticar usuario
3. [POST /refresh](#post-refresh) - Renovar token
4. [GET /me](#get-me) - Perfil del usuario
5. [PUT /password](#put-password) - Cambiar contraseña
6. [POST /logout](#post-logout) - Cerrar sesión
7. [POST /forgot-password](#post-forgot-password) - Solicitar reset
8. [POST /reset-password](#post-reset-password) - Resetear contraseña
9. [GET /sessions](#get-sessions) - Listar sesiones
10. [DELETE /sessions/:id](#delete-sessionsid) - Revocar sesión
11. [DELETE /sessions/all](#delete-sessionsall) - Revocar todas

---

## POST /register

Registra nuevo usuario en el sistema.

**Autenticación:** No requerida
**Rate Limit:** 5 requests / 15 minutos

### Request Body
```json
{
  "email": "student@example.com",
  "password": "SecurePass123",
  "role": "student",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Response 201
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "student@example.com",
      "role": "student",
      "firstName": "John",
      "lastName": "Doe",
      "displayName": "John"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "7d"
  }
}
```

### Errores
- `409` - `EMAIL_EXISTS`: Email ya registrado
- `400` - `WEAK_PASSWORD`: Contraseña no cumple requisitos
- `400` - `VALIDATION_ERROR`: Datos inválidos

### Validaciones
- Email único
- Contraseña: min 8 caracteres, 1 mayúscula, 1 minúscula, 1 número
- Rol válido: `student`, `teacher`, `admin`, `super_admin`

### Ejemplo cURL
```bash
curl -X POST http://localhost:3006/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "SecurePass123",
    "role": "student",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

---

## POST /login

Autentica usuario existente.

**Autenticación:** No requerida
**Rate Limit:** 5 requests / 15 minutos

### Request Body
```json
{
  "email": "student@example.com",
  "password": "SecurePass123"
}
```

### Response 200
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "student@example.com",
      "role": "student",
      "firstName": "John",
      "lastName": "Doe",
      "displayName": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "7d"
  }
}
```

### Errores
- `401` - `INVALID_CREDENTIALS`: Credenciales incorrectas
- `401` - `ACCOUNT_INACTIVE`: Cuenta desactivada
- `403` - `ACCOUNT_SUSPENDED`: Cuenta suspendida

### Ejemplo cURL
```bash
curl -X POST http://localhost:3006/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "SecurePass123"
  }'
```

---

## POST /refresh

Renueva access token usando refresh token.

**Autenticación:** No requerida (usa refresh token)

### Request Body
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Response 200
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "7d"
  }
}
```

### Errores
- `401` - `INVALID_TOKEN`: Token inválido
- `401` - `TOKEN_EXPIRED`: Refresh token expirado

---

## GET /me

Obtiene perfil del usuario autenticado.

**Autenticación:** Requerida

### Response 200
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "student@example.com",
    "role": "student",
    "firstName": "John",
    "lastName": "Doe",
    "displayName": "John Doe",
    "avatarUrl": "https://...",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Ejemplo cURL
```bash
curl -X GET http://localhost:3006/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## PUT /password

Actualiza contraseña del usuario.

**Autenticación:** Requerida

### Request Body
```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewSecurePass456"
}
```

### Response 200
```json
{
  "success": true,
  "data": {
    "message": "Password updated successfully"
  }
}
```

### Errores
- `401` - `INVALID_PASSWORD`: Contraseña actual incorrecta
- `400` - `WEAK_PASSWORD`: Nueva contraseña no cumple requisitos

---

## POST /logout

Cierra sesión del usuario.

**Autenticación:** Requerida

### Response 200
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

## POST /forgot-password

Solicita recuperación de contraseña.

**Autenticación:** No requerida
**Rate Limit:** 1 request / hora

### Request Body
```json
{
  "email": "student@example.com"
}
```

### Response 200
```json
{
  "success": true,
  "data": {
    "message": "Password reset email sent"
  }
}
```

---

## POST /reset-password

Restablece contraseña con token.

**Autenticación:** No requerida

### Request Body
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass456"
}
```

### Response 200
```json
{
  "success": true,
  "data": {
    "message": "Password reset successfully"
  }
}
```

---

## GET /sessions

Obtiene sesiones activas del usuario.

**Autenticación:** Requerida

### Response 200
```json
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "uuid",
        "userAgent": "Mozilla/5.0...",
        "ipAddress": "192.168.1.100",
        "createdAt": "2025-10-27T08:00:00Z",
        "expiresAt": "2025-11-03T08:00:00Z",
        "isCurrent": true
      },
      {
        "id": "uuid",
        "userAgent": "Mobile App",
        "ipAddress": "192.168.1.50",
        "createdAt": "2025-10-26T10:00:00Z",
        "expiresAt": "2025-11-02T10:00:00Z",
        "isCurrent": false
      }
    ]
  }
}
```

---

## DELETE /sessions/:id

Revoca sesión específica.

**Autenticación:** Requerida

### Response 200
```json
{
  "success": true,
  "data": {
    "message": "Session revoked successfully"
  }
}
```

---

## DELETE /sessions/all

Revoca todas las sesiones excepto la actual.

**Autenticación:** Requerida

### Response 200
```json
{
  "success": true,
  "data": {
    "message": "All sessions revoked",
    "count": 3
  }
}
```

---

## Estados de Cuenta

| Estado | Código | Descripción |
|--------|--------|-------------|
| `active` | 200 | Usuario puede acceder |
| `inactive` | 401 | Cuenta desactivada |
| `suspended` | 403 | Suspensión temporal |
| `pending` | 403 | Pendiente de activación |

---

## Documentos Relacionados

- [AuthService](../servicios/Servicios-Autenticacion.md) - Lógica de negocio
- [Middleware de Auth](../middleware/Middleware-Autenticacion.md) - JWT middleware
- [README de API](./README.md) - Índice de endpoints

---

**Última revisión:** 2025-11-01
