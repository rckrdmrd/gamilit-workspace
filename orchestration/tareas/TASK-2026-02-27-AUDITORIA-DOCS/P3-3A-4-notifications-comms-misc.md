# P3-3A-4: Data Model Alignment Audit
## Schemas: notifications, communication, content_management, system_config, admin_dashboard, storage

**Fecha:** 2026-02-27
**Auditor:** Claude Sonnet 4.6 (Read-Only)
**Scope:** DDL vs Schema-Reference docs cross-check
**Metodologia:** DDL como fuente de verdad; docs como espejo esperado

---

## 1. SCHEMA: notifications

**DDL path:** `apps/database/ddl/schemas/notifications/tables/`
**Doc path:** `docs/20-architecture/schema-reference/09-notifications.md`
**DDL table count:** 7
**Doc table count:** 7 (pero estructura interna difiere significativamente)

---

### notifications.notifications

- **DDL:** `apps/database/ddl/schemas/notifications/tables/01-notifications.sql`
- **Doc:** `docs/20-architecture/schema-reference/09-notifications.md` — tabla NO documentada explicitamente (la doc confunde notification_queue con notifications)
- **Status:** MISSING_FROM_DOCS
- **Columns DDL:** 12 | Doc: 0 (confundida con notification_queue)
- **Missing from docs:** `id`, `user_id`, `type`, `title`, `message`, `data`, `priority`, `channels`, `status`, `read_at`, `sent_at`, `created_at`, `updated_at`, `expires_at`, `metadata`
- **Type mismatches:** N/A (tabla ausente del doc)
- **FK documented:** NO — la doc no documenta esta tabla en absoluto

**Observacion:** La doc de `notifications.notification_queue` en realidad describe una mezcla de campos de `notification_queue` y `notifications`. La tabla `notifications.notifications` (la principal, con 12 cols incluyendo `title`, `message`, `channels`, `expires_at`) no aparece como entidad separada en el doc. El doc lista 7 tablas pero la tabla `notifications` (principal) se llama igual que el schema, posiblemente causando confusion.

---

### notifications.notification_preferences

- **DDL:** `apps/database/ddl/schemas/notifications/tables/02-notification_preferences.sql`
- **Doc:** `docs/20-architecture/schema-reference/09-notifications.md:64`
- **Status:** PARTIAL
- **Columns DDL:** 11 | Doc: 10
- **Missing from docs:** ninguna columna falta, pero tipos difieren
- **Differences:**
  - DDL: `notification_type VARCHAR(50)` | Doc: `event_type VARCHAR(50)` — **NOMBRE DE COLUMNA DISTINTO**
  - DDL: `in_app_enabled BOOLEAN`, `email_enabled BOOLEAN`, `push_enabled BOOLEAN` (3 columnas separadas) | Doc: `in_app BOOLEAN`, `email BOOLEAN`, `push BOOLEAN` — **NOMBRES DE COLUMNAS DISTINTOS**
  - DDL tiene `sms` NO present | Doc: tiene `sms BOOLEAN NOT NULL false` — **COLUMNA SMS SOLO EN DOC, NO EN DDL**
  - DDL: `email_frequency VARCHAR(20)` | Doc: no presente
  - DDL: `quiet_hours_start TIME`, `quiet_hours_end TIME`, `timezone VARCHAR(50)` | Doc: no presentes
  - Doc: `tenant_id UUID NOT NULL` | DDL: **SIN tenant_id** — **FK tenant SOLO EN DOC**
- **FK documented:** PARTIAL — doc dice FK auth.users (nombre incorrecto; DDL usa auth_management.profiles)

**Gap critico:** 6 columnas DDL ausentes en doc (`email_frequency`, `quiet_hours_start`, `quiet_hours_end`, `timezone`, y nombres de columna distintos para `_enabled`). 2 columnas en doc ausentes en DDL (`sms`, `tenant_id`). La doc refleja un modelo mas antiguo.

---

### notifications.notification_logs

- **DDL:** `apps/database/ddl/schemas/notifications/tables/03-notification_logs.sql`
- **Doc:** `docs/20-architecture/schema-reference/09-notifications.md:49`
- **Status:** PARTIAL
- **Columns DDL:** 7 | Doc: 7
- **Missing from docs:** `sent_at`, `delivered_at`, `error_message`, `metadata`
- **Differences:**
  - DDL: `notification_id UUID` FK -> `notifications.notifications` | Doc: `notification_id UUID` FK -> `notifications.notification_queue` — **FK TARGET INCORRECTO EN DOC**
  - DDL: `sent_at TIMESTAMP`, `delivered_at TIMESTAMP` | Doc: solo `created_at TIMESTAMPTZ`
  - Doc: `tenant_id UUID NOT NULL` | DDL: **SIN tenant_id** — **FK tenant SOLO EN DOC**
  - DDL: `error_message TEXT`, `metadata JSONB` | Doc: no presentes
- **FK documented:** PARTIAL (FK target incorrecto: doc apunta a notification_queue, DDL apunta a notifications)

---

### notifications.notification_templates

- **DDL:** `apps/database/ddl/schemas/notifications/tables/04-notification_templates.sql`
- **Doc:** `docs/20-architecture/schema-reference/09-notifications.md:9`
- **Status:** PARTIAL
- **Columns DDL:** 16 | Doc: 9
- **Missing from docs:** `name`, `description`, `html_template`, `variables`, `default_channels`, `is_active`, `version`, `previous_version_id`, `subject_translations`, `body_translations`, `html_translations`
- **Differences:**
  - DDL: `template_key VARCHAR(100)` UNIQUE | Doc: `event_type VARCHAR(50)` — **NOMBRE DE COLUMNA DISTINTO**
  - DDL: key es `template_key`; unique constraint es `(template_key, version)` | Doc: no documenta esta unicidad
  - Doc: `tenant_id UUID NOT NULL`, `channel notification_channel NOT NULL` | DDL: **ninguna de estas columnas existe** — DOC TIENE COLUMNAS QUE NO ESTAN EN DDL
  - DDL: v2.0 features (Handlebars, i18n, versionado) — ninguno documentado en doc
- **FK documented:** NO — doc dice FK tenants.tenants; DDL no tiene esa FK

**Gap critico:** La doc refleja un modelo antiguo/alternativo. El DDL v2.0 tiene 7 columnas adicionales (i18n, versionado) no documentadas. La doc tiene `tenant_id` y `channel` que no existen en DDL.

---

### notifications.notification_queue

- **DDL:** `apps/database/ddl/schemas/notifications/tables/05-notification_queue.sql`
- **Doc:** `docs/20-architecture/schema-reference/09-notifications.md:26`
- **Status:** PARTIAL
- **Columns DDL:** 10 | Doc: 15
- **Missing from docs:** `max_attempts`, `last_attempt_at`
- **Columns in doc not in DDL:** `user_id`, `subject`, `body`, `read_at`, `sent_at`, `updated_at`, `tenant_id` — **7 COLUMNAS SOLO EN DOC**
- **Differences:**
  - DDL: `notification_id UUID` FK -> `notifications.notifications` | Doc: NO tiene `notification_id` — la doc describe una tabla diferente (con `user_id`, `subject`, `body`)
  - DDL: `attempts INTEGER`, `max_attempts INTEGER`, `last_attempt_at TIMESTAMP` | Doc: no presentes
  - Doc: `tenant_id UUID NOT NULL`, `user_id UUID NOT NULL`, `subject VARCHAR(200)`, `body TEXT`, `read_at`, `sent_at`, `updated_at` | DDL: ninguna de estas
- **FK documented:** NO — la doc no tiene la FK critica `notification_id`

**Gap critico:** La doc de `notification_queue` describe un modelo completamente diferente al DDL. El DDL es una cola de procesamiento (con `notification_id`, `attempts`, `max_attempts`); la doc describe una tabla de notificaciones con contenido propio (confundiendo `queue` con `notifications`).

---

### notifications.user_devices

- **DDL:** `apps/database/ddl/schemas/notifications/tables/06-user_devices.sql`
- **Doc:** `docs/20-architecture/schema-reference/09-notifications.md:99`
- **Status:** MATCH
- **Columns DDL:** 9 | Doc: 9
- **Missing from docs:** ninguna
- **Type mismatches:** ninguno significativo (doc dice TIMESTAMPTZ para `last_used_at`/`created_at`; DDL usa TIMESTAMP sin zona — diferencia menor)
- **FK documented:** YES — user_id -> auth_management.profiles ON DELETE CASCADE correctamente documentado

---

### notifications.rate_limit_logs

- **DDL:** `apps/database/ddl/schemas/notifications/tables/07-rate_limit_logs.sql`
- **Doc:** `docs/20-architecture/schema-reference/09-notifications.md:123`
- **Status:** MATCH
- **Columns DDL:** 10 | Doc: 10
- **Missing from docs:** ninguna
- **Type mismatches:** ninguno
- **FK documented:** YES — user_id -> auth_management.profiles ON DELETE CASCADE, RLS correctamente documentado

---

### notifications.push_subscriptions

- **DDL:** NO EXISTE (`ls notifications/tables/` = 7 archivos, ninguno es push_subscriptions)
- **Doc:** `docs/20-architecture/schema-reference/09-notifications.md:82`
- **Status:** MISSING_FROM_DDL
- **Columns DDL:** 0 | Doc: 10
- **Missing from DDL:** `id`, `user_id`, `tenant_id`, `endpoint`, `keys`, `device_info`, `is_active`, `created_at`, `updated_at`
- **FK documented:** N/A (tabla no existe en DDL)

**Nota:** La tabla `user_devices` en DDL cubre funcionalidad de dispositivos/push tokens. Es posible que `push_subscriptions` haya sido reemplazada por `user_devices`, pero la doc no lo indica. Requiere clarificacion.

---

## 2. SCHEMA: communication

**DDL path:** `apps/database/ddl/schemas/communication/tables/`
**Doc path:** `docs/20-architecture/schema-reference/19-communication.md`
**DDL table count:** 4 (messages, message_participants, conversations, conversation_participants — el ultimo archivo contiene 2 tablas)
**Doc table count:** 4

---

### communication.messages

- **DDL:** `apps/database/ddl/schemas/communication/tables/01-messages.sql`
- **Doc:** `docs/20-architecture/schema-reference/19-communication.md:19`
- **Status:** PARTIAL
- **Columns DDL:** 27 | Doc: ~15 (doc usa lista no exhaustiva con "..." implicito)
- **Missing from docs:** `read_at`, `is_deleted`, `deleted_at`, `deleted_by`, `is_archived`, `requires_response`, `response_deadline`, `is_flagged`, `flagged_reason`, `flagged_by`, `flagged_at`, `metadata`, `updated_at`, `created_at`, `edited_at`, `edit_count`
- **Differences:**
  - DDL: `message_type` CHECK incluye `'system'` adicional (6 valores) | Doc: 5 valores (sin `system`)
  - DDL tiene columnas de soft delete completo (`is_deleted`, `deleted_at`, `deleted_by`) | Doc: no las menciona
  - DDL tiene campos de moderacion granular (`is_flagged`, `flagged_reason`, `flagged_by`, `flagged_at`) | Doc: solo `moderation_status`
  - DDL: `requires_response BOOLEAN`, `response_deadline TIMESTAMPTZ` | Doc: no presente
- **FK documented:** PARTIAL — Doc documenta las FK principales (sender_id, recipient_id, classroom_id, thread_id, parent_message_id) pero omite `deleted_by` y `flagged_by`

---

### communication.message_participants

- **DDL:** `apps/database/ddl/schemas/communication/tables/02-message_participants.sql`
- **Doc:** `docs/20-architecture/schema-reference/19-communication.md:44`
- **Status:** MATCH
- **Columns DDL:** 6 | Doc: 6
- **Missing from docs:** ninguna
- **Type mismatches:** ninguno significativo
- **FK documented:** YES — message_id -> messages, user_id -> auth_management.profiles

---

### communication.conversations

- **DDL:** `apps/database/ddl/schemas/communication/tables/03-conversation_participants.sql` (contiene ambas tablas)
- **Doc:** `docs/20-architecture/schema-reference/19-communication.md:60`
- **Status:** PARTIAL
- **Columns DDL:** 15 | Doc: 7
- **Missing from docs:** `description`, `is_archived`, `is_readonly`, `allow_reactions`, `allow_replies`, `avatar_url`, `last_message_id`, `last_message_preview`, `updated_at`
- **Differences:**
  - DDL: `last_message_id UUID` (reference a propio mensaje) | Doc: no presente
  - DDL: `last_message_preview TEXT` (denormalizado) | Doc: no presente
  - DDL: `description TEXT`, `avatar_url VARCHAR(500)`, `is_readonly BOOLEAN`, `allow_reactions BOOLEAN`, `allow_replies BOOLEAN` | Doc: no presentes
- **FK documented:** PARTIAL — FK a classrooms y created_by documentados; `last_message_id` no documentada

---

### communication.conversation_participants

- **DDL:** `apps/database/ddl/schemas/communication/tables/03-conversation_participants.sql` (segunda tabla en archivo)
- **Doc:** `docs/20-architecture/schema-reference/19-communication.md:75`
- **Status:** PARTIAL
- **Columns DDL:** 14 | Doc: 8
- **Missing from docs:** `joined_at`, `left_at`, `muted_until`, `last_read_message_id`, `nickname`, `show_notifications`, `pin_order`, `updated_at`, `created_at`
- **Differences:**
  - DDL: `muted_until TIMESTAMPTZ` (expiracion de silencio) | Doc: no presente
  - DDL: `last_read_message_id UUID` (mensaje especifico leido) | Doc: no presente
  - DDL: `nickname VARCHAR(100)` (nombre personalizado en conversacion) | Doc: no presente
  - DDL: `pin_order INTEGER` (para pinear conversaciones) | Doc: no presente
  - DDL: `show_notifications BOOLEAN` | Doc: no presente
- **FK documented:** PARTIAL — FKs principales documentadas; `last_read_message_id` no documentada

---

## 3. SCHEMA: content_management

**DDL path:** `apps/database/ddl/schemas/content_management/tables/`
**Doc path:** `docs/20-architecture/schema-reference/13-content.md`
**DDL table count:** 10 (01-07 numerados + content_authors.sql + content_categories.sql + media_metadata.sql)
**Doc table count:** 10 (incluye media_metadatas, content_authors, content_categories, tags, mas los 7 numerados)

---

### content_management.content_templates

- **DDL:** `apps/database/ddl/schemas/content_management/tables/01-content_templates.sql`
- **Doc:** `docs/20-architecture/schema-reference/13-content.md:11`
- **Status:** MATCH
- **Columns DDL:** 17 | Doc: 17
- **Missing from docs:** ninguna
- **Type mismatches:** ninguno
- **FK documented:** YES — tenant_id y created_by documentados correctamente

---

### content_management.marie_curie_contents

- **DDL:** `apps/database/ddl/schemas/content_management/tables/02-marie_curie_content.sql`
- **Doc:** `docs/20-architecture/schema-reference/13-content.md:67`
- **Status:** MATCH
- **Columns DDL:** 27 | Doc: 27
- **Missing from docs:** ninguna
- **Type mismatches:** ninguno
- **FK documented:** YES — tenant_id, created_by, reviewed_by, approved_by documentados

---

### content_management.media_files

- **DDL:** `apps/database/ddl/schemas/content_management/tables/03-media_files.sql`
- **Doc:** `docs/20-architecture/schema-reference/13-content.md:112`
- **Status:** MATCH
- **Columns DDL:** 36 | Doc: 36
- **Missing from docs:** ninguna
- **Type mismatches:** ninguno
- **FK documented:** YES — tenant_id, uploaded_by documentados con ON DELETE behavior

---

### content_management.content_versions

- **DDL:** `apps/database/ddl/schemas/content_management/tables/04-content_versions.sql`
- **Doc:** `docs/20-architecture/schema-reference/13-content.md:40`
- **Status:** MATCH
- **Columns DDL:** 13 | Doc: 13
- **Missing from docs:** ninguna
- **Type mismatches:** ninguno
- **FK documented:** YES — tenant_id, created_by documentados

---

### content_management.flagged_contents

- **DDL:** `apps/database/ddl/schemas/content_management/tables/05-flagged_content.sql`
- **Doc:** `docs/20-architecture/schema-reference/13-content.md:196`
- **Status:** MATCH
- **Columns DDL:** 12 | Doc: 12
- **Missing from docs:** ninguna
- **Type mismatches:** Doc dice `TIMESTAMPTZ`, DDL usa `TIMESTAMP WITH TIME ZONE` (equivalentes)
- **FK documented:** YES — reported_by (ON DELETE RESTRICT), reviewed_by (ON DELETE SET NULL)

---

### content_management.moderation_rules

- **DDL:** `apps/database/ddl/schemas/content_management/tables/06-moderation_rules.sql`
- **Doc:** `docs/20-architecture/schema-reference/13-content.md:221`
- **Status:** MATCH
- **Columns DDL:** 13 | Doc: 13
- **Missing from docs:** ninguna
- **Type mismatches:** Doc dice TIMESTAMP para created_at/updated_at; DDL usa TIMESTAMP DEFAULT gamilit.now_mexico() (equivalente)
- **FK documented:** YES — created_by (ON DELETE SET NULL) documentado

---

### content_management.content_authors

- **DDL:** `apps/database/ddl/schemas/content_management/tables/content_authors.sql`
- **Doc:** `docs/20-architecture/schema-reference/13-content.md:248`
- **Status:** MATCH
- **Columns DDL:** 12 | Doc: 12
- **Missing from docs:** ninguna
- **Type mismatches:** ninguno
- **FK documented:** YES — user_id -> auth_management.profiles (UNIQUE, ON DELETE CASCADE)

---

### content_management.content_categories

- **DDL:** `apps/database/ddl/schemas/content_management/tables/content_categories.sql`
- **Doc:** `docs/20-architecture/schema-reference/13-content.md:272`
- **Status:** MATCH
- **Columns DDL:** 11 | Doc: 11
- **Missing from docs:** ninguna
- **Type mismatches:** ninguno
- **FK documented:** YES — parent_category_id self-ref (ON DELETE SET NULL) documentado

---

### content_management.media_metadatas

- **DDL:** `apps/database/ddl/schemas/content_management/tables/media_metadata.sql`
- **Doc:** `docs/20-architecture/schema-reference/13-content.md:167`
- **Status:** MATCH
- **Columns DDL:** 14 | Doc: 14
- **Missing from docs:** ninguna
- **Type mismatches:** ninguno
- **FK documented:** YES — media_file_id (UNIQUE, ON DELETE CASCADE) documentado

---

### content_management.tags

- **DDL:** `apps/database/ddl/schemas/content_management/tables/07-tags.sql`
- **Doc:** `docs/20-architecture/schema-reference/13-content.md:295`
- **Status:** MATCH
- **Columns DDL:** 8 | Doc: 8
- **Missing from docs:** ninguna
- **Type mismatches:** ninguno
- **FK documented:** YES (n/a — tabla sin FKs externas, solo UNIQUE en tag_slug)

---

## 4. SCHEMA: system_configuration (docs como "settings")

**DDL path:** `apps/database/ddl/schemas/system_configuration/tables/`
**Doc path:** `docs/20-architecture/schema-reference/15-settings.md`
**DDL table count:** 9 (01-06 numerados + api_configurations.sql + environment_configs.sql + tenant_configurations.sql)
**Doc table count:** 9 (mezcla de settings.* y system_configuration.* — ver nota abajo)

**Nota arquitectural:** La doc 15-settings.md mezcla dos namespaces. Las primeras 3 entradas usan prefijo `settings.*` (que no existe en DDL — schema fisico es `system_configuration`). Las 6 restantes usan `system_configuration.*` correctamente. Las primeras 3 (`system_settings`, `feature_flags`, `gamification_params` en 15-settings.md) parecen ser un modelo legacy/conceptual que NO coincide con el DDL real.

---

### system_configuration.system_settings

- **DDL:** `apps/database/ddl/schemas/system_configuration/tables/01-system_settings.sql`
- **Doc:** `docs/20-architecture/schema-reference/15-settings.md:7` (bajo `settings.system_settings`)
- **Status:** PARTIAL (doc bajo nombre de schema incorrecto)
- **Columns DDL:** 23 | Doc: 6
- **Missing from docs:** `tenant_id`, `setting_category`, `setting_subcategory`, `value_type`, `default_value`, `display_name`, `help_text`, `is_public`, `is_readonly`, `is_system`, `requires_restart`, `validation_rules`, `allowed_values`, `min_value`, `max_value`, `metadata`, `created_by`, `updated_by`
- **Differences:**
  - Doc: `key VARCHAR(100)` | DDL: `setting_key TEXT` — **NOMBRE DISTINTO**
  - Doc: `value JSONB` | DDL: `setting_value TEXT` — **TIPO DISTINTO** (doc dice JSONB, DDL es TEXT)
  - Doc tiene 6 columnas; DDL tiene 23 — doc es modelo extremadamente simplificado
  - Doc: schema `settings` | DDL: schema `system_configuration` — **SCHEMA NAME INCORRECTO EN DOC**
- **FK documented:** NO — DDL tiene FKs a auth_management.profiles (created_by, updated_by) y tenants; doc no menciona ningun FK

---

### system_configuration.feature_flags

- **DDL:** `apps/database/ddl/schemas/system_configuration/tables/06-feature_flags.sql`
- **Doc:** `docs/20-architecture/schema-reference/15-settings.md:24` (bajo `settings.feature_flags`)
- **Status:** PARTIAL (doc bajo nombre de schema incorrecto y modelo incorrecto)
- **Columns DDL:** 30 | Doc: 9
- **Missing from docs:** `flag_key`, `is_system_wide`, `rollout_percentage`, `rollout_strategy`, `target_users`, `target_roles`, `starts_at`, `ends_at`, `depends_on_flags`, `conflicts_with`, `default_value`, `config_schema`, `config_options`, `tenant_overrides`, `classroom_overrides`, `required_role`, `is_user_configurable`, `tags`, `documentation_url`, `changelog`, `created_by`, `enabled_at`, `disabled_at`, `deprecated_at`, `will_be_removed_at`
- **Differences:**
  - Doc: `flag_name VARCHAR(100)` UNIQUE (tenant_id, flag_name) | DDL: `flag_key VARCHAR(100)` UNIQUE standalone — **NOMBRE DISTINTO, LOGICA DISTINTA**
  - Doc: `tenant_id UUID NOT NULL` | DDL: tenant overrides via `tenant_overrides JSONB` — **DISENO DIFERENTE**
  - Doc: `flag_type feature_flag_type` | DDL: no existe este tipo — DDL usa BOOLEAN simple — **TIPO DISTINTO**
  - Doc: `value JSONB` | DDL: `default_value JSONB` — **NOMBRE DISTINTO**
  - Doc: schema `settings` | DDL: schema `system_configuration` — **SCHEMA NAME INCORRECTO EN DOC**
- **FK documented:** NO — la FK de tenant_id en doc no existe en DDL

---

### system_configuration.gamification_parameters (doc: "gamification_params")

- **DDL:** `apps/database/ddl/schemas/system_configuration/tables/02-gamification_parameters.sql`
- **Doc:** `docs/20-architecture/schema-reference/15-settings.md:44` (bajo `settings.gamification_params`)
- **Status:** PARTIAL (doc bajo nombre de schema incorrecto y tabla simplificada)
- **Columns DDL:** 28 | Doc: 7
- **Missing from docs:** `param_name`, `description`, `default_value`, `value_type`, `min_value`, `max_value`, `allowed_values`, `validation_rules`, `scope`, `is_system_managed`, `is_overridable`, `tenant_overrides`, `classroom_overrides`, `affects_systems`, `depends_on`, `usage_count`, `last_modified_by`, `last_modified_at`, `tags`, `documentation`, `examples`, `is_active`, `is_deprecated`, `deprecated_at`, `deprecated_reason`, `replacement_param_key`, `updated_at`
- **Differences:**
  - Doc: table name `gamification_params` | DDL: `gamification_parameters` — **NOMBRE DE TABLA DISTINTO**
  - Doc: `tenant_id UUID NOT NULL` | DDL: tenant overrides via JSONB — **DISENO DIFERENTE**
  - Doc: schema `settings` | DDL: schema `system_configuration` — **SCHEMA NAME INCORRECTO EN DOC**
  - DDL: tier de override (tenant + classroom), ciclo de vida (deprecated), scope granular | Doc: no documentado
- **FK documented:** PARTIAL — doc menciona tenant_id FK (que no existe en DDL como columna directa)

---

### system_configuration.api_configurations

- **DDL:** `apps/database/ddl/schemas/system_configuration/tables/api_configurations.sql`
- **Doc:** `docs/20-architecture/schema-reference/15-settings.md:60`
- **Status:** MATCH
- **Columns DDL:** 13 | Doc: 13
- **Missing from docs:** ninguna
- **Type mismatches:** Doc dice TIMESTAMPTZ; DDL usa `TIMESTAMP WITH TIME ZONE` (equivalente)
- **FK documented:** YES (n/a — sin FKs externas; constraint UNIQUE en service_name documentado)

---

### system_configuration.environment_configs

- **DDL:** `apps/database/ddl/schemas/system_configuration/tables/environment_configs.sql`
- **Doc:** `docs/20-architecture/schema-reference/15-settings.md:87`
- **Status:** MATCH
- **Columns DDL:** 9 | Doc: 9
- **Missing from docs:** ninguna
- **Type mismatches:** ninguno
- **FK documented:** YES (n/a — sin FKs externas)

---

### system_configuration.notification_settings

- **DDL:** `apps/database/ddl/schemas/system_configuration/tables/03-notification_settings.sql`
- **Doc:** `docs/20-architecture/schema-reference/15-settings.md:110`
- **Status:** MATCH
- **Columns DDL:** 16 | Doc: 16
- **Missing from docs:** ninguna
- **Type mismatches:** ninguno
- **FK documented:** YES — user_id, tenant_id, created_by, updated_by documentados

---

### system_configuration.notification_settings_globals

- **DDL:** `apps/database/ddl/schemas/system_configuration/tables/05-notification_settings_global.sql`
- **Doc:** `docs/20-architecture/schema-reference/15-settings.md:143`
- **Status:** MATCH
- **Columns DDL:** 11 | Doc: 11
- **Missing from docs:** ninguna
- **Type mismatches:** ninguno
- **FK documented:** YES (n/a — tabla sin FKs externas; diferencia con notification_settings documentada)

---

### system_configuration.rate_limits

- **DDL:** `apps/database/ddl/schemas/system_configuration/tables/04-rate_limits.sql`
- **Doc:** `docs/20-architecture/schema-reference/15-settings.md:169`
- **Status:** MATCH
- **Columns DDL:** 10 | Doc: 10
- **Missing from docs:** ninguna
- **Type mismatches:** ninguno
- **FK documented:** YES (n/a — sin FKs externas; constraints documentados)

---

### system_configuration.tenant_configurations

- **DDL:** `apps/database/ddl/schemas/system_configuration/tables/tenant_configurations.sql`
- **Doc:** `docs/20-architecture/schema-reference/15-settings.md:194`
- **Status:** MATCH
- **Columns DDL:** 8 | Doc: 8
- **Missing from docs:** ninguna
- **Type mismatches:** ninguno
- **FK documented:** YES — tenant_id -> auth_management.tenants ON DELETE CASCADE

---

## 5. SCHEMA: admin_dashboard

**DDL path:** `apps/database/ddl/schemas/admin_dashboard/tables/`
**Doc path:** `docs/20-architecture/schema-reference/18-admin-dashboard.md`
**DDL table count:** 3 (bulk_operations, admin_reports, metrics_history)
**Doc table count:** 4 (incluye materialized_views_config que NO existe como tabla DDL)

---

### admin_dashboard.bulk_operations

- **DDL:** `apps/database/ddl/schemas/admin_dashboard/tables/01-bulk_operations.sql`
- **Doc:** `docs/20-architecture/schema-reference/18-admin-dashboard.md:22`
- **Status:** PARTIAL
- **Columns DDL:** 13 | Doc: 13
- **Missing from docs:** `error_message` column not present — wait, checking again: DDL has `error_details JSONB` | Doc shows `error_details JSONB` — match. BUT:
- **Differences:**
  - DDL: `started_at TIMESTAMP` | Doc: `started_at TIMESTAMP` — MATCH
  - DDL: NO `created_at` | Doc: NO `created_at` — MATCH
  - DDL: NO `error_message` | Doc: NO `error_message` — MATCH
  - Actual gap: Doc says `completed_count INTEGER NOT NULL` | DDL: `completed_count INTEGER DEFAULT 0` (no NOT NULL) — minor nullable difference
  - Doc is mostly accurate but omits `completed_at` nullable note and does not document CHECK constraints
- **FK documented:** YES — started_by -> auth_management.profiles documented

---

### admin_dashboard.admin_reports

- **DDL:** `apps/database/ddl/schemas/admin_dashboard/tables/02-admin_reports.sql`
- **Doc:** `docs/20-architecture/schema-reference/18-admin-dashboard.md:42`
- **Status:** PARTIAL
- **Columns DDL:** 13 | Doc: 11
- **Missing from docs:** `error_message TEXT`, `created_at TIMESTAMP`
- **Differences:**
  - DDL has `error_message TEXT` | Doc: not in table listing
  - DDL has `created_at TIMESTAMP` | Doc: not shown (only `expires_at`)
  - DDL: `tenant_id UUID NOT NULL` added via `FIX-BE-001-2026-01-18` | Doc: shows `tenant_id` — this matches
- **FK documented:** YES — requested_by -> auth_management.profiles, tenant_id -> auth_management.tenants documented

---

### admin_dashboard.metrics_history

- **DDL:** `apps/database/ddl/schemas/admin_dashboard/tables/03-metrics_history.sql`
- **Doc:** `docs/20-architecture/schema-reference/18-admin-dashboard.md:71`
- **Status:** MISSING_FROM_DOCS (doc stub only)
- **Columns DDL:** 23 | Doc: 0 (doc only says "Historial de metricas del sistema para tracking temporal" with no columns)
- **Missing from docs:** `recorded_at`, `memory_total_mb`, `memory_used_mb`, `memory_free_mb`, `memory_usage_percent`, `heap_used_mb`, `heap_total_mb`, `cpu_user_ms`, `cpu_system_ms`, `cpu_usage_percent`, `cpu_cores`, `load_average_1m`, `load_average_5m`, `load_average_15m`, `process_uptime_seconds`, `active_handles`, `active_requests`, `system_uptime_seconds`, `node_version`, `platform`, `hostname`, `created_at`
- **FK documented:** NO (no columns documented)

---

### admin_dashboard.materialized_views_config

- **DDL:** DOES NOT EXIST as a table (no DDL file found; config is handled via materialized-views/ dir)
- **Doc:** `docs/20-architecture/schema-reference/18-admin-dashboard.md:60`
- **Status:** MISSING_FROM_DDL
- **Columns DDL:** 0 | Doc: 4 (`id`, `view_name`, `refresh_interval`, `last_refresh_at`, `is_active`)
- **Missing from DDL:** All 5 columns documented
- **FK documented:** N/A (table doesn't exist in DDL)

**Nota:** La doc describe esta tabla como configuracion de refresh para materialized views. No existe como tabla DDL fisica — las materialized views se definen en `admin_dashboard/materialized-views/01-materialized_views.sql`. Esta es una tabla fantasma en la doc.

---

## 6. SCHEMA: storage

**DDL path:** `apps/database/ddl/schemas/storage/`
**Doc path:** `docs/20-architecture/schema-reference/` (referenced in `_INDEX.md` as placeholder)
**DDL table count:** 0 (schema RESERVADO — solo ENUMs deprecados en `enums/_deprecated/`)
**Doc table count:** 0 (listado como placeholder en `_INDEX.md`)

---

### storage (schema completo)

- **DDL:** `apps/database/ddl/schemas/storage/_MAP.md` — RESERVADO, 0 objetos activos
- **Doc:** `docs/20-architecture/schema-reference/17-18-placeholder.md` (placeholder)
- **Status:** MATCH (ambos acuerdan que el schema esta vacio/reservado)
- **Columns DDL:** 0 | Doc: 0
- **Missing from docs:** ninguna (schema intencionalmente vacio)
- **Notes:** El _MAP.md del schema documenta que el ENUM `buckettype` fue deprecado (DB-158). El doc principal lo lista bajo "placeholder/vacios" junto con `public` y `optimization`. Alineacion correcta.

---

## TABLA RESUMEN

| Schema | Tabla | Status | DDL Cols | Doc Cols | Gaps Criticos |
|--------|-------|--------|----------|----------|---------------|
| notifications | notifications | MISSING_FROM_DOCS | 15 | 0 | Tabla entera no documentada separadamente |
| notifications | notification_preferences | PARTIAL | 11 | 10 | 6 cols DDL ausentes en doc; 2 cols doc ausentes en DDL; nombres distintos |
| notifications | notification_logs | PARTIAL | 7 | 7 | FK target incorrecto; 4 cols DDL ausentes; tenant_id fantasma en doc |
| notifications | notification_templates | PARTIAL | 16 | 9 | 7 cols DDL ausentes (v2.0 features); 2 cols doc fantasma; nombre col distinto |
| notifications | notification_queue | PARTIAL | 10 | 15 | Modelo completamente diferente; 7 cols doc fantasma; FK critica ausente en doc |
| notifications | user_devices | MATCH | 9 | 9 | Ninguno |
| notifications | rate_limit_logs | MATCH | 10 | 10 | Ninguno |
| notifications | push_subscriptions | MISSING_FROM_DDL | 0 | 10 | Tabla en doc no existe en DDL |
| communication | messages | PARTIAL | 27 | ~15 | 12 cols DDL ausentes en doc; message_type CHECK incompleto |
| communication | message_participants | MATCH | 6 | 6 | Ninguno |
| communication | conversations | PARTIAL | 15 | 7 | 8 cols DDL ausentes en doc |
| communication | conversation_participants | PARTIAL | 14 | 8 | 6 cols DDL ausentes en doc |
| content_management | content_templates | MATCH | 17 | 17 | Ninguno |
| content_management | marie_curie_contents | MATCH | 27 | 27 | Ninguno |
| content_management | media_files | MATCH | 36 | 36 | Ninguno |
| content_management | content_versions | MATCH | 13 | 13 | Ninguno |
| content_management | flagged_contents | MATCH | 12 | 12 | Ninguno |
| content_management | moderation_rules | MATCH | 13 | 13 | Ninguno |
| content_management | content_authors | MATCH | 12 | 12 | Ninguno |
| content_management | content_categories | MATCH | 11 | 11 | Ninguno |
| content_management | media_metadatas | MATCH | 14 | 14 | Ninguno |
| content_management | tags | MATCH | 8 | 8 | Ninguno |
| system_configuration | system_settings | PARTIAL | 23 | 6 | Schema name incorrecto en doc; 17 cols DDL ausentes; tipo de valor distinto |
| system_configuration | feature_flags | PARTIAL | 30 | 9 | Schema name incorrecto en doc; 21 cols DDL ausentes; diseno diferente |
| system_configuration | gamification_parameters | PARTIAL | 28 | 7 | Schema name incorrecto en doc; 21 cols DDL ausentes; nombre tabla distinto |
| system_configuration | api_configurations | MATCH | 13 | 13 | Ninguno |
| system_configuration | environment_configs | MATCH | 9 | 9 | Ninguno |
| system_configuration | notification_settings | MATCH | 16 | 16 | Ninguno |
| system_configuration | notification_settings_globals | MATCH | 11 | 11 | Ninguno |
| system_configuration | rate_limits | MATCH | 10 | 10 | Ninguno |
| system_configuration | tenant_configurations | MATCH | 8 | 8 | Ninguno |
| admin_dashboard | bulk_operations | PARTIAL | 13 | 13 | Diferencias menores en nullable; constraints no documentados |
| admin_dashboard | admin_reports | PARTIAL | 13 | 11 | 2 cols DDL ausentes en doc (error_message, created_at) |
| admin_dashboard | metrics_history | MISSING_FROM_DOCS | 23 | 0 | Tabla existe en DDL pero sin columnas documentadas |
| admin_dashboard | materialized_views_config | MISSING_FROM_DDL | 0 | 5 | Tabla en doc no existe en DDL |
| storage | (schema completo) | MATCH | 0 | 0 | Schema reservado — alineacion correcta |

---

## ESTADISTICAS GLOBALES

| Metrica | Valor |
|---------|-------|
| Tablas auditadas | 37 |
| MATCH (100% alineadas) | 16 |
| PARTIAL (diferencias menores/moderadas) | 15 |
| MISSING_FROM_DOCS (tabla en DDL sin doc) | 2 |
| MISSING_FROM_DDL (tabla en doc sin DDL) | 2 |
| MATCH % | 43% |
| Schemas con cobertura perfecta | content_management (10/10 tablas MATCH) |
| Schemas con problemas criticos | notifications (5/7 PARTIAL o MISSING), system_configuration (3/9 PARTIAL con schema name incorrecto) |

---

## GAPS CRITICOS (PRIORIDAD ALTA)

### GAP-NOTIF-001: notifications.notifications no documentada (CRITICO)
- **Problema:** La tabla principal `notifications.notifications` (15 columnas) no tiene entrada propia en el doc. La doc de `notification_queue` mezcla campos de ambas tablas.
- **Impacto:** Confusion sobre que tabla contiene que datos. Developers pueden apuntar FKs al modelo incorrecto.
- **Accion recomendada:** Agregar seccion completa para `notifications.notifications` en 09-notifications.md.

### GAP-NOTIF-002: notifications.notification_queue — modelo completamente diferente (CRITICO)
- **Problema:** La doc describe `notification_queue` como si fuera una tabla de contenido (con `user_id`, `subject`, `body`, `read_at`). El DDL es una cola de procesamiento con `notification_id` FK, `attempts`, `max_attempts`.
- **Impacto:** Un developer siguiendo la doc construiria una entidad completamente incorrecta.
- **Accion recomendada:** Reescribir completamente la seccion de `notification_queue` en 09-notifications.md.

### GAP-NOTIF-003: notifications.push_subscriptions en doc, ausente en DDL
- **Problema:** Doc lista `push_subscriptions` con 10 columnas. No existe ningun archivo DDL para esta tabla. `user_devices` tiene funcionalidad similar pero distinta.
- **Impacto:** Confusion sobre si la tabla existe o fue reemplazada.
- **Accion recomendada:** Clarificar si `push_subscriptions` fue reemplazada por `user_devices`. Si es asi, eliminar del doc. Si debe existir, crear el DDL.

### GAP-SYSCFG-001: system_configuration — schema name incorrecto en primeras 3 entradas (MODERADO)
- **Problema:** Las entradas `settings.system_settings`, `settings.feature_flags`, `settings.gamification_params` en 15-settings.md usan el prefijo `settings` que no existe como schema fisico (el schema fisico es `system_configuration`). Ademas, los modelos documentados son significativamente mas simples que los DDL reales.
- **Impacto:** Inconsistencia de naming. Un developer buscando `settings.feature_flags` en la DB no la encontrara.
- **Accion recomendada:** Actualizar 15-settings.md para usar prefijo `system_configuration.*` en todas las entradas, y expandir las columnas de `system_settings`, `feature_flags`, `gamification_parameters` para reflejar el DDL actual.

### GAP-ADMIN-001: admin_dashboard.metrics_history sin columnas documentadas (MODERADO)
- **Problema:** La tabla `metrics_history` tiene 23 columnas en DDL pero el doc solo dice "Historial de metricas del sistema para tracking temporal" sin ninguna columna.
- **Impacto:** No se puede construir una entidad TypeORM correcta sin referirse directamente al DDL.
- **Accion recomendada:** Agregar tabla de columnas completa para `metrics_history` en 18-admin-dashboard.md.

### GAP-ADMIN-002: admin_dashboard.materialized_views_config en doc, ausente en DDL
- **Problema:** Doc lista esta tabla con 5 columnas. No existe como tabla DDL. La logica de refresh esta implementada directamente en el archivo de materialized views.
- **Impacto:** Tabla fantasma que puede confundir si alguien intenta crear una Entity para ella.
- **Accion recomendada:** Eliminar esta entrada de 18-admin-dashboard.md o reemplazarla con nota explicando que el refresh se gestiona via `admin_dashboard/materialized-views/01-materialized_views.sql`.

---

## HALLAZGOS POSITIVOS

1. **content_management:** Cobertura perfecta (10/10 tablas MATCH). La doc 13-content.md es un modelo de calidad para el resto del proyecto.
2. **system_configuration (tablas post-2025-11):** Las 6 tablas documentadas con prefijo correcto (`api_configurations`, `environment_configs`, `notification_settings`, `notification_settings_globals`, `rate_limits`, `tenant_configurations`) estan perfectamente alineadas.
3. **communication.message_participants:** MATCH perfecto — buena documentacion de una tabla critica de RLS.
4. **storage schema:** Correctamente documentado como reservado/placeholder — no hay confusion.
5. **notifications.user_devices y rate_limit_logs:** Documentacion actualizada y precisa, probablemente sincronizada durante la auditoria de 2026-02-03.

---

*Generado: 2026-02-27 | Auditor: Claude Sonnet 4.6 | Read-Only | TASK-2026-02-27-AUDITORIA-DOCS*
