-- =====================================================
-- Seeds: user_devices (DEV)
-- Schema: notifications
-- Descripcion: Dispositivos de prueba para testing de push notifications
-- Relacionado: EXT-003 (Notificaciones Multi-Canal)
-- Fecha: 2026-01-04
-- =====================================================
--
-- IMPORTANTE:
-- - Este seed es SOLO para entorno de desarrollo
-- - Crea dispositivos de prueba para los usuarios @gamilit.com
-- - Los tokens son ficticios (no funcionan con FCM/APNS reales)
-- - Para testing del flujo de push sin envío real
--
-- USUARIOS DE TESTING:
-- - Admin:   admin@gamilit.com   (auth_management.profiles lookup via user_id)
-- - Teacher: teacher@gamilit.com (auth_management.profiles lookup via user_id)
-- - Student: student@gamilit.com (auth_management.profiles lookup via user_id)
--
-- =====================================================

-- Limpiar dispositivos de testing existentes (solo en dev)
DELETE FROM notifications.user_devices
WHERE user_id IN (
    (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'admin@gamilit.com'),
    (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'teacher@gamilit.com'),
    (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'student@gamilit.com')
);

-- =====================================================
-- DISPOSITIVOS DE TESTING
-- =====================================================

INSERT INTO notifications.user_devices (
    id,
    user_id,
    device_type,
    device_token,
    browser,
    os,
    is_active,
    last_used_at,
    created_at
) VALUES
-- =====================================================
-- ADMIN: 2 dispositivos (web + mobile)
-- =====================================================
(
    '11111111-1111-1111-1111-111111111111'::uuid,
    (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'admin@gamilit.com'),
    'web',
    'dev_token_admin_web_chrome_' || encode(gen_random_bytes(32), 'hex'),
    'Chrome',
    'Windows',
    true,
    gamilit.now_mexico(),
    gamilit.now_mexico() - INTERVAL '30 days'
),
(
    '11111111-1111-1111-1111-222222222222'::uuid,
    (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'admin@gamilit.com'),
    'mobile',
    'dev_token_admin_mobile_android_' || encode(gen_random_bytes(32), 'hex'),
    NULL,
    'Android',
    true,
    gamilit.now_mexico() - INTERVAL '2 days',
    gamilit.now_mexico() - INTERVAL '60 days'
),

-- =====================================================
-- TEACHER: 3 dispositivos (web, mobile, desktop)
-- =====================================================
(
    '22222222-2222-2222-2222-111111111111'::uuid,
    (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'teacher@gamilit.com'),
    'web',
    'dev_token_teacher_web_firefox_' || encode(gen_random_bytes(32), 'hex'),
    'Firefox',
    'macOS',
    true,
    gamilit.now_mexico(),
    gamilit.now_mexico() - INTERVAL '15 days'
),
(
    '22222222-2222-2222-2222-222222222222'::uuid,
    (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'teacher@gamilit.com'),
    'mobile',
    'dev_token_teacher_mobile_ios_' || encode(gen_random_bytes(32), 'hex'),
    NULL,
    'iOS',
    true,
    gamilit.now_mexico() - INTERVAL '1 day',
    gamilit.now_mexico() - INTERVAL '45 days'
),
(
    '22222222-2222-2222-2222-333333333333'::uuid,
    (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'teacher@gamilit.com'),
    'desktop',
    'dev_token_teacher_desktop_macos_' || encode(gen_random_bytes(32), 'hex'),
    NULL,
    'macOS',
    false,  -- Dispositivo inactivo para testing de filtrado
    gamilit.now_mexico() - INTERVAL '90 days',
    gamilit.now_mexico() - INTERVAL '120 days'
),

-- =====================================================
-- STUDENT: 2 dispositivos (web + mobile)
-- =====================================================
(
    '33333333-3333-3333-3333-111111111111'::uuid,
    (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'student@gamilit.com'),
    'web',
    'dev_token_student_web_chrome_' || encode(gen_random_bytes(32), 'hex'),
    'Chrome',
    'Linux',
    true,
    gamilit.now_mexico(),
    gamilit.now_mexico() - INTERVAL '7 days'
),
(
    '33333333-3333-3333-3333-222222222222'::uuid,
    (SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'student@gamilit.com'),
    'mobile',
    'dev_token_student_mobile_android_' || encode(gen_random_bytes(32), 'hex'),
    NULL,
    'Android',
    true,
    gamilit.now_mexico() - INTERVAL '3 hours',
    gamilit.now_mexico() - INTERVAL '14 days'
);

-- =====================================================
-- Verificación
-- =====================================================

DO $$
DECLARE
    total_devices INTEGER;
    active_devices INTEGER;
    admin_devices INTEGER;
    teacher_devices INTEGER;
    student_devices INTEGER;
    admin_profile_id UUID;
    teacher_profile_id UUID;
    student_profile_id UUID;
BEGIN
    -- Resolver profile IDs para verificación
    SELECT p.id INTO admin_profile_id
    FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'admin@gamilit.com';

    SELECT p.id INTO teacher_profile_id
    FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'teacher@gamilit.com';

    SELECT p.id INTO student_profile_id
    FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'student@gamilit.com';

    SELECT COUNT(*) INTO total_devices
    FROM notifications.user_devices
    WHERE user_id IN (admin_profile_id, teacher_profile_id, student_profile_id);

    SELECT COUNT(*) INTO active_devices
    FROM notifications.user_devices
    WHERE is_active = true
    AND user_id IN (admin_profile_id, teacher_profile_id, student_profile_id);

    SELECT COUNT(*) INTO admin_devices
    FROM notifications.user_devices
    WHERE user_id = admin_profile_id;

    SELECT COUNT(*) INTO teacher_devices
    FROM notifications.user_devices
    WHERE user_id = teacher_profile_id;

    SELECT COUNT(*) INTO student_devices
    FROM notifications.user_devices
    WHERE user_id = student_profile_id;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'DISPOSITIVOS DE TESTING CREADOS';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total dispositivos: %', total_devices;
    RAISE NOTICE 'Dispositivos activos: %', active_devices;
    RAISE NOTICE '  - Admin:   % dispositivos', admin_devices;
    RAISE NOTICE '  - Teacher: % dispositivos', teacher_devices;
    RAISE NOTICE '  - Student: % dispositivos', student_devices;
    RAISE NOTICE '========================================';
    RAISE NOTICE 'NOTA: Tokens son ficticios para testing';
    RAISE NOTICE 'No funcionan con FCM/APNS real';
    RAISE NOTICE '========================================';

    IF total_devices = 7 THEN
        RAISE NOTICE '✓ Los 7 dispositivos de testing fueron creados correctamente';
    ELSE
        RAISE WARNING '⚠ Se esperaban 7 dispositivos, se crearon %', total_devices;
    END IF;
END $$;

-- =====================================================
-- COMENTARIO
-- =====================================================
-- Comentario omitido: COMMENT ON TABLE requiere ownership (seeds corren como gamilit_user, no postgres)
-- El comentario ya esta definido en el DDL: apps/database/ddl/schemas/notifications/tables/06-user_devices.sql
