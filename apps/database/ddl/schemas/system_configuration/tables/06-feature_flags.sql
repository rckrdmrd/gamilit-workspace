-- =============================================================================
-- Table: system_configuration.feature_flags
-- Description: Manages system-wide and tenant-specific feature flags
-- Priority: P0 - CRITICAL for Admin Portal configuration
-- User Story: US-AE-003 (System Configuration), US-ADM-006 (Classroom Config)
-- Created: 2025-11-19
-- =============================================================================

-- Drop table if exists
DROP TABLE IF EXISTS system_configuration.feature_flags CASCADE;

-- Create feature_flags table
CREATE TABLE system_configuration.feature_flags (
    -- Primary key
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Feature identification
    flag_key VARCHAR(100) NOT NULL UNIQUE,
    flag_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),  -- e.g., 'gamification', 'educational', 'admin', 'social', 'integration'

    -- Feature status
    is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    is_system_wide BOOLEAN NOT NULL DEFAULT TRUE,  -- If false, can be overridden per tenant/classroom

    -- Rollout configuration
    rollout_percentage INTEGER DEFAULT 100,  -- For gradual rollout (0-100)
    rollout_strategy VARCHAR(50) DEFAULT 'all',  -- 'all', 'percentage', 'whitelist', 'beta_users'

    -- User targeting (for whitelist and role-based access)
    target_users UUID[] DEFAULT ARRAY[]::UUID[],  -- User whitelist
    target_roles auth_management.gamilit_role[] DEFAULT ARRAY[]::auth_management.gamilit_role[],  -- Role-based access

    -- Time windows (for scheduled feature releases)
    starts_at TIMESTAMPTZ,  -- Feature becomes available at this time
    ends_at TIMESTAMPTZ,    -- Feature becomes unavailable after this time

    -- Dependencies
    depends_on_flags JSONB DEFAULT '[]'::jsonb,  -- Array of flag_keys that must be enabled
    conflicts_with JSONB DEFAULT '[]'::jsonb,    -- Array of flag_keys that cannot be enabled together

    -- Configuration
    default_value JSONB DEFAULT 'true'::jsonb,   -- Default value when flag is enabled
    config_schema JSONB,                         -- JSON schema for validation
    config_options JSONB DEFAULT '{}'::jsonb,    -- Additional configuration options

    -- Tenant/Scope overrides
    tenant_overrides JSONB DEFAULT '{}'::jsonb,
    -- Example: {"tenant-uuid-1": true, "tenant-uuid-2": false}

    classroom_overrides JSONB DEFAULT '{}'::jsonb,
    -- Example: {"classroom-uuid-1": {"enabled": true, "config": {...}}}

    -- Access control
    required_role VARCHAR(50),  -- Minimum role required to toggle this flag
    is_user_configurable BOOLEAN DEFAULT FALSE,  -- Can users change this flag?

    -- Metadata
    tags JSONB DEFAULT '[]'::jsonb,              -- Tags for organization
    documentation_url TEXT,                       -- Link to feature documentation
    changelog TEXT,                               -- Change history

    -- Lifecycle
    created_by UUID REFERENCES auth_management.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    enabled_at TIMESTAMPTZ,                      -- When the flag was last enabled
    disabled_at TIMESTAMPTZ,                     -- When the flag was last disabled
    deprecated_at TIMESTAMPTZ,                   -- When the flag was marked as deprecated
    will_be_removed_at TIMESTAMPTZ,              -- Planned removal date

    -- Constraints
    CONSTRAINT feature_flags_rollout_percentage_valid
        CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
    CONSTRAINT feature_flags_rollout_strategy_valid
        CHECK (rollout_strategy IN ('all', 'percentage', 'whitelist', 'beta_users', 'gradual'))
);

-- =============================================================================
-- Indexes
-- =============================================================================

-- Primary lookup index
CREATE INDEX idx_feature_flags_key ON system_configuration.feature_flags(flag_key);

-- Index for enabled flags lookup
CREATE INDEX idx_feature_flags_enabled
    ON system_configuration.feature_flags(flag_key)
    WHERE is_enabled = TRUE;

-- Index for category-based queries
CREATE INDEX idx_feature_flags_category
    ON system_configuration.feature_flags(category, is_enabled);

-- Index for system-wide flags
CREATE INDEX idx_feature_flags_system_wide
    ON system_configuration.feature_flags(is_system_wide, is_enabled);

-- GIN index for searching tags
CREATE INDEX idx_feature_flags_tags
    ON system_configuration.feature_flags USING GIN(tags);

-- =============================================================================
-- Trigger for updated_at
-- =============================================================================

CREATE OR REPLACE FUNCTION system_configuration.update_feature_flags_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();

    -- Track when flag was enabled/disabled
    IF NEW.is_enabled = TRUE AND OLD.is_enabled = FALSE THEN
        NEW.enabled_at = NOW();
    ELSIF NEW.is_enabled = FALSE AND OLD.is_enabled = TRUE THEN
        NEW.disabled_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- NOTE: Trigger trigger_update_feature_flags_timestamp movido a archivo separado
-- Ver: system_configuration/triggers/29-trg_feature_flags_updated_at.sql

-- =============================================================================
-- Helper function MOVED to dedicated file
-- =============================================================================
-- NOTE: La función is_feature_enabled() fue consolidada en:
-- system_configuration/functions/is_feature_enabled.sql
--
-- Esta función unificada soporta:
--   - User targeting (p_user_id)
--   - Tenant overrides (p_tenant_id)
--   - Classroom overrides (p_classroom_id)
--   - Role-based access
--   - Rollout percentage
--   - Time windows
--
-- Eliminada de este archivo: 2026-01-17 (TASK-2026-01-17-001)
-- =============================================================================

-- =============================================================================
-- Comments
-- =============================================================================

COMMENT ON TABLE system_configuration.feature_flags IS
'System-wide feature flags for enabling/disabling functionality across the platform.
Supports tenant and classroom-level overrides for granular control.';

COMMENT ON COLUMN system_configuration.feature_flags.flag_key IS
'Unique identifier for the feature flag (e.g., ''enable_gamification'', ''allow_ai_hints'')';

COMMENT ON COLUMN system_configuration.feature_flags.rollout_percentage IS
'Percentage of users/tenants that should have this feature enabled (0-100)';

COMMENT ON COLUMN system_configuration.feature_flags.target_users IS
'Array of user UUIDs that have access to this feature (whitelist)';

COMMENT ON COLUMN system_configuration.feature_flags.target_roles IS
'Array of roles that have access to this feature (role-based access)';

COMMENT ON COLUMN system_configuration.feature_flags.starts_at IS
'Feature becomes available at this time (time window start)';

COMMENT ON COLUMN system_configuration.feature_flags.ends_at IS
'Feature becomes unavailable after this time (time window end)';

COMMENT ON FUNCTION system_configuration.is_feature_enabled IS
'Check if a feature is enabled for a specific context (tenant and/or classroom).
Usage: SELECT system_configuration.is_feature_enabled(''my_feature'', tenant_uuid, classroom_uuid);';

-- =============================================================================
-- Grant permissions
-- =============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON system_configuration.feature_flags TO gamilit_user;
GRANT EXECUTE ON FUNCTION system_configuration.is_feature_enabled TO gamilit_user;
