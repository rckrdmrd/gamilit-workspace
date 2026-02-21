-- =====================================================================================
-- SEED: Team Members for social_features Schema
-- =====================================================================================
-- Description: Sample team membership data linking users to teams
-- Dependencies: social_features.teams, auth_management.profiles
-- Idempotency: Uses ON CONFLICT to handle re-runs safely
-- Created: 2026-01-20
-- Task: P2-3 (Aumentar cobertura de seeds al 80%)
-- =====================================================================================

SET search_path TO social_features, auth_management, public;

-- =====================================================
-- TEAM MEMBERS
-- =====================================================

DO $$
DECLARE
    v_team_lectores UUID;
    v_team_inferencias UUID;
    v_team_criticos UUID;
    v_student1_id UUID;
    v_student2_id UUID;
    v_student3_id UUID;
    v_teacher_id UUID;
BEGIN
    RAISE NOTICE 'Creating team member records...';

    -- Get team IDs from existing teams seed
    SELECT id INTO v_team_lectores FROM social_features.teams
    WHERE name ILIKE '%lector%' OR name ILIKE '%reader%' LIMIT 1;

    SELECT id INTO v_team_inferencias FROM social_features.teams
    WHERE name ILIKE '%inferencia%' OR name ILIKE '%detective%' LIMIT 1;

    SELECT id INTO v_team_criticos FROM social_features.teams
    WHERE name ILIKE '%critico%' OR name ILIKE '%critical%' LIMIT 1;

    -- Fallback: get any teams
    IF v_team_lectores IS NULL THEN
        SELECT id INTO v_team_lectores FROM social_features.teams LIMIT 1;
    END IF;
    IF v_team_inferencias IS NULL THEN
        SELECT id INTO v_team_inferencias FROM social_features.teams OFFSET 1 LIMIT 1;
    END IF;
    IF v_team_criticos IS NULL THEN
        SELECT id INTO v_team_criticos FROM social_features.teams OFFSET 2 LIMIT 1;
    END IF;

    -- Get student IDs
    SELECT id INTO v_student1_id FROM auth_management.profiles
    WHERE role = 'student' AND is_active = true
    ORDER BY created_at LIMIT 1;

    SELECT id INTO v_student2_id FROM auth_management.profiles
    WHERE role = 'student' AND is_active = true
    ORDER BY created_at OFFSET 1 LIMIT 1;

    SELECT id INTO v_student3_id FROM auth_management.profiles
    WHERE role = 'student' AND is_active = true
    ORDER BY created_at OFFSET 2 LIMIT 1;

    -- Get teacher ID
    SELECT id INTO v_teacher_id FROM auth_management.profiles
    WHERE role IN ('teacher', 'admin_teacher') AND is_active = true LIMIT 1;

    -- Fallback to any users
    IF v_student1_id IS NULL THEN
        SELECT id INTO v_student1_id FROM auth_management.profiles WHERE is_active = true LIMIT 1;
    END IF;
    IF v_student2_id IS NULL THEN
        v_student2_id := v_student1_id;
    END IF;
    IF v_student3_id IS NULL THEN
        v_student3_id := v_student1_id;
    END IF;
    IF v_teacher_id IS NULL THEN
        v_teacher_id := v_student1_id;
    END IF;

    -- Skip if no teams
    IF v_team_lectores IS NULL THEN
        RAISE NOTICE 'No teams found. Skipping team_members seed.';
        RETURN;
    END IF;

    INSERT INTO social_features.team_members (
        id,
        team_id,
        user_id,
        role,
        joined_at,
        left_at
    ) VALUES

    -- Team Lectores members
    (
        gen_random_uuid(),
        v_team_lectores,
        v_student1_id,
        'owner',
        NOW() - INTERVAL '30 days',
        NULL
    ),
    (
        gen_random_uuid(),
        v_team_lectores,
        v_student2_id,
        'admin',
        NOW() - INTERVAL '28 days',
        NULL
    ),
    (
        gen_random_uuid(),
        v_team_lectores,
        v_student3_id,
        'member',
        NOW() - INTERVAL '25 days',
        NULL
    ),

    -- Team Inferencias members
    (
        gen_random_uuid(),
        v_team_inferencias,
        v_student2_id,
        'owner',
        NOW() - INTERVAL '20 days',
        NULL
    ),
    (
        gen_random_uuid(),
        v_team_inferencias,
        v_student1_id,
        'member',
        NOW() - INTERVAL '18 days',
        NULL
    ),

    -- Team Criticos members
    (
        gen_random_uuid(),
        v_team_criticos,
        v_teacher_id,
        'owner',
        NOW() - INTERVAL '15 days',
        NULL
    ),
    (
        gen_random_uuid(),
        v_team_criticos,
        v_student3_id,
        'member',
        NOW() - INTERVAL '14 days',
        NULL
    ),

    -- Former member (left team)
    (
        gen_random_uuid(),
        v_team_lectores,
        v_teacher_id,
        'member',
        NOW() - INTERVAL '29 days',
        NOW() - INTERVAL '10 days'
    )

    ON CONFLICT (team_id, user_id) DO UPDATE SET
        role = EXCLUDED.role,
        left_at = EXCLUDED.left_at;

    RAISE NOTICE 'Team members created successfully';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Warning: Could not create all team members: %', SQLERRM;
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
    v_total_count INTEGER;
    v_active_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total_count FROM social_features.team_members;
    SELECT COUNT(*) INTO v_active_count FROM social_features.team_members WHERE left_at IS NULL;

    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '  SEED COMPLETADO: team_members';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '  Total miembros: %', v_total_count;
    RAISE NOTICE '  - Activos: %', v_active_count;
    RAISE NOTICE '  - Han dejado equipos: %', v_total_count - v_active_count;
    RAISE NOTICE '════════════════════════════════════════════════════════';
END $$;
