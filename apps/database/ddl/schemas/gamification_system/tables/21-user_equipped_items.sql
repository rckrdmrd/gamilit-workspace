-- =====================================================================================
-- Table: user_equipped_items
-- Schema: gamification_system
-- Description: Items cosméticos equipados actualmente por el usuario (Loadout activo)
-- Version: 1.0 (2026-02-17) - Creación inicial
-- Author: Architecture-Agent
--
-- 📚 Documentación:
-- Requerimiento: Personalización de avatar y perfil
-- Especificación: Tabla que define qué item tiene puesto el usuario en cada categoría
-- Regla de Negocio: Un usuario solo puede tener 1 item equipado por categoría a la vez.
--
-- Relaciones:
--   - user_id -> auth_management.profiles (Dueño del loadout)
--   - item_id -> gamification_system.shop_items (Item específico)
--   - category_id -> gamification_system.shop_categories (Categoría del item, redundante pero necesaria para constraint)
-- =====================================================================================

-- Drop existing table if exists (development only)
DROP TABLE IF EXISTS gamification_system.user_equipped_items CASCADE;

-- Create table
CREATE TABLE gamification_system.user_equipped_items (
    -- Primary key
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,

    -- Relations
    user_id uuid NOT NULL REFERENCES auth_management.profiles(id) ON DELETE CASCADE,
    category_id uuid NOT NULL REFERENCES gamification_system.shop_categories(id) ON DELETE CASCADE,
    item_id uuid NOT NULL REFERENCES gamification_system.shop_items(id) ON DELETE CASCADE,

    -- Metadata
    equipped_at timestamp with time zone DEFAULT gamilit.now_mexico(),
    metadata jsonb DEFAULT '{}'
);

-- Table comment
COMMENT ON TABLE gamification_system.user_equipped_items IS 'Items cosméticos equipados actualmente por el usuario';

-- Column comments
COMMENT ON COLUMN gamification_system.user_equipped_items.user_id IS 'Usuario dueño del equipamiento';
COMMENT ON COLUMN gamification_system.user_equipped_items.category_id IS 'Categoría del item (Avatar, Marco, Fondo)';
COMMENT ON COLUMN gamification_system.user_equipped_items.item_id IS 'Item específico equipado';
COMMENT ON COLUMN gamification_system.user_equipped_items.equipped_at IS 'Fecha en que se equipó el item';

-- Indexes
CREATE INDEX idx_user_equipped_user ON gamification_system.user_equipped_items(user_id);
CREATE INDEX idx_user_equipped_category ON gamification_system.user_equipped_items(category_id);

-- Unique Constraint (CORE LOGIC):
-- Garantiza que solo haya 1 item por categoría para un usuario.
-- Si intenta insertar otro item de la misma categoría, debe fallar o usarse ON CONFLICT UPDATE.
CREATE UNIQUE INDEX idx_user_equipped_unique_category ON gamification_system.user_equipped_items(user_id, category_id);

-- Grant permissions
GRANT ALL ON TABLE gamification_system.user_equipped_items TO gamilit_user;
