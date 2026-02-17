-- =====================================================
-- View: data_warehouse.v_student_feature_base
-- Description: Combined feature base view for ML predictions
-- Type: View (Read-only, optimized for feature extraction)
-- Source: v_student_engagement_metrics, v_student_performance_metrics
-- Created: 2026-02-03
-- Sprint: 3.1 - Feature Engineering for ML Predictions
-- =====================================================

SET search_path TO data_warehouse, public;

DROP VIEW IF EXISTS data_warehouse.v_student_feature_base CASCADE;

CREATE OR REPLACE VIEW data_warehouse.v_student_feature_base AS
SELECT
    -- =====================================================
    -- STUDENT IDENTITY
    -- =====================================================
    ds.student_key,
    ds.student_id,
    ds.display_name,
    ds.email,

    -- =====================================================
    -- STUDENT PROFILE FEATURES
    -- =====================================================
    ds.current_rank,
    ds.current_level,
    ds.total_xp,
    ds.ml_coins_balance,
    ds.grade_level,
    ds.school_id,
    ds.school_name,
    ds.status,
    ds.registration_date,
    ds.first_activity_date,
    ds.last_activity_date,
    (CURRENT_DATE - ds.registration_date) AS days_since_registration,
    (CURRENT_DATE - COALESCE(ds.first_activity_date, ds.registration_date)) AS days_since_first_activity,

    -- Maya rank numeric mapping
    CASE ds.current_rank
        WHEN 'Alumno' THEN 1
        WHEN 'Aprendiz' THEN 2
        WHEN 'Estudiante' THEN 3
        WHEN 'Erudito' THEN 4
        WHEN 'Explorador' THEN 5
        WHEN 'Investigador' THEN 6
        WHEN 'Artesano' THEN 7
        WHEN 'Creador' THEN 8
        WHEN 'Innovador' THEN 9
        WHEN 'Experto' THEN 10
        WHEN 'Maestro' THEN 11
        WHEN 'Sabio' THEN 12
        WHEN 'Guardian' THEN 13
        ELSE 1
    END AS current_rank_level,

    -- Profile completeness (simplified)
    CASE
        WHEN ds.display_name IS NOT NULL AND ds.school_id IS NOT NULL THEN 100
        WHEN ds.display_name IS NOT NULL THEN 60
        ELSE 20
    END AS profile_completeness,

    ds.school_id IS NOT NULL AS has_school_association,

    -- =====================================================
    -- ENGAGEMENT FEATURES (from v_student_engagement_metrics)
    -- =====================================================
    COALESCE(em.login_count_7d, 0) AS login_frequency_7d,
    COALESCE(em.login_count_30d, 0) AS login_frequency_30d,
    COALESCE(em.login_count_90d, 0) AS login_frequency_90d,
    COALESCE(em.avg_session_duration_minutes, 0) AS avg_session_duration,
    COALESCE(em.total_time_spent_minutes_90d, 0) AS total_session_time_30d,
    COALESCE(em.current_streak, 0) AS streak_current,
    COALESCE(em.max_streak_90d, 0) AS streak_max,
    COALESCE(em.days_since_last_login, 90) AS days_since_last_login,
    COALESCE(em.weekend_activity_ratio, 0) AS weekend_activity_ratio,
    COALESCE(em.total_sessions_90d, 0) AS sessions_count_30d,
    COALESCE(em.exercises_per_active_day, 0) AS avg_activities_per_session,
    COALESCE(em.is_active_last_7d, false) AS is_active_last_7d,
    COALESCE(em.activity_regularity_score, 0.5) AS activity_regularity_score,
    em.activity_regularity_score > 0.5 AS has_consistent_schedule,

    -- Time slot preference
    CASE em.most_active_day_of_week
        WHEN 0 THEN 'Sunday'
        WHEN 1 THEN 'Monday'
        WHEN 2 THEN 'Tuesday'
        WHEN 3 THEN 'Wednesday'
        WHEN 4 THEN 'Thursday'
        WHEN 5 THEN 'Friday'
        WHEN 6 THEN 'Saturday'
        ELSE 'Unknown'
    END AS most_active_day_name,

    -- =====================================================
    -- PERFORMANCE FEATURES (from v_student_performance_metrics)
    -- =====================================================
    COALESCE(pm.avg_score_7d, 0) AS avg_score_7d,
    COALESCE(pm.avg_score_30d, 0) AS avg_score_30d,
    COALESCE(pm.avg_score_90d, 0) AS avg_score_all,
    COALESCE(pm.completion_rate_7d, 0) AS completion_rate_7d,
    COALESCE(pm.completion_rate_30d, 0) AS completion_rate_30d,
    COALESCE(pm.exercises_completed_total, 0) AS exercises_completed_total,
    COALESCE(pm.exercises_attempted_total, 0) AS exercises_attempted_total,
    COALESCE(pm.exercises_failed_total, 0) AS exercises_failed_total,
    COALESCE(pm.avg_time_per_exercise_seconds, 0) AS avg_time_per_exercise,
    COALESCE(pm.perfect_score_count, 0) AS perfect_score_count,
    COALESCE(pm.difficulty_easy_ratio, 0.33) AS difficulty_easy_ratio,
    COALESCE(pm.difficulty_medium_ratio, 0.33) AS difficulty_medium_ratio,
    COALESCE(pm.difficulty_hard_ratio, 0.33) AS difficulty_hard_ratio,
    COALESCE(pm.score_variance, 0) AS score_variance,
    COALESCE(pm.improvement_trend, 0) AS improvement_trend,
    COALESCE(pm.hints_usage_rate, 0) AS hints_usage_rate,
    COALESCE(pm.first_attempt_success_rate, 0) AS first_attempt_success_rate,
    COALESCE(pm.module_1_progress, 0) AS module_progress_m1,
    COALESCE(pm.module_2_progress, 0) AS module_progress_m2,
    COALESCE(pm.module_3_progress, 0) AS module_progress_m3,
    COALESCE(pm.module_4_progress, 0) AS module_progress_m4,
    COALESCE(pm.module_5_progress, 0) AS module_progress_m5,

    -- =====================================================
    -- COMPUTED RISK INDICATORS
    -- =====================================================
    -- Dropout risk indicators
    CASE
        WHEN COALESCE(em.days_since_last_login, 90) > 14 THEN true
        WHEN COALESCE(em.login_count_30d, 0) < 3 THEN true
        WHEN COALESCE(pm.avg_score_30d, 0) < 40 AND COALESCE(pm.exercises_attempted_total, 0) > 10 THEN true
        ELSE false
    END AS high_dropout_risk_indicator,

    -- Engagement level classification
    CASE
        WHEN COALESCE(em.login_count_7d, 0) >= 5 AND COALESCE(em.current_streak, 0) >= 3 THEN 'very_high'
        WHEN COALESCE(em.login_count_7d, 0) >= 3 THEN 'high'
        WHEN COALESCE(em.login_count_30d, 0) >= 5 THEN 'moderate'
        WHEN COALESCE(em.login_count_30d, 0) >= 1 THEN 'low'
        ELSE 'disengaged'
    END AS engagement_level,

    -- Performance level classification
    CASE
        WHEN COALESCE(pm.avg_score_30d, 0) >= 80 THEN 'excellent'
        WHEN COALESCE(pm.avg_score_30d, 0) >= 60 THEN 'good'
        WHEN COALESCE(pm.avg_score_30d, 0) >= 40 THEN 'needs_improvement'
        ELSE 'at_risk'
    END AS performance_level,

    -- =====================================================
    -- METADATA
    -- =====================================================
    CURRENT_TIMESTAMP AS generated_at,
    '1.0.0' AS feature_version

FROM data_warehouse.dim_students ds
LEFT JOIN data_warehouse.v_student_engagement_metrics em ON ds.student_key = em.student_key
LEFT JOIN data_warehouse.v_student_performance_metrics pm ON ds.student_key = pm.student_key
WHERE ds.is_current = true
  AND ds.role = 'student';

-- =====================================================
-- OWNERSHIP AND PERMISSIONS
-- =====================================================
ALTER VIEW data_warehouse.v_student_feature_base OWNER TO gamilit_user;
GRANT SELECT ON data_warehouse.v_student_feature_base TO gamilit_user;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON VIEW data_warehouse.v_student_feature_base IS
'Combined feature base view for ML predictions.
Joins student profile, engagement metrics, and performance metrics into a single
feature vector suitable for ML model input.
Includes:
- Student profile features (45 features)
- Engagement features (login frequency, streaks, session duration)
- Performance features (scores, completion rates, trends)
- Computed risk indicators and classifications
Sprint 3.1 - Feature Engineering for ML Predictions';

-- =====================================================
-- INDEXES (on underlying tables - views cannot be indexed)
-- Note: These indexes should already exist on the fact tables
-- =====================================================
-- CREATE INDEX IF NOT EXISTS idx_fact_daily_progress_student_date
--   ON data_warehouse.fact_daily_progress (student_key, date_key);
-- CREATE INDEX IF NOT EXISTS idx_fact_exercise_completions_student_date
--   ON data_warehouse.fact_exercise_completions (student_key, date_key);
