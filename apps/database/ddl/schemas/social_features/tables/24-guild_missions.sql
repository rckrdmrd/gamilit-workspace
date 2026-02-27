-- =====================================================
-- Table: social_features.guild_missions
-- Description: Misiones colaborativas para gremios
-- Ticket: DB-GAM-014
-- Created: 2026-02-03
-- =====================================================

-- Tipos de mision
DROP TYPE IF EXISTS social_features.guild_mission_type CASCADE;
CREATE TYPE social_features.guild_mission_type AS ENUM (
    'exercises_completed',
    'total_score',
    'streak_days',
    'perfect_scores',
    'subjects_completed',
    'time_spent'
);

DROP TABLE IF EXISTS social_features.guild_missions CASCADE;

CREATE TABLE social_features.guild_missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id UUID NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    mission_type social_features.guild_mission_type NOT NULL,
    target_value INTEGER NOT NULL CHECK (target_value > 0),
    current_value INTEGER DEFAULT 0 CHECK (current_value >= 0),
    reward_xp INTEGER DEFAULT 100 CHECK (reward_xp > 0),
    reward_coins INTEGER DEFAULT 50 CHECK (reward_coins >= 0),
    difficulty VARCHAR(20) DEFAULT 'normal',
    status VARCHAR(20) DEFAULT 'active',
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),
    expires_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),

    -- Validaciones
    CONSTRAINT guild_missions_difficulty_check CHECK (
        difficulty IN ('easy', 'normal', 'hard', 'epic')
    ),
    CONSTRAINT guild_missions_status_check CHECK (
        status IN ('active', 'completed', 'expired', 'cancelled')
    ),
    CONSTRAINT guild_missions_expiry_check CHECK (
        expires_at IS NULL OR expires_at > starts_at
    )
);

-- Comentarios
COMMENT ON TABLE social_features.guild_missions IS 'Misiones colaborativas que los miembros del gremio completan juntos';
COMMENT ON COLUMN social_features.guild_missions.id IS 'ID unico de la mision';
COMMENT ON COLUMN social_features.guild_missions.guild_id IS 'ID del gremio propietario de la mision';
COMMENT ON COLUMN social_features.guild_missions.title IS 'Titulo de la mision';
COMMENT ON COLUMN social_features.guild_missions.description IS 'Descripcion detallada de la mision';
COMMENT ON COLUMN social_features.guild_missions.mission_type IS 'Tipo de objetivo: exercises_completed, total_score, etc.';
COMMENT ON COLUMN social_features.guild_missions.target_value IS 'Valor objetivo a alcanzar';
COMMENT ON COLUMN social_features.guild_missions.current_value IS 'Progreso actual';
COMMENT ON COLUMN social_features.guild_missions.reward_xp IS 'XP otorgado al gremio al completar';
COMMENT ON COLUMN social_features.guild_missions.reward_coins IS 'ML Coins bonus para cada miembro';
COMMENT ON COLUMN social_features.guild_missions.difficulty IS 'Dificultad: easy, normal, hard, epic';
COMMENT ON COLUMN social_features.guild_missions.status IS 'Estado: active, completed, expired, cancelled';
COMMENT ON COLUMN social_features.guild_missions.starts_at IS 'Fecha de inicio de la mision';
COMMENT ON COLUMN social_features.guild_missions.expires_at IS 'Fecha de expiracion (opcional)';
COMMENT ON COLUMN social_features.guild_missions.completed_at IS 'Fecha de completado';
COMMENT ON COLUMN social_features.guild_missions.created_at IS 'Fecha de creacion del registro';

-- Indices
CREATE INDEX idx_guild_missions_guild_id ON social_features.guild_missions(guild_id);
CREATE INDEX idx_guild_missions_status ON social_features.guild_missions(status) WHERE status = 'active';
CREATE INDEX idx_guild_missions_expires_at ON social_features.guild_missions(expires_at) WHERE status = 'active';
CREATE INDEX idx_guild_missions_mission_type ON social_features.guild_missions(mission_type);
CREATE INDEX idx_guild_missions_difficulty ON social_features.guild_missions(difficulty);

-- Foreign Key
ALTER TABLE social_features.guild_missions
    ADD CONSTRAINT guild_missions_guild_id_fkey
    FOREIGN KEY (guild_id) REFERENCES social_features.guilds(id) ON DELETE CASCADE;

-- Permisos
ALTER TABLE social_features.guild_missions OWNER TO gamilit_user;
GRANT ALL ON TABLE social_features.guild_missions TO gamilit_user;

-- =====================================================
-- Table: social_features.guild_mission_contributions
-- Description: Tracking de contribuciones individuales a misiones
-- =====================================================

DROP TABLE IF EXISTS social_features.guild_mission_contributions CASCADE;

CREATE TABLE social_features.guild_mission_contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID NOT NULL,
    user_id UUID NOT NULL,
    contribution_value INTEGER NOT NULL CHECK (contribution_value > 0),
    contributed_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),

    CONSTRAINT guild_mission_contributions_unique UNIQUE (mission_id, user_id, contributed_at)
);

-- Comentarios
COMMENT ON TABLE social_features.guild_mission_contributions IS 'Contribuciones individuales a misiones de gremio';
COMMENT ON COLUMN social_features.guild_mission_contributions.id IS 'ID unico de la contribucion';
COMMENT ON COLUMN social_features.guild_mission_contributions.mission_id IS 'ID de la mision';
COMMENT ON COLUMN social_features.guild_mission_contributions.user_id IS 'ID del usuario que contribuye';
COMMENT ON COLUMN social_features.guild_mission_contributions.contribution_value IS 'Valor de la contribucion';
COMMENT ON COLUMN social_features.guild_mission_contributions.contributed_at IS 'Fecha y hora de la contribucion';

-- Indices
CREATE INDEX idx_guild_mission_contributions_mission ON social_features.guild_mission_contributions(mission_id);
CREATE INDEX idx_guild_mission_contributions_user ON social_features.guild_mission_contributions(user_id);
CREATE INDEX idx_guild_mission_contributions_contributed_at ON social_features.guild_mission_contributions(contributed_at);

-- Foreign Keys
ALTER TABLE social_features.guild_mission_contributions
    ADD CONSTRAINT guild_mission_contributions_mission_id_fkey
    FOREIGN KEY (mission_id) REFERENCES social_features.guild_missions(id) ON DELETE CASCADE;

ALTER TABLE social_features.guild_mission_contributions
    ADD CONSTRAINT guild_mission_contributions_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;

-- Permisos
ALTER TABLE social_features.guild_mission_contributions OWNER TO gamilit_user;
GRANT ALL ON TABLE social_features.guild_mission_contributions TO gamilit_user;
