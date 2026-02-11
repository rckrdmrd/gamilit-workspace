-- =====================================================
-- Table: social_features.schools
-- Description: Instituciones educativas - escuelas y colegios
-- Dependencies: auth_management.tenants, auth_management.profiles
-- =====================================================

DROP TABLE IF EXISTS social_features.schools CASCADE;

CREATE TABLE social_features.schools (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    name text NOT NULL,
    code text,
    short_name text,
    description text,
    address text,
    city text,
    region text,
    country text DEFAULT 'México'::text,
    postal_code text,
    phone text,
    email text,
    website text,
    principal_id uuid,
    administrative_contact_id uuid,
    academic_year text,
    semester_system boolean DEFAULT true,
    grade_levels text[] DEFAULT ARRAY['6'::text, '7'::text, '8'::text],
    settings jsonb DEFAULT '{}'::jsonb,
    max_students integer DEFAULT 1000,
    max_teachers integer DEFAULT 100,
    current_students_count integer DEFAULT 0,
    current_teachers_count integer DEFAULT 0,
    is_active boolean DEFAULT true,
    is_verified boolean DEFAULT false,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT gamilit.now_mexico(),
    updated_at timestamptz DEFAULT gamilit.now_mexico(),

    -- Primary Key
    CONSTRAINT schools_pkey PRIMARY KEY (id),

    -- Unique Constraints
    CONSTRAINT schools_code_key UNIQUE (code)
);

-- Indexes
CREATE INDEX idx_schools_active ON social_features.schools(is_active) WHERE is_active = true;
CREATE INDEX idx_schools_code ON social_features.schools(code);
CREATE INDEX idx_schools_tenant ON social_features.schools(tenant_id);

-- Foreign Keys
ALTER TABLE ONLY social_features.schools
    ADD CONSTRAINT schools_administrative_contact_id_fkey FOREIGN KEY (administrative_contact_id) REFERENCES auth_management.profiles(id) ON DELETE SET NULL;

ALTER TABLE ONLY social_features.schools
    ADD CONSTRAINT schools_principal_id_fkey FOREIGN KEY (principal_id) REFERENCES auth_management.profiles(id) ON DELETE SET NULL;

ALTER TABLE ONLY social_features.schools
    ADD CONSTRAINT schools_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES auth_management.tenants(id) ON DELETE CASCADE;

-- Triggers
-- NOTE: Trigger trg_schools_updated_at movido a archivo separado
-- Ver: social_features/triggers/27-trg_schools_updated_at.sql

-- Comments
COMMENT ON TABLE social_features.schools IS 'Instituciones educativas - escuelas y colegios';

-- Permissions
ALTER TABLE social_features.schools OWNER TO gamilit_user;
GRANT ALL ON TABLE social_features.schools TO gamilit_user;
