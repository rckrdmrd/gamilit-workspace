-- =====================================================================================
-- Tabla: user_skill_ratings
-- Descripcion: Skill ratings ELO-based para usuarios en peer challenges
-- Documentacion: docs/03-fase-extensiones/EXT-009-peer-challenges/
-- Especificacion: ET-PEER-001-matchmaking.md - Skill Rating System
-- Epic: EXT-009
-- Created: 2026-02-03
-- =====================================================================================

-- =====================================================================================
-- DEPENDENCIES
-- =====================================================================================
-- Requires:
--   - auth_management.profiles (user_id FK)
--   - gamilit.update_updated_at_column() function
--   - gamilit.get_current_user_id() function (for RLS)
--   - gamilit.is_admin() function (for RLS)

-- =====================================================================================
-- TABLE DEFINITION
-- =====================================================================================

CREATE TABLE IF NOT EXISTS social_features.user_skill_ratings (
    -- =====================================================
    -- PRIMARY KEYS & IDENTIFIERS
    -- =====================================================
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- User relationship (1:1 per user)
    user_id UUID NOT NULL REFERENCES auth_management.profiles(id) ON DELETE CASCADE,

    -- =====================================================
    -- ELO RATING SYSTEM
    -- =====================================================
    -- Rating ELO actual del usuario (standard starting: 1200)
    rating INTEGER DEFAULT 1200 NOT NULL,

    -- Historical rating bounds
    peak_rating INTEGER DEFAULT 1200 NOT NULL,      -- Maximo historico
    lowest_rating INTEGER DEFAULT 1200 NOT NULL,    -- Minimo historico

    -- =====================================================
    -- GAME STATISTICS
    -- =====================================================
    games_played INTEGER DEFAULT 0 NOT NULL,
    wins INTEGER DEFAULT 0 NOT NULL,
    losses INTEGER DEFAULT 0 NOT NULL,
    draws INTEGER DEFAULT 0 NOT NULL,

    -- =====================================================
    -- STREAK TRACKING
    -- =====================================================
    -- Positivo = victorias consecutivas, Negativo = derrotas consecutivas
    current_streak INTEGER DEFAULT 0 NOT NULL,
    best_streak INTEGER DEFAULT 0 NOT NULL,          -- Mejor racha victorias historica

    -- =====================================================
    -- RATING HISTORY
    -- =====================================================
    -- Ultimos 10 cambios de rating (FIFO)
    -- Format: [{rating, change, challengeId, opponentId, result, date}]
    rating_history JSONB DEFAULT '[]'::jsonb NOT NULL,

    -- =====================================================
    -- METADATA & AUDIT
    -- =====================================================
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    -- =====================================================
    -- CONSTRAINTS
    -- =====================================================
    -- Unique constraint: one rating record per user
    CONSTRAINT user_skill_ratings_user_id_key UNIQUE (user_id),

    -- Rating bounds (ELO typically ranges 0-3000+)
    CONSTRAINT user_skill_ratings_rating_check CHECK (rating >= 0),
    CONSTRAINT user_skill_ratings_peak_rating_check CHECK (peak_rating >= 0),
    CONSTRAINT user_skill_ratings_lowest_rating_check CHECK (lowest_rating >= 0),
    CONSTRAINT user_skill_ratings_peak_gte_current CHECK (peak_rating >= rating),
    CONSTRAINT user_skill_ratings_current_gte_lowest CHECK (rating >= lowest_rating),

    -- Game statistics non-negative
    CONSTRAINT user_skill_ratings_games_played_check CHECK (games_played >= 0),
    CONSTRAINT user_skill_ratings_wins_check CHECK (wins >= 0),
    CONSTRAINT user_skill_ratings_losses_check CHECK (losses >= 0),
    CONSTRAINT user_skill_ratings_draws_check CHECK (draws >= 0),

    -- Games sum validation
    CONSTRAINT user_skill_ratings_games_sum_check CHECK (
        wins + losses + draws <= games_played
    ),

    -- Streak constraints
    CONSTRAINT user_skill_ratings_best_streak_check CHECK (best_streak >= 0)
);

-- =====================================================================================
-- INDEXES
-- =====================================================================================

-- User lookup (unique index from constraint, but explicit for documentation)
CREATE INDEX IF NOT EXISTS idx_user_skill_ratings_user_id
    ON social_features.user_skill_ratings USING btree (user_id);

-- Leaderboard queries by rating (descending for top players)
CREATE INDEX IF NOT EXISTS idx_user_skill_ratings_rating
    ON social_features.user_skill_ratings USING btree (rating DESC);

-- Matchmaking queries - find players by rating range
CREATE INDEX IF NOT EXISTS idx_user_skill_ratings_rating_range
    ON social_features.user_skill_ratings USING btree (rating)
    WHERE games_played >= 5;  -- Only for players with enough games

-- Experience-based queries
CREATE INDEX IF NOT EXISTS idx_user_skill_ratings_games_played
    ON social_features.user_skill_ratings USING btree (games_played DESC);

-- Win rate leaderboards (partial index for active players)
CREATE INDEX IF NOT EXISTS idx_user_skill_ratings_active_players
    ON social_features.user_skill_ratings USING btree (wins DESC, games_played DESC)
    WHERE games_played >= 10;

-- GIN index for JSONB metadata search
CREATE INDEX IF NOT EXISTS idx_user_skill_ratings_metadata
    ON social_features.user_skill_ratings USING GIN (metadata);

-- GIN index for rating history queries
CREATE INDEX IF NOT EXISTS idx_user_skill_ratings_history
    ON social_features.user_skill_ratings USING GIN (rating_history);

-- =====================================================================================
-- TRIGGERS
-- =====================================================================================

-- Trigger for automatic updated_at timestamp
CREATE TRIGGER trg_user_skill_ratings_updated_at
    BEFORE UPDATE ON social_features.user_skill_ratings
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

-- =====================================================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================================================

-- Enable RLS
ALTER TABLE social_features.user_skill_ratings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own skill rating
CREATE POLICY user_skill_ratings_select_own
    ON social_features.user_skill_ratings
    FOR SELECT
    USING (user_id = gamilit.get_current_user_id());

-- Policy: Users can view all ratings (for leaderboards/matchmaking)
-- This is a public read for competitive features
CREATE POLICY user_skill_ratings_select_public
    ON social_features.user_skill_ratings
    FOR SELECT
    USING (true);

-- Policy: Admins can view all ratings
CREATE POLICY user_skill_ratings_select_admin
    ON social_features.user_skill_ratings
    FOR SELECT
    USING (gamilit.is_admin());

-- Policy: System can insert/update all ratings (for game completion triggers)
CREATE POLICY user_skill_ratings_insert_system
    ON social_features.user_skill_ratings
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY user_skill_ratings_update_system
    ON social_features.user_skill_ratings
    FOR UPDATE
    USING (true);

-- Policy: Admins can delete ratings (for data cleanup)
CREATE POLICY user_skill_ratings_delete_admin
    ON social_features.user_skill_ratings
    FOR DELETE
    USING (gamilit.is_admin());

-- =====================================================================================
-- GRANTS
-- =====================================================================================

GRANT ALL ON TABLE social_features.user_skill_ratings TO gamilit_user;

-- =====================================================================================
-- COMMENTS
-- =====================================================================================

COMMENT ON TABLE social_features.user_skill_ratings IS
    'Skill ratings ELO-based para usuarios en peer challenges. Sistema de matchmaking. Epic EXT-009.';

COMMENT ON COLUMN social_features.user_skill_ratings.id IS
    'Identificador unico del registro (UUID)';

COMMENT ON COLUMN social_features.user_skill_ratings.user_id IS
    'ID del usuario (FK a auth_management.profiles) - 1:1 relationship';

COMMENT ON COLUMN social_features.user_skill_ratings.rating IS
    'Rating ELO actual del usuario (default 1200 - standard ELO starting)';

COMMENT ON COLUMN social_features.user_skill_ratings.peak_rating IS
    'Rating maximo alcanzado historicamente';

COMMENT ON COLUMN social_features.user_skill_ratings.lowest_rating IS
    'Rating minimo alcanzado historicamente';

COMMENT ON COLUMN social_features.user_skill_ratings.games_played IS
    'Numero total de partidas jugadas (para K-Factor dinamico)';

COMMENT ON COLUMN social_features.user_skill_ratings.wins IS
    'Numero total de victorias';

COMMENT ON COLUMN social_features.user_skill_ratings.losses IS
    'Numero total de derrotas';

COMMENT ON COLUMN social_features.user_skill_ratings.draws IS
    'Numero total de empates';

COMMENT ON COLUMN social_features.user_skill_ratings.current_streak IS
    'Racha actual: positivo = victorias consecutivas, negativo = derrotas consecutivas';

COMMENT ON COLUMN social_features.user_skill_ratings.best_streak IS
    'Mejor racha de victorias historica';

COMMENT ON COLUMN social_features.user_skill_ratings.rating_history IS
    'Ultimos 10 cambios de rating (JSONB array: {rating, change, challengeId, opponentId, result, date})';

COMMENT ON COLUMN social_features.user_skill_ratings.metadata IS
    'Metadatos adicionales (preferences, K-Factor adjustments, etc.)';

-- =====================================================================================
-- NOTES
-- =====================================================================================
-- ELO K-Factor Recommendations (to be implemented in backend):
--   - New players (games < 10): K = 40 (rapid adjustment)
--   - Intermediate (10-30 games): K = 20 (moderate adjustment)
--   - Experienced (30+ games): K = 10 (stable rating)
--
-- Rating History Structure:
--   [{
--     "rating": 1250,
--     "change": 25,
--     "challengeId": "uuid",
--     "opponentId": "uuid",
--     "result": "win" | "loss" | "draw",
--     "date": "2026-02-03T12:00:00Z"
--   }]
--
-- Entity: apps/backend/src/modules/gamification/peer-challenges/entities/user-skill-rating.entity.ts
-- =====================================================================================
