import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import {
  ModerationQueueItemDto,
  PaginatedModerationQueueDto,
  ClassroomOverviewDto,
  PaginatedClassroomOverviewDto,
  AssignmentSubmissionStatsDto,
  PaginatedAssignmentSubmissionStatsDto,
  UserActivityDto,
  UserActivityDataPointDto,
  UserActivityQueryDto,
  GroupByEnum,
} from '../../dto/dashboard';

/**
 * Query builder service for admin dashboard queries.
 * Encapsulates complex SQL queries and provides type-safe query building methods.
 *
 * Responsibilities:
 * - Build complex SQL queries using TypeORM QueryBuilder
 * - Provide reusable query patterns
 * - Encapsulate database view queries
 * - Handle query parameter sanitization
 */
@Injectable()
export class AdminQueryBuilder {
  constructor(
    @InjectDataSource('auth')
    private readonly authConnection: DataSource,
  ) {}

  /**
   * Get content moderation queue from admin_dashboard.moderation_queue view.
   * Returns flagged content items that require admin review.
   *
   * @param limit - Maximum number of items to return
   * @returns Paginated moderation queue data
   */
  async getModerationQueue(limit: number = 50): Promise<PaginatedModerationQueueDto> {
    try {
      const results = await this.authConnection.query(
        `SELECT
          id,
          content_type,
          content_id,
          content_preview,
          reason,
          priority,
          status,
          created_at,
          reporter_email,
          reporter_name
         FROM admin_dashboard.moderation_queue
         LIMIT $1`,
        [limit],
      );

      const data: ModerationQueueItemDto[] = results.map((row: any) => ({
        id: row.id,
        content_type: row.content_type,
        content_id: row.content_id,
        content_preview: row.content_preview,
        reason: row.reason,
        priority: row.priority,
        status: row.status,
        created_at: row.created_at instanceof Date
          ? row.created_at.toISOString()
          : row.created_at,
        reporter_email: row.reporter_email,
        reporter_name: row.reporter_name,
      }));

      // Get total count of pending moderation items
      const countResult = await this.authConnection.query(
        "SELECT COUNT(*) as count FROM content_management.flagged_content WHERE status = 'pending'",
      );
      const total = parseInt(countResult[0]?.count || '0', 10);

      return {
        data,
        total,
        limit,
      };
    } catch (error) {
      console.error('Error fetching moderation queue:', error);
      // Return empty queue if table doesn't exist
      return {
        data: [],
        total: 0,
        limit,
      };
    }
  }

  /**
   * Get classroom overview statistics from admin_dashboard.classroom_overview view.
   * Provides comprehensive classroom metrics including student counts and assignment stats.
   *
   * @param limit - Maximum number of classrooms to return
   * @returns Paginated classroom overview data
   */
  async getClassroomOverview(limit: number = 100): Promise<PaginatedClassroomOverviewDto> {
    try {
      const results = await this.authConnection.query(
        `SELECT
          classroom_id,
          classroom_name,
          classroom_description,
          teacher_id,
          teacher_name,
          total_students,
          active_students,
          inactive_students,
          total_assignments,
          pending_assignments,
          upcoming_deadline_assignments,
          total_exercises,
          avg_class_progress_percent,
          last_updated,
          classroom_created_at,
          classroom_status
         FROM admin_dashboard.classroom_overview
         ORDER BY classroom_name
         LIMIT $1`,
        [limit],
      );

      const data: ClassroomOverviewDto[] = results.map((row: any) => ({
        classroom_id: row.classroom_id,
        classroom_name: row.classroom_name,
        classroom_description: row.classroom_description,
        teacher_id: row.teacher_id,
        teacher_name: row.teacher_name,
        total_students: parseInt(row.total_students || '0', 10),
        active_students: parseInt(row.active_students || '0', 10),
        inactive_students: parseInt(row.inactive_students || '0', 10),
        total_assignments: parseInt(row.total_assignments || '0', 10),
        pending_assignments: parseInt(row.pending_assignments || '0', 10),
        upcoming_deadline_assignments: parseInt(row.upcoming_deadline_assignments || '0', 10),
        total_exercises: parseInt(row.total_exercises || '0', 10),
        avg_class_progress_percent: parseFloat(row.avg_class_progress_percent || '0'),
        last_updated: row.last_updated instanceof Date
          ? row.last_updated.toISOString()
          : row.last_updated,
        classroom_created_at: row.classroom_created_at instanceof Date
          ? row.classroom_created_at.toISOString()
          : row.classroom_created_at,
        classroom_status: row.classroom_status,
      }));

      // Get total count of classrooms
      const countResult = await this.authConnection.query(
        'SELECT COUNT(*) as count FROM social_features.classrooms WHERE is_deleted = FALSE',
      );
      const total = parseInt(countResult[0]?.count || '0', 10);

      return {
        data,
        total,
        limit,
      };
    } catch (error) {
      console.error('Error fetching classroom overview:', error);
      // Return empty list if view doesn't exist
      return {
        data: [],
        total: 0,
        limit,
      };
    }
  }

  /**
   * Get assignment submission statistics from admin_dashboard.assignment_submission_stats view.
   * Provides detailed metrics on assignment completion and grading.
   *
   * @param limit - Maximum number of assignments to return
   * @returns Paginated assignment submission statistics
   */
  async getAssignmentSubmissionStats(limit: number = 100): Promise<PaginatedAssignmentSubmissionStatsDto> {
    try {
      const results = await this.authConnection.query(
        `SELECT
          assignment_id,
          assignment_title,
          assignment_type,
          assignment_max_points,
          classroom_id,
          classroom_name,
          total_submissions,
          completed_submissions,
          in_progress_submissions,
          not_started_submissions,
          graded_submissions,
          submission_rate_percent,
          avg_score,
          max_score_achieved,
          min_score_achieved,
          assignment_created_at,
          assignment_due_date,
          classroom_deadline_override,
          total_students_in_classroom
         FROM admin_dashboard.assignment_submission_stats
         ORDER BY assignment_created_at DESC
         LIMIT $1`,
        [limit],
      );

      const data: AssignmentSubmissionStatsDto[] = results.map((row: any) => ({
        assignment_id: row.assignment_id,
        assignment_title: row.assignment_title,
        assignment_type: row.assignment_type,
        assignment_max_points: row.assignment_max_points,
        classroom_id: row.classroom_id,
        classroom_name: row.classroom_name,
        total_submissions: parseInt(row.total_submissions || '0', 10),
        completed_submissions: parseInt(row.completed_submissions || '0', 10),
        in_progress_submissions: parseInt(row.in_progress_submissions || '0', 10),
        not_started_submissions: parseInt(row.not_started_submissions || '0', 10),
        graded_submissions: parseInt(row.graded_submissions || '0', 10),
        submission_rate_percent: row.submission_rate_percent ? parseFloat(row.submission_rate_percent) : null,
        avg_score: row.avg_score ? parseFloat(row.avg_score) : null,
        max_score_achieved: row.max_score_achieved,
        min_score_achieved: row.min_score_achieved,
        assignment_created_at: row.assignment_created_at instanceof Date
          ? row.assignment_created_at.toISOString()
          : row.assignment_created_at,
        assignment_due_date: row.assignment_due_date instanceof Date
          ? row.assignment_due_date.toISOString()
          : row.assignment_due_date,
        classroom_deadline_override: row.classroom_deadline_override instanceof Date
          ? row.classroom_deadline_override.toISOString()
          : row.classroom_deadline_override,
        total_students_in_classroom: parseInt(row.total_students_in_classroom || '0', 10),
      }));

      // Get total count of assignments
      const countResult = await this.authConnection.query(
        'SELECT COUNT(*) as count FROM educational_content.assignments WHERE is_published = TRUE',
      );
      const total = parseInt(countResult[0]?.count || '0', 10);

      return {
        data,
        total,
        limit,
      };
    } catch (error) {
      console.error('Error fetching assignment submission stats:', error);
      // Return empty list if view doesn't exist
      return {
        data: [],
        total: 0,
        limit,
      };
    }
  }

  /**
   * Get user activity analytics for charts and tables.
   * Returns time-series data of user activity grouped by day/week/month.
   *
   * @param query - Query parameters (date range, grouping)
   * @returns User activity data with labels and detailed metrics
   */
  async getUserActivity(query: UserActivityQueryDto): Promise<UserActivityDto> {
    // NOTE: Properties use snake_case to match frontend apiClient interceptor
    const { start_date, end_date, group_by = GroupByEnum.DAY } = query;

    // Calculate date range (default: last 30 days)
    const start = start_date
      ? new Date(start_date)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = end_date
      ? new Date(end_date)
      : new Date();

    try {
      // Determine SQL date format based on grouping
      let dateFormat: string;
      let dateTrunc: string;

      switch (group_by) {
        case GroupByEnum.WEEK:
          dateFormat = 'YYYY-"W"IW'; // Format: 2025-W47
          dateTrunc = 'week';
          break;
        case GroupByEnum.MONTH:
          dateFormat = 'YYYY-MM'; // Format: 2025-11
          dateTrunc = 'month';
          break;
        case GroupByEnum.DAY:
        default:
          dateFormat = 'YYYY-MM-DD'; // Format: 2025-11-23
          dateTrunc = 'day';
          break;
      }

      // Query comprehensive user activity metrics grouped by time period
      const activityData = await this.authConnection.query(
        `WITH date_series AS (
          SELECT generate_series(
            DATE_TRUNC($3, $1::timestamp),
            DATE_TRUNC($3, $2::timestamp),
            ('1 ' || $3)::interval
          ) AS period_date
        ),
        user_logins AS (
          SELECT
            DATE_TRUNC($3, last_sign_in_at) as period_date,
            COUNT(DISTINCT id) as active_users
          FROM auth.users
          WHERE last_sign_in_at >= $1
            AND last_sign_in_at <= $2
            AND deleted_at IS NULL
          GROUP BY DATE_TRUNC($3, last_sign_in_at)
        ),
        new_users AS (
          SELECT
            DATE_TRUNC($3, created_at) as period_date,
            COUNT(*) as new_registrations
          FROM auth.users
          WHERE created_at >= $1
            AND created_at <= $2
            AND deleted_at IS NULL
          GROUP BY DATE_TRUNC($3, created_at)
        ),
        activity_sessions AS (
          SELECT
            DATE_TRUNC($3, created_at) as period_date,
            COUNT(DISTINCT CONCAT(user_id::text, '-', DATE_TRUNC('hour', created_at)::text)) as total_sessions,
            AVG(EXTRACT(EPOCH FROM (created_at - LAG(created_at) OVER (PARTITION BY user_id ORDER BY created_at)))/60) as avg_duration
          FROM audit_logging.activity_log
          WHERE created_at >= $1
            AND created_at <= $2
          GROUP BY DATE_TRUNC($3, created_at)
        )
        SELECT
          TO_CHAR(ds.period_date, $4) as period,
          ds.period_date,
          COALESCE(ul.active_users, 0) as active_users,
          COALESCE(nu.new_registrations, 0) as new_registrations,
          COALESCE(ases.total_sessions, 0) as total_sessions,
          COALESCE(ases.avg_duration, 0) as avg_session_duration
        FROM date_series ds
        LEFT JOIN user_logins ul ON ds.period_date = ul.period_date
        LEFT JOIN new_users nu ON ds.period_date = nu.period_date
        LEFT JOIN activity_sessions ases ON ds.period_date = ases.period_date
        ORDER BY ds.period_date ASC`,
        [start, end, dateTrunc, dateFormat],
      );

      // If no data, return empty structure
      if (activityData.length === 0) {
        return {
          labels: [],
          data: [],
          tableData: [],
        };
      }

      // Build labels and data for chart
      const labels = activityData.map((row: any) => row.period || '');
      const data = activityData.map((row: any) => parseInt(row.active_users || '0', 10));

      // Build detailed table data
      const tableData: UserActivityDataPointDto[] = activityData.map((row: any) => ({
        date: row.period,
        activeUsers: parseInt(row.active_users || '0', 10),
        newRegistrations: parseInt(row.new_registrations || '0', 10),
        totalSessions: parseInt(row.total_sessions || '0', 10),
        avgSessionDuration: parseFloat((row.avg_session_duration || 0).toFixed(1)),
      }));

      return {
        labels,
        data,
        tableData,
      };
    } catch (error) {
      console.error('Error fetching user activity analytics:', error);
      // Return empty data on error
      return {
        labels: [],
        data: [],
        tableData: [],
      };
    }
  }
}
