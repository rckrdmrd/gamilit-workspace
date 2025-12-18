-- =====================================================
-- Seed Data: Exercises Module 4 - Lectura Digital y Multimodal (PRODUCTION)
-- =====================================================
-- Description: 5 ejercicios oficiales del Módulo 4 (según DocumentoDeDiseño v6.4)
-- Module: MOD-04-DIGITAL
-- Exercises:
--   4.1 Verificador Fake News
--   4.2 Infografía Interactiva
--   4.3 Quiz TikTok
--   4.4 Navegación Hipertextual
--   4.5 Análisis Memes
-- Reference: DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md líneas 782-965
-- Date: 2025-12-18 (Limpieza: eliminados 4 ejercicios no oficiales)
-- Status: PRODUCTION (ACTIVOS - is_active = true)
-- NOTA: Ejercicios 4.6-4.9 (resena_critica, chat_literario, email_formal,
--       ensayo_argumentativo) fueron eliminados por no estar en el documento de diseño
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

    -- ========================================================================
    -- EXERCISE 4.1: VERIFICADOR DE FAKE NEWS
    -- Referencia: DocumentoDeDiseño v6.4 líneas 778-818
    -- ========================================================================
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
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        description = EXCLUDED.description,
        instructions = EXCLUDED.instructions,
        config = EXCLUDED.config,
        content = EXCLUDED.content,
        solution = EXCLUDED.solution,
        hints = EXCLUDED.hints,
        is_active = EXCLUDED.is_active,
        updated_at = gamilit.now_mexico();

    -- ========================================================================
    -- EXERCISE 4.2: INFOGRAFÍA INTERACTIVA
    -- Referencia: DocumentoDeDiseño v6.4 líneas 820-867
    -- ========================================================================
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
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        description = EXCLUDED.description,
        instructions = EXCLUDED.instructions,
        config = EXCLUDED.config,
        content = EXCLUDED.content,
        solution = EXCLUDED.solution,
        hints = EXCLUDED.hints,
        is_active = EXCLUDED.is_active,
        updated_at = gamilit.now_mexico();

    -- ========================================================================
    -- EXERCISE 4.3: QUIZ ESTILO TIKTOK
    -- Referencia: DocumentoDeDiseño v6.4 líneas 869-892
    -- ========================================================================
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
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        description = EXCLUDED.description,
        instructions = EXCLUDED.instructions,
        config = EXCLUDED.config,
        content = EXCLUDED.content,
        solution = EXCLUDED.solution,
        hints = EXCLUDED.hints,
        is_active = EXCLUDED.is_active,
        updated_at = gamilit.now_mexico();

    -- ========================================================================
    -- EXERCISE 4.4: NAVEGACIÓN HIPERTEXTUAL
    -- Referencia: DocumentoDeDiseño v6.4 líneas 894-917
    -- Estructura: nodes[] con id, title, content, links[{targetId, label}]
    -- ========================================================================
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
            "nodes": [
                {
                    "id": "main-article",
                    "title": "Marie Curie: Pionera de la Radiactividad",
                    "content": "Marie Curie (1867-1934) fue una científica polaca-francesa que revolucionó nuestra comprensión de la física y la química. Junto con su esposo Pierre, realizó investigaciones pioneras sobre los fenómenos radiactivos, un término que ella misma acuñó.\n\nSus descubrimientos en radiactividad cambiaron para siempre el campo de la física nuclear. Trabajó intensamente durante años en el aislamiento de elementos radiactivos, un proceso que requirió una dedicación extraordinaria.",
                    "links": [
                        { "targetId": "radiactividad", "label": "descubrimientos en radiactividad" },
                        { "targetId": "aislamiento", "label": "aislamiento de elementos radiactivos" },
                        { "targetId": "premios", "label": "reconocimientos y premios" }
                    ]
                },
                {
                    "id": "radiactividad",
                    "title": "Historia de la Radiactividad",
                    "content": "El término ''radiactividad'' fue acuñado por Marie Curie en 1898. Henri Becquerel había descubierto en 1896 que las sales de uranio emitían rayos que podían impresionar placas fotográficas.\n\nMarie Curie decidió estudiar este fenómeno como tema de su tesis doctoral. Descubrió que la radiactividad era una propiedad atómica, no molecular, lo que fue revolucionario para la física de la época.",
                    "links": [
                        { "targetId": "main-article", "label": "volver al artículo principal" },
                        { "targetId": "aislamiento", "label": "proceso de aislamiento" }
                    ]
                },
                {
                    "id": "aislamiento",
                    "title": "El Proceso de Aislamiento del Radio",
                    "content": "El aislamiento del radio fue uno de los logros más impresionantes de Marie Curie. Trabajando en condiciones precarias en un cobertizo sin calefacción, procesó toneladas de pechblenda para obtener pequeñas cantidades de radio puro.\n\nEl proceso requirió:\n• Trituración de toneladas de mineral de pechblenda\n• Disolución en ácidos y precipitación química\n• Cristalización fraccionada repetida durante años\n• Mediciones precisas de radiactividad\n\nEn 1902, logró aislar 0.1 gramos de cloruro de radio puro.",
                    "links": [
                        { "targetId": "main-article", "label": "volver al artículo principal" },
                        { "targetId": "experimentos", "label": "experimentos específicos" },
                        { "targetId": "radiactividad", "label": "qué es la radiactividad" }
                    ]
                },
                {
                    "id": "experimentos",
                    "title": "Experimentos de Marie Curie con el Radio",
                    "content": "Los experimentos de Marie Curie para aislar el radio fueron meticulosos y agotadores:\n\n1. **Análisis de la pechblenda**: Descubrió que era más radiactiva de lo esperado, lo que sugería la presencia de elementos desconocidos.\n\n2. **Separación química**: Usó técnicas de precipitación selectiva para separar diferentes fracciones del mineral.\n\n3. **Cristalización fraccionada**: El proceso más largo. Disolvía cloruros y los cristalizaba repetidamente, separando el radio del bario por sus diferentes solubilidades.\n\n4. **Medición con electrómetro**: Usó un electrómetro piezoeléctrico diseñado por Pierre para medir la radiactividad y seguir el rastro del radio.\n\n¡Este es el objetivo de tu investigación! Has encontrado la información sobre los experimentos.",
                    "links": [
                        { "targetId": "aislamiento", "label": "volver a aislamiento" },
                        { "targetId": "premios", "label": "premios recibidos" }
                    ]
                },
                {
                    "id": "premios",
                    "title": "Premios y Reconocimientos",
                    "content": "Marie Curie recibió numerosos reconocimientos por su trabajo:\n\n• **Premio Nobel de Física (1903)**: Compartido con Pierre Curie y Henri Becquerel por sus investigaciones sobre radiación.\n\n• **Premio Nobel de Química (1911)**: Por el descubrimiento del radio y polonio, y por el aislamiento del radio.\n\nFue la primera persona en ganar dos Premios Nobel en diferentes ciencias.",
                    "links": [
                        { "targetId": "main-article", "label": "volver al artículo principal" },
                        { "targetId": "aislamiento", "label": "proceso de aislamiento" }
                    ]
                }
            ],
            "startNodeId": "main-article",
            "targetNodeId": "experimentos",
            "optimalPath": ["main-article", "aislamiento", "experimentos"]
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
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        description = EXCLUDED.description,
        instructions = EXCLUDED.instructions,
        config = EXCLUDED.config,
        content = EXCLUDED.content,
        solution = EXCLUDED.solution,
        hints = EXCLUDED.hints,
        is_active = EXCLUDED.is_active,
        updated_at = gamilit.now_mexico();

    -- ========================================================================
    -- EXERCISE 4.5: ANÁLISIS DE MEMES EDUCATIVOS
    -- Referencia: DocumentoDeDiseño v6.4 líneas 919-947
    -- ========================================================================
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
        100, 20,
        true
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        description = EXCLUDED.description,
        instructions = EXCLUDED.instructions,
        config = EXCLUDED.config,
        content = EXCLUDED.content,
        solution = EXCLUDED.solution,
        hints = EXCLUDED.hints,
        is_active = EXCLUDED.is_active,
        updated_at = gamilit.now_mexico();

    RAISE NOTICE '✓ 5 ejercicios del Módulo 4 insertados (según DocumentoDeDiseño v6.4)';
END $$;
