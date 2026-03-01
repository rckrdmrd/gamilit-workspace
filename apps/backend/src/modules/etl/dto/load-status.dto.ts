/**
 * Load Status DTO - ETL Pipeline Load Phase
 *
 * @description Response DTOs for ETL load operations status.
 *
 * @module ETL
 * @see TASK-2026-02-03 Sprint 2.4 - ETL Pipeline Carga
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LoadMode } from '../interfaces';

/**
 * Load Status Enum
 */
export enum LoadStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PARTIALLY_COMPLETED = 'partially_completed',
}

/**
 * Load Result Response DTO
 *
 * @description Response body for load operation results
 */
export class LoadResultResponseDto {
  @ApiProperty({
    description: 'Unique identifier for this load operation',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  loadId!: string;

  @ApiProperty({
    description: 'Loader name that was executed',
    example: 'fact-exercise-completion',
  })
  loaderName!: string;

  @ApiProperty({
    description: 'Target table name',
    example: 'fact_exercise_completions',
  })
  targetTable!: string;

  @ApiProperty({
    description: 'Target schema name',
    example: 'data_warehouse',
  })
  targetSchema!: string;

  @ApiProperty({
    description: 'Load status',
    enum: LoadStatus,
    example: LoadStatus.COMPLETED,
  })
  status!: LoadStatus;

  @ApiProperty({
    description: 'Load mode used',
    enum: LoadMode,
    example: LoadMode.APPEND,
  })
  loadMode!: LoadMode;

  @ApiProperty({
    description: 'Number of rows inserted',
    example: 1000,
  })
  rowsInserted!: number;

  @ApiProperty({
    description: 'Number of rows updated',
    example: 0,
  })
  rowsUpdated!: number;

  @ApiProperty({
    description: 'Number of rows rejected',
    example: 5,
  })
  rowsRejected!: number;

  @ApiProperty({
    description: 'When the load started',
    example: '2026-02-03T10:00:00Z',
  })
  startedAt!: Date;

  @ApiPropertyOptional({
    description: 'When the load completed',
    example: '2026-02-03T10:01:30Z',
  })
  completedAt?: Date;

  @ApiProperty({
    description: 'Duration in milliseconds',
    example: 90000,
  })
  duration!: number;

  @ApiPropertyOptional({
    description: 'Error message if failed',
    example: 'Foreign key constraint violation',
  })
  errorMessage?: string;

  @ApiProperty({
    description: 'Number of batches processed',
    example: 10,
  })
  batchesProcessed!: number;

  @ApiProperty({
    description: 'Average records per second',
    example: 11.11,
  })
  averageRecordsPerSecond!: number;
}

/**
 * Load Status Response DTO
 *
 * @description Response for current load status query
 */
export class LoadStatusResponseDto {
  @ApiProperty({
    description: 'Whether any load is currently running',
    example: false,
  })
  isRunning!: boolean;

  @ApiPropertyOptional({
    description: 'Current load operation if running',
    type: LoadResultResponseDto,
  })
  currentLoad?: LoadResultResponseDto;

  @ApiProperty({
    description: 'Recent load operations',
    type: [LoadResultResponseDto],
  })
  recentLoads!: LoadResultResponseDto[];

  @ApiProperty({
    description: 'Total loads in the last 24 hours',
    example: 48,
  })
  loadsLast24Hours!: number;

  @ApiProperty({
    description: 'Successful loads in the last 24 hours',
    example: 47,
  })
  successfulLoadsLast24Hours!: number;

  @ApiProperty({
    description: 'Failed loads in the last 24 hours',
    example: 1,
  })
  failedLoadsLast24Hours!: number;
}

/**
 * Operation Status DTO
 *
 * @description Status of an individual operation within a phase
 */
export class OperationStatusDto {
  @ApiProperty({
    description: 'Operation name',
    example: 'fact-exercise-completion',
  })
  name!: string;

  @ApiProperty({
    description: 'Operation status',
    enum: LoadStatus,
  })
  status!: LoadStatus;

  @ApiProperty({
    description: 'Records processed',
    example: 5000,
  })
  recordsProcessed!: number;

  @ApiProperty({
    description: 'Duration in milliseconds',
    example: 30000,
  })
  duration!: number;

  @ApiPropertyOptional({
    description: 'Error message if failed',
  })
  errorMessage?: string;
}

/**
 * Phase Status DTO
 *
 * @description Status of a single ETL phase
 */
export class PhaseStatusDto {
  @ApiProperty({
    description: 'Phase name',
    example: 'load',
  })
  phase!: string;

  @ApiProperty({
    description: 'Phase status',
    enum: LoadStatus,
    example: LoadStatus.COMPLETED,
  })
  status!: LoadStatus;

  @ApiPropertyOptional({
    description: 'When the phase started',
  })
  startedAt?: Date;

  @ApiPropertyOptional({
    description: 'When the phase completed',
  })
  completedAt?: Date;

  @ApiProperty({
    description: 'Duration in milliseconds',
    example: 90000,
  })
  duration!: number;

  @ApiProperty({
    description: 'Records processed in this phase',
    example: 10000,
  })
  recordsProcessed!: number;

  @ApiPropertyOptional({
    description: 'Error message if failed',
  })
  errorMessage?: string;

  @ApiProperty({
    description: 'Individual operations in this phase',
    type: () => [OperationStatusDto],
  })
  operations!: OperationStatusDto[];
}

/**
 * Pipeline Status Response DTO
 *
 * @description Response for full ETL pipeline status
 */
export class PipelineStatusResponseDto {
  @ApiProperty({
    description: 'Unique pipeline execution ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  pipelineId!: string;

  @ApiProperty({
    description: 'Overall pipeline status',
    enum: LoadStatus,
    example: LoadStatus.COMPLETED,
  })
  status!: LoadStatus;

  @ApiProperty({
    description: 'When the pipeline started',
    example: '2026-02-03T10:00:00Z',
  })
  startedAt!: Date;

  @ApiPropertyOptional({
    description: 'When the pipeline completed',
    example: '2026-02-03T10:05:00Z',
  })
  completedAt?: Date;

  @ApiProperty({
    description: 'Total duration in milliseconds',
    example: 300000,
  })
  totalDuration!: number;

  @ApiProperty({
    description: 'Extraction phase status',
    type: () => PhaseStatusDto,
  })
  extraction!: PhaseStatusDto;

  @ApiProperty({
    description: 'Transformation phase status',
    type: () => PhaseStatusDto,
  })
  transformation!: PhaseStatusDto;

  @ApiProperty({
    description: 'Load phase status',
    type: () => PhaseStatusDto,
  })
  load!: PhaseStatusDto;

  @ApiPropertyOptional({
    description: 'Error message if failed',
  })
  errorMessage?: string;

  @ApiProperty({
    description: 'Total records processed across all phases',
    example: 50000,
  })
  totalRecordsProcessed!: number;
}

/**
 * Load Log Entry DTO
 *
 * @description Entry in the ETL load log table
 */
export class LoadLogEntryDto {
  @ApiProperty({
    description: 'Unique load ID',
  })
  loadId!: string;

  @ApiProperty({
    description: 'Loader name',
  })
  loaderName!: string;

  @ApiProperty({
    description: 'Target table',
  })
  targetTable!: string;

  @ApiProperty({
    description: 'Load status',
    enum: LoadStatus,
  })
  status!: LoadStatus;

  @ApiProperty({
    description: 'When the load started',
  })
  startedAt!: Date;

  @ApiPropertyOptional({
    description: 'When the load completed',
  })
  completedAt?: Date;

  @ApiProperty({
    description: 'Rows inserted',
  })
  rowsInserted!: number;

  @ApiProperty({
    description: 'Rows updated',
  })
  rowsUpdated!: number;

  @ApiProperty({
    description: 'Rows rejected',
  })
  rowsRejected!: number;

  @ApiPropertyOptional({
    description: 'Error message if failed',
  })
  errorMessage?: string;
}

/**
 * Paginated Load Logs Response DTO
 */
export class PaginatedLoadLogsDto {
  @ApiProperty({
    description: 'Load log entries',
    type: [LoadLogEntryDto],
  })
  data!: LoadLogEntryDto[];

  @ApiProperty({
    description: 'Total number of entries',
  })
  total!: number;

  @ApiProperty({
    description: 'Current page',
  })
  page!: number;

  @ApiProperty({
    description: 'Page size',
  })
  pageSize!: number;

  @ApiProperty({
    description: 'Total pages',
  })
  totalPages!: number;
}
