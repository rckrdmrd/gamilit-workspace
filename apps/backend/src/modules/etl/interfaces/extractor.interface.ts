/**
 * Extractor Interface
 *
 * @description Core interface for all ETL extractors implementing CDC (Change Data Capture)
 * @module etl/interfaces
 * @version 1.0.0
 * @since Sprint 2.2 - ETL Pipeline Extraction
 *
 * @see ExtractionConfig - Configuration for extraction operations
 * @see ExtractionResult - Result structure from extraction operations
 */

import { ExtractionConfig } from './extraction-config.interface';
import { ExtractionResult } from './extraction-result.interface';

/**
 * IExtractor Interface
 *
 * @description Generic interface for data extractors.
 * All extractors must implement this interface to ensure consistent
 * extraction behavior across different source tables.
 *
 * Features:
 * - CDC (Change Data Capture) using updated_at timestamps
 * - Incremental extraction support
 * - Batch processing with configurable sizes
 * - State management for tracking extraction progress
 *
 * @template T - The type of data being extracted
 *
 * @example
 * ```typescript
 * class MyExtractor implements IExtractor<MyDataType> {
 *   async extract(config: ExtractionConfig): Promise<ExtractionResult<MyDataType>> {
 *     // Implementation
 *   }
 * }
 * ```
 */
export interface IExtractor<T> {
  /**
   * Extract data from the source based on configuration
   *
   * @param config - Extraction configuration including date range, batch size, etc.
   * @returns Promise resolving to extraction result with data and metadata
   *
   * @throws {Error} If extraction fails due to database connectivity or query errors
   */
  extract(config: ExtractionConfig): Promise<ExtractionResult<T>>;

  /**
   * Get the timestamp of the last successful extraction
   *
   * @returns Promise resolving to the last extracted timestamp, or null if no previous extraction
   *
   * @description
   * Used for incremental extraction to determine the starting point.
   * Returns null on first run, indicating a full extraction is needed.
   */
  getLastExtractedTimestamp(): Promise<Date | null>;

  /**
   * Set the timestamp of the last successful extraction
   *
   * @param timestamp - The timestamp to record as the last extraction point
   * @returns Promise that resolves when the timestamp is persisted
   *
   * @description
   * Called after successful extraction to update the extraction state.
   * Used for CDC to track incremental changes.
   */
  setLastExtractedTimestamp(timestamp: Date): Promise<void>;

  /**
   * Get the unique name identifier for this extractor
   *
   * @returns The extractor name used for logging and state management
   *
   * @example 'exercise-completion-extractor'
   */
  getExtractorName(): string;

  /**
   * Get the source table name(s) being extracted
   *
   * @returns Array of source table names
   *
   * @example ['progress_tracking.exercise_completions', 'educational_content.exercises']
   */
  getSourceTables(): string[];

  /**
   * Validate extraction configuration
   *
   * @param config - Configuration to validate
   * @returns True if configuration is valid
   * @throws {Error} If configuration is invalid
   */
  validateConfig(config: ExtractionConfig): boolean;
}
