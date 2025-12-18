import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Alert type enum for student intervention alerts
 */
export enum InterventionAlertType {
  NO_ACTIVITY = 'no_activity',
  LOW_SCORE = 'low_score',
  DECLINING_TREND = 'declining_trend',
  REPEATED_FAILURES = 'repeated_failures',
  EXCESSIVE_TIME = 'excessive_time',
  LOW_ENGAGEMENT = 'low_engagement',
}

/**
 * Severity levels for intervention alerts
 */
export enum InterventionSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Status values for intervention alerts
 */
export enum InterventionStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

/**
 * DTO for intervention alert response
 *
 * Maps to progress_tracking.student_intervention_alerts table
 */
export class InterventionAlertDto {
  @ApiProperty({ description: 'Alert ID (UUID)' })
    id!: string;

  @ApiProperty({ description: 'Student ID (UUID)' })
    student_id!: string;

  @ApiProperty({ description: 'Student full name' })
    student_name!: string;

  @ApiProperty({ description: 'Student email' })
    student_email!: string;

  @ApiPropertyOptional({ description: 'Classroom ID (UUID)' })
    classroom_id?: string;

  @ApiPropertyOptional({ description: 'Classroom name' })
    classroom_name?: string;

  @ApiProperty({
    enum: InterventionAlertType,
    description: 'Type of intervention alert',
    example: 'low_score',
  })
    alert_type!: InterventionAlertType;

  @ApiProperty({
    enum: InterventionSeverity,
    description: 'Severity level of the alert',
    example: 'high',
  })
    severity!: InterventionSeverity;

  @ApiProperty({ description: 'Alert title/summary' })
    title!: string;

  @ApiPropertyOptional({ description: 'Detailed alert description' })
    description?: string;

  @ApiPropertyOptional({
    description: 'Additional metrics and context data',
    example: { average_score: 45, exercises_failed: 3 },
  })
    metrics?: Record<string, unknown>;

  @ApiProperty({
    enum: InterventionStatus,
    description: 'Current status of the alert',
    default: 'active',
  })
    status!: InterventionStatus;

  @ApiProperty({ description: 'When the alert was generated' })
    generated_at!: Date;

  @ApiPropertyOptional({ description: 'When the alert was acknowledged' })
    acknowledged_at?: Date;

  @ApiPropertyOptional({ description: 'ID of admin who acknowledged' })
    acknowledged_by?: string;

  @ApiPropertyOptional({ description: 'Name of admin who acknowledged' })
    acknowledged_by_name?: string;

  @ApiPropertyOptional({ description: 'When the alert was resolved' })
    resolved_at?: Date;

  @ApiPropertyOptional({ description: 'ID of admin who resolved' })
    resolved_by?: string;

  @ApiPropertyOptional({ description: 'Name of admin who resolved' })
    resolved_by_name?: string;

  @ApiPropertyOptional({ description: 'Resolution notes' })
    resolution_notes?: string;

  @ApiProperty({ description: 'Tenant ID' })
    tenant_id!: string;

  @ApiProperty({ description: 'Record creation timestamp' })
    created_at!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
    updated_at!: Date;
}
