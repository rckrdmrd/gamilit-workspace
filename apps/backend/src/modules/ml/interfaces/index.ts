/**
 * ML Module Interfaces
 *
 * @module ML
 * @sprint 3.1 - Feature Engineering for ML Predictions
 * @updated Sprint 3.2 - ML Prediction Models
 * @created 2026-02-03
 */

// Feature Engineering interfaces (Sprint 3.1)
export * from './feature.interface';

// Prediction interfaces - selective exports to avoid conflicts
export {
  PredictionType,
  RiskLevel,
  PredictionEngagementLevel,
  DifficultyLevel,
  BasePrediction,
  DropoutRiskPrediction,
  PerformancePrediction,
  DifficultyRecommendation,
  EngagementPrediction,
  PredictionResult,
  PredictionRequest,
  BatchPredictionResult,
  PredictionModelMetrics,
} from './prediction.interface';

// Model interfaces (Sprint 3.2) - primary source for ModelMetrics and EngagementLevel
export * from './model.interface';
export * from './training.interface';
