import { IsString, IsEnum, IsNotEmpty, IsOptional, IsInt, IsObject, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AlertSeverity, AlertType } from './list-alerts.dto';

/**
 * DTO for creating a manual alert
 */
export class CreateAlertDto {
  @ApiProperty({ enum: AlertType, description: 'Type of alert' })
  @IsEnum(AlertType)
  @IsNotEmpty()
  alert_type!: AlertType;

  @ApiProperty({ enum: AlertSeverity, description: 'Severity level' })
  @IsEnum(AlertSeverity)
  @IsNotEmpty()
  severity!: AlertSeverity;

  @ApiProperty({ description: 'Alert title' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ description: 'Alert description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Source system that triggered the alert' })
  @IsOptional()
  @IsString()
  source_system?: string;

  @ApiPropertyOptional({ description: 'Source module that triggered the alert' })
  @IsOptional()
  @IsString()
  source_module?: string;

  @ApiPropertyOptional({ description: 'Number of affected users', default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  affected_users?: number;

  @ApiPropertyOptional({ description: 'Additional context data (JSON)' })
  @IsOptional()
  @IsObject()
  context_data?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Metrics data (JSON)' })
  @IsOptional()
  @IsObject()
  metrics?: Record<string, any>;
}
