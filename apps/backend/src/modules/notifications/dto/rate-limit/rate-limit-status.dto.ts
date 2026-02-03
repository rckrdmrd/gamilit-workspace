import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Rate limit result for a single channel
 */
export class ChannelRateLimitDto {
  @ApiProperty({
    description: 'Whether requests are currently allowed',
    example: true,
  })
  allowed!: boolean;

  @ApiProperty({
    description: 'Number of remaining requests in the current window',
    example: 45,
  })
  remaining!: number;

  @ApiProperty({
    description: 'When the rate limit window resets',
    example: '2026-02-03T14:30:00.000Z',
  })
  resetAt!: string;

  @ApiProperty({
    description: 'Maximum requests allowed in the window',
    example: 50,
  })
  limit!: number;

  @ApiProperty({
    description: 'Current number of requests in the window',
    example: 5,
  })
  current!: number;

  @ApiProperty({
    description: 'Window duration in seconds',
    example: 60,
  })
  windowSeconds!: number;
}

/**
 * Tenant usage status
 */
export class TenantUsageDto {
  @ApiProperty({
    description: 'Current number of notifications sent by tenant',
    example: 150,
  })
  current!: number;

  @ApiProperty({
    description: 'Maximum notifications allowed per hour',
    example: 1000,
  })
  limit!: number;

  @ApiProperty({
    description: 'Remaining notifications for the tenant',
    example: 850,
  })
  remaining!: number;

  @ApiProperty({
    description: 'When the tenant limit resets',
    example: '2026-02-03T15:00:00.000Z',
  })
  resetAt!: string;
}

/**
 * Complete rate limit status response
 */
export class RateLimitStatusDto {
  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId!: string;

  @ApiProperty({
    description: 'Rate limit status for each notification channel',
    type: 'object',
    additionalProperties: { type: 'object' },
    example: {
      in_app: {
        allowed: true,
        remaining: 45,
        resetAt: '2026-02-03T14:30:00.000Z',
        limit: 50,
        current: 5,
        windowSeconds: 60,
      },
      email: {
        allowed: true,
        remaining: 8,
        resetAt: '2026-02-03T15:00:00.000Z',
        limit: 10,
        current: 2,
        windowSeconds: 3600,
      },
    },
  })
  channels!: Record<string, ChannelRateLimitDto>;

  @ApiProperty({
    description: 'Global rate limit status across all channels',
    type: ChannelRateLimitDto,
  })
  global!: ChannelRateLimitDto;

  @ApiPropertyOptional({
    description: 'Tenant usage (if applicable)',
    type: TenantUsageDto,
  })
  tenantUsage?: TenantUsageDto;
}

/**
 * Channel configuration response
 */
export class ChannelConfigDto {
  @ApiProperty({
    description: 'Maximum requests allowed in the window',
    example: 50,
  })
  limit!: number;

  @ApiProperty({
    description: 'Window duration in seconds',
    example: 60,
  })
  windowSeconds!: number;
}

/**
 * All channel configurations response
 */
export class AllChannelConfigsDto {
  @ApiProperty({
    description: 'Configuration for each channel',
    type: 'object',
    additionalProperties: { $ref: '#/components/schemas/ChannelConfigDto' },
    example: {
      in_app: { limit: 50, windowSeconds: 60 },
      email: { limit: 10, windowSeconds: 3600 },
      push: { limit: 30, windowSeconds: 60 },
      sms: { limit: 5, windowSeconds: 3600 },
    },
  })
  channels!: Record<string, ChannelConfigDto>;

  @ApiProperty({
    description: 'Global user limit configuration',
    type: ChannelConfigDto,
  })
  globalUserLimit!: ChannelConfigDto;

  @ApiProperty({
    description: 'Tenant limit configuration',
    type: ChannelConfigDto,
  })
  tenantLimit!: ChannelConfigDto;
}
