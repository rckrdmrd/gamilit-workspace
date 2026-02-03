/**
 * Transformation Configuration DTO
 *
 * @description DTOs for configuring ETL transformation operations.
 * @module etl/dto
 * @since 2026-02-03
 */

import { IsString, IsNumber, IsBoolean, IsOptional, Min, Max, IsEnum, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Transformer Type Enum
 */
export enum TransformerType {
  EXERCISE_COMPLETION = 'exercise_completion',
  STUDENT = 'student',
  GAMIFICATION_EVENT = 'gamification_event',
  DAILY_PROGRESS = 'daily_progress',
}

/**
 * Trigger Transformation DTO
 * @description Request body for manual transformation trigger
 */
export class TriggerTransformationDto {
  @ApiProperty({
    description: 'Type of transformer to execute',
    enum: TransformerType,
    example: TransformerType.EXERCISE_COMPLETION,
  })
  @IsEnum(TransformerType)
  transformerType!: TransformerType;

  @ApiPropertyOptional({
    description: 'Start date for data extraction (inclusive)',
    example: '2026-01-01',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for data extraction (inclusive)',
    example: '2026-01-31',
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Batch size for processing',
    minimum: 100,
    maximum: 10000,
    default: 1000,
  })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(10000)
  batchSize?: number;

  @ApiPropertyOptional({
    description: 'Force re-transformation of already processed records',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  forceReprocess?: boolean;

  @ApiPropertyOptional({
    description: 'Specific record IDs to transform (for targeted reprocessing)',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specificIds?: string[];
}

/**
 * Transformation Config DTO
 * @description Configuration options for transformation process
 */
export class TransformationConfigDto {
  @ApiProperty({
    description: 'Batch size for processing records',
    minimum: 100,
    maximum: 10000,
    default: 1000,
  })
  @IsNumber()
  @Min(100)
  @Max(10000)
  batchSize!: number;

  @ApiProperty({
    description: 'Score threshold for passing (0-100)',
    minimum: 0,
    maximum: 100,
    default: 70,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  passingThreshold!: number;

  @ApiProperty({
    description: 'Timezone for date conversions',
    default: 'America/Mexico_City',
  })
  @IsString()
  timezone!: string;

  @ApiProperty({
    description: 'Whether to normalize scores to 0-100 scale',
    default: true,
  })
  @IsBoolean()
  normalizeScores!: boolean;

  @ApiProperty({
    description: 'Maximum allowed exercise time in seconds',
    minimum: 60,
    maximum: 36000,
    default: 7200,
  })
  @IsNumber()
  @Min(60)
  @Max(36000)
  maxExerciseTimeSeconds!: number;

  @ApiPropertyOptional({
    description: 'Whether to skip validation step',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  skipValidation?: boolean;

  @ApiPropertyOptional({
    description: 'Maximum errors before aborting transformation',
    minimum: 1,
    default: 1000,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxErrors?: number;
}

/**
 * Validation Report Query DTO
 * @description Query parameters for validation report endpoint
 */
export class ValidationReportQueryDto {
  @ApiPropertyOptional({
    description: 'Transformer type to get report for',
    enum: TransformerType,
  })
  @IsOptional()
  @IsEnum(TransformerType)
  transformerType?: TransformerType;

  @ApiPropertyOptional({
    description: 'Batch ID to get report for',
  })
  @IsOptional()
  @IsString()
  batchId?: string;

  @ApiPropertyOptional({
    description: 'Include detailed issues in report',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  includeDetails?: boolean;

  @ApiPropertyOptional({
    description: 'Start date for report range',
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for report range',
  })
  @IsOptional()
  @IsString()
  endDate?: string;
}
