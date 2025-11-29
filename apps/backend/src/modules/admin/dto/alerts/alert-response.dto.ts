import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AlertSeverity, AlertStatus, AlertType } from './list-alerts.dto';

/**
 * DTO for alert response
 */
export class AlertResponseDto {
  @ApiProperty({ description: 'Alert ID' })
    id!: string;

  @ApiPropertyOptional({ description: 'Tenant ID' })
    tenant_id?: string;

  @ApiProperty({ enum: AlertType, description: 'Alert type' })
    alert_type!: AlertType;

  @ApiProperty({ enum: AlertSeverity, description: 'Severity level' })
    severity!: AlertSeverity;

  @ApiProperty({ description: 'Alert title' })
    title!: string;

  @ApiPropertyOptional({ description: 'Alert description' })
    description?: string;

  @ApiPropertyOptional({ description: 'Source system' })
    source_system?: string;

  @ApiPropertyOptional({ description: 'Source module' })
    source_module?: string;

  @ApiPropertyOptional({ description: 'Error code' })
    error_code?: string;

  @ApiProperty({ description: 'Number of affected users', default: 0 })
    affected_users!: number;

  @ApiProperty({ enum: AlertStatus, description: 'Alert status', default: 'open' })
    status!: AlertStatus;

  @ApiPropertyOptional({ description: 'Acknowledgment note' })
    acknowledgment_note?: string;

  @ApiPropertyOptional({ description: 'Resolution note' })
    resolution_note?: string;

  @ApiPropertyOptional({ description: 'User ID who acknowledged' })
    acknowledged_by?: string;

  @ApiPropertyOptional({ description: 'Name of user who acknowledged' })
    acknowledged_by_name?: string;

  @ApiPropertyOptional({ description: 'Acknowledgment timestamp' })
    acknowledged_at?: Date;

  @ApiPropertyOptional({ description: 'User ID who resolved' })
    resolved_by?: string;

  @ApiPropertyOptional({ description: 'Name of user who resolved' })
    resolved_by_name?: string;

  @ApiPropertyOptional({ description: 'Resolution timestamp' })
    resolved_at?: Date;

  @ApiProperty({ description: 'Notification sent flag', default: false })
    notification_sent!: boolean;

  @ApiProperty({ description: 'Escalation level', default: 1 })
    escalation_level!: number;

  @ApiProperty({ description: 'Auto-resolve flag', default: false })
    auto_resolve!: boolean;

  @ApiProperty({ description: 'Suppress similar alerts flag', default: false })
    suppress_similar!: boolean;

  @ApiPropertyOptional({ description: 'Additional context data' })
    context_data?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Metrics data' })
    metrics?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Related alert IDs', type: [String] })
    related_alerts?: string[];

  @ApiProperty({ description: 'Alert trigger timestamp' })
    triggered_at!: Date;

  @ApiProperty({ description: 'Creation timestamp' })
    created_at!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
    updated_at!: Date;
}
