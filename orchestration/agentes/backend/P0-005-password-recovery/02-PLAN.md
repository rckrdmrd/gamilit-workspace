# P0-005 - Password Recovery - Plan de Ejecución

**Fecha:** 2025-11-28
**Agente:** Backend-Agent

## 📋 Checklist de Tareas

### ✅ Fase 1: Corrección de Entity

- [x] Corregir mapeo de columna `token` → `token_hash` en PasswordResetToken entity
- [x] Verificar alineación con DDL: auth_management.password_reset_tokens

**Archivos modificados:**
- `apps/backend/src/modules/auth/entities/password-reset-token.entity.ts`

### ✅ Fase 2: Creación de MailModule

- [x] Crear `mail.module.ts` en módulo mail
- [x] Exportar MailService para uso en otros módulos

**Archivos creados:**
- `apps/backend/src/modules/mail/mail.module.ts`

### ✅ Fase 3: Integración de MailService

- [x] Importar MailModule en AuthModule
- [x] Inyectar MailService en PasswordRecoveryService constructor
- [x] Reemplazar TODO comentado con llamada real a sendPasswordResetEmail
- [x] Mantener console.log como fallback para desarrollo

**Archivos modificados:**
- `apps/backend/src/modules/auth/auth.module.ts`
- `apps/backend/src/modules/auth/services/password-recovery.service.ts`

### ✅ Fase 4: Testing

- [x] Crear tests unitarios para PasswordRecoveryService
- [x] Validar casos:
  - requestReset con usuario existente
  - requestReset sin revelar email inexistente
  - resetPassword con token válido
  - resetPassword con token inválido
  - resetPassword con token expirado
  - validateToken

**Archivos creados:**
- `apps/backend/src/modules/auth/services/__tests__/password-recovery.service.spec.ts`

### ✅ Fase 5: Validación

- [x] Ejecutar tests: 7/7 passed ✅
- [x] Validar importación de módulos
- [x] Verificar sintaxis TypeScript

## 🎯 Resultado Esperado

### Endpoints Funcionales

```bash
# 1. Solicitar reset de contraseña
POST /auth/reset-password/request
Content-Type: application/json

{
  "email": "estudiante@example.com"
}

# Response:
{
  "message": "Si el email existe en nuestro sistema, recibirás instrucciones para resetear tu contraseña."
}

# 2. Resetear contraseña con token
POST /auth/reset-password
Content-Type: application/json

{
  "token": "036572caa7b7747adf080e843daa5c4088f7ce002629567902b26a857c959ab5",
  "new_password": "NewSecurePassword123!"
}

# Response:
{
  "message": "Contraseña actualizada exitosamente"
}
```

### Flujo Completo

1. Usuario solicita reset en /auth/reset-password/request
2. Sistema genera token con crypto.randomBytes(32)
3. Token se hashea con SHA256 y guarda en BD
4. MailService envía email con token plaintext
5. Usuario recibe email con link de reset
6. Usuario hace clic y llega a formulario con token en URL
7. Usuario ingresa nueva contraseña
8. Sistema valida token (hash y expiración)
9. Sistema actualiza contraseña con bcrypt
10. Sistema marca token como usado (used_at)

## 📦 Archivos Entregables

### Archivos Modificados (3)
1. `apps/backend/src/modules/auth/entities/password-reset-token.entity.ts`
2. `apps/backend/src/modules/auth/auth.module.ts`
3. `apps/backend/src/modules/auth/services/password-recovery.service.ts`

### Archivos Creados (2)
1. `apps/backend/src/modules/mail/mail.module.ts`
2. `apps/backend/src/modules/auth/services/__tests__/password-recovery.service.spec.ts`

## ✅ Validación Final

- [x] Tests pasan: 7/7 ✅
- [x] Importaciones funcionan correctamente
- [x] Entity alineada con BD
- [x] MailService integrado
- [x] Seguridad implementada (no revelar emails)
- [x] Documentación completa
