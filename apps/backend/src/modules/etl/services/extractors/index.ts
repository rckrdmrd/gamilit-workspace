/**
 * ETL Extractors - Barrel Export
 *
 * @description Central export for all ETL extractor services
 * @module etl/services/extractors
 * @version 1.0.0
 * @since Sprint 2.2 - ETL Pipeline Extraction
 */

// Exercise Completion Extractor
export {
  ExerciseCompletionExtractor,
  ExerciseCompletionData,
} from './exercise-completion.extractor';

// Student Extractor (SCD Type 2 dimension)
export {
  StudentExtractor,
  StudentData,
} from './student.extractor';

// Gamification Event Extractor
export {
  GamificationEventExtractor,
  GamificationEventData,
  GamificationEventType,
} from './gamification-event.extractor';

// Teacher Metric Extractor
export {
  TeacherMetricExtractor,
  TeacherMetricData,
} from './teacher-metric.extractor';
