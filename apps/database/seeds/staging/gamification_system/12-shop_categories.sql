-- =====================================================
-- Seed: gamification_system.shop_categories (PROD)
-- Description: Categorías de la tienda virtual
-- Environment: PRODUCTION
-- Dependencies: gamification_system.shop_categories table
-- Order: 12
-- Created: 2025-11-29
-- Version: 1.0
-- =====================================================
--
-- CATEGORÍAS INCLUIDAS:
-- - cosmetics: Cosméticos visuales (avatares, marcos, fondos)
-- - profile: Items de perfil (títulos, badges)
-- - consumable: Consumibles (boosts, power-ups)
-- [INACTIVO] guild: Items de gremio (banderas, emblemas)
-- [INACTIVO] social: Items sociales (emojis, stickers)
--
-- TOTAL: 5 categorías (3 activas + 2 inactivas)
--
-- IMPORTANTE: Estas categorías estructuran la tienda virtual
-- y permiten organizar los items por tipo.
-- =====================================================

SET search_path TO gamification_system, public;

-- =====================================================
-- INSERT: Shop Categories
-- =====================================================

INSERT INTO gamification_system.shop_categories (
    name,
    display_name,
    description,
    icon,
    color,
    display_order,
    is_active
) VALUES
(
    'cosmetics',
    'Cosméticos',
    'Personaliza tu apariencia con avatares, marcos y fondos únicos',
    'palette',
    'from-pink-500 to-purple-500',
    1,
    true
),
(
    'profile',
    'Perfil',
    'Mejora tu perfil con títulos y badges exclusivos',
    'user',
    'from-blue-500 to-cyan-500',
    2,
    true
),
(
    'guild',
    'Gremio',
    'Items para personalizar y mejorar tu gremio',
    'crown',
    'from-yellow-500 to-orange-500',
    3,
    false
),
(
    'social',
    'Social',
    'Emojis, stickers y efectos para interactuar con otros',
    'star',
    'from-green-500 to-emerald-500',
    4,
    false
),
(
    'consumable',
    'Consumibles',
    'Boosts temporales y items de uso único',
    'zap',
    'from-orange-500 to-red-500',
    5,
    true
)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    color = EXCLUDED.color,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = gamilit.now_mexico();

-- =====================================================
-- Verification Query
-- =====================================================

DO $$
DECLARE
    category_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO category_count
    FROM gamification_system.shop_categories;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'SHOP CATEGORIES CREADAS EXITOSAMENTE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total categorías: %', category_count;
    RAISE NOTICE '========================================';

    IF category_count = 5 THEN
        RAISE NOTICE '✓ Todas las categorías fueron creadas correctamente';
    ELSE
        RAISE WARNING '⚠ Se esperaban 5 categorías, se crearon %', category_count;
    END IF;
END $$;

-- =====================================================
-- Listado de categorías
-- =====================================================

DO $$
DECLARE
    category_record RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Listado de categorías de tienda:';
    RAISE NOTICE '========================================';

    FOR category_record IN
        SELECT
            display_name,
            name,
            icon,
            display_order
        FROM gamification_system.shop_categories
        ORDER BY display_order
    LOOP
        RAISE NOTICE '  % - % [%] (orden: %)',
            category_record.display_order,
            category_record.display_name,
            category_record.name,
            category_record.icon;
    END LOOP;

    RAISE NOTICE '========================================';
END $$;
