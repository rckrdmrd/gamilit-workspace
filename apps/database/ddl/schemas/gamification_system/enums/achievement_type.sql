-- =====================================================
-- ENUM: gamification_system.achievement_type
-- Descripcion: Tipos de logros en el sistema de gamificacion
-- Migrado de: 00-prerequisites.sql
-- Fecha de migracion: 2026-01-07
-- Ver: PLAN-CONSOLIDACION-BD-2026-01-07.md (FASE 2)
-- =====================================================
-- Documentacion:
-- Requerimiento: docs/01-requerimientos/02-gamificacion/RF-GAM-001-achievements.md
-- Especificacion: docs/02-especificaciones-tecnicas/02-gamificacion/ET-GAM-001-achievements.md
-- =====================================================

DO $$ BEGIN
    CREATE TYPE gamification_system.achievement_type AS ENUM (
        'badge',           -- Insignia estandar
        'milestone',       -- Hito de progreso
        'special',         -- Logro especial/evento
        'rank_promotion'   -- Promocion de rango
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMENT ON TYPE gamification_system.achievement_type IS 'Tipos de logros del sistema de gamificacion';
