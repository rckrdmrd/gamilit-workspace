-- =====================================================
-- ENUM: social_features.classroom_role
-- Descripcion: Roles dentro de un aula virtual
-- Migrado de: 00-prerequisites.sql
-- Fecha de migracion: 2026-01-07
-- Ver: PLAN-CONSOLIDACION-BD-2026-01-07.md (FASE 2)
-- =====================================================
-- Documentacion:
-- Requerimiento: docs/01-requerimientos/05-caracteristicas-sociales/RF-SOC-001-aulas-virtuales.md
-- Especificacion: docs/02-especificaciones-tecnicas/05-caracteristicas-sociales/ET-SOC-001-aulas-virtuales.md
-- =====================================================

DO $$ BEGIN
    CREATE TYPE social_features.classroom_role AS ENUM (
        'teacher',    -- Profesor titular del aula
        'student',    -- Estudiante inscrito
        'assistant'   -- Asistente o profesor auxiliar
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMENT ON TYPE social_features.classroom_role IS 'Roles dentro de un aula virtual';
