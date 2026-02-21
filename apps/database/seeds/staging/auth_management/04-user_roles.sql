-- =====================================================
-- Seed: auth_management.user_roles
-- Description: Asignaciones de roles a usuarios de prueba y demo
-- Priority: P0 - CRITICO (Auditoria AUDIT-DB-001)
-- Created: 2025-12-14
-- Version: 2.0 (dynamic lookups - no placeholder UUIDs)
-- =====================================================
--
-- Este seed asigna roles a los usuarios existentes en profiles.
-- Los roles definen los permisos y accesos del sistema.
--
-- Roles disponibles (ENUM gamilit_role):
-- - super_admin: Administrador global del sistema
-- - admin_teacher: Profesor con permisos administrativos
-- - teacher: Profesor estandar
-- - student: Estudiante
-- - parent: Padre de familia
-- =====================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_admin_id UUID;
    v_teacher_id UUID;
    v_student_id UUID;
BEGIN
    -- Obtener tenant principal (puede ser 'GAMILIT Platform' o 'GAMILIT Principal')
    SELECT id INTO v_tenant_id FROM auth_management.tenants
    WHERE name LIKE 'GAMILIT%' OR id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid
    LIMIT 1;

    IF v_tenant_id IS NULL THEN
        v_tenant_id := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid;
        RAISE NOTICE 'Usando tenant por defecto: %', v_tenant_id;
    END IF;

    -- Obtener IDs de usuarios de prueba via dynamic lookup (profile IDs)
    SELECT p.id INTO v_admin_id
    FROM auth.users u
    JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'admin@gamilit.com';

    IF v_admin_id IS NULL THEN
        RAISE NOTICE 'Profile for admin@gamilit.com not found, skipping user_roles seed';
        RETURN;
    END IF;

    SELECT p.id INTO v_teacher_id
    FROM auth.users u
    JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'teacher@gamilit.com';

    IF v_teacher_id IS NULL THEN
        RAISE NOTICE 'Profile for teacher@gamilit.com not found, skipping teacher role';
    END IF;

    SELECT p.id INTO v_student_id
    FROM auth.users u
    JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'student@gamilit.com';

    IF v_student_id IS NULL THEN
        RAISE NOTICE 'Profile for student@gamilit.com not found, skipping student role';
    END IF;

    RAISE NOTICE 'Asignando roles a usuarios de prueba...';

    -- =====================================================
    -- 1. ROL SUPER_ADMIN para admin@gamilit.com
    -- =====================================================
    INSERT INTO auth_management.user_roles (
        id,
        user_id,
        tenant_id,
        role,
        permissions,
        assigned_by,
        is_active,
        metadata
    ) VALUES (
        gen_random_uuid(),
        v_admin_id,
        v_tenant_id,
        'super_admin',
        '{
            "read": true,
            "write": true,
            "admin": true,
            "analytics": true,
            "manage_users": true,
            "manage_content": true,
            "manage_gamification": true,
            "system_config": true
        }'::jsonb,
        v_admin_id,
        true,
        '{"assigned_reason": "Usuario administrador del sistema", "seed_version": "2.0.0"}'::jsonb
    )
    ON CONFLICT (user_id, tenant_id, role) DO UPDATE SET
        permissions = EXCLUDED.permissions,
        is_active = true,
        updated_at = gamilit.now_mexico();

    RAISE NOTICE 'Rol super_admin asignado a admin@gamilit.com';

    -- =====================================================
    -- 2. ROL ADMIN_TEACHER para teacher@gamilit.com
    -- =====================================================
    IF v_teacher_id IS NOT NULL THEN
        INSERT INTO auth_management.user_roles (
            id,
            user_id,
            tenant_id,
            role,
            permissions,
            assigned_by,
            is_active,
            metadata
        ) VALUES (
            gen_random_uuid(),
            v_teacher_id,
            v_tenant_id,
            'admin_teacher',
            '{
                "read": true,
                "write": true,
                "admin": false,
                "analytics": true,
                "manage_students": true,
                "manage_classrooms": true,
                "create_content": true,
                "grade_assignments": true
            }'::jsonb,
            v_admin_id,
            true,
            '{"assigned_reason": "Profesor de prueba con permisos administrativos", "seed_version": "2.0.0"}'::jsonb
        )
        ON CONFLICT (user_id, tenant_id, role) DO UPDATE SET
            permissions = EXCLUDED.permissions,
            is_active = true,
            updated_at = gamilit.now_mexico();

        RAISE NOTICE 'Rol admin_teacher asignado a teacher@gamilit.com';
    END IF;

    -- =====================================================
    -- 3. ROL STUDENT para student@gamilit.com
    -- =====================================================
    IF v_student_id IS NOT NULL THEN
        INSERT INTO auth_management.user_roles (
            id,
            user_id,
            tenant_id,
            role,
            permissions,
            assigned_by,
            is_active,
            metadata
        ) VALUES (
            gen_random_uuid(),
            v_student_id,
            v_tenant_id,
            'student',
            '{
                "read": true,
                "write": false,
                "admin": false,
                "analytics": false,
                "view_own_progress": true,
                "submit_exercises": true,
                "participate_classrooms": true,
                "earn_achievements": true
            }'::jsonb,
            v_admin_id,
            true,
            '{"assigned_reason": "Estudiante de prueba", "seed_version": "2.0.0"}'::jsonb
        )
        ON CONFLICT (user_id, tenant_id, role) DO UPDATE SET
            permissions = EXCLUDED.permissions,
            is_active = true,
            updated_at = gamilit.now_mexico();

        RAISE NOTICE 'Rol student asignado a student@gamilit.com';
    END IF;

    -- =====================================================
    -- 4. ROLES PARA ESTUDIANTES DE PRODUCCION (5 usuarios con roles explicitos)
    -- Nota: Estos son usuarios REALES de produccion, no ficticios
    -- Sus profile IDs son reales (no placeholder)
    -- =====================================================

    -- Azul Valentina (blu3wt7@gmail.com) - student
    INSERT INTO auth_management.user_roles (
        id, user_id, tenant_id, role, permissions, assigned_by, is_active
    ) VALUES (
        gen_random_uuid(),
        '2f5a9846-3393-40b2-9e87-0f29238c383f'::uuid,
        v_tenant_id,
        'student',
        '{"read": true, "submit_exercises": true, "view_own_progress": true}'::jsonb,
        v_admin_id,
        true
    )
    ON CONFLICT (user_id, tenant_id, role) DO NOTHING;

    -- Benjamin Hernandez (hernandezfonsecabenjamin7@gmail.com) - student
    INSERT INTO auth_management.user_roles (
        id, user_id, tenant_id, role, permissions, assigned_by, is_active
    ) VALUES (
        gen_random_uuid(),
        '7a6a973e-83f7-4374-a9fc-54258138115f'::uuid,
        v_tenant_id,
        'student',
        '{"read": true, "submit_exercises": true, "view_own_progress": true}'::jsonb,
        v_admin_id,
        true
    )
    ON CONFLICT (user_id, tenant_id, role) DO NOTHING;

    -- Carlos Marban (marbancarlos916@gmail.com) - student
    INSERT INTO auth_management.user_roles (
        id, user_id, tenant_id, role, permissions, assigned_by, is_active
    ) VALUES (
        gen_random_uuid(),
        '00c742d9-e5f7-4666-9597-5a8ca54d5478'::uuid,
        v_tenant_id,
        'student',
        '{"read": true, "submit_exercises": true, "view_own_progress": true}'::jsonb,
        v_admin_id,
        true
    )
    ON CONFLICT (user_id, tenant_id, role) DO NOTHING;

    -- Diego Colores (diego.colores09@gmail.com) - student
    INSERT INTO auth_management.user_roles (
        id, user_id, tenant_id, role, permissions, assigned_by, is_active
    ) VALUES (
        gen_random_uuid(),
        '33306a65-a3b1-41d5-a49d-47989957b822'::uuid,
        v_tenant_id,
        'student',
        '{"read": true, "submit_exercises": true, "view_own_progress": true}'::jsonb,
        v_admin_id,
        true
    )
    ON CONFLICT (user_id, tenant_id, role) DO NOTHING;

    RAISE NOTICE 'Roles student asignados a estudiantes de produccion';

    -- =====================================================
    -- 5. ROL STUDENT para Fernando Barragan (estudiante prod)
    -- Nota: Corregido de admin_teacher a student (2025-12-28)
    -- UUID corresponde a barraganfer03@gmail.com
    -- Requisito: Solo 1 admin, 1 teacher, resto students
    -- =====================================================
    INSERT INTO auth_management.user_roles (
        id, user_id, tenant_id, role, permissions, assigned_by, is_active
    ) VALUES (
        gen_random_uuid(),
        '9951ad75-e9cb-47b3-b478-6bb860ee2530'::uuid,
        v_tenant_id,
        'student',
        '{"read": true, "submit_exercises": true, "view_own_progress": true}'::jsonb,
        v_admin_id,
        true
    )
    ON CONFLICT (user_id, tenant_id, role) DO NOTHING;

    RAISE NOTICE 'Rol student asignado a Fernando Barragan';

    -- =====================================================
    -- VERIFICACION
    -- =====================================================
    RAISE NOTICE '';
    RAISE NOTICE '=== RESUMEN DE ROLES ASIGNADOS ===';
    RAISE NOTICE 'Total roles insertados: %', (SELECT COUNT(*) FROM auth_management.user_roles WHERE tenant_id = v_tenant_id);
    RAISE NOTICE 'Super Admins: %', (SELECT COUNT(*) FROM auth_management.user_roles WHERE role = 'super_admin' AND is_active = true);
    RAISE NOTICE 'Admin Teachers: %', (SELECT COUNT(*) FROM auth_management.user_roles WHERE role = 'admin_teacher' AND is_active = true);
    RAISE NOTICE 'Students: %', (SELECT COUNT(*) FROM auth_management.user_roles WHERE role = 'student' AND is_active = true);

END $$;

-- =====================================================
-- VERIFICACION FINAL
-- =====================================================
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM auth_management.user_roles) < 3 THEN
        RAISE WARNING 'Se esperaban al menos 3 registros en user_roles';
    ELSE
        RAISE NOTICE 'Seed de user_roles completado exitosamente';
    END IF;
END $$;

-- =====================================================
-- CHANGELOG
-- =====================================================
-- v2.0 (2026-02-21): ELIMINACION DE UUIDs PLACEHOLDER
--   - Reemplazados v_admin_id/v_teacher_id/v_student_id de hardcoded
--     (aaaa, bbbb, cccc) a dynamic lookups via email -> profile JOIN
--   - Reemplazados role id (10000001-... pattern) con gen_random_uuid()
--   - Usuarios de produccion (UUIDs reales) preservados sin cambios
--   - Graceful skip si profiles no encontrados
--
-- v1.0 (2025-12-14): Version original con UUIDs placeholder
-- =====================================================
