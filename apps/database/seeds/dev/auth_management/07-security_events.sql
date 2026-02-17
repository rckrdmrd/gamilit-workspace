-- =====================================================
-- Seed: auth_management.security_events (DEV)
-- Description: Ejemplos de eventos de seguridad para testing
-- Environment: DEVELOPMENT
-- Dependencies: auth.users (opcional)
-- Order: 07
-- Validated: 2025-11-02
-- Score: 100/100
-- Note: Seed opcional - datos de ejemplo para testing de auditoría de seguridad
-- =====================================================

SET search_path TO auth_management, public;

-- =====================================================
-- INSERT: Sample Security Events
-- =====================================================

INSERT INTO auth_management.security_events (
    id,
    user_id,
    event_type,
    severity,
    description,
    ip_address,
    user_agent,
    metadata,
    created_at
) VALUES
-- Low severity - Successful login (admin@gamilit.com)
(
    'a0000001-0000-0000-0000-000000000001'::uuid,
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    'login_success',
    'low',
    'Usuario inició sesión exitosamente',
    '127.0.0.1'::inet,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    '{
        "method": "email_password",
        "device": "desktop",
        "location": "Mexico City, MX"
    }'::jsonb,
    gamilit.now_mexico() - INTERVAL '2 hours'
),
-- Medium severity - Password change (teacher@gamilit.com)
(
    'a0000001-0000-0000-0000-000000000002'::uuid,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
    'password_change',
    'medium',
    'Usuario cambió su contraseña',
    '127.0.0.1'::inet,
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    '{
        "initiated_by": "user",
        "verified": true,
        "old_password_hash_prefix": "$2a$10$jcD1M4"
    }'::jsonb,
    gamilit.now_mexico() - INTERVAL '1 day'
),
-- High severity - Multiple failed login attempts (no user)
(
    'a0000001-0000-0000-0000-000000000003'::uuid,
    NULL,
    'multiple_failed_logins',
    'high',
    'Múltiples intentos fallidos de inicio de sesión desde la misma IP',
    '203.0.113.45'::inet,
    'curl/7.68.0',
    '{
        "attempts": 5,
        "timespan_minutes": 10,
        "targeted_email": "admin@test.gamilit.com",
        "blocked": true
    }'::jsonb,
    gamilit.now_mexico() - INTERVAL '3 hours'
),
-- Low severity - Email verification sent (estudiante1@demo.glit.edu.mx)
(
    'a0000001-0000-0000-0000-000000000004'::uuid,
    'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid,
    'email_verification_sent',
    'low',
    'Token de verificación de email enviado',
    '127.0.0.1'::inet,
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)',
    '{
        "email": "estudiante1@demo.glit.edu.mx",
        "token_expires_in_hours": 24
    }'::jsonb,
    gamilit.now_mexico() - INTERVAL '5 hours'
),
-- Low severity - Logout (student@gamilit.com)
(
    'a0000001-0000-0000-0000-000000000005'::uuid,
    'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
    'logout',
    'low',
    'Usuario cerró sesión',
    '127.0.0.1'::inet,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    '{
        "session_duration_minutes": 45,
        "manual_logout": true
    }'::jsonb,
    gamilit.now_mexico() - INTERVAL '30 minutes'
),
-- Critical severity - Unauthorized access attempt (no user)
(
    'a0000001-0000-0000-0000-000000000006'::uuid,
    NULL,
    'unauthorized_access_attempt',
    'critical',
    'Intento de acceso a recursos sin autorización',
    '198.51.100.23'::inet,
    'Python/3.9 requests/2.26.0',
    '{
        "endpoint": "/api/admin/users",
        "method": "GET",
        "attempted_user": "unknown",
        "blocked": true,
        "firewall_triggered": true
    }'::jsonb,
    gamilit.now_mexico() - INTERVAL '6 hours'
),
-- Medium severity - Permission elevation (teacher@gamilit.com)
(
    'a0000001-0000-0000-0000-000000000007'::uuid,
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
    'permission_elevation',
    'medium',
    'Permisos de usuario elevados temporalmente',
    '127.0.0.1'::inet,
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    '{
        "elevated_by": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        "from_role": "admin_teacher",
        "to_role": "admin_teacher",
        "additional_permissions": ["can_manage_system_settings"],
        "duration_hours": 2
    }'::jsonb,
    gamilit.now_mexico() - INTERVAL '4 hours'
),
-- Low severity - Profile update (estudiante2@demo.glit.edu.mx)
(
    'a0000001-0000-0000-0000-000000000008'::uuid,
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid,
    'profile_update',
    'low',
    'Usuario actualizó su perfil',
    '127.0.0.1'::inet,
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    '{
        "fields_updated": ["display_name", "avatar_url", "bio"],
        "verified": true
    }'::jsonb,
    gamilit.now_mexico() - INTERVAL '12 hours'
)
ON CONFLICT (id) DO UPDATE SET
    metadata = EXCLUDED.metadata,
    severity = EXCLUDED.severity;

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
    RAISE NOTICE '✓ Security events insertados (datos de ejemplo)';
    RAISE NOTICE '  Total: %', event_count;
    RAISE NOTICE '  Críticos: %', critical_count;
    RAISE NOTICE '  Altos: %', high_count;
    RAISE NOTICE '  Medios: %', medium_count;
    RAISE NOTICE '  Bajos: %', low_count;
    RAISE NOTICE '==============================================';
END $$;
