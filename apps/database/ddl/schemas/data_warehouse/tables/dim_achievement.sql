-- =====================================================
-- Table: data_warehouse.dim_achievements
-- Description: Achievement dimension for gamification analytics
-- Type: Dimension
-- Grain: One row per achievement
-- Source: gamification_system.achievements
-- SCD Type: Type 1 (Overwrite)
-- Created: 2026-02-03
-- Sprint: 2.1 - Data Warehouse Design
-- =====================================================

SET search_path TO data_warehouse, public;

DROP TABLE IF EXISTS data_warehouse.dim_achievements CASCADE;

CREATE TABLE data_warehouse.dim_achievements (
    -- =====================================================
    -- SURROGATE KEY
    -- =====================================================
    achievement_key BIGSERIAL NOT NULL,

    -- =====================================================
    -- NATURAL KEY (From source system)
    -- =====================================================
    achievement_id UUID NOT NULL,        -- gamification_system.achievements.id

    -- =====================================================
    -- ACHIEVEMENT ATTRIBUTES
    -- =====================================================
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'trophy',
    unlock_message TEXT,
    instructions TEXT,
    tips TEXT[],

    -- =====================================================
    -- CLASSIFICATION
    -- =====================================================
    category TEXT NOT NULL,              -- progress, streak, completion, social, special, mastery, exploration
    category_display TEXT,               -- Localized category name
    rarity TEXT DEFAULT 'common',        -- common, rare, epic, legendary
    difficulty_level TEXT DEFAULT 'beginner',

    -- =====================================================
    -- REQUIREMENTS
    -- =====================================================
    points_required INTEGER DEFAULT 0,
    points_value INTEGER DEFAULT 0,
    conditions JSONB,                    -- Unlock conditions

    -- =====================================================
    -- REWARDS
    -- =====================================================
    xp_reward INTEGER DEFAULT 100,
    ml_coins_reward INTEGER DEFAULT 50,
    badge_name TEXT,
    badge_url TEXT,

    -- =====================================================
    -- FLAGS
    -- =====================================================
    is_secret BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    is_repeatable BOOLEAN DEFAULT FALSE,
    order_index INTEGER DEFAULT 0,

    -- =====================================================
    -- AUDIT COLUMNS
    -- =====================================================
    created_date DATE,
    created_by_id UUID,
    source_updated_at TIMESTAMP WITH TIME ZONE,
    etl_loaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    etl_batch_id TEXT,

    -- =====================================================
    -- CONSTRAINTS
    -- =====================================================
    CONSTRAINT dim_achievements_pkey PRIMARY KEY (achievement_key),
    CONSTRAINT dim_achievements_achievement_id_key UNIQUE (achievement_id),
    CONSTRAINT dim_achievements_category_check CHECK (category IN ('progress', 'streak', 'completion', 'social', 'special', 'mastery', 'exploration')),
    CONSTRAINT dim_achievements_rarity_check CHECK (rarity IN ('common', 'rare', 'epic', 'legendary'))
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_dim_achievements_achievement_id ON data_warehouse.dim_achievements USING btree (achievement_id);
CREATE INDEX idx_dim_achievements_category ON data_warehouse.dim_achievements USING btree (category);
CREATE INDEX idx_dim_achievements_rarity ON data_warehouse.dim_achievements USING btree (rarity);
CREATE INDEX idx_dim_achievements_active ON data_warehouse.dim_achievements USING btree (is_active) WHERE is_active = TRUE;
CREATE INDEX idx_dim_achievements_secret ON data_warehouse.dim_achievements USING btree (is_secret) WHERE is_secret = TRUE;
CREATE INDEX idx_dim_achievements_order ON data_warehouse.dim_achievements USING btree (category, order_index);

-- =====================================================
-- OWNERSHIP AND PERMISSIONS
-- =====================================================
ALTER TABLE data_warehouse.dim_achievements OWNER TO gamilit_user;
GRANT SELECT, INSERT, UPDATE ON data_warehouse.dim_achievements TO gamilit_user;
GRANT USAGE ON SEQUENCE data_warehouse.dim_achievements_achievement_key_seq TO gamilit_user;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE data_warehouse.dim_achievements IS
'Achievement dimension - Gamification achievements catalog.
Grain: One row per achievement definition.
Source: gamification_system.achievements.
Categories: progress, streak, completion, social, special, mastery, exploration.
Rarity tiers: common, rare, epic, legendary.';

COMMENT ON COLUMN data_warehouse.dim_achievements.achievement_key IS 'Surrogate key for fact table joins';
COMMENT ON COLUMN data_warehouse.dim_achievements.achievement_id IS 'Natural key from gamification_system.achievements.id';
COMMENT ON COLUMN data_warehouse.dim_achievements.category IS 'Achievement category for grouping';
COMMENT ON COLUMN data_warehouse.dim_achievements.rarity IS 'Rarity tier: common (most frequent) to legendary (rarest)';
COMMENT ON COLUMN data_warehouse.dim_achievements.is_secret IS 'Hidden until unlocked';
