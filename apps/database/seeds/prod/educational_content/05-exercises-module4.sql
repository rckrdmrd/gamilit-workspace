-- =====================================================
-- Seed Data: Exercises Module 4 - Lectura Digital y Multimodal (PRODUCTION)
-- =====================================================
-- Description: 5 ejercicios inactivos del Módulo 4 (visibles pero muestran "En Construcción")
-- Module: MOD-04-DIGITAL
-- Exercises: Verificador Fake News, Infografía Interactiva, Quiz TikTok, Navegación Hipertextual, Análisis Memes
-- Reference: DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md líneas 768-947
-- Date: 2025-11-23
-- Status: PRODUCTION (INACTIVOS - is_active = false)
-- =====================================================

SET search_path TO educational_content, public;

-- Obtener module_id dinámicamente
DO $$
DECLARE
    mod_id UUID;
BEGIN
    SELECT id INTO mod_id FROM educational_content.modules WHERE module_code = 'MOD-04-DIGITAL';

    IF mod_id IS NULL THEN
        RAISE EXCEPTION 'Módulo MOD-04-DIGITAL no encontrado. Ejecutar primero 01-modules.sql';
    END IF;

    -- ========================================================================
    -- EXERCISE 4.1: VERIFICADOR DE FAKE NEWS
    -- Referencia: DocumentoDeDiseño v6.4 líneas 778-818
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
        'Verificador de Fake News',
        'Identifica Noticias Falsas sobre Marie Curie',
        'Identifica noticias falsas sobre Marie Curie usando herramientas de verificación digital.',
        'Este ejercicio estará disponible próximamente. Actualmente se encuentra en desarrollo.',
        'Identificar noticias falsas sobre Marie Curie usando herramientas de verificación digital. Desarrollar habilidades para detectar elementos sospechosos en titulares sensacionalistas, fechas imposibles, citas sin fuente e imágenes manipuladas.',
        'Este ejercicio estará disponible próximamente.',
        'Este ejercicio estará disponible próximamente.',
        'Ejercicio planificado según DocumentoDeDiseño v6.4 (líneas 778-818). El estudiante aprenderá a identificar red flags comunes en noticias falsas: titulares sensacionalistas, anacronismos históricos, gramática deficiente y uso de imágenes fuera de contexto. Implementación pendiente.',
        'verificador_fake_news',
        1,
        '{}'::jsonb,
        '{
            "placeholder": true,
            "message": "Este ejercicio está en desarrollo. El contenido interactivo estará disponible próximamente."
        }'::jsonb,
        '{}'::jsonb,
        'intermediate',
        100,
        70,
        20,
        30,
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
        100,
        20,
        false,  -- ← INACTIVO (muestra página "En Construcción")
        1
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        title = EXCLUDED.title,
        is_active = EXCLUDED.is_active,
        updated_at = gamilit.now_mexico();

    -- ========================================================================
    -- EXERCISE 4.2: CREACIÓN DE INFOGRAFÍA INTERACTIVA
    -- Referencia: DocumentoDeDiseño v6.4 líneas 820-867
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
        'Creación de Infografía Interactiva',
        'Diseña una infografía digital sobre Marie Curie',
        'Diseña una infografía digital sobre los logros de Marie Curie usando herramientas interactivas.',
        'Este ejercicio estará disponible próximamente. Actualmente se encuentra en desarrollo.',
        'Diseñar una infografía digital sobre los logros de Marie Curie. Organizar información en una estructura visual clara con título principal, 5 datos clave, línea de tiempo, 2 gráficos/estadísticas y 3 imágenes. Aplicar principios de diseño: jerarquía visual, paleta de colores consistente y fuentes legibles.',
        'Este ejercicio estará disponible próximamente.',
        'Este ejercicio estará disponible próximamente.',
        'Ejercicio planificado según DocumentoDeDiseño v6.4 (líneas 820-867). El estudiante aprenderá principios de diseño de información: menos es más, jerarquía visual clara, uso de colores consistente. Incluye elementos interactivos como tooltips, enlaces a sitios oficiales y animaciones simples. Implementación pendiente.',
        'infografia_interactiva',
        2,
        '{}'::jsonb,
        '{
            "placeholder": true,
            "message": "Este ejercicio está en desarrollo. El contenido interactivo estará disponible próximamente."
        }'::jsonb,
        '{}'::jsonb,
        'intermediate',
        100,
        70,
        30,
        45,
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
        100,
        20,
        false,  -- ← INACTIVO (muestra página "En Construcción")
        1
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        title = EXCLUDED.title,
        is_active = EXCLUDED.is_active,
        updated_at = gamilit.now_mexico();

    -- ========================================================================
    -- EXERCISE 4.3: QUIZ ESTILO TIKTOK
    -- Referencia: DocumentoDeDiseño v6.4 líneas 869-892
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
        'Quiz Estilo TikTok',
        'Preguntas Rápidas en Formato Vertical',
        'Responde 10 preguntas rápidas en formato vertical en 60 segundos.',
        'Este ejercicio estará disponible próximamente. Actualmente se encuentra en desarrollo.',
        'Responder 10 preguntas rápidas sobre Marie Curie en formato vertical en 60 segundos (~6 segundos por pregunta). Desarrollar habilidad de lectura rápida y retención de información en formatos de contenido breve propios de redes sociales.',
        'Este ejercicio estará disponible próximamente.',
        'Este ejercicio estará disponible próximamente.',
        'Ejercicio planificado según DocumentoDeDiseño v6.4 (líneas 869-892). Formato inspirado en TikTok: preguntas en formato vertical con efectos visuales, cuenta regresiva y transiciones rápidas. No se puede retroceder a preguntas anteriores. Desarrolla competencias de lectura en formatos de contenido breve típicos de redes sociales. Implementación pendiente.',
        'quiz_tiktok',
        3,
        '{}'::jsonb,
        '{
            "placeholder": true,
            "message": "Este ejercicio está en desarrollo. El contenido interactivo estará disponible próximamente."
        }'::jsonb,
        '{}'::jsonb,
        'intermediate',
        100,
        70,
        10,
        15,
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
        100,
        20,
        false,  -- ← INACTIVO (muestra página "En Construcción")
        1
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        title = EXCLUDED.title,
        is_active = EXCLUDED.is_active,
        updated_at = gamilit.now_mexico();

    -- ========================================================================
    -- EXERCISE 4.4: NAVEGACIÓN HIPERTEXTUAL
    -- Referencia: DocumentoDeDiseño v6.4 líneas 894-917
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
        'Navegación Hipertextual',
        'Encuentra Tesoros de Información',
        'Encuentra 5 "tesoros" de información navegando entre páginas enlazadas.',
        'Este ejercicio estará disponible próximamente. Actualmente se encuentra en desarrollo.',
        'Encontrar 5 "tesoros" de información navegando entre páginas enlazadas sobre Marie Curie. Desarrollar habilidades de navegación hipertextual, uso de breadcrumbs (migas de pan) y estrategias de búsqueda eficiente en contenidos digitales interconectados.',
        'Este ejercicio estará disponible próximamente.',
        'Este ejercicio estará disponible próximamente.',
        'Ejercicio planificado según DocumentoDeDiseño v6.4 (líneas 894-917). El estudiante debe encontrar: primer elemento descubierto, fecha de llegada a París, nombre del mentor, término "radioactividad" y dirección del laboratorio. Desarrolla competencias de navegación en entornos hipertextuales propios de la web. Implementación pendiente.',
        'navegacion_hipertextual',
        4,
        '{}'::jsonb,
        '{
            "placeholder": true,
            "message": "Este ejercicio está en desarrollo. El contenido interactivo estará disponible próximamente."
        }'::jsonb,
        '{}'::jsonb,
        'intermediate',
        100,
        70,
        20,
        30,
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
        100,
        20,
        false,  -- ← INACTIVO (muestra página "En Construcción")
        1
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        title = EXCLUDED.title,
        is_active = EXCLUDED.is_active,
        updated_at = gamilit.now_mexico();

    -- ========================================================================
    -- EXERCISE 4.5: ANÁLISIS DE MEMES EDUCATIVOS
    -- Referencia: DocumentoDeDiseño v6.4 líneas 919-947
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
        'Análisis de Memes Educativos',
        'Evalúa Memes sobre Marie Curie',
        'Evalúa la precisión y valor educativo de memes sobre Marie Curie o radioactividad.',
        'Este ejercicio estará disponible próximamente. Actualmente se encuentra en desarrollo.',
        'Evaluar la precisión histórica y valor educativo de memes sobre Marie Curie o radioactividad. Identificar mensaje principal, humor e información implícita. Calificar en precisión histórica, valor educativo y creatividad. Crear un meme propio corrigiendo errores comunes.',
        'Este ejercicio estará disponible próximamente.',
        'Este ejercicio estará disponible próximamente.',
        'Ejercicio planificado según DocumentoDeDiseño v6.4 (líneas 919-947). El estudiante aprenderá que el humor no justifica información falsa y desarrollará pensamiento crítico sobre contenido viral. Evaluación en 3 dimensiones: precisión histórica, valor educativo y creatividad. Implementación pendiente.',
        'analisis_memes',
        5,
        '{}'::jsonb,
        '{
            "placeholder": true,
            "message": "Este ejercicio está en desarrollo. El contenido interactivo estará disponible próximamente."
        }'::jsonb,
        '{}'::jsonb,
        'intermediate',
        100,
        70,
        15,
        25,
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
        100,
        20,
        false,  -- ← INACTIVO (muestra página "En Construcción")
        1
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        title = EXCLUDED.title,
        is_active = EXCLUDED.is_active,
        updated_at = gamilit.now_mexico();

    RAISE NOTICE '✓ 5 ejercicios del Módulo 4 insertados (INACTIVOS - muestran "En Construcción")';
END $$;
