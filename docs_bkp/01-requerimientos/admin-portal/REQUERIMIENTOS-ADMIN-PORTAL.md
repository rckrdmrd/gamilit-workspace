# REQUERIMIENTOS: ADMIN PORTAL

**Proyecto:** Gamilit Platform
**Épica:** EP010 - Admin Portal
**Fecha:** 28 de Octubre, 2025
**Versión:** 1.0
**Estado:** DRAFT

---

## Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Requerimientos Funcionales](#requerimientos-funcionales)
3. [Requerimientos No Funcionales](#requerimientos-no-funcionales)
4. [Casos de Uso Principales](#casos-de-uso-principales)
5. [Matriz de Permisos](#matriz-de-permisos)
6. [Reglas de Negocio](#reglas-de-negocio)
7. [Endpoints API](#endpoints-api)
8. [Referencias](#referencias)

---

## Resumen Ejecutivo

El **Admin Portal** es el módulo crítico de administración del sistema GAMILIT que permite a super admins gestionar todos los aspectos operativos de la plataforma: usuarios, organizaciones, contenido y monitoreo del sistema.

### Alcance

| Aspecto | Descripción |
|---------|-------------|
| **Épica** | EP010 - Admin Portal |
| **Story Points** | 70 SP |
| **Endpoints** | 31 endpoints |
| **Historias de Usuario** | 4 historias (HU-EP010-01 a HU-EP010-04) |
| **Duración Estimada** | 2.5 semanas (5 sprints) |
| **Prioridad** | Alta (P1) - Crítico para operaciones |

### Objetivos de Negocio

1. **Control Total de Usuarios:** Gestionar CRUD, suspensiones, activaciones, reset de passwords y auditoría de actividad de usuarios
2. **Gestión Institucional:** Administrar organizaciones/escuelas, subscripciones, feature flags y límites de usuarios
3. **Moderación de Contenido:** Revisar, aprobar y rechazar contenido creado por profesores/comunidad para mantener calidad
4. **Monitoreo Operacional:** Supervisar salud del sistema, logs, estadísticas y modo de mantenimiento

### Valor de Negocio

- **Impacto:** CRÍTICO - Sin Admin Portal no hay forma de gestionar usuarios, organizaciones ni monitorear el sistema
- **ROI Estimado:** Muy Alto - Reduce tiempo de administración manual en 95%
- **Usuarios Afectados:** Super admins (rol crítico para operaciones)
- **Cobertura:** Esta épica cubre 31 endpoints de administración documentados en Fase 2

---

## Requerimientos Funcionales

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

### RF-002: Gestión de Organizaciones

**Prioridad:** ALTA
**Historia:** HU-EP010-02
**Story Points:** 18 SP

#### RF-002.1: Listado de Organizaciones
- **Descripción:** Super admin debe poder listar todas las organizaciones/escuelas
- **Criterios:**
  - Filtros por: tipo (school, district, enterprise), subscription_tier (free, basic, premium, enterprise), status (active, suspended, cancelled)
  - Búsqueda por nombre
  - Paginación: 10, 25, 50, 100 items
  - Información mostrada: id, nombre, tipo, subscription tier, status, número de usuarios, fecha de creación
- **Endpoint:** GET /api/admin/organizations

#### RF-002.2: Detalles de Organización
- **Descripción:** Ver información completa de una organización
- **Criterios:**
  - Información básica: nombre, tipo, contacto (email, teléfono), dirección
  - Subscription: tier, status, fecha de inicio, fecha de fin, max_users
  - Feature flags activos
  - Estadísticas: usuarios totales, usuarios activos, profesores, estudiantes
  - Usuarios asociados (lista resumida)
- **Endpoint:** GET /api/admin/organizations/:id

#### RF-002.3: Creación de Organización
- **Descripción:** Crear nueva organización/escuela en el sistema
- **Criterios:**
  - Campos requeridos: nombre, tipo, contact_email
  - Campos opcionales: contact_phone, dirección, subscription_tier (default: free)
  - Validación de email único
  - Inicializar feature_flags según tier
  - Registro en audit log
- **Endpoint:** POST /api/admin/organizations

#### RF-002.4: Actualización de Organización
- **Descripción:** Actualizar información de organización
- **Criterios:**
  - Campos editables: nombre, tipo, contacto, dirección, max_users
  - NO editable por este endpoint: subscription (usar endpoint específico)
  - Registro en audit log con old_values y new_values
- **Endpoint:** PUT /api/admin/organizations/:id

#### RF-002.5: Eliminación de Organización
- **Descripción:** Eliminar organización (soft delete)
- **Criterios:**
  - Soft delete: campo is_active = false
  - Bloquear acceso de todos los usuarios de la organización
  - Preservar datos para auditoría
  - Confirmación obligatoria
  - Registro en audit log
- **Endpoint:** DELETE /api/admin/organizations/:id

#### RF-002.6: Usuarios de Organización
- **Descripción:** Listar usuarios asociados a una organización
- **Criterios:**
  - Información mostrada: user id, nombre, email, rol en organización, fecha de ingreso
  - Filtros por rol (admin, teacher, student)
  - Paginación
  - Ordenamiento por nombre, fecha de ingreso
- **Endpoint:** GET /api/admin/organizations/:id/users

#### RF-002.7: Gestión de Subscription
- **Descripción:** Actualizar subscription tier y status de organización
- **Criterios:**
  - Campos editables: subscription_tier, subscription_status, subscription_start_date, subscription_end_date, max_users
  - Tiers disponibles: free, basic, premium, enterprise
  - Status disponibles: active, suspended, cancelled
  - Actualizar feature_flags automáticamente según tier
  - Registro en audit log
- **Endpoint:** PATCH /api/admin/organizations/:id/subscription

#### RF-002.8: Gestión de Feature Flags
- **Descripción:** Actualizar feature flags de organización
- **Criterios:**
  - Features disponibles:
    - advanced_analytics: Acceso a analytics avanzados
    - api_access: Acceso a API externa
    - custom_branding: Branding personalizado
    - sso_integration: Single Sign-On
    - unlimited_storage: Storage ilimitado
    - priority_support: Soporte prioritario
  - Toggle individual de cada feature
  - Validar features según subscription tier
  - Registro en audit log
- **Endpoint:** PATCH /api/admin/organizations/:id/features

---

### RF-003: Gestión de Contenido

**Prioridad:** MEDIA
**Historia:** HU-EP010-03
**Story Points:** 16 SP

#### RF-003.1: Cola de Moderación
- **Descripción:** Listar contenido pendiente de aprobación
- **Criterios:**
  - Tipos de contenido: ejercicios, lessons, quizzes creados por profesores/comunidad
  - Filtros por: tipo de contenido, fecha de creación, creator
  - Ordenamiento por: fecha de creación (más antiguos primero)
  - Información mostrada: id, título, tipo, creator, fecha de creación, preview
  - Paginación
- **Endpoint:** GET /api/admin/content/exercises/pending

#### RF-003.2: Aprobación de Contenido
- **Descripción:** Aprobar contenido para publicación
- **Criterios:**
  - Cambiar status de 'pending' a 'approved'
  - Publicar en catálogo visible para estudiantes
  - Notificar al creator por email
  - Registrar reviewer_id y reviewed_at
  - Registro en audit log
- **Endpoint:** POST /api/admin/content/exercises/:id/approve

#### RF-003.3: Rechazo de Contenido
- **Descripción:** Rechazar contenido inapropiado o de baja calidad
- **Criterios:**
  - Rejection_reason obligatorio (mínimo 20 caracteres)
  - Cambiar status de 'pending' a 'rejected'
  - NO publicar en catálogo
  - Notificar al creator por email con reason
  - Registrar reviewer_id, reviewed_at, rejection_reason
  - Registro en audit log
- **Endpoint:** POST /api/admin/content/exercises/:id/reject

#### RF-003.4: Gestión de Media
- **Descripción:** Listar archivos multimedia del sistema
- **Criterios:**
  - Tipos de archivos: imágenes (jpg, png, gif), videos (mp4, webm), audio (mp3, wav)
  - Información mostrada: id, filename, file type, size, uploader, upload_date, URL
  - Filtros por: tipo, uploader, fecha de subida
  - Búsqueda por filename
  - Paginación
  - Preview de imágenes
- **Endpoint:** GET /api/admin/content/media

#### RF-003.5: Eliminación de Media
- **Descripción:** Eliminar archivos multimedia inapropiados o duplicados
- **Criterios:**
  - Verificar si archivo está en uso (referencias en contenido)
  - Si está en uso, mostrar warning y solicitar confirmación
  - Eliminar archivo del storage (S3/filesystem)
  - Eliminar registro de base de datos
  - Confirmación obligatoria
  - Registro en audit log
- **Endpoint:** DELETE /api/admin/content/media/:id

#### RF-003.6: Versionamiento de Contenido
- **Descripción:** Crear snapshot de contenido para rollback/historial
- **Criterios:**
  - Crear versión inmutable de contenido actual
  - Almacenar contenido completo en JSONB
  - Registrar version_number, created_by, created_at
  - Permitir restaurar versión anterior
  - Registro en audit log
- **Endpoint:** POST /api/admin/content/version

---

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

### RNF-003: Escalabilidad

**Prioridad:** MEDIA

#### RNF-003.1: Crecimiento de Usuarios
- **Requisito:** Sistema debe escalar a 100,000+ usuarios
- **Implementación:**
  - Queries paginadas
  - Indexes apropiados
  - Particionamiento de tabla audit_log por fecha
  - Archiving de logs antiguos

#### RNF-003.2: Crecimiento de Organizaciones
- **Requisito:** Soportar 1,000+ organizaciones
- **Implementación:**
  - Queries optimizadas
  - Cache de datos de organización
  - Lazy loading en frontend

---

### RNF-004: Usabilidad

**Prioridad:** ALTA

#### RNF-004.1: Interfaz Intuitiva
- **Requisito:** UI/UX clara y fácil de usar
- **Implementación:**
  - Design system consistente (Tailwind + shadcn/ui)
  - Tooltips explicativos
  - Confirmaciones para acciones críticas (delete, suspend)
  - Feedback visual inmediato (loading states, success/error messages)

#### RNF-004.2: Búsqueda y Filtros
- **Requisito:** Búsqueda rápida y filtros efectivos
- **Implementación:**
  - Búsqueda en tiempo real (debounced)
  - Filtros múltiples combinables
  - Guardar preferencias de filtros
  - Clear filters button

#### RNF-004.3: Accesibilidad
- **Requisito:** Cumplir con WCAG 2.1 AA
- **Implementación:**
  - Navegación por teclado
  - Screen reader compatible
  - Contraste de colores adecuado
  - Labels descriptivos

---

### RNF-005: Mantenibilidad

**Prioridad:** ALTA

#### RNF-005.1: Código Limpio
- **Requisito:** Código mantenible y bien documentado
- **Implementación:**
  - TypeScript strict mode
  - ESLint + Prettier
  - Conventional commits
  - Code review obligatorio (2 approvals)
  - JSDoc comments en funciones críticas

#### RNF-005.2: Testing
- **Requisito:** Alta cobertura de tests
- **Métricas:**
  - Unit test coverage: > 85%
  - Integration test coverage: > 70%
  - E2E tests para flujos críticos
  - Zero critical bugs en producción

#### RNF-005.3: Documentación
- **Requisito:** Documentación completa y actualizada
- **Implementación:**
  - API documentation (OpenAPI/Swagger)
  - README con setup instructions
  - Architecture diagrams
  - Runbooks para operaciones comunes

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

## Casos de Uso Principales

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

### CU-ADM-002: Gestionar Subscription de Organización

**Actor Principal:** Super Admin
**Objetivo:** Actualizar subscription tier de una organización/escuela

**Precondiciones:**
- Super admin autenticado
- Organización existe en el sistema

**Flujo Principal:**
1. Super admin navega a "Organizations"
2. Super admin selecciona organización de la lista
3. Sistema muestra detalles de organización incluyendo subscription actual
4. Super admin hace clic en botón "Manage Subscription"
5. Sistema muestra modal con opciones de subscription:
   - Subscription tier (free, basic, premium, enterprise)
   - Subscription status (active, suspended, cancelled)
   - Start date y end date
   - Max users
6. Super admin selecciona nuevo tier (ej. premium)
7. Super admin ajusta max_users según tier
8. Super admin confirma cambios
9. Sistema valida permisos y datos
10. Sistema actualiza subscription en base de datos
11. Sistema actualiza feature_flags automáticamente según tier:
    - free: No features adicionales
    - basic: advanced_analytics
    - premium: advanced_analytics, api_access, custom_branding
    - enterprise: Todas las features
12. Sistema registra cambios en admin_audit_log (old_values, new_values)
13. Sistema envía email de notificación al admin de la organización
14. Sistema muestra mensaje de éxito
15. Super admin ve subscription actualizada en UI

**Postcondiciones:**
- Subscription tier actualizado
- Feature flags actualizados según tier
- Límite de usuarios aplicado
- Email de notificación enviado
- Acción registrada en audit log

**Flujos Alternativos:**
- **A1 - Tier no permite cambio:** Si organización tiene más usuarios que max_users del nuevo tier, sistema muestra error
- **A2 - Downgrade requiere confirmación:** Si downgrade (ej. premium → basic), sistema solicita confirmación adicional

---

### CU-ADM-003: Aprobar Ejercicio de Profesor

**Actor Principal:** Super Admin o Content Moderator
**Objetivo:** Revisar y aprobar ejercicio creado por profesor para publicación

**Precondiciones:**
- Super admin autenticado
- Ejercicio en status 'pending'

**Flujo Principal:**
1. Super admin navega a "Content Moderation"
2. Sistema muestra lista de ejercicios pendientes ordenados por antigüedad
3. Super admin selecciona ejercicio de la lista
4. Sistema muestra preview completo del ejercicio:
   - Título y descripción
   - Contenido completo
   - Mecánica educativa utilizada
   - Respuestas esperadas
   - Difficulty level
   - Creator info
5. Super admin revisa contenido verificando:
   - Calidad educativa
   - Contenido apropiado (sin lenguaje inapropiado, errores gramaticales graves)
   - Funcionamiento correcto de mecánica
6. Super admin hace clic en botón "Approve"
7. Sistema solicita confirmación
8. Super admin confirma aprobación
9. Sistema actualiza status del ejercicio a 'approved'
10. Sistema registra reviewer_id y reviewed_at
11. Sistema publica ejercicio en catálogo (visible para estudiantes)
12. Sistema registra acción en admin_audit_log
13. Sistema envía email de notificación al creator (profesor)
14. Sistema muestra mensaje de éxito
15. Sistema remueve ejercicio de cola de moderación

**Postcondiciones:**
- Ejercicio aprobado y publicado
- Visible en catálogo para estudiantes
- Creator notificado por email
- Acción registrada en audit log

**Flujos Alternativos:**
- **A1 - Rechazar ejercicio:** Si contenido no cumple estándares:
  1. Super admin hace clic en "Reject"
  2. Sistema solicita rejection_reason (mínimo 20 caracteres)
  3. Super admin ingresa reason detallado
  4. Sistema actualiza status a 'rejected'
  5. Sistema registra rejection_reason
  6. Sistema envía email al creator con reason
  7. Ejercicio NO se publica

---

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

## Matriz de Permisos

### Permisos por Rol

| Acción | super_admin | content_moderator | system_operator | admin | teacher | student |
|--------|-------------|-------------------|-----------------|-------|---------|---------|
| **User Management** |
| Listar usuarios | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Ver detalles usuario | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Actualizar usuario | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Eliminar usuario | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Suspender usuario | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Reactivar usuario | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Reset password | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Ver activity log | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Organization Management** |
| Listar organizaciones | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Ver detalles org | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Crear organización | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Actualizar organización | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Eliminar organización | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Ver usuarios org | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Gestionar subscription | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Gestionar feature flags | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Content Management** |
| Ver cola moderación | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Aprobar contenido | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Rechazar contenido | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Listar media | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Eliminar media | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Crear versión contenido | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **System Monitoring** |
| Ver health check | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Actualizar rol usuario | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Actualizar status usuario | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Ver logs sistema | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Modo mantenimiento | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| Ver estadísticas | ✓ | ✗ | ✓ | ✗ | ✗ | ✗ |
| **Audit** |
| Ver audit log | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Exportar audit log | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |

### Notas sobre Permisos

1. **super_admin:** Acceso completo a todas las funciones del Admin Portal
2. **content_moderator:** Solo acceso a Content Management (aprobar/rechazar contenido)
3. **system_operator:** Solo acceso a System Monitoring (health, logs, maintenance)
4. **admin, teacher, student:** Sin acceso al Admin Portal

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

### RN-002: Gestión de Organizaciones

#### RN-002.1: Subscription Tiers
- **free:** max_users = 20, no feature flags
- **basic:** max_users = 100, advanced_analytics = true
- **premium:** max_users = 500, advanced_analytics + api_access + custom_branding = true
- **enterprise:** max_users = ilimitado, todas las features = true

#### RN-002.2: Feature Flags según Tier
- Feature flags se actualizan automáticamente al cambiar tier
- No permitir activar features no incluidas en tier
- Downgrade de tier desactiva features automáticamente

#### RN-002.3: Límite de Usuarios
- Organización no puede superar max_users de su tier
- Al alcanzar límite, bloquear registro de nuevos usuarios
- Upgrade de tier aumenta límite inmediatamente

---

### RN-003: Gestión de Contenido

#### RN-003.1: Moderación de Contenido
- Contenido creado por profesores debe estar en status 'pending' hasta aprobación
- Solo super_admin o content_moderator pueden aprobar/rechazar
- Rejection_reason obligatorio al rechazar (mínimo 20 caracteres)
- Email de notificación obligatorio al aprobar/rechazar

#### RN-003.2: Eliminación de Media
- Verificar si archivo está en uso antes de eliminar
- Si en uso, solicitar confirmación adicional
- Eliminar archivo del storage (S3/filesystem) y registro de BD

---

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

## Endpoints API

### Resumen de Endpoints

| Categoría | Endpoints | Story Points |
|-----------|-----------|--------------|
| User Management | 10 endpoints | 20 SP |
| Organization Management | 8 endpoints | 18 SP |
| Content Management | 6 endpoints | 16 SP |
| System Monitoring | 7 endpoints | 16 SP |
| **TOTAL** | **31 endpoints** | **70 SP** |

### User Management (10 endpoints)

1. `GET /api/admin/users` - Lista usuarios con filtros
2. `GET /api/admin/users/:id` - Detalles de usuario
3. `PATCH /api/admin/users/:id` - Actualiza usuario
4. `DELETE /api/admin/users/:id` - Elimina usuario (soft delete)
5. `POST /api/admin/users/:id/suspend` - Suspende usuario
6. `POST /api/admin/users/:id/unsuspend` - Remueve suspensión
7. `POST /api/admin/users/:id/activate` - Activa usuario
8. `POST /api/admin/users/:id/deactivate` - Desactiva usuario
9. `POST /api/admin/users/:id/reset-password` - Fuerza reset de password
10. `GET /api/admin/users/:id/activity` - Log de actividad

### Organization Management (8 endpoints)

1. `GET /api/admin/organizations` - Lista organizaciones
2. `GET /api/admin/organizations/:id` - Detalles de organización
3. `POST /api/admin/organizations` - Crea organización
4. `PUT /api/admin/organizations/:id` - Actualiza organización
5. `DELETE /api/admin/organizations/:id` - Elimina organización
6. `GET /api/admin/organizations/:id/users` - Usuarios de organización
7. `PATCH /api/admin/organizations/:id/subscription` - Gestiona subscription
8. `PATCH /api/admin/organizations/:id/features` - Gestiona feature flags

### Content Management (6 endpoints)

1. `GET /api/admin/content/exercises/pending` - Ejercicios pendientes
2. `POST /api/admin/content/exercises/:id/approve` - Aprueba ejercicio
3. `POST /api/admin/content/exercises/:id/reject` - Rechaza ejercicio
4. `GET /api/admin/content/media` - Lista archivos multimedia
5. `DELETE /api/admin/content/media/:id` - Elimina archivo multimedia
6. `POST /api/admin/content/version` - Crea versión de contenido

### System Monitoring (7 endpoints)

1. `GET /api/admin/system/health` - Health check del sistema
2. `GET /api/admin/system/users` - Lista usuarios (enfoque sistema)
3. `PATCH /api/admin/system/users/:id/role` - Actualiza rol
4. `PATCH /api/admin/system/users/:id/status` - Actualiza status
5. `GET /api/admin/system/logs` - Logs del sistema
6. `POST /api/admin/system/maintenance` - Modo mantenimiento
7. `GET /api/admin/system/statistics` - Estadísticas del sistema

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

## Referencias

### Documentación de Épica

- **README Épica:** `../../04-planificacion/epicas/EP010-admin-portal/README.md`
- **Historia HU-EP010-01:** `../../04-planificacion/epicas/EP010-admin-portal/historias/HU-EP010-01-user-management.md`
- **Historia HU-EP010-02:** `../../04-planificacion/epicas/EP010-admin-portal/historias/HU-EP010-02-organizations.md`
- **Historia HU-EP010-03:** `../../04-planificacion/epicas/EP010-admin-portal/historias/HU-EP010-03-content-management.md`
- **Historia HU-EP010-04:** `../../04-planificacion/epicas/EP010-admin-portal/historias/HU-EP010-04-system-monitoring.md`

### Especificaciones Técnicas

- **API Reference:** `../../02-especificaciones-tecnicas/apis/ADMIN-PORTAL-API.md`
- **Database Schema:** `../../03-desarrollo/base-de-datos/schemas/`

### Épicas Relacionadas

- **EP001 - Auth System:** Dependencia bloqueante (JWT authentication requerido)
- **EP005 - Admin Module (Partial):** Épica previa con cobertura parcial (40%) de endpoints admin

### Reportes de Fase 2

- **Reporte Final Fase 2:** `../../projects/glit-analisys/05-REPORTE-FINAL-FASE-2-DOCUMENTACION.md`

---

## Aprobaciones

| Rol | Nombre | Fecha | Estado |
|-----|--------|-------|--------|
| Product Owner | TBD | - | Pendiente |
| Tech Lead | TBD | - | Pendiente |
| Security Lead | TBD | - | Pendiente |
| Backend Lead | TBD | - | Pendiente |
| Frontend Lead | TBD | - | Pendiente |

---

## Control de Versiones

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2025-10-28 | Claude Code | Creación inicial del documento de requerimientos |

---

**Última actualización:** 2025-10-28
**Estado:** DRAFT - Pendiente aprobación
**Próximos pasos:**
1. Revisión por Product Owner
2. Revisión por Tech Lead y Security Lead
3. Merge con EP005 (Admin Module Partial)
4. Aprobación final
5. Inicio de implementación (Sprint 1)
