-- =====================================================
-- Seed: auth_management.user_roles
-- Description: Asignaciones de roles a usuarios de prueba y demo
-- Priority: P0 - CRÍTICO (Auditoría AUDIT-DB-001)
-- Created: 2025-12-14
-- =====================================================
--
-- Este seed asigna roles a los usuarios existentes en profiles.
-- Los roles definen los permisos y accesos del sistema.
--
-- Roles disponibles (ENUM gamilit_role):
-- - super_admin: Administrador global del sistema
-- - admin_teacher: Profesor con permisos administrativos
-- - teacher: Profesor estándar
-- - student: Estudiante
-- - parent: Padre de familia
-- =====================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_admin_id UUID;
    v_teacher_id UUID;
    v_student_id UUID;
    v_assigned_by UUID;
BEGIN
    -- Obtener tenant principal (puede ser 'GAMILIT Platform' o 'GAMILIT Principal')
    SELECT id INTO v_tenant_id FROM auth_management.tenants
    WHERE name LIKE 'GAMILIT%' OR id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid
    LIMIT 1;

    IF v_tenant_id IS NULL THEN
        -- Usar UUID por defecto si no se encuentra
        v_tenant_id := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid;
        RAISE NOTICE 'Usando tenant por defecto: %', v_tenant_id;
    END IF;

    -- Resolver IDs reales por email para evitar dependencia de UUIDs legacy
    SELECT id INTO v_admin_id
    FROM auth_management.profiles
    WHERE email = 'admin@gamilit.com'
    LIMIT 1;

    SELECT id INTO v_teacher_id
    FROM auth_management.profiles
    WHERE email = 'teacher@gamilit.com'
    LIMIT 1;

    SELECT id INTO v_student_id
    FROM auth_management.profiles
    WHERE email = 'student@gamilit.com'
    LIMIT 1;

    v_assigned_by := COALESCE(v_admin_id, v_teacher_id, v_student_id);
    IF v_assigned_by IS NULL THEN
        SELECT id INTO v_assigned_by
        FROM auth_management.profiles
        ORDER BY created_at ASC
        LIMIT 1;
    END IF;

    RAISE NOTICE 'Asignando roles a usuarios de prueba...';

    -- =====================================================
    -- 1. ROL SUPER_ADMIN para admin@gamilit.com
    -- =====================================================
    IF v_admin_id IS NOT NULL THEN
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
            '10000001-0000-0000-0000-000000000001'::uuid,
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
            '{"assigned_reason": "Usuario administrador del sistema", "seed_version": "1.0.0"}'::jsonb
        )
        ON CONFLICT (user_id, tenant_id, role) DO UPDATE SET
            permissions = EXCLUDED.permissions,
            is_active = true,
            updated_at = gamilit.now_mexico();

        RAISE NOTICE '✅ Rol super_admin asignado a admin@gamilit.com';
    ELSE
        RAISE NOTICE '⚠ admin@gamilit.com no encontrado, se omite rol super_admin';
    END IF;

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
            '10000002-0000-0000-0000-000000000001'::uuid,
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
            COALESCE(v_admin_id, v_teacher_id),
            true,
            '{"assigned_reason": "Profesor de prueba con permisos administrativos", "seed_version": "1.0.0"}'::jsonb
        )
        ON CONFLICT (user_id, tenant_id, role) DO UPDATE SET
            permissions = EXCLUDED.permissions,
            is_active = true,
            updated_at = gamilit.now_mexico();

        RAISE NOTICE '✅ Rol admin_teacher asignado a teacher@gamilit.com';
    ELSE
        RAISE NOTICE '⚠ teacher@gamilit.com no encontrado, se omite rol admin_teacher';
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
            '10000003-0000-0000-0000-000000000001'::uuid,
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
            COALESCE(v_admin_id, v_student_id),
            true,
            '{"assigned_reason": "Estudiante de prueba", "seed_version": "1.0.0"}'::jsonb
        )
        ON CONFLICT (user_id, tenant_id, role) DO UPDATE SET
            permissions = EXCLUDED.permissions,
            is_active = true,
            updated_at = gamilit.now_mexico();

        RAISE NOTICE '✅ Rol student asignado a student@gamilit.com';
    ELSE
        RAISE NOTICE '⚠ student@gamilit.com no encontrado, se omite rol student';
    END IF;

    -- =====================================================
    -- 4. ROLES PARA ESTUDIANTES DE PRODUCCION (5 usuarios con roles explícitos)
    -- Nota: Estos son usuarios REALES de producción, no ficticios
    -- =====================================================

    -- Azul Valentina (blu3wt7@gmail.com) - student
    INSERT INTO auth_management.user_roles (
        id, user_id, tenant_id, role, permissions, assigned_by, is_active
    )
    SELECT
        '10000004-0000-0000-0000-000000000001'::uuid,
        '2f5a9846-3393-40b2-9e87-0f29238c383f'::uuid,
        v_tenant_id,
        'student',
        '{"read": true, "submit_exercises": true, "view_own_progress": true}'::jsonb,
        COALESCE(v_admin_id, v_assigned_by),
        true
    WHERE EXISTS (
        SELECT 1
        FROM auth_management.profiles p
        WHERE p.id = '2f5a9846-3393-40b2-9e87-0f29238c383f'::uuid
    )
    ON CONFLICT (user_id, tenant_id, role) DO NOTHING;

    -- Benjamin Hernandez (hernandezfonsecabenjamin7@gmail.com) - student
    INSERT INTO auth_management.user_roles (
        id, user_id, tenant_id, role, permissions, assigned_by, is_active
    )
    SELECT
        '10000005-0000-0000-0000-000000000001'::uuid,
        '7a6a973e-83f7-4374-a9fc-54258138115f'::uuid,
        v_tenant_id,
        'student',
        '{"read": true, "submit_exercises": true, "view_own_progress": true}'::jsonb,
        COALESCE(v_admin_id, v_assigned_by),
        true
    WHERE EXISTS (
        SELECT 1
        FROM auth_management.profiles p
        WHERE p.id = '7a6a973e-83f7-4374-a9fc-54258138115f'::uuid
    )
    ON CONFLICT (user_id, tenant_id, role) DO NOTHING;

    -- Carlos Marban (marbancarlos916@gmail.com) - student
    INSERT INTO auth_management.user_roles (
        id, user_id, tenant_id, role, permissions, assigned_by, is_active
    )
    SELECT
        '10000006-0000-0000-0000-000000000001'::uuid,
        '00c742d9-e5f7-4666-9597-5a8ca54d5478'::uuid,
        v_tenant_id,
        'student',
        '{"read": true, "submit_exercises": true, "view_own_progress": true}'::jsonb,
        COALESCE(v_admin_id, v_assigned_by),
        true
    WHERE EXISTS (
        SELECT 1
        FROM auth_management.profiles p
        WHERE p.id = '00c742d9-e5f7-4666-9597-5a8ca54d5478'::uuid
    )
    ON CONFLICT (user_id, tenant_id, role) DO NOTHING;

    -- Diego Colores (diego.colores09@gmail.com) - student
    INSERT INTO auth_management.user_roles (
        id, user_id, tenant_id, role, permissions, assigned_by, is_active
    )
    SELECT
        '10000007-0000-0000-0000-000000000001'::uuid,
        '33306a65-a3b1-41d5-a49d-47989957b822'::uuid,
        v_tenant_id,
        'student',
        '{"read": true, "submit_exercises": true, "view_own_progress": true}'::jsonb,
        COALESCE(v_admin_id, v_assigned_by),
        true
    WHERE EXISTS (
        SELECT 1
        FROM auth_management.profiles p
        WHERE p.id = '33306a65-a3b1-41d5-a49d-47989957b822'::uuid
    )
    ON CONFLICT (user_id, tenant_id, role) DO NOTHING;

    RAISE NOTICE '✅ Roles student asignados a estudiantes de producción';

    -- =====================================================
    -- 5. ROL STUDENT para Fernando Barragan (estudiante prod)
    -- Nota: Corregido de admin_teacher a student (2025-12-28)
    -- UUID corresponde a barraganfer03@gmail.com
    -- Requisito: Solo 1 admin, 1 teacher, resto students
    -- =====================================================
    INSERT INTO auth_management.user_roles (
        id, user_id, tenant_id, role, permissions, assigned_by, is_active
    )
    SELECT
        '10000008-0000-0000-0000-000000000001'::uuid,
        '9951ad75-e9cb-47b3-b478-6bb860ee2530'::uuid,
        v_tenant_id,
        'student',
        '{"read": true, "submit_exercises": true, "view_own_progress": true}'::jsonb,
        COALESCE(v_admin_id, v_assigned_by),
        true
    WHERE EXISTS (
        SELECT 1
        FROM auth_management.profiles p
        WHERE p.id = '9951ad75-e9cb-47b3-b478-6bb860ee2530'::uuid
    )
    ON CONFLICT (user_id, tenant_id, role) DO NOTHING;

    RAISE NOTICE '✅ Rol student asignado a Fernando Barragan';

    -- =====================================================
    -- VERIFICACIÓN
    -- =====================================================
    RAISE NOTICE '';
    RAISE NOTICE '=== RESUMEN DE ROLES ASIGNADOS ===';
    RAISE NOTICE 'Total roles insertados: %', (SELECT COUNT(*) FROM auth_management.user_roles WHERE tenant_id = v_tenant_id);
    RAISE NOTICE 'Super Admins: %', (SELECT COUNT(*) FROM auth_management.user_roles WHERE role = 'super_admin' AND is_active = true);
    RAISE NOTICE 'Admin Teachers: %', (SELECT COUNT(*) FROM auth_management.user_roles WHERE role = 'admin_teacher' AND is_active = true);
    RAISE NOTICE 'Students: %', (SELECT COUNT(*) FROM auth_management.user_roles WHERE role = 'student' AND is_active = true);

END $$;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
DO $$
BEGIN
    IF (SELECT COUNT(*) FROM auth_management.user_roles) < 3 THEN
        RAISE WARNING '⚠️ Se esperaban al menos 3 registros en user_roles';
    ELSE
        RAISE NOTICE '✅ Seed de user_roles completado exitosamente';
    END IF;
END $$;
