-- =====================================================================================
-- Enum: maya_rank
-- Schema: gamification_system
-- Description: Rangos del sistema de gamificación inspirados en jerarquía Maya
-- Versión: 1.0 (2025-11-03)
-- =====================================================================================

CREATE TYPE gamification_system.maya_rank AS ENUM (
    'Ajaw',           -- Nivel 1: Señor o gobernante, líder supremo (0-999 XP)
    'Nacom',          -- Nivel 2: Capitán de guerra, comandante militar (1,000-2,999 XP)
    'Ah K''in',       -- Nivel 3: Sacerdote del sol, guía espiritual (3,000-5,999 XP)
    'Halach Uinic',   -- Nivel 4: Hombre verdadero, líder político (6,000-9,999 XP)
    'K''uk''ulkan'    -- Nivel 5: Serpiente emplumada, nivel legendario (10,000+ XP)
);

-- =====================================================================================
-- Comments
-- =====================================================================================

COMMENT ON TYPE maya_rank IS
    'Rangos del sistema de gamificación Maya (V1.0 - 2025-11-03). '
    'Progresión: Ajaw (inicial) → K''uk''ulkan (máximo). '
    'Basado en la jerarquía militar maya histórica con valor pedagógico cultural.';

-- =====================================================================================
-- Orden de Progresión
-- =====================================================================================
--
-- 1. Ajaw          - "Señor" - Líder supremo, inicio del camino
-- 2. Nacom         - "Capitán de Guerra" - Comandante militar respetado
-- 3. Ah K'in       - "Sacerdote del Sol" - Guía espiritual y guerrero
-- 4. Halach Uinic  - "Hombre Verdadero" - Líder político y militar
-- 5. K'uk'ulkan    - "Serpiente Emplumada" - Deidad, nivel legendario
--
-- Nota: Los apóstrofes en "Ah K'in" y "K'uk'ulkan" están escapados con '' para PostgreSQL
--
-- =====================================================================================
-- Referencias
-- =====================================================================================
--
-- - Documentación: /docs/02-especificaciones-tecnicas/apis/gamificacion-api/01-RANGOS-MAYA.md
-- - ADR-004: Gamification System Design
-- - Fuentes históricas: Thompson (1954), Sharer & Traxler (2006)
--
-- =====================================================================================
-- Changelog
-- =====================================================================================
--
-- 2025-11-03: Creación inicial del enum (homologación de rangos legacy)
--             Anterior: nacom, batab, holcatte, guerrero, mercenario (legacy)
--             Nuevo: Ajaw, Nacom, Ah K'in, Halach Uinic, K'uk'ulkan (correcto)
--
-- =====================================================================================
