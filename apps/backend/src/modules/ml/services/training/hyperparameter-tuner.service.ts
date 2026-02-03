/**
 * Hyperparameter Tuner Service
 *
 * @description Service for hyperparameter optimization.
 * Supports:
 * - Grid search
 * - Random search
 * - Early stopping of unpromising combinations
 *
 * @module ml/services/training
 * @version 1.0.0
 * @since Sprint 3.2 - ML Prediction Models
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  TrainingConfig,
  DEFAULT_TRAINING_CONFIG,
  TrainingDataSet,
  HyperparameterTuningResult,
} from '../../interfaces';
import { TrainerService } from './trainer.service';
import { CrossValidatorService } from './cross-validator.service';

/**
 * Hyperparameter search space
 */
interface HyperparameterSpace {
  learningRate?: number[];
  regularizationStrength?: number[];
  maxIterations?: number[];
  crossValidationFolds?: number[];
}

/**
 * HyperparameterTunerService
 * @description Tunes hyperparameters for ML models
 */
@Injectable()
export class HyperparameterTunerService {
  private readonly logger = new Logger(HyperparameterTunerService.name);

  constructor(
    private readonly trainerService: TrainerService,
    private readonly crossValidatorService: CrossValidatorService,
  ) {}

  /**
   * Grid search over hyperparameter space
   * @param modelType - Model type identifier
   * @param data - Training dataset
   * @param parameterGrid - Grid of parameters to search
   * @param baseConfig - Base training configuration
   * @param optimizeMetric - Metric to optimize
   * @returns Best hyperparameters found
   */
  async gridSearch(
    modelType: string,
    data: TrainingDataSet,
    parameterGrid: HyperparameterSpace,
    baseConfig: Partial<TrainingConfig> = {},
    optimizeMetric: string = 'accuracy',
  ): Promise<HyperparameterTuningResult> {
    const startTime = Date.now();

    this.logger.log(`Starting grid search for ${modelType}`);

    // Generate all combinations
    const combinations = this.generateCombinations(parameterGrid);

    this.logger.log(`Testing ${combinations.length} hyperparameter combinations`);

    const results: Array<{
      hyperparameters: Record<string, number | string | boolean>;
      metricValue: number;
    }> = [];

    let bestMetricValue = baseConfig.modelType === 'classification' ? 0 : Infinity;
    let bestHyperparameters: Record<string, number | string | boolean> = {};

    // Test each combination
    for (let i = 0; i < combinations.length; i++) {
      const params = combinations[i];
      const config: Partial<TrainingConfig> = {
        ...baseConfig,
        ...params,
      };

      this.logger.debug(
        `Testing combination ${i + 1}/${combinations.length}: ${JSON.stringify(params)}`,
      );

      try {
        // Use cross-validation to evaluate
        const cvResult = await this.crossValidatorService.crossValidate(
          modelType,
          data,
          config,
        );

        // Get metric value
        const metricValue = this.getMetricValue(cvResult.meanMetrics as unknown as Record<string, unknown>, optimizeMetric);

        results.push({
          hyperparameters: params as Record<string, number | string | boolean>,
          metricValue,
        });

        // Check if best
        const isBetter = baseConfig.modelType === 'classification'
          ? metricValue > bestMetricValue
          : metricValue < bestMetricValue;

        if (isBetter) {
          bestMetricValue = metricValue;
          bestHyperparameters = params as Record<string, number | string | boolean>;
          this.logger.log(
            `New best: ${optimizeMetric}=${metricValue.toFixed(4)}, params=${JSON.stringify(params)}`,
          );
        }
      } catch (error) {
        this.logger.warn(`Combination ${i + 1} failed: ${error}`);
      }
    }

    const durationMs = Date.now() - startTime;

    this.logger.log(
      `Grid search complete: best ${optimizeMetric}=${bestMetricValue.toFixed(4)}, ` +
        `duration=${durationMs}ms`,
    );

    return {
      bestHyperparameters,
      bestMetricValue,
      optimizedMetric: optimizeMetric,
      triedCombinations: results,
      totalCombinations: combinations.length,
      durationMs,
      completedAt: new Date(),
    };
  }

  /**
   * Random search over hyperparameter space
   * @param modelType - Model type identifier
   * @param data - Training dataset
   * @param parameterGrid - Ranges of parameters to sample
   * @param baseConfig - Base training configuration
   * @param optimizeMetric - Metric to optimize
   * @param maxCombinations - Maximum combinations to try
   * @returns Best hyperparameters found
   */
  async randomSearch(
    modelType: string,
    data: TrainingDataSet,
    parameterGrid: HyperparameterSpace,
    baseConfig: Partial<TrainingConfig> = {},
    optimizeMetric: string = 'accuracy',
    maxCombinations: number = 20,
  ): Promise<HyperparameterTuningResult> {
    const startTime = Date.now();

    this.logger.log(`Starting random search for ${modelType} with max ${maxCombinations} trials`);

    const results: Array<{
      hyperparameters: Record<string, number | string | boolean>;
      metricValue: number;
    }> = [];

    let bestMetricValue = baseConfig.modelType === 'classification' ? 0 : Infinity;
    let bestHyperparameters: Record<string, number | string | boolean> = {};
    let noImprovementCount = 0;
    const earlyStopThreshold = Math.min(5, Math.floor(maxCombinations / 4));

    // Random sampling
    for (let i = 0; i < maxCombinations; i++) {
      const params = this.sampleRandomCombination(parameterGrid);
      const config: Partial<TrainingConfig> = {
        ...baseConfig,
        ...params,
      };

      this.logger.debug(
        `Trial ${i + 1}/${maxCombinations}: ${JSON.stringify(params)}`,
      );

      try {
        // Use cross-validation to evaluate
        const cvResult = await this.crossValidatorService.crossValidate(
          modelType,
          data,
          config,
        );

        // Get metric value
        const metricValue = this.getMetricValue(cvResult.meanMetrics as unknown as Record<string, unknown>, optimizeMetric);

        results.push({
          hyperparameters: params as Record<string, number | string | boolean>,
          metricValue,
        });

        // Check if best
        const isBetter = baseConfig.modelType === 'classification'
          ? metricValue > bestMetricValue
          : metricValue < bestMetricValue;

        if (isBetter) {
          bestMetricValue = metricValue;
          bestHyperparameters = params as Record<string, number | string | boolean>;
          noImprovementCount = 0;
          this.logger.log(
            `New best: ${optimizeMetric}=${metricValue.toFixed(4)}, params=${JSON.stringify(params)}`,
          );
        } else {
          noImprovementCount++;
        }

        // Early stopping if no improvement
        if (noImprovementCount >= earlyStopThreshold && i >= earlyStopThreshold * 2) {
          this.logger.log(
            `Early stopping at trial ${i + 1} - no improvement in ${noImprovementCount} trials`,
          );
          break;
        }
      } catch (error) {
        this.logger.warn(`Trial ${i + 1} failed: ${error}`);
      }
    }

    const durationMs = Date.now() - startTime;

    this.logger.log(
      `Random search complete: best ${optimizeMetric}=${bestMetricValue.toFixed(4)}, ` +
        `tried ${results.length} combinations, duration=${durationMs}ms`,
    );

    return {
      bestHyperparameters,
      bestMetricValue,
      optimizedMetric: optimizeMetric,
      triedCombinations: results,
      totalCombinations: results.length,
      durationMs,
      completedAt: new Date(),
    };
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  /**
   * Generate all combinations from parameter grid
   */
  private generateCombinations(
    grid: HyperparameterSpace,
  ): Array<Partial<TrainingConfig>> {
    const keys = Object.keys(grid) as Array<keyof HyperparameterSpace>;

    if (keys.length === 0) {
      return [{}];
    }

    const combinations: Array<Partial<TrainingConfig>> = [];

    const generate = (
      index: number,
      current: Partial<TrainingConfig>,
    ): void => {
      if (index === keys.length) {
        combinations.push({ ...current });
        return;
      }

      const key = keys[index];
      const values = grid[key] ?? [];

      for (const value of values) {
        (current as Record<string, number>)[key] = value;
        generate(index + 1, current);
      }
    };

    generate(0, {});
    return combinations;
  }

  /**
   * Sample a random combination from parameter grid
   */
  private sampleRandomCombination(
    grid: HyperparameterSpace,
  ): Partial<TrainingConfig> {
    const combination: Partial<TrainingConfig> = {};

    for (const key of Object.keys(grid) as Array<keyof HyperparameterSpace>) {
      const values = grid[key];
      if (values && values.length > 0) {
        const randomIndex = Math.floor(Math.random() * values.length);
        (combination as Record<string, number>)[key] = values[randomIndex];
      }
    }

    return combination;
  }

  /**
   * Get metric value from metrics object
   */
  private getMetricValue(
    metrics: Record<string, unknown>,
    metricName: string,
  ): number {
    const value = metrics[metricName];
    if (typeof value === 'number') {
      return value;
    }

    // Default fallback metrics
    if (metricName === 'accuracy' && typeof metrics.accuracy === 'number') {
      return metrics.accuracy;
    }
    if (metricName === 'f1Score' && typeof metrics.f1Score === 'number') {
      return metrics.f1Score;
    }
    if (metricName === 'rmse' && typeof metrics.rmse === 'number') {
      return metrics.rmse;
    }

    // Return 0 for classification or Infinity for regression
    return 0;
  }
}
