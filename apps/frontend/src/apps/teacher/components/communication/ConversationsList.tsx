/**
 * ConversationsList Component
 *
 * Lista de conversaciones agrupadas por usuario.
 * Muestra el último mensaje y contador de mensajes no leídos.
 *
 * @module apps/teacher/components/communication/ConversationsList
 */

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { DetectiveCard } from '../../../../shared/components/base/DetectiveCard';
import { Conversation } from '../../../../services/api/teacher/teacherMessagesApi';

// ============================================================================
// TYPES
// ============================================================================

interface ConversationsListProps {
  conversations: Conversation[];
  onConversationClick: (conversation: Conversation) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Lista de conversaciones agrupadas
 *
 * @example
 * ```tsx
 * <ConversationsList
 *   conversations={conversations}
 *   onConversationClick={(conv) => openConversation(conv)}
 * />
 * ```
 */
export const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  onConversationClick,
}) => {
  // Empty state
  if (conversations.length === 0) {
    return (
      <DetectiveCard>
        <div className="py-8 text-center text-gray-500">
          <MessageCircle className="mx-auto mb-2 h-12 w-12" />
          <p>No hay conversaciones</p>
        </div>
      </DetectiveCard>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conv) => (
        <DetectiveCard
          key={conv.conversation_id}
          className="cursor-pointer transition-shadow hover:shadow-lg"
          onClick={() => onConversationClick(conv)}
        >
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Usuario y badge de no leídos */}
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-bold">{conv.other_user_name}</span>
                  {conv.unread_count > 0 && (
                    <span className="rounded-full bg-detective-orange px-2 py-1 text-xs text-white">
                      {conv.unread_count}
                    </span>
                  )}
                </div>

                {/* Último mensaje */}
                <p className="line-clamp-1 text-sm text-gray-600">{conv.last_message}</p>

                {/* Fecha del último mensaje */}
                <p className="mt-1 text-xs text-gray-400">
                  {new Date(conv.last_message_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </DetectiveCard>
      ))}
    </div>
  );
};
