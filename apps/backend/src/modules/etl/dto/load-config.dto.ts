/**
 * Load Config DTO - ETL Pipeline Load Phase
 *
 * @description DTOs for configuring ETL load operations.
 * Used by the load controller endpoints.
 *
 * @module ETL
 * @see TASK-2026-02-03 Sprint 2.4 - ETL Pipeline Carga
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  Min,
  Max,
  IsUUID,
} from 'class-validator';
import { LoadMode } from '../interfaces';

/**
 * Load Trigger DTO
 *
 * @description Request body for manual load trigger endpoint
 */
export class LoadTriggerDto {
  @ApiProperty({
    description: 'Name of the loader to execute',
    example: 'fact-exercise-completion',
    enum: [
      'fact-exercise-completion',
      'fact-daily-progress',
      'fact-gamification-event',
      'dim-student',
    ],
  })
  @IsString()
  loaderName!: string;

  @ApiPropertyOptional({
    description: 'Load mode strategy',
    enum: LoadMode,
    default: LoadMode.APPEND,
  })
  @IsOptional()
  @IsEnum(LoadMode)
  mode?: LoadMode;

  @ApiPropertyOptional({
    description: 'Batch size for loading',
    default: 1000,
    minimum: 100,
    maximum: 10000,
  })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(10000)
  batchSize?: number;

  @ApiPropertyOptional({
    description: 'Whether to validate dimension key constraints',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  validateConstraints?: boolean;

  @ApiPropertyOptional({
    description: 'Continue loading on error (rejected rows will be logged)',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  continueOnError?: boolean;

  @ApiPropertyOptional({
    description: 'Source data to load (if not using staging)',
    type: 'array',
    items: { type: 'object', additionalProperties: true },
  })
  @IsOptional()
  @IsArray()
  data?: Record<string, unknown>[];
}

/**
 * Full ETL Pipeline DTO
 *
 * @description Request body for triggering full ETL pipeline (extract + transform + load)
 */
export class FullETLPipelineDto {
  @ApiPropertyOptional({
    description: 'Start date for extraction (inclusive)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for extraction (inclusive)',
    example: '2026-01-31',
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Specific loaders to run (runs all if not specified)',
    type: [String],
    example: ['fact-exercise-completion', 'fact-daily-progress'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  loaders?: string[];

  @ApiPropertyOptional({
    description: 'Batch size for all operations',
    default: 1000,
  })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(10000)
  batchSize?: number;

  @ApiPropertyOptional({
    description: 'Run in dry-run mode (validate but do not persist)',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  dryRun?: boolean;

  @ApiPropertyOptional({
    description: 'Force full refresh (truncate and reload)',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  forceFullRefresh?: boolean;
}

/**
 * Load Query DTO
 *
 * @description Query parameters for load status endpoint
 */
export class LoadQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by loader name',
    example: 'fact-exercise-completion',
  })
  @IsOptional()
  @IsString()
  loaderName?: string;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ['pending', 'running', 'completed', 'failed'],
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Number of records to return',
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Records to skip',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;
}

/**
 * Dimension Load Config DTO
 *
 * @description Configuration specific to dimension table loading
 */
export class DimensionLoadConfigDto {
  @ApiProperty({
    description: 'Dimension table name',
    example: 'dim_student',
  })
  @IsString()
  dimensionName!: string;

  @ApiPropertyOptional({
    description: 'Natural key columns for SCD matching',
    type: [String],
    example: ['student_id'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  naturalKeyColumns?: string[];

  @ApiPropertyOptional({
    description: 'Use SCD Type 2 versioning',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  useSCD2?: boolean;

  @ApiPropertyOptional({
    description: 'Columns to track for changes (SCD Type 2)',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  trackedColumns?: string[];
}

/**
 * Fact Load Config DTO
 *
 * @description Configuration specific to fact table loading
 */
export class FactLoadConfigDto {
  @ApiProperty({
    description: 'Fact table name',
    example: 'fact_exercise_completions',
  })
  @IsString()
  factName!: string;

  @ApiPropertyOptional({
    description: 'Validate dimension keys before loading',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  validateDimensionKeys?: boolean;

  @ApiPropertyOptional({
    description: 'Dimension tables to validate against',
    type: 'object',
    additionalProperties: { type: 'string' },
    example: {
      student_key: 'dim_student',
      date_key: 'dim_date',
    },
  })
  @IsOptional()
  dimensionValidations?: Record<string, string>;

  @ApiPropertyOptional({
    description: 'Key columns for upsert (for fact-daily-progress)',
    type: [String],
    example: ['date_key', 'student_key', 'module_key'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keyColumns?: string[];
}

/**
 * Load Log Query DTO
 *
 * @description Query parameters for ETL load log endpoint
 */
export class LoadLogQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by load ID',
  })
  @IsOptional()
  @IsUUID()
  loadId?: string;

  @ApiPropertyOptional({
    description: 'Filter by loader name',
  })
  @IsOptional()
  @IsString()
  loaderName?: string;

  @ApiPropertyOptional({
    description: 'Filter by target table',
  })
  @IsOptional()
  @IsString()
  targetTable?: string;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ['pending', 'running', 'completed', 'failed'],
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Start date for filtering',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering',
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Number of records to return',
    default: 20,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Records to skip',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;
}
