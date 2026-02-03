/**
 * Notification Analytics DTOs (Sprint 1.5 - EXT-003)
 *
 * @description DTOs for notification delivery tracking, error logging, and analytics
 * @version 1.0 (2026-02-03)
 *
 * Exports:
 * 1. Delivery Status DTOs - Track notification delivery states
 * 2. Analytics Summary DTOs - Aggregate metrics and statistics
 * 3. Track Event DTOs - Open/click tracking payloads
 *
 * @see notification-delivery.service.ts
 * @see notification-error.service.ts
 * @see notification-analytics.service.ts
 * @see notification-analytics.controller.ts
 */

// Delivery Status DTOs
export {
  DeliveryStatus,
  DeliveryStatusType,
  ErrorCategory,
  ErrorCategoryType,
  DeliveryStatusDto,
  DeliveryStatusByChannelDto,
  NotificationErrorDto,
  ErrorListResponseDto,
} from './delivery-status.dto';

// Analytics Summary DTOs
export {
  ChannelMetricsDto,
  AnalyticsSummaryDto,
  TemplateAnalyticsDto,
  ChannelAnalyticsDto,
  TimeSeriesDataPointDto,
} from './analytics-summary.dto';

// Track Event DTOs
export {
  TrackOpenDto,
  TrackClickDto,
  TrackEventResponseDto,
  AnalyticsQueryDto,
  ErrorsQueryDto,
  WebhookDeliveryStatusDto,
} from './track-event.dto';
