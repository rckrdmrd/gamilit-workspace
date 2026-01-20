/**
 * Achievement Reconciliation Cron Service
 *
 * Scheduled task to reconcile pending achievement reward claims.
 * Part of the "claim-to-earn" model where completed achievements
 * do not automatically grant rewards.
 *
 * This cron job ensures that any achievements that were completed
 * but not properly claimed (due to errors, timeouts, etc.) get
 * their rewards distributed.
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAchievement } from '../../gamification/entities';
import { AchievementsService } from '../../gamification/services/achievements.service';

export interface ReconciliationResult {
  total_pending: number;
  successfully_claimed: number;
  failed_claims: number;
  errors: Array<{
    user_id: string;
    achievement_id: string;
    error: string;
  }>;
}

@Injectable()
export class AchievementReconciliationCronService {
  private readonly logger = new Logger(AchievementReconciliationCronService.name);

  constructor(
    @InjectRepository(UserAchievement, 'gamification')
    private readonly userAchievementRepo: Repository<UserAchievement>,
    private readonly achievementsService: AchievementsService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  /**
   * Reconcile Pending Achievement Claims
   *
   * Runs every 5 minutes
   * Cron expression: 0/5 * * * * (every 5 minutes)
   *
   * Tasks:
   * 1. Find all achievements with is_completed=true AND rewards_claimed=false
   * 2. Attempt to claim rewards for each one
   * 3. Log results for monitoring
   */
  @Cron('*/5 * * * *', {
    name: 'reconcile-pending-achievement-claims',
    timeZone: 'UTC',
  })
  async reconcilePendingAchievementClaims(): Promise<ReconciliationResult> {
    const jobName = 'reconcile-pending-achievement-claims';
    const startTime = Date.now();

    const result: ReconciliationResult = {
      total_pending: 0,
      successfully_claimed: 0,
      failed_claims: 0,
      errors: [],
    };

    try {
      this.logger.log(`[CRON:${jobName}] Starting achievement reconciliation...`);
      this.logger.log(`[CRON:${jobName}] Execution time: ${new Date().toISOString()}`);

      // Find all pending claims (completed but not claimed)
      const pendingAchievements = await this.userAchievementRepo.find({
        where: {
          is_completed: true,
          rewards_claimed: false,
        },
      });

      result.total_pending = pendingAchievements.length;

      if (pendingAchievements.length === 0) {
        this.logger.log(`[CRON:${jobName}] No pending achievement claims found`);
        const duration = Date.now() - startTime;
        this.logger.log(`[CRON:${jobName}] Completed in ${duration}ms`);
        return result;
      }

      this.logger.log(`[CRON:${jobName}] Found ${pendingAchievements.length} pending achievement claims`);

      // Process each pending achievement
      for (const userAchievement of pendingAchievements) {
        try {
          const claimResult = await this.achievementsService.claimRewards(
            userAchievement.user_id,
            userAchievement.achievement_id,
          );

          result.successfully_claimed++;

          this.logger.log(
            `[CRON:${jobName}] Claimed rewards for user ${userAchievement.user_id}, ` +
            `achievement ${userAchievement.achievement_id}: ` +
            `XP=${claimResult.xp_granted}, Coins=${claimResult.coins_granted}`
          );
        } catch (error: unknown) {
          result.failed_claims++;

          const errorMessage = error instanceof Error ? error.message : String(error);

          result.errors.push({
            user_id: userAchievement.user_id,
            achievement_id: userAchievement.achievement_id,
            error: errorMessage,
          });

          this.logger.warn(
            `[CRON:${jobName}] Failed to claim rewards for user ${userAchievement.user_id}, ` +
            `achievement ${userAchievement.achievement_id}: ${errorMessage}`
          );
        }
      }

      const duration = Date.now() - startTime;

      this.logger.log(`[CRON:${jobName}] Reconciliation completed successfully`);
      this.logger.log(
        `[CRON:${jobName}] Results: ${result.successfully_claimed} claimed, ` +
        `${result.failed_claims} failed out of ${result.total_pending} pending`
      );
      this.logger.log(`[CRON:${jobName}] Total duration: ${duration}ms (${(duration / 1000).toFixed(2)}s)`);

      return result;
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      this.logger.error(`[CRON:${jobName}] Error in achievement reconciliation after ${duration}ms:`, error);
      this.logger.error(`[CRON:${jobName}] Error stack:`, error instanceof Error ? error.stack : 'No stack');
      throw error;
    }
  }

  /**
   * Get CRON Job Status
   *
   * @description Returns the status of the reconciliation cron job for monitoring
   */
  getCronJobStatus(): {
    name: string;
    schedule: string;
    nextRun: string | null;
    isRunning: boolean;
    description: string;
  } {
    return {
      name: 'reconcile-pending-achievement-claims',
      schedule: '*/5 * * * * (Every 5 minutes)',
      nextRun: this.getNextRunTime(),
      isRunning: this.isJobRunning(),
      description: 'Reconciles pending achievement reward claims (claim-to-earn model)',
    };
  }

  /**
   * Check if the cron job is currently running
   */
  private isJobRunning(): boolean {
    try {
      const job = this.schedulerRegistry.getCronJob('reconcile-pending-achievement-claims');
      return (job as any).running ?? false;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      this.logger.warn('Could not find reconciliation job in registry');
      return false;
    }
  }

  /**
   * Calculate next run time for the cron job
   */
  private getNextRunTime(): string | null {
    try {
      const now = new Date();
      const minutes = now.getMinutes();
      const nextMinute = Math.ceil(minutes / 5) * 5;
      const next = new Date(now);
      next.setMinutes(nextMinute, 0, 0);
      if (next <= now) {
        next.setMinutes(next.getMinutes() + 5);
      }
      return next.toISOString();
    } catch (error) {
      this.logger.error('Error calculating next run time:', error);
      return null;
    }
  }

  /**
   * Manual trigger for reconciliation (for testing/admin purposes)
   *
   * @description Allows manual triggering of the reconciliation process
   * outside of the scheduled cron job.
   */
  async triggerManualReconciliation(): Promise<ReconciliationResult> {
    this.logger.log('[MANUAL] Triggering manual achievement reconciliation...');
    return this.reconcilePendingAchievementClaims();
  }
}
