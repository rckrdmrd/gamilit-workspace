/**
 * Base Extractor Service
 *
 * @description Abstract base class implementing common extraction logic for all extractors
 * @module etl/services
 * @version 1.0.0
 * @since Sprint 2.2 - ETL Pipeline Extraction
 *
 * Features:
 * - CDC (Change Data Capture) using updated_at timestamps
 * - Batch processing with configurable size
 * - Retry logic with exponential backoff
 * - Extraction metrics logging
 * - Error handling and recovery
 */

import { Logger } from '@nestjs/common';
import { DataSource, QueryRunner, SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import {
  IExtractor,
  ExtractionConfig,
  ExtractionResult,
  ExtractionMetadata,
  DEFAULT_EXTRACTION_CONFIG,
} from '../interfaces';

/**
 * Retry configuration for extraction operations
 */
export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
};

/**
 * ExtractorBaseService
 *
 * @description Abstract base class for all ETL extractors.
 * Provides common functionality including:
 * - Configuration validation
 * - CDC timestamp management
 * - Batch processing
 * - Retry logic
 * - Metrics collection
 *
 * @template T - The type of data being extracted
 *
 * @example
 * ```typescript
 * class MyExtractor extends ExtractorBaseService<MyEntity> {
 *   protected buildQuery(
 *     queryRunner: QueryRunner,
 *     config: ExtractionConfig,
 *   ): SelectQueryBuilder<MyEntity> {
 *     // Build query specific to this extractor
 *   }
 * }
 * ```
 */
export abstract class ExtractorBaseService<T extends ObjectLiteral> implements IExtractor<T> {
  protected readonly logger: Logger;
  protected lastExtractedTimestamp: Date | null = null;
  protected readonly retryConfig: RetryConfig;

  /**
   * Constructor
   *
   * @param dataSource - TypeORM DataSource for database operations
   * @param extractorName - Unique name for this extractor
   * @param sourceTables - Array of source table names
   * @param retryConfig - Optional retry configuration
   */
  constructor(
    protected readonly dataSource: DataSource,
    protected readonly extractorName: string,
    protected readonly sourceTables: string[],
    retryConfig?: Partial<RetryConfig>,
  ) {
    this.logger = new Logger(`ETL:${extractorName}`);
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  }

  /**
   * Get extractor name
   */
  getExtractorName(): string {
    return this.extractorName;
  }

  /**
   * Get source tables
   */
  getSourceTables(): string[] {
    return this.sourceTables;
  }

  /**
   * Validate extraction configuration
   *
   * @param config - Configuration to validate
   * @returns True if valid
   * @throws Error if invalid
   */
  validateConfig(config: ExtractionConfig): boolean {
    if (config.batchSize < 100 || config.batchSize > 10000) {
      throw new Error(`Invalid batch size: ${config.batchSize}. Must be between 100 and 10000.`);
    }

    if (config.startDate && config.endDate && config.startDate > config.endDate) {
      throw new Error('Start date must be before end date');
    }

    if (!config.incremental && !config.startDate) {
      throw new Error('Start date is required for full extraction');
    }

    return true;
  }

  /**
   * Get the last extracted timestamp
   */
  async getLastExtractedTimestamp(): Promise<Date | null> {
    return this.lastExtractedTimestamp;
  }

  /**
   * Set the last extracted timestamp
   */
  async setLastExtractedTimestamp(timestamp: Date): Promise<void> {
    this.lastExtractedTimestamp = timestamp;
    this.logger.debug(`Updated last extracted timestamp to: ${timestamp.toISOString()}`);
  }

  /**
   * Main extraction method
   *
   * @param config - Extraction configuration
   * @returns Extraction result with data and metadata
   */
  async extract(config: ExtractionConfig): Promise<ExtractionResult<T>> {
    const mergedConfig = this.mergeConfig(config);
    this.validateConfig(mergedConfig);

    const startTime = Date.now();
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      this.logger.log(`Starting extraction for ${this.extractorName}`);
      this.logger.debug(`Config: ${JSON.stringify(mergedConfig)}`);

      const result = await this.executeWithRetry(async () => {
        return this.performExtraction(queryRunner, mergedConfig);
      });

      const duration = Date.now() - startTime;
      this.logger.log(
        `Extraction completed: ${result.rowCount} rows in ${duration}ms`,
      );

      return {
        ...result,
        extractorName: this.extractorName,
        sourceTables: this.sourceTables,
        durationMs: duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        `Extraction failed after ${duration}ms: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Perform the actual extraction
   *
   * @param queryRunner - TypeORM query runner
   * @param config - Merged extraction configuration
   * @returns Extraction result
   */
  protected async performExtraction(
    queryRunner: QueryRunner,
    config: ExtractionConfig,
  ): Promise<ExtractionResult<T>> {
    // Determine timestamp range
    const startTimestamp = await this.determineStartTimestamp(config);
    const endTimestamp = config.endDate ?? new Date();

    this.logger.debug(
      `Extraction window: ${startTimestamp.toISOString()} to ${endTimestamp.toISOString()}`,
    );

    // Build and execute query
    const queryStartTime = Date.now();
    const query = this.buildQuery(queryRunner, config, startTimestamp, endTimestamp);

    // Apply pagination
    query
      .skip(config.offset ?? 0)
      .take(config.batchSize);

    const data = await query.getRawMany() as T[];
    const queryTime = Date.now() - queryStartTime;

    // Determine if there are more records
    const hasMore = data.length === config.batchSize;

    // Create result metadata
    const metadata: ExtractionMetadata = {
      queryTimeMs: queryTime,
      custom: {
        incremental: config.incremental,
        offset: config.offset ?? 0,
      },
    };

    return {
      data,
      rowCount: data.length,
      extractedAt: new Date(),
      startTimestamp,
      endTimestamp,
      hasMore,
      metadata,
    };
  }

  /**
   * Determine the start timestamp for extraction
   *
   * @param config - Extraction configuration
   * @returns Start timestamp
   */
  protected async determineStartTimestamp(config: ExtractionConfig): Promise<Date> {
    if (config.startDate) {
      return config.startDate;
    }

    if (config.incremental) {
      const lastTimestamp = await this.getLastExtractedTimestamp();
      if (lastTimestamp) {
        return lastTimestamp;
      }
      // Default to 24 hours ago for first incremental run
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      return oneDayAgo;
    }

    // Default to 30 days ago for full extraction
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return thirtyDaysAgo;
  }

  /**
   * Execute operation with retry logic
   *
   * @param operation - Async operation to execute
   * @returns Operation result
   */
  protected async executeWithRetry<R>(operation: () => Promise<R>): Promise<R> {
    let lastError: Error | undefined;
    let delay = this.retryConfig.initialDelayMs;

    for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < this.retryConfig.maxRetries) {
          this.logger.warn(
            `Attempt ${attempt}/${this.retryConfig.maxRetries} failed: ${lastError.message}. Retrying in ${delay}ms...`,
          );
          await this.sleep(delay);
          delay = Math.min(
            delay * this.retryConfig.backoffMultiplier,
            this.retryConfig.maxDelayMs,
          );
        }
      }
    }

    throw lastError ?? new Error('Extraction failed after all retries');
  }

  /**
   * Merge configuration with defaults
   *
   * @param config - User provided configuration
   * @returns Merged configuration
   */
  protected mergeConfig(config: ExtractionConfig): ExtractionConfig {
    return {
      ...DEFAULT_EXTRACTION_CONFIG,
      ...config,
    } as ExtractionConfig;
  }

  /**
   * Sleep for a specified duration
   *
   * @param ms - Milliseconds to sleep
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Build the extraction query
   *
   * @description Abstract method to be implemented by concrete extractors.
   * Should build a TypeORM query for extracting data from source tables.
   *
   * @param queryRunner - TypeORM query runner
   * @param config - Extraction configuration
   * @param startTimestamp - Start of extraction window
   * @param endTimestamp - End of extraction window
   * @returns SelectQueryBuilder configured for extraction
   */
  protected abstract buildQuery(
    queryRunner: QueryRunner,
    config: ExtractionConfig,
    startTimestamp: Date,
    endTimestamp: Date,
  ): SelectQueryBuilder<T>;

  /**
   * Transform raw database rows to domain objects
   *
   * @description Optional method to transform raw query results.
   * Override in concrete extractors if transformation is needed.
   *
   * @param rawData - Raw data from database query
   * @returns Transformed data
   */
  protected transformData(rawData: unknown[]): T[] {
    return rawData as T[];
  }
}
