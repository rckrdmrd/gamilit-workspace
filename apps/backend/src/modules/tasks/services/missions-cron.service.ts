/**
 * Missions Cron Service
 *
 * Scheduled tasks for automatic mission management
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { MissionsService } from '../../gamification/services/missions.service';
import { Mission, MissionStatusEnum } from '../../gamification/entities/mission.entity';

export interface CronJobStatus {
  name: string;
  schedule: string;
  nextRun: string | null;
  isRunning: boolean;
  description: string;
}

@Injectable()
export class MissionsCronService {
  private readonly logger = new Logger(MissionsCronService.name);

  constructor(
    private readonly missionsService: MissionsService,
    private readonly schedulerRegistry: SchedulerRegistry,
    @InjectRepository(Mission, 'gamification')
    private readonly missionsRepo: Repository<Mission>,
  ) {}

  /**
   * Daily Missions Reset
   *
   * Runs every day at 00:00 America/Mexico_City
   * Cron: 0 0 * * *
   *
   * Tasks:
   * 1. Expire old daily missions
   */
  @Cron('0 0 * * *', {
    name: 'daily-missions-reset',
    timeZone: 'America/Mexico_City',
  })
  async handleDailyMissionsReset() {
    const jobName = 'daily-missions-reset';
    const startTime = Date.now();

    try {
      this.logger.log(`[CRON:${jobName}] Starting daily missions reset...`);
      this.logger.log(`[CRON:${jobName}] Execution time: ${new Date().toISOString()}`);

      // Expire old missions
      const expiredCount = await this.missionsService.expireOldMissions();

      const duration = Date.now() - startTime;

      this.logger.log(`[CRON:${jobName}] Successfully expired ${expiredCount} missions`);
      this.logger.log(`[CRON:${jobName}] Daily missions reset completed successfully`);
      this.logger.log(`[CRON:${jobName}] Total duration: ${duration}ms (${(duration / 1000).toFixed(2)}s)`);
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      this.logger.error(`[CRON:${jobName}] Error in daily missions reset after ${duration}ms:`, error);
      this.logger.error(`[CRON:${jobName}] Error stack:`, error instanceof Error ? error.stack : 'No stack');
    }
  }

  /**
   * Weekly Missions Reset
   *
   * Runs every Monday at 00:00 America/Mexico_City
   * Cron: 0 0 * * 1
   *
   * Tasks:
   * 1. Expire old weekly missions
   */
  @Cron('0 0 * * 1', {
    name: 'weekly-missions-reset',
    timeZone: 'America/Mexico_City',
  })
  async handleWeeklyMissionsReset() {
    const jobName = 'weekly-missions-reset';
    const startTime = Date.now();

    try {
      this.logger.log(`[CRON:${jobName}] Starting weekly missions reset...`);
      this.logger.log(`[CRON:${jobName}] Execution time: ${new Date().toISOString()}`);

      // Expire old missions
      const expiredCount = await this.missionsService.expireOldMissions();

      const duration = Date.now() - startTime;

      this.logger.log(`[CRON:${jobName}] Successfully expired ${expiredCount} weekly missions`);
      this.logger.log(`[CRON:${jobName}] Weekly missions reset completed successfully`);
      this.logger.log(`[CRON:${jobName}] Total duration: ${duration}ms (${(duration / 1000).toFixed(2)}s)`);
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      this.logger.error(`[CRON:${jobName}] Error in weekly missions reset after ${duration}ms:`, error);
      this.logger.error(`[CRON:${jobName}] Error stack:`, error instanceof Error ? error.stack : 'No stack');
    }
  }

  /**
   * Check Missions Progress
   *
   * Runs every 5 minutes
   * Cron: every 5 minutes (0/5 * * * *)
   *
   * Tasks:
   * 1. Check all active missions
   * 2. Auto-complete missions that reached 100% progress
   */
  @Cron('*/5 * * * *', {
    name: 'check-missions-progress',
    timeZone: 'America/Mexico_City',
  })
  async handleCheckMissionsProgress() {
    const jobName = 'check-missions-progress';
    const startTime = Date.now();

    try {
      this.logger.log(`[CRON:${jobName}] Checking missions progress...`);
      this.logger.log(`[CRON:${jobName}] Execution time: ${new Date().toISOString()}`);

      // Note: Progress updates are handled by triggers in the database
      // This job primarily logs and monitors the system
      this.logger.log(`[CRON:${jobName}] Missions progress monitored by database triggers`);

      const duration = Date.now() - startTime;

      this.logger.log(`[CRON:${jobName}] Missions progress check completed successfully`);
      this.logger.log(`[CRON:${jobName}] Total duration: ${duration}ms (${(duration / 1000).toFixed(2)}s)`);
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      this.logger.error(`[CRON:${jobName}] Error in check missions progress after ${duration}ms:`, error);
      this.logger.error(`[CRON:${jobName}] Error stack:`, error instanceof Error ? error.stack : 'No stack');
    }
  }

  /**
   * Cleanup Expired Missions (REC-010)
   *
   * Runs every day at 03:00 America/Mexico_City
   * Cron: 0 3 * * *
   *
   * Tasks:
   * 1. Delete expired missions older than 90 days (retention policy)
   * 2. Missions with status 'expired' and end_date > 90 days ago are removed
   * 3. Completed/claimed missions are NOT deleted (they have historical value)
   */
  @Cron('0 3 * * *', {
    name: 'cleanup-expired-missions',
    timeZone: 'America/Mexico_City',
  })
  async handleCleanupExpiredMissions() {
    const jobName = 'cleanup-expired-missions';
    const startTime = Date.now();

    try {
      this.logger.log(`[CRON:${jobName}] Starting cleanup of expired missions...`);
      this.logger.log(`[CRON:${jobName}] Execution time: ${new Date().toISOString()}`);

      // REC-010: Delete expired missions older than 90 days
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - 90);

      const result = await this.missionsRepo
        .createQueryBuilder()
        .delete()
        .from(Mission)
        .where('status = :status', { status: MissionStatusEnum.EXPIRED })
        .andWhere('end_date < :cutoff', { cutoff: cutoffDate })
        .execute();

      const duration = Date.now() - startTime;

      this.logger.log(`[CRON:${jobName}] Deleted ${result.affected ?? 0} expired missions older than 90 days`);
      this.logger.log(`[CRON:${jobName}] Cutoff date: ${cutoffDate.toISOString()}`);
      this.logger.log(`[CRON:${jobName}] Total duration: ${duration}ms (${(duration / 1000).toFixed(2)}s)`);
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      this.logger.error(`[CRON:${jobName}] Error in cleanup expired missions after ${duration}ms:`, error);
      this.logger.error(`[CRON:${jobName}] Error stack:`, error instanceof Error ? error.stack : 'No stack');
    }
  }

  /**
   * Get CRON Jobs Status
   *
   * @description Returns the status of all registered CRON jobs for monitoring purposes
   *
   * @returns Array of CronJobStatus objects with job information
   */
  getCronJobsStatus(): CronJobStatus[] {
    const jobs: CronJobStatus[] = [
      {
        name: 'daily-missions-reset',
        schedule: '0 0 * * * (Every day at 00:00 America/Mexico_City)',
        nextRun: this.getNextRunTime('0 0 * * *'),
        isRunning: this.isJobRunning('daily-missions-reset'),
        description: 'Expires old daily missions',
      },
      {
        name: 'weekly-missions-reset',
        schedule: '0 0 * * 1 (Every Monday at 00:00 America/Mexico_City)',
        nextRun: this.getNextRunTime('0 0 * * 1'),
        isRunning: this.isJobRunning('weekly-missions-reset'),
        description: 'Expires old weekly missions',
      },
      {
        name: 'check-missions-progress',
        schedule: '*/5 * * * * (Every 5 minutes)',
        nextRun: this.getNextRunTime('*/5 * * * *'),
        isRunning: this.isJobRunning('check-missions-progress'),
        description: 'Monitors missions progress (handled by database triggers)',
      },
      {
        name: 'cleanup-expired-missions',
        schedule: '0 3 * * * (Every day at 03:00 America/Mexico_City)',
        nextRun: this.getNextRunTime('0 3 * * *'),
        isRunning: this.isJobRunning('cleanup-expired-missions'),
        description: 'Deletes expired missions older than 90 days (REC-010)',
      },
    ];

    return jobs;
  }

  /**
   * Check if a CRON job is currently running
   *
   * @param jobName - Name of the job to check
   * @returns Boolean indicating if the job is running
   */
  private isJobRunning(jobName: string): boolean {
    try {
      const job = this.schedulerRegistry.getCronJob(jobName);
      return (job as any).running ?? false;
    } catch (_error) {
      this.logger.warn(`Could not find job ${jobName} in registry`);
      return false;
    }
  }

  /**
   * Calculate next run time for a cron expression
   *
   * @param cronExpression - Cron expression (e.g., '0 0 * * *')
   * @returns ISO string of next run time or null if unable to calculate
   */
  private getNextRunTime(cronExpression: string): string | null {
    try {
      // This is a simplified calculation. For production, consider using 'cron-parser' library
      const now = new Date();

      // Parse cron expression: minute hour day month dayOfWeek
      const parts = cronExpression.split(' ');

      if (parts[0] === '*/5') {
        // Every 5 minutes - calculate next 5-minute mark
        const minutes = now.getMinutes();
        const nextMinute = Math.ceil(minutes / 5) * 5;
        const next = new Date(now);
        next.setMinutes(nextMinute, 0, 0);
        if (next <= now) {
          next.setMinutes(next.getMinutes() + 5);
        }
        return next.toISOString();
      }

      if (parts[0] === '0' && parts[1] === '0') {
        // Daily at 00:00
        const next = new Date(now);
        next.setUTCHours(0, 0, 0, 0);
        next.setUTCDate(next.getUTCDate() + 1);

        // If it's weekly (Monday)
        if (parts[4] === '1') {
          // Find next Monday
          const daysUntilMonday = (8 - next.getUTCDay()) % 7;
          if (daysUntilMonday === 0 && now.getUTCHours() >= 0) {
            next.setUTCDate(next.getUTCDate() + 7);
          } else {
            next.setUTCDate(next.getUTCDate() + daysUntilMonday);
          }
        }

        return next.toISOString();
      }

      if (parts[0] === '0' && parts[1] === '3') {
        // Daily at 03:00
        const next = new Date(now);
        next.setUTCHours(3, 0, 0, 0);
        if (next <= now) {
          next.setUTCDate(next.getUTCDate() + 1);
        }
        return next.toISOString();
      }

      return null;
    } catch (error) {
      this.logger.error(`Error calculating next run time for ${cronExpression}:`, error);
      return null;
    }
  }
}
