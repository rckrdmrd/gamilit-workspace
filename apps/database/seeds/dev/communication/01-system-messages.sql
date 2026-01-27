-- =====================================================================================
-- SEED: communication.messages (DEV - Expanded)
-- =====================================================================================
-- Description: Mensajes variados para desarrollo y testing
-- Environment: DEV
-- Dependencies: auth_management.profiles, social_features.classrooms
-- Order: 01
-- Created: 2026-01-04 (Auditoría P1-3)
-- Updated: 2026-01-27 - Expandido para TASK-P2-SEEDS-COMMUNICATION (20+ mensajes)
-- =====================================================================================
--
-- TIPOS DE MENSAJES:
-- - direct: Mensajes 1:1 entre usuarios
-- - classroom_announcement: Anuncios del profesor al aula
-- - classroom_chat: Chat grupal del aula
-- - private_feedback: Retroalimentación privada
-- - assignment_comment: Comentarios en asignaciones
-- - system: Mensajes del sistema
--
-- =====================================================================================

SET search_path TO communication, auth_management, social_features, public;

-- =====================================================
-- MENSAJES DE COMUNICACIÓN
-- =====================================================

DO $$
DECLARE
    v_teacher_id UUID;
    v_student1_id UUID;
    v_student2_id UUID;
    v_student3_id UUID;
    v_admin_id UUID;
    v_default_classroom_id UUID;
    v_thread1_id UUID := 'c0000001-0001-0000-0001-000000000001'::uuid;
    v_thread2_id UUID := 'c0000001-0002-0000-0001-000000000001'::uuid;
    v_count INTEGER := 0;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '  SEED: communication.messages (DEV)';
    RAISE NOTICE '════════════════════════════════════════════════════════';

    -- =====================================================
    -- Get User IDs
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
        RAISE NOTICE '⚠ No users found. Skipping messages seed.';
        RETURN;
    END IF;

    RAISE NOTICE '  Users: teacher=%, student1=%, student2=%', v_teacher_id, v_student1_id, v_student2_id;

    -- =====================================================
    -- INSERT MESSAGES
    -- =====================================================
    INSERT INTO communication.messages (
        id, sender_id, recipient_id, classroom_id, thread_id, parent_message_id,
        subject, content, message_type, priority,
        is_read, is_pinned, is_archived, requires_response,
        moderation_status, metadata, created_at
    ) VALUES

    -- =====================================================
    -- CLASSROOM ANNOUNCEMENTS (Teacher → Classroom)
    -- =====================================================

    -- Message 1: Welcome announcement (pinned)
    (
        'c0000001-0000-0000-0001-000000000001'::uuid,
        v_teacher_id,
        NULL,
        v_default_classroom_id,
        NULL, NULL,
        'Bienvenidos a GAMILIT',
        E'¡Hola a todos!\n\nBienvenidos a la plataforma GAMILIT. Aquí podrás:\n\n• Completar ejercicios de comprensión lectora\n• Ganar XP y ML Coins\n• Subir de rango en el sistema Maya\n• Desbloquear logros y comodines\n\n¡Buena suerte en tu aventura de lectura!',
        'classroom_announcement',
        'normal',
        false, true, false, false,
        'approved',
        '{"is_system": true, "welcome_message": true}'::jsonb,
        gamilit.now_mexico() - INTERVAL '30 days'
    ),

    -- Message 2: Module announcement
    (
        'c0000001-0000-0000-0001-000000000002'::uuid,
        v_teacher_id,
        NULL,
        v_default_classroom_id,
        NULL, NULL,
        'Nuevo Módulo: Comprensión Inferencial',
        E'Estudiantes,\n\nHoy hemos desbloqueado el Módulo 2: Comprensión Inferencial. En este módulo aprenderán a:\n\n1. Leer entre líneas\n2. Hacer inferencias lógicas\n3. Predecir consecuencias\n\nTienen hasta el viernes para completar los primeros 3 ejercicios. ¡Éxito!',
        'classroom_announcement',
        'high',
        false, false, false, false,
        'approved',
        '{"module_id": "M2", "deadline": true}'::jsonb,
        gamilit.now_mexico() - INTERVAL '7 days'
    ),

    -- Message 3: Reminder announcement
    (
        'c0000001-0000-0000-0001-000000000003'::uuid,
        v_teacher_id,
        NULL,
        v_default_classroom_id,
        NULL, NULL,
        'Recordatorio: Entrega mañana',
        'Recuerden que mañana es la fecha límite para el ejercicio de Línea de Tiempo. Quienes no lo han completado, aprovechen hoy.',
        'classroom_announcement',
        'urgent',
        false, false, false, false,
        'approved',
        '{"reminder": true}'::jsonb,
        gamilit.now_mexico() - INTERVAL '2 days'
    ),

    -- =====================================================
    -- DIRECT MESSAGES (Student ↔ Student)
    -- =====================================================

    -- Thread 1: Student1 → Student2 (study group)
    -- Message 4: Thread starter
    (
        v_thread1_id,
        v_student1_id,
        v_student2_id,
        NULL,
        v_thread1_id, NULL,
        'Grupo de estudio',
        '¡Hola! ¿Quieres hacer un grupo de estudio para el módulo 2? Podemos practicar juntos los ejercicios de inferencia.',
        'direct',
        'normal',
        true, false, false, false,
        'approved',
        '{"study_group_invite": true}'::jsonb,
        gamilit.now_mexico() - INTERVAL '5 days'
    ),

    -- Message 5: Reply
    (
        'c0000001-0001-0000-0001-000000000002'::uuid,
        v_student2_id,
        v_student1_id,
        NULL,
        v_thread1_id, v_thread1_id,
        NULL,
        '¡Claro que sí! Me parece genial. ¿Cuándo podemos conectarnos?',
        'direct',
        'normal',
        true, false, false, false,
        'approved',
        '{}'::jsonb,
        gamilit.now_mexico() - INTERVAL '5 days' + INTERVAL '2 hours'
    ),

    -- Message 6: Follow-up
    (
        'c0000001-0001-0000-0001-000000000003'::uuid,
        v_student1_id,
        v_student2_id,
        NULL,
        v_thread1_id, 'c0000001-0001-0000-0001-000000000002'::uuid,
        NULL,
        '¿Qué tal mañana después de clases? Podemos revisar el ejercicio del Detective Textual.',
        'direct',
        'normal',
        false, false, false, false,
        'approved',
        '{}'::jsonb,
        gamilit.now_mexico() - INTERVAL '4 days'
    ),

    -- Message 7: Confirmation
    (
        'c0000001-0001-0000-0001-000000000004'::uuid,
        v_student2_id,
        v_student1_id,
        NULL,
        v_thread1_id, 'c0000001-0001-0000-0001-000000000003'::uuid,
        NULL,
        'Perfecto, nos vemos mañana. Ya completé el primer ejercicio, te puedo explicar las partes difíciles.',
        'direct',
        'normal',
        false, false, false, false,
        'approved',
        '{}'::jsonb,
        gamilit.now_mexico() - INTERVAL '4 days' + INTERVAL '1 hour'
    ),

    -- =====================================================
    -- DIRECT MESSAGES (Student → Teacher)
    -- =====================================================

    -- Thread 2: Student asks teacher for help
    -- Message 8: Thread starter
    (
        v_thread2_id,
        v_student1_id,
        v_teacher_id,
        NULL,
        v_thread2_id, NULL,
        'Duda sobre ejercicio',
        E'Hola profe,\n\nTengo una duda con el ejercicio de Predicción Narrativa. No entiendo cómo identificar las pistas del autor para predecir lo que va a pasar. ¿Me puede dar un ejemplo?\n\nGracias.',
        'direct',
        'normal',
        true, false, false, true,
        'approved',
        '{"help_request": true, "exercise_type": "prediccion_narrativa"}'::jsonb,
        gamilit.now_mexico() - INTERVAL '3 days'
    ),

    -- Message 9: Teacher reply
    (
        'c0000001-0002-0000-0001-000000000002'::uuid,
        v_teacher_id,
        v_student1_id,
        NULL,
        v_thread2_id, v_thread2_id,
        NULL,
        E'¡Hola!\n\nBuena pregunta. Para identificar pistas del autor, fíjate en:\n\n1. Descripciones detalladas de objetos o lugares\n2. Emociones de los personajes\n3. Diálogos que sugieren algo futuro\n4. El título o subtítulos\n\nPor ejemplo, si el texto dice "el cielo se oscureció repentinamente", eso sugiere que algo malo puede pasar.\n\n¿Te queda más claro? Si tienes más dudas, avísame.',
        'direct',
        'normal',
        true, false, false, false,
        'approved',
        '{"teacher_response": true}'::jsonb,
        gamilit.now_mexico() - INTERVAL '3 days' + INTERVAL '4 hours'
    ),

    -- Message 10: Student thanks
    (
        'c0000001-0002-0000-0001-000000000003'::uuid,
        v_student1_id,
        v_teacher_id,
        NULL,
        v_thread2_id, 'c0000001-0002-0000-0001-000000000002'::uuid,
        NULL,
        '¡Gracias profe! Ahora entiendo mejor. Voy a intentar el ejercicio de nuevo.',
        'direct',
        'normal',
        true, false, false, false,
        'approved',
        '{}'::jsonb,
        gamilit.now_mexico() - INTERVAL '3 days' + INTERVAL '5 hours'
    ),

    -- =====================================================
    -- PRIVATE FEEDBACK (Teacher → Student)
    -- =====================================================

    -- Message 11: Exercise feedback
    (
        'c0000001-0000-0000-0002-000000000001'::uuid,
        v_teacher_id,
        v_student1_id,
        NULL,
        NULL, NULL,
        'Retroalimentación: Ejercicio Crucigrama',
        E'Excelente trabajo en el ejercicio de Crucigrama Científico. Tu puntuación fue 95/100.\n\nPuntos fuertes:\n• Identificaste correctamente todos los términos científicos\n• Completaste el ejercicio en tiempo récord\n\nÁrea de mejora:\n• Revisa la definición de "radiactividad" - tuviste un pequeño error\n\n¡Sigue así!',
        'private_feedback',
        'normal',
        false, false, false, false,
        'approved',
        '{"exercise_id": "crucigrama_1", "score": 95, "feedback_type": "positive"}'::jsonb,
        gamilit.now_mexico() - INTERVAL '6 days'
    ),

    -- Message 12: Another feedback
    (
        'c0000001-0000-0000-0002-000000000002'::uuid,
        v_teacher_id,
        v_student2_id,
        NULL,
        NULL, NULL,
        'Retroalimentación: Módulo 1 Completado',
        E'¡Felicidades por completar el Módulo 1!\n\nTu desempeño general fue muy bueno. Obtuviste el logro "Lector Literal" y subiste al rango Nacom.\n\nRecomendación: Antes de empezar el Módulo 2, repasa los conceptos de idea principal vs detalles secundarios.',
        'private_feedback',
        'normal',
        true, false, false, false,
        'approved',
        '{"module_completed": "M1", "achievement": "lector_literal", "rank": "Nacom"}'::jsonb,
        gamilit.now_mexico() - INTERVAL '10 days'
    ),

    -- =====================================================
    -- CLASSROOM CHAT (Students chatting in classroom)
    -- =====================================================

    -- Message 13: Student chat in classroom
    (
        'c0000001-0000-0000-0003-000000000001'::uuid,
        v_student1_id,
        NULL,
        v_default_classroom_id,
        NULL, NULL,
        NULL,
        '¿Alguien ya terminó el ejercicio del Detective Textual? Está difícil encontrar todas las pistas.',
        'classroom_chat',
        'normal',
        false, false, false, false,
        'approved',
        '{}'::jsonb,
        gamilit.now_mexico() - INTERVAL '2 days'
    ),

    -- Message 14: Response
    (
        'c0000001-0000-0000-0003-000000000002'::uuid,
        v_student2_id,
        NULL,
        v_default_classroom_id,
        NULL, 'c0000001-0000-0000-0003-000000000001'::uuid,
        NULL,
        'Yo lo acabo de terminar. El truco es leer el texto dos veces: primero rápido y luego con calma buscando detalles.',
        'classroom_chat',
        'normal',
        false, false, false, false,
        'approved',
        '{}'::jsonb,
        gamilit.now_mexico() - INTERVAL '2 days' + INTERVAL '30 minutes'
    ),

    -- Message 15: Another student joins
    (
        'c0000001-0000-0000-0003-000000000003'::uuid,
        v_student3_id,
        NULL,
        v_default_classroom_id,
        NULL, 'c0000001-0000-0000-0003-000000000002'::uuid,
        NULL,
        '¡Gracias por el tip! Voy a intentarlo así.',
        'classroom_chat',
        'normal',
        false, false, false, false,
        'approved',
        '{}'::jsonb,
        gamilit.now_mexico() - INTERVAL '2 days' + INTERVAL '45 minutes'
    ),

    -- =====================================================
    -- SYSTEM MESSAGES
    -- =====================================================

    -- Message 16: System achievement notification
    (
        'c0000001-0000-0000-0004-000000000001'::uuid,
        v_admin_id,
        v_student1_id,
        NULL,
        NULL, NULL,
        'Nuevo Logro Desbloqueado',
        E'¡Felicidades! Has desbloqueado el logro "Racha de 7 Días".\n\nRecompensa: +50 XP, +25 ML Coins\n\nSigue conectándote diariamente para desbloquear más logros.',
        'system',
        'normal',
        false, false, false, false,
        'approved',
        '{"achievement_id": "streak_7", "xp_reward": 50, "coins_reward": 25}'::jsonb,
        gamilit.now_mexico() - INTERVAL '1 day'
    ),

    -- Message 17: System rank up
    (
        'c0000001-0000-0000-0004-000000000002'::uuid,
        v_admin_id,
        v_student2_id,
        NULL,
        NULL, NULL,
        '¡Subiste de Rango!',
        E'¡Enhorabuena! Has alcanzado el rango "Ah K''in" en el sistema Maya.\n\nNuevos beneficios:\n• +10% XP en todos los ejercicios\n• Acceso a comodines premium\n• Badge especial en tu perfil',
        'system',
        'high',
        false, false, false, false,
        'approved',
        '{"rank_up": true, "new_rank": "Ah K''in", "xp_bonus": 0.10}'::jsonb,
        gamilit.now_mexico() - INTERVAL '8 hours'
    ),

    -- Message 18: System weekly summary
    (
        'c0000001-0000-0000-0004-000000000003'::uuid,
        v_admin_id,
        v_student1_id,
        NULL,
        NULL, NULL,
        'Resumen Semanal',
        E'Tu resumen de la semana:\n\n📊 Estadísticas:\n• Ejercicios completados: 12\n• XP ganada: 450\n• ML Coins ganadas: 180\n• Racha actual: 5 días\n\n🏆 Posición en el ranking: #3 del aula\n\n¡Sigue así para alcanzar el primer lugar!',
        'system',
        'low',
        false, false, false, false,
        'approved',
        '{"weekly_summary": true, "exercises": 12, "xp": 450, "coins": 180, "rank_position": 3}'::jsonb,
        gamilit.now_mexico() - INTERVAL '12 hours'
    ),

    -- =====================================================
    -- ASSIGNMENT COMMENTS
    -- =====================================================

    -- Message 19: Comment on assignment
    (
        'c0000001-0000-0000-0005-000000000001'::uuid,
        v_teacher_id,
        v_student3_id,
        NULL,
        NULL, NULL,
        'Comentario en tu tarea',
        'Vi tu entrega del ejercicio de Mapa Conceptual. Muy buen trabajo organizando las ideas. Solo te sugiero agregar más conectores entre los conceptos. Puedes editar y volver a enviar si quieres mejorar tu puntuación.',
        'assignment_comment',
        'normal',
        false, false, false, true,
        'approved',
        '{"assignment_id": "mapa_conceptual_1", "allows_resubmit": true}'::jsonb,
        gamilit.now_mexico() - INTERVAL '4 days'
    ),

    -- Message 20: Student question about assignment
    (
        'c0000001-0000-0000-0005-000000000002'::uuid,
        v_student3_id,
        v_teacher_id,
        NULL,
        NULL, 'c0000001-0000-0000-0005-000000000001'::uuid,
        'RE: Comentario en tu tarea',
        '¿Puedo agregar más de 3 conectores? Tengo varias ideas pero no sé si es demasiado.',
        'assignment_comment',
        'normal',
        true, false, false, false,
        'approved',
        '{"reply_to_feedback": true}'::jsonb,
        gamilit.now_mexico() - INTERVAL '4 days' + INTERVAL '2 hours'
    ),

    -- Message 21: Teacher response
    (
        'c0000001-0000-0000-0005-000000000003'::uuid,
        v_teacher_id,
        v_student3_id,
        NULL,
        NULL, 'c0000001-0000-0000-0005-000000000002'::uuid,
        NULL,
        '¡Por supuesto! Entre más conectores relevantes, mejor. Solo asegúrate de que cada uno tenga sentido lógico.',
        'assignment_comment',
        'normal',
        false, false, false, false,
        'approved',
        '{}'::jsonb,
        gamilit.now_mexico() - INTERVAL '4 days' + INTERVAL '3 hours'
    ),

    -- Message 22: Archived old message
    (
        'c0000001-0000-0000-0006-000000000001'::uuid,
        v_teacher_id,
        NULL,
        v_default_classroom_id,
        NULL, NULL,
        'Información del mes pasado',
        'Este es un mensaje archivado con información del mes anterior que ya no es relevante pero se conserva para referencia.',
        'classroom_announcement',
        'low',
        true, false, true, false,
        'approved',
        '{"archived_reason": "outdated"}'::jsonb,
        gamilit.now_mexico() - INTERVAL '45 days'
    )

    ON CONFLICT (id) DO UPDATE SET
        content = EXCLUDED.content,
        is_read = EXCLUDED.is_read,
        is_pinned = EXCLUDED.is_pinned,
        metadata = EXCLUDED.metadata;

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RAISE NOTICE '  ✓ Messages created/updated: %', v_count;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '⚠ Warning: Could not create all messages: %', SQLERRM;
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
    v_total INTEGER;
    v_direct INTEGER;
    v_announcement INTEGER;
    v_chat INTEGER;
    v_feedback INTEGER;
    v_system INTEGER;
    v_assignment INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total FROM communication.messages;
    SELECT COUNT(*) INTO v_direct FROM communication.messages WHERE message_type = 'direct';
    SELECT COUNT(*) INTO v_announcement FROM communication.messages WHERE message_type = 'classroom_announcement';
    SELECT COUNT(*) INTO v_chat FROM communication.messages WHERE message_type = 'classroom_chat';
    SELECT COUNT(*) INTO v_feedback FROM communication.messages WHERE message_type = 'private_feedback';
    SELECT COUNT(*) INTO v_system FROM communication.messages WHERE message_type = 'system';
    SELECT COUNT(*) INTO v_assignment FROM communication.messages WHERE message_type = 'assignment_comment';

    RAISE NOTICE '';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '  SEED COMPLETADO: communication.messages';
    RAISE NOTICE '════════════════════════════════════════════════════════';
    RAISE NOTICE '  Total mensajes: %', v_total;
    RAISE NOTICE '  - Direct: %', v_direct;
    RAISE NOTICE '  - Classroom Announcement: %', v_announcement;
    RAISE NOTICE '  - Classroom Chat: %', v_chat;
    RAISE NOTICE '  - Private Feedback: %', v_feedback;
    RAISE NOTICE '  - System: %', v_system;
    RAISE NOTICE '  - Assignment Comment: %', v_assignment;
    RAISE NOTICE '════════════════════════════════════════════════════════';
END $$;
