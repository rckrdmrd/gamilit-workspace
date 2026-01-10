-- =====================================================
-- ENUM: gamification_system.maya_rank
-- Descripcion: Rangos maya del sistema de gamificacion
-- Migrado de: 00-prerequisites.sql
-- Fecha de migracion: 2026-01-07
-- Ver: PLAN-CONSOLIDACION-BD-2026-01-07.md (FASE 2)
-- =====================================================
-- Documentacion:
-- Requerimiento: docs/01-requerimientos/02-gamificacion/RF-GAM-003-rangos-maya.md
-- Especificacion: docs/02-especificaciones-tecnicas/02-gamificacion/ET-GAM-003-rangos-maya.md
-- =====================================================

DO $$ BEGIN
    CREATE TYPE gamification_system.maya_rank AS ENUM (
        'Ajaw',           -- Nivel 1: Senor o gobernante, lider supremo (0-999 XP)
        'Nacom',          -- Nivel 2: Capitan de guerra, comandante militar (1,000-2,999 XP)
        'Ah K''in',       -- Nivel 3: Sacerdote del sol, guia espiritual (3,000-5,999 XP)
        'Halach Uinic',   -- Nivel 4: Hombre verdadero, lider politico (6,000-9,999 XP)
        'K''uk''ulkan'    -- Nivel 5: Serpiente emplumada, nivel legendario (10,000+ XP)
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMENT ON TYPE gamification_system.maya_rank IS 'Rangos maya del sistema de gamificacion - 5 niveles de progresion';
