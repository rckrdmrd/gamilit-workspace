-- =====================================================
-- Table: data_warehouse.dim_students
-- Description: Student dimension with SCD Type 2 for historical tracking
-- Type: Dimension (Slowly Changing Dimension Type 2)
-- Grain: One row per student version
-- Source: auth_management.profiles, gamification_system.user_stats
-- SCD Type: Type 2 (Track history with effective dates)
-- Created: 2026-02-03
-- Sprint: 2.1 - Data Warehouse Design
-- =====================================================

SET search_path TO data_warehouse, public;

DROP TABLE IF EXISTS data_warehouse.dim_students CASCADE;

CREATE TABLE data_warehouse.dim_students (
    -- =====================================================
    -- SURROGATE KEY
    -- =====================================================
    student_key BIGSERIAL NOT NULL,

    -- =====================================================
    -- NATURAL KEY (From source system)
    -- =====================================================
    student_id UUID NOT NULL,            -- auth_management.profiles.id

    -- =====================================================
    -- STUDENT PROFILE ATTRIBUTES
    -- =====================================================
    display_name TEXT,
    full_name TEXT,
    first_name TEXT,
    last_name TEXT,
    email TEXT NOT NULL,
    avatar_url TEXT,

    -- =====================================================
    -- EDUCATIONAL ATTRIBUTES
    -- =====================================================
    grade_level TEXT,                    -- '6', '7', '8', etc.
    school_id UUID,
    school_name TEXT,                    -- Denormalized for query performance

    -- =====================================================
    -- GAMIFICATION ATTRIBUTES (Point-in-time snapshot)
    -- =====================================================
    current_rank TEXT,                   -- Maya rank at this version
    current_level INTEGER,               -- Level at this version
    total_xp INTEGER,                    -- XP accumulated at this version
    ml_coins_balance INTEGER,            -- Coins balance at this version

    -- =====================================================
    -- STATUS ATTRIBUTES
    -- =====================================================
    status TEXT NOT NULL DEFAULT 'active',
    role TEXT NOT NULL DEFAULT 'student',

    -- =====================================================
    -- REGISTRATION INFO
    -- =====================================================
    registration_date DATE NOT NULL,
    first_activity_date DATE,
    last_activity_date DATE,

    -- =====================================================
    -- SCD TYPE 2 COLUMNS
    -- =====================================================
    effective_date DATE NOT NULL,        -- When this version became active
    expiration_date DATE,                -- When this version expired (NULL = current)
    is_current BOOLEAN NOT NULL DEFAULT TRUE,
    version_number INTEGER NOT NULL DEFAULT 1,

    -- =====================================================
    -- AUDIT COLUMNS
    -- =====================================================
    source_updated_at TIMESTAMP WITH TIME ZONE,
    etl_loaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    etl_batch_id TEXT,

    -- =====================================================
    -- CONSTRAINTS
    -- =====================================================
    CONSTRAINT dim_students_pkey PRIMARY KEY (student_key),
    CONSTRAINT dim_students_status_check CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    CONSTRAINT dim_students_role_check CHECK (role IN ('student', 'admin_teacher', 'super_admin', 'parent')),
    CONSTRAINT dim_students_dates_check CHECK (expiration_date IS NULL OR expiration_date >= effective_date)
);

-- =====================================================
-- INDEXES
-- =====================================================
-- Natural key lookup (most common)
CREATE INDEX idx_dim_students_student_id ON data_warehouse.dim_students USING btree (student_id);
CREATE INDEX idx_dim_students_student_id_current ON data_warehouse.dim_students USING btree (student_id) WHERE is_current = TRUE;

-- Current version lookup (filtered index for efficiency)
CREATE INDEX idx_dim_students_is_current ON data_warehouse.dim_students USING btree (is_current) WHERE is_current = TRUE;

-- SCD lookup for point-in-time queries
CREATE INDEX idx_dim_students_effective_dates ON data_warehouse.dim_students USING btree (student_id, effective_date, expiration_date);

-- Business attribute lookups
CREATE INDEX idx_dim_students_email ON data_warehouse.dim_students USING btree (email);
CREATE INDEX idx_dim_students_grade_level ON data_warehouse.dim_students USING btree (grade_level);
CREATE INDEX idx_dim_students_school ON data_warehouse.dim_students USING btree (school_id) WHERE school_id IS NOT NULL;
CREATE INDEX idx_dim_students_rank ON data_warehouse.dim_students USING btree (current_rank);
CREATE INDEX idx_dim_students_status ON data_warehouse.dim_students USING btree (status);

-- =====================================================
-- OWNERSHIP AND PERMISSIONS
-- =====================================================
ALTER TABLE data_warehouse.dim_students OWNER TO gamilit_user;
GRANT SELECT, INSERT, UPDATE ON data_warehouse.dim_students TO gamilit_user;
GRANT USAGE ON SEQUENCE data_warehouse.dim_students_student_key_seq TO gamilit_user;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE data_warehouse.dim_students IS
'Student dimension - SCD Type 2 for tracking student attribute changes over time.
Grain: One row per student version.
Sources: auth_management.profiles, gamification_system.user_stats.
SCD Type 2 tracks: grade_level, rank, level, status changes.
Query current version with: WHERE is_current = TRUE.
Query point-in-time with: WHERE effective_date <= date AND (expiration_date > date OR expiration_date IS NULL).';

COMMENT ON COLUMN data_warehouse.dim_students.student_key IS 'Surrogate key - auto-incrementing, unique per version';
COMMENT ON COLUMN data_warehouse.dim_students.student_id IS 'Natural key from auth_management.profiles.id';
COMMENT ON COLUMN data_warehouse.dim_students.is_current IS 'TRUE for the current active version of this student';
COMMENT ON COLUMN data_warehouse.dim_students.effective_date IS 'Date when this version became active (SCD2)';
COMMENT ON COLUMN data_warehouse.dim_students.expiration_date IS 'Date when this version expired, NULL for current (SCD2)';
