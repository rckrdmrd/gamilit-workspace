/**
 * Exercise Completion Extractor
 *
 * @description Extracts exercise completion data from OLTP source tables
 * @module etl/services/extractors
 * @version 1.0.0
 * @since Sprint 2.2 - ETL Pipeline Extraction
 *
 * Source Tables:
 * - progress_tracking.exercise_attempts (primary)
 * - educational_content.exercises (metadata join)
 *
 * Target: Data Warehouse fact_exercise_completions
 */

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner, SelectQueryBuilder } from 'typeorm';
import { ExtractorBaseService } from '../extractor-base.service';
import { ExtractionConfig } from '../../interfaces';

/**
 * Exercise Completion Data Interface
 *
 * @description Shape of extracted exercise completion data
 */
export interface ExerciseCompletionData {
  /** Unique attempt ID */
  attempt_id: string;
  /** Student/user ID */
  student_id: string;
  /** Exercise ID */
  exercise_id: string;
  /** Module ID (from exercise) */
  module_id: string;
  /** Score achieved (0-100) */
  score: number;
  /** Time spent in seconds */
  time_spent_seconds: number;
  /** Whether the attempt was correct */
  is_correct: boolean;
  /** Attempt number (1, 2, 3...) */
  attempt_number: number;
  /** XP earned from this attempt */
  xp_earned: number;
  /** ML coins earned */
  ml_coins_earned: number;
  /** Number of hints used */
  hints_used: number;
  /** Comodines used (JSON array) */
  comodines_used: string;
  /** When the attempt was submitted */
  submitted_at: Date;
  /** Exercise title */
  exercise_title: string;
  /** Exercise type */
  exercise_type: string;
  /** Exercise difficulty level */
  difficulty_level: string;
  /** Max possible score */
  max_points: number;
  /** When the record was last updated */
  updated_at: Date;
}

/**
 * ExerciseCompletionExtractor
 *
 * @description Extractor for exercise completion/attempt data.
 * Joins exercise_attempts with exercises table to get complete data.
 */
@Injectable()
export class ExerciseCompletionExtractor extends ExtractorBaseService<ExerciseCompletionData> {
  constructor(
    @InjectDataSource('progress')
    dataSource: DataSource,
  ) {
    super(
      dataSource,
      'exercise-completion-extractor',
      [
        'progress_tracking.exercise_attempts',
        'educational_content.exercises',
      ],
    );
  }

  /**
   * Build the extraction query for exercise completions
   *
   * @param queryRunner - TypeORM query runner
   * @param config - Extraction configuration
   * @param startTimestamp - Start of extraction window
   * @param endTimestamp - End of extraction window
   * @returns Configured query builder
   */
  protected buildQuery(
    queryRunner: QueryRunner,
    config: ExtractionConfig,
    startTimestamp: Date,
    endTimestamp: Date,
  ): SelectQueryBuilder<ExerciseCompletionData> {
    const query = queryRunner.manager
      .createQueryBuilder()
      .select([
        'ea.id AS attempt_id',
        'ea.user_id AS student_id',
        'ea.exercise_id AS exercise_id',
        'ex.module_id AS module_id',
        'COALESCE(ea.score, 0) AS score',
        'COALESCE(ea.time_spent_seconds, 0) AS time_spent_seconds',
        'COALESCE(ea.is_correct, false) AS is_correct',
        'ea.attempt_number AS attempt_number',
        'COALESCE(ea.xp_earned, 0) AS xp_earned',
        'COALESCE(ea.ml_coins_earned, 0) AS ml_coins_earned',
        'COALESCE(ea.hints_used, 0) AS hints_used',
        'COALESCE(ea.comodines_used::text, \'[]\') AS comodines_used',
        'ea.submitted_at AS submitted_at',
        'ex.title AS exercise_title',
        'ex.exercise_type AS exercise_type',
        'ex.difficulty_level AS difficulty_level',
        'ex.max_points AS max_points',
        'ea.submitted_at AS updated_at',
      ])
      .from('progress_tracking.exercise_attempts', 'ea')
      .innerJoin(
        'educational_content.exercises',
        'ex',
        'ea.exercise_id = ex.id',
      );

    // Apply CDC timestamp filter
    query.where('ea.submitted_at >= :startTimestamp', { startTimestamp });
    query.andWhere('ea.submitted_at < :endTimestamp', { endTimestamp });

    // Apply optional tenant filter
    if (config.tenantId) {
      query.andWhere(
        `EXISTS (
          SELECT 1 FROM auth_management.profiles p
          WHERE p.id = ea.user_id AND p.tenant_id = :tenantId
        )`,
        { tenantId: config.tenantId },
      );
    }

    // Apply custom filters
    if (config.filters) {
      if (config.filters['module_id']) {
        query.andWhere('ex.module_id = :moduleId', {
          moduleId: config.filters['module_id'],
        });
      }
      if (config.filters['is_correct'] !== undefined) {
        query.andWhere('ea.is_correct = :isCorrect', {
          isCorrect: config.filters['is_correct'],
        });
      }
    }

    // Order by submitted_at for consistent CDC
    query.orderBy('ea.submitted_at', config.orderDirection ?? 'ASC');

    return query as unknown as SelectQueryBuilder<ExerciseCompletionData>;
  }
}
