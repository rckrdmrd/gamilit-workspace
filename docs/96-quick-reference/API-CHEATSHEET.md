# API Cheatsheet - GAMILIT Platform

**Versión:** 1.0
**Última actualización:** 2025-11-07
**Base URL:** `http://localhost:3000/api/v1`
**Formato:** JSON

> **Nota:** Este es un cheatsheet rápido. Para documentación completa ver [docs/03-desarrollo/backend/API-ENDPOINTS.md](../03-desarrollo/backend/API-ENDPOINTS.md)

---

## 🔑 Autenticación

Todos los endpoints (excepto `/auth/register` y `/auth/login`) requieren Bearer token:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Obtener token:** Usa `/auth/login` o `/auth/register`

---

## 📋 Quick Reference

### Códigos de Estado

| Código | Significado | Cuándo |
|--------|-------------|--------|
| `200` | OK | Operación exitosa |
| `201` | Created | Recurso creado |
| `400` | Bad Request | Validación falló |
| `401` | Unauthorized | Sin auth o token inválido |
| `403` | Forbidden | Sin permisos |
| `404` | Not Found | Recurso no existe |
| `409` | Conflict | Duplicado (ej: email existe) |
| `429` | Too Many Requests | Rate limit excedido |
| `500` | Internal Server Error | Error del servidor |

### Rate Limits

| Endpoint | Límite |
|----------|--------|
| `/auth/login`, `/auth/register` | 5 req / 15 min |
| Otros endpoints | 100 req / 1 min |

---

## 🔐 Authentication Endpoints

**Base:** `/api/v1/auth`

```bash
# Registrar nuevo usuario (público)
POST   /register
Body: { email, password, first_name?, last_name? }
Auth: No
Note: role is assigned automatically as 'student'

# Login
POST   /login
Body: { email, password }
Auth: No

# Refresh token
POST   /refresh
Body: { refreshToken }
Auth: No

# Obtener perfil actual
GET    /me
Auth: Yes

# Actualizar contraseña
PUT    /password
Body: { currentPassword, newPassword }
Auth: Yes

# Logout
POST   /logout
Auth: Yes

# Forgot password
POST   /forgot-password
Body: { email }
Auth: No

# Reset password
POST   /reset-password
Body: { token, newPassword }
Auth: No

# Listar sesiones activas
GET    /sessions
Auth: Yes

# Revocar todas las sesiones
DELETE /sessions/all
Auth: Yes
```

### Ejemplos

```bash
# Register (public self-service)
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "SecurePass123",
    "first_name": "John",
    "last_name": "Doe"
  }'
# Note: role is NOT accepted (assigned as 'student' automatically)

# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "student@example.com", "password": "SecurePass123"}'

# Get Profile
curl -X GET http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🎯 Educational Endpoints

**Base:** `/api/v1/educational`

```bash
# Listar todos los módulos
GET    /modules
Query: ?limit=10&offset=0
Auth: Yes

# Obtener módulo por ID
GET    /modules/:id
Auth: Yes

# Listar ejercicios de un módulo
GET    /modules/:moduleId/exercises
Query: ?limit=20&offset=0
Auth: Yes

# Obtener ejercicio por ID
GET    /exercises/:id
Auth: Yes

# Enviar intento de ejercicio
POST   /exercises/:id/submit
Body: { answers, timeSpent }
Auth: Yes

# Obtener progreso de módulo
GET    /modules/:id/progress
Auth: Yes

# Marcar módulo como completado
POST   /modules/:id/complete
Auth: Yes
```

### Ejemplos

```bash
# Listar módulos
curl http://localhost:3000/api/v1/educational/modules \
  -H "Authorization: Bearer YOUR_TOKEN"

# Obtener ejercicio
curl http://localhost:3000/api/v1/educational/exercises/abc-123 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Submit exercise
curl -X POST http://localhost:3000/api/v1/educational/exercises/abc-123/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {"questionId": "q1", "answer": "A"},
      {"questionId": "q2", "answer": "Marie Curie"}
    ],
    "timeSpent": 180
  }'
```

---

## 🏆 Gamification Endpoints

**Base:** `/api/v1/gamification`

```bash
# Obtener estadísticas del usuario
GET    /stats
Auth: Yes

# Añadir ML Coins (admin only)
POST   /coins/add
Body: { userId, amount, reason, transactionType }
Auth: Yes (admin)

# Obtener historial de transacciones
GET    /coins/transactions
Query: ?limit=20
Auth: Yes

# Listar todos los achievements
GET    /achievements
Auth: Yes

# Obtener achievements del usuario
GET    /achievements/me
Auth: Yes

# Reclamar achievement
POST   /achievements/:id/claim
Auth: Yes

# Obtener ranking global
GET    /ranking
Query: ?limit=100&offset=0
Auth: Yes

# Obtener ranking por escuela
GET    /ranking/school/:schoolId
Query: ?limit=100
Auth: Yes

# Obtener misiones activas
GET    /missions/active
Auth: Yes

# Completar misión
POST   /missions/:id/complete
Auth: Yes

# Listar power-ups
GET    /powerups
Auth: Yes

# Activar power-up
POST   /powerups/:id/activate
Auth: Yes
```

### Ejemplos

```bash
# Get stats
curl http://localhost:3000/api/v1/gamification/stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get transactions
curl http://localhost:3000/api/v1/gamification/coins/transactions?limit=10 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get ranking
curl http://localhost:3000/api/v1/gamification/ranking?limit=50 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get achievements
curl http://localhost:3000/api/v1/gamification/achievements/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Progress Endpoints

**Base:** `/api/v1/progress`

```bash
# Obtener progreso general del estudiante
GET    /student/:id
Auth: Yes

# Obtener progreso de módulo
GET    /module/:moduleId
Auth: Yes

# Registrar intento de ejercicio
POST   /exercise/:exerciseId/attempt
Body: { answers, score, timeSpent }
Auth: Yes

# Obtener analytics del estudiante
GET    /analytics
Query: ?period=week|month|year
Auth: Yes

# Obtener sesiones de estudio
GET    /sessions
Query: ?limit=20&offset=0
Auth: Yes
```

### Ejemplos

```bash
# Get student progress
curl http://localhost:3000/api/v1/progress/student/user-123 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get analytics
curl http://localhost:3000/api/v1/progress/analytics?period=month \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 👥 Social Endpoints

**Base:** `/api/v1/social`

```bash
# Listar escuelas
GET    /schools
Query: ?limit=50
Auth: Yes

# Obtener escuela por ID
GET    /schools/:id
Auth: Yes

# Listar aulas
GET    /classrooms
Query: ?schoolId=123
Auth: Yes

# Agregar amigo
POST   /friends/add
Body: { friendId }
Auth: Yes

# Listar amigos
GET    /friends
Auth: Yes

# Eliminar amigo
DELETE /friends/:friendId
Auth: Yes

# Listar equipos
GET    /teams
Auth: Yes

# Crear equipo
POST   /teams
Body: { name, description }
Auth: Yes

# Listar competencias
GET    /competitions
Query: ?status=active|upcoming|past
Auth: Yes
```

### Ejemplos

```bash
# List schools
curl http://localhost:3000/api/v1/social/schools \
  -H "Authorization: Bearer YOUR_TOKEN"

# Add friend
curl -X POST http://localhost:3000/api/v1/social/friends/add \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"friendId": "user-456"}'

# List competitions
curl http://localhost:3000/api/v1/social/competitions?status=active \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 👨‍🏫 Teacher Endpoints

**Base:** `/api/v1/teacher`

```bash
# Listar aulas del profesor
GET    /classrooms
Auth: Yes (teacher)

# Crear aula
POST   /classrooms
Body: { name, schoolId, gradeLevel }
Auth: Yes (teacher)

# Obtener aula por ID
GET    /classrooms/:id
Auth: Yes (teacher)

# Listar estudiantes del aula
GET    /classrooms/:id/students
Auth: Yes (teacher)

# Agregar estudiante al aula
POST   /classrooms/:id/students
Body: { studentId }
Auth: Yes (teacher)

# Crear asignación
POST   /assignments
Body: { classroomId, moduleId, dueDate }
Auth: Yes (teacher)

# Listar asignaciones
GET    /assignments
Query: ?classroomId=123
Auth: Yes (teacher)

# Calificar asignación
PUT    /grades/:id
Body: { score, feedback }
Auth: Yes (teacher)

# Ver progreso de estudiante
GET    /students/:id/progress
Auth: Yes (teacher)

# Generar reporte de clase
GET    /classrooms/:id/report
Query: ?format=pdf|json
Auth: Yes (teacher)
```

### Ejemplos

```bash
# List classrooms
curl http://localhost:3000/api/v1/teacher/classrooms \
  -H "Authorization: Bearer YOUR_TOKEN"

# Create assignment
curl -X POST http://localhost:3000/api/v1/teacher/assignments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "classroomId": "class-123",
    "moduleId": "module-456",
    "dueDate": "2025-12-01T23:59:59Z"
  }'

# Get student progress
curl http://localhost:3000/api/v1/teacher/students/student-789/progress \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔔 Notifications Endpoints

**Base:** `/api/v1/notifications`

```bash
# Listar notificaciones del usuario
GET    /
Query: ?limit=20&offset=0&read=true|false
Auth: Yes

# Marcar como leída
PUT    /notifications/:id/read
Auth: Yes

# Marcar todas como leídas
PUT    /read-all
Auth: Yes

# Eliminar notificación
DELETE /notifications/:id
Auth: Yes

# Enviar notificación (admin)
POST   /send
Body: { userId, title, message, type }
Auth: Yes (admin)
```

### Ejemplos

```bash
# Get notifications
curl http://localhost:3000/api/v1/notifications?limit=10 \
  -H "Authorization: Bearer YOUR_TOKEN"

# Mark as read
curl -X PUT http://localhost:3000/api/v1/notifications/notif-123/read \
  -H "Authorization: Bearer YOUR_TOKEN"

# Mark all as read
curl -X PUT http://localhost:3000/api/v1/notifications/read-all \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 👤 Admin Endpoints

**Base:** `/api/v1/admin`

```bash
# Listar usuarios
GET    /users
Query: ?limit=50&offset=0&role=student|teacher|admin
Auth: Yes (admin)

# Crear usuario (admin only)
POST   /users
Body: { email, password, role, first_name, last_name }
Auth: Yes (admin)
Note: Admin endpoint can set role explicitly

# Actualizar usuario
PUT    /users/:id
Body: { first_name, last_name, role, active }
Auth: Yes (admin)

# Eliminar usuario
DELETE /users/:id
Auth: Yes (admin)

# Listar organizaciones
GET    /organizations
Auth: Yes (admin)

# Crear organización
POST   /organizations
Body: { name, type, contactEmail }
Auth: Yes (admin)

# Ver estadísticas del sistema
GET    /system/stats
Auth: Yes (admin)

# Ver logs del sistema
GET    /system/logs
Query: ?level=error|warning|info&limit=100
Auth: Yes (admin)
```

### Ejemplos

```bash
# List users
curl http://localhost:3000/api/v1/admin/users?role=student&limit=20 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Create user (admin can set role)
curl -X POST http://localhost:3000/api/v1/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "TempPass123",
    "role": "student",
    "first_name": "Jane",
    "last_name": "Smith"
  }'

# Get system stats
curl http://localhost:3000/api/v1/admin/system/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 🏥 Health Endpoints

**Base:** `/api`

```bash
# Health check general
GET    /health
Auth: No

# Health check de base de datos
GET    /health/db
Auth: No

# System info (admin only)
GET    /system/info
Auth: Yes (admin)
```

### Ejemplos

```bash
# Check health
curl http://localhost:3000/api/health

# Check DB
curl http://localhost:3000/api/health/db
```

---

## 📦 Formato de Respuesta Estándar

### Success (200, 201)

```json
{
  "success": true,
  "data": {
    // ... datos específicos
  }
}
```

### Error (4xx, 5xx)

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

## 🚀 Tips de Uso

### 1. Guardar Token

```bash
# Guardar token en variable
TOKEN="eyJhbGciOiJIUzI1NiIs..."

# Usar en requests
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Debugging con verbose

```bash
curl -v http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123"}'
```

### 3. Pretty print JSON (con jq)

```bash
curl http://localhost:3000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

### 4. Save response to file

```bash
curl http://localhost:3000/api/v1/gamification/stats \
  -H "Authorization: Bearer $TOKEN" \
  -o stats.json
```

### 5. POST con archivo

```bash
curl -X POST http://localhost:3000/api/v1/content/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@image.png"
```

---

## 🔍 Ejemplos Comunes

### Login completo y usar token

```bash
# 1. Login
response=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "student@example.com", "password": "test123"}')

# 2. Extraer token
token=$(echo $response | jq -r '.data.token')

# 3. Usar token
curl http://localhost:3000/api/v1/educational/modules \
  -H "Authorization: Bearer $token"
```

### Submit ejercicio completo

```bash
# 1. Get exercise
curl http://localhost:3000/api/v1/educational/exercises/ex-123 \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# 2. Submit answers
curl -X POST http://localhost:3000/api/v1/educational/exercises/ex-123/submit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {"questionId": "q1", "answer": "A"},
      {"questionId": "q2", "answer": "Marie Curie"},
      {"questionId": "q3", "answer": ["A", "C"]}
    ],
    "timeSpent": 180
  }' | jq '.'

# 3. Check stats
curl http://localhost:3000/api/v1/gamification/stats \
  -H "Authorization: Bearer $TOKEN" | jq '.data.mlCoins'
```

### Ver progreso completo

```bash
# Stats generales
curl http://localhost:3000/api/v1/gamification/stats \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Progreso por módulo
curl http://localhost:3000/api/v1/progress/module/module-123 \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Analytics
curl http://localhost:3000/api/v1/progress/analytics?period=month \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Achievements
curl http://localhost:3000/api/v1/gamification/achievements/me \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

---

## 📚 Recursos

**Documentación completa:**
- [API-ENDPOINTS.md](../03-desarrollo/backend/API-ENDPOINTS.md) - Documentación detallada de todos los endpoints
- [API-Auth.md](../03-desarrollo/backend/api/API-Auth.md) - Endpoints de autenticación
- [API-Educational.md](../03-desarrollo/backend/api/API-Educational.md) - Endpoints educativos
- [API-Gamification.md](../03-desarrollo/backend/api/API-Gamification.md) - Endpoints de gamificación

**Testing:**
- Postman Collection: `docs/02-especificaciones-tecnicas/apis/GLIT.postman_collection.json`
- Swagger UI: `http://localhost:3000/api/docs` (cuando esté disponible)

**Troubleshooting:**
- [ONBOARDING.md](../00-overview/ONBOARDING.md#troubleshooting) - Solución de problemas comunes
- Slack: #gamilit-backend

---

**Última actualización:** 2025-11-07
**Versión:** 1.0
**Método:** Extracted from API-ENDPOINTS.md
