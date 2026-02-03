-- =====================================================
-- Table: social_features.guild_members
-- Description: Membresias de usuarios en gremios
-- Ticket: DB-GAM-013
-- Created: 2026-02-03
-- =====================================================

CREATE TABLE social_features.guild_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role VARCHAR(20) DEFAULT 'member',
    contribution_xp BIGINT DEFAULT 0,
    missions_completed INTEGER DEFAULT 0,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),
    last_contribution_at TIMESTAMP WITH TIME ZONE,

    -- Un usuario solo puede estar en un gremio
    CONSTRAINT guild_members_unique_user UNIQUE (user_id),
    -- Un usuario solo una entrada por gremio
    CONSTRAINT guild_members_unique_membership UNIQUE (guild_id, user_id),
    -- Roles validos
    CONSTRAINT guild_members_role_check CHECK (
        role IN ('leader', 'officer', 'member')
    )
);

-- Comentarios
COMMENT ON TABLE social_features.guild_members IS 'Membresias de gremios. Un usuario solo puede pertenecer a un gremio.';
COMMENT ON COLUMN social_features.guild_members.id IS 'ID unico de la membresia';
COMMENT ON COLUMN social_features.guild_members.guild_id IS 'ID del gremio';
COMMENT ON COLUMN social_features.guild_members.user_id IS 'ID del usuario miembro';
COMMENT ON COLUMN social_features.guild_members.role IS 'Rol: leader (1 por gremio), officer (hasta 3), member';
COMMENT ON COLUMN social_features.guild_members.contribution_xp IS 'XP aportado al gremio por este miembro';
COMMENT ON COLUMN social_features.guild_members.missions_completed IS 'Misiones de gremio completadas';
COMMENT ON COLUMN social_features.guild_members.joined_at IS 'Fecha de union al gremio';
COMMENT ON COLUMN social_features.guild_members.last_contribution_at IS 'Fecha de ultima contribucion';

-- Indices
CREATE INDEX idx_guild_members_guild_id ON social_features.guild_members(guild_id);
CREATE INDEX idx_guild_members_user_id ON social_features.guild_members(user_id);
CREATE INDEX idx_guild_members_role ON social_features.guild_members(role);
CREATE INDEX idx_guild_members_contribution ON social_features.guild_members(contribution_xp DESC);

-- Foreign Keys
ALTER TABLE social_features.guild_members
    ADD CONSTRAINT guild_members_guild_id_fkey
    FOREIGN KEY (guild_id) REFERENCES social_features.guilds(id) ON DELETE CASCADE;

ALTER TABLE social_features.guild_members
    ADD CONSTRAINT guild_members_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES auth_management.profiles(id) ON DELETE CASCADE;

-- Permisos
ALTER TABLE social_features.guild_members OWNER TO gamilit_user;
GRANT ALL ON TABLE social_features.guild_members TO gamilit_user;

-- Function to update guild member_count
CREATE OR REPLACE FUNCTION social_features.update_guild_member_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE social_features.guilds
        SET member_count = member_count + 1,
            last_activity_at = gamilit.now_mexico()
        WHERE id = NEW.guild_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE social_features.guilds
        SET member_count = GREATEST(member_count - 1, 0)
        WHERE id = OLD.guild_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_guild_members_count
    AFTER INSERT OR DELETE ON social_features.guild_members
    FOR EACH ROW
    EXECUTE FUNCTION social_features.update_guild_member_count();
