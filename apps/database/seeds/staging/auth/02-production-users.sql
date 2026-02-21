-- =====================================================
-- Seed: auth.users - Production Registered Users
-- Description: Usuarios reales registrados en producción
-- Environment: PRODUCTION
-- Dependencies: 01-demo-users.sql
-- Order: 02
-- Created: 2025-11-19
-- Updated: 2026-01-25
-- Version: 2.1 (Backup y verificación 2026-01-25)
-- =====================================================
--
-- USUARIOS REALES REGISTRADOS:
-- - Lote 1 (2025-11-18): 13 usuarios con nombres completos
-- - Lote 2 (2025-11-24/25): 29 usuarios (algunos sin nombres)
-- - Lote 3 (2025-12-08 y 2025-12-17): 2 usuarios
--
-- TOTAL: 45 usuarios estudiantes
--
-- POLÍTICA DE CARGA LIMPIA:
-- ✅ UUIDs originales del servidor preservados
-- ✅ Passwords hasheados originales preservados
-- ✅ instance_id corregido a UUID válido
-- ✅ Metadata mínima agregada para compatibilidad
-- ✅ Triggers crearán profiles, user_stats, user_ranks automáticamente
--
-- IMPORTANTE: Estos son usuarios reales de producción.
-- No modificar sus UUIDs ni passwords hasheados.
-- =====================================================

SET search_path TO auth, public;

-- =====================================================
-- INSERT: Production Registered Users (45 usuarios)
-- =====================================================

INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    confirmed_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at,
    gamilit_role,
    status
) VALUES

-- =====================================================
-- LOTE 1: USUARIOS 2025-11-18 (13 usuarios)
-- =====================================================

-- USUARIO 1: Jose Aguirre
(
    'b017b792-b327-40dd-aefb-a80312776952'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'joseal.guirre34@gmail.com',
    '$2b$10$kb9yCB4Y2WBr2.Gth.wC9e8q8bnkZJ6O2X6kFSn.O4VK8d76Cr/xO',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Jose", "last_name": "Aguirre"}'::jsonb,
    false, '2025-11-18 07:29:05.226874+00'::timestamptz, '2025-11-18 07:29:05.226874+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 2: Sergio Jimenez
(
    '06a24962-e83d-4e94-aad7-ff69f20a9119'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'sergiojimenezesteban63@gmail.com',
    '$2b$10$8oPdKN15ndCqCOIt12SEO.2yx4D29kQEQGPCC5rtUYWu8Qp5L7/zW',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Sergio", "last_name": "Jimenez"}'::jsonb,
    false, '2025-11-18 08:17:40.925857+00'::timestamptz, '2025-11-18 08:17:40.925857+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 3: Hugo Gomez
(
    '24e8c563-8854-43d1-b3c9-2f83e91f5a1e'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'Gomezfornite92@gmail.com',
    '$2b$10$FuEfoSA0jxvBI2f6odMJqux9Gpgvt7Zjk.plRhRatvK0ykkIXxbI.',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Hugo", "last_name": "Gomez"}'::jsonb,
    false, '2025-11-18 08:18:04.240276+00'::timestamptz, '2025-11-18 08:18:04.240276+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 4: Hugo Aragón
(
    'bf0d3e34-e077-43d1-9626-292f7fae2bd6'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'Aragon494gt54@icloud.com',
    '$2b$10$lE8M8qWUIsgYLwcHyRGvTOjxdykLVchRVifsMVqCRCZq3bEeXR.xG',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Hugo", "last_name": "Aragón"}'::jsonb,
    false, '2025-11-18 08:20:17.228812+00'::timestamptz, '2025-11-18 08:20:17.228812+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 5: Azul Valentina
(
    '2f5a9846-3393-40b2-9e87-0f29238c383f'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'blu3wt7@gmail.com',
    '$2b$10$gKRXQ.rmOePqsNKWdxABQuyIZike2oSsYpdfWpQdi5HHDWDUk.3u2',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Azul", "last_name": "Valentina"}'::jsonb,
    false, '2025-11-18 08:32:17.314233+00'::timestamptz, '2025-11-18 08:32:17.314233+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 6: Ricardo Lugo
(
    '5e738038-1743-4aa9-b222-30171300ea9d'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'ricardolugo786@icloud.com',
    '$2b$10$YV1StKIdCPPED/Ft84zR2ONxj/VzzV7zOxjgwMSbDpd2hzvYOGtby',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Ricardo", "last_name": "Lugo"}'::jsonb,
    false, '2025-11-18 10:15:06.479774+00'::timestamptz, '2025-11-18 10:15:06.479774+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 7: Carlos Marban
(
    '00c742d9-e5f7-4666-9597-5a8ca54d5478'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'marbancarlos916@gmail.com',
    '$2b$10$PfsKOsEEXpGA6YB6eXNBPePo6OV6Am1glUN6Mkunl64bK/ji6uttW',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Carlos", "last_name": "Marban"}'::jsonb,
    false, '2025-11-18 10:29:05.23842+00'::timestamptz, '2025-11-18 10:29:05.23842+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 8: Diego Colores
(
    '33306a65-a3b1-41d5-a49d-47989957b822'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'diego.colores09@gmail.com',
    '$2b$10$rFlH9alBbgPGVEZMYIV8p.AkeZ30yRCVd5acasFjIt7fpCZhE6RuO',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Diego", "last_name": "Colores"}'::jsonb,
    false, '2025-11-18 10:29:20.530359+00'::timestamptz, '2025-11-18 10:29:20.530359+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 9: Benjamin Hernandez
(
    '7a6a973e-83f7-4374-a9fc-54258138115f'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'hernandezfonsecabenjamin7@gmail.com',
    '$2b$10$1E6gLqfMojNLYrSKIbatqOh0pHblZ3jWZwbcxTY/DCx7MGADToCVm',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Benjamin", "last_name": "Hernandez"}'::jsonb,
    false, '2025-11-18 10:37:06.919813+00'::timestamptz, '2025-11-18 10:37:06.919813+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 10: Josue Reyes
(
    'ccd7135c-0fea-4488-9094-9da52df1c98c'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'jr7794315@gmail.com',
    '$2b$10$Ej/Gwx8mGCWg4TnQSjh1r.QZLw/GkUANqXmz4bEfVaNF9E527L02C',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Josue", "last_name": "Reyes"}'::jsonb,
    false, '2025-11-18 17:53:39.67958+00'::timestamptz, '2025-11-18 17:53:39.67958+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 11: Fernando Barragan
(
    '9951ad75-e9cb-47b3-b478-6bb860ee2530'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'barraganfer03@gmail.com',
    '$2b$10$VJ8bS.ksyKpa7oG575r5YOWQYcq8vwmwTa8jMBkCv0dwskF04SHn2',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Fernando", "last_name": "Barragan"}'::jsonb,
    false, '2025-11-18 20:39:27.408624+00'::timestamptz, '2025-11-18 20:39:27.408624+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 12: Marco Antonio Roman
(
    '735235f5-260a-4c9b-913c-14a1efd083ea'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'roman.rebollar.marcoantonio1008@gmail.com',
    '$2b$10$l4eF8UoOB7D8LKDEzTigXOUO7EABhVdYCqknJ/lD6R4p8uF1R4I.W',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Marco Antonio", "last_name": "Roman"}'::jsonb,
    false, '2025-11-18 21:03:17.326679+00'::timestamptz, '2025-11-18 21:03:17.326679+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 13: Rodrigo Guerrero
(
    'ebe48628-5e44-4562-97b7-b4950b216247'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'rodrigoguerrero0914@gmail.com',
    '$2b$10$ihoy7HbOdlqU38zAddpTOuDO7Nqa8.Cr1dEQjCgMpdb30UwCIMhGW',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Rodrigo", "last_name": "Guerrero"}'::jsonb,
    false, '2025-11-18 21:20:52.303128+00'::timestamptz, '2025-11-18 21:20:52.303128+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- =====================================================
-- LOTE 2: USUARIOS 2025-11-24 (23 usuarios)
-- =====================================================

-- USUARIO 14: santiagoferrara78
(
    'd089b1af-462f-4d2c-b0f5-d2528cec8506'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'santiagoferrara78@gmail.com',
    '$2b$10$Wjo3EENjiuddS9BwPMAW1OORZrZpU8ECP9zEXmd4Gvn7orwgjo8O2',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "", "last_name": ""}'::jsonb,
    false, '2025-11-24 09:21:04.898591+00'::timestamptz, '2025-11-24 09:21:04.898591+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 15: alexanserrv917
(
    'b1cadf36-1f07-46b2-b63d-da72d9b54dc6'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'alexanserrv917@gmail.com',
    '$2b$10$8sT/ObLZUNmiu6CpbceHhenfc7E8zZml8AvB1HUiyOddSLqchggZ2',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "", "last_name": ""}'::jsonb,
    false, '2025-11-24 10:26:51.934739+00'::timestamptz, '2025-11-24 10:26:51.934739+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 16: aarizmendi434
(
    'af4d8788-f8a8-4971-bb0d-2f48c150dfc2'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'aarizmendi434@gmail.com',
    '$2b$10$2BAG4EskBG0feGOIva6XyOCBtBJbKJE9h27GU6DmuBH3f.2iK6FoS',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "", "last_name": ""}'::jsonb,
    false, '2025-11-24 10:30:54.728262+00'::timestamptz, '2025-11-24 10:30:54.728262+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 17: ashernarcisobenitezpalomino
(
    '26fbc469-10af-4fa3-bd65-e5498188cc4f'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'ashernarcisobenitezpalomino@gmail.com',
    '$2b$10$Bv5vo0GDeseWUWTt.5xV0O9nN93TRVN.vHRigs4vF/ww7Hbnjylam',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "", "last_name": ""}'::jsonb,
    false, '2025-11-24 10:37:35.325342+00'::timestamptz, '2025-11-24 10:37:35.325342+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 18: ra.alejandrobm
(
    '74ed8c97-ec36-43aa-a1cc-b0c99e4be4e8'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'ra.alejandrobm@gmail.com',
    '$2b$10$QZId3lZBIzBulD7AZCeEKOiL0LBJRekGlQTGiacC70IDwDo2wx7py',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "", "last_name": ""}'::jsonb,
    false, '2025-11-24 10:42:33.424367+00'::timestamptz, '2025-11-24 10:42:33.424367+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 19: abdallahxelhaneriavega
(
    'f4c46f46-3fb9-40bf-a52b-a8ad2e6a92e1'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'abdallahxelhaneriavega@gmail.com',
    '$2b$10$jQ4SquNUxIO70e7IBYqqLeUw1d.gSCleJ/cwinuWMVlW25a8.pRGG',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "", "last_name": ""}'::jsonb,
    false, '2025-11-24 10:45:19.984994+00'::timestamptz, '2025-11-24 10:45:19.984994+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 20: 09enriquecampos
(
    '012adac4-8ffd-47bd-9248-f0c5851e981f'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    '09enriquecampos@gmail.com',
    '$2b$10$95c9hOplonbo/46O5UlPqummq.AIaGVIZ7YgBstSuOWPbgGersKxy',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "", "last_name": ""}'::jsonb,
    false, '2025-11-24 10:51:54.731982+00'::timestamptz, '2025-11-24 10:51:54.731982+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 21: johhkk22
(
    '126b9257-7b0a-4bd6-9ab3-c505ee00e10a'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'johhkk22@gmail.com',
    '$2b$10$Bt6IZ19zuBkly.6QmmPWBeF0kfyVN/O/c3/9bqyUGup3gPZu14DGa',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "", "last_name": ""}'::jsonb,
    false, '2025-11-24 10:53:47.029991+00'::timestamptz, '2025-11-24 10:53:47.029991+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 22: edangiel4532
(
    '9ac1746e-94a6-4efc-a961-951c015d416e'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'edangiel4532@gmail.com',
    '$2b$10$eZap9LmAws7VtY9sHnS17.RJkhIte5SUobIWaWpuTxTPKjbKgzK.6',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "", "last_name": ""}'::jsonb,
    false, '2025-11-24 10:58:12.790316+00'::timestamptz, '2025-11-24 10:58:12.790316+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 23: erickfranco462
(
    '2d9f05d4-44dd-42cd-97aa-d57bd06fecd0'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'erickfranco462@gmail.com',
    '$2b$10$lNzkSO7zbBHQcJJui0O76.a2artcsZHari4Mgkjo4btGww.Wy9/iC',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "", "last_name": ""}'::jsonb,
    false, '2025-11-24 11:00:11.800551+00'::timestamptz, '2025-11-24 11:00:11.800551+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 24: gallinainsana
(
    'aff5dcc6-32de-4769-9aaf-eda751fa0866'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'gallinainsana@gmail.com',
    '$2b$10$6y/FVa4LqyliI4PXuBxKpepTRwIIRWybFN0NhcAqRM.Kl/cnvXDMq',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "", "last_name": ""}'::jsonb,
    false, '2025-11-24 11:03:17.536383+00'::timestamptz, '2025-11-24 11:03:17.536383+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 25: leile5257
(
    '0cda1645-83c5-445b-80b7-d0e4d436c00c'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'leile5257@gmail.com',
    '$2b$10$ZZX0.z30VPm7BsLF8bNVweQpRZ2ca/1EPlxdIZy0xNaCFugoKL0ci',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "", "last_name": ""}'::jsonb,
    false, '2025-11-24 11:05:17.75852+00'::timestamptz, '2025-11-24 11:05:17.75852+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 26: maximiliano.mejia367
(
    '1364c463-88de-479b-a883-c0b7b362bcf8'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'maximiliano.mejia367@gmail.com',
    '$2b$10$iTfIWKh2ISvPys2bkK2LOOPI24ua7I47oT8dFxHHYW7AuztoZreQa',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "", "last_name": ""}'::jsonb,
    false, '2025-11-24 11:08:58.232003+00'::timestamptz, '2025-11-24 11:08:58.232003+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 27: fl432025
(
    '547eb778-4782-4681-b198-c731bba36147'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'fl432025@gmail.com',
    '$2b$10$aGKv6yhAWwHb07m3N2DxJOXIn5omkP3t2QeSYblhcDo52pB2ZiFQi',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "", "last_name": ""}'::jsonb,
    false, '2025-11-24 11:12:13.692614+00'::timestamptz, '2025-11-24 11:12:13.692614+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 28: 7341023901m
(
    '5fc06693-e408-4eab-a9a3-fcd5f4e01296'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    '7341023901m@gmail.com',
    '$2b$10$Z/HUBov20g..LZ6RDYax4.NcDuiFD/gn9Nrt7/OPCPBqCoTJUgr3C',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "", "last_name": ""}'::jsonb,
    false, '2025-11-24 11:15:18.276345+00'::timestamptz, '2025-11-24 11:15:18.276345+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 29: segurauriel235
(
    '5d1839f6-b03f-4e12-b236-eca43f4674f2'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'segurauriel235@gmail.com',
    '$2b$10$IfdhPuUOModgrJT7bMfYkODZkXeTcaAReuCQf9BGpK1cT6GiP9UGu',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "", "last_name": ""}'::jsonb,
    false, '2025-11-24 11:17:46.846963+00'::timestamptz, '2025-11-24 11:17:46.846963+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 30: angelrabano11
(
    '1b310708-6f24-4c6a-88c9-a11f7a7f9763'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'angelrabano11@gmail.com',
    '$2b$10$Sg6q4kErMvxRlZgWM9lCj.PfRg5sCQrwm763d7sfc3iaAUID7y436',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "", "last_name": ""}'::jsonb,
    false, '2025-11-24 11:47:53.790673+00'::timestamptz, '2025-11-24 11:47:53.790673+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 31: daliaayalareyes35
(
    '3c613b0e-66f9-4640-a599-c9426d8edffb'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'daliaayalareyes35@gmail.com',
    '$2b$10$dd2SQeBqNIZpZWCGMIDu1O8U6MLpWnKF05w641MNOMzHDZ/U5glCe',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "", "last_name": ""}'::jsonb,
    false, '2025-11-24 11:55:08.708961+00'::timestamptz, '2025-11-24 11:55:08.708961+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 32: alexeimongam
(
    '7ded133e-9b13-4467-9803-edb813f6a9a1'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'alexeimongam@gmail.com',
    '$2b$10$jyQrHAIj6SsnReQ45FrFlOnDgpZtabskpxPuOYgB/h.YPLyZhuld.',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "", "last_name": ""}'::jsonb,
    false, '2025-11-24 11:55:11.906996+00'::timestamptz, '2025-11-24 11:55:11.906996+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 33: davidocampovenegas
(
    '4cc04f54-7771-462d-98aa-a94448bb6ff5'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'davidocampovenegas@gmail.com',
    '$2b$10$8COk10WE5.bXFJnAucEA0efcGQKU6KUXKV9N7n32ZX6aNKORs4McW',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "", "last_name": ""}'::jsonb,
    false, '2025-11-24 14:52:46.468737+00'::timestamptz, '2025-11-24 14:52:46.468737+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 34: zaid080809
(
    'fbbe7d19-048c-45e4-8a9c-cf86d2098c35'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'zaid080809@gmail.com',
    '$2b$10$kdaUWR1BUqPRY7H8YkR.xuuDbqtLcvP5yKW.B0ooPlb.I6b/UU192',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "", "last_name": ""}'::jsonb,
    false, '2025-11-24 16:25:03.689847+00'::timestamptz, '2025-11-24 16:25:03.689847+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 35: ruizcruzabrahamfrancisco
(
    '5b3d74e8-fd1a-4c80-96d2-24c54bfe90c4'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'ruizcruzabrahamfrancisco@gmail.com',
    '$2b$10$DXHr682C4/VpesiHa7fRrOjKceiWSDUSx.1LZTbsvuxpqCdMNh/Ii',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "", "last_name": ""}'::jsonb,
    false, '2025-11-24 19:46:06.311558+00'::timestamptz, '2025-11-24 19:46:06.311558+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 36: vituschinchilla
(
    '615adf6e-dbf3-480f-a907-3cfb3a64c6d2'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'vituschinchilla@gmail.com',
    '$2b$10$dA8adTYlfhgqhZfACcQkFOCYjXdsmggXnIUluNDoh1zRFgQ6pq5O2',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "", "last_name": ""}'::jsonb,
    false, '2025-11-24 21:07:26.037867+00'::timestamptz, '2025-11-24 21:07:26.037867+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- =====================================================
-- LOTE 3: USUARIOS 2025-11-25 (6 usuarios)
-- =====================================================

-- USUARIO 37: bryan@betanzos.com
(
    'bf445960-4c1f-4e29-8fb7-31667b183d7e'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'bryan@betanzos.com',
    '$2b$10$Xdfuf4Tfog9QKd1FRLL.7eAaD6tr2cXgPx1/L8xqT1kLLzNHzSM26',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "", "last_name": ""}'::jsonb,
    false, '2025-11-25 06:13:30.263795+00'::timestamptz, '2025-11-25 06:13:30.263795+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 38: loganalexander816
(
    'd5fa4905-a78a-4040-8ad8-23220881c6a6'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'loganalexander816@gmail.com',
    '$2b$10$8zLduh/9L/priag.nujz5utuloO9RnNFFDGdKgI2UniFCOwocEPLq',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "", "last_name": ""}'::jsonb,
    false, '2025-11-25 07:37:04.953164+00'::timestamptz, '2025-11-25 07:37:04.953164+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 39: carlois1974
(
    '71734c15-cdaa-431b-90f5-97a57e0316a8'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'carlois1974@gmail.com',
    '$2b$10$IfLfJ.q59DZgicR07ckSVOcrkkBJe42m1FECXxaoaodKYSo6uj5wW',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "", "last_name": ""}'::jsonb,
    false, '2025-11-25 07:41:38.025764+00'::timestamptz, '2025-11-25 07:41:38.025764+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 40: enriquecuevascbtis136
(
    '1efe491d-98ef-4c02-acd1-3135f7289072'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'enriquecuevascbtis136@gmail.com',
    '$2b$10$9BX3OQMZmHruffBtN.3WPOFoyea6zgPd8i72DvhJ7vRAdqWKax6GS',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "", "last_name": ""}'::jsonb,
    false, '2025-11-25 08:16:33.977647+00'::timestamptz, '2025-11-25 08:16:33.977647+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 41: omarcitogonzalezzavaleta
(
    '5ae21325-7450-4c37-82f1-3f9bcd7b6f45'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'omarcitogonzalezzavaleta@gmail.com',
    '$2b$10$RRk3DAgQdiikxVImFIMqquqB.TNpKs3E.RNFtt1rwwTzO24uShri.',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "", "last_name": ""}'::jsonb,
    false, '2025-11-25 08:17:07.610076+00'::timestamptz, '2025-11-25 08:17:07.610076+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 42: gustavobm2024cbtis
(
    'a4d27774-8a51-4660-ad2f-81d0dfd3a5a7'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'gustavobm2024cbtis@gmail.com',
    '$2b$10$lg7KRUTPofcx4Rtyey8J7.XO0gmdBLCFIfK5uP08mqT0qUIl1aTJq',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "", "last_name": ""}'::jsonb,
    false, '2025-11-25 08:20:49.649184+00'::timestamptz, '2025-11-25 08:20:49.649184+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 43: marianaxsotoxt22
(
    '6e30164a-78b0-49b0-bd21-23d7c6c03349'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'marianaxsotoxt22@gmail.com',
    '$2b$10$GQC9yTWiP2vP9GUp0gnhUeLjmw70EI4JQhfJBZbMOlCNXGXb/bt5O',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "", "last_name": ""}'::jsonb,
    false, '2025-11-25 08:33:18.150784+00'::timestamptz, '2025-11-25 08:33:18.150784+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- =====================================================
-- LOTE 4: USUARIOS RECIENTES (2 usuarios)
-- =====================================================

-- USUARIO 44: javiermar06 (2025-12-08)
(
    '69681b09-5077-4f77-84cc-67606abd9755'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'javiermar06@hotmail.com',
    '$2b$10$3RHyXnR4BG3NaxP8Ez82FuiGDMNCG7GhNaOsMFigy3BpIVOzCqHMW',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-14 03:51:04.122+00'::timestamptz,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Javier", "last_name": "Mar"}'::jsonb,
    false, '2025-12-08 19:24:06.266895+00'::timestamptz, '2025-12-14 03:51:04.123886+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
),

-- USUARIO 45: ju188an (2025-12-17)
(
    'f929d6df-8c29-461f-88f5-264facd879e9'::uuid,
    gen_random_uuid(),
    'authenticated', NULL,
    'ju188an@gmail.com',
    '$2b$10$9vUERFnXApdfXuAI7DFve.aa8uDjI5bfm4CI75/EZ2cUre83RytKe',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-17 23:51:43.553+00'::timestamptz,
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"first_name": "Juan", "last_name": "pa"}'::jsonb,
    false, '2025-12-17 17:51:43.530434+00'::timestamptz, '2025-12-17 23:51:43.55475+00'::timestamptz,
    NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, false, NULL,
    'student'::auth_management.gamilit_role, 'active'::auth_management.user_status
)

ON CONFLICT (id) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data,
    last_sign_in_at = EXCLUDED.last_sign_in_at,
    updated_at = EXCLUDED.updated_at;

-- =====================================================
-- Verification Query
-- =====================================================

DO $$
DECLARE
    production_user_count INTEGER;
    total_user_count INTEGER;
    lote1_count INTEGER;
    lote2_count INTEGER;
    lote3_count INTEGER;
    lote4_count INTEGER;
BEGIN
    -- Contar usuarios de producción (excluyendo @gamilit.com)
    SELECT COUNT(*) INTO production_user_count
    FROM auth.users
    WHERE email NOT LIKE '%@gamilit.com';

    -- Contar todos los usuarios
    SELECT COUNT(*) INTO total_user_count
    FROM auth.users;

    -- Contar por lotes
    SELECT COUNT(*) INTO lote1_count
    FROM auth.users
    WHERE created_at::date = '2025-11-18'
    AND email NOT LIKE '%@gamilit.com';

    SELECT COUNT(*) INTO lote2_count
    FROM auth.users
    WHERE created_at::date = '2025-11-24'
    AND email NOT LIKE '%@gamilit.com';

    SELECT COUNT(*) INTO lote3_count
    FROM auth.users
    WHERE created_at::date = '2025-11-25'
    AND email NOT LIKE '%@gamilit.com';

    SELECT COUNT(*) INTO lote4_count
    FROM auth.users
    WHERE created_at::date >= '2025-12-01'
    AND email NOT LIKE '%@gamilit.com';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'USUARIOS DE PRODUCCIÓN REGISTRADOS';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total usuarios producción: %', production_user_count;
    RAISE NOTICE 'Total usuarios (con testing): %', total_user_count;
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'Por lotes:';
    RAISE NOTICE '  - Lote 1 (2025-11-18): %', lote1_count;
    RAISE NOTICE '  - Lote 2 (2025-11-24): %', lote2_count;
    RAISE NOTICE '  - Lote 3 (2025-11-25): %', lote3_count;
    RAISE NOTICE '  - Lote 4 (2025-12+): %', lote4_count;
    RAISE NOTICE '========================================';

    IF production_user_count >= 45 THEN
        RAISE NOTICE '✓ Los usuarios de producción fueron creados correctamente';
    ELSE
        RAISE WARNING '⚠ Se esperaban 45+ usuarios de producción, se crearon %', production_user_count;
    END IF;

    RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- IMPORTANTE: Profiles, Stats y Ranks
-- =====================================================
-- Los profiles, user_stats y user_ranks se crean
-- automáticamente mediante triggers cuando se crea
-- un usuario en auth.users.
--
-- Ver:
-- - auth_management.trg_after_user_insert_create_profile
-- - gamification_system.trg_after_profile_insert_create_stats
-- - gamification_system.trg_after_profile_insert_create_rank
-- =====================================================

-- =====================================================
-- CHANGELOG
-- =====================================================
-- v2.1 (2026-01-25): Backup y verificación de usuarios
--   - 45 usuarios totales (sin cambios)
--   - Backup de BD realizado para preservar datos
--   - Usuarios de prueba 2026-01 excluidos del seed
--
-- v2.0 (2025-12-18): Actualización completa desde backup producción
--   - 45 usuarios totales
--   - Lote 1: 13 usuarios (2025-11-18)
--   - Lote 2: 23 usuarios (2025-11-24)
--   - Lote 3: 6 usuarios (2025-11-25)
--   - Lote 4: 2 usuarios (2025-12-08, 2025-12-17)
--   - UUIDs y passwords originales preservados
--
-- v1.0 (2025-11-19): Primera versión
--   - 13 usuarios del lote inicial
-- =====================================================
