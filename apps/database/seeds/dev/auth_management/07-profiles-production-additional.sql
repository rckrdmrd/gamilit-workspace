-- =====================================================
-- Seed: auth_management.profiles - Additional Production Users
-- Description: Perfiles adicionales para usuarios registrados sin nombre completo
-- Environment: PRODUCTION / DEV
-- Dependencies: auth/02-production-users.sql, auth_management/01-tenants.sql
-- Order: 07 (despues de 06-profiles-production.sql)
-- Created: 2025-12-19
-- Version: 2.0 (+ 5 perfiles Lote 5 desde backup 2026-02-21)
-- =====================================================
--
-- USUARIOS ADICIONALES: 37 perfiles (32 originales + 5 Lote 5)
-- Estos usuarios se registraron despues del lote inicial y no tienen
-- first_name/last_name en su metadata. Se crean con datos minimos.
--
-- POLITICA:
-- - profiles.id = auth.users.id (consistente con el resto del sistema)
-- - tenant_id = Tenant principal (GAMILIT Platform)
-- - Nombres vacios permitidos (el usuario puede completarlos despues)
--
-- EXCLUIDO: rckrdmrd@gmail.com (por solicitud explicita)
-- =====================================================

SET search_path TO auth_management, public;

-- =====================================================
-- INSERT: Additional Production User Profiles (32 perfiles)
-- =====================================================

INSERT INTO auth_management.profiles (
    id,
    tenant_id,
    user_id,
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

-- Perfil 1: santiagoferrara78@gmail.com
(
    'd089b1af-462f-4d2c-b0f5-d2528cec8506'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'd089b1af-462f-4d2c-b0f5-d2528cec8506'::uuid,
    'santiagoferrara78@gmail.com',
    NULL, NULL, '', '',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 09:21:04.898591+00'::timestamptz,
    '2025-11-24 09:21:04.898591+00'::timestamptz
),

-- Perfil 2: alexanserrv917@gmail.com
(
    'b1cadf36-1f07-46b2-b63d-da72d9b54dc6'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'b1cadf36-1f07-46b2-b63d-da72d9b54dc6'::uuid,
    'alexanserrv917@gmail.com',
    NULL, NULL, '', '',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 10:26:51.934739+00'::timestamptz,
    '2025-11-24 10:26:51.934739+00'::timestamptz
),

-- Perfil 3: aarizmendi434@gmail.com
(
    'af4d8788-f8a8-4971-bb0d-2f48c150dfc2'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'af4d8788-f8a8-4971-bb0d-2f48c150dfc2'::uuid,
    'aarizmendi434@gmail.com',
    NULL, NULL, '', '',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 10:30:54.728262+00'::timestamptz,
    '2025-11-24 10:30:54.728262+00'::timestamptz
),

-- Perfil 4: ashernarcisobenitezpalomino@gmail.com
(
    '26fbc469-10af-4fa3-bd65-e5498188cc4f'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '26fbc469-10af-4fa3-bd65-e5498188cc4f'::uuid,
    'ashernarcisobenitezpalomino@gmail.com',
    NULL, NULL, '', '',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 10:37:35.325342+00'::timestamptz,
    '2025-11-24 10:37:35.325342+00'::timestamptz
),

-- Perfil 5: ra.alejandrobm@gmail.com
(
    '74ed8c97-ec36-43aa-a1cc-b0c99e4be4e8'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '74ed8c97-ec36-43aa-a1cc-b0c99e4be4e8'::uuid,
    'ra.alejandrobm@gmail.com',
    NULL, NULL, '', '',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 10:42:33.424367+00'::timestamptz,
    '2025-11-24 10:42:33.424367+00'::timestamptz
),

-- Perfil 6: abdallahxelhaneriavega@gmail.com
(
    'f4c46f46-3fb9-40bf-a52b-a8ad2e6a92e1'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'f4c46f46-3fb9-40bf-a52b-a8ad2e6a92e1'::uuid,
    'abdallahxelhaneriavega@gmail.com',
    NULL, NULL, '', '',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 10:45:19.984994+00'::timestamptz,
    '2025-11-24 10:45:19.984994+00'::timestamptz
),

-- Perfil 7: 09enriquecampos@gmail.com
(
    '012adac4-8ffd-47bd-9248-f0c5851e981f'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '012adac4-8ffd-47bd-9248-f0c5851e981f'::uuid,
    '09enriquecampos@gmail.com',
    NULL, NULL, '', '',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 10:51:54.731982+00'::timestamptz,
    '2025-11-24 10:51:54.731982+00'::timestamptz
),

-- Perfil 8: johhkk22@gmail.com
(
    '126b9257-7b0a-4bd6-9ab3-c505ee00e10a'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '126b9257-7b0a-4bd6-9ab3-c505ee00e10a'::uuid,
    'johhkk22@gmail.com',
    NULL, NULL, '', '',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 10:53:47.029991+00'::timestamptz,
    '2025-11-24 10:53:47.029991+00'::timestamptz
),

-- Perfil 9: edangiel4532@gmail.com
(
    '9ac1746e-94a6-4efc-a961-951c015d416e'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '9ac1746e-94a6-4efc-a961-951c015d416e'::uuid,
    'edangiel4532@gmail.com',
    NULL, NULL, '', '',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 10:58:12.790316+00'::timestamptz,
    '2025-11-24 10:58:12.790316+00'::timestamptz
),

-- Perfil 10: erickfranco462@gmail.com
(
    '2d9f05d4-44dd-42cd-97aa-d57bd06fecd0'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '2d9f05d4-44dd-42cd-97aa-d57bd06fecd0'::uuid,
    'erickfranco462@gmail.com',
    NULL, NULL, '', '',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 11:00:11.800551+00'::timestamptz,
    '2025-11-24 11:00:11.800551+00'::timestamptz
),

-- Perfil 11: gallinainsana@gmail.com
(
    'aff5dcc6-32de-4769-9aaf-eda751fa0866'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'aff5dcc6-32de-4769-9aaf-eda751fa0866'::uuid,
    'gallinainsana@gmail.com',
    NULL, NULL, '', '',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 11:03:17.536383+00'::timestamptz,
    '2025-11-24 11:03:17.536383+00'::timestamptz
),

-- Perfil 12: leile5257@gmail.com
(
    '0cda1645-83c5-445b-80b7-d0e4d436c00c'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '0cda1645-83c5-445b-80b7-d0e4d436c00c'::uuid,
    'leile5257@gmail.com',
    NULL, NULL, '', '',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 11:05:17.75852+00'::timestamptz,
    '2025-11-24 11:05:17.75852+00'::timestamptz
),

-- Perfil 13: maximiliano.mejia367@gmail.com
(
    '1364c463-88de-479b-a883-c0b7b362bcf8'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '1364c463-88de-479b-a883-c0b7b362bcf8'::uuid,
    'maximiliano.mejia367@gmail.com',
    NULL, NULL, '', '',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 11:08:58.232003+00'::timestamptz,
    '2025-11-24 11:08:58.232003+00'::timestamptz
),

-- Perfil 14: fl432025@gmail.com
(
    '547eb778-4782-4681-b198-c731bba36147'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '547eb778-4782-4681-b198-c731bba36147'::uuid,
    'fl432025@gmail.com',
    NULL, NULL, '', '',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 11:12:13.692614+00'::timestamptz,
    '2025-11-24 11:12:13.692614+00'::timestamptz
),

-- Perfil 15: 7341023901m@gmail.com
(
    '5fc06693-e408-4eab-a9a3-fcd5f4e01296'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '5fc06693-e408-4eab-a9a3-fcd5f4e01296'::uuid,
    '7341023901m@gmail.com',
    NULL, NULL, '', '',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 11:15:18.276345+00'::timestamptz,
    '2025-11-24 11:15:18.276345+00'::timestamptz
),

-- Perfil 16: segurauriel235@gmail.com
(
    '5d1839f6-b03f-4e12-b236-eca43f4674f2'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '5d1839f6-b03f-4e12-b236-eca43f4674f2'::uuid,
    'segurauriel235@gmail.com',
    NULL, NULL, '', '',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 11:17:46.846963+00'::timestamptz,
    '2025-11-24 11:17:46.846963+00'::timestamptz
),

-- Perfil 17: angelrabano11@gmail.com
(
    '1b310708-6f24-4c6a-88c9-a11f7a7f9763'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '1b310708-6f24-4c6a-88c9-a11f7a7f9763'::uuid,
    'angelrabano11@gmail.com',
    NULL, NULL, '', '',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 11:47:53.790673+00'::timestamptz,
    '2025-11-24 11:47:53.790673+00'::timestamptz
),

-- Perfil 18: daliaayalareyes35@gmail.com
(
    '3c613b0e-66f9-4640-a599-c9426d8edffb'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '3c613b0e-66f9-4640-a599-c9426d8edffb'::uuid,
    'daliaayalareyes35@gmail.com',
    NULL, NULL, '', '',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 11:55:08.708961+00'::timestamptz,
    '2025-11-24 11:55:08.708961+00'::timestamptz
),

-- Perfil 19: alexeimongam@gmail.com
(
    '7ded133e-9b13-4467-9803-edb813f6a9a1'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '7ded133e-9b13-4467-9803-edb813f6a9a1'::uuid,
    'alexeimongam@gmail.com',
    NULL, NULL, '', '',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 11:55:11.906996+00'::timestamptz,
    '2025-11-24 11:55:11.906996+00'::timestamptz
),

-- Perfil 20: davidocampovenegas@gmail.com
(
    '4cc04f54-7771-462d-98aa-a94448bb6ff5'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '4cc04f54-7771-462d-98aa-a94448bb6ff5'::uuid,
    'davidocampovenegas@gmail.com',
    NULL, NULL, '', '',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 14:52:46.468737+00'::timestamptz,
    '2025-11-24 14:52:46.468737+00'::timestamptz
),

-- Perfil 21: zaid080809@gmail.com
(
    'fbbe7d19-048c-45e4-8a9c-cf86d2098c35'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'fbbe7d19-048c-45e4-8a9c-cf86d2098c35'::uuid,
    'zaid080809@gmail.com',
    NULL, NULL, '', '',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 16:25:03.689847+00'::timestamptz,
    '2025-11-24 16:25:03.689847+00'::timestamptz
),

-- Perfil 22: ruizcruzabrahamfrancisco@gmail.com
(
    '5b3d74e8-fd1a-4c80-96d2-24c54bfe90c4'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '5b3d74e8-fd1a-4c80-96d2-24c54bfe90c4'::uuid,
    'ruizcruzabrahamfrancisco@gmail.com',
    NULL, NULL, '', '',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 19:46:06.311558+00'::timestamptz,
    '2025-11-24 19:46:06.311558+00'::timestamptz
),

-- Perfil 23: vituschinchilla@gmail.com
(
    '615adf6e-dbf3-480f-a907-3cfb3a64c6d2'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '615adf6e-dbf3-480f-a907-3cfb3a64c6d2'::uuid,
    'vituschinchilla@gmail.com',
    NULL, NULL, '', '',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-24 21:07:26.037867+00'::timestamptz,
    '2025-11-24 21:07:26.037867+00'::timestamptz
),

-- Perfil 24: bryan@betanzos.com
(
    'bf445960-4c1f-4e29-8fb7-31667b183d7e'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'bf445960-4c1f-4e29-8fb7-31667b183d7e'::uuid,
    'bryan@betanzos.com',
    NULL, NULL, '', '',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-25 06:13:30.263795+00'::timestamptz,
    '2025-11-25 06:13:30.263795+00'::timestamptz
),

-- Perfil 25: loganalexander816@gmail.com
(
    'd5fa4905-a78a-4040-8ad8-23220881c6a6'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'd5fa4905-a78a-4040-8ad8-23220881c6a6'::uuid,
    'loganalexander816@gmail.com',
    NULL, NULL, '', '',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-25 07:37:04.953164+00'::timestamptz,
    '2025-11-25 07:37:04.953164+00'::timestamptz
),

-- Perfil 26: carlois1974@gmail.com
(
    '71734c15-cdaa-431b-90f5-97a57e0316a8'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '71734c15-cdaa-431b-90f5-97a57e0316a8'::uuid,
    'carlois1974@gmail.com',
    NULL, NULL, '', '',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-25 07:41:38.025764+00'::timestamptz,
    '2025-11-25 07:41:38.025764+00'::timestamptz
),

-- Perfil 27: enriquecuevascbtis136@gmail.com
(
    '1efe491d-98ef-4c02-acd1-3135f7289072'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '1efe491d-98ef-4c02-acd1-3135f7289072'::uuid,
    'enriquecuevascbtis136@gmail.com',
    NULL, NULL, '', '',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-25 08:16:33.977647+00'::timestamptz,
    '2025-11-25 08:16:33.977647+00'::timestamptz
),

-- Perfil 28: omarcitogonzalezzavaleta@gmail.com
(
    '5ae21325-7450-4c37-82f1-3f9bcd7b6f45'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '5ae21325-7450-4c37-82f1-3f9bcd7b6f45'::uuid,
    'omarcitogonzalezzavaleta@gmail.com',
    NULL, NULL, '', '',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-25 08:17:07.610076+00'::timestamptz,
    '2025-11-25 08:17:07.610076+00'::timestamptz
),

-- Perfil 29: gustavobm2024cbtis@gmail.com
(
    'a4d27774-8a51-4660-ad2f-81d0dfd3a5a7'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'a4d27774-8a51-4660-ad2f-81d0dfd3a5a7'::uuid,
    'gustavobm2024cbtis@gmail.com',
    NULL, NULL, '', '',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-25 08:20:49.649184+00'::timestamptz,
    '2025-11-25 08:20:49.649184+00'::timestamptz
),

-- Perfil 30: marianaxsotoxt22@gmail.com
(
    '6e30164a-78b0-49b0-bd21-23d7c6c03349'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '6e30164a-78b0-49b0-bd21-23d7c6c03349'::uuid,
    'marianaxsotoxt22@gmail.com',
    NULL, NULL, '', '',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-11-25 08:33:18.150784+00'::timestamptz,
    '2025-11-25 08:33:18.150784+00'::timestamptz
),

-- Perfil 31: javiermar06@hotmail.com
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

-- Perfil 32: ju188an@gmail.com
(
    'f929d6df-8c29-461f-88f5-264facd879e9'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'f929d6df-8c29-461f-88f5-264facd879e9'::uuid,
    'ju188an@gmail.com',
    'Juan pa', 'Juan pa', 'Juan', 'pa',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2025-12-17 17:51:43.536295+00'::timestamptz,
    '2025-12-17 17:51:43.536295+00'::timestamptz
),

-- =====================================================
-- LOTE 5: Usuarios registrados 2026-02-20 (backup 2026-02-21)
-- =====================================================

-- Perfil 33: arizabalo21@hotmail.com (Ana Ofelia Arizabalo - "Flicka")
(
    'fa14c733-d9fa-46e5-86fc-9d852e7f4383'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'fa14c733-d9fa-46e5-86fc-9d852e7f4383'::uuid,
    'arizabalo21@hotmail.com',
    'Flicka', 'Ana Ofelia Arizabalo', 'Ana Ofelia', 'Arizabalo',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2026-02-20 09:29:01.089708+00'::timestamptz,
    '2026-02-20 09:31:10.444233+00'::timestamptz
),

-- Perfil 34: dl7231217@gmail.com (Daniela Jaqueline Castilleros Lopez)
(
    '9f709cba-5f49-4c80-b58d-a424af57ffc6'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '9f709cba-5f49-4c80-b58d-a424af57ffc6'::uuid,
    'dl7231217@gmail.com',
    NULL, 'Daniela Jaqueline Castilleros Lopez', 'Daniela Jaqueline', 'Castilleros Lopez',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2026-02-20 14:17:49.700933+00'::timestamptz,
    '2026-02-20 14:17:49.700933+00'::timestamptz
),

-- Perfil 35: maritzamoralesdeloya@gmail.com (Maritza Morales Deloya)
(
    'e2bb31c0-0949-430e-8dd7-02e8b3ca91c2'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'e2bb31c0-0949-430e-8dd7-02e8b3ca91c2'::uuid,
    'maritzamoralesdeloya@gmail.com',
    NULL, 'Maritza Morales Deloya', 'Maritza', 'Morales Deloya',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2026-02-20 14:20:38.630609+00'::timestamptz,
    '2026-02-20 14:20:38.630609+00'::timestamptz
),

-- Perfil 36: gamam130727@gmail.com (Mauricio Ramirez Gama)
(
    'aadf1eca-7e5c-4767-a3c7-80b47fdee782'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'aadf1eca-7e5c-4767-a3c7-80b47fdee782'::uuid,
    'gamam130727@gmail.com',
    NULL, 'Mauricio Ramirez Gama', 'Mauricio', 'Ramirez Gama',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2026-02-20 14:25:42.039569+00'::timestamptz,
    '2026-02-20 14:25:42.039569+00'::timestamptz
),

-- Perfil 37: abigailisidro08@gmail.com (Diana Abigail Sotelo Isidro)
(
    '71252b1c-c643-4228-aadc-d8ecaafd9356'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    '71252b1c-c643-4228-aadc-d8ecaafd9356'::uuid,
    'abigailisidro08@gmail.com',
    NULL, 'Diana Abigail Sotelo Isidro', 'Diana Abigail', 'Sotelo Isidro',
    NULL, NULL, NULL, NULL, NULL, NULL, NULL,
    'student'::auth_management.gamilit_role,
    'active'::auth_management.user_status,
    false, false,
    '{"theme": "detective", "language": "es", "timezone": "America/Mexico_City", "sound_enabled": true, "notifications_enabled": true}'::jsonb,
    '{}'::jsonb,
    '2026-02-20 14:28:11.80192+00'::timestamptz,
    '2026-02-20 14:28:11.80192+00'::timestamptz
)

ON CONFLICT (email) DO UPDATE SET
    tenant_id = EXCLUDED.tenant_id,
    display_name = COALESCE(NULLIF(EXCLUDED.display_name, ''), auth_management.profiles.display_name),
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), auth_management.profiles.full_name),
    first_name = COALESCE(NULLIF(EXCLUDED.first_name, ''), auth_management.profiles.first_name),
    last_name = COALESCE(NULLIF(EXCLUDED.last_name, ''), auth_management.profiles.last_name),
    updated_at = NOW();

-- =====================================================
-- Verification Query
-- =====================================================

DO $$
DECLARE
    additional_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO additional_count
    FROM auth_management.profiles
    WHERE email NOT LIKE '%@gamilit.com'
      AND email NOT IN (
        'joseal.guirre34@gmail.com',
        'sergiojimenezesteban63@gmail.com',
        'Gomezfornite92@gmail.com',
        'Aragon494gt54@icloud.com',
        'blu3wt7@gmail.com',
        'ricardolugo786@icloud.com',
        'marbancarlos916@gmail.com',
        'diego.colores09@gmail.com',
        'hernandezfonsecabenjamin7@gmail.com',
        'jr7794315@gmail.com',
        'barraganfer03@gmail.com',
        'roman.rebollar.marcoantonio1008@gmail.com',
        'rodrigoguerrero0914@gmail.com'
      );

    RAISE NOTICE '========================================';
    RAISE NOTICE 'PERFILES ADICIONALES DE PRODUCCION';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Perfiles adicionales creados: %', additional_count;
    RAISE NOTICE '========================================';

    IF additional_count >= 35 THEN
        RAISE NOTICE 'OK: Se crearon los 37 perfiles adicionales (32 + 5 Lote 5)';
    ELSE
        RAISE WARNING 'ATENCION: Se esperaban 37 perfiles adicionales, se encontraron %', additional_count;
    END IF;
END $$;

-- =====================================================
-- NOTA: rckrdmrd@gmail.com fue EXCLUIDO intencionalmente
-- =====================================================
