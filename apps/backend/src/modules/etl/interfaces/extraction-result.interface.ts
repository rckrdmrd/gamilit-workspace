/**
 * Extraction Result Interface
 *
 * @description Result structure returned from ETL extraction operations
 * @module etl/interfaces
 * @version 1.0.0
 * @since Sprint 2.2 - ETL Pipeline Extraction
 */

/**
 * ExtractionResult Interface
 *
 * @description Contains extracted data and metadata about the extraction operation.
 * Used to track extraction progress and enable incremental processing.
 *
 * @template T - The type of data being extracted
 *
 * @example
 * ```typescript
 * const result: ExtractionResult<ExerciseCompletion> = {
 *   data: [...extractedRecords],
 *   rowCount: 1000,
 *   extractedAt: new Date(),
 *   startTimestamp: lastExtractedTimestamp,
 *   endTimestamp: new Date(),
 *   hasMore: true,
 *   metadata: { batchNumber: 1, totalBatches: 5 },
 * };
 * ```
 */
export interface ExtractionResult<T> {
  /**
   * Extracted data records
   *
   * @description Array of extracted records of type T
   */
  data: T[];

  /**
   * Number of rows extracted in this batch
   *
   * @description Count of records in the data array
   */
  rowCount: number;

  /**
   * Timestamp when extraction was performed
   *
   * @description Timestamp marking when this extraction batch completed
   */
  extractedAt: Date;

  /**
   * Start timestamp of extraction window
   *
   * @description
   * For incremental: Last extracted timestamp (CDC marker)
   * For full: Configured start date
   */
  startTimestamp: Date;

  /**
   * End timestamp of extraction window
   *
   * @description
   * Upper bound timestamp for this extraction batch
   * Used as the next incremental start point
   */
  endTimestamp: Date;

  /**
   * Whether more records are available
   *
   * @description
   * Indicates if pagination should continue.
   * True if batch size was reached, false if all records extracted.
   */
  hasMore: boolean;

  /**
   * Extractor name that produced this result
   *
   * @description Identifies the source extractor for logging/tracking
   */
  extractorName?: string;

  /**
   * Source table(s) from which data was extracted
   *
   * @description Fully qualified table name(s)
   */
  sourceTables?: string[];

  /**
   * Extraction duration in milliseconds
   *
   * @description Time taken to complete this extraction batch
   */
  durationMs?: number;

  /**
   * Total records available (if known)
   *
   * @description
   * Total count of records matching criteria.
   * May not always be available for performance reasons.
   *
   * @optional
   */
  totalRecords?: number;

  /**
   * Current offset position
   *
   * @description Offset used for this extraction batch
   */
  offset?: number;

  /**
   * Additional metadata about the extraction
   *
   * @description
   * Custom metadata specific to the extractor.
   * Examples: batchNumber, error counts, warnings.
   *
   * @optional
   */
  metadata?: ExtractionMetadata;
}

/**
 * Extraction Metadata Interface
 *
 * @description Additional metadata about an extraction operation
 */
export interface ExtractionMetadata {
  /**
   * Current batch number in multi-batch extraction
   */
  batchNumber?: number;

  /**
   * Total number of batches (if known)
   */
  totalBatches?: number;

  /**
   * Number of records skipped (e.g., due to validation)
   */
  skippedRecords?: number;

  /**
   * Number of records with errors
   */
  errorRecords?: number;

  /**
   * Warning messages during extraction
   */
  warnings?: string[];

  /**
   * Query execution time in milliseconds
   */
  queryTimeMs?: number;

  /**
   * Whether this is a retry attempt
   */
  isRetry?: boolean;

  /**
   * Retry attempt number
   */
  retryAttempt?: number;

  /**
   * Schema version of extracted data
   */
  schemaVersion?: string;

  /**
   * Custom key-value metadata
   */
  custom?: Record<string, unknown>;
}

/**
 * Type for extraction status
 */
export type ExtractionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * Extraction Summary Interface
 *
 * @description Summary of a complete extraction run (all batches)
 */
export interface ExtractionSummary {
  /**
   * Extractor name
   */
  extractorName: string;

  /**
   * Total records extracted across all batches
   */
  totalRecordsExtracted: number;

  /**
   * Number of batches processed
   */
  batchesProcessed: number;

  /**
   * Overall extraction status
   */
  status: ExtractionStatus;

  /**
   * Start time of extraction
   */
  startedAt: Date;

  /**
   * End time of extraction
   */
  completedAt: Date;

  /**
   * Total duration in milliseconds
   */
  totalDurationMs: number;

  /**
   * Timestamp window extracted
   */
  timestampRange: {
    start: Date;
    end: Date;
  };

  /**
   * Error message if failed
   */
  errorMessage?: string;

  /**
   * Error stack trace if failed
   */
  errorStack?: string;
}
