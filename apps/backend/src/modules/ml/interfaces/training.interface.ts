/**
 * ML Training Interfaces
 *
 * @description Interfaces for ML model training, validation, and evaluation.
 *
 * @module ml/interfaces
 * @version 1.0.0
 * @since Sprint 3.2 - ML Prediction Models
 */

import { ModelType, AlgorithmType, ModelMetrics } from './model.interface';

/**
 * Training Configuration
 * @description Configuration for model training
 */
export interface TrainingConfig {
  /** Type of ML task */
  modelType: 'classification' | 'regression';

  /** Algorithm to use */
  algorithm: AlgorithmType;

  /** Algorithm-specific hyperparameters */
  hyperparameters: Record<string, number | string | boolean>;

  /** Number of cross-validation folds */
  crossValidationFolds: number;

  /** Ratio of data for testing (0-1) */
  testSplitRatio: number;

  /** Feature names to use */
  features: string[];

  /** Target variable name */
  target: string;

  /** Whether to normalize features */
  normalizeFeatures: boolean;

  /** Random seed for reproducibility */
  randomSeed?: number;

  /** Maximum training iterations */
  maxIterations?: number;

  /** Early stopping patience */
  earlyStoppingPatience?: number;

  /** Learning rate (for gradient-based algorithms) */
  learningRate?: number;

  /** Regularization strength */
  regularizationStrength?: number;
}

/**
 * Default Training Configuration
 */
export const DEFAULT_TRAINING_CONFIG: TrainingConfig = {
  modelType: 'classification',
  algorithm: AlgorithmType.LOGISTIC_REGRESSION,
  hyperparameters: {},
  crossValidationFolds: 5,
  testSplitRatio: 0.2,
  features: [],
  target: '',
  normalizeFeatures: true,
  randomSeed: 42,
  maxIterations: 1000,
  earlyStoppingPatience: 10,
  learningRate: 0.01,
  regularizationStrength: 0.1,
};

/**
 * Training Data Point
 * @description Single training sample with features and label
 */
export interface TrainingDataPoint {
  /** Feature values */
  features: Record<string, number>;

  /** Target/label value */
  label: number | string;

  /** Optional: sample weight */
  weight?: number;

  /** Optional: metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Training Data Set
 * @description Collection of training data with metadata
 */
export interface TrainingDataSet {
  /** Training samples */
  data: TrainingDataPoint[];

  /** Feature names */
  featureNames: string[];

  /** Target name */
  targetName: string;

  /** Whether target is categorical */
  isClassification: boolean;

  /** Unique class labels (for classification) */
  classLabels?: string[];

  /** Dataset statistics */
  statistics: DatasetStatistics;
}

/**
 * Dataset Statistics
 */
export interface DatasetStatistics {
  /** Total number of samples */
  totalSamples: number;

  /** Number of features */
  numFeatures: number;

  /** Feature statistics */
  featureStats: Record<string, FeatureStatistics>;

  /** Class distribution (for classification) */
  classDistribution?: Record<string, number>;

  /** Target statistics (for regression) */
  targetStats?: FeatureStatistics;
}

/**
 * Feature Statistics
 */
export interface FeatureStatistics {
  /** Minimum value */
  min: number;

  /** Maximum value */
  max: number;

  /** Mean value */
  mean: number;

  /** Standard deviation */
  std: number;

  /** Median value */
  median: number;

  /** Number of missing values */
  missingCount: number;
}

/**
 * Training Result
 * @description Result from training a model
 */
export interface TrainingResult {
  /** Whether training succeeded */
  success: boolean;

  /** Model ID assigned */
  modelId: string;

  /** Model version */
  version: string;

  /** Trained model weights */
  weights: Record<string, number>;

  /** Bias term */
  bias: number;

  /** Training metrics */
  metrics: ModelMetrics;

  /** Training history (loss per iteration) */
  history: TrainingHistory;

  /** Configuration used */
  config: TrainingConfig;

  /** Duration in milliseconds */
  trainingDurationMs: number;

  /** Timestamp when training completed */
  completedAt: Date;

  /** Error message if failed */
  error?: string;
}

/**
 * Training History
 * @description Metrics over training iterations
 */
export interface TrainingHistory {
  /** Loss values per iteration */
  loss: number[];

  /** Validation loss per iteration */
  valLoss?: number[];

  /** Accuracy per iteration (classification) */
  accuracy?: number[];

  /** Validation accuracy per iteration */
  valAccuracy?: number[];

  /** Total iterations completed */
  iterations: number;

  /** Whether early stopping was triggered */
  earlyStopped: boolean;

  /** Best iteration number */
  bestIteration?: number;
}

/**
 * Evaluation Result
 * @description Result from evaluating a model on test data
 */
export interface EvaluationResult {
  /** Model ID evaluated */
  modelId: string;

  /** Model version */
  version: string;

  /** Performance metrics */
  metrics: ModelMetrics;

  /** Confusion matrix (for classification) */
  confusionMatrix?: ConfusionMatrix;

  /** Per-class metrics (for classification) */
  perClassMetrics?: Record<string, ClassMetrics>;

  /** Residual statistics (for regression) */
  residualStats?: ResidualStatistics;

  /** Test samples used */
  testSamples: number;

  /** Evaluation duration in milliseconds */
  evaluationDurationMs: number;

  /** Timestamp when evaluation completed */
  completedAt: Date;
}

/**
 * Confusion Matrix
 * @description Classification confusion matrix
 */
export interface ConfusionMatrix {
  /** Class labels */
  labels: string[];

  /** Matrix values [predicted][actual] */
  matrix: number[][];

  /** True positives per class */
  truePositives: Record<string, number>;

  /** False positives per class */
  falsePositives: Record<string, number>;

  /** True negatives per class */
  trueNegatives: Record<string, number>;

  /** False negatives per class */
  falseNegatives: Record<string, number>;
}

/**
 * Per-Class Metrics
 */
export interface ClassMetrics {
  /** Precision for this class */
  precision: number;

  /** Recall for this class */
  recall: number;

  /** F1 score for this class */
  f1Score: number;

  /** Support (number of samples) */
  support: number;
}

/**
 * Residual Statistics (for regression)
 */
export interface ResidualStatistics {
  /** Mean residual */
  meanResidual: number;

  /** Standard deviation of residuals */
  stdResidual: number;

  /** Minimum residual */
  minResidual: number;

  /** Maximum residual */
  maxResidual: number;

  /** Residual percentiles */
  percentiles: {
    p25: number;
    p50: number;
    p75: number;
    p95: number;
  };
}

/**
 * Cross-Validation Result
 * @description Result from k-fold cross-validation
 */
export interface CrossValidationResult {
  /** Number of folds */
  folds: number;

  /** Metrics per fold */
  foldMetrics: ModelMetrics[];

  /** Mean metrics across folds */
  meanMetrics: ModelMetrics;

  /** Standard deviation of metrics */
  stdMetrics: Partial<ModelMetrics>;

  /** 95% confidence interval */
  confidenceInterval: {
    accuracy?: [number, number];
    precision?: [number, number];
    recall?: [number, number];
    f1Score?: [number, number];
    rmse?: [number, number];
    mae?: [number, number];
  };

  /** Whether any fold showed overfitting */
  overfittingDetected: boolean;

  /** Overfitting severity (0-1) */
  overfittingSeverity?: number;

  /** Duration in milliseconds */
  durationMs: number;
}

/**
 * Model Comparison Result
 * @description Result from comparing multiple models
 */
export interface ModelComparisonResult {
  /** Models compared */
  models: string[];

  /** Results per model */
  results: Record<string, EvaluationResult>;

  /** Ranking by primary metric */
  ranking: Array<{
    modelId: string;
    rank: number;
    primaryMetricValue: number;
  }>;

  /** Primary metric used for ranking */
  primaryMetric: string;

  /** Statistical significance of differences */
  significanceTests?: Array<{
    modelA: string;
    modelB: string;
    pValue: number;
    significant: boolean;
  }>;

  /** Best model ID */
  bestModel: string;

  /** Comparison timestamp */
  comparedAt: Date;
}

/**
 * Hyperparameter Tuning Result
 */
export interface HyperparameterTuningResult {
  /** Best hyperparameters found */
  bestHyperparameters: Record<string, number | string | boolean>;

  /** Best metric value */
  bestMetricValue: number;

  /** Metric optimized */
  optimizedMetric: string;

  /** All tried combinations */
  triedCombinations: Array<{
    hyperparameters: Record<string, number | string | boolean>;
    metricValue: number;
  }>;

  /** Total combinations tried */
  totalCombinations: number;

  /** Duration in milliseconds */
  durationMs: number;

  /** Timestamp when completed */
  completedAt: Date;
}

/**
 * Model Version Info
 * @description Information about a model version
 */
export interface ModelVersionInfo {
  /** Model type */
  modelType: ModelType;

  /** Version string */
  version: string;

  /** When this version was created */
  createdAt: Date;

  /** Who/what created this version */
  createdBy: string;

  /** Training configuration used */
  trainingConfig: TrainingConfig;

  /** Metrics at training time */
  metrics: ModelMetrics;

  /** Whether this is the active version */
  isActive: boolean;

  /** Description/notes */
  description?: string;

  /** Parent version (if retrained) */
  parentVersion?: string;
}
