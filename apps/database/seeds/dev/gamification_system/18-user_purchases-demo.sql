-- =====================================================
-- Seed: gamification_system.user_purchases (DEV demo ownership)
-- Description: Compras demo para validar flujo compra->inventario->equipamiento
-- Environment: DEVELOPMENT
-- Dependencies: 13-shop_items.sql, auth_management/04-profiles-complete.sql
-- Order: 18
-- Version: 1.1 - Fixed: dynamic profile lookup instead of hardcoded UUID
-- =====================================================

SET search_path TO gamification_system, auth_management, public;

DO $$
DECLARE
    v_student_id UUID;
    v_tenant_id UUID;
BEGIN
    -- Dynamic profile lookup (first demo student)
    SELECT p.id INTO v_student_id
    FROM auth_management.profiles p
    JOIN auth.users u ON p.user_id = u.id
    WHERE u.email = 'estudiante1@demo.glit.edu.mx'
    LIMIT 1;

    IF v_student_id IS NULL THEN
        -- Fallback: any student profile
        SELECT id INTO v_student_id
        FROM auth_management.profiles
        WHERE role = 'student'
        ORDER BY created_at
        LIMIT 1;
    END IF;

    IF v_student_id IS NULL THEN
        RAISE NOTICE '⚠ No student profiles found. Skipping user_purchases demo seed.';
        RETURN;
    END IF;

    -- Dynamic tenant lookup
    SELECT id INTO v_tenant_id
    FROM auth_management.tenants
    ORDER BY created_at
    LIMIT 1;

    RAISE NOTICE '  Using student profile: %', v_student_id;
    RAISE NOTICE '  Using tenant: %', v_tenant_id;

    INSERT INTO gamification_system.user_purchases (
        id, user_id, item_id, tenant_id, quantity, price_paid,
        discount_applied, transaction_id, status, expires_at,
        consumed_at, is_active, metadata, purchased_at
    ) VALUES
    (
        '18100000-0000-0000-0000-000000000001'::uuid,
        v_student_id,
        '80000001-0001-0000-0000-000000000002'::uuid,
        v_tenant_id,
        1, 300, 0, NULL, 'completed', NULL, NULL, true,
        jsonb_build_object(
            'seed_source', '18-user_purchases-demo.sql',
            'flow', 'shop_purchase_to_inventory',
            'variant_type', 'profile_frame'
        ),
        gamilit.now_mexico() - INTERVAL '2 days'
    ),
    (
        '18100000-0000-0000-0000-000000000002'::uuid,
        v_student_id,
        '80000002-0001-0000-0000-000000000001'::uuid,
        v_tenant_id,
        1, 400, 0, NULL, 'completed', NULL, NULL, true,
        jsonb_build_object(
            'seed_source', '18-user_purchases-demo.sql',
            'flow', 'shop_purchase_to_inventory',
            'variant_type', 'title'
        ),
        gamilit.now_mexico() - INTERVAL '1 day'
    )
    ON CONFLICT (id) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        status = EXCLUDED.status,
        is_active = EXCLUDED.is_active,
        metadata = EXCLUDED.metadata,
        purchased_at = EXCLUDED.purchased_at;

    RAISE NOTICE '  ✓ 2 demo purchases created';
END $$;
