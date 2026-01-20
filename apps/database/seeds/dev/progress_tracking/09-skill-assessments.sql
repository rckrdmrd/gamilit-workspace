-- =====================================================================================
-- SEED: Skill Assessments for Progress Tracking Schema
-- =====================================================================================
-- Description: Skill assessments for demo students
-- Dependencies: auth.users, educational_content.modules
-- Idempotency: Uses INSERT with checks to handle re-runs
-- =====================================================================================

SET search_path TO progress_tracking, educational_content, auth, public;

-- =====================================================================================
-- SKILL ASSESSMENTS
-- =====================================================================================

DO $$
DECLARE
    student1_id UUID;
    student2_id UUID;
    student3_id UUID;
    module1_id UUID;
    module2_id UUID;
    module3_id UUID;
BEGIN
    -- Get demo student IDs
    SELECT id INTO student1_id
    FROM auth.users
    WHERE email = 'estudiante1@demo.glit.edu.mx';

    SELECT id INTO student2_id
    FROM auth.users
    WHERE email = 'estudiante2@demo.glit.edu.mx';

    SELECT id INTO student3_id
    FROM auth.users
    WHERE email = 'estudiante3@demo.glit.edu.mx';

    -- Get module IDs
    SELECT id INTO module1_id
    FROM educational_content.modules
    WHERE module_code = 'MOD-01-LITERAL';

    SELECT id INTO module2_id
    FROM educational_content.modules
    WHERE module_code = 'MOD-02-INFERENCIAL';

    SELECT id INTO module3_id
    FROM educational_content.modules
    WHERE module_code = 'MOD-03-CRITICA';

    IF student1_id IS NULL THEN
        RAISE NOTICE 'Demo students not found. Skipping skill assessments seed.';
        RETURN;
    END IF;

    RAISE NOTICE 'Creating skill assessments...';

    -- Delete existing assessments for demo students to allow re-runs
    DELETE FROM progress_tracking.skill_assessments
    WHERE user_id IN (student1_id, student2_id, student3_id);

    INSERT INTO progress_tracking.skill_assessments (
        user_id, skill_name, skill_category,
        assessment_score, proficiency_level,
        assessed_at, assessed_by_module_id, evidence,
        created_at, updated_at
    ) VALUES
    -- ================================================================================
    -- STUDENT 1: Advanced - High scores across skills
    -- ================================================================================

    -- Lectura Literal
    (
        student1_id, 'Lectura Literal', 'comprension_lectora',
        92.50, 'advanced',
        NOW() - INTERVAL '5 days', module1_id,
        '{"exercises_completed": 15, "average_score": 92.5, "time_trend": "improving", "strengths": ["vocabulary", "main_idea"]}',
        NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'
    ),

    -- Inferencia
    (
        student1_id, 'Inferencia', 'comprension_lectora',
        88.00, 'advanced',
        NOW() - INTERVAL '2 days', module2_id,
        '{"exercises_completed": 8, "average_score": 88.0, "patterns": ["excellent deduction", "good context clues"]}',
        NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
    ),

    -- Vocabulario Cientifico
    (
        student1_id, 'Vocabulario Cientifico', 'vocabulario',
        95.00, 'expert',
        NOW() - INTERVAL '3 days', module1_id,
        '{"words_mastered": 45, "accuracy_rate": 95, "retention": "high"}',
        NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'
    ),

    -- ================================================================================
    -- STUDENT 2: Intermediate - Good progress
    -- ================================================================================

    -- Lectura Literal
    (
        student2_id, 'Lectura Literal', 'comprension_lectora',
        85.00, 'intermediate',
        NOW() - INTERVAL '10 days', module1_id,
        '{"exercises_completed": 12, "average_score": 85.0, "areas_for_improvement": ["detail retention"]}',
        NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'
    ),

    -- Inferencia
    (
        student2_id, 'Inferencia', 'comprension_lectora',
        72.50, 'intermediate',
        NOW() - INTERVAL '5 days', module2_id,
        '{"exercises_completed": 6, "average_score": 72.5, "struggles": ["implicit_meaning"]}',
        NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'
    ),

    -- Analisis Critico (just started)
    (
        student2_id, 'Analisis Critico', 'comprension_lectora',
        68.00, 'beginner',
        NOW() - INTERVAL '2 days', module3_id,
        '{"exercises_completed": 3, "average_score": 68.0, "notes": "needs support with argumentation"}',
        NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
    ),

    -- ================================================================================
    -- STUDENT 3: Foundational - Needs support
    -- ================================================================================

    -- Lectura Literal
    (
        student3_id, 'Lectura Literal', 'comprension_lectora',
        62.00, 'beginner',
        NOW() - INTERVAL '8 days', module1_id,
        '{"exercises_completed": 8, "average_score": 62.0, "support_needed": ["vocabulary", "longer_texts"]}',
        NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'
    ),

    -- Vocabulario Cientifico
    (
        student3_id, 'Vocabulario Cientifico', 'vocabulario',
        55.00, 'novice',
        NOW() - INTERVAL '6 days', module1_id,
        '{"words_mastered": 15, "accuracy_rate": 55, "intervention_recommended": true}',
        NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'
    );

    RAISE NOTICE 'Skill assessments created successfully';
    RAISE NOTICE '  - Total assessments: 8';
    RAISE NOTICE '  - Students assessed: 3';

END $$;
