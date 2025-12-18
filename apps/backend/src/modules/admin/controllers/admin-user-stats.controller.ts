import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { AdminDashboardService } from '../services/admin-dashboard.service';
import { UserStatsSummaryDto } from '../dto/dashboard';

/**
 * AdminUserStatsController
 * Controller for user statistics in admin dashboard
 */
@ApiTags('Admin - User Stats')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminUserStatsController {
  constructor(private readonly adminDashboardService: AdminDashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get detailed user statistics' })
  async getUserStats(): Promise<UserStatsSummaryDto> {
    return this.adminDashboardService.getUserStatsSummary();
  }
}
