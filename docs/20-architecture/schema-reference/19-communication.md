# Schema: communication (4 tablas)

> Parte de [Schema Reference](_INDEX.md) - GAMILIT
> **Schema fisico DDL:** `communication`
> **Tipo:** domain
> **DDL Path:** `apps/database/ddl/schemas/communication/`
> **Constante Backend:** `DB_SCHEMAS.COMMUNICATION`

---

## Descripcion

Sistema de mensajeria interna entre docentes, estudiantes y padres. Soporta mensajes directos, anuncios de aula, conversaciones grupales con hilos y respuestas.

---

## Tablas (4)

### communication.messages
Mensajes del sistema de comunicacion.

| Columna | Tipo | Nullable | Descripcion |
|---------|------|----------|-------------|
| id | UUID | NOT NULL | PK |
| sender_id | UUID | NOT NULL | FK -> auth_management.profiles |
| recipient_id | UUID | NULL | FK -> auth_management.profiles (directo) |
| classroom_id | UUID | NULL | FK -> social_features.classrooms (broadcast) |
| thread_id | UUID | NULL | FK -> messages (self-ref, para hilos) |
| parent_message_id | UUID | NULL | FK -> messages (self-ref, para respuestas) |
| subject | VARCHAR(255) | NULL | Asunto (mensajes directos) |
| content | TEXT | NOT NULL | Contenido del mensaje |
| message_type | VARCHAR(50) | NOT NULL | direct, classroom_announcement, classroom_chat, private_feedback, assignment_comment |
| attachments | JSONB | - | Array de adjuntos |
| is_read | BOOLEAN | - | Estado de lectura |
| priority | VARCHAR(20) | - | low, normal, high, urgent |
| is_pinned | BOOLEAN | - | Mensaje fijado |
| reactions | JSONB | - | Reacciones emoji |
| moderation_status | VARCHAR(50) | - | approved, pending, flagged, removed |

**Funciones inline:** `update_message_tracking_fields()`, `get_unread_count()`, `mark_conversation_read()`
**View inline:** `recent_classroom_messages`
**Constraint:** Debe tener recipient_id OR classroom_id

### communication.message_participants
Tracking de lectura individual por participante de mensaje.

| Columna | Tipo | Nullable | Descripcion |
|---------|------|----------|-------------|
| id | UUID | NOT NULL | PK |
| message_id | UUID | NOT NULL | FK -> messages |
| user_id | UUID | NOT NULL | FK -> auth_management.profiles |
| role | VARCHAR(20) | NOT NULL | sender, recipient, cc |
| is_read | BOOLEAN | - | Lectura individual |
| read_at | TIMESTAMPTZ | NULL | Fecha de lectura |

**Unique:** (message_id, user_id, role)
**Funciones inline:** `update_message_participant_read()`, `get_user_unread_count()`, `mark_message_read_for_user()`
**RLS:** 3 policies (select_own, update_own, insert_system)

### communication.conversations
Contenedor de conversaciones grupales.

| Columna | Tipo | Nullable | Descripcion |
|---------|------|----------|-------------|
| id | UUID | NOT NULL | PK |
| title | VARCHAR(255) | NULL | Titulo (grupos) |
| conversation_type | VARCHAR(30) | NOT NULL | direct, group, classroom |
| classroom_id | UUID | NULL | FK -> social_features.classrooms |
| last_message_at | TIMESTAMPTZ | NULL | Ultima actividad (denormalizado) |
| message_count | INTEGER | - | Total mensajes |
| created_by | UUID | NOT NULL | FK -> auth_management.profiles |

**RLS:** 4 policies (select_participant, insert_own, update_admin, delete_owner)

### communication.conversation_participants
Participantes en conversaciones grupales.

| Columna | Tipo | Nullable | Descripcion |
|---------|------|----------|-------------|
| id | UUID | NOT NULL | PK |
| conversation_id | UUID | NOT NULL | FK -> conversations |
| user_id | UUID | NOT NULL | FK -> auth_management.profiles |
| role | VARCHAR(20) | NOT NULL | owner, admin, member |
| is_active | BOOLEAN | NOT NULL | Participante activo |
| is_muted | BOOLEAN | NOT NULL | Conversacion silenciada |
| unread_count | INTEGER | NOT NULL | Mensajes no leidos |
| last_read_at | TIMESTAMPTZ | NULL | Ultima lectura |

**Unique:** (conversation_id, user_id)
**Funciones:** 8 helper functions (get_conversation_participants, get_user_conversations, add/remove_participant, mark_as_read, increment_unread, get_total_unread, create_conversation)
**RLS:** 4 policies (select_member, update_own, insert_admin, delete_admin)

---

## Estado de Entities Backend

| Tabla DDL | Entity Backend | Estado |
|-----------|---------------|--------|
| messages | Pendiente | Sin entity - R3-07 |
| message_participants | Pendiente | Sin entity - R3-07 |
| conversations | Pendiente | Sin entity - R3-07 |
| conversation_participants | Pendiente | Sin entity - R3-07 |

**Constantes:** Definidas en `DB_TABLES.COMMUNICATION` (messages, message_participants, conversations, conversation_participants)

---

*GAMILIT - Schema Reference: communication*
