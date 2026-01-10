-- =====================================================
-- ENUM: audit_logging.audit_action
-- Descripcion: Tipos de acciones auditables
-- Migrado de: 00-prerequisites.sql
-- Fecha de migracion: 2026-01-07
-- Ver: PLAN-CONSOLIDACION-BD-2026-01-07.md (FASE 2)
-- =====================================================
-- Documentacion:
-- Requerimiento: docs/01-requerimientos/08-auditoria-configuracion/RF-AUD-001-sistema-auditoria.md
-- Especificacion: docs/02-especificaciones-tecnicas/08-auditoria-configuracion/ET-AUD-001-sistema-auditoria.md
-- =====================================================

DO $$ BEGIN
    CREATE TYPE audit_logging.audit_action AS ENUM (
        'create',   -- Creacion de registro
        'update',   -- Actualizacion de registro
        'delete',   -- Eliminacion de registro
        'login',    -- Inicio de sesion
        'logout',   -- Cierre de sesion
        'access',   -- Acceso a recurso
        'export',   -- Exportacion de datos
        'import'    -- Importacion de datos
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMENT ON TYPE audit_logging.audit_action IS 'Tipos de acciones auditables en el sistema';
