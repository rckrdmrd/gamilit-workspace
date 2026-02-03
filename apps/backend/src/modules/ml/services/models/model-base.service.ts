/**
 * Model Base Service
 *
 * @description Abstract base class for all ML prediction models.
 * Provides common functionality for:
 * - Model serialization/deserialization (JSON-based)
 * - Feature importance tracking
 * - Prediction logging
 * - Model versioning
 * - Fallback to rule-based predictions
 *
 * @module ml/services/models
 * @version 1.0.0
 * @since Sprint 3.2 - ML Prediction Models
 */

import { Logger } from '@nestjs/common';
import {
  IModel,
  ModelMetrics,
  ModelWeights,
  PredictionLog,
  ModelType,
} from '../../interfaces';

/**
 * Model Configuration
 * @description Configuration for model behavior
 */
export interface ModelConfig {
  /** Model type identifier */
  modelType: ModelType;

  /** Feature names used by this model */
  featureNames: string[];

  /** Whether to log all predictions */
  logPredictions: boolean;

  /** Confidence threshold for using model (below this, use fallback) */
  confidenceThreshold: number;

  /** Cache TTL for loaded weights in seconds */
  cacheTtlSeconds: number;
}

/**
 * Default Model Configuration
 */
export const DEFAULT_MODEL_CONFIG: ModelConfig = {
  modelType: ModelType.DROPOUT_RISK,
  featureNames: [],
  logPredictions: true,
  confidenceThreshold: 0.5,
  cacheTtlSeconds: 3600,
};

/**
 * ModelBaseService
 * @description Abstract base class for ML models
 * @template TInput - Input feature type
 * @template TOutput - Output prediction type
 */
export abstract class ModelBaseService<TInput, TOutput>
  implements IModel<TInput, TOutput>
{
  protected readonly logger: Logger;
  protected readonly config: ModelConfig;

  /** Current model identifier */
  public readonly modelId: string;

  /** Current model version */
  public version: string = '1.0.0';

  /** Loaded model weights */
  protected weights: Record<string, number> = {};

  /** Model bias term */
  protected bias: number = 0;

  /** Current model metrics */
  protected metrics: ModelMetrics;

  /** Whether model is loaded */
  protected loaded: boolean = false;

  /** Feature importance scores */
  protected featureImportance: Record<string, number> = {};

  /** Prediction log buffer */
  protected predictionLogs: PredictionLog[] = [];

  /** Maximum prediction logs to buffer before flush */
  protected readonly maxLogBuffer: number = 100;

  constructor(
    modelId: string,
    config?: Partial<ModelConfig>,
  ) {
    this.modelId = modelId;
    this.config = { ...DEFAULT_MODEL_CONFIG, ...config };
    this.logger = new Logger(`Model:${modelId}`);

    // Initialize with empty metrics
    this.metrics = {
      trainedAt: new Date(0),
      trainingSamples: 0,
      validationSamples: 0,
    };
  }

  // ============================================
  // ABSTRACT METHODS (Must be implemented)
  // ============================================

  /**
   * Make a prediction using the trained model
   * @param input - Feature input
   * @returns Promise with prediction output
   */
  abstract predict(input: TInput): Promise<TOutput>;

  /**
   * Rule-based fallback when model is unavailable or low confidence
   * @param input - Feature input
   * @returns Fallback prediction output
   */
  protected abstract fallbackPredict(input: TInput): TOutput;

  /**
   * Convert input features to numeric array for model computation
   * @param input - Feature input
   * @returns Array of numeric feature values
   */
  protected abstract extractFeatures(input: TInput): number[];

  /**
   * Convert raw model output to typed prediction
   * @param rawOutput - Raw prediction value(s)
   * @param confidence - Prediction confidence
   * @param usedFallback - Whether fallback was used
   * @returns Typed prediction output
   */
  protected abstract formatOutput(
    rawOutput: number | number[],
    confidence: number,
    usedFallback: boolean,
  ): TOutput;

  // ============================================
  // PUBLIC METHODS
  // ============================================

  /**
   * Get current model performance metrics
   */
  getMetrics(): ModelMetrics {
    return { ...this.metrics, featureImportance: this.featureImportance };
  }

  /**
   * Check if model is loaded and ready
   */
  isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * Get feature importance scores
   */
  getFeatureImportance(): Record<string, number> {
    return { ...this.featureImportance };
  }

  /**
   * Get model configuration
   */
  getConfig(): ModelConfig {
    return { ...this.config };
  }

  // ============================================
  // MODEL WEIGHT MANAGEMENT
  // ============================================

  /**
   * Load model weights from storage
   * @param modelWeights - Weights to load
   */
  loadWeights(modelWeights: ModelWeights): void {
    this.logger.log(`Loading weights for version ${modelWeights.version}`);

    this.weights = { ...modelWeights.weights };
    this.bias = modelWeights.bias;
    this.version = modelWeights.version;
    this.metrics = { ...modelWeights.metrics };
    this.loaded = true;

    // Calculate feature importance from weights
    this.calculateFeatureImportance();

    this.logger.log(
      `Model loaded: ${Object.keys(this.weights).length} features, bias=${this.bias.toFixed(4)}`,
    );
  }

  /**
   * Serialize model to JSON
   */
  serialize(): string {
    const data: ModelWeights = {
      modelId: this.modelId,
      version: this.version,
      weights: this.weights,
      bias: this.bias,
      trainedAt: this.metrics.trainedAt,
      trainingSamples: this.metrics.trainingSamples,
      metrics: this.metrics,
    };
    return JSON.stringify(data, null, 2);
  }

  /**
   * Deserialize model from JSON
   * @param json - JSON string
   */
  deserialize(json: string): void {
    try {
      const data: ModelWeights = JSON.parse(json);
      this.loadWeights(data);
    } catch (error) {
      this.logger.error('Failed to deserialize model', error);
      throw new Error(`Model deserialization failed: ${error}`);
    }
  }

  /**
   * Set model weights directly (for training)
   * @param weights - Feature weights
   * @param bias - Bias term
   */
  setWeights(weights: Record<string, number>, bias: number): void {
    this.weights = { ...weights };
    this.bias = bias;
    this.calculateFeatureImportance();
    this.loaded = true;
  }

  /**
   * Clear loaded model
   */
  unload(): void {
    this.weights = {};
    this.bias = 0;
    this.featureImportance = {};
    this.loaded = false;
    this.logger.log('Model unloaded');
  }

  // ============================================
  // PREDICTION HELPERS
  // ============================================

  /**
   * Calculate weighted sum of features (linear combination)
   * @param features - Numeric feature values
   * @returns Weighted sum plus bias
   */
  protected linearCombination(features: number[]): number {
    const featureNames = this.config.featureNames;
    let sum = this.bias;

    for (let i = 0; i < features.length && i < featureNames.length; i++) {
      const featureName = featureNames[i];
      const weight = this.weights[featureName] ?? 0;
      sum += features[i] * weight;
    }

    return sum;
  }

  /**
   * Sigmoid function for probability output
   * @param x - Input value
   * @returns Probability (0-1)
   */
  protected sigmoid(x: number): number {
    // Clamp to prevent overflow
    const clampedX = Math.max(-500, Math.min(500, x));
    return 1 / (1 + Math.exp(-clampedX));
  }

  /**
   * Softmax function for multi-class probabilities
   * @param values - Array of raw scores
   * @returns Array of probabilities summing to 1
   */
  protected softmax(values: number[]): number[] {
    const maxVal = Math.max(...values);
    const expValues = values.map((v) => Math.exp(v - maxVal));
    const sumExp = expValues.reduce((a, b) => a + b, 0);
    return expValues.map((v) => v / sumExp);
  }

  /**
   * Calculate confidence based on prediction strength
   * @param probability - Prediction probability
   * @returns Confidence score (0-1)
   */
  protected calculateConfidence(probability: number): number {
    // Confidence is higher when probability is far from 0.5
    const distanceFrom05 = Math.abs(probability - 0.5);
    return 0.5 + distanceFrom05;
  }

  /**
   * Clamp value to range
   * @param value - Value to clamp
   * @param min - Minimum
   * @param max - Maximum
   */
  protected clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  // ============================================
  // PREDICTION LOGGING
  // ============================================

  /**
   * Log a prediction for later analysis
   * @param input - Input features used
   * @param output - Prediction output
   * @param responseTimeMs - Prediction time
   * @param studentId - Optional student ID
   */
  protected logPrediction(
    input: TInput,
    output: TOutput,
    responseTimeMs: number,
    studentId?: string,
  ): void {
    if (!this.config.logPredictions) return;

    const log: PredictionLog = {
      predictionId: this.generatePredictionId(),
      modelId: this.modelId,
      version: this.version,
      studentId,
      input: input as unknown as Record<string, unknown>,
      output: output as unknown as Record<string, unknown>,
      predictedAt: new Date(),
      responseTimeMs,
    };

    this.predictionLogs.push(log);

    // Flush if buffer is full
    if (this.predictionLogs.length >= this.maxLogBuffer) {
      this.flushPredictionLogs();
    }
  }

  /**
   * Flush prediction logs (implement in subclass for persistence)
   */
  protected flushPredictionLogs(): void {
    // Subclasses can override to persist logs
    this.logger.debug(`Flushing ${this.predictionLogs.length} prediction logs`);
    this.predictionLogs = [];
  }

  /**
   * Get buffered prediction logs
   */
  getPredictionLogs(): PredictionLog[] {
    return [...this.predictionLogs];
  }

  // ============================================
  // FEATURE IMPORTANCE
  // ============================================

  /**
   * Calculate feature importance from weights
   */
  protected calculateFeatureImportance(): void {
    const weights = Object.entries(this.weights);
    if (weights.length === 0) return;

    // Calculate absolute values
    const absWeights = weights.map(([name, weight]) => ({
      name,
      absWeight: Math.abs(weight),
    }));

    // Normalize to sum to 1
    const totalAbsWeight = absWeights.reduce((sum, w) => sum + w.absWeight, 0);

    this.featureImportance = {};
    for (const { name, absWeight } of absWeights) {
      this.featureImportance[name] =
        totalAbsWeight > 0 ? absWeight / totalAbsWeight : 0;
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Generate unique prediction ID
   */
  protected generatePredictionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${this.modelId}-${timestamp}-${random}`;
  }

  /**
   * Check if model should use fallback
   * @param confidence - Prediction confidence
   */
  protected shouldUseFallback(confidence: number): boolean {
    return !this.loaded || confidence < this.config.confidenceThreshold;
  }

  /**
   * Normalize a numeric value to 0-1 range
   * @param value - Value to normalize
   * @param min - Minimum expected value
   * @param max - Maximum expected value
   */
  protected normalize(value: number, min: number, max: number): number {
    if (max === min) return 0.5;
    return this.clamp((value - min) / (max - min), 0, 1);
  }

  /**
   * Denormalize a 0-1 value to original range
   * @param normalizedValue - Normalized value
   * @param min - Minimum value
   * @param max - Maximum value
   */
  protected denormalize(normalizedValue: number, min: number, max: number): number {
    return normalizedValue * (max - min) + min;
  }

  /**
   * Get feature value with default
   * @param input - Input object
   * @param featureName - Feature name
   * @param defaultValue - Default if missing
   */
  protected getFeatureValue(
    input: Record<string, unknown>,
    featureName: string,
    defaultValue: number = 0,
  ): number {
    const value = input[featureName];
    if (value === undefined || value === null) return defaultValue;
    if (typeof value === 'number') return value;
    if (typeof value === 'boolean') return value ? 1 : 0;
    const parsed = parseFloat(String(value));
    return isNaN(parsed) ? defaultValue : parsed;
  }
}
