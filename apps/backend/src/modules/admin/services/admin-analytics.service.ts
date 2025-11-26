import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  AnalyticsOverviewDto,
  EngagementAnalyticsDto,
  EngagementBySegmentDto,
  EngagementQueryDto,
  GamificationAnalyticsDto,
  XpDistributionDto,
  RankDistributionDto,
  LevelDistributionDto,
  ActivityTimelineDto,
  DailyActivityDto,
  TimelineQueryDto,
  TopUsersDto,
  TopUserDto,
  TopUsersQueryDto,
  RetentionAnalyticsDto,
  CohortRetentionDto,
} from '../dto/analytics';

/**
 * Service for admin analytics operations
 * Uses materialized view for optimized performance
 */
@Injectable()
export class AdminAnalyticsService {
  private readonly logger = new Logger(AdminAnalyticsService.name);

  constructor(
    @InjectDataSource('auth')
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Get analytics overview with high-level metrics
   * @returns Analytics overview with user counts, averages, and segmentation
   */
  async getAnalyticsOverview(): Promise<AnalyticsOverviewDto> {
    try {
      const query = `
        SELECT
          COUNT(*) as total_users,
          COUNT(*) FILTER (WHERE role = 'student') as total_students,
          COUNT(*) FILTER (WHERE role = 'admin_teacher') as total_teachers,
          COUNT(*) FILTER (WHERE status = 'ACTIVE') as active_users,
          AVG(total_xp) as avg_xp,
          AVG(exercises_completed) as avg_exercises_completed,
          AVG(engagement_score) as avg_engagement_score,
          COUNT(*) FILTER (WHERE user_segment = 'inactive') as inactive_users,
          COUNT(*) FILTER (WHERE user_segment = 'beginner') as beginner_users,
          COUNT(*) FILTER (WHERE user_segment = 'intermediate') as intermediate_users,
          COUNT(*) FILTER (WHERE user_segment = 'advanced') as advanced_users
        FROM admin_dashboard.user_analytics_mv;
      `;

      const result = await this.dataSource.query(query);

      if (!result || result.length === 0) {
        throw new Error('No analytics data available');
      }

      const row = result[0];

      return {
        total_users: parseInt(row.total_users, 10) || 0,
        total_students: parseInt(row.total_students, 10) || 0,
        total_teachers: parseInt(row.total_teachers, 10) || 0,
        active_users: parseInt(row.active_users, 10) || 0,
        avg_xp: parseFloat(row.avg_xp) || 0,
        avg_exercises_completed: parseFloat(row.avg_exercises_completed) || 0,
        avg_engagement_score: parseFloat(row.avg_engagement_score) || 0,
        inactive_users: parseInt(row.inactive_users, 10) || 0,
        beginner_users: parseInt(row.beginner_users, 10) || 0,
        intermediate_users: parseInt(row.intermediate_users, 10) || 0,
        advanced_users: parseInt(row.advanced_users, 10) || 0,
      };
    } catch (error: any) {
      this.logger.error(`Failed to get analytics overview: ${error?.message}`, error?.stack);
      throw new InternalServerErrorException('Failed to retrieve analytics overview');
    }
  }

  /**
   * Get engagement analytics grouped by user segment
   * @param query Optional filters for role and registration date
   * @returns Engagement metrics by segment (inactive, beginner, intermediate, advanced)
   */
  async getEngagementAnalytics(query: EngagementQueryDto): Promise<EngagementAnalyticsDto> {
    try {
      const sqlQuery = `
        SELECT
          user_segment,
          COUNT(*) as users_count,
          AVG(engagement_score) as avg_engagement_score,
          AVG(exercises_completed) as avg_exercises_completed,
          AVG(current_streak) as avg_streak,
          COUNT(*) FILTER (WHERE last_activity_at >= NOW() - INTERVAL '7 days') as active_last_7d,
          COUNT(*) FILTER (WHERE last_activity_at >= NOW() - INTERVAL '30 days') as active_last_30d
        FROM admin_dashboard.user_analytics_mv
        WHERE
          ($1::text IS NULL OR role = $1) AND
          ($2::timestamp IS NULL OR registered_at >= $2)
        GROUP BY user_segment
        ORDER BY
          CASE user_segment
            WHEN 'advanced' THEN 1
            WHEN 'intermediate' THEN 2
            WHEN 'beginner' THEN 3
            WHEN 'inactive' THEN 4
          END;
      `;

      const params = [
        query.role || null,
        query.date_from || null,
      ];

      const results = await this.dataSource.query(sqlQuery, params);

      const bySegment: EngagementBySegmentDto[] = results.map((row: any) => ({
        user_segment: row.user_segment,
        users_count: parseInt(row.users_count, 10) || 0,
        avg_engagement_score: parseFloat(row.avg_engagement_score) || 0,
        avg_exercises_completed: parseFloat(row.avg_exercises_completed) || 0,
        avg_streak: parseFloat(row.avg_streak) || 0,
        active_last_7d: parseInt(row.active_last_7d, 10) || 0,
        active_last_30d: parseInt(row.active_last_30d, 10) || 0,
      }));

      return { by_segment: bySegment };
    } catch (error: any) {
      this.logger.error(`Failed to get engagement analytics: ${error?.message}`, error?.stack);
      throw new InternalServerErrorException('Failed to retrieve engagement analytics');
    }
  }

  /**
   * Get gamification analytics including XP, ranks, and levels distribution
   * @returns Comprehensive gamification distribution data
   */
  async getGamificationAnalytics(): Promise<GamificationAnalyticsDto> {
    try {
      // XP Distribution Query
      const xpQuery = `
        SELECT
          CASE
            WHEN total_xp = 0 THEN '0 XP'
            WHEN total_xp <= 100 THEN '1-100 XP'
            WHEN total_xp <= 500 THEN '101-500 XP'
            WHEN total_xp <= 1000 THEN '501-1000 XP'
            WHEN total_xp <= 5000 THEN '1001-5000 XP'
            ELSE '5000+ XP'
          END as xp_range,
          COUNT(*) as users_count
        FROM admin_dashboard.user_analytics_mv
        GROUP BY xp_range
        ORDER BY MIN(total_xp);
      `;

      // Ranks Distribution Query
      const ranksQuery = `
        SELECT
          current_rank,
          COUNT(*) as users_count,
          AVG(total_xp) as avg_xp,
          AVG(exercises_completed) as avg_exercises
        FROM admin_dashboard.user_analytics_mv
        GROUP BY current_rank
        ORDER BY AVG(total_xp) DESC;
      `;

      // Levels Distribution Query
      const levelsQuery = `
        SELECT
          current_level,
          COUNT(*) as users_count
        FROM admin_dashboard.user_analytics_mv
        GROUP BY current_level
        ORDER BY current_level;
      `;

      // Execute all queries in parallel
      const [xpResults, ranksResults, levelsResults] = await Promise.all([
        this.dataSource.query(xpQuery),
        this.dataSource.query(ranksQuery),
        this.dataSource.query(levelsQuery),
      ]);

      const xpDistribution: XpDistributionDto[] = xpResults.map((row: any) => ({
        xp_range: row.xp_range,
        users_count: parseInt(row.users_count, 10) || 0,
      }));

      const ranksDistribution: RankDistributionDto[] = ranksResults.map((row: any) => ({
        current_rank: row.current_rank,
        users_count: parseInt(row.users_count, 10) || 0,
        avg_xp: parseFloat(row.avg_xp) || 0,
        avg_exercises: parseFloat(row.avg_exercises) || 0,
      }));

      const levelsDistribution: LevelDistributionDto[] = levelsResults.map((row: any) => ({
        current_level: parseInt(row.current_level, 10) || 1,
        users_count: parseInt(row.users_count, 10) || 0,
      }));

      return {
        xp_distribution: xpDistribution,
        ranks_distribution: ranksDistribution,
        levels_distribution: levelsDistribution,
      };
    } catch (error: any) {
      this.logger.error(`Failed to get gamification analytics: ${error?.message}`, error?.stack);
      throw new InternalServerErrorException('Failed to retrieve gamification analytics');
    }
  }

  /**
   * Get activity timeline for specified number of days
   * @param query Timeline parameters (days)
   * @returns Daily activity metrics ordered by date
   */
  async getActivityTimeline(query: TimelineQueryDto): Promise<ActivityTimelineDto> {
    try {
      const days = query.days || 30;

      const sqlQuery = `
        SELECT
          DATE(ual.created_at) as activity_date,
          COUNT(DISTINCT ual.user_id) as unique_users,
          COUNT(*) as total_activities,
          COUNT(*) FILTER (WHERE ual.activity_type = 'exercise_completed') as exercises_completed,
          COUNT(*) FILTER (WHERE ual.activity_type = 'module_completed') as modules_completed,
          COUNT(*) FILTER (WHERE ual.activity_type = 'login') as logins
        FROM audit_logging.user_activity_logs ual
        WHERE ual.created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY DATE(ual.created_at)
        ORDER BY activity_date DESC;
      `;

      const results = await this.dataSource.query(sqlQuery);

      const timeline: DailyActivityDto[] = results.map((row: any) => ({
        activity_date: row.activity_date,
        unique_users: parseInt(row.unique_users, 10) || 0,
        total_activities: parseInt(row.total_activities, 10) || 0,
        exercises_completed: parseInt(row.exercises_completed, 10) || 0,
        modules_completed: parseInt(row.modules_completed, 10) || 0,
        logins: parseInt(row.logins, 10) || 0,
      }));

      return { timeline };
    } catch (error: any) {
      this.logger.error(`Failed to get activity timeline: ${error?.message}`, error?.stack);
      throw new InternalServerErrorException('Failed to retrieve activity timeline');
    }
  }

  /**
   * Get top users by specified metric (xp, exercises, streak)
   * @param query Top users parameters (metric, role filter, limit)
   * @returns List of top users ordered by metric
   */
  async getTopUsers(query: TopUsersQueryDto): Promise<TopUsersDto> {
    try {
      const { metric, role, limit = 10 } = query;

      // Determine ORDER BY clause based on metric
      let orderByClause: string;
      switch (metric) {
        case 'xp':
          orderByClause = 'total_xp DESC';
          break;
        case 'exercises':
          orderByClause = 'exercises_completed DESC';
          break;
        case 'streak':
          orderByClause = 'current_streak DESC';
          break;
        default:
          orderByClause = 'total_xp DESC';
      }

      const sqlQuery = `
        SELECT
          user_id,
          display_name,
          email,
          role,
          total_xp,
          exercises_completed,
          current_streak,
          current_rank,
          current_level,
          engagement_score
        FROM admin_dashboard.user_analytics_mv
        WHERE ($1::text IS NULL OR role = $1)
        ORDER BY ${orderByClause}
        LIMIT $2;
      `;

      const params = [role || null, limit];

      const results = await this.dataSource.query(sqlQuery, params);

      const users: TopUserDto[] = results.map((row: any) => ({
        user_id: row.user_id,
        display_name: row.display_name,
        email: row.email,
        role: row.role,
        total_xp: parseInt(row.total_xp, 10) || 0,
        exercises_completed: parseInt(row.exercises_completed, 10) || 0,
        current_streak: parseInt(row.current_streak, 10) || 0,
        current_rank: row.current_rank,
        current_level: parseInt(row.current_level, 10) || 1,
        engagement_score: parseFloat(row.engagement_score) || 0,
      }));

      return { metric, users };
    } catch (error: any) {
      this.logger.error(`Failed to get top users: ${error?.message}`, error?.stack);
      throw new InternalServerErrorException('Failed to retrieve top users');
    }
  }

  /**
   * Get retention analytics by cohort
   * @returns Cohort retention metrics for last 12 months
   */
  async getRetentionAnalytics(): Promise<RetentionAnalyticsDto> {
    try {
      const sqlQuery = `
        WITH cohorts AS (
          SELECT
            DATE_TRUNC('month', registered_at) as cohort_month,
            user_id
          FROM admin_dashboard.user_analytics_mv
          WHERE registered_at >= NOW() - INTERVAL '12 months'
        ),
        activity AS (
          SELECT
            DATE_TRUNC('month', last_activity_at) as activity_month,
            user_id
          FROM admin_dashboard.user_analytics_mv
          WHERE last_activity_at IS NOT NULL
        )
        SELECT
          c.cohort_month,
          COUNT(DISTINCT c.user_id) as cohort_size,
          COUNT(DISTINCT CASE WHEN a.activity_month >= c.cohort_month THEN a.user_id END) as retained_users,
          ROUND(
            100.0 * COUNT(DISTINCT CASE WHEN a.activity_month >= c.cohort_month THEN a.user_id END) /
            NULLIF(COUNT(DISTINCT c.user_id), 0),
            2
          ) as retention_rate
        FROM cohorts c
        LEFT JOIN activity a ON c.user_id = a.user_id
        GROUP BY c.cohort_month
        ORDER BY c.cohort_month DESC;
      `;

      const results = await this.dataSource.query(sqlQuery);

      const cohorts: CohortRetentionDto[] = results.map((row: any) => ({
        cohort_month: row.cohort_month,
        cohort_size: parseInt(row.cohort_size, 10) || 0,
        retained_users: parseInt(row.retained_users, 10) || 0,
        retention_rate: parseFloat(row.retention_rate) || 0,
      }));

      return { cohorts };
    } catch (error: any) {
      this.logger.error(`Failed to get retention analytics: ${error?.message}`, error?.stack);
      throw new InternalServerErrorException('Failed to retrieve retention analytics');
    }
  }

  /**
   * Export analytics data as CSV
   * @param type Type of data to export (overview, users, engagement, gamification)
   * @returns CSV string with headers and data
   */
  async exportAnalytics(type: string): Promise<string> {
    try {
      switch (type) {
        case 'overview':
          return await this.exportOverviewCsv();
        case 'users':
          return await this.exportUsersCsv();
        case 'engagement':
          return await this.exportEngagementCsv();
        case 'gamification':
          return await this.exportGamificationCsv();
        default:
          throw new Error(`Unknown export type: ${type}`);
      }
    } catch (error: any) {
      this.logger.error(`Failed to export analytics: ${error?.message}`, error?.stack);
      throw new InternalServerErrorException('Failed to export analytics data');
    }
  }

  /**
   * Export overview data as CSV
   * @private
   */
  private async exportOverviewCsv(): Promise<string> {
    const data = await this.getAnalyticsOverview();

    const headers = [
      'Metric',
      'Value',
    ];

    const rows = [
      ['Total Users', data.total_users],
      ['Total Students', data.total_students],
      ['Total Teachers', data.total_teachers],
      ['Active Users', data.active_users],
      ['Average XP', data.avg_xp.toFixed(2)],
      ['Average Exercises Completed', data.avg_exercises_completed.toFixed(2)],
      ['Average Engagement Score', data.avg_engagement_score.toFixed(2)],
      ['Inactive Users', data.inactive_users],
      ['Beginner Users', data.beginner_users],
      ['Intermediate Users', data.intermediate_users],
      ['Advanced Users', data.advanced_users],
    ];

    return this.generateCsv(headers, rows);
  }

  /**
   * Export all users data as CSV
   * @private
   */
  private async exportUsersCsv(): Promise<string> {
    const query = `
      SELECT
        user_id,
        display_name,
        email,
        role,
        status,
        total_xp,
        current_level,
        current_rank,
        ml_coins,
        exercises_completed,
        missions_completed,
        current_streak,
        engagement_score,
        user_segment,
        registered_at,
        last_activity_at
      FROM admin_dashboard.user_analytics_mv
      ORDER BY total_xp DESC;
    `;

    const results = await this.dataSource.query(query);

    const headers = [
      'User ID',
      'Display Name',
      'Email',
      'Role',
      'Status',
      'Total XP',
      'Level',
      'Rank',
      'ML Coins',
      'Exercises Completed',
      'Missions Completed',
      'Current Streak',
      'Engagement Score',
      'User Segment',
      'Registered At',
      'Last Activity At',
    ];

    const rows = results.map((row: any) => [
      row.user_id,
      row.display_name,
      row.email,
      row.role,
      row.status,
      row.total_xp,
      row.current_level,
      row.current_rank,
      row.ml_coins,
      row.exercises_completed,
      row.missions_completed,
      row.current_streak,
      row.engagement_score,
      row.user_segment,
      row.registered_at,
      row.last_activity_at || 'N/A',
    ]);

    return this.generateCsv(headers, rows);
  }

  /**
   * Export engagement data as CSV
   * @private
   */
  private async exportEngagementCsv(): Promise<string> {
    const data = await this.getEngagementAnalytics({});

    const headers = [
      'User Segment',
      'Users Count',
      'Avg Engagement Score',
      'Avg Exercises Completed',
      'Avg Streak',
      'Active Last 7 Days',
      'Active Last 30 Days',
    ];

    const rows = data.by_segment.map((segment) => [
      segment.user_segment,
      segment.users_count,
      segment.avg_engagement_score.toFixed(2),
      segment.avg_exercises_completed.toFixed(2),
      segment.avg_streak.toFixed(2),
      segment.active_last_7d,
      segment.active_last_30d,
    ]);

    return this.generateCsv(headers, rows);
  }

  /**
   * Export gamification data as CSV
   * @private
   */
  private async exportGamificationCsv(): Promise<string> {
    const data = await this.getGamificationAnalytics();

    // Create sections for XP, Ranks, and Levels
    let csv = '';

    // XP Distribution
    csv += 'XP DISTRIBUTION\n';
    csv += this.generateCsv(
      ['XP Range', 'Users Count'],
      data.xp_distribution.map((d) => [d.xp_range, d.users_count]),
    );
    csv += '\n\n';

    // Ranks Distribution
    csv += 'RANKS DISTRIBUTION\n';
    csv += this.generateCsv(
      ['Rank', 'Users Count', 'Avg XP', 'Avg Exercises'],
      data.ranks_distribution.map((d) => [
        d.current_rank,
        d.users_count,
        d.avg_xp.toFixed(2),
        d.avg_exercises.toFixed(2),
      ]),
    );
    csv += '\n\n';

    // Levels Distribution
    csv += 'LEVELS DISTRIBUTION\n';
    csv += this.generateCsv(
      ['Level', 'Users Count'],
      data.levels_distribution.map((d) => [d.current_level, d.users_count]),
    );

    return csv;
  }

  /**
   * Generate CSV string from headers and rows
   * @private
   */
  private generateCsv(headers: string[], rows: any[][]): string {
    const escapeCsvValue = (value: any): string => {
      if (value === null || value === undefined) {
        return '';
      }
      const stringValue = String(value);
      // Escape double quotes and wrap in quotes if contains comma, newline, or quote
      if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    const csvRows = [
      headers.map(escapeCsvValue).join(','),
      ...rows.map((row) => row.map(escapeCsvValue).join(',')),
    ];

    return csvRows.join('\n');
  }
}
