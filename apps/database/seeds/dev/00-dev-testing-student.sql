-- =====================================================
-- Seed Data: Dev Testing Student Setup
-- =====================================================
-- Description: Configuracion completa para testing con student@gamilit.com
-- Includes: Usuario, perfil, modulos y ejercicios seleccionados
-- Created by: SA-SEEDS-DEV
-- Date: 2026-01-25
-- Status: DEV ONLY
-- =====================================================
--
-- Este seed consolida la creacion del usuario de testing y
-- la carga de ejercicios especificos para desarrollo:
--   - Modulo 1: TODOS los ejercicios (5)
--   - Modulo 2: TODOS los ejercicios (5)
--   - Modulo 3: Solo ejercicios con TEXTO extenso (3)
--
-- =====================================================

-- =====================================================
-- PARTE 1: USUARIO student@gamilit.com
-- =====================================================

SET search_path TO auth, public;

-- Crear usuario de testing si no existe
DO $$
DECLARE
    student_user_id UUID;
BEGIN
    -- Verificar si ya existe
    SELECT id INTO student_user_id FROM auth.users WHERE email = 'student@gamilit.com';

    IF student_user_id IS NULL THEN
        student_user_id := gen_random_uuid();
        INSERT INTO auth.users (
            id,
            email,
            encrypted_password,
            gamilit_role,
            status,
            email_confirmed_at,
            created_at,
            updated_at
        ) VALUES (
            student_user_id,
            'student@gamilit.com',
            crypt('Test1234', gen_salt('bf', 10)),
            'student',
            'active',
            NOW(),
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Usuario student@gamilit.com creado con ID: %', student_user_id;
    ELSE
        -- Actualizar password si ya existe (por si cambio)
        UPDATE auth.users
        SET encrypted_password = crypt('Test1234', gen_salt('bf', 10)),
            status = 'active',
            email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
            updated_at = NOW()
        WHERE email = 'student@gamilit.com';
        RAISE NOTICE 'Usuario student@gamilit.com actualizado (ID: %)', student_user_id;
    END IF;
END $$;

-- =====================================================
-- PARTE 2: PROFILE para student@gamilit.com
-- =====================================================

SET search_path TO auth_management, public;

DO $$
DECLARE
    student_user_id UUID;
    default_tenant_id UUID;
    default_school_id UUID;
BEGIN
    -- Obtener IDs necesarios
    SELECT id INTO student_user_id FROM auth.users WHERE email = 'student@gamilit.com';
    SELECT id INTO default_tenant_id FROM auth_management.tenants WHERE slug = 'default' LIMIT 1;
    SELECT id INTO default_school_id FROM auth_management.schools WHERE name ILIKE '%default%' OR name ILIKE '%institucion%' LIMIT 1;

    -- Crear profile si no existe
    IF student_user_id IS NOT NULL AND NOT EXISTS (
        SELECT 1 FROM auth_management.profiles WHERE user_id = student_user_id
    ) THEN
        INSERT INTO auth_management.profiles (
            id,
            user_id,
            tenant_id,
            school_id,
            email,
            first_name,
            last_name,
            full_name,
            display_name,
            role,
            status,
            email_verified,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            student_user_id,
            default_tenant_id,
            default_school_id,
            'student@gamilit.com',
            'Estudiante',
            'Testing',
            'Estudiante Testing',
            'StudentTest',
            'student',
            'active',
            true,
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Profile creado para student@gamilit.com';
    ELSE
        -- Actualizar profile existente
        UPDATE auth_management.profiles
        SET first_name = 'Estudiante',
            last_name = 'Testing',
            full_name = 'Estudiante Testing',
            display_name = 'StudentTest',
            status = 'active',
            email_verified = true,
            updated_at = NOW()
        WHERE user_id = student_user_id;
        RAISE NOTICE 'Profile actualizado para student@gamilit.com';
    END IF;
END $$;

-- =====================================================
-- PARTE 3: VERIFICAR MODULOS EXISTEN
-- =====================================================

SET search_path TO educational_content, public;

DO $$
DECLARE
    mod1_id UUID;
    mod2_id UUID;
    mod3_id UUID;
BEGIN
    -- Verificar que los modulos existen
    SELECT id INTO mod1_id FROM educational_content.modules WHERE module_code = 'MOD-01-LITERAL';
    SELECT id INTO mod2_id FROM educational_content.modules WHERE module_code = 'MOD-02-INFERENCIAL';
    SELECT id INTO mod3_id FROM educational_content.modules WHERE module_code = 'MOD-03-CRITICA';

    IF mod1_id IS NULL THEN
        RAISE EXCEPTION 'Modulo MOD-01-LITERAL no encontrado. Ejecutar primero 01-modules.sql';
    END IF;

    IF mod2_id IS NULL THEN
        RAISE EXCEPTION 'Modulo MOD-02-INFERENCIAL no encontrado. Ejecutar primero 01-modules.sql';
    END IF;

    IF mod3_id IS NULL THEN
        RAISE EXCEPTION 'Modulo MOD-03-CRITICA no encontrado. Ejecutar primero 01-modules.sql';
    END IF;

    RAISE NOTICE 'Modulos verificados: M1=%, M2=%, M3=%', mod1_id, mod2_id, mod3_id;
END $$;

-- =====================================================
-- PARTE 4: RESUMEN DE EJERCICIOS POR MODULO
-- =====================================================
--
-- MODULO 1 (MOD-01-LITERAL) - 5 ejercicios:
--   1.1 Crucigrama Cientifico
--   1.2 Linea de Tiempo
--   1.3 Sopa de Letras
--   1.4 Mapa Conceptual
--   1.5 Emparejamiento
--
-- MODULO 2 (MOD-02-INFERENCIAL) - 5 ejercicios:
--   2.1 Detective Textual
--   2.2 Construccion de Hipotesis
--   2.3 Prediccion
--   2.4 Puzzle Inferencial
--   2.5 Rueda de Inferencias
--
-- MODULO 3 (MOD-03-CRITICA) - 3 ejercicios CON TEXTO:
--   3.1 Analisis de Fuentes Historicas (texto extenso)
--   3.2 Debate Digital (texto extenso)
--   3.3 Matriz de Perspectivas (texto extenso)
--   [EXCLUIDOS: ejercicios visuales sin texto extenso]
--
-- =====================================================

-- Verificar ejercicios cargados
DO $$
DECLARE
    mod1_exercises INTEGER;
    mod2_exercises INTEGER;
    mod3_text_exercises INTEGER;
BEGIN
    -- Contar ejercicios por modulo
    SELECT COUNT(*) INTO mod1_exercises
    FROM educational_content.exercises e
    JOIN educational_content.modules m ON e.module_id = m.id
    WHERE m.module_code = 'MOD-01-LITERAL' AND e.is_active = true;

    SELECT COUNT(*) INTO mod2_exercises
    FROM educational_content.exercises e
    JOIN educational_content.modules m ON e.module_id = m.id
    WHERE m.module_code = 'MOD-02-INFERENCIAL' AND e.is_active = true;

    -- Modulo 3: Solo ejercicios con texto extenso
    SELECT COUNT(*) INTO mod3_text_exercises
    FROM educational_content.exercises e
    JOIN educational_content.modules m ON e.module_id = m.id
    WHERE m.module_code = 'MOD-03-CRITICA'
      AND e.is_active = true
      AND e.exercise_type IN ('analisis_fuentes', 'debate_digital', 'matriz_perspectivas', 'detective_textual', 'preguntas_abiertas');

    RAISE NOTICE '==============================================';
    RAISE NOTICE 'RESUMEN DE EJERCICIOS DISPONIBLES PARA TESTING';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Modulo 1 (Literal): % ejercicios', mod1_exercises;
    RAISE NOTICE 'Modulo 2 (Inferencial): % ejercicios', mod2_exercises;
    RAISE NOTICE 'Modulo 3 (Critica - solo texto): % ejercicios', mod3_text_exercises;
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Usuario de testing: student@gamilit.com';
    RAISE NOTICE 'Password: Test1234';
    RAISE NOTICE '==============================================';
END $$;

-- =====================================================
-- PARTE 5: CREAR VISTA PARA EJERCICIOS DE TEXTO M3
-- =====================================================

-- Vista para facilitar consulta de ejercicios con texto del M3
CREATE OR REPLACE VIEW educational_content.vw_module3_text_exercises AS
SELECT
    e.id,
    e.title,
    e.exercise_type,
    e.order_index,
    e.difficulty_level,
    e.max_points,
    e.description,
    LENGTH(e.objective || e.how_to_solve || e.recommended_strategy) AS text_length,
    e.is_active
FROM educational_content.exercises e
JOIN educational_content.modules m ON e.module_id = m.id
WHERE m.module_code = 'MOD-03-CRITICA'
  AND e.is_active = true
  AND e.exercise_type IN (
      'analisis_fuentes',      -- Analisis de Fuentes Historicas
      'debate_digital',        -- Debate Digital Estructurado
      'matriz_perspectivas',   -- Matriz de Perspectivas
      'detective_textual',     -- Detective Textual (si existe en M3)
      'preguntas_abiertas'     -- Preguntas Abiertas (si existe)
  )
ORDER BY e.order_index;

COMMENT ON VIEW educational_content.vw_module3_text_exercises IS
'Vista de ejercicios del Modulo 3 que contienen texto extenso. Usado para testing con student@gamilit.com';

-- =====================================================
-- FIN DEL SEED
-- =====================================================

-- Mensaje final
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'SEED DEV TESTING COMPLETADO EXITOSAMENTE';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Para probar el sistema:';
    RAISE NOTICE '  1. Login: student@gamilit.com / Test1234';
    RAISE NOTICE '  2. Acceder a Modulos 1, 2 y 3';
    RAISE NOTICE '  3. Modulo 3 muestra solo ejercicios con texto';
    RAISE NOTICE '';
    RAISE NOTICE 'Para ver ejercicios M3 con texto:';
    RAISE NOTICE '  SELECT * FROM educational_content.vw_module3_text_exercises;';
    RAISE NOTICE '';
    RAISE NOTICE '=====================================================';
END $$;
