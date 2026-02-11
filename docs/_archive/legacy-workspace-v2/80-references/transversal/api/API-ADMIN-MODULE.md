# API ADMIN MODULE

**Proyecto:** GAMILIT - Plataforma Educativa Gamificada
**Modulo:** Admin
**Version:** 1.0
**Fecha:** 2025-12-23
**Generado por:** Auditoria de Documentacion

---

## RESUMEN

| Metrica | Valor |
|---------|-------|
| **Controllers** | 22 |
| **Services** | 22 |
| **Endpoints** | 150+ |
| **Entidades** | 6 |
| **Roles requeridos** | super_admin |

---

## CONTROLLERS

1. `AdminAlertsController` - Sistema de alertas
2. `AdminAnalyticsController` - Analisis y reportes
3. `AdminAssignmentsController` - Gestion de asignaciones
4. `AdminBulkOperationsController` - Operaciones masivas
5. `AdminContentController` - Gestion de contenido
6. `AdminDashboardController` - Dashboard principal
7. `AdminDashboardActivityController` - Actividad del dashboard
8. `AdminDashboardStatsController` - Estadisticas del dashboard
9. `AdminGamificationConfigController` - Configuracion de gamificacion
10. `AdminInterventionsController` - Alertas de intervencion
11. `AdminLogsController` - Logs del sistema
12. `AdminMonitoringController` - Monitoreo del sistema
13. `AdminOrganizationsController` - Gestion de organizaciones
14. `AdminProgressController` - Seguimiento de progreso
15. `AdminReportsController` - Reportes
16. `AdminRolesController` - Roles y permisos
17. `AdminSystemController` - Sistema y configuracion
18. `AdminUserStatsController` - Estadisticas de usuarios
19. `AdminUsersController` - Gestion de usuarios
20. `ClassroomAssignmentsController` - Asignacion de aulas
21. `ClassroomTeachersRestController` - REST API aulas-profesores
22. `FeatureFlagsController` - Feature flags

---

## 1. DASHBOARD ENDPOINTS

### GET /admin/dashboard
**Descripcion:** Dashboard completo con estadisticas agregadas

### GET /admin/dashboard/stats
**Descripcion:** Solo estadisticas del sistema

### GET /admin/dashboard/recent-activity
**Descripcion:** Actividad reciente del sistema

### GET /admin/dashboard/user-stats
**Descripcion:** Estadisticas de usuarios

### GET /admin/dashboard/organization-stats
**Descripcion:** Estadisticas de organizaciones

### GET /admin/dashboard/moderation-queue
**Descripcion:** Cola de moderacion de contenido

### GET /admin/dashboard/classroom-overview
**Descripcion:** Vista general de aulas

### GET /admin/dashboard/assignment-stats
**Descripcion:** Estadisticas de asignaciones

### GET /admin/dashboard/actions/recent
**Descripcion:** Acciones administrativas recientes

### GET /admin/dashboard/alerts
**Descripcion:** Alertas activas del sistema

### GET /admin/dashboard/analytics/user-activity
**Descripcion:** Analiticas de actividad de usuarios

---

## 2. USERS ENDPOINTS

### GET /admin/users
**Descripcion:** Listar usuarios con filtros y paginacion

**Query params:**
- `page` (optional)
- `limit` (optional)
- `role` (optional): student, admin_teacher, super_admin
- `status` (optional): active, suspended, inactive
- `search` (optional): busqueda por nombre/email

### GET /admin/users/:id
**Descripcion:** Obtener detalles del usuario

### GET /admin/users/stats
**Descripcion:** Estadisticas detalladas de usuarios

### PUT /admin/users/:id
**Descripcion:** Actualizar usuario

### DELETE /admin/users/:id
**Descripcion:** Eliminar usuario

### POST /admin/users/:id/suspend
**Descripcion:** Suspender usuario

### POST /admin/users/:id/activate
**Descripcion:** Activar usuario suspendido

### POST /admin/users/:id/deactivate
**Descripcion:** Desactivar usuario

### POST /admin/users/:id/reset-password
**Descripcion:** Forzar reseteo de contrasena

---

## 3. BULK OPERATIONS ENDPOINTS

### POST /admin/bulk-operations/suspend-users
**Descripcion:** Suspender multiples usuarios

**Body:**
```json
{
  "userIds": ["uuid1", "uuid2", "uuid3"],
  "reason": "Motivo de suspension"
}
```

### POST /admin/bulk-operations/activate-users
**Descripcion:** Activar multiples usuarios

### POST /admin/bulk-operations/update-role
**Descripcion:** Actualizar roles masivamente

### POST /admin/bulk-operations/delete-users
**Descripcion:** Eliminar multiples usuarios

### GET /admin/bulk-operations/:id
**Descripcion:** Obtener estado de operacion

### GET /admin/bulk-operations
**Descripcion:** Listar operaciones recientes

---

## 4. ORGANIZATIONS ENDPOINTS

### GET /admin/organizations
**Descripcion:** Listar organizaciones/tenants

### GET /admin/organizations/:id
**Descripcion:** Obtener organizacion

### POST /admin/organizations
**Descripcion:** Crear organizacion

### PUT /admin/organizations/:id
**Descripcion:** Actualizar organizacion

### DELETE /admin/organizations/:id
**Descripcion:** Eliminar organizacion

### GET /admin/organizations/:id/stats
**Descripcion:** Estadisticas de organizacion

### GET /admin/organizations/:id/users
**Descripcion:** Usuarios de organizacion

### PATCH /admin/organizations/:id/subscription
**Descripcion:** Actualizar suscripcion

### PATCH /admin/organizations/:id/features
**Descripcion:** Actualizar feature flags de org

---

## 5. CONTENT MANAGEMENT ENDPOINTS

### GET /admin/content/pending
**Descripcion:** Contenido pendiente de aprobacion

### GET /admin/content/exercises/pending
**Descripcion:** Ejercicios pendientes

### POST /admin/content/:id/approve
**Descripcion:** Aprobar contenido

### POST /admin/content/:id/reject
**Descripcion:** Rechazar contenido

### POST /admin/content/version
**Descripcion:** Crear snapshot de version

### GET /admin/content/media
**Descripcion:** Obtener libreria de medios

### DELETE /admin/content/media/:id
**Descripcion:** Eliminar archivo de media

### GET /admin/content/approval-history
**Descripcion:** Historial de aprobaciones

---

## 6. GAMIFICATION CONFIG ENDPOINTS

### GET /admin/gamification/settings
**Descripcion:** Obtener configuracion actual de gamificacion

### PUT /admin/gamification/settings
**Descripcion:** Actualizar configuracion

### POST /admin/gamification/settings/preview
**Descripcion:** Previsualizar impacto de cambios

### POST /admin/gamification/restore-defaults
**Descripcion:** Restaurar valores por defecto

### GET /admin/gamification/parameters
**Descripcion:** Listar parametros por categoria

### GET /admin/gamification/parameters/:id
**Descripcion:** Obtener parametro por ID

### PUT /admin/gamification/parameters/:id
**Descripcion:** Actualizar parametro

### GET /admin/gamification/maya-ranks
**Descripcion:** Obtener configuracion de rangos Maya

### PUT /admin/gamification/maya-ranks/:rankName
**Descripcion:** Actualizar umbral de rango Maya

---

## 7. ANALYTICS ENDPOINTS

### GET /admin/analytics/overview
**Descripcion:** Vista general de analiticas

### GET /admin/analytics/engagement
**Descripcion:** Analiticas de engagement por segmento

### GET /admin/analytics/gamification
**Descripcion:** Distribucion de XP, rangos y niveles

### GET /admin/analytics/activity-timeline
**Descripcion:** Linea de tiempo de actividad

**Query params:**
- `days` (optional): Ultimos N dias (default: 30)

### GET /admin/analytics/top-users
**Descripcion:** Top usuarios por metrica

**Query params:**
- `metric` (optional): xp, exercises, streak
- `limit` (optional): default 10

### GET /admin/analytics/retention
**Descripcion:** Retencion por cohorte (12 meses)

### GET /admin/analytics/export
**Descripcion:** Exportar analiticas a CSV

---

## 8. PROGRESS TRACKING ENDPOINTS

### GET /admin/progress/overview
**Descripcion:** Vista general del sistema

### GET /admin/progress/classrooms/:id
**Descripcion:** Progreso detallado de aula

### GET /admin/progress/students/:id
**Descripcion:** Progreso detallado de estudiante

### GET /admin/progress/students/:id/achievements
**Descripcion:** Logros de estudiante

### GET /admin/progress/modules/:id
**Descripcion:** Estadisticas del modulo

### GET /admin/progress/exercises/:id
**Descripcion:** Estadisticas del ejercicio

### GET /admin/progress/export
**Descripcion:** Exportar datos de progreso a CSV

---

## 9. ALERTS ENDPOINTS

### GET /admin/alerts
**Descripcion:** Listar alertas con filtros

### GET /admin/alerts/stats/summary
**Descripcion:** Estadisticas de alertas

### GET /admin/alerts/:id
**Descripcion:** Obtener alerta por ID

### POST /admin/alerts
**Descripcion:** Crear alerta manual

### PATCH /admin/alerts/:id/acknowledge
**Descripcion:** Reconocer alerta

### PATCH /admin/alerts/:id/resolve
**Descripcion:** Resolver alerta

### PATCH /admin/alerts/:id/suppress
**Descripcion:** Suprimir alerta

---

## 10. INTERVENTIONS ENDPOINTS

### GET /admin/interventions
**Descripcion:** Listar alertas de intervencion

### GET /admin/interventions/:id
**Descripcion:** Obtener alerta por ID

### PATCH /admin/interventions/:id/acknowledge
**Descripcion:** Reconocer alerta

### PATCH /admin/interventions/:id/resolve
**Descripcion:** Resolver alerta

### DELETE /admin/interventions/:id/dismiss
**Descripcion:** Descartar alerta

---

## 11. SYSTEM ENDPOINTS

### GET /admin/system/health
**Descripcion:** Estado de salud del sistema

### GET /admin/system/metrics
**Descripcion:** Metricas del sistema

### GET /admin/system/audit-log
**Descripcion:** Log de auditoria

### GET /admin/system/config
**Descripcion:** Obtener configuracion

### GET /admin/system/config/:category
**Descripcion:** Configuracion por categoria

### PUT /admin/system/config/:category
**Descripcion:** Actualizar configuracion por categoria

### POST /admin/system/maintenance
**Descripcion:** Alternar modo mantenimiento

### POST /admin/system/maintenance/cleanup-logs
**Descripcion:** Limpiar logs antiguos

### POST /admin/system/maintenance/cleanup-activity
**Descripcion:** Limpiar logs de actividad

### POST /admin/system/maintenance/optimize-database
**Descripcion:** Optimizar base de datos

### POST /admin/system/maintenance/clear-cache
**Descripcion:** Limpiar cache

### POST /admin/system/maintenance/cleanup-sessions
**Descripcion:** Limpiar sesiones expiradas

### GET /admin/system/cron/status
**Descripcion:** Estado de trabajos CRON

---

## 12. MONITORING ENDPOINTS

### GET /admin/monitoring/metrics
**Descripcion:** Metricas actuales del sistema

### GET /admin/monitoring/metrics/history
**Descripcion:** Historial de metricas

### GET /admin/monitoring/errors/stats
**Descripcion:** Estadisticas de errores

### GET /admin/monitoring/errors/recent
**Descripcion:** Errores recientes con detalles

### GET /admin/monitoring/errors/trends
**Descripcion:** Tendencias de errores

---

## 13. ROLES & PERMISSIONS ENDPOINTS

### GET /admin/roles
**Descripcion:** Obtener todos los roles

### GET /admin/roles/permissions
**Descripcion:** Obtener permisos disponibles

### GET /admin/roles/:id/permissions
**Descripcion:** Obtener permisos de rol

### PUT /admin/roles/:id/permissions
**Descripcion:** Actualizar permisos de rol

---

## 14. REPORTS ENDPOINTS

### POST /admin/reports/generate
**Descripcion:** Generar nuevo reporte

**Body:**
```json
{
  "type": "users|progress|analytics|content",
  "format": "pdf|csv|xlsx",
  "filters": {...}
}
```

### GET /admin/reports
**Descripcion:** Listar reportes

### GET /admin/reports/:id/download
**Descripcion:** Descargar reporte

### DELETE /admin/reports/:id
**Descripcion:** Eliminar reporte

---

## 15. CLASSROOM-TEACHER ENDPOINTS

### POST /admin/classrooms/assign
**Descripcion:** Asignar aula a profesor

### POST /admin/classrooms/bulk-assign
**Descripcion:** Asignacion masiva de aulas

### DELETE /admin/classrooms/assign/:teacherId/:classroomId
**Descripcion:** Remover asignacion

### POST /admin/classrooms/reassign
**Descripcion:** Reasignar aula a otro profesor

### GET /admin/classrooms/teacher/:teacherId
**Descripcion:** Obtener aulas de profesor

### GET /admin/classrooms/available
**Descripcion:** Obtener aulas disponibles

### GET /admin/classrooms/:classroomId/history
**Descripcion:** Historial de asignaciones

### GET /admin/classrooms/:id/teachers
**Descripcion:** Obtener profesores de aula

### POST /admin/classrooms/:id/teachers
**Descripcion:** Asignar profesor a aula

### DELETE /admin/classrooms/:id/teachers/:tid
**Descripcion:** Remover profesor de aula

### GET /admin/teachers/:id/classrooms
**Descripcion:** Obtener aulas de profesor

### POST /admin/teachers/:id/classrooms
**Descripcion:** Asignar aulas a profesor

### GET /admin/classroom-teachers
**Descripcion:** Listar todas las asignaciones

### POST /admin/classroom-teachers/bulk
**Descripcion:** Asignacion masiva de pares

### GET /admin/classrooms/list
**Descripcion:** Listar aulas para dropdowns

### GET /admin/teachers/list
**Descripcion:** Listar profesores para dropdowns

---

## 16. FEATURE FLAGS ENDPOINTS

### GET /admin/feature-flags
**Descripcion:** Obtener todos los feature flags

### GET /admin/feature-flags/:key
**Descripcion:** Obtener flag por key

### POST /admin/feature-flags/:key/check
**Descripcion:** Verificar si feature esta habilitada

### POST /admin/feature-flags
**Descripcion:** Crear nuevo flag

### PUT /admin/feature-flags/:key
**Descripcion:** Actualizar flag

### POST /admin/feature-flags/:key/enable
**Descripcion:** Habilitar flag

### POST /admin/feature-flags/:key/disable
**Descripcion:** Deshabilitar flag

### PUT /admin/feature-flags/:key/rollout
**Descripcion:** Actualizar rollout percentage

### DELETE /admin/feature-flags/:key
**Descripcion:** Eliminar flag

---

## 17. ASSIGNMENTS ENDPOINTS

### GET /admin/assignments
**Descripcion:** Listar asignaciones con filtros

### GET /admin/assignments/stats
**Descripcion:** Estadisticas globales

### GET /admin/assignments/:id
**Descripcion:** Detalle de asignacion

### GET /admin/assignments/classrooms/:classroomId
**Descripcion:** Asignaciones de aula

### GET /admin/assignments/students/:studentId
**Descripcion:** Asignaciones de estudiante

---

## AUTENTICACION Y AUTORIZACION

Todos los endpoints requieren:
- **Header:** `Authorization: Bearer <jwt_token>`
- **Rol requerido:** `super_admin`

---

## CODIGOS DE RESPUESTA

| Codigo | Descripcion |
|--------|-------------|
| 200 | Exito |
| 201 | Creado |
| 400 | Solicitud invalida |
| 401 | No autenticado |
| 403 | No autorizado (requiere super_admin) |
| 404 | No encontrado |
| 409 | Conflicto (operacion en progreso) |
| 500 | Error del servidor |

---

## SERVICES DEL MODULO

1. `AdminAlertsService`
2. `AdminAnalyticsService`
3. `AdminAssignmentsService`
4. `AdminContentService`
5. `AdminDashboardService`
6. `AdminInterventionsService`
7. `AdminMonitoringService`
8. `AdminOrganizationsService`
9. `AdminProgressService`
10. `AdminReportsService`
11. `AdminRolesService`
12. `AdminSystemService`
13. `AdminUsersService`
14. `BulkOperationsService`
15. `ClassroomAssignmentsService`
16. `FeatureFlagsService`
17. `GamificationConfigService`
18. `DashboardStatsService`
19. `UserStatsService`
20. `ContentStatsService`
21. `RecentActivityService`
22. `AdminQueryBuilder`

---

## ENTIDADES

1. `SystemSetting` - Configuraciones del sistema
2. `FeatureFlag` - Feature flags globales
3. `NotificationSettings` - Config de notificaciones
4. `BulkOperation` - Registro de operaciones masivas
5. `SystemAlert` - Alertas del sistema
6. `AdminReport` - Reportes generados

---

**Generado por:** Requirements-Analyst
**Fecha:** 2025-12-23
**Version:** 1.0
