-- =====================================================
-- Seed: educational_content.assessment_rubrics (PROD)
-- Description: Rubricas de evaluacion para ejercicios
-- Environment: PRODUCTION
-- Dependencies: educational_content.modules
-- Order: 07
-- Created: 2025-01-11
-- Version: 1.1 (fixed column names to match DDL)
-- =====================================================
--
-- RUBRICAS INCLUIDAS:
-- - Comprension Literal (3 niveles)
-- - Comprension Inferencial (3 niveles)
-- - Comprension Critica (4 niveles)
-- - Produccion de Textos (5 niveles)
--
-- TOTAL: 15 rubricas (criteria)
--
-- IMPORTANTE: Estas rubricas son usadas para evaluar ejercicios.
-- DDL columns: id, exercise_id, module_id, name, description,
--   assessment_type, criteria, scoring_scale, weight_percentage,
--   is_active, allow_resubmission, feedback_template,
--   auto_feedback_enabled, metadata, created_by, created_at, updated_at
-- Constraint: rubric_reference_check requires exercise_id XOR module_id
-- =====================================================

SET search_path TO educational_content, public;

-- =====================================================
-- INSERT: Rubricas de Evaluacion
-- =====================================================

DO $$
DECLARE
    v_mod1_id UUID;
    v_mod2_id UUID;
    v_mod3_id UUID;
    v_mod5_id UUID;
BEGIN
    -- Look up module IDs by module_code
    SELECT id INTO v_mod1_id FROM educational_content.modules WHERE module_code = 'MOD-01-LITERAL';
    SELECT id INTO v_mod2_id FROM educational_content.modules WHERE module_code = 'MOD-02-INFERENCIAL';
    SELECT id INTO v_mod3_id FROM educational_content.modules WHERE module_code = 'MOD-03-CRITICA';
    SELECT id INTO v_mod5_id FROM educational_content.modules WHERE module_code = 'MOD-05-PRODUCCION';

    IF v_mod1_id IS NULL THEN
        -- Fallback: try alternative code pattern
        SELECT id INTO v_mod5_id FROM educational_content.modules WHERE module_code ILIKE '%PRODUC%' OR module_code ILIKE '%MOD-05%';
    END IF;

-- =====================================================
-- MODULO 1: COMPRENSION LITERAL
-- =====================================================
INSERT INTO educational_content.assessment_rubrics (
    id,
    module_id,
    name,
    description,
    assessment_type,
    criteria,
    scoring_scale,
    is_active,
    metadata,
    created_at,
    updated_at
) VALUES
(
    '80000001-0001-0000-0000-000000000001'::uuid,
    v_mod1_id,
    'Comprension Literal - Nivel Basico',
    'Rubrica para evaluar comprension literal basica: identificacion de informacion explicita.',
    'automatic',
    jsonb_build_object(
        'nivel_1', jsonb_build_object(
            'name', 'Insuficiente',
            'description', 'No identifica informacion basica del texto',
            'score', 0,
            'indicators', jsonb_build_array(
                'No localiza datos explicitos',
                'Confunde informacion principal'
            )
        ),
        'nivel_2', jsonb_build_object(
            'name', 'Suficiente',
            'description', 'Identifica algunos datos explicitos',
            'score', 50,
            'indicators', jsonb_build_array(
                'Localiza datos basicos',
                'Identifica personajes y lugares'
            )
        ),
        'nivel_3', jsonb_build_object(
            'name', 'Excelente',
            'description', 'Identifica toda la informacion explicita relevante',
            'score', 100,
            'indicators', jsonb_build_array(
                'Localiza todos los datos explicitos',
                'Distingue ideas principales de secundarias',
                'Comprende la secuencia cronologica'
            )
        )
    ),
    jsonb_build_object(
        'max', 100,
        'min', 0,
        'passing', 60
    ),
    true,
    jsonb_build_object(
        'module_name', 'MODULO 1: Comprension Literal',
        'bloom_level', 'remember',
        'created_by', 'seed_script'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

(
    '80000001-0002-0000-0000-000000000002'::uuid,
    v_mod1_id,
    'Comprension Literal - Nivel Intermedio',
    'Rubrica para evaluar comprension literal intermedia: organizacion y secuenciacion.',
    'automatic',
    jsonb_build_object(
        'nivel_1', jsonb_build_object(
            'name', 'Insuficiente',
            'description', 'No puede organizar la informacion',
            'score', 0
        ),
        'nivel_2', jsonb_build_object(
            'name', 'Suficiente',
            'description', 'Organiza informacion con ayuda',
            'score', 70
        ),
        'nivel_3', jsonb_build_object(
            'name', 'Excelente',
            'description', 'Organiza y secuencia informacion de forma autonoma',
            'score', 100
        )
    ),
    jsonb_build_object(
        'max', 100,
        'min', 0,
        'passing', 70
    ),
    true,
    jsonb_build_object(
        'module_name', 'MODULO 1: Comprension Literal',
        'bloom_level', 'understand'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

(
    '80000001-0003-0000-0000-000000000003'::uuid,
    v_mod1_id,
    'Comprension Literal - Nivel Avanzado',
    'Rubrica para evaluar comprension literal avanzada: integracion de informacion multiple.',
    'automatic',
    jsonb_build_object(
        'nivel_1', jsonb_build_object(
            'name', 'Insuficiente',
            'description', 'No puede integrar informacion de multiples fuentes',
            'score', 0
        ),
        'nivel_2', jsonb_build_object(
            'name', 'Suficiente',
            'description', 'Integra informacion de 2-3 fuentes',
            'score', 75
        ),
        'nivel_3', jsonb_build_object(
            'name', 'Excelente',
            'description', 'Integra y sintetiza informacion de multiples fuentes',
            'score', 100
        )
    ),
    jsonb_build_object(
        'max', 100,
        'min', 0,
        'passing', 75
    ),
    true,
    jsonb_build_object(
        'module_name', 'MODULO 1: Comprension Literal',
        'bloom_level', 'apply'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

-- =====================================================
-- MODULO 2: COMPRENSION INFERENCIAL
-- =====================================================
(
    '80000002-0001-0000-0000-000000000004'::uuid,
    v_mod2_id,
    'Comprension Inferencial - Nivel Basico',
    'Rubrica para evaluar inferencias simples y deducciones basicas.',
    'automatic',
    jsonb_build_object(
        'nivel_1', jsonb_build_object(
            'name', 'Insuficiente',
            'description', 'No realiza inferencias',
            'score', 0
        ),
        'nivel_2', jsonb_build_object(
            'name', 'Suficiente',
            'description', 'Realiza inferencias simples',
            'score', 65
        ),
        'nivel_3', jsonb_build_object(
            'name', 'Excelente',
            'description', 'Realiza inferencias precisas y justificadas',
            'score', 100
        )
    ),
    jsonb_build_object(
        'max', 100,
        'min', 0,
        'passing', 65
    ),
    true,
    jsonb_build_object(
        'module_name', 'MODULO 2: Comprension Inferencial',
        'bloom_level', 'understand'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

(
    '80000002-0002-0000-0000-000000000005'::uuid,
    v_mod2_id,
    'Comprension Inferencial - Nivel Intermedio',
    'Rubrica para evaluar predicciones y analisis de causa-efecto.',
    'automatic',
    jsonb_build_object(
        'nivel_1', jsonb_build_object(
            'name', 'Insuficiente',
            'description', 'No identifica relaciones causa-efecto',
            'score', 0
        ),
        'nivel_2', jsonb_build_object(
            'name', 'Suficiente',
            'description', 'Identifica algunas relaciones causa-efecto',
            'score', 70
        ),
        'nivel_3', jsonb_build_object(
            'name', 'Excelente',
            'description', 'Analiza relaciones causa-efecto complejas',
            'score', 100
        )
    ),
    jsonb_build_object(
        'max', 100,
        'min', 0,
        'passing', 70
    ),
    true,
    jsonb_build_object(
        'module_name', 'MODULO 2: Comprension Inferencial',
        'bloom_level', 'analyze'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

(
    '80000002-0003-0000-0000-000000000006'::uuid,
    v_mod2_id,
    'Comprension Inferencial - Nivel Avanzado',
    'Rubrica para evaluar interpretacion de intenciones y lenguaje figurado.',
    'automatic',
    jsonb_build_object(
        'nivel_1', jsonb_build_object(
            'name', 'Insuficiente',
            'description', 'No interpreta lenguaje figurado',
            'score', 0
        ),
        'nivel_2', jsonb_build_object(
            'name', 'Suficiente',
            'description', 'Interpreta lenguaje figurado simple',
            'score', 75
        ),
        'nivel_3', jsonb_build_object(
            'name', 'Excelente',
            'description', 'Interpreta intenciones y lenguaje figurado complejo',
            'score', 100
        )
    ),
    jsonb_build_object(
        'max', 100,
        'min', 0,
        'passing', 75
    ),
    true,
    jsonb_build_object(
        'module_name', 'MODULO 2: Comprension Inferencial',
        'bloom_level', 'analyze'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

-- =====================================================
-- MODULO 3: COMPRENSION CRITICA
-- =====================================================
(
    '80000003-0001-0000-0000-000000000007'::uuid,
    v_mod3_id,
    'Comprension Critica - Nivel 1: Analisis',
    'Rubrica para evaluar analisis critico de textos.',
    'manual',
    jsonb_build_object(
        'nivel_1', jsonb_build_object('name', 'Insuficiente', 'score', 0),
        'nivel_2', jsonb_build_object('name', 'Basico', 'score', 50),
        'nivel_3', jsonb_build_object('name', 'Competente', 'score', 75),
        'nivel_4', jsonb_build_object('name', 'Excelente', 'score', 100,
            'description', 'Analisis critico profundo y fundamentado')
    ),
    jsonb_build_object('max', 100, 'min', 0, 'passing', 65),
    true,
    jsonb_build_object(
        'module_name', 'MODULO 3: Comprension Critica',
        'bloom_level', 'analyze'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

(
    '80000003-0002-0000-0000-000000000008'::uuid,
    v_mod3_id,
    'Comprension Critica - Nivel 2: Evaluacion',
    'Rubrica para evaluar juicios y valoraciones fundamentadas.',
    'manual',
    jsonb_build_object(
        'nivel_1', jsonb_build_object('name', 'Insuficiente', 'score', 0),
        'nivel_2', jsonb_build_object('name', 'Basico', 'score', 55),
        'nivel_3', jsonb_build_object('name', 'Competente', 'score', 75),
        'nivel_4', jsonb_build_object('name', 'Excelente', 'score', 100)
    ),
    jsonb_build_object('max', 100, 'min', 0, 'passing', 70),
    true,
    jsonb_build_object(
        'module_name', 'MODULO 3: Comprension Critica',
        'bloom_level', 'evaluate'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

(
    '80000003-0003-0000-0000-000000000009'::uuid,
    v_mod3_id,
    'Comprension Critica - Nivel 3: Argumentacion',
    'Rubrica para evaluar construccion de argumentos solidos.',
    'manual',
    jsonb_build_object(
        'nivel_1', jsonb_build_object('name', 'Insuficiente', 'score', 0),
        'nivel_2', jsonb_build_object('name', 'Basico', 'score', 60),
        'nivel_3', jsonb_build_object('name', 'Competente', 'score', 80),
        'nivel_4', jsonb_build_object('name', 'Excelente', 'score', 100)
    ),
    jsonb_build_object('max', 100, 'min', 0, 'passing', 75),
    true,
    jsonb_build_object(
        'module_name', 'MODULO 3: Comprension Critica',
        'bloom_level', 'evaluate'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

(
    '80000003-0004-0000-0000-000000000010'::uuid,
    v_mod3_id,
    'Comprension Critica - Nivel 4: Sintesis',
    'Rubrica para evaluar sintesis y propuestas creativas.',
    'manual',
    jsonb_build_object(
        'nivel_1', jsonb_build_object('name', 'Insuficiente', 'score', 0),
        'nivel_2', jsonb_build_object('name', 'Basico', 'score', 60),
        'nivel_3', jsonb_build_object('name', 'Competente', 'score', 80),
        'nivel_4', jsonb_build_object('name', 'Excelente', 'score', 100)
    ),
    jsonb_build_object('max', 100, 'min', 0, 'passing', 75),
    true,
    jsonb_build_object(
        'module_name', 'MODULO 3: Comprension Critica',
        'bloom_level', 'create'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

-- =====================================================
-- MODULO 5: PRODUCCION DE TEXTOS
-- =====================================================
(
    '80000005-0001-0000-0000-000000000011'::uuid,
    v_mod5_id,
    'Produccion de Textos - Nivel 1: Estructura',
    'Rubrica para evaluar estructura y organizacion textual.',
    'hybrid',
    jsonb_build_object(
        'nivel_1', jsonb_build_object('name', 'Deficiente', 'score', 0),
        'nivel_2', jsonb_build_object('name', 'Insuficiente', 'score', 40),
        'nivel_3', jsonb_build_object('name', 'Aceptable', 'score', 60),
        'nivel_4', jsonb_build_object('name', 'Bueno', 'score', 80),
        'nivel_5', jsonb_build_object('name', 'Excelente', 'score', 100)
    ),
    jsonb_build_object('max', 100, 'min', 0, 'passing', 60),
    true,
    jsonb_build_object(
        'module_name', 'MODULO 5: Produccion de Textos',
        'bloom_level', 'create',
        'criteria_focus', 'structure'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

(
    '80000005-0002-0000-0000-000000000012'::uuid,
    v_mod5_id,
    'Produccion de Textos - Nivel 2: Contenido',
    'Rubrica para evaluar calidad y relevancia del contenido.',
    'hybrid',
    jsonb_build_object(
        'nivel_1', jsonb_build_object('name', 'Deficiente', 'score', 0),
        'nivel_2', jsonb_build_object('name', 'Insuficiente', 'score', 40),
        'nivel_3', jsonb_build_object('name', 'Aceptable', 'score', 65),
        'nivel_4', jsonb_build_object('name', 'Bueno', 'score', 85),
        'nivel_5', jsonb_build_object('name', 'Excelente', 'score', 100)
    ),
    jsonb_build_object('max', 100, 'min', 0, 'passing', 65),
    true,
    jsonb_build_object(
        'module_name', 'MODULO 5: Produccion de Textos',
        'bloom_level', 'create',
        'criteria_focus', 'content'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

(
    '80000005-0003-0000-0000-000000000013'::uuid,
    v_mod5_id,
    'Produccion de Textos - Nivel 3: Lenguaje',
    'Rubrica para evaluar uso del lenguaje y vocabulario.',
    'hybrid',
    jsonb_build_object(
        'nivel_1', jsonb_build_object('name', 'Deficiente', 'score', 0),
        'nivel_2', jsonb_build_object('name', 'Insuficiente', 'score', 45),
        'nivel_3', jsonb_build_object('name', 'Aceptable', 'score', 65),
        'nivel_4', jsonb_build_object('name', 'Bueno', 'score', 85),
        'nivel_5', jsonb_build_object('name', 'Excelente', 'score', 100)
    ),
    jsonb_build_object('max', 100, 'min', 0, 'passing', 65),
    true,
    jsonb_build_object(
        'module_name', 'MODULO 5: Produccion de Textos',
        'bloom_level', 'create',
        'criteria_focus', 'language'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

(
    '80000005-0004-0000-0000-000000000014'::uuid,
    v_mod5_id,
    'Produccion de Textos - Nivel 4: Coherencia',
    'Rubrica para evaluar coherencia y cohesion textual.',
    'hybrid',
    jsonb_build_object(
        'nivel_1', jsonb_build_object('name', 'Deficiente', 'score', 0),
        'nivel_2', jsonb_build_object('name', 'Insuficiente', 'score', 50),
        'nivel_3', jsonb_build_object('name', 'Aceptable', 'score', 70),
        'nivel_4', jsonb_build_object('name', 'Bueno', 'score', 85),
        'nivel_5', jsonb_build_object('name', 'Excelente', 'score', 100)
    ),
    jsonb_build_object('max', 100, 'min', 0, 'passing', 70),
    true,
    jsonb_build_object(
        'module_name', 'MODULO 5: Produccion de Textos',
        'bloom_level', 'create',
        'criteria_focus', 'coherence'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

(
    '80000005-0005-0000-0000-000000000015'::uuid,
    v_mod5_id,
    'Produccion de Textos - Nivel 5: Creatividad',
    'Rubrica para evaluar originalidad y creatividad.',
    'hybrid',
    jsonb_build_object(
        'nivel_1', jsonb_build_object('name', 'Deficiente', 'score', 0),
        'nivel_2', jsonb_build_object('name', 'Insuficiente', 'score', 50),
        'nivel_3', jsonb_build_object('name', 'Aceptable', 'score', 70),
        'nivel_4', jsonb_build_object('name', 'Bueno', 'score', 90),
        'nivel_5', jsonb_build_object('name', 'Excelente', 'score', 100)
    ),
    jsonb_build_object('max', 100, 'min', 0, 'passing', 70),
    true,
    jsonb_build_object(
        'module_name', 'MODULO 5: Produccion de Textos',
        'bloom_level', 'create',
        'criteria_focus', 'creativity'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
)

ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    assessment_type = EXCLUDED.assessment_type,
    criteria = EXCLUDED.criteria,
    scoring_scale = EXCLUDED.scoring_scale,
    is_active = EXCLUDED.is_active,
    metadata = EXCLUDED.metadata,
    updated_at = gamilit.now_mexico();

-- =====================================================
-- Verification Query
-- =====================================================

    DECLARE
        rubric_count INTEGER;
    BEGIN
        SELECT COUNT(*) INTO rubric_count
        FROM educational_content.assessment_rubrics;

        RAISE NOTICE '========================================';
        RAISE NOTICE 'RUBRICAS DE EVALUACION CREADAS: %', rubric_count;
        RAISE NOTICE '========================================';
    END;

END $$;
