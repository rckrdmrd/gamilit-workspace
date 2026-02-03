-- =====================================================
-- Table: data_warehouse.fact_gamification_events
-- Description: Gamification event tracking (achievements, ranks, rewards)
-- Type: Fact (Transaction Grain)
-- Grain: One row per gamification event
-- Sources: gamification_system.*, ml_coins_transactions, user_achievements
-- Created: 2026-02-03
-- Sprint: 2.1 - Data Warehouse Design
-- =====================================================

SET search_path TO data_warehouse, public;

DROP TABLE IF EXISTS data_warehouse.fact_gamification_events CASCADE;

CREATE TABLE data_warehouse.fact_gamification_events (
    -- =====================================================
    -- SURROGATE KEY
    -- =====================================================
    event_key BIGSERIAL NOT NULL,

    -- =====================================================
    -- DIMENSION KEYS (Foreign Keys to Dimensions)
    -- =====================================================
    date_key INTEGER NOT NULL,           -- FK to dim_date
    time_key INTEGER NOT NULL,           -- FK to dim_time
    student_key BIGINT NOT NULL,         -- FK to dim_student
    event_type_key INTEGER NOT NULL,     -- FK to dim_event_type

    -- =====================================================
    -- OPTIONAL DIMENSION KEYS (May be NULL depending on event type)
    -- =====================================================
    achievement_key BIGINT,              -- FK to dim_achievement (for achievement events)
    exercise_key BIGINT,                 -- FK to dim_exercise (for exercise-related events)
    module_key BIGINT,                   -- FK to dim_module (for module-related events)

    -- =====================================================
    -- DEGENERATE DIMENSIONS
    -- =====================================================
    source_event_id UUID,                -- ID from source table
    source_table TEXT,                   -- Origin table name
    rank_from TEXT,                      -- Previous Maya rank (for rank changes)
    rank_to TEXT,                        -- New Maya rank (for rank changes)
    level_from INTEGER,                  -- Previous level (for level up events)
    level_to INTEGER,                    -- New level (for level up events)
    challenge_id UUID,                   -- For challenge events
    challenge_opponent_id UUID,          -- Opponent for challenge events

    -- =====================================================
    -- MEASURES - CURRENCY CHANGES
    -- =====================================================
    xp_change INTEGER DEFAULT 0,         -- Can be positive or negative
    ml_coins_change INTEGER DEFAULT 0,   -- Can be positive or negative
    points_change INTEGER DEFAULT 0,     -- Achievement points

    -- =====================================================
    -- MEASURES - CONTEXT
    -- =====================================================
    streak_days INTEGER,                 -- Current streak at time of event
    current_xp INTEGER,                  -- Total XP after this event
    current_ml_coins INTEGER,            -- Total coins after this event
    current_level INTEGER,               -- Level after this event

    -- =====================================================
    -- ACHIEVEMENT DETAILS (For achievement events)
    -- =====================================================
    achievement_name TEXT,
    achievement_category TEXT,
    achievement_rarity TEXT,

    -- =====================================================
    -- EVENT METADATA
    -- =====================================================
    event_description TEXT,
    trigger_source TEXT,                 -- What triggered this event (exercise, daily_login, etc.)
    related_entity_id UUID,              -- ID of related entity
    related_entity_type TEXT,            -- Type of related entity

    -- =====================================================
    -- AUDIT COLUMNS
    -- =====================================================
    event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    etl_loaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    etl_batch_id TEXT,

    -- =====================================================
    -- CONSTRAINTS
    -- =====================================================
    CONSTRAINT fact_gamification_events_pkey PRIMARY KEY (event_key),
    CONSTRAINT fact_gamification_events_source_key UNIQUE (source_table, source_event_id)
);

-- =====================================================
-- DIMENSION FOREIGN KEY CONSTRAINTS
-- =====================================================
ALTER TABLE data_warehouse.fact_gamification_events
    ADD CONSTRAINT fk_fact_gam_event_date FOREIGN KEY (date_key)
    REFERENCES data_warehouse.dim_date(date_key);

ALTER TABLE data_warehouse.fact_gamification_events
    ADD CONSTRAINT fk_fact_gam_event_time FOREIGN KEY (time_key)
    REFERENCES data_warehouse.dim_time(time_key);

ALTER TABLE data_warehouse.fact_gamification_events
    ADD CONSTRAINT fk_fact_gam_event_student FOREIGN KEY (student_key)
    REFERENCES data_warehouse.dim_student(student_key);

ALTER TABLE data_warehouse.fact_gamification_events
    ADD CONSTRAINT fk_fact_gam_event_type FOREIGN KEY (event_type_key)
    REFERENCES data_warehouse.dim_event_type(event_type_key);

ALTER TABLE data_warehouse.fact_gamification_events
    ADD CONSTRAINT fk_fact_gam_event_achievement FOREIGN KEY (achievement_key)
    REFERENCES data_warehouse.dim_achievement(achievement_key);

ALTER TABLE data_warehouse.fact_gamification_events
    ADD CONSTRAINT fk_fact_gam_event_exercise FOREIGN KEY (exercise_key)
    REFERENCES data_warehouse.dim_exercise(exercise_key);

ALTER TABLE data_warehouse.fact_gamification_events
    ADD CONSTRAINT fk_fact_gam_event_module FOREIGN KEY (module_key)
    REFERENCES data_warehouse.dim_module(module_key);

-- =====================================================
-- INDEXES
-- =====================================================
-- Primary dimension lookups
CREATE INDEX idx_fact_gam_event_date ON data_warehouse.fact_gamification_events USING btree (date_key);
CREATE INDEX idx_fact_gam_event_student ON data_warehouse.fact_gamification_events USING btree (student_key);
CREATE INDEX idx_fact_gam_event_type ON data_warehouse.fact_gamification_events USING btree (event_type_key);

-- Optional dimension lookups
CREATE INDEX idx_fact_gam_event_achievement ON data_warehouse.fact_gamification_events USING btree (achievement_key) WHERE achievement_key IS NOT NULL;
CREATE INDEX idx_fact_gam_event_exercise ON data_warehouse.fact_gamification_events USING btree (exercise_key) WHERE exercise_key IS NOT NULL;
CREATE INDEX idx_fact_gam_event_module ON data_warehouse.fact_gamification_events USING btree (module_key) WHERE module_key IS NOT NULL;

-- Common query patterns
CREATE INDEX idx_fact_gam_event_date_student ON data_warehouse.fact_gamification_events USING btree (date_key, student_key);
CREATE INDEX idx_fact_gam_event_student_type ON data_warehouse.fact_gamification_events USING btree (student_key, event_type_key);
CREATE INDEX idx_fact_gam_event_date_range ON data_warehouse.fact_gamification_events USING btree (date_key DESC);
CREATE INDEX idx_fact_gam_event_timestamp ON data_warehouse.fact_gamification_events USING btree (event_timestamp DESC);

-- Rank analysis
CREATE INDEX idx_fact_gam_event_rank_changes ON data_warehouse.fact_gamification_events USING btree (rank_to) WHERE rank_to IS NOT NULL;

-- Currency analysis
CREATE INDEX idx_fact_gam_event_xp_positive ON data_warehouse.fact_gamification_events USING btree (xp_change) WHERE xp_change > 0;
CREATE INDEX idx_fact_gam_event_coins_positive ON data_warehouse.fact_gamification_events USING btree (ml_coins_change) WHERE ml_coins_change > 0;

-- ETL tracking
CREATE INDEX idx_fact_gam_event_etl_batch ON data_warehouse.fact_gamification_events USING btree (etl_batch_id);
CREATE INDEX idx_fact_gam_event_source ON data_warehouse.fact_gamification_events USING btree (source_table, source_event_id);

-- =====================================================
-- OWNERSHIP AND PERMISSIONS
-- =====================================================
ALTER TABLE data_warehouse.fact_gamification_events OWNER TO gamilit_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON data_warehouse.fact_gamification_events TO gamilit_user;
GRANT USAGE ON SEQUENCE data_warehouse.fact_gamification_events_event_key_seq TO gamilit_user;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE data_warehouse.fact_gamification_events IS
'Gamification events fact table - Transaction grain.
Grain: One row per gamification event.
Event types: achievement unlocks, rank promotions, level ups, coin transactions, etc.
Sources: user_achievements, ml_coins_transactions, user_stats changes.
Use for gamification analytics, engagement analysis, reward tracking.';

COMMENT ON COLUMN data_warehouse.fact_gamification_events.event_key IS 'Surrogate key for the fact record';
COMMENT ON COLUMN data_warehouse.fact_gamification_events.xp_change IS 'XP delta - positive for earned, negative for spent';
COMMENT ON COLUMN data_warehouse.fact_gamification_events.ml_coins_change IS 'Coins delta - positive for earned, negative for spent';
COMMENT ON COLUMN data_warehouse.fact_gamification_events.rank_from IS 'Maya rank before this event (for rank changes)';
COMMENT ON COLUMN data_warehouse.fact_gamification_events.rank_to IS 'Maya rank after this event (for rank changes)';
COMMENT ON COLUMN data_warehouse.fact_gamification_events.trigger_source IS 'What action triggered this event';
