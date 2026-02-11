-- =====================================================
-- Seed: social_features.friendships (PROD) - v1.2
-- Description: Relaciones de amistad entre usuarios de producción
-- Environment: PRODUCTION
-- Dependencies: auth_management.profiles (usuarios de producción)
-- Order: 04
-- Created: 2025-11-15
-- Updated: 2025-12-14 (v1.2 - Ajustado al DDL actual, usa usuarios prod)
-- Version: 1.2
-- =====================================================
--
-- CAMBIOS v1.2:
-- - Eliminadas columnas status y updated_at (no existen en DDL)
-- - Cambiado a usar UUIDs de usuarios de producción reales
-- - El DDL actual solo tiene: id, user_id, friend_id, created_at
--
-- NOTA: En este modelo simplificado, una entrada en friendships
-- significa que la amistad está ACEPTADA. Las solicitudes pendientes
-- se manejarían en una tabla separada (friend_requests) si se necesita.
--
-- FRIENDSHIPS INCLUIDOS:
-- - Relaciones bidireccionales entre usuarios de producción
--
-- IMPORTANTE: Este seed habilita testing de:
-- - /friends page (FriendsPage.tsx)
-- - FriendsLeaderboard component
-- =====================================================

SET search_path TO social_features, auth_management, public;

-- =====================================================
-- INSERT: Friendships entre usuarios de producción
-- =====================================================
-- Usamos los UUIDs reales de los usuarios de producción

DO $$
DECLARE
    user_ids uuid[];
    i INTEGER;
    j INTEGER;
    friendship_count INTEGER := 0;
BEGIN
    -- Obtener IDs de usuarios de producción (excluyendo testing @gamilit.com)
    SELECT ARRAY_AGG(id ORDER BY created_at)
    INTO user_ids
    FROM auth_management.profiles
    WHERE email NOT LIKE '%@gamilit.com'
    LIMIT 10;

    -- Si hay al menos 2 usuarios, crear friendships
    IF array_length(user_ids, 1) >= 2 THEN
        -- Crear friendships bidireccionales entre los primeros usuarios
        FOR i IN 1..LEAST(array_length(user_ids, 1) - 1, 5) LOOP
            FOR j IN (i + 1)..LEAST(array_length(user_ids, 1), i + 2) LOOP
                -- Insertar relación bidireccional
                INSERT INTO social_features.friendships (user_id, friend_id, created_at)
                VALUES (user_ids[i], user_ids[j], gamilit.now_mexico() - (random() * INTERVAL '30 days'))
                ON CONFLICT (user_id, friend_id) DO NOTHING;

                INSERT INTO social_features.friendships (user_id, friend_id, created_at)
                VALUES (user_ids[j], user_ids[i], gamilit.now_mexico() - (random() * INTERVAL '30 days'))
                ON CONFLICT (user_id, friend_id) DO NOTHING;

                friendship_count := friendship_count + 2;
            END LOOP;
        END LOOP;

        RAISE NOTICE '';
        RAISE NOTICE '========================================';
        RAISE NOTICE 'FRIENDSHIPS CREADOS';
        RAISE NOTICE '========================================';
        RAISE NOTICE 'Relaciones creadas: %', friendship_count;
        RAISE NOTICE 'Usuarios disponibles: %', array_length(user_ids, 1);
        RAISE NOTICE '========================================';
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE '========================================';
        RAISE NOTICE 'FRIENDSHIPS: Sin usuarios suficientes';
        RAISE NOTICE '========================================';
        RAISE NOTICE 'Se necesitan al menos 2 usuarios de producción';
        RAISE NOTICE 'Usuarios encontrados: %', COALESCE(array_length(user_ids, 1), 0);
        RAISE NOTICE '========================================';
    END IF;
END $$;

-- =====================================================
-- Verification
-- =====================================================

DO $$
DECLARE
    total_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_count
    FROM social_features.friendships;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICACIÓN FRIENDSHIPS';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total friendships en tabla: %', total_count;
    RAISE NOTICE '========================================';

    IF total_count > 0 THEN
        RAISE NOTICE '✓ Friendships creados correctamente';
        RAISE NOTICE '';
        RAISE NOTICE 'Features habilitadas:';
        RAISE NOTICE '  - /friends page (FriendsPage.tsx)';
        RAISE NOTICE '  - FriendsLeaderboard component';
    ELSE
        RAISE NOTICE '⚠ No hay friendships (normal si no hay usuarios prod)';
    END IF;

    RAISE NOTICE '';
END $$;
