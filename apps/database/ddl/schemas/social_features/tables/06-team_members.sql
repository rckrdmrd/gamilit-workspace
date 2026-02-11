-- =====================================================
-- Table: social_features.team_members
-- Description: Miembros de equipos colaborativos
-- Dependencies: social_features.teams, auth_management.profiles
-- =====================================================

DROP TABLE IF EXISTS social_features.team_members CASCADE;

CREATE TABLE social_features.team_members (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    team_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role character varying(20) DEFAULT 'member'::character varying NOT NULL,
    joined_at timestamptz DEFAULT gamilit.now_mexico(),
    left_at timestamptz,

    -- Primary Key
    CONSTRAINT team_members_pkey PRIMARY KEY (id),

    -- Unique Constraints
    CONSTRAINT team_members_team_id_user_id_key UNIQUE (team_id, user_id),

    -- Check Constraints
    CONSTRAINT team_members_role_check CHECK (((role)::text = ANY ((ARRAY['owner'::character varying, 'admin'::character varying, 'member'::character varying])::text[])))
);

-- Indexes
CREATE INDEX idx_team_members_active ON social_features.team_members(team_id, user_id) WHERE left_at IS NULL;
CREATE INDEX idx_team_members_team_id ON social_features.team_members(team_id);
CREATE INDEX idx_team_members_user_id ON social_features.team_members(user_id);

-- Foreign Keys
ALTER TABLE ONLY social_features.team_members
    ADD CONSTRAINT team_members_team_id_fkey FOREIGN KEY (team_id) REFERENCES social_features.teams(id) ON DELETE CASCADE;

ALTER TABLE ONLY social_features.team_members
    ADD CONSTRAINT team_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;

-- Comments
COMMENT ON TABLE social_features.team_members IS 'Miembros de equipos colaborativos';

-- Permissions
ALTER TABLE social_features.team_members OWNER TO gamilit_user;
GRANT ALL ON TABLE social_features.team_members TO gamilit_user;
