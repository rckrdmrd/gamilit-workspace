/**
 * Dimension Loader Service - ETL Pipeline Load Phase
 *
 * @description Abstract base class for dimension table loaders.
 * Provides SCD Type 2 logic, upsert, and surrogate key management.
 *
 * @module ETL
 * @see TASK-2026-02-03 Sprint 2.4 - ETL Pipeline Carga
 */

import { Logger } from '@nestjs/common';
import { DataSource, QueryRunner } from 'typeorm';
import { LoaderBaseService } from './loader-base.service';
import {
  IDimensionLoader,
  LoadConfig,
  LoadResult,
  LoadMode,
  SCDLoadResult,
} from '../../interfaces';

/**
 * SCD Type 2 Configuration
 *
 * @description Configuration for Slowly Changing Dimension Type 2 operations
 */
export interface SCD2Config {
  /**
   * Natural key columns (business keys)
   */
  naturalKeyColumns: string[];

  /**
   * Columns to track for changes
   */
  trackedColumns: string[];

  /**
   * Effective date column name
   * @default 'effective_from'
   */
  effectiveFromColumn: string;

  /**
   * Expiration date column name
   * @default 'effective_to'
   */
  effectiveToColumn: string;

  /**
   * Current flag column name
   * @default 'is_current'
   */
  isCurrentColumn: string;

  /**
   * Surrogate key column name
   * @default 'id'
   */
  surrogateKeyColumn: string;
}

/**
 * Default SCD2 Configuration
 */
export const DEFAULT_SCD2_CONFIG: Partial<SCD2Config> = {
  effectiveFromColumn: 'effective_from',
  effectiveToColumn: 'effective_to',
  isCurrentColumn: 'is_current',
  surrogateKeyColumn: 'id',
};

/**
 * Abstract Dimension Loader Service
 *
 * @description Base class for dimension table loaders with:
 * - SCD Type 2 versioning logic
 * - Upsert with change detection
 * - Surrogate key generation
 * - is_current flag management
 *
 * @template T - The type of dimension records being loaded
 */
export abstract class DimensionLoaderService<T extends Record<string, any>>
  extends LoaderBaseService<T>
  implements IDimensionLoader<T>
{
  /**
   * Get SCD2 configuration
   * Override in subclass to specify SCD behavior
   */
  protected abstract getSCD2Config(): SCD2Config;

  /**
   * Get columns that indicate a change (excluding natural keys)
   */
  protected getChangeDetectionColumns(): string[] {
    const config = this.getSCD2Config();
    return config.trackedColumns;
  }

  /**
   * Load dimension data with SCD Type 2 logic
   *
   * @description Handles versioning:
   * - Creates new version if attributes changed
   * - Updates is_current flag on previous version
   * - Manages effective_from and effective_to dates
   */
  async loadWithSCD2(
    data: T[],
    naturalKeyColumns: string[],
  ): Promise<SCDLoadResult> {
    const startTime = Date.now();
    const result: SCDLoadResult = {
      rowsInserted: 0,
      rowsUpdated: 0,
      rowsRejected: 0,
      loadedAt: new Date(),
      duration: 0,
      success: false,
      targetTable: this.targetTable,
      targetSchema: this.targetSchema,
      loadMode: LoadMode.UPSERT,
      batchesProcessed: 0,
      averageRecordsPerSecond: 0,
      newRecords: 0,
      versionedRecords: 0,
      unchangedRecords: 0,
      expiredRecords: 0,
    };

    if (data.length === 0) {
      this.logger.log(`No dimension data to load for ${this.targetTable}`);
      result.success = true;
      result.duration = Date.now() - startTime;
      return result;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      const config = this.getSCD2Config();

      for (const record of data) {
        const scdResult = await this.processSCD2Record(
          queryRunner,
          record,
          naturalKeyColumns,
          config,
        );

        if (scdResult.isNew) {
          result.newRecords++;
          result.rowsInserted++;
        } else if (scdResult.hasChanged) {
          result.versionedRecords++;
          result.rowsInserted++; // New version inserted
          result.expiredRecords++; // Old version expired
        } else {
          result.unchangedRecords++;
        }
        result.batchesProcessed++;
      }

      await queryRunner.commitTransaction();
      result.success = true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      result.success = false;
      result.errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `SCD2 load failed for ${this.targetTable}: ${result.errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
    } finally {
      await queryRunner.release();
    }

    result.duration = Date.now() - startTime;
    result.averageRecordsPerSecond =
      result.duration > 0 ? (data.length / result.duration) * 1000 : 0;

    this.logSCD2Result(result);
    return result;
  }

  /**
   * Process a single record with SCD Type 2 logic
   */
  protected async processSCD2Record(
    queryRunner: QueryRunner,
    record: T,
    naturalKeyColumns: string[],
    config: SCD2Config,
  ): Promise<{ isNew: boolean; hasChanged: boolean }> {
    const fullTableName = `${this.targetSchema}.${this.targetTable}`;

    // Build WHERE clause for natural key lookup
    const whereConditions = naturalKeyColumns
      .map((col, idx) => `${col} = $${idx + 1}`)
      .join(' AND ');
    const naturalKeyValues = naturalKeyColumns.map((col) => record[col]);

    // Find current version
    const currentRecords = await queryRunner.query(
      `SELECT * FROM ${fullTableName}
       WHERE ${whereConditions} AND ${config.isCurrentColumn} = true`,
      naturalKeyValues,
    );

    if (currentRecords.length === 0) {
      // No existing record - insert new
      await this.insertNewDimensionRecord(queryRunner, record, config);
      return { isNew: true, hasChanged: false };
    }

    const currentRecord = currentRecords[0];

    // Check for changes in tracked columns
    const hasChanged = this.detectChanges(record, currentRecord, config);

    if (!hasChanged) {
      // No changes - do nothing
      return { isNew: false, hasChanged: false };
    }

    // Has changes - expire current version and insert new version
    await this.expireCurrentVersion(
      queryRunner,
      currentRecord[config.surrogateKeyColumn],
      config,
    );
    await this.insertNewDimensionRecord(queryRunner, record, config);

    return { isNew: false, hasChanged: true };
  }

  /**
   * Detect changes between new and current record
   */
  protected detectChanges(
    newRecord: T,
    currentRecord: Record<string, unknown>,
    config: SCD2Config,
  ): boolean {
    for (const column of config.trackedColumns) {
      const newValue = newRecord[column];
      const currentValue = currentRecord[column];

      // Handle different types of comparison
      if (typeof newValue === 'object' && newValue !== null) {
        if (JSON.stringify(newValue) !== JSON.stringify(currentValue)) {
          return true;
        }
      } else if (newValue !== currentValue) {
        return true;
      }
    }
    return false;
  }

  /**
   * Insert new dimension record with SCD2 columns
   */
  protected async insertNewDimensionRecord(
    queryRunner: QueryRunner,
    record: T,
    config: SCD2Config,
  ): Promise<void> {
    const columns = this.getInsertColumns();
    const values = this.mapRecordToValues(record);
    const fullTableName = `${this.targetSchema}.${this.targetTable}`;

    // Add SCD2 columns if not already in the columns
    const scd2Columns = [
      config.effectiveFromColumn,
      config.effectiveToColumn,
      config.isCurrentColumn,
    ];

    const finalColumns = [...columns];
    const finalValues = [...values];

    for (const scd2Col of scd2Columns) {
      if (!columns.includes(scd2Col)) {
        finalColumns.push(scd2Col);
        if (scd2Col === config.effectiveFromColumn) {
          finalValues.push(new Date());
        } else if (scd2Col === config.effectiveToColumn) {
          finalValues.push(null);
        } else if (scd2Col === config.isCurrentColumn) {
          finalValues.push(true);
        }
      }
    }

    const placeholders = finalValues.map((_, i) => `$${i + 1}`).join(', ');
    await queryRunner.query(
      `INSERT INTO ${fullTableName} (${finalColumns.join(', ')}) VALUES (${placeholders})`,
      finalValues,
    );
  }

  /**
   * Expire current version (set is_current = false and effective_to = now)
   */
  protected async expireCurrentVersion(
    queryRunner: QueryRunner,
    surrogateKey: unknown,
    config: SCD2Config,
  ): Promise<void> {
    const fullTableName = `${this.targetSchema}.${this.targetTable}`;

    await queryRunner.query(
      `UPDATE ${fullTableName}
       SET ${config.isCurrentColumn} = false,
           ${config.effectiveToColumn} = NOW(),
           updated_at = NOW()
       WHERE ${config.surrogateKeyColumn} = $1`,
      [surrogateKey],
    );
  }

  /**
   * Simple upsert (non-SCD) for dimensions that don't need versioning
   */
  async simpleUpsert(
    data: T[],
    naturalKeyColumns: string[],
  ): Promise<LoadResult> {
    return this.upsert(data, naturalKeyColumns);
  }

  /**
   * Log SCD2 result summary
   */
  protected logSCD2Result(result: SCDLoadResult): void {
    const status = result.success ? 'completed' : 'failed';
    this.logger.log(
      `SCD2 load ${status} for ${this.targetSchema}.${this.targetTable}: ` +
        `new=${result.newRecords}, versioned=${result.versionedRecords}, ` +
        `unchanged=${result.unchangedRecords}, expired=${result.expiredRecords}, ` +
        `duration=${result.duration}ms`,
    );

    if (result.errorMessage) {
      this.logger.error(`SCD2 load error: ${result.errorMessage}`);
    }
  }
}
