/**
 * Notifications Cron Service
 *
 * Scheduled tasks for notifications maintenance and cleanup
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { NotificationService } from '../../notifications/services/notification.service';

@Injectable()
export class NotificationsCronService {
  private readonly logger = new Logger(NotificationsCronService.name);

  constructor(
    private readonly notificationService: NotificationService,
  ) {}

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
