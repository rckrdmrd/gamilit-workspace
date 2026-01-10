-- =====================================================
-- ENUM: auth_management.gamilit_role
-- Descripcion: Roles principales de usuario en la plataforma GAMILIT
-- Migrado de: 00-prerequisites.sql
-- Fecha de migracion: 2026-01-07
-- Ver: PLAN-CONSOLIDACION-BD-2026-01-07.md (FASE 2)
-- =====================================================
-- Documentacion:
-- Requerimiento: docs/01-requerimientos/01-autenticacion-autorizacion/RF-AUTH-001-roles.md
-- Especificacion: docs/02-especificaciones-tecnicas/01-autenticacion-autorizacion/ET-AUTH-001-rbac.md
-- =====================================================

DO $$ BEGIN
    CREATE TYPE auth_management.gamilit_role AS ENUM (
        'student',        -- Estudiante: acceso a contenido educativo y gamificacion
        'admin_teacher',  -- Profesor administrador: gestion de aulas y estudiantes
        'super_admin'     -- Super administrador: acceso total a la plataforma
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMENT ON TYPE auth_management.gamilit_role IS 'Roles de usuario en la plataforma GAMILIT (v1.0)';
