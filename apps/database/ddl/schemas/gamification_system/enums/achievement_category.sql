-- =====================================================
-- ENUM: gamification_system.achievement_category
-- Descripcion: Categorias de logros en el sistema de gamificacion
-- Migrado de: 00-prerequisites.sql
-- Fecha de migracion: 2026-01-07
-- Ver: PLAN-CONSOLIDACION-BD-2026-01-07.md (FASE 2)
-- =====================================================
-- Documentacion:
-- Requerimiento: docs/01-requerimientos/02-gamificacion/RF-GAM-001-achievements.md
-- Especificacion: docs/02-especificaciones-tecnicas/02-gamificacion/ET-GAM-001-achievements.md
-- VERSION: 1.1 (2025-12-15) - Agregados 'collection' y 'hidden'
-- =====================================================

DO $$ BEGIN
    CREATE TYPE gamification_system.achievement_category AS ENUM (
        'progress',     -- Logros de progreso general
        'streak',       -- Logros de rachas consecutivas
        'completion',   -- Logros de completar contenido
        'social',       -- Logros sociales (amigos, grupos)
        'special',      -- Logros especiales/eventos
        'mastery',      -- Logros de maestria/dominio
        'exploration',  -- Logros de exploracion
        'collection',   -- Logros de coleccion (V1.1)
        'hidden'        -- Logros ocultos/secretos (V1.1)
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMENT ON TYPE gamification_system.achievement_category IS 'Categorias de logros (v1.1 - 2025-12-15 - agregados collection y hidden)';
