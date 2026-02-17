# ET-EDU-004: Validadores de Ejercicios

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-EDU-004 |
| **Módulo** | 03 - Contenido Educativo |
| **Título** | Sistema de Validadores de Ejercicios |
| **Prioridad** | Alta |
| **Estado** | ✅ Implementado |
| **Versión** | 1.1 |
| **Fecha Creación** | 2025-11-19 |
| **Última Actualización** | 2025-11-28 |
| **Autor** | Database Agent - DB-123 |
| **Reviewers** | Backend Team, Frontend Team |
| **Relacionado** | ET-EDU-001, RF-EDU-001, DB-117, DB-123, FE-059 |

---

## 🔗 Referencias

### Documentos Relacionados

- [ET-EDU-001: Mecánicas de Ejercicios](./ET-EDU-001-mecanicas-ejercicios.md) - Documento padre
- [RF-EDU-001: Requerimientos de Mecánicas](../requirements/RF-EDU-001-mecanicas-ejercicios.md) - Formatos DTO
- [DATOS-GAMIFICACION](../../../../20-architecture/DATOS-GAMIFICACION.md) - Contexto de implementación
- [COHERENCE-ENTITIES-DDL](../../../../20-architecture/COHERENCE-ENTITIES-DDL.md) - Trazabilidad técnica relacionada

### Implementación

- **Funciones SQL:** `apps/database/ddl/schemas/educational_content/functions/`
- **Configuración:** `apps/database/seeds/prod/educational_content/10-exercise_validation_config.sql`
- **Testing Seeds:** `apps/database/seeds/dev/educational_content/10-test-nuevos-validadores-FE-059.sql`
- **Tareas:** DB-117 (creación validadores), DB-123 (configuraciones), FE-059 (specifications)

---

## 📖 Descripción

El **Sistema de Validadores de Ejercicios** es el componente responsable de verificar la corrección de las respuestas de los estudiantes en la plataforma GAMILIT. Implementado completamente en PostgreSQL mediante funciones PL/pgSQL, este sistema:

- ✅ Valida respuestas de 15+ tipos de ejercicios diferentes
- ✅ Proporciona feedback detallado y pedagógicamente relevante
- ✅ Soporta crédito parcial y múltiples criterios de evaluación
- ✅ Integra con el sistema de gamificación (XP, ML-Coins)
- ✅ Mantiene auditoría completa de todas las validaciones
- ✅ Es extensible para nuevos tipos de ejercicios

---

## 🏗️ Arquitectura

### Flujo de Validación Completo

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React)                               │
│  - ExerciseComponent renderiza ejercicio                               │
│  - Usuario completa ejercicio                                          │
│  - handleSubmit() envía respuesta a Backend                            │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │ POST /api/exercises/:id/submit
                           │ { userId, answer: {...} }
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          BACKEND (NestJS)                               │
│  - ExercisesController.submit()                                        │
│  - ExercisesService.submitAnswer()                                     │
│  - Llama DB: SELECT * FROM validate_and_audit(...)                     │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │ SQL Query
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       DATABASE (PostgreSQL)                             │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────┐    │
│  │ validate_and_audit(exercise_id, user_id, answer)              │    │
│  │                                                               │    │
│  │  1. SELECT exercise FROM exercises WHERE id = exercise_id     │    │
│  │  2. SELECT config FROM exercise_validation_config             │    │
│  │     WHERE exercise_type = exercise.exercise_type              │    │
│  │                                                               │    │
│  │  3. CASE config.validation_function                           │    │
│  │       WHEN 'validate_detective_connections'                   │    │
│  │       WHEN 'validate_prediction_scenarios'                    │    │
│  │       WHEN 'validate_cause_effect_matching'                   │    │
│  │       WHEN ...                                                │    │
│  │     → Ejecuta validador específico                            │    │
│  │                                                               │    │
│  │  4. INSERT INTO exercise_validation_audit (...)               │    │
│  │                                                               │    │
│  │  5. RETURN (is_correct, score, feedback, details)             │    │
│  └───────────────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │ Result: {is_correct, score, feedback, details}
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          BACKEND (NestJS)                               │
│  - Retorna resultado a Frontend                                        │
│  - Opcional: Actualiza user_stats, otorga XP, ML-Coins                │
└──────────────────────────┬──────────────────────────────────────────────┘
                           │ HTTP Response
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React)                               │
│  - Muestra feedback visual (✅ correcto / ❌ incorrecto)                │
│  - Renderiza detalles y explicaciones                                  │
│  - Actualiza UI con score obtenido                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 💾 Validadores Implementados

### Tabla Resumen

| # | Tipo de Ejercicio | Validador | Módulo | Estado | Creado |
|---|-------------------|-----------|--------|--------|--------|
| 1 | crucigrama | `validate_crucigrama()` | M1 - Literal | ✅ | DB-116 |
| 2 | linea_tiempo | `validate_timeline()` | M1 - Literal | ✅ | DB-116 |
| 3 | sopa_letras | `validate_word_search()` | M1 - Literal | ✅ | DB-116 |
| 4 | completar_espacios | `validate_fill_in_blank()` | M1 - Literal | ✅ | DB-116 |
| 5 | verdadero_falso | `validate_true_false()` | M1 - Literal | ✅ | DB-116 |
| 6 | mapa_conceptual | `validate_mapa_conceptual()` | M1 - Literal | ✨ **NUEVO** | BUG-004 |
| 7 | emparejamiento | `validate_emparejamiento()` | M1 - Literal | ✨ **NUEVO** | BUG-004 |
| 8 | detective_textual | `validate_detective_connections()` | M2 - Inferencial | ✅ | DB-117 |
| 9 | prediccion_narrativa | `validate_prediction_scenarios()` | M2 - Inferencial | ✅ | DB-117 |
| 10 | construccion_hipotesis | `validate_cause_effect_matching()` | M2 - Inferencial | ✅ | DB-117 |
| 11 | puzzle_contexto | `validate_puzzle_contexto()` | M2 - Inferencial | ✅ | DB-116 |
| 12 | rueda_inferencias | `validate_rueda_inferencias()` | M2 - Inferencial | ✅ | DB-116 |
| 13 | tribunal_opiniones | `validate_tribunal_opiniones()` | M3 - Crítica | ✅ | DB-116 |
| 14 | debate_digital | `validate_debate_digital()` | M3 - Crítica | ✅ | DB-116 |
| 15 | analisis_fuentes | `validate_analisis_fuentes()` | M3 - Crítica | ✅ | DB-116 |
| 16 | podcast_argumentativo | `validate_podcast_argumentativo()` | M3 - Crítica | ✅ | DB-116 |
| 17 | matriz_perspectivas | `validate_matriz_perspectivas()` | M3 - Crítica | ✅ | DB-116 |

✨ **2 validadores nuevos agregados en BUG-004** (2025-11-28) para completar ejercicios Módulo 1: `mapa_conceptual` y `emparejamiento`.

✨ **3 validadores agregados en DB-117/FE-059** (2025-11-19) para resolver discrepancias identificadas durante integración frontend-backend.

---

## 🔧 Especificación Técnica

### Firma Estándar de Validadores

Todos los validadores comparten la siguiente firma:

```sql
CREATE OR REPLACE FUNCTION educational_content.validate_[tipo](
    p_solution JSONB,              -- Solución correcta del ejercicio
    p_submitted_answer JSONB,       -- Respuesta enviada por el estudiante
    p_max_points INTEGER,           -- Puntuación máxima posible
    p_allow_partial_credit BOOLEAN DEFAULT true,  -- ¿Permitir crédito parcial?
    OUT is_correct BOOLEAN,         -- ¿Respuesta completamente correcta?
    OUT score INTEGER,              -- Puntuación obtenida (0 a p_max_points)
    OUT feedback TEXT,              -- Mensaje de retroalimentación
    OUT details JSONB               -- Detalles adicionales (errores, correctas, etc.)
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Lógica de validación específica del tipo
    ...
END;
$$;
```

### Parámetros de Entrada

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `p_solution` | JSONB | Solución correcta almacenada en `exercises.solution` | `{"expectedConnections": [...]}` |
| `p_submitted_answer` | JSONB | Respuesta del estudiante desde Frontend | `{"connections": [{...}]}` |
| `p_max_points` | INTEGER | Puntuación máxima del ejercicio | 100 |
| `p_allow_partial_credit` | BOOLEAN | Si se permite crédito parcial | true/false |

### Valores de Retorno

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `is_correct` | BOOLEAN | `true` si la respuesta es 100% correcta | true |
| `score` | INTEGER | Puntuación obtenida (0 a p_max_points) | 75 |
| `feedback` | TEXT | Mensaje de retroalimentación para el estudiante | "3 de 4 conexiones correctas" |
| `details` | JSONB | Detalles específicos (conexiones correctas, errores, etc.) | `{"correctCount": 3, "errors": [...]}` |

---

## 📊 Validadores del Módulo 2 (Nuevos)

### 1. validate_detective_connections()

**Archivo:** `20-validate_detective_connections.sql`
**Implementado:** DB-117 (2025-11-19)
**Propósito:** Validar conexiones entre evidencias en ejercicios tipo tablero detective

#### Formato de Entrada

```json
{
  "connections": [
    {
      "from": "evidence-1",
      "to": "evidence-2",
      "relationship": "Ambos documentos describen las propiedades del radio"
    },
    {
      "from": "evidence-1",
      "to": "evidence-3",
      "relationship": "El cuaderno de laboratorio confirma los experimentos del artículo"
    }
  ]
}
```

#### Formato de Solución

```json
{
  "expectedConnections": [
    {
      "from": "evidence-1",
      "to": "evidence-2",
      "requiredKeywords": ["radio", "propiedades", "radiación"]
    },
    {
      "from": "evidence-1",
      "to": "evidence-3",
      "requiredKeywords": ["experimento", "laboratorio", "confirma"]
    }
  ]
}
```

#### Lógica de Validación

1. Compara pares `from`-`to` (orden flexible)
2. Verifica que `relationship` contenga al menos 50% de `requiredKeywords`
3. Calcula score proporcional: `(conexionesCorrectas / totalEsperadas) × maxPoints`
4. Genera feedback detallado con conexiones correctas e incorrectas

#### Ejemplo de Resultado

```json
{
  "is_correct": false,
  "score": 50,
  "feedback": "1 de 2 conexiones correctas. Revisa la relación entre evidencia-1 y evidencia-3.",
  "details": {
    "correctCount": 1,
    "totalExpected": 2,
    "correctConnections": [{"from": "evidence-1", "to": "evidence-2"}],
    "incorrectConnections": [{"from": "evidence-1", "to": "evidence-3", "reason": "Keywords insuficientes"}]
  }
}
```

---

### 2. validate_prediction_scenarios()

**Archivo:** `21-validate_prediction_scenarios.sql`
**Implementado:** DB-117 (2025-11-19)
**Propósito:** Validar predicciones predefinidas en múltiples escenarios narrativos

#### Formato de Entrada

```json
{
  "scenarios": {
    "scenario-1": "prediction-a",
    "scenario-2": "prediction-c",
    "scenario-3": "prediction-b",
    "scenario-4": "prediction-d"
  }
}
```

#### Formato de Solución

```json
{
  "correctPredictions": {
    "scenario-1": "prediction-a",
    "scenario-2": "prediction-b",
    "scenario-3": "prediction-c",
    "scenario-4": "prediction-d"
  },
  "explanations": {
    "scenario-1": "Basándose en las decisiones previas de Marie Curie...",
    "scenario-2": "El contexto histórico sugiere...",
    "scenario-3": "Los valores de Curie la llevarían a...",
    "scenario-4": "Durante la Primera Guerra Mundial..."
  }
}
```

#### Lógica de Validación

1. Compara predicción por escenario (exacta)
2. Calcula score proporcional: `(escenarios correctos / total escenarios) × maxPoints`
3. Incluye explicaciones en feedback para respuestas incorrectas

#### Ejemplo de Resultado

```json
{
  "is_correct": false,
  "score": 75,
  "feedback": "3 de 4 predicciones correctas. Revisa el escenario 2.",
  "details": {
    "correctCount": 3,
    "totalScenarios": 4,
    "correct": ["scenario-1", "scenario-3", "scenario-4"],
    "incorrect": [
      {
        "scenario": "scenario-2",
        "submitted": "prediction-c",
        "correct": "prediction-b",
        "explanation": "El contexto histórico sugiere..."
      }
    ]
  }
}
```

---

### 3. validate_cause_effect_matching()

**Archivo:** `22-validate_cause_effect_matching.sql`
**Implementado:** DB-117 (2025-11-19)
**Propósito:** Validar matching de causas con múltiples consecuencias mediante drag & drop

#### Formato de Entrada

```json
{
  "causes": {
    "cause-1": ["consequence-a", "consequence-b"],
    "cause-2": ["consequence-c"],
    "cause-3": ["consequence-d", "consequence-e", "consequence-f"]
  }
}
```

#### Formato de Solución

```json
{
  "correctMatches": {
    "cause-1": ["consequence-a", "consequence-b"],
    "cause-2": ["consequence-c"],
    "cause-3": ["consequence-d", "consequence-e", "consequence-f"]
  },
  "allowPartialMatches": true,
  "strictOrder": false
}
```

#### Lógica de Validación

1. Compara arrays de consecuencias por causa
2. `strictOrder: false` → orden de consecuencias no importa
3. `allowPartialMatches: true` → crédito parcial por consecuencias correctas dentro de una causa
4. Calcula score proporcional: `(consecuencias correctas / total consecuencias) × maxPoints`

#### Ejemplo de Resultado

```json
{
  "is_correct": false,
  "score": 83,
  "feedback": "5 de 6 consecuencias asignadas correctamente. Revisa la causa-1.",
  "details": {
    "correctCount": 5,
    "totalCount": 6,
    "causeResults": {
      "cause-1": {
        "correct": ["consequence-a"],
        "incorrect": ["consequence-b"],
        "missing": [],
        "extra": []
      },
      "cause-2": {"correct": ["consequence-c"]},
      "cause-3": {"correct": ["consequence-d", "consequence-e", "consequence-f"]}
    }
  }
}
```

---

## 🗄️ Configuración de Validadores

### Tabla: exercise_validation_config

```sql
CREATE TABLE educational_content.exercise_validation_config (
    exercise_type educational_content.exercise_type PRIMARY KEY,
    validation_function VARCHAR(100) NOT NULL,
    case_sensitive BOOLEAN DEFAULT false,
    allow_partial_credit BOOLEAN DEFAULT true,
    fuzzy_matching_threshold DECIMAL(3,2),
    normalize_text BOOLEAN DEFAULT true,
    special_rules JSONB,
    default_max_points INTEGER DEFAULT 100,
    default_passing_score INTEGER DEFAULT 70,
    description TEXT,
    examples JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico()
);
```

### Campos Clave

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `exercise_type` | Tipo de ejercicio (PK) | 'detective_textual' |
| `validation_function` | Nombre de la función SQL a llamar | 'validate_detective_connections' |
| `allow_partial_credit` | ¿Permitir crédito parcial? | true |
| `special_rules` | Reglas específicas por tipo (JSONB) | `{"minCorrectConnections": 2}` |
| `description` | Descripción de la validación | "Valida conexiones entre evidencias..." |
| `examples` | Ejemplos de uso (JSONB) | `{"submitted": {...}, "solution": {...}}` |

### Configuraciones Actualizadas (DB-123)

Las siguientes configuraciones fueron actualizadas el 2025-11-19:

```sql
-- Detective Textual
UPDATE exercise_validation_config
SET validation_function = 'validate_detective_connections',
    special_rules = '{"minCorrectConnections": 2, "allowPartialCredit": true, "validateKeywords": true}'::jsonb
WHERE exercise_type = 'detective_textual';

-- Predicción Narrativa
UPDATE exercise_validation_config
SET validation_function = 'validate_prediction_scenarios',
    special_rules = '{"allowPartialCredit": true}'::jsonb
WHERE exercise_type = 'prediccion_narrativa';

-- Causa-Efecto
UPDATE exercise_validation_config
SET validation_function = 'validate_cause_effect_matching',
    special_rules = '{"allowPartialMatches": true, "strictOrder": false}'::jsonb
WHERE exercise_type = 'construccion_hipotesis';
```

---

## 🔍 Función Dispatcher

### validate_and_audit()

**Archivo:** `apps/database/ddl/schemas/educational_content/functions/20-validate_and_audit.sql`

Esta función es el **punto de entrada único** para todas las validaciones en GAMILIT.

#### Responsabilidades

1. ✅ Recuperar ejercicio y su configuración de validación
2. ✅ Ejecutar validador específico según `validation_function`
3. ✅ Crear registro de auditoría completo
4. ✅ Retornar resultado estructurado

#### Firma

```sql
CREATE OR REPLACE FUNCTION educational_content.validate_and_audit(
    p_exercise_id UUID,
    p_user_id UUID,
    p_submitted_answer JSONB,
    OUT is_correct BOOLEAN,
    OUT score INTEGER,
    OUT feedback TEXT,
    OUT details JSONB
)
```

#### Código Simplificado

```sql
BEGIN
    -- 1. Recuperar ejercicio
    SELECT * INTO v_exercise
    FROM educational_content.exercises
    WHERE id = p_exercise_id;

    -- 2. Recuperar configuración
    SELECT * INTO v_config
    FROM educational_content.exercise_validation_config
    WHERE exercise_type = v_exercise.exercise_type;

    -- 3. Ejecutar validador específico
    CASE v_config.validation_function
        WHEN 'validate_detective_connections' THEN
            SELECT * INTO v_result
            FROM educational_content.validate_detective_connections(
                v_exercise.solution,
                p_submitted_answer,
                v_config.default_max_points,
                v_config.allow_partial_credit
            );

        WHEN 'validate_prediction_scenarios' THEN
            SELECT * INTO v_result
            FROM educational_content.validate_prediction_scenarios(...);

        WHEN 'validate_cause_effect_matching' THEN
            SELECT * INTO v_result
            FROM educational_content.validate_cause_effect_matching(...);

        -- ... otros validadores ...
    END CASE;

    -- 4. Crear auditoría
    INSERT INTO educational_content.exercise_validation_audit (
        exercise_id, user_id, submitted_answer,
        is_correct, score, feedback, details
    ) VALUES (
        p_exercise_id, p_user_id, p_submitted_answer,
        v_result.is_correct, v_result.score, v_result.feedback, v_result.details
    );

    -- 5. Retornar resultado
    is_correct := v_result.is_correct;
    score := v_result.score;
    feedback := v_result.feedback;
    details := v_result.details;
END;
```

---

## 🧪 Testing

### Seeds de Testing

**Archivo:** `apps/database/seeds/dev/educational_content/10-test-nuevos-validadores-FE-059.sql`

#### Ejercicios de Prueba

| Order Index | Tipo | Título | Propósito |
|-------------|------|--------|-----------|
| 101 | detective_textual | Investigación de los Descubrimientos de Curie | Validar conexiones entre 4 evidencias históricas |
| 102 | prediccion_narrativa | Las Decisiones de Marie Curie | Validar predicciones en 4 escenarios históricos |
| 103 | construccion_hipotesis | Impacto de los Descubrimientos de Curie | Validar matching de 5 causas con 15 consecuencias |

#### Testing Manual

```sql
-- Test 1: Detective Connections
SELECT * FROM educational_content.validate_and_audit(
    (SELECT id FROM educational_content.exercises WHERE order_index = 101),
    (SELECT id FROM auth_management.users WHERE email = 'student@gamilit.com'),
    '{"connections": [
        {"from": "evidence-1", "to": "evidence-2", "relationship": "Ambos hablan del experimento de radiación"}
    ]}'::jsonb
);

-- Test 2: Prediction Scenarios
SELECT * FROM educational_content.validate_and_audit(
    (SELECT id FROM educational_content.exercises WHERE order_index = 102),
    (SELECT id FROM auth_management.users WHERE email = 'student@gamilit.com'),
    '{"scenarios": {"s1": "pred_a", "s2": "pred_b", "s3": "pred_c", "s4": "pred_d"}}'::jsonb
);

-- Test 3: Cause-Effect Matching
SELECT * FROM educational_content.validate_and_audit(
    (SELECT id FROM educational_content.exercises WHERE order_index = 103),
    (SELECT id FROM auth_management.users WHERE email = 'student@gamilit.com'),
    '{"causes": {"c1": ["cons1", "cons2"], "c2": ["cons3"], "c3": ["cons4"]}}'::jsonb
);
```

---

## 📈 Métricas y Performance

### Optimizaciones

1. **Índices en exercise_validation_config:**
   ```sql
   CREATE UNIQUE INDEX idx_exercise_validation_config_pk ON exercise_validation_config(exercise_type);
   ```

2. **SECURITY DEFINER:** Todas las funciones usan `SECURITY DEFINER` para ejecutar con permisos del owner, permitiendo acceso desde `backend_api_role` sin permisos directos en tablas.

3. **JSONB Operators:** Uso intensivo de operadores JSONB (`->`, `->>`, `@>`, `?`) para parsing eficiente.

### Performance Esperado

| Validador | Complejidad | Tiempo Estimado (p95) |
|-----------|-------------|-----------------------|
| validate_crucigrama() | O(n) - n claves | <10ms |
| validate_timeline() | O(n log n) - ordenamiento | <15ms |
| validate_detective_connections() | O(n × m) - n conexiones, m keywords | <20ms |
| validate_prediction_scenarios() | O(n) - n escenarios | <10ms |
| validate_cause_effect_matching() | O(n × m) - n causas, m consecuencias | <25ms |

---

## 🔐 Seguridad y Permisos

### Grants

```sql
-- Otorgar permisos de ejecución al backend
GRANT EXECUTE ON FUNCTION educational_content.validate_and_audit(UUID, UUID, JSONB)
TO backend_api_role;

GRANT EXECUTE ON FUNCTION educational_content.validate_detective_connections(JSONB, JSONB, INTEGER, BOOLEAN)
TO backend_api_role;

-- ... (otros validadores)
```

### Auditoría

Todas las validaciones se registran en `exercise_validation_audit`:

```sql
CREATE TABLE educational_content.exercise_validation_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id UUID NOT NULL REFERENCES educational_content.exercises(id),
    user_id UUID NOT NULL,
    submitted_answer JSONB NOT NULL,
    is_correct BOOLEAN NOT NULL,
    score INTEGER NOT NULL,
    feedback TEXT,
    details JSONB,
    validated_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),
    validation_duration_ms INTEGER
);
```

---

## 📅 Historial de Cambios

### v1.0 (2025-11-19) - Creación Inicial

- **DB-117:** Creación de 3 nuevos validadores
  - `validate_detective_connections()`
  - `validate_prediction_scenarios()`
  - `validate_cause_effect_matching()`
- **DB-123:** Actualización de configuraciones
  - Cambio de `detective_textual` a usar `validate_detective_connections`
  - Cambio de `prediccion_narrativa` a usar `validate_prediction_scenarios`
  - Cambio de `construccion_hipotesis` a usar `validate_cause_effect_matching`
- **FE-059:** Especificaciones SQL y seeds de testing creados
- **Documentación:** ET-EDU-004 creado como especificación técnica dedicada

---

## 🔗 Referencias Adicionales

- [MECANICAS-GAMIFICACION-V6](../../../../20-architecture/MECANICAS-GAMIFICACION-V6.md) - Diseño pedagógico y mecánicas
- [BACKLOG-NORMALIZACION-FASE2](../../../../../orchestration/referencias/BACKLOG-NORMALIZACION-FASE2.md) - Registro de remediación documental
- [PROXIMA-ACCION](../../../../../orchestration/PROXIMA-ACCION.md) - Estado de ejecución y validación

---

**Documento creado:** 2025-11-19
**Estado:** ✅ Implementado y Documentado
**Próximos pasos:** Testing end-to-end con Frontend y Backend
