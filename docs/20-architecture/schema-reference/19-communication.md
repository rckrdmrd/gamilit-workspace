# Schema: communication (4 tablas)

> Parte de [Schema Reference](_INDEX.md) - GAMILIT
> **Schema fisico DDL:** `communication`
> **Tipo:** domain
> **DDL Path:** `apps/database/ddl/schemas/communication/`
> **Constante Backend:** `DB_SCHEMAS.COMMUNICATION`
> **Version:** 2.0.0
> **Fecha:** 2026-02-27

---

## Descripcion

Sistema de mensajeria interna entre docentes, estudiantes y padres. Soporta mensajes directos, anuncios de aula, conversaciones grupales con hilos y respuestas. Incluye tracking de lectura individual, moderacion, reacciones, y preferencias por participante.

---

## Tablas (4)

### communication.messages [DDL-ACCURATE]

**Descripcion:** Messages and chat system for teacher-student communication. Supports direct messages, classroom announcements, threaded conversations, and assignment feedback.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | Primary key |
| sender_id | UUID | NOT NULL | - | FK -> auth_management.profiles (remitente) |
| recipient_id | UUID | NULL | - | FK -> auth_management.profiles (destinatario directo) |
| classroom_id | UUID | NULL | - | FK -> social_features.classrooms (broadcast) |
| thread_id | UUID | NULL | - | FK -> communication.messages (self-ref, para hilos) |
| parent_message_id | UUID | NULL | - | FK -> communication.messages (self-ref, para respuestas) |
| subject | VARCHAR(255) | NULL | - | Asunto (mensajes directos) |
| content | TEXT | NOT NULL | - | Contenido del mensaje |
| message_type | VARCHAR(50) | NOT NULL | 'direct' | direct, classroom_announcement, classroom_chat, private_feedback, assignment_comment, system |
| attachments | JSONB | NOT NULL | '[]'::jsonb | Array de adjuntos: [{"type":"file","url":"...","name":"...","size":1024}] |
| is_read | BOOLEAN | NOT NULL | FALSE | Estado de lectura global |
| read_at | TIMESTAMPTZ | NULL | - | Fecha de lectura (auto-set via trigger) |
| is_deleted | BOOLEAN | NOT NULL | FALSE | Soft delete flag |
| deleted_at | TIMESTAMPTZ | NULL | - | Fecha de eliminacion (auto-set via trigger) |
| deleted_by | UUID | NULL | - | FK -> auth_management.profiles (quien elimino) |
| priority | VARCHAR(20) | NOT NULL | 'normal' | low, normal, high, urgent |
| is_pinned | BOOLEAN | NOT NULL | FALSE | Mensaje fijado |
| is_archived | BOOLEAN | NOT NULL | FALSE | Mensaje archivado |
| requires_response | BOOLEAN | NOT NULL | FALSE | Requiere respuesta del destinatario |
| response_deadline | TIMESTAMPTZ | NULL | - | Fecha limite para respuesta |
| reactions | JSONB | NOT NULL | '{}'::jsonb | Reacciones emoji: {"thumbs_up":["uuid1"],"heart":["uuid2"]} |
| is_flagged | BOOLEAN | NOT NULL | FALSE | Marcado para moderacion |
| flagged_reason | TEXT | NULL | - | Razon del flaggeo |
| flagged_by | UUID | NULL | - | FK -> auth_management.profiles (quien flaggeo) |
| flagged_at | TIMESTAMPTZ | NULL | - | Fecha de flaggeo (auto-set via trigger) |
| moderation_status | VARCHAR(50) | NOT NULL | 'approved' | approved, pending, flagged, removed |
| metadata | JSONB | NOT NULL | '{}'::jsonb | Contexto adicional: assignment_id, exercise_id, etc. |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | Fecha de creacion |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | Ultima modificacion (auto-update via trigger) |
| edited_at | TIMESTAMPTZ | NULL | - | Fecha de ultima edicion de contenido (auto-set via trigger) |
| edit_count | INTEGER | NOT NULL | 0 | Contador de ediciones de contenido (auto-increment via trigger) |

**Constraints:**
- `messages_type_valid` CHECK: message_type IN ('direct','classroom_announcement','classroom_chat','private_feedback','assignment_comment','system')
- `messages_priority_valid` CHECK: priority IN ('low','normal','high','urgent')
- `messages_moderation_status_valid` CHECK: moderation_status IN ('approved','pending','flagged','removed')
- `messages_recipient_or_classroom` CHECK: recipient_id IS NOT NULL OR classroom_id IS NOT NULL

**Indexes (11):**
- `idx_messages_sender` (sender_id, created_at DESC) WHERE is_deleted = FALSE
- `idx_messages_recipient` (recipient_id, created_at DESC) WHERE is_deleted = FALSE
- `idx_messages_classroom` (classroom_id, created_at DESC) WHERE is_deleted = FALSE
- `idx_messages_unread` (recipient_id, created_at DESC) WHERE is_read = FALSE AND is_deleted = FALSE
- `idx_messages_thread` (thread_id, created_at ASC) WHERE thread_id IS NOT NULL AND is_deleted = FALSE
- `idx_messages_parent` (parent_message_id, created_at ASC) WHERE parent_message_id IS NOT NULL AND is_deleted = FALSE
- `idx_messages_flagged` (flagged_at DESC) WHERE is_flagged = TRUE
- `idx_messages_requiring_response` (recipient_id, response_deadline) WHERE requires_response = TRUE AND is_deleted = FALSE
- `idx_messages_classroom_type` (classroom_id, message_type, created_at DESC) WHERE is_deleted = FALSE
- `idx_messages_attachments` GIN(attachments)
- `idx_messages_metadata` GIN(metadata)

**Trigger:** `trg_update_message_tracking_fields` -> `communication.update_message_tracking_fields()` (specialized: updated_at + edit tracking + auto-set read_at/deleted_at/flagged_at)

**Functions inline (3):**
- `communication.update_message_tracking_fields()` - Trigger function with specialized message field tracking
- `communication.get_unread_count(p_user_id, p_classroom_id)` - Count unread messages for user, optionally filtered by classroom
- `communication.mark_conversation_read(p_user_id, p_thread_id)` - Mark all thread messages as read for user

**View:** `communication.recent_classroom_messages` - Recent classroom messages with sender info and reply count (top-level only, pinned first)

**RLS Policies (6):** Via `rls-policies/01-messages-policies.sql`
- `messages_select_own` SELECT: sender or recipient
- `messages_select_classroom` SELECT: classroom members
- `messages_select_admin` SELECT: super_admin, admin_teacher
- `messages_insert_own` INSERT: sender_id must match current user
- `messages_update_own` UPDATE: only own messages
- `messages_delete_own` DELETE: only own messages

**Entity:** `apps/backend/src/modules/teacher/entities/message.entity.ts` -> class `Message`

---

### communication.message_participants [DDL-ACCURATE]

**Descripcion:** Participantes de mensajes para tracking de estado de lectura individual. Cada mensaje puede tener multiples participantes con diferentes roles (sender, recipient, cc).

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | Primary key |
| message_id | UUID | NOT NULL | - | FK -> communication.messages (ON DELETE CASCADE) |
| user_id | UUID | NOT NULL | - | FK -> auth_management.profiles (ON DELETE CASCADE) |
| role | VARCHAR(20) | NOT NULL | 'recipient' | sender, recipient, cc |
| is_read | BOOLEAN | NOT NULL | FALSE | Lectura individual por participante |
| read_at | TIMESTAMPTZ | NULL | - | Fecha de lectura (auto-set via trigger) |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | Fecha de creacion |

**Constraints:**
- `message_participants_role_valid` CHECK: role IN ('sender','recipient','cc')
- `message_participants_unique` UNIQUE: (message_id, user_id, role)

**Indexes (5):**
- `idx_message_participants_message_id` (message_id)
- `idx_message_participants_user_id` (user_id)
- `idx_message_participants_unread` (user_id, message_id) WHERE is_read = FALSE
- `idx_message_participants_role` (user_id, role)
- `idx_message_participants_user_read` (user_id, is_read, created_at DESC)

**Trigger:** `trg_update_message_participant_read` -> `communication.update_message_participant_read()` (auto-set read_at when is_read changes to TRUE)

**Functions inline (2):**
- `communication.get_user_unread_count(p_user_id)` - Unread message count via participants table
- `communication.mark_message_read_for_user(p_message_id, p_user_id)` - Mark message as read for specific user

**RLS Policies (3):**
- `message_participants_select_own` SELECT: own records only
- `message_participants_update_own` UPDATE: own records only (mark as read)
- `message_participants_insert_system` INSERT: unrestricted (system inserts on message creation)

**Entity:** `apps/backend/src/modules/teacher/entities/message.entity.ts` -> class `MessageParticipant`

---

### communication.conversations [DDL-ACCURATE]

**Descripcion:** Conversations container for group messaging. Supports direct (1-1), group (multi-user), and classroom-linked conversations. Part of GAP-SOC-003 implementation.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | Primary key |
| title | VARCHAR(255) | NULL | - | Titulo (grupos) |
| description | TEXT | NULL | - | Descripcion de la conversacion |
| conversation_type | VARCHAR(30) | NOT NULL | 'direct' | direct (1-1), group (multi-user), classroom (vinculada a aula) |
| classroom_id | UUID | NULL | - | FK -> social_features.classrooms (ON DELETE CASCADE) |
| is_archived | BOOLEAN | NOT NULL | FALSE | Conversacion archivada |
| is_readonly | BOOLEAN | NOT NULL | FALSE | Solo lectura (sin nuevos mensajes) |
| allow_reactions | BOOLEAN | NOT NULL | TRUE | Permitir reacciones emoji |
| allow_replies | BOOLEAN | NOT NULL | TRUE | Permitir respuestas |
| avatar_url | VARCHAR(500) | NULL | - | Avatar/imagen para conversaciones grupales |
| last_message_id | UUID | NULL | - | ID del ultimo mensaje (denormalizado) |
| last_message_at | TIMESTAMPTZ | NULL | - | Ultima actividad (denormalizado) |
| last_message_preview | TEXT | NULL | - | Preview del ultimo mensaje (denormalizado) |
| message_count | INTEGER | NOT NULL | 0 | Total de mensajes en la conversacion |
| created_by | UUID | NOT NULL | - | FK -> auth_management.profiles (ON DELETE CASCADE) |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | Fecha de creacion |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | Ultima modificacion (auto-update via trigger) |

**Constraints:**
- `conversations_type_valid` CHECK: conversation_type IN ('direct','group','classroom')

**Indexes (4):**
- `idx_conversations_created_by` (created_by, created_at DESC)
- `idx_conversations_classroom` (classroom_id) WHERE classroom_id IS NOT NULL
- `idx_conversations_type` (conversation_type, created_at DESC)
- `idx_conversations_last_activity` (last_message_at DESC NULLS LAST) WHERE is_archived = FALSE

**Trigger:** `trg_update_conversation_timestamp` -> `communication.update_conversation_timestamp()` (auto-update updated_at)

**RLS Policies (4):**
- `conversations_select_participant` SELECT: active participants only
- `conversations_insert_own` INSERT: created_by must match current user
- `conversations_update_admin` UPDATE: owner or admin role
- `conversations_delete_owner` DELETE: creator only

**Entity:** `apps/backend/src/modules/communication/entities/conversation.entity.ts` -> class `Conversation`

---

### communication.conversation_participants [DDL-ACCURATE]

**Descripcion:** Participants in conversations for group chat support. Tracks membership, roles, notification preferences, and read status per user per conversation.

| Columna | Tipo | Nullable | Default | Descripcion |
|---------|------|----------|---------|-------------|
| id | UUID | NOT NULL | gen_random_uuid() | Primary key |
| conversation_id | UUID | NOT NULL | - | FK -> communication.conversations (ON DELETE CASCADE) |
| user_id | UUID | NOT NULL | - | FK -> auth_management.profiles (ON DELETE CASCADE) |
| role | VARCHAR(20) | NOT NULL | 'member' | owner (creator), admin (can manage), member (standard) |
| joined_at | TIMESTAMPTZ | NOT NULL | CURRENT_TIMESTAMP | Fecha de ingreso |
| left_at | TIMESTAMPTZ | NULL | - | Fecha de salida (soft remove) |
| is_active | BOOLEAN | NOT NULL | TRUE | Participante activo |
| is_muted | BOOLEAN | NOT NULL | FALSE | Conversacion silenciada (sin notificaciones) |
| muted_until | TIMESTAMPTZ | NULL | - | Silenciado hasta esta fecha |
| last_read_at | TIMESTAMPTZ | NULL | - | Ultima lectura del participante |
| last_read_message_id | UUID | NULL | - | ID del ultimo mensaje leido |
| unread_count | INTEGER | NOT NULL | 0 | Mensajes no leidos para este participante |
| nickname | VARCHAR(100) | NULL | - | Nombre personalizado en esta conversacion |
| show_notifications | BOOLEAN | NOT NULL | TRUE | Mostrar notificaciones para esta conversacion |
| pin_order | INTEGER | NULL | - | Orden de fijado (NULL = no fijado, menor = mayor prioridad) |
| created_at | TIMESTAMPTZ | NOT NULL | NOW() | Fecha de creacion |
| updated_at | TIMESTAMPTZ | NOT NULL | NOW() | Ultima modificacion (auto-update via trigger) |

**Constraints:**
- `conversation_participants_role_valid` CHECK: role IN ('owner','admin','member')
- `conversation_participants_unique` UNIQUE: (conversation_id, user_id)

**Indexes (6):**
- `idx_conv_participants_conversation_id` (conversation_id) WHERE is_active = TRUE
- `idx_conv_participants_user_id` (user_id, is_active)
- `idx_conv_participants_active` (conversation_id, is_active) WHERE is_active = TRUE
- `idx_conv_participants_unread` (user_id) WHERE is_active = TRUE AND unread_count > 0 AND is_muted = FALSE
- `idx_conv_participants_pinned` (user_id, pin_order) WHERE pin_order IS NOT NULL AND is_active = TRUE
- `idx_conv_participants_user_inbox` (user_id, is_active, is_muted, unread_count)

**Trigger:** `trg_update_conv_participant_timestamp` -> `communication.update_conv_participant_timestamp()` (auto-update updated_at)

**Functions (8):** Via `functions/04-conversation-functions.sql`
- `communication.get_conversation_participants(p_conversation_id)` - All participants with profile info
- `communication.get_user_conversations(p_user_id, p_include_archived)` - User's conversations with unread counts
- `communication.add_conversation_participant(p_conversation_id, p_user_id, p_role, p_added_by)` - Add or reactivate participant
- `communication.remove_conversation_participant(p_conversation_id, p_user_id)` - Soft-remove (is_active = FALSE)
- `communication.mark_conversation_as_read(p_conversation_id, p_user_id, p_last_message_id)` - Reset unread count
- `communication.increment_unread_for_conversation(p_conversation_id, p_sender_id, p_message_preview)` - Increment unread for all except sender
- `communication.get_total_unread_conversations(p_user_id)` - Total unread across all conversations
- `communication.create_conversation(p_title, p_conversation_type, p_created_by, p_participant_ids, p_classroom_id)` - Create with initial participants

**RLS Policies (4):**
- `conv_participants_select_member` SELECT: participants in same conversation
- `conv_participants_update_own` UPDATE: own record only (mute, read status)
- `conv_participants_insert_admin` INSERT: owner/admin or self-join
- `conv_participants_delete_admin` DELETE: self-leave or owner/admin removing

**Entity:** `apps/backend/src/modules/communication/entities/conversation-participant.entity.ts` -> class `ConversationParticipant`

---

## DDL Artifacts Summary

| Tipo | Cantidad | Path |
|------|----------|------|
| Tables | 4 | `tables/01-messages.sql`, `tables/02-message_participants.sql`, `tables/03-conversation_participants.sql` |
| Functions | 4 files | `functions/01-trigger-functions.sql`, `02-message-functions.sql`, `03-message-participant-functions.sql`, `04-conversation-functions.sql` |
| Views | 1 | `views/01-recent_classroom_messages.sql` |
| Triggers | 1 file | `triggers/01-triggers.sql` |
| RLS Policies | 1 file | `rls-policies/01-messages-policies.sql` |

> **Nota:** Las tablas `conversations` y `conversation_participants` se definen juntas en `tables/03-conversation_participants.sql`. Funciones y triggers tambien se definen inline en los archivos de tabla, ademas de los archivos dedicados en `functions/` y `triggers/`.

---

## Estado de Entities Backend

| Tabla DDL | Entity Backend | Ubicacion | Estado |
|-----------|---------------|-----------|--------|
| messages | `Message` | `apps/backend/src/modules/teacher/entities/message.entity.ts` | Completa (31 columnas mapeadas) |
| message_participants | `MessageParticipant` | `apps/backend/src/modules/teacher/entities/message.entity.ts` | Completa (7 columnas mapeadas) |
| conversations | `Conversation` | `apps/backend/src/modules/communication/entities/conversation.entity.ts` | Completa (17 columnas mapeadas) |
| conversation_participants | `ConversationParticipant` | `apps/backend/src/modules/communication/entities/conversation-participant.entity.ts` | Completa (17 columnas mapeadas) |

**Constantes:** Definidas en `DB_TABLES.COMMUNICATION` (messages, message_participants, conversations, conversation_participants)

> **Nota de organizacion:** Las entities `Message` y `MessageParticipant` residen en el modulo `teacher/` (no en `communication/`) ya que el sistema de mensajeria se implemento como parte del modulo teacher. Las entities `Conversation` y `ConversationParticipant` residen en `communication/`.

---

*GAMILIT - Schema Reference: communication v2.0.0*
*4 tablas | 13+ functions | 1 view | 17 RLS policies | DDL-ACCURATE*
