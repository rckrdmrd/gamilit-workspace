-- =====================================================
-- ENUM: audit_logging.alert_status
-- Descripcion: Estados de alertas del sistema
-- Migrado de: 00-prerequisites.sql
-- Fecha de migracion: 2026-01-07
-- Ver: PLAN-CONSOLIDACION-BD-2026-01-07.md (FASE 2)
-- =====================================================

DO $$ BEGIN
    CREATE TYPE audit_logging.alert_status AS ENUM (
        'active',        -- Alerta activa
        'acknowledged',  -- Alerta reconocida
        'resolved',      -- Alerta resuelta
        'ignored'        -- Alerta ignorada
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMENT ON TYPE audit_logging.alert_status IS 'Estados de alertas del sistema';
