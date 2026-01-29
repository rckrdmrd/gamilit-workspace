/**
 * SessionCleanupService
 *
 * TASK-2026-01-18-015 Sprint 3 Task 3.3
 * Cleanup of orphaned and stale learning sessions
 *
 * @description Runs hourly to clean up sessions that have been abandoned
 * or left in "ongoing" state for too long. Marks them as "timed_out"
 * to maintain data consistency.
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { LearningSession } from '../entities/learning-session.entity';

@Injectable()
export class SessionCleanupService {
  private readonly logger = new Logger(SessionCleanupService.name);

  // Sessions older than this are considered orphaned
  private readonly ORPHAN_THRESHOLD_HOURS = 4;

  // Sessions older than this are considered abandoned
  private readonly ABANDON_THRESHOLD_HOURS = 24;

  constructor(
    @InjectRepository(LearningSession, 'progress')
    private readonly sessionRepo: Repository<LearningSession>,
  ) {}

  /**
   * Hourly cron job to clean up orphaned sessions
   * Runs every hour on the hour
   */
  @Cron('0 * * * *')
  async cleanupOrphanedSessions(): Promise<void> {
    this.logger.log('Starting orphaned session cleanup...');

    try {
      const thresholdDate = new Date(Date.now() - this.ORPHAN_THRESHOLD_HOURS * 60 * 60 * 1000);

      // Find and update orphaned sessions
      const result = await this.sessionRepo
        .createQueryBuilder()
        .update(LearningSession)
        .set({
          is_active: false,
          completion_status: 'timed_out',
          ended_at: new Date(),
        })
        .where('completion_status = :status', { status: 'ongoing' })
        .andWhere('is_active = :active', { active: true })
        .andWhere('started_at < :threshold', { threshold: thresholdDate })
        .execute();

      if (result.affected && result.affected > 0) {
        this.logger.log(`Cleaned up ${result.affected} orphaned sessions (>${this.ORPHAN_THRESHOLD_HOURS}h old)`);
      } else {
        this.logger.debug('No orphaned sessions found for cleanup');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Orphaned session cleanup failed: ${errorMessage}`);
    }
  }

  /**
   * Daily cron job to clean up very old abandoned sessions
   * Runs at 3 AM to permanently mark abandoned sessions
   */
  @Cron('0 3 * * *')
  async cleanupAbandonedSessions(): Promise<void> {
    this.logger.log('Starting abandoned session cleanup...');

    try {
      const thresholdDate = new Date(Date.now() - this.ABANDON_THRESHOLD_HOURS * 60 * 60 * 1000);

      // Find and update abandoned sessions (any still ongoing after 24h)
      const result = await this.sessionRepo
        .createQueryBuilder()
        .update(LearningSession)
        .set({
          is_active: false,
          completion_status: 'abandoned',
          ended_at: new Date(),
        })
        .where('completion_status = :status', { status: 'ongoing' })
        .andWhere('started_at < :threshold', { threshold: thresholdDate })
        .execute();

      if (result.affected && result.affected > 0) {
        this.logger.log(`Marked ${result.affected} sessions as abandoned (>${this.ABANDON_THRESHOLD_HOURS}h old)`);
      } else {
        this.logger.debug('No abandoned sessions found');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Abandoned session cleanup failed: ${errorMessage}`);
    }
  }

  /**
   * Manual cleanup trigger for testing or maintenance
   */
  async runManualCleanup(): Promise<{ orphaned: number; abandoned: number }> {
    this.logger.log('Running manual session cleanup...');

    const orphanThreshold = new Date(Date.now() - this.ORPHAN_THRESHOLD_HOURS * 60 * 60 * 1000);
    const abandonThreshold = new Date(Date.now() - this.ABANDON_THRESHOLD_HOURS * 60 * 60 * 1000);

    // Cleanup orphaned (4-24h old)
    const orphanedResult = await this.sessionRepo
      .createQueryBuilder()
      .update(LearningSession)
      .set({
        is_active: false,
        completion_status: 'timed_out',
        ended_at: new Date(),
      })
      .where('completion_status = :status', { status: 'ongoing' })
      .andWhere('is_active = :active', { active: true })
      .andWhere('started_at < :orphanThreshold', { orphanThreshold })
      .andWhere('started_at >= :abandonThreshold', { abandonThreshold })
      .execute();

    // Cleanup abandoned (>24h old)
    const abandonedResult = await this.sessionRepo
      .createQueryBuilder()
      .update(LearningSession)
      .set({
        is_active: false,
        completion_status: 'abandoned',
        ended_at: new Date(),
      })
      .where('completion_status = :status', { status: 'ongoing' })
      .andWhere('started_at < :abandonThreshold', { abandonThreshold })
      .execute();

    return {
      orphaned: orphanedResult.affected || 0,
      abandoned: abandonedResult.affected || 0,
    };
  }

  /**
   * Get statistics about orphaned sessions
   */
  async getOrphanedSessionStats(): Promise<{
    total_orphaned: number;
    by_status: Record<string, number>;
    oldest_orphaned: Date | null;
  }> {
    const thresholdDate = new Date(Date.now() - this.ORPHAN_THRESHOLD_HOURS * 60 * 60 * 1000);

    // Count by status
    const statusCounts = await this.sessionRepo
      .createQueryBuilder('s')
      .select('s.completion_status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('s.started_at < :threshold', { threshold: thresholdDate })
      .andWhere('s.is_active = true')
      .groupBy('s.completion_status')
      .getRawMany();

    // Get oldest orphaned
    const oldest = await this.sessionRepo
      .createQueryBuilder('s')
      .where('s.completion_status = :status', { status: 'ongoing' })
      .andWhere('s.is_active = true')
      .andWhere('s.started_at < :threshold', { threshold: thresholdDate })
      .orderBy('s.started_at', 'ASC')
      .getOne();

    const byStatus: Record<string, number> = {};
    statusCounts.forEach((row) => {
      byStatus[row.status] = parseInt(row.count, 10);
    });

    return {
      total_orphaned: Object.values(byStatus).reduce((a, b) => a + b, 0),
      by_status: byStatus,
      oldest_orphaned: oldest?.started_at || null,
    };
  }
}
