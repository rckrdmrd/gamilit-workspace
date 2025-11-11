-- =====================================================
-- Seed: auth.users - Demo Users (PROD)
-- Description: Usuarios demo para testing y demostraciones
-- Environment: PRODUCTION
-- Dependencies: None (auth schema managed by Supabase)
-- Order: 01
-- Created: 2025-01-11
-- Version: 1.0
-- =====================================================
--
-- USUARIOS DEMO INCLUIDOS:
-- - 16 estudiantes (incluye student@gamilit.com)
-- - 3 profesores (incluye teacher@gamilit.com)
-- - 3 admins (incluye admin@gamilit.com)
-- - 1 padre
--
-- TOTAL: 23 usuarios demo
--
-- USUARIOS DE TESTING PRINCIPALES:
-- - admin@gamilit.com / Test1234
-- - teacher@gamilit.com / Test1234
-- - student@gamilit.com / Test1234
--
-- PASSWORDS (Plain Text - SOLO PARA DEMO/TESTING):
-- - Usuarios de testing: "Test1234"
-- - Otros usuarios demo: "Demo2025!"
--
-- IMPORTANTE: Estos usuarios son para testing y demos.
-- En producción real, cambiar passwords y usar proceso de registro normal.
-- =====================================================

SET search_path TO auth, public;

-- =====================================================
-- PASSWORDS ENCRYPTED WITH BCRYPT
-- =====================================================
-- Password: "Demo2025!"
-- Bcrypt Hash (cost=10): $2b$10$EIXw7mN9kJ8L5vPq1KZ0O.YxHzQ2Jf3Rw0sZ4nV8mT6kP2hB9xL7G
--
-- Password: "Test1234" (usuarios de testing)
-- Se genera dinámicamente con: crypt('Test1234', gen_salt('bf', 10))
-- =====================================================

-- =====================================================
-- INSERT: Demo Users
-- =====================================================

INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES
-- =====================================================
-- USUARIOS DE TESTING PRINCIPALES (3)
-- Password: "Test1234"
-- =====================================================
(
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'admin@gamilit.com',
    crypt('Test1234', gen_salt('bf', 10)),
    gamilit.now_mexico(),
    jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
    ),
    jsonb_build_object(
        'name', 'Admin GAMILIT',
        'role', 'super_admin',
        'description', 'Usuario administrador de testing'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico(),
    '',
    '',
    '',
    ''
),
(
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'teacher@gamilit.com',
    crypt('Test1234', gen_salt('bf', 10)),
    gamilit.now_mexico(),
    jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
    ),
    jsonb_build_object(
        'name', 'Profesor Testing',
        'role', 'teacher',
        'description', 'Usuario profesor de testing'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico(),
    '',
    '',
    '',
    ''
),
(
    'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'student@gamilit.com',
    crypt('Test1234', gen_salt('bf', 10)),
    gamilit.now_mexico(),
    jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
    ),
    jsonb_build_object(
        'name', 'Estudiante Testing',
        'role', 'student',
        'description', 'Usuario estudiante de testing'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico(),
    '',
    '',
    '',
    ''
),

-- =====================================================
-- ESTUDIANTES DEMO (15)
-- Password: "Demo2025!"
-- =====================================================
(
    '01ac4f00-082e-4287-b899-2e169c49b05e'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'estudiante1@demo.glit.edu.mx',
    '$2b$10$EIXw7mN9kJ8L5vPq1KZ0O.YxHzQ2Jf3Rw0sZ4nV8mT6kP2hB9xL7G',
    gamilit.now_mexico(),
    jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
    ),
    jsonb_build_object(
        'name', 'Ana García Pérez',
        'role', 'student',
        'description', 'Estudiante demo 1 - 5to grado'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico(),
    '',
    '',
    '',
    ''
),
(
    '02bc5f00-182e-5387-c899-3f269d49c06f'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'estudiante2@demo.glit.edu.mx',
    '$2b$10$EIXw7mN9kJ8L5vPq1KZ0O.YxHzQ2Jf3Rw0sZ4nV8mT6kP2hB9xL7G',
    gamilit.now_mexico(),
    jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
    ),
    jsonb_build_object(
        'name', 'Carlos Ramírez López',
        'role', 'student',
        'description', 'Estudiante demo 2 - 5to grado'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico(),
    '',
    '',
    '',
    ''
),
(
    '03cd6000-282e-6487-d899-40369e49d070'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'estudiante3@demo.glit.edu.mx',
    '$2b$10$EIXw7mN9kJ8L5vPq1KZ0O.YxHzQ2Jf3Rw0sZ4nV8mT6kP2hB9xL7G',
    gamilit.now_mexico(),
    jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
    ),
    jsonb_build_object(
        'name', 'María Fernanda Sánchez',
        'role', 'student',
        'description', 'Estudiante demo 3 - 5to grado'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico(),
    '',
    '',
    '',
    ''
),
(
    '04de7000-382e-7587-e899-51469f49e081'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'estudiante4@demo.glit.edu.mx',
    '$2b$10$EIXw7mN9kJ8L5vPq1KZ0O.YxHzQ2Jf3Rw0sZ4nV8mT6kP2hB9xL7G',
    gamilit.now_mexico(),
    jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
    ),
    jsonb_build_object(
        'name', 'Luis Miguel Torres',
        'role', 'student',
        'description', 'Estudiante demo 4 - 5to grado'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico(),
    '',
    '',
    '',
    ''
),
(
    '05ef8000-482e-8687-f899-62569049f092'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'estudiante5@demo.glit.edu.mx',
    '$2b$10$EIXw7mN9kJ8L5vPq1KZ0O.YxHzQ2Jf3Rw0sZ4nV8mT6kP2hB9xL7G',
    gamilit.now_mexico(),
    jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
    ),
    jsonb_build_object(
        'name', 'Sofía Martínez Hernández',
        'role', 'student',
        'description', 'Estudiante demo 5 - 6to grado'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico(),
    '',
    '',
    '',
    ''
),
(
    '06f09000-582e-9787-0899-73679149010d'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'estudiante6@demo.glit.edu.mx',
    '$2b$10$EIXw7mN9kJ8L5vPq1KZ0O.YxHzQ2Jf3Rw0sZ4nV8mT6kP2hB9xL7G',
    gamilit.now_mexico(),
    jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
    ),
    jsonb_build_object(
        'name', 'Diego Rodríguez Vega',
        'role', 'student',
        'description', 'Estudiante demo 6 - 6to grado'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico(),
    '',
    '',
    '',
    ''
),
(
    '07010000-682e-0887-1999-847802491e14'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'estudiante7@demo.glit.edu.mx',
    '$2b$10$EIXw7mN9kJ8L5vPq1KZ0O.YxHzQ2Jf3Rw0sZ4nV8mT6kP2hB9xL7G',
    gamilit.now_mexico(),
    jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
    ),
    jsonb_build_object(
        'name', 'Valentina Cruz Morales',
        'role', 'student',
        'description', 'Estudiante demo 7 - 5to grado'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico(),
    '',
    '',
    '',
    ''
),
(
    '08121000-782e-1987-2009-9f891349212f'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'estudiante8@demo.glit.edu.mx',
    '$2b$10$EIXw7mN9kJ8L5vPq1KZ0O.YxHzQ2Jf3Rw0sZ4nV8mT6kP2hB9xL7G',
    gamilit.now_mexico(),
    jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
    ),
    jsonb_build_object(
        'name', 'Mateo Flores Jiménez',
        'role', 'student',
        'description', 'Estudiante demo 8 - 5to grado'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico(),
    '',
    '',
    '',
    ''
),
(
    '09232000-882e-2087-3119-0a90244931a3'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'estudiante9@demo.glit.edu.mx',
    '$2b$10$EIXw7mN9kJ8L5vPq1KZ0O.YxHzQ2Jf3Rw0sZ4nV8mT6kP2hB9xL7G',
    gamilit.now_mexico(),
    jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
    ),
    jsonb_build_object(
        'name', 'Isabella Romero Silva',
        'role', 'student',
        'description', 'Estudiante demo 9 - 6to grado'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico(),
    '',
    '',
    '',
    ''
),
(
    '10343000-982e-3187-4229-1b01354941b4'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'estudiante10@demo.glit.edu.mx',
    '$2b$10$EIXw7mN9kJ8L5vPq1KZ0O.YxHzQ2Jf3Rw0sZ4nV8mT6kP2hB9xL7G',
    gamilit.now_mexico(),
    jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
    ),
    jsonb_build_object(
        'name', 'Sebastián Vargas Castro',
        'role', 'student',
        'description', 'Estudiante demo 10 - 5to grado'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico(),
    '',
    '',
    '',
    ''
),
(
    '11454000-092e-4287-5339-2c12464951c5'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'estudiante11@demo.glit.edu.mx',
    '$2b$10$EIXw7mN9kJ8L5vPq1KZ0O.YxHzQ2Jf3Rw0sZ4nV8mT6kP2hB9xL7G',
    gamilit.now_mexico(),
    jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
    ),
    jsonb_build_object(
        'name', 'Camila Ortiz Reyes',
        'role', 'student',
        'description', 'Estudiante demo 11 - 6to grado'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico(),
    '',
    '',
    '',
    ''
),
(
    '12565000-102e-5387-6449-3d23574961d6'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'estudiante12@demo.glit.edu.mx',
    '$2b$10$EIXw7mN9kJ8L5vPq1KZ0O.YxHzQ2Jf3Rw0sZ4nV8mT6kP2hB9xL7G',
    gamilit.now_mexico(),
    jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
    ),
    jsonb_build_object(
        'name', 'Leonardo Méndez Ruiz',
        'role', 'student',
        'description', 'Estudiante demo 12 - 5to grado'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico(),
    '',
    '',
    '',
    ''
),
(
    '13676000-202e-6487-7559-4e34684971e7'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'estudiante13@demo.glit.edu.mx',
    '$2b$10$EIXw7mN9kJ8L5vPq1KZ0O.YxHzQ2Jf3Rw0sZ4nV8mT6kP2hB9xL7G',
    gamilit.now_mexico(),
    jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
    ),
    jsonb_build_object(
        'name', 'Emilia Navarro Gutiérrez',
        'role', 'student',
        'description', 'Estudiante demo 13 - 6to grado'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico(),
    '',
    '',
    '',
    ''
),
(
    '14787000-302e-7587-8669-5f45794981f8'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'estudiante14@demo.glit.edu.mx',
    '$2b$10$EIXw7mN9kJ8L5vPq1KZ0O.YxHzQ2Jf3Rw0sZ4nV8mT6kP2hB9xL7G',
    gamilit.now_mexico(),
    jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
    ),
    jsonb_build_object(
        'name', 'Joaquín Castro Delgado',
        'role', 'student',
        'description', 'Estudiante demo 14 - 5to grado'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico(),
    '',
    '',
    '',
    ''
),
(
    '15898000-402e-8687-9779-60568a4991a9'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'estudiante15@demo.glit.edu.mx',
    '$2b$10$EIXw7mN9kJ8L5vPq1KZ0O.YxHzQ2Jf3Rw0sZ4nV8mT6kP2hB9xL7G',
    gamilit.now_mexico(),
    jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
    ),
    jsonb_build_object(
        'name', 'Renata Guerrero Medina',
        'role', 'student',
        'description', 'Estudiante demo 15 - 6to grado'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico(),
    '',
    '',
    '',
    ''
),

-- =====================================================
-- PROFESORES DEMO (2)
-- Password: "Demo2025!"
-- =====================================================
(
    '10ac4f00-092e-4297-b909-2e179c49b15e'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'profesor1@demo.glit.edu.mx',
    '$2b$10$EIXw7mN9kJ8L5vPq1KZ0O.YxHzQ2Jf3Rw0sZ4nV8mT6kP2hB9xL7G',
    gamilit.now_mexico(),
    jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
    ),
    jsonb_build_object(
        'name', 'Prof. Roberto Méndez',
        'role', 'teacher',
        'description', 'Profesor demo 1 - Lengua Española y Literatura'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico(),
    '',
    '',
    '',
    ''
),
(
    '11bc5f00-192e-5397-c919-3f279d49c26f'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'profesor2@demo.glit.edu.mx',
    '$2b$10$EIXw7mN9kJ8L5vPq1KZ0O.YxHzQ2Jf3Rw0sZ4nV8mT6kP2hB9xL7G',
    gamilit.now_mexico(),
    jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
    ),
    jsonb_build_object(
        'name', 'Profa. Laura González',
        'role', 'teacher',
        'description', 'Profesora demo 2 - Comprensión Lectora'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico(),
    '',
    '',
    '',
    ''
),

-- =====================================================
-- ADMINISTRADORES DEMO (2)
-- Password: "Demo2025!"
-- =====================================================
(
    '20ac4f00-002e-4207-b809-2e189c49b25e'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'admin-sistema@gamilit.com',
    '$2b$10$EIXw7mN9kJ8L5vPq1KZ0O.YxHzQ2Jf3Rw0sZ4nV8mT6kP2hB9xL7G',
    gamilit.now_mexico(),
    jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
    ),
    jsonb_build_object(
        'name', 'Administrador Sistema GAMILIT',
        'role', 'super_admin',
        'description', 'Administrador secundario del sistema'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico(),
    '',
    '',
    '',
    ''
),
(
    '21bc5f00-102e-5307-c829-3f289d49c36f'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'director@demo.glit.edu.mx',
    '$2b$10$EIXw7mN9kJ8L5vPq1KZ0O.YxHzQ2Jf3Rw0sZ4nV8mT6kP2hB9xL7G',
    gamilit.now_mexico(),
    jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
    ),
    jsonb_build_object(
        'name', 'Lic. Patricia Hernández',
        'role', 'school_admin',
        'description', 'Directora de escuela demo'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico(),
    '',
    '',
    '',
    ''
),

-- =====================================================
-- PADRES (1)
-- =====================================================
(
    '30ac4f00-012e-4217-b819-2e199c49b35e'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'padre1@demo.glit.edu.mx',
    '$2b$10$EIXw7mN9kJ8L5vPq1KZ0O.YxHzQ2Jf3Rw0sZ4nV8mT6kP2hB9xL7G',
    gamilit.now_mexico(),
    jsonb_build_object(
        'provider', 'email',
        'providers', ARRAY['email']
    ),
    jsonb_build_object(
        'name', 'Sr. Jorge García',
        'role', 'parent',
        'description', 'Padre de familia demo - Padre de Ana García'
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico(),
    '',
    '',
    '',
    ''
)

ON CONFLICT (email) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password,
    raw_user_meta_data = EXCLUDED.raw_user_meta_data,
    email_confirmed_at = EXCLUDED.email_confirmed_at,
    updated_at = gamilit.now_mexico();

-- =====================================================
-- Verification Query
-- =====================================================

DO $$
DECLARE
    user_count INTEGER;
    students_count INTEGER;
    teachers_count INTEGER;
    admins_count INTEGER;
    parents_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count
    FROM auth.users
    WHERE email LIKE '%@demo.glit.edu.mx' OR email = 'admin@gamilit.com';

    SELECT COUNT(*) INTO students_count
    FROM auth.users
    WHERE email LIKE 'estudiante%@demo.glit.edu.mx';

    SELECT COUNT(*) INTO teachers_count
    FROM auth.users
    WHERE email LIKE 'profesor%@demo.glit.edu.mx';

    SELECT COUNT(*) INTO admins_count
    FROM auth.users
    WHERE email IN ('admin@gamilit.com', 'director@demo.glit.edu.mx');

    SELECT COUNT(*) INTO parents_count
    FROM auth.users
    WHERE email LIKE 'padre%@demo.glit.edu.mx';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'USUARIOS DEMO CREADOS EXITOSAMENTE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total usuarios: %', user_count;
    RAISE NOTICE '  - Estudiantes: %', students_count;
    RAISE NOTICE '  - Profesores: %', teachers_count;
    RAISE NOTICE '  - Administradores: %', admins_count;
    RAISE NOTICE '  - Padres: %', parents_count;
    RAISE NOTICE '========================================';

    IF user_count = 23 THEN
        RAISE NOTICE '✓ Todos los usuarios demo fueron creados correctamente';
    ELSE
        RAISE WARNING '⚠ Se esperaban 23 usuarios, se crearon %', user_count;
    END IF;
END $$;

-- =====================================================
-- Testing Info
-- =====================================================
-- Para probar login:
--
-- curl -X POST http://localhost:3000/api/auth/login \
--   -H "Content-Type: application/json" \
--   -d '{"email":"estudiante1@demo.glit.edu.mx","password":"Demo2025!"}'
--
-- =====================================================
