/**
 * Feature Interface
 *
 * @description Defines the structure for ML features used in predictions.
 * Features can be numeric (continuous), categorical (discrete classes),
 * or boolean (binary).
 *
 * @module ML
 * @sprint 3.1 - Feature Engineering for ML Predictions
 * @created 2026-02-03
 */

/**
 * Feature type classification
 */
export type FeatureType = 'numeric' | 'categorical' | 'boolean';

/**
 * Individual feature representation
 */
export interface Feature {
  /** Unique identifier for the feature (snake_case) */
  name: string;

  /** Raw feature value */
  value: number | string | boolean;

  /** Feature data type */
  type: FeatureType;

  /** Normalized value (0-1 range for numeric features) */
  normalized?: number;

  /** Feature importance score (0-1, higher = more important) */
  importance?: number;

  /** Human-readable description */
  description?: string;

  /** Unit of measurement for numeric features */
  unit?: string;
}

/**
 * Feature set metadata
 */
export interface FeatureSetMetadata {
  /** Feature set version for tracking changes */
  version: string;

  /** Timestamp when features were generated */
  generatedAt: Date;

  /** Total number of features in the set */
  featureCount: number;

  /** Number of numeric features */
  numericFeatureCount?: number;

  /** Number of categorical features */
  categoricalFeatureCount?: number;

  /** Number of boolean features */
  booleanFeatureCount?: number;

  /** Time taken to generate features (milliseconds) */
  generationTimeMs?: number;

  /** Data source versions used */
  dataSources?: {
    factExerciseCompletions?: Date;
    factDailyProgress?: Date;
    factGamificationEvents?: Date;
    dimStudent?: Date;
  };
}

/**
 * Complete feature set for a student
 */
export interface FeatureSet {
  /** Student identifier (profiles.id) */
  studentId: string;

  /** Timestamp when features represent the state */
  timestamp: Date;

  /** Array of computed features */
  features: Feature[];

  /** Metadata about the feature set */
  metadata: FeatureSetMetadata;

  /** Cache key for Redis storage */
  cacheKey?: string;
}

/**
 * Configuration for feature generation
 */
export interface FeatureConfig {
  /** Number of days to look back for historical features */
  lookbackDays: number;

  /** Feature categories to include */
  includeCategories: FeatureCategory[];

  /** Whether to normalize numeric features to 0-1 range */
  normalize: boolean;

  /** Whether to compute feature importance */
  computeImportance?: boolean;

  /** Custom date range (overrides lookbackDays) */
  dateRange?: {
    start: Date;
    end: Date;
  };
}

/**
 * Feature categories available for extraction
 */
export type FeatureCategory =
  | 'student'      // Basic student attributes from dim_student
  | 'engagement'   // Login patterns, session duration, streaks
  | 'performance'  // Scores, completion rates, time efficiency
  | 'temporal'     // Time-based patterns (day of week, hour, regularity)
  | 'gamification' // XP, ranks, achievements, missions
  | 'all';         // Include all categories

/**
 * Feature normalization configuration
 */
export interface NormalizationConfig {
  /** Minimum value for scaling (default: 0) */
  min?: number;

  /** Maximum value for scaling (default: 1) */
  max?: number;

  /** Normalization method */
  method: 'min-max' | 'z-score' | 'robust';

  /** Pre-computed statistics for normalization */
  stats?: {
    min: number;
    max: number;
    mean: number;
    std: number;
    q1: number;
    q3: number;
  };
}

/**
 * Missing data handling strategy
 */
export interface ImputationConfig {
  /** Strategy for handling missing numeric values */
  numericStrategy: 'mean' | 'median' | 'mode' | 'zero' | 'custom';

  /** Custom value for numeric imputation */
  numericCustomValue?: number;

  /** Strategy for handling missing categorical values */
  categoricalStrategy: 'mode' | 'unknown' | 'custom';

  /** Custom value for categorical imputation */
  categoricalCustomValue?: string;

  /** Strategy for handling missing boolean values */
  booleanStrategy: 'false' | 'true' | 'mode';
}

/**
 * Feature extraction result with statistics
 */
export interface FeatureExtractionResult {
  /** The computed feature set */
  featureSet: FeatureSet;

  /** Extraction statistics */
  stats: {
    totalRecordsProcessed: number;
    featuresExtracted: number;
    missingValuesImputed: number;
    normalizationsApplied: number;
    errorsEncountered: number;
  };

  /** Any warnings during extraction */
  warnings?: string[];
}

/**
 * Batch feature generation result
 */
export interface BatchFeatureResult {
  /** Array of feature sets for each student */
  featureSets: FeatureSet[];

  /** Students that failed feature extraction */
  failures: {
    studentId: string;
    error: string;
  }[];

  /** Batch statistics */
  stats: {
    totalRequested: number;
    successCount: number;
    failureCount: number;
    totalTimeMs: number;
    averageTimePerStudent: number;
  };
}

/**
 * Feature schema definition for documentation
 */
export interface FeatureSchema {
  /** Feature name */
  name: string;

  /** Feature category */
  category: FeatureCategory;

  /** Data type */
  type: FeatureType;

  /** Description of the feature */
  description: string;

  /** Range for numeric features */
  range?: {
    min: number;
    max: number;
  };

  /** Possible values for categorical features */
  possibleValues?: string[];

  /** Data source (fact/dim table) */
  source: string;

  /** Whether this feature is experimental */
  experimental?: boolean;

  /** Version when this feature was added */
  addedInVersion?: string;
}
