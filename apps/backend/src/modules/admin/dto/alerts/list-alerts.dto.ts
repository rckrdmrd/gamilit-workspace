import { IsOptional, IsString, IsEnum, IsDateString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Alert severity levels
 */
export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Alert status
 */
export enum AlertStatus {
  OPEN = 'open',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  SUPPRESSED = 'suppressed',
}

/**
 * Alert types
 */
export enum AlertType {
  PERFORMANCE_DEGRADATION = 'performance_degradation',
  HIGH_ERROR_RATE = 'high_error_rate',
  SECURITY_BREACH = 'security_breach',
  RESOURCE_LIMIT = 'resource_limit',
  SERVICE_OUTAGE = 'service_outage',
  DATA_ANOMALY = 'data_anomaly',
}

/**
 * DTO for listing alerts with filters and pagination
 */
export class ListAlertsDto {
  @ApiPropertyOptional({ enum: AlertSeverity, description: 'Filter by severity' })
  @IsOptional()
  @IsEnum(AlertSeverity)
  severity?: AlertSeverity;

  @ApiPropertyOptional({ enum: AlertStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(AlertStatus)
  status?: AlertStatus;

  @ApiPropertyOptional({ enum: AlertType, description: 'Filter by alert type' })
  @IsOptional()
  @IsEnum(AlertType)
  alert_type?: AlertType;

  @ApiPropertyOptional({ description: 'Filter alerts from this date' })
  @IsOptional()
  @IsDateString()
  date_from?: string;

  @ApiPropertyOptional({ description: 'Filter alerts until this date' })
  @IsOptional()
  @IsDateString()
  date_to?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
