-- =====================================================
-- View: data_warehouse.v_student_engagement_metrics
-- Description: Aggregated engagement metrics for ML feature engineering
-- Type: View (Read-only, optimized for feature extraction)
-- Source: data_warehouse.fact_daily_progress, data_warehouse.dim_student
-- Created: 2026-02-03
-- Sprint: 3.1 - Feature Engineering for ML Predictions
-- =====================================================

SET search_path TO data_warehouse, public;

DROP VIEW IF EXISTS data_warehouse.v_student_engagement_metrics CASCADE;

CREATE OR REPLACE VIEW data_warehouse.v_student_engagement_metrics AS
WITH recent_progress AS (
    -- Get last 90 days of progress data
    SELECT
        fdp.student_key,
        fdp.date_key,
        dd.full_date,
        dd.day_of_week,
        dd.is_weekend,
        fdp.login_count,
        fdp.sessions_count,
        fdp.total_time_spent_seconds,
        fdp.streak_days,
        fdp.is_active_day,
        fdp.exercises_completed,
        fdp.xp_earned,
        fdp.ml_coins_earned
    FROM data_warehouse.fact_daily_progress fdp
    JOIN data_warehouse.dim_date dd ON fdp.date_key = dd.date_key
    WHERE dd.full_date >= CURRENT_DATE - INTERVAL '90 days'
),
daily_aggregates AS (
    -- Aggregate by student
    SELECT
        rp.student_key,
        -- Login frequency
        SUM(CASE WHEN full_date >= CURRENT_DATE - INTERVAL '7 days' THEN login_count ELSE 0 END) AS login_count_7d,
        SUM(CASE WHEN full_date >= CURRENT_DATE - INTERVAL '30 days' THEN login_count ELSE 0 END) AS login_count_30d,
        SUM(login_count) AS login_count_90d,

        -- Session metrics
        SUM(sessions_count) AS total_sessions_90d,
        AVG(CASE WHEN sessions_count > 0 THEN total_time_spent_seconds::float / sessions_count ELSE NULL END) AS avg_session_duration_seconds,
        SUM(total_time_spent_seconds) AS total_time_spent_90d,

        -- Streak metrics
        MAX(streak_days) AS max_streak_90d,

        -- Activity metrics
        COUNT(*) FILTER (WHERE is_active_day = true) AS active_days_90d,
        COUNT(DISTINCT full_date) FILTER (WHERE is_active_day = true AND full_date >= CURRENT_DATE - INTERVAL '7 days') AS active_days_7d,
        COUNT(DISTINCT full_date) FILTER (WHERE is_active_day = true AND full_date >= CURRENT_DATE - INTERVAL '30 days') AS active_days_30d,

        -- Exercise activity
        SUM(exercises_completed) AS exercises_completed_90d,

        -- Weekend activity
        SUM(CASE WHEN is_weekend THEN login_count ELSE 0 END)::float / NULLIF(SUM(login_count), 0) AS weekend_activity_ratio,

        -- Day of week distribution
        MODE() WITHIN GROUP (ORDER BY day_of_week) FILTER (WHERE is_active_day = true) AS most_active_day_of_week,

        -- Consistency metrics (coefficient of variation - lower = more consistent)
        CASE
            WHEN AVG(login_count) > 0 THEN STDDEV(login_count) / AVG(login_count)
            ELSE 1
        END AS activity_variation_coefficient,

        -- Gamification activity
        SUM(xp_earned) AS xp_earned_90d,
        SUM(ml_coins_earned) AS ml_coins_earned_90d
    FROM recent_progress rp
    GROUP BY rp.student_key
),
last_activity AS (
    -- Get last activity date for each student
    SELECT
        student_key,
        MAX(full_date) AS last_activity_date,
        EXTRACT(DAY FROM (CURRENT_DATE - MAX(full_date))) AS days_since_last_login
    FROM recent_progress
    WHERE is_active_day = true
    GROUP BY student_key
),
current_streak AS (
    -- Calculate current streak (consecutive days from today going back)
    SELECT
        student_key,
        streak_days AS current_streak
    FROM (
        SELECT
            rp.student_key,
            rp.streak_days,
            ROW_NUMBER() OVER (PARTITION BY rp.student_key ORDER BY rp.full_date DESC) AS rn
        FROM recent_progress rp
        WHERE rp.is_active_day = true
    ) ranked
    WHERE rn = 1
)
SELECT
    ds.student_key,
    ds.student_id,
    ds.display_name,
    ds.email,
    ds.current_rank,
    ds.current_level,

    -- Login frequency features
    COALESCE(da.login_count_7d, 0) AS login_count_7d,
    COALESCE(da.login_count_30d, 0) AS login_count_30d,
    COALESCE(da.login_count_90d, 0) AS login_count_90d,

    -- Session features
    COALESCE(da.total_sessions_90d, 0) AS total_sessions_90d,
    COALESCE(da.avg_session_duration_seconds / 60, 0) AS avg_session_duration_minutes,
    COALESCE(da.total_time_spent_90d / 60, 0) AS total_time_spent_minutes_90d,

    -- Streak features
    COALESCE(cs.current_streak, 0) AS current_streak,
    COALESCE(da.max_streak_90d, 0) AS max_streak_90d,

    -- Activity features
    COALESCE(da.active_days_7d, 0) AS active_days_7d,
    COALESCE(da.active_days_30d, 0) AS active_days_30d,
    COALESCE(da.active_days_90d, 0) AS active_days_90d,
    COALESCE(la.days_since_last_login, 90) AS days_since_last_login,

    -- Exercise activity
    COALESCE(da.exercises_completed_90d, 0) AS exercises_completed_90d,

    -- Pattern features
    COALESCE(da.weekend_activity_ratio, 0) AS weekend_activity_ratio,
    COALESCE(da.most_active_day_of_week, 3) AS most_active_day_of_week, -- Default to Wednesday

    -- Consistency features
    COALESCE(1 - da.activity_variation_coefficient, 0.5) AS activity_regularity_score,

    -- Gamification features
    COALESCE(da.xp_earned_90d, 0) AS xp_earned_90d,
    COALESCE(da.ml_coins_earned_90d, 0) AS ml_coins_earned_90d,

    -- Computed features
    CASE
        WHEN da.login_count_7d > 0 THEN true
        ELSE false
    END AS is_active_last_7d,

    CASE
        WHEN da.active_days_30d > 0 THEN da.exercises_completed_90d::float / da.active_days_90d
        ELSE 0
    END AS exercises_per_active_day,

    -- Last activity timestamp
    la.last_activity_date,

    -- Metadata
    CURRENT_TIMESTAMP AS generated_at

FROM data_warehouse.dim_student ds
LEFT JOIN daily_aggregates da ON ds.student_key = da.student_key
LEFT JOIN last_activity la ON ds.student_key = la.student_key
LEFT JOIN current_streak cs ON ds.student_key = cs.student_key
WHERE ds.is_current = true
  AND ds.role = 'student';

-- =====================================================
-- OWNERSHIP AND PERMISSIONS
-- =====================================================
ALTER VIEW data_warehouse.v_student_engagement_metrics OWNER TO gamilit_user;
GRANT SELECT ON data_warehouse.v_student_engagement_metrics TO gamilit_user;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON VIEW data_warehouse.v_student_engagement_metrics IS
'Aggregated engagement metrics for ML feature engineering.
Provides pre-computed engagement features for each student including:
- Login frequency (7d, 30d, 90d)
- Session metrics (count, duration)
- Streak metrics (current, max)
- Activity patterns (weekend ratio, day preference)
- Regularity/consistency scores
Sprint 3.1 - Feature Engineering for ML Predictions';
