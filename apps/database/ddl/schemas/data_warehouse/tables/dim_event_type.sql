-- =====================================================
-- Table: data_warehouse.dim_event_types
-- Description: Event type dimension for gamification event classification
-- Type: Dimension (Reference/Lookup)
-- Grain: One row per event type
-- Source: System-defined event types
-- SCD Type: Type 1 (Overwrite)
-- Created: 2026-02-03
-- Sprint: 2.1 - Data Warehouse Design
-- =====================================================

SET search_path TO data_warehouse, public;

DROP TABLE IF EXISTS data_warehouse.dim_event_types CASCADE;

CREATE TABLE data_warehouse.dim_event_types (
    -- =====================================================
    -- SURROGATE KEY
    -- =====================================================
    event_type_key SERIAL NOT NULL,

    -- =====================================================
    -- BUSINESS KEY
    -- =====================================================
    event_type_code TEXT NOT NULL,       -- Unique code (e.g., 'ACHIEVEMENT_UNLOCKED')

    -- =====================================================
    -- EVENT TYPE ATTRIBUTES
    -- =====================================================
    event_type_name TEXT NOT NULL,       -- Display name (e.g., 'Achievement Unlocked')
    event_type_name_es TEXT,             -- Spanish name (e.g., 'Logro Desbloqueado')
    description TEXT,

    -- =====================================================
    -- CLASSIFICATION
    -- =====================================================
    category TEXT NOT NULL,              -- Main category
    subcategory TEXT,                    -- Sub-category

    -- =====================================================
    -- EVENT CHARACTERISTICS
    -- =====================================================
    affects_xp BOOLEAN DEFAULT FALSE,
    affects_coins BOOLEAN DEFAULT FALSE,
    affects_rank BOOLEAN DEFAULT FALSE,
    affects_level BOOLEAN DEFAULT FALSE,
    affects_streak BOOLEAN DEFAULT FALSE,

    -- =====================================================
    -- DIRECTION
    -- =====================================================
    xp_direction TEXT,                   -- 'increase', 'decrease', 'none'
    coins_direction TEXT,                -- 'increase', 'decrease', 'none'

    -- =====================================================
    -- FLAGS
    -- =====================================================
    is_active BOOLEAN DEFAULT TRUE,
    is_trackable BOOLEAN DEFAULT TRUE,
    requires_notification BOOLEAN DEFAULT FALSE,
    display_priority INTEGER DEFAULT 0,

    -- =====================================================
    -- AUDIT COLUMNS
    -- =====================================================
    etl_loaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- =====================================================
    -- CONSTRAINTS
    -- =====================================================
    CONSTRAINT dim_event_types_pkey PRIMARY KEY (event_type_key),
    CONSTRAINT dim_event_types_code_key UNIQUE (event_type_code),
    CONSTRAINT dim_event_types_xp_direction_check CHECK (xp_direction IS NULL OR xp_direction IN ('increase', 'decrease', 'none')),
    CONSTRAINT dim_event_types_coins_direction_check CHECK (coins_direction IS NULL OR coins_direction IN ('increase', 'decrease', 'none'))
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_dim_event_types_code ON data_warehouse.dim_event_types USING btree (event_type_code);
CREATE INDEX idx_dim_event_types_category ON data_warehouse.dim_event_types USING btree (category);
CREATE INDEX idx_dim_event_types_active ON data_warehouse.dim_event_types USING btree (is_active) WHERE is_active = TRUE;

-- =====================================================
-- SEED DATA: Standard Event Types
-- =====================================================
INSERT INTO data_warehouse.dim_event_types (
    event_type_code, event_type_name, event_type_name_es, description, category, subcategory,
    affects_xp, affects_coins, affects_rank, affects_level, affects_streak,
    xp_direction, coins_direction, requires_notification
) VALUES
-- Achievement Events
('ACHIEVEMENT_UNLOCKED', 'Achievement Unlocked', 'Logro Desbloqueado', 'Student unlocked a new achievement', 'achievement', 'unlock', TRUE, TRUE, FALSE, FALSE, FALSE, 'increase', 'increase', TRUE),
('ACHIEVEMENT_CLAIMED', 'Achievement Reward Claimed', 'Recompensa de Logro Reclamada', 'Student claimed achievement rewards', 'achievement', 'claim', FALSE, TRUE, FALSE, FALSE, FALSE, 'none', 'increase', FALSE),

-- Exercise Events
('EXERCISE_COMPLETED', 'Exercise Completed', 'Ejercicio Completado', 'Student completed an exercise', 'exercise', 'completion', TRUE, TRUE, FALSE, FALSE, FALSE, 'increase', 'increase', FALSE),
('EXERCISE_PERFECT', 'Perfect Score', 'Puntuacion Perfecta', 'Student achieved perfect score on exercise', 'exercise', 'perfect', TRUE, TRUE, FALSE, FALSE, FALSE, 'increase', 'increase', TRUE),
('EXERCISE_FAILED', 'Exercise Failed', 'Ejercicio Fallido', 'Student failed an exercise attempt', 'exercise', 'failure', FALSE, FALSE, FALSE, FALSE, FALSE, 'none', 'none', FALSE),

-- Module Events
('MODULE_STARTED', 'Module Started', 'Modulo Iniciado', 'Student started a new module', 'module', 'start', FALSE, FALSE, FALSE, FALSE, FALSE, 'none', 'none', FALSE),
('MODULE_COMPLETED', 'Module Completed', 'Modulo Completado', 'Student completed a module', 'module', 'completion', TRUE, TRUE, FALSE, FALSE, FALSE, 'increase', 'increase', TRUE),
('MODULE_MASTERED', 'Module Mastered', 'Modulo Dominado', 'Student mastered a module', 'module', 'mastery', TRUE, TRUE, FALSE, FALSE, FALSE, 'increase', 'increase', TRUE),

-- Rank Events
('RANK_PROMOTED', 'Rank Promoted', 'Rango Ascendido', 'Student promoted to higher Maya rank', 'rank', 'promotion', TRUE, TRUE, TRUE, FALSE, FALSE, 'increase', 'increase', TRUE),

-- Level Events
('LEVEL_UP', 'Level Up', 'Subir de Nivel', 'Student leveled up', 'level', 'increase', FALSE, FALSE, FALSE, TRUE, FALSE, 'none', 'none', TRUE),

-- Streak Events
('STREAK_CONTINUED', 'Streak Continued', 'Racha Continuada', 'Student continued daily streak', 'streak', 'continue', TRUE, TRUE, FALSE, FALSE, TRUE, 'increase', 'increase', FALSE),
('STREAK_LOST', 'Streak Lost', 'Racha Perdida', 'Student lost their streak', 'streak', 'lost', FALSE, FALSE, FALSE, FALSE, TRUE, 'none', 'none', FALSE),
('STREAK_MILESTONE', 'Streak Milestone', 'Hito de Racha', 'Student reached a streak milestone (7, 30, 100 days)', 'streak', 'milestone', TRUE, TRUE, FALSE, FALSE, TRUE, 'increase', 'increase', TRUE),

-- Coins Events
('COINS_EARNED', 'ML Coins Earned', 'ML Coins Ganados', 'Student earned ML coins', 'coins', 'earn', FALSE, TRUE, FALSE, FALSE, FALSE, 'none', 'increase', FALSE),
('COINS_SPENT', 'ML Coins Spent', 'ML Coins Gastados', 'Student spent ML coins', 'coins', 'spend', FALSE, TRUE, FALSE, FALSE, FALSE, 'none', 'decrease', FALSE),

-- Comodin (Power-up) Events
('COMODIN_USED', 'Comodin Used', 'Comodin Usado', 'Student used a power-up', 'comodin', 'use', FALSE, TRUE, FALSE, FALSE, FALSE, 'none', 'decrease', FALSE),
('COMODIN_PURCHASED', 'Comodin Purchased', 'Comodin Comprado', 'Student purchased a power-up', 'comodin', 'purchase', FALSE, TRUE, FALSE, FALSE, FALSE, 'none', 'decrease', FALSE),

-- Social Events
('CHALLENGE_WON', 'Challenge Won', 'Desafio Ganado', 'Student won a peer challenge', 'social', 'challenge', TRUE, TRUE, FALSE, FALSE, FALSE, 'increase', 'increase', TRUE),
('CHALLENGE_LOST', 'Challenge Lost', 'Desafio Perdido', 'Student lost a peer challenge', 'social', 'challenge', FALSE, FALSE, FALSE, FALSE, FALSE, 'none', 'none', FALSE),
('FRIENDSHIP_CREATED', 'Friendship Created', 'Amistad Creada', 'New friendship formed', 'social', 'friendship', FALSE, FALSE, FALSE, FALSE, FALSE, 'none', 'none', FALSE),

-- Login Events
('DAILY_LOGIN', 'Daily Login', 'Inicio de Sesion Diario', 'Student logged in for the day', 'login', 'daily', TRUE, TRUE, FALSE, FALSE, TRUE, 'increase', 'increase', FALSE);

-- =====================================================
-- OWNERSHIP AND PERMISSIONS
-- =====================================================
ALTER TABLE data_warehouse.dim_event_types OWNER TO gamilit_user;
GRANT SELECT, INSERT, UPDATE ON data_warehouse.dim_event_types TO gamilit_user;
GRANT USAGE ON SEQUENCE data_warehouse.dim_event_types_event_type_key_seq TO gamilit_user;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE data_warehouse.dim_event_types IS
'Event type dimension - Lookup table for gamification event classification.
Grain: One row per event type.
Pre-seeded with standard GAMILIT gamification events.
Categories: achievement, exercise, module, rank, level, streak, coins, comodin, social, login.';

COMMENT ON COLUMN data_warehouse.dim_event_types.event_type_key IS 'Surrogate key for fact table joins';
COMMENT ON COLUMN data_warehouse.dim_event_types.event_type_code IS 'Unique event type identifier';
COMMENT ON COLUMN data_warehouse.dim_event_types.affects_xp IS 'TRUE if this event type changes XP';
COMMENT ON COLUMN data_warehouse.dim_event_types.affects_coins IS 'TRUE if this event type changes ML Coins';
