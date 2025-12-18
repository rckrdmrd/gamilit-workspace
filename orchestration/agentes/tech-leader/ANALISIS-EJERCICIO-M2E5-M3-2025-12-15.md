# ANALISIS COMPLETO: Ejercicio 5 Módulo 2 y Módulo 3

**Fecha:** 2025-12-15
**Rol:** Tech Leader
**Proyecto:** Gamilit
**Problema Reportado:** Al enviar respuestas del ejercicio 5 módulo 2, el modal muestra "0 puntos, 0 XP, 0 ML Coins"

---

## FASE 1: ANÁLISIS DEL PROBLEMA

### 1.1 Descripción del Problema

El usuario reporta que al completar el **Ejercicio 5 del Módulo 2 (Rueda de Inferencias)**:
- El modal de evaluación muestra "Ejercicio Completado"
- Score: **0 puntos**
- XP: **0**
- ML Coins: **0**

Esto indica que las respuestas no se están validando correctamente y por consecuencia no se asignan recompensas.

### 1.2 Arquitectura del Sistema de Validación

El sistema tiene una **arquitectura dual**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                          │
│  useExerciseSubmission.ts → POST /educational/exercises/{id}/submit         │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    exercises.controller.ts                                  │
│  ┌─────────────────────────────┐    ┌────────────────────────────────────┐ │
│  │ requires_manual_grading=true│    │ requires_manual_grading=false      │ │
│  │         (M4, M5)            │    │     (M1, M2, M3 autocorregibles)   │ │
│  │              │              │    │                │                   │ │
│  │              ▼              │    │                ▼                   │ │
│  │ ExerciseSubmissionService   │    │  validate_and_audit() → SQL       │ │
│  │  (TypeScript validation)    │    │  validate_answer() → SQL          │ │
│  └─────────────────────────────┘    │  validate_rueda_inferencias()     │ │
│                                     └────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.3 Flujo del Ejercicio Rueda de Inferencias

**Archivo Frontend:** `RuedaInferenciasExercise.tsx`

El frontend envía:
```typescript
const answers: RuedaInferenciasAnswers = {
  fragments: { "frag-1": "texto usuario", "frag-2": "texto usuario" },
  fragmentStates: [
    { fragmentId: "frag-1", categoryId: "cat-literal", userText: "...", timeSpent: 30 },
    { fragmentId: "frag-2", categoryId: "cat-inferencial", userText: "...", timeSpent: 28 }
  ],
  categoryId: "cat-literal",
  timeSpent: 120
};
```

**Archivo Backend:** `exercises.controller.ts:1029-1036`

```typescript
const validationResult = await this.dataSource.query(`
  SELECT * FROM educational_content.validate_and_audit(
    $1::UUID,
    $2::UUID,
    $3::JSONB,
    $4::INTEGER
  )
`, [exerciseId, profileId, JSON.stringify(normalized.answers), attemptNumber]);
```

---

## FASE 2: IDENTIFICACIÓN DE LA CAUSA RAÍZ

### 2.1 PROBLEMA CRÍTICO: Desajuste de Estructura seed vs SQL

**Archivo Seed:** `03-exercises-module2.sql:482-517`

```json
{
  "validation": { "minKeywords": 2, "minLength": 20, "maxLength": 200 },
  "fragments": [
    {
      "id": "frag-1",
      "text": "Marie Curie fue pionera...",
      "categoryExpectations": {
        "cat-literal": {
          "keywords": ["pionera", "radiactividad", "nobel", ...],
          "description": "Identifica hechos explícitos del texto",
          "example": "Marie fue la primera mujer...",
          "points": 20
        },
        "cat-inferencial": { ... "points": 25 },
        "cat-critico": { ... "points": 30 },
        "cat-creativo": { ... "points": 25 }
      }
    }
  ]
}
```

**Función SQL:** `14-validate_rueda_inferencias.sql:262-264`

```sql
-- Busca keywords y points DIRECTAMENTE en el fragment
v_keywords := v_fragment_solution->'keywords';           -- ← RETORNA NULL
v_fragment_points := COALESCE((v_fragment_solution->>'points')::INTEGER, 20);  -- ← RETORNA 20 (default)
```

### 2.2 Análisis de la Falla

1. El seed tiene estructura con **`categoryExpectations`** que contiene keywords por categoría
2. La función SQL busca **`keywords`** directamente en el fragment → **NO EXISTE**
3. `v_keywords` es **NULL**
4. El loop de validación no encuentra coincidencias
5. Score calculado = **0**

### 2.3 Información Adicional Relevante

El frontend envía `fragmentStates` con `categoryId` para indicar qué categoría usó el usuario, pero:
- La función SQL **NO usa** `fragmentStates`
- La función SQL **NO considera** `categoryExpectations`
- Solo busca `keywords` flat que no existe en el seed

---

## FASE 3: COMPONENTES AFECTADOS

### 3.1 Archivos que Requieren Modificación

| Archivo | Tipo | Acción Requerida |
|---------|------|------------------|
| `ddl/schemas/educational_content/functions/14-validate_rueda_inferencias.sql` | SQL | Modificar para manejar `categoryExpectations` |
| `seeds/prod/educational_content/03-exercises-module2.sql` | Seed | Verificar estructura (ya tiene estructura correcta) |
| `seeds/dev/educational_content/03-exercises-module2.sql` | Seed | Sincronizar con prod |

### 3.2 Dependencias del Cambio

```
validate_rueda_inferencias()
    ↑ llamada por
validate_answer() [02-validate_answer.sql:169-177]
    ↑ llamada por
validate_and_audit() [20-validate_and_audit.sql:94-98]
    ↑ llamada por
exercises.controller.ts:1029-1036
```

### 3.3 Consideraciones para la Corrección

**Opción A: Modificar función SQL (RECOMENDADA)**
- Pros: El seed ya tiene la estructura rica con categorías
- Cons: Requiere lógica más compleja en SQL

**Opción B: Modificar seed a estructura flat**
- Pros: SQL más simple
- Cons: Se pierde funcionalidad de categorías

**DECISIÓN:** Opción A - Modificar función SQL para aprovechar la estructura de categorías.

---

## FASE 4: VERIFICACIÓN MÓDULO 3

### 4.1 Estado de Ejercicios Módulo 3

Los ejercicios del módulo 3 tienen `requires_manual_grading = true`, lo cual significa que van por el flujo de `ExerciseSubmissionService` y **NO** usan la validación SQL automática.

```sql
-- Ejercicio 3.1 Análisis de Fuentes (03-exercises-module3.sql:144)
requires_manual_grading = true
```

### 4.2 Respuestas Esperadas (según documento)

Del archivo `EJERCICIOS-PREGUNTAS-RESPUESTAS.md`:

**Módulo 3 - Ejercicio 3.1 (Análisis de Fuentes):**
- Tipo: Ordenamiento de fuentes por credibilidad
- Orden correcto: `["src5", "src1", "src3", "src4", "src2"]`
- Validación: Automática por orden correcto

**PROBLEMA IDENTIFICADO:** El seed tiene `requires_manual_grading = true` pero debería ser `false` ya que tiene `solution.correctOrder` definido para validación automática.

---

## FASE 5: PLAN DE CORRECCIONES

### 5.1 Corrección Principal - Función SQL Rueda Inferencias

**Archivo:** `ddl/schemas/educational_content/functions/14-validate_rueda_inferencias.sql`

**Cambio Requerido:**
1. Modificar la función para aceptar estructura con `categoryExpectations`
2. Usar `categoryId` del `submitted_answer.fragmentStates` para seleccionar keywords correctas
3. Fallback a estructura flat si no existe `categoryExpectations`

**Lógica propuesta:**
```sql
-- Buscar keywords según categoría del usuario
v_category_id := COALESCE(
  (v_fragments_submitted->'fragmentStates'->0->>'categoryId'),
  'cat-literal'
);

IF v_fragment_solution ? 'categoryExpectations' THEN
  -- Nueva estructura con categorías
  v_keywords := v_fragment_solution->'categoryExpectations'->v_category_id->'keywords';
  v_fragment_points := COALESCE(
    (v_fragment_solution->'categoryExpectations'->v_category_id->>'points')::INTEGER,
    20
  );
ELSE
  -- Estructura flat legacy
  v_keywords := v_fragment_solution->'keywords';
  v_fragment_points := COALESCE((v_fragment_solution->>'points')::INTEGER, 20);
END IF;
```

### 5.2 Corrección Secundaria - Ejercicios Módulo 3

**Archivos:**
- `seeds/prod/educational_content/04-exercises-module3.sql`
- `seeds/dev/educational_content/04-exercises-module3.sql`

**Cambio:** Verificar y actualizar `requires_manual_grading` para ejercicios que tienen validación automática definida.

---

## FASE 6: VALIDACIÓN DE DEPENDENCIAS

### 6.1 Impacto de Cambios

| Cambio | Impacto | Riesgo |
|--------|---------|--------|
| Modificar `validate_rueda_inferencias()` | Solo ejercicios tipo `rueda_inferencias` | Bajo |
| Agregar soporte `categoryExpectations` | Nuevo código, no rompe existente | Bajo |
| Verificar `requires_manual_grading` M3 | Puede cambiar flujo de validación | Medio |

### 6.2 Pruebas Requeridas

1. **Unit Test SQL:** Verificar función con ambas estructuras (flat y categoryExpectations)
2. **Integration Test:** Enviar respuesta ejercicio 2.5 y verificar score > 0
3. **Regression Test:** Verificar que otros ejercicios M2 sigan funcionando

---

## CONCLUSIÓN

**Causa Raíz:** La función SQL `validate_rueda_inferencias()` busca `keywords` directamente en el fragment, pero el seed usa estructura `categoryExpectations[categoryId].keywords`.

**Solución:** Modificar la función SQL para manejar la estructura con categorías, usando el `categoryId` enviado por el frontend para seleccionar las keywords correctas.

**Próximos Pasos:**
1. Crear función SQL actualizada
2. Ejecutar en base de datos
3. Probar ejercicio 2.5
4. Verificar asignación de XP y ML Coins
