-- =============================================================================
-- FUNCTION: system_configuration.is_feature_enabled (UNIFIED)
-- =============================================================================
-- Purpose: Unified function to check if a feature flag is enabled
-- Supports: user targeting, tenant/classroom overrides, role-based, rollout %
-- Priority: P2 - Feature flag management function
-- Responsibility: SA-DB-031
-- Created: 2025-11-02
-- Modified: 2025-11-07 - Refactored to use global feature_flags table only (D4-A)
-- Modified: 2026-01-17 - UNIFIED: Merged tenant/classroom overrides (TASK-2026-01-17-001)
-- =============================================================================

CREATE OR REPLACE FUNCTION system_configuration.is_feature_enabled(
    p_feature_key TEXT,
    p_user_id UUID DEFAULT NULL,
    p_tenant_id UUID DEFAULT NULL,
    p_classroom_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_feature RECORD;
    v_user_role auth_management.gamilit_role;
    v_user_hash INTEGER;
    v_override_enabled BOOLEAN;
BEGIN
    -- Get feature flag configuration
    SELECT
        is_enabled,
        is_system_wide,
        target_users,
        target_roles,
        rollout_percentage,
        starts_at,
        ends_at,
        tenant_overrides,
        classroom_overrides
    INTO v_feature
    FROM system_configuration.feature_flags
    WHERE flag_key = p_feature_key
    LIMIT 1;

    -- If feature not found or not enabled globally
    IF v_feature.is_enabled IS NULL OR NOT v_feature.is_enabled THEN
        RETURN FALSE;
    END IF;

    -- Check time window (if specified)
    IF v_feature.starts_at IS NOT NULL AND NOW() < v_feature.starts_at THEN
        RETURN FALSE;
    END IF;
    IF v_feature.ends_at IS NOT NULL AND NOW() > v_feature.ends_at THEN
        RETURN FALSE;
    END IF;

    -- =========================================================================
    -- PRIORITY 1: Classroom override (highest priority)
    -- =========================================================================
    IF p_classroom_id IS NOT NULL AND v_feature.classroom_overrides IS NOT NULL THEN
        v_override_enabled := (v_feature.classroom_overrides->p_classroom_id::TEXT->>'enabled')::BOOLEAN;
        IF v_override_enabled IS NOT NULL THEN
            RETURN v_override_enabled;
        END IF;
    END IF;

    -- =========================================================================
    -- PRIORITY 2: Tenant override
    -- =========================================================================
    IF p_tenant_id IS NOT NULL AND v_feature.tenant_overrides IS NOT NULL THEN
        v_override_enabled := (v_feature.tenant_overrides->p_tenant_id::TEXT)::BOOLEAN;
        IF v_override_enabled IS NOT NULL THEN
            RETURN v_override_enabled;
        END IF;
    END IF;

    -- =========================================================================
    -- PRIORITY 3: System-wide flag (no user-specific checks needed)
    -- =========================================================================
    IF v_feature.is_system_wide IS TRUE THEN
        RETURN TRUE;
    END IF;

    -- If no specific user check, return global status
    IF p_user_id IS NULL THEN
        RETURN TRUE;
    END IF;

    -- =========================================================================
    -- PRIORITY 4: User whitelist
    -- =========================================================================
    IF v_feature.target_users IS NOT NULL AND p_user_id = ANY(v_feature.target_users) THEN
        RETURN TRUE;
    END IF;

    -- =========================================================================
    -- PRIORITY 5: Role-based access
    -- =========================================================================
    IF v_feature.target_roles IS NOT NULL AND array_length(v_feature.target_roles, 1) > 0 THEN
        -- Get user's role
        SELECT role INTO v_user_role
        FROM auth_management.user_roles
        WHERE user_id = p_user_id
        LIMIT 1;

        -- Check if user's role is in target_roles
        IF v_user_role IS NOT NULL AND v_user_role = ANY(v_feature.target_roles) THEN
            RETURN TRUE;
        END IF;

        -- If target_roles is specified but user doesn't match, return FALSE
        RETURN FALSE;
    END IF;

    -- =========================================================================
    -- PRIORITY 6: Rollout percentage (gradual rollout / A-B testing)
    -- =========================================================================
    IF v_feature.rollout_percentage IS NOT NULL AND v_feature.rollout_percentage < 100 THEN
        -- Use deterministic hash of user_id to ensure consistent experience
        v_user_hash := abs(hashtext(p_user_id::TEXT)) % 100;
        RETURN v_user_hash < v_feature.rollout_percentage;
    END IF;

    -- If no targeting rules, return TRUE (globally enabled)
    RETURN TRUE;

EXCEPTION WHEN OTHERS THEN
    -- Log error and fail safe to FALSE
    RAISE NOTICE 'Error checking feature flag %: %', p_feature_key, SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public, system_configuration, auth_management;

-- Documentation comment
COMMENT ON FUNCTION system_configuration.is_feature_enabled(TEXT, UUID, UUID, UUID) IS
'UNIFIED function to check if a feature flag is enabled.

Supports multiple override levels with priority order:
1. Classroom override (highest priority)
2. Tenant override
3. System-wide flag
4. User whitelist (target_users array)
5. Role-based access (target_roles array)
6. Gradual rollout (rollout_percentage 0-100)
7. Time windows (starts_at, ends_at)

Parameters:
  - p_feature_key: The unique key identifying the feature (e.g., ''new_dashboard'')
  - p_user_id: Optional user ID for user-specific targeting
  - p_tenant_id: Optional tenant ID for tenant-level overrides
  - p_classroom_id: Optional classroom ID for classroom-level overrides

Returns:
  - TRUE if feature is enabled for the context, FALSE otherwise

Examples:
  -- Check global feature status
  SELECT system_configuration.is_feature_enabled(''new_dashboard'');

  -- Check if enabled for specific user
  SELECT system_configuration.is_feature_enabled(''beta_feature'', user_id);

  -- Check with tenant context
  SELECT system_configuration.is_feature_enabled(''premium_feature'', NULL, tenant_id);

  -- Check with full context
  SELECT system_configuration.is_feature_enabled(''classroom_feature'', user_id, tenant_id, classroom_id);

Decision Reference: D4-A (DECISIONES-ARQUITECTURALES-REQUERIDAS.md)
Unified: 2026-01-17 (TASK-2026-01-17-001)';
