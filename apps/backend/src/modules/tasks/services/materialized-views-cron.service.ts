/**
 * Materialized Views Cron Service
 *
 * Scheduled refresh for all materialized views in the platform.
 * FIX H-037: MVs existed without any refresh mechanism.
 *
 * MVs refreshed:
 * - gamification_system: mv_global_leaderboard (1h), mv_classroom_leaderboard (30m),
 *   mv_weekly_leaderboard (1h), mv_mechanic_leaderboard (2h)
 * - admin_dashboard: system_overview_mv, user_analytics_mv, classroom_summary_mv (30m)
 *
 * @created 2026-02-05 (Sprint 5 - BATCH-8)
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class MaterializedViewsCronService {
  private readonly logger = new Logger(MaterializedViewsCronService.name);

  constructor(
    @InjectDataSource('gamification')
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Refresh classroom leaderboard + admin dashboard MVs
   * Runs every 30 minutes
   */
  @Cron('*/30 * * * *', {
    name: 'refresh-classroom-leaderboard',
    timeZone: 'America/Mexico_City',
  })
  async handleClassroomLeaderboardRefresh(): Promise<void> {
    await this.refreshMV(
      'gamification_system.mv_classroom_leaderboard',
      'refresh-classroom-leaderboard',
    );
    await this.refreshAdminDashboards();
  }

  /**
   * Refresh global + weekly leaderboards
   * Runs every hour at minute 15
   */
  @Cron('15 * * * *', {
    name: 'refresh-hourly-leaderboards',
    timeZone: 'America/Mexico_City',
  })
  async handleHourlyLeaderboardRefresh(): Promise<void> {
    await this.refreshMV(
      'gamification_system.mv_global_leaderboard',
      'refresh-global-leaderboard',
    );
    await this.refreshMV(
      'gamification_system.mv_weekly_leaderboard',
      'refresh-weekly-leaderboard',
    );
  }

  /**
   * Refresh mechanic leaderboard
   * Runs every 2 hours at minute 45
   */
  @Cron('45 */2 * * *', {
    name: 'refresh-mechanic-leaderboard',
    timeZone: 'America/Mexico_City',
  })
  async handleMechanicLeaderboardRefresh(): Promise<void> {
    await this.refreshMV(
      'gamification_system.mv_mechanic_leaderboard',
      'refresh-mechanic-leaderboard',
    );
  }

  /**
   * Weekly stats reset + leaderboard refresh
   * Runs every Monday at 00:00 Mexico City time
   */
  @Cron('0 0 * * 1', {
    name: 'weekly-stats-reset',
    timeZone: 'America/Mexico_City',
  })
  async handleWeeklyStatsReset(): Promise<void> {
    const jobName = 'weekly-stats-reset';
    const startTime = Date.now();

    try {
      this.logger.log(`[CRON:${jobName}] Starting weekly stats reset...`);

      await this.dataSource.query(`
        UPDATE gamification_system.user_stats
        SET weekly_xp = 0, weekly_exercises = 0
        WHERE weekly_xp > 0 OR weekly_exercises > 0
      `);

      this.logger.log(`[CRON:${jobName}] Weekly stats reset complete`);

      await this.refreshMV(
        'gamification_system.mv_weekly_leaderboard',
        jobName,
      );

      const duration = Date.now() - startTime;
      this.logger.log(`[CRON:${jobName}] Completed in ${duration}ms`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`[CRON:${jobName}] Failed: ${message}`);
    }
  }

  /**
   * Refresh a single materialized view concurrently
   */
  private async refreshMV(mvName: string, jobContext: string): Promise<void> {
    const startTime = Date.now();

    try {
      this.logger.debug(`[CRON:${jobContext}] Refreshing ${mvName}...`);
      await this.dataSource.query(
        `REFRESH MATERIALIZED VIEW CONCURRENTLY ${mvName}`,
      );
      const duration = Date.now() - startTime;
      this.logger.log(
        `[CRON:${jobContext}] Refreshed ${mvName} in ${duration}ms`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `[CRON:${jobContext}] Failed to refresh ${mvName}: ${message}`,
      );
    }
  }

  /**
   * Refresh all admin dashboard MVs via SQL function
   */
  private async refreshAdminDashboards(): Promise<void> {
    const startTime = Date.now();

    try {
      this.logger.debug(
        '[CRON:refresh-admin-dashboards] Refreshing admin dashboard MVs...',
      );
      await this.dataSource.query(
        'SELECT admin_dashboard.refresh_all_dashboards()',
      );
      const duration = Date.now() - startTime;
      this.logger.log(
        `[CRON:refresh-admin-dashboards] Admin dashboards refreshed in ${duration}ms`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `[CRON:refresh-admin-dashboards] Failed: ${message}`,
      );
    }
  }
}
