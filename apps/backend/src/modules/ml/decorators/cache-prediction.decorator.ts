/**
 * Cache Prediction Decorator
 *
 * @description Decorator for caching prediction results.
 * Can be applied to service methods to automatically cache and retrieve predictions.
 *
 * @usage
 * @CachePrediction({ ttl: 3600, keyPrefix: 'dropout' })
 * async predictDropoutRisk(studentId: string) { ... }
 *
 * @module ml/decorators
 * @sprint 3.3 - ML Prediction API
 * @created 2026-02-03
 */

import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key for cache prediction decorator
 */
export const CACHE_PREDICTION_KEY = 'cache_prediction';

/**
 * Cache prediction options
 */
export interface CachePredictionOptions {
  /**
   * Cache TTL in seconds
   * @default 3600 (1 hour)
   */
  ttl?: number;

  /**
   * Key prefix for cache entries
   * @example 'dropout', 'performance', 'difficulty', 'engagement'
   */
  keyPrefix: string;

  /**
   * Index of the studentId parameter in the method arguments
   * @default 0
   */
  studentIdIndex?: number;

  /**
   * Index of additional key parameter in method arguments (optional)
   * @default undefined
   */
  additionalKeyIndex?: number;

  /**
   * Whether to skip cache on certain conditions
   * @default false
   */
  skipOnError?: boolean;
}

/**
 * Decorator to mark a method for prediction caching
 *
 * @param options - Cache options
 * @returns Method decorator
 *
 * @example
 * // Basic usage - cache dropout predictions for 6 hours
 * @CachePrediction({ ttl: 21600, keyPrefix: 'dropout' })
 * async predictDropoutRisk(studentId: string): Promise<DropoutPrediction> {
 *   // This result will be cached
 * }
 *
 * @example
 * // With additional key - cache performance predictions with exerciseId
 * @CachePrediction({ ttl: 3600, keyPrefix: 'performance', additionalKeyIndex: 1 })
 * async predictPerformance(studentId: string, exerciseId: string): Promise<PerformancePrediction> {
 *   // Cached with key: ml:prediction:performance:{studentId}:{exerciseId}
 * }
 */
export const CachePrediction = (options: CachePredictionOptions) =>
  SetMetadata(CACHE_PREDICTION_KEY, {
    ttl: options.ttl || 3600,
    keyPrefix: options.keyPrefix,
    studentIdIndex: options.studentIdIndex ?? 0,
    additionalKeyIndex: options.additionalKeyIndex,
    skipOnError: options.skipOnError ?? false,
  });

/**
 * Helper to extract cache options from metadata
 */
export interface ResolvedCachePredictionOptions {
  ttl: number;
  keyPrefix: string;
  studentIdIndex: number;
  additionalKeyIndex?: number;
  skipOnError: boolean;
}

/**
 * Default TTL values by prediction type (in seconds)
 */
export const DEFAULT_PREDICTION_TTL: Record<string, number> = {
  dropout: 6 * 60 * 60, // 6 hours
  performance: 60 * 60, // 1 hour
  difficulty: 30 * 60, // 30 minutes
  engagement: 15 * 60, // 15 minutes
  insights: 30 * 60, // 30 minutes
};

/**
 * Get TTL for a prediction type
 *
 * @param predictionType - Type of prediction
 * @returns TTL in seconds
 */
export function getPredictionTtl(predictionType: string): number {
  return DEFAULT_PREDICTION_TTL[predictionType] || 3600;
}
