# 📐 Especificación de Validaciones por Tipo de Ejercicio

**Fecha:** 2025-11-19
**Versión:** 1.0
**Autor:** Database Agent
**Alcance:** 15 tipos de ejercicios (Módulos 1-3)

---

## 🎯 Arquitectura de Validación

### Flujo General

```
Frontend                    Backend                     Database
────────                    ───────                     ────────
User submits    ──────>  ExerciseAnswerValidator    ──────>  validate_and_audit()
answers                  (DTO validation)                         │
│                               │                                  │
│                               ✅ Structure OK                    ▼
│                               │                          validate_answer()
│                               ▼                                  │
│                      exercise-submission                         ├──> validate_crucigrama()
│                      .service.ts                                 ├──> validate_timeline()
│                               │                                  ├──> validate_word_search()
│                               │                                  ├──> validate_fill_in_blank()
│                               ▼                                  ├──> validate_true_false()
│                      autoGrade() calls                          ├──> validate_detective_textual()
│                      validate_and_audit()                       ├──> ... (15 total)
│                               │                                  │
│                               │                                  ▼
│                               │                         Auditoría automática
│                               │                                  │
│                               ▼                                  │
│                      {                                           │
│                        score: 85,                                │
│                        isCorrect: false,                         │
│                        correctAnswers: 8,                        │
│                        totalQuestions: 10,                       │
User receives  <────     feedback: "...",                          │
feedback                  details: {...},                          │
                          auditId: "uuid"                          │
                      }                                            │
                               ▲                                   │
                               │                                   │
                               └───────────────────────────────────┘
```

---

## 📊 Capas de Validación

### Capa 1: Frontend (Validación de UI)

**Propósito:** Prevenir envíos obviamente inválidos

**Ubicación:** `apps/frontend/src/features/mechanics/*/`

**Ejemplos:**
- Campo vacío → Botón "Enviar" deshabilitado
- Formato incorrecto → Mensaje de error en tiempo real
- Datos requeridos faltantes → Tooltip con instrucción

**Limitaciones:**
- ✅ Mejora UX (feedback inmediato)
- ❌ NO es seguro (puede bypassearse desde DevTools)
- ❌ NUNCA contiene respuestas correctas

---

### Capa 2: Backend DTO (Validación de Estructura)

**Propósito:** Garantizar estructura de datos correcta ANTES de guardar en DB

**Ubicación:** `apps/backend/src/modules/progress/dto/answers/`

**Clase principal:** `ExerciseAnswerValidator`

**Proceso:**

1. **Mapeo tipo → DTO**
   ```typescript
   getDtoForType('crucigrama') → CrucigramaAnswersDto
   getDtoForType('sopa_letras') → WordSearchAnswersDto
   ```

2. **Transformación + Validación**
   ```typescript
   const dto = plainToInstance(DtoClass, answers);
   const errors = await validate(dto);
   ```

3. **Resultado**
   - ✅ Estructura válida → Continúa a DB
   - ❌ Estructura inválida → `400 Bad Request` con detalles

**DTOs implementados (15):**

| Módulo | exercise_type | DTO Class |
|--------|---------------|-----------|
| **1** | crucigrama | CrucigramaAnswersDto |
| **1** | linea_tiempo | TimelineAnswersDto |
| **1** | completar_espacios | FillInBlankAnswersDto |
| **1** | verdadero_falso | TrueFalseAnswersDto |
| **1** | sopa_letras | WordSearchAnswersDto |
| **2** | detective_textual | DetectiveTextualAnswersDto |
| **2** | construccion_hipotesis | ConstruccionHipotesisAnswersDto |
| **2** | prediccion_narrativa | PrediccionNarrativaAnswersDto |
| **2** | puzzle_contexto | PuzzleContextoAnswersDto |
| **2** | rueda_inferencias | RuedaInferenciasAnswersDto |
| **3** | tribunal_opiniones | TribunalOpinionesAnswersDto |
| **3** | analisis_fuentes | AnalisisFuentesAnswersDto |
| **3** | debate_digital | DebateDigitalAnswersDto |
| **3** | podcast_argumentativo | PodcastArgumentativoAnswersDto |
| **3** | matriz_perspectivas | MatrizPerspectivasAnswersDto |

---

### Capa 3: Database SQL (Validación de Contenido)

**Propósito:** Única fuente de verdad para validar CORRECCIÓN de respuestas

**Ubicación:** `apps/database/ddl/schemas/educational_content/functions/`

#### Función Principal: `validate_and_audit()`

**Signatura:**

```sql
SELECT * FROM educational_content.validate_and_audit(
    p_exercise_id UUID,
    p_user_id UUID,
    p_submitted_answer JSONB,
    p_attempt_number INTEGER,
    p_client_metadata JSONB DEFAULT '{}'::jsonb
);
```

**Retorna:**

```sql
RECORD (
    is_correct BOOLEAN,
    score INTEGER,
    max_score INTEGER,
    feedback TEXT,
    details JSONB,
    audit_id UUID
)
```

**Responsabilidades:**

1. ✅ Recupera ejercicio y configuración
2. ✅ Llama a `validate_answer()` (dispatcher)
3. ✅ Crea snapshot inmutable de submission
4. ✅ Guarda auditoría en `exercise_validation_audit`
5. ✅ Retorna resultado + audit_id

**Ventajas:**

- ✅ Validación centralizada (única fuente de verdad)
- ✅ Auditoría automática (compliance, debugging)
- ✅ Snapshots inmutables (para recálculos futuros)
- ✅ Medición de performance (validation_duration_ms)

---

#### Función Dispatcher: `validate_answer()`

**Responsabilidad:** Despachar a función de validación específica según `exercise_type`

**Lógica:**

```sql
CASE v_config.validation_function
    WHEN 'validate_crucigrama' THEN
        SELECT * FROM educational_content.validate_crucigrama(...);
    WHEN 'validate_timeline' THEN
        SELECT * FROM educational_content.validate_timeline(...);
    -- ... (15 casos total)
    ELSE
        RAISE EXCEPTION 'Validation function not implemented: %', v_config.validation_function;
END CASE;
```

**Configuración por tipo:**

Tabla: `educational_content.exercise_validation_config`

```sql
CREATE TABLE exercise_validation_config (
    exercise_type educational_content.exercise_type PRIMARY KEY,
    validation_function TEXT NOT NULL,
    case_sensitive BOOLEAN DEFAULT false,
    allow_partial_credit BOOLEAN DEFAULT true,
    fuzzy_matching_threshold NUMERIC(3,2) DEFAULT 0.80,
    normalize_text BOOLEAN DEFAULT true,
    special_rules JSONB DEFAULT '{}'::jsonb,
    default_max_points INTEGER DEFAULT 100,
    default_passing_score INTEGER DEFAULT 70
);
```

---

## 📋 Validadores Específicos por Módulo

### Módulo 1: Comprensión Literal

#### 1.1. validate_crucigrama

**Archivo:** `03-validate_crucigrama.sql`

**Formato de entrada:**

```json
{
  "clues": {
    "h1": "SORBONA",
    "h2": "NOBEL",
    "v1": "POLONIO",
    "v2": "RADIO"
  }
}
```

**Lógica de validación:**

1. Extrae `clues` de solution y submitted_answer
2. Itera sobre cada clue_id (h1, h2, v1, ...)
3. Normaliza texto (si `normalize_text = true`)
4. Compara case-insensitive (si `case_sensitive = false`)
5. Cuenta palabras correctas vs totales
6. Calcula score proporcional

**Parámetros:**

- `p_case_sensitive` (default: false)
- `p_normalize_text` (default: true)

**Salida details:**

```json
{
  "total_words": 4,
  "correct_words": 3,
  "percentage": 75,
  "results_per_word": [
    {"clue_id": "h1", "is_correct": true, "submitted": "SORBONA", "expected": "SORBONA"},
    {"clue_id": "h2", "is_correct": false, "submitted": "NOBEEL", "expected": "NOBEL"},
    ...
  ]
}
```

---

#### 1.2. validate_timeline

**Archivo:** `04-validate_timeline.sql`

**Formato de entrada:**

```json
{
  "events": [
    {"eventId": "evt1", "position": 1},
    {"eventId": "evt2", "position": 2},
    {"eventId": "evt3", "position": 3}
  ]
}
```

**Lógica:**

1. Compara orden de eventos vs solución
2. Permite crédito parcial (si `allow_partial_credit = true`)
3. Calcula eventos correctamente ordenados

**Parámetros:**

- `p_allow_partial_credit` (default: true)

---

#### 1.3. validate_word_search (Sopa de Letras)

**Archivo:** `05-validate_word_search.sql`

**Formato de entrada:**

```json
{
  "foundWords": ["POLONIO", "RADIO", "NOBEL", "PARIS"]
}
```

**Lógica:**

1. Compara palabras encontradas vs lista completa
2. Normaliza texto (acentos, mayúsculas)
3. Crédito parcial por palabras encontradas

**Parámetros:**

- `p_allow_partial_credit` (default: true)
- `p_normalize_text` (default: true)

---

#### 1.4. validate_fill_in_blank (Completar Espacios)

**Archivo:** `06-validate_fill_in_blank.sql`

**Formato de entrada:**

```json
{
  "blanks": {
    "blank1": "Polonia",
    "blank2": "radioactividad",
    "blank3": "Nobel"
  }
}
```

**Lógica:**

1. Compara cada blank vs solución
2. Soporta fuzzy matching (0.80 threshold por defecto)
3. Soporta alternativas válidas (`special_rules`)
4. Normaliza acentos y espacios

**Parámetros:**

- `p_case_sensitive` (default: false)
- `p_normalize_text` (default: true)
- `p_fuzzy_matching_threshold` (default: 0.80)
- `p_allow_partial_credit` (default: true)

**Fuzzy matching:** Usa algoritmo Levenshtein para permitir errores tipográficos menores.

---

#### 1.5. validate_true_false (Verdadero o Falso)

**Archivo:** `07-validate_true_false.sql`

**Formato de entrada:**

```json
{
  "statements": {
    "stmt1": true,
    "stmt2": false,
    "stmt3": true,
    "stmt4": false
  }
}
```

**Lógica:**

1. Compara cada statement (booleano)
2. Cuenta afirmaciones correctas
3. Crédito parcial o todo-o-nada

**Parámetros:**

- `p_allow_partial_credit` (default: true)

**Ejemplo output:**

```json
{
  "total_statements": 4,
  "correct_statements": 3,
  "percentage": 75,
  "results_per_statement": [
    {"statement_id": "stmt1", "is_correct": true},
    {"statement_id": "stmt2", "is_correct": false, "submitted": "true", "expected": "false"},
    ...
  ]
}
```

---

### Módulo 2: Comprensión Inferencial

#### 2.1. validate_detective_textual

**Archivo:** `10-validate_detective_textual.sql`

**Formato:** Identificación de pistas clave en texto

**Lógica:** Verifica que el usuario haya identificado las pistas correctas

**Parámetros:**

- `p_allow_partial_credit`

---

#### 2.2. validate_construccion_hipotesis

**Archivo:** `11-validate_construccion_hipotesis.sql`

**Formato:** Relaciones causa-efecto (drag & drop)

**Lógica:**

- Valida pares causa-efecto
- Fuzzy matching para texto justificativo
- Permite respuestas alternativas válidas

**Parámetros:**

- `p_fuzzy_matching_threshold`
- `p_normalize_text`
- `p_special_rules` (alternativas aceptadas)

---

#### 2.3. validate_prediccion_narrativa

**Archivo:** `12-validate_prediccion_narrativa.sql`

**Formato:** Predicción de eventos futuros con justificación

**Lógica:**

- Valida predicción seleccionada
- Evalúa calidad de justificación (fuzzy matching)

**Parámetros:**

- `p_fuzzy_matching_threshold`
- `p_normalize_text`
- `p_special_rules`

---

#### 2.4. validate_puzzle_contexto

**Archivo:** `13-validate_puzzle_contexto.sql`

**Formato:** Completar contexto con piezas de información

**Lógica:**

- Valida piezas colocadas correctamente
- Crédito parcial por piezas correctas

**Parámetros:**

- `p_allow_partial_credit`

---

#### 2.5. validate_rueda_inferencias

**Archivo:** `14-validate_rueda_inferencias.sql`

**Formato:** Inferencias basadas en evidencia

**Lógica:**

- Valida inferencias realizadas
- Normaliza texto
- Crédito parcial

**Parámetros:**

- `p_allow_partial_credit`
- `p_normalize_text`

---

### Módulo 3: Comprensión Crítica (Seeds pendientes)

#### 3.1. validate_tribunal_opiniones

**Archivo:** `15-validate_tribunal_opiniones.sql`

**Formato:** Evaluación de argumentos con justificación

**Parámetros:**

- `p_fuzzy_matching_threshold`
- `p_normalize_text`
- `p_special_rules`

---

#### 3.2. validate_debate_digital

**Archivo:** `16-validate_debate_digital.sql`

**Formato:** Construcción de argumentos con estructura

---

#### 3.3. validate_analisis_fuentes

**Archivo:** `17-validate_analisis_fuentes.sql`

**Formato:** Análisis de credibilidad de fuentes

---

#### 3.4. validate_podcast_argumentativo

**Archivo:** `18-validate_podcast_argumentativo.sql`

**Formato:** Transcripción con argumentos identificados

---

#### 3.5. validate_matriz_perspectivas

**Archivo:** `19-validate_matriz_perspectivas.sql`

**Formato:** Comparación de múltiples perspectivas

---

## 🔒 Seguridad

### Principio: Backend NUNCA envía respuestas correctas a Frontend

**Implementado mediante:**

1. **Frontend Types:** `correct_answer?: never`
2. **Backend Sanitization:** Elimina campos sensibles antes de enviar
3. **Database Functions:** `SECURITY DEFINER` para acceso controlado

**Ejemplo (Crucigrama):**

```typescript
// ❌ ANTES (INSEGURO):
export interface CrucigramaClue {
  id: string;
  clue: string;
  answer: string;  // ← EXPUESTO A FRONTEND
}

// ✅ AHORA (SEGURO):
export interface CrucigramaClue {
  id: string;
  clue: string;
  /**
   * @deprecated Backend sanitizes this field - never present.
   * Validation is done server-side.
   */
  answer?: never;  // ← SANITIZADO
}
```

---

## 📐 Configuración de Validación

### Tabla: `exercise_validation_config`

Cada `exercise_type` tiene configuración específica:

| Parámetro | Descripción | Ejemplo |
|-----------|-------------|---------|
| `validation_function` | Nombre de función SQL | `validate_crucigrama` |
| `case_sensitive` | Comparación sensible a mayúsculas | `false` |
| `allow_partial_credit` | Permitir crédito parcial | `true` |
| `fuzzy_matching_threshold` | Umbral de similitud (0.0-1.0) | `0.80` |
| `normalize_text` | Normalizar acentos/espacios | `true` |
| `special_rules` | Reglas específicas (JSONB) | `{"alternatives": {...}}` |
| `default_max_points` | Puntos máximos por defecto | `100` |
| `default_passing_score` | Puntuación mínima para aprobar | `70` |

**Ejemplo de inserción:**

```sql
INSERT INTO educational_content.exercise_validation_config VALUES
('crucigrama', 'validate_crucigrama', false, true, 0.80, true, '{}'::jsonb, 100, 70);
```

---

## 📊 Auditoría

### Tabla: `exercise_validation_audit`

Cada validación crea un registro inmutable:

```sql
CREATE TABLE exercise_validation_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id UUID NOT NULL,
    user_id UUID NOT NULL,
    attempt_number INTEGER NOT NULL,
    submitted_answer JSONB NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL,
    exercise_snapshot JSONB NOT NULL,        -- ← Snapshot del ejercicio
    validation_config_snapshot JSONB NOT NULL, -- ← Snapshot de config
    is_correct BOOLEAN NOT NULL,
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    feedback TEXT,
    validation_details JSONB,
    validation_function_used TEXT NOT NULL,
    validation_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    validation_duration_ms INTEGER,           -- ← Tiempo de validación
    is_recalculated BOOLEAN DEFAULT false,
    client_metadata JSONB DEFAULT '{}'::jsonb
);
```

**Usos:**

1. ✅ **Compliance:** Trazabilidad completa de todas las submissions
2. ✅ **Debugging:** Reproducir validaciones con snapshots
3. ✅ **Analytics:** Analizar dificultad de ejercicios
4. ✅ **Recálculo:** Recalcular scores si se actualiza lógica de validación

---

## 🎯 Casos de Uso

### Caso 1: Validación Exitosa

```typescript
// Frontend envía:
POST /api/exercises/:id/submit
{
  "answers": {
    "clues": {
      "h1": "SORBONA",
      "h2": "NOBEL"
    }
  }
}

// Backend valida estructura → ✅ OK
// Backend llama validate_and_audit()
// SQL retorna:
{
  is_correct: true,
  score: 100,
  max_score: 100,
  feedback: "¡Perfecto! Todas las 2 palabras están correctas.",
  details: {
    "total_words": 2,
    "correct_words": 2,
    "percentage": 100,
    "results_per_word": [...]
  },
  audit_id: "uuid-here"
}

// Frontend recibe:
200 OK
{
  "score": 100,
  "isCorrect": true,
  "feedback": "¡Perfecto!...",
  "correctAnswers": 2,
  "totalQuestions": 2
}
```

---

### Caso 2: Estructura Inválida

```typescript
// Frontend envía:
POST /api/exercises/:id/submit
{
  "answers": {
    "invalid_key": "data"  // ❌ Falta "clues"
  }
}

// Backend ExerciseAnswerValidator → ❌ FALLA

// Frontend recibe:
400 Bad Request
{
  "statusCode": 400,
  "message": "Validation failed for exercise type 'crucigrama': clues is required",
  "error": "Bad Request"
}
```

---

### Caso 3: Crédito Parcial

```typescript
// Frontend envía:
POST /api/exercises/:id/submit
{
  "answers": {
    "clues": {
      "h1": "SORBONA",
      "h2": "NOBEEL",  // ← Typo
      "v1": "POLONIO"
    }
  }
}

// SQL valida → 2/3 correctas

// Frontend recibe:
200 OK
{
  "score": 67,  // (2/3) * 100
  "isCorrect": false,
  "feedback": "Tienes 2/3 palabras correctas (67%)",
  "correctAnswers": 2,
  "totalQuestions": 3
}
```

---

## 📁 Archivos de Referencia

### Database

```
apps/database/ddl/schemas/educational_content/functions/
├── 02-validate_answer.sql              (Dispatcher)
├── 03-validate_crucigrama.sql          (Módulo 1.1)
├── 04-validate_timeline.sql            (Módulo 1.2)
├── 05-validate_word_search.sql         (Módulo 1.5)
├── 06-validate_fill_in_blank.sql       (Módulo 1.3)
├── 07-validate_true_false.sql          (Módulo 1.4)
├── 10-validate_detective_textual.sql   (Módulo 2.1)
├── 11-validate_construccion_hipotesis.sql (Módulo 2.2)
├── 12-validate_prediccion_narrativa.sql   (Módulo 2.3)
├── 13-validate_puzzle_contexto.sql        (Módulo 2.4)
├── 14-validate_rueda_inferencias.sql      (Módulo 2.5)
├── 15-validate_tribunal_opiniones.sql     (Módulo 3.1)
├── 17-validate_analisis_fuentes.sql       (Módulo 3.3)
├── 18-validate_podcast_argumentativo.sql  (Módulo 3.4)
├── 19-validate_matriz_perspectivas.sql    (Módulo 3.5)
└── 20-validate_and_audit.sql           (Función principal)
```

### Backend

```
apps/backend/src/modules/progress/
├── services/
│   └── exercise-submission.service.ts  (autoGrade calls validate_and_audit)
└── dto/answers/
    ├── exercise-answer.validator.ts    (Dispatcher)
    ├── crucigrama-answers.dto.ts
    ├── timeline-answers.dto.ts
    ├── word-search-answers.dto.ts
    ├── fill-in-blank-answers.dto.ts
    ├── true-false-answers.dto.ts
    ├── detective-textual-answers.dto.ts
    ├── construccion-hipotesis-answers.dto.ts
    ├── prediccion-narrativa-answers.dto.ts
    ├── puzzle-contexto-answers.dto.ts
    ├── rueda-inferencias-answers.dto.ts
    ├── tribunal-opiniones-answers.dto.ts
    ├── analisis-fuentes-answers.dto.ts
    ├── debate-digital-answers.dto.ts
    ├── podcast-argumentativo-answers.dto.ts
    └── matriz-perspectivas-answers.dto.ts
```

---

## ✅ Checklist de Implementación

### Para Nuevos Tipos de Ejercicio

- [ ] 1. Añadir valor al ENUM `exercise_type`
- [ ] 2. Crear función SQL `validate_<tipo>()`
- [ ] 3. Añadir CASE en `validate_answer()`
- [ ] 4. Insertar config en `exercise_validation_config`
- [ ] 5. Crear Backend DTO `<Tipo>AnswersDto`
- [ ] 6. Añadir mapeo en `ExerciseAnswerValidator`
- [ ] 7. Crear Frontend types con `correct_answer?: never`
- [ ] 8. Escribir tests unitarios (DB, Backend, E2E)
- [ ] 9. Documentar formato de respuesta esperada
- [ ] 10. Crear seed de ejemplo en dev/prod

---

## 🎓 Ejemplos Completos

### Ejemplo 1: Crucigrama

**Seed (exercise.solution):**

```json
{
  "clues": {
    "h1": "SORBONA",
    "h2": "NOBEL",
    "v1": "POLONIO",
    "v2": "RADIO"
  }
}
```

**Submission válida:**

```json
{
  "clues": {
    "h1": "sorbona",
    "h2": "nobel",
    "v1": "polonio",
    "v2": "radio"
  }
}
```

**Resultado:**

```json
{
  "is_correct": true,
  "score": 100,
  "max_score": 100,
  "feedback": "¡Perfecto! Todas las 4 palabras están correctas.",
  "details": {
    "total_words": 4,
    "correct_words": 4,
    "percentage": 100,
    "results_per_word": [
      {"clue_id": "h1", "is_correct": true, "submitted": "sorbona", "expected": "SORBONA"},
      {"clue_id": "h2", "is_correct": true, "submitted": "nobel", "expected": "NOBEL"},
      {"clue_id": "v1", "is_correct": true, "submitted": "polonio", "expected": "POLONIO"},
      {"clue_id": "v2", "is_correct": true, "submitted": "radio", "expected": "RADIO"}
    ]
  }
}
```

---

### Ejemplo 2: Verdadero/Falso

**Seed (exercise.solution):**

```json
{
  "correctAnswers": {
    "stmt1": false,
    "stmt2": true,
    "stmt3": false,
    "stmt4": true
  }
}
```

**Submission con error:**

```json
{
  "statements": {
    "stmt1": false,
    "stmt2": false,  // ← Error
    "stmt3": false,
    "stmt4": true
  }
}
```

**Resultado:**

```json
{
  "is_correct": false,
  "score": 75,
  "max_score": 100,
  "feedback": "Tienes 3/4 afirmaciones correctas.",
  "details": {
    "total_statements": 4,
    "correct_statements": 3,
    "percentage": 75,
    "results_per_statement": [
      {"statement_id": "stmt1", "is_correct": true},
      {"statement_id": "stmt2", "is_correct": false, "submitted": "false", "expected": "true"},
      {"statement_id": "stmt3", "is_correct": true},
      {"statement_id": "stmt4", "is_correct": true}
    ]
  }
}
```

---

## 📖 Glosario

- **Submission:** Envío final de un ejercicio (incluye todas las respuestas)
- **Attempt:** Intento individual (puede haber múltiples attempts por submission)
- **Auto-gradable:** Ejercicio que puede ser calificado automáticamente por SQL
- **Fuzzy matching:** Comparación de texto que tolera errores tipográficos menores
- **Partial credit:** Puntuación proporcional (ej: 7/10 preguntas correctas = 70%)
- **Normalize text:** Eliminar acentos, espacios extra, convertir a minúsculas
- **Snapshot:** Copia inmutable de datos en un momento específico
- **Audit trail:** Registro completo de todas las validaciones para trazabilidad

---

**Versión:** 1.0
**Última actualización:** 2025-11-19
**Próxima revisión:** Tras implementación Módulo 3 seeds
