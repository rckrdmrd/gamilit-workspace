/**
 * Model Manager Service
 *
 * @description Central service for managing ML models.
 * Provides:
 * - Model loading/unloading
 * - Version management
 * - A/B testing support
 * - Fallback management
 *
 * @module ml/services
 * @version 1.0.0
 * @since Sprint 3.2 - ML Prediction Models
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  ModelType,
  ModelWeights,
  ModelMetrics,
  ModelVersionInfo,
  IModel,
  AlgorithmType,
  DropoutRiskInput,
  DropoutRiskOutput,
  PerformancePredictorInput,
  PerformancePredictorOutput,
  DifficultyRecommenderInput,
  DifficultyRecommenderOutput,
  EngagementPredictorInput,
  EngagementPredictorOutput,
} from '../interfaces';
import {
  DropoutRiskModel,
  PerformancePredictorModel,
  DifficultyRecommenderModel,
  EngagementPredictorModel,
} from './models';

/**
 * Model registry entry
 */
interface ModelRegistryEntry {
  modelType: ModelType;
  versions: Map<string, ModelWeights>;
  activeVersion: string;
  instance: IModel<unknown, unknown>;
}

/**
 * A/B test configuration
 */
interface ABTestConfig {
  modelType: ModelType;
  controlVersion: string;
  treatmentVersion: string;
  trafficSplit: number; // 0-1, fraction going to treatment
  startedAt: Date;
  endDate?: Date;
}

/**
 * ModelManagerService
 * @description Manages ML model lifecycle and versioning
 */
@Injectable()
export class ModelManagerService implements OnModuleInit {
  private readonly logger = new Logger(ModelManagerService.name);

  /** Model registry */
  private readonly registry = new Map<ModelType, ModelRegistryEntry>();

  /** Active A/B tests */
  private readonly abTests = new Map<ModelType, ABTestConfig>();

  /** Model instances */
  private dropoutRiskModel!: DropoutRiskModel;
  private performancePredictorModel!: PerformancePredictorModel;
  private difficultyRecommenderModel!: DifficultyRecommenderModel;
  private engagementPredictorModel!: EngagementPredictorModel;

  async onModuleInit(): Promise<void> {
    this.logger.log('Initializing Model Manager...');

    // Initialize model instances
    this.dropoutRiskModel = new DropoutRiskModel();
    this.performancePredictorModel = new PerformancePredictorModel();
    this.difficultyRecommenderModel = new DifficultyRecommenderModel();
    this.engagementPredictorModel = new EngagementPredictorModel();

    // Register models
    this.registerModel(ModelType.DROPOUT_RISK, this.dropoutRiskModel);
    this.registerModel(ModelType.PERFORMANCE_PREDICTOR, this.performancePredictorModel);
    this.registerModel(ModelType.DIFFICULTY_RECOMMENDER, this.difficultyRecommenderModel);
    this.registerModel(ModelType.ENGAGEMENT_PREDICTOR, this.engagementPredictorModel);

    this.logger.log('Model Manager initialized with 4 models');
  }

  // ============================================
  // MODEL ACCESS
  // ============================================

  /**
   * Get dropout risk model
   */
  getDropoutRiskModel(): DropoutRiskModel {
    return this.dropoutRiskModel;
  }

  /**
   * Get performance predictor model
   */
  getPerformancePredictorModel(): PerformancePredictorModel {
    return this.performancePredictorModel;
  }

  /**
   * Get difficulty recommender model
   */
  getDifficultyRecommenderModel(): DifficultyRecommenderModel {
    return this.difficultyRecommenderModel;
  }

  /**
   * Get engagement predictor model
   */
  getEngagementPredictorModel(): EngagementPredictorModel {
    return this.engagementPredictorModel;
  }

  /**
   * Get model by type
   */
  getModel(modelType: ModelType): IModel<unknown, unknown> | undefined {
    return this.registry.get(modelType)?.instance;
  }

  // ============================================
  // MODEL LOADING/UNLOADING
  // ============================================

  /**
   * Load model weights for a specific version
   * @param modelType - Type of model
   * @param weights - Model weights to load
   */
  async loadModel(modelType: ModelType, weights: ModelWeights): Promise<void> {
    this.logger.log(`Loading ${modelType} version ${weights.version}`);

    const entry = this.registry.get(modelType);
    if (!entry) {
      throw new Error(`Model type ${modelType} not registered`);
    }

    // Store weights
    entry.versions.set(weights.version, weights);

    // Load into model instance
    const model = entry.instance as unknown as {
      loadWeights: (w: ModelWeights) => void;
    };
    model.loadWeights(weights);

    // Update active version
    entry.activeVersion = weights.version;

    this.logger.log(`Model ${modelType} v${weights.version} loaded successfully`);
  }

  /**
   * Unload a model
   */
  unloadModel(modelType: ModelType): void {
    const entry = this.registry.get(modelType);
    if (entry) {
      const model = entry.instance as unknown as { unload: () => void };
      model.unload();
      this.logger.log(`Model ${modelType} unloaded`);
    }
  }

  /**
   * Set active version for a model type
   */
  setActiveVersion(modelType: ModelType, version: string): void {
    const entry = this.registry.get(modelType);
    if (!entry) {
      throw new Error(`Model type ${modelType} not registered`);
    }

    const weights = entry.versions.get(version);
    if (!weights) {
      throw new Error(`Version ${version} not found for ${modelType}`);
    }

    // Load weights into model
    const model = entry.instance as unknown as {
      loadWeights: (w: ModelWeights) => void;
    };
    model.loadWeights(weights);

    entry.activeVersion = version;
    this.logger.log(`${modelType} active version set to ${version}`);
  }

  /**
   * List available versions for a model type
   */
  listVersions(modelType: ModelType): string[] {
    const entry = this.registry.get(modelType);
    if (!entry) {
      return [];
    }
    return Array.from(entry.versions.keys());
  }

  /**
   * Get active version for a model type
   */
  getActiveVersion(modelType: ModelType): string | undefined {
    return this.registry.get(modelType)?.activeVersion;
  }

  // ============================================
  // MODEL INFO
  // ============================================

  /**
   * Get model info
   */
  getModelInfo(modelType: ModelType): ModelVersionInfo | undefined {
    const entry = this.registry.get(modelType);
    if (!entry || !entry.activeVersion) {
      return undefined;
    }

    const weights = entry.versions.get(entry.activeVersion);
    if (!weights) {
      return undefined;
    }

    return {
      modelType,
      version: entry.activeVersion,
      createdAt: weights.trainedAt,
      createdBy: 'system',
      trainingConfig: {
        modelType: 'classification',
        algorithm: AlgorithmType.LOGISTIC_REGRESSION,
        hyperparameters: {},
        crossValidationFolds: 5,
        testSplitRatio: 0.2,
        features: Object.keys(weights.weights),
        target: 'label',
        normalizeFeatures: true,
      },
      metrics: weights.metrics,
      isActive: true,
    };
  }

  /**
   * Get all registered model types
   */
  getRegisteredModelTypes(): ModelType[] {
    return Array.from(this.registry.keys());
  }

  /**
   * Get model metrics
   */
  getModelMetrics(modelType: ModelType): ModelMetrics | undefined {
    const entry = this.registry.get(modelType);
    if (!entry) {
      return undefined;
    }
    return entry.instance.getMetrics();
  }

  /**
   * Check if model is loaded
   */
  isModelLoaded(modelType: ModelType): boolean {
    const entry = this.registry.get(modelType);
    return entry?.instance.isLoaded() ?? false;
  }

  // ============================================
  // A/B TESTING
  // ============================================

  /**
   * Start an A/B test between two model versions
   */
  startABTest(
    modelType: ModelType,
    controlVersion: string,
    treatmentVersion: string,
    trafficSplit: number = 0.5,
    durationDays?: number,
  ): void {
    const entry = this.registry.get(modelType);
    if (!entry) {
      throw new Error(`Model type ${modelType} not registered`);
    }

    // Validate versions exist
    if (!entry.versions.has(controlVersion)) {
      throw new Error(`Control version ${controlVersion} not found`);
    }
    if (!entry.versions.has(treatmentVersion)) {
      throw new Error(`Treatment version ${treatmentVersion} not found`);
    }

    const config: ABTestConfig = {
      modelType,
      controlVersion,
      treatmentVersion,
      trafficSplit: Math.max(0, Math.min(1, trafficSplit)),
      startedAt: new Date(),
      endDate: durationDays
        ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
        : undefined,
    };

    this.abTests.set(modelType, config);
    this.logger.log(
      `A/B test started for ${modelType}: ` +
        `${controlVersion} vs ${treatmentVersion} (${trafficSplit * 100}% treatment)`,
    );
  }

  /**
   * Stop an A/B test
   */
  stopABTest(modelType: ModelType, winnerVersion?: string): void {
    const test = this.abTests.get(modelType);
    if (!test) {
      return;
    }

    this.abTests.delete(modelType);

    if (winnerVersion) {
      this.setActiveVersion(modelType, winnerVersion);
      this.logger.log(`A/B test ended for ${modelType}, winner: ${winnerVersion}`);
    } else {
      this.logger.log(`A/B test ended for ${modelType}`);
    }
  }

  /**
   * Get version to use for A/B testing
   */
  getVersionForABTest(modelType: ModelType, userId?: string): string | undefined {
    const test = this.abTests.get(modelType);
    if (!test) {
      return this.getActiveVersion(modelType);
    }

    // Check if test has expired
    if (test.endDate && new Date() > test.endDate) {
      this.stopABTest(modelType);
      return this.getActiveVersion(modelType);
    }

    // Deterministic assignment based on userId for consistency
    let assignToTreatment: boolean;
    if (userId) {
      const hash = this.simpleHash(userId);
      assignToTreatment = (hash % 100) / 100 < test.trafficSplit;
    } else {
      assignToTreatment = Math.random() < test.trafficSplit;
    }

    return assignToTreatment ? test.treatmentVersion : test.controlVersion;
  }

  /**
   * Get active A/B test info
   */
  getABTestInfo(modelType: ModelType): ABTestConfig | undefined {
    return this.abTests.get(modelType);
  }

  // ============================================
  // PREDICTIONS (Convenience Methods)
  // ============================================

  /**
   * Predict dropout risk
   */
  async predictDropoutRisk(input: DropoutRiskInput): Promise<DropoutRiskOutput> {
    return this.dropoutRiskModel.predict(input);
  }

  /**
   * Predict performance
   */
  async predictPerformance(input: PerformancePredictorInput): Promise<PerformancePredictorOutput> {
    return this.performancePredictorModel.predict(input);
  }

  /**
   * Recommend difficulty
   */
  async recommendDifficulty(input: DifficultyRecommenderInput): Promise<DifficultyRecommenderOutput> {
    return this.difficultyRecommenderModel.predict(input);
  }

  /**
   * Predict engagement
   */
  async predictEngagement(input: EngagementPredictorInput): Promise<EngagementPredictorOutput> {
    return this.engagementPredictorModel.predict(input);
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  /**
   * Register a model in the registry
   */
  private registerModel(modelType: ModelType, instance: IModel<unknown, unknown>): void {
    this.registry.set(modelType, {
      modelType,
      versions: new Map(),
      activeVersion: instance.version,
      instance,
    });

    this.logger.debug(`Registered model: ${modelType}`);
  }

  /**
   * Simple hash function for deterministic A/B assignment
   */
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}
