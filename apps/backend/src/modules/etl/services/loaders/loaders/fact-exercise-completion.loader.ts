/**
 * Fact Exercise Completion Loader - ETL Pipeline Load Phase
 *
 * @description Loads exercise completion facts into the data warehouse.
 * Target: data_warehouse.fact_exercise_completions
 * Mode: Append only (facts are immutable)
 *
 * @module ETL
 * @see TASK-2026-02-03 Sprint 2.4 - ETL Pipeline Carga
 */

import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { FactLoaderService, DimensionReference } from '../fact-loader.service';
import { LoadResult } from '../../../interfaces';

/**
 * Exercise Completion Fact Record
 *
 * @description Represents a transformed exercise completion record
 * ready for loading into the fact table
 */
export interface ExerciseCompletionFact {
  date_key: number;
  time_key: number;
  student_key: string;
  exercise_key: string;
  module_key: string;
  classroom_key?: string;
  tenant_key?: string;

  // Metrics
  score: number;
  max_score: number;
  time_spent_seconds: number;
  attempt_number: number;
  is_correct: boolean;
  is_perfect_score: boolean;

  // Gamification
  xp_earned: number;
  coins_earned: number;
  achievement_unlocked: boolean;

  // Comodines used
  comodines_used: number;
  used_second_chance: boolean;
  used_fifty_fifty: boolean;
  used_time_freeze: boolean;

  // Source tracking
  source_submission_id: string;
  extracted_at: Date;
}

/**
 * Fact Exercise Completion Loader
 *
 * @description Loads exercise completion facts into the data warehouse
 */
@Injectable()
export class FactExerciseCompletionLoader extends FactLoaderService<ExerciseCompletionFact> {
  protected readonly logger = new Logger(FactExerciseCompletionLoader.name);
  protected readonly targetSchema = 'data_warehouse';
  protected readonly targetTable = 'fact_exercise_completions';
  protected readonly defaultBatchSize = 1000;

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
        factColumn: 'time_key',
        dimensionTable: 'data_warehouse.dim_time',
        dimensionColumn: 'time_key',
        required: true,
      },
      {
        factColumn: 'student_key',
        dimensionTable: 'data_warehouse.dim_student',
        dimensionColumn: 'student_key',
        required: true,
      },
      // Note: Exercise and Module dimensions would be validated if tables exist
    ];
  }

  /**
   * Get columns for insert
   */
  protected getInsertColumns(): string[] {
    return [
      'date_key',
      'time_key',
      'student_key',
      'exercise_key',
      'module_key',
      'classroom_key',
      'tenant_key',
      'score',
      'max_score',
      'time_spent_seconds',
      'attempt_number',
      'is_correct',
      'is_perfect_score',
      'xp_earned',
      'coins_earned',
      'achievement_unlocked',
      'comodines_used',
      'used_second_chance',
      'used_fifty_fifty',
      'used_time_freeze',
      'source_submission_id',
      'extracted_at',
    ];
  }

  /**
   * Map a record to values for insert
   */
  protected mapRecordToValues(record: ExerciseCompletionFact): unknown[] {
    return [
      record.date_key,
      record.time_key,
      record.student_key,
      record.exercise_key,
      record.module_key,
      record.classroom_key || null,
      record.tenant_key || null,
      record.score,
      record.max_score,
      record.time_spent_seconds,
      record.attempt_number,
      record.is_correct,
      record.is_perfect_score,
      record.xp_earned,
      record.coins_earned,
      record.achievement_unlocked,
      record.comodines_used,
      record.used_second_chance,
      record.used_fifty_fifty,
      record.used_time_freeze,
      record.source_submission_id,
      record.extracted_at,
    ];
  }

  /**
   * Load exercise completion facts
   *
   * @description Main entry point for loading exercise completion data.
   * Uses append-only mode with dimension key validation.
   */
  async loadExerciseCompletions(
    data: ExerciseCompletionFact[],
    validateDimensions = true,
  ): Promise<LoadResult> {
    this.logger.log(
      `Loading ${data.length} exercise completion facts`,
    );

    if (validateDimensions) {
      return this.loadWithValidation(data, { continueOnError: false });
    }

    return this.appendOnly(data);
  }
}
