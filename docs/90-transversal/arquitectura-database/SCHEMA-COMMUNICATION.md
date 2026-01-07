# SCHEMA COMMUNICATION

**Proyecto:** GAMILIT - Plataforma Educativa Gamificada
**Schema:** communication
**Version:** 1.0
**Fecha:** 2025-12-23
**Prioridad:** P1 (Critico para comunicacion)

---

## RESUMEN

| Metrica | Valor |
|---------|-------|
| **Tablas** | 1 |
| **Vistas** | 1 |
| **Funciones** | 2 |
| **Triggers** | 1 |
| **Indices** | 11 |
| **Politicas RLS** | 6 |

---

## PROPOSITO

Sistema completo de mensajeria y comunicacion entre docentes y estudiantes:
- Mensajeria directa (1-a-1)
- Anuncios en aulas (docente a todos)
- Chat grupal en aulas
- Feedback privado en asignaciones
- Comentarios en ejercicios
- Reacciones y adjuntos
- Moderacion y soft-delete

---

## 1. TABLA: messages

**Proposito:** Almacena todos los mensajes, anuncios y comunicaciones

### Columnas Principales

| Columna | Tipo | Descripcion |
|---------|------|-------------|
| id | UUID | PK (auto-generada) |
| sender_id | UUID | FK a profiles - Remitente |
| recipient_id | UUID | FK a profiles - Destinatario (opcional) |
| classroom_id | UUID | FK a classrooms - Aula (opcional) |
| thread_id | UUID | FK self - Para conversaciones enhebradas |
| parent_message_id | UUID | FK self - Para replies anidadas |
| subject | VARCHAR(255) | Asunto (mensajes directos) |
| content | TEXT | Contenido del mensaje (requerido) |
| message_type | VARCHAR(50) | Tipo de mensaje |
| attachments | JSONB | Array de adjuntos |
| is_read | BOOLEAN | Si ha sido leido |
| read_at | TIMESTAMPTZ | Cuando fue leido |
| is_deleted | BOOLEAN | Soft-delete flag |
| priority | VARCHAR(20) | low, normal, high, urgent |
| is_pinned | BOOLEAN | Si esta fijado |
| reactions | JSONB | Reacciones emoji |
| is_flagged | BOOLEAN | Si fue reportado |
| moderation_status | VARCHAR(50) | Estado de moderacion |
| metadata | JSONB | Contexto adicional |

### Tipos de Mensaje (message_type)

| Tipo | Descripcion |
|------|-------------|
| direct | Mensaje privado 1-a-1 |
| classroom_announcement | Anuncio del docente al aula |
| classroom_chat | Chat grupal del aula |
| private_feedback | Feedback privado en tarea |
| assignment_comment | Comentario en asignacion |
| system | Mensaje del sistema |

### Formato de Attachments (JSONB)
```json
[
  {
    "type": "file|image|video",
    "url": "https://...",
    "name": "documento.pdf",
    "size": 1024
  }
]
```

### Formato de Reactions (JSONB)
```json
{
  "thumbs_up": ["uuid-1", "uuid-2"],
  "heart": ["uuid-3"],
  "star": ["uuid-4", "uuid-5"]
}
```

---

## 2. INDICES

| Indice | Columnas | Proposito |
|--------|----------|-----------|
| idx_messages_sender | sender_id, created_at DESC | Mensajes enviados |
| idx_messages_recipient | recipient_id, created_at DESC | Bandeja de entrada |
| idx_messages_classroom | classroom_id, created_at DESC | Mensajes de aula |
| idx_messages_unread | recipient_id, created_at DESC | No leidos |
| idx_messages_thread | thread_id, created_at ASC | Conversaciones |
| idx_messages_parent | parent_message_id, created_at ASC | Replies |
| idx_messages_flagged | flagged_at DESC | Moderacion |
| idx_messages_requiring_response | recipient_id, response_deadline | Con deadline |
| idx_messages_classroom_type | classroom_id, message_type, created_at DESC | Filtrado |
| idx_messages_attachments | attachments (GIN) | Busqueda JSON |
| idx_messages_metadata | metadata (GIN) | Busqueda JSON |

---

## 3. TRIGGER

### trigger_update_messages_timestamp

**Evento:** BEFORE UPDATE
**Funcion:** communication.update_messages_timestamp()

**Comportamiento:**
- Actualiza `updated_at` en cada modificacion
- Auto-calcula `edited_at` cuando cambia contenido
- Incrementa `edit_count` con cada edicion
- Auto-calcula `read_at` cuando `is_read = TRUE`
- Auto-calcula `deleted_at` cuando `is_deleted = TRUE`
- Auto-calcula `flagged_at` cuando `is_flagged = TRUE`

---

## 4. FUNCIONES

### get_unread_count()

```sql
FUNCTION get_unread_count(
    p_user_id UUID,
    p_classroom_id UUID DEFAULT NULL
) RETURNS INTEGER
```

**Proposito:** Obtener contador de mensajes no leidos

**Ejemplo:**
```sql
SELECT communication.get_unread_count('user-uuid', 'classroom-uuid');
```

---

### mark_conversation_read()

```sql
FUNCTION mark_conversation_read(
    p_user_id UUID,
    p_thread_id UUID
) RETURNS INTEGER
```

**Proposito:** Marcar todos los mensajes de un hilo como leidos

**Ejemplo:**
```sql
SELECT communication.mark_conversation_read('user-uuid', 'thread-uuid');
```

---

## 5. VISTA: recent_classroom_messages

**Proposito:** Mensajes recientes de aula con info del remitente (widget de chat)

| Columna | Descripcion |
|---------|-------------|
| id | UUID del mensaje |
| classroom_id | UUID del aula |
| sender_id | UUID del remitente |
| sender_name | Nombre del remitente |
| sender_avatar | URL del avatar |
| content | Contenido |
| message_type | Tipo |
| attachments | Adjuntos |
| reactions | Reacciones |
| is_pinned | Si esta fijado |
| created_at | Fecha creacion |
| reply_count | Cantidad de replies |

**Filtros:**
- Solo mensajes de aula
- Excluye eliminados
- Solo mensajes de nivel superior

**Ordenamiento:**
1. Fijados primero
2. Por fecha descendente

---

## 6. POLITICAS RLS (Row Level Security)

### SELECT Policies

| Politica | Descripcion | Condicion |
|----------|-------------|-----------|
| messages_select_own | Ver propios mensajes | sender_id OR recipient_id = current_user |
| messages_select_classroom | Ver mensajes de aula | Es miembro del aula |
| messages_select_admin | Admins ven todo | role IN (super_admin, admin_teacher) |

### INSERT Policy

| Politica | Descripcion | Condicion |
|----------|-------------|-----------|
| messages_insert_own | Solo enviar como uno mismo | sender_id = current_user |

### UPDATE Policy

| Politica | Descripcion | Condicion |
|----------|-------------|-----------|
| messages_update_own | Solo editar propios | sender_id = current_user |

### DELETE Policy

| Politica | Descripcion | Condicion |
|----------|-------------|-----------|
| messages_delete_own | Solo eliminar propios | sender_id = current_user |

---

## 7. CASOS DE USO

1. **Mensajeria Directa:** Docente-Estudiante 1-a-1
2. **Anuncios de Aula:** Docente comunica a todos
3. **Chat Grupal:** Conversacion en aula
4. **Feedback de Asignaciones:** Comentarios privados en tareas
5. **Comentarios de Ejercicios:** Feedback especifico
6. **Conversaciones Enhebradas:** Replies y sub-threads
7. **Reacciones Emoji:** Engagement con emojis
8. **Adjuntos:** Archivos, imagenes, videos
9. **Moderacion:** Reporte y bloqueo
10. **Notificaciones:** Tracking de no leidos

---

## 8. RELACIONES

```
communication.messages
    └──> auth_management.profiles (sender_id) N:1
    └──> auth_management.profiles (recipient_id) N:1
    └──> social_features.classrooms (classroom_id) N:1
    └──> communication.messages (thread_id) N:1 (self)
    └──> communication.messages (parent_message_id) N:1 (self)
```

---

## 9. PERMISOS

```sql
GRANT USAGE ON SCHEMA communication TO gamilit_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON communication.messages TO gamilit_user;
GRANT SELECT ON communication.recent_classroom_messages TO gamilit_user;
GRANT EXECUTE ON FUNCTION communication.get_unread_count TO gamilit_user;
GRANT EXECUTE ON FUNCTION communication.mark_conversation_read TO gamilit_user;
```

---

## 10. INFORMACION TECNICA

| Atributo | Valor |
|----------|-------|
| Creado | 2025-11-19 |
| User Stories | US-PM-005, US-AE-006 |
| RLS | Habilitado y forzado |
| Soft-Delete | Implementado |
| Audit Trail | Completo |

---

**Generado por:** Requirements-Analyst
**Fecha:** 2025-12-23
**Version:** 1.0
