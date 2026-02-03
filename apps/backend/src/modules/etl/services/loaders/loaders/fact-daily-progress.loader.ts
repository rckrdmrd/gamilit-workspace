/**
 * Fact Daily Progress Loader - ETL Pipeline Load Phase
 *
 * @description Loads daily progress facts into the data warehouse.
 * Target: data_warehouse.fact_daily_progress
 * Mode: Upsert (one row per student/module/date)
 *
 * @module ETL
 * @see TASK-2026-02-03 Sprint 2.4 - ETL Pipeline Carga
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { FactLoaderService, DimensionReference } from '../fact-loader.service';
import { LoadConfig, LoadResult, LoadMode } from '../../../interfaces';

/**
 * Daily Progress Fact Record
 *
 * @description Represents a transformed daily progress record.
 * Aggregates a student's daily activity for a specific module.
 */
export interface DailyProgressFact {
  date_key: number;
  student_key: string;
  module_key: string;
  classroom_key?: string;
  tenant_key?: string;

  // Activity metrics
  exercises_attempted: number;
  exercises_completed: number;
  exercises_correct: number;
  exercises_perfect: number;

  // Time metrics
  total_time_seconds: number;
  active_time_seconds: number;
  session_count: number;

  // Performance
  average_score: number;
  highest_score: number;
  lowest_score: number;

  // Progress
  progress_percentage: number;
  progress_delta: number;

  // Gamification
  xp_earned: number;
  coins_earned: number;
  coins_spent: number;
  achievements_earned: number;

  // Streaks
  streak_continued: boolean;
  current_streak: number;

  // Source tracking
  extracted_at: Date;
}

/**
 * Fact Daily Progress Loader
 *
 * @description Loads daily progress facts using upsert mode.
 * Key: (date_key, student_key, module_key)
 */
@Injectable()
export class FactDailyProgressLoader extends FactLoaderService<DailyProgressFact> {
  protected readonly logger = new Logger(FactDailyProgressLoader.name);
  protected readonly targetSchema = 'data_warehouse';
  protected readonly targetTable = 'fact_daily_progress';
  protected readonly defaultBatchSize = 1000;

  /**
   * Key columns for upsert conflict detection
   */
  private readonly keyColumns = ['date_key', 'student_key', 'module_key'];

  constructor(
    @InjectDataSource('data_warehouse')
    protected readonly dataSource: DataSource,
  ) {
    super();
  }

  /**
   * Define dimension references for validation
   */
  protected getDimensionReferences(): DimensionReference[] {
    return [
      {
        factColumn: 'date_key',
        dimensionTable: 'data_warehouse.dim_date',
        dimensionColumn: 'date_key',
        required: true,
      },
      {
        factColumn: 'student_key',
        dimensionTable: 'data_warehouse.dim_student',
        dimensionColumn: 'student_key',
        required: true,
      },
    ];
  }

  /**
   * Get columns for insert
   */
  protected getInsertColumns(): string[] {
    return [
      'date_key',
      'student_key',
      'module_key',
      'classroom_key',
      'tenant_key',
      'exercises_attempted',
      'exercises_completed',
      'exercises_correct',
      'exercises_perfect',
      'total_time_seconds',
      'active_time_seconds',
      'session_count',
      'average_score',
      'highest_score',
      'lowest_score',
      'progress_percentage',
      'progress_delta',
      'xp_earned',
      'coins_earned',
      'coins_spent',
      'achievements_earned',
      'streak_continued',
      'current_streak',
      'extracted_at',
    ];
  }

  /**
   * Map a record to values for insert
   */
  protected mapRecordToValues(record: DailyProgressFact): unknown[] {
    return [
      record.date_key,
      record.student_key,
      record.module_key,
      record.classroom_key || null,
      record.tenant_key || null,
      record.exercises_attempted,
      record.exercises_completed,
      record.exercises_correct,
      record.exercises_perfect,
      record.total_time_seconds,
      record.active_time_seconds,
      record.session_count,
      record.average_score,
      record.highest_score,
      record.lowest_score,
      record.progress_percentage,
      record.progress_delta,
      record.xp_earned,
      record.coins_earned,
      record.coins_spent,
      record.achievements_earned,
      record.streak_continued,
      record.current_streak,
      record.extracted_at,
    ];
  }

  /**
   * Load daily progress facts with upsert
   *
   * @description Main entry point. Uses upsert mode since we have
   * one aggregated row per student/module/date combination.
   */
  async loadDailyProgress(
    data: DailyProgressFact[],
    validateDimensions = true,
  ): Promise<LoadResult> {
    this.logger.log(`Loading ${data.length} daily progress facts (upsert mode)`);

    // First validate dimension keys if requested
    if (validateDimensions) {
      const validation = await this.validateDimensionKeys(data);
      if (!validation.valid) {
        this.logger.error(
          `Dimension key validation failed: ${validation.errors.length} errors`,
        );
        return {
          rowsInserted: 0,
          rowsUpdated: 0,
          rowsRejected: validation.invalidRecordCount,
          loadedAt: new Date(),
          duration: 0,
          success: false,
          errorMessage: `Dimension key validation failed`,
          targetTable: this.targetTable,
          targetSchema: this.targetSchema,
          loadMode: LoadMode.UPSERT,
          batchesProcessed: 0,
          averageRecordsPerSecond: 0,
        };
      }
    }

    // Use upsert mode for daily progress
    return this.upsert(data, this.keyColumns);
  }

  /**
   * Override to use custom update columns
   */
  async load(data: DailyProgressFact[], config: LoadConfig): Promise<LoadResult> {
    // For upsert, specify which columns to update on conflict
    if (config.mode === LoadMode.UPSERT) {
      config.keyColumns = this.keyColumns;
      config.updateColumns = this.getInsertColumns().filter(
        (col) => !this.keyColumns.includes(col) && col !== 'created_at',
      );
    }
    return super.load(data, config);
  }
}
