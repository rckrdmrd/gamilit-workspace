-- =====================================================
-- Table: data_warehouse.fact_teacher_metrics
-- Description: Daily teacher and classroom performance metrics
-- Type: Fact (Periodic Snapshot Grain)
-- Grain: One row per teacher per classroom per day
-- Sources: Aggregated from classrooms, classroom_members, progress data
-- Created: 2026-02-03
-- Sprint: 2.1 - Data Warehouse Design
-- =====================================================

SET search_path TO data_warehouse, public;

DROP TABLE IF EXISTS data_warehouse.fact_teacher_metrics CASCADE;

CREATE TABLE data_warehouse.fact_teacher_metrics (
    -- =====================================================
    -- SURROGATE KEY
    -- =====================================================
    metric_key BIGSERIAL NOT NULL,

    -- =====================================================
    -- DIMENSION KEYS (Foreign Keys to Dimensions)
    -- =====================================================
    date_key INTEGER NOT NULL,           -- FK to dim_date
    teacher_key BIGINT NOT NULL,         -- FK to dim_teacher

    -- =====================================================
    -- DEGENERATE DIMENSIONS
    -- =====================================================
    classroom_id UUID NOT NULL,          -- social_features.classrooms.id
    classroom_name TEXT,                 -- Denormalized for reporting
    school_id UUID,
    grade_level TEXT,
    subject TEXT,
    academic_year TEXT,

    -- =====================================================
    -- MEASURES - STUDENT METRICS
    -- =====================================================
    total_students INTEGER DEFAULT 0,
    active_students INTEGER DEFAULT 0,   -- Students with activity this day
    inactive_students INTEGER DEFAULT 0, -- Students without recent activity
    new_students_enrolled INTEGER DEFAULT 0,
    students_dropped INTEGER DEFAULT 0,

    -- =====================================================
    -- MEASURES - ASSIGNMENT METRICS
    -- =====================================================
    assignments_created INTEGER DEFAULT 0,
    assignments_active INTEGER DEFAULT 0,
    assignments_due_today INTEGER DEFAULT 0,
    assignments_overdue INTEGER DEFAULT 0,

    -- =====================================================
    -- MEASURES - SUBMISSION METRICS
    -- =====================================================
    submissions_received INTEGER DEFAULT 0,
    submissions_graded INTEGER DEFAULT 0,
    submissions_pending_review INTEGER DEFAULT 0,
    avg_grading_time_hours NUMERIC(5,2),

    -- =====================================================
    -- MEASURES - CLASS PERFORMANCE
    -- =====================================================
    avg_class_score NUMERIC(5,2),        -- Average score across all students
    median_class_score NUMERIC(5,2),
    min_class_score INTEGER,
    max_class_score INTEGER,
    score_std_deviation NUMERIC(5,2),

    -- =====================================================
    -- MEASURES - COMPLETION RATES
    -- =====================================================
    completion_rate NUMERIC(5,2),        -- % of assigned exercises completed
    pass_rate NUMERIC(5,2),              -- % of completed exercises passed
    perfect_score_rate NUMERIC(5,2),     -- % with perfect scores

    -- =====================================================
    -- MEASURES - ENGAGEMENT
    -- =====================================================
    total_exercises_assigned INTEGER DEFAULT 0,
    total_exercises_completed INTEGER DEFAULT 0,
    total_time_spent_seconds INTEGER DEFAULT 0,
    avg_time_per_student_seconds INTEGER,

    -- =====================================================
    -- MEASURES - GAMIFICATION
    -- =====================================================
    total_xp_earned_class INTEGER DEFAULT 0,
    avg_xp_per_student INTEGER,
    achievements_unlocked_class INTEGER DEFAULT 0,
    avg_streak_days NUMERIC(5,2),

    -- =====================================================
    -- MEASURES - AT-RISK INDICATORS
    -- =====================================================
    students_struggling INTEGER DEFAULT 0,   -- Below 60% avg score
    students_excelling INTEGER DEFAULT 0,    -- Above 90% avg score
    students_no_activity_7days INTEGER DEFAULT 0,
    interventions_needed INTEGER DEFAULT 0,

    -- =====================================================
    -- AUDIT COLUMNS
    -- =====================================================
    snapshot_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    etl_loaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    etl_batch_id TEXT,

    -- =====================================================
    -- CONSTRAINTS
    -- =====================================================
    CONSTRAINT fact_teacher_metrics_pkey PRIMARY KEY (metric_key),
    CONSTRAINT fact_teacher_metrics_natural_key UNIQUE (date_key, teacher_key, classroom_id),
    CONSTRAINT fact_teacher_metrics_completion_check CHECK (completion_rate IS NULL OR (completion_rate >= 0 AND completion_rate <= 100)),
    CONSTRAINT fact_teacher_metrics_pass_rate_check CHECK (pass_rate IS NULL OR (pass_rate >= 0 AND pass_rate <= 100))
);

-- =====================================================
-- DIMENSION FOREIGN KEY CONSTRAINTS
-- =====================================================
ALTER TABLE data_warehouse.fact_teacher_metrics
    ADD CONSTRAINT fk_fact_teacher_date FOREIGN KEY (date_key)
    REFERENCES data_warehouse.dim_date(date_key);

ALTER TABLE data_warehouse.fact_teacher_metrics
    ADD CONSTRAINT fk_fact_teacher_teacher FOREIGN KEY (teacher_key)
    REFERENCES data_warehouse.dim_teacher(teacher_key);

-- =====================================================
-- INDEXES
-- =====================================================
-- Primary dimension lookups
CREATE INDEX idx_fact_teacher_date ON data_warehouse.fact_teacher_metrics USING btree (date_key);
CREATE INDEX idx_fact_teacher_teacher ON data_warehouse.fact_teacher_metrics USING btree (teacher_key);

-- Common query patterns
CREATE INDEX idx_fact_teacher_date_teacher ON data_warehouse.fact_teacher_metrics USING btree (date_key, teacher_key);
CREATE INDEX idx_fact_teacher_classroom ON data_warehouse.fact_teacher_metrics USING btree (classroom_id);
CREATE INDEX idx_fact_teacher_school ON data_warehouse.fact_teacher_metrics USING btree (school_id) WHERE school_id IS NOT NULL;
CREATE INDEX idx_fact_teacher_date_range ON data_warehouse.fact_teacher_metrics USING btree (date_key DESC);

-- Grade and subject filtering
CREATE INDEX idx_fact_teacher_grade ON data_warehouse.fact_teacher_metrics USING btree (grade_level);
CREATE INDEX idx_fact_teacher_subject ON data_warehouse.fact_teacher_metrics USING btree (subject);

-- Performance analysis
CREATE INDEX idx_fact_teacher_avg_score ON data_warehouse.fact_teacher_metrics USING btree (avg_class_score);
CREATE INDEX idx_fact_teacher_completion ON data_warehouse.fact_teacher_metrics USING btree (completion_rate);

-- At-risk analysis
CREATE INDEX idx_fact_teacher_struggling ON data_warehouse.fact_teacher_metrics USING btree (students_struggling DESC) WHERE students_struggling > 0;
CREATE INDEX idx_fact_teacher_inactive ON data_warehouse.fact_teacher_metrics USING btree (students_no_activity_7days DESC) WHERE students_no_activity_7days > 0;

-- ETL tracking
CREATE INDEX idx_fact_teacher_etl_batch ON data_warehouse.fact_teacher_metrics USING btree (etl_batch_id);

-- =====================================================
-- OWNERSHIP AND PERMISSIONS
-- =====================================================
ALTER TABLE data_warehouse.fact_teacher_metrics OWNER TO gamilit_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON data_warehouse.fact_teacher_metrics TO gamilit_user;
GRANT USAGE ON SEQUENCE data_warehouse.fact_teacher_metrics_metric_key_seq TO gamilit_user;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE data_warehouse.fact_teacher_metrics IS
'Teacher and classroom metrics fact table - Periodic snapshot grain.
Grain: One row per teacher per classroom per day.
Use for teacher dashboards, classroom performance tracking, early warning systems.
Key metrics: avg_class_score, completion_rate, students_struggling.
ETL: Daily batch load, aggregating student progress by classroom.';

COMMENT ON COLUMN data_warehouse.fact_teacher_metrics.metric_key IS 'Surrogate key for the fact record';
COMMENT ON COLUMN data_warehouse.fact_teacher_metrics.active_students IS 'Students with any activity on this day';
COMMENT ON COLUMN data_warehouse.fact_teacher_metrics.completion_rate IS 'Percentage of assigned exercises completed';
COMMENT ON COLUMN data_warehouse.fact_teacher_metrics.students_struggling IS 'Students averaging below 60% - may need intervention';
COMMENT ON COLUMN data_warehouse.fact_teacher_metrics.students_no_activity_7days IS 'Students with no activity in past 7 days';
