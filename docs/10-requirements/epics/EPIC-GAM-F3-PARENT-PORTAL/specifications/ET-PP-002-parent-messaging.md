---
titulo: "ET-PP-002: Parent Messaging"
tipo: especificacion-tecnica
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# ET-PP-002: Parent Messaging

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-PP-002 |
| **Modulo** | Parent Portal |
| **Tipo** | Especificacion Tecnica |
| **Estado** | No Iniciado |
| **Completitud** | 5% |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-27 |
| **Ultima Actualizacion** | 2026-01-27 |
| **Autor** | Architecture Analyst |

---

## Referencias

### Requerimiento Funcional
- RF-PP-004: Parent-Teacher Messaging

### User Stories
- [US-PP-003: Notificaciones](../user-stories/US-PP-003/US-PP-003-notificaciones.md)

---

## Descripcion Funcional

Sistema de mensajeria entre padres y profesores:
- Mensajes directos padre-profesor
- Hilos de conversacion
- Notificaciones de nuevos mensajes
- Archivos adjuntos (futuro)
- Historial de conversaciones

---

## Arquitectura

### Diagrama de Componentes

```
+----------------------------------------------------------+
|                   FRONTEND (React)                        |
|  - MessagesPage                                          |
|  - ConversationList                                      |
|  - MessageThread                                         |
|  - ComposeMessage                                        |
+-----------------------------+----------------------------+
                              | REST API + WebSocket
+-----------------------------v----------------------------+
|                  BACKEND (NestJS)                        |
|  - (FALTANTE) ParentMessagesController                   |
|  - (FALTANTE) ParentMessagesService                      |
|  - WebSocketGateway (EXISTENTE)                          |
+-----------------------------+----------------------------+
                              | TypeORM
+-----------------------------v----------------------------+
|               DATABASE (PostgreSQL)                       |
|  - (FALTANTE) communication.parent_teacher_messages      |
|  - (FALTANTE) communication.message_threads              |
+----------------------------------------------------------+
```

---

## Implementacion Existente

### Database - Communication Schema

**Ubicacion:** `apps/database/ddl/schemas/communication/`

**Estado:** El schema existe, pero no las tablas de mensajeria padre-profesor.

---

## Lo que Falta para Completar (95%)

### 1. Database Schema (20%)

```sql
-- tables/message_threads.sql (NUEVO)
CREATE TABLE communication.message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_account_id UUID NOT NULL REFERENCES auth_management.parent_accounts(id),
  teacher_id UUID NOT NULL REFERENCES auth_management.profiles(id),
  student_id UUID NOT NULL REFERENCES auth_management.profiles(id),
  subject TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'archived', 'closed'
  last_message_at TIMESTAMPTZ,
  parent_last_read_at TIMESTAMPTZ,
  teacher_last_read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_message_threads_parent ON communication.message_threads(parent_account_id);
CREATE INDEX idx_message_threads_teacher ON communication.message_threads(teacher_id);
CREATE INDEX idx_message_threads_student ON communication.message_threads(student_id);

-- tables/parent_teacher_messages.sql (NUEVO)
CREATE TABLE communication.parent_teacher_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES communication.message_threads(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL, -- 'parent', 'teacher'
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pt_messages_thread ON communication.parent_teacher_messages(thread_id);
CREATE INDEX idx_pt_messages_sender ON communication.parent_teacher_messages(sender_id);
```

### 2. ParentMessagesService (25%)

```typescript
// services/parent-messages.service.ts (NUEVO)
@Injectable()
export class ParentMessagesService {
  /**
   * Obtiene conversaciones del padre
   */
  async getConversations(
    parentAccountId: string,
    options?: {
      studentId?: string;
      status?: string;
      limit?: number;
    }
  ): Promise<Conversation[]> {
    const query = this.threadsRepo
      .createQueryBuilder('t')
      .leftJoin('t.teacher', 'teacher')
      .leftJoin('t.student', 'student')
      .select([
        't.id',
        't.subject',
        't.status',
        't.last_message_at',
        't.parent_last_read_at',
        'teacher.display_name',
        'teacher.avatar_url',
        'student.display_name',
      ])
      .where('t.parent_account_id = :parentAccountId', { parentAccountId });

    if (options?.studentId) {
      query.andWhere('t.student_id = :studentId', { studentId: options.studentId });
    }

    if (options?.status) {
      query.andWhere('t.status = :status', { status: options.status });
    }

    const threads = await query
      .orderBy('t.last_message_at', 'DESC')
      .limit(options?.limit || 20)
      .getMany();

    // Agregar unread count y last message preview
    return Promise.all(
      threads.map(async (thread) => ({
        ...thread,
        unreadCount: await this.getUnreadCount(thread.id, 'parent'),
        lastMessage: await this.getLastMessage(thread.id),
      }))
    );
  }

  /**
   * Obtiene mensajes de una conversacion
   */
  async getMessages(
    parentAccountId: string,
    threadId: string,
    options?: { limit?: number; before?: Date }
  ): Promise<Message[]> {
    // Validar acceso
    const thread = await this.validateThreadAccess(parentAccountId, threadId);

    const query = this.messagesRepo
      .createQueryBuilder('m')
      .where('m.thread_id = :threadId', { threadId })
      .orderBy('m.created_at', 'DESC')
      .limit(options?.limit || 50);

    if (options?.before) {
      query.andWhere('m.created_at < :before', { before: options.before });
    }

    const messages = await query.getMany();

    // Marcar como leidos
    await this.markAsRead(threadId, 'parent');

    return messages.reverse();
  }

  /**
   * Envia mensaje
   */
  async sendMessage(
    parentAccountId: string,
    threadId: string,
    content: string
  ): Promise<Message> {
    await this.validateThreadAccess(parentAccountId, threadId);

    const message = this.messagesRepo.create({
      thread_id: threadId,
      sender_type: 'parent',
      sender_id: parentAccountId,
      content,
    });

    await this.messagesRepo.save(message);

    // Actualizar thread
    await this.threadsRepo.update(threadId, {
      last_message_at: new Date(),
    });

    // Notificar al profesor via WebSocket
    const thread = await this.threadsRepo.findOne({ where: { id: threadId } });
    await this.notifyNewMessage(thread.teacher_id, message);

    return message;
  }

  /**
   * Inicia nueva conversacion
   */
  async startConversation(
    parentAccountId: string,
    teacherId: string,
    studentId: string,
    subject: string,
    initialMessage: string
  ): Promise<{ thread: MessageThread; message: Message }> {
    // Validar que el padre tiene link con el estudiante
    await this.validateParentStudentLink(parentAccountId, studentId);

    // Verificar si ya existe conversacion activa
    const existing = await this.threadsRepo.findOne({
      where: {
        parent_account_id: parentAccountId,
        teacher_id: teacherId,
        student_id: studentId,
        status: 'active',
      },
    });

    if (existing) {
      // Agregar mensaje a conversacion existente
      const message = await this.sendMessage(parentAccountId, existing.id, initialMessage);
      return { thread: existing, message };
    }

    // Crear nueva conversacion
    const thread = this.threadsRepo.create({
      parent_account_id: parentAccountId,
      teacher_id: teacherId,
      student_id: studentId,
      subject,
      last_message_at: new Date(),
    });

    await this.threadsRepo.save(thread);

    const message = await this.sendMessage(parentAccountId, thread.id, initialMessage);

    return { thread, message };
  }

  /**
   * Marca mensajes como leidos
   */
  async markAsRead(threadId: string, readerType: 'parent' | 'teacher'): Promise<void> {
    const column = readerType === 'parent' ? 'parent_last_read_at' : 'teacher_last_read_at';
    await this.threadsRepo.update(threadId, { [column]: new Date() });

    await this.messagesRepo.update(
      {
        thread_id: threadId,
        sender_type: readerType === 'parent' ? 'teacher' : 'parent',
        is_read: false,
      },
      { is_read: true, read_at: new Date() }
    );
  }

  /**
   * Notifica nuevo mensaje via WebSocket
   */
  private async notifyNewMessage(recipientId: string, message: Message): Promise<void> {
    await this.webSocketService.emitToUser(recipientId, 'new_message', {
      threadId: message.thread_id,
      messageId: message.id,
      preview: message.content.substring(0, 100),
      senderType: message.sender_type,
    });
  }
}
```

### 3. ParentMessagesController (10%)

```typescript
// controllers/parent-messages.controller.ts (NUEVO)
@Controller('parent-portal/messages')
@UseGuards(ParentAuthGuard)
export class ParentMessagesController {
  @Get('conversations')
  async getConversations(
    @ParentAccount() parent: ParentAccount,
    @Query() query: GetConversationsQueryDto
  ): Promise<Conversation[]>;

  @Get('conversations/:threadId')
  async getConversation(
    @ParentAccount() parent: ParentAccount,
    @Param('threadId') threadId: string
  ): Promise<ConversationWithMessages>;

  @Get('conversations/:threadId/messages')
  async getMessages(
    @ParentAccount() parent: ParentAccount,
    @Param('threadId') threadId: string,
    @Query() query: GetMessagesQueryDto
  ): Promise<Message[]>;

  @Post('conversations/:threadId/messages')
  async sendMessage(
    @ParentAccount() parent: ParentAccount,
    @Param('threadId') threadId: string,
    @Body() body: SendMessageDto
  ): Promise<Message>;

  @Post('conversations')
  async startConversation(
    @ParentAccount() parent: ParentAccount,
    @Body() body: StartConversationDto
  ): Promise<{ thread: MessageThread; message: Message }>;

  @Patch('conversations/:threadId/read')
  async markAsRead(
    @ParentAccount() parent: ParentAccount,
    @Param('threadId') threadId: string
  ): Promise<void>;

  @Get('teachers')
  async getAvailableTeachers(
    @ParentAccount() parent: ParentAccount,
    @Query('studentId') studentId: string
  ): Promise<TeacherInfo[]>;
}
```

### 4. Frontend Messaging UI (30%)

```typescript
// pages/MessagesPage.tsx (NUEVO)
export const MessagesPage: React.FC = () => {
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const { conversations, isLoading } = useConversations();

  return (
    <div className="messages-page">
      <div className="conversations-sidebar">
        <NewMessageButton />
        <ConversationList
          conversations={conversations}
          selectedId={selectedThread}
          onSelect={setSelectedThread}
        />
      </div>

      <div className="message-content">
        {selectedThread ? (
          <MessageThread threadId={selectedThread} />
        ) : (
          <EmptyState message="Selecciona una conversacion" />
        )}
      </div>
    </div>
  );
};

// components/ConversationList.tsx (NUEVO)
interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export const ConversationList: React.FC<ConversationListProps>;

// components/MessageThread.tsx (NUEVO)
interface MessageThreadProps {
  threadId: string;
}

export const MessageThread: React.FC<MessageThreadProps> = ({ threadId }) => {
  const { messages, isLoading, sendMessage, loadMore } = useMessages(threadId);
  const [newMessage, setNewMessage] = useState('');

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    await sendMessage(newMessage);
    setNewMessage('');
  };

  return (
    <div className="message-thread">
      <ThreadHeader threadId={threadId} />

      <div className="messages-container">
        <InfiniteScroll onLoadMore={loadMore}>
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
        </InfiniteScroll>
      </div>

      <div className="compose-area">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe un mensaje..."
        />
        <button onClick={handleSend}>
          <SendIcon />
        </button>
      </div>
    </div>
  );
};

// components/MessageBubble.tsx (NUEVO)
interface MessageBubbleProps {
  message: Message;
  isOwn?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps>;

// components/NewConversationModal.tsx (NUEVO)
interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId?: string;
}

export const NewConversationModal: React.FC<NewConversationModalProps>;
```

### 5. Real-time Updates (10%)

```typescript
// hooks/useMessages.ts (NUEVO)
export function useMessages(threadId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const { socket } = useWebSocket();

  useEffect(() => {
    // Load initial messages
    loadMessages();

    // Subscribe to new messages
    socket?.on('new_message', (data) => {
      if (data.threadId === threadId) {
        setMessages((prev) => [...prev, data.message]);
      }
    });

    return () => {
      socket?.off('new_message');
    };
  }, [threadId, socket]);

  // ... rest of hook
}
```

---

## API REST Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/parent-portal/messages/conversations` | Listar conversaciones |
| POST | `/parent-portal/messages/conversations` | Iniciar conversacion |
| GET | `/parent-portal/messages/conversations/:id` | Detalle conversacion |
| GET | `/parent-portal/messages/conversations/:id/messages` | Mensajes |
| POST | `/parent-portal/messages/conversations/:id/messages` | Enviar mensaje |
| PATCH | `/parent-portal/messages/conversations/:id/read` | Marcar leido |
| GET | `/parent-portal/messages/teachers` | Profesores disponibles |

---

## Criterios de Aceptacion

### Funcionales
- [ ] Padre puede ver conversaciones
- [ ] Padre puede iniciar conversacion con profesor
- [ ] Mensajes en tiempo real
- [ ] Indicador de no leidos
- [ ] Historial persistente

### No Funcionales
- [ ] Mensajes en < 500ms
- [ ] UI responsive
- [ ] Notificaciones push de nuevos mensajes

### Seguridad
- [ ] Solo profesores del estudiante visibles
- [ ] Validacion de acceso a thread

---

## Dependencias

### Bloqueado Por
- ParentAccount Entity (COMPLETO)
- ParentStudentLink Entity (COMPLETO)
- WebSocket Gateway (COMPLETO)

### Bloquea
- File Attachments
- Group Conversations
- Automated Messages

---

## Estimacion de Esfuerzo

| Componente | Horas Estimadas |
|------------|-----------------|
| Database Schema | 4h |
| ParentMessagesService | 10h |
| ParentMessagesController | 4h |
| Frontend Messaging UI | 16h |
| Real-time Updates | 4h |
| Tests | 4h |
| **Total** | **42h** |

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-27 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-PAR-004-parent-messaging.md*
*Generado: 2026-01-27*
