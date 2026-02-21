-- =====================================================================================
-- SEED: Assignment Students for Educational Content Schema
-- =====================================================================================
-- Description: Links demo assignments to demo students with various submission statuses
-- Dependencies: educational_content.assignments (05-assignments.sql),
--               auth_management.profiles (students + teacher)
-- Idempotency: Uses DELETE + INSERT pattern with dynamic lookups
-- AUDIT-D2-7: Created to show students assigned to assignments in Teacher Portal
-- =====================================================================================

SET search_path TO educational_content, auth_management, auth, public;

DO $$
DECLARE
    v_teacher_id UUID;
    v_student1_id UUID;
    v_student2_id UUID;
    v_student3_id UUID;
    v_assignment_ids UUID[];
BEGIN
    -- Get teacher profile ID
    SELECT p.id INTO v_teacher_id
    FROM auth.users u
    JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'teacher@gamilit.com'
    LIMIT 1;

    -- Get student profile IDs (FK references profiles, not auth.users)
    SELECT p.id INTO v_student1_id
    FROM auth.users u
    JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'estudiante1@demo.glit.edu.mx';

    SELECT p.id INTO v_student2_id
    FROM auth.users u
    JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'estudiante2@demo.glit.edu.mx';

    SELECT p.id INTO v_student3_id
    FROM auth.users u
    JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'estudiante3@demo.glit.edu.mx';

    IF v_teacher_id IS NULL THEN
        RAISE NOTICE 'Teacher profile not found. Skipping assignment_students seed.';
        RETURN;
    END IF;

    IF v_student1_id IS NULL THEN
        RAISE NOTICE 'Demo students not found. Skipping assignment_students seed.';
        RETURN;
    END IF;

    -- Get assignment IDs for this teacher (from 05-assignments.sql seed)
    SELECT array_agg(a.id ORDER BY a.created_at) INTO v_assignment_ids
    FROM educational_content.assignments a
    WHERE a.teacher_id = v_teacher_id;

    IF v_assignment_ids IS NULL OR array_length(v_assignment_ids, 1) < 3 THEN
        RAISE NOTICE 'Not enough assignments found. Skipping assignment_students seed.';
        RETURN;
    END IF;

    RAISE NOTICE 'Creating assignment_students entries...';
    RAISE NOTICE '  Assignments found: %', array_length(v_assignment_ids, 1);

    -- Clean existing demo data
    DELETE FROM educational_content.assignment_students
    WHERE student_id IN (v_student1_id, v_student2_id, v_student3_id);

    INSERT INTO educational_content.assignment_students (
        assignment_id, student_id, status, assigned_at,
        submitted_at, score, max_score, feedback,
        graded_by, graded_at, attempt_number, max_attempts,
        is_late, submission_data
    ) VALUES
    -- ================================================================================
    -- ASSIGNMENT 1 (Tarea 1.1: Crucigrama) — OVERDUE, all 3 students
    -- ================================================================================
    -- Student 1: Graded (excellent)
    (
        v_assignment_ids[1], v_student1_id, 'graded',
        NOW() - INTERVAL '14 days',
        NOW() - INTERVAL '10 days',
        95, 100,
        'Excelente trabajo. Todas las definiciones son correctas y bien fundamentadas.',
        v_teacher_id, NOW() - INTERVAL '9 days',
        1, 1, false,
        '{"completed_words": 10, "time_spent_minutes": 22}'::jsonb
    ),
    -- Student 2: Graded (average)
    (
        v_assignment_ids[1], v_student2_id, 'graded',
        NOW() - INTERVAL '14 days',
        NOW() - INTERVAL '8 days',
        72, 100,
        'Buen esfuerzo. Revisa las definiciones de Polonio y Radiactividad.',
        v_teacher_id, NOW() - INTERVAL '7 days',
        1, 1, true,
        '{"completed_words": 7, "time_spent_minutes": 35}'::jsonb
    ),
    -- Student 3: Submitted but not graded
    (
        v_assignment_ids[1], v_student3_id, 'submitted',
        NOW() - INTERVAL '14 days',
        NOW() - INTERVAL '5 days',
        NULL, 100, NULL, NULL, NULL,
        1, 1, true,
        '{"completed_words": 5, "time_spent_minutes": 48}'::jsonb
    ),

    -- ================================================================================
    -- ASSIGNMENT 2 (Quiz 1.2: Linea de Tiempo) — Active, vence en 2 dias
    -- ================================================================================
    -- Student 1: Submitted
    (
        v_assignment_ids[2], v_student1_id, 'submitted',
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '1 day',
        NULL, 50, NULL, NULL, NULL,
        1, 1, false,
        '{"answers": [1, 3, 2, 4, 1], "time_spent_minutes": 18}'::jsonb
    ),
    -- Student 2: In progress
    (
        v_assignment_ids[2], v_student2_id, 'in_progress',
        NOW() - INTERVAL '5 days',
        NULL,
        NULL, 50, NULL, NULL, NULL,
        1, 1, false,
        '{"started_at": "2026-02-19T10:30:00Z", "answers_so_far": 2}'::jsonb
    ),
    -- Student 3: Assigned (not started)
    (
        v_assignment_ids[2], v_student3_id, 'assigned',
        NOW() - INTERVAL '5 days',
        NULL,
        NULL, 50, NULL, NULL, NULL,
        1, 1, false, '{}'::jsonb
    ),

    -- ================================================================================
    -- ASSIGNMENT 4 (Tarea 2.1: Causa-Efecto) — OVERDUE 3 days
    -- ================================================================================
    -- Student 1: Graded
    (
        v_assignment_ids[4], v_student1_id, 'graded',
        NOW() - INTERVAL '10 days',
        NOW() - INTERVAL '5 days',
        110, 120,
        'Analisis excelente. Las 3 relaciones causa-efecto estan bien argumentadas con evidencia textual.',
        v_teacher_id, NOW() - INTERVAL '4 days',
        1, 1, false,
        '{"cause_effect_pairs": 3, "evidence_quality": "strong"}'::jsonb
    ),
    -- Student 2: Late submission, not graded
    (
        v_assignment_ids[4], v_student2_id, 'submitted',
        NOW() - INTERVAL '10 days',
        NOW() - INTERVAL '1 day',
        NULL, 120, NULL, NULL, NULL,
        1, 1, true,
        '{"cause_effect_pairs": 2, "evidence_quality": "moderate"}'::jsonb
    ),
    -- Student 3: Not submitted (overdue)
    (
        v_assignment_ids[4], v_student3_id, 'assigned',
        NOW() - INTERVAL '10 days',
        NULL,
        NULL, 120, NULL, NULL, NULL,
        1, 1, false, '{}'::jsonb
    ),

    -- ================================================================================
    -- ASSIGNMENT 5 (Quiz 2.2: Rueda de Inferencias) — Active, vence en 5 dias
    -- ================================================================================
    -- Student 1: Assigned
    (
        v_assignment_ids[5], v_student1_id, 'assigned',
        NOW() - INTERVAL '3 days',
        NULL,
        NULL, 100, NULL, NULL, NULL,
        1, 1, false, '{}'::jsonb
    ),
    -- Student 2: Assigned
    (
        v_assignment_ids[5], v_student2_id, 'assigned',
        NOW() - INTERVAL '3 days',
        NULL,
        NULL, 100, NULL, NULL, NULL,
        1, 1, false, '{}'::jsonb
    ),

    -- ================================================================================
    -- ASSIGNMENT 7 (Tarea 3.1: Ensayo Critico) — Active, vence en 7 dias
    -- ================================================================================
    -- Student 1: In progress
    (
        v_assignment_ids[7], v_student1_id, 'in_progress',
        NOW() - INTERVAL '4 days',
        NULL,
        NULL, 200, NULL, NULL, NULL,
        1, 1, false,
        '{"draft_word_count": 150, "arguments_outlined": 2}'::jsonb
    );

    RAISE NOTICE 'Assignment students created successfully';
    RAISE NOTICE '  - Total entries: 13';
    RAISE NOTICE '  - Graded: 3';
    RAISE NOTICE '  - Submitted (pending grade): 3';
    RAISE NOTICE '  - In progress: 2';
    RAISE NOTICE '  - Assigned (not started): 5';
    RAISE NOTICE '  - Late submissions: 2';

END $$;
