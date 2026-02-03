-- =====================================================
-- Table: social_features.guild_emblems
-- Description: Catalogo de emblemas disponibles para gremios
-- Ticket: DB-GAM-013
-- Created: 2026-02-03
-- =====================================================

CREATE TABLE social_features.guild_emblems (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    category VARCHAR(30) DEFAULT 'standard',
    is_premium BOOLEAN DEFAULT false,
    required_level INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),

    CONSTRAINT guild_emblems_category_check CHECK (
        category IN ('standard', 'mythic', 'seasonal', 'achievement', 'premium')
    )
);

-- Comentarios
COMMENT ON TABLE social_features.guild_emblems IS 'Catalogo de emblemas disponibles para personalizar gremios';
COMMENT ON COLUMN social_features.guild_emblems.id IS 'ID unico del emblema';
COMMENT ON COLUMN social_features.guild_emblems.name IS 'Nombre del emblema';
COMMENT ON COLUMN social_features.guild_emblems.image_url IS 'URL de la imagen del emblema';
COMMENT ON COLUMN social_features.guild_emblems.category IS 'Categoria del emblema: standard, mythic, seasonal, achievement, premium';
COMMENT ON COLUMN social_features.guild_emblems.is_premium IS 'Si requiere compra con ML Coins';
COMMENT ON COLUMN social_features.guild_emblems.required_level IS 'Nivel minimo del gremio para desbloquear';
COMMENT ON COLUMN social_features.guild_emblems.created_at IS 'Fecha de creacion del registro';

-- Indices
CREATE INDEX idx_guild_emblems_category ON social_features.guild_emblems(category);
CREATE INDEX idx_guild_emblems_is_premium ON social_features.guild_emblems(is_premium);
CREATE INDEX idx_guild_emblems_required_level ON social_features.guild_emblems(required_level);

-- Permisos
ALTER TABLE social_features.guild_emblems OWNER TO gamilit_user;
GRANT ALL ON TABLE social_features.guild_emblems TO gamilit_user;
GRANT USAGE, SELECT ON SEQUENCE social_features.guild_emblems_id_seq TO gamilit_user;

-- Seed data: 20 emblemas predefinidos
INSERT INTO social_features.guild_emblems (name, image_url, category, is_premium, required_level) VALUES
('Escudo Basico', '/assets/emblems/shield_basic.svg', 'standard', false, 1),
('Estrella Dorada', '/assets/emblems/star_gold.svg', 'standard', false, 1),
('Leon Rampante', '/assets/emblems/lion.svg', 'standard', false, 1),
('Aguila Imperial', '/assets/emblems/eagle.svg', 'standard', false, 2),
('Dragon Rojo', '/assets/emblems/dragon_red.svg', 'standard', false, 3),
('Corona Real', '/assets/emblems/crown.svg', 'standard', false, 4),
('Fenix Renacido', '/assets/emblems/phoenix.svg', 'mythic', false, 5),
('Quetzalcoatl', '/assets/emblems/quetzalcoatl.svg', 'mythic', false, 6),
('Jaguar Maya', '/assets/emblems/jaguar.svg', 'mythic', false, 7),
('Sol Azteca', '/assets/emblems/aztec_sun.svg', 'mythic', false, 8),
('Corazon de Cristal', '/assets/emblems/crystal_heart.svg', 'seasonal', false, 1),
('Calabaza Magica', '/assets/emblems/pumpkin.svg', 'seasonal', false, 1),
('Copo de Nieve', '/assets/emblems/snowflake.svg', 'seasonal', false, 1),
('Flor de Primavera', '/assets/emblems/spring_flower.svg', 'seasonal', false, 1),
('Trofeo Campeon', '/assets/emblems/trophy.svg', 'achievement', false, 10),
('Libro del Saber', '/assets/emblems/book.svg', 'achievement', false, 5),
('Espada Legendaria', '/assets/emblems/sword.svg', 'premium', true, 1),
('Alas Celestiales', '/assets/emblems/wings.svg', 'premium', true, 1),
('Gema del Infinito', '/assets/emblems/infinity_gem.svg', 'premium', true, 5),
('Escudo Diamante', '/assets/emblems/diamond_shield.svg', 'premium', true, 10);
