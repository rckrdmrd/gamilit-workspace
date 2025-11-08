# Requerimientos Admin Portal - Monitoreo y Sistema

**Proyecto:** Gamilit Platform
**Portal:** Admin
**Archivo original:** REQUERIMIENTOS-ADMIN-PORTAL.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Tabla de Contenidos

1. [Monitoreo y Sistema](#monitoreo-y-sistema)
2. [Requerimientos No Funcionales](#requerimientos-no-funcionales)
3. [Matriz de Permisos](#matriz-de-permisos)
4. [Reglas de Negocio](#reglas-de-negocio)
5. [Casos de Uso](#casos-de-uso)
6. [Referencias](#referencias)

---

## Monitoreo y Sistema

### RF-004: Monitoreo y Sistema

**Prioridad:** ALTA
**Historia:** HU-EP010-04
**Story Points:** 16 SP

#### RF-004.1: Health Check del Sistema
- **Descripción:** Monitorear salud del sistema en tiempo real
- **Criterios:**
  - Métricas incluidas:
    - CPU usage (%)
    - Memory usage (%)
    - Disk usage (%)
    - Database connections (activas/máximo)
    - Redis status (connected/disconnected)
    - Uptime (segundos)
  - Alertas automáticas: CPU > 80%, Memory > 90%, Disk > 85%
  - Response time < 200ms (no debe depender de BD lenta)
  - Usar Prometheus metrics si está disponible
- **Endpoint:** GET /api/admin/system/health

#### RF-004.2: Listado de Usuarios (Sistema)
- **Descripción:** Endpoint alternativo de gestión de usuarios enfocado en sistema
- **Criterios:**
  - Funcionalidad similar a GET /api/admin/users
  - Incluir métricas de sistema: sesiones activas, último login, device info
  - Filtros avanzados
- **Endpoint:** GET /api/admin/system/users

#### RF-004.3: Actualización de Rol
- **Descripción:** Cambiar rol de usuario (promote/demote)
- **Criterios:**
  - Roles disponibles: student, teacher, admin, super_admin
  - Validar permisos para asignar rol
  - Solo super_admin puede promover a super_admin
  - Invalidar sesiones activas del usuario
  - Notificar al usuario por email
  - Registro en audit log con old_role y new_role
- **Endpoint:** PATCH /api/admin/system/users/:id/role

#### RF-004.4: Actualización de Status
- **Descripción:** Cambiar status de usuario (active/inactive/suspended)
- **Criterios:**
  - Status disponibles: active, inactive, suspended
  - Si suspended, requiere reason
  - Invalidar sesiones activas si suspended/inactive
  - Notificar al usuario por email
  - Registro en audit log
- **Endpoint:** PATCH /api/admin/system/users/:id/status

#### RF-004.5: Logs del Sistema
- **Descripción:** Consultar logs del sistema con filtros
- **Criterios:**
  - Niveles de log: error, warn, info, debug
  - Filtros por: level, module, date range, user_id
  - Búsqueda por texto en message
  - Paginación (25, 50, 100, 200 items)
  - Ordenamiento por timestamp (descendente)
  - Información: timestamp, level, module, message, stack_trace, user_id, request_id
  - Real-time logs opcional (WebSocket)
- **Endpoint:** GET /api/admin/system/logs

#### RF-004.6: Modo de Mantenimiento
- **Descripción:** Activar/desactivar modo de mantenimiento del sistema
- **Criterios:**
  - Campos: is_maintenance_mode (boolean), maintenance_message (texto personalizado)
  - Cuando activo: bloquear acceso a todos los usuarios excepto super_admin
  - Mostrar página de mantenimiento con mensaje personalizado
  - Registrar started_by, started_at, ended_at
  - Confirmación obligatoria
  - Registro en audit log
- **Endpoint:** POST /api/admin/system/maintenance

#### RF-004.7: Estadísticas del Sistema
- **Descripción:** Dashboard con estadísticas generales del sistema
- **Criterios:**
  - Métricas incluidas:
    - Total de usuarios (por rol)
    - Usuarios activos hoy/esta semana/este mes
    - Submissions hoy/esta semana/este mes
    - Ejercicios completados hoy/esta semana/este mes
    - Response time promedio (p50, p95, p99)
    - Error rate (%)
    - Top 10 ejercicios más populares
    - Top 10 usuarios más activos
  - Filtros por: date range
  - Cache de 5 minutos (TTL)
  - Formato para gráficas (Recharts compatible)
- **Endpoint:** GET /api/admin/system/statistics

---

## Requerimientos No Funcionales

### RNF-001: Seguridad

**Prioridad:** CRÍTICA

#### RNF-001.1: Autenticación y Autorización
- **Requisito:** Solo usuarios con rol 'super_admin' pueden acceder al Admin Portal
- **Implementación:**
  - Middleware `requireSuperAdmin` en todas las rutas admin
  - Verificación de JWT válido + role='super_admin'
  - Status 403 Forbidden si rol incorrecto
  - No exponer información de error detallada

#### RNF-001.2: Rate Limiting
- **Requisito:** Rate limiting estricto para prevenir abuso
- **Implementación:**
  - 30 requests por minuto por usuario super_admin
  - Más restrictivo que usuarios normales (100 req/min)
  - Headers de rate limit en response (X-RateLimit-Remaining, X-RateLimit-Reset)
  - Status 429 Too Many Requests cuando excede límite

#### RNF-001.3: Audit Logging
- **Requisito:** Todas las acciones admin deben registrarse automáticamente
- **Implementación:**
  - Middleware `auditAdminAction` en todas las rutas admin
  - Registrar en tabla `admin_audit_log`:
    - admin_user_id
    - action (ej. 'user.suspend', 'org.create')
    - resource_type (ej. 'user', 'organization')
    - resource_id
    - old_values (JSONB)
    - new_values (JSONB)
    - ip_address
    - user_agent
    - timestamp
  - Retention policy: 2 años mínimo (cumplimiento regulatorio)
  - Archiving automático de logs > 1 año

#### RNF-001.4: Input Validation
- **Requisito:** Validación exhaustiva de inputs para prevenir inyecciones
- **Implementación:**
  - Usar Joi o Zod para validación de schemas
  - Sanitización de inputs (trim, escape HTML)
  - Validación de tipos de datos
  - Validación de rangos (ej. pagination limits)
  - Error messages claros pero sin exponer detalles internos

#### RNF-001.5: IP Whitelisting (Opcional)
- **Requisito:** Restringir acceso a IPs específicas para super admins
- **Implementación:**
  - Configuración de IPs permitidas en variables de entorno
  - Middleware de verificación de IP
  - Status 403 si IP no está en whitelist
  - Logging de intentos de acceso desde IPs no autorizadas

---

### RNF-002: Performance

**Prioridad:** ALTA

#### RNF-002.1: Response Time
- **Requisito:** Response time rápido para buena UX
- **Métricas:**
  - Response time promedio: < 150ms
  - Response time p95: < 300ms
  - Response time p99: < 500ms
  - Health endpoint: < 200ms (no depender de BD)

#### RNF-002.2: Paginación
- **Requisito:** Paginación obligatoria en todos los listados
- **Implementación:**
  - Límite máximo: 100 items por página
  - Límites predeterminados: 10, 25, 50, 100
  - Cursor-based pagination para grandes datasets
  - Información de paginación en response: total, page, limit, hasMore

#### RNF-002.3: Caching
- **Requisito:** Cache de datos estáticos para reducir carga en BD
- **Implementación:**
  - Statistics: TTL 5 minutos
  - Organization details: TTL 10 minutos
  - User details: TTL 5 minutos
  - Invalidación de cache al actualizar datos

#### RNF-002.4: Database Optimization
- **Requisito:** Queries optimizadas con indexes apropiados
- **Implementación:**
  - Indexes en:
    - admin_audit_log(admin_user_id, created_at)
    - admin_audit_log(resource_type, resource_id)
    - organizations(subscription_tier, subscription_status)
    - users(role, status)
    - content_moderation_queue(status, created_at)

---

### RNF-006: Confiabilidad

**Prioridad:** CRÍTICA

#### RNF-006.1: Disponibilidad
- **Requisito:** Alta disponibilidad del Admin Portal
- **Métricas:**
  - Uptime: > 99.9%
  - Error rate: < 0.05%

#### RNF-006.2: Backup y Recovery
- **Requisito:** Backup automático de datos críticos
- **Implementación:**
  - Backup diario de base de datos
  - Backup de audit logs
  - Retention: 30 días
  - Recovery time objective (RTO): < 4 horas

#### RNF-006.3: Monitoring y Alertas
- **Requisito:** Monitoreo 24/7 con alertas automáticas
- **Implementación:**
  - Health checks cada 1 minuto
  - Alertas por email/SMS si:
    - Error rate > 1%
    - Response time p95 > 500ms
    - CPU > 90%
    - Memory > 95%
    - Disk > 90%

---

## Matriz de Permisos

### Permisos de System Monitoring

| Acción | super_admin | content_moderator | system_operator | admin | teacher | student |
|--------|-------------|-------------------|-----------------|-------|---------|---------|
| Ver health check | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Actualizar rol usuario | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Actualizar status usuario | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Ver logs sistema | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Modo mantenimiento | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Ver estadísticas | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Ver audit log | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Exportar audit log | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |

### Nota sobre Permisos
- **system_operator:** Solo acceso a System Monitoring (health, logs, maintenance)
- **super_admin:** Acceso completo a todas las funciones del Admin Portal

---

## Reglas de Negocio

### RN-004: Monitoreo y Sistema

#### RN-004.1: Health Check
- No debe depender de base de datos lenta (usar Prometheus)
- Response time < 200ms
- Alertas automáticas si CPU > 80%, Memory > 90%, Disk > 85%

#### RN-004.2: Modo de Mantenimiento
- Bloquear acceso a todos los usuarios excepto super_admin
- Mostrar mensaje personalizado
- Confirmación obligatoria antes de activar

#### RN-004.3: Actualización de Rol
- Solo super_admin puede promover a super_admin
- Invalidar sesiones activas al cambiar rol
- Notificar usuario por email

---

### RN-005: Audit Logging

#### RN-005.1: Registro Obligatorio
- Todas las acciones admin deben registrarse en admin_audit_log
- Información requerida: admin_user_id, action, resource_type, resource_id, old_values, new_values, ip_address, user_agent, timestamp
- No permitir eliminar o modificar audit logs

#### RN-005.2: Retention Policy
- Retención mínima: 2 años (cumplimiento regulatorio)
- Archiving automático de logs > 1 año a storage económico
- Acceso a logs archivados bajo demanda

---

## Casos de Uso

### CU-ADM-004: Monitorear Salud del Sistema

**Actor Principal:** Super Admin o System Operator
**Objetivo:** Verificar salud del sistema y detectar problemas

**Precondiciones:**
- Super admin autenticado
- Sistema de monitoreo funcionando

**Flujo Principal:**
1. Super admin navega a "System Monitoring"
2. Sistema muestra dashboard de health con métricas en tiempo real:
   - CPU usage (%)
   - Memory usage (%)
   - Disk usage (%)
   - Database connections (activas/máximo)
   - Redis status (connected/disconnected)
   - Uptime (días, horas)
   - Request rate (req/s)
   - Error rate (%)
3. Sistema actualiza métricas cada 30 segundos (auto-refresh)
4. Super admin revisa métricas verificando:
   - CPU < 80%
   - Memory < 90%
   - Disk < 85%
   - Database connections no saturadas
   - Redis conectado
   - Error rate < 1%
5. Sistema muestra indicadores visuales:
   - Verde: Todo normal
   - Amarillo: Warning (ej. CPU 70-80%)
   - Rojo: Critical (ej. CPU > 80%)
6. Si todas las métricas están en verde, super admin confirma sistema saludable
7. Super admin cierra dashboard

**Postcondiciones:**
- Super admin informado de estado del sistema
- Ningún cambio en sistema

**Flujos Alternativos:**
- **A1 - Alerta detectada:** Si métrica en rojo:
  1. Sistema muestra alerta prominente
  2. Super admin investiga causa (ver logs)
  3. Super admin toma acción correctiva (ej. reiniciar servicio, escalar recursos)
  4. Super admin verifica que métrica vuelve a verde
- **A2 - Activar modo mantenimiento:** Si problema crítico requiere intervención:
  1. Super admin hace clic en "Enable Maintenance Mode"
  2. Sistema solicita maintenance message
  3. Super admin ingresa mensaje personalizado
  4. Sistema bloquea acceso a usuarios (excepto super_admins)
  5. Super admin realiza mantenimiento
  6. Super admin desactiva maintenance mode al terminar

---

## 🔗 Referencias a Implementación

### Database
🗄️ **Tablas:**
- `system_configuration.system_logs` → `apps/database/ddl/schemas/system_configuration/tables/system_logs.sql`
  - **Propósito:** Logs del sistema (error, warn, info, debug)
  - **Columnas clave:** `id`, `timestamp`, `level`, `module`, `message`, `stack_trace`, `user_id`, `request_id`
- `system_configuration.system_health` → `apps/database/ddl/schemas/system_configuration/tables/system_health.sql`
  - **Propósito:** Métricas de salud del sistema (CPU, memory, disk, DB connections)
  - **Columnas clave:** `id`, `timestamp`, `cpu_usage`, `memory_usage`, `disk_usage`, `db_connections_active`, `redis_status`
- `system_configuration.maintenance_mode` → `apps/database/ddl/schemas/system_configuration/tables/maintenance_mode.sql`
  - **Propósito:** Estado de modo de mantenimiento
  - **Columnas clave:** `id`, `is_active`, `maintenance_message`, `started_by`, `started_at`, `ended_at`

🗄️ **ENUMs:**
- `log_level` → `apps/database/ddl/00-prerequisites.sql` (error, warn, info, debug)

🗄️ **Indexes:**
- `system_logs` índices en: (timestamp DESC), (level), (module), (user_id)
- `system_health` índices en: (timestamp DESC)

### Backend
💻 **Controllers:**
- `apps/backend/src/modules/admin/controllers/system-monitoring.controller.ts`
  - **Endpoints implementados:**
    - GET /api/admin/system/health - Health check del sistema
    - GET /api/admin/system/users - Listado de usuarios (alternativo)
    - PATCH /api/admin/system/users/:id/role - Actualizar rol
    - PATCH /api/admin/system/users/:id/status - Actualizar status
    - GET /api/admin/system/logs - Consultar logs del sistema
    - POST /api/admin/system/maintenance - Activar/desactivar modo mantenimiento
    - GET /api/admin/system/statistics - Dashboard de estadísticas

💻 **Services:**
- `apps/backend/src/modules/admin/services/system-health.service.ts`
  - **Métodos:** getHealthCheck(), getCPUUsage(), getMemoryUsage(), getDiskUsage(), getDBConnectionsStatus(), getRedisStatus()
  - **Integración:** Prometheus metrics si disponible
- `apps/backend/src/modules/admin/services/system-logs.service.ts`
  - **Métodos:** getSystemLogs(), searchLogs(), exportLogsCSV()
  - **Filtros:** level, module, date_range, user_id, search_text
- `apps/backend/src/modules/admin/services/maintenance-mode.service.ts`
  - **Métodos:** activateMaintenanceMode(), deactivateMaintenanceMode(), getMaintenanceStatus()
  - **Efecto:** Bloquea acceso a usuarios no super_admin
- `apps/backend/src/modules/admin/services/system-statistics.service.ts`
  - **Métodos:** getSystemStatistics(), getUserStatistics(), getUsageStatistics()
  - **Cache:** Redis con TTL de 5 minutos
- `apps/backend/src/modules/admin/services/role-management.service.ts`
  - **Métodos:** updateUserRole(), validateRoleChange()
  - **Validaciones:** Solo super_admin puede promover a super_admin

💻 **DTOs:**
- `apps/backend/src/modules/admin/dto/update-role.dto.ts`
  - **Validación:** new_role enum (student, teacher, admin, super_admin)
- `apps/backend/src/modules/admin/dto/update-status.dto.ts`
  - **Validación:** new_status enum, reason (si suspended)
- `apps/backend/src/modules/admin/dto/system-logs-query.dto.ts`
  - **Filtros:** level, module, start_date, end_date, user_id, search, page, limit
- `apps/backend/src/modules/admin/dto/maintenance-mode.dto.ts`
  - **Validación:** is_maintenance_mode boolean, maintenance_message texto

💻 **Middlewares:**
- `apps/backend/src/shared/middleware/maintenance-mode.middleware.ts`
  - **Propósito:** Bloquear acceso si maintenance mode activo (excepto super_admin)
  - **Respuesta:** 503 Service Unavailable con mensaje personalizado

💻 **Utils:**
- `apps/backend/src/shared/utils/system-metrics.util.ts`
  - **Métodos:** getCPUUsage(), getMemoryUsage(), getDiskUsage()
  - **Library:** node-os-utils o similar
- `apps/backend/src/shared/utils/prometheus-exporter.util.ts`
  - **Propósito:** Exportar métricas a Prometheus
  - **Métricas:** response_time, error_rate, active_users

💻 **Logging:**
- `apps/backend/src/shared/logging/winston-logger.ts`
  - **Library:** Winston
  - **Levels:** error, warn, info, debug
  - **Transports:** Console, File, Database (system_logs table)

### Frontend
🎨 **Componentes System Monitoring:**
- `apps/frontend/src/features/admin/components/SystemHealthDashboard.tsx`
  - **Propósito:** Dashboard principal con métricas en tiempo real (CPU, memory, disk, DB, Redis)
- `apps/frontend/src/features/admin/components/HealthMetricCard.tsx`
  - **Propósito:** Card de métrica individual con alertas si excede thresholds
- `apps/frontend/src/features/admin/components/SystemLogsViewer.tsx`
  - **Propósito:** Tabla de logs con filtros (level, module, date range, search)
- `apps/frontend/src/features/admin/components/LogEntryRow.tsx`
  - **Propósito:** Row de log con color según level, expandible para stack trace

🎨 **Componentes User Management (System):**
- `apps/frontend/src/features/admin/components/UpdateRoleModal.tsx`
  - **Propósito:** Modal para cambiar rol de usuario con confirmación
- `apps/frontend/src/features/admin/components/UpdateStatusModal.tsx`
  - **Propósito:** Modal para cambiar status con campo reason (si suspended)

🎨 **Componentes Maintenance:**
- `apps/frontend/src/features/admin/components/MaintenanceModeToggle.tsx`
  - **Propósito:** Toggle para activar/desactivar modo mantenimiento
- `apps/frontend/src/features/admin/components/MaintenanceModeModal.tsx`
  - **Propósito:** Modal con campo maintenance_message personalizado
- `apps/frontend/src/features/admin/components/MaintenanceModePage.tsx`
  - **Propósito:** Página mostrada a usuarios cuando sistema en mantenimiento

🎨 **Componentes Statistics:**
- `apps/frontend/src/features/admin/components/SystemStatisticsDashboard.tsx`
  - **Propósito:** Dashboard con estadísticas generales (usuarios, submissions, ejercicios)
- `apps/frontend/src/features/admin/components/UsageChart.tsx`
  - **Propósito:** Gráfica de uso (Recharts) - usuarios activos por día/semana/mes
- `apps/frontend/src/features/admin/components/ResponseTimeChart.tsx`
  - **Propósito:** Gráfica de response times (p50, p95, p99)
- `apps/frontend/src/features/admin/components/TopExercisesTable.tsx`
  - **Propósito:** Tabla de top 10 ejercicios más populares
- `apps/frontend/src/features/admin/components/TopUsersTable.tsx`
  - **Propósito:** Tabla de top 10 usuarios más activos

🎨 **Hooks:**
- `apps/frontend/src/features/admin/hooks/useSystemHealth.ts`
  - **Métodos:** useGetSystemHealth (polling cada 10 segundos)
- `apps/frontend/src/features/admin/hooks/useSystemLogs.ts`
  - **Métodos:** useGetSystemLogs (con filtros), useExportLogsCSV
- `apps/frontend/src/features/admin/hooks/useMaintenanceMode.ts`
  - **Métodos:** useGetMaintenanceStatus, useActivateMaintenanceMode, useDeactivateMaintenanceMode
- `apps/frontend/src/features/admin/hooks/useSystemStatistics.ts`
  - **Métodos:** useGetSystemStatistics (con cache)
- `apps/frontend/src/features/admin/hooks/useRoleManagement.ts`
  - **Métodos:** useUpdateRole, useUpdateStatus

🎨 **Types:**
- `apps/frontend/src/types/system-monitoring.types.ts`
  - **Interfaces:** SystemHealth, SystemLog, MaintenanceMode, SystemStatistics
  - **Enums:** LogLevel
- `apps/frontend/src/types/system-statistics.types.ts`
  - **Interfaces:** UsageStatistics, ResponseTimeMetrics, TopExercise, TopUser

🎨 **Services:**
- `apps/frontend/src/services/api/admin/system-monitoring.service.ts`
  - **Métodos API:** getSystemHealth(), getSystemLogs(), activateMaintenanceMode(), deactivateMaintenanceMode()
  - **Métodos statistics:** getSystemStatistics()
  - **Métodos user management:** updateUserRole(), updateUserStatus()

🎨 **Utils:**
- `apps/frontend/src/utils/health-check-helpers.ts`
  - **Métodos:** getHealthStatusColor(), getHealthStatusIcon(), isMetricHealthy()
- `apps/frontend/src/utils/log-formatters.ts`
  - **Métodos:** formatLogLevel(), formatTimestamp(), parseStackTrace()

🎨 **WebSocket (Optional):**
- `apps/frontend/src/services/websocket/system-logs.ws.ts`
  - **Propósito:** Real-time logs streaming (WebSocket)

---

## Referencias

### Documentación de Épica
- **README Épica:** `/docs/04-planificacion/epicas/EP010-admin-portal/README.md`
- **Historia HU-EP010-04:** `/docs/04-planificacion/epicas/EP010-admin-portal/historias/HU-EP010-04-system-monitoring.md`
- **API Reference:** `/docs/02-especificaciones-tecnicas/apis/API-REFERENCE.md` (líneas 2131-2187)
- **Database Schema:** `/docs/03-desarrollo/base-de-datos/schemas/`

### Endpoints API (7 endpoints)
1. GET /api/admin/system/health
2. GET /api/admin/system/users
3. PATCH /api/admin/system/users/:id/role
4. PATCH /api/admin/system/users/:id/status
5. GET /api/admin/system/logs
6. POST /api/admin/system/maintenance
7. GET /api/admin/system/statistics

### Middleware Stack

Todos los endpoints admin utilizan el siguiente middleware stack:

```typescript
[
  authenticateJWT,        // Verifica JWT válido
  requireSuperAdmin,      // Verifica role = 'super_admin'
  adminRateLimit,         // 30 req/min
  auditAdminAction        // Log automático de acción
]
```

---

**Última actualización:** 2025-11-01
**Versión:** 2.0 (RFC-0001)
**Estado:** APROBADO
