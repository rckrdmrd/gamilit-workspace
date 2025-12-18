import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { AdminDashboardService } from '../services/admin-dashboard.service';
import {
  RecentActivityQueryDto,
  PaginatedActivityDto,
  RecentActionsQueryDto,
  RecentActionDto,
  AlertDto,
  UserActivityQueryDto,
  UserActivityDto,
} from '../dto/dashboard';

/**
 * AdminDashboardActivityController
 * Controller for admin dashboard activity and analytics endpoints
 */
@ApiTags('Admin - Dashboard Activity')
@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminDashboardActivityController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get('recent-activity')
  @ApiOperation({ summary: 'Get recent activity' })
  async getRecentActivity(
    @Query() query: RecentActivityQueryDto,
  ): Promise<PaginatedActivityDto> {
    return this.adminDashboardService.getRecentActivity(query);
  }

  @Get('actions/recent')
  @ApiOperation({ summary: 'Get recent admin actions' })
  async getRecentActions(
    @Query() query: RecentActionsQueryDto,
  ): Promise<RecentActionDto[]> {
    return this.adminDashboardService.getRecentActions(query.limit);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get active system alerts' })
  async getAlerts(): Promise<AlertDto[]> {
    return this.adminDashboardService.getAlerts();
  }

  @Get('analytics/user-activity')
  @ApiOperation({ summary: 'Get user activity analytics' })
  async getUserActivity(
    @Query() query: UserActivityQueryDto,
  ): Promise<UserActivityDto> {
    return this.adminDashboardService.getUserActivity(query);
  }
}
