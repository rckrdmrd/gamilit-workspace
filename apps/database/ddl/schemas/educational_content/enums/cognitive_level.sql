-- =====================================================
-- ENUM: educational_content.cognitive_level
-- Descripcion: Niveles cognitivos de Bloom para ejercicios
-- Migrado de: 00-prerequisites.sql
-- Fecha de migracion: 2026-01-07
-- Ver: PLAN-CONSOLIDACION-BD-2026-01-07.md (FASE 2)
-- =====================================================
-- Basado en la Taxonomia de Bloom revisada
-- =====================================================

DO $$ BEGIN
    CREATE TYPE educational_content.cognitive_level AS ENUM (
        'recordar',    -- Nivel 1: Recordar - recuperar informacion
        'comprender',  -- Nivel 2: Comprender - construir significado
        'aplicar',     -- Nivel 3: Aplicar - usar en situaciones nuevas
        'analizar',    -- Nivel 4: Analizar - descomponer en partes
        'evaluar',     -- Nivel 5: Evaluar - hacer juicios basados en criterios
        'crear'        -- Nivel 6: Crear - producir algo nuevo
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMENT ON TYPE educational_content.cognitive_level IS 'Niveles cognitivos de Bloom para clasificacion de ejercicios';
