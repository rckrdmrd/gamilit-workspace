-- =====================================================
-- Seed: gamification_system.shop_items (Expanded)
-- Description: Items adicionales maya-themed y educativos (11 items)
-- Environment: DEV
-- Dependencies: gamification_system.shop_items, shop_categories
-- Order: 16
-- Created: 2026-02-14
-- Version: 1.0
-- =====================================================
--
-- ITEMS INCLUIDOS:
-- - CONSUMABLE (3 items): Pista, vision lectora, segunda oportunidad
-- - COSMETICS (4 items): Avatares y marcos maya-themed
-- - PROFILE (2 items): Titulo y badge maya
-- - SOCIAL (2 items): Sticker pack y efecto jade
--
-- TOTAL: 11 items
--
-- IMPORTANTE: Estos items amplian la tienda con tematica
-- maya autentica y mecanicas educativas avanzadas.
-- =====================================================

SET search_path TO gamification_system, auth_management, public;

-- =====================================================
-- INSERT: Shop Items (Expanded Maya-Themed)
-- =====================================================

-- Get category IDs for reference
DO $$
DECLARE
    cat_cosmetics_id uuid;
    cat_profile_id uuid;
    cat_social_id uuid;
    cat_consumable_id uuid;
BEGIN
    SELECT id INTO cat_cosmetics_id FROM gamification_system.shop_categories WHERE name = 'cosmetics';
    SELECT id INTO cat_profile_id FROM gamification_system.shop_categories WHERE name = 'profile';
    SELECT id INTO cat_social_id FROM gamification_system.shop_categories WHERE name = 'social';
    SELECT id INTO cat_consumable_id FROM gamification_system.shop_categories WHERE name = 'consumable';

    -- =====================================================
    -- CATEGORY: CONSUMABLE (3 items)
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
        '80000006-0001-0000-0000-000000000001'::uuid,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
        'Pista de Detective',
        'Una pista que te ayuda a resolver ejercicios dificiles. Revela informacion clave.',
        'search',
        cat_consumable_id,
        'consumable'::gamification_system.shop_item_category,
        'common',
        ARRAY['hint', 'help', 'detective', 'consumable'],
        15,
        true,
        null,
        true,
        jsonb_build_object(
            'type', 'hint',
            'hint_type', 'contextual',
            'uses', 1
        ),
        jsonb_build_object(),
        gamilit.now_mexico(),
        gamilit.now_mexico()
    ),
    (
        '80000006-0002-0000-0000-000000000001'::uuid,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
        'Vision Lectora',
        'Activa tu vision de detective para ver las respuestas correctas resaltadas brevemente.',
        'eye',
        cat_consumable_id,
        'consumable'::gamification_system.shop_item_category,
        'rare',
        ARRAY['vision', 'preview', 'reading', 'consumable'],
        25,
        true,
        null,
        true,
        jsonb_build_object(
            'type', 'highlight',
            'duration_seconds', 10,
            'highlight_type', 'answer_preview'
        ),
        jsonb_build_object(),
        gamilit.now_mexico(),
        gamilit.now_mexico()
    ),
    (
        '80000006-0003-0000-0000-000000000001'::uuid,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
        'Segunda Oportunidad',
        'Permite reintentar un ejercicio fallido sin perder racha ni penalizacion.',
        'refresh-cw',
        cat_consumable_id,
        'consumable'::gamification_system.shop_item_category,
        'epic',
        ARRAY['retry', 'second-chance', 'consumable'],
        40,
        true,
        null,
        true,
        jsonb_build_object(
            'type', 'retry',
            'max_retries', 1,
            'preserves_streak', true
        ),
        jsonb_build_object(
            'required_level', 5
        ),
        gamilit.now_mexico(),
        gamilit.now_mexico()
    ),

    -- =====================================================
    -- CATEGORY: COSMETICS (4 items)
    -- =====================================================

    (
        '80000006-0004-0000-0000-000000000001'::uuid,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
        'Avatar K''uk''ulkan',
        'Avatar legendario de la Serpiente Emplumada. Solo para los mas dedicados lectores.',
        'user-circle',
        cat_cosmetics_id,
        'cosmetics'::gamification_system.shop_item_category,
        'legendary',
        ARRAY['avatar', 'maya', 'kukulkan', 'legendary'],
        750,
        true,
        1,
        false,
        jsonb_build_object(
            'type', 'avatar',
            'asset_url', '/assets/avatars/kukulkan.png',
            'animated', true
        ),
        jsonb_build_object(
            'featured', true,
            'recommended_rank', 'K''uk''ulkan'
        ),
        gamilit.now_mexico(),
        gamilit.now_mexico()
    ),
    (
        '80000006-0005-0000-0000-000000000001'::uuid,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
        'Marco Jeroglifico',
        'Marco con jeroglificos mayas autenticos que rodean tu perfil.',
        'square',
        cat_cosmetics_id,
        'cosmetics'::gamification_system.shop_item_category,
        'epic',
        ARRAY['frame', 'maya', 'hieroglyphic'],
        200,
        true,
        1,
        false,
        jsonb_build_object(
            'type', 'profile_frame',
            'asset_url', '/assets/frames/hieroglyphic.png',
            'border_color', '#CD853F'
        ),
        jsonb_build_object(),
        gamilit.now_mexico(),
        gamilit.now_mexico()
    ),
    (
        '80000006-0006-0000-0000-000000000001'::uuid,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
        'Avatar Ah K''in',
        'Avatar del Sacerdote del Sol maya. Simbolo de sabiduria y conocimiento.',
        'user-circle',
        cat_cosmetics_id,
        'cosmetics'::gamification_system.shop_item_category,
        'epic',
        ARRAY['avatar', 'maya', 'ah-kin', 'priest'],
        350,
        true,
        1,
        false,
        jsonb_build_object(
            'type', 'avatar',
            'asset_url', '/assets/avatars/ah-kin.png',
            'animated', false
        ),
        jsonb_build_object(
            'recommended_rank', 'Ah K''in'
        ),
        gamilit.now_mexico(),
        gamilit.now_mexico()
    ),
    (
        '80000006-0007-0000-0000-000000000001'::uuid,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
        'Fondo Templo Maya',
        'Fondo con la majestuosa piramide de Kukulkan al atardecer.',
        'image',
        cat_cosmetics_id,
        'cosmetics'::gamification_system.shop_item_category,
        'rare',
        ARRAY['background', 'maya', 'temple', 'chichen-itza'],
        125,
        true,
        1,
        false,
        jsonb_build_object(
            'type', 'profile_background',
            'asset_url', '/assets/backgrounds/maya-temple.png',
            'animated', false
        ),
        jsonb_build_object(),
        gamilit.now_mexico(),
        gamilit.now_mexico()
    ),

    -- =====================================================
    -- CATEGORY: PROFILE (2 items)
    -- =====================================================

    (
        '80000006-0008-0000-0000-000000000001'::uuid,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
        'Titulo Halach Uinic',
        'Titulo de ''Gran Senor'' maya. Demuestra tu dominio supremo de la lectura.',
        'award',
        cat_profile_id,
        'profile'::gamification_system.shop_item_category,
        'epic',
        ARRAY['title', 'maya', 'halach-uinic', 'prestige'],
        300,
        true,
        1,
        false,
        jsonb_build_object(
            'type', 'title',
            'display_text', 'Halach Uinic',
            'color', '#FFD700'
        ),
        jsonb_build_object(
            'recommended_rank', 'Halach Uinic',
            'achievement_showcase', true
        ),
        gamilit.now_mexico(),
        gamilit.now_mexico()
    ),
    (
        '80000006-0009-0000-0000-000000000001'::uuid,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
        'Badge Ciudadela Maya',
        'Badge conmemorativo que representa la ciudadela de la sabiduria maya.',
        'shield',
        cat_profile_id,
        'profile'::gamification_system.shop_item_category,
        'rare',
        ARRAY['badge', 'maya', 'citadel'],
        175,
        true,
        1,
        false,
        jsonb_build_object(
            'type', 'badge',
            'asset_url', '/assets/badges/maya-citadel.png',
            'animated', false
        ),
        jsonb_build_object(),
        gamilit.now_mexico(),
        gamilit.now_mexico()
    ),

    -- =====================================================
    -- CATEGORY: SOCIAL (2 items)
    -- =====================================================

    (
        '80000006-0010-0000-0000-000000000001'::uuid,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
        'Sticker Pack Nacom',
        'Pack de 15 stickers con el guerrero Nacom y tematica maya para chat.',
        'sticker',
        cat_social_id,
        'social'::gamification_system.shop_item_category,
        'common',
        ARRAY['sticker', 'pack', 'maya', 'nacom'],
        80,
        true,
        1,
        false,
        jsonb_build_object(
            'type', 'sticker_pack',
            'sticker_count', 15,
            'theme', 'nacom_warrior'
        ),
        jsonb_build_object(),
        gamilit.now_mexico(),
        gamilit.now_mexico()
    ),
    (
        '80000006-0011-0000-0000-000000000001'::uuid,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
        'Efecto Jade',
        'Efecto visual de jade brillante cuando celebras logros en chat.',
        'sparkles',
        cat_social_id,
        'social'::gamification_system.shop_item_category,
        'rare',
        ARRAY['effect', 'jade', 'maya', 'celebration'],
        120,
        true,
        1,
        false,
        jsonb_build_object(
            'type', 'chat_effect',
            'effect_name', 'jade_sparkle',
            'duration_seconds', 5,
            'color', '#00A86B'
        ),
        jsonb_build_object(),
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
    total_count INTEGER;
    expanded_count INTEGER;
    cosmetics_count INTEGER;
    profile_count INTEGER;
    social_count INTEGER;
    consumable_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_count FROM gamification_system.shop_items;
    SELECT COUNT(*) INTO expanded_count FROM gamification_system.shop_items
        WHERE id::text LIKE '80000006-%';
    SELECT COUNT(*) INTO cosmetics_count FROM gamification_system.shop_items
        WHERE id::text LIKE '80000006-%' AND category = 'cosmetics';
    SELECT COUNT(*) INTO profile_count FROM gamification_system.shop_items
        WHERE id::text LIKE '80000006-%' AND category = 'profile';
    SELECT COUNT(*) INTO social_count FROM gamification_system.shop_items
        WHERE id::text LIKE '80000006-%' AND category = 'social';
    SELECT COUNT(*) INTO consumable_count FROM gamification_system.shop_items
        WHERE id::text LIKE '80000006-%' AND category = 'consumable';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'SHOP ITEMS EXPANDED CREADOS EXITOSAMENTE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total items en tienda: %', total_count;
    RAISE NOTICE 'Items expandidos (maya-themed): %', expanded_count;
    RAISE NOTICE '  - Cosmetics: %', cosmetics_count;
    RAISE NOTICE '  - Profile: %', profile_count;
    RAISE NOTICE '  - Social: %', social_count;
    RAISE NOTICE '  - Consumable: %', consumable_count;
    RAISE NOTICE '========================================';

    IF expanded_count >= 11 THEN
        RAISE NOTICE 'Todos los 11 items expandidos fueron creados correctamente';
    ELSE
        RAISE WARNING 'Se esperaban 11 items expandidos, se crearon %', expanded_count;
    END IF;
END $$;

-- =====================================================
-- Listado de items expandidos por categoria y rareza
-- =====================================================

DO $$
DECLARE
    item_record RECORD;
    current_category TEXT := '';
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Listado de items expandidos (maya-themed):';
    RAISE NOTICE '========================================';

    FOR item_record IN
        SELECT
            name,
            category::text as category,
            rarity,
            price,
            is_consumable
        FROM gamification_system.shop_items
        WHERE id::text LIKE '80000006-%'
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
