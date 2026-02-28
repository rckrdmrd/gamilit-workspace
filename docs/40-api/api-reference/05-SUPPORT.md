---
title: "API Reference - Support Modules"
status: activo
last_updated: "2026-02-28"
---

# API Reference - Support Modules

> Volver al [API Reference Hub](../API-REFERENCE.md)

---

## 10. Parents Portal Module (~18 endpoints)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | /parent-portal/auth/register | Registro de padres | No | parent |
| POST | /parent-portal/auth/login | Login de padres | No | parent |
| POST | /parent-portal/auth/refresh | Refresh token | Si | parent |
| POST | /parent-portal/auth/forgot-password | Solicitar reset | No | parent |
| POST | /parent-portal/auth/reset-password | Reset de password | No | parent |
| POST | /parent-portal/auth/verify-email | Verificar email | No | parent |
| POST | /parent-portal/auth/logout | Logout | Si | parent |
| GET | /parent-portal/dashboard | Dashboard de padres | Si | parent |
| GET | /parent-portal/students | Hijos vinculados | Si | parent |
| POST | /parent-portal/students/link | Vincular con estudiante | Si | parent |
| POST | /parent-portal/students/verify | Verificar vinculacion | Si | parent |
| GET | /parent-portal/students/:id/progress | Progreso del hijo | Si | parent |
| GET | /parent-portal/students/:id/activities | Actividad reciente | Si | parent |
| GET | /parent-portal/notifications | Notificaciones | Si | parent |
| PATCH | /parent-portal/notifications/:id/read | Marcar leida | Si | parent |
| GET | /parent-portal/notifications/unread-count | No leidas | Si | parent |
| GET | /parent-portal/reports/weekly | Reporte semanal | Si | parent |
| GET | /parent-portal/reports/weekly/:studentId | Reporte semanal por estudiante | Si | parent |

---

## 11. Analytics Module (~25 endpoints)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | /analytics/student/:id | Analytics de estudiante | Si | teacher/admin |
| GET | /analytics/classroom/:id | Analytics de aula | Si | teacher/admin |
| GET | /analytics/school | Analytics de escuela | Si | admin |
| GET | /analytics/engagement | Metricas de engagement | Si | admin |
| GET | /analytics/completion-rates | Tasas de completitud | Si | admin |
| GET | /analytics/dau | Daily Active Users | Si | admin |
| GET | /analytics/retention | Retention metrics | Si | admin |
| GET | /analytics/module/:id | Analytics por modulo | Si | teacher/admin |

---

## 12. Content Module (103 endpoints)

> **Guard:** `JwtAuthGuard` en todos los endpoints
> **Prefijo base:** `/api/v1/content` (via `extractBasePath(API_ROUTES.CONTENT.BASE)`) o prefijos directos por controller
> **Controllers:** 10 archivos | Rutas reales extraidas de `apps/backend/src/modules/content/controllers/`

### 12.1 Content Authors (16 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/content/authors` | Listar autores con filtros y paginacion |
| GET | `/api/v1/content/authors/featured` | Autores destacados |
| GET | `/api/v1/content/authors/verified` | Autores verificados |
| GET | `/api/v1/content/authors/top-rated` | Autores mejor calificados |
| GET | `/api/v1/content/authors/:id` | Obtener autor por ID |
| GET | `/api/v1/content/authors/:id/stats` | Estadisticas del autor |
| GET | `/api/v1/content/authors/expertise/:area` | Autores por area de expertise |
| GET | `/api/v1/content/authors/user/:userId` | Obtener autor por userId |
| POST | `/api/v1/content/authors` | Crear perfil de autor |
| PATCH | `/api/v1/content/authors/:id` | Actualizar perfil de autor |
| DELETE | `/api/v1/content/authors/:id` | Eliminar autor (soft delete) |
| POST | `/api/v1/content/authors/:id/increment-content` | Incrementar contador de contenido |
| POST | `/api/v1/content/authors/:id/increment-views` | Incrementar contador de vistas |
| PATCH | `/api/v1/content/authors/:id/rating` | Actualizar rating del autor |
| PATCH | `/api/v1/content/authors/:id/featured` | Marcar/desmarcar como destacado |
| PATCH | `/api/v1/content/authors/:id/verified` | Marcar/desmarcar como verificado |

### 12.2 Content Categories (15 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/content/categories` | Listar categorias con filtros |
| GET | `/api/v1/content/categories/root` | Categorias raiz (sin padre) |
| GET | `/api/v1/content/categories/tree` | Arbol completo de categorias |
| GET | `/api/v1/content/categories/stats` | Estadisticas de categorias |
| GET | `/api/v1/content/categories/slug/:slug` | Obtener categoria por slug |
| GET | `/api/v1/content/categories/:id` | Obtener categoria por ID |
| GET | `/api/v1/content/categories/:id/children` | Categorias hijas |
| GET | `/api/v1/content/categories/:id/breadcrumb` | Ruta de breadcrumb de la categoria |
| POST | `/api/v1/content/categories` | Crear categoria |
| PATCH | `/api/v1/content/categories/:id` | Actualizar categoria |
| DELETE | `/api/v1/content/categories/:id` | Eliminar categoria (soft delete) |
| PATCH | `/api/v1/content/categories/:id/order` | Actualizar orden de visualizacion |
| PATCH | `/api/v1/content/categories/:id/active` | Activar/desactivar categoria |
| PATCH | `/api/v1/content/categories/:id/move` | Mover categoria a otro padre |
| GET | `/api/v1/content/categories/active` | Categorias activas solamente |

### 12.3 Content Templates (9 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/content/templates` | Listar templates |
| GET | `/api/v1/content/templates/:id` | Obtener template por ID |
| POST | `/api/v1/content/templates` | Crear template |
| PATCH | `/api/v1/content/templates/:id` | Actualizar template |
| DELETE | `/api/v1/content/templates/:id` | Eliminar template |
| POST | `/api/v1/content/templates/:id/use` | Usar template para crear contenido |
| GET | `/api/v1/content/templates/type/:type` | Templates por tipo |
| GET | `/api/v1/content/templates/category/:categoryId` | Templates por categoria |
| GET | `/api/v1/content/templates/popular` | Templates mas utilizados |

### 12.4 Content Versions (8 endpoints)

> **Controller prefix:** `/api/v1/content/versions`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/content/versions/content/:contentId` | Versiones de un contenido |
| GET | `/api/v1/content/versions/content/:contentId/latest` | Ultima version de un contenido |
| GET | `/api/v1/content/versions/content/:contentId/published` | Version publicada de un contenido |
| GET | `/api/v1/content/versions/:id` | Obtener version por ID |
| POST | `/api/v1/content/versions` | Crear nueva version |
| PATCH | `/api/v1/content/versions/:id/publish` | Publicar version |
| PATCH | `/api/v1/content/versions/:id/unpublish` | Despublicar version |
| GET | `/api/v1/content/versions/compare/:id1/:id2` | Comparar dos versiones |

### 12.5 Flagged Content (10 endpoints)

> **Controller prefix:** `/api/v1/content/flagged`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/content/flagged` | Listar contenido reportado con filtros |
| GET | `/api/v1/content/flagged/stats` | Estadisticas de reportes |
| GET | `/api/v1/content/flagged/pending` | Reportes pendientes de revision |
| GET | `/api/v1/content/flagged/:id` | Obtener reporte por ID |
| GET | `/api/v1/content/flagged/content/:contentId` | Reportes de un contenido especifico |
| POST | `/api/v1/content/flagged` | Reportar contenido |
| PATCH | `/api/v1/content/flagged/:id/approve` | Aprobar (descartar reporte) |
| PATCH | `/api/v1/content/flagged/:id/reject` | Rechazar (confirmar reporte) |
| DELETE | `/api/v1/content/flagged/:id/remove` | Remover contenido reportado |
| PATCH | `/api/v1/content/flagged/:id/priority` | Actualizar prioridad del reporte |

### 12.6 Marie Curie Content (9 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/content/marie-curie` | Listar contenido Marie Curie |
| GET | `/api/v1/content/marie-curie/:id` | Obtener por ID |
| GET | `/api/v1/content/marie-curie/category/:category` | Por categoria |
| POST | `/api/v1/content/marie-curie` | Crear contenido Marie Curie |
| PATCH | `/api/v1/content/marie-curie/:id` | Actualizar contenido |
| DELETE | `/api/v1/content/marie-curie/:id` | Eliminar contenido |
| PATCH | `/api/v1/content/marie-curie/:id/publish` | Publicar contenido |
| GET | `/api/v1/content/marie-curie/published` | Contenido publicado |
| GET | `/api/v1/content/marie-curie/featured` | Contenido destacado |

### 12.7 Media Files (12 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/content/media-files` | Listar archivos multimedia |
| GET | `/api/v1/content/media-files/:id` | Obtener archivo por ID |
| POST | `/api/v1/content/media-files` | Subir archivo multimedia |
| PATCH | `/api/v1/content/media-files/:id` | Actualizar metadatos del archivo |
| DELETE | `/api/v1/content/media-files/:id` | Eliminar archivo |
| GET | `/api/v1/content/media-files/type/:type` | Archivos por tipo (image, video, audio, document) |
| GET | `/api/v1/content/media-files/search/tags` | Buscar archivos por tags |
| PATCH | `/api/v1/content/media-files/:id/status` | Actualizar estado del archivo |
| GET | `/api/v1/content/media-files/stats` | Estadisticas de archivos multimedia |
| GET | `/api/v1/content/media-files/uploader/:uploaderId` | Archivos por uploader |
| GET | `/api/v1/content/media-files/:id/thumbnail` | Obtener thumbnail del archivo |
| POST | `/api/v1/content/media-files/:id/increment-downloads` | Incrementar contador de descargas |

### 12.8 Media Metadata (6 endpoints)

> **Controller prefix:** `/api/v1/content/media-metadata`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/content/media-metadata/:id` | Obtener metadata por ID |
| GET | `/api/v1/content/media-metadata/media/:mediaFileId` | Metadata de un archivo multimedia |
| POST | `/api/v1/content/media-metadata` | Crear metadata |
| PATCH | `/api/v1/content/media-metadata/:id` | Actualizar metadata |
| PUT | `/api/v1/content/media-metadata/media/:mediaFileId` | Upsert metadata de archivo |
| DELETE | `/api/v1/content/media-metadata/:id` | Eliminar metadata |

### 12.9 Moderation Rules (10 endpoints)

> **Controller prefix:** `/api/v1/content/moderation-rules`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/content/moderation-rules` | Listar todas las reglas |
| GET | `/api/v1/content/moderation-rules/active` | Reglas activas |
| GET | `/api/v1/content/moderation-rules/target/:target` | Reglas por target (content, comment, user) |
| GET | `/api/v1/content/moderation-rules/type/:type` | Reglas por tipo (keyword, pattern, ml) |
| GET | `/api/v1/content/moderation-rules/:id` | Obtener regla por ID |
| POST | `/api/v1/content/moderation-rules` | Crear regla de moderacion |
| PATCH | `/api/v1/content/moderation-rules/:id` | Actualizar regla |
| PATCH | `/api/v1/content/moderation-rules/:id/activate` | Activar regla |
| PATCH | `/api/v1/content/moderation-rules/:id/deactivate` | Desactivar regla |
| DELETE | `/api/v1/content/moderation-rules/:id` | Eliminar regla |

### 12.10 Tags (8 endpoints)

> **Controller prefix:** `/api/v1/content/tags`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/content/tags` | Listar tags |
| GET | `/api/v1/content/tags/popular` | Tags mas populares |
| GET | `/api/v1/content/tags/search` | Buscar tags |
| GET | `/api/v1/content/tags/category/:category` | Tags por categoria |
| GET | `/api/v1/content/tags/:id` | Obtener tag por ID |
| POST | `/api/v1/content/tags` | Crear tag |
| PATCH | `/api/v1/content/tags/:id` | Actualizar tag |
| PATCH | `/api/v1/content/tags/:id/deactivate` | Desactivar tag |

---

## 13. Notifications Module (~25 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /notifications | Listar notificaciones | Si |
| GET | /notifications/unread | Notificaciones no leidas | Si |
| GET | /notifications/count | Contador de no leidas | Si |
| PATCH | /notifications/:id/read | Marcar como leida | Si |
| POST | /notifications/read-all | Marcar todas como leidas | Si |
| DELETE | /notifications/:id | Eliminar notificacion | Si |
| GET | /notifications/preferences | Preferencias de notificacion | Si |
| PATCH | /notifications/preferences | Actualizar preferencias | Si |
| POST | /notifications/send | Enviar notificacion (admin/teacher) | Si |

### Notifications System (Extended)

> **Prefijo base:** `/api/v1/notifications`
> **Guard:** `JwtAuthGuard` salvo indicacion contraria
> **Controllers:** 5 archivos — analytics, templates, devices, rate-limit, multichannel

#### 13.1 NotificationAnalyticsController (10 endpoints)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/v1/notifications/analytics/summary` | Resumen de analiticas de notificaciones | Si | admin |
| GET | `/api/v1/notifications/analytics/by-template/:templateKey` | Analiticas por template especifico | Si | admin |
| GET | `/api/v1/notifications/analytics/by-channel/:channel` | Analiticas por canal (email, push, sms, in_app) | Si | admin |
| GET | `/api/v1/notifications/delivery/:notificationId` | Estado de entrega de una notificacion | Si | admin |
| GET | `/api/v1/notifications/errors` | Errores recientes de entrega (paginado) | Si | admin |
| GET | `/api/v1/notifications/errors/:notificationId` | Errores de una notificacion especifica | Si | admin |
| POST | `/api/v1/notifications/track/open` | Registrar apertura de email (pixel tracking) | No | public |
| GET | `/api/v1/notifications/track/open` | Registrar apertura via GET (responde GIF 1x1) | No | public |
| POST | `/api/v1/notifications/track/click` | Registrar clic en enlace de notificacion | No | public |
| GET | `/api/v1/notifications/track/click` | Registrar clic y redirigir al destino (GET) | No | public |

#### 13.2 NotificationTemplatesController (9 endpoints)

> **Controller prefix:** `/api/v1/notifications/templates`
> **Auth:** JwtAuthGuard + AdminGuard

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/v1/notifications/templates` | Listar todos los templates activos | Si | admin |
| GET | `/api/v1/notifications/templates/locales` | Locales i18n soportados | Si | admin |
| GET | `/api/v1/notifications/templates/:templateKey` | Obtener template por clave | Si | admin |
| POST | `/api/v1/notifications/templates/preview` | Previsualizar template Handlebars en crudo | Si | admin |
| POST | `/api/v1/notifications/templates/validate` | Validar sintaxis Handlebars | Si | admin |
| POST | `/api/v1/notifications/templates/:templateKey/render` | Renderizar preview del template (sin enviar) | Si | admin |
| POST | `/api/v1/notifications/templates/:templateKey/render-localized` | Renderizar con localizacion i18n | Si | admin |
| GET | `/api/v1/notifications/templates/:templateKey/versions` | Historial de versiones del template | Si | admin |
| GET | `/api/v1/notifications/templates/:templateKey/version/:version` | Obtener version especifica del template | Si | admin |

#### 13.3 NotificationDevicesController (6 endpoints)

> **Controller prefix:** `/api/v1/notifications/devices`

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/v1/notifications/devices/vapid-public-key` | Obtener VAPID public key para web push | No | public |
| POST | `/api/v1/notifications/devices` | Registrar dispositivo para push notifications | Si | any |
| GET | `/api/v1/notifications/devices` | Listar dispositivos registrados del usuario | Si | any |
| GET | `/api/v1/notifications/devices/:id` | Obtener informacion de un dispositivo | Si | any |
| PATCH | `/api/v1/notifications/devices/:id` | Actualizar nombre del dispositivo | Si | any |
| DELETE | `/api/v1/notifications/devices/:id` | Dar de baja un dispositivo | Si | any |

#### 13.4 NotificationRateLimitController (5 endpoints)

> **Controller prefix:** `/api/v1/notifications/rate-limit`
> **Auth:** JwtAuthGuard + AdminGuard

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/v1/notifications/rate-limit/status` | Estado actual de rate limits | Si | admin |
| GET | `/api/v1/notifications/rate-limit/config` | Configuracion de rate limits | Si | admin |
| GET | `/api/v1/notifications/rate-limit/channel/:channel` | Estado de rate limit para un canal especifico | Si | admin |
| POST | `/api/v1/notifications/rate-limit/reset/:channel` | Resetear rate limit de un canal | Si | admin |
| POST | `/api/v1/notifications/rate-limit/reset-all` | Resetear todos los rate limits | Si | admin |

#### 13.5 NotificationMultiChannelController (2 endpoints)

> **Controller prefix:** `/api/v1/notifications/multichannel`
> **Auth:** JwtAuthGuard + AdminGuard

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| POST | `/api/v1/notifications/multichannel` | Crear notificacion multi-canal ad-hoc | Si | admin |
| POST | `/api/v1/notifications/multichannel/send-from-template` | Enviar desde template en multiples canales | Si | admin |

---

## 14. Reports Module (~20 endpoints)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | /reports/templates | Listar templates | Si | admin |
| POST | /reports/generate | Generar reporte | Si | teacher/admin |
| GET | /reports/:id | Obtener reporte | Si | teacher/admin/parent |
| GET | /reports/:id/download | Descargar PDF/Excel | Si | teacher/admin/parent |
| GET | /reports/student/:id | Reporte de estudiante | Si | teacher/admin/parent |
| GET | /reports/classroom/:id | Reporte de aula | Si | teacher/admin |
| POST | /reports/schedule | Programar reporte | Si | teacher/admin |

---

## 17. Settings Module (~15 endpoints)

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | /settings | Configuracion del sistema | Si | admin |
| PATCH | /settings | Actualizar configuracion | Si | admin |
| GET | /settings/features | Feature flags | Si | admin |
| PATCH | /settings/features/:flag | Toggle feature | Si | admin |
| GET | /settings/gamification | Parametros de gamificacion | Si | admin |
| PATCH | /settings/gamification | Actualizar parametros | Si | admin |

---

## 18. Health Module (3 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /health | Health check general | No |
| GET | /health/ready | Readiness check | No |
| GET | /health/live | Liveness check | No |

---

## 19. Core Module

No expone endpoints propios. Provee utilidades compartidas a otros modulos.

---

Prev: [Classrooms, Students & Teachers](04-CLASSROOMS-STUDENTS-TEACHERS.md) | Next: [Admin, LTI & Assignments](06-ADMIN-LTI-ASSIGNMENTS.md)
