-- =====================================================
-- Table: social_features.team_challenges
-- Description: Desafíos asignados a equipos
-- Dependencies: social_features.teams
-- =====================================================

DROP TABLE IF EXISTS social_features.team_challenges CASCADE;

CREATE TABLE social_features.team_challenges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_id uuid NOT NULL,
    challenge_id uuid NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    started_at timestamptz DEFAULT gamilit.now_mexico(),
    completed_at timestamptz,
    score integer DEFAULT 0,

    -- Primary Key
    CONSTRAINT team_challenges_pkey PRIMARY KEY (id),

    -- Unique Constraints
    CONSTRAINT team_challenges_team_id_challenge_id_key UNIQUE (team_id, challenge_id),

    -- Check Constraints
    CONSTRAINT team_challenges_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'failed'::character varying, 'cancelled'::character varying])::text[])))
);

-- Indexes
CREATE INDEX idx_team_challenges_challenge_id ON social_features.team_challenges(challenge_id);
CREATE INDEX idx_team_challenges_status ON social_features.team_challenges(status);
CREATE INDEX idx_team_challenges_team_id ON social_features.team_challenges(team_id);

-- Foreign Keys
ALTER TABLE ONLY social_features.team_challenges
    ADD CONSTRAINT team_challenges_team_id_fkey FOREIGN KEY (team_id) REFERENCES social_features.teams(id) ON DELETE CASCADE;

-- Comments
COMMENT ON TABLE social_features.team_challenges IS 'Desafíos asignados a equipos';

-- Permissions
ALTER TABLE social_features.team_challenges OWNER TO gamilit_user;
GRANT ALL ON TABLE social_features.team_challenges TO gamilit_user;
