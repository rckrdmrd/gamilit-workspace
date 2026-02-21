/**
 * Temporal Features Service
 *
 * @description Extracts time-based pattern features from activity data.
 * Identifies when students are most active and how regular their usage is.
 *
 * Features extracted:
 * - day_of_week_most_active: Most active day (0=Sunday to 6=Saturday)
 * - hour_of_day_most_active: Most active hour (0-23)
 * - activity_regularity_score: How consistent is usage pattern
 * - burst_activity_ratio: Cramming vs steady study pattern
 * - seasonal_engagement: Monthly engagement patterns
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

/** Temporal data shape from SQL queries */
interface TemporalData {
  most_active_day: number;
  most_active_hour: number;
  morning_ratio: number;
  afternoon_ratio: number;
  evening_ratio: number;
  night_ratio: number;
  weekend_activity_percentage: number;
  burst_ratio: number;
  regularity_score: number;
  activity_spread_days: number;
  avg_gap_hours: number;
  max_gap_days: number;
}

/**
 * Service for extracting temporal pattern features
 */
@Injectable()
export class TemporalFeaturesService extends FeatureBaseService {
  protected readonly category: FeatureCategory = 'temporal';

  /** Day names for feature descriptions */
  private readonly dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  constructor(
    @InjectDataSource('auth')
    private readonly dataSource: DataSource,
  ) {
    super(TemporalFeaturesService.name);
  }

  /**
   * Extract temporal features for a student
   *
   * @param studentId - Student identifier
   * @param lookbackDays - Number of days to look back
   * @param dateRange - Optional custom date range
   * @returns Array of temporal features
   */
  async extractFeatures(
    studentId: string,
    lookbackDays: number,
    dateRange?: { start: Date; end: Date },
  ): Promise<Feature[]> {
    this.logger.debug(`Extracting temporal features for: ${studentId}`);

    try {
      const range = dateRange || this.calculateDateRange(lookbackDays);
      const temporalData = await this.queryTemporalData(studentId, range);

      const features: Feature[] = [];

      // Feature: day_of_week_most_active
      features.push(
        this.createNumericFeature(
          'day_of_week_most_active',
          temporalData.most_active_day,
          `Most active day (${this.dayNames[temporalData.most_active_day] || 'Unknown'})`,
          'day',
          true,
          {
            method: 'min-max',
            stats: { min: 0, max: 6, mean: 3, std: 2, q1: 1, q3: 5 },
          },
        ),
      );

      // Feature: hour_of_day_most_active
      features.push(
        this.createNumericFeature(
          'hour_of_day_most_active',
          temporalData.most_active_hour,
          'Most active hour of the day (0-23)',
          'hour',
          true,
          {
            method: 'min-max',
            stats: { min: 0, max: 23, mean: 15, std: 4, q1: 10, q3: 19 },
          },
        ),
      );

      // Feature: time_slot_preference (categorical)
      const timeSlot = this.getTimeSlot(temporalData.most_active_hour);
      features.push(
        this.createCategoricalFeature(
          'time_slot_preference',
          timeSlot,
          'Preferred time of day for studying',
          ['early_morning', 'morning', 'afternoon', 'evening', 'night'],
        ),
      );

      // Feature: activity_regularity_score
      features.push(
        this.createNumericFeature(
          'activity_regularity_score',
          temporalData.regularity_score,
          'Consistency of daily activity (0=irregular, 1=very regular)',
          'score',
          true,
          {
            method: 'min-max',
            stats: { min: 0, max: 1, mean: 0.5, std: 0.25, q1: 0.3, q3: 0.7 },
          },
        ),
      );

      // Feature: burst_activity_ratio
      features.push(
        this.createNumericFeature(
          'burst_activity_ratio',
          temporalData.burst_ratio,
          'Ratio of activity in top 20% of days vs total (high=cramming)',
          'ratio',
          true,
          {
            method: 'min-max',
            stats: { min: 0.2, max: 1, mean: 0.5, std: 0.2, q1: 0.35, q3: 0.65 },
          },
        ),
      );

      // Feature: is_weekend_learner
      features.push(
        this.createBooleanFeature(
          'is_weekend_learner',
          temporalData.weekend_activity_percentage > 30,
          'Primarily studies on weekends',
        ),
      );

      // Feature: weekend_activity_percentage
      features.push(
        this.createNumericFeature(
          'weekend_activity_percentage',
          temporalData.weekend_activity_percentage,
          'Percentage of activity on weekends',
          '%',
          true,
          {
            method: 'min-max',
            stats: { min: 0, max: 100, mean: 28.5, std: 15, q1: 15, q3: 40 },
          },
        ),
      );

      // Feature: morning_activity_ratio
      features.push(
        this.createNumericFeature(
          'morning_activity_ratio',
          temporalData.morning_ratio,
          'Ratio of activity in morning (6-12)',
          'ratio',
          true,
          {
            method: 'min-max',
            stats: { min: 0, max: 1, mean: 0.25, std: 0.15, q1: 0.1, q3: 0.4 },
          },
        ),
      );

      // Feature: afternoon_activity_ratio
      features.push(
        this.createNumericFeature(
          'afternoon_activity_ratio',
          temporalData.afternoon_ratio,
          'Ratio of activity in afternoon (12-18)',
          'ratio',
          true,
          {
            method: 'min-max',
            stats: { min: 0, max: 1, mean: 0.35, std: 0.15, q1: 0.2, q3: 0.5 },
          },
        ),
      );

      // Feature: evening_activity_ratio
      features.push(
        this.createNumericFeature(
          'evening_activity_ratio',
          temporalData.evening_ratio,
          'Ratio of activity in evening (18-22)',
          'ratio',
          true,
          {
            method: 'min-max',
            stats: { min: 0, max: 1, mean: 0.3, std: 0.15, q1: 0.15, q3: 0.45 },
          },
        ),
      );

      // Feature: night_activity_ratio
      features.push(
        this.createNumericFeature(
          'night_activity_ratio',
          temporalData.night_ratio,
          'Ratio of activity at night (22-6)',
          'ratio',
          true,
          {
            method: 'min-max',
            stats: { min: 0, max: 1, mean: 0.1, std: 0.1, q1: 0, q3: 0.15 },
          },
        ),
      );

      // Feature: activity_spread_days
      features.push(
        this.createNumericFeature(
          'activity_spread_days',
          temporalData.activity_spread_days,
          'Number of unique days with activity',
          'days',
          true,
          {
            method: 'min-max',
            stats: { min: 0, max: lookbackDays, mean: lookbackDays * 0.5, std: lookbackDays * 0.25, q1: lookbackDays * 0.25, q3: lookbackDays * 0.75 },
          },
        ),
      );

      // Feature: avg_gap_between_sessions_hours
      features.push(
        this.createNumericFeature(
          'avg_gap_between_sessions_hours',
          temporalData.avg_gap_hours,
          'Average hours between study sessions',
          'hours',
          true,
          {
            method: 'robust',
            stats: { min: 0, max: 168, mean: 24, std: 20, q1: 12, q3: 48 },
          },
        ),
      );

      // Feature: max_gap_between_sessions_days
      features.push(
        this.createNumericFeature(
          'max_gap_between_sessions_days',
          temporalData.max_gap_days,
          'Longest break between sessions',
          'days',
          true,
          {
            method: 'min-max',
            stats: { min: 0, max: 30, mean: 5, std: 5, q1: 1, q3: 7 },
          },
        ),
      );

      this.logger.debug(
        `Extracted ${features.length} temporal features for ${studentId}`,
      );

      return features;
    } catch (error) {
      this.logger.error(
        `Error extracting temporal features for ${studentId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return this.getDefaultFeatures();
    }
  }

  /**
   * Query temporal data from data warehouse and operational tables
   */
  private async queryTemporalData(
    studentId: string,
    dateRange: { start: Date; end: Date },
  ): Promise<TemporalData> {
    const defaultData = this.getDefaultTemporalData();

    try {
      // Query data warehouse for temporal patterns
      const dwQuery = `
        WITH activity_by_time AS (
          SELECT
            dd.day_of_week,
            dt.hour_24 AS activity_hour,
            dd.is_weekend,
            dd.full_date,
            COUNT(*) AS activity_count,
            SUM(fec.time_spent_seconds) AS total_time
          FROM data_warehouse.fact_exercise_completions fec
          JOIN data_warehouse.dim_student ds ON fec.student_key = ds.student_key
          JOIN data_warehouse.dim_date dd ON fec.date_key = dd.date_key
          JOIN data_warehouse.dim_time dt ON fec.time_key = dt.time_key
          WHERE ds.student_id = $1
            AND ds.is_current = true
            AND dd.full_date BETWEEN $2 AND $3
          GROUP BY dd.day_of_week, dt.hour_24, dd.is_weekend, dd.full_date
        ),
        day_stats AS (
          SELECT
            day_of_week,
            SUM(activity_count) AS day_count
          FROM activity_by_time
          GROUP BY day_of_week
          ORDER BY day_count DESC
          LIMIT 1
        ),
        hour_stats AS (
          SELECT
            activity_hour,
            SUM(activity_count) AS hour_count
          FROM activity_by_time
          GROUP BY activity_hour
          ORDER BY hour_count DESC
          LIMIT 1
        ),
        time_distribution AS (
          SELECT
            SUM(CASE WHEN activity_hour >= 6 AND activity_hour < 12 THEN activity_count ELSE 0 END)::float /
              NULLIF(SUM(activity_count), 0) AS morning_ratio,
            SUM(CASE WHEN activity_hour >= 12 AND activity_hour < 18 THEN activity_count ELSE 0 END)::float /
              NULLIF(SUM(activity_count), 0) AS afternoon_ratio,
            SUM(CASE WHEN activity_hour >= 18 AND activity_hour < 22 THEN activity_count ELSE 0 END)::float /
              NULLIF(SUM(activity_count), 0) AS evening_ratio,
            SUM(CASE WHEN activity_hour >= 22 OR activity_hour < 6 THEN activity_count ELSE 0 END)::float /
              NULLIF(SUM(activity_count), 0) AS night_ratio,
            SUM(CASE WHEN is_weekend THEN activity_count ELSE 0 END)::float /
              NULLIF(SUM(activity_count), 0) * 100 AS weekend_activity_percentage
          FROM activity_by_time
        ),
        daily_totals AS (
          SELECT
            full_date,
            SUM(activity_count) AS daily_activity
          FROM activity_by_time
          GROUP BY full_date
          ORDER BY daily_activity DESC
        ),
        burst_stats AS (
          SELECT
            SUM(daily_activity) FILTER (WHERE row_num <= CEIL(COUNT(*) OVER () * 0.2))::float /
              NULLIF(SUM(daily_activity) OVER (), 0) AS burst_ratio
          FROM (
            SELECT
              daily_activity,
              ROW_NUMBER() OVER (ORDER BY daily_activity DESC) AS row_num
            FROM daily_totals
          ) ranked
        ),
        regularity AS (
          SELECT
            1 - (STDDEV(daily_activity) / NULLIF(AVG(daily_activity), 0)) AS regularity_score,
            COUNT(DISTINCT full_date) AS activity_spread_days
          FROM daily_totals
        ),
        session_gaps AS (
          SELECT
            AVG(gap_hours) AS avg_gap_hours,
            MAX(gap_hours) / 24 AS max_gap_days
          FROM (
            SELECT
              EXTRACT(EPOCH FROM (full_date - LAG(full_date) OVER (ORDER BY full_date))) / 3600 AS gap_hours
            FROM (SELECT DISTINCT full_date FROM activity_by_time ORDER BY full_date) dates
          ) gaps
          WHERE gap_hours IS NOT NULL
        )
        SELECT
          COALESCE(ds.day_of_week, 3) AS most_active_day,
          COALESCE(hs.activity_hour, 15) AS most_active_hour,
          COALESCE(td.morning_ratio, 0.25) AS morning_ratio,
          COALESCE(td.afternoon_ratio, 0.35) AS afternoon_ratio,
          COALESCE(td.evening_ratio, 0.3) AS evening_ratio,
          COALESCE(td.night_ratio, 0.1) AS night_ratio,
          COALESCE(td.weekend_activity_percentage, 28.5) AS weekend_activity_percentage,
          COALESCE((SELECT burst_ratio FROM burst_stats LIMIT 1), 0.5) AS burst_ratio,
          COALESCE(GREATEST(0, LEAST(1, r.regularity_score)), 0.5) AS regularity_score,
          COALESCE(r.activity_spread_days, 0) AS activity_spread_days,
          COALESCE(sg.avg_gap_hours, 24) AS avg_gap_hours,
          COALESCE(sg.max_gap_days, 7) AS max_gap_days
        FROM day_stats ds
        CROSS JOIN hour_stats hs
        CROSS JOIN time_distribution td
        CROSS JOIN regularity r
        CROSS JOIN session_gaps sg
      `;

      const result = await this.dataSource.query(dwQuery, [
        studentId,
        dateRange.start,
        dateRange.end,
      ]);

      if (result && result.length > 0) {
        return { ...defaultData, ...result[0] };
      }
    } catch (error) {
      this.logger.debug(
        `Data warehouse query failed: ${error instanceof Error ? error.message : 'Unknown'}`,
      );
    }

    // Fallback to operational tables
    try {
      return await this.queryOperationalTemporal(studentId, dateRange);
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
  private async queryOperationalTemporal(
    studentId: string,
    dateRange: { start: Date; end: Date },
  ): Promise<TemporalData> {
    const defaultData = this.getDefaultTemporalData();

    const query = `
      WITH session_data AS (
        SELECT
          EXTRACT(DOW FROM ls.started_at) AS day_of_week,
          EXTRACT(HOUR FROM ls.started_at) AS activity_hour,
          EXTRACT(DOW FROM ls.started_at) IN (0, 6) AS is_weekend,
          ls.started_at::date AS activity_date,
          1 AS activity_count
        FROM progress_tracking.learning_sessions ls
        WHERE ls.user_id = $1
          AND ls.started_at BETWEEN $2 AND $3
      ),
      day_stats AS (
        SELECT day_of_week, COUNT(*) AS cnt
        FROM session_data
        GROUP BY day_of_week
        ORDER BY cnt DESC
        LIMIT 1
      ),
      hour_stats AS (
        SELECT activity_hour, COUNT(*) AS cnt
        FROM session_data
        GROUP BY activity_hour
        ORDER BY cnt DESC
        LIMIT 1
      )
      SELECT
        COALESCE((SELECT day_of_week FROM day_stats), 3) AS most_active_day,
        COALESCE((SELECT activity_hour FROM hour_stats), 15) AS most_active_hour,
        COUNT(DISTINCT activity_date) AS activity_spread_days,
        COUNT(*) FILTER (WHERE is_weekend)::float / NULLIF(COUNT(*), 0) * 100 AS weekend_activity_percentage
      FROM session_data
    `;

    const result = await this.dataSource.query(query, [
      studentId,
      dateRange.start,
      dateRange.end,
    ]);

    if (result && result.length > 0) {
      return { ...defaultData, ...result[0] };
    }

    return defaultData;
  }

  /**
   * Convert hour to time slot
   */
  private getTimeSlot(hour: number): string {
    if (hour >= 5 && hour < 9) return 'early_morning';
    if (hour >= 9 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  }

  /**
   * Get default temporal data
   */
  private getDefaultTemporalData(): TemporalData {
    return {
      most_active_day: 3, // Wednesday
      most_active_hour: 15, // 3 PM
      morning_ratio: 0.25,
      afternoon_ratio: 0.35,
      evening_ratio: 0.3,
      night_ratio: 0.1,
      weekend_activity_percentage: 28.5,
      burst_ratio: 0.5,
      regularity_score: 0.5,
      activity_spread_days: 0,
      avg_gap_hours: 24,
      max_gap_days: 7,
    };
  }

  /**
   * Get default features when temporal data is unavailable
   */
  private getDefaultFeatures(): Feature[] {
    return [
      this.createNumericFeature('day_of_week_most_active', 3, 'Most active day', 'day'),
      this.createNumericFeature('hour_of_day_most_active', 15, 'Most active hour', 'hour'),
      this.createCategoricalFeature('time_slot_preference', 'afternoon', 'Time slot preference'),
      this.createNumericFeature('activity_regularity_score', 0.5, 'Regularity score', 'score'),
      this.createNumericFeature('burst_activity_ratio', 0.5, 'Burst ratio', 'ratio'),
      this.createBooleanFeature('is_weekend_learner', false, 'Weekend learner'),
      this.createNumericFeature('weekend_activity_percentage', 28.5, 'Weekend activity', '%'),
      this.createNumericFeature('morning_activity_ratio', 0.25, 'Morning ratio', 'ratio'),
      this.createNumericFeature('afternoon_activity_ratio', 0.35, 'Afternoon ratio', 'ratio'),
      this.createNumericFeature('evening_activity_ratio', 0.3, 'Evening ratio', 'ratio'),
      this.createNumericFeature('night_activity_ratio', 0.1, 'Night ratio', 'ratio'),
      this.createNumericFeature('activity_spread_days', 0, 'Activity spread', 'days'),
      this.createNumericFeature('avg_gap_between_sessions_hours', 24, 'Avg gap', 'hours'),
      this.createNumericFeature('max_gap_between_sessions_days', 7, 'Max gap', 'days'),
    ];
  }
}
