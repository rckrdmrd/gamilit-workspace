-- ============================================================================
-- QUERIES ÚTILES PARA BACKEND-DEVELOPER
-- Ejercicio: Rueda de Inferencias (rueda_inferencias)
-- Fecha: 2025-11-23
-- ============================================================================

-- -----------------------------------------------------------------------------
-- 1. OBTENER EJERCICIO COMPLETO
-- -----------------------------------------------------------------------------
SELECT
  id,
  module_id,
  title,
  exercise_type,
  content,
  solution,
  config,
  max_points,
  passing_score,
  difficulty_level
FROM educational_content.exercises
WHERE exercise_type = 'rueda_inferencias';

-- -----------------------------------------------------------------------------
-- 2. EXTRAER SOLO LA ESTRUCTURA categoryExpectations
-- -----------------------------------------------------------------------------
SELECT
  exercise_type,
  title,
  jsonb_pretty(solution) as solution_structure
FROM educational_content.exercises
WHERE exercise_type = 'rueda_inferencias';

-- -----------------------------------------------------------------------------
-- 3. LISTAR TODOS LOS FRAGMENTOS CON SUS IDs
-- -----------------------------------------------------------------------------
SELECT
  'Fragment ' || (idx + 1) as fragment_number,
  frag->>'id' as fragment_id,
  LEFT(frag->>'text', 100) || '...' as text_preview
FROM educational_content.exercises,
  jsonb_array_elements(solution->'fragments') WITH ORDINALITY AS arr(frag, idx)
WHERE exercise_type = 'rueda_inferencias'
ORDER BY idx;

-- -----------------------------------------------------------------------------
-- 4. EXTRAER categoryExpectations DE UN FRAGMENTO ESPECÍFICO
-- -----------------------------------------------------------------------------
-- Ejemplo: fragment frag-1 (índice 0)
SELECT
  jsonb_pretty(solution->'fragments'->0->'categoryExpectations') as frag1_categories
FROM educational_content.exercises
WHERE exercise_type = 'rueda_inferencias';

-- -----------------------------------------------------------------------------
-- 5. LISTAR KEYWORDS POR CATEGORÍA Y FRAGMENTO
-- -----------------------------------------------------------------------------
SELECT
  'Fragment ' || (idx + 1) as fragment,
  frag->>'id' as fragment_id,
  cat.key as category,
  jsonb_array_length(cat.value->'keywords') as keywords_count,
  cat.value->'keywords' as keywords_list
FROM educational_content.exercises,
  jsonb_array_elements(solution->'fragments') WITH ORDINALITY AS arr(frag, idx),
  jsonb_each(frag->'categoryExpectations') AS cat
WHERE exercise_type = 'rueda_inferencias'
ORDER BY idx, cat.key;

-- -----------------------------------------------------------------------------
-- 6. EXTRAER UNA CATEGORÍA ESPECÍFICA DE UN FRAGMENTO
-- -----------------------------------------------------------------------------
-- Ejemplo: cat-inferencial del frag-2
SELECT
  jsonb_pretty(solution->'fragments'->1->'categoryExpectations'->'cat-inferencial')
    as frag2_inferencial
FROM educational_content.exercises
WHERE exercise_type = 'rueda_inferencias';

-- -----------------------------------------------------------------------------
-- 7. VERIFICAR PUNTOS POR CATEGORÍA
-- -----------------------------------------------------------------------------
SELECT
  'Fragment ' || (idx + 1) as fragment,
  cat.key as category,
  (cat.value->>'points')::integer as points
FROM educational_content.exercises,
  jsonb_array_elements(solution->'fragments') WITH ORDINALITY AS arr(frag, idx),
  jsonb_each(frag->'categoryExpectations') AS cat
WHERE exercise_type = 'rueda_inferencias'
ORDER BY idx, cat.key;

-- -----------------------------------------------------------------------------
-- 8. CALCULAR PUNTAJE MÁXIMO TOTAL
-- -----------------------------------------------------------------------------
SELECT
  COUNT(*) as total_categories,
  SUM((cat.value->>'points')::integer) as max_possible_score
FROM educational_content.exercises,
  jsonb_array_elements(solution->'fragments') AS frag,
  jsonb_each(frag->'categoryExpectations') AS cat
WHERE exercise_type = 'rueda_inferencias';

-- -----------------------------------------------------------------------------
-- 9. EXTRAER REGLAS DE VALIDACIÓN
-- -----------------------------------------------------------------------------
SELECT
  (solution->'validation'->>'minKeywords')::integer as min_keywords,
  (solution->'validation'->>'minLength')::integer as min_length,
  (solution->'validation'->>'maxLength')::integer as max_length
FROM educational_content.exercises
WHERE exercise_type = 'rueda_inferencias';

-- -----------------------------------------------------------------------------
-- 10. QUERY PARA VALIDACIÓN EN BACKEND
-- -----------------------------------------------------------------------------
-- Esta es la estructura que el backend debería consumir:
SELECT
  e.id as exercise_id,
  e.exercise_type,
  frag.idx as fragment_index,
  frag.data->>'id' as fragment_id,
  frag.data->>'text' as fragment_text,
  frag.data->'categoryExpectations' as category_expectations,
  e.solution->'validation' as validation_rules
FROM educational_content.exercises e,
  jsonb_array_elements(e.solution->'fragments') WITH ORDINALITY AS frag(data, idx)
WHERE e.exercise_type = 'rueda_inferencias'
ORDER BY frag.idx;

-- -----------------------------------------------------------------------------
-- 11. SIMULAR VALIDACIÓN DE RESPUESTA
-- -----------------------------------------------------------------------------
-- Ejemplo: un estudiante respondió al frag-1 con categoría 'cat-inferencial'
-- El backend debe buscar los keywords de esa categoría específica:
WITH user_response AS (
  SELECT
    'frag-1' as fragment_id,
    'cat-inferencial' as category_used,
    'El hecho de ganar dos premios Nobel sugiere que Marie tenía conocimientos excepcionales en física y química' as user_answer
)
SELECT
  ur.fragment_id,
  ur.category_used,
  ur.user_answer,
  frag.data->'categoryExpectations'->ur.category_used->'keywords' as expected_keywords,
  frag.data->'categoryExpectations'->ur.category_used->>'description' as category_description,
  frag.data->'categoryExpectations'->ur.category_used->>'example' as category_example,
  (frag.data->'categoryExpectations'->ur.category_used->>'points')::integer as max_points
FROM user_response ur
CROSS JOIN educational_content.exercises e
CROSS JOIN jsonb_array_elements(e.solution->'fragments') AS frag(data)
WHERE e.exercise_type = 'rueda_inferencias'
  AND frag.data->>'id' = ur.fragment_id;

-- -----------------------------------------------------------------------------
-- 12. QUERY PARA OBTENER TODO EL MÓDULO 2
-- -----------------------------------------------------------------------------
SELECT
  m.module_code,
  m.title as module_title,
  e.order_index,
  e.exercise_type,
  e.title as exercise_title,
  e.difficulty_level,
  e.max_points,
  e.is_active
FROM educational_content.modules m
JOIN educational_content.exercises e ON m.id = e.module_id
WHERE m.module_code = 'MOD-02-INFERENCIAL'
ORDER BY e.order_index;

-- -----------------------------------------------------------------------------
-- 13. VERIFICAR INTEGRIDAD DE DATOS
-- -----------------------------------------------------------------------------
-- Verifica que todos los fragmentos tengan las 4 categorías
WITH fragment_categories AS (
  SELECT
    e.id as exercise_id,
    frag.idx as fragment_index,
    frag.data->>'id' as fragment_id,
    COUNT(cat.key) as category_count
  FROM educational_content.exercises e,
    jsonb_array_elements(e.solution->'fragments') WITH ORDINALITY AS frag(data, idx),
    jsonb_each(frag.data->'categoryExpectations') AS cat
  WHERE e.exercise_type = 'rueda_inferencias'
  GROUP BY e.id, frag.idx, frag.data->>'id'
)
SELECT
  fragment_id,
  category_count,
  CASE
    WHEN category_count = 4 THEN '✓ OK'
    ELSE '✗ ERROR: faltan categorías'
  END as status
FROM fragment_categories
ORDER BY fragment_index;

-- -----------------------------------------------------------------------------
-- 14. EXTRAER EJEMPLO DE RESPUESTA ESPERADA POR CATEGORÍA
-- -----------------------------------------------------------------------------
-- Útil para tests unitarios del backend
SELECT
  frag.data->>'id' as fragment_id,
  cat.key as category,
  cat.value->>'example' as example_answer,
  cat.value->'keywords' as keywords_to_validate
FROM educational_content.exercises e,
  jsonb_array_elements(e.solution->'fragments') AS frag(data),
  jsonb_each(frag.data->'categoryExpectations') AS cat
WHERE e.exercise_type = 'rueda_inferencias'
ORDER BY frag.data->>'id', cat.key;

-- ============================================================================
-- NOTAS PARA BACKEND-DEVELOPER
-- ============================================================================
--
-- 1. El campo `solution` es de tipo JSONB, por lo que puedes hacer queries
--    directas con operadores como ->, ->>, #>, etc.
--
-- 2. La estructura garantizada es:
--    solution {
--      validation { minKeywords, minLength, maxLength },
--      fragments [
--        {
--          id, text,
--          categoryExpectations {
--            cat-literal {keywords[], description, example, points},
--            cat-inferencial {keywords[], description, example, points},
--            cat-critico {keywords[], description, example, points},
--            cat-creativo {keywords[], description, example, points}
--          }
--        }
--      ]
--    }
--
-- 3. Para validar una respuesta:
--    a) Obtén el fragmentId y categoryId del frontend
--    b) Extrae solution->fragments->(índice)->categoryExpectations->(categoryId)
--    c) Valida la respuesta contra keywords[], description, example
--    d) Asigna puntos según criterio (ver especificaciones líneas 386-493)
--
-- 4. Puntajes máximos:
--    - cat-literal: 20 pts
--    - cat-inferencial: 25 pts
--    - cat-critico: 30 pts
--    - cat-creativo: 25 pts
--    - Total por fragmento: 100 pts
--    - Total ejercicio (3 fragmentos): 300 pts
--
-- 5. Criterios de aprobación:
--    - passing_score: 75 pts (75% del max_points de 100)
--    - Esto es POR FRAGMENTO, no del total del ejercicio
--
-- ============================================================================
