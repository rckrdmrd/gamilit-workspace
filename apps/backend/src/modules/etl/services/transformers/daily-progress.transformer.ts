/**
 * Daily Progress Transformer
 *
 * @description Transforms and aggregates OLTP exercise completions
 * to DW daily progress fact table. Calculates daily metrics per
 * student/module including exercises completed, scores, time spent,
 * and streak calculations.
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
import {
  ValidationResult,
  ValidationSeverity,
} from '../../interfaces/validation-result.interface';
import { DataQualityValidator } from '../validators/data-quality.validator';
import { DimensionLookupService } from '../dimension-lookup.service';
import { TransformerConfig } from '../../interfaces';

/**
 * Source: Aggregated Exercise Completions for a Day
 */
export interface DailyProgressSource {
  user_id: string;
  module_id: string;
  progress_date: Date;
  exercises_attempted: number;
  exercises_completed: number;
  total_score: number;
  max_possible_score: number;
  total_time_seconds: number;
  first_activity_at: Date;
  last_activity_at: Date;
  perfect_scores: number;
  hints_used: number;
  comodines_used: number;
  xp_earned: number;
  ml_coins_earned: number;
  previous_streak?: number;
  is_active_day: boolean;
}

/**
 * Target: DW Fact Daily Progress Record
 */
export interface FactDailyProgress {
  /** Surrogate key */
  progress_key: number;
  /** FK to dim_date */
  date_key: number;
  /** FK to dim_student */
  student_key: number;
  /** FK to dim_module */
  module_key: number;
  /** Natural keys for reference */
  student_id: string;
  module_id: string;
  /** Date of progress (UTC) */
  progress_date: Date;
  /** Number of exercises attempted */
  exercises_attempted: number;
  /** Number of exercises completed */
  exercises_completed: number;
  /** Completion rate (0-100) */
  completion_rate: number;
  /** Sum of all scores */
  total_score: number;
  /** Maximum possible score */
  max_possible_score: number;
  /** Average score (0-100) */
  average_score: number;
  /** Total time spent in seconds */
  total_time_spent_seconds: number;
  /** Average time per exercise in seconds */
  avg_time_per_exercise_seconds: number;
  /** Number of perfect scores */
  perfect_scores: number;
  /** Number of hints used */
  hints_used: number;
  /** Number of comodines used */
  comodines_used: number;
  /** XP earned this day */
  xp_earned: number;
  /** ML Coins earned this day */
  ml_coins_earned: number;
  /** Current streak (consecutive active days) */
  current_streak: number;
  /** Whether this was an active school day */
  is_school_day: boolean;
  /** Whether student was active */
  is_active: boolean;
  /** Day of week (1=Monday, 7=Sunday) */
  day_of_week: number;
  /** Week number in year */
  week_of_year: number;
  /** Academic year */
  academic_year: number;
  /** First activity timestamp UTC */
  first_activity_utc: Date;
  /** Last activity timestamp UTC */
  last_activity_utc: Date;
  /** ETL batch ID */
  etl_batch_id: string;
  /** ETL load timestamp */
  etl_loaded_at: Date;
}

/**
 * DailyProgressTransformer
 * @description Transforms aggregated daily progress data
 */
@Injectable()
export class DailyProgressTransformer extends TransformerBaseService<
  DailyProgressSource,
  FactDailyProgress
> {
  private progressKeyCounter = 400000;
  private currentBatchId = '';

  // Track streaks by student (in production, query from DW)
  private studentStreaks = new Map<string, { lastActiveDate: Date; streak: number }>();

  constructor(
    private readonly validator: DataQualityValidator,
    private readonly dimensionLookup: DimensionLookupService,
    config?: Partial<TransformerConfig>,
  ) {
    super('DailyProgressTransformer', config);
  }

  /**
   * Validate source data before transformation
   */
  validate(data: DailyProgressSource[]): ValidationResult {
    return this.validator.validate(data, {
      rules: [
        // Required fields
        DataQualityValidator.requiredRule('user_id'),
        DataQualityValidator.requiredRule('module_id'),
        DataQualityValidator.requiredRule('progress_date'),

        // UUID validations
        DataQualityValidator.uuidRule('user_id'),
        DataQualityValidator.uuidRule('module_id'),

        // Range validations
        DataQualityValidator.rangeRule('exercises_attempted', 0, 1000, ValidationSeverity.WARNING),
        DataQualityValidator.rangeRule('exercises_completed', 0, 1000, ValidationSeverity.WARNING),
        DataQualityValidator.rangeRule('total_score', 0, undefined, ValidationSeverity.WARNING),
        DataQualityValidator.rangeRule('total_time_seconds', 0, 86400, ValidationSeverity.WARNING),
        DataQualityValidator.rangeRule('xp_earned', 0, undefined, ValidationSeverity.WARNING),
        DataQualityValidator.rangeRule('ml_coins_earned', 0, undefined, ValidationSeverity.WARNING),
      ],
      duplicateKeyFields: ['user_id', 'module_id', 'progress_date'],
      failFast: false,
      maxErrors: 1000,
      referenceTables: {
        user_id: 'auth_management.profiles',
        module_id: 'educational_content.modules',
      },
    });
  }

  /**
   * Validate a single record before transformation
   */
  protected validateRecord(record: DailyProgressSource): PreValidationResult {
    if (!record.user_id) {
      return invalidResult('Missing user ID', 'MISSING_USER_ID', 'user_id');
    }

    if (!record.module_id) {
      return invalidResult('Missing module ID', 'MISSING_MODULE_ID', 'module_id');
    }

    if (!record.progress_date) {
      return invalidResult('Missing progress date', 'MISSING_DATE', 'progress_date');
    }

    // Validate exercises_completed <= exercises_attempted
    if (record.exercises_completed > record.exercises_attempted) {
      return invalidResult(
        'Completed exercises exceeds attempted exercises',
        'INVALID_COMPLETION_COUNT',
        'exercises_completed',
      );
    }

    // Validate scores
    if (record.total_score < 0) {
      return invalidResult('Negative total score', 'INVALID_SCORE', 'total_score');
    }

    // Validate time
    if (record.total_time_seconds < 0) {
      return invalidResult('Negative time', 'INVALID_TIME', 'total_time_seconds');
    }

    return validResult();
  }

  /**
   * Transform a single daily progress record
   */
  protected async transformRecord(
    record: DailyProgressSource,
  ): Promise<FactDailyProgress | null> {
    // Convert progress_date to UTC
    const progressDateUtc = this.toUTC(record.progress_date);
    if (!progressDateUtc) {
      this.logger.warn(`Invalid progress_date for user ${record.user_id}`);
      return null;
    }

    // Get dimension keys
    const dateKey = this.getDateKey(progressDateUtc);
    const studentKey = await this.dimensionLookup.getOrCreateStudentKey(record.user_id);
    const moduleKey = await this.dimensionLookup.getModuleKey(record.module_id);

    if (!moduleKey) {
      this.logger.warn(`Module key not found for ${record.module_id}`);
      return null;
    }

    // Calculate derived metrics
    const exercisesCompleted = this.withDefault(record.exercises_completed, 0);
    const exercisesAttempted = this.withDefault(record.exercises_attempted, 0);
    const completionRate =
      exercisesAttempted > 0
        ? Math.round((exercisesCompleted / exercisesAttempted) * 100 * 100) / 100
        : 0;

    const totalScore = this.withDefault(record.total_score, 0);
    const maxPossibleScore = this.withDefault(record.max_possible_score, 100);
    const averageScore =
      exercisesCompleted > 0
        ? this.normalizeScore(totalScore / exercisesCompleted, maxPossibleScore / exercisesCompleted)
        : 0;

    const totalTimeSeconds = this.clamp(
      this.withDefault(record.total_time_seconds, 0),
      0,
      86400, // Max 24 hours per day
    );
    const avgTimePerExercise =
      exercisesCompleted > 0
        ? Math.round(totalTimeSeconds / exercisesCompleted)
        : 0;

    // Calculate streak
    const currentStreak = this.calculateStreak(record.user_id, progressDateUtc, record.is_active_day);

    // Calculate date properties
    const dayOfWeek = progressDateUtc.getUTCDay() || 7; // 1-7, Monday=1
    const weekOfYear = this.getWeekOfYear(progressDateUtc);
    const academicYear = this.getAcademicYear(progressDateUtc);
    const isSchoolDay = this.isSchoolDay(progressDateUtc);

    // First and last activity timestamps
    const firstActivityUtc = this.toUTC(record.first_activity_at) || progressDateUtc;
    const lastActivityUtc = this.toUTC(record.last_activity_at) || progressDateUtc;

    // Generate surrogate key
    const progressKey = this.progressKeyCounter++;

    return {
      progress_key: progressKey,
      date_key: dateKey,
      student_key: studentKey,
      module_key: moduleKey,
      student_id: record.user_id,
      module_id: record.module_id,
      progress_date: progressDateUtc,
      exercises_attempted: exercisesAttempted,
      exercises_completed: exercisesCompleted,
      completion_rate: completionRate,
      total_score: totalScore,
      max_possible_score: maxPossibleScore,
      average_score: averageScore,
      total_time_spent_seconds: totalTimeSeconds,
      avg_time_per_exercise_seconds: avgTimePerExercise,
      perfect_scores: this.withDefault(record.perfect_scores, 0),
      hints_used: this.withDefault(record.hints_used, 0),
      comodines_used: this.withDefault(record.comodines_used, 0),
      xp_earned: this.withDefault(record.xp_earned, 0),
      ml_coins_earned: this.withDefault(record.ml_coins_earned, 0),
      current_streak: currentStreak,
      is_school_day: isSchoolDay,
      is_active: record.is_active_day,
      day_of_week: dayOfWeek,
      week_of_year: weekOfYear,
      academic_year: academicYear,
      first_activity_utc: firstActivityUtc,
      last_activity_utc: lastActivityUtc,
      etl_batch_id: this.currentBatchId,
      etl_loaded_at: new Date(),
    };
  }

  /**
   * Calculate streak for a student
   * Streak increments if consecutive school days are active
   */
  private calculateStreak(userId: string, progressDate: Date, isActive: boolean): number {
    const existing = this.studentStreaks.get(userId);

    if (!isActive) {
      // Non-active day doesn't break streak but doesn't increment it
      return existing?.streak || 0;
    }

    if (!existing) {
      // First record for this student
      this.studentStreaks.set(userId, { lastActiveDate: progressDate, streak: 1 });
      return 1;
    }

    // Calculate days between last active date and current date
    const daysDiff = this.daysBetween(existing.lastActiveDate, progressDate);

    if (daysDiff === 0) {
      // Same day, return current streak
      return existing.streak;
    }

    if (daysDiff === 1 || this.isConsecutiveSchoolDay(existing.lastActiveDate, progressDate)) {
      // Consecutive day or consecutive school day (accounting for weekends)
      const newStreak = existing.streak + 1;
      this.studentStreaks.set(userId, { lastActiveDate: progressDate, streak: newStreak });
      return newStreak;
    }

    // Streak broken, start new streak
    this.studentStreaks.set(userId, { lastActiveDate: progressDate, streak: 1 });
    return 1;
  }

  /**
   * Check if two dates are consecutive school days
   * (Accounts for weekends)
   */
  private isConsecutiveSchoolDay(date1: Date, date2: Date): boolean {
    const dayOfWeek1 = date1.getUTCDay();
    const dayOfWeek2 = date2.getUTCDay();
    const daysDiff = this.daysBetween(date1, date2);

    // Friday to Monday is considered consecutive for school purposes
    if (dayOfWeek1 === 5 && dayOfWeek2 === 1 && daysDiff === 3) {
      return true;
    }

    return daysDiff === 1;
  }

  /**
   * Calculate days between two dates
   */
  private daysBetween(date1: Date, date2: Date): number {
    const oneDay = 24 * 60 * 60 * 1000;
    const d1 = new Date(date1.toISOString().split('T')[0]);
    const d2 = new Date(date2.toISOString().split('T')[0]);
    return Math.round(Math.abs((d2.getTime() - d1.getTime()) / oneDay));
  }

  /**
   * Get ISO week number
   */
  private getWeekOfYear(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }

  /**
   * Override transform to set batch ID
   */
  async transform(
    data: DailyProgressSource[],
    batchId: string,
  ): Promise<import('../../interfaces').TransformationResult<FactDailyProgress>> {
    this.currentBatchId = batchId;
    return super.transform(data, batchId);
  }

  /**
   * Load existing streak data for students
   * @param streaks - Array of student streak data from DW
   */
  loadExistingStreaks(
    streaks: Array<{ userId: string; lastActiveDate: Date; streak: number }>,
  ): void {
    this.studentStreaks.clear();
    for (const s of streaks) {
      this.studentStreaks.set(s.userId, {
        lastActiveDate: s.lastActiveDate,
        streak: s.streak,
      });
    }
    this.logger.log(`Loaded ${streaks.length} existing student streaks`);
  }

  /**
   * Get current streak data (for persistence)
   */
  getCurrentStreaks(): Array<{ userId: string; lastActiveDate: Date; streak: number }> {
    return Array.from(this.studentStreaks.entries()).map(([userId, data]) => ({
      userId,
      lastActiveDate: data.lastActiveDate,
      streak: data.streak,
    }));
  }
}
