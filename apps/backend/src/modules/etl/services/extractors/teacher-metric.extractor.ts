/**
 * Teacher Metric Extractor
 *
 * @description Extracts aggregated teacher/classroom metrics from OLTP source tables
 * @module etl/services/extractors
 * @version 1.0.0
 * @since Sprint 2.2 - ETL Pipeline Extraction
 *
 * Source Tables:
 * - auth_management.profiles (teachers)
 * - social_features.teacher_classrooms (teacher-classroom assignments)
 * - social_features.classrooms (classroom info)
 * - social_features.classroom_members (student counts)
 * - progress_tracking.* (aggregated metrics)
 *
 * Target: Data Warehouse fact_teacher_metrics
 */

import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, QueryRunner, SelectQueryBuilder } from 'typeorm';
import { ExtractorBaseService } from '../extractor-base.service';
import { ExtractionConfig } from '../../interfaces';

/**
 * Teacher Metric Data Interface
 *
 * @description Shape of extracted teacher metric data
 */
export interface TeacherMetricData {
  /** Teacher profile ID */
  teacher_id: string;
  /** Classroom ID */
  classroom_id: string;
  /** Classroom name */
  classroom_name: string;
  /** School ID */
  school_id: string | null;
  /** Metric date (snapshot date) */
  metric_date: Date;
  /** Number of students in classroom */
  student_count: number;
  /** Number of active students (activity in last 7 days) */
  active_student_count: number;
  /** Average progress percentage across students */
  avg_progress_percentage: number;
  /** Average score across all exercises */
  avg_exercise_score: number;
  /** Total exercises completed by all students */
  total_exercises_completed: number;
  /** Total time spent (minutes) by all students */
  total_time_spent_minutes: number;
  /** Number of students at risk (low engagement) */
  at_risk_student_count: number;
  /** Number of interventions created */
  interventions_count: number;
  /** Average streak length across students */
  avg_streak_length: number;
  /** When this snapshot was taken */
  snapshot_timestamp: Date;
}

/**
 * TeacherMetricExtractor
 *
 * @description Extractor for teacher/classroom metrics.
 * Aggregates data from multiple tables to compute metrics.
 */
@Injectable()
export class TeacherMetricExtractor extends ExtractorBaseService<TeacherMetricData> {
  constructor(
    @InjectDataSource('social')
    dataSource: DataSource,
  ) {
    super(
      dataSource,
      'teacher-metric-extractor',
      [
        'auth_management.profiles',
        'social_features.teacher_classrooms',
        'social_features.classrooms',
        'social_features.classroom_members',
        'progress_tracking.module_progress',
        'gamification_system.user_stats',
      ],
    );
  }

  /**
   * Build the extraction query for teacher metrics
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
  ): SelectQueryBuilder<TeacherMetricData> {
    // This extractor uses a complex aggregation query
    // The actual query will be executed in performExtraction
    const query = queryRunner.manager
      .createQueryBuilder()
      .select('*')
      .from('social_features.teacher_classrooms', 'tc');

    return query as unknown as SelectQueryBuilder<TeacherMetricData>;
  }

  /**
   * Override extraction to use complex aggregation query
   */
  protected async performExtraction(
    queryRunner: QueryRunner,
    config: ExtractionConfig,
  ): Promise<{
    data: TeacherMetricData[];
    rowCount: number;
    extractedAt: Date;
    startTimestamp: Date;
    endTimestamp: Date;
    hasMore: boolean;
    metadata: {
      queryTimeMs: number;
      custom: Record<string, unknown>;
    };
  }> {
    const startTimestamp = await this.determineStartTimestamp(config);
    const endTimestamp = config.endDate ?? new Date();
    const snapshotDate = new Date();

    this.logger.debug(
      `Computing teacher metrics snapshot at: ${snapshotDate.toISOString()}`,
    );

    const queryStartTime = Date.now();

    const tenantFilter = config.tenantId
      ? 'AND p.tenant_id = $5'
      : '';

    // Complex aggregation query for teacher metrics
    const metricsQuery = `
      WITH teacher_classrooms_base AS (
        -- Get all active teacher-classroom assignments
        SELECT
          tc.teacher_id,
          tc.classroom_id,
          c.name AS classroom_name,
          c.school_id
        FROM social_features.teacher_classrooms tc
        INNER JOIN social_features.classrooms c ON c.id = tc.classroom_id
        INNER JOIN auth_management.profiles p ON p.id = tc.teacher_id
        WHERE p.role = 'admin_teacher'
          AND c.is_active = true
          ${tenantFilter}
      ),

      student_counts AS (
        -- Count students per classroom
        SELECT
          cm.classroom_id,
          COUNT(*) AS student_count,
          COUNT(*) FILTER (
            WHERE EXISTS (
              SELECT 1 FROM auth_management.profiles sp
              WHERE sp.id = cm.student_id
                AND sp.last_activity_at >= NOW() - INTERVAL '7 days'
            )
          ) AS active_student_count
        FROM social_features.classroom_members cm
        WHERE cm.status = 'active'
        GROUP BY cm.classroom_id
      ),

      progress_metrics AS (
        -- Aggregate progress metrics per classroom
        SELECT
          cm.classroom_id,
          COALESCE(AVG(mp.progress_percentage), 0) AS avg_progress_percentage,
          COALESCE(AVG(mp.average_score), 0) AS avg_exercise_score,
          COALESCE(SUM(mp.exercises_completed), 0) AS total_exercises_completed,
          COALESCE(SUM(EXTRACT(EPOCH FROM mp.total_time_spent) / 60), 0) AS total_time_spent_minutes
        FROM social_features.classroom_members cm
        LEFT JOIN progress_tracking.module_progress mp ON mp.user_id = cm.student_id
        WHERE cm.status = 'active'
        GROUP BY cm.classroom_id
      ),

      engagement_metrics AS (
        -- Count at-risk students (no activity in 14+ days)
        SELECT
          cm.classroom_id,
          COUNT(*) FILTER (
            WHERE NOT EXISTS (
              SELECT 1 FROM auth_management.profiles sp
              WHERE sp.id = cm.student_id
                AND sp.last_activity_at >= NOW() - INTERVAL '14 days'
            )
          ) AS at_risk_student_count
        FROM social_features.classroom_members cm
        WHERE cm.status = 'active'
        GROUP BY cm.classroom_id
      ),

      streak_metrics AS (
        -- Average streak per classroom
        SELECT
          cm.classroom_id,
          COALESCE(AVG(us.current_streak), 0) AS avg_streak_length
        FROM social_features.classroom_members cm
        LEFT JOIN gamification_system.user_stats us ON us.user_id = cm.student_id
        WHERE cm.status = 'active'
        GROUP BY cm.classroom_id
      ),

      intervention_counts AS (
        -- Count interventions per teacher-classroom
        SELECT
          ti.created_by AS teacher_id,
          cm.classroom_id,
          COUNT(*) AS interventions_count
        FROM progress_tracking.teacher_interventions ti
        INNER JOIN social_features.classroom_members cm ON cm.student_id = ti.student_id
        WHERE ti.created_at >= $1
          AND ti.created_at < $2
        GROUP BY ti.created_by, cm.classroom_id
      )

      SELECT
        tcb.teacher_id,
        tcb.classroom_id,
        tcb.classroom_name,
        tcb.school_id,
        $3::timestamp AS metric_date,
        COALESCE(sc.student_count, 0)::integer AS student_count,
        COALESCE(sc.active_student_count, 0)::integer AS active_student_count,
        COALESCE(pm.avg_progress_percentage, 0)::numeric AS avg_progress_percentage,
        COALESCE(pm.avg_exercise_score, 0)::numeric AS avg_exercise_score,
        COALESCE(pm.total_exercises_completed, 0)::bigint AS total_exercises_completed,
        COALESCE(pm.total_time_spent_minutes, 0)::numeric AS total_time_spent_minutes,
        COALESCE(em.at_risk_student_count, 0)::integer AS at_risk_student_count,
        COALESCE(ic.interventions_count, 0)::integer AS interventions_count,
        COALESCE(sm.avg_streak_length, 0)::numeric AS avg_streak_length,
        NOW() AS snapshot_timestamp
      FROM teacher_classrooms_base tcb
      LEFT JOIN student_counts sc ON sc.classroom_id = tcb.classroom_id
      LEFT JOIN progress_metrics pm ON pm.classroom_id = tcb.classroom_id
      LEFT JOIN engagement_metrics em ON em.classroom_id = tcb.classroom_id
      LEFT JOIN streak_metrics sm ON sm.classroom_id = tcb.classroom_id
      LEFT JOIN intervention_counts ic ON ic.teacher_id = tcb.teacher_id
                                       AND ic.classroom_id = tcb.classroom_id
      ORDER BY tcb.teacher_id, tcb.classroom_id
      LIMIT $4
      OFFSET $6
    `;

    const params: unknown[] = [
      startTimestamp,
      endTimestamp,
      snapshotDate,
      config.batchSize,
    ];

    if (config.tenantId) {
      params.push(config.tenantId);
    }

    params.push(config.offset ?? 0);

    const data = await queryRunner.manager.query(metricsQuery, params) as TeacherMetricData[];
    const queryTime = Date.now() - queryStartTime;

    const hasMore = data.length === config.batchSize;

    return {
      data,
      rowCount: data.length,
      extractedAt: new Date(),
      startTimestamp,
      endTimestamp,
      hasMore,
      metadata: {
        queryTimeMs: queryTime,
        custom: {
          incremental: config.incremental,
          offset: config.offset ?? 0,
          snapshotDate: snapshotDate.toISOString(),
        },
      },
    };
  }
}
