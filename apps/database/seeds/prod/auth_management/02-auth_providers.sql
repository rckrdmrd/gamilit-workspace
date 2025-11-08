-- ============================================================================
-- GAMILIT Platform - Production Seeds
-- Archivo: seeds/prod/auth_management/02-auth_providers.sql
-- Propósito: Configurar proveedores de autenticación
-- ============================================================================

-- Provider: Local (email/password)
INSERT INTO auth_management.auth_providers (
    id,
    name,
    provider_type,
    is_enabled,
    configuration,
    created_at,
    updated_at
)
VALUES (
    'provider-local',
    'Local Authentication',
    'local',
    true,
    jsonb_build_object(
        'allow_registration', true,
        'require_email_verification', true,
        'password_min_length', 8,
        'password_require_uppercase', true,
        'password_require_lowercase', true,
        'password_require_number', true,
        'password_require_special', false,
        'max_login_attempts', 5,
        'lockout_duration_minutes', 30
    ),
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    is_enabled = EXCLUDED.is_enabled,
    configuration = EXCLUDED.configuration,
    updated_at = NOW();

-- Provider: Google OAuth
INSERT INTO auth_management.auth_providers (
    id,
    name,
    provider_type,
    is_enabled,
    configuration,
    created_at,
    updated_at
)
VALUES (
    'provider-google',
    'Google OAuth',
    'google',
    true,
    jsonb_build_object(
        'client_id', 'CONFIGURAR_EN_PRODUCCION',
        'client_secret', 'CONFIGURAR_EN_PRODUCCION',
        'redirect_uri', 'https://gamilit.com/auth/google/callback',
        'scopes', jsonb_build_array('email', 'profile')
    ),
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    is_enabled = EXCLUDED.is_enabled,
    updated_at = NOW();

-- Provider: Microsoft OAuth (futuro)
INSERT INTO auth_management.auth_providers (
    id,
    name,
    provider_type,
    is_enabled,
    configuration,
    created_at,
    updated_at
)
VALUES (
    'provider-microsoft',
    'Microsoft OAuth',
    'microsoft',
    false,
    jsonb_build_object(
        'client_id', 'PENDIENTE_CONFIGURACION',
        'client_secret', 'PENDIENTE_CONFIGURACION',
        'redirect_uri', 'https://gamilit.com/auth/microsoft/callback',
        'scopes', jsonb_build_array('email', 'profile')
    ),
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    is_enabled = EXCLUDED.is_enabled,
    updated_at = NOW();

-- Verificación
SELECT
    id,
    name,
    provider_type,
    is_enabled,
    configuration->>'allow_registration' as allow_registration
FROM auth_management.auth_providers
ORDER BY is_enabled DESC, provider_type;
