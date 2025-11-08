-- ============================================================================
-- GAMILIT Platform - Production Seeds
-- Archivo: seeds/prod/auth_management/01-tenants.sql
-- Propósito: Crear tenant principal de producción
-- ============================================================================

-- Tenant principal de producción
INSERT INTO auth_management.tenants (
    id,
    name,
    domain,
    status,
    settings,
    created_at,
    updated_at
)
VALUES (
    'tenant-gamilit-prod',
    'GAMILIT Platform',
    'gamilit.com',
    'active',
    jsonb_build_object(
        'max_students', 10000,
        'max_teachers', 500,
        'max_classrooms', 200,
        'features', jsonb_build_array(
            'gamification',
            'progress_tracking',
            'social_features',
            'assessments',
            'analytics'
        ),
        'limits', jsonb_build_object(
            'daily_api_calls', 100000,
            'storage_gb', 100,
            'max_file_size_mb', 50
        ),
        'contact', jsonb_build_object(
            'support_email', 'soporte@gamilit.com',
            'admin_email', 'admin@gamilit.com'
        ),
        'branding', jsonb_build_object(
            'logo_url', '/assets/logo-gamilit.png',
            'primary_color', '#4F46E5',
            'secondary_color', '#10B981'
        )
    ),
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    domain = EXCLUDED.domain,
    status = EXCLUDED.status,
    settings = EXCLUDED.settings,
    updated_at = NOW();

-- Verificación
SELECT
    id,
    name,
    domain,
    status,
    settings->>'max_students' as max_students,
    created_at
FROM auth_management.tenants
WHERE id = 'tenant-gamilit-prod';
