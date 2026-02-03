/**
 * Report Response DTOs
 *
 * DTOs for report generation responses.
 * Contains report templates, job status, and results.
 *
 * @module visualization/dto
 * @sprint 4 - EXT-005 Visualizations
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportFormat, ReportType, ReportStatus } from '../interfaces';

/**
 * Report template response DTO
 */
export class ReportTemplateResponseDto {
  @ApiProperty({ description: 'Template ID' })
  id!: string;

  @ApiProperty({ description: 'Template name' })
  name!: string;

  @ApiProperty({ description: 'Report type', enum: ReportType })
  type!: ReportType;

  @ApiPropertyOptional({ description: 'Template description' })
  description?: string;

  @ApiProperty({
    description: 'Available export formats',
    type: [String],
    enum: ReportFormat,
  })
  availableFormats!: ReportFormat[];

  @ApiProperty({ description: 'Number of sections in template' })
  sectionCount!: number;

  @ApiProperty({ description: 'Required permissions' })
  permissions!: string[];
}

/**
 * Paginated report template list response DTO
 */
export class ReportTemplateListResponseDto {
  @ApiProperty({ description: 'Template items', type: [ReportTemplateResponseDto] })
  items!: ReportTemplateResponseDto[];

  @ApiProperty({ description: 'Total number of templates' })
  total!: number;
}

/**
 * Report job response DTO
 */
export class ReportJobResponseDto {
  @ApiProperty({ description: 'Job ID' })
  id!: string;

  @ApiProperty({ description: 'Job status', enum: ReportStatus })
  status!: ReportStatus;

  @ApiProperty({ description: 'Progress percentage (0-100)' })
  progress!: number;

  @ApiPropertyOptional({ description: 'Status message' })
  message?: string;

  @ApiPropertyOptional({ description: 'File download URL' })
  fileUrl?: string;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  fileSize?: number;

  @ApiProperty({ description: 'Export format', enum: ReportFormat })
  format!: ReportFormat;

  @ApiProperty({ description: 'Job creation timestamp' })
  createdAt!: Date;

  @ApiPropertyOptional({ description: 'Job completion timestamp' })
  completedAt?: Date;

  @ApiPropertyOptional({ description: 'File expiration timestamp' })
  expiresAt?: Date;
}

/**
 * Report result response DTO
 */
export class ReportResultResponseDto {
  @ApiProperty({ description: 'Job ID' })
  jobId!: string;

  @ApiProperty({ description: 'Generation success status' })
  success!: boolean;

  @ApiPropertyOptional({ description: 'File download URL' })
  fileUrl?: string;

  @ApiPropertyOptional({ description: 'File name' })
  fileName?: string;

  @ApiPropertyOptional({ description: 'File size in bytes' })
  fileSize?: number;

  @ApiProperty({ description: 'Export format', enum: ReportFormat })
  format!: ReportFormat;

  @ApiProperty({ description: 'Generation time in milliseconds' })
  generationTime!: number;

  @ApiPropertyOptional({ description: 'Error message if failed' })
  error?: string;
}

/**
 * Scheduled report response DTO
 */
export class ScheduledReportResponseDto {
  @ApiProperty({ description: 'Schedule ID' })
  id!: string;

  @ApiProperty({ description: 'Template ID' })
  templateId!: string;

  @ApiProperty({ description: 'Template name' })
  templateName!: string;

  @ApiProperty({ description: 'Export format', enum: ReportFormat })
  format!: ReportFormat;

  @ApiProperty({ description: 'Cron schedule expression' })
  schedule!: string;

  @ApiProperty({ description: 'Next run timestamp' })
  nextRunAt!: Date;

  @ApiPropertyOptional({ description: 'Last run timestamp' })
  lastRunAt?: Date;

  @ApiProperty({ description: 'Active status' })
  isActive!: boolean;

  @ApiProperty({ description: 'Email recipients', type: [String] })
  recipients!: string[];
}
