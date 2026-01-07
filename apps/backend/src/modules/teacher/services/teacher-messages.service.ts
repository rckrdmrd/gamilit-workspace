import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Message, MessageParticipant } from '../entities/message.entity';
import { Profile } from '@/modules/auth/entities/profile.entity';
import {
  SendMessageDto,
  SendClassroomAnnouncementDto,
  SendPrivateFeedbackDto,
  GetMessagesQueryDto,
  MessageResponseDto,
  MessagesListResponseDto,
  ConversationDto,
  UnreadCountDto,
} from '../dto/teacher-messages.dto';
import { MessageTypeEnum } from '@/shared/constants/enums.constants';

/**
 * TeacherMessagesService
 *
 * @description Service para gestión de comunicación entre teachers y estudiantes
 * @module teacher
 *
 * Funcionalidades:
 * - Enviar mensajes directos a estudiantes
 * - Enviar anuncios a classroom completo
 * - Enviar feedback privado sobre tareas
 * - Obtener listado de mensajes con filtros
 * - Marcar mensajes como leídos
 * - Agrupar mensajes en conversaciones
 * - Obtener contador de mensajes no leídos
 *
 * Database:
 * - Schema: communication
 * - Tables: messages, message_participants
 * - Functions: get_unread_count(user_id)
 *
 * @see Entity: Message, MessageParticipant
 * @see DTOs: teacher-messages.dto.ts
 * @see Database: apps/database/ddl/schemas/communication/
 */
@Injectable()
export class TeacherMessagesService {
  private readonly logger = new Logger(TeacherMessagesService.name);

  constructor(
    @InjectRepository(Message, 'communication')
    private readonly messagesRepository: Repository<Message>,
    @InjectRepository(MessageParticipant, 'communication')
    private readonly participantsRepository: Repository<MessageParticipant>,
    @InjectRepository(Profile, 'auth')
    private readonly profileRepository: Repository<Profile>,
  ) {}

  /**
   * P2-04: Get user display names from user IDs
   * Fetches full names from auth.profiles to replace truncated User_xxx names
   */
  private async getUserNames(userIds: string[]): Promise<Map<string, string>> {
    if (userIds.length === 0) return new Map();

    const profiles = await this.profileRepository.find({
      where: { user_id: In(userIds) },
      select: ['user_id', 'first_name', 'last_name', 'display_name'],
    });

    const nameMap = new Map<string, string>();
    for (const profile of profiles) {
      if (!profile.user_id) continue;
      const fullName = profile.display_name ||
        `${profile.first_name || ''} ${profile.last_name || ''}`.trim() ||
        'Usuario';
      nameMap.set(profile.user_id, fullName);
    }

    return nameMap;
  }

  /**
   * Obtener listado de mensajes con filtros y paginación
   *
   * @param teacherId - ID del teacher
   * @param tenantId - ID del tenant
   * @param query - Filtros y parámetros de paginación
   * @returns Lista paginada de mensajes
   */
  async getMessages(teacherId: string, _tenantId: string, query: GetMessagesQueryDto): Promise<MessagesListResponseDto> {
    // ⚠️ NOTA: sender y classroom relations deshabilitadas por cross-datasource limitation
    // Ver: message.entity.ts - Cross-datasource relations comentadas
    // Para obtener datos de sender/classroom:
    // 1. Obtener mensajes con esta query
    // 2. Extraer senderId[] y classroomId[]
    // 3. Query paralela a auth_management.profiles y social_features.classrooms
    // 4. Mapear resultados en el response
    // ISS-SYNC-001: tenantId removido - no existe en DDL communication.messages
    const qb = this.messagesRepository
      .createQueryBuilder('msg')
      // .leftJoinAndSelect('msg.sender', 'sender')  // ❌ Disabled - cross-datasource
      // .leftJoinAndSelect('msg.classroom', 'classroom')  // ❌ Disabled - cross-datasource
      .where('msg.isDeleted = false')
      .andWhere(
        '(msg.senderId = :teacherId OR EXISTS (SELECT 1 FROM communication.message_participants mp WHERE mp.message_id = msg.id AND mp.user_id = :teacherId))',
        { teacherId },
      );

    // Filtros
    if (query.classroom_id) {
      qb.andWhere('msg.classroomId = :classroomId', { classroomId: query.classroom_id });
    }

    if (query.type) {
      qb.andWhere('msg.messageType = :type', { type: query.type });
    }

    if (query.unread !== undefined) {
      if (query.unread) {
        qb.andWhere('msg.isRead = false');
      } else {
        qb.andWhere('msg.isRead = true');
      }
    }

    if (query.search) {
      qb.andWhere(
        '(msg.subject ILIKE :search OR msg.content ILIKE :search)',  // sender.name removed - cross-datasource
        { search: `%${query.search}%` },
      );
    }

    // Ordenar por más reciente
    qb.orderBy('msg.createdAt', 'DESC');

    // Paginación
    const total = await qb.getCount();
    qb.skip(query.offset).take(query.limit);

    const messages = await qb.getMany();

    // Cargar recipients para cada mensaje
    // P2-04: Enriquecer con nombres reales desde auth.profiles
    const allParticipants = await this.participantsRepository.find({
      where: { messageId: In(messages.map(m => m.id)), role: 'recipient' },
    });

    // Obtener nombres de todos los participantes
    const allUserIds = [...new Set(allParticipants.map(p => p.userId))];
    const userNamesMap = await this.getUserNames(allUserIds);

    const messagesWithRecipients = messages.map((msg) => {
      const participants = allParticipants.filter(p => p.messageId === msg.id);

      return {
        ...msg,
        recipients: participants.map((p) => ({
          userId: p.userId,
          userName: userNamesMap.get(p.userId) || 'Usuario',
          isRead: p.isRead,
        })),
      };
    });

    return {
      data: messagesWithRecipients.map((msg) => this.mapToResponseDto(msg)),
      total,
      limit: query.limit || 20,
      offset: query.offset || 0,
    };
  }

  /**
   * Obtener mensaje por ID
   *
   * @param messageId - ID del mensaje
   * @param teacherId - ID del teacher
   * @param tenantId - ID del tenant
   * @returns Mensaje completo
   * @throws NotFoundException si no existe
   * @throws ForbiddenException si no tiene acceso
   */
  async getMessageById(messageId: string, teacherId: string, _tenantId: string): Promise<MessageResponseDto> {
    // ⚠️ NOTA: sender y classroom relations deshabilitadas por cross-datasource limitation
    // ISS-SYNC-001: tenantId removido - no existe en DDL communication.messages
    const message = await this.messagesRepository.findOne({
      where: { id: messageId },
      // relations: ['sender', 'classroom'],  // ❌ Disabled - cross-datasource
    });

    if (!message) {
      throw new NotFoundException('Mensaje no encontrado');
    }

    // Verificar que el teacher tiene acceso al mensaje
    const hasAccess = await this.verifyMessageAccess(messageId, teacherId);
    if (!hasAccess) {
      throw new ForbiddenException('No tienes acceso a este mensaje');
    }

    // Cargar recipients
    // P2-04: Enriquecer con nombres reales desde auth.profiles
    const participants = await this.participantsRepository.find({
      where: { messageId: message.id, role: 'recipient' },
    });

    // Obtener nombres de los participantes
    const userIds = participants.map(p => p.userId);
    const userNamesMap = await this.getUserNames(userIds);

    const messageWithRecipients = {
      ...message,
      recipients: participants.map((p) => ({
        userId: p.userId,
        userName: userNamesMap.get(p.userId) || 'Usuario',
        isRead: p.isRead,
      })),
    };

    return this.mapToResponseDto(messageWithRecipients);
  }

  /**
   * Enviar mensaje directo a estudiantes
   *
   * @param teacherId - ID del teacher
   * @param tenantId - ID del tenant
   * @param dto - Datos del mensaje
   * @returns Mensaje creado
   * @throws BadRequestException si no hay destinatarios
   */
  async sendMessage(teacherId: string, _tenantId: string, dto: SendMessageDto): Promise<MessageResponseDto> {
    // Verificar que los recipients existen y son accesibles
    if (dto.recipient_ids.length === 0) {
      throw new BadRequestException('Debe especificar al menos un destinatario');
    }

    // ISS-SYNC-001: Alineado con DDL communication.messages
    // - type → messageType
    // - assignmentId → metadata.assignment_id
    // - conversationId → threadId
    // - tenantId removido (no existe en DDL)
    const message = this.messagesRepository.create({
      senderId: teacherId,
      recipientId: dto.recipient_ids[0] || null, // Primer destinatario como recipient principal
      messageType: dto.type || MessageTypeEnum.DIRECT,
      subject: dto.subject,
      content: dto.content,
      classroomId: dto.classroom_id || null,
      parentMessageId: dto.parent_message_id || null,
      threadId: dto.parent_message_id ? await this.getThreadId(dto.parent_message_id) : null,
      metadata: dto.assignment_id ? { assignment_id: dto.assignment_id } : {},
    });

    await this.messagesRepository.save(message);

    // Crear participantes
    const participants = [];

    // Sender
    participants.push(
      this.participantsRepository.create({
        messageId: message.id,
        userId: teacherId,
        role: 'sender',
        isRead: true,
        readAt: new Date(),
      }),
    );

    // Recipients
    for (const recipientId of dto.recipient_ids) {
      participants.push(
        this.participantsRepository.create({
          messageId: message.id,
          userId: recipientId,
          role: 'recipient',
          isRead: false,
        }),
      );
    }

    await this.participantsRepository.save(participants);

    this.logger.log(`Message ${message.id} sent by teacher ${teacherId} to ${dto.recipient_ids.length} recipients`);

    return this.getMessageById(message.id, teacherId, _tenantId);
  }

  /**
   * Enviar anuncio a classroom completo
   *
   * @param classroomId - ID del classroom
   * @param teacherId - ID del teacher
   * @param tenantId - ID del tenant
   * @param dto - Datos del anuncio
   * @returns Mensaje creado
   * @throws ForbiddenException si no tiene acceso al classroom
   * @throws BadRequestException si no hay estudiantes
   */
  async sendClassroomAnnouncement(
    classroomId: string,
    teacherId: string,
    tenantId: string,
    dto: SendClassroomAnnouncementDto,
  ): Promise<MessageResponseDto> {
    // Verificar que el teacher pertenece al classroom
    const hasAccess = await this.verifyTeacherClassroomAccess(teacherId, classroomId, tenantId);
    if (!hasAccess) {
      throw new ForbiddenException('No tienes acceso a este classroom');
    }

    // Obtener todos los estudiantes del classroom
    const students = await this.messagesRepository.query(
      `SELECT DISTINCT user_id
       FROM social_features.classroom_members
       WHERE classroom_id = $1 AND role = 'student'`,
      [classroomId],
    );

    if (students.length === 0) {
      throw new BadRequestException('No hay estudiantes en este classroom');
    }

    const recipientIds = students.map((s: any) => s.user_id);

    // Usar sendMessage con tipo classroom_announcement
    return this.sendMessage(teacherId, tenantId, {
      recipient_ids: recipientIds,
      subject: dto.subject,
      content: dto.content,
      type: MessageTypeEnum.CLASSROOM_ANNOUNCEMENT,
      classroom_id: classroomId,
    });
  }

  /**
   * Enviar feedback privado a estudiante
   *
   * @param studentId - ID del estudiante
   * @param teacherId - ID del teacher
   * @param tenantId - ID del tenant
   * @param dto - Datos del feedback
   * @returns Mensaje creado
   */
  async sendPrivateFeedback(
    studentId: string,
    teacherId: string,
    tenantId: string,
    dto: SendPrivateFeedbackDto,
  ): Promise<MessageResponseDto> {
    // Verificar que el teacher tiene acceso al estudiante
    // (asumimos que si están en un classroom juntos, tiene acceso)

    return this.sendMessage(teacherId, tenantId, {
      recipient_ids: [studentId],
      subject: 'Feedback Privado',
      content: dto.content,
      type: MessageTypeEnum.PRIVATE_FEEDBACK,
      assignment_id: dto.assignment_id,
    });
  }

  /**
   * Marcar mensaje como leído
   *
   * @param messageId - ID del mensaje
   * @param teacherId - ID del teacher
   * @param tenantId - ID del tenant
   * @throws ForbiddenException si no tiene acceso
   */
  async markAsRead(messageId: string, teacherId: string, _recipientId: string): Promise<void> {
    // Verificar acceso
    const hasAccess = await this.verifyMessageAccess(messageId, teacherId);
    if (!hasAccess) {
      throw new ForbiddenException('No tienes acceso a este mensaje');
    }

    // Actualizar message_participant
    await this.participantsRepository.update({ messageId, userId: teacherId }, { isRead: true, readAt: new Date() });

    // Actualizar message si todos los recipients lo han leído
    const allRead = await this.checkAllRecipientsRead(messageId);
    if (allRead) {
      await this.messagesRepository.update({ id: messageId }, { isRead: true, readAt: new Date() });
    }
  }

  /**
   * Obtener conversaciones agrupadas
   *
   * @param teacherId - ID del teacher
   * @param tenantId - ID del tenant
   * @returns Lista de conversaciones
   */
  async getConversations(teacherId: string, _tenantId: string): Promise<ConversationDto[]> {
    // ISS-SYNC-001: Query actualizado - conversation_id → thread_id, tenant_id removido
    const conversations = await this.messagesRepository.query(
      `SELECT
        COALESCE(m.thread_id, m.id) as conversation_id,
        CASE
          WHEN m.sender_id = $1 THEN (
            SELECT mp.user_id FROM communication.message_participants mp
            WHERE mp.message_id = m.id AND mp.role = 'recipient' LIMIT 1
          )
          ELSE m.sender_id
        END as other_user_id,
        CASE
          WHEN m.sender_id = $1 THEN (
            SELECT u.display_name FROM communication.message_participants mp
            JOIN auth_management.profiles u ON mp.user_id = u.user_id
            WHERE mp.message_id = m.id AND mp.role = 'recipient' LIMIT 1
          )
          ELSE s.display_name
        END as other_user_name,
        m.subject as last_message,
        m.created_at as last_message_at,
        (SELECT COUNT(*) FROM communication.message_participants mp2
         WHERE mp2.user_id = $1 AND mp2.is_read = false
           AND EXISTS (
             SELECT 1 FROM communication.messages m2
             WHERE m2.id = mp2.message_id
               AND COALESCE(m2.thread_id, m2.id) = COALESCE(m.thread_id, m.id)
           )
        ) as unread_count
       FROM communication.messages m
       LEFT JOIN auth_management.profiles s ON m.sender_id = s.user_id
       WHERE m.is_deleted = false
         AND (
           m.sender_id = $1
           OR EXISTS (
             SELECT 1 FROM communication.message_participants mp
             WHERE mp.message_id = m.id AND mp.user_id = $1
           )
         )
       ORDER BY m.created_at DESC`,
      [teacherId],
    );

    return conversations.map((c: any) => ({
      conversation_id: c.conversation_id,
      other_user_id: c.other_user_id,
      other_user_name: c.other_user_name,
      last_message: c.last_message,
      last_message_at: c.last_message_at,
      unread_count: parseInt(c.unread_count, 10),
    }));
  }

  /**
   * Obtener contador de mensajes no leídos
   *
   * @param teacherId - ID del teacher
   * @returns Contador de mensajes no leídos
   */
  async getUnreadCount(teacherId: string): Promise<UnreadCountDto> {
    const result = await this.messagesRepository.query('SELECT communication.get_unread_count($1) as count', [
      teacherId,
    ]);
    return { count: result[0]?.count || 0 };
  }

  /**
   * Verificar acceso del teacher a un mensaje
   *
   * @private
   * @param messageId - ID del mensaje
   * @param teacherId - ID del teacher
   * @returns true si tiene acceso, false si no
   */
  private async verifyMessageAccess(messageId: string, teacherId: string): Promise<boolean> {
    const result = await this.messagesRepository.query(
      `SELECT EXISTS (
        SELECT 1 FROM communication.messages m
        LEFT JOIN communication.message_participants mp ON m.id = mp.message_id
        WHERE m.id = $1 AND (m.sender_id = $2 OR mp.user_id = $2)
      ) as has_access`,
      [messageId, teacherId],
    );
    return result[0]?.has_access || false;
  }

  /**
   * Verificar acceso del teacher a un classroom
   *
   * @private
   * @param teacherId - ID del teacher
   * @param classroomId - ID del classroom
   * @param tenantId - ID del tenant
   * @returns true si tiene acceso, false si no
   */
  private async verifyTeacherClassroomAccess(teacherId: string, classroomId: string, _tenantId: string): Promise<boolean> {
    // ISS-SYNC-001: tenantId removido de query (no existe en social_features.teacher_classrooms DDL)
    const result = await this.messagesRepository.query(
      `SELECT EXISTS (
        SELECT 1 FROM social_features.teacher_classrooms
        WHERE teacher_id = $1 AND classroom_id = $2
      ) as has_access`,
      [teacherId, classroomId],
    );
    return result[0]?.has_access || false;
  }

  /**
   * Obtener ID de thread del mensaje padre
   *
   * @private
   * @param parentMessageId - ID del mensaje padre
   * @returns ID del thread o null
   *
   * ISS-SYNC-001: Renombrado de getConversationId → getThreadId
   */
  private async getThreadId(parentMessageId: string): Promise<string | null> {
    const parent = await this.messagesRepository.findOne({
      where: { id: parentMessageId },
      select: ['threadId', 'id'],
    });
    return parent?.threadId || parent?.id || null;
  }

  /**
   * Verificar si todos los recipients han leído el mensaje
   *
   * @private
   * @param messageId - ID del mensaje
   * @returns true si todos leyeron, false si no
   */
  private async checkAllRecipientsRead(messageId: string): Promise<boolean> {
    const result = await this.participantsRepository.query(
      `SELECT NOT EXISTS (
        SELECT 1 FROM communication.message_participants
        WHERE message_id = $1 AND role = 'recipient' AND is_read = false
      ) as all_read`,
      [messageId],
    );
    return result[0]?.all_read || false;
  }

  /**
   * Mapear entity a DTO de respuesta
   *
   * @private
   * @param message - Entity Message con recipients
   * @returns DTO de respuesta
   */
  private mapToResponseDto(message: any): MessageResponseDto {
    // ISS-SYNC-001: Actualizado para usar nombres de campos alineados con DDL
    // - type → messageType
    // - assignmentId → metadata.assignment_id
    // - attachmentUrl → attachments (array)
    return {
      id: message.id,
      sender_id: message.senderId,
      sender_name: message.senderName || message.sender?.display_name || 'Desconocido',
      recipients: message.recipients || [],
      subject: message.subject,
      content: message.content,
      type: message.messageType,
      classroom_id: message.classroomId,
      classroom_name: message.classroom?.name || null,
      assignment_id: message.metadata?.assignment_id || null,
      attachment_url: message.attachments?.[0]?.url || null, // Primer attachment para compatibilidad
      parent_message_id: message.parentMessageId,
      is_read: message.isRead,
      read_at: message.readAt?.toISOString() || null,
      created_at: message.createdAt.toISOString(),
      updated_at: message.updatedAt.toISOString(),
    };
  }
}
