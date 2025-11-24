# PLAN DE CORRECCIÓN: Ejercicio 1.3 - Validación de Alternativas

**ID del GAP:** GAP-EJERCICIO-1.3-001
**Fecha del plan:** 2025-11-24
**Arquitecto:** Architecture-Analyst
**Prioridad:** P0 (CRÍTICA)
**Estimación:** 2 horas

---

## 🎯 OBJETIVO

Modificar la función SQL `validate_fill_in_blank` para que soporte **múltiples alternativas válidas** por espacio en blanco, leyendo tanto el campo `correctAnswer` como el array `alternatives` del campo `content->blanks[]`.

---

## 📋 ESPECIFICACIÓN TÉCNICA DETALLADA

### 1. MODIFICACIÓN DE FUNCIÓN SQL

**Archivo a modificar:**
```
apps/database/ddl/schemas/educational_content/functions/06-validate_fill_in_blank.sql
```

**Función actual:**
```sql
CREATE OR REPLACE FUNCTION educational_content.validate_fill_in_blank(
    p_solution JSONB,
    p_submitted_answer JSONB,
    p_max_points INTEGER,
    p_case_sensitive BOOLEAN DEFAULT false,
    p_normalize_text BOOLEAN DEFAULT true,
    p_fuzzy_threshold NUMERIC DEFAULT NULL,
    p_allow_partial_credit BOOLEAN DEFAULT true,
    ...
)
```

**PROBLEMA ACTUAL (líneas 48-101):**
```sql
-- Extraer respuestas correctas del campo solution->correctAnswers
v_correct_answers := p_solution->'correctAnswers';

-- Validar cada blank
FOR v_blank_id IN SELECT jsonb_object_keys(v_correct_answers)
LOOP
    v_correct_answer := v_correct_answers->>v_blank_id;  -- ❌ UNA SOLA respuesta
    v_submitted_answer := v_submitted_blanks->>v_blank_id;

    -- Exact match
    IF v_submitted_answer = v_correct_answer THEN  -- ❌ Solo exact match
        v_correct_blanks := v_correct_blanks + 1;
    ...
```

---

### 2. SOLUCIÓN PROPUESTA

**NUEVA FIRMA (sin cambios):**
La firma se mantiene igual. Agregamos un parámetro de entrada para el campo `content`.

```sql
CREATE OR REPLACE FUNCTION educational_content.validate_fill_in_blank(
    p_solution JSONB,
    p_submitted_answer JSONB,
    p_max_points INTEGER,
    p_case_sensitive BOOLEAN DEFAULT false,
    p_normalize_text BOOLEAN DEFAULT true,
    p_fuzzy_threshold NUMERIC DEFAULT NULL,
    p_allow_partial_credit BOOLEAN DEFAULT true,
    p_content JSONB DEFAULT NULL,  -- ✅ NUEVO: campo content del ejercicio
    ...
)
```

**NUEVA LÓGICA DE VALIDACIÓN:**

```sql
DECLARE
    v_correct_answers JSONB;
    v_submitted_blanks JSONB;
    v_content_blanks JSONB;  -- ✅ NUEVO: array de blanks del content
    v_total_blanks INTEGER;
    v_correct_blanks INTEGER := 0;
    v_blank_id TEXT;
    v_correct_answer TEXT;
    v_submitted_answer TEXT;
    v_alternatives JSONB;  -- ✅ NUEVO: array de alternativas
    v_is_valid BOOLEAN;    -- ✅ NUEVO: flag de validación
    ...
BEGIN
    -- Extraer respuestas correctas y respuestas enviadas
    v_correct_answers := p_solution->'correctAnswers';
    v_submitted_blanks := p_submitted_answer->'blanks';

    -- ✅ NUEVO: Extraer blanks del content (si está disponible)
    IF p_content IS NOT NULL THEN
        v_content_blanks := p_content->'blanks';
    END IF;

    v_total_blanks := (SELECT COUNT(*) FROM jsonb_object_keys(v_correct_answers));

    -- Validar cada blank
    FOR v_blank_id IN SELECT jsonb_object_keys(v_correct_answers)
    LOOP
        v_correct_answer := v_correct_answers->>v_blank_id;
        v_submitted_answer := v_submitted_blanks->>v_blank_id;

        -- ✅ NUEVO: Obtener alternativas del content->blanks si existen
        v_alternatives := NULL;
        IF v_content_blanks IS NOT NULL THEN
            -- Buscar el blank con este id en el array de blanks
            SELECT elem->'alternatives'
            INTO v_alternatives
            FROM jsonb_array_elements(v_content_blanks) AS elem
            WHERE elem->>'id' = v_blank_id
            LIMIT 1;
        END IF;

        -- Normalizar
        IF p_normalize_text THEN
            v_correct_answer := gamilit.normalize_text(v_correct_answer);
            v_submitted_answer := gamilit.normalize_text(COALESCE(v_submitted_answer, ''));
        END IF;

        -- Case-sensitive?
        IF NOT p_case_sensitive THEN
            v_correct_answer := UPPER(TRIM(v_correct_answer));
            v_submitted_answer := UPPER(TRIM(v_submitted_answer));
        END IF;

        -- ✅ NUEVO: Validar contra correctAnswer O alternatives
        v_is_valid := false;

        -- 1. Validar contra correctAnswer (lógica existente)
        IF p_fuzzy_threshold IS NOT NULL THEN
            v_similarity := similarity(v_correct_answer, v_submitted_answer);
            IF v_similarity >= p_fuzzy_threshold THEN
                v_is_valid := true;
            END IF;
        ELSE
            -- Exact match con correctAnswer
            IF v_submitted_answer = v_correct_answer THEN
                v_is_valid := true;
            END IF;
        END IF;

        -- 2. ✅ NUEVO: Si no es válido, validar contra alternatives (si existen)
        IF NOT v_is_valid AND v_alternatives IS NOT NULL THEN
            -- Iterar sobre alternatives
            FOR i IN 0..jsonb_array_length(v_alternatives)-1
            LOOP
                DECLARE
                    v_alternative TEXT;
                BEGIN
                    v_alternative := v_alternatives->>i;

                    -- Normalizar alternativa
                    IF p_normalize_text THEN
                        v_alternative := gamilit.normalize_text(v_alternative);
                    END IF;

                    IF NOT p_case_sensitive THEN
                        v_alternative := UPPER(TRIM(v_alternative));
                    END IF;

                    -- Validar contra alternativa
                    IF p_fuzzy_threshold IS NOT NULL THEN
                        v_similarity := similarity(v_alternative, v_submitted_answer);
                        IF v_similarity >= p_fuzzy_threshold THEN
                            v_is_valid := true;
                            EXIT;  -- Salir del loop si encontramos match
                        END IF;
                    ELSE
                        IF v_submitted_answer = v_alternative THEN
                            v_is_valid := true;
                            EXIT;
                        END IF;
                    END IF;
                END;
            END LOOP;
        END IF;

        -- Registrar resultado
        IF v_is_valid THEN
            v_correct_blanks := v_correct_blanks + 1;
            v_results := v_results || jsonb_build_object(
                'blank_id', v_blank_id,
                'is_correct', true
            );
        ELSE
            v_results := v_results || jsonb_build_object(
                'blank_id', v_blank_id,
                'is_correct', false
            );
        END IF;
    END LOOP;

    -- Calcular resultado (sin cambios)
    is_correct := (v_correct_blanks = v_total_blanks);
    ...
```

---

### 3. MODIFICACIÓN DE FUNCIÓN validate_answer

**Archivo:** `apps/database/ddl/schemas/educational_content/functions/02-validate_answer.sql`
**Líneas:** 103-113

**CAMBIO NECESARIO:**
Pasar el campo `content` a la función `validate_fill_in_blank`:

```sql
WHEN 'validate_fill_in_blank' THEN
    SELECT * INTO v_result
    FROM educational_content.validate_fill_in_blank(
        v_exercise.solution,
        p_submitted_answer,
        max_score,
        v_config.case_sensitive,
        v_config.normalize_text,
        v_config.fuzzy_matching_threshold,
        v_config.allow_partial_credit,
        v_exercise.content  -- ✅ NUEVO: pasar content
    );
```

---

## 🧪 CASOS DE PRUEBA

### Test Case 1: Combinaciones válidas (6 casos)

**Input (espacios 1-4 correctos + espacios 5 y 6 variados):**

```json
{
  "blanks": {
    "1": "Varsovia",
    "2": "Władysław",
    "3": "Bronisława",
    "4": "educación",
    "5": "ciencias",
    "6": "matemáticas"
  }
}
```
**Resultado esperado:** `score: 100, is_correct: true` ✅

**Variaciones válidas:**
- `5: "ciencias"`, `6: "física"` → 100 puntos ✅
- `5: "matemáticas"`, `6: "ciencias"` → 100 puntos ✅
- `5: "matemáticas"`, `6: "física"` → 100 puntos ✅
- `5: "física"`, `6: "ciencias"` → 100 puntos ✅
- `5: "física"`, `6: "matemáticas"` → 100 puntos ✅

---

### Test Case 2: Redundancia (3 casos - manejados por backend)

**Input:**
```json
{
  "blanks": {
    "1": "Varsovia",
    "2": "Władysław",
    "3": "Bronisława",
    "4": "educación",
    "5": "ciencias",
    "6": "ciencias"  // ❌ Repetido
  }
}
```
**Resultado esperado:** `score: 33, is_correct: false` (manejado por backend) ✅

**Nota:** La validación de redundancia ya está implementada en el backend (líneas 349-384 de exercise-submission.service.ts) y debe seguir funcionando.

---

### Test Case 3: Respuesta incorrecta en espacio 5 o 6

**Input:**
```json
{
  "blanks": {
    "1": "Varsovia",
    "2": "Władysław",
    "3": "Bronisława",
    "4": "educación",
    "5": "Polonia",  // ❌ Incorrecto (no está en alternatives)
    "6": "matemáticas"
  }
}
```
**Resultado esperado:** `score: 83, is_correct: false` (5 de 6 correctos) ✅

---

### Test Case 4: Ejercicio sin alternatives (regresión)

**Input (otro ejercicio completar_espacios sin alternatives):**
```json
{
  "blanks": {
    "1": "radioactividad",
    "2": "Polonio"
  }
}
```
**Resultado esperado:** Validación normal sin cambios ✅

---

## 📦 ENTREGABLES

### 1. Código SQL Modificado
- ✅ `apps/database/ddl/schemas/educational_content/functions/06-validate_fill_in_blank.sql`
- ✅ `apps/database/ddl/schemas/educational_content/functions/02-validate_answer.sql`

### 2. Documentación
- ✅ ADR-012: Decisión de soporte de alternativas en completar_espacios
- ✅ Comentarios en función SQL explicando nueva lógica
- ✅ Actualización de inventario DATABASE_INVENTORY.yml (si aplica)

### 3. Validación
- ✅ Recreación de base de datos exitosa
- ✅ Carga limpia sin errores
- ✅ Tests de validación con 6 combinaciones válidas
- ✅ Tests de regresión (otros ejercicios completar_espacios)

---

## ✅ CRITERIOS DE ACEPTACIÓN

### Funcionales
- [ ] Las 6 combinaciones válidas (espacios 5 y 6) resultan en score 100/100
- [ ] Las 3 combinaciones redundantes resultan en score 33/100 (backend)
- [ ] Respuestas incorrectas resultan en score parcial correcto
- [ ] Otros ejercicios completar_espacios siguen funcionando sin cambios

### Técnicos
- [ ] Función SQL compila sin errores
- [ ] Recreación de base de datos exitosa
- [ ] Carga limpia exitosa
- [ ] No se generan errores en logs
- [ ] Performance no afectada (< 100ms por validación)

### Documentación
- [ ] ADR creado y revisado
- [ ] Función SQL comentada
- [ ] Casos de prueba documentados
- [ ] Inventarios actualizados

---

## 🔄 FLUJO DE IMPLEMENTACIÓN

### Fase 1: Modificación de función SQL (Database-Agent)
1. Leer función actual `06-validate_fill_in_blank.sql`
2. Agregar parámetro `p_content JSONB DEFAULT NULL`
3. Implementar lógica de validación de alternativas
4. Actualizar comentarios y documentación inline
5. Guardar cambios

### Fase 2: Modificación de función validate_answer (Database-Agent)
1. Leer función `02-validate_answer.sql`
2. Modificar llamada a `validate_fill_in_blank` para pasar `v_exercise.content`
3. Guardar cambios

### Fase 3: Validación de cambios (Database-Agent)
1. Ejecutar recreación de base de datos
2. Validar carga limpia exitosa
3. Ejecutar tests de validación
4. Revisar logs para errores

### Fase 4: Documentación (Architecture-Analyst)
1. Crear ADR-012
2. Actualizar inventarios si aplica
3. Generar reporte final de validación

---

## 🚀 COMANDOS DE VALIDACIÓN

### 1. Recreación de base de datos
```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database
DATABASE_URL="postgresql://gamilit_user:3RZ2uYhCnJBXQqEwPPbZK3NFfk4T4W4Q@localhost:5432/gamilit_platform" ./drop-and-recreate-database.sh
```

### 2. Validación manual de ejercicio (SQL)
```sql
-- Test Case 1: ciencias + física (válido)
SELECT * FROM educational_content.validate_and_audit(
    (SELECT id FROM educational_content.exercises WHERE exercise_type = 'completar_espacios' AND order_index = 3 LIMIT 1),
    (SELECT id FROM auth.profiles LIMIT 1),
    '{
        "blanks": {
            "1": "Varsovia",
            "2": "Władysław",
            "3": "Bronisława",
            "4": "educación",
            "5": "ciencias",
            "6": "física"
        }
    }'::jsonb,
    1,
    '{}'::jsonb
);
-- Expected: score = 100, is_correct = true

-- Test Case 2: física + matemáticas (válido)
SELECT * FROM educational_content.validate_and_audit(
    (SELECT id FROM educational_content.exercises WHERE exercise_type = 'completar_espacios' AND order_index = 3 LIMIT 1),
    (SELECT id FROM auth.profiles LIMIT 1),
    '{
        "blanks": {
            "1": "Varsovia",
            "2": "Władysław",
            "3": "Bronisława",
            "4": "educación",
            "5": "física",
            "6": "matemáticas"
        }
    }'::jsonb,
    1,
    '{}'::jsonb
);
-- Expected: score = 100, is_correct = true
```

### 3. Validación de regresión
```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/backend
npm run test -- exercise-submission.service.spec.ts
```

---

## ⚠️ RESTRICCIONES Y CONSIDERACIONES

### Restricciones
- **NO modificar** estructura del seed (se mantiene como está)
- **NO modificar** backend (validación anti-redundancia se mantiene)
- **NO modificar** frontend (componente se mantiene)
- **Mantener compatibilidad** con ejercicios sin alternatives

### Consideraciones de performance
- La iteración sobre alternatives es O(n) donde n es el número de alternativas
- Para ejercicio 1.3: n = 2 (insignificante)
- Para ejercicios futuros: n < 5 típicamente (aceptable)

### Consideraciones de seguridad
- Función ya es SECURITY DEFINER (OK)
- Permisos ya están configurados (OK)
- No hay riesgo de SQL injection (usa JSONB nativo)

---

## 📊 ESTIMACIÓN DE TIEMPO

| Tarea | Tiempo estimado | Agente responsable |
|-------|----------------|-------------------|
| Modificar función validate_fill_in_blank | 30 min | Database-Agent |
| Modificar función validate_answer | 10 min | Database-Agent |
| Recreación de DB + carga limpia | 15 min | Database-Agent |
| Tests de validación (6 casos) | 20 min | Database-Agent |
| Crear ADR-012 | 15 min | Architecture-Analyst |
| Validación de alineación (3 capas) | 20 min | Architecture-Analyst |
| Reporte final | 10 min | Architecture-Analyst |
| **TOTAL** | **2 horas** | - |

---

## 🎯 SIGUIENTE PASO

**ORQUESTAR Database-Agent** con este plan para implementar los cambios en las funciones SQL.

---

**Estado:** Plan completo - Listo para ejecución
**Aprobado por:** Architecture-Analyst
**Fecha:** 2025-11-24
