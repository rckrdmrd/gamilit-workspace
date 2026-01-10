-- =====================================================
-- ENUM: social_features.friendship_status
-- Descripcion: Estados de relacion de amistad
-- Migrado de: 00-prerequisites.sql
-- Fecha de migracion: 2026-01-07
-- Ver: PLAN-CONSOLIDACION-BD-2026-01-07.md (FASE 2)
-- =====================================================

DO $$ BEGIN
    CREATE TYPE social_features.friendship_status AS ENUM (
        'pending',    -- Solicitud pendiente
        'accepted',   -- Amistad aceptada
        'rejected',   -- Solicitud rechazada - v1.1 sincronizado con backend
        'blocked'     -- Usuario bloqueado
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMENT ON TYPE social_features.friendship_status IS 'Estados de relacion de amistad entre usuarios (v1.1 - 2026-01-07 - agregado rejected)';
