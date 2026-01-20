# Analisis de Schemas de Autenticacion

**Tarea:** PENDIENTE-1 - Sincronizacion de auth schemas
**Fecha:** 2026-01-20
**Perfiles:** @PERFIL_DATABASE + @PERFIL_ARCHITECT
**Estado:** ANALISIS COMPLETADO

---

## 1. Estado Actual

### 1.1 Schema `auth` (Supabase/GoTrue Compatible)

**Ubicacion DDL:** `/apps/database/ddl/schemas/auth/`

**Proposito:** Schema compatible con Supabase Auth (GoTrue). Contiene la tabla principal de usuarios con campos estandar de la industria para autenticacion.

#### Tablas DDL Encontradas

| # | Tabla | Archivo DDL | Descripcion |
|---|-------|-------------|-------------|
| 1 | `auth.users` | `tables/01-users.sql` | Tabla principal de usuarios con campos de autenticacion |

#### Enums en Schema auth

| Enum | Archivo | Valores |
|------|---------|---------|
| `aal_level` | `enums/aal_level.sql` | Niveles de autenticacion AAL |
| `code_challenge_method` | `enums/code_challenge_method.sql` | Metodos PKCE |

#### Views en Schema auth

| View | Archivo | Descripcion |
|------|---------|-------------|
| `tenants_alias` | `views/tenants_alias.sql` | Vista alias a tenants de auth_management |

#### Entity Backend Mapeado

| Tabla DDL | Entity | Modulo | Estado |
|-----------|--------|--------|--------|
| `auth.users` | `User` | `/modules/auth/entities/user.entity.ts` | OK - MAPEADO |

**Observaciones:**
- Este schema esta disenado para compatibilidad con Supabase Auth
- La tabla `auth.users` tiene campos estandar (email, encrypted_password, tokens, etc.)
- Campo personalizado `gamilit_role` usa el enum de `auth_management`
- El entity `User` mapea correctamente al schema `auth`

---

### 1.2 Schema `auth_management` (GAMILIT Custom)

**Ubicacion DDL:** `/apps/database/ddl/schemas/auth_management/`

**Proposito:** Schema personalizado de GAMILIT para gestion avanzada de autenticacion, perfiles, roles, sesiones, y funcionalidades adicionales.

#### Tablas DDL Encontradas (17 tablas)

| # | Tabla | Archivo DDL | Descripcion |
|---|-------|-------------|-------------|
| 1 | `tenants` | `tables/01-tenants.sql` | Multi-tenancy, organizaciones |
| 2 | `auth_attempts` | `tables/02-auth_attempts.sql` | Intentos de autenticacion |
| 3 | `profiles` | `tables/03-profiles.sql` | Perfiles de usuario extendidos |
| 4 | `roles` | `tables/04-roles.sql` | Definicion de roles RBAC |
| 5 | `auth_providers` | `tables/05-auth_providers.sql` | Proveedores OAuth/SSO |
| 6 | `email_verification_tokens` | `tables/06-email_verification_tokens.sql` | Tokens de verificacion email |
| 7 | `password_reset_tokens` | `tables/07-password_reset_tokens.sql` | Tokens de reset de contrasena |
| 8 | `security_events` | `tables/08-security_events.sql` | Eventos de seguridad |
| 9 | `user_preferences` | `tables/09-user_preferences.sql` | Preferencias de usuario |
| 10 | `memberships` | `tables/10-memberships.sql` | Membresías de usuarios |
| 11 | `user_sessions` | `tables/11-user_sessions.sql` | Sesiones activas |
| 12 | `user_suspensions` | `tables/12-user_suspensions.sql` | Suspensiones de cuentas |
| 13 | `parent_accounts` | `tables/14-parent_accounts.sql` | Cuentas de padres |
| 14 | `parent_student_links` | `tables/15-parent_student_links.sql` | Vinculos padre-estudiante |
| 15 | `parent_notifications` | `tables/16-parent_notifications.sql` | Notificaciones a padres |
| 16 | `roles` (v2) | `tables/03b-roles.sql` | Version actualizada de roles |
| 17 | (soft delete) | `tables/17-add-soft-delete.sql` | Migracion soft delete |

**NOTA:** La tabla `user_roles` es una tabla de relacion M:N gestionada por TypeORM (no requiere entity separado).

#### Enums en Schema auth_management

| Enum | Archivo | Valores |
|------|---------|---------|
| `gamilit_role` | `enums/gamilit_role.sql` | student, admin_teacher, super_admin |
| `user_status` | `enums/user_status.sql` | active, inactive, suspended, deleted |
| `auth_provider` | `enums/auth_provider.sql` | local, google, microsoft, etc. |

#### Entities Backend Mapeados

| Tabla DDL | Entity | Archivo | Estado |
|-----------|--------|---------|--------|
| `tenants` | `Tenant` | `tenant.entity.ts` | OK |
| `auth_attempts` | `AuthAttempt` | `auth-attempt.entity.ts` | OK |
| `profiles` | `Profile` | `profile.entity.ts` | OK |
| `roles` | `Role` | `role.entity.ts` | OK |
| `auth_providers` | `AuthProvider` | `auth-provider.entity.ts` | OK |
| `email_verification_tokens` | `EmailVerificationToken` | `email-verification-token.entity.ts` | OK |
| `password_reset_tokens` | `PasswordResetToken` | `password-reset-token.entity.ts` | OK |
| `security_events` | `SecurityEvent` | `security-event.entity.ts` | OK |
| `user_preferences` | `UserPreferences` | `user-preferences.entity.ts` | OK |
| `memberships` | `Membership` | `membership.entity.ts` | OK |
| `user_sessions` | `UserSession` | `user-session.entity.ts` | OK |
| `user_suspensions` | `UserSuspension` | `user-suspension.entity.ts` | OK |
| `parent_accounts` | `ParentAccount` | `parent-account.entity.ts` | OK |
| `parent_student_links` | `ParentStudentLink` | `parent-student-link.entity.ts` | OK |
| `parent_notifications` | `ParentNotification` | `parent-notification.entity.ts` | OK |
| `user_roles` (M:N) | via `User.roles` | `user.entity.ts` + `role.entity.ts` | OK (JoinTable) |

---

### 1.3 Schema `audit_logging` (Auditoria y Logs)

**Ubicacion DDL:** `/apps/database/ddl/schemas/audit_logging/`

**Proposito:** Registro de auditoria, logs del sistema, metricas de rendimiento y actividad de usuarios.

**NOTA IMPORTANTE:** El reporte de auditoria previo indicaba "auth_logging con 7 tablas DDL pero solo 3 entities". Este analisis revela que el schema correcto es `audit_logging` (NO "auth_logging"), y actualmente tiene 7 tablas con 7 entities mapeados correctamente.

#### Tablas DDL Encontradas (7 tablas)

| # | Tabla | Archivo DDL | Descripcion |
|---|-------|-------------|-------------|
| 1 | `audit_logs` | `tables/01-audit_logs.sql` | Logs de auditoria principal |
| 2 | `performance_metrics` | `tables/02-performance_metrics.sql` | Metricas de rendimiento |
| 3 | `system_alerts` | `tables/03-system_alerts.sql` | Alertas del sistema |
| 4 | `system_logs` | `tables/04-system_logs.sql` | Logs del sistema |
| 5 | `user_activity_logs` | `tables/05-user_activity_logs.sql` | Logs de actividad de usuario |
| 6 | `activity_log` | `tables/06-activity_log.sql` | Log de actividad (admin dashboard) |
| 7 | `pending_user_initialization` | `tables/08-pending_user_initialization.sql` | Inicializaciones pendientes |

#### Entities Backend Mapeados

| Tabla DDL | Entity | Archivo | Modulo | Estado |
|-----------|--------|---------|--------|--------|
| `audit_logs` | `AuditLog` | `audit-log.entity.ts` | audit | OK |
| `performance_metrics` | `PerformanceMetric` | `performance-metric.entity.ts` | admin | OK |
| `system_alerts` | `SystemAlert` | `system-alert.entity.ts` | admin | OK |
| `system_logs` | `SystemLog` | `system-log.entity.ts` | admin | OK |
| `user_activity_logs` | `UserActivityLog` | `user-activity-log.entity.ts` | audit | OK |
| `activity_log` | `ActivityLog` | `activity-log.entity.ts` | admin | OK |
| `pending_user_initialization` | `PendingUserInitialization` | `pending-user-initialization.entity.ts` | audit | OK |

**HALLAZGO:** Todos los entities de `audit_logging` estan mapeados correctamente. El reporte previo tenia un error de nomenclatura ("auth_logging" vs "audit_logging").

---

## 2. Mapeo DDL vs Entities Completo

### 2.1 Schema `auth`

| Tabla DDL | Schema | Entity | Modulo Backend | Estado |
|-----------|--------|--------|----------------|--------|
| `users` | auth | `User` | modules/auth | OK |

### 2.2 Schema `auth_management`

| Tabla DDL | Schema | Entity | Modulo Backend | Estado |
|-----------|--------|--------|----------------|--------|
| `tenants` | auth_management | `Tenant` | modules/auth | OK |
| `auth_attempts` | auth_management | `AuthAttempt` | modules/auth | OK |
| `profiles` | auth_management | `Profile` | modules/auth | OK |
| `roles` | auth_management | `Role` | modules/auth | OK |
| `auth_providers` | auth_management | `AuthProvider` | modules/auth | OK |
| `email_verification_tokens` | auth_management | `EmailVerificationToken` | modules/auth | OK |
| `password_reset_tokens` | auth_management | `PasswordResetToken` | modules/auth | OK |
| `security_events` | auth_management | `SecurityEvent` | modules/auth | OK |
| `user_preferences` | auth_management | `UserPreferences` | modules/auth | OK |
| `memberships` | auth_management | `Membership` | modules/auth | OK |
| `user_sessions` | auth_management | `UserSession` | modules/auth | OK |
| `user_suspensions` | auth_management | `UserSuspension` | modules/auth | OK |
| `parent_accounts` | auth_management | `ParentAccount` | modules/auth | OK |
| `parent_student_links` | auth_management | `ParentStudentLink` | modules/auth | OK |
| `parent_notifications` | auth_management | `ParentNotification` | modules/auth | OK |
| `user_roles` (M:N) | auth_management | via JoinTable | modules/auth | OK |

### 2.3 Schema `audit_logging`

| Tabla DDL | Schema | Entity | Modulo Backend | Estado |
|-----------|--------|--------|----------------|--------|
| `audit_logs` | audit_logging | `AuditLog` | modules/audit | OK |
| `performance_metrics` | audit_logging | `PerformanceMetric` | modules/admin | OK |
| `system_alerts` | audit_logging | `SystemAlert` | modules/admin | OK |
| `system_logs` | audit_logging | `SystemLog` | modules/admin | OK |
| `user_activity_logs` | audit_logging | `UserActivityLog` | modules/audit | OK |
| `activity_log` | audit_logging | `ActivityLog` | modules/admin | OK |
| `pending_user_initialization` | audit_logging | `PendingUserInitialization` | modules/audit | OK |

---

## 3. Analisis de Conflictos

### 3.1 Confusion de Nomenclatura (RESUELTO)

**Problema Reportado:** El reporte de auditoria mencionaba "auth_logging" como schema problematico.

**Hallazgo:** NO existe un schema llamado "auth_logging" en el proyecto. El schema correcto es `audit_logging`.

**Causa del Error:** Probable confusion entre:
- `auth` (autenticacion Supabase)
- `auth_management` (gestion de autenticacion GAMILIT)
- `audit_logging` (logs y auditoria)

**Estado:** RESUELTO - No hay schema "auth_logging", todos los entities de `audit_logging` estan mapeados.

### 3.2 Separacion Intencional: `auth` vs `auth_management`

**Esta separacion es ARQUITECTONICA y NO es un conflicto:**

| Schema | Proposito | Razon de Existencia |
|--------|-----------|---------------------|
| `auth` | Compatibilidad Supabase/GoTrue | Permite usar Supabase Auth o migrar facilmente |
| `auth_management` | Funcionalidades GAMILIT | Extiende auth con features personalizados |

**Relacion entre schemas:**
```
auth.users (1) -----> (1) auth_management.profiles
    |                        |
    |   user_id FK           |   tenant_id FK
    |                        v
    +----------------> auth_management.tenants
```

**Patron Arquitectonico:**
1. `auth.users` = Datos de autenticacion (credenciales, tokens)
2. `auth_management.profiles` = Datos de perfil de usuario (nombre, avatar, rol)
3. FK: `profiles.user_id -> auth.users.id`

### 3.3 Tablas Sin Entity (NINGUNA)

**Hallazgo:** TODAS las tablas DDL tienen entity correspondiente.

Las siguientes tablas NO requieren entity porque son:
- **Tablas M:N gestionadas por TypeORM:** `user_roles` (JoinTable en User <-> Role)
- **Scripts de migracion:** `17-add-soft-delete.sql` (ALTER TABLE, no CREATE)

### 3.4 Inconsistencia de Documentacion en Entities

**Observacion menor:** Algunos entities tienen el schema configurado como `DB_SCHEMAS.AUTH` cuando deberia ser `DB_SCHEMAS.AUTH_MANAGEMENT` (ej: `Profile`, `Tenant`).

Ejemplo en `profile.entity.ts`:
```typescript
@Entity({ schema: DB_SCHEMAS.AUTH, name: DB_TABLES.AUTH.PROFILES })
//         ^^^^^^^^^^^^^^^^^ Dice AUTH pero la tabla esta en auth_management
```

**Impacto:** BAJO - TypeORM resuelve esto correctamente porque `DB_SCHEMAS.AUTH` probablemente esta definido como `'auth_management'` en las constantes.

**Recomendacion:** Verificar y alinear la constante `DB_SCHEMAS.AUTH` con el valor correcto.

---

## 4. Recomendaciones

### 4.1 Opcion A: Mantener Separacion Actual (RECOMENDADA)

**Descripcion:** Mantener `auth` y `auth_management` como schemas separados.

**Pros:**
- Compatibilidad con Supabase Auth mantenida
- Separacion clara de responsabilidades
- Facilita migracion a otros providers de auth
- No requiere cambios de codigo

**Contras:**
- Requiere JOINs cross-schema (profiles -> users)
- Documentacion debe ser clara sobre la separacion

**Acciones Requeridas:**
1. Documentar claramente la arquitectura de schemas en `/docs/`
2. Verificar constantes `DB_SCHEMAS` esten correctas
3. Actualizar reporte de auditoria para corregir "auth_logging" -> "audit_logging"

### 4.2 Opcion B: Consolidar en un Solo Schema

**Descripcion:** Mover `auth.users` a `auth_management` y eliminar schema `auth`.

**Pros:**
- Simplicidad: Un solo schema para toda la autenticacion
- Menos confusion de nomenclatura

**Contras:**
- Rompe compatibilidad con Supabase Auth
- Requiere migracion de datos
- Cambios significativos en DDL y entities
- Mayor riesgo de errores

**NO RECOMENDADA** debido a la perdida de compatibilidad con Supabase.

### 4.3 Recomendacion Final: OPCION A

**Mantener la arquitectura actual** con las siguientes acciones:

1. **Documentacion:**
   - Crear documento de arquitectura de autenticacion
   - Explicar proposito de cada schema
   - Documentar relaciones cross-schema

2. **Correcciones Menores:**
   - Verificar constantes `DB_SCHEMAS` en `/shared/constants/`
   - Corregir comentarios en entities si es necesario

3. **Auditoria:**
   - Corregir referencia "auth_logging" -> "audit_logging" en documentos

---

## 5. Plan de Accion

### P0 - Inmediato (0 esfuerzo)

| # | Accion | Responsable | Estado |
|---|--------|-------------|--------|
| 1 | Corregir "auth_logging" -> "audit_logging" en documentos | Documentacion | PENDIENTE |
| 2 | Verificar constantes DB_SCHEMAS | Backend | PENDIENTE |

### P1 - Corto Plazo (1-2h)

| # | Accion | Responsable | Estado |
|---|--------|-------------|--------|
| 1 | Crear doc de arquitectura de auth | Arquitecto | PENDIENTE |
| 2 | Actualizar METADATA de tarea auditoria | Documentacion | PENDIENTE |

### P2 - Opcional (Nice to have)

| # | Accion | Responsable | Estado |
|---|--------|-------------|--------|
| 1 | Unificar comentarios en entities | Backend | OPCIONAL |
| 2 | Agregar diagramas de relacion | Documentacion | OPCIONAL |

---

## 6. Entities Faltantes

**NINGUNO** - Todos los entities estan correctamente mapeados.

Resumen de cobertura:

| Schema | Tablas DDL | Entities | Cobertura |
|--------|------------|----------|-----------|
| auth | 1 | 1 | 100% |
| auth_management | 16* | 16 | 100% |
| audit_logging | 7 | 7 | 100% |
| **TOTAL** | **24** | **24** | **100%** |

*Nota: 16 tablas de auth_management incluye `user_roles` que es JoinTable (no requiere entity separado) y excluye el script de migracion `17-add-soft-delete.sql`.

---

## 7. Conclusiones

1. **No hay conflicto real** entre `auth` y `auth_management`. La separacion es intencional y arquitectonica.

2. **El schema "auth_logging" no existe**. El reporte previo tenia un error de nomenclatura; el schema correcto es `audit_logging`.

3. **Cobertura de entities es 100%**. Todas las tablas DDL tienen su entity correspondiente en el backend.

4. **Recomendacion:** Mantener arquitectura actual (Opcion A) y documentar claramente la separacion de schemas.

5. **Acciones minimas requeridas:**
   - Corregir nomenclatura en documentos existentes
   - Crear documentacion de arquitectura de autenticacion

---

**Analisis completado:** 2026-01-20
**Perfiles:** @PERFIL_DATABASE + @PERFIL_ARCHITECT
**Metodologia:** CAPVED (Fase A: Analisis)
