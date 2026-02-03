/**
 * Loader Interface - ETL Pipeline Load Phase
 *
 * @description Defines the contract for all data loaders in the ETL pipeline.
 * Each loader is responsible for loading transformed data into a specific
 * data warehouse target table.
 *
 * @module ETL
 * @see TASK-2026-02-03 Sprint 2.4 - ETL Pipeline Carga
 */

import { LoadConfig, LoadResult, DimensionKeyError } from './load-result.interface';

/**
 * Generic Loader Interface
 *
 * @description Contract for all data loaders. Provides three loading strategies:
 * - `load`: Configurable load with specified mode
 * - `truncateAndLoad`: Full table replacement
 * - `upsert`: Insert or update based on key columns
 *
 * @template T - The type of data records being loaded
 */
export interface ILoader<T> {
  /**
   * Loads data into the target table with specified configuration
   *
   * @param data - Array of records to load
   * @param config - Load configuration options
   * @returns Promise with load result statistics
   */
  load(data: T[], config: LoadConfig): Promise<LoadResult>;

  /**
   * Truncates the target table and loads fresh data
   *
   * @description Use with caution - this removes all existing data
   * before inserting new records. Useful for full refreshes.
   *
   * @param data - Array of records to load
   * @returns Promise with load result statistics
   */
  truncateAndLoad(data: T[]): Promise<LoadResult>;

  /**
   * Performs upsert operation based on key columns
   *
   * @description Inserts new records or updates existing ones based on
   * the specified key columns using PostgreSQL ON CONFLICT clause.
   *
   * @param data - Array of records to upsert
   * @param keyColumns - Column names to use for conflict detection
   * @returns Promise with load result statistics
   */
  upsert(data: T[], keyColumns: string[]): Promise<LoadResult>;
}

/**
 * Dimension Loader Interface
 *
 * @description Extended interface for dimension table loaders.
 * Supports SCD (Slowly Changing Dimension) Type 2 operations.
 */
export interface IDimensionLoader<T> extends ILoader<T> {
  /**
   * Loads dimension data with SCD Type 2 logic
   *
   * @description Handles versioning of dimension records:
   * - Creates new version if attributes changed
   * - Updates `is_current` flag on previous version
   * - Manages `effective_from` and `effective_to` dates
   *
   * @param data - Array of dimension records
   * @param naturalKeyColumns - Business key columns for matching
   * @returns Promise with load result including version statistics
   */
  loadWithSCD2(data: T[], naturalKeyColumns: string[]): Promise<LoadResult>;
}

/**
 * Fact Loader Interface
 *
 * @description Extended interface for fact table loaders.
 * Facts are typically append-only and immutable.
 */
export interface IFactLoader<T> extends ILoader<T> {
  /**
   * Appends new fact records (immutable append-only)
   *
   * @description Facts are historical records and should not be modified.
   * This method only inserts new records, never updates existing ones.
   *
   * @param data - Array of fact records to append
   * @returns Promise with load result statistics
   */
  appendOnly(data: T[]): Promise<LoadResult>;

  /**
   * Validates referential integrity to dimensions
   *
   * @description Ensures all dimension keys in fact records
   * exist in their respective dimension tables before loading.
   *
   * @param data - Array of fact records to validate
   * @returns Promise with validation result
   */
  validateDimensionKeys(data: T[]): Promise<{ valid: boolean; errors: DimensionKeyError[] }>;
}
