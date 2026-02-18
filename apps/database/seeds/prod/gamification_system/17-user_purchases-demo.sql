-- =====================================================
-- Seed: gamification_system.user_purchases (PROD demo ownership)
-- Description: Compras demo para validar flujo compra->inventario->equipamiento
-- Environment: PRODUCTION
-- Dependencies: 13-shop_items.sql, auth_management/04-profiles-complete.sql
-- Order: 17
-- =====================================================

SET search_path TO gamification_system, auth_management, public;

INSERT INTO gamification_system.user_purchases (
    id,
    user_id,
    item_id,
    tenant_id,
    quantity,
    price_paid,
    discount_applied,
    transaction_id,
    status,
    expires_at,
    consumed_at,
    is_active,
    metadata,
    purchased_at
) VALUES
(
    '17000000-0000-0000-0000-000000000001'::uuid,
    'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, -- student@gamilit.com
    '80000001-0001-0000-0000-000000000002'::uuid, -- Marco Lector Experto
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    1,
    300,
    0,
    NULL,
    'completed',
    NULL,
    NULL,
    true,
    jsonb_build_object(
        'seed_source', '17-user_purchases-demo.sql',
        'flow', 'shop_purchase_to_inventory',
        'variant_type', 'profile_frame'
    ),
    gamilit.now_mexico() - INTERVAL '2 days'
),
(
    '17000000-0000-0000-0000-000000000002'::uuid,
    'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, -- student@gamilit.com
    '80000002-0001-0000-0000-000000000001'::uuid, -- Titulo Maestro Lector
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    1,
    400,
    0,
    NULL,
    'completed',
    NULL,
    NULL,
    true,
    jsonb_build_object(
        'seed_source', '17-user_purchases-demo.sql',
        'flow', 'shop_purchase_to_inventory',
        'variant_type', 'title'
    ),
    gamilit.now_mexico() - INTERVAL '1 day'
)
ON CONFLICT (id) DO UPDATE SET
    status = EXCLUDED.status,
    is_active = EXCLUDED.is_active,
    metadata = EXCLUDED.metadata,
    purchased_at = EXCLUDED.purchased_at;
