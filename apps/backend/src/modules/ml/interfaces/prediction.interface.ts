/**
 * Prediction Interface
 *
 * @description Defines structures for ML prediction types and results.
 * Supports four prediction types:
 * 1. Dropout Risk - Student at risk of dropping out
 * 2. Performance - Expected score on upcoming exercises
 * 3. Difficulty - Optimal difficulty recommendation
 * 4. Engagement - Predicted engagement level
 *
 * @module ML
 * @sprint 3.1 - Feature Engineering for ML Predictions
 * @created 2026-02-03
 */

/**
 * Types of predictions supported by the ML module
 */
export type PredictionType =
  | 'dropout_risk'
  | 'performance'
  | 'difficulty_recommendation'
  | 'engagement_level';

/**
 * Risk levels for dropout prediction
 */
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

/**
 * Engagement levels for engagement prediction
 * Note: Different from model.interface.ts EngagementLevel enum
 */
export type PredictionEngagementLevel = 'disengaged' | 'low' | 'moderate' | 'high' | 'very_high';

/**
 * Difficulty levels for recommendation
 */
export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'adaptive';

/**
 * Base prediction result interface
 */
export interface BasePrediction {
  /** Type of prediction */
  type: PredictionType;

  /** Student identifier */
  studentId: string;

  /** Prediction timestamp */
  timestamp: Date;

  /** Confidence score (0-1) */
  confidence: number;

  /** Model version used for prediction */
  modelVersion: string;

  /** Features used in the prediction */
  featuresUsed: string[];
}

/**
 * Dropout risk prediction result
 */
export interface DropoutRiskPrediction extends BasePrediction {
  type: 'dropout_risk';

  /** Risk level classification */
  riskLevel: RiskLevel;

  /** Probability of dropout (0-1) */
  dropoutProbability: number;

  /** Top contributing factors */
  riskFactors: {
    factor: string;
    contribution: number;
    description: string;
  }[];

  /** Recommended interventions */
  recommendedInterventions: {
    intervention: string;
    priority: 'immediate' | 'short_term' | 'long_term';
    expectedImpact: number;
  }[];

  /** Trend compared to last prediction */
  trend?: 'improving' | 'stable' | 'worsening';
}

/**
 * Performance prediction result
 */
export interface PerformancePrediction extends BasePrediction {
  type: 'performance';

  /** Predicted score (0-100) */
  predictedScore: number;

  /** Prediction interval */
  predictionInterval: {
    lower: number;
    upper: number;
    confidenceLevel: number;
  };

  /** Module-specific predictions */
  byModule?: {
    moduleId: string;
    moduleName: string;
    predictedScore: number;
    confidence: number;
  }[];

  /** Exercise type predictions */
  byExerciseType?: {
    exerciseType: string;
    predictedScore: number;
    confidence: number;
  }[];

  /** Areas that may challenge the student */
  challengeAreas?: {
    area: string;
    difficulty: 'moderate' | 'high';
    recommendation: string;
  }[];
}

/**
 * Difficulty recommendation result
 */
export interface DifficultyRecommendation extends BasePrediction {
  type: 'difficulty_recommendation';

  /** Recommended difficulty level */
  recommendedDifficulty: DifficultyLevel;

  /** Optimal difficulty score (1-10) */
  optimalDifficultyScore: number;

  /** Zone of proximal development */
  zpd: {
    lowerBound: number;
    upperBound: number;
    description: string;
  };

  /** Difficulty distribution recommendation */
  distributionRecommendation: {
    easy: number;
    medium: number;
    hard: number;
  };

  /** Adaptive difficulty parameters */
  adaptiveParams?: {
    currentLevel: number;
    targetLevel: number;
    adjustmentRate: number;
  };
}

/**
 * Engagement level prediction result
 */
export interface EngagementPrediction extends BasePrediction {
  type: 'engagement_level';

  /** Predicted engagement level */
  engagementLevel: PredictionEngagementLevel;

  /** Engagement score (0-100) */
  engagementScore: number;

  /** Component scores */
  components: {
    behavioral: number;
    cognitive: number;
    emotional: number;
  };

  /** Engagement drivers */
  drivers: {
    positive: {
      driver: string;
      impact: number;
    }[];
    negative: {
      driver: string;
      impact: number;
    }[];
  };

  /** Predicted session likelihood */
  sessionPrediction?: {
    likelyToLoginToday: boolean;
    predictedSessionDuration: number;
    optimalContactTime: string;
  };
}

/**
 * Union type for all prediction results
 */
export type PredictionResult =
  | DropoutRiskPrediction
  | PerformancePrediction
  | DifficultyRecommendation
  | EngagementPrediction;

/**
 * Prediction request configuration
 */
export interface PredictionRequest {
  /** Student identifier */
  studentId: string;

  /** Types of predictions to generate */
  predictionTypes: PredictionType[];

  /** Whether to include detailed explanations */
  includeExplanations?: boolean;

  /** Whether to include historical trend */
  includeTrend?: boolean;

  /** Context for the prediction */
  context?: {
    upcomingModuleId?: string;
    targetExerciseType?: string;
    timeHorizon?: 'immediate' | 'short_term' | 'long_term';
  };
}

/**
 * Batch prediction result
 */
export interface BatchPredictionResult {
  /** Predictions for each student */
  predictions: {
    studentId: string;
    results: PredictionResult[];
  }[];

  /** Failed predictions */
  failures: {
    studentId: string;
    error: string;
  }[];

  /** Batch statistics */
  stats: {
    totalRequested: number;
    successCount: number;
    failureCount: number;
    totalTimeMs: number;
  };
}

/**
 * Model performance metrics for predictions
 * Note: Different from model.interface.ts ModelMetrics
 */
export interface PredictionModelMetrics {
  /** Model identifier */
  modelId: string;

  /** Model version */
  version: string;

  /** Prediction type */
  predictionType: PredictionType;

  /** Accuracy metrics */
  accuracy?: {
    overall: number;
    byClass?: Record<string, number>;
  };

  /** Regression metrics (for performance prediction) */
  regression?: {
    mae: number;
    rmse: number;
    r2: number;
  };

  /** Classification metrics (for risk/engagement) */
  classification?: {
    precision: number;
    recall: number;
    f1Score: number;
    auc: number;
  };

  /** Last evaluated timestamp */
  lastEvaluated: Date;

  /** Training data size */
  trainingDataSize: number;
}
