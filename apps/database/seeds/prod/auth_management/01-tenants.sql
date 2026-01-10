-- =====================================================
-- Seed: auth_management.tenants (DEV)
-- Description: Tenant único principal de GAMILIT
-- Environment: DEVELOPMENT
-- Dependencies: None
-- Order: 01
-- Updated: 2026-01-08 - Simplificado a un solo tenant
-- Version: 2.0
-- =====================================================
--
-- DECISIÓN DE DISEÑO (2026-01-08):
-- - Solo existe UN tenant principal: GAMILIT Platform
-- - TODOS los usuarios (demo + registrados) se asignan a este tenant
-- - Los triggers set_default_tenant() y assign_default_classroom() usan este tenant
--
-- TENANTS REMOVIDOS (v2.0):
-- - gamilit-test (ID: 00000000-0000-0000-0000-000000000001) - REMOVIDO
-- - demo-school-primary (ID: 00000000-0000-0000-0000-000000000002) - REMOVIDO
-- - demo-school-secondary (ID: 00000000-0000-0000-0000-000000000003) - REMOVIDO
--
-- =====================================================

SET search_path TO auth_management, public;

-- =====================================================
-- INSERT: Tenant Principal GAMILIT
-- UUID conocido usado en 100+ seeds de gamification, profiles y content
-- =====================================================

INSERT INTO auth_management.tenants (
    id,
    name,
    slug,
    domain,
    logo_url,
    subscription_tier,
    max_users,
    max_storage_gb,
    is_active,
    trial_ends_at,
    settings,
    metadata,
    created_at,
    updated_at
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'GAMILIT Platform',
    'gamilit-platform',
    'platform.gamilit.com',
    NULL,
    'enterprise',
    10000,
    1000,
    true,
    NULL,  -- Sin trial (enterprise)
    '{
        "theme": "detective",
        "language": "es",
        "timezone": "America/Mexico_City",
        "features": {
            "analytics_enabled": true,
            "gamification_enabled": true,
            "social_features_enabled": true,
            "reports_enabled": true,
            "notifications_enabled": true
        }
    }'::jsonb,
    '{
        "description": "Tenant principal de GAMILIT Platform",
        "environment": "all",
        "created_by": "seed_script",
        "is_primary": true,
        "is_default": true,
        "version": "2.0"
    }'::jsonb,
    gamilit.now_mexico(),
    gamilit.now_mexico()
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    slug = EXCLUDED.slug,
    domain = EXCLUDED.domain,
    subscription_tier = EXCLUDED.subscription_tier,
    max_users = EXCLUDED.max_users,
    max_storage_gb = EXCLUDED.max_storage_gb,
    is_active = EXCLUDED.is_active,
    trial_ends_at = EXCLUDED.trial_ends_at,
    settings = EXCLUDED.settings,
    metadata = EXCLUDED.metadata,
    updated_at = gamilit.now_mexico();

-- =====================================================
-- Cleanup: Eliminar tenants obsoletos si existen
-- =====================================================

DELETE FROM auth_management.tenants
WHERE id IN (
    '00000000-0000-0000-0000-000000000001'::uuid,  -- gamilit-test
    '00000000-0000-0000-0000-000000000002'::uuid,  -- demo-school-primary
    '00000000-0000-0000-0000-000000000003'::uuid   -- demo-school-secondary
)
AND NOT EXISTS (
    -- No eliminar si tienen usuarios asignados
    SELECT 1 FROM auth_management.profiles p WHERE p.tenant_id = tenants.id
);

-- =====================================================
-- Verification Query
-- =====================================================

DO $$
DECLARE
    tenant_count INTEGER;
    main_tenant RECORD;
BEGIN
    SELECT COUNT(*) INTO tenant_count FROM auth_management.tenants;

    SELECT id, name, slug INTO main_tenant
    FROM auth_management.tenants
    WHERE slug = 'gamilit-platform' AND is_active = true;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICACIÓN DE TENANTS';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total tenants: %', tenant_count;

    IF main_tenant.id IS NOT NULL THEN
        RAISE NOTICE '✓ Tenant principal configurado:';
        RAISE NOTICE '  ID: %', main_tenant.id;
        RAISE NOTICE '  Nombre: %', main_tenant.name;
        RAISE NOTICE '  Slug: %', main_tenant.slug;
    ELSE
        RAISE WARNING '⚠ Tenant principal NO encontrado';
    END IF;

    RAISE NOTICE '========================================';
END $$;
