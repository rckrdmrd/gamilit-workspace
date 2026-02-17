-- =====================================================
-- Table: data_warehouse.fact_daily_progress
-- Description: Daily aggregated student progress metrics
-- Type: Fact (Periodic Snapshot Grain)
-- Grain: One row per student per module per day
-- Sources: Aggregated from progress_tracking.*, gamification_system.*
-- Created: 2026-02-03
-- Sprint: 2.1 - Data Warehouse Design
-- =====================================================

SET search_path TO data_warehouse, public;

DROP TABLE IF EXISTS data_warehouse.fact_daily_progress CASCADE;

CREATE TABLE data_warehouse.fact_daily_progress (
    -- =====================================================
    -- SURROGATE KEY
    -- =====================================================
    progress_key BIGSERIAL NOT NULL,

    -- =====================================================
    -- DIMENSION KEYS (Foreign Keys to Dimensions)
    -- =====================================================
    date_key INTEGER NOT NULL,           -- FK to dim_date
    student_key BIGINT NOT NULL,         -- FK to dim_student
    module_key BIGINT NOT NULL,          -- FK to dim_module

    -- =====================================================
    -- DEGENERATE DIMENSIONS
    -- =====================================================
    classroom_id UUID,                   -- social_features.classrooms.id
    school_id UUID,                      -- social_features.schools.id

    -- =====================================================
    -- MEASURES - EXERCISE METRICS
    -- =====================================================
    exercises_completed INTEGER DEFAULT 0,
    exercises_attempted INTEGER DEFAULT 0,
    exercises_passed INTEGER DEFAULT 0,
    exercises_failed INTEGER DEFAULT 0,
    perfect_scores_count INTEGER DEFAULT 0,

    -- =====================================================
    -- MEASURES - SCORE METRICS
    -- =====================================================
    total_score INTEGER DEFAULT 0,
    max_possible_score INTEGER DEFAULT 0,
    average_score NUMERIC(5,2),
    min_score INTEGER,
    max_score INTEGER,

    -- =====================================================
    -- MEASURES - TIME METRICS
    -- =====================================================
    total_time_spent_seconds INTEGER DEFAULT 0,
    average_time_per_exercise_seconds INTEGER,
    sessions_count INTEGER DEFAULT 0,

    -- =====================================================
    -- MEASURES - GAMIFICATION
    -- =====================================================
    xp_earned INTEGER DEFAULT 0,
    ml_coins_earned INTEGER DEFAULT 0,
    ml_coins_spent INTEGER DEFAULT 0,
    achievements_unlocked INTEGER DEFAULT 0,

    -- =====================================================
    -- MEASURES - PROGRESS
    -- =====================================================
    progress_percentage NUMERIC(5,2) DEFAULT 0,
    progress_delta NUMERIC(5,2) DEFAULT 0,  -- Change from previous day

    -- =====================================================
    -- MEASURES - STREAK AND ENGAGEMENT
    -- =====================================================
    streak_days INTEGER DEFAULT 0,
    login_count INTEGER DEFAULT 0,
    is_active_day BOOLEAN DEFAULT FALSE,
    hints_used INTEGER DEFAULT 0,
    comodines_used INTEGER DEFAULT 0,

    -- =====================================================
    -- CUMULATIVE MEASURES (Running Totals)
    -- =====================================================
    cumulative_exercises_completed INTEGER DEFAULT 0,
    cumulative_xp INTEGER DEFAULT 0,
    cumulative_ml_coins INTEGER DEFAULT 0,
    cumulative_time_spent_seconds INTEGER DEFAULT 0,

    -- =====================================================
    -- AUDIT COLUMNS
    -- =====================================================
    snapshot_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    etl_loaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    etl_batch_id TEXT,

    -- =====================================================
    -- CONSTRAINTS
    -- =====================================================
    CONSTRAINT fact_daily_progress_pkey PRIMARY KEY (progress_key),
    CONSTRAINT fact_daily_progress_natural_key UNIQUE (date_key, student_key, module_key),
    CONSTRAINT fact_daily_progress_percentage_check CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    CONSTRAINT fact_daily_progress_exercises_check CHECK (exercises_completed >= 0 AND exercises_attempted >= exercises_completed)
);

-- =====================================================
-- DIMENSION FOREIGN KEY CONSTRAINTS
-- =====================================================
ALTER TABLE data_warehouse.fact_daily_progress
    ADD CONSTRAINT fk_fact_progress_date FOREIGN KEY (date_key)
    REFERENCES data_warehouse.dim_dates(date_key);

ALTER TABLE data_warehouse.fact_daily_progress
    ADD CONSTRAINT fk_fact_progress_student FOREIGN KEY (student_key)
    REFERENCES data_warehouse.dim_students(student_key);

ALTER TABLE data_warehouse.fact_daily_progress
    ADD CONSTRAINT fk_fact_progress_module FOREIGN KEY (module_key)
    REFERENCES data_warehouse.dim_modules(module_key);

-- =====================================================
-- INDEXES
-- =====================================================
-- Primary dimension lookups
CREATE INDEX idx_fact_progress_date ON data_warehouse.fact_daily_progress USING btree (date_key);
CREATE INDEX idx_fact_progress_student ON data_warehouse.fact_daily_progress USING btree (student_key);
CREATE INDEX idx_fact_progress_module ON data_warehouse.fact_daily_progress USING btree (module_key);

-- Common query patterns
CREATE INDEX idx_fact_progress_date_student ON data_warehouse.fact_daily_progress USING btree (date_key, student_key);
CREATE INDEX idx_fact_progress_student_module ON data_warehouse.fact_daily_progress USING btree (student_key, module_key);
CREATE INDEX idx_fact_progress_date_range ON data_warehouse.fact_daily_progress USING btree (date_key DESC);

-- Classroom/school filtering
CREATE INDEX idx_fact_progress_classroom ON data_warehouse.fact_daily_progress USING btree (classroom_id) WHERE classroom_id IS NOT NULL;
CREATE INDEX idx_fact_progress_school ON data_warehouse.fact_daily_progress USING btree (school_id) WHERE school_id IS NOT NULL;

-- Activity analysis
CREATE INDEX idx_fact_progress_active ON data_warehouse.fact_daily_progress USING btree (is_active_day) WHERE is_active_day = TRUE;
CREATE INDEX idx_fact_progress_streak ON data_warehouse.fact_daily_progress USING btree (streak_days DESC);

-- ETL tracking
CREATE INDEX idx_fact_progress_etl_batch ON data_warehouse.fact_daily_progress USING btree (etl_batch_id);

-- =====================================================
-- OWNERSHIP AND PERMISSIONS
-- =====================================================
ALTER TABLE data_warehouse.fact_daily_progress OWNER TO gamilit_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON data_warehouse.fact_daily_progress TO gamilit_user;
GRANT USAGE ON SEQUENCE data_warehouse.fact_daily_progress_progress_key_seq TO gamilit_user;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE data_warehouse.fact_daily_progress IS
'Daily aggregated progress fact table - Periodic snapshot grain.
Grain: One row per student per module per day.
Use for trend analysis, progress tracking, and daily engagement metrics.
Includes cumulative running totals for historical comparisons.
ETL: Daily batch load, aggregating from transaction facts.';

COMMENT ON COLUMN data_warehouse.fact_daily_progress.progress_key IS 'Surrogate key for the fact record';
COMMENT ON COLUMN data_warehouse.fact_daily_progress.progress_delta IS 'Progress percentage change from previous day';
COMMENT ON COLUMN data_warehouse.fact_daily_progress.is_active_day IS 'TRUE if student had any activity this day';
COMMENT ON COLUMN data_warehouse.fact_daily_progress.cumulative_exercises_completed IS 'Running total of exercises completed up to this date';
