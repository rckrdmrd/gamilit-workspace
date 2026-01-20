-- =====================================================================================
-- SEED: Friend Requests for social_features Schema
-- =====================================================================================
-- Description: Sample friend request data showing various states of requests
-- Dependencies: auth_management.profiles
-- Idempotency: Uses ON CONFLICT to handle re-runs safely
-- Created: 2026-01-20
-- Task: P2-3 (Aumentar cobertura de seeds al 80%)
-- =====================================================================================

SET search_path TO social_features, auth_management, public;

-- =====================================================
-- FRIEND REQUESTS
-- =====================================================

DO $$
DECLARE
    v_student1_id UUID;
    v_student2_id UUID;
    v_student3_id UUID;
    v_student4_id UUID;
    v_student5_id UUID;
BEGIN
    RAISE NOTICE 'Creating friend request records...';

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

    SELECT id INTO v_student4_id FROM auth_management.profiles
    WHERE role = 'student' AND is_active = true
    ORDER BY created_at OFFSET 3 LIMIT 1;

    SELECT id INTO v_student5_id FROM auth_management.profiles
    WHERE is_active = true
    ORDER BY created_at OFFSET 4 LIMIT 1;

    -- Fallbacks
    IF v_student1_id IS NULL THEN
        SELECT id INTO v_student1_id FROM auth_management.profiles WHERE is_active = true LIMIT 1;
    END IF;
    IF v_student2_id IS NULL THEN
        SELECT id INTO v_student2_id FROM auth_management.profiles WHERE is_active = true AND id != v_student1_id LIMIT 1;
    END IF;
    IF v_student3_id IS NULL THEN
        v_student3_id := gen_random_uuid();
    END IF;
    IF v_student4_id IS NULL THEN
        v_student4_id := gen_random_uuid();
    END IF;
    IF v_student5_id IS NULL THEN
        v_student5_id := gen_random_uuid();
    END IF;

    -- Skip if insufficient users
    IF v_student1_id IS NULL OR v_student2_id IS NULL THEN
        RAISE NOTICE 'Insufficient users found. Skipping friend_requests seed.';
        RETURN;
    END IF;

    INSERT INTO social_features.friend_requests (
        id,
        requester_id,
        recipient_id,
        status,
        message,
        created_at,
        responded_at
    ) VALUES

    -- Pending requests
    (
        '51111111-1111-1111-1111-111111111001'::uuid,
        v_student1_id,
        v_student3_id,
        'pending',
        'Hola! Vi que tambien estas en el modulo de comprension literal. Quieres ser amigos para practicar juntos?',
        NOW() - INTERVAL '2 days',
        NULL
    ),
    (
        '51111111-1111-1111-1111-111111111002'::uuid,
        v_student4_id,
        v_student1_id,
        'pending',
        'Me gustaria agregarte como amigo para competir en los desafios!',
        NOW() - INTERVAL '1 day',
        NULL
    ),

    -- Accepted request
    (
        '51111111-1111-1111-1111-111111111003'::uuid,
        v_student2_id,
        v_student1_id,
        'accepted',
        'Somos companeros de clase. Agreguemonos!',
        NOW() - INTERVAL '15 days',
        NOW() - INTERVAL '14 days'
    ),

    -- Rejected request
    (
        '51111111-1111-1111-1111-111111111004'::uuid,
        v_student5_id,
        v_student2_id,
        'rejected',
        NULL,
        NOW() - INTERVAL '10 days',
        NOW() - INTERVAL '9 days'
    ),

    -- Cancelled request (requester cancelled)
    (
        '51111111-1111-1111-1111-111111111005'::uuid,
        v_student1_id,
        v_student5_id,
        'cancelled',
        'Te envio solicitud de amistad',
        NOW() - INTERVAL '8 days',
        NOW() - INTERVAL '7 days'
    ),

    -- Another pending request
    (
        '51111111-1111-1111-1111-111111111006'::uuid,
        v_student3_id,
        v_student2_id,
        'pending',
        'Hola! Podemos ser amigos?',
        NOW() - INTERVAL '3 hours',
        NULL
    )

    ON CONFLICT (requester_id, recipient_id) DO UPDATE SET
        status = EXCLUDED.status,
        responded_at = EXCLUDED.responded_at;

    RAISE NOTICE 'Friend requests created successfully';

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Warning: Could not create all friend requests: %', SQLERRM;
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
    v_total_count INTEGER;
    v_pending_count INTEGER;
    v_accepted_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total_count FROM social_features.friend_requests;
    SELECT COUNT(*) INTO v_pending_count FROM social_features.friend_requests WHERE status = 'pending';
    SELECT COUNT(*) INTO v_accepted_count FROM social_features.friend_requests WHERE status = 'accepted';

    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '  SEED COMPLETADO: friend_requests';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '  Total solicitudes: %', v_total_count;
    RAISE NOTICE '  - Pending: %', v_pending_count;
    RAISE NOTICE '  - Accepted: %', v_accepted_count;
    RAISE NOTICE '════════════════════════════════════════════════════════';
END $$;
