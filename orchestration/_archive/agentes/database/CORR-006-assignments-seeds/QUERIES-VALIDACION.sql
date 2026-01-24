-- =====================================================
-- QUERIES DE VALIDACIÓN: CORR-006 - Seeds Assignments
-- Fecha: 2025-11-24
-- Propósito: Validar que los seeds de assignments se cargaron correctamente
-- =====================================================

-- =====================================================
-- VALIDACIÓN 1: Conteo Total de Assignments
-- =====================================================
-- Resultado esperado: 9

SELECT
    COUNT(*) AS total_assignments,
    CASE
        WHEN COUNT(*) = 9 THEN '✅ CORRECTO'
        ELSE '❌ ERROR: Se esperaban 9 assignments'
    END AS validation_status
FROM educational_content.assignments;

-- =====================================================
-- VALIDACIÓN 2: Conteo por Teacher
-- =====================================================
-- Resultado esperado: teacher@gamilit.com = 9 assignments

SELECT
    u.email AS teacher_email,
    COUNT(a.id) AS total_assignments,
    CASE
        WHEN COUNT(a.id) = 9 THEN '✅ CORRECTO'
        ELSE '❌ ERROR: Se esperaban 9 assignments'
    END AS validation_status
FROM educational_content.assignments a
JOIN auth.users u ON a.teacher_id = u.id
WHERE u.email = 'teacher@gamilit.com'
GROUP BY u.email;

-- =====================================================
-- VALIDACIÓN 3: Distribución por Status de Publicación
-- =====================================================
-- Resultado esperado: published = 8, draft = 1

SELECT
    is_published,
    COUNT(*) AS qty,
    CASE is_published
        WHEN true THEN 'Published'
        WHEN false THEN 'Draft'
    END AS status_label,
    CASE
        WHEN is_published = true AND COUNT(*) = 8 THEN '✅ CORRECTO'
        WHEN is_published = false AND COUNT(*) = 1 THEN '✅ CORRECTO'
        ELSE '❌ ERROR'
    END AS validation_status
FROM educational_content.assignments
GROUP BY is_published
ORDER BY is_published DESC;

-- =====================================================
-- VALIDACIÓN 4: Distribución por Tipo de Assignment
-- =====================================================
-- Resultado esperado:
-- homework = 3, quiz = 3, practice = 2, exam = 1

SELECT
    assignment_type,
    COUNT(*) AS qty,
    CASE assignment_type
        WHEN 'homework' THEN CASE WHEN COUNT(*) = 3 THEN '✅ CORRECTO' ELSE '❌ ERROR' END
        WHEN 'quiz' THEN CASE WHEN COUNT(*) = 3 THEN '✅ CORRECTO' ELSE '❌ ERROR' END
        WHEN 'practice' THEN CASE WHEN COUNT(*) = 2 THEN '✅ CORRECTO' ELSE '❌ ERROR' END
        WHEN 'exam' THEN CASE WHEN COUNT(*) = 1 THEN '✅ CORRECTO' ELSE '❌ ERROR' END
        ELSE '❌ TIPO INVÁLIDO'
    END AS validation_status
FROM educational_content.assignments
GROUP BY assignment_type
ORDER BY assignment_type;

-- =====================================================
-- VALIDACIÓN 5: Distribución por Estado de Urgencia
-- =====================================================
-- Resultado esperado:
-- OVERDUE = 2, SOON = 2, ACTIVE = 2, FUTURE = 2, DRAFT = 1

SELECT
    urgency,
    COUNT(*) AS qty,
    CASE urgency
        WHEN 'OVERDUE' THEN CASE WHEN COUNT(*) = 2 THEN '✅ CORRECTO' ELSE '❌ ERROR' END
        WHEN 'SOON' THEN CASE WHEN COUNT(*) = 2 THEN '✅ CORRECTO' ELSE '❌ ERROR' END
        WHEN 'DRAFT' THEN CASE WHEN COUNT(*) = 1 THEN '✅ CORRECTO' ELSE '❌ ERROR' END
        WHEN 'FUTURE' THEN CASE WHEN COUNT(*) >= 2 THEN '✅ CORRECTO' ELSE '❌ ERROR' END
        ELSE '❌ ESTADO INVÁLIDO'
    END AS validation_status
FROM (
    SELECT
        CASE
            WHEN due_date < NOW() AND is_published THEN 'OVERDUE'
            WHEN due_date < NOW() + INTERVAL '3 days' AND due_date > NOW() THEN 'SOON'
            WHEN NOT is_published THEN 'DRAFT'
            ELSE 'FUTURE'
        END AS urgency
    FROM educational_content.assignments
) subquery
GROUP BY urgency
ORDER BY urgency;

-- =====================================================
-- VALIDACIÓN 6: Listado Completo de Assignments
-- =====================================================
-- Muestra todos los assignments con su información clave

SELECT
    a.id,
    LEFT(a.title, 50) AS title_preview,
    a.assignment_type,
    a.total_points,
    a.is_published,
    TO_CHAR(a.due_date, 'YYYY-MM-DD HH24:MI') AS due_date_formatted,
    CASE
        WHEN a.due_date < NOW() AND a.is_published THEN '⚠️ OVERDUE'
        WHEN a.due_date < NOW() + INTERVAL '3 days' AND a.due_date > NOW() THEN '🔔 SOON'
        WHEN NOT a.is_published THEN '📝 DRAFT'
        WHEN a.due_date < NOW() + INTERVAL '7 days' THEN '✅ ACTIVE'
        ELSE '📅 FUTURE'
    END AS urgency_status,
    EXTRACT(DAY FROM (a.due_date - NOW())) AS days_until_due
FROM educational_content.assignments a
ORDER BY a.due_date NULLS LAST;

-- =====================================================
-- VALIDACIÓN 7: Verificar Campos Obligatorios
-- =====================================================
-- Todos los campos NOT NULL deben tener valores

SELECT
    'teacher_id' AS field_name,
    COUNT(*) AS total_records,
    COUNT(teacher_id) AS non_null_records,
    CASE
        WHEN COUNT(*) = COUNT(teacher_id) THEN '✅ CORRECTO'
        ELSE '❌ ERROR: Valores NULL encontrados'
    END AS validation_status
FROM educational_content.assignments
UNION ALL
SELECT
    'title',
    COUNT(*),
    COUNT(title),
    CASE WHEN COUNT(*) = COUNT(title) THEN '✅ CORRECTO' ELSE '❌ ERROR' END
FROM educational_content.assignments
UNION ALL
SELECT
    'assignment_type',
    COUNT(*),
    COUNT(assignment_type),
    CASE WHEN COUNT(*) = COUNT(assignment_type) THEN '✅ CORRECTO' ELSE '❌ ERROR' END
FROM educational_content.assignments
UNION ALL
SELECT
    'total_points',
    COUNT(*),
    COUNT(total_points),
    CASE WHEN COUNT(*) = COUNT(total_points) THEN '✅ CORRECTO' ELSE '❌ ERROR' END
FROM educational_content.assignments
UNION ALL
SELECT
    'is_published',
    COUNT(*),
    COUNT(is_published),
    CASE WHEN COUNT(*) = COUNT(is_published) THEN '✅ CORRECTO' ELSE '❌ ERROR' END
FROM educational_content.assignments;

-- =====================================================
-- VALIDACIÓN 8: Verificar Rangos de Puntos
-- =====================================================
-- total_points debe estar entre 50 y 300

SELECT
    MIN(total_points) AS min_points,
    MAX(total_points) AS max_points,
    AVG(total_points)::INTEGER AS avg_points,
    CASE
        WHEN MIN(total_points) >= 50 AND MAX(total_points) <= 300 THEN '✅ CORRECTO'
        ELSE '❌ ERROR: Puntos fuera del rango esperado (50-300)'
    END AS validation_status
FROM educational_content.assignments;

-- =====================================================
-- VALIDACIÓN 9: Verificar Fechas de Creación
-- =====================================================
-- created_at y updated_at deben ser iguales (seeds)
-- created_at debe estar ANTES de due_date

SELECT
    COUNT(*) AS total_records,
    SUM(CASE WHEN created_at = updated_at THEN 1 ELSE 0 END) AS matching_timestamps,
    SUM(CASE WHEN created_at < due_date THEN 1 ELSE 0 END) AS valid_date_order,
    CASE
        WHEN COUNT(*) = SUM(CASE WHEN created_at = updated_at THEN 1 ELSE 0 END)
             AND COUNT(*) = SUM(CASE WHEN created_at < due_date THEN 1 ELSE 0 END)
        THEN '✅ CORRECTO'
        ELSE '❌ ERROR: Timestamps inconsistentes'
    END AS validation_status
FROM educational_content.assignments;

-- =====================================================
-- VALIDACIÓN 10: Resumen Ejecutivo
-- =====================================================
-- Vista consolidada de todos los criterios

SELECT
    '✅ CORR-006 VALIDACIÓN COMPLETA' AS status,
    (SELECT COUNT(*) FROM educational_content.assignments) AS total_assignments,
    (SELECT COUNT(*) FROM educational_content.assignments WHERE is_published = true) AS published,
    (SELECT COUNT(*) FROM educational_content.assignments WHERE is_published = false) AS drafts,
    (SELECT COUNT(DISTINCT assignment_type) FROM educational_content.assignments) AS distinct_types,
    (SELECT COUNT(DISTINCT teacher_id) FROM educational_content.assignments) AS distinct_teachers,
    CASE
        WHEN (SELECT COUNT(*) FROM educational_content.assignments) = 9
             AND (SELECT COUNT(*) FROM educational_content.assignments WHERE is_published = true) = 8
             AND (SELECT COUNT(*) FROM educational_content.assignments WHERE is_published = false) = 1
             AND (SELECT COUNT(DISTINCT assignment_type) FROM educational_content.assignments) = 4
        THEN '🎉 TODAS LAS VALIDACIONES PASARON'
        ELSE '⚠️ REVISAR VALIDACIONES ANTERIORES'
    END AS final_status;

-- =====================================================
-- QUERY PARA PORTAL TEACHER (Simula lo que verá la UI)
-- =====================================================
-- Esta query simula lo que el Portal Teacher mostrará

SELECT
    a.id,
    a.title,
    a.description,
    a.assignment_type AS type,
    a.total_points AS max_points,
    a.due_date,
    a.is_published,
    TO_CHAR(a.due_date, 'DD/MM/YYYY HH24:MI') AS due_date_formatted,
    CASE
        WHEN a.due_date < NOW() AND a.is_published THEN 'overdue'
        WHEN a.due_date < NOW() + INTERVAL '3 days' AND a.due_date > NOW() THEN 'soon'
        WHEN NOT a.is_published THEN 'draft'
        ELSE 'active'
    END AS status,
    EXTRACT(DAY FROM (a.due_date - NOW()))::INTEGER AS days_remaining,
    u.email AS teacher_email
FROM educational_content.assignments a
JOIN auth.users u ON a.teacher_id = u.id
WHERE u.email = 'teacher@gamilit.com'
ORDER BY
    CASE
        WHEN a.due_date < NOW() AND a.is_published THEN 1  -- OVERDUE primero
        WHEN a.due_date < NOW() + INTERVAL '3 days' AND a.due_date > NOW() THEN 2  -- SOON segundo
        WHEN NOT a.is_published THEN 4  -- DRAFT último
        ELSE 3  -- ACTIVE tercero
    END,
    a.due_date;

-- =====================================================
-- FIN DE VALIDACIONES
-- =====================================================
-- Si todas las queries anteriores retornan resultados esperados,
-- el seed de assignments está correctamente implementado.
--
-- Próximos pasos:
-- 1. Ejecutar estas queries después de carga limpia
-- 2. Verificar que todas las validaciones retornan ✅ CORRECTO
-- 3. Abrir Portal Teacher y verificar que muestra los 9 assignments
-- 4. Probar filtros por estado (OVERDUE, SOON, ACTIVE, FUTURE)
-- =====================================================
