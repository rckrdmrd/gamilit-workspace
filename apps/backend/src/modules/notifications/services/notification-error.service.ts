import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { NotificationLog } from '../entities/multichannel/notification-log.entity';
import {
  DeliveryStatus,
  ErrorCategory,
  ErrorCategoryType,
  NotificationErrorDto,
  ErrorListResponseDto,
} from '../dto/analytics';

/**
 * Error metadata structure stored in notification_logs.metadata
 */
interface ErrorMetadata {
  errorCategory?: ErrorCategoryType;
  errorCode?: string;
  stackTrace?: string;
  retryCount?: number;
  lastRetryAt?: string;
  errorHistory?: Array<{
    timestamp: string;
    category: string;
    code: string;
    message: string;
  }>;
}

/**
 * NotificationErrorService
 *
 * @description Service for logging and managing notification delivery errors
 * @version 1.0 (2026-02-03) - Sprint 1.5 Audit
 *
 * Responsibilities:
 * - Categorize errors: validation, provider, network, rate_limit, unknown
 * - Store error details: code, message, stack trace, provider response
 * - Implement retry tracking (attempts count, last attempt time)
 * - Query methods: logError(), getErrorsByNotification(), getRecentErrors()
 *
 * @see EXT-003 Multi-channel notifications
 */
@Injectable()
export class NotificationErrorService {
  private readonly logger = new Logger(NotificationErrorService.name);

  constructor(
    @InjectRepository(NotificationLog, 'notifications')
    private readonly logRepository: Repository<NotificationLog>,
  ) {}

  /**
   * Log an error for a notification delivery attempt
   *
   * @param logId - Notification log ID
   * @param error - Error details
   * @returns Updated log entry
   */
  async logError(
    logId: string,
    error: {
      category: ErrorCategoryType;
      code: string;
      message: string;
      stackTrace?: string;
      providerResponse?: Record<string, unknown>;
    },
  ): Promise<NotificationLog> {
    const log = await this.logRepository.findOne({
      where: { id: logId },
    });

    if (!log) {
      this.logger.error(`Cannot log error: log ${logId} not found`);
      throw new Error(`Notification log ${logId} not found`);
    }

    // Get existing metadata
    const existingMetadata = (log.metadata || {}) as ErrorMetadata;
    const retryCount = (existingMetadata.retryCount || 0) + 1;
    const now = new Date().toISOString();

    // Build error history
    const errorHistory = existingMetadata.errorHistory || [];
    errorHistory.push({
      timestamp: now,
      category: error.category,
      code: error.code,
      message: error.message,
    });

    // Update log
    log.status = DeliveryStatus.FAILED;
    log.errorMessage = error.message;
    log.providerResponse = error.providerResponse || log.providerResponse;
    log.metadata = {
      ...existingMetadata,
      errorCategory: error.category,
      errorCode: error.code,
      stackTrace: error.stackTrace,
      retryCount,
      lastRetryAt: now,
      errorHistory,
    };

    const saved = await this.logRepository.save(log);

    this.logger.warn(
      `Logged error for notification ${log.notificationId}: [${error.category}] ${error.code} - ${error.message}`,
    );

    return saved;
  }

  /**
   * Log a validation error
   *
   * @param logId - Notification log ID
   * @param code - Error code
   * @param message - Error message
   * @returns Updated log
   */
  async logValidationError(
    logId: string,
    code: string,
    message: string,
  ): Promise<NotificationLog> {
    return this.logError(logId, {
      category: ErrorCategory.VALIDATION,
      code,
      message,
    });
  }

  /**
   * Log a provider error
   *
   * @param logId - Notification log ID
   * @param code - Provider error code
   * @param message - Error message
   * @param providerResponse - Raw provider response
   * @returns Updated log
   */
  async logProviderError(
    logId: string,
    code: string,
    message: string,
    providerResponse?: Record<string, unknown>,
  ): Promise<NotificationLog> {
    return this.logError(logId, {
      category: ErrorCategory.PROVIDER,
      code,
      message,
      providerResponse,
    });
  }

  /**
   * Log a network error
   *
   * @param logId - Notification log ID
   * @param code - Error code
   * @param message - Error message
   * @param stackTrace - Stack trace if available
   * @returns Updated log
   */
  async logNetworkError(
    logId: string,
    code: string,
    message: string,
    stackTrace?: string,
  ): Promise<NotificationLog> {
    return this.logError(logId, {
      category: ErrorCategory.NETWORK,
      code,
      message,
      stackTrace,
    });
  }

  /**
   * Log a rate limit error
   *
   * @param logId - Notification log ID
   * @param message - Rate limit message
   * @returns Updated log
   */
  async logRateLimitError(
    logId: string,
    message: string,
  ): Promise<NotificationLog> {
    return this.logError(logId, {
      category: ErrorCategory.RATE_LIMIT,
      code: 'RATE_LIMIT_EXCEEDED',
      message,
    });
  }

  /**
   * Log an unknown error
   *
   * @param logId - Notification log ID
   * @param error - Error object
   * @returns Updated log
   */
  async logUnknownError(
    logId: string,
    error: Error,
  ): Promise<NotificationLog> {
    return this.logError(logId, {
      category: ErrorCategory.UNKNOWN,
      code: 'UNKNOWN_ERROR',
      message: error.message,
      stackTrace: error.stack,
    });
  }

  /**
   * Get errors for a specific notification
   *
   * @param notificationId - Notification ID
   * @returns List of errors
   */
  async getErrorsByNotification(
    notificationId: string,
  ): Promise<NotificationErrorDto[]> {
    const logs = await this.logRepository.find({
      where: {
        notificationId,
        status: In([DeliveryStatus.FAILED, DeliveryStatus.BOUNCED]),
      },
      order: { createdAt: 'DESC' },
    });

    return logs.map((log) => this.mapLogToErrorDto(log));
  }

  /**
   * Get recent errors with filters
   *
   * @param filters - Query filters
   * @returns Paginated error list
   */
  async getRecentErrors(filters?: {
    category?: ErrorCategoryType;
    channel?: string;
    from?: Date;
    to?: Date;
    offset?: number;
    limit?: number;
  }): Promise<ErrorListResponseDto> {
    const query = this.logRepository
      .createQueryBuilder('log')
      .where('log.status IN (:...statuses)', {
        statuses: [DeliveryStatus.FAILED, DeliveryStatus.BOUNCED],
      });

    // Filter by category (stored in metadata)
    if (filters?.category) {
      query.andWhere("log.metadata->>'errorCategory' = :category", {
        category: filters.category,
      });
    }

    // Filter by channel
    if (filters?.channel) {
      query.andWhere('log.channel = :channel', { channel: filters.channel });
    }

    // Filter by date range
    if (filters?.from) {
      query.andWhere('log.created_at >= :from', { from: filters.from });
    }
    if (filters?.to) {
      query.andWhere('log.created_at <= :to', { to: filters.to });
    }

    // Get total count
    const total = await query.getCount();

    // Apply pagination
    const offset = filters?.offset || 0;
    const limit = filters?.limit || 20;

    query.orderBy('log.created_at', 'DESC');
    query.skip(offset);
    query.take(limit);

    const logs = await query.getMany();

    return {
      errors: logs.map((log) => this.mapLogToErrorDto(log)),
      total,
      offset,
      limit,
    };
  }

  /**
   * Get error statistics for a time period
   *
   * @param from - Start date
   * @param to - End date
   * @returns Error counts by category and channel
   */
  async getErrorStats(
    from: Date,
    to: Date,
  ): Promise<{
    total: number;
    byCategory: Record<string, number>;
    byChannel: Record<string, number>;
    topErrors: Array<{ code: string; count: number }>;
  }> {
    // Get total failed/bounced
    const total = await this.logRepository.count({
      where: {
        status: In([DeliveryStatus.FAILED, DeliveryStatus.BOUNCED]),
        createdAt: Between(from, to),
      },
    });

    // Get by channel
    const byChannelQuery = await this.logRepository
      .createQueryBuilder('log')
      .select('log.channel', 'channel')
      .addSelect('COUNT(*)', 'count')
      .where('log.status IN (:...statuses)', {
        statuses: [DeliveryStatus.FAILED, DeliveryStatus.BOUNCED],
      })
      .andWhere('log.created_at BETWEEN :from AND :to', { from, to })
      .groupBy('log.channel')
      .getRawMany();

    const byChannel: Record<string, number> = {};
    for (const row of byChannelQuery) {
      byChannel[row.channel] = parseInt(row.count, 10);
    }

    // Get by category
    const byCategoryQuery = await this.logRepository
      .createQueryBuilder('log')
      .select("log.metadata->>'errorCategory'", 'category')
      .addSelect('COUNT(*)', 'count')
      .where('log.status IN (:...statuses)', {
        statuses: [DeliveryStatus.FAILED, DeliveryStatus.BOUNCED],
      })
      .andWhere('log.created_at BETWEEN :from AND :to', { from, to })
      .groupBy("log.metadata->>'errorCategory'")
      .getRawMany();

    const byCategory: Record<string, number> = {};
    for (const row of byCategoryQuery) {
      const cat = row.category || 'unknown';
      byCategory[cat] = parseInt(row.count, 10);
    }

    // Get top error codes
    const topErrorsQuery = await this.logRepository
      .createQueryBuilder('log')
      .select("log.metadata->>'errorCode'", 'code')
      .addSelect('COUNT(*)', 'count')
      .where('log.status IN (:...statuses)', {
        statuses: [DeliveryStatus.FAILED, DeliveryStatus.BOUNCED],
      })
      .andWhere('log.created_at BETWEEN :from AND :to', { from, to })
      .groupBy("log.metadata->>'errorCode'")
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const topErrors = topErrorsQuery.map((row) => ({
      code: row.code || 'UNKNOWN',
      count: parseInt(row.count, 10),
    }));

    return {
      total,
      byCategory,
      byChannel,
      topErrors,
    };
  }

  /**
   * Get retry count for a notification log
   *
   * @param logId - Log ID
   * @returns Retry count
   */
  async getRetryCount(logId: string): Promise<number> {
    const log = await this.logRepository.findOne({
      where: { id: logId },
    });

    if (!log) {
      return 0;
    }

    const metadata = log.metadata as ErrorMetadata | undefined;
    return metadata?.retryCount || 0;
  }

  /**
   * Check if a notification can be retried
   *
   * @param logId - Log ID
   * @param maxRetries - Maximum allowed retries
   * @returns Whether retry is allowed
   */
  async canRetry(logId: string, maxRetries: number = 3): Promise<boolean> {
    const retryCount = await this.getRetryCount(logId);
    return retryCount < maxRetries;
  }

  /**
   * Get logs eligible for retry
   *
   * @param maxRetries - Maximum retry count
   * @param limit - Maximum results
   * @returns Logs that can be retried
   */
  async getRetryableLogs(
    maxRetries: number = 3,
    limit: number = 100,
  ): Promise<NotificationLog[]> {
    return this.logRepository
      .createQueryBuilder('log')
      .where('log.status = :status', { status: DeliveryStatus.FAILED })
      .andWhere(
        "COALESCE((log.metadata->>'retryCount')::int, 0) < :maxRetries",
        { maxRetries },
      )
      .orderBy('log.created_at', 'ASC')
      .take(limit)
      .getMany();
  }

  /**
   * Map log entity to error DTO
   */
  private mapLogToErrorDto(log: NotificationLog): NotificationErrorDto {
    const metadata = log.metadata as ErrorMetadata | undefined;

    return {
      id: log.id,
      notificationId: log.notificationId,
      category: (metadata?.errorCategory || ErrorCategory.UNKNOWN) as ErrorCategoryType,
      code: metadata?.errorCode || 'UNKNOWN',
      message: log.errorMessage || 'Unknown error',
      stackTrace: metadata?.stackTrace,
      providerResponse: log.providerResponse,
      channel: log.channel,
      retryAttempts: metadata?.retryCount || 0,
      lastRetryAt: metadata?.lastRetryAt,
      createdAt: log.createdAt.toISOString(),
    };
  }
}
