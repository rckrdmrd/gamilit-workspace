---
titulo: "ET-EDU-001: Implementación de Mecánicas de Ejercicios"
tipo: especificacion-tecnica
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# ET-EDU-001: Implementación de Mecánicas de Ejercicios

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-EDU-001 |
| **Módulo** | 03 - Contenido Educativo |
| **Título** | Implementación de Mecánicas de Ejercicios |
| **Prioridad** | Crít ica |
| **Estado** | ✅ Implementado |
| **Versión** | 2.0 |
| **Fecha Creación** | 2025-11-07 |
| **Última Actualización** | 2025-11-11 |
| **Autor** | Database Team, Backend Team |
| **Reviewers** | Backend Lead, Frontend Lead, QA Lead |

---

## 🔗 Referencias

### Requerimiento Funcional

📘 **Documento RF:**
- [RF-EDU-001: Mecánicas de Ejercicios](../requirements/RF-EDU-001-mecanicas-ejercicios.md)

### Implementación DDL

🗄️ **ENUMs:**
- `educational_content.exercise_type` - `apps/database/ddl/00-prerequisites.sql:~85-120`
  - 27 implementaciones específicas GAMILIT
- `educational_content.exercise_mechanic_mapping` (tabla) - Mapeo a categorías pedagógicas
  - 7 categorías: Vocabulario, Gramática, Lectura, Escritura, Audio, Pronunciación, Cultura

🗄️ **Tablas:**
- `educational_content.exercises` - Ejercicios completos
- `educational_content.exercise_mechanic_mapping` - Mapeo pedagógico (NUEVO en v2.0)

---

## 🏗️ Arquitectura

### Diagrama de Capas

```
┌────────────────────────────────────────────────────┐
│                 FRONTEND (React)                   │
│  - ExerciseRenderer (dinámico por mecánica)       │
│  - MultipleChoiceExercise                          │
│  - FillInBlankExercise                             │
│  - ... (31 componentes específicos)                │
└─────────────────┬──────────────────────────────────┘
                  │ REST API
┌─────────────────▼──────────────────────────────────┐
│              BACKEND (NestJS)                      │
│  - ExerciseService                                 │
│    · getExercise() - sin answer_key                │
│    · submitAnswer() - valida en backend            │
│  - MechanicValidators (factory pattern)            │
│    · MultipleChoiceValidator                       │
│    · FillInBlankValidator                          │
│    · ... (31 validators)                           │
└─────────────────┬──────────────────────────────────┘
                  │ SQL Queries
┌─────────────────▼──────────────────────────────────┐
│            DATABASE (PostgreSQL)                   │
│  - exercises (JSONB content flexible)              │
│  - exercise_attempts (tracking)                    │
│  - validate_exercise_structure() (validar JSONB)   │
└────────────────────────────────────────────────────┘
```

---

## 💾 Implementación de Base de Datos

### 1. ENUM: exercise_type

**Ubicación:** `apps/database/ddl/00-prerequisites.sql:~85-120`

```sql
-- Exercise Types - Implementaciones específicas GAMILIT (33 valores ENUM, 23 activos)
CREATE TYPE educational_content.exercise_type AS ENUM (
    -- Módulo 1: Comprensión Literal (5 activos + 2 auxiliares asignables)
    'crucigrama',
    'linea_tiempo',
    'completar_espacios',
    'verdadero_falso',
    'sopa_letras',

    -- Módulo 2: Comprensión Inferencial (5)
    'detective_textual',
    'construccion_hipotesis',
    'prediccion_narrativa',
    'puzzle_contexto',
    'rueda_inferencias',

    -- Módulo 3: Lectura Crítica (5)
    'analisis_fuentes',
    'debate_digital',
    'matriz_perspectivas',
    'podcast_argumentativo',
    'tribunal_opiniones',

    -- Módulo 4: Alfabetización Digital (5)
    'verificador_fake_news',
    'infografia_interactiva',
    'quiz_tiktok',
    'navegacion_hipertextual',
    'analisis_memes',

    -- Módulo 5: Producción y Expresión Lectora (3)
    'diario_multimedia',
    'comic_digital',
    'video_carta',

    -- Auxiliares (6: comprension_auditiva [BACKLOG: desactivada], collage_prensa, texto_movimiento, call_to_action, mapa_conceptual, emparejamiento)
    'comprension_auditiva', -- BACKLOG: desactivada
    'collage_prensa',
    'texto_movimiento',
    'call_to_action',
    'mapa_conceptual',
    'emparejamiento'
);

COMMENT ON TYPE educational_content.exercise_type IS '27 mecánicas específicas GAMILIT agrupadas en 5 módulos educativos + auxiliares';
```

### 2. Sistema Dual: exercise_type + Categorías Pedagógicas

#### Concepto

GAMILIT implementa un **sistema dual** que combina:

1. **exercise_type (Implementación):**
   - 27 mecánicas específicas gamificadas adaptadas al contexto maya yucateco
   - Agrupadas por módulos educativos (1-5) + auxiliares
   - Implementación concreta en Frontend/Backend

2. **Categorías Pedagógicas (Clasificación):**
   - 7 categorías universales: Vocabulario, Gramática, Lectura, Escritura, Audio, Pronunciación, Cultura
   - 31 subcategorías pedagógicas genéricas
   - Mapeo mediante tabla `exercise_mechanic_mapping`

#### Tabla de Mapeo

**Ubicación:** `apps/database/ddl/schemas/educational_content/tables/21-exercise_mechanic_mapping.sql`

```sql
CREATE TABLE educational_content.exercise_mechanic_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- CLASIFICACIÓN PEDAGÓGICA
    mechanic_category VARCHAR(50) NOT NULL,      -- 'vocabulario', 'lectura', 'escritura'
    mechanic_subcategory VARCHAR(50),            -- 'multiple_choice', 'word_search', 'inference'

    -- IMPLEMENTACIÓN GAMILIT
    exercise_type educational_content.exercise_type NOT NULL,

    -- CONTEXTO EDUCATIVO
    bloom_level VARCHAR(50),                     -- 'recordar', 'comprender', 'aplicar', etc.
    cefr_level educational_content.difficulty_level[],
    pedagogical_purpose TEXT,
    learning_objectives TEXT[],

    -- CARACTERÍSTICAS
    interaction_type VARCHAR(50),                -- 'drag_drop', 'text_input', 'selection'
    cognitive_load VARCHAR(20),                  -- 'bajo', 'medio', 'alto'

    -- Metadatos
    tags TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(mechanic_subcategory, exercise_type)
);

-- Índices
CREATE INDEX idx_mechanic_mapping_category ON educational_content.exercise_mechanic_mapping(mechanic_category);
CREATE INDEX idx_mechanic_mapping_exercise_type ON educational_content.exercise_mechanic_mapping(exercise_type);
CREATE INDEX idx_mechanic_mapping_bloom ON educational_content.exercise_mechanic_mapping(bloom_level);
CREATE INDEX idx_mechanic_mapping_tags_gin ON educational_content.exercise_mechanic_mapping USING gin(tags);

COMMENT ON TABLE educational_content.exercise_mechanic_mapping IS 'Mapeo entre categorías pedagógicas universales y implementaciones específicas GAMILIT';
```

#### Ejemplos de Mapeos

| Categoría | Subcategoría | exercise_type | Propósito Pedagógico |
|-----------|--------------|---------------|----------------------|
| vocabulario | word_search | crucigrama | Reforzar vocabulario mediante juego de palabras cruzadas |
| vocabulario | word_search | sopa_letras | Identificar palabras clave en contexto visual |
| lectura | inference | detective_textual | Desarrollar comprensión inferencial mediante pistas |
| lectura | reading_comprehension | analisis_fuentes | Análisis crítico de textos históricos/culturales |
| escritura | free_writing | ensayo_argumentativo | Expresión argumentativa y pensamiento crítico |
| cultura | cultural_context | tribunal_opiniones | Análisis de perspectivas culturales diversas |

#### Beneficios del Sistema Dual

**Para Profesores:**
- Buscar ejercicios por competencia pedagógica ("vocabulario", "lectura")
- Filtrar por nivel de Bloom o CEFR
- Asignar según objetivos de aprendizaje específicos
- Visibilidad de progreso por área pedagógica

**Para Estudiantes:**
- Recibir recomendaciones por competencia a desarrollar
- Variedad de mecánicas para misma competencia (evita monotonía)
- Progresión clara por área (ej: vocabulario 60% → 80%)

**Para el Sistema:**
- Analytics por competencia pedagógica + por tipo específico
- Interoperabilidad con estándares internacionales (Bloom, CEFR)
- Extensibilidad sin modificar estructura existente
- Facilita futuras implementaciones (13 GAPs identificados)

### 3. Tabla: exercises

**Ubicación:** `apps/database/ddl/schemas/educational_content/tables/02-exercises.sql`

```sql
CREATE TABLE IF NOT EXISTS educational_content.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identificación
    code VARCHAR(100) UNIQUE,
    title VARCHAR(300) NOT NULL,

    -- Mecánica y dificultad
    exercise_type educational_content.exercise_type NOT NULL,
    difficulty educational_content.difficulty_level NOT NULL,

    -- Contenido (estructura varía por mecánica)
    content JSONB NOT NULL,
    answer_key JSONB NOT NULL,
    hints JSONB, -- Array de strings: ["hint1", "hint2", "hint3"]

    -- Multimedia
    image_url VARCHAR(500),
    audio_url VARCHAR(500),
    video_url VARCHAR(500),

    -- Metadata pedagógica
    bloom_level educational_content.bloom_taxonomy,
    estimated_time_seconds INTEGER DEFAULT 60,
    xp_reward INTEGER DEFAULT 15,
    ml_coins_reward INTEGER DEFAULT 5,

    -- Relaciones
    module_id UUID REFERENCES educational_content.modules(id),
    lesson_id UUID REFERENCES educational_content.lessons(id),

    -- Restricciones
    required_rank gamification_system.maya_rank,
    is_exam BOOLEAN DEFAULT false,

    -- Estado
    status VARCHAR(20) DEFAULT 'draft', -- draft, review, published, archived
    published_at TIMESTAMPTZ,

    -- Auditoría
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX idx_exercises_mechanic ON educational_content.exercises(mechanic);
CREATE INDEX idx_exercises_difficulty ON educational_content.exercises(difficulty);
CREATE INDEX idx_exercises_module ON educational_content.exercises(module_id);
CREATE INDEX idx_exercises_status ON educational_content.exercises(status) WHERE status = 'published';
CREATE INDEX idx_exercises_content ON educational_content.exercises USING GIN(content);

-- Constraint: validar estructura de content según mechanic
ALTER TABLE educational_content.exercises
    ADD CONSTRAINT chk_content_structure CHECK (
        educational_content.validate_exercise_structure(mechanic, content, answer_key)
    );

COMMENT ON TABLE educational_content.exercises IS 'Ejercicios con 31 mecánicas diferentes';
COMMENT ON COLUMN educational_content.exercises.content IS 'Estructura JSONB flexible según mechanic';
COMMENT ON COLUMN educational_content.exercises.answer_key IS 'Respuestas correctas (NUNCA enviar al frontend)';
COMMENT ON COLUMN educational_content.exercises.hints IS 'Array de pistas progresivas';
```

### 3. Función: validate_exercise_structure

**Ubicación:** `apps/database/ddl/schemas/educational_content/functions/validate_exercise_structure.sql`

```sql
CREATE OR REPLACE FUNCTION educational_content.validate_exercise_structure(
    p_mechanic educational_content.exercise_mechanic,
    p_content JSONB,
    p_answer_key JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    -- Validación básica: content y answer_key no pueden ser null o vacíos
    IF p_content IS NULL OR p_content = '{}'::JSONB THEN
        RETURN false;
    END IF;

    IF p_answer_key IS NULL OR p_answer_key = '{}'::JSONB THEN
        RETURN false;
    END IF;

    -- Validaciones específicas por mecánica (ejemplos)
    CASE p_mechanic
        WHEN 'multiple_choice' THEN
            -- Debe tener: question, options (array), correct_answer en answer_key
            IF NOT (
                p_content ? 'question'
                AND p_content ? 'options'
                AND jsonb_array_length(p_content->'options') >= 2
                AND p_answer_key ? 'correct_answer'
            ) THEN
                RETURN false;
            END IF;

        WHEN 'fill_in_blank' THEN
            -- Debe tener: sentence, blank_position
            IF NOT (
                p_content ? 'sentence'
                AND p_content ? 'blank_position'
                AND p_answer_key ? 'correct_answer'
            ) THEN
                RETURN false;
            END IF;

        WHEN 'matching_pairs' THEN
            -- Debe tener: pairs (array)
            IF NOT (
                p_content ? 'pairs'
                AND jsonb_array_length(p_content->'pairs') >= 2
            ) THEN
                RETURN false;
            END IF;

        -- Agregar más validaciones según necesidad
        ELSE
            -- Por defecto, aceptar si tiene content y answer_key
            RETURN true;
    END CASE;

    RETURN true;
END;
$$;

COMMENT ON FUNCTION educational_content.validate_exercise_structure IS 'Valida que estructura JSONB sea correcta según mechanic';
```

### 4. Validadores de Ejercicios (Funciones PostgreSQL)

GAMILIT implementa un **sistema robusto de validación de respuestas** mediante funciones PostgreSQL especializadas. Cada tipo de ejercicio tiene su validador específico que verifica la corrección de las respuestas del estudiante.

#### 4.1. Ubicación y Estructura

**Ubicación:** `apps/database/ddl/schemas/educational_content/functions/`

**Firma estándar de validadores:**

```sql
CREATE OR REPLACE FUNCTION educational_content.validate_[tipo](
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

Todos los validadores retornan el mismo formato de respuesta:
- `is_correct`: Indica si la respuesta es completamente correcta
- `score`: Puntuación obtenida (0 a p_max_points)
- `feedback`: Mensaje de retroalimentación para el estudiante
- `details`: JSONB con detalles adicionales (conexiones correctas, errores, etc.)

#### 4.2. Validadores Módulo 1: Comprensión Literal

| # | Tipo de Ejercicio | Validador | Archivo | Formato Entrada | Descripción |
|---|-------------------|-----------|---------|-----------------|-------------|
| 1 | crucigrama | `validate_crucigrama()` | 03-validate_crucigrama.sql | `{"clues": {"h1": "sorbona", "v1": "nobel"}}` | Compara respuestas por ID de pista |
| 2 | linea_tiempo | `validate_timeline()` | 04-validate_timeline.sql | `{"events": ["e1", "e2", "e3"]}` | Valida orden cronológico de eventos |
| 3 | sopa_letras | `validate_word_search()` | 05-validate_word_search.sql | `{"words": ["MARIE", "CURIE"]}` | Verifica palabras encontradas |
| 4 | completar_espacios | `validate_fill_in_blank()` | 06-validate_fill_in_blank.sql | `{"blanks": {"b1": "varsovia"}}` | Compara con fuzzy matching (85%) |
| 5 | verdadero_falso | `validate_true_false()` | 07-validate_true_false.sql | `{"statements": {"s1": true, "s2": false}}` | Compara valores booleanos |

#### 4.3. Validadores Módulo 2: Comprensión Inferencial

| # | Tipo de Ejercicio | Validador | Archivo | Formato Entrada | Descripción |
|---|-------------------|-----------|---------|-----------------|-------------|
| 6 | detective_textual | ✨ `validate_detective_connections()` | 20-validate_detective_connections.sql | `{"connections": [{"from": "ev1", "to": "ev2", "relationship": "..."}]}` | **NUEVO:** Valida conexiones entre evidencias con keywords |
| 7 | prediccion_narrativa | ✨ `validate_prediction_scenarios()` | 21-validate_prediction_scenarios.sql | `{"scenarios": {"s1": "pred_a", "s2": "pred_b"}}` | **NUEVO:** Valida predicciones por escenario |
| 8 | construccion_hipotesis | ✨ `validate_cause_effect_matching()` | 22-validate_cause_effect_matching.sql | `{"causes": {"c1": ["cons1", "cons2"]}}` | **NUEVO:** Valida matching causa-efecto drag & drop |
| 9 | puzzle_contexto | `validate_puzzle_contexto()` | 13-validate_puzzle_contexto.sql | `{"questions": {"q1": "opt_a", "q2": "opt_b"}}` | Múltiple choice con inferencias |
| 10 | rueda_inferencias | `validate_rueda_inferencias()` | 14-validate_rueda_inferencias.sql | `{"inferences": {"inf1": "conclusion1"}}` | Matching de inferencias |

✨ **Validadores agregados en DB-117/FE-059 (2025-11-19)** para resolver discrepancias entre frontend y especificaciones originales.

**Nota:** Los validadores antiguos (`validate_detective_textual`, `validate_prediccion_narrativa`, `validate_construccion_hipotesis`) aún existen en el código pero `exercise_validation_config` ahora apunta a los nuevos validadores.

#### 4.4. Validadores Módulo 3: Lectura Crítica (Actualizado v6.3)

| # | Tipo de Ejercicio | Validador | Archivo | Formato Entrada | Descripción |
|---|-------------------|-----------|---------|-----------------|-------------|
| 11 | tribunal_opiniones | `validate_tribunal_opiniones()` | 15-validate_tribunal_opiniones.sql | `{"answers": {"stmt-1": {"type": "hecho", "verdict": "bien-fundamentada", "justification": "..."}}}` | Clasificar afirmaciones (HECHO/OPINIÓN/INTERPRETACIÓN) y asignar veredictos |
| 12 | debate_digital | `validate_debate_digital()` | 16-validate_debate_digital.sql | `{"stance": "a_favor", "arguments": [...], "evidence": [...]}` | Debate sobre impacto de la fama en Marie Curie |
| 13 | analisis_fuentes | `validate_analisis_fuentes()` | 17-validate_analisis_fuentes.sql | `{"sources": {"s1": {"craap_scores": {...}, "classification": "..."}}}` | Evaluación método CRAAP |
| 14 | podcast_argumentativo | `validate_podcast_argumentativo()` | 18-validate_podcast_argumentativo.sql | `{"audio_url": "...", "duration": 180, "transcript": "..."}` | Valida duración, formato y contenido |
| 15 | matriz_perspectivas | `validate_matriz_perspectivas()` | 19-validate_matriz_perspectivas.sql | `{"perspectives": {"persp-1": {...}, "persp-5": {"group": "Marie Curie"}, "persp-6": {"group": "Pierre Curie"}}}` | 6 perspectivas incluyendo Marie y Pierre Curie |

**Nota v6.3:** El ejercicio Tribunal de Opiniones ahora usa formato `statements` con 8 afirmaciones sobre Marie Curie. Cada afirmación debe clasificarse como HECHO, OPINIÓN o INTERPRETACIÓN, y asignar un veredicto (bien-fundamentada, parcialmente-fundamentada, sin-fundamento).

#### 4.5. Configuración de Validadores

Los validadores se configuran en la tabla `educational_content.exercise_validation_config`:

```sql
CREATE TABLE educational_content.exercise_validation_config (
    exercise_type educational_content.exercise_type PRIMARY KEY,
    validation_function VARCHAR(100) NOT NULL,  -- Nombre de la función a llamar
    case_sensitive BOOLEAN DEFAULT false,
    allow_partial_credit BOOLEAN DEFAULT true,
    fuzzy_matching_threshold DECIMAL(3,2),      -- 0.85 = 85% similaridad
    normalize_text BOOLEAN DEFAULT true,
    special_rules JSONB,                        -- Reglas específicas por tipo
    default_max_points INTEGER DEFAULT 100,
    default_passing_score INTEGER DEFAULT 70,
    description TEXT,
    examples JSONB,                             -- Ejemplos de uso
    created_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT gamilit.now_mexico()
);
```

**Ejemplo de configuración:** Detective Textual

```sql
INSERT INTO educational_content.exercise_validation_config (
    exercise_type,
    validation_function,
    allow_partial_credit,
    special_rules,
    description
) VALUES (
    'detective_textual',
    'validate_detective_connections',  -- Función a llamar
    true,                               -- Permite crédito parcial
    '{
        "minCorrectConnections": 2,
        "allowPartialCredit": true,
        "validateKeywords": true
    }'::jsonb,
    'Validación de detective textual: conexión de evidencias en investigación tipo tablero detective'
);
```

#### 4.6. Función Dispatcher: validate_and_audit()

Todos los validadores se invocan a través de `validate_and_audit()` que:

1. **Recupera el ejercicio** y su configuración de validación
2. **Ejecuta el validador específico** según `validation_function` en la config
3. **Crea registro de auditoría** en `exercise_validation_audit`
4. **Retorna resultado** con feedback detallado

**Ubicación:** `apps/database/ddl/schemas/educational_content/functions/20-validate_and_audit.sql`

**Flujo de validación:**

```
Frontend → Backend → validate_and_audit(exercise_id, user_id, answer)
                              ↓
                   exercise_validation_config (obtener validation_function)
                              ↓
                   CASE validation_function
                      WHEN 'validate_detective_connections' → ejecutar validador
                      WHEN 'validate_prediction_scenarios' → ejecutar validador
                      WHEN 'validate_cause_effect_matching' → ejecutar validador
                      ...
                              ↓
                   Retornar (is_correct, score, feedback, details)
```

**Invocación desde Backend:**

```typescript
const result = await db.query(`
  SELECT * FROM educational_content.validate_and_audit(
    $1::UUID,  -- exercise_id
    $2::UUID,  -- user_id
    $3::JSONB  -- submitted_answer
  )
`, [exerciseId, userId, submittedAnswer]);

// result = { is_correct: true, score: 100, feedback: "...", details: {...} }
```

#### 4.7. Seeds de Testing

**Archivo:** `apps/database/seeds/dev/educational_content/10-test-nuevos-validadores-FE-059.sql`

Contiene 3 ejercicios de prueba (order_index 101-103) para validar los nuevos validadores:

1. **Detective Textual (101):** Investigación de descubrimientos de Marie Curie con 4 evidencias
2. **Predicción Narrativa (102):** Decisiones históricas de Marie Curie en 4 escenarios
3. **Causa-Efecto (103):** Impacto de los descubrimientos de Curie con 5 causas y 15 consecuencias

**Referencia:** DB-117, DB-123, FE-059

---

## 🔧 Implementación Backend (NestJS)

### 1. Enum TypeScript

**Ubicación:** `apps/backend/src/educational-content/enums/exercise-mechanic.enum.ts`

```typescript
export enum ExerciseMechanicEnum {
  // Vocabulario
  MULTIPLE_CHOICE = 'multiple_choice',
  FILL_IN_BLANK = 'fill_in_blank',
  MATCHING_PAIRS = 'matching_pairs',
  FLASHCARD = 'flashcard',
  WORD_SEARCH = 'word_search',
  IMAGE_ASSOCIATION = 'image_association',

  // Gramática
  VERB_CONJUGATION = 'verb_conjugation',
  SENTENCE_BUILDER = 'sentence_builder',
  ERROR_DETECTION = 'error_detection',
  SENTENCE_TRANSFORMATION = 'sentence_transformation',
  PRONOUN_SELECTION = 'pronoun_selection',
  POSSESSIVE_FORMS = 'possessive_forms',
  PLURALIZATION = 'pluralization',
  ASPECT_MARKERS = 'aspect_markers',

  // Lectura
  READING_COMPREHENSION = 'reading_comprehension',
  TRUE_OR_FALSE = 'true_or_false',
  INFERENCE = 'inference',
  SEQUENCE_ORDERING = 'sequence_ordering',

  // Escritura
  FREE_WRITING = 'free_writing',
  SENTENCE_COMPLETION = 'sentence_completion',
  TRANSLATION = 'translation',
  DICTATION = 'dictation',

  // Audio
  LISTENING_COMPREHENSION = 'listening_comprehension',
  AUDIO_MATCHING = 'audio_matching',
  TONE_RECOGNITION = 'tone_recognition',

  // Pronunciación
  SPEECH_RECORDING = 'speech_recording',
  PRONUNCIATION_COMPARISON = 'pronunciation_comparison',

  // Cultura
  CULTURAL_CONTEXT = 'cultural_context',
  HISTORICAL_TIMELINE = 'historical_timeline',
  CULTURAL_ARTIFACT = 'cultural_artifact',
  TRADITIONAL_PRACTICE = 'traditional_practice',
}
```

### 2. Entity

**Ubicación:** `apps/backend/src/educational-content/entities/exercise.entity.ts`

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ExerciseMechanicEnum } from '../enums/exercise-mechanic.enum';
import { DifficultyLevelEnum } from '../enums/difficulty-level.enum';

@Entity({ schema: 'educational_content', name: 'exercises' })
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  code?: string;

  @Column({ type: 'varchar', length: 300 })
  title: string;

  @Column({ type: 'enum', enum: ExerciseMechanicEnum })
  mechanic: ExerciseMechanicEnum;

  @Column({ type: 'enum', enum: DifficultyLevelEnum })
  difficulty: DifficultyLevelEnum;

  @Column({ type: 'jsonb' })
  content: Record<string, any>;

  @Column({ type: 'jsonb', name: 'answer_key', select: false }) // NUNCA select por defecto
  answerKey: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  hints?: string[];

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'image_url' })
  imageUrl?: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'audio_url' })
  audioUrl?: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'video_url' })
  videoUrl?: string;

  @Column({ type: 'integer', default: 60, name: 'estimated_time_seconds' })
  estimatedTimeSeconds: number;

  @Column({ type: 'integer', default: 15, name: 'xp_reward' })
  xpReward: number;

  @Column({ type: 'integer', default: 5, name: 'ml_coins_reward' })
  mlCoinsReward: number;

  @Column({ type: 'uuid', nullable: true, name: 'module_id' })
  moduleId?: string;

  @Column({ type: 'uuid', nullable: true, name: 'lesson_id' })
  lessonId?: string;

  @Column({ type: 'boolean', default: false, name: 'is_exam' })
  isExam: boolean;

  @Column({ type: 'varchar', length: 20, default: 'draft' })
  status: 'draft' | 'review' | 'published' | 'archived';

  @Column({ type: 'timestamptz', nullable: true, name: 'published_at' })
  publishedAt?: Date;

  @Column({ type: 'timestamptz', default: () => 'NOW()', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'timestamptz', default: () => 'NOW()', name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true, name: 'created_by' })
  createdBy?: string;
}
```

### 3. Validators (Factory Pattern)

**Ubicación:** `apps/backend/src/educational-content/validators/exercise-validators.ts`

```typescript
import { ExerciseMechanicEnum } from '../enums/exercise-mechanic.enum';

export interface IExerciseValidator {
  validate(userAnswer: any, answerKey: any): ValidationResult;
}

export interface ValidationResult {
  correct: boolean;
  feedback?: string;
  score?: number; // 0-100
}

// Base Validator
abstract class BaseExerciseValidator implements IExerciseValidator {
  abstract validate(userAnswer: any, answerKey: any): ValidationResult;
}

// Multiple Choice Validator
export class MultipleChoiceValidator extends BaseExerciseValidator {
  validate(userAnswer: any, answerKey: any): ValidationResult {
    const { selected } = userAnswer;
    const { correct_answer } = answerKey;

    const isCorrect = selected === correct_answer;

    return {
      correct: isCorrect,
      feedback: isCorrect
        ? '¡Correcto!'
        : `Incorrecto. La respuesta correcta es: ${correct_answer}`,
      score: isCorrect ? 100 : 0,
    };
  }
}

// Fill in Blank Validator
export class FillInBlankValidator extends BaseExerciseValidator {
  validate(userAnswer: any, answerKey: any): ValidationResult {
    const { answer } = userAnswer;
    const { correct_answer, accept_variations = [] } = answerKey;

    // Normalizar respuesta (lowercase, trim, sin acentos opcionales)
    const normalized = this.normalize(answer);

    const acceptableAnswers = [correct_answer, ...accept_variations].map(a =>
      this.normalize(a)
    );

    const isCorrect = acceptableAnswers.includes(normalized);

    return {
      correct: isCorrect,
      feedback: isCorrect ? '¡Correcto!' : `Incorrecto. Se esperaba: ${correct_answer}`,
      score: isCorrect ? 100 : 0,
    };
  }

  private normalize(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remover acentos
  }
}

// Matching Pairs Validator
export class MatchingPairsValidator extends BaseExerciseValidator {
  validate(userAnswer: any, answerKey: any): ValidationResult {
    const { pairs: userPairs } = userAnswer; // [{ maya_id: 1, spanish_id: 1 }, ...]
    const { pairs: correctPairs } = answerKey;

    let correctCount = 0;
    let totalPairs = correctPairs.length;

    for (const correctPair of correctPairs) {
      const userPair = userPairs.find(
        (up: any) => up.maya_id === correctPair.id || up.id === correctPair.id
      );

      if (userPair && userPair.spanish_id === correctPair.id) {
        correctCount++;
      }
    }

    const score = Math.round((correctCount / totalPairs) * 100);
    const isCorrect = score === 100;

    return {
      correct: isCorrect,
      feedback: isCorrect
        ? '¡Todos los pares correctos!'
        : `${correctCount}/${totalPairs} pares correctos`,
      score,
    };
  }
}

// Verb Conjugation Validator
export class VerbConjugationValidator extends BaseExerciseValidator {
  validate(userAnswer: any, answerKey: any): ValidationResult {
    const { conjugation } = userAnswer;
    const { correct_answer, accept_variations = [] } = answerKey;

    const normalized = this.normalize(conjugation);
    const acceptableAnswers = [correct_answer, ...accept_variations].map(a =>
      this.normalize(a)
    );

    const isCorrect = acceptableAnswers.includes(normalized);

    return {
      correct: isCorrect,
      feedback: isCorrect
        ? '¡Conjugación correcta!'
        : `Incorrecto. La conjugación correcta es: ${correct_answer}`,
      score: isCorrect ? 100 : 0,
    };
  }

  private normalize(text: string): string {
    return text.toLowerCase().trim();
  }
}

// ... Implementar validators para las otras 27 mecánicas ...

// Factory
export class ExerciseValidatorFactory {
  static create(mechanic: ExerciseMechanicEnum): IExerciseValidator {
    switch (mechanic) {
      case ExerciseMechanicEnum.MULTIPLE_CHOICE:
        return new MultipleChoiceValidator();

      case ExerciseMechanicEnum.FILL_IN_BLANK:
        return new FillInBlankValidator();

      case ExerciseMechanicEnum.MATCHING_PAIRS:
        return new MatchingPairsValidator();

      case ExerciseMechanicEnum.VERB_CONJUGATION:
        return new VerbConjugationValidator();

      // ... Agregar casos para las otras 27 mecánicas ...

      default:
        throw new Error(`Validator not implemented for mechanic: ${mechanic}`);
    }
  }
}
```

### 4. ExerciseService

**Ubicación:** `apps/backend/src/educational-content/services/exercise.service.ts`

```typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise } from '../entities/exercise.entity';
import { ExerciseValidatorFactory } from '../validators/exercise-validators';

@Injectable()
export class ExerciseService {
  constructor(
    @InjectRepository(Exercise)
    private exerciseRepo: Repository<Exercise>,
  ) {}

  /**
   * Obtener ejercicio (SIN answer_key)
   */
  async getExercise(exerciseId: string, userId: string): Promise<Partial<Exercise>> {
    const exercise = await this.exerciseRepo.findOne({
      where: { id: exerciseId, status: 'published' },
      select: [
        'id',
        'code',
        'title',
        'mechanic',
        'difficulty',
        'content',
        'hints',
        'imageUrl',
        'audioUrl',
        'videoUrl',
        'estimatedTimeSeconds',
        'isExam',
        // ❌ NO incluir answerKey
      ],
    });

    if (!exercise) {
      throw new NotFoundException('Exercise not found or not published');
    }

    // Verificar si usuario tiene acceso (por rango, etc.)
    await this.checkAccess(userId, exercise);

    return exercise;
  }

  /**
   * Validar respuesta del usuario
   */
  async submitAnswer(
    userId: string,
    exerciseId: string,
    attemptId: string,
    userAnswer: any
  ): Promise<{
    correct: boolean;
    feedback: string;
    score: number;
    xp_earned: number;
    ml_coins_earned: number;
  }> {
    // 1. Obtener ejercicio CON answer_key (query separado)
    const exercise = await this.exerciseRepo
      .createQueryBuilder('e')
      .addSelect('e.answer_key') // Forzar select de answer_key
      .where('e.id = :id', { id: exerciseId })
      .getOne();

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    // 2. Obtener validator según mecánica
    const validator = ExerciseValidatorFactory.create(exercise.mechanic);

    // 3. Validar respuesta
    const validationResult = validator.validate(userAnswer, exercise.answerKey);

    // 4. Calcular XP y ML Coins
    let xpEarned = 0;
    let mlCoinsEarned = 0;

    if (validationResult.correct) {
      // XP base según dificultad
      xpEarned = exercise.xpReward;
      mlCoinsEarned = exercise.mlCoinsReward;

      // Aplicar multiplicador de rango del usuario
      const userRank = await this.getUserRank(userId);
      xpEarned = Math.round(xpEarned * this.getRankMultiplier(userRank));
    }

    // 5. Registrar intento en progress_tracking.exercise_attempts
    await this.recordAttempt(userId, exerciseId, attemptId, validationResult.correct, validationResult.score);

    // 6. Si correcto, actualizar user_stats
    if (validationResult.correct) {
      await this.updateUserStats(userId, xpEarned, mlCoinsEarned);
    }

    // 7. Emitir evento para achievements
    if (validationResult.correct) {
      // eventEmitter.emit('exercise.completed', { userId, exerciseId, xpEarned });
    }

    return {
      correct: validationResult.correct,
      feedback: validationResult.feedback || '',
      score: validationResult.score || 0,
      xp_earned: xpEarned,
      ml_coins_earned: mlCoinsEarned,
    };
  }

  /**
   * Obtener hint (deduce del inventario si es necesario)
   */
  async getHint(userId: string, exerciseId: string, hintNumber: number): Promise<string> {
    const exercise = await this.exerciseRepo.findOne({
      where: { id: exerciseId },
      select: ['id', 'hints', 'isExam'],
    });

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    if (exercise.isExam) {
      throw new ForbiddenException('Hints not allowed in exams');
    }

    if (!exercise.hints || exercise.hints.length < hintNumber) {
      throw new NotFoundException(`Hint ${hintNumber} not available`);
    }

    // Verificar límite de 3 pistas por ejercicio (delegado a ComodinService)
    // ...

    return exercise.hints[hintNumber - 1];
  }

  // Métodos auxiliares
  private async checkAccess(userId: string, exercise: Exercise): Promise<void> {
    // Verificar rango requerido, etc.
  }

  private async getUserRank(userId: string): Promise<string> {
    // Query a user_stats
    return 'Ajaw'; // Placeholder
  }

  private getRankMultiplier(rank: string): number {
    const multipliers = {
      Ajaw: 1.0,
      Nacom: 1.05,
      'Ah K\'in': 1.10,
      'Halach Uinic': 1.15,
      'K\'uk\'ulkan': 1.20,
    };
    return multipliers[rank] || 1.0;
  }

  private async recordAttempt(
    userId: string,
    exerciseId: string,
    attemptId: string,
    correct: boolean,
    score: number
  ): Promise<void> {
    // INSERT en progress_tracking.exercise_attempts
  }

  private async updateUserStats(userId: string, xp: number, coins: number): Promise<void> {
    // UPDATE gamification_system.user_stats
  }
}
```

### 5. Controller

**Ubicación:** `apps/backend/src/educational-content/controllers/exercise.controller.ts`

```typescript
import { Controller, Get, Post, Param, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { ExerciseService } from '../services/exercise.service';

@Controller('exercises')
@UseGuards(JwtAuthGuard)
export class ExerciseController {
  constructor(private exerciseService: ExerciseService) {}

  /**
   * GET /exercises/:id
   * Obtener ejercicio (sin answer_key)
   */
  @Get(':id')
  async getExercise(@Req() req, @Param('id') id: string) {
    return await this.exerciseService.getExercise(id, req.user.id);
  }

  /**
   * POST /exercises/:id/submit
   * Enviar respuesta y validar
   */
  @Post(':id/submit')
  async submitAnswer(
    @Req() req,
    @Param('id') id: string,
    @Body() body: { attemptId: string; answer: any }
  ) {
    return await this.exerciseService.submitAnswer(req.user.id, id, body.attemptId, body.answer);
  }

  /**
   * GET /exercises/:id/hints/:number
   * Obtener pista específica
   */
  @Get(':id/hints/:number')
  async getHint(@Req() req, @Param('id') id: string, @Param('number') number: string) {
    return await this.exerciseService.getHint(req.user.id, id, parseInt(number));
  }
}
```

---

## 🎨 Implementación Frontend (React)

### 1. ExerciseRenderer (Component Dinámico)

**Ubicación:** `apps/frontend/src/components/exercises/ExerciseRenderer.tsx`

```typescript
import React from 'react';
import { Exercise } from '../../types/exercise.types';
import { ExerciseMechanicEnum } from '../../enums/exercise-mechanic.enum';

// Importar componentes específicos
import { MultipleChoiceExercise } from './mechanics/MultipleChoiceExercise';
import { FillInBlankExercise } from './mechanics/FillInBlankExercise';
import { MatchingPairsExercise } from './mechanics/MatchingPairsExercise';
// ... importar los otros 28 componentes

interface ExerciseRendererProps {
  exercise: Exercise;
  onSubmit: (answer: any) => void;
}

export const ExerciseRenderer: React.FC<ExerciseRendererProps> = ({ exercise, onSubmit }) => {
  // Factory pattern para renderizar componente correcto
  const renderExercise = () => {
    switch (exercise.mechanic) {
      case ExerciseMechanicEnum.MULTIPLE_CHOICE:
        return <MultipleChoiceExercise exercise={exercise} onSubmit={onSubmit} />;

      case ExerciseMechanicEnum.FILL_IN_BLANK:
        return <FillInBlankExercise exercise={exercise} onSubmit={onSubmit} />;

      case ExerciseMechanicEnum.MATCHING_PAIRS:
        return <MatchingPairsExercise exercise={exercise} onSubmit={onSubmit} />;

      // ... otros 28 casos

      default:
        return <div>Mechanic not implemented: {exercise.mechanic}</div>;
    }
  };

  return (
    <div className="exercise-container">
      <div className="exercise-header">
        <h2>{exercise.title}</h2>
        <span className="difficulty-badge">{exercise.difficulty}</span>
      </div>

      <div className="exercise-content">{renderExercise()}</div>
    </div>
  );
};
```

### 2. Component: MultipleChoiceExercise

**Ubicación:** `apps/frontend/src/components/exercises/mechanics/MultipleChoiceExercise.tsx`

```typescript
import React, { useState } from 'react';
import { Exercise } from '../../../types/exercise.types';

interface MultipleChoiceExerciseProps {
  exercise: Exercise;
  onSubmit: (answer: any) => void;
}

export const MultipleChoiceExercise: React.FC<MultipleChoiceExerciseProps> = ({ exercise, onSubmit }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleSubmit = () => {
    if (selectedOption) {
      onSubmit({ selected: selectedOption });
    }
  };

  const { question, options } = exercise.content;

  return (
    <div className="multiple-choice-exercise">
      <p className="question text-lg font-semibold mb-4">{question}</p>

      <div className="options space-y-3">
        {options.map((option: any) => (
          <button
            key={option.id}
            onClick={() => setSelectedOption(option.id)}
            className={`option-button w-full p-4 text-left rounded-lg border-2 transition-all ${
              selectedOption === option.id ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <span className="font-bold mr-2">{option.id.toUpperCase()})</span>
            {option.text}
          </button>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selectedOption}
        className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        Verificar Respuesta
      </button>
    </div>
  );
};
```

---

## 🧪 Testing

### Test Case 1: Validar Multiple Choice

```typescript
test('Multiple choice validator validates correct answer', () => {
  const validator = new MultipleChoiceValidator();

  const userAnswer = { selected: 'a' };
  const answerKey = { correct_answer: 'a' };

  const result = validator.validate(userAnswer, answerKey);

  expect(result.correct).toBe(true);
  expect(result.score).toBe(100);
});
```

### Test Case 2: Fill in Blank con Variaciones

```typescript
test('Fill in blank accepts variations', () => {
  const validator = new FillInBlankValidator();

  const answerKey = {
    correct_answer: 'paal',
    accept_variations: ['paal', 'páal'],
  };

  // Con acento
  const result1 = validator.validate({ answer: 'páal' }, answerKey);
  expect(result1.correct).toBe(true);

  // Sin acento
  const result2 = validator.validate({ answer: 'paal' }, answerKey);
  expect(result2.correct).toBe(true);
});
```

---

## 📊 Performance

### Índices Críticos

```sql
CREATE INDEX idx_exercises_mechanic ON educational_content.exercises(mechanic);
CREATE INDEX idx_exercises_content ON educational_content.exercises USING GIN(content);
```

### Caching

```typescript
// Redis cache para ejercicios publicados
async getExercise(exerciseId: string): Promise<Exercise> {
  const cacheKey = `exercise:${exerciseId}`;
  const cached = await this.redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const exercise = await this.exerciseRepo.findOne(exerciseId);

  await this.redis.set(cacheKey, JSON.stringify(exercise), 'EX', 3600); // 1 hora

  return exercise;
}
```

---

## 📅 Historial de Cambios

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2025-11-07 | Database Team | Creación del documento |
| 2.0 | 2025-11-11 | Database Team | **Reconciliación:** Actualizado de exercise_mechanic a exercise_type. Sistema dual implementado con tabla de mapeo pedagógico. Sincronizado con DDL real. 13 GAPs pedagógicos identificados. |
| 2.1 | 2025-11-21 | Database Team | **Alineación v6.3:** Actualización validadores Módulo 3. tribunal_opiniones: formato statements. debate_digital: tema fama Marie Curie. matriz_perspectivas: perspectivas Marie y Pierre Curie. Ref: DB-127 |

---

**Nota v2.0:** Este documento fue actualizado para reflejar la implementación real del sistema (DB-110, DB-111, DB-112). Se mantiene la clasificación pedagógica mediante tabla de mapeo `exercise_mechanic_mapping`, reconciliando el valor pedagógico original con las 27 implementaciones específicas GAMILIT existentes. La decisión arquitectónica está documentada en ADR-008.

---

**Documento:** `docs/01-fase-alcance-inicial/EAI-002-actividades/especificaciones/ET-EDU-001-mecanicas-ejercicios.md`
**Propósito:** Especificación técnica completa de implementación de las 27 mecánicas GAMILIT + sistema de mapeo pedagógico
**Audiencia:** Backend Developers, Frontend Developers, QA Team
