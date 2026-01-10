-- =====================================================
-- ENUM: content_management.processing_status
-- Descripcion: Estados de procesamiento de archivos multimedia
-- Migrado de: 00-prerequisites.sql
-- Fecha de migracion: 2026-01-07
-- Ver: PLAN-CONSOLIDACION-BD-2026-01-07.md (FASE 2)
-- =====================================================
-- Documentacion:
-- Requerimiento: docs/01-requerimientos/07-contenido-media/RF-CNT-001-gestion-media.md
-- Especificacion: docs/02-especificaciones-tecnicas/07-contenido-media/ET-CNT-001-gestion-media.md
-- VERSION: 1.2 (2025-11-11) - Sincronizado con Backend/Frontend
-- =====================================================

DO $$ BEGIN
    CREATE TYPE content_management.processing_status AS ENUM (
        'uploading',    -- Archivo subiendo
        'processing',   -- Archivo en procesamiento
        'ready',        -- Archivo listo para uso
        'error',        -- Error en procesamiento
        'optimizing'    -- Archivo en optimizacion
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMENT ON TYPE content_management.processing_status IS 'Estados de procesamiento de media (v1.2 - 2025-11-11)';
