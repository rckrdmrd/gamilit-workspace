# Issues Criticos de Backend - Estado Actualizado

**Estado:** Resuelto
**Fecha:** 2025-01-04 (Actualizado)
**Origen:** Extraido de archivos historicos, verificado contra codigo fuente

---

## Resumen

Este documento lista los issues criticos de backend que fueron identificados en historicos. **NOTA IMPORTANTE:** Tras verificacion del codigo fuente (2025-01-04), se confirma que todos los issues P0 fueron **IMPLEMENTADOS** en Noviembre 2025.

La informacion original extraida de archivos historicos estaba desactualizada. Los reportes `EXECUTION-REPORT-2025-11-28.md` y `VALIDATION-PLAN-2025-11-28.md` confirman la implementacion.

---

## Issues P0 - TODOS IMPLEMENTADOS

### P0-001: Auto-Save con userId - IMPLEMENTADO

**Estado:** IMPLEMENTADO (verificado 2025-01-04)

**Implementacion:**
- El hook `useExerciseAutoSave.ts` NO usa userId hardcodeado
- El userId se obtiene del JWT en el backend via `JwtAuthGuard`
- El controller `ExerciseSubmissionController` extrae `authUserId` del request
- Conversion a `profileId` via `getProfileIdFromAuthUser()`

**Evidencia de codigo:**
```typescript
// exercise-submission.controller.ts, lineas 752-773
async autoSaveProgress(@Request() req: AuthRequest, ...) {
  const authUserId = req.user?.id; // Del JWT
  const profileId = await this.submissionService.getProfileIdFromAuthUser(authUserId);
  return this.submissionService.autoSaveProgress(profileId, ...);
}
```

**Referencias:**
- `apps/backend/src/modules/educational/controllers/exercise-submission.controller.ts`
- `apps/frontend/src/apps/student/hooks/useExerciseAutoSave.ts`

---

### P0-003: Inconsistencia de IDs en BD - IMPLEMENTADO

**Estado:** IMPLEMENTADO (verificado 2025-01-04)

**Implementacion:**
- Helper `getProfileIdFromAuthUser()` implementado en servicios que lo requieren
- Conversion automatica de `auth.users.id` a `profiles.id`

**Patron implementado:**
```typescript
async getProfileIdFromAuthUser(authUserId: string): Promise<string> {
  const profile = await this.profilesRepository.findOne({
    where: { user_id: authUserId }
  });
  return profile.id;
}
```

---

### P0-005: Password Recovery - IMPLEMENTADO

**Estado:** IMPLEMENTADO (verificado 2025-01-04)

**Implementacion completa:**
- Tabla `password_reset_tokens` en BD con campos: token_hash, expires_at, used_at, ip_address
- `PasswordRecoveryService` con metodos: `requestReset()`, `validateToken()`, `resetPassword()`
- `MailService.sendPasswordResetEmail()` con soporte SMTP y SendGrid
- Tokens hasheados con SHA256, expiracion configurable
- Invalidacion automatica de todas las sesiones al resetear

**Endpoints:**
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

**Referencias:**
- `apps/backend/src/modules/auth/services/password-recovery.service.ts`
- `apps/backend/src/modules/mail/mail.service.ts`
- `apps/database/ddl/schemas/auth_management/tables/07-password_reset_tokens.sql`

---

### P0-006: Change Password - IMPLEMENTADO

**Estado:** IMPLEMENTADO (verificado 2025-01-04)

**Implementacion:**
- Metodo `changePassword()` en `AuthService`
- Validacion de password actual con bcrypt.compare
- Hash de nuevo password con bcrypt (cost 10)
- Validaciones: longitud minima, no igual al anterior

**Endpoints:**
- `PUT /auth/password`
- `PUT /auth/change-password`

**Referencias:**
- `apps/backend/src/modules/auth/services/auth.service.ts` (lineas 416-458)
- `apps/backend/src/modules/auth/dto/change-password.dto.ts`

---

### P0-007: Session Management - IMPLEMENTADO

**Estado:** IMPLEMENTADO (verificado 2025-01-04)

**Implementacion completa:**
- Tabla `user_sessions` con campos: session_token, refresh_token, device_info, ip_address, user_agent, is_active, revoked_at
- `SessionManagementService` con metodos:
  - `createSession()` - con limite de 5 sesiones concurrentes
  - `validateSession()` - actualiza last_activity
  - `revokeSession()` - revoca sesion especifica
  - `revokeAllSessions()` - revoca todas excepto actual
  - `getSessions()` - lista sesiones activas
  - `cleanExpiredSessions()` - cron job de limpieza

**Endpoints:**
- `GET /auth/sessions`
- `DELETE /auth/sessions/:sessionId`
- `DELETE /auth/sessions`

**Seguridad:**
- Refresh tokens hasheados con SHA256
- Validacion de ownership en revocacion
- Audit trail con revoked_at timestamp

**Referencias:**
- `apps/backend/src/modules/auth/services/session-management.service.ts`
- `apps/backend/src/modules/auth/entities/user-session.entity.ts`
- `apps/database/ddl/schemas/auth_management/tables/11-user_sessions.sql`

---

## Issues P0 de Portal Estudiante

### GAP-006, GAP-007, GAP-008

**Estado:** Verificacion pendiente de datos de prueba

Estos issues estan relacionados con queries que retornan valores correctos pero pueden mostrar 0 si no hay datos de prueba en la BD.

---

## Issues P1 (Altos) - Pendientes de Verificacion

### P1-004: Trigger para exercise_submissions

**Estado:** A VERIFICAR
**Accion:** Verificar existencia del trigger

### P1-005: Validacion de Roles en Endpoints Teacher

**Estado:** A VERIFICAR
**Accion:** Auditar endpoints del modulo teacher

---

## Trazabilidad de Implementacion

**Reportes que confirman implementacion:**
- `docs/99-archivados/historicos-2025/reportes-analisis/EXECUTION-REPORT-2025-11-28.md`
  - "Grupo 1: P0-003, P0-005, P0-006 | Completado"
  - "Grupo 2: P0-001, P0-002, P0-004, P0-007 | Completado"
- `docs/99-archivados/historicos-2025/reportes-analisis/VALIDATION-PLAN-2025-11-28.md`

**Verificacion de codigo:**
- Realizada el 2025-01-04 por agente Explore
- Se verificaron servicios, controllers, DTOs y entidades de BD

---

## Proximos Pasos

1. **P1:** Verificar trigger para exercise_submissions
2. **P1:** Auditar validacion de roles en endpoints teacher
3. **Datos:** Crear seeds de prueba para validar GAP-006/007/008

---

## Referencias

**Documentacion historica:**
- `docs/99-archivados/historicos-2025/reportes-analisis/ANALYSIS-2025-11-28.md`
- `docs/99-archivados/historicos-2025/reportes-analisis/EXECUTION-REPORT-2025-11-28.md`
- `docs/99-archivados/historicos-2025/trazas/TRACE-P0-CORRECTIONS.md`

**ADRs relacionados:**
- `docs/90-adr/ADR-027-missions-triggers-mapping.md`

---

**Actualizado:** 2025-01-04
**Owner:** @backend-team
**Version:** 2.0 (Corregido - issues verificados como implementados)
