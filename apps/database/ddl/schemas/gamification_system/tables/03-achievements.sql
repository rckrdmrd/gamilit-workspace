-- =====================================================
-- Table: gamification_system.achievements
-- Description: Catálogo de logros y achievements del sistema de gamificación
-- Dependencies: auth_management.profiles, auth_management.tenants
-- =====================================================

DROP TABLE IF EXISTS gamification_system.achievements CASCADE;

CREATE TABLE gamification_system.achievements (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid,
    name text NOT NULL,
    description text,
    icon text DEFAULT 'trophy'::text,
    category gamification_system.achievement_category NOT NULL,
    rarity text DEFAULT 'common'::text,
    difficulty_level educational_content.difficulty_level DEFAULT 'beginner'::educational_content.difficulty_level,
    conditions jsonb DEFAULT '{"type": "progress", "requirements": {"exercises_completed": 10}}'::jsonb NOT NULL,
    rewards jsonb DEFAULT '{"xp": 100, "badge": null, "ml_coins": 50}'::jsonb,
    is_secret boolean DEFAULT false,
    is_active boolean DEFAULT true,
    is_repeatable boolean DEFAULT false,
    order_index integer DEFAULT 0,
    points_value integer DEFAULT 0,
    unlock_message text,
    instructions text,
    tips text[],
    metadata jsonb DEFAULT '{}'::jsonb,
    created_by uuid,
    created_at timestamptz DEFAULT gamilit.now_mexico(),
    updated_at timestamptz DEFAULT gamilit.now_mexico(),
    ml_coins_reward integer DEFAULT 0,

    -- Primary Key
    CONSTRAINT achievements_pkey PRIMARY KEY (id),

    -- Unique Constraints
    CONSTRAINT achievements_name_tenant_key UNIQUE (name, tenant_id),

    -- Check Constraints
    CONSTRAINT achievements_rarity_check CHECK ((rarity = ANY (ARRAY['common'::text, 'rare'::text, 'epic'::text, 'legendary'::text])))
);

-- Indexes
CREATE INDEX idx_achievements_active ON gamification_system.achievements(is_active) WHERE is_active = true;
CREATE INDEX idx_achievements_category ON gamification_system.achievements(category);
CREATE INDEX idx_achievements_conditions_gin ON gamification_system.achievements USING gin (conditions);
CREATE INDEX idx_achievements_secret ON gamification_system.achievements(is_secret) WHERE is_secret = true;

-- Foreign Keys
ALTER TABLE ONLY gamification_system.achievements
    ADD CONSTRAINT achievements_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth_management.profiles(id) ON DELETE SET NULL;

ALTER TABLE ONLY gamification_system.achievements
    ADD CONSTRAINT achievements_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES auth_management.tenants(id) ON DELETE CASCADE;

-- Triggers
-- NOTE: Trigger trg_achievements_updated_at movido a archivo separado
-- Ver: gamification_system/triggers/15-trg_achievements_updated_at.sql

-- RLS Policies
CREATE POLICY achievements_all_admin ON gamification_system.achievements USING (gamilit.is_admin());
CREATE POLICY achievements_select_active ON gamification_system.achievements FOR SELECT USING (((is_active = true) AND (is_secret = false)));
CREATE POLICY achievements_select_admin ON gamification_system.achievements FOR SELECT USING (gamilit.is_admin());

-- Comments
COMMENT ON TABLE gamification_system.achievements IS 'Definiciones de logros/achievements con condiciones y recompensas';
COMMENT ON COLUMN gamification_system.achievements.category IS 'Categoría: progress, streak, completion, social, special, mastery, exploration';
COMMENT ON COLUMN gamification_system.achievements.conditions IS 'Condiciones JSON para desbloquear el achievement';
COMMENT ON COLUMN gamification_system.achievements.is_secret IS 'Si es true, el achievement está oculto hasta desbloquearlo';

-- Permissions
ALTER TABLE gamification_system.achievements OWNER TO gamilit_user;
GRANT ALL ON TABLE gamification_system.achievements TO gamilit_user;
