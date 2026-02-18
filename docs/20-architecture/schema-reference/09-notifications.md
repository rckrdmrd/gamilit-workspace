# Schema 9: notifications (5 tablas, 20 RLS policies)

> **Nota:** Este documento describe el modelo conceptual. Para definiciones DDL exactas, consultar `apps/database/ddl/schemas/`.

> Parte de [Schema Reference](_INDEX.md) - GAMILIT

---

### notifications.notification_templates
Templates de notificacion por evento.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| event_type | VARCHAR(50) | NOT NULL | - | Tipo de evento |
| channel | notification_channel | NOT NULL | - | Canal (in_app, email, push, sms) |
| subject_template | VARCHAR(200) | NOT NULL | - | Template del asunto |
| body_template | TEXT | NOT NULL | - | Template del cuerpo |
| is_active | BOOLEAN | NOT NULL | true | Template activo |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

### notifications.notification_queue
Cola de envio de notificaciones.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| user_id | UUID | NOT NULL | - | FK auth.users (destinatario) |
| channel | notification_channel | NOT NULL | - | Canal de envio |
| priority | notification_priority | NOT NULL | 'medium' | Prioridad |
| subject | VARCHAR(200) | NOT NULL | - | Asunto |
| body | TEXT | NOT NULL | - | Cuerpo |
| status | notification_status | NOT NULL | 'pending' | Estado |
| metadata | JSONB | NULL | '{}' | Metadatos |
| scheduled_at | TIMESTAMPTZ | NULL | NULL | Envio programado |
| sent_at | TIMESTAMPTZ | NULL | NULL | Fecha de envio |
| read_at | TIMESTAMPTZ | NULL | NULL | Fecha de lectura (in_app) |
| error_message | TEXT | NULL | NULL | Error si fallo |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

### notifications.notification_logs
Historial de envios completados.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| notification_id | UUID | NOT NULL | - | FK notifications.notification_queue |
| channel | notification_channel | NOT NULL | - | Canal usado |
| status | VARCHAR(20) | NOT NULL | - | sent, delivered, failed, bounced |
| provider_response | JSONB | NULL | '{}' | Respuesta del proveedor |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

### notifications.notification_preferences
Preferencias de notificacion por usuario.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | uuid_generate_v4() | PK |
| user_id | UUID | NOT NULL | - | FK auth.users |
| tenant_id | UUID | NOT NULL | - | FK tenants.tenants |
| event_type | VARCHAR(50) | NOT NULL | - | Tipo de evento |
| in_app | BOOLEAN | NOT NULL | true | Recibir in-app |
| email | BOOLEAN | NOT NULL | true | Recibir email |
| push | BOOLEAN | NOT NULL | false | Recibir push |
| sms | BOOLEAN | NOT NULL | false | Recibir SMS |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | - |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | - |

---

### notifications.push_subscriptions
Suscripciones a push notifications.

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
