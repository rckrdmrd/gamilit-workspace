/**
 * ETL Interfaces - Barrel Export
 *
 * @description Central export for all ETL module interfaces
 * @module etl/interfaces
 * @version 1.2.0
 * @since Sprint 2.2 - ETL Pipeline Extraction
 * @updated Sprint 2.3 - ETL Pipeline Transformation
 * @updated Sprint 2.4 - ETL Pipeline Load
 */

// Extraction interfaces (Sprint 2.2)
export { IExtractor } from './extractor.interface';
export {
  ExtractionConfig,
  DEFAULT_EXTRACTION_CONFIG,
} from './extraction-config.interface';
export {
  ExtractionResult,
  ExtractionMetadata,
  ExtractionStatus,
  ExtractionSummary,
} from './extraction-result.interface';

// Transformation interfaces (Sprint 2.3)
export {
  ITransformer,
  IDimensionLookup,
  RejectedRecord,
  TransformationStats,
  TransformationResult,
  SCDChange,
  TransformerConfig,
  DEFAULT_TRANSFORMER_CONFIG,
} from './transformer.interface';
export {
  ValidationResult,
  ValidationIssue,
  ValidationSeverity,
  ValidationCategory,
  FieldValidationStats,
  DuplicateGroup,
  ReferenceCheckResult,
  ValidationSummary,
  ValidationRule,
  ValidationConfig,
} from './validation-result.interface';

// Loader interfaces (Sprint 2.4)
export { ILoader, IDimensionLoader, IFactLoader } from './loader.interface';
export {
  LoadMode,
  LoadConfig,
  LoadProgress,
  LoadResult,
  RejectedRow,
  SCDLoadResult,
  DimensionKeyValidation,
  DimensionKeyError,
} from './load-result.interface';
