import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Logger,
  Inject,
  Optional,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Notification } from '../entities/multichannel/notification.entity';
import { NotificationTemplateService } from './notification-template.service';
import { WebSocketService } from '../../websocket/websocket.service';
import { NotificationRateLimitService } from './rate-limit.service';

/**
 * NotificationService
 *
 * @description Service principal para gestión de notificaciones multi-canal (EXT-003)
 * @version 2.0 (2026-02-03) - Integrated rate limiting
 *
 * Responsabilidades:
 * - Crear notificaciones (ad-hoc o desde templates)
 * - Enviar notificaciones respetando preferencias
 * - Integración con función SQL send_notification()
 * - CRUD con validación de ownership
 * - Marcar como leídas
 * - Obtener con filtros y paginación
 *
 * Flujo principal:
 * 1. Se verifica rate limit para el usuario/canales
 * 2. Se crea notificación (create o sendFromTemplate)
 * 3. Se llama función SQL send_notification()
 * 4. Función SQL valida preferencias y encola
 * 5. Worker procesa cola asíncronamente
 * 6. Se actualiza channels_sent cuando se procesa
 */
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(Notification, 'notifications')
    private readonly notificationRepository: Repository<Notification>,
    private readonly templateService: NotificationTemplateService,
    @InjectDataSource('notifications')
    private readonly dataSource: DataSource,
    private readonly webSocketService: WebSocketService,
    @Optional()
    @Inject(NotificationRateLimitService)
    private readonly rateLimitService?: NotificationRateLimitService,
  ) {}

  /**
   * Crear notificación ad-hoc
   *
   * @param data - Datos de la notificación
   * @param options - Opciones adicionales
   * @returns Notificación creada
   * @throws HttpException with 429 if rate limit exceeded
   */
  async create(
    data: {
      userId: string;
      title: string;
      message: string;
      type: string;
      data?: Record<string, unknown>;
      metadata?: Record<string, unknown>;
      priority?: string;
      channels?: string[];
      expiresAt?: Date;
    },
    options?: {
      skipRateLimit?: boolean;
      tenantId?: string;
    },
  ): Promise<Notification> {
    const channels = data.channels || ['in_app'];

    // Check rate limit unless skipped (for system notifications)
    if (!options?.skipRateLimit && this.rateLimitService) {
      await this.checkRateLimits(data.userId, channels, options?.tenantId);
    }
    const notification = this.notificationRepository.create({
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type,
      data: data.data,
      metadata: data.metadata,
      priority: data.priority || 'normal',
      channels: channels,
      status: 'sent',
      expiresAt: data.expiresAt,
    });

    const saved = await this.notificationRepository.save(notification);

    // Enviar por función SQL (respeta preferencias y encola)
    await this.callSendNotificationFunction(
      data.userId,
      data.title,
      data.message,
      data.type,
      channels,
    );

    // Emitir via WebSocket para notificación en tiempo real
    this.webSocketService.emitNotificationToUser(data.userId, {
      id: saved.id,
      type: saved.type,
      title: saved.title,
      message: saved.message,
      data: saved.data,
      read: !!saved.readAt,
      createdAt: saved.createdAt.toISOString(),
    });

    return saved;
  }

  /**
   * Enviar notificación desde template
   *
   * @param data - Datos para renderizar template
   * @param options - Opciones adicionales
   * @returns Notificación creada y enviada
   * @throws HttpException with 429 if rate limit exceeded
   */
  async sendFromTemplate(
    data: {
      templateKey: string;
      userId: string;
      variables: Record<string, string>;
      type?: string;
      channels?: string[];
      metadata?: Record<string, unknown>;
    },
    options?: {
      skipRateLimit?: boolean;
      tenantId?: string;
    },
  ): Promise<Notification> {
    // 1. Renderizar template
    const rendered = await this.templateService.renderTemplate(
      data.templateKey,
      data.variables,
    );

    // 2. Obtener template para canales por defecto
    const template = await this.templateService.findByKey(data.templateKey);
    const channels = data.channels || template.defaultChannels;

    // 3. Check rate limit unless skipped (for system notifications)
    if (!options?.skipRateLimit && this.rateLimitService) {
      await this.checkRateLimits(data.userId, channels, options?.tenantId);
    }

    // 4. Crear notificación con campos DDL reales
    const notification = this.notificationRepository.create({
      userId: data.userId,
      title: rendered.subject,
      message: rendered.body,
      type: data.type || 'system', // tipo por defecto si no se especifica
      data: data.variables,
      metadata: {
        ...data.metadata,
        template_key: data.templateKey,
      },
      priority: 'normal',
      channels: channels,
      status: 'sent',
    });

    const saved = await this.notificationRepository.save(notification);

    // 5. Enviar por función SQL
    await this.callSendNotificationFunction(
      data.userId,
      rendered.subject,
      rendered.body,
      data.type || 'system',
      channels,
    );

    // 6. Emitir via WebSocket para notificación en tiempo real
    this.webSocketService.emitNotificationToUser(data.userId, {
      id: saved.id,
      type: saved.type,
      title: saved.title,
      message: saved.message,
      data: saved.data,
      read: !!saved.readAt,
      createdAt: saved.createdAt.toISOString(),
    });

    return saved;
  }

  /**
   * Check rate limits for sending notifications
   *
   * @param userId - User ID
   * @param channels - Channels to check
   * @param tenantId - Optional tenant ID
   * @throws HttpException with 429 if rate limit exceeded
   */
  private async checkRateLimits(
    userId: string,
    channels: string[],
    tenantId?: string,
  ): Promise<void> {
    if (!this.rateLimitService) {
      return;
    }

    const { allAllowed, blockedChannels, results } =
      await this.rateLimitService.checkMultipleChannels(
        userId,
        channels,
        tenantId,
      );

    if (!allAllowed) {
      const firstBlockedResult = results[blockedChannels[0]];
      const retryAfterSeconds = Math.ceil(
        (firstBlockedResult.resetAt.getTime() - Date.now()) / 1000,
      );

      this.logger.warn(
        `Rate limit exceeded for user ${userId} on channels: ${blockedChannels.join(', ')}`,
      );

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Requests',
          message: `Rate limit exceeded for notification channels: ${blockedChannels.join(', ')}`,
          details: {
            blockedChannels,
            limit: firstBlockedResult.limit,
            current: firstBlockedResult.current,
            remaining: 0,
            resetAt: firstBlockedResult.resetAt.toISOString(),
            retryAfterSeconds,
          },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  /**
   * Obtener notificaciones de un usuario con filtros
   *
   * @param userId - UUID del usuario
   * @param filters - Filtros opcionales
   * @returns Lista paginada de notificaciones
   */
  async findAllByUser(
    userId: string,
    filters?: {
      status?: string; // pending, sent, read, failed
      type?: string;
      from?: Date;
      to?: Date;
      limit?: number;
      offset?: number;
    },
  ): Promise<{ data: Notification[]; total: number }> {
    const query = this.notificationRepository.createQueryBuilder('n');

    query.where('n.user_id = :userId', { userId });

    // Filtro por status
    if (filters?.status) {
      query.andWhere('n.status = :status', { status: filters.status });
    }

    // Filtro por tipo
    if (filters?.type) {
      query.andWhere('n.type = :type', { type: filters.type });
    }

    // Filtro por rango de fechas
    if (filters?.from) {
      query.andWhere('n.created_at >= :from', { from: filters.from });
    }
    if (filters?.to) {
      query.andWhere('n.created_at <= :to', { to: filters.to });
    }

    // Paginación
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;

    query.orderBy('n.created_at', 'DESC');
    query.skip(offset);
    query.take(limit);

    const [data, total] = await query.getManyAndCount();

    return { data, total };
  }

  /**
   * Obtener notificación por ID (con validación de ownership)
   *
   * @param notificationId - UUID de la notificación
   * @param userId - UUID del usuario (para validar ownership)
   * @returns Notificación
   * @throws NotFoundException si no existe
   * @throws ForbiddenException si no pertenece al usuario
   */
  async findOne(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException('You do not have access to this notification');
    }

    return notification;
  }

  /**
   * Obtener notificación por ID sin validación de ownership
   *
   * Método interno para uso de servicios (ej: NotificationQueueService)
   *
   * @param notificationId - UUID de la notificación
   * @returns Notificación o null si no existe
   */
  async findById(notificationId: string): Promise<Notification | null> {
    return this.notificationRepository.findOne({
      where: { id: notificationId },
    });
  }

  /**
   * Marcar notificación como leída
   *
   * @param notificationId - UUID de la notificación
   * @param userId - UUID del usuario (validación de ownership)
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const notification = await this.findOne(notificationId, userId);

    if (notification.status === 'read') {
      return; // Ya estaba leída
    }

    notification.status = 'read';
    notification.readAt = new Date();

    await this.notificationRepository.save(notification);
  }

  /**
   * Marcar todas las notificaciones como leídas
   *
   * @param userId - UUID del usuario
   * @returns Número de notificaciones actualizadas
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ status: 'read', readAt: new Date() })
      .where('user_id = :userId', { userId })
      .andWhere('status != :status', { status: 'read' })
      .execute();

    return result.affected || 0;
  }

  /**
   * Obtener contador de notificaciones no leídas
   *
   * @param userId - UUID del usuario
   * @returns Número de notificaciones no leídas (status != 'read')
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository
      .createQueryBuilder('n')
      .where('n.user_id = :userId', { userId })
      .andWhere('n.status IN (:...statuses)', { statuses: ['pending', 'sent'] })
      .getCount();
  }

  /**
   * Eliminar notificación (con validación de ownership)
   *
   * @param notificationId - UUID de la notificación
   * @param userId - UUID del usuario (validación de ownership)
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    const notification = await this.findOne(notificationId, userId);
    await this.notificationRepository.remove(notification);
  }

  /**
   * Eliminar notificaciones antiguas o expiradas
   *
   * @param olderThanDays - Eliminar notificaciones más antiguas que X días
   * @returns Número de notificaciones eliminadas
   */
  async cleanupOldNotifications(olderThanDays: number = 90): Promise<number> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - olderThanDays);

    const result = await this.notificationRepository
      .createQueryBuilder()
      .delete()
      .where('created_at < :threshold', { threshold: dateThreshold })
      .orWhere('expires_at IS NOT NULL AND expires_at < :now', { now: new Date() })
      .execute();

    return result.affected || 0;
  }

  /**
   * Llamar función SQL send_notification()
   *
   * Esta función:
   * 1. Valida preferencias del usuario
   * 2. Filtra canales según preferencias
   * 3. Encola para cada canal habilitado
   *
   * @private
   * @param userId - UUID del usuario
   * @param title - Título de la notificación
   * @param content - Contenido
   * @param notificationType - Tipo
   * @param channels - Canales deseados
   * @returns UUID de la notificación creada por la función
   */
  private async callSendNotificationFunction(
    userId: string,
    title: string,
    content: string,
    notificationType: string,
    channels: string[],
  ): Promise<string> {
    try {
      const result = await this.dataSource.query(
        'SELECT notifications.send_notification($1, $2, $3, $4, $5) as notification_id',
        [userId, title, content, notificationType, channels],
      );

      return result[0]?.notification_id;
    } catch (error) {
      // Log error pero no fallar (la notificación ya fue creada)
      this.logger.error(
        'Error calling send_notification function',
        error instanceof Error ? error.stack : String(error),
      );
      return '';
    }
  }
}
