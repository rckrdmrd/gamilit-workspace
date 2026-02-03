-- =====================================================
-- Data Warehouse Indexes
-- Description: Optimized indexes for analytics queries
-- Schema: data_warehouse
-- Created: 2026-02-03
-- Sprint: 2.1 - Data Warehouse Design
--
-- NOTE: Most indexes are created inline with table definitions.
-- This file contains additional composite and specialized indexes
-- for common analytical query patterns.
-- =====================================================

SET search_path TO data_warehouse, public;

-- =====================================================
-- FACT TABLE COVERING INDEXES
-- For common aggregate queries
-- =====================================================

-- ===========================================
-- fact_exercise_completions - Covering Indexes
-- ===========================================

-- Student performance over time (include score measures for covering)
CREATE INDEX IF NOT EXISTS idx_fact_completion_student_perf
ON data_warehouse.fact_exercise_completions (student_key, date_key)
INCLUDE (score, score_percentage, time_spent_seconds, xp_earned);

-- Module completion analysis
CREATE INDEX IF NOT EXISTS idx_fact_completion_module_analysis
ON data_warehouse.fact_exercise_completions (module_key, date_key, student_key)
INCLUDE (score, is_passed, is_perfect, time_spent_seconds);

-- Teacher classroom view
CREATE INDEX IF NOT EXISTS idx_fact_completion_teacher_view
ON data_warehouse.fact_exercise_completions (teacher_key, classroom_id, date_key)
INCLUDE (score, is_passed, time_spent_seconds)
WHERE teacher_key IS NOT NULL;

-- Exercise difficulty analysis
CREATE INDEX IF NOT EXISTS idx_fact_completion_exercise_diff
ON data_warehouse.fact_exercise_completions (exercise_key)
INCLUDE (score, score_percentage, time_spent_seconds, is_passed, attempt_number);

-- ===========================================
-- fact_daily_progress - Covering Indexes
-- ===========================================

-- Student progress trending
CREATE INDEX IF NOT EXISTS idx_fact_progress_trend
ON data_warehouse.fact_daily_progress (student_key, date_key DESC)
INCLUDE (progress_percentage, exercises_completed, xp_earned, streak_days);

-- Classroom daily summary
CREATE INDEX IF NOT EXISTS idx_fact_progress_classroom_daily
ON data_warehouse.fact_daily_progress (classroom_id, date_key)
INCLUDE (exercises_completed, total_score, total_time_spent_seconds)
WHERE classroom_id IS NOT NULL;

-- Module completion tracking
CREATE INDEX IF NOT EXISTS idx_fact_progress_module_complete
ON data_warehouse.fact_daily_progress (module_key, student_key)
INCLUDE (progress_percentage, exercises_completed, average_score);

-- ===========================================
-- fact_gamification_events - Covering Indexes
-- ===========================================

-- Student achievement history
CREATE INDEX IF NOT EXISTS idx_fact_gam_achievement_history
ON data_warehouse.fact_gamification_events (student_key, event_type_key, date_key DESC)
INCLUDE (xp_change, ml_coins_change, achievement_key)
WHERE achievement_key IS NOT NULL;

-- Rank progression tracking
CREATE INDEX IF NOT EXISTS idx_fact_gam_rank_progression
ON data_warehouse.fact_gamification_events (student_key, date_key)
INCLUDE (rank_from, rank_to, xp_change)
WHERE rank_to IS NOT NULL;

-- Daily reward summary
CREATE INDEX IF NOT EXISTS idx_fact_gam_daily_rewards
ON data_warehouse.fact_gamification_events (date_key, student_key)
INCLUDE (xp_change, ml_coins_change);

-- ===========================================
-- fact_teacher_metrics - Covering Indexes
-- ===========================================

-- Teacher dashboard view
CREATE INDEX IF NOT EXISTS idx_fact_teacher_dashboard
ON data_warehouse.fact_teacher_metrics (teacher_key, date_key DESC)
INCLUDE (active_students, avg_class_score, completion_rate, students_struggling);

-- School-wide view
CREATE INDEX IF NOT EXISTS idx_fact_teacher_school_view
ON data_warehouse.fact_teacher_metrics (school_id, date_key)
INCLUDE (total_students, avg_class_score, completion_rate)
WHERE school_id IS NOT NULL;


-- =====================================================
-- DIMENSION TABLE ADDITIONAL INDEXES
-- =====================================================

-- ===========================================
-- dim_date - Calendar Navigation
-- ===========================================

-- School year semester lookup
CREATE INDEX IF NOT EXISTS idx_dim_date_school_semester
ON data_warehouse.dim_date (school_year, semester, full_date);

-- Quarter analysis
CREATE INDEX IF NOT EXISTS idx_dim_date_quarter
ON data_warehouse.dim_date (year, quarter, full_date);

-- Week-over-week analysis
CREATE INDEX IF NOT EXISTS idx_dim_date_weekly
ON data_warehouse.dim_date (year, week_of_year, day_of_week);

-- ===========================================
-- dim_student - Common Lookups
-- ===========================================

-- Grade level with current filter
CREATE INDEX IF NOT EXISTS idx_dim_student_grade_current
ON data_warehouse.dim_student (grade_level)
WHERE is_current = TRUE;

-- School with current filter
CREATE INDEX IF NOT EXISTS idx_dim_student_school_current
ON data_warehouse.dim_student (school_id)
WHERE is_current = TRUE AND school_id IS NOT NULL;

-- Registration date for cohort analysis
CREATE INDEX IF NOT EXISTS idx_dim_student_registration
ON data_warehouse.dim_student (registration_date)
WHERE is_current = TRUE;

-- ===========================================
-- dim_exercise - Content Analysis
-- ===========================================

-- Exercise type difficulty matrix
CREATE INDEX IF NOT EXISTS idx_dim_exercise_type_diff
ON data_warehouse.dim_exercise (exercise_type, difficulty_level)
WHERE is_active = TRUE;

-- Module content summary
CREATE INDEX IF NOT EXISTS idx_dim_exercise_module_content
ON data_warehouse.dim_exercise (module_key, exercise_type, order_index)
WHERE is_active = TRUE;


-- =====================================================
-- PARTIAL INDEXES FOR FILTERED QUERIES
-- =====================================================

-- Only passed completions
CREATE INDEX IF NOT EXISTS idx_fact_completion_passed_only
ON data_warehouse.fact_exercise_completions (date_key, student_key, score)
WHERE is_passed = TRUE;

-- Only failed completions (for intervention analysis)
CREATE INDEX IF NOT EXISTS idx_fact_completion_failed_only
ON data_warehouse.fact_exercise_completions (date_key, student_key, exercise_key)
WHERE is_passed = FALSE;

-- First attempts only (for clean conversion metrics)
CREATE INDEX IF NOT EXISTS idx_fact_completion_first_attempt
ON data_warehouse.fact_exercise_completions (date_key, student_key, exercise_key, score)
WHERE is_first_attempt = TRUE;

-- Perfect scores only (for excellence tracking)
CREATE INDEX IF NOT EXISTS idx_fact_completion_perfect_only
ON data_warehouse.fact_exercise_completions (date_key, student_key, exercise_key)
WHERE is_perfect = TRUE;

-- Active days only
CREATE INDEX IF NOT EXISTS idx_fact_progress_active_only
ON data_warehouse.fact_daily_progress (date_key, student_key, module_key)
WHERE is_active_day = TRUE;

-- High streak students
CREATE INDEX IF NOT EXISTS idx_fact_progress_high_streak
ON data_warehouse.fact_daily_progress (student_key, streak_days DESC)
WHERE streak_days >= 7;


-- =====================================================
-- BITMAP INDEXES (Simulated via B-tree on low cardinality)
-- PostgreSQL doesn't have native bitmap indexes, but partial
-- indexes on boolean/low-cardinality columns serve similar purpose
-- =====================================================

-- Note: The following indexes are optimized for analytics
-- where we filter on boolean/categorical columns

-- Weekend/weekday analysis
CREATE INDEX IF NOT EXISTS idx_dim_date_weekday
ON data_warehouse.dim_date (is_weekend, date_key)
WHERE is_weekend = FALSE;

-- School day analysis
CREATE INDEX IF NOT EXISTS idx_dim_date_school_day
ON data_warehouse.dim_date (is_school_day, date_key)
WHERE is_school_day = TRUE;

-- Published modules only
CREATE INDEX IF NOT EXISTS idx_dim_module_published
ON data_warehouse.dim_module (order_index)
WHERE is_published = TRUE;


-- =====================================================
-- BRIN INDEXES (Block Range Indexes)
-- Efficient for time-series data on large tables
-- =====================================================

-- Date-based BRIN for large fact tables (assuming date-ordered inserts)
CREATE INDEX IF NOT EXISTS idx_fact_completion_brin_date
ON data_warehouse.fact_exercise_completions
USING BRIN (date_key) WITH (pages_per_range = 128);

CREATE INDEX IF NOT EXISTS idx_fact_progress_brin_date
ON data_warehouse.fact_daily_progress
USING BRIN (date_key) WITH (pages_per_range = 128);

CREATE INDEX IF NOT EXISTS idx_fact_gam_event_brin_date
ON data_warehouse.fact_gamification_events
USING BRIN (date_key) WITH (pages_per_range = 128);

CREATE INDEX IF NOT EXISTS idx_fact_teacher_brin_date
ON data_warehouse.fact_teacher_metrics
USING BRIN (date_key) WITH (pages_per_range = 128);


-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON INDEX data_warehouse.idx_fact_completion_student_perf IS
'Covering index for student performance queries - includes score measures to avoid table lookups';

COMMENT ON INDEX data_warehouse.idx_fact_completion_brin_date IS
'BRIN index for efficient date range scans on large fact table';

COMMENT ON INDEX data_warehouse.idx_fact_progress_trend IS
'Covering index for student progress trending dashboards';

COMMENT ON INDEX data_warehouse.idx_fact_teacher_dashboard IS
'Optimized for teacher portal dashboard queries';
