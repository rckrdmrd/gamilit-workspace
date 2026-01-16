-- =====================================================
-- Seed: communication.message_participants
-- Description: Participantes de mensajes del sistema
-- Environment: PRODUCTION
-- Dependencies: communication.messages, auth_management.profiles
-- Order: 02
-- Created: 2026-01-04 (ISS-SYNC-002)
-- =====================================================
--
-- PARTICIPANTES INCLUIDOS:
-- - Sender (teacher) del mensaje de bienvenida
-- - Recipients (estudiantes) del classroom DEFAULT
--
-- NOTA: Este seed crea los participantes para los mensajes
-- de ejemplo. Cada mensaje tiene un sender y múltiples recipients.
--
-- =====================================================

SET search_path TO communication, auth_management, social_features, public;

-- =====================================================
-- Participantes del mensaje de bienvenida
-- =====================================================

DO $$
DECLARE
    v_teacher_id UUID;
    v_welcome_message_id UUID := 'c0000001-0000-0000-0001-000000000001'::uuid;
    v_default_classroom_id UUID;
    v_student RECORD;
    v_counter INTEGER := 0;
BEGIN
    -- Obtener teacher default
    SELECT user_id INTO v_teacher_id
    FROM auth_management.profiles
    WHERE email = 'teacher@gamilit.com'
    LIMIT 1;

    -- Obtener classroom DEFAULT
    SELECT id INTO v_default_classroom_id
    FROM social_features.classrooms
    WHERE code = 'DEFAULT'
    LIMIT 1;

    -- Verificar que el mensaje existe
    IF NOT EXISTS (SELECT 1 FROM communication.messages WHERE id = v_welcome_message_id) THEN
        RAISE WARNING 'Mensaje de bienvenida no encontrado. Ejecutar primero 01-system-messages.sql';
        RETURN;
    END IF;

    -- Verificar que tenemos el teacher
    IF v_teacher_id IS NULL THEN
        RAISE WARNING 'No se encontró teacher default. Saltando creación de participantes.';
        RETURN;
    END IF;

    -- Crear participante sender (teacher)
    INSERT INTO communication.message_participants (
        id,
        message_id,
        user_id,
        role,
        is_read,
        read_at,
        created_at
    ) VALUES (
        'd0000001-0000-0000-0001-000000000001'::uuid,
        v_welcome_message_id,
        v_teacher_id,
        'sender',
        true,  -- Sender siempre ha leído su propio mensaje
        gamilit.now_mexico(),
        gamilit.now_mexico()
    )
    ON CONFLICT (id) DO UPDATE SET
        is_read = EXCLUDED.is_read,
        read_at = EXCLUDED.read_at;

    v_counter := v_counter + 1;

    -- Crear participantes para estudiantes del classroom DEFAULT
    IF v_default_classroom_id IS NOT NULL THEN
        FOR v_student IN
            SELECT cm.user_id
            FROM social_features.classroom_members cm
            WHERE cm.classroom_id = v_default_classroom_id
              AND cm.role = 'student'
            LIMIT 10  -- Máximo 10 estudiantes para seed
        LOOP
            INSERT INTO communication.message_participants (
                id,
                message_id,
                user_id,
                role,
                is_read,
                read_at,
                created_at
            ) VALUES (
                gen_random_uuid(),
                v_welcome_message_id,
                v_student.user_id,
                'recipient',
                false,  -- Estudiantes aún no han leído
                NULL,
                gamilit.now_mexico()
            )
            ON CONFLICT DO NOTHING;  -- Evitar duplicados

            v_counter := v_counter + 1;
        END LOOP;
    END IF;

    RAISE NOTICE 'Creados % participantes para mensaje de bienvenida', v_counter;
END $$;

-- =====================================================
-- Verification Query
-- =====================================================

DO $$
DECLARE
    total_participants INTEGER;
    sender_count INTEGER;
    recipient_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_participants FROM communication.message_participants;
    SELECT COUNT(*) INTO sender_count FROM communication.message_participants WHERE role = 'sender';
    SELECT COUNT(*) INTO recipient_count FROM communication.message_participants WHERE role = 'recipient';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICACIÓN DE PARTICIPANTES';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total participantes: %', total_participants;
    RAISE NOTICE 'Senders: %', sender_count;
    RAISE NOTICE 'Recipients: %', recipient_count;
    RAISE NOTICE '========================================';
END $$;
