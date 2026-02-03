/**
 * Extraction Configuration Interface
 *
 * @description Configuration options for ETL extraction operations
 * @module etl/interfaces
 * @version 1.0.0
 * @since Sprint 2.2 - ETL Pipeline Extraction
 */

/**
 * ExtractionConfig Interface
 *
 * @description Configuration for controlling extraction behavior.
 * Supports both full and incremental extraction modes.
 *
 * @example
 * ```typescript
 * // Incremental extraction
 * const config: ExtractionConfig = {
 *   incremental: true,
 *   batchSize: 1000,
 *   tableName: 'exercise_completions',
 * };
 *
 * // Full extraction with date range
 * const config: ExtractionConfig = {
 *   incremental: false,
 *   startDate: new Date('2026-01-01'),
 *   endDate: new Date('2026-01-31'),
 *   batchSize: 5000,
 *   tableName: 'exercise_completions',
 * };
 * ```
 */
export interface ExtractionConfig {
  /**
   * Whether to perform incremental extraction
   *
   * @description
   * - true: Extract only records modified since last extraction (CDC)
   * - false: Extract all records within the specified date range
   *
   * @default true
   */
  incremental: boolean;

  /**
   * Start date for extraction range
   *
   * @description
   * - For incremental: Overrides last extracted timestamp if provided
   * - For full extraction: Required start boundary
   *
   * @optional For incremental mode (uses last extracted timestamp)
   */
  startDate?: Date;

  /**
   * End date for extraction range
   *
   * @description
   * - Upper bound for extraction
   * - Defaults to current timestamp if not provided
   *
   * @optional Defaults to now()
   */
  endDate?: Date;

  /**
   * Number of records to extract per batch
   *
   * @description
   * Controls memory usage and database load.
   * Larger batches are more efficient but use more memory.
   *
   * @default 1000
   * @minimum 100
   * @maximum 10000
   */
  batchSize: number;

  /**
   * Source table name being extracted
   *
   * @description
   * Fully qualified table name (schema.table) being extracted.
   * Used for logging and state management.
   *
   * @example 'progress_tracking.exercise_completions'
   */
  tableName: string;

  /**
   * Offset for pagination/resumption
   *
   * @description
   * Used to resume extraction from a specific point.
   * Useful for recovering from failed extractions.
   *
   * @default 0
   * @optional
   */
  offset?: number;

  /**
   * Maximum number of records to extract
   *
   * @description
   * Limits total records extracted regardless of batch size.
   * Useful for testing or partial extractions.
   *
   * @optional No limit if not specified
   */
  maxRecords?: number;

  /**
   * Include soft-deleted records
   *
   * @description
   * Whether to include records marked as deleted.
   *
   * @default false
   */
  includeDeleted?: boolean;

  /**
   * Filter by tenant ID
   *
   * @description
   * Extract only records belonging to a specific tenant.
   * Useful for multi-tenant data isolation.
   *
   * @optional All tenants if not specified
   */
  tenantId?: string;

  /**
   * Additional filter conditions
   *
   * @description
   * Custom WHERE clause conditions as key-value pairs.
   *
   * @example { classroom_id: 'uuid-123', status: 'active' }
   * @optional
   */
  filters?: Record<string, unknown>;

  /**
   * Columns to extract
   *
   * @description
   * Specific columns to extract. If not provided, extracts all columns.
   *
   * @optional All columns if not specified
   */
  columns?: string[];

  /**
   * Order by column
   *
   * @description
   * Column to order results by for consistent pagination.
   *
   * @default 'updated_at'
   */
  orderBy?: string;

  /**
   * Order direction
   *
   * @description
   * Sort direction for ordering.
   *
   * @default 'ASC'
   */
  orderDirection?: 'ASC' | 'DESC';
}

/**
 * Default extraction configuration values
 */
export const DEFAULT_EXTRACTION_CONFIG: Partial<ExtractionConfig> = {
  incremental: true,
  batchSize: 1000,
  offset: 0,
  includeDeleted: false,
  orderBy: 'updated_at',
  orderDirection: 'ASC',
};
