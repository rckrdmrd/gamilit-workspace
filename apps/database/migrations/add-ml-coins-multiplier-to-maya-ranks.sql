-- Migration: Agregar ML Coins Multiplier a Maya Ranks
-- Fecha: 2025-12-05
-- Requisito: REQ-GAM-001
-- Descripción: Agrega el campo ml_coins_multiplier a la tabla maya_ranks
--              para implementar multiplicadores de ML Coins por rango

-- ============================================================================
-- PASO 1: Agregar columna ml_coins_multiplier
-- ============================================================================

ALTER TABLE gamification_system.maya_ranks
ADD COLUMN IF NOT EXISTS ml_coins_multiplier NUMERIC(3,2) DEFAULT 1.00;

-- ============================================================================
-- PASO 2: Agregar constraint de validación
-- ============================================================================

ALTER TABLE gamification_system.maya_ranks
ADD CONSTRAINT maya_ranks_ml_coins_multiplier_check
CHECK (ml_coins_multiplier >= 1.00 AND ml_coins_multiplier <= 3.00);

-- ============================================================================
-- PASO 3: Actualizar valores según diseño v6.1
-- ============================================================================

-- Winik (Ajaw) - Nivel 1: 1.0x
UPDATE gamification_system.maya_ranks
SET ml_coins_multiplier = 1.0
WHERE rank_order = 1;

-- Aj K'iin (Nacom) - Nivel 2: 1.1x
UPDATE gamification_system.maya_ranks
SET ml_coins_multiplier = 1.1
WHERE rank_order = 2;

-- Aj Tz'ib (Ah K'in) - Nivel 3: 1.2x
UPDATE gamification_system.maya_ranks
SET ml_coins_multiplier = 1.2
WHERE rank_order = 3;

-- Aj Men (Halach Uinic) - Nivel 4: 1.3x
UPDATE gamification_system.maya_ranks
SET ml_coins_multiplier = 1.3
WHERE rank_order = 4;

-- Chilam (K'uk'ulkan) - Nivel 5: 1.4x
UPDATE gamification_system.maya_ranks
SET ml_coins_multiplier = 1.4
WHERE rank_order = 5;

-- ============================================================================
-- PASO 4: Agregar comentario a la columna
-- ============================================================================

COMMENT ON COLUMN gamification_system.maya_ranks.ml_coins_multiplier IS
'Multiplicador de ML Coins para usuarios con este rango (1.00 = 100%, 1.50 = 150%). Se aplica a todas las recompensas de ML Coins.';

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Verificar que todos los rangos tienen multiplicador asignado
SELECT
    rank_name,
    rank_order,
    display_name,
    ml_coins_multiplier,
    xp_multiplier
FROM gamification_system.maya_ranks
ORDER BY rank_order;

-- ============================================================================
-- ROLLBACK
-- ============================================================================

-- Para revertir esta migración, ejecutar:
-- ALTER TABLE gamification_system.maya_ranks DROP COLUMN IF EXISTS ml_coins_multiplier;
