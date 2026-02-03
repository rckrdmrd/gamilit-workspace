/**
 * Base Loader Service - ETL Pipeline Load Phase
 *
 * @description Abstract base class providing common load logic for all loaders.
 * Implements bulk insert, upsert, transaction management, and progress tracking.
 *
 * @module ETL
 * @see TASK-2026-02-03 Sprint 2.4 - ETL Pipeline Carga
 */

import { Logger } from '@nestjs/common';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import {
  ILoader,
  LoadConfig,
  LoadResult,
  LoadMode,
  LoadProgress,
  RejectedRow,
} from '../../interfaces';

/**
 * Abstract Base Loader Service
 *
 * @description Provides common load functionality for all loaders including:
 * - Bulk insert operations
 * - Upsert with ON CONFLICT handling
 * - Transaction management
 * - Batch processing with progress tracking
 * - Error handling and rejection logging
 *
 * @template T - The type of records being loaded
 */
export abstract class LoaderBaseService<T extends Record<string, any>>
  implements ILoader<T>
{
  protected abstract readonly logger: Logger;
  protected abstract readonly dataSource: DataSource;
  protected abstract readonly targetSchema: string;
  protected abstract readonly targetTable: string;
  protected abstract readonly defaultBatchSize: number;

  /**
   * Get columns for insert (override in subclass if needed)
   */
  protected abstract getInsertColumns(): string[];

  /**
   * Map a record to values for insert (override in subclass)
   */
  protected abstract mapRecordToValues(record: T): unknown[];

  /**
   * Load data with specified configuration
   */
  async load(data: T[], config: LoadConfig): Promise<LoadResult> {
    const startTime = Date.now();
    const result: LoadResult = {
      rowsInserted: 0,
      rowsUpdated: 0,
      rowsRejected: 0,
      loadedAt: new Date(),
      duration: 0,
      success: false,
      targetTable: this.targetTable,
      targetSchema: this.targetSchema,
      loadMode: config.mode,
      batchesProcessed: 0,
      averageRecordsPerSecond: 0,
      rejectedRows: [],
    };

    if (data.length === 0) {
      this.logger.log(`No data to load for ${this.targetTable}`);
      result.success = true;
      result.duration = Date.now() - startTime;
      return result;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      if (config.useTransaction !== false) {
        await queryRunner.startTransaction();
      }

      switch (config.mode) {
        case LoadMode.TRUNCATE_LOAD:
          await this.executeTruncateAndLoad(queryRunner, data, config, result);
          break;
        case LoadMode.UPSERT:
          await this.executeUpsert(
            queryRunner,
            data,
            config.keyColumns || [],
            config,
            result,
          );
          break;
        case LoadMode.APPEND:
        default:
          await this.executeAppend(queryRunner, data, config, result);
          break;
      }

      if (config.useTransaction !== false) {
        await queryRunner.commitTransaction();
      }

      result.success = true;
    } catch (error) {
      if (config.useTransaction !== false) {
        await queryRunner.rollbackTransaction();
      }

      result.success = false;
      result.errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Load failed for ${this.targetTable}: ${result.errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
    } finally {
      await queryRunner.release();
    }

    result.duration = Date.now() - startTime;
    result.averageRecordsPerSecond =
      result.duration > 0
        ? ((result.rowsInserted + result.rowsUpdated) / result.duration) * 1000
        : 0;

    this.logLoadResult(result);
    return result;
  }

  /**
   * Truncate table and load fresh data
   */
  async truncateAndLoad(data: T[]): Promise<LoadResult> {
    return this.load(data, {
      mode: LoadMode.TRUNCATE_LOAD,
      batchSize: this.defaultBatchSize,
      validateConstraints: false,
      targetTable: this.targetTable,
      targetSchema: this.targetSchema,
    });
  }

  /**
   * Upsert data based on key columns
   */
  async upsert(data: T[], keyColumns: string[]): Promise<LoadResult> {
    return this.load(data, {
      mode: LoadMode.UPSERT,
      batchSize: this.defaultBatchSize,
      validateConstraints: true,
      targetTable: this.targetTable,
      targetSchema: this.targetSchema,
      keyColumns,
    });
  }

  /**
   * Execute truncate and load operation
   */
  protected async executeTruncateAndLoad(
    queryRunner: QueryRunner,
    data: T[],
    config: LoadConfig,
    result: LoadResult,
  ): Promise<void> {
    const fullTableName = `${this.targetSchema}.${this.targetTable}`;

    this.logger.log(`Truncating ${fullTableName}...`);
    await queryRunner.query(`TRUNCATE TABLE ${fullTableName} CASCADE`);

    await this.executeAppend(queryRunner, data, config, result);
  }

  /**
   * Execute append operation (bulk insert)
   */
  protected async executeAppend(
    queryRunner: QueryRunner,
    data: T[],
    config: LoadConfig,
    result: LoadResult,
  ): Promise<void> {
    const batchSize = config.batchSize || this.defaultBatchSize;
    const totalBatches = Math.ceil(data.length / batchSize);
    const columns = this.getInsertColumns();
    const fullTableName = `${this.targetSchema}.${this.targetTable}`;

    this.logger.log(
      `Loading ${data.length} records into ${fullTableName} in ${totalBatches} batches`,
    );

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * batchSize;
      const end = Math.min(start + batchSize, data.length);
      const batch = data.slice(start, end);

      try {
        const insertedCount = await this.bulkInsert(
          queryRunner,
          batch,
          columns,
          fullTableName,
          config,
          result,
          start,
        );
        result.rowsInserted += insertedCount;
        result.batchesProcessed++;

        // Report progress
        if (config.onProgress) {
          const progress: LoadProgress = {
            totalRecords: data.length,
            processedRecords: end,
            currentBatch: batchIndex + 1,
            totalBatches,
            percentComplete: Math.round((end / data.length) * 100),
          };
          config.onProgress(progress);
        }
      } catch (error) {
        if (config.continueOnError) {
          this.logger.warn(
            `Batch ${batchIndex + 1} failed, continuing: ${error}`,
          );
          // Mark all rows in batch as rejected
          batch.forEach((record, idx) => {
            result.rejectedRows?.push({
              rowIndex: start + idx,
              data: record,
              reason:
                error instanceof Error ? error.message : 'Batch insert failed',
            });
          });
          result.rowsRejected += batch.length;
        } else {
          throw error;
        }
      }
    }
  }

  /**
   * Execute upsert operation
   */
  protected async executeUpsert(
    queryRunner: QueryRunner,
    data: T[],
    keyColumns: string[],
    config: LoadConfig,
    result: LoadResult,
  ): Promise<void> {
    const batchSize = config.batchSize || this.defaultBatchSize;
    const totalBatches = Math.ceil(data.length / batchSize);
    const columns = this.getInsertColumns();
    const fullTableName = `${this.targetSchema}.${this.targetTable}`;
    const updateColumns = config.updateColumns || columns.filter((c) => !keyColumns.includes(c));

    this.logger.log(
      `Upserting ${data.length} records into ${fullTableName} in ${totalBatches} batches`,
    );

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * batchSize;
      const end = Math.min(start + batchSize, data.length);
      const batch = data.slice(start, end);

      try {
        const { inserted, updated } = await this.bulkUpsert(
          queryRunner,
          batch,
          columns,
          keyColumns,
          updateColumns,
          fullTableName,
          config,
          result,
          start,
        );
        result.rowsInserted += inserted;
        result.rowsUpdated += updated;
        result.batchesProcessed++;

        // Report progress
        if (config.onProgress) {
          const progress: LoadProgress = {
            totalRecords: data.length,
            processedRecords: end,
            currentBatch: batchIndex + 1,
            totalBatches,
            percentComplete: Math.round((end / data.length) * 100),
          };
          config.onProgress(progress);
        }
      } catch (error) {
        if (config.continueOnError) {
          this.logger.warn(
            `Batch ${batchIndex + 1} failed, continuing: ${error}`,
          );
          batch.forEach((record, idx) => {
            result.rejectedRows?.push({
              rowIndex: start + idx,
              data: record,
              reason:
                error instanceof Error ? error.message : 'Batch upsert failed',
            });
          });
          result.rowsRejected += batch.length;
        } else {
          throw error;
        }
      }
    }
  }

  /**
   * Perform bulk insert
   */
  protected async bulkInsert(
    queryRunner: QueryRunner,
    batch: T[],
    columns: string[],
    fullTableName: string,
    config: LoadConfig,
    result: LoadResult,
    startIndex: number,
  ): Promise<number> {
    const { sql, params } = this.buildInsertSQL(batch, columns, fullTableName);

    const queryResult = await queryRunner.query(sql, params);
    return Array.isArray(queryResult) ? queryResult.length : batch.length;
  }

  /**
   * Perform bulk upsert
   */
  protected async bulkUpsert(
    queryRunner: QueryRunner,
    batch: T[],
    columns: string[],
    keyColumns: string[],
    updateColumns: string[],
    fullTableName: string,
    config: LoadConfig,
    result: LoadResult,
    startIndex: number,
  ): Promise<{ inserted: number; updated: number }> {
    const { sql, params } = this.buildUpsertSQL(
      batch,
      columns,
      keyColumns,
      updateColumns,
      fullTableName,
    );

    const queryResult = await queryRunner.query(sql, params);

    // PostgreSQL doesn't easily distinguish inserts from updates in ON CONFLICT
    // We estimate based on the result
    const affectedRows = Array.isArray(queryResult)
      ? queryResult.length
      : batch.length;
    return { inserted: affectedRows, updated: 0 };
  }

  /**
   * Build INSERT SQL statement
   */
  protected buildInsertSQL(
    batch: T[],
    columns: string[],
    fullTableName: string,
  ): { sql: string; params: unknown[] } {
    const params: unknown[] = [];
    const valueRows: string[] = [];

    batch.forEach((record, rowIdx) => {
      const values = this.mapRecordToValues(record);
      const placeholders = values.map((_, colIdx) => {
        params.push(values[colIdx]);
        return `$${params.length}`;
      });
      valueRows.push(`(${placeholders.join(', ')})`);
    });

    const sql = `
      INSERT INTO ${fullTableName} (${columns.join(', ')})
      VALUES ${valueRows.join(', ')}
      RETURNING *
    `;

    return { sql, params };
  }

  /**
   * Build UPSERT SQL statement with ON CONFLICT
   */
  protected buildUpsertSQL(
    batch: T[],
    columns: string[],
    keyColumns: string[],
    updateColumns: string[],
    fullTableName: string,
  ): { sql: string; params: unknown[] } {
    const params: unknown[] = [];
    const valueRows: string[] = [];

    batch.forEach((record) => {
      const values = this.mapRecordToValues(record);
      const placeholders = values.map((_, colIdx) => {
        params.push(values[colIdx]);
        return `$${params.length}`;
      });
      valueRows.push(`(${placeholders.join(', ')})`);
    });

    const updateSet = updateColumns
      .map((col) => `${col} = EXCLUDED.${col}`)
      .join(', ');

    const sql = `
      INSERT INTO ${fullTableName} (${columns.join(', ')})
      VALUES ${valueRows.join(', ')}
      ON CONFLICT (${keyColumns.join(', ')})
      DO UPDATE SET ${updateSet}, updated_at = NOW()
      RETURNING *
    `;

    return { sql, params };
  }

  /**
   * Log load result summary
   */
  protected logLoadResult(result: LoadResult): void {
    const status = result.success ? 'completed' : 'failed';
    this.logger.log(
      `Load ${status} for ${this.targetSchema}.${this.targetTable}: ` +
        `inserted=${result.rowsInserted}, updated=${result.rowsUpdated}, ` +
        `rejected=${result.rowsRejected}, duration=${result.duration}ms, ` +
        `rate=${result.averageRecordsPerSecond.toFixed(2)} rec/sec`,
    );

    if (result.errorMessage) {
      this.logger.error(`Load error: ${result.errorMessage}`);
    }

    if (result.rejectedRows && result.rejectedRows.length > 0) {
      this.logger.warn(
        `${result.rejectedRows.length} rows rejected. First 5:`,
        result.rejectedRows.slice(0, 5),
      );
    }
  }

  /**
   * Log load operation to etl_load_log table
   */
  async logToLoadLog(
    loaderName: string,
    result: LoadResult,
  ): Promise<void> {
    try {
      await this.dataSource.query(
        `
        INSERT INTO ${this.targetSchema}.etl_load_log (
          loader_name, target_table, started_at, completed_at,
          rows_inserted, rows_updated, rows_rejected,
          status, error_message
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
        [
          loaderName,
          `${this.targetSchema}.${this.targetTable}`,
          new Date(result.loadedAt.getTime() - result.duration),
          result.loadedAt,
          result.rowsInserted,
          result.rowsUpdated,
          result.rowsRejected,
          result.success ? 'completed' : 'failed',
          result.errorMessage || null,
        ],
      );
    } catch (error) {
      this.logger.error(`Failed to log to etl_load_log: ${error}`);
    }
  }
}
