import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { NotificationRateLimitService } from '../services/rate-limit.service';

/**
 * Metadata key for rate limit channel
 */
export const RATE_LIMIT_CHANNEL_KEY = 'rate_limit_channel';

/**
 * Decorator to specify rate limit channel for an endpoint
 *
 * @param channel - Channel name (in_app, email, push, sms)
 *
 * @example
 * @RateLimitChannel('email')
 * @Post('send-email')
 * async sendEmail() {}
 */
export const RateLimitChannel = (channel: string) =>
  SetMetadata(RATE_LIMIT_CHANNEL_KEY, channel);

/**
 * Metadata key to skip rate limiting
 */
export const SKIP_RATE_LIMIT_KEY = 'skip_rate_limit';

/**
 * Decorator to skip rate limiting for an endpoint
 *
 * Use with caution - only for internal system endpoints
 *
 * @example
 * @SkipRateLimit()
 * @Post('system-notification')
 * async systemNotification() {}
 */
export const SkipRateLimit = () => SetMetadata(SKIP_RATE_LIMIT_KEY, true);

/**
 * NotificationRateLimitGuard
 *
 * @description Guard that enforces rate limits on notification endpoints
 * @version 1.0 (2026-02-03)
 *
 * Features:
 * - Checks rate limits before allowing notification sends
 * - Extracts user from JWT payload (req.user.sub)
 * - Extracts channel from request body or decorator
 * - Returns 429 Too Many Requests with retry info
 *
 * Usage:
 * 1. Add to controller: @UseGuards(NotificationRateLimitGuard)
 * 2. Optionally specify channel: @RateLimitChannel('email')
 * 3. Skip for system endpoints: @SkipRateLimit()
 *
 * @see NotificationRateLimitService
 */
@Injectable()
export class NotificationRateLimitGuard implements CanActivate {
  constructor(
    private readonly rateLimitService: NotificationRateLimitService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if rate limiting should be skipped
    const skipRateLimit = this.reflector.getAllAndOverride<boolean>(
      SKIP_RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (skipRateLimit) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // If no user, skip rate limiting (authentication will handle this)
    if (!user || !user.sub) {
      return true;
    }

    const userId = user.sub;
    const tenantId = user.tenant_id || user.tenantId;

    // Get channel from decorator or request body
    const decoratorChannel = this.reflector.getAllAndOverride<string>(
      RATE_LIMIT_CHANNEL_KEY,
      [context.getHandler(), context.getClass()],
    );

    const channels = this.extractChannels(request, decoratorChannel);

    // If no channels specified, use default (in_app)
    if (channels.length === 0) {
      channels.push('in_app');
    }

    // Check rate limits for all channels
    const { allAllowed, results, blockedChannels } =
      await this.rateLimitService.checkMultipleChannels(
        userId,
        channels,
        tenantId,
      );

    if (!allAllowed) {
      // Find the channel with the longest wait time
      let longestWait = 0;
      let resetAt = new Date();

      for (const channel of blockedChannels) {
        const result = results[channel];
        const waitTime = result.resetAt.getTime() - Date.now();
        if (waitTime > longestWait) {
          longestWait = waitTime;
          resetAt = result.resetAt;
        }
      }

      // Get the first blocked channel's result for details
      const firstBlockedResult = results[blockedChannels[0]];

      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Requests',
          message: `Rate limit exceeded for notification channels: ${blockedChannels.join(', ')}`,
          details: {
            blockedChannels,
            limit: firstBlockedResult.limit,
            current: firstBlockedResult.current,
            remaining: 0,
            resetAt: resetAt.toISOString(),
            retryAfterSeconds: Math.ceil(longestWait / 1000),
          },
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Add rate limit info to request for potential use in response headers
    request.rateLimitInfo = {
      channels: results,
      userId,
    };

    return true;
  }

  /**
   * Extract channels from request
   *
   * @param request - HTTP request
   * @param decoratorChannel - Channel from decorator
   * @returns Array of channels
   */
  private extractChannels(
    request: any,
    decoratorChannel?: string,
  ): string[] {
    // Priority 1: Decorator channel
    if (decoratorChannel) {
      return [decoratorChannel];
    }

    // Priority 2: Channels from request body
    const body = request.body || {};
    if (body.channels && Array.isArray(body.channels)) {
      return body.channels;
    }

    // Priority 3: Single channel from body
    if (body.channel) {
      return [body.channel];
    }

    // Default: empty (will use 'in_app' as default)
    return [];
  }
}
