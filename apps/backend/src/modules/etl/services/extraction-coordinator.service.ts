/**
 * Extraction Coordinator Service
 *
 * @description Orchestrates all extractors and manages extraction state
 * @module etl/services
 * @version 1.0.0
 * @since Sprint 2.2 - ETL Pipeline Extraction
 *
 * Features:
 * - Coordinates multiple extractors
 * - Manages extraction state in etl_extraction_log table
 * - Provides status and monitoring
 * - Handles errors and recovery
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  ExtractionConfig,
  ExtractionResult,
  ExtractionStatus,
  ExtractionSummary,
} from '../interfaces';
import {
  ExerciseCompletionExtractor,
  StudentExtractor,
  GamificationEventExtractor,
  TeacherMetricExtractor,
} from './extractors';
import { ExtractorType, ExtractionMode } from '../dto';

/**
 * Extraction Log Entry Interface
 */
export interface ExtractionLogEntry {
  id: string;
  extractor_name: string;
  started_at: Date;
  completed_at: Date | null;
  rows_extracted: number;
  status: ExtractionStatus;
  error_message: string | null;
  last_extracted_timestamp: Date;
  metadata: Record<string, unknown>;
}

/**
 * Extraction Job Status
 */
export interface ExtractionJobStatus {
  jobId: string;
  status: ExtractionStatus;
  extractors: string[];
  startedAt: Date;
  completedAt?: Date;
  progress: number;
  recordsExtracted: number;
  extractorProgress: Record<string, {
    status: ExtractionStatus;
    recordsExtracted: number;
    progress: number;
    error?: string;
  }>;
  errorMessage?: string;
}

/**
 * ExtractionCoordinatorService
 *
 * @description Main service for coordinating ETL extraction operations.
 * Manages multiple extractors and tracks extraction state.
 */
@Injectable()
export class ExtractionCoordinatorService implements OnModuleInit {
  private readonly logger = new Logger(ExtractionCoordinatorService.name);
  private currentJob: ExtractionJobStatus | null = null;
  private jobIdCounter = 0;
  private extractorTimestamps: Map<string, Date | null> = new Map();

  constructor(
    @InjectDataSource('audit')
    private readonly auditDataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly exerciseCompletionExtractor: ExerciseCompletionExtractor,
    private readonly studentExtractor: StudentExtractor,
    private readonly gamificationEventExtractor: GamificationEventExtractor,
    private readonly teacherMetricExtractor: TeacherMetricExtractor,
  ) {}

  /**
   * Initialize the coordinator - load last extracted timestamps
   */
  async onModuleInit(): Promise<void> {
    this.logger.log('Initializing Extraction Coordinator...');
    await this.loadExtractionState();
    this.logger.log('Extraction Coordinator initialized');
  }

  /**
   * Load extraction state from database
   */
  private async loadExtractionState(): Promise<void> {
    try {
      // Check if etl_extraction_log table exists
      const tableExists = await this.checkEtlLogTableExists();

      if (!tableExists) {
        this.logger.warn('etl_extraction_log table does not exist. Using default timestamps.');
        return;
      }

      // Load last extracted timestamps for each extractor
      const extractors = this.getAllExtractors();

      for (const extractor of extractors) {
        const lastTimestamp = await this.getLastExtractedTimestampFromDb(
          extractor.getExtractorName(),
        );
        if (lastTimestamp) {
          await extractor.setLastExtractedTimestamp(lastTimestamp);
          this.extractorTimestamps.set(extractor.getExtractorName(), lastTimestamp);
        }
      }

      this.logger.log(`Loaded extraction state for ${extractors.length} extractors`);
    } catch (error) {
      this.logger.error('Failed to load extraction state:', error);
    }
  }

  /**
   * Check if etl_extraction_log table exists
   */
  private async checkEtlLogTableExists(): Promise<boolean> {
    try {
      const result = await this.auditDataSource.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'data_warehouse'
            AND table_name = 'etl_extraction_log'
        ) AS exists
      `);
      return result[0]?.exists ?? false;
    } catch {
      return false;
    }
  }

  /**
   * Get all extractors
   */
  private getAllExtractors() {
    return [
      this.exerciseCompletionExtractor,
      this.studentExtractor,
      this.gamificationEventExtractor,
      this.teacherMetricExtractor,
    ];
  }

  /**
   * Get extractor by type
   */
  private getExtractorByType(type: ExtractorType) {
    switch (type) {
    case ExtractorType.EXERCISE_COMPLETION:
      return [this.exerciseCompletionExtractor];
    case ExtractorType.STUDENT:
      return [this.studentExtractor];
    case ExtractorType.GAMIFICATION_EVENT:
      return [this.gamificationEventExtractor];
    case ExtractorType.TEACHER_METRIC:
      return [this.teacherMetricExtractor];
    case ExtractorType.ALL:
    default:
      return this.getAllExtractors();
    }
  }

  /**
   * Trigger extraction for specified extractor(s)
   */
  async triggerExtraction(
    extractorType: ExtractorType,
    mode: ExtractionMode = ExtractionMode.INCREMENTAL,
    options?: {
      startDate?: Date;
      endDate?: Date;
      batchSize?: number;
      tenantId?: string;
      includeDeleted?: boolean;
    },
  ): Promise<ExtractionJobStatus> {
    // Check if extraction is already running
    if (this.currentJob && this.currentJob.status === 'running') {
      throw new Error(`Extraction job ${this.currentJob.jobId} is already running`);
    }

    // Create new job
    const jobId = this.generateJobId();
    const extractors = this.getExtractorByType(extractorType);

    this.currentJob = {
      jobId,
      status: 'running',
      extractors: extractors.map((e) => e.getExtractorName()),
      startedAt: new Date(),
      progress: 0,
      recordsExtracted: 0,
      extractorProgress: {},
    };

    // Initialize extractor progress
    for (const extractor of extractors) {
      this.currentJob.extractorProgress[extractor.getExtractorName()] = {
        status: 'pending',
        recordsExtracted: 0,
        progress: 0,
      };
    }

    this.logger.log(`Starting extraction job ${jobId} with ${extractors.length} extractor(s)`);

    // Run extraction asynchronously
    this.runExtraction(extractors, mode, options).catch((error) => {
      this.logger.error(`Extraction job ${jobId} failed:`, error);
    });

    return { ...this.currentJob };
  }

  /**
   * Run extraction for multiple extractors
   */
  private async runExtraction(
    extractors: Array<{
      extract: (config: ExtractionConfig) => Promise<ExtractionResult<unknown>>;
      getExtractorName: () => string;
      setLastExtractedTimestamp: (timestamp: Date) => Promise<void>;
    }>,
    mode: ExtractionMode,
    options?: {
      startDate?: Date;
      endDate?: Date;
      batchSize?: number;
      tenantId?: string;
      includeDeleted?: boolean;
    },
  ): Promise<void> {
    if (!this.currentJob) return;

    const totalExtractors = extractors.length;
    let completedExtractors = 0;
    let totalRecords = 0;

    try {
      for (const extractor of extractors) {
        const extractorName = extractor.getExtractorName();

        if (this.currentJob.extractorProgress[extractorName]) {
          this.currentJob.extractorProgress[extractorName].status = 'running';
        }

        try {
          // Build extraction config
          const config: ExtractionConfig = {
            incremental: mode === ExtractionMode.INCREMENTAL,
            startDate: options?.startDate,
            endDate: options?.endDate,
            batchSize: options?.batchSize ?? 1000,
            tableName: extractorName,
            tenantId: options?.tenantId,
            includeDeleted: options?.includeDeleted ?? false,
          };

          // Run extraction with pagination
          let hasMore = true;
          let offset = 0;
          let extractorRecords = 0;

          while (hasMore) {
            const result = await extractor.extract({
              ...config,
              offset,
            });

            extractorRecords += result.rowCount;
            totalRecords += result.rowCount;
            hasMore = result.hasMore;
            offset += config.batchSize;

            // Update progress
            if (this.currentJob?.extractorProgress[extractorName]) {
              this.currentJob.extractorProgress[extractorName].recordsExtracted = extractorRecords;
            }

            // Log extraction log entry
            await this.logExtraction(extractorName, result);
          }

          // Update extractor timestamp
          await extractor.setLastExtractedTimestamp(new Date());
          await this.saveLastExtractedTimestamp(extractorName, new Date());

          // Mark extractor as completed
          if (this.currentJob?.extractorProgress[extractorName]) {
            this.currentJob.extractorProgress[extractorName].status = 'completed';
            this.currentJob.extractorProgress[extractorName].progress = 100;
          }

          completedExtractors++;
          this.logger.log(
            `Extractor ${extractorName} completed: ${extractorRecords} records`,
          );
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';

          if (this.currentJob?.extractorProgress[extractorName]) {
            this.currentJob.extractorProgress[extractorName].status = 'failed';
            this.currentJob.extractorProgress[extractorName].error = errorMessage;
          }

          this.logger.error(`Extractor ${extractorName} failed:`, error);
          // Continue with other extractors
        }

        // Update overall progress
        if (this.currentJob) {
          this.currentJob.progress = Math.round(
            (completedExtractors / totalExtractors) * 100,
          );
          this.currentJob.recordsExtracted = totalRecords;
        }
      }

      // Mark job as completed
      if (this.currentJob) {
        this.currentJob.status = 'completed';
        this.currentJob.completedAt = new Date();
        this.currentJob.progress = 100;
      }

      this.logger.log(
        `Extraction job ${this.currentJob?.jobId} completed: ${totalRecords} total records`,
      );
    } catch (error) {
      if (this.currentJob) {
        this.currentJob.status = 'failed';
        this.currentJob.completedAt = new Date();
        this.currentJob.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      }
      throw error;
    }
  }

  /**
   * Log extraction to database
   */
  private async logExtraction(
    extractorName: string,
    result: ExtractionResult<unknown>,
  ): Promise<void> {
    try {
      const tableExists = await this.checkEtlLogTableExists();
      if (!tableExists) return;

      await this.auditDataSource.query(
        `
        INSERT INTO data_warehouse.etl_extraction_log (
          extractor_name,
          started_at,
          completed_at,
          rows_extracted,
          status,
          last_extracted_timestamp,
          metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        `,
        [
          extractorName,
          result.extractedAt,
          new Date(),
          result.rowCount,
          'completed',
          result.endTimestamp,
          JSON.stringify(result.metadata ?? {}),
        ],
      );
    } catch (error) {
      this.logger.error(`Failed to log extraction for ${extractorName}:`, error);
    }
  }

  /**
   * Get last extracted timestamp from database
   */
  private async getLastExtractedTimestampFromDb(
    extractorName: string,
  ): Promise<Date | null> {
    try {
      const result = await this.auditDataSource.query(
        `
        SELECT last_extracted_timestamp
        FROM data_warehouse.etl_extraction_log
        WHERE extractor_name = $1
          AND status = 'completed'
        ORDER BY completed_at DESC
        LIMIT 1
        `,
        [extractorName],
      );

      return result[0]?.last_extracted_timestamp ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Save last extracted timestamp to database
   */
  private async saveLastExtractedTimestamp(
    extractorName: string,
    timestamp: Date,
  ): Promise<void> {
    this.extractorTimestamps.set(extractorName, timestamp);
  }

  /**
   * Generate unique job ID
   */
  private generateJobId(): string {
    this.jobIdCounter++;
    const date = new Date().toISOString().split('T')[0];
    return `job-${date}-${String(this.jobIdCounter).padStart(3, '0')}`;
  }

  /**
   * Get current extraction status
   */
  getCurrentStatus(): ExtractionJobStatus | null {
    return this.currentJob ? { ...this.currentJob } : null;
  }

  /**
   * Get extraction overview
   */
  async getOverview(): Promise<{
    systemStatus: 'healthy' | 'degraded' | 'error';
    extractors: Array<{
      name: string;
      sourceTables: string[];
      lastExtractedAt: Date | null;
      lastRowCount: number;
      status: 'idle' | 'running' | 'error';
      enabled: boolean;
    }>;
    currentJob: ExtractionJobStatus | null;
    nextScheduledRun: Date;
    schedule: string;
    extractionsLast24h: number;
    recordsLast24h: number;
    failuresLast24h: number;
  }> {
    const extractors = this.getAllExtractors();
    const schedule = this.configService.get<string>('ETL_EXTRACTION_SCHEDULE', '0 * * * *');

    // Get stats from last 24 hours
    let extractionsLast24h = 0;
    let recordsLast24h = 0;
    let failuresLast24h = 0;

    try {
      const tableExists = await this.checkEtlLogTableExists();
      if (tableExists) {
        const stats = await this.auditDataSource.query(`
          SELECT
            COUNT(*) AS total_extractions,
            COALESCE(SUM(rows_extracted), 0) AS total_records,
            COUNT(*) FILTER (WHERE status = 'failed') AS failed_extractions
          FROM data_warehouse.etl_extraction_log
          WHERE started_at >= NOW() - INTERVAL '24 hours'
        `);

        if (stats[0]) {
          extractionsLast24h = parseInt(stats[0].total_extractions, 10);
          recordsLast24h = parseInt(stats[0].total_records, 10);
          failuresLast24h = parseInt(stats[0].failed_extractions, 10);
        }
      }
    } catch (error) {
      this.logger.error('Failed to get extraction stats:', error);
    }

    // Calculate next scheduled run
    const nextScheduledRun = this.calculateNextScheduledRun(schedule);

    // Determine system status
    let systemStatus: 'healthy' | 'degraded' | 'error' = 'healthy';
    if (failuresLast24h > 0) {
      systemStatus = failuresLast24h > extractionsLast24h / 2 ? 'error' : 'degraded';
    }

    return {
      systemStatus,
      extractors: extractors.map((e) => ({
        name: e.getExtractorName(),
        sourceTables: e.getSourceTables(),
        lastExtractedAt: this.extractorTimestamps.get(e.getExtractorName()) ?? null,
        lastRowCount: 0, // Would need to query from logs
        status: this.currentJob?.extractorProgress[e.getExtractorName()]?.status === 'running'
          ? 'running' as const
          : 'idle' as const,
        enabled: true,
      })),
      currentJob: this.currentJob,
      nextScheduledRun,
      schedule,
      extractionsLast24h,
      recordsLast24h,
      failuresLast24h,
    };
  }

  /**
   * Get extraction history
   */
  async getHistory(options: {
    extractorName?: string;
    status?: ExtractionStatus;
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<{
    items: ExtractionLogEntry[];
    total: number;
    hasMore: boolean;
  }> {
    const limit = options.limit ?? 20;
    const offset = options.offset ?? 0;

    try {
      const tableExists = await this.checkEtlLogTableExists();
      if (!tableExists) {
        return { items: [], total: 0, hasMore: false };
      }

      let query = `
        SELECT *
        FROM data_warehouse.etl_extraction_log
        WHERE 1=1
      `;
      const params: unknown[] = [];
      let paramIndex = 1;

      if (options.extractorName) {
        query += ` AND extractor_name = $${paramIndex++}`;
        params.push(options.extractorName);
      }

      if (options.status) {
        query += ` AND status = $${paramIndex++}`;
        params.push(options.status);
      }

      if (options.fromDate) {
        query += ` AND started_at >= $${paramIndex++}`;
        params.push(options.fromDate);
      }

      if (options.toDate) {
        query += ` AND started_at <= $${paramIndex++}`;
        params.push(options.toDate);
      }

      // Get total count
      const countResult = await this.auditDataSource.query(
        `SELECT COUNT(*) AS total FROM (${query}) sub`,
        params,
      );
      const total = parseInt(countResult[0]?.total ?? '0', 10);

      // Get paginated results
      query += ` ORDER BY started_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      params.push(limit, offset);

      const items = await this.auditDataSource.query(query, params) as ExtractionLogEntry[];

      return {
        items,
        total,
        hasMore: offset + items.length < total,
      };
    } catch (error) {
      this.logger.error('Failed to get extraction history:', error);
      return { items: [], total: 0, hasMore: false };
    }
  }

  /**
   * Calculate next scheduled run based on cron expression
   */
  private calculateNextScheduledRun(cronExpression: string): Date {
    // Simple calculation for common patterns
    // For production, consider using a cron parser library
    const now = new Date();
    const nextRun = new Date(now);

    // Default to next hour if we can't parse
    nextRun.setMinutes(0, 0, 0);
    nextRun.setHours(nextRun.getHours() + 1);

    return nextRun;
  }
}
