-- =====================================================
-- Table: social_features.team_vs_team_challenges
-- Description: Team vs Team competitive challenges
-- Ticket: GAP-SOC-002
-- Created: 2026-02-03
-- =====================================================
-- Features:
-- - Supports team vs team challenges (guilds, classrooms, or ad-hoc groups)
-- - Flexible team composition (team_a_members / team_b_members)
-- - Multiple scoring methods (total_points, average, best_n)
-- - Challenge lifecycle management (pending -> accepted -> in_progress -> completed)
-- =====================================================

DROP TABLE IF EXISTS social_features.team_vs_team_challenges CASCADE;

CREATE TABLE social_features.team_vs_team_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Challenge Information
    title VARCHAR(200) NOT NULL,
    description TEXT,
    challenge_type VARCHAR(50) DEFAULT 'team_vs_team' CHECK (
        challenge_type IN ('team_vs_team', 'guild_war', 'classroom_battle', 'tournament_match')
    ),

    -- =====================================================
    -- Team A (Challenger)
    -- =====================================================
    team_a_type VARCHAR(50) NOT NULL CHECK (
        team_a_type IN ('guild', 'classroom', 'team', 'custom')
    ),
    team_a_id UUID,                                          -- Reference to guild/classroom/team if applicable
    team_a_name VARCHAR(100),                                -- Display name for the team
    team_a_members UUID[] NOT NULL,                          -- Array of profile IDs
    team_a_captain_id UUID NOT NULL,                         -- Team captain (creator or designated leader)

    -- =====================================================
    -- Team B (Challenged)
    -- =====================================================
    team_b_type VARCHAR(50) CHECK (
        team_b_type IN ('guild', 'classroom', 'team', 'custom')
    ),
    team_b_id UUID,                                          -- Reference to guild/classroom/team if applicable
    team_b_name VARCHAR(100),                                -- Display name for the team
    team_b_members UUID[],                                   -- Array of profile IDs (populated when accepted)
    team_b_captain_id UUID,                                  -- Team B captain (accepts the challenge)

    -- =====================================================
    -- Challenge Configuration
    -- =====================================================
    min_team_size INTEGER DEFAULT 2 CHECK (min_team_size >= 1 AND min_team_size <= 20),
    max_team_size INTEGER DEFAULT 5 CHECK (max_team_size >= 1 AND max_team_size <= 20),
    exercise_ids UUID[],                                     -- Array of exercise IDs for the challenge
    module_id UUID,                                          -- Optional: specific module for the challenge
    time_limit_minutes INTEGER CHECK (time_limit_minutes IS NULL OR time_limit_minutes > 0),

    -- =====================================================
    -- Scoring Configuration
    -- =====================================================
    scoring_method VARCHAR(50) DEFAULT 'total_points' CHECK (
        scoring_method IN ('total_points', 'average', 'best_n', 'time_based', 'accuracy')
    ),
    best_n_count INTEGER DEFAULT 3,                          -- Used when scoring_method = 'best_n'

    -- =====================================================
    -- Rewards Configuration
    -- =====================================================
    rewards JSONB DEFAULT '{
        "winner": {"xp": 500, "ml_coins": 100},
        "loser": {"xp": 100, "ml_coins": 20},
        "draw": {"xp": 250, "ml_coins": 50}
    }',

    -- =====================================================
    -- Challenge Status
    -- =====================================================
    status VARCHAR(50) DEFAULT 'pending' CHECK (
        status IN (
            'pending',        -- Waiting for Team B to accept
            'accepted',       -- Team B accepted, waiting to start
            'in_progress',    -- Challenge is active
            'completed',      -- Challenge finished normally
            'cancelled',      -- Cancelled by either team
            'expired',        -- Not accepted within time limit
            'declined'        -- Team B declined the challenge
        )
    ),

    -- =====================================================
    -- Results
    -- =====================================================
    winner_team VARCHAR(10) CHECK (winner_team IS NULL OR winner_team IN ('a', 'b', 'draw')),
    team_a_score INTEGER DEFAULT 0,
    team_b_score INTEGER DEFAULT 0,
    team_a_accuracy NUMERIC(5, 2),                           -- Percentage 0.00 - 100.00
    team_b_accuracy NUMERIC(5, 2),
    team_a_avg_time_seconds INTEGER,                         -- Average completion time
    team_b_avg_time_seconds INTEGER,

    -- =====================================================
    -- Detailed Results (per member)
    -- =====================================================
    results_detail JSONB DEFAULT '{}',                       -- Detailed per-member results

    -- =====================================================
    -- Metadata & Audit
    -- =====================================================
    created_by UUID NOT NULL,                                -- Profile that created the challenge
    invitation_expires_at TIMESTAMPTZ,                       -- When the invitation expires
    accepted_at TIMESTAMPTZ,                                 -- When Team B accepted
    starts_at TIMESTAMPTZ,                                   -- Scheduled start time
    ends_at TIMESTAMPTZ,                                     -- Scheduled end time
    completed_at TIMESTAMPTZ,                                -- Actual completion time
    created_at TIMESTAMPTZ DEFAULT gamilit.now_mexico(),
    updated_at TIMESTAMPTZ DEFAULT gamilit.now_mexico(),

    -- =====================================================
    -- Constraints
    -- =====================================================
    CONSTRAINT team_vs_team_challenges_min_max_size CHECK (min_team_size <= max_team_size),
    CONSTRAINT team_vs_team_challenges_team_a_members_not_empty CHECK (array_length(team_a_members, 1) >= 1),
    CONSTRAINT team_vs_team_challenges_dates_valid CHECK (
        (starts_at IS NULL AND ends_at IS NULL) OR
        (starts_at IS NOT NULL AND ends_at IS NOT NULL AND starts_at < ends_at)
    ),
    CONSTRAINT team_vs_team_challenges_title_length CHECK (char_length(title) >= 3)
);

-- =====================================================
-- Comentarios
-- =====================================================
COMMENT ON TABLE social_features.team_vs_team_challenges IS 'Desafios entre equipos (guilds, classrooms, o grupos ad-hoc). GAP-SOC-002.';
COMMENT ON COLUMN social_features.team_vs_team_challenges.id IS 'Identificador unico del desafio';
COMMENT ON COLUMN social_features.team_vs_team_challenges.title IS 'Titulo del desafio (minimo 3 caracteres)';
COMMENT ON COLUMN social_features.team_vs_team_challenges.description IS 'Descripcion detallada del desafio';
COMMENT ON COLUMN social_features.team_vs_team_challenges.challenge_type IS 'Tipo de desafio: team_vs_team, guild_war, classroom_battle, tournament_match';
COMMENT ON COLUMN social_features.team_vs_team_challenges.team_a_type IS 'Tipo de entidad del equipo A: guild, classroom, team, custom';
COMMENT ON COLUMN social_features.team_vs_team_challenges.team_a_id IS 'ID de referencia al guild/classroom/team (si aplica)';
COMMENT ON COLUMN social_features.team_vs_team_challenges.team_a_name IS 'Nombre de presentacion del equipo A';
COMMENT ON COLUMN social_features.team_vs_team_challenges.team_a_members IS 'Array de IDs de profiles que conforman el equipo A';
COMMENT ON COLUMN social_features.team_vs_team_challenges.team_a_captain_id IS 'ID del capitan del equipo A (toma decisiones)';
COMMENT ON COLUMN social_features.team_vs_team_challenges.team_b_type IS 'Tipo de entidad del equipo B: guild, classroom, team, custom';
COMMENT ON COLUMN social_features.team_vs_team_challenges.team_b_id IS 'ID de referencia al guild/classroom/team (si aplica)';
COMMENT ON COLUMN social_features.team_vs_team_challenges.team_b_name IS 'Nombre de presentacion del equipo B';
COMMENT ON COLUMN social_features.team_vs_team_challenges.team_b_members IS 'Array de IDs de profiles que conforman el equipo B';
COMMENT ON COLUMN social_features.team_vs_team_challenges.team_b_captain_id IS 'ID del capitan del equipo B (acepta o rechaza)';
COMMENT ON COLUMN social_features.team_vs_team_challenges.min_team_size IS 'Minimo de miembros requeridos por equipo (1-20)';
COMMENT ON COLUMN social_features.team_vs_team_challenges.max_team_size IS 'Maximo de miembros permitidos por equipo (1-20)';
COMMENT ON COLUMN social_features.team_vs_team_challenges.exercise_ids IS 'Array de IDs de ejercicios para el desafio';
COMMENT ON COLUMN social_features.team_vs_team_challenges.module_id IS 'ID del modulo especifico (opcional)';
COMMENT ON COLUMN social_features.team_vs_team_challenges.time_limit_minutes IS 'Limite de tiempo en minutos para completar el desafio';
COMMENT ON COLUMN social_features.team_vs_team_challenges.scoring_method IS 'Metodo de puntuacion: total_points, average, best_n, time_based, accuracy';
COMMENT ON COLUMN social_features.team_vs_team_challenges.best_n_count IS 'Numero de mejores puntuaciones a considerar (para best_n)';
COMMENT ON COLUMN social_features.team_vs_team_challenges.rewards IS 'Configuracion de recompensas JSONB para ganador/perdedor/empate';
COMMENT ON COLUMN social_features.team_vs_team_challenges.status IS 'Estado del desafio: pending, accepted, in_progress, completed, cancelled, expired, declined';
COMMENT ON COLUMN social_features.team_vs_team_challenges.winner_team IS 'Equipo ganador: a, b, o draw';
COMMENT ON COLUMN social_features.team_vs_team_challenges.team_a_score IS 'Puntuacion final del equipo A';
COMMENT ON COLUMN social_features.team_vs_team_challenges.team_b_score IS 'Puntuacion final del equipo B';
COMMENT ON COLUMN social_features.team_vs_team_challenges.team_a_accuracy IS 'Porcentaje de precision del equipo A (0-100)';
COMMENT ON COLUMN social_features.team_vs_team_challenges.team_b_accuracy IS 'Porcentaje de precision del equipo B (0-100)';
COMMENT ON COLUMN social_features.team_vs_team_challenges.results_detail IS 'Resultados detallados por miembro en formato JSONB';
COMMENT ON COLUMN social_features.team_vs_team_challenges.created_by IS 'ID del profile que creo el desafio';
COMMENT ON COLUMN social_features.team_vs_team_challenges.invitation_expires_at IS 'Fecha limite para aceptar la invitacion';
COMMENT ON COLUMN social_features.team_vs_team_challenges.accepted_at IS 'Fecha en que el equipo B acepto el desafio';
COMMENT ON COLUMN social_features.team_vs_team_challenges.starts_at IS 'Fecha programada de inicio';
COMMENT ON COLUMN social_features.team_vs_team_challenges.ends_at IS 'Fecha programada de finalizacion';
COMMENT ON COLUMN social_features.team_vs_team_challenges.completed_at IS 'Fecha real de finalizacion';

-- =====================================================
-- Indices
-- =====================================================

-- Status index for filtering active challenges
CREATE INDEX idx_team_vs_team_challenges_status
    ON social_features.team_vs_team_challenges(status);

-- Partial index for active challenges
CREATE INDEX idx_team_vs_team_challenges_active
    ON social_features.team_vs_team_challenges(status, created_at DESC)
    WHERE status IN ('pending', 'accepted', 'in_progress');

-- Team captains indexes (for finding challenges by captain)
CREATE INDEX idx_team_vs_team_challenges_team_a_captain
    ON social_features.team_vs_team_challenges(team_a_captain_id);

CREATE INDEX idx_team_vs_team_challenges_team_b_captain
    ON social_features.team_vs_team_challenges(team_b_captain_id);

-- Creator index
CREATE INDEX idx_team_vs_team_challenges_created_by
    ON social_features.team_vs_team_challenges(created_by);

-- Team reference indexes (when using guilds/classrooms/teams)
CREATE INDEX idx_team_vs_team_challenges_team_a_id
    ON social_features.team_vs_team_challenges(team_a_id)
    WHERE team_a_id IS NOT NULL;

CREATE INDEX idx_team_vs_team_challenges_team_b_id
    ON social_features.team_vs_team_challenges(team_b_id)
    WHERE team_b_id IS NOT NULL;

-- Time-based indexes for scheduling
CREATE INDEX idx_team_vs_team_challenges_starts_at
    ON social_features.team_vs_team_challenges(starts_at)
    WHERE starts_at IS NOT NULL;

CREATE INDEX idx_team_vs_team_challenges_invitation_expires
    ON social_features.team_vs_team_challenges(invitation_expires_at)
    WHERE status = 'pending';

-- GIN indexes for array searches (find challenges by member)
CREATE INDEX idx_team_vs_team_challenges_team_a_members
    ON social_features.team_vs_team_challenges USING GIN(team_a_members);

CREATE INDEX idx_team_vs_team_challenges_team_b_members
    ON social_features.team_vs_team_challenges USING GIN(team_b_members);

-- GIN index for exercise_ids
CREATE INDEX idx_team_vs_team_challenges_exercise_ids
    ON social_features.team_vs_team_challenges USING GIN(exercise_ids);

-- Composite index for leaderboard queries
CREATE INDEX idx_team_vs_team_challenges_completed_winner
    ON social_features.team_vs_team_challenges(completed_at DESC, winner_team)
    WHERE status = 'completed';

-- =====================================================
-- Foreign Keys
-- =====================================================

-- Team A Captain
ALTER TABLE social_features.team_vs_team_challenges
    ADD CONSTRAINT team_vs_team_challenges_team_a_captain_fkey
    FOREIGN KEY (team_a_captain_id) REFERENCES auth_management.profiles(id) ON DELETE RESTRICT;

-- Team B Captain (nullable)
ALTER TABLE social_features.team_vs_team_challenges
    ADD CONSTRAINT team_vs_team_challenges_team_b_captain_fkey
    FOREIGN KEY (team_b_captain_id) REFERENCES auth_management.profiles(id) ON DELETE RESTRICT;

-- Created By
ALTER TABLE social_features.team_vs_team_challenges
    ADD CONSTRAINT team_vs_team_challenges_created_by_fkey
    FOREIGN KEY (created_by) REFERENCES auth_management.profiles(id) ON DELETE RESTRICT;

-- Module reference (optional)
ALTER TABLE social_features.team_vs_team_challenges
    ADD CONSTRAINT team_vs_team_challenges_module_fkey
    FOREIGN KEY (module_id) REFERENCES educational_content.modules(id) ON DELETE SET NULL;

-- =====================================================
-- Trigger para updated_at
-- =====================================================
CREATE TRIGGER trg_team_vs_team_challenges_updated_at
    BEFORE UPDATE ON social_features.team_vs_team_challenges
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

COMMENT ON TRIGGER trg_team_vs_team_challenges_updated_at ON social_features.team_vs_team_challenges IS
    'Actualiza updated_at automaticamente en cada UPDATE';

-- =====================================================
-- Row Level Security
-- =====================================================
ALTER TABLE social_features.team_vs_team_challenges ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Permisos
-- =====================================================
ALTER TABLE social_features.team_vs_team_challenges OWNER TO gamilit_user;
GRANT ALL ON TABLE social_features.team_vs_team_challenges TO gamilit_user;
