-- =====================================================
-- ENUM: educational_content.exercise_type
-- Descripcion: Tipos de ejercicios y mecanicas educativas (23+ tipos)
-- Migrado de: 00-prerequisites.sql
-- Fecha de migracion: 2026-01-07
-- Ver: PLAN-CONSOLIDACION-BD-2026-01-07.md (FASE 2)
-- =====================================================
-- Documentacion:
-- Requerimiento: docs/01-requerimientos/03-contenido-educativo/RF-EDU-001-mecanicas-ejercicios.md
-- Especificacion: docs/02-especificaciones-tecnicas/03-contenido-educativo/ET-EDU-001-mecanicas-ejercicios.md
-- UPDATED 2025-11-17: Sincronizado con seeds reales
-- UPDATED 2026-01-04: Agregados 4 tipos auxiliares
-- =====================================================

DO $$ BEGIN
    CREATE TYPE educational_content.exercise_type AS ENUM (
        -- ====================================================================
        -- MODULOS IMPLEMENTADOS (17 mecanicas) - AUTO-EVALUABLES
        -- ====================================================================

        -- Module 1: Comprension Literal (7 mecanicas)
        'completar_espacios', 'crucigrama', 'emparejamiento', 'linea_tiempo',
        'mapa_conceptual', 'sopa_letras', 'verdadero_falso',

        -- Module 2: Comprension Inferencial (5 mecanicas)
        'construccion_hipotesis', 'detective_textual', 'prediccion_narrativa',
        'puzzle_contexto', 'rueda_inferencias',

        -- Module 3: Comprension Critica (5 mecanicas)
        'analisis_fuentes', 'debate_digital', 'matriz_perspectivas',
        'podcast_argumentativo', 'tribunal_opiniones',

        -- ====================================================================
        -- BACKLOG: FASE 4 (8 mecanicas) - EVALUACION MANUAL/IA REQUERIDA
        -- ====================================================================

        -- Module 4: Lectura Digital (9 mecanicas)
        'analisis_memes', 'infografia_interactiva', 'navegacion_hipertextual',
        'quiz_tiktok', 'verificador_fake_news',
        'chat_literario', 'email_formal', 'ensayo_argumentativo', 'resena_critica',

        -- Module 5: Produccion Lectora (3 mecanicas)
        'comic_digital', 'diario_multimedia', 'video_carta',

        -- ====================================================================
        -- TIPOS AUXILIARES (4) - Sincronizacion con Backend
        -- ====================================================================
        'comprension_auditiva',   -- Ejercicio de comprension auditiva
        'collage_prensa',         -- Ejercicio de collage con recortes de prensa
        'texto_movimiento',       -- Ejercicio de texto en movimiento/animado
        'call_to_action'          -- Ejercicio de llamada a la accion (CTA)
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

COMMENT ON TYPE educational_content.exercise_type IS 'Tipos de ejercicios educativos - 27 mecanicas (17 implementadas + 10 backlog)';
