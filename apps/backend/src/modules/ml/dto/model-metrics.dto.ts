/**
 * Model Metrics DTOs
 *
 * @description DTOs for ML model metrics and evaluation results.
 *
 * @module ml/dto
 * @version 1.0.0
 * @since Sprint 3.2 - ML Prediction Models
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ModelType, AlgorithmType, DropoutRiskLevel, EngagementLevel, DifficultyMatch } from '../interfaces';

/**
 * Model Metrics Response DTO
 */
export class ModelMetricsResponseDto {
  @ApiProperty({
    description: 'Classification accuracy (0-1)',
    example: 0.87,
  })
  accuracy?: number;

  @ApiProperty({
    description: 'Precision score (0-1)',
    example: 0.85,
  })
  precision?: number;

  @ApiProperty({
    description: 'Recall score (0-1)',
    example: 0.82,
  })
  recall?: number;

  @ApiProperty({
    description: 'F1 score (harmonic mean of precision and recall)',
    example: 0.83,
  })
  f1Score?: number;

  @ApiProperty({
    description: 'Root Mean Square Error (for regression)',
    example: 12.5,
  })
  rmse?: number;

  @ApiProperty({
    description: 'Mean Absolute Error (for regression)',
    example: 8.3,
  })
  mae?: number;

  @ApiProperty({
    description: 'Area Under ROC Curve (0-1)',
    example: 0.91,
  })
  auc?: number;

  @ApiProperty({
    description: 'When the model was trained',
    example: '2026-02-03T10:30:00Z',
  })
  trainedAt!: Date;

  @ApiProperty({
    description: 'Number of samples used for training',
    example: 5000,
  })
  trainingSamples!: number;

  @ApiProperty({
    description: 'Number of samples used for validation',
    example: 1000,
  })
  validationSamples!: number;

  @ApiPropertyOptional({
    description: 'Feature importance scores',
    example: {
      days_since_last_login: 0.35,
      login_frequency_30d: 0.25,
      streak_current: 0.20,
      completion_rate_30d: 0.15,
      engagement_trend: 0.05,
    },
  })
  featureImportance?: Record<string, number>;
}

/**
 * Model Info Response DTO
 */
export class ModelInfoResponseDto {
  @ApiProperty({
    description: 'Model identifier',
    example: 'dropout_risk',
  })
  modelId!: string;

  @ApiProperty({
    description: 'Model type',
    enum: ModelType,
    example: ModelType.DROPOUT_RISK,
  })
  modelType!: ModelType;

  @ApiProperty({
    description: 'Current version',
    example: '1.0.0',
  })
  version!: string;

  @ApiProperty({
    description: 'Algorithm used',
    enum: AlgorithmType,
    example: AlgorithmType.LOGISTIC_REGRESSION,
  })
  algorithm!: AlgorithmType;

  @ApiProperty({
    description: 'Whether model is loaded and ready',
    example: true,
  })
  isLoaded!: boolean;

  @ApiProperty({
    description: 'Whether this is the active version',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'Performance metrics',
    type: ModelMetricsResponseDto,
  })
  metrics!: ModelMetricsResponseDto;

  @ApiProperty({
    description: 'Features used by this model',
    type: [String],
    example: ['days_since_last_login', 'login_frequency_30d'],
  })
  features!: string[];

  @ApiPropertyOptional({
    description: 'Description/notes',
    example: 'Production model for Q1 2026',
  })
  description?: string;

  @ApiProperty({
    description: 'When this version was created',
    example: '2026-02-03T10:30:00Z',
  })
  createdAt!: Date;
}

/**
 * Training Result Response DTO
 */
export class TrainingResultResponseDto {
  @ApiProperty({
    description: 'Whether training succeeded',
    example: true,
  })
  success!: boolean;

  @ApiProperty({
    description: 'Model ID assigned',
    example: 'dropout_risk',
  })
  modelId!: string;

  @ApiProperty({
    description: 'Version assigned',
    example: '1.1.0',
  })
  version!: string;

  @ApiProperty({
    description: 'Training metrics',
    type: ModelMetricsResponseDto,
  })
  metrics!: ModelMetricsResponseDto;

  @ApiProperty({
    description: 'Training duration in milliseconds',
    example: 5230,
  })
  trainingDurationMs!: number;

  @ApiProperty({
    description: 'Training completed at',
    example: '2026-02-03T10:35:00Z',
  })
  completedAt!: Date;

  @ApiPropertyOptional({
    description: 'Error message if failed',
    example: 'Insufficient training data',
  })
  error?: string;

  @ApiProperty({
    description: 'Training history summary',
    example: {
      iterations: 500,
      earlyStopped: true,
      bestIteration: 450,
    },
  })
  historySummary!: {
    iterations: number;
    earlyStopped: boolean;
    bestIteration?: number;
  };
}

/**
 * Model Version Response DTO
 */
export class ModelVersionResponseDto {
  @ApiProperty({
    description: 'Version string',
    example: '1.0.0',
  })
  version!: string;

  @ApiProperty({
    description: 'Whether this is the active version',
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    description: 'When this version was created',
    example: '2026-02-03T10:30:00Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Performance metrics',
    type: ModelMetricsResponseDto,
  })
  metrics!: ModelMetricsResponseDto;

  @ApiPropertyOptional({
    description: 'Description/notes',
    example: 'Initial production model',
  })
  description?: string;
}

/**
 * Dropout Risk Prediction Response DTO
 */
export class DropoutRiskPredictionResponseDto {
  @ApiProperty({
    description: 'Student ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  studentId!: string;

  @ApiProperty({
    description: 'Risk level classification',
    enum: DropoutRiskLevel,
    example: DropoutRiskLevel.MEDIUM,
  })
  riskLevel!: DropoutRiskLevel;

  @ApiProperty({
    description: 'Probability of dropout (0-1)',
    example: 0.45,
  })
  probability!: number;

  @ApiProperty({
    description: 'Factors contributing to risk',
    type: [String],
    example: ['Low login frequency', 'Declining engagement trend'],
  })
  contributingFactors!: string[];

  @ApiProperty({
    description: 'Recommended interventions',
    type: [String],
    example: ['Send engagement reminder', 'Schedule check-in call'],
  })
  recommendedInterventions!: string[];

  @ApiProperty({
    description: 'Confidence in prediction (0-1)',
    example: 0.85,
  })
  confidence!: number;

  @ApiProperty({
    description: 'Whether rule-based fallback was used',
    example: false,
  })
  usedFallback!: boolean;

  @ApiProperty({
    description: 'Model version used',
    example: '1.0.0',
  })
  modelVersion!: string;

  @ApiProperty({
    description: 'Prediction timestamp',
    example: '2026-02-03T10:30:00Z',
  })
  predictedAt!: Date;
}

/**
 * Performance Prediction Response DTO
 */
export class PerformancePredictionResponseDto {
  @ApiProperty({
    description: 'Student ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  studentId!: string;

  @ApiProperty({
    description: 'Predicted score (0-100)',
    example: 78.5,
  })
  predictedScore!: number;

  @ApiProperty({
    description: 'Confidence interval [low, high]',
    example: [72, 85],
  })
  confidenceInterval!: [number, number];

  @ApiProperty({
    description: 'Difficulty match assessment',
    enum: DifficultyMatch,
    example: DifficultyMatch.APPROPRIATE,
  })
  difficultyMatch!: DifficultyMatch;

  @ApiProperty({
    description: 'Confidence in prediction (0-1)',
    example: 0.82,
  })
  confidence!: number;

  @ApiProperty({
    description: 'Whether rule-based fallback was used',
    example: false,
  })
  usedFallback!: boolean;

  @ApiProperty({
    description: 'Model version used',
    example: '1.0.0',
  })
  modelVersion!: string;

  @ApiProperty({
    description: 'Prediction timestamp',
    example: '2026-02-03T10:30:00Z',
  })
  predictedAt!: Date;
}

/**
 * Difficulty Recommendation Response DTO
 */
export class DifficultyRecommendationResponseDto {
  @ApiProperty({
    description: 'Student ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  studentId!: string;

  @ApiProperty({
    description: 'Recommended difficulty level (1-5)',
    example: 3,
  })
  recommendedDifficulty!: number;

  @ApiProperty({
    description: 'Human-readable reason',
    example: 'Student is performing well at current level; slight increase recommended',
  })
  reason!: string;

  @ApiProperty({
    description: 'Alternative exercise IDs',
    type: [String],
    example: [],
  })
  alternativeExercises!: string[];

  @ApiProperty({
    description: 'Adjustment from current level',
    example: 1,
  })
  adjustment!: number;

  @ApiProperty({
    description: 'Confidence in recommendation (0-1)',
    example: 0.75,
  })
  confidence!: number;

  @ApiProperty({
    description: 'Whether rule-based fallback was used',
    example: false,
  })
  usedFallback!: boolean;

  @ApiProperty({
    description: 'Model version used',
    example: '1.0.0',
  })
  modelVersion!: string;

  @ApiProperty({
    description: 'Prediction timestamp',
    example: '2026-02-03T10:30:00Z',
  })
  predictedAt!: Date;
}

/**
 * Engagement Prediction Response DTO
 */
export class EngagementPredictionResponseDto {
  @ApiProperty({
    description: 'Student ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  studentId!: string;

  @ApiProperty({
    description: 'Predicted engagement level',
    enum: EngagementLevel,
    example: EngagementLevel.MEDIUM,
  })
  predictedEngagement!: EngagementLevel;

  @ApiProperty({
    description: 'Best time to engage',
    example: 'Afternoon (2-4 PM)',
  })
  bestTimeToEngage!: string;

  @ApiProperty({
    description: 'Suggested engagement boosters',
    type: [String],
    example: ['Unlock new achievement', 'Send mission reminder'],
  })
  engagementBoosters!: string[];

  @ApiProperty({
    description: 'Probability of high engagement (0-1)',
    example: 0.65,
  })
  highEngagementProbability!: number;

  @ApiProperty({
    description: 'Confidence in prediction (0-1)',
    example: 0.78,
  })
  confidence!: number;

  @ApiProperty({
    description: 'Whether rule-based fallback was used',
    example: false,
  })
  usedFallback!: boolean;

  @ApiProperty({
    description: 'Model version used',
    example: '1.0.0',
  })
  modelVersion!: string;

  @ApiProperty({
    description: 'Prediction timestamp',
    example: '2026-02-03T10:30:00Z',
  })
  predictedAt!: Date;
}

/**
 * Cross-Validation Summary Response DTO
 */
export class CrossValidationSummaryResponseDto {
  @ApiProperty({
    description: 'Number of folds used',
    example: 5,
  })
  folds!: number;

  @ApiProperty({
    description: 'Mean accuracy across folds',
    example: 0.85,
  })
  meanAccuracy!: number;

  @ApiProperty({
    description: 'Standard deviation of accuracy',
    example: 0.03,
  })
  stdAccuracy!: number;

  @ApiProperty({
    description: '95% confidence interval for accuracy',
    example: [0.82, 0.88],
  })
  confidenceInterval!: [number, number];

  @ApiProperty({
    description: 'Whether overfitting was detected',
    example: false,
  })
  overfittingDetected!: boolean;

  @ApiPropertyOptional({
    description: 'Overfitting severity (0-1)',
    example: 0.1,
  })
  overfittingSeverity?: number;
}

/**
 * Model Comparison Response DTO
 */
export class ModelComparisonResponseDto {
  @ApiProperty({
    description: 'Models compared',
    type: [String],
    example: ['dropout_risk_v1.0.0', 'dropout_risk_v1.1.0'],
  })
  models!: string[];

  @ApiProperty({
    description: 'Ranking by primary metric',
    example: [
      { modelId: 'dropout_risk_v1.1.0', rank: 1, primaryMetricValue: 0.88 },
      { modelId: 'dropout_risk_v1.0.0', rank: 2, primaryMetricValue: 0.85 },
    ],
  })
  ranking!: Array<{
    modelId: string;
    rank: number;
    primaryMetricValue: number;
  }>;

  @ApiProperty({
    description: 'Primary metric used for ranking',
    example: 'f1Score',
  })
  primaryMetric!: string;

  @ApiProperty({
    description: 'Best model ID',
    example: 'dropout_risk_v1.1.0',
  })
  bestModel!: string;

  @ApiProperty({
    description: 'Comparison timestamp',
    example: '2026-02-03T10:30:00Z',
  })
  comparedAt!: Date;
}
