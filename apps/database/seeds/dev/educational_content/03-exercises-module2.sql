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
    -- EXERCISE 2.2: CONSTRUCCIÓN DE HIPÓTESIS
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
        'Construcción de Hipótesis Científicas',
        'Predice Consecuencias como un Científico',
        'Formula hipótesis sobre las consecuencias de los descubrimientos de Marie Curie basándote en el método científico.',
        'Lee cada escenario científico y selecciona la hipótesis más probable basándote en la evidencia presentada.',
        'construccion_hipotesis', 2,
        '{
            "allowMultiple": false,
            "showFeedback": true,
            "requireJustification": false
        }'::jsonb,
        '{
            "scenarios": [
                {
                    "id": "s1",
                    "situation": "Marie Curie descubre que el radio emite energía constantemente sin aparente fuente externa de alimentación. Este fenómeno desafía la comprensión científica de su época sobre la conservación de la energía.",
                    "question": "¿Qué hipótesis podría formular Marie sobre este fenómeno extraordinario?",
                    "hypotheses": [
                        {
                            "id": "h1",
                            "text": "El radio absorbe energía del aire circundante y la reemite",
                            "isCorrect": false,
                            "feedback": "Esta hipótesis no explica la emisión constante de energía durante años sin disminución aparente."
                        },
                        {
                            "id": "h2",
                            "text": "El átomo de radio se desintegra gradualmente liberando energía almacenada en su núcleo",
                            "isCorrect": true,
                            "feedback": "¡Correcto! Esta hipótesis llevó al descubrimiento de la radioactividad y la comprensión de la desintegración atómica, revolucionando la física nuclear."
                        },
                        {
                            "id": "h3",
                            "text": "El radio tiene propiedades mágicas inexplicables por la ciencia",
                            "isCorrect": false,
                            "feedback": "Las hipótesis científicas deben basarse en explicaciones naturales verificables, no en fenómenos sobrenaturales."
                        },
                        {
                            "id": "h4",
                            "text": "Es un error experimental y el radio en realidad no emite energía",
                            "isCorrect": false,
                            "feedback": "Los múltiples experimentos confirmaron consistentemente la emisión de energía del radio."
                        }
                    ]
                },
                {
                    "id": "s2",
                    "situation": "Marie observa que los investigadores que trabajan frecuentemente con materiales radiactivos desarrollan enfermedades similares: fatiga extrema, anemia y lesiones en la piel.",
                    "question": "¿Qué relación causal podría inferir Marie entre el radio y estos síntomas?",
                    "hypotheses": [
                        {
                            "id": "h1",
                            "text": "Las enfermedades son meras coincidencias sin relación real",
                            "isCorrect": false,
                            "feedback": "La frecuencia y similitud de los síntomas en todos los investigadores expuestos sugiere una relación causal, no una coincidencia."
                        },
                        {
                            "id": "h2",
                            "text": "La exposición prolongada al radio causa efectos nocivos en los tejidos vivos",
                            "isCorrect": true,
                            "feedback": "Correcto. La radiación ionizante daña las células vivas, causando los síntomas observados. Este descubrimiento fue crucial para entender los riesgos de la radiación."
                        },
                        {
                            "id": "h3",
                            "text": "Los síntomas son causados por el estrés del trabajo científico intenso",
                            "isCorrect": false,
                            "feedback": "Aunque el estrés puede causar fatiga, no explica las lesiones físicas específicas ni la anemia observadas."
                        }
                    ]
                },
                {
                    "id": "s3",
                    "situation": "Tras aislar el radio, Marie nota que una muestra de pechblenda (mineral de uranio) emite más radiación que el uranio puro que contiene.",
                    "question": "¿Qué puede hipotizar Marie sobre esta observación?",
                    "hypotheses": [
                        {
                            "id": "h1",
                            "text": "La pechblenda contiene otros elementos radiactivos aún desconocidos",
                            "isCorrect": true,
                            "feedback": "¡Excelente! Esta hipótesis llevó a Marie al descubrimiento del polonio y el radio. Un brillante ejemplo de razonamiento científico."
                        },
                        {
                            "id": "h2",
                            "text": "El instrumento de medición está defectuoso",
                            "isCorrect": false,
                            "feedback": "Marie verificó sus resultados múltiples veces con diferentes instrumentos antes de formular su hipótesis."
                        },
                        {
                            "id": "h3",
                            "text": "El uranio se vuelve más radiactivo cuando está mezclado con otros minerales",
                            "isCorrect": false,
                            "feedback": "La radiactividad es una propiedad intrínseca de los elementos, no aumenta por mezclas con otros minerales no radiactivos."
                        }
                    ]
                }
            ]
        }'::jsonb,
        '{
            "correctHypotheses": ["s1-h2", "s2-h2", "s3-h1"]
        }'::jsonb,
        'intermediate', 100, 70,
        100, 20,
        ARRAY[
            'Piensa en el método científico: observación → hipótesis → verificación',
            'Las hipótesis correctas explican todos los fenómenos observados',
            'Marie fue pionera en aplicar el pensamiento científico riguroso'
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
                    "context": "Año 1895. Marie acaba de casarse con Pierre Curie. Ambos son científicos apasionados. En esa época, se esperaba que las mujeres casadas dejaran sus carreras profesionales para dedicarse al hogar.",
                    "question": "¿Qué decisión es más probable que tome Marie?",
                    "predictions": [
                        {
                            "id": "p1",
                            "text": "Abandonará la ciencia para ser ama de casa tradicional",
                            "isCorrect": false,
                            "explanation": "Aunque era la expectativa social, la pasión de Marie por la ciencia y el apoyo de Pierre hicieron improbable esta opción."
                        },
                        {
                            "id": "p2",
                            "text": "Continuará investigando, colaborando científicamente con Pierre",
                            "isCorrect": true,
                            "explanation": "Correcto. Marie y Pierre formaron una histórica asociación científica, trabajando juntos en investigación mientras desafiaban las normas sociales."
                        },
                        {
                            "id": "p3",
                            "text": "Se mudará a otro país para escapar de las restricciones sociales",
                            "isCorrect": false,
                            "explanation": "Marie ya estaba en Francia, uno de los lugares más progresistas de la época, y tenía el apoyo de Pierre."
                        }
                    ]
                },
                {
                    "id": "pred-2",
                    "context": "Año 1903. Marie, Pierre y Henri Becquerel acaban de ganar el Premio Nobel de Física. Sin embargo, Marie nota que los medios y la comunidad científica tienden a minimizar su contribución, atribuyendo el mérito principalmente a los hombres.",
                    "question": "¿Cómo responderá probablemente Marie a esta situación?",
                    "predictions": [
                        {
                            "id": "p1",
                            "text": "Aceptará silenciosamente la situación sin quejarse",
                            "isCorrect": false,
                            "explanation": "Marie tenía un fuerte carácter y defendía su trabajo, aunque con dignidad y profesionalismo."
                        },
                        {
                            "id": "p2",
                            "text": "Trabajará aún más duro para demostrar su valía científica con nuevos descubrimientos",
                            "isCorrect": true,
                            "explanation": "Correcto. Marie continuó su investigación con determinación, ganando un segundo Nobel en 1911 (esta vez sola), demostrando indiscutiblemente su genio."
                        },
                        {
                            "id": "p3",
                            "text": "Abandonará la ciencia frustrada por la discriminación",
                            "isCorrect": false,
                            "explanation": "La perseverancia era una de las características más notables de Marie; los obstáculos la motivaban más."
                        }
                    ]
                },
                {
                    "id": "pred-3",
                    "context": "Año 1898. Marie y Pierre han descubierto el radio y el polonio. Algunos empresarios les ofrecen grandes sumas de dinero si patentan el proceso de extracción del radio. La pareja necesita dinero, pero también cree en la ciencia abierta.",
                    "question": "¿Qué decisión tomarán más probablemente?",
                    "predictions": [
                        {
                            "id": "p1",
                            "text": "Patentarán el proceso y se harán ricos",
                            "isCorrect": false,
                            "explanation": "Aunque necesitaban dinero, sus principios éticos eran más fuertes que el interés económico."
                        },
                        {
                            "id": "p2",
                            "text": "Publicarán sus métodos libremente para beneficio de la humanidad",
                            "isCorrect": true,
                            "explanation": "Correcto. Marie y Pierre rechazaron patentar sus descubrimientos, creyendo que el conocimiento científico debía ser libre para ayudar a la humanidad, especialmente en medicina."
                        },
                        {
                            "id": "p3",
                            "text": "Patentarán parcialmente para proteger algunos aspectos",
                            "isCorrect": false,
                            "explanation": "Su decisión fue absoluta: compartieron toda su investigación sin restricciones."
                        }
                    ]
                }
            ]
        }'::jsonb,
        '{
            "correctPredictions": ["pred-1-p2", "pred-2-p2", "pred-3-p2"]
        }'::jsonb,
        'intermediate', 100, 70,
        100, 20,
        ARRAY[
            'Considera las características personales de Marie: determinación, pasión por la ciencia, principios éticos',
            'El contexto histórico es importante pero Marie frecuentemente desafió las normas',
            'Las acciones de Marie siempre estuvieron guiadas por su visión del bien común'
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
        'Puzzle de Contexto: Armando la Historia',
        'Ordena las Piezas del Contexto Histórico',
        'Arrastra las piezas de información para reconstruir el contexto completo de un evento en la vida de Marie Curie.',
        'Lee las piezas de información y arrástralas al lugar correcto en la narrativa para completar la historia coherentemente.',
        'puzzle_contexto', 4,
        '{
            "dragAndDrop": true,
            "allowReordering": true,
            "showValidation": "onComplete"
        }'::jsonb,
        '{
            "narrative": {
                "title": "El Descubrimiento del Radio: Reconstruyendo el Contexto",
                "incompleteText": "En [SLOT-1], Marie Curie trabajaba en un [SLOT-2] tratando de entender por qué la pechblenda era más radiactiva que el uranio. Sospechaba que [SLOT-3]. Después de [SLOT-4] de trabajo agotador refinando toneladas de pechblenda, finalmente [SLOT-5]. Este descubrimiento revolucionó [SLOT-6]."
            },
            "pieces": [
                {
                    "id": "piece-1",
                    "text": "1898",
                    "correctSlot": "SLOT-1",
                    "category": "temporal"
                },
                {
                    "id": "piece-2",
                    "text": "laboratorio improvisado y mal equipado",
                    "correctSlot": "SLOT-2",
                    "category": "lugar"
                },
                {
                    "id": "piece-3",
                    "text": "había elementos radiactivos desconocidos en el mineral",
                    "correctSlot": "SLOT-3",
                    "category": "hipotesis"
                },
                {
                    "id": "piece-4",
                    "text": "cuatro años",
                    "correctSlot": "SLOT-4",
                    "category": "duracion"
                },
                {
                    "id": "piece-5",
                    "text": "aisló una pequeña cantidad de radio puro que brillaba en la oscuridad",
                    "correctSlot": "SLOT-5",
                    "category": "resultado"
                },
                {
                    "id": "piece-6",
                    "text": "nuestra comprensión de la física atómica y abrió la era nuclear",
                    "correctSlot": "SLOT-6",
                    "category": "impacto"
                }
            ],
            "distractors": [
                {
                    "id": "dist-1",
                    "text": "1905",
                    "category": "temporal"
                },
                {
                    "id": "dist-2",
                    "text": "laboratorio de última generación",
                    "category": "lugar"
                },
                {
                    "id": "dist-3",
                    "text": "seis meses",
                    "category": "duracion"
                }
            ]
        }'::jsonb,
        '{
            "correctPlacements": {
                "SLOT-1": "piece-1",
                "SLOT-2": "piece-2",
                "SLOT-3": "piece-3",
                "SLOT-4": "piece-4",
                "SLOT-5": "piece-5",
                "SLOT-6": "piece-6"
            }
        }'::jsonb,
        'intermediate', 100, 75,
        100, 20,
        ARRAY[
            'Lee toda la narrativa primero para entender el contexto general',
            'Las piezas están categorizadas: temporales, de lugar, hipótesis, duración, resultado e impacto',
            'El descubrimiento del radio tomó varios años de trabajo intenso'
        ]::text[],
        true, 15,
        100, 20,
        true, 1
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        content = EXCLUDED.content,
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
        100, 20,
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
