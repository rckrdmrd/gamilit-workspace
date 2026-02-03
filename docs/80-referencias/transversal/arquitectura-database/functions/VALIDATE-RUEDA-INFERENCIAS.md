# Funcion: validate_rueda_inferencias

**Version:** 1.0.0
**Fecha:** 2025-12-18
**Schema:** educational_content
**Ubicacion:** `apps/database/ddl/schemas/educational_content/functions/14-validate_rueda_inferencias.sql`

---

## PROPOSITO

Validar respuestas abiertas para ejercicios de tipo "Rueda de Inferencias", soportando multiples estructuras de datos y proporcionando retroalimentacion granular.

---

## FIRMA

```sql
CREATE OR REPLACE FUNCTION educational_content.validate_rueda_inferencias(
    p_student_response JSONB,
    p_correct_answer JSONB,
    p_exercise_config JSONB DEFAULT '{}'::JSONB
) RETURNS RECORD AS $$
```

---

## PARAMETROS

| Parametro | Tipo | Descripcion |
|-----------|------|-------------|
| p_student_response | JSONB | Respuesta del estudiante |
| p_correct_answer | JSONB | Respuesta correcta esperada |
| p_exercise_config | JSONB | Configuracion adicional (opcional) |

---

## RETORNO

```sql
RECORD (
    is_correct BOOLEAN,    -- Si la respuesta es correcta
    score INTEGER,         -- Puntaje obtenido (0-100)
    feedback TEXT,         -- Retroalimentacion para el estudiante
    details JSONB          -- Detalles de evaluacion por categoria
)
```

---

## ESTRUCTURAS SOPORTADAS

### Estructura Nueva: categoryExpectations

```json
{
  "categoryExpectations": {
    "category_id_1": {
      "keywords": ["palabra1", "palabra2"],
      "minLength": 10,
      "maxLength": 500
    },
    "category_id_2": {
      "keywords": ["palabra3", "palabra4"],
      "minLength": 20
    }
  },
  "fragmentStates": {
    "fragment_id_1": {
      "categoryId": "category_id_1"
    }
  }
}
```

### Estructura Legacy: flat

```json
{
  "keywords": ["palabra1", "palabra2", "palabra3"],
  "minLength": 10,
  "maxLength": 500,
  "minKeywords": 2
}
```

---

## LOGICA DE VALIDACION

### 1. Deteccion de Estructura

```sql
IF p_correct_answer ? 'categoryExpectations' THEN
    -- Usar estructura nueva
ELSE
    -- Usar estructura legacy (flat)
END IF;
```

### 2. Normalizacion de Texto

```sql
v_normalized_text := lower(
    translate(
        p_student_response->>'text',
        'áéíóúÁÉÍÓÚñÑ',
        'aeiouAEIOUnN'
    )
);
```

### 3. Validacion de Longitud

```sql
v_text_length := length(p_student_response->>'text');

IF v_text_length < v_min_length THEN
    v_feedback := 'Respuesta muy corta. Minimo ' || v_min_length || ' caracteres.';
    v_is_correct := false;
END IF;

IF v_max_length IS NOT NULL AND v_text_length > v_max_length THEN
    v_feedback := 'Respuesta muy larga. Maximo ' || v_max_length || ' caracteres.';
    v_is_correct := false;
END IF;
```

### 4. Conteo de Keywords

```sql
v_keyword_count := 0;

FOR v_keyword IN SELECT jsonb_array_elements_text(v_keywords) LOOP
    IF v_normalized_text LIKE '%' || lower(v_keyword) || '%' THEN
        v_keyword_count := v_keyword_count + 1;
    END IF;
END LOOP;
```

### 5. Calculo de Score

```sql
-- Puntuacion parcial basada en keywords encontradas
v_keyword_ratio := v_keyword_count::FLOAT / v_total_keywords::FLOAT;
v_score := LEAST(100, ROUND(v_keyword_ratio * 100));

-- Bonus por longitud adecuada
IF v_text_length >= v_ideal_length THEN
    v_score := v_score + 10;
END IF;
```

---

## EJEMPLOS DE USO

### Estructura categoryExpectations

```sql
SELECT educational_content.validate_rueda_inferencias(
    '{"text": "El texto habla sobre la importancia de la lectura critica"}'::JSONB,
    '{
        "categoryExpectations": {
            "cat-inferencias": {
                "keywords": ["lectura", "critica", "importancia", "texto"],
                "minLength": 20
            }
        }
    }'::JSONB
);
-- Retorna: (true, 75, 'Respuesta aceptable', {"keywords_found": 3, "keywords_total": 4})
```

### Estructura Legacy

```sql
SELECT educational_content.validate_rueda_inferencias(
    '{"text": "Pienso que el autor quiere transmitir un mensaje sobre la sociedad"}'::JSONB,
    '{
        "keywords": ["autor", "mensaje", "sociedad", "transmitir"],
        "minLength": 30,
        "minKeywords": 2
    }'::JSONB
);
-- Retorna: (true, 100, 'Excelente respuesta', {"keywords_found": 4, "keywords_total": 4})
```

---

## MANEJO DE ERRORES

### Categoria No Encontrada

Si un fragmentId no tiene categoryId mapeado, se usa fallback:

```sql
v_category_id := COALESCE(
    p_correct_answer->'fragmentStates'->v_fragment_id->>'categoryId',
    'cat-literal'  -- Fallback
);
```

### Respuesta Vacia

```sql
IF p_student_response IS NULL OR p_student_response->>'text' = '' THEN
    RETURN (false, 0, 'No se proporciono respuesta', '{}'::JSONB);
END IF;
```

---

## RETROALIMENTACION

### Mensajes Predefinidos

| Condicion | Mensaje |
|-----------|---------|
| Score >= 90 | "Excelente respuesta" |
| Score >= 70 | "Buena respuesta" |
| Score >= 50 | "Respuesta aceptable, considera agregar mas detalles" |
| Score < 50 | "Respuesta insuficiente, revisa los conceptos clave" |
| Muy corta | "Respuesta muy corta. Minimo X caracteres" |
| Muy larga | "Respuesta muy larga. Maximo X caracteres" |

---

## DETALLES DE RETORNO

### Estructura de details

```json
{
  "keywords_found": 3,
  "keywords_total": 5,
  "text_length": 85,
  "min_length": 20,
  "max_length": 500,
  "categories_evaluated": [
    {
      "category_id": "cat-inferencias",
      "keywords_found": 2,
      "keywords_total": 3,
      "passed": true
    }
  ]
}
```

---

## INTEGRACION

### Trigger de Validacion

```sql
CREATE TRIGGER trg_validate_rueda_response
BEFORE INSERT ON educational_content.exercise_attempts
FOR EACH ROW
WHEN (NEW.exercise_type = 'rueda_inferencias')
EXECUTE FUNCTION educational_content.validate_rueda_response_trigger();
```

### Uso desde Backend

```typescript
const result = await db.query(`
  SELECT * FROM educational_content.validate_rueda_inferencias($1, $2)
`, [studentResponse, correctAnswer]);

const { is_correct, score, feedback, details } = result.rows[0];
```

---

## HISTORIAL DE CAMBIOS

| Fecha | Version | Cambio |
|-------|---------|--------|
| 2025-12-15 | 1.0.0 | Version inicial con soporte dual |

---

## REFERENCIAS

- [04-FUNCTIONS-INVENTORY.md](../../90-transversal/inventarios-database/inventarios/04-FUNCTIONS-INVENTORY.md)
- Ejercicios de Rueda de Inferencias en Modulo 2

---

**Ultima actualizacion:** 2025-12-18
