-- =====================================================
-- Seed Data: Test Users (DEV + STAGING)
-- =====================================================
-- Description: Usuarios de prueba con dominio @gamilit.com
-- Environment: DEVELOPMENT + STAGING (NO production)
-- Records: 3 usuarios (admin, teacher, student)
-- Date: 2025-11-04 (Updated)
-- Based on: ANALISIS-PRE-CORRECCIONES-BD-ORIGEN.md
-- Migration from: /home/isem/workspace/projects/glit/database
-- =====================================================

SET search_path TO auth, auth_management, public;

-- =====================================================
-- Passwords Reference (Plain Text - DO NOT COMMIT TO PROD)
-- =====================================================
-- ALL USERS: "Test1234"
-- Hash bcrypt (cost=10): $2b$10$pkqX0/v7H3F5TBTuDTaoYeBjH581pXpjlcNcYmMtXofd/2HjfTuga
-- =====================================================

-- =====================================================
-- STEP 1: Create users in auth.users
-- =====================================================
-- IMPORTANTE: UUIDs predecibles para consistencia con seeds PROD
-- Password: "Test1234" (bcrypt hasheado dinámicamente)
-- =====================================================
INSERT INTO auth.users (
    id,                      -- ✅ UUID predecible explícito
    email,
    encrypted_password,
    gamilit_role,            -- ✅ Cambiado de 'role' a 'gamilit_role'
    email_confirmed_at,
    raw_user_meta_data,
    status,
    created_at,
    updated_at
) VALUES
-- Admin de Prueba
(
    'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid,  -- ✅ UUID predecible
    'admin@gamilit.com',
    '$2b$10$pkqX0/v7H3F5TBTuDTaoYeBjH581pXpjlcNcYmMtXofd/2HjfTuga',  -- Password: Test1234
    'super_admin'::auth_management.gamilit_role,  -- ✅ Cast explícito al ENUM
    NOW(),
    '{"name": "Admin Gamilit", "description": "Usuario administrador de testing"}'::jsonb,
    'active',
    NOW(),
    NOW()
),

-- Maestro de Prueba
(
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid,  -- ✅ UUID predecible
    'teacher@gamilit.com',
    '$2b$10$pkqX0/v7H3F5TBTuDTaoYeBjH581pXpjlcNcYmMtXofd/2HjfTuga',  -- Password: Test1234
    'admin_teacher'::auth_management.gamilit_role,  -- ✅ Cast explícito al ENUM
    NOW(),
    '{"name": "Teacher Gamilit", "description": "Usuario maestro de testing"}'::jsonb,
    'active',
    NOW(),
    NOW()
),

-- Estudiante de Prueba
(
    'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid,  -- ✅ UUID predecible
    'student@gamilit.com',
    '$2b$10$pkqX0/v7H3F5TBTuDTaoYeBjH581pXpjlcNcYmMtXofd/2HjfTuga',  -- Password: Test1234
    'student'::auth_management.gamilit_role,  -- ✅ Cast explícito al ENUM
    NOW(),
    '{"name": "Student Gamilit", "description": "Usuario estudiante de testing"}'::jsonb,
    'active',
    NOW(),
    NOW()
)

ON CONFLICT (email) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password,
    gamilit_role = EXCLUDED.gamilit_role,
    email_confirmed_at = EXCLUDED.email_confirmed_at,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data,
    status = EXCLUDED.status,
    updated_at = NOW();

-- =====================================================
-- STEP 2: Create profiles in auth_management.profiles
-- =====================================================
-- IMPORTANTE: profiles.id = auth.users.id (unificación de IDs)
-- El trigger initialize_user_stats() se ejecutará automáticamente
-- =====================================================

INSERT INTO auth_management.profiles (
    id,                      -- ✅ profiles.id = auth.users.id (consistente)
    tenant_id,
    user_id,                 -- ✅ FK a auth.users.id
    email,
    display_name,
    full_name,
    role,
    status,
    email_verified,
    preferences,
    created_at,
    updated_at
)
SELECT
    u.id as id,              -- ✅ profiles.id = auth.users.id
    '00000000-0000-0000-0000-000000000001'::uuid as tenant_id,
    u.id as user_id,         -- ✅ user_id = auth.users.id
    u.email,
    CASE
        WHEN u.email = 'admin@gamilit.com' THEN 'Admin Gamilit'
        WHEN u.email = 'teacher@gamilit.com' THEN 'Teacher Gamilit'
        WHEN u.email = 'student@gamilit.com' THEN 'Student Gamilit'
    END as display_name,
    CASE
        WHEN u.email = 'admin@gamilit.com' THEN 'Administrator Gamilit'
        WHEN u.email = 'teacher@gamilit.com' THEN 'Teacher Gamilit'
        WHEN u.email = 'student@gamilit.com' THEN 'Student Gamilit'
    END as full_name,
    u.gamilit_role,
    'active'::auth_management.user_status as status,
    true as email_verified,
    jsonb_build_object(
        'theme', 'detective',
        'language', 'es',
        'timezone', 'America/Mexico_City',
        'sound_enabled', true,
        'notifications_enabled', true
    ) as preferences,
    NOW() as created_at,
    NOW() as updated_at
FROM auth.users u
WHERE u.email IN ('admin@gamilit.com', 'teacher@gamilit.com', 'student@gamilit.com')
ON CONFLICT (id) DO UPDATE SET
    status = 'active'::auth_management.user_status,
    email_verified = true,
    display_name = EXCLUDED.display_name,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role::auth_management.gamilit_role,
    preferences = EXCLUDED.preferences,
    updated_at = NOW();

-- =====================================================
-- Verification
-- =====================================================
DO $$
DECLARE
    test_users_count INT;
    test_profiles_count INT;
    active_profiles_count INT;
BEGIN
    -- Count users
    SELECT COUNT(*) INTO test_users_count
    FROM auth.users
    WHERE email LIKE '%@gamilit.com';

    -- Count profiles
    SELECT COUNT(*) INTO test_profiles_count
    FROM auth_management.profiles
    WHERE email LIKE '%@gamilit.com';

    -- Count active profiles
    SELECT COUNT(*) INTO active_profiles_count
    FROM auth_management.profiles
    WHERE email LIKE '%@gamilit.com' AND status = 'active';

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '  Test Users & Profiles Created';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Test users count:    %', test_users_count;
    RAISE NOTICE 'Test profiles count: %', test_profiles_count;
    RAISE NOTICE 'Active profiles:     %', active_profiles_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Credentials:';
    RAISE NOTICE '  admin@gamilit.com    | Test1234 | super_admin';
    RAISE NOTICE '  teacher@gamilit.com  | Test1234 | admin_teacher';
    RAISE NOTICE '  student@gamilit.com  | Test1234 | student';
    RAISE NOTICE '';
    RAISE NOTICE 'All users:';
    RAISE NOTICE '  ✓ Email confirmed (email_confirmed_at = NOW())';
    RAISE NOTICE '  ✓ Profile active (status = ''active'')';
    RAISE NOTICE '  ✓ Email verified (email_verified = true)';
    RAISE NOTICE '  ✓ Ready for immediate login';
    RAISE NOTICE '';
    RAISE NOTICE 'Tenant: Gamilit Test Organization';
    RAISE NOTICE '  ID: 00000000-0000-0000-0000-000000000001';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
END $$;

-- =====================================================
-- MIGRATION NOTES
-- =====================================================
-- Source: /home/isem/workspace/projects/glit/database/seed_data/04_demo_users_and_data_seed.sql
-- Changes from source:
-- 1. Domain changed: @glit.com → @gamilit.com (per user requirement)
-- 2. Password changed: Glit2024! → Test1234 (per user requirement)
-- 3. User count reduced: 10 → 3 (admin, teacher, student only)
-- 4. Email format simplified: student1@... → student@...
-- 5. All users have email_confirmed_at = NOW() for immediate testing
-- 6. Added profiles creation in auth_management.profiles (2025-11-04)
-- 7. Set status = 'active' to enable login (2025-11-04)
-- 8. Set email_verified = true (2025-11-04)
-- =====================================================

-- =====================================================
-- IMPORTANT NOTES
-- =====================================================
-- 1. ✅ El trigger trg_initialize_user_stats funciona correctamente
--    porque usamos profiles.id = auth.users.id (unificación de IDs)
--    NO es necesario deshabilitar el trigger.
--
-- 2. ✅ Este seed es para DEV/STAGING únicamente (NO producción).
--
-- 3. ✅ Todos los usuarios comparten password "Test1234" (testing).
--
-- 4. ✅ UUIDs predecibles para consistencia con ambiente PROD:
--    - admin@gamilit.com:   dddddddd-dddd-dddd-dddd-dddddddddddd
--    - teacher@gamilit.com: eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee
--    - student@gamilit.com: ffffffff-ffff-ffff-ffff-ffffffffffff
-- =====================================================
