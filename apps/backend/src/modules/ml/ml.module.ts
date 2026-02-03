/**
 * ML Module
 *
 * @description Machine Learning module for GAMILIT platform.
 * Provides feature engineering, ML model predictions, and caching.
 *
 * Features:
 * - Feature Engineering (Sprint 3.1)
 *   - Student Features
 *   - Performance Features
 *   - Engagement Features
 *   - Temporal Features
 *
 * - ML Models (Sprint 3.2)
 *   - Dropout Risk Prediction
 *   - Performance Prediction
 *   - Difficulty Recommendation
 *   - Engagement Prediction
 *
 * - Prediction API (Sprint 3.3)
 *   - Individual Predictions
 *   - Batch Predictions
 *   - Composite Insights
 *   - Model Administration
 *
 * @module ml
 * @sprint 3.3 - ML Prediction API
 * @created 2026-02-03
 */

import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';

// Controllers
import {
  FeaturesController,
  PredictionController,
  ModelAdminController,
} from './controllers';

// Services - Feature Engineering
import {
  StudentFeaturesService,
  EngagementFeaturesService,
  PerformanceFeaturesService,
  TemporalFeaturesService,
  FeatureStoreService,
} from './services';

// Services - ML Models
import {
  DropoutRiskModel,
  PerformancePredictorModel,
  DifficultyRecommenderModel,
  EngagementPredictorModel,
} from './services/models';

// Services - Training (Sprint 3.2)
import { TrainerService } from './services/training/trainer.service';
import { CrossValidatorService } from './services/training/cross-validator.service';
import { HyperparameterTunerService } from './services/training/hyperparameter-tuner.service';

// Services - Model Management (Sprint 3.2)
import { ModelManagerService } from './services/model-manager.service';

// Services - Prediction API
import { PredictionService, PredictionCacheService } from './services';

// Guards
import { ModelReadyGuard } from './guards';

@Module({
  imports: [
    // Cache module for predictions
    CacheModule.register({
      ttl: 60000, // Default 60 seconds, overridden per prediction type
      max: 1000,
    }),
  ],
  controllers: [
    // Features Controller (Sprint 3.1)
    FeaturesController,

    // Prediction Controllers (Sprint 3.3)
    PredictionController,
    ModelAdminController,
  ],
  providers: [
    // Feature Engineering Services (Sprint 3.1)
    StudentFeaturesService,
    EngagementFeaturesService,
    PerformanceFeaturesService,
    TemporalFeaturesService,
    FeatureStoreService,

    // ML Model Services (Sprint 3.2)
    DropoutRiskModel,
    PerformancePredictorModel,
    DifficultyRecommenderModel,
    EngagementPredictorModel,

    // Training Services (Sprint 3.2)
    TrainerService,
    CrossValidatorService,
    HyperparameterTunerService,

    // Model Manager (Sprint 3.2)
    ModelManagerService,

    // Prediction API Services (Sprint 3.3)
    PredictionService,
    PredictionCacheService,

    // Guards
    ModelReadyGuard,
  ],
  exports: [
    // Export services for use by other modules
    PredictionService,
    PredictionCacheService,
    FeatureStoreService,

    // Export models for direct use if needed
    DropoutRiskModel,
    PerformancePredictorModel,
    DifficultyRecommenderModel,
    EngagementPredictorModel,

    // Export training services
    TrainerService,
    CrossValidatorService,
    HyperparameterTunerService,

    // Export model manager
    ModelManagerService,
  ],
})
export class MLModule {}
