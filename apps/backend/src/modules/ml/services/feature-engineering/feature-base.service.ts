/**
 * Feature Base Service
 *
 * @description Abstract base class for feature extraction services.
 * Provides common utilities for normalization, imputation, and feature creation.
 *
 * @module ML
 * @sprint 3.1 - Feature Engineering for ML Predictions
 * @created 2026-02-03
 */

import { Logger } from '@nestjs/common';
import {
  Feature,
  FeatureType,
  FeatureCategory,
  NormalizationConfig,
  ImputationConfig,
} from '../../interfaces';

/**
 * Abstract base class for feature extraction
 */
export abstract class FeatureBaseService {
  protected readonly logger: Logger;

  /** Feature category this service handles */
  protected abstract readonly category: FeatureCategory;

  /** Feature version for tracking changes */
  protected readonly featureVersion = '1.0.0';

  /** Default imputation configuration */
  protected readonly defaultImputationConfig: ImputationConfig = {
    numericStrategy: 'zero',
    categoricalStrategy: 'unknown',
    booleanStrategy: 'false',
  };

  constructor(serviceName: string) {
    this.logger = new Logger(serviceName);
  }

  /**
   * Extract features for a student
   *
   * @param studentId - Student identifier (profiles.id)
   * @param lookbackDays - Number of days to look back
   * @param dateRange - Optional custom date range
   * @returns Array of extracted features
   */
  abstract extractFeatures(
    studentId: string,
    lookbackDays: number,
    dateRange?: { start: Date; end: Date },
  ): Promise<Feature[]>;

  /**
   * Create a numeric feature
   *
   * @param name - Feature name
   * @param value - Feature value
   * @param description - Human-readable description
   * @param unit - Unit of measurement
   * @param normalize - Whether to normalize the value
   * @param normConfig - Normalization configuration
   * @returns Feature object
   */
  protected createNumericFeature(
    name: string,
    value: number | null | undefined,
    description: string,
    unit?: string,
    normalize = false,
    normConfig?: NormalizationConfig,
  ): Feature {
    const imputedValue = this.imputeNumeric(value);

    const feature: Feature = {
      name,
      value: imputedValue,
      type: 'numeric',
      description,
      unit,
    };

    if (normalize && normConfig) {
      feature.normalized = this.normalizeValue(imputedValue, normConfig);
    }

    return feature;
  }

  /**
   * Create a categorical feature
   *
   * @param name - Feature name
   * @param value - Feature value
   * @param description - Human-readable description
   * @param possibleValues - Optional list of valid values
   * @returns Feature object
   */
  protected createCategoricalFeature(
    name: string,
    value: string | null | undefined,
    description: string,
    possibleValues?: string[],
  ): Feature {
    const imputedValue = this.imputeCategorical(value);

    // Validate against possible values if provided
    if (possibleValues && !possibleValues.includes(imputedValue)) {
      this.logger.warn(
        `Feature ${name} has value "${imputedValue}" not in possible values. Defaulting to first value.`,
      );
    }

    return {
      name,
      value: imputedValue,
      type: 'categorical',
      description,
    };
  }

  /**
   * Create a boolean feature
   *
   * @param name - Feature name
   * @param value - Feature value
   * @param description - Human-readable description
   * @returns Feature object
   */
  protected createBooleanFeature(
    name: string,
    value: boolean | null | undefined,
    description: string,
  ): Feature {
    const imputedValue = this.imputeBoolean(value);

    return {
      name,
      value: imputedValue,
      type: 'boolean',
      description,
      // Boolean features can be represented as 0/1 for normalization
      normalized: imputedValue ? 1 : 0,
    };
  }

  /**
   * Normalize a numeric value using min-max scaling
   *
   * @param value - Value to normalize
   * @param config - Normalization configuration
   * @returns Normalized value between 0 and 1
   */
  protected normalizeValue(value: number, config: NormalizationConfig): number {
    const { method, stats, min = 0, max = 1 } = config;

    if (!stats) {
      this.logger.warn('Normalization stats not provided, returning raw value');
      return value;
    }

    let normalized: number;

    switch (method) {
      case 'min-max':
        // Min-max normalization: (x - min) / (max - min)
        if (stats.max === stats.min) {
          normalized = 0.5;
        } else {
          normalized = (value - stats.min) / (stats.max - stats.min);
        }
        break;

      case 'z-score':
        // Z-score normalization: (x - mean) / std
        if (stats.std === 0) {
          normalized = 0;
        } else {
          const zScore = (value - stats.mean) / stats.std;
          // Clip to reasonable range and scale to 0-1
          normalized = Math.max(-3, Math.min(3, zScore)) / 6 + 0.5;
        }
        break;

      case 'robust': {
        // Robust normalization using quartiles: (x - median) / IQR
        const iqr = stats.q3 - stats.q1;
        if (iqr === 0) {
          normalized = 0.5;
        } else {
          const median = (stats.q1 + stats.q3) / 2;
          const robustScore = (value - median) / iqr;
          // Clip and scale
          normalized = Math.max(-2, Math.min(2, robustScore)) / 4 + 0.5;
        }
        break;
      }

      default:
        normalized = value;
    }

    // Scale to configured range
    return min + normalized * (max - min);
  }

  /**
   * Impute missing numeric value
   *
   * @param value - Original value (possibly null/undefined)
   * @param config - Imputation configuration
   * @returns Imputed value
   */
  protected imputeNumeric(
    value: number | null | undefined,
    config: ImputationConfig = this.defaultImputationConfig,
  ): number {
    if (value !== null && value !== undefined && !isNaN(value)) {
      return value;
    }

    switch (config.numericStrategy) {
      case 'zero':
        return 0;
      case 'custom':
        return config.numericCustomValue ?? 0;
      case 'mean':
      case 'median':
      case 'mode':
        // These would require population statistics
        // For now, default to 0
        return 0;
      default:
        return 0;
    }
  }

  /**
   * Impute missing categorical value
   *
   * @param value - Original value (possibly null/undefined)
   * @param config - Imputation configuration
   * @returns Imputed value
   */
  protected imputeCategorical(
    value: string | null | undefined,
    config: ImputationConfig = this.defaultImputationConfig,
  ): string {
    if (value !== null && value !== undefined && value !== '') {
      return value;
    }

    switch (config.categoricalStrategy) {
      case 'unknown':
        return 'unknown';
      case 'custom':
        return config.categoricalCustomValue ?? 'unknown';
      case 'mode':
        return 'unknown';
      default:
        return 'unknown';
    }
  }

  /**
   * Impute missing boolean value
   *
   * @param value - Original value (possibly null/undefined)
   * @param config - Imputation configuration
   * @returns Imputed value
   */
  protected imputeBoolean(
    value: boolean | null | undefined,
    config: ImputationConfig = this.defaultImputationConfig,
  ): boolean {
    if (value !== null && value !== undefined) {
      return value;
    }

    switch (config.booleanStrategy) {
      case 'true':
        return true;
      case 'false':
        return false;
      case 'mode':
        return false;
      default:
        return false;
    }
  }

  /**
   * Calculate date range from lookback days
   *
   * @param lookbackDays - Number of days to look back
   * @param endDate - End date (defaults to now)
   * @returns Date range object
   */
  protected calculateDateRange(
    lookbackDays: number,
    endDate: Date = new Date(),
  ): { start: Date; end: Date } {
    const start = new Date(endDate);
    start.setDate(start.getDate() - lookbackDays);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }

  /**
   * Calculate percentage safely (handles division by zero)
   *
   * @param numerator - Top value
   * @param denominator - Bottom value
   * @param decimals - Number of decimal places
   * @returns Percentage value or 0 if denominator is 0
   */
  protected safePercentage(
    numerator: number,
    denominator: number,
    decimals = 2,
  ): number {
    if (denominator === 0) {
      return 0;
    }
    const percentage = (numerator / denominator) * 100;
    return Number(percentage.toFixed(decimals));
  }

  /**
   * Calculate ratio safely (handles division by zero)
   *
   * @param numerator - Top value
   * @param denominator - Bottom value
   * @param decimals - Number of decimal places
   * @returns Ratio value or 0 if denominator is 0
   */
  protected safeRatio(
    numerator: number,
    denominator: number,
    decimals = 2,
  ): number {
    if (denominator === 0) {
      return 0;
    }
    return Number((numerator / denominator).toFixed(decimals));
  }

  /**
   * Calculate standard deviation
   *
   * @param values - Array of numeric values
   * @returns Standard deviation
   */
  protected calculateStdDev(values: number[]): number {
    if (values.length === 0) return 0;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;

    return Math.sqrt(variance);
  }

  /**
   * Calculate linear regression slope (trend)
   *
   * @param values - Array of values in chronological order
   * @returns Slope coefficient (positive = improving, negative = declining)
   */
  protected calculateTrendSlope(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumX2 = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumX2 += i * i;
    }

    const denominator = n * sumX2 - sumX * sumX;
    if (denominator === 0) return 0;

    return (n * sumXY - sumX * sumY) / denominator;
  }

  /**
   * Get feature category for this service
   */
  getCategory(): FeatureCategory {
    return this.category;
  }
}
