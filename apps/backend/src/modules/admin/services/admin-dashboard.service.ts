import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { User } from '@modules/auth/entities/user.entity';
import {
  DashboardDataDto,
  DashboardStatsDto,
  RecentActivityQueryDto,
  PaginatedActivityDto,
  UserStatsSummaryDto,
  OrganizationStatsSummaryDto,
  PaginatedModerationQueueDto,
  PaginatedClassroomOverviewDto,
  PaginatedAssignmentSubmissionStatsDto,
  RecentActionDto,
  AlertDto,
  UserActivityDto,
  UserActivityQueryDto,
} from '../dto/dashboard';
import { DashboardStatsService } from './statistics/dashboard-stats.service';
import { UserStatsService } from './statistics/user-stats.service';
import { ContentStatsService } from './statistics/content-stats.service';
import { RecentActivityService } from './activity/recent-activity.service';
import { AdminQueryBuilder } from './query-builders/admin.query-builder';

/**
 * Refactored AdminDashboardService - Orchestrator for dashboard operations.
 * Delegates specific responsibilities to specialized services following SRP.
 *
 * This service now acts as a facade/orchestrator that:
 * - Coordinates between specialized services
 * - Provides high-level dashboard operations
 * - Maintains backward compatibility with existing API
 *
 * Specialized services:
 * - DashboardStatsService: Aggregated statistics
 * - UserStatsService: User counts and metrics
 * - ContentStatsService: Content and organization statistics
 * - RecentActivityService: Activity tracking and recent actions
 * - AdminQueryBuilder: Complex SQL query encapsulation
 */
@Injectable()
export class AdminDashboardService {
  private readonly logger = new Logger(AdminDashboardService.name);

  constructor(
    @InjectDataSource('auth')
    private readonly authConnection: DataSource,
    @InjectRepository(User, 'auth')
    private readonly userRepo: Repository<User>,
    private readonly dashboardStatsService: DashboardStatsService,
    private readonly userStatsService: UserStatsService,
    private readonly contentStatsService: ContentStatsService,
    private readonly recentActivityService: RecentActivityService,
    private readonly queryBuilder: AdminQueryBuilder,
  ) {}

  /**
   * Get complete dashboard data (stats + recent activity).
   * Delegates to DashboardStatsService and RecentActivityService.
   */
  async getDashboard(): Promise<DashboardDataDto> {
    const [stats, recentActivity] = await Promise.all([
      this.dashboardStatsService.getDashboardStats(),
      this.recentActivityService.getRecentActivityInternal(10),
    ]);

    return {
      stats,
      recentActivity,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get dashboard statistics.
   * Delegates to DashboardStatsService.
   */
  async getDashboardStats(): Promise<DashboardStatsDto> {
    return this.dashboardStatsService.getDashboardStats();
  }

  /**
   * Get recent activity from admin_dashboard.recent_activity view.
   * Delegates to RecentActivityService.
   */
  async getRecentActivity(
    query: RecentActivityQueryDto,
  ): Promise<PaginatedActivityDto> {
    return this.recentActivityService.getRecentActivity(query);
  }

  /**
   * Get aggregated user statistics from admin_dashboard.user_stats_summary view.
   * Delegates to UserStatsService.
   */
  async getUserStatsSummary(): Promise<UserStatsSummaryDto> {
    return this.userStatsService.getUserStatsSummary();
  }

  /**
   * Get aggregated organization statistics from admin_dashboard.organization_stats_summary view.
   * Delegates to ContentStatsService.
   */
  async getOrganizationStatsSummary(): Promise<OrganizationStatsSummaryDto> {
    return this.contentStatsService.getOrganizationStatsSummary();
  }

  /**
   * Get content moderation queue from admin_dashboard.moderation_queue view.
   * Delegates to AdminQueryBuilder.
   */
  async getModerationQueue(limit: number = 50): Promise<PaginatedModerationQueueDto> {
    return this.queryBuilder.getModerationQueue(limit);
  }

  /**
   * Get classroom overview statistics from admin_dashboard.classroom_overview view.
   * Delegates to AdminQueryBuilder.
   */
  async getClassroomOverview(limit: number = 100): Promise<PaginatedClassroomOverviewDto> {
    return this.queryBuilder.getClassroomOverview(limit);
  }

  /**
   * Get assignment submission statistics from admin_dashboard.assignment_submission_stats view.
   * Delegates to AdminQueryBuilder.
   */
  async getAssignmentSubmissionStats(limit: number = 100): Promise<PaginatedAssignmentSubmissionStatsDto> {
    return this.queryBuilder.getAssignmentSubmissionStats(limit);
  }

  // =====================================================
  // ADDITIONAL DASHBOARD ENDPOINTS
  // =====================================================

  /**
   * Get recent administrative actions.
   * Delegates to RecentActivityService.
   *
   * @param limit - Maximum number of actions to return (default: 10, max: 50)
   * @returns Array of recent administrative actions
   */
  async getRecentActions(limit: number = 10): Promise<RecentActionDto[]> {
    return this.recentActivityService.getRecentActions(limit);
  }

  /**
   * Get active system alerts.
   * Checks various subsystems for conditions requiring admin attention.
   *
   * @returns Array of active alerts with severity and details
   *
   * @performance FIX-2025-01-07: Parallelized all database queries using Promise.allSettled
   *              to improve response time from ~500ms to ~100ms.
   */
  async getAlerts(): Promise<AlertDto[]> {
    const alerts: AlertDto[] = [];

    try {
      // Fetch all alert data in parallel for better performance
      const [
        pendingResult,
        inactiveResult,
        unverifiedResult,
        engagementResult,
        flaggedResult,
      ] = await Promise.allSettled([
        this.contentStatsService.getPendingApprovalsCount(),
        this.userStatsService.getInactiveUserCount(30),
        this.userStatsService.getUnverifiedUserCount(7),
        this.userStatsService.getUserEngagement(7),
        this.contentStatsService.getFlaggedContentCount(),
      ]);

      // ALERT 1: Check for pending content approvals
      if (pendingResult.status === 'fulfilled') {
        const pendingCount = pendingResult.value;
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
      }

      // ALERT 2: Check for inactive users
      if (inactiveResult.status === 'fulfilled') {
        const inactiveCount = inactiveResult.value;
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
      }

      // ALERT 3: Check for users with email verification pending
      if (unverifiedResult.status === 'fulfilled') {
        const unverifiedCount = unverifiedResult.value;
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
      }

      // ALERT 4: Check for low user engagement
      if (engagementResult.status === 'fulfilled') {
        const engagement = engagementResult.value;
        if (engagement.engagementRate < 20 && engagement.totalUsers > 10) {
          alerts.push({
            id: crypto.randomUUID(),
            type: 'warning',
            severity: 'medium',
            title: 'Baja participación',
            message: `Solo ${engagement.engagementRate.toFixed(1)}% de usuarios activos esta semana`,
            details: `${engagement.activeUsers} de ${engagement.totalUsers} usuarios mostraron actividad en los últimos 7 días`,
            timestamp: new Date(),
            dismissed: false,
          });
        }
      }

      // ALERT 5: Check for flagged content requiring moderation
      if (flaggedResult.status === 'fulfilled') {
        const flaggedCount = flaggedResult.value;
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
      }

      // Sort alerts by severity (critical > high > medium > low)
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

      return alerts;
    } catch (error) {
      this.logger.error(`Error fetching alerts: ${error instanceof Error ? error.message : error}`);
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
   * Get user activity analytics for charts and tables.
   * Delegates to AdminQueryBuilder.
   *
   * @param query - Query parameters (date range, grouping)
   * @returns User activity data with labels and detailed metrics
   */
  async getUserActivity(query: UserActivityQueryDto): Promise<UserActivityDto> {
    return this.queryBuilder.getUserActivity(query);
  }
}
