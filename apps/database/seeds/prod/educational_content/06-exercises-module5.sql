-- =====================================================
-- Seed Data: Exercises Module 5 - Producción Creativa (PRODUCTION)
-- =====================================================
-- Description: 3 ejercicios creativos del Módulo 5 COMPLETOS
-- Module: MOD-05-PRODUCCION
-- Exercises: Diario Multimedia, Cómic Digital, Video-Carta
-- Created by: SA-SEEDS-EDUCATIONAL
-- Date: 2025-11-11
-- Status: PRODUCTION
-- Updated: 2025-12-15 (Sincronizado con DEV + requires_manual_grading)
-- =====================================================

SET search_path TO educational_content, public;

DO $$
DECLARE
    mod_id UUID;
BEGIN
    SELECT id INTO mod_id FROM educational_content.modules WHERE module_code = 'MOD-05-PRODUCCION';

    IF mod_id IS NULL THEN
        RAISE EXCEPTION 'Módulo MOD-05-PRODUCCION no encontrado. Ejecutar primero 01-modules.sql';
    END IF;

    -- ========================================================================
    -- EXERCISE 5.1: DIARIO MULTIMEDIA DE MARIE CURIE
    -- Requiere evaluación manual por docente
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
        is_active, version,
        requires_manual_grading
    ) VALUES (
        mod_id,
        'Diario Interactivo de Marie',
        'Imagina su Vida Cotidiana en 1898',
        'Crea un diario multimedia desde la perspectiva de Marie Curie durante el descubrimiento del radio. Incluye entradas de texto, reflexiones, y elementos multimedia que capturen sus emociones, desafíos y triunfos.',
        'Escribe al menos 3 entradas de diario desde la perspectiva de Marie Curie. Cada entrada debe incluir: fecha histórica, contexto del día, estado emocional, reflexión personal, y opcionalmente elementos multimedia (imagen, audio, o boceto). Usa tu creatividad pero mantén precisión histórica.',
        'diario_multimedia', 1,
        '{
            "allowMultimedia": true,
            "minEntries": 3,
            "maxEntries": 5,
            "formats": ["text", "image", "audio", "video"],
            "minWordsPerEntry": 150,
            "maxWordsPerEntry": 400,
            "requireDates": true,
            "historicalAccuracyRequired": true,
            "multimediaOptional": true,
            "layouts": ["simple", "journal", "notebook", "letter"],
            "fonts": ["handwriting", "typewriter", "modern"],
            "templates": [
                {
                    "id": "template_classic",
                    "name": "Diario Clásico",
                    "style": "vintage",
                    "features": ["date_header", "mood_icon", "weather", "location"]
                },
                {
                    "id": "template_scientific",
                    "name": "Cuaderno Científico",
                    "style": "lab_notebook",
                    "features": ["date_header", "observations", "calculations", "sketches"]
                },
                {
                    "id": "template_letter",
                    "name": "Carta Personal",
                    "style": "letter",
                    "features": ["recipient", "signature", "postscript"]
                }
            ],
            "autoSave": true,
            "saveInterval": 30,
            "characterLimit": 2000
        }'::jsonb,
        '{
            "prompts": [
                {
                    "id": "entry1",
                    "date": "1898-12-15",
                    "title": "El Día del Descubrimiento",
                    "context": "Marie y Pierre acaban de aislar el radio por primera vez. El mineral brilla en la oscuridad del laboratorio.",
                    "mood": "excitement",
                    "weather": "Frío invernal en París",
                    "location": "Laboratorio en Rue Lhomond",
                    "guidingQuestions": [
                        "¿Cómo te sentiste al ver el radio brillar por primera vez?",
                        "¿Qué significó este momento para tu investigación?",
                        "¿Cuáles fueron las dificultades para llegar aquí?",
                        "¿Qué esperanzas tienes para este descubrimiento?"
                    ],
                    "historicalContext": "Después de 4 años de procesar toneladas de pechblenda, Marie y Pierre finalmente aislaron 0.1 gramos de radio puro. El elemento brillaba con luz azul-verde en la oscuridad.",
                    "suggestedElements": ["emoción", "perseverancia", "colaboración", "visión científica"]
                },
                {
                    "id": "entry2",
                    "date": "1898-12-20",
                    "title": "Reflexiones sobre Dificultades",
                    "context": "Cinco días después del descubrimiento. Marie reflexiona sobre los años de trabajo en condiciones precarias.",
                    "mood": "determination",
                    "weather": "Nieve ligera",
                    "location": "Apartamento en París",
                    "guidingQuestions": [
                        "¿Qué obstáculos enfrentaste en estos 4 años?",
                        "¿Hubo momentos donde quisiste rendirte?",
                        "¿Cómo el apoyo de Pierre fue crucial?",
                        "¿Qué sacrificios personales hiciste por la ciencia?"
                    ],
                    "historicalContext": "Marie trabajó en un hangar abandonado sin calefacción, procesando manualmente toneladas de mineral. Vivían en pobreza, priorizando investigación sobre comodidad.",
                    "suggestedElements": ["sacrificio", "pareja", "pobreza", "dedicación"]
                },
                {
                    "id": "entry3",
                    "date": "1898-12-26",
                    "title": "Sueños para el Futuro",
                    "context": "Navidad 1898. Marie imagina cómo el radio podría cambiar la medicina y la ciencia.",
                    "mood": "hope",
                    "weather": "Noche clara y fría",
                    "location": "Junto a la ventana del apartamento",
                    "guidingQuestions": [
                        "¿Cómo podría el radio ayudar a la humanidad?",
                        "¿Qué otros descubrimientos te gustaría hacer?",
                        "¿Qué significa ser una mujer científica en 1898?",
                        "¿Qué le dirías a las futuras generaciones de científicas?"
                    ],
                    "historicalContext": "Marie ya visualizaba aplicaciones médicas del radio (radioterapia). También reflexionaba sobre su rol como mujer en ciencia, un campo dominado por hombres.",
                    "suggestedElements": ["esperanza", "medicina", "igualdad", "legado"]
                },
                {
                    "id": "entry4",
                    "date": "1899-01-05",
                    "title": "Primera Aplicación Médica",
                    "context": "Un médico visitó el laboratorio interesado en usar radio para tratar tumores.",
                    "mood": "anticipation",
                    "weather": "Helada matinal",
                    "location": "Laboratorio",
                    "guidingQuestions": [
                        "¿Cómo te sientes al saber que tu descubrimiento salvará vidas?",
                        "¿Qué responsabilidades sientes ahora?",
                        "¿Preocupa el uso potencialmente peligroso de la radiación?"
                    ],
                    "historicalContext": "En 1899, los primeros médicos comenzaron a experimentar con radio para tratar cáncer de piel, iniciando la era de la radioterapia.",
                    "suggestedElements": ["medicina", "responsabilidad", "peligro", "esperanza"]
                },
                {
                    "id": "entry5",
                    "date": "1899-02-14",
                    "title": "Amor y Ciencia",
                    "context": "Día de San Valentín. Marie reflexiona sobre su relación con Pierre y cómo la ciencia los une.",
                    "mood": "love",
                    "weather": "Primeros signos de primavera",
                    "location": "Caminata por el Sena",
                    "guidingQuestions": [
                        "¿Cómo es trabajar con tu pareja en ciencia?",
                        "¿Qué admiras más de Pierre?",
                        "¿Cómo balanceas vida personal y científica?",
                        "¿Qué significa el amor en tu vida?"
                    ],
                    "historicalContext": "Marie y Pierre tenían una relación única: socios científicos y románticos. Su luna de miel fue un viaje en bicicleta donde discutían física.",
                    "suggestedElements": ["amor", "pareja", "colaboración", "balance"]
                }
            ],
            "rubricDetails": {
                "creativity": {
                    "weight": 30,
                    "criteria": [
                        "Originalidad en la expresión",
                        "Uso creativo de metáforas y lenguaje",
                        "Perspectiva única y personal",
                        "Elementos visuales o multimedia creativos"
                    ]
                },
                "historicalAccuracy": {
                    "weight": 30,
                    "criteria": [
                        "Fechas y eventos históricos correctos",
                        "Contexto científico preciso",
                        "Detalles biográficos auténticos",
                        "Vocabulario y tono de época apropiado"
                    ]
                },
                "multimedia": {
                    "weight": 20,
                    "criteria": [
                        "Uso efectivo de imágenes/bocetos",
                        "Integración coherente de elementos multimedia",
                        "Calidad de presentación visual",
                        "Relevancia de elementos multimedia al contenido"
                    ]
                },
                "expression": {
                    "weight": 20,
                    "criteria": [
                        "Claridad y coherencia narrativa",
                        "Profundidad emocional",
                        "Voz auténtica del personaje",
                        "Gramática y ortografía correcta"
                    ]
                }
            },
            "exampleEntry": {
                "date": "1898-12-15",
                "title": "¡El Radio Brilla!",
                "content": "Querido diario,\\n\\nHoy, 15 de diciembre de 1898, es un día que nunca olvidaré. Después de cuatro años de trabajo incansable, Pierre y yo finalmente lo logramos. En la oscuridad de nuestro laboratorio, el radio brilló con una luz azul-verde etérea que parecía mágica.\\n\\nMis manos están agrietadas por el frío y el trabajo con ácidos. He procesado toneladas de pechblenda en ese hangar helado. Hubo días donde dudé, donde el cansancio era insoportable. Pero hoy, todo cobra sentido.\\n\\nEl radio pesa apenas 0.1 gramos, pero representa años de fe, perseverancia y amor por la ciencia. Pierre me abrazó cuando vimos la luminiscencia. No dijimos nada; no hacían falta palabras.\\n\\nEste descubrimiento abrirá nuevas puertas en física y, espero, en medicina. Imagino un futuro donde la radiactividad ayude a curar enfermedades. Pero por ahora, simplemente contemplo este pequeño milagro brillante.\\n\\nCon emoción y gratitud,\\nMarie",
                "mood": "excitement",
                "multimedia": null,
                "wordCount": 156
            },
            "assessmentGuidelines": "El diario será evaluado por: (1) Creatividad en expresión y perspectiva (30%), (2) Precisión histórica y científica (30%), (3) Uso efectivo de multimedia cuando aplique (20%), (4) Claridad, profundidad emocional y voz auténtica (20%). Se valorará especialmente la capacidad de ponerse en los zapatos de Marie Curie y transmitir sus emociones, desafíos y visión científica de manera auténtica y conmovedora."
        }'::jsonb,
        '{
            "rubric": {
                "creativity": 30,
                "historicalAccuracy": 30,
                "multimedia": 20,
                "expression": 20
            },
            "sampleEvaluation": {
                "excellentEntry": {
                    "score": 95,
                    "feedback": "Excelente trabajo. Tu diario captura magistralmente la voz de Marie Curie, combinando precisión histórica con profundidad emocional. Los detalles sobre el laboratorio frío, las manos agrietadas, y la luminiscencia del radio demuestran investigación cuidadosa. Tu expresión es auténtica y conmovedora."
                },
                "goodEntry": {
                    "score": 80,
                    "feedback": "Buen trabajo. Tu diario muestra comprensión del contexto histórico y captura aspectos emocionales de Marie. Para mejorar, incluye más detalles específicos sobre el proceso científico y profundiza en las reflexiones personales."
                },
                "averageEntry": {
                    "score": 70,
                    "feedback": "Trabajo adecuado. Has cumplido con los requisitos básicos, pero la entrada se siente genérica. Investiga más sobre la vida de Marie y usa detalles específicos para hacer tu diario más auténtico y personal."
                }
            }
        }'::jsonb,
        'intermediate', 100, 70,
        40, 60, 3,
        ARRAY[
            'Investiga sobre la vida diaria de Marie en 1898: dónde vivía, cómo era su laboratorio',
            'Lee cartas reales de Marie Curie para capturar su voz y tono',
            'Piensa en las emociones: frustración del trabajo tedioso, emoción del descubrimiento',
            'Incluye detalles sensoriales: frío del laboratorio, brillo del radio, olor de químicos',
            'No olvides el contexto histórico: ser mujer científica en 1898 era revolucionario'
        ],
        true, 5,
        ARRAY['pistas', 'vision_lectora']::gamification_system.comodin_type[],
        '{
            "pistas": {"cost": 15, "enabled": true, "description": "Revela contexto histórico adicional"},
            "vision_lectora": {"cost": 25, "enabled": true, "description": "Muestra ejemplo de entrada de diario"}
        }'::jsonb,
        500, 100,
        true, 1,
        true  -- requires_manual_grading
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        content = EXCLUDED.content,
        config = EXCLUDED.config,
        solution = EXCLUDED.solution,
        hints = EXCLUDED.hints,
        requires_manual_grading = EXCLUDED.requires_manual_grading,
        updated_at = gamilit.now_mexico();

    -- ========================================================================
    -- EXERCISE 5.2: CÓMIC DIGITAL - EL DESCUBRIMIENTO DEL RADIO
    -- Requiere evaluación manual por docente
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
        is_active, version,
        requires_manual_grading
    ) VALUES (
        mod_id,
        'Resumen Visual Progresivo (Cómic Digital)',
        'Narrativa Visual Científica',
        'Crea un cómic digital de 4-6 viñetas narrando el descubrimiento del radio por Marie Curie. Usa narrativa visual para contar esta historia científica de manera atractiva y educativa.',
        'Diseña un cómic de 4-6 viñetas (panels) que cuente la historia del descubrimiento del radio. Cada viñeta debe incluir: ilustración/boceto, diálogo de personajes, narración contextual, y elementos visuales que refuercen la historia. Usa la herramienta de creación de cómics o dibuja manualmente y sube imágenes.',
        'comic_digital', 2,
        '{
            "minPanels": 4,
            "maxPanels": 6,
            "requireDialogue": true,
            "requireNarration": true,
            "requireCaption": true,
            "allowSketches": true,
            "allowDigitalDrawing": true,
            "allowPhotoComposition": true,
            "panelLayouts": [
                {"id": "classic_4", "name": "4 Viñetas Clásicas", "grid": "2x2"},
                {"id": "vertical_strip", "name": "Tira Vertical", "grid": "1xN"},
                {"id": "horizontal_strip", "name": "Tira Horizontal", "grid": "Nx1"},
                {"id": "dynamic", "name": "Layout Dinámico", "grid": "variable"}
            ],
            "visualStyles": [
                {"id": "realistic", "name": "Realista"},
                {"id": "cartoon", "name": "Caricatura"},
                {"id": "manga", "name": "Manga/Anime"},
                {"id": "sketch", "name": "Boceto"},
                {"id": "minimalist", "name": "Minimalista"}
            ],
            "colorOptions": ["black_white", "grayscale", "full_color", "sepia", "two_tone"],
            "speechBubbleTypes": ["round", "square", "thought", "shout", "whisper", "narration"],
            "drawingTools": {
                "pencil": true,
                "pen": true,
                "brush": true,
                "eraser": true,
                "colorPicker": true,
                "shapes": ["circle", "rectangle", "line", "arrow"],
                "textTool": true,
                "layers": true,
                "undo_redo": true
            },
            "characters": [
                {"name": "Marie Curie", "description": "Mujer de ~31 años, cabello oscuro recogido, bata de laboratorio"},
                {"name": "Pierre Curie", "description": "Hombre de ~39 años, barba, bata de laboratorio"},
                {"name": "Narrador", "description": "Voz omnisciente que provee contexto"}
            ],
            "settings": [
                {"name": "Laboratorio", "description": "Hangar frío, mesas con equipo, pechblenda"},
                {"name": "Noche oscura", "description": "Laboratorio a oscuras, radio brillando"},
                {"name": "Universidad", "description": "Sorbonne, aulas"},
                {"name": "Hogar Curie", "description": "Apartamento modesto"}
            ]
        }'::jsonb,
        '{
            "storyStructure": {
                "act1_setup": {
                    "panels": [1],
                    "purpose": "Establecer el contexto y el desafío",
                    "description": "Introducción a Marie y Pierre trabajando en el laboratorio con pechblenda"
                },
                "act2_rising_action": {
                    "panels": [2, 3],
                    "purpose": "Mostrar el proceso y las dificultades",
                    "description": "El trabajo tedioso de procesar toneladas de mineral, años de esfuerzo"
                },
                "act3_climax": {
                    "panels": [4],
                    "purpose": "El momento del descubrimiento",
                    "description": "El radio brilla en la oscuridad - momento culminante"
                },
                "act4_resolution": {
                    "panels": [5, 6],
                    "purpose": "Impacto y legado (opcional)",
                    "description": "Aplicaciones médicas y el legado de Marie"
                }
            },
            "storyBeats": [
                {
                    "panel": 1,
                    "title": "El Laboratorio Humilde",
                    "scene": "Marie y Pierre en laboratorio con pechblenda",
                    "visualDescription": "Laboratorio frío y destartalado. Marie y Pierre con batas manchadas examinando mineral oscuro.",
                    "suggestedDialogue": {
                        "Marie": "Este mineral contiene algo extraordinario, Pierre.",
                        "Pierre": "Entonces debemos aislarlo, por muy difícil que sea."
                    },
                    "narration": "1898. Marie Curie y su esposo Pierre investigan un mineral llamado pechblenda.",
                    "mood": "determination"
                },
                {
                    "panel": 2,
                    "title": "La Anomalía",
                    "scene": "Marie descubre anomalía en mediciones",
                    "visualDescription": "Close-up de Marie mirando electroscopio con expresión de sorpresa.",
                    "suggestedDialogue": {
                        "Marie": "¡Mira estos números! La radiación es cuatro veces más intensa.",
                        "Pierre": "Debe haber un nuevo elemento..."
                    },
                    "narration": "Las mediciones revelan algo inesperado.",
                    "mood": "excitement"
                },
                {
                    "panel": 3,
                    "title": "Años de Trabajo",
                    "scene": "Montaje de Marie trabajando duro",
                    "visualDescription": "Panel dividido mostrando paso del tiempo.",
                    "suggestedDialogue": {
                        "Marie": "No puedo rendirme. El secreto está ahí."
                    },
                    "narration": "Cuatro años. Ocho toneladas de pechblenda. Trabajo manual extenuante.",
                    "mood": "perseverance"
                },
                {
                    "panel": 4,
                    "title": "¡Brilla en la Oscuridad!",
                    "scene": "El radio aislado brilla con luz azul-verde",
                    "visualDescription": "Laboratorio oscuro. Radio brillando intensamente. Caras iluminadas.",
                    "suggestedDialogue": {
                        "Pierre": "Es... hermoso. Como pequeñas luces de hadas.",
                        "Marie": "Lo logramos, Pierre. Aislamos el radio."
                    },
                    "narration": "15 de diciembre de 1898. Marie y Pierre aislan 0.1 gramos de radio puro.",
                    "mood": "triumph"
                },
                {
                    "panel": 5,
                    "title": "Medicina del Futuro",
                    "scene": "Aplicación de radio en medicina",
                    "visualDescription": "Marie presentando radio a médicos.",
                    "suggestedDialogue": {
                        "Médico": "Con este radio podemos atacar tumores.",
                        "Marie": "La ciencia debe servir a la humanidad."
                    },
                    "narration": "El descubrimiento revoluciona la medicina.",
                    "mood": "hope"
                },
                {
                    "panel": 6,
                    "title": "Legado Inmortal",
                    "scene": "Marie mayor, su legado perdura",
                    "visualDescription": "Marie mayor en su oficina del Instituto Curie.",
                    "suggestedDialogue": {
                        "Marie": "Pierre, lo que comenzamos juntos cambió el mundo."
                    },
                    "narration": "Marie Curie: primera mujer en ganar Nobel, única en ganar dos.",
                    "mood": "bittersweet"
                }
            ],
            "rubricDetails": {
                "narrative": {"weight": 25, "criteria": ["Historia clara", "Secuencia lógica", "Transiciones efectivas"]},
                "visual": {"weight": 25, "criteria": ["Composición efectiva", "Expresiones claras", "Consistencia visual"]},
                "accuracy": {"weight": 25, "criteria": ["Detalles históricos correctos", "Proceso científico preciso"]},
                "creativity": {"weight": 25, "criteria": ["Originalidad visual", "Técnicas de cómic creativas"]}
            }
        }'::jsonb,
        '{
            "rubric": {"narrative": 25, "visual": 25, "accuracy": 25, "creativity": 25},
            "sampleEvaluation": {
                "excellent": {"score": 95, "feedback": "Excelente cómic. Narrativa visual clara y emotiva."},
                "good": {"score": 80, "feedback": "Buen cómic. Historia se sigue claramente."},
                "average": {"score": 70, "feedback": "Cómic adecuado. Cumples requisitos básicos."}
            }
        }'::jsonb,
        'intermediate', 100, 70,
        50, 75, 3,
        ARRAY[
            'Usa el panel del radio brillando como clímax visual',
            'Las expresiones faciales comunican más que el diálogo',
            'Piensa en el flujo visual: el ojo debe moverse naturalmente',
            'Menos texto, más visual: cuenta la historia con imágenes'
        ],
        true, 5,
        ARRAY['pistas', 'vision_lectora']::gamification_system.comodin_type[],
        '{
            "pistas": {"cost": 15, "enabled": true, "description": "Revela técnicas visuales"},
            "vision_lectora": {"cost": 25, "enabled": true, "description": "Muestra ejemplo de panel"}
        }'::jsonb,
        500, 100,
        true, 1,
        true  -- requires_manual_grading
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        content = EXCLUDED.content,
        config = EXCLUDED.config,
        solution = EXCLUDED.solution,
        hints = EXCLUDED.hints,
        requires_manual_grading = EXCLUDED.requires_manual_grading,
        updated_at = gamilit.now_mexico();

    -- ========================================================================
    -- EXERCISE 5.3: VIDEO-CARTA - MENSAJE DE MARIE AL FUTURO
    -- Requiere evaluación manual por docente
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
        is_active, version,
        requires_manual_grading
    ) VALUES (
        mod_id,
        'Cápsula del Tiempo Digital',
        'Comunicación a Través del Tiempo',
        'Graba un video (o escribe guión detallado) como Marie Curie en 1925 enviando un mensaje inspirador y reflexivo a las generaciones del siglo XXI. Captura su sabiduría, esperanzas y advertencias.',
        'Imagina que eres Marie Curie en 1925, a los 58 años, con dos premios Nobel y décadas de experiencia. Graba un video de 2-5 minutos (o escribe guión de 400-600 palabras) dirigido a los jóvenes del siglo XXI. Habla desde tu perspectiva sobre educación, ciencia, igualdad, responsabilidad, y tu legado. Sé auténtica, inspiradora y reflexiva.',
        'video_carta', 3,
        '{
            "videoRequired": false,
            "scriptAlternative": true,
            "videoOptional": true,
            "minDuration": 120,
            "maxDuration": 300,
            "minWords": 400,
            "maxWords": 600,
            "allowedFormats": ["mp4", "webm", "mov", "script"],
            "recordingOptions": {
                "webcam": true,
                "screenRecord": false,
                "audioOnly": true,
                "scriptOnly": true
            },
            "deliveryGuidelines": {
                "pace": "moderate (120-150 words per minute)",
                "tone": "warm, wise, inspirational",
                "eyeContact": "look at camera",
                "posture": "seated or standing, confident"
            }
        }'::jsonb,
        '{
            "context": {
                "year": 1925,
                "marieAge": 58,
                "location": "Instituto Curie, París",
                "achievements": [
                    "Primera mujer en ganar Nobel (Física, 1903)",
                    "Primera persona en ganar dos Nobel (Química, 1911)",
                    "Fundadora del Instituto Curie",
                    "Pionera en radioterapia"
                ],
                "challenges": [
                    "Discriminación como mujer en ciencia",
                    "Pobreza extrema durante investigación",
                    "Muerte de Pierre en 1906",
                    "Salud deteriorada por radiación"
                ]
            },
            "themes": [
                {
                    "theme": "Educación para Mujeres",
                    "message": "La educación es liberación. Las mujeres deben tener las mismas oportunidades."
                },
                {
                    "theme": "Ética Científica",
                    "message": "Los científicos no deben buscar sólo fama. La ciencia debe servir al bien común."
                },
                {
                    "theme": "Perseverancia",
                    "message": "Los obstáculos son inevitables. La perseverancia fue mi verdadera fortaleza."
                },
                {
                    "theme": "Legado",
                    "message": "Mi vida fue dedicada a la ciencia. Espero inspirar a otras mujeres científicas."
                }
            ],
            "scriptStructure": {
                "introduction": {"duration": "30 seconds", "purpose": "Establecer quién es y por qué habla"},
                "body": {"duration": "3-4 minutes", "purpose": "Desarrollar 2-3 temas principales"},
                "conclusion": {"duration": "30 seconds", "purpose": "Mensaje final inspirador"}
            },
            "sampleScript": {
                "title": "Mensaje de Marie Curie al Siglo XXI",
                "wordCount": 487,
                "content": "Buenos días, jóvenes del siglo XXI. Soy Marie Curie, y les hablo desde el año 1925..."
            },
            "rubricDetails": {
                "authenticity": {"weight": 25, "criteria": ["Voz auténtica de Marie", "Detalles precisos", "Tono apropiado"]},
                "message": {"weight": 25, "criteria": ["Mensaje claro e inspirador", "Temas relevantes"]},
                "presentation": {"weight": 25, "criteria": ["Claridad en entrega", "Estructura lógica"]},
                "emotion": {"weight": 25, "criteria": ["Conexión emocional", "Balance vulnerabilidad/fortaleza"]}
            }
        }'::jsonb,
        '{
            "rubric": {"authenticity": 25, "message": 25, "presentation": 25, "emotion": 25},
            "sampleEvaluation": {
                "excellent": {"score": 95, "feedback": "Video-carta excepcional. Voz auténtica de Marie."},
                "good": {"score": 80, "feedback": "Buen trabajo. Mensaje inspirador y auténtico."},
                "average": {"score": 70, "feedback": "Video-carta adecuada. Cumples requisitos básicos."}
            }
        }'::jsonb,
        'advanced', 100, 70,
        60, 90, 3,
        ARRAY[
            'Lee cartas reales de Marie Curie para capturar su voz',
            'Investiga su biografía: logros, tragedias, valores',
            'Muestra vulnerabilidad además de fortaleza',
            'Practica tu entrega antes de grabar'
        ],
        true, 5,
        ARRAY['pistas', 'vision_lectora']::gamification_system.comodin_type[],
        '{
            "pistas": {"cost": 15, "enabled": true, "description": "Revela citas reales de Marie"},
            "vision_lectora": {"cost": 25, "enabled": true, "description": "Muestra guión de ejemplo"}
        }'::jsonb,
        500, 100,
        true, 1,
        true  -- requires_manual_grading
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        content = EXCLUDED.content,
        config = EXCLUDED.config,
        solution = EXCLUDED.solution,
        hints = EXCLUDED.hints,
        requires_manual_grading = EXCLUDED.requires_manual_grading,
        updated_at = gamilit.now_mexico();

    -- ========================================================================
    -- UPDATE MODULE METADATA
    -- ========================================================================
    UPDATE educational_content.modules
    SET
        total_exercises = 3,
        metadata = jsonb_set(
            jsonb_set(
                COALESCE(metadata, '{}'::jsonb),
                '{exercises_loaded}',
                'true'::jsonb
            ),
            '{last_seed_update}',
            to_jsonb(gamilit.now_mexico())
        ),
        updated_at = gamilit.now_mexico()
    WHERE id = mod_id;

    RAISE NOTICE '✅ Módulo 5 (MOD-05-PRODUCCION): 3 ejercicios COMPLETOS cargados exitosamente';
    RAISE NOTICE '   - Diario Multimedia: Templates completos, 5 prompts detallados';
    RAISE NOTICE '   - Cómic Digital: 6 story beats, guías visuales';
    RAISE NOTICE '   - Video-Carta: Guión completo, 4 temas, tips de entrega';
    RAISE NOTICE '✅ Todos los ejercicios configurados con requires_manual_grading = true';

END $$;
