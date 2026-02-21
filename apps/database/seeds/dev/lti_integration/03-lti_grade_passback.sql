-- =====================================================================================
-- SEED: LTI Grade Passback for lti_integration Schema
-- =====================================================================================
-- Description: Sample grade passback records for testing LTI AGS (Assignment and Grade Services)
-- Dependencies: lti_integration.lti_sessions, lti_integration.lti_consumers, auth_management.profiles
-- Idempotency: Uses ON CONFLICT to handle re-runs safely
-- Created: 2026-01-20
-- Task: P2-3 (Aumentar cobertura de seeds al 80%)
-- =====================================================================================

SET search_path TO lti_integration, auth_management, public;

-- =====================================================
-- LTI GRADE PASSBACK RECORDS
-- =====================================================

DO $$
DECLARE
    v_moodle_consumer_id UUID;
    v_canvas_consumer_id UUID;
    v_blackboard_consumer_id UUID;
    v_session1_id UUID;
    v_session2_id UUID;
    v_session3_id UUID;
    v_student_id UUID;
BEGIN
    RAISE NOTICE 'Creating LTI grade passback sample records...';

    -- Resolve consumer IDs by name
    SELECT id INTO v_moodle_consumer_id FROM lti_integration.lti_consumers WHERE name ILIKE '%moodle%' LIMIT 1;
    SELECT id INTO v_canvas_consumer_id FROM lti_integration.lti_consumers WHERE name ILIKE '%canvas%' LIMIT 1;
    SELECT id INTO v_blackboard_consumer_id FROM lti_integration.lti_consumers WHERE name ILIKE '%blackboard%' LIMIT 1;

    -- Resolve session IDs by consumer (from 02-lti_sessions.sql)
    SELECT id INTO v_session1_id FROM lti_integration.lti_sessions WHERE consumer_id = v_moodle_consumer_id LIMIT 1;
    SELECT id INTO v_session2_id FROM lti_integration.lti_sessions WHERE consumer_id = v_canvas_consumer_id LIMIT 1;
    SELECT id INTO v_session3_id FROM lti_integration.lti_sessions WHERE consumer_id = v_blackboard_consumer_id LIMIT 1;

    IF v_moodle_consumer_id IS NULL OR v_session1_id IS NULL THEN
        RAISE NOTICE 'LTI consumers/sessions not found. Run prior seeds first. Skipping.';
        RETURN;
    END IF;
    -- Fallback for optional consumers/sessions
    IF v_canvas_consumer_id IS NULL THEN v_canvas_consumer_id := v_moodle_consumer_id; END IF;
    IF v_blackboard_consumer_id IS NULL THEN v_blackboard_consumer_id := v_moodle_consumer_id; END IF;
    IF v_session2_id IS NULL THEN v_session2_id := v_session1_id; END IF;
    IF v_session3_id IS NULL THEN v_session3_id := v_session1_id; END IF;

    -- Get a student ID
    SELECT id INTO v_student_id FROM auth_management.profiles
    WHERE role = 'student' AND is_active = true LIMIT 1;

    IF v_student_id IS NULL THEN
        SELECT id INTO v_student_id FROM auth_management.profiles WHERE is_active = true LIMIT 1;
    END IF;

    -- Idempotency guard
    IF EXISTS (SELECT 1 FROM lti_integration.lti_grade_passback LIMIT 1) THEN
        RAISE NOTICE 'LTI grade passback records already exist, skipping insert';
        RETURN;
    END IF;

    INSERT INTO lti_integration.lti_grade_passback (
        id,
        session_id,
        user_id,
        consumer_id,
        lineitem_url,
        lineitem_id,
        lineitem_label,
        score_given,
        score_maximum,
        score_percentage,
        activity_progress,
        grading_progress,
        comment,
        passback_status,
        lms_response,
        lms_response_code,
        error_message,
        attempt_count,
        max_retries,
        next_retry_at,
        graded_at,
        first_sent_at,
        last_sent_at,
        success_at,
        created_at,
        metadata
    ) VALUES

    -- Grade 1: Successful passback to Moodle
    (
        gen_random_uuid(),
        v_session1_id,
        v_student_id,
        v_moodle_consumer_id,
        'https://moodle.example.edu/mod/lti/services/lineitem/101/scores',
        'lineitem-101',
        'Ejercicios Modulo 1 - Comprension Literal',
        85.00,
        100.00,
        85.00,
        'Completed',
        'FullyGraded',
        'Excelente trabajo en comprension literal. Continua practicando inferencias.',
        'success',
        jsonb_build_object(
            'resultUrl', 'https://moodle.example.edu/mod/lti/services/result/12345',
            'scoreOf', 'https://moodle.example.edu/mod/lti/services/lineitem/101',
            'userId', 'moodle-student-12345'
        ),
        200,
        NULL,
        1,
        3,
        NULL,
        NOW() - INTERVAL '1 hour',
        NOW() - INTERVAL '55 minutes',
        NOW() - INTERVAL '55 minutes',
        NOW() - INTERVAL '55 minutes',
        NOW() - INTERVAL '1 hour',
        jsonb_build_object(
            'module_id', 'mod-01-literal',
            'exercise_count', 5,
            'time_spent_minutes', 35
        )
    ),

    -- Grade 2: Pending passback to Canvas (just graded)
    (
        gen_random_uuid(),
        v_session2_id,
        v_student_id,
        v_canvas_consumer_id,
        'https://canvas.example.edu/api/lti/courses/456/line_items/201/scores',
        'lineitem-201',
        'Quiz Lectura Inferencial',
        72.50,
        100.00,
        72.50,
        'Completed',
        'FullyGraded',
        'Buen esfuerzo. Revisa los ejercicios de inferencia de causa-efecto.',
        'pending',
        NULL,
        NULL,
        NULL,
        0,
        3,
        NOW() + INTERVAL '5 minutes',
        NOW() - INTERVAL '10 minutes',
        NULL,
        NULL,
        NULL,
        NOW() - INTERVAL '10 minutes',
        jsonb_build_object(
            'module_id', 'mod-02-inferencial',
            'quiz_version', 'v2.1',
            'auto_graded', true
        )
    ),

    -- Grade 3: Failed passback (LMS unavailable)
    (
        gen_random_uuid(),
        v_session3_id,
        v_student_id,
        v_blackboard_consumer_id,
        'https://blackboard.example.edu/learn/api/v1/lti/courses/789/lineitems/301/scores',
        'lineitem-301',
        'Evaluacion Modulo Basico',
        90.00,
        100.00,
        90.00,
        'Completed',
        'FullyGraded',
        'Excelente desempeno en el modulo basico!',
        'failed',
        jsonb_build_object(
            'error', 'Service Unavailable',
            'message', 'Blackboard server is undergoing maintenance'
        ),
        503,
        'LMS service unavailable: Blackboard maintenance window',
        3,
        3,
        NULL,
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '1 day',
        NULL,
        NOW() - INTERVAL '2 days',
        jsonb_build_object(
            'module_id', 'mod-01-basico',
            'retry_exhausted', true,
            'admin_notified', true
        )
    ),

    -- Grade 4: Retrying passback (network timeout)
    (
        gen_random_uuid(),
        v_session1_id,
        v_student_id,
        v_moodle_consumer_id,
        'https://moodle.example.edu/mod/lti/services/lineitem/102/scores',
        'lineitem-102',
        'Practica Adicional Modulo 1',
        78.00,
        100.00,
        78.00,
        'Completed',
        'FullyGraded',
        'Practica completada. Sigue mejorando!',
        'retrying',
        jsonb_build_object(
            'error', 'Gateway Timeout',
            'attempt', 2
        ),
        504,
        'Connection timeout after 30 seconds',
        2,
        3,
        NOW() + INTERVAL '15 minutes',
        NOW() - INTERVAL '2 hours',
        NOW() - INTERVAL '1 hour' - INTERVAL '30 minutes',
        NOW() - INTERVAL '30 minutes',
        NULL,
        NOW() - INTERVAL '2 hours',
        jsonb_build_object(
            'module_id', 'mod-01-literal',
            'is_supplementary', true
        )
    ),

    -- Grade 5: In Progress activity (not yet completed)
    (
        gen_random_uuid(),
        v_session2_id,
        v_student_id,
        v_canvas_consumer_id,
        'https://canvas.example.edu/api/lti/courses/456/line_items/202/scores',
        'lineitem-202',
        'Proyecto Lectura Critica',
        45.00,
        100.00,
        45.00,
        'InProgress',
        'Pending',
        NULL,
        'pending',
        NULL,
        NULL,
        NULL,
        0,
        3,
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        NOW() - INTERVAL '30 minutes',
        jsonb_build_object(
            'module_id', 'mod-03-critico',
            'partial_submission', true,
            'sections_completed', ARRAY['intro', 'analysis']
        )
    ),

    -- Grade 6: Successful passback with high score
    (
        gen_random_uuid(),
        v_session1_id,
        v_student_id,
        v_moodle_consumer_id,
        'https://moodle.example.edu/mod/lti/services/lineitem/103/scores',
        'lineitem-103',
        'Examen Final Modulo 1',
        95.00,
        100.00,
        95.00,
        'Completed',
        'FullyGraded',
        'Sobresaliente! Has demostrado excelente comprension literal.',
        'success',
        jsonb_build_object(
            'resultUrl', 'https://moodle.example.edu/mod/lti/services/result/67890'
        ),
        200,
        NULL,
        1,
        3,
        NULL,
        NOW() - INTERVAL '3 hours',
        NOW() - INTERVAL '2 hours' - INTERVAL '50 minutes',
        NOW() - INTERVAL '2 hours' - INTERVAL '50 minutes',
        NOW() - INTERVAL '2 hours' - INTERVAL '50 minutes',
        NOW() - INTERVAL '3 hours',
        jsonb_build_object(
            'module_id', 'mod-01-literal',
            'is_final_exam', true,
            'achievement_unlocked', 'master_literal'
        )
    )

    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'LTI grade passback records created successfully';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Warning: Could not create all grade passback records: %', SQLERRM;
        RAISE NOTICE 'This may be due to missing sessions or consumer records';
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
    v_total_count INTEGER;
    v_success_count INTEGER;
    v_pending_count INTEGER;
    v_failed_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total_count FROM lti_integration.lti_grade_passback;
    SELECT COUNT(*) INTO v_success_count FROM lti_integration.lti_grade_passback WHERE passback_status = 'success';
    SELECT COUNT(*) INTO v_pending_count FROM lti_integration.lti_grade_passback WHERE passback_status = 'pending';
    SELECT COUNT(*) INTO v_failed_count FROM lti_integration.lti_grade_passback WHERE passback_status = 'failed';

    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '  SEED COMPLETADO: lti_grade_passback';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '  Total registros: %', v_total_count;
    RAISE NOTICE '  - Success: %', v_success_count;
    RAISE NOTICE '  - Pending: %', v_pending_count;
    RAISE NOTICE '  - Failed: %', v_failed_count;
    RAISE NOTICE '════════════════════════════════════════════════════════';
END $$;
