/**
 * Performance Features Service
 *
 * @description Extracts performance features from fact_exercise_completions.
 * Focuses on scores, completion rates, time efficiency, and trends.
 *
 * Features extracted:
 * - avg_score_7d, avg_score_30d, avg_score_all: Score trends
 * - completion_rate_7d, completion_rate_30d: Completion trends
 * - exercises_completed_total: Total completions
 * - exercises_failed_total: Total failures
 * - avg_time_per_exercise: Time efficiency
 * - difficulty_preference: Easy/medium/hard ratio
 * - module_progress_*: Progress per module (M1-M5)
 * - score_variance: Consistency metric
 * - improvement_trend: Score slope over time
 *
 * @module ML
 * @sprint 3.1 - Feature Engineering for ML Predictions
 * @created 2026-02-03
 */

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Feature, FeatureCategory } from '../../interfaces';
import { FeatureBaseService } from './feature-base.service';

/** Performance data shape from SQL queries */
interface PerformanceData {
  avg_score_7d: number;
  avg_score_30d: number;
  avg_score_all: number;
  completion_rate_7d: number;
  completion_rate_30d: number;
  exercises_completed_total: number;
  exercises_attempted_total: number;
  exercises_failed_total: number;
  avg_time_per_exercise: number;
  perfect_score_count: number;
  difficulty_easy_ratio: number;
  difficulty_medium_ratio: number;
  difficulty_hard_ratio: number;
  score_variance: number;
  improvement_trend: number;
  hints_usage_rate: number;
  first_attempt_success_rate: number;
  module_1_progress: number;
  module_2_progress: number;
  module_3_progress: number;
  module_4_progress: number;
  module_5_progress: number;
}

/**
 * Service for extracting performance features from fact_exercise_completions
 */
@Injectable()
export class PerformanceFeaturesService extends FeatureBaseService {
  protected readonly category: FeatureCategory = 'performance';

  constructor(
    @InjectDataSource('auth')
    private readonly dataSource: DataSource,
  ) {
    super(PerformanceFeaturesService.name);
  }

  /**
   * Extract performance features for a student
   *
   * @param studentId - Student identifier
   * @param lookbackDays - Number of days to look back
   * @param dateRange - Optional custom date range
   * @returns Array of performance features
   */
  async extractFeatures(
    studentId: string,
    lookbackDays: number,
    dateRange?: { start: Date; end: Date },
  ): Promise<Feature[]> {
    this.logger.debug(`Extracting performance features for: ${studentId}`);

    try {
      const range = dateRange || this.calculateDateRange(lookbackDays);
      const performanceData = await this.queryPerformanceData(studentId, range);

      const features: Feature[] = [];

      // Feature: avg_score_7d
      features.push(
        this.createNumericFeature(
          'avg_score_7d',
          performanceData.avg_score_7d,
          'Average score in last 7 days',
          '%',
          true,
          {
            method: 'min-max',
            stats: { min: 0, max: 100, mean: 70, std: 20, q1: 55, q3: 85 },
          },
        ),
      );

      // Feature: avg_score_30d
      features.push(
        this.createNumericFeature(
          'avg_score_30d',
          performanceData.avg_score_30d,
          'Average score in last 30 days',
          '%',
          true,
          {
            method: 'min-max',
            stats: { min: 0, max: 100, mean: 70, std: 18, q1: 58, q3: 82 },
          },
        ),
      );

      // Feature: avg_score_all
      features.push(
        this.createNumericFeature(
          'avg_score_all',
          performanceData.avg_score_all,
          'Average score across all time',
          '%',
          true,
          {
            method: 'min-max',
            stats: { min: 0, max: 100, mean: 68, std: 15, q1: 60, q3: 80 },
          },
        ),
      );

      // Feature: completion_rate_7d
      features.push(
        this.createNumericFeature(
          'completion_rate_7d',
          performanceData.completion_rate_7d,
          'Exercise completion rate (7 days)',
          '%',
          true,
          {
            method: 'min-max',
            stats: { min: 0, max: 100, mean: 75, std: 20, q1: 60, q3: 90 },
          },
        ),
      );

      // Feature: completion_rate_30d
      features.push(
        this.createNumericFeature(
          'completion_rate_30d',
          performanceData.completion_rate_30d,
          'Exercise completion rate (30 days)',
          '%',
          true,
          {
            method: 'min-max',
            stats: { min: 0, max: 100, mean: 72, std: 18, q1: 58, q3: 88 },
          },
        ),
      );

      // Feature: exercises_completed_total
      features.push(
        this.createNumericFeature(
          'exercises_completed_total',
          performanceData.exercises_completed_total,
          'Total exercises completed',
          'exercises',
          true,
          {
            method: 'robust',
            stats: { min: 0, max: 1000, mean: 150, std: 120, q1: 30, q3: 250 },
          },
        ),
      );

      // Feature: exercises_attempted_total
      features.push(
        this.createNumericFeature(
          'exercises_attempted_total',
          performanceData.exercises_attempted_total,
          'Total exercises attempted',
          'exercises',
          true,
          {
            method: 'robust',
            stats: { min: 0, max: 1200, mean: 180, std: 140, q1: 40, q3: 300 },
          },
        ),
      );

      // Feature: exercises_failed_total
      features.push(
        this.createNumericFeature(
          'exercises_failed_total',
          performanceData.exercises_failed_total,
          'Total exercises failed',
          'exercises',
          true,
          {
            method: 'robust',
            stats: { min: 0, max: 300, mean: 30, std: 40, q1: 5, q3: 50 },
          },
        ),
      );

      // Feature: avg_time_per_exercise
      features.push(
        this.createNumericFeature(
          'avg_time_per_exercise',
          performanceData.avg_time_per_exercise,
          'Average time spent per exercise',
          'seconds',
          true,
          {
            method: 'robust',
            stats: { min: 0, max: 600, mean: 120, std: 80, q1: 60, q3: 180 },
          },
        ),
      );

      // Feature: perfect_score_count
      features.push(
        this.createNumericFeature(
          'perfect_score_count',
          performanceData.perfect_score_count,
          'Number of perfect scores (100%)',
          'count',
          true,
          {
            method: 'robust',
            stats: { min: 0, max: 200, mean: 25, std: 30, q1: 5, q3: 45 },
          },
        ),
      );

      // Feature: difficulty_easy_ratio
      features.push(
        this.createNumericFeature(
          'difficulty_easy_ratio',
          performanceData.difficulty_easy_ratio,
          'Ratio of easy exercises completed',
          'ratio',
          true,
          {
            method: 'min-max',
            stats: { min: 0, max: 1, mean: 0.4, std: 0.2, q1: 0.25, q3: 0.55 },
          },
        ),
      );

      // Feature: difficulty_medium_ratio
      features.push(
        this.createNumericFeature(
          'difficulty_medium_ratio',
          performanceData.difficulty_medium_ratio,
          'Ratio of medium exercises completed',
          'ratio',
          true,
          {
            method: 'min-max',
            stats: { min: 0, max: 1, mean: 0.4, std: 0.2, q1: 0.25, q3: 0.55 },
          },
        ),
      );

      // Feature: difficulty_hard_ratio
      features.push(
        this.createNumericFeature(
          'difficulty_hard_ratio',
          performanceData.difficulty_hard_ratio,
          'Ratio of hard exercises completed',
          'ratio',
          true,
          {
            method: 'min-max',
            stats: { min: 0, max: 1, mean: 0.2, std: 0.15, q1: 0.05, q3: 0.3 },
          },
        ),
      );

      // Feature: score_variance
      features.push(
        this.createNumericFeature(
          'score_variance',
          performanceData.score_variance,
          'Variance in scores (consistency metric)',
          'variance',
          true,
          {
            method: 'robust',
            stats: { min: 0, max: 1000, mean: 200, std: 150, q1: 50, q3: 300 },
          },
        ),
      );

      // Feature: improvement_trend
      features.push(
        this.createNumericFeature(
          'improvement_trend',
          performanceData.improvement_trend,
          'Score improvement trend (slope)',
          'slope',
          true,
          {
            method: 'min-max',
            stats: { min: -10, max: 10, mean: 0.5, std: 2, q1: -1, q3: 2 },
          },
        ),
      );

      // Feature: hints_usage_rate
      features.push(
        this.createNumericFeature(
          'hints_usage_rate',
          performanceData.hints_usage_rate,
          'Rate of exercises where hints were used',
          'ratio',
          true,
          {
            method: 'min-max',
            stats: { min: 0, max: 1, mean: 0.3, std: 0.2, q1: 0.1, q3: 0.45 },
          },
        ),
      );

      // Feature: first_attempt_success_rate
      features.push(
        this.createNumericFeature(
          'first_attempt_success_rate',
          performanceData.first_attempt_success_rate,
          'Success rate on first attempt',
          '%',
          true,
          {
            method: 'min-max',
            stats: { min: 0, max: 100, mean: 60, std: 20, q1: 45, q3: 75 },
          },
        ),
      );

      // Module progress features (M1-M5)
      for (let i = 1; i <= 5; i++) {
        const moduleKey = `module_${i}_progress` as keyof typeof performanceData;
        features.push(
          this.createNumericFeature(
            `module_progress_m${i}`,
            performanceData[moduleKey] as number || 0,
            `Progress in Module ${i}`,
            '%',
            true,
            {
              method: 'min-max',
              stats: { min: 0, max: 100, mean: 50, std: 30, q1: 20, q3: 80 },
            },
          ),
        );
      }

      this.logger.debug(
        `Extracted ${features.length} performance features for ${studentId}`,
      );

      return features;
    } catch (error) {
      this.logger.error(
        `Error extracting performance features for ${studentId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return this.getDefaultFeatures();
    }
  }

  /**
   * Query performance data from data warehouse
   */
  private async queryPerformanceData(
    studentId: string,
    dateRange: { start: Date; end: Date },
  ): Promise<PerformanceData> {
    const defaultData = this.getDefaultPerformanceData();

    try {
      // Query data warehouse fact_exercise_completions
      const dwQuery = `
        WITH completion_data AS (
          SELECT
            fec.date_key,
            fec.score_percentage,
            fec.time_spent_seconds,
            fec.is_passed,
            fec.is_perfect,
            fec.is_first_attempt,
            fec.hints_used,
            de.difficulty_level,
            dm.module_id,
            dd.full_date
          FROM data_warehouse.fact_exercise_completions fec
          JOIN data_warehouse.dim_student ds ON fec.student_key = ds.student_key
          JOIN data_warehouse.dim_exercise de ON fec.exercise_key = de.exercise_key
          JOIN data_warehouse.dim_module dm ON fec.module_key = dm.module_key
          JOIN data_warehouse.dim_date dd ON fec.date_key = dd.date_key
          WHERE ds.student_id = $1
            AND ds.is_current = true
            AND dd.full_date BETWEEN $2 AND $3
        ),
        score_aggregates AS (
          SELECT
            AVG(CASE WHEN full_date >= CURRENT_DATE - INTERVAL '7 days' THEN score_percentage END) AS avg_score_7d,
            AVG(CASE WHEN full_date >= CURRENT_DATE - INTERVAL '30 days' THEN score_percentage END) AS avg_score_30d,
            AVG(score_percentage) AS avg_score_all,
            VARIANCE(score_percentage) AS score_variance,
            COUNT(*) FILTER (WHERE is_perfect) AS perfect_score_count
          FROM completion_data
        ),
        completion_rates AS (
          SELECT
            (COUNT(*) FILTER (WHERE is_passed AND full_date >= CURRENT_DATE - INTERVAL '7 days'))::float /
              NULLIF(COUNT(*) FILTER (WHERE full_date >= CURRENT_DATE - INTERVAL '7 days'), 0) * 100 AS completion_rate_7d,
            (COUNT(*) FILTER (WHERE is_passed AND full_date >= CURRENT_DATE - INTERVAL '30 days'))::float /
              NULLIF(COUNT(*) FILTER (WHERE full_date >= CURRENT_DATE - INTERVAL '30 days'), 0) * 100 AS completion_rate_30d,
            COUNT(*) FILTER (WHERE is_passed) AS exercises_completed_total,
            COUNT(*) AS exercises_attempted_total,
            COUNT(*) FILTER (WHERE NOT is_passed) AS exercises_failed_total,
            AVG(time_spent_seconds) AS avg_time_per_exercise
          FROM completion_data
        ),
        difficulty_distribution AS (
          SELECT
            COUNT(*) FILTER (WHERE difficulty_level = 'easy')::float / NULLIF(COUNT(*), 0) AS difficulty_easy_ratio,
            COUNT(*) FILTER (WHERE difficulty_level = 'medium')::float / NULLIF(COUNT(*), 0) AS difficulty_medium_ratio,
            COUNT(*) FILTER (WHERE difficulty_level = 'hard')::float / NULLIF(COUNT(*), 0) AS difficulty_hard_ratio
          FROM completion_data
        ),
        hint_stats AS (
          SELECT
            COUNT(*) FILTER (WHERE hints_used > 0)::float / NULLIF(COUNT(*), 0) AS hints_usage_rate,
            COUNT(*) FILTER (WHERE is_first_attempt AND is_passed)::float / NULLIF(COUNT(*) FILTER (WHERE is_first_attempt), 0) * 100 AS first_attempt_success_rate
          FROM completion_data
        ),
        module_progress AS (
          SELECT
            MAX(CASE WHEN module_id = 'M1' OR module_id LIKE '%module-1%' THEN score_percentage END) AS module_1_progress,
            MAX(CASE WHEN module_id = 'M2' OR module_id LIKE '%module-2%' THEN score_percentage END) AS module_2_progress,
            MAX(CASE WHEN module_id = 'M3' OR module_id LIKE '%module-3%' THEN score_percentage END) AS module_3_progress,
            MAX(CASE WHEN module_id = 'M4' OR module_id LIKE '%module-4%' THEN score_percentage END) AS module_4_progress,
            MAX(CASE WHEN module_id = 'M5' OR module_id LIKE '%module-5%' THEN score_percentage END) AS module_5_progress
          FROM completion_data
        )
        SELECT
          COALESCE(sa.avg_score_7d, 0) AS avg_score_7d,
          COALESCE(sa.avg_score_30d, 0) AS avg_score_30d,
          COALESCE(sa.avg_score_all, 0) AS avg_score_all,
          COALESCE(sa.score_variance, 0) AS score_variance,
          COALESCE(sa.perfect_score_count, 0) AS perfect_score_count,
          COALESCE(cr.completion_rate_7d, 0) AS completion_rate_7d,
          COALESCE(cr.completion_rate_30d, 0) AS completion_rate_30d,
          COALESCE(cr.exercises_completed_total, 0) AS exercises_completed_total,
          COALESCE(cr.exercises_attempted_total, 0) AS exercises_attempted_total,
          COALESCE(cr.exercises_failed_total, 0) AS exercises_failed_total,
          COALESCE(cr.avg_time_per_exercise, 0) AS avg_time_per_exercise,
          COALESCE(dd.difficulty_easy_ratio, 0.33) AS difficulty_easy_ratio,
          COALESCE(dd.difficulty_medium_ratio, 0.33) AS difficulty_medium_ratio,
          COALESCE(dd.difficulty_hard_ratio, 0.33) AS difficulty_hard_ratio,
          COALESCE(hs.hints_usage_rate, 0) AS hints_usage_rate,
          COALESCE(hs.first_attempt_success_rate, 0) AS first_attempt_success_rate,
          COALESCE(mp.module_1_progress, 0) AS module_1_progress,
          COALESCE(mp.module_2_progress, 0) AS module_2_progress,
          COALESCE(mp.module_3_progress, 0) AS module_3_progress,
          COALESCE(mp.module_4_progress, 0) AS module_4_progress,
          COALESCE(mp.module_5_progress, 0) AS module_5_progress
        FROM score_aggregates sa
        CROSS JOIN completion_rates cr
        CROSS JOIN difficulty_distribution dd
        CROSS JOIN hint_stats hs
        CROSS JOIN module_progress mp
      `;

      const result = await this.dataSource.query(dwQuery, [
        studentId,
        dateRange.start,
        dateRange.end,
      ]);

      if (result && result.length > 0) {
        const data = result[0];

        // Calculate improvement trend
        const trendQuery = `
          SELECT
            AVG(score_percentage) AS avg_score,
            DATE_TRUNC('week', dd.full_date) AS week
          FROM data_warehouse.fact_exercise_completions fec
          JOIN data_warehouse.dim_student ds ON fec.student_key = ds.student_key
          JOIN data_warehouse.dim_date dd ON fec.date_key = dd.date_key
          WHERE ds.student_id = $1
            AND ds.is_current = true
            AND dd.full_date BETWEEN $2 AND $3
          GROUP BY DATE_TRUNC('week', dd.full_date)
          ORDER BY week
        `;

        try {
          const trendResult = await this.dataSource.query(trendQuery, [
            studentId,
            dateRange.start,
            dateRange.end,
          ]);

          if (trendResult && trendResult.length >= 2) {
            const scores = trendResult.map((r: Record<string, unknown>) => parseFloat(String(r.avg_score)) || 0);
            data.improvement_trend = this.calculateTrendSlope(scores);
          } else {
            data.improvement_trend = 0;
          }
        } catch {
          data.improvement_trend = 0;
        }

        return { ...defaultData, ...data };
      }
    } catch (error) {
      this.logger.debug(
        `Data warehouse query failed: ${error instanceof Error ? error.message : 'Unknown'}`,
      );
    }

    // Fallback to operational tables
    try {
      return await this.queryOperationalPerformance(studentId, dateRange);
    } catch (error) {
      this.logger.error(
        `Operational query also failed: ${error instanceof Error ? error.message : 'Unknown'}`,
      );
    }

    return defaultData;
  }

  /**
   * Fallback query to operational tables
   */
  private async queryOperationalPerformance(
    studentId: string,
    dateRange: { start: Date; end: Date },
  ): Promise<PerformanceData> {
    const defaultData = this.getDefaultPerformanceData();

    const query = `
      SELECT
        AVG(CASE WHEN es.submitted_at >= CURRENT_DATE - INTERVAL '7 days' THEN (es.score::float / NULLIF(es.max_score, 0) * 100) END) AS avg_score_7d,
        AVG(CASE WHEN es.submitted_at >= CURRENT_DATE - INTERVAL '30 days' THEN (es.score::float / NULLIF(es.max_score, 0) * 100) END) AS avg_score_30d,
        AVG(es.score::float / NULLIF(es.max_score, 0) * 100) AS avg_score_all,
        VARIANCE(es.score::float / NULLIF(es.max_score, 0) * 100) AS score_variance,
        COUNT(*) FILTER (WHERE es.score = es.max_score) AS perfect_score_count,
        COUNT(*) FILTER (WHERE es.is_correct) AS exercises_completed_total,
        COUNT(*) AS exercises_attempted_total,
        COUNT(*) FILTER (WHERE NOT es.is_correct) AS exercises_failed_total,
        AVG(es.time_spent_seconds) AS avg_time_per_exercise
      FROM progress_tracking.exercise_submissions es
      WHERE es.user_id = $1
        AND es.submitted_at BETWEEN $2 AND $3
    `;

    const result = await this.dataSource.query(query, [
      studentId,
      dateRange.start,
      dateRange.end,
    ]);

    if (result && result.length > 0) {
      return { ...defaultData, ...result[0], improvement_trend: 0 };
    }

    return defaultData;
  }

  /**
   * Get default performance data
   */
  private getDefaultPerformanceData(): PerformanceData {
    return {
      avg_score_7d: 0,
      avg_score_30d: 0,
      avg_score_all: 0,
      completion_rate_7d: 0,
      completion_rate_30d: 0,
      exercises_completed_total: 0,
      exercises_attempted_total: 0,
      exercises_failed_total: 0,
      avg_time_per_exercise: 0,
      perfect_score_count: 0,
      difficulty_easy_ratio: 0.33,
      difficulty_medium_ratio: 0.33,
      difficulty_hard_ratio: 0.33,
      score_variance: 0,
      improvement_trend: 0,
      hints_usage_rate: 0,
      first_attempt_success_rate: 0,
      module_1_progress: 0,
      module_2_progress: 0,
      module_3_progress: 0,
      module_4_progress: 0,
      module_5_progress: 0,
    };
  }

  /**
   * Get default features when performance data is unavailable
   */
  private getDefaultFeatures(): Feature[] {
    const features: Feature[] = [
      this.createNumericFeature('avg_score_7d', 0, 'Avg score (7d)', '%'),
      this.createNumericFeature('avg_score_30d', 0, 'Avg score (30d)', '%'),
      this.createNumericFeature('avg_score_all', 0, 'Avg score (all)', '%'),
      this.createNumericFeature('completion_rate_7d', 0, 'Completion (7d)', '%'),
      this.createNumericFeature('completion_rate_30d', 0, 'Completion (30d)', '%'),
      this.createNumericFeature('exercises_completed_total', 0, 'Completed', 'exercises'),
      this.createNumericFeature('exercises_attempted_total', 0, 'Attempted', 'exercises'),
      this.createNumericFeature('exercises_failed_total', 0, 'Failed', 'exercises'),
      this.createNumericFeature('avg_time_per_exercise', 0, 'Avg time', 'seconds'),
      this.createNumericFeature('perfect_score_count', 0, 'Perfect scores', 'count'),
      this.createNumericFeature('difficulty_easy_ratio', 0.33, 'Easy ratio', 'ratio'),
      this.createNumericFeature('difficulty_medium_ratio', 0.33, 'Medium ratio', 'ratio'),
      this.createNumericFeature('difficulty_hard_ratio', 0.33, 'Hard ratio', 'ratio'),
      this.createNumericFeature('score_variance', 0, 'Score variance', 'variance'),
      this.createNumericFeature('improvement_trend', 0, 'Improvement trend', 'slope'),
      this.createNumericFeature('hints_usage_rate', 0, 'Hints usage', 'ratio'),
      this.createNumericFeature('first_attempt_success_rate', 0, 'First attempt success', '%'),
    ];

    // Add module progress features
    for (let i = 1; i <= 5; i++) {
      features.push(
        this.createNumericFeature(`module_progress_m${i}`, 0, `Module ${i} progress`, '%'),
      );
    }

    return features;
  }
}
