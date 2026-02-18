-- =====================================================
-- Table: gamification_system.missions
-- Description: User missions/quests with objectives and rewards
-- Dependencies: auth_management.profiles
-- =====================================================

DROP TABLE IF EXISTS gamification_system.missions CASCADE;

CREATE TABLE gamification_system.missions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    template_id uuid NOT NULL,
    title text NOT NULL,
    description text,
    mission_type text NOT NULL,
    objectives jsonb NOT NULL,
    rewards jsonb NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    progress double precision DEFAULT 0 NOT NULL,
    start_date timestamptz DEFAULT gamilit.now_mexico() NOT NULL,
    end_date timestamptz NOT NULL,
    completed_at timestamptz,
    claimed_at timestamptz,
    created_at timestamptz DEFAULT gamilit.now_mexico() NOT NULL,
    updated_at timestamptz DEFAULT gamilit.now_mexico(),

    -- Primary Key
    CONSTRAINT missions_pkey PRIMARY KEY (id),

    -- Check Constraints
    CONSTRAINT missions_mission_type_check CHECK ((mission_type = ANY (ARRAY['daily'::text, 'weekly'::text, 'special'::text]))),
    CONSTRAINT missions_progress_check CHECK (((progress >= (0)::double precision) AND (progress <= (100)::double precision))),
    CONSTRAINT missions_status_check CHECK ((status = ANY (ARRAY['active'::text, 'in_progress'::text, 'completed'::text, 'claimed'::text, 'expired'::text]))),

    -- Unique constraint to prevent duplicate missions from concurrent requests (REC-001)
    CONSTRAINT missions_user_template_type_date_unique UNIQUE (user_id, template_id, mission_type, end_date)
);

-- Indexes
CREATE INDEX idx_missions_end_date ON gamification_system.missions(end_date);
CREATE INDEX idx_missions_status ON gamification_system.missions(status);
CREATE INDEX idx_missions_template_id ON gamification_system.missions(template_id);
CREATE INDEX idx_missions_type ON gamification_system.missions(mission_type);
CREATE INDEX idx_missions_user_id ON gamification_system.missions(user_id);
CREATE INDEX idx_missions_user_type_status ON gamification_system.missions(user_id, mission_type, status);

-- Foreign Keys
ALTER TABLE ONLY gamification_system.missions
    ADD CONSTRAINT missions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;

ALTER TABLE ONLY gamification_system.missions
    ADD CONSTRAINT missions_template_id_fkey FOREIGN KEY (template_id) REFERENCES gamification_system.mission_templates(id);

-- Triggers
-- NOTE: Trigger missions_updated_at movido a archivo separado
-- Ver: gamification_system/triggers/17-missions_updated_at.sql

-- Comments
COMMENT ON TABLE gamification_system.missions IS 'User missions/quests with objectives and rewards';
COMMENT ON COLUMN gamification_system.missions.template_id IS 'FK to gamification_system.mission_templates(id) — REC-009 migrated from TEXT to UUID';
COMMENT ON COLUMN gamification_system.missions.objectives IS 'JSON array of objectives with type, target, and current progress';
COMMENT ON COLUMN gamification_system.missions.rewards IS 'JSON object with ml_coins, xp, and optional items';
COMMENT ON COLUMN gamification_system.missions.status IS 'Mission lifecycle status';
COMMENT ON COLUMN gamification_system.missions.progress IS 'Overall completion percentage (0-100)';

-- Permissions
ALTER TABLE gamification_system.missions OWNER TO gamilit_user;
GRANT ALL ON TABLE gamification_system.missions TO gamilit_user;
