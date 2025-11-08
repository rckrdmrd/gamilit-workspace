# Auth API

**Proyecto:** Gamilit Platform
**Módulo:** API Reference
**Categoría:** Authentication
**Archivo original:** API-REFERENCE.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Endpoints

### POST /api/auth/register
Registrar nuevo usuario

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "student"
}
```

**Response: 201 Created**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "...", "role": "student" },
    "token": "jwt_token",
    "refreshToken": "refresh_token",
    "expiresIn": "7d"
  }
}
```

---

### POST /api/auth/login
Autenticar usuario

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "email": "...", "role": "student" },
    "token": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

---

### GET /api/auth/me
Obtener usuario autenticado

**Headers:** `Authorization: Bearer <token>`

**Response: 200 OK**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "John Doe",
      "role": "student",
      "avatarUrl": "https://..."
    },
    "stats": {
      "mlCoins": 150,
      "totalXP": 320,
      "currentRank": "batab"
    }
  }
}
```

---

### Otros Endpoints

- `POST /api/auth/logout` - Cerrar sesión
- `POST /api/auth/refresh` - Refrescar token
- `PUT /api/auth/password` - Cambiar contraseña
- `POST /api/auth/forgot-password` - Recuperar contraseña
- `GET /api/auth/sessions` - Listar sesiones activas

---

## Rate Limiting

- **Auth endpoints:** 5 requests / 15 min

---

**Última actualización:** 2025-11-01
