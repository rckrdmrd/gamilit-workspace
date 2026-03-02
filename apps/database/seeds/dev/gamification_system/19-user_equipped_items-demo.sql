-- =====================================================
-- Seed: gamification_system.user_equipped_items (DEV demo loadout)
-- Description: Equipamiento demo para validar aplicacion de variantes al usuario
-- Environment: DEVELOPMENT
-- Dependencies: 18-user_purchases-demo.sql
-- Order: 19
-- Version: 1.1 - Fixed: dynamic profile lookup instead of hardcoded UUID
-- =====================================================

SET search_path TO gamification_system, auth_management, public;

DO $$
DECLARE
    v_student_id UUID;
    v_item1_category UUID;
    v_item2_category UUID;
BEGIN
    -- Dynamic profile lookup (same student as seed 18)
    SELECT p.id INTO v_student_id
    FROM auth_management.profiles p
    JOIN auth.users u ON p.user_id = u.id
    WHERE u.email = 'estudiante1@demo.glit.edu.mx'
    LIMIT 1;

    IF v_student_id IS NULL THEN
        SELECT id INTO v_student_id
        FROM auth_management.profiles
        WHERE role = 'student'
        ORDER BY created_at
        LIMIT 1;
    END IF;

    IF v_student_id IS NULL THEN
        RAISE NOTICE '⚠ No student profiles found. Skipping user_equipped_items demo seed.';
        RETURN;
    END IF;

    RAISE NOTICE '  Using student profile: %', v_student_id;

    -- Item 1: profile frame
    SELECT category_id INTO v_item1_category
    FROM gamification_system.shop_items
    WHERE id = '80000001-0001-0000-0000-000000000002'::uuid;

    IF v_item1_category IS NULL THEN
        RAISE NOTICE '⚠ Shop item 80000001-0001-0000-0000-000000000002 not found. Skipping.';
        RETURN;
    END IF;

    INSERT INTO gamification_system.user_equipped_items (
        id, user_id, category_id, item_id, visual_type, equipped_at, metadata
    ) VALUES (
        '19100000-0000-0000-0000-000000000001'::uuid,
        v_student_id,
        v_item1_category,
        '80000001-0001-0000-0000-000000000002'::uuid,
        'profile_frame',
        gamilit.now_mexico() - INTERVAL '12 hours',
        jsonb_build_object(
            'seed_source', '19-user_equipped_items-demo.sql',
            'applied_from_purchase', true
        )
    )
    ON CONFLICT (user_id, visual_type) DO UPDATE SET
        item_id = EXCLUDED.item_id,
        equipped_at = EXCLUDED.equipped_at,
        metadata = EXCLUDED.metadata;

    -- Item 2: title
    SELECT category_id INTO v_item2_category
    FROM gamification_system.shop_items
    WHERE id = '80000002-0001-0000-0000-000000000001'::uuid;

    IF v_item2_category IS NULL THEN
        RAISE NOTICE '⚠ Shop item 80000002-0001-0000-0000-000000000001 not found. Skipping second item.';
    ELSE
        INSERT INTO gamification_system.user_equipped_items (
            id, user_id, category_id, item_id, visual_type, equipped_at, metadata
        ) VALUES (
            '19100000-0000-0000-0000-000000000002'::uuid,
            v_student_id,
            v_item2_category,
            '80000002-0001-0000-0000-000000000001'::uuid,
            'title',
            gamilit.now_mexico() - INTERVAL '10 hours',
            jsonb_build_object(
                'seed_source', '19-user_equipped_items-demo.sql',
                'applied_from_purchase', true
            )
        )
        ON CONFLICT (user_id, visual_type) DO UPDATE SET
            item_id = EXCLUDED.item_id,
            equipped_at = EXCLUDED.equipped_at,
            metadata = EXCLUDED.metadata;
    END IF;

    RAISE NOTICE '  ✓ Demo equipped items created';
END $$;
