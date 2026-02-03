/**
 * Load Coordinator Service - ETL Pipeline Load Phase
 *
 * @description Orchestrates the full load pipeline. Manages load order,
 * dependency checking, and logs load metrics.
 *
 * @module ETL
 * @see TASK-2026-02-03 Sprint 2.4 - ETL Pipeline Carga
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  LoadResult,
  LoadMode,
  SCDLoadResult,
} from '../interfaces';
import {
  FactExerciseCompletionLoader,
  ExerciseCompletionFact,
  FactDailyProgressLoader,
  DailyProgressFact,
  FactGamificationEventLoader,
  GamificationEventFact,
  DimStudentLoader,
  StudentDimension,
} from './loaders';
import { LoadStatus } from '../dto';

/**
 * Load Pipeline Result
 *
 * @description Result of a complete load pipeline execution
 */
export interface LoadPipelineResult {
  pipelineId: string;
  status: LoadStatus;
  startedAt: Date;
  completedAt?: Date;
  totalDuration: number;
  dimensionResults: Map<string, LoadResult | SCDLoadResult>;
  factResults: Map<string, LoadResult>;
  errorMessage?: string;
  totalRowsLoaded: number;
  totalRowsRejected: number;
}

/**
 * Load Pipeline Config
 */
export interface LoadPipelineConfig {
  /**
   * Whether to load dimensions before facts
   * @default true
   */
  loadDimensionsFirst: boolean;

  /**
   * Continue pipeline if one loader fails
   * @default false
   */
  continueOnError: boolean;

  /**
   * Validate dimension keys before fact loading
   * @default true
   */
  validateDimensionKeys: boolean;

  /**
   * Batch size for all loaders
   * @default 1000
   */
  batchSize: number;

  /**
   * Specific loaders to run (all if not specified)
   */
  loadersToRun?: string[];
}

const DEFAULT_PIPELINE_CONFIG: LoadPipelineConfig = {
  loadDimensionsFirst: true,
  continueOnError: false,
  validateDimensionKeys: true,
  batchSize: 1000,
};

/**
 * Load Coordinator Service
 *
 * @description Orchestrates the ETL load pipeline:
 * - Manages load order (dimensions before facts)
 * - Implements dependency checking
 * - Logs load metrics to etl_load_log
 */
@Injectable()
export class LoadCoordinatorService {
  private readonly logger = new Logger(LoadCoordinatorService.name);
  private currentPipelineId: string | null = null;
  private isRunning = false;

  /**
   * Loader dependencies (dimensions must be loaded before facts that reference them)
   */
  private readonly loaderDependencies: Record<string, string[]> = {
    'fact-exercise-completion': ['dim-student'],
    'fact-daily-progress': ['dim-student'],
    'fact-gamification-event': ['dim-student'],
  };

  constructor(
    @InjectDataSource('data_warehouse')
    private readonly dataSource: DataSource,
    private readonly dimStudentLoader: DimStudentLoader,
    private readonly factExerciseCompletionLoader: FactExerciseCompletionLoader,
    private readonly factDailyProgressLoader: FactDailyProgressLoader,
    private readonly factGamificationEventLoader: FactGamificationEventLoader,
  ) {}

  /**
   * Execute full load pipeline
   *
   * @description Runs the complete load pipeline in order:
   * 1. Load dimensions
   * 2. Load facts (with dimension key validation)
   * 3. Log results
   */
  async executeFullPipeline(
    data: {
      students?: StudentDimension[];
      exerciseCompletions?: ExerciseCompletionFact[];
      dailyProgress?: DailyProgressFact[];
      gamificationEvents?: GamificationEventFact[];
    },
    config: Partial<LoadPipelineConfig> = {},
  ): Promise<LoadPipelineResult> {
    const fullConfig = { ...DEFAULT_PIPELINE_CONFIG, ...config };
    const pipelineId = this.generatePipelineId();
    this.currentPipelineId = pipelineId;
    this.isRunning = true;

    const result: LoadPipelineResult = {
      pipelineId,
      status: LoadStatus.RUNNING,
      startedAt: new Date(),
      totalDuration: 0,
      dimensionResults: new Map(),
      factResults: new Map(),
      totalRowsLoaded: 0,
      totalRowsRejected: 0,
    };

    this.logger.log(`Starting load pipeline ${pipelineId}`);

    try {
      // Phase 1: Load Dimensions
      if (fullConfig.loadDimensionsFirst) {
        await this.loadDimensions(data, result, fullConfig);
      }

      // Phase 2: Load Facts
      await this.loadFacts(data, result, fullConfig);

      result.status = LoadStatus.COMPLETED;
      this.logger.log(
        `Pipeline ${pipelineId} completed successfully. ` +
          `Loaded: ${result.totalRowsLoaded}, Rejected: ${result.totalRowsRejected}`,
      );
    } catch (error) {
      result.status = LoadStatus.FAILED;
      result.errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Pipeline ${pipelineId} failed: ${result.errorMessage}`,
        error instanceof Error ? error.stack : undefined,
      );
    } finally {
      result.completedAt = new Date();
      result.totalDuration =
        result.completedAt.getTime() - result.startedAt.getTime();
      this.isRunning = false;
      this.currentPipelineId = null;

      // Log pipeline execution
      await this.logPipelineExecution(result);
    }

    return result;
  }

  /**
   * Load dimension tables
   */
  private async loadDimensions(
    data: {
      students?: StudentDimension[];
    },
    result: LoadPipelineResult,
    config: LoadPipelineConfig,
  ): Promise<void> {
    this.logger.log('Loading dimensions...');

    // Check if we should run this loader
    if (config.loadersToRun && !config.loadersToRun.includes('dim-student')) {
      this.logger.log('Skipping dim-student (not in loadersToRun)');
      return;
    }

    // Load student dimension
    if (data.students && data.students.length > 0) {
      this.logger.log(`Loading ${data.students.length} student records`);
      const studentResult = await this.dimStudentLoader.loadStudentDimension(
        data.students,
      );
      result.dimensionResults.set('dim-student', studentResult);
      result.totalRowsLoaded += studentResult.rowsInserted;
      result.totalRowsRejected += studentResult.rowsRejected;

      if (!studentResult.success && !config.continueOnError) {
        throw new Error(`Dimension load failed: ${studentResult.errorMessage}`);
      }

      // Log to load log
      await this.logLoadResult('dim-student', studentResult);
    }
  }

  /**
   * Load fact tables
   */
  private async loadFacts(
    data: {
      exerciseCompletions?: ExerciseCompletionFact[];
      dailyProgress?: DailyProgressFact[];
      gamificationEvents?: GamificationEventFact[];
    },
    result: LoadPipelineResult,
    config: LoadPipelineConfig,
  ): Promise<void> {
    this.logger.log('Loading facts...');

    // Load exercise completions
    if (
      data.exerciseCompletions &&
      data.exerciseCompletions.length > 0 &&
      this.shouldRunLoader('fact-exercise-completion', config)
    ) {
      this.logger.log(
        `Loading ${data.exerciseCompletions.length} exercise completion facts`,
      );
      const ecResult =
        await this.factExerciseCompletionLoader.loadExerciseCompletions(
          data.exerciseCompletions,
          config.validateDimensionKeys,
        );
      result.factResults.set('fact-exercise-completion', ecResult);
      result.totalRowsLoaded += ecResult.rowsInserted;
      result.totalRowsRejected += ecResult.rowsRejected;

      if (!ecResult.success && !config.continueOnError) {
        throw new Error(
          `Exercise completion load failed: ${ecResult.errorMessage}`,
        );
      }

      await this.logLoadResult('fact-exercise-completion', ecResult);
    }

    // Load daily progress
    if (
      data.dailyProgress &&
      data.dailyProgress.length > 0 &&
      this.shouldRunLoader('fact-daily-progress', config)
    ) {
      this.logger.log(
        `Loading ${data.dailyProgress.length} daily progress facts`,
      );
      const dpResult = await this.factDailyProgressLoader.loadDailyProgress(
        data.dailyProgress,
        config.validateDimensionKeys,
      );
      result.factResults.set('fact-daily-progress', dpResult);
      result.totalRowsLoaded += dpResult.rowsInserted + dpResult.rowsUpdated;
      result.totalRowsRejected += dpResult.rowsRejected;

      if (!dpResult.success && !config.continueOnError) {
        throw new Error(`Daily progress load failed: ${dpResult.errorMessage}`);
      }

      await this.logLoadResult('fact-daily-progress', dpResult);
    }

    // Load gamification events
    if (
      data.gamificationEvents &&
      data.gamificationEvents.length > 0 &&
      this.shouldRunLoader('fact-gamification-event', config)
    ) {
      this.logger.log(
        `Loading ${data.gamificationEvents.length} gamification event facts`,
      );
      const geResult =
        await this.factGamificationEventLoader.loadGamificationEvents(
          data.gamificationEvents,
          config.validateDimensionKeys,
        );
      result.factResults.set('fact-gamification-event', geResult);
      result.totalRowsLoaded += geResult.rowsInserted;
      result.totalRowsRejected += geResult.rowsRejected;

      if (!geResult.success && !config.continueOnError) {
        throw new Error(
          `Gamification event load failed: ${geResult.errorMessage}`,
        );
      }

      await this.logLoadResult('fact-gamification-event', geResult);
    }
  }

  /**
   * Check if a loader should run
   */
  private shouldRunLoader(
    loaderName: string,
    config: LoadPipelineConfig,
  ): boolean {
    if (!config.loadersToRun) return true;
    return config.loadersToRun.includes(loaderName);
  }

  /**
   * Log load result to etl_load_log table
   */
  private async logLoadResult(
    loaderName: string,
    result: LoadResult | SCDLoadResult,
  ): Promise<void> {
    try {
      await this.dataSource.query(
        `
        INSERT INTO data_warehouse.etl_load_log (
          loader_name, target_table, started_at, completed_at,
          rows_inserted, rows_updated, rows_rejected,
          status, error_message
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
        [
          loaderName,
          `${result.targetSchema}.${result.targetTable}`,
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
      this.logger.error(`Failed to log load result: ${error}`);
    }
  }

  /**
   * Log pipeline execution
   */
  private async logPipelineExecution(
    result: LoadPipelineResult,
  ): Promise<void> {
    try {
      await this.dataSource.query(
        `
        INSERT INTO data_warehouse.etl_load_log (
          loader_name, target_table, started_at, completed_at,
          rows_inserted, rows_updated, rows_rejected,
          status, error_message
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
        [
          `pipeline-${result.pipelineId}`,
          'data_warehouse.*',
          result.startedAt,
          result.completedAt,
          result.totalRowsLoaded,
          0,
          result.totalRowsRejected,
          result.status,
          result.errorMessage || null,
        ],
      );
    } catch (error) {
      this.logger.error(`Failed to log pipeline execution: ${error}`);
    }
  }

  /**
   * Generate unique pipeline ID
   */
  private generatePipelineId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `pl_${timestamp}_${random}`;
  }

  /**
   * Get current pipeline status
   */
  getCurrentStatus(): {
    isRunning: boolean;
    currentPipelineId: string | null;
  } {
    return {
      isRunning: this.isRunning,
      currentPipelineId: this.currentPipelineId,
    };
  }

  /**
   * Get load history from etl_load_log
   */
  async getLoadHistory(
    limit = 20,
    offset = 0,
    filters?: {
      loaderName?: string;
      status?: string;
      startDate?: Date;
      endDate?: Date;
    },
  ): Promise<{ data: unknown[]; total: number }> {
    let whereClause = '1=1';
    const params: unknown[] = [];
    let paramIndex = 1;

    if (filters?.loaderName) {
      whereClause += ` AND loader_name = $${paramIndex++}`;
      params.push(filters.loaderName);
    }
    if (filters?.status) {
      whereClause += ` AND status = $${paramIndex++}`;
      params.push(filters.status);
    }
    if (filters?.startDate) {
      whereClause += ` AND started_at >= $${paramIndex++}`;
      params.push(filters.startDate);
    }
    if (filters?.endDate) {
      whereClause += ` AND completed_at <= $${paramIndex++}`;
      params.push(filters.endDate);
    }

    const countResult = await this.dataSource.query(
      `SELECT COUNT(*) as total FROM data_warehouse.etl_load_log WHERE ${whereClause}`,
      params,
    );

    const data = await this.dataSource.query(
      `SELECT * FROM data_warehouse.etl_load_log
       WHERE ${whereClause}
       ORDER BY started_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limit, offset],
    );

    return {
      data,
      total: parseInt(countResult[0].total, 10),
    };
  }

  /**
   * Get load statistics for last 24 hours
   */
  async getLoadStats24Hours(): Promise<{
    total: number;
    successful: number;
    failed: number;
    rowsLoaded: number;
    rowsRejected: number;
  }> {
    const result = await this.dataSource.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'completed') as successful,
        COUNT(*) FILTER (WHERE status = 'failed') as failed,
        COALESCE(SUM(rows_inserted + rows_updated), 0) as rows_loaded,
        COALESCE(SUM(rows_rejected), 0) as rows_rejected
      FROM data_warehouse.etl_load_log
      WHERE started_at >= NOW() - INTERVAL '24 hours'
    `);

    return {
      total: parseInt(result[0].total, 10),
      successful: parseInt(result[0].successful, 10),
      failed: parseInt(result[0].failed, 10),
      rowsLoaded: parseInt(result[0].rows_loaded, 10),
      rowsRejected: parseInt(result[0].rows_rejected, 10),
    };
  }
}
