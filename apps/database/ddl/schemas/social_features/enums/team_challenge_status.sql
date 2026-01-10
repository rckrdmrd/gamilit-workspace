-- =====================================================
-- ENUM: social_features.team_challenge_status
-- Descripcion: Estados de desafios de equipos
-- Creado: 2026-01-07
-- Sincronizado con: backend/src/shared/constants/enums.constants.ts
-- =====================================================

DO $$ BEGIN
    CREATE TYPE social_features.team_challenge_status AS ENUM (
        'active',       -- Desafio activo y disponible
        'in_progress',  -- Desafio en curso
        'completed',    -- Desafio completado exitosamente
        'failed',       -- Desafio fallido
        'cancelled'     -- Desafio cancelado
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMENT ON TYPE social_features.team_challenge_status IS 'Estados de desafios de equipos (v1.0 - 2026-01-07)';
