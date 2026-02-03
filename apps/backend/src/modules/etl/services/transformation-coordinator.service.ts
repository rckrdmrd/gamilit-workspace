/**
 * Transformation Coordinator Service
 *
 * @description Orchestrates the ETL transformation pipeline.
 * Manages validation, transformation execution, retry logic,
 * and metrics collection across all transformers.
 *
 * @module etl/services
 * @since 2026-02-03
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  TransformationResult,
  TransformationStats,
  RejectedRecord,
} from '../interfaces';
import { ValidationResult, ValidationSummary } from '../interfaces/validation-result.interface';
import { ExerciseCompletionTransformer } from './transformers/exercise-completion.transformer';
import { StudentTransformer } from './transformers/student.transformer';
import { GamificationEventTransformer } from './transformers/gamification-event.transformer';
import { DailyProgressTransformer } from './transformers/daily-progress.transformer';
import { DataQualityValidator } from './validators/data-quality.validator';
import { DimensionLookupService } from './dimension-lookup.service';
import {
  TransformerType,
  TransformationConfigDto,
  TriggerTransformationDto,
} from '../dto/transformation-config.dto';
import {
  TransformationStatusEnum,
  TransformationStatusResponseDto,
  TransformerProgressDto,
  ValidationReportResponseDto,
} from '../dto/transformation-status.dto';

/**
 * Transformation Run State
 */
interface TransformationRunState {
  batchId: string;
  status: TransformationStatusEnum;
  startedAt: Date;
  completedAt?: Date;
  transformerProgress: Map<TransformerType, TransformerProgressDto>;
  errors: string[];
  lastValidationResult?: ValidationResult;
}

/**
 * TransformationCoordinatorService
 * @description Central orchestrator for all ETL transformations
 */
@Injectable()
export class TransformationCoordinatorService {
  private readonly logger = new Logger(TransformationCoordinatorService.name);

  // Current transformation state
  private currentRun: TransformationRunState | null = null;

  // Historical runs (limited to last 10)
  private runHistory: TransformationRunState[] = [];
  private readonly MAX_HISTORY = 10;

  // Retry configuration
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY_MS = 1000;

  constructor(
    private readonly exerciseCompletionTransformer: ExerciseCompletionTransformer,
    private readonly studentTransformer: StudentTransformer,
    private readonly gamificationEventTransformer: GamificationEventTransformer,
    private readonly dailyProgressTransformer: DailyProgressTransformer,
    private readonly dataQualityValidator: DataQualityValidator,
    private readonly dimensionLookup: DimensionLookupService,
  ) {}

  /**
   * Trigger a transformation pipeline
   * @param request - Transformation trigger request
   * @returns Batch ID and initial status
   */
  async triggerTransformation(
    request: TriggerTransformationDto,
  ): Promise<{ batchId: string; status: TransformationStatusEnum; message: string }> {
    // Check if transformation is already running
    if (this.currentRun && this.currentRun.status === TransformationStatusEnum.RUNNING) {
      return {
        batchId: this.currentRun.batchId,
        status: TransformationStatusEnum.RUNNING,
        message: 'Transformation already in progress',
      };
    }

    // Generate batch ID
    const batchId = this.generateBatchId(request.transformerType);

    // Initialize run state
    this.currentRun = {
      batchId,
      status: TransformationStatusEnum.RUNNING,
      startedAt: new Date(),
      transformerProgress: new Map(),
      errors: [],
    };

    // Initialize progress for requested transformer
    this.currentRun.transformerProgress.set(request.transformerType, {
      transformerType: request.transformerType,
      status: TransformationStatusEnum.IDLE,
      recordsProcessed: 0,
      totalRecords: 0,
      successCount: 0,
      failedCount: 0,
      progressPercentage: 0,
    });

    this.logger.log(`Transformation triggered: ${batchId}`);

    // Note: In production, this would be async/queue-based
    // For now, return immediately with pending status
    return {
      batchId,
      status: TransformationStatusEnum.RUNNING,
      message: `Transformation ${request.transformerType} started with batch ID ${batchId}`,
    };
  }

  /**
   * Execute exercise completion transformation
   */
  async transformExerciseCompletions<T>(
    data: T[],
    batchId: string,
    config?: Partial<TransformationConfigDto>,
  ): Promise<TransformationResult<unknown>> {
    return this.executeWithRetry(
      TransformerType.EXERCISE_COMPLETION,
      async () => {
        // Cast data to expected type
        const typedData = data as Parameters<typeof this.exerciseCompletionTransformer.transform>[0];
        return this.exerciseCompletionTransformer.transform(typedData, batchId);
      },
      batchId,
    );
  }

  /**
   * Execute student transformation
   */
  async transformStudents<T>(
    data: T[],
    batchId: string,
    config?: Partial<TransformationConfigDto>,
  ): Promise<TransformationResult<unknown>> {
    return this.executeWithRetry(
      TransformerType.STUDENT,
      async () => {
        const typedData = data as Parameters<typeof this.studentTransformer.transform>[0];
        return this.studentTransformer.transform(typedData, batchId);
      },
      batchId,
    );
  }

  /**
   * Execute gamification event transformation
   */
  async transformGamificationEvents<T>(
    data: T[],
    batchId: string,
    config?: Partial<TransformationConfigDto>,
  ): Promise<TransformationResult<unknown>> {
    return this.executeWithRetry(
      TransformerType.GAMIFICATION_EVENT,
      async () => {
        const typedData = data as Parameters<typeof this.gamificationEventTransformer.transform>[0];
        return this.gamificationEventTransformer.transform(typedData, batchId);
      },
      batchId,
    );
  }

  /**
   * Execute daily progress transformation
   */
  async transformDailyProgress<T>(
    data: T[],
    batchId: string,
    config?: Partial<TransformationConfigDto>,
  ): Promise<TransformationResult<unknown>> {
    return this.executeWithRetry(
      TransformerType.DAILY_PROGRESS,
      async () => {
        const typedData = data as Parameters<typeof this.dailyProgressTransformer.transform>[0];
        return this.dailyProgressTransformer.transform(typedData, batchId);
      },
      batchId,
    );
  }

  /**
   * Get current transformation status
   */
  getStatus(): TransformationStatusResponseDto {
    if (!this.currentRun) {
      return {
        overallStatus: TransformationStatusEnum.IDLE,
        currentBatchId: '',
        startedAt: new Date(),
        elapsedMs: 0,
        transformerProgress: [],
        totalRecordsProcessed: 0,
        totalSuccess: 0,
        totalFailed: 0,
      };
    }

    const elapsedMs = Date.now() - this.currentRun.startedAt.getTime();
    const progressArray = Array.from(this.currentRun.transformerProgress.values());

    const totals = progressArray.reduce(
      (acc, p) => ({
        records: acc.records + p.recordsProcessed,
        success: acc.success + p.successCount,
        failed: acc.failed + p.failedCount,
      }),
      { records: 0, success: 0, failed: 0 },
    );

    return {
      overallStatus: this.currentRun.status,
      currentBatchId: this.currentRun.batchId,
      startedAt: this.currentRun.startedAt,
      completedAt: this.currentRun.completedAt,
      elapsedMs,
      transformerProgress: progressArray,
      totalRecordsProcessed: totals.records,
      totalSuccess: totals.success,
      totalFailed: totals.failed,
      lastError: this.currentRun.errors[this.currentRun.errors.length - 1],
    };
  }

  /**
   * Get validation report
   */
  getValidationReport(
    transformerType?: TransformerType,
    batchId?: string,
    includeDetails = false,
  ): ValidationReportResponseDto {
    const validationResult = this.currentRun?.lastValidationResult;

    if (!validationResult) {
      return {
        generatedAt: new Date(),
        dataQualityScore: 100,
        totalRecords: 0,
        validRecords: 0,
        errorRecords: 0,
        warningRecords: 0,
        recommendation: 'proceed',
        issuesByCategory: {},
        topProblematicFields: [],
        duplicateCount: 0,
        orphanReferenceCount: 0,
      };
    }

    const response: ValidationReportResponseDto = {
      generatedAt: validationResult.validatedAt,
      dataQualityScore: validationResult.summary.dataQualityScore,
      totalRecords: validationResult.totalRecords,
      validRecords: validationResult.validRecords,
      errorRecords: validationResult.errorRecords,
      warningRecords: validationResult.warningRecords,
      recommendation: validationResult.summary.recommendation,
      issuesByCategory: validationResult.summary.issuesByCategory as Record<string, number>,
      topProblematicFields: validationResult.summary.topProblematicFields,
      duplicateCount: validationResult.duplicates.length,
      orphanReferenceCount: validationResult.referenceChecks.reduce(
        (sum, rc) => sum + rc.orphanReferences,
        0,
      ),
    };

    if (includeDetails) {
      response.detailedIssues = validationResult.issues.map((issue) => ({
        field: issue.field,
        severity: issue.severity,
        category: issue.category,
        message: issue.message,
        rowIndex: issue.rowIndex,
      }));
    }

    return response;
  }

  /**
   * Clear dimension caches
   */
  clearCaches(): void {
    this.dimensionLookup.clearAllCaches();
    this.logger.log('Dimension caches cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): Record<string, { size: number; hitRate: number }> {
    return this.dimensionLookup.getCacheStats();
  }

  // ==========================================
  // PRIVATE METHODS
  // ==========================================

  /**
   * Execute transformation with retry logic
   */
  private async executeWithRetry<T>(
    transformerType: TransformerType,
    executor: () => Promise<TransformationResult<T>>,
    batchId: string,
  ): Promise<TransformationResult<T>> {
    let lastError: Error | null = null;
    let attempt = 0;

    // Update progress to running
    this.updateProgress(transformerType, {
      status: TransformationStatusEnum.RUNNING,
    });

    while (attempt < this.MAX_RETRIES) {
      try {
        const result = await executor();

        // Update progress on success
        this.updateProgress(transformerType, {
          status: TransformationStatusEnum.COMPLETED,
          recordsProcessed: result.stats.inputCount,
          totalRecords: result.stats.inputCount,
          successCount: result.stats.outputCount,
          failedCount: result.stats.rejectedCount,
          progressPercentage: 100,
        });

        // Log transformation metrics
        this.logTransformationMetrics(transformerType, result.stats);

        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        attempt++;

        this.logger.warn(
          `Transformation attempt ${attempt}/${this.MAX_RETRIES} failed: ${lastError.message}`,
        );

        if (attempt < this.MAX_RETRIES) {
          await this.delay(this.RETRY_DELAY_MS * attempt);
        }
      }
    }

    // All retries failed
    this.updateProgress(transformerType, {
      status: TransformationStatusEnum.FAILED,
      errorMessage: lastError?.message || 'Unknown error',
    });

    this.currentRun?.errors.push(lastError?.message || 'Transformation failed');

    throw lastError || new Error('Transformation failed after all retries');
  }

  /**
   * Update transformer progress
   */
  private updateProgress(
    transformerType: TransformerType,
    updates: Partial<TransformerProgressDto>,
  ): void {
    if (!this.currentRun) return;

    const current = this.currentRun.transformerProgress.get(transformerType) || {
      transformerType,
      status: TransformationStatusEnum.IDLE,
      recordsProcessed: 0,
      totalRecords: 0,
      successCount: 0,
      failedCount: 0,
      progressPercentage: 0,
    };

    this.currentRun.transformerProgress.set(transformerType, {
      ...current,
      ...updates,
    });

    // Check if all transformers are complete
    const allComplete = Array.from(this.currentRun.transformerProgress.values()).every(
      (p) =>
        p.status === TransformationStatusEnum.COMPLETED ||
        p.status === TransformationStatusEnum.FAILED,
    );

    if (allComplete) {
      const anyFailed = Array.from(this.currentRun.transformerProgress.values()).some(
        (p) => p.status === TransformationStatusEnum.FAILED,
      );

      this.currentRun.status = anyFailed
        ? TransformationStatusEnum.FAILED
        : TransformationStatusEnum.COMPLETED;
      this.currentRun.completedAt = new Date();

      // Archive to history
      this.archiveRun();
    }
  }

  /**
   * Archive current run to history
   */
  private archiveRun(): void {
    if (this.currentRun) {
      this.runHistory.unshift({ ...this.currentRun });
      if (this.runHistory.length > this.MAX_HISTORY) {
        this.runHistory.pop();
      }
    }
  }

  /**
   * Log transformation metrics
   */
  private logTransformationMetrics(
    transformerType: TransformerType,
    stats: TransformationStats,
  ): void {
    this.logger.log(
      `[${transformerType}] Batch ${stats.batchId}: ` +
        `Input=${stats.inputCount}, Output=${stats.outputCount}, ` +
        `Rejected=${stats.rejectedCount}, Duration=${stats.durationMs}ms`,
    );
  }

  /**
   * Generate batch ID
   */
  private generateBatchId(transformerType: TransformerType): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    return `${transformerType}-${timestamp}-${random}`;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
