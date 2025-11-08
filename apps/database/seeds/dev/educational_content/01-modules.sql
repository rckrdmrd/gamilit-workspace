-- =====================================================
-- Seed Data: Educational Modules (DEV)
-- =====================================================
-- Description: 8 módulos sobre Marie Curie
-- Content: Basado en metodología Daniel Cassany
-- Created by: SA-SEEDS-EDUCATIONAL
-- Date: 2025-11-02
-- =====================================================

SET search_path TO educational_content, public;

INSERT INTO educational_content.modules (
    title, subtitle, description, summary,
    order_index, module_code,
    difficulty_level, grade_levels, subjects,
    estimated_duration_minutes, estimated_sessions,
    learning_objectives, competencies, skills_developed,
    maya_rank_required, maya_rank_granted,
    xp_reward, ml_coins_reward,
    status, is_published, is_featured, is_free,
    version, content, settings, metadata
) VALUES
-- ======================================================================
-- MÓDULO 1: COMPRENSIÓN LITERAL
-- ======================================================================
(
    'Módulo 1: Comprensión Literal',
    'Descubre los Hechos Básicos sobre Marie Curie',
    'Aprende a identificar información explícita en los textos sobre Marie Curie. Desarrolla habilidades para reconocer fechas, nombres, lugares y eventos específicos mencionados directamente en el texto.',
    'En este módulo aprenderás a extraer información directa de textos biográficos sobre Marie Curie, identificando datos, fechas y hechos concretos.',
    1, 'MOD-01-LITERAL',
    'beginner', ARRAY['6','7','8']::text[], ARRAY['Literatura','Ciencias','Historia']::text[],
    120, 4,
    ARRAY[
        'Identificar información explícita en textos biográficos',
        'Reconocer fechas y eventos importantes',
        'Localizar nombres propios y lugares mencionados',
        'Recordar detalles específicos del texto'
    ]::text[],
    ARRAY[
        'Competencia lectora nivel literal',
        'Comprensión de textos científicos',
        'Memoria y retención de información'
    ]::text[],
    ARRAY[
        'Lectura comprensiva',
        'Identificación de datos explícitos',
        'Organización de información',
        'Vocabulario científico'
    ]::text[],
    NULL, NULL,
    100, 50,
    'published', true, false, true,
    1,
    '{
        "marie_curie_story": {
            "period": "full_life",
            "focus": "basic_facts",
            "dates": ["1867-11-07", "1891", "1895-07-25", "1898-12", "1903", "1911", "1934-07-04"],
            "key_concepts": ["Radio", "Polonio", "Radioactividad", "Nobel", "Sorbona"]
        },
        "reading_materials": [
            {
                "type": "biography_excerpt",
                "title": "La Vida de Marie Curie",
                "difficulty": "easy"
            }
        ],
        "historical_context": {
            "era": "late_1800s_early_1900s",
            "location": "Poland, France"
        }
    }'::jsonb,
    '{
        "allow_hints": true,
        "show_progress": true,
        "certificate_eligible": true
    }'::jsonb,
    '{
        "total_exercises": 5,
        "difficulty_distribution": {"easy": 2, "medium": 3}
    }'::jsonb
),

-- ======================================================================
-- MÓDULO 2: COMPRENSIÓN INFERENCIAL
-- ======================================================================
(
    'Módulo 2: Comprensión Inferencial',
    'Deduce lo que no se dice directamente',
    'Desarrolla habilidades para interpretar información implícita, hacer deducciones y comprender significados no expresados directamente en los textos sobre Marie Curie.',
    'Aprende a leer entre líneas, hacer inferencias lógicas y deducir causas y consecuencias a partir del contexto histórico de Marie Curie.',
    2, 'MOD-02-INFERENCIAL',
    'intermediate', ARRAY['6','7','8']::text[], ARRAY['Literatura','Ciencias','Historia']::text[],
    150, 5,
    ARRAY[
        'Realizar inferencias a partir de información del texto',
        'Deducir causas y consecuencias de eventos',
        'Interpretar motivaciones y sentimientos de personajes',
        'Predecir eventos futuros basándose en el contexto'
    ]::text[],
    ARRAY[
        'Pensamiento inferencial',
        'Análisis de causas y efectos',
        'Comprensión contextual',
        'Razonamiento lógico'
    ]::text[],
    ARRAY[
        'Deducción lógica',
        'Interpretación de contextos',
        'Análisis de motivaciones',
        'Predicción basada en evidencias'
    ]::text[],
    NULL, NULL,
    150, 75,
    'published', true, false, true,
    1,
    '{
        "marie_curie_story": {
            "period": "scientific_career",
            "focus": "motivations_challenges",
            "key_themes": ["discrimination", "perseverance", "scientific_method"]
        },
        "reading_materials": [
            {
                "type": "narrative_analysis",
                "title": "Entre Líneas: La Historia de Marie",
                "difficulty": "intermediate"
            }
        ]
    }'::jsonb,
    '{
        "allow_hints": true,
        "hint_cost": 10,
        "show_progress": true
    }'::jsonb,
    '{
        "total_exercises": 5,
        "difficulty_distribution": {"medium": 4, "hard": 1}
    }'::jsonb
),

-- ======================================================================
-- MÓDULO 3: COMPRENSIÓN CRÍTICA
-- ======================================================================
(
    'Módulo 3: Comprensión Crítica',
    'Evalúa y Forma tu Propia Opinión',
    'Desarrolla pensamiento crítico para evaluar argumentos, analizar múltiples perspectivas y formar opiniones fundamentadas sobre los dilemas éticos y científicos relacionados con Marie Curie.',
    'Aprende a cuestionar, analizar fuentes, identificar sesgos y construir argumentos sólidos sobre temas complejos.',
    3, 'MOD-03-CRITICA',
    'advanced', ARRAY['7','8','9']::text[], ARRAY['Literatura','Ciencias','Historia','Ética']::text[],
    180, 6,
    ARRAY[
        'Evaluar la validez de argumentos y evidencias',
        'Analizar múltiples perspectivas sobre un tema',
        'Identificar sesgos y falacias lógicas',
        'Formar opiniones fundamentadas con evidencia'
    ]::text[],
    ARRAY[
        'Pensamiento crítico',
        'Análisis de argumentos',
        'Evaluación de fuentes',
        'Razonamiento ético'
    ]::text[],
    ARRAY[
        'Evaluación crítica',
        'Análisis de perspectivas',
        'Construcción de argumentos',
        'Detección de sesgos'
    ]::text[],
    NULL, NULL,
    200, 100,
    'published', true, false, true,
    1,
    '{
        "marie_curie_story": {
            "period": "full_life",
            "focus": "ethical_dilemmas",
            "key_themes": ["scientific_ethics", "gender_equality", "patent_debate", "health_risks"]
        },
        "debate_topics": [
            "Should Marie have patented radium?",
            "Ethics of scientific sacrifice",
            "Women in science barriers"
        ]
    }'::jsonb,
    '{
        "allow_debates": true,
        "require_citations": true,
        "peer_review_enabled": true
    }'::jsonb,
    '{
        "total_exercises": 5,
        "difficulty_distribution": {"hard": 5}
    }'::jsonb
),

-- ======================================================================
-- MÓDULO 4: LECTURA DIGITAL
-- ======================================================================
(
    'Módulo 4: Lectura Digital',
    'Navega el Mundo Digital con Criterio',
    'Desarrolla habilidades de alfabetización digital: fact-checking, análisis de contenido multimedia, navegación hipertextual y producción de contenido digital sobre Marie Curie.',
    'Aprende a verificar información, analizar memes, crear contenido digital y navegar el ecosistema informativo moderno.',
    4, 'MOD-04-DIGITAL',
    'intermediate', ARRAY['7','8','9']::text[], ARRAY['Literatura','Ciencias','Tecnología','Medios']::text[],
    200, 7,
    ARRAY[
        'Verificar información en medios digitales',
        'Navegar eficientemente contenido hipertextual',
        'Analizar contenido multimedia críticamente',
        'Producir contenido digital educativo'
    ]::text[],
    ARRAY[
        'Alfabetización digital',
        'Verificación de hechos',
        'Análisis multimedia',
        'Producción de contenido'
    ]::text[],
    ARRAY[
        'Fact-checking',
        'Navegación hipertextual',
        'Análisis de memes',
        'Creación de infografías',
        'Redacción digital'
    ]::text[],
    NULL, NULL,
    180, 90,
    'published', true, true, true,
    1,
    '{
        "marie_curie_story": {
            "period": "full_life",
            "focus": "digital_literacy",
            "key_themes": ["fake_news", "social_media", "digital_content"]
        },
        "digital_formats": ["memes", "infographics", "social_posts", "emails", "essays"]
    }'::jsonb,
    '{
        "multimedia_enabled": true,
        "social_sharing": false,
        "ai_assistance": true
    }'::jsonb,
    '{
        "total_exercises": 9,
        "difficulty_distribution": {"easy": 2, "medium": 5, "hard": 2}
    }'::jsonb
),

-- ======================================================================
-- MÓDULO 5: PRODUCCIÓN CREATIVA
-- ======================================================================
(
    'Módulo 5: Producción Creativa',
    'Crea tu Propia Historia',
    'Desarrolla habilidades de producción multimedia: diario digital, cómic narrativo y video-carta, integrando comprensión lectora con creatividad expresiva sobre la vida de Marie Curie.',
    'Expresa tu comprensión de la historia de Marie Curie a través de proyectos creativos multimedia.',
    5, 'MOD-05-CREATIVO',
    'intermediate', ARRAY['7','8','9']::text[], ARRAY['Literatura','Ciencias','Arte','Medios']::text[],
    150, 5,
    ARRAY[
        'Producir contenido multimedia original',
        'Integrar información histórica con narrativa creativa',
        'Expresar perspectivas de manera auténtica',
        'Comunicar ideas complejas creativamente'
    ]::text[],
    ARRAY[
        'Creatividad narrativa',
        'Producción multimedia',
        'Expresión artística',
        'Síntesis de información'
    ]::text[],
    ARRAY[
        'Escritura creativa',
        'Diseño visual',
        'Narración audiovisual',
        'Integración de medios'
    ]::text[],
    NULL, NULL,
    150, 75,
    'published', true, true, true,
    1,
    '{
        "marie_curie_story": {
            "period": "full_life",
            "focus": "creative_expression",
            "key_themes": ["diary", "visual_narrative", "video_message"]
        },
        "creative_formats": ["diary", "comic", "video_letter"]
    }'::jsonb,
    '{
        "multimedia_required": true,
        "peer_sharing": true,
        "rubric_based_evaluation": true
    }'::jsonb,
    '{
        "total_exercises": 3,
        "difficulty_distribution": {"medium": 2, "hard": 1}
    }'::jsonb
)

ON CONFLICT (module_code) DO UPDATE SET
    title = EXCLUDED.title,
    subtitle = EXCLUDED.subtitle,
    description = EXCLUDED.description,
    summary = EXCLUDED.summary,
    order_index = EXCLUDED.order_index,
    difficulty_level = EXCLUDED.difficulty_level,
    grade_levels = EXCLUDED.grade_levels,
    subjects = EXCLUDED.subjects,
    estimated_duration_minutes = EXCLUDED.estimated_duration_minutes,
    estimated_sessions = EXCLUDED.estimated_sessions,
    learning_objectives = EXCLUDED.learning_objectives,
    competencies = EXCLUDED.competencies,
    skills_developed = EXCLUDED.skills_developed,
    xp_reward = EXCLUDED.xp_reward,
    ml_coins_reward = EXCLUDED.ml_coins_reward,
    status = EXCLUDED.status,
    is_published = EXCLUDED.is_published,
    is_featured = EXCLUDED.is_featured,
    is_free = EXCLUDED.is_free,
    version = EXCLUDED.version,
    content = EXCLUDED.content,
    settings = EXCLUDED.settings,
    metadata = EXCLUDED.metadata,
    updated_at = NOW();

-- Summary
DO $$
DECLARE
    module_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO module_count FROM educational_content.modules;
    RAISE NOTICE '✅ Módulos educativos cargados: % módulos sobre Marie Curie', module_count;
    RAISE NOTICE '   - Módulos pedagógicos con ejercicios: 5 (Módulos 1-5)';
    RAISE NOTICE '   - Módulos narrativos informativos: 3 (Módulos 6-8)';
END $$;
