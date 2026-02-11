-- =====================================================
-- Table: auth_management.profiles
-- Description: Perfiles de usuario con información básica, rol y configuraciones
-- Dependencies: auth_management.tenants, auth.users
-- Created: 2025-10-27
-- Migrated: 2025-11-02 (SA-MIGRACION-2-2-2-1)
-- Changes: Agregados campos first_name, last_name, bio, school_id para alineación con UserProfile type
--
-- 📚 Documentación:
-- Requerimiento: docs/01-requerimientos/01-autenticacion-autorizacion/RF-AUTH-001-roles.md
-- Requerimiento: docs/01-requerimientos/01-autenticacion-autorizacion/RF-AUTH-002-estados-cuenta.md
-- Especificación: docs/02-especificaciones-tecnicas/01-autenticacion-autorizacion/ET-AUTH-001-rbac.md
-- Especificación: docs/02-especificaciones-tecnicas/01-autenticacion-autorizacion/ET-AUTH-002-estados-cuenta.md
-- =====================================================

SET search_path TO auth_management, public;

DROP TABLE IF EXISTS auth_management.profiles CASCADE;

CREATE TABLE auth_management.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    tenant_id uuid NOT NULL,
    display_name text,
    full_name text,
    first_name text,
    last_name text,
    email text NOT NULL,
    avatar_url text,
    bio text,
    phone text,
    date_of_birth date,
    grade_level text,
    student_id text,
    school_id uuid,
    role auth_management.gamilit_role DEFAULT 'student'::auth_management.gamilit_role NOT NULL,
    status auth_management.user_status DEFAULT 'active'::auth_management.user_status NOT NULL,
    email_verified boolean DEFAULT false,
    phone_verified boolean DEFAULT false,
    preferences jsonb DEFAULT '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    last_sign_in_at timestamp with time zone,
    last_activity_at timestamp with time zone,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT gamilit.now_mexico(),
    updated_at timestamp with time zone DEFAULT gamilit.now_mexico(),
    deleted_at timestamp with time zone DEFAULT NULL,
    user_id uuid,

    -- Primary Key
    CONSTRAINT profiles_pkey PRIMARY KEY (id),

    -- Unique Constraints
    CONSTRAINT profiles_email_key UNIQUE (email),
    CONSTRAINT profiles_user_id_key UNIQUE (user_id),

    -- Check Constraints
    CONSTRAINT profiles_email_check CHECK ((email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'::text)),
    CONSTRAINT profiles_bio_length_check CHECK (bio IS NULL OR LENGTH(bio) <= 500),

    -- Foreign Keys (with fk_ prefix per standard)
    CONSTRAINT fk_profiles_tenant_id FOREIGN KEY (tenant_id) REFERENCES auth_management.tenants(id) ON DELETE CASCADE,
    CONSTRAINT fk_profiles_user_id FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
    -- NOTE: FK school_id DIFERIDO para resolver dependencia circular
    -- La constraint fk_profiles_school_id se crea DESPUÉS en:
    -- ddl/schemas/auth_management/fk-constraints/01-profiles-school-fk.sql
    -- Razón: profiles (Fase 5) → schools (Fase 9) crea dependencia circular
    -- Ver: REPORTE-ANALISIS-DEPENDENCIAS-DDL-2025-11-10.md
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON auth_management.profiles USING btree (email);
CREATE INDEX IF NOT EXISTS idx_profiles_email_status ON auth_management.profiles USING btree (email, status) WHERE (status = 'active'::auth_management.user_status);
CREATE INDEX IF NOT EXISTS idx_profiles_last_activity ON auth_management.profiles USING btree (last_activity_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_preferences_gin ON auth_management.profiles USING gin (preferences);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON auth_management.profiles USING btree (role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON auth_management.profiles USING btree (status);
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_id ON auth_management.profiles USING btree (tenant_id);
CREATE INDEX IF NOT EXISTS idx_profiles_tenant_role_status ON auth_management.profiles USING btree (tenant_id, role, status);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON auth_management.profiles USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_school_id ON auth_management.profiles USING btree (school_id) WHERE (school_id IS NOT NULL);
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON auth_management.profiles(deleted_at) WHERE deleted_at IS NULL;

-- NOTE: Triggers movidos a archivos separados en triggers/ para evitar duplicación
-- Ver: triggers/03-trg_audit_profile_changes.sql
-- Ver: triggers/04-trg_initialize_user_stats.sql
-- Ver: triggers/05-trg_profiles_updated_at.sql

-- Row Level Security Policies
CREATE POLICY profiles_select_admin ON auth_management.profiles
    FOR SELECT USING (gamilit.is_admin());

CREATE POLICY profiles_select_own ON auth_management.profiles
    FOR SELECT USING ((id = gamilit.get_current_user_id()));

CREATE POLICY profiles_update_admin ON auth_management.profiles
    FOR UPDATE USING (gamilit.is_admin());

CREATE POLICY profiles_update_own ON auth_management.profiles
    FOR UPDATE USING ((id = gamilit.get_current_user_id()));

-- Comments
COMMENT ON TABLE auth_management.profiles IS 'Perfiles de usuario con información básica, rol y configuraciones';
COMMENT ON COLUMN auth_management.profiles.first_name IS 'Primer nombre del usuario';
COMMENT ON COLUMN auth_management.profiles.last_name IS 'Apellido(s) del usuario';
COMMENT ON COLUMN auth_management.profiles.bio IS 'Biografía o descripción del usuario (máximo 500 caracteres)';
COMMENT ON COLUMN auth_management.profiles.school_id IS 'ID de la escuela del estudiante (pendiente tabla schools)';
COMMENT ON COLUMN auth_management.profiles.grade_level IS 'Grado escolar del estudiante (ej: "6", "7", "8")';
COMMENT ON COLUMN auth_management.profiles.role IS 'Rol del usuario: student, admin_teacher, super_admin';
COMMENT ON COLUMN auth_management.profiles.deleted_at IS 'Soft-delete timestamp. NULL = active, NOT NULL = deleted. DB-124 H-022: Prevents accidental data loss from CASCADE deletes (77 FKs to this table)';

-- Permissions
ALTER TABLE auth_management.profiles OWNER TO gamilit_user;
GRANT ALL ON TABLE auth_management.profiles TO gamilit_user;
