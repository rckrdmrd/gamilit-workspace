import { IsOptional, IsEnum, IsUUID, IsInt, Min, Max, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { InterventionAlertType, InterventionSeverity, InterventionStatus } from './intervention-alert.dto';

/**
 * DTO for filtering and paginating intervention alerts
 */
export class ListInterventionsDto {
  @ApiPropertyOptional({
    enum: InterventionSeverity,
    description: 'Filter by severity level',
    example: 'high',
  })
  @IsOptional()
  @IsEnum(InterventionSeverity)
    severity?: InterventionSeverity;

  @ApiPropertyOptional({
    enum: InterventionStatus,
    description: 'Filter by alert status',
    example: 'active',
  })
  @IsOptional()
  @IsEnum(InterventionStatus)
    status?: InterventionStatus;

  @ApiPropertyOptional({
    enum: InterventionAlertType,
    description: 'Filter by alert type',
    example: 'low_score',
  })
  @IsOptional()
  @IsEnum(InterventionAlertType)
    alert_type?: InterventionAlertType;

  @ApiPropertyOptional({
    description: 'Filter by student ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
    student_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by classroom ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID()
    classroom_id?: string;

  @ApiPropertyOptional({
    description: 'Filter by alerts generated from this date (ISO 8601)',
    example: '2025-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
    date_from?: string;

  @ApiPropertyOptional({
    description: 'Filter by alerts generated until this date (ISO 8601)',
    example: '2025-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
    date_to?: string;

  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
    page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
    limit?: number = 20;
}
