-- =====================================================
-- Table: social_features.teams
-- Description: Equipos colaborativos de estudiantes
-- Dependencies: social_features.classrooms, auth_management.profiles, auth_management.tenants
-- =====================================================

DROP TABLE IF EXISTS social_features.teams CASCADE;

CREATE TABLE social_features.teams (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    classroom_id uuid,
    tenant_id uuid NOT NULL,
    name text NOT NULL,
    description text,
    motto text,
    color_primary text DEFAULT '#3B82F6'::text,
    color_secondary text DEFAULT '#10B981'::text,
    avatar_url text,
    banner_url text,
    badges jsonb DEFAULT '[]'::jsonb,
    creator_id uuid NOT NULL,
    leader_id uuid,
    team_code text,
    max_members integer DEFAULT 5,
    current_members_count integer DEFAULT 0,
    is_public boolean DEFAULT false,
    allow_join_requests boolean DEFAULT true,
    require_approval boolean DEFAULT true,
    total_xp integer DEFAULT 0,
    total_ml_coins integer DEFAULT 0,
    modules_completed integer DEFAULT 0,
    achievements_earned integer DEFAULT 0,
    is_active boolean DEFAULT true,
    is_verified boolean DEFAULT false,
    founded_at timestamptz DEFAULT gamilit.now_mexico(),
    last_activity_at timestamptz,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT gamilit.now_mexico(),
    updated_at timestamptz DEFAULT gamilit.now_mexico(),

    -- Primary Key
    CONSTRAINT teams_pkey PRIMARY KEY (id),

    -- Unique Constraints
    CONSTRAINT teams_team_code_key UNIQUE (team_code)
);

-- Indexes
CREATE INDEX idx_teams_active ON social_features.teams(is_active) WHERE is_active = true;
CREATE INDEX idx_teams_classroom ON social_features.teams(classroom_id);
CREATE INDEX idx_teams_classroom_active_xp ON social_features.teams(classroom_id, is_active, total_xp DESC) WHERE is_active = true;
CREATE INDEX idx_teams_leader ON social_features.teams(leader_id);
CREATE INDEX idx_teams_xp ON social_features.teams(total_xp DESC);

-- Foreign Keys
ALTER TABLE ONLY social_features.teams
    ADD CONSTRAINT teams_classroom_id_fkey FOREIGN KEY (classroom_id) REFERENCES social_features.classrooms(id) ON DELETE CASCADE;

ALTER TABLE ONLY social_features.teams
    ADD CONSTRAINT teams_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES auth_management.profiles(id) ON DELETE SET NULL;

ALTER TABLE ONLY social_features.teams
    ADD CONSTRAINT teams_leader_id_fkey FOREIGN KEY (leader_id) REFERENCES auth_management.profiles(id) ON DELETE SET NULL;

ALTER TABLE ONLY social_features.teams
    ADD CONSTRAINT teams_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES auth_management.tenants(id) ON DELETE CASCADE;

-- Triggers
-- NOTE: Trigger trg_teams_updated_at movido a archivo separado
-- Ver: social_features/triggers/28-trg_teams_updated_at.sql

-- Row Level Security
ALTER TABLE social_features.teams ENABLE ROW LEVEL SECURITY;

-- Comments
COMMENT ON TABLE social_features.teams IS 'Equipos colaborativos de estudiantes';

-- Permissions
ALTER TABLE social_features.teams OWNER TO gamilit_user;
GRANT ALL ON TABLE social_features.teams TO gamilit_user;
