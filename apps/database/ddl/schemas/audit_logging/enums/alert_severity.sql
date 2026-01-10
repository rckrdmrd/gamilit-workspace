-- =====================================================
-- ENUM: audit_logging.alert_severity
-- Descripcion: Niveles de severidad de alertas del sistema
-- Migrado de: 00-prerequisites.sql
-- Fecha de migracion: 2026-01-07
-- Ver: PLAN-CONSOLIDACION-BD-2026-01-07.md (FASE 2)
-- =====================================================

DO $$ BEGIN
    CREATE TYPE audit_logging.alert_severity AS ENUM (
        'info',      -- Informativa
        'warning',   -- Advertencia
        'error',     -- Error
        'critical'   -- Critica
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMENT ON TYPE audit_logging.alert_severity IS 'Niveles de severidad de alertas del sistema';
