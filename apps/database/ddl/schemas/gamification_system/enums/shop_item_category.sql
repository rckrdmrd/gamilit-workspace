-- =====================================================
-- ENUM: gamification_system.shop_item_category
-- Descripcion: Categorias de items en la tienda virtual
-- Migrado de: 00-prerequisites.sql
-- Fecha de migracion: 2026-01-07
-- Ver: PLAN-CONSOLIDACION-BD-2026-01-07.md (FASE 2)
-- =====================================================
-- Documentacion:
-- Sistema de tienda virtual con multiples categorias de items
-- VERSION: 1.0 (2025-11-29)
-- =====================================================

DO $$ BEGIN
    CREATE TYPE gamification_system.shop_item_category AS ENUM (
        'cosmetics',     -- Cosmeticos visuales (avatares, marcos, fondos)
        'profile',       -- Items de perfil (titulos, badges visuales)
        'guild',         -- Items de gremio (banderas, emblemas)
        'social',        -- Items sociales (emojis, stickers)
        'consumable'     -- Consumibles (boosts temporales, etc.)
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMENT ON TYPE gamification_system.shop_item_category IS 'Categorias de items de la tienda virtual (v1.0 - 2025-11-29)';
