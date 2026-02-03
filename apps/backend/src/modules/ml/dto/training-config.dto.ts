/**
 * Training Configuration DTOs
 *
 * @description DTOs for ML model training configuration.
 *
 * @module ml/dto
 * @version 1.0.0
 * @since Sprint 3.2 - ML Prediction Models
 */

import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsArray,
  Min,
  Max,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AlgorithmType, ModelType } from '../interfaces';

/**
 * Hyperparameters DTO
 */
export class HyperparametersDto {
  @ApiPropertyOptional({
    description: 'Maximum depth for tree-based algorithms',
    minimum: 1,
    maximum: 50,
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  maxDepth?: number;

  @ApiPropertyOptional({
    description: 'Number of estimators for ensemble methods',
    minimum: 10,
    maximum: 500,
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(500)
  nEstimators?: number;

  @ApiPropertyOptional({
    description: 'Learning rate for gradient-based algorithms',
    minimum: 0.001,
    maximum: 1.0,
    example: 0.01,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.001)
  @Max(1.0)
  learningRate?: number;

  @ApiPropertyOptional({
    description: 'Regularization strength (L2)',
    minimum: 0,
    maximum: 10,
    example: 0.1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  regularization?: number;

  @ApiPropertyOptional({
    description: 'Minimum samples required to split a node',
    minimum: 2,
    maximum: 100,
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(2)
  @Max(100)
  minSamplesSplit?: number;
}

/**
 * Training Configuration Request DTO
 */
export class TrainingConfigRequestDto {
  @ApiProperty({
    description: 'Type of ML task',
    enum: ['classification', 'regression'],
    example: 'classification',
  })
  @IsEnum(['classification', 'regression'])
  modelType!: 'classification' | 'regression';

  @ApiProperty({
    description: 'Algorithm to use for training',
    enum: AlgorithmType,
    example: AlgorithmType.LOGISTIC_REGRESSION,
  })
  @IsEnum(AlgorithmType)
  algorithm!: AlgorithmType;

  @ApiPropertyOptional({
    description: 'Algorithm-specific hyperparameters',
    type: HyperparametersDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => HyperparametersDto)
  hyperparameters?: HyperparametersDto;

  @ApiPropertyOptional({
    description: 'Number of cross-validation folds',
    minimum: 2,
    maximum: 20,
    default: 5,
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(2)
  @Max(20)
  crossValidationFolds?: number = 5;

  @ApiPropertyOptional({
    description: 'Ratio of data for testing (0-1)',
    minimum: 0.1,
    maximum: 0.5,
    default: 0.2,
    example: 0.2,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(0.5)
  testSplitRatio?: number = 0.2;

  @ApiProperty({
    description: 'Feature names to use for training',
    type: [String],
    example: ['days_since_last_login', 'login_frequency_30d', 'streak_current'],
  })
  @IsArray()
  @IsString({ each: true })
  features!: string[];

  @ApiProperty({
    description: 'Target variable name',
    example: 'dropout_risk',
  })
  @IsString()
  target!: string;

  @ApiPropertyOptional({
    description: 'Whether to normalize features',
    default: true,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  normalizeFeatures?: boolean = true;

  @ApiPropertyOptional({
    description: 'Random seed for reproducibility',
    minimum: 0,
    maximum: 999999,
    example: 42,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(999999)
  randomSeed?: number = 42;

  @ApiPropertyOptional({
    description: 'Maximum training iterations',
    minimum: 100,
    maximum: 10000,
    default: 1000,
    example: 1000,
  })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(10000)
  maxIterations?: number = 1000;

  @ApiPropertyOptional({
    description: 'Early stopping patience (iterations without improvement)',
    minimum: 5,
    maximum: 100,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(100)
  earlyStoppingPatience?: number = 10;
}

/**
 * Train Model Request DTO
 */
export class TrainModelRequestDto {
  @ApiProperty({
    description: 'Model type to train',
    enum: ModelType,
    example: ModelType.DROPOUT_RISK,
  })
  @IsEnum(ModelType)
  modelType!: ModelType;

  @ApiProperty({
    description: 'Training configuration',
    type: TrainingConfigRequestDto,
  })
  @ValidateNested()
  @Type(() => TrainingConfigRequestDto)
  config!: TrainingConfigRequestDto;

  @ApiPropertyOptional({
    description: 'Description/notes for this training run',
    example: 'Retrain with updated features from Q1 2026',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Tags for organizing training runs',
    type: [String],
    example: ['production', 'q1-2026'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

/**
 * Evaluate Model Request DTO
 */
export class EvaluateModelRequestDto {
  @ApiProperty({
    description: 'Model ID to evaluate',
    example: 'dropout_risk_v1.0.0',
  })
  @IsString()
  modelId!: string;

  @ApiPropertyOptional({
    description: 'Model version to evaluate (defaults to active version)',
    example: '1.0.0',
  })
  @IsOptional()
  @IsString()
  version?: string;
}

/**
 * Compare Models Request DTO
 */
export class CompareModelsRequestDto {
  @ApiProperty({
    description: 'Model IDs to compare',
    type: [String],
    example: ['dropout_risk_v1.0.0', 'dropout_risk_v1.1.0'],
  })
  @IsArray()
  @IsString({ each: true })
  modelIds!: string[];

  @ApiPropertyOptional({
    description: 'Primary metric for ranking',
    default: 'f1Score',
    example: 'accuracy',
  })
  @IsOptional()
  @IsString()
  primaryMetric?: string = 'f1Score';
}

/**
 * Tune Hyperparameters Request DTO
 */
export class TuneHyperparametersRequestDto {
  @ApiProperty({
    description: 'Model type to tune',
    enum: ModelType,
    example: ModelType.DROPOUT_RISK,
  })
  @IsEnum(ModelType)
  modelType!: ModelType;

  @ApiProperty({
    description: 'Parameter grid to search',
    example: {
      learningRate: [0.001, 0.01, 0.1],
      regularization: [0.01, 0.1, 1.0],
    },
  })
  @IsObject()
  parameterGrid!: Record<string, (number | string | boolean)[]>;

  @ApiPropertyOptional({
    description: 'Metric to optimize',
    default: 'f1Score',
    example: 'accuracy',
  })
  @IsOptional()
  @IsString()
  optimizeMetric?: string = 'f1Score';

  @ApiPropertyOptional({
    description: 'Maximum combinations to try (for random search)',
    minimum: 10,
    maximum: 1000,
    example: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(1000)
  maxCombinations?: number;
}
