-- =====================================================================================
-- Table: shop_categories
-- Schema: gamification_system
-- Description: Categorías de la tienda virtual para organizar items disponibles
-- Version: 1.0 (2025-11-29) - Creación inicial
-- Author: Database-Agent
--
-- 📚 Documentación:
-- Requerimiento: Sistema de tienda virtual con múltiples categorías de items
-- Especificación: Categorías configurables con metadata, iconos y ordenamiento
--
-- Categorías principales:
--   - cosmetics: Personalización visual (avatares, marcos, fondos)
--   - profile: Items de perfil (títulos, badges exclusivos)
--   - guild: [INACTIVO] Items de gremio (banderas, emblemas)
--   - social: [INACTIVO] Items sociales (emojis, stickers, efectos)
--   - consumable: Consumibles (boosts temporales, power-ups)
-- =====================================================================================

-- Drop existing table if exists (development only)
DROP TABLE IF EXISTS gamification_system.shop_categories CASCADE;

-- Create table
CREATE TABLE gamification_system.shop_categories (
    -- Primary key
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,

    -- Basic info
    name text NOT NULL UNIQUE,
    display_name text NOT NULL,
    description text,
    icon text DEFAULT 'package',
    color text DEFAULT 'gray',  -- Para UI: gray, pink, blue, yellow, green

    -- Display configuration
    display_order integer DEFAULT 0,
    is_active boolean DEFAULT true,

    -- Metadata
    metadata jsonb DEFAULT '{}',
    created_at timestamp with time zone DEFAULT gamilit.now_mexico(),
    updated_at timestamp with time zone DEFAULT gamilit.now_mexico()
);

-- Table comment
COMMENT ON TABLE gamification_system.shop_categories IS 'Categorías de la tienda virtual para organizar items';

-- Column comments
COMMENT ON COLUMN gamification_system.shop_categories.name IS 'Identificador único de la categoría (slug)';
COMMENT ON COLUMN gamification_system.shop_categories.display_name IS 'Nombre visible en UI';
COMMENT ON COLUMN gamification_system.shop_categories.description IS 'Descripción de la categoría para mostrar en UI';
COMMENT ON COLUMN gamification_system.shop_categories.icon IS 'Icono de la categoría (nombre del icono Lucide/Heroicons)';
COMMENT ON COLUMN gamification_system.shop_categories.color IS 'Clase de color para UI (Tailwind gradient classes)';
COMMENT ON COLUMN gamification_system.shop_categories.display_order IS 'Orden de visualización en la tienda (menor = primero)';
COMMENT ON COLUMN gamification_system.shop_categories.is_active IS 'Si false, la categoría no se muestra en la tienda';
COMMENT ON COLUMN gamification_system.shop_categories.metadata IS 'Metadata adicional en formato JSON';

-- Indexes
CREATE INDEX idx_shop_categories_active ON gamification_system.shop_categories(is_active) WHERE is_active = true;
CREATE INDEX idx_shop_categories_order ON gamification_system.shop_categories(display_order);

-- Trigger for updated_at
CREATE TRIGGER trg_shop_categories_updated_at
    BEFORE UPDATE ON gamification_system.shop_categories
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

-- Grant permissions
GRANT ALL ON TABLE gamification_system.shop_categories TO gamilit_user;
