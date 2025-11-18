-- =====================================================
-- Seed Data: Exercises Module 1 - Comprensión Literal (PRODUCTION)
-- =====================================================
-- Description: 5 ejercicios interactivos del Módulo 1
-- Module: MOD-01-LITERAL
-- Exercises: Crucigrama, Línea de Tiempo, Sopa de Letras, Mapa Conceptual, Emparejamiento
-- Source: Migrated from DEV seeds (validated and production-ready)
-- Date: 2025-11-11
-- Status: PRODUCTION
-- =====================================================

SET search_path TO educational_content, public;

-- Obtener module_id dinámicamente
DO $$
DECLARE
    mod_id UUID;
BEGIN
    SELECT id INTO mod_id FROM educational_content.modules WHERE module_code = 'MOD-01-LITERAL';

    IF mod_id IS NULL THEN
        RAISE EXCEPTION 'Módulo MOD-01-LITERAL no encontrado. Ejecutar primero 01-modules.sql';
    END IF;

    -- ========================================================================
    -- EXERCISE 1.1: CRUCIGRAMA CIENTÍFICO
    -- ========================================================================
    INSERT INTO educational_content.exercises (
        module_id, title, subtitle, description, instructions,
        exercise_type, order_index,
        config, content, solution,
        difficulty_level, max_points, passing_score,
        estimated_time_minutes, time_limit_minutes, max_attempts,
        hints, enable_hints, hint_cost_ml_coins,
        comodines_allowed, comodines_config,
        xp_reward, ml_coins_reward,
        is_active, version
    ) VALUES (
        mod_id,
        'Crucigrama Científico - DISTRIBUCIÓN',
        'Vocabulario de Radioactividad',
        'Completa el crucigrama con términos científicos relacionados con los descubrimientos de Marie Curie.',
        '1. Lee todas las pistas antes de empezar, tanto horizontales como verticales. 2. Comienza con las palabras más largas o las que estés más seguro. 3. Usa las intersecciones - cuando dos palabras se cruzan, la letra debe coincidir. 4. Cuenta las casillas - cada pista indica cuántas letras tiene la respuesta. 5. Revisa el texto base - todas las respuestas están en la biografía de Marie Curie.',
        'crucigrama', 1,
        '{
            "gridSize": {"rows": 15, "cols": 15},
            "autoCheck": true,
            "showProgress": true,
            "caseSensitive": false,
            "allowSpaces": false
        }'::jsonb,
        '{
            "clues": [
                {
                    "id": "h1",
                    "number": 1,
                    "direction": "horizontal",
                    "clue": "Universidad donde estudió",
                    "answer": "SORBONA",
                    "startRow": 4,
                    "startCol": 3,
                    "length": 7
                },
                {
                    "id": "h2",
                    "number": 2,
                    "direction": "horizontal",
                    "clue": "Premio recibido en 1903 y 1911",
                    "answer": "NOBEL",
                    "startRow": 6,
                    "startCol": 3,
                    "length": 5
                },
                {
                    "id": "h3",
                    "number": 3,
                    "direction": "horizontal",
                    "clue": "Fenómeno de emisión espontánea de radiación descubierto por Marie",
                    "answer": "RADIOACTIVIDAD",
                    "startRow": 8,
                    "startCol": 1,
                    "length": 14
                },
                {
                    "id": "v1",
                    "number": 4,
                    "direction": "vertical",
                    "clue": "Elemento químico nombrado en honor a Polonia",
                    "answer": "POLONIO",
                    "startRow": 3,
                    "startCol": 4,
                    "length": 7
                },
                {
                    "id": "v2",
                    "number": 5,
                    "direction": "vertical",
                    "clue": "Elemento químico radiactivo descubierto",
                    "answer": "RADIO",
                    "startRow": 8,
                    "startCol": 1,
                    "length": 5
                },
                {
                    "id": "v3",
                    "number": 6,
                    "direction": "vertical",
                    "clue": "Apellido de Marie",
                    "answer": "CURIE",
                    "startRow": 8,
                    "startCol": 7,
                    "length": 5
                }
            ]
        }'::jsonb,
        '{
            "solution": {
                "h1": "SORBONA",
                "h2": "NOBEL",
                "h3": "RADIOACTIVIDAD",
                "v1": "POLONIO",
                "v2": "RADIO",
                "v3": "CURIE"
            }
        }'::jsonb,
        'beginner', 100, 70,
        15, 25, 3,
        ARRAY[
            'La universidad francesa donde Marie estudió',
            'Marie ganó este premio dos veces',
            'Elemento nombrado en honor al país de Marie',
            'Apellido de la científica'
        ]::text[],
        true, 15,
        ARRAY['pistas', 'vision_lectora', 'segunda_oportunidad']::gamification_system.comodin_type[],
        '{
            "pistas": {"enabled": true, "cost": 15},
            "vision_lectora": {"enabled": true, "cost": 25},
            "segunda_oportunidad": {"enabled": true, "cost": 40}
        }'::jsonb,
        100, 20,
        true, 1
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        content = EXCLUDED.content,
        solution = EXCLUDED.solution,
        updated_at = NOW();

    -- ========================================================================
    -- EXERCISE 1.2: LÍNEA DE TIEMPO
    -- ========================================================================
    INSERT INTO educational_content.exercises (
        module_id, title, subtitle, description, instructions,
        exercise_type, order_index,
        config, content, solution,
        difficulty_level, max_points, passing_score,
        estimated_time_minutes, time_limit_minutes, max_attempts,
        hints, enable_hints, hint_cost_ml_coins,
        comodines_allowed, comodines_config,
        xp_reward, ml_coins_reward,
        is_active, version
    ) VALUES (
        mod_id,
        'Línea de Tiempo de Marie Curie',
        'Ordena los Eventos Cronológicamente',
        'Organiza los eventos más importantes de la vida de Marie Curie en orden cronológico correcto.',
        'Arrastra los eventos a la línea de tiempo en el orden correcto. Comienza con el evento más antiguo (1867) y termina con el más reciente (1934).',
        'linea_tiempo', 2,
        '{
            "allowReordering": true,
            "showYears": true,
            "visualStyle": "horizontal",
            "dragAndDrop": true,
            "showFeedback": "immediate"
        }'::jsonb,
        '{
            "events": [
                {
                    "id": "event-1",
                    "year": 1867,
                    "date": "1867-11-07",
                    "title": "Nace Maria Sklodowska en Varsovia, Polonia",
                    "description": "Marie Curie nace como Maria Sklodowska en Varsovia, entonces parte del Imperio Ruso",
                    "category": "Personal",
                    "imageUrl": null
                },
                {
                    "id": "event-2",
                    "year": 1891,
                    "title": "Se traslada a París para estudiar en la Sorbona",
                    "description": "Marie se muda a Francia para continuar sus estudios universitarios en física y matemáticas",
                    "category": "Educación",
                    "imageUrl": null
                },
                {
                    "id": "event-3",
                    "year": 1895,
                    "date": "1895-07-25",
                    "title": "Se casa con Pierre Curie",
                    "description": "Marie se casa con el físico francés Pierre Curie, iniciando una colaboración científica histórica",
                    "category": "Personal",
                    "imageUrl": null
                },
                {
                    "id": "event-4",
                    "year": 1898,
                    "date": "1898-12",
                    "title": "Descubre el polonio y el radio",
                    "description": "Marie y Pierre anuncian el descubrimiento de dos nuevos elementos: polonio y radio",
                    "category": "Descubrimiento",
                    "imageUrl": null
                },
                {
                    "id": "event-5",
                    "year": 1903,
                    "title": "Recibe su primer Premio Nobel de Física",
                    "description": "Marie, Pierre y Henri Becquerel reciben el Nobel de Física por sus investigaciones sobre radioactividad",
                    "category": "Reconocimiento",
                    "imageUrl": null
                },
                {
                    "id": "event-6",
                    "year": 1911,
                    "title": "Recibe su segundo Premio Nobel, en Química",
                    "description": "Marie recibe el Nobel de Química por el descubrimiento del radio y polonio, siendo la primera persona en ganar dos Nobel",
                    "category": "Reconocimiento",
                    "imageUrl": null
                },
                {
                    "id": "event-7",
                    "year": 1934,
                    "date": "1934-07-04",
                    "title": "Fallece debido a anemia aplásica",
                    "description": "Marie Curie fallece en Francia a causa de una enfermedad relacionada con su exposición prolongada a la radiación",
                    "category": "Personal",
                    "imageUrl": null
                }
            ],
            "categories": ["Personal", "Educación", "Descubrimiento", "Reconocimiento"]
        }'::jsonb,
        '{
            "correctOrder": ["event-1", "event-2", "event-3", "event-4", "event-5", "event-6", "event-7"],
            "yearSequence": [1867, 1891, 1895, 1898, 1903, 1911, 1934]
        }'::jsonb,
        'beginner', 100, 70,
        12, 20, 3,
        ARRAY[
            'Marie nació en 1867 en Polonia',
            'Se mudó a París en 1891',
            'Ganó su primer Nobel en 1903 y el segundo en 1911'
        ]::text[],
        true, 15,
        ARRAY['pistas', 'vision_lectora', 'segunda_oportunidad']::gamification_system.comodin_type[],
        '{
            "pistas": {"enabled": true, "cost": 15},
            "vision_lectora": {"enabled": true, "cost": 25},
            "segunda_oportunidad": {"enabled": true, "cost": 40}
        }'::jsonb,
        100, 20,
        true, 1
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        content = EXCLUDED.content,
        solution = EXCLUDED.solution,
        updated_at = NOW();

    -- ========================================================================
    -- EXERCISE 1.3: COMPLETAR ESPACIOS EN BLANCO
    -- ========================================================================
    -- CHANGED: Replaced "Sopa de Letras" with "Completar Espacios en Blanco" per doc v6.2 (DB-121)
    INSERT INTO educational_content.exercises (
        module_id, title, subtitle, description, instructions,
        exercise_type, order_index,
        config, content, solution,
        difficulty_level, max_points, passing_score,
        estimated_time_minutes, time_limit_minutes, max_attempts,
        hints, enable_hints, hint_cost_ml_coins,
        comodines_allowed, comodines_config,
        xp_reward, ml_coins_reward,
        is_active, version
    ) VALUES (
        mod_id,
        'Completar Espacios en Blanco',
        'Datos Biográficos de Marie',
        'Lee el texto sobre Marie Curie y completa los espacios con las palabras correctas del banco de palabras.',
        'Lee el texto completo antes de completar. Arrastra las palabras del banco a los espacios correspondientes. Puedes revisar tus respuestas antes de enviar.',
        'completar_espacios', 3,
        '{
            "blankCount": 6,
            "allowMultipleAttempts": true,
            "showWordBank": true,
            "caseSensitive": false
        }'::jsonb,
        '{
            "text": "Marie Sklodowska nació en ___, Polonia. Su padre ___ era profesor de matemáticas y física, mientras que su madre ___ dirigía una escuela prestigiosa. La familia valoraba mucho la ___ y Marie mostró desde pequeña gran curiosidad por las ___ y ___.",
            "wordBank": [
                "Varsovia",
                "Władysław",
                "Bronisława",
                "educación",
                "ciencias",
                "Polonia",
                "matemáticas",
                "física"
            ],
            "blanks": [
                {"id": "1", "position": 0, "correctAnswer": "Varsovia", "alternatives": []},
                {"id": "2", "position": 1, "correctAnswer": "Władysław", "alternatives": []},
                {"id": "3", "position": 2, "correctAnswer": "Bronisława", "alternatives": []},
                {"id": "4", "position": 3, "correctAnswer": "educación", "alternatives": []},
                {"id": "5", "position": 4, "correctAnswer": "ciencias", "alternatives": []},
                {"id": "6", "position": 5, "correctAnswer": "matemáticas", "alternatives": ["física"]}
            ]
        }'::jsonb,
        '{
            "correctAnswers": {
                "1": "Varsovia",
                "2": "Władysław",
                "3": "Bronisława",
                "4": "educación",
                "5": "ciencias",
                "6": "matemáticas"
            }
        }'::jsonb,
        'beginner', 100, 60,
        10, NULL, 3,
        ARRAY[
            'Pista 1: El padre de Marie tenía un nombre polaco que comienza con W',
            'Pista 2: Marie nació en la capital de Polonia'
        ]::text[],
        true, 15,
        ARRAY['pistas', 'vision_lectora', 'segunda_oportunidad']::gamification_system.comodin_type[],
        '{
            "pistas": {"enabled": true, "cost": 15},
            "vision_lectora": {"enabled": true, "cost": 25},
            "segunda_oportunidad": {"enabled": true, "cost": 40}
        }'::jsonb,
        100, 20,
        true, 1
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        content = EXCLUDED.content,
        solution = EXCLUDED.solution,
        updated_at = NOW();

    -- ========================================================================
    -- EXERCISE 1.4: VERDADERO O FALSO
    -- ========================================================================
    -- CHANGED: Replaced "Mapa Conceptual" with "Verdadero o Falso" per doc v6.2 (DB-121)
    INSERT INTO educational_content.exercises (
        module_id, title, subtitle, description, instructions,
        exercise_type, order_index,
        config, content, solution,
        difficulty_level, max_points, passing_score,
        estimated_time_minutes, time_limit_minutes, max_attempts,
        hints, enable_hints, hint_cost_ml_coins,
        comodines_allowed, comodines_config,
        xp_reward, ml_coins_reward,
        is_active, version
    ) VALUES (
        mod_id,
        'Verdadero o Falso',
        'Hechos sobre la Juventud de Marie Curie',
        'Evalúa afirmaciones sobre hechos explícitos de la juventud de Marie Curie según el contexto histórico proporcionado.',
        'Lee el contexto histórico. Marca cada afirmación como Verdadero o Falso. Revisa todas las respuestas antes de enviar.',
        'verdadero_falso', 4,
        '{
            "statementCount": 10,
            "randomizeOrder": false,
            "showExplanations": true
        }'::jsonb,
        '{
            "context": "Durante su infancia en Polonia, Marie era conocida por su insaciable curiosidad científica. Su padre le enseñó los primeros principios de las matemáticas y la física, mientras su madre la inspiró con su dedicación a la educación.",
            "statements": [
                {
                    "id": 1,
                    "statement": "Marie mostró curiosidad excepcional por las ciencias desde muy pequeña",
                    "answer": true,
                    "explanation": "El texto menciona su insaciable curiosidad científica"
                },
                {
                    "id": 2,
                    "statement": "Su padre era profesor de química solamente",
                    "answer": false,
                    "explanation": "Era profesor de matemáticas y física"
                },
                {
                    "id": 3,
                    "statement": "Marie nació en Francia",
                    "answer": false,
                    "explanation": "Nació en Polonia (Varsovia)"
                },
                {
                    "id": 4,
                    "statement": "Su familia valoraba mucho la educación",
                    "answer": true,
                    "explanation": "Explícitamente mencionado en el contexto"
                },
                {
                    "id": 5,
                    "statement": "La madre de Marie dirigía una escuela",
                    "answer": true,
                    "explanation": "Se menciona que dirigía una escuela prestigiosa"
                },
                {
                    "id": 6,
                    "statement": "Marie Curie ganó su primer Nobel a los 20 años",
                    "answer": false,
                    "explanation": "Lo ganó en 1903, cuando tenía 36 años"
                },
                {
                    "id": 7,
                    "statement": "El nombre original de Marie era Maria Sklodowska",
                    "answer": true,
                    "explanation": "Nombre de nacimiento confirmado"
                },
                {
                    "id": 8,
                    "statement": "Marie fue la primera mujer en ganar un Premio Nobel",
                    "answer": true,
                    "explanation": "Hecho histórico verificable"
                },
                {
                    "id": 9,
                    "statement": "Su padre no apoyaba su interés en las ciencias",
                    "answer": false,
                    "explanation": "Le enseñó matemáticas y física"
                },
                {
                    "id": 10,
                    "statement": "Marie estudió en la Universidad de Varsovia",
                    "answer": false,
                    "explanation": "Estudió en la Sorbona de París"
                }
            ]
        }'::jsonb,
        '{
            "correctAnswers": [true, false, false, true, true, false, true, true, false, false]
        }'::jsonb,
        'beginner', 100, 70,
        12, NULL, 3,
        ARRAY[
            'Pista 1: Revisa el contexto histórico proporcionado',
            'Pista 2: Marie nació en Polonia, no en Francia'
        ]::text[],
        true, 15,
        ARRAY['pistas', 'vision_lectora', 'segunda_oportunidad']::gamification_system.comodin_type[],
        '{
            "pistas": {"enabled": true, "cost": 15},
            "vision_lectora": {"enabled": true, "cost": 25},
            "segunda_oportunidad": {"enabled": true, "cost": 40}
        }'::jsonb,
        100, 20,
        true, 1
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        content = EXCLUDED.content,
        solution = EXCLUDED.solution,
        updated_at = NOW();

    -- ========================================================================
    -- EXERCISE 1.5: SOPA DE LETRAS (BONUS)
    -- CHANGED: Replaced "Emparejamiento" with "Sopa de Letras (BONUS)" per doc v6.2 (DB-121)
    -- ========================================================================
    INSERT INTO educational_content.exercises (
        module_id, title, subtitle, description, instructions,
        exercise_type, order_index,
        config, content, solution,
        difficulty_level, max_points, passing_score,
        estimated_time_minutes, time_limit_minutes, max_attempts,
        hints, enable_hints, hint_cost_ml_coins,
        comodines_allowed, comodines_config,
        xp_reward, ml_coins_reward,
        is_active, version
    ) VALUES (
        mod_id,
        'Sopa de Letras (BONUS)',
        'Vocabulario Científico de Marie Curie',
        'Encuentra palabras clave relacionadas con Marie Curie en una sopa de letras interactiva. Este es un ejercicio bonus opcional.',
        'Busca las 10 palabras en el grid. Haz clic y arrastra para seleccionar. Las palabras pueden estar en horizontal, vertical o diagonal.',
        'sopa_letras', 5,
        '{
            "gridSize": {"rows": 10, "cols": 10},
            "useStaticGrid": true,
            "directions": ["horizontal", "vertical", "diagonal"],
            "selectionMode": "click-drag",
            "highlightFound": true
        }'::jsonb,
        '{
            "grid": [
                ["A", "C", "I", "S", "Í", "F", "K", "A", "V", "S"],
                ["É", "P", "M", "V", "V", "Ó", "I", "A", "N", "Y"],
                ["Í", "A", "Ü", "H", "D", "C", "N", "T", "M", "É"],
                ["N", "R", "A", "I", "N", "O", "L", "O", "P", "É"],
                ["O", "I", "T", "E", "B", "C", "I", "T", "R", "D"],
                ["B", "S", "I", "R", "U", "N", "Ó", "N", "A", "Ó"],
                ["E", "C", "O", "R", "O", "C", "Í", "D", "D", "Í"],
                ["L", "S", "I", "L", "X", "T", "M", "Y", "I", "Ü"],
                ["J", "E", "O", "Í", "Í", "L", "P", "O", "O", "Á"],
                ["N", "P", "M", "A", "R", "I", "E", "E", "O", "V"]
            ],
            "words": [
                "MARIE", "CURIE", "POLONIA", "NOBEL", "RADIO",
                "POLONIO", "PARIS", "SORBONA", "CIENCIA", "FÍSICA"
            ],
            "wordsPositions": [
                {"word": "MARIE", "direction": "horizontal", "startRow": 9, "startCol": 4},
                {"word": "POLONIA", "direction": "horizontal-reverse", "startRow": 3, "startCol": 8},
                {"word": "NOBEL", "direction": "vertical", "startRow": 3, "startCol": 0},
                {"word": "PARIS", "direction": "vertical", "startRow": 1, "startCol": 1}
            ]
        }'::jsonb,
        '{
            "allWords": ["MARIE", "CURIE", "POLONIA", "NOBEL", "RADIO", "POLONIO", "PARIS", "SORBONA", "CIENCIA", "FÍSICA"]
        }'::jsonb,
        'beginner', 100, 70,
        10, 10, 1,
        ARRAY[
            'Pista 1: Busca primero las palabras más largas',
            'Pista 2: Recuerda revisar diagonal'
        ]::text[],
        true, 15,
        ARRAY['pistas', 'vision_lectora']::gamification_system.comodin_type[],
        '{
            "pistas": {"enabled": true, "cost": 15},
            "vision_lectora": {"enabled": true, "cost": 25}
        }'::jsonb,
        100, 20,
        true, 1
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        content = EXCLUDED.content,
        solution = EXCLUDED.solution,
        updated_at = NOW();

    -- Update module total_exercises
    UPDATE educational_content.modules
    SET
        total_exercises = 5,
        metadata = jsonb_set(
            COALESCE(metadata, '{}'::jsonb),
            '{exercises_loaded}',
            'true'::jsonb
        ),
        updated_at = NOW()
    WHERE id = mod_id;

    RAISE NOTICE '✅ Módulo 1 (MOD-01-LITERAL): 5 ejercicios cargados exitosamente [PRODUCTION]';
    RAISE NOTICE '   - Crucigrama Científico';
    RAISE NOTICE '   - Línea de Tiempo';
    RAISE NOTICE '   - Completar Espacios en Blanco';
    RAISE NOTICE '   - Verdadero o Falso';
    RAISE NOTICE '   - Sopa de Letras (BONUS)';
END $$;
