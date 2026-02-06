# _MAP: communication/

**Ultima actualizacion:** 2026-02-03
**Estado:** Produccion
**Tipo:** Integration/Messaging
**Objetos activos:** 47

---

## Proposito

Sistema de comunicacion y mensajeria para interaccion profesor-estudiante.
Soporta mensajes directos, anuncios de aula, chat grupal, conversaciones grupales y feedback privado.

**Audiencia:** Backend Developers, Frontend Developers

---

## RESUMEN

| Elemento | Cantidad |
|----------|----------|
| Tablas | 4 |
| Funciones | 14 |
| Triggers | 4 |
| Views | 1 |
| Indexes | 27 |

---

## TABLAS

| Tabla | Archivo | Descripcion |
|-------|---------|-------------|
| `messages` | `tables/01-messages.sql` | Mensajes y chat para comunicacion profesor-estudiante |
| `message_participants` | `tables/02-message_participants.sql` | Participantes de mensajes para tracking individual |
| `conversations` | `tables/03-conversation_participants.sql` | Contenedor de conversaciones (directas, grupales, aula) |
| `conversation_participants` | `tables/03-conversation_participants.sql` | Participantes de conversaciones para soporte de chat grupal |

### messages
Tabla principal del sistema de mensajeria.

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | UUID | PK |
| sender_id | UUID | FK → auth_management.profiles |
| recipient_id | UUID | FK → auth_management.profiles |
| classroom_id | UUID | FK → social_features.classrooms |
| thread_id | UUID | Self-reference para conversaciones |
| parent_message_id | UUID | Self-reference para respuestas |
| subject | VARCHAR(255) | Asunto del mensaje |
| content | TEXT | Contenido del mensaje |
| message_type | VARCHAR(50) | Tipo: direct, classroom_announcement, etc. |
| attachments | JSONB | Archivos adjuntos |
| is_read | BOOLEAN | Estado de lectura |
| reactions | JSONB | Reacciones emoji |
| moderation_status | VARCHAR(50) | Estado de moderacion |
| created_at | TIMESTAMPTZ | Fecha de creacion |
| updated_at | TIMESTAMPTZ | Fecha de actualizacion |

### conversations (NUEVO - GAP-SOC-003)
Contenedor de conversaciones para soporte de chat grupal.

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | UUID | PK |
| title | VARCHAR(255) | Titulo de la conversacion |
| description | TEXT | Descripcion |
| conversation_type | VARCHAR(30) | Tipo: direct, group, classroom |
| classroom_id | UUID | FK → social_features.classrooms |
| is_archived | BOOLEAN | Estado archivado |
| last_message_at | TIMESTAMPTZ | Ultima actividad |
| message_count | INTEGER | Total mensajes (denormalized) |
| created_by | UUID | FK → auth_management.profiles |
| created_at | TIMESTAMPTZ | Fecha de creacion |
| updated_at | TIMESTAMPTZ | Fecha de actualizacion |

### conversation_participants (NUEVO - GAP-SOC-003)
Participantes en conversaciones para chat grupal.

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | UUID | PK |
| conversation_id | UUID | FK → communication.conversations |
| user_id | UUID | FK → auth_management.profiles |
| role | VARCHAR(20) | Rol: owner, admin, member |
| joined_at | TIMESTAMPTZ | Fecha de union |
| left_at | TIMESTAMPTZ | Fecha de salida |
| is_active | BOOLEAN | Estado activo |
| is_muted | BOOLEAN | Notificaciones silenciadas |
| muted_until | TIMESTAMPTZ | Silenciar hasta |
| last_read_at | TIMESTAMPTZ | Ultimo mensaje leido |
| unread_count | INTEGER | Mensajes no leidos |
| nickname | VARCHAR(100) | Nombre personalizado |
| pin_order | INTEGER | Orden de fijado |
| created_at | TIMESTAMPTZ | Fecha de creacion |
| updated_at | TIMESTAMPTZ | Fecha de actualizacion |

---

## FUNCIONES

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `update_message_tracking_fields()` | `tables/01-messages.sql` | Trigger function especializada (ver nota) |
| `get_unread_count(user_id, classroom_id)` | `tables/01-messages.sql` | Obtiene conteo de mensajes no leidos |
| `mark_conversation_read(user_id, thread_id)` | `tables/01-messages.sql` | Marca conversacion como leida |
| `update_message_participant_read()` | `tables/02-message_participants.sql` | Trigger para read_at en participantes |
| `get_user_unread_count(user_id)` | `tables/02-message_participants.sql` | Conteo no leidos via participantes |
| `mark_message_read_for_user(message_id, user_id)` | `tables/02-message_participants.sql` | Marca mensaje leido para usuario |
| `update_conversation_timestamp()` | `tables/03-conversation_participants.sql` | Trigger para updated_at en conversations |
| `update_conv_participant_timestamp()` | `tables/03-conversation_participants.sql` | Trigger para updated_at en conversation_participants |
| `get_conversation_participants(conv_id)` | `tables/03-conversation_participants.sql` | Obtiene participantes de una conversacion |
| `get_user_conversations(user_id)` | `tables/03-conversation_participants.sql` | Obtiene conversaciones de un usuario |
| `add_conversation_participant(conv_id, user_id, role)` | `tables/03-conversation_participants.sql` | Agrega participante a conversacion |
| `remove_conversation_participant(conv_id, user_id)` | `tables/03-conversation_participants.sql` | Remueve participante (soft) |
| `mark_conversation_as_read(conv_id, user_id)` | `tables/03-conversation_participants.sql` | Marca conversacion leida para usuario |
| `increment_unread_for_conversation(conv_id, sender_id)` | `tables/03-conversation_participants.sql` | Incrementa no leidos cuando llega mensaje |
| `get_total_unread_conversations(user_id)` | `tables/03-conversation_participants.sql` | Total no leidos en todas las conversaciones |
| `create_conversation(title, type, creator, participants)` | `tables/03-conversation_participants.sql` | Crea conversacion con participantes iniciales |

### Nota: update_message_tracking_fields()

Esta funcion **NO es un duplicado** de `gamilit.update_updated_at_column()`.
Es una funcion ESPECIALIZADA que maneja logica unica de la tabla messages:

1. Actualiza `updated_at` (similar a gamilit version)
2. Trackea ediciones de contenido (`edited_at`, `edit_count`)
3. Auto-setea `read_at` cuando `is_read` cambia a TRUE
4. Auto-setea `deleted_at` cuando `is_deleted` cambia a TRUE
5. Auto-setea `flagged_at` cuando `is_flagged` cambia a TRUE

**Ref:** Analisis OVR-006 - CONSERVADA por funcionalidad unica.
**Renombrada:** 2026-02-03 (antes: `update_messages_timestamp`)

### Uso de Funciones

```sql
-- Obtener mensajes no leidos de un usuario
SELECT communication.get_unread_count('user-uuid');

-- Obtener mensajes no leidos en un aula especifica
SELECT communication.get_unread_count('user-uuid', 'classroom-uuid');

-- Marcar conversacion como leida
SELECT communication.mark_conversation_read('user-uuid', 'thread-uuid');

-- Obtener no leidos via tabla participantes
SELECT communication.get_user_unread_count('user-uuid');

-- Marcar mensaje leido para un usuario especifico
SELECT communication.mark_message_read_for_user('message-uuid', 'user-uuid');
```

---

## TRIGGERS

| Trigger | Tabla | Funcion | Evento |
|---------|-------|---------|--------|
| `trg_update_message_tracking_fields` | messages | update_message_tracking_fields() | BEFORE UPDATE |
| `trigger_update_message_participant_read` | message_participants | update_message_participant_read() | BEFORE UPDATE |
| `trg_update_conversation_timestamp` | conversations | update_conversation_timestamp() | BEFORE UPDATE |
| `trg_update_conv_participant_timestamp` | conversation_participants | update_conv_participant_timestamp() | BEFORE UPDATE |

---

## VIEWS

| View | Archivo | Proposito |
|------|---------|-----------|
| `recent_classroom_messages` | `tables/01-messages.sql` | Mensajes recientes de aula para widget de chat |

---

## INDEXES

### messages
| Index | Columnas | Tipo |
|-------|----------|------|
| idx_messages_sender | sender_id, created_at | Partial |
| idx_messages_recipient | recipient_id, created_at | Partial |
| idx_messages_classroom | classroom_id, created_at | Partial |
| idx_messages_unread | recipient_id, created_at | Partial (unread) |
| idx_messages_thread | thread_id, created_at | Partial |
| idx_messages_parent | parent_message_id, created_at | Partial |
| idx_messages_flagged | flagged_at | Partial (flagged) |
| idx_messages_requiring_response | recipient_id, response_deadline | Partial |
| idx_messages_classroom_type | classroom_id, message_type, created_at | Partial |
| idx_messages_attachments | attachments | GIN |
| idx_messages_metadata | metadata | GIN |

### message_participants
| Index | Columnas | Tipo |
|-------|----------|------|
| idx_message_participants_message_id | message_id | B-tree |
| idx_message_participants_user_id | user_id | B-tree |
| idx_message_participants_unread | user_id, message_id | Partial (unread) |
| idx_message_participants_role | user_id, role | B-tree |
| idx_message_participants_user_read | user_id, is_read, created_at | B-tree |

### conversations (NUEVO)
| Index | Columnas | Tipo |
|-------|----------|------|
| idx_conversations_created_by | created_by, created_at | B-tree |
| idx_conversations_classroom | classroom_id | Partial |
| idx_conversations_type | conversation_type, created_at | B-tree |
| idx_conversations_last_activity | last_message_at | Partial (non-archived) |

### conversation_participants (NUEVO)
| Index | Columnas | Tipo |
|-------|----------|------|
| idx_conv_participants_conversation_id | conversation_id | Partial (active) |
| idx_conv_participants_user_id | user_id, is_active | B-tree |
| idx_conv_participants_active | conversation_id, is_active | Partial (active) |
| idx_conv_participants_unread | user_id | Partial (active + unread + not muted) |
| idx_conv_participants_pinned | user_id, pin_order | Partial (pinned + active) |
| idx_conv_participants_user_inbox | user_id, is_active, is_muted, unread_count | B-tree |

---

## RELACIONES

```
communication.messages
├── sender_id → auth_management.profiles(id)
├── recipient_id → auth_management.profiles(id)
├── classroom_id → social_features.classrooms(id)
├── thread_id → communication.messages(id) [self-reference]
├── parent_message_id → communication.messages(id) [self-reference]
├── deleted_by → auth_management.profiles(id)
└── flagged_by → auth_management.profiles(id)

communication.message_participants
├── message_id → communication.messages(id)
└── user_id → auth_management.profiles(id)

communication.conversations
├── classroom_id → social_features.classrooms(id)
└── created_by → auth_management.profiles(id)

communication.conversation_participants
├── conversation_id → communication.conversations(id)
└── user_id → auth_management.profiles(id)
```

---

## RLS POLICIES

Ver carpeta `rls-policies/` para politicas de seguridad a nivel de fila.

---

## TIPOS DE MENSAJE

| Tipo | Descripcion |
|------|-------------|
| `direct` | Mensaje directo 1-a-1 |
| `classroom_announcement` | Anuncio del profesor a toda el aula |
| `classroom_chat` | Chat grupal del aula |
| `private_feedback` | Retroalimentacion privada de ejercicio |
| `assignment_comment` | Comentario en asignacion |
| `system` | Mensaje del sistema |

---

## NOTAS

- Schema implementado para US-PM-005 (Teacher Communication)
- Schema implementado para US-AE-006 (Communication Management)
- Soporta conversaciones en hilos (threaded)
- Soporta respuestas anidadas
- Incluye sistema de moderacion
- Incluye sistema de reacciones emoji
- **GAP-SOC-003**: Soporte de conversaciones grupales (2026-02-03)

---

*Generado: 2025-12-26 | Correccion D-003*
*Actualizado: 2026-02-03 | OVR-006 - Renombrada funcion especializada*
*Actualizado: 2026-02-03 | GAP-SOC-003 - Agregado soporte para conversaciones grupales*
