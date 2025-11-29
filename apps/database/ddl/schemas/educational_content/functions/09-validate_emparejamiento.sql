-- ============================================================================
-- FUNCIÓN: validate_emparejamiento
-- Descripción: Validador para ejercicios tipo emparejamiento (matching)
-- Autor: Database Agent
-- Fecha: 2025-11-28
-- Tarea: Crear funciones SQL de validación para mapa_conceptual y emparejamiento
-- ============================================================================

CREATE OR REPLACE FUNCTION educational_content.validate_emparejamiento(
    p_solution JSONB,
    p_submitted_answer JSONB,
    p_max_points INTEGER,
    p_case_sensitive BOOLEAN DEFAULT false,
    p_normalize_text BOOLEAN DEFAULT true,
    OUT is_correct BOOLEAN,
    OUT score INTEGER,
    OUT feedback TEXT,
    OUT details JSONB
)
RETURNS RECORD
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    v_submitted_matches JSONB;
    v_correct_matches JSONB;
    v_correct_count INTEGER := 0;
    v_total_count INTEGER := 0;
    v_percentage INTEGER;
    v_key TEXT;
    v_submitted_value TEXT;
    v_correct_value TEXT;
    v_results JSONB := '[]'::jsonb;
BEGIN
    -- ========================================================================
    -- 1. EXTRAER MATCHES DE ESTRUCTURA JSONB
    -- ========================================================================
    -- Formato esperado:
    -- solution: {"correctMatches": {"term1": "def1", "term2": "def2"}} o {"matches": {...}}
    -- submitted: {"matches": {"term1": "def1", "term2": "def3"}}

    v_submitted_matches := COALESCE(p_submitted_answer->'matches', '{}'::jsonb);
    v_correct_matches := COALESCE(
        p_solution->'correctMatches',
        p_solution->'matches',
        '{}'::jsonb
    );

    -- Contar total de pares esperados
    SELECT COUNT(*) INTO v_total_count
    FROM jsonb_object_keys(v_correct_matches);

    -- ========================================================================
    -- 2. VALIDAR QUE EXISTAN MATCHES
    -- ========================================================================
    IF v_total_count = 0 THEN
        is_correct := true;
        score := p_max_points;
        feedback := 'No hay emparejamientos que validar';
        details := jsonb_build_object(
            'total_matches', 0,
            'correct_matches', 0,
            'incorrect_matches', 0,
            'percentage', 100,
            'results_per_match', '[]'::jsonb
        );
        RETURN;
    END IF;

    -- ========================================================================
    -- 3. ITERAR SOBRE CADA PAR Y COMPARAR
    -- ========================================================================
    FOR v_key IN SELECT * FROM jsonb_object_keys(v_correct_matches)
    LOOP
        -- Obtener valores
        v_submitted_value := v_submitted_matches->>v_key;
        v_correct_value := v_correct_matches->>v_key;

        -- Normalizar si es necesario
        IF p_normalize_text THEN
            v_submitted_value := gamilit.normalize_text(COALESCE(v_submitted_value, ''));
            v_correct_value := gamilit.normalize_text(v_correct_value);
        END IF;

        -- Case-sensitive?
        IF NOT p_case_sensitive THEN
            v_submitted_value := UPPER(TRIM(v_submitted_value));
            v_correct_value := UPPER(TRIM(v_correct_value));
        ELSE
            v_submitted_value := TRIM(v_submitted_value);
            v_correct_value := TRIM(v_correct_value);
        END IF;

        -- Comparar
        IF v_submitted_value = v_correct_value THEN
            v_correct_count := v_correct_count + 1;

            v_results := v_results || jsonb_build_object(
                'key', v_key,
                'is_correct', true,
                'submitted', p_submitted_answer->'matches'->>v_key,
                'expected', p_solution->COALESCE(
                    CASE WHEN p_solution ? 'correctMatches' THEN 'correctMatches' ELSE 'matches' END,
                    'correctMatches'
                )->>v_key
            );
        ELSE
            v_results := v_results || jsonb_build_object(
                'key', v_key,
                'is_correct', false,
                'submitted', COALESCE(p_submitted_answer->'matches'->>v_key, ''),
                'expected', p_solution->COALESCE(
                    CASE WHEN p_solution ? 'correctMatches' THEN 'correctMatches' ELSE 'matches' END,
                    'correctMatches'
                )->>v_key
            );
        END IF;
    END LOOP;

    -- ========================================================================
    -- 4. CALCULAR SCORE Y RESULTADO
    -- ========================================================================
    v_percentage := ROUND((v_correct_count::NUMERIC / v_total_count) * 100);
    score := ROUND((v_correct_count::NUMERIC / v_total_count) * p_max_points);
    is_correct := (v_percentage >= 70);  -- Passing score 70%

    -- ========================================================================
    -- 5. GENERAR FEEDBACK
    -- ========================================================================
    IF v_correct_count = v_total_count THEN
        feedback := format('¡Perfecto! Todos los %s emparejamientos están correctos.', v_total_count);
    ELSIF v_correct_count = 0 THEN
        feedback := 'Ningún emparejamiento correcto. Revisa las relaciones entre términos.';
    ELSE
        feedback := format('Tienes %s/%s emparejamientos correctos (%s%%). Algunos emparejamientos son incorrectos.',
                          v_correct_count,
                          v_total_count,
                          v_percentage);
    END IF;

    -- ========================================================================
    -- 6. CONSTRUIR DETAILS
    -- ========================================================================
    details := jsonb_build_object(
        'total_matches', v_total_count,
        'correct_matches', v_correct_count,
        'incorrect_matches', v_total_count - v_correct_count,
        'percentage', v_percentage,
        'results_per_match', v_results
    );

END;
$$;

-- ============================================================================
-- COMENTARIOS
-- ============================================================================

COMMENT ON FUNCTION educational_content.validate_emparejamiento IS
'Validador para ejercicios tipo emparejamiento (matching).
Compara pares item-respuesta con la solución esperada.
Soporta normalización de texto y case-insensitive matching.
Retorna puntuación parcial basada en emparejamientos correctos.
Passing score: 70%';

-- ============================================================================
-- EJEMPLOS DE USO
-- ============================================================================

/*
-- Ejemplo 1: Emparejamiento correcto (100%)
SELECT * FROM educational_content.validate_emparejamiento(
    '{"correctMatches": {"cientifica": "Marie Curie", "elemento": "Polonio", "premio": "Nobel"}}'::jsonb,
    '{"matches": {"cientifica": "Marie Curie", "elemento": "Polonio", "premio": "Nobel"}}'::jsonb,
    100,
    false,  -- case_sensitive
    true    -- normalize_text
);

-- Resultado esperado:
-- is_correct | score | feedback                           | details
-- -----------|-------|------------------------------------|---------
-- true       | 100   | ¡Perfecto! Todos los 3 empareja... | {...}

-- Ejemplo 2: Emparejamiento parcialmente correcto (67%)
SELECT * FROM educational_content.validate_emparejamiento(
    '{"correctMatches": {"cientifica": "Marie Curie", "elemento": "Polonio", "premio": "Nobel"}}'::jsonb,
    '{"matches": {"cientifica": "Marie Curie", "elemento": "Radio", "premio": "Nobel"}}'::jsonb,
    100,
    false,
    true
);

-- Resultado esperado:
-- is_correct | score | feedback                        | details
-- -----------|-------|----------------------------------|---------
-- false      | 67    | Tienes 2/3 emparejamientos co... | {...}

-- Ejemplo 3: Sin emparejamientos correctos (0%)
SELECT * FROM educational_content.validate_emparejamiento(
    '{"correctMatches": {"a": "1", "b": "2", "c": "3"}}'::jsonb,
    '{"matches": {"a": "x", "b": "y", "c": "z"}}'::jsonb,
    100,
    false,
    true
);

-- Resultado esperado:
-- is_correct | score | feedback                        | details
-- -----------|-------|----------------------------------|---------
-- false      | 0     | Ningún emparejamiento correcto... | {...}

-- Ejemplo 4: Usando "matches" en solution (legacy support)
SELECT * FROM educational_content.validate_emparejamiento(
    '{"matches": {"term1": "def1", "term2": "def2"}}'::jsonb,
    '{"matches": {"term1": "def1", "term2": "def2"}}'::jsonb,
    100,
    false,
    true
);

-- Resultado esperado:
-- is_correct | score | feedback                           | details
-- -----------|-------|------------------------------------|---------
-- true       | 100   | ¡Perfecto! Todos los 2 empareja... | {...}
*/
