-- =====================================================
-- Function: audit_logging.log_audit_event
-- Description: Registra eventos de auditoría en audit_logs
-- Priority: CRITICAL - Compliance requirement
-- Created: 2025-10-27
-- Updated: 2026-02-05 (FIX H-033: Target table corrected system_logs → audit_logs)
-- =====================================================

CREATE OR REPLACE FUNCTION audit_logging.log_audit_event(
    p_user_id uuid,
    p_action text,
    p_table_name text,
    p_record_id uuid DEFAULT NULL,
    p_old_data jsonb DEFAULT NULL,
    p_new_data jsonb DEFAULT NULL,
    p_ip_address inet DEFAULT NULL,
    p_user_agent text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_log_id uuid;
    v_tenant_id uuid;
BEGIN
    -- Get tenant_id from user profile
    SELECT tenant_id INTO v_tenant_id
    FROM auth_management.profiles
    WHERE id = p_user_id;

    -- Insert into audit_logs (the correct audit table)
    INSERT INTO audit_logging.audit_logs (
        tenant_id,
        event_type,
        action,
        resource_type,
        resource_id,
        actor_id,
        actor_type,
        actor_ip,
        actor_user_agent,
        old_values,
        new_values,
        severity,
        status,
        created_at
    )
    VALUES (
        v_tenant_id,
        'DATA_CHANGE',
        p_action,
        p_table_name,
        p_record_id,
        p_user_id,
        'user',
        p_ip_address,
        p_user_agent,
        COALESCE(p_old_data, '{}'::jsonb),
        COALESCE(p_new_data, '{}'::jsonb),
        'info',
        'success',
        NOW()
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the transaction
        RAISE WARNING 'Failed to log audit event: %', SQLERRM;
        RETURN NULL;
END;
$$;

COMMENT ON FUNCTION audit_logging.log_audit_event IS 'Registra eventos de auditoría en audit_logs con manejo de errores';

-- Grant permissions
GRANT EXECUTE ON FUNCTION audit_logging.log_audit_event TO gamilit_user;
