# P0-005 - Password Recovery - Guía de Testing

**Fecha:** 2025-11-28
**Versión:** 1.0.0

---

## 🧪 Tests Unitarios

### Ejecutar Tests
```bash
cd apps/backend
npm test -- password-recovery.service.spec.ts
```

### Resultado Esperado
```
PASS src/modules/auth/services/__tests__/password-recovery.service.spec.ts
  PasswordRecoveryService
    requestReset
      ✓ debería generar token y enviar email si usuario existe (26 ms)
      ✓ no debería revelar si email no existe (seguridad) (2 ms)
    resetPassword
      ✓ debería actualizar contraseña con token válido (55 ms)
      ✓ debería rechazar token inválido (7 ms)
      ✓ debería rechazar token expirado (2 ms)
    validateToken
      ✓ debería retornar valid=true para token válido (1 ms)
      ✓ debería retornar valid=false para token inexistente (1 ms)

Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
```

---

## 🔌 Testing de Endpoints (Manual)

### Prerequisitos

1. Backend ejecutándose:
```bash
cd apps/backend
npm run dev
```

2. Base de datos activa
3. Usuario test existente en BD

---

## Test 1: Solicitar Reset de Contraseña

### Request
```bash
curl -X POST http://localhost:3000/auth/reset-password/request \
  -H "Content-Type: application/json" \
  -d '{
    "email": "estudiante@example.com"
  }'
```

### Response Esperado
```json
{
  "message": "Si el email existe en nuestro sistema, recibirás instrucciones para resetear tu contraseña."
}
```

### Validaciones
- [ ] Status code: 200
- [ ] Mensaje genérico (no revela si email existe)
- [ ] Token generado en consola (modo desarrollo)
- [ ] Email enviado (si SMTP configurado)

### Console Log Esperado (Desarrollo)
```
[DEV] Password reset token for estudiante@example.com: 036572caa7b7747adf080e843daa5c4088f7ce002629567902b26a857c959ab5
```

**Nota:** Copiar el token de la consola para el siguiente test.

---

## Test 2: Resetear Contraseña con Token Válido

### Request
```bash
TOKEN="036572caa7b7747adf080e843daa5c4088f7ce002629567902b26a857c959ab5"

curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d "{
    \"token\": \"$TOKEN\",
    \"new_password\": \"NewPassword123!\"
  }"
```

### Response Esperado
```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

### Validaciones
- [ ] Status code: 200
- [ ] Contraseña actualizada en BD
- [ ] Token marcado como usado (used_at != null)
- [ ] Puede hacer login con nueva contraseña

---

## Test 3: Token Inválido

### Request
```bash
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "invalidtoken123",
    "new_password": "NewPassword123!"
  }'
```

### Response Esperado
```json
{
  "statusCode": 400,
  "message": "Token inválido o expirado",
  "error": "Bad Request"
}
```

### Validaciones
- [ ] Status code: 400
- [ ] Mensaje de error claro
- [ ] No actualiza contraseña

---

## Test 4: Token Usado Previamente

### Request
```bash
# Usar mismo token del Test 2
TOKEN="036572caa7b7747adf080e843daa5c4088f7ce002629567902b26a857c959ab5"

curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d "{
    \"token\": \"$TOKEN\",
    \"new_password\": \"AnotherPassword123!\"
  }"
```

### Response Esperado
```json
{
  "statusCode": 400,
  "message": "Token inválido o expirado",
  "error": "Bad Request"
}
```

### Validaciones
- [ ] Status code: 400
- [ ] Token ya usado no permite reset
- [ ] Contraseña no se actualiza

---

## Test 5: Password Inválido (Validación)

### Request
```bash
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "validtoken123",
    "new_password": "weak"
  }'
```

### Response Esperado
```json
{
  "statusCode": 400,
  "message": [
    "Password debe tener al menos 8 caracteres",
    "Password debe contener mayúsculas, minúsculas y números/símbolos"
  ],
  "error": "Bad Request"
}
```

### Validaciones
- [ ] Status code: 400
- [ ] Mensajes de validación claros
- [ ] No actualiza contraseña

---

## Test 6: Email No Existente (Seguridad)

### Request
```bash
curl -X POST http://localhost:3000/auth/reset-password/request \
  -H "Content-Type: application/json" \
  -d '{
    "email": "noexiste@example.com"
  }'
```

### Response Esperado
```json
{
  "message": "Si el email existe en nuestro sistema, recibirás instrucciones para resetear tu contraseña."
}
```

### Validaciones
- [ ] Status code: 200 (mismo que email válido)
- [ ] Mensaje idéntico (no revela si existe)
- [ ] No genera token (verificar en consola)
- [ ] No envía email

---

## 🗄️ Testing de Base de Datos

### Verificar Token en BD

```sql
-- Conectar a BD
psql -U gamilit_user -d gamilit_db

-- Ver tokens recientes
SELECT
  id,
  user_id,
  LEFT(token_hash, 20) as token_preview,
  expires_at,
  used_at,
  created_at
FROM auth_management.password_reset_tokens
ORDER BY created_at DESC
LIMIT 5;
```

### Verificar Expiración

```sql
-- Tokens expirados
SELECT COUNT(*)
FROM auth_management.password_reset_tokens
WHERE expires_at < NOW();

-- Tokens válidos
SELECT COUNT(*)
FROM auth_management.password_reset_tokens
WHERE expires_at > NOW()
  AND used_at IS NULL;
```

### Verificar Uso de Token

```sql
-- Token usado
SELECT
  id,
  used_at,
  expires_at
FROM auth_management.password_reset_tokens
WHERE token_hash = 'hash_del_token'
  AND used_at IS NOT NULL;
```

---

## 📧 Testing de Email (Manual)

### Configurar Mailtrap (Desarrollo)

1. Crear cuenta en [mailtrap.io](https://mailtrap.io)
2. Obtener credenciales SMTP
3. Configurar `.env`:

```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_username
SMTP_PASS=your_mailtrap_password
SMTP_SECURE=false
FRONTEND_URL=http://localhost:3005
MAIL_FROM=GAMILIT <noreply@gamilit.com>
```

### Verificar Email Enviado

1. Solicitar reset de contraseña
2. Ir a Mailtrap inbox
3. Verificar email recibido con:
   - [ ] Subject: "Recuperación de Contraseña - GAMILIT"
   - [ ] From: "GAMILIT <noreply@gamilit.com>"
   - [ ] Botón "Restablecer Contraseña"
   - [ ] Link alternativo
   - [ ] Token en URL
   - [ ] Advertencia de expiración (1h)

---

## 🔄 Testing de Flujo Completo (E2E)

### Escenario 1: Flujo Exitoso

1. **Solicitar reset**
```bash
curl -X POST http://localhost:3000/auth/reset-password/request \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

2. **Copiar token de consola**
```
[DEV] Password reset token for test@example.com: XXXX
```

3. **Resetear contraseña**
```bash
curl -X POST http://localhost:3000/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "XXXX",
    "new_password": "NewPassword123!"
  }'
```

4. **Verificar login con nueva contraseña**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "NewPassword123!"
  }'
```

### Escenario 2: Token Expirado

1. Generar token
2. Modificar manualmente `expires_at` en BD (pasado)
3. Intentar usar token
4. Verificar error 400

### Escenario 3: Múltiples Solicitudes

1. Solicitar reset → Token1
2. Solicitar reset nuevamente → Token2
3. Verificar Token1 marcado como usado
4. Usar Token2 exitosamente

---

## 🎯 Checklist de Testing

### Funcionalidad Básica
- [ ] Solicitar reset con email válido
- [ ] Solicitar reset con email inválido
- [ ] Resetear con token válido
- [ ] Rechazar token inválido
- [ ] Rechazar token expirado
- [ ] Rechazar token usado

### Seguridad
- [ ] No revela si email existe
- [ ] Token hasheado en BD
- [ ] Password hasheado con bcrypt
- [ ] Token expira en 1 hora
- [ ] Token se invalida al usar

### Email
- [ ] Email enviado correctamente
- [ ] Template HTML se renderiza bien
- [ ] Link funciona en email
- [ ] Token en URL es correcto

### Validaciones
- [ ] Email inválido rechazado
- [ ] Password corto rechazado
- [ ] Password débil rechazado

### Base de Datos
- [ ] Token guardado correctamente
- [ ] used_at actualizado
- [ ] Tokens previos invalidados

---

## 📝 Reporte de Testing

```markdown
## Testing Report - P0-005 Password Recovery

**Fecha:** 2025-11-28
**Tester:** [Nombre]
**Ambiente:** [Desarrollo/Staging]

### Tests Unitarios
- [x] 7/7 tests pasando

### Tests de Integración
- [ ] Solicitar reset - OK
- [ ] Resetear password - OK
- [ ] Token inválido - OK
- [ ] Email enviado - OK

### Bugs Encontrados
- Ninguno

### Observaciones
- Todo funcionando correctamente
- Email template se ve bien en Mailtrap
```

---

**Versión:** 1.0.0
**Fecha:** 2025-11-28
**Mantenido por:** Backend-Agent
