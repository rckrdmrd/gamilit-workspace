-- =====================================================
-- ENUM: social_features.team_role
-- Descripcion: Roles dentro de un equipo de trabajo
-- Migrado de: 00-prerequisites.sql
-- Fecha de migracion: 2026-01-07
-- Ver: PLAN-CONSOLIDACION-BD-2026-01-07.md (FASE 2)
-- =====================================================

-- NOTA (2026-01-07): Valores alineados con backend/frontend TeamMemberRoleEnum
-- Valores anteriores (legacy): leader, coordinator
-- Valores nuevos: owner, admin
DO $$ BEGIN
    CREATE TYPE social_features.team_role AS ENUM (
        'owner',        -- Propietario/creador del equipo (antes: leader)
        'admin',        -- Administrador del equipo (antes: coordinator)
        'member'        -- Miembro regular
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMENT ON TYPE social_features.team_role IS 'Roles dentro de un equipo de trabajo (v1.1 - 2026-01-07 - alineado con backend)';
