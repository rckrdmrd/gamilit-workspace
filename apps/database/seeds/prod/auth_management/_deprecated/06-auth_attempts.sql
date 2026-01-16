-- =====================================================
-- Seed: auth_management.auth_attempts (DEV)
-- Description: Ejemplos de intentos de autenticación para pruebas de auditoría
-- Environment: DEVELOPMENT
-- Dependencies: None (tabla de auditoría independiente)
-- Order: 06
-- Validated: 2025-11-02
-- Score: 100/100
-- Note: Seed opcional - datos de ejemplo para testing de auditoría
-- =====================================================

SET search_path TO auth_management, public;

-- =====================================================
-- INSERT: Sample Auth Attempts
-- =====================================================

INSERT INTO auth_management.auth_attempts (
    id,
    email,
    ip_address,
    user_agent,
    success,
    failure_reason,
    tenant_slug,
    attempted_at,
    metadata
) VALUES
-- Successful login - Student
(
    'a0000001-0000-0000-0000-000000000001'::uuid,
    'student@test.gamilit.com',
    '127.0.0.1'::inet,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    true,
    NULL,
    'gamilit-test',
    gamilit.now_mexico() - INTERVAL '2 hours',
    '{"device": "desktop", "os": "Windows 10", "browser": "Chrome"}'::jsonb
),
-- Successful login - Teacher
(
    'a0000001-0000-0000-0000-000000000002'::uuid,
    'teacher@test.gamilit.com',
    '127.0.0.1'::inet,
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    true,
    NULL,
    'gamilit-test',
    gamilit.now_mexico() - INTERVAL '1 hour',
    '{"device": "desktop", "os": "macOS", "browser": "Chrome"}'::jsonb
),
-- Failed login - Wrong password
(
    'a0000001-0000-0000-0000-000000000003'::uuid,
    'student@test.gamilit.com',
    '192.168.1.100'::inet,
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)',
    false,
    'invalid_password',
    'gamilit-test',
    gamilit.now_mexico() - INTERVAL '3 hours',
    '{"device": "mobile", "os": "iOS", "browser": "Safari", "attempts": 1}'::jsonb
),
-- Failed login - User not found
(
    'a0000001-0000-0000-0000-000000000004'::uuid,
    'nonexistent@test.gamilit.com',
    '192.168.1.200'::inet,
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    false,
    'user_not_found',
    'gamilit-test',
    gamilit.now_mexico() - INTERVAL '5 hours',
    '{"device": "desktop", "os": "Linux", "browser": "Firefox"}'::jsonb
),
-- Successful login - Admin
(
    'a0000001-0000-0000-0000-000000000005'::uuid,
    'admin@test.gamilit.com',
    '127.0.0.1'::inet,
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    true,
    NULL,
    'gamilit-test',
    gamilit.now_mexico() - INTERVAL '30 minutes',
    '{"device": "desktop", "os": "Windows 10", "browser": "Edge"}'::jsonb
),
-- Failed login - Multiple attempts (suspicious)
(
    'a0000001-0000-0000-0000-000000000006'::uuid,
    'admin@test.gamilit.com',
    '203.0.113.45'::inet,
    'curl/7.68.0',
    false,
    'invalid_password',
    'gamilit-test',
    gamilit.now_mexico() - INTERVAL '6 hours',
    '{"device": "bot", "suspicious": true, "attempts": 5, "blocked": true}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    metadata = EXCLUDED.metadata,
    success = EXCLUDED.success;

-- =====================================================
-- Verification Query
-- =====================================================

DO $$
DECLARE
    attempt_count INTEGER;
    success_count INTEGER;
    failed_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO attempt_count FROM auth_management.auth_attempts;
    SELECT COUNT(*) INTO success_count FROM auth_management.auth_attempts WHERE success = true;
    SELECT COUNT(*) INTO failed_count FROM auth_management.auth_attempts WHERE success = false;

    RAISE NOTICE '==============================================';
    RAISE NOTICE '✓ Auth attempts insertados (datos de ejemplo)';
    RAISE NOTICE '  Total: %', attempt_count;
    RAISE NOTICE '  Exitosos: %', success_count;
    RAISE NOTICE '  Fallidos: %', failed_count;
    RAISE NOTICE '==============================================';
END $$;
