-- =====================================================
-- View: auth.tenants (Alias)
-- Description: Compatibility view for backend queries expecting auth.tenants
-- Created: 2025-11-24
-- Gap: GAP-DB-002 (MINOR)
-- =====================================================
--
-- 📚 Documentación:
-- Requerimiento: orchestration/reportes/REPORTE-COHERENCIA-DATABASE-BACKEND-2025-11-24.md
-- Backend: apps/backend/src/modules/admin/services/admin-dashboard.service.ts:561
-- Epic: FE-051 Admin Portal Dashboard
--
-- =====================================================
-- PROBLEMA:
-- Backend usa: SELECT ... FROM auth.tenants
-- DDL define: auth_management.tenants
--
-- SOLUCIÓN:
-- Crear vista alias en schema auth que apunta a auth_management.tenants
-- =====================================================

SET search_path TO auth, public;

-- =====================================================
-- DROP VIEW (if exists)
-- =====================================================

DROP VIEW IF EXISTS auth.tenants CASCADE;

-- =====================================================
-- CREATE VIEW
-- =====================================================

CREATE VIEW auth.tenants AS
SELECT
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
FROM auth_management.tenants;

-- =====================================================
-- GRANTS
-- =====================================================

GRANT SELECT ON auth.tenants TO gamilit_user;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON VIEW auth.tenants IS
    'Compatibility view for backend queries expecting auth.tenants. Points to auth_management.tenants.';

-- =====================================================
-- BACKEND USAGE
-- =====================================================

-- This view is used by:
-- apps/backend/src/modules/admin/services/admin-dashboard.service.ts:554-566
--
-- Query Example (from backend):
-- SELECT
--   'organization_updated' as type,
--   'Admin' as user,
--   'Organización ' || name || ' actualizada' as description,
--   updated_at as timestamp,
--   'success' as status
-- FROM auth.tenants
-- WHERE updated_at >= NOW() - INTERVAL '7 days'
-- ORDER BY updated_at DESC;
--
-- =====================================================
-- MIGRATION NOTES
-- =====================================================

-- Gap Resolved: GAP-DB-002 (MINOR)
-- Date: 2025-11-24
-- Issue: Backend expected auth.tenants but actual table is auth_management.tenants
-- Solution: Created view alias for compatibility
--
-- ALTERNATIVE SOLUTION (not implemented):
-- Update backend to use correct schema:
--   FROM auth_management.tenants  -- Instead of auth.tenants
--
-- REASON FOR VIEW APPROACH:
-- - Less intrusive (no backend changes needed)
-- - Quick fix for immediate deployment
-- - Can be migrated to backend fix later if desired
--
-- =====================================================
