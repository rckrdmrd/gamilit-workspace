-- =====================================================
-- Seed Data: Achievement Categories (PRODUCTION)
-- =====================================================
-- Description: Categorías de logros del sistema de gamificación
-- Environment: PRODUCTION
-- Records: 9 (sincronizado con ENUM achievement_category v1.1)
-- Date: 2025-11-02
-- Updated: 2026-01-18 (CORR-P2-SEED-001)
-- Migrated by: SA-SEEDS-GAM-01
-- =====================================================
-- CORR-P2-SEED-001: Sincronizado con DDL achievement_category ENUM v1.1
-- Categorías del ENUM: progress, streak, completion, social, special,
--                      mastery, exploration, collection, hidden
-- =====================================================

SET search_path TO gamification_system, public;

-- =====================================================
-- CATEGORÍAS DE LOGROS (CONFIGURACIÓN ESENCIAL)
-- Sincronizado con gamification_system.achievement_category ENUM v1.1
-- =====================================================

INSERT INTO gamification_system.achievement_categories (
    name,
    description,
    icon_url,
    display_order,
    is_active
) VALUES
    -- Categorías originales (ENUM v1.0)
    ('progress', 'Logros relacionados con el avance general del estudiante', '🎯', 1, true),
    ('streak', 'Logros de días consecutivos de actividad', '🔥', 2, true),
    ('completion', 'Logros de finalización de módulos y ejercicios', '✅', 3, true),
    ('social', 'Logros de colaboración e interacción', '👥', 4, true),
    ('special', 'Logros únicos y eventos especiales', '⭐', 5, true),
    ('mastery', 'Logros de dominio y habilidades avanzadas', '👑', 6, true),
    ('exploration', 'Logros de descubrimiento de contenido', '🔍', 7, true),
    -- Categorías nuevas (ENUM v1.1 - 2025-12-15)
    ('collection', 'Logros de colección de items y badges', '🏆', 8, true),
    ('hidden', 'Logros ocultos/secretos hasta ser desbloqueados', '🔒', 9, true)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    icon_url = EXCLUDED.icon_url,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active,
    updated_at = gamilit.now_mexico();

-- =====================================================
-- MIGRACIÓN: Renombrar categorías legacy a nombres ENUM
-- Esto asegura que datos existentes con nombres en español
-- sean actualizados a los nombres del ENUM
-- =====================================================

UPDATE gamification_system.achievement_categories
SET name = 'progress', updated_at = gamilit.now_mexico()
WHERE name = 'Progreso';

UPDATE gamification_system.achievement_categories
SET name = 'streak', updated_at = gamilit.now_mexico()
WHERE name = 'Racha';

UPDATE gamification_system.achievement_categories
SET name = 'completion', updated_at = gamilit.now_mexico()
WHERE name = 'Completación';

UPDATE gamification_system.achievement_categories
SET name = 'mastery', updated_at = gamilit.now_mexico()
WHERE name = 'Maestría';

UPDATE gamification_system.achievement_categories
SET name = 'exploration', updated_at = gamilit.now_mexico()
WHERE name = 'Exploración';

UPDATE gamification_system.achievement_categories
SET name = 'social', updated_at = gamilit.now_mexico()
WHERE name = 'Social';

UPDATE gamification_system.achievement_categories
SET name = 'special', updated_at = gamilit.now_mexico()
WHERE name = 'Especial';

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

SELECT
    'Achievement Categories (Production v1.1)' AS seed_name,
    COUNT(*) AS records_inserted
FROM gamification_system.achievement_categories;

-- =====================================================
-- MIGRATION NOTES
-- =====================================================
-- CORRECCIONES APLICADAS:
-- 1. Cambiado 'icon' → 'icon_url' (compatibilidad con DDL)
-- 2. Cambiado 'sort_order' → 'display_order' (compatibilidad con DDL)
-- 3. Eliminados IDs hardcodeados, ahora autogenerados (gen_random_uuid)
-- 4. Agregada categoría 'Racha' (faltaba en backup original)
-- 5. Agregada categoría 'Maestría' (faltaba en backup original)
-- 6. Agregada categoría 'Especial' (faltaba en backup original)
-- 7. Uso de ON CONFLICT seguro para production
-- 8. CORR-P2-SEED-001 (2026-01-18): Sincronizado con ENUM v1.1
--    - Nombres cambiados de español a inglés (match ENUM)
--    - Agregadas categorías: collection, hidden
--    - Total: 9 categorías (= 9 valores del ENUM)
-- =====================================================
