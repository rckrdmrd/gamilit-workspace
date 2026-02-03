/**
 * ML Models - Barrel Export
 *
 * @description Central export for all ML prediction models
 * @module ml/services/models
 * @version 1.0.0
 * @since Sprint 3.2 - ML Prediction Models
 */

// Base service
export { ModelBaseService, ModelConfig, DEFAULT_MODEL_CONFIG } from './model-base.service';

// Prediction models
export { DropoutRiskModel } from './dropout-risk.model';
export { PerformancePredictorModel } from './performance-predictor.model';
export { DifficultyRecommenderModel } from './difficulty-recommender.model';
export { EngagementPredictorModel } from './engagement-predictor.model';
