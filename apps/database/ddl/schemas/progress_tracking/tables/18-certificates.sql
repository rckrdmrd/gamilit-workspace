-- =====================================================
-- Table: progress_tracking.certificates
-- Description: Digital certificates issued to students
-- EPIC: 10.2 - Digital Certificates System
-- Created: 2026-01-04
--
-- Dependencies:
--   - progress_tracking.certificate_status (enum)
--   - progress_tracking.certificate_type (enum)
--   - auth_management.profiles (FK: user_id)
--   - educational_content.modules (FK: module_id)
--   - auth_management.tenants (FK: tenant_id)
--   - social_features.classrooms (FK: classroom_id)
--   - gamilit.now_mexico() (function)
--
-- Documentation:
--   - Spec: docs/02-especificaciones-tecnicas/10-epic-certificates/
-- =====================================================

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';
SET default_table_access_method = heap;

-- =====================================================
-- Create Table
-- =====================================================

DROP TABLE IF EXISTS progress_tracking.certificates CASCADE;

CREATE TABLE progress_tracking.certificates (
    -- Primary Key
    id uuid DEFAULT gen_random_uuid() NOT NULL,

    -- Core Identifiers (cross-schema references)
    user_id uuid NOT NULL,
    module_id uuid,
    tenant_id uuid,
    classroom_id uuid,

    -- Certificate Information
    certificate_type progress_tracking.certificate_type DEFAULT 'module_completion'::progress_tracking.certificate_type NOT NULL,
    title varchar(255) NOT NULL,
    description text,
    student_name varchar(255) NOT NULL,
    achievement_name varchar(255) NOT NULL,

    -- Verification
    verification_code varchar(50) NOT NULL,
    verification_url text,
    certificate_hash varchar(64),

    -- Performance Metrics (snapshot at time of issue)
    final_score numeric(5,2) DEFAULT 0,
    total_xp_earned integer DEFAULT 0,
    total_ml_coins_earned integer DEFAULT 0,
    time_spent varchar(50) DEFAULT '00:00:00',
    exercises_completed integer DEFAULT 0,

    -- Status & Lifecycle
    status progress_tracking.certificate_status DEFAULT 'pending'::progress_tracking.certificate_status NOT NULL,
    issued_at timestamp with time zone,
    expires_at timestamp with time zone,
    revoked_at timestamp with time zone,
    revocation_reason text,

    -- PDF Storage
    pdf_url text,
    pdf_path text,
    pdf_size_bytes integer,

    -- Metadata & Audit
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT gamilit.now_mexico(),
    updated_at timestamp with time zone DEFAULT gamilit.now_mexico(),

    -- Constraints
    CONSTRAINT certificates_pkey PRIMARY KEY (id),
    CONSTRAINT certificates_verification_code_key UNIQUE (verification_code),
    CONSTRAINT certificates_final_score_check CHECK ((final_score >= 0) AND (final_score <= 100)),
    CONSTRAINT certificates_xp_check CHECK (total_xp_earned >= 0),
    CONSTRAINT certificates_ml_coins_check CHECK (total_ml_coins_earned >= 0),
    CONSTRAINT certificates_exercises_check CHECK (exercises_completed >= 0)
);

ALTER TABLE progress_tracking.certificates OWNER TO gamilit_user;

-- =====================================================
-- Table Comments
-- =====================================================

COMMENT ON TABLE progress_tracking.certificates IS
    'Certificados digitales emitidos a estudiantes por completar módulos, cursos o lograr hitos. EPIC 10.2';

COMMENT ON COLUMN progress_tracking.certificates.user_id IS
    'ID del estudiante (FK a auth_management.profiles)';
COMMENT ON COLUMN progress_tracking.certificates.module_id IS
    'ID del módulo completado (FK a educational_content.modules)';
COMMENT ON COLUMN progress_tracking.certificates.verification_code IS
    'Código único para verificación QR. Formato: CERT-XXXX-XXXX-XXXX';
COMMENT ON COLUMN progress_tracking.certificates.certificate_hash IS
    'Hash SHA-256 para verificar integridad del certificado';
COMMENT ON COLUMN progress_tracking.certificates.student_name IS
    'Snapshot del nombre del estudiante al momento de emisión';
COMMENT ON COLUMN progress_tracking.certificates.final_score IS
    'Puntaje final del estudiante (0-100)';

-- =====================================================
-- Indexes
-- =====================================================

-- Index for user queries
CREATE INDEX idx_certificates_user_id
    ON progress_tracking.certificates USING btree (user_id);

-- Index for module queries
CREATE INDEX idx_certificates_module_id
    ON progress_tracking.certificates USING btree (module_id)
    WHERE module_id IS NOT NULL;

-- Index for tenant queries
CREATE INDEX idx_certificates_tenant_id
    ON progress_tracking.certificates USING btree (tenant_id)
    WHERE tenant_id IS NOT NULL;

-- Index for classroom queries
CREATE INDEX idx_certificates_classroom_id
    ON progress_tracking.certificates USING btree (classroom_id)
    WHERE classroom_id IS NOT NULL;

-- Index for status filtering
CREATE INDEX idx_certificates_status
    ON progress_tracking.certificates USING btree (status);

-- Index for date-based queries (most recent first)
CREATE INDEX idx_certificates_issued_at
    ON progress_tracking.certificates USING btree (issued_at DESC)
    WHERE issued_at IS NOT NULL;

-- Index for certificate type
CREATE INDEX idx_certificates_type
    ON progress_tracking.certificates USING btree (certificate_type);

-- Composite index for user + status queries
CREATE INDEX idx_certificates_user_status
    ON progress_tracking.certificates USING btree (user_id, status);

-- Composite index to prevent duplicate certificates
CREATE UNIQUE INDEX idx_certificates_user_module_unique
    ON progress_tracking.certificates USING btree (user_id, module_id)
    WHERE module_id IS NOT NULL AND status != 'revoked';

-- =====================================================
-- Foreign Keys (cross-schema)
-- =====================================================

ALTER TABLE ONLY progress_tracking.certificates
    ADD CONSTRAINT certificates_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES auth_management.profiles(id)
    ON DELETE CASCADE;

ALTER TABLE ONLY progress_tracking.certificates
    ADD CONSTRAINT certificates_module_id_fkey
    FOREIGN KEY (module_id)
    REFERENCES educational_content.modules(id)
    ON DELETE SET NULL;

ALTER TABLE ONLY progress_tracking.certificates
    ADD CONSTRAINT certificates_tenant_id_fkey
    FOREIGN KEY (tenant_id)
    REFERENCES auth_management.tenants(id)
    ON DELETE CASCADE;

ALTER TABLE ONLY progress_tracking.certificates
    ADD CONSTRAINT certificates_classroom_id_fkey
    FOREIGN KEY (classroom_id)
    REFERENCES social_features.classrooms(id)
    ON DELETE SET NULL;

-- =====================================================
-- Permissions
-- =====================================================

GRANT ALL ON TABLE progress_tracking.certificates TO gamilit_user;
-- Note: gamilit_readonly role removed (not created in current setup)
