# ADR-032: Evaluacion de Consolidacion exercise_attempts vs exercise_submissions

**Estado:** PROPUESTO
**Fecha:** 2026-02-03
**Autor:** Claude Opus 4.5
**Tarea:** TASK-2026-02-03-PLAN-MAESTRO-BD-REQUERIMIENTOS

---

## Contexto

Se reporto un 99% de solapamiento entre las tablas:
- `progress_tracking.exercise_attempts`
- `progress_tracking.exercise_submissions`

Este ADR analiza si la consolidacion es viable o si las tablas tienen propositos intencionalmente separados.

---

## Analisis Detallado

### Estructura de exercise_attempts

```sql
CREATE TABLE progress_tracking.exercise_attempts (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL,              -- FK profiles
    exercise_id uuid NOT NULL,          -- FK exercises
    attempt_number integer DEFAULT 1,
    submitted_answers jsonb NOT NULL,
    is_correct boolean,
    score integer,
    time_spent_seconds integer,
    hints_used integer DEFAULT 0,
    comodines_used jsonb DEFAULT '[]',
    xp_earned integer DEFAULT 0,
    ml_coins_earned integer DEFAULT 0,
    submitted_at timestamptz,
    metadata jsonb
);
```

**Proposito:** Registro raw de intentos de ejercicios. Enfocado en la RESPUESTA.

### Estructura de exercise_submissions

```sql
CREATE TABLE progress_tracking.exercise_submissions (
    id uuid PRIMARY KEY,
    user_id uuid NOT NULL,              -- FK profiles
    exercise_id uuid NOT NULL,          -- FK exercises
    answer_data jsonb NOT NULL,
    is_correct boolean,
    score integer DEFAULT 0,
    max_score integer DEFAULT 100,
    feedback text,
    hint_used boolean DEFAULT false,
    hints_count integer DEFAULT 0,
    comodines_used text[],              -- DIFERENTE: array vs jsonb
    ml_coins_spent integer DEFAULT 0,
    time_spent_seconds integer,
    attempt_number integer DEFAULT 1,
    status text DEFAULT 'submitted',    -- UNICO: draft/submitted/graded/reviewed/pending_review
    started_at timestamptz,
    submitted_at timestamptz,
    graded_at timestamptz,              -- UNICO
    created_at timestamptz,
    updated_at timestamptz,
    xp_earned integer DEFAULT 0,
    ml_coins_earned integer DEFAULT 0,
    rewards_claimed boolean DEFAULT false  -- UNICO
);
```

**Proposito:** Submission formal con flujo de revision. Enfocado en el PROCESO.

---

## Comparativa de Campos

### Campos Comunes (Solapados)

| Campo | attempts | submissions | Diferencia |
|-------|----------|-------------|------------|
| `id` | uuid | uuid | Igual |
| `user_id` | uuid FK | uuid FK | Igual |
| `exercise_id` | uuid FK | uuid FK | Igual |
| `answer` | submitted_answers (jsonb) | answer_data (jsonb) | Solo nombre |
| `is_correct` | boolean | boolean | Igual |
| `score` | integer | integer | submissions tiene max_score |
| `time_spent_seconds` | integer | integer | Igual |
| `hints_used` | integer | hints_count (integer) | Solo nombre |
| `comodines_used` | jsonb | text[] | **DIFERENTE TIPO** |
| `xp_earned` | integer | integer | Igual |
| `ml_coins_earned` | integer | integer | Igual |
| `attempt_number` | integer | integer | Igual |
| `submitted_at` | timestamptz | timestamptz | Igual |
| `metadata` | jsonb | NO | Solo en attempts |

**Solapamiento de campos: 13/15 comunes = 87%**

### Campos Unicos de exercise_submissions

| Campo | Tipo | Proposito | Criticidad |
|-------|------|-----------|------------|
| `status` | text | Flujo de revision (draft/submitted/graded/reviewed/pending_review) | **CRITICA** |
| `graded_at` | timestamptz | Fecha de calificacion | ALTA |
| `rewards_claimed` | boolean | Previene doble distribucion de recompensas | **CRITICA** |
| `feedback` | text | Retroalimentacion del docente | MEDIA |
| `max_score` | integer | Puntaje maximo posible | BAJA |
| `hint_used` | boolean | Flag simple (redundante con hints_count) | BAJA |
| `ml_coins_spent` | integer | ML Coins gastados (no ganados) | MEDIA |
| `started_at` | timestamptz | Inicio del ejercicio | MEDIA |
| `created_at` | timestamptz | Creacion del registro | BAJA |
| `updated_at` | timestamptz | Ultima actualizacion | BAJA |

---

## Diferencias Clave Identificadas

### 1. Campo `status` (CRITICO)

`exercise_submissions` tiene un flujo de estados:
```
draft → submitted → graded → reviewed
                 ↘ pending_review ↗
```

`exercise_attempts` NO tiene estado - es un registro inmutable del intento.

### 2. Campo `rewards_claimed` (CRITICO)

```sql
-- submissions
rewards_claimed boolean DEFAULT false
COMMENT: 'Indicates if rewards (XP/ML Coins) have already been claimed
         to prevent duplicate distribution'
```

Este campo es CRITICO para evitar exploits de doble-claim. NO existe en attempts.

### 3. Campo `graded_at` (ALTA)

Permite distinguir entre:
- Ejercicios auto-calificados (graded_at = submitted_at)
- Ejercicios calificados por docente (graded_at > submitted_at)

### 4. Tipo de `comodines_used` (INCOMPATIBLE)

```sql
-- attempts
comodines_used jsonb DEFAULT '[]'::jsonb
-- Formato: [{"type": "pistas", "count": 2}, {"type": "vision_lectora"}]

-- submissions
comodines_used text[]
-- Formato: {'pistas', 'vision_lectora'}
```

**Incompatibilidad de tipos requiere migracion de datos.**

---

## Hipotesis del Solapamiento

### Escenario 1: Evolucion Organica (MAS PROBABLE)

1. Inicialmente se creo `exercise_attempts` para tracking simple
2. Luego se necesito flujo de revision → se creo `exercise_submissions`
3. Se copiaron campos comunes pero se agregaron los especificos
4. Ambas tablas quedaron activas sin plan de consolidacion

**Evidencia:**
- `exercise_attempts` creado por pg_dump (version antigua)
- `exercise_submissions` tiene estructura mas elaborada
- Backend probablemente usa ambas en diferentes contextos

### Escenario 2: Propositos Intencionalmente Diferentes (POSIBLE)

- `exercise_attempts`: Raw data de TODOS los intentos (para analytics)
- `exercise_submissions`: Submissions formales con flujo de trabajo

**Evidencia:**
- Nombres sugieren conceptos diferentes (attempt vs submission)
- submissions tiene estado y timestamps de workflow

---

## Opciones de Consolidacion

### Opcion A: NO Consolidar (Mantener Separadas)

**Justificacion:**
- Propositos semanticamente diferentes
- `status`, `graded_at`, `rewards_claimed` son criticos
- Riesgo de romper logica existente

**Pros:**
- Zero riesgo de regresion
- Respeta posible intencion original

**Contras:**
- Duplicacion de datos
- Complejidad de mantenimiento
- Confusion para desarrolladores

### Opcion B: Consolidar en exercise_submissions

**Estrategia:**
1. Agregar campos faltantes de attempts a submissions
2. Migrar datos de attempts a submissions
3. Crear vista de compatibilidad `exercise_attempts`
4. Deprecar tabla attempts

**Pros:**
- Single source of truth
- submissions tiene estructura mas completa

**Contras:**
- Migracion compleja por tipo de comodines_used
- Riesgo de perder datos de attempts no migrados

### Opcion C: Crear Tabla Unificada Nueva (RECOMENDADA)

**Estrategia:**
1. Crear `exercise_activity` con todos los campos
2. Migrar datos de ambas tablas
3. Crear vistas de compatibilidad
4. Deprecar tablas originales

**Estructura Propuesta:**

```sql
CREATE TABLE progress_tracking.exercise_activity (
    -- Identificadores
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth_management.profiles(id),
    exercise_id uuid NOT NULL REFERENCES educational_content.exercises(id),

    -- Datos de respuesta
    answer_data jsonb NOT NULL,          -- Unificado
    is_correct boolean,
    score integer DEFAULT 0,
    max_score integer DEFAULT 100,

    -- Intento
    attempt_number integer DEFAULT 1,
    time_spent_seconds integer,

    -- Comodines (unificado como JSONB)
    hints_used integer DEFAULT 0,
    comodines_used jsonb DEFAULT '[]',

    -- Recompensas
    xp_earned integer DEFAULT 0,
    ml_coins_earned integer DEFAULT 0,
    ml_coins_spent integer DEFAULT 0,
    rewards_claimed boolean DEFAULT false,

    -- Flujo de trabajo (de submissions)
    status text DEFAULT 'submitted',
    feedback text,

    -- Timestamps
    started_at timestamptz,
    submitted_at timestamptz DEFAULT now(),
    graded_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),

    -- Metadata
    metadata jsonb DEFAULT '{}',

    -- Constraints
    CONSTRAINT exercise_activity_status_check CHECK (
        status IN ('draft', 'submitted', 'graded', 'reviewed', 'pending_review')
    ),
    CONSTRAINT exercise_activity_score_check CHECK (
        score >= 0 AND score <= max_score
    )
);
```

---

## Decision

### Recomendacion: OPCION A - NO CONSOLIDAR (Por Ahora)

**Razon Principal:**
Los campos `status`, `graded_at` y `rewards_claimed` indican que `exercise_submissions` tiene un proposito funcional diferente (workflow de revision) que `exercise_attempts` (tracking raw).

**Condiciones para Reconsiderar:**
1. Si se confirma que backend NO usa ambas tablas simultameamente
2. Si se puede garantizar migracion de `rewards_claimed` sin perdida
3. Si hay recursos para testing exhaustivo post-migracion

### Acciones Alternativas Recomendadas

1. **Documentar propositos claramente** en DDL
2. **Agregar comentarios** explicando diferencia semantica
3. **Crear view unificada** para reporting (sin modificar tablas)
4. **Analizar uso en backend** antes de decidir consolidacion

---

## Vista de Reporting Propuesta (Sin Consolidacion)

```sql
-- Vista unificada para analytics (no reemplaza tablas)
CREATE OR REPLACE VIEW progress_tracking.v_exercise_activity_unified AS
SELECT
    'attempt' as source_table,
    ea.id,
    ea.user_id,
    ea.exercise_id,
    ea.attempt_number,
    ea.submitted_answers as answer_data,
    ea.is_correct,
    ea.score,
    100 as max_score,
    ea.hints_used,
    ea.comodines_used::text as comodines_used_text,
    ea.xp_earned,
    ea.ml_coins_earned,
    0 as ml_coins_spent,
    NULL::text as status,
    NULL::timestamptz as graded_at,
    false as rewards_claimed,
    ea.submitted_at,
    ea.submitted_at as created_at,
    ea.metadata
FROM progress_tracking.exercise_attempts ea

UNION ALL

SELECT
    'submission' as source_table,
    es.id,
    es.user_id,
    es.exercise_id,
    es.attempt_number,
    es.answer_data,
    es.is_correct,
    es.score,
    es.max_score,
    es.hints_count as hints_used,
    array_to_string(es.comodines_used, ',') as comodines_used_text,
    es.xp_earned,
    es.ml_coins_earned,
    es.ml_coins_spent,
    es.status,
    es.graded_at,
    es.rewards_claimed,
    es.submitted_at,
    es.created_at,
    '{}'::jsonb as metadata
FROM progress_tracking.exercise_submissions es;

COMMENT ON VIEW progress_tracking.v_exercise_activity_unified IS
    'Vista unificada de attempts y submissions para analytics.
     NO reemplaza las tablas originales que tienen propositos diferentes:
     - exercise_attempts: Raw tracking de intentos
     - exercise_submissions: Workflow formal con estados y calificacion';
```

---

## Consecuencias

### Si NO se consolida:

- Mantener ambas tablas actualizadas
- Documentar claramente cuando usar cada una
- Posible confusion para nuevos desarrolladores

### Si se consolida (futuro):

- Migracion compleja requerida
- Testing exhaustivo necesario
- Vistas de compatibilidad obligatorias
- Riesgo de bugs en logica de recompensas

---

## Referencias

- `progress_tracking/tables/03-exercise_attempts.sql`
- `progress_tracking/tables/04-exercise_submissions.sql`
- Backend services que usan estas tablas (pendiente de analisis)

---

## Historial de Decisiones

| Fecha | Decision | Autor |
|-------|----------|-------|
| 2026-02-03 | Analisis inicial - Recomendar NO consolidar | Claude Opus 4.5 |

---

*ADR generado por Claude Opus 4.5 - 2026-02-03*
