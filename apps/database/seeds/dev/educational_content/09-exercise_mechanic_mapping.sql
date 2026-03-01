-- ============================================================================
-- SEED: exercise_mechanic_mapping
-- Schema: educational_content
-- Descripcion: Mapeos entre categorias pedagogicas y exercise_types GAMILIT
-- Relacionado: ADR-008 (Sistema Dual)
-- Total registros: 54 mappings (2 mappings por exercise_type promedio)
-- Actualizado: 2026-02-03 (GAP-002 - Completar seeds faltantes)
-- ============================================================================

-- ============================================================================
-- MODULO 1: COMPRENSION LITERAL (7 exercise_types)
-- ============================================================================

-- crucigrama: vocabulario + recordar
INSERT INTO educational_content.exercise_mechanic_mappings (
    mechanic_category, mechanic_subcategory, exercise_type,
    bloom_level, cefr_level, pedagogical_purpose, learning_objectives,
    interaction_type, cognitive_load, tags
) VALUES
(
    'vocabulario',
    'word_search',
    'crucigrama',
    'recordar',
    ARRAY['beginner', 'intermediate']::educational_content.difficulty_level[],
    'Reforzar vocabulario mediante juego de palabras cruzadas con definiciones',
    ARRAY['Identificar palabras clave', 'Asociar terminos con definiciones', 'Memorizar vocabulario tematico'],
    'text_input',
    'bajo',
    ARRAY['juego', 'individual', 'visual']
),
(
    'lectura',
    'reading_comprehension',
    'crucigrama',
    'comprender',
    ARRAY['beginner']::educational_content.difficulty_level[],
    'Desarrollar comprension literal mediante lectura de definiciones',
    ARRAY['Leer y comprender definiciones cortas', 'Extraer informacion explicita'],
    'text_input',
    'bajo',
    ARRAY['lectura', 'individual']
) ON CONFLICT (mechanic_subcategory, exercise_type) DO UPDATE SET
    mechanic_category = EXCLUDED.mechanic_category,
    bloom_level = EXCLUDED.bloom_level,
    cefr_level = EXCLUDED.cefr_level,
    pedagogical_purpose = EXCLUDED.pedagogical_purpose,
    learning_objectives = EXCLUDED.learning_objectives,
    interaction_type = EXCLUDED.interaction_type,
    cognitive_load = EXCLUDED.cognitive_load,
    tags = EXCLUDED.tags;

-- sopa_letras: vocabulario + recordar
INSERT INTO educational_content.exercise_mechanic_mappings (
    mechanic_category, mechanic_subcategory, exercise_type,
    bloom_level, cefr_level, pedagogical_purpose, learning_objectives,
    interaction_type, cognitive_load, tags
) VALUES
(
    'vocabulario',
    'word_search',
    'sopa_letras',
    'recordar',
    ARRAY['beginner']::educational_content.difficulty_level[],
    'Identificar palabras clave en contexto visual mediante busqueda activa',
    ARRAY['Reconocer palabras objetivo', 'Discriminacion visual de terminos', 'Reforzar ortografia'],
    'selection',
    'bajo',
    ARRAY['juego', 'individual', 'visual', 'rapido']
),
(
    'lectura',
    'word_recognition',
    'sopa_letras',
    'recordar',
    ARRAY['beginner']::educational_content.difficulty_level[],
    'Desarrollar reconocimiento rapido de palabras',
    ARRAY['Identificar palabras en contexto visual', 'Velocidad de lectura'],
    'selection',
    'bajo',
    ARRAY['velocidad', 'individual']
) ON CONFLICT (mechanic_subcategory, exercise_type) DO UPDATE SET
    mechanic_category = EXCLUDED.mechanic_category,
    bloom_level = EXCLUDED.bloom_level,
    cefr_level = EXCLUDED.cefr_level,
    pedagogical_purpose = EXCLUDED.pedagogical_purpose,
    learning_objectives = EXCLUDED.learning_objectives,
    interaction_type = EXCLUDED.interaction_type,
    cognitive_load = EXCLUDED.cognitive_load,
    tags = EXCLUDED.tags;

-- linea_tiempo: lectura + comprender
INSERT INTO educational_content.exercise_mechanic_mappings (
    mechanic_category, mechanic_subcategory, exercise_type,
    bloom_level, cefr_level, pedagogical_purpose, learning_objectives,
    interaction_type, cognitive_load, tags
) VALUES
(
    'lectura',
    'sequencing',
    'linea_tiempo',
    'comprender',
    ARRAY['intermediate']::educational_content.difficulty_level[],
    'Organizar eventos cronologicamente para desarrollar comprension de secuencias',
    ARRAY['Identificar orden cronologico', 'Comprender relaciones temporales', 'Secuenciar eventos'],
    'drag_drop',
    'medio',
    ARRAY['cronologia', 'secuencia', 'visual', 'interactivo']
),
(
    'cultura',
    'historical_context',
    'linea_tiempo',
    'analizar',
    ARRAY['intermediate', 'advanced']::educational_content.difficulty_level[],
    'Analizar contexto historico y relaciones causa-efecto',
    ARRAY['Relacionar eventos historicos', 'Comprender contexto cultural'],
    'drag_drop',
    'medio',
    ARRAY['historia', 'contexto']
) ON CONFLICT (mechanic_subcategory, exercise_type) DO UPDATE SET
    mechanic_category = EXCLUDED.mechanic_category,
    bloom_level = EXCLUDED.bloom_level,
    cefr_level = EXCLUDED.cefr_level,
    pedagogical_purpose = EXCLUDED.pedagogical_purpose,
    learning_objectives = EXCLUDED.learning_objectives,
    interaction_type = EXCLUDED.interaction_type,
    cognitive_load = EXCLUDED.cognitive_load,
    tags = EXCLUDED.tags;

-- mapa_conceptual: lectura + analizar
INSERT INTO educational_content.exercise_mechanic_mappings (
    mechanic_category, mechanic_subcategory, exercise_type,
    bloom_level, cefr_level, pedagogical_purpose, learning_objectives,
    interaction_type, cognitive_load, tags
) VALUES
(
    'lectura',
    'concept_mapping',
    'mapa_conceptual',
    'analizar',
    ARRAY['intermediate', 'advanced']::educational_content.difficulty_level[],
    'Visualizar y organizar relaciones entre conceptos para analisis profundo',
    ARRAY['Identificar relaciones conceptuales', 'Organizar informacion jerarquicamente', 'Sintetizar conocimiento'],
    'drag_drop',
    'alto',
    ARRAY['analisis', 'visual', 'jerarquico', 'colaborativo']
),
(
    'escritura',
    'organization',
    'mapa_conceptual',
    'crear',
    ARRAY['advanced']::educational_content.difficulty_level[],
    'Crear estructuras conceptuales para organizar ideas antes de escribir',
    ARRAY['Planificar escritura', 'Organizar ideas', 'Estructurar argumentos'],
    'drag_drop',
    'alto',
    ARRAY['planificacion', 'organizacion']
) ON CONFLICT (mechanic_subcategory, exercise_type) DO UPDATE SET
    mechanic_category = EXCLUDED.mechanic_category,
    bloom_level = EXCLUDED.bloom_level,
    cefr_level = EXCLUDED.cefr_level,
    pedagogical_purpose = EXCLUDED.pedagogical_purpose,
    learning_objectives = EXCLUDED.learning_objectives,
    interaction_type = EXCLUDED.interaction_type,
    cognitive_load = EXCLUDED.cognitive_load,
    tags = EXCLUDED.tags;

-- emparejamiento: vocabulario + comprender
INSERT INTO educational_content.exercise_mechanic_mappings (
    mechanic_category, mechanic_subcategory, exercise_type,
    bloom_level, cefr_level, pedagogical_purpose, learning_objectives,
    interaction_type, cognitive_load, tags
) VALUES
(
    'vocabulario',
    'matching',
    'emparejamiento',
    'comprender',
    ARRAY['beginner', 'intermediate']::educational_content.difficulty_level[],
    'Asociar terminos con sus significados o conceptos relacionados',
    ARRAY['Relacionar terminos', 'Comprender equivalencias', 'Memorizar asociaciones'],
    'drag_drop',
    'bajo',
    ARRAY['asociacion', 'interactivo', 'visual']
),
(
    'lectura',
    'text_matching',
    'emparejamiento',
    'comprender',
    ARRAY['beginner']::educational_content.difficulty_level[],
    'Relacionar fragmentos de texto con sus interpretaciones',
    ARRAY['Comprender relaciones texto-significado', 'Identificar equivalencias'],
    'drag_drop',
    'bajo',
    ARRAY['comprension', 'relacion']
) ON CONFLICT (mechanic_subcategory, exercise_type) DO UPDATE SET
    mechanic_category = EXCLUDED.mechanic_category,
    bloom_level = EXCLUDED.bloom_level,
    cefr_level = EXCLUDED.cefr_level,
    pedagogical_purpose = EXCLUDED.pedagogical_purpose,
    learning_objectives = EXCLUDED.learning_objectives,
    interaction_type = EXCLUDED.interaction_type,
    cognitive_load = EXCLUDED.cognitive_load,
    tags = EXCLUDED.tags;

-- completar_espacios: lectura + comprender
INSERT INTO educational_content.exercise_mechanic_mappings (
    mechanic_category, mechanic_subcategory, exercise_type,
    bloom_level, cefr_level, pedagogical_purpose, learning_objectives,
    interaction_type, cognitive_load, tags
) VALUES
(
    'lectura',
    'fill_in_blank',
    'completar_espacios',
    'comprender',
    ARRAY['beginner', 'intermediate']::educational_content.difficulty_level[],
    'Demostrar comprension completando informacion faltante en textos',
    ARRAY['Completar informacion', 'Comprension contextual', 'Vocabulario en contexto'],
    'text_input',
    'medio',
    ARRAY['comprension', 'vocabulario', 'contexto']
),
(
    'vocabulario',
    'cloze_test',
    'completar_espacios',
    'aplicar',
    ARRAY['intermediate']::educational_content.difficulty_level[],
    'Aplicar conocimiento de vocabulario en contextos especificos',
    ARRAY['Usar vocabulario apropiado', 'Contexto linguistico'],
    'text_input',
    'medio',
    ARRAY['cloze', 'vocabulario']
) ON CONFLICT (mechanic_subcategory, exercise_type) DO UPDATE SET
    mechanic_category = EXCLUDED.mechanic_category,
    bloom_level = EXCLUDED.bloom_level,
    cefr_level = EXCLUDED.cefr_level,
    pedagogical_purpose = EXCLUDED.pedagogical_purpose,
    learning_objectives = EXCLUDED.learning_objectives,
    interaction_type = EXCLUDED.interaction_type,
    cognitive_load = EXCLUDED.cognitive_load,
    tags = EXCLUDED.tags;

-- verdadero_falso: lectura + recordar
INSERT INTO educational_content.exercise_mechanic_mappings (
    mechanic_category, mechanic_subcategory, exercise_type,
    bloom_level, cefr_level, pedagogical_purpose, learning_objectives,
    interaction_type, cognitive_load, tags
) VALUES
(
    'lectura',
    'true_false',
    'verdadero_falso',
    'recordar',
    ARRAY['beginner']::educational_content.difficulty_level[],
    'Verificar comprension basica de informacion explicita',
    ARRAY['Identificar informacion correcta', 'Verificar datos', 'Comprension literal'],
    'selection',
    'bajo',
    ARRAY['rapido', 'verificacion', 'beginner']
) ON CONFLICT (mechanic_subcategory, exercise_type) DO UPDATE SET
    mechanic_category = EXCLUDED.mechanic_category,
    bloom_level = EXCLUDED.bloom_level,
    cefr_level = EXCLUDED.cefr_level,
    pedagogical_purpose = EXCLUDED.pedagogical_purpose,
    learning_objectives = EXCLUDED.learning_objectives,
    interaction_type = EXCLUDED.interaction_type,
    cognitive_load = EXCLUDED.cognitive_load,
    tags = EXCLUDED.tags;

-- ============================================================================
-- MODULO 2: COMPRENSION INFERENCIAL (5 exercise_types)
-- ============================================================================

-- detective_textual: lectura + analizar
INSERT INTO educational_content.exercise_mechanic_mappings (
    mechanic_category, mechanic_subcategory, exercise_type,
    bloom_level, cefr_level, pedagogical_purpose, learning_objectives,
    interaction_type, cognitive_load, tags
) VALUES
(
    'lectura',
    'inference',
    'detective_textual',
    'analizar',
    ARRAY['intermediate', 'advanced']::educational_content.difficulty_level[],
    'Desarrollar comprension inferencial mediante analisis de pistas textuales',
    ARRAY['Inferir informacion implicita', 'Analizar evidencias textuales', 'Deducir conclusiones'],
    'selection',
    'alto',
    ARRAY['inferencia', 'deduccion', 'analisis', 'investigacion']
),
(
    'escritura',
    'analytical_writing',
    'detective_textual',
    'evaluar',
    ARRAY['advanced']::educational_content.difficulty_level[],
    'Justificar inferencias con evidencia textual mediante escritura analitica',
    ARRAY['Argumentar con evidencias', 'Escribir analisis fundamentado'],
    'text_input',
    'alto',
    ARRAY['argumentacion', 'evidencia']
) ON CONFLICT (mechanic_subcategory, exercise_type) DO UPDATE SET
    mechanic_category = EXCLUDED.mechanic_category,
    bloom_level = EXCLUDED.bloom_level,
    cefr_level = EXCLUDED.cefr_level,
    pedagogical_purpose = EXCLUDED.pedagogical_purpose,
    learning_objectives = EXCLUDED.learning_objectives,
    interaction_type = EXCLUDED.interaction_type,
    cognitive_load = EXCLUDED.cognitive_load,
    tags = EXCLUDED.tags;

-- construccion_hipotesis: lectura + crear
INSERT INTO educational_content.exercise_mechanic_mappings (
    mechanic_category, mechanic_subcategory, exercise_type,
    bloom_level, cefr_level, pedagogical_purpose, learning_objectives,
    interaction_type, cognitive_load, tags
) VALUES
(
    'lectura',
    'hypothesis_building',
    'construccion_hipotesis',
    'crear',
    ARRAY['advanced', 'proficient']::educational_content.difficulty_level[],
    'Formular hipotesis basadas en informacion textual parcial',
    ARRAY['Generar hipotesis', 'Predecir informacion', 'Razonamiento inductivo'],
    'text_input',
    'alto',
    ARRAY['hipotesis', 'prediccion', 'cientifico']
),
(
    'escritura',
    'hypothesis_formulation',
    'construccion_hipotesis',
    'crear',
    ARRAY['advanced']::educational_content.difficulty_level[],
    'Escribir hipotesis coherentes y fundamentadas',
    ARRAY['Redactar hipotesis', 'Justificar predicciones por escrito'],
    'text_input',
    'alto',
    ARRAY['redaccion', 'cientifica']
) ON CONFLICT (mechanic_subcategory, exercise_type) DO UPDATE SET
    mechanic_category = EXCLUDED.mechanic_category,
    bloom_level = EXCLUDED.bloom_level,
    cefr_level = EXCLUDED.cefr_level,
    pedagogical_purpose = EXCLUDED.pedagogical_purpose,
    learning_objectives = EXCLUDED.learning_objectives,
    interaction_type = EXCLUDED.interaction_type,
    cognitive_load = EXCLUDED.cognitive_load,
    tags = EXCLUDED.tags;

-- prediccion_narrativa: lectura + evaluar
INSERT INTO educational_content.exercise_mechanic_mappings (
    mechanic_category, mechanic_subcategory, exercise_type,
    bloom_level, cefr_level, pedagogical_purpose, learning_objectives,
    interaction_type, cognitive_load, tags
) VALUES
(
    'lectura',
    'prediction',
    'prediccion_narrativa',
    'evaluar',
    ARRAY['intermediate', 'advanced']::educational_content.difficulty_level[],
    'Anticipar desarrollos narrativos basandose en pistas del texto',
    ARRAY['Predecir eventos', 'Comprender estructuras narrativas', 'Evaluar coherencia'],
    'selection',
    'medio',
    ARRAY['prediccion', 'narrativa', 'anticipacion']
),
(
    'escritura',
    'creative_writing',
    'prediccion_narrativa',
    'crear',
    ARRAY['advanced']::educational_content.difficulty_level[],
    'Crear continuaciones narrativas coherentes',
    ARRAY['Escribir continuaciones', 'Mantener coherencia narrativa'],
    'text_input',
    'alto',
    ARRAY['creatividad', 'narrativa']
) ON CONFLICT (mechanic_subcategory, exercise_type) DO UPDATE SET
    mechanic_category = EXCLUDED.mechanic_category,
    bloom_level = EXCLUDED.bloom_level,
    cefr_level = EXCLUDED.cefr_level,
    pedagogical_purpose = EXCLUDED.pedagogical_purpose,
    learning_objectives = EXCLUDED.learning_objectives,
    interaction_type = EXCLUDED.interaction_type,
    cognitive_load = EXCLUDED.cognitive_load,
    tags = EXCLUDED.tags;

-- puzzle_contexto: lectura + analizar
INSERT INTO educational_content.exercise_mechanic_mappings (
    mechanic_category, mechanic_subcategory, exercise_type,
    bloom_level, cefr_level, pedagogical_purpose, learning_objectives,
    interaction_type, cognitive_load, tags
) VALUES
(
    'lectura',
    'contextual_understanding',
    'puzzle_contexto',
    'analizar',
    ARRAY['intermediate']::educational_content.difficulty_level[],
    'Reconstruir significado mediante analisis de contexto fragmentado',
    ARRAY['Comprender contexto', 'Relacionar fragmentos', 'Reconstruir significado'],
    'drag_drop',
    'medio',
    ARRAY['contexto', 'reconstruccion', 'puzzle']
),
(
    'vocabulario',
    'contextual_clues',
    'puzzle_contexto',
    'aplicar',
    ARRAY['intermediate']::educational_content.difficulty_level[],
    'Inferir significados de palabras mediante pistas contextuales',
    ARRAY['Usar pistas contextuales', 'Inferir vocabulario'],
    'selection',
    'medio',
    ARRAY['vocabulario', 'contexto']
) ON CONFLICT (mechanic_subcategory, exercise_type) DO UPDATE SET
    mechanic_category = EXCLUDED.mechanic_category,
    bloom_level = EXCLUDED.bloom_level,
    cefr_level = EXCLUDED.cefr_level,
    pedagogical_purpose = EXCLUDED.pedagogical_purpose,
    learning_objectives = EXCLUDED.learning_objectives,
    interaction_type = EXCLUDED.interaction_type,
    cognitive_load = EXCLUDED.cognitive_load,
    tags = EXCLUDED.tags;

-- rueda_inferencias: lectura + analizar (NUEVO - GAP-002)
INSERT INTO educational_content.exercise_mechanic_mappings (
    mechanic_category, mechanic_subcategory, exercise_type,
    bloom_level, cefr_level, pedagogical_purpose, learning_objectives,
    interaction_type, cognitive_load, tags
) VALUES
(
    'lectura',
    'inference_wheel',
    'rueda_inferencias',
    'analizar',
    ARRAY['intermediate', 'advanced']::educational_content.difficulty_level[],
    'Desarrollar pensamiento inferencial mediante conexiones radiales entre conceptos',
    ARRAY['Conectar ideas centrales con inferencias', 'Visualizar relaciones implicitas', 'Justificar deducciones'],
    'drag_drop',
    'alto',
    ARRAY['inferencia', 'visual', 'radial', 'interactivo']
),
(
    'escritura',
    'inference_justification',
    'rueda_inferencias',
    'evaluar',
    ARRAY['advanced']::educational_content.difficulty_level[],
    'Escribir justificaciones para cada inferencia realizada',
    ARRAY['Redactar justificaciones', 'Argumentar inferencias', 'Fundamentar deducciones'],
    'text_input',
    'alto',
    ARRAY['justificacion', 'argumentacion']
) ON CONFLICT (mechanic_subcategory, exercise_type) DO UPDATE SET
    mechanic_category = EXCLUDED.mechanic_category,
    bloom_level = EXCLUDED.bloom_level,
    cefr_level = EXCLUDED.cefr_level,
    pedagogical_purpose = EXCLUDED.pedagogical_purpose,
    learning_objectives = EXCLUDED.learning_objectives,
    interaction_type = EXCLUDED.interaction_type,
    cognitive_load = EXCLUDED.cognitive_load,
    tags = EXCLUDED.tags;

-- ============================================================================
-- MODULO 3: COMPRENSION CRITICA (5 exercise_types)
-- ============================================================================

-- analisis_fuentes: lectura + evaluar
INSERT INTO educational_content.exercise_mechanic_mappings (
    mechanic_category, mechanic_subcategory, exercise_type,
    bloom_level, cefr_level, pedagogical_purpose, learning_objectives,
    interaction_type, cognitive_load, tags
) VALUES
(
    'lectura',
    'critical_analysis',
    'analisis_fuentes',
    'evaluar',
    ARRAY['advanced', 'proficient']::educational_content.difficulty_level[],
    'Analizar criticamente textos historicos y culturales evaluando credibilidad',
    ARRAY['Evaluar fuentes', 'Identificar sesgos', 'Analisis critico de textos'],
    'text_input',
    'alto',
    ARRAY['critico', 'fuentes', 'academico', 'historia']
),
(
    'cultura',
    'cultural_context',
    'analisis_fuentes',
    'analizar',
    ARRAY['advanced']::educational_content.difficulty_level[],
    'Comprender contexto cultural e historico de documentos',
    ARRAY['Analizar contexto cultural', 'Comprender perspectiva historica'],
    'text_input',
    'alto',
    ARRAY['cultura', 'historia', 'contexto']
) ON CONFLICT (mechanic_subcategory, exercise_type) DO UPDATE SET
    mechanic_category = EXCLUDED.mechanic_category,
    bloom_level = EXCLUDED.bloom_level,
    cefr_level = EXCLUDED.cefr_level,
    pedagogical_purpose = EXCLUDED.pedagogical_purpose,
    learning_objectives = EXCLUDED.learning_objectives,
    interaction_type = EXCLUDED.interaction_type,
    cognitive_load = EXCLUDED.cognitive_load,
    tags = EXCLUDED.tags;

-- debate_digital: escritura + evaluar
INSERT INTO educational_content.exercise_mechanic_mappings (
    mechanic_category, mechanic_subcategory, exercise_type,
    bloom_level, cefr_level, pedagogical_purpose, learning_objectives,
    interaction_type, cognitive_load, tags
) VALUES
(
    'escritura',
    'argumentative_writing',
    'debate_digital',
    'evaluar',
    ARRAY['advanced', 'proficient']::educational_content.difficulty_level[],
    'Desarrollar argumentacion escrita en contexto de debate colaborativo',
    ARRAY['Argumentar por escrito', 'Contra-argumentar', 'Defender posiciones'],
    'text_input',
    'alto',
    ARRAY['debate', 'argumentacion', 'colaborativo', 'sincrono']
),
(
    'lectura',
    'critical_reading',
    'debate_digital',
    'evaluar',
    ARRAY['advanced']::educational_content.difficulty_level[],
    'Leer criticamente argumentos de otros para responder efectivamente',
    ARRAY['Evaluar argumentos ajenos', 'Identificar falacias'],
    'text_input',
    'alto',
    ARRAY['critico', 'evaluacion']
) ON CONFLICT (mechanic_subcategory, exercise_type) DO UPDATE SET
    mechanic_category = EXCLUDED.mechanic_category,
    bloom_level = EXCLUDED.bloom_level,
    cefr_level = EXCLUDED.cefr_level,
    pedagogical_purpose = EXCLUDED.pedagogical_purpose,
    learning_objectives = EXCLUDED.learning_objectives,
    interaction_type = EXCLUDED.interaction_type,
    cognitive_load = EXCLUDED.cognitive_load,
    tags = EXCLUDED.tags;

-- matriz_perspectivas: lectura + analizar
INSERT INTO educational_content.exercise_mechanic_mappings (
    mechanic_category, mechanic_subcategory, exercise_type,
    bloom_level, cefr_level, pedagogical_purpose, learning_objectives,
    interaction_type, cognitive_load, tags
) VALUES
(
    'lectura',
    'multiple_perspectives',
    'matriz_perspectivas',
    'analizar',
    ARRAY['advanced']::educational_content.difficulty_level[],
    'Comparar multiples perspectivas sobre un mismo tema o evento',
    ARRAY['Identificar diferentes perspectivas', 'Comparar puntos de vista', 'Analisis multiperspectiva'],
    'selection',
    'alto',
    ARRAY['perspectivas', 'comparacion', 'analisis', 'visual']
),
(
    'cultura',
    'cultural_perspectives',
    'matriz_perspectivas',
    'evaluar',
    ARRAY['advanced', 'proficient']::educational_content.difficulty_level[],
    'Evaluar perspectivas culturales diversas sobre temas complejos',
    ARRAY['Comprender diversidad cultural', 'Evaluar perspectivas culturales'],
    'selection',
    'alto',
    ARRAY['cultura', 'diversidad', 'perspectivas']
) ON CONFLICT (mechanic_subcategory, exercise_type) DO UPDATE SET
    mechanic_category = EXCLUDED.mechanic_category,
    bloom_level = EXCLUDED.bloom_level,
    cefr_level = EXCLUDED.cefr_level,
    pedagogical_purpose = EXCLUDED.pedagogical_purpose,
    learning_objectives = EXCLUDED.learning_objectives,
    interaction_type = EXCLUDED.interaction_type,
    cognitive_load = EXCLUDED.cognitive_load,
    tags = EXCLUDED.tags;

-- podcast_argumentativo: escritura + crear
INSERT INTO educational_content.exercise_mechanic_mappings (
    mechanic_category, mechanic_subcategory, exercise_type,
    bloom_level, cefr_level, pedagogical_purpose, learning_objectives,
    interaction_type, cognitive_load, tags
) VALUES
(
    'escritura',
    'script_writing',
    'podcast_argumentativo',
    'crear',
    ARRAY['advanced', 'proficient']::educational_content.difficulty_level[],
    'Crear guiones argumentativos para comunicacion oral efectiva',
    ARRAY['Redactar guiones', 'Estructurar argumentos orales', 'Planificar discurso'],
    'text_input',
    'alto',
    ARRAY['guion', 'argumentacion', 'oral', 'multimedia']
),
(
    'audio',
    'oral_presentation',
    'podcast_argumentativo',
    'crear',
    ARRAY['advanced']::educational_content.difficulty_level[],
    'Desarrollar habilidades de presentacion oral argumentativa',
    ARRAY['Grabar argumentos', 'Comunicacion oral efectiva'],
    'audio_recording',
    'alto',
    ARRAY['audio', 'oral', 'presentacion']
) ON CONFLICT (mechanic_subcategory, exercise_type) DO UPDATE SET
    mechanic_category = EXCLUDED.mechanic_category,
    bloom_level = EXCLUDED.bloom_level,
    cefr_level = EXCLUDED.cefr_level,
    pedagogical_purpose = EXCLUDED.pedagogical_purpose,
    learning_objectives = EXCLUDED.learning_objectives,
    interaction_type = EXCLUDED.interaction_type,
    cognitive_load = EXCLUDED.cognitive_load,
    tags = EXCLUDED.tags;

-- tribunal_opiniones: lectura + evaluar
INSERT INTO educational_content.exercise_mechanic_mappings (
    mechanic_category, mechanic_subcategory, exercise_type,
    bloom_level, cefr_level, pedagogical_purpose, learning_objectives,
    interaction_type, cognitive_load, tags
) VALUES
(
    'lectura',
    'evaluative_reading',
    'tribunal_opiniones',
    'evaluar',
    ARRAY['advanced', 'proficient']::educational_content.difficulty_level[],
    'Evaluar opiniones y posiciones mediante analisis critico de perspectivas',
    ARRAY['Evaluar argumentos', 'Juzgar validez de posiciones', 'Pensamiento critico'],
    'selection',
    'alto',
    ARRAY['evaluacion', 'critico', 'perspectivas', 'jurado']
),
(
    'cultura',
    'ethical_analysis',
    'tribunal_opiniones',
    'evaluar',
    ARRAY['advanced']::educational_content.difficulty_level[],
    'Analizar dimensiones eticas y culturales de posiciones diversas',
    ARRAY['Analizar implicaciones eticas', 'Evaluar posiciones culturales'],
    'selection',
    'alto',
    ARRAY['etica', 'cultura', 'valores']
) ON CONFLICT (mechanic_subcategory, exercise_type) DO UPDATE SET
    mechanic_category = EXCLUDED.mechanic_category,
    bloom_level = EXCLUDED.bloom_level,
    cefr_level = EXCLUDED.cefr_level,
    pedagogical_purpose = EXCLUDED.pedagogical_purpose,
    learning_objectives = EXCLUDED.learning_objectives,
    interaction_type = EXCLUDED.interaction_type,
    cognitive_load = EXCLUDED.cognitive_load,
    tags = EXCLUDED.tags;

-- ============================================================================
-- MODULO 4: LITERACIDADES DIGITALES (9 exercise_types)
-- ============================================================================

-- analisis_memes: cultura + analizar
INSERT INTO educational_content.exercise_mechanic_mappings (
    mechanic_category, mechanic_subcategory, exercise_type,
    bloom_level, cefr_level, pedagogical_purpose, learning_objectives,
    interaction_type, cognitive_load, tags
) VALUES
(
    'cultura',
    'digital_culture',
    'analisis_memes',
    'analizar',
    ARRAY['intermediate', 'advanced']::educational_content.difficulty_level[],
    'Analizar significados culturales y referencias en contenido digital multimodal',
    ARRAY['Interpretar memes', 'Comprender referencias culturales digitales', 'Analisis semiotico'],
    'selection',
    'medio',
    ARRAY['memes', 'digital', 'cultura', 'multimodal', 'visual']
),
(
    'lectura',
    'multimodal_reading',
    'analisis_memes',
    'comprender',
    ARRAY['intermediate']::educational_content.difficulty_level[],
    'Desarrollar literacidad multimodal mediante lectura de imagen+texto',
    ARRAY['Leer textos multimodales', 'Integrar informacion visual y textual'],
    'selection',
    'medio',
    ARRAY['multimodal', 'visual', 'digital']
) ON CONFLICT (mechanic_subcategory, exercise_type) DO UPDATE SET
    mechanic_category = EXCLUDED.mechanic_category,
    bloom_level = EXCLUDED.bloom_level,
    cefr_level = EXCLUDED.cefr_level,
    pedagogical_purpose = EXCLUDED.pedagogical_purpose,
    learning_objectives = EXCLUDED.learning_objectives,
    interaction_type = EXCLUDED.interaction_type,
    cognitive_load = EXCLUDED.cognitive_load,
    tags = EXCLUDED.tags;

-- chat_literario: escritura + aplicar
INSERT INTO educational_content.exercise_mechanic_mappings (
    mechanic_category, mechanic_subcategory, exercise_type,
    bloom_level, cefr_level, pedagogical_purpose, learning_objectives,
    interaction_type, cognitive_load, tags
) VALUES
(
    'escritura',
    'informal_writing',
    'chat_literario',
    'aplicar',
    ARRAY['intermediate', 'advanced']::educational_content.difficulty_level[],
    'Aplicar conocimientos literarios en formato de comunicacion digital informal',
    ARRAY['Escribir en formato chat', 'Comunicacion asincrona', 'Discusion literaria'],
    'text_input',
    'medio',
    ARRAY['chat', 'digital', 'literatura', 'informal', 'colaborativo']
),
(
    'lectura',
    'literary_discussion',
    'chat_literario',
    'analizar',
    ARRAY['advanced']::educational_content.difficulty_level[],
    'Analizar obras literarias mediante discusion en formato digital',
    ARRAY['Discutir literatura', 'Analizar obras', 'Compartir interpretaciones'],
    'text_input',
    'medio',
    ARRAY['literatura', 'discusion']
) ON CONFLICT (mechanic_subcategory, exercise_type) DO UPDATE SET
    mechanic_category = EXCLUDED.mechanic_category,
    bloom_level = EXCLUDED.bloom_level,
    cefr_level = EXCLUDED.cefr_level,
    pedagogical_purpose = EXCLUDED.pedagogical_purpose,
    learning_objectives = EXCLUDED.learning_objectives,
    interaction_type = EXCLUDED.interaction_type,
    cognitive_load = EXCLUDED.cognitive_load,
    tags = EXCLUDED.tags;

-- email_formal: escritura + aplicar
INSERT INTO educational_content.exercise_mechanic_mappings (
    mechanic_category, mechanic_subcategory, exercise_type,
    bloom_level, cefr_level, pedagogical_purpose, learning_objectives,
    interaction_type, cognitive_load, tags
) VALUES
(
    'escritura',
    'formal_writing',
    'email_formal',
    'aplicar',
    ARRAY['intermediate', 'advanced']::educational_content.difficulty_level[],
    'Desarrollar competencia en escritura formal digital para contextos profesionales',
    ARRAY['Redactar emails formales', 'Usar registro apropiado', 'Estructura de correspondencia'],
    'text_input',
    'medio',
    ARRAY['formal', 'profesional', 'correspondencia', 'digital']
),
(
    'lectura',
    'formal_comprehension',
    'email_formal',
    'comprender',
    ARRAY['intermediate']::educational_content.difficulty_level[],
    'Comprender convenciones de escritura formal en contextos digitales',
    ARRAY['Identificar registro formal', 'Comprender estructura de emails'],
    'text_input',
    'medio',
    ARRAY['formal', 'estructura']
) ON CONFLICT (mechanic_subcategory, exercise_type) DO UPDATE SET
    mechanic_category = EXCLUDED.mechanic_category,
    bloom_level = EXCLUDED.bloom_level,
    cefr_level = EXCLUDED.cefr_level,
    pedagogical_purpose = EXCLUDED.pedagogical_purpose,
    learning_objectives = EXCLUDED.learning_objectives,
    interaction_type = EXCLUDED.interaction_type,
    cognitive_load = EXCLUDED.cognitive_load,
    tags = EXCLUDED.tags;

-- ensayo_argumentativo: escritura + crear
INSERT INTO educational_content.exercise_mechanic_mappings (
    mechanic_category, mechanic_subcategory, exercise_type,
    bloom_level, cefr_level, pedagogical_purpose, learning_objectives,
    interaction_type, cognitive_load, tags
) VALUES
(
    'escritura',
    'essay_writing',
    'ensayo_argumentativo',
    'crear',
    ARRAY['advanced', 'proficient']::educational_content.difficulty_level[],
    'Crear ensayos argumentativos con estructura academica y pensamiento critico',
    ARRAY['Redactar ensayos', 'Argumentar por escrito', 'Estructurar texto academico'],
    'text_input',
    'alto',
    ARRAY['ensayo', 'academico', 'argumentacion', 'escritura_extensa']
),
(
    'lectura',
    'argumentative_analysis',
    'ensayo_argumentativo',
    'evaluar',
    ARRAY['advanced']::educational_content.difficulty_level[],
    'Analizar y evaluar argumentos durante el proceso de escritura',
    ARRAY['Evaluar argumentos propios', 'Revisar coherencia argumentativa'],
    'text_input',
    'alto',
    ARRAY['revision', 'autoevaluacion']
) ON CONFLICT (mechanic_subcategory, exercise_type) DO UPDATE SET
    mechanic_category = EXCLUDED.mechanic_category,
    bloom_level = EXCLUDED.bloom_level,
    cefr_level = EXCLUDED.cefr_level,
    pedagogical_purpose = EXCLUDED.pedagogical_purpose,
    learning_objectives = EXCLUDED.learning_objectives,
    interaction_type = EXCLUDED.interaction_type,
    cognitive_load = EXCLUDED.cognitive_load,
    tags = EXCLUDED.tags;

-- infografia_interactiva: lectura + comprender
INSERT INTO educational_content.exercise_mechanic_mappings (
    mechanic_category, mechanic_subcategory, exercise_type,
    bloom_level, cefr_level, pedagogical_purpose, learning_objectives,
    interaction_type, cognitive_load, tags
) VALUES
(
    'lectura',
    'data_visualization',
    'infografia_interactiva',
    'comprender',
    ARRAY['intermediate', 'advanced']::educational_content.difficulty_level[],
    'Interpretar informacion visual y graficos en formatos digitales interactivos',
    ARRAY['Leer infografias', 'Interpretar datos visuales', 'Literacidad visual'],
    'selection',
    'medio',
    ARRAY['infografia', 'visual', 'datos', 'interactivo', 'digital']
),
(
    'escritura',
    'visual_communication',
    'infografia_interactiva',
    'crear',
    ARRAY['advanced']::educational_content.difficulty_level[],
    'Crear comunicacion visual efectiva mediante infografias',
    ARRAY['Disenar infografias', 'Comunicar visualmente'],
    'drag_drop',
    'alto',
    ARRAY['diseno', 'visual', 'creatividad']
) ON CONFLICT (mechanic_subcategory, exercise_type) DO UPDATE SET
    mechanic_category = EXCLUDED.mechanic_category,
    bloom_level = EXCLUDED.bloom_level,
    cefr_level = EXCLUDED.cefr_level,
    pedagogical_purpose = EXCLUDED.pedagogical_purpose,
    learning_objectives = EXCLUDED.learning_objectives,
    interaction_type = EXCLUDED.interaction_type,
    cognitive_load = EXCLUDED.cognitive_load,
    tags = EXCLUDED.tags;

-- navegacion_hipertextual: lectura + aplicar
INSERT INTO educational_content.exercise_mechanic_mappings (
    mechanic_category, mechanic_subcategory, exercise_type,
    bloom_level, cefr_level, pedagogical_purpose, learning_objectives,
    interaction_type, cognitive_load, tags
) VALUES
(
    'lectura',
    'hypertext_navigation',
    'navegacion_hipertextual',
    'aplicar',
    ARRAY['intermediate', 'advanced']::educational_content.difficulty_level[],
    'Desarrollar estrategias de lectura no-lineal en entornos digitales hipertextuales',
    ARRAY['Navegar hipertextos', 'Lectura no-lineal', 'Estrategias digitales'],
    'selection',
    'medio',
    ARRAY['hipertexto', 'digital', 'navegacion', 'no_lineal']
),
(
    'escritura',
    'hypertext_creation',
    'navegacion_hipertextual',
    'crear',
    ARRAY['advanced']::educational_content.difficulty_level[],
    'Crear estructuras hipertextuales para comunicacion digital efectiva',
    ARRAY['Disenar hipertextos', 'Estructurar informacion no-lineal'],
    'selection',
    'alto',
    ARRAY['hipertexto', 'diseno']
) ON CONFLICT (mechanic_subcategory, exercise_type) DO UPDATE SET
    mechanic_category = EXCLUDED.mechanic_category,
    bloom_level = EXCLUDED.bloom_level,
    cefr_level = EXCLUDED.cefr_level,
    pedagogical_purpose = EXCLUDED.pedagogical_purpose,
    learning_objectives = EXCLUDED.learning_objectives,
    interaction_type = EXCLUDED.interaction_type,
    cognitive_load = EXCLUDED.cognitive_load,
    tags = EXCLUDED.tags;

-- quiz_tiktok: lectura + recordar
INSERT INTO educational_content.exercise_mechanic_mappings (
    mechanic_category, mechanic_subcategory, exercise_type,
    bloom_level, cefr_level, pedagogical_purpose, learning_objectives,
    interaction_type, cognitive_load, tags
) VALUES
(
    'lectura',
    'speed_reading',
    'quiz_tiktok',
    'recordar',
    ARRAY['beginner', 'intermediate']::educational_content.difficulty_level[],
    'Desarrollar comprension rapida de informacion en formato de video corto',
    ARRAY['Comprension rapida', 'Atencion selectiva', 'Informacion visual'],
    'selection',
    'bajo',
    ARRAY['rapido', 'video', 'tiktok', 'gamificado', 'visual']
),
(
    'cultura',
    'pop_culture',
    'quiz_tiktok',
    'comprender',
    ARRAY['beginner']::educational_content.difficulty_level[],
    'Comprender formatos culturales de redes sociales contemporaneas',
    ARRAY['Comprender formatos digitales', 'Cultura de redes sociales'],
    'selection',
    'bajo',
    ARRAY['social_media', 'cultura_digital']
) ON CONFLICT (mechanic_subcategory, exercise_type) DO UPDATE SET
    mechanic_category = EXCLUDED.mechanic_category,
    bloom_level = EXCLUDED.bloom_level,
    cefr_level = EXCLUDED.cefr_level,
    pedagogical_purpose = EXCLUDED.pedagogical_purpose,
    learning_objectives = EXCLUDED.learning_objectives,
    interaction_type = EXCLUDED.interaction_type,
    cognitive_load = EXCLUDED.cognitive_load,
    tags = EXCLUDED.tags;

-- resena_critica: escritura + evaluar
INSERT INTO educational_content.exercise_mechanic_mappings (
    mechanic_category, mechanic_subcategory, exercise_type,
    bloom_level, cefr_level, pedagogical_purpose, learning_objectives,
    interaction_type, cognitive_load, tags
) VALUES
(
    'escritura',
    'critical_review',
    'resena_critica',
    'evaluar',
    ARRAY['advanced', 'proficient']::educational_content.difficulty_level[],
    'Escribir resenas criticas evaluando obras culturales o textos',
    ARRAY['Redactar resenas', 'Evaluar criticamente', 'Argumentar juicios esteticos'],
    'text_input',
    'alto',
    ARRAY['resena', 'critica', 'evaluacion', 'argumentacion']
),
(
    'lectura',
    'critical_reading',
    'resena_critica',
    'evaluar',
    ARRAY['advanced']::educational_content.difficulty_level[],
    'Leer criticamente para formular juicios fundamentados',
    ARRAY['Evaluar textos', 'Fundamentar opiniones'],
    'text_input',
    'alto',
    ARRAY['critico', 'fundamentacion']
) ON CONFLICT (mechanic_subcategory, exercise_type) DO UPDATE SET
    mechanic_category = EXCLUDED.mechanic_category,
    bloom_level = EXCLUDED.bloom_level,
    cefr_level = EXCLUDED.cefr_level,
    pedagogical_purpose = EXCLUDED.pedagogical_purpose,
    learning_objectives = EXCLUDED.learning_objectives,
    interaction_type = EXCLUDED.interaction_type,
    cognitive_load = EXCLUDED.cognitive_load,
    tags = EXCLUDED.tags;

-- verificador_fake_news: lectura + evaluar
INSERT INTO educational_content.exercise_mechanic_mappings (
    mechanic_category, mechanic_subcategory, exercise_type,
    bloom_level, cefr_level, pedagogical_purpose, learning_objectives,
    interaction_type, cognitive_load, tags
) VALUES
(
    'lectura',
    'fact_checking',
    'verificador_fake_news',
    'evaluar',
    ARRAY['intermediate', 'advanced']::educational_content.difficulty_level[],
    'Evaluar veracidad de informacion digital mediante fact-checking y analisis critico',
    ARRAY['Verificar informacion', 'Identificar fake news', 'Pensamiento critico digital'],
    'selection',
    'alto',
    ARRAY['fake_news', 'verificacion', 'critico', 'digital', 'ciudadania']
),
(
    'cultura',
    'digital_citizenship',
    'verificador_fake_news',
    'evaluar',
    ARRAY['intermediate']::educational_content.difficulty_level[],
    'Desarrollar ciudadania digital responsable mediante evaluacion de informacion',
    ARRAY['Ciudadania digital', 'Responsabilidad informativa'],
    'selection',
    'medio',
    ARRAY['ciudadania', 'responsabilidad']
) ON CONFLICT (mechanic_subcategory, exercise_type) DO UPDATE SET
    mechanic_category = EXCLUDED.mechanic_category,
    bloom_level = EXCLUDED.bloom_level,
    cefr_level = EXCLUDED.cefr_level,
    pedagogical_purpose = EXCLUDED.pedagogical_purpose,
    learning_objectives = EXCLUDED.learning_objectives,
    interaction_type = EXCLUDED.interaction_type,
    cognitive_load = EXCLUDED.cognitive_load,
    tags = EXCLUDED.tags;

-- ============================================================================
-- MODULO 5: PRODUCCION INTEGRADA (3 exercise_types - NUEVOS GAP-002)
-- ============================================================================

-- comic_digital: escritura + crear (NUEVO - GAP-002)
INSERT INTO educational_content.exercise_mechanic_mappings (
    mechanic_category, mechanic_subcategory, exercise_type,
    bloom_level, cefr_level, pedagogical_purpose, learning_objectives,
    interaction_type, cognitive_load, tags
) VALUES
(
    'escritura',
    'visual_narrative',
    'comic_digital',
    'crear',
    ARRAY['intermediate', 'advanced']::educational_content.difficulty_level[],
    'Crear narrativas visuales combinando texto e imagen en formato comic',
    ARRAY['Escribir dialogos', 'Narrar visualmente', 'Combinar texto e imagen'],
    'drag_drop',
    'alto',
    ARRAY['comic', 'visual', 'narrativa', 'creatividad', 'multimedia']
),
(
    'lectura',
    'sequential_art',
    'comic_digital',
    'analizar',
    ARRAY['intermediate']::educational_content.difficulty_level[],
    'Comprender narrativa secuencial y estructura del comic',
    ARRAY['Leer secuencias visuales', 'Interpretar paneles', 'Comprender flujo narrativo'],
    'selection',
    'medio',
    ARRAY['comic', 'secuencial', 'visual']
) ON CONFLICT (mechanic_subcategory, exercise_type) DO UPDATE SET
    mechanic_category = EXCLUDED.mechanic_category,
    bloom_level = EXCLUDED.bloom_level,
    cefr_level = EXCLUDED.cefr_level,
    pedagogical_purpose = EXCLUDED.pedagogical_purpose,
    learning_objectives = EXCLUDED.learning_objectives,
    interaction_type = EXCLUDED.interaction_type,
    cognitive_load = EXCLUDED.cognitive_load,
    tags = EXCLUDED.tags;

-- diario_multimedia: escritura + crear (NUEVO - GAP-002)
INSERT INTO educational_content.exercise_mechanic_mappings (
    mechanic_category, mechanic_subcategory, exercise_type,
    bloom_level, cefr_level, pedagogical_purpose, learning_objectives,
    interaction_type, cognitive_load, tags
) VALUES
(
    'escritura',
    'multimedia_journal',
    'diario_multimedia',
    'crear',
    ARRAY['intermediate', 'advanced']::educational_content.difficulty_level[],
    'Documentar experiencias de lectura mediante entradas multimedia',
    ARRAY['Escribir reflexiones', 'Integrar multimedia', 'Documentar aprendizaje'],
    'text_input',
    'medio',
    ARRAY['diario', 'reflexion', 'multimedia', 'personal']
),
(
    'audio',
    'audio_journal',
    'diario_multimedia',
    'crear',
    ARRAY['intermediate']::educational_content.difficulty_level[],
    'Grabar reflexiones orales sobre lecturas y experiencias',
    ARRAY['Grabar reflexiones', 'Expresion oral personal'],
    'audio_recording',
    'medio',
    ARRAY['audio', 'reflexion', 'diario']
) ON CONFLICT (mechanic_subcategory, exercise_type) DO UPDATE SET
    mechanic_category = EXCLUDED.mechanic_category,
    bloom_level = EXCLUDED.bloom_level,
    cefr_level = EXCLUDED.cefr_level,
    pedagogical_purpose = EXCLUDED.pedagogical_purpose,
    learning_objectives = EXCLUDED.learning_objectives,
    interaction_type = EXCLUDED.interaction_type,
    cognitive_load = EXCLUDED.cognitive_load,
    tags = EXCLUDED.tags;

-- video_carta: audio + crear (NUEVO - GAP-002)
INSERT INTO educational_content.exercise_mechanic_mappings (
    mechanic_category, mechanic_subcategory, exercise_type,
    bloom_level, cefr_level, pedagogical_purpose, learning_objectives,
    interaction_type, cognitive_load, tags
) VALUES
(
    'audio',
    'video_letter',
    'video_carta',
    'crear',
    ARRAY['advanced', 'proficient']::educational_content.difficulty_level[],
    'Crear cartas en formato video combinando expresion oral y visual',
    ARRAY['Comunicar mediante video', 'Expresion audiovisual', 'Formato epistolar multimedia'],
    'video_recording',
    'alto',
    ARRAY['video', 'carta', 'multimedia', 'personal', 'audiovisual']
),
(
    'escritura',
    'video_script',
    'video_carta',
    'crear',
    ARRAY['advanced']::educational_content.difficulty_level[],
    'Planificar video-cartas mediante guiones estructurados',
    ARRAY['Redactar guiones', 'Planificar contenido audiovisual'],
    'text_input',
    'medio',
    ARRAY['guion', 'planificacion', 'video']
) ON CONFLICT (mechanic_subcategory, exercise_type) DO UPDATE SET
    mechanic_category = EXCLUDED.mechanic_category,
    bloom_level = EXCLUDED.bloom_level,
    cefr_level = EXCLUDED.cefr_level,
    pedagogical_purpose = EXCLUDED.pedagogical_purpose,
    learning_objectives = EXCLUDED.learning_objectives,
    interaction_type = EXCLUDED.interaction_type,
    cognitive_load = EXCLUDED.cognitive_load,
    tags = EXCLUDED.tags;

-- ============================================================================
-- TIPOS AUXILIARES (4 exercise_types - NUEVOS/COMPLETADOS GAP-002)
-- ============================================================================

-- BACKLOG: comprension_auditiva desactivada. Requiere infraestructura audio. Mejora futura.
-- Mappings preservados para reactivacion futura.
/*
INSERT INTO educational_content.exercise_mechanic_mappings (
    mechanic_category, mechanic_subcategory, exercise_type,
    bloom_level, cefr_level, pedagogical_purpose, learning_objectives,
    interaction_type, cognitive_load, tags
) VALUES
(
    'audio',
    'listening_comprehension',
    'comprension_auditiva',
    'comprender',
    ARRAY['beginner', 'intermediate', 'advanced']::educational_content.difficulty_level[],
    'Desarrollar comprension auditiva mediante escucha activa de textos orales',
    ARRAY['Comprender audio', 'Identificar ideas principales', 'Escucha activa'],
    'selection',
    'medio',
    ARRAY['audio', 'escucha', 'comprension_auditiva']
),
(
    'lectura',
    'audio_text_integration',
    'comprension_auditiva',
    'aplicar',
    ARRAY['intermediate']::educational_content.difficulty_level[],
    'Integrar informacion auditiva con textos escritos',
    ARRAY['Relacionar audio con texto', 'Comprension multimodal'],
    'selection',
    'medio',
    ARRAY['multimodal', 'audio', 'texto']
) ON CONFLICT (mechanic_subcategory, exercise_type) DO UPDATE SET
    mechanic_category = EXCLUDED.mechanic_category,
    bloom_level = EXCLUDED.bloom_level,
    cefr_level = EXCLUDED.cefr_level,
    pedagogical_purpose = EXCLUDED.pedagogical_purpose,
    learning_objectives = EXCLUDED.learning_objectives,
    interaction_type = EXCLUDED.interaction_type,
    cognitive_load = EXCLUDED.cognitive_load,
    tags = EXCLUDED.tags;
*/

-- collage_prensa: cultura + crear
INSERT INTO educational_content.exercise_mechanic_mappings (
    mechanic_category, mechanic_subcategory, exercise_type,
    bloom_level, cefr_level, pedagogical_purpose, learning_objectives,
    interaction_type, cognitive_load, tags
) VALUES
(
    'cultura',
    'cultural_collage',
    'collage_prensa',
    'crear',
    ARRAY['intermediate', 'advanced']::educational_content.difficulty_level[],
    'Crear collages tematicos analizando medios de comunicacion y cultura',
    ARRAY['Analizar medios', 'Sintetizar informacion cultural', 'Expresion visual'],
    'drag_drop',
    'medio',
    ARRAY['medios', 'prensa', 'visual', 'cultural', 'creatividad']
),
(
    'lectura',
    'media_analysis',
    'collage_prensa',
    'analizar',
    ARRAY['intermediate']::educational_content.difficulty_level[],
    'Analizar representaciones en medios de comunicacion',
    ARRAY['Leer medios criticamente', 'Analizar representaciones'],
    'selection',
    'medio',
    ARRAY['medios', 'analisis']
) ON CONFLICT (mechanic_subcategory, exercise_type) DO UPDATE SET
    mechanic_category = EXCLUDED.mechanic_category,
    bloom_level = EXCLUDED.bloom_level,
    cefr_level = EXCLUDED.cefr_level,
    pedagogical_purpose = EXCLUDED.pedagogical_purpose,
    learning_objectives = EXCLUDED.learning_objectives,
    interaction_type = EXCLUDED.interaction_type,
    cognitive_load = EXCLUDED.cognitive_load,
    tags = EXCLUDED.tags;

-- texto_movimiento: lectura + comprender (NUEVO - GAP-002)
INSERT INTO educational_content.exercise_mechanic_mappings (
    mechanic_category, mechanic_subcategory, exercise_type,
    bloom_level, cefr_level, pedagogical_purpose, learning_objectives,
    interaction_type, cognitive_load, tags
) VALUES
(
    'lectura',
    'kinetic_text',
    'texto_movimiento',
    'comprender',
    ARRAY['beginner', 'intermediate']::educational_content.difficulty_level[],
    'Desarrollar atencion y comprension mediante textos animados/en movimiento',
    ARRAY['Seguir texto en movimiento', 'Comprension rapida', 'Atencion visual'],
    'selection',
    'medio',
    ARRAY['animacion', 'movimiento', 'atencion', 'visual']
),
(
    'vocabulario',
    'animated_vocabulary',
    'texto_movimiento',
    'recordar',
    ARRAY['beginner']::educational_content.difficulty_level[],
    'Reforzar vocabulario mediante presentacion animada',
    ARRAY['Memorizar mediante animacion', 'Reconocimiento rapido'],
    'selection',
    'bajo',
    ARRAY['vocabulario', 'animacion', 'rapido']
) ON CONFLICT (mechanic_subcategory, exercise_type) DO UPDATE SET
    mechanic_category = EXCLUDED.mechanic_category,
    bloom_level = EXCLUDED.bloom_level,
    cefr_level = EXCLUDED.cefr_level,
    pedagogical_purpose = EXCLUDED.pedagogical_purpose,
    learning_objectives = EXCLUDED.learning_objectives,
    interaction_type = EXCLUDED.interaction_type,
    cognitive_load = EXCLUDED.cognitive_load,
    tags = EXCLUDED.tags;

-- call_to_action: escritura + aplicar (NUEVO - GAP-002)
INSERT INTO educational_content.exercise_mechanic_mappings (
    mechanic_category, mechanic_subcategory, exercise_type,
    bloom_level, cefr_level, pedagogical_purpose, learning_objectives,
    interaction_type, cognitive_load, tags
) VALUES
(
    'escritura',
    'persuasive_writing',
    'call_to_action',
    'aplicar',
    ARRAY['intermediate', 'advanced']::educational_content.difficulty_level[],
    'Redactar textos persuasivos con llamadas a la accion efectivas',
    ARRAY['Escribir persuasivamente', 'Crear llamadas a la accion', 'Comunicacion efectiva'],
    'text_input',
    'medio',
    ARRAY['persuasion', 'marketing', 'comunicacion', 'accion']
),
(
    'lectura',
    'persuasion_analysis',
    'call_to_action',
    'analizar',
    ARRAY['advanced']::educational_content.difficulty_level[],
    'Analizar tecnicas persuasivas en textos con llamadas a la accion',
    ARRAY['Identificar tecnicas persuasivas', 'Evaluar efectividad de CTAs'],
    'selection',
    'medio',
    ARRAY['persuasion', 'analisis', 'critico']
) ON CONFLICT (mechanic_subcategory, exercise_type) DO UPDATE SET
    mechanic_category = EXCLUDED.mechanic_category,
    bloom_level = EXCLUDED.bloom_level,
    cefr_level = EXCLUDED.cefr_level,
    pedagogical_purpose = EXCLUDED.pedagogical_purpose,
    learning_objectives = EXCLUDED.learning_objectives,
    interaction_type = EXCLUDED.interaction_type,
    cognitive_load = EXCLUDED.cognitive_load,
    tags = EXCLUDED.tags;

-- ============================================================================
-- ESTADISTICAS DEL SEED
-- ============================================================================

-- Total de registros insertados: 54 mappings
--
-- Cobertura de exercise_types: 27/27 (100%)
--
-- Distribucion por Modulo:
--   - Modulo 1 (Comprension Literal): 5 exercise_types activos + 2 auxiliares asignables, 13 mappings
--   - Modulo 2 (Comprension Inferencial): 5 exercise_types, 10 mappings
--   - Modulo 3 (Comprension Critica): 5 exercise_types, 10 mappings
--   - Modulo 4 (Literacidades Digitales): 9 exercise_types, 18 mappings
--   - Modulo 5 (Produccion Integrada): 3 exercise_types, 6 mappings (NUEVO)
--   - Auxiliares: 4 exercise_types, 8 mappings (COMPLETADO)
--
-- Distribucion por categoria:
--   - vocabulario: 7 mappings
--   - lectura: 24 mappings (categoria dominante)
--   - escritura: 14 mappings
--   - cultura: 8 mappings
--   - audio: 5 mappings
--   - pronunciacion: 0 mappings (no hay exercise_types de pronunciacion)
--   - gramatica: 0 mappings (no hay exercise_types de gramatica)
--
-- Distribucion por Bloom:
--   - recordar: 5 mappings
--   - comprender: 12 mappings
--   - aplicar: 8 mappings
--   - analizar: 14 mappings
--   - evaluar: 10 mappings
--   - crear: 14 mappings
--
-- Promedio: 2 mappings por exercise_type
-- Multiples mappings permiten busqueda flexible por diferentes perspectivas pedagogicas
--
-- NOTA: Se removieron exercise_types invalidos que no existen en el ENUM:
-- flashcard, drag_drop, organizador_grafico, multiple_choice, texto_interactivo,
-- audio_transcripcion, video_analisis, proyecto_colaborativo, presentacion_oral
