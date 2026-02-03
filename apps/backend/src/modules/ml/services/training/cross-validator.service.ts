/**
 * Cross Validator Service
 *
 * @description K-fold cross-validation service for model evaluation.
 * Provides:
 * - K-fold splitting with stratification
 * - Confidence interval calculation
 * - Overfitting detection
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
  TrainingDataPoint,
  CrossValidationResult,
  ModelMetrics,
} from '../../interfaces';
import { TrainerService } from './trainer.service';

/**
 * CrossValidatorService
 * @description Performs k-fold cross-validation for ML models
 */
@Injectable()
export class CrossValidatorService {
  private readonly logger = new Logger(CrossValidatorService.name);

  constructor(private readonly trainerService: TrainerService) {}

  /**
   * Perform k-fold cross-validation
   * @param modelType - Model type identifier
   * @param data - Complete dataset
   * @param config - Training configuration
   * @returns Cross-validation result with metrics per fold
   */
  async crossValidate(
    modelType: string,
    data: TrainingDataSet,
    config: Partial<TrainingConfig> = {},
  ): Promise<CrossValidationResult> {
    const startTime = Date.now();
    const fullConfig: TrainingConfig = { ...DEFAULT_TRAINING_CONFIG, ...config };
    const k = fullConfig.crossValidationFolds;

    this.logger.log(
      `Starting ${k}-fold cross-validation for ${modelType} with ${data.data.length} samples`,
    );

    // Create k folds
    const folds = fullConfig.modelType === 'classification'
      ? this.createStratifiedFolds(data.data, k, data.targetName)
      : this.createFolds(data.data, k);

    const foldMetrics: ModelMetrics[] = [];
    const trainMetrics: ModelMetrics[] = [];

    // Train and evaluate on each fold
    for (let i = 0; i < k; i++) {
      this.logger.debug(`Processing fold ${i + 1}/${k}`);

      // Create train and validation sets
      const validationSet = folds[i];
      const trainSet = folds
        .filter((_, idx) => idx !== i)
        .flat();

      // Create training dataset
      const trainData: TrainingDataSet = {
        ...data,
        data: trainSet,
        statistics: {
          ...data.statistics,
          totalSamples: trainSet.length,
        },
      };

      // Train model on this fold (with no test split since we're doing CV)
      const trainConfig = { ...fullConfig, testSplitRatio: 0.001 };
      const result = await this.trainerService.trainModel(modelType, trainData, trainConfig);

      if (!result.success) {
        this.logger.warn(`Training failed for fold ${i + 1}: ${result.error}`);
        continue;
      }

      // Store training metrics
      trainMetrics.push(result.metrics);

      // Evaluate on validation fold
      const validationData: TrainingDataSet = {
        ...data,
        data: validationSet,
        statistics: {
          ...data.statistics,
          totalSamples: validationSet.length,
        },
      };

      const evalResult = await this.trainerService.evaluateModel(
        modelType,
        result.weights,
        result.bias,
        validationData,
        fullConfig,
      );

      foldMetrics.push(evalResult.metrics);
    }

    // Calculate mean and std metrics
    const meanMetrics = this.calculateMeanMetrics(foldMetrics);
    const stdMetrics = this.calculateStdMetrics(foldMetrics, meanMetrics);

    // Calculate confidence intervals
    const confidenceInterval = this.calculateConfidenceIntervals(foldMetrics, k);

    // Detect overfitting
    const { overfittingDetected, overfittingSeverity } = this.detectOverfitting(
      trainMetrics,
      foldMetrics,
      fullConfig.modelType,
    );

    const durationMs = Date.now() - startTime;

    this.logger.log(
      `Cross-validation complete: meanAccuracy=${meanMetrics.accuracy?.toFixed(3) ?? 'N/A'}, ` +
        `overfitting=${overfittingDetected ? 'YES' : 'no'}, duration=${durationMs}ms`,
    );

    return {
      folds: k,
      foldMetrics,
      meanMetrics,
      stdMetrics,
      confidenceInterval,
      overfittingDetected,
      overfittingSeverity,
      durationMs,
    };
  }

  /**
   * Create k random folds
   */
  private createFolds(data: TrainingDataPoint[], k: number): TrainingDataPoint[][] {
    // Shuffle data
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    const foldSize = Math.floor(data.length / k);
    const folds: TrainingDataPoint[][] = [];

    for (let i = 0; i < k; i++) {
      const start = i * foldSize;
      const end = i === k - 1 ? data.length : start + foldSize;
      folds.push(shuffled.slice(start, end));
    }

    return folds;
  }

  /**
   * Create k stratified folds (maintains class distribution)
   */
  private createStratifiedFolds(
    data: TrainingDataPoint[],
    k: number,
    targetName: string,
  ): TrainingDataPoint[][] {
    // Group by class
    const classBuckets = new Map<string | number, TrainingDataPoint[]>();

    for (const point of data) {
      const label = point.label;
      if (!classBuckets.has(label)) {
        classBuckets.set(label, []);
      }
      classBuckets.get(label)!.push(point);
    }

    // Shuffle each class bucket
    for (const bucket of classBuckets.values()) {
      bucket.sort(() => Math.random() - 0.5);
    }

    // Distribute samples to folds
    const folds: TrainingDataPoint[][] = Array.from({ length: k }, () => []);

    for (const [, bucket] of classBuckets) {
      const samplesPerFold = Math.floor(bucket.length / k);
      let extra = bucket.length % k;

      let bucketIndex = 0;
      for (let foldIndex = 0; foldIndex < k; foldIndex++) {
        const count = samplesPerFold + (extra > 0 ? 1 : 0);
        if (extra > 0) extra--;

        for (let i = 0; i < count && bucketIndex < bucket.length; i++, bucketIndex++) {
          folds[foldIndex].push(bucket[bucketIndex]);
        }
      }
    }

    // Shuffle each fold
    for (const fold of folds) {
      fold.sort(() => Math.random() - 0.5);
    }

    return folds;
  }

  /**
   * Calculate mean metrics across folds
   */
  private calculateMeanMetrics(foldMetrics: ModelMetrics[]): ModelMetrics {
    if (foldMetrics.length === 0) {
      return {
        trainedAt: new Date(),
        trainingSamples: 0,
        validationSamples: 0,
      };
    }

    const sumMetrics: Partial<ModelMetrics> = {};
    const metricKeys: (keyof ModelMetrics)[] = [
      'accuracy',
      'precision',
      'recall',
      'f1Score',
      'rmse',
      'mae',
      'auc',
    ];

    for (const key of metricKeys) {
      const values = foldMetrics
        .map((m) => m[key])
        .filter((v): v is number => v !== undefined);

      if (values.length > 0) {
        (sumMetrics as Record<string, number>)[key] = values.reduce((a, b) => a + b, 0) / values.length;
      }
    }

    return {
      ...sumMetrics,
      trainedAt: new Date(),
      trainingSamples: foldMetrics.reduce((sum, m) => sum + m.trainingSamples, 0),
      validationSamples: foldMetrics.reduce((sum, m) => sum + m.validationSamples, 0),
    };
  }

  /**
   * Calculate standard deviation of metrics
   */
  private calculateStdMetrics(
    foldMetrics: ModelMetrics[],
    meanMetrics: ModelMetrics,
  ): Partial<ModelMetrics> {
    if (foldMetrics.length < 2) {
      return {};
    }

    const stdMetrics: Partial<ModelMetrics> = {};
    const metricKeys: (keyof ModelMetrics)[] = [
      'accuracy',
      'precision',
      'recall',
      'f1Score',
      'rmse',
      'mae',
      'auc',
    ];

    for (const key of metricKeys) {
      const values = foldMetrics
        .map((m) => m[key])
        .filter((v): v is number => v !== undefined);

      if (values.length > 1) {
        const mean = (meanMetrics as unknown as Record<string, number | undefined>)[key] ?? 0;
        const squaredDiffs = values.map((v) => (v - mean) ** 2);
        const variance = squaredDiffs.reduce((a, b) => a + b, 0) / (values.length - 1);
        (stdMetrics as Record<string, number>)[key] = Math.sqrt(variance);
      }
    }

    return stdMetrics;
  }

  /**
   * Calculate 95% confidence intervals
   */
  private calculateConfidenceIntervals(
    foldMetrics: ModelMetrics[],
    k: number,
  ): CrossValidationResult['confidenceInterval'] {
    const intervals: CrossValidationResult['confidenceInterval'] = {};
    const metricKeys: (keyof ModelMetrics)[] = [
      'accuracy',
      'precision',
      'recall',
      'f1Score',
      'rmse',
      'mae',
    ];

    // t-value for 95% CI with k-1 degrees of freedom
    const tValues: Record<number, number> = {
      2: 12.706,
      3: 4.303,
      4: 3.182,
      5: 2.776,
      6: 2.571,
      7: 2.447,
      8: 2.365,
      9: 2.306,
      10: 2.262,
    };
    const tValue = tValues[k] ?? 1.96;

    for (const key of metricKeys) {
      const values = foldMetrics
        .map((m) => m[key])
        .filter((v): v is number => v !== undefined);

      if (values.length >= 2) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squaredDiffs = values.map((v) => (v - mean) ** 2);
        const variance = squaredDiffs.reduce((a, b) => a + b, 0) / (values.length - 1);
        const std = Math.sqrt(variance);
        const se = std / Math.sqrt(values.length);
        const margin = tValue * se;

        (intervals as Record<string, [number, number]>)[key] = [
          mean - margin,
          mean + margin,
        ];
      }
    }

    return intervals;
  }

  /**
   * Detect overfitting by comparing train and validation performance
   */
  private detectOverfitting(
    trainMetrics: ModelMetrics[],
    valMetrics: ModelMetrics[],
    modelType: 'classification' | 'regression',
  ): { overfittingDetected: boolean; overfittingSeverity?: number } {
    if (trainMetrics.length === 0 || valMetrics.length === 0) {
      return { overfittingDetected: false };
    }

    // Calculate average train and validation metrics
    const metricKey = modelType === 'classification' ? 'accuracy' : 'rmse';

    const trainValues = trainMetrics
      .map((m) => (m as unknown as Record<string, number | undefined>)[metricKey])
      .filter((v): v is number => v !== undefined);

    const valValues = valMetrics
      .map((m) => (m as unknown as Record<string, number | undefined>)[metricKey])
      .filter((v): v is number => v !== undefined);

    if (trainValues.length === 0 || valValues.length === 0) {
      return { overfittingDetected: false };
    }

    const avgTrain = trainValues.reduce((a, b) => a + b, 0) / trainValues.length;
    const avgVal = valValues.reduce((a, b) => a + b, 0) / valValues.length;

    // For classification: overfitting if train accuracy >> val accuracy
    // For regression: overfitting if train RMSE << val RMSE
    let gap: number;
    if (modelType === 'classification') {
      gap = avgTrain - avgVal;
    } else {
      gap = avgVal - avgTrain; // Higher val RMSE = worse
    }

    // Threshold: 10% gap is significant
    const threshold = 0.1;
    const overfittingDetected = gap > threshold;
    const overfittingSeverity = Math.min(gap / threshold, 1);

    if (overfittingDetected) {
      this.logger.warn(
        `Overfitting detected: train=${avgTrain.toFixed(3)}, val=${avgVal.toFixed(3)}, gap=${gap.toFixed(3)}`,
      );
    }

    return {
      overfittingDetected,
      overfittingSeverity: overfittingDetected ? overfittingSeverity : undefined,
    };
  }
}
