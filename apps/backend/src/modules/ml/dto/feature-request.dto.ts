/**
 * Feature Request DTOs
 *
 * @description DTOs for requesting feature generation from the ML module.
 *
 * @module ML
 * @sprint 3.1 - Feature Engineering for ML Predictions
 * @created 2026-02-03
 */

import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  IsEnum,
  Min,
  Max,
  ArrayMinSize,
  IsUUID,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeatureCategory } from '../interfaces';

/**
 * Date range for feature extraction
 */
export class DateRangeDto {
  @ApiProperty({
    description: 'Start date for feature extraction',
    example: '2026-01-01',
  })
  @IsDateString()
  start: string;

  @ApiProperty({
    description: 'End date for feature extraction',
    example: '2026-02-03',
  })
  @IsDateString()
  end: string;
}

/**
 * Request DTO for generating features for a single student
 */
export class GenerateFeaturesRequestDto {
  @ApiPropertyOptional({
    description: 'Number of days to look back for historical features',
    default: 30,
    minimum: 1,
    maximum: 365,
    example: 30,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  lookbackDays?: number = 30;

  @ApiPropertyOptional({
    description: 'Feature categories to include',
    enum: ['student', 'engagement', 'performance', 'temporal', 'gamification', 'all'],
    isArray: true,
    default: ['all'],
    example: ['student', 'engagement', 'performance'],
  })
  @IsOptional()
  @IsArray()
  @IsEnum(
    ['student', 'engagement', 'performance', 'temporal', 'gamification', 'all'] as const,
    { each: true },
  )
  includeCategories?: FeatureCategory[] = ['all'];

  @ApiPropertyOptional({
    description: 'Whether to normalize numeric features to 0-1 range',
    default: true,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  normalize?: boolean = true;

  @ApiPropertyOptional({
    description: 'Whether to compute feature importance scores',
    default: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  computeImportance?: boolean = false;

  @ApiPropertyOptional({
    description: 'Custom date range (overrides lookbackDays)',
    type: DateRangeDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => DateRangeDto)
  dateRange?: DateRangeDto;
}

/**
 * Request DTO for batch feature generation
 */
export class BatchFeaturesRequestDto extends GenerateFeaturesRequestDto {
  @ApiProperty({
    description: 'Array of student IDs to generate features for',
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001'],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUUID('4', { each: true })
  studentIds: string[];

  @ApiPropertyOptional({
    description: 'Maximum concurrent feature extractions',
    default: 10,
    minimum: 1,
    maximum: 50,
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  concurrency?: number = 10;
}

/**
 * Query parameters for getting cached features
 */
export class GetCachedFeaturesQueryDto {
  @ApiPropertyOptional({
    description: 'Maximum age of cached features in seconds (returns null if older)',
    minimum: 60,
    maximum: 86400,
    example: 3600,
  })
  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(86400)
  maxAge?: number;
}

/**
 * Query parameters for feature schema endpoint
 */
export class FeatureSchemaQueryDto {
  @ApiPropertyOptional({
    description: 'Filter schema by feature category',
    enum: ['student', 'engagement', 'performance', 'temporal', 'gamification'],
    example: 'engagement',
  })
  @IsOptional()
  @IsEnum(['student', 'engagement', 'performance', 'temporal', 'gamification'] as const)
  category?: Exclude<FeatureCategory, 'all'>;

  @ApiPropertyOptional({
    description: 'Include experimental features in schema',
    default: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  includeExperimental?: boolean = false;
}

/**
 * Request DTO for invalidating feature cache
 */
export class InvalidateCacheRequestDto {
  @ApiPropertyOptional({
    description: 'Reason for cache invalidation (for audit logging)',
    example: 'Manual refresh requested by admin',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
