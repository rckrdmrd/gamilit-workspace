-- =====================================================
-- Seed Data: Exercises Auxiliar - Mecánicas Transversales
-- =====================================================
-- Description: Ejercicios auxiliares transversales (no pertenecen a módulo específico)
-- Asociados a Módulo 1 como anchor (module_id NOT NULL constraint)
-- Exercises: Comprensión Auditiva
-- Created by: SA-SEEDS-EDUCATIONAL
-- Date: 2026-02-21
-- Status: PRODUCTION
-- =====================================================

SET search_path TO educational_content, public;

DO $$
DECLARE
    mod_id UUID;
BEGIN
    -- Asociamos al Módulo 1 como anchor (auxiliares son transversales)
    SELECT id INTO mod_id FROM educational_content.modules WHERE module_code = 'MOD-01-LITERAL';

    IF mod_id IS NULL THEN
        RAISE EXCEPTION 'Módulo MOD-01-LITERAL no encontrado. Ejecutar primero 01-modules.sql';
    END IF;

    -- ========================================================================
    -- EXERCISE AUX-01: COMPRENSIÓN AUDITIVA - Marie Curie
    -- ========================================================================
    INSERT INTO educational_content.exercises (
        module_id, title, subtitle, description, instructions,
        objective, how_to_solve, recommended_strategy, pedagogical_notes,
        exercise_type, order_index,
        config, content, solution,
        difficulty_level, max_points, passing_score,
        estimated_time_minutes, max_attempts,
        hints, xp_reward, ml_coins_reward,
        is_active, requires_manual_grading
    ) VALUES (
        mod_id,
        'Comprensión Auditiva: La Vida de Marie Curie',
        'Escucha y Comprende',
        'Escucha el audio sobre la vida de Marie Curie y responde las preguntas de comprensión que aparecen en momentos clave de la narración.',
        'Reproduce el audio y escucha atentamente. Las preguntas se desbloquean en momentos específicos del audio. Responde cada pregunta seleccionando la opción correcta. Puedes reproducir el audio varias veces.',

        -- objective (DB-125: Pedagogical Content)
        E'Desarrollar habilidades de comprensión auditiva mediante la escucha activa de un texto narrado sobre Marie Curie. Los estudiantes practican:\n- Escucha atenta y retención de información\n- Identificación de datos clave (fechas, lugares, nombres)\n- Comprensión de secuencia temporal\n- Extracción de ideas principales de un texto oral',

        -- how_to_solve (DB-125)
        E'Estrategia de resolución:\n\n1. PRIMERA ESCUCHA (completa):\n   - Escucha todo el audio sin pausar\n   - Captura la idea general de la biografía\n   - No te preocupes por los detalles aún\n\n2. SEGUNDA ESCUCHA (con preguntas):\n   - Lee cada pregunta cuando se desbloquee\n   - Escucha atentamente el segmento relevante\n   - Selecciona tu respuesta\n\n3. VERIFICACIÓN:\n   - Si no estás seguro, reproduce de nuevo el segmento\n   - Presta atención a fechas, nombres y lugares específicos\n   - Las respuestas están explícitamente mencionadas en el audio',

        -- recommended_strategy (DB-125)
        E'Consejos para comprensión auditiva:\n\n- ANTES: Lee las preguntas disponibles para saber qué buscar\n- DURANTE: Toma notas mentales de fechas, nombres y hechos clave\n- DESPUÉS: Verifica tus respuestas reproduciendo los segmentos relevantes\n- GENERAL: No intentes memorizar todo — enfócate en lo que preguntan',

        -- pedagogical_notes (DB-125)
        E'Este ejercicio desarrolla la comprensión oral, una habilidad fundamental de literacidad que complementa la lectura visual. La mecánica de preguntas temporales (que se desbloquean en momentos específicos) fomenta la escucha activa y la atención sostenida.\n\nCompetencias desarrolladas:\n- Comprensión oral de textos informativos\n- Retención de información factual\n- Escucha activa y selectiva\n- Procesamiento auditivo de secuencias temporales\n\nDificultad: Intermedia. Las preguntas evalúan comprensión literal del audio.',

        'comprension_auditiva', 10,
        '{
            "maxReplays": 5,
            "transcriptAvailable": false,
            "questionTiming": "progressive"
        }'::jsonb,
        '{
            "audioUrl": "/audio/marie-curie-biografia.mp3",
            "audioTitle": "Biografía de Marie Curie",
            "audioDuration": 115,
            "questions": [
                {
                    "id": "q1",
                    "time": 5,
                    "question": "¿Dónde nació Marie Curie?",
                    "options": ["Francia", "Polonia", "Rusia", "Alemania"],
                    "correctAnswer": 1
                },
                {
                    "id": "q2",
                    "time": 25,
                    "question": "¿Qué elementos descubrió Marie Curie junto con su esposo?",
                    "options": ["Uranio", "Polonio y Radio", "Hierro", "Oro"],
                    "correctAnswer": 1
                },
                {
                    "id": "q3",
                    "time": 45,
                    "question": "¿Cuántos Premios Nobel ganó Marie Curie?",
                    "options": ["Uno", "Dos", "Tres", "Ninguno"],
                    "correctAnswer": 1
                },
                {
                    "id": "q4",
                    "time": 65,
                    "question": "¿En qué campos ganó Marie Curie los Premios Nobel?",
                    "options": ["Física y Química", "Medicina y Física", "Química y Medicina", "Literatura y Paz"],
                    "correctAnswer": 0
                }
            ]
        }'::jsonb,
        '{"correctAnswers": [1, 1, 1, 0], "totalQuestions": 4}'::jsonb,
        'intermediate', 100, 70,
        7, 5,
        ARRAY[
            'Escucha con atención los años y fechas mencionados',
            'Presta atención a los nombres de los elementos descubiertos',
            'Puedes reproducir el audio varias veces'
        ],
        80, 15,
        false, false  -- BACKLOG: comprension_auditiva desactivada (is_active=false). Requiere infraestructura audio. Mejora futura.
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        content = EXCLUDED.content,
        solution = EXCLUDED.solution,
        is_active = EXCLUDED.is_active,
        updated_at = NOW();

    RAISE NOTICE '✓ Ejercicio auxiliar Comprensión Auditiva insertado (BACKLOG — is_active=false)';

END $$;
