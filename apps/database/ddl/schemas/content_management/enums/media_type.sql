-- =====================================================
-- ENUM: content_management.media_type
-- Descripcion: Tipos de archivos multimedia
-- Migrado de: 00-prerequisites.sql
-- Fecha de migracion: 2026-01-07
-- Ver: PLAN-CONSOLIDACION-BD-2026-01-07.md (FASE 2)
-- =====================================================
-- Documentacion:
-- Requerimiento: docs/01-requerimientos/07-contenido-media/RF-CNT-001-gestion-media.md
-- Especificacion: docs/02-especificaciones-tecnicas/07-contenido-media/ET-CNT-001-gestion-media.md
-- VERSION: 1.1 (2025-11-08) - Migrado de public a content_management
-- =====================================================

DO $$ BEGIN
    CREATE TYPE content_management.media_type AS ENUM (
        'image',        -- Imagenes (jpg, png, webp, svg)
        'video',        -- Videos (mp4, webm)
        'audio',        -- Audio (mp3, wav, ogg)
        'document',     -- Documentos (pdf, doc, txt)
        'interactive',  -- Contenido interactivo (html5, lottie)
        'animation'     -- Animaciones (lottie, gif animado) - v1.2 sincronizado con backend
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMENT ON TYPE content_management.media_type IS 'Tipos de archivos multimedia soportados (v1.2 - 2026-01-07 - agregado animation)';
