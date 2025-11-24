# ANÁLISIS DE GAP: Ejercicio 1.3 - Validación de Alternativas

**ID del GAP:** GAP-EJERCICIO-1.3-001
**Fecha de análisis:** 2025-11-24
**Analista:** Architecture-Analyst
**Severidad:** ALTA
**Categoría:** Funcionalidad - Validación de Respuestas
**Módulo afectado:** Módulo 1 - Comprensión Literal

---

## 📋 DESCRIPCIÓN DEL PROBLEMA

El ejercicio 1.3 "Completar Espacios en Blanco" sobre Marie Curie tiene un problema de validación en los **espacios 5 y 6**. Según la documentación oficial, estos espacios deben aceptar **cualquiera** de las palabras: `ciencias`, `matemáticas`, `física` en **cualquier orden**, con la restricción de que **no pueden ser la misma palabra**.

**PROBLEMA ACTUAL:**
La función SQL de validación `validate_fill_in_blank` solo acepta:
- Espacio 5: **únicamente** "ciencias"
- Espacio 6: **únicamente** "matemáticas"

Esto significa que las siguientes combinaciones válidas están siendo **rechazadas incorrectamente**:
- `5: "física"`, `6: "ciencias"` ❌ (debería ser ✅)
- `5: "matemáticas"`, `6: "física"` ❌ (debería ser ✅)
- `5: "física"`, `6: "matemáticas"` ❌ (debería ser ✅)
- Y otras 2 combinaciones más

---

## 🔍 EVIDENCIA DEL GAP

### 1. Documentación Oficial (Fuente de Verdad)

**Archivo:** `docs/00-vision-general/GUIA-PRUEBAS-MODULO1-Respuestas-Ejemplo.md`
**Líneas:** 372-386

```markdown
5. **ciencias** / **matemáticas** / **física** ✓ (cualquiera de las 3 válida)
6. **ciencias** / **matemáticas** / **física** ✓ (cualquiera de las 3 válida, DIFERENTE a espacio 5)
```

**Tabla de combinaciones válidas documentadas:**

| Espacio 5 | Espacio 6 | Validez |
|-----------|-----------|---------|
| ciencias | matemáticas | ✅ VÁLIDO |
| ciencias | física | ✅ VÁLIDO |
| matemáticas | ciencias | ✅ VÁLIDO |
| matemáticas | física | ✅ VÁLIDO |
| física | ciencias | ✅ VÁLIDO |
| física | matemáticas | ✅ VÁLIDO |

**Total:** 6 combinaciones válidas (cualquier permutación sin repetición)

---

### 2. Implementación Actual en Seeds

**Archivo:** `apps/database/seeds/prod/educational_content/02-exercises-module1.sql`
**Líneas:** 346-365

```json
"blanks": [
    {"id": "5", "position": 4, "correctAnswer": "ciencias", "alternatives": ["matemáticas", "física"]},
    {"id": "6", "position": 5, "correctAnswer": "matemáticas", "alternatives": ["ciencias", "física"]}
]
```

```json
"solution": {
    "correctAnswers": {
        "5": "ciencias",      // ❌ Solo acepta "ciencias"
        "6": "matemáticas"    // ❌ Solo acepta "matemáticas"
    },
    "note": "Espacios 5 y 6 aceptan cualquiera de: ciencias, matemáticas, física. Restricción: espacio 5 ≠ espacio 6 (no pueden ser la misma palabra)."
}
```

**CONTRADICCIÓN DETECTADA:**
- El campo `content->blanks[].alternatives` contiene las alternativas ✅
- El campo `solution->correctAnswers` solo contiene UNA respuesta por espacio ❌
- La nota en `solution->note` describe la regla correcta ✅
- Pero la función SQL **NO LEE** ni `alternatives` ni `note` ❌

---

### 3. Función SQL de Validación

**Archivo:** `apps/database/ddl/schemas/educational_content/functions/06-validate_fill_in_blank.sql`
**Líneas:** 48-101

```sql
-- Extraer respuestas correctas y respuestas enviadas
v_correct_answers := p_solution->'correctAnswers';  -- ❌ Solo lee este campo
v_submitted_blanks := p_submitted_answer->'blanks';

-- Validar cada blank
FOR v_blank_id IN SELECT jsonb_object_keys(v_correct_answers)
LOOP
    v_correct_answer := v_correct_answers->>v_blank_id;  -- ❌ Una sola respuesta
    v_submitted_answer := v_submitted_blanks->>v_blank_id;

    -- Exact match
    IF v_submitted_answer = v_correct_answer THEN  -- ❌ Solo exact match
        v_correct_blanks := v_correct_blanks + 1;
    ...
```

**PROBLEMA IDENTIFICADO:**
La función solo compara contra `solution->correctAnswers[id]`, que contiene **UNA SOLA** respuesta por espacio. NO considera:
- El campo `alternatives` del `content->blanks[]`
- Arrays de respuestas válidas
- El campo `note` con las reglas especiales

---

### 4. Validación Backend (Anti-redundancia)

**Archivo:** `apps/backend/src/modules/progress/services/exercise-submission.service.ts`
**Líneas:** 349-384

```typescript
// SPECIAL CASE: Completar Espacios - Anti-redundancy validation (Exercise 1.3)
if (exercise.exercise_type === 'completar_espacios') {
    const blanks = answerData.blanks || {};
    if (blanks['5'] && blanks['6']) {
        const space5 = String(blanks['5']).toLowerCase().trim();
        const space6 = String(blanks['6']).toLowerCase().trim();

        if (space5 === space6) {  // ✅ Correcto: detecta redundancia
            return {
                score: 33,
                feedback: `Los espacios 5 y 6 no pueden tener la misma palabra...`
            };
        }
    }
}
```

**NOTA POSITIVA:**
La validación de anti-redundancia está implementada correctamente en el backend. El problema es solo en la función SQL que valida las respuestas individuales.

---

## 💥 IMPACTO DEL GAP

### Impacto en Usuarios
- **CRÍTICO:** Estudiantes con respuestas **correctas** reciben **calificación incorrecta**
- 4 de 6 combinaciones válidas (66%) están siendo marcadas como incorrectas
- Genera frustración y desconfianza en el sistema
- Pérdida de puntos injustificada

### Impacto en Pedagogía
- Contradice la documentación pedagógica oficial
- Limita artificialmente las respuestas aceptadas
- No refleja la justificación histórica del ejercicio (Marie Curie estudió matemáticas Y física)

### Impacto Técnico
- **Inconsistencia entre documentación y código**
- El campo `alternatives` en seeds NO SE USA
- El campo `note` en solution NO SE USA
- Validación SQL incompleta

---

## 🎯 CAUSA RAÍZ

La función `validate_fill_in_blank` fue diseñada para validar ejercicios con **UNA SOLA respuesta correcta por espacio**. No fue implementada para soportar:

1. **Múltiples alternativas válidas por espacio**
2. **Lectura del campo `content->blanks[].alternatives`**
3. **Validación contra arrays de respuestas**

El seed tiene la estructura correcta con `alternatives`, pero la función SQL **ignora ese campo**.

---

## ✅ CRITERIOS DE ACEPTACIÓN PARA LA CORRECCIÓN

1. **Validación SQL actualizada:**
   - ✅ La función `validate_fill_in_blank` debe aceptar múltiples alternativas
   - ✅ Debe leer tanto `correctAnswer` como `alternatives` del campo content
   - ✅ Debe validar contra arrays de respuestas válidas

2. **Validación completa:**
   - ✅ Las 6 combinaciones válidas deben pasar (score 100/100)
   - ✅ Las 3 combinaciones inválidas (redundantes) deben fallar (score 33/100)
   - ✅ La validación anti-redundancia del backend debe seguir funcionando

3. **Alineación entre capas:**
   - ✅ Seeds (Database): estructura correcta mantenida
   - ✅ Backend: validación anti-redundancia funcionando
   - ✅ Frontend: componente `FillBlankActivity` sigue funcionando sin cambios

4. **Documentación actualizada:**
   - ✅ ADR creado documentando la decisión de implementación
   - ✅ Función SQL comentada explicando soporte de alternativas
   - ✅ Inventarios actualizados si es necesario

5. **Validación de regresión:**
   - ✅ Recreación de base de datos exitosa
   - ✅ Carga limpia sin errores
   - ✅ Tests de validación pasando
   - ✅ Otros ejercicios completar_espacios NO afectados

---

## 📊 RECOMENDACIÓN

**SOLUCIÓN RECOMENDADA:** Modificar la función SQL `validate_fill_in_blank` para que:

1. Además de validar contra `solution->correctAnswers[id]`
2. También busque en `content->blanks[]` el blank correspondiente
3. Obtenga el array `alternatives` de ese blank
4. Valide la respuesta contra `correctAnswer` **O** cualquier elemento de `alternatives`

**VENTAJAS:**
- ✅ Usa la estructura existente en seeds (no requiere cambios en seeds)
- ✅ Solución genérica aplicable a otros ejercicios
- ✅ Mantiene compatibilidad con ejercicios sin alternatives
- ✅ No requiere cambios en backend o frontend

**ALTERNATIVA DESCARTADA:**
Modificar `solution->correctAnswers` para que sea un array. **Descartado porque:**
- ❌ Rompe la estructura actual de solution
- ❌ Requiere cambios en múltiples funciones SQL
- ❌ Duplica información ya en `content->blanks[].alternatives`

---

## 📁 ARCHIVOS AFECTADOS

### Database (DDL)
- `apps/database/ddl/schemas/educational_content/functions/06-validate_fill_in_blank.sql` ⚠️ **MODIFICAR**

### Database (Seeds)
- `apps/database/seeds/prod/educational_content/02-exercises-module1.sql` ✅ **OK (mantener)**
- `apps/database/seeds/dev/educational_content/02-exercises-module1.sql` ✅ **OK (mantener)**

### Backend
- `apps/backend/src/modules/progress/services/exercise-submission.service.ts` ✅ **OK (mantener)**

### Frontend
- `apps/frontend/src/features/exercises/components/FillBlankActivity.tsx` ✅ **OK (mantener)**

### Documentación
- `docs/00-vision-general/GUIA-PRUEBAS-MODULO1-Respuestas-Ejemplo.md` ✅ **ALINEADO**
- `docs/97-adr/ADR-012-ejercicio-1-3-validacion-alternativas.md` 📝 **CREAR**

---

## 🚀 PRÓXIMOS PASOS

1. Crear plan de corrección detallado
2. Orquestar Database-Agent para implementar cambios en función SQL
3. Validar con recreación de DB y carga limpia
4. Validar alineación entre capas (DB, Backend, Frontend)
5. Crear ADR documentando la decisión
6. Actualizar inventarios si es necesario
7. Generar reporte final de validación

---

**Estado:** Análisis completado - Pendiente de aprobación para implementación
**Prioridad:** P0 (CRÍTICA - afecta calificación de estudiantes)
**Estimación:** 2 horas (modificación función SQL + validaciones)
