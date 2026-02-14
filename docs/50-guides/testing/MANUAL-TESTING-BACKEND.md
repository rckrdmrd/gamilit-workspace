# Procedimiento de Pruebas Manuales del Backend

**Version:** 1.0.0
**Fecha:** 2026-01-18
**Sistema:** Gamilit Backend (NestJS)

---

## Objetivo

Este documento describe el procedimiento para probar manualmente los endpoints del backend usando `curl`. Es útil para:
- Validar correcciones de bugs
- Verificar que los endpoints responden correctamente
- Depurar problemas de API
- Validar formato de respuestas

---

## Prerequisitos

1. Backend corriendo en `localhost:3006`
2. Base de datos PostgreSQL activa
3. Usuarios de prueba cargados (seeds)

---

## Credenciales de Prueba

| Usuario | Email | Password | Rol | UUID |
|---------|-------|----------|-----|------|
| Admin | admin@gamilit.com | Test1234 | super_admin | aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa |
| Teacher | teacher@gamilit.com | Test1234 | admin_teacher | bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb |
| Student | student@gamilit.com | Test1234 | student | cccccccc-cccc-cccc-cccc-cccccccccccc |

---

## Procedimiento Paso a Paso

### 1. Verificar que el Backend está Corriendo

```bash
# Health check
curl -s http://localhost:3006/api/v1/health | python3 -m json.tool

# Respuesta esperada:
# {
#   "status": "healthy",
#   "checks": { "database": { "status": "healthy" } }
# }
```

**Si no responde:**
```bash
# Iniciar backend
cd apps/backend
npm run dev

# Esperar 10-15 segundos para que inicie
```

---

### 2. Hacer Login y Obtener Token JWT

```bash
# Login con teacher
curl -s -X POST http://localhost:3006/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@gamilit.com","password":"Test1234"}'

# Guardar el token en una variable
LOGIN=$(curl -s -X POST http://localhost:3006/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@gamilit.com","password":"Test1234"}')

TOKEN=$(echo "$LOGIN" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')

echo "Token: ${TOKEN:0:50}..."
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "teacher@gamilit.com", "role": "admin_teacher" },
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  }
}
```

---

### 3. Probar Endpoints Protegidos

**Formato general:**
```bash
curl -s "http://localhost:3006/api/v1/{endpoint}" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

---

### 4. Ejemplos de Endpoints del Teacher

#### 4.1 Listar Classrooms
```bash
curl -s "http://localhost:3006/api/v1/teacher/classrooms" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

#### 4.2 Obtener Estudiantes de un Classroom
```bash
CLASSROOM_ID="a0000000-0000-4000-a000-000000000001"

curl -s "http://localhost:3006/api/v1/teacher/classrooms/$CLASSROOM_ID/students" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

#### 4.3 Obtener Estadísticas de un Classroom
```bash
curl -s "http://localhost:3006/api/v1/teacher/classrooms/$CLASSROOM_ID/stats" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

#### 4.4 Obtener Progreso de un Classroom
```bash
curl -s "http://localhost:3006/api/v1/teacher/classrooms/$CLASSROOM_ID/progress" \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool
```

---

### 5. Script de Prueba Completo

```bash
#!/bin/bash
# test-backend.sh - Prueba endpoints del backend de Gamilit

set -e

BASE_URL="http://localhost:3006/api/v1"

echo "=== GAMILIT BACKEND TEST ==="
echo ""

# 1. Health check
echo "1. Health Check..."
HEALTH=$(curl -s "$BASE_URL/health")
if echo "$HEALTH" | grep -q '"status":"healthy"'; then
  echo "   [OK] Backend healthy"
else
  echo "   [FAIL] Backend not healthy"
  exit 1
fi

# 2. Login
echo "2. Login..."
LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@gamilit.com","password":"Test1234"}')

TOKEN=$(echo "$LOGIN" | sed -n 's/.*"accessToken":"\([^"]*\)".*/\1/p')

if [ -z "$TOKEN" ]; then
  echo "   [FAIL] No token received"
  exit 1
fi
echo "   [OK] Token received"

# 3. Get classrooms
echo "3. Get Classrooms..."
CLASSROOMS=$(curl -s "$BASE_URL/teacher/classrooms" -H "Authorization: Bearer $TOKEN")
if echo "$CLASSROOMS" | grep -q '"success":true'; then
  echo "   [OK] Classrooms endpoint works"
else
  echo "   [FAIL] Classrooms endpoint failed"
fi

# 4. Get classroom students
echo "4. Get Classroom Students..."
CLASSROOM_ID="a0000000-0000-4000-a000-000000000001"
STUDENTS=$(curl -s "$BASE_URL/teacher/classrooms/$CLASSROOM_ID/students" -H "Authorization: Bearer $TOKEN")
if echo "$STUDENTS" | grep -q '"success":true'; then
  echo "   [OK] Students endpoint works"
else
  echo "   [FAIL] Students endpoint failed"
fi

# 5. Get classroom stats
echo "5. Get Classroom Stats..."
STATS=$(curl -s "$BASE_URL/teacher/classrooms/$CLASSROOM_ID/stats" -H "Authorization: Bearer $TOKEN")
if echo "$STATS" | grep -q '"success":true'; then
  echo "   [OK] Stats endpoint works"
else
  echo "   [FAIL] Stats endpoint failed"
fi

echo ""
echo "=== ALL TESTS PASSED ==="
```

---

## Validar Respuestas

### Formato Estándar de Respuesta Exitosa
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-01-18T19:52:57.429Z",
  "path": "/api/v1/..."
}
```

### Formato Estándar de Error
```json
{
  "statusCode": 400,
  "message": "Error message",
  "code": "ErrorCode",
  "stack": "..."
}
```

---

## Códigos HTTP Esperados

| Código | Significado | Acción |
|--------|-------------|--------|
| 200 | OK | Respuesta exitosa |
| 201 | Created | Recurso creado |
| 400 | Bad Request | Validación fallida o datos inválidos |
| 401 | Unauthorized | Token inválido o expirado |
| 403 | Forbidden | Sin permisos para el recurso |
| 404 | Not Found | Recurso no encontrado |
| 500 | Internal Server Error | Error del servidor |

---

## Troubleshooting

### Error: "Backend no responde"
```bash
# Verificar si el puerto está en uso
lsof -i :3006

# Ver logs del backend
tail -f /tmp/gamilit-backend.log

# Reiniciar backend
cd apps/backend
npm run dev
```

### Error: "Token expired"
```bash
# Hacer login de nuevo para obtener nuevo token
# Los tokens expiran después de 15 minutos (configurable)
```

### Error: "403 Forbidden - You do not have access to this classroom"
```bash
# Verificar asignaciones teacher-classroom en BD
PGPASSWORD=9rGjYKknaZKnCLUk psql -h localhost -p 5433 -U gamilit_user -d gamilit_platform -c "
SELECT tc.teacher_id, tc.classroom_id, p.email
FROM social_features.teacher_classrooms tc
JOIN auth_management.profiles p ON tc.teacher_id = p.id;
"
```

---

## Referencias

- **Credenciales BD:** Ver `.env` en `apps/backend/`
- **Seeds de usuarios:** `apps/database/seeds/dev/auth/01-demo-users.sql`
- **Documentación API:** `http://localhost:3006/api/docs` (Swagger)

---

**Autor:** Claude Opus 4.5
**Última actualización:** 2026-01-18
