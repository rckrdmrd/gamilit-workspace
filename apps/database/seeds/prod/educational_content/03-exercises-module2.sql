-- =====================================================
-- Seed Data: Exercises Module 2 - Comprensión Inferencial (PRODUCTION)
-- =====================================================
-- Description: Ejercicios interactivos del Módulo (PRODUCTION) 2
-- Module: MOD-02-INFERENCIAL
-- Exercises: Detective Textual, Construcción Hipótesis, Predicción, Puzzle, Rueda Inferencias
-- Created by: SA-SEEDS-EDUCATIONAL
-- Date: 2025-11-11
-- Status: PRODUCTION
-- =====================================================

SET search_path TO educational_content, public;

DO $$
DECLARE
    mod_id UUID;
BEGIN
    SELECT id INTO mod_id FROM educational_content.modules WHERE module_code = 'MOD-02-INFERENCIAL';

    IF mod_id IS NULL THEN
        RAISE EXCEPTION 'Módulo MOD-02-INFERENCIAL no encontrado';
    END IF;

    -- ========================================================================
    -- EXERCISE 2.1: DETECTIVE TEXTUAL
    -- ========================================================================
    INSERT INTO educational_content.exercises (
        module_id, title, subtitle, description, instructions,
        exercise_type, order_index,
        config, content, solution,
        difficulty_level, max_points, passing_score,
        estimated_time_minutes, time_limit_minutes, max_attempts,
        hints, enable_hints, hint_cost_ml_coins,
        xp_reward, ml_coins_reward,
        is_active, version
    ) VALUES (
        mod_id,
        'Detective Textual: El Misterio de la Radiación',
        'Encuentra Evidencias Implícitas',
        'Analiza el texto sobre Marie Curie para encontrar información que no está escrita directamente pero que puedes deducir del contexto.',
        'Lee cuidadosamente el pasaje y responde las preguntas basándote en las pistas implícitas del texto.',
        'detective_textual', 1,
        '{
            "showHints": true,
            "timePerQuestion": 90,
            "allowReview": true
        }'::jsonb,
        '{
            "passage": "Marie Curie trabajaba largas horas en un laboratorio mal ventilado, rodeada de materiales radiactivos. A menudo llevaba tubos de ensayo con radio en los bolsillos de su bata de trabajo. Sus cuadernos de investigación brillaban misteriosamente en la oscuridad de la noche. A pesar de sentirse frecuentemente fatigada y con dolores, Marie continuaba su investigación sin descanso, convencida de que su trabajo beneficiaría a la humanidad.",
            "questions": [
                {
                    "id": "q1",
                    "question": "¿Por qué los cuadernos de Marie brillaban en la oscuridad?",
                    "options": [
                        "Usaba tinta especial fluorescente para escribir",
                        "Estaban contaminados con material radiactivo",
                        "Los escribía con lápiz luminoso importado",
                        "Era un efecto óptico de la luz de la luna"
                    ],
                    "correctAnswer": 1,
                    "explanation": "La radiación del radio con el que trabajaba constantemente contaminó sus cuadernos, haciéndolos radioactivos y, por tanto, luminiscentes.",
                    "inference_type": "causa_efecto"
                },
                {
                    "id": "q2",
                    "question": "¿Qué podemos inferir sobre las condiciones de seguridad en su laboratorio?",
                    "options": [
                        "Eran excelentes y seguían protocolos estrictos",
                        "Eran inadecuadas y peligrosas para la salud",
                        "Cumplían con los estándares modernos de seguridad",
                        "No trabajaba con materiales peligrosos realmente"
                    ],
                    "correctAnswer": 1,
                    "explanation": "Llevar material radiactivo en los bolsillos y trabajar en un lugar mal ventilado indica una total falta de protocolos de seguridad adecuados.",
                    "inference_type": "contexto_situacional"
                },
                {
                    "id": "q3",
                    "question": "¿Qué sugiere el texto sobre la relación entre sus síntomas físicos y su trabajo?",
                    "options": [
                        "Sus síntomas no tenían relación con su investigación",
                        "La fatiga y dolores probablemente eran causados por la exposición a radiación",
                        "Sufría de enfermedades comunes no relacionadas",
                        "Los síntomas eran psicosomáticos por estrés"
                    ],
                    "correctAnswer": 1,
                    "explanation": "La conexión entre trabajar con materiales radiactivos sin protección y experimentar fatiga y dolores sugiere fuertemente que la radiación estaba afectando su salud.",
                    "inference_type": "causa_efecto"
                },
                {
                    "id": "q4",
                    "question": "¿Qué motivación impulsaba a Marie a continuar trabajando a pesar de sus malestares?",
                    "options": [
                        "El deseo de ganar fama y reconocimiento personal",
                        "La convicción de que su trabajo ayudaría a la humanidad",
                        "La presión de su esposo Pierre",
                        "La necesidad económica de su familia"
                    ],
                    "correctAnswer": 1,
                    "explanation": "El texto menciona explícitamente que Marie continuaba su trabajo convencida de que beneficiaría a la humanidad, mostrando su motivación altruista.",
                    "inference_type": "motivacion"
                }
            ]
        }'::jsonb,
        '{
            "correctAnswers": [1, 1, 1, 1],
            "totalQuestions": 4
        }'::jsonb,
        'intermediate', 100, 75,
        25, 35, 3,
        ARRAY[
            'Piensa en cómo los materiales radiactivos pueden contaminar objetos',
            'En esa época no se conocían bien los riesgos de la radiación',
            'Las motivaciones de Marie eran principalmente científicas y humanitarias'
        ]::text[],
        true, 15,
        100, 20,
        true, 1
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        content = EXCLUDED.content,
        updated_at = NOW();

    -- ========================================================================
    -- EXERCISE 2.2: RELACIONES CAUSA-EFECTO (DRAG & DROP)
    -- ========================================================================
    INSERT INTO educational_content.exercises (
        module_id, title, subtitle, description, instructions,
        exercise_type, order_index,
        config, content, solution,
        difficulty_level, max_points, passing_score,
        estimated_time_minutes, max_attempts,
        hints, enable_hints, hint_cost_ml_coins,
        xp_reward, ml_coins_reward,
        is_active, version
    ) VALUES (
        mod_id,
        'Relaciones Causa-Efecto sobre Marie Curie',
        'Conectando Causas con sus Consecuencias',
        'Conecta causas con sus consecuencias lógicas sobre decisiones y eventos de la vida de Marie Curie.',
        'Lee la CAUSA en la columna izquierda y arrastra las CONSECUENCIAS correctas desde la derecha. Cada causa puede tener 1-3 consecuencias. Piensa en efectos inmediatos, efectos a largo plazo e impacto en otros.',
        'construccion_hipotesis', 2,
        '{
            "allowMultiple": true,
            "showFeedback": true,
            "dragAndDrop": true
        }'::jsonb,
        '{
            "causes": [
                {
                    "id": "c1",
                    "text": "Marie decidió no patentar el proceso de aislamiento del radio"
                },
                {
                    "id": "c2",
                    "text": "Marie continuó trabajando después de la muerte de Pierre"
                }
            ],
            "consequences": [
                {
                    "id": "e1",
                    "text": "Otros científicos pudieron continuar la investigación",
                    "correctCauseIds": ["c1"]
                },
                {
                    "id": "e2",
                    "text": "No obtuvo riquezas de su descubrimiento",
                    "correctCauseIds": ["c1"]
                },
                {
                    "id": "e3",
                    "text": "La medicina avanzó más rápidamente",
                    "correctCauseIds": ["c1"]
                },
                {
                    "id": "e4",
                    "text": "Demostró su independencia científica",
                    "correctCauseIds": []
                },
                {
                    "id": "e5",
                    "text": "Completó investigaciones pendientes",
                    "correctCauseIds": ["c2"]
                },
                {
                    "id": "e6",
                    "text": "Se convirtió en la primera profesora de la Sorbona",
                    "correctCauseIds": ["c2"]
                }
            ]
        }'::jsonb,
        '{
            "correctMatches": {
                "c1": ["e1", "e2", "e3"],
                "c2": ["e5", "e6"]
            }
        }'::jsonb,
        'intermediate', 100, 70,
        20, 20,
        ARRAY[
            'Lee cada causa cuidadosamente antes de seleccionar las consecuencias',
            'Una causa puede tener múltiples efectos: inmediatos, a largo plazo y en otros',
            'No todas las consecuencias pertenecen a todas las causas'
        ]::text[],
        true, 15,
        100, 20,
        true, 1
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        content = EXCLUDED.content,
        updated_at = NOW();

    -- ========================================================================
    -- EXERCISE 2.3: PREDICCIÓN NARRATIVA
    -- ========================================================================
    INSERT INTO educational_content.exercises (
        module_id, title, subtitle, description, instructions,
        exercise_type, order_index,
        config, content, solution,
        difficulty_level, max_points, passing_score,
        estimated_time_minutes, max_attempts,
        hints, enable_hints, hint_cost_ml_coins,
        xp_reward, ml_coins_reward,
        is_active, version
    ) VALUES (
        mod_id,
        'Predicción Narrativa: ¿Qué Sucederá Después?',
        'Predice Eventos Basándote en el Contexto',
        'Lee escenarios de la vida de Marie Curie y predice qué sucederá después basándote en el contexto histórico y las pistas del texto.',
        'Analiza cada situación y selecciona la predicción más lógica considerando el contexto histórico y las motivaciones de Marie.',
        'prediccion_narrativa', 3,
        '{
            "showContext": true,
            "allowExplanations": true
        }'::jsonb,
        '{
            "scenarios": [
                {
                    "id": "pred-1",
                    "context": "Año 1911. Marie Curie ya ha ganado el Premio Nobel de Física (1903) junto a Pierre Curie y Henri Becquerel por sus investigaciones sobre la radiactividad. Ahora, siendo viuda desde 1906, ha continuado sus investigaciones y ha aislado el radio puro, un logro científico extraordinario.",
                    "beginning": "Cuando Marie presentó su candidatura a la Academia de Ciencias Francesa en 1911, siendo ya ganadora del Nobel...",
                    "question": "¿Cómo continúa más probablemente?",
                    "predictions": [
                        {
                            "id": "p1",
                            "text": "fue aceptada inmediatamente con honores",
                            "isCorrect": false,
                            "explanation": "Aunque Marie tenía méritos excepcionales, la Academia Francesa era una institución profundamente conservadora que nunca había admitido mujeres en sus más de 200 años de historia."
                        },
                        {
                            "id": "p2",
                            "text": "fue rechazada por ser mujer, a pesar de sus logros",
                            "isCorrect": true,
                            "explanation": "Correcto. A pesar de sus extraordinarios logros científicos, Marie fue rechazada por la Academia de Ciencias Francesa en 1911 por un voto (30-28). Los prejuicios de género de la época pesaron más que sus méritos. Irónicamente, ese mismo año ganó su segundo Nobel, esta vez en Química, convirtiéndose en la primera persona en ganar dos premios Nobel."
                        },
                        {
                            "id": "p3",
                            "text": "decidió retirar su candidatura",
                            "isCorrect": false,
                            "explanation": "Marie no era de las que se rendían ante obstáculos. Su determinación y convicción en su trabajo científico la llevaron a mantener su candidatura hasta el final, a pesar de la oposición."
                        },
                        {
                            "id": "p4",
                            "text": "fue elegida presidenta de la Academia",
                            "isCorrect": false,
                            "explanation": "Este escenario es completamente anacrónico. No solo no fue aceptada, sino que la Academia no admitiría a su primera mujer hasta 1979, décadas después de la muerte de Marie."
                        }
                    ],
                    "contextualHint": "Considera los prejuicios de género de la época. Recuerda que Marie era perseverante pero modesta, y que los hechos históricos no se pueden cambiar."
                }
            ]
        }'::jsonb,
        '{
            "correctPredictions": ["pred-1-p2"]
        }'::jsonb,
        'intermediate', 100, 70,
        15, 3,
        ARRAY[
            'Recuerda el contexto de discriminación de género de la época - las instituciones científicas eran profundamente conservadoras',
            'Marie era perseverante pero modesta - enfrentó muchos rechazos pero nunca se rindió',
            'Los hechos históricos no se pueden cambiar - considera qué realmente sucedió en 1911'
        ]::text[],
        true, 15,
        100, 20,
        true, 1
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        content = EXCLUDED.content,
        updated_at = NOW();

    -- ========================================================================
    -- EXERCISE 2.4: PUZZLE DE CONTEXTO
    -- ========================================================================
    INSERT INTO educational_content.exercises (
        module_id, title, subtitle, description, instructions,
        exercise_type, order_index,
        config, content, solution,
        difficulty_level, max_points, passing_score,
        estimated_time_minutes, max_attempts,
        hints, enable_hints, hint_cost_ml_coins,
        xp_reward, ml_coins_reward,
        is_active, version
    ) VALUES (
        mod_id,
        'Puzzle de Contexto',
        'Ordenar fragmentos para crear una inferencia coherente',
        'Ordena los fragmentos para formar una inferencia completa y coherente sobre Marie Curie.',
        'Arrastra los fragmentos desordenados al área de construcción para formar la inferencia en el orden correcto.',
        'puzzle_contexto', 4,
        '{
            "dragAndDrop": true,
            "allowReordering": true,
            "showValidation": "onComplete"
        }'::jsonb,
        '{
            "completeInference": "A pesar de las barreras sociales y económicas que enfrentó como mujer inmigrante, demostró una determinación extraordinaria, convirtiéndose en pionera de la ciencia moderna.",
            "fragments": [
                {
                    "id": "frag-a",
                    "label": "A",
                    "text": "demostró una determinación extraordinaria",
                    "correctPosition": 2
                },
                {
                    "id": "frag-b",
                    "label": "B",
                    "text": "A pesar de las barreras sociales y económicas",
                    "correctPosition": 0
                },
                {
                    "id": "frag-c",
                    "label": "C",
                    "text": "que enfrentó como mujer inmigrante",
                    "correctPosition": 1
                },
                {
                    "id": "frag-d",
                    "label": "D",
                    "text": "convirtiéndose en pionera de la ciencia moderna",
                    "correctPosition": 3
                }
            ]
        }'::jsonb,
        '{
            "correctOrder": ["frag-b", "frag-c", "frag-a", "frag-d"]
        }'::jsonb,
        'intermediate', 100, 70,
        15, 3,
        ARRAY[
            'Lee todos los fragmentos antes de empezar a ordenarlos',
            'Busca conectores lógicos entre fragmentos (aunque, que, por lo tanto)',
            'La inferencia debe tener coherencia gramatical y sentido completo'
        ]::text[],
        true, 15,
        100, 20,
        true, 1
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        description = EXCLUDED.description,
        instructions = EXCLUDED.instructions,
        content = EXCLUDED.content,
        solution = EXCLUDED.solution,
        hints = EXCLUDED.hints,
        estimated_time_minutes = EXCLUDED.estimated_time_minutes,
        max_attempts = EXCLUDED.max_attempts,
        updated_at = NOW();

    -- ========================================================================
    -- EXERCISE 2.5: RUEDA DE INFERENCIAS
    -- ========================================================================
    INSERT INTO educational_content.exercises (
        module_id, title, subtitle, description, instructions,
        exercise_type, order_index,
        config, content, solution,
        difficulty_level, max_points, passing_score,
        estimated_time_minutes, max_attempts,
        hints, enable_hints, hint_cost_ml_coins,
        xp_reward, ml_coins_reward,
        is_active, version
    ) VALUES (
        mod_id,
        'Rueda de Inferencias: Conectando Ideas',
        'Visualiza las Relaciones entre Causas y Efectos',
        'Crea conexiones entre observaciones directas y las inferencias que podemos hacer sobre la vida de Marie Curie.',
        'Arrastra las inferencias correctas para conectarlas con las observaciones del texto central.',
        'rueda_inferencias', 5,
        '{
            "visualType": "radial",
            "allowMultipleConnections": true,
            "showFeedback": "onConnect"
        }'::jsonb,
        '{
            "centralConcept": {
                "id": "central",
                "text": "Marie trabajó con materiales radiactivos toda su vida sin protección adecuada",
                "type": "observation"
            },
            "inferences": [
                {
                    "id": "inf-1",
                    "text": "Marie probablemente no conocía completamente los riesgos de la radiación",
                    "isCorrect": true,
                    "type": "contexto_historico",
                    "explanation": "En la década de 1890-1910, los efectos de la radiación en la salud no eran bien comprendidos."
                },
                {
                    "id": "inf-2",
                    "text": "Su muerte por anemia aplásica fue causada por exposición crónica a radiación",
                    "isCorrect": true,
                    "type": "causa_efecto",
                    "explanation": "La exposición prolongada a radiación ionizante daña la médula ósea, causando anemia aplásica."
                },
                {
                    "id": "inf-3",
                    "text": "Marie priorizaba el avance científico sobre su seguridad personal",
                    "isCorrect": true,
                    "type": "motivacion",
                    "explanation": "Incluso cuando empezó a experimentar síntomas, continuó su trabajo, mostrando su dedicación a la ciencia."
                },
                {
                    "id": "inf-4",
                    "text": "Sus cuadernos siguen siendo radiactivos más de 100 años después",
                    "isCorrect": true,
                    "type": "consecuencia_duradera",
                    "explanation": "La vida media del radio-226 es de 1,600 años, por lo que los objetos contaminados permanecen radiactivos."
                },
                {
                    "id": "inf-5",
                    "text": "Marie era descuidada e irresponsable en su trabajo",
                    "isCorrect": false,
                    "type": "juicio_incorrecto",
                    "explanation": "Incorrecto. Marie era meticulosa en su trabajo científico; simplemente no se conocían los riesgos en su época."
                },
                {
                    "id": "inf-6",
                    "text": "El radio no es realmente peligroso para los humanos",
                    "isCorrect": false,
                    "type": "conclusion_incorrecta",
                    "explanation": "Incorrecto. El radio es extremadamente peligroso; hoy sabemos que la exposición causó la muerte de Marie."
                }
            ]
        }'::jsonb,
        '{
            "correctInferences": ["inf-1", "inf-2", "inf-3", "inf-4"],
            "incorrectInferences": ["inf-5", "inf-6"]
        }'::jsonb,
        'intermediate', 100, 75,
        20, 20,
        ARRAY[
            'Distingue entre inferencias basadas en evidencia y juicios de valor',
            'Considera el contexto histórico: el conocimiento científico de esa época era limitado',
            'Las inferencias correctas explican hechos observables de manera lógica'
        ]::text[],
        true, 15,
        100, 20,
        true, 1
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        content = EXCLUDED.content,
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

    RAISE NOTICE '✅ Módulo 2 (MOD-02-INFERENCIAL): 5 ejercicios cargados exitosamente';
    RAISE NOTICE '   - Detective Textual';
    RAISE NOTICE '   - Construcción de Hipótesis';
    RAISE NOTICE '   - Predicción Narrativa';
    RAISE NOTICE '   - Puzzle de Contexto';
    RAISE NOTICE '   - Rueda de Inferencias';
END $$;
