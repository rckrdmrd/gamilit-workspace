-- =====================================================================================
-- SEED: LTI Sessions for lti_integration Schema
-- =====================================================================================
-- Description: Sample LTI session data for testing LMS integration flows
-- Dependencies: lti_integration.lti_consumers, auth_management.profiles
-- Idempotency: Uses ON CONFLICT to handle re-runs safely
-- Created: 2026-01-20
-- Task: P2-3 (Aumentar cobertura de seeds al 80%)
-- =====================================================================================

SET search_path TO lti_integration, auth_management, public;

-- =====================================================
-- LTI SESSIONS
-- =====================================================

DO $$
DECLARE
    v_moodle_consumer_id UUID;
    v_canvas_consumer_id UUID;
    v_blackboard_consumer_id UUID;
    v_student_id UUID;
    v_teacher_id UUID;
BEGIN
    RAISE NOTICE 'Creating LTI session sample records...';

    -- Resolve consumer IDs by name (from 01-lti_consumers.sql)
    SELECT id INTO v_moodle_consumer_id FROM lti_integration.lti_consumers WHERE name ILIKE '%moodle%' LIMIT 1;
    SELECT id INTO v_canvas_consumer_id FROM lti_integration.lti_consumers WHERE name ILIKE '%canvas%' LIMIT 1;
    SELECT id INTO v_blackboard_consumer_id FROM lti_integration.lti_consumers WHERE name ILIKE '%blackboard%' LIMIT 1;

    IF v_moodle_consumer_id IS NULL THEN
        RAISE NOTICE 'LTI consumers not found. Run 01-lti_consumers.sql first. Skipping.';
        RETURN;
    END IF;
    -- Fallback for optional consumers
    IF v_canvas_consumer_id IS NULL THEN v_canvas_consumer_id := v_moodle_consumer_id; END IF;
    IF v_blackboard_consumer_id IS NULL THEN v_blackboard_consumer_id := v_moodle_consumer_id; END IF;

    -- Get sample user IDs
    SELECT id INTO v_student_id FROM auth_management.profiles
    WHERE role = 'student' AND is_active = true LIMIT 1;

    SELECT id INTO v_teacher_id FROM auth_management.profiles
    WHERE role IN ('teacher', 'admin_teacher') AND is_active = true LIMIT 1;

    -- Fallback if no users found
    IF v_student_id IS NULL THEN
        SELECT id INTO v_student_id FROM auth_management.profiles WHERE is_active = true LIMIT 1;
    END IF;

    IF v_teacher_id IS NULL THEN
        v_teacher_id := v_student_id;
    END IF;

    -- Idempotency guard
    IF EXISTS (SELECT 1 FROM lti_integration.lti_sessions LIMIT 1) THEN
        RAISE NOTICE 'LTI sessions already exist, skipping insert';
        RETURN;
    END IF;

    INSERT INTO lti_integration.lti_sessions (
        id,
        consumer_id,
        user_id,
        launch_id,
        message_type,
        context_id,
        context_label,
        context_title,
        resource_link_id,
        resource_link_title,
        resource_link_description,
        lms_user_id,
        lms_user_email,
        lms_user_name,
        lms_user_roles,
        id_token_claims,
        locale,
        timezone,
        return_url,
        session_state,
        is_active,
        launched_at,
        last_activity_at,
        ended_at,
        metadata
    ) VALUES

    -- Session 1: Active student session from Moodle (current)
    (
        gen_random_uuid(),
        v_moodle_consumer_id,
        v_student_id,
        'launch-moodle-' || extract(epoch from now())::text,
        'LtiResourceLinkRequest',
        'course-101',
        'LECT-2A',
        'Lectura Comprensiva 2do Grado A',
        'mod-comprension-literal',
        'Ejercicios de Comprension Literal',
        'Practica tus habilidades de comprension con ejercicios interactivos',
        'moodle-student-12345',
        'estudiante@escuela.edu.mx',
        'Maria Garcia Lopez',
        ARRAY['Learner', 'Student']::TEXT[],
        jsonb_build_object(
            'iss', 'https://moodle.example.edu',
            'aud', 'gamilit-tool',
            'sub', 'moodle-student-12345',
            'exp', extract(epoch from now() + interval '8 hours')::int,
            'iat', extract(epoch from now())::int,
            'nonce', 'nonce-' || gen_random_uuid()::text,
            'https://purl.imsglobal.org/spec/lti/claim/roles', ARRAY['http://purl.imsglobal.org/vocab/lis/v2/membership#Learner'],
            'https://purl.imsglobal.org/spec/lti/claim/context', jsonb_build_object('id', 'course-101', 'label', 'LECT-2A')
        ),
        'es-MX',
        'America/Mexico_City',
        'https://moodle.example.edu/mod/lti/return.php?course=101',
        'active',
        true,
        NOW() - INTERVAL '30 minutes',
        NOW() - INTERVAL '5 minutes',
        NULL,
        jsonb_build_object(
            'browser', 'Chrome 120',
            'device', 'desktop',
            'ip_address', '192.168.1.45'
        )
    ),

    -- Session 2: Active teacher session from Canvas
    (
        gen_random_uuid(),
        v_canvas_consumer_id,
        v_teacher_id,
        'launch-canvas-' || extract(epoch from now())::text,
        'LtiResourceLinkRequest',
        'canvas-course-456',
        'ESP-3B',
        'Espanol 3er Grado B',
        'mod-inferencial',
        'Modulo de Lectura Inferencial',
        'Ejercicios avanzados de inferencia y deduccion',
        'canvas-instructor-67890',
        'profesor@escuela.edu.mx',
        'Carlos Ramirez Martinez',
        ARRAY['Instructor', 'ContentDeveloper']::TEXT[],
        jsonb_build_object(
            'iss', 'https://canvas.example.edu',
            'aud', 'gamilit-tool',
            'sub', 'canvas-instructor-67890',
            'exp', extract(epoch from now() + interval '8 hours')::int,
            'iat', extract(epoch from now())::int,
            'https://purl.imsglobal.org/spec/lti/claim/roles', ARRAY['http://purl.imsglobal.org/vocab/lis/v2/membership#Instructor']
        ),
        'es-MX',
        'America/Mexico_City',
        'https://canvas.example.edu/courses/456/external_tools/return',
        'active',
        true,
        NOW() - INTERVAL '1 hour',
        NOW() - INTERVAL '10 minutes',
        NULL,
        jsonb_build_object(
            'browser', 'Safari 17',
            'device', 'desktop',
            'canvas_course_id', '456'
        )
    ),

    -- Session 3: Ended student session from Blackboard (completed)
    (
        gen_random_uuid(),
        v_blackboard_consumer_id,
        v_student_id,
        'launch-bb-completed-001',
        'LtiResourceLinkRequest',
        'bb-course-789',
        'LECT-1A',
        'Lectura Basica 1er Grado',
        'mod-literal-basico',
        'Comprension Literal Nivel Basico',
        'Introduccion a la comprension de lectura',
        'bb-student-11111',
        'alumno1@escuela.edu.mx',
        'Pedro Sanchez Flores',
        ARRAY['Learner']::TEXT[],
        jsonb_build_object(
            'iss', 'https://blackboard.example.edu',
            'sub', 'bb-student-11111'
        ),
        'es-MX',
        'America/Mexico_City',
        'https://blackboard.example.edu/learn/return',
        'completed',
        false,
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days' + INTERVAL '45 minutes',
        NOW() - INTERVAL '2 days' + INTERVAL '50 minutes',
        jsonb_build_object(
            'exercises_completed', 5,
            'score_achieved', 85,
            'time_spent_minutes', 45
        )
    ),

    -- Session 4: Deep Linking session from Moodle (instructor)
    (
        gen_random_uuid(),
        v_moodle_consumer_id,
        v_teacher_id,
        'launch-moodle-deeplink-001',
        'LtiDeepLinkingRequest',
        'course-setup-101',
        'SETUP',
        'Configuracion de Curso',
        NULL,
        NULL,
        NULL,
        'moodle-admin-99999',
        'coordinador@escuela.edu.mx',
        'Ana Lucia Hernandez',
        ARRAY['Instructor', 'Administrator']::TEXT[],
        jsonb_build_object(
            'iss', 'https://moodle.example.edu',
            'https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings', jsonb_build_object(
                'accept_types', ARRAY['link', 'ltiResourceLink'],
                'accept_presentation_document_targets', ARRAY['iframe', 'window'],
                'deep_link_return_url', 'https://moodle.example.edu/mod/lti/return.php'
            )
        ),
        'es-MX',
        'America/Mexico_City',
        'https://moodle.example.edu/mod/lti/return.php',
        'deep_linking',
        true,
        NOW() - INTERVAL '15 minutes',
        NOW() - INTERVAL '2 minutes',
        NULL,
        jsonb_build_object(
            'deep_linking_purpose', 'content_selection',
            'modules_available', ARRAY['literal', 'inferencial', 'critico']
        )
    ),

    -- Session 5: Expired session (timeout)
    (
        gen_random_uuid(),
        v_canvas_consumer_id,
        v_student_id,
        'launch-canvas-expired-001',
        'LtiResourceLinkRequest',
        'canvas-course-456',
        'ESP-3B',
        'Espanol 3er Grado B',
        'mod-critico',
        'Modulo de Lectura Critica',
        'Ejercicios de analisis y evaluacion critica',
        'canvas-student-22222',
        'estudiante2@escuela.edu.mx',
        'Luis Fernando Ortega',
        ARRAY['Learner']::TEXT[],
        jsonb_build_object(
            'iss', 'https://canvas.example.edu',
            'sub', 'canvas-student-22222'
        ),
        'es-MX',
        'America/Mexico_City',
        'https://canvas.example.edu/courses/456/return',
        'expired',
        false,
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day' + INTERVAL '8 hours',
        NOW() - INTERVAL '1 day' + INTERVAL '8 hours',
        jsonb_build_object(
            'reason', 'session_timeout',
            'last_exercise', 'ejercicio-critico-03'
        )
    )

    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'LTI sessions created successfully';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Warning: Could not create all LTI sessions: %', SQLERRM;
        RAISE NOTICE 'This may be due to missing consumer records or user profiles';
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
    v_total_count INTEGER;
    v_active_count INTEGER;
    v_consumers_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total_count FROM lti_integration.lti_sessions;
    SELECT COUNT(*) INTO v_active_count FROM lti_integration.lti_sessions WHERE is_active = true;
    SELECT COUNT(DISTINCT consumer_id) INTO v_consumers_count FROM lti_integration.lti_sessions;

    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '  SEED COMPLETADO: lti_sessions';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '  Total sesiones: %', v_total_count;
    RAISE NOTICE '  - Activas: %', v_active_count;
    RAISE NOTICE '  - Consumers utilizados: %', v_consumers_count;
    RAISE NOTICE '════════════════════════════════════════════════════════';
END $$;
