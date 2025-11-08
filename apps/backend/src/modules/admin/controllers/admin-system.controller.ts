import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { AdminSystemService } from '../services/admin-system.service';
import {
  SystemHealthDto,
  SystemMetricsDto,
  AuditLogQueryDto,
  PaginatedAuditLogDto,
  UpdateSystemConfigDto,
  SystemConfigDto,
  ToggleMaintenanceDto,
  MaintenanceStatusDto,
} from '../dto/system';

@ApiTags('Admin - System')
@Controller('admin/system')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
export class AdminSystemController {
  constructor(private readonly adminSystemService: AdminSystemService) {}

  @Get('health')
  @ApiOperation({
    summary: 'Get system health status',
    description:
      'Retrieve detailed health information including database, memory, CPU, and uptime metrics',
  })
  async getSystemHealth(): Promise<SystemHealthDto> {
    return await this.adminSystemService.getSystemHealth();
  }

  @Get('metrics')
  @ApiOperation({
    summary: 'Get system metrics',
    description:
      'Retrieve system performance metrics including user activity, request counts, error rates, and resource usage',
  })
  async getSystemMetrics(): Promise<SystemMetricsDto> {
    return await this.adminSystemService.getSystemMetrics();
  }

  @Get('audit-log')
  @ApiOperation({
    summary: 'Get audit log',
    description:
      'Retrieve authentication attempt logs with filtering options for security auditing',
  })
  async getAuditLog(
    @Query() query: AuditLogQueryDto,
  ): Promise<PaginatedAuditLogDto> {
    return await this.adminSystemService.getAuditLog(query);
  }

  @Post('config')
  @ApiOperation({
    summary: 'Update system configuration',
    description:
      'Update system-wide configuration settings including maintenance mode, login policies, and session timeouts',
  })
  async updateSystemConfig(
    @Body() configDto: UpdateSystemConfigDto,
    @Request() req: any,
  ): Promise<SystemConfigDto> {
    const adminId = req.user?.id || req.user?.sub;
    return await this.adminSystemService.updateSystemConfig(configDto, adminId);
  }

  @Get('config')
  @ApiOperation({
    summary: 'Get current system configuration',
    description: 'Retrieve the current system configuration settings',
  })
  async getSystemConfig(): Promise<SystemConfigDto> {
    return await this.adminSystemService.getSystemConfig();
  }

  @Post('maintenance')
  @ApiOperation({
    summary: 'Toggle maintenance mode',
    description:
      'Enable or disable maintenance mode. When enabled, all non-admin users will be blocked from accessing the system.',
  })
  async toggleMaintenance(
    @Body() toggleDto: ToggleMaintenanceDto,
    @Request() req: any,
  ): Promise<MaintenanceStatusDto> {
    const adminId = req.user?.id || req.user?.sub;
    return await this.adminSystemService.toggleMaintenance(
      toggleDto,
      adminId,
    );
  }
}
