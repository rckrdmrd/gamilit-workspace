/**
 * useTeacherMessages Hook
 *
 * Custom hook para gestionar el sistema de comunicación del portal Teacher.
 * Provee estado, filtros, paginación y métodos para enviar/recibir mensajes.
 *
 * @module apps/teacher/hooks/useTeacherMessages
 */

import { useState, useEffect, useCallback } from 'react';
import {
  teacherMessagesApi,
  Message,
  MessagesListResponse,
  GetMessagesParams,
  SendMessageData,
  Conversation,
  MessageType,
} from '../../../services/api/teacher/teacherMessagesApi';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Filtros para búsqueda de mensajes
 */
export interface MessageFilters {
  classroom_id?: string;
  type?: MessageType;
  unread?: boolean;
  search?: string;
}

/**
 * Estado de paginación
 */
export interface PaginationState {
  limit: number;
  offset: number;
}

/**
 * Valor de retorno del hook
 */
export interface UseTeacherMessagesReturn {
  // Estado
  messages: Message[];
  conversations: Conversation[];
  total: number;
  unreadCount: number;
  loading: boolean;
  error: Error | null;
  filters: MessageFilters;
  pagination: PaginationState;

  // Métodos de mensajería
  sendMessage: (data: SendMessageData) => Promise<Message>;
  sendAnnouncement: (classroomId: string, subject: string, content: string) => Promise<Message>;
  sendFeedback: (studentId: string, content: string) => Promise<Message>;
  markAsRead: (messageId: string) => Promise<void>;

  // Métodos de navegación
  updateFilters: (newFilters: Partial<MessageFilters>) => void;
  nextPage: () => void;
  prevPage: () => void;
  refresh: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook para gestionar mensajes del portal Teacher
 *
 * @param initialFilters - Filtros iniciales opcionales
 * @returns Objeto con estado y métodos para gestionar mensajes
 *
 * @example
 * ```typescript
 * const {
 *   messages,
 *   loading,
 *   sendMessage,
 *   markAsRead,
 *   updateFilters
 * } = useTeacherMessages({ unread: true });
 *
 * // Enviar mensaje
 * await sendMessage({
 *   recipient_ids: ['student-1'],
 *   subject: 'Consulta',
 *   content: 'Hola...'
 * });
 *
 * // Actualizar filtros
 * updateFilters({ type: MessageType.DIRECT });
 * ```
 */
export const useTeacherMessages = (
  initialFilters: MessageFilters = {},
): UseTeacherMessagesReturn => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<MessageFilters>(initialFilters);
  const [pagination, setPagination] = useState<PaginationState>({ limit: 20, offset: 0 });

  // ============================================================================
  // FETCH FUNCTIONS
  // ============================================================================

  /**
   * Obtiene lista de mensajes con filtros y paginación actuales
   */
  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: GetMessagesParams = {
        ...filters,
        ...pagination,
      };

      const response: MessagesListResponse = await teacherMessagesApi.getMessages(params);

      setMessages(response.data);
      setTotal(response.total);
    } catch (err: unknown) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al cargar mensajes';
      setError(new Error(errorMessage));
      console.error('[useTeacherMessages] Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination]);

  /**
   * Obtiene lista de conversaciones agrupadas
   */
  const fetchConversations = useCallback(async () => {
    try {
      const convs = await teacherMessagesApi.getConversations();
      setConversations(convs);
    } catch (err: unknown) {
      console.error('[useTeacherMessages] Error fetching conversations:', err);
      // No bloqueamos la UI por este error
    }
  }, []);

  /**
   * Obtiene contador de mensajes no leídos
   */
  const fetchUnreadCount = useCallback(async () => {
    try {
      const result = await teacherMessagesApi.getUnreadCount();
      setUnreadCount(result.count);
    } catch (err: unknown) {
      console.error('[useTeacherMessages] Error fetching unread count:', err);
      // No bloqueamos la UI por este error
    }
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Efecto principal: carga datos iniciales cuando cambian filtros/paginación
   */
  useEffect(() => {
    fetchMessages();
    fetchConversations();
    fetchUnreadCount();
  }, [fetchMessages, fetchConversations, fetchUnreadCount]);

  // ============================================================================
  // SEND METHODS
  // ============================================================================

  /**
   * Envía un mensaje directo
   *
   * @param data - Datos del mensaje
   * @returns Promise con el mensaje creado
   */
  const sendMessage = async (data: SendMessageData): Promise<Message> => {
    try {
      const message = await teacherMessagesApi.sendMessage(data);

      // Actualización optimista: agregar al inicio de la lista
      setMessages((prev) => [message, ...prev]);
      setTotal((prev) => prev + 1);

      return message;
    } catch (err: unknown) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al enviar mensaje';
      setError(new Error(errorMessage));
      throw err;
    }
  };

  /**
   * Envía un anuncio a toda una clase
   *
   * @param classroomId - ID de la clase
   * @param subject - Asunto del anuncio
   * @param content - Contenido del anuncio
   * @returns Promise con el anuncio creado
   */
  const sendAnnouncement = async (
    classroomId: string,
    subject: string,
    content: string,
  ): Promise<Message> => {
    try {
      const message = await teacherMessagesApi.sendClassroomAnnouncement(classroomId, {
        subject,
        content,
      });

      // Actualización optimista
      setMessages((prev) => [message, ...prev]);
      setTotal((prev) => prev + 1);

      return message;
    } catch (err: unknown) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al enviar anuncio';
      setError(new Error(errorMessage));
      throw err;
    }
  };

  /**
   * Envía feedback privado a un estudiante
   *
   * @param studentId - ID del estudiante
   * @param content - Contenido del feedback
   * @returns Promise con el mensaje de feedback creado
   */
  const sendFeedback = async (studentId: string, content: string): Promise<Message> => {
    try {
      const message = await teacherMessagesApi.sendPrivateFeedback(studentId, { content });

      // Actualización optimista
      setMessages((prev) => [message, ...prev]);
      setTotal((prev) => prev + 1);

      return message;
    } catch (err: unknown) {
      const errorMessage = err.response?.data?.message || err.message || 'Error al enviar feedback';
      setError(new Error(errorMessage));
      throw err;
    }
  };

  /**
   * Marca un mensaje como leído
   *
   * @param messageId - ID del mensaje
   */
  const markAsRead = async (messageId: string): Promise<void> => {
    try {
      await teacherMessagesApi.markAsRead(messageId);

      // Actualizar estado local
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, is_read: true, read_at: new Date().toISOString() } : msg,
        ),
      );

      // Decrementar contador de no leídos
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err: unknown) {
      console.error('[useTeacherMessages] Error marking as read:', err);
      // No bloqueamos la UI por este error
    }
  };

  // ============================================================================
  // FILTER & PAGINATION METHODS
  // ============================================================================

  /**
   * Actualiza los filtros de búsqueda
   *
   * @param newFilters - Filtros parciales a actualizar
   */
  const updateFilters = (newFilters: Partial<MessageFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    // Reset paginación al cambiar filtros
    setPagination({ limit: 20, offset: 0 });
  };

  /**
   * Avanza a la siguiente página
   */
  const nextPage = () => {
    setPagination((prev) => ({ ...prev, offset: prev.offset + prev.limit }));
  };

  /**
   * Retrocede a la página anterior
   */
  const prevPage = () => {
    setPagination((prev) => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }));
  };

  /**
   * Recarga todos los datos (mensajes, conversaciones, contador)
   */
  const refresh = () => {
    fetchMessages();
    fetchConversations();
    fetchUnreadCount();
  };

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    // Estado
    messages,
    conversations,
    total,
    unreadCount,
    loading,
    error,
    filters,
    pagination,

    // Métodos de mensajería
    sendMessage,
    sendAnnouncement,
    sendFeedback,
    markAsRead,

    // Métodos de navegación
    updateFilters,
    nextPage,
    prevPage,
    refresh,
  };
};
