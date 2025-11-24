-- =====================================================
-- View: admin_dashboard.recent_activity
-- Description: Recent user activity for admin dashboard (last 100 actions)
-- Created: 2025-11-12 (FE-051 P0)
-- Updated: 2025-11-24 (CORR-005) - Fixed table reference
--
-- 📚 Documentación:
-- Proyecto: FE-051 Admin Portal API Integration
-- Handoff: orchestration/integracion/HANDOFF-FE-051-DATABASE-CHANGES.md
-- Backend Handoff: orchestration/integracion/HANDOFF-FE-051-DASHBOARD-TO-BE.md
-- Corrección: CORR-005 - Referencias tabla correcta user_activity_logs
-- =====================================================

SET search_path TO admin_dashboard, public;

-- =====================================================
-- VIEW: recent_activity
-- =====================================================

DROP VIEW IF EXISTS admin_dashboard.recent_activity CASCADE;

CREATE VIEW admin_dashboard.recent_activity AS
SELECT
  ual.id,
  ual.user_id,
  p.full_name AS user_name,
  p.avatar_url AS user_avatar,
  u.email,
  ual.activity_type AS action_type,
  ual.action_detail AS action_description,
  ual.created_at AS timestamp,
  ual.ip_address,
  ual.user_agent,
  ual.metadata AS details
FROM audit_logging.user_activity_logs ual
LEFT JOIN auth_management.profiles p ON ual.user_id = p.id
LEFT JOIN auth.users u ON p.user_id = u.id
WHERE ual.created_at > NOW() - INTERVAL '30 days'
ORDER BY ual.created_at DESC
LIMIT 100;

-- =====================================================
-- Comments
-- =====================================================

COMMENT ON VIEW admin_dashboard.recent_activity IS
    'Recent user activity for admin dashboard (last 100 actions from the past 30 days).
     FIXED 2025-11-24: Now correctly references audit_logging.user_activity_logs table.
     Joins with profiles for user information and provides activity details.';

-- =====================================================
-- Usage
-- =====================================================

-- Query recent activity:
-- SELECT * FROM admin_dashboard.recent_activity;

-- =====================================================
-- Dependencies
-- =====================================================

-- Required tables:
-- - audit_logging.user_activity_logs (source table) ✅ CORRECTED
-- - auth_management.profiles (for full_name, avatar_url)
-- - auth.users (for email)

-- =====================================================
-- Backend Usage
-- =====================================================

-- Endpoint: GET /api/admin/actions/recent
-- Controller: AdminDashboardController
-- Service: AdminDashboardService
-- Query: SELECT * FROM admin_dashboard.recent_activity;
