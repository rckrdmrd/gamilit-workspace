-- =====================================================================================
-- SEED: Teacher Contents for Educational Content Schema
-- =====================================================================================
-- Description: Demo teacher-created content for Teacher Portal Content Management page
-- Dependencies: auth_management.profiles (teacher), auth_management.tenants
-- Idempotency: Uses DELETE + INSERT pattern with dynamic lookups
-- AUDIT-D2-1: Created to populate TeacherContentManagement page
-- =====================================================================================

SET search_path TO educational_content, auth_management, auth, public;

DO $$
DECLARE
    v_teacher_id UUID;
    v_tenant_id UUID;
BEGIN
    -- Get teacher profile ID
    SELECT p.id, p.tenant_id INTO v_teacher_id, v_tenant_id
    FROM auth.users u
    JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'teacher@gamilit.com'
    LIMIT 1;

    IF v_teacher_id IS NULL THEN
        RAISE NOTICE 'Teacher profile not found. Skipping teacher_contents seed.';
        RETURN;
    END IF;

    RAISE NOTICE 'Creating teacher contents for teacher_id: %', v_teacher_id;

    -- Clean existing demo data for this teacher
    DELETE FROM educational_content.teacher_contents
    WHERE teacher_id = v_teacher_id;

    INSERT INTO educational_content.teacher_contents (
        teacher_id, tenant_id, title, description, content_type,
        content_data, instructions, learning_objectives,
        subject_area, grade_level, difficulty_level, estimated_duration_minutes,
        visibility, status, is_active, tags, points_value, ml_coins_reward,
        created_at, updated_at
    ) VALUES
    -- ================================================================================
    -- Content 1: Published worksheet (visible to all)
    -- ================================================================================
    (
        v_teacher_id, v_tenant_id,
        'Hoja de Trabajo: Vocabulario Cientifico de Marie Curie',
        'Actividad de vocabulario donde los estudiantes deben definir y usar en contexto 15 terminos cientificos del texto biografico de Marie Curie.',
        'worksheet',
        '{"sections": [{"title": "Definiciones", "instructions": "Define cada termino con tus propias palabras", "items": ["Radiactividad", "Polonio", "Radio", "Nobel", "Laboratorio"]}, {"title": "Uso en Contexto", "instructions": "Escribe una oracion usando cada termino", "items": 5}]}'::jsonb,
        'Completa cada seccion usando el texto biografico como referencia. Puedes consultar el glosario del modulo 1.',
        '["Identificar vocabulario cientifico", "Definir terminos en contexto", "Usar vocabulario tecnico en oraciones"]'::jsonb,
        'Comprension Lectora', '4to-6to', 'easy', 30,
        'school', 'published', true,
        '["vocabulario", "ciencia", "marie-curie", "modulo-1"]'::jsonb,
        50, 10,
        NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'
    ),
    -- ================================================================================
    -- Content 2: Published custom exercise
    -- ================================================================================
    (
        v_teacher_id, v_tenant_id,
        'Ejercicio: Inferencias sobre Motivaciones de Marie Curie',
        'Ejercicio de comprension inferencial donde los estudiantes analizan las motivaciones detras de las decisiones de Marie Curie.',
        'custom_exercise',
        '{"questions": [{"text": "¿Por que crees que Marie Curie decidio no patentar el proceso de extraccion del radio?", "type": "open_ended", "points": 20}, {"text": "¿Que evidencia del texto sugiere que Marie Curie valoraba la ciencia sobre el dinero?", "type": "open_ended", "points": 20}, {"text": "Identifica 3 obstaculos que enfrento Marie Curie y explica como los supero", "type": "structured", "points": 30}]}'::jsonb,
        'Lee cuidadosamente el texto y busca evidencia textual para respaldar tus respuestas. Cada respuesta debe tener al menos 3 oraciones.',
        '["Realizar inferencias sobre motivaciones", "Identificar evidencia textual", "Analizar decisiones y consecuencias"]'::jsonb,
        'Comprension Lectora', '4to-6to', 'medium', 45,
        'classroom', 'published', true,
        '["inferencia", "motivaciones", "marie-curie", "modulo-2"]'::jsonb,
        75, 15,
        NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'
    ),
    -- ================================================================================
    -- Content 3: Draft reading material
    -- ================================================================================
    (
        v_teacher_id, v_tenant_id,
        'Material de Lectura: Mujeres en la Ciencia del Siglo XX',
        'Texto complementario sobre otras mujeres cientificas contemporaneas de Marie Curie para enriquecer la comprension critica.',
        'reading_material',
        '{"text": "Ademas de Marie Curie, otras mujeres hicieron contribuciones significativas a la ciencia...", "sections": [{"title": "Lise Meitner y la Fision Nuclear", "paragraphs": 3}, {"title": "Emmy Noether y las Matematicas Abstractas", "paragraphs": 2}, {"title": "Rosalind Franklin y el ADN", "paragraphs": 3}], "word_count": 1500}'::jsonb,
        'Lee el material completo antes de iniciar los ejercicios del modulo 3. Toma notas sobre las similitudes con Marie Curie.',
        '["Contextualizar el rol de la mujer en ciencia", "Comparar experiencias de cientificas", "Desarrollar pensamiento critico"]'::jsonb,
        'Comprension Lectora', '4to-6to', 'hard', 60,
        'private', 'draft', true,
        '["lectura", "mujeres-ciencia", "modulo-3", "complementario"]'::jsonb,
        0, 0,
        NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'
    ),
    -- ================================================================================
    -- Content 4: Published quiz
    -- ================================================================================
    (
        v_teacher_id, v_tenant_id,
        'Quiz Rapido: Comprension Literal - Hechos y Datos',
        'Quiz de 10 preguntas de opcion multiple sobre datos factuales de la biografia de Marie Curie.',
        'quiz',
        '{"questions": [{"text": "¿En que año nacio Marie Curie?", "options": ["1865", "1867", "1870", "1872"], "correct": 1}, {"text": "¿De que pais era originaria?", "options": ["Francia", "Alemania", "Polonia", "Rusia"], "correct": 2}, {"text": "¿Cuantos premios Nobel recibio?", "options": ["1", "2", "3", "4"], "correct": 1}], "time_limit_minutes": 15, "passing_score": 70}'::jsonb,
        'Responde cada pregunta basandote en los hechos del texto. Tienes 15 minutos para completar el quiz.',
        '["Recordar datos factuales", "Identificar informacion explicita", "Verificar comprension literal"]'::jsonb,
        'Comprension Lectora', '4to-6to', 'easy', 15,
        'classroom', 'published', true,
        '["quiz", "comprension-literal", "marie-curie", "modulo-1"]'::jsonb,
        30, 5,
        NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'
    ),
    -- ================================================================================
    -- Content 5: Published resource pack (template)
    -- ================================================================================
    (
        v_teacher_id, v_tenant_id,
        'Paquete de Recursos: Proyecto Final Modulo 3',
        'Coleccion de recursos, rubricas y guias para el proyecto final de comprension critica sobre Marie Curie.',
        'resource_pack',
        '{"resources": [{"name": "Rubrica de Evaluacion", "type": "rubric", "criteria": ["Argumentacion", "Evidencia textual", "Originalidad", "Presentacion"]}, {"name": "Guia de Investigacion", "type": "guide", "sections": 4}, {"name": "Ejemplos de Proyectos Anteriores", "type": "examples", "count": 3}]}'::jsonb,
        'Usa estos recursos como guia para tu proyecto final. La rubrica indica los criterios de evaluacion.',
        '["Evaluar criticamente textos", "Argumentar con evidencia", "Crear contenido multimedia", "Presentar resultados"]'::jsonb,
        'Comprension Lectora', '4to-6to', 'hard', 120,
        'school', 'published', true,
        '["proyecto-final", "recursos", "modulo-3", "rubrica"]'::jsonb,
        100, 25,
        NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
    ),
    -- ================================================================================
    -- Content 6: Archived content
    -- ================================================================================
    (
        v_teacher_id, v_tenant_id,
        'Ejercicio Antiguo: Sopa de Letras Basica',
        'Version anterior del ejercicio de vocabulario. Reemplazado por version mejorada con mas interactividad.',
        'custom_exercise',
        '{"grid_size": 10, "words": ["RADIO", "POLONIO", "NOBEL", "CIENCIA", "ATOMO"], "difficulty": "easy"}'::jsonb,
        'Encuentra las 5 palabras escondidas en la sopa de letras.',
        '["Identificar vocabulario cientifico"]'::jsonb,
        'Comprension Lectora', '4to-6to', 'easy', 10,
        'private', 'archived', true,
        '["sopa-letras", "vocabulario", "modulo-1", "obsoleto"]'::jsonb,
        20, 5,
        NOW() - INTERVAL '30 days', NOW() - INTERVAL '15 days'
    );

    RAISE NOTICE 'Teacher contents created successfully';
    RAISE NOTICE '  - Total contents: 6';
    RAISE NOTICE '  - Published: 4';
    RAISE NOTICE '  - Draft: 1';
    RAISE NOTICE '  - Archived: 1';
    RAISE NOTICE '  - Content types: worksheet, custom_exercise, reading_material, quiz, resource_pack';

END $$;
