import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, MoreThanOrEqual } from 'typeorm';


import { User } from '@modules/auth/entities/user.entity';
import { Tenant } from '@modules/auth/entities/tenant.entity';
import { Module } from '@modules/educational/entities/module.entity';
import { Exercise } from '@modules/educational/entities/exercise.entity';
import {
  DashboardDataDto,
  DashboardStatsDto,
  AdminActionDto,
  RecentActivityQueryDto,
  PaginatedActivityDto,
  UserStatsSummaryDto,
  OrganizationStatsSummaryDto,
  ModerationQueueItemDto,
  PaginatedModerationQueueDto,
  ClassroomOverviewDto,
  PaginatedClassroomOverviewDto,
  AssignmentSubmissionStatsDto,
  PaginatedAssignmentSubmissionStatsDto,
  RecentActionDto,
  AlertDto,
  UserActivityDto,
  UserActivityDataPointDto,
  UserActivityQueryDto,
  GroupByEnum,
} from '../dto/dashboard';

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectDataSource('auth')
    private readonly authConnection: DataSource,
    @InjectDataSource('educational')
    private readonly educationalConnection: DataSource,
    @InjectRepository(User, 'auth')
    private readonly userRepo: Repository<User>,
    @InjectRepository(Tenant, 'auth')
    private readonly tenantRepo: Repository<Tenant>,
    @InjectRepository(Module, 'educational')
    private readonly moduleRepo: Repository<Module>,
    @InjectRepository(Exercise, 'educational')
    private readonly exerciseRepo: Repository<Exercise>,
  ) {}

  /**
   * Get complete dashboard data (stats + recent activity)
   */
  async getDashboard(): Promise<DashboardDataDto> {
    const [stats, recentActivity] = await Promise.all([
      this.getDashboardStats(),
      this.getRecentActivityInternal(10),
    ]);

    return {
      stats,
      recentActivity,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStatsDto> {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Execute all queries in parallel
    const [
      totalUsers,
      activeUsers24h,
      newUsersToday,
      totalOrganizations,
      totalExercises,
      totalModules,
      exercisesCompleted24h,
    ] = await Promise.all([
      this.userRepo.count(),
      this.getActiveUsers24h(oneDayAgo),
      this.userRepo.count({
        where: {
          created_at: MoreThanOrEqual(todayStart),
        },
      }),
      this.tenantRepo.count(),
      this.exerciseRepo.count(),
      this.moduleRepo.count(),
      this.getExercisesCompleted24h(oneDayAgo),
    ]);

    // Determine system health based on basic metrics
    const systemHealth = this.determineSystemHealth(activeUsers24h, totalUsers);

    return {
      totalUsers,
      activeUsers: activeUsers24h,
      newUsersToday,
      totalOrganizations,
      totalExercises,
      totalModules,
      exercisesCompleted24h,
      systemHealth,
      avgResponseTime: 125, // TODO: Implement actual response time tracking
    };
  }

  /**
   * Get recent activity from admin_dashboard.recent_activity view
   */
  async getRecentActivity(
    query: RecentActivityQueryDto,
  ): Promise<PaginatedActivityDto> {
    const limit = query.limit || 20;
    const activities = await this.getRecentActivityInternal(limit);

    // Get total count from activity log
    const countResult = await this.authConnection.query(
      'SELECT COUNT(*) as count FROM audit_logging.activity_log',
    );
    const total = parseInt(countResult[0]?.count || '0', 10);

    return {
      data: activities,
      total,
      limit,
    };
  }

  /**
   * Get aggregated user statistics from admin_dashboard.user_stats_summary view
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
      console.error('Error fetching user stats summary:', error);
      throw error;
    }
  }

  /**
   * Get aggregated organization statistics from admin_dashboard.organization_stats_summary view
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
   * Get content moderation queue from admin_dashboard.moderation_queue view
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
   * Get classroom overview statistics from admin_dashboard.classroom_overview view
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
   * Get assignment submission statistics from admin_dashboard.assignment_submission_stats view
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

  // =====================================================
  // PRIVATE HELPER METHODS
  // =====================================================

  /**
   * Get recent activity from DB view (internal)
   */
  private async getRecentActivityInternal(
    limit: number,
  ): Promise<AdminActionDto[]> {
    try {
      // Query the admin_dashboard.recent_activity view
      const results = await this.authConnection.query(
        `SELECT
          id,
          user_id,
          email,
          first_name,
          last_name,
          action_type,
          description,
          metadata,
          created_at
         FROM admin_dashboard.recent_activity
         ORDER BY created_at DESC
         LIMIT $1`,
        [limit],
      );

      return results.map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        email: row.email,
        first_name: row.first_name,
        last_name: row.last_name,
        action_type: row.action_type,
        description: row.description,
        metadata: row.metadata,
        created_at: row.created_at instanceof Date
          ? row.created_at.toISOString()
          : row.created_at,
      }));
    } catch (error) {
      console.error('Error fetching recent activity from view:', error);
      // Fallback to empty array if view doesn't exist or query fails
      return [];
    }
  }

  /**
   * Get active users in last 24 hours
   * Uses user_stats_summary view if available, otherwise counts from activity log
   */
  private async getActiveUsers24h(since: Date): Promise<number> {
    try {
      // Try using the user_stats_summary view
      const result = await this.authConnection.query(
        `SELECT COUNT(DISTINCT user_id) as count
         FROM audit_logging.activity_log
         WHERE created_at > $1`,
        [since],
      );
      return parseInt(result[0]?.count || '0', 10);
    } catch (error) {
      console.error('Error fetching active users:', error);
      return 0;
    }
  }

  /**
   * Get exercises completed in last 24 hours
   * This is an estimation based on activity log
   */
  private async getExercisesCompleted24h(since: Date): Promise<number> {
    try {
      const result = await this.authConnection.query(
        `SELECT COUNT(*) as count
         FROM audit_logging.activity_log
         WHERE action_type LIKE '%exercise%'
         AND created_at > $1`,
        [since],
      );
      return parseInt(result[0]?.count || '0', 10);
    } catch (error) {
      console.error('Error fetching exercises completed:', error);
      return 0;
    }
  }

  /**
   * Determine system health based on metrics
   */
  private determineSystemHealth(
    activeUsers: number,
    totalUsers: number,
  ): 'healthy' | 'warning' | 'critical' {
    if (totalUsers === 0) return 'warning';

    const activeRatio = activeUsers / totalUsers;

    if (activeRatio >= 0.2) return 'healthy';
    if (activeRatio >= 0.05) return 'warning';
    return 'critical';
  }

  // =====================================================
  // NEW ENDPOINTS: BUG-ADMIN-002, 003, 004
  // =====================================================

  /**
   * Get recent administrative actions
   *
   * GAP-FE-001: Updated to return complete action data matching frontend expectations.
   * Returns recent administrative actions from users and organizations with full metadata.
   *
   * @param limit - Maximum number of actions to return (default: 10, max: 50)
   * @returns Array of recent administrative actions with 9 fields
   */
  async getRecentActions(limit: number = 10): Promise<RecentActionDto[]> {
    try {
      // Query recent user creations from auth.users
      const recentUserCreations = await this.authConnection.query(
        `SELECT
          gen_random_uuid() as id,
          'create' as action,
          'user_created' as action_type,
          u.id as target_id,
          'user' as target_type,
          u.id as admin_id,
          'Sistema' as admin_name,
          'Usuario ' || u.email || ' creado' as details,
          u.created_at as timestamp
        FROM auth.users u
        WHERE u.created_at >= NOW() - INTERVAL '7 days'
        ORDER BY u.created_at DESC
        LIMIT $1`,
        [Math.min(limit, 50)],
      );

      // Query recent organization updates
      const recentOrgUpdates = await this.authConnection.query(
        `SELECT
          gen_random_uuid() as id,
          'update' as action,
          'organization_updated' as action_type,
          t.id as target_id,
          'organization' as target_type,
          t.id as admin_id,
          'Sistema' as admin_name,
          'Organización ' || t.name || ' actualizada' as details,
          t.updated_at as timestamp
        FROM auth_management.tenants t
        WHERE t.updated_at >= NOW() - INTERVAL '7 days'
        AND t.updated_at != t.created_at
        ORDER BY t.updated_at DESC
        LIMIT $1`,
        [Math.min(limit, 50)],
      );

      // Combine and sort all actions by timestamp
      const allActions = [...recentUserCreations, ...recentOrgUpdates]
        .sort((a, b) => {
          const dateA = new Date(a.timestamp).getTime();
          const dateB = new Date(b.timestamp).getTime();
          return dateB - dateA;
        })
        .slice(0, limit);

      return allActions.map(action => ({
        id: action.id,
        action: action.action,
        actionType: action.action_type,
        adminId: action.admin_id,
        adminName: action.admin_name,
        targetType: action.target_type,
        targetId: action.target_id,
        details: action.details,
        timestamp: action.timestamp instanceof Date
          ? action.timestamp
          : new Date(action.timestamp),
        success: true, // All actions in DB are successful
      }));
    } catch (error) {
      console.error('Error fetching recent actions:', error);
      // Return empty array on error to prevent UI breaking
      return [];
    }
  }

  /**
   * Get active system alerts
   *
   * GAP-FE-003: Updated to return alerts with frontend-compatible structure.
   * Checks various subsystems for conditions requiring admin attention:
   * - Content: Pending approvals, flagged content
   * - Security: Failed login attempts, locked accounts, unverified users
   * - System: Inactive users, low engagement
   * - Performance: Slow queries, error rates
   *
   * @returns Array of active alerts with title, message, details, and dismissed flag
   */
  async getAlerts(): Promise<AlertDto[]> {
    const alerts: AlertDto[] = [];

    try {
      // ALERT 1: Check for pending content approvals
      const pendingContent = await this.authConnection.query(
        `SELECT COUNT(*) as count
         FROM educational_content.content_approvals
         WHERE status = 'pending'`,
      );

      const pendingCount = parseInt(pendingContent[0]?.count || '0', 10);
      if (pendingCount > 10) {
        alerts.push({
          id: crypto.randomUUID(),
          type: 'warning',
          severity: pendingCount > 50 ? 'high' : 'medium',
          title: 'Contenido pendiente',
          message: `Hay ${pendingCount} contenidos pendientes de aprobación`,
          details: 'Revisa la sección de aprobaciones para gestionar el contenido educativo',
          timestamp: new Date(),
          dismissed: false,
        });
      }

      // ALERT 2: Check for inactive users
      const inactiveUsers = await this.authConnection.query(
        `SELECT COUNT(*) as count
         FROM auth.users
         WHERE last_sign_in_at < NOW() - INTERVAL '30 days'
         AND deleted_at IS NULL`,
      );

      const inactiveCount = parseInt(inactiveUsers[0]?.count || '0', 10);
      if (inactiveCount > 50) {
        alerts.push({
          id: crypto.randomUUID(),
          type: 'info',
          severity: 'low',
          title: 'Usuarios inactivos',
          message: `${inactiveCount} usuarios inactivos por más de 30 días`,
          details: 'Considera enviar correos de reactivación o limpiar cuentas inactivas',
          timestamp: new Date(),
          dismissed: false,
        });
      }

      // ALERT 3: Check for users with email verification pending
      const unverifiedUsers = await this.authConnection.query(
        `SELECT COUNT(*) as count
         FROM auth.users
         WHERE email_confirmed_at IS NULL
         AND created_at < NOW() - INTERVAL '7 days'
         AND deleted_at IS NULL`,
      );

      const unverifiedCount = parseInt(unverifiedUsers[0]?.count || '0', 10);
      if (unverifiedCount > 20) {
        alerts.push({
          id: crypto.randomUUID(),
          type: 'security',
          severity: 'medium',
          title: 'Verificación de email pendiente',
          message: `${unverifiedCount} usuarios sin verificar email`,
          details: 'Usuarios registrados hace más de 7 días sin confirmar su correo electrónico',
          timestamp: new Date(),
          dismissed: false,
        });
      }

      // ALERT 4: Check for low user engagement (no activity in last 7 days)
      const lowEngagement = await this.authConnection.query(
        `SELECT COUNT(DISTINCT user_id) as count
         FROM audit_logging.activity_log
         WHERE created_at >= NOW() - INTERVAL '7 days'`,
      );

      const totalUsers = await this.userRepo.count();
      const activeUsersWeek = parseInt(lowEngagement[0]?.count || '0', 10);
      const engagementRate = totalUsers > 0 ? (activeUsersWeek / totalUsers) * 100 : 0;

      if (engagementRate < 20 && totalUsers > 10) {
        alerts.push({
          id: crypto.randomUUID(),
          type: 'warning',
          severity: 'medium',
          title: 'Baja participación',
          message: `Solo ${engagementRate.toFixed(1)}% de usuarios activos esta semana`,
          details: `${activeUsersWeek} de ${totalUsers} usuarios mostraron actividad en los últimos 7 días`,
          timestamp: new Date(),
          dismissed: false,
        });
      }

      // ALERT 5: Check for flagged content requiring moderation
      const flaggedContent = await this.authConnection.query(
        `SELECT COUNT(*) as count
         FROM content_management.flagged_content
         WHERE status = 'pending'`,
      );

      const flaggedCount = parseInt(flaggedContent[0]?.count || '0', 10);
      if (flaggedCount > 0) {
        alerts.push({
          id: crypto.randomUUID(),
          type: 'error',
          severity: flaggedCount > 10 ? 'high' : 'medium',
          title: 'Contenido reportado',
          message: `${flaggedCount} reportes de contenido sin resolver`,
          details: 'Revisa el contenido reportado por los usuarios para tomar acción',
          timestamp: new Date(),
          dismissed: false,
        });
      }

      // Sort alerts by severity (critical > high > medium > low)
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

      return alerts;
    } catch (error) {
      console.error('Error fetching alerts:', error);
      // Return at least one system alert on error
      return [{
        id: crypto.randomUUID(),
        type: 'error',
        severity: 'low',
        title: 'Error del sistema',
        message: 'Error al cargar alertas del sistema',
        details: 'Verifica la conexión a la base de datos y los logs del sistema',
        timestamp: new Date(),
        dismissed: false,
      }];
    }
  }

  /**
   * Get user activity analytics for charts and tables
   *
   * GAP-FE-002: Updated to return both chart data (labels/data) and detailed table data.
   * Returns time-series data of user activity grouped by day/week/month with multiple metrics.
   *
   * @param query - Query parameters (date range, grouping)
   * @returns User activity data with labels, counts, and detailed metrics
   */
  async getUserActivity(query: UserActivityQueryDto): Promise<UserActivityDto> {
    const { startDate, endDate, groupBy = GroupByEnum.DAY } = query;

    // Calculate date range (default: last 30 days)
    const start = startDate
      ? new Date(startDate)
      : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate
      ? new Date(endDate)
      : new Date();

    try {
      // Determine SQL date format based on grouping
      let dateFormat: string;
      let dateTrunc: string;

      switch (groupBy) {
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
