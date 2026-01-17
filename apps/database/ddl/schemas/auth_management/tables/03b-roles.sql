-- =====================================================
-- Table: auth_management.roles
-- Description: Catalogo maestro de roles del sistema (RBAC)
-- Dependencies: None
-- Created: 2026-01-07 (Sprint 3-4 - TAREA 2: Fix admin/roles error)
-- =====================================================
--
-- Esta tabla define los roles disponibles en el sistema.
-- Es diferente de user_roles que almacena las ASIGNACIONES de roles a usuarios.
--
-- Roles del sistema:
-- - student: Estudiante
-- - admin_teacher: Profesor administrador
-- - super_admin: Super administrador
-- - content_creator: Creador de contenido (futuro)
-- - school_admin: Administrador de escuela (futuro)
-- =====================================================

SET search_path TO auth_management, public;

-- Drop table if exists
DROP TABLE IF EXISTS auth_management.roles CASCADE;

-- Create table
CREATE TABLE auth_management.roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,

    -- Role name (unique identifier)
    name varchar(50) NOT NULL,

    -- Human-readable description
    description text,

    -- Permissions in JSON format
    -- Example: {"can_create_content": true, "can_delete_users": false}
    permissions jsonb DEFAULT '{}'::jsonb NOT NULL,

    -- Whether the role is currently active
    is_active boolean DEFAULT true NOT NULL,

    -- Timestamps
    created_at timestamp with time zone DEFAULT gamilit.now_mexico() NOT NULL,
    updated_at timestamp with time zone DEFAULT gamilit.now_mexico() NOT NULL,

    -- Primary Key
    CONSTRAINT roles_pkey PRIMARY KEY (id),

    -- Unique Constraints
    CONSTRAINT roles_name_key UNIQUE (name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_roles_name ON auth_management.roles USING btree (name);
CREATE INDEX IF NOT EXISTS idx_roles_is_active ON auth_management.roles USING btree (is_active);

-- Updated_at trigger: MOVIDO a triggers/00-batch_updated_at_triggers.sql
-- Ver: auth_management/triggers/00-batch_updated_at_triggers.sql:55-62
-- CONSOLIDACIÓN 2026-01-17 (TASK-2026-01-17-001): Eliminado de este archivo para evitar duplicación

-- Comments
COMMENT ON TABLE auth_management.roles IS 'Catalogo maestro de roles del sistema para RBAC';
COMMENT ON COLUMN auth_management.roles.name IS 'Nombre unico del rol (student, admin_teacher, super_admin)';
COMMENT ON COLUMN auth_management.roles.description IS 'Descripcion legible del rol';
COMMENT ON COLUMN auth_management.roles.permissions IS 'Permisos del rol en formato JSON';
COMMENT ON COLUMN auth_management.roles.is_active IS 'Indica si el rol esta activo en el sistema';

-- Permissions
ALTER TABLE auth_management.roles OWNER TO gamilit_user;
GRANT ALL ON TABLE auth_management.roles TO gamilit_user;

-- =====================================================
-- Insert default roles
-- =====================================================
INSERT INTO auth_management.roles (name, description, permissions, is_active) VALUES
    ('student', 'Estudiante - Usuario basico de la plataforma',
     '{"can_view_content": true, "can_submit_exercises": true, "can_view_progress": true}'::jsonb,
     true),
    ('admin_teacher', 'Profesor Administrador - Gestiona aulas y estudiantes',
     '{"can_view_content": true, "can_create_content": true, "can_manage_classroom": true, "can_view_analytics": true}'::jsonb,
     true),
    ('super_admin', 'Super Administrador - Acceso completo al sistema',
     '{"can_view_content": true, "can_create_content": true, "can_delete_content": true, "can_manage_users": true, "can_manage_roles": true, "can_view_analytics": true, "can_manage_system": true}'::jsonb,
     true)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    permissions = EXCLUDED.permissions,
    is_active = EXCLUDED.is_active,
    updated_at = gamilit.now_mexico();
