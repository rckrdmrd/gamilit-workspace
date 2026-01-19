-- =====================================================
-- Seed: auth_management.user_roles (DEV)
-- Description: Asignación de roles a usuarios de prueba
-- Environment: DEVELOPMENT
-- Dependencies: auth_management.profiles, auth_management.tenants
-- Order: 04
-- Validated: 2025-11-02
-- Updated: 2026-01-18 (FIX-UUID-001: Cambiar tenant_id hardcoded por búsqueda dinámica)
-- Score: 100/100
-- =====================================================

SET search_path TO auth_management, public;

-- =====================================================
-- INSERT: User Role Assignments
-- FIX-UUID-001: Usar tenant_id dinámico en lugar de UUID sintético
-- =====================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_admin_user_id UUID;
BEGIN
    -- Buscar el tenant principal de GAMILIT
    SELECT id INTO v_tenant_id
    FROM auth_management.tenants
    WHERE name = 'GAMILIT Platform'
    LIMIT 1;

    IF v_tenant_id IS NULL THEN
        -- Fallback al UUID conocido si existe
        v_tenant_id := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid;
        RAISE WARNING 'Tenant GAMILIT Platform no encontrado, usando UUID fallback: %', v_tenant_id;
    ELSE
        RAISE NOTICE 'Usando tenant_id: %', v_tenant_id;
    END IF;

    -- Obtener admin user para assigned_by
    SELECT id INTO v_admin_user_id
    FROM auth.users
    WHERE email = 'admin@glit.edu.mx'
    LIMIT 1;

    -- Student 1 Role
    INSERT INTO auth_management.user_roles (
        id, user_id, tenant_id, role, permissions, assigned_by,
        assigned_at, expires_at, revoked_by, revoked_at, is_active,
        metadata, created_at, updated_at
    )
    SELECT
        gen_random_uuid(),
        u.id,
        v_tenant_id,
        'student'::public.gamilit_role,
        '{"read": true, "write": false, "admin": false, "analytics": false, "can_view_own_progress": true, "can_submit_assignments": true, "can_participate_challenges": true}'::jsonb,
        v_admin_user_id,
        gamilit.now_mexico(),
        NULL, NULL, NULL, true,
        '{"test_role": true, "environment": "development", "assigned_by_name": "Admin Gamilit"}'::jsonb,
        gamilit.now_mexico(),
        gamilit.now_mexico()
    FROM auth.users u
    WHERE u.email = 'estudiante1@demo.glit.edu.mx'
    ON CONFLICT (user_id, tenant_id, role) DO UPDATE SET
        permissions = EXCLUDED.permissions,
        assigned_by = EXCLUDED.assigned_by,
        is_active = EXCLUDED.is_active,
        metadata = EXCLUDED.metadata,
        updated_at = gamilit.now_mexico();

    -- Student 2 Role
    INSERT INTO auth_management.user_roles (
        id, user_id, tenant_id, role, permissions, assigned_by,
        assigned_at, expires_at, revoked_by, revoked_at, is_active,
        metadata, created_at, updated_at
    )
    SELECT
        gen_random_uuid(),
        u.id,
        v_tenant_id,
        'student'::public.gamilit_role,
        '{"read": true, "write": false, "admin": false, "analytics": false, "can_view_own_progress": true, "can_submit_assignments": true, "can_participate_challenges": true}'::jsonb,
        v_admin_user_id,
        gamilit.now_mexico(),
        NULL, NULL, NULL, true,
        '{"test_role": true, "environment": "development"}'::jsonb,
        gamilit.now_mexico(),
        gamilit.now_mexico()
    FROM auth.users u
    WHERE u.email = 'estudiante2@demo.glit.edu.mx'
    ON CONFLICT (user_id, tenant_id, role) DO UPDATE SET
        permissions = EXCLUDED.permissions,
        assigned_by = EXCLUDED.assigned_by,
        is_active = EXCLUDED.is_active,
        metadata = EXCLUDED.metadata,
        updated_at = gamilit.now_mexico();

    -- Student 3 Role
    INSERT INTO auth_management.user_roles (
        id, user_id, tenant_id, role, permissions, assigned_by,
        assigned_at, expires_at, revoked_by, revoked_at, is_active,
        metadata, created_at, updated_at
    )
    SELECT
        gen_random_uuid(),
        u.id,
        v_tenant_id,
        'student'::public.gamilit_role,
        '{"read": true, "write": false, "admin": false, "analytics": false, "can_view_own_progress": true, "can_submit_assignments": true, "can_participate_challenges": true}'::jsonb,
        v_admin_user_id,
        gamilit.now_mexico(),
        NULL, NULL, NULL, true,
        '{"test_role": true, "environment": "development"}'::jsonb,
        gamilit.now_mexico(),
        gamilit.now_mexico()
    FROM auth.users u
    WHERE u.email = 'estudiante3@demo.glit.edu.mx'
    ON CONFLICT (user_id, tenant_id, role) DO UPDATE SET
        permissions = EXCLUDED.permissions,
        assigned_by = EXCLUDED.assigned_by,
        is_active = EXCLUDED.is_active,
        metadata = EXCLUDED.metadata,
        updated_at = gamilit.now_mexico();

    -- Teacher Role
    INSERT INTO auth_management.user_roles (
        id, user_id, tenant_id, role, permissions, assigned_by,
        assigned_at, expires_at, revoked_by, revoked_at, is_active,
        metadata, created_at, updated_at
    )
    SELECT
        gen_random_uuid(),
        u.id,
        v_tenant_id,
        'admin_teacher'::public.gamilit_role,
        '{"read": true, "write": true, "admin": false, "analytics": true, "can_manage_students": true, "can_create_assignments": true, "can_grade_submissions": true, "can_view_class_analytics": true, "can_manage_content": true}'::jsonb,
        v_admin_user_id,
        gamilit.now_mexico(),
        NULL, NULL, NULL, true,
        '{"test_role": true, "environment": "development", "assigned_by_name": "Admin Gamilit"}'::jsonb,
        gamilit.now_mexico(),
        gamilit.now_mexico()
    FROM auth.users u
    WHERE u.email = 'instructor@demo.glit.edu.mx'
    ON CONFLICT (user_id, tenant_id, role) DO UPDATE SET
        permissions = EXCLUDED.permissions,
        assigned_by = EXCLUDED.assigned_by,
        is_active = EXCLUDED.is_active,
        metadata = EXCLUDED.metadata,
        updated_at = gamilit.now_mexico();

    -- Admin Role
    INSERT INTO auth_management.user_roles (
        id, user_id, tenant_id, role, permissions, assigned_by,
        assigned_at, expires_at, revoked_by, revoked_at, is_active,
        metadata, created_at, updated_at
    )
    SELECT
        gen_random_uuid(),
        u.id,
        v_tenant_id,
        'super_admin'::public.gamilit_role,
        '{"read": true, "write": true, "admin": true, "analytics": true, "can_manage_all": true, "can_manage_users": true, "can_manage_tenants": true, "can_manage_system_settings": true, "can_view_all_analytics": true, "can_manage_roles": true}'::jsonb,
        NULL,
        gamilit.now_mexico(),
        NULL, NULL, NULL, true,
        '{"test_role": true, "environment": "development", "note": "Self-assigned admin role"}'::jsonb,
        gamilit.now_mexico(),
        gamilit.now_mexico()
    FROM auth.users u
    WHERE u.email = 'admin@glit.edu.mx'
    ON CONFLICT (user_id, tenant_id, role) DO UPDATE SET
        permissions = EXCLUDED.permissions,
        assigned_by = EXCLUDED.assigned_by,
        is_active = EXCLUDED.is_active,
        metadata = EXCLUDED.metadata,
        updated_at = gamilit.now_mexico();

    RAISE NOTICE 'User roles insertados con tenant_id: %', v_tenant_id;
END $$;

-- =====================================================
-- Verification Query
-- =====================================================

DO $$
DECLARE
    role_count INTEGER;
    active_count INTEGER;
    student_roles INTEGER;
    teacher_roles INTEGER;
    admin_roles INTEGER;
BEGIN
    SELECT COUNT(*) INTO role_count FROM auth_management.user_roles;
    SELECT COUNT(*) INTO active_count FROM auth_management.user_roles WHERE is_active = true;
    SELECT COUNT(*) INTO student_roles FROM auth_management.user_roles WHERE role = 'student';
    SELECT COUNT(*) INTO teacher_roles FROM auth_management.user_roles WHERE role = 'admin_teacher';
    SELECT COUNT(*) INTO admin_roles FROM auth_management.user_roles WHERE role = 'super_admin';

    RAISE NOTICE '==============================================';
    RAISE NOTICE '✓ User roles asignados correctamente';
    RAISE NOTICE '  Total: % roles', role_count;
    RAISE NOTICE '  Activos: %', active_count;
    RAISE NOTICE '  Estudiantes: %', student_roles;
    RAISE NOTICE '  Profesores: %', teacher_roles;
    RAISE NOTICE '  Admins: %', admin_roles;
    RAISE NOTICE '==============================================';
END $$;
