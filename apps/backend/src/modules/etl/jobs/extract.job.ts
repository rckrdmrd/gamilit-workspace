/**
 * Extract Job
 *
 * @description Scheduled job for automatic ETL extraction
 * @module etl/jobs
 * @version 1.0.0
 * @since Sprint 2.2 - ETL Pipeline Extraction
 *
 * Features:
 * - Configurable schedule via environment variables
 * - Automatic incremental extraction
 * - Error handling and logging
 * - Manual trigger support via API
 */

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { ExtractionCoordinatorService } from '../services/extraction-coordinator.service';
import { ExtractorType, ExtractionMode } from '../dto';

/**
 * Extract Job Status Interface
 */
export interface ExtractJobStatus {
  name: string;
  schedule: string;
  nextRun: string | null;
  isRunning: boolean;
  lastRun: Date | null;
  lastStatus: 'success' | 'failed' | 'never_run';
  description: string;
}

/**
 * ExtractJob
 *
 * @description Scheduled job that triggers ETL extraction at configured intervals.
 * Default schedule is hourly, configurable via ETL_EXTRACTION_SCHEDULE env var.
 */
@Injectable()
export class ExtractJob {
  private readonly logger = new Logger(ExtractJob.name);
  private isRunning = false;
  private lastRun: Date | null = null;
  private lastStatus: 'success' | 'failed' | 'never_run' = 'never_run';

  constructor(
    private readonly extractionCoordinator: ExtractionCoordinatorService,
    private readonly configService: ConfigService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  /**
   * Scheduled extraction job
   *
   * @description Runs at the configured schedule (default: every hour)
   * Executes incremental extraction for all extractors
   *
   * Schedule controlled by ETL_EXTRACTION_SCHEDULE env var
   * Default: '0 * * * *' (every hour at minute 0)
   */
  @Cron(CronExpression.EVERY_HOUR, {
    name: 'etl-extraction',
    timeZone: 'UTC',
  })
  async handleScheduledExtraction(): Promise<void> {
    const jobName = 'etl-extraction';
    const startTime = Date.now();

    // Check if job is disabled
    const enabled = this.configService.get<boolean>('ETL_EXTRACTION_ENABLED', true);
    if (!enabled) {
      this.logger.debug(`[CRON:${jobName}] Job is disabled, skipping...`);
      return;
    }

    // Check if already running
    if (this.isRunning) {
      this.logger.warn(`[CRON:${jobName}] Previous extraction still running, skipping...`);
      return;
    }

    try {
      this.isRunning = true;
      this.lastRun = new Date();

      this.logger.log(`[CRON:${jobName}] Starting scheduled extraction...`);
      this.logger.log(`[CRON:${jobName}] Execution time: ${new Date().toISOString()}`);

      // Get batch size from config
      const batchSize = this.configService.get<number>('ETL_EXTRACTION_BATCH_SIZE', 1000);

      // Trigger incremental extraction for all extractors
      const job = await this.extractionCoordinator.triggerExtraction(
        ExtractorType.ALL,
        ExtractionMode.INCREMENTAL,
        { batchSize },
      );

      // Wait for job to complete (poll status)
      await this.waitForJobCompletion(job.jobId, 300000); // 5 minute timeout

      const duration = Date.now() - startTime;
      this.lastStatus = 'success';

      this.logger.log(`[CRON:${jobName}] Extraction completed successfully`);
      this.logger.log(`[CRON:${jobName}] Job ID: ${job.jobId}`);
      this.logger.log(`[CRON:${jobName}] Total duration: ${duration}ms (${(duration / 1000).toFixed(2)}s)`);
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      this.lastStatus = 'failed';

      this.logger.error(
        `[CRON:${jobName}] Extraction failed after ${duration}ms:`,
        error instanceof Error ? error.message : error,
      );
      this.logger.error(
        `[CRON:${jobName}] Error stack:`,
        error instanceof Error ? error.stack : 'No stack available',
      );
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Wait for job completion with timeout
   *
   * @param jobId - Job ID to wait for
   * @param timeoutMs - Maximum wait time in milliseconds
   */
  private async waitForJobCompletion(jobId: string, timeoutMs: number): Promise<void> {
    const startTime = Date.now();
    const pollInterval = 5000; // 5 seconds

    while (Date.now() - startTime < timeoutMs) {
      const status = this.extractionCoordinator.getCurrentStatus();

      if (!status || status.jobId !== jobId) {
        // Job completed or different job running
        return;
      }

      if (status.status === 'completed') {
        return;
      }

      if (status.status === 'failed') {
        throw new Error(`Extraction job failed: ${status.errorMessage}`);
      }

      if (status.status === 'cancelled') {
        throw new Error('Extraction job was cancelled');
      }

      // Wait before next poll
      await this.sleep(pollInterval);
    }

    throw new Error(`Extraction job timed out after ${timeoutMs}ms`);
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get job status
   *
   * @returns Current job status information
   */
  getJobStatus(): ExtractJobStatus {
    const schedule = this.configService.get<string>(
      'ETL_EXTRACTION_SCHEDULE',
      '0 * * * * (Every hour)',
    );

    return {
      name: 'etl-extraction',
      schedule,
      nextRun: this.getNextRunTime(),
      isRunning: this.isRunning,
      lastRun: this.lastRun,
      lastStatus: this.lastStatus,
      description: 'Automated ETL extraction job - extracts data from OLTP sources',
    };
  }

  /**
   * Check if job is currently running
   */
  isJobRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Calculate next run time
   */
  private getNextRunTime(): string | null {
    try {
      const now = new Date();
      const next = new Date(now);

      // Default to next hour
      next.setMinutes(0, 0, 0);
      next.setHours(next.getHours() + 1);

      return next.toISOString();
    } catch {
      return null;
    }
  }

  /**
   * Manually trigger extraction (called via API)
   *
   * @description Allows manual triggering of extraction outside the schedule
   */
  async triggerManual(
    extractorType: ExtractorType = ExtractorType.ALL,
    mode: ExtractionMode = ExtractionMode.INCREMENTAL,
    options?: {
      startDate?: Date;
      endDate?: Date;
      batchSize?: number;
      tenantId?: string;
    },
  ) {
    this.logger.log(`[MANUAL] Triggering manual extraction: ${extractorType}`);

    return this.extractionCoordinator.triggerExtraction(
      extractorType,
      mode,
      options,
    );
  }
}
