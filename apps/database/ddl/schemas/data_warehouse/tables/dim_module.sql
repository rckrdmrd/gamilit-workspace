-- =====================================================
-- Table: data_warehouse.dim_module
-- Description: Module dimension for educational content analytics
-- Type: Dimension
-- Grain: One row per module
-- Source: educational_content.modules
-- SCD Type: Type 1 (Overwrite)
-- Created: 2026-02-03
-- Sprint: 2.1 - Data Warehouse Design
-- =====================================================

SET search_path TO data_warehouse, public;

DROP TABLE IF EXISTS data_warehouse.dim_module CASCADE;

CREATE TABLE data_warehouse.dim_module (
    -- =====================================================
    -- SURROGATE KEY
    -- =====================================================
    module_key BIGSERIAL NOT NULL,

    -- =====================================================
    -- NATURAL KEY (From source system)
    -- =====================================================
    module_id UUID NOT NULL,             -- educational_content.modules.id

    -- =====================================================
    -- MODULE ATTRIBUTES
    -- =====================================================
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    summary TEXT,
    module_code TEXT,
    order_index INTEGER NOT NULL,

    -- =====================================================
    -- CLASSIFICATION
    -- =====================================================
    difficulty_level TEXT DEFAULT 'beginner',
    grade_levels TEXT[],                 -- ['6', '7', '8']
    subjects TEXT[],                     -- ['Literatura', 'Ciencias']

    -- =====================================================
    -- CONTENT METRICS
    -- =====================================================
    total_exercises INTEGER DEFAULT 0,
    total_levels INTEGER DEFAULT 0,
    estimated_duration_minutes INTEGER DEFAULT 120,
    estimated_sessions INTEGER DEFAULT 4,

    -- =====================================================
    -- LEARNING OBJECTIVES
    -- =====================================================
    learning_objectives TEXT[],
    competencies TEXT[],
    skills_developed TEXT[],

    -- =====================================================
    -- GAMIFICATION
    -- =====================================================
    maya_rank_required TEXT,             -- Rank required to unlock
    maya_rank_granted TEXT,              -- Rank granted on completion
    xp_reward INTEGER DEFAULT 100,
    ml_coins_reward INTEGER DEFAULT 50,

    -- =====================================================
    -- STATUS FLAGS
    -- =====================================================
    status TEXT DEFAULT 'draft',
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_free BOOLEAN DEFAULT TRUE,
    is_demo_module BOOLEAN DEFAULT FALSE,

    -- =====================================================
    -- MEDIA
    -- =====================================================
    thumbnail_url TEXT,
    cover_image_url TEXT,

    -- =====================================================
    -- AUDIT COLUMNS
    -- =====================================================
    created_date DATE,
    published_date DATE,
    created_by_id UUID,
    reviewed_by_id UUID,
    approved_by_id UUID,
    version INTEGER DEFAULT 1,
    source_updated_at TIMESTAMP WITH TIME ZONE,
    etl_loaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    etl_batch_id TEXT,

    -- =====================================================
    -- CONSTRAINTS
    -- =====================================================
    CONSTRAINT dim_module_pkey PRIMARY KEY (module_key),
    CONSTRAINT dim_module_module_id_key UNIQUE (module_id),
    CONSTRAINT dim_module_difficulty_check CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    CONSTRAINT dim_module_status_check CHECK (status IN ('draft', 'review', 'approved', 'published', 'archived'))
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_dim_module_module_id ON data_warehouse.dim_module USING btree (module_id);
CREATE INDEX idx_dim_module_order ON data_warehouse.dim_module USING btree (order_index);
CREATE INDEX idx_dim_module_difficulty ON data_warehouse.dim_module USING btree (difficulty_level);
CREATE INDEX idx_dim_module_published ON data_warehouse.dim_module USING btree (is_published) WHERE is_published = TRUE;
CREATE INDEX idx_dim_module_status ON data_warehouse.dim_module USING btree (status);
CREATE INDEX idx_dim_module_rank_required ON data_warehouse.dim_module USING btree (maya_rank_required);

-- Grade levels GIN index for array containment queries
CREATE INDEX idx_dim_module_grade_levels ON data_warehouse.dim_module USING gin (grade_levels);

-- =====================================================
-- OWNERSHIP AND PERMISSIONS
-- =====================================================
ALTER TABLE data_warehouse.dim_module OWNER TO gamilit_user;
GRANT SELECT, INSERT, UPDATE ON data_warehouse.dim_module TO gamilit_user;
GRANT USAGE ON SEQUENCE data_warehouse.dim_module_module_key_seq TO gamilit_user;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE data_warehouse.dim_module IS
'Module dimension - Educational content structure for analytics.
Grain: One row per module.
Source: educational_content.modules.
GAMILIT has 5 core modules based on Marie Curie story for reading comprehension.
Modules unlock progressively based on Maya ranks.';

COMMENT ON COLUMN data_warehouse.dim_module.module_key IS 'Surrogate key for fact table joins';
COMMENT ON COLUMN data_warehouse.dim_module.module_id IS 'Natural key from educational_content.modules.id';
COMMENT ON COLUMN data_warehouse.dim_module.maya_rank_required IS 'Maya rank needed to access this module';
COMMENT ON COLUMN data_warehouse.dim_module.maya_rank_granted IS 'Maya rank earned upon module completion';
