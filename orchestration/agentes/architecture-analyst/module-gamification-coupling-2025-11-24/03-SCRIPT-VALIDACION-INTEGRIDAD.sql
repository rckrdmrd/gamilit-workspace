-- =====================================================
-- SCRIPT DE VALIDACIÓN DE INTEGRIDAD REFERENCIAL
-- Módulos vs Gamificación
-- =====================================================
-- Fecha: 2025-11-24
-- Propósito: Detectar inconsistencias causadas por
--            correcciones en módulos educativos
-- =====================================================

-- Configuración
\timing on
\echo '=================================================='
\echo 'VALIDACIÓN DE INTEGRIDAD REFERENCIAL'
\echo 'Módulos Educativos vs Sistema de Gamificación'
\echo '=================================================='
\echo ''

-- =====================================================
-- SECCIÓN 1: EXERCISE_ATTEMPTS HUÉRFANOS
-- =====================================================
\echo '1. EXERCISE_ATTEMPTS con exercise_id inválido'
\echo '---------------------------------------------'

SELECT
    COUNT(*) as total_attempts_huerfanos,
    COUNT(DISTINCT user_id) as usuarios_afectados,
    COUNT(DISTINCT exercise_id) as ejercicios_inexistentes
FROM progress_tracking.exercise_attempts ea
WHERE NOT EXISTS (
    SELECT 1
    FROM educational_content.exercises e
    WHERE e.id = ea.exercise_id
);

-- Detalle de ejercicios inexistentes
\echo ''
\echo 'Detalle de exercise_id inexistentes:'
SELECT
    ea.exercise_id,
    COUNT(*) as cantidad_attempts,
    COUNT(DISTINCT ea.user_id) as usuarios_afectados,
    MIN(ea.created_at) as primer_attempt,
    MAX(ea.created_at) as ultimo_attempt
FROM progress_tracking.exercise_attempts ea
WHERE NOT EXISTS (
    SELECT 1
    FROM educational_content.exercises e
    WHERE e.id = ea.exercise_id
)
GROUP BY ea.exercise_id
ORDER BY cantidad_attempts DESC
LIMIT 10;

\echo ''

-- =====================================================
-- SECCIÓN 2: EXERCISE_SUBMISSIONS HUÉRFANOS
-- =====================================================
\echo '2. EXERCISE_SUBMISSIONS con exercise_id inválido'
\echo '-----------------------------------------------'

SELECT
    COUNT(*) as total_submissions_huerfanos,
    COUNT(DISTINCT user_id) as usuarios_afectados,
    COUNT(DISTINCT exercise_id) as ejercicios_inexistentes
FROM progress_tracking.exercise_submissions es
WHERE NOT EXISTS (
    SELECT 1
    FROM educational_content.exercises e
    WHERE e.id = es.exercise_id
);

-- Submissions en estado crítico (graded/reviewed pero exercise no existe)
\echo ''
\echo 'Submissions calificados sin ejercicio válido:'
SELECT
    es.exercise_id,
    es.status,
    COUNT(*) as cantidad,
    AVG(es.score) as score_promedio
FROM progress_tracking.exercise_submissions es
WHERE es.status IN ('graded', 'reviewed')
  AND NOT EXISTS (
      SELECT 1
      FROM educational_content.exercises e
      WHERE e.id = es.exercise_id
  )
GROUP BY es.exercise_id, es.status;

\echo ''

-- =====================================================
-- SECCIÓN 3: MODULE_PROGRESS HUÉRFANO
-- =====================================================
\echo '3. MODULE_PROGRESS con module_id inválido'
\echo '----------------------------------------'

SELECT
    COUNT(*) as total_progress_huerfano,
    COUNT(DISTINCT user_id) as usuarios_afectados,
    COUNT(DISTINCT module_id) as modulos_inexistentes
FROM progress_tracking.module_progress mp
WHERE NOT EXISTS (
    SELECT 1
    FROM educational_content.modules m
    WHERE m.id = mp.module_id
);

-- Detalle
SELECT
    mp.module_id,
    COUNT(*) as usuarios_con_progreso,
    AVG(mp.completion_percentage) as progreso_promedio
FROM progress_tracking.module_progress mp
WHERE NOT EXISTS (
    SELECT 1
    FROM educational_content.modules m
    WHERE m.id = mp.module_id
)
GROUP BY mp.module_id;

\echo ''

-- =====================================================
-- SECCIÓN 4: COMODIN_USAGE_TRACKING SIN FK
-- =====================================================
\echo '4. COMODIN_USAGE_TRACKING con exercise_id inválido'
\echo '-------------------------------------------------'

SELECT
    COUNT(*) as total_comodines_huerfanos,
    COUNT(DISTINCT user_id) as usuarios_afectados,
    COUNT(DISTINCT exercise_id) as ejercicios_inexistentes
FROM gamification_system.comodin_usage_tracking cut
WHERE exercise_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM educational_content.exercises e
      WHERE e.id = cut.exercise_id
  );

-- Detalle por tipo de comodín
\echo ''
\echo 'Por tipo de comodín:'
SELECT
    cut.comodin_type,
    COUNT(*) as cantidad_huerfanos
FROM gamification_system.comodin_usage_tracking cut
WHERE exercise_id IS NOT NULL
  AND NOT EXISTS (
      SELECT 1
      FROM educational_content.exercises e
      WHERE e.id = cut.exercise_id
  )
GROUP BY cut.comodin_type;

\echo ''

-- =====================================================
-- SECCIÓN 5: INCONSISTENCIAS EN USER_STATS
-- =====================================================
\echo '5. INCONSISTENCIAS en gamification_system.user_stats'
\echo '---------------------------------------------------'

-- Usuarios con XP pero sin attempts
SELECT
    COUNT(*) as usuarios_xp_sin_attempts
FROM gamification_system.user_stats us
WHERE us.total_xp > 0
  AND NOT EXISTS (
      SELECT 1
      FROM progress_tracking.exercise_attempts ea
      WHERE ea.user_id = us.user_id
  );

\echo ''

-- Usuarios con stats desincronizados
\echo 'Usuarios con total_xp != suma de attempts:'
SELECT
    us.user_id,
    us.total_xp as xp_en_user_stats,
    COALESCE(SUM(ea.xp_earned), 0) as xp_en_attempts,
    (us.total_xp - COALESCE(SUM(ea.xp_earned), 0)) as diferencia
FROM gamification_system.user_stats us
LEFT JOIN progress_tracking.exercise_attempts ea ON ea.user_id = us.user_id
GROUP BY us.user_id, us.total_xp
HAVING us.total_xp != COALESCE(SUM(ea.xp_earned), 0)
ORDER BY ABS(us.total_xp - COALESCE(SUM(ea.xp_earned), 0)) DESC
LIMIT 10;

\echo ''

-- =====================================================
-- SECCIÓN 6: MÓDULOS CON STATUS INCONSISTENTE
-- =====================================================
\echo '6. MÓDULOS con status vs is_published inconsistente'
\echo '---------------------------------------------------'

SELECT
    id,
    title,
    status,
    is_published,
    CASE
        WHEN status = 'published' AND is_published = false THEN 'INCONSISTENTE: published pero is_published=false'
        WHEN status != 'published' AND is_published = true THEN 'INCONSISTENTE: no published pero is_published=true'
        ELSE 'OK'
    END as estado_consistencia
FROM educational_content.modules
WHERE (status = 'published' AND is_published = false)
   OR (status != 'published' AND is_published = true);

\echo ''

-- =====================================================
-- SECCIÓN 7: EJERCICIOS INACTIVOS EN MÓDULOS ACTIVOS
-- =====================================================
\echo '7. EJERCICIOS inactivos en módulos publicados'
\echo '--------------------------------------------'

SELECT
    m.title as modulo,
    m.status as modulo_status,
    m.is_published as modulo_published,
    COUNT(*) as ejercicios_inactivos
FROM educational_content.exercises e
JOIN educational_content.modules m ON e.module_id = m.id
WHERE m.status = 'published'
  AND m.is_published = true
  AND e.is_active = false
GROUP BY m.id, m.title, m.status, m.is_published
ORDER BY ejercicios_inactivos DESC;

\echo ''

-- =====================================================
-- SECCIÓN 8: CÁLCULO DE PROGRESO CON DIVISIÓN POR 0
-- =====================================================
\echo '8. MÓDULOS sin ejercicios activos (división por 0)'
\echo '-------------------------------------------------'

SELECT
    m.id,
    m.title,
    m.status,
    COUNT(e.id) FILTER (WHERE e.is_active = true) as ejercicios_activos,
    COUNT(e.id) as total_ejercicios
FROM educational_content.modules m
LEFT JOIN educational_content.exercises e ON e.module_id = m.id
WHERE m.is_published = true
GROUP BY m.id, m.title, m.status
HAVING COUNT(e.id) FILTER (WHERE e.is_active = true) = 0
ORDER BY m.order_index;

\echo ''

-- =====================================================
-- SECCIÓN 9: RESUMEN GENERAL
-- =====================================================
\echo '=================================================='
\echo 'RESUMEN DE INTEGRIDAD'
\echo '=================================================='

WITH integrity_summary AS (
    SELECT
        'exercise_attempts' as tabla,
        COUNT(*) as registros_huerfanos
    FROM progress_tracking.exercise_attempts ea
    WHERE NOT EXISTS (
        SELECT 1 FROM educational_content.exercises e WHERE e.id = ea.exercise_id
    )

    UNION ALL

    SELECT
        'exercise_submissions',
        COUNT(*)
    FROM progress_tracking.exercise_submissions es
    WHERE NOT EXISTS (
        SELECT 1 FROM educational_content.exercises e WHERE e.id = es.exercise_id
    )

    UNION ALL

    SELECT
        'module_progress',
        COUNT(*)
    FROM progress_tracking.module_progress mp
    WHERE NOT EXISTS (
        SELECT 1 FROM educational_content.modules m WHERE m.id = mp.module_id
    )

    UNION ALL

    SELECT
        'comodin_usage_tracking',
        COUNT(*)
    FROM gamification_system.comodin_usage_tracking cut
    WHERE exercise_id IS NOT NULL
      AND NOT EXISTS (
          SELECT 1 FROM educational_content.exercises e WHERE e.id = cut.exercise_id
      )
)
SELECT
    tabla,
    registros_huerfanos,
    CASE
        WHEN registros_huerfanos = 0 THEN '✅ OK'
        WHEN registros_huerfanos < 10 THEN '⚠️ ATENCIÓN'
        ELSE '❌ CRÍTICO'
    END as estado
FROM integrity_summary
ORDER BY registros_huerfanos DESC;

\echo ''

-- =====================================================
-- SECCIÓN 10: EJERCICIOS MODIFICADOS RECIENTEMENTE
-- =====================================================
\echo '10. EJERCICIOS modificados en últimas 48 horas'
\echo '---------------------------------------------'

SELECT
    e.id,
    e.title,
    m.title as modulo,
    e.is_active,
    e.updated_at,
    (NOW() - e.updated_at) as tiempo_desde_modificacion
FROM educational_content.exercises e
JOIN educational_content.modules m ON e.module_id = m.id
WHERE e.updated_at > NOW() - INTERVAL '48 hours'
ORDER BY e.updated_at DESC;

\echo ''

-- =====================================================
-- SECCIÓN 11: QUERIES DE LIMPIEZA (OPCIONAL)
-- =====================================================
\echo '=================================================='
\echo 'QUERIES DE LIMPIEZA (NO EJECUTAR - SOLO REFERENCIA)'
\echo '=================================================='
\echo ''
\echo '-- Limpiar exercise_attempts huérfanos:'
\echo '-- DELETE FROM progress_tracking.exercise_attempts'
\echo '-- WHERE exercise_id NOT IN (SELECT id FROM educational_content.exercises);'
\echo ''
\echo '-- Limpiar exercise_submissions huérfanos:'
\echo '-- DELETE FROM progress_tracking.exercise_submissions'
\echo '-- WHERE exercise_id NOT IN (SELECT id FROM educational_content.exercises);'
\echo ''
\echo '-- Limpiar comodin_usage_tracking huérfanos:'
\echo '-- UPDATE gamification_system.comodin_usage_tracking'
\echo '-- SET exercise_id = NULL'
\echo '-- WHERE exercise_id NOT IN (SELECT id FROM educational_content.exercises);'
\echo ''

\echo '=================================================='
\echo 'FIN DE VALIDACIÓN'
\echo '=================================================='

-- Restaurar configuración
\timing off
