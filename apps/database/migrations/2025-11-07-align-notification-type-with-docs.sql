-- =====================================================================================
-- Migration: Align notification_type with official documentation
-- Created: 2025-11-07
-- Purpose: Sincronizar enum notification_type con especificación oficial
-- Source: docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-NOTIFICATIONS.md
-- Issue: Contradicción C1 - NotificationType
-- Priority: P0 - CRÍTICO
-- =====================================================================================
--
-- CAMBIOS APLICADOS:
-- - Convertir columna type de TEXT con CHECK constraint a ENUM notification_type
-- - Eliminar CHECK constraint legacy (6 valores incorrectos)
-- - Eliminado valor: 'reminder' (no está en especificación oficial)
-- - Renombrado valor: 'team_invite' → 'guild_invitation' (terminología oficial)
-- - Agregados 5 valores: 'level_up', 'message_received', 'ml_coins_earned',
--                        'streak_milestone', 'exercise_feedback'
--
-- ANTES (v1.0 - TEXT con CHECK de 6 valores):
-- CHECK: 'achievement', 'mission', 'reward', 'system', 'social', 'educational'
-- (Valores incorrectos, no alineados con documentación oficial)
--
-- DESPUÉS (v2.0 - 11 valores):
-- 'achievement_unlocked', 'rank_up', 'friend_request', 'guild_invitation',
-- 'mission_completed', 'level_up', 'message_received', 'system_announcement',
-- 'ml_coins_earned', 'streak_milestone', 'exercise_feedback'
--
-- =====================================================================================

BEGIN;

-- =====================================================================================
-- PASO 1: Validación Pre-Migración
-- =====================================================================================

DO $$
DECLARE
    team_invite_count INTEGER;
    reminder_count INTEGER;
BEGIN
    -- Verificar si existen notificaciones con 'team_invite'
    SELECT COUNT(*) INTO team_invite_count
    FROM gamification_system.notifications
    WHERE type = 'team_invite';

    -- Verificar si existen notificaciones con 'reminder'
    SELECT COUNT(*) INTO reminder_count
    FROM gamification_system.notifications
    WHERE type = 'reminder';

    RAISE NOTICE '===== PRE-MIGRATION VALIDATION =====';
    RAISE NOTICE 'Notificaciones con team_invite: %', team_invite_count;
    RAISE NOTICE 'Notificaciones con reminder: %', reminder_count;
    RAISE NOTICE '====================================';

    -- Si hay reminders, alertar para decisión manual
    IF reminder_count > 0 THEN
        RAISE WARNING 'ATENCIÓN: Existen % notificaciones con type=reminder.', reminder_count;
        RAISE WARNING 'Este valor no existe en la especificación oficial.';
        RAISE WARNING 'DECISIÓN REQUERIDA: ¿Eliminar o mapear a otro tipo?';
        RAISE WARNING 'Opciones sugeridas:';
        RAISE WARNING '  1. Mapear a system_announcement';
        RAISE WARNING '  2. Eliminar estas notificaciones';
        RAISE WARNING '  3. Crear tipo exercise_feedback si son recordatorios de ejercicios';
        RAISE WARNING '';
        RAISE WARNING 'Esta migration mapea reminder → system_announcement por defecto.';
        RAISE WARNING 'Modifique el script si desea otro comportamiento.';
    END IF;
END $$;

-- =====================================================================================
-- PASO 2: Migración de Datos Existentes
-- =====================================================================================

-- 2.1. Migrar 'team_invite' → 'guild_invitation'
UPDATE gamification_system.notifications
SET type = 'guild_invitation'::text
WHERE type = 'team_invite';

-- Verificar resultado
DO $$
DECLARE
    migrated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO migrated_count
    FROM gamification_system.notifications
    WHERE type = 'guild_invitation';

    RAISE NOTICE 'Notificaciones migradas de team_invite → guild_invitation: %', migrated_count;
END $$;

-- 2.2. Migrar 'reminder' → 'system_announcement' (opción por defecto)
-- NOTA: Si desea otro comportamiento, comente esta línea y ajuste según necesidad
UPDATE gamification_system.notifications
SET type = 'system_announcement'::text
WHERE type = 'reminder';

-- Verificar resultado
DO $$
DECLARE
    migrated_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO migrated_count
    FROM gamification_system.notifications
    WHERE type = 'system_announcement';

    RAISE NOTICE 'Total notificaciones system_announcement (incluye migradas): %', migrated_count;
END $$;

-- =====================================================================================
-- PASO 3: Preparar Tabla para Nuevo ENUM
-- =====================================================================================

-- 3.0. Eliminar CHECK constraint legacy (si existe)
-- NOTA: La tabla actualmente usa TEXT con CHECK constraint en lugar de ENUM
ALTER TABLE gamification_system.notifications
    DROP CONSTRAINT IF EXISTS notifications_type_check;

-- 3.1. Convertir columna a TEXT temporalmente (si ya era TEXT con check, esto es idempotente)
ALTER TABLE gamification_system.notifications
    ALTER COLUMN type TYPE text;

-- 3.2. Crear nuevo enum con todos los valores de documentación oficial
CREATE TYPE public.notification_type_v2 AS ENUM (
    'achievement_unlocked',
    'rank_up',
    'friend_request',
    'guild_invitation',
    'mission_completed',
    'level_up',
    'message_received',
    'system_announcement',
    'ml_coins_earned',
    'streak_milestone',
    'exercise_feedback'
);

-- 3.3. Eliminar enum antiguo
DROP TYPE IF EXISTS public.notification_type;

-- 3.4. Renombrar nuevo enum
ALTER TYPE public.notification_type_v2 RENAME TO notification_type;

-- 3.5. Aplicar nuevo enum a la columna
ALTER TABLE gamification_system.notifications
    ALTER COLUMN type TYPE public.notification_type
    USING type::public.notification_type;

-- =====================================================================================
-- PASO 4: Agregar Comment al ENUM
-- =====================================================================================

COMMENT ON TYPE public.notification_type IS
    'Tipos de notificaciones del sistema (v2.0 - 2025-11-07). '
    'Alineado con documentación oficial en TYPES-NOTIFICATIONS.md. '
    '11 tipos: achievement_unlocked, rank_up, friend_request, guild_invitation, '
    'mission_completed, level_up, message_received, system_announcement, '
    'ml_coins_earned, streak_milestone, exercise_feedback.';

-- =====================================================================================
-- PASO 5: Validación Post-Migración
-- =====================================================================================

DO $$
DECLARE
    type_distribution RECORD;
    total_notifications INTEGER;
    null_types INTEGER;
BEGIN
    -- Contar total de notificaciones
    SELECT COUNT(*) INTO total_notifications
    FROM gamification_system.notifications;

    -- Verificar que no haya valores NULL
    SELECT COUNT(*) INTO null_types
    FROM gamification_system.notifications
    WHERE type IS NULL;

    RAISE NOTICE '';
    RAISE NOTICE '===== POST-MIGRATION VALIDATION =====';
    RAISE NOTICE 'Total notificaciones en tabla: %', total_notifications;
    RAISE NOTICE 'Notificaciones con type NULL: %', null_types;
    RAISE NOTICE '';
    RAISE NOTICE 'Distribución de tipos después de migración:';

    -- Mostrar distribución de tipos
    FOR type_distribution IN
        SELECT type::text as notification_type, COUNT(*) as count
        FROM gamification_system.notifications
        GROUP BY type
        ORDER BY count DESC
    LOOP
        RAISE NOTICE '  - %: % notificaciones', type_distribution.notification_type, type_distribution.count;
    END LOOP;

    RAISE NOTICE '=====================================';
    RAISE NOTICE '';

    -- Verificar integridad
    IF null_types > 0 THEN
        RAISE EXCEPTION 'MIGRACIÓN FALLIDA: % notificaciones tienen type NULL', null_types;
    END IF;

    RAISE NOTICE '✅ MIGRACIÓN COMPLETADA EXITOSAMENTE';
END $$;

COMMIT;

-- =====================================================================================
-- ROLLBACK (Solo en caso de necesitar deshacer cambios)
-- =====================================================================================
--
-- ⚠️ NO EJECUTAR JUNTO CON LA MIGRACIÓN - Solo para emergencias
--
-- BEGIN;
--
-- -- Revertir a enum anterior
-- ALTER TABLE gamification_system.notifications
--     ALTER COLUMN type TYPE text;
--
-- DROP TYPE IF EXISTS public.notification_type;
--
-- CREATE TYPE public.notification_type AS ENUM (
--     'achievement_unlocked',
--     'rank_up',
--     'mission_completed',
--     'friend_request',
--     'team_invite',
--     'system_announcement',
--     'reminder'
-- );
--
-- -- Revertir datos
-- UPDATE gamification_system.notifications
-- SET type = 'team_invite'
-- WHERE type = 'guild_invitation';
--
-- ALTER TABLE gamification_system.notifications
--     ALTER COLUMN type TYPE public.notification_type
--     USING type::public.notification_type;
--
-- COMMIT;
--
-- =====================================================================================
-- NOTAS IMPORTANTES
-- =====================================================================================
--
-- 1. BACKUP: Asegurarse de tener backup completo antes de ejecutar
--
-- 2. TESTING: Ejecutar primero en ambiente de staging
--
-- 3. BACKEND: Después de esta migración, actualizar:
--    - apps/backend/src/shared/constants/enums.constants.ts (NotificationTypeEnum)
--    - apps/backend/src/modules/notifications/entities/notification.entity.ts
--    - Cualquier servicio que cree notificaciones con valores antiguos
--
-- 4. FRONTEND: Verificar que el frontend pueda manejar los nuevos tipos:
--    - level_up
--    - message_received
--    - ml_coins_earned
--    - streak_milestone
--    - exercise_feedback
--
-- 5. SINCRONIZACIÓN: Después de aplicar esta migración, sincronizar:
--    - Backend constants DEBE usar NotificationTypeEnum actualizado
--    - Entities DEBEN importar NotificationTypeEnum de constants
--    - Services que usan 'team_invite' deben cambiarse a 'guild_invitation'
--    - Services que usan 'reminder' deben cambiarse a tipo apropiado
--
-- 6. VALIDACIÓN: Después de deploy:
--    - Verificar que nuevas notificaciones se crean correctamente
--    - Testing de cada tipo de notificación
--    - Validar WebSocket emit con nuevos tipos
--
-- =====================================================================================
