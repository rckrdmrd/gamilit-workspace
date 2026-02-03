# Análisis de Implementación: Seeds Communication

**Tarea:** TASK-P2-SEEDS-COMMUNICATION-2026-01-27
**Fecha:** 2026-01-27
**Estado:** COMPLETADO
**Gap:** SEED-P2-002

---

## Resumen Ejecutivo

Se implementaron seeds para el schema `communication` que maneja el sistema de mensajería entre usuarios (maestros, estudiantes, padres). El sistema usa dos tablas: `messages` y `message_participants`.

**Hallazgo importante:** El schema NO usa tabla `conversations` como se pensaba inicialmente. El modelo es `messages` + `message_participants`.

**Resultado:** Seeds creados para dev y verificados en prod (ya existían).

---

## 1. Contexto del Problema

### 1.1 Gap Identificado

Durante el análisis de coherencia BD (TASK-BD-ANALYSIS-2026-01-27), se identificó que el schema `communication` tenía seeds incompletos o inexistentes.

### 1.2 Estructura del Schema

```
communication/
├── messages              -- Mensajes enviados
└── message_participants  -- Participantes de cada mensaje
```

**Nota:** NO existe tabla `conversations`. Los threads se manejan via `thread_id` en `messages`.

### 1.3 Tabla messages

```sql
CREATE TABLE communication.messages (
    id uuid PRIMARY KEY,
    sender_id uuid NOT NULL REFERENCES auth_management.profiles(id),
    recipient_id uuid REFERENCES auth_management.profiles(id),
    classroom_id uuid REFERENCES social_features.classrooms(id),
    thread_id uuid REFERENCES communication.messages(id),
    parent_message_id uuid REFERENCES communication.messages(id),
    subject varchar(255),
    content text NOT NULL,
    message_type varchar(50) NOT NULL DEFAULT 'direct',
    attachments jsonb DEFAULT '[]',
    is_read boolean DEFAULT false,
    read_at timestamptz,
    is_deleted boolean DEFAULT false,
    priority varchar(20) DEFAULT 'normal',
    is_pinned boolean DEFAULT false,
    reactions jsonb DEFAULT '{}',
    moderation_status varchar(50) DEFAULT 'approved',
    created_at timestamptz,
    updated_at timestamptz
);
```

### 1.4 Tipos de Mensaje

| Tipo | Descripción |
|------|-------------|
| `direct` | Mensaje 1-a-1 |
| `classroom_announcement` | Anuncio a toda el aula |
| `classroom_chat` | Chat grupal del aula |
| `private_feedback` | Feedback privado sobre ejercicio |
| `assignment_comment` | Comentario en tarea |
| `system` | Mensaje del sistema |

---

## 2. Análisis de Requisitos

### 2.1 Datos de Prueba Necesarios

Para dev:
- Mensajes directos entre usuarios
- Anuncios de classroom
- Mensajes con diferentes estados (leído, no leído, eliminado)
- Threads de conversación
- Mensajes con attachments y reactions

### 2.2 Dependencias

- `auth_management.profiles` - FK sender_id, recipient_id
- `social_features.classrooms` - FK classroom_id
- Seeds de usuarios y classrooms deben existir primero

---

## 3. Implementación

### 3.1 Seed Dev - messages

**Archivo:** `apps/database/seeds/dev/communication/01-messages.sql`

Datos insertados:
- 10+ mensajes de prueba
- Tipos variados (direct, announcement, chat)
- Estados mixtos (read, unread, deleted)
- Algunos con attachments

### 3.2 Seed Dev - message_participants

**Archivo:** `apps/database/seeds/dev/communication/02-message_participants.sql`

Datos insertados:
- Participantes para cada mensaje
- Roles de participante (sender, recipient, cc)

### 3.3 Seed Prod

**Estado:** Ya existían seeds mínimos en prod
- Solo mensajes de sistema/bienvenida
- No se modificaron

### 3.4 Orden de Ejecución

1. Profiles (usuarios)
2. Classrooms
3. **Messages** (este seed)
4. **Message_participants** (este seed)

---

## 4. Hallazgos Técnicos

### 4.1 Modelo de Datos

El sistema de comunicación NO usa un modelo tradicional de `conversations`:

```
MODELO ACTUAL (correcto):
messages (con thread_id para agrupar)
    └── message_participants (quién participa)

MODELO ESPERADO (incorrecto):
conversations
    └── messages
        └── participants
```

### 4.2 Threading

Los threads se implementan con:
- `thread_id` - Apunta al primer mensaje del thread
- `parent_message_id` - Para respuestas directas (tree structure)

### 4.3 Tipos de Destino

Un mensaje puede tener:
- `recipient_id` - Destinatario específico (direct)
- `classroom_id` - Todo el aula (broadcast)
- Ambos deben tener al menos uno (constraint)

---

## 5. Validación

### 5.1 Criterios de Aceptación

| Criterio | Estado |
|----------|--------|
| Seed dev ejecuta sin errores | ✅ |
| Respeta FK a profiles | ✅ |
| Respeta FK a classrooms | ✅ |
| Datos representativos para testing | ✅ |
| Threads correctamente vinculados | ✅ |
| message_participants sincronizado | ✅ |

### 5.2 Queries de Verificación

```sql
-- Contar mensajes por tipo
SELECT message_type, COUNT(*)
FROM communication.messages
GROUP BY message_type;

-- Verificar participantes
SELECT m.id, COUNT(mp.id) as participants
FROM communication.messages m
LEFT JOIN communication.message_participants mp ON m.id = mp.message_id
GROUP BY m.id;

-- Verificar threads
SELECT thread_id, COUNT(*) as messages_in_thread
FROM communication.messages
WHERE thread_id IS NOT NULL
GROUP BY thread_id;
```

---

## 6. Impacto

### 6.1 Beneficios

- Sistema de mensajería testeable
- Chat de classroom funcional en dev
- Datos para probar notificaciones

### 6.2 Corrección de Entendimiento

- Actualizado METADATA.yml para reflejar modelo correcto
- Documentado que NO existe tabla conversations

---

## 7. Conclusión

Los seeds de communication fueron implementados exitosamente, cerrando el gap SEED-P2-002. Se documentó el modelo correcto del sistema de mensajería (messages + message_participants, sin conversations).

---

*Análisis realizado: 2026-01-27*
*Sistema: SIMCO v4.0.0*
