-- ============================================================================
-- File: 07-rate_limit_logs.sql
-- Schema: notifications
-- Description: Rate limit audit logs for notification system
-- Version: 1.0 (2026-02-03)
-- ============================================================================

-- Rate limit logs table for audit and analytics
-- Records when notifications are allowed or blocked due to rate limits
DROP TABLE IF EXISTS notifications.rate_limit_logs CASCADE;

CREATE TABLE notifications.rate_limit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- User reference
    user_id UUID NOT NULL REFERENCES auth_management.profiles(id) ON DELETE CASCADE,

    -- Rate limit details
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('in_app', 'email', 'push', 'sms', 'global')),
    action VARCHAR(20) NOT NULL CHECK (action IN ('allowed', 'blocked')),

    -- Limit information at time of action
    limit_value INTEGER NOT NULL,
    current_count INTEGER NOT NULL,
    window_seconds INTEGER NOT NULL,

    -- Optional tenant for multi-tenant scenarios
    tenant_id UUID,

    -- Metadata
    metadata JSONB DEFAULT '{}',

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for querying
CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_user_id
    ON notifications.rate_limit_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_channel
    ON notifications.rate_limit_logs(channel);

CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_action
    ON notifications.rate_limit_logs(action);

CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_created_at
    ON notifications.rate_limit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_tenant_id
    ON notifications.rate_limit_logs(tenant_id)
    WHERE tenant_id IS NOT NULL;

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_rate_limit_logs_user_channel_date
    ON notifications.rate_limit_logs(user_id, channel, created_at DESC);

-- Comments
COMMENT ON TABLE notifications.rate_limit_logs IS
    'Audit log for rate limiting decisions on notifications';

COMMENT ON COLUMN notifications.rate_limit_logs.channel IS
    'Notification channel: in_app, email, push, sms, or global for user-level limit';

COMMENT ON COLUMN notifications.rate_limit_logs.action IS
    'Whether the notification was allowed or blocked';

COMMENT ON COLUMN notifications.rate_limit_logs.limit_value IS
    'The configured limit at the time of the action';

COMMENT ON COLUMN notifications.rate_limit_logs.current_count IS
    'The current count when the action was taken';

COMMENT ON COLUMN notifications.rate_limit_logs.window_seconds IS
    'The time window in seconds for the rate limit';

-- Cleanup function to remove old logs (keep 30 days by default)
CREATE OR REPLACE FUNCTION notifications.cleanup_rate_limit_logs(
    older_than_days INTEGER DEFAULT 30
) RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM notifications.rate_limit_logs
    WHERE created_at < NOW() - (older_than_days || ' days')::INTERVAL;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION notifications.cleanup_rate_limit_logs IS
    'Cleanup old rate limit logs. Default: remove logs older than 30 days';

-- RLS policies for rate_limit_logs
ALTER TABLE notifications.rate_limit_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own rate limit logs
CREATE POLICY rate_limit_logs_select_own ON notifications.rate_limit_logs
    FOR SELECT
    USING (user_id = gamilit.get_current_user_id());

-- Only system/admin can insert logs (via service)
CREATE POLICY rate_limit_logs_insert_system ON notifications.rate_limit_logs
    FOR INSERT
    WITH CHECK (true); -- Controlled at application level

-- Grant permissions
GRANT SELECT ON notifications.rate_limit_logs TO gamilit_user;
GRANT INSERT ON notifications.rate_limit_logs TO gamilit_user;
GRANT EXECUTE ON FUNCTION notifications.cleanup_rate_limit_logs TO gamilit_user;
