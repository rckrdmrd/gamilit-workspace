import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsArray, IsString, IsDateString } from 'class-validator';

/**
 * Report format options
 */
export enum ReportFormat {
  CSV = 'csv',
  EXCEL = 'excel',
  PDF = 'pdf',
}

/**
 * Report type options
 */
export enum ReportType {
  USERS = 'users',
  PROGRESS = 'progress',
  GAMIFICATION = 'gamification',
  SYSTEM = 'system',
  STUDENT_INSIGHTS = 'student_insights',
  CLASSROOM_SUMMARY = 'classroom_summary',
  RISK_ANALYSIS = 'risk_analysis',
}

/**
 * DTO for generating reports
 *
 * @description Used to generate various types of reports in different formats
 */
export class GenerateReportDto {
  @ApiProperty({
    description: 'Type of report to generate',
    enum: ReportType,
    example: ReportType.USERS,
  })
  @IsEnum(ReportType)
  type!: ReportType;

  @ApiProperty({
    description: 'Report output format',
    enum: ReportFormat,
    example: ReportFormat.EXCEL,
  })
  @IsEnum(ReportFormat)
  format!: ReportFormat;

  @ApiPropertyOptional({
    description: 'List of student IDs to include in report (optional)',
    type: [String],
    example: ['uuid-1', 'uuid-2'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  student_ids?: string[];

  @ApiPropertyOptional({
    description: 'Classroom ID to filter students (optional)',
    example: 'classroom-uuid',
  })
  @IsOptional()
  @IsString()
  classroom_id?: string;

  @ApiPropertyOptional({
    description: 'Start date for data range (ISO 8601)',
    example: '2025-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @ApiPropertyOptional({
    description: 'End date for data range (ISO 8601)',
    example: '2025-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiPropertyOptional({
    description: 'Report filters (generic object for additional filters)',
    example: { start_date: '2025-01-01', end_date: '2025-12-31' },
  })
  @IsOptional()
  filters?: Record<string, any>;
}
