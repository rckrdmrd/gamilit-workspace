-- =====================================================
-- Seed: auth.users - Demo Students & Instructor
-- Description: Usuarios demo para seeds de desarrollo
-- Environment: DEVELOPMENT
-- Dependencies: auth schema base, auth_management.gamilit_role ENUM
-- Order: 01b (after 01-demo-users.sql)
-- Created: 2026-02-17
-- =====================================================
--
-- USUARIOS DEMO (4):
-- - estudiante1@demo.glit.edu.mx / Test1234 (student)
-- - estudiante2@demo.glit.edu.mx / Test1234 (student)
-- - estudiante3@demo.glit.edu.mx / Test1234 (student)
-- - instructor@demo.glit.edu.mx  / Test1234 (admin_teacher)
--
-- NOTA: Estos usuarios son referenciados por ~21 seed files
-- en gamification, progress, social, audit, etc.
-- =====================================================

SET search_path TO auth, public;

INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    status,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token,
    gamilit_role
) VALUES
-- =====================================================
-- ESTUDIANTE 1
-- =====================================================
(
    'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'estudiante1@demo.glit.edu.mx',
    crypt('Test1234', gen_salt('bf', 10)),
    gamilit.now_mexico(),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
    jsonb_build_object('name', 'Estudiante Uno Demo', 'role', 'student'),
    'active',
    gamilit.now_mexico() - INTERVAL '30 days',
    gamilit.now_mexico(),
    '', '', '', '',
    'student'::auth_management.gamilit_role
),
-- =====================================================
-- ESTUDIANTE 2
-- =====================================================
(
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'estudiante2@demo.glit.edu.mx',
    crypt('Test1234', gen_salt('bf', 10)),
    gamilit.now_mexico(),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
    jsonb_build_object('name', 'Estudiante Dos Demo', 'role', 'student'),
    'active',
    gamilit.now_mexico() - INTERVAL '28 days',
    gamilit.now_mexico(),
    '', '', '', '',
    'student'::auth_management.gamilit_role
),
-- =====================================================
-- ESTUDIANTE 3
-- =====================================================
(
    'ffffffff-ffff-ffff-ffff-ffffffffffff'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'estudiante3@demo.glit.edu.mx',
    crypt('Test1234', gen_salt('bf', 10)),
    gamilit.now_mexico(),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
    jsonb_build_object('name', 'Estudiante Tres Demo', 'role', 'student'),
    'active',
    gamilit.now_mexico() - INTERVAL '25 days',
    gamilit.now_mexico(),
    '', '', '', '',
    'student'::auth_management.gamilit_role
),
-- =====================================================
-- INSTRUCTOR DEMO
-- =====================================================
(
    '11111111-2222-3333-4444-555555555555'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'instructor@demo.glit.edu.mx',
    crypt('Test1234', gen_salt('bf', 10)),
    gamilit.now_mexico(),
    jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
    jsonb_build_object('name', 'Instructor Demo', 'role', 'admin_teacher'),
    'active',
    gamilit.now_mexico() - INTERVAL '60 days',
    gamilit.now_mexico(),
    '', '', '', '',
    'admin_teacher'::auth_management.gamilit_role
)
ON CONFLICT (email) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data,
    email_confirmed_at = EXCLUDED.email_confirmed_at,
    gamilit_role = EXCLUDED.gamilit_role,
    updated_at = gamilit.now_mexico();

-- =====================================================
-- Verification
-- =====================================================
DO $$
DECLARE
    demo_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO demo_count
    FROM auth.users
    WHERE email LIKE '%@demo.glit.edu.mx';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'DEMO USERS CREATED: %', demo_count;
    RAISE NOTICE '  - estudiante1@demo.glit.edu.mx';
    RAISE NOTICE '  - estudiante2@demo.glit.edu.mx';
    RAISE NOTICE '  - estudiante3@demo.glit.edu.mx';
    RAISE NOTICE '  - instructor@demo.glit.edu.mx';
    RAISE NOTICE '========================================';
END $$;
