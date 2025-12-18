-- =====================================================================================
-- Table: shop_items
-- Schema: gamification_system
-- Description: Catálogo de items disponibles en la tienda virtual
-- Version: 1.0 (2025-11-29) - Creación inicial
-- Author: Database-Agent
--
-- 📚 Documentación:
-- Requerimiento: Sistema de tienda virtual con múltiples tipos de items
-- Especificación: Items configurables con pricing, stock, requisitos y efectos
--
-- Tipos de items (category):
--   - cosmetics: Avatares, marcos, fondos de perfil
--   - profile: Títulos, badges visuales exclusivos
--   - guild: Banderas, emblemas, items de personalización de gremio
--   - social: Emojis, stickers, efectos de chat
--   - consumable: Boosts temporales, multiplicadores, power-ups
--
-- Rareza (rarity): common, rare, epic, legendary
-- =====================================================================================

-- Drop existing table if exists (development only)
DROP TABLE IF EXISTS gamification_system.shop_items CASCADE;

-- Create table
CREATE TABLE gamification_system.shop_items (
    -- Primary key
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,

    -- Multi-tenancy
    tenant_id uuid REFERENCES auth_management.tenants(id) ON DELETE CASCADE,

    -- Basic info
    name text NOT NULL,
    description text,
    icon text DEFAULT 'package',
    image_url text,

    -- Categorization
    category_id uuid REFERENCES gamification_system.shop_categories(id) ON DELETE SET NULL,
    category gamification_system.shop_item_category NOT NULL,
    rarity text DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    tags text[] DEFAULT '{}',

    -- Pricing
    price integer NOT NULL CHECK (price >= 0),
    discount_price integer CHECK (discount_price >= 0 AND (discount_price IS NULL OR discount_price < price)),
    discount_ends_at timestamp with time zone,

    -- Availability
    is_available boolean DEFAULT true,
    stock integer,  -- NULL = unlimited
    max_per_user integer DEFAULT 1,  -- NULL = unlimited per user

    -- Requirements
    required_rank text,  -- Maya rank required (e.g., 'Nacom', 'Ah K''in')
    required_level integer,
    required_achievement_id uuid REFERENCES gamification_system.achievements(id) ON DELETE SET NULL,

    -- Item behavior
    is_consumable boolean DEFAULT false,
    duration_days integer,  -- For temporary items (e.g., 7 days boost)
    effect_data jsonb DEFAULT '{}',  -- Item-specific effects/configuration

    -- Metadata
    metadata jsonb DEFAULT '{}',
    created_by uuid REFERENCES auth_management.profiles(id) ON DELETE SET NULL,
    created_at timestamp with time zone DEFAULT gamilit.now_mexico(),
    updated_at timestamp with time zone DEFAULT gamilit.now_mexico()
);

-- Table comment
COMMENT ON TABLE gamification_system.shop_items IS 'Catálogo de items disponibles en la tienda virtual';

-- Column comments
COMMENT ON COLUMN gamification_system.shop_items.tenant_id IS 'Tenant al que pertenece el item (NULL = global para todos)';
COMMENT ON COLUMN gamification_system.shop_items.category IS 'Tipo de item: cosmetics, profile, guild, social, consumable';
COMMENT ON COLUMN gamification_system.shop_items.category_id IS 'FK a shop_categories para organización visual';
COMMENT ON COLUMN gamification_system.shop_items.rarity IS 'Rareza: common, rare, epic, legendary';
COMMENT ON COLUMN gamification_system.shop_items.tags IS 'Etiquetas para filtrado y búsqueda';
COMMENT ON COLUMN gamification_system.shop_items.price IS 'Precio en ML Coins';
COMMENT ON COLUMN gamification_system.shop_items.discount_price IS 'Precio con descuento (si aplica)';
COMMENT ON COLUMN gamification_system.shop_items.discount_ends_at IS 'Fecha de fin del descuento';
COMMENT ON COLUMN gamification_system.shop_items.stock IS 'Stock disponible (NULL = ilimitado)';
COMMENT ON COLUMN gamification_system.shop_items.max_per_user IS 'Máximo por usuario (NULL = ilimitado)';
COMMENT ON COLUMN gamification_system.shop_items.required_rank IS 'Rango Maya requerido para comprar';
COMMENT ON COLUMN gamification_system.shop_items.required_level IS 'Nivel mínimo requerido';
COMMENT ON COLUMN gamification_system.shop_items.required_achievement_id IS 'Achievement requerido para desbloquear';
COMMENT ON COLUMN gamification_system.shop_items.is_consumable IS 'Si true, el item se consume al usar (e.g., boosts)';
COMMENT ON COLUMN gamification_system.shop_items.duration_days IS 'Duración en días para items temporales';
COMMENT ON COLUMN gamification_system.shop_items.effect_data IS 'Datos específicos del efecto del item (JSON)';
COMMENT ON COLUMN gamification_system.shop_items.metadata IS 'Metadata adicional del item';

-- Indexes
CREATE INDEX idx_shop_items_category ON gamification_system.shop_items(category);
CREATE INDEX idx_shop_items_category_id ON gamification_system.shop_items(category_id);
CREATE INDEX idx_shop_items_available ON gamification_system.shop_items(is_available) WHERE is_available = true;
CREATE INDEX idx_shop_items_rarity ON gamification_system.shop_items(rarity);
CREATE INDEX idx_shop_items_price ON gamification_system.shop_items(price);
CREATE INDEX idx_shop_items_tags_gin ON gamification_system.shop_items USING gin(tags);
CREATE INDEX idx_shop_items_tenant ON gamification_system.shop_items(tenant_id);

-- Trigger for updated_at
CREATE TRIGGER trg_shop_items_updated_at
    BEFORE UPDATE ON gamification_system.shop_items
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.update_updated_at_column();

-- Grant permissions
GRANT ALL ON TABLE gamification_system.shop_items TO gamilit_user;
