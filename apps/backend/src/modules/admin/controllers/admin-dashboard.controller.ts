import { Controller, Get, Query, UseGuards, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { AdminDashboardService } from '../services/admin-dashboard.service';
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
  RecentActionsQueryDto,
  RecentActionDto,
  AlertDto,
  UserActivityQueryDto,
  UserActivityDto,
} from '../dto/dashboard';

@ApiTags('Admin - Dashboard')
@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminDashboardController {
  constructor(
    private readonly adminDashboardService: AdminDashboardService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get complete dashboard data',
    description:
      'Retrieve complete dashboard data including statistics and recent activity for the admin portal home page',
  })
  async getDashboard(): Promise<DashboardDataDto> {
    return this.adminDashboardService.getDashboard();
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get dashboard statistics only',
    description:
      'Retrieve only the dashboard statistics (users, organizations, exercises, etc.)',
  })
  async getDashboardStats(): Promise<DashboardStatsDto> {
    return this.adminDashboardService.getDashboardStats();
  }

  @Get('recent-activity')
  @ApiOperation({
    summary: 'Get recent activity',
    description:
      'Retrieve recent user activity from the admin_dashboard.recent_activity view with configurable limit',
  })
  async getRecentActivity(
    @Query() query: RecentActivityQueryDto,
  ): Promise<PaginatedActivityDto> {
    return this.adminDashboardService.getRecentActivity(query);
  }

  @Get('user-stats')
  @ApiOperation({
    summary: 'Get aggregated user statistics',
    description:
      'Retrieve aggregated user statistics from admin_dashboard.user_stats_summary view including total users, active users, role breakdowns, etc.',
  })
  async getUserStatsSummary(): Promise<UserStatsSummaryDto> {
    return this.adminDashboardService.getUserStatsSummary();
  }

  @Get('organization-stats')
  @ApiOperation({
    summary: 'Get organization statistics',
    description:
      'Retrieve aggregated organization/tenant statistics from admin_dashboard.organization_stats_summary view',
  })
  async getOrganizationStatsSummary(): Promise<OrganizationStatsSummaryDto> {
    return this.adminDashboardService.getOrganizationStatsSummary();
  }

  /**
   * @fix FIX-2025-01-07: Added configurable limit parameter (was hardcoded to 50)
   */
  @Get('moderation-queue')
  @ApiOperation({
    summary: 'Get content moderation queue',
    description:
      'Retrieve pending content moderation items from admin_dashboard.moderation_queue view, prioritized by severity',
  })
  async getModerationQueue(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ): Promise<PaginatedModerationQueueDto> {
    // Validate limit bounds (1-200)
    const safeLimit = Math.max(1, Math.min(limit, 200));
    return this.adminDashboardService.getModerationQueue(safeLimit);
  }

  /**
   * @fix FIX-2025-01-07: Added configurable limit parameter (was hardcoded to 100)
   */
  @Get('classroom-overview')
  @ApiOperation({
    summary: 'Get classroom overview',
    description:
      'Retrieve comprehensive classroom statistics from admin_dashboard.classroom_overview view including student counts, assignments, and progress',
  })
  async getClassroomOverview(
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ): Promise<PaginatedClassroomOverviewDto> {
    // Validate limit bounds (1-500)
    const safeLimit = Math.max(1, Math.min(limit, 500));
    return this.adminDashboardService.getClassroomOverview(safeLimit);
  }

  /**
   * @fix FIX-2025-01-07: Added configurable limit parameter (was hardcoded to 100)
   */
  @Get('assignment-stats')
  @ApiOperation({
    summary: 'Get assignment submission statistics',
    description:
      'Retrieve assignment submission statistics from admin_dashboard.assignment_submission_stats view including submission rates and scores',
  })
  async getAssignmentSubmissionStats(
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ): Promise<PaginatedAssignmentSubmissionStatsDto> {
    // Validate limit bounds (1-500)
    const safeLimit = Math.max(1, Math.min(limit, 500));
    return this.adminDashboardService.getAssignmentSubmissionStats(safeLimit);
  }

  // =====================================================
  // NEW ENDPOINTS: BUG-ADMIN-002, 003, 004
  // =====================================================

  /**
   * Get recent administrative actions
   *
   * BUG-ADMIN-002: Endpoint for fetching recent admin actions.
   * Returns a list of recent administrative actions (user creations,
   * organization updates, content approvals, etc.)
   */
  @Get('actions/recent')
  @ApiOperation({
    summary: 'Get recent admin actions',
    description:
      'Returns recent actions performed by administrators including user creations, ' +
      'organization updates, content approvals, and other administrative tasks. ' +
      'Actions are sourced from auth.users, auth.tenants, and audit logs.',
  })
  async getRecentActions(
    @Query() query: RecentActionsQueryDto,
  ): Promise<RecentActionDto[]> {
    return this.adminDashboardService.getRecentActions(query.limit);
  }

  /**
   * Get active system alerts
   *
   * BUG-ADMIN-003: Endpoint for fetching system alerts.
   * Returns alerts requiring admin attention from various subsystems
   * (content, security, system health, performance)
   */
  @Get('alerts')
  @ApiOperation({
    summary: 'Get active system alerts',
    description:
      'Returns active alerts requiring admin attention. Alerts are generated from various ' +
      'subsystems including content approvals, security events, user engagement, and system health. ' +
      'Alerts are sorted by severity (critical > high > medium > low).',
  })
  async getAlerts(): Promise<AlertDto[]> {
    return this.adminDashboardService.getAlerts();
  }

  /**
   * Get user activity analytics
   *
   * BUG-ADMIN-004: Endpoint for user activity analytics.
   * Returns time-series data of user activity grouped by day/week/month
   * for rendering activity charts in the admin dashboard.
   */
  @Get('analytics/user-activity')
  @ApiOperation({
    summary: 'Get user activity analytics',
    description:
      'Returns user activity data for charts grouped by time period (day/week/month). ' +
      'Data is based on user sign-in activity and can be filtered by date range. ' +
      'Returns arrays of labels (dates) and data (active user counts) ready for charting.',
  })
  async getUserActivity(
    @Query() query: UserActivityQueryDto,
  ): Promise<UserActivityDto> {
    return this.adminDashboardService.getUserActivity(query);
  }
}
