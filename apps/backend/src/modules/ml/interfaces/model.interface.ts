/**
 * ML Model Interfaces
 *
 * @description Core interfaces for Machine Learning models in GAMILIT.
 * These models predict student outcomes and provide personalized recommendations.
 *
 * @module ml/interfaces
 * @version 1.0.0
 * @since Sprint 3.2 - ML Prediction Models
 */

/**
 * Base Model Interface
 * @description Contract for all ML prediction models
 * @template TInput - Type of input features
 * @template TOutput - Type of prediction output
 */
export interface IModel<TInput, TOutput> {
  /** Unique model identifier */
  modelId: string;

  /** Model version string (semver format) */
  version: string;

  /**
   * Make a prediction based on input features
   * @param input - Feature input for prediction
   * @returns Promise with prediction output
   */
  predict(input: TInput): Promise<TOutput>;

  /**
   * Get current model performance metrics
   * @returns Model metrics
   */
  getMetrics(): ModelMetrics;

  /**
   * Check if model is loaded and ready for predictions
   * @returns True if model is ready
   */
  isLoaded(): boolean;
}

/**
 * Model Performance Metrics
 * @description Metrics from training and validation
 */
export interface ModelMetrics {
  /** Classification accuracy (0-1) */
  accuracy?: number;

  /** Precision score (0-1) - for classification */
  precision?: number;

  /** Recall score (0-1) - for classification */
  recall?: number;

  /** F1 score (0-1) - harmonic mean of precision and recall */
  f1Score?: number;

  /** Root Mean Square Error - for regression */
  rmse?: number;

  /** Mean Absolute Error - for regression */
  mae?: number;

  /** Area Under ROC Curve (0-1) */
  auc?: number;

  /** When the model was trained */
  trainedAt: Date;

  /** Number of samples used for training */
  trainingSamples: number;

  /** Number of samples used for validation */
  validationSamples: number;

  /** Feature importance scores */
  featureImportance?: Record<string, number>;

  /** Custom metrics specific to the model */
  customMetrics?: Record<string, number>;
}

/**
 * Model Types
 * @description Available ML model types in the system
 */
export enum ModelType {
  /** Predict student dropout risk */
  DROPOUT_RISK = 'dropout_risk',

  /** Predict performance on next exercise */
  PERFORMANCE_PREDICTOR = 'performance_predictor',

  /** Recommend optimal exercise difficulty */
  DIFFICULTY_RECOMMENDER = 'difficulty_recommender',

  /** Predict engagement levels */
  ENGAGEMENT_PREDICTOR = 'engagement_predictor',
}

/**
 * Algorithm Types
 * @description ML algorithms that can be used for training
 */
export enum AlgorithmType {
  /** Random Forest (ensemble of decision trees) */
  RANDOM_FOREST = 'random_forest',

  /** Gradient Boosting (sequential ensemble) */
  GRADIENT_BOOSTING = 'gradient_boosting',

  /** Logistic Regression (classification) */
  LOGISTIC_REGRESSION = 'logistic_regression',

  /** Linear Regression (regression) */
  LINEAR_REGRESSION = 'linear_regression',
}

/**
 * Model Weights Structure
 * @description Stored model weights from database
 */
export interface ModelWeights {
  /** Model identifier */
  modelId: string;

  /** Model version */
  version: string;

  /** Feature weights map */
  weights: Record<string, number>;

  /** Bias term */
  bias: number;

  /** When weights were trained */
  trainedAt: Date;

  /** Number of training samples */
  trainingSamples: number;

  /** Performance metrics at training time */
  metrics: ModelMetrics;
}

/**
 * Prediction Log Entry
 * @description Structure for logging predictions
 */
export interface PredictionLog {
  /** Unique prediction ID */
  predictionId: string;

  /** Model that made the prediction */
  modelId: string;

  /** Model version used */
  version: string;

  /** Student ID (if applicable) */
  studentId?: string;

  /** Input features used */
  input: Record<string, unknown>;

  /** Output prediction */
  output: Record<string, unknown>;

  /** Confidence score (0-1) */
  confidence?: number;

  /** When prediction was made */
  predictedAt: Date;

  /** Actual outcome (for later validation) */
  actualOutcome?: Record<string, unknown>;

  /** Response time in milliseconds */
  responseTimeMs: number;
}

// ============================================
// DROPOUT RISK MODEL TYPES
// ============================================

/**
 * Dropout Risk Level
 * @description Risk categories for student dropout
 */
export enum DropoutRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Dropout Risk Input Features
 */
export interface DropoutRiskInput {
  /** Days since student's last login */
  daysSinceLastLogin: number;

  /** Number of logins in last 30 days */
  loginFrequency30d: number;

  /** Current streak length (days) */
  streakCurrent: number;

  /** Exercise completion rate in last 30 days (0-1) */
  completionRate30d: number;

  /** Engagement trend (-1 to 1, negative = declining) */
  engagementTrend: number;

  /** Optional: student's grade level */
  gradeLevel?: string;

  /** Optional: total days since registration */
  daysSinceRegistration?: number;
}

/**
 * Dropout Risk Prediction Output
 */
export interface DropoutRiskOutput {
  /** Risk classification */
  riskLevel: DropoutRiskLevel;

  /** Probability of dropout (0-1) */
  probability: number;

  /** Factors contributing to risk */
  contributingFactors: string[];

  /** Recommended interventions */
  recommendedInterventions: string[];

  /** Confidence in prediction (0-1) */
  confidence: number;

  /** Whether this used rule-based fallback */
  usedFallback: boolean;
}

// ============================================
// PERFORMANCE PREDICTOR MODEL TYPES
// ============================================

/**
 * Difficulty Match Classification
 */
export enum DifficultyMatch {
  TOO_EASY = 'too_easy',
  APPROPRIATE = 'appropriate',
  TOO_HARD = 'too_hard',
}

/**
 * Performance Predictor Input Features
 */
export interface PerformancePredictorInput {
  /** Average score in last 7 days (0-100) */
  avgScore7d: number;

  /** Module progress (0-1) */
  moduleProgress: number;

  /** Exercise difficulty level (1-5) */
  exerciseDifficulty: number;

  /** Hours since last exercise */
  timeSinceLastExercise: number;

  /** Historical performance on this exercise type (0-100) */
  historicalPerformanceOnType: number;

  /** Optional: number of attempts on similar exercises */
  attemptsOnSimilar?: number;

  /** Optional: current streak */
  currentStreak?: number;
}

/**
 * Performance Prediction Output
 */
export interface PerformancePredictorOutput {
  /** Predicted score (0-100) */
  predictedScore: number;

  /** Confidence interval [low, high] */
  confidenceInterval: [number, number];

  /** Assessment of difficulty match */
  difficultyMatch: DifficultyMatch;

  /** Confidence in prediction (0-1) */
  confidence: number;

  /** Whether this used rule-based fallback */
  usedFallback: boolean;
}

// ============================================
// DIFFICULTY RECOMMENDER MODEL TYPES
// ============================================

/**
 * Difficulty Recommender Input Features
 */
export interface DifficultyRecommenderInput {
  /** Current performance level (0-100) */
  currentPerformance: number;

  /** Frustration indicators (failure rate, time struggles) */
  frustrationIndicators: {
    failureRate: number; // 0-1
    avgTimeOverExpected: number; // ratio
    consecutiveFailures: number;
  };

  /** Boredom indicators (speed, skips) */
  boredomIndicators: {
    completionSpeedRatio: number; // ratio to expected
    skipRate: number; // 0-1
    consecutiveEasyPasses: number;
  };

  /** Zone of proximal development range */
  zoneOfProximalDevelopment: {
    currentLevel: number;
    mastered: number;
    challenged: number;
  };

  /** Optional: preferred learning pace */
  preferredPace?: 'slow' | 'normal' | 'fast';
}

/**
 * Difficulty Recommendation Output
 */
export interface DifficultyRecommenderOutput {
  /** Recommended difficulty level (1-5) */
  recommendedDifficulty: number;

  /** Human-readable reason for recommendation */
  reason: string;

  /** Alternative exercise IDs to consider */
  alternativeExercises: string[];

  /** Adjustment from current level */
  adjustment: number;

  /** Confidence in recommendation (0-1) */
  confidence: number;

  /** Whether this used rule-based fallback */
  usedFallback: boolean;
}

// ============================================
// ENGAGEMENT PREDICTOR MODEL TYPES
// ============================================

/**
 * Engagement Level Classification
 */
export enum EngagementLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

/**
 * Engagement Predictor Input Features
 */
export interface EngagementPredictorInput {
  /** Historical engagement pattern (sessions per day by hour) */
  historicalEngagementPattern: number[];

  /** Day of week (0-6, Sunday = 0) */
  dayOfWeek: number;

  /** Time of day (hour, 0-23) */
  timeOfDay: number;

  /** Number of recent achievements */
  recentAchievements: number;

  /** Number of pending missions */
  pendingMissions: number;

  /** Optional: days since last reward */
  daysSinceLastReward?: number;

  /** Optional: current streak */
  currentStreak?: number;
}

/**
 * Engagement Prediction Output
 */
export interface EngagementPredictorOutput {
  /** Predicted engagement level */
  predictedEngagement: EngagementLevel;

  /** Best time to engage (human-readable) */
  bestTimeToEngage: string;

  /** Suggested engagement boosters */
  engagementBoosters: string[];

  /** Probability of high engagement (0-1) */
  highEngagementProbability: number;

  /** Confidence in prediction (0-1) */
  confidence: number;

  /** Whether this used rule-based fallback */
  usedFallback: boolean;
}
