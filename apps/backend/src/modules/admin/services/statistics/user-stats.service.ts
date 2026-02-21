import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { User } from '@modules/auth/entities/user.entity';
import { UserStatsSummaryDto } from '../../dto/dashboard';
import { AdminQueryBuilder } from '../query-builders/admin.query-builder';

/**
 * Service responsible for user statistics and metrics.
 * Handles all user-related counting, aggregations, and activity tracking.
 *
 * Responsibilities:
 * - Count users by various criteria (total, active, new, by role)
 * - Track user activity and engagement
 * - Provide user statistics summaries
 */
@Injectable()
export class UserStatsService {
  private readonly logger = new Logger(UserStatsService.name);

  constructor(
    @InjectDataSource('auth')
    private readonly authConnection: DataSource,
    @InjectRepository(User, 'auth')
    private readonly userRepo: Repository<User>,
    private readonly queryBuilder: AdminQueryBuilder,
  ) {}

  /**
   * Get active users in the last 24 hours.
   * Uses activity log to count distinct users with recent activity.
   *
   * @param since - Date threshold for "active" status
   * @returns Count of active users
   */
  async getActiveUsers24h(since: Date): Promise<number> {
    try {
      const result = await this.authConnection
        .createQueryBuilder()
        .select('COUNT(DISTINCT user_id)', 'count')
        .from('audit_logging.activity_log', 'al')
        .where('al.created_at > :since', { since })
        .getRawOne();

      return parseInt(result?.count || '0', 10);
    } catch (error) {
      this.logger.error(`Error fetching active users: ${error instanceof Error ? error.message : error}`);
      return 0;
    }
  }

  /**
   * Get aggregated user statistics from admin_dashboard.user_stats_summary view.
   * Provides comprehensive user metrics including counts by role and time period.
   *
   * @returns User statistics summary with counts and breakdowns
   */
  async getUserStatsSummary(): Promise<UserStatsSummaryDto> {
    try {
      const [stats] = await this.authConnection.query(
        'SELECT * FROM admin_dashboard.user_stats_summary',
      );

      if (!stats) {
        // Return zero values if view returns no data
        return {
          total_users: 0,
          users_today: 0,
          users_this_week: 0,
          users_this_month: 0,
          active_users_today: 0,
          active_users_week: 0,
          total_students: 0,
          total_teachers: 0,
          total_admins: 0,
        };
      }

      return {
        total_users: parseInt(stats.total_users || '0', 10),
        users_today: parseInt(stats.users_today || '0', 10),
        users_this_week: parseInt(stats.users_this_week || '0', 10),
        users_this_month: parseInt(stats.users_this_month || '0', 10),
        active_users_today: parseInt(stats.active_users_today || '0', 10),
        active_users_week: parseInt(stats.active_users_week || '0', 10),
        total_students: parseInt(stats.total_students || '0', 10),
        total_teachers: parseInt(stats.total_teachers || '0', 10),
        total_admins: parseInt(stats.total_admins || '0', 10),
      };
    } catch (error) {
      this.logger.error(`Error fetching user stats summary: ${error instanceof Error ? error.message : error}`);
      throw error;
    }
  }

  /**
   * Count inactive users (no activity in specified days).
   *
   * @param days - Number of days to consider for inactivity
   * @returns Count of inactive users
   */
  async getInactiveUserCount(days: number): Promise<number> {
    try {
      const result = await this.userRepo
        .createQueryBuilder('user')
        .where('user.last_sign_in_at < NOW() - INTERVAL :days DAY', { days })
        .andWhere('user.deleted_at IS NULL')
        .getCount();

      return result;
    } catch (error) {
      this.logger.error(`Error fetching inactive user count: ${error instanceof Error ? error.message : error}`);
      return 0;
    }
  }

  /**
   * Count users with unverified emails older than specified days.
   *
   * @param days - Age threshold in days
   * @returns Count of unverified users
   */
  async getUnverifiedUserCount(days: number): Promise<number> {
    try {
      const result = await this.userRepo
        .createQueryBuilder('user')
        .where('user.email_confirmed_at IS NULL')
        .andWhere('user.created_at < NOW() - INTERVAL :days DAY', { days })
        .andWhere('user.deleted_at IS NULL')
        .getCount();

      return result;
    } catch (error) {
      this.logger.error(`Error fetching unverified user count: ${error instanceof Error ? error.message : error}`);
      return 0;
    }
  }

  /**
   * Get user engagement rate for a specific time period.
   *
   * @param days - Number of days to look back
   * @returns Object with active users, total users, and engagement rate
   */
  async getUserEngagement(days: number): Promise<{
    activeUsers: number;
    totalUsers: number;
    engagementRate: number;
  }> {
    try {
      const [activeResult, totalUsers] = await Promise.all([
        this.authConnection
          .createQueryBuilder()
          .select('COUNT(DISTINCT user_id)', 'count')
          .from('audit_logging.activity_log', 'al')
          .where('al.created_at >= NOW() - INTERVAL :days DAY', { days })
          .getRawOne(),
        this.userRepo.count(),
      ]);

      const activeUsers = parseInt(activeResult?.count || '0', 10);
      const engagementRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

      return {
        activeUsers,
        totalUsers,
        engagementRate,
      };
    } catch (error) {
      this.logger.error(`Error calculating user engagement: ${error instanceof Error ? error.message : error}`);
      return {
        activeUsers: 0,
        totalUsers: 0,
        engagementRate: 0,
      };
    }
  }
}
