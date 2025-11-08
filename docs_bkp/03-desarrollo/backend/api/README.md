# API Endpoints - Índice

**Proyecto:** GAMILIT
**Versión:** 1.0.0
**Última Actualización:** 2025-11-01

---

## Información General

**Base URL:** `http://localhost:3006/api`
**Formato:** JSON
**Autenticación:** Bearer JWT Token
**Total Endpoints:** 177+

---

## Estructura de API

Este directorio contiene la documentación completa de todos los endpoints de la API REST de GAMILIT, organizados por área funcional.

---

## Endpoints Disponibles

### 1. API de Autenticación
**Archivo:** [API-Auth.md](./API-Auth.md)

Endpoints de autenticación y gestión de sesiones:
- Registro y login
- Refresh tokens
- Gestión de sesiones
- Recuperación de contraseña

**Total:** 13 endpoints
**Líneas:** ~300

---

### 2. API Educativa
**Archivo:** [API-Educational.md](./API-Educational.md)

Endpoints de contenido educativo:
- Módulos educativos
- Lecciones y ejercicios
- Envío de respuestas
- Progreso de aprendizaje

**Total:** 40+ endpoints
**Líneas:** ~400

---

### 3. API de Gamificación
**Archivo:** [API-Gamification.md](./API-Gamification.md)

Endpoints del sistema de gamificación:
- Estadísticas y ML Coins
- Logros y misiones
- Leaderboards
- Transacciones

**Total:** 25+ endpoints
**Líneas:** ~300

---

### 4. API de Administración
**Archivo:** [API-Admin.md](./API-Admin.md)

Endpoints administrativos (super_admin):
- Gestión de usuarios
- Configuración del sistema
- Analytics y reportes
- Moderación

**Total:** 30+ endpoints
**Líneas:** ~280

---

## Formato de Respuesta Estándar

### Success Response
```json
{
  "success": true,
  "data": {
    // ... datos específicos del endpoint
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}  // Opcional
  }
}
```

---

## Códigos HTTP Estándar

| Código | Significado | Uso |
|--------|-------------|-----|
| 200 | OK | Operación exitosa |
| 201 | Created | Recurso creado |
| 204 | No Content | Operación exitosa sin contenido |
| 400 | Bad Request | Datos inválidos |
| 401 | Unauthorized | No autenticado |
| 403 | Forbidden | Sin permisos |
| 404 | Not Found | Recurso no existe |
| 409 | Conflict | Conflicto (ej: email duplicado) |
| 429 | Too Many Requests | Rate limit excedido |
| 500 | Internal Server Error | Error del servidor |

---

## Headers Requeridos

### Autenticación
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Content-Type
```
Content-Type: application/json
```

---

## Rate Limiting

### Límites por Endpoint

| Tipo de Endpoint | Límite | Ventana |
|------------------|--------|---------|
| Auth (login/register) | 5 requests | 15 minutos |
| Password reset | 1 request | 1 hora |
| General API | 100 requests | 15 minutos |
| Leaderboards | 30 requests | 1 minuto |
| File upload | 10 requests | 1 hora |

### Headers de Rate Limit
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 2025-10-27T11:00:00.000Z
```

---

## Navegación Rápida

### Por Rol de Usuario

| Rol | Endpoints Accesibles | Archivos |
|-----|---------------------|----------|
| **student** | Auth, Educational, Gamification | [Auth](./API-Auth.md), [Educational](./API-Educational.md), [Gamification](./API-Gamification.md) |
| **teacher** | + Teacher, Classroom | [Educational](./API-Educational.md) |
| **admin** | + Admin (parcial) | [Admin](./API-Admin.md) |
| **super_admin** | Todos | Todos |

---

## Curl Examples

### Register
```bash
curl -X POST http://localhost:3006/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "SecurePass123",
    "role": "student"
  }'
```

### Login
```bash
curl -X POST http://localhost:3006/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "SecurePass123"
  }'
```

### Authenticated Request
```bash
curl -X GET http://localhost:3006/api/gamification/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Endpoints por Categoría

### Autenticación (13)
- POST `/auth/register`
- POST `/auth/login`
- POST `/auth/refresh`
- GET `/auth/me`
- PUT `/auth/password`
- POST `/auth/logout`
- POST `/auth/forgot-password`
- POST `/auth/reset-password`
- GET `/auth/sessions`
- DELETE `/auth/sessions/:id`
- DELETE `/auth/sessions/all`

### Gamificación (25+)
- GET `/gamification/stats`
- POST `/gamification/coins/add`
- GET `/gamification/coins/transactions`
- GET `/gamification/achievements`
- GET `/gamification/achievements/user`
- GET `/gamification/missions`
- POST `/gamification/missions/:id/progress`
- POST `/gamification/missions/:id/claim`
- GET `/gamification/leaderboards/:type`
- ...más

### Educación (40+)
- GET `/educational/modules`
- GET `/educational/modules/:id`
- GET `/educational/exercises`
- GET `/educational/exercises/:id`
- POST `/educational/exercises/:id/submit`
- GET `/educational/progress`
- ...más

### Administración (30+)
- GET `/admin/users`
- POST `/admin/users`
- PUT `/admin/users/:id`
- DELETE `/admin/users/:id`
- GET `/admin/analytics`
- ...más

---

## Testing con Postman

Colección de Postman disponible en:
```
/docs/postman/GAMILIT-API.postman_collection.json
```

**Incluye:**
- Todas las rutas documentadas
- Variables de entorno
- Tests de respuesta
- Ejemplos de datos

---

## Documentos Relacionados

- [Servicios](../servicios/README.md) - Lógica de negocio
- [Middleware](../middleware/README.md) - Seguridad y validación
- [WebSocket](../WEBSOCKET-REALTIME.md) - Comunicación en tiempo real

---

## Contribuir

Al documentar nuevos endpoints:
1. Seguir estructura estándar
2. Incluir ejemplos de request/response
3. Documentar todos los códigos de error
4. Especificar autenticación requerida
5. Añadir rate limiting si aplica
6. Actualizar este README

---

**Última revisión:** 2025-11-01
