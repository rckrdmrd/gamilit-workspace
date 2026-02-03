/**
 * Extraction Status DTO
 *
 * @description Response DTOs for ETL extraction status and results
 * @module etl/dto
 * @version 1.0.0
 * @since Sprint 2.2 - ETL Pipeline Extraction
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExtractionStatus } from '../interfaces';

/**
 * ExtractorStatusDto
 *
 * @description Status of a single extractor
 */
export class ExtractorStatusDto {
  @ApiProperty({
    description: 'Extractor name identifier',
    example: 'exercise-completion-extractor',
  })
  name!: string;

  @ApiProperty({
    description: 'Source tables this extractor reads from',
    example: ['progress_tracking.exercise_completions', 'educational_content.exercises'],
  })
  sourceTables!: string[];

  @ApiProperty({
    description: 'Timestamp of last successful extraction',
    example: '2026-02-03T10:30:00Z',
    nullable: true,
  })
  lastExtractedAt!: Date | null;

  @ApiProperty({
    description: 'Total records extracted in last run',
    example: 5432,
  })
  lastRowCount!: number;

  @ApiProperty({
    description: 'Current status of the extractor',
    enum: ['idle', 'running', 'error'],
    example: 'idle',
  })
  status!: 'idle' | 'running' | 'error';

  @ApiPropertyOptional({
    description: 'Error message if status is error',
    example: 'Connection timeout',
  })
  errorMessage?: string;

  @ApiProperty({
    description: 'Whether the extractor is enabled',
    example: true,
  })
  enabled!: boolean;
}

/**
 * ExtractionRunStatusDto
 *
 * @description Status of an extraction run (job)
 */
export class ExtractionRunStatusDto {
  @ApiProperty({
    description: 'Unique job identifier',
    example: 'job-2026-02-03-001',
  })
  jobId!: string;

  @ApiProperty({
    description: 'Current status of the extraction',
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
    example: 'running',
  })
  status!: ExtractionStatus;

  @ApiProperty({
    description: 'Extractors being run',
    example: ['exercise-completion-extractor', 'student-extractor'],
  })
  extractors!: string[];

  @ApiProperty({
    description: 'When the extraction started',
    example: '2026-02-03T10:30:00Z',
  })
  startedAt!: Date;

  @ApiPropertyOptional({
    description: 'When the extraction completed',
    example: '2026-02-03T10:35:00Z',
  })
  completedAt?: Date;

  @ApiProperty({
    description: 'Progress percentage (0-100)',
    example: 45,
  })
  progress!: number;

  @ApiProperty({
    description: 'Total records extracted so far',
    example: 12345,
  })
  recordsExtracted!: number;

  @ApiPropertyOptional({
    description: 'Estimated completion time',
    example: '2026-02-03T10:40:00Z',
  })
  estimatedCompletion?: Date;

  @ApiPropertyOptional({
    description: 'Error message if failed',
  })
  errorMessage?: string;

  @ApiPropertyOptional({
    description: 'Detailed progress by extractor',
  })
  extractorProgress?: Record<string, {
    status: ExtractionStatus;
    recordsExtracted: number;
    progress: number;
  }>;
}

/**
 * ExtractionHistoryItemDto
 *
 * @description A single extraction history entry
 */
export class ExtractionHistoryItemDto {
  @ApiProperty({
    description: 'Extraction log ID',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  id!: string;

  @ApiProperty({
    description: 'Extractor name',
    example: 'exercise-completion-extractor',
  })
  extractorName!: string;

  @ApiProperty({
    description: 'When the extraction started',
    example: '2026-02-03T10:30:00Z',
  })
  startedAt!: Date;

  @ApiPropertyOptional({
    description: 'When the extraction completed',
    example: '2026-02-03T10:35:00Z',
  })
  completedAt?: Date;

  @ApiProperty({
    description: 'Number of rows extracted',
    example: 5432,
  })
  rowsExtracted!: number;

  @ApiProperty({
    description: 'Extraction status',
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
    example: 'completed',
  })
  status!: ExtractionStatus;

  @ApiPropertyOptional({
    description: 'Error message if failed',
  })
  errorMessage?: string;

  @ApiProperty({
    description: 'Last timestamp extracted (CDC marker)',
    example: '2026-02-03T10:29:59Z',
  })
  lastExtractedTimestamp!: Date;

  @ApiProperty({
    description: 'Duration in milliseconds',
    example: 5432,
  })
  durationMs!: number;
}

/**
 * ExtractionOverviewDto
 *
 * @description Overall ETL extraction system status
 */
export class ExtractionOverviewDto {
  @ApiProperty({
    description: 'Overall system status',
    enum: ['healthy', 'degraded', 'error'],
    example: 'healthy',
  })
  systemStatus!: 'healthy' | 'degraded' | 'error';

  @ApiProperty({
    description: 'Status of each extractor',
    type: [ExtractorStatusDto],
  })
  extractors!: ExtractorStatusDto[];

  @ApiPropertyOptional({
    description: 'Currently running extraction job',
    type: ExtractionRunStatusDto,
  })
  currentJob?: ExtractionRunStatusDto;

  @ApiProperty({
    description: 'Next scheduled extraction time',
    example: '2026-02-03T11:00:00Z',
  })
  nextScheduledRun!: Date;

  @ApiProperty({
    description: 'Cron schedule for automatic extraction',
    example: '0 * * * *',
  })
  schedule!: string;

  @ApiProperty({
    description: 'Total extractions in last 24 hours',
    example: 24,
  })
  extractionsLast24h!: number;

  @ApiProperty({
    description: 'Total records extracted in last 24 hours',
    example: 123456,
  })
  recordsLast24h!: number;

  @ApiProperty({
    description: 'Number of failed extractions in last 24 hours',
    example: 0,
  })
  failuresLast24h!: number;
}

/**
 * TriggerExtractionResponseDto
 *
 * @description Response after triggering an extraction
 */
export class TriggerExtractionResponseDto {
  @ApiProperty({
    description: 'Whether the extraction was triggered successfully',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Response message',
    example: 'Extraction job started successfully',
  })
  message!: string;

  @ApiPropertyOptional({
    description: 'Job ID for async extractions',
    example: 'job-2026-02-03-001',
  })
  jobId?: string;

  @ApiPropertyOptional({
    description: 'Extraction result for sync extractions',
    type: ExtractionRunStatusDto,
  })
  result?: ExtractionRunStatusDto;
}

/**
 * ExtractionHistoryResponseDto
 *
 * @description Paginated extraction history response
 */
export class ExtractionHistoryResponseDto {
  @ApiProperty({
    description: 'List of extraction history items',
    type: [ExtractionHistoryItemDto],
  })
  items!: ExtractionHistoryItemDto[];

  @ApiProperty({
    description: 'Total number of items',
    example: 100,
  })
  total!: number;

  @ApiProperty({
    description: 'Current page limit',
    example: 20,
  })
  limit!: number;

  @ApiProperty({
    description: 'Current offset',
    example: 0,
  })
  offset!: number;

  @ApiProperty({
    description: 'Whether there are more items',
    example: true,
  })
  hasMore!: boolean;
}
