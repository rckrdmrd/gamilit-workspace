# Schema 9: notifications (7 tablas)

> **DDL Path:** `apps/database/ddl/schemas/notifications/tables/`
>
> Parte de [Schema Reference](_INDEX.md) - GAMILIT

---

## DDL-Accurate Tables

### notifications.notifications

**Descripcion:** Notificaciones enviadas a usuarios (in-app, email, push web)

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles ON DELETE CASCADE |
| type | VARCHAR(50) | NOT NULL | - | Tipo: achievement, mission, assignment, social, system, gamification, exercise_feedback |
| title | VARCHAR(255) | NOT NULL | - | Titulo de la notificacion |
| message | TEXT | NOT NULL | - | Cuerpo de la notificacion |
| data | JSONB | NULL | '{}' | Datos adicionales (IDs relacionados, payload especifico) |
| priority | VARCHAR(20) | NULL | 'normal' | Prioridad: low, normal, high, urgent |
| channels | VARCHAR(50)[] | NULL | ARRAY['in_app'] | Array de canales de envio: in_app, email, push |
| status | VARCHAR(20) | NULL | 'pending' | Estado: pending, sent, read, failed |
| read_at | TIMESTAMPTZ | NULL | NULL | Fecha de lectura |
| sent_at | TIMESTAMPTZ | NULL | NULL | Fecha de envio |
| created_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMPTZ | NULL | gamilit.now_mexico() | Auto-actualizado por trigger |
| expires_at | TIMESTAMPTZ | NULL | NULL | Fecha de expiracion (opcional, para notificaciones temporales) |
| metadata | JSONB | NULL | '{}' | Metadata adicional |

**Constraints:**
- `chk_notif_type`: CHECK (type IN ('achievement', 'mission', 'assignment', 'social', 'system', 'gamification', 'exercise_feedback'))
- `chk_notif_priority`: CHECK (priority IN ('low', 'normal', 'high', 'urgent'))
- `chk_notif_status`: CHECK (status IN ('pending', 'sent', 'read', 'failed'))

**Indices:**
- `idx_notif_user_id`: user_id
- `idx_notif_status`: status
- `idx_notif_type`: type
- `idx_notif_created_at`: created_at DESC
- `idx_notif_priority`: priority
- `idx_notif_user_unread`: (user_id, status) WHERE status IN ('pending', 'sent') -- parcial
- `idx_notif_expires_at`: expires_at WHERE expires_at IS NOT NULL -- parcial

**Trigger:** `trg_notifications_updated_at` -- actualiza updated_at automaticamente en cada UPDATE

**Entity:** `apps/backend/src/modules/notifications/entities/multichannel/notification.entity.ts`

---

### notifications.notification_preferences

**Descripcion:** Preferencias de notificaciones configuradas por cada usuario

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles ON DELETE CASCADE |
| notification_type | VARCHAR(50) | NOT NULL | - | Tipo de notificacion (achievement, mission, assignment, etc.) |
| in_app_enabled | BOOLEAN | NULL | true | Recibir notificaciones in-app |
| email_enabled | BOOLEAN | NULL | true | Recibir notificaciones por email |
| push_enabled | BOOLEAN | NULL | true | Recibir notificaciones push |
| email_frequency | VARCHAR(20) | NULL | 'immediate' | Frecuencia de emails: immediate, daily, weekly, never |
| quiet_hours_start | TIME | NULL | NULL | Hora de inicio del horario de silencio |
| quiet_hours_end | TIME | NULL | NULL | Hora de fin del horario de silencio |
| timezone | VARCHAR(50) | NULL | 'America/Mexico_City' | Zona horaria del usuario para calculo de quiet hours |
| created_at | TIMESTAMP | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMP | NULL | gamilit.now_mexico() | - |

**Constraints:**
- UNIQUE (user_id, notification_type) -- un usuario solo puede tener una preferencia por tipo
- `chk_email_frequency`: CHECK (email_frequency IN ('immediate', 'daily', 'weekly', 'never'))

**Indices:**
- `idx_notif_prefs_user_id`: user_id
- `idx_notif_prefs_type`: notification_type

**Entity:** `apps/backend/src/modules/notifications/entities/multichannel/notification-preference.entity.ts`

---

### notifications.notification_logs

**Descripcion:** Log de envio de notificaciones por cada canal

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| notification_id | UUID | NOT NULL | - | FK notifications.notifications ON DELETE CASCADE |
| channel | VARCHAR(20) | NOT NULL | - | Canal de envio: in_app, email, push |
| status | VARCHAR(20) | NOT NULL | - | Estado: sent, delivered, failed, bounced |
| sent_at | TIMESTAMP | NULL | gamilit.now_mexico() | Fecha de envio |
| delivered_at | TIMESTAMP | NULL | NULL | Fecha de entrega |
| error_message | TEXT | NULL | NULL | Informacion de error (si fallo) |
| provider_response | JSONB | NULL | NULL | Respuesta del proveedor externo (SendGrid, Firebase, etc.) |
| metadata | JSONB | NULL | '{}' | Metadata adicional |

**Constraints:**
- `chk_notif_log_channel`: CHECK (channel IN ('in_app', 'email', 'push'))
- `chk_notif_log_status`: CHECK (status IN ('sent', 'delivered', 'failed', 'bounced'))

**Indices:**
- `idx_notif_logs_notification_id`: notification_id
- `idx_notif_logs_channel`: channel
- `idx_notif_logs_status`: status
- `idx_notif_logs_sent_at`: sent_at DESC

**Entity:** `apps/backend/src/modules/notifications/entities/multichannel/notification-log.entity.ts`

---

### notifications.notification_templates

**Descripcion:** Plantillas reutilizables para notificaciones con Handlebars, i18n y versionado (v2.0)

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| template_key | VARCHAR(100) | NOT NULL | - | Clave unica del template (ej: achievement_unlocked) |
| name | VARCHAR(255) | NOT NULL | - | Nombre descriptivo |
| description | TEXT | NULL | NULL | Descripcion del proposito del template |
| subject_template | TEXT | NULL | NULL | Template del asunto para emails (Handlebars syntax) |
| body_template | TEXT | NOT NULL | - | Plantilla del cuerpo con sintaxis Handlebars |
| html_template | TEXT | NULL | NULL | HTML para emails con Handlebars syntax (opcional) |
| variables | JSONB | NULL | '[]' | Array JSON con nombres de variables disponibles |
| default_channels | VARCHAR(50)[] | NULL | ARRAY['in_app'] | Canales por defecto: in_app, email, push |
| is_active | BOOLEAN | NULL | true | Template activo |
| version | INTEGER | NOT NULL | 1 | Numero de version del template (incrementa con cada cambio) |
| previous_version_id | UUID | NULL | NULL | FK notifications.notification_templates (version anterior para historial) |
| subject_translations | JSONB | NULL | '{}' | Traducciones del asunto por idioma (ej: {"es": "...", "en": "..."}) |
| body_translations | JSONB | NULL | '{}' | Traducciones del cuerpo por idioma |
| html_translations | JSONB | NULL | '{}' | Traducciones del HTML por idioma |
| created_at | TIMESTAMP | NULL | gamilit.now_mexico() | - |
| updated_at | TIMESTAMP | NULL | gamilit.now_mexico() | - |

**Constraints:**
- `uq_template_key_version`: UNIQUE (template_key, version)
- FK: previous_version_id REFERENCES notifications.notification_templates(id)

**Indices:**
- `idx_notif_templates_key`: template_key
- `idx_notif_templates_active`: is_active
- `idx_notif_templates_version`: version
- `idx_notif_templates_key_active`: (template_key, is_active)

**Entity:** `apps/backend/src/modules/notifications/entities/multichannel/notification-template.entity.ts`

---

### notifications.notification_queue

**Descripcion:** Cola de envio de notificaciones para procesamiento asincrono

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| notification_id | UUID | NOT NULL | - | FK notifications.notifications ON DELETE CASCADE |
| channel | VARCHAR(20) | NOT NULL | - | Canal de envio: in_app, email, push |
| scheduled_for | TIMESTAMP | NOT NULL | - | Timestamp para envio programado |
| priority | INTEGER | NULL | 0 | Prioridad numerica: 10 (urgent), 5 (high), 0 (normal), -5 (low) |
| attempts | INTEGER | NULL | 0 | Numero de intentos de envio realizados |
| max_attempts | INTEGER | NULL | 3 | Numero maximo de intentos |
| status | VARCHAR(20) | NULL | 'queued' | Estado: queued, processing, sent, failed |
| last_attempt_at | TIMESTAMP | NULL | NULL | Timestamp del ultimo intento |
| error_message | TEXT | NULL | NULL | Mensaje de error (si fallo) |
| created_at | TIMESTAMP | NULL | gamilit.now_mexico() | - |

**Constraints:**
- `chk_notif_queue_channel`: CHECK (channel IN ('in_app', 'email', 'push'))
- `chk_notif_queue_status`: CHECK (status IN ('queued', 'processing', 'sent', 'failed'))
- `chk_notif_queue_attempts`: CHECK (attempts >= 0 AND attempts <= max_attempts)

**Indices:**
- `idx_notif_queue_scheduled`: (scheduled_for, status) WHERE status IN ('queued', 'processing') -- parcial, indice principal para procesar cola
- `idx_notif_queue_status`: status
- `idx_notif_queue_priority`: priority DESC
- `idx_notif_queue_notification_id`: notification_id
- `idx_notif_queue_created_at`: created_at WHERE status IN ('sent', 'failed') -- parcial, para limpieza de registros viejos

**Entity:** `apps/backend/src/modules/notifications/entities/multichannel/notification-queue.entity.ts`

---

### notifications.user_devices

**Descripcion:** Dispositivos registrados de usuarios para envio de push notifications

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles ON DELETE CASCADE |
| device_type | VARCHAR(20) | NOT NULL | - | Tipo de dispositivo: web, mobile, desktop |
| device_token | TEXT | NOT NULL | - | Token para push notifications (FCM, Web Push, etc.) |
| browser | VARCHAR(50) | NULL | NULL | Nombre del navegador |
| os | VARCHAR(50) | NULL | NULL | Sistema operativo del dispositivo |
| is_active | BOOLEAN | NULL | true | Dispositivo activo para recibir notificaciones |
| last_used_at | TIMESTAMP | NULL | gamilit.now_mexico() | Ultima vez que el usuario uso este dispositivo |
| created_at | TIMESTAMP | NULL | gamilit.now_mexico() | - |

**Constraints:**
- UNIQUE (user_id, device_token) -- un usuario no puede tener el mismo token dos veces
- `chk_user_devices_type`: CHECK (device_type IN ('web', 'mobile', 'desktop'))

**Indices:**
- `idx_user_devices_user_id`: user_id
- `idx_user_devices_active`: (is_active, user_id) WHERE is_active = true -- parcial
- `idx_user_devices_last_used`: last_used_at DESC

**Entity:** `apps/backend/src/modules/notifications/entities/multichannel/user-device.entity.ts`

---

### notifications.rate_limit_logs

**Descripcion:** Audit log for rate limiting decisions on notifications

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | PK |
| user_id | UUID | NOT NULL | - | FK auth_management.profiles ON DELETE CASCADE |
| channel | VARCHAR(20) | NOT NULL | - | Canal: in_app, email, push, sms, global |
| action | VARCHAR(20) | NOT NULL | - | Resultado: allowed, blocked |
| limit_value | INTEGER | NOT NULL | - | Limite configurado al momento de la accion |
| current_count | INTEGER | NOT NULL | - | Conteo actual al momento de la accion |
| window_seconds | INTEGER | NOT NULL | - | Ventana de tiempo del rate limit en segundos |
| tenant_id | UUID | NULL | NULL | Tenant (para escenarios multi-tenant) |
| metadata | JSONB | NULL | '{}' | Metadatos adicionales |
| created_at | TIMESTAMPTZ | NULL | NOW() | - |

**Constraints:**
- CHECK (channel IN ('in_app', 'email', 'push', 'sms', 'global')) -- inline
- CHECK (action IN ('allowed', 'blocked')) -- inline

**Indices:**
- `idx_rate_limit_logs_user_id`: user_id
- `idx_rate_limit_logs_channel`: channel
- `idx_rate_limit_logs_action`: action
- `idx_rate_limit_logs_created_at`: created_at DESC
- `idx_rate_limit_logs_tenant_id`: tenant_id WHERE tenant_id IS NOT NULL -- parcial
- `idx_rate_limit_logs_user_channel_date`: (user_id, channel, created_at DESC) -- composite

**RLS:** Habilitado
- `rate_limit_logs_select_own`: SELECT -- users can view their own logs
- `rate_limit_logs_insert_system`: INSERT -- controlled at application level

**Funcion asociada:** `notifications.cleanup_rate_limit_logs(older_than_days INTEGER DEFAULT 30)` -- elimina logs anteriores a N dias

**Entity:** `apps/backend/src/modules/notifications/entities/rate-limit-log.entity.ts`

---

## Deprecated / Conceptual Only

> **[DEPRECATED]** The following section describes an early conceptual model that was never implemented as described.
> The DDL-accurate documentation appears in the sections above.

### notifications.push_subscriptions [NO DDL -- conceptual only]

Suscripciones a push notifications. Este concepto fue reemplazado por `notifications.user_devices`.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| user_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| endpoint | TEXT | NOT NULL | - | Push endpoint |
| keys | JSONB | NOT NULL | '{}' | Push keys (p256dh, auth) |
| device_info | JSONB | NULL | '{}' | Info del dispositivo |
| is_active | BOOLEAN | NOT NULL | true | Suscripcion activa |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
