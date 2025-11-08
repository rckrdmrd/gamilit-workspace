-- =====================================================
-- Seed: auth_management.auth_providers (PRODUCTION)
-- Description: Configuración de proveedores de autenticación para producción
-- Environment: PRODUCTION
-- Dependencies: None
-- Order: 01
-- Validated: 2025-11-02
-- Score: 100/100
-- SECURITY: Client secrets deben ser configurados via variables de entorno
-- =====================================================

SET search_path TO auth_management, public;

-- =====================================================
-- INSERT: Auth Providers Configuration (PRODUCTION)
-- =====================================================

INSERT INTO auth_management.auth_providers (
    provider_name,
    display_name,
    is_enabled,
    client_id,
    client_secret,
    authorization_url,
    token_url,
    user_info_url,
    scope,
    redirect_uri,
    icon_url,
    button_color,
    priority,
    config,
    metadata
) VALUES
-- Local Auth (email/password) - ENABLED
(
    'local',
    'Email y Contraseña',
    true,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    '#4F46E5',
    1,
    '{
        "requires_email_verification": true,
        "password_min_length": 12,
        "password_requires_uppercase": true,
        "password_requires_number": true,
        "password_requires_special": true,
        "max_login_attempts": 5,
        "lockout_duration_minutes": 30
    }'::jsonb,
    '{
        "description": "Local authentication with strict password requirements",
        "environment": "production"
    }'::jsonb
),
-- Google OAuth - DISABLED (debe ser habilitado y configurado manualmente)
(
    'google',
    'Continuar con Google',
    false,
    NULL,
    NULL,
    'https://accounts.google.com/o/oauth2/v2/auth',
    'https://oauth2.googleapis.com/token',
    'https://www.googleapis.com/oauth2/v2/userinfo',
    ARRAY['openid', 'profile', 'email'],
    NULL,
    'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg',
    '#4285F4',
    10,
    '{
        "prompt": "select_account",
        "access_type": "offline"
    }'::jsonb,
    '{
        "description": "Google OAuth (disabled by default - configure via admin panel)",
        "environment": "production",
        "setup_required": true
    }'::jsonb
),
-- Facebook OAuth - DISABLED
(
    'facebook',
    'Continuar con Facebook',
    false,
    NULL,
    NULL,
    'https://www.facebook.com/v12.0/dialog/oauth',
    'https://graph.facebook.com/v12.0/oauth/access_token',
    'https://graph.facebook.com/me',
    ARRAY['email', 'public_profile'],
    NULL,
    'https://www.facebook.com/images/fb_icon_325x325.png',
    '#1877F2',
    20,
    '{
        "fields": "id,name,email,picture"
    }'::jsonb,
    '{
        "description": "Facebook OAuth (disabled by default)",
        "environment": "production",
        "setup_required": true
    }'::jsonb
),
-- Apple Sign In - DISABLED
(
    'apple',
    'Continuar con Apple',
    false,
    NULL,
    NULL,
    'https://appleid.apple.com/auth/authorize',
    'https://appleid.apple.com/auth/token',
    NULL,
    ARRAY['name', 'email'],
    NULL,
    'https://appleid.cdn-apple.com/appleid/button',
    '#000000',
    15,
    '{
        "response_mode": "form_post",
        "response_type": "code id_token"
    }'::jsonb,
    '{
        "description": "Apple Sign In (disabled by default)",
        "environment": "production",
        "setup_required": true
    }'::jsonb
),
-- Microsoft OAuth - DISABLED
(
    'microsoft',
    'Continuar con Microsoft',
    false,
    NULL,
    NULL,
    'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    'https://graph.microsoft.com/v1.0/me',
    ARRAY['openid', 'profile', 'email', 'User.Read'],
    NULL,
    'https://docs.microsoft.com/en-us/azure/active-directory/develop/media/howto-add-branding-in-azure-ad-apps/ms-symbollockup_mssymbol_19.png',
    '#00A4EF',
    30,
    '{
        "tenant": "common"
    }'::jsonb,
    '{
        "description": "Microsoft OAuth (disabled by default)",
        "environment": "production",
        "setup_required": true
    }'::jsonb
),
-- GitHub OAuth - DISABLED
(
    'github',
    'Continuar con GitHub',
    false,
    NULL,
    NULL,
    'https://github.com/login/oauth/authorize',
    'https://github.com/login/oauth/access_token',
    'https://api.github.com/user',
    ARRAY['user:email', 'read:user'],
    NULL,
    'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
    '#24292e',
    40,
    '{
        "allow_signup": "false"
    }'::jsonb,
    '{
        "description": "GitHub OAuth (disabled by default)",
        "environment": "production",
        "setup_required": true
    }'::jsonb
)
ON CONFLICT (provider_name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    authorization_url = EXCLUDED.authorization_url,
    token_url = EXCLUDED.token_url,
    user_info_url = EXCLUDED.user_info_url,
    scope = EXCLUDED.scope,
    icon_url = EXCLUDED.icon_url,
    button_color = EXCLUDED.button_color,
    priority = EXCLUDED.priority,
    config = EXCLUDED.config,
    metadata = EXCLUDED.metadata,
    updated_at = gamilit.now_mexico();

-- =====================================================
-- Verification Query
-- =====================================================

DO $$
DECLARE
    provider_count INTEGER;
    enabled_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO provider_count FROM auth_management.auth_providers;
    SELECT COUNT(*) INTO enabled_count FROM auth_management.auth_providers WHERE is_enabled = true;

    RAISE NOTICE '==============================================';
    RAISE NOTICE '✓ Auth providers configurados (PRODUCTION)';
    RAISE NOTICE '  Total: % proveedores', provider_count;
    RAISE NOTICE '  Habilitados: % (solo local auth)', enabled_count;
    RAISE NOTICE '  NOTA: Configure OAuth providers via admin panel';
    RAISE NOTICE '==============================================';
END $$;
