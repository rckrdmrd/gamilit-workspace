-- =====================================================
-- Table: data_warehouse.dim_teachers
-- Description: Teacher dimension for instructor analytics
-- Type: Dimension
-- Grain: One row per teacher
-- Source: auth_management.profiles (role = 'admin_teacher')
-- SCD Type: Type 1 (Overwrite)
-- Created: 2026-02-03
-- Sprint: 2.1 - Data Warehouse Design
-- =====================================================

SET search_path TO data_warehouse, public;

DROP TABLE IF EXISTS data_warehouse.dim_teachers CASCADE;

CREATE TABLE data_warehouse.dim_teachers (
    -- =====================================================
    -- SURROGATE KEY
    -- =====================================================
    teacher_key BIGSERIAL NOT NULL,

    -- =====================================================
    -- NATURAL KEY (From source system)
    -- =====================================================
    teacher_id UUID NOT NULL,            -- auth_management.profiles.id

    -- =====================================================
    -- TEACHER PROFILE
    -- =====================================================
    display_name TEXT,
    full_name TEXT,
    first_name TEXT,
    last_name TEXT,
    email TEXT NOT NULL,
    avatar_url TEXT,
    phone TEXT,

    -- =====================================================
    -- INSTITUTION
    -- =====================================================
    school_id UUID,
    school_name TEXT,                    -- Denormalized
    institution_type TEXT,               -- 'public', 'private', 'charter'

    -- =====================================================
    -- TEACHING ATTRIBUTES
    -- =====================================================
    subjects_taught TEXT[],              -- ['Literatura', 'Ciencias']
    grade_levels_taught TEXT[],          -- ['6', '7', '8']
    specializations TEXT[],

    -- =====================================================
    -- METRICS (Denormalized snapshots)
    -- =====================================================
    total_classrooms INTEGER DEFAULT 0,
    total_students INTEGER DEFAULT 0,
    active_classrooms INTEGER DEFAULT 0,

    -- =====================================================
    -- STATUS
    -- =====================================================
    status TEXT NOT NULL DEFAULT 'active',
    role TEXT NOT NULL DEFAULT 'admin_teacher',

    -- =====================================================
    -- DATES
    -- =====================================================
    registration_date DATE NOT NULL,
    first_classroom_date DATE,
    last_activity_date DATE,

    -- =====================================================
    -- AUDIT COLUMNS
    -- =====================================================
    source_updated_at TIMESTAMP WITH TIME ZONE,
    etl_loaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    etl_batch_id TEXT,

    -- =====================================================
    -- CONSTRAINTS
    -- =====================================================
    CONSTRAINT dim_teachers_pkey PRIMARY KEY (teacher_key),
    CONSTRAINT dim_teachers_teacher_id_key UNIQUE (teacher_id),
    CONSTRAINT dim_teachers_status_check CHECK (status IN ('active', 'inactive', 'suspended', 'pending'))
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX idx_dim_teachers_teacher_id ON data_warehouse.dim_teachers USING btree (teacher_id);
CREATE INDEX idx_dim_teachers_email ON data_warehouse.dim_teachers USING btree (email);
CREATE INDEX idx_dim_teachers_school ON data_warehouse.dim_teachers USING btree (school_id) WHERE school_id IS NOT NULL;
CREATE INDEX idx_dim_teachers_status ON data_warehouse.dim_teachers USING btree (status);
CREATE INDEX idx_dim_teachers_active ON data_warehouse.dim_teachers USING btree (status) WHERE status = 'active';

-- GIN indexes for array searches
CREATE INDEX idx_dim_teachers_subjects ON data_warehouse.dim_teachers USING gin (subjects_taught);
CREATE INDEX idx_dim_teachers_grades ON data_warehouse.dim_teachers USING gin (grade_levels_taught);

-- =====================================================
-- OWNERSHIP AND PERMISSIONS
-- =====================================================
ALTER TABLE data_warehouse.dim_teachers OWNER TO gamilit_user;
GRANT SELECT, INSERT, UPDATE ON data_warehouse.dim_teachers TO gamilit_user;
GRANT USAGE ON SEQUENCE data_warehouse.dim_teachers_teacher_key_seq TO gamilit_user;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE data_warehouse.dim_teachers IS
'Teacher dimension - Instructor data for classroom and teacher metrics.
Grain: One row per teacher.
Source: auth_management.profiles WHERE role = admin_teacher.
Includes denormalized school info and classroom counts.';

COMMENT ON COLUMN data_warehouse.dim_teachers.teacher_key IS 'Surrogate key for fact table joins';
COMMENT ON COLUMN data_warehouse.dim_teachers.teacher_id IS 'Natural key from auth_management.profiles.id';
COMMENT ON COLUMN data_warehouse.dim_teachers.total_classrooms IS 'Total classrooms created (historical)';
COMMENT ON COLUMN data_warehouse.dim_teachers.active_classrooms IS 'Currently active classrooms';
