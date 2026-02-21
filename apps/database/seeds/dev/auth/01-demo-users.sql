-- =====================================================
-- Seed: auth.users - Test Users (PRODUCTION CLEAN)
-- Description: Usuarios de testing y sistema con dominio @gamilit.com
-- Environment: ALL
-- Dependencies: None (auth schema base)
-- Order: 01
-- Created: 2025-11-17
-- Version: 4.0 (+ system@gamilit.com from backup 2026-02-21)
-- =====================================================
--
-- USUARIOS DE TESTING Y SISTEMA (4):
-- - system@gamilit.com / n/a (super_admin, sistema - no login)
-- - admin@gamilit.com / Test1234 (super_admin)
-- - teacher@gamilit.com / Test1234 (admin_teacher)
-- - student@gamilit.com / Test1234 (student)
--
-- TOTAL: 4 usuarios
--
-- POLITICA DE CARGA LIMPIA:
-- - Solo usuarios @gamilit.com
-- - Sin usuarios @demo.glit.edu.mx
-- - UUIDs generados dinamicamente con gen_random_uuid()
-- - Passwords identicos para facilitar testing
--
-- IMPORTANTE: Estos usuarios son para testing.
-- En produccion real, usar proceso de registro normal.
-- =====================================================

SET search_path TO auth, public;

-- =====================================================
-- PASSWORDS ENCRYPTED WITH BCRYPT
-- =====================================================
-- Password: "Test1234" (todos los usuarios)
-- Se genera dinamicamente con: crypt('Test1234', gen_salt('bf', 10))
--
-- NOTA IDEMPOTENCIA: gen_salt() produce un salt diferente en cada ejecucion,
-- por lo que el hash bcrypt cambia en cada re-run del seed. Esto es COSMETICO:
-- ON CONFLICT actualiza el hash y la password sigue siendo "Test1234".
-- La funcionalidad no se ve afectada. No reemplazar con hash estatico
-- porque bcrypt con salt dinamico es la practica correcta.
-- =====================================================

-- =====================================================
-- INSERT: System + Test Users (4 usuarios @gamilit.com)
-- =====================================================

-- =====================================================
-- USUARIO 0: SYSTEM (cuenta de sistema, no para login)
-- =====================================================
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    email,
    encrypted_password,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    email_change_confirm_status,
    is_sso_user,
    gamilit_role,
    status
) VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    NULL,
    'authenticated',
    'system@gamilit.com',
    'n/a',
    NULL,
    '{}'::jsonb,
    false,
    '2026-02-20 06:46:12.231248+00'::timestamptz,
    '2026-02-20 06:46:12.231248+00'::timestamptz,
    0,
    false,
    'super_admin'::auth_management.gamilit_role,
    'active'::auth_management.user_status
)
ON CONFLICT (email) DO UPDATE SET
    gamilit_role = EXCLUDED.gamilit_role,
    updated_at = gamilit.now_mexico();

-- =====================================================
-- INSERT: Test Users (3 usuarios @gamilit.com)
-- =====================================================

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
-- USUARIO 1: ADMIN
-- =====================================================
(
    gen_random_uuid(),
    gen_random_uuid(),
    'admin@gamilit.com',
    crypt('Test1234', gen_salt('bf', 10)),
    gamilit.now_mexico(),
    jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
    ),
    jsonb_build_object(
        'name', 'Admin GAMILIT',
        'role', 'super_admin',
        'description', 'Usuario administrador de testing'
    ),
    'active',
    gamilit.now_mexico(),
    gamilit.now_mexico(),
    '',
    '',
    '',
    '',
    'super_admin'::auth_management.gamilit_role
),

-- =====================================================
-- USUARIO 2: TEACHER
-- =====================================================
(
    gen_random_uuid(),
    gen_random_uuid(),
    'teacher@gamilit.com',
    crypt('Test1234', gen_salt('bf', 10)),
    gamilit.now_mexico(),
    jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
    ),
    jsonb_build_object(
        'name', 'Profesor Testing',
        'role', 'admin_teacher',
        'description', 'Usuario profesor de testing'
    ),
    'active',
    gamilit.now_mexico(),
    gamilit.now_mexico(),
    '',
    '',
    '',
    '',
    'admin_teacher'::auth_management.gamilit_role
),

-- =====================================================
-- USUARIO 3: STUDENT
-- =====================================================
(
    gen_random_uuid(),
    gen_random_uuid(),
    'student@gamilit.com',
    crypt('Test1234', gen_salt('bf', 10)),
    gamilit.now_mexico(),
    jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
    ),
    jsonb_build_object(
        'name', 'Estudiante Testing',
        'role', 'student',
        'description', 'Usuario estudiante de testing'
    ),
    'active',
    gamilit.now_mexico(),
    gamilit.now_mexico(),
    '',
    '',
    '',
    '',
    'student'::auth_management.gamilit_role
)

ON CONFLICT (email) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data,
    email_confirmed_at = EXCLUDED.email_confirmed_at,
    gamilit_role = EXCLUDED.gamilit_role,
    updated_at = gamilit.now_mexico();

-- =====================================================
-- Verification Query
-- =====================================================

DO $$
DECLARE
    user_count INTEGER;
    admin_count INTEGER;
    teacher_count INTEGER;
    student_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count
    FROM auth.users
    WHERE email LIKE '%@gamilit.com';

    SELECT COUNT(*) INTO admin_count
    FROM auth.users
    WHERE email = 'admin@gamilit.com';

    SELECT COUNT(*) INTO teacher_count
    FROM auth.users
    WHERE email = 'teacher@gamilit.com';

    SELECT COUNT(*) INTO student_count
    FROM auth.users
    WHERE email = 'student@gamilit.com';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'USUARIOS DE TESTING CREADOS';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total usuarios @gamilit.com: %', user_count;
    RAISE NOTICE '  - Admin:   % (admin@gamilit.com)', admin_count;
    RAISE NOTICE '  - Teacher: % (teacher@gamilit.com)', teacher_count;
    RAISE NOTICE '  - Student: % (student@gamilit.com)', student_count;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Credenciales de Testing:';
    RAISE NOTICE '  admin@gamilit.com    | Test1234 | super_admin';
    RAISE NOTICE '  teacher@gamilit.com  | Test1234 | admin_teacher';
    RAISE NOTICE '  student@gamilit.com  | Test1234 | student';
    RAISE NOTICE '========================================';

    IF user_count >= 3 THEN
        RAISE NOTICE 'Los usuarios de testing fueron creados correctamente';
    ELSE
        RAISE WARNING 'Se esperaban 3+ usuarios @gamilit.com, se crearon %', user_count;
    END IF;
END $$;

-- =====================================================
-- Testing Info
-- =====================================================
-- Para probar login:
--
-- curl -X POST http://localhost:3006/api/auth/login \
--   -H "Content-Type: application/json" \
--   -d '{"email":"admin@gamilit.com","password":"Test1234"}'
--
-- =====================================================

-- =====================================================
-- CHANGELOG
-- =====================================================
-- v4.0 (2026-02-21): + system@gamilit.com desde backup produccion
--   - Agregado usuario de sistema (UUID fijo 00000000-...-000001)
--   - Password 'n/a' (no para login)
--   - Total: 4 usuarios @gamilit.com
--
-- v3.0 (2026-02-21): ELIMINACION DE UUIDs PLACEHOLDER
--   - Reemplazados UUIDs mnemotecnicos (aaaa, bbbb, cccc) con gen_random_uuid()
--   - Reemplazados instance_id 00000000 con gen_random_uuid()
--   - ON CONFLICT (email) mantiene idempotencia
--
-- v2.0 (2025-11-17): LIMPIEZA COMPLETA
--   - Eliminados 20 usuarios @demo.glit.edu.mx
--   - Mantenidos solo 3 usuarios @gamilit.com
--   - Politica de carga limpia aplicada
--
-- v1.0 (2025-01-11): Version original
--   - 23 usuarios (3 @gamilit.com + 20 @demo.glit.edu.mx)
-- =====================================================
