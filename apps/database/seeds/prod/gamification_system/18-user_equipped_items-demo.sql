-- =====================================================
-- Seed: gamification_system.user_equipped_items (PROD demo loadout)
-- Description: Equipamiento demo para validar aplicación de variantes al usuario
-- Environment: PRODUCTION
-- Dependencies: 17-user_purchases-demo.sql
-- Order: 18
-- =====================================================

SET search_path TO gamification_system, auth_management, public;

-- Equipar marco (categoria cosmetics)
INSERT INTO gamification_system.user_equipped_items (
    id,
    user_id,
    category_id,
    item_id,
    equipped_at,
    metadata
)
SELECT
    '18000000-0000-0000-0000-000000000001'::uuid,
    'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
    si.category_id,
    si.id,
    gamilit.now_mexico() - INTERVAL '12 hours',
    jsonb_build_object(
        'seed_source', '18-user_equipped_items-demo.sql',
        'applied_from_purchase', true
    )
FROM gamification_system.shop_items si
WHERE si.id = '80000001-0001-0000-0000-000000000002'::uuid
ON CONFLICT (user_id, category_id) DO UPDATE SET
    item_id = EXCLUDED.item_id,
    equipped_at = EXCLUDED.equipped_at,
    metadata = EXCLUDED.metadata;

-- Equipar titulo (categoria profile)
INSERT INTO gamification_system.user_equipped_items (
    id,
    user_id,
    category_id,
    item_id,
    equipped_at,
    metadata
)
SELECT
    '18000000-0000-0000-0000-000000000002'::uuid,
    'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
    si.category_id,
    si.id,
    gamilit.now_mexico() - INTERVAL '10 hours',
    jsonb_build_object(
        'seed_source', '18-user_equipped_items-demo.sql',
        'applied_from_purchase', true
    )
FROM gamification_system.shop_items si
WHERE si.id = '80000002-0001-0000-0000-000000000001'::uuid
ON CONFLICT (user_id, category_id) DO UPDATE SET
    item_id = EXCLUDED.item_id,
    equipped_at = EXCLUDED.equipped_at,
    metadata = EXCLUDED.metadata;
