-- ============================================================================
-- FUNCIÓN: validate_module4_module5_answer
-- Descripción: Validador de estructura JSONB para ejercicios de Módulos 4 y 5
-- Autor: Database-Agent
-- Fecha: 2025-11-29
-- Tarea: DB-VALIDATORS-M4M5
-- ============================================================================
-- IMPORTANTE: Esta función NO evalúa calidad de contenido.
-- Solo valida que la estructura JSONB de la respuesta sea correcta.
-- SIEMPRE retorna requires_manual_review = true.
--
-- Tipos soportados:
--   Módulo 4 (5 tipos):
--     - verificador_fake_news
--     - infografia_interactiva
--     - quiz_tiktok
--     - navegacion_hipertextual
--     - analisis_memes
--
--   Módulo 5 (3 tipos):
--     - diario_multimedia
--     - comic_digital
--     - video_carta
-- ============================================================================

CREATE OR REPLACE FUNCTION educational_content.validate_module4_module5_answer(
    p_exercise_type educational_content.exercise_type,
    p_submitted_answer JSONB,
    p_max_points INTEGER DEFAULT 100,
    OUT is_valid BOOLEAN,
    OUT validation_errors TEXT[],
    OUT requires_manual_review BOOLEAN,
    OUT details JSONB
)
RETURNS RECORD
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    v_errors TEXT[] := ARRAY[]::TEXT[];
    v_details JSONB := '{}'::jsonb;
    v_claim JSONB;
    v_entry JSONB;
    v_panel JSONB;
    v_annotation JSONB;
    v_count INTEGER;
    i INTEGER;
BEGIN
    -- ========================================================================
    -- 1. VALIDACIÓN BÁSICA
    -- ========================================================================
    IF p_submitted_answer IS NULL OR p_submitted_answer = 'null'::jsonb THEN
        is_valid := false;
        validation_errors := ARRAY['Respuesta vacía o nula']::TEXT[];
        requires_manual_review := true;
        details := jsonb_build_object('error', 'null_answer');
        RETURN;
    END IF;

    -- ========================================================================
    -- 2. VALIDACIÓN POR TIPO DE EJERCICIO
    -- ========================================================================
    CASE p_exercise_type

        -- ====================================================================
        -- MÓDULO 4: LECTURA DIGITAL Y MULTIMODAL
        -- ====================================================================

        -- --------------------------------------------------------------------
        -- 4.1. VERIFICADOR DE FAKE NEWS
        -- --------------------------------------------------------------------
        WHEN 'verificador_fake_news' THEN
            -- Validar campo claims_verified
            IF NOT (p_submitted_answer ? 'claims_verified') THEN
                v_errors := array_append(v_errors, 'Campo "claims_verified" faltante');
            ELSIF jsonb_typeof(p_submitted_answer->'claims_verified') != 'array' THEN
                v_errors := array_append(v_errors, 'Campo "claims_verified" debe ser un array');
            ELSE
                v_count := jsonb_array_length(p_submitted_answer->'claims_verified');

                IF v_count = 0 THEN
                    v_errors := array_append(v_errors, 'El array "claims_verified" no puede estar vacío');
                ELSE
                    -- Validar estructura de cada claim
                    FOR i IN 0..v_count-1
                    LOOP
                        v_claim := p_submitted_answer->'claims_verified'->i;

                        IF NOT (v_claim ? 'claim_id') THEN
                            v_errors := array_append(v_errors, format('Claim %s: falta campo "claim_id"', i + 1));
                        END IF;

                        IF NOT (v_claim ? 'is_fake') THEN
                            v_errors := array_append(v_errors, format('Claim %s: falta campo "is_fake"', i + 1));
                        ELSIF jsonb_typeof(v_claim->'is_fake') != 'boolean' THEN
                            v_errors := array_append(v_errors, format('Claim %s: "is_fake" debe ser boolean', i + 1));
                        END IF;

                        IF NOT (v_claim ? 'evidence') THEN
                            v_errors := array_append(v_errors, format('Claim %s: falta campo "evidence"', i + 1));
                        ELSIF length(trim(v_claim->>'evidence')) < 10 THEN
                            v_errors := array_append(v_errors, format('Claim %s: "evidence" debe tener al menos 10 caracteres', i + 1));
                        END IF;
                    END LOOP;
                END IF;

                v_details := jsonb_build_object(
                    'claims_count', v_count,
                    'validation_type', 'structure'
                );
            END IF;

        -- --------------------------------------------------------------------
        -- 4.2. INFOGRAFÍA INTERACTIVA
        -- --------------------------------------------------------------------
        WHEN 'infografia_interactiva' THEN
            -- Validar campo answers
            IF NOT (p_submitted_answer ? 'answers') THEN
                v_errors := array_append(v_errors, 'Campo "answers" faltante');
            ELSIF jsonb_typeof(p_submitted_answer->'answers') != 'object' THEN
                v_errors := array_append(v_errors, 'Campo "answers" debe ser un objeto');
            END IF;

            -- Validar campo sections_explored
            IF NOT (p_submitted_answer ? 'sections_explored') THEN
                v_errors := array_append(v_errors, 'Campo "sections_explored" faltante');
            ELSIF jsonb_typeof(p_submitted_answer->'sections_explored') != 'array' THEN
                v_errors := array_append(v_errors, 'Campo "sections_explored" debe ser un array');
            ELSIF jsonb_array_length(p_submitted_answer->'sections_explored') = 0 THEN
                v_errors := array_append(v_errors, 'El array "sections_explored" debe tener al menos 1 elemento');
            END IF;

            v_details := jsonb_build_object(
                'sections_explored_count', jsonb_array_length(p_submitted_answer->'sections_explored'),
                'validation_type', 'structure'
            );

        -- --------------------------------------------------------------------
        -- 4.3. QUIZ TIKTOK
        -- --------------------------------------------------------------------
        WHEN 'quiz_tiktok' THEN
            -- Validar campo answers
            IF NOT (p_submitted_answer ? 'answers') THEN
                v_errors := array_append(v_errors, 'Campo "answers" faltante');
            ELSIF jsonb_typeof(p_submitted_answer->'answers') != 'array' THEN
                v_errors := array_append(v_errors, 'Campo "answers" debe ser un array');
            ELSE
                v_count := jsonb_array_length(p_submitted_answer->'answers');

                IF v_count = 0 THEN
                    v_errors := array_append(v_errors, 'El array "answers" no puede estar vacío');
                ELSE
                    -- Validar que cada elemento sea un número
                    FOR i IN 0..v_count-1
                    LOOP
                        IF jsonb_typeof(p_submitted_answer->'answers'->i) != 'number' THEN
                            v_errors := array_append(v_errors, format('Respuesta %s: debe ser un número', i + 1));
                        ELSIF (p_submitted_answer->'answers'->>i)::INTEGER < 0 THEN
                            v_errors := array_append(v_errors, format('Respuesta %s: debe ser >= 0', i + 1));
                        END IF;
                    END LOOP;
                END IF;

                v_details := jsonb_build_object(
                    'answers_count', v_count,
                    'validation_type', 'structure'
                );
            END IF;

        -- --------------------------------------------------------------------
        -- 4.4. NAVEGACIÓN HIPERTEXTUAL
        -- --------------------------------------------------------------------
        WHEN 'navegacion_hipertextual' THEN
            -- Validar campo path
            IF NOT (p_submitted_answer ? 'path') THEN
                v_errors := array_append(v_errors, 'Campo "path" faltante');
            ELSIF jsonb_typeof(p_submitted_answer->'path') != 'array' THEN
                v_errors := array_append(v_errors, 'Campo "path" debe ser un array');
            ELSIF jsonb_array_length(p_submitted_answer->'path') < 2 THEN
                v_errors := array_append(v_errors, 'El array "path" debe tener al menos 2 elementos (inicio y destino)');
            END IF;

            -- Validar campo information_found
            IF NOT (p_submitted_answer ? 'information_found') THEN
                v_errors := array_append(v_errors, 'Campo "information_found" faltante');
            ELSIF jsonb_typeof(p_submitted_answer->'information_found') != 'object' THEN
                v_errors := array_append(v_errors, 'Campo "information_found" debe ser un objeto');
            END IF;

            v_details := jsonb_build_object(
                'path_length', jsonb_array_length(p_submitted_answer->'path'),
                'validation_type', 'structure'
            );

        -- --------------------------------------------------------------------
        -- 4.5. ANÁLISIS DE MEMES
        -- --------------------------------------------------------------------
        WHEN 'analisis_memes' THEN
            -- Validar campo annotations
            IF NOT (p_submitted_answer ? 'annotations') THEN
                v_errors := array_append(v_errors, 'Campo "annotations" faltante');
            ELSIF jsonb_typeof(p_submitted_answer->'annotations') != 'array' THEN
                v_errors := array_append(v_errors, 'Campo "annotations" debe ser un array');
            ELSE
                v_count := jsonb_array_length(p_submitted_answer->'annotations');

                -- Validar estructura de cada anotación
                FOR i IN 0..v_count-1
                LOOP
                    v_annotation := p_submitted_answer->'annotations'->i;

                    IF NOT (v_annotation ? 'element') THEN
                        v_errors := array_append(v_errors, format('Anotación %s: falta campo "element"', i + 1));
                    END IF;

                    IF NOT (v_annotation ? 'interpretation') THEN
                        v_errors := array_append(v_errors, format('Anotación %s: falta campo "interpretation"', i + 1));
                    END IF;
                END LOOP;
            END IF;

            -- Validar campo analysis
            IF NOT (p_submitted_answer ? 'analysis') THEN
                v_errors := array_append(v_errors, 'Campo "analysis" faltante');
            ELSIF jsonb_typeof(p_submitted_answer->'analysis') != 'object' THEN
                v_errors := array_append(v_errors, 'Campo "analysis" debe ser un objeto');
            ELSE
                IF NOT (p_submitted_answer->'analysis' ? 'message') THEN
                    v_errors := array_append(v_errors, 'Campo "analysis.message" faltante');
                ELSIF length(trim(p_submitted_answer->'analysis'->>'message')) = 0 THEN
                    v_errors := array_append(v_errors, 'Campo "analysis.message" no puede estar vacío');
                END IF;
            END IF;

            v_details := jsonb_build_object(
                'annotations_count', jsonb_array_length(p_submitted_answer->'annotations'),
                'validation_type', 'structure'
            );

        -- ====================================================================
        -- MÓDULO 5: PRODUCCIÓN Y EXPRESIÓN LECTORA
        -- ====================================================================

        -- --------------------------------------------------------------------
        -- 5.1. DIARIO MULTIMEDIA
        -- --------------------------------------------------------------------
        WHEN 'diario_multimedia' THEN
            -- Validar campo entries
            IF NOT (p_submitted_answer ? 'entries') THEN
                v_errors := array_append(v_errors, 'Campo "entries" faltante');
            ELSIF jsonb_typeof(p_submitted_answer->'entries') != 'array' THEN
                v_errors := array_append(v_errors, 'Campo "entries" debe ser un array');
            ELSE
                v_count := jsonb_array_length(p_submitted_answer->'entries');

                IF v_count = 0 THEN
                    v_errors := array_append(v_errors, 'El array "entries" debe tener al menos 1 entrada');
                ELSE
                    -- Validar estructura de cada entrada
                    FOR i IN 0..v_count-1
                    LOOP
                        v_entry := p_submitted_answer->'entries'->i;

                        IF NOT (v_entry ? 'date') THEN
                            v_errors := array_append(v_errors, format('Entrada %s: falta campo "date"', i + 1));
                        END IF;

                        IF NOT (v_entry ? 'content') THEN
                            v_errors := array_append(v_errors, format('Entrada %s: falta campo "content"', i + 1));
                        ELSIF length(trim(v_entry->>'content')) < 50 THEN
                            v_errors := array_append(v_errors, format('Entrada %s: "content" debe tener al menos 50 caracteres', i + 1));
                        END IF;
                    END LOOP;
                END IF;

                v_details := jsonb_build_object(
                    'entries_count', v_count,
                    'validation_type', 'structure'
                );
            END IF;

        -- --------------------------------------------------------------------
        -- 5.2. CÓMIC DIGITAL
        -- --------------------------------------------------------------------
        WHEN 'comic_digital' THEN
            -- Validar campo panels
            IF NOT (p_submitted_answer ? 'panels') THEN
                v_errors := array_append(v_errors, 'Campo "panels" faltante');
            ELSIF jsonb_typeof(p_submitted_answer->'panels') != 'array' THEN
                v_errors := array_append(v_errors, 'Campo "panels" debe ser un array');
            ELSE
                v_count := jsonb_array_length(p_submitted_answer->'panels');

                IF v_count < 3 THEN
                    v_errors := array_append(v_errors, 'El array "panels" debe tener al menos 3 paneles');
                ELSE
                    -- Validar estructura de cada panel
                    FOR i IN 0..v_count-1
                    LOOP
                        v_panel := p_submitted_answer->'panels'->i;

                        -- Cada panel debe tener dialogue O narration (al menos uno)
                        IF NOT (v_panel ? 'dialogue') AND NOT (v_panel ? 'narration') THEN
                            v_errors := array_append(v_errors, format('Panel %s: debe tener "dialogue" o "narration"', i + 1));
                        END IF;
                    END LOOP;
                END IF;

                v_details := jsonb_build_object(
                    'panels_count', v_count,
                    'validation_type', 'structure'
                );
            END IF;

        -- --------------------------------------------------------------------
        -- 5.3. VIDEO CARTA
        -- --------------------------------------------------------------------
        WHEN 'video_carta' THEN
            -- Validar que existe video_url O script
            IF NOT (p_submitted_answer ? 'video_url') AND NOT (p_submitted_answer ? 'script') THEN
                v_errors := array_append(v_errors, 'Debe proporcionar "video_url" o "script"');
            END IF;

            -- Si existe script, validar longitud mínima
            IF (p_submitted_answer ? 'script') THEN
                IF length(trim(p_submitted_answer->>'script')) < 100 THEN
                    v_errors := array_append(v_errors, 'Campo "script" debe tener al menos 100 caracteres');
                END IF;
            END IF;

            -- Validar campo duration
            IF NOT (p_submitted_answer ? 'duration') THEN
                v_errors := array_append(v_errors, 'Campo "duration" faltante');
            ELSIF jsonb_typeof(p_submitted_answer->'duration') != 'number' THEN
                v_errors := array_append(v_errors, 'Campo "duration" debe ser un número');
            ELSIF (p_submitted_answer->>'duration')::INTEGER <= 0 THEN
                v_errors := array_append(v_errors, 'Campo "duration" debe ser mayor a 0');
            END IF;

            v_details := jsonb_build_object(
                'has_video', (p_submitted_answer ? 'video_url'),
                'has_script', (p_submitted_answer ? 'script'),
                'duration', COALESCE((p_submitted_answer->>'duration')::INTEGER, 0),
                'validation_type', 'structure'
            );

        -- ====================================================================
        -- TIPO NO SOPORTADO
        -- ====================================================================
        ELSE
            v_errors := array_append(v_errors, format('Tipo de ejercicio no soportado: %s', p_exercise_type::text));
            v_details := jsonb_build_object('error', 'unsupported_type', 'type', p_exercise_type::text);

    END CASE;

    -- ========================================================================
    -- 3. CONSTRUIR RESULTADO
    -- ========================================================================
    is_valid := (array_length(v_errors, 1) IS NULL OR array_length(v_errors, 1) = 0);
    validation_errors := COALESCE(v_errors, ARRAY[]::TEXT[]);
    requires_manual_review := TRUE;  -- SIEMPRE true para M4-M5
    details := v_details;

END;
$$;

-- ============================================================================
-- COMENTARIOS
-- ============================================================================

COMMENT ON FUNCTION educational_content.validate_module4_module5_answer IS
'Validador de estructura JSONB para ejercicios de Módulos 4 y 5.

IMPORTANTE: NO evalúa calidad de contenido (eso es responsabilidad del docente).
SÍ valida que la estructura de respuesta sea correcta.
SIEMPRE retorna requires_manual_review=TRUE.

Tipos soportados:
  Módulo 4 (5 tipos):
    - verificador_fake_news: Validar claims_verified[] con estructura correcta
    - infografia_interactiva: Validar answers{} y sections_explored[]
    - quiz_tiktok: Validar answers[] de integers
    - navegacion_hipertextual: Validar path[] e information_found{}
    - analisis_memes: Validar annotations[] y analysis{}

  Módulo 5 (3 tipos):
    - diario_multimedia: Validar entries[] con date/content
    - comic_digital: Validar panels[] con dialogue/narration
    - video_carta: Validar video_url O script, y duration

Parámetros:
  - p_exercise_type: Tipo de ejercicio (verificador_fake_news, diario_multimedia, etc.)
  - p_submitted_answer: Respuesta del estudiante en formato JSONB
  - p_max_points: Puntuación máxima (para contexto, no se usa en scoring)

Retorna:
  - is_valid: TRUE si estructura válida, FALSE si hay errores
  - validation_errors: Array de mensajes de error descriptivos (vacío si válido)
  - requires_manual_review: SIEMPRE TRUE (estos ejercicios requieren revisión docente)
  - details: Información adicional de validación (métricas, estructura encontrada)

Ejemplos de uso en 05-DOCUMENTACION.md';

-- ============================================================================
-- PERMISOS
-- ============================================================================

GRANT EXECUTE ON FUNCTION educational_content.validate_module4_module5_answer TO authenticated;
GRANT EXECUTE ON FUNCTION educational_content.validate_module4_module5_answer TO admin_teacher;

-- ============================================================================
-- EJEMPLOS DE USO
-- ============================================================================

/*
-- Ejemplo 1: Validar verificador_fake_news (VÁLIDO)
SELECT * FROM educational_content.validate_module4_module5_answer(
    'verificador_fake_news',
    '{
        "claims_verified": [
            {
                "claim_id": "c1",
                "is_fake": true,
                "evidence": "La fecha mencionada es imposible porque Marie Curie nació en 1867"
            }
        ],
        "notes": "Análisis completado"
    }'::jsonb,
    100
);

-- Resultado esperado:
-- is_valid | validation_errors | requires_manual_review | details
-- ---------|-------------------|------------------------|----------
-- TRUE     | {}                | TRUE                   | {"claims_count": 1, "validation_type": "structure"}


-- Ejemplo 2: Validar diario_multimedia (VÁLIDO)
SELECT * FROM educational_content.validate_module4_module5_answer(
    'diario_multimedia',
    '{
        "entries": [
            {
                "date": "1898-12-26",
                "content": "Hoy es un día histórico. Pierre y yo hemos aislado el Radio. Después de meses de trabajo en condiciones precarias, finalmente tenemos resultados concretos."
            }
        ]
    }'::jsonb,
    500
);

-- Resultado esperado:
-- is_valid | validation_errors | requires_manual_review | details
-- ---------|-------------------|------------------------|----------
-- TRUE     | {}                | TRUE                   | {"entries_count": 1, "validation_type": "structure"}


-- Ejemplo 3: Validar comic_digital (INVÁLIDO - pocos paneles)
SELECT * FROM educational_content.validate_module4_module5_answer(
    'comic_digital',
    '{
        "panels": [
            {"dialogue": "¡Hola!"}
        ]
    }'::jsonb,
    500
);

-- Resultado esperado:
-- is_valid | validation_errors                                | requires_manual_review | details
-- ---------|--------------------------------------------------|------------------------|----------
-- FALSE    | {"El array \"panels\" debe tener al menos 3..."}| TRUE                   | {"panels_count": 1, ...}


-- Ejemplo 4: Validar estructura inválida
SELECT * FROM educational_content.validate_module4_module5_answer(
    'verificador_fake_news',
    '{
        "claims_verified": "not-an-array"
    }'::jsonb,
    100
);

-- Resultado esperado:
-- is_valid | validation_errors                                    | requires_manual_review | details
-- ---------|------------------------------------------------------|------------------------|----------
-- FALSE    | {"Campo \"claims_verified\" debe ser un array"}      | TRUE                   | {}
*/
