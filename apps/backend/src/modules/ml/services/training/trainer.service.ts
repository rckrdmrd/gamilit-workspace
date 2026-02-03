/**
 * Trainer Service
 *
 * @description Service for training ML models using simple algorithms.
 * Implements training logic for:
 * - Logistic Regression (classification)
 * - Linear Regression (regression)
 * - Gradient descent optimization
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
  TrainingResult,
  TrainingHistory,
  EvaluationResult,
  ModelMetrics,
  AlgorithmType,
  ConfusionMatrix,
} from '../../interfaces';

/**
 * TrainerService
 * @description Trains ML models using gradient descent optimization
 */
@Injectable()
export class TrainerService {
  private readonly logger = new Logger(TrainerService.name);

  /**
   * Train a model with the given data and configuration
   * @param modelType - Model type identifier
   * @param trainingData - Training dataset
   * @param config - Training configuration
   * @returns Training result with weights and metrics
   */
  async trainModel(
    modelType: string,
    trainingData: TrainingDataSet,
    config: Partial<TrainingConfig> = {},
  ): Promise<TrainingResult> {
    const startTime = Date.now();
    const fullConfig: TrainingConfig = { ...DEFAULT_TRAINING_CONFIG, ...config };

    this.logger.log(
      `Starting training for ${modelType} with ${trainingData.data.length} samples`,
    );

    try {
      // Split data into train and test sets
      const { trainSet, testSet } = this.splitData(trainingData.data, fullConfig.testSplitRatio);

      // Initialize weights
      const featureCount = trainingData.featureNames.length;
      let weights = this.initializeWeights(featureCount);
      let bias = 0;

      // Training history
      const history: TrainingHistory = {
        loss: [],
        valLoss: [],
        accuracy: [],
        valAccuracy: [],
        iterations: 0,
        earlyStopped: false,
      };

      // Normalize features if configured
      const normStats = fullConfig.normalizeFeatures
        ? this.computeNormalizationStats(trainSet, trainingData.featureNames)
        : null;

      // Training loop
      let bestLoss = Infinity;
      let patienceCounter = 0;
      const patience = fullConfig.earlyStoppingPatience ?? 10;
      const maxIterations = fullConfig.maxIterations ?? 1000;
      const learningRate = fullConfig.learningRate ?? 0.01;

      for (let iteration = 0; iteration < maxIterations; iteration++) {
        // Forward pass and compute gradients
        const { gradients, biasGradient, loss, accuracy } = this.computeGradients(
          trainSet,
          weights,
          bias,
          trainingData.featureNames,
          fullConfig,
          normStats,
        );

        // Update weights using gradient descent
        for (let i = 0; i < weights.length; i++) {
          weights[i] -= learningRate * gradients[i];
          // Apply L2 regularization
          const reg = fullConfig.regularizationStrength ?? 0;
          weights[i] -= learningRate * reg * weights[i];
        }
        bias -= learningRate * biasGradient;

        // Record training loss and accuracy
        history.loss.push(loss);
        if (accuracy !== undefined) {
          history.accuracy!.push(accuracy);
        }

        // Compute validation metrics
        const valMetrics = this.computeValidationMetrics(
          testSet,
          weights,
          bias,
          trainingData.featureNames,
          fullConfig,
          normStats,
        );
        history.valLoss!.push(valMetrics.loss);
        if (valMetrics.accuracy !== undefined) {
          history.valAccuracy!.push(valMetrics.accuracy);
        }

        // Early stopping check
        if (valMetrics.loss < bestLoss) {
          bestLoss = valMetrics.loss;
          patienceCounter = 0;
          history.bestIteration = iteration;
        } else {
          patienceCounter++;
        }

        if (patienceCounter >= patience) {
          this.logger.log(`Early stopping at iteration ${iteration}`);
          history.earlyStopped = true;
          break;
        }

        history.iterations = iteration + 1;

        // Log progress every 100 iterations
        if ((iteration + 1) % 100 === 0) {
          this.logger.debug(
            `Iteration ${iteration + 1}: loss=${loss.toFixed(4)}, valLoss=${valMetrics.loss.toFixed(4)}`,
          );
        }
      }

      // Convert weights array to feature-named map
      const weightMap: Record<string, number> = {};
      for (let i = 0; i < trainingData.featureNames.length; i++) {
        weightMap[trainingData.featureNames[i]] = weights[i];
      }

      // Compute final metrics
      const metrics = this.computeFinalMetrics(
        testSet,
        weights,
        bias,
        trainingData.featureNames,
        fullConfig,
        normStats,
        trainSet.length,
        testSet.length,
      );

      const trainingDurationMs = Date.now() - startTime;
      const version = this.generateVersion();

      this.logger.log(
        `Training complete: ${history.iterations} iterations, ` +
          `duration=${trainingDurationMs}ms, accuracy=${metrics.accuracy?.toFixed(3) ?? 'N/A'}`,
      );

      return {
        success: true,
        modelId: modelType,
        version,
        weights: weightMap,
        bias,
        metrics,
        history,
        config: fullConfig,
        trainingDurationMs,
        completedAt: new Date(),
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Training failed: ${errorMessage}`);

      return {
        success: false,
        modelId: modelType,
        version: '0.0.0',
        weights: {},
        bias: 0,
        metrics: {
          trainedAt: new Date(),
          trainingSamples: 0,
          validationSamples: 0,
        },
        history: {
          loss: [],
          iterations: 0,
          earlyStopped: false,
        },
        config: fullConfig,
        trainingDurationMs: Date.now() - startTime,
        completedAt: new Date(),
        error: errorMessage,
      };
    }
  }

  /**
   * Evaluate a model on test data
   */
  async evaluateModel(
    modelId: string,
    weights: Record<string, number>,
    bias: number,
    testData: TrainingDataSet,
    config: Partial<TrainingConfig> = {},
  ): Promise<EvaluationResult> {
    const startTime = Date.now();
    const fullConfig: TrainingConfig = { ...DEFAULT_TRAINING_CONFIG, ...config };

    this.logger.log(`Evaluating model ${modelId} on ${testData.data.length} samples`);

    // Convert weights to array
    const weightArray = testData.featureNames.map((name) => weights[name] ?? 0);

    // Compute metrics
    const metrics = this.computeFinalMetrics(
      testData.data,
      weightArray,
      bias,
      testData.featureNames,
      fullConfig,
      null,
      0,
      testData.data.length,
    );

    // Compute confusion matrix for classification
    let confusionMatrix = undefined;
    if (fullConfig.modelType === 'classification' && testData.classLabels) {
      confusionMatrix = this.computeConfusionMatrix(
        testData.data,
        weightArray,
        bias,
        testData.featureNames,
        testData.classLabels,
      );
    }

    return {
      modelId,
      version: '1.0.0',
      metrics,
      confusionMatrix,
      testSamples: testData.data.length,
      evaluationDurationMs: Date.now() - startTime,
      completedAt: new Date(),
    };
  }

  /**
   * Compare multiple models on the same test data
   */
  async compareModels(
    models: Array<{
      modelId: string;
      weights: Record<string, number>;
      bias: number;
    }>,
    testData: TrainingDataSet,
    config: Partial<TrainingConfig> = {},
  ): Promise<{
    results: Record<string, EvaluationResult>;
    ranking: Array<{ modelId: string; rank: number; primaryMetricValue: number }>;
    bestModel: string;
  }> {
    const results: Record<string, EvaluationResult> = {};

    // Evaluate each model
    for (const model of models) {
      results[model.modelId] = await this.evaluateModel(
        model.modelId,
        model.weights,
        model.bias,
        testData,
        config,
      );
    }

    // Rank by accuracy (or RMSE for regression)
    const isClassification = config.modelType === 'classification';
    const ranking = models
      .map((model) => ({
        modelId: model.modelId,
        primaryMetricValue: isClassification
          ? results[model.modelId].metrics.accuracy ?? 0
          : -(results[model.modelId].metrics.rmse ?? Infinity),
      }))
      .sort((a, b) => b.primaryMetricValue - a.primaryMetricValue)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
        primaryMetricValue: isClassification
          ? item.primaryMetricValue
          : -item.primaryMetricValue,
      }));

    return {
      results,
      ranking,
      bestModel: ranking[0]?.modelId ?? '',
    };
  }

  // ============================================
  // PRIVATE HELPER METHODS
  // ============================================

  /**
   * Split data into train and test sets
   */
  private splitData(
    data: TrainingDataPoint[],
    testRatio: number,
  ): { trainSet: TrainingDataPoint[]; testSet: TrainingDataPoint[] } {
    // Shuffle data
    const shuffled = [...data].sort(() => Math.random() - 0.5);
    const splitIndex = Math.floor(data.length * (1 - testRatio));

    return {
      trainSet: shuffled.slice(0, splitIndex),
      testSet: shuffled.slice(splitIndex),
    };
  }

  /**
   * Initialize weights with small random values
   */
  private initializeWeights(featureCount: number): number[] {
    return Array.from({ length: featureCount }, () => (Math.random() - 0.5) * 0.1);
  }

  /**
   * Compute normalization statistics
   */
  private computeNormalizationStats(
    data: TrainingDataPoint[],
    featureNames: string[],
  ): Record<string, { mean: number; std: number }> {
    const stats: Record<string, { mean: number; std: number }> = {};

    for (const name of featureNames) {
      const values = data.map((d) => d.features[name] ?? 0);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
      const std = Math.sqrt(variance) || 1;

      stats[name] = { mean, std };
    }

    return stats;
  }

  /**
   * Compute gradients using batch gradient descent
   */
  private computeGradients(
    data: TrainingDataPoint[],
    weights: number[],
    bias: number,
    featureNames: string[],
    config: TrainingConfig,
    normStats: Record<string, { mean: number; std: number }> | null,
  ): { gradients: number[]; biasGradient: number; loss: number; accuracy?: number } {
    const n = data.length;
    const gradients = new Array(weights.length).fill(0);
    let biasGradient = 0;
    let totalLoss = 0;
    let correctPredictions = 0;

    for (const point of data) {
      // Extract and normalize features
      const features = featureNames.map((name, i) => {
        let value = point.features[name] ?? 0;
        if (normStats) {
          value = (value - normStats[name].mean) / normStats[name].std;
        }
        return value;
      });

      // Compute prediction
      let z = bias;
      for (let i = 0; i < features.length; i++) {
        z += features[i] * weights[i];
      }

      // Get label
      const label = typeof point.label === 'number' ? point.label : point.label === 'true' ? 1 : 0;

      // Classification: logistic loss
      if (config.modelType === 'classification') {
        const prediction = this.sigmoid(z);
        const error = prediction - label;

        // Gradients
        for (let i = 0; i < features.length; i++) {
          gradients[i] += error * features[i] / n;
        }
        biasGradient += error / n;

        // Binary cross-entropy loss
        const clampedPred = Math.max(1e-7, Math.min(1 - 1e-7, prediction));
        totalLoss += -(label * Math.log(clampedPred) + (1 - label) * Math.log(1 - clampedPred));

        // Accuracy
        const predictedClass = prediction >= 0.5 ? 1 : 0;
        if (predictedClass === label) {
          correctPredictions++;
        }
      }
      // Regression: MSE loss
      else {
        const prediction = z;
        const error = prediction - label;

        // Gradients
        for (let i = 0; i < features.length; i++) {
          gradients[i] += (2 * error * features[i]) / n;
        }
        biasGradient += (2 * error) / n;

        // MSE loss
        totalLoss += error ** 2;
      }
    }

    return {
      gradients,
      biasGradient,
      loss: totalLoss / n,
      accuracy: config.modelType === 'classification' ? correctPredictions / n : undefined,
    };
  }

  /**
   * Compute validation metrics
   */
  private computeValidationMetrics(
    data: TrainingDataPoint[],
    weights: number[],
    bias: number,
    featureNames: string[],
    config: TrainingConfig,
    normStats: Record<string, { mean: number; std: number }> | null,
  ): { loss: number; accuracy?: number } {
    const n = data.length;
    let totalLoss = 0;
    let correctPredictions = 0;

    for (const point of data) {
      const features = featureNames.map((name) => {
        let value = point.features[name] ?? 0;
        if (normStats) {
          value = (value - normStats[name].mean) / normStats[name].std;
        }
        return value;
      });

      let z = bias;
      for (let i = 0; i < features.length; i++) {
        z += features[i] * weights[i];
      }

      const label = typeof point.label === 'number' ? point.label : point.label === 'true' ? 1 : 0;

      if (config.modelType === 'classification') {
        const prediction = this.sigmoid(z);
        const clampedPred = Math.max(1e-7, Math.min(1 - 1e-7, prediction));
        totalLoss += -(label * Math.log(clampedPred) + (1 - label) * Math.log(1 - clampedPred));
        if ((prediction >= 0.5 ? 1 : 0) === label) {
          correctPredictions++;
        }
      } else {
        totalLoss += (z - label) ** 2;
      }
    }

    return {
      loss: totalLoss / n,
      accuracy: config.modelType === 'classification' ? correctPredictions / n : undefined,
    };
  }

  /**
   * Compute final metrics for trained model
   */
  private computeFinalMetrics(
    testData: TrainingDataPoint[],
    weights: number[],
    bias: number,
    featureNames: string[],
    config: TrainingConfig,
    normStats: Record<string, { mean: number; std: number }> | null,
    trainingSamples: number,
    validationSamples: number,
  ): ModelMetrics {
    let tp = 0, fp = 0, tn = 0, fn = 0;
    let sumSquaredError = 0;
    let sumAbsError = 0;

    for (const point of testData) {
      const features = featureNames.map((name) => {
        let value = point.features[name] ?? 0;
        if (normStats) {
          value = (value - normStats[name].mean) / normStats[name].std;
        }
        return value;
      });

      let z = bias;
      for (let i = 0; i < features.length; i++) {
        z += features[i] * weights[i];
      }

      const label = typeof point.label === 'number' ? point.label : point.label === 'true' ? 1 : 0;

      if (config.modelType === 'classification') {
        const prediction = this.sigmoid(z);
        const predictedClass = prediction >= 0.5 ? 1 : 0;

        if (predictedClass === 1 && label === 1) tp++;
        else if (predictedClass === 1 && label === 0) fp++;
        else if (predictedClass === 0 && label === 0) tn++;
        else fn++;
      } else {
        const error = z - label;
        sumSquaredError += error ** 2;
        sumAbsError += Math.abs(error);
      }
    }

    if (config.modelType === 'classification') {
      const accuracy = (tp + tn) / (tp + tn + fp + fn);
      const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
      const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
      const f1Score = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

      return {
        accuracy,
        precision,
        recall,
        f1Score,
        trainedAt: new Date(),
        trainingSamples,
        validationSamples,
      };
    } else {
      const rmse = Math.sqrt(sumSquaredError / testData.length);
      const mae = sumAbsError / testData.length;

      return {
        rmse,
        mae,
        trainedAt: new Date(),
        trainingSamples,
        validationSamples,
      };
    }
  }

  /**
   * Compute confusion matrix
   */
  private computeConfusionMatrix(
    data: TrainingDataPoint[],
    weights: number[],
    bias: number,
    featureNames: string[],
    classLabels: string[],
  ): ConfusionMatrix {
    const numClasses = classLabels.length;
    const matrix: number[][] = Array.from({ length: numClasses }, () =>
      Array(numClasses).fill(0),
    );

    for (const point of data) {
      const features = featureNames.map((name) => point.features[name] ?? 0);

      let z = bias;
      for (let i = 0; i < features.length; i++) {
        z += features[i] * weights[i];
      }

      const prediction = this.sigmoid(z);
      const predictedClass = prediction >= 0.5 ? 1 : 0;
      const actualClass = typeof point.label === 'number' ? point.label : point.label === 'true' ? 1 : 0;

      if (predictedClass < numClasses && actualClass < numClasses) {
        matrix[predictedClass][actualClass]++;
      }
    }

    // Calculate per-class metrics from matrix
    const truePositives: Record<string, number> = {};
    const falsePositives: Record<string, number> = {};
    const trueNegatives: Record<string, number> = {};
    const falseNegatives: Record<string, number> = {};

    for (let i = 0; i < numClasses; i++) {
      const label = classLabels[i];
      truePositives[label] = matrix[i][i];
      falsePositives[label] = matrix.reduce((sum, row, j) => sum + (j !== i ? row[i] : 0), 0);
      falseNegatives[label] = matrix[i].reduce((sum, val, j) => sum + (j !== i ? val : 0), 0);
      const total = data.length;
      trueNegatives[label] = total - truePositives[label] - falsePositives[label] - falseNegatives[label];
    }

    return {
      labels: classLabels,
      matrix,
      truePositives,
      falsePositives,
      trueNegatives,
      falseNegatives,
    };
  }

  /**
   * Sigmoid function
   */
  private sigmoid(x: number): number {
    const clampedX = Math.max(-500, Math.min(500, x));
    return 1 / (1 + Math.exp(-clampedX));
  }

  /**
   * Generate version string
   */
  private generateVersion(): string {
    const date = new Date();
    const major = 1;
    const minor = date.getMonth() + 1;
    const patch = date.getDate();
    return `${major}.${minor}.${patch}`;
  }
}
