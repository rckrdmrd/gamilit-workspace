-- =====================================================
-- Table: social_features.guilds
-- Description: Gremios/Grupos colaborativos de estudiantes
-- Ticket: DB-GAM-013
-- Created: 2026-02-03
-- =====================================================

CREATE TABLE social_features.guilds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(30) NOT NULL,
    description TEXT,
    emblem_id INTEGER REFERENCES social_features.guild_emblems(id) DEFAULT 1,
    leader_id UUID NOT NULL,
    member_count INTEGER DEFAULT 1 CHECK (member_count >= 1 AND member_count <= 20),
    level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 50),
    total_xp BIGINT DEFAULT 0,
    is_public BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),
    last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),

    -- Unicidad del nombre
    CONSTRAINT guilds_name_unique UNIQUE (name),
    -- Largo del nombre
    CONSTRAINT guilds_name_length CHECK (char_length(name) >= 3 AND char_length(name) <= 30)
);

-- Comentarios
COMMENT ON TABLE social_features.guilds IS 'Gremios colaborativos. Maximo 20 miembros por gremio.';
COMMENT ON COLUMN social_features.guilds.id IS 'ID unico del gremio';
COMMENT ON COLUMN social_features.guilds.name IS 'Nombre unico del gremio (3-30 caracteres)';
COMMENT ON COLUMN social_features.guilds.description IS 'Descripcion del gremio';
COMMENT ON COLUMN social_features.guilds.emblem_id IS 'ID del emblema seleccionado';
COMMENT ON COLUMN social_features.guilds.leader_id IS 'ID del lider/creador del gremio';
COMMENT ON COLUMN social_features.guilds.member_count IS 'Contador de miembros (1-20)';
COMMENT ON COLUMN social_features.guilds.level IS 'Nivel del gremio basado en XP acumulado';
COMMENT ON COLUMN social_features.guilds.total_xp IS 'XP total acumulado por el gremio';
COMMENT ON COLUMN social_features.guilds.is_public IS 'Si el gremio acepta solicitudes publicas';
COMMENT ON COLUMN social_features.guilds.is_active IS 'Si el gremio esta activo';
COMMENT ON COLUMN social_features.guilds.created_at IS 'Fecha de creacion del gremio';
COMMENT ON COLUMN social_features.guilds.updated_at IS 'Fecha de ultima actualizacion';
COMMENT ON COLUMN social_features.guilds.last_activity_at IS 'Ultima actividad para detectar gremios inactivos';

-- Indices
CREATE INDEX idx_guilds_name ON social_features.guilds(name);
CREATE INDEX idx_guilds_leader_id ON social_features.guilds(leader_id);
CREATE INDEX idx_guilds_is_public ON social_features.guilds(is_public) WHERE is_active = true;
CREATE INDEX idx_guilds_level ON social_features.guilds(level);
CREATE INDEX idx_guilds_last_activity ON social_features.guilds(last_activity_at);
CREATE INDEX idx_guilds_total_xp ON social_features.guilds(total_xp DESC);

-- Foreign Key to profiles
ALTER TABLE social_features.guilds
    ADD CONSTRAINT guilds_leader_id_fkey
    FOREIGN KEY (leader_id) REFERENCES auth_management.profiles(id) ON DELETE RESTRICT;

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION social_features.update_guilds_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = gamilit.now_mexico();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_guilds_updated_at
    BEFORE UPDATE ON social_features.guilds
    FOR EACH ROW
    EXECUTE FUNCTION social_features.update_guilds_updated_at();

-- Permisos
ALTER TABLE social_features.guilds OWNER TO gamilit_user;
GRANT ALL ON TABLE social_features.guilds TO gamilit_user;
