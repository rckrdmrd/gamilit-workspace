-- =====================================================
-- SCRIPT DE EMERGENCIA: CREAR USUARIOS DE TESTING
-- =====================================================
-- Fecha: 2025-11-11
-- Updated: 2026-02-21 (Replaced placeholder UUIDs with gen_random_uuid() + dynamic lookups)
-- Proposito: Crear usuarios de testing manualmente
-- Usuarios: admin@gamilit.com, teacher@gamilit.com, student@gamilit.com
-- Password: Test1234 (para todos)
-- =====================================================

-- Habilitar extension pgcrypto si no esta habilitada
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- SINGLE DO BLOCK: Create all testing users + profiles + gamification
-- Uses gen_random_uuid() for all IDs and dynamic lookups for tenant
-- =====================================================

DO $$
DECLARE
    default_tenant_id UUID;
    v_admin_user_id UUID;
    v_teacher_user_id UUID;
    v_student_user_id UUID;
    v_admin_profile_id UUID;
    v_teacher_profile_id UUID;
    v_student_profile_id UUID;
    users_count INTEGER;
    profiles_count INTEGER;
    stats_count INTEGER;
    ranks_count INTEGER;
BEGIN
    -- =====================================================
    -- STEP 0: Resolve or create default tenant
    -- =====================================================
    SELECT id INTO default_tenant_id
    FROM auth_management.tenants
    WHERE name = 'GAMILIT Platform'
    LIMIT 1;

    IF default_tenant_id IS NULL THEN
        INSERT INTO auth_management.tenants (
            id, name, slug, status, settings, created_at, updated_at
        ) VALUES (
            gen_random_uuid(),
            'GAMILIT Platform',
            'gamilit-platform',
            'active',
            '{}'::jsonb,
            NOW(),
            NOW()
        )
        ON CONFLICT (slug) DO NOTHING
        RETURNING id INTO default_tenant_id;

        -- If ON CONFLICT hit, fetch the existing one
        IF default_tenant_id IS NULL THEN
            SELECT id INTO default_tenant_id
            FROM auth_management.tenants
            WHERE slug = 'gamilit-platform'
            LIMIT 1;
        END IF;
    END IF;

    IF default_tenant_id IS NULL THEN
        RAISE EXCEPTION 'Could not resolve or create default tenant';
    END IF;

    RAISE NOTICE 'Tenant ID: %', default_tenant_id;

    -- =====================================================
    -- STEP 1: Create users in auth.users
    -- =====================================================
    -- Use gen_random_uuid() for new users; ON CONFLICT (email) updates existing
    -- After upsert, resolve the actual user_id by email

    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, gamilit_role,
        created_at, updated_at,
        confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
        gen_random_uuid(), gen_random_uuid(),
        'admin@gamilit.com',
        crypt('Test1234', gen_salt('bf', 10)),
        NOW(),
        jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
        jsonb_build_object('name', 'Admin GAMILIT', 'role', 'super_admin'),
        'super_admin'::auth_management.gamilit_role,
        NOW(), NOW(), '', '', '', ''
    )
    ON CONFLICT (email) DO UPDATE SET
        encrypted_password = EXCLUDED.encrypted_password,
        gamilit_role = EXCLUDED.gamilit_role,
        updated_at = NOW();

    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, gamilit_role,
        created_at, updated_at,
        confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
        gen_random_uuid(), gen_random_uuid(),
        'teacher@gamilit.com',
        crypt('Test1234', gen_salt('bf', 10)),
        NOW(),
        jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
        jsonb_build_object('name', 'Profesor Testing', 'role', 'teacher'),
        'teacher'::auth_management.gamilit_role,
        NOW(), NOW(), '', '', '', ''
    )
    ON CONFLICT (email) DO UPDATE SET
        encrypted_password = EXCLUDED.encrypted_password,
        gamilit_role = EXCLUDED.gamilit_role,
        updated_at = NOW();

    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, gamilit_role,
        created_at, updated_at,
        confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
        gen_random_uuid(), gen_random_uuid(),
        'student@gamilit.com',
        crypt('Test1234', gen_salt('bf', 10)),
        NOW(),
        jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
        jsonb_build_object('name', 'Estudiante Testing', 'role', 'student'),
        'student'::auth_management.gamilit_role,
        NOW(), NOW(), '', '', '', ''
    )
    ON CONFLICT (email) DO UPDATE SET
        encrypted_password = EXCLUDED.encrypted_password,
        gamilit_role = EXCLUDED.gamilit_role,
        updated_at = NOW();

    -- Resolve actual user IDs by email
    SELECT id INTO v_admin_user_id FROM auth.users WHERE email = 'admin@gamilit.com';
    SELECT id INTO v_teacher_user_id FROM auth.users WHERE email = 'teacher@gamilit.com';
    SELECT id INTO v_student_user_id FROM auth.users WHERE email = 'student@gamilit.com';

    -- =====================================================
    -- STEP 2: Create profiles in auth_management.profiles
    -- =====================================================

    INSERT INTO auth_management.profiles (
        id, user_id, tenant_id, email, full_name, first_name, last_name,
        role, status, email_verified, preferences, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), v_admin_user_id, default_tenant_id,
        'admin@gamilit.com', 'Admin GAMILIT', 'Admin', 'GAMILIT',
        'super_admin'::auth_management.gamilit_role,
        'active'::auth_management.user_status,
        true,
        jsonb_build_object(
            'theme', 'detective', 'language', 'es',
            'timezone', 'America/Mexico_City',
            'sound_enabled', true, 'notifications_enabled', true
        ),
        NOW(), NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        updated_at = NOW();

    INSERT INTO auth_management.profiles (
        id, user_id, tenant_id, email, full_name, first_name, last_name,
        role, status, email_verified, preferences, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), v_teacher_user_id, default_tenant_id,
        'teacher@gamilit.com', 'Profesor Testing', 'Profesor', 'Testing',
        'teacher'::auth_management.gamilit_role,
        'active'::auth_management.user_status,
        true,
        jsonb_build_object(
            'theme', 'detective', 'language', 'es',
            'timezone', 'America/Mexico_City',
            'sound_enabled', true, 'notifications_enabled', true
        ),
        NOW(), NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        updated_at = NOW();

    INSERT INTO auth_management.profiles (
        id, user_id, tenant_id, email, full_name, first_name, last_name,
        role, status, email_verified, preferences, created_at, updated_at
    ) VALUES (
        gen_random_uuid(), v_student_user_id, default_tenant_id,
        'student@gamilit.com', 'Estudiante Testing', 'Estudiante', 'Testing',
        'student'::auth_management.gamilit_role,
        'active'::auth_management.user_status,
        true,
        jsonb_build_object(
            'theme', 'detective', 'language', 'es',
            'timezone', 'America/Mexico_City',
            'sound_enabled', true, 'notifications_enabled', true,
            'grade_level', '5'
        ),
        NOW(), NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        updated_at = NOW();

    -- =====================================================
    -- STEP 3: Initialize user_stats (gamification)
    -- =====================================================
    -- Note: The trigger trg_initialize_user_stats should do this automatically
    -- but we add it manually as a safety net

    INSERT INTO gamification_system.user_stats (
        id, user_id, tenant_id, level, total_xp, xp_to_next_level,
        current_rank, ml_coins, ml_coins_earned_total, created_at, updated_at
    ) VALUES
    (gen_random_uuid(), v_admin_user_id, default_tenant_id,
     1, 0, 100, 'Ajaw'::gamification_system.maya_rank, 100, 100, NOW(), NOW()),
    (gen_random_uuid(), v_teacher_user_id, default_tenant_id,
     1, 0, 100, 'Ajaw'::gamification_system.maya_rank, 100, 100, NOW(), NOW()),
    (gen_random_uuid(), v_student_user_id, default_tenant_id,
     1, 0, 100, 'Ajaw'::gamification_system.maya_rank, 100, 100, NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET
        updated_at = NOW();

    -- =====================================================
    -- STEP 4: Initialize user_ranks (gamification)
    -- =====================================================

    INSERT INTO gamification_system.user_ranks (
        id, user_id, tenant_id, current_rank, previous_rank,
        rank_progress_percentage, is_current, achieved_at, created_at, updated_at
    ) VALUES
    (gen_random_uuid(), v_admin_user_id, default_tenant_id,
     'Ajaw'::gamification_system.maya_rank, NULL, 0, true,
     gamilit.now_mexico(), gamilit.now_mexico(), gamilit.now_mexico()),
    (gen_random_uuid(), v_teacher_user_id, default_tenant_id,
     'Ajaw'::gamification_system.maya_rank, NULL, 0, true,
     gamilit.now_mexico(), gamilit.now_mexico(), gamilit.now_mexico()),
    (gen_random_uuid(), v_student_user_id, default_tenant_id,
     'Ajaw'::gamification_system.maya_rank, NULL, 0, true,
     gamilit.now_mexico(), gamilit.now_mexico(), gamilit.now_mexico())
    ON CONFLICT (user_id) DO UPDATE SET
        current_rank = EXCLUDED.current_rank,
        is_current = EXCLUDED.is_current,
        updated_at = gamilit.now_mexico();

    -- =====================================================
    -- VERIFICATION
    -- =====================================================

    SELECT COUNT(*) INTO users_count FROM auth.users
    WHERE email IN ('admin@gamilit.com', 'teacher@gamilit.com', 'student@gamilit.com');

    SELECT COUNT(*) INTO profiles_count FROM auth_management.profiles
    WHERE email IN ('admin@gamilit.com', 'teacher@gamilit.com', 'student@gamilit.com');

    SELECT COUNT(*) INTO stats_count FROM gamification_system.user_stats
    WHERE user_id IN (v_admin_user_id, v_teacher_user_id, v_student_user_id);

    SELECT COUNT(*) INTO ranks_count FROM gamification_system.user_ranks
    WHERE user_id IN (v_admin_user_id, v_teacher_user_id, v_student_user_id);

    RAISE NOTICE '========================================';
    RAISE NOTICE 'USUARIOS DE TESTING CREADOS';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'auth.users: % usuarios', users_count;
    RAISE NOTICE 'auth_management.profiles: % profiles', profiles_count;
    RAISE NOTICE 'gamification_system.user_stats: % stats', stats_count;
    RAISE NOTICE 'gamification_system.user_ranks: % ranks', ranks_count;
    RAISE NOTICE '========================================';

    IF users_count = 3 AND profiles_count = 3 AND stats_count = 3 AND ranks_count = 3 THEN
        RAISE NOTICE 'TODOS LOS USUARIOS CREADOS EXITOSAMENTE';
        RAISE NOTICE '';
        RAISE NOTICE 'Credenciales de testing:';
        RAISE NOTICE '  - admin@gamilit.com / Test1234';
        RAISE NOTICE '  - teacher@gamilit.com / Test1234';
        RAISE NOTICE '  - student@gamilit.com / Test1234';
    ELSE
        RAISE WARNING 'ALGUNOS USUARIOS NO SE CREARON CORRECTAMENTE';
        RAISE WARNING 'Esperado: 3 users, 3 profiles, 3 stats, 3 ranks';
        RAISE WARNING 'Creado: % users, % profiles, % stats, % ranks',
            users_count, profiles_count, stats_count, ranks_count;
    END IF;
END $$;

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================
