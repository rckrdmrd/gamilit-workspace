import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { AdminMonitoringService } from '../services/admin-monitoring.service';
import {
  SystemMetricsDto,
  MetricsHistoryDto,
  MetricsHistoryQueryDto,
  ErrorStatsDto,
  ErrorStatsQueryDto,
  RecentErrorsDto,
  RecentErrorsQueryDto,
  ErrorTrendsDto,
  ErrorTrendsQueryDto,
} from '../dto/monitoring';

/**
 * Controller for admin monitoring endpoints
 * Provides system metrics and error tracking functionality
 */
@Controller('admin/monitoring')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
@ApiTags('admin-internal', 'Admin - Monitoring')
export class AdminMonitoringController {
  constructor(private readonly monitoringService: AdminMonitoringService) {}

  /**
   * Get current system metrics
   * Returns real-time metrics from Node.js process and OS
   */
  @Get('metrics')
  @ApiOperation({
    summary: 'Get current system metrics',
    description:
      'Returns real-time system metrics including memory, CPU, system info, and process statistics. Data is gathered directly from Node.js process and OS modules.',
  })
  @ApiResponse({
    status: 200,
    description: 'System metrics retrieved successfully',
    type: SystemMetricsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getSystemMetrics(): Promise<SystemMetricsDto> {
    return this.monitoringService.getSystemMetrics();
  }

  /**
   * Get metrics history for last N hours
   * Note: Historical tracking not currently enabled, returns current metrics
   */
  @Get('metrics/history')
  @ApiOperation({
    summary: 'Get metrics history for last N hours',
    description:
      'Returns metrics history for the specified time period. Note: Historical tracking is not currently enabled, so only current metrics are returned with a note.',
  })
  @ApiResponse({
    status: 200,
    description: 'Metrics history retrieved successfully',
    type: MetricsHistoryDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid query parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getMetricsHistory(
    @Query() query: MetricsHistoryQueryDto,
  ): Promise<MetricsHistoryDto> {
    return this.monitoringService.getMetricsHistory(query);
  }

  /**
   * Get error statistics for specified time period
   */
  @Get('errors/stats')
  @ApiOperation({
    summary: 'Get error statistics',
    description:
      'Returns aggregated error statistics for the specified time period, including total errors, fatal errors, and time range information.',
  })
  @ApiResponse({
    status: 200,
    description: 'Error statistics retrieved successfully',
    type: ErrorStatsDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid query parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getErrorStats(
    @Query() query: ErrorStatsQueryDto,
  ): Promise<ErrorStatsDto> {
    return this.monitoringService.getErrorStats(query);
  }

  /**
   * Get recent errors with full details
   */
  @Get('errors/recent')
  @ApiOperation({
    summary: 'Get recent errors with details',
    description:
      'Returns a list of recent errors with full details including message, context, source, and associated user information. Can be filtered by error level.',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent errors retrieved successfully',
    type: RecentErrorsDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid query parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getRecentErrors(
    @Query() query: RecentErrorsQueryDto,
  ): Promise<RecentErrorsDto> {
    return this.monitoringService.getRecentErrors(query);
  }

  /**
   * Get error trends over time with time bucketing
   */
  @Get('errors/trends')
  @ApiOperation({
    summary: 'Get error trends over time',
    description:
      'Returns error trends grouped by time buckets (hour or day). Includes error counts, fatal counts, and unique error sources per time bucket.',
  })
  @ApiResponse({
    status: 200,
    description: 'Error trends retrieved successfully',
    type: ErrorTrendsDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid query parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin access required',
  })
  async getErrorTrends(
    @Query() query: ErrorTrendsQueryDto,
  ): Promise<ErrorTrendsDto> {
    return this.monitoringService.getErrorTrends(query);
  }
}
