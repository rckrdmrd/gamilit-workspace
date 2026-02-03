import {
  Injectable,
  Logger,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

/**
 * Rate limit check result
 */
export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  limit: number;
  current: number;
}

/**
 * Rate limit status for a user
 */
export interface RateLimitStatus {
  userId: string;
  channels: {
    [channel: string]: RateLimitResult;
  };
  global: RateLimitResult;
  tenantUsage?: {
    current: number;
    limit: number;
    remaining: number;
    resetAt: Date;
  };
}

/**
 * Channel configuration for rate limits
 */
interface ChannelConfig {
  limit: number;
  windowSeconds: number;
}

/**
 * NotificationRateLimitService
 *
 * @description Service for managing rate limits on notification sending
 * @version 1.0 (2026-02-03)
 *
 * Features:
 * - Per-user rate limiting by channel (in_app, email, push, sms)
 * - Global rate limiting per tenant
 * - Sliding window implementation using cache
 * - Configurable limits per channel
 *
 * Limits (default):
 * - in_app: 50/minute
 * - email: 10/hour
 * - push: 30/minute
 * - sms: 5/hour
 * - global user: 100/hour
 * - tenant: 1000/hour
 *
 * @see EXT-003 Multi-channel notifications
 */
@Injectable()
export class NotificationRateLimitService {
  private readonly logger = new Logger(NotificationRateLimitService.name);

  /**
   * Cache key prefixes
   */
  private static readonly KEY_PREFIX_USER_CHANNEL = 'rate:notification:user:';
  private static readonly KEY_PREFIX_USER_GLOBAL = 'rate:notification:global:';
  private static readonly KEY_PREFIX_TENANT = 'rate:notification:tenant:';

  /**
   * Default channel limits
   */
  private readonly channelLimits: Record<string, ChannelConfig> = {
    in_app: { limit: 50, windowSeconds: 60 },      // 50 per minute
    email: { limit: 10, windowSeconds: 3600 },     // 10 per hour
    push: { limit: 30, windowSeconds: 60 },        // 30 per minute
    sms: { limit: 5, windowSeconds: 3600 },        // 5 per hour
  };

  /**
   * Global user limit (across all channels)
   */
  private readonly globalUserLimit: ChannelConfig = {
    limit: 100,
    windowSeconds: 3600, // 100 per hour
  };

  /**
   * Tenant limit
   */
  private readonly tenantLimit: ChannelConfig = {
    limit: 1000,
    windowSeconds: 3600, // 1000 per hour
  };

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {
    this.loadConfigOverrides();
  }

  /**
   * Load configuration overrides from environment
   */
  private loadConfigOverrides(): void {
    const inAppLimit = this.configService.get<number>('RATE_LIMIT_NOTIFICATION_IN_APP');
    if (inAppLimit) {
      this.channelLimits.in_app.limit = inAppLimit;
    }

    const emailLimit = this.configService.get<number>('RATE_LIMIT_NOTIFICATION_EMAIL');
    if (emailLimit) {
      this.channelLimits.email.limit = emailLimit;
    }

    const pushLimit = this.configService.get<number>('RATE_LIMIT_NOTIFICATION_PUSH');
    if (pushLimit) {
      this.channelLimits.push.limit = pushLimit;
    }

    const smsLimit = this.configService.get<number>('RATE_LIMIT_NOTIFICATION_SMS');
    if (smsLimit) {
      this.channelLimits.sms.limit = smsLimit;
    }

    const globalLimit = this.configService.get<number>('RATE_LIMIT_NOTIFICATION_GLOBAL');
    if (globalLimit) {
      this.globalUserLimit.limit = globalLimit;
    }

    const tenantLimit = this.configService.get<number>('RATE_LIMIT_NOTIFICATION_TENANT');
    if (tenantLimit) {
      this.tenantLimit.limit = tenantLimit;
    }
  }

  /**
   * Check if a notification can be sent based on rate limits
   *
   * @param userId - User ID
   * @param channel - Notification channel
   * @param tenantId - Optional tenant ID for tenant-level limits
   * @returns Rate limit check result
   */
  async checkLimit(
    userId: string,
    channel: string,
    tenantId?: string,
  ): Promise<RateLimitResult> {
    // Check channel-specific limit
    const channelResult = await this.checkChannelLimit(userId, channel);
    if (!channelResult.allowed) {
      this.logger.warn(
        `Rate limit exceeded for user ${userId} on channel ${channel}`,
      );
      return channelResult;
    }

    // Check global user limit
    const globalResult = await this.checkGlobalUserLimit(userId);
    if (!globalResult.allowed) {
      this.logger.warn(
        `Global rate limit exceeded for user ${userId}`,
      );
      return globalResult;
    }

    // Check tenant limit if tenantId provided
    if (tenantId) {
      const tenantResult = await this.checkTenantLimit(tenantId);
      if (!tenantResult.allowed) {
        this.logger.warn(
          `Tenant rate limit exceeded for tenant ${tenantId}`,
        );
        return tenantResult;
      }
    }

    return channelResult;
  }

  /**
   * Check rate limit for a specific channel
   *
   * @param userId - User ID
   * @param channel - Channel name
   * @returns Rate limit result for the channel
   */
  async checkChannelLimit(
    userId: string,
    channel: string,
  ): Promise<RateLimitResult> {
    const config = this.getChannelConfig(channel);
    const key = `${NotificationRateLimitService.KEY_PREFIX_USER_CHANNEL}${userId}:${channel}`;

    return this.incrementAndCheck(key, config.limit, config.windowSeconds);
  }

  /**
   * Check global rate limit for a user
   *
   * @param userId - User ID
   * @returns Rate limit result
   */
  async checkGlobalUserLimit(userId: string): Promise<RateLimitResult> {
    const key = `${NotificationRateLimitService.KEY_PREFIX_USER_GLOBAL}${userId}`;

    return this.incrementAndCheck(
      key,
      this.globalUserLimit.limit,
      this.globalUserLimit.windowSeconds,
    );
  }

  /**
   * Check rate limit for a tenant
   *
   * @param tenantId - Tenant ID
   * @returns Rate limit result
   */
  async checkTenantLimit(tenantId: string): Promise<RateLimitResult> {
    const key = `${NotificationRateLimitService.KEY_PREFIX_TENANT}${tenantId}`;

    return this.incrementAndCheck(
      key,
      this.tenantLimit.limit,
      this.tenantLimit.windowSeconds,
    );
  }

  /**
   * Increment counter and check against limit
   *
   * Implements sliding window rate limiting using cache TTL
   *
   * @param key - Cache key
   * @param limit - Maximum allowed requests
   * @param windowSeconds - Time window in seconds
   * @returns Rate limit result
   */
  private async incrementAndCheck(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const resetAt = new Date(now + windowSeconds * 1000);

    try {
      // Get current count
      const currentValue = await this.cacheManager.get<number>(key);
      const current = currentValue ? currentValue + 1 : 1;

      // Set new value with TTL
      await this.cacheManager.set(key, current, windowSeconds * 1000);

      const allowed = current <= limit;
      const remaining = Math.max(0, limit - current);

      return {
        allowed,
        remaining,
        resetAt,
        limit,
        current,
      };
    } catch (error) {
      this.logger.error(`Error checking rate limit for key ${key}:`, error);
      // On error, allow the request (fail-open)
      return {
        allowed: true,
        remaining: limit,
        resetAt,
        limit,
        current: 0,
      };
    }
  }

  /**
   * Get rate limit status for a user
   *
   * @param userId - User ID
   * @param tenantId - Optional tenant ID
   * @returns Full rate limit status
   */
  async getStatus(userId: string, tenantId?: string): Promise<RateLimitStatus> {
    const channels: Record<string, RateLimitResult> = {};

    // Get status for each channel
    for (const channel of Object.keys(this.channelLimits)) {
      channels[channel] = await this.getChannelStatus(userId, channel);
    }

    // Get global status
    const global = await this.getGlobalStatus(userId);

    const status: RateLimitStatus = {
      userId,
      channels,
      global,
    };

    // Get tenant status if provided
    if (tenantId) {
      status.tenantUsage = await this.getTenantStatus(tenantId);
    }

    return status;
  }

  /**
   * Get current status for a channel (without incrementing)
   *
   * @param userId - User ID
   * @param channel - Channel name
   * @returns Current rate limit status
   */
  async getChannelStatus(
    userId: string,
    channel: string,
  ): Promise<RateLimitResult> {
    const config = this.getChannelConfig(channel);
    const key = `${NotificationRateLimitService.KEY_PREFIX_USER_CHANNEL}${userId}:${channel}`;

    return this.getCurrentStatus(key, config.limit, config.windowSeconds);
  }

  /**
   * Get global user status (without incrementing)
   *
   * @param userId - User ID
   * @returns Current rate limit status
   */
  async getGlobalStatus(userId: string): Promise<RateLimitResult> {
    const key = `${NotificationRateLimitService.KEY_PREFIX_USER_GLOBAL}${userId}`;

    return this.getCurrentStatus(
      key,
      this.globalUserLimit.limit,
      this.globalUserLimit.windowSeconds,
    );
  }

  /**
   * Get tenant status
   *
   * @param tenantId - Tenant ID
   * @returns Tenant usage status
   */
  async getTenantStatus(tenantId: string): Promise<{
    current: number;
    limit: number;
    remaining: number;
    resetAt: Date;
  }> {
    const key = `${NotificationRateLimitService.KEY_PREFIX_TENANT}${tenantId}`;
    const status = await this.getCurrentStatus(
      key,
      this.tenantLimit.limit,
      this.tenantLimit.windowSeconds,
    );

    return {
      current: status.current,
      limit: status.limit,
      remaining: status.remaining,
      resetAt: status.resetAt,
    };
  }

  /**
   * Get current status without incrementing
   *
   * @param key - Cache key
   * @param limit - Rate limit
   * @param windowSeconds - Window in seconds
   * @returns Current status
   */
  private async getCurrentStatus(
    key: string,
    limit: number,
    windowSeconds: number,
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const resetAt = new Date(now + windowSeconds * 1000);

    try {
      const current = (await this.cacheManager.get<number>(key)) || 0;
      const remaining = Math.max(0, limit - current);

      return {
        allowed: current < limit,
        remaining,
        resetAt,
        limit,
        current,
      };
    } catch (error) {
      this.logger.error(`Error getting status for key ${key}:`, error);
      return {
        allowed: true,
        remaining: limit,
        resetAt,
        limit,
        current: 0,
      };
    }
  }

  /**
   * Reset rate limit for a user on a specific channel
   *
   * Use with caution - mainly for admin/support purposes
   *
   * @param userId - User ID
   * @param channel - Channel name (or 'global' for global limit)
   */
  async resetLimit(userId: string, channel: string): Promise<void> {
    let key: string;

    if (channel === 'global') {
      key = `${NotificationRateLimitService.KEY_PREFIX_USER_GLOBAL}${userId}`;
    } else {
      key = `${NotificationRateLimitService.KEY_PREFIX_USER_CHANNEL}${userId}:${channel}`;
    }

    try {
      await this.cacheManager.del(key);
      this.logger.log(`Rate limit reset for user ${userId} on ${channel}`);
    } catch (error) {
      this.logger.error(`Error resetting rate limit for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Reset all rate limits for a user
   *
   * @param userId - User ID
   */
  async resetAllLimits(userId: string): Promise<void> {
    const channels = Object.keys(this.channelLimits);

    for (const channel of channels) {
      await this.resetLimit(userId, channel);
    }

    await this.resetLimit(userId, 'global');
    this.logger.log(`All rate limits reset for user ${userId}`);
  }

  /**
   * Get channel configuration
   *
   * @param channel - Channel name
   * @returns Channel configuration
   */
  private getChannelConfig(channel: string): ChannelConfig {
    return this.channelLimits[channel] || {
      limit: 10,
      windowSeconds: 60,
    };
  }

  /**
   * Get limit for a specific channel
   *
   * @param channel - Channel name
   * @returns Limit for the channel
   */
  getLimitForChannel(channel: string): number {
    return this.getChannelConfig(channel).limit;
  }

  /**
   * Get window for a specific channel
   *
   * @param channel - Channel name
   * @returns Window in seconds for the channel
   */
  getWindowForChannel(channel: string): number {
    return this.getChannelConfig(channel).windowSeconds;
  }

  /**
   * Get all channel configurations
   *
   * @returns All channel configurations
   */
  getAllChannelConfigs(): Record<string, ChannelConfig> {
    return { ...this.channelLimits };
  }

  /**
   * Check if sending to multiple channels is allowed
   *
   * @param userId - User ID
   * @param channels - Array of channels
   * @param tenantId - Optional tenant ID
   * @returns Object with allowed status for each channel
   */
  async checkMultipleChannels(
    userId: string,
    channels: string[],
    tenantId?: string,
  ): Promise<{
    allAllowed: boolean;
    results: Record<string, RateLimitResult>;
    blockedChannels: string[];
  }> {
    const results: Record<string, RateLimitResult> = {};
    const blockedChannels: string[] = [];

    // Check global limit first
    const globalResult = await this.checkGlobalUserLimit(userId);
    if (!globalResult.allowed) {
      // If global limit exceeded, all channels are blocked
      for (const channel of channels) {
        results[channel] = globalResult;
        blockedChannels.push(channel);
      }
      return { allAllowed: false, results, blockedChannels };
    }

    // Check tenant limit if provided
    if (tenantId) {
      const tenantResult = await this.checkTenantLimit(tenantId);
      if (!tenantResult.allowed) {
        for (const channel of channels) {
          results[channel] = tenantResult;
          blockedChannels.push(channel);
        }
        return { allAllowed: false, results, blockedChannels };
      }
    }

    // Check each channel
    for (const channel of channels) {
      const result = await this.checkChannelLimit(userId, channel);
      results[channel] = result;
      if (!result.allowed) {
        blockedChannels.push(channel);
      }
    }

    return {
      allAllowed: blockedChannels.length === 0,
      results,
      blockedChannels,
    };
  }

  /**
   * Record a notification send (for tracking purposes)
   *
   * This method increments the counters without checking limits.
   * Use when you want to track sends that bypassed rate limiting (e.g., system notifications)
   *
   * @param userId - User ID
   * @param channel - Channel name
   * @param tenantId - Optional tenant ID
   */
  async recordSend(
    userId: string,
    channel: string,
    tenantId?: string,
  ): Promise<void> {
    // Increment channel counter
    await this.checkChannelLimit(userId, channel);

    // Increment global counter
    await this.checkGlobalUserLimit(userId);

    // Increment tenant counter if provided
    if (tenantId) {
      await this.checkTenantLimit(tenantId);
    }
  }
}
