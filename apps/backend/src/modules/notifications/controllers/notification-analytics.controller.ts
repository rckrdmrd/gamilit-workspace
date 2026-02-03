import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Redirect,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards';
import { AccountStatusGuard } from '@shared/guards/account-status.guard';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { NotificationDeliveryService } from '../services/notification-delivery.service';
import { NotificationErrorService } from '../services/notification-error.service';
import { NotificationAnalyticsService } from '../services/notification-analytics.service';
import {
  AnalyticsSummaryDto,
  TemplateAnalyticsDto,
  ChannelAnalyticsDto,
  DeliveryStatusByChannelDto,
  ErrorListResponseDto,
  TrackOpenDto,
  TrackClickDto,
  TrackEventResponseDto,
  AnalyticsQueryDto,
  ErrorsQueryDto,
} from '../dto/analytics';

/**
 * NotificationAnalyticsController
 *
 * @description Controller for notification analytics, delivery tracking, and error logging
 * @version 1.0 (2026-02-03) - Sprint 1.5 Audit
 *
 * Routes: /notifications/analytics/*
 *
 * Endpoints:
 * - GET /analytics/summary - Overall metrics
 * - GET /analytics/by-template/:templateKey - Per-template stats
 * - GET /analytics/by-channel/:channel - Per-channel stats
 * - GET /delivery/:notificationId - Delivery status
 * - GET /errors - List recent errors
 * - GET /errors/:notificationId - Errors for notification
 * - POST /track/open - Track email open (pixel tracking)
 * - POST /track/click - Track link click (redirects to URL)
 *
 * @see EXT-003 Multi-channel notifications
 */
@ApiTags('notifications-analytics')
@Controller('notifications')
export class NotificationAnalyticsController {
  constructor(
    private readonly deliveryService: NotificationDeliveryService,
    private readonly errorService: NotificationErrorService,
    private readonly analyticsService: NotificationAnalyticsService,
  ) {}

  // ========== ANALYTICS ENDPOINTS ==========

  /**
   * GET /notifications/analytics/summary
   *
   * Get overall notification analytics summary
   */
  @Get('analytics/summary')
  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get analytics summary',
    description:
      'Returns overall notification analytics including delivery rates, ' +
      'open rates, click rates, and bounce rates across all channels.',
  })
  @ApiQuery({
    name: 'from',
    required: false,
    description: 'Start date (ISO 8601). Defaults to 30 days ago.',
    example: '2026-01-01T00:00:00.000Z',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    description: 'End date (ISO 8601). Defaults to now.',
    example: '2026-02-03T23:59:59.000Z',
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics summary retrieved successfully',
    type: AnalyticsSummaryDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated',
  })
  async getSummary(
    @Query() query: AnalyticsQueryDto,
  ): Promise<AnalyticsSummaryDto> {
    const { from, to } = this.parseDateRange(query.from, query.to);
    return this.analyticsService.getSummary(from, to);
  }

  /**
   * GET /notifications/analytics/by-template/:templateKey
   *
   * Get analytics for a specific notification template
   */
  @Get('analytics/by-template/:templateKey')
  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get template analytics',
    description:
      'Returns analytics for a specific notification template including ' +
      'send counts, delivery rates, and engagement metrics.',
  })
  @ApiParam({
    name: 'templateKey',
    description: 'Template unique key',
    example: 'achievement_unlocked',
  })
  @ApiQuery({
    name: 'from',
    required: false,
    description: 'Start date (ISO 8601)',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    description: 'End date (ISO 8601)',
  })
  @ApiResponse({
    status: 200,
    description: 'Template analytics retrieved successfully',
    type: TemplateAnalyticsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated',
  })
  @ApiResponse({
    status: 404,
    description: 'Template not found',
  })
  async getTemplateAnalytics(
    @Param('templateKey') templateKey: string,
    @Query() query: AnalyticsQueryDto,
  ): Promise<TemplateAnalyticsDto> {
    const { from, to } = this.parseDateRange(query.from, query.to);
    return this.analyticsService.getTemplateAnalytics(templateKey, from, to);
  }

  /**
   * GET /notifications/analytics/by-channel/:channel
   *
   * Get analytics for a specific notification channel
   */
  @Get('analytics/by-channel/:channel')
  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get channel analytics',
    description:
      'Returns analytics for a specific notification channel including ' +
      'send counts, delivery rates, top templates, and daily trends.',
  })
  @ApiParam({
    name: 'channel',
    description: 'Notification channel',
    enum: ['in_app', 'email', 'push', 'sms'],
    example: 'email',
  })
  @ApiQuery({
    name: 'from',
    required: false,
    description: 'Start date (ISO 8601)',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    description: 'End date (ISO 8601)',
  })
  @ApiResponse({
    status: 200,
    description: 'Channel analytics retrieved successfully',
    type: ChannelAnalyticsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated',
  })
  async getChannelAnalytics(
    @Param('channel') channel: string,
    @Query() query: AnalyticsQueryDto,
  ): Promise<ChannelAnalyticsDto> {
    const { from, to } = this.parseDateRange(query.from, query.to);
    return this.analyticsService.getChannelAnalytics(channel, from, to);
  }

  // ========== DELIVERY STATUS ENDPOINTS ==========

  /**
   * GET /notifications/delivery/:notificationId
   *
   * Get delivery status for a notification
   */
  @Get('delivery/:notificationId')
  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get delivery status',
    description:
      'Returns the delivery status for a specific notification across ' +
      'all channels it was sent through.',
  })
  @ApiParam({
    name: 'notificationId',
    description: 'Notification UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Delivery status retrieved successfully',
    type: DeliveryStatusByChannelDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated',
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found',
  })
  async getDeliveryStatus(
    @Param('notificationId') notificationId: string,
  ): Promise<DeliveryStatusByChannelDto> {
    return this.deliveryService.getDeliveryStatus(notificationId);
  }

  // ========== ERROR ENDPOINTS ==========

  /**
   * GET /notifications/errors
   *
   * Get recent notification errors
   */
  @Get('errors')
  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get recent errors',
    description:
      'Returns a paginated list of recent notification delivery errors ' +
      'with filtering options.',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filter by error category',
    enum: ['validation', 'provider', 'network', 'rate_limit', 'unknown'],
  })
  @ApiQuery({
    name: 'channel',
    required: false,
    description: 'Filter by channel',
    enum: ['in_app', 'email', 'push', 'sms'],
  })
  @ApiQuery({
    name: 'from',
    required: false,
    description: 'Start date (ISO 8601)',
  })
  @ApiQuery({
    name: 'to',
    required: false,
    description: 'End date (ISO 8601)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Pagination offset',
    example: 0,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Pagination limit',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Errors retrieved successfully',
    type: ErrorListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated',
  })
  async getRecentErrors(
    @Query() query: ErrorsQueryDto,
  ): Promise<ErrorListResponseDto> {
    return this.errorService.getRecentErrors({
      category: query.category as any,
      channel: query.channel,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
      offset: query.offset,
      limit: query.limit,
    });
  }

  /**
   * GET /notifications/errors/:notificationId
   *
   * Get errors for a specific notification
   */
  @Get('errors/:notificationId')
  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get notification errors',
    description:
      'Returns all delivery errors for a specific notification.',
  })
  @ApiParam({
    name: 'notificationId',
    description: 'Notification UUID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Errors retrieved successfully',
    schema: {
      type: 'array',
      items: { $ref: '#/components/schemas/NotificationErrorDto' },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated',
  })
  async getNotificationErrors(
    @Param('notificationId') notificationId: string,
  ): Promise<any[]> {
    return this.errorService.getErrorsByNotification(notificationId);
  }

  // ========== TRACKING ENDPOINTS ==========

  /**
   * POST /notifications/track/open
   *
   * Track email open event (pixel tracking)
   *
   * This endpoint is typically called via a tracking pixel embedded in emails:
   * <img src="https://api.gamilit.com/notifications/track/open?logId=xxx" />
   *
   * Note: This endpoint does NOT require authentication for pixel tracking to work
   */
  @Post('track/open')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Track notification open',
    description:
      'Tracks when a notification is opened (typically via tracking pixel in emails). ' +
      'This endpoint does not require authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Open tracked successfully',
    type: TrackEventResponseDto,
  })
  async trackOpen(
    @Body() dto: TrackOpenDto,
  ): Promise<TrackEventResponseDto> {
    return this.analyticsService.trackOpen(dto.logId, {
      userAgent: dto.userAgent,
      ipAddress: dto.ipAddress,
    });
  }

  /**
   * GET /notifications/track/open
   *
   * Track email open via GET request (for pixel tracking)
   *
   * Returns a 1x1 transparent GIF
   */
  @Get('track/open')
  @ApiOperation({
    summary: 'Track notification open (GET)',
    description:
      'Tracks when a notification is opened via GET request. Returns a 1x1 transparent pixel. ' +
      'This endpoint does not require authentication.',
  })
  @ApiQuery({
    name: 'logId',
    required: true,
    description: 'Notification log ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a 1x1 transparent GIF',
  })
  async trackOpenGet(
    @Query('logId') logId: string,
    @Res() res: Response,
  ): Promise<void> {
    // Track the open
    await this.analyticsService.trackOpen(logId, {});

    // Return a 1x1 transparent GIF
    const transparentGif = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64',
    );

    res.setHeader('Content-Type', 'image/gif');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.send(transparentGif);
  }

  /**
   * POST /notifications/track/click
   *
   * Track link click event
   *
   * This endpoint is called when a user clicks a tracked link in a notification.
   * Links are wrapped with the tracking URL that redirects to the original URL.
   */
  @Post('track/click')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Track notification click',
    description:
      'Tracks when a link in a notification is clicked. Returns the redirect URL. ' +
      'This endpoint does not require authentication.',
  })
  @ApiResponse({
    status: 200,
    description: 'Click tracked successfully',
    type: TrackEventResponseDto,
  })
  async trackClick(
    @Body() dto: TrackClickDto,
  ): Promise<TrackEventResponseDto> {
    return this.analyticsService.trackClick(dto.logId, dto.url, {
      linkId: dto.linkId,
      userAgent: dto.userAgent,
      ipAddress: dto.ipAddress,
    });
  }

  /**
   * GET /notifications/track/click
   *
   * Track link click and redirect to original URL
   *
   * This is the preferred method for tracking clicks as it handles the redirect automatically.
   */
  @Get('track/click')
  @ApiOperation({
    summary: 'Track notification click and redirect (GET)',
    description:
      'Tracks when a link in a notification is clicked and redirects to the original URL. ' +
      'This endpoint does not require authentication.',
  })
  @ApiQuery({
    name: 'logId',
    required: true,
    description: 'Notification log ID',
  })
  @ApiQuery({
    name: 'url',
    required: true,
    description: 'Original URL to redirect to',
  })
  @ApiQuery({
    name: 'linkId',
    required: false,
    description: 'Link identifier',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to the original URL',
  })
  async trackClickRedirect(
    @Query('logId') logId: string,
    @Query('url') url: string,
    @Query('linkId') linkId: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    // Track the click
    await this.analyticsService.trackClick(logId, url, { linkId });

    // Redirect to original URL
    res.redirect(302, url);
  }

  // ========== HELPER METHODS ==========

  /**
   * Parse date range from query parameters
   * Defaults to last 30 days if not specified
   */
  private parseDateRange(
    fromStr?: string,
    toStr?: string,
  ): { from: Date; to: Date } {
    const to = toStr ? new Date(toStr) : new Date();
    const from = fromStr
      ? new Date(fromStr)
      : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    return { from, to };
  }
}
