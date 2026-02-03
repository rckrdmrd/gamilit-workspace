/**
 * Transformation Status DTO
 *
 * @description DTOs for transformation status responses.
 * @module etl/dto
 * @since 2026-02-03
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransformerType } from './transformation-config.dto';

/**
 * Transformation Status Enum
 */
export enum TransformationStatusEnum {
  IDLE = 'idle',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PAUSED = 'paused',
}

/**
 * Transformer Progress
 * @description Progress information for a single transformer
 */
export class TransformerProgressDto {
  @ApiProperty({
    description: 'Transformer type',
    enum: TransformerType,
  })
  transformerType!: TransformerType;

  @ApiProperty({
    description: 'Current status',
    enum: TransformationStatusEnum,
  })
  status!: TransformationStatusEnum;

  @ApiProperty({
    description: 'Records processed so far',
  })
  recordsProcessed!: number;

  @ApiProperty({
    description: 'Total records to process',
  })
  totalRecords!: number;

  @ApiProperty({
    description: 'Records successfully transformed',
  })
  successCount!: number;

  @ApiProperty({
    description: 'Records that failed transformation',
  })
  failedCount!: number;

  @ApiProperty({
    description: 'Progress percentage (0-100)',
  })
  progressPercentage!: number;

  @ApiPropertyOptional({
    description: 'Estimated time remaining in seconds',
  })
  estimatedTimeRemaining?: number;

  @ApiPropertyOptional({
    description: 'Error message if failed',
  })
  errorMessage?: string;
}

/**
 * Transformation Status Response
 * @description Response for transformation status endpoint
 */
export class TransformationStatusResponseDto {
  @ApiProperty({
    description: 'Overall transformation status',
    enum: TransformationStatusEnum,
  })
  overallStatus!: TransformationStatusEnum;

  @ApiProperty({
    description: 'Current batch ID being processed',
  })
  currentBatchId!: string;

  @ApiProperty({
    description: 'When transformation started',
  })
  startedAt!: Date;

  @ApiPropertyOptional({
    description: 'When transformation completed (if finished)',
  })
  completedAt?: Date;

  @ApiProperty({
    description: 'Elapsed time in milliseconds',
  })
  elapsedMs!: number;

  @ApiProperty({
    description: 'Progress by transformer type',
    type: [TransformerProgressDto],
  })
  transformerProgress!: TransformerProgressDto[];

  @ApiProperty({
    description: 'Total records processed across all transformers',
  })
  totalRecordsProcessed!: number;

  @ApiProperty({
    description: 'Total successful transformations',
  })
  totalSuccess!: number;

  @ApiProperty({
    description: 'Total failed transformations',
  })
  totalFailed!: number;

  @ApiPropertyOptional({
    description: 'Last error message if any',
  })
  lastError?: string;
}

/**
 * Transformation Trigger Response
 * @description Response for transformation trigger endpoint
 */
export class TransformationTriggerResponseDto {
  @ApiProperty({
    description: 'Batch ID assigned to this transformation',
  })
  batchId!: string;

  @ApiProperty({
    description: 'Transformation status',
    enum: TransformationStatusEnum,
  })
  status!: TransformationStatusEnum;

  @ApiProperty({
    description: 'Message describing the action taken',
  })
  message!: string;

  @ApiProperty({
    description: 'Estimated records to be processed',
  })
  estimatedRecords!: number;

  @ApiProperty({
    description: 'When transformation was triggered',
  })
  triggeredAt!: Date;
}

/**
 * Validation Report Response
 * @description Response for validation report endpoint
 */
export class ValidationReportResponseDto {
  @ApiProperty({
    description: 'Report generation timestamp',
  })
  generatedAt!: Date;

  @ApiProperty({
    description: 'Overall data quality score (0-100)',
  })
  dataQualityScore!: number;

  @ApiProperty({
    description: 'Total records validated',
  })
  totalRecords!: number;

  @ApiProperty({
    description: 'Records with no issues',
  })
  validRecords!: number;

  @ApiProperty({
    description: 'Records with errors',
  })
  errorRecords!: number;

  @ApiProperty({
    description: 'Records with warnings',
  })
  warningRecords!: number;

  @ApiProperty({
    description: 'Recommendation for proceeding',
    enum: ['proceed', 'review', 'abort'],
  })
  recommendation!: 'proceed' | 'review' | 'abort';

  @ApiProperty({
    description: 'Summary of issues by category',
    type: 'object',
    additionalProperties: { type: 'number' },
  })
  issuesByCategory!: Record<string, number>;

  @ApiProperty({
    description: 'Top problematic fields',
    type: 'array',
  })
  topProblematicFields!: Array<{ field: string; issueCount: number }>;

  @ApiPropertyOptional({
    description: 'Detailed issues (if requested)',
    type: 'array',
  })
  detailedIssues?: Array<{
    field: string;
    severity: string;
    category: string;
    message: string;
    rowIndex: number;
  }>;

  @ApiProperty({
    description: 'Duplicate records found',
  })
  duplicateCount!: number;

  @ApiProperty({
    description: 'Orphan references found',
  })
  orphanReferenceCount!: number;
}
