-- =====================================================
-- ENUMs for Digital Certificates System
-- Schema: progress_tracking
-- EPIC: 10.2 - Digital Certificates System
-- Created: 2026-01-04
-- =====================================================

-- Certificate Status Enum
-- Tracks the lifecycle state of a certificate
CREATE TYPE progress_tracking.certificate_status AS ENUM (
    'pending',    -- Certificate created but not yet issued
    'issued',     -- Certificate issued and valid
    'revoked',    -- Certificate revoked (no longer valid)
    'expired'     -- Certificate past expiration date
);

COMMENT ON TYPE progress_tracking.certificate_status IS
    'Estado del certificado: pending (creado), issued (emitido), revoked (revocado), expired (expirado)';

-- Certificate Type Enum
-- Categorizes certificates by achievement type
CREATE TYPE progress_tracking.certificate_type AS ENUM (
    'module_completion',   -- Completed a single module
    'course_completion',   -- Completed an entire course
    'achievement',         -- Special achievement or milestone
    'skill_mastery'        -- Mastered a specific skill
);

COMMENT ON TYPE progress_tracking.certificate_type IS
    'Tipo de certificado: module_completion, course_completion, achievement, skill_mastery';
