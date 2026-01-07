-- =====================================================
-- Seed: communication.messages (SYSTEM)
-- Description: Mensajes de sistema y bienvenida
-- Environment: PRODUCTION
-- Dependencies: auth_management.profiles, social_features.classrooms
-- Order: 01
-- Created: 2026-01-04 (Auditoría P1-3)
-- =====================================================
--
-- MENSAJES INCLUIDOS:
-- - Mensaje de bienvenida del sistema al classroom DEFAULT
-- - Anuncio de inicio de plataforma
--
-- NOTA: Este seed es opcional y crea mensajes de ejemplo.
-- En producción, los mensajes serán creados por usuarios.
--
-- =====================================================

SET search_path TO communication, auth_management, social_features, public;

-- =====================================================
-- Mensaje de bienvenida al classroom DEFAULT
-- =====================================================

DO $$
DECLARE
    v_teacher_id UUID;
    v_default_classroom_id UUID;
BEGIN
    -- Obtener teacher default
    SELECT id INTO v_teacher_id
    FROM auth_management.profiles
    WHERE email = 'teacher@gamilit.com'
    LIMIT 1;

    -- Obtener classroom DEFAULT
    SELECT id INTO v_default_classroom_id
    FROM social_features.classrooms
    WHERE code = 'DEFAULT'
    LIMIT 1;

    -- Solo insertar si encontramos los IDs necesarios
    IF v_teacher_id IS NOT NULL AND v_default_classroom_id IS NOT NULL THEN

        INSERT INTO communication.messages (
            id,
            sender_id,
            recipient_id,
            classroom_id,
            subject,
            content,
            message_type,
            priority,
            is_pinned,
            moderation_status,
            metadata,
            created_at
        ) VALUES
        -- Mensaje de bienvenida (anuncio de sistema)
        (
            'c0000001-0000-0000-0001-000000000001'::uuid,
            v_teacher_id,
            NULL,  -- Sin destinatario específico (broadcast)
            v_default_classroom_id,
            'Bienvenidos a GAMILIT',
            E'¡Hola a todos!\n\nBienvenidos a la plataforma GAMILIT. Aquí podrás:\n\n• Completar ejercicios de comprensión lectora\n• Ganar XP y ML Coins\n• Subir de rango en el sistema Maya\n• Desbloquear logros y comodines\n\nSi tienes dudas, no dudes en preguntar. ¡Buena suerte en tu aventura de lectura!',
            'classroom_announcement',
            'normal',
            true,  -- Mensaje fijado
            'approved',
            jsonb_build_object(
                'is_system', true,
                'welcome_message', true,
                'version', '1.0'
            ),
            gamilit.now_mexico()
        )
        ON CONFLICT (id) DO UPDATE SET
            content = EXCLUDED.content,
            is_pinned = EXCLUDED.is_pinned,
            metadata = EXCLUDED.metadata;

        RAISE NOTICE 'Mensaje de bienvenida creado en classroom DEFAULT';
    ELSE
        RAISE WARNING 'No se encontró teacher o classroom DEFAULT. Saltando creación de mensajes.';
    END IF;
END $$;

-- =====================================================
-- Verification Query
-- =====================================================

DO $$
DECLARE
    message_count INTEGER;
    pinned_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO message_count FROM communication.messages;
    SELECT COUNT(*) INTO pinned_count FROM communication.messages WHERE is_pinned = true;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICACIÓN DE MENSAJES';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total mensajes: %', message_count;
    RAISE NOTICE 'Mensajes fijados: %', pinned_count;
    RAISE NOTICE '========================================';
END $$;
