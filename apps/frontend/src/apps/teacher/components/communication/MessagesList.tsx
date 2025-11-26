/**
 * MessagesList Component
 *
 * Lista de mensajes con vista de tarjetas.
 * Muestra información del remitente, destinatarios, tipo y estado de lectura.
 *
 * @module apps/teacher/components/communication/MessagesList
 */

import React from 'react';
import { Mail, MailOpen, User, Calendar } from 'lucide-react';
import { DetectiveCard } from '../../../../shared/components/base/DetectiveCard';
import { DetectiveButton } from '../../../../shared/components/base/DetectiveButton';
import { Message, MessageType } from '../../../../services/api/teacher/teacherMessagesApi';

// ============================================================================
// TYPES
// ============================================================================

interface MessagesListProps {
  messages: Message[];
  onMessageClick: (message: Message) => void;
  onMarkAsRead: (messageId: string) => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convierte el tipo de mensaje a etiqueta legible
 */
const getMessageTypeLabel = (type: MessageType): string => {
  const labels: Record<MessageType, string> = {
    [MessageType.DIRECT]: 'Mensaje directo',
    [MessageType.CLASSROOM_ANNOUNCEMENT]: 'Anuncio',
    [MessageType.CLASSROOM_CHAT]: 'Chat de clase',
    [MessageType.PRIVATE_FEEDBACK]: 'Feedback privado',
    [MessageType.ASSIGNMENT_COMMENT]: 'Comentario de tarea',
  };
  return labels[type] || type;
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Lista de mensajes con vista de tarjetas
 *
 * @example
 * ```tsx
 * <MessagesList
 *   messages={messages}
 *   onMessageClick={(msg) => console.log(msg)}
 *   onMarkAsRead={(id) => markAsRead(id)}
 * />
 * ```
 */
export const MessagesList: React.FC<MessagesListProps> = ({
  messages,
  onMessageClick,
  onMarkAsRead,
}) => {
  // Empty state
  if (messages.length === 0) {
    return (
      <DetectiveCard>
        <div className="py-8 text-center text-gray-500">
          <Mail className="mx-auto mb-2 h-12 w-12" />
          <p>No hay mensajes</p>
        </div>
      </DetectiveCard>
    );
  }

  return (
    <div className="space-y-2">
      {messages.map((message) => (
        <DetectiveCard
          key={message.id}
          className={`cursor-pointer transition-shadow hover:shadow-lg ${
            !message.is_read ? 'border-l-4 border-detective-orange' : ''
          }`}
          onClick={() => onMessageClick(message)}
        >
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Header con icono y asunto */}
                <div className="mb-1 flex items-center gap-2">
                  {message.is_read ? (
                    <MailOpen className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Mail className="h-4 w-4 text-detective-orange" />
                  )}
                  <span className="font-bold">{message.subject}</span>
                  <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">
                    {getMessageTypeLabel(message.type)}
                  </span>
                </div>

                {/* Contenido (truncado) */}
                <p className="mb-2 line-clamp-2 text-sm text-gray-600">{message.content}</p>

                {/* Metadata */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {message.sender_name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(message.created_at).toLocaleString()}
                  </div>
                  {message.classroom_name && <span>Clase: {message.classroom_name}</span>}
                  <span>{message.recipients.length} destinatario(s)</span>
                </div>
              </div>

              {/* Botón Marcar como leído */}
              {!message.is_read && (
                <DetectiveButton
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkAsRead(message.id);
                  }}
                >
                  Marcar leído
                </DetectiveButton>
              )}
            </div>
          </div>
        </DetectiveCard>
      ))}
    </div>
  );
};
