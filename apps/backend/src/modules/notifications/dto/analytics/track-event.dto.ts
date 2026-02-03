import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsString, IsOptional, IsObject } from 'class-validator';

/**
 * TrackOpenDto
 *
 * @description DTO for tracking notification opens
 * @version 1.0 (2026-02-03) - Sprint 1.5 Audit
 *
 * Used in: POST /notifications/track/open
 *
 * Typically called via a tracking pixel embedded in emails:
 * <img src="https://api.gamilit.com/notifications/track/open?token=xxx" />
 */
export class TrackOpenDto {
  @ApiProperty({
    description: 'Notification log ID to track open for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  logId!: string;

  @ApiPropertyOptional({
    description: 'Tracking token for verification',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsOptional()
  token?: string;

  @ApiPropertyOptional({
    description: 'User agent string from request',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  })
  @IsString()
  @IsOptional()
  userAgent?: string;

  @ApiPropertyOptional({
    description: 'IP address of the opener',
    example: '192.168.1.100',
  })
  @IsString()
  @IsOptional()
  ipAddress?: string;
}

/**
 * TrackClickDto
 *
 * @description DTO for tracking notification link clicks
 * @version 1.0 (2026-02-03) - Sprint 1.5 Audit
 *
 * Used in: POST /notifications/track/click
 *
 * Links in notifications are wrapped with tracking URLs:
 * Original: https://gamilit.com/achievements/123
 * Wrapped: https://api.gamilit.com/notifications/track/click?logId=xxx&url=...
 */
export class TrackClickDto {
  @ApiProperty({
    description: 'Notification log ID to track click for',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  logId!: string;

  @ApiProperty({
    description: 'Original URL that was clicked',
    example: 'https://gamilit.com/achievements/123',
  })
  @IsString()
  url!: string;

  @ApiPropertyOptional({
    description: 'Link identifier within the notification',
    example: 'cta_primary',
  })
  @IsString()
  @IsOptional()
  linkId?: string;

  @ApiPropertyOptional({
    description: 'Tracking token for verification',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsOptional()
  token?: string;

  @ApiPropertyOptional({
    description: 'User agent string from request',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  })
  @IsString()
  @IsOptional()
  userAgent?: string;

  @ApiPropertyOptional({
    description: 'IP address of the clicker',
    example: '192.168.1.100',
  })
  @IsString()
  @IsOptional()
  ipAddress?: string;
}

/**
 * TrackEventResponseDto
 *
 * @description Response for track open/click endpoints
 */
export class TrackEventResponseDto {
  @ApiProperty({
    description: 'Whether the event was tracked successfully',
    example: true,
  })
  success!: boolean;

  @ApiPropertyOptional({
    description: 'Message about the tracking result',
    example: 'Open event tracked successfully',
  })
  message?: string;

  @ApiPropertyOptional({
    description: 'Redirect URL for click tracking',
    example: 'https://gamilit.com/achievements/123',
  })
  redirectUrl?: string;
}

/**
 * AnalyticsQueryDto
 *
 * @description Query parameters for analytics endpoints
 */
export class AnalyticsQueryDto {
  @ApiPropertyOptional({
    description: 'Start date for analytics period (ISO 8601)',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsString()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({
    description: 'End date for analytics period (ISO 8601)',
    example: '2026-02-03T23:59:59.000Z',
  })
  @IsString()
  @IsOptional()
  to?: string;

  @ApiPropertyOptional({
    description: 'Granularity for time series data',
    enum: ['hour', 'day', 'week', 'month'],
    example: 'day',
  })
  @IsString()
  @IsOptional()
  granularity?: 'hour' | 'day' | 'week' | 'month';

  @ApiPropertyOptional({
    description: 'Filter by notification type',
    example: 'achievement',
  })
  @IsString()
  @IsOptional()
  type?: string;
}

/**
 * ErrorsQueryDto
 *
 * @description Query parameters for error list endpoints
 */
export class ErrorsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by error category',
    enum: ['validation', 'provider', 'network', 'rate_limit', 'unknown'],
    example: 'provider',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    description: 'Filter by notification channel',
    enum: ['in_app', 'email', 'push', 'sms'],
    example: 'email',
  })
  @IsString()
  @IsOptional()
  channel?: string;

  @ApiPropertyOptional({
    description: 'Start date filter (ISO 8601)',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsString()
  @IsOptional()
  from?: string;

  @ApiPropertyOptional({
    description: 'End date filter (ISO 8601)',
    example: '2026-02-03T23:59:59.000Z',
  })
  @IsString()
  @IsOptional()
  to?: string;

  @ApiPropertyOptional({
    description: 'Pagination offset',
    example: 0,
  })
  @IsOptional()
  offset?: number;

  @ApiPropertyOptional({
    description: 'Pagination limit',
    example: 20,
  })
  @IsOptional()
  limit?: number;
}

/**
 * WebhookDeliveryStatusDto
 *
 * @description DTO for receiving delivery status updates via webhook
 */
export class WebhookDeliveryStatusDto {
  @ApiProperty({
    description: 'External message ID from provider',
    example: 'msg_123456789',
  })
  @IsString()
  externalId!: string;

  @ApiProperty({
    description: 'New delivery status',
    enum: ['delivered', 'failed', 'bounced'],
    example: 'delivered',
  })
  @IsString()
  status!: 'delivered' | 'failed' | 'bounced';

  @ApiPropertyOptional({
    description: 'Timestamp of the status change',
    example: '2026-02-03T10:30:05.000Z',
  })
  @IsString()
  @IsOptional()
  timestamp?: string;

  @ApiPropertyOptional({
    description: 'Provider-specific details',
    example: { bounce_type: 'hard', reason: 'invalid_address' },
  })
  @IsObject()
  @IsOptional()
  details?: Record<string, unknown>;
}
