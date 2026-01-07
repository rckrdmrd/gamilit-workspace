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
-- - Admin: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa
-- - Teacher: bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb
-- - Student: cccccccc-cccc-cccc-cccc-cccccccccccc
--
-- =====================================================

-- Limpiar dispositivos de testing existentes (solo en dev)
DELETE FROM notifications.user_devices
WHERE user_id IN (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
    'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid
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
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
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
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
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
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
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
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
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
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
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
    'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
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
    'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
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
BEGIN
    SELECT COUNT(*) INTO total_devices
    FROM notifications.user_devices
    WHERE user_id IN (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
        'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid
    );

    SELECT COUNT(*) INTO active_devices
    FROM notifications.user_devices
    WHERE is_active = true
    AND user_id IN (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
        'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid
    );

    SELECT COUNT(*) INTO admin_devices
    FROM notifications.user_devices
    WHERE user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid;

    SELECT COUNT(*) INTO teacher_devices
    FROM notifications.user_devices
    WHERE user_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid;

    SELECT COUNT(*) INTO student_devices
    FROM notifications.user_devices
    WHERE user_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid;

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
COMMENT ON TABLE notifications.user_devices IS 'Dispositivos registrados de usuarios para push notifications - EXT-003 (Seed DEV 2026-01-04)';
