# Portal Admin - API Reference

**Version:** 1.0.0
**Fecha:** 2026-02-21
**Estado:** Produccion Activa

---

## 1. Overview

El Portal de Administracion expone una superficie de API completa que conecta **21 backend controllers** con **30 frontend hooks** a traves de **16 API service files**. Todos los endpoints admin requieren autenticacion JWT y rol `super_admin`.

### Resumen Numerico

| Capa | Conteo | Ubicacion |
|------|--------|-----------|
| Backend Controllers | 21 | `apps/backend/src/modules/admin/controllers/` |
| Backend Endpoints | ~150 | Prefijo `/api/v1/admin/*` |
| Frontend API Services | 16 | `apps/frontend/src/services/api/admin/` |
| Frontend API Functions | ~95 | Exportadas desde barrel `admin/index.ts` |
| Frontend Hooks | 30 | `apps/frontend/src/apps/admin/hooks/` |
| React Query Keys | ~15 namespaces | Prefijo `['admin', ...]` |

### Base URL

```
DEV:  http://localhost:3006/api/v1
PROD: https://74.208.126.102/api/v1
```

Todos los endpoints listados son relativos a esta base URL. El frontend usa `API_ENDPOINTS.admin.*` definidos en `apps/frontend/src/config/api.config.ts`.

### Autenticacion

Todos los endpoints admin requieren:
- Header `Authorization: Bearer <JWT>`
- Rol del usuario: `super_admin`
- Guard: `@UseGuards(JwtAuthGuard, RolesGuard)` con `@Roles('super_admin')`

---

## 2. API Modules

### 2.1 Dashboard

**Controller:** `admin-dashboard.controller.ts` — `@Controller('admin/dashboard')`

Proporciona datos agregados para la pagina principal del admin: estadisticas globales, actividad reciente, alertas, y metricas de usuario.

| Method | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Dashboard completo (stats + growth) |
| GET | `/admin/dashboard/stats` | Estadisticas globales (usuarios, contenido, gamificacion) |
| GET | `/admin/dashboard/recent-activity` | Actividad reciente de la plataforma |
| GET | `/admin/dashboard/user-stats` | Estadisticas de usuarios (activos, nuevos, por rol) |
| GET | `/admin/dashboard/organization-stats` | Estadisticas por organizacion |
| GET | `/admin/dashboard/moderation-queue` | Cola de moderacion de contenido |
| GET | `/admin/dashboard/classroom-overview` | Vista general de aulas |
| GET | `/admin/dashboard/assignment-stats` | Estadisticas de asignaciones |
| GET | `/admin/dashboard/actions/recent` | Acciones administrativas recientes |
| GET | `/admin/dashboard/alerts` | Alertas del sistema para dashboard |
| GET | `/admin/dashboard/analytics/user-activity` | Actividad de usuarios (timeline) |

**Params notables:**
- `GET /actions/recent` acepta `?limit=N` (default: 10)
- `GET /analytics/user-activity` acepta `?startDate`, `?endDate`, `?groupBy=day|week|month`

---

### 2.2 Users Management

**Controller:** `admin-users.controller.ts` — `@Controller('admin/users')`
**Controller:** `admin-user-stats.controller.ts` — `@Controller('admin/users')`

CRUD completo de usuarios, operaciones de estado (suspend/activate/deactivate), reset de password, y operaciones masivas.

| Method | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/admin/users` | Lista usuarios con filtros y paginacion |
| POST | `/admin/users` | Crear usuario nuevo |
| GET | `/admin/users/stats` | Estadisticas de usuarios |
| GET | `/admin/users/:id` | Detalle de usuario |
| PUT | `/admin/users/:id` | Actualizar usuario |
| DELETE | `/admin/users/:id` | Eliminar usuario |
| POST | `/admin/users/:id/suspend` | Suspender usuario |
| POST | `/admin/users/:id/activate` | Activar usuario |
| POST | `/admin/users/:id/unsuspend` | Reactivar usuario suspendido |
| POST | `/admin/users/:id/deactivate` | Desactivar usuario |
| POST | `/admin/users/:id/reset-password` | Reset de password |

**Filtros para GET /admin/users:**
- `?role=student|admin_teacher|super_admin`
- `?status=active|inactive|suspended|banned|pending`
- `?organizationId=UUID`
- `?search=string` (busqueda por nombre/email)
- `?page=N&limit=N` (paginacion)

**Response:** `{ data: User[], total, page, limit, total_pages }`

---

### 2.3 Bulk Operations

**Controller:** `admin-bulk-operations.controller.ts` — `@Controller('admin/bulk-operations')`

Operaciones masivas sobre multiples usuarios simultaneamente.

| Method | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/admin/bulk-operations/suspend-users` | Suspender multiples usuarios |
| POST | `/admin/bulk-operations/activate-users` | Activar multiples usuarios |
| POST | `/admin/bulk-operations/update-role` | Cambiar rol a multiples usuarios |
| POST | `/admin/bulk-operations/delete-users` | Eliminar multiples usuarios |
| GET | `/admin/bulk-operations/:id` | Estado de operacion masiva |
| GET | `/admin/bulk-operations` | Lista operaciones masivas |

**Nota:** El frontend tambien usa endpoints directos `POST /admin/users/bulk/suspend`, `/bulk/delete`, `/bulk/update-role` que estan en el mismo `admin-users.controller.ts`.

**Body para bulk operations:**
```json
{
  "userIds": ["uuid-1", "uuid-2"],
  "role": "student"  // solo para update-role
}
```

---

### 2.4 Roles & Permissions

**Controller:** `admin-roles.controller.ts` — `@Controller('admin/roles')`

Gestion de roles y permisos del sistema RBAC.

| Method | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/admin/roles` | Lista de roles |
| GET | `/admin/roles/permissions` | Permisos disponibles (catalogo) |
| GET | `/admin/roles/:id/permissions` | Permisos de un rol especifico |
| PUT | `/admin/roles/:id/permissions` | Actualizar permisos de un rol |
| POST | `/admin/roles` | Crear rol nuevo |
| DELETE | `/admin/roles/:id` | Eliminar rol |

**Formato de permisos (backend):**
```json
{
  "permissions": {
    "can_view_users": true,
    "can_edit_content": false,
    "can_manage_gamification": true
  }
}
```

El frontend transforma `Permission[]` a `Record<string, boolean>` antes de enviar.

---

### 2.5 Content Management

**Controller:** `admin-content.controller.ts` — `@Controller('admin/content')`

Workflow de aprobacion de contenido educativo, media library, y control de versiones.

| Method | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/admin/content/pending` | Contenido pendiente de aprobacion |
| GET | `/admin/content/exercises/pending` | Ejercicios pendientes de aprobacion |
| POST | `/admin/content/:id/approve` | Aprobar contenido |
| POST | `/admin/content/exercises/:id/approve` | Aprobar ejercicio |
| POST | `/admin/content/:id/reject` | Rechazar contenido (con razon) |
| POST | `/admin/content/exercises/:id/reject` | Rechazar ejercicio |
| POST | `/admin/content/version` | Crear nueva version de contenido |
| GET | `/admin/content/media` | Biblioteca de medios |
| DELETE | `/admin/content/media/:id` | Eliminar archivo de medios |
| GET | `/admin/content/approval-history` | Historial de aprobaciones |

**Params para reject:**
```json
{ "reason": "El contenido necesita revision de ortografia" }
```

---

### 2.6 Gamification Configuration

**Controller:** `admin-gamification-config.controller.ts` — `@Controller('admin/gamification')`

Configuracion de parametros de gamificacion, rangos maya, preview de impacto, y restauracion de defaults.

| Method | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/admin/gamification/settings` | Configuracion general de gamificacion |
| PUT | `/admin/gamification/settings` | Actualizar configuracion |
| POST | `/admin/gamification/settings/preview` | Preview de impacto de cambios |
| POST | `/admin/gamification/settings/restore-defaults` | Restaurar valores por defecto |
| POST | `/admin/gamification/restore-defaults` | Alias de restauracion |
| GET | `/admin/gamification/parameters` | Lista de parametros configurables |
| GET | `/admin/gamification/parameters/:id` | Detalle de parametro |
| PUT | `/admin/gamification/parameters/:id` | Actualizar parametro |
| GET | `/admin/gamification/maya-ranks` | Configuracion de rangos maya |
| PUT | `/admin/gamification/maya-ranks/:rankName` | Actualizar rango maya |

**API adicional (gamificationConfigApi.ts):**
- `POST /admin/gamification/parameters/:key/reset` — Reset parametro individual
- `POST /admin/gamification/parameters/bulk-update` — Actualizacion masiva
- `POST /admin/gamification/preview-impact` — Preview de impacto por parametro
- `GET /admin/gamification/stats` — Estadisticas generales de gamificacion

**Params para listParameters:**
- `?category=string` (categoria del parametro)
- `?isActive=boolean`
- `?search=string`
- `?page=N&limit=N`

---

### 2.7 Analytics

**Controller:** `admin-analytics.controller.ts` — `@Controller('admin/analytics')`

Analytics globales de la plataforma: engagement, retencion, gamificacion, timeline de actividad.

| Method | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/admin/analytics/overview` | Vista general de analytics |
| GET | `/admin/analytics/engagement` | Metricas de engagement |
| GET | `/admin/analytics/gamification` | Analytics de gamificacion |
| GET | `/admin/analytics/activity-timeline` | Timeline de actividad |
| GET | `/admin/analytics/top-users` | Top usuarios por metricas |
| GET | `/admin/analytics/retention` | Metricas de retencion |
| GET | `/admin/analytics/export` | Exportar analytics a CSV |

**Params notables:**
- `GET /engagement` acepta `?role=string`, `?date_from=ISO`, `?date_to=ISO`
- `GET /activity-timeline` acepta `?days=N`
- `GET /top-users` acepta `?metric=xp|exercises|streak`, `?limit=N`, `?role=string`
- `GET /export` acepta `?type=overview|users|engagement|gamification`, `?format=csv`

---

### 2.8 System & Configuration

**Controller:** `admin-system.controller.ts` — `@Controller('admin/system')`

Health checks, metricas de sistema, logs, audit trail, configuracion por categorias, y mantenimiento.

| Method | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/admin/system/health` | Estado de salud del sistema |
| GET | `/admin/system/metrics` | Metricas del sistema |
| GET | `/admin/system/logs` | Logs de aplicacion |
| GET | `/admin/system/audit-log` | Audit log (intentos de autenticacion) |
| GET | `/admin/system/config` | Configuracion del sistema completa |
| POST | `/admin/system/config` | Actualizar configuracion |
| GET | `/admin/system/config/categories` | Categorias de configuracion |
| POST | `/admin/system/config/validate` | Validar configuracion antes de aplicar |
| GET | `/admin/system/config/:category` | Configuracion por categoria |
| PUT | `/admin/system/config/:category` | Actualizar categoria especifica |
| POST | `/admin/system/maintenance` | Toggle modo mantenimiento |
| POST | `/admin/system/maintenance/cleanup-logs` | Limpiar logs antiguos |
| POST | `/admin/system/maintenance/cleanup-activity` | Limpiar actividad antigua |
| POST | `/admin/system/maintenance/optimize-database` | Optimizar base de datos |
| POST | `/admin/system/maintenance/clear-cache` | Limpiar cache Redis |
| POST | `/admin/system/maintenance/cleanup-sessions` | Limpiar sesiones expiradas |
| GET | `/admin/system/cron/status` | Estado de cron jobs |

**Categorias de configuracion:** `general`, `email`, `notifications`, `security`, `maintenance`

**Params para audit-log:**
- `?user_id=UUID`, `?email=string`, `?ip_address=string`
- `?success=boolean`
- `?start_date=ISO`, `?end_date=ISO`
- `?page=N&limit=N`

---

### 2.9 Monitoring

**Controller:** `admin-monitoring.controller.ts` — `@Controller('admin/monitoring')`

Monitoreo en tiempo real: metricas extendidas, historial, errores, y tendencias.

| Method | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/admin/monitoring/metrics` | Metricas extendidas (CPU, memoria, API response times) |
| GET | `/admin/monitoring/metrics/history` | Historial de metricas |
| GET | `/admin/monitoring/errors/stats` | Estadisticas de errores |
| GET | `/admin/monitoring/errors/recent` | Errores recientes |
| GET | `/admin/monitoring/errors/trends` | Tendencias de errores |

**Params notables:**
- `GET /metrics/history` acepta `?hours=N`
- `GET /errors/stats` acepta `?hours=N`
- `GET /errors/recent` acepta `?limit=N`, `?level=string`
- `GET /errors/trends` acepta `?hours=N`, `?group_by=string`

---

### 2.10 Logs

**Controller:** `admin-logs.controller.ts` — `@Controller('admin/logs')`

| Method | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/admin/logs` | Logs generales del sistema |

---

### 2.11 Reports

**Controller:** `admin-reports.controller.ts` — `@Controller('admin/reports')`

Generacion, listado, descarga, eliminacion, y programacion de reportes administrativos. Persistidos en `admin_dashboard.admin_reports`.

| Method | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/admin/reports/generate` | Generar reporte nuevo |
| GET | `/admin/reports` | Lista de reportes |
| GET | `/admin/reports/:id/download` | Descargar reporte (Blob) |
| GET | `/admin/reports/:id/info` | Informacion de reporte |
| DELETE | `/admin/reports/:id` | Eliminar reporte |
| POST | `/admin/reports/:id/schedule` | Programar reporte |

**Body para generate:**
```json
{
  "type": "progress|users|engagement|gamification",
  "format": "csv|pdf|json",
  "filters": {}
}
```

**Response paginated:** `{ data: Report[], total, page, limit, total_pages }`

---

### 2.12 Alerts

**Controller:** `admin-alerts.controller.ts` — `@Controller('admin/alerts')`

Sistema de alertas del sistema con workflow completo: crear, reconocer, resolver, suprimir.

| Method | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/admin/alerts` | Lista alertas con filtros |
| GET | `/admin/alerts/stats/summary` | Estadisticas resumen de alertas |
| GET | `/admin/alerts/:id` | Detalle de alerta |
| POST | `/admin/alerts` | Crear alerta manual |
| PATCH | `/admin/alerts/:id/acknowledge` | Reconocer alerta |
| PATCH | `/admin/alerts/:id/resolve` | Resolver alerta |
| PATCH | `/admin/alerts/:id/suppress` | Suprimir alerta |

**Body para acknowledge:** `{ "acknowledgment_note": "string" }`
**Body para resolve:** `{ "resolution_note": "string" }`

---

### 2.13 Organizations / Institutions

**Controller:** `admin-organizations.controller.ts` — `@Controller('admin/organizations')`

CRUD de organizaciones (instituciones educativas), gestion de suscripciones y features.

| Method | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/admin/organizations` | Lista organizaciones |
| GET | `/admin/organizations/:id` | Detalle de organizacion |
| POST | `/admin/organizations` | Crear organizacion |
| PUT | `/admin/organizations/:id` | Actualizar organizacion |
| DELETE | `/admin/organizations/:id` | Eliminar organizacion |
| GET | `/admin/organizations/:id/stats` | Estadisticas de la organizacion |
| GET | `/admin/organizations/:id/users` | Usuarios de la organizacion |
| PATCH | `/admin/organizations/:id/subscription` | Actualizar suscripcion |
| PATCH | `/admin/organizations/:id/features` | Actualizar features habilitados |

**OrganizationStats response:**
```typescript
{
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  totalClassrooms: number;
  averageProgress: number;
  storageUsed: string;
  lastActivity: string;
  trialEndsAt?: string;
}
```

---

### 2.14 Progress

**Controller:** `admin-progress.controller.ts` — `@Controller('admin/progress')`

Vista administrativa del progreso academico: por aula, estudiante, modulo, ejercicio. Incluye exportacion CSV.

| Method | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/admin/progress/overview` | Vista general de progreso global |
| GET | `/admin/progress/classrooms/:id` | Progreso por aula |
| GET | `/admin/progress/students/:id` | Progreso por estudiante |
| GET | `/admin/progress/students/:id/achievements` | Logros de estudiante |
| GET | `/admin/progress/modules/:id` | Progreso por modulo educativo |
| GET | `/admin/progress/exercises/:id` | Estadisticas por ejercicio |
| GET | `/admin/progress/export` | Exportar progreso a CSV |

**Params para student progress:** `?classroom_id=UUID`, `?module_id=UUID`
**Params para module progress:** `?classroom_id=UUID`
**Params para export:** `?type=students|classrooms|modules`, `?classroom_id=UUID`, `?format=csv`

---

### 2.15 Feature Flags

**Controller:** `feature-flags.controller.ts` — `@Controller('admin/feature-flags')`

Gestion de feature flags del sistema para releases progresivos y A/B testing.

| Method | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/admin/feature-flags` | Lista feature flags |
| GET | `/admin/feature-flags/:key` | Detalle de flag |
| POST | `/admin/feature-flags/:key/check` | Verificar si flag esta activo |
| POST | `/admin/feature-flags` | Crear flag nuevo |
| PUT | `/admin/feature-flags/:key` | Actualizar flag |
| POST | `/admin/feature-flags/:key/enable` | Habilitar flag |
| POST | `/admin/feature-flags/:key/disable` | Deshabilitar flag |
| PUT | `/admin/feature-flags/:key/rollout` | Configurar porcentaje de rollout |
| DELETE | `/admin/feature-flags/:key` | Eliminar flag |

---

### 2.16 Classroom-Teacher Management

**Controller:** `classroom-teachers-rest.controller.ts` — `@Controller('admin')`

Asignacion y desasignacion de maestros a aulas. Incluye operaciones masivas y listas dropdown.

| Method | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/admin/classrooms/:classroomId/teachers` | Maestros de un aula |
| POST | `/admin/classrooms/:classroomId/teachers` | Asignar maestro a aula |
| DELETE | `/admin/classrooms/:classroomId/teachers/:teacherId` | Remover maestro de aula |
| GET | `/admin/teachers/:teacherId/classrooms` | Aulas de un maestro |
| POST | `/admin/teachers/:teacherId/classrooms` | Asignar aulas a maestro |
| GET | `/admin/classroom-teachers` | Lista todas las asignaciones |
| POST | `/admin/classroom-teachers/bulk` | Asignacion masiva |
| GET | `/admin/classrooms/list` | Lista aulas (dropdown) |
| GET | `/admin/teachers/list` | Lista maestros (dropdown) |

**Params para dropdown lists:** `?search=string`, `?limit=N`, `?schoolId=UUID`

---

### 2.17 Classroom Assignments

**Controller:** `classroom-assignments.controller.ts` — `@Controller('admin/classrooms')`

Asignaciones de aulas con workflow de reassign e historial.

| Method | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | `/admin/classrooms/assign` | Asignar maestro a aula |
| POST | `/admin/classrooms/bulk-assign` | Asignacion masiva |
| DELETE | `/admin/classrooms/assign/:teacherId/:classroomId` | Remover asignacion |
| POST | `/admin/classrooms/reassign` | Reasignar maestro |
| GET | `/admin/classrooms/teacher/:teacherId` | Aulas por maestro |
| GET | `/admin/classrooms/available` | Aulas disponibles |
| GET | `/admin/classrooms/:classroomId/history` | Historial de asignaciones |

---

### 2.18 Assignments (Admin View)

**Controller:** `admin-assignments.controller.ts` — `@Controller('admin/assignments')`

Vista administrativa de asignaciones educativas.

| Method | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/admin/assignments` | Lista de asignaciones |
| GET | `/admin/assignments/stats` | Estadisticas de asignaciones |
| GET | `/admin/assignments/:id` | Detalle de asignacion |
| GET | `/admin/assignments/classrooms/:classroomId` | Asignaciones por aula |
| GET | `/admin/assignments/students/:studentId` | Asignaciones por estudiante |

---

### 2.19 Interventions

**Controller:** `admin-interventions.controller.ts` — `@Controller('admin/interventions')`

Gestion de intervenciones educativas (alertas de riesgo academico).

| Method | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/admin/interventions` | Lista de intervenciones |
| GET | `/admin/interventions/:id` | Detalle de intervencion |
| PATCH | `/admin/interventions/:id/acknowledge` | Reconocer intervencion |
| PATCH | `/admin/interventions/:id/resolve` | Resolver intervencion |
| DELETE | `/admin/interventions/:id/dismiss` | Descartar intervencion |

---

### 2.20 Branding (White-label)

**Controller:** `branding.controller.ts` — `@Controller('tenants/:tenantId/branding')`

Configuracion de marca blanca por tenant. **Nota:** Este controller usa un prefijo diferente (`tenants/:tenantId/branding`), no el prefijo `admin/`.

| Method | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/tenants/:tenantId/branding` | Obtener configuracion de branding |
| PATCH | `/tenants/:tenantId/branding` | Actualizar branding |
| POST | `/tenants/:tenantId/branding/logo` | Subir logo |
| POST | `/tenants/:tenantId/branding/favicon` | Subir favicon |
| GET | `/tenants/:tenantId/branding/css` | Obtener CSS personalizado |
| DELETE | `/tenants/:tenantId/branding/assets` | Eliminar assets de branding |

---

### 2.21 LTI Integration (Admin-managed)

**Base URL:** `/lti/consumers` (no usa prefijo `admin/`, pero gestionado desde portal admin)

Gestion de LTI consumers para integracion con LMS externos.

| Method | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/lti/consumers` | Lista LTI consumers |
| GET | `/lti/consumers/stats` | Estadisticas de consumers |
| GET | `/lti/consumers/:id` | Detalle de consumer |
| GET | `/lti/consumers/tenant/:tenantId` | Consumers por tenant |
| POST | `/lti/consumers` | Crear consumer |
| PATCH | `/lti/consumers/:id` | Actualizar consumer |
| POST | `/lti/consumers/:id/verify` | Verificar consumer |
| POST | `/lti/consumers/:id/activate` | Activar consumer |
| DELETE | `/lti/consumers/:id` | Desactivar consumer (soft delete) |
| POST | `/lti/consumers/:id/test-connection` | Test de conexion |
| POST | `/lti/consumers/:id/regenerate-credentials` | Regenerar credenciales |
| GET | `/lti/launch-urls` | URLs de configuracion LTI |
| POST | `/lti/grade-passbacks` | Enviar calificacion al LMS |
| GET | `/lti/grade-passbacks` | Lista grade passbacks |
| POST | `/lti/grade-passbacks/:id/retry` | Reintentar passback fallido |
| POST | `/lti/sessions` | Crear sesion LTI |
| GET | `/lti/sessions/:id` | Obtener sesion |
| GET | `/lti/sessions/:id/validate` | Validar sesion |

---

## 3. Frontend Hooks to Backend Mapping

### 3.1 Hook to API Service to Controller Mapping

| Frontend Hook | API Service File | Backend Controller(s) |
|---|---|---|
| `useAdminDashboard` | `dashboardApi.ts`, `monitoringApi.ts` | `admin-dashboard`, `admin-system` |
| `useUserManagement` | `usersApi.ts`, `adminAPI.ts` | `admin-users` |
| `useCreateUserFlow` | `organizationsApi.ts`, `usersApi.ts` | `admin-organizations`, `admin-users` |
| `useAdminData` | Direct `apiClient` calls | `admin-dashboard` (activity), `admin-monitoring` (errors) |
| `useOrganizations` | `organizationsApi.ts` | `admin-organizations` |
| `useContentQueries` | `contentApi.ts` | `admin-content` |
| `useGamificationConfig` | `gamificationConfigApi.ts` | `admin-gamification-config` |
| `useAnalytics` | `analyticsApi.ts` | `admin-analytics` |
| `useMonitoring` | `monitoringApi.ts` | `admin-monitoring` |
| `useSystemMonitoring` | Direct `apiClient` calls | `admin-system` (health, alerts) |
| `useSystemMetrics` | Direct `apiClient` calls | `admin-system` (metrics) |
| `useSystemLogs` | `monitoringApi.ts` | `admin-system` (logs) |
| `useAuditLogs` | `monitoringApi.ts` | `admin-system` (audit-log) |
| `useReports` | `reportsApi.ts` | `admin-reports` |
| `useAlerts` | `alertsApi.ts` | `admin-alerts` |
| `useRoles` | `rolesApi.ts` | `admin-roles` |
| `useRolePermissions` | `rolesApi.ts` | `admin-roles` |
| `useFeatureFlags` | Direct `apiClient` calls | `feature-flags` |
| `useSettings` (deprecated) | `settingsApi.ts` | `admin-system` |
| `useSystemConfig` | `settingsApi.ts` | `admin-system` (config) |
| `useConfigCategories` | `settingsApi.ts` | `admin-system` (config/categories, config/validate) |
| `useClassroomTeacher` | `classroomTeacherApi.ts` | `classroom-teachers-rest` |
| `useProgress` | `progressApi.ts` | `admin-progress` |
| `useLtiConsumers` | `ltiAPI.ts` | LTI module controllers |
| `useAdminAssignments` | Direct `apiClient` calls | `admin-assignments` |
| `useClassroomsList` | Direct `apiClient` calls | `social/classrooms` |
| `useContentManagement` | `contentApi.ts` | `admin-content` |
| `useInstitutionActions` | `organizationsApi.ts` | `admin-organizations` |
| `useAdminPageSetup` | — (UI-only) | — |
| `useModalBehavior` | — (UI-only) | — |
| `useUserActions` | `usersApi.ts` | `admin-users` |

### 3.2 React Query Key Namespaces

| Namespace | Hook(s) | Prefijo |
|---|---|---|
| Dashboard | `useAdminDashboard` | `['admin', 'dashboard', ...]` |
| Users | `useUserManagement` | `['admin', 'users', ...]` |
| Organizations | `useOrganizations` | `['admin', 'organizations', ...]` |
| Analytics | `useAnalytics` | `['admin', 'analytics', ...]` |
| Monitoring | `useMonitoring` | `['admin', 'monitoring', ...]` |
| System Monitoring | `useSystemMonitoring` | `['admin', 'system-monitoring', ...]` |
| System Metrics | `useSystemMetrics` | `['admin', 'system-metrics']` |
| System Logs | `useSystemLogs` | `['admin', 'system-logs', ...]` |
| Audit Logs | `useAuditLogs` | `['admin', 'audit-logs', ...]` |
| Reports | `useReports` | `['admin', 'reports', ...]` |
| Alerts | `useAlerts` | `['admin', 'alerts', ...]` |
| Roles | `useRoles` | `['admin', 'roles', ...]` |
| Feature Flags | `useFeatureFlags` | `['admin', 'feature-flags', ...]` |
| System Config | `useSystemConfig` | `['admin', 'system-config', ...]` |
| Config Categories | `useConfigCategories` | `['admin', 'config', 'categories']` |
| Classroom Teachers | `useClassroomTeacher` | `['classroom-teachers', ...]` |
| Progress | `useProgress` | `['admin', 'progress', ...]` |
| LTI Consumers | `useLtiConsumers` | `['admin', 'lti-consumers', ...]` |
| Gamification Config | `useGamificationConfig` | `['gamification', ...]` |
| Create User Flow | `useCreateUserFlow` | `['admin', 'create-user-flow', ...]` |
| Admin Activity | `useAdminData` | `['admin', 'activity', ...]` |
| Admin Errors | `useAdminData` | `['admin', 'errors', ...]` |

---

## 4. Endpoint Reference by Domain

### 4.1 Dashboard Domain

**Frontend API:** `services/api/admin/dashboardApi.ts`
**Backend:** `admin-dashboard.controller.ts`

| Function | Method | URL | Params | Response Type |
|----------|--------|-----|--------|---------------|
| `getAdminDashboard()` | GET | `/admin/dashboard` | — | `DashboardData` |
| `getRecentActions(limit)` | GET | `/admin/dashboard/actions/recent` | `?limit=N` | `AdminAction[]` |
| `getAlerts()` | GET | `/admin/dashboard/alerts` | — | `SystemAlert[]` |
| `getUserActivity(params)` | GET | `/admin/dashboard/analytics/user-activity` | `?startDate, ?endDate, ?groupBy` | `UserActivityData[]` |
| `getMayaRanks()` | GET | `/admin/gamification/maya-ranks` | — | `MayaRankConfig[]` |

### 4.2 Users Domain

**Frontend API:** `services/api/admin/usersApi.ts`
**Backend:** `admin-users.controller.ts`

| Function | Method | URL | Params/Body | Response Type |
|----------|--------|-----|-------------|---------------|
| `getUsers(filters)` | GET | `/admin/users` | `?role, ?status, ?search, ?page, ?limit` | `PaginatedResponse<User>` |
| `getUser(id)` | GET | `/admin/users/:id` | — | `UserDetails` |
| `updateUser(id, data)` | PUT | `/admin/users/:id` | `{ name, email, role, status }` | `User` |
| `deleteUser(id)` | DELETE | `/admin/users/:id` | — | `void` |
| `activateUser(id)` | POST | `/admin/users/:id/activate` | — | `User` |
| `deactivateUser(id)` | POST | `/admin/users/:id/deactivate` | — | `User` |
| `suspendUser(id)` | POST | `/admin/users/:id/suspend` | — | `User` |
| `unsuspendUser(id)` | POST | `/admin/users/:id/unsuspend` | — | `User` |

### 4.3 Roles Domain

**Frontend API:** `services/api/admin/rolesApi.ts`
**Backend:** `admin-roles.controller.ts`

| Function | Method | URL | Params/Body | Response Type |
|----------|--------|-----|-------------|---------------|
| `getRoles()` | GET | `/admin/roles` | — | `Role[]` |
| `getRolePermissions(roleId)` | GET | `/admin/roles/:id/permissions` | — | `RolePermissions` |
| `updateRolePermissions(roleId, perms)` | PUT | `/admin/roles/:id/permissions` | `{ permissions: Record<string, boolean> }` | `RolePermissions` |
| `getAvailablePermissions()` | GET | `/admin/roles/permissions` | — | `AvailablePermission[]` |

### 4.4 Content Domain

**Frontend API:** `services/api/admin/contentApi.ts`
**Backend:** `admin-content.controller.ts`

| Function | Method | URL | Params/Body | Response Type |
|----------|--------|-----|-------------|---------------|
| `getPendingContent(filters)` | GET | `/admin/content/pending` | `?page, ?limit` | `PaginatedResponse<PendingContent>` |
| `approveContent(id)` | POST | `/admin/content/:id/approve` | — | `void` |
| `rejectContent(id, reason)` | POST | `/admin/content/:id/reject` | `{ reason }` | `void` |
| `getMediaLibrary(filters)` | GET | `/admin/content/media` | `?page, ?limit` | `PaginatedResponse<MediaFile>` |
| `deleteMediaFile(id)` | DELETE | `/admin/content/media/:id` | — | `void` |
| `getApprovalHistory(page)` | GET | `/admin/content/approval-history` | `?page` | `PaginatedResponse<ApprovalHistory>` |

### 4.5 Gamification Config Domain

**Frontend API:** `services/api/admin/gamificationConfigApi.ts` + `gamificationApi.ts`
**Backend:** `admin-gamification-config.controller.ts`

| Function | Method | URL | Params/Body | Response Type |
|----------|--------|-----|-------------|---------------|
| `gamificationConfigApi.listParameters(query)` | GET | `/admin/gamification/parameters` | `?category, ?isActive, ?search, ?page, ?limit` | `{ data, total, page, limit }` |
| `gamificationConfigApi.getParameter(key)` | GET | `/admin/gamification/parameters/:key` | — | `GamificationParameter` |
| `gamificationConfigApi.updateParameter(key, data)` | PATCH | `/admin/gamification/parameters/:key` | `{ value, reason }` | `GamificationParameter` |
| `gamificationConfigApi.resetParameter(key)` | POST | `/admin/gamification/parameters/:key/reset` | — | `GamificationParameter` |
| `gamificationConfigApi.bulkUpdateParameters(data)` | POST | `/admin/gamification/parameters/bulk-update` | `BulkUpdateParametersDto` | `{ updated, parameters }` |
| `gamificationConfigApi.listMayaRanks()` | GET | `/admin/gamification/maya-ranks` | — | `MayaRankConfig[]` |
| `gamificationConfigApi.getMayaRank(id)` | GET | `/admin/gamification/maya-ranks/:id` | — | `MayaRankConfig` |
| `gamificationConfigApi.updateMayaRank(id, data)` | PATCH | `/admin/gamification/maya-ranks/:id` | `UpdateMayaRankDto` | `MayaRankConfig` |
| `gamificationConfigApi.previewImpact(data)` | POST | `/admin/gamification/preview-impact` | `{ key, newValue }` | `ImpactPreview` |
| `gamificationConfigApi.getStats()` | GET | `/admin/gamification/stats` | — | `GamificationStats` |
| `gamificationConfigApi.restoreDefaults()` | POST | `/admin/gamification/restore-defaults` | — | `RestoreDefaultsResult` |
| `getGamificationSettings()` | GET | `/admin/gamification/settings` | — | `GamificationSettings` |
| `updateGamificationSettings(cat, data)` | PUT | `/admin/gamification/settings` | `{ category, data }` | `GamificationSettings` |
| `previewGamificationChanges(changes)` | POST | `/admin/gamification/settings/preview` | `{ changes }` | `Record<string, unknown>` |
| `restoreGamificationDefaults()` | POST | `/admin/gamification/restore-defaults` | — | `GamificationSettings` |

### 4.6 Analytics Domain

**Frontend API:** `services/api/admin/analyticsApi.ts`
**Backend:** `admin-analytics.controller.ts`

| Function | Method | URL | Params | Response Type |
|----------|--------|-----|--------|---------------|
| `getAnalyticsOverview()` | GET | `/admin/analytics/overview` | — | `AnalyticsOverview` |
| `getEngagementAnalytics(params)` | GET | `/admin/analytics/engagement` | `?role, ?date_from, ?date_to` | `EngagementAnalytics` |
| `getGamificationAnalytics()` | GET | `/admin/analytics/gamification` | — | `GamificationAnalytics` |
| `getActivityTimeline(params)` | GET | `/admin/analytics/activity-timeline` | `?days` | `ActivityTimeline` |
| `getTopUsers(params)` | GET | `/admin/analytics/top-users` | `?metric, ?limit, ?role` | `TopUsers` |
| `getRetentionAnalytics()` | GET | `/admin/analytics/retention` | — | `RetentionAnalytics` |
| `exportAnalyticsCSV(params)` | GET | `/admin/analytics/export` | `?type, ?format=csv` | `Blob` |

### 4.7 Monitoring Domain

**Frontend API:** `services/api/admin/monitoringApi.ts`
**Backend:** `admin-system.controller.ts` + `admin-monitoring.controller.ts`

| Function | Method | URL | Params | Response Type |
|----------|--------|-----|--------|---------------|
| `getSystemHealth()` | GET | `/admin/system/health` | — | `SystemHealth` |
| `getSystemMetrics()` | GET | `/admin/system/metrics` | — | `SystemMetrics` |
| `getSystemLogs(filters)` | GET | `/admin/system/logs` | `?level, ?page, ?limit` | `PaginatedResponse<LogEntry>` |
| `getAuditLogs(filters)` | GET | `/admin/system/audit-log` | `?user_id, ?email, ?ip_address, ?success, ?start_date, ?end_date, ?page, ?limit` | `PaginatedResponse<AuditLogEntry>` |
| `toggleMaintenanceMode(enabled, msg)` | POST | `/admin/system/maintenance` | `{ enabled, message }` | `MaintenanceMode` |
| `getExtendedMetrics()` | GET | `/admin/monitoring/metrics` | — | `ExtendedSystemMetrics` |
| `getMetricsHistory(params)` | GET | `/admin/monitoring/metrics/history` | `?hours` | `MetricsHistoryDataPoint[]` |
| `getErrorStats(params)` | GET | `/admin/monitoring/errors/stats` | `?hours` | `ErrorStats` |
| `getRecentErrors(params)` | GET | `/admin/monitoring/errors/recent` | `?limit, ?level` | `{ errors: RecentError[] }` |
| `getErrorTrends(params)` | GET | `/admin/monitoring/errors/trends` | `?hours, ?group_by` | `{ trends: ErrorTrendDataPoint[] }` |

### 4.8 Reports Domain

**Frontend API:** `services/api/admin/reportsApi.ts`
**Backend:** `admin-reports.controller.ts`

| Function | Method | URL | Params/Body | Response Type |
|----------|--------|-----|-------------|---------------|
| `generateReport(params)` | POST | `/admin/reports/generate` | `GenerateReportParams` | `Report` |
| `getReports(filters)` | GET | `/admin/reports` | `?page, ?limit, ?type, ?status` | `PaginatedResponse<Report>` |
| `downloadReport(reportId)` | GET | `/admin/reports/:id/download` | — | `Blob` |
| `deleteReport(reportId)` | DELETE | `/admin/reports/:id` | — | `void` |
| `scheduleReport(reportId, schedule)` | POST | `/admin/reports/:id/schedule` | `{ cron, timezone, ... }` | `Report` |

### 4.9 Alerts Domain

**Frontend API:** `services/api/admin/alertsApi.ts`
**Backend:** `admin-alerts.controller.ts`

| Function | Method | URL | Params/Body | Response Type |
|----------|--------|-----|-------------|---------------|
| `listAlerts(filters)` | GET | `/admin/alerts` | `?type, ?severity, ?status, ?page, ?limit` | `PaginatedResponse<Alert>` |
| `getAlertById(id)` | GET | `/admin/alerts/:id` | — | `Alert` |
| `getAlertsStats()` | GET | `/admin/alerts/stats/summary` | — | `AlertsStats` |
| `createAlert(data)` | POST | `/admin/alerts` | `Partial<Alert>` | `Alert` |
| `acknowledgeAlert(id, note)` | PATCH | `/admin/alerts/:id/acknowledge` | `{ acknowledgment_note }` | `Alert` |
| `resolveAlert(id, note)` | PATCH | `/admin/alerts/:id/resolve` | `{ resolution_note }` | `Alert` |
| `suppressAlert(id)` | PATCH | `/admin/alerts/:id/suppress` | — | `Alert` |

### 4.10 Organizations Domain

**Frontend API:** `services/api/admin/organizationsApi.ts`
**Backend:** `admin-organizations.controller.ts`

| Function | Method | URL | Params/Body | Response Type |
|----------|--------|-----|-------------|---------------|
| `getOrganizations(filters)` | GET | `/admin/organizations` | `?page, ?limit, ?search` | `PaginatedResponse<Organization>` |
| `getOrganization(id)` | GET | `/admin/organizations/:id` | — | `Organization` |
| `createOrganization(data)` | POST | `/admin/organizations` | `Partial<Organization>` | `Organization` |
| `updateOrganization(id, data)` | PUT | `/admin/organizations/:id` | `Partial<Organization>` | `Organization` |
| `deleteOrganization(id)` | DELETE | `/admin/organizations/:id` | — | `void` |
| `getOrganizationUsers(id, page)` | GET | `/admin/organizations/:id/users` | `?page` | `PaginatedResponse<OrganizationUser>` |
| `updateOrganizationSubscription(id, sub)` | PATCH | `/admin/organizations/:id/subscription` | `{ plan, ... }` | `Organization` |
| `updateOrganizationFeatures(id, features)` | PATCH | `/admin/organizations/:id/features` | `{ features: string[] }` | `Organization` |
| `getOrganizationStats(id)` | GET | `/admin/organizations/:id/stats` | — | `OrganizationStats` |

### 4.11 Settings Domain

**Frontend API:** `services/api/admin/settingsApi.ts`
**Backend:** `admin-system.controller.ts`

| Function | Method | URL | Params/Body | Response Type |
|----------|--------|-----|-------------|---------------|
| `getSystemConfig()` | GET | `/admin/system/config` | — | `SystemConfig` |
| `updateSystemConfig(config)` | POST | `/admin/system/config` | `SystemConfig` | `SystemConfig` |
| `getConfigCategories()` | GET | `/admin/system/config/categories` | — | `SettingsCategory[]` |
| `getCategoryConfig(category)` | GET | `/admin/system/config/:category` | — | `Record<string, unknown>` |
| `updateCategoryConfig(cat, settings)` | PUT | `/admin/system/config/:category` | `Record<string, unknown>` | `Record<string, unknown>` |
| `validateConfig(cat, settings)` | POST | `/admin/system/config/validate` | `{ category, settings }` | `{ valid, errors? }` |

### 4.12 Progress Domain

**Frontend API:** `services/api/admin/progressApi.ts`
**Backend:** `admin-progress.controller.ts`

| Function | Method | URL | Params | Response Type |
|----------|--------|-----|--------|---------------|
| `getProgressOverview()` | GET | `/admin/progress/overview` | — | `ProgressOverview` |
| `getClassroomProgress(id)` | GET | `/admin/progress/classrooms/:id` | — | `ClassroomProgress` |
| `getStudentProgress(id, filters)` | GET | `/admin/progress/students/:id` | `?classroom_id, ?module_id` | `StudentProgress` |
| `getModuleProgress(id, params)` | GET | `/admin/progress/modules/:id` | `?classroom_id` | `ModuleProgressStats` |
| `getExerciseStats(id)` | GET | `/admin/progress/exercises/:id` | — | `ExerciseStats` |
| `exportProgressCSV(params)` | GET | `/admin/progress/export` | `?type, ?classroom_id, ?format` | `Blob` |
| `getAllClassrooms(params)` | GET | `/social/classrooms` | `?schoolId` | `ClassroomBasic[]` |

### 4.13 Classroom-Teacher Domain

**Frontend API:** `services/api/admin/classroomTeacherApi.ts`
**Backend:** `classroom-teachers-rest.controller.ts`

| Function | Method | URL | Params/Body | Response Type |
|----------|--------|-----|-------------|---------------|
| `getClassroomTeachers(id)` | GET | `/admin/classrooms/:id/teachers` | — | `ClassroomWithTeachers` |
| `assignTeacherToClassroom(id, data)` | POST | `/admin/classrooms/:id/teachers` | `AssignTeacherToClassroomDto` | `ClassroomTeacherAssignment` |
| `removeTeacherFromClassroom(cId, tId)` | DELETE | `/admin/classrooms/:cId/teachers/:tId` | — | `void` |
| `getTeacherClassrooms(teacherId)` | GET | `/admin/teachers/:id/classrooms` | — | `TeacherWithClassrooms` |
| `assignClassroomsToTeacher(tId, data)` | POST | `/admin/teachers/:id/classrooms` | `AssignClassroomsToTeacherDto` | `{ assigned: number }` |
| `listAllAssignments(query)` | GET | `/admin/classroom-teachers` | `?schoolId, ?page, ?limit` | `{ data, total, page, limit }` |
| `bulkAssign(data)` | POST | `/admin/classroom-teachers/bulk` | `BulkAssignDto` | `{ assigned: number }` |
| `listClassroomsForDropdown(query)` | GET | `/admin/classrooms/list` | `?search, ?limit, ?schoolId` | `ClassroomListItem[]` |
| `listTeachersForDropdown(query)` | GET | `/admin/teachers/list` | `?search, ?limit, ?schoolId` | `TeacherListItem[]` |

### 4.14 Achievements Domain (Admin View)

**Frontend API:** `services/api/admin/achievementsApi.ts`
**Backend:** `gamification/achievements.controller.ts` (gamification module, not admin)

| Function | Method | URL | Params/Body | Response Type |
|----------|--------|-----|-------------|---------------|
| `listAchievements(query)` | GET | `/gamification/achievements` | `?category, ?isActive, ?search, ?page, ?limit` | `{ data, total }` |
| `getAchievement(id)` | GET | `/gamification/achievements/:id` | — | `AdminAchievement` |
| `toggleActive(id, isActive)` | PATCH | `/gamification/achievements/:id` | `{ is_active }` | `AdminAchievement` |
| `updateAchievement(id, data)` | — | — | (Not yet implemented in backend) | `AdminAchievement` |

### 4.15 LTI Integration Domain

**Frontend API:** `services/api/admin/ltiAPI.ts`
**Backend:** LTI module controllers

| Function | Method | URL | Params/Body | Response Type |
|----------|--------|-----|-------------|---------------|
| `getConsumers()` | GET | `/lti/consumers` | — | `LtiConsumer[]` |
| `getConsumerStats()` | GET | `/lti/consumers/stats` | — | `LtiConsumerStats` |
| `getConsumer(id)` | GET | `/lti/consumers/:id` | — | `LtiConsumer` |
| `getConsumersByTenant(tenantId)` | GET | `/lti/consumers/tenant/:tenantId` | — | `LtiConsumer[]` |
| `createConsumer(data)` | POST | `/lti/consumers` | `CreateLtiConsumerDto` | `LtiConsumer` |
| `updateConsumer(id, data)` | PATCH | `/lti/consumers/:id` | `UpdateLtiConsumerDto` | `LtiConsumer` |
| `verifyConsumer(id)` | POST | `/lti/consumers/:id/verify` | — | `LtiConsumer` |
| `activateConsumer(id)` | POST | `/lti/consumers/:id/activate` | — | `LtiConsumer` |
| `deactivateConsumer(id)` | DELETE | `/lti/consumers/:id` | — | `void` |
| `testConnection(id)` | POST | `/lti/consumers/:id/test-connection` | — | `ConnectionTestResult` |
| `regenerateCredentials(id)` | POST | `/lti/consumers/:id/regenerate-credentials` | — | `LtiCredentials` |
| `getLaunchUrls()` | GET | `/lti/launch-urls` | — | `LtiLaunchUrl` |
| `sendGradePassback(data)` | POST | `/lti/grade-passbacks` | `{ consumerId, userId, ... }` | `LTIGradePassback` |
| `getGradePassbacks(filters)` | GET | `/lti/grade-passbacks` | `?consumerId, ?status` | `LTIGradePassback[]` |
| `retryGradePassback(id)` | POST | `/lti/grade-passbacks/:id/retry` | — | `LTIGradePassback` |

### 4.16 Feature Flags Domain

**Frontend API:** Direct `apiClient` calls in `useFeatureFlags.ts`
**Backend:** `feature-flags.controller.ts`

| Function | Method | URL | Params/Body | Response Type |
|----------|--------|-----|-------------|---------------|
| (list) | GET | `/admin/feature-flags` | — | `FeatureFlag[]` |
| (get) | GET | `/admin/feature-flags/:key` | — | `FeatureFlag` |
| (create) | POST | `/admin/feature-flags` | `CreateFlagDto` | `FeatureFlag` |
| (update) | PUT | `/admin/feature-flags/:key` | `UpdateFlagDto` | `FeatureFlag` |
| (toggle) | POST | `/admin/feature-flags/:key/enable` | — | `FeatureFlag` |
| (toggle) | POST | `/admin/feature-flags/:key/disable` | — | `FeatureFlag` |
| (delete) | DELETE | `/admin/feature-flags/:key` | — | `void` |

---

## 5. Orphan Endpoints (Frontend-only, sin backend)

Los siguientes endpoints estan definidos en `api.config.ts` pero marcados como ORPHAN (sin backend implementado):

| Endpoint | Descripcion | Status |
|----------|-------------|--------|
| `GET /admin/activity` | Activity logs | No backend |
| `GET /admin/errors` | Error management | No backend (usa monitoring) |
| `POST /admin/errors/:id/resolve` | Resolver error | No backend |
| `GET /admin/assignments/export` | Exportar asignaciones | No backend |
| `GET /admin/metrics` | Metrics shorthand | No backend (usa monitoring) |

---

## 6. Data Transformation Notes

### snake_case to camelCase

El backend retorna campos en `snake_case` mientras el frontend espera `camelCase`. Las transformaciones se aplican en la capa de API services:

- `last_sign_in_at` -> `lastLogin` (usersApi)
- `full_name` / `display_name` -> `name` (usersApi)
- `total_pages` -> `totalPages` (todas las respuestas paginadas)
- `is_active` -> `isActive` (gamificationConfigApi)
- `min_xp` / `max_xp` -> `minXP` / `maxXP` (dashboardApi, maya ranks)

### Response Wrapping

El backend envuelve respuestas en `{ success: boolean, data: T }`. El interceptor de `apiClient` desenvuelve automaticamente, por lo que `response.data` ya contiene el payload directo.

### Paginated Response Format

**Backend:** `{ data: T[], total, page, limit, total_pages }`
**Frontend:** `{ items: T[], pagination: { page, totalPages, totalItems, limit } }`

La transformacion se aplica en cada API service que maneja paginacion.

---

*Generado desde analisis de codigo fuente. SSOT: `apps/frontend/src/config/api.config.ts` + `apps/backend/src/modules/admin/controllers/`*
