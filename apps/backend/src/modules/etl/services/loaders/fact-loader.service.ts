/**
 * Fact Loader Service - ETL Pipeline Load Phase
 *
 * @description Abstract base class for fact table loaders.
 * Provides append-only loading and dimension key validation.
 *
 * @module ETL
 * @see TASK-2026-02-03 Sprint 2.4 - ETL Pipeline Carga
 */

import { Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { LoaderBaseService } from './loader-base.service';
import {
  IFactLoader,
  LoadConfig,
  LoadResult,
  LoadMode,
  DimensionKeyValidation,
  DimensionKeyError,
} from '../../interfaces';

/**
 * Dimension Reference Definition
 *
 * @description Defines a dimension table reference for validation
 */
export interface DimensionReference {
  /**
   * Column name in the fact table
   */
  factColumn: string;

  /**
   * Target dimension table (schema.table)
   */
  dimensionTable: string;

  /**
   * Column in dimension table to validate against
   */
  dimensionColumn: string;

  /**
   * Whether the reference is required (non-null)
   */
  required: boolean;
}

/**
 * Abstract Fact Loader Service
 *
 * @description Base class for fact table loaders with:
 * - Append-only mode (facts are immutable)
 * - Dimension key validation
 * - Partition awareness (if implemented)
 *
 * @template T - The type of fact records being loaded
 */
export abstract class FactLoaderService<T extends Record<string, any>>
  extends LoaderBaseService<T>
  implements IFactLoader<T>
{
  /**
   * Define dimension references for validation
   * Override in subclass to specify which dimensions to validate
   */
  protected abstract getDimensionReferences(): DimensionReference[];

  /**
   * Append-only mode for facts (immutable)
   *
   * @description Facts are historical records and should not be modified.
   * This method only inserts new records.
   */
  async appendOnly(data: T[]): Promise<LoadResult> {
    this.logger.log(
      `Appending ${data.length} fact records to ${this.targetTable}`,
    );

    return this.load(data, {
      mode: LoadMode.APPEND,
      batchSize: this.defaultBatchSize,
      validateConstraints: true,
      targetTable: this.targetTable,
      targetSchema: this.targetSchema,
    });
  }

  /**
   * Load with dimension key validation
   *
   * @description Validates all dimension keys before loading
   */
  async loadWithValidation(
    data: T[],
    config?: Partial<LoadConfig>,
  ): Promise<LoadResult> {
    // First validate dimension keys
    const validation = await this.validateDimensionKeys(data);

    if (!validation.valid) {
      this.logger.error(
        `Dimension key validation failed: ${validation.errors.length} errors`,
      );

      // If continue on error, filter out invalid records
      if (config?.continueOnError) {
        const invalidIndices = new Set(
          validation.errors.map((e) => e.recordIndex),
        );
        const validData = data.filter((_, idx) => !invalidIndices.has(idx));

        this.logger.warn(
          `Continuing with ${validData.length} valid records (${data.length - validData.length} rejected)`,
        );

        const result = await this.appendOnly(validData);
        result.rowsRejected += data.length - validData.length;
        result.rejectedRows = validation.errors.map((err) => ({
          rowIndex: err.recordIndex,
          data: data[err.recordIndex],
          reason: `Invalid dimension key: ${err.dimensionColumn}=${err.invalidKey}`,
        }));
        return result;
      }

      // Otherwise return error result
      return {
        rowsInserted: 0,
        rowsUpdated: 0,
        rowsRejected: validation.invalidRecordCount,
        loadedAt: new Date(),
        duration: 0,
        success: false,
        errorMessage: `Dimension key validation failed: ${validation.errors.length} errors`,
        targetTable: this.targetTable,
        targetSchema: this.targetSchema,
        loadMode: LoadMode.APPEND,
        batchesProcessed: 0,
        averageRecordsPerSecond: 0,
      };
    }

    return this.appendOnly(data);
  }

  /**
   * Validate dimension keys exist in dimension tables
   */
  async validateDimensionKeys(data: T[]): Promise<DimensionKeyValidation> {
    const errors: DimensionKeyError[] = [];
    const invalidKeysByDimension: Record<string, unknown[]> = {};
    const dimensionRefs = this.getDimensionReferences();

    for (const ref of dimensionRefs) {
      // Collect unique keys from data
      const keysToValidate = new Set<unknown>();
      const keyToRecordIndices = new Map<unknown, number[]>();

      data.forEach((record, idx) => {
        const keyValue = record[ref.factColumn];
        if (keyValue !== null && keyValue !== undefined) {
          keysToValidate.add(keyValue);
          if (!keyToRecordIndices.has(keyValue)) {
            keyToRecordIndices.set(keyValue, []);
          }
          keyToRecordIndices.get(keyValue)!.push(idx);
        } else if (ref.required) {
          errors.push({
            recordIndex: idx,
            dimensionColumn: ref.factColumn,
            invalidKey: null,
            dimensionTable: ref.dimensionTable,
          });
        }
      });

      if (keysToValidate.size === 0) continue;

      // Query dimension table for valid keys
      const keysArray = Array.from(keysToValidate);
      const validKeys = await this.getValidDimensionKeys(
        ref.dimensionTable,
        ref.dimensionColumn,
        keysArray,
      );

      const validKeySet = new Set(validKeys);

      // Find invalid keys
      keysArray.forEach((key) => {
        if (!validKeySet.has(key)) {
          if (!invalidKeysByDimension[ref.factColumn]) {
            invalidKeysByDimension[ref.factColumn] = [];
          }
          invalidKeysByDimension[ref.factColumn].push(key);

          // Add error for each record with this invalid key
          const recordIndices = keyToRecordIndices.get(key) || [];
          recordIndices.forEach((recordIndex) => {
            errors.push({
              recordIndex,
              dimensionColumn: ref.factColumn,
              invalidKey: key,
              dimensionTable: ref.dimensionTable,
            });
          });
        }
      });
    }

    const uniqueInvalidRecords = new Set(errors.map((e) => e.recordIndex));

    return {
      valid: errors.length === 0,
      errors,
      invalidRecordCount: uniqueInvalidRecords.size,
      invalidKeysByDimension,
    };
  }

  /**
   * Query dimension table for valid keys
   */
  protected async getValidDimensionKeys(
    dimensionTable: string,
    dimensionColumn: string,
    keys: unknown[],
  ): Promise<unknown[]> {
    if (keys.length === 0) return [];

    try {
      const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
      const result = await this.dataSource.query(
        `SELECT ${dimensionColumn} FROM ${dimensionTable} WHERE ${dimensionColumn} IN (${placeholders})`,
        keys,
      );
      return result.map((row: Record<string, unknown>) => row[dimensionColumn]);
    } catch (error) {
      this.logger.error(
        `Failed to validate dimension keys for ${dimensionTable}: ${error}`,
      );
      throw error;
    }
  }

  /**
   * Get partition key from record (override if partition-aware)
   */
  protected getPartitionKey(record: T): string | null {
    return null;
  }

  /**
   * Check if partition exists (override if partition-aware)
   */
  protected async ensurePartitionExists(partitionKey: string): Promise<void> {
    // Override in subclass for partition management
  }
}
