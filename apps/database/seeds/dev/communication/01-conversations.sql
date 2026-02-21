-- ============================================================================
-- Seed: Conversations
-- Schema: communication
-- Description: Demo conversations for teacher messaging features
-- Dependencies: auth.users + profiles, classrooms
-- Created: 2026-02-20 (AUDIT D2-MEDIUM)
-- ============================================================================

DO $$
DECLARE
    v_teacher_id UUID;
    v_student_id UUID;
    v_admin_id UUID;
    v_classroom_id UUID;
    v_conv_direct UUID;
    v_conv_group UUID;
    v_conv_classroom UUID;
    v_conv_announcements UUID;
BEGIN
    SELECT p.id INTO v_teacher_id
    FROM auth.users u
    JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'teacher@gamilit.com';

    SELECT p.id INTO v_student_id
    FROM auth.users u
    JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'student@gamilit.com';

    SELECT p.id INTO v_admin_id
    FROM auth.users u
    JOIN auth_management.profiles p ON p.user_id = u.id
    WHERE u.email = 'admin@gamilit.com';

    IF v_teacher_id IS NULL THEN
        RAISE NOTICE 'SKIP: teacher@gamilit.com not found. Run user seeds first.';
        RETURN;
    END IF;

    SELECT id INTO v_classroom_id
    FROM social_features.classrooms
    ORDER BY created_at LIMIT 1;

    -- Clean previous seed data
    DELETE FROM communication.conversation_participants
    WHERE conversation_id IN (
        SELECT id FROM communication.conversations WHERE title LIKE '%[SEED]%'
    );
    DELETE FROM communication.conversations WHERE title LIKE '%[SEED]%';

    v_conv_direct := gen_random_uuid();
    v_conv_group := gen_random_uuid();
    v_conv_classroom := gen_random_uuid();
    v_conv_announcements := gen_random_uuid();

    -- 1. Direct conversation (teacher <> student)
    INSERT INTO communication.conversations (
        id, title, conversation_type, created_by, message_count
    ) VALUES (
        v_conv_direct, 'Consulta sobre Modulo 1 [SEED]', 'direct', v_teacher_id, 3
    );

    -- 2. Group conversation (teacher + admin)
    INSERT INTO communication.conversations (
        id, title, description, conversation_type, created_by, message_count
    ) VALUES (
        v_conv_group, 'Coordinacion Docente [SEED]',
        'Grupo para coordinar actividades del semestre',
        'group', v_teacher_id, 5
    );

    -- 3. Classroom conversation
    IF v_classroom_id IS NOT NULL THEN
        INSERT INTO communication.conversations (
            id, title, conversation_type, classroom_id, created_by, message_count
        ) VALUES (
            v_conv_classroom, 'Chat del Aula [SEED]', 'classroom',
            v_classroom_id, v_teacher_id, 12
        );
        INSERT INTO communication.conversations (
            id, title, conversation_type, classroom_id, is_readonly, created_by, message_count
        ) VALUES (
            v_conv_announcements, 'Anuncios [SEED]', 'classroom',
            v_classroom_id, true, v_teacher_id, 2
        );
    END IF;

    -- Add participants
    INSERT INTO communication.conversation_participants (
        id, conversation_id, user_id, role, is_active, unread_count
    ) VALUES
    (gen_random_uuid(), v_conv_direct, v_teacher_id, 'owner', true, 0),
    (gen_random_uuid(), v_conv_direct, COALESCE(v_student_id, v_teacher_id), 'member', true, 1)
    ON CONFLICT (conversation_id, user_id) DO NOTHING;

    IF v_admin_id IS NOT NULL THEN
        INSERT INTO communication.conversation_participants (
            id, conversation_id, user_id, role, is_active, unread_count
        ) VALUES
        (gen_random_uuid(), v_conv_group, v_teacher_id, 'owner', true, 0),
        (gen_random_uuid(), v_conv_group, v_admin_id, 'member', true, 2)
        ON CONFLICT (conversation_id, user_id) DO NOTHING;
    END IF;

    IF v_classroom_id IS NOT NULL AND v_student_id IS NOT NULL THEN
        INSERT INTO communication.conversation_participants (
            id, conversation_id, user_id, role, is_active, unread_count
        ) VALUES
        (gen_random_uuid(), v_conv_classroom, v_teacher_id, 'owner', true, 0),
        (gen_random_uuid(), v_conv_classroom, v_student_id, 'member', true, 3),
        (gen_random_uuid(), v_conv_announcements, v_teacher_id, 'owner', true, 0),
        (gen_random_uuid(), v_conv_announcements, v_student_id, 'member', true, 1)
        ON CONFLICT (conversation_id, user_id) DO NOTHING;
    END IF;

    RAISE NOTICE 'Conversations: created 4 demo conversations with participants';
END $$;
