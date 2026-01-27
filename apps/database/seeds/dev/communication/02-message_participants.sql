-- =====================================================================================
-- SEED: communication.message_participants (DEV - Expanded)
-- =====================================================================================
-- Description: Participantes de mensajes para tracking de lectura individual
-- Environment: DEV
-- Dependencies: communication.messages, auth_management.profiles
-- Order: 02
-- Created: 2026-01-04 (ISS-SYNC-002)
-- Updated: 2026-01-27 - Expandido para TASK-P2-SEEDS-COMMUNICATION
-- =====================================================================================
--
-- PARTICIPANTES:
-- - Cada mensaje tiene sender y recipient(s)
-- - Los anuncios de classroom tienen múltiples recipients (estudiantes)
-- - Los mensajes directos tienen 1 sender y 1 recipient
--
-- =====================================================================================

SET search_path TO communication, auth_management, social_features, public;

-- =====================================================
-- MESSAGE PARTICIPANTS
-- =====================================================

DO $$
DECLARE
    v_teacher_id UUID;
    v_student1_id UUID;
    v_student2_id UUID;
    v_student3_id UUID;
    v_admin_id UUID;
    v_message RECORD;
    v_student RECORD;
    v_count INTEGER := 0;
    v_default_classroom_id UUID;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '  SEED: communication.message_participants (DEV)';
    RAISE NOTICE '════════════════════════════════════════════════════════';

    -- =====================================================
    -- Get User IDs (same logic as messages seed)
    -- =====================================================
    SELECT id INTO v_teacher_id
    FROM auth_management.profiles
    WHERE role IN ('admin_teacher', 'teacher')
    ORDER BY created_at LIMIT 1;

    SELECT id INTO v_admin_id
    FROM auth_management.profiles
    WHERE role = 'super_admin'
    ORDER BY created_at LIMIT 1;

    SELECT id INTO v_student1_id
    FROM auth_management.profiles
    WHERE role = 'student'
      AND email NOT LIKE '%@gamilit.com'
    ORDER BY created_at LIMIT 1;

    SELECT id INTO v_student2_id
    FROM auth_management.profiles
    WHERE role = 'student'
      AND email NOT LIKE '%@gamilit.com'
    ORDER BY created_at OFFSET 1 LIMIT 1;

    SELECT id INTO v_student3_id
    FROM auth_management.profiles
    WHERE role = 'student'
      AND email NOT LIKE '%@gamilit.com'
    ORDER BY created_at OFFSET 2 LIMIT 1;

    -- Fallbacks
    IF v_teacher_id IS NULL THEN
        SELECT id INTO v_teacher_id FROM auth_management.profiles WHERE is_active = true LIMIT 1;
    END IF;
    IF v_student1_id IS NULL THEN v_student1_id := v_teacher_id; END IF;
    IF v_student2_id IS NULL THEN v_student2_id := v_student1_id; END IF;
    IF v_student3_id IS NULL THEN v_student3_id := v_student1_id; END IF;
    IF v_admin_id IS NULL THEN v_admin_id := v_teacher_id; END IF;

    -- Get classroom
    SELECT id INTO v_default_classroom_id
    FROM social_features.classrooms
    WHERE is_active = true
    ORDER BY created_at LIMIT 1;

    IF v_teacher_id IS NULL THEN
        RAISE NOTICE '⚠ No users found. Skipping message_participants seed.';
        RETURN;
    END IF;

    -- =====================================================
    -- Create participants for all messages
    -- =====================================================

    -- Loop through all messages and create appropriate participants
    FOR v_message IN
        SELECT id, sender_id, recipient_id, classroom_id, message_type
        FROM communication.messages
        WHERE id NOT IN (SELECT DISTINCT message_id FROM communication.message_participants)
    LOOP
        -- Always add sender
        INSERT INTO communication.message_participants (
            message_id, user_id, role, is_read, read_at, created_at
        ) VALUES (
            v_message.id,
            v_message.sender_id,
            'sender',
            true,
            NOW(),
            NOW()
        )
        ON CONFLICT (message_id, user_id, role) DO NOTHING;
        v_count := v_count + 1;

        -- Add recipient for direct messages
        IF v_message.recipient_id IS NOT NULL THEN
            INSERT INTO communication.message_participants (
                message_id, user_id, role, is_read, read_at, created_at
            ) VALUES (
                v_message.id,
                v_message.recipient_id,
                'recipient',
                CASE WHEN random() > 0.5 THEN true ELSE false END,  -- Random read status
                CASE WHEN random() > 0.5 THEN NOW() ELSE NULL END,
                NOW()
            )
            ON CONFLICT (message_id, user_id, role) DO NOTHING;
            v_count := v_count + 1;
        END IF;

        -- Add classroom members as recipients for classroom messages
        IF v_message.classroom_id IS NOT NULL AND v_message.message_type IN ('classroom_announcement', 'classroom_chat') THEN
            FOR v_student IN
                SELECT cm.user_id
                FROM social_features.classroom_members cm
                WHERE cm.classroom_id = v_message.classroom_id
                  AND cm.user_id != v_message.sender_id
                LIMIT 10
            LOOP
                INSERT INTO communication.message_participants (
                    message_id, user_id, role, is_read, read_at, created_at
                ) VALUES (
                    v_message.id,
                    v_student.user_id,
                    'recipient',
                    CASE WHEN random() > 0.6 THEN true ELSE false END,
                    CASE WHEN random() > 0.6 THEN NOW() - (random() * INTERVAL '24 hours') ELSE NULL END,
                    NOW()
                )
                ON CONFLICT (message_id, user_id, role) DO NOTHING;
                v_count := v_count + 1;
            END LOOP;

            -- If no classroom members found, add our demo students
            IF NOT FOUND THEN
                -- Add student1
                INSERT INTO communication.message_participants (
                    message_id, user_id, role, is_read, created_at
                ) VALUES (
                    v_message.id, v_student1_id, 'recipient', false, NOW()
                ) ON CONFLICT (message_id, user_id, role) DO NOTHING;
                v_count := v_count + 1;

                -- Add student2
                INSERT INTO communication.message_participants (
                    message_id, user_id, role, is_read, created_at
                ) VALUES (
                    v_message.id, v_student2_id, 'recipient', false, NOW()
                ) ON CONFLICT (message_id, user_id, role) DO NOTHING;
                v_count := v_count + 1;

                -- Add student3
                INSERT INTO communication.message_participants (
                    message_id, user_id, role, is_read, created_at
                ) VALUES (
                    v_message.id, v_student3_id, 'recipient', false, NOW()
                ) ON CONFLICT (message_id, user_id, role) DO NOTHING;
                v_count := v_count + 1;
            END IF;
        END IF;
    END LOOP;

    RAISE NOTICE '  ✓ Participants created: %', v_count;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '⚠ Warning: Could not create all participants: %', SQLERRM;
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
    v_total INTEGER;
    v_senders INTEGER;
    v_recipients INTEGER;
    v_read INTEGER;
    v_unread INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total FROM communication.message_participants;
    SELECT COUNT(*) INTO v_senders FROM communication.message_participants WHERE role = 'sender';
    SELECT COUNT(*) INTO v_recipients FROM communication.message_participants WHERE role = 'recipient';
    SELECT COUNT(*) INTO v_read FROM communication.message_participants WHERE is_read = true;
    SELECT COUNT(*) INTO v_unread FROM communication.message_participants WHERE is_read = false;

    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '  SEED COMPLETADO: communication.message_participants';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '  Total participantes: %', v_total;
    RAISE NOTICE '  - Senders: %', v_senders;
    RAISE NOTICE '  - Recipients: %', v_recipients;
    RAISE NOTICE '  - Read: %', v_read;
    RAISE NOTICE '  - Unread: %', v_unread;
    RAISE NOTICE '════════════════════════════════════════════════════════';
END $$;
