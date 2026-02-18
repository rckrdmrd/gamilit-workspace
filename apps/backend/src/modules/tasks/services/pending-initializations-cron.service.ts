/**
 * Pending User Initializations Retry Cron Service
 *
 * REC-007: Scheduled task to retry failed user initializations.
 *
 * When the DB trigger `trg_initialize_user_stats` (AFTER INSERT on profiles)
 * fails to create user_stats, comodines, missions, etc., the failure is logged
 * to `audit_logging.pending_user_initializations`. This cron job processes
 * those pending records by calling the DB function
 * `audit_logging.retry_pending_initializations()` which handles:
 *   - initialize_user_stats errors -> gamilit.initialize_user_stats_for_user()
 *   - assign_default_classroom errors -> gamilit.assign_default_classroom_for_user()
 *   - initialize_user_missions errors -> gamilit.initialize_user_missions()
 *
 * Exponential backoff: 5 min * (retry_count + 1), max 3 retries.
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

interface RetryResult {
  user_id: string;
  retry_status: string;
  error_message: string | null;
}

interface PendingStats {
  status: string;
  count: number;
  oldest: string;
  newest: string;
}

@Injectable()
export class PendingInitializationsCronService {
  private readonly logger = new Logger(PendingInitializationsCronService.name);

  constructor(
    @InjectDataSource('audit')
    private readonly dataSource: DataSource,
  ) { }

  /**
   * Retry Pending User Initializations
   *
   * Runs every 10 minutes at America/Mexico_City timezone.
   * Processes up to 10 pending records per run, respecting next_retry_at.
   */
  @Cron('*/10 * * * *', {
    name: 'retry-pending-initializations',
    timeZone: 'America/Mexico_City',
  })
  async handleRetryPendingInitializations() {
    const jobName = 'retry-pending-initializations';
    const startTime = Date.now();

    try {
      this.logger.log(`[CRON:${jobName}] Starting pending initializations retry...`);

      // Check if there are any pending records before calling the retry function
      const pendingCount = await this.dataSource.query<{ count: string }[]>(`
        SELECT COUNT(*)::text as count
        FROM audit_logging.pending_user_initializations
        WHERE status IN ('pending', 'retrying')
          AND (next_retry_at IS NULL OR next_retry_at <= NOW())
          AND retry_count < max_retries
      `);

      const count = parseInt(pendingCount[0]?.count || '0', 10);

      if (count === 0) {
        const duration = Date.now() - startTime;
        this.logger.log(`[CRON:${jobName}] No pending initializations to retry (${duration}ms)`);
        return;
      }

      this.logger.log(`[CRON:${jobName}] Found ${count} pending initialization(s) to retry`);

      // Call the DB function that handles batch retry with backoff
      const results = await this.dataSource.query<RetryResult[]>(
        `SELECT * FROM audit_logging.retry_pending_initializations($1)`,
        [10], // batch size
      );

      const resolved = results.filter(r => r.retry_status === 'resolved').length;
      const failed = results.filter(r => r.retry_status === 'failed').length;
      const retrying = results.filter(r => r.retry_status === 'retrying').length;

      const duration = Date.now() - startTime;

      this.logger.log(
        `[CRON:${jobName}] Retry complete: ${resolved} resolved, ${retrying} retrying, ${failed} failed (${duration}ms)`,
      );

      // Log individual failures for debugging
      for (const result of results.filter(r => r.error_message)) {
        this.logger.warn(
          `[CRON:${jobName}] User ${result.user_id}: ${result.retry_status} - ${result.error_message}`,
        );
      }
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `[CRON:${jobName}] Error in retry pending initializations after ${duration}ms:`,
        error,
      );
      this.logger.error(
        `[CRON:${jobName}] Error stack:`,
        error instanceof Error ? error.stack : 'No stack',
      );
    }
  }

  /**
   * Get pending initialization statistics
   *
   * @returns Stats grouped by status
   */
  async getPendingStats(): Promise<PendingStats[]> {
    try {
      return await this.dataSource.query<PendingStats[]>(`
        SELECT
          status,
          COUNT(*)::integer as count,
          MIN(created_at)::text as oldest,
          MAX(created_at)::text as newest
        FROM audit_logging.pending_user_initializations
        GROUP BY status
        ORDER BY status
      `);
    } catch (error) {
      this.logger.error('Error fetching pending initialization stats:', error);
      return [];
    }
  }
}
