import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { NotificationLog } from '../entities/multichannel/notification-log.entity';
import { Notification } from '../entities/multichannel/notification.entity';
import {
  DeliveryStatus,
  DeliveryStatusType,
  DeliveryStatusDto,
  DeliveryStatusByChannelDto,
} from '../dto/analytics';

/**
 * NotificationDeliveryService
 *
 * @description Service for tracking notification delivery status and updates
 * @version 1.0 (2026-02-03) - Sprint 1.5 Audit
 *
 * Responsibilities:
 * - Track delivery status: pending, sent, delivered, failed, bounced
 * - Record delivery timestamps
 * - Store delivery metadata (provider response, message ID)
 * - Update notification_logs table on status changes
 *
 * @see EXT-003 Multi-channel notifications
 */
@Injectable()
export class NotificationDeliveryService {
  private readonly logger = new Logger(NotificationDeliveryService.name);

  constructor(
    @InjectRepository(NotificationLog, 'notifications')
    private readonly logRepository: Repository<NotificationLog>,
    @InjectRepository(Notification, 'notifications')
    private readonly notificationRepository: Repository<Notification>,
  ) {}

  /**
   * Update delivery status for a notification log
   *
   * @param logId - Notification log ID
   * @param status - New delivery status
   * @param metadata - Additional metadata to store
   * @returns Updated log entry
   */
  async updateDeliveryStatus(
    logId: string,
    status: DeliveryStatusType,
    metadata?: {
      externalId?: string;
      providerResponse?: Record<string, unknown>;
      errorMessage?: string;
      deliveredAt?: Date;
    },
  ): Promise<NotificationLog> {
    const log = await this.logRepository.findOne({
      where: { id: logId },
    });

    if (!log) {
      throw new NotFoundException(`Notification log ${logId} not found`);
    }

    // Update status
    log.status = status;

    // Update timestamps based on status
    if (status === DeliveryStatus.SENT && !log.sentAt) {
      log.sentAt = new Date();
    }

    if (status === DeliveryStatus.DELIVERED) {
      log.deliveredAt = metadata?.deliveredAt || new Date();
    }

    // Update metadata
    if (metadata?.externalId) {
      log.externalId = metadata.externalId;
    }

    if (metadata?.providerResponse) {
      log.providerResponse = metadata.providerResponse;
    }

    if (metadata?.errorMessage) {
      log.errorMessage = metadata.errorMessage;
    }

    // Update log metadata with retry info
    log.metadata = {
      ...log.metadata,
      lastStatusUpdate: new Date().toISOString(),
      statusHistory: [
        ...((log.metadata?.statusHistory as string[]) || []),
        `${status}:${new Date().toISOString()}`,
      ],
    };

    const saved = await this.logRepository.save(log);

    this.logger.log(
      `Updated delivery status for log ${logId}: ${status}`,
    );

    return saved;
  }

  /**
   * Create a new delivery log entry
   *
   * @param notificationId - Parent notification ID
   * @param channel - Delivery channel
   * @param status - Initial status
   * @param metadata - Additional metadata
   * @returns Created log entry
   */
  async createDeliveryLog(
    notificationId: string,
    channel: string,
    status: DeliveryStatusType = DeliveryStatus.PENDING,
    metadata?: {
      externalId?: string;
      providerResponse?: Record<string, unknown>;
    },
  ): Promise<NotificationLog> {
    const log = this.logRepository.create({
      notificationId,
      channel,
      status,
      externalId: metadata?.externalId,
      providerResponse: metadata?.providerResponse,
      metadata: {
        createdAt: new Date().toISOString(),
        statusHistory: [`${status}:${new Date().toISOString()}`],
      },
    });

    if (status === DeliveryStatus.SENT) {
      log.sentAt = new Date();
    }

    const saved = await this.logRepository.save(log);

    this.logger.log(
      `Created delivery log ${saved.id} for notification ${notificationId} on channel ${channel}`,
    );

    return saved;
  }

  /**
   * Mark a notification as sent
   *
   * @param logId - Log ID
   * @param externalId - External provider message ID
   * @param providerResponse - Provider response data
   * @returns Updated log
   */
  async markAsSent(
    logId: string,
    externalId?: string,
    providerResponse?: Record<string, unknown>,
  ): Promise<NotificationLog> {
    return this.updateDeliveryStatus(logId, DeliveryStatus.SENT, {
      externalId,
      providerResponse,
    });
  }

  /**
   * Mark a notification as delivered
   *
   * @param logId - Log ID
   * @param deliveredAt - Delivery timestamp
   * @param providerResponse - Provider response data
   * @returns Updated log
   */
  async markAsDelivered(
    logId: string,
    deliveredAt?: Date,
    providerResponse?: Record<string, unknown>,
  ): Promise<NotificationLog> {
    return this.updateDeliveryStatus(logId, DeliveryStatus.DELIVERED, {
      deliveredAt,
      providerResponse,
    });
  }

  /**
   * Mark a notification as failed
   *
   * @param logId - Log ID
   * @param errorMessage - Error description
   * @param providerResponse - Provider response data
   * @returns Updated log
   */
  async markAsFailed(
    logId: string,
    errorMessage: string,
    providerResponse?: Record<string, unknown>,
  ): Promise<NotificationLog> {
    return this.updateDeliveryStatus(logId, DeliveryStatus.FAILED, {
      errorMessage,
      providerResponse,
    });
  }

  /**
   * Mark a notification as bounced
   *
   * @param logId - Log ID
   * @param errorMessage - Bounce reason
   * @param providerResponse - Provider response data
   * @returns Updated log
   */
  async markAsBounced(
    logId: string,
    errorMessage: string,
    providerResponse?: Record<string, unknown>,
  ): Promise<NotificationLog> {
    return this.updateDeliveryStatus(logId, DeliveryStatus.BOUNCED, {
      errorMessage,
      providerResponse,
    });
  }

  /**
   * Get delivery status for a notification
   *
   * @param notificationId - Notification ID
   * @returns Delivery status by channel
   */
  async getDeliveryStatus(
    notificationId: string,
  ): Promise<DeliveryStatusByChannelDto> {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException(`Notification ${notificationId} not found`);
    }

    const logs = await this.logRepository.find({
      where: { notificationId },
      order: { createdAt: 'DESC' },
    });

    const channels: Record<string, DeliveryStatusDto> = {};

    for (const log of logs) {
      channels[log.channel] = this.mapLogToStatusDto(log);
    }

    return {
      notificationId,
      userId: notification.userId,
      title: notification.title,
      channels,
      createdAt: notification.createdAt.toISOString(),
    };
  }

  /**
   * Get delivery status by external ID
   *
   * Used when receiving webhooks from providers
   *
   * @param externalId - External provider message ID
   * @returns Log entry or null
   */
  async findByExternalId(externalId: string): Promise<NotificationLog | null> {
    return this.logRepository.findOne({
      where: { externalId },
    });
  }

  /**
   * Update delivery status by external ID
   *
   * Used when receiving webhook callbacks from providers
   *
   * @param externalId - External provider message ID
   * @param status - New status
   * @param metadata - Additional metadata
   * @returns Updated log or null if not found
   */
  async updateStatusByExternalId(
    externalId: string,
    status: DeliveryStatusType,
    metadata?: {
      deliveredAt?: Date;
      errorMessage?: string;
      providerResponse?: Record<string, unknown>;
    },
  ): Promise<NotificationLog | null> {
    const log = await this.findByExternalId(externalId);

    if (!log) {
      this.logger.warn(
        `Webhook received for unknown external ID: ${externalId}`,
      );
      return null;
    }

    return this.updateDeliveryStatus(log.id, status, metadata);
  }

  /**
   * Get logs by status for batch processing
   *
   * @param status - Delivery status to filter by
   * @param limit - Maximum number of results
   * @returns List of logs
   */
  async findByStatus(
    status: DeliveryStatusType,
    limit: number = 100,
  ): Promise<NotificationLog[]> {
    return this.logRepository.find({
      where: { status },
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }

  /**
   * Get delivery statistics for a time period
   *
   * @param from - Start date
   * @param to - End date
   * @returns Statistics by status and channel
   */
  async getDeliveryStats(
    from: Date,
    to: Date,
  ): Promise<{
    byStatus: Record<string, number>;
    byChannel: Record<string, Record<string, number>>;
  }> {
    const query = this.logRepository
      .createQueryBuilder('log')
      .select('log.status', 'status')
      .addSelect('log.channel', 'channel')
      .addSelect('COUNT(*)', 'count')
      .where('log.created_at BETWEEN :from AND :to', { from, to })
      .groupBy('log.status')
      .addGroupBy('log.channel');

    const results = await query.getRawMany();

    const byStatus: Record<string, number> = {};
    const byChannel: Record<string, Record<string, number>> = {};

    for (const row of results) {
      // Aggregate by status
      byStatus[row.status] = (byStatus[row.status] || 0) + parseInt(row.count, 10);

      // Aggregate by channel and status
      if (!byChannel[row.channel]) {
        byChannel[row.channel] = {};
      }
      byChannel[row.channel][row.status] = parseInt(row.count, 10);
    }

    return { byStatus, byChannel };
  }

  /**
   * Map log entity to DTO
   */
  private mapLogToStatusDto(log: NotificationLog): DeliveryStatusDto {
    const retryInfo = log.metadata as {
      retryCount?: number;
      lastRetryAt?: string;
    } | undefined;

    return {
      notificationId: log.notificationId,
      status: log.status as DeliveryStatusType,
      channel: log.channel,
      sentAt: log.sentAt?.toISOString(),
      deliveredAt: log.deliveredAt?.toISOString(),
      externalId: log.externalId,
      providerResponse: log.providerResponse,
      errorMessage: log.errorMessage,
      retryCount: retryInfo?.retryCount,
      lastRetryAt: retryInfo?.lastRetryAt,
    };
  }
}
