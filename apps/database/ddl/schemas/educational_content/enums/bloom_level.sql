-- =====================================================================================
-- ENUM: educational_content.bloom_level
-- Descripcion: Niveles de la Taxonomia de Bloom en espanol para exercise_mechanic_mapping
-- Documentacion: docs/01-fase-alcance-inicial/EAI-002-actividades/especificaciones/ET-EDU-003-taxonomia-bloom.md
-- Epic: EAI-002
-- RF: RF-EDU-003
-- Gap: GAP-001 (Type Safety - bloom_level VARCHAR to ENUM)
-- Created: 2026-02-03
-- =====================================================================================

-- NOTA: Este ENUM usa valores en espanol (a diferencia de bloom_taxonomy que usa ingles)
-- para mantener consistencia con los datos existentes en exercise_mechanic_mapping

CREATE TYPE educational_content.bloom_level AS ENUM (
    'recordar',    -- Nivel 1: Recuperar informacion de la memoria (Remember)
    'comprender',  -- Nivel 2: Construir significado a partir de mensajes (Understand)
    'aplicar',     -- Nivel 3: Usar informacion en situaciones nuevas (Apply)
    'analizar',    -- Nivel 4: Descomponer en partes y encontrar relaciones (Analyze)
    'evaluar',     -- Nivel 5: Hacer juicios basados en criterios (Evaluate)
    'crear'        -- Nivel 6: Producir trabajo original o nuevo (Create)
);

COMMENT ON TYPE educational_content.bloom_level IS
'Taxonomia de Bloom (espanol): 6 niveles cognitivos para exercise_mechanic_mapping.
Valores: recordar, comprender, aplicar, analizar, evaluar, crear.
Mapea 1:1 con bloom_taxonomy (ingles) para interoperabilidad.
Documentado en ET-EDU-003. Gap: GAP-001.';
