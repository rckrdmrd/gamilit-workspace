-- =====================================================
-- Seed Data: Exercises Module 4 - Textos Digitales (PRODUCTION)
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
        'Verificador de Fake News',
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
        100, 20,
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
        'quiz_tiktok', 3,
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
        'elementary', 100, 70,
        5, 5,
        ARRAY[
            'Marie Curie era polaca',
            'Fue la primera persona en ganar dos Nobeles',
            'Polonia se llama "Polska" en polaco'
        ],
        100, 20,
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
        'navegacion_hipertextual', 4,
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
        100, 20,
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
        'analisis_memes', 5,
        '{
            "visualAnalysis": true,
            "culturalReferences": true,
            "humorDecoding": true
        }'::jsonb,
        '{
            "memes": [
                {
                    "id": "meme1",
                    "imageUrl": "/memes/marie-curie-glowing.svg",
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
                },
                {
                    "id": "meme2",
                    "imageUrl": "/memes/expanding-brain-curie.svg",
                    "format": "Expanding Brain",
                    "topText": "Niveles de conocimiento sobre Marie Curie",
                    "analysis": {
                        "mainMessage": "El conocimiento sobre Curie tiene muchos niveles de profundidad",
                        "humorType": "Progresión cómica",
                        "culturalReference": "Meme Expanding Brain con 4 niveles",
                        "historicalAccuracy": "Alta - todos los datos son verificables",
                        "implication": "Mientras más sabes, más fascinante es su historia"
                    }
                },
                {
                    "id": "meme3",
                    "imageUrl": "/memes/distracted-curie.svg",
                    "format": "Distracted Boyfriend",
                    "topText": "Marie Curie distraída por Radio",
                    "bottomText": "Ignorando la Física Teórica",
                    "analysis": {
                        "mainMessage": "Curie abandonó la física pura por la investigación de elementos radioactivos",
                        "humorType": "Analogía visual",
                        "culturalReference": "Meme Distracted Boyfriend adaptado a ciencia",
                        "historicalAccuracy": "Media - simplificación de su carrera",
                        "implication": "La pasión por descubrir nuevos elementos dominó su investigación"
                    }
                },
                {
                    "id": "meme4",
                    "imageUrl": "/memes/change-my-mind-curie.svg",
                    "format": "Change My Mind",
                    "topText": "Marie Curie es la científica más influyente de la historia",
                    "analysis": {
                        "mainMessage": "Debate sobre la importancia de Marie Curie en la ciencia",
                        "humorType": "Desafío retórico",
                        "culturalReference": "Meme Change My Mind de Steven Crowder",
                        "historicalAccuracy": "Subjetiva - opinión debatible pero bien fundamentada",
                        "implication": "Invita a reflexionar sobre el impacto real de sus contribuciones"
                    }
                },
                {
                    "id": "meme5",
                    "imageUrl": "/memes/one-does-not-simply-curie.svg",
                    "format": "One Does Not Simply",
                    "topText": "No se puede simplemente ignorar la radioactividad",
                    "analysis": {
                        "mainMessage": "La radioactividad es un fenómeno que no se puede ignorar una vez descubierto",
                        "humorType": "Dramatización",
                        "culturalReference": "Meme de Boromir (El Señor de los Anillos)",
                        "historicalAccuracy": "Alta - la radioactividad transformó la ciencia moderna",
                        "implication": "El descubrimiento de Curie cambió permanentemente la ciencia y la medicina"
                    }
                },
                {
                    "id": "meme6",
                    "imageUrl": "/memes/this-is-fine-curie.svg",
                    "format": "This Is Fine",
                    "topText": "Marie Curie en su laboratorio rodeada de materiales radioactivos",
                    "analysis": {
                        "mainMessage": "Curie trabajaba con materiales peligrosos sin consciencia del riesgo",
                        "humorType": "Humor negro / ironía situacional",
                        "culturalReference": "Meme del perro en el fuego (KC Green)",
                        "historicalAccuracy": "Alta - trabajaba sin protección en un laboratorio contaminado",
                        "implication": "Reflexión sobre los riesgos que asumen los científicos pioneros"
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
        '{"messagesIdentified": 6, "referencesRecognized": 6, "accuracyEvaluated": true}'::jsonb,
        'intermediate', 100, 70,
        12, 3,
        ARRAY[
            'Los memes combinan imagen y texto para crear significado',
            'El humor a menudo viene de la ironía o el contraste',
            'Conocer el contexto histórico ayuda a entender el meme'
        ],
        100, 20,
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
        'infografia_interactiva', 2,
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
        100, 20,
        true
    );

    RAISE NOTICE '✓ Module 4 (Textos Digitales) created with 5 exercises';
END $$;
END $$;
