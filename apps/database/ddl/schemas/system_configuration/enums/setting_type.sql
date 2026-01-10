-- =====================================================
-- ENUM: system_configuration.setting_type
-- Descripcion: Tipos de configuracion del sistema
-- Migrado de: 00-prerequisites.sql
-- Fecha de migracion: 2026-01-07
-- Ver: PLAN-CONSOLIDACION-BD-2026-01-07.md (FASE 2)
-- =====================================================
-- VERSION: 1.1 (2025-11-08) - Migrado de public a system_configuration
-- =====================================================

DO $$ BEGIN
    CREATE TYPE system_configuration.setting_type AS ENUM (
        'string',   -- Valor de texto
        'number',   -- Valor numerico
        'boolean',  -- Valor booleano (true/false)
        'json',     -- Valor JSON estructurado
        'array'     -- Valor de array
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMENT ON TYPE system_configuration.setting_type IS 'Tipos de valores de configuracion del sistema (v1.1)';
