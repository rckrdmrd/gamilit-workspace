/**
 * Feature Response DTOs
 *
 * @description DTOs for feature generation responses from the ML module.
 *
 * @module ML
 * @sprint 3.1 - Feature Engineering for ML Predictions
 * @created 2026-02-03
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FeatureType, FeatureCategory } from '../interfaces';

/**
 * Single feature response
 */
export class FeatureDto {
  @ApiProperty({
    description: 'Feature name (snake_case)',
    example: 'login_frequency_7d',
  })
  name: string;

  @ApiProperty({
    description: 'Feature value',
    example: 5,
    oneOf: [
      { type: 'number' },
      { type: 'string' },
      { type: 'boolean' },
    ],
  })
  value: number | string | boolean;

  @ApiProperty({
    description: 'Feature data type',
    enum: ['numeric', 'categorical', 'boolean'],
    example: 'numeric',
  })
  type: FeatureType;

  @ApiPropertyOptional({
    description: 'Normalized value (0-1 range)',
    example: 0.71,
  })
  normalized?: number;

  @ApiPropertyOptional({
    description: 'Feature importance score (0-1)',
    example: 0.85,
  })
  importance?: number;

  @ApiPropertyOptional({
    description: 'Human-readable description',
    example: 'Number of logins in the last 7 days',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Unit of measurement',
    example: 'logins',
  })
  unit?: string;
}

/**
 * Feature set metadata response
 */
export class FeatureSetMetadataDto {
  @ApiProperty({
    description: 'Feature set version',
    example: '1.0.0',
  })
  version: string;

  @ApiProperty({
    description: 'Generation timestamp',
    example: '2026-02-03T10:30:00.000Z',
  })
  generatedAt: Date;

  @ApiProperty({
    description: 'Total number of features',
    example: 45,
  })
  featureCount: number;

  @ApiPropertyOptional({
    description: 'Number of numeric features',
    example: 35,
  })
  numericFeatureCount?: number;

  @ApiPropertyOptional({
    description: 'Number of categorical features',
    example: 8,
  })
  categoricalFeatureCount?: number;

  @ApiPropertyOptional({
    description: 'Number of boolean features',
    example: 2,
  })
  booleanFeatureCount?: number;

  @ApiPropertyOptional({
    description: 'Generation time in milliseconds',
    example: 125,
  })
  generationTimeMs?: number;
}

/**
 * Complete feature set response
 */
export class FeatureSetResponseDto {
  @ApiProperty({
    description: 'Student ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  studentId: string;

  @ApiProperty({
    description: 'Feature timestamp',
    example: '2026-02-03T10:30:00.000Z',
  })
  timestamp: Date;

  @ApiProperty({
    description: 'Array of computed features',
    type: [FeatureDto],
  })
  features: FeatureDto[];

  @ApiProperty({
    description: 'Feature set metadata',
    type: FeatureSetMetadataDto,
  })
  metadata: FeatureSetMetadataDto;

  @ApiPropertyOptional({
    description: 'Whether features were served from cache',
    example: false,
  })
  fromCache?: boolean;
}

/**
 * Batch feature extraction statistics
 */
export class BatchFeatureStatsDto {
  @ApiProperty({
    description: 'Total students requested',
    example: 50,
  })
  totalRequested: number;

  @ApiProperty({
    description: 'Successful extractions',
    example: 48,
  })
  successCount: number;

  @ApiProperty({
    description: 'Failed extractions',
    example: 2,
  })
  failureCount: number;

  @ApiProperty({
    description: 'Total processing time in milliseconds',
    example: 1250,
  })
  totalTimeMs: number;

  @ApiProperty({
    description: 'Average time per student in milliseconds',
    example: 25,
  })
  averageTimePerStudent: number;
}

/**
 * Batch feature extraction failure
 */
export class BatchFeatureFailureDto {
  @ApiProperty({
    description: 'Student ID that failed',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  studentId: string;

  @ApiProperty({
    description: 'Error message',
    example: 'Student not found in data warehouse',
  })
  error: string;
}

/**
 * Batch feature generation response
 */
export class BatchFeaturesResponseDto {
  @ApiProperty({
    description: 'Feature sets for each student',
    type: [FeatureSetResponseDto],
  })
  featureSets: FeatureSetResponseDto[];

  @ApiProperty({
    description: 'Failed extractions',
    type: [BatchFeatureFailureDto],
  })
  failures: BatchFeatureFailureDto[];

  @ApiProperty({
    description: 'Batch statistics',
    type: BatchFeatureStatsDto,
  })
  stats: BatchFeatureStatsDto;
}

/**
 * Feature schema item response
 */
export class FeatureSchemaItemDto {
  @ApiProperty({
    description: 'Feature name',
    example: 'login_frequency_7d',
  })
  name: string;

  @ApiProperty({
    description: 'Feature category',
    example: 'engagement',
  })
  category: string;

  @ApiProperty({
    description: 'Data type',
    enum: ['numeric', 'categorical', 'boolean'],
    example: 'numeric',
  })
  type: FeatureType;

  @ApiProperty({
    description: 'Feature description',
    example: 'Number of user logins in the last 7 days',
  })
  description: string;

  @ApiPropertyOptional({
    description: 'Value range for numeric features',
    example: { min: 0, max: 7 },
  })
  range?: {
    min: number;
    max: number;
  };

  @ApiPropertyOptional({
    description: 'Possible values for categorical features',
    example: ['morning', 'afternoon', 'evening', 'night'],
  })
  possibleValues?: string[];

  @ApiProperty({
    description: 'Data source table',
    example: 'data_warehouse.fact_daily_progress',
  })
  source: string;

  @ApiPropertyOptional({
    description: 'Whether feature is experimental',
    example: false,
  })
  experimental?: boolean;
}

/**
 * Feature schema response
 */
export class FeatureSchemaResponseDto {
  @ApiProperty({
    description: 'Schema version',
    example: '1.0.0',
  })
  version: string;

  @ApiProperty({
    description: 'Total number of features in schema',
    example: 45,
  })
  totalFeatures: number;

  @ApiProperty({
    description: 'Feature schema items',
    type: [FeatureSchemaItemDto],
  })
  features: FeatureSchemaItemDto[];

  @ApiProperty({
    description: 'Features grouped by category',
    example: { student: 6, engagement: 8, performance: 15, temporal: 4, gamification: 12 },
  })
  byCategory: Record<string, number>;

  @ApiProperty({
    description: 'Last schema update',
    example: '2026-02-03T00:00:00.000Z',
  })
  lastUpdated: Date;
}

/**
 * Cache invalidation response
 */
export class CacheInvalidationResponseDto {
  @ApiProperty({
    description: 'Whether invalidation was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Invalidation message',
    example: 'Cache invalidated for student 550e8400-e29b-41d4-a716-446655440000',
  })
  message: string;

  @ApiProperty({
    description: 'Invalidation timestamp',
    example: '2026-02-03T10:30:00.000Z',
  })
  invalidatedAt: Date;
}
