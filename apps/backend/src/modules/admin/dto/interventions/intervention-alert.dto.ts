import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  InterventionAlertType,
  InterventionAlertSeverity,
  InterventionAlertStatus,
} from '@/shared/types/intervention-alerts.types';

// =============================================================================
// RE-EXPORTS FROM SHARED TYPES (SINGLE SOURCE OF TRUTH)
// =============================================================================
// These enums are defined in @/shared/types/intervention-alerts.types.ts
// Re-exported here for convenience and backward compatibility
// =============================================================================

export { InterventionAlertType, InterventionAlertSeverity, InterventionAlertStatus };

// =============================================================================
// ALIASES FOR BACKWARD COMPATIBILITY
// =============================================================================
// Some code may use the shorter names. These aliases ensure compatibility.
// @deprecated Use InterventionAlertSeverity/InterventionAlertStatus instead
// =============================================================================

/** @deprecated Use InterventionAlertSeverity from @/shared/types */
export const InterventionSeverity = InterventionAlertSeverity;
/** @deprecated Use InterventionAlertSeverity from @/shared/types */
export type InterventionSeverity = InterventionAlertSeverity;

/** @deprecated Use InterventionAlertStatus from @/shared/types */
export const InterventionStatus = InterventionAlertStatus;
/** @deprecated Use InterventionAlertStatus from @/shared/types */
export type InterventionStatus = InterventionAlertStatus;

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
    enum: InterventionAlertSeverity,
    description: 'Severity level of the alert',
    example: 'high',
  })
    severity!: InterventionAlertSeverity;

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
    enum: InterventionAlertStatus,
    description: 'Current status of the alert',
    default: 'active',
  })
    status!: InterventionAlertStatus;

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
