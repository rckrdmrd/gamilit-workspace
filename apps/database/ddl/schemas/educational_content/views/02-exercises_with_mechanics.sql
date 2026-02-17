-- ============================================================================
-- Vista: educational_content.exercises_with_mechanics
-- Description: Helper view combining exercises with their pedagogical categories
-- Dependencies: educational_content.exercises, educational_content.exercise_mechanic_mappings
-- Extracted from: tables/21-exercise_mechanic_mapping.sql
-- ============================================================================

CREATE OR REPLACE VIEW educational_content.exercises_with_mechanics AS
SELECT
    -- Campos de exercises
    e.id,
    e.module_id,
    e.exercise_type,
    e.title,
    e.description,
    e.difficulty_level,
    e.estimated_time_minutes,
    e.content,
    e.ml_coins_reward,
    e.xp_reward,
    e.order_index,
    e.is_active AS exercise_is_active,
    e.created_at AS exercise_created_at,
    e.updated_at AS exercise_updated_at,

    -- Campos de exercise_mechanic_mappings
    m.id AS mapping_id,
    m.mechanic_category,
    m.mechanic_subcategory,
    m.bloom_level,
    m.cefr_level AS mechanic_cefr_levels,
    m.pedagogical_purpose,
    m.learning_objectives,
    m.interaction_type,
    m.cognitive_load,
    m.tags AS mechanic_tags
FROM
    educational_content.exercises e
LEFT JOIN
    educational_content.exercise_mechanic_mappings m
    ON e.exercise_type = m.exercise_type
    AND m.is_active = true
WHERE
    e.is_active = true;

COMMENT ON VIEW educational_content.exercises_with_mechanics IS
'Vista helper que combina exercises con sus categorías pedagógicas del Sistema Dual.
Facilita queries de profesores para buscar ejercicios por competencia pedagógica.
Solo incluye exercises activos y mappings activos.';
