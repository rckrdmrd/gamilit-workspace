-- ============================================================================
-- DDL: auth_management.two_factor_tokens
-- GAP-P0-001: Two-Factor Authentication tokens
-- ============================================================================

CREATE TABLE IF NOT EXISTS auth_management.two_factor_tokens (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Method: email, sms, or authenticator
    method varchar(20) NOT NULL CHECK (method IN ('email', 'sms', 'authenticator')),

    -- For TOTP authenticator apps (encrypted)
    secret_key varchar(255),

    -- For email/sms OTP (hashed)
    token_hash varchar(255),

    -- Status
    is_enabled boolean DEFAULT false,
    is_verified boolean DEFAULT false,

    -- Timestamps
    verified_at timestamptz,
    expires_at timestamptz,

    -- Rate limiting
    attempts_count int DEFAULT 0,
    last_attempt_at timestamptz,
    locked_until timestamptz,

    -- Backup codes (encrypted JSON array)
    backup_codes_encrypted text,

    -- Audit
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_2fa_user ON auth_management.two_factor_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_2fa_token ON auth_management.two_factor_tokens(token_hash) WHERE token_hash IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_2fa_enabled ON auth_management.two_factor_tokens(user_id, is_enabled) WHERE is_enabled = true;

-- Comment
COMMENT ON TABLE auth_management.two_factor_tokens IS 'Two-factor authentication configuration and OTP tokens';
