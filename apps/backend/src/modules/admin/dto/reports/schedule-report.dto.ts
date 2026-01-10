/**
 * Schedule Report DTOs
 *
 * DTOs for scheduling automatic report generation.
 *
 * @author Claude Code Agent
 * @date 2026-01-07
 * @task TASK-ADMIN-REPORTS-SCHEDULE
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsString,
  IsNumber,
  IsArray,
  IsEmail,
  IsOptional,
  IsIn,
  Min,
  Max,
} from 'class-validator';

/**
 * DTO for scheduling report generation
 */
export class ScheduleReportDto {
  @ApiProperty({
    description: 'Whether the schedule is enabled',
    example: true,
  })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({
    description: 'Frequency of report generation',
    enum: ['daily', 'weekly', 'monthly'],
    example: 'weekly',
  })
  @IsString()
  @IsIn(['daily', 'weekly', 'monthly'])
  frequency: 'daily' | 'weekly' | 'monthly';

  @ApiPropertyOptional({
    description: 'Hour of day to generate report (0-23)',
    example: 8,
    default: 8,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(23)
  hour?: number = 8;

  @ApiPropertyOptional({
    description: 'Day of week for weekly reports (0=Sunday, 6=Saturday)',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(6)
  day_of_week?: number;

  @ApiPropertyOptional({
    description: 'Day of month for monthly reports (1-28)',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(28)
  day_of_month?: number;

  @ApiPropertyOptional({
    description: 'Email recipients for the scheduled report',
    type: [String],
    example: ['admin@example.com', 'reports@example.com'],
  })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  recipients?: string[];
}

/**
 * Schedule configuration stored in report metadata
 */
export class ReportScheduleConfigDto {
  @ApiProperty({ description: 'Whether schedule is enabled' })
  enabled: boolean;

  @ApiProperty({ description: 'Schedule frequency' })
  frequency: 'daily' | 'weekly' | 'monthly';

  @ApiProperty({ description: 'Hour of day (0-23)' })
  hour: number;

  @ApiPropertyOptional({ description: 'Day of week (0-6)' })
  day_of_week?: number;

  @ApiPropertyOptional({ description: 'Day of month (1-28)' })
  day_of_month?: number;

  @ApiPropertyOptional({ description: 'Email recipients' })
  recipients?: string[];

  @ApiProperty({ description: 'When schedule was configured' })
  configured_at: string;

  @ApiProperty({ description: 'Who configured the schedule' })
  configured_by: string;

  @ApiPropertyOptional({ description: 'Next scheduled run time' })
  next_run_at?: string;

  @ApiPropertyOptional({ description: 'Last run time' })
  last_run_at?: string;
}

/**
 * Response for schedule report endpoint
 */
export class ScheduleReportResponseDto {
  @ApiProperty({ description: 'Report ID' })
  id: string;

  @ApiProperty({ description: 'Report type' })
  type: string;

  @ApiProperty({ description: 'Report format' })
  format: string;

  @ApiProperty({ description: 'Schedule configuration' })
  schedule: ReportScheduleConfigDto;

  @ApiProperty({ description: 'Success message' })
  message: string;
}
