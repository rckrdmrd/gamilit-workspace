-- =====================================================
-- Seed: educational_content.assignments (PROD)
-- Description: Assignments demo para Portal Teacher
-- Environment: PRODUCTION
-- Dependencies: auth.users (teachers)
-- Order: 05
-- Created: 2025-11-24
-- Version: 2.0 (Corregido CORR-006)
-- =====================================================
--
-- CAMBIOS v2.0:
-- - Corregida estructura para coincidir con DDL real de assignments
-- - Eliminadas referencias a tablas inexistentes (assignment_classrooms, assignment_exercises)
-- - Ajustado a columnas reales: teacher_id, title, description, assignment_type, due_date, total_points, is_published
-- - 9 assignments distribuidos en 3 módulos conceptuales
-- - Fechas variadas: past (vencidos), present (activos), future (pendientes)
-- - Tipos variados: practice, quiz, exam, homework
--
-- ASSIGNMENTS INCLUIDOS:
-- - 3 para conceptos del Módulo 1 (Comprensión Literal)
-- - 3 para conceptos del Módulo 2 (Comprensión Inferencial)
-- - 3 para conceptos del Módulo 3 (Comprensión Crítica)
--
-- TOTAL: 9 assignments demo para Portal Teacher
--
-- =====================================================

SET search_path TO educational_content, auth, public;

-- =====================================================
-- LIMPIAR DATOS EXISTENTES (SOLO DEMO)
-- =====================================================
-- Eliminar assignments del teacher demo si existen
DELETE FROM educational_content.assignments
WHERE teacher_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

-- =====================================================
-- Obtener IDs necesarios y validar dependencias
-- =====================================================

DO $$
DECLARE
    v_teacher_id UUID;
BEGIN
    -- Obtener el ID del profesor de testing
    SELECT id INTO v_teacher_id
    FROM auth.users
    WHERE email = 'teacher@gamilit.com'
    LIMIT 1;

    IF v_teacher_id IS NULL THEN
        RAISE EXCEPTION 'Teacher "teacher@gamilit.com" no encontrado. Ejecutar primero seed de auth/users.';
    END IF;

    RAISE NOTICE 'Usando teacher_id: %', v_teacher_id;

-- =====================================================
-- INSERT: 9 Assignments Demo
-- =====================================================

INSERT INTO educational_content.assignments (
    id,
    teacher_id,
    title,
    description,
    assignment_type,
    due_date,
    total_points,
    is_published,
    created_at,
    updated_at
) VALUES

-- =====================================================
-- MÓDULO 1: Comprensión Literal (3 assignments)
-- =====================================================

-- Assignment 1.1: Completado (vencido hace 7 días)
(
    gen_random_uuid(),
    v_teacher_id,
    'Tarea 1.1: Crucigrama y Vocabulario Científico',
    'Completa el crucigrama sobre términos científicos de Marie Curie y responde 5 preguntas de vocabulario. Incluye los ejercicios: Crucigrama Científico y Sopa de Letras. Esta tarea evaluará tu comprensión literal de los descubrimientos científicos de Marie Curie.',
    'homework',
    gamilit.now_mexico() - INTERVAL '7 days',  -- Vencido hace 7 días
    100,
    true,  -- Publicado
    gamilit.now_mexico() - INTERVAL '14 days',
    gamilit.now_mexico() - INTERVAL '14 days'
),

-- Assignment 1.2: Activo (vence en 2 días - URGENTE)
(
    gen_random_uuid(),
    v_teacher_id,
    'Quiz 1.2: Línea de Tiempo de Marie Curie',
    'Organiza cronológicamente los eventos más importantes de la vida de Marie Curie. Este quiz evaluará tu capacidad para identificar fechas y secuencias temporales del texto biográfico. Duración: 30 minutos.',
    'quiz',
    gamilit.now_mexico() + INTERVAL '2 days',  -- Vence en 2 días
    50,
    true,  -- Publicado
    gamilit.now_mexico() - INTERVAL '5 days',
    gamilit.now_mexico() - INTERVAL '5 days'
),

-- Assignment 1.3: Pendiente (vence en 10 días)
(
    gen_random_uuid(),
    v_teacher_id,
    'Práctica 1.3: Mapa Conceptual - Descubrimientos',
    'Crea un mapa conceptual que conecte a Marie Curie con sus descubrimientos científicos, instituciones y colaboradores. Esta práctica te permitirá visualizar las relaciones entre conceptos del módulo literal.',
    'practice',
    gamilit.now_mexico() + INTERVAL '10 days',  -- Vence en 10 días
    75,
    true,  -- Publicado
    gamilit.now_mexico() - INTERVAL '2 days',
    gamilit.now_mexico() - INTERVAL '2 days'
),

-- =====================================================
-- MÓDULO 2: Comprensión Inferencial (3 assignments)
-- =====================================================

-- Assignment 2.1: OVERDUE (vencido hace 3 días, aún publicado)
(
    gen_random_uuid(),
    v_teacher_id,
    'Tarea 2.1: Relaciones Causa-Efecto',
    'Identifica 3 relaciones causa-efecto en la vida de Marie Curie. Por ejemplo: la muerte de su madre → Marie se dedicó intensamente a los estudios. Debes encontrar al menos 3 ejemplos bien argumentados del texto.',
    'homework',
    gamilit.now_mexico() - INTERVAL '3 days',  -- OVERDUE hace 3 días
    120,
    true,  -- Publicado (aún pueden entregarla tarde)
    gamilit.now_mexico() - INTERVAL '10 days',
    gamilit.now_mexico() - INTERVAL '10 days'
),

-- Assignment 2.2: Activo (vence en 5 días)
(
    gen_random_uuid(),
    v_teacher_id,
    'Quiz 2.2: Rueda de Inferencias',
    'Resuelve 5 preguntas de inferencia sobre las motivaciones y decisiones de Marie Curie. Usa la Rueda de Inferencias para analizar contextos implícitos del texto. Duración: 45 minutos.',
    'quiz',
    gamilit.now_mexico() + INTERVAL '5 days',  -- Vence en 5 días
    100,
    true,  -- Publicado
    gamilit.now_mexico() - INTERVAL '3 days',
    gamilit.now_mexico() - INTERVAL '3 days'
),

-- Assignment 2.3: Pendiente (vence en 15 días)
(
    gen_random_uuid(),
    v_teacher_id,
    'Práctica 2.3: Análisis de Decisiones',
    'Analiza 3 decisiones importantes de Marie Curie (ejemplo: rechazar comercializar el radio) y explica las razones implícitas detrás de cada una. Usa evidencia del texto para respaldar tus inferencias.',
    'practice',
    gamilit.now_mexico() + INTERVAL '15 days',  -- Vence en 15 días
    150,
    true,  -- Publicado
    gamilit.now_mexico() - INTERVAL '1 day',
    gamilit.now_mexico() - INTERVAL '1 day'
),

-- =====================================================
-- MÓDULO 3: Comprensión Crítica (3 assignments)
-- =====================================================

-- Assignment 3.1: Activo (vence en 7 días)
(
    gen_random_uuid(),
    v_teacher_id,
    'Tarea 3.1: Ensayo Crítico - Rol de la Mujer en Ciencia',
    'Escribe un ensayo corto (300-400 palabras) sobre cómo Marie Curie desafió los roles de género de su época. Incluye 3 argumentos fundamentados en el texto y 1 reflexión personal sobre la importancia de su legado.',
    'homework',
    gamilit.now_mexico() + INTERVAL '7 days',  -- Vence en 7 días
    200,
    true,  -- Publicado
    gamilit.now_mexico() - INTERVAL '4 days',
    gamilit.now_mexico() - INTERVAL '4 days'
),

-- Assignment 3.2: Activo (vence en 3 días - URGENTE, quiz corto)
(
    gen_random_uuid(),
    v_teacher_id,
    'Quiz 3.2: Evaluación Crítica Express',
    'Quiz corto (15 minutos) con 3 preguntas de evaluación crítica sobre las decisiones éticas de Marie Curie. Ejemplo: ¿Fue correcto que no patentara el proceso de extracción del radio?',
    'quiz',
    gamilit.now_mexico() + INTERVAL '3 days',  -- Vence en 3 días
    50,
    true,  -- Publicado
    gamilit.now_mexico() - INTERVAL '1 day',
    gamilit.now_mexico() - INTERVAL '1 day'
),

-- Assignment 3.3: Pendiente (vence en 30 días - proyecto final)
(
    gen_random_uuid(),
    v_teacher_id,
    'Proyecto Final: Presentación Multimedia sobre Marie Curie',
    'Crea una presentación multimedia (video, podcast o infografía) que analice críticamente el impacto de Marie Curie en la ciencia moderna y la igualdad de género. Debe incluir: biografía, descubrimientos, obstáculos superados y legado actual. Duración: 5-7 minutos.',
    'exam',
    gamilit.now_mexico() + INTERVAL '30 days',  -- Vence en 30 días (proyecto final)
    300,
    false,  -- Borrador (aún no publicado)
    gamilit.now_mexico() - INTERVAL '1 day',
    gamilit.now_mexico() - INTERVAL '1 day'
)

ON CONFLICT (id) DO NOTHING;

END $$;

-- =====================================================
-- Verification Query
-- =====================================================

DO $$
DECLARE
    assignment_count INTEGER;
    published_count INTEGER;
    overdue_count INTEGER;
    soon_count INTEGER;
    future_count INTEGER;
BEGIN
    -- Contar assignments totales
    SELECT COUNT(*) INTO assignment_count
    FROM educational_content.assignments;

    -- Contar publicados
    SELECT COUNT(*) INTO published_count
    FROM educational_content.assignments
    WHERE is_published = true;

    -- Contar OVERDUE (vencidos y publicados)
    SELECT COUNT(*) INTO overdue_count
    FROM educational_content.assignments
    WHERE due_date < gamilit.now_mexico() AND is_published = true;

    -- Contar SOON (vencen en menos de 3 días)
    SELECT COUNT(*) INTO soon_count
    FROM educational_content.assignments
    WHERE due_date < gamilit.now_mexico() + INTERVAL '3 days'
      AND due_date > gamilit.now_mexico()
      AND is_published = true;

    -- Contar FUTURE (vencen en más de 3 días)
    SELECT COUNT(*) INTO future_count
    FROM educational_content.assignments
    WHERE due_date > gamilit.now_mexico() + INTERVAL '3 days'
      AND is_published = true;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'ASSIGNMENTS DEMO CREADOS EXITOSAMENTE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total assignments: %', assignment_count;
    RAISE NOTICE '  - Publicados: %', published_count;
    RAISE NOTICE '  - Borradores: %', assignment_count - published_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Estado de assignments publicados:';
    RAISE NOTICE '  - OVERDUE (vencidos): %', overdue_count;
    RAISE NOTICE '  - SOON (vencen <3 días): %', soon_count;
    RAISE NOTICE '  - FUTURE (vencen >3 días): %', future_count;
    RAISE NOTICE '========================================';

    IF assignment_count >= 9 THEN
        RAISE NOTICE '✓ Assignments demo creados correctamente';
    ELSE
        RAISE WARNING '⚠ Se esperaban al menos 9 assignments, se crearon %', assignment_count;
    END IF;
END $$;

-- =====================================================
-- Listado de assignments por tipo y urgencia
-- =====================================================

DO $$
DECLARE
    assignment_record RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Listado de assignments demo:';
    RAISE NOTICE '========================================';

    FOR assignment_record IN
        SELECT
            a.title,
            a.assignment_type,
            a.due_date,
            a.total_points,
            a.is_published,
            CASE
                WHEN a.due_date < gamilit.now_mexico() AND a.is_published THEN 'OVERDUE'
                WHEN a.due_date < gamilit.now_mexico() + INTERVAL '3 days' AND a.due_date > gamilit.now_mexico() THEN 'SOON'
                WHEN NOT a.is_published THEN 'DRAFT'
                ELSE 'FUTURE'
            END AS urgency,
            TO_CHAR(a.due_date, 'YYYY-MM-DD HH24:MI') AS due_formatted
        FROM educational_content.assignments a
        ORDER BY a.due_date NULLS LAST
    LOOP
        RAISE NOTICE '  [%] % - % (% pts) - Vence: %',
            assignment_record.urgency,
            assignment_record.title,
            assignment_record.assignment_type,
            assignment_record.total_points,
            COALESCE(assignment_record.due_formatted, 'Sin fecha');
    END LOOP;

    RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- FIN DEL SEED
-- =====================================================
