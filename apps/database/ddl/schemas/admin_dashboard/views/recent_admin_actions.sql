-- =====================================================
-- View: admin_dashboard.recent_admin_actions
-- Description: Recent admin actions from audit log
-- Type: Normal View
-- Created: 2025-10-16
-- Updated: 2025-11-24 - Corregida tabla audit_log_events → audit_logs (ISSUE-P2-001)
-- =====================================================

CREATE OR REPLACE VIEW admin_dashboard.recent_admin_actions AS
SELECT
    al.id,
    al.action,
    al.resource_type,
    al.resource_id,
    al.description,
    al.status,
    al.created_at,
    u.email as admin_email,
    p.full_name as admin_name
FROM audit_logging.audit_logs al
LEFT JOIN auth.users u ON al.actor_id = u.id
LEFT JOIN auth_management.profiles p ON al.actor_id = p.id
WHERE al.event_type = 'admin_action'
ORDER BY al.created_at DESC
LIMIT 100;

COMMENT ON VIEW admin_dashboard.recent_admin_actions IS 'Recent admin actions from audit log.

CORRECTED (2025-11-24 - ISSUE-P2-001):
- Changed table from audit_log_events (does not exist) to audit_logs
- Changed JOIN profiles from p.user_id to p.id (audit_logs.actor_id is FK to profiles.id)';
