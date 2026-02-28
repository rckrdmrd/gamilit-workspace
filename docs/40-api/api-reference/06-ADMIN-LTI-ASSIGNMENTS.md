---
title: "API Reference - Admin, LTI & Assignments"
status: activo
last_updated: "2026-02-28"
---

# API Reference - Admin, LTI & Assignments

> Volver al [API Reference Hub](../API-REFERENCE.md)

---

## 20. Admin Module (159 endpoints)

> **Guard:** `JwtAuthGuard` + `AdminGuard` (role: admin / super_admin)
> **Prefijo base:** `/api/v1/admin`
> **Controllers:** 21 archivos | Rutas reales extraidas de los controladores en `apps/backend/src/modules/admin/controllers/`

### Dashboard (11 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/dashboard` | Datos completos del dashboard |
| GET | `/admin/dashboard/stats` | Estadisticas del dashboard |
| GET | `/admin/dashboard/recent-activity` | Actividad reciente de usuarios |
| GET | `/admin/dashboard/user-stats` | Estadisticas agregadas de usuarios |
| GET | `/admin/dashboard/organization-stats` | Estadisticas de organizaciones |
| GET | `/admin/dashboard/moderation-queue` | Cola de moderacion de contenido |
| GET | `/admin/dashboard/classroom-overview` | Vista general de aulas |
| GET | `/admin/dashboard/assignment-stats` | Estadisticas de entregas de asignaciones |
| GET | `/admin/dashboard/actions/recent` | Acciones administrativas recientes |
| GET | `/admin/dashboard/alerts` | Alertas activas del sistema |
| GET | `/admin/dashboard/analytics/user-activity` | Analiticas de actividad de usuarios |

### Gestion de Usuarios (14 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/users` | Listar usuarios con filtros y paginacion |
| POST | `/admin/users` | Crear nuevo usuario |
| GET | `/admin/users/stats` | Estadisticas de usuarios |
| GET | `/admin/users/:id` | Obtener detalle de usuario |
| PUT | `/admin/users/:id` | Actualizar informacion de usuario |
| DELETE | `/admin/users/:id` | Eliminar usuario |
| POST | `/admin/users/:id/suspend` | Suspender cuenta de usuario |
| POST | `/admin/users/:id/activate` | Activar cuenta suspendida |
| POST | `/admin/users/:id/unsuspend` | Reactivar cuenta (alias de activate) |
| POST | `/admin/users/:id/deactivate` | Desactivar cuenta temporalmente |
| POST | `/admin/users/:id/reset-password` | Forzar reset de password |
| POST | `/admin/users/bulk/suspend` | Suspension masiva de usuarios |
| POST | `/admin/users/bulk/delete` | Eliminacion masiva de usuarios |
| POST | `/admin/users/bulk/update-role` | Actualizacion masiva de roles |

### Roles y Permisos (6 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/roles` | Listar todos los roles |
| POST | `/admin/roles` | Crear rol personalizado |
| GET | `/admin/roles/permissions` | Listar permisos disponibles |
| GET | `/admin/roles/:id/permissions` | Permisos de un rol especifico |
| PUT | `/admin/roles/:id/permissions` | Actualizar permisos de un rol |
| DELETE | `/admin/roles/:id` | Eliminar (desactivar) un rol |

### Organizaciones (9 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/organizations` | Listar organizaciones con filtros |
| POST | `/admin/organizations` | Crear organizacion (requiere super_admin) |
| GET | `/admin/organizations/:id` | Detalle de organizacion |
| PUT | `/admin/organizations/:id` | Actualizar organizacion |
| DELETE | `/admin/organizations/:id` | Eliminar organizacion |
| GET | `/admin/organizations/:id/stats` | Estadisticas de organizacion |
| GET | `/admin/organizations/:id/users` | Usuarios de la organizacion |
| PATCH | `/admin/organizations/:id/subscription` | Actualizar suscripcion |
| PATCH | `/admin/organizations/:id/features` | Actualizar feature flags de organizacion |

### Analytics (7 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/analytics/overview` | Vista general de analiticas |
| GET | `/admin/analytics/engagement` | Analiticas de engagement por segmento |
| GET | `/admin/analytics/gamification` | Distribucion de XP, rangos y niveles |
| GET | `/admin/analytics/activity-timeline` | Timeline de actividad diaria (N dias) |
| GET | `/admin/analytics/top-users` | Top usuarios por metrica (xp, exercises, streak) |
| GET | `/admin/analytics/retention` | Analiticas de retencion por cohorte |
| GET | `/admin/analytics/export` | Exportar analiticas a CSV |

### Gestion de Contenido (10 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/content/pending` | Contenido pendiente de aprobacion |
| GET | `/admin/content/exercises/pending` | Ejercicios pendientes (alias) |
| POST | `/admin/content/:id/approve` | Aprobar contenido |
| POST | `/admin/content/exercises/:id/approve` | Aprobar ejercicio (alias) |
| POST | `/admin/content/:id/reject` | Rechazar contenido con razon |
| POST | `/admin/content/exercises/:id/reject` | Rechazar ejercicio (alias) |
| POST | `/admin/content/version` | Crear snapshot de version |
| GET | `/admin/content/media` | Biblioteca de medios |
| DELETE | `/admin/content/media/:id` | Eliminar archivo de medios |
| GET | `/admin/content/approval-history` | Historial de aprobaciones |

### Progreso Educativo (7 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/progress/overview` | Vista general de progreso del sistema |
| GET | `/admin/progress/classrooms/:id` | Progreso detallado de un aula |
| GET | `/admin/progress/students/:id` | Progreso detallado de un estudiante |
| GET | `/admin/progress/students/:id/achievements` | Achievements de un estudiante |
| GET | `/admin/progress/modules/:id` | Estadisticas de progreso por modulo |
| GET | `/admin/progress/exercises/:id` | Estadisticas de un ejercicio |
| GET | `/admin/progress/export` | Exportar datos de progreso a CSV |

### Asignaciones (6 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/assignments` | Listar asignaciones con filtros |
| GET | `/admin/assignments/stats` | Estadisticas globales de asignaciones |
| GET | `/admin/assignments/classrooms/:classroomId` | Asignaciones de un aula |
| GET | `/admin/assignments/students/:studentId` | Asignaciones de un estudiante |
| GET | `/admin/assignments/export` | Exportar asignaciones a CSV |
| GET | `/admin/assignments/:id` | Detalle de asignacion |

### Asignacion de Aulas a Profesores (7 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/classrooms/assign` | Asignar aula a profesor |
| POST | `/admin/classrooms/bulk-assign` | Asignacion masiva de aulas |
| DELETE | `/admin/classrooms/assign/:teacherId/:classroomId` | Remover asignacion |
| POST | `/admin/classrooms/reassign` | Reasignar aula a otro profesor |
| GET | `/admin/classrooms/teacher/:teacherId` | Aulas de un profesor |
| GET | `/admin/classrooms/available` | Aulas disponibles para asignacion |
| GET | `/admin/classrooms/:classroomId/history` | Historial de asignaciones del aula |

### Classroom-Teachers REST (9 endpoints)

> Endpoints RESTful que replican funcionalidad para compatibilidad frontend (US-AE-007)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/classrooms/:classroomId/teachers` | Obtener profesores de un aula |
| POST | `/admin/classrooms/:classroomId/teachers` | Asignar profesor a aula |
| DELETE | `/admin/classrooms/:classroomId/teachers/:teacherId` | Remover profesor de aula |
| GET | `/admin/teachers/:teacherId/classrooms` | Obtener aulas de un profesor |
| POST | `/admin/teachers/:teacherId/classrooms` | Asignar aulas a profesor |
| GET | `/admin/classroom-teachers` | Listar todas las asignaciones |
| POST | `/admin/classroom-teachers/bulk` | Asignacion masiva de pares |
| GET | `/admin/classrooms/list` | Listar aulas (para dropdowns) |
| GET | `/admin/teachers/list` | Listar profesores (para dropdowns) |

### Configuracion de Gamificacion (10 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/gamification/settings` | Obtener configuracion de gamificacion |
| PUT | `/admin/gamification/settings` | Actualizar configuracion |
| POST | `/admin/gamification/settings/preview` | Previsualizar impacto de cambios |
| POST | `/admin/gamification/settings/restore-defaults` | Restaurar valores por defecto |
| POST | `/admin/gamification/restore-defaults` | Restaurar defaults (ruta alternativa) |
| GET | `/admin/gamification/parameters` | Listar parametros con filtro por categoria |
| GET | `/admin/gamification/parameters/:id` | Obtener parametro por ID |
| PUT | `/admin/gamification/parameters/:id` | Actualizar valor de parametro |
| GET | `/admin/gamification/maya-ranks` | Configuracion de rangos Maya |
| PUT | `/admin/gamification/maya-ranks/:rankName` | Actualizar umbral de rango Maya |

### Alertas del Sistema (7 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/alerts` | Listar alertas con filtros y paginacion |
| GET | `/admin/alerts/stats/summary` | Estadisticas de alertas |
| GET | `/admin/alerts/:id` | Obtener alerta por ID |
| POST | `/admin/alerts` | Crear alerta manual |
| PATCH | `/admin/alerts/:id/acknowledge` | Reconocer alerta |
| PATCH | `/admin/alerts/:id/resolve` | Resolver alerta |
| PATCH | `/admin/alerts/:id/suppress` | Suprimir alerta |

### Intervenciones Estudiantiles (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/interventions` | Listar alertas de intervencion |
| GET | `/admin/interventions/:id` | Obtener alerta de intervencion por ID |
| PATCH | `/admin/interventions/:id/acknowledge` | Reconocer alerta de intervencion |
| PATCH | `/admin/interventions/:id/resolve` | Resolver alerta de intervencion |
| DELETE | `/admin/interventions/:id/dismiss` | Descartar alerta de intervencion |

### Operaciones Masivas (6 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/admin/bulk-operations/suspend-users` | Suspension masiva de usuarios |
| POST | `/admin/bulk-operations/activate-users` | Activacion masiva de usuarios |
| POST | `/admin/bulk-operations/update-role` | Actualizacion masiva de roles |
| POST | `/admin/bulk-operations/delete-users` | Eliminacion masiva de usuarios |
| GET | `/admin/bulk-operations/:id` | Estado de operacion masiva |
| GET | `/admin/bulk-operations` | Listar operaciones masivas recientes |

### Sistema y Mantenimiento (17 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/system/health` | Estado de salud del sistema |
| GET | `/admin/system/metrics` | Metricas de rendimiento |
| GET | `/admin/system/audit-log` | Log de auditoria de autenticacion |
| GET | `/admin/system/logs` | Logs del sistema |
| GET | `/admin/system/config` | Configuracion actual del sistema |
| POST | `/admin/system/config` | Actualizar configuracion del sistema |
| GET | `/admin/system/config/categories` | Categorias de configuracion |
| POST | `/admin/system/config/validate` | Validar configuracion antes de aplicar |
| GET | `/admin/system/config/:category` | Configuracion por categoria |
| PUT | `/admin/system/config/:category` | Actualizar config por categoria |
| POST | `/admin/system/maintenance` | Activar/desactivar modo mantenimiento |
| POST | `/admin/system/maintenance/cleanup-logs` | Limpiar logs antiguos |
| POST | `/admin/system/maintenance/cleanup-activity` | Limpiar actividad de usuario antigua |
| POST | `/admin/system/maintenance/optimize-database` | Optimizar base de datos (VACUUM ANALYZE) |
| POST | `/admin/system/maintenance/clear-cache` | Limpiar cache de aplicacion |
| POST | `/admin/system/maintenance/cleanup-sessions` | Limpiar sesiones expiradas |
| GET | `/admin/system/cron/status` | Estado de trabajos CRON |

### Logs (alias) (1 endpoint)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/logs` | Logs del sistema (alias de /admin/system/audit-log) |

### Monitoreo (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/monitoring/metrics` | Metricas del sistema en tiempo real |
| GET | `/admin/monitoring/metrics/history` | Historial de metricas |
| GET | `/admin/monitoring/errors/stats` | Estadisticas de errores |
| GET | `/admin/monitoring/errors/recent` | Errores recientes con detalle |
| GET | `/admin/monitoring/errors/trends` | Tendencias de errores en el tiempo |

### Reportes (6 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/reports` | Listar reportes generados |
| POST | `/admin/reports/generate` | Generar nuevo reporte |
| GET | `/admin/reports/:id/download` | Descargar reporte (PDF/Excel/CSV) |
| GET | `/admin/reports/:id/info` | Metadatos del reporte |
| DELETE | `/admin/reports/:id` | Eliminar reporte |
| POST | `/admin/reports/:id/schedule` | Programar generacion periodica |

### Feature Flags (9 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/feature-flags` | Listar feature flags |
| GET | `/admin/feature-flags/:key` | Obtener feature flag por key |
| POST | `/admin/feature-flags/:key/check` | Verificar si feature esta habilitada |
| POST | `/admin/feature-flags` | Crear feature flag |
| PUT | `/admin/feature-flags/:key` | Actualizar feature flag |
| POST | `/admin/feature-flags/:key/enable` | Habilitar feature flag |
| POST | `/admin/feature-flags/:key/disable` | Deshabilitar feature flag |
| PUT | `/admin/feature-flags/:key/rollout` | Actualizar porcentaje de rollout |
| DELETE | `/admin/feature-flags/:key` | Eliminar feature flag |

### Branding / White Label (6 endpoints)

> **Controller:** `tenants/:tenantId/branding` -- endpoints de branding por tenant (EXT-008 White Label System)
> **Auth:** GET y GET css son publicos; el resto requiere JwtAuthGuard + AdminGuard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tenants/:tenantId/branding` | Obtener configuracion de branding (publico) |
| PATCH | `/tenants/:tenantId/branding` | Actualizar configuracion de branding |
| POST | `/tenants/:tenantId/branding/logo` | Subir logo (multipart, max 5MB) |
| POST | `/tenants/:tenantId/branding/favicon` | Subir favicon (multipart, max 1MB) |
| GET | `/tenants/:tenantId/branding/css` | Obtener variables CSS del branding (publico) |
| DELETE | `/tenants/:tenantId/branding/assets` | Eliminar assets de branding |

---

## 21. LTI Module (42 endpoints)

> **Controllers:** 5 archivos | Rutas reales extraidas de `apps/backend/src/modules/lti/controllers/`
> **Prefijo base:** `/api/v1/lti`
> **Security:** OIDC endpoints son publicos; el resto requiere `JwtAuthGuard`

### 21.1 Deep Linking (6 endpoints)

> **Controller prefix:** `/api/v1/lti/deep-linking`
> **Auth:** No (endpoints de integracion LTI)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/lti/deep-linking/content` | Obtener contenido disponible para deep linking (filtros: sessionId, moduleId, topicId, contentType, difficulty, search) |
| POST | `/api/v1/lti/deep-linking/select` | Seleccionar contenido para deep linking (genera JWT firmado) |
| POST | `/api/v1/lti/deep-linking/submit` | Enviar seleccion y redirigir al LMS (HTML form auto-submit) |
| GET | `/api/v1/lti/deep-linking/return/:sessionId` | Obtener URL de retorno e info de la sesion |
| POST | `/api/v1/lti/deep-linking/cancel/:sessionId` | Cancelar deep linking (retorna respuesta vacia al LMS) |
| GET | `/api/v1/lti/deep-linking/cancel/:sessionId/redirect` | Cancelar y redirigir al LMS |

### 21.2 LTI Consumers (9 endpoints)

> **Controller prefix:** `/api/v1/lti/consumers`
> **Auth:** JWT (admin only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/lti/consumers` | Listar todos los LMS consumers configurados |
| GET | `/api/v1/lti/consumers/stats` | Estadisticas de consumers (total, active, verified) |
| GET | `/api/v1/lti/consumers/:id` | Obtener consumer por ID |
| GET | `/api/v1/lti/consumers/tenant/:tenantId` | Consumers de un tenant especifico |
| POST | `/api/v1/lti/consumers` | Registrar nuevo LMS para integracion LTI 1.3 |
| PATCH | `/api/v1/lti/consumers/:id` | Actualizar configuracion de consumer |
| POST | `/api/v1/lti/consumers/:id/verify` | Marcar consumer como verificado |
| POST | `/api/v1/lti/consumers/:id/activate` | Reactivar consumer desactivado |
| DELETE | `/api/v1/lti/consumers/:id` | Desactivar consumer (soft delete) |

### 21.3 Grade Passbacks (11 endpoints)

> **Controller prefix:** `/api/v1/lti/grade-passbacks`
> **Auth:** JWT

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/lti/grade-passbacks/stats` | Estadisticas de passbacks (total, pending, success, failed, retrying) |
| GET | `/api/v1/lti/grade-passbacks/pending` | Passbacks pendientes de envio al LMS |
| GET | `/api/v1/lti/grade-passbacks/ready-for-retry` | Passbacks fallidos listos para reintentar |
| GET | `/api/v1/lti/grade-passbacks/:id` | Obtener passback por ID |
| GET | `/api/v1/lti/grade-passbacks/user/:userId` | Passbacks de calificaciones de un usuario |
| GET | `/api/v1/lti/grade-passbacks/session/:sessionId` | Passbacks de una sesion LTI |
| POST | `/api/v1/lti/grade-passbacks` | Crear passback (registrar calificacion para envio via AGS) |
| PATCH | `/api/v1/lti/grade-passbacks/:id` | Actualizar datos de un passback |
| POST | `/api/v1/lti/grade-passbacks/:id/sending` | Marcar passback como en proceso de envio |
| POST | `/api/v1/lti/grade-passbacks/:id/success` | Marcar passback como enviado exitosamente |
| POST | `/api/v1/lti/grade-passbacks/:id/failed` | Marcar passback como fallido |

### 21.4 LTI Sessions (10 endpoints)

> **Controller prefix:** `/api/v1/lti/sessions`
> **Auth:** JWT

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/lti/sessions/stats` | Estadisticas de sesiones LTI (total, active, today) |
| GET | `/api/v1/lti/sessions/:id` | Obtener sesion por ID |
| GET | `/api/v1/lti/sessions/user/:userId` | Sesiones activas de un usuario |
| GET | `/api/v1/lti/sessions/consumer/:consumerId` | Sesiones activas de un LMS consumer |
| POST | `/api/v1/lti/sessions` | Crear nueva sesion post-launch |
| POST | `/api/v1/lti/sessions/:id/link-user/:userId` | Vincular usuario Gamilit con sesion LTI |
| POST | `/api/v1/lti/sessions/:id/activity` | Actualizar timestamp de ultima actividad |
| POST | `/api/v1/lti/sessions/:id/end` | Terminar sesion LTI |
| POST | `/api/v1/lti/sessions/user/:userId/end-all` | Terminar todas las sesiones de un usuario |
| POST | `/api/v1/lti/sessions/cleanup` | Limpiar sesiones expiradas (>24h sin actividad) |

### 21.5 OIDC Authentication (6 endpoints)

> **Controller prefix:** `/api/v1/lti/oidc`
> **Auth:** No (endpoints publicos de autenticacion LTI 1.3)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/lti/oidc/login` | Iniciar flujo OIDC login (redirect a plataforma) |
| GET | `/api/v1/lti/oidc/login/debug` | OIDC login debug (retorna JSON en lugar de redirect) |
| POST | `/api/v1/lti/oidc/callback` | Callback OIDC (recibe ID token, crea sesion, redirect) |
| POST | `/api/v1/lti/oidc/callback/json` | Callback OIDC JSON (retorna launch data sin redirect) |
| GET | `/api/v1/lti/oidc/jwks` | JSON Web Key Set (claves publicas para verificacion) |
| GET | `/api/v1/lti/oidc/.well-known/openid-configuration` | OpenID Connect discovery document |

---

## 22. Assignments Module (18 endpoints)

> **Controllers:** 2 archivos | Rutas reales extraidas de `apps/backend/src/modules/assignments/controllers/`
> **Guard:** `JwtAuthGuard` + `RolesGuard` en ambos controllers

### 22.1 Teacher Assignments (15 endpoints)

> **Controller prefix:** `/teacher/assignments`
> **Roles:** `admin_teacher`, `super_admin`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/teacher/assignments` | Crear nueva asignacion (inicia como borrador) |
| GET | `/teacher/assignments` | Listar asignaciones del profesor (filtros: isPublished, type, search) |
| GET | `/teacher/assignments/upcoming` | Asignaciones con deadlines proximos (?days=N, default 7) |
| GET | `/teacher/assignments/:id` | Detalle completo de una asignacion |
| PUT | `/teacher/assignments/:id` | Actualizar asignacion completa (solo sin entregas) |
| PATCH | `/teacher/assignments/:id` | Actualizacion parcial (permite con entregas, bloquea campos criticos) |
| DELETE | `/teacher/assignments/:id` | Eliminar asignacion (soft delete) |
| POST | `/teacher/assignments/:id/assign` | Asignar a aulas (distribuye a estudiantes) |
| GET | `/teacher/assignments/:id/submissions` | Entregas de una asignacion (filtros: status, classroomId) |
| POST | `/teacher/assignments/:assignmentId/submissions/:submissionId/grade` | Calificar entrega de estudiante |
| POST | `/teacher/assignments/:id/distribute` | Distribuir a multiples aulas/estudiantes (con deadline overrides) |
| POST | `/teacher/assignments/:id/duplicate` | Duplicar asignacion (copia como borrador) |
| POST | `/teacher/assignments/:id/publish` | Publicar asignacion (opcion: notificar estudiantes) |
| POST | `/teacher/assignments/:id/close` | Cerrar asignacion (impedir nuevas entregas) |
| POST | `/teacher/assignments/:id/send-reminder` | Enviar recordatorio a estudiantes sin entrega |

### 22.2 Student Assignments (3 endpoints)

> **Controller prefix:** `/student/assignments`
> **Roles:** `student`, `admin_teacher`, `super_admin`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/student/assignments` | Tareas asignadas al estudiante (filtros: status, classroomId) |
| GET | `/student/assignments/:id` | Detalle de tarea asignada |
| GET | `/student/assignments/grades/summary` | Resumen de calificaciones (total, completadas, promedio) |

---

Prev: [Support](05-SUPPORT.md) | Next: [Infrastructure](07-INFRASTRUCTURE.md)
