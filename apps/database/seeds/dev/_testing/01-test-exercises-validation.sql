-- ============================================================================
-- SEED: Ejercicios de Prueba para Validadores
-- Descripcion: 15 ejercicios de prueba (uno por tipo) para testing de validadores
-- Autor: Database Agent
-- Fecha: 2025-11-19
-- Updated: 2026-02-21 (Replaced placeholder UUIDs with gen_random_uuid() + variables)
-- Tarea: DB-117
-- Ambiente: DEV/TEST (no production)
-- ============================================================================

-- NOTA: Este seed requiere que exista al menos un modulo
-- Si no existe, crear modulo de prueba

DO $$
DECLARE
    v_test_module_id UUID;
    v_test_user_id UUID;
    v_ex1_id UUID := gen_random_uuid();
    v_ex2_id UUID := gen_random_uuid();
    v_ex3_id UUID := gen_random_uuid();
    v_ex4_id UUID := gen_random_uuid();
    v_ex5_id UUID := gen_random_uuid();
    v_ex6_id UUID := gen_random_uuid();
    v_ex7_id UUID := gen_random_uuid();
    v_ex8_id UUID := gen_random_uuid();
    v_ex9_id UUID := gen_random_uuid();
    v_ex10_id UUID := gen_random_uuid();
    v_ex11_id UUID := gen_random_uuid();
    v_ex12_id UUID := gen_random_uuid();
    v_ex13_id UUID := gen_random_uuid();
    v_ex14_id UUID := gen_random_uuid();
    v_ex15_id UUID := gen_random_uuid();
BEGIN
    -- Resolve teacher user for created_by via dynamic email lookup
    SELECT p.id INTO v_test_user_id
    FROM auth.users u
    JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'teacher@gamilit.com'
    LIMIT 1;

    IF v_test_user_id IS NULL THEN
        -- Fallback: any teacher profile
        SELECT p.id INTO v_test_user_id
        FROM auth_management.profiles p
        WHERE p.role::text IN ('teacher', 'admin_teacher')
        LIMIT 1;
    END IF;

    IF v_test_user_id IS NULL THEN
        RAISE NOTICE 'No teacher user found, skipping test exercises seed';
        RETURN;
    END IF;

    -- ========================================================================
    -- CREAR MODULO DE PRUEBA SI NO EXISTE
    -- ========================================================================
    SELECT id INTO v_test_module_id
    FROM educational_content.modules
    WHERE title = 'Modulo de Prueba - Validadores'
    LIMIT 1;

    IF v_test_module_id IS NULL THEN
        v_test_module_id := gen_random_uuid();
        INSERT INTO educational_content.modules (
            id, title, description, order_index, is_published, status
        ) VALUES (
            v_test_module_id,
            'Modulo de Prueba - Validadores',
            'Modulo de prueba con ejercicios para testing de validadores',
            99, true, 'published'
        );

        RAISE NOTICE 'Modulo de prueba creado: %', v_test_module_id;
    ELSE
        RAISE NOTICE 'Modulo de prueba ya existe: %', v_test_module_id;
    END IF;

    -- ========================================================================
    -- MODULO 1: COMPRENSION LITERAL (5 ejercicios)
    -- ========================================================================

    -- 1. CRUCIGRAMA
    INSERT INTO educational_content.exercises (
        id, module_id, title, exercise_type, order_index,
        content, solution, auto_gradable, max_points, created_by
    ) VALUES (
        v_ex1_id, v_test_module_id,
        'TEST: Crucigrama - Cientificos Famosos', 'crucigrama', 1,
        '{"instructions": "Completa el crucigrama con nombres de cientificos", "clues": {"h1": {"question": "Universidad donde estudio Marie Curie", "answer_length": 7}, "h2": {"question": "Premio que gano Marie Curie", "answer_length": 5}}}'::jsonb,
        '{"clues": {"h1": "SORBONA", "h2": "NOBEL"}}'::jsonb,
        true, 100, v_test_user_id
    ) ON CONFLICT (module_id, exercise_type, order_index) DO NOTHING;

    -- 2. LINEA DE TIEMPO
    INSERT INTO educational_content.exercises (
        id, module_id, title, exercise_type, order_index,
        content, solution, auto_gradable, max_points, created_by
    ) VALUES (
        v_ex2_id, v_test_module_id,
        'TEST: Linea de Tiempo - Vida de Marie Curie', 'linea_tiempo', 2,
        '{"instructions": "Ordena los eventos cronologicamente", "events": {"event_1": {"text": "Nace en Polonia", "year": 1867}, "event_2": {"text": "Se muda a Paris", "year": 1891}, "event_3": {"text": "Gana primer Nobel", "year": 1903}, "event_4": {"text": "Gana segundo Nobel", "year": 1911}}}'::jsonb,
        '{"correctOrder": ["event_1", "event_2", "event_3", "event_4"]}'::jsonb,
        true, 100, v_test_user_id
    ) ON CONFLICT (module_id, exercise_type, order_index) DO NOTHING;

    -- 3. SOPA DE LETRAS
    INSERT INTO educational_content.exercises (
        id, module_id, title, exercise_type, order_index,
        content, solution, auto_gradable, max_points, created_by
    ) VALUES (
        v_ex3_id, v_test_module_id,
        'TEST: Sopa de Letras - Elementos Quimicos', 'sopa_letras', 3,
        '{"instructions": "Encuentra las palabras ocultas", "grid": "...", "words_to_find": ["RADIO", "POLONIO", "URANIO"]}'::jsonb,
        '{"words": ["RADIO", "POLONIO", "URANIO"]}'::jsonb,
        true, 100, v_test_user_id
    ) ON CONFLICT (module_id, exercise_type, order_index) DO NOTHING;

    -- 4. COMPLETAR ESPACIOS
    INSERT INTO educational_content.exercises (
        id, module_id, title, exercise_type, order_index,
        content, solution, auto_gradable, max_points, created_by
    ) VALUES (
        v_ex4_id, v_test_module_id,
        'TEST: Completar Espacios - Biografia', 'completar_espacios', 4,
        '{"instructions": "Completa los espacios en blanco", "text": "Marie Curie fue una {{blank1}} polaca que gano el premio {{blank2}} en {{blank3}}.", "blanks": {"blank1": {"hint": "Profesion"}, "blank2": {"hint": "Premio famoso"}, "blank3": {"hint": "Area de estudio"}}}'::jsonb,
        '{"blanks": {"blank1": "cientifica", "blank2": "Nobel", "blank3": "fisica"}}'::jsonb,
        true, 100, v_test_user_id
    ) ON CONFLICT (module_id, exercise_type, order_index) DO NOTHING;

    -- 5. VERDADERO/FALSO
    INSERT INTO educational_content.exercises (
        id, module_id, title, exercise_type, order_index,
        content, solution, auto_gradable, max_points, created_by
    ) VALUES (
        v_ex5_id, v_test_module_id,
        'TEST: Verdadero/Falso - Datos de Marie Curie', 'verdadero_falso', 5,
        '{"instructions": "Indica si las afirmaciones son verdaderas o falsas", "statements": {"stmt1": {"text": "Marie Curie nacio en Francia"}, "stmt2": {"text": "Gano dos premios Nobel"}, "stmt3": {"text": "Descubrio el radio"}}}'::jsonb,
        '{"statements": {"stmt1": false, "stmt2": true, "stmt3": true}}'::jsonb,
        true, 100, v_test_user_id
    ) ON CONFLICT (module_id, exercise_type, order_index) DO NOTHING;

    -- ========================================================================
    -- MODULO 2: COMPRENSION INFERENCIAL (5 ejercicios)
    -- ========================================================================

    -- 6. DETECTIVE TEXTUAL
    INSERT INTO educational_content.exercises (
        id, module_id, title, exercise_type, order_index,
        content, solution, auto_gradable, max_points, created_by
    ) VALUES (
        v_ex6_id, v_test_module_id,
        'TEST: Detective Textual - Inferencias', 'detective_textual', 6,
        '{"instructions": "Responde las preguntas basandote en inferencias del texto", "text": "Marie Curie trabajaba con materiales peligrosos sin proteccion...", "questions": {"q1": {"question": "Por que Marie Curie murio joven?", "options": {"option_a": "Accidente de laboratorio", "option_b": "Exposicion a radiacion", "option_c": "Enfermedad congenita"}}}}'::jsonb,
        '{"correctAnswers": {"q1": "option_b"}}'::jsonb,
        true, 100, v_test_user_id
    ) ON CONFLICT (module_id, exercise_type, order_index) DO NOTHING;

    -- 7. CONSTRUCCION DE HIPOTESIS
    INSERT INTO educational_content.exercises (
        id, module_id, title, exercise_type, order_index,
        content, solution, auto_gradable, max_points, created_by
    ) VALUES (
        v_ex7_id, v_test_module_id,
        'TEST: Construccion de Hipotesis - Descubrimiento', 'construccion_hipotesis', 7,
        '{"instructions": "Construye una hipotesis sobre el descubrimiento del radio (minimo 20 palabras)", "context": "Marie Curie trabajo anos con minerales radiactivos..."}'::jsonb,
        '{"keywords": ["descubrio", "radio", "experimento", "investigacion", "evidencia"], "min_words": 20}'::jsonb,
        true, 100, v_test_user_id
    ) ON CONFLICT (module_id, exercise_type, order_index) DO NOTHING;

    -- 8. PREDICCION NARRATIVA
    INSERT INTO educational_content.exercises (
        id, module_id, title, exercise_type, order_index,
        content, solution, auto_gradable, max_points, created_by
    ) VALUES (
        v_ex8_id, v_test_module_id,
        'TEST: Prediccion Narrativa - Consecuencias', 'prediccion_narrativa', 8,
        '{"instructions": "Predice que pasara despues (minimo 30 palabras)", "narrative": "Marie Curie acaba de ganar su primer Nobel en 1903..."}'::jsonb,
        '{"keywords": ["continuara", "investigacion", "premio", "descubrimiento"], "min_words": 30}'::jsonb,
        true, 100, v_test_user_id
    ) ON CONFLICT (module_id, exercise_type, order_index) DO NOTHING;

    -- 9. PUZZLE DE CONTEXTO
    INSERT INTO educational_content.exercises (
        id, module_id, title, exercise_type, order_index,
        content, solution, auto_gradable, max_points, created_by
    ) VALUES (
        v_ex9_id, v_test_module_id,
        'TEST: Puzzle de Contexto - Analisis Contextual', 'puzzle_contexto', 9,
        '{"instructions": "Analiza el contexto y responde", "context": "A principios del siglo XX, pocas mujeres estudiaban ciencias...", "questions": {"q1": {"question": "Que podemos inferir del contexto?", "options": {"option_a": "Marie Curie fue excepcional", "option_b": "Era comun que mujeres fueran cientificas", "option_c": "No habia discriminacion"}}}}'::jsonb,
        '{"correctAnswers": {"q1": "option_a"}}'::jsonb,
        true, 100, v_test_user_id
    ) ON CONFLICT (module_id, exercise_type, order_index) DO NOTHING;

    -- 10. RUEDA DE INFERENCIAS
    INSERT INTO educational_content.exercises (
        id, module_id, title, exercise_type, order_index,
        content, solution, auto_gradable, max_points, created_by
    ) VALUES (
        v_ex10_id, v_test_module_id,
        'TEST: Rueda de Inferencias - Causa y Efecto', 'rueda_inferencias', 10,
        '{"instructions": "Relaciona cada inferencia con su conclusion", "inferences": {"inf1": {"text": "Marie trabajo con materiales radiactivos sin proteccion"}, "inf2": {"text": "Dedico toda su vida a la ciencia"}}, "conclusions": ["conclusion1", "conclusion2"]}'::jsonb,
        '{"correctInferences": {"inf1": "conclusion1", "inf2": "conclusion2"}}'::jsonb,
        true, 100, v_test_user_id
    ) ON CONFLICT (module_id, exercise_type, order_index) DO NOTHING;

    -- ========================================================================
    -- MODULO 3: PENSAMIENTO CRITICO (5 ejercicios)
    -- ========================================================================

    -- 11. TRIBUNAL DE OPINIONES
    INSERT INTO educational_content.exercises (
        id, module_id, title, exercise_type, order_index,
        content, solution, auto_gradable, max_points, created_by
    ) VALUES (
        v_ex11_id, v_test_module_id,
        'TEST: Tribunal de Opiniones - Argumento', 'tribunal_opiniones', 11,
        '{"instructions": "Escribe tu opinion argumentada sobre el papel de Marie Curie en la ciencia (minimo 100 palabras)", "topic": "Impacto de Marie Curie en la ciencia moderna"}'::jsonb,
        '{"keywords": ["opinion", "argumento", "evidencia", "conclusion", "porque"], "min_words": 100}'::jsonb,
        true, 100, v_test_user_id
    ) ON CONFLICT (module_id, exercise_type, order_index) DO NOTHING;

    -- 12. DEBATE DIGITAL
    INSERT INTO educational_content.exercises (
        id, module_id, title, exercise_type, order_index,
        content, solution, auto_gradable, max_points, created_by
    ) VALUES (
        v_ex12_id, v_test_module_id,
        'TEST: Debate Digital - Pros y Contras', 'debate_digital', 12,
        '{"instructions": "Presenta argumento y contraargumento sobre el uso de radiacion (minimo 150 palabras totales)", "topic": "Uso de radiacion en medicina"}'::jsonb,
        '{"keywords": ["argumento", "contraargumento", "sin embargo", "por el contrario"], "min_words": 150}'::jsonb,
        true, 100, v_test_user_id
    ) ON CONFLICT (module_id, exercise_type, order_index) DO NOTHING;

    -- 13. ANALISIS DE FUENTES
    INSERT INTO educational_content.exercises (
        id, module_id, title, exercise_type, order_index,
        content, solution, auto_gradable, max_points, created_by
    ) VALUES (
        v_ex13_id, v_test_module_id,
        'TEST: Analisis de Fuentes - Credibilidad', 'analisis_fuentes', 13,
        '{"instructions": "Analiza la credibilidad de las fuentes", "sources": [{"id": "source1", "title": "Articulo cientifico revisado por pares", "author": "Dr. Smith, Universidad de Oxford"}], "questions": {"q1": {"question": "Cual es el nivel de credibilidad de la fuente 1?", "options": {"option_a": "Alta", "option_b": "Media", "option_c": "Baja"}}}}'::jsonb,
        '{"correctAnswers": {"q1": "option_a"}, "criticalQuestions": {"q1": true}}'::jsonb,
        true, 100, v_test_user_id
    ) ON CONFLICT (module_id, exercise_type, order_index) DO NOTHING;

    -- 14. PODCAST ARGUMENTATIVO
    INSERT INTO educational_content.exercises (
        id, module_id, title, exercise_type, order_index,
        content, solution, auto_gradable, max_points, created_by
    ) VALUES (
        v_ex14_id, v_test_module_id,
        'TEST: Podcast Argumentativo - Audio', 'podcast_argumentativo', 14,
        '{"instructions": "Graba un podcast argumentativo sobre Marie Curie (2-10 minutos)"}'::jsonb,
        '{"min_duration_seconds": 120, "max_duration_seconds": 600, "max_size_mb": 50, "allowed_formats": ["mp3", "m4a", "wav", "ogg"]}'::jsonb,
        true, 100, v_test_user_id
    ) ON CONFLICT (module_id, exercise_type, order_index) DO NOTHING;

    -- 15. MATRIZ DE PERSPECTIVAS
    INSERT INTO educational_content.exercises (
        id, module_id, title, exercise_type, order_index,
        content, solution, auto_gradable, max_points, created_by
    ) VALUES (
        v_ex15_id, v_test_module_id,
        'TEST: Matriz de Perspectivas - Analisis Multidimensional', 'matriz_perspectivas', 15,
        '{"instructions": "Analiza el tema desde diferentes perspectivas (minimo 50 caracteres por celda)", "topic": "Impacto de Marie Curie", "perspectives": ["perspective1", "perspective2", "perspective3"]}'::jsonb,
        '{"requiredPerspectives": ["perspective1", "perspective2", "perspective3"], "min_chars_per_cell": 50}'::jsonb,
        true, 100, v_test_user_id
    ) ON CONFLICT (module_id, exercise_type, order_index) DO NOTHING;

    RAISE NOTICE '15 ejercicios de prueba creados exitosamente';
END $$;

-- ============================================================================
-- VALIDACION
-- ============================================================================

-- Verificar que se crearon los 15 ejercicios
DO $$
DECLARE
    v_count INTEGER;
    v_module_id UUID;
BEGIN
    -- Resolve module_id dynamically by title
    SELECT id INTO v_module_id
    FROM educational_content.modules
    WHERE title = 'Modulo de Prueba - Validadores'
    LIMIT 1;

    IF v_module_id IS NULL THEN
        RAISE WARNING 'Test module not found, cannot validate exercise count';
        RETURN;
    END IF;

    SELECT COUNT(*) INTO v_count
    FROM educational_content.exercises
    WHERE module_id = v_module_id;

    IF v_count = 15 THEN
        RAISE NOTICE 'VALIDACION EXITOSA: 15 ejercicios de prueba creados';
    ELSE
        RAISE WARNING 'VALIDACION FALLIDA: Se esperaban 15 ejercicios, se encontraron %', v_count;
    END IF;
END $$;
