-- =====================================================
-- TABLE: leaderboard_metadatas
-- SCHEMA: gamification_system
-- DESCRIPTION: Tracks refresh status and statistics for materialized leaderboard views
-- =====================================================

DROP TABLE IF EXISTS gamification_system.leaderboard_metadatas CASCADE;

CREATE TABLE gamification_system.leaderboard_metadatas (
    view_name text NOT NULL,
    last_refresh_at timestamp with time zone DEFAULT gamilit.now_mexico(),
    total_users integer,
    refresh_duration_ms integer,
    created_at timestamp with time zone DEFAULT gamilit.now_mexico()
);

-- =====================================================
-- CONSTRAINTS
-- =====================================================

ALTER TABLE gamification_system.leaderboard_metadatas
    ADD CONSTRAINT leaderboard_metadatas_pkey PRIMARY KEY (view_name);

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE gamification_system.leaderboard_metadatas IS 'Tracks refresh status and statistics for materialized leaderboard views';
