-- =====================================================
-- Table: gamification_system.user_achievements
-- Description: Achievements desbloqueados por usuario con progreso y recompensas
-- Dependencies: auth_management.profiles, gamification_system.achievements
-- =====================================================

DROP TABLE IF EXISTS gamification_system.user_achievements CASCADE;

CREATE TABLE gamification_system.user_achievements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    achievement_id uuid NOT NULL,
    progress integer DEFAULT 0,
    max_progress integer DEFAULT 100,
    is_completed boolean DEFAULT false,
    completion_percentage numeric(5,2) DEFAULT 0.00,
    completed_at timestamptz,
    notified boolean DEFAULT false,
    viewed boolean DEFAULT false,
    rewards_claimed boolean DEFAULT false,
    rewards_received jsonb DEFAULT '{}'::jsonb,
    progress_data jsonb DEFAULT '{}'::jsonb,
    milestones_reached text[],
    metadata jsonb DEFAULT '{}'::jsonb,
    started_at timestamptz DEFAULT gamilit.now_mexico(),
    created_at timestamptz DEFAULT gamilit.now_mexico(),

    -- Primary Key
    CONSTRAINT user_achievements_pkey PRIMARY KEY (id),

    -- Unique Constraints
    CONSTRAINT user_achievements_user_id_achievement_id_key UNIQUE (user_id, achievement_id),

    -- Check Constraints
    CONSTRAINT user_achievements_progress_check CHECK ((progress >= 0))
);

-- Indexes
CREATE INDEX idx_user_achievements_achievement_id ON gamification_system.user_achievements(achievement_id);
CREATE INDEX idx_user_achievements_completed ON gamification_system.user_achievements(user_id, is_completed);
CREATE INDEX idx_user_achievements_unclaimed ON gamification_system.user_achievements(user_id) WHERE ((is_completed = true) AND (rewards_claimed = false));
CREATE INDEX idx_user_achievements_user_completed ON gamification_system.user_achievements(user_id, is_completed, completed_at);
CREATE INDEX idx_user_achievements_user_id ON gamification_system.user_achievements(user_id);

-- Foreign Keys
ALTER TABLE ONLY gamification_system.user_achievements
    ADD CONSTRAINT user_achievements_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES gamification_system.achievements(id) ON DELETE CASCADE;

ALTER TABLE ONLY gamification_system.user_achievements
    ADD CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;

-- RLS Policies
CREATE POLICY user_achievements_select_admin ON gamification_system.user_achievements FOR SELECT USING (gamilit.is_admin());
CREATE POLICY user_achievements_select_own ON gamification_system.user_achievements FOR SELECT USING ((user_id = gamilit.get_current_user_id()));

-- Comments
COMMENT ON TABLE gamification_system.user_achievements IS 'Achievements desbloqueados por usuario con progreso y recompensas';
COMMENT ON COLUMN gamification_system.user_achievements.progress IS 'Progreso actual hacia el achievement';
COMMENT ON COLUMN gamification_system.user_achievements.rewards_claimed IS 'True si el usuario ya reclamó las recompensas';

-- Permissions
ALTER TABLE gamification_system.user_achievements OWNER TO gamilit_user;
GRANT ALL ON TABLE gamification_system.user_achievements TO gamilit_user;
