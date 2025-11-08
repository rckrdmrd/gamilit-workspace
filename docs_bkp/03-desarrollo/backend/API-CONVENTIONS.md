# Convenciones de API

**Código que mapea:** `apps/backend/src/modules/*/controllers/`
**Última actualización:** 2025-11-07

---

## 📋 Propósito

Convenciones para diseñar endpoints API REST del backend.

---

## 🌐 Estructura de URLs

### Patrón Base

```
/api/v1/{resource}/{id?}/{sub-resource?}
```

### Ejemplos

```
GET    /api/v1/users
GET    /api/v1/users/:id
POST   /api/v1/users
PUT    /api/v1/users/:id
DELETE /api/v1/users/:id

GET    /api/v1/users/:id/assignments
POST   /api/v1/assignments/:id/submit
```

---

## 📐 Verbos HTTP

| Verbo | Acción | Ejemplo |
|-------|--------|---------|
| **GET** | Obtener recurso(s) | GET /users |
| **POST** | Crear recurso | POST /users |
| **PUT** | Actualizar completo | PUT /users/:id |
| **PATCH** | Actualizar parcial | PATCH /users/:id |
| **DELETE** | Eliminar recurso | DELETE /users/:id |

---

## 📊 Respuestas Estándar

### Success (200 OK)

```json
{
  "data": { },
  "meta": {
    "timestamp": "2025-11-07T10:00:00Z",
    "requestId": "uuid"
  }
}
```

### Success con paginación (200 OK)

```json
{
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### Error (4xx, 5xx)

```json
{
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "Usuario no encontrado",
    "details": {}
  },
  "meta": {
    "timestamp": "2025-11-07T10:00:00Z",
    "requestId": "uuid"
  }
}
```

---

## 🔐 Autenticación

### JWT Bearer Token

```
Authorization: Bearer {jwt_token}
```

### Endpoints públicos

Usar decorador `@Public()`:

```typescript
@Public()
@Get('health')
healthCheck() {
  return { status: 'ok' };
}
```

---

## 🛡️ Autorización

### Roles

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin_teacher', 'super_admin')
@Get('admin-data')
```

---

## 📚 Documentación de API

**API Reference completo:** [docs/02-especificaciones-tecnicas/apis/API-REFERENCE.md](../../02-especificaciones-tecnicas/apis/API-REFERENCE.md)

**Total endpoints:** ~340+

---

**Última actualización:** 2025-11-07
