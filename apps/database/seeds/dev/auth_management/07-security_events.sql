-- =====================================================
-- Seed: auth_management.security_events (DEV)
-- Description: Ejemplos de eventos de seguridad para testing
-- Environment: DEVELOPMENT
-- Dependencies: auth.users (opcional)
-- Order: 07
-- Validated: 2025-11-02
-- Updated: 2026-02-21 (Replaced placeholder UUIDs with dynamic email lookups)
-- Score: 100/100
-- Note: Seed opcional - datos de ejemplo para testing de auditoria de seguridad
-- =====================================================

SET search_path TO auth_management, public;

-- =====================================================
-- INSERT: Sample Security Events (wrapped in DO block for dynamic lookups)
-- =====================================================

DO $$
DECLARE
    v_admin_user_id UUID;
    v_teacher_user_id UUID;
    v_student_user_id UUID;
    v_demo_student1_user_id UUID;
    v_demo_student2_user_id UUID;
BEGIN
    -- Dynamic user lookups by email
    SELECT id INTO v_admin_user_id FROM auth.users WHERE email = 'admin@gamilit.com';
    SELECT id INTO v_teacher_user_id FROM auth.users WHERE email = 'teacher@gamilit.com';
    SELECT id INTO v_student_user_id FROM auth.users WHERE email = 'student@gamilit.com';
    SELECT id INTO v_demo_student1_user_id FROM auth.users WHERE email = 'estudiante1@demo.glit.edu.mx';
    SELECT id INTO v_demo_student2_user_id FROM auth.users WHERE email = 'estudiante2@demo.glit.edu.mx';

    -- Low severity - Successful login (admin@gamilit.com)
    IF v_admin_user_id IS NOT NULL THEN
        INSERT INTO auth_management.security_events (
            id, user_id, event_type, severity, description, ip_address, user_agent, metadata, created_at
        ) VALUES (
            gen_random_uuid(), v_admin_user_id,
            'login_success', 'low',
            'Usuario inicio sesion exitosamente',
            '127.0.0.1'::inet,
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            jsonb_build_object('method', 'email_password', 'device', 'desktop', 'location', 'Mexico City, MX'),
            gamilit.now_mexico() - INTERVAL '2 hours'
        ) ON CONFLICT (id) DO NOTHING;
    END IF;

    -- Medium severity - Password change (teacher@gamilit.com)
    IF v_teacher_user_id IS NOT NULL THEN
        INSERT INTO auth_management.security_events (
            id, user_id, event_type, severity, description, ip_address, user_agent, metadata, created_at
        ) VALUES (
            gen_random_uuid(), v_teacher_user_id,
            'password_change', 'medium',
            'Usuario cambio su contrasena',
            '127.0.0.1'::inet,
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            jsonb_build_object('initiated_by', 'user', 'verified', true),
            gamilit.now_mexico() - INTERVAL '1 day'
        ) ON CONFLICT (id) DO NOTHING;
    END IF;

    -- High severity - Multiple failed login attempts (no user)
    INSERT INTO auth_management.security_events (
        id, user_id, event_type, severity, description, ip_address, user_agent, metadata, created_at
    ) VALUES (
        gen_random_uuid(), NULL,
        'multiple_failed_logins', 'high',
        'Multiples intentos fallidos de inicio de sesion desde la misma IP',
        '203.0.113.45'::inet,
        'curl/7.68.0',
        jsonb_build_object('attempts', 5, 'timespan_minutes', 10, 'targeted_email', 'admin@test.gamilit.com', 'blocked', true),
        gamilit.now_mexico() - INTERVAL '3 hours'
    ) ON CONFLICT (id) DO NOTHING;

    -- Low severity - Email verification sent (estudiante1@demo.glit.edu.mx)
    IF v_demo_student1_user_id IS NOT NULL THEN
        INSERT INTO auth_management.security_events (
            id, user_id, event_type, severity, description, ip_address, user_agent, metadata, created_at
        ) VALUES (
            gen_random_uuid(), v_demo_student1_user_id,
            'email_verification_sent', 'low',
            'Token de verificacion de email enviado',
            '127.0.0.1'::inet,
            'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)',
            jsonb_build_object('email', 'estudiante1@demo.glit.edu.mx', 'token_expires_in_hours', 24),
            gamilit.now_mexico() - INTERVAL '5 hours'
        ) ON CONFLICT (id) DO NOTHING;
    END IF;

    -- Low severity - Logout (student@gamilit.com)
    IF v_student_user_id IS NOT NULL THEN
        INSERT INTO auth_management.security_events (
            id, user_id, event_type, severity, description, ip_address, user_agent, metadata, created_at
        ) VALUES (
            gen_random_uuid(), v_student_user_id,
            'logout', 'low',
            'Usuario cerro sesion',
            '127.0.0.1'::inet,
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            jsonb_build_object('session_duration_minutes', 45, 'manual_logout', true),
            gamilit.now_mexico() - INTERVAL '30 minutes'
        ) ON CONFLICT (id) DO NOTHING;
    END IF;

    -- Critical severity - Unauthorized access attempt (no user)
    INSERT INTO auth_management.security_events (
        id, user_id, event_type, severity, description, ip_address, user_agent, metadata, created_at
    ) VALUES (
        gen_random_uuid(), NULL,
        'unauthorized_access_attempt', 'critical',
        'Intento de acceso a recursos sin autorizacion',
        '198.51.100.23'::inet,
        'Python/3.9 requests/2.26.0',
        jsonb_build_object('endpoint', '/api/admin/users', 'method', 'GET', 'attempted_user', 'unknown', 'blocked', true, 'firewall_triggered', true),
        gamilit.now_mexico() - INTERVAL '6 hours'
    ) ON CONFLICT (id) DO NOTHING;

    -- Medium severity - Permission elevation (teacher@gamilit.com)
    IF v_teacher_user_id IS NOT NULL AND v_admin_user_id IS NOT NULL THEN
        INSERT INTO auth_management.security_events (
            id, user_id, event_type, severity, description, ip_address, user_agent, metadata, created_at
        ) VALUES (
            gen_random_uuid(), v_teacher_user_id,
            'permission_elevation', 'medium',
            'Permisos de usuario elevados temporalmente',
            '127.0.0.1'::inet,
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            jsonb_build_object('elevated_by', v_admin_user_id::text, 'from_role', 'admin_teacher', 'to_role', 'admin_teacher', 'additional_permissions', '["can_manage_system_settings"]'::jsonb, 'duration_hours', 2),
            gamilit.now_mexico() - INTERVAL '4 hours'
        ) ON CONFLICT (id) DO NOTHING;
    END IF;

    -- Low severity - Profile update (estudiante2@demo.glit.edu.mx)
    IF v_demo_student2_user_id IS NOT NULL THEN
        INSERT INTO auth_management.security_events (
            id, user_id, event_type, severity, description, ip_address, user_agent, metadata, created_at
        ) VALUES (
            gen_random_uuid(), v_demo_student2_user_id,
            'profile_update', 'low',
            'Usuario actualizo su perfil',
            '127.0.0.1'::inet,
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
            jsonb_build_object('fields_updated', '["display_name", "avatar_url", "bio"]'::jsonb, 'verified', true),
            gamilit.now_mexico() - INTERVAL '12 hours'
        ) ON CONFLICT (id) DO NOTHING;
    END IF;

    RAISE NOTICE 'Security events seed completed (up to 8 events inserted)';
END $$;

-- =====================================================
-- Verification Query
-- =====================================================

DO $$
DECLARE
    event_count INTEGER;
    critical_count INTEGER;
    high_count INTEGER;
    medium_count INTEGER;
    low_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO event_count FROM auth_management.security_events;
    SELECT COUNT(*) INTO critical_count FROM auth_management.security_events WHERE severity = 'critical';
    SELECT COUNT(*) INTO high_count FROM auth_management.security_events WHERE severity = 'high';
    SELECT COUNT(*) INTO medium_count FROM auth_management.security_events WHERE severity = 'medium';
    SELECT COUNT(*) INTO low_count FROM auth_management.security_events WHERE severity = 'low';

    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Security events insertados (datos de ejemplo)';
    RAISE NOTICE '  Total: %', event_count;
    RAISE NOTICE '  Criticos: %', critical_count;
    RAISE NOTICE '  Altos: %', high_count;
    RAISE NOTICE '  Medios: %', medium_count;
    RAISE NOTICE '  Bajos: %', low_count;
    RAISE NOTICE '==============================================';
END $$;
