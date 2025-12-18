# PLAN DE IMPLEMENTACIÓN: Corrección Ejercicio 5 Módulo 2

**Fecha:** 2025-12-15
**Rol:** Tech Leader
**Proyecto:** Gamilit
**Referencia:** ANALISIS-EJERCICIO-M2E5-M3-2025-12-15.md

---

## RESUMEN EJECUTIVO

**Problema:** La función SQL `validate_rueda_inferencias()` no maneja la estructura `categoryExpectations` del seed, resultando en score = 0.

**Solución:** Modificar la función SQL para soportar ambas estructuras (flat legacy y categoryExpectations nueva).

---

## CAMBIOS REQUERIDOS

### 1. Modificar Función SQL `validate_rueda_inferencias()`

**Archivo:** `ddl/schemas/educational_content/functions/14-validate_rueda_inferencias.sql`

**Cambio Principal:** En el loop de validación (líneas 262-275), agregar lógica para:
1. Detectar si el fragment tiene `categoryExpectations`
2. Obtener `categoryId` del `fragmentStates` enviado por el frontend
3. Extraer keywords y points de la categoría correcta

### 2. Lógica de Corrección

```
ANTES (líneas 262-264):
  v_keywords := v_fragment_solution->'keywords';                        -- NULL
  v_fragment_points := COALESCE(v_fragment_solution->>'points', 20);  -- 20 default

DESPUÉS:
  IF v_fragment_solution ? 'categoryExpectations' THEN
    -- Buscar categoryId en fragmentStates
    v_category_id := obtener de fragmentStates donde fragmentId = v_fragment_id
    -- Extraer keywords y points de categoryExpectations[categoryId]
    v_keywords := v_fragment_solution->'categoryExpectations'->v_category_id->'keywords';
    v_fragment_points := v_fragment_solution->'categoryExpectations'->v_category_id->>'points';
  ELSE
    -- Estructura flat legacy
    v_keywords := v_fragment_solution->'keywords';
    v_fragment_points := v_fragment_solution->>'points';
  END IF;
```

---

## FUNCIÓN SQL CORREGIDA

```sql
-- ============================================================================
-- FUNCIÓN: validate_rueda_inferencias (CORREGIDA v2)
-- Descripción: Soporta estructura categoryExpectations + flat legacy
-- Autor: Tech Leader
-- Fecha: 2025-12-15
-- Ticket: ANALISIS-EJERCICIO-M2E5-M3-2025-12-15
-- ============================================================================

CREATE OR REPLACE FUNCTION educational_content.validate_rueda_inferencias(
    p_solution JSONB,
    p_submitted_answer JSONB,
    p_max_points INTEGER,
    p_allow_partial_credit BOOLEAN DEFAULT true,
    p_normalize_text BOOLEAN DEFAULT true,
    OUT is_correct BOOLEAN,
    OUT score INTEGER,
    OUT feedback TEXT,
    OUT details JSONB
)
RETURNS RECORD
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
    v_validation JSONB;
    v_min_keywords INTEGER;
    v_min_length INTEGER;
    v_max_length INTEGER;
    v_fragments_solution JSONB;
    v_fragments_submitted JSONB;
    v_fragment_states JSONB;
    v_fragment_id TEXT;
    v_user_text TEXT;
    v_fragment_solution JSONB;
    v_keywords JSONB;
    v_fragment_points INTEGER;
    v_category_id TEXT;
    v_fragment_state JSONB;
    v_validation_result JSONB;
    v_total_fragments INTEGER := 0;
    v_valid_fragments INTEGER := 0;
    v_total_points INTEGER := 0;
    v_accumulated_score INTEGER := 0;
    v_results JSONB := '[]'::jsonb;
    v_feedback_parts TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- 1. Validar estructura de entrada
    IF p_solution IS NULL OR p_submitted_answer IS NULL THEN
        RAISE EXCEPTION 'Invalid input: solution and submitted_answer are required';
    END IF;

    v_fragments_submitted := p_submitted_answer->'fragments';
    v_fragment_states := p_submitted_answer->'fragmentStates';

    IF v_fragments_submitted IS NULL THEN
        RAISE EXCEPTION 'Invalid submitted_answer format: missing "fragments" object';
    END IF;

    -- 2. Extraer criterios de validación globales
    v_validation := p_solution->'validation';
    v_min_keywords := COALESCE((v_validation->>'minKeywords')::INTEGER, 2);
    v_min_length := COALESCE((v_validation->>'minLength')::INTEGER, 20);
    v_max_length := COALESCE((v_validation->>'maxLength')::INTEGER, 200);

    v_fragments_solution := p_solution->'fragments';

    IF v_fragments_solution IS NULL THEN
        RAISE EXCEPTION 'Invalid solution format: missing "fragments" array';
    END IF;

    -- 3. Iterar sobre cada fragmento enviado por el usuario
    FOR v_fragment_id, v_user_text IN
        SELECT key, value::text
        FROM jsonb_each_text(v_fragments_submitted)
    LOOP
        v_total_fragments := v_total_fragments + 1;

        -- Buscar la solución para este fragmento
        SELECT fragment INTO v_fragment_solution
        FROM jsonb_array_elements(v_fragments_solution) AS fragment
        WHERE fragment->>'id' = v_fragment_id;

        IF v_fragment_solution IS NULL THEN
            -- Fragmento no encontrado en solution
            v_results := v_results || jsonb_build_object(
                'fragment_id', v_fragment_id,
                'is_valid', false,
                'error', 'Fragment not found in solution',
                'points', 0
            );
            CONTINUE;
        END IF;

        -- ====================================================================
        -- FIX 2025-12-15: Soporte para estructura categoryExpectations
        -- ====================================================================
        IF v_fragment_solution ? 'categoryExpectations' THEN
            -- Nueva estructura con categorías
            -- Buscar categoryId en fragmentStates para este fragment
            v_category_id := 'cat-literal'; -- default fallback

            IF v_fragment_states IS NOT NULL THEN
                SELECT state INTO v_fragment_state
                FROM jsonb_array_elements(v_fragment_states) AS state
                WHERE state->>'fragmentId' = v_fragment_id;

                IF v_fragment_state IS NOT NULL THEN
                    v_category_id := COALESCE(v_fragment_state->>'categoryId', 'cat-literal');
                END IF;
            END IF;

            -- Extraer keywords y points de categoryExpectations[categoryId]
            v_keywords := v_fragment_solution->'categoryExpectations'->v_category_id->'keywords';
            v_fragment_points := COALESCE(
                (v_fragment_solution->'categoryExpectations'->v_category_id->>'points')::INTEGER,
                20
            );

            -- Log para debug (comentar en producción)
            RAISE NOTICE '[FIX] Fragment % using category % with % keywords',
                v_fragment_id, v_category_id, jsonb_array_length(COALESCE(v_keywords, '[]'::jsonb));
        ELSE
            -- Estructura flat legacy
            v_keywords := v_fragment_solution->'keywords';
            v_fragment_points := COALESCE((v_fragment_solution->>'points')::INTEGER, 20);
        END IF;
        -- ====================================================================
        -- END FIX
        -- ====================================================================

        v_total_points := v_total_points + v_fragment_points;

        -- Validar que v_keywords no sea NULL
        IF v_keywords IS NULL THEN
            v_results := v_results || jsonb_build_object(
                'fragment_id', v_fragment_id,
                'is_valid', false,
                'error', format('Keywords not found for fragment %s (category: %s)', v_fragment_id, v_category_id),
                'points', 0,
                'category_used', v_category_id
            );
            CONTINUE;
        END IF;

        -- Validar el fragmento usando la función auxiliar
        v_validation_result := educational_content._validate_single_fragment(
            v_keywords,
            v_min_keywords,
            v_min_length,
            v_max_length,
            v_user_text,
            v_fragment_points
        );

        -- Acumular resultados
        IF (v_validation_result->>'is_valid')::boolean THEN
            v_valid_fragments := v_valid_fragments + 1;
        END IF;

        v_accumulated_score := v_accumulated_score + (v_validation_result->>'points')::integer;

        -- Agregar resultado del fragmento al detalle
        v_results := v_results || jsonb_build_object(
            'fragment_id', v_fragment_id,
            'category_used', v_category_id,
            'is_valid', v_validation_result->'is_valid',
            'matched_keywords', v_validation_result->'matched_keywords',
            'keyword_count', v_validation_result->'keyword_count',
            'points', v_validation_result->'points',
            'max_points', v_fragment_points,
            'feedback', v_validation_result->'feedback'
        );
    END LOOP;

    -- 4. Calcular puntuación final
    IF p_allow_partial_credit THEN
        -- Ajustar a p_max_points (normalmente 100)
        IF v_total_points > 0 THEN
            score := ROUND((v_accumulated_score::NUMERIC / v_total_points) * p_max_points);
        ELSE
            score := 0;
        END IF;
    ELSE
        score := CASE
            WHEN v_valid_fragments = v_total_fragments THEN p_max_points
            ELSE 0
        END;
    END IF;

    -- 5. Determinar si es correcto (al menos 70% de fragmentos válidos)
    is_correct := (score >= 70);

    -- 6. Generar feedback
    IF v_valid_fragments = v_total_fragments THEN
        feedback := format('¡Excelente! Todas las %s inferencias son válidas. Has demostrado comprensión profunda del texto.',
            v_total_fragments);
    ELSIF v_valid_fragments > 0 THEN
        feedback := format('%s de %s inferencias válidas (Puntuación: %s%%). Revisa los fragmentos marcados para mejorar tu respuesta.',
            v_valid_fragments, v_total_fragments, score);
    ELSE
        feedback := format('Ninguna inferencia válida. Asegúrate de incluir conceptos clave del texto y cumplir con la longitud requerida (%s-%s caracteres).',
            v_min_length, v_max_length);
    END IF;

    -- 7. Construir detalles
    details := jsonb_build_object(
        'total_fragments', v_total_fragments,
        'valid_fragments', v_valid_fragments,
        'total_points_possible', v_total_points,
        'points_earned', v_accumulated_score,
        'percentage', score,
        'validation_criteria', jsonb_build_object(
            'min_keywords', v_min_keywords,
            'min_length', v_min_length,
            'max_length', v_max_length
        ),
        'results_per_fragment', v_results
    );
END;
$$;

COMMENT ON FUNCTION educational_content.validate_rueda_inferencias IS
'Wrapper estándar para validación de rueda de inferencias.
Soporta DOS estructuras de solución:
1. NUEVA (categoryExpectations): { fragments: [{ id, categoryExpectations: { cat-xxx: { keywords, points } } }] }
2. LEGACY (flat): { fragments: [{ id, keywords, points }] }
El frontend envía fragmentStates con categoryId para indicar qué categoría usó el usuario.
FIX 2025-12-15: Corregido para manejar estructura categoryExpectations del seed.';
```

---

## PASOS DE IMPLEMENTACIÓN

### Paso 1: Backup de función actual
```sql
-- Crear backup antes de modificar
CREATE OR REPLACE FUNCTION educational_content.validate_rueda_inferencias_backup_20251215
AS $$ ... $$ -- copia exacta de la función actual
```

### Paso 2: Ejecutar función corregida
```bash
# Conectar a la base de datos
PGPASSWORD=xxx psql -h localhost -U gamilit_user -d gamilit_platform

# Ejecutar el script de la función corregida
\i /path/to/corrected_function.sql
```

### Paso 3: Prueba de validación
```sql
-- Test con datos reales del seed
SELECT * FROM educational_content.validate_rueda_inferencias(
    -- solution (del seed)
    '{
        "validation": { "minKeywords": 2, "minLength": 20, "maxLength": 200 },
        "fragments": [{
            "id": "frag-1",
            "categoryExpectations": {
                "cat-literal": { "keywords": ["pionera", "radiactividad", "nobel"], "points": 20 }
            }
        }]
    }'::jsonb,
    -- submitted_answer (del frontend)
    '{
        "fragments": { "frag-1": "Marie Curie fue pionera en la radiactividad" },
        "fragmentStates": [{ "fragmentId": "frag-1", "categoryId": "cat-literal" }]
    }'::jsonb,
    100,
    true,
    true
);

-- Resultado esperado: score > 0, is_correct = true
```

### Paso 4: Test E2E
1. Abrir frontend
2. Ir a Módulo 2, Ejercicio 5
3. Completar el ejercicio con texto válido
4. Verificar que score > 0 y XP/ML Coins se asignan

---

## VALIDACIÓN DE DEPENDENCIAS

### Funciones que llaman a `validate_rueda_inferencias()`

| Función | Ubicación | Impacto |
|---------|-----------|---------|
| `validate_answer()` | `02-validate_answer.sql:169-177` | Sin cambio - firma igual |
| `validate_and_audit()` | `20-validate_and_audit.sql:94-98` | Sin cambio - usa validate_answer() |

### Cambios en Firma de Función

**NO HAY CAMBIOS EN LA FIRMA:**
- Input: `(p_solution JSONB, p_submitted_answer JSONB, p_max_points INTEGER, ...)`
- Output: `(is_correct BOOLEAN, score INTEGER, feedback TEXT, details JSONB)`

La firma se mantiene idéntica, solo cambia la lógica interna.

---

## ROLLBACK

Si hay problemas, ejecutar:
```sql
-- Restaurar función original desde backup
DROP FUNCTION educational_content.validate_rueda_inferencias;
ALTER FUNCTION educational_content.validate_rueda_inferencias_backup_20251215
RENAME TO validate_rueda_inferencias;
```

---

## CHECKLIST DE VALIDACIÓN

- [ ] Backup de función original creado
- [ ] Función corregida ejecutada sin errores
- [ ] Test SQL directo pasa (score > 0)
- [ ] Test E2E ejercicio 2.5 pasa
- [ ] XP se asigna correctamente
- [ ] ML Coins se asignan correctamente
- [ ] Otros ejercicios M2 siguen funcionando (regression test)
