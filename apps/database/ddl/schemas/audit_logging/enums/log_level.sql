-- =====================================================
-- ENUM: audit_logging.log_level
-- Descripcion: Niveles de severidad de logs
-- Migrado de: 00-prerequisites.sql
-- Fecha de migracion: 2026-01-07
-- Ver: PLAN-CONSOLIDACION-BD-2026-01-07.md (FASE 2)
-- =====================================================
-- Documentacion:
-- Requerimiento: docs/01-requerimientos/08-auditoria-configuracion/RF-AUD-001-sistema-auditoria.md
-- Especificacion: docs/02-especificaciones-tecnicas/08-auditoria-configuracion/ET-AUD-001-sistema-auditoria.md
-- =====================================================

DO $$ BEGIN
    CREATE TYPE audit_logging.log_level AS ENUM (
        'debug',     -- Mensajes de depuracion
        'info',      -- Informacion general
        'warning',   -- Advertencias
        'error',     -- Errores recuperables
        'critical'   -- Errores criticos
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMENT ON TYPE audit_logging.log_level IS 'Niveles de severidad para sistema de logging';
