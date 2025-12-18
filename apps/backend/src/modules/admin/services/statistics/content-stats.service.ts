import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { OrganizationStatsSummaryDto } from '../../dto/dashboard';

/**
 * Service responsible for content and organization statistics.
 * Handles counting and tracking of educational content and organizations.
 *
 * Responsibilities:
 * - Track exercise completion statistics
 * - Count content items (modules, exercises, assignments)
 * - Provide organization statistics
 * - Monitor content approval and moderation metrics
 */
@Injectable()
export class ContentStatsService {
  constructor(
    @InjectDataSource('auth')
    private readonly authConnection: DataSource,
  ) {}

  /**
   * Get exercises completed in the last 24 hours.
   * Estimates based on activity log entries related to exercises.
   *
   * @param since - Date threshold for counting
   * @returns Count of completed exercises
   */
  async getExercisesCompleted24h(since: Date): Promise<number> {
    try {
      const result = await this.authConnection
        .createQueryBuilder()
        .select('COUNT(*)', 'count')
        .from('audit_logging.activity_log', 'al')
        .where("al.action_type LIKE '%exercise%'")
        .andWhere('al.created_at > :since', { since })
        .getRawOne();

      return parseInt(result?.count || '0', 10);
    } catch (error) {
      console.error('Error fetching exercises completed:', error);
      return 0;
    }
  }

  /**
   * Get aggregated organization statistics from admin_dashboard.organization_stats_summary view.
   * Provides metrics on organizations including active status and growth.
   *
   * @returns Organization statistics summary
   */
  async getOrganizationStatsSummary(): Promise<OrganizationStatsSummaryDto> {
    try {
      const [stats] = await this.authConnection.query(
        'SELECT * FROM admin_dashboard.organization_stats_summary',
      );

      if (!stats) {
        return {
          total_organizations: 0,
          active_organizations: 0,
          new_organizations_month: 0,
        };
      }

      return {
        total_organizations: parseInt(stats.total_organizations || '0', 10),
        active_organizations: parseInt(stats.active_organizations || '0', 10),
        new_organizations_month: parseInt(stats.new_organizations_month || '0', 10),
      };
    } catch (error) {
      console.error('Error fetching organization stats summary:', error);
      throw error;
    }
  }

  /**
   * Count pending content approvals.
   *
   * @returns Count of content items pending approval
   */
  async getPendingApprovalsCount(): Promise<number> {
    try {
      const result = await this.authConnection.query(
        `SELECT COUNT(*) as count
         FROM educational_content.content_approvals
         WHERE status = 'pending'`,
      );

      return parseInt(result[0]?.count || '0', 10);
    } catch (error) {
      console.error('Error fetching pending approvals count:', error);
      return 0;
    }
  }

  /**
   * Count flagged content items requiring moderation.
   *
   * @returns Count of flagged content items
   */
  async getFlaggedContentCount(): Promise<number> {
    try {
      const result = await this.authConnection.query(
        `SELECT COUNT(*) as count
         FROM content_management.flagged_content
         WHERE status = 'pending'`,
      );

      return parseInt(result[0]?.count || '0', 10);
    } catch (error) {
      console.error('Error fetching flagged content count:', error);
      return 0;
    }
  }

  /**
   * Get content statistics for a specific time period.
   *
   * @param days - Number of days to look back
   * @returns Object with content creation and modification statistics
   */
  async getContentActivityStats(days: number): Promise<{
    newModules: number;
    newExercises: number;
    newAssignments: number;
  }> {
    try {
      const [modulesResult, exercisesResult, assignmentsResult] = await Promise.all([
        this.authConnection.query(
          `SELECT COUNT(*) as count
           FROM educational_content.modules
           WHERE created_at >= NOW() - INTERVAL '${days} days'`,
        ),
        this.authConnection.query(
          `SELECT COUNT(*) as count
           FROM educational_content.exercises
           WHERE created_at >= NOW() - INTERVAL '${days} days'`,
        ),
        this.authConnection.query(
          `SELECT COUNT(*) as count
           FROM educational_content.assignments
           WHERE created_at >= NOW() - INTERVAL '${days} days'`,
        ),
      ]);

      return {
        newModules: parseInt(modulesResult[0]?.count || '0', 10),
        newExercises: parseInt(exercisesResult[0]?.count || '0', 10),
        newAssignments: parseInt(assignmentsResult[0]?.count || '0', 10),
      };
    } catch (error) {
      console.error('Error fetching content activity stats:', error);
      return {
        newModules: 0,
        newExercises: 0,
        newAssignments: 0,
      };
    }
  }
}
