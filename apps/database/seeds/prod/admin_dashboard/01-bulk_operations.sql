-- =====================================================
-- Seed: bulk_operations (PROD)
-- Schema: admin_dashboard
-- Descripcion: Datos iniciales para operaciones bulk
-- Relacionado: EXT-002 (Admin Extendido), AUDIT-003
-- Fecha: 2026-01-04
-- =====================================================

-- NOTA: Este seed crea registros de ejemplo para el portal admin.
-- En produccion, nuevos registros se crean dinamicamente via API.

-- Operacion bulk completada (historica)
INSERT INTO admin_dashboard.bulk_operations (
    id,
    operation_type,
    target_entity,
    target_ids,
    target_count,
    completed_count,
    failed_count,
    status,
    error_details,
    started_by,
    started_at,
    completed_at,
    result
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'suspend_users',
    'users',
    ARRAY['b0000000-0000-0000-0000-000000000001'::UUID, 'b0000000-0000-0000-0000-000000000002'::UUID, 'b0000000-0000-0000-0000-000000000003'::UUID],
    3,
    3,
    0,
    'completed',
    '[]'::jsonb,
    (SELECT id FROM auth.users WHERE email LIKE '%admin%' LIMIT 1),
    gamilit.now_mexico() - INTERVAL '7 days',
    gamilit.now_mexico() - INTERVAL '7 days' + INTERVAL '5 seconds',
    '{"message": "3 usuarios suspendidos exitosamente", "affected_roles": ["student"]}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Operacion bulk con errores parciales
INSERT INTO admin_dashboard.bulk_operations (
    id,
    operation_type,
    target_entity,
    target_ids,
    target_count,
    completed_count,
    failed_count,
    status,
    error_details,
    started_by,
    started_at,
    completed_at,
    result
) VALUES (
    'a0000000-0000-0000-0000-000000000002',
    'update_role',
    'users',
    ARRAY['c0000000-0000-0000-0000-000000000001'::UUID, 'c0000000-0000-0000-0000-000000000002'::UUID],
    2,
    1,
    1,
    'completed',
    '[{"user_id": "c0000000-0000-0000-0000-000000000002", "error": "Usuario no encontrado"}]'::jsonb,
    (SELECT id FROM auth.users WHERE email LIKE '%admin%' LIMIT 1),
    gamilit.now_mexico() - INTERVAL '3 days',
    gamilit.now_mexico() - INTERVAL '3 days' + INTERVAL '3 seconds',
    '{"message": "1 de 2 usuarios actualizados", "new_role": "teacher"}'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Operacion bulk pendiente (en cola)
INSERT INTO admin_dashboard.bulk_operations (
    id,
    operation_type,
    target_entity,
    target_ids,
    target_count,
    completed_count,
    failed_count,
    status,
    error_details,
    started_by,
    started_at,
    completed_at,
    result
) VALUES (
    'a0000000-0000-0000-0000-000000000003',
    'activate_users',
    'users',
    ARRAY['d0000000-0000-0000-0000-000000000001'::UUID, 'd0000000-0000-0000-0000-000000000002'::UUID, 'd0000000-0000-0000-0000-000000000003'::UUID, 'd0000000-0000-0000-0000-000000000004'::UUID, 'd0000000-0000-0000-0000-000000000005'::UUID],
    5,
    0,
    0,
    'pending',
    '[]'::jsonb,
    (SELECT id FROM auth.users WHERE email LIKE '%admin%' LIMIT 1),
    gamilit.now_mexico(),
    NULL,
    NULL
)
ON CONFLICT (id) DO NOTHING;

-- Mensaje de confirmacion
DO $$
BEGIN
    RAISE NOTICE 'Seed bulk_operations: 3 registros de ejemplo insertados';
END $$;
