-- =============================================================================
-- FUNCTION: audit_logging.log_system_event
-- =============================================================================
-- Purpose: Logs system events for monitoring and debugging purposes
-- Priority: P2 - System event logging function
-- Responsibility: SA-DB-031
-- Created: 2025-11-02
-- Updated: 2026-02-05 (FIX H-033: Column mapping corrected to actual system_logs schema)
-- =============================================================================

CREATE OR REPLACE FUNCTION audit_logging.log_system_event(
    p_event_type TEXT,
    p_event_source TEXT,
    p_event_data JSONB DEFAULT NULL,
    p_severity TEXT DEFAULT 'INFO'
)
RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
    v_valid_severity BOOLEAN;
    v_log_level TEXT;
BEGIN
    -- Validate severity level
    v_valid_severity := p_severity IN ('DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL');

    IF NOT v_valid_severity THEN
        RAISE EXCEPTION 'Invalid severity level: %', p_severity;
    END IF;

    -- Map severity to system_logs.log_level CHECK values (TRACE, DEBUG, INFO, WARN, ERROR, FATAL)
    v_log_level := CASE p_severity
        WHEN 'WARNING' THEN 'WARN'
        WHEN 'CRITICAL' THEN 'FATAL'
        ELSE p_severity
    END;

    -- Insert system event into system_logs with correct column names
    INSERT INTO audit_logging.system_logs (
        log_level,
        message,
        module_name,
        extra_data,
        created_at
    ) VALUES (
        v_log_level,
        p_event_type,
        p_event_source,
        COALESCE(p_event_data, '{}'::jsonb),
        NOW()
    )
    RETURNING id INTO v_event_id;

    -- Return the created event ID
    RETURN v_event_id;

EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error logging system event: %', SQLERRM;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, audit_logging;

-- Documentation comment
COMMENT ON FUNCTION audit_logging.log_system_event(TEXT, TEXT, JSONB, TEXT) IS
'Logs system events for monitoring and debugging purposes.
Parameters:
  - p_event_type: Type of event mapped to message column (e.g., ''DATABASE_BACKUP_START'', ''API_ERROR'')
  - p_event_source: Source component mapped to module_name column
  - p_event_data: Optional JSONB data mapped to extra_data column
  - p_severity: DEBUG, INFO, WARNING, ERROR, CRITICAL (mapped to log_level: WARNING→WARN, CRITICAL→FATAL)
Returns:
  - UUID of the created system log entry, or NULL on error
Example:
  SELECT log_system_event(
    ''API_REQUEST_TIMEOUT''::TEXT,
    ''auth_service''::TEXT,
    jsonb_build_object(''user_id'', 123, ''endpoint'', ''/api/auth/login''),
    ''WARNING''::TEXT
  );';
