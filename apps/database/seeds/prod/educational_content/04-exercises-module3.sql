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
        objective, how_to_solve, recommended_strategy, pedagogical_notes,
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
        E'Desarrollar competencia crítica para evaluar la confiabilidad y credibilidad de fuentes de información mediante la aplicación del método CRAAP (Currency, Relevance, Authority, Accuracy, Purpose). Este ejercicio entrena una habilidad fundamental del pensamiento crítico académico: distinguir entre fuentes fiables y no fiables.\n\nLos estudiantes aprenderán a:\n- Aplicar 5 criterios académicos sistemáticos para evaluar fuentes:\n  * Currency (Actualidad): ¿Cuándo fue publicado? ¿Es vigente?\n  * Relevance (Relevancia): ¿Es apropiado para el tema investigado?\n  * Authority (Autoridad): ¿Quién es el autor? ¿Qué credenciales tiene?\n  * Accuracy (Precisión): ¿Cita fuentes verificables? ¿Contiene errores?\n  * Purpose (Propósito): ¿Por qué fue escrito? ¿Tiene sesgos evidentes?\n- Diferenciar entre tipos de fuentes: primarias vs. secundarias, académicas vs. populares, revisadas por pares vs. no revisadas\n- Reconocer señales de alerta de fuentes no confiables: autoría anónima, lenguaje emotivo excesivo, ausencia de referencias, sesgos evidentes\n- Valorar fuentes primarias oficiales (documentos originales) como las de mayor credibilidad\n- Considerar sesgos potenciales incluso en fuentes generalmente confiables (ej: biografía escrita por familiar)\n- Desarrollar escepticismo saludable ante afirmaciones sin evidencia\n\nEsta habilidad es esencial para la era digital donde la información prolifera sin control de calidad, y los estudiantes deben poder discernir entre fuentes académicamente aceptables y contenido no verificado.',
        E'Metodología para evaluar credibilidad de fuentes usando criterio CRAAP:\n\n1. LECTURA INICIAL DE TODAS LAS FUENTES (5 min):\n   - Leer título, autor, institución, fecha, tipo, y extracto de cada fuente\n   - No evaluar todavía, solo familiarizarse con las 5 opciones\n\n2. APLICACIÓN DEL MÉTODO CRAAP A CADA FUENTE:\n\n   CRITERIO 1 - CURRENCY (Actualidad):\n   - ¿Cuándo se publicó? Fuentes recientes generalmente son más actuales\n   - PERO: Documentos históricos primarios (1903) pueden tener MÁXIMA credibilidad\n   - Ausencia de fecha = señal de alerta\n\n   CRITERIO 2 - RELEVANCE (Relevancia):\n   - ¿El contenido aborda directamente el tema (vida/trabajo de Marie Curie)?\n   - ¿Es apropiado para nivel académico?\n\n   CRITERIO 3 - AUTHORITY (Autoridad) - EL MÁS IMPORTANTE:\n   - ¿Quién escribió? Buscar:\n     * Historiador/científico reconocido = ALTA autoridad\n     * Institución académica (American Institute of Physics, Nobel Foundation) = ALTA\n     * Familiar directo (Eve Curie) = AUTORIDAD con sesgo potencial\n     * Anónimo / "Blog personal" = MUY BAJA autoridad\n   - ¿La fuente fue revisada por pares? (peer review = estándar académico)\n\n   CRITERIO 4 - ACCURACY (Precisión):\n   - ¿Cita fuentes verificables? ("Más de 50 fuentes primarias" = ALTA)\n   - ¿Sin fuentes citadas? = BAJA credibilidad\n   - ¿Contiene afirmaciones verificables históricamente?\n\n   CRITERIO 5 - PURPOSE (Propósito):\n   - ¿Por qué se escribió? Detectar:\n     * Propósito académico/educativo = credibilidad ALTA\n     * Sensacionalismo ("Escándalo", lenguaje emotivo) = credibilidad BAJA\n     * Sesgo evidente (minimizar logros de Marie) = credibilidad CUESTIONABLE\n\n3. ASIGNACIÓN DE PUNTUACIÓN (1-5 puntos por criterio):\n   - Muy bueno = 5 puntos\n   - Bueno = 4 puntos\n   - Aceptable = 3 puntos\n   - Deficiente = 2 puntos\n   - Muy deficiente = 1 punto\n   - Total: 25 puntos máximo\n\n4. CLASIFICACIÓN FINAL:\n   - 20-25 pts: Muy confiable (usar libremente en trabajos académicos)\n   - 15-19 pts: Confiable (usar con citas apropiadas)\n   - 10-14 pts: Cuestionable (usar con precaución y verificar)\n   - <10 pts: No confiable (NO usar en contextos académicos)\n\n5. ORDENAMIENTO DE MÁS A MENOS CONFIABLE:\n   - Drag & drop las fuentes según puntuación CRAAP total',
        E'Estrategias para identificar fuentes confiables vs. no confiables:\n\n- PRIORIZAR FUENTES PRIMARIAS OFICIALES: Documentos originales de instituciones reconocidas (Nobel Foundation, instituciones científicas) tienen MÁXIMA credibilidad\n- VALORAR REVISIÓN POR PARES: Artículos académicos revisados por expertos son más confiables que publicaciones no revisadas\n- DETECTAR AUTORÍA ANÓNIMA: "Blog personal anónimo" es señal de alerta inmediata - sin accountability no hay credibilidad\n- RECONOCER SESGOS FAMILIARES: Biografía escrita por hija (Eve Curie) es fuente primaria valiosa PERO con sesgo afectivo potencial - alta credibilidad con reservas\n- IDENTIFICAR SENSACIONALISMO: Lenguaje emotivo ("Escándalo", juicios morales) indica prensa amarilla, no fuente académica\n- VERIFICAR CITAS: Fuentes sin referencias verificables ("Sin fuentes citadas") tienen baja credibilidad\n- CONTEXTUALIZAR DOCUMENTOS HISTÓRICOS: Prensa de 1911 puede tener valor histórico PERO reflejar prejuicios de época, no hechos objetivos\n- CONSIDERAR PROPÓSITO: Preguntarse "¿Por qué fue escrito?" - ¿informar objetivamente o generar escándalo?\n\nEl comodín "Visión Lectora" (25 ML Coins) puede ayudarte resaltando los 5 criterios CRAAP en cada fuente.',
        E'Este ejercicio desarrolla alfabetización informacional (information literacy), una competencia transversal crítica del siglo XXI incluida en el Nivel 3 de Cassany (Comprensión Crítica y Valorativa).\n\nHabilidades metacognitivas desarrolladas:\n- Pensamiento crítico sistemático (aplicar criterios objetivos vs. impresiones subjetivas)\n- Escepticismo académico saludable (cuestionar fuentes sin caer en nihilismo epistemológico)\n- Reconocimiento de sesgos (propios y de las fuentes)\n- Evaluación de autoridad epistémica (¿quién tiene conocimiento legítimo?)\n\nAlineación con Cassany (Nivel 3):\n- Trasciende comprensión de contenido para evaluar CALIDAD y CONFIABILIDAD del texto mismo\n- Requiere identificar intenciones del autor (objetivo académico vs. sensacionalismo)\n- Desarrolla juicio crítico fundamentado en criterios explícitos\n- Práctica razonamiento ético sobre uso responsable de información\n\nDificultad: Avanzada (CEFR: B2-C1). Requiere:\n- Comprensión de estándares académicos (revisión por pares, fuentes primarias/secundarias)\n- Capacidad de detectar sesgos y propósitos implícitos\n- Conocimiento de instituciones académicas y sus niveles de autoridad\n- Juicio matizado (reconocer que fuentes con sesgos pueden tener valor limitado)\n\nRelevancia contemporánea:\nEn la era de "fake news" y desinformación viral, esta habilidad es crítica. Estudiantes que dominen evaluación de fuentes estarán equipados para:\n- Distinguir noticias verificadas de rumores en redes sociales\n- Evaluar credibilidad de información médica/científica en línea\n- Construir argumentos académicos sólidos basados en fuentes confiables\n- Ejercer ciudadanía informada\n\nEl método CRAAP es estándar en bibliotecas académicas internacionales y transferible a cualquier disciplina.',
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
        objective, how_to_solve, recommended_strategy, pedagogical_notes,
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
        E'Desarrollar competencias de argumentación crítica y pensamiento dialéctico mediante la participación en debates estructurados sobre dilemas éticos e históricos. Este ejercicio entrena habilidades esenciales del pensamiento crítico (Nivel 3 de Cassany): emitir juicios fundamentados, construir argumentos sólidos y defender posturas con evidencia.\n\nLos estudiantes aprenderán a:\n- Construir argumentos persuasivos estructurados con 3 componentes: afirmación + evidencia + razonamiento\n- Diferenciar entre opiniones subjetivas y argumentos fundamentados en hechos verificables\n- Investigar y seleccionar evidencia histórica relevante para respaldar posturas\n- Anticipar y refutar contraargumentos de manera respetuosa y lógica\n- Defender posturas asignadas aleatoriamente (desarrollar empatía intelectual al argumentar contra creencias personales)\n- Estructurar intervenciones en formato académico: apertura, desarrollo, réplica, contra-réplica, cierre\n- Evaluar calidad argumentativa según criterios objetivos: claridad, evidencia, coherencia lógica, persuasión\n- Practicar debate respetuoso (atacar ideas, no personas)\n- Reconocer falacias lógicas comunes y evitarlas\n\nEsta habilidad es fundamental para participación democrática, razonamiento académico y resolución constructiva de conflictos.',
        E'Metodología para construir argumentos sólidos y ganar debates:\n\nFASE 1 - PREPARACIÓN (5 min):\n\n1. RECIBIR Y ACEPTAR POSTURA ASIGNADA:\n   - El sistema asigna aleatoriamente "A favor" o "En contra"\n   - IMPORTANTE: Defender la postura asignada aunque no coincida con opinión personal (desarrolla empatía intelectual)\n\n2. INVESTIGAR EVIDENCIA (3 min):\n   - Leer todas las fuentes disponibles sobre el tema\n   - Identificar:\n     * Hechos históricos verificables (fechas, eventos, cifras)\n     * Testimonios relevantes\n     * Patrones causales (ej: "fama → invasión privacidad → estrés")\n   - Subrayar mentalmente evidencia que apoya TU postura\n   - TAMBIÉN identificar evidencia que apoya postura contraria (para anticipar contraargumentos)\n\n3. CONSTRUIR 3 ARGUMENTOS PRINCIPALES (2 min):\n   Estructura de cada argumento:\n   - AFIRMACIÓN: Declaración clara de tu punto ("La fama afectó negativamente...")\n   - EVIDENCIA: Hecho histórico concreto ("Escándalo tras muerte de Pierre causó acoso periodístico")\n   - RAZONAMIENTO: Explicación lógica de cómo la evidencia apoya la afirmación ("El acoso interrumpió su trabajo científico, afectando negativamente su investigación")\n\n4. ANTICIPAR CONTRAARGUMENTOS:\n   - Pensar: ¿Qué dirá el oponente?\n   - Preparar refutaciones: "Si bien es cierto que [contraargumento], la evidencia muestra que [tu refutación]"\n\nFASE 2 - DEBATE (10 min):\n\n1. APERTURA (1 min): Declaración de tesis clara y contundente\n2. DESARROLLO (2 min): Exponer 3 argumentos con evidencia específica\n3. RÉPLICA (2 min): Responder a argumentos del oponente sin ataques personales\n4. CONTRA-RÉPLICA (2 min): Defender tu posición ante refutaciones\n5. CIERRE (30 s): Resumir puntos más fuertes, conclusión memorable\n\nFASE 3 - EVALUACIÓN:\n- Otros estudiantes votan el argumento más convincente\n- Criterios: Claridad + Evidencia + Lógica + Persuasión',
        E'Estrategias para ganar debates académicos:\n\n- USAR DATOS CONCRETOS, NO GENERALIDADES: "Marie recibió 2 Premios Nobel" > "Marie era muy exitosa"\n- CITAR FUENTES ESPECÍFICAS: "Según la biografía de Eve Curie..." > "Alguien dijo que..."\n- MANTENER RESPETO ABSOLUTO: Atacar IDEAS, nunca personas ("Ese argumento no considera..." ≠ "Estás equivocado")\n- SER CONCISO: Argumentos breves y claros > largos monólogos confusos\n- ESTRUCTURA CLARA: Numerar argumentos ("Primero... Segundo... Tercero...") facilita seguimiento\n- ANTICIPAR Y REFUTAR: "Mi oponente probablemente dirá X, pero la evidencia muestra Y"\n- USAR CONECTORES LÓGICOS: "Por lo tanto", "Sin embargo", "En consecuencia" hacen argumentos más persuasivos\n- ADMITIR PUNTOS DÉBILES ESTRATÉGICAMENTE: "Si bien [concesión menor], [punto fuerte principal] prevalece"\n- CERRAR CON IMPACTO: Última oración debe ser memorable y contundente\n- EVITAR FALACIAS: Ad hominem, falsa dicotomía, apelación a emoción sin evidencia\n\nEl comodín "Pistas" (15 ML Coins) puede sugerirte líneas argumentativas basadas en evidencia histórica.',
        E'Este ejercicio desarrolla pensamiento crítico-dialéctico (Nivel 3 de Cassany: Comprensión Crítica y Valorativa) y múltiples competencias del siglo XXI:\n\nHabilidades cognitivas:\n- Razonamiento lógico-deductivo (construir argumentos válidos)\n- Análisis crítico (evaluar fortalezas/debilidades de posiciones)\n- Síntesis de información (integrar múltiples fuentes en argumentos coherentes)\n- Pensamiento contrafactual ("¿Qué hubiera pasado si Marie hubiera rechazado fama?")\n\nHabilidades socio-emocionales:\n- Empatía intelectual (defender posturas contrarias a creencias personales)\n- Regulación emocional (mantener compostura ante refutaciones)\n- Comunicación asertiva (defender posiciones sin agresividad)\n- Escucha activa (comprender argumentos contrarios para refutarlos efectivamente)\n\nAlineación con Cassany (Nivel 3):\n- Emitir juicios fundamentados (no opiniones subjetivas)\n- Identificar intenciones subyacentes en textos (sesgos, propósitos)\n- Argumentar posturas con evidencia\n- Evaluar calidad de razonamientos\n\nDificultad: Avanzada (CEFR: B2-C1). Requiere:\n- Dominio de estructuras argumentativas complejas\n- Capacidad de improvisación controlada (réplicas en tiempo real)\n- Conocimiento histórico profundo sobre Marie Curie\n- Madurez emocional para debate respetuoso\n\nRelevancia pedagógica:\n- Prepara para ensayos argumentativos universitarios\n- Desarrolla habilidades de oratoria y presentación\n- Fundamental para participación democrática informada\n- Transferible a contextos profesionales (presentaciones, negociaciones)\n\nEl formato de debate estructurado (con fases claramente delimitadas) reduce ansiedad al proporcionar marco predecible, mientras que la asignación aleatoria de posturas elimina sesgo confirmatorio.',
        'debate_digital', 2,
        '{
            "allowCounterarguments": true,
            "timeLimit": 600,
            "requireEvidence": true,
            "minArguments": 3
        }'::jsonb,
        '{
            "topic": "¿La fama afectó negativamente la investigación de Marie Curie?",
            "context": "Tras ganar el Premio Nobel de Física en 1903, Marie Curie se convirtió en una figura pública mundial. Esta fama trajo consigo escrutinio mediático intenso, especialmente durante el escándalo de 1911 con Paul Langevin, invitaciones constantes a eventos y ceremonias, y atención que invadía su privacidad. Sin embargo, también le proporcionó financiación, colaboraciones internacionales y recursos para su laboratorio.",
            "positions": [
                {
                    "id": "pos1",
                    "stance": "A FAVOR - La fama afectó negativamente",
                    "arguments": [
                        {
                            "id": "arg1-1",
                            "text": "Invasión de privacidad que interrumpía su trabajo científico",
                            "evidence": "El escándalo tras la muerte de Pierre en 1911 causó acoso periodístico constante frente a su casa",
                            "strength": "muy-fuerte"
                        },
                        {
                            "id": "arg1-2",
                            "text": "Tiempo perdido en eventos y ceremonias obligatorias",
                            "evidence": "Múltiples ceremonias de premiación, conferencias y eventos sociales que le restaban tiempo de laboratorio",
                            "strength": "fuerte"
                        },
                        {
                            "id": "arg1-3",
                            "text": "Presión mediática que afectó su salud mental",
                            "evidence": "Acoso periodístico documentado durante el escándalo Langevin; cartas amenazantes; tuvo que refugiarse en casa de amigos",
                            "strength": "fuerte"
                        }
                    ],
                    "counterarguments": [
                        "La fama le dio acceso a mejores recursos y financiación",
                        "El reconocimiento validó su trabajo ante escépticos",
                        "Las colaboraciones internacionales enriquecieron su investigación"
                    ]
                },
                {
                    "id": "pos2",
                    "stance": "EN CONTRA - La fama benefició su investigación",
                    "arguments": [
                        {
                            "id": "arg2-1",
                            "text": "Mayor financiación para su laboratorio e investigación",
                            "evidence": "Laboratorio mejorado significativamente después del Nobel; pudo contratar asistentes y adquirir equipos",
                            "strength": "muy-fuerte"
                        },
                        {
                            "id": "arg2-2",
                            "text": "Reconocimiento institucional que abrió puertas",
                            "evidence": "Primera mujer profesora en la Sorbona (1906); acceso a instituciones antes vedadas",
                            "strength": "fuerte"
                        },
                        {
                            "id": "arg2-3",
                            "text": "Colaboraciones internacionales y mejores recursos",
                            "evidence": "Apoyo gubernamental francés; donaciones de instituciones americanas; red global de científicos colaboradores",
                            "strength": "fuerte"
                        },
                        {
                            "id": "arg2-4",
                            "text": "Plataforma para promover la ciencia y mujeres en STEM",
                            "evidence": "Su fama inspiró a generaciones de mujeres científicas; usó su visibilidad para promover la ciencia",
                            "strength": "media"
                        }
                    ],
                    "counterarguments": [
                        "El acoso mediático interrumpía constantemente su trabajo",
                        "Los eventos sociales consumían tiempo valioso",
                        "La presión pública afectó su bienestar personal"
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
    -- EXERCISE 3.5: MATRIZ DE PERSPECTIVAS
    -- Referencia: DocumentoDeDiseño v6.4 líneas 729-766
    -- ========================================================================
    INSERT INTO educational_content.exercises (
        module_id, title, subtitle, description, instructions,
        objective, how_to_solve, recommended_strategy, pedagogical_notes,
        exercise_type, order_index,
        config, content, solution,
        difficulty_level, max_points, passing_score,
        estimated_time_minutes, max_attempts,
        hints, enable_hints, hint_cost_ml_coins,
        xp_reward, ml_coins_reward,
        is_active, version
    ) VALUES (
        mod_id,
        'Matriz de Perspectivas',
        'Análisis Multi-Perspectiva de Eventos Históricos',
        'Analiza un evento histórico desde múltiples puntos de vista diferentes, considerando las reacciones emocionales, opiniones y consecuencias percibidas por cada actor involucrado.',
        E'1. Lee el evento central presentado.\n2. Completa la matriz analizando el evento desde 6 perspectivas diferentes.\n3. Para cada perspectiva, incluye:\n   - Reacción emocional del actor\n   - Opinión sobre el evento\n   - Consecuencias que percibe\n4. Basa tus respuestas en el contexto histórico proporcionado.\n5. Considera factores como prejuicios de la época, contexto político, roles de género y nacionalismo.',
        E'Desarrollar pensamiento crítico multi-perspectiva mediante el análisis de un evento histórico (Marie Curie ganando el Nobel de Química en 1911) desde seis puntos de vista diferentes, identificando sesgos, intereses y reacciones emocionales de cada actor en su contexto histórico.',
        E'Estrategia de resolución paso a paso:\n\n1. Leer el evento central: Familiarízate con "Marie gana el Nobel de Química en 1911 en medio de escándalo personal".\n\n2. Identificar a cada actor: Marie Curie, Pierre Curie (póstumamente), científicos contemporáneos, la prensa, mujeres de la época, y la sociedad polaca.\n\n3. Para cada perspectiva, pregúntate:\n   - ¿Cómo se habría sentido esta persona/grupo?\n   - ¿Qué habría opinado del evento?\n   - ¿Qué consecuencias habría percibido?\n\n4. Considerar el contexto histórico:\n   - Prejuicios de género de 1911\n   - Escándalo personal vs logro científico\n   - Prensa sensacionalista de la época\n   - Nacionalismo (Polonia vs Francia)\n\n5. Completar la matriz: Escribe respuestas coherentes basadas en evidencia histórica.',
        E'Tips para analizar eficientemente:\n- Usa el contexto histórico: 1911 era una época de fuertes prejuicios de género.\n- Separa emoción de razón: Algunas perspectivas son emocionales (Marie), otras pragmáticas (prensa).\n- Identifica sesgos: Cada actor tiene intereses propios (prensa vende periódicos, científicos protegen reputación).\n- Usa empatía histórica: Ponte en el lugar de cada actor considerando su época, no la actual.\n- Evidencia del texto: Basa tus respuestas en hechos conocidos de la biografía de Marie.',
        E'Este ejercicio desarrolla pensamiento crítico de nivel 3 (comprensión crítica y valorativa) según Daniel Cassany. Los estudiantes practican:\n- Análisis multi-perspectiva de eventos históricos\n- Identificación de sesgos, intereses y prejuicios de época\n- Empatía histórica y contextualización\n- Separación entre logro objetivo y percepción subjetiva\n\nCompetencias trabajadas:\n- Pensamiento crítico avanzado\n- Análisis contextual\n- Identificación de sesgos y prejuicios\n- Argumentación basada en evidencia histórica\n\nAlineación curricular: Apropiado para estudiantes de nivel advanced (B2-C1 CEFR) en análisis crítico de textos históricos.',
        'matriz_perspectivas', 5,
        '{
            "requireAllPerspectives": true,
            "minWordsPerCell": 30,
            "showExamplePerspective": true,
            "allowMultipleAttempts": true
        }'::jsonb,
        '{
            "event": {
                "title": "Marie gana el Nobel de Química en 1911 en medio de escándalo personal",
                "context": "En 1911, Marie Curie recibió su segundo Premio Nobel (en Química) por el aislamiento del radio puro. Sin embargo, este logro científico sin precedentes coincidió con un escándalo en su vida personal que generó gran controversia en la prensa francesa. Marie fue la primera persona en ganar dos Nobel y la primera mujer en ganar el Nobel de Química, pero estos logros fueron opacados por el sensacionalismo de la época.",
                "historicalContext": "Europa de principios del siglo XX, fuerte machismo institucional, prensa sensacionalista, nacionalismo, rol limitado de la mujer en la ciencia."
            },
            "perspectives": [
                {
                    "id": "marie_curie",
                    "name": "Marie Curie misma",
                    "description": "La propia Marie Curie, científica galardonada",
                    "guideQuestions": [
                        "¿Cómo se habría sentido Marie al recibir el segundo Nobel?",
                        "¿Qué opinaba de mezclar su vida personal con sus logros científicos?",
                        "¿Qué consecuencias temía o esperaba?"
                    ]
                },
                {
                    "id": "pierre_curie",
                    "name": "Pierre Curie (póstumamente)",
                    "description": "El difunto esposo de Marie, también científico Nobel",
                    "guideQuestions": [
                        "¿Cómo habría reaccionado Pierre al segundo Nobel de Marie?",
                        "¿Qué habría opinado del escándalo?",
                        "¿Qué habría deseado para Marie?"
                    ]
                },
                {
                    "id": "cientificos",
                    "name": "Científicos contemporáneos",
                    "description": "La comunidad científica europea de 1911",
                    "guideQuestions": [
                        "¿Cómo vieron el segundo Nobel de Marie?",
                        "¿Qué opinaban del escándalo vs el logro?",
                        "¿Qué consecuencias temían para la ciencia?"
                    ]
                },
                {
                    "id": "prensa",
                    "name": "La prensa de la época",
                    "description": "Periódicos y medios franceses de 1911",
                    "guideQuestions": [
                        "¿Qué vendía más: el Nobel o el escándalo?",
                        "¿Qué enfoque dieron a la noticia?",
                        "¿Qué consecuencias buscaban (ventas, influencia)?"
                    ]
                },
                {
                    "id": "mujeres",
                    "name": "Mujeres de la época",
                    "description": "Mujeres educadas y aspirantes a la ciencia en Europa",
                    "guideQuestions": [
                        "¿Cómo inspiró el logro de Marie?",
                        "¿Qué esperanzas generó?",
                        "¿Qué barreras seguían viendo?"
                    ]
                },
                {
                    "id": "polonia",
                    "name": "La sociedad polaca",
                    "description": "Polonia, país natal de Marie (bajo ocupación rusa)",
                    "guideQuestions": [
                        "¿Qué orgullo nacional sintieron?",
                        "¿Qué opinaban de que Marie representara a Francia?",
                        "¿Qué significaba para Polonia ocupada?"
                    ]
                }
            ],
            "matrixTemplate": {
                "columns": ["Perspectiva", "Reacción Emocional", "Opinión sobre el Evento", "Consecuencias Percibidas"],
                "rows": 6
            }
        }'::jsonb,
        '{
            "modelAnswers": [
                {
                    "perspectiveId": "marie_curie",
                    "emotionalReaction": "Orgullo por el reconocimiento científico mezclado con dolor por la invasión de su privacidad y el juicio público",
                    "opinion": "El Nobel es un reconocimiento merecido a años de trabajo científico riguroso. La vida personal no debería mezclarse con los logros profesionales",
                    "perceivedConsequences": "Validación científica internacional pero también mayor escrutinio público y posible rechazo social"
                },
                {
                    "perspectiveId": "prensa",
                    "emotionalReaction": "Excitación por la oportunidad de vender más periódicos con el escándalo",
                    "opinion": "El escándalo personal es más interesante para los lectores que un premio científico abstracto",
                    "perceivedConsequences": "Mayor circulación de periódicos, aumento en ventas, influencia pública"
                },
                {
                    "perspectiveId": "mujeres",
                    "emotionalReaction": "Inspiración y esperanza de que las barreras de género puedan superarse",
                    "opinion": "Marie demuestra que las mujeres pueden alcanzar la excelencia científica al más alto nivel",
                    "perceivedConsequences": "Nuevas posibilidades para mujeres en campos científicos, aunque las barreras siguen siendo enormes"
                },
                {
                    "perspectiveId": "cientificos",
                    "emotionalReaction": "División entre admiración por el logro y preocupación por la reputación de la ciencia",
                    "opinion": "El logro científico es indiscutible, pero el escándalo amenaza la imagen de seriedad de la academia",
                    "perceivedConsequences": "Dilema entre defender a una colega talentosa y proteger la reputación institucional"
                },
                {
                    "perspectiveId": "pierre_curie",
                    "emotionalReaction": "Orgullo por el segundo Nobel de Marie y tristeza por no estar presente para apoyarla",
                    "opinion": "Marie merece todo reconocimiento por su brillantez científica independiente",
                    "perceivedConsequences": "Habría deseado protegerla del escándalo y apoyarla públicamente"
                },
                {
                    "perspectiveId": "polonia",
                    "emotionalReaction": "Orgullo nacionalista de que una polaca alcance la cima científica mundial",
                    "opinion": "Marie representa la inteligencia y resiliencia polacas a pesar de la ocupación",
                    "perceivedConsequences": "Símbolo de esperanza para Polonia ocupada, aunque represente oficialmente a Francia"
                }
            ]
        }'::jsonb,
        'advanced', 100, 70, 30, 3,
        ARRAY[
            'Recuerda que en 1911 existían fuertes prejuicios de género en la ciencia',
            'La prensa de la época priorizaba el sensacionalismo sobre la precisión',
            'Marie fue rechazada de la Academia de Ciencias Francesa a pesar de sus Nobel',
            'Polonia estaba bajo ocupación y buscaba símbolos de orgullo nacional'
        ]::text[],
        true, 15,
        100, 20,
        true, 1
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        title = EXCLUDED.title,
        subtitle = EXCLUDED.subtitle,
        description = EXCLUDED.description,
        instructions = EXCLUDED.instructions,
        objective = EXCLUDED.objective,
        how_to_solve = EXCLUDED.how_to_solve,
        recommended_strategy = EXCLUDED.recommended_strategy,
        pedagogical_notes = EXCLUDED.pedagogical_notes,
        config = EXCLUDED.config,
        content = EXCLUDED.content,
        solution = EXCLUDED.solution,
        estimated_time_minutes = EXCLUDED.estimated_time_minutes,
        hints = EXCLUDED.hints,
        updated_at = NOW();

    -- ========================================================================
    -- EXERCISE 3.4: PODCAST ARGUMENTATIVO
    -- ========================================================================
    INSERT INTO educational_content.exercises (
        module_id, title, subtitle, description, instructions,
        objective, how_to_solve, recommended_strategy, pedagogical_notes,
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
        E'Desarrollar competencias de comunicación oral argumentativa y expresión crítica mediante la creación de podcasts estructurados sobre dilemas éticos científicos. Este ejercicio integra múltiples habilidades del Nivel 3 de Cassany: emitir juicios fundamentados, argumentar posturas con evidencia y comunicar ideas complejas de manera clara y persuasiva.\n\nLos estudiantes aprenderán a:\n- Crear contenido multimedia argumentativo estructurado (introducción con hook, desarrollo, conclusión)\n- Investigar y seleccionar evidencia histórica relevante (mínimo 3 datos verificables, 2 citas/referencias)\n- Formular tesis claras sobre dilemas éticos complejos (ej: impacto de Marie en equidad de género científica)\n- Construir argumentos orales persuasivos con secuencia lógica (argumento 1 → argumento 2 → argumento 3)\n- Usar conectores discursivos apropiados para habla formal ("en primer lugar", "además", "por lo tanto", "en conclusión")\n- Variar tono vocal y ritmo para mantener interés auditivo (evitar monotonía)\n- Fundamentar opiniones personales con evidencia histórica (no solo expresar preferencias subjetivas)\n- Adaptar registro lingüístico a audiencia académica (formal pero accesible)\n- Revisar y mejorar producción mediante regrabar si es necesario\n\nEsta habilidad es fundamental para comunicación académica moderna (presentaciones, conferencias, divulgación científica) y transferible a contextos profesionales donde se requiere argumentación oral estructurada.',
        E'Metodología para crear un podcast argumentativo efectivo:\n\nFASE 1 - INVESTIGACIÓN Y PREPARACIÓN (15 min):\n\n1. ELEGIR TEMA ESPECÍFICO:\n   - Ejemplos sugeridos:\n     * "Impacto de Marie Curie en equidad de género científica"\n     * "¿Debió Marie patentar el proceso del radio?"\n     * "Ética de continuar investigación a pesar de riesgos de salud conocidos"\n   - Asegurar que el tema permita argumentación (no solo descripción)\n\n2. INVESTIGAR EVIDENCIA (10 min):\n   - Buscar mínimo:\n     * 3 datos verificables (fechas, cifras, eventos históricos)\n     * 2 citas o referencias de fuentes confiables\n   - Anotar fuentes para citarlas en el podcast\n\n3. FORMULAR TESIS CLARA:\n   - Ejemplo: "Marie Curie fue pionera crucial para la equidad de género en ciencias, aunque el impacto pleno tomaría décadas"\n   - La tesis debe ser defensible con evidencia, no obvia\n\nFASE 2 - ESTRUCTURAR GUIÓN (15 min):\n\n1. INTRODUCCIÓN (30 segundos = ~75-90 palabras):\n   - HOOK: Pregunta provocadora o dato sorprendente\n     * "¿Sabían que Marie Curie fue rechazada de la Academia de Ciencias Francesa pese a tener un Nobel?"\n   - TESIS: Declaración clara de tu postura\n     * "A pesar de barreras extraordinarias, Marie transformó las posibilidades para mujeres en ciencia"\n\n2. DESARROLLO (2 minutos = ~300-360 palabras):\n   ARGUMENTO 1 (40 s): Primera mujer en ganar Nobel (1903)\n   - Dato: Premio compartido con Pierre y Becquerel\n   - Significado: Rompió barrera de 200+ años\n   \n   ARGUMENTO 2 (40 s): Primera profesora en la Sorbona (1906)\n   - Contexto: Asumió cátedra tras muerte de Pierre\n   - Impacto: Abrió académica universitaria a mujeres\n   \n   ARGUMENTO 3 (40 s): Modelo para futuras científicas\n   - Evidencia: Citas de científicas posteriores inspiradas por Marie\n   - Dato: Incremento de mujeres en física post-Curie\n\n3. CONCLUSIÓN (30 segundos = ~75-90 palabras):\n   - SÍNTESIS: Resumir puntos principales\n   - REFLEXIÓN FINAL: Llamado a la acción o pregunta para audiencia\n     * "El legado de Marie nos recuerda que el talento no tiene género, solo requiere oportunidad"\n\nFASE 3 - GRABACIÓN (múltiples intentos permitidos):\n\n1. PRÁCTICA PREVIA: Leer guión en voz alta 2-3 veces antes de grabar\n2. GRABAR BORRADOR: Primera versión completa\n3. ESCUCHAR CRÍTICAMENTE:\n   - ¿Se entiende claramente?\n   - ¿El tono varía apropiadamente?\n   - ¿Los conectores fluyen naturalmente?\n4. REGRABAR SECCIONES DÉBILES: Mejorar introducción/conclusión si es necesario\n5. VERSIÓN FINAL: Subir mejor versión',
        E'Tips para grabar podcasts argumentativos efectivos:\n\n- HABLAR CLARO Y PAUSADO: Velocidad ~130-150 palabras/minuto (más lento que conversación normal)\n- USAR CONECTORES EXPLÍCITOS: "En primer lugar...", "Además...", "Por lo tanto..." guían al oyente\n- VARIAR TONO PARA MANTENER INTERÉS: Enfatizar palabras clave, hacer pausas dramáticas antes de datos sorprendentes\n- CITAR FUENTES VERBALMENTE: "Según la biografía de Eve Curie..." (da credibilidad)\n- EVITAR MULETILLAS: "Eh", "este", "como que" restan profesionalismo\n- USAR PREGUNTAS RETÓRICAS: "¿Por qué importa esto?" mantiene atención\n- PRACTICAR ANTES DE GRABAR: Leer guión 2-3 veces reduce errores\n- GRABAR EN LUGAR SILENCIOSO: Ruido de fondo distrae\n- USAR MICRÓFONO DECENTE: Calidad de audio afecta percepción de credibilidad\n- APROVECHAR REGRABACIÓN: No conformarse con primera versión imperfecta\n\nESTRUCTURA DE CADA ARGUMENTO:\n1. Afirmación (1 oración): "Marie fue la primera mujer en ganar un Nobel"\n2. Evidencia (2-3 oraciones): "En 1903, compartió el Premio Nobel de Física con Pierre Curie y Henri Becquerel por investigaciones sobre radiactividad. En ese momento, solo 3 mujeres habían ganado premios Nobel en cualquier categoría"\n3. Significado (1-2 oraciones): "Este logro demostró que mujeres podían contribuir al más alto nivel científico, desafiando prejuicios de la época que consideraban la ciencia dominio exclusivamente masculino"',
        E'Este ejercicio desarrolla competencias multimodales del siglo XXI combinando comprensión crítica (Nivel 3 de Cassany) con producción oral académica. A diferencia de ensayos escritos, los podcasts requieren:\n\nHabilidades adicionales específicas de oralidad:\n- Claridad articulatoria y control de ritmo/velocidad\n- Uso de énfasis vocal para jerarquizar información\n- Anticipación de comprensión auditiva (no hay relectura posible como en textos escritos)\n- Naturalidad en registro formal (evitar lectura robótica de guión)\n\nAlineación con Cassany (Nivel 3):\n- Emitir juicios fundamentados sobre dilemas éticos complejos\n- Argumentar posturas con evidencia histórica verificable\n- Identificar y comunicar implicaciones de decisiones históricas\n- Desarrollar voz crítica propia (opinión personal fundamentada)\n\nDificultad: Avanzada (CEFR: B2-C1). Requiere:\n- Dominio de estructuras argumentativas orales\n- Capacidad de síntesis (condensar investigación en 3-5 minutos)\n- Control de ansiedad por grabación (práctica reduce nerviosismo)\n- Conciencia metacomunicativa (cómo tono/ritmo afectan persuasión)\n\nRelevancia pedagógica:\n- Formato podcast es popular entre estudiantes (mayor motivación que ensayos tradicionales)\n- Transferible a presentaciones académicas (defensa de tesis, conferencias)\n- Desarrolla habilidades de divulgación científica (comunicar ideas complejas claramente)\n- Prepara para entrevistas profesionales y comunicación corporativa\n\nBeneficios del formato podcast:\n- Permite múltiples intentos (reduce presión de "una oportunidad")\n- Desarrolla confianza en expresión oral\n- Produce artefacto digital compartible (portfolio académico)\n- Más auténtico que ejercicios escritos descontextualizados\n\nEl requisito de "opinión personal fundamentada" es crucial: diferencia entre expresar preferencias subjetivas arbitrarias ("me parece que...") y formular juicios críticos basados en evidencia ("Basándome en el hecho de que..., considero que...").',
        'podcast_argumentativo', 4,
        '{
            "audioRecording": true,
            "scriptAlternative": true,
            "minDuration": 120,
            "maxDuration": 120,
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
    -- EXERCISE 3.1: TRIBUNAL DE OPINIONES (ALINEADO CON DOC v6.3)
    -- ========================================================================
    INSERT INTO educational_content.exercises (
        module_id, title, subtitle, description, instructions,
        objective, how_to_solve, recommended_strategy, pedagogical_notes,
        exercise_type, order_index,
        config, content, solution,
        difficulty_level, max_points, passing_score,
        estimated_time_minutes, max_attempts,
        hints, enable_hints, hint_cost_ml_coins,
        xp_reward, ml_coins_reward,
        is_active, version
    ) VALUES (
        mod_id,
        'Tribunal de Opiniones: Evaluando Afirmaciones',
        'Clasifica y Evalúa Opiniones sobre Marie Curie',
        'Analiza diferentes afirmaciones sobre Marie Curie. Clasifica cada una como HECHO, OPINIÓN o INTERPRETACIÓN, y determina si está bien fundamentada.',
        'Lee cada afirmación, clasifícala según su tipo (Hecho/Opinión/Interpretación), evalúa si está bien fundamentada, y justifica tu decisión en 2-3 líneas.',
        E'Desarrollar juicio crítico riguroso y evaluación sistemática de opiniones mediante la aplicación de criterios lógicos y epistemológicos. Este ejercicio entrena una habilidad fundamental del Nivel 3 de Cassany: distinguir entre hechos verificables, interpretaciones razonables y opiniones subjetivas, y evaluar la calidad de argumentos según estándares académicos.\n\nLos estudiantes aprenderán a:\n- Diferenciar entre tres categorías epistemológicas:\n  * HECHOS: Afirmaciones verificables objetivamente (ej: "Marie murió el 4 de julio de 1934")\n  * INTERPRETACIONES: Deducciones razonables basadas en evidencia pero no 100% confirmadas (ej: "Su exposición al radio contribuyó a su enfermedad")\n  * OPINIONES: Juicios de valor subjetivos sin criterios objetivos de verificación (ej: "Fue la científica más brillante del siglo XX")\n- Evaluar opiniones según 3 criterios académicos:\n  * Evidencia factual: ¿Hay datos verificables que la respalden?\n  * Coherencia lógica: ¿El razonamiento es válido?\n  * Ausencia de falacias: ¿Evita errores lógicos comunes?\n- Asignar veredictos fundamentados:\n  * Bien fundamentada ✅: Evidencia sólida + lógica válida + sin falacias\n  * Parcialmente fundamentada ⚠: Tiene evidencia pero con limitaciones o sesgos\n  * Sin fundamento ❌: Carece de evidencia, usa lógica inválida o contiene falacias\n- Justificar decisiones en 2-3 líneas con referencias específicas a evidencia\n- Aplicar el principio jerárquico: Evidencia > Opinión, Hechos > Suposiciones, Lógica > Emoción\n\nEsta habilidad es esencial para pensamiento crítico académico, evaluación de información y participación en debates intelectuales rigurosos.',
        E'Metodología para evaluar opiniones sistemáticamente:\n\n1. LECTURA Y DESCOMPOSICIÓN DE LA OPINIÓN (2 min):\n   - Leer la afirmación/opinión presentada\n   - Identificar componentes:\n     * Afirmación principal: ¿Qué se está afirmando?\n     * Evidencias explícitas: ¿Qué datos se mencionan?\n     * Argumentos implícitos: ¿Qué razonamiento subyace?\n\n2. CLASIFICACIÓN EPISTEMOLÓGICA (1 min):\n   Determinar si la afirmación es:\n   \n   HECHO (verificable objetivamente):\n   - Ejemplo: "Marie ganó 2 Premios Nobel"\n   - Criterio: ¿Hay registros históricos que lo confirmen?\n   - Veredicto probable: Bien fundamentada ✅\n   \n   INTERPRETACIÓN (deducción razonable):\n   - Ejemplo: "La radiación causó su muerte"\n   - Criterio: ¿Hay evidencia que lo sugiera fuertemente aunque no sea 100% demostrable?\n   - Veredicto probable: Bien/Parcialmente fundamentada ✅⚠\n   \n   OPINIÓN (juicio de valor):\n   - Ejemplo: "Fue la mejor científica del siglo XX"\n   - Criterio: ¿Es medible objetivamente o es preferencia subjetiva?\n   - Veredicto probable: Sin fundamento (si no define "mejor") ❌\n\n3. EVALUACIÓN SEGÚN CRITERIOS ACADÉMICOS:\n\n   CRITERIO 1 - EVIDENCIA FACTUAL:\n   - ¿Se citan datos verificables?\n   - ¿Las fuentes son confiables?\n   - ¿La evidencia es relevante?\n   \n   CRITERIO 2 - COHERENCIA LÓGICA:\n   - ¿Las conclusiones se siguen lógicamente de las premisas?\n   - ¿Hay contradicciones internas?\n   - ¿El razonamiento es válido?\n   \n   CRITERIO 3 - AUSENCIA DE FALACIAS:\n   Detectar errores comunes:\n   - Ad hominem: Atacar persona en vez de argumento\n   - Falsa dicotomía: "O Marie es heroína perfecta o es sobrevalorada" (ignora matices)\n   - Apelación a emoción: Usar lenguaje emotivo en vez de evidencia\n   - Generalización apresurada: Concluir de casos insuficientes\n   - Causa falsa: Confundir correlación con causalidad\n\n4. ASIGNACIÓN DE VEREDICTO:\n   \n   BIEN FUNDAMENTADA ✅:\n   - Evidencia sólida verificable\n   - Lógica válida\n   - Sin falacias detectables\n   - Ejemplo: "Marie fue la primera mujer en ganar un Nobel (hecho verificable en registros oficiales)"\n   \n   PARCIALMENTE FUNDAMENTADA ⚠:\n   - Tiene evidencia pero incompleta\n   - Lógica mayormente válida con algunas limitaciones\n   - Puede tener sesgos reconocidos\n   - Ejemplo: "Marie fue importante para equidad de género" (cierto pero requiere definir "importante")\n   \n   SIN FUNDAMENTO ❌:\n   - Sin evidencia verificable\n   - Lógica inválida\n   - Contiene falacias\n   - Ejemplo: "Marie solo tuvo éxito porque su esposo la ayudó" (asume sin evidencia, minimiza logros documentados)\n\n5. JUSTIFICACIÓN ESCRITA (2-3 líneas):\n   - Mencionar qué criterio se cumple o falla\n   - Citar evidencia específica\n   - Explicar brevemente el razonamiento',
        E'Estrategias para evaluar opiniones críticamente:\n\n- PRIORIZAR JERARQUÍA EPISTEMOLÓGICA: Evidencia > Opinión, Hechos > Suposiciones, Lógica > Emoción\n- BUSCAR EVIDENCIA ESPECÍFICA: "Marie ganó Nobel en 1903" > "Marie era exitosa"\n- DETECTAR LENGUAJE EMOTIVO: Palabras como "obviamente", "claramente", "sin duda" a menudo ocultan falta de evidencia\n- IDENTIFICAR TÉRMINOS VAGOS: "Importante", "mejor", "brillante" requieren definición objetiva\n- APLICAR PRINCIPIO DE CARIDAD: Interpretar argumento en su mejor versión antes de criticar\n- RECONOCER SESGOS PROPIOS: Tus preferencias pueden influir en evaluación - mantener objetividad\n- VERIFICAR FUENTES: "Según historiadores" es más creíble que "se dice que..."\n- BUSCAR CONTRAEJEMPLOS: Si la afirmación dice "siempre", un solo contraejemplo la refuta\n- EVALUAR RELEVANCIA: Evidencia verdadera puede ser irrelevante para conclusión\n- ADMITIR INCERTIDUMBRE: "Parcialmente fundamentada" es a veces la respuesta más honesta\n\nTRAMPAS COMUNES A EVITAR:\n- Confundir "me gusta esta opinión" con "está bien fundamentada"\n- Rechazar opinión solo porque tiene sesgos (todos las tenemos)\n- Exigir evidencia perfecta (interpretaciones razonables son válidas)\n- Aceptar cualquier evidencia sin evaluar su calidad',
        E'Este ejercicio desarrolla pensamiento crítico epistemológico, una competencia central del Nivel 3 de Cassany (Comprensión Crítica y Valorativa). A diferencia de ejercicios previos que entrenan emitir juicios, este entrena EVALUAR juicios de otros según estándares académicos rigurosos.\n\nHabilidades metacognitivas desarrolladas:\n- Razonamiento lógico formal (identificar validez de argumentos)\n- Consciencia epistemológica (comprender diferencia entre hechos, interpretaciones, opiniones)\n- Detección de falacias (reconocer errores lógicos comunes)\n- Juicio matizado (usar categoría "parcialmente fundamentada" cuando apropiado)\n- Justificación explícita (articular por qué una opinión es válida/inválida)\n\nAlineación con Cassany (Nivel 3):\n- Evalúa calidad de argumentos (no solo comprenderlos)\n- Identifica falacias y sesgos en textos\n- Distingue entre niveles de certeza epistémica\n- Practica razonamiento lógico riguroso\n\nDificultad: Avanzada (CEFR: B2-C1). Requiere:\n- Comprensión de lógica formal básica\n- Conocimiento de falacias comunes\n- Capacidad de separar acuerdo personal de evaluación objetiva\n- Tolerancia a ambigüedad (reconocer que "parcialmente fundamentada" es legítimo)\n\nRelevancia contemporánea:\nEn la era de desinformación masiva y "posverdad", esta habilidad es crítica para:\n- Evaluar afirmaciones políticas y mediáticas\n- Distinguir noticias reales de fake news\n- Participar en debates académicos rigurosos\n- Tomar decisiones informadas sobre información contradictoria\n- Ejercer ciudadanía crítica\n\nDiferencia clave con otros ejercicios:\n- Análisis de Fuentes (3.1): Evalúa CONFIABILIDAD de fuentes\n- Tribunal de Opiniones (3.5): Evalúa VALIDEZ LÓGICA de argumentos\n\nEl formato de "tribunal" (juzgar con veredicto) hace el ejercicio más atractivo que análisis abstracto, mientras mantiene rigor académico mediante criterios explícitos. La justificación escrita obligatoria asegura que estudiantes no solo intuyen sino que articulan explícitamente su razonamiento.',
        'tribunal_opiniones', 1,  -- order_index 1 per doc v6.3
        '{
            "dragAndDrop": true,
            "requireJustification": true,
            "showStatementTypes": true
        }'::jsonb,
        '{
            "statements": [
                {
                    "id": "stmt-1",
                    "text": "Marie Curie murió el 4 de julio de 1934 a causa de anemia aplásica.",
                    "context": "Información sobre la muerte de Marie Curie"
                },
                {
                    "id": "stmt-2",
                    "text": "Marie Curie fue la científica más brillante del siglo XX.",
                    "context": "Valoración de la carrera de Marie Curie"
                },
                {
                    "id": "stmt-3",
                    "text": "La exposición prolongada al radio contribuyó a la enfermedad que causó la muerte de Marie Curie.",
                    "context": "Relación entre su trabajo y su salud"
                },
                {
                    "id": "stmt-4",
                    "text": "Marie Curie ganó dos Premios Nobel: uno en Física (1903) y otro en Química (1911).",
                    "context": "Reconocimientos de Marie Curie"
                },
                {
                    "id": "stmt-5",
                    "text": "Pierre Curie merecía más crédito que Marie por el descubrimiento del radio.",
                    "context": "Debate sobre contribuciones científicas"
                },
                {
                    "id": "stmt-6",
                    "text": "Si Marie Curie no hubiera emigrado a Francia, probablemente no habría logrado sus descubrimientos.",
                    "context": "Impacto de las circunstancias en su carrera"
                },
                {
                    "id": "stmt-7",
                    "text": "Marie Curie fue la primera mujer en recibir un Premio Nobel.",
                    "context": "Logros históricos de Marie Curie"
                },
                {
                    "id": "stmt-8",
                    "text": "La decisión de Marie de no patentar el proceso de aislamiento del radio fue ingenua e irresponsable.",
                    "context": "Evaluación de sus decisiones profesionales"
                }
            ],
            "statementTypes": [
                {"id": "hecho", "name": "HECHO", "icon": "📋", "description": "Dato verificable objetivamente con registros históricos"},
                {"id": "opinion", "name": "OPINIÓN", "icon": "💭", "description": "Juicio de valor subjetivo, no medible objetivamente"},
                {"id": "interpretacion", "name": "INTERPRETACIÓN", "icon": "🔍", "description": "Deducción basada en evidencia, no confirmada definitivamente"}
            ],
            "verdicts": [
                {"id": "bien-fundamentada", "name": "Bien fundamentada", "icon": "✅", "description": "Evidencia sólida verificable, lógica válida, sin falacias"},
                {"id": "parcialmente-fundamentada", "name": "Parcialmente fundamentada", "icon": "⚠️", "description": "Tiene evidencia pero incompleta, o con sesgos reconocidos"},
                {"id": "sin-fundamento", "name": "Sin fundamento", "icon": "❌", "description": "Sin evidencia verificable, lógica inválida, o contiene falacias"}
            ],
            "evaluationCriteria": {
                "evidencia": "¿Tiene evidencia factual verificable?",
                "logica": "¿Es lógicamente coherente?",
                "falacias": "¿Evita falacias argumentativas?"
            }
        }'::jsonb,
        '{
            "correctAnswers": {
                "stmt-1": {"type": "hecho", "verdict": "bien-fundamentada", "explanation": "Dato histórico verificable en registros oficiales de defunción y médicos."},
                "stmt-2": {"type": "opinion", "verdict": "sin-fundamento", "explanation": "Juicio de valor subjetivo. Más brillante no es medible objetivamente y depende de criterios personales."},
                "stmt-3": {"type": "interpretacion", "verdict": "bien-fundamentada", "explanation": "Deducción razonable basada en evidencia médica. Su anemia aplásica es consistente con exposición prolongada a radiación."},
                "stmt-4": {"type": "hecho", "verdict": "bien-fundamentada", "explanation": "Dato verificable en registros oficiales de la Fundación Nobel."},
                "stmt-5": {"type": "opinion", "verdict": "sin-fundamento", "explanation": "Opinión sin evidencia que la respalde. Los registros muestran contribuciones iguales o superiores de Marie."},
                "stmt-6": {"type": "interpretacion", "verdict": "parcialmente-fundamentada", "explanation": "Interpretación con algo de base (Francia ofrecía mejores oportunidades), pero especulativa sobre alternativas."},
                "stmt-7": {"type": "hecho", "verdict": "bien-fundamentada", "explanation": "Dato histórico verificable. Marie recibió el Nobel de Física en 1903, siendo la primera mujer."},
                "stmt-8": {"type": "opinion", "verdict": "sin-fundamento", "explanation": "Juicio de valor con lenguaje peyorativo (ingenua, irresponsable). Su decisión fue ética y deliberada."}
            },
            "scoring": {"correctType": 5, "correctVerdict": 10, "goodJustification": 5, "pointsPerStatement": 20, "totalStatements": 8, "maxPoints": 160},
            "validation": {"minJustificationLength": 30, "maxJustificationLength": 200, "requireBothTypeAndVerdict": true}
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
