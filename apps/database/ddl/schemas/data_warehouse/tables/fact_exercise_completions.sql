-- =====================================================
-- Table: data_warehouse.fact_exercise_completions
-- Description: Main fact table for exercise completion events
-- Type: Fact (Transaction Grain)
-- Grain: One row per exercise attempt/completion
-- Sources: progress_tracking.exercise_attempts, progress_tracking.exercise_submissions
-- Created: 2026-02-03
-- Sprint: 2.1 - Data Warehouse Design
-- =====================================================

SET search_path TO data_warehouse, public;

DROP TABLE IF EXISTS data_warehouse.fact_exercise_completions CASCADE;

CREATE TABLE data_warehouse.fact_exercise_completions (
    -- =====================================================
    -- SURROGATE KEY
    -- =====================================================
    completion_key BIGSERIAL NOT NULL,

    -- =====================================================
    -- DIMENSION KEYS (Foreign Keys to Dimensions)
    -- =====================================================
    date_key INTEGER NOT NULL,           -- FK to dim_date
    time_key INTEGER NOT NULL,           -- FK to dim_time
    student_key BIGINT NOT NULL,         -- FK to dim_student
    exercise_key BIGINT NOT NULL,        -- FK to dim_exercise
    module_key BIGINT NOT NULL,          -- FK to dim_module
    teacher_key BIGINT,                  -- FK to dim_teacher (nullable - may not have assigned teacher)

    -- =====================================================
    -- DEGENERATE DIMENSIONS (Operational keys for drill-through)
    -- =====================================================
    source_attempt_id UUID,              -- exercise_attempts.id or exercise_submissions.id
    source_table TEXT NOT NULL,          -- 'exercise_attempts' or 'exercise_submissions'
    classroom_id UUID,                   -- social_features.classrooms.id
    assignment_id UUID,                  -- educational_content.assignments.id

    -- =====================================================
    -- MEASURES - SCORE AND PERFORMANCE
    -- =====================================================
    score INTEGER DEFAULT 0,             -- Points earned (0-max_score)
    max_score INTEGER DEFAULT 100,       -- Maximum possible score
    score_percentage NUMERIC(5,2),       -- (score/max_score)*100
    passing_score INTEGER,               -- Required to pass

    -- =====================================================
    -- MEASURES - TIME
    -- =====================================================
    time_spent_seconds INTEGER DEFAULT 0,
    estimated_time_seconds INTEGER,      -- From exercise config
    time_efficiency_ratio NUMERIC(5,2),  -- estimated/actual (>1 = faster than expected)

    -- =====================================================
    -- MEASURES - ATTEMPTS
    -- =====================================================
    attempt_number INTEGER DEFAULT 1,
    max_attempts_allowed INTEGER,

    -- =====================================================
    -- MEASURES - GAMIFICATION REWARDS
    -- =====================================================
    xp_earned INTEGER DEFAULT 0,
    ml_coins_earned INTEGER DEFAULT 0,
    bonus_multiplier NUMERIC(3,2) DEFAULT 1.00,

    -- =====================================================
    -- MEASURES - HINTS AND COMODINES
    -- =====================================================
    hints_used INTEGER DEFAULT 0,
    comodines_used_count INTEGER DEFAULT 0,
    ml_coins_spent INTEGER DEFAULT 0,    -- Coins spent on hints/comodines

    -- =====================================================
    -- FLAGS AND INDICATORS
    -- =====================================================
    is_first_attempt BOOLEAN DEFAULT TRUE,
    is_passed BOOLEAN DEFAULT FALSE,     -- score >= passing_score
    is_perfect BOOLEAN DEFAULT FALSE,    -- score = max_score (100%)
    is_correct BOOLEAN,                  -- For binary correct/incorrect exercises
    is_graded BOOLEAN DEFAULT FALSE,     -- TRUE if manually graded
    requires_manual_grading BOOLEAN DEFAULT FALSE,
    status TEXT,                         -- 'submitted', 'graded', 'reviewed'

    -- =====================================================
    -- AUDIT COLUMNS
    -- =====================================================
    submitted_at TIMESTAMP WITH TIME ZONE,
    graded_at TIMESTAMP WITH TIME ZONE,
    graded_by_id UUID,
    etl_loaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    etl_batch_id TEXT,
    source_updated_at TIMESTAMP WITH TIME ZONE,

    -- =====================================================
    -- CONSTRAINTS
    -- =====================================================
    CONSTRAINT fact_exercise_completions_pkey PRIMARY KEY (completion_key),
    CONSTRAINT fact_exercise_completions_source_key UNIQUE (source_table, source_attempt_id),
    CONSTRAINT fact_exercise_completions_score_check CHECK (score >= 0 AND score <= max_score),
    CONSTRAINT fact_exercise_completions_attempt_check CHECK (attempt_number > 0),
    CONSTRAINT fact_exercise_completions_source_check CHECK (source_table IN ('exercise_attempts', 'exercise_submissions'))
);

-- =====================================================
-- DIMENSION FOREIGN KEY CONSTRAINTS
-- =====================================================
ALTER TABLE data_warehouse.fact_exercise_completions
    ADD CONSTRAINT fk_fact_completion_date FOREIGN KEY (date_key)
    REFERENCES data_warehouse.dim_date(date_key);

ALTER TABLE data_warehouse.fact_exercise_completions
    ADD CONSTRAINT fk_fact_completion_time FOREIGN KEY (time_key)
    REFERENCES data_warehouse.dim_time(time_key);

ALTER TABLE data_warehouse.fact_exercise_completions
    ADD CONSTRAINT fk_fact_completion_student FOREIGN KEY (student_key)
    REFERENCES data_warehouse.dim_student(student_key);

ALTER TABLE data_warehouse.fact_exercise_completions
    ADD CONSTRAINT fk_fact_completion_exercise FOREIGN KEY (exercise_key)
    REFERENCES data_warehouse.dim_exercise(exercise_key);

ALTER TABLE data_warehouse.fact_exercise_completions
    ADD CONSTRAINT fk_fact_completion_module FOREIGN KEY (module_key)
    REFERENCES data_warehouse.dim_module(module_key);

ALTER TABLE data_warehouse.fact_exercise_completions
    ADD CONSTRAINT fk_fact_completion_teacher FOREIGN KEY (teacher_key)
    REFERENCES data_warehouse.dim_teacher(teacher_key);

-- =====================================================
-- INDEXES
-- =====================================================
-- Primary dimension key lookups
CREATE INDEX idx_fact_completion_date ON data_warehouse.fact_exercise_completions USING btree (date_key);
CREATE INDEX idx_fact_completion_student ON data_warehouse.fact_exercise_completions USING btree (student_key);
CREATE INDEX idx_fact_completion_exercise ON data_warehouse.fact_exercise_completions USING btree (exercise_key);
CREATE INDEX idx_fact_completion_module ON data_warehouse.fact_exercise_completions USING btree (module_key);
CREATE INDEX idx_fact_completion_teacher ON data_warehouse.fact_exercise_completions USING btree (teacher_key) WHERE teacher_key IS NOT NULL;

-- Common query patterns
CREATE INDEX idx_fact_completion_date_student ON data_warehouse.fact_exercise_completions USING btree (date_key, student_key);
CREATE INDEX idx_fact_completion_student_exercise ON data_warehouse.fact_exercise_completions USING btree (student_key, exercise_key);
CREATE INDEX idx_fact_completion_date_range ON data_warehouse.fact_exercise_completions USING btree (date_key DESC);

-- Classroom/assignment filtering
CREATE INDEX idx_fact_completion_classroom ON data_warehouse.fact_exercise_completions USING btree (classroom_id) WHERE classroom_id IS NOT NULL;
CREATE INDEX idx_fact_completion_assignment ON data_warehouse.fact_exercise_completions USING btree (assignment_id) WHERE assignment_id IS NOT NULL;

-- Performance analysis
CREATE INDEX idx_fact_completion_passed ON data_warehouse.fact_exercise_completions USING btree (is_passed) WHERE is_passed = TRUE;
CREATE INDEX idx_fact_completion_perfect ON data_warehouse.fact_exercise_completions USING btree (is_perfect) WHERE is_perfect = TRUE;

-- ETL tracking
CREATE INDEX idx_fact_completion_etl_batch ON data_warehouse.fact_exercise_completions USING btree (etl_batch_id);
CREATE INDEX idx_fact_completion_source ON data_warehouse.fact_exercise_completions USING btree (source_table, source_attempt_id);

-- =====================================================
-- OWNERSHIP AND PERMISSIONS
-- =====================================================
ALTER TABLE data_warehouse.fact_exercise_completions OWNER TO gamilit_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON data_warehouse.fact_exercise_completions TO gamilit_user;
GRANT USAGE ON SEQUENCE data_warehouse.fact_exercise_completions_completion_key_seq TO gamilit_user;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE data_warehouse.fact_exercise_completions IS
'Main fact table for exercise completion analytics.
Grain: One row per exercise attempt or submission.
Sources: exercise_attempts (auto-graded), exercise_submissions (manual graded).
Key metrics: score, time_spent, xp_earned, ml_coins_earned.
Conformed dimensions: date, time, student, exercise, module, teacher.';

COMMENT ON COLUMN data_warehouse.fact_exercise_completions.completion_key IS 'Surrogate key for the fact record';
COMMENT ON COLUMN data_warehouse.fact_exercise_completions.source_table IS 'Origin table: exercise_attempts or exercise_submissions';
COMMENT ON COLUMN data_warehouse.fact_exercise_completions.score_percentage IS 'Calculated: (score/max_score)*100';
COMMENT ON COLUMN data_warehouse.fact_exercise_completions.time_efficiency_ratio IS 'estimated_time/actual_time - higher is faster';
COMMENT ON COLUMN data_warehouse.fact_exercise_completions.is_first_attempt IS 'TRUE if this is the first attempt for this student-exercise';
COMMENT ON COLUMN data_warehouse.fact_exercise_completions.is_perfect IS 'TRUE if score equals max_score (100%)';
