-- =====================================================
-- ENUM: auth_management.user_status
-- Descripcion: Estados de cuenta de usuario
-- Migrado de: 00-prerequisites.sql
-- Fecha de migracion: 2026-01-07
-- Ver: PLAN-CONSOLIDACION-BD-2026-01-07.md (FASE 2)
-- =====================================================
-- Documentacion:
-- Requerimiento: docs/01-requerimientos/01-autenticacion-autorizacion/RF-AUTH-002-estados-cuenta.md
-- Especificacion: docs/02-especificaciones-tecnicas/01-autenticacion-autorizacion/ET-AUTH-002-estados-cuenta.md
-- VERSION: 1.1 (2025-11-08) - Agregado 'banned'
-- =====================================================

DO $$ BEGIN
    CREATE TYPE auth_management.user_status AS ENUM (
        'active',     -- Cuenta activa y funcional
        'inactive',   -- Cuenta inactiva (sin actividad prolongada)
        'suspended',  -- Cuenta suspendida temporalmente
        'banned',     -- Cuenta baneada permanentemente (v1.1)
        'pending'     -- Cuenta pendiente de verificacion
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMENT ON TYPE auth_management.user_status IS 'Estados de cuenta de usuario (v1.1 - 2025-11-08 - agregado banned)';
