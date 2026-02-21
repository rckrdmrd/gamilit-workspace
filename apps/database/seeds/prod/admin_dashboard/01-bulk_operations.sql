-- =====================================================
-- Seed: bulk_operations (PROD)
-- Schema: admin_dashboard
-- Descripcion: Datos iniciales para operaciones bulk
-- Relacionado: EXT-002 (Admin Extendido), AUDIT-003
-- Fecha: 2026-01-04
-- Updated: 2026-02-20 (Wrapped in DO block with graceful skip)
-- =====================================================

-- NOTA: Este seed crea registros de ejemplo para el portal admin.
-- En produccion, nuevos registros se crean dinamicamente via API.

DO $$
DECLARE
    v_admin_profile_id UUID;
    v_target1 UUID := gen_random_uuid();
    v_target2 UUID := gen_random_uuid();
    v_target3 UUID := gen_random_uuid();
    v_target4 UUID := gen_random_uuid();
    v_target5 UUID := gen_random_uuid();
    v_target6 UUID := gen_random_uuid();
    v_target7 UUID := gen_random_uuid();
BEGIN
    -- Dynamic admin profile lookup
    SELECT p.id INTO v_admin_profile_id
    FROM auth.users u
    JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'admin@gamilit.com'
    LIMIT 1;

    -- Fallback: any admin profile
    IF v_admin_profile_id IS NULL THEN
        SELECT p.id INTO v_admin_profile_id
        FROM auth.users u
        JOIN auth_management.profiles p ON p.user_id = u.id
        WHERE u.email LIKE '%admin%'
        LIMIT 1;
    END IF;

    IF v_admin_profile_id IS NULL THEN
        RAISE NOTICE 'Skipping bulk_operations seed: no admin profile found';
        RETURN;
    END IF;

    -- Idempotency guard: skip if seed data already exists
    IF EXISTS (SELECT 1 FROM admin_dashboard.bulk_operations LIMIT 1) THEN
        RAISE NOTICE 'bulk_operations seed data already exists, skipping insert';
        RETURN;
    END IF;

    -- Operacion bulk completada (historica)
    INSERT INTO admin_dashboard.bulk_operations (
        id, operation_type, target_entity, target_ids, target_count,
        completed_count, failed_count, status, error_details,
        started_by, started_at, completed_at, result
    ) VALUES (
        gen_random_uuid(),
        'suspend_users', 'users',
        ARRAY[v_target1, v_target2, v_target3],
        3, 3, 0, 'completed', '[]'::jsonb,
        v_admin_profile_id,
        gamilit.now_mexico() - INTERVAL '7 days',
        gamilit.now_mexico() - INTERVAL '7 days' + INTERVAL '5 seconds',
        '{"message": "3 usuarios suspendidos exitosamente", "affected_roles": ["student"]}'::jsonb
    );

    -- Operacion bulk con errores parciales
    INSERT INTO admin_dashboard.bulk_operations (
        id, operation_type, target_entity, target_ids, target_count,
        completed_count, failed_count, status, error_details,
        started_by, started_at, completed_at, result
    ) VALUES (
        gen_random_uuid(),
        'update_role', 'users',
        ARRAY[v_target4, v_target5],
        2, 1, 1, 'completed',
        jsonb_build_array(jsonb_build_object('user_id', v_target5::text, 'error', 'Usuario no encontrado')),
        v_admin_profile_id,
        gamilit.now_mexico() - INTERVAL '3 days',
        gamilit.now_mexico() - INTERVAL '3 days' + INTERVAL '3 seconds',
        '{"message": "1 de 2 usuarios actualizados", "new_role": "teacher"}'::jsonb
    );

    -- Operacion bulk pendiente (en cola)
    INSERT INTO admin_dashboard.bulk_operations (
        id, operation_type, target_entity, target_ids, target_count,
        completed_count, failed_count, status, error_details,
        started_by, started_at, completed_at, result
    ) VALUES (
        gen_random_uuid(),
        'activate_users', 'users',
        ARRAY[v_target1, v_target2, v_target5, v_target6, v_target7],
        5, 0, 0, 'pending', '[]'::jsonb,
        v_admin_profile_id,
        gamilit.now_mexico(),
        NULL, NULL
    );

    RAISE NOTICE 'Seed bulk_operations: 3 registros insertados (admin=%)', v_admin_profile_id;
END $$;
