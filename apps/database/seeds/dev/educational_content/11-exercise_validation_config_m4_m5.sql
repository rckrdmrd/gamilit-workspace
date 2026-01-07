-- ============================================================================
-- SEED: exercise_validation_config - Modulos 4 y 5
-- Descripcion: Configuracion de validacion para 8 tipos de ejercicios M4/M5
-- Autor: Tech Leader Agent
-- Fecha: 2026-01-04
-- Tarea: EAI-007 (Correccion Discrepancia DTO Frontend-Backend)
-- Alcance: Modulos 4, 5 (8 tipos adicionales)
-- Referencia: ANALISIS-CORRECCION-DISCREPANCIA-DTO-2026-01-04.md
-- ============================================================================

INSERT INTO educational_content.exercise_validation_config (
    exercise_type,
    validation_function,
    case_sensitive,
    allow_partial_credit,
    fuzzy_matching_threshold,
    normalize_text,
    special_rules,
    default_max_points,
    default_passing_score,
    description,
    examples
) VALUES

-- ============================================================================
-- MODULO 4: LECTURA DIGITAL (4 tipos)
-- Nota: Estos ejercicios requieren validacion manual (requires_manual_grading = true)
-- ============================================================================

-- 4.1. VERIFICADOR DE FAKE NEWS
(
    'verificador_fake_news',
    'validate_verificador_fake_news',
    false,                          -- No case-sensitive
    true,                           -- Puntuacion parcial por claim verificado
    NULL,                           -- No fuzzy matching
    true,                           -- Normalizar texto
    '{
        "min_claims": 3,
        "require_evidence": true,
        "min_evidence_length": 10,
        "accept_dto_format": true,
        "accept_legacy_format": true,
        "dto_fields": ["claims_verified"],
        "legacy_fields": ["verifiedClaims", "claims"]
    }'::jsonb,
    100,
    70,
    'Validacion de verificador de fake news: valida claims verificados con evidencia. Acepta formato DTO (claims_verified) o legacy (verifiedClaims)',
    '{
        "submitted_dto": {"claims_verified": [{"claim_id": "c1", "is_fake": true, "evidence": "Fuente verificada muestra inconsistencia"}]},
        "submitted_legacy": {"verifiedClaims": [{"claim": "Afirmacion 1", "verdict": "false", "evidence": "Evidencia del analisis"}]},
        "solution": {"min_claims": 3, "require_evidence": true},
        "result": {"is_correct": true, "verified_count": 3, "score": 100}
    }'::jsonb
),

-- 4.2. NAVEGACION HIPERTEXTUAL
(
    'navegacion_hipertextual',
    'validate_navegacion_hipertextual',
    false,
    true,
    NULL,
    false,
    '{
        "min_nodes_visited": 3,
        "require_information_found": true,
        "accept_dto_format": true,
        "accept_legacy_format": true,
        "dto_fields": ["path", "information_found"],
        "legacy_fields": ["visitedNodes", "navigationPath"]
    }'::jsonb,
    100,
    70,
    'Validacion de navegacion hipertextual: verifica nodos visitados e informacion encontrada. Acepta path (DTO) o visitedNodes (legacy)',
    '{
        "submitted_dto": {"path": ["node1", "node2", "node3"], "information_found": {"node1": {"title": "Intro", "visited": true}}},
        "submitted_legacy": {"visitedNodes": ["node1", "node2"], "timePerDocument": {"node1": 30}},
        "solution": {"min_nodes": 3, "target_nodes": ["node1", "node3"]},
        "result": {"is_correct": true, "nodes_visited": 3, "score": 100}
    }'::jsonb
),

-- 4.3. ANALISIS DE MEMES
(
    'analisis_memes',
    'validate_analisis_memes',
    false,
    true,
    NULL,
    true,
    '{
        "min_annotations": 2,
        "require_analysis_message": true,
        "min_message_length": 20,
        "accept_dto_format": true,
        "accept_legacy_format": true,
        "dto_fields": ["annotations", "analysis.message"],
        "legacy_fields": ["analysisText", "memeAnalysis"]
    }'::jsonb,
    100,
    70,
    'Validacion de analisis de memes: verifica anotaciones y mensaje de analisis. Acepta formato DTO o legacy',
    '{
        "submitted_dto": {"annotations": [{"x": 10, "y": 20, "text": "Elemento ironico"}], "analysis": {"message": "Este meme utiliza ironia para..."}},
        "submitted_legacy": {"analysisText": "El meme presenta...", "markers": [{"x": 10, "y": 20}]},
        "solution": {"min_annotations": 2, "keywords": ["ironia", "mensaje"]},
        "result": {"is_correct": true, "annotations_count": 3, "score": 85}
    }'::jsonb
),

-- 4.4. INFOGRAFIA INTERACTIVA
(
    'infografia_interactiva',
    'validate_infografia_interactiva',
    false,
    true,
    NULL,
    false,
    '{
        "min_sections_explored": 3,
        "require_answers": true,
        "accept_dto_format": true,
        "accept_legacy_format": true,
        "dto_fields": ["sections_explored", "answers"],
        "legacy_fields": ["sections", "exploredSections"]
    }'::jsonb,
    100,
    70,
    'Validacion de infografia interactiva: verifica secciones exploradas y respuestas. Acepta sections_explored (DTO) o sections (legacy)',
    '{
        "submitted_dto": {"sections_explored": ["sec1", "sec2", "sec3"], "answers": {"q1": "a", "q2": "b"}},
        "submitted_legacy": {"sections": [{"id": "sec1", "explored": true}]},
        "solution": {"required_sections": ["sec1", "sec2"], "correct_answers": {"q1": "a"}},
        "result": {"is_correct": true, "sections_explored": 3, "score": 100}
    }'::jsonb
),

-- 4.5. QUIZ TIKTOK (Formato de video corto con preguntas)
(
    'quiz_tiktok',
    'validate_quiz_tiktok',
    false,
    true,
    NULL,
    false,
    '{
        "score_per_question": true,
        "time_bonus": true,
        "max_time_bonus_seconds": 30
    }'::jsonb,
    100,
    70,
    'Validacion de quiz TikTok: preguntas rapidas estilo video corto con bonus por tiempo',
    '{
        "submitted": {"questions": {"q1": "a", "q2": "b", "q3": "c"}, "time_spent": 25},
        "solution": {"correctAnswers": {"q1": "a", "q2": "b", "q3": "c"}},
        "result": {"is_correct": true, "correct_answers": 3, "time_bonus": 5, "score": 105}
    }'::jsonb
),

-- ============================================================================
-- MODULO 5: PRODUCCION LECTORA (3 tipos)
-- Nota: Estos ejercicios requieren validacion manual (requires_manual_grading = true)
-- ============================================================================

-- 5.1. COMIC DIGITAL
(
    'comic_digital',
    'validate_comic_digital',
    false,
    true,
    NULL,
    true,
    '{
        "min_panels": 3,
        "require_dialogue": true,
        "require_narration": false,
        "min_dialogue_length": 10,
        "accept_dto_format": true,
        "accept_legacy_format": true,
        "dto_fields": ["panels.panelNumber", "panels.dialogue", "panels.narration"],
        "legacy_fields": ["panels.speechBubbles", "panels.text"]
    }'::jsonb,
    100,
    70,
    'Validacion de comic digital: verifica paneles con dialogo y narracion. Acepta formato DTO (panelNumber, dialogue) o legacy (speechBubbles)',
    '{
        "submitted_dto": {"panels": [{"panelNumber": 1, "dialogue": "Hola mundo", "narration": "Era un dia..."}]},
        "submitted_legacy": {"panels": [{"id": "p1", "speechBubbles": [{"type": "speech", "text": "Hola"}]}]},
        "solution": {"min_panels": 3, "required_elements": ["dialogue"]},
        "result": {"is_correct": true, "panels_count": 4, "score": 100}
    }'::jsonb
),

-- 5.2. VIDEO CARTA
(
    'video_carta',
    'validate_video_carta',
    false,
    true,
    NULL,
    false,
    '{
        "require_video_url": true,
        "require_sections": true,
        "min_sections": 2,
        "min_duration_seconds": 60,
        "max_duration_seconds": 300,
        "accept_dto_format": true,
        "accept_legacy_format": true,
        "dto_fields": ["video_url", "sections.title", "sections.duration_seconds"],
        "legacy_fields": ["videoUrl", "recording.sections"]
    }'::jsonb,
    100,
    70,
    'Validacion de video carta: verifica URL de video y secciones. Acepta formato DTO (video_url, sections) o legacy (videoUrl, recording)',
    '{
        "submitted_dto": {"video_url": "https://example.com/video.mp4", "sections": [{"title": "Introduccion", "duration_seconds": 30}]},
        "submitted_legacy": {"videoUrl": "https://example.com/v.mp4", "recording": {"sections": [{"name": "Intro"}]}},
        "solution": {"min_sections": 2, "min_duration": 60},
        "result": {"is_correct": true, "sections_count": 3, "total_duration": 180, "score": 100}
    }'::jsonb
),

-- 5.3. DIARIO MULTIMEDIA
(
    'diario_multimedia',
    'validate_diario_multimedia',
    false,
    true,
    NULL,
    true,
    '{
        "min_entries": 3,
        "min_words_per_entry": 50,
        "require_entry_id": true,
        "require_total_words": true,
        "accept_dto_format": true,
        "accept_legacy_format": true,
        "dto_fields": ["entries.id", "entries.content", "entries.wordCount", "totalWords"],
        "legacy_fields": ["entries.text", "entries.date"]
    }'::jsonb,
    100,
    70,
    'Validacion de diario multimedia: verifica entradas con contenido minimo. Acepta formato DTO con id y wordCount o legacy',
    '{
        "submitted_dto": {"entries": [{"id": "e1", "date": "2026-01-04", "content": "Hoy aprendi...", "wordCount": 75}], "totalWords": 225},
        "submitted_legacy": {"entries": [{"text": "Mi reflexion...", "date": "2026-01-04"}]},
        "solution": {"min_entries": 3, "min_words": 50},
        "result": {"is_correct": true, "entries_count": 3, "total_words": 225, "score": 100}
    }'::jsonb
)

ON CONFLICT (exercise_type)
DO UPDATE SET
    validation_function = EXCLUDED.validation_function,
    case_sensitive = EXCLUDED.case_sensitive,
    allow_partial_credit = EXCLUDED.allow_partial_credit,
    fuzzy_matching_threshold = EXCLUDED.fuzzy_matching_threshold,
    normalize_text = EXCLUDED.normalize_text,
    special_rules = EXCLUDED.special_rules,
    default_max_points = EXCLUDED.default_max_points,
    default_passing_score = EXCLUDED.default_passing_score,
    description = EXCLUDED.description,
    examples = EXCLUDED.examples,
    updated_at = gamilit.now_mexico();

-- ============================================================================
-- VERIFICACION
-- ============================================================================

-- Verificar que se cargaron las 8 configuraciones de M4/M5
DO $$
DECLARE
    v_count INTEGER;
    v_m4_count INTEGER;
    v_m5_count INTEGER;
BEGIN
    -- Contar configuraciones M4
    SELECT COUNT(*) INTO v_m4_count
    FROM educational_content.exercise_validation_config
    WHERE exercise_type IN ('verificador_fake_news', 'navegacion_hipertextual', 'analisis_memes', 'infografia_interactiva', 'quiz_tiktok');

    -- Contar configuraciones M5
    SELECT COUNT(*) INTO v_m5_count
    FROM educational_content.exercise_validation_config
    WHERE exercise_type IN ('comic_digital', 'video_carta', 'diario_multimedia');

    -- Total
    SELECT COUNT(*) INTO v_count
    FROM educational_content.exercise_validation_config;

    RAISE NOTICE 'Configuraciones M4: % de 5', v_m4_count;
    RAISE NOTICE 'Configuraciones M5: % de 3', v_m5_count;
    RAISE NOTICE 'Total configuraciones: %', v_count;

    IF v_m4_count < 5 OR v_m5_count < 3 THEN
        RAISE WARNING 'Faltan configuraciones de M4/M5. M4: %, M5: %', v_m4_count, v_m5_count;
    ELSE
        RAISE NOTICE 'Todas las configuraciones M4/M5 cargadas correctamente';
    END IF;
END $$;

-- Mostrar resumen de configuraciones M4/M5
SELECT
    exercise_type,
    validation_function,
    CASE
        WHEN allow_partial_credit THEN 'Parcial'
        ELSE 'Todo/Nada'
    END as scoring,
    CASE
        WHEN special_rules->>'accept_dto_format' = 'true' THEN 'DTO+Legacy'
        ELSE 'Standard'
    END as format_support,
    default_max_points as max_pts,
    default_passing_score as pass_pts
FROM educational_content.exercise_validation_config
WHERE exercise_type IN (
    'verificador_fake_news', 'navegacion_hipertextual', 'analisis_memes',
    'infografia_interactiva', 'quiz_tiktok',
    'comic_digital', 'video_carta', 'diario_multimedia'
)
ORDER BY exercise_type;
