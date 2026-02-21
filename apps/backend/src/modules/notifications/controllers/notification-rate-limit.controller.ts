import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '@modules/auth/guards';
import { AccountStatusGuard } from '@shared/guards/account-status.guard';
import { CurrentUser } from '@shared/decorators/current-user.decorator';
import { NotificationRateLimitService } from '../services/rate-limit.service';
import {
  RateLimitStatusDto,
  ChannelRateLimitDto,
  AllChannelConfigsDto,
} from '../dto/rate-limit';

/**
 * NotificationRateLimitController
 *
 * @description Controller for notification rate limit metrics and management
 * @version 1.0 (2026-02-03)
 *
 * Routes: /notifications/rate-limit/*
 *
 * Endpoints:
 * - GET /rate-limit/status - Get current rate limit status
 * - GET /rate-limit/config - Get rate limit configuration
 * - GET /rate-limit/channel/:channel - Get status for specific channel
 * - POST /rate-limit/reset/:channel - Reset rate limit for channel (admin only)
 *
 * @see EXT-003 Multi-channel notifications
 */
@ApiTags('notifications-rate-limit')
@Controller('notifications/rate-limit')
@UseGuards(JwtAuthGuard, AccountStatusGuard)
@ApiBearerAuth()
export class NotificationRateLimitController {
  constructor(
    private readonly rateLimitService: NotificationRateLimitService,
  ) {}

  /**
   * GET /notifications/rate-limit/status
   *
   * Get current rate limit status for the authenticated user
   */
  @Get('status')
  @ApiOperation({
    summary: 'Get rate limit status',
    description:
      'Returns the current rate limit status for all notification channels. ' +
      'Shows remaining requests, limits, and reset times.',
  })
  @ApiResponse({
    status: 200,
    description: 'Rate limit status retrieved successfully',
    type: RateLimitStatusDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated',
  })
  async getStatus(
    @CurrentUser('sub') userId: string,
    @CurrentUser('tenant_id') tenantId?: string,
  ): Promise<RateLimitStatusDto> {
    const status = await this.rateLimitService.getStatus(userId, tenantId);

    return this.mapToStatusDto(status);
  }

  /**
   * GET /notifications/rate-limit/config
   *
   * Get rate limit configuration for all channels
   */
  @Get('config')
  @ApiOperation({
    summary: 'Get rate limit configuration',
    description:
      'Returns the rate limit configuration for all notification channels. ' +
      'Shows limits and window durations.',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuration retrieved successfully',
    type: AllChannelConfigsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated',
  })
  async getConfig(): Promise<AllChannelConfigsDto> {
    const channels = this.rateLimitService.getAllChannelConfigs();

    return {
      channels: Object.entries(channels).reduce(
        (acc, [channel, config]) => {
          acc[channel] = {
            limit: config.limit,
            windowSeconds: config.windowSeconds,
          };
          return acc;
        },
        {} as Record<string, { limit: number; windowSeconds: number }>,
      ),
      globalUserLimit: {
        limit: 100,
        windowSeconds: 3600,
      },
      tenantLimit: {
        limit: 1000,
        windowSeconds: 3600,
      },
    };
  }

  /**
   * GET /notifications/rate-limit/channel/:channel
   *
   * Get rate limit status for a specific channel
   */
  @Get('channel/:channel')
  @ApiOperation({
    summary: 'Get rate limit status for channel',
    description:
      'Returns the current rate limit status for a specific notification channel.',
  })
  @ApiParam({
    name: 'channel',
    description: 'Notification channel',
    enum: ['in_app', 'email', 'push', 'sms'],
    example: 'email',
  })
  @ApiResponse({
    status: 200,
    description: 'Channel status retrieved successfully',
    type: ChannelRateLimitDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated',
  })
  async getChannelStatus(
    @Param('channel') channel: string,
    @CurrentUser('sub') userId: string,
  ): Promise<ChannelRateLimitDto> {
    const status = await this.rateLimitService.getChannelStatus(userId, channel);
    const config = this.rateLimitService.getWindowForChannel(channel);

    return {
      allowed: status.allowed,
      remaining: status.remaining,
      resetAt: status.resetAt.toISOString(),
      limit: status.limit,
      current: status.current,
      windowSeconds: config,
    };
  }

  /**
   * POST /notifications/rate-limit/reset/:channel
   *
   * Reset rate limit for a specific channel (admin only)
   */
  @Post('reset/:channel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset rate limit for channel (Admin only)',
    description:
      'Resets the rate limit counter for a specific channel. ' +
      'Only admins can use this endpoint.',
  })
  @ApiParam({
    name: 'channel',
    description: 'Notification channel or "global" for global limit',
    enum: ['in_app', 'email', 'push', 'sms', 'global'],
    example: 'email',
  })
  @ApiResponse({
    status: 200,
    description: 'Rate limit reset successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Rate limit reset for channel: email' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized (admin only)',
  })
  async resetChannelLimit(
    @Param('channel') channel: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
  ): Promise<{ success: boolean; message: string }> {
    // Only admins can reset rate limits
    if (role !== 'admin' && role !== 'super_admin') {
      throw new ForbiddenException('Only admins can reset rate limits');
    }

    await this.rateLimitService.resetLimit(userId, channel);

    return {
      success: true,
      message: `Rate limit reset for channel: ${channel}`,
    };
  }

  /**
   * POST /notifications/rate-limit/reset-all
   *
   * Reset all rate limits for the user (admin only)
   */
  @Post('reset-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset all rate limits (Admin only)',
    description:
      'Resets all rate limit counters for the authenticated user. ' +
      'Only admins can use this endpoint.',
  })
  @ApiResponse({
    status: 200,
    description: 'All rate limits reset successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'All rate limits reset' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Not authenticated',
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized (admin only)',
  })
  async resetAllLimits(
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
  ): Promise<{ success: boolean; message: string }> {
    // Only admins can reset rate limits
    if (role !== 'admin' && role !== 'super_admin') {
      throw new ForbiddenException('Only admins can reset rate limits');
    }

    await this.rateLimitService.resetAllLimits(userId);

    return {
      success: true,
      message: 'All rate limits reset',
    };
  }

  /**
   * Map internal status to DTO
   */
  private mapToStatusDto(status: any): RateLimitStatusDto { // eslint-disable-line @typescript-eslint/no-explicit-any
    const channels: Record<string, ChannelRateLimitDto> = {};

    for (const [channel, result] of Object.entries(status.channels)) {
      const r = result as any; // eslint-disable-line @typescript-eslint/no-explicit-any
      channels[channel] = {
        allowed: r.allowed,
        remaining: r.remaining,
        resetAt: r.resetAt.toISOString(),
        limit: r.limit,
        current: r.current,
        windowSeconds: this.rateLimitService.getWindowForChannel(channel),
      };
    }

    const dto: RateLimitStatusDto = {
      userId: status.userId,
      channels,
      global: {
        allowed: status.global.allowed,
        remaining: status.global.remaining,
        resetAt: status.global.resetAt.toISOString(),
        limit: status.global.limit,
        current: status.global.current,
        windowSeconds: 3600,
      },
    };

    if (status.tenantUsage) {
      dto.tenantUsage = {
        current: status.tenantUsage.current,
        limit: status.tenantUsage.limit,
        remaining: status.tenantUsage.remaining,
        resetAt: status.tenantUsage.resetAt.toISOString(),
      };
    }

    return dto;
  }
}
