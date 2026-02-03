/**
 * Model Admin DTOs
 *
 * DTOs for ML model administration and management.
 *
 * @module ml/dto
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';

/**
 * Model types available in the system
 */
export enum MLModelType {
  DROPOUT_RISK = 'dropout_risk',
  PERFORMANCE = 'performance',
  DIFFICULTY = 'difficulty',
  ENGAGEMENT = 'engagement',
}

/**
 * Model status
 */
export enum MLModelStatus {
  ACTIVE = 'active',
  TRAINING = 'training',
  INACTIVE = 'inactive',
  FAILED = 'failed',
}

/**
 * Model info response
 */
export class MLModelInfoDto {
  @ApiProperty({
    description: 'Model type',
    enum: MLModelType,
    example: 'dropout_risk',
  })
  modelType!: MLModelType;

  @ApiProperty({
    description: 'Current active version',
    example: '1.2.3',
  })
  activeVersion!: string;

  @ApiProperty({
    description: 'Model status',
    enum: MLModelStatus,
    example: 'active',
  })
  status!: MLModelStatus;

  @ApiProperty({
    description: 'Available versions',
    type: [String],
    example: ['1.0.0', '1.1.0', '1.2.3'],
  })
  availableVersions!: string[];

  @ApiProperty({
    description: 'Last trained timestamp',
    example: '2026-01-15T10:00:00Z',
  })
  lastTrainedAt!: Date;

  @ApiProperty({
    description: 'Training data size',
    example: 50000,
  })
  trainingDataSize!: number;

  @ApiProperty({
    description: 'Model accuracy',
    example: 0.87,
  })
  accuracy!: number;

  @ApiProperty({
    description: 'Whether model is ready for predictions',
    example: true,
  })
  isReady!: boolean;
}

/**
 * Request DTO for triggering model training
 */
export class TriggerTrainingRequestDto {
  @ApiPropertyOptional({
    description: 'Training data date range start',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsString()
  dataFromDate?: string;

  @ApiPropertyOptional({
    description: 'Training data date range end',
    example: '2026-01-31',
  })
  @IsOptional()
  @IsString()
  dataToDate?: string;

  @ApiPropertyOptional({
    description: 'Hyperparameters override',
    example: { learning_rate: 0.01, epochs: 100 },
  })
  @IsOptional()
  hyperparameters?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Version tag for this training run',
    example: '1.3.0',
  })
  @IsOptional()
  @IsString()
  versionTag?: string;
}

/**
 * Response DTO for training trigger
 */
export class TriggerTrainingResponseDto {
  @ApiProperty({
    description: 'Training job ID',
    example: 'train-550e8400-e29b-41d4-a716-446655440001',
  })
  jobId!: string;

  @ApiProperty({
    description: 'Model type being trained',
    enum: MLModelType,
    example: 'dropout_risk',
  })
  modelType!: MLModelType;

  @ApiProperty({
    description: 'Training status',
    example: 'queued',
  })
  status!: string;

  @ApiProperty({
    description: 'Estimated completion time',
    example: '2026-02-03T12:00:00Z',
  })
  estimatedCompletionAt!: Date;

  @ApiProperty({
    description: 'Training started timestamp',
    example: '2026-02-03T10:30:00Z',
  })
  startedAt!: Date;
}

/**
 * Request DTO for activating a model version
 */
export class ActivateModelVersionRequestDto {
  @ApiProperty({
    description: 'Version to activate',
    example: '1.2.3',
  })
  @IsString()
  version!: string;

  @ApiPropertyOptional({
    description: 'Reason for activation',
    example: 'New model shows 5% improvement in accuracy',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

/**
 * Response DTO for model version activation
 */
export class ActivateModelVersionResponseDto {
  @ApiProperty({
    description: 'Model type',
    enum: MLModelType,
    example: 'dropout_risk',
  })
  modelType!: MLModelType;

  @ApiProperty({
    description: 'Previous active version',
    example: '1.1.0',
  })
  previousVersion!: string;

  @ApiProperty({
    description: 'New active version',
    example: '1.2.3',
  })
  newVersion!: string;

  @ApiProperty({
    description: 'Activation timestamp',
    example: '2026-02-03T10:30:00Z',
  })
  activatedAt!: Date;

  @ApiProperty({
    description: 'Admin who activated',
    example: 'admin@example.com',
  })
  activatedBy!: string;
}

/**
 * Prediction log entry
 */
export class PredictionLogEntryDto {
  @ApiProperty({
    description: 'Prediction log ID',
    example: '990e8400-e29b-41d4-a716-446655440001',
  })
  id!: string;

  @ApiProperty({
    description: 'Model type used',
    enum: MLModelType,
    example: 'dropout_risk',
  })
  modelType!: MLModelType;

  @ApiProperty({
    description: 'Model version used',
    example: '1.2.3',
  })
  modelVersion!: string;

  @ApiProperty({
    description: 'Student ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  studentId!: string;

  @ApiProperty({
    description: 'Prediction output (summary)',
    example: { risk_level: 'medium', probability: 0.42 },
  })
  output!: Record<string, unknown>;

  @ApiProperty({
    description: 'Prediction confidence',
    example: 0.85,
  })
  confidence!: number;

  @ApiProperty({
    description: 'Prediction latency (ms)',
    example: 45,
  })
  latencyMs!: number;

  @ApiProperty({
    description: 'Whether result was from cache',
    example: false,
  })
  cached!: boolean;

  @ApiProperty({
    description: 'Prediction timestamp',
    example: '2026-02-03T10:30:00Z',
  })
  createdAt!: Date;
}

/**
 * Query DTO for prediction logs
 */
export class PredictionLogsQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by model type',
    enum: MLModelType,
  })
  @IsOptional()
  @IsEnum(MLModelType)
  modelType?: MLModelType;

  @ApiPropertyOptional({
    description: 'Filter by student ID',
  })
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional({
    description: 'From date',
    example: '2026-02-01',
  })
  @IsOptional()
  @IsString()
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'To date',
    example: '2026-02-03',
  })
  @IsOptional()
  @IsString()
  toDate?: string;

  @ApiPropertyOptional({
    description: 'Only show cached predictions',
    default: false,
  })
  @IsOptional()
  cachedOnly?: boolean;

  @ApiPropertyOptional({
    description: 'Limit results',
    default: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number = 100;

  @ApiPropertyOptional({
    description: 'Offset for pagination',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}

/**
 * Paginated prediction logs response
 */
export class PaginatedPredictionLogsDto {
  @ApiProperty({
    description: 'Prediction logs',
    type: [PredictionLogEntryDto],
  })
  logs!: PredictionLogEntryDto[];

  @ApiProperty({
    description: 'Total count',
    example: 1500,
  })
  total!: number;

  @ApiProperty({
    description: 'Current page limit',
    example: 100,
  })
  limit!: number;

  @ApiProperty({
    description: 'Current offset',
    example: 0,
  })
  offset!: number;

  @ApiProperty({
    description: 'Has more results',
    example: true,
  })
  hasMore!: boolean;
}

/**
 * Cache clear response
 */
export class ClearCacheResponseDto {
  @ApiProperty({
    description: 'Number of cache entries cleared',
    example: 1250,
  })
  clearedCount!: number;

  @ApiProperty({
    description: 'Cache clear timestamp',
    example: '2026-02-03T10:30:00Z',
  })
  clearedAt!: Date;

  @ApiProperty({
    description: 'Admin who cleared',
    example: 'admin@example.com',
  })
  clearedBy!: string;
}
