/**
 * Report Request DTOs
 *
 * DTOs for report generation and scheduling requests.
 * Supports multiple export formats and scheduling options.
 *
 * @module visualization/dto
 * @sprint 4 - EXT-005 Visualizations
 */

import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportFormat, ReportType } from '../interfaces';
import { DateRangeDto } from './dashboard-request.dto';

/**
 * Request DTO for generating a report
 */
export class GenerateReportDto {
  @ApiProperty({ description: 'Report template ID' })
  @IsUUID()
  templateId!: string;

  @ApiProperty({ description: 'Export format', enum: ReportFormat })
  @IsEnum(ReportFormat)
  format!: ReportFormat;

  @ApiPropertyOptional({ description: 'Date range' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange?: DateRangeDto;

  @ApiPropertyOptional({ description: 'Entity IDs to include' })
  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  entityIds?: string[];

  @ApiPropertyOptional({ description: 'Report filters' })
  @IsOptional()
  filters?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Custom report title' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Include charts in PDF/Excel' })
  @IsOptional()
  @IsBoolean()
  includeCharts?: boolean;

  @ApiPropertyOptional({ description: 'Locale for formatting', default: 'es-MX' })
  @IsOptional()
  @IsString()
  locale?: string;

  @ApiPropertyOptional({ description: 'Timezone', default: 'America/Mexico_City' })
  @IsOptional()
  @IsString()
  timezone?: string;
}

/**
 * Request DTO for getting report status
 */
export class GetReportStatusDto {
  @ApiProperty({ description: 'Report job ID' })
  @IsUUID()
  jobId!: string;
}

/**
 * Query DTO for listing report templates
 */
export class ListReportTemplatesDto {
  @ApiPropertyOptional({ description: 'Report type filter', enum: ReportType })
  @IsOptional()
  @IsEnum(ReportType)
  type?: ReportType;

  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;
}

/**
 * Request DTO for scheduling a report
 */
export class ScheduleReportDto {
  @ApiProperty({ description: 'Report template ID' })
  @IsUUID()
  templateId!: string;

  @ApiProperty({ description: 'Export format', enum: ReportFormat })
  @IsEnum(ReportFormat)
  format!: ReportFormat;

  @ApiProperty({ description: 'Cron schedule expression' })
  @IsString()
  schedule!: string;

  @ApiPropertyOptional({ description: 'Email recipients' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recipients?: string[];

  @ApiPropertyOptional({ description: 'Report filters' })
  @IsOptional()
  filters?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'Active status' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
