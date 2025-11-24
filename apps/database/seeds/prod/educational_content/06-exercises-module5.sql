-- =====================================================
-- Seed Data: Exercises Module 5 - Producción y Expresión Lectora (PRODUCTION)
-- =====================================================
-- Description: 3 opciones de ejercicios inactivos del Módulo 5 (visibles pero muestran "En Construcción")
-- Module: MOD-05-PRODUCCION
-- Exercises: Diario Interactivo, Cómic Digital, Cápsula del Tiempo
-- Reference: DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md líneas 950-1097
-- Date: 2025-11-23
-- Status: PRODUCTION (INACTIVOS - is_active = false)
-- Note: El estudiante debe elegir SOLO UNO de los 3 ejercicios disponibles
-- =====================================================

SET search_path TO educational_content, public;

-- Obtener module_id dinámicamente
DO $$
DECLARE
    mod_id UUID;
BEGIN
    SELECT id INTO mod_id FROM educational_content.modules WHERE module_code = 'MOD-05-PRODUCCION';

    IF mod_id IS NULL THEN
        RAISE EXCEPTION 'Módulo MOD-05-PRODUCCION no encontrado. Ejecutar primero 01-modules.sql';
    END IF;

    -- ========================================================================
    -- EXERCISE 5.1 (OPCIÓN A): DIARIO INTERACTIVO DE MARIE
    -- Referencia: DocumentoDeDiseño v6.4 líneas 958-991
    -- Estado: INACTIVO (visible en UI pero muestra página "En Construcción")
    -- ========================================================================
    INSERT INTO educational_content.exercises (
        module_id,
        title,
        subtitle,
        description,
        instructions,
        objective,
        how_to_solve,
        recommended_strategy,
        pedagogical_notes,
        exercise_type,
        order_index,
        config,
        content,
        solution,
        difficulty_level,
        max_points,
        passing_score,
        estimated_time_minutes,
        time_limit_minutes,
        max_attempts,
        hints,
        enable_hints,
        hint_cost_ml_coins,
        comodines_allowed,
        comodines_config,
        xp_reward,
        ml_coins_reward,
        is_active,
        version
    ) VALUES (
        mod_id,
        'Diario Interactivo de Marie',
        'Escribe desde la perspectiva de Marie Curie',
        'Escribe 5 entradas de diario desde la perspectiva de Marie Curie en momentos clave de su vida.',
        'Este ejercicio estará disponible próximamente. Actualmente se encuentra en desarrollo.',
        'Escribir 5 entradas de diario desde la perspectiva de Marie Curie en momentos clave de su vida. Cada entrada debe incluir: fecha específica, saludo personal, descripción del evento, sentimientos y reflexiones, esperanzas o temores, y despedida. Usar lenguaje acorde a finales del siglo XIX / principios del XX. Mínimo 150 palabras por entrada.',
        'Este ejercicio estará disponible próximamente.',
        'Este ejercicio estará disponible próximamente.',
        'Ejercicio planificado según DocumentoDeDiseño v6.4 (líneas 958-991). El estudiante debe escribir sobre 5 momentos sugeridos: llegada a París (1891), descubrimiento del Radio (1898), primer Nobel (1903), muerte de Pierre (1906), segundo Nobel (1911). Desarrolla habilidades de escritura creativa, empatía histórica y comprensión profunda del contexto biográfico. Implementación pendiente.',
        'diario_multimedia',
        1,
        '{}'::jsonb,
        '{
            "placeholder": true,
            "message": "Este ejercicio está en desarrollo. El contenido interactivo estará disponible próximamente."
        }'::jsonb,
        '{}'::jsonb,
        'advanced',
        500,
        70,
        60,
        90,
        3,
        ARRAY['Este ejercicio estará disponible próximamente']::text[],
        true,
        15,
        ARRAY['pistas', 'vision_lectora', 'segunda_oportunidad']::gamification_system.comodin_type[],
        '{
            "pistas": {"costo": 15, "penalizacion_xp": 10},
            "vision_lectora": {"costo": 25, "penalizacion_xp": 20},
            "segunda_oportunidad": {"costo": 40, "penalizacion_xp": 30}
        }'::jsonb,
        500,
        50,
        false,  -- ← INACTIVO (muestra página "En Construcción")
        1
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        title = EXCLUDED.title,
        is_active = EXCLUDED.is_active,
        updated_at = gamilit.now_mexico();

    -- ========================================================================
    -- EXERCISE 5.2 (OPCIÓN B): CÓMIC DIGITAL DE MARIE CURIE
    -- Referencia: DocumentoDeDiseño v6.4 líneas 993-1036
    -- Estado: INACTIVO (visible en UI pero muestra página "En Construcción")
    -- ========================================================================
    INSERT INTO educational_content.exercises (
        module_id,
        title,
        subtitle,
        description,
        instructions,
        objective,
        how_to_solve,
        recommended_strategy,
        pedagogical_notes,
        exercise_type,
        order_index,
        config,
        content,
        solution,
        difficulty_level,
        max_points,
        passing_score,
        estimated_time_minutes,
        time_limit_minutes,
        max_attempts,
        hints,
        enable_hints,
        hint_cost_ml_coins,
        comodines_allowed,
        comodines_config,
        xp_reward,
        ml_coins_reward,
        is_active,
        version
    ) VALUES (
        mod_id,
        'Cómic Digital de Marie Curie',
        'Crea un cómic de 6 viñetas',
        'Crea un cómic de 6 viñetas resumiendo la vida de Marie Curie con dibujos y diálogos.',
        'Este ejercicio estará disponible próximamente. Actualmente se encuentra en desarrollo.',
        'Crear un cómic de 6 viñetas resumiendo la vida de Marie Curie. Estructura sugerida: (1) Infancia en Polonia, (2) Viaje a París, (3) Encuentro con Pierre, (4) Descubrimientos, (5) Premios Nobel, (6) Legado. Cada viñeta debe incluir dibujo o imagen, globos de diálogo, recuadros de narrador y onomatopeyas si procede. Mantener coherencia visual y narrativa.',
        'Este ejercicio estará disponible próximamente.',
        'Este ejercicio estará disponible próximamente.',
        'Ejercicio planificado según DocumentoDeDiseño v6.4 (líneas 993-1036). El estudiante aprenderá principios de narrativa visual: uso de diferentes planos (general, medio, primer plano), colores para representar emociones, balance texto-imagen. Desarrolla competencias de síntesis, expresión visual y secuenciación narrativa. Implementación pendiente.',
        'comic_digital',
        2,
        '{}'::jsonb,
        '{
            "placeholder": true,
            "message": "Este ejercicio está en desarrollo. El contenido interactivo estará disponible próximamente."
        }'::jsonb,
        '{}'::jsonb,
        'advanced',
        500,
        70,
        90,
        120,
        3,
        ARRAY['Este ejercicio estará disponible próximamente']::text[],
        true,
        15,
        ARRAY['pistas', 'vision_lectora', 'segunda_oportunidad']::gamification_system.comodin_type[],
        '{
            "pistas": {"costo": 15, "penalizacion_xp": 10},
            "vision_lectora": {"costo": 25, "penalizacion_xp": 20},
            "segunda_oportunidad": {"costo": 40, "penalizacion_xp": 30}
        }'::jsonb,
        500,
        50,
        false,  -- ← INACTIVO (muestra página "En Construcción")
        1
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        title = EXCLUDED.title,
        is_active = EXCLUDED.is_active,
        updated_at = gamilit.now_mexico();

    -- ========================================================================
    -- EXERCISE 5.3 (OPCIÓN C): CÁPSULA DEL TIEMPO DIGITAL
    -- Referencia: DocumentoDeDiseño v6.4 líneas 1038-1097
    -- Estado: INACTIVO (visible en UI pero muestra página "En Construcción")
    -- ========================================================================
    INSERT INTO educational_content.exercises (
        module_id,
        title,
        subtitle,
        description,
        instructions,
        objective,
        how_to_solve,
        recommended_strategy,
        pedagogical_notes,
        exercise_type,
        order_index,
        config,
        content,
        solution,
        difficulty_level,
        max_points,
        passing_score,
        estimated_time_minutes,
        time_limit_minutes,
        max_attempts,
        hints,
        enable_hints,
        hint_cost_ml_coins,
        comodines_allowed,
        comodines_config,
        xp_reward,
        ml_coins_reward,
        is_active,
        version
    ) VALUES (
        mod_id,
        'Cápsula del Tiempo Digital',
        'Video mensaje de Marie al futuro',
        'Crea un video de 2-3 minutos como si Marie Curie dejara un mensaje para el futuro.',
        'Este ejercicio estará disponible próximamente. Actualmente se encuentra en desarrollo.',
        'Crear un video de 2-3 minutos como si Marie Curie dejara un mensaje para el futuro. Estructura del guion: (1) Introducción (30 seg): saludo y presentación personal con contexto, (2) Mensaje Principal (90 seg): logros, desafíos y reflexiones sobre la ciencia, (3) Reflexiones y Advertencias (45 seg): peligros de la radiación y ética científica, (4) Cierre (15 seg): esperanzas para el futuro y despedida. Grabar frente a la cámara o usando avatar con caracterización de época.',
        'Este ejercicio estará disponible próximamente.',
        'Este ejercicio estará disponible próximamente.',
        'Ejercicio planificado según DocumentoDeDiseño v6.4 (líneas 1038-1097). El estudiante debe hablar en primera persona con tono de época, mantener contacto visual con la cámara, hablar pausado y claro, usar gestos apropiados y transmitir emoción. Elementos de producción opcionales: vestuario de época, fondo de laboratorio, props científicos, efectos visuales. Desarrolla habilidades de expresión oral, caracterización y producción multimedia. Implementación pendiente.',
        'video_carta',
        3,
        '{}'::jsonb,
        '{
            "placeholder": true,
            "message": "Este ejercicio está en desarrollo. El contenido interactivo estará disponible próximamente."
        }'::jsonb,
        '{}'::jsonb,
        'advanced',
        500,
        70,
        120,
        180,
        3,
        ARRAY['Este ejercicio estará disponible próximamente']::text[],
        true,
        15,
        ARRAY['pistas', 'vision_lectora', 'segunda_oportunidad']::gamification_system.comodin_type[],
        '{
            "pistas": {"costo": 15, "penalizacion_xp": 10},
            "vision_lectora": {"costo": 25, "penalizacion_xp": 20},
            "segunda_oportunidad": {"costo": 40, "penalizacion_xp": 30}
        }'::jsonb,
        500,
        50,
        false,  -- ← INACTIVO (muestra página "En Construcción")
        1
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        title = EXCLUDED.title,
        is_active = EXCLUDED.is_active,
        updated_at = gamilit.now_mexico();

    RAISE NOTICE '✓ 3 opciones de ejercicios del Módulo 5 insertadas (INACTIVAS - muestran "En Construcción")';
    RAISE NOTICE '  Nota: El estudiante debe completar SOLO UNO de los 3 ejercicios disponibles';
END $$;
