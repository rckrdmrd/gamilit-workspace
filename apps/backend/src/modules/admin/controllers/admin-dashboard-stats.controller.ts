import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { AdminDashboardService } from '../services/admin-dashboard.service';
import {
  DashboardDataDto,
  DashboardStatsDto,
  UserStatsSummaryDto,
  OrganizationStatsSummaryDto,
  PaginatedModerationQueueDto,
  PaginatedClassroomOverviewDto,
  PaginatedAssignmentSubmissionStatsDto,
} from '../dto/dashboard';

/**
 * AdminDashboardStatsController
 * Controller for admin dashboard statistics endpoints
 */
@ApiTags('Admin - Dashboard Stats')
@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminDashboardStatsController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get complete dashboard data' })
  async getDashboard(): Promise<DashboardDataDto> {
    return this.adminDashboardService.getDashboard();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics only' })
  async getDashboardStats(): Promise<DashboardStatsDto> {
    return this.adminDashboardService.getDashboardStats();
  }

  @Get('user-stats')
  @ApiOperation({ summary: 'Get aggregated user statistics' })
  async getUserStatsSummary(): Promise<UserStatsSummaryDto> {
    return this.adminDashboardService.getUserStatsSummary();
  }

  @Get('organization-stats')
  @ApiOperation({ summary: 'Get organization statistics' })
  async getOrganizationStatsSummary(): Promise<OrganizationStatsSummaryDto> {
    return this.adminDashboardService.getOrganizationStatsSummary();
  }

  @Get('moderation-queue')
  @ApiOperation({ summary: 'Get content moderation queue' })
  async getModerationQueue(): Promise<PaginatedModerationQueueDto> {
    return this.adminDashboardService.getModerationQueue(50);
  }

  @Get('classroom-overview')
  @ApiOperation({ summary: 'Get classroom overview' })
  async getClassroomOverview(): Promise<PaginatedClassroomOverviewDto> {
    return this.adminDashboardService.getClassroomOverview(100);
  }

  @Get('assignment-stats')
  @ApiOperation({ summary: 'Get assignment submission statistics' })
  async getAssignmentSubmissionStats(): Promise<PaginatedAssignmentSubmissionStatsDto> {
    return this.adminDashboardService.getAssignmentSubmissionStats(100);
  }
}
