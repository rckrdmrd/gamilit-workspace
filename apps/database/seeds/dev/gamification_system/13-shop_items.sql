-- =====================================================
-- Seed: gamification_system.shop_items (PROD)
-- Description: Items de la tienda virtual (16 items variados)
-- Environment: PRODUCTION
-- Dependencies: gamification_system.shop_items, shop_categories
-- Order: 13
-- Created: 2025-11-29
-- Version: 1.0
-- =====================================================
--
-- ITEMS INCLUIDOS:
-- - COSMETICS (9 items): Avatares, marcos, fondos, badges decorativos
-- - PROFILE (5 items): Títulos, badges exclusivos
-- - CONSUMABLE (2 items): Boosts temporales
--
-- TOTAL: 16 items
--
-- IMPORTANTE: Estos items proveen valor y variedad
-- a la economía de ML Coins del sistema GAMILIT.
-- =====================================================

SET search_path TO gamification_system, auth_management, public;

-- =====================================================
-- INSERT: Shop Items
-- =====================================================

-- Get category IDs for reference
DO $$
DECLARE
    cat_cosmetics_id uuid;
    cat_profile_id uuid;
    cat_consumable_id uuid;
BEGIN
    SELECT id INTO cat_cosmetics_id FROM gamification_system.shop_categories WHERE name = 'cosmetics';
    SELECT id INTO cat_profile_id FROM gamification_system.shop_categories WHERE name = 'profile';
    SELECT id INTO cat_consumable_id FROM gamification_system.shop_categories WHERE name = 'consumable';

    -- =====================================================
    -- CATEGORY: COSMETICS (9 items)
    -- =====================================================

    INSERT INTO gamification_system.shop_items (
        id,
        tenant_id,
        name,
        description,
        icon,
        category_id,
        category,
        rarity,
        tags,
        price,
        is_available,
        max_per_user,
        is_consumable,
        effect_data,
        metadata,
        created_at,
        updated_at
    ) VALUES
    (
        '80000001-0001-0000-0000-000000000001'::uuid,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
        'Avatar Detective Dorado',
        'Avatar exclusivo de detective con acabado dorado. Demuestra tu nivel de maestría en comprensión lectora.',
        'user-circle',
        cat_cosmetics_id,
        'cosmetics'::gamification_system.shop_item_category,
        'legendary',
        ARRAY['avatar', 'detective', 'gold', 'exclusive'],
        500,
        true,
        1,
        false,
        jsonb_build_object(
            'type', 'avatar',
            'asset_url', '/assets/avatars/detective-gold.svg',
            'animated', false
        ),
        jsonb_build_object(
            'featured', true,
            'recommended_rank', 'K''uk''ulkan'
        ),
        gamilit.now_mexico(),
        gamilit.now_mexico()
    ),
    (
        '80000001-0001-0000-0000-000000000002'::uuid,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
        'Marco Lector Experto',
        'Marco decorativo épico para tu perfil. Muestra que eres un lector experimentado.',
        'square',
        cat_cosmetics_id,
        'cosmetics'::gamification_system.shop_item_category,
        'epic',
        ARRAY['frame', 'border', 'expert'],
        300,
        true,
        1,
        false,
        jsonb_build_object(
            'type', 'profile_frame',
            'asset_url', '/assets/frames/expert-reader.svg',
            'border_color', '#8B5CF6'
        ),
        jsonb_build_object(
            'featured', true
        ),
        gamilit.now_mexico(),
        gamilit.now_mexico()
    ),
    (
        '80000001-0001-0000-0000-000000000003'::uuid,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
        'Fondo Biblioteca Mágica',
        'Fondo animado de biblioteca con libros flotantes y efectos mágicos.',
        'image',
        cat_cosmetics_id,
        'cosmetics'::gamification_system.shop_item_category,
        'rare',
        ARRAY['background', 'library', 'animated'],
        150,
        true,
        1,
        false,
        jsonb_build_object(
            'type', 'profile_background',
            'asset_url', '/assets/backgrounds/magic-library.svg',
            'animated', true
        ),
        jsonb_build_object(),
        gamilit.now_mexico(),
        gamilit.now_mexico()
    ),
    (
        '80000001-0001-0000-0000-000000000004'::uuid,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
        'Avatar Búho Sabio',
        'Avatar de búho con toga académica. Perfecto para estudiantes dedicados.',
        'user-circle',
        cat_cosmetics_id,
        'cosmetics'::gamification_system.shop_item_category,
        'common',
        ARRAY['avatar', 'owl', 'wisdom'],
        50,
        true,
        1,
        false,
        jsonb_build_object(
            'type', 'avatar',
            'asset_url', '/assets/avatars/wise-owl.svg',
            'animated', false
        ),
        jsonb_build_object(
            'starter_item', true
        ),
        gamilit.now_mexico(),
        gamilit.now_mexico()
    ),
    (
        '80000001-0001-0000-0000-000000000005'::uuid,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
        'Marco Estrellas',
        'Marco sencillo con estrellas doradas. Ideal para principiantes.',
        'square',
        cat_cosmetics_id,
        'cosmetics'::gamification_system.shop_item_category,
        'common',
        ARRAY['frame', 'stars', 'simple'],
        75,
        true,
        1,
        false,
        jsonb_build_object(
            'type', 'profile_frame',
            'asset_url', '/assets/frames/stars.svg',
            'border_color', '#FFD700'
        ),
        jsonb_build_object(
            'starter_item', true
        ),
        gamilit.now_mexico(),
        gamilit.now_mexico()
    ),
    (
        '80000003-0001-0000-0000-000000000001'::uuid,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
        'Marco Bandera Dorada',
        'Marco decorativo legendario con diseño de bandera dorada. Símbolo de excelencia en tu perfil.',
        'flag',
        cat_cosmetics_id,
        'cosmetics'::gamification_system.shop_item_category,
        'legendary',
        ARRAY['cosmeticos', 'decorativo', 'marco', 'gold', 'prestige'],
        600,
        true,
        1,
        false,
        jsonb_build_object(
            'type', 'profile_frame',
            'border_color', '#FFD700',
            'asset_url', '/assets/frames/golden-banner.svg',
            'animated', true
        ),
        jsonb_build_object(
            'featured', true
        ),
        gamilit.now_mexico(),
        gamilit.now_mexico()
    ),
    (
        '80000003-0001-0000-0000-000000000002'::uuid,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
        'Badge Dragón Lector',
        'Badge épico de perfil con diseño de dragón rodeado de libros antiguos.',
        'shield',
        cat_cosmetics_id,
        'cosmetics'::gamification_system.shop_item_category,
        'epic',
        ARRAY['cosmeticos', 'decorativo', 'badge', 'dragon'],
        350,
        true,
        1,
        false,
        jsonb_build_object(
            'type', 'badge',
            'asset_url', '/assets/badges/dragon-reader.svg',
            'animated', false
        ),
        jsonb_build_object(),
        gamilit.now_mexico(),
        gamilit.now_mexico()
    ),
    (
        '80000003-0001-0000-0000-000000000003'::uuid,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
        'Badge Escudo del Conocimiento',
        'Badge de perfil con diseño de escudo que representa la protección del saber.',
        'shield-check',
        cat_cosmetics_id,
        'cosmetics'::gamification_system.shop_item_category,
        'rare',
        ARRAY['cosmeticos', 'decorativo', 'badge', 'knowledge'],
        200,
        true,
        1,
        false,
        jsonb_build_object(
            'type', 'badge',
            'asset_url', '/assets/badges/knowledge-shield.svg',
            'animated', false
        ),
        jsonb_build_object(),
        gamilit.now_mexico(),
        gamilit.now_mexico()
    ),
    (
        '80000003-0001-0000-0000-000000000004'::uuid,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
        'Marco Estandarte Básico',
        'Marco decorativo inicial para tu perfil. Funcional y elegante.',
        'flag',
        cat_cosmetics_id,
        'cosmetics'::gamification_system.shop_item_category,
        'common',
        ARRAY['cosmeticos', 'decorativo', 'marco', 'basic'],
        100,
        true,
        1,
        false,
        jsonb_build_object(
            'type', 'profile_frame',
            'border_color', '#C0C0C0',
            'asset_url', '/assets/frames/basic-banner.svg',
            'animated', false
        ),
        jsonb_build_object(
            'starter_item', true
        ),
        gamilit.now_mexico(),
        gamilit.now_mexico()
    ),

    -- =====================================================
    -- CATEGORY: PROFILE (5 items)
    -- =====================================================

    (
        '80000002-0001-0000-0000-000000000001'::uuid,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
        'Título "Maestro Lector"',
        'Título prestigioso que demuestra tu dominio absoluto de la comprensión lectora.',
        'award',
        cat_profile_id,
        'profile'::gamification_system.shop_item_category,
        'legendary',
        ARRAY['title', 'master', 'prestige'],
        400,
        true,
        1,
        false,
        jsonb_build_object(
            'type', 'title',
            'display_text', 'Maestro Lector',
            'color', '#FFD700'
        ),
        jsonb_build_object(
            'featured', true,
            'achievement_showcase', true
        ),
        gamilit.now_mexico(),
        gamilit.now_mexico()
    ),
    (
        '80000002-0001-0000-0000-000000000002'::uuid,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
        'Título "Explorador de Historias"',
        'Para aquellos que han explorado diversos tipos de textos y géneros literarios.',
        'compass',
        cat_profile_id,
        'profile'::gamification_system.shop_item_category,
        'epic',
        ARRAY['title', 'explorer', 'stories'],
        250,
        true,
        1,
        false,
        jsonb_build_object(
            'type', 'title',
            'display_text', 'Explorador de Historias',
            'color', '#8B5CF6'
        ),
        jsonb_build_object(),
        gamilit.now_mexico(),
        gamilit.now_mexico()
    ),
    (
        '80000002-0001-0000-0000-000000000003'::uuid,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
        'Badge Detective Élite',
        'Badge exclusivo para los mejores detectives textuales de GAMILIT.',
        'shield',
        cat_profile_id,
        'profile'::gamification_system.shop_item_category,
        'rare',
        ARRAY['badge', 'detective', 'elite'],
        200,
        true,
        1,
        false,
        jsonb_build_object(
            'type', 'badge',
            'asset_url', '/assets/badges/detective-elite.svg',
            'animated', true
        ),
        jsonb_build_object(),
        gamilit.now_mexico(),
        gamilit.now_mexico()
    ),
    (
        '80000002-0001-0000-0000-000000000004'::uuid,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
        'Título "Aprendiz Curioso"',
        'Título inicial para estudiantes que muestran curiosidad y ganas de aprender.',
        'book-open',
        cat_profile_id,
        'profile'::gamification_system.shop_item_category,
        'common',
        ARRAY['title', 'beginner', 'curious'],
        100,
        true,
        1,
        false,
        jsonb_build_object(
            'type', 'title',
            'display_text', 'Aprendiz Curioso',
            'color', '#3B82F6'
        ),
        jsonb_build_object(
            'starter_item', true
        ),
        gamilit.now_mexico(),
        gamilit.now_mexico()
    ),
    (
        '80000002-0001-0000-0000-000000000005'::uuid,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
        'Badge Primer Logro',
        'Badge conmemorativo de tu primer logro en GAMILIT.',
        'award',
        cat_profile_id,
        'profile'::gamification_system.shop_item_category,
        'common',
        ARRAY['badge', 'first', 'achievement'],
        50,
        true,
        1,
        false,
        jsonb_build_object(
            'type', 'badge',
            'asset_url', '/assets/badges/first-achievement.svg',
            'animated', false
        ),
        jsonb_build_object(
            'starter_item', true
        ),
        gamilit.now_mexico(),
        gamilit.now_mexico()
    ),

    -- =====================================================
    -- CATEGORY: CONSUMABLE (2 items)
    -- =====================================================

    (
        '80000005-0001-0000-0000-000000000001'::uuid,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
        'Boost XP 2x (24h)',
        'Duplica tu ganancia de XP durante 24 horas. Perfecto para avanzar rápido.',
        'zap',
        cat_consumable_id,
        'consumable'::gamification_system.shop_item_category,
        'rare',
        ARRAY['boost', 'xp', 'temporary'],
        100,
        true,
        null,
        true,
        jsonb_build_object(
            'type', 'xp_boost',
            'multiplier', 2.0,
            'duration_hours', 24
        ),
        jsonb_build_object(
            'stackable', false,
            'popular', true
        ),
        gamilit.now_mexico(),
        gamilit.now_mexico()
    ),
    (
        '80000005-0001-0000-0000-000000000002'::uuid,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
        'Boost Coins 1.5x (12h)',
        'Aumenta 50% la ganancia de ML Coins durante 12 horas.',
        'coins',
        cat_consumable_id,
        'consumable'::gamification_system.shop_item_category,
        'common',
        ARRAY['boost', 'coins', 'temporary'],
        75,
        true,
        null,
        true,
        jsonb_build_object(
            'type', 'coins_boost',
            'multiplier', 1.5,
            'duration_hours', 12
        ),
        jsonb_build_object(
            'stackable', false
        ),
        gamilit.now_mexico(),
        gamilit.now_mexico()
    )
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        icon = EXCLUDED.icon,
        category_id = EXCLUDED.category_id,
        category = EXCLUDED.category,
        rarity = EXCLUDED.rarity,
        tags = EXCLUDED.tags,
        price = EXCLUDED.price,
        is_available = EXCLUDED.is_available,
        max_per_user = EXCLUDED.max_per_user,
        is_consumable = EXCLUDED.is_consumable,
        effect_data = EXCLUDED.effect_data,
        metadata = EXCLUDED.metadata,
        updated_at = gamilit.now_mexico();
END $$;

-- =====================================================
-- Verification Query
-- =====================================================

DO $$
DECLARE
    items_count INTEGER;
    cosmetics_count INTEGER;
    profile_count INTEGER;
    consumable_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO items_count FROM gamification_system.shop_items;
    SELECT COUNT(*) INTO cosmetics_count FROM gamification_system.shop_items WHERE category = 'cosmetics';
    SELECT COUNT(*) INTO profile_count FROM gamification_system.shop_items WHERE category = 'profile';
    SELECT COUNT(*) INTO consumable_count FROM gamification_system.shop_items WHERE category = 'consumable';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'SHOP ITEMS CREADOS EXITOSAMENTE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total items: %', items_count;
    RAISE NOTICE '  - Cosmetics: %', cosmetics_count;
    RAISE NOTICE '  - Profile: %', profile_count;
    RAISE NOTICE '  - Consumable: %', consumable_count;
    RAISE NOTICE '========================================';

    IF items_count >= 16 THEN
        RAISE NOTICE '✓ Todos los items fueron creados correctamente';
    ELSE
        RAISE WARNING '⚠ Se esperaban al menos 16 items, se crearon %', items_count;
    END IF;
END $$;

-- =====================================================
-- Listado de items por categoría y rareza
-- =====================================================

DO $$
DECLARE
    item_record RECORD;
    current_category TEXT := '';
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Listado de items de tienda por categoría:';
    RAISE NOTICE '========================================';

    FOR item_record IN
        SELECT
            name,
            category::text as category,
            rarity,
            price,
            is_consumable
        FROM gamification_system.shop_items
        ORDER BY category, rarity DESC, price DESC
    LOOP
        IF current_category != item_record.category THEN
            current_category := item_record.category;
            RAISE NOTICE '';
            RAISE NOTICE '=== % ===', UPPER(current_category);
        END IF;

        RAISE NOTICE '  - % [%] - % ML Coins %',
            item_record.name,
            item_record.rarity,
            item_record.price,
            CASE WHEN item_record.is_consumable THEN '(Consumible)' ELSE '' END;
    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
END $$;
