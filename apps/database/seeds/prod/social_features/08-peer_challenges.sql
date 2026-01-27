-- =====================================================================================
-- SEED: Peer Challenges for social_features Schema (PROD - Minimal)
-- =====================================================================================
-- Description: Minimal peer challenge templates for production
-- Dependencies: auth_management.profiles
-- Created: 2026-01-27
-- Task: TASK-P1-SEEDS-SOCIAL-2026-01-27
-- =====================================================================================

SET search_path TO social_features, auth_management, educational_content, public;

-- =====================================================
-- PEER CHALLENGES (Production - Templates Only)
-- =====================================================

DO $$
DECLARE
    v_admin_id UUID;
BEGIN
    RAISE NOTICE 'Creating peer challenge templates for production...';

    -- Get admin user for template creation
    SELECT id INTO v_admin_id FROM auth_management.profiles
    WHERE role = 'super_admin' AND is_active = true
    LIMIT 1;

    IF v_admin_id IS NULL THEN
        SELECT id INTO v_admin_id FROM auth_management.profiles WHERE is_active = true LIMIT 1;
    END IF;

    IF v_admin_id IS NULL THEN
        RAISE NOTICE 'No users found. Skipping peer_challenges seed.';
        RETURN;
    END IF;

    INSERT INTO social_features.peer_challenges (
        id, challenge_type, created_by, module_id, title, description,
        difficulty_level, max_participants, min_participants,
        time_limit_minutes, status, rewards, is_public, created_at, updated_at
    ) VALUES
    -- Template 1: Head-to-head standard
    (
        '60000000-0000-0000-0000-000000000001'::uuid,
        'head_to_head',
        v_admin_id,
        NULL,
        'Desafio 1v1 de Comprension',
        'Template para desafios directos entre dos estudiantes',
        'intermediate',
        2, 2, 15,
        'open',
        '{"xp": 100, "ml_coins": 50}'::jsonb,
        true,
        NOW(), NOW()
    ),
    -- Template 2: Leaderboard competition
    (
        '60000000-0000-0000-0000-000000000002'::uuid,
        'leaderboard',
        v_admin_id,
        NULL,
        'Ranking Semanal',
        'Competencia semanal de lectura para toda la clase',
        'beginner',
        30, 5, NULL,
        'open',
        '{"xp_first": 200, "xp_second": 100, "xp_third": 50}'::jsonb,
        true,
        NOW(), NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        updated_at = NOW();

    RAISE NOTICE 'Production peer challenge templates created';
END $$;
