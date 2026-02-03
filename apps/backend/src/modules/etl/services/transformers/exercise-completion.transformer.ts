/**
 * Exercise Completion Transformer
 *
 * @description Transforms OLTP exercise submissions to DW fact table format.
 * Maps exercise completion data from progress_tracking.exercise_submissions
 * to the fact_exercise_completion warehouse table.
 *
 * @module etl/services/transformers
 * @since 2026-02-03
 */

import { Injectable } from '@nestjs/common';
import {
  TransformerBaseService,
  PreValidationResult,
  validResult,
  invalidResult,
} from './transformer-base.service';
import { ValidationResult, ValidationSeverity } from '../../interfaces/validation-result.interface';
import { DataQualityValidator } from '../validators/data-quality.validator';
import { DimensionLookupService } from '../dimension-lookup.service';
import { TransformerConfig, DEFAULT_TRANSFORMER_CONFIG } from '../../interfaces';

/**
 * Source: OLTP Exercise Submission Record
 */
export interface ExerciseSubmissionSource {
  id: string;
  user_id: string;
  exercise_id: string;
  answer_data: Record<string, unknown>;
  is_correct?: boolean;
  score: number;
  max_score: number;
  feedback?: string;
  hint_used: boolean;
  hints_count: number;
  comodines_used?: string[];
  ml_coins_spent: number;
  time_spent_seconds?: number;
  attempt_number: number;
  status: string;
  started_at?: Date;
  submitted_at: Date;
  graded_at?: Date;
  created_at: Date;
  updated_at: Date;
  xp_earned: number;
  ml_coins_earned: number;
  rewards_claimed: boolean;
}

/**
 * Target: DW Fact Exercise Completion Record
 */
export interface FactExerciseCompletion {
  /** Surrogate key */
  completion_key: number;
  /** FK to dim_date */
  date_key: number;
  /** FK to dim_time */
  time_key: number;
  /** FK to dim_student */
  student_key: number;
  /** FK to dim_exercise */
  exercise_key: number;
  /** Natural key for reference */
  submission_id: string;
  /** Normalized score (0-100) */
  score: number;
  /** Maximum possible score */
  max_score: number;
  /** Score percentage (0-100) */
  score_percentage: number;
  /** Time spent in seconds */
  time_spent_seconds: number;
  /** Attempt number for this exercise */
  attempt_number: number;
  /** Whether this was the first attempt */
  is_first_attempt: boolean;
  /** Whether score meets passing threshold */
  passed_flag: boolean;
  /** Whether answer was correct */
  is_correct: boolean;
  /** Whether hint was used */
  hint_used: boolean;
  /** Number of hints used */
  hints_count: number;
  /** Number of comodines used */
  comodines_count: number;
  /** ML Coins spent on comodines */
  ml_coins_spent: number;
  /** XP earned from completion */
  xp_earned: number;
  /** ML Coins earned from completion */
  ml_coins_earned: number;
  /** Submission status */
  status: string;
  /** UTC timestamp of submission */
  submitted_at_utc: Date;
  /** ETL batch ID */
  etl_batch_id: string;
  /** ETL load timestamp */
  etl_loaded_at: Date;
}

/**
 * ExerciseCompletionTransformer
 * @description Transforms exercise submissions for fact table loading
 */
@Injectable()
export class ExerciseCompletionTransformer extends TransformerBaseService<
  ExerciseSubmissionSource,
  FactExerciseCompletion
> {
  private completionKeyCounter = 100000;
  private currentBatchId = '';

  constructor(
    private readonly validator: DataQualityValidator,
    private readonly dimensionLookup: DimensionLookupService,
    config?: Partial<TransformerConfig>,
  ) {
    super('ExerciseCompletionTransformer', config);
  }

  /**
   * Validate source data before transformation
   */
  validate(data: ExerciseSubmissionSource[]): ValidationResult {
    return this.validator.validate(data, {
      rules: [
        // Required fields
        DataQualityValidator.requiredRule('id'),
        DataQualityValidator.requiredRule('user_id'),
        DataQualityValidator.requiredRule('exercise_id'),
        DataQualityValidator.requiredRule('submitted_at'),

        // UUID validations
        DataQualityValidator.uuidRule('id'),
        DataQualityValidator.uuidRule('user_id'),
        DataQualityValidator.uuidRule('exercise_id'),

        // Range validations
        DataQualityValidator.rangeRule('score', 0, undefined, ValidationSeverity.WARNING),
        DataQualityValidator.rangeRule('max_score', 1, 1000, ValidationSeverity.WARNING),
        DataQualityValidator.rangeRule('attempt_number', 1, 100, ValidationSeverity.WARNING),
        DataQualityValidator.rangeRule('time_spent_seconds', 0, 36000, ValidationSeverity.WARNING),
        DataQualityValidator.rangeRule('hints_count', 0, 10, ValidationSeverity.WARNING),
        DataQualityValidator.rangeRule('ml_coins_spent', 0, undefined, ValidationSeverity.WARNING),
        DataQualityValidator.rangeRule('xp_earned', 0, undefined, ValidationSeverity.WARNING),
        DataQualityValidator.rangeRule('ml_coins_earned', 0, undefined, ValidationSeverity.WARNING),
      ],
      duplicateKeyFields: ['id'],
      failFast: false,
      maxErrors: 1000,
      referenceTables: {
        user_id: 'auth_management.profiles',
        exercise_id: 'educational_content.exercises',
      },
    });
  }

  /**
   * Validate a single record before transformation
   */
  protected validateRecord(record: ExerciseSubmissionSource): PreValidationResult {
    // Required fields check
    if (!record.id) {
      return invalidResult('Missing submission ID', 'MISSING_ID', 'id');
    }

    if (!record.user_id) {
      return invalidResult('Missing user ID', 'MISSING_USER_ID', 'user_id');
    }

    if (!record.exercise_id) {
      return invalidResult('Missing exercise ID', 'MISSING_EXERCISE_ID', 'exercise_id');
    }

    if (!record.submitted_at) {
      return invalidResult('Missing submitted_at timestamp', 'MISSING_TIMESTAMP', 'submitted_at');
    }

    // Score validation
    if (record.score !== null && record.score !== undefined && record.score < 0) {
      return invalidResult('Negative score not allowed', 'INVALID_SCORE', 'score');
    }

    // Time validation
    if (
      record.time_spent_seconds !== null &&
      record.time_spent_seconds !== undefined &&
      record.time_spent_seconds < 0
    ) {
      return invalidResult('Negative time not allowed', 'INVALID_TIME', 'time_spent_seconds');
    }

    // Clamp unreasonable time values
    if (
      record.time_spent_seconds !== null &&
      record.time_spent_seconds !== undefined &&
      record.time_spent_seconds > this.config.maxExerciseTimeSeconds
    ) {
      this.logger.warn(
        `Time ${record.time_spent_seconds}s exceeds max, will be clamped to ${this.config.maxExerciseTimeSeconds}s`,
      );
    }

    return validResult();
  }

  /**
   * Transform a single submission record
   */
  protected async transformRecord(
    record: ExerciseSubmissionSource,
  ): Promise<FactExerciseCompletion | null> {
    // Convert submitted_at to UTC
    const submittedAtUtc = this.toUTC(record.submitted_at);
    if (!submittedAtUtc) {
      this.logger.warn(`Invalid submitted_at date for ${record.id}`);
      return null;
    }

    // Get dimension keys
    const dateKey = this.getDateKey(submittedAtUtc);
    const timeKey = this.getTimeKey(submittedAtUtc);
    const studentKey = await this.dimensionLookup.getOrCreateStudentKey(record.user_id);
    const exerciseKey = await this.dimensionLookup.getExerciseKey(record.exercise_id);

    if (!exerciseKey) {
      this.logger.warn(`Exercise key not found for ${record.exercise_id}`);
      return null;
    }

    // Calculate derived fields
    const maxScore = this.withDefault(record.max_score, 100);
    const score = this.clamp(this.withDefault(record.score, 0), 0, maxScore);
    const scorePercentage = this.normalizeScore(score, maxScore);
    const isFirstAttempt = record.attempt_number === 1;
    const passedFlag = scorePercentage >= this.config.passingThreshold;
    const comodinesCount = record.comodines_used?.length || 0;
    const timeSpentSeconds = this.clamp(
      this.withDefault(record.time_spent_seconds, 0),
      0,
      this.config.maxExerciseTimeSeconds,
    );

    // Generate surrogate key
    const completionKey = this.completionKeyCounter++;

    return {
      completion_key: completionKey,
      date_key: dateKey,
      time_key: timeKey,
      student_key: studentKey,
      exercise_key: exerciseKey,
      submission_id: record.id,
      score,
      max_score: maxScore,
      score_percentage: scorePercentage,
      time_spent_seconds: timeSpentSeconds,
      attempt_number: this.withDefault(record.attempt_number, 1),
      is_first_attempt: isFirstAttempt,
      passed_flag: passedFlag,
      is_correct: this.withDefault(record.is_correct, false),
      hint_used: this.withDefault(record.hint_used, false),
      hints_count: this.withDefault(record.hints_count, 0),
      comodines_count: comodinesCount,
      ml_coins_spent: this.withDefault(record.ml_coins_spent, 0),
      xp_earned: this.withDefault(record.xp_earned, 0),
      ml_coins_earned: this.withDefault(record.ml_coins_earned, 0),
      status: record.status || 'submitted',
      submitted_at_utc: submittedAtUtc,
      etl_batch_id: this.currentBatchId,
      etl_loaded_at: new Date(),
    };
  }

  /**
   * Override transform to set batch ID
   */
  async transform(
    data: ExerciseSubmissionSource[],
    batchId: string,
  ): Promise<import('../../interfaces').TransformationResult<FactExerciseCompletion>> {
    this.currentBatchId = batchId;
    return super.transform(data, batchId);
  }
}
