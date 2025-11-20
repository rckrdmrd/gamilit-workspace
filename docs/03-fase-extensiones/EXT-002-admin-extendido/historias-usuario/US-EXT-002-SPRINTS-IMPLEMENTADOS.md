# Historias de Usuario - Admin Portal Extendido
## Sprints 1, 2 y 3 Implementados

**Epic:** EXT-002 - Portal de Administración Extendido
**Fecha:** 2025-11-19
**Estado:** ✅ IMPLEMENTADO

---

## Sprint 1 - P0 Critical Features

### US-EXT-002-001: Visualizar Dashboard Administrativo
**ID:** US-EXT-002-001
**Como:** Administrador del sistema
**Quiero:** Ver un dashboard centralizado con estadísticas y actividad del sistema
**Para:** Monitorear la salud y uso de la plataforma en tiempo real

**Criterios de Aceptación:**

✅ **Escenario 1: Visualizar estadísticas generales**
```gherkin
DADO que soy un administrador autenticado
CUANDO accedo a GET /admin/dashboard
ENTONCES veo:
  - Total de usuarios y usuarios activos
  - Nuevos usuarios registrados hoy
  - Total de organizaciones
  - Total de módulos y ejercicios
  - Ejercicios completados en últimas 24h
  - Estado de salud del sistema (healthy/warning/critical)
  - Tiempo promedio de respuesta del sistema
```

✅ **Escenario 2: Visualizar actividad reciente**
```gherkin
DADO que soy un administrador autenticado
CUANDO accedo a GET /admin/dashboard/recent-activity?limit=20
ENTONCES veo:
  - Lista de las últimas 20 acciones de usuarios/admins
  - Información de cada acción: email, nombre, tipo de acción, descripción
  - Timestamp de cada acción
  - Respuesta paginada con total de registros
```

✅ **Escenario 3: Consultar solo estadísticas**
```gherkin
DADO que necesito solo las métricas sin actividad
CUANDO accedo a GET /admin/dashboard/stats
ENTONCES recibo solo el objeto de estadísticas
Y la respuesta es más rápida que el dashboard completo
```

**Endpoints:**
- `GET /admin/dashboard` - Dashboard completo
- `GET /admin/dashboard/stats` - Solo estadísticas
- `GET /admin/dashboard/recent-activity` - Solo actividad (paginada)

**Valor de Negocio:** Alto - Visibilidad completa del estado del sistema

---

### US-EXT-002-002: Gestionar Roles y Permisos
**ID:** US-EXT-002-002
**Como:** Administrador con permiso de gestión de roles
**Quiero:** Ver y modificar permisos de roles existentes
**Para:** Controlar el acceso granular a funcionalidades del sistema

**Criterios de Aceptación:**

✅ **Escenario 1: Listar roles disponibles**
```gherkin
DADO que soy un administrador con permiso can_manage_roles
CUANDO accedo a GET /admin/roles
ENTONCES veo:
  - Lista de todos los roles (student, admin_teacher, super_admin, etc.)
  - Nombre de cada rol
  - Permisos asignados a cada rol
  - Conteo de usuarios con cada rol
```

✅ **Escenario 2: Ver permisos disponibles**
```gherkin
DADO que necesito conocer los permisos del sistema
CUANDO accedo a GET /admin/roles/permissions
ENTONCES veo:
  - 16 permisos disponibles organizados por categoría
  - Categorías: content, users, system, reports, gamification, analytics
  - Cada permiso con nombre técnico y nombre descriptivo
```

✅ **Escenario 3: Ver permisos de un rol específico**
```gherkin
DADO que quiero revisar permisos del rol "admin_teacher"
CUANDO accedo a GET /admin/roles/{roleId}/permissions
ENTONCES veo:
  - ID y nombre del rol
  - Objeto con todos los permisos y su estado (true/false)
  - Última actualización
```

✅ **Escenario 4: Actualizar permisos de un rol**
```gherkin
DADO que quiero dar permiso "can_approve_content" a "admin_teacher"
CUANDO envío PUT /admin/roles/{roleId}/permissions
Con body: { permissions: { can_approve_content: true } }
ENTONCES:
  - El rol se actualiza correctamente
  - Recibo confirmación con permisos actualizados
  - Los usuarios con ese rol obtienen el nuevo permiso inmediatamente
```

**Endpoints:**
- `GET /admin/roles`
- `GET /admin/roles/permissions`
- `GET /admin/roles/:id/permissions`
- `PUT /admin/roles/:id/permissions`

**Valor de Negocio:** Crítico - Control de acceso granular y seguridad

---

### US-EXT-002-003: Generar Reportes del Sistema
**ID:** US-EXT-002-003
**Como:** Administrador con permiso can_export_reports
**Quiero:** Generar, listar y descargar reportes en diferentes formatos
**Para:** Analizar datos del sistema y tomar decisiones informadas

**Criterios de Aceptación:**

✅ **Escenario 1: Generar reporte de usuarios**
```gherkin
DADO que necesito un reporte de usuarios activos
CUANDO envío POST /admin/reports/generate
Con body:
  {
    type: "users",
    format: "csv",
    filters: { status: "active" },
    date_range: { start: "2025-11-01", end: "2025-11-19" }
  }
ENTONCES:
  - Se crea un reporte con estado "generating"
  - Recibo ID del reporte
  - El reporte se genera de forma asíncrona
  - Después de 2 segundos el estado cambia a "completed"
```

✅ **Escenario 2: Listar reportes generados**
```gherkin
DADO que tengo reportes previos
CUANDO accedo a GET /admin/reports?type=users&page=1&limit=20
ENTONCES veo:
  - Lista paginada de reportes
  - Información de cada reporte: tipo, formato, estado, tamaño, fechas
  - Total de reportes y páginas disponibles
```

✅ **Escenario 3: Descargar reporte completado**
```gherkin
DADO que tengo un reporte con status="completed"
CUANDO accedo a GET /admin/reports/{reportId}/download
ENTONCES:
  - Recibo el reporte con metadata actualizada
  - Campo download_url está disponible
  - Puedo descargar el archivo en el formato solicitado
```

✅ **Escenario 4: Eliminar reporte antiguo**
```gherkin
DADO que tengo reportes de hace 6 meses
CUANDO envío DELETE /admin/reports/{reportId}
ENTONCES:
  - El reporte se elimina
  - Recibo confirmación 204 No Content
  - El reporte ya no aparece en la lista
```

**Tipos de reportes soportados:**
- `users`: Reporte de usuarios
- `progress`: Reporte de progreso educativo
- `gamification`: Reporte de gamificación
- `system`: Reporte del sistema

**Formatos soportados:**
- `csv`: Valores separados por comas
- `excel`: Archivo Excel (.xlsx)
- `pdf`: Documento PDF

**Endpoints:**
- `POST /admin/reports/generate`
- `GET /admin/reports`
- `GET /admin/reports/:id/download`
- `DELETE /admin/reports/:id`

**Valor de Negocio:** Alto - Análisis de datos y toma de decisiones

**Nota:** Implementación actual usa almacenamiento en memoria. Para producción se requiere persistencia en DB y sistema de archivos.

---

### US-EXT-002-004: Configurar Sistema por Categorías
**ID:** US-EXT-002-004
**Como:** Super administrador
**Quiero:** Ver y modificar configuraciones del sistema organizadas por categorías
**Para:** Gestionar fácilmente diferentes aspectos de la configuración

**Criterios de Aceptación:**

✅ **Escenario 1: Ver configuración completa**
```gherkin
DADO que soy super admin
CUANDO accedo a GET /admin/system/config
ENTONCES veo:
  - Modo mantenimiento y mensaje
  - Configuraciones de registro (allow_registrations)
  - Configuraciones de seguridad (max_login_attempts, lockout_duration)
  - Configuraciones de sesión (session_timeout_minutes)
  - Configuraciones personalizadas (custom_settings)
  - Metadata: updated_at, updated_by
```

✅ **Escenario 2: Actualizar configuración completa**
```gherkin
DADO que quiero cambiar varias configuraciones
CUANDO envío POST /admin/system/config
Con body:
  {
    maintenance_mode: true,
    maintenance_message: "Sistema en mantenimiento",
    max_login_attempts: 3
  }
ENTONCES:
  - Todas las configuraciones se actualizan en DB
  - Se registra quién hizo el cambio (audit trail)
  - Recibo configuración actualizada como confirmación
```

✅ **Escenario 3: Ver configuración por categoría**
```gherkin
DADO que solo necesito ver configuraciones de "security"
CUANDO accedo a GET /admin/system/config/security
ENTONCES veo solo:
  - max_login_attempts
  - lockout_duration_minutes
  - Y otras configuraciones de seguridad
```

✅ **Escenario 4: Actualizar por categoría**
```gherkin
DADO que quiero actualizar solo configuraciones de email
CUANDO envío PUT /admin/system/config/email
Con body: { smtp_host: "smtp.example.com", smtp_port: 587 }
ENTONCES:
  - Solo las configuraciones de email se actualizan
  - Otras categorías permanecen sin cambios
  - Cambios persisten en base de datos
```

**Categorías soportadas:**
- `general` - Configuraciones generales
- `email` - Configuraciones de email
- `notifications` - Configuraciones de notificaciones
- `security` - Configuraciones de seguridad
- `maintenance` - Configuraciones de mantenimiento

**Endpoints:**
- `GET /admin/system/config`
- `POST /admin/system/config`
- `GET /admin/system/config/:category`
- `PUT /admin/system/config/:category`

**Mejora realizada:**
- ❌ Antes: Config en memoria (se perdía al reiniciar)
- ✅ Ahora: Config persiste en DB con tipos y audit trail

**Valor de Negocio:** Crítico - Configuración persistente y auditable del sistema

---

## Sprint 2 - P1 High Priority Features

### US-EXT-002-005: Realizar Operaciones Masivas sobre Usuarios
**ID:** US-EXT-002-005
**Como:** Administrador de usuarios
**Quiero:** Suspender, eliminar o cambiar rol de múltiples usuarios a la vez
**Para:** Realizar tareas administrativas de forma eficiente

**Criterios de Aceptación:**

✅ **Escenario 1: Suspender usuarios en lote**
```gherkin
DADO que tengo una lista de 50 usuarios infractores
CUANDO envío POST /admin/users/bulk/suspend
Con body:
  {
    user_ids: ["uuid1", "uuid2", ..., "uuid50"],
    reason: "Violación de términos de servicio"
  }
ENTONCES:
  - Se crea operación asíncrona con estado "processing"
  - Recibo ID de operación
  - Los 50 usuarios se suspenden (deleted_at se establece)
  - Estado final: "completed" con 50 procesados
```

✅ **Escenario 2: Eliminar usuarios en lote**
```gherkin
DADO que tengo usuarios inactivos hace 2 años
CUANDO envío POST /admin/users/bulk/delete
Con body:
  {
    user_ids: ["uuid1", "uuid2", ...],
    confirm: true
  }
ENTONCES:
  - Se valida confirmación explícita
  - Se crea operación asíncrona
  - Los usuarios se eliminan físicamente
  - Operación registrada en audit log
```

✅ **Escenario 3: Actualizar rol masivamente**
```gherkin
DADO que quiero promover 10 estudiantes a maestros
CUANDO envío POST /admin/users/bulk/update-role
Con body:
  {
    user_ids: ["uuid1", ..., "uuid10"],
    new_role: "admin_teacher"
  }
ENTONCES:
  - Rol se actualiza para todos los usuarios
  - Permisos se actualizan automáticamente
  - Usuarios notificados de cambio de rol
```

**Compatibilidad de rutas:**
- `/admin/users/bulk/*` - Rutas para frontend ✅
- `/admin/bulk-operations/*` - Rutas canónicas ✅

**Endpoints:**
- `POST /admin/users/bulk/suspend`
- `POST /admin/users/bulk/delete`
- `POST /admin/users/bulk/update-role`

**Valor de Negocio:** Alto - Eficiencia administrativa

---

### US-EXT-002-006: Forzar Reset de Contraseña
**ID:** US-EXT-002-006
**Como:** Administrador de seguridad
**Quiero:** Forzar reset de contraseña de usuarios específicos
**Para:** Mantener seguridad de cuentas comprometidas o por política

**Criterios de Aceptación:**

✅ **Escenario 1: Forzar reset con email**
```gherkin
DADO que un usuario reportó cuenta comprometida
CUANDO envío POST /admin/users/{userId}/reset-password
Con body:
  {
    sendEmail: true,
    customMessage: "Su cuenta fue comprometida. Por favor cambie su contraseña."
  }
ENTONCES:
  - Usuario marcado con require_password_reset: true
  - Se envía email con instrucciones
  - Usuario debe cambiar contraseña en próximo login
  - Acción registrada con admin ID en metadata
```

✅ **Escenario 2: Forzar reset sin email**
```gherkin
DADO que necesito que un usuario cambie contraseña sin notificarlo
CUANDO envío POST /admin/users/{userId}/reset-password
Con body: { sendEmail: false }
ENTONCES:
  - Usuario marcado para reset
  - NO se envía email
  - Usuario ve prompt de cambio en próximo login
```

✅ **Escenario 3: Verificar metadata de reset**
```gherkin
DADO que forcé reset de contraseña
CUANDO consulto GET /admin/users/{userId}
ENTONCES veo en raw_user_meta_data:
  - require_password_reset: true
  - password_reset_requested_at: "2025-11-19T12:00:00Z"
  - password_reset_requested_by: "admin"
```

**Endpoint:**
- `POST /admin/users/:id/reset-password`

**Valor de Negocio:** Alto - Seguridad de cuentas de usuario

---

### US-EXT-002-007: Gestionar Contenido con Rutas Específicas
**ID:** US-EXT-002-007
**Como:** Administrador de contenido
**Quiero:** Gestionar ejercicios con rutas específicas además de rutas genéricas
**Para:** Tener compatibilidad con el frontend existente

**Criterios de Aceptación:**

✅ **Escenario 1: Listar ejercicios pendientes**
```gherkin
DADO que quiero ver solo ejercicios para aprobar
CUANDO accedo a GET /admin/content/exercises/pending
ENTONCES veo:
  - Solo ejercicios (automáticamente filtrado)
  - Ejercicios con reviewed_by IS NULL
  - Lista paginada de ejercicios pendientes
```

✅ **Escenario 2: Aprobar ejercicio con ruta específica**
```gherkin
DADO que un ejercicio está pendiente de aprobación
CUANDO envío POST /admin/content/exercises/{id}/approve
Con body: { approval_notes: "Contenido excelente", publish_immediately: true }
ENTONCES:
  - Ejercicio se aprueba (is_active = true)
  - Se registra en content_approvals
  - Notas se guardan en metadata
```

✅ **Escenario 3: Rechazar ejercicio con ruta específica**
```gherkin
DADO que un ejercicio tiene errores
CUANDO envío POST /admin/content/exercises/{id}/reject
Con body: { rejection_reason: "Errores gramaticales en instrucciones" }
ENTONCES:
  - Ejercicio se marca como rechazado (is_active = false)
  - Se registra rechazo en content_approvals
  - Razón se guarda para referencia del creador
```

**Compatibilidad de rutas:**
- `/admin/content/exercises/*` - Rutas específicas ✅
- `/admin/content/*` - Rutas genéricas ✅

**Endpoints alias:**
- `GET /admin/content/exercises/pending`
- `POST /admin/content/exercises/:id/approve`
- `POST /admin/content/exercises/:id/reject`

**Valor de Negocio:** Medio - Compatibilidad con frontend legacy

---

### US-EXT-002-008: Consultar Estadísticas Avanzadas del Sistema
**ID:** US-EXT-002-008
**Como:** Administrador analista
**Quiero:** Acceder a estadísticas detalladas desde vistas de base de datos
**Para:** Obtener insights profundos sobre usuarios, organizaciones, moderación y educación

**Criterios de Aceptación:**

✅ **Escenario 1: Consultar estadísticas de usuarios**
```gherkin
DADO que necesito análisis de usuarios
CUANDO accedo a GET /admin/dashboard/user-stats
ENTONCES veo:
  - Total de usuarios, nuevos hoy, esta semana, este mes
  - Usuarios activos hoy y esta semana
  - Desglose por rol: students, teachers, admins
  - Datos agregados desde vista user_stats_summary
```

✅ **Escenario 2: Consultar estadísticas de organizaciones**
```gherkin
DADO que administro múltiples organizaciones
CUANDO accedo a GET /admin/dashboard/organization-stats
ENTONCES veo:
  - Total de organizaciones
  - Organizaciones activas
  - Nuevas organizaciones este mes
```

✅ **Escenario 3: Ver cola de moderación de contenido**
```gherkin
DADO que hay contenido flagged pendiente de revisión
CUANDO accedo a GET /admin/dashboard/moderation-queue
ENTONCES veo (primeros 50):
  - Contenido reportado ordenado por prioridad (high → medium → low)
  - Tipo de contenido, razón, reporter
  - Status: pending
  - Timestamps de reporte
```

✅ **Escenario 4: Consultar overview de aulas**
```gherkin
DADO que administro plataforma educativa
CUANDO accedo a GET /admin/dashboard/classroom-overview
ENTONCES veo (primeros 100):
  - Información de cada aula: nombre, teacher, estudiantes
  - Asignaciones totales, pendientes, próximas a vencer
  - Progreso promedio de la clase
  - Estado del aula (ACTIVE, INACTIVE, EMPTY)
```

✅ **Escenario 5: Consultar estadísticas de asignaciones**
```gherkin
DADO que quiero analizar desempeño en asignaciones
CUANDO accedo a GET /admin/dashboard/assignment-stats
ENTONCES veo (primeros 100):
  - Título de asignación, aula, tipo, puntos máximos
  - Submissions: total, completadas, en progreso, no iniciadas
  - Tasa de submission (%)
  - Scores: promedio, máximo, mínimo
  - Fechas de entrega y overrides por aula
```

**Vistas DB consumidas:**
1. `admin_dashboard.user_stats_summary`
2. `admin_dashboard.organization_stats_summary`
3. `admin_dashboard.moderation_queue`
4. `admin_dashboard.classroom_overview`
5. `admin_dashboard.assignment_submission_stats`

**Endpoints:**
- `GET /admin/dashboard/user-stats`
- `GET /admin/dashboard/organization-stats`
- `GET /admin/dashboard/moderation-queue`
- `GET /admin/dashboard/classroom-overview`
- `GET /admin/dashboard/assignment-stats`

**Valor de Negocio:** Alto - Insights profundos para decisiones estratégicas

---

## Sprint 3 - P2 Medium Priority Features

### US-EXT-002-009: Consultar Historial de Aprobaciones
**ID:** US-EXT-002-009
**Como:** Administrador de contenido o auditor
**Quiero:** Ver historial completo de aprobaciones y rechazos de contenido
**Para:** Auditar decisiones y analizar procesos de revisión

**Criterios de Aceptación:**

✅ **Escenario 1: Listar historial completo**
```gherkin
DADO que necesito revisar todas las aprobaciones
CUANDO accedo a GET /admin/content/approval-history?page=1&limit=20
ENTONCES veo:
  - Lista paginada de aprobaciones/rechazos
  - Información de cada registro:
    * Tipo y título del contenido
    * Quién submitió y quién revisó (con nombres)
    * Estado: pending, approved, rejected, needs_revision
    * Timestamps de submission y review
    * Notas del reviewer y del submitter
```

✅ **Escenario 2: Filtrar por tipo de contenido**
```gherkin
DADO que solo me interesan ejercicios
CUANDO accedo a GET /admin/content/approval-history?content_type=exercise
ENTONCES veo:
  - Solo registros de tipo exercise
  - Filtrado desde base de datos
  - Performance optimizada con índices
```

✅ **Escenario 3: Ver historial de contenido específico**
```gherkin
DADO que un ejercicio fue rechazado 2 veces antes de aprobarse
CUANDO accedo a GET /admin/content/approval-history?content_id={exerciseId}
ENTONCES veo:
  - 3 registros del mismo ejercicio
  - Registro 1: rejected con notas "Errores gramaticales"
  - Registro 2: rejected con notas "Falta instrucciones"
  - Registro 3: approved con notas "Excelente después de correcciones"
  - Ordenados cronológicamente
```

✅ **Escenario 4: Buscar en notas de revisión**
```gherkin
DADO que quiero encontrar rechazos por "plagio"
CUANDO accedo a GET /admin/content/approval-history?search=plagio&status=rejected
ENTONCES veo:
  - Solo contenido rechazado
  - Donde reviewer_notes o revision_notes contienen "plagio"
  - Búsqueda case-insensitive
```

✅ **Escenario 5: Filtrar por revisor**
```gherkin
DADO que quiero auditar aprobaciones de un admin específico
CUANDO accedo a GET /admin/content/approval-history?reviewed_by={adminId}
ENTONCES veo:
  - Solo aprobaciones/rechazos de ese admin
  - Estadísticas de su actividad de revisión
```

**Filtros soportados:**
- `content_type`: module, exercise, assignment, resource
- `content_id`: UUID específico
- `status`: pending, approved, rejected, needs_revision
- `submitted_by`: UUID del submitter
- `reviewed_by`: UUID del reviewer
- `search`: Búsqueda en notas
- `page`, `limit`: Paginación

**Endpoint:**
- `GET /admin/content/approval-history`

**Integración:**
- Registros creados automáticamente en `approveContent()` y `rejectContent()`
- Joins con User para nombres de submitter y reviewer
- Joins con Module/Exercise/Template para títulos

**Valor de Negocio:** Medio - Auditoría y mejora de procesos

---

### US-EXT-002-010: Acceder a Logs con Ruta Simplificada
**ID:** US-EXT-002-010
**Como:** Administrador o desarrollador
**Quiero:** Acceder a audit logs con ruta corta `/admin/logs`
**Para:** Tener compatibilidad con frontend y facilidad de uso

**Criterios de Aceptación:**

✅ **Escenario 1: Acceder con ruta corta**
```gherkin
DADO que el frontend espera /admin/logs
CUANDO accedo a GET /admin/logs?page=1&limit=50
ENTONCES:
  - Recibo logs de auth_attempts
  - Respuesta idéntica a /admin/system/audit-log
  - Paginación funciona correctamente
```

✅ **Escenario 2: Filtrar logs con ruta corta**
```gherkin
DADO que necesito logs de un usuario específico
CUANDO accedo a GET /admin/logs?email=user@example.com&success=false
ENTONCES veo:
  - Intentos fallidos de login de ese usuario
  - Con IP, user agent, failure reason
  - Ordenados por fecha descendente
```

✅ **Escenario 3: Verificar compatibilidad total**
```gherkin
DADO que tengo ambas rutas disponibles
CUANDO comparo respuestas de:
  - GET /admin/logs?page=1
  - GET /admin/system/audit-log?page=1
ENTONCES:
  - Ambas retornan datos idénticos
  - Mismo formato de respuesta
  - Mismos filtros soportados
```

**Rutas soportadas:**
- `/admin/logs` - Ruta corta (frontend) ✅
- `/admin/system/audit-log` - Ruta canónica ✅

**Endpoint:**
- `GET /admin/logs`

**Valor de Negocio:** Bajo - Compatibilidad y usabilidad

---

### US-EXT-002-011: Ejecutar Operaciones de Mantenimiento
**ID:** US-EXT-002-011
**Como:** Administrador de sistemas
**Quiero:** Ejecutar tareas de mantenimiento del sistema
**Para:** Optimizar rendimiento y liberar espacio en disco

**Criterios de Aceptación:**

✅ **Escenario 1: Limpiar logs antiguos del sistema**
```gherkin
DADO que tengo logs de hace 120 días
CUANDO envío POST /admin/system/maintenance/cleanup-logs
Con body: { retention_days: 90 }
ENTONCES:
  - Se eliminan logs mayores a 90 días
  - Se ejecuta VACUUM ANALYZE en tabla
  - Recibo:
    * success: true
    * message: "Successfully deleted X log entries older than 90 days"
    * affected_records: número eliminado
    * metadata.execution_time_ms: tiempo de ejecución
```

✅ **Escenario 2: Limpiar actividad de usuarios antigua**
```gherkin
DADO que tengo actividad de hace 200 días
CUANDO envío POST /admin/system/maintenance/cleanup-activity
Con body: { retention_days: 180 }
ENTONCES:
  - Se eliminan registros mayores a 180 días
  - Tabla optimizada automáticamente
  - Espacio en disco liberado
```

✅ **Escenario 3: Optimizar base de datos**
```gherkin
DADO que la base de datos tiene fragmentación
CUANDO envío POST /admin/system/maintenance/optimize-database
ENTONCES:
  - Se ejecuta VACUUM ANALYZE en 5 tablas críticas:
    * auth.users
    * audit_logging.activity_log
    * audit_logging.system_logs
    * educational_content.exercises
    * educational_content.modules
  - Recibo lista de tablas optimizadas
  - Tiempo de ejecución reportado
```

✅ **Escenario 4: Limpiar caché de aplicación**
```gherkin
DADO que necesito refrescar caché
CUANDO envío POST /admin/system/maintenance/clear-cache
ENTONCES:
  - Caché de aplicación se limpia (Redis/in-memory)
  - Recibo confirmación de limpieza
  - Número de entradas eliminadas
```

✅ **Escenario 5: Limpiar sesiones expiradas**
```gherkin
DADO que hay sesiones de hace 7 días
CUANDO envío POST /admin/system/maintenance/cleanup-sessions
ENTONCES:
  - Sesiones expiradas se eliminan
  - Basado en session_timeout_minutes de config
  - Recibo conteo de sesiones terminadas
```

✅ **Escenario 6: Manejar errores de mantenimiento**
```gherkin
DADO que la función SQL falla por permisos
CUANDO ejecuto operación de mantenimiento
ENTONCES:
  - No se lanza excepción no controlada
  - Recibo:
    * success: false
    * message: descripción del error
    * affected_records: 0
    * metadata.error: detalle técnico
```

**Endpoints de mantenimiento:**
- `POST /admin/system/maintenance/cleanup-logs`
- `POST /admin/system/maintenance/cleanup-activity`
- `POST /admin/system/maintenance/optimize-database`
- `POST /admin/system/maintenance/clear-cache`
- `POST /admin/system/maintenance/cleanup-sessions`

**Integración con DB:**
- Función SQL: `audit_logging.cleanup_old_system_logs(p_retention_days)`
- Función SQL: `audit_logging.cleanup_old_user_activity(p_retention_days)`
- PostgreSQL VACUUM ANALYZE para optimización

**Valor de Negocio:** Medio - Salud y rendimiento del sistema a largo plazo

---

## Resumen de Historias de Usuario

### Por Sprint

**Sprint 1:**
- 4 historias de usuario
- Todas relacionadas con funcionalidad crítica (P0)
- 100% implementadas ✅

**Sprint 2:**
- 4 historias de usuario
- Funcionalidad de alta prioridad (P1)
- 100% implementadas ✅

**Sprint 3:**
- 3 historias de usuario
- Funcionalidad de prioridad media (P2)
- 100% implementadas ✅

**Total:** 11 historias de usuario implementadas

### Por Persona

**Administrador del sistema:**
- US-EXT-002-001: Dashboard
- US-EXT-002-004: Configuración
- US-EXT-002-008: Estadísticas avanzadas

**Administrador con can_manage_roles:**
- US-EXT-002-002: Gestión de roles/permisos

**Administrador con can_export_reports:**
- US-EXT-002-003: Generación de reportes

**Administrador de usuarios:**
- US-EXT-002-005: Operaciones masivas
- US-EXT-002-006: Reset de contraseñas

**Administrador de contenido:**
- US-EXT-002-007: Gestión de contenido
- US-EXT-002-009: Historial de aprobaciones

**Administrador analista:**
- US-EXT-002-008: Estadísticas desde vistas DB

**Administrador de sistemas:**
- US-EXT-002-010: Acceso a logs
- US-EXT-002-011: Mantenimiento del sistema

### Valor de Negocio Agregado

**Valor Crítico:**
- Dashboard centralizado
- Control de acceso granular (RBAC)
- Configuración persistente del sistema

**Valor Alto:**
- Generación de reportes
- Operaciones masivas eficientes
- Estadísticas avanzadas para decisiones
- Reset de contraseñas

**Valor Medio:**
- Compatibilidad con frontend
- Historial de aprobaciones (auditoría)
- Mantenimiento automatizado

---

**Documento generado:** 2025-11-19
**Versión:** 1.0
**Estado:** Todas las historias implementadas y validadas
