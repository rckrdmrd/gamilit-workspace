-- ============================================
-- Dimension Event Type Seed Data
-- ============================================
-- Schema: data_warehouse
-- Purpose: Pre-populate event type dimension for gamification events
-- Created: 2026-02-03 (Sprint 2.4 - ETL Pipeline Load)
-- ============================================

-- Ensure schema exists
CREATE SCHEMA IF NOT EXISTS data_warehouse;

-- Create dim_event_type table if not exists
CREATE TABLE IF NOT EXISTS data_warehouse.dim_event_type (
    event_type_key SERIAL PRIMARY KEY,
    event_type_code VARCHAR(50) NOT NULL UNIQUE,
    event_type_name VARCHAR(100) NOT NULL,
    event_category VARCHAR(50) NOT NULL,
    event_description TEXT,
    is_positive BOOLEAN NOT NULL DEFAULT TRUE,
    affects_xp BOOLEAN NOT NULL DEFAULT FALSE,
    affects_coins BOOLEAN NOT NULL DEFAULT FALSE,
    affects_rank BOOLEAN NOT NULL DEFAULT FALSE,
    affects_achievements BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create index on event_type_code
CREATE INDEX IF NOT EXISTS idx_dim_event_type_code
    ON data_warehouse.dim_event_type(event_type_code);
CREATE INDEX IF NOT EXISTS idx_dim_event_type_category
    ON data_warehouse.dim_event_type(event_category);

-- Insert event types
INSERT INTO data_warehouse.dim_event_type (
    event_type_code,
    event_type_name,
    event_category,
    event_description,
    is_positive,
    affects_xp,
    affects_coins,
    affects_rank,
    affects_achievements,
    display_order
) VALUES
    -- XP Events
    ('xp_earned', 'XP Earned', 'experience', 'Experience points earned from activities', TRUE, TRUE, FALSE, FALSE, FALSE, 1),
    ('xp_bonus', 'XP Bonus', 'experience', 'Bonus XP from special events or multipliers', TRUE, TRUE, FALSE, FALSE, FALSE, 2),
    ('xp_streak_bonus', 'Streak XP Bonus', 'experience', 'Bonus XP for maintaining daily streak', TRUE, TRUE, FALSE, FALSE, FALSE, 3),

    -- Coin Events
    ('coins_earned', 'Coins Earned', 'economy', 'ML Coins earned from activities', TRUE, FALSE, TRUE, FALSE, FALSE, 10),
    ('coins_spent', 'Coins Spent', 'economy', 'ML Coins spent on shop items or comodines', FALSE, FALSE, TRUE, FALSE, FALSE, 11),
    ('coins_bonus', 'Coins Bonus', 'economy', 'Bonus coins from special events', TRUE, FALSE, TRUE, FALSE, FALSE, 12),

    -- Achievement Events
    ('achievement_unlocked', 'Achievement Unlocked', 'achievement', 'A new achievement was unlocked', TRUE, TRUE, TRUE, FALSE, TRUE, 20),
    ('achievement_progress', 'Achievement Progress', 'achievement', 'Progress made towards an achievement', TRUE, FALSE, FALSE, FALSE, TRUE, 21),

    -- Level Events
    ('level_up', 'Level Up', 'progression', 'User leveled up', TRUE, FALSE, FALSE, TRUE, FALSE, 30),
    ('rank_promotion', 'Rank Promotion', 'progression', 'User promoted to a new Maya rank', TRUE, FALSE, FALSE, TRUE, FALSE, 31),

    -- Streak Events
    ('streak_milestone', 'Streak Milestone', 'streak', 'Reached a streak milestone (7, 14, 30 days)', TRUE, TRUE, TRUE, FALSE, TRUE, 40),
    ('streak_broken', 'Streak Broken', 'streak', 'Daily streak was broken', FALSE, FALSE, FALSE, FALSE, FALSE, 41),
    ('streak_extended', 'Streak Extended', 'streak', 'Daily streak continued', TRUE, FALSE, FALSE, FALSE, FALSE, 42),

    -- Mission Events
    ('mission_started', 'Mission Started', 'mission', 'User started a mission', TRUE, FALSE, FALSE, FALSE, FALSE, 50),
    ('mission_completed', 'Mission Completed', 'mission', 'User completed a mission', TRUE, TRUE, TRUE, FALSE, TRUE, 51),
    ('mission_failed', 'Mission Failed', 'mission', 'Mission expired without completion', FALSE, FALSE, FALSE, FALSE, FALSE, 52),

    -- Comodin Events
    ('comodin_purchased', 'Comodin Purchased', 'comodin', 'User purchased a comodin', FALSE, FALSE, TRUE, FALSE, FALSE, 60),
    ('comodin_used', 'Comodin Used', 'comodin', 'User used a comodin in an exercise', TRUE, FALSE, FALSE, FALSE, FALSE, 61),

    -- Shop Events
    ('shop_purchase', 'Shop Purchase', 'shop', 'User purchased an item from the shop', FALSE, FALSE, TRUE, FALSE, FALSE, 70),
    ('shop_item_equipped', 'Item Equipped', 'shop', 'User equipped a purchased item', TRUE, FALSE, FALSE, FALSE, FALSE, 71),

    -- Leaderboard Events
    ('leaderboard_change', 'Leaderboard Change', 'leaderboard', 'User position changed on leaderboard', TRUE, FALSE, FALSE, FALSE, FALSE, 80),
    ('leaderboard_top_10', 'Top 10 Achieved', 'leaderboard', 'User entered top 10 on leaderboard', TRUE, FALSE, FALSE, FALSE, TRUE, 81),
    ('leaderboard_first', 'First Place', 'leaderboard', 'User achieved first place', TRUE, TRUE, TRUE, FALSE, TRUE, 82),

    -- Exercise Events
    ('exercise_completed', 'Exercise Completed', 'exercise', 'User completed an exercise', TRUE, TRUE, TRUE, FALSE, FALSE, 90),
    ('exercise_perfect', 'Perfect Score', 'exercise', 'User got perfect score on exercise', TRUE, TRUE, TRUE, FALSE, TRUE, 91),
    ('module_completed', 'Module Completed', 'exercise', 'User completed a module', TRUE, TRUE, TRUE, FALSE, TRUE, 92)

ON CONFLICT (event_type_code) DO UPDATE SET
    event_type_name = EXCLUDED.event_type_name,
    event_category = EXCLUDED.event_category,
    event_description = EXCLUDED.event_description,
    is_positive = EXCLUDED.is_positive,
    affects_xp = EXCLUDED.affects_xp,
    affects_coins = EXCLUDED.affects_coins,
    affects_rank = EXCLUDED.affects_rank,
    affects_achievements = EXCLUDED.affects_achievements,
    display_order = EXCLUDED.display_order,
    updated_at = NOW();

-- Comments
COMMENT ON TABLE data_warehouse.dim_event_type IS
    'Event type dimension for categorizing gamification events';

COMMENT ON COLUMN data_warehouse.dim_event_type.event_type_key IS
    'Surrogate key for the event type';
COMMENT ON COLUMN data_warehouse.dim_event_type.event_type_code IS
    'Business key - unique code for the event type';
COMMENT ON COLUMN data_warehouse.dim_event_type.event_category IS
    'Category grouping: experience, economy, achievement, progression, streak, mission, comodin, shop, leaderboard, exercise';
COMMENT ON COLUMN data_warehouse.dim_event_type.is_positive IS
    'Whether this event type is generally positive for the user';
COMMENT ON COLUMN data_warehouse.dim_event_type.affects_xp IS
    'Whether this event type can affect user XP';
COMMENT ON COLUMN data_warehouse.dim_event_type.affects_coins IS
    'Whether this event type can affect user coin balance';
COMMENT ON COLUMN data_warehouse.dim_event_type.affects_rank IS
    'Whether this event type can affect user rank';
COMMENT ON COLUMN data_warehouse.dim_event_type.affects_achievements IS
    'Whether this event type can affect achievements';

-- Grant permissions
GRANT SELECT ON data_warehouse.dim_event_type TO gamilit_user;
GRANT USAGE ON SEQUENCE data_warehouse.dim_event_type_event_type_key_seq TO gamilit_user;

-- Verify row count
DO $$
DECLARE
    row_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO row_count FROM data_warehouse.dim_event_type;
    RAISE NOTICE 'dim_event_type populated with % rows', row_count;
END $$;
