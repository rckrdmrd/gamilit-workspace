-- =====================================================
-- Seed: Usuarios de Producción - Registros 2026-02-20
-- Description: 6 usuarios nuevos registrados post-deploy del 20 de febrero 2026
-- Environment: PRODUCTION / DEV
-- Dependencies: auth schema, auth_management.tenants, auth_management.profiles
-- Order: 03 (después de 02-production-users.sql)
-- Created: 2026-02-21
-- Version: 1.0
-- =====================================================
--
-- USUARIOS INCLUIDOS:
--   1. rckrdmrd@gmail.com          - Adrian Flores Cortes
--   2. arizabalo21@hotmail.com     - Ana Ofelia Arizabalo
--   3. dl7231217@gmail.com         - Daniela Jaqueline Castilleros Lopez
--   4. maritzamoralesdeloya@gmail.com - Maritza Morales Deloya
--   5. gamam130727@gmail.com       - Mauricio Ramirez Gama
--   6. abigailisidro08@gmail.com   - Diana Abigail Sotelo Isidro
--
-- TOTAL: 6 usuarios (todos rol student)
-- NOTA: Passwords hasheados con bcrypt, preservados del registro original
-- =====================================================

-- =====================================================
-- PASO 1: Insertar usuarios en auth.users
-- =====================================================

INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    aud,
    email_confirmed_at,
    raw_user_meta_data,
    raw_app_meta_data,
    created_at,
    updated_at
) VALUES
  -- 1. Adrian Flores Cortes
  (
    '18b1659f-d150-4f26-bc5c-168ac1e2d438',
    'rckrdmrd@gmail.com',
    '$2b$10$fZYXA14ZQeOaRoWCdTZ.XO0R425whxkD1HyvKUY.8XkZcrHUhF.jC',
    'authenticated',
    NOW(),
    '{}'::jsonb,
    '{}'::jsonb,
    '2026-02-20 06:56:31.017735+00',
    '2026-02-20 22:07:13.102685+00'
  ),
  -- 2. Ana Ofelia Arizabalo
  (
    'fa14c733-d9fa-46e5-86fc-9d852e7f4383',
    'arizabalo21@hotmail.com',
    '$2b$10$GiufEXKYsBwL25eST7Mw1er.5JfMJlhCalSzpLENjPeAwpUlbllVy',
    'authenticated',
    NOW(),
    '{}'::jsonb,
    '{}'::jsonb,
    '2026-02-20 09:29:01.082603+00',
    '2026-02-20 21:47:35.831902+00'
  ),
  -- 3. Daniela Jaqueline Castilleros Lopez
  (
    '9f709cba-5f49-4c80-b58d-a424af57ffc6',
    'dl7231217@gmail.com',
    '$2b$10$TI8TV64ip645KblrKX9DDOLm0sYCFYVFQKb63tYuYfEvcqhOjqcYW',
    'authenticated',
    NOW(),
    '{}'::jsonb,
    '{}'::jsonb,
    '2026-02-20 14:17:49.695004+00',
    '2026-02-20 20:17:49.728848+00'
  ),
  -- 4. Maritza Morales Deloya
  (
    'e2bb31c0-0949-430e-8dd7-02e8b3ca91c2',
    'maritzamoralesdeloya@gmail.com',
    '$2b$10$jyMrprH72CzyvcQ3FBvFre852Iqa6LqlwYaEEdKnB3OSv2OGuWXNW',
    'authenticated',
    NOW(),
    '{}'::jsonb,
    '{}'::jsonb,
    '2026-02-20 14:20:38.625213+00',
    '2026-02-20 20:20:38.656019+00'
  ),
  -- 5. Mauricio Ramirez Gama
  (
    'aadf1eca-7e5c-4767-a3c7-80b47fdee782',
    'gamam130727@gmail.com',
    '$2b$10$G5XzkCXB8xle8cZLxJC8UeDl93P23FJvbh1SVwYKJ986/KYrjLxxG',
    'authenticated',
    NOW(),
    '{}'::jsonb,
    '{}'::jsonb,
    '2026-02-20 14:25:42.033427+00',
    '2026-02-20 20:25:42.065437+00'
  ),
  -- 6. Diana Abigail Sotelo Isidro
  (
    '71252b1c-c643-4228-aadc-d8ecaafd9356',
    'abigailisidro08@gmail.com',
    '$2b$10$2LV05LJjSpa4Le8loCW2YeMbUR3/IvRUT7EluobihLH7Y5fmDjXay',
    'authenticated',
    NOW(),
    '{}'::jsonb,
    '{}'::jsonb,
    '2026-02-20 14:28:11.796406+00',
    '2026-02-20 20:28:11.827917+00'
  )
ON CONFLICT (id) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password,
    updated_at = EXCLUDED.updated_at;

-- =====================================================
-- PASO 2: Insertar perfiles en auth_management.profiles
-- =====================================================
-- NOTA: El trigger de profiles auto-asigna tenant y school

INSERT INTO auth_management.profiles (
    id,
    tenant_id,
    user_id,
    email,
    first_name,
    last_name,
    display_name,
    full_name,
    role,
    status,
    avatar_url,
    bio,
    grade_level,
    school_id,
    preferences
) VALUES
  -- 1. Adrian Flores Cortes
  (
    '18b1659f-d150-4f26-bc5c-168ac1e2d438',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '18b1659f-d150-4f26-bc5c-168ac1e2d438',
    'rckrdmrd@gmail.com',
    'Adrian',
    'Flores Cortes',
    'rckrDmrD',
    'Adrian Flores Cortes',
    'student',
    'active',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Calista',
    '',
    '',
    '99999999-9999-9999-9999-999999999999',
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb
  ),
  -- 2. Ana Ofelia Arizabalo
  (
    'fa14c733-d9fa-46e5-86fc-9d852e7f4383',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'fa14c733-d9fa-46e5-86fc-9d852e7f4383',
    'arizabalo21@hotmail.com',
    'Ana Ofelia',
    'Arizabalo',
    'Flicka',
    'Ana Ofelia Arizabalo',
    'student',
    'active',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Elias',
    '',
    '',
    '99999999-9999-9999-9999-999999999999',
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb
  ),
  -- 3. Daniela Jaqueline Castilleros Lopez
  (
    '9f709cba-5f49-4c80-b58d-a424af57ffc6',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '9f709cba-5f49-4c80-b58d-a424af57ffc6',
    'dl7231217@gmail.com',
    'daniela',
    'jaqueline Castilleros Lopez',
    NULL,
    'daniela jaqueline Castilleros Lopez',
    'student',
    'active',
    NULL,
    NULL,
    NULL,
    '99999999-9999-9999-9999-999999999999',
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb
  ),
  -- 4. Maritza Morales Deloya
  (
    'e2bb31c0-0949-430e-8dd7-02e8b3ca91c2',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'e2bb31c0-0949-430e-8dd7-02e8b3ca91c2',
    'maritzamoralesdeloya@gmail.com',
    'maritza',
    'morales deloya',
    NULL,
    'maritza morales deloya',
    'student',
    'active',
    NULL,
    NULL,
    NULL,
    '99999999-9999-9999-9999-999999999999',
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb
  ),
  -- 5. Mauricio Ramirez Gama
  (
    'aadf1eca-7e5c-4767-a3c7-80b47fdee782',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'aadf1eca-7e5c-4767-a3c7-80b47fdee782',
    'gamam130727@gmail.com',
    'mauricio',
    'ramirez gama',
    NULL,
    'mauricio ramirez gama',
    'student',
    'active',
    NULL,
    NULL,
    NULL,
    '99999999-9999-9999-9999-999999999999',
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb
  ),
  -- 6. Diana Abigail Sotelo Isidro
  (
    '71252b1c-c643-4228-aadc-d8ecaafd9356',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '71252b1c-c643-4228-aadc-d8ecaafd9356',
    'abigailisidro08@gmail.com',
    'diana',
    'abigail sotelo isidro',
    NULL,
    'diana abigail sotelo isidro',
    'student',
    'active',
    NULL,
    NULL,
    NULL,
    '99999999-9999-9999-9999-999999999999',
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb
  )
ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    display_name = EXCLUDED.display_name,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();

-- =====================================================
-- PASO 3: Verificación
-- =====================================================

DO $$
DECLARE
    user_count INTEGER;
    profile_count INTEGER;
    new_emails TEXT[] := ARRAY[
        'rckrdmrd@gmail.com',
        'arizabalo21@hotmail.com',
        'dl7231217@gmail.com',
        'maritzamoralesdeloya@gmail.com',
        'gamam130727@gmail.com',
        'abigailisidro08@gmail.com'
    ];
BEGIN
    SELECT count(*) INTO user_count
    FROM auth.users WHERE email = ANY(new_emails);

    SELECT count(*) INTO profile_count
    FROM auth_management.profiles WHERE email = ANY(new_emails);

    RAISE NOTICE '========================================';
    RAISE NOTICE 'USUARIOS PRODUCCIÓN 2026-02-20';
    RAISE NOTICE '========================================';
    RAISE NOTICE '  Users creados:    %/6', user_count;
    RAISE NOTICE '  Profiles creados: %/6', profile_count;
    RAISE NOTICE '========================================';

    IF user_count = 6 AND profile_count = 6 THEN
        RAISE NOTICE '✓ Los 6 usuarios fueron creados correctamente';
    ELSE
        RAISE WARNING '⚠ Verificar: se esperaban 6 users y 6 profiles';
    END IF;
END $$;

-- =====================================================
-- NOTA: user_stats y user_ranks se crean automáticamente
-- mediante triggers al insertar profiles.
-- No es necesario insertarlos manualmente.
-- =====================================================
