-- =====================================================
-- Seed Data: Exercises Module 5 - Producción Creativa (DEV)
-- =====================================================
-- Description: 3 ejercicios creativos del Módulo 5
-- Module: MOD-05-CREATIVO
-- Exercises: Diario Multimedia, Cómic Digital, Video-Carta
-- Created by: SA-SEEDS-EDUCATIONAL
-- Date: 2025-11-02
-- =====================================================

SET search_path TO educational_content, public;

DO $$
DECLARE
    mod_id UUID;
BEGIN
    SELECT id INTO mod_id FROM educational_content.modules WHERE module_code = 'MOD-05-CREATIVO';

    IF mod_id IS NULL THEN
        RAISE EXCEPTION 'Módulo MOD-05-CREATIVO no encontrado';
    END IF;

    -- EXERCISE 5.1: DIARIO MULTIMEDIA
    INSERT INTO educational_content.exercises (
        module_id, title, subtitle, description, instructions,
        exercise_type, order_index, config, content, solution,
        difficulty_level, max_points, passing_score,
        estimated_time_minutes, max_attempts,
        xp_reward, ml_coins_reward, is_active, version
    ) VALUES (
        mod_id, 'Diario Multimedia de Marie Curie', 'Imagina su Vida Cotidiana',
        'Crea entradas de diario multimedia desde la perspectiva de Marie Curie en 1898.',
        'Escribe 3 entradas de diario (texto, imagen, audio o video) como si fueras Marie.',
        'diario_multimedia', 1,
        '{"allowMultimedia": true, "minEntries": 3, "formats": ["text", "image", "audio", "video"]}'::jsonb,
        '{"prompts": [
            {"date": "1898-12-15", "context": "Día del descubrimiento del radio", "mood": "excitement"},
            {"date": "1898-12-20", "context": "Reflexión sobre dificultades", "mood": "determination"},
            {"date": "1898-12-26", "context": "Sueños para el futuro", "mood": "hope"}
        ]}'::jsonb,
        '{"rubric": {"creativity": 30, "historical_accuracy": 30, "multimedia": 20, "expression": 20}}'::jsonb,
        'intermediate', 100, 70, 40, 3, 40, 20, true, 1
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW();

    -- EXERCISE 5.2: CÓMIC DIGITAL
    INSERT INTO educational_content.exercises (
        module_id, title, subtitle, description, instructions,
        exercise_type, order_index, config, content, solution,
        difficulty_level, max_points, passing_score,
        estimated_time_minutes, max_attempts,
        xp_reward, ml_coins_reward, is_active, version
    ) VALUES (
        mod_id, 'Cómic Digital: El Descubrimiento del Radio', 'Narrativa Visual Científica',
        'Crea un cómic de 4-6 viñetas narrando el descubrimiento del radio por Marie.',
        'Usa herramienta de cómic para ilustrar la historia del descubrimiento paso a paso.',
        'comic_digital', 2,
        '{"minPanels": 4, "maxPanels": 6, "requireDialogue": true, "requireNarration": true}'::jsonb,
        '{"storyBeats": [
            {"panel": 1, "scene": "Marie en laboratorio con pechblenda", "action": "observing"},
            {"panel": 2, "scene": "Descubre anomalía en radiación", "action": "discovery"},
            {"panel": 3, "scene": "Años de trabajo refinando mineral", "action": "perseverance"},
            {"panel": 4, "scene": "Aislamiento exitoso de radio brillante", "action": "triumph"}
        ]}'::jsonb,
        '{"rubric": {"narrative": 25, "visual": 25, "accuracy": 25, "creativity": 25}}'::jsonb,
        'intermediate', 100, 70, 50, 3, 45, 22, true, 1
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW();

    -- EXERCISE 5.3: VIDEO-CARTA
    INSERT INTO educational_content.exercises (
        module_id, title, subtitle, description, instructions,
        exercise_type, order_index, config, content, solution,
        difficulty_level, max_points, passing_score,
        estimated_time_minutes, max_attempts,
        xp_reward, ml_coins_reward, is_active, version
    ) VALUES (
        mod_id, 'Video-Carta: Mensaje de Marie al Futuro', 'Comunicación Temporal',
        'Graba video (o escribe guión) como Marie Curie en 1925 enviando mensaje al siglo XXI.',
        'Imagina que eres Marie en 1925. ¿Qué mensaje enviarías a las generaciones futuras?',
        'video_carta', 3,
        '{"videoRequired": true, "scriptAlternative": true, "minDuration": 120, "maxDuration": 300}'::jsonb,
        '{"themes": [
            "Importancia de educación para mujeres",
            "Futuro de la ciencia y tecnología",
            "Ética científica y responsabilidad",
            "Esperanzas para la humanidad",
            "Legado personal y profesional"
        ], "perspective": "Marie Curie en 1925 (69 años)", "tone": "reflexivo, inspiracional"}'::jsonb,
        '{"rubric": {"authenticity": 25, "message": 25, "presentation": 25, "emotion": 25}}'::jsonb,
        'advanced', 100, 70, 60, 3, 50, 25, true, 1
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET content = EXCLUDED.content, updated_at = NOW();

    UPDATE educational_content.modules
    SET total_exercises = 3, metadata = jsonb_set(COALESCE(metadata, '{}'::jsonb), '{exercises_loaded}', 'true'::jsonb), updated_at = NOW()
    WHERE id = mod_id;

    RAISE NOTICE '✅ Módulo 5 (MOD-05-CREATIVO): 3 ejercicios cargados exitosamente';
END $$;
