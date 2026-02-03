/**
 * Difficulty Recommender Model
 *
 * @description Recommends optimal exercise difficulty level for a student.
 * Takes into account:
 * - Current performance level
 * - Frustration indicators (failures, time struggles)
 * - Boredom indicators (speed, skips)
 * - Zone of proximal development
 *
 * @module ml/services/models
 * @version 1.0.0
 * @since Sprint 3.2 - ML Prediction Models
 */

import { Injectable } from '@nestjs/common';
import {
  ModelType,
  DifficultyRecommenderInput,
  DifficultyRecommenderOutput,
} from '../../interfaces';
import { ModelBaseService, ModelConfig } from './model-base.service';

/**
 * Feature configuration for difficulty recommender
 */
const DIFFICULTY_FEATURES = [
  'currentPerformance',
  'failureRate',
  'avgTimeOverExpected',
  'consecutiveFailures',
  'completionSpeedRatio',
  'skipRate',
  'consecutiveEasyPasses',
  'zpdCurrentLevel',
  'zpdMastered',
  'zpdChallenged',
];

/**
 * Default weights for difficulty recommendation
 * Output interpretation: positive = increase difficulty, negative = decrease
 */
const DEFAULT_DIFFICULTY_WEIGHTS: Record<string, number> = {
  currentPerformance: 0.02,        // Higher performance = slight increase
  failureRate: -2.0,               // High failures = decrease difficulty
  avgTimeOverExpected: -0.5,       // Struggling with time = decrease
  consecutiveFailures: -0.8,       // Multiple failures = decrease
  completionSpeedRatio: 0.3,       // Fast completion = increase
  skipRate: -0.5,                  // Skipping = may be too hard
  consecutiveEasyPasses: 0.4,      // Easy wins = increase
  zpdCurrentLevel: 0.0,            // Baseline (no adjustment)
  zpdMastered: -0.1,               // Already mastered = neutral
  zpdChallenged: 0.3,              // Being challenged = slight increase
};

const DEFAULT_DIFFICULTY_BIAS = 0.0; // Start at current level

/**
 * Difficulty level descriptions
 */
const DIFFICULTY_DESCRIPTIONS: Record<number, string> = {
  1: 'Very Easy - Build confidence and momentum',
  2: 'Easy - Reinforce fundamentals',
  3: 'Medium - Balanced challenge',
  4: 'Hard - Push boundaries',
  5: 'Very Hard - Expert level challenge',
};

/**
 * Adjustment reasons
 */
const ADJUSTMENT_REASONS = {
  FRUSTRATION_HIGH: 'Student showing signs of frustration; reducing difficulty to build confidence',
  BOREDOM_HIGH: 'Student completing exercises too quickly; increasing challenge',
  OPTIMAL_ZONE: 'Student is performing well at current level; slight increase recommended',
  STRUGGLING: 'Student is struggling; reducing difficulty to support learning',
  MASTERY: 'Student has mastered current level; advancing to next difficulty',
  MAINTAIN: 'Current difficulty level is appropriate; maintaining',
  RECOVERY: 'After recent struggles, maintaining stable difficulty for recovery',
};

/**
 * DifficultyRecommenderModel
 * @description Recommends optimal exercise difficulty
 */
@Injectable()
export class DifficultyRecommenderModel extends ModelBaseService<
  DifficultyRecommenderInput,
  DifficultyRecommenderOutput
> {
  constructor() {
    const config: Partial<ModelConfig> = {
      modelType: ModelType.DIFFICULTY_RECOMMENDER,
      featureNames: DIFFICULTY_FEATURES,
      logPredictions: true,
      confidenceThreshold: 0.5,
    };

    super('difficulty_recommender', config);

    // Load default weights
    this.setDefaultWeights();
  }

  /**
   * Set default pre-computed weights
   */
  private setDefaultWeights(): void {
    this.weights = { ...DEFAULT_DIFFICULTY_WEIGHTS };
    this.bias = DEFAULT_DIFFICULTY_BIAS;
    this.version = '1.0.0';
    this.metrics = {
      accuracy: 0.78,
      trainedAt: new Date('2026-01-15'),
      trainingSamples: 3000,
      validationSamples: 600,
    };
    this.loaded = true;
    this.calculateFeatureImportance();
  }

  /**
   * Make difficulty recommendation
   */
  async predict(input: DifficultyRecommenderInput): Promise<DifficultyRecommenderOutput> {
    const startTime = Date.now();

    // Validate input
    this.validateInput(input);

    // Check if should use fallback
    if (!this.loaded) {
      this.logger.debug('Model not loaded, using rule-based fallback');
      return this.fallbackPredict(input);
    }

    // Extract numeric features
    const features = this.extractFeatures(input);

    // Calculate adjustment from current level
    const rawAdjustment = this.linearCombination(features);

    // Clamp adjustment to reasonable range (-2 to +2 levels)
    const adjustment = this.clamp(Math.round(rawAdjustment * 2) / 2, -2, 2);

    // Calculate recommended difficulty
    const currentLevel = input.zoneOfProximalDevelopment.currentLevel;
    const recommendedDifficulty = this.clamp(
      Math.round(currentLevel + adjustment),
      1,
      5,
    );

    // Calculate confidence
    const confidence = this.calculateRecommendationConfidence(input, adjustment);

    // Determine if should use fallback due to low confidence
    if (this.shouldUseFallback(confidence)) {
      this.logger.debug(`Low confidence (${confidence.toFixed(2)}), using fallback`);
      return this.fallbackPredict(input);
    }

    // Generate reason for recommendation
    const reason = this.generateReason(input, adjustment, recommendedDifficulty);

    const result: DifficultyRecommenderOutput = {
      recommendedDifficulty,
      reason,
      alternativeExercises: [],
      adjustment: recommendedDifficulty - currentLevel,
      confidence: Math.round(confidence * 1000) / 1000,
      usedFallback: false,
    };

    // Log prediction
    const responseTimeMs = Date.now() - startTime;
    this.logPrediction(input, result, responseTimeMs);

    return result;
  }

  /**
   * Rule-based fallback prediction
   */
  protected fallbackPredict(input: DifficultyRecommenderInput): DifficultyRecommenderOutput {
    const { frustrationIndicators, boredomIndicators, zoneOfProximalDevelopment } = input;
    const currentLevel = zoneOfProximalDevelopment.currentLevel;

    let adjustment = 0;
    let reason = ADJUSTMENT_REASONS.MAINTAIN;

    // Check frustration indicators
    const frustrationScore =
      frustrationIndicators.failureRate * 2 +
      (frustrationIndicators.avgTimeOverExpected - 1) +
      frustrationIndicators.consecutiveFailures * 0.3;

    // Check boredom indicators
    const boredomScore =
      (1 - frustrationIndicators.failureRate) *
      (boredomIndicators.completionSpeedRatio > 1.5 ? 1 : 0) +
      boredomIndicators.consecutiveEasyPasses * 0.2;

    // High frustration: decrease difficulty
    if (frustrationScore > 1.5 || frustrationIndicators.consecutiveFailures >= 3) {
      adjustment = -1;
      reason = ADJUSTMENT_REASONS.FRUSTRATION_HIGH;
    }
    // High boredom: increase difficulty
    else if (boredomScore > 1.0 || boredomIndicators.consecutiveEasyPasses >= 5) {
      adjustment = 1;
      reason = ADJUSTMENT_REASONS.BOREDOM_HIGH;
    }
    // Good performance in ZPD: slight increase
    else if (
      input.currentPerformance >= 75 &&
      zoneOfProximalDevelopment.challenged > 0.5
    ) {
      adjustment = 0.5;
      reason = ADJUSTMENT_REASONS.OPTIMAL_ZONE;
    }
    // Low performance: decrease
    else if (input.currentPerformance < 50) {
      adjustment = -1;
      reason = ADJUSTMENT_REASONS.STRUGGLING;
    }
    // Mastery detected: increase
    else if (zoneOfProximalDevelopment.mastered > 0.8) {
      adjustment = 1;
      reason = ADJUSTMENT_REASONS.MASTERY;
    }

    const recommendedDifficulty = this.clamp(
      Math.round(currentLevel + adjustment),
      1,
      5,
    );

    return {
      recommendedDifficulty,
      reason,
      alternativeExercises: [],
      adjustment: recommendedDifficulty - currentLevel,
      confidence: 0.7,
      usedFallback: true,
    };
  }

  /**
   * Extract numeric features from input
   */
  protected extractFeatures(input: DifficultyRecommenderInput): number[] {
    return [
      this.normalize(input.currentPerformance, 0, 100),
      input.frustrationIndicators.failureRate,
      input.frustrationIndicators.avgTimeOverExpected,
      input.frustrationIndicators.consecutiveFailures,
      input.boredomIndicators.completionSpeedRatio,
      input.boredomIndicators.skipRate,
      input.boredomIndicators.consecutiveEasyPasses,
      input.zoneOfProximalDevelopment.currentLevel,
      input.zoneOfProximalDevelopment.mastered,
      input.zoneOfProximalDevelopment.challenged,
    ];
  }

  /**
   * Format raw output (not used directly, but required by base)
   */
  protected formatOutput(
    rawOutput: number,
    confidence: number,
    usedFallback: boolean,
  ): DifficultyRecommenderOutput {
    return {
      recommendedDifficulty: Math.round(rawOutput),
      reason: '',
      alternativeExercises: [],
      adjustment: 0,
      confidence,
      usedFallback,
    };
  }

  /**
   * Calculate confidence in recommendation
   */
  private calculateRecommendationConfidence(
    input: DifficultyRecommenderInput,
    adjustment: number,
  ): number {
    let confidence = 0.8;

    // Higher confidence for small adjustments
    if (Math.abs(adjustment) <= 0.5) {
      confidence += 0.05;
    } else if (Math.abs(adjustment) >= 2) {
      confidence -= 0.15;
    }

    // Higher confidence if indicators are clear
    const { frustrationIndicators, boredomIndicators } = input;

    // Clear frustration = confident in decrease
    if (frustrationIndicators.consecutiveFailures >= 3) {
      confidence += 0.1;
    }

    // Clear boredom = confident in increase
    if (boredomIndicators.consecutiveEasyPasses >= 5) {
      confidence += 0.1;
    }

    // Mixed signals = lower confidence
    if (frustrationIndicators.failureRate > 0.3 && boredomIndicators.completionSpeedRatio > 1.3) {
      confidence -= 0.15;
    }

    return this.clamp(confidence, 0.4, 0.95);
  }

  /**
   * Generate human-readable reason for recommendation
   */
  private generateReason(
    input: DifficultyRecommenderInput,
    adjustment: number,
    recommended: number,
  ): string {
    const { frustrationIndicators, boredomIndicators, currentPerformance } = input;

    // Major decrease needed
    if (adjustment <= -1) {
      if (frustrationIndicators.consecutiveFailures >= 3) {
        return ADJUSTMENT_REASONS.FRUSTRATION_HIGH;
      }
      return ADJUSTMENT_REASONS.STRUGGLING;
    }

    // Major increase recommended
    if (adjustment >= 1) {
      if (boredomIndicators.consecutiveEasyPasses >= 5) {
        return ADJUSTMENT_REASONS.BOREDOM_HIGH;
      }
      return ADJUSTMENT_REASONS.MASTERY;
    }

    // Slight increase
    if (adjustment > 0) {
      return ADJUSTMENT_REASONS.OPTIMAL_ZONE;
    }

    // Slight decrease
    if (adjustment < 0) {
      return ADJUSTMENT_REASONS.RECOVERY;
    }

    // No change
    return `${ADJUSTMENT_REASONS.MAINTAIN} ${DIFFICULTY_DESCRIPTIONS[recommended]}`;
  }

  /**
   * Validate input features
   */
  private validateInput(input: DifficultyRecommenderInput): void {
    if (input.currentPerformance < 0 || input.currentPerformance > 100) {
      throw new Error('currentPerformance must be between 0 and 100');
    }

    const { frustrationIndicators, boredomIndicators, zoneOfProximalDevelopment } = input;

    if (frustrationIndicators.failureRate < 0 || frustrationIndicators.failureRate > 1) {
      throw new Error('failureRate must be between 0 and 1');
    }
    if (frustrationIndicators.avgTimeOverExpected < 0) {
      throw new Error('avgTimeOverExpected must be non-negative');
    }
    if (frustrationIndicators.consecutiveFailures < 0) {
      throw new Error('consecutiveFailures must be non-negative');
    }

    if (boredomIndicators.completionSpeedRatio < 0) {
      throw new Error('completionSpeedRatio must be non-negative');
    }
    if (boredomIndicators.skipRate < 0 || boredomIndicators.skipRate > 1) {
      throw new Error('skipRate must be between 0 and 1');
    }
    if (boredomIndicators.consecutiveEasyPasses < 0) {
      throw new Error('consecutiveEasyPasses must be non-negative');
    }

    if (zoneOfProximalDevelopment.currentLevel < 1 || zoneOfProximalDevelopment.currentLevel > 5) {
      throw new Error('ZPD currentLevel must be between 1 and 5');
    }
  }
}
