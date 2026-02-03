/**
 * Engagement Features Service
 *
 * @description Extracts engagement features from fact_daily_progress.
 * Focuses on login patterns, session behavior, and streaks.
 *
 * Features extracted:
 * - login_frequency_7d: Logins in last 7 days
 * - login_frequency_30d: Logins in last 30 days
 * - avg_session_duration: Average session length
 * - streak_current: Current login streak
 * - streak_max: Maximum streak achieved
 * - days_since_last_login: Recency
 * - weekend_activity_ratio: Weekend vs weekday usage
 * - preferred_time_slot: Morning/afternoon/evening/night
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

/**
 * Service for extracting engagement features from fact_daily_progress
 */
@Injectable()
export class EngagementFeaturesService extends FeatureBaseService {
  protected readonly category: FeatureCategory = 'engagement';

  constructor(
    @InjectDataSource('auth')
    private readonly dataSource: DataSource,
  ) {
    super(EngagementFeaturesService.name);
  }

  /**
   * Extract engagement features for a student
   *
   * @param studentId - Student identifier
   * @param lookbackDays - Number of days to look back
   * @param dateRange - Optional custom date range
   * @returns Array of engagement features
   */
  async extractFeatures(
    studentId: string,
    lookbackDays: number,
    dateRange?: { start: Date; end: Date },
  ): Promise<Feature[]> {
    this.logger.debug(`Extracting engagement features for: ${studentId}`);

    try {
      const range = dateRange || this.calculateDateRange(lookbackDays);
      const engagementData = await this.queryEngagementData(studentId, range);

      const features: Feature[] = [];

      // Feature: login_frequency_7d
      features.push(
        this.createNumericFeature(
          'login_frequency_7d',
          engagementData.login_count_7d,
          'Number of logins in the last 7 days',
          'logins',
          true,
          {
            method: 'min-max',
            stats: { min: 0, max: 7, mean: 3.5, std: 2, q1: 1, q3: 6 },
          },
        ),
      );

      // Feature: login_frequency_30d
      features.push(
        this.createNumericFeature(
          'login_frequency_30d',
          engagementData.login_count_30d,
          'Number of logins in the last 30 days',
          'logins',
          true,
          {
            method: 'min-max',
            stats: { min: 0, max: 30, mean: 15, std: 8, q1: 5, q3: 22 },
          },
        ),
      );

      // Feature: avg_session_duration
      features.push(
        this.createNumericFeature(
          'avg_session_duration',
          engagementData.avg_session_duration_minutes,
          'Average session duration in minutes',
          'minutes',
          true,
          {
            method: 'robust',
            stats: { min: 0, max: 120, mean: 25, std: 15, q1: 10, q3: 40 },
          },
        ),
      );

      // Feature: total_session_time_30d
      features.push(
        this.createNumericFeature(
          'total_session_time_30d',
          engagementData.total_session_time_30d,
          'Total time spent in sessions (30 days)',
          'minutes',
          true,
          {
            method: 'robust',
            stats: { min: 0, max: 3000, mean: 300, std: 250, q1: 60, q3: 500 },
          },
        ),
      );

      // Feature: streak_current
      features.push(
        this.createNumericFeature(
          'streak_current',
          engagementData.current_streak,
          'Current consecutive days active',
          'days',
          true,
          {
            method: 'min-max',
            stats: { min: 0, max: 365, mean: 7, std: 10, q1: 0, q3: 10 },
          },
        ),
      );

      // Feature: streak_max
      features.push(
        this.createNumericFeature(
          'streak_max',
          engagementData.max_streak,
          'Maximum streak achieved',
          'days',
          true,
          {
            method: 'min-max',
            stats: { min: 0, max: 365, mean: 15, std: 20, q1: 3, q3: 25 },
          },
        ),
      );

      // Feature: days_since_last_login
      features.push(
        this.createNumericFeature(
          'days_since_last_login',
          engagementData.days_since_last_login,
          'Days since last activity',
          'days',
          true,
          {
            method: 'min-max',
            stats: { min: 0, max: 90, mean: 5, std: 10, q1: 0, q3: 7 },
          },
        ),
      );

      // Feature: weekend_activity_ratio
      features.push(
        this.createNumericFeature(
          'weekend_activity_ratio',
          engagementData.weekend_activity_ratio,
          'Ratio of weekend to total activity',
          'ratio',
          true,
          {
            method: 'min-max',
            stats: { min: 0, max: 1, mean: 0.28, std: 0.15, q1: 0.1, q3: 0.4 },
          },
        ),
      );

      // Feature: preferred_time_slot
      features.push(
        this.createCategoricalFeature(
          'preferred_time_slot',
          engagementData.preferred_time_slot,
          'Most active time of day',
          ['morning', 'afternoon', 'evening', 'night'],
        ),
      );

      // Feature: sessions_count_30d
      features.push(
        this.createNumericFeature(
          'sessions_count_30d',
          engagementData.sessions_count_30d,
          'Total sessions in last 30 days',
          'sessions',
          true,
          {
            method: 'min-max',
            stats: { min: 0, max: 100, mean: 20, std: 15, q1: 5, q3: 35 },
          },
        ),
      );

      // Feature: avg_activities_per_session
      features.push(
        this.createNumericFeature(
          'avg_activities_per_session',
          engagementData.avg_activities_per_session,
          'Average number of activities per session',
          'activities',
          true,
          {
            method: 'min-max',
            stats: { min: 0, max: 50, mean: 10, std: 8, q1: 3, q3: 15 },
          },
        ),
      );

      // Feature: is_active_last_7d
      features.push(
        this.createBooleanFeature(
          'is_active_last_7d',
          engagementData.login_count_7d > 0,
          'Had activity in last 7 days',
        ),
      );

      // Feature: has_consistent_schedule
      features.push(
        this.createBooleanFeature(
          'has_consistent_schedule',
          engagementData.schedule_consistency > 0.5,
          'Shows consistent usage pattern',
        ),
      );

      this.logger.debug(
        `Extracted ${features.length} engagement features for ${studentId}`,
      );

      return features;
    } catch (error) {
      this.logger.error(
        `Error extracting engagement features for ${studentId}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      return this.getDefaultFeatures();
    }
  }

  /**
   * Query engagement data from data warehouse and operational tables
   */
  private async queryEngagementData(
    studentId: string,
    dateRange: { start: Date; end: Date },
  ): Promise<any> {
    const defaultData = {
      login_count_7d: 0,
      login_count_30d: 0,
      avg_session_duration_minutes: 0,
      total_session_time_30d: 0,
      current_streak: 0,
      max_streak: 0,
      days_since_last_login: 30,
      weekend_activity_ratio: 0,
      preferred_time_slot: 'afternoon',
      sessions_count_30d: 0,
      avg_activities_per_session: 0,
      schedule_consistency: 0,
    };

    try {
      // Query data warehouse fact_daily_progress
      const dwQuery = `
        WITH daily_stats AS (
          SELECT
            fdp.date_key,
            dd.full_date,
            dd.is_weekend,
            dd.day_of_week,
            fdp.login_count,
            fdp.sessions_count,
            fdp.total_time_spent_seconds,
            fdp.streak_days,
            fdp.is_active_day,
            fdp.exercises_completed
          FROM data_warehouse.fact_daily_progress fdp
          JOIN data_warehouse.dim_student ds ON fdp.student_key = ds.student_key
          JOIN data_warehouse.dim_date dd ON fdp.date_key = dd.date_key
          WHERE ds.student_id = $1
            AND ds.is_current = true
            AND dd.full_date BETWEEN $2 AND $3
        ),
        aggregates AS (
          SELECT
            SUM(CASE WHEN full_date >= CURRENT_DATE - INTERVAL '7 days' THEN login_count ELSE 0 END) AS login_count_7d,
            SUM(login_count) AS login_count_30d,
            AVG(CASE WHEN sessions_count > 0 THEN total_time_spent_seconds / sessions_count / 60.0 ELSE NULL END) AS avg_session_duration_minutes,
            SUM(total_time_spent_seconds) / 60.0 AS total_session_time_30d,
            MAX(streak_days) AS max_streak,
            SUM(sessions_count) AS sessions_count_30d,
            SUM(CASE WHEN is_weekend THEN login_count ELSE 0 END)::float / NULLIF(SUM(login_count), 0) AS weekend_activity_ratio,
            AVG(exercises_completed) AS avg_activities_per_session
          FROM daily_stats
        ),
        last_activity AS (
          SELECT
            EXTRACT(DAY FROM (CURRENT_DATE - MAX(full_date))) AS days_since_last_login,
            (SELECT streak_days FROM daily_stats WHERE full_date = (SELECT MAX(full_date) FROM daily_stats)) AS current_streak
          FROM daily_stats
          WHERE is_active_day = true
        ),
        time_distribution AS (
          SELECT
            CASE
              WHEN AVG(EXTRACT(HOUR FROM TIMESTAMP '2000-01-01' + (SELECT TIME '00:00:00' + make_interval(secs => total_time_spent_seconds)))) < 12 THEN 'morning'
              WHEN AVG(EXTRACT(HOUR FROM TIMESTAMP '2000-01-01' + (SELECT TIME '00:00:00' + make_interval(secs => total_time_spent_seconds)))) < 17 THEN 'afternoon'
              WHEN AVG(EXTRACT(HOUR FROM TIMESTAMP '2000-01-01' + (SELECT TIME '00:00:00' + make_interval(secs => total_time_spent_seconds)))) < 21 THEN 'evening'
              ELSE 'night'
            END AS preferred_time_slot
          FROM daily_stats
          WHERE is_active_day = true
        )
        SELECT
          COALESCE(a.login_count_7d, 0) AS login_count_7d,
          COALESCE(a.login_count_30d, 0) AS login_count_30d,
          COALESCE(a.avg_session_duration_minutes, 0) AS avg_session_duration_minutes,
          COALESCE(a.total_session_time_30d, 0) AS total_session_time_30d,
          COALESCE(a.max_streak, 0) AS max_streak,
          COALESCE(a.sessions_count_30d, 0) AS sessions_count_30d,
          COALESCE(a.weekend_activity_ratio, 0) AS weekend_activity_ratio,
          COALESCE(a.avg_activities_per_session, 0) AS avg_activities_per_session,
          COALESCE(la.days_since_last_login, 30) AS days_since_last_login,
          COALESCE(la.current_streak, 0) AS current_streak,
          COALESCE(td.preferred_time_slot, 'afternoon') AS preferred_time_slot
        FROM aggregates a
        CROSS JOIN last_activity la
        CROSS JOIN time_distribution td
      `;

      const result = await this.dataSource.query(dwQuery, [
        studentId,
        dateRange.start,
        dateRange.end,
      ]);

      if (result && result.length > 0) {
        const data = result[0];

        // Calculate schedule consistency
        const consistencyQuery = `
          SELECT
            STDDEV(login_count) / NULLIF(AVG(login_count), 0) AS cv
          FROM data_warehouse.fact_daily_progress fdp
          JOIN data_warehouse.dim_student ds ON fdp.student_key = ds.student_key
          JOIN data_warehouse.dim_date dd ON fdp.date_key = dd.date_key
          WHERE ds.student_id = $1
            AND ds.is_current = true
            AND dd.full_date BETWEEN $2 AND $3
        `;

        try {
          const cvResult = await this.dataSource.query(consistencyQuery, [
            studentId,
            dateRange.start,
            dateRange.end,
          ]);

          // Lower coefficient of variation = more consistent
          const cv = cvResult?.[0]?.cv || 1;
          data.schedule_consistency = Math.max(0, 1 - cv);
        } catch {
          data.schedule_consistency = 0.5;
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
      const fallbackData = await this.queryOperationalEngagement(studentId, dateRange);
      return { ...defaultData, ...fallbackData };
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
  private async queryOperationalEngagement(
    studentId: string,
    dateRange: { start: Date; end: Date },
  ): Promise<any> {
    // Query progress_tracking.learning_sessions for basic engagement data
    const query = `
      SELECT
        COUNT(*) FILTER (WHERE ls.started_at >= CURRENT_DATE - INTERVAL '7 days') AS login_count_7d,
        COUNT(*) FILTER (WHERE ls.started_at >= CURRENT_DATE - INTERVAL '30 days') AS login_count_30d,
        AVG(EXTRACT(EPOCH FROM (ls.ended_at - ls.started_at)) / 60) AS avg_session_duration_minutes,
        SUM(EXTRACT(EPOCH FROM (ls.ended_at - ls.started_at)) / 60) AS total_session_time_30d,
        COUNT(*) AS sessions_count_30d,
        EXTRACT(DAY FROM (CURRENT_DATE - MAX(ls.started_at)::date)) AS days_since_last_login
      FROM progress_tracking.learning_sessions ls
      WHERE ls.user_id = $1
        AND ls.started_at BETWEEN $2 AND $3
    `;

    const result = await this.dataSource.query(query, [
      studentId,
      dateRange.start,
      dateRange.end,
    ]);

    if (result && result.length > 0) {
      return {
        ...result[0],
        current_streak: 0,
        max_streak: 0,
        weekend_activity_ratio: 0.28,
        preferred_time_slot: 'afternoon',
        avg_activities_per_session: 5,
        schedule_consistency: 0.5,
      };
    }

    return {};
  }

  /**
   * Get default features when engagement data is unavailable
   */
  private getDefaultFeatures(): Feature[] {
    return [
      this.createNumericFeature('login_frequency_7d', 0, 'Logins (7d)', 'logins'),
      this.createNumericFeature('login_frequency_30d', 0, 'Logins (30d)', 'logins'),
      this.createNumericFeature('avg_session_duration', 0, 'Avg session', 'minutes'),
      this.createNumericFeature('total_session_time_30d', 0, 'Total time', 'minutes'),
      this.createNumericFeature('streak_current', 0, 'Current streak', 'days'),
      this.createNumericFeature('streak_max', 0, 'Max streak', 'days'),
      this.createNumericFeature('days_since_last_login', 30, 'Days since login', 'days'),
      this.createNumericFeature('weekend_activity_ratio', 0, 'Weekend ratio', 'ratio'),
      this.createCategoricalFeature('preferred_time_slot', 'unknown', 'Time slot'),
      this.createNumericFeature('sessions_count_30d', 0, 'Sessions', 'sessions'),
      this.createNumericFeature('avg_activities_per_session', 0, 'Avg activities', 'activities'),
      this.createBooleanFeature('is_active_last_7d', false, 'Active (7d)'),
      this.createBooleanFeature('has_consistent_schedule', false, 'Consistent schedule'),
    ];
  }
}
