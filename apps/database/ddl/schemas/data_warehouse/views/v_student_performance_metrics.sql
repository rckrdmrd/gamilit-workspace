-- =====================================================
-- View: data_warehouse.v_student_performance_metrics
-- Description: Aggregated performance metrics for ML feature engineering
-- Type: View (Read-only, optimized for feature extraction)
-- Source: data_warehouse.fact_exercise_completions, data_warehouse.dim_student
-- Created: 2026-02-03
-- Sprint: 3.1 - Feature Engineering for ML Predictions
-- =====================================================

SET search_path TO data_warehouse, public;

DROP VIEW IF EXISTS data_warehouse.v_student_performance_metrics CASCADE;

CREATE OR REPLACE VIEW data_warehouse.v_student_performance_metrics AS
WITH recent_completions AS (
    -- Get last 90 days of exercise completions
    SELECT
        fec.student_key,
        fec.date_key,
        fec.exercise_key,
        fec.module_key,
        dd.full_date,
        fec.score_percentage,
        fec.time_spent_seconds,
        fec.is_passed,
        fec.is_perfect,
        fec.is_first_attempt,
        fec.hints_used,
        fec.attempt_number,
        de.difficulty_level,
        dm.module_id,
        dm.module_code
    FROM data_warehouse.fact_exercise_completions fec
    JOIN data_warehouse.dim_dates dd ON fec.date_key = dd.date_key
    JOIN data_warehouse.dim_exercises de ON fec.exercise_key = de.exercise_key
    JOIN data_warehouse.dim_modules dm ON fec.module_key = dm.module_key
    WHERE dd.full_date >= CURRENT_DATE - INTERVAL '90 days'
),
score_aggregates AS (
    -- Score metrics by student
    SELECT
        rc.student_key,

        -- Average scores by time period
        AVG(CASE WHEN full_date >= CURRENT_DATE - INTERVAL '7 days' THEN score_percentage END) AS avg_score_7d,
        AVG(CASE WHEN full_date >= CURRENT_DATE - INTERVAL '30 days' THEN score_percentage END) AS avg_score_30d,
        AVG(score_percentage) AS avg_score_90d,

        -- Min/Max scores
        MIN(score_percentage) AS min_score_90d,
        MAX(score_percentage) AS max_score_90d,

        -- Score variance (consistency metric)
        VARIANCE(score_percentage) AS score_variance,
        STDDEV(score_percentage) AS score_stddev,

        -- Perfect scores
        COUNT(*) FILTER (WHERE is_perfect) AS perfect_score_count_90d,

        -- Time metrics
        AVG(time_spent_seconds) AS avg_time_per_exercise_seconds,
        MIN(time_spent_seconds) AS min_time_per_exercise_seconds,
        MAX(time_spent_seconds) AS max_time_per_exercise_seconds

    FROM recent_completions rc
    GROUP BY rc.student_key
),
completion_rates AS (
    -- Completion and attempt metrics
    SELECT
        rc.student_key,

        -- Exercises completed/attempted
        COUNT(*) FILTER (WHERE is_passed) AS exercises_completed_90d,
        COUNT(*) AS exercises_attempted_90d,
        COUNT(*) FILTER (WHERE NOT is_passed) AS exercises_failed_90d,

        -- Completion rates by time period
        (COUNT(*) FILTER (WHERE is_passed AND full_date >= CURRENT_DATE - INTERVAL '7 days'))::float /
            NULLIF(COUNT(*) FILTER (WHERE full_date >= CURRENT_DATE - INTERVAL '7 days'), 0) * 100 AS completion_rate_7d,
        (COUNT(*) FILTER (WHERE is_passed AND full_date >= CURRENT_DATE - INTERVAL '30 days'))::float /
            NULLIF(COUNT(*) FILTER (WHERE full_date >= CURRENT_DATE - INTERVAL '30 days'), 0) * 100 AS completion_rate_30d,
        (COUNT(*) FILTER (WHERE is_passed))::float / NULLIF(COUNT(*), 0) * 100 AS completion_rate_90d,

        -- First attempt success rate
        (COUNT(*) FILTER (WHERE is_first_attempt AND is_passed))::float /
            NULLIF(COUNT(*) FILTER (WHERE is_first_attempt), 0) * 100 AS first_attempt_success_rate,

        -- Hints usage
        COUNT(*) FILTER (WHERE hints_used > 0)::float / NULLIF(COUNT(*), 0) AS hints_usage_rate,
        AVG(hints_used) AS avg_hints_per_exercise,

        -- Retry behavior
        AVG(attempt_number) AS avg_attempts_per_exercise

    FROM recent_completions rc
    GROUP BY rc.student_key
),
difficulty_distribution AS (
    -- Exercise difficulty preferences
    SELECT
        rc.student_key,
        COUNT(*) FILTER (WHERE difficulty_level = 'easy')::float / NULLIF(COUNT(*), 0) AS difficulty_easy_ratio,
        COUNT(*) FILTER (WHERE difficulty_level = 'medium')::float / NULLIF(COUNT(*), 0) AS difficulty_medium_ratio,
        COUNT(*) FILTER (WHERE difficulty_level = 'hard')::float / NULLIF(COUNT(*), 0) AS difficulty_hard_ratio,

        -- Score by difficulty
        AVG(CASE WHEN difficulty_level = 'easy' THEN score_percentage END) AS avg_score_easy,
        AVG(CASE WHEN difficulty_level = 'medium' THEN score_percentage END) AS avg_score_medium,
        AVG(CASE WHEN difficulty_level = 'hard' THEN score_percentage END) AS avg_score_hard

    FROM recent_completions rc
    GROUP BY rc.student_key
),
module_progress AS (
    -- Progress by module (assuming modules M1-M5)
    SELECT
        rc.student_key,
        MAX(CASE WHEN module_code = 'M1' THEN score_percentage END) AS module_1_best_score,
        MAX(CASE WHEN module_code = 'M2' THEN score_percentage END) AS module_2_best_score,
        MAX(CASE WHEN module_code = 'M3' THEN score_percentage END) AS module_3_best_score,
        MAX(CASE WHEN module_code = 'M4' THEN score_percentage END) AS module_4_best_score,
        MAX(CASE WHEN module_code = 'M5' THEN score_percentage END) AS module_5_best_score,

        COUNT(DISTINCT module_key) AS modules_attempted

    FROM recent_completions rc
    GROUP BY rc.student_key
),
improvement_trend AS (
    -- Calculate score improvement trend (weekly averages)
    SELECT
        student_key,
        REGR_SLOPE(avg_score, week_num) AS improvement_slope
    FROM (
        SELECT
            rc.student_key,
            DATE_TRUNC('week', rc.full_date) AS week_start,
            EXTRACT(WEEK FROM rc.full_date) - EXTRACT(WEEK FROM CURRENT_DATE - INTERVAL '90 days') AS week_num,
            AVG(rc.score_percentage) AS avg_score
        FROM recent_completions rc
        GROUP BY rc.student_key, DATE_TRUNC('week', rc.full_date), EXTRACT(WEEK FROM rc.full_date)
    ) weekly_scores
    GROUP BY student_key
)
SELECT
    ds.student_key,
    ds.student_id,
    ds.display_name,
    ds.current_rank,
    ds.current_level,
    ds.total_xp,

    -- Score features
    COALESCE(sa.avg_score_7d, 0) AS avg_score_7d,
    COALESCE(sa.avg_score_30d, 0) AS avg_score_30d,
    COALESCE(sa.avg_score_90d, 0) AS avg_score_90d,
    COALESCE(sa.min_score_90d, 0) AS min_score_90d,
    COALESCE(sa.max_score_90d, 0) AS max_score_90d,
    COALESCE(sa.score_variance, 0) AS score_variance,
    COALESCE(sa.score_stddev, 0) AS score_stddev,
    COALESCE(sa.perfect_score_count_90d, 0) AS perfect_score_count,

    -- Time features
    COALESCE(sa.avg_time_per_exercise_seconds, 0) AS avg_time_per_exercise_seconds,

    -- Completion features
    COALESCE(cr.exercises_completed_90d, 0) AS exercises_completed_total,
    COALESCE(cr.exercises_attempted_90d, 0) AS exercises_attempted_total,
    COALESCE(cr.exercises_failed_90d, 0) AS exercises_failed_total,
    COALESCE(cr.completion_rate_7d, 0) AS completion_rate_7d,
    COALESCE(cr.completion_rate_30d, 0) AS completion_rate_30d,
    COALESCE(cr.completion_rate_90d, 0) AS completion_rate_90d,

    -- First attempt and hints
    COALESCE(cr.first_attempt_success_rate, 0) AS first_attempt_success_rate,
    COALESCE(cr.hints_usage_rate, 0) AS hints_usage_rate,
    COALESCE(cr.avg_hints_per_exercise, 0) AS avg_hints_per_exercise,
    COALESCE(cr.avg_attempts_per_exercise, 1) AS avg_attempts_per_exercise,

    -- Difficulty distribution
    COALESCE(dd.difficulty_easy_ratio, 0.33) AS difficulty_easy_ratio,
    COALESCE(dd.difficulty_medium_ratio, 0.33) AS difficulty_medium_ratio,
    COALESCE(dd.difficulty_hard_ratio, 0.33) AS difficulty_hard_ratio,
    COALESCE(dd.avg_score_easy, 0) AS avg_score_easy,
    COALESCE(dd.avg_score_medium, 0) AS avg_score_medium,
    COALESCE(dd.avg_score_hard, 0) AS avg_score_hard,

    -- Module progress
    COALESCE(mp.module_1_best_score, 0) AS module_1_progress,
    COALESCE(mp.module_2_best_score, 0) AS module_2_progress,
    COALESCE(mp.module_3_best_score, 0) AS module_3_progress,
    COALESCE(mp.module_4_best_score, 0) AS module_4_progress,
    COALESCE(mp.module_5_best_score, 0) AS module_5_progress,
    COALESCE(mp.modules_attempted, 0) AS modules_attempted,

    -- Improvement trend
    COALESCE(it.improvement_slope, 0) AS improvement_trend,

    -- Computed features
    CASE
        WHEN COALESCE(sa.score_variance, 0) < 100 THEN 'consistent'
        WHEN COALESCE(sa.score_variance, 0) < 300 THEN 'moderate'
        ELSE 'variable'
    END AS score_consistency_category,

    CASE
        WHEN COALESCE(it.improvement_slope, 0) > 1 THEN 'improving'
        WHEN COALESCE(it.improvement_slope, 0) < -1 THEN 'declining'
        ELSE 'stable'
    END AS performance_trend_category,

    -- Metadata
    CURRENT_TIMESTAMP AS generated_at

FROM data_warehouse.dim_students ds
LEFT JOIN score_aggregates sa ON ds.student_key = sa.student_key
LEFT JOIN completion_rates cr ON ds.student_key = cr.student_key
LEFT JOIN difficulty_distribution dd ON ds.student_key = dd.student_key
LEFT JOIN module_progress mp ON ds.student_key = mp.student_key
LEFT JOIN improvement_trend it ON ds.student_key = it.student_key
WHERE ds.is_current = true
  AND ds.role = 'student';

-- =====================================================
-- OWNERSHIP AND PERMISSIONS
-- =====================================================
ALTER VIEW data_warehouse.v_student_performance_metrics OWNER TO gamilit_user;
GRANT SELECT ON data_warehouse.v_student_performance_metrics TO gamilit_user;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON VIEW data_warehouse.v_student_performance_metrics IS
'Aggregated performance metrics for ML feature engineering.
Provides pre-computed performance features for each student including:
- Score metrics (avg, min, max, variance) by time period
- Completion rates (7d, 30d, 90d)
- First attempt success rate
- Hints and retry behavior
- Difficulty distribution and scores by difficulty
- Module progress
- Improvement trend (slope)
Sprint 3.1 - Feature Engineering for ML Predictions';
