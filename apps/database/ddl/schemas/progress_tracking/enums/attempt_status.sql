-- =====================================================
-- ENUM: progress_tracking.attempt_status
-- Descripcion: Estados de intentos de ejercicios
-- Migrado de: 00-prerequisites.sql
-- Fecha de migracion: 2026-01-07
-- Ver: PLAN-CONSOLIDACION-BD-2026-01-07.md (FASE 2)
-- =====================================================
-- Documentacion:
-- Requerimiento: docs/01-requerimientos/04-progreso-seguimiento/RF-PRG-001-estados-progreso.md
-- Especificacion: docs/02-especificaciones-tecnicas/04-progreso-seguimiento/ET-PRG-001-estados-progreso.md
-- =====================================================

DO $$ BEGIN
    CREATE TYPE progress_tracking.attempt_status AS ENUM (
        'in_progress',  -- Intento en progreso
        'submitted',    -- Intento enviado, pendiente de evaluacion
        'graded',       -- Intento calificado automaticamente
        'reviewed'      -- Intento revisado manualmente
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMENT ON TYPE progress_tracking.attempt_status IS 'Estados de intentos de ejercicios';
