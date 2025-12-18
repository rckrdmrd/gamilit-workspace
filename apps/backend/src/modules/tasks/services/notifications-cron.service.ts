/**
 * Notifications Cron Service
 *
 * Scheduled tasks for notifications maintenance and cleanup
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationService } from '../../notifications/services/notification.service';
import { NotificationQueueService } from '../../notifications/services/notification-queue.service';

@Injectable()
export class NotificationsCronService {
  private readonly logger = new Logger(NotificationsCronService.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationQueueService: NotificationQueueService,
  ) {}

  /**
   * Process notification queue
   *
   * Runs every minute (EVERY_MINUTE)
   *
   * Processes pending notifications in the queue (email, push)
   * - Max 100 notifications per cycle
   * - Handles retries with exponential backoff (5min, 15min, 45min)
   * - Logs processing statistics
   */
  @Cron(CronExpression.EVERY_MINUTE, {
    name: 'notifications-queue-processor',
    timeZone: 'UTC',
  })
  async handleNotificationQueueProcessing() {
    try {
      this.logger.log('[CRON] Processing notification queue...');

      const startTime = Date.now();

      // Process up to 100 pending notifications
      const stats = await this.notificationQueueService.processQueue(100);

      const duration = Date.now() - startTime;

      if (stats.processed === 0) {
        this.logger.debug('[CRON] No pending notifications to process');
        return;
      }

      this.logger.log(
        `[CRON] Queue processed in ${duration}ms - ` +
        `Processed: ${stats.processed}, Succeeded: ${stats.succeeded}, ` +
        `Failed: ${stats.failed}, Skipped: ${stats.skipped}`,
      );

      // Log warning if there are failures
      if (stats.failed > 0) {
        this.logger.warn(
          `[CRON] ${stats.failed} notification(s) failed during processing`,
        );
      }
    } catch (error) {
      this.logger.error('[CRON] Error processing notification queue:', error);
    }
  }

  /**
   * Cleanup old read notifications
   *
   * Runs daily at 02:00 AM UTC
   * Cron: 0 2 * * *
   *
   * Deletes read notifications older than 30 days
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM, {
    name: 'notifications-cleanup',
    timeZone: 'UTC',
  })
  async handleNotificationsCleanup() {
    try {
      this.logger.log('[CRON] Starting notifications cleanup...');

      const startTime = Date.now();

      // Delete notifications older than 30 days
      const deletedCount = await this.notificationService.cleanupOldNotifications(30);

      const duration = Date.now() - startTime;

      this.logger.log(
        `[CRON] Notifications cleanup completed. Deleted ${deletedCount} notifications in ${duration}ms`,
      );
    } catch (error) {
      this.logger.error('[CRON] Error in notifications cleanup:', error);
    }
  }

  /**
   * Cleanup old processed queue items
   *
   * Runs weekly on Sundays at 03:00 AM UTC
   * Cron: 0 3 * * 0
   *
   * Deletes completed/failed queue items older than 30 days
   */
  @Cron('0 3 * * 0', {
    name: 'notification-queue-cleanup',
    timeZone: 'UTC',
  })
  async handleQueueCleanup() {
    try {
      this.logger.log('[CRON] Starting notification queue cleanup...');

      const startTime = Date.now();

      // Delete processed queue items older than 30 days
      const deletedCount = await this.notificationQueueService.cleanupProcessed(30);

      const duration = Date.now() - startTime;

      this.logger.log(
        `[CRON] Queue cleanup completed. Deleted ${deletedCount} queue items in ${duration}ms`,
      );
    } catch (error) {
      this.logger.error('[CRON] Error in queue cleanup:', error);
    }
  }

  /**
   * Manual cleanup method for testing
   */
  async runCleanupNow(daysOld: number = 30): Promise<number> {
    try {
      this.logger.log(`[MANUAL] Running notifications cleanup (${daysOld} days old)...`);

      const deletedCount = await this.notificationService.cleanupOldNotifications(daysOld);

      this.logger.log(`[MANUAL] Cleanup completed. Deleted ${deletedCount} notifications`);

      return deletedCount;
    } catch (error) {
      this.logger.error('[MANUAL] Error in cleanup:', error);
      throw error;
    }
  }
}
