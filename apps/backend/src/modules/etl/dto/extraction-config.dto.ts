/**
 * Extraction Configuration DTO
 *
 * @description Request DTOs for ETL extraction configuration
 * @module etl/dto
 * @version 1.0.0
 * @since Sprint 2.2 - ETL Pipeline Extraction
 */

import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * Extraction Mode Enum
 */
export enum ExtractionMode {
  FULL = 'full',
  INCREMENTAL = 'incremental',
}

/**
 * Extractor Type Enum
 */
export enum ExtractorType {
  EXERCISE_COMPLETION = 'exercise-completion',
  STUDENT = 'student',
  GAMIFICATION_EVENT = 'gamification-event',
  TEACHER_METRIC = 'teacher-metric',
  ALL = 'all',
}

/**
 * TriggerExtractionDto
 *
 * @description DTO for manually triggering an extraction job
 */
export class TriggerExtractionDto {
  @ApiProperty({
    description: 'Type of extractor to run',
    enum: ExtractorType,
    example: ExtractorType.ALL,
  })
  @IsEnum(ExtractorType)
  extractorType!: ExtractorType;

  @ApiPropertyOptional({
    description: 'Extraction mode (full or incremental)',
    enum: ExtractionMode,
    default: ExtractionMode.INCREMENTAL,
  })
  @IsOptional()
  @IsEnum(ExtractionMode)
  mode?: ExtractionMode = ExtractionMode.INCREMENTAL;

  @ApiPropertyOptional({
    description: 'Start date for extraction range (ISO 8601)',
    example: '2026-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for extraction range (ISO 8601)',
    example: '2026-01-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Batch size for extraction (records per batch)',
    minimum: 100,
    maximum: 10000,
    default: 1000,
  })
  @IsOptional()
  @IsInt()
  @Min(100)
  @Max(10000)
  @Type(() => Number)
  batchSize?: number = 1000;

  @ApiPropertyOptional({
    description: 'Filter by tenant ID',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @IsOptional()
  @IsUUID()
  tenantId?: string;

  @ApiPropertyOptional({
    description: 'Include soft-deleted records',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeDeleted?: boolean = false;

  @ApiPropertyOptional({
    description: 'Run extraction asynchronously (returns job ID)',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  async?: boolean = true;
}

/**
 * ExtractionQueryDto
 *
 * @description Query parameters for listing extraction history
 */
export class ExtractionQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by extractor name',
    example: 'exercise-completion-extractor',
  })
  @IsOptional()
  @IsString()
  extractorName?: string;

  @ApiPropertyOptional({
    description: 'Filter by extraction status',
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Start date for history range',
    example: '2026-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'End date for history range',
    example: '2026-01-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({
    description: 'Number of records to return',
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Number of records to skip',
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  offset?: number = 0;
}
