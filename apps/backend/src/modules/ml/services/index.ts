/**
 * ML Module Services Index
 *
 * @module ML
 * @sprint 3.1 - Feature Engineering for ML Predictions
 * @updated Sprint 3.2 - ML Prediction Models
 * @updated Sprint 3.3 - ML Prediction API
 * @created 2026-02-03
 */

// Feature Engineering Services (Sprint 3.1)
export * from './feature-engineering';

// Feature Store Service
export { FeatureStoreService } from './feature-store.service';

// ML Models (Sprint 3.2)
export * from './models';

// Training Services (Sprint 3.2)
export * from './training';

// Model Manager (Sprint 3.2)
export { ModelManagerService } from './model-manager.service';

// Prediction API Services (Sprint 3.3)
export { PredictionService } from './prediction.service';
export { PredictionCacheService } from './prediction-cache.service';
