-- =====================================================
-- ENUM: auth_management.auth_provider
-- Descripcion: Proveedores de autenticacion OAuth2/OIDC
-- Migrado de: 00-prerequisites.sql
-- Fecha de migracion: 2026-01-07
-- Ver: PLAN-CONSOLIDACION-BD-2026-01-07.md (FASE 2)
-- =====================================================
-- Documentacion:
-- Requerimiento: docs/01-requerimientos/01-autenticacion-autorizacion/RF-AUTH-003-oauth.md
-- Especificacion: docs/02-especificaciones-tecnicas/01-autenticacion-autorizacion/ET-AUTH-003-oauth.md
-- VERSION: 1.1 (2025-11-08) - Migrado de public a auth_management
-- =====================================================

DO $$ BEGIN
    CREATE TYPE auth_management.auth_provider AS ENUM (
        'local',      -- Autenticacion local (email/password)
        'google',     -- Google OAuth2
        'facebook',   -- Facebook OAuth2
        'apple',      -- Apple Sign-In
        'microsoft',  -- Microsoft Azure AD
        'github'      -- GitHub OAuth2
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMENT ON TYPE auth_management.auth_provider IS 'Proveedores de autenticacion OAuth2/OIDC (v1.1 - 2025-11-08)';
