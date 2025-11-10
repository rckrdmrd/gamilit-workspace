-- =====================================================
-- Seed Data: Exercises Module 1 - Comprensión Literal (DEV)
-- =====================================================
-- Description: 5 ejercicios interactivos del Módulo 1
-- Module: MOD-01-LITERAL
-- Exercises: Crucigrama, Línea de Tiempo, Sopa de Letras, Mapa Conceptual, Emparejamiento
-- Created by: SA-SEEDS-EDUCATIONAL
-- Date: 2025-11-02
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
        'Crucigrama Científico: Descubrimientos de Marie Curie',
        'Vocabulario de Radioactividad',
        'Completa el crucigrama con términos científicos relacionados con los descubrimientos de Marie Curie.',
        'Lee las pistas horizontales y verticales. Haz clic en una casilla para comenzar a escribir. Usa mayúsculas sin acentos.',
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
                    "clue": "Elemento químico radiactivo que brilla en la oscuridad, descubierto por Marie Curie",
                    "answer": "RADIO",
                    "startRow": 2,
                    "startCol": 3,
                    "length": 5
                },
                {
                    "id": "h2",
                    "number": 3,
                    "direction": "horizontal",
                    "clue": "País natal de Marie Curie",
                    "answer": "POLONIA",
                    "startRow": 5,
                    "startCol": 1,
                    "length": 7
                },
                {
                    "id": "h3",
                    "number": 5,
                    "direction": "horizontal",
                    "clue": "Ciudad francesa donde estudió en la Sorbona",
                    "answer": "PARIS",
                    "startRow": 8,
                    "startCol": 4,
                    "length": 5
                },
                {
                    "id": "h4",
                    "number": 7,
                    "direction": "horizontal",
                    "clue": "Mineral del cual Marie extrajo el radio",
                    "answer": "PECHBLENDA",
                    "startRow": 11,
                    "startCol": 2,
                    "length": 10
                },
                {
                    "id": "v1",
                    "number": 2,
                    "direction": "vertical",
                    "clue": "Fenómeno de emisión espontánea de radiación descubierto por Marie",
                    "answer": "RADIOACTIVIDAD",
                    "startRow": 0,
                    "startCol": 5,
                    "length": 14
                },
                {
                    "id": "v2",
                    "number": 4,
                    "direction": "vertical",
                    "clue": "Elemento químico nombrado en honor a Polonia",
                    "answer": "POLONIO",
                    "startRow": 3,
                    "startCol": 7,
                    "length": 7
                },
                {
                    "id": "v3",
                    "number": 6,
                    "direction": "vertical",
                    "clue": "Premio internacional que Marie ganó dos veces",
                    "answer": "NOBEL",
                    "startRow": 6,
                    "startCol": 9,
                    "length": 5
                },
                {
                    "id": "v4",
                    "number": 8,
                    "direction": "vertical",
                    "clue": "Apellido de soltera de Marie",
                    "answer": "SKLODOWSKA",
                    "startRow": 1,
                    "startCol": 11,
                    "length": 10
                }
            ]
        }'::jsonb,
        '{
            "solution": {
                "h1": "RADIO",
                "h2": "POLONIA",
                "h3": "PARIS",
                "h4": "PECHBLENDA",
                "v1": "RADIOACTIVIDAD",
                "v2": "POLONIO",
                "v3": "NOBEL",
                "v4": "SKLODOWSKA"
            }
        }'::jsonb,
        'beginner', 100, 70,
        15, 25, 3,
        ARRAY[
            'Piensa en los elementos que Marie descubrió',
            'Uno de los elementos lleva el nombre de su país',
            'Marie ganó premios muy importantes en su carrera'
        ]::text[],
        true, 15,
        ARRAY['pistas', 'vision_lectora', 'segunda_oportunidad']::gamification_system.comodin_type[],
        '{
            "pistas": {"enabled": true, "cost": 15},
            "vision_lectora": {"enabled": true, "cost": 25},
            "segunda_oportunidad": {"enabled": true, "cost": 40}
        }'::jsonb,
        25, 12,
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
        'Línea de Tiempo: Vida de Marie Curie',
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
        20, 10,
        true, 1
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        content = EXCLUDED.content,
        solution = EXCLUDED.solution,
        updated_at = NOW();

    -- ========================================================================
    -- EXERCISE 1.3: SOPA DE LETRAS
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
        'Sopa de Letras: Vocabulario Científico de Marie Curie',
        'Encuentra los Términos Clave',
        'Busca y marca palabras relacionadas con la vida y descubrimientos de Marie Curie en esta sopa de letras.',
        'Busca las palabras de la lista en la sopa de letras. Pueden estar en horizontal, vertical o diagonal.',
        'sopa_letras', 3,
        '{
            "gridSize": 12,
            "directions": ["horizontal", "vertical", "diagonal"],
            "highlightFound": true,
            "showWordList": true
        }'::jsonb,
        '{
            "words": [
                "RADIO",
                "POLONIO",
                "URANIO",
                "RADIOACTIVIDAD",
                "RADIACION",
                "NOBEL",
                "FISICA",
                "QUIMICA",
                "LABORATORIO",
                "SORBONA"
            ],
            "definitions": {
                "RADIO": "Elemento radiactivo que brilla en la oscuridad",
                "POLONIO": "Elemento nombrado por el país natal de Marie",
                "URANIO": "Elemento base para sus investigaciones",
                "RADIOACTIVIDAD": "Fenómeno descubierto por Marie",
                "RADIACION": "Emisión de energía o partículas",
                "NOBEL": "Premio máximo de ciencia",
                "FISICA": "Ciencia del primer Nobel de Marie",
                "QUIMICA": "Ciencia del segundo Nobel de Marie",
                "LABORATORIO": "Lugar de trabajo científico",
                "SORBONA": "Universidad donde estudió Marie"
            }
        }'::jsonb,
        '{
            "words": ["RADIO", "POLONIO", "URANIO", "RADIOACTIVIDAD", "RADIACION", "NOBEL", "FISICA", "QUIMICA", "LABORATORIO", "SORBONA"],
            "totalWords": 10
        }'::jsonb,
        'beginner', 100, 70,
        10, 15, 3,
        ARRAY[
            'Busca primero las palabras más cortas',
            'RADIO y NOBEL son palabras de 5 letras',
            'RADIOACTIVIDAD es la palabra más larga (14 letras)'
        ]::text[],
        true, 10,
        ARRAY['pistas', 'vision_lectora', 'segunda_oportunidad']::gamification_system.comodin_type[],
        '{
            "pistas": {"enabled": true, "cost": 15},
            "vision_lectora": {"enabled": true, "cost": 25},
            "segunda_oportunidad": {"enabled": true, "cost": 40}
        }'::jsonb,
        20, 10,
        true, 1
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        content = EXCLUDED.content,
        solution = EXCLUDED.solution,
        updated_at = NOW();

    -- ========================================================================
    -- EXERCISE 1.4: MAPA CONCEPTUAL
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
        'Mapa Conceptual: Descubrimientos de Marie Curie',
        'Organiza los Conceptos Científicos',
        'Completa el mapa conceptual arrastrando los conceptos correctos a sus posiciones correspondientes.',
        'Arrastra cada concepto a su lugar correcto en el mapa. Las conexiones mostrarán las relaciones entre los descubrimientos de Marie.',
        'mapa_conceptual', 4,
        '{
            "layout": "hierarchical",
            "allowConnections": true,
            "dragAndDrop": true,
            "autoConnect": true
        }'::jsonb,
        '{
            "centralConcept": {
                "id": "central",
                "text": "Marie Curie",
                "level": 0
            },
            "nodes": [
                {
                    "id": "node-1",
                    "text": "Radioactividad",
                    "level": 1,
                    "category": "discovery",
                    "correctPosition": {"x": 50, "y": 20}
                },
                {
                    "id": "node-2",
                    "text": "Radio",
                    "level": 2,
                    "category": "element",
                    "correctPosition": {"x": 30, "y": 40}
                },
                {
                    "id": "node-3",
                    "text": "Polonio",
                    "level": 2,
                    "category": "element",
                    "correctPosition": {"x": 70, "y": 40}
                },
                {
                    "id": "node-4",
                    "text": "Nobel de Física 1903",
                    "level": 1,
                    "category": "award",
                    "correctPosition": {"x": 20, "y": 60}
                },
                {
                    "id": "node-5",
                    "text": "Nobel de Química 1911",
                    "level": 1,
                    "category": "award",
                    "correctPosition": {"x": 80, "y": 60}
                },
                {
                    "id": "node-6",
                    "text": "Pechblenda",
                    "level": 2,
                    "category": "material",
                    "correctPosition": {"x": 50, "y": 80}
                }
            ],
            "connections": [
                {"from": "central", "to": "node-1", "label": "descubrió"},
                {"from": "node-1", "to": "node-2", "label": "elemento"},
                {"from": "node-1", "to": "node-3", "label": "elemento"},
                {"from": "node-2", "to": "node-6", "label": "extraído de"},
                {"from": "node-3", "to": "node-6", "label": "extraído de"},
                {"from": "central", "to": "node-4", "label": "recibió"},
                {"from": "central", "to": "node-5", "label": "recibió"}
            ]
        }'::jsonb,
        '{
            "correctConnections": [
                {"from": "central", "to": "node-1"},
                {"from": "node-1", "to": "node-2"},
                {"from": "node-1", "to": "node-3"},
                {"from": "node-2", "to": "node-6"},
                {"from": "node-3", "to": "node-6"},
                {"from": "central", "to": "node-4"},
                {"from": "central", "to": "node-5"}
            ]
        }'::jsonb,
        'beginner', 100, 70,
        15, 25, 3,
        ARRAY[
            'Marie descubrió la radioactividad como concepto principal',
            'Radio y Polonio son elementos extraídos de la pechblenda',
            'Marie ganó dos Premios Nobel en diferentes disciplinas'
        ]::text[],
        true, 15,
        ARRAY['pistas', 'vision_lectora', 'segunda_oportunidad']::gamification_system.comodin_type[],
        '{
            "pistas": {"enabled": true, "cost": 15},
            "vision_lectora": {"enabled": true, "cost": 25},
            "segunda_oportunidad": {"enabled": true, "cost": 40}
        }'::jsonb,
        25, 12,
        true, 1
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        content = EXCLUDED.content,
        solution = EXCLUDED.solution,
        updated_at = NOW();

    -- ========================================================================
    -- EXERCISE 1.5: EMPAREJAMIENTO
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
        'Emparejamiento: Fechas y Eventos de Marie Curie',
        'Conecta Fechas con Eventos Históricos',
        'Une cada fecha importante con el evento correspondiente en la vida de Marie Curie.',
        'Haz clic en una fecha de la columna izquierda y luego en el evento correspondiente de la columna derecha para emparejarlos.',
        'emparejamiento', 5,
        '{
            "matchingType": "cards",
            "allowMultipleAttempts": true,
            "shuffleCards": true,
            "showFeedback": "immediate"
        }'::jsonb,
        '{
            "scenarioText": "Marie Curie vivió una vida extraordinaria marcada por momentos históricos. ¿Puedes emparejar cada fecha con su evento correspondiente?",
            "pairs": [
                {
                    "id": "pair-1",
                    "left": {"id": "q1", "content": "1867", "type": "date"},
                    "right": {"id": "a1", "content": "Nacimiento de Maria Sklodowska en Varsovia", "type": "event"}
                },
                {
                    "id": "pair-2",
                    "left": {"id": "q2", "content": "1891", "type": "date"},
                    "right": {"id": "a2", "content": "Traslado a París para estudiar en la Sorbona", "type": "event"}
                },
                {
                    "id": "pair-3",
                    "left": {"id": "q3", "content": "1895", "type": "date"},
                    "right": {"id": "a3", "content": "Matrimonio con Pierre Curie", "type": "event"}
                },
                {
                    "id": "pair-4",
                    "left": {"id": "q4", "content": "1898", "type": "date"},
                    "right": {"id": "a4", "content": "Descubrimiento del polonio y el radio", "type": "event"}
                },
                {
                    "id": "pair-5",
                    "left": {"id": "q5", "content": "1903", "type": "date"},
                    "right": {"id": "a5", "content": "Primer Premio Nobel (Física)", "type": "event"}
                },
                {
                    "id": "pair-6",
                    "left": {"id": "q6", "content": "1911", "type": "date"},
                    "right": {"id": "a6", "content": "Segundo Premio Nobel (Química)", "type": "event"}
                },
                {
                    "id": "pair-7",
                    "left": {"id": "q7", "content": "1934", "type": "date"},
                    "right": {"id": "a7", "content": "Fallecimiento por anemia aplásica", "type": "event"}
                }
            ]
        }'::jsonb,
        '{
            "correctPairs": [
                {"left": "q1", "right": "a1"},
                {"left": "q2", "right": "a2"},
                {"left": "q3", "right": "a3"},
                {"left": "q4", "right": "a4"},
                {"left": "q5", "right": "a5"},
                {"left": "q6", "right": "a6"},
                {"left": "q7", "right": "a7"}
            ]
        }'::jsonb,
        'beginner', 100, 70,
        10, 18, 3,
        ARRAY[
            'Marie nació en el siglo XIX (1800s)',
            'Los descubrimientos importantes fueron en 1898',
            'Ganó dos Nobel: uno en 1903 y otro en 1911'
        ]::text[],
        true, 10,
        ARRAY['pistas', 'vision_lectora', 'segunda_oportunidad']::gamification_system.comodin_type[],
        '{
            "pistas": {"enabled": true, "cost": 15},
            "vision_lectora": {"enabled": true, "cost": 25},
            "segunda_oportunidad": {"enabled": true, "cost": 40}
        }'::jsonb,
        20, 10,
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

    RAISE NOTICE '✅ Módulo 1 (MOD-01-LITERAL): 5 ejercicios cargados exitosamente';
    RAISE NOTICE '   - Crucigrama Científico';
    RAISE NOTICE '   - Línea de Tiempo';
    RAISE NOTICE '   - Sopa de Letras';
    RAISE NOTICE '   - Mapa Conceptual';
    RAISE NOTICE '   - Emparejamiento';
END $$;
