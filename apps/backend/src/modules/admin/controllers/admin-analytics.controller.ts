import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { Response } from 'express';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { AdminAnalyticsService } from '../services/admin-analytics.service';
import {
  AnalyticsOverviewDto,
  EngagementAnalyticsDto,
  EngagementQueryDto,
  GamificationAnalyticsDto,
  ActivityTimelineDto,
  TimelineQueryDto,
  TopUsersDto,
  TopUsersQueryDto,
  RetentionAnalyticsDto,
  ExportQueryDto,
} from '../dto/analytics';

/**
 * Controller for admin analytics endpoints
 * Provides comprehensive analytics data from materialized views
 * @requires AdminGuard - All endpoints require admin privileges
 */
@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, AdminGuard)
@ApiBearerAuth()
@ApiTags('Admin - Analytics')
export class AdminAnalyticsController {
  constructor(private readonly analyticsService: AdminAnalyticsService) {}

  /**
   * Get analytics overview
   * Provides high-level metrics including user counts, averages, and segmentation
   */
  @Get('overview')
  @ApiOperation({
    summary: 'Get analytics overview',
    description: 'Returns comprehensive overview of user analytics including counts, averages, and user segmentation',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics overview retrieved successfully',
    type: AnalyticsOverviewDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires admin privileges',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getAnalyticsOverview(): Promise<AnalyticsOverviewDto> {
    return this.analyticsService.getAnalyticsOverview();
  }

  /**
   * Get engagement analytics
   * Provides engagement metrics grouped by user segment with optional filters
   */
  @Get('engagement')
  @ApiOperation({
    summary: 'Get user engagement analytics',
    description: 'Returns engagement metrics grouped by user segment (inactive, beginner, intermediate, advanced)',
  })
  @ApiQuery({
    name: 'role',
    required: false,
    description: 'Filter by user role (e.g., "student", "admin_teacher")',
    type: String,
  })
  @ApiQuery({
    name: 'date_from',
    required: false,
    description: 'Filter users registered from this date (ISO format)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Engagement analytics retrieved successfully',
    type: EngagementAnalyticsDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid query parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires admin privileges',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getEngagementAnalytics(@Query() query: EngagementQueryDto): Promise<EngagementAnalyticsDto> {
    return this.analyticsService.getEngagementAnalytics(query);
  }

  /**
   * Get gamification analytics
   * Provides distribution data for XP, ranks, and levels
   */
  @Get('gamification')
  @ApiOperation({
    summary: 'Get gamification distribution analytics',
    description: 'Returns distribution of users across XP ranges, Maya ranks, and levels',
  })
  @ApiResponse({
    status: 200,
    description: 'Gamification analytics retrieved successfully',
    type: GamificationAnalyticsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires admin privileges',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getGamificationAnalytics(): Promise<GamificationAnalyticsDto> {
    return this.analyticsService.getGamificationAnalytics();
  }

  /**
   * Get activity timeline
   * Provides daily activity metrics for specified time period
   */
  @Get('activity-timeline')
  @ApiOperation({
    summary: 'Get activity timeline for last N days',
    description: 'Returns daily activity metrics including unique users, exercises, and logins',
  })
  @ApiQuery({
    name: 'days',
    required: false,
    description: 'Number of days to include (1-90, default: 30)',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Activity timeline retrieved successfully',
    type: ActivityTimelineDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid query parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires admin privileges',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getActivityTimeline(@Query() query: TimelineQueryDto): Promise<ActivityTimelineDto> {
    return this.analyticsService.getActivityTimeline(query);
  }

  /**
   * Get top users
   * Provides ranked list of top users by specified metric
   */
  @Get('top-users')
  @ApiOperation({
    summary: 'Get top users by specified metric',
    description: 'Returns top users ranked by XP, exercises completed, or current streak',
  })
  @ApiQuery({
    name: 'metric',
    required: true,
    description: 'Metric to rank by: "xp", "exercises", or "streak"',
    enum: ['xp', 'exercises', 'streak'],
    type: String,
  })
  @ApiQuery({
    name: 'role',
    required: false,
    description: 'Filter by user role (e.g., "student", "admin_teacher")',
    type: String,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of top users to return (1-100, default: 10)',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Top users retrieved successfully',
    type: TopUsersDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid query parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires admin privileges',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getTopUsers(@Query() query: TopUsersQueryDto): Promise<TopUsersDto> {
    return this.analyticsService.getTopUsers(query);
  }

  /**
   * Get retention analytics
   * Provides cohort retention metrics for last 12 months
   */
  @Get('retention')
  @ApiOperation({
    summary: 'Get retention analytics by cohort',
    description: 'Returns cohort retention metrics showing how many users remain active from each registration cohort',
  })
  @ApiResponse({
    status: 200,
    description: 'Retention analytics retrieved successfully',
    type: RetentionAnalyticsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires admin privileges',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getRetentionAnalytics(): Promise<RetentionAnalyticsDto> {
    return this.analyticsService.getRetentionAnalytics();
  }

  /**
   * Export analytics data
   * Exports specified analytics data as CSV file
   */
  @Get('export')
  @ApiOperation({
    summary: 'Export analytics data to CSV',
    description: 'Exports analytics data in CSV format for specified type',
  })
  @ApiQuery({
    name: 'type',
    required: true,
    description: 'Type of data to export',
    enum: ['overview', 'users', 'engagement', 'gamification'],
    type: String,
  })
  @ApiQuery({
    name: 'format',
    required: false,
    description: 'Export format (default: "csv")',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics data exported successfully',
    content: {
      'text/csv': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid query parameters',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Requires admin privileges',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async exportAnalytics(@Query() query: ExportQueryDto, @Res() res: Response): Promise<void> {
    const csvData = await this.analyticsService.exportAnalytics(query.type);

    // Set headers for CSV download
    const filename = `analytics-${query.type}-${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Pragma', 'no-cache');

    res.send(csvData);
  }
}
