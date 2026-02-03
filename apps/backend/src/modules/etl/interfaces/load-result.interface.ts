/**
 * Load Result Interface - ETL Pipeline Load Phase
 *
 * @description Defines configuration and result types for ETL load operations.
 * Used by all loaders to standardize input/output contracts.
 *
 * @module ETL
 * @see TASK-2026-02-03 Sprint 2.4 - ETL Pipeline Carga
 */

/**
 * Load Mode Enum
 *
 * @description Defines the strategy for loading data into target tables
 */
export enum LoadMode {
  /**
   * Append new records without checking for duplicates
   */
  APPEND = 'append',

  /**
   * Insert new records or update existing ones based on key columns
   */
  UPSERT = 'upsert',

  /**
   * Truncate table and load fresh data
   */
  TRUNCATE_LOAD = 'truncate_load',
}

/**
 * Load Configuration
 *
 * @description Configuration options for a load operation
 */
export interface LoadConfig {
  /**
   * Load strategy mode
   */
  mode: LoadMode;

  /**
   * Number of records to process per batch
   * @default 1000
   */
  batchSize: number;

  /**
   * Whether to validate foreign key constraints before loading
   * @default true
   */
  validateConstraints: boolean;

  /**
   * Target table name (without schema)
   */
  targetTable: string;

  /**
   * Target schema name
   */
  targetSchema: string;

  /**
   * Key columns for upsert mode conflict detection
   */
  keyColumns?: string[];

  /**
   * Columns to update on conflict (upsert mode)
   * If not specified, all non-key columns are updated
   */
  updateColumns?: string[];

  /**
   * Optional callback for progress reporting
   */
  onProgress?: (progress: LoadProgress) => void;

  /**
   * Whether to continue on error or abort entire load
   * @default false
   */
  continueOnError?: boolean;

  /**
   * Maximum number of retries for transient errors
   * @default 3
   */
  maxRetries?: number;

  /**
   * Whether to use transaction for entire load
   * @default true
   */
  useTransaction?: boolean;
}

/**
 * Load Progress
 *
 * @description Progress information during load operation
 */
export interface LoadProgress {
  /**
   * Total records to process
   */
  totalRecords: number;

  /**
   * Records processed so far
   */
  processedRecords: number;

  /**
   * Current batch number
   */
  currentBatch: number;

  /**
   * Total number of batches
   */
  totalBatches: number;

  /**
   * Percentage complete (0-100)
   */
  percentComplete: number;

  /**
   * Estimated time remaining in milliseconds
   */
  estimatedTimeRemaining?: number;

  /**
   * Records per second rate
   */
  recordsPerSecond?: number;
}

/**
 * Load Result
 *
 * @description Result statistics from a load operation
 */
export interface LoadResult {
  /**
   * Number of rows successfully inserted
   */
  rowsInserted: number;

  /**
   * Number of rows updated (upsert mode)
   */
  rowsUpdated: number;

  /**
   * Number of rows rejected due to errors
   */
  rowsRejected: number;

  /**
   * Timestamp when load completed
   */
  loadedAt: Date;

  /**
   * Duration of load operation in milliseconds
   */
  duration: number;

  /**
   * Whether the load completed successfully
   */
  success: boolean;

  /**
   * Error message if load failed
   */
  errorMessage?: string;

  /**
   * Details of rejected rows
   */
  rejectedRows?: RejectedRow[];

  /**
   * Target table that was loaded
   */
  targetTable: string;

  /**
   * Target schema
   */
  targetSchema: string;

  /**
   * Load mode used
   */
  loadMode: LoadMode;

  /**
   * Number of batches processed
   */
  batchesProcessed: number;

  /**
   * Average records per second
   */
  averageRecordsPerSecond: number;
}

/**
 * Rejected Row Details
 *
 * @description Information about a row that was rejected during load
 */
export interface RejectedRow {
  /**
   * Row index in the input data
   */
  rowIndex: number;

  /**
   * The rejected record data
   */
  data: Record<string, unknown>;

  /**
   * Reason for rejection
   */
  reason: string;

  /**
   * Error code if applicable
   */
  errorCode?: string;
}

/**
 * SCD Type 2 Result
 *
 * @description Extended result for SCD Type 2 dimension loads
 */
export interface SCDLoadResult extends LoadResult {
  /**
   * Number of new dimension records created
   */
  newRecords: number;

  /**
   * Number of existing records that were versioned (created new version)
   */
  versionedRecords: number;

  /**
   * Number of records unchanged (no attribute changes)
   */
  unchangedRecords: number;

  /**
   * Number of records expired (is_current set to false)
   */
  expiredRecords: number;
}

/**
 * Dimension Key Validation Result
 *
 * @description Result of dimension key validation for fact tables
 */
export interface DimensionKeyValidation {
  /**
   * Whether all dimension keys are valid
   */
  valid: boolean;

  /**
   * List of validation errors
   */
  errors: DimensionKeyError[];

  /**
   * Count of records with invalid keys
   */
  invalidRecordCount: number;

  /**
   * List of invalid key values by dimension
   */
  invalidKeysByDimension: Record<string, unknown[]>;
}

/**
 * Dimension Key Error
 *
 * @description Details of a dimension key validation error
 */
export interface DimensionKeyError {
  /**
   * Record index with invalid key
   */
  recordIndex: number;

  /**
   * Name of the dimension column
   */
  dimensionColumn: string;

  /**
   * Invalid key value
   */
  invalidKey: unknown;

  /**
   * Expected dimension table
   */
  dimensionTable: string;
}
