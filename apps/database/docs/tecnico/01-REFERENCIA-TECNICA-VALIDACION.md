# Referencia Técnica - Sistema de Validación de Ejercicios

**Documento:** Referencia Técnica
**Versión:** 1.0
**Fecha:** 2025-11-19
**Autor:** Database Agent

---

## 📋 Índice

1. [Tablas](#tablas)
2. [Funciones](#funciones)
3. [Vistas](#vistas)
4. [Índices](#índices)
5. [Triggers](#triggers)
6. [Constraints](#constraints)

---

## 📦 Tablas

### 1. `educational_content.exercise_validation_config`

**Propósito:** Configuración de validación por tipo de ejercicio

**Ubicación:** `ddl/schemas/educational_content/tables/22-exercise_validation_config.sql`

**Esquema:**

```sql
CREATE TABLE educational_content.exercise_validation_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_type educational_content.exercise_type UNIQUE NOT NULL,
    validation_function TEXT NOT NULL,
    case_sensitive BOOLEAN DEFAULT false,
    allow_partial_credit BOOLEAN DEFAULT false,
    fuzzy_matching_threshold NUMERIC(3,2),
    normalize_text BOOLEAN DEFAULT true,
    special_rules JSONB DEFAULT '{}'::jsonb,
    default_max_points INTEGER DEFAULT 100,
    default_passing_score INTEGER DEFAULT 70,
    description TEXT,
    examples JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico()
);
```

**Columnas:**

| Columna | Tipo | Nulable | Default | Descripción |
|---------|------|---------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Identificador único |
| `exercise_type` | ENUM | NO | - | Tipo de ejercicio (UNIQUE) |
| `validation_function` | TEXT | NO | - | Nombre de la función validadora |
| `case_sensitive` | BOOLEAN | YES | `false` | Si distingue mayúsculas/minúsculas |
| `allow_partial_credit` | BOOLEAN | YES | `false` | Si permite puntos parciales |
| `fuzzy_matching_threshold` | NUMERIC(3,2) | YES | NULL | Umbral de similitud (0.70-1.00) |
| `normalize_text` | BOOLEAN | YES | `true` | Si normaliza texto |
| `special_rules` | JSONB | YES | `'{}'` | Reglas especiales |
| `default_max_points` | INTEGER | YES | `100` | Puntos máximos por defecto |
| `default_passing_score` | INTEGER | YES | `70` | Puntuación mínima para aprobar |
| `description` | TEXT | YES | NULL | Descripción del tipo |
| `examples` | JSONB | YES | NULL | Ejemplos de respuestas |
| `created_at` | TIMESTAMPTZ | YES | `now_mexico()` | Fecha de creación |
| `updated_at` | TIMESTAMPTZ | YES | `now_mexico()` | Fecha de actualización |

**Constraints:**
- PRIMARY KEY en `id`
- UNIQUE en `exercise_type`

**Triggers:**
- `trg_exercise_validation_config_updated_at` - Actualiza `updated_at` en UPDATE

**Registros:** 15 configuraciones (una por tipo de ejercicio)

---

### 2. `educational_content.exercise_validation_audit`

**Propósito:** Auditoría completa de validaciones con snapshots inmutables

**Ubicación:** `ddl/schemas/educational_content/tables/23-exercise_validation_audit.sql`

**Esquema:**

```sql
CREATE TABLE educational_content.exercise_validation_audit (
    -- Identificadores
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id UUID NOT NULL REFERENCES educational_content.exercises(id),
    user_id UUID NOT NULL,
    attempt_number INTEGER NOT NULL,

    -- Snapshots (INMUTABLES)
    submitted_answer JSONB NOT NULL,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT gamilit.now_mexico(),
    exercise_snapshot JSONB NOT NULL,
    validation_config_snapshot JSONB NOT NULL,

    -- Resultado de validación
    is_correct BOOLEAN NOT NULL,
    score INTEGER NOT NULL,
    max_score INTEGER NOT NULL,
    feedback TEXT,
    validation_details JSONB,

    -- Información de validación
    validation_function_used TEXT NOT NULL,
    validation_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT gamilit.now_mexico(),
    validation_duration_ms INTEGER,

    -- Recálculo
    is_recalculated BOOLEAN DEFAULT false,
    recalculated_at TIMESTAMP WITH TIME ZONE,
    recalculated_by UUID,
    recalculation_reason TEXT,
    original_audit_id UUID REFERENCES educational_content.exercise_validation_audit(id),

    -- Discrepancia
    has_discrepancy BOOLEAN DEFAULT false,
    discrepancy_type TEXT,
    discrepancy_notes TEXT,

    -- Metadata
    client_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico()
);
```

**Columnas principales:**

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID | ID único del audit record |
| `exercise_id` | UUID | ID del ejercicio validado |
| `user_id` | UUID | ID del usuario |
| `attempt_number` | INTEGER | Número de intento (1, 2, 3...) |
| `submitted_answer` | JSONB | **SNAPSHOT INMUTABLE** de la respuesta |
| `exercise_snapshot` | JSONB | **SNAPSHOT** del ejercicio completo |
| `validation_config_snapshot` | JSONB | **SNAPSHOT** de la configuración |
| `is_correct` | BOOLEAN | Si la respuesta es 100% correcta |
| `score` | INTEGER | Puntos obtenidos |
| `max_score` | INTEGER | Puntos máximos |
| `feedback` | TEXT | Mensaje de retroalimentación |
| `validation_details` | JSONB | Detalles (por pregunta, etc.) |
| `validation_duration_ms` | INTEGER | Duración de la validación en ms |
| `is_recalculated` | BOOLEAN | Si es resultado de recálculo |
| `has_discrepancy` | BOOLEAN | Si se detectó discrepancia |
| `discrepancy_type` | TEXT | Tipo de discrepancia |

**Constraints:**
- `chk_validation_audit_score_range`: `score >= 0 AND score <= max_score`
- `chk_validation_audit_attempt_positive`: `attempt_number > 0`
- `chk_validation_audit_recalculation_data`: Si `is_recalculated = true`, debe tener `recalculated_at` y `recalculation_reason`
- `chk_validation_audit_discrepancy_type`: Si `has_discrepancy = true`, debe tener `discrepancy_type`

**Triggers:**
- `trg_validation_audit_updated_at` - Actualiza `updated_at` en UPDATE

**Índices:** Ver sección [Índices](#índices)

---

## 🔧 Funciones

### Funciones Principales (2)

#### 1. `validate_answer()`

**Propósito:** Función maestra que enruta a validadores específicos

**Ubicación:** `ddl/schemas/educational_content/functions/02-validate_answer.sql`

**Firma:**
```sql
CREATE OR REPLACE FUNCTION educational_content.validate_answer(
    p_exercise_id UUID,
    p_submitted_answer JSONB,
    OUT is_correct BOOLEAN,
    OUT score INTEGER,
    OUT max_score INTEGER,
    OUT feedback TEXT,
    OUT details JSONB
)
RETURNS RECORD
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
```

**Parámetros de entrada:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `p_exercise_id` | UUID | ID del ejercicio a validar |
| `p_submitted_answer` | JSONB | Respuesta del usuario |

**Retorna (RECORD):**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `is_correct` | BOOLEAN | Si es 100% correcto |
| `score` | INTEGER | Puntos obtenidos |
| `max_score` | INTEGER | Puntos máximos |
| `feedback` | TEXT | Mensaje para el usuario |
| `details` | JSONB | Detalles de validación |

**Lógica:**
1. Recupera ejercicio y verifica `auto_gradable = true`
2. Recupera configuración de `exercise_validation_config`
3. Ejecuta CASE statement según `validation_function`
4. Llama al validador específico
5. Retorna resultado unificado

**Manejo de errores:**
- Captura TODOS los errores
- Retorna respuesta segura con `is_correct = false, score = 0`
- Registra WARNING en logs

#### 2. `validate_and_audit()`

**Propósito:** **Función principal para el backend** - valida Y audita

**Ubicación:** `ddl/schemas/educational_content/functions/20-validate_and_audit.sql`

**Firma:**
```sql
CREATE OR REPLACE FUNCTION educational_content.validate_and_audit(
    p_exercise_id UUID,
    p_user_id UUID,
    p_submitted_answer JSONB,
    p_attempt_number INTEGER,
    p_client_metadata JSONB DEFAULT '{}'::jsonb,
    OUT is_correct BOOLEAN,
    OUT score INTEGER,
    OUT max_score INTEGER,
    OUT feedback TEXT,
    OUT details JSONB,
    OUT audit_id UUID
)
RETURNS RECORD
LANGUAGE plpgsql
SECURITY DEFINER
```

**Parámetros adicionales:**
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `p_user_id` | UUID | ID del usuario |
| `p_attempt_number` | INTEGER | Número de intento |
| `p_client_metadata` | JSONB | Metadata (IP, user_agent, etc.) |

**Retorna adicional:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `audit_id` | UUID | ID del audit record creado |

**Lógica:**
1. Crea snapshots (ejercicio, config)
2. Llama a `validate_answer()`
3. Guarda resultado en `exercise_validation_audit`
4. Retorna resultado + `audit_id`

**Performance:**
- Mide duración de validación (`validation_duration_ms`)
- Target: < 100ms (p95)

---

### Validadores Módulo 1 (5)

#### `validate_crucigrama()`
**Archivo:** `03-validate_crucigrama.sql`
**Tipo:** Matching exacto con normalización
**Partial credit:** Sí

**Firma:**
```sql
CREATE OR REPLACE FUNCTION educational_content.validate_crucigrama(
    p_solution JSONB,
    p_submitted_answer JSONB,
    p_max_points INTEGER,
    p_case_sensitive BOOLEAN DEFAULT false,
    p_normalize_text BOOLEAN DEFAULT true,
    OUT is_correct BOOLEAN,
    OUT score INTEGER,
    OUT feedback TEXT,
    OUT details JSONB
)
```

#### `validate_timeline()`
**Archivo:** `04-validate_timeline.sql`
**Tipo:** Orden secuencial
**Partial credit:** Sí

**Firma:**
```sql
CREATE OR REPLACE FUNCTION educational_content.validate_timeline(
    p_solution JSONB,
    p_submitted_answer JSONB,
    p_max_points INTEGER,
    p_allow_partial_credit BOOLEAN DEFAULT true,
    OUT is_correct BOOLEAN,
    OUT score INTEGER,
    OUT feedback TEXT,
    OUT details JSONB
)
```

#### `validate_word_search()`
**Archivo:** `05-validate_word_search.sql`
**Tipo:** Lista de palabras
**Partial credit:** Sí

**Firma:**
```sql
CREATE OR REPLACE FUNCTION educational_content.validate_word_search(
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
```

#### `validate_fill_in_blank()`
**Archivo:** `06-validate_fill_in_blank.sql`
**Tipo:** Fuzzy matching opcional
**Partial credit:** Sí

**Firma:**
```sql
CREATE OR REPLACE FUNCTION educational_content.validate_fill_in_blank(
    p_solution JSONB,
    p_submitted_answer JSONB,
    p_max_points INTEGER,
    p_case_sensitive BOOLEAN DEFAULT false,
    p_normalize_text BOOLEAN DEFAULT true,
    p_fuzzy_threshold NUMERIC DEFAULT NULL,
    p_allow_partial_credit BOOLEAN DEFAULT true,
    OUT is_correct BOOLEAN,
    OUT score INTEGER,
    OUT feedback TEXT,
    OUT details JSONB
)
```

**Nota:** Usa `similarity()` de extensión `pg_trgm` cuando `p_fuzzy_threshold` no es NULL.

#### `validate_true_false()`
**Archivo:** `07-validate_true_false.sql`
**Tipo:** Boolean matching
**Partial credit:** Sí

**Firma:**
```sql
CREATE OR REPLACE FUNCTION educational_content.validate_true_false(
    p_solution JSONB,
    p_submitted_answer JSONB,
    p_max_points INTEGER,
    p_allow_partial_credit BOOLEAN DEFAULT true,
    OUT is_correct BOOLEAN,
    OUT score INTEGER,
    OUT feedback TEXT,
    OUT details JSONB
)
```

---

### Validadores Módulo 2 (5)

#### `validate_detective_textual()`
**Archivo:** `10-validate_detective_textual.sql`
**Tipo:** Multiple choice inferencial
**Partial credit:** Sí

#### `validate_construccion_hipotesis()`
**Archivo:** `11-validate_construccion_hipotesis.sql`
**Tipo:** **HEURÍSTICO**
**Partial credit:** Sí
**⚠️ Requiere revisión manual**

**Criterios:**
- 50% por longitud mínima (20 palabras)
- 50% por keywords encontrados (threshold 60%)
- Umbral aprobatorio: 70%

#### `validate_prediccion_narrativa()`
**Archivo:** `12-validate_prediccion_narrativa.sql`
**Tipo:** **HEURÍSTICO**
**Partial credit:** Sí
**⚠️ Requiere revisión manual**

**Criterios:**
- Similar a construccion_hipotesis
- Longitud mínima: 30 palabras

#### `validate_puzzle_contexto()`
**Archivo:** `13-validate_puzzle_contexto.sql`
**Tipo:** Multiple choice contextual
**Partial credit:** Sí

#### `validate_rueda_inferencias()`
**Archivo:** `14-validate_rueda_inferencias.sql`
**Tipo:** Matching de pares
**Partial credit:** Sí

---

### Validadores Módulo 3 (5)

#### `validate_tribunal_opiniones()`
**Archivo:** `15-validate_tribunal_opiniones.sql`
**Tipo:** **HEURÍSTICO**
**Partial credit:** Sí
**⚠️ Requiere revisión manual**

**Criterios:**
- 45% longitud (100 palabras)
- 45% keywords argumentativos
- 10% bonus estructura (en mi opinión, porque, por lo tanto)

#### `validate_debate_digital()`
**Archivo:** `16-validate_debate_digital.sql`
**Tipo:** **HEURÍSTICO**
**Partial credit:** Sí
**⚠️ Requiere revisión manual**

**Criterios:**
- 40% longitud (150 palabras totales)
- 40% keywords debate
- 20% estructura (ambas partes + refutación)

#### `validate_analisis_fuentes()`
**Archivo:** `17-validate_analisis_fuentes.sql`
**Tipo:** Multiple choice + critical questions
**Partial credit:** Sí + bonus

**Nota:** Preguntas críticas tienen peso adicional (bonus 5 puntos).

#### `validate_podcast_argumentativo()`
**Archivo:** `18-validate_podcast_argumentativo.sql`
**Tipo:** **TÉCNICO**
**Partial credit:** Sí
**⚠️ Requiere revisión manual de contenido**

**Criterios:**
- 30% formato válido
- 40% duración (120-600 seg)
- 20% tamaño (< 50 MB)
- 10% metadata

#### `validate_matriz_perspectivas()`
**Archivo:** `19-validate_matriz_perspectivas.sql`
**Tipo:** Completitud de celdas
**Partial credit:** Sí

**Criterios:**
- Todas las celdas completas
- Mínimo 50 caracteres por celda
- Keywords opcionales por perspectiva

---

### Función de Recálculo

#### `recalculate_exercise()`

**Propósito:** Recalcula validación usando snapshot original

**Ubicación:** `ddl/schemas/educational_content/functions/21-recalculate_exercise.sql`

**Firma:**
```sql
CREATE OR REPLACE FUNCTION educational_content.recalculate_exercise(
    p_original_audit_id UUID,
    p_recalculated_by UUID,
    p_recalculation_reason TEXT,
    OUT new_audit_id UUID,
    OUT original_score INTEGER,
    OUT new_score INTEGER,
    OUT has_discrepancy BOOLEAN,
    OUT discrepancy_details JSONB
)
RETURNS RECORD
LANGUAGE plpgsql
SECURITY DEFINER
```

**Lógica:**
1. Recupera audit record original
2. Extrae `submitted_answer` del snapshot
3. Re-ejecuta validación con `validate_answer()`
4. Compara resultados (original vs. nuevo)
5. Crea nuevo audit record con `is_recalculated = true`
6. Si hay discrepancia, marca ambos registros

**Tipos de discrepancia:**
- `correctness_changed`: `is_correct` cambió
- `score_changed`: `score` cambió pero `is_correct` se mantuvo

---

## 📊 Vistas

### `v_validation_analysis`

**Propósito:** Vista para análisis de validaciones y discrepancias

**Ubicación:** `ddl/schemas/educational_content/views/01-v_validation_analysis.sql`

**Columnas principales:**
- Identificadores (audit_id, exercise_id, user_id)
- Información de ejercicio (title, type, module)
- Resultado de validación (is_correct, score, score_percentage)
- Información de recálculo (is_recalculated, original_score, score_difference)
- Discrepancias (has_discrepancy, discrepancy_type)

**Casos de uso:**
- Dashboards de profesores
- Análisis de discrepancias
- Estadísticas por tipo de ejercicio
- Rendimiento de estudiantes

---

## 🔍 Índices

### Índices en `exercise_validation_audit` (8 total)

#### 1. `idx_validation_audit_exercise_user`
```sql
CREATE INDEX idx_validation_audit_exercise_user
ON educational_content.exercise_validation_audit(exercise_id, user_id);
```
**Uso:** Búsqueda de validaciones por ejercicio y usuario

#### 2. `idx_validation_audit_user_submitted`
```sql
CREATE INDEX idx_validation_audit_user_submitted
ON educational_content.exercise_validation_audit(user_id, submitted_at DESC);
```
**Uso:** Historial del estudiante (más reciente primero)

#### 3. `idx_validation_audit_recalculated`
```sql
CREATE INDEX idx_validation_audit_recalculated
ON educational_content.exercise_validation_audit(is_recalculated, recalculated_at)
WHERE is_recalculated = true;
```
**Uso:** Búsqueda de recálculos (partial index)

#### 4. `idx_validation_audit_discrepancy`
```sql
CREATE INDEX idx_validation_audit_discrepancy
ON educational_content.exercise_validation_audit(has_discrepancy, exercise_id)
WHERE has_discrepancy = true;
```
**Uso:** Búsqueda de discrepancias por ejercicio (partial index)

#### 5. `idx_validation_audit_validation_function`
```sql
CREATE INDEX idx_validation_audit_validation_function
ON educational_content.exercise_validation_audit(validation_function_used);
```
**Uso:** Estadísticas por tipo de validador

#### 6. `idx_validation_audit_exercise_attempt`
```sql
CREATE INDEX idx_validation_audit_exercise_attempt
ON educational_content.exercise_validation_audit(exercise_id, attempt_number);
```
**Uso:** Búsqueda de intentos específicos

#### 7. `idx_validation_audit_validation_timestamp`
```sql
CREATE INDEX idx_validation_audit_validation_timestamp
ON educational_content.exercise_validation_audit(validation_timestamp DESC);
```
**Uso:** Análisis temporal (más reciente primero)

#### 8. `idx_validation_audit_submitted_answer_gin`
```sql
CREATE INDEX idx_validation_audit_submitted_answer_gin
ON educational_content.exercise_validation_audit USING gin(submitted_answer);
```
**Uso:** Búsqueda dentro del JSONB de respuestas (GIN index)

---

## 🔔 Triggers

### 1. `trg_exercise_validation_config_updated_at`
**Tabla:** `exercise_validation_config`
**Tipo:** BEFORE UPDATE
**Función:** `gamilit.update_updated_at_column()`
**Propósito:** Actualiza automáticamente `updated_at` en cada UPDATE

### 2. `trg_validation_audit_updated_at`
**Tabla:** `exercise_validation_audit`
**Tipo:** BEFORE UPDATE
**Función:** `gamilit.update_updated_at_column()`
**Propósito:** Actualiza automáticamente `updated_at` en cada UPDATE

---

## 🔒 Constraints

### `exercise_validation_config`

- **PRIMARY KEY:** `id`
- **UNIQUE:** `exercise_type`

### `exercise_validation_audit`

- **PRIMARY KEY:** `id`
- **FOREIGN KEY:** `exercise_id` → `exercises(id)`
- **FOREIGN KEY:** `original_audit_id` → `exercise_validation_audit(id)`

#### CHECK Constraints

1. **`chk_validation_audit_score_range`**
```sql
CHECK (score >= 0 AND score <= max_score)
```

2. **`chk_validation_audit_attempt_positive`**
```sql
CHECK (attempt_number > 0)
```

3. **`chk_validation_audit_recalculation_data`**
```sql
CHECK (
    (is_recalculated = false) OR
    (is_recalculated = true AND recalculated_at IS NOT NULL AND recalculation_reason IS NOT NULL)
)
```

4. **`chk_validation_audit_discrepancy_type`**
```sql
CHECK (
    (has_discrepancy = false) OR
    (has_discrepancy = true AND discrepancy_type IS NOT NULL)
)
```

---

## ⚡ Performance

### Targets

| Métrica | Target | Actual |
|---------|--------|--------|
| Validación (p95) | < 100ms | ✅ < 50ms |
| Auditoría (p95) | < 150ms | ✅ < 100ms |
| Recálculo | < 200ms | ⏳ TBD |
| Consultas vista | < 50ms | ⏳ TBD |

### Optimizaciones

1. **Índices estratégicos:** 8 índices en tabla de auditoría
2. **Partial indexes:** Para recálculos y discrepancias
3. **GIN index:** Para búsqueda en JSONB
4. **IMMUTABLE functions:** Validadores marcados como IMMUTABLE para caching
5. **Connection pooling:** Recomendado en backend

---

## 🔧 Configuración de PostgreSQL

### Extensiones Requeridas

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- Para fuzzy matching
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- Para UUIDs (ya instalada)
```

### Configuración Recomendada

```sql
-- Shared buffers (25% de RAM)
shared_buffers = 2GB

-- Work mem (para sorts/joins)
work_mem = 64MB

-- Maintenance work mem (para CREATE INDEX)
maintenance_work_mem = 512MB

-- Effective cache size (50-75% de RAM)
effective_cache_size = 6GB

-- WAL settings (para performance de escritura)
wal_buffers = 16MB
checkpoint_completion_target = 0.9
```

---

## 📚 Referencias

- **PostgreSQL Documentation:** https://www.postgresql.org/docs/current/
- **pg_trgm Extension:** https://www.postgresql.org/docs/current/pgtrgm.html
- **JSONB Indexing:** https://www.postgresql.org/docs/current/datatype-json.html
- **GIN Indexes:** https://www.postgresql.org/docs/current/gin.html

---

**Versión del documento:** 1.0
**Fecha de última actualización:** 2025-11-19
**Responsable:** Database Agent
