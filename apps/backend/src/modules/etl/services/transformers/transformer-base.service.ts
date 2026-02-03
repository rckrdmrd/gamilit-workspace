/**
 * Transformer Base Service
 *
 * @description Abstract base class for all ETL transformers.
 * Provides common functionality for data transformation including
 * validation, error handling, and statistics collection.
 *
 * @module etl/services/transformers
 * @since 2026-02-03
 */

import { Logger } from '@nestjs/common';
import {
  ITransformer,
  TransformationResult,
  TransformationStats,
  RejectedRecord,
  TransformerConfig,
  DEFAULT_TRANSFORMER_CONFIG,
} from '../../interfaces';
import { ValidationResult } from '../../interfaces/validation-result.interface';

/**
 * TransformerBaseService
 * @description Abstract base class implementing common transformer functionality
 * @template TSource - Source data type (OLTP)
 * @template TTarget - Target data type (DW)
 */
export abstract class TransformerBaseService<TSource, TTarget>
  implements ITransformer<TSource, TTarget>
{
  protected readonly logger: Logger;
  protected readonly config: TransformerConfig;

  constructor(
    protected readonly transformerName: string,
    config?: Partial<TransformerConfig>,
  ) {
    this.logger = new Logger(transformerName);
    this.config = { ...DEFAULT_TRANSFORMER_CONFIG, ...config };
  }

  /**
   * Get transformer name
   */
  getName(): string {
    return this.transformerName;
  }

  /**
   * Transform source records to target format
   * @param data - Array of source records
   * @param batchId - Unique batch identifier
   * @returns Promise with transformation result
   */
  async transform(data: TSource[], batchId: string): Promise<TransformationResult<TTarget>> {
    const startTime = Date.now();
    const transformed: TTarget[] = [];
    const rejected: RejectedRecord[] = [];

    this.logger.log(`Starting transformation for batch ${batchId} with ${data.length} records`);

    // Validate data before transformation
    const validationResult = this.validate(data);
    if (!validationResult.isValid) {
      this.logger.warn(
        `Validation found ${validationResult.issues.length} issues in batch ${batchId}`,
      );
    }

    // Process records in batches for memory efficiency
    for (let i = 0; i < data.length; i += this.config.batchSize) {
      const batch = data.slice(i, i + this.config.batchSize);

      for (const record of batch) {
        try {
          // Pre-transformation validation
          const preValidation = this.validateRecord(record);
          if (!preValidation.isValid) {
            rejected.push({
              originalData: record as unknown as Record<string, unknown>,
              reason: preValidation.reason,
              errorCode: preValidation.errorCode,
              field: preValidation.field,
              rejectedAt: new Date(),
            });
            continue;
          }

          // Transform the record
          const transformedRecord = await this.transformRecord(record);

          if (transformedRecord !== null) {
            transformed.push(transformedRecord);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          this.logger.error(`Error transforming record: ${errorMessage}`);
          rejected.push({
            originalData: record as unknown as Record<string, unknown>,
            reason: errorMessage,
            errorCode: 'TRANSFORM_ERROR',
            rejectedAt: new Date(),
          });
        }
      }

      // Log progress for large batches
      if (data.length > this.config.batchSize) {
        const progress = Math.min(100, ((i + batch.length) / data.length) * 100);
        this.logger.log(`Batch ${batchId} progress: ${progress.toFixed(1)}%`);
      }
    }

    const stats: TransformationStats = {
      inputCount: data.length,
      outputCount: transformed.length,
      rejectedCount: rejected.length,
      transformedAt: new Date(),
      durationMs: Date.now() - startTime,
      batchId,
    };

    this.logger.log(
      `Completed transformation for batch ${batchId}: ` +
        `${stats.outputCount} transformed, ${stats.rejectedCount} rejected ` +
        `in ${stats.durationMs}ms`,
    );

    return { transformed, rejected, stats };
  }

  /**
   * Validate source data before transformation
   * @param data - Array of source records
   * @returns Validation result with issues found
   */
  abstract validate(data: TSource[]): ValidationResult;

  /**
   * Transform a single record
   * @param record - Source record to transform
   * @returns Transformed record or null if should be skipped
   */
  protected abstract transformRecord(record: TSource): Promise<TTarget | null>;

  /**
   * Validate a single record before transformation
   * @param record - Source record to validate
   * @returns Pre-validation result
   */
  protected abstract validateRecord(record: TSource): PreValidationResult;

  // ==========================================
  // HELPER METHODS (Pure Functions)
  // ==========================================

  /**
   * Convert timestamp to UTC
   * @param date - Date to convert
   * @returns Date in UTC
   */
  protected toUTC(date: Date | string | null | undefined): Date | null {
    if (!date) return null;
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return null;
    return new Date(d.toISOString());
  }

  /**
   * Normalize score to 0-100 scale
   * @param score - Raw score
   * @param maxScore - Maximum possible score
   * @returns Normalized score (0-100)
   */
  protected normalizeScore(score: number | null | undefined, maxScore: number): number {
    if (score === null || score === undefined || maxScore === 0) return 0;
    const normalized = (score / maxScore) * 100;
    return Math.max(0, Math.min(100, Math.round(normalized * 100) / 100));
  }

  /**
   * Trim and title-case a string
   * @param str - String to process
   * @returns Processed string
   */
  protected normalizeString(str: string | null | undefined): string {
    if (!str) return '';
    return str
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  /**
   * Generate date key in YYYYMMDD format
   * @param date - Date to convert
   * @returns Numeric date key
   */
  protected getDateKey(date: Date): number {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return parseInt(`${year}${month}${day}`, 10);
  }

  /**
   * Generate time key in HHMM format
   * @param date - Date containing time
   * @returns Numeric time key
   */
  protected getTimeKey(date: Date): number {
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    return parseInt(`${hours}${minutes}`, 10);
  }

  /**
   * Validate that a value is positive
   * @param value - Value to check
   * @returns True if positive
   */
  protected isPositive(value: number | null | undefined): boolean {
    return value !== null && value !== undefined && value >= 0;
  }

  /**
   * Validate that a value is within range
   * @param value - Value to check
   * @param min - Minimum value
   * @param max - Maximum value
   * @returns True if within range
   */
  protected isInRange(
    value: number | null | undefined,
    min: number,
    max: number,
  ): boolean {
    return value !== null && value !== undefined && value >= min && value <= max;
  }

  /**
   * Clamp a value to a range
   * @param value - Value to clamp
   * @param min - Minimum value
   * @param max - Maximum value
   * @returns Clamped value
   */
  protected clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Get sensible default for null value
   * @param value - Value that may be null
   * @param defaultValue - Default to use if null
   * @returns Value or default
   */
  protected withDefault<T>(value: T | null | undefined, defaultValue: T): T {
    return value ?? defaultValue;
  }

  /**
   * Check if date falls within school calendar (business day)
   * @param date - Date to check
   * @returns True if business day
   */
  protected isSchoolDay(date: Date): boolean {
    const dayOfWeek = date.getUTCDay();
    // Exclude Saturday (6) and Sunday (0)
    return dayOfWeek !== 0 && dayOfWeek !== 6;
  }

  /**
   * Get academic year for a date (August start)
   * @param date - Date to check
   * @returns Academic year (e.g., 2025 for Aug 2025 - Jul 2026)
   */
  protected getAcademicYear(date: Date): number {
    const month = date.getUTCMonth();
    const year = date.getUTCFullYear();
    // Academic year starts in August (month 7)
    return month >= 7 ? year : year - 1;
  }

  /**
   * Generate a unique batch ID
   * @returns Batch ID string
   */
  protected generateBatchId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${this.transformerName}-${timestamp}-${random}`;
  }
}

/**
 * Pre-Validation Result
 * @description Result of validating a single record before transformation
 */
export interface PreValidationResult {
  /** Whether the record is valid for transformation */
  isValid: boolean;
  /** Reason for rejection if invalid */
  reason: string;
  /** Error code for categorization */
  errorCode: string;
  /** Field that caused the issue */
  field?: string;
}

/**
 * Create a valid pre-validation result
 */
export const validResult = (): PreValidationResult => ({
  isValid: true,
  reason: '',
  errorCode: '',
});

/**
 * Create an invalid pre-validation result
 */
export const invalidResult = (
  reason: string,
  errorCode: string,
  field?: string,
): PreValidationResult => ({
  isValid: false,
  reason,
  errorCode,
  field,
});
