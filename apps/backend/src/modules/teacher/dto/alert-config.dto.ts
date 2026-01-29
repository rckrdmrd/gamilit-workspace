/**
 * Alert Configuration DTOs
 *
 * @description DTOs for teacher alert configuration endpoints
 * @module teacher/dto/alert-config
 * @since US-PM-007
 */

import {
  IsUUID,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Alert types that can be configured
 */
export enum AlertConfigType {
  NO_ACTIVITY = 'no_activity',
  LOW_SCORE = 'low_score',
  DECLINING_TREND = 'declining_trend',
  REPEATED_FAILURES = 'repeated_failures',
  EXCESSIVE_TIME = 'excessive_time',
  LOW_ENGAGEMENT = 'low_engagement',
}

/**
 * Threshold units for alert thresholds
 */
export enum ThresholdUnit {
  PERCENTAGE = 'percentage',
  DAYS = 'days',
  COUNT = 'count',
  MINUTES = 'minutes',
}

// ============================================================================
// CREATE DTO
// ============================================================================

/**
 * DTO for creating a new alert configuration
 *
 * @description Body for POST /teacher/alert-config
 */
export class CreateAlertConfigDto {
  @ApiPropertyOptional({
    description: 'Classroom ID for specific configuration. NULL for global config.',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @IsUUID()
  classroom_id?: string;

  @ApiProperty({
    enum: AlertConfigType,
    description: 'Type of alert to configure',
    example: AlertConfigType.NO_ACTIVITY,
  })
  @IsEnum(AlertConfigType)
  alert_type!: AlertConfigType;

  @ApiPropertyOptional({
    description: 'Whether this alert type is enabled',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  is_enabled?: boolean = true;

  @ApiPropertyOptional({
    description: 'Threshold value for triggering the alert',
    example: 7,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  threshold_value?: number;

  @ApiPropertyOptional({
    enum: ThresholdUnit,
    description: 'Unit for the threshold value',
    example: ThresholdUnit.DAYS,
  })
  @IsOptional()
  @IsEnum(ThresholdUnit)
  threshold_unit?: ThresholdUnit;

  @ApiPropertyOptional({
    description: 'Send email notifications',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  notify_email?: boolean = false;

  @ApiPropertyOptional({
    description: 'Show in-app notifications',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  notify_in_app?: boolean = true;

  @ApiPropertyOptional({
    description: 'Minimum hours between alerts for same student',
    minimum: 1,
    maximum: 168,
    default: 24,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(168)
  @Type(() => Number)
  cooldown_hours?: number = 24;

  @ApiPropertyOptional({
    description: 'Custom settings specific to alert type',
    example: { include_weekends: false },
  })
  @IsOptional()
  custom_settings?: Record<string, unknown>;
}

// ============================================================================
// UPDATE DTO
// ============================================================================

/**
 * DTO for updating an existing alert configuration
 *
 * @description Body for PUT /teacher/alert-config/:id
 */
export class UpdateAlertConfigDto {
  @ApiPropertyOptional({
    description: 'Whether this alert type is enabled',
  })
  @IsOptional()
  @IsBoolean()
  is_enabled?: boolean;

  @ApiPropertyOptional({
    description: 'Threshold value for triggering the alert',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  threshold_value?: number;

  @ApiPropertyOptional({
    enum: ThresholdUnit,
    description: 'Unit for the threshold value',
  })
  @IsOptional()
  @IsEnum(ThresholdUnit)
  threshold_unit?: ThresholdUnit;

  @ApiPropertyOptional({
    description: 'Send email notifications',
  })
  @IsOptional()
  @IsBoolean()
  notify_email?: boolean;

  @ApiPropertyOptional({
    description: 'Show in-app notifications',
  })
  @IsOptional()
  @IsBoolean()
  notify_in_app?: boolean;

  @ApiPropertyOptional({
    description: 'Minimum hours between alerts for same student',
    minimum: 1,
    maximum: 168,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(168)
  @Type(() => Number)
  cooldown_hours?: number;

  @ApiPropertyOptional({
    description: 'Custom settings specific to alert type',
  })
  @IsOptional()
  custom_settings?: Record<string, unknown>;
}

// ============================================================================
// QUERY DTOs
// ============================================================================

/**
 * DTO for querying alert configurations
 *
 * @description Query parameters for GET /teacher/alert-config
 */
export class GetAlertConfigQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by specific classroom. Omit for global configs.',
  })
  @IsOptional()
  @IsUUID()
  classroom_id?: string;

  @ApiPropertyOptional({
    enum: AlertConfigType,
    description: 'Filter by alert type',
  })
  @IsOptional()
  @IsEnum(AlertConfigType)
  alert_type?: AlertConfigType;

  @ApiPropertyOptional({
    description: 'Include only enabled or disabled configs',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_enabled?: boolean;
}

// ============================================================================
// RESPONSE DTOs
// ============================================================================

/**
 * DTO for alert configuration response
 *
 * @description Response DTO for alert configuration endpoints
 */
export class AlertConfigResponseDto {
  @ApiProperty({ description: 'Configuration ID' })
  id!: string;

  @ApiProperty({ description: 'Teacher ID' })
  teacher_id!: string;

  @ApiPropertyOptional({ description: 'Classroom ID (null for global)' })
  classroom_id?: string | null;

  @ApiPropertyOptional({ description: 'Classroom name (if applicable)' })
  classroom_name?: string | null;

  @ApiProperty({ enum: AlertConfigType, description: 'Alert type' })
  alert_type!: AlertConfigType;

  @ApiProperty({ description: 'Whether enabled' })
  is_enabled!: boolean;

  @ApiPropertyOptional({ description: 'Threshold value' })
  threshold_value?: number | null;

  @ApiPropertyOptional({ enum: ThresholdUnit, description: 'Threshold unit' })
  threshold_unit?: ThresholdUnit | null;

  @ApiProperty({ description: 'Email notifications enabled' })
  notify_email!: boolean;

  @ApiProperty({ description: 'In-app notifications enabled' })
  notify_in_app!: boolean;

  @ApiProperty({ description: 'Cooldown hours between alerts' })
  cooldown_hours!: number;

  @ApiPropertyOptional({ description: 'Custom settings' })
  custom_settings?: Record<string, unknown> | null;

  @ApiProperty({ description: 'Creation date (ISO 8601)' })
  created_at!: string;

  @ApiProperty({ description: 'Last update date (ISO 8601)' })
  updated_at!: string;
}

/**
 * DTO for default alert configuration values
 *
 * @description Response DTO for GET /teacher/alert-config/defaults
 */
export class AlertConfigDefaultsDto {
  @ApiProperty({ enum: AlertConfigType, description: 'Alert type' })
  alert_type!: AlertConfigType;

  @ApiProperty({ description: 'Human-readable label' })
  label!: string;

  @ApiProperty({ description: 'Description of this alert type' })
  description!: string;

  @ApiProperty({ description: 'Default threshold value' })
  default_threshold_value!: number;

  @ApiProperty({ enum: ThresholdUnit, description: 'Default threshold unit' })
  default_threshold_unit!: ThresholdUnit;

  @ApiProperty({ description: 'Default cooldown hours' })
  default_cooldown_hours!: number;
}

/**
 * DTO for list of alert configurations
 *
 * @description Response DTO for GET /teacher/alert-config
 */
export class AlertConfigListResponseDto {
  @ApiProperty({ type: [AlertConfigResponseDto], description: 'Array of configurations' })
  data!: AlertConfigResponseDto[];

  @ApiProperty({ description: 'Total count' })
  total!: number;
}
