-- =====================================================
-- Seed Data: Exercises Module 3 - Comprensión Crítica (PRODUCTION)
-- =====================================================
-- Description: Ejercicios interactivos del Módulo (PRODUCTION) 3
-- Module: MOD-03-CRITICA
-- Exercises: Análisis Fuentes, Debate, Matriz Perspectivas, Podcast, Tribunal
-- Created by: SA-SEEDS-EDUCATIONAL
-- Date: 2025-11-11
-- Status: PRODUCTION
-- =====================================================

SET search_path TO educational_content, public;

DO $$
DECLARE
    mod_id UUID;
BEGIN
    SELECT id INTO mod_id FROM educational_content.modules WHERE module_code = 'MOD-03-CRITICA';

    IF mod_id IS NULL THEN
        RAISE EXCEPTION 'Módulo MOD-03-CRITICA no encontrado';
    END IF;

    -- ========================================================================
    -- EXERCISE 3.1: ANÁLISIS DE FUENTES HISTÓRICAS
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
        'Análisis de Fuentes Históricas sobre Marie Curie',
        'Evalúa la Credibilidad de las Fuentes',
        'Analiza diferentes fuentes sobre Marie Curie y evalúa su confiabilidad basándote en criterios académicos.',
        'Lee cada fuente cuidadosamente y ordénalas según su credibilidad (de más a menos confiable).',
        'analisis_fuentes', 3,  -- CHANGED: order_index 1→3 per doc v6.2 (DB-121)
        '{
            "dragAndDrop": true,
            "showCriteria": true,
            "criteriaList": ["autoría", "fecha", "revisión por pares", "fuentes citadas", "objetividad"]
        }'::jsonb,
        '{
            "sources": [
                {
                    "id": "src1",
                    "title": "Marie Curie and the Science of Radioactivity",
                    "author": "Dr. Naomi Pasachoff (historiadora de ciencia)",
                    "institution": "American Institute of Physics",
                    "date": "2020",
                    "type": "Artículo académico revisado por pares",
                    "excerpt": "Marie Curie revolucionó la física nuclear con sus descubrimientos del radio y polonio, trabajando en condiciones extremadamente difíciles y superando barreras de género sin precedentes...",
                    "citations": "Más de 50 fuentes primarias y secundarias",
                    "credibilityScore": 95,
                    "credibilityLevel": "muy-alta"
                },
                {
                    "id": "src2",
                    "title": "Mujeres en la Ciencia: Marie Curie",
                    "author": "Blog personal anónimo",
                    "institution": "N/A",
                    "date": "2023",
                    "type": "Blog personal no verificado",
                    "excerpt": "Marie Curie fue sobrevalorada. Su esposo Pierre hizo todo el trabajo real, ella solo lo ayudaba...",
                    "citations": "Sin fuentes citadas",
                    "credibilityScore": 15,
                    "credibilityLevel": "muy-baja"
                },
                {
                    "id": "src3",
                    "title": "Madame Curie: A Biography",
                    "author": "Eve Curie (hija de Marie)",
                    "institution": "Editorial Heinemann",
                    "date": "1937",
                    "type": "Biografía escrita por familiar",
                    "excerpt": "Mi madre trabajaba incansablemente, a menudo olvidándose de comer mientras estaba absorta en sus experimentos...",
                    "citations": "Fuente primaria (testimonios directos)",
                    "credibilityScore": 75,
                    "credibilityLevel": "alta (con sesgo potencial)"
                },
                {
                    "id": "src4",
                    "title": "Artículo de periódico sensacionalista",
                    "author": "Reporter desconocido",
                    "institution": "Le Petit Journal",
                    "date": "1911",
                    "type": "Prensa amarillista de época",
                    "excerpt": "Escándalo: La viuda Curie mantiene romance con científico casado. ¿Merece el Nobel una mujer de moral cuestionable?",
                    "citations": "Rumores y especulaciones",
                    "credibilityScore": 25,
                    "credibilityLevel": "baja"
                },
                {
                    "id": "src5",
                    "title": "Nobel Lectures: Physics 1901-1921",
                    "author": "Nobel Foundation",
                    "institution": "Nobel Foundation",
                    "date": "1967 (compilación de documentos de 1903)",
                    "type": "Fuente primaria oficial",
                    "excerpt": "Marie Curie lecture: On the discovery of radium and polonium...",
                    "citations": "Documentos originales",
                    "credibilityScore": 100,
                    "credibilityLevel": "máxima"
                }
            ],
            "evaluationCriteria": {
                "autoría": "¿Quién escribió? ¿Es experto en el tema?",
                "objetividad": "¿Es neutral o tiene sesgos evidentes?",
                "verificabilidad": "¿Cita fuentes? ¿Son verificables?",
                "tipo": "¿Fuente primaria o secundaria? ¿Académica o popular?",
                "fecha": "¿Es contemporánea o histórica?"
            }
        }'::jsonb,
        '{
            "correctOrder": ["src5", "src1", "src3", "src4", "src2"],
            "credibilityRanking": {
                "1": "src5 (fuente primaria oficial - máxima credibilidad)",
                "2": "src1 (artículo académico reciente revisado por pares)",
                "3": "src3 (biografía familiar - alta pero con sesgo afectivo)",
                "4": "src4 (prensa sensacionalista - baja credibilidad)",
                "5": "src2 (blog anónimo sin fuentes - muy baja credibilidad)"
            }
        }'::jsonb,
        'advanced', 100, 70,
        18, 3,
        ARRAY[
            'Las fuentes primarias oficiales tienen máxima credibilidad',
            'Los artículos académicos revisados por pares son muy confiables',
            'Las biografías familiares tienen valor pero pueden tener sesgo afectivo',
            'Los blogs anónimos sin fuentes tienen credibilidad muy baja'
        ]::text[],
        true, 15,
        100, 20,
        true, 1
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        content = EXCLUDED.content,
        updated_at = NOW();

    -- ========================================================================
    -- EXERCISE 3.2: DEBATE DIGITAL - ÉTICA CIENTÍFICA
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
        'Debate Digital Estructurado',
        'Argumenta tu Posición con Evidencias',
        'Participa en un debate estructurado sobre los dilemas éticos de la investigación de Marie Curie.',
        'Elige una postura, desarrolla argumentos sólidos respaldados con evidencias y anticipa contraargumentos.',
        'debate_digital', 2,
        '{
            "allowCounterarguments": true,
            "timeLimit": 1500,
            "requireEvidence": true,
            "minArguments": 3
        }'::jsonb,
        '{
            "topic": "¿Debería Marie Curie haber patentado sus descubrimientos del radio y polonio?",
            "context": "En 1898, tras descubrir el radio y polonio, Marie y Pierre Curie rechazaron patentar el proceso de aislamiento, permitiendo que otros científicos y la industria usaran libremente sus métodos. Esta decisión les costó millones pero permitió el rápido desarrollo de aplicaciones médicas.",
            "positions": [
                {
                    "id": "pos1",
                    "stance": "A FAVOR - Debieron patentar",
                    "arguments": [
                        {
                            "id": "arg1-1",
                            "text": "Merecían compensación económica por años de trabajo arduo",
                            "evidence": "Trabajaron en pobreza relativa mientras otros se enriquecieron con sus descubrimientos",
                            "strength": "fuerte"
                        },
                        {
                            "id": "arg1-2",
                            "text": "Podrían haber financiado más investigación con los ingresos",
                            "evidence": "El dinero les habría permitido construir mejor laboratorio y contratar asistentes",
                            "strength": "media"
                        },
                        {
                            "id": "arg1-3",
                            "text": "La patente no habría impedido el avance científico",
                            "evidence": "Muchos inventos patentados han beneficiado a la humanidad",
                            "strength": "media"
                        }
                    ],
                    "counterarguments": [
                        "Patentar habría retrasado aplicaciones médicas",
                        "El conocimiento científico debe ser libre",
                        "Su legado ético es más valioso que el dinero"
                    ]
                },
                {
                    "id": "pos2",
                    "stance": "EN CONTRA - Correcta decisión de no patentar",
                    "arguments": [
                        {
                            "id": "arg2-1",
                            "text": "El conocimiento científico debe ser libre para beneficiar a toda la humanidad",
                            "evidence": "La decisión permitió desarrollo rápido de radioterapia, salvando miles de vidas",
                            "strength": "muy-fuerte"
                        },
                        {
                            "id": "arg2-2",
                            "text": "Las patentes habrían retrasado investigación médica crucial",
                            "evidence": "Tratamientos de cáncer se desarrollaron rápidamente gracias a métodos libres",
                            "strength": "fuerte"
                        },
                        {
                            "id": "arg2-3",
                            "text": "Su legado ético inspiró generaciones de científicos",
                            "evidence": "Marie es recordada no solo por su ciencia sino por su integridad",
                            "strength": "media"
                        },
                        {
                            "id": "arg2-4",
                            "text": "La ciencia es construcción colectiva, no propiedad individual",
                            "evidence": "Marie misma se basó en el trabajo de Becquerel y otros",
                            "strength": "fuerte"
                        }
                    ],
                    "counterarguments": [
                        "Marie y Pierre vivieron en relativa pobreza",
                        "Otros se enriquecieron con su trabajo sin compensarlos",
                        "La patente temporal no habría impedido uso eventual"
                    ]
                }
            ],
            "evaluationRubric": {
                "clarity": {"weight": 20, "description": "Claridad de argumentos"},
                "evidence": {"weight": 30, "description": "Uso de evidencias"},
                "logic": {"weight": 25, "description": "Coherencia lógica"},
                "counterarguments": {"weight": 25, "description": "Anticipación de contraargumentos"}
            }
        }'::jsonb,
        '{
            "debateStructure": "ambas_posturas_validas",
            "evaluation": "rubric_based",
            "note": "Este debate no tiene respuesta única correcta. Se evalúa la calidad de argumentación."
        }'::jsonb,
        'advanced', 100, 70,
        100, 20,
        ARRAY[
            'No hay respuesta única correcta; lo importante es la calidad de la argumentación',
            'Usa evidencias específicas de la vida de Marie para respaldar tus argumentos',
            'Anticipa y responde a posibles contraargumentos'
        ]::text[],
        true, 15,
        100, 20,
        true, 1
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        content = EXCLUDED.content,
        updated_at = NOW();

    -- ========================================================================
    -- EXERCISE 3.3: MATRIZ DE PERSPECTIVAS
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
        'Matriz de Perspectivas: Múltiples Visiones sobre Marie Curie',
        'Analiza Diferentes Puntos de Vista',
        'Examina cómo diferentes grupos y épocas han visto a Marie Curie y sus logros.',
        'Completa la matriz identificando cómo cada grupo/época percibió a Marie Curie.',
        'matriz_perspectivas', 5,  -- CHANGED: order_index 3→5 per doc v6.2 (DB-121)
        '{
            "interactiveMatrix": true,
            "allowComparisons": true,
            "showTimeline": true
        }'::jsonb,
        '{
            "perspectives": [
                {
                    "id": "persp-1",
                    "group": "Comunidad científica (1903)",
                    "perspective": "Inicial escepticismo hacia mujer científica",
                    "evidence": "Casi no fue nominada al Nobel; tuvieron que insistir en incluirla",
                    "evolution": "Reconocimiento gradual tras evidencia irrefutable"
                },
                {
                    "id": "persp-2",
                    "group": "Prensa francesa (1911)",
                    "perspective": "Sensacionalismo sobre su vida personal",
                    "evidence": "Escándalo amoroso eclipsó su segundo Nobel temporalmente",
                    "evolution": "Enfoque en chismes antes que en logros científicos"
                },
                {
                    "id": "persp-3",
                    "group": "Movimiento feminista (1920s-presente)",
                    "perspective": "Símbolo de empoderamiento femenino",
                    "evidence": "Primera mujer en logros múltiples sin precedentes",
                    "evolution": "Icono inspiracional para mujeres en STEM"
                },
                {
                    "id": "persp-4",
                    "group": "Polonia (toda época)",
                    "perspective": "Heroína nacional y orgullo patrio",
                    "evidence": "Nombró elemento polonio por su país ocupado",
                    "evolution": "Símbolo de resistencia y excelencia polaca"
                },
                {
                    "id": "persp-5",
                    "group": "Comunidad médica (1920s-presente)",
                    "perspective": "Pionera de radioterapia y medicina moderna",
                    "evidence": "Sus descubrimientos salvaron millones de vidas con tratamientos de cáncer",
                    "evolution": "Reconocimiento como revolucionaria médica"
                },
                {
                    "id": "persp-6",
                    "group": "Historiadores modernos (2000s)",
                    "perspective": "Análisis complejo: genio con limitaciones de época",
                    "evidence": "Reconocen grandeza pero también contextualizan limitaciones por falta de conocimiento sobre radiación",
                    "evolution": "Visión matizada y contextualizada"
                }
            ],
            "analysisQuestions": [
                {
                    "id": "q1",
                    "question": "¿Qué perspectiva fue más injusta con Marie?",
                    "expectedAnswer": "La prensa sensacionalista de 1911 que enfocó en su vida personal ignorando su segundo Nobel"
                },
                {
                    "id": "q2",
                    "question": "¿Cómo ha evolucionado la percepción de Marie con el tiempo?",
                    "expectedAnswer": "De escepticismo inicial a reconocimiento universal como pionera científica y feminista"
                },
                {
                    "id": "q3",
                    "question": "¿Qué grupo tuvo la perspectiva más equilibrada?",
                    "expectedAnswer": "Historiadores modernos que contextualizan sus logros y limitaciones"
                }
            ]
        }'::jsonb,
        '{
            "analysis_type": "multi_perspective",
            "evaluation": "comprehensive_understanding"
        }'::jsonb,
        'advanced', 100, 70,
        100, 20,
        ARRAY[
            'Las perspectivas históricas cambian con el tiempo y contexto',
            'Ninguna perspectiva es completamente objetiva',
            'Comprender múltiples puntos de vista enriquece nuestra comprensión'
        ]::text[],
        true, 15,
        100, 20,
        true, 1
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        content = EXCLUDED.content,
        updated_at = NOW();

    -- ========================================================================
    -- EXERCISE 3.4: PODCAST ARGUMENTATIVO
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
        'Creación de Podcast Argumentativo',
        'Crea un Episodio sobre Ética Científica',
        'Graba un podcast (o escribe guión) argumentando sobre un dilema ético en la vida de Marie Curie.',
        'Elige un tema, investiga, estructura tu argumento y graba/escribe tu podcast de 3-5 minutos.',
        'podcast_argumentativo', 4,
        '{
            "audioRecording": true,
            "scriptAlternative": true,
            "minDuration": 180,
            "maxDuration": 300,
            "requireStructure": true
        }'::jsonb,
        '{
            "topics": [
                {
                    "id": "topic-1",
                    "title": "Sacrificio Personal vs Bienestar Familiar",
                    "description": "Marie dedicó tanto tiempo al laboratorio que descuidó su salud y tiempo familiar. ¿Fue justificado este sacrificio?",
                    "keyPoints": [
                        "Impacto en sus hijas",
                        "Riesgos de salud ignorados",
                        "Magnitud de sus contribuciones científicas"
                    ]
                },
                {
                    "id": "topic-2",
                    "title": "Patentes vs Ciencia Abierta",
                    "description": "¿Fue correcto que los Curie no patentaran sus descubrimientos a pesar de su pobreza?",
                    "keyPoints": [
                        "Beneficio para la humanidad",
                        "Derechos de los inventores",
                        "Impacto en desarrollo médico"
                    ]
                },
                {
                    "id": "topic-3",
                    "title": "Responsabilidad del Científico",
                    "description": "¿Tenía Marie responsabilidad por los usos bélicos posteriores de la radiactividad?",
                    "keyPoints": [
                        "Armas nucleares desarrolladas posteriormente",
                        "Intención vs consecuencias",
                        "Responsabilidad del conocimiento científico"
                    ]
                }
            ],
            "structure": {
                "intro": "Presentación del tema y tesis (30-45 seg)",
                "development": "3 argumentos principales con evidencias (90-120 seg)",
                "counterargument": "Reconocer perspectiva opuesta (30-45 seg)",
                "conclusion": "Síntesis y reflexión final (30-45 seg)"
            },
            "evaluationCriteria": {
                "clarity": "Claridad de expresión y estructura",
                "argumentation": "Solidez de argumentos con evidencias",
                "critical_thinking": "Profundidad de análisis crítico",
                "presentation": "Calidad de presentación (audio/guión)"
            }
        }'::jsonb,
        '{
            "submission_type": "audio_or_script",
            "evaluation": "rubric_based"
        }'::jsonb,
        'advanced', 100, 70,
        100, 20,
        ARRAY[
            'Estructura tu podcast con introducción, desarrollo y conclusión clara',
            'Usa evidencias históricas específicas para respaldar tus argumentos',
            'Reconoce la complejidad: evita juicios simplistas'
        ]::text[],
        true, 15,
        100, 20,
        true, 1
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        content = EXCLUDED.content,
        updated_at = NOW();

    -- ========================================================================
    -- EXERCISE 3.5: TRIBUNAL DE OPINIONES
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
        'Tribunal de Opiniones: Juzgando Decisiones Históricas',
        'Evalúa Decisiones con Criterios Éticos',
        'Participa como jurado evaluando decisiones controversiales de Marie Curie usando criterios éticos contemporáneos y de su época.',
        'Lee cada caso, evalúa con criterios éticos y emite tu veredicto fundamentado.',
        'tribunal_opiniones', 1,  -- CHANGED: order_index 5→1 per doc v6.2 (DB-121)
        '{
            "rolePlay": true,
            "multipleJudges": false,
            "requireJustification": true
        }'::jsonb,
        '{
            "cases": [
                {
                    "id": "case-1",
                    "title": "Caso: Exposición a Radiación",
                    "description": "Marie Curie trabajó durante décadas con materiales altamente radiactivos sin protección adecuada, a pesar de experimentar síntomas de enfermedad. Finalmente murió de anemia aplásica causada por exposición a radiación.",
                    "charges": [
                        "Negligencia hacia su propia salud",
                        "Posible mal ejemplo para otros científicos"
                    ],
                    "defense": [
                        "En su época no se conocían completamente los riesgos",
                        "Su dedicación permitió avances que salvaron millones de vidas"
                    ],
                    "context": "1890s-1930s: conocimiento limitado sobre efectos biológicos de radiación",
                    "questions": [
                        {
                            "id": "q1-1",
                            "question": "Juzgando con estándares de su época, ¿fue Marie negligente?",
                            "options": [
                                "Sí, claramente negligente",
                                "No, actuó según conocimiento disponible",
                                "Parcialmente responsable",
                                "Imposible juzgar con información de la época"
                            ],
                            "correctAnswer": 1,
                            "explanation": "Con el conocimiento científico de 1890-1920, los riesgos no eran completamente comprendidos"
                        },
                        {
                            "id": "q1-2",
                            "question": "¿Qué responsabilidad tiene un científico hacia su propia seguridad vs avance científico?",
                            "options": [
                                "Seguridad personal siempre es prioridad absoluta",
                                "El avance científico justifica riesgos personales calculados",
                                "Balance entre ambos dependiendo del contexto",
                                "Solo la ciencia importa, la seguridad es secundaria"
                            ],
                            "correctAnswer": 2,
                            "explanation": "El balance ético considera tanto bienestar personal como beneficio potencial para humanidad"
                        }
                    ]
                },
                {
                    "id": "case-2",
                    "title": "Caso: Relación con Paul Langevin",
                    "description": "En 1911, Marie Curie, viuda, tuvo una relación con Paul Langevin, un colega científico casado. La prensa francesa la atacó ferozmente, algunos sugiriendo que no merecía el Nobel de Química por razones morales.",
                    "charges": [
                        "Conducta inmoral que daña reputación de la ciencia"
                    ],
                    "defense": [
                        "Vida personal no debe afectar evaluación de logros científicos",
                        "Doble estándar: hombres no reciben mismo escrutinio",
                        "Juicio público injusto e invasivo"
                    ],
                    "context": "1911: sociedad conservadora con diferentes estándares para hombres y mujeres",
                    "questions": [
                        {
                            "id": "q2-1",
                            "question": "¿Debe la vida personal de un científico afectar el reconocimiento de sus logros?",
                            "options": [
                                "Sí, la moralidad personal invalida logros profesionales",
                                "No, vida personal y logros científicos deben separarse completamente",
                                "Depende de la gravedad de las acciones personales",
                                "Solo si afecta directamente el trabajo científico"
                            ],
                            "correctAnswer": 1,
                            "explanation": "Los logros científicos se evalúan por méritos propios, no por vida personal del científico"
                        },
                        {
                            "id": "q2-2",
                            "question": "¿El tratamiento de Marie por la prensa fue justo?",
                            "options": [
                                "Sí, las figuras públicas deben rendir cuentas",
                                "No, fue claramente un doble estándar sexista",
                                "Parcialmente justificado dada la época",
                                "Completamente injustificado en cualquier contexto"
                            ],
                            "correctAnswer": 1,
                            "explanation": "El escrutinio desproporcionado reveló el sexismo de la época; hombres científicos con vidas similares no sufrieron igual tratamiento"
                        }
                    ]
                }
            ],
            "verdictOptions": {
                "inocente": "Actuó éticamente dadas las circunstancias",
                "culpable": "Violó principios éticos importantes",
                "mixto": "Actuación ética compleja con aspectos positivos y negativos",
                "insuficiente": "Información insuficiente para juzgar"
            }
        }'::jsonb,
        '{
            "evaluation_type": "ethical_reasoning",
            "no_single_correct_answer": true
        }'::jsonb,
        'advanced', 100, 70,
        100, 20,
        ARRAY[
            'Juzga con criterios éticos de la época Y con perspectiva moderna',
            'Reconoce que muchas decisiones éticas son complejas sin respuestas simples',
            'Fundamenta tu veredicto con razonamiento claro'
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

    RAISE NOTICE '✅ Módulo 3 (MOD-03-CRITICA): 5 ejercicios cargados exitosamente';
    RAISE NOTICE '   - Análisis de Fuentes Históricas';
    RAISE NOTICE '   - Debate Digital: Ética Científica';
    RAISE NOTICE '   - Matriz de Perspectivas';
    RAISE NOTICE '   - Podcast Argumentativo';
    RAISE NOTICE '   - Tribunal de Opiniones';
END $$;
