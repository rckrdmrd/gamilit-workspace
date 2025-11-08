# Requerimientos Admin Portal - Gestión de Usuarios

**Proyecto:** Gamilit Platform
**Portal:** Admin
**Archivo original:** REQUERIMIENTOS-ADMIN-PORTAL.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Tabla de Contenidos

1. [Gestión de Usuarios](#gestión-de-usuarios)
2. [Matriz de Permisos](#matriz-de-permisos)
3. [Reglas de Negocio](#reglas-de-negocio)
4. [Casos de Uso](#casos-de-uso)
5. [Referencias](#referencias)

---

## Gestión de Usuarios

### RF-001: Gestión de Usuarios

**Prioridad:** CRÍTICA
**Historia:** HU-EP010-01
**Story Points:** 20 SP

#### RF-001.1: Listado de Usuarios
- **Descripción:** Super admin debe poder listar todos los usuarios del sistema con filtros avanzados
- **Criterios:**
  - Filtros por: rol (student, teacher, admin, super_admin), status (active, inactive, suspended), organización
  - Búsqueda por nombre, email
  - Paginación: 10, 25, 50, 100 items por página
  - Ordenamiento por: fecha de registro, última actividad, nombre
  - Información mostrada: id, nombre, email, rol, status, organización, fecha de registro, última actividad
- **Endpoint:** GET /api/admin/users

#### RF-001.2: Detalles de Usuario
- **Descripción:** Ver información completa de un usuario específico
- **Criterios:**
  - Información personal: nombre, email, fecha de nacimiento, foto de perfil
  - Información de cuenta: rol, status, fecha de registro, última actividad
  - Organizaciones asociadas y rol en cada organización
  - Estadísticas: ejercicios completados, ML Coins, rango actual, tiempo total en plataforma
  - Historial de cambios (audit trail)
- **Endpoint:** GET /api/admin/users/:id

#### RF-001.3: Actualización de Usuario
- **Descripción:** Actualizar información de un usuario
- **Criterios:**
  - Campos editables: nombre, email, información de perfil
  - NO editable por este endpoint: rol (usar endpoint específico), password (usar reset)
  - Validación de email único
  - Registro automático en audit log
- **Endpoint:** PATCH /api/admin/users/:id

#### RF-001.4: Eliminación de Usuario
- **Descripción:** Eliminar usuario del sistema (soft delete)
- **Criterios:**
  - Soft delete: campo is_active = false
  - Preservar todos los datos para auditoría
  - No eliminar submissions, ejercicios creados, logs
  - Bloquear login inmediatamente
  - Confirmación obligatoria antes de eliminar
- **Endpoint:** DELETE /api/admin/users/:id

#### RF-001.5: Suspensión de Usuario
- **Descripción:** Suspender cuenta de usuario por violación de políticas
- **Criterios:**
  - Reason obligatorio (mínimo 10 caracteres)
  - Bloquea login inmediatamente
  - Usuario puede ver mensaje de suspensión al intentar login
  - Notificación por email al usuario
  - Registro en audit log con reason
- **Endpoint:** POST /api/admin/users/:id/suspend

#### RF-001.6: Reactivación de Usuario Suspendido
- **Descripción:** Remover suspensión de cuenta
- **Criterios:**
  - Solo aplicable a usuarios con status 'suspended'
  - Permite login inmediatamente
  - Notificación por email al usuario
  - Registro en audit log
- **Endpoint:** POST /api/admin/users/:id/unsuspend

#### RF-001.7: Activación de Usuario
- **Descripción:** Activar cuenta inactiva
- **Criterios:**
  - Cambiar status de 'inactive' a 'active'
  - Permite login inmediatamente
  - Registro en audit log
- **Endpoint:** POST /api/admin/users/:id/activate

#### RF-001.8: Desactivación de Usuario
- **Descripción:** Desactivar cuenta temporalmente
- **Criterios:**
  - Cambiar status de 'active' a 'inactive'
  - Bloquea login inmediatamente
  - No es una suspensión (sin reason)
  - Registro en audit log
- **Endpoint:** POST /api/admin/users/:id/deactivate

#### RF-001.9: Reset de Password
- **Descripción:** Forzar reset de contraseña de usuario
- **Criterios:**
  - Generar token de reset único (válido 24 horas)
  - Enviar email con link de reset
  - Invalidar sesiones activas del usuario
  - Usuario debe crear nueva contraseña
  - Registro en audit log
- **Endpoint:** POST /api/admin/users/:id/reset-password

#### RF-001.10: Log de Actividad de Usuario
- **Descripción:** Ver historial de actividad de un usuario
- **Criterios:**
  - Últimos 100 eventos
  - Tipos de eventos: login, logout, ejercicio completado, submission enviada, password cambiado
  - Información: timestamp, tipo de evento, IP address, user agent, detalles adicionales
  - Filtros por: tipo de evento, rango de fechas
  - Paginación
- **Endpoint:** GET /api/admin/users/:id/activity

---

## Matriz de Permisos

### Permisos de User Management

| Acción | super_admin | content_moderator | system_operator | admin | teacher | student |
|--------|-------------|-------------------|-----------------|-------|---------|---------|
| Listar usuarios | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Ver detalles usuario | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Actualizar usuario | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Eliminar usuario | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Suspender usuario | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Reactivar usuario | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Reset password | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Ver activity log | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |

---

## Reglas de Negocio

### RN-001: Gestión de Usuarios

#### RN-001.1: Suspensión de Usuario
- Reason obligatorio (mínimo 10 caracteres)
- Usuario suspendido no puede hacer login
- Sesiones activas se invalidan inmediatamente
- Email de notificación obligatorio con reason
- Solo super_admin puede suspender usuarios

#### RN-001.2: Eliminación de Usuario
- Soft delete únicamente (preservar datos para auditoría)
- Confirmación obligatoria antes de eliminar
- No eliminar submissions, ejercicios creados, logs
- Usuario no puede hacer login después de eliminación

#### RN-001.3: Reset de Password
- Token de reset válido por 24 horas
- Invalidar sesiones activas del usuario
- Email obligatorio con link de reset
- Usuario debe crear nueva contraseña (no auto-generar)

---

## Casos de Uso

### CU-ADM-001: Suspender Usuario por Violación de Políticas

**Actor Principal:** Super Admin
**Objetivo:** Suspender cuenta de usuario que violó políticas de la plataforma

**Precondiciones:**
- Super admin autenticado
- Usuario existe en el sistema
- Usuario no está ya suspendido

**Flujo Principal:**
1. Super admin navega a "User Management"
2. Super admin busca usuario por nombre o email
3. Super admin selecciona usuario de la lista
4. Sistema muestra detalles completos del usuario
5. Super admin hace clic en botón "Suspend User"
6. Sistema muestra modal de confirmación solicitando reason
7. Super admin ingresa reason detallado (mínimo 10 caracteres)
8. Super admin confirma suspensión
9. Sistema valida permiso de super_admin
10. Sistema actualiza status del usuario a 'suspended'
11. Sistema registra reason y timestamp en base de datos
12. Sistema invalida todas las sesiones activas del usuario
13. Sistema registra acción en admin_audit_log
14. Sistema envía email de notificación al usuario con reason
15. Sistema muestra mensaje de éxito
16. Super admin ve status actualizado en UI

**Postcondiciones:**
- Usuario suspendido (status = 'suspended')
- Usuario no puede hacer login
- Sesiones activas invalidadas
- Email de notificación enviado
- Acción registrada en audit log

**Flujos Alternativos:**
- **A1 - Reason insuficiente:** Si reason < 10 caracteres, sistema muestra error y solicita reason más detallado
- **A2 - Usuario ya suspendido:** Sistema muestra error "Usuario ya está suspendido"
- **A3 - Fallo al enviar email:** Sistema continúa pero registra error de notificación

---

### CU-ADM-005: Investigar Actividad de Usuario

**Actor Principal:** Super Admin
**Objetivo:** Investigar actividad reciente de usuario ante reporte de comportamiento sospechoso

**Precondiciones:**
- Super admin autenticado
- Usuario existe en el sistema
- Logs de actividad disponibles

**Flujo Principal:**
1. Super admin recibe reporte de comportamiento sospechoso de usuario
2. Super admin navega a "User Management"
3. Super admin busca usuario por email
4. Super admin selecciona usuario de la lista
5. Super admin hace clic en tab "Activity Log"
6. Sistema muestra últimos 100 eventos de actividad del usuario:
   - Timestamp
   - Tipo de evento (login, logout, ejercicio completado, submission, password changed)
   - IP address
   - User agent (browser, device)
   - Detalles adicionales (ej. ejercicio_id, score)
7. Super admin aplica filtros:
   - Fecha: últimos 7 días
   - Tipo de evento: login
8. Sistema filtra eventos y muestra solo logins de última semana
9. Super admin analiza patrones:
   - IPs diferentes (posible cuenta compartida)
   - User agents diferentes (múltiples dispositivos)
   - Horarios inusuales
10. Super admin identifica múltiples logins desde IPs geográficamente dispersas
11. Super admin determina posible violación de política (cuenta compartida)
12. Super admin decide suspender cuenta temporalmente
13. Super admin ejecuta CU-ADM-001 (Suspender Usuario)

**Postcondiciones:**
- Super admin informado de actividad del usuario
- Decisión tomada basada en evidencia
- Acción correctiva aplicada si necesario

**Flujos Alternativos:**
- **A1 - Actividad normal:** Si análisis no revela comportamiento sospechoso, super admin cierra investigación sin acción
- **A2 - Exportar logs:** Si se requiere evidencia detallada:
  1. Super admin hace clic en "Export Activity Log"
  2. Sistema genera archivo CSV con todos los eventos
  3. Super admin descarga archivo para análisis offline

---

## 🔗 Referencias a Implementación

### Database
🗄️ **Tablas:**
- `auth.users` → `apps/database/ddl/schemas/auth/tables/users.sql`
  - **Propósito:** Tabla principal de usuarios con información de cuenta
  - **Columnas clave:** `id`, `email`, `full_name`, `role`, `status`, `is_active`, `last_login`, `created_at`, `updated_at`
- `auth.user_activity_log` → `apps/database/ddl/schemas/auth/tables/user_activity_log.sql`
  - **Propósito:** Registro de actividad de usuarios (logins, ejercicios, submissions)
  - **Columnas clave:** `id`, `user_id`, `event_type`, `event_details`, `ip_address`, `user_agent`, `created_at`
- `audit_logging.admin_audit_log` → `apps/database/ddl/schemas/audit_logging/tables/admin_audit_log.sql`
  - **Propósito:** Registro de auditoría de acciones administrativas
  - **Columnas clave:** `id`, `admin_id`, `action`, `target_user_id`, `reason`, `old_value`, `new_value`, `created_at`
- `auth.password_reset_tokens` → `apps/database/ddl/schemas/auth/tables/password_reset_tokens.sql`
  - **Propósito:** Tokens de reset de contraseña (válidos 24 horas)
  - **Columnas clave:** `id`, `user_id`, `token`, `expires_at`, `used_at`

🗄️ **ENUMs:**
- `user_role` → `apps/database/ddl/00-prerequisites.sql` (student, teacher, admin, super_admin, content_moderator, system_operator)
- `user_status` → `apps/database/ddl/00-prerequisites.sql` (active, inactive, suspended, deleted)
- `activity_event_type` → `apps/database/ddl/00-prerequisites.sql` (login, logout, exercise_completed, submission_created, password_changed)
- `admin_action_type` → `apps/database/ddl/00-prerequisites.sql` (user_suspended, user_unsuspended, user_deleted, user_updated, password_reset)

🗄️ **Foreign Keys:**
- `user_activity_log.user_id` → `users(id)`
- `admin_audit_log.admin_id` → `users(id)`
- `admin_audit_log.target_user_id` → `users(id)`
- `password_reset_tokens.user_id` → `users(id)`

🗄️ **Indexes:**
- `users` índices en: (email UNIQUE), (role), (status), (is_active), (last_login)
- `user_activity_log` índices en: (user_id, created_at), (event_type), (ip_address)
- `admin_audit_log` índices en: (admin_id, created_at), (target_user_id), (action)
- `password_reset_tokens` índices en: (user_id), (token UNIQUE), (expires_at)

### Backend
💻 **Controllers:**
- `apps/backend/src/modules/admin/controllers/user-management.controller.ts`
  - **Endpoints implementados:**
    - GET /api/admin/users - Listar usuarios con filtros
    - GET /api/admin/users/:id - Detalles de usuario
    - PATCH /api/admin/users/:id - Actualizar usuario
    - DELETE /api/admin/users/:id - Soft delete usuario
    - POST /api/admin/users/:id/suspend - Suspender usuario
    - POST /api/admin/users/:id/unsuspend - Reactivar usuario suspendido
    - POST /api/admin/users/:id/activate - Activar usuario inactivo
    - POST /api/admin/users/:id/deactivate - Desactivar usuario
    - POST /api/admin/users/:id/reset-password - Forzar reset de password
    - GET /api/admin/users/:id/activity - Ver log de actividad

💻 **Services:**
- `apps/backend/src/modules/admin/services/user-management.service.ts`
  - **Métodos:** listUsers(), getUserDetails(), updateUser(), deleteUser(), suspendUser(), unsuspendUser()
  - **Métodos adicionales:** activateUser(), deactivateUser(), resetPassword(), getUserActivity()
  - **Validaciones:** validateSuspendReason(), validateUniqueEmail()
- `apps/backend/src/modules/admin/services/admin-audit.service.ts`
  - **Métodos:** createAuditLog(), getAuditHistory()
  - **Propósito:** Registro automático de todas las acciones administrativas
- `apps/backend/src/modules/auth/services/session-invalidation.service.ts`
  - **Métodos:** invalidateAllUserSessions()
  - **Propósito:** Invalidar sesiones activas de usuario (al suspender, eliminar, reset password)

💻 **DTOs:**
- `apps/backend/src/modules/admin/dto/list-users-query.dto.ts`
  - **Filtros:** role, status, organization_id, search (nombre/email), page, limit, sort
- `apps/backend/src/modules/admin/dto/update-user.dto.ts`
  - **Validación:** full_name, email (unique), profile_info
- `apps/backend/src/modules/admin/dto/suspend-user.dto.ts`
  - **Validación:** reason (mínimo 10 caracteres, obligatorio)
- `apps/backend/src/modules/admin/dto/activity-log-query.dto.ts`
  - **Filtros:** event_type, start_date, end_date, page, limit

💻 **Entities:**
- `apps/backend/src/modules/auth/entities/user.entity.ts`
- `apps/backend/src/modules/auth/entities/user-activity-log.entity.ts`
- `apps/backend/src/modules/audit/entities/admin-audit-log.entity.ts`
- `apps/backend/src/modules/auth/entities/password-reset-token.entity.ts`

💻 **Guards:**
- `apps/backend/src/shared/guards/super-admin.guard.ts`
  - **Propósito:** Verifica que user.role === 'super_admin'
  - **Aplicado en:** Todos los endpoints de /api/admin/users
- `apps/backend/src/shared/guards/roles.guard.ts`
  - **Propósito:** Verificación de roles múltiples

💻 **Email Templates:**
- `apps/backend/src/modules/notifications/templates/user-suspended.email.ts`
  - **Contenido:** Notificación de suspensión con reason
- `apps/backend/src/modules/notifications/templates/password-reset.email.ts`
  - **Contenido:** Link de reset de password (válido 24 horas)
- `apps/backend/src/modules/notifications/templates/user-reactivated.email.ts`
  - **Contenido:** Notificación de reactivación de cuenta

💻 **Utils:**
- `apps/backend/src/shared/utils/password-reset-token.util.ts`
  - **Métodos:** generateResetToken(), validateResetToken()
- `apps/backend/src/shared/utils/ip-geolocation.util.ts`
  - **Métodos:** getLocationFromIP() - Para análisis de actividad sospechosa

### Frontend
🎨 **Componentes User Management:**
- `apps/frontend/src/features/admin/components/UserList.tsx`
  - **Propósito:** Lista paginada de usuarios con filtros (rol, status, org, búsqueda)
- `apps/frontend/src/features/admin/components/UserCard.tsx`
  - **Propósito:** Tarjeta de usuario con info básica y acciones rápidas
- `apps/frontend/src/features/admin/components/UserDetailsPanel.tsx`
  - **Propósito:** Panel de detalles completos del usuario con tabs (Info, Organizations, Stats, Audit)
- `apps/frontend/src/features/admin/components/SuspendUserModal.tsx`
  - **Propósito:** Modal para suspender usuario con campo reason (mínimo 10 chars)
- `apps/frontend/src/features/admin/components/ResetPasswordConfirmModal.tsx`
  - **Propósito:** Confirmación para forzar reset de password
- `apps/frontend/src/features/admin/components/ActivityLogViewer.tsx`
  - **Propósito:** Tabla de log de actividad con filtros (event_type, date range)
- `apps/frontend/src/features/admin/components/ActivityEventCard.tsx`
  - **Propósito:** Card de evento de actividad con timestamp, IP, user agent, detalles

🎨 **Componentes Audit:**
- `apps/frontend/src/features/admin/components/AuditHistoryTimeline.tsx`
  - **Propósito:** Timeline de historial de cambios administrativos
- `apps/frontend/src/features/admin/components/AuditEventBadge.tsx`
  - **Propósito:** Badge visual para tipo de acción (suspend, delete, update)

🎨 **Hooks:**
- `apps/frontend/src/features/admin/hooks/useUsers.ts`
  - **Métodos:** useGetUsers (con filtros), useGetUserDetails
- `apps/frontend/src/features/admin/hooks/useUserManagement.ts`
  - **Métodos:** useUpdateUser, useDeleteUser, useSuspendUser, useUnsuspendUser, useActivateUser, useDeactivateUser, useResetPassword
- `apps/frontend/src/features/admin/hooks/useUserActivity.ts`
  - **Métodos:** useGetUserActivity (con filtros), useExportActivityLog

🎨 **Types:**
- `apps/frontend/src/types/admin.types.ts`
  - **Interfaces:** User, UserDetails, UserActivityLog, AdminAuditLog, SuspendUserDto
  - **Enums:** UserRole, UserStatus, ActivityEventType, AdminActionType

🎨 **Services:**
- `apps/frontend/src/services/api/admin/user-management.service.ts`
  - **Métodos API:** getUsers(), getUserDetails(), updateUser(), deleteUser()
  - **Métodos acciones:** suspendUser(), unsuspendUser(), activateUser(), deactivateUser(), resetPassword()
  - **Métodos actividad:** getUserActivity(), exportActivityLogCSV()

🎨 **Utils:**
- `apps/frontend/src/utils/user-status-helpers.ts`
  - **Métodos:** getUserStatusColor(), getUserStatusIcon(), canUserLogin()
- `apps/frontend/src/utils/activity-log-formatters.ts`
  - **Métodos:** formatEventType(), formatIPAddress(), parseUserAgent()

---

## Referencias

### Documentación de Épica
- **README Épica:** `/docs/04-planificacion/epicas/EP010-admin-portal/README.md`
- **Historia HU-EP010-01:** `/docs/04-planificacion/epicas/EP010-admin-portal/historias/HU-EP010-01-user-management.md`
- **API Reference:** `/docs/02-especificaciones-tecnicas/apis/API-REFERENCE.md` (líneas 2131-2187)
- **Database Schema:** `/docs/03-desarrollo/base-de-datos/schemas/`

### Endpoints API (10 endpoints)
1. GET /api/admin/users
2. GET /api/admin/users/:id
3. PATCH /api/admin/users/:id
4. DELETE /api/admin/users/:id
5. POST /api/admin/users/:id/suspend
6. POST /api/admin/users/:id/unsuspend
7. POST /api/admin/users/:id/activate
8. POST /api/admin/users/:id/deactivate
9. POST /api/admin/users/:id/reset-password
10. GET /api/admin/users/:id/activity

---

**Última actualización:** 2025-11-01
**Versión:** 2.0 (RFC-0001)
**Estado:** APROBADO
