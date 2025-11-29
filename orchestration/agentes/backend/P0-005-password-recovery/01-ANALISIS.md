# P0-005 - Password Recovery - Análisis

**Fecha:** 2025-11-28
**Agente:** Backend-Agent
**Prioridad:** P0 (Crítico)

## 📋 Contexto

Implementar funcionalidad completa de recuperación de contraseña para permitir a los estudiantes recuperar acceso a sus cuentas cuando olvidan su contraseña.

## 🎯 Objetivo

Transformar la implementación actual (que ya existe pero necesita mejoras) en una solución 100% funcional con integración real de email.

## 🔍 Análisis del Estado Actual

### Archivos Existentes

1. **Controller** (`password.controller.ts`)
   - ✅ Endpoints ya definidos con Swagger
   - ✅ POST /auth/reset-password/request
   - ✅ POST /auth/reset-password
   - ✅ Documentación completa

2. **Service** (`password-recovery.service.ts`)
   - ✅ Lógica de generación de tokens con `crypto.randomBytes(32)`
   - ✅ Hashing con SHA256
   - ✅ Validación de expiración (1 hora)
   - ✅ Actualización de contraseña con bcrypt
   - ⚠️ MailService comentado (TODO)
   - ⚠️ SessionManagement comentado (TODO)

3. **Entity** (`password-reset-token.entity.ts`)
   - ⚠️ Mapeo incorrecto: columna `token` en lugar de `token_hash`
   - ✅ Helpers: isValid(), isExpired(), isUsed()
   - ✅ Relación con User

4. **DTOs**
   - ✅ RequestPasswordResetDto (validación de email)
   - ✅ ResetPasswordDto (validación de password con regex)

5. **MailService** (`mail.service.ts`)
   - ✅ Template HTML para password reset
   - ✅ Método sendPasswordResetEmail()
   - ⚠️ Sin MailModule para exportar

6. **Base de Datos**
   - ✅ Tabla `auth_management.password_reset_tokens` existe
   - ✅ Columna correcta: `token_hash`

### Problemas Identificados

1. **Alineación Entity-BD**: Entity usa `token` pero BD tiene `token_hash`
2. **MailService no integrado**: Service tiene comentario TODO
3. **Sin MailModule**: No se puede importar en AuthModule
4. **Sin tests unitarios**: No hay validación automatizada

## 📊 Análisis de Impacto

### Componentes Afectados
- ✅ AuthModule (importar MailModule)
- ✅ PasswordRecoveryService (inyectar MailService)
- ✅ PasswordResetToken entity (corregir mapeo)
- ✅ MailModule (crear nuevo)

### Dependencias
- MailService → PasswordRecoveryService
- MailModule → AuthModule
- PasswordResetToken → auth_management.password_reset_tokens (tabla)

## 🎯 Criterios de Aceptación

- [x] Token se genera con crypto.randomBytes(32)
- [x] Token expira en 1 hora
- [x] Token se guarda en BD (con columna correcta token_hash)
- [x] Contraseña se hashea con bcrypt (cost 10)
- [x] Token usado se invalida (used_at)
- [x] Mensajes de error no revelan si email existe
- [x] MailService integrado y funcional
- [x] Tests unitarios completos

## 🔐 Consideraciones de Seguridad

1. **No revelar existencia de emails**: Siempre retornar mismo mensaje
2. **Token hasheado en BD**: Usar SHA256 antes de almacenar
3. **Expiración corta**: 1 hora (vs 24h de email verification)
4. **Invalidar tokens previos**: Al solicitar nuevo reset
5. **Marcar como usado**: Después de usar token exitosamente

## 📝 Plan de Implementación

Ver [02-PLAN.md](./02-PLAN.md)
