-- =====================================================
-- Seed: auth_management.profiles - Production Users (ACTUALIZADO)
-- Description: Perfiles CORREGIDOS para usuarios reales registrados en produccion
-- Environment: PRODUCTION
-- Dependencies: auth/02-production-users.sql, auth_management/01-tenants.sql
-- Order: 06
-- Created: 2025-11-19
-- Version: 3.0 (Actualizado con backup produccion 2025-12-18)
-- =====================================================
--
-- CORRECCIONES APLICADAS:
-- ✅ profiles.id = auth.users.id (consistente para TODOS)
-- ✅ tenant_id apunta al tenant principal (GAMILIT Platform)
--
-- TOTAL: 45 perfiles de estudiantes de produccion
-- EXCLUIDO: rckrdmrd@gmail.com (usuario de pruebas del owner)
--
-- ESTRUCTURA DE LOTES:
-- - LOTE 1 (2025-11-18): 13 usuarios
-- - LOTE 2 (2025-11-24): 23 usuarios
-- - LOTE 3 (2025-11-25): 6 usuarios
-- - LOTE 4 (2025-12-08/17): 3 usuarios
--
-- NOTA: profiles.id = user_id para TODOS los usuarios
--       Esto asegura que el trigger initialize_user_stats funcione correctamente
-- =====================================================

SET search_path TO auth_management, public;

-- =====================================================
-- INSERT: Production User Profiles (44 perfiles)
-- =====================================================

INSERT INTO auth_management.profiles (
    id,                   -- ✅ auth.users.id
    tenant_id,            -- ✅ Tenant principal
    user_id,              -- ✅ auth.users.id
    email,
    display_name,
    full_name,
    first_name,
    last_name,
    avatar_url,
    bio,
    phone,
    date_of_birth,
    grade_level,
    student_id,
    school_id,
    role,
    status,
    email_verified,
    phone_verified,
    preferences,
    metadata,
    created_at,
    updated_at
) VALUES

-- =====================================================
-- LOTE 1: Registros 2025-11-18 (13 usuarios)
-- =====================================================

-- PROFILE 1: Jose Aguirre
(
    'b017b792-b327-40dd-aefb-a80312776952'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'b017b792-b327-40dd-aefb-a80312776952'::uuid,
    'joseal.guirre34@gmail.com',
    'Jose Aguirre', 'Jose Aguirre', 'Jose', 'Aguirre',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-18 07:29:05.229254+00'::timestamptz,
    '2025-11-18 07:29:05.229254+00'::timestamptz
),

-- PROFILE 2: Sergio Jimenez
(
    '06a24962-e83d-4e94-aad7-ff69f20a9119'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '06a24962-e83d-4e94-aad7-ff69f20a9119'::uuid,
    'sergiojimenezesteban63@gmail.com',
    'Sergio Jimenez', 'Sergio Jimenez', 'Sergio', 'Jimenez',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-18 08:17:40.928077+00'::timestamptz,
    '2025-11-18 08:17:40.928077+00'::timestamptz
),

-- PROFILE 3: Hugo Gomez
(
    '24e8c563-8854-43d1-b3c9-2f83e91f5a1e'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '24e8c563-8854-43d1-b3c9-2f83e91f5a1e'::uuid,
    'Gomezfornite92@gmail.com',
    'Hugo Gomez', 'Hugo Gomez', 'Hugo', 'Gomez',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-18 08:18:04.242047+00'::timestamptz,
    '2025-11-18 08:18:04.242047+00'::timestamptz
),

-- PROFILE 4: Hugo Aragon
(
    'bf0d3e34-e077-43d1-9626-292f7fae2bd6'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'bf0d3e34-e077-43d1-9626-292f7fae2bd6'::uuid,
    'Aragon494gt54@icloud.com',
    'Hugo Aragon', 'Hugo Aragon', 'Hugo', 'Aragon',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-18 08:20:17.230714+00'::timestamptz,
    '2025-11-18 08:20:17.230714+00'::timestamptz
),

-- PROFILE 5: Azul Valentina
(
    '2f5a9846-3393-40b2-9e87-0f29238c383f'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '2f5a9846-3393-40b2-9e87-0f29238c383f'::uuid,
    'blu3wt7@gmail.com',
    'Azul Valentina', 'Azul Valentina', 'Azul', 'Valentina',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-18 08:32:17.315932+00'::timestamptz,
    '2025-11-18 08:32:17.315932+00'::timestamptz
),

-- PROFILE 6: Ricardo Lugo
(
    '5e738038-1743-4aa9-b222-30171300ea9d'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '5e738038-1743-4aa9-b222-30171300ea9d'::uuid,
    'ricardolugo786@icloud.com',
    'Ricardo Lugo', 'Ricardo Lugo', 'Ricardo', 'Lugo',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-18 10:15:06.481498+00'::timestamptz,
    '2025-11-18 10:15:06.481498+00'::timestamptz
),

-- PROFILE 7: Carlos Marban
(
    '00c742d9-e5f7-4666-9597-5a8ca54d5478'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '00c742d9-e5f7-4666-9597-5a8ca54d5478'::uuid,
    'marbancarlos916@gmail.com',
    'Carlos Marban', 'Carlos Marban', 'Carlos', 'Marban',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-18 10:29:05.240413+00'::timestamptz,
    '2025-11-18 10:29:05.240413+00'::timestamptz
),

-- PROFILE 8: Diego Colores
(
    '33306a65-a3b1-41d5-a49d-47989957b822'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '33306a65-a3b1-41d5-a49d-47989957b822'::uuid,
    'diego.colores09@gmail.com',
    'Diego Colores', 'Diego Colores', 'Diego', 'Colores',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-18 10:29:20.531883+00'::timestamptz,
    '2025-11-18 10:29:20.531883+00'::timestamptz
),

-- PROFILE 9: Benjamin Hernandez
(
    '7a6a973e-83f7-4374-a9fc-54258138115f'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '7a6a973e-83f7-4374-a9fc-54258138115f'::uuid,
    'hernandezfonsecabenjamin7@gmail.com',
    'Benjamin Hernandez', 'Benjamin Hernandez', 'Benjamin', 'Hernandez',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-18 10:37:06.9215+00'::timestamptz,
    '2025-11-18 10:37:06.9215+00'::timestamptz
),

-- PROFILE 10: Josue Reyes
(
    'ccd7135c-0fea-4488-9094-9da52df1c98c'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'ccd7135c-0fea-4488-9094-9da52df1c98c'::uuid,
    'jr7794315@gmail.com',
    'Josue Reyes', 'Josue Reyes', 'Josue', 'Reyes',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-18 17:53:39.681271+00'::timestamptz,
    '2025-11-18 17:53:39.681271+00'::timestamptz
),

-- PROFILE 11: Fernando Barragan
(
    '9951ad75-e9cb-47b3-b478-6bb860ee2530'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '9951ad75-e9cb-47b3-b478-6bb860ee2530'::uuid,
    'barraganfer03@gmail.com',
    'Fernando Barragan', 'Fernando Barragan', 'Fernando', 'Barragan',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-18 20:39:27.410436+00'::timestamptz,
    '2025-11-18 20:39:27.410436+00'::timestamptz
),

-- PROFILE 12: Marco Antonio Roman
(
    '735235f5-260a-4c9b-913c-14a1efd083ea'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '735235f5-260a-4c9b-913c-14a1efd083ea'::uuid,
    'roman.rebollar.marcoantonio1008@gmail.com',
    'Marco Antonio Roman', 'Marco Antonio Roman', 'Marco Antonio', 'Roman',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-18 21:03:17.328254+00'::timestamptz,
    '2025-11-18 21:03:17.328254+00'::timestamptz
),

-- PROFILE 13: Rodrigo Guerrero
(
    'ebe48628-5e44-4562-97b7-b4950b216247'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'ebe48628-5e44-4562-97b7-b4950b216247'::uuid,
    'rodrigoguerrero0914@gmail.com',
    'Rodrigo Guerrero', 'Rodrigo Guerrero', 'Rodrigo', 'Guerrero',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-18 21:20:52.304488+00'::timestamptz,
    '2025-11-18 21:20:52.304488+00'::timestamptz
),

-- =====================================================
-- LOTE 2: Registros 2025-11-24 (23 usuarios)
-- =====================================================

-- PROFILE 14
(
    '5fc06693-e408-4eab-a9a3-fcd5f4e01296'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '5fc06693-e408-4eab-a9a3-fcd5f4e01296'::uuid,
    '7341023901m@gmail.com',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 00:00:00+00'::timestamptz,
    '2025-11-24 00:00:00+00'::timestamptz
),

-- PROFILE 15
(
    '615adf6e-dbf3-480f-a907-3cfb3a64c6d2'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '615adf6e-dbf3-480f-a907-3cfb3a64c6d2'::uuid,
    'vituschinchilla@gmail.com',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 00:00:00+00'::timestamptz,
    '2025-11-24 00:00:00+00'::timestamptz
),

-- PROFILE 16
(
    '7ded133e-9b13-4467-9803-edb813f6a9a1'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '7ded133e-9b13-4467-9803-edb813f6a9a1'::uuid,
    'alexeimongam@gmail.com',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 00:00:00+00'::timestamptz,
    '2025-11-24 00:00:00+00'::timestamptz
),

-- PROFILE 17
(
    '1b310708-6f24-4c6a-88c9-a11f7a7f9763'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '1b310708-6f24-4c6a-88c9-a11f7a7f9763'::uuid,
    'angelrabano11@gmail.com',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 00:00:00+00'::timestamptz,
    '2025-11-24 00:00:00+00'::timestamptz
),

-- PROFILE 18
(
    'd5fa4905-a78a-4040-8ad8-23220881c6a6'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'd5fa4905-a78a-4040-8ad8-23220881c6a6'::uuid,
    'loganalexander816@gmail.com',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 00:00:00+00'::timestamptz,
    '2025-11-24 00:00:00+00'::timestamptz
),

-- PROFILE 19
(
    '126b9257-7b0a-4bd6-9ab3-c505ee00e10a'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '126b9257-7b0a-4bd6-9ab3-c505ee00e10a'::uuid,
    'johhkk22@gmail.com',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 00:00:00+00'::timestamptz,
    '2025-11-24 00:00:00+00'::timestamptz
),

-- PROFILE 20
(
    '9ac1746e-94a6-4efc-a961-951c015d416e'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '9ac1746e-94a6-4efc-a961-951c015d416e'::uuid,
    'edangiel4532@gmail.com',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 00:00:00+00'::timestamptz,
    '2025-11-24 00:00:00+00'::timestamptz
),

-- PROFILE 21
(
    'af4d8788-f8a8-4971-bb0d-2f48c150dfc2'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'af4d8788-f8a8-4971-bb0d-2f48c150dfc2'::uuid,
    'aarizmendi434@gmail.com',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 00:00:00+00'::timestamptz,
    '2025-11-24 00:00:00+00'::timestamptz
),

-- PROFILE 22
(
    'd089b1af-462f-4d2c-b0f5-d2528cec8506'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'd089b1af-462f-4d2c-b0f5-d2528cec8506'::uuid,
    'santiagoferrara78@gmail.com',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 00:00:00+00'::timestamptz,
    '2025-11-24 00:00:00+00'::timestamptz
),

-- PROFILE 23
(
    '012adac4-8ffd-47bd-9248-f0c5851e981f'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '012adac4-8ffd-47bd-9248-f0c5851e981f'::uuid,
    '09enriquecampos@gmail.com',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 00:00:00+00'::timestamptz,
    '2025-11-24 00:00:00+00'::timestamptz
),

-- PROFILE 24
(
    '1364c463-88de-479b-a883-c0b7b362bcf8'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '1364c463-88de-479b-a883-c0b7b362bcf8'::uuid,
    'maximiliano.mejia367@gmail.com',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 00:00:00+00'::timestamptz,
    '2025-11-24 00:00:00+00'::timestamptz
),

-- PROFILE 25
(
    '5d1839f6-b03f-4e12-b236-eca43f4674f2'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '5d1839f6-b03f-4e12-b236-eca43f4674f2'::uuid,
    'segurauriel235@gmail.com',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 00:00:00+00'::timestamptz,
    '2025-11-24 00:00:00+00'::timestamptz
),

-- PROFILE 26
(
    '5ae21325-7450-4c37-82f1-3f9bcd7b6f45'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '5ae21325-7450-4c37-82f1-3f9bcd7b6f45'::uuid,
    'omarcitogonzalezzavaleta@gmail.com',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 00:00:00+00'::timestamptz,
    '2025-11-24 00:00:00+00'::timestamptz
),

-- PROFILE 27
(
    '2d9f05d4-44dd-42cd-97aa-d57bd06fecd0'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '2d9f05d4-44dd-42cd-97aa-d57bd06fecd0'::uuid,
    'erickfranco462@gmail.com',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 00:00:00+00'::timestamptz,
    '2025-11-24 00:00:00+00'::timestamptz
),

-- PROFILE 28
(
    'bf445960-4c1f-4e29-8fb7-31667b183d7e'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'bf445960-4c1f-4e29-8fb7-31667b183d7e'::uuid,
    'bryan@betanzos.com',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 00:00:00+00'::timestamptz,
    '2025-11-24 00:00:00+00'::timestamptz
),

-- PROFILE 29
(
    'b1cadf36-1f07-46b2-b63d-da72d9b54dc6'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'b1cadf36-1f07-46b2-b63d-da72d9b54dc6'::uuid,
    'alexanserrv917@gmail.com',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 00:00:00+00'::timestamptz,
    '2025-11-24 00:00:00+00'::timestamptz
),

-- PROFILE 30
(
    '71734c15-cdaa-431b-90f5-97a57e0316a8'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '71734c15-cdaa-431b-90f5-97a57e0316a8'::uuid,
    'carlois1974@gmail.com',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 00:00:00+00'::timestamptz,
    '2025-11-24 00:00:00+00'::timestamptz
),

-- PROFILE 31
(
    'a4d27774-8a51-4660-ad2f-81d0dfd3a5a7'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'a4d27774-8a51-4660-ad2f-81d0dfd3a5a7'::uuid,
    'gustavobm2024cbtis@gmail.com',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 00:00:00+00'::timestamptz,
    '2025-11-24 00:00:00+00'::timestamptz
),

-- PROFILE 32
(
    'aff5dcc6-32de-4769-9aaf-eda751fa0866'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'aff5dcc6-32de-4769-9aaf-eda751fa0866'::uuid,
    'gallinainsana@gmail.com',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 00:00:00+00'::timestamptz,
    '2025-11-24 00:00:00+00'::timestamptz
),

-- PROFILE 33
(
    'fbbe7d19-048c-45e4-8a9c-cf86d2098c35'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'fbbe7d19-048c-45e4-8a9c-cf86d2098c35'::uuid,
    'zaid080809@gmail.com',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 00:00:00+00'::timestamptz,
    '2025-11-24 00:00:00+00'::timestamptz
),

-- PROFILE 34
(
    '4cc04f54-7771-462d-98aa-a94448bb6ff5'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '4cc04f54-7771-462d-98aa-a94448bb6ff5'::uuid,
    'davidocampovenegas@gmail.com',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 00:00:00+00'::timestamptz,
    '2025-11-24 00:00:00+00'::timestamptz
),

-- PROFILE 35
(
    '6e30164a-78b0-49b0-bd21-23d7c6c03349'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '6e30164a-78b0-49b0-bd21-23d7c6c03349'::uuid,
    'marianaxsotoxt22@gmail.com',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 00:00:00+00'::timestamptz,
    '2025-11-24 00:00:00+00'::timestamptz
),

-- PROFILE 36
(
    '0cda1645-83c5-445b-80b7-d0e4d436c00c'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '0cda1645-83c5-445b-80b7-d0e4d436c00c'::uuid,
    'leile5257@gmail.com',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 00:00:00+00'::timestamptz,
    '2025-11-24 00:00:00+00'::timestamptz
),

-- =====================================================
-- LOTE 3: Registros 2025-11-25 (6 usuarios)
-- =====================================================

-- PROFILE 37
(
    '26fbc469-10af-4fa3-bd65-e5498188cc4f'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '26fbc469-10af-4fa3-bd65-e5498188cc4f'::uuid,
    'ashernarcisobenitezpalomino@gmail.com',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-25 00:00:00+00'::timestamptz,
    '2025-11-25 00:00:00+00'::timestamptz
),

-- PROFILE 38
(
    '5b3d74e8-fd1a-4c80-96d2-24c54bfe90c4'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '5b3d74e8-fd1a-4c80-96d2-24c54bfe90c4'::uuid,
    'ruizcruzabrahamfrancisco@gmail.com',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-25 00:00:00+00'::timestamptz,
    '2025-11-25 00:00:00+00'::timestamptz
),

-- PROFILE 39
(
    '3c613b0e-66f9-4640-a599-c9426d8edffb'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '3c613b0e-66f9-4640-a599-c9426d8edffb'::uuid,
    'daliaayalareyes35@gmail.com',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-25 00:00:00+00'::timestamptz,
    '2025-11-25 00:00:00+00'::timestamptz
),

-- PROFILE 40
(
    '74ed8c97-ec36-43aa-a1cc-b0c99e4be4e8'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '74ed8c97-ec36-43aa-a1cc-b0c99e4be4e8'::uuid,
    'ra.alejandrobm@gmail.com',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-25 00:00:00+00'::timestamptz,
    '2025-11-25 00:00:00+00'::timestamptz
),

-- PROFILE 41
(
    '1efe491d-98ef-4c02-acd1-3135f7289072'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '1efe491d-98ef-4c02-acd1-3135f7289072'::uuid,
    'enriquecuevascbtis136@gmail.com',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-25 00:00:00+00'::timestamptz,
    '2025-11-25 00:00:00+00'::timestamptz
),

-- PROFILE 42
(
    '547eb778-4782-4681-b198-c731bba36147'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '547eb778-4782-4681-b198-c731bba36147'::uuid,
    'fl432025@gmail.com',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-25 00:00:00+00'::timestamptz,
    '2025-11-25 00:00:00+00'::timestamptz
),

-- =====================================================
-- LOTE 4: Registros 2025-12-08/17 (2 usuarios)
-- =====================================================

-- PROFILE 43
(
    'f4c46f46-3fb9-40bf-a52b-a8ad2e6a92e1'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'f4c46f46-3fb9-40bf-a52b-a8ad2e6a92e1'::uuid,
    'abdallahxelhaneriavega@gmail.com',
    NULL, NULL, NULL, NULL,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-25 00:00:00+00'::timestamptz,
    '2025-11-25 00:00:00+00'::timestamptz
),

-- PROFILE 44: Javier Mar
(
    '69681b09-5077-4f77-84cc-67606abd9755'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '69681b09-5077-4f77-84cc-67606abd9755'::uuid,
    'javiermar06@hotmail.com',
    'Javier Mar', 'Javier Mar', 'Javier', 'Mar',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-12-08 19:24:06.272257+00'::timestamptz,
    '2025-12-08 19:24:06.272257+00'::timestamptz
),

-- PROFILE 45: Juan Pa
(
    'f929d6df-8c29-461f-88f5-264facd879e9'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'f929d6df-8c29-461f-88f5-264facd879e9'::uuid,
    'ju188an@gmail.com',
    'Juan Pa', 'Juan Pa', 'Juan', 'Pa',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-12-17 17:51:43.536295+00'::timestamptz,
    '2025-12-17 17:51:43.536295+00'::timestamptz
)

ON CONFLICT (id) DO UPDATE SET
    tenant_id = EXCLUDED.tenant_id,
    display_name = EXCLUDED.display_name,
    full_name = EXCLUDED.full_name,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    updated_at = EXCLUDED.updated_at;

-- =====================================================
-- Verification Query
-- =====================================================

DO $$
DECLARE
    production_profile_count INTEGER;
    corrected_ids_count INTEGER;
    corrected_tenants_count INTEGER;
BEGIN
    -- Contar perfiles de produccion
    SELECT COUNT(*) INTO production_profile_count
    FROM auth_management.profiles
    WHERE email NOT LIKE '%@gamilit.com';

    -- Contar perfiles con IDs corregidos (id = user_id)
    SELECT COUNT(*) INTO corrected_ids_count
    FROM auth_management.profiles
    WHERE email NOT LIKE '%@gamilit.com'
      AND id = user_id;

    -- Contar perfiles con tenant principal
    SELECT COUNT(*) INTO corrected_tenants_count
    FROM auth_management.profiles
    WHERE email NOT LIKE '%@gamilit.com'
      AND tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'PERFILES DE PRODUCCION';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total perfiles de produccion: %', production_profile_count;
    RAISE NOTICE 'Perfiles con profiles.id = auth.users.id: %', corrected_ids_count;
    RAISE NOTICE 'Perfiles con tenant principal: %', corrected_tenants_count;
    RAISE NOTICE '========================================';

    IF production_profile_count >= 45 AND corrected_ids_count >= 45 AND corrected_tenants_count >= 45 THEN
        RAISE NOTICE '✓ Los 45 perfiles de produccion fueron creados correctamente';
        RAISE NOTICE '✓ profiles.id = auth.users.id para TODOS los usuarios';
        RAISE NOTICE '✓ tenant_id = GAMILIT Platform para TODOS los usuarios';
    ELSE
        RAISE WARNING '! Verificacion incompleta:';
        RAISE WARNING '  - Esperados: 45 perfiles';
        RAISE WARNING '  - IDs correctos: %', corrected_ids_count;
        RAISE WARNING '  - Tenants correctos: %', corrected_tenants_count;
    END IF;

    RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- CHANGELOG
-- =====================================================
-- v3.0 (2025-12-18): Actualizacion con backup produccion
--   - ✓ Actualizado de 13 a 45 perfiles de produccion
--   - ✓ Excluido rckrdmrd@gmail.com (usuario de pruebas owner)
--   - ✓ profiles.id = auth.users.id para TODOS
--   - ✓ tenant_id = Tenant principal para TODOS
--
-- v2.0 (2025-11-19): Correccion de IDs y tenants
--   - ✓ profiles.id = auth.users.id (era diferente)
--   - ✓ tenant_id = Tenant principal (era personal)
--
-- v1.0 (2025-11-19): Primera version (DEPRECADA)
-- =====================================================
