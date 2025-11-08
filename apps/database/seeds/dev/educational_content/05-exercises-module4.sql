-- =====================================================
-- Seed Data: Exercises Module 4 - Textos Digitales (DEV)
-- =====================================================
-- Description: 9 ejercicios completos del Módulo 4
-- Module: MOD-04-DIGITAL
-- Source: Migrado desde /home/isem/workspace/projects/glit/database
-- Date: 2025-11-03
-- Migration: ATLAS-DATABASE - ANALISIS-PRE-CORRECCIONES-BD-ORIGEN.md
-- Changes: Reemplazó 3 ejercicios compactos con 9 ejercicios completos
-- =====================================================

SET search_path TO educational_content, public;

DO $$
DECLARE
    mod_id UUID;
BEGIN
    SELECT id INTO mod_id FROM educational_content.modules WHERE module_code = 'MOD-04-DIGITAL';

    IF mod_id IS NULL THEN
        RAISE EXCEPTION 'Módulo MOD-04-DIGITAL no encontrado. Ejecutar 01-modules.sql primero';
    END IF;

    -- Exercise 4.1: Verificador de Fake News
    INSERT INTO educational_content.exercises (
        module_id, title, subtitle, description, instructions,
        exercise_type, order_index,
        config, content, solution,
        difficulty_level, max_points, passing_score,
        estimated_time_minutes, max_attempts,
        hints, xp_reward, ml_coins_reward,
        is_active
    ) VALUES (
        mod_id,
        'Verificador de Fake News: Marie Curie en Internet',
        'Distingue Hechos de Ficción',
        'Analiza artículos sobre Marie Curie publicados en internet. Identifica afirmaciones falsas y verifica información con fuentes confiables',
        'Lee cada artículo. Selecciona las afirmaciones que te parecen sospechosas. Usa las herramientas de verificación para comprobar los hechos.',
        'verificador_fake_news', 1,
        '{
            "factCheckTools": true,
            "sourceVerification": true,
            "claimExtraction": true,
            "confidenceScoring": true
        }'::jsonb,
        '{
            "articles": [
                {
                    "id": "art1",
                    "title": "Marie Curie: La científica que ganó 3 Premios Nobel",
                    "source": "Blog de ciencia popular",
                    "claims": [
                        {
                            "text": "Marie Curie ganó 3 Premios Nobel",
                            "verdict": "false",
                            "truth": "Ganó 2 Premios Nobel (Física 1903, Química 1911)",
                            "sources": ["Nobel Prize official website", "Biografías académicas"]
                        },
                        {
                            "text": "Descubrió el radio y el polonio",
                            "verdict": "true",
                            "sources": ["Publicaciones científicas de 1898"]
                        },
                        {
                            "text": "Fue la primera mujer en enseñar en la Sorbona",
                            "verdict": "true",
                            "sources": ["Registros de la Universidad de París"]
                        }
                    ]
                }
            ],
            "verificationTools": [
                "Wikipedia (verificar consenso científico)",
                "Sitio oficial Premio Nobel",
                "Google Scholar (publicaciones académicas)",
                "Snopes (verificador de hechos)"
            ]
        }'::jsonb,
        '{"claimsVerified": 3, "accuracyRate": 0.9}'::jsonb,
        'intermediate', 100, 70,
        20, 3,
        ARRAY[
            'Verifica cifras específicas con fuentes oficiales',
            'Las afirmaciones extraordinarias requieren evidencia extraordinaria',
            'Compara múltiples fuentes confiables'
        ],
        30, 15,
        true
    );

    -- Exercise 4.2: Quiz TikTok Style
    INSERT INTO educational_content.exercises (
        module_id, title, subtitle, description, instructions,
        exercise_type, order_index,
        config, content, solution,
        difficulty_level, max_points, passing_score,
        estimated_time_minutes, max_attempts,
        hints, xp_reward, ml_coins_reward,
        is_active
    ) VALUES (
        mod_id,
        'Quiz TikTok: Datos Rápidos de Marie Curie',
        'Responde en 10 Segundos',
        'Preguntas rápidas estilo TikTok sobre Marie Curie. Tienes 10 segundos por pregunta. ¡Piensa rápido!',
        'Lee la pregunta y las opciones. Tienes 10 segundos para responder. Desliza para la siguiente pregunta.',
        'quiz_tiktok', 2,
        '{
            "timeLimit": 10,
            "swipeInterface": true,
            "quickFeedback": true,
            "sharable": true
        }'::jsonb,
        '{
            "questions": [
                {
                    "id": "q1",
                    "text": "¿En qué ciudad nació Marie Curie?",
                    "options": ["París", "Varsovia", "Berlín", "Londres"],
                    "correct": 1,
                    "timeLimit": 10,
                    "visual": "Map of Europe"
                },
                {
                    "id": "q2",
                    "text": "¿Cuántos Premios Nobel ganó Marie Curie?",
                    "options": ["1", "2", "3", "4"],
                    "correct": 1,
                    "timeLimit": 10,
                    "visual": "Nobel medal icons"
                },
                {
                    "id": "q3",
                    "text": "¿Qué elemento químico nombró por su país?",
                    "options": ["Radio", "Curio", "Polonio", "Francio"],
                    "correct": 2,
                    "timeLimit": 10,
                    "visual": "Periodic table"
                }
            ]
        }'::jsonb,
        '{"correctAnswers": [1, 1, 2], "totalQuestions": 3}'::jsonb,
        'easy', 100, 70,
        5, 5,
        ARRAY[
            'Marie Curie era polaca',
            'Fue la primera persona en ganar dos Nobeles',
            'Polonia se llama "Polska" en polaco'
        ],
        15, 8,
        true
    );

    -- Exercise 4.3: Navegación Hipertextual
    INSERT INTO educational_content.exercises (
        module_id, title, subtitle, description, instructions,
        exercise_type, order_index,
        config, content, solution,
        difficulty_level, max_points, passing_score,
        estimated_time_minutes, max_attempts,
        hints, xp_reward, ml_coins_reward,
        is_active
    ) VALUES (
        mod_id,
        'Navegación Hipertextual: Explora la Red de Conocimiento',
        'Sigue los Enlaces Relevantes',
        'Navega a través de un artículo web sobre Marie Curie. Sigue los hipervínculos correctos para encontrar información específica',
        'Lee la pregunta de investigación. Navega por el artículo haciendo clic en los enlaces relevantes. Encuentra la información solicitada.',
        'navegacion_hipertextual', 3,
        '{
            "hyperlinks": true,
            "pathTracking": true,
            "informationSynthesis": true
        }'::jsonb,
        '{
            "researchQuestion": "¿Qué experimentos realizó Marie Curie para aislar el radio?",
            "mainArticle": {
                "title": "Marie Curie: Pionera de la Radiactividad",
                "paragraphs": [
                    "Marie Curie revolucionó la ciencia con sus <link to=radiactividad>descubrimientos en radiactividad</link>...",
                    "Trabajó intensamente en el <link to=aislamiento>aislamiento de elementos radiactivos</link>..."
                ],
                "links": [
                    {
                        "text": "radiactividad",
                        "relevance": "high",
                        "leadsTo": "Historia de la radiactividad"
                    },
                    {
                        "text": "aislamiento",
                        "relevance": "very high",
                        "leadsTo": "Proceso de aislamiento del radio"
                    }
                ]
            },
            "optimalPath": ["mainArticle", "aislamiento", "proceso experimental"]
        }'::jsonb,
        '{"informationFound": true, "pathEfficiency": 0.8, "relevantLinks": 3}'::jsonb,
        'intermediate', 100, 70,
        15, 3,
        ARRAY[
            'Lee la pregunta antes de empezar a navegar',
            'No todos los enlaces son igualmente relevantes',
            'Sintetiza información de múltiples páginas'
        ],
        25, 12,
        true
    );

    -- Exercise 4.4: Análisis de Memes
    INSERT INTO educational_content.exercises (
        module_id, title, subtitle, description, instructions,
        exercise_type, order_index,
        config, content, solution,
        difficulty_level, max_points, passing_score,
        estimated_time_minutes, max_attempts,
        hints, xp_reward, ml_coins_reward,
        is_active
    ) VALUES (
        mod_id,
        'Análisis de Memes: Comprensión Visual-Textual',
        'Decodifica el Mensaje del Meme',
        'Analiza memes sobre Marie Curie. Identifica el mensaje, referencias culturales y humor implícito',
        'Observa cada meme cuidadosamente. Identifica: el formato utilizado, el mensaje principal, referencias culturales y por qué es gracioso.',
        'analisis_memes', 4,
        '{
            "visualAnalysis": true,
            "culturalReferences": true,
            "humorDecoding": true
        }'::jsonb,
        '{
            "memes": [
                {
                    "id": "meme1",
                    "imageUrl": "/memes/marie-curie-glowing.jpg",
                    "format": "Drake Hotline Bling",
                    "topText": "Protección contra radiación",
                    "bottomText": "Seguir experimentando sin protección",
                    "analysis": {
                        "mainMessage": "Marie Curie no usaba protección contra radiación",
                        "humorType": "Ironía histórica",
                        "culturalReference": "Formato de meme popular Drake",
                        "historicalAccuracy": "Alta - realmente no usaban protección adecuada",
                        "implication": "Contraste entre conocimiento actual y pasado"
                    }
                }
            ],
            "questions": [
                "¿Cuál es el mensaje principal del meme?",
                "¿Qué formato de meme se utiliza?",
                "¿Es históricamente exacto?",
                "¿Por qué es gracioso/irónico?"
            ]
        }'::jsonb,
        '{"messagesIdentified": 1, "referencesRecognized": 1, "accuracyEvaluated": true}'::jsonb,
        'intermediate', 100, 70,
        12, 3,
        ARRAY[
            'Los memes combinan imagen y texto para crear significado',
            'El humor a menudo viene de la ironía o el contraste',
            'Conocer el contexto histórico ayuda a entender el meme'
        ],
        20, 10,
        true
    );

    -- Exercise 4.5: Infografía Interactiva
    INSERT INTO educational_content.exercises (
        module_id, title, subtitle, description, instructions,
        exercise_type, order_index,
        config, content, solution,
        difficulty_level, max_points, passing_score,
        estimated_time_minutes, max_attempts,
        hints, xp_reward, ml_coins_reward,
        is_active
    ) VALUES (
        mod_id,
        'Infografía Interactiva: Descubrimientos de Marie Curie',
        'Extrae Información Visual',
        'Explora una infografía interactiva sobre los descubrimientos de Marie Curie. Responde preguntas basándote en la información visual',
        'Haz clic en las diferentes secciones de la infografía. Examina gráficos, iconos y datos. Responde las preguntas de comprensión.',
        'infografia_interactiva', 5,
        '{
            "interactiveElements": true,
            "dataVisualization": true,
            "clickableRegions": true
        }'::jsonb,
        '{
            "infographic": {
                "title": "Marie Curie: 150 Años de Legado Científico",
                "sections": [
                    {
                        "id": "timeline",
                        "type": "visual timeline",
                        "data": "1867-1934: Principales hitos de su vida"
                    },
                    {
                        "id": "discoveries",
                        "type": "icon grid",
                        "data": "Radio, Polonio, Radioactividad"
                    },
                    {
                        "id": "impact",
                        "type": "flowchart",
                        "data": "Sus descubrimientos → Medicina nuclear → Tratamientos de cáncer"
                    }
                ],
                "questions": [
                    {
                        "q": "¿Cuántos años vivió Marie Curie?",
                        "location": "timeline",
                        "answer": "67 años"
                    },
                    {
                        "q": "¿Qué aplicación médica surgió de sus descubrimientos?",
                        "location": "impact",
                        "answer": "Tratamientos de cáncer / Radioterapia"
                    }
                ]
            }
        }'::jsonb,
        '{"questionsAnswered": 2, "sectionsExplored": 3}'::jsonb,
        'intermediate', 100, 70,
        15, 3,
        ARRAY[
            'Explora cada sección de la infografía antes de responder',
            'Los íconos y colores tienen significado',
            'Lee las leyendas y etiquetas cuidadosamente'
        ],
        25, 12,
        true
    );

    -- Exercise 4.6: Email Formal
    INSERT INTO educational_content.exercises (
        module_id, title, subtitle, description, instructions,
        exercise_type, order_index,
        config, content, solution,
        difficulty_level, max_points, passing_score,
        estimated_time_minutes, max_attempts,
        hints, xp_reward, ml_coins_reward,
        is_active
    ) VALUES (
        mod_id,
        'Email Formal: Solicitud de Información Académica',
        'Redacta Comunicación Profesional',
        'Escribe un email formal solicitando información sobre archivos históricos de Marie Curie a una universidad',
        'Sigue la estructura de email formal: saludo, introducción, cuerpo con solicitud clara, cierre cortés, firma. Usa lenguaje profesional.',
        'call_to_action', 6,
        '{
            "structureGuide": true,
            "formalLanguage": true,
            "templateProvided": false,
            "rubricBased": true
        }'::jsonb,
        '{
            "prompt": "Eres un estudiante investigando sobre Marie Curie. Escribe un email a la Universidad de París solicitando acceso a documentos históricos de Marie Curie.",
            "context": "Necesitas: acceso a correspondencia personal, registros de laboratorio, y fotografías de su época en la Sorbona.",
            "requiredElements": [
                "Línea de asunto clara y profesional",
                "Saludo formal apropiado",
                "Presentación personal breve",
                "Explicación del propósito de la investigación",
                "Solicitud específica de documentos",
                "Agradecimiento anticipado",
                "Cierre formal",
                "Firma con datos de contacto"
            ],
            "rubric": {
                "formato": 20,
                "lenguaje": 25,
                "claridad": 25,
                "completitud": 20,
                "cortesía": 10
            }
        }'::jsonb,
        '{"requiredElementsPresent": 8, "formalTone": true}'::jsonb,
        'intermediate', 100, 70,
        20, 3,
        ARRAY[
            'Usa "Estimado/a" o "Distinguido/a" en el saludo',
            'Sé específico sobre qué documentos necesitas',
            'Explica brevemente por qué necesitas acceso'
        ],
        30, 15,
        true
    );

    -- Exercise 4.7: Chat Literario
    INSERT INTO educational_content.exercises (
        module_id, title, subtitle, description, instructions,
        exercise_type, order_index,
        config, content, solution,
        difficulty_level, max_points, passing_score,
        estimated_time_minutes, max_attempts,
        hints, xp_reward, ml_coins_reward,
        is_active
    ) VALUES (
        mod_id,
        'Chat Literario: Conversación con Marie Curie',
        'Simula una Conversación Histórica',
        'Participa en una conversación simulada por chat con Marie Curie. Responde de manera coherente y demuestra comprensión de su vida',
        'Lee cada mensaje de "Marie". Responde con preguntas relevantes o comentarios que demuestren tu conocimiento de su vida y obra.',
        'debate_digital', 7,
        '{
            "chatSimulation": true,
            "characterConsistency": true,
            "historicalAccuracy": true
        }'::jsonb,
        '{
            "chatLog": [
                {
                    "from": "Marie Curie",
                    "message": "Hola, soy Marie Curie. Acabo de llegar a París para estudiar en la Sorbona. Es muy diferente a Varsovia...",
                    "timestamp": "1891-11-03",
                    "expectedResponse": {
                        "themes": ["interés por sus estudios", "adaptación cultural", "motivación científica"],
                        "inappropriateTopics": ["premios Nobel (aún no ganados)", "descubrimientos futuros"]
                    }
                },
                {
                    "from": "Student",
                    "possibleResponses": [
                        "¿Qué es lo más difícil de adaptarte a París?",
                        "¿Qué estudios planeas realizar en la Sorbona?",
                        "¿Extrañas tu familia en Polonia?"
                    ]
                },
                {
                    "from": "Marie Curie",
                    "message": "La física y las matemáticas me apasionan. Planeo estudiar ambas disciplinas intensivamente.",
                    "timestamp": "1891-11-03"
                }
            ],
            "evaluationCriteria": {
                "coherenciaHistórica": 30,
                "relevancia": 25,
                "profundidad": 25,
                "naturalidad": 20
            }
        }'::jsonb,
        '{"responsesCoherent": true, "historicallyAccurate": true, "engagingConversation": true}'::jsonb,
        'intermediate', 100, 70,
        15, 3,
        ARRAY[
            'Mantén coherencia con la época de cada mensaje',
            'No menciones eventos que aún no han ocurrido',
            'Haz preguntas que demuestren interés genuino'
        ],
        25, 12,
        true
    );

    -- Exercise 4.8: Ensayo Argumentativo
    INSERT INTO educational_content.exercises (
        module_id, title, subtitle, description, instructions,
        exercise_type, order_index,
        config, content, solution,
        difficulty_level, max_points, passing_score,
        estimated_time_minutes, max_attempts,
        hints, xp_reward, ml_coins_reward,
        is_active
    ) VALUES (
        mod_id,
        'Ensayo Argumentativo: El Legado de Marie Curie',
        'Escribe un Ensayo Estructurado',
        'Escribe un ensayo argumentativo sobre la importancia del legado de Marie Curie en la ciencia moderna',
        'Estructura tu ensayo en: introducción con tesis, 3 párrafos de desarrollo con argumentos y evidencias, conclusión. Usa conectores lógicos.',
        'podcast_argumentativo', 8,
        '{
            "structureRequired": true,
            "citationRequired": false,
            "wordCount": {"min": 400, "max": 600},
            "rubricEvaluation": true
        }'::jsonb,
        '{
            "prompt": "Argumenta: ¿Por qué Marie Curie es considerada una de las científicas más importantes de la historia?",
            "guidelines": [
                "Introduce tu tesis claramente en el primer párrafo",
                "Presenta al menos 3 argumentos principales",
                "Apoya cada argumento con ejemplos específicos",
                "Usa conectores: por lo tanto, además, en consecuencia, sin embargo",
                "Concluye resumiendo y reforzando tu tesis"
            ],
            "suggestedThemes": [
                "Descubrimientos científicos revolucionarios",
                "Pionera para mujeres en ciencia",
                "Impacto en medicina moderna",
                "Modelo de perseverancia y dedicación"
            ],
            "rubric": {
                "tesis": 15,
                "argumentos": 30,
                "evidencias": 25,
                "estructura": 15,
                "lenguaje": 15
            }
        }'::jsonb,
        '{"tesisClara": true, "argumentos": 3, "estructura": true}'::jsonb,
        'advanced', 100, 70,
        30, 2,
        ARRAY[
            'Tu tesis debe ser una afirmación clara y debatible',
            'Cada párrafo de desarrollo debe tener una idea principal',
            'Usa ejemplos concretos de la vida de Marie Curie'
        ],
        40, 20,
        true
    );

    -- Exercise 4.9: Reseña Crítica
    INSERT INTO educational_content.exercises (
        module_id, title, subtitle, description, instructions,
        exercise_type, order_index,
        config, content, solution,
        difficulty_level, max_points, passing_score,
        estimated_time_minutes, max_attempts,
        hints, xp_reward, ml_coins_reward,
        is_active
    ) VALUES (
        mod_id,
        'Reseña Crítica: Biografía de Marie Curie',
        'Evalúa y Critica una Obra',
        'Escribe una reseña crítica de una biografía sobre Marie Curie, evaluando su calidad, exactitud y valor educativo',
        'Lee el fragmento de la biografía. Evalúa: exactitud histórica, estilo de escritura, profundidad del análisis, sesgo del autor. Escribe tu reseña.',
        'analisis_fuentes', 9,
        '{
            "criticalAnalysis": true,
            "evaluationCriteria": true,
            "balancedReview": true
        }'::jsonb,
        '{
            "bookExcerpt": {
                "title": "Marie Curie: Una Vida Dedicada a la Ciencia",
                "author": "Dra. Susan Quinn",
                "year": 1995,
                "excerpt": "Marie Sklodowska llegó a París en 1891 con determinación férrea y recursos limitados. Su dedicación al estudio era tal que a menudo olvidaba comer..."
            },
            "reviewStructure": {
                "resumen": "Breve descripción de la obra (50-75 palabras)",
                "fortalezas": "Aspectos positivos bien argumentados",
                "debilidades": "Áreas de mejora o limitaciones",
                "evaluacion": "Valoración general con justificación",
                "recomendacion": "A quién recomendarías este libro"
            },
            "evaluationAspects": [
                "Exactitud histórica",
                "Estilo de escritura",
                "Profundidad del análisis",
                "Objetividad del autor",
                "Valor educativo"
            ],
            "rubric": {
                "resumen": 15,
                "analisisCritico": 35,
                "equilibrio": 20,
                "argumentacion": 20,
                "recomendacion": 10
            }
        }'::jsonb,
        '{"fortalezasIdentificadas": 2, "debilidadesIdentificadas": 2, "recomendacionFundamentada": true}'::jsonb,
        'advanced', 100, 70,
        25, 2,
        ARRAY[
            'Una buena reseña es equilibrada: menciona fortalezas Y debilidades',
            'Fundamenta tus opiniones con ejemplos del texto',
            'Sé específico: no digas solo "es bueno", explica POR QUÉ'
        ],
        35, 18,
        true
    );

    RAISE NOTICE '✓ Module 4 (Textos Digitales) created with 9 exercises';
END $$;
END $$;
