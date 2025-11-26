/* eslint-disable rulesdir/no-api-route-issues */
/**
 * Teacher Messages API Client
 *
 * API Service para sistema de comunicación del portal Teacher.
 * Endpoints para mensajes directos, anuncios, feedback y conversaciones.
 *
 * @module services/api/teacher/teacherMessagesApi
 */

import { apiClient } from '../apiClient';

// ============================================================================
// TYPES & ENUMS
// ============================================================================

/**
 * Tipos de mensajes soportados por el sistema
 */
export enum MessageType {
  DIRECT = 'direct',
  CLASSROOM_ANNOUNCEMENT = 'classroom_announcement',
  CLASSROOM_CHAT = 'classroom_chat',
  PRIVATE_FEEDBACK = 'private_feedback',
  ASSIGNMENT_COMMENT = 'assignment_comment',
}

/**
 * Destinatario de un mensaje
 */
export interface MessageRecipient {
  user_id: string;
  user_name: string;
  is_read: boolean;
}

/**
 * Mensaje completo con todos sus datos
 */
export interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  recipients: MessageRecipient[];
  subject: string;
  content: string;
  type: MessageType;
  classroom_id: string | null;
  classroom_name: string | null;
  assignment_id: string | null;
  attachment_url: string | null;
  parent_message_id: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Respuesta paginada de mensajes
 */
export interface MessagesListResponse {
  data: Message[];
  total: number;
  limit: number;
  offset: number;
}

/**
 * Parámetros para obtener mensajes
 */
export interface GetMessagesParams {
  classroom_id?: string;
  type?: MessageType;
  unread?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Datos para enviar un mensaje
 */
export interface SendMessageData {
  recipient_ids: string[];
  subject: string;
  content: string;
  type?: MessageType;
  classroom_id?: string;
  assignment_id?: string;
  parent_message_id?: string;
}

/**
 * Datos para enviar un anuncio a clase
 */
export interface SendAnnouncementData {
  subject: string;
  content: string;
  priority?: 'normal' | 'high' | 'urgent';
}

/**
 * Datos para enviar feedback privado
 */
export interface SendFeedbackData {
  content: string;
  assignment_id?: string;
  submission_id?: string;
}

/**
 * Conversación agrupada con otro usuario
 */
export interface Conversation {
  conversation_id: string;
  other_user_id: string;
  other_user_name: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
}

/**
 * Respuesta del contador de mensajes no leídos
 */
export interface UnreadCountResponse {
  count: number;
}

/**
 * Respuesta genérica de éxito
 */
export interface SuccessResponse {
  message: string;
}

// ============================================================================
// API CLIENT
// ============================================================================

/**
 * API Client para Teacher Messages
 *
 * Provee métodos para interactuar con el sistema de comunicación:
 * - Listar mensajes con filtros
 * - Enviar mensajes directos
 * - Enviar anuncios a clases
 * - Enviar feedback privado a estudiantes
 * - Marcar mensajes como leídos
 * - Obtener conversaciones agrupadas
 * - Obtener contador de mensajes no leídos
 */
export const teacherMessagesApi = {
  /**
   * Obtiene lista de mensajes con filtros opcionales
   *
   * @param params - Parámetros de filtrado y paginación
   * @returns Promise con lista paginada de mensajes
   *
   * @example
   * ```typescript
   * const { data, total } = await teacherMessagesApi.getMessages({
   *   classroom_id: '123',
   *   unread: true,
   *   limit: 20,
   *   offset: 0
   * });
   * ```
   */
  getMessages: async (params: GetMessagesParams = {}): Promise<MessagesListResponse> => {
    const response = await apiClient.get('/teacher/messages', { params });
    return response.data;
  },

  /**
   * Obtiene un mensaje específico por ID
   *
   * @param messageId - ID del mensaje
   * @returns Promise con el mensaje completo
   *
   * @example
   * ```typescript
   * const message = await teacherMessagesApi.getMessageById('msg-123');
   * ```
   */
  getMessageById: async (messageId: string): Promise<Message> => {
    const response = await apiClient.get(`/teacher/messages/${messageId}`);
    return response.data;
  },

  /**
   * Envía un mensaje directo a uno o más destinatarios
   *
   * @param data - Datos del mensaje (destinatarios, asunto, contenido)
   * @returns Promise con el mensaje creado
   *
   * @example
   * ```typescript
   * const message = await teacherMessagesApi.sendMessage({
   *   recipient_ids: ['student-1', 'student-2'],
   *   subject: 'Consulta sobre tarea',
   *   content: 'Hola estudiantes...',
   *   type: MessageType.DIRECT
   * });
   * ```
   */
  sendMessage: async (data: SendMessageData): Promise<Message> => {
    const response = await apiClient.post('/teacher/messages', data);
    return response.data;
  },

  /**
   * Envía un anuncio a todos los estudiantes de una clase
   *
   * @param classroomId - ID de la clase
   * @param data - Datos del anuncio (asunto, contenido, prioridad)
   * @returns Promise con el anuncio creado
   *
   * @example
   * ```typescript
   * const announcement = await teacherMessagesApi.sendClassroomAnnouncement('class-123', {
   *   subject: 'Examen próximo',
   *   content: 'Recordatorio del examen...',
   *   priority: 'high'
   * });
   * ```
   */
  sendClassroomAnnouncement: async (
    classroomId: string,
    data: SendAnnouncementData,
  ): Promise<Message> => {
    const response = await apiClient.post(
      `/teacher/messages/classroom/${classroomId}/announcement`,
      data,
    );
    return response.data;
  },

  /**
   * Envía feedback privado a un estudiante
   *
   * @param studentId - ID del estudiante
   * @param data - Datos del feedback (contenido, assignment_id, submission_id)
   * @returns Promise con el mensaje de feedback creado
   *
   * @example
   * ```typescript
   * const feedback = await teacherMessagesApi.sendPrivateFeedback('student-123', {
   *   content: 'Buen trabajo en la tarea...',
   *   assignment_id: 'assign-456',
   *   submission_id: 'sub-789'
   * });
   * ```
   */
  sendPrivateFeedback: async (studentId: string, data: SendFeedbackData): Promise<Message> => {
    const response = await apiClient.post(`/teacher/messages/student/${studentId}/feedback`, data);
    return response.data;
  },

  /**
   * Marca un mensaje como leído
   *
   * @param messageId - ID del mensaje
   * @returns Promise con respuesta de éxito
   *
   * @example
   * ```typescript
   * await teacherMessagesApi.markAsRead('msg-123');
   * ```
   */
  markAsRead: async (messageId: string): Promise<SuccessResponse> => {
    const response = await apiClient.post(`/teacher/messages/${messageId}/read`);
    return response.data;
  },

  /**
   * Obtiene todas las conversaciones agrupadas por usuario
   *
   * @returns Promise con lista de conversaciones
   *
   * @example
   * ```typescript
   * const conversations = await teacherMessagesApi.getConversations();
   * console.log(`Tienes ${conversations.length} conversaciones`);
   * ```
   */
  getConversations: async (): Promise<Conversation[]> => {
    const response = await apiClient.get('/teacher/messages/conversations');
    return response.data;
  },

  /**
   * Obtiene el contador de mensajes no leídos
   *
   * @returns Promise con el contador
   *
   * @example
   * ```typescript
   * const { count } = await teacherMessagesApi.getUnreadCount();
   * console.log(`Tienes ${count} mensajes sin leer`);
   * ```
   */
  getUnreadCount: async (): Promise<UnreadCountResponse> => {
    const response = await apiClient.get('/teacher/messages/unread-count');
    return response.data;
  },
};
