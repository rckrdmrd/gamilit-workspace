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
        objective, how_to_solve, recommended_strategy, pedagogical_notes,
        exercise_type, order_index,
        config, content, solution,
        difficulty_level, max_points, passing_score,
        estimated_time_minutes, max_attempts,
        hints, xp_reward, ml_coins_reward,
        is_active, requires_manual_grading
    ) VALUES (
        mod_id,
        'Verificador de Fake News',
        'Distingue Hechos de Ficción',
        'Analiza artículos sobre Marie Curie publicados en internet. Identifica afirmaciones falsas y verifica información con fuentes confiables',
        'Lee cada artículo. Selecciona las afirmaciones que te parecen sospechosas. Usa las herramientas de verificación para comprobar los hechos.',

        -- objective (DB-125: Pedagogical Content)
        E'Desarrollar competencia de verificación de hechos (fact-checking) mediante el análisis crítico de artículos en línea sobre Marie Curie. Este ejercicio entrena habilidades esenciales de alfabetización digital: distinguir entre información verificada y desinformación, identificar afirmaciones falsas o exageradas, y usar herramientas de verificación confiables.\n\nLos estudiantes aprenderán a:\n- Identificar señales de alerta en artículos de internet (afirmaciones sin fuentes, cifras sospechosas)\n- Usar herramientas de fact-checking profesionales (Nobel.org, Google Scholar, Snopes)\n- Contrastar afirmaciones con fuentes primarias verificables\n- Evaluar la confiabilidad de diferentes tipos de fuentes online\n- Desarrollar escepticismo saludable ante información digital sin caer en desconfianza total',

        -- how_to_solve (DB-125)
        E'Metodología de verificación paso a paso:\n\n1. LECTURA INICIAL (3-5 min):\n   - Leer el artículo completo sin juzgar todavía\n   - Identificar las afirmaciones principales (claims) que hace el texto\n   - Anotar mentalmente cifras específicas, fechas, o declaraciones extraordinarias\n\n2. DETECCIÓN DE CLAIMS SOSPECHOSOS:\n   - Buscar afirmaciones con números específicos (ej: "3 Premios Nobel")\n   - Identificar declaraciones absolutas ("siempre", "nunca", "el único")\n   - Marcar claims que parezcan demasiado buenos para ser verdad\n\n3. VERIFICACIÓN CON HERRAMIENTAS:\n   - Usar sitio oficial del Premio Nobel para verificar premios\n   - Consultar Wikipedia para verificar consenso científico\n   - Usar Google Scholar para publicaciones académicas\n   - Revisar Snopes para verificación de hechos virales\n\n4. EVALUACIÓN FINAL:\n   - Clasificar cada claim como: Verdadero, Falso, o Parcialmente verdadero\n   - Documentar la fuente que usaste para verificar\n   - Reflexionar sobre por qué el claim falso podría haberse difundido',

        -- recommended_strategy (DB-125)
        E'Estrategias de verificación eficiente:\n\n- VERIFICAR CIFRAS PRIMERO: Los números específicos (premios, fechas, cantidades) son fáciles de verificar y frecuentemente exagerados\n- REGLA DEL 3: Si 3 fuentes independientes confirman un hecho, probablemente es verdadero\n- FUENTES OFICIALES: Nobel.org, universidades, instituciones científicas son más confiables que blogs\n- BUSCAR LA FUENTE ORIGINAL: ¿De dónde salió la información? Traza el claim hasta su origen\n- DESCONFIAR DE SENSACIONALISMO: Títulos clickbait suelen indicar información distorsionada\n- USAR BÚSQUEDA INVERSA: Si algo parece falso, busca "[claim] + fake" o "[claim] + fact check"',

        -- pedagogical_notes (DB-125)
        E'Este ejercicio desarrolla alfabetización mediática digital, competencia crítica del siglo XXI. Se alinea con el Nivel 4 de Cassany (Comprensión de Textos Digitales) al requerir navegación, evaluación y síntesis de múltiples fuentes online.\n\nHabilidades del siglo XXI desarrolladas:\n- Pensamiento crítico aplicado a medios digitales\n- Uso de herramientas de verificación profesionales\n- Evaluación de confiabilidad de fuentes online\n- Resistencia a desinformación y fake news\n\nDificultad: Intermedia (CEFR: B1-B2). Requiere evaluación manual porque las justificaciones del estudiante sobre por qué un claim es falso son tan importantes como identificar el claim.\n\nRelevancia contemporánea: En la era de redes sociales, la capacidad de distinguir información verificada de desinformación es fundamental para ciudadanía informada. Este ejercicio simula el trabajo de periodistas de fact-checking.',

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
        true, true  -- Requiere evaluación manual del maestro
    );

    -- Exercise 4.2: Quiz TikTok Style
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
        'Quiz TikTok: Datos Rápidos de Marie Curie',
        'Responde en 30 Segundos',
        'Preguntas rápidas estilo TikTok sobre Marie Curie. Tienes 30 segundos por pregunta. ¡Piensa rápido!',
        'Lee la pregunta y las opciones. Tienes 30 segundos para responder. Desliza para la siguiente pregunta.',

        -- objective (DB-125: Pedagogical Content)
        E'Evaluar comprensión rápida de datos biográficos clave sobre Marie Curie mediante formato de quiz interactivo estilo redes sociales. Este ejercicio simula la experiencia de consumo de contenido educativo en plataformas como TikTok, Instagram Reels o YouTube Shorts, donde la información se presenta de forma breve y dinámica.\n\nLos estudiantes practicarán:\n- Recuperación rápida de información memorizada (recall bajo presión de tiempo)\n- Toma de decisiones ágil con información limitada\n- Comprensión de formatos de contenido educativo moderno\n- Validación de conocimientos previos sobre Marie Curie',

        -- how_to_solve (DB-125)
        E'Estrategia para quizzes con límite de tiempo:\n\n1. ANTES DE EMPEZAR:\n   - Recuerda los datos básicos de Marie Curie: Polonia (nacimiento), 2 Nobel, radio y polonio (descubrimientos)\n   - El quiz tiene 30 segundos por pregunta - no hay tiempo para pensar mucho\n\n2. DURANTE CADA PREGUNTA:\n   - Lee pregunta y opciones RÁPIDO (3 segundos)\n   - Identifica la respuesta que "suena correcta" (4 segundos)\n   - Confirma y selecciona (3 segundos)\n   - NO dudes - tu primera intuición suele ser correcta\n\n3. CUANDO NO SABES:\n   - Descarta opciones obviamente incorrectas\n   - Elige entre las restantes - mejor adivinar que no responder\n   - Aprende de cada error para la siguiente ronda',

        -- recommended_strategy (DB-125)
        E'Tips para quizzes rápidos:\n\n- CONFÍA EN TU PRIMERA RESPUESTA: En quizzes con tiempo, cambiar de opinión suele empeorar el resultado\n- DATOS CLAVE MEMORIZADOS: Varsovia (ciudad natal), 2 Nobel, Polonio (nombrado por Polonia)\n- DESCARTA ANTES DE ELEGIR: Elimina opciones absurdas para reducir opciones de 4 a 2\n- RITMO CONSTANTE: No te detengas en preguntas difíciles - sigue adelante\n- PRACTICA VELOCIDAD: Cuanto más practiques, más rápido recuperarás información',

        -- pedagogical_notes (DB-125)
        E'Este ejercicio combina evaluación de conocimientos con formato de contenido digital nativo. Se alinea con el Nivel 4 de Cassany (Textos Digitales) al usar interfaces y dinámicas de redes sociales educativas.\n\nPedagogía adaptada a nativos digitales:\n- Formato familiar (TikTok style) reduce ansiedad de evaluación\n- Gamificación natural con tiempo límite y feedback inmediato\n- Microlearning: evaluación de datos puntuales vs comprensión profunda\n- Engagement alto por velocidad y dinamismo\n\nDificultad: Elemental (CEFR: A2). Auto-evaluable con respuestas correctas predefinidas. Ideal como actividad de calentamiento o repaso rápido antes de ejercicios más complejos.\n\nNota técnica: El formato swipe y tiempo límite simulan la experiencia real de contenido educativo en redes sociales, preparando estudiantes para consumir y crear este tipo de contenido.',

        'quiz_tiktok', 3,
        '{
            "timeLimit": 30,
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
                    "timeLimit": 30,
                    "visual": "Map of Europe"
                },
                {
                    "id": "q2",
                    "text": "¿Cuántos Premios Nobel ganó Marie Curie?",
                    "options": ["1", "2", "3", "4"],
                    "correct": 1,
                    "timeLimit": 30,
                    "visual": "Nobel medal icons"
                },
                {
                    "id": "q3",
                    "text": "¿Qué elemento químico nombró por su país?",
                    "options": ["Radio", "Curio", "Polonio", "Francio"],
                    "correct": 2,
                    "timeLimit": 30,
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
        true, true  -- MANUAL-GRADING: Requiere justificacion por pregunta, evaluado por maestro
    );

    -- Exercise 4.3: Navegación Hipertextual
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
        'Navegación Hipertextual: Explora la Red de Conocimiento',
        'Sigue los Enlaces Relevantes',
        'Navega a través de un artículo web sobre Marie Curie. Sigue los hipervínculos correctos para encontrar información específica',
        'Lee la pregunta de investigación. Navega por el artículo haciendo clic en los enlaces relevantes. Encuentra la información solicitada.',

        -- objective (DB-125: Pedagogical Content)
        E'Desarrollar habilidades de navegación hipertextual mediante la exploración dirigida de artículos web interconectados sobre Marie Curie. Este ejercicio entrena la capacidad de moverse eficientemente a través de estructuras de información no-lineales, habilidad fundamental para la investigación en entornos digitales.\n\nLos estudiantes aprenderán a:\n- Evaluar relevancia de hipervínculos antes de hacer clic\n- Mantener enfoque en objetivo de investigación mientras navegan\n- Construir caminos eficientes de navegación (evitar "rabbit holes")\n- Sintetizar información de múltiples páginas conectadas\n- Reconocer estructuras de información web (artículos, wikis, bases de datos)',

        -- how_to_solve (DB-125)
        E'Metodología de navegación hipertextual eficiente:\n\n1. DEFINIR OBJETIVO (antes de navegar):\n   - Leer claramente la pregunta de investigación\n   - Identificar palabras clave: "experimentos", "aislar", "radio"\n   - Formular mentalmente qué tipo de información buscas\n\n2. ESCANEO INICIAL:\n   - Leer párrafos superficialmente buscando términos relacionados\n   - Identificar hipervínculos (texto subrayado o de color diferente)\n   - NO hacer clic todavía - primero evalúa\n\n3. EVALUACIÓN DE ENLACES:\n   - ¿El texto del enlace sugiere relevancia para tu pregunta?\n   - Relevancia "very high" = clic inmediato\n   - Relevancia "medium/low" = marcar para después\n\n4. NAVEGACIÓN ESTRATÉGICA:\n   - Seguir camino de mayor relevancia primero\n   - Tomar notas mentales de información encontrada\n   - Volver atrás si el camino no es productivo\n\n5. SÍNTESIS FINAL:\n   - Combinar información de diferentes páginas visitadas\n   - Formular respuesta completa a la pregunta original',

        -- recommended_strategy (DB-125)
        E'Estrategias para navegación hipertextual eficiente:\n\n- LEER ANTES DE CLICKEAR: El texto del enlace indica adónde lleva - evalúa relevancia primero\n- CAMINO ÓPTIMO: Busca la ruta más directa a la información (menos clics = más eficiente)\n- EVITAR RABBIT HOLES: Es fácil perderse siguiendo enlaces interesantes pero no relevantes\n- BREADCRUMBS MENTALES: Recuerda por dónde navegaste para poder volver\n- SÍNTESIS ACTIVA: No solo encuentres información - intégrala mientras navegas\n- TIEMPO LIMITADO: Asigna máximo 2 minutos por página antes de decidir si seguir o volver',

        -- pedagogical_notes (DB-125)
        E'Este ejercicio desarrolla competencia de navegación digital, habilidad central del Nivel 4 de Cassany (Textos Digitales). La lectura hipertextual difiere fundamentalmente de la lectura lineal tradicional.\n\nHabilidades de navegación web desarrolladas:\n- Lectura no-lineal y escaneo estratégico\n- Evaluación de relevancia de enlaces\n- Construcción de caminos de navegación eficientes\n- Síntesis de información distribuida\n- Metacognición sobre comportamiento de búsqueda\n\nDificultad: Intermedia (CEFR: B1). Requiere evaluación manual porque la calidad del camino de navegación (eficiencia, relevancia de clics) es tan importante como encontrar la respuesta.\n\nCompetencia transferible: Estas habilidades son directamente aplicables a investigación académica en bases de datos, Wikipedia, sitios de referencia, y cualquier entorno web de información estructurada.',

        'navegacion_hipertextual', 4,
        '{
            "hyperlinks": true,
            "pathTracking": true,
            "informationSynthesis": true
        }'::jsonb,
        '{
            "researchQuestion": "Como influyeron los descubrimientos de Marie Curie en la ciencia moderna?",
            "startNodeId": "marie-intro",
            "targetNodeId": "marie-legado",
            "nodes": [
                {"id": "marie-intro", "title": "Marie Curie: Una Vida de Ciencia", "content": "Marie Curie (1867-1934) fue una fisica y quimica polaca nacionalizada francesa. Pionera en el campo de la radiactividad, fue la primera persona en recibir dos premios Nobel en distintas especialidades: Fisica y Quimica.", "links": [{"label": "Infancia y Educacion", "targetId": "marie-infancia"}, {"label": "Sus estudios en Paris", "targetId": "marie-paris"}]},
                {"id": "marie-infancia", "title": "Infancia en Varsovia", "content": "Nacida como Maria Salomea Sklodowska en Varsovia, en lo que entonces era el Reino de Polonia. A pesar de las dificultades economicas y politicas, mostro una gran pasion por el aprendizaje desde joven.", "links": [{"label": "Volver al inicio", "targetId": "marie-intro"}, {"label": "Viaje a Paris", "targetId": "marie-paris"}]},
                {"id": "marie-paris", "title": "Estudios en la Sorbona", "content": "En 1891, a los 24 anos, se matriculo en la Universidad de Paris donde obtuvo sus licenciaturas en Fisica y Matematicas. Fue en Paris donde conocio a Pierre Curie.", "links": [{"label": "Antecedentes", "targetId": "marie-infancia"}, {"label": "Investigacion sobre Radiactividad", "targetId": "marie-descubrimientos"}]},
                {"id": "marie-descubrimientos", "title": "El Descubrimiento del Radio y el Polonio", "content": "Junto a Pierre Curie, Marie investigo materiales radiactivos. En 1898 anunciaron el descubrimiento de dos nuevos elementos: el polonio y el radio. Acuno el termino radiactividad.", "links": [{"label": "Regresar a sus estudios", "targetId": "marie-paris"}, {"label": "Reconocimientos y Premios", "targetId": "marie-legado"}]},
                {"id": "marie-legado", "title": "Premios Nobel y Legado", "content": "En 1903 recibio el Premio Nobel de Fisica y en 1911 el de Quimica en solitario. Sus investigaciones sentaron las bases para los rayos X y la radioterapia.", "links": [{"label": "Inicio", "targetId": "marie-intro"}, {"label": "Repasar descubrimientos", "targetId": "marie-descubrimientos"}]}
            ]
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
        true, true  -- Requiere evaluación manual del maestro
    );

    -- Exercise 4.4: Análisis de Memes
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
        'Análisis de Memes: Comprensión Visual-Textual',
        'Decodifica el Mensaje del Meme',
        'Analiza memes sobre Marie Curie. Identifica el mensaje, referencias culturales y humor implícito',
        'Observa cada meme cuidadosamente. Identifica: el formato utilizado, el mensaje principal, referencias culturales y por qué es gracioso.',

        -- objective (DB-125: Pedagogical Content)
        E'Desarrollar competencia de análisis de textos multimodales mediante la decodificación de memes sobre Marie Curie. Los memes son una forma dominante de comunicación digital que combina imagen y texto para crear significado a través de intertextualidad, ironía y referencias culturales compartidas.\n\nLos estudiantes aprenderán a:\n- Reconocer formatos de memes populares (Drake, Distracted Boyfriend, etc.)\n- Decodificar mensajes implícitos que combinan visual + texto\n- Identificar ironía, humor y referencias culturales en contenido viral\n- Evaluar precisión histórica/factual de memes educativos\n- Comprender cómo los memes transmiten ideas complejas de forma condensada',

        -- how_to_solve (DB-125)
        E'Metodología de análisis de memes paso a paso:\n\n1. IDENTIFICAR FORMATO (15 segundos):\n   - ¿Qué template de meme es? (Drake, Expanding Brain, etc.)\n   - ¿Cuál es la estructura del formato? (comparación, progresión, ironía)\n   - El formato mismo ya comunica algo\n\n2. LEER TEXTO Y VISUAL:\n   - ¿Qué dice el texto superior e inferior?\n   - ¿Qué muestra la imagen?\n   - ¿Cómo interactúan texto e imagen?\n\n3. DECODIFICAR MENSAJE PRINCIPAL:\n   - ¿Cuál es la idea central que comunica el meme?\n   - ¿Hay ironía? (decir lo opuesto de lo que se significa)\n   - ¿Hay crítica implícita o celebración?\n\n4. IDENTIFICAR REFERENCIAS CULTURALES:\n   - ¿Qué conocimiento previo necesitas para entender el meme?\n   - ¿Referencia algo específico de Marie Curie?\n   - ¿Usa humor de época o contemporáneo?\n\n5. EVALUAR PRECISIÓN HISTÓRICA:\n   - ¿El meme es históricamente exacto?\n   - ¿Exagera o distorsiona hechos para efectos de humor?',

        -- recommended_strategy (DB-125)
        E'Estrategias para analizar memes efectivamente:\n\n- CONOCER FORMATOS POPULARES: Familiarízate con templates comunes (Drake, Distracted Boyfriend, Expanding Brain, etc.)\n- BUSCAR LA IRONÍA: El humor de memes frecuentemente viene de contrastar expectativa vs realidad\n- CONTEXTO CULTURAL: Los memes asumen conocimiento compartido - identifica qué debes saber para "pillar" el chiste\n- NO TODO ES LITERAL: El humor viene de lo implícito, no de lo explícito\n- EVALUAR CRÍTICAMENTE: ¿El meme representa bien a Marie Curie o perpetúa estereotipos?\n- PRECISIÓN HISTÓRICA: Los memes pueden distorsionar hechos - identifica qué es exageración vs realidad',

        -- pedagogical_notes (DB-125)
        E'Este ejercicio desarrolla alfabetización en medios visuales y comprensión de textos multimodales, competencia esencial del Nivel 4 de Cassany (Textos Digitales). Los memes representan una forma de comunicación nativa digital que requiere habilidades de lectura específicas.\n\nCompetencias de literacidad digital desarrolladas:\n- Análisis de textos multimodales (imagen + texto)\n- Comprensión de intertextualidad y referencias culturales\n- Decodificación de ironía y humor implícito\n- Evaluación crítica de representaciones mediáticas\n- Comprensión de cultura digital y comunicación viral\n\nDificultad: Intermedia (CEFR: B1-B2). Requiere evaluación manual porque la profundidad del análisis (identificar ironía, referencias culturales, precisión histórica) es subjetiva.\n\nRelevancia pedagógica: Los memes son omnipresentes en la comunicación digital de estudiantes. Aprender a analizarlos críticamente desarrolla habilidades transferibles a cualquier forma de contenido visual-textual.',

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
        true, true
    );

    -- Exercise 4.5: Infografía Interactiva
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
        'Infografía Interactiva: Descubrimientos de Marie Curie',
        'Extrae Información Visual',
        'Explora una infografía interactiva sobre los descubrimientos de Marie Curie. Responde preguntas basándote en la información visual',
        'Haz clic en las diferentes secciones de la infografía. Examina gráficos, iconos y datos. Responde las preguntas de comprensión.',

        -- objective (DB-125: Pedagogical Content)
        E'Desarrollar competencia de lectura de visualizaciones de datos mediante la exploración de una infografía interactiva sobre Marie Curie. Las infografías son un formato dominante de comunicación de información compleja en medios digitales, combinando texto, iconos, gráficos y datos visuales.\n\nLos estudiantes aprenderán a:\n- Navegar infografías interactivas con múltiples secciones clickeables\n- Extraer información de diferentes tipos de visualizaciones (timelines, flowcharts, icon grids)\n- Interpretar datos presentados visualmente (gráficos, iconos, colores)\n- Sintetizar información distribuida en diferentes secciones\n- Responder preguntas de comprensión basándose en lectura visual',

        -- how_to_solve (DB-125)
        E'Metodología de lectura de infografías interactivas:\n\n1. EXPLORACIÓN INICIAL (2-3 min):\n   - Observar la infografía completa sin leer detalles\n   - Identificar las secciones principales (timeline, discoveries, impact)\n   - Notar cómo están organizadas visualmente las secciones\n\n2. LECTURA POR SECCIONES:\n   - Hacer clic en cada sección para ver detalles\n   - Leer títulos, subtítulos y leyendas\n   - Examinar iconos y colores (tienen significado)\n\n3. INTERPRETACIÓN DE VISUALIZACIONES:\n   - Timeline: Leer de izquierda a derecha (cronológico)\n   - Flowchart: Seguir flechas para entender relaciones causa-efecto\n   - Icon grid: Cada icono representa un concepto o categoría\n\n4. RESPONDER PREGUNTAS:\n   - Leer la pregunta y determinar qué sección contiene la respuesta\n   - Navegar directamente a esa sección\n   - Extraer información específica del visual',

        -- recommended_strategy (DB-125)
        E'Estrategias para leer infografías eficientemente:\n\n- ESCANEAR ANTES DE LEER: Obtén visión general antes de enfocarte en detalles\n- LEYENDAS Y ETIQUETAS: Siempre lee estas primero - explican qué significan colores, iconos y símbolos\n- FLUJO VISUAL: Las infografías suelen leerse de arriba-abajo y/o izquierda-derecha\n- COLORES SIGNIFICATIVOS: Colores iguales = categorías relacionadas\n- ICONOS COMO VOCABULARIO: Cada icono representa un concepto - identifica el patrón\n- CÁLCULOS DESDE VISUALES: Puedes calcular (ej: 1934 - 1867 = 67 años de vida) desde datos en timeline\n- CONEXIONES ENTRE SECCIONES: Las secciones no son independientes - busca cómo se relacionan',

        -- pedagogical_notes (DB-125)
        E'Este ejercicio desarrolla competencia de lectura de visualización de datos, habilidad central del Nivel 4 de Cassany (Textos Digitales). Las infografías representan un género textual híbrido que requiere integración de lectura verbal y visual.\n\nCompetencias de visualización de datos desarrolladas:\n- Lectura de gráficos, timelines y flowcharts\n- Interpretación de iconografía y codificación visual\n- Navegación de interfaces interactivas\n- Síntesis de información multimodal\n- Extracción de datos específicos de visualizaciones complejas\n\nDificultad: Intermedia (CEFR: B1). Requiere evaluación manual porque algunas respuestas requieren síntesis de múltiples secciones o cálculos a partir de datos visuales.\n\nRelevancia contemporánea: Las infografías son omnipresentes en periodismo digital, reportes corporativos, contenido educativo y redes sociales. La capacidad de leerlas críticamente es esencial para ciudadanía informada.',

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
                        "title": "Cronología de Marie Curie",
                        "data": "1867-1934: Principales hitos de su vida"
                    },
                    {
                        "id": "discoveries",
                        "type": "icon grid",
                        "title": "Descubrimientos Científicos",
                        "data": "Radio, Polonio, Radioactividad"
                    },
                    {
                        "id": "impact",
                        "type": "flowchart",
                        "title": "Impacto Mundial",
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
        true, true  -- Requiere evaluación manual del maestro
    );

    RAISE NOTICE '✓ Module 4 (Textos Digitales) created with 5 exercises (all require manual grading)';
END $$;
