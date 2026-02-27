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
        -- MODULE 1: Comprension Literal (5 activos + 2 auxiliares asignables)
        -- Activos: crucigrama, linea_tiempo, completar_espacios, verdadero_falso, sopa_letras
        -- Auxiliares asignables: emparejamiento, mapa_conceptual
        -- ====================================================================
        'completar_espacios', 'crucigrama', 'emparejamiento', 'linea_tiempo',
        'mapa_conceptual', 'sopa_letras', 'verdadero_falso',

        -- ====================================================================
        -- MODULE 2: Comprension Inferencial (5 mecanicas) - AUTO-EVALUABLES
        -- ====================================================================
        'construccion_hipotesis', 'detective_textual', 'prediccion_narrativa',
        'puzzle_contexto', 'rueda_inferencias',

        -- ====================================================================
        -- MODULE 3: Comprension Critica (5 mecanicas) - EVALUACION MANUAL
        -- ====================================================================
        'analisis_fuentes', 'debate_digital', 'matriz_perspectivas',
        'podcast_argumentativo', 'tribunal_opiniones',

        -- ====================================================================
        -- MODULE 4: Lectura Digital (9 mecanicas) - EVALUACION MANUAL
        -- 5 activos + 4 backlog (chat_literario, email_formal, ensayo_argumentativo, resena_critica)
        -- ====================================================================
        'analisis_memes', 'infografia_interactiva', 'navegacion_hipertextual',
        'quiz_tiktok', 'verificador_fake_news',
        'chat_literario', 'email_formal', 'ensayo_argumentativo', 'resena_critica',

        -- ====================================================================
        -- MODULE 5: Produccion Lectora (3 mecanicas) - EVALUACION MANUAL
        -- ====================================================================
        'comic_digital', 'diario_multimedia', 'video_carta',

        -- ====================================================================
        -- TIPOS AUXILIARES (4) - No asignados a modulo especifico
        -- (mapa_conceptual y emparejamiento estan arriba con M1 pero son auxiliares)
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
