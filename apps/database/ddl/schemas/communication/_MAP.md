# _MAP: communication/

**Ultima actualizacion:** 2026-01-14
**Estado:** Produccion
**Tipo:** Integration/Messaging
**Objetos activos:** 17

---

## Proposito

Sistema de comunicacion y mensajeria para interaccion profesor-estudiante.
Soporta mensajes directos, anuncios de aula, chat grupal y feedback privado.

**Audiencia:** Backend Developers, Frontend Developers

---

## RESUMEN

| Elemento | Cantidad |
|----------|----------|
| Tablas | 1 |
| Funciones | 3 |
| Triggers | 1 |
| Views | 1 |
| Indexes | 11 |

---

## TABLAS

| Tabla | Archivo | Descripcion |
|-------|---------|-------------|
| `messages` | `tables/01-messages.sql` | Mensajes y chat para comunicacion profesor-estudiante |

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

---

## FUNCIONES

| Funcion | Archivo | Proposito |
|---------|---------|-----------|
| `update_messages_timestamp()` | `tables/01-messages.sql` | Trigger function para updated_at |
| `get_unread_count(user_id, classroom_id)` | `tables/01-messages.sql` | Obtiene conteo de mensajes no leidos |
| `mark_conversation_read(user_id, thread_id)` | `tables/01-messages.sql` | Marca conversacion como leida |

### Uso de Funciones

```sql
-- Obtener mensajes no leidos de un usuario
SELECT communication.get_unread_count('user-uuid');

-- Obtener mensajes no leidos en un aula especifica
SELECT communication.get_unread_count('user-uuid', 'classroom-uuid');

-- Marcar conversacion como leida
SELECT communication.mark_conversation_read('user-uuid', 'thread-uuid');
```

---

## TRIGGERS

| Trigger | Tabla | Funcion | Evento |
|---------|-------|---------|--------|
| `trigger_update_messages_timestamp` | messages | update_messages_timestamp() | BEFORE UPDATE |

---

## VIEWS

| View | Archivo | Proposito |
|------|---------|-----------|
| `recent_classroom_messages` | `tables/01-messages.sql` | Mensajes recientes de aula para widget de chat |

---

## INDEXES

| Index | Tabla | Columnas | Tipo |
|-------|-------|----------|------|
| idx_messages_sender | messages | sender_id, created_at | Partial |
| idx_messages_recipient | messages | recipient_id, created_at | Partial |
| idx_messages_classroom | messages | classroom_id, created_at | Partial |
| idx_messages_unread | messages | recipient_id, created_at | Partial (unread) |
| idx_messages_thread | messages | thread_id, created_at | Partial |
| idx_messages_parent | messages | parent_message_id, created_at | Partial |
| idx_messages_flagged | messages | flagged_at | Partial (flagged) |
| idx_messages_requiring_response | messages | recipient_id, response_deadline | Partial |
| idx_messages_classroom_type | messages | classroom_id, message_type, created_at | Partial |
| idx_messages_attachments | messages | attachments | GIN |
| idx_messages_metadata | messages | metadata | GIN |

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

---

*Generado: 2025-12-26 | Correccion D-003*
