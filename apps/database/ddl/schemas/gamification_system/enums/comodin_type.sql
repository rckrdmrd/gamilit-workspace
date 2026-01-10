-- =====================================================
-- ENUM: gamification_system.comodin_type
-- Descripcion: Tipos de comodines disponibles en el sistema
-- Migrado de: 00-prerequisites.sql
-- Fecha de migracion: 2026-01-07
-- Ver: PLAN-CONSOLIDACION-BD-2026-01-07.md (FASE 2)
-- =====================================================
-- Documentacion:
-- Requerimiento: docs/01-requerimientos/02-gamificacion/RF-GAM-002-comodines.md
-- Especificacion: docs/02-especificaciones-tecnicas/02-gamificacion/ET-GAM-002-comodines.md
-- =====================================================

DO $$ BEGIN
    CREATE TYPE gamification_system.comodin_type AS ENUM (
        'pistas',              -- Comodin de pistas: revela informacion util
        'vision_lectora',      -- Comodin vision lectora: resalta palabras clave
        'segunda_oportunidad'  -- Comodin segunda oportunidad: permite reintentar
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMENT ON TYPE gamification_system.comodin_type IS 'Tipos de comodines del sistema de gamificacion';
