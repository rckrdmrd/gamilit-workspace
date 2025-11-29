-- ============================================================================
-- FUNCIÓN: validate_mapa_conceptual
-- Descripción: Validador para ejercicios tipo mapa conceptual
-- Autor: Database Agent
-- Fecha: 2025-11-28
-- Tarea: Crear funciones SQL de validación para mapa_conceptual y emparejamiento
-- ============================================================================

CREATE OR REPLACE FUNCTION educational_content.validate_mapa_conceptual(
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
    v_submitted_connections JSONB;
    v_solution_connections JSONB;
    v_correct_count INTEGER := 0;
    v_total_count INTEGER := 0;
    v_percentage INTEGER;
    v_connection JSONB;
    v_solution_conn JSONB;
    v_from_submitted TEXT;
    v_to_submitted TEXT;
    v_from_solution TEXT;
    v_to_solution TEXT;
    v_is_match BOOLEAN;
    v_results JSONB := '[]'::jsonb;
BEGIN
    -- ========================================================================
    -- 1. EXTRAER CONEXIONES DE ESTRUCTURA JSONB
    -- ========================================================================
    -- Formato esperado:
    -- solution: {"connections": [{"from": "A", "to": "B"}, {"from": "C", "to": "D"}]}
    -- submitted: {"connections": [{"from": "A", "to": "B"}, {"from": "C", "to": "E"}]}

    v_solution_connections := COALESCE(p_solution->'connections', '[]'::jsonb);
    v_submitted_connections := COALESCE(p_submitted_answer->'connections', '[]'::jsonb);

    -- Contar total de conexiones esperadas
    v_total_count := jsonb_array_length(v_solution_connections);

    -- ========================================================================
    -- 2. VALIDAR QUE EXISTAN CONEXIONES
    -- ========================================================================
    IF v_total_count = 0 THEN
        is_correct := true;
        score := p_max_points;
        feedback := 'No hay conexiones que validar';
        details := jsonb_build_object(
            'total_connections', 0,
            'correct_connections', 0,
            'incorrect_connections', 0,
            'percentage', 100,
            'results_per_connection', '[]'::jsonb
        );
        RETURN;
    END IF;

    -- ========================================================================
    -- 3. ITERAR SOBRE CONEXIONES SUBMITTED Y COMPARAR CON SOLUTION
    -- ========================================================================
    FOR v_connection IN SELECT * FROM jsonb_array_elements(v_submitted_connections)
    LOOP
        -- Obtener valores from/to del submitted
        v_from_submitted := v_connection->>'from';
        v_to_submitted := v_connection->>'to';

        -- Normalizar si es necesario
        IF p_normalize_text THEN
            v_from_submitted := gamilit.normalize_text(COALESCE(v_from_submitted, ''));
            v_to_submitted := gamilit.normalize_text(COALESCE(v_to_submitted, ''));
        END IF;

        -- Case-sensitive?
        IF NOT p_case_sensitive THEN
            v_from_submitted := UPPER(TRIM(v_from_submitted));
            v_to_submitted := UPPER(TRIM(v_to_submitted));
        ELSE
            v_from_submitted := TRIM(v_from_submitted);
            v_to_submitted := TRIM(v_to_submitted);
        END IF;

        -- Buscar match en solution (bidireccional: from->to o to->from)
        v_is_match := false;

        FOR v_solution_conn IN SELECT * FROM jsonb_array_elements(v_solution_connections)
        LOOP
            v_from_solution := v_solution_conn->>'from';
            v_to_solution := v_solution_conn->>'to';

            -- Normalizar solution
            IF p_normalize_text THEN
                v_from_solution := gamilit.normalize_text(COALESCE(v_from_solution, ''));
                v_to_solution := gamilit.normalize_text(COALESCE(v_to_solution, ''));
            END IF;

            IF NOT p_case_sensitive THEN
                v_from_solution := UPPER(TRIM(v_from_solution));
                v_to_solution := UPPER(TRIM(v_to_solution));
            ELSE
                v_from_solution := TRIM(v_from_solution);
                v_to_solution := TRIM(v_to_solution);
            END IF;

            -- Comparar bidireccional
            IF (v_from_submitted = v_from_solution AND v_to_submitted = v_to_solution) OR
               (v_from_submitted = v_to_solution AND v_to_submitted = v_from_solution) THEN
                v_is_match := true;
                EXIT;
            END IF;
        END LOOP;

        -- Registrar resultado
        IF v_is_match THEN
            v_correct_count := v_correct_count + 1;
            v_results := v_results || jsonb_build_object(
                'from', v_connection->>'from',
                'to', v_connection->>'to',
                'is_correct', true
            );
        ELSE
            v_results := v_results || jsonb_build_object(
                'from', v_connection->>'from',
                'to', v_connection->>'to',
                'is_correct', false
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
        feedback := format('¡Excelente! Todas las %s conexiones están correctas.', v_total_count);
    ELSIF v_correct_count = 0 THEN
        feedback := 'Ninguna conexión correcta. Revisa las relaciones entre conceptos.';
    ELSE
        feedback := format('Tienes %s/%s conexiones correctas (%s%%). Revisa las conexiones entre conceptos.',
                          v_correct_count,
                          v_total_count,
                          v_percentage);
    END IF;

    -- ========================================================================
    -- 6. CONSTRUIR DETAILS
    -- ========================================================================
    details := jsonb_build_object(
        'total_connections', v_total_count,
        'correct_connections', v_correct_count,
        'incorrect_connections', v_total_count - v_correct_count,
        'percentage', v_percentage,
        'results_per_connection', v_results
    );

END;
$$;

-- ============================================================================
-- COMENTARIOS
-- ============================================================================

COMMENT ON FUNCTION educational_content.validate_mapa_conceptual IS
'Validador para ejercicios tipo mapa conceptual.
Compara conexiones entre conceptos con la solución esperada.
Soporta matching bidireccional (A->B es equivalente a B->A).
Soporta normalización de texto y case-insensitive matching.
Retorna puntuación parcial basada en conexiones correctas.
Passing score: 70%';

-- ============================================================================
-- EJEMPLOS DE USO
-- ============================================================================

/*
-- Ejemplo 1: Mapa conceptual correcto (100%)
SELECT * FROM educational_content.validate_mapa_conceptual(
    '{"connections": [{"from": "Marie Curie", "to": "Polonio"}, {"from": "Marie Curie", "to": "Radio"}]}'::jsonb,
    '{"connections": [{"from": "Marie Curie", "to": "Polonio"}, {"from": "Marie Curie", "to": "Radio"}]}'::jsonb,
    100,
    false,  -- case_sensitive
    true    -- normalize_text
);

-- Resultado esperado:
-- is_correct | score | feedback                           | details
-- -----------|-------|------------------------------------|---------
-- true       | 100   | ¡Excelente! Todas las 2 conexiones...| {...}

-- Ejemplo 2: Mapa conceptual parcialmente correcto (50%)
SELECT * FROM educational_content.validate_mapa_conceptual(
    '{"connections": [{"from": "Marie Curie", "to": "Polonio"}, {"from": "Marie Curie", "to": "Radio"}]}'::jsonb,
    '{"connections": [{"from": "Marie Curie", "to": "Polonio"}, {"from": "Pierre Curie", "to": "Radio"}]}'::jsonb,
    100,
    false,
    true
);

-- Resultado esperado:
-- is_correct | score | feedback                        | details
-- -----------|-------|----------------------------------|---------
-- false      | 50    | Tienes 1/2 conexiones correctas...| {...}

-- Ejemplo 3: Bidireccional (A->B = B->A)
SELECT * FROM educational_content.validate_mapa_conceptual(
    '{"connections": [{"from": "A", "to": "B"}]}'::jsonb,
    '{"connections": [{"from": "B", "to": "A"}]}'::jsonb,
    100,
    false,
    true
);

-- Resultado esperado:
-- is_correct | score | feedback                           | details
-- -----------|-------|------------------------------------|---------
-- true       | 100   | ¡Excelente! Todas las 1 conexiones...| {...}
*/
