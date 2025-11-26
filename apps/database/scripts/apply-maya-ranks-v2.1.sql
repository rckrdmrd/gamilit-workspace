-- =====================================================
-- Script de Actualización: Maya Ranks v2.0 → v2.1
-- =====================================================
-- Descripción: Actualiza umbrales XP de rangos maya para hacer K'uk'ulkan
--              alcanzable con M1-M3 (1,950 XP disponibles)
-- Fecha: 2025-11-24
-- Versión destino: v2.1
-- Uso: psql -d gamilit_platform -f apply-maya-ranks-v2.1.sql
-- =====================================================

\echo '=================================================='
\echo 'ACTUALIZACIÓN MAYA RANKS v2.0 → v2.1'
\echo '=================================================='
\echo ''

-- Verificar versión actual
\echo 'Estado actual de rangos:'
SELECT
    rank_name,
    min_xp_required,
    max_xp_threshold,
    updated_at
FROM gamification_system.maya_ranks
WHERE rank_name IN ('Halach Uinic', 'K''uk''ulkan')
ORDER BY rank_order;

\echo ''
\echo 'Aplicando cambios...'

-- Actualizar Halach Uinic
UPDATE gamification_system.maya_ranks
SET
    max_xp_threshold = 1899,
    updated_at = gamilit.now_mexico()
WHERE rank_name = 'Halach Uinic'
  AND max_xp_threshold = 2249;

-- Actualizar K'uk'ulkan
UPDATE gamification_system.maya_ranks
SET
    min_xp_required = 1900,
    updated_at = gamilit.now_mexico()
WHERE rank_name = 'K''uk''ulkan'
  AND min_xp_required = 2250;

\echo 'Cambios aplicados.'
\echo ''

-- Verificar cambios
\echo 'Estado actualizado de rangos (v2.1):'
SELECT
    rank_name,
    min_xp_required,
    max_xp_threshold,
    updated_at
FROM gamification_system.maya_ranks
WHERE rank_name IN ('Halach Uinic', 'K''uk''ulkan')
ORDER BY rank_order;

\echo ''
\echo 'Distribución completa v2.1:'
SELECT
    rank_order,
    rank_name,
    min_xp_required || ' - ' || COALESCE(max_xp_threshold::text, '∞') AS rango_xp,
    ml_coins_bonus,
    xp_multiplier
FROM gamification_system.maya_ranks
ORDER BY rank_order;

\echo ''
\echo '=================================================='
\echo '✅ ACTUALIZACIÓN COMPLETADA'
\echo '=================================================='
\echo ''
\echo 'Cambios aplicados:'
\echo '  • Halach Uinic max_xp_threshold: 2249 → 1899'
\echo '  • K''uk''ulkan min_xp_required: 2250 → 1900'
\echo ''
\echo 'Resultado:'
\echo '  ✅ K''uk''ulkan ahora alcanzable con M1-M3 (1,950 XP)'
\echo '=================================================='
