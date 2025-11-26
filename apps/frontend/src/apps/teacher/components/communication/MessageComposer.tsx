/**
 * MessageComposer Component
 *
 * Formulario para componer y enviar mensajes directos.
 * Permite ingresar asunto, contenido y destinatarios.
 *
 * @module apps/teacher/components/communication/MessageComposer
 */

import React, { useState } from 'react';
import { Send, X } from 'lucide-react';
import { DetectiveCard } from '../../../../shared/components/base/DetectiveCard';
import { DetectiveButton } from '../../../../shared/components/base/DetectiveButton';
import { SendMessageData } from '../../../../services/api/teacher/teacherMessagesApi';

// ============================================================================
// TYPES
// ============================================================================

interface MessageComposerProps {
  onSend: (data: SendMessageData) => Promise<void>;
  onCancel?: () => void;
  recipientIds?: string[];
  classroomId?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Formulario para componer mensajes
 *
 * @example
 * ```tsx
 * <MessageComposer
 *   onSend={async (data) => await sendMessage(data)}
 *   onCancel={() => setShowComposer(false)}
 *   recipientIds={['student-1', 'student-2']}
 * />
 * ```
 */
export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSend,
  onCancel,
  recipientIds = [],
  classroomId,
}) => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !content.trim()) {
      return;
    }

    setLoading(true);

    try {
      await onSend({
        recipient_ids: recipientIds,
        subject,
        content,
        classroom_id: classroomId,
      });

      // Reset form
      setSubject('');
      setContent('');
    } catch (err) {
      console.error('[MessageComposer] Error sending message:', err);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <DetectiveCard>
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Nuevo Mensaje</h3>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-400 transition-colors hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Asunto */}
        <div>
          <label className="mb-1 block text-sm font-medium">Asunto</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-detective-orange"
            placeholder="Escribe el asunto del mensaje"
            required
          />
        </div>

        {/* Mensaje */}
        <div>
          <label className="mb-1 block text-sm font-medium">Mensaje</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-detective-orange"
            rows={6}
            placeholder="Escribe tu mensaje aquí..."
            required
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          {onCancel && (
            <DetectiveButton type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </DetectiveButton>
          )}
          <DetectiveButton type="submit" disabled={loading || !subject.trim() || !content.trim()}>
            <Send className="mr-2 h-4 w-4" />
            {loading ? 'Enviando...' : 'Enviar Mensaje'}
          </DetectiveButton>
        </div>
      </form>
    </DetectiveCard>
  );
};
