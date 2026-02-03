import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Delivery Status Enum values
 *
 * @description Possible states for notification delivery tracking
 */
export const DeliveryStatus = {
  PENDING: 'pending',
  SENT: 'sent',
  DELIVERED: 'delivered',
  FAILED: 'failed',
  BOUNCED: 'bounced',
} as const;

export type DeliveryStatusType = (typeof DeliveryStatus)[keyof typeof DeliveryStatus];

/**
 * Error Category Enum values
 *
 * @description Categories for notification errors
 */
export const ErrorCategory = {
  VALIDATION: 'validation',
  PROVIDER: 'provider',
  NETWORK: 'network',
  RATE_LIMIT: 'rate_limit',
  UNKNOWN: 'unknown',
} as const;

export type ErrorCategoryType = (typeof ErrorCategory)[keyof typeof ErrorCategory];

/**
 * DeliveryStatusDto
 *
 * @description DTO for notification delivery status response
 * @version 1.0 (2026-02-03) - Sprint 1.5 Audit
 *
 * Used in: GET /notifications/delivery/:notificationId
 */
export class DeliveryStatusDto {
  @ApiProperty({
    description: 'Notification ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  notificationId!: string;

  @ApiProperty({
    description: 'Current delivery status',
    enum: ['pending', 'sent', 'delivered', 'failed', 'bounced'],
    example: 'delivered',
  })
  status!: DeliveryStatusType;

  @ApiProperty({
    description: 'Delivery channel',
    enum: ['in_app', 'email', 'push', 'sms'],
    example: 'email',
  })
  channel!: string;

  @ApiPropertyOptional({
    description: 'When the notification was sent to provider',
    example: '2026-02-03T10:30:00.000Z',
  })
  sentAt?: string;

  @ApiPropertyOptional({
    description: 'When the notification was confirmed delivered',
    example: '2026-02-03T10:30:05.000Z',
  })
  deliveredAt?: string;

  @ApiPropertyOptional({
    description: 'External provider message ID',
    example: 'msg_123456789',
  })
  externalId?: string;

  @ApiPropertyOptional({
    description: 'Provider response metadata',
    example: { status_code: 200, message_id: 'msg_123' },
  })
  providerResponse?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Error message if delivery failed',
    example: 'Invalid email address',
  })
  errorMessage?: string;

  @ApiPropertyOptional({
    description: 'Number of retry attempts',
    example: 2,
  })
  retryCount?: number;

  @ApiPropertyOptional({
    description: 'Last retry attempt timestamp',
    example: '2026-02-03T10:35:00.000Z',
  })
  lastRetryAt?: string;
}

/**
 * DeliveryStatusByChannelDto
 *
 * @description DTO for delivery status grouped by channel
 */
export class DeliveryStatusByChannelDto {
  @ApiProperty({
    description: 'Notification ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  notificationId!: string;

  @ApiProperty({
    description: 'User ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId!: string;

  @ApiProperty({
    description: 'Notification title',
    example: 'Achievement Unlocked!',
  })
  title!: string;

  @ApiProperty({
    description: 'Delivery status for each channel',
    type: 'object',
    additionalProperties: { $ref: '#/components/schemas/DeliveryStatusDto' },
    example: {
      email: {
        status: 'delivered',
        sentAt: '2026-02-03T10:30:00.000Z',
        deliveredAt: '2026-02-03T10:30:05.000Z',
      },
      push: {
        status: 'sent',
        sentAt: '2026-02-03T10:30:01.000Z',
      },
    },
  })
  channels!: Record<string, DeliveryStatusDto>;

  @ApiProperty({
    description: 'When the notification was created',
    example: '2026-02-03T10:29:55.000Z',
  })
  createdAt!: string;
}

/**
 * NotificationErrorDto
 *
 * @description DTO for detailed notification error information
 */
export class NotificationErrorDto {
  @ApiProperty({
    description: 'Error log ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    description: 'Notification ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  notificationId!: string;

  @ApiProperty({
    description: 'Error category',
    enum: ['validation', 'provider', 'network', 'rate_limit', 'unknown'],
    example: 'provider',
  })
  category!: ErrorCategoryType;

  @ApiProperty({
    description: 'Error code from provider or system',
    example: 'INVALID_RECIPIENT',
  })
  code!: string;

  @ApiProperty({
    description: 'Human readable error message',
    example: 'The recipient email address is invalid',
  })
  message!: string;

  @ApiPropertyOptional({
    description: 'Stack trace for debugging',
    example: 'Error: Invalid email\\n    at validateEmail...',
  })
  stackTrace?: string;

  @ApiPropertyOptional({
    description: 'Raw provider response',
    example: { error: { code: 400, message: 'Bad Request' } },
  })
  providerResponse?: Record<string, unknown>;

  @ApiProperty({
    description: 'Notification channel where error occurred',
    example: 'email',
  })
  channel!: string;

  @ApiProperty({
    description: 'Number of retry attempts',
    example: 3,
  })
  retryAttempts!: number;

  @ApiPropertyOptional({
    description: 'Last retry attempt timestamp',
    example: '2026-02-03T10:35:00.000Z',
  })
  lastRetryAt?: string;

  @ApiProperty({
    description: 'When the error occurred',
    example: '2026-02-03T10:30:00.000Z',
  })
  createdAt!: string;
}

/**
 * ErrorListResponseDto
 *
 * @description DTO for paginated error list response
 */
export class ErrorListResponseDto {
  @ApiProperty({
    description: 'List of errors',
    type: [NotificationErrorDto],
  })
  errors!: NotificationErrorDto[];

  @ApiProperty({
    description: 'Total number of errors',
    example: 45,
  })
  total!: number;

  @ApiProperty({
    description: 'Current page offset',
    example: 0,
  })
  offset!: number;

  @ApiProperty({
    description: 'Page size limit',
    example: 20,
  })
  limit!: number;
}
