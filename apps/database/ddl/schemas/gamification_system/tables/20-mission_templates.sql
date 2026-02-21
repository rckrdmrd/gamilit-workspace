-- =====================================================
-- Table: gamification_system.mission_templates
-- Description: Templates for generating missions with predefined configurations
-- Dependencies: auth_management.profiles
-- =====================================================

DROP TABLE IF EXISTS gamification_system.mission_templates CASCADE;

CREATE TABLE gamification_system.mission_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    description text NOT NULL,
    type character varying(20) NOT NULL,
    category character varying(50),
    target_type character varying(50) NOT NULL,
    target_value integer NOT NULL,
    xp_reward integer DEFAULT 0,
    ml_coins_reward integer DEFAULT 0,
    badge_id uuid,
    difficulty character varying(20) DEFAULT 'normal'::character varying,
    is_active boolean DEFAULT true,
    priority integer DEFAULT 0,
    min_level integer DEFAULT 1,
    max_level integer,
    required_module integer,
    required_exercise_type character varying(50) DEFAULT NULL,
    icon character varying(50),
    color character varying(20),
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT gamilit.now_mexico() NOT NULL,
    updated_at timestamptz DEFAULT gamilit.now_mexico(),
    created_by uuid,

    -- Primary Key
    CONSTRAINT mission_templates_pkey PRIMARY KEY (id),

    -- Check Constraints
    CONSTRAINT mission_templates_type_check CHECK ((type = ANY (ARRAY['daily'::text, 'weekly'::text, 'special'::text, 'classroom'::text]))),
    CONSTRAINT mission_templates_difficulty_check CHECK ((difficulty = ANY (ARRAY['easy'::text, 'normal'::text, 'hard'::text, 'epic'::text]))),
    CONSTRAINT mission_templates_target_value_check CHECK (target_value > 0),
    CONSTRAINT mission_templates_xp_reward_check CHECK (xp_reward >= 0),
    CONSTRAINT mission_templates_ml_coins_reward_check CHECK (ml_coins_reward >= 0),
    CONSTRAINT mission_templates_min_level_check CHECK (min_level >= 1),
    CONSTRAINT mission_templates_max_level_check CHECK ((max_level IS NULL) OR (max_level >= min_level))
);

-- Indexes
CREATE INDEX idx_mission_templates_type ON gamification_system.mission_templates(type);
CREATE INDEX idx_mission_templates_active ON gamification_system.mission_templates(is_active);
CREATE INDEX idx_mission_templates_category ON gamification_system.mission_templates(category);
CREATE INDEX idx_mission_templates_difficulty ON gamification_system.mission_templates(difficulty);
CREATE INDEX idx_mission_templates_exercise_type ON gamification_system.mission_templates(required_exercise_type) WHERE required_exercise_type IS NOT NULL;

-- Foreign Keys
ALTER TABLE ONLY gamification_system.mission_templates
    ADD CONSTRAINT mission_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth_management.profiles(id) ON DELETE SET NULL;

-- Note: badge_id FK commented out until badges table is created
-- ALTER TABLE ONLY gamification_system.mission_templates
--     ADD CONSTRAINT mission_templates_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES gamification_system.badges(id) ON DELETE SET NULL;

-- Comments
COMMENT ON TABLE gamification_system.mission_templates IS 'Templates for generating missions with predefined configurations and rewards';
COMMENT ON COLUMN gamification_system.mission_templates.name IS 'Template display name';
COMMENT ON COLUMN gamification_system.mission_templates.type IS 'Mission type: daily, weekly, special, classroom';
COMMENT ON COLUMN gamification_system.mission_templates.category IS 'Mission category for grouping (exercise, study_time, social, streak, etc.)';
COMMENT ON COLUMN gamification_system.mission_templates.target_type IS 'Type of objective to track (complete_exercises, study_minutes, earn_xp, etc.)';
COMMENT ON COLUMN gamification_system.mission_templates.target_value IS 'Required value to complete the objective';
COMMENT ON COLUMN gamification_system.mission_templates.difficulty IS 'Difficulty level: easy, normal, hard, epic';
COMMENT ON COLUMN gamification_system.mission_templates.is_active IS 'Whether template is active and can be used to generate missions';
COMMENT ON COLUMN gamification_system.mission_templates.priority IS 'Priority for selection (higher = more likely to be selected)';
COMMENT ON COLUMN gamification_system.mission_templates.required_exercise_type IS 'Required exercise type for exercise-linked missions (e.g., crucigrama, detective_textual). NULL = any exercise counts';
COMMENT ON COLUMN gamification_system.mission_templates.metadata IS 'Additional JSON configuration data';

-- Permissions
ALTER TABLE gamification_system.mission_templates OWNER TO gamilit_user;
GRANT ALL ON TABLE gamification_system.mission_templates TO gamilit_user;
