/**
 * Transformer Interface
 *
 * @description Core interfaces for ETL transformation pipeline.
 * Defines contracts for data transformers that convert OLTP data
 * to Data Warehouse format.
 *
 * @module etl/interfaces
 * @since 2026-02-03
 */

/**
 * Rejected Record
 * @description Represents a record that failed transformation/validation
 */
export interface RejectedRecord {
  /** Original record data */
  originalData: Record<string, unknown>;
  /** Reason for rejection */
  reason: string;
  /** Error code for categorization */
  errorCode: string;
  /** Field that caused the rejection (if applicable) */
  field?: string;
  /** Timestamp when rejection occurred */
  rejectedAt: Date;
}

/**
 * Transformation Statistics
 * @description Metrics collected during transformation process
 */
export interface TransformationStats {
  /** Number of input records processed */
  inputCount: number;
  /** Number of successfully transformed records */
  outputCount: number;
  /** Number of rejected records */
  rejectedCount: number;
  /** Timestamp when transformation completed */
  transformedAt: Date;
  /** Duration of transformation in milliseconds */
  durationMs: number;
  /** Batch identifier for tracking */
  batchId: string;
}

/**
 * Transformation Result
 * @description Result of a transformation operation
 * @template T - Type of the transformed records
 */
export interface TransformationResult<T> {
  /** Successfully transformed records */
  transformed: T[];
  /** Records that failed transformation */
  rejected: RejectedRecord[];
  /** Statistics about the transformation */
  stats: TransformationStats;
}

/**
 * Transformer Interface
 * @description Contract for all data transformers
 * @template TSource - Source data type (OLTP)
 * @template TTarget - Target data type (DW)
 */
export interface ITransformer<TSource, TTarget> {
  /**
   * Transform source records to target format
   * @param data - Array of source records
   * @param batchId - Unique batch identifier
   * @returns Promise with transformation result
   */
  transform(data: TSource[], batchId: string): Promise<TransformationResult<TTarget>>;

  /**
   * Get transformer name for logging/tracking
   */
  getName(): string;
}

/**
 * Dimension Key Lookup Interface
 * @description Contract for dimension key resolution services
 */
export interface IDimensionLookup {
  /**
   * Get date dimension key (YYYYMMDD format)
   * @param date - Date to convert
   * @returns Numeric key in YYYYMMDD format
   */
  getDateKey(date: Date): number;

  /**
   * Get time dimension key (HHMM format)
   * @param date - Date containing time to convert
   * @returns Numeric key in HHMM format
   */
  getTimeKey(date: Date): number;

  /**
   * Get or create student surrogate key
   * @param studentId - Natural key (UUID) from OLTP
   * @returns Promise with surrogate key
   */
  getOrCreateStudentKey(studentId: string): Promise<number>;

  /**
   * Get exercise surrogate key
   * @param exerciseId - Natural key (UUID) from OLTP
   * @returns Promise with surrogate key (or null if not found)
   */
  getExerciseKey(exerciseId: string): Promise<number | null>;

  /**
   * Get module surrogate key
   * @param moduleId - Natural key (UUID) from OLTP
   * @returns Promise with surrogate key (or null if not found)
   */
  getModuleKey(moduleId: string): Promise<number | null>;

  /**
   * Get achievement surrogate key
   * @param achievementId - Natural key (UUID) from OLTP
   * @returns Promise with surrogate key (or null if not found)
   */
  getAchievementKey(achievementId: string): Promise<number | null>;

  /**
   * Get rank surrogate key
   * @param rankName - Maya rank name
   * @returns Promise with surrogate key (or null if not found)
   */
  getRankKey(rankName: string): Promise<number | null>;
}

/**
 * SCD Type 2 Change Detection
 * @description Represents a detected change for SCD Type 2 processing
 */
export interface SCDChange {
  /** Student ID */
  studentId: string;
  /** Field that changed */
  changedField: string;
  /** Previous value */
  oldValue: unknown;
  /** New value */
  newValue: unknown;
  /** When the change was detected */
  detectedAt: Date;
}

/**
 * Transformer Configuration
 * @description Configuration options for transformers
 */
export interface TransformerConfig {
  /** Batch size for processing */
  batchSize: number;
  /** Score passing threshold (0-100) */
  passingThreshold: number;
  /** Timezone for date conversions */
  timezone: string;
  /** Whether to normalize scores to 0-100 */
  normalizeScores: boolean;
  /** Maximum time allowed per exercise (seconds) */
  maxExerciseTimeSeconds: number;
}

/**
 * Default transformer configuration
 */
export const DEFAULT_TRANSFORMER_CONFIG: TransformerConfig = {
  batchSize: 1000,
  passingThreshold: 70,
  timezone: 'America/Mexico_City',
  normalizeScores: true,
  maxExerciseTimeSeconds: 7200, // 2 hours
};
