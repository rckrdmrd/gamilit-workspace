import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * ChannelMetricsDto
 *
 * @description Metrics for a single notification channel
 * @version 1.0 (2026-02-03) - Sprint 1.5 Audit
 */
export class ChannelMetricsDto {
  @ApiProperty({
    description: 'Total notifications sent through this channel',
    example: 1500,
  })
  totalSent!: number;

  @ApiProperty({
    description: 'Total notifications delivered successfully',
    example: 1450,
  })
  totalDelivered!: number;

  @ApiProperty({
    description: 'Total notifications that failed to deliver',
    example: 35,
  })
  totalFailed!: number;

  @ApiProperty({
    description: 'Total notifications that bounced',
    example: 15,
  })
  totalBounced!: number;

  @ApiProperty({
    description: 'Total notifications opened (email/push)',
    example: 890,
  })
  totalOpened!: number;

  @ApiProperty({
    description: 'Total link clicks tracked',
    example: 450,
  })
  totalClicked!: number;

  @ApiProperty({
    description: 'Delivery rate percentage (delivered/sent * 100)',
    example: 96.67,
  })
  deliveryRate!: number;

  @ApiProperty({
    description: 'Open rate percentage (opened/delivered * 100)',
    example: 61.38,
  })
  openRate!: number;

  @ApiProperty({
    description: 'Click rate percentage (clicked/opened * 100)',
    example: 50.56,
  })
  clickRate!: number;

  @ApiProperty({
    description: 'Bounce rate percentage (bounced/sent * 100)',
    example: 1.0,
  })
  bounceRate!: number;
}

/**
 * AnalyticsSummaryDto
 *
 * @description Overall analytics summary for notifications
 * @version 1.0 (2026-02-03) - Sprint 1.5 Audit
 *
 * Used in: GET /notifications/analytics/summary
 */
export class AnalyticsSummaryDto {
  @ApiProperty({
    description: 'Start of the analytics period',
    example: '2026-01-01T00:00:00.000Z',
  })
  periodStart!: string;

  @ApiProperty({
    description: 'End of the analytics period',
    example: '2026-02-03T23:59:59.000Z',
  })
  periodEnd!: string;

  @ApiProperty({
    description: 'Total notifications created in period',
    example: 5000,
  })
  totalNotifications!: number;

  @ApiProperty({
    description: 'Total unique users who received notifications',
    example: 1200,
  })
  uniqueUsers!: number;

  @ApiProperty({
    description: 'Overall metrics across all channels',
    type: ChannelMetricsDto,
  })
  overall!: ChannelMetricsDto;

  @ApiProperty({
    description: 'Metrics broken down by channel',
    type: 'object',
    additionalProperties: { $ref: '#/components/schemas/ChannelMetricsDto' },
    example: {
      email: {
        totalSent: 1500,
        totalDelivered: 1450,
        totalFailed: 35,
        totalBounced: 15,
        totalOpened: 890,
        totalClicked: 450,
        deliveryRate: 96.67,
        openRate: 61.38,
        clickRate: 50.56,
        bounceRate: 1.0,
      },
      push: {
        totalSent: 2000,
        totalDelivered: 1950,
        totalFailed: 50,
        totalBounced: 0,
        totalOpened: 1200,
        totalClicked: 300,
        deliveryRate: 97.5,
        openRate: 61.54,
        clickRate: 25.0,
        bounceRate: 0,
      },
    },
  })
  byChannel!: Record<string, ChannelMetricsDto>;
}

/**
 * TemplateAnalyticsDto
 *
 * @description Analytics for a specific notification template
 * @version 1.0 (2026-02-03) - Sprint 1.5 Audit
 *
 * Used in: GET /notifications/analytics/by-template/:templateKey
 */
export class TemplateAnalyticsDto {
  @ApiProperty({
    description: 'Template unique key',
    example: 'achievement_unlocked',
  })
  templateKey!: string;

  @ApiProperty({
    description: 'Template name',
    example: 'Achievement Unlocked',
  })
  templateName!: string;

  @ApiProperty({
    description: 'Start of the analytics period',
    example: '2026-01-01T00:00:00.000Z',
  })
  periodStart!: string;

  @ApiProperty({
    description: 'End of the analytics period',
    example: '2026-02-03T23:59:59.000Z',
  })
  periodEnd!: string;

  @ApiProperty({
    description: 'Total notifications sent using this template',
    example: 850,
  })
  totalSent!: number;

  @ApiProperty({
    description: 'Metrics for this template',
    type: ChannelMetricsDto,
  })
  metrics!: ChannelMetricsDto;

  @ApiProperty({
    description: 'Metrics broken down by channel',
    type: 'object',
    additionalProperties: { $ref: '#/components/schemas/ChannelMetricsDto' },
  })
  byChannel!: Record<string, ChannelMetricsDto>;

  @ApiPropertyOptional({
    description: 'Comparison with previous period (percentage change)',
    example: {
      totalSent: 15.5,
      deliveryRate: 2.3,
      openRate: -1.2,
      clickRate: 5.8,
    },
  })
  comparison?: {
    totalSent: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
  };
}

/**
 * ChannelAnalyticsDto
 *
 * @description Analytics for a specific notification channel
 * @version 1.0 (2026-02-03) - Sprint 1.5 Audit
 *
 * Used in: GET /notifications/analytics/by-channel/:channel
 */
export class ChannelAnalyticsDto {
  @ApiProperty({
    description: 'Notification channel',
    enum: ['in_app', 'email', 'push', 'sms'],
    example: 'email',
  })
  channel!: string;

  @ApiProperty({
    description: 'Start of the analytics period',
    example: '2026-01-01T00:00:00.000Z',
  })
  periodStart!: string;

  @ApiProperty({
    description: 'End of the analytics period',
    example: '2026-02-03T23:59:59.000Z',
  })
  periodEnd!: string;

  @ApiProperty({
    description: 'Metrics for this channel',
    type: ChannelMetricsDto,
  })
  metrics!: ChannelMetricsDto;

  @ApiProperty({
    description: 'Top performing templates for this channel',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        templateKey: { type: 'string' },
        templateName: { type: 'string' },
        totalSent: { type: 'number' },
        openRate: { type: 'number' },
        clickRate: { type: 'number' },
      },
    },
    example: [
      {
        templateKey: 'achievement_unlocked',
        templateName: 'Achievement Unlocked',
        totalSent: 500,
        openRate: 72.5,
        clickRate: 45.2,
      },
    ],
  })
  topTemplates!: {
    templateKey: string;
    templateName: string;
    totalSent: number;
    openRate: number;
    clickRate: number;
  }[];

  @ApiProperty({
    description: 'Daily metrics for trend analysis',
    type: 'array',
    items: {
      type: 'object',
      properties: {
        date: { type: 'string' },
        sent: { type: 'number' },
        delivered: { type: 'number' },
        opened: { type: 'number' },
        clicked: { type: 'number' },
      },
    },
  })
  dailyTrend!: {
    date: string;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  }[];
}

/**
 * TimeSeriesDataPointDto
 *
 * @description Single data point for time series analytics
 */
export class TimeSeriesDataPointDto {
  @ApiProperty({
    description: 'Timestamp for this data point',
    example: '2026-02-03T00:00:00.000Z',
  })
  timestamp!: string;

  @ApiProperty({
    description: 'Count of notifications',
    example: 150,
  })
  count!: number;

  @ApiPropertyOptional({
    description: 'Additional breakdown data',
    example: { delivered: 145, failed: 5 },
  })
  breakdown?: Record<string, number>;
}
