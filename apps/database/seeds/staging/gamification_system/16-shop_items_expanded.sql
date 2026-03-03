-- =====================================================
-- Seed: gamification_system.shop_items (Expanded)
-- Description: Items adicionales maya-themed y educativos (15 items)
-- Environment: ALL
-- Dependencies: gamification_system.shop_items, shop_categories
-- Order: 16
-- Created: 2026-02-14
-- Version: 3.0 (2026-02-21: visual config moved from effect_data to metadata, .png→.svg)
-- =====================================================
--
-- ITEMS INCLUIDOS:
-- - CONSUMABLE (3 items): Pista, vision lectora, segunda oportunidad
-- - COSMETICS (8 items): 4 originales + 4 Wave 2 (avatares, marcos, fondos maya-themed)
-- - PROFILE (4 items): 2 originales + 2 Wave 2 (titulos, badges maya)
--
-- TOTAL: 15 items (9 originales + 6 nuevos Wave 2)
--
-- Wave 2 items (2026-02-20):
-- - Avatar Guerrero Jaguar (cosmetics/legendary/500)
-- - Marco Calendario Tzolk'in (cosmetics/epic/350)
-- - Fondo Cenote Sagrado (profile/rare/200)
-- - Titulo Chilam Balam (profile/epic/300)
-- - Avatar Sacerdotisa Ixchel (cosmetics/legendary/500)
-- - Marco Piramide Kukulkan (cosmetics/epic/350)
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
    cat_consumable_id uuid;
BEGIN
    SELECT id INTO cat_cosmetics_id FROM gamification_system.shop_categories WHERE name = 'cosmetics';
    SELECT id INTO cat_profile_id FROM gamification_system.shop_categories WHERE name = 'profile';
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
        jsonb_build_object(),
        jsonb_build_object(
            'type', 'avatar',
            'asset_url', '/assets/avatars/kukulkan.svg',
            'animated', true,
            'featured', true,
            'recommended_rank', 'K''uk''ulkan',
            'fallback', jsonb_build_object('render_mode', 'icon', 'css_class', 'text-slate-400')
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
        jsonb_build_object(),
        jsonb_build_object(
            'type', 'profile_frame',
            'asset_url', '/assets/frames/hieroglyphic.svg',
            'border_color', '#CD853F',
            'fallback', jsonb_build_object('render_mode', 'css', 'css_class', 'ring-2 ring-slate-400')
        ),
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
        jsonb_build_object(),
        jsonb_build_object(
            'type', 'avatar',
            'asset_url', '/assets/avatars/ah-kin.svg',
            'animated', false,
            'recommended_rank', 'Ah K''in',
            'fallback', jsonb_build_object('render_mode', 'icon', 'css_class', 'text-slate-400')
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
        jsonb_build_object(),
        jsonb_build_object(
            'type', 'profile_background',
            'asset_url', '/assets/backgrounds/maya-temple.svg',
            'animated', false,
            'fallback', jsonb_build_object('render_mode', 'css', 'css_class', 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600')
        ),
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
        jsonb_build_object(),
        jsonb_build_object(
            'type', 'title',
            'display_text', 'Halach Uinic',
            'color', '#FFD700',
            'recommended_rank', 'Halach Uinic',
            'achievement_showcase', true,
            'fallback', jsonb_build_object('css_class', 'font-semibold text-amber-500')
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
        jsonb_build_object(),
        jsonb_build_object(
            'type', 'badge',
            'asset_url', '/assets/badges/maya-citadel.svg',
            'animated', false,
            'fallback', jsonb_build_object('render_mode', 'icon', 'css_class', 'text-amber-500')
        ),
        gamilit.now_mexico(),
        gamilit.now_mexico()
    ),

    -- =====================================================
    -- WAVE 2: NEW MAYA-THEMED ITEMS (6 items, 2026-02-20)
    -- =====================================================

    -- COSMETICS: Avatar Guerrero Jaguar (Balam)
    (
        '80000006-0012-0000-0000-000000000001'::uuid,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
        'Avatar Guerrero Jaguar',
        'Encarna al poderoso guerrero jaguar, símbolo de fuerza y coraje en la cultura maya. El Balam era la élite guerrera.',
        'user-circle',
        cat_cosmetics_id,
        'cosmetics'::gamification_system.shop_item_category,
        'legendary',
        ARRAY['avatar', 'maya', 'jaguar', 'balam', 'legendary'],
        500,
        true,
        1,
        false,
        jsonb_build_object(),
        jsonb_build_object(
            'type', 'avatar',
            'asset_url', '/assets/cosmetics/avatars/guerrero_jaguar.svg',
            'animated', true,
            'animation', 'jaguar_roar',
            'glow_color', '#D4AF37',
            'required_level', 8,
            'fallback', jsonb_build_object('render_mode', 'icon', 'css_class', 'text-slate-400')
        ),
        gamilit.now_mexico(),
        gamilit.now_mexico()
    ),
    -- COSMETICS: Marco Calendario Tzolk'in
    (
        '80000006-0013-0000-0000-000000000001'::uuid,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
        'Marco Calendario Tzolk''in',
        'Marco inspirado en el calendario sagrado Tzolk''in de 260 días. Cada día tiene su propia energía y significado.',
        'square',
        cat_cosmetics_id,
        'cosmetics'::gamification_system.shop_item_category,
        'epic',
        ARRAY['frame', 'maya', 'tzolkin', 'calendar'],
        350,
        true,
        1,
        false,
        jsonb_build_object(),
        jsonb_build_object(
            'type', 'profile_frame',
            'asset_url', '/assets/cosmetics/frames/tzolkin.svg',
            'animated', true,
            'animation', 'calendar_rotation',
            'border_style', 'animated',
            'required_level', 6,
            'fallback', jsonb_build_object('render_mode', 'css', 'css_class', 'ring-2 ring-slate-400')
        ),
        gamilit.now_mexico(),
        gamilit.now_mexico()
    ),
    -- PROFILE: Fondo Cenote Sagrado
    (
        '80000006-0014-0000-0000-000000000001'::uuid,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
        'Fondo Cenote Sagrado',
        'Fondo místico que evoca las aguas cristalinas del cenote sagrado. Los mayas creían que los cenotes eran puertas al inframundo.',
        'image',
        cat_profile_id,
        'profile'::gamification_system.shop_item_category,
        'rare',
        ARRAY['background', 'maya', 'cenote', 'sacred'],
        200,
        true,
        1,
        false,
        jsonb_build_object(),
        jsonb_build_object(
            'type', 'profile_background',
            'asset_url', '/assets/cosmetics/backgrounds/cenote_sagrado.svg',
            'parallax', true,
            'water_effect', true,
            'required_level', 4,
            'fallback', jsonb_build_object('render_mode', 'css', 'css_class', 'bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600')
        ),
        gamilit.now_mexico(),
        gamilit.now_mexico()
    ),
    -- PROFILE: Título Chilam Balam
    (
        '80000006-0015-0000-0000-000000000001'::uuid,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
        'Título Chilam Balam',
        'Porta el título del profeta jaguar, los sabios intérpretes de los libros sagrados mayas del Chilam Balam.',
        'award',
        cat_profile_id,
        'profile'::gamification_system.shop_item_category,
        'epic',
        ARRAY['title', 'maya', 'chilam-balam', 'prestige'],
        300,
        true,
        1,
        false,
        jsonb_build_object(),
        jsonb_build_object(
            'type', 'title',
            'display_text', 'Chilam Balam',
            'color', '#FFD700',
            'effect', 'shimmer',
            'required_level', 7,
            'fallback', jsonb_build_object('css_class', 'font-semibold text-amber-500')
        ),
        gamilit.now_mexico(),
        gamilit.now_mexico()
    ),
    -- COSMETICS: Avatar Sacerdotisa Ixchel
    (
        '80000006-0017-0000-0000-000000000001'::uuid,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
        'Avatar Sacerdotisa Ixchel',
        'Representa a Ixchel, diosa maya de la luna, la medicina y el tejido. Símbolo de sabiduría femenina y poder curativo.',
        'user-circle',
        cat_cosmetics_id,
        'cosmetics'::gamification_system.shop_item_category,
        'legendary',
        ARRAY['avatar', 'maya', 'ixchel', 'goddess', 'legendary'],
        500,
        true,
        1,
        false,
        jsonb_build_object(),
        jsonb_build_object(
            'type', 'avatar',
            'asset_url', '/assets/cosmetics/avatars/sacerdotisa_ixchel.svg',
            'animated', true,
            'animation', 'moonlight_glow',
            'glow_color', '#C0C0C0',
            'required_level', 8,
            'fallback', jsonb_build_object('render_mode', 'icon', 'css_class', 'text-slate-400')
        ),
        gamilit.now_mexico(),
        gamilit.now_mexico()
    ),
    -- COSMETICS: Marco Pirámide Kukulkán
    (
        '80000006-0018-0000-0000-000000000001'::uuid,
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
        'Marco Pirámide Kukulkán',
        'Marco ornamental con la majestuosa pirámide de Kukulkán. Durante el equinoccio, la serpiente emplumada desciende por las escaleras.',
        'square',
        cat_cosmetics_id,
        'cosmetics'::gamification_system.shop_item_category,
        'epic',
        ARRAY['frame', 'maya', 'kukulkan', 'pyramid', 'chichen-itza'],
        350,
        true,
        1,
        false,
        jsonb_build_object(),
        jsonb_build_object(
            'type', 'profile_frame',
            'asset_url', '/assets/cosmetics/frames/piramide_kukulkan.svg',
            'animated', true,
            'animation', 'serpent_descent',
            'border_style', 'stone_carved',
            'required_level', 6,
            'fallback', jsonb_build_object('render_mode', 'css', 'css_class', 'ring-2 ring-slate-400')
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

    -- Update required_level for consumable and Wave 2 items that have level requirements
    UPDATE gamification_system.shop_items SET required_level = 5
        WHERE id = '80000006-0003-0000-0000-000000000001'::uuid;
    UPDATE gamification_system.shop_items SET required_level = 8
        WHERE id IN ('80000006-0012-0000-0000-000000000001'::uuid, '80000006-0017-0000-0000-000000000001'::uuid);
    UPDATE gamification_system.shop_items SET required_level = 6
        WHERE id IN ('80000006-0013-0000-0000-000000000001'::uuid, '80000006-0018-0000-0000-000000000001'::uuid);
    UPDATE gamification_system.shop_items SET required_level = 4
        WHERE id = '80000006-0014-0000-0000-000000000001'::uuid;
    UPDATE gamification_system.shop_items SET required_level = 7
        WHERE id = '80000006-0015-0000-0000-000000000001'::uuid;
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
    consumable_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_count FROM gamification_system.shop_items;
    SELECT COUNT(*) INTO expanded_count FROM gamification_system.shop_items
        WHERE id::text LIKE '80000006-%';
    SELECT COUNT(*) INTO cosmetics_count FROM gamification_system.shop_items
        WHERE id::text LIKE '80000006-%' AND category = 'cosmetics';
    SELECT COUNT(*) INTO profile_count FROM gamification_system.shop_items
        WHERE id::text LIKE '80000006-%' AND category = 'profile';
    SELECT COUNT(*) INTO consumable_count FROM gamification_system.shop_items
        WHERE id::text LIKE '80000006-%' AND category = 'consumable';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'SHOP ITEMS EXPANDED CREADOS EXITOSAMENTE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total items en tienda: %', total_count;
    RAISE NOTICE 'Items expandidos (maya-themed): %', expanded_count;
    RAISE NOTICE '  - Cosmetics: %', cosmetics_count;
    RAISE NOTICE '  - Profile: %', profile_count;
    RAISE NOTICE '  - Consumable: %', consumable_count;
    RAISE NOTICE '========================================';

    IF expanded_count >= 15 THEN
        RAISE NOTICE 'Todos los 15 items expandidos fueron creados correctamente';
    ELSE
        RAISE WARNING 'Se esperaban 15 items expandidos, se crearon %', expanded_count;
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
