-- =====================================================
-- ENUM: educational_content.module_status
-- Descripcion: Estados de modulos educativos
-- Migrado de: 00-prerequisites.sql
-- Fecha de migracion: 2026-01-07
-- Ver: PLAN-CONSOLIDACION-BD-2026-01-07.md (FASE 2)
-- =====================================================
-- VERSION: 1.2 (2025-11-23) - Agregado 'backlog'
-- VERSION: 1.1 (2025-11-08) - Renombrado 'reviewing' a 'under_review'
-- =====================================================

DO $$ BEGIN
    CREATE TYPE educational_content.module_status AS ENUM (
        'draft',        -- Modulo en borrador, no publicado
        'published',    -- Modulo publicado y disponible para estudiantes
        'archived',     -- Modulo archivado, no visible
        'under_review', -- Modulo en revision pedagogica (v1.1)
        'backlog'       -- Modulo disenado pero fuera de alcance (v1.2)
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMENT ON TYPE educational_content.module_status IS 'Estados de modulos educativos (v1.2 - 2025-11-23 - agregado backlog)';
