-- =====================================================
-- Table: data_warehouse.dim_exercise
-- Description: Exercise dimension for content analytics
-- Type: Dimension
-- Grain: One row per exercise
-- Source: educational_content.exercises
-- SCD Type: Type 1 (Overwrite)
-- Created: 2026-02-03
-- Sprint: 2.1 - Data Warehouse Design
-- =====================================================

SET search_path TO data_warehouse, public;

DROP TABLE IF EXISTS data_warehouse.dim_exercise CASCADE;

CREATE TABLE data_warehouse.dim_exercise (
    -- =====================================================
    -- SURROGATE KEY
    -- =====================================================
    exercise_key BIGSERIAL NOT NULL,

    -- =====================================================
    -- NATURAL KEY (From source system)
    -- =====================================================
    exercise_id UUID NOT NULL,           -- educational_content.exercises.id

    -- =====================================================
    -- EXERCISE ATTRIBUTES
    -- =====================================================
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    instructions TEXT,

    -- =====================================================
    -- CLASSIFICATION
    -- =====================================================
    exercise_type TEXT NOT NULL,         -- crucigrama, mapa_conceptual, etc.
    exercise_type_category TEXT,         -- comprehension, analysis, creative
    order_index INTEGER,

    -- =====================================================
    -- MODULE RELATIONSHIP (Denormalized)
    -- =====================================================
    module_key BIGINT,                   -- FK to dim_module
    module_id UUID,                      -- Source FK
    module_name TEXT,                    -- Denormalized for query performance
    module_order INTEGER,

    -- =====================================================
    -- DIFFICULTY AND SCORING
    -- =====================================================
    difficulty_level TEXT DEFAULT 'beginner',
    max_points INTEGER DEFAULT 100,
    passing_score INTEGER DEFAULT 70,
    estimated_time_minutes INTEGER DEFAULT 10,
    time_limit_minutes INTEGER,
    max_attempts INTEGER DEFAULT 3,

    -- =====================================================
    -- REWARDS
    -- =====================================================
    xp_reward INTEGER DEFAULT 20,
    ml_coins_reward INTEGER DEFAULT 5,
    bonus_multiplier NUMERIC(3,2) DEFAULT 1.00,

    -- =====================================================
    -- FLAGS
    -- =====================================================
    is_active BOOLEAN DEFAULT TRUE,
    is_optional BOOLEAN DEFAULT FALSE,
    is_bonus BOOLEAN DEFAULT FALSE,
    auto_gradable BOOLEAN DEFAULT TRUE,
    requires_manual_grading BOOLEAN DEFAULT FALSE,
    allow_retry BOOLEAN DEFAULT TRUE,
    enable_hints BOOLEAN DEFAULT TRUE,
    adaptive_difficulty BOOLEAN DEFAULT FALSE,

    -- =====================================================
    -- PEDAGOGICAL CONTENT
    -- =====================================================
    objective TEXT,
    how_to_solve TEXT,
    recommended_strategy TEXT,
    bloom_taxonomy_level TEXT,           -- remember, understand, apply, analyze, evaluate, create
    cognitive_level TEXT,

    -- =====================================================
    -- COMODINES (Power-ups)
    -- =====================================================
    comodines_allowed TEXT[],            -- ['pistas', 'vision_lectora', 'segunda_oportunidad']
    hint_cost_ml_coins INTEGER DEFAULT 5,

    -- =====================================================
    -- AUDIT COLUMNS
    -- =====================================================
    created_date DATE,
    created_by_id UUID,
    version INTEGER DEFAULT 1,
    source_updated_at TIMESTAMP WITH TIME ZONE,
    etl_loaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    etl_batch_id TEXT,

    -- =====================================================
    -- CONSTRAINTS
    -- =====================================================
    CONSTRAINT dim_exercise_pkey PRIMARY KEY (exercise_key),
    CONSTRAINT dim_exercise_exercise_id_key UNIQUE (exercise_id),
    CONSTRAINT dim_exercise_difficulty_check CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    CONSTRAINT dim_exercise_max_points_check CHECK (max_points > 0),
    CONSTRAINT dim_exercise_passing_score_check CHECK (passing_score > 0 AND passing_score <= max_points)
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_dim_exercise_exercise_id ON data_warehouse.dim_exercise USING btree (exercise_id);
CREATE INDEX idx_dim_exercise_module_key ON data_warehouse.dim_exercise USING btree (module_key);
CREATE INDEX idx_dim_exercise_type ON data_warehouse.dim_exercise USING btree (exercise_type);
CREATE INDEX idx_dim_exercise_difficulty ON data_warehouse.dim_exercise USING btree (difficulty_level);
CREATE INDEX idx_dim_exercise_active ON data_warehouse.dim_exercise USING btree (is_active) WHERE is_active = TRUE;
CREATE INDEX idx_dim_exercise_module_order ON data_warehouse.dim_exercise USING btree (module_key, order_index);

-- =====================================================
-- OWNERSHIP AND PERMISSIONS
-- =====================================================
ALTER TABLE data_warehouse.dim_exercise OWNER TO gamilit_user;
GRANT SELECT, INSERT, UPDATE ON data_warehouse.dim_exercise TO gamilit_user;
GRANT USAGE ON SEQUENCE data_warehouse.dim_exercise_exercise_key_seq TO gamilit_user;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE data_warehouse.dim_exercise IS
'Exercise dimension - Content metadata for analytics.
Grain: One row per exercise.
Source: educational_content.exercises.
SCD Type 1: Overwrites on change.
Includes denormalized module info for query performance.';

COMMENT ON COLUMN data_warehouse.dim_exercise.exercise_key IS 'Surrogate key for fact table joins';
COMMENT ON COLUMN data_warehouse.dim_exercise.exercise_id IS 'Natural key from educational_content.exercises.id';
COMMENT ON COLUMN data_warehouse.dim_exercise.exercise_type IS '27 mechanic types: crucigrama, mapa_conceptual, detective_textual, etc.';
COMMENT ON COLUMN data_warehouse.dim_exercise.requires_manual_grading IS 'TRUE: teacher review required, FALSE: auto-graded';
