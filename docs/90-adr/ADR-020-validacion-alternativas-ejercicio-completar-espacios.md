# ADR-020: Soporte de Múltiples Alternativas en Ejercicios Completar Espacios

**Estado:** Aceptado
**Fecha:** 2025-11-24
**Autor:** Architecture-Analyst
**Relacionado con:** GAP-EJERCICIO-1.3-001, DB-122
**Implementado por:** Database-Agent

---

## Contexto

El ejercicio 1.3 "Completar Espacios en Blanco" del Módulo 1 sobre Marie Curie tiene espacios en blanco que aceptan **múltiples respuestas válidas**. Específicamente, los espacios 5 y 6 deben aceptar cualquiera de las palabras: `ciencias`, `matemáticas`, `física` en cualquier orden, con la restricción de que **no pueden ser la misma palabra**.

### Problema Identificado

La función SQL `validate_fill_in_blank` solo validaba contra el campo `solution->correctAnswers[id]`, que contiene **UNA SOLA respuesta por espacio**. Esto causaba que 4 de 6 combinaciones válidas (66%) fueran rechazadas incorrectamente:

```json
"solution": {
    "correctAnswers": {
        "5": "ciencias",      // ❌ Solo aceptaba "ciencias"
        "6": "matemáticas"    // ❌ Solo aceptaba "matemáticas"
    }
}
```

**Impacto:**
- Estudiantes con respuestas **correctas** recibían calificación **incorrecta**
- Contradecía la documentación pedagógica oficial
- Generaba frustración y desconfianza en el sistema

### Estructura Existente en Seeds

Los seeds ya contenían la estructura correcta con `alternatives` en el campo `content->blanks[]`:

```json
"content": {
    "blanks": [
        {
            "id": "5",
            "position": 4,
            "correctAnswer": "ciencias",
            "alternatives": ["matemáticas", "física"]  // ✅ Ya existía
        },
        {
            "id": "6",
            "position": 5,
            "correctAnswer": "matemáticas",
            "alternatives": ["ciencias", "física"]     // ✅ Ya existía
        }
    ]
}
```

Pero la función SQL **NO leía ni usaba** este campo `alternatives`.

---

## Decisión

**Se implementó soporte de múltiples alternativas válidas** modificando la función SQL `validate_fill_in_blank` para:

1. Aceptar un nuevo parámetro opcional `p_content JSONB DEFAULT NULL`
2. Leer el campo `content->blanks[]` del ejercicio
3. Para cada espacio en blanco:
   - Validar primero contra `correctAnswer` (lógica existente)
   - Si no coincide, validar contra cada elemento del array `alternatives`
   - Marcar como válido si coincide con `correctAnswer` **O** cualquier `alternative`

### Implementación Técnica

**Función modificada:** `educational_content.validate_fill_in_blank()`

**Cambios realizados:**

1. **Nueva firma (compatible hacia atrás):**
```sql
CREATE OR REPLACE FUNCTION educational_content.validate_fill_in_blank(
    p_solution JSONB,
    p_submitted_answer JSONB,
    p_max_points INTEGER,
    p_case_sensitive BOOLEAN DEFAULT false,
    p_normalize_text BOOLEAN DEFAULT true,
    p_fuzzy_threshold NUMERIC DEFAULT NULL,
    p_allow_partial_credit BOOLEAN DEFAULT true,
    p_content JSONB DEFAULT NULL  -- ✅ NUEVO parámetro (opcional)
)
```

2. **Nuevas variables:**
```sql
v_content_blanks JSONB;  -- Array de blanks del content
v_alternatives JSONB;    -- Array de alternativas para el blank actual
v_is_valid BOOLEAN;      -- Flag de validación
```

3. **Algoritmo de validación:**
```
FOR cada blank_id EN correctAnswers:
    1. Obtener correctAnswer de solution->correctAnswers[id]
    2. Obtener alternatives de content->blanks[donde id=blank_id]->alternatives
    3. Normalizar y comparar respuesta contra correctAnswer
    4. SI no coincide Y alternatives existe:
         FOR cada alternative EN alternatives:
             Normalizar y comparar respuesta contra alternative
             SI coincide: marcar como válido y SALIR
    5. Registrar resultado (válido/inválido)
```

4. **Llamada desde `validate_answer`:**
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

## Alternativas Consideradas

### Alternativa 1: Modificar estructura de `solution->correctAnswers`
Convertir `correctAnswers[id]` de string a array:

```json
"solution": {
    "correctAnswers": {
        "5": ["ciencias", "matemáticas", "física"],
        "6": ["ciencias", "matemáticas", "física"]
    }
}
```

**Rechazada porque:**
- ❌ Rompe la estructura actual de solution (breaking change)
- ❌ Duplica información ya en `content->blanks[].alternatives`
- ❌ Requiere cambios en múltiples funciones SQL
- ❌ Requiere cambios en seeds de todos los ejercicios
- ❌ Mayor riesgo de bugs

### Alternativa 2: Validación en Backend (TypeScript)
Mover la lógica de alternativas al servicio backend.

**Rechazada porque:**
- ❌ Viola el principio de validación centralizada en SQL
- ❌ Duplica lógica de validación en dos capas
- ❌ Dificulta auditoría (registros de validación incompletos)
- ❌ Mayor complejidad de mantenimiento

### Alternativa 3: Mantener status quo
No implementar alternativas, modificar documentación para aceptar solo 1 respuesta.

**Rechazada porque:**
- ❌ Contradice la justificación pedagógica (Marie Curie estudió matemáticas Y física)
- ❌ Limita artificialmente las respuestas válidas
- ❌ No resuelve el problema de estudiantes con respuestas correctas rechazadas

---

## Consecuencias

### Positivas

1. **Problema crítico resuelto:**
   - ✅ Las 6 combinaciones válidas ahora son aceptadas (vs 1 anterior)
   - ✅ Estudiantes ya no reciben calificaciones incorrectas
   - ✅ Alineación 100% con documentación pedagógica

2. **Solución genérica y reutilizable:**
   - ✅ Cualquier ejercicio completar_espacios puede usar alternatives
   - ✅ No requiere cambios en backend o frontend
   - ✅ Estructura de seeds ya soportaba esto

3. **Compatibilidad hacia atrás:**
   - ✅ Parámetro `p_content` es opcional (DEFAULT NULL)
   - ✅ Ejercicios sin alternatives siguen funcionando igual
   - ✅ No breaking changes

4. **Mejor arquitectura:**
   - ✅ Validación sigue centralizada en SQL
   - ✅ Usa estructura existente en seeds
   - ✅ No duplica información
   - ✅ Auditoría completa en una sola capa

### Negativas

1. **Mayor complejidad en función SQL:**
   - ⚠️ Loop adicional para validar alternatives
   - **Mitigación:** Complejidad es O(n) donde n < 5 típicamente (aceptable)

2. **Cambio en firma de función:**
   - ⚠️ Nuevo parámetro `p_content`
   - **Mitigación:** Es opcional (DEFAULT NULL), no rompe compatibilidad

3. **Dependencia en estructura de `content->blanks[]`:**
   - ⚠️ Función asume que `blanks` es un array con estructura específica
   - **Mitigación:** Estructura ya validada en seeds, es estándar del proyecto

### Neutras

- **Performance:** Incremento < 5ms por validación (insignificante)
- **Testing:** Requiere tests adicionales (ya implementados: 7/7 pasados)

---

## Validación

### Tests Ejecutados (7/7 PASARON)

| Test | Combinación | Score | is_correct | Resultado |
|------|-------------|-------|------------|-----------|
| 1 | ciencias + física | 100 | true | ✅ PASS |
| 2 | ciencias + matemáticas | 100 | true | ✅ PASS |
| 3 | física + matemáticas | 100 | true | ✅ PASS |
| 4 | matemáticas + ciencias | 100 | true | ✅ PASS |
| 5 | matemáticas + física | 100 | true | ✅ PASS |
| 6 | física + ciencias | 100 | true | ✅ PASS |
| 7 | Polonia + matemáticas (incorrecto) | 83 | false | ✅ PASS |

**SUCCESS RATE: 100%**

### Validación de Compatibilidad

- ✅ Recreación de base de datos exitosa
- ✅ Carga limpia sin errores
- ✅ Otros ejercicios completar_espacios no afectados
- ✅ Backend: validación anti-redundancia sigue activa
- ✅ Frontend: componente `FillBlankActivity` sin cambios

---

## Alineación Entre Capas

### Database (✅ ACTUALIZADA)
- **Seeds:** Estructura con `alternatives` mantenida
- **Función SQL:** Ahora lee y usa `alternatives`
- **Validación:** Acepta múltiples respuestas válidas

### Backend (✅ COMPATIBLE)
- **Anti-redundancia:** Validación de espacios 5 y 6 sigue activa
- **DTO:** Sin cambios necesarios
- **Servicio:** Llama a SQL que ahora valida correctamente

### Frontend (✅ COMPATIBLE)
- **Componente:** `FillBlankActivity` normaliza respuestas
- **Interfaz:** Sin cambios necesarios
- **Flujo:** Usuario envía respuestas → backend valida → SQL valida correctamente

---

## Aplicabilidad Futura

Esta decisión establece un **patrón estándar** para ejercicios con múltiples respuestas válidas:

### Cómo usar alternatives en nuevos ejercicios

1. **En seeds (content->blanks):**
```json
"blanks": [
    {
        "id": "1",
        "position": 0,
        "correctAnswer": "respuesta_principal",
        "alternatives": ["alternativa1", "alternativa2"]
    }
]
```

2. **En seeds (solution):**
```json
"solution": {
    "correctAnswers": {
        "1": "respuesta_principal"
    }
}
```

3. **Validación automática:**
La función SQL `validate_fill_in_blank` ahora valida automáticamente contra `correctAnswer` **O** cualquier `alternative`.

### Casos de uso aplicables

- ✅ Sinónimos (ej: "feliz" / "contento" / "alegre")
- ✅ Formatos variados (ej: "1900" / "mil novecientos")
- ✅ Traducciones (ej: "science" / "ciencia")
- ✅ Nombres alternativos (ej: "Marie Curie" / "Marie Sklodowska-Curie")

---

## Referencias

### Documentación del Problema
- `orchestration/agentes/architecture-analyst/ejercicio-1-3-validacion-alternativas-2025-11-24/01-ANALISIS-GAP.md`
- `docs/10-requirements/testing-guides/guia-pruebas-modulo-1.md` (líneas 372-386)

### Implementación
- `orchestration/agentes/architecture-analyst/ejercicio-1-3-validacion-alternativas-2025-11-24/02-PLAN-CORRECCION.md`
- `orchestration/agentes/database/ejercicio-1-3-validacion-alternativas-2025-11-24/00-RESUMEN-EJECUTIVO.md`

### Código Afectado
- `apps/database/ddl/schemas/educational_content/functions/06-validate_fill_in_blank.sql`
- `apps/database/ddl/schemas/educational_content/functions/02-validate_answer.sql`
- `apps/database/seeds/prod/educational_content/02-exercises-module1.sql`

### Directivas Aplicadas
- `orchestration/directivas/DIRECTIVA-POLITICA-CARGA-LIMPIA.md`
- `orchestration/directivas/DIRECTIVA-DOCUMENTACION-OBLIGATORIA.md`

---

## Decisiones Relacionadas

- **ADR-001:** Estructura de ejercicios en JSONB
- **ADR-005:** Validación centralizada en SQL
- **ADR-010:** Documento de diseño como fuente de verdad

---

## Notas de Implementación

**Fecha de implementación:** 2025-11-24
**Implementado por:** Database-Agent
**Revisado por:** Architecture-Analyst
**Aprobado para producción:** ⏳ Pendiente

**Testing:**
- ✅ Unit tests (SQL): 7/7 pasados
- ⏳ Integration tests (Backend): Pendiente
- ⏳ E2E tests (Frontend): Pendiente

**Rollout:**
- Ambiente: DEV ✅ COMPLETADO
- Ambiente: STAGING ⏳ Pendiente
- Ambiente: PRODUCTION ⏳ Pendiente

---

**Estado:** ✅ **ACEPTADO E IMPLEMENTADO**
**Revisión:** Anual (2026-11-24)
